(function () {
  "use strict";

  const config = window.EVENT_RADAR_CONFIG;
  const eventColumns = "id, created_at, status, title, club, event_date, start_time, end_time, place_name, place_detail, cost, free_food, summary";
  const board = document.getElementById("event-board");
  const eventsMessage = document.getElementById("events-message");
  const postForm = document.getElementById("post-form");
  const announcementInput = document.getElementById("announcement");
  const submitButton = document.getElementById("submit-button");
  const resultBox = document.getElementById("post-result");
  const resultLabel = document.getElementById("result-label");
  const resultMessage = document.getElementById("result-message");
  const resultReasons = document.getElementById("result-reasons");
  const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
  let supabaseClient = null;
  let events = [];
  let activeFilter = "all";

  function makeClient() {
    if (!config || !config.supabaseUrl || !config.publishableKey) {
      throw new Error("The Supabase Project URL and publishable key are missing from config.js.");
    }
    if (!window.supabase || typeof window.supabase.createClient !== "function") {
      throw new Error("The Supabase library did not load. Check your internet connection and refresh the page.");
    }
    return window.supabase.createClient(config.supabaseUrl, config.publishableKey);
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function dateParts(value) {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const [year, month, day] = value.split("-").map(Number);
    return { date: new Date(year, month - 1, day, 12), year, month, day };
  }

  function formatTime(value) {
    if (!value) return "";
    const match = /^(\d{2}):(\d{2})/.exec(value);
    if (!match) return "";
    const date = new Date(2000, 0, 1, Number(match[1]), Number(match[2]));
    return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(date);
  }

  function makeEventCard(event) {
    const item = element("li", "event");
    const parts = dateParts(event.event_date);
    const dateBox = element("div", parts ? "date" : "date tba");
    if (parts) {
      dateBox.append(element("span", "mon", new Intl.DateTimeFormat("en-US", { month: "short" }).format(parts.date)));
      dateBox.append(element("span", "day", String(parts.day)));
    } else {
      dateBox.append(element("span", "day", "TBA"));
    }

    const body = element("div", "event-body");
    let when = "Date and time to be announced";
    if (parts) {
      const weekdayDate = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(parts.date);
      const start = formatTime(event.start_time);
      const end = formatTime(event.end_time);
      when = `${weekdayDate}${start ? ` · ${start}${end ? ` to ${end}` : ""}` : ""}`;
    }
    body.append(element("p", "when", when));
    body.append(element("h3", "", event.title || "Campus event"));

    const location = [event.place_name, event.place_detail].filter(Boolean).join(" · ");
    const meta = [event.club, location].filter(Boolean).join(" · ");
    if (meta) body.append(element("p", "meta", meta));
    if (event.summary) body.append(element("p", "summary", event.summary));

    const tags = element("p", "tags");
    if (event.cost) tags.append(element("span", "tag", event.cost));
    if (event.free_food) tags.append(element("span", "tag food", "🍕 Free food"));
    if (tags.childNodes.length) body.append(tags);

    item.append(dateBox, body);
    return item;
  }

  function filteredEvents() {
    if (activeFilter === "free") return events.filter((event) => String(event.cost || "").trim().toLowerCase() === "free");
    if (activeFilter === "food") return events.filter((event) => event.free_food === true);
    return events;
  }

  function renderEvents() {
    board.replaceChildren();
    const visible = filteredEvents();
    if (!visible.length) {
      board.append(element("li", "empty", events.length ? "No events match this filter." : "No events yet. Post the first one!"));
      return;
    }
    visible.forEach((event) => board.append(makeEventCard(event)));
  }

  async function loadEvents() {
    eventsMessage.textContent = "Loading events…";
    try {
      if (!supabaseClient) supabaseClient = makeClient();
      const { data, error } = await supabaseClient
        .from("events")
        .select(eventColumns)
        .eq("status", "published")
        .order("event_date", { ascending: true, nullsFirst: false })
        .order("start_time", { ascending: true, nullsFirst: false });
      if (error) throw error;
      events = data || [];
      eventsMessage.textContent = events.length ? `${events.length} published ${events.length === 1 ? "event" : "events"}` : "";
      renderEvents();
    } catch (error) {
      events = [];
      board.replaceChildren();
      eventsMessage.textContent = `Couldn’t load events. ${error.message || "Check the Supabase settings and refresh."}`;
      board.append(element("li", "empty", "Try refreshing the page in a moment."));
    }
  }

  function showResult(status, message, reasons) {
    const allowed = ["published", "waiting", "rejected", "duplicate"];
    const resultClass = allowed.includes(status) ? status : "error";
    resultBox.className = `result ${resultClass}`;
    resultBox.hidden = false;
    resultLabel.textContent = {
      published: "Posted",
      waiting: "Waiting for a moderator",
      rejected: "Not posted",
      duplicate: "Already posted",
      error: "Couldn’t submit"
    }[resultClass];
    resultMessage.textContent = message || "The agent returned no message.";
    resultReasons.replaceChildren();
    if (Array.isArray(reasons) && reasons.length) {
      reasons.forEach((reason) => resultReasons.append(element("li", "", String(reason))));
      resultReasons.hidden = false;
    } else {
      resultReasons.hidden = true;
    }
  }

  postForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const announcement = announcementInput.value.trim();
    if (!announcement) {
      announcementInput.focus();
      return;
    }
    if (announcement.length > 2000) {
      showResult("error", "Keep the announcement under 2,000 characters.");
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Reviewing…";
    resultBox.hidden = true;
    try {
      if (!config || !config.supabaseUrl || !config.publishableKey) throw new Error("The Supabase settings are missing from config.js.");
      const formData = new FormData();
      formData.set("announcement", announcement);
      const response = await fetch(`${config.supabaseUrl.replace(/\/$/, "")}/functions/v1/submit-event`, {
        method: "POST",
        headers: { apikey: config.publishableKey },
        body: formData
      });
      let payload;
      try {
        payload = await response.json();
      } catch (_) {
        throw new Error("The agent returned an unreadable response. Try again or check the function logs.");
      }
      if (!response.ok || !payload.ok) {
        showResult("error", payload.message || `The agent returned an error (${response.status}).`);
        return;
      }
      showResult(payload.status, payload.message, payload.reasons);
      if (payload.status === "published") {
        postForm.reset();
        await loadEvents();
      }
    } catch (error) {
      showResult("error", error.message || "The announcement could not be sent. Check your connection and try again.");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Review announcement";
    }
  });

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      filterButtons.forEach((choice) => choice.setAttribute("aria-pressed", String(choice === button)));
      renderEvents();
    });
  });

  document.getElementById("refresh-button").addEventListener("click", loadEvents);
  loadEvents();
})();
