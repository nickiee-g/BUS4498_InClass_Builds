// Reads new GroupMe messages and sends each message to submit-event once.
// Secrets stay in Supabase Edge Functions → Secrets.

import { createClient } from "npm:@supabase/supabase-js@2.117.2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

type GroupMeMessage = {
  id: string;
  text?: string | null;
  sender_id?: string;
  name?: string;
  sender_type?: string;
  bot_id?: string;
  system?: boolean;
  system_message?: boolean;
  created_at?: number;
};

function json(status: number, data: Record<string, unknown>) {
  return new Response(JSON.stringify(data), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}

function credentials() {
  return {
    token: Deno.env.get("GROUPME_TOKEN") ?? "",
    groupId: Deno.env.get("GROUPME_GROUP_ID") ?? "",
    botId: Deno.env.get("GROUPME_BOT_ID") ?? "",
  };
}

function serverKey(): string {
  const keys = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (keys) {
    try {
      const key = JSON.parse(keys).default;
      if (key) return key;
    } catch (_) { /* use the compatibility key below */ }
  }
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
}

function publishableKey(): string {
  const keys = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");
  if (keys) {
    try {
      const key = JSON.parse(keys).default;
      if (key) return key;
    } catch (_) { /* use the compatibility key below */ }
  }
  return Deno.env.get("SUPABASE_ANON_KEY") ?? "";
}

function dbClient() {
  return createClient(Deno.env.get("SUPABASE_URL")!, serverKey(), { auth: { persistSession: false } });
}

async function groupMe(path: string, init: RequestInit = {}) {
  const { token } = credentials();
  return await fetch(`https://api.groupme.com/v3${path}`, {
    ...init,
    headers: { "X-Access-Token": token, "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
}

async function checkGroup() {
  const { token, groupId } = credentials();
  if (!token || !groupId) return { ok: false, message: "GROUPME_TOKEN or GROUPME_GROUP_ID is missing in Supabase Secrets." };
  const response = await groupMe(`/groups/${encodeURIComponent(groupId)}`);
  const data = await response.json();
  if (!response.ok) {
    const details = Array.isArray(data.meta?.errors) ? data.meta.errors.map(String).join("; ").slice(0, 240) : "";
    return {
      ok: false,
      message: `GroupMe could not access the group (HTTP ${response.status}).`,
      ...(details ? { details } : {}),
    };
  }
  return { ok: true, message: "The GroupMe token and group work.", group: data.response?.name ?? "" };
}

async function readGroupMessages(afterId: string) {
  const { groupId } = credentials();
  const query = new URLSearchParams({ limit: "20" });
  if (afterId) query.set("after_id", afterId);
  const response = await groupMe(`/groups/${encodeURIComponent(groupId)}/messages?${query}`);
  if (response.status === 304) return [];
  if (!response.ok) throw new Error(`GroupMe messages request returned HTTP ${response.status}.`);
  const data = await response.json();
  return (data.response?.messages ?? []) as GroupMeMessage[];
}

async function senderThread(message: GroupMeMessage): Promise<string[]> {
  if (!message.created_at || !message.sender_id) return [];
  const query = new URLSearchParams({ before_id: message.id, limit: "20" });
  const response = await groupMe(`/groups/${encodeURIComponent(credentials().groupId)}/messages?${query}`);
  if (!response.ok) return [];
  const data = await response.json();
  const cutoff = message.created_at - 600;
  return ((data.response?.messages ?? []) as GroupMeMessage[])
    .filter((m) => m.sender_id === message.sender_id && Boolean(m.text?.trim()) && (m.created_at ?? 0) >= cutoff)
    .sort((a, b) => (a.created_at ?? 0) - (b.created_at ?? 0))
    .slice(-4)
    .map((m) => `${m.name || "Member"}: ${m.text!.slice(0, 500)}`);
}

async function saveCursor(source: string, lastId: string, increment: number) {
  const db = dbClient();
  const { data: old } = await db.from("channel_cursor").select("read_count").eq("source", source).maybeSingle();
  const { error } = await db.from("channel_cursor").upsert({
    source,
    last_id: lastId,
    read_count: (old?.read_count ?? 0) + increment,
    updated_at: new Date().toISOString(),
  }, { onConflict: "source" });
  if (error) throw new Error(`Cursor save failed: ${error.message}`);
}

async function readStatus() {
  const { data, error } = await dbClient().from("channel_cursor")
    .select("last_id, read_count, updated_at").eq("source", "groupme").maybeSingle();
  if (error) throw new Error(`Cursor lookup failed: ${error.message}`);
  return data;
}

async function processMessage(message: GroupMeMessage) {
  if (!message.text?.trim() || message.sender_type === "bot" || message.bot_id || message.system || message.system_message) return;
  const thread = await senderThread(message);
  const base = Deno.env.get("SUPABASE_URL")!;
  const result = await fetch(`${base}/functions/v1/submit-event`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: publishableKey() },
    body: JSON.stringify({
      announcement: message.text,
      source: "groupme",
      source_id: message.id,
      source_name: message.name ?? "",
      thread,
    }),
  });
  const decision = await result.json();
  if (decision.already_read) return;
  const { botId } = credentials();
  if (!botId) return;
  const text = decision.ok
    ? `${decision.status === "published" ? "Posted" : decision.status === "waiting" ? "Waiting for a moderator" : decision.status === "duplicate" ? "Already posted" : "Not posted"}: ${decision.event?.title || decision.message || "The agent reviewed this post."}`
    : `The event agent couldn't read this post: ${decision.message || "please try again later."}`;
  const posted = await groupMe("/bots/post", { method: "POST", body: JSON.stringify({ bot_id: botId, text: text.slice(0, 1000) }) });
  if (!posted.ok) console.error("GroupMe bot reply failed", posted.status);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    if (req.method === "GET") {
      if (new URL(req.url).searchParams.get("check") === "groupme") return json(200, await checkGroup());
      const { token, groupId } = credentials();
      const cursor = await readStatus();
      return json(200, {
        ok: true,
        ready: Boolean(token && groupId),
        last_message_id: cursor?.last_id ?? "",
        read_count: cursor?.read_count ?? 0,
        bot: Boolean(credentials().botId),
      });
    }
    if (req.method !== "POST") return json(405, { ok: false, message: "Send a POST request." });

    const { token, groupId } = credentials();
    if (!token || !groupId) return json(503, { ok: false, message: "Add GROUPME_TOKEN and GROUPME_GROUP_ID in Supabase Secrets." });

    const cursor = await readStatus();
    const messages = await readGroupMessages(cursor?.last_id ?? "");
    if (!cursor) {
      const newest = messages.reduce((latest, m) => !latest || (m.created_at ?? 0) > (latest.created_at ?? 0) ? m : latest, null as GroupMeMessage | null)?.id ?? "";
      if (newest) await saveCursor("groupme", newest, 0);
      return json(200, { ok: true, initialized: true, last_message_id: newest, read_count: 0, messages: 0 });
    }
    if (!messages.length) return json(200, { ok: true, last_message_id: cursor.last_id, read_count: cursor.read_count, messages: 0 });

    // The API returns newest first; handle the batch in chronological order.
    const ordered = [...messages].sort((a, b) => (a.created_at ?? 0) - (b.created_at ?? 0));
    for (const message of ordered) {
      try { await processMessage(message); }
      catch (error) { console.error(`Message ${message.id} failed`, error); }
    }
    const lastId = ordered.at(-1)?.id ?? cursor.last_id ?? "";
    await saveCursor("groupme", lastId, ordered.length);
    return json(200, { ok: true, last_message_id: lastId, read_count: cursor.read_count + ordered.length, messages: ordered.length });
  } catch (error) {
    console.error(error);
    return json(500, { ok: false, message: "The GroupMe reader failed. Check its Supabase function logs." });
  }
});
