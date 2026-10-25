/* Dougie's Revision: shared components for every page.
   Pages are rendered from the data files in /data, so new subjects and sessions are added as data. */
(function () {
  "use strict";
  var DR = window.DR = window.DR || {};
  DR.subjects = DR.subjects || {};

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  function parseDate(iso) { var p = iso.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function longDate(iso) { var d = parseDate(iso); return DAYS[d.getDay()] + " " + d.getDate() + " " + MONTHS[d.getMonth()]; }
  function todayIso(now) {
    now = now || new Date();
    return now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
  }
  function mins(hhmm) { var p = hhmm.split(":"); return (+p[0]) * 60 + (+p[1]); }
  function nowMins(now) { now = now || new Date(); return now.getHours() * 60 + now.getMinutes(); }
  function range(a, b) { return a + " to " + b; }
  function registryItem(slug) { return (DR.registry || []).filter(function (r) { return r.slug === slug; })[0]; }

  /* ---------- saved progress: localStorage, every read and write wrapped ---------- */
  var store = DR.store = {
    key: function (subject) { return "dougie-revision:" + subject; },
    read: function (subject) {
      try { var raw = window.localStorage.getItem(store.key(subject)); return raw ? JSON.parse(raw) : {}; }
      catch (e) { return {}; }
    },
    write: function (subject, data) {
      try { window.localStorage.setItem(store.key(subject), JSON.stringify(data)); return true; }
      catch (e) { return false; }
    },
    session: function (data, date) {
      data.sessions = data.sessions || {};
      return data.sessions[date] = data.sessions[date] || { done: {}, reports: {} };
    }
  };
  /* Keyed by subject, then session date, then report code. The latest rating for each report is kept in data.reports. */
  function setReport(subject, date, code, patch) {
    var data = store.read(subject);
    var s = date ? store.session(data, date) : null;
    data.reports = data.reports || {};
    var latest = data.reports[code] = Object.assign({}, data.reports[code] || {}, patch, { at: Date.now(), from: date || "subject page" });
    if (s) s.reports[code] = Object.assign({}, s.reports[code] || {}, patch);
    store.write(subject, data);
    return latest;
  }

  /* ---------- loading subject data ---------- */
  function loadSubjects(slugs, cb) {
    var left = slugs.length;
    if (!left) return cb();
    slugs.forEach(function (slug) {
      if (DR.subjects[slug]) { if (!--left) cb(); return; }
      var sc = document.createElement("script");
      sc.src = "/data/" + slug + ".js";
      sc.onload = sc.onerror = function () { if (!--left) cb(); };
      document.head.appendChild(sc);
    });
  }

  /* ---------- shared header, breadcrumbs and footer ---------- */
  function header(current) {
    var links = [{ href: "/", name: "Hub", slug: "" }].concat((DR.registry || []).map(function (r) { return { href: "/" + r.slug + "/", name: r.name, slug: r.slug }; }));
    return '<a class="skip" href="#main">Skip to content</a><header class="site-header"><div class="wrap">' +
      '<a class="brand" href="/">Dougie\'s Revision</a><nav aria-label="Main"><ul class="nav">' +
      links.map(function (l) { return '<li><a href="' + l.href + '"' + (l.slug === current ? ' aria-current="page"' : "") + ">" + esc(l.name) + "</a></li>"; }).join("") +
      "</ul></nav></div></header>";
  }
  function crumbs(items) {
    return '<nav class="crumbs" aria-label="Breadcrumb"><ol>' + items.map(function (it, i) {
      return i === items.length - 1 ? '<li><span aria-current="page">' + esc(it.name) + "</span></li>" : '<li><a href="' + it.href + '">' + esc(it.name) + "</a></li>";
    }).join("") + "</ol></nav>";
  }
  function footer() {
    return '<footer class="site-footer"><div class="wrap"><p>Your progress is saved on this device only. Ticks, ratings and scores stay in this browser, and clearing your browser data clears them too.</p><p>Dougie\'s Revision</p></div></footer>';
  }
  function frame(current, crumbItems, mainHtml, title) {
    document.title = title ? title + " | Dougie's Revision" : "Dougie's Revision";
    document.body.innerHTML = header(current) + '<main id="main" tabindex="-1"><div class="wrap">' + (crumbItems ? crumbs(crumbItems) : "") + mainHtml + "</div></main>" + footer();
  }

  /* ---------- components ---------- */
  DR.components = {};

  /* Confidence rating: red, amber or green, with text labels as well as colour */
  var rating = DR.components.rating = function (name, value, legend) {
    var opts = [["red", "Red"], ["amber", "Amber"], ["green", "Green"]];
    return '<fieldset class="rate"><legend>' + esc(legend || "How confident do you feel?") + "</legend>" +
      opts.map(function (o) {
        return '<label><input type="radio" name="' + esc(name) + '" value="' + o[0] + '"' + (value === o[0] ? " checked" : "") + '><span class="r-' + o[0] + '">' + o[1] + "</span></label>";
      }).join("") + "</fieldset>";
  };
  var scoreBox = DR.components.score = function (id, value) {
    return '<label class="score" for="' + esc(id) + '">Latest quiz score <input id="' + esc(id) + '" type="number" inputmode="numeric" min="0" max="10" step="1" value="' + (value == null ? "" : esc(value)) + '"> out of 10</label>';
  };
  /* Copy button: Clipboard API, falls back to selecting the text */
  DR.components.copy = function (btn) {
    var box = document.getElementById(btn.getAttribute("data-copy"));
    var text = box ? box.textContent.trim() : "";
    var msg = btn.parentNode.querySelector(".copied");
    function done(ok) {
      if (msg) { msg.textContent = ok ? "Copied" : "Press Ctrl+C or Cmd+C to copy"; setTimeout(function () { msg.textContent = ""; }, 2000); }
      btn.textContent = ok ? "Copied" : "Copy"; setTimeout(function () { btn.textContent = "Copy"; }, 2000);
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(function () { done(true); }, select); }
      else select();
    } catch (e) { select(); }
    function select() {
      try { var r = document.createRange(); r.selectNodeContents(box); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); } catch (e) {}
      done(false);
    }
  };
  /* Progress summary for a unit: counts of red, amber, green and not rated, and the average score */
  var summary = DR.components.summary = function (reports, saved) {
    var c = { red: 0, amber: 0, green: 0, none: 0 }, scores = [];
    reports.forEach(function (r) {
      var s = saved[r.code] || {};
      c[s.rating || "none"]++;
      if (s.score !== undefined && s.score !== "" && s.score !== null) scores.push(+s.score);
    });
    var avg = scores.length ? (scores.reduce(function (a, b) { return a + b; }, 0) / scores.length) : null;
    return { counts: c, average: avg, rated: reports.length - c.none, total: reports.length };
  };
  function summaryText(sm) {
    var t = "Green " + sm.counts.green + ", Amber " + sm.counts.amber + ", Red " + sm.counts.red + ", not rated " + sm.counts.none + ".";
    return t + (sm.average === null ? " No quiz scores yet." : " Average quiz score " + (Math.round(sm.average * 10) / 10) + " out of 10.");
  }

  /* ---------- report lookups ---------- */
  function reportIndex(subj) {
    var idx = {};
    subj.units.forEach(function (u) { u.reports.forEach(function (r) { idx[r.code] = { report: r, unit: u }; }); });
    return idx;
  }
  function unitByCode(subj, code) { return subj.units.filter(function (u) { return u.code === code; })[0]; }
  function unitStyle(u) { return u ? ' style="--accent:' + u.colour + ";--accent-dark:" + u.dark + ";--tint:" + u.tint + '"' : ""; }
  function sessionsNewestFirst(subj) { return (subj.sessions || []).slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; }); }

  /* ---------- pages ---------- */
  function pageHub() {
    var live = (DR.registry || []).filter(function (r) { return r.status === "live"; }).map(function (r) { return r.slug; });
    loadSubjects(live, function () {
      var today = todayIso(), banners = "";
      live.forEach(function (slug) {
        var subj = DR.subjects[slug]; if (!subj) return;
        (subj.sessions || []).forEach(function (s) {
          if (s.date === today) {
            var reg = registryItem(slug);
            banners += '<section class="today" style="--accent:' + reg.accent + '" aria-labelledby="today-' + slug + '"><p class="muted" style="color:#fff">Today\'s session</p>' +
              '<h2 id="today-' + slug + '">' + esc(s.title) + "</h2><p>" + longDate(s.date) + ", " + range(s.start, s.end) + "</p>" +
              '<a class="btn btn-big" href="/' + slug + "/sessions/" + s.date + '/">Start</a></section>';
          }
        });
      });
      var cards = (DR.registry || []).map(function (r) {
        var liveCard = r.status === "live";
        return '<article class="card subject-card" style="--accent-dark:' + r.accent + ";--tint:" + r.tint + '"><h2>' + esc(r.name) + "</h2>" +
          (liveCard ? "<p>" + esc(r.blurb) + '</p><a class="btn" href="/' + r.slug + '/">Open ' + esc(r.name) + "</a>"
            : '<p><span class="chip">Coming soon</span></p><p class="muted">On its way.</p>') + "</article>";
      }).join("");
      frame("", null,
        "<h1>Hi Dougie</h1><p class=\"lede\">Everything for your revision is here. Pick a subject, or jump straight into today's session when there is one.</p>" +
        banners + '<section class="section" aria-labelledby="subjects-h"><h2 id="subjects-h">Your subjects</h2><div class="grid grid-3">' + cards + "</div></section>");
    });
  }

  function pageSubject(slug) {
    var reg = registryItem(slug);
    if (!reg) return pageNotFound();
    if (reg.status !== "live") {
      frame(slug, [{ href: "/", name: "Hub" }, { name: reg.name }],
        '<h1>' + esc(reg.name) + '</h1><div class="card" style="--accent-dark:' + reg.accent + ";--tint:" + reg.tint + '"><p><span class="chip">Coming soon</span></p><p>' + esc(reg.name) + " revision is on its way, Dougie. Check back soon.</p></div>", reg.name);
      return;
    }
    loadSubjects([slug], function () {
      var subj = DR.subjects[slug]; if (!subj) return pageNotFound();
      var saved = (store.read(slug).reports) || {};
      var units = subj.units.map(function (u) {
        var sm = summary(u.reports, saved);
        return '<section class="card unit section"' + unitStyle(u) + ' aria-labelledby="u-' + esc(u.code) + '">' +
          '<div class="unit-head"><h2 id="u-' + esc(u.code) + '">' + (u.code === "Mixed" ? "" : esc(u.code) + " ") + esc(u.title) + '</h2><p class="unit-summary" data-summary="' + esc(u.code) + '">' + summaryText(sm) + "</p></div>" +
          '<ul class="reports">' + u.reports.map(function (r) {
            var s = saved[r.code] || {}, id = "s-" + r.code.replace(/\W/g, "");
            return '<li class="report" data-report="' + esc(r.code) + '"><h3><span class="code">' + (r.code === "Mixed" ? "" : esc(r.code) + " ") + "</span>" + esc(r.title) + "</h3><p>" + esc(r.focus) + "</p>" +
              rating("rate-" + id, s.rating, "Confidence") + '<p style="margin-top:12px">' + scoreBox(id, s.score) + "</p></li>";
          }).join("") + "</ul></section>";
      }).join("");
      var sessions = sessionsNewestFirst(subj).map(function (s) {
        return '<li class="card" style="--accent-dark:' + reg.accent + '"><a href="/' + slug + "/sessions/" + s.date + '/"><strong>' + esc(s.title) + "</strong><span>" + longDate(s.date) + ", " + range(s.start, s.end) + "</span></a></li>";
      }).join("");
      frame(slug, [{ href: "/", name: "Hub" }, { name: subj.name }],
        "<h1>" + esc(subj.heading) + '</h1><p class="lede">' + esc(subj.paper) + '</p><p><a class="btn btn-big" href="' + esc(subj.notebook) + '" target="_blank" rel="noopener">Open the ' + esc(subj.name) + " Notebook</a></p>" +
        '<section class="section" aria-labelledby="sessions-h"><h2 id="sessions-h">Sessions</h2><ul class="sessions-list">' + sessions + "</ul></section>" +
        '<div class="section"><h2>Your units</h2><p>Rate each report once you\'ve worked on it, and add your latest quiz score. Ratings from your sessions show up here too.</p></div>' + units, subj.name);
      bindSubject(slug, subj);
    });
  }
  function bindSubject(slug, subj) {
    var main = document.getElementById("main");
    function refresh() {
      var saved = store.read(slug).reports || {};
      subj.units.forEach(function (u) {
        var el = main.querySelector('[data-summary="' + u.code + '"]');
        if (el) el.textContent = summaryText(summary(u.reports, saved));
      });
    }
    main.addEventListener("change", function (ev) {
      var li = ev.target.closest("[data-report]"); if (!li) return;
      var code = li.getAttribute("data-report");
      if (ev.target.type === "radio") setReport(slug, null, code, { rating: ev.target.value });
      if (ev.target.type === "number") setReport(slug, null, code, { score: clampScore(ev.target) });
      refresh();
    });
  }
  function clampScore(input) {
    if (input.value === "") return "";
    var v = Math.max(0, Math.min(10, Math.round(+input.value)));
    input.value = v; return v;
  }

  function pageSession(slug, date) {
    var reg = registryItem(slug);
    if (!reg || reg.status !== "live") return pageNotFound();
    loadSubjects([slug], function () {
      var subj = DR.subjects[slug]; if (!subj) return pageNotFound();
      var sess = (subj.sessions || []).filter(function (s) { return s.date === date; })[0];
      if (!sess) return pageNotFound();
      var idx = reportIndex(subj);
      var data = store.read(slug), ss = (data.sessions && data.sessions[date]) || { done: {}, reports: {} };
      var breaks = (sess.breaks || []).map(function (b) { return "break " + range(b.start, b.end); }).join(", ");
      var slotsHtml = sess.slots.map(function (sl, i) { return slotHtml(subj, sess, sl, i, idx, ss); }).join("");
      var howTo = sess.howTo || subj.howTo || [];
      var nb = '<p class="no-print"><a class="btn btn-big" href="' + esc(subj.notebook) + '" target="_blank" rel="noopener">Open the ' + esc(subj.name) + " Notebook</a></p>";
      frame(slug, [{ href: "/", name: "Hub" }, { href: "/" + slug + "/", name: subj.name }, { name: longDate(date) }],
        '<div class="session-head"><h1>' + esc(sess.title) + '</h1><p class="times">' + longDate(date) + ", " + range(sess.start, sess.end) + (breaks ? ", " + breaks : "") + "</p></div>" +
        '<div id="state"></div>' +
        '<section class="panel howto section" aria-labelledby="how-h"><h2 id="how-h">How this works</h2><ol>' + howTo.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ol></section>" +
        '<div class="section">' + nb + "</div>" +
        '<section class="section" aria-labelledby="tl-h"><h2 id="tl-h">Timeline</h2>' +
        '<div class="progress" aria-live="polite"><div class="bar" role="progressbar" aria-label="Slots done" aria-valuemin="0" aria-valuemax="' + countable(sess) + '" aria-valuenow="0"><i></i></div><p id="prog-text"></p></div>' +
        '<ol class="timeline">' + slotsHtml + "</ol></section>" +
        '<div class="reset no-print"><button type="button" class="linkbtn" id="reset">Reset this session</button><div class="confirm" id="reset-confirm" hidden><span>This clears your ticks, ratings and scores for this session. Are you sure?</span><button type="button" class="btn" id="reset-yes">Yes, reset</button><button type="button" class="btn btn-ghost" id="reset-no">Cancel</button></div></div>',
        sess.title + ", " + longDate(date));
      bindSession(slug, subj, sess, idx);
    });
  }
  function countable(sess) { return sess.slots.filter(function (s) { return s.type !== "break"; }).length; }
  function dur(sl) { return (mins(sl.end) - mins(sl.start)) + " min"; }

  function slotHtml(subj, sess, sl, i, idx, ss) {
    var u, title, code = "", focus = "", extra = "", isDone = !!ss.done[i];
    if (sl.type === "report") {
      var hit = idx[sl.report] || {}; u = hit.unit; var r = hit.report || { code: sl.report, title: sl.report, focus: "" };
      code = r.code === "Mixed" ? "" : r.code; title = r.title; focus = r.focus;
      var saved = ss.reports[r.code] || {};
      extra = '<p class="find"><a class="btn btn-ghost" href="' + esc(subj.notebook) + '" target="_blank" rel="noopener">Open the notebook</a><span>In the Studio panel, look for <strong>' + esc(r.lookFor || r.code) + "</strong>.</span></p>" +
        (sl.prompt ? promptHtml("p-" + i, sl.prompt, "End of session check", subj.checkNote) : "") +
        '<div class="after" data-after="' + i + '"' + (isDone ? "" : " hidden") + ">" + rating("rate-" + i, saved.rating) + '<p style="margin-top:12px">' + scoreBox("score-" + i, saved.score) + "</p></div>";
    } else if (sl.type === "check") {
      u = unitByCode(subj, sl.unit); title = "Unit " + sl.unit + " check";
      var text = subj.checkPrompt.replace("{unit}", sl.unit + " " + (u ? u.title : ""));
      extra = promptHtml("p-" + i, text, "Unit check prompt", subj.checkNote);
    } else {
      title = sl.title;
    }
    var cls = "card slot slot-" + sl.type + (isDone ? " is-done" : "");
    var style = u ? unitStyle(u) : (sl.type === "break" ? ' style="--accent-dark:#7F8C8D"' : ' style="--accent-dark:#2C3E50"');
    var done = sl.type === "break" ? "" : '<label class="done"><input type="checkbox" data-done="' + i + '"' + (isDone ? " checked" : "") + "> Done</label>";
    return '<li class="' + cls + '"' + style + ' data-slot="' + i + '" data-start="' + sl.start + '" data-end="' + sl.end + '">' +
      '<div class="slot-top"><span class="slot-time">' + range(sl.start, sl.end) + '</span><span class="slot-dur">' + dur(sl) + "</span>" +
      (code ? '<span class="chip">' + esc(code) + "</span>" : (u ? '<span class="chip">' + esc(u.code === "Mixed" ? "Mixed" : "Unit " + u.code) + "</span>" : "")) +
      '<span class="now-slot"></span></div>' +
      "<h3>" + esc(title) + "</h3>" + (focus ? "<p>" + esc(focus) + "</p>" : "") + (sl.note ? '<p class="note">' + esc(sl.note) + "</p>" : "") +
      extra + done + "</li>";
  }
  function promptHtml(id, text, label, note) {
    return '<div class="prompt"><p class="muted" style="font-weight:700;margin-bottom:6px">' + esc(label) + '</p><p id="' + id + '">' + esc(text) + '</p>' +
      '<button type="button" class="btn" data-copy="' + id + '">Copy</button><span class="copied" aria-live="polite"></span></div><p class="muted">' + esc(note) + "</p>";
  }

  function bindSession(slug, subj, sess, idx) {
    var main = document.getElementById("main"), date = sess.date, total = countable(sess);
    function ssNow() { var d = store.read(slug); return store.session(d, date); }
    function progress() {
      var ss = ssNow(), n = 0;
      sess.slots.forEach(function (s, i) { if (s.type !== "break" && ss.done[i]) n++; });
      var bar = main.querySelector(".bar");
      bar.setAttribute("aria-valuenow", n);
      bar.querySelector("i").style.width = (total ? (n / total) * 100 : 0) + "%";
      document.getElementById("prog-text").textContent = n + " of " + total + " slots done";
      return n;
    }
    function clock() {
      var now = new Date(), today = todayIso(now), t = nowMins(now), state = "";
      main.querySelectorAll(".slot").forEach(function (li) {
        var on = today === date && t >= mins(li.getAttribute("data-start")) && t < mins(li.getAttribute("data-end"));
        li.classList.toggle("is-now", on);
        li.querySelector(".now-slot").innerHTML = on ? '<span class="badge-now">Now</span>' : "";
        if (on) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
      });
      if (today < date) state = '<p class="notice section">This session is on ' + longDate(date) + ". It starts at " + sess.start + ".</p>";
      else if (today === date && t < mins(sess.start)) state = '<p class="notice section">Starts at ' + sess.start + ".</p>";
      else if (today > date || t >= mins(sess.end)) state = completeHtml();
      var box = document.getElementById("state");
      if (box.getAttribute("data-html") !== state) { box.innerHTML = state; box.setAttribute("data-html", state); }
    }
    function completeHtml() {
      var ss = ssNow(), ticked = 0, c = { red: [], amber: [], green: [] };
      sess.slots.forEach(function (s, i) {
        if (s.type !== "break" && ss.done[i]) ticked++;
        if (s.type === "report") { var r = ss.reports[s.report]; if (r && c[r.rating]) c[r.rating].push(s.report); }
      });
      var name = function (code) { var h = idx[code]; return h ? (code === "Mixed" ? "" : code + " ") + h.report.title : code; };
      return '<section class="panel complete section" aria-labelledby="done-h"><h2 id="done-h">Session complete</h2>' +
        "<p>You ticked " + ticked + " of " + total + " slots. Well done for getting through it, Dougie.</p>" +
        '<ul class="counts"><li class="count count-red">Red ' + c.red.length + '</li><li class="count count-amber">Amber ' + c.amber.length + '</li><li class="count count-green">Green ' + c.green.length + "</li></ul>" +
        (c.red.length ? "<h3>Your priority list for next time</h3><ul>" + c.red.map(function (k) { return "<li>" + esc(name(k)) + "</li>"; }).join("") + "</ul>"
          : "<p>Nothing rated red. Use your amber reports as your starting point next time.</p>") + "</section>";
    }
    main.addEventListener("change", function (ev) {
      var t = ev.target, d = store.read(slug), ss = store.session(d, date);
      if (t.hasAttribute("data-done")) {
        var i = +t.getAttribute("data-done");
        if (t.checked) ss.done[i] = true; else delete ss.done[i];
        store.write(slug, d);
        var li = t.closest(".slot"); li.classList.toggle("is-done", t.checked);
        var after = main.querySelector('[data-after="' + i + '"]'); if (after) after.hidden = !t.checked;
        progress(); clock(); return;
      }
      var slot = t.closest(".slot"); if (!slot) return;
      var sl = sess.slots[+slot.getAttribute("data-slot")]; if (!sl || sl.type !== "report") return;
      if (t.type === "radio") setReport(slug, date, sl.report, { rating: t.value });
      if (t.type === "number") setReport(slug, date, sl.report, { score: clampScore(t) });
      clock();
    });
    main.addEventListener("click", function (ev) {
      var c = ev.target.closest("[data-copy]"); if (c) DR.components.copy(c);
      if (ev.target.id === "reset") { document.getElementById("reset-confirm").hidden = false; document.getElementById("reset-yes").focus(); }
      if (ev.target.id === "reset-no") { document.getElementById("reset-confirm").hidden = true; document.getElementById("reset").focus(); }
      if (ev.target.id === "reset-yes") {
        var d = store.read(slug);
        if (d.sessions) delete d.sessions[date];
        if (d.reports) Object.keys(d.reports).forEach(function (k) { if (d.reports[k].from === date) delete d.reports[k]; });
        store.write(slug, d);
        pageSession(slug, date);
      }
    });
    progress(); clock();
    setInterval(clock, 20000);
  }

  function pageNotFound() {
    frame(null, [{ href: "/", name: "Hub" }, { name: "Not found" }], "<h1>Page not found</h1><p>That page isn't here, Dougie. Head back to the <a href=\"/\">hub</a>.</p>", "Page not found");
  }

  /* ---------- router: works for real pages and for the 404 fallback ---------- */
  function route() {
    var path = location.pathname.replace(/index\.html$/, "");
    var m;
    if (path === "/" || path === "") return pageHub();
    if ((m = path.match(/^\/([a-z0-9-]+)\/sessions\/(\d{4}-\d{2}-\d{2})\/?$/))) return pageSession(m[1], m[2]);
    if ((m = path.match(/^\/([a-z0-9-]+)\/?$/))) return pageSubject(m[1]);
    pageNotFound();
  }
  DR.route = route;
  DR._test = { mins: mins, todayIso: todayIso, longDate: longDate, summary: summary };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", route); else route();
}());
