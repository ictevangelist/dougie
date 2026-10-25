/* Dougie's Revision: shared components for every page.
   Pages are rendered from the data files in /data, so new subjects and sessions are added as data. */
(function () {
  "use strict";
  var DR = window.DR = window.DR || {};
  DR.subjects = DR.subjects || {};
  /* "" on dougie.ictevangelist.com; "/dougie" on ictevangelist.github.io/dougie/ */
  var BASE = DR.base = window.DR_BASE || "";

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  function now() { return new Date(); }
  function parseDate(iso) { var p = iso.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function longDate(iso) { var d = parseDate(iso); return DAYS[d.getDay()] + " " + d.getDate() + " " + MONTHS[d.getMonth()]; }
  function todayIso(d) {
    d = d || now();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function mins(hhmm) { var p = hhmm.split(":"); return (+p[0]) * 60 + (+p[1]); }
  function secsOfDay(d) { d = d || now(); return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds(); }
  function range(a, b) { return a + " to " + b; }
  function clockText(secs) {
    secs = Math.max(0, Math.round(secs));
    var h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60;
    return (h ? h + ":" + String(m).padStart(2, "0") : m) + ":" + String(s).padStart(2, "0");
  }
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
    },
    pref: function (name, value) {
      try {
        if (value === undefined) return window.localStorage.getItem("dougie-revision:pref:" + name);
        window.localStorage.setItem("dougie-revision:pref:" + name, value);
      } catch (e) { return null; }
    }
  };
  /* Keyed by subject, then session date, then report code. The latest rating for each report is kept in data.reports. */
  function setReport(subject, date, code, patch) {
    var data = store.read(subject);
    var s = date ? store.session(data, date) : null;
    data.reports = data.reports || {};
    data.reports[code] = Object.assign({}, data.reports[code] || {}, patch, { at: Date.now(), from: date || "subject page" });
    if (s) s.reports[code] = Object.assign({}, s.reports[code] || {}, patch);
    store.write(subject, data);
  }

  /* ---------- loading subject data ---------- */
  function loadSubjects(slugs, cb) {
    var left = slugs.length;
    if (!left) return cb();
    slugs.forEach(function (slug) {
      if (DR.subjects[slug]) { if (!--left) cb(); return; }
      var sc = document.createElement("script");
      sc.src = BASE + "/data/" + slug + ".js" + (window.DR_V ? "?v=" + window.DR_V : "");
      sc.onload = sc.onerror = function () { if (!--left) cb(); };
      document.head.appendChild(sc);
    });
  }

  /* ---------- shared header, breadcrumbs and footer ---------- */
  function header(current) {
    var links = [{ href: BASE + "/", name: "Hub", slug: "" }].concat((DR.registry || []).map(function (r) { return { href: BASE + "/" + r.slug + "/", name: r.name, short: r.short, slug: r.slug }; }));
    return '<a class="skip" href="#main">Skip to content</a><header class="site-header"><div class="wrap">' +
      '<a class="brand" href="' + BASE + '/"><span class="brand-dot" aria-hidden="true"></span>Dougie\'s Revision</a><nav aria-label="Main"><ul class="nav">' +
      links.map(function (l) {
        var label = l.short ? '<span class="n-long">' + esc(l.name) + '</span><span class="n-short" aria-hidden="true">' + esc(l.short) + "</span>" : esc(l.name);
        return '<li><a href="' + l.href + '"' + (l.short ? ' aria-label="' + esc(l.name) + '"' : "") + (l.slug === current ? ' aria-current="page"' : "") + ">" + label + "</a></li>";
      }).join("") +
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
  var baseTitle = "Dougie's Revision";
  function frame(current, crumbItems, mainHtml, title) {
    baseTitle = title ? title + " | Dougie's Revision" : "Dougie's Revision";
    document.title = baseTitle;
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
    var label = btn.getAttribute("data-label") || "Copy";
    function done(ok) {
      if (msg) { msg.textContent = ok ? "Copied" : "Press Ctrl+C or Cmd+C to copy"; setTimeout(function () { msg.textContent = ""; }, 2000); }
      btn.textContent = ok ? "Copied" : label; setTimeout(function () { btn.textContent = label; }, 2000);
    }
    function select() {
      try { var r = document.createRange(); r.selectNodeContents(box); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); } catch (e) {}
      done(false);
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { done(true); }, select);
      else select();
    } catch (e) { select(); }
  };
  /* Progress summary for a unit: counts of red, amber, green and not rated, and the average score */
  var summary = DR.components.summary = function (reports, saved) {
    var c = { red: 0, amber: 0, green: 0, none: 0 }, scores = [];
    reports.forEach(function (r) {
      var s = saved[r.code] || {};
      c[s.rating || "none"]++;
      if (s.score !== undefined && s.score !== "" && s.score !== null) scores.push(+s.score);
    });
    var avg = scores.length ? scores.reduce(function (a, b) { return a + b; }, 0) / scores.length : null;
    return { counts: c, average: avg };
  };
  function summaryText(sm) {
    var t = "Green " + sm.counts.green + ", Amber " + sm.counts.amber + ", Red " + sm.counts.red + ", not rated " + sm.counts.none + ".";
    return t + (sm.average === null ? " No quiz scores yet." : " Average quiz score " + (Math.round(sm.average * 10) / 10) + " out of 10.");
  }

  /* ---------- report and session lookups ---------- */
  function reportIndex(subj) {
    var idx = {};
    subj.units.forEach(function (u) { u.reports.forEach(function (r) { idx[r.code] = { report: r, unit: u }; }); });
    return idx;
  }
  function unitByCode(subj, code) { return subj.units.filter(function (u) { return u.code === code; })[0]; }
  function unitStyle(u) { return u ? ' style="--accent:' + u.colour + ";--accent-dark:" + u.colour + ";--tint:" + u.tint + '"' : ""; }
  function sessionsNewestFirst(subj) { return (subj.sessions || []).slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; }); }
  function slotTitle(subj, sl, idx) {
    if (sl.type === "report") { var h = idx[sl.report]; return h ? (h.report.code === "Mixed" ? "" : h.report.code + " ") + h.report.title : sl.report; }
    if (sl.type === "check") { var u = unitByCode(subj, sl.unit); return "Unit " + sl.unit + " check" + (u ? ": " + u.title : ""); }
    return sl.title;
  }
  /* Where a session stands at a moment: before, on (with the slot), or after */
  function sessionState(sess, at) {
    at = at || now();
    var today = todayIso(at), t = secsOfDay(at);
    if (today < sess.date) return { when: "future" };
    if (today > sess.date) return { when: "past" };
    if (t < mins(sess.start) * 60) return { when: "before", secs: mins(sess.start) * 60 - t };
    if (t >= mins(sess.end) * 60) return { when: "past" };
    for (var i = 0; i < sess.slots.length; i++) {
      var sl = sess.slots[i];
      if (t >= mins(sl.start) * 60 && t < mins(sl.end) * 60) return { when: "on", i: i, slot: sl, left: mins(sl.end) * 60 - t, next: sess.slots[i + 1] };
    }
    return { when: "on", i: -1 };
  }
  /* The next session across all live subjects, from today onwards */
  function nextSession(slugs) {
    var today = todayIso(), best = null;
    slugs.forEach(function (slug) {
      var subj = DR.subjects[slug]; if (!subj) return;
      (subj.sessions || []).forEach(function (s) {
        var st = sessionState(s);
        if (s.date >= today && st.when !== "past" && (!best || s.date + s.start < best.s.date + best.s.start)) best = { slug: slug, subj: subj, s: s };
      });
    });
    return best;
  }
  /* Pay: which day of the run of days a session is, across every live subject */
  function payDay(sess) {
    var all = [];
    (DR.registry || []).forEach(function (r) { var sj = DR.subjects[r.slug]; if (sj) (sj.sessions || []).forEach(function (x) { all.push(x.date + " " + x.start); }); });
    all.sort();
    var i = all.indexOf(sess.date + " " + sess.start), days = (DR.pay && DR.pay.days) || 3;
    return i < 0 ? 1 : (i % days) + 1;
  }
  function money(n) { return (DR.pay.currency || "") + n; }
  /* The money jar: perDay for each finished session saved on this device (every slot ticked, every quiz score in).
     A run of "days" sessions that are all finished and all on Dad's calmDays list doubles, so 3 calm days make 3 x perDay x 2. */
  function jarTotals() {
    var P = DR.pay, all = [];
    (DR.registry || []).forEach(function (r) {
      var sj = DR.subjects[r.slug]; if (!sj) return;
      var saved = (store.read(r.slug).sessions) || {};
      (sj.sessions || []).forEach(function (x) {
        var ss = saved[x.date] || { done: {}, reports: {} }, ok = true;
        x.slots.forEach(function (sl, i) {
          if (sl.type === "break") return;
          if (!ss.done[i]) ok = false;
          if (sl.type === "report") { var rp = (ss.reports || {})[sl.report]; if (!rp || rp.score === undefined || rp.score === "") ok = false; }
        });
        all.push({ key: x.date + " " + x.start, date: x.date, earned: ok });
      });
    });
    all.sort(function (a, b) { return a.key < b.key ? -1 : 1; });
    var calm = P.calmDays || [], total = 0, runs = Math.max(1, Math.ceil(all.length / P.days)), last = runs - 1, calmInRun = 0;
    for (var r = 0; r < runs; r++) {
      var run = all.slice(r * P.days, r * P.days + P.days), full = run.length === P.days, allCalm = full;
      run.forEach(function (d) { if (d.earned) total += P.perDay; if (!(d.earned && calm.indexOf(d.date) > -1)) allCalm = false; });
      if (allCalm) total += P.perDay * P.days;
      if (r === last) calmInRun = run.filter(function (d) { return d.earned && calm.indexOf(d.date) > -1; }).length;
    }
    return { total: total, max: runs * P.days * P.perDay * 2, calm: calmInRun };
  }
  function jarHtml() {
    if (!DR.pay) return "";
    var P = DR.pay, j = jarTotals(), f = Math.min(1, j.total / j.max), top = 40, bottom = 250, h = (bottom - top) * f, ticks = "";
    for (var k = 1; k <= 3; k++) { var y = bottom - (bottom - top) * k / 3; ticks += '<line x1="150" x2="164" y1="' + y + '" y2="' + y + '" class="jar-tick"/><text x="170" y="' + (y + 5) + '" class="jar-label">' + money(j.max * k / 3) + "</text>"; }
    return '<section class="card jar section" style="--accent-dark:#F1C40F" aria-labelledby="jar-h"><svg class="jar-svg" viewBox="0 0 210 270" role="img" aria-label="Money jar: ' + money(j.total) + " of " + money(j.max) + '">' +
      '<defs><clipPath id="jar-clip"><path d="M40 40 h90 v10 q20 10 20 40 v140 q0 20 -20 20 h-90 q-20 0 -20 -20 v-140 q0 -30 20 -40 z"/></clipPath></defs>' +
      '<g clip-path="url(#jar-clip)"><g class="jar-coins"><rect class="jar-fill" x="0" y="' + (bottom - h) + '" width="170" height="' + h + '"/>' + (h ? '<rect class="jar-shine" x="0" y="' + (bottom - h) + '" width="170" height="6"/>' : "") + "</g></g>" +
      '<path class="jar-glass" d="M40 40 h90 v10 q20 10 20 40 v140 q0 20 -20 20 h-90 q-20 0 -20 -20 v-140 q0 -30 20 -40 z"/>' +
      '<rect class="jar-lid" x="34" y="22" width="102" height="20" rx="6"/>' + ticks + "</svg>" +
      '<div><h2 id="jar-h">The money jar</h2><p class="jar-total">' + money(j.total) + "<small>in the jar so far</small></p>" +
      "<p>Every finished morning adds " + money(P.perDay) + ". Finished means every slot ticked and every quiz score in. Do " + P.days + " mornings in a row with no arguments and they count double, so the jar fills to " + money(P.perDay * 2 * P.days) + ".</p>" +
      '<p class="muted">Calm mornings Dad has confirmed this run: ' + j.calm + " of " + P.days + ". The jar counts what's saved on this device.</p></div></section>";
  }
  function payHtml(sess) {
    if (!DR.pay) return "";
    var P = DR.pay, d = payDay(sess);
    return '<div class="pay section"><p style="margin:0"><strong>' + money(P.perDay) + "</strong> <span>for the morning, once every slot is ticked and every quiz score is in.</span></p>" +
      '<p style="margin:0"><strong>' + money(P.perDay * 2) + "</strong> <span>instead, if there are no arguments. Do " + P.days + " days in a row like that and it's " + money(P.perDay * 2 * P.days) + " instead of " + money(P.perDay * P.days) + ". Dad decides on the arguments.</span></p>" +
      '<p style="margin:0" class="muted">This is day ' + d + " of " + P.days + ".</p></div>";
  }


  /* ---------- hub ---------- */
  function pageHub() {
    var live = (DR.registry || []).filter(function (r) { return r.status === "live"; }).map(function (r) { return r.slug; });
    loadSubjects(live, function () {
      var cards = (DR.registry || []).map(function (r) {
        var subj = DR.subjects[r.slug], liveCard = r.status === "live" && subj;
        var reports = liveCard ? subj.units.reduce(function (n, u) { return n + u.reports.length; }, 0) : 0;
        return '<article class="card subject-card" style="--accent-dark:' + r.accent + ";--tint:" + r.tint + '"><h2>' + esc(r.name) + "</h2>" +
          (liveCard ? "<p>" + esc(r.blurb) + ". " + reports + " reports in the notebook.</p>" + '<a class="btn" href="' + BASE + "/" + r.slug + '/">Open ' + esc(r.name) + "</a>"
            : '<p><span class="chip">Coming soon</span></p><p>Not yet. Enjoy it while it lasts.</p>') + "</article>";
      }).join("");
      frame("", null,
        '<div class="hero"><div><h1>Right then, Dougie.</h1><p class="lede">This is your revision lab. The plan, the timer and the pay are all in here, so there\'s nothing to work out. Turn up, do the thing on screen, move on when the timer says so.</p></div><div class="portal" aria-hidden="true"></div></div>' +
        '<div id="hub-now" aria-live="polite"></div>' +
        jarHtml() +
        '<section class="section" aria-labelledby="subjects-h"><h2 id="subjects-h">Your subjects</h2><div class="grid grid-3">' + cards + "</div></section>");
      function tick() {
        var box = document.getElementById("hub-now"); if (!box) return;
        var n = nextSession(live), html = "";
        if (n) {
          var st = sessionState(n.s), href = BASE + "/" + n.slug + "/sessions/" + n.s.date + "/";
          if (st.when === "on" && st.i >= 0) {
            html = '<section class="mission section" aria-labelledby="hub-h"><p class="kicker">Today\'s session is running</p><h2 id="hub-h">You\'re on ' + esc(slotTitle(n.subj, st.slot, reportIndex(n.subj))) + '</h2><p class="countdown">' + clockText(st.left) + "<small>left</small></p>" +
              '<a class="btn btn-big" href="' + href + '">Back to it</a></section>';
          } else if (st.when === "before") {
            html = '<section class="mission section" aria-labelledby="hub-h"><p class="kicker">Today\'s session</p><h2 id="hub-h">' + esc(n.s.title) + "</h2><p>" + longDate(n.s.date) + ", " + range(n.s.start, n.s.end) + '</p><p class="countdown">' + clockText(st.secs) + "<small>until it starts</small></p>" +
              '<a class="btn btn-big" href="' + href + '">Start</a>' + payHtml(n.s) + "</section>";
          } else if (st.when === "future") {
            html = '<section class="mission section" aria-labelledby="hub-h"><p class="kicker">Next session</p><h2 id="hub-h">' + esc(n.s.title) + '</h2><p class="lede">' + longDate(n.s.date) + ", " + range(n.s.start, n.s.end) + '</p><div class="btn-row"><a class="btn" href="' + href + '">See the plan</a></div>' + payHtml(n.s) + "</section>";
          } else {
            html = '<section class="mission section" aria-labelledby="hub-h"><p class="kicker">Today\'s session</p><h2 id="hub-h">' + esc(n.s.title) + '</h2><p>Between slots.</p><a class="btn btn-big" href="' + href + '">Open the session</a></section>';
          }
        }
        if (box.getAttribute("data-html") !== html) { box.innerHTML = html; box.setAttribute("data-html", html); }
      }
      tick(); setInterval(tick, 1000);
    });
  }

  /* ---------- subject page ---------- */
  function pageSubject(slug) {
    var reg = registryItem(slug);
    if (!reg) return pageNotFound();
    if (reg.status !== "live") {
      frame(slug, [{ href: BASE + "/", name: "Hub" }, { name: reg.name }],
        "<h1>" + esc(reg.name) + '</h1><div class="card" style="--accent-dark:' + reg.accent + ";--tint:" + reg.tint + '"><p><span class="chip">Coming soon</span></p><p>' + esc(reg.name) + " is on its way, Dougie. You've got a bit of time before this one lands.</p></div>", reg.name);
      return;
    }
    loadSubjects([slug], function () {
      var subj = DR.subjects[slug]; if (!subj) return pageNotFound();
      var saved = store.read(slug).reports || {};
      var units = subj.units.map(function (u) {
        var sm = summary(u.reports, saved);
        return '<section class="card unit section"' + unitStyle(u) + ' aria-labelledby="u-' + esc(u.code) + '">' +
          '<div class="unit-head"><h2 id="u-' + esc(u.code) + '">' + (u.code === "Mixed" ? "" : esc(u.code) + " ") + esc(u.title) + '</h2><p class="unit-summary" data-summary="' + esc(u.code) + '">' + summaryText(sm) + "</p></div>" +
          '<ul class="reports">' + u.reports.map(function (r) {
            var s = saved[r.code] || {}, id = "s-" + r.code.replace(/\W/g, "");
            return '<li class="report" data-report="' + esc(r.code) + '"><h3>' + (r.code === "Mixed" ? "" : esc(r.code) + " ") + esc(r.title) + "</h3><p>" + esc(r.focus) + "</p>" +
              rating("rate-" + id, s.rating, "Confidence") + '<p style="margin-top:12px">' + scoreBox(id, s.score) + "</p></li>";
          }).join("") + "</ul></section>";
      }).join("");
      var sessions = sessionsNewestFirst(subj).map(function (s) {
        return '<li class="card" style="--accent-dark:' + reg.accent + '"><a href="' + BASE + "/" + slug + "/sessions/" + s.date + '/"><strong>' + esc(s.title) + "</strong><span>" + longDate(s.date) + ", " + range(s.start, s.end) + "</span></a></li>";
      }).join("");
      frame(slug, [{ href: BASE + "/", name: "Hub" }, { name: subj.name }],
        '<div class="hero"><div><h1>' + esc(subj.heading) + '</h1><p class="lede">' + esc(subj.paper) + '</p><p><a class="btn btn-big" href="' + esc(subj.notebook) + '" target="_blank" rel="noopener">Open the ' + esc(subj.name) + " Notebook</a></p></div></div>" +
        '<section class="section" aria-labelledby="sessions-h"><h2 id="sessions-h">Sessions</h2><ul class="sessions-list">' + sessions + "</ul></section>" +
        '<div class="section"><h2>Your units</h2><p>Rate each report once you\'ve worked on it, and add your latest quiz score. Ratings from your sessions land here too, so this is the honest picture of where you are.</p></div>' + units, subj.name);
      var main = document.getElementById("main");
      main.addEventListener("change", function (ev) {
        var li = ev.target.closest("[data-report]"); if (!li) return;
        var code = li.getAttribute("data-report");
        if (ev.target.type === "radio") setReport(slug, null, code, { rating: ev.target.value });
        if (ev.target.type === "number") setReport(slug, null, code, { score: clampScore(ev.target) });
        var all = store.read(slug).reports || {};
        subj.units.forEach(function (u) { var el = main.querySelector('[data-summary="' + u.code + '"]'); if (el) el.textContent = summaryText(summary(u.reports, all)); });
      });
    });
  }
  function clampScore(input) {
    if (input.value === "") return "";
    var v = Math.max(0, Math.min(10, Math.round(+input.value)));
    input.value = v; return v;
  }

  /* ---------- session page ---------- */
  function pageSession(slug, date) {
    var reg = registryItem(slug);
    if (!reg || reg.status !== "live") return pageNotFound();
    var live = (DR.registry || []).filter(function (r) { return r.status === "live"; }).map(function (r) { return r.slug; });
    loadSubjects(live, function () {
      var subj = DR.subjects[slug]; if (!subj) return pageNotFound();
      var sess = (subj.sessions || []).filter(function (s) { return s.date === date; })[0];
      if (!sess) return pageNotFound();
      var idx = reportIndex(subj);
      var data = store.read(slug), ss = (data.sessions && data.sessions[date]) || { done: {}, reports: {} };
      var breaks = (sess.breaks || []).map(function (b) { return "break " + range(b.start, b.end); }).join(", ");
      var howTo = sess.howTo || subj.howTo || [];
      frame(slug, [{ href: BASE + "/", name: "Hub" }, { href: BASE + "/" + slug + "/", name: subj.name }, { name: longDate(date) }],
        '<div class="hero session-head"><div><h1>' + esc(sess.title) + '</h1><p class="times">' + longDate(date) + ", " + range(sess.start, sess.end) + (breaks ? ", " + breaks : "") + '</p></div><div class="portal" aria-hidden="true"></div></div>' +
        '<div id="mission" class="section" aria-live="polite"></div>' + payHtml(sess) +
        '<details class="panel howto section" open><summary>How this works</summary><ol>' + howTo.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ol></details>" +
        '<div class="section nb-row no-print"><a class="btn btn-big" href="' + esc(subj.notebook) + '" target="_blank" rel="noopener">Open the ' + esc(subj.name) + " Notebook</a></div>" +
        '<section class="section" aria-labelledby="tl-h"><h2 id="tl-h">Timeline</h2>' +
        '<div class="progress"><div class="bar" role="progressbar" aria-label="Slots done" aria-valuemin="0" aria-valuemax="' + countable(sess) + '" aria-valuenow="0"><i></i></div><p id="prog-text" aria-live="polite"></p></div>' +
        '<ol class="timeline">' + sess.slots.map(function (sl, i) { return slotHtml(subj, sess, sl, i, idx, ss); }).join("") + "</ol></section>" +
        '<div class="reset no-print"><button type="button" class="linkbtn" id="reset">Reset this session</button><div class="confirm" id="reset-confirm" hidden><span>This clears your ticks, ratings and scores for this session. Are you sure?</span><button type="button" class="btn" id="reset-yes">Yes, reset</button><button type="button" class="btn btn-ghost" id="reset-no">Cancel</button></div></div>',
        sess.title + ", " + longDate(date));
      bindSession(slug, subj, sess, idx);
    });
  }
  function countable(sess) { return sess.slots.filter(function (s) { return s.type !== "break"; }).length; }
  function dur(sl) { return (mins(sl.end) - mins(sl.start)) + " min"; }
  function promptHtml(id, text, label, note) {
    return '<div class="prompt"><p class="label">' + esc(label) + '</p><p id="' + id + '">' + esc(text) + '</p>' +
      '<button type="button" class="btn" data-copy="' + id + '">Copy</button><span class="copied" aria-live="polite"></span></div><p class="muted">' + esc(note) + "</p>";
  }
  function slotHtml(subj, sess, sl, i, idx, ss) {
    var u, code = "", focus = "", extra = "", isDone = !!ss.done[i];
    if (sl.type === "report") {
      var hit = idx[sl.report] || {}; u = hit.unit; var r = hit.report || { code: sl.report, title: sl.report, focus: "" };
      code = r.code === "Mixed" ? "" : r.code; focus = r.focus;
      var saved = ss.reports[r.code] || {};
      extra = '<p class="find">' + (r.link ? '<a class="btn btn-ghost" href="' + esc(r.link) + '" target="_blank" rel="noopener">Open ' + esc(r.code === "Mixed" ? r.title : r.code) + "</a>"
        : '<a class="btn btn-ghost" href="' + esc(subj.notebook) + '" target="_blank" rel="noopener">Open the notebook</a><span>In the Studio panel, look for <strong>' + esc(r.lookFor || r.code) + "</strong>.</span>") + "</p>" +
        (sl.prompt ? promptHtml("p-" + i, sl.prompt, "End of session check", subj.checkNote) : "") +
        '<div class="after" data-after="' + i + '"' + (isDone ? "" : " hidden") + ">" + rating("rate-" + i, saved.rating) + '<p style="margin-top:12px">' + scoreBox("score-" + i, saved.score) + "</p></div>";
    } else if (sl.type === "check") {
      u = unitByCode(subj, sl.unit);
      extra = promptHtml("p-" + i, subj.checkPrompt.replace("{unit}", sl.unit + " " + (u ? u.title : "")), "Unit check prompt", subj.checkNote);
    }
    var style = u ? unitStyle(u) : (sl.type === "break" ? ' style="--accent-dark:#95A5A6"' : ' style="--accent-dark:#ECF0F1"');
    var done = sl.type === "break" ? "" : '<label class="done"><input type="checkbox" data-done="' + i + '"' + (isDone ? " checked" : "") + "> Done</label>";
    var chip = code ? '<span class="chip">' + esc(code) + "</span>" : (u ? '<span class="chip">' + esc(u.code === "Mixed" ? "Mixed" : "Unit " + u.code) + "</span>" : "");
    return '<li class="card slot slot-' + sl.type + (isDone ? " is-done" : "") + '"' + style + ' id="slot-' + i + '" data-slot="' + i + '" data-start="' + sl.start + '" data-end="' + sl.end + '">' +
      '<div class="slot-top"><span class="slot-time">' + range(sl.start, sl.end) + '</span><span class="slot-dur">' + dur(sl) + "</span>" + chip +
      '<span class="now-slot"></span><span class="done-slot">' + (isDone ? '<span class="badge-done">Done</span>' : "") + "</span></div>" +
      "<h3>" + esc(sl.type === "report" ? (idx[sl.report] ? idx[sl.report].report.title : sl.report) : slotTitle(subj, sl, idx)) + "</h3>" + (focus ? "<p>" + esc(focus) + "</p>" : "") + (sl.note ? '<p class="note">' + esc(sl.note) + "</p>" : "") +
      extra + done + "</li>";
  }

  function bindSession(slug, subj, sess, idx) {
    var main = document.getElementById("main"), date = sess.date, total = countable(sess);
    var focus = store.pref("focus") === "on";
    function ssNow() { var d = store.read(slug); return store.session(d, date); }
    function doneCount() { var ss = ssNow(), n = 0; sess.slots.forEach(function (s, i) { if (s.type !== "break" && ss.done[i]) n++; }); return n; }
    function progress() {
      var n = doneCount(), bar = main.querySelector(".bar");
      bar.setAttribute("aria-valuenow", n);
      bar.querySelector("i").style.width = (total ? (n / total) * 100 : 0) + "%";
      document.getElementById("prog-text").textContent = n + " of " + total + " slots done";
    }
    function steps(sl) {
      var list = (subj.steps && subj.steps[sl.type]) || [], h = sl.type === "report" && idx[sl.report];
      if (h && !h.report.link) list = ["Open the notebook and find " + (h.report.lookFor || h.report.code) + " in the Studio panel."].concat(list);
      return list;
    }
    function missionLink(sl) {
      var h = sl.type === "report" && idx[sl.report];
      if (h && h.report.link) return '<a class="btn" href="' + esc(h.report.link) + '" target="_blank" rel="noopener">Open ' + esc(h.report.code === "Mixed" ? h.report.title : h.report.code) + "</a>";
      return '<a class="btn" href="' + esc(subj.notebook) + '" target="_blank" rel="noopener">Open the notebook</a>';
    }
    function missionHtml(st) {
      if (st.when === "future") return '<section class="mission" aria-labelledby="m-h"><p class="kicker">Next session</p><h2 id="m-h">' + longDate(date) + ", " + sess.start + '</h2><p>Have a look through the plan below so nothing surprises you. When it starts, this box tells you exactly what to do and how long you\'ve got.</p></section>';
      if (st.when === "before") return '<section class="mission" aria-labelledby="m-h"><p class="kicker">Today</p><h2 id="m-h">Starts at ' + sess.start + '</h2><p class="countdown">' + clockText(st.secs) + "<small>to go</small></p><p>Get a drink, get your calculator, and get the notebook open.</p></section>";
      if (st.when === "past") return completeHtml();
      if (st.i < 0) return "";
      var sl = st.slot, title = slotTitle(subj, sl, idx), isBreak = sl.type === "break";
      var nextLine = st.next ? '<p class="next">Next: <strong>' + esc(slotTitle(subj, st.next, idx)) + "</strong> at " + st.next.start + "</p>" : '<p class="next">This is the last one. Finish strong.</p>';
      return '<section class="mission" aria-labelledby="m-h"><p class="kicker">' + (isBreak ? "Break" : "Right now") + '</p><h2 id="m-h">' + esc(title) + '</h2>' +
        '<p class="countdown">' + clockText(st.left) + "<small>" + (isBreak ? "until you're back on" : "left on this one") + "</small></p>" +
        (sl.note ? '<p class="note"><strong>' + esc(sl.note) + "</strong></p>" : "") +
        '<ol class="steps">' + steps(sl).map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ol>" +
        '<div class="btn-row">' + (isBreak ? "" : missionLink(sl) + '<a class="btn btn-ghost" href="#slot-' + st.i + '">Go to this slot</a>') +
        '<button type="button" class="btn btn-ghost" id="focus-btn" aria-pressed="' + (focus ? "true" : "false") + '">' + (focus ? "Show everything" : "Focus mode") + "</button></div>" + nextLine + "</section>";
    }
    function results() {
      var ss = ssNow(), n = doneCount(), c = { red: [], amber: [], green: [] }, scores = [];
      sess.slots.forEach(function (s) {
        if (s.type !== "report") return;
        var r = ss.reports[s.report], name = slotTitle(subj, s, idx);
        if (r && c[r.rating]) c[r.rating].push(name);
        if (r && r.score !== undefined && r.score !== "") scores.push(name + ": " + r.score + "/10");
      });
      var missing = sess.slots.filter(function (s) { if (s.type !== "report") return false; var x = ss.reports[s.report]; return !x || x.score === undefined || x.score === ""; }).length;
      return { n: n, c: c, scores: scores, missing: missing };
    }
    function completeHtml() {
      var r = results(), all = r.n === total, earned = all && r.missing === 0, pay = "", payLine = "";
      if (DR.pay) {
        var todo = [];
        if (!all) todo.push("tick the last " + (total - r.n) + " slot" + (total - r.n === 1 ? "" : "s"));
        if (r.missing) todo.push("add " + r.missing + " more quiz score" + (r.missing === 1 ? "" : "s"));
        pay = "<li><strong>" + money(DR.pay.perDay) + "</strong> for today: " + (earned ? "unlocked." : "to unlock it, " + todo.join(" and ") + ".") + "</li>" +
          "<li><strong>" + money(DR.pay.perDay * 2) + "</strong> instead if there were no arguments: Dad decides. This was day " + payDay(sess) + " of " + DR.pay.days + ".</li>";
        payLine = "\nPay: " + money(DR.pay.perDay) + (earned ? " unlocked" : " not unlocked yet") + ", day " + payDay(sess) + " of " + DR.pay.days;
      }
      var text = sess.title + ", " + longDate(date) + "\nSlots done: " + r.n + " of " + total +
        "\nRed: " + (r.c.red.join(", ") || "none") + "\nAmber: " + (r.c.amber.join(", ") || "none") + "\nGreen: " + (r.c.green.join(", ") || "none") +
        (r.scores.length ? "\nQuiz scores: " + r.scores.join(", ") : "") + payLine;
      return '<section class="mission complete" aria-labelledby="m-h"><p class="kicker">Done</p><h2 id="m-h">Session complete</h2>' +
        "<p>You ticked " + r.n + " of " + total + " slots." + (all ? " All of them. Respect." : "") + "</p>" +
        '<ul class="counts"><li class="count count-red">Red ' + r.c.red.length + '</li><li class="count count-amber">Amber ' + r.c.amber.length + '</li><li class="count count-green">Green ' + r.c.green.length + "</li></ul>" +
        (r.c.red.length ? "<h3>Your priority list for next time</h3><ul>" + r.c.red.map(function (k) { return "<li>" + esc(k) + "</li>"; }).join("") + "</ul>"
          : "<p>Nothing rated red. Start with your amber ones next time.</p>") +
        (pay ? "<h3>Pay</h3><ul>" + pay + "</ul>" : "") +
        '<h3>Send your results to Dad</h3><p>Copy this and send it to him.</p><div class="summary-box" id="results-text">' + esc(text) + "</div>" +
        '<button type="button" class="btn" data-copy="results-text" data-label="Copy results">Copy results</button><span class="copied" aria-live="polite"></span></section>';
    }
    function clock() {
      var st = sessionState(sess);
      main.querySelectorAll(".slot").forEach(function (li) {
        var on = st.when === "on" && +li.getAttribute("data-slot") === st.i;
        li.classList.toggle("is-now", on);
        li.querySelector(".now-slot").innerHTML = on ? '<span class="badge-now">Now</span>' : "";
        if (on) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
      });
      var box = document.getElementById("mission"), html = missionHtml(st);
      var stable = html.replace(/<p class="countdown">.*?<\/p>/, "");
      if (box.getAttribute("data-key") !== stable) { box.innerHTML = html; box.setAttribute("data-key", stable); }
      else { var cd = box.querySelector(".countdown"), fresh = html.match(/<p class="countdown">(.*?)<\/p>/); if (cd && fresh) cd.innerHTML = fresh[1]; }
      document.body.classList.toggle("focus", focus && st.when === "on");
      /* the tab title carries the countdown, for when the notebook is the tab in front */
      if (st.when === "on" && st.i >= 0) document.title = clockText(st.left) + " left, " + slotTitle(subj, st.slot, idx).split(" ")[0] + " | Dougie's Revision";
      else if (st.when === "before") document.title = "Starts in " + clockText(st.secs) + " | Dougie's Revision";
      else document.title = baseTitle;
    }
    main.addEventListener("change", function (ev) {
      var t = ev.target, d = store.read(slug), ss = store.session(d, date);
      if (t.hasAttribute("data-done")) {
        var i = +t.getAttribute("data-done");
        if (t.checked) ss.done[i] = true; else delete ss.done[i];
        store.write(slug, d);
        var li = t.closest(".slot"); li.classList.toggle("is-done", t.checked);
        li.querySelector(".done-slot").innerHTML = t.checked ? '<span class="badge-done">Done</span>' : "";
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
      if (ev.target.id === "focus-btn") { focus = !focus; store.pref("focus", focus ? "on" : "off"); document.getElementById("mission").setAttribute("data-key", ""); clock(); var fb = document.getElementById("focus-btn"); if (fb) fb.focus(); }
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
    /* keep the screen awake while a session is running (phones); fine if the browser says no */
    var lock = null;
    function wake() {
      var on = sessionState(sess).when === "on";
      try {
        if (on && !lock && navigator.wakeLock && document.visibilityState === "visible") navigator.wakeLock.request("screen").then(function (l) { lock = l; l.addEventListener("release", function () { lock = null; }); }, function () {});
        if (!on && lock) { lock.release(); lock = null; }
      } catch (e) {}
    }
    document.addEventListener("visibilitychange", wake);
    progress(); clock(); wake();
    setInterval(function () { clock(); }, 1000);
    setInterval(wake, 30000);
  }

  function pageNotFound() {
    frame(null, [{ href: BASE + "/", name: "Hub" }, { name: "Not found" }], "<h1>Page not found</h1><p>Wrong dimension, Dougie. Head back to the <a href=\"" + BASE + "/\">hub</a>.</p>", "Page not found");
  }

  /* ---------- router: works for real pages and for the 404 fallback ---------- */
  function route() {
    var path = location.pathname.slice(BASE.length).replace(/index\.html$/, "") || "/";
    var m;
    if (path === "/") return pageHub();
    if ((m = path.match(/^\/([a-z0-9-]+)\/sessions\/(\d{4}-\d{2}-\d{2})\/?$/))) return pageSession(m[1], m[2]);
    if ((m = path.match(/^\/([a-z0-9-]+)\/?$/))) return pageSubject(m[1]);
    pageNotFound();
  }
  DR.route = route;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", route); else route();
}());
