// Club Event Radar: the website. It runs in each visitor's browser (GitHub Pages only serves it).
// It reads published events from the database and sends new posts to the AI agent.
// It knows only the project address and the publishable key, so it can do only what the security rules allow.
(function () {
  "use strict";
  var cfg = window.EVENT_RADAR_CONFIG || {};
  var $ = function (id) { return document.getElementById(id); };

  if (!cfg.supabaseUrl || /YOUR-PROJECT-REF/.test(cfg.supabaseUrl) || !cfg.publishableKey || /YOUR-KEY/.test(cfg.publishableKey)) {
    $("boardStatus").textContent = "Add your Project URL and publishable key to config.js first.";
    return;
  }
  if (/^sb_secret_/.test(cfg.publishableKey)) {
    $("boardStatus").textContent = "Stop: config.js holds the secret key. Replace it with the publishable key, then create a new secret key in Supabase.";
    return;
  }

  var baseUrl = cfg.supabaseUrl.replace(/\/+$/, "");
  var db = window.supabase.createClient(baseUrl, cfg.publishableKey);
  var AGENT_URL = baseUrl + "/functions/v1/submit-event";
  // The website may read only these columns (the menu), never the raw announcement or moderator notes.
  var PUBLIC_COLUMNS = [
    "id", "title", "club", "event_date", "start_time", "end_time", "place_name", "place_detail", "cost", "free_food", "summary",
    "flyer_url",
  ].join(",");

  /* ---------- small helpers ---------- */
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text; // always textContent: posts are typed by strangers
    return e;
  }
  function fmtDate(d) {
    if (!d) return "Date to be announced";
    var p = d.split("-");
    return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  }
  function fmtTime(t) {
    if (!t) return "";
    var p = t.split(":"), h = +p[0], ap = h >= 12 ? "PM" : "AM";
    return (h % 12 || 12) + ":" + p[1] + " " + ap;
  }

  /* ---------- one event card: date badge, details, and (from Stage 7) the flyer ---------- */
  function dateBadge(d) {
    var box = el("div", "date");
    if (!d) { box.className = "date tba"; box.appendChild(el("span", "day", "TBA")); return box; }
    var p = d.split("-"), day = new Date(+p[0], +p[1] - 1, +p[2]);
    box.appendChild(el("span", "mon", day.toLocaleDateString("en-US", { month: "short" })));
    box.appendChild(el("span", "day", String(day.getDate())));
    return box;
  }
  function card(ev, extra) {
    var li = el("li", "event");
    li.appendChild(dateBadge(ev.event_date));
    var body = el("div", "event-body");
    var time = ev.start_time ? " · " + fmtTime(ev.start_time) + (ev.end_time ? " to " + fmtTime(ev.end_time) : "") : "";
    body.appendChild(el("p", "when", fmtDate(ev.event_date) + time));
    body.appendChild(el("h3", null, ev.title || "Untitled event"));
    var where = [ev.place_name, ev.place_detail].filter(Boolean).join(", ");
    var meta = [ev.club, where].filter(Boolean).join(" · ");
    if (meta) body.appendChild(el("p", "meta", meta));
    if (ev.summary) body.appendChild(el("p", "summary", ev.summary));
    var tags = el("p", "tags");
    if (ev.cost) tags.appendChild(el("span", "tag", ev.cost));
    if (ev.free_food) tags.appendChild(el("span", "tag food", "🍕 Free food"));
    if (tags.childNodes.length) body.appendChild(tags);
    if (extra) body.appendChild(extra);
    li.appendChild(body);
    if (ev.flyer_url && ev.flyer_url.indexOf(baseUrl + "/storage/v1/object/public/flyers/") === 0) {
      var img = el("img", "flyer");
      img.src = ev.flyer_url;
      img.alt = "Flyer for " + (ev.title || "this event");
      img.loading = "lazy";
      li.appendChild(img);
    }
    return li;
  }

  /* ---------- the event list: published events only ---------- */
  function loadBoard() {
    $("boardStatus").textContent = "Loading…";
    db.from("events").select(PUBLIC_COLUMNS).eq("status", "published")
      .order("event_date", { ascending: true, nullsFirst: false })
      .order("start_time", { ascending: true, nullsFirst: false })
      .then(function (res) {
        var list = $("board");
        list.textContent = "";
        if (res.error) { $("boardStatus").textContent = "Couldn't load events: " + res.error.message; return; }
        res.data.forEach(function (ev) { list.appendChild(card(ev)); });
        if (!res.data.length) list.appendChild(el("li", "empty", "No events yet. Post the first one!"));
        $("boardStatus").textContent = res.data.length ? res.data.length + (res.data.length === 1 ? " event" : " events") : "";
      });
  }

  /* ---------- moderator sign-in and review queue ---------- */
  var WAITING_COLUMNS = [
    "id", "created_at", "status", "status_reason", "announcement", "title", "club", "event_date", "start_time", "end_time",
    "place_name", "place_detail", "cost", "free_food", "summary", "flyer_url",
  ].join(",");
  var moderatorUser = null;

  function showModeratorMessage(message, isError) {
    var box = $("moderator-message");
    box.textContent = message || "";
    box.hidden = !message;
    box.className = isError ? "result error" : "muted";
  }

  function setModeratorUser(user) {
    var nextId = user ? user.id : null;
    var currentId = moderatorUser ? moderatorUser.id : null;
    if (nextId === currentId) return;
    moderatorUser = user || null;
    showModeratorMessage("");
    $("moderator-login").hidden = Boolean(moderatorUser);
    $("moderator-dashboard").hidden = !moderatorUser;
    if (moderatorUser) {
      $("moderator-identity").textContent = "Signed in as " + (moderatorUser.email || "moderator");
      loadWaiting();
    } else {
      $("waiting-board").replaceChildren();
      $("moderator-status").textContent = "";
    }
  }

  function moderatorCard(ev) {
    var review = el("div", "review");
    review.appendChild(el("p", "why", ev.status_reason || "This post is waiting for a moderator."));
    review.appendChild(el("p", "original", ev.announcement || "Original announcement not available."));
    var actions = el("p", "actions");
    var approve = el("button", null, "Approve");
    approve.type = "button";
    approve.dataset.reviewAction = "approve";
    approve.dataset.eventId = ev.id;
    var reject = el("button", "ghost", "Reject");
    reject.type = "button";
    reject.dataset.reviewAction = "reject";
    reject.dataset.eventId = ev.id;
    actions.append(approve, reject);
    review.appendChild(actions);
    return card(ev, review);
  }

  function loadWaiting() {
    if (!moderatorUser) return;
    $("moderator-status").textContent = "Loading posts…";
    db.from("events").select(WAITING_COLUMNS).eq("status", "waiting")
      .order("created_at", { ascending: true })
      .then(function (res) {
        var list = $("waiting-board");
        list.replaceChildren();
        if (res.error) {
          $("moderator-status").textContent = "Couldn't load the review queue: " + res.error.message;
          return;
        }
        res.data.forEach(function (ev) { list.appendChild(moderatorCard(ev)); });
        if (!res.data.length) list.appendChild(el("li", "empty", "No posts are waiting for review."));
        $("moderator-status").textContent = res.data.length ? res.data.length + (res.data.length === 1 ? " post waiting" : " posts waiting") : "";
      });
  }

  $("moderator-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var button = $("moderator-signin");
    button.disabled = true;
    button.textContent = "Signing in…";
    showModeratorMessage("");
    db.auth.signInWithPassword({
      email: $("moderator-email").value.trim(),
      password: $("moderator-password").value,
    }).then(function (res) {
      if (res.error) {
        showModeratorMessage("Couldn't sign in. Check the email and password and try again.", true);
        return;
      }
      setModeratorUser(res.data.user);
      $("moderator-form").reset();
    }).catch(function () {
      showModeratorMessage("Couldn't reach Supabase Auth. Check your connection and try again.", true);
    }).then(function () {
      button.disabled = false;
      button.textContent = "Sign in";
    });
  });

  $("moderator-signout").addEventListener("click", function () {
    db.auth.signOut().then(function (res) {
      if (res.error) showModeratorMessage("Couldn't sign out. Try again.", true);
      else setModeratorUser(null);
    }).catch(function () { showModeratorMessage("Couldn't reach Supabase Auth. Try again.", true); });
  });

  $("waiting-board").addEventListener("click", function (e) {
    var button = e.target.closest("button[data-review-action]");
    if (!button || !moderatorUser) return;
    var action = button.dataset.reviewAction;
    var eventId = button.dataset.eventId;
    var isApprove = action === "approve";
    var update = {
      status: isApprove ? "published" : "rejected",
      status_reason: isApprove ? "" : "Rejected by moderator.",
      reviewed_at: new Date().toISOString(),
      reviewed_by: moderatorUser.id,
    };
    var buttons = Array.from($("waiting-board").querySelectorAll("button"));
    buttons.forEach(function (item) { item.disabled = true; });
    $("moderator-status").textContent = "Saving review…";
    db.from("events").update(update).eq("id", eventId).eq("status", "waiting")
      .then(function (res) {
        if (res.error) throw res.error;
        showModeratorMessage(isApprove ? "Post approved and published." : "Post rejected.");
        loadBoard();
        loadWaiting();
      }).catch(function (error) {
        showModeratorMessage("Couldn't save the review: " + (error.message || "check the database policies."), true);
        buttons.forEach(function (item) { item.disabled = false; });
      });
  });

  db.auth.onAuthStateChange(function (_event, session) {
    window.setTimeout(function () { setModeratorUser(session && session.user); }, 0);
  });
  db.auth.getSession().then(function (res) {
    if (res.error) showModeratorMessage("Couldn't check the sign-in session.", true);
    else setModeratorUser(res.data.session && res.data.session.user);
  });

  /* ---------- posting: send it to the AI agent ---------- */
  var LABELS = { published: "Published", waiting: "Waiting for a moderator", rejected: "Not posted", duplicate: "Already posted", error: "Something went wrong" };
  function showResult(data) {
    var box = $("postResult"), kind = data.ok ? data.status : "error";
    box.hidden = false;
    box.className = "result " + kind;
    box.textContent = "";
    box.appendChild(el("p", "result-label", LABELS[kind] || kind));
    box.appendChild(el("p", null, data.message || ""));
    if (data.reasons && data.reasons.length) {
      var ul = el("ul", "reasons");
      data.reasons.forEach(function (r) { ul.appendChild(el("li", null, r)); });
      box.appendChild(ul);
    }
    if (data.event && data.status !== "rejected") {
      var preview = el("ul", "board preview");
      preview.appendChild(card(data.event));
      box.appendChild(preview);
    }
  }

  $("postForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var form = $("postForm"), btn = $("postBtn");
    var photo = $("flyer").files[0];
    if (photo && photo.size > 5 * 1024 * 1024) { showResult({ ok: false, message: "The photo must be 5 MB or smaller." }); return; }
    btn.disabled = true;
    btn.textContent = "The agent is reading it…";
    // The publishable key goes on the apikey header only (never as an Authorization bearer token).
    fetch(AGENT_URL, { method: "POST", headers: { apikey: cfg.publishableKey }, body: new FormData(form) })
      .then(function (r) {
        return r.json().catch(function () { return { ok: false, message: "The agent didn't answer (" + r.status + "). Is the function deployed?" }; });
      })
      .then(function (data) {
        showResult(data);
        if (data.ok) { form.reset(); loadBoard(); }
      })
      .catch(function () { showResult({ ok: false, message: "Couldn't reach the agent. Check your internet connection and the Project URL in config.js." }); })
      .then(function () { btn.disabled = false; btn.textContent = "Post it"; });
  });
  $("refreshBtn").addEventListener("click", loadBoard);

  // Say who drafts the cards (a quick check that doesn't call the AI).
  fetch(AGENT_URL, { headers: { apikey: cfg.publishableKey } })
    .then(function (r) { return r.json(); })
    .then(function (d) { if (d && d.ai) $("aiNote").textContent = "Event cards are drafted by an AI agent, " + d.ai + ", and checked against the posting rules."; })
    .catch(function () { /* the website still works without this note */ });


  loadBoard();
})();
