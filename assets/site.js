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

  /* ---------- Google sign-in and the shared record (Firebase), switched on by DR.firebase in data/subjects.js ----------
     Every key is kept in localStorage as well, so the site keeps working offline. On sign-in the newer copy of each key wins,
     by its _at time. Firestore rules let only Dougie's and Dad's Google accounts read or write progress/dougie. */
  var SDK = "https://www.gstatic.com/firebasejs/10.12.2/";
  var cloud = DR.cloud = {
    on: false, user: null, doc: null, timers: {},
    push: function (subject, data) {
      if (!cloud.on || !cloud.doc) return;
      clearTimeout(cloud.timers[subject]);
      cloud.timers[subject] = setTimeout(function () { var o = {}; o[subject] = JSON.stringify(data); cloud.doc.set(o, { merge: true }).catch(function () {}); }, 600);
    },
    load: function (src, cb) { var sc = document.createElement("script"); sc.src = SDK + src; sc.onload = function () { cb(); }; sc.onerror = function () { cb(new Error("sdk")); }; document.head.appendChild(sc); },
    start: function (done) {
      frame(null, null, '<p class="muted">Loading...</p>');
      cloud.load("firebase-app-compat.js", function (err) {
        if (err) return done();
        var left = 2, next = function () { if (--left) return; cloud.init(done); };
        cloud.load("firebase-auth-compat.js", next); cloud.load("firebase-firestore-compat.js", next);
      });
    },
    init: function (done) {
      var fb = window.firebase; fb.initializeApp(DR.firebase);
      var started = false;
      fb.auth().onAuthStateChanged(function (u) {
        if (!u) return cloud.gate();
        cloud.user = u; cloud.doc = fb.firestore().collection("progress").doc("dougie");
        var timer = setTimeout(function () { finish(); }, 5000);
        cloud.doc.get().then(function (snap) {
          clearTimeout(timer); cloud.merge(snap.exists ? snap.data() : {}); finish();
        }, function (e) {
          clearTimeout(timer);
          if (e && e.code === "permission-denied") { fb.auth().signOut(); return cloud.gate("That Google account isn't allowed in. Sign in with Dougie's, Dad's or Mum's Google account."); }
          finish();
        });
        function finish() { if (started) return; started = true; cloud.on = true; done(); }
      });
    },
    merge: function (remote) {
      var keys = {};
      Object.keys(remote).forEach(function (k) { keys[k] = 1; });
      try { for (var i = 0; i < localStorage.length; i++) { var lk = localStorage.key(i); if (/^dougie-revision:[a-z0-9-]+$/.test(lk)) keys[lk.split(":")[1]] = 1; } } catch (e) {}
      Object.keys(keys).forEach(function (k) {
        var r = null, l = store.read(k);
        try { r = remote[k] ? JSON.parse(remote[k]) : null; } catch (e) {}
        if (r && (r._at || 0) > (l._at || 0)) { try { localStorage.setItem(store.key(k), JSON.stringify(r)); } catch (e) {} }
        else if (l._at && (!r || l._at > (r._at || 0))) { var o = {}; o[k] = JSON.stringify(l); cloud.doc.set(o, { merge: true }).catch(function () {}); }
      });
    },
    gate: function (msg) {
      frame(null, null, '<div class="hero"><div><h1>Dougie\'s Revision</h1><p class="lede">This site is private. Sign in with Google to carry on.</p>' +
        (msg ? '<p class="note"><strong>' + esc(msg) + "</strong></p>" : "") +
        '<p><button type="button" class="btn btn-big" id="signin">Sign in with Google</button></p></div></div>', "Sign in");
      document.getElementById("signin").addEventListener("click", function () {
        var fb = window.firebase, pr = new fb.auth.GoogleAuthProvider(); pr.setCustomParameters({ prompt: "select_account" });
        fb.auth().signInWithPopup(pr).catch(function (e) { if (e && e.code !== "auth/popup-closed-by-user") cloud.gate("Sign-in didn't work. Try again. (Google said: " + (e.code || e.message) + ")"); });
      });
    }
  };

  /* ---------- saved progress: localStorage, every read and write wrapped ---------- */
  var store = DR.store = {
    key: function (subject) { return "dougie-revision:" + subject; },
    read: function (subject) {
      try { var raw = window.localStorage.getItem(store.key(subject)); return raw ? JSON.parse(raw) : {}; }
      catch (e) { return {}; }
    },
    write: function (subject, data) {
      data._at = Date.now();
      cloud.push(subject, data);
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
    function ready() { Object.keys(DR.subjects).forEach(function (k) { prep(DR.subjects[k]); }); cb(); }
    if (!left) return ready();
    slugs.forEach(function (slug) {
      if (DR.subjects[slug]) { if (!--left) ready(); return; }
      var sc = document.createElement("script");
      sc.src = BASE + "/data/" + slug + ".js" + (window.DR_V ? "?v=" + window.DR_V : "");
      sc.onload = sc.onerror = function () { if (!--left) ready(); };
      document.head.appendChild(sc);
    });
  }

  /* Sessions have a date (fixed times) or an id (flexible: slots have minutes, and the clock starts when he presses Start) */
  function prep(subj) {
    if (subj._prepped) return; subj._prepped = true;
    (subj.sessions || []).forEach(function (s) {
      s._slug = subj.slug;
      if (!s.flexible) return;
      var t = 0;
      s.slots.forEach(function (sl) { sl.off = t * 60; t += sl.mins; sl.offEnd = t * 60; });
      s.totalMins = t;
    });
  }
  function skey(s) { return s.date || s.id; }
  function slabel(s) { return s.date ? longDate(s.date) : s.title; }
  function clockOf(sess) { var d = store.read(sess._slug), ss = d.sessions && d.sessions[sess.id]; return ss && ss.clock; }
  function hrs(m) { var h = Math.floor(m / 60), r = m % 60; return (h ? h + " hour" + (h === 1 ? "" : "s") : "") + (h && r ? " " : "") + (r ? r + " minutes" : ""); }

  /* ---------- shared header, breadcrumbs and footer ---------- */
  function header(current) {
    var links = [{ href: BASE + "/", name: "Hub", slug: "" }].concat((DR.registry || []).map(function (r) { return { href: BASE + "/" + r.slug + "/", name: r.name, short: r.short, slug: r.slug }; }));
    return '<a class="skip" href="#main">Skip to content</a><header class="site-header"><div class="wrap">' +
      '<a class="brand" href="' + BASE + '/"><span class="brand-dot" aria-hidden="true"></span>Dougie\'s Revision</a><nav aria-label="Main"><ul class="nav">' +
      links.map(function (l) {
        var label = l.short ? '<span class="n-long">' + esc(l.name) + '</span><span class="n-short">' + esc(l.short) + "</span>" : esc(l.name);
        return '<li><a href="' + l.href + '"' + "" + (l.slug === current ? ' aria-current="page"' : "") + ">" + label + "</a></li>";
      }).join("") +
      "</ul></nav></div></header>";
  }
  function crumbs(items) {
    return '<nav class="crumbs" aria-label="Breadcrumb"><ol>' + items.map(function (it, i) {
      return i === items.length - 1 ? '<li><span aria-current="page">' + esc(it.name) + "</span></li>" : '<li><a href="' + it.href + '">' + esc(it.name) + "</a></li>";
    }).join("") + "</ol></nav>";
  }
  function footer() {
    if (cloud.on && cloud.user) return '<footer class="site-footer"><div class="wrap"><p>Your progress saves to your Google account, so it follows you to any device you sign in on.</p><p>Signed in as ' + esc(cloud.user.email) + '. <button type="button" class="linkbtn" id="signout">Sign out</button></p></div></footer>';
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
  function sessionsNewestFirst(subj) { return (subj.sessions || []).slice().sort(function (a, b) { if (a.flexible || b.flexible) return 0; return a.date < b.date ? 1 : -1; }); }
  function slotTitle(subj, sl, idx) {
    if (sl.type === "report") { var h = idx[sl.report]; return h ? (h.report.code === "Mixed" ? "" : h.report.code + " ") + h.report.title : sl.report; }
    if (sl.type === "check") { var u = unitByCode(subj, sl.unit); return "Unit " + sl.unit + " check" + (u ? ": " + u.title : ""); }
    if (sl.type === "practice") { var a = (subj.activities || {})[sl.activity]; return sl.title || (a ? a.title : "Practice"); }
    return sl.title;
  }
  /* Where a session stands at a moment: before, on (with the slot), or after */
  function sessionState(sess, at) {
    at = at || now();
    if (sess.flexible) {
      var c = clockOf(sess); if (!c) return { when: "ready" };
      var e = Math.floor(c.el + (c.since ? Math.max(0, at.getTime() - c.since) / 1000 : 0));
      if (e >= sess.totalMins * 60) return { when: "past" };
      for (var k = 0; k < sess.slots.length; k++) {
        var f = sess.slots[k];
        if (e >= f.off && e < f.offEnd) return { when: "on", i: k, slot: f, left: f.offEnd - e, next: sess.slots[k + 1], paused: !c.since };
      }
    }
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
    var today = todayIso(), best = null, running = null;
    slugs.forEach(function (slug) {
      var subj = DR.subjects[slug]; if (!subj) return;
      (subj.sessions || []).forEach(function (s) {
        var st = sessionState(s);
        if (s.flexible) { if (st.when === "on" && !running) running = { slug: slug, subj: subj, s: s }; return; }
        if (s.date >= today && st.when !== "past" && (!best || s.date + s.start < best.s.date + best.s.start)) best = { slug: slug, subj: subj, s: s };
      });
    });
    return running || best;
  }
  function money(n) { return (DR.pay.currency || "") + n; }
  /* Money is kept in pence and can include a half penny */
  function pounds(p) {
    var a = Math.abs(p), w = Math.floor(a), half = a - w >= 0.5;
    return (p < 0 ? "-" : "") + (DR.pay.currency || "") + (w % 100 || half ? (w / 100).toFixed(2) : w / 100) + (half ? "\u00bd" : "");
  }
  function pence(p) { var w = Math.floor(p); return (w + (p - w >= 0.5 ? "\u00bd" : "")) + "p"; }
  /* A right answer starts at 5p and goes up 2½p for every 50 questions banked. A wrong answer is always 5p off. */
  var STEP = 50;
  function prize(banked) { return 5 + 2.5 * Math.floor(banked / STEP); }
  function quizStore() { var q = store.read("wheel"); q.pence = q.pence || 0; q.banked = q.banked || {}; return q; }
  /* The money jar fills only from Dougie's Wheel of Fortune: 5p the first time each question is right, 5p off for each wrong answer.
     It is full when every question on the wheel has been banked. */
  /* The sign that shows the rule: one rung per £5 band, with where he is now and how far to the next one */
  function ladderHtml(banked, n) {
    var lvl = Math.floor(banked / STEP), rungs = Math.floor((n - 1) / STEP), out = "", toGo = (lvl + 1) * STEP - banked;
    for (var r = 0; r <= rungs; r++) {
      var here = r === lvl;
      out += '<li class="rung' + (here ? " is-now" : r < lvl ? " is-past" : "") + '"><span class="rung-band">' + (r === rungs ? r * STEP + " right and up" : r * STEP + " to " + ((r + 1) * STEP - 1) + " right") + '</span><span class="rung-prize">' + pence(5 + 2.5 * r) + " a right answer</span>" + (here ? '<span class="rung-here">You\'re here</span>' : "") + "</li>";
    }
    return '<div class="ladder"><h3>The more you get right, the more each answer is worth</h3>' +
      '<p class="ladder-next">Every right answer is worth <strong>' + pence(prize(banked)) + "</strong> now. " + (lvl < rungs ? "Get <strong>" + toGo + " more right</strong> and it goes up to <strong>" + pence(prize(banked) + 2.5) + "</strong>." : "That's the top rung.") + "</p>" +
      '<div class="ladder-bar" role="progressbar" aria-label="Right answers towards the next rung" aria-valuemin="0" aria-valuemax="' + STEP + '" aria-valuenow="' + (STEP - toGo) + '"><i style="width:' + ((STEP - toGo) / STEP * 100).toFixed(1) + '%"></i></div>' +
      '<ol class="rungs">' + out + '</ol><p class="muted">Every ' + STEP + " right answers, each one is worth 2\u00bdp more. A wrong answer always takes 5p off.</p></div>";
  }

  function jarHtml(still) {
    var q = quizStore(), n = 0;
    Object.keys(DR.subjects).forEach(function (k) { if ((registryItem(k) || {}).status === "live") n += (DR.subjects[k].quiz || []).length; });
    if (!n) return "";
    var maxP = 0; for (var m = 0; m < n; m++) maxP += prize(m);
    var totalP = Math.max(0, q.pence), f = Math.min(1, totalP / maxP), top = 40, bottom = 250, h = (bottom - top) * f, ticks = "";
    for (var t = 500; t <= maxP; t += 500) { var y = bottom - (bottom - top) * t / maxP; ticks += '<line x1="150" x2="164" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '" class="jar-tick"/><text x="170" y="' + (y + 5).toFixed(1) + '" class="jar-label">' + pounds(t) + "</text>"; }
    var banked = Object.keys(q.banked).length;
    return '<section class="card jar section' + (still ? " still" : "") + '" style="--accent-dark:#F1C40F" aria-labelledby="jar-h"><svg class="jar-svg" viewBox="0 0 230 270" role="img" aria-label="Money jar: ' + pounds(totalP) + " in the jar, " + pounds(maxP) + ' when full">' +
      '<defs><clipPath id="jar-clip"><path d="M40 40 h90 v10 q20 10 20 40 v140 q0 20 -20 20 h-90 q-20 0 -20 -20 v-140 q0 -30 20 -40 z"/></clipPath></defs>' +
      '<g clip-path="url(#jar-clip)"><g class="jar-coins"><rect class="jar-fill" x="0" y="' + (bottom - h) + '" width="170" height="' + h + '"/>' + (h ? '<rect class="jar-shine" x="0" y="' + (bottom - h) + '" width="170" height="6"/>' : "") + "</g></g>" +
      '<path class="jar-glass" d="M40 40 h90 v10 q20 10 20 40 v140 q0 20 -20 20 h-90 q-20 0 -20 -20 v-140 q0 -30 20 -40 z"/>' +
      '<rect class="jar-lid" x="34" y="22" width="102" height="20" rx="6"/>' + ticks + "</svg>" +
      '<div><h2 id="jar-h">The money jar</h2><p class="jar-total">' + pounds(totalP) + "<small>in the jar so far</small></p>" +
      "<p>The jar fills from Dougie's Wheel of Fortune. A question you get right for the first time starts at 5p, and every " + STEP + " questions you get right, each right answer is worth 2\u00bdp more. A wrong answer always takes 5p off.</p>" +
      ladderHtml(banked, n) +
      "<p>So far: " + banked + " of " + n + " questions banked" + (q.pence < 0 ? ", and the wrong answers have put you " + pounds(-q.pence) + " behind" : "") + ". Bank them all and the jar is full at " + pounds(maxP) + ".</p></div></section>";
  }



  /* ---------- Dougie's Wheel of Fortune: spin, land on a unit, answer a question ---------- */
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var k = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[k]; a[k] = t; } return a; }
  /* Pockets: one per live subject with questions (or one per unit when only one subject has them), filling 8, plus one green Mix pocket */
  function wheelPockets(live) {
    var subs = live.filter(function (sl) { return DR.subjects[sl] && (DR.subjects[sl].quiz || []).length; }), list = [];
    if (subs.length === 1) {
      var sj = DR.subjects[subs[0]], units = sj.units.map(function (u) { return u.code; }).filter(function (c) { return sj.quiz.some(function (q) { return q[0] === c; }); });
      units.forEach(function (c) { list.push({ label: c, slug: subs[0], unit: c }); });
    } else subs.forEach(function (sl) { var r = registryItem(sl); list.push({ label: r.wheel || r.short || r.name, slug: sl }); });
    if (!list.length) return [];
    var out = [];
    while (out.length < 8) out = out.concat(list);
    out = out.slice(0, Math.max(8, list.length));
    out.splice(Math.ceil(out.length / 2), 0, { label: "Mix" });
    return out;
  }
  var POCKETS = [];
  function wheelSvg() {
    var n = POCKETS.length, seg = 360 / n, out = "", red = true;
    POCKETS.forEach(function (pk, i) { var lab = pk.label;
      var a0 = (i * seg - 90) * Math.PI / 180, a1 = ((i + 1) * seg - 90) * Math.PI / 180, R = 88, r = 38;
      var p = function (rad, a) { return (100 + rad * Math.cos(a)).toFixed(2) + " " + (100 + rad * Math.sin(a)).toFixed(2); };
      var cls = lab === "Mix" ? "pk-green" : (red ? "pk-red" : "pk-black"); if (lab !== "Mix") red = !red;
      var mid = (i + 0.5) * seg;
      out += '<path class="' + cls + '" d="M' + p(r, a0) + " L" + p(R, a0) + " A" + R + " " + R + " 0 0 1 " + p(R, a1) + " L" + p(r, a1) + " A" + r + " " + r + ' 0 0 0 ' + p(r, a0) + 'z"/>' +
        '<text class="pk-label' + (lab === "Mix" ? " pk-label-dark" : "") + '" x="100" y="32" transform="rotate(' + mid + ' 100 100)">' + lab + "</text>";
    });
    var bolts = "";
    for (var b = 0; b < n; b++) { var ba = (b * seg - 90) * Math.PI / 180; bolts += '<circle class="wheel-bolt" r="2.4" cx="' + (100 + 93 * Math.cos(ba)).toFixed(2) + '" cy="' + (100 + 93 * Math.sin(ba)).toFixed(2) + '"/>'; }
    var arms = [0, 120, 240].map(function (d) { return '<path class="wheel-arm" d="M100 100 q 15 -2 20 -22 q 3 -7 9 -9" transform="rotate(' + d + ' 100 100)"/>'; }).join("");
    return '<svg viewBox="0 0 200 200" aria-hidden="true" focusable="false"><defs><radialGradient id="portal-grad"><stop offset="0" stop-color="#2ECC71"/><stop offset=".6" stop-color="#2ECC71"/><stop offset="1" stop-color="#16A085"/></radialGradient><clipPath id="hub-clip"><circle cx="100" cy="100" r="35"/></clipPath></defs>' +
      '<circle cx="100" cy="100" r="97" class="wheel-rim"/>' +
      '<g class="wheel-spin">' + out + bolts + '<circle cx="100" cy="100" r="38" class="wheel-hub"/><g clip-path="url(#hub-clip)"><g class="wheel-swirl">' + arms + "</g></g></g>" +
      '<path d="M91 0 L109 0 L100 18 z" class="wheel-pointer"/></svg>';
  }
  function wheelInit(live) {
    var btn = document.getElementById("wheel"), dlg = document.getElementById("wheel-q"); if (!btn || !dlg) return;
    var spinG = btn.parentNode.querySelector(".wheel-spin"), turn = 0, lastQ = null, units = {};
    var bank = [];
    live.forEach(function (slug) { var sj = DR.subjects[slug]; if (!sj) return; units[slug] = {}; (sj.units || []).forEach(function (u) { units[slug][u.code] = u; }); (sj.quiz || []).forEach(function (q) { bank.push({ slug: slug, q: q }); }); });
    if (!bank.length) { btn.parentNode.hidden = true; return; }
    var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    btn.addEventListener("click", function () {
      if (btn.disabled) return;
      btn.disabled = true;
      var k = Math.floor(Math.random() * POCKETS.length), seg = 360 / POCKETS.length, jitter = (Math.random() - 0.5) * seg * 0.6;
      var target = 360 - (k * seg + seg / 2) + jitter;
      turn = turn - (turn % 360) + 360 * 5 + target;
      spinG.style.transform = "rotate(" + turn + "deg)";
      setTimeout(function () { btn.disabled = false; ask(POCKETS[k]); }, still ? 200 : 4200);
    });
    var multi = POCKETS.some(function (pk) { return pk.slug && !pk.unit; });
    function ask(pocket) {
      var pool = bank.filter(function (b) { return (!pocket.slug || (b.slug === pocket.slug && (!pocket.unit || b.q[0] === pocket.unit))) && b.q[1] !== lastQ; });
      var pick = pool[Math.floor(Math.random() * pool.length)], q = pick.q, u = units[pick.slug][q[0]], reg = registryItem(pick.slug);
      lastQ = q[1];
      var opts = shuffle(q.slice(2, 6));
      dlg.innerHTML = '<p class="kicker">' + (!pocket.slug ? "Mix: anything. This one is " : "") + (multi || !pocket.slug ? esc(reg.name) + ", " : "") + "Unit " + esc(q[0]) + (u ? ": " + esc(u.title) : "") + '</p><h2 id="wheel-q-h">' + esc(q[1]) + "</h2>" +
        '<div class="quiz-opts">' + opts.map(function (o) { return '<button type="button" class="quiz-opt" data-right="' + (o === q[2] ? "1" : "0") + '">' + esc(o) + "</button>"; }).join("") + "</div>" +
        '<p class="quiz-result" aria-live="polite"></p><div class="btn-row"><button type="button" class="btn" data-act="again" hidden>Spin again</button><button type="button" class="btn btn-ghost" data-act="close">Close</button></div>';
      dlg.showModal();
      dlg.querySelector(".quiz-opt").focus();
      dlg.onclick = function (ev) {
        var act = ev.target.closest("[data-act]");
        if (act) { dlg.close(); if (act.getAttribute("data-act") === "again") btn.click(); return; }
        var b = ev.target.closest(".quiz-opt"); if (!b || dlg.querySelector(".quiz-opt[disabled]")) return;
        var right = b.getAttribute("data-right") === "1", st = quizStore(), msg;
        var before = Object.keys(st.banked).length, win = prize(before);
        if (right && !st.banked[q[1]]) {
          st.banked[q[1]] = true; st.pence += win; msg = "Right! " + pence(win) + " goes in the jar.";
          if ((before + 1) % STEP === 0) msg += " That's " + (before + 1) + " right, so every right answer is now worth " + pence(prize(before + 1)) + ".";
        }
        else if (right) msg = "Right! You've already banked this one, so nothing goes in this time.";
        else { st.pence -= 5; msg = "Not this time. 5p comes out of the jar. The answer is: " + q[2]; }
        store.write("wheel", st);
        [].forEach.call(dlg.querySelectorAll(".quiz-opt"), function (o) {
          o.disabled = true;
          if (o.getAttribute("data-right") === "1") { o.classList.add("is-right"); o.insertAdjacentHTML("afterbegin", '<span class="tag">Right answer</span>'); }
          else if (o === b) { o.classList.add("is-wrong"); o.insertAdjacentHTML("afterbegin", '<span class="tag">Your answer</span>'); }
        });
        var res = dlg.querySelector(".quiz-result"); res.textContent = msg; res.className = "quiz-result " + (right ? "good" : "bad");
        var again = dlg.querySelector('[data-act="again"]'); again.hidden = false; again.focus();
        var jarEl = document.querySelector(".jar"); if (jarEl) jarEl.outerHTML = jarHtml(true);
        var wp = document.getElementById("wheel-prize"); if (wp) wp.textContent = pence(prize(Object.keys(st.banked).length));
      };
    }
  }

  /* ---------- hub ---------- */
  function pageHub() {
    var live = (DR.registry || []).filter(function (r) { return r.status === "live"; }).map(function (r) { return r.slug; });
    loadSubjects(live, function () {
      POCKETS = wheelPockets(live);
      var cards = (DR.registry || []).map(function (r) {
        var subj = DR.subjects[r.slug], liveCard = r.status === "live" && subj;
        var reports = liveCard ? subj.units.reduce(function (n, u) { return n + u.reports.length; }, 0) : 0;
        return '<article class="card subject-card" style="--accent-dark:' + r.accent + ";--tint:" + r.tint + '"><h2>' + esc(r.name) + "</h2>" +
          (liveCard ? "<p>" + esc(r.blurb) + ". " + reports + " reports in the notebook" + (subj.notebook ? "" : "s") + ".</p>" + '<a class="btn" href="' + BASE + "/" + r.slug + '/">Open ' + esc(r.name) + "</a>"
            : '<p><span class="chip">Coming soon</span></p><p>Not yet. Enjoy it while it lasts.</p>') + "</article>";
      }).join("");
      frame("", null,
        '<div class="hero"><div><h1>Right then, Dougie.</h1><p class="lede">This is your revision lab. The plan, the timer and the money jar are all in here, so there\'s nothing to work out. Turn up, do the thing on screen, move on when the timer says so.</p></div><div class="wheel-wrap"><div class="wheel">' + wheelSvg() + '<button type="button" class="wheel-btn" id="wheel" aria-label="SPIN Dougie\'s Wheel of Fortune for a question">SPIN</button></div><p class="wheel-cap"><strong>Dougie\'s Wheel of Fortune</strong><br>Tap to spin. Right first time: +<span id="wheel-prize">' + pence(prize(Object.keys(quizStore().banked).length)) + '</span>. Wrong: 5p off.</p></div></div>' +
        '<dialog class="quiz" id="wheel-q" aria-labelledby="wheel-q-h"></dialog>' +
        '<div id="hub-now" aria-live="polite"></div>' +
        jarHtml() +
        '<section class="section" aria-labelledby="subjects-h"><h2 id="subjects-h">Your subjects</h2><div class="grid grid-3">' + cards + "</div></section>");
      function tick() {
        var box = document.getElementById("hub-now"); if (!box) return;
        var n = nextSession(live), html = "";
        if (n) {
          var st = sessionState(n.s), href = BASE + "/" + n.slug + "/sessions/" + skey(n.s) + "/";
          if (st.when === "on" && st.i >= 0) {
            html = '<section class="mission section" aria-labelledby="hub-h"><p class="kicker">' + (n.s.flexible ? (st.paused ? "Your session is paused" : "Your session is running") : "Today\'s session is running") + '</p><h2 id="hub-h">You\'re on ' + esc(slotTitle(n.subj, st.slot, reportIndex(n.subj))) + '</h2><p class="countdown">' + clockText(st.left) + "<small>left</small></p>" +
              '<a class="btn btn-big" href="' + href + '">Back to it</a></section>';
          } else if (st.when === "before") {
            html = '<section class="mission section" aria-labelledby="hub-h"><p class="kicker">Today\'s session</p><h2 id="hub-h">' + esc(n.s.title) + "</h2><p>" + longDate(n.s.date) + ", " + range(n.s.start, n.s.end) + '</p><p class="countdown">' + clockText(st.secs) + "<small>until it starts</small></p>" +
              '<a class="btn btn-big" href="' + href + '">Start</a>' + "</section>";
          } else if (st.when === "future") {
            html = '<section class="mission section" aria-labelledby="hub-h"><p class="kicker">Next session</p><h2 id="hub-h">' + esc(n.s.title) + '</h2><p class="lede">' + longDate(n.s.date) + ", " + range(n.s.start, n.s.end) + '</p><div class="btn-row"><a class="btn" href="' + href + '">See the plan</a></div>' + "</section>";
          } else {
            html = '<section class="mission section" aria-labelledby="hub-h"><p class="kicker">Today\'s session</p><h2 id="hub-h">' + esc(n.s.title) + '</h2><p>Between slots.</p><a class="btn btn-big" href="' + href + '">Open the session</a></section>';
          }
        }
        if (box.getAttribute("data-html") !== html) { box.innerHTML = html; box.setAttribute("data-html", html); }
      }
      tick(); setInterval(tick, 1000);
      wheelInit(live);
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
        return '<li class="card" style="--accent-dark:' + reg.accent + '"><a href="' + BASE + "/" + slug + "/sessions/" + skey(s) + '/"><strong>' + esc(s.title) + "</strong><span>" + (s.flexible ? "Do it when you're ready. About " + hrs(s.totalMins) + "." : longDate(s.date) + ", " + range(s.start, s.end)) + "</span></a></li>";
      }).join("");
      frame(slug, [{ href: BASE + "/", name: "Hub" }, { name: subj.name }],
        '<div class="hero"><div><h1>' + esc(subj.heading) + '</h1><p class="lede">' + esc(subj.paper) + '</p>' + (subj.notebook ? '<p><a class="btn btn-big" href="' + esc(subj.notebook) + '" target="_blank" rel="noopener">Open the ' + esc(subj.name) + " Notebook</a></p>" : (subj.sessions || []).filter(function (x) { return x.notebook; }).map(function (x) { return '<a class="btn btn-big" href="' + esc(x.notebook) + '" target="_blank" rel="noopener">Open the ' + esc(x.short) + " Notebook</a>"; }).join(" ")) + "</div></div>" +
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
      var sess = (subj.sessions || []).filter(function (s) { return skey(s) === date; })[0];
      if (!sess) return pageNotFound();
      var idx = reportIndex(subj);
      var data = store.read(slug), ss = (data.sessions && data.sessions[date]) || { done: {}, reports: {} };
      var breaks = (sess.breaks || []).map(function (b) { return "break " + range(b.start, b.end); }).join(", ");
      var howTo = sess.howTo || subj.howTo || [];
      var breakMins = sess.flexible ? sess.slots.filter(function (x) { return x.type === "break"; }).reduce(function (n, x) { return n + x.mins; }, 0) : 0;
      var times = sess.flexible ? "About " + hrs(sess.totalMins) + (breakMins ? ", including a " + breakMins + " minute break" : "") + ". Start it whenever you're ready."
        : longDate(date) + ", " + range(sess.start, sess.end) + (breaks ? ", " + breaks : "");
      frame(slug, [{ href: BASE + "/", name: "Hub" }, { href: BASE + "/" + slug + "/", name: subj.name }, { name: sess.flexible ? sess.short || sess.title : longDate(date) }],
        '<div class="hero session-head"><div><h1>' + esc(sess.title) + '</h1><p class="times">' + times + '</p></div><div class="portal" aria-hidden="true"></div></div>' +
        '<div id="mission" class="section" aria-live="polite"></div>' +
        '<details class="panel howto section" open><summary>How this works</summary><ol>' + howTo.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ol></details>" +
        ((sess.notebook || subj.notebook) ? '<div class="section nb-row no-print"><a class="btn btn-big" href="' + esc(sess.notebook || subj.notebook) + '" target="_blank" rel="noopener">Open the ' + esc(sess.short || subj.name) + " Notebook</a></div>" : "") +
        '<section class="section" aria-labelledby="tl-h"><h2 id="tl-h">Timeline</h2>' +
        '<div class="progress"><div class="bar" role="progressbar" aria-label="Slots done" aria-valuemin="0" aria-valuemax="' + countable(sess) + '" aria-valuenow="0"><i></i></div><p id="prog-text" aria-live="polite"></p></div>' +
        '<ol class="timeline">' + sess.slots.map(function (sl, i) { return slotHtml(subj, sess, sl, i, idx, ss); }).join("") + "</ol></section>" +
        '<div class="reset no-print"><button type="button" class="linkbtn" id="reset">Reset this session</button><div class="confirm" id="reset-confirm" hidden><span>This clears your ticks, ratings and scores for this session. Are you sure?</span><button type="button" class="btn" id="reset-yes">Yes, reset</button><button type="button" class="btn btn-ghost" id="reset-no">Cancel</button></div></div>',
        sess.flexible ? sess.title : sess.title + ", " + longDate(date));
      bindSession(slug, subj, sess, idx);
    });
  }
  function countable(sess) { return sess.slots.filter(function (s) { return s.type !== "break"; }).length; }
  function dur(sl) { return (sl.mins || (mins(sl.end) - mins(sl.start))) + " min"; }
  function promptHtml(id, text, label, note) {
    return '<div class="prompt"><p class="label">' + esc(label) + '</p><p id="' + id + '">' + esc(text) + '</p>' +
      '<button type="button" class="btn" data-copy="' + id + '">Copy</button><span class="copied" aria-live="polite"></span></div><p class="muted">' + esc(note) + "</p>";
  }
  function slotHtml(subj, sess, sl, i, idx, ss) {
    var u, code = "", focus = "", extra = "", isDone = !!ss.done[i];
    if (sl.type === "report") {
      var hit = idx[sl.report] || {}; u = hit.unit; var r = hit.report || { code: sl.report, title: sl.report, focus: "" }, nb = sess.notebook || subj.notebook;
      code = r.code === "Mixed" ? "" : r.code; focus = r.focus;
      var saved = ss.reports[r.code] || {};
      extra = '<p class="find">' + (r.link ? '<a class="btn btn-ghost" href="' + esc(r.link) + '" target="_blank" rel="noopener">Open ' + esc(r.code === "Mixed" ? r.title : r.code) + "</a>"
        : nb ? '<a class="btn btn-ghost" href="' + esc(nb) + '" target="_blank" rel="noopener">Open the notebook</a><span>In the Studio panel, look for <strong>' + esc(r.lookFor || r.code) + "</strong>.</span>"
        : "<span>Dad's still setting this report up in the notebook.</span>") + "</p>" +
        (sl.prompt ? promptHtml("p-" + i, sl.prompt, "End of session check", subj.checkNote) : "") +
        '<div class="after" data-after="' + i + '"' + (isDone ? "" : " hidden") + ">" + rating("rate-" + i, saved.rating) + '<p style="margin-top:12px">' + scoreBox("score-" + i, saved.score) + "</p></div>";
    } else if (sl.type === "practice") {
      u = unitByCode(subj, sl.unit);
      extra = actHtml(subj, sl, i, ss);
    } else if (sl.type === "check") {
      u = unitByCode(subj, sl.unit);
      extra = promptHtml("p-" + i, subj.checkPrompt.replace("{unit}", sl.unit + " " + (u ? u.title : "")), "Unit check prompt", subj.checkNote);
    }
    var style = u ? unitStyle(u) : (sl.type === "break" ? ' style="--accent-dark:#95A5A6"' : ' style="--accent-dark:#ECF0F1"');
    var done = sl.type === "break" ? "" : '<label class="done"><input type="checkbox" data-done="' + i + '"' + (isDone ? " checked" : "") + "> Done</label>";
    var chip = code ? '<span class="chip">' + esc(code) + "</span>" : (u ? '<span class="chip">' + esc(u.code === "Mixed" ? "Mixed" : "Unit " + u.code) + "</span>" : "");
    return '<li class="card slot slot-' + sl.type + (isDone ? " is-done" : "") + '"' + style + ' id="slot-' + i + '" data-slot="' + i + '">' +
      '<div class="slot-top"><span class="slot-time">' + (sl.start ? range(sl.start, sl.end) : "Slot " + (i + 1)) + '</span><span class="slot-dur">' + dur(sl) + "</span>" + chip +
      '<span class="now-slot"></span><span class="done-slot">' + (isDone ? '<span class="badge-done">Done</span>' : "") + "</span></div>" +
      "<h3>" + esc(sl.type === "report" ? (idx[sl.report] ? idx[sl.report].report.title : sl.report) : slotTitle(subj, sl, idx)) + "</h3>" + (focus ? "<p>" + esc(focus) + "</p>" : "") + (sl.note ? '<p class="note">' + esc(sl.note) + "</p>" : "") +
      extra + done + "</li>";
  }

  function bindSession(slug, subj, sess, idx) {
    var main = document.getElementById("main"), date = skey(sess), total = countable(sess);
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
      if (h && !h.report.link && (sess.notebook || subj.notebook)) list = ["Open the notebook and find " + (h.report.lookFor || h.report.code) + " in the Studio panel."].concat(list);
      return list;
    }
    function missionLink(sl) {
      var h = sl.type === "report" && idx[sl.report];
      if (h && h.report.link) return '<a class="btn" href="' + esc(h.report.link) + '" target="_blank" rel="noopener">Open ' + esc(h.report.code === "Mixed" ? h.report.title : h.report.code) + "</a>";
      var nb = sess.notebook || subj.notebook;
      return nb ? '<a class="btn" href="' + esc(nb) + '" target="_blank" rel="noopener">Open the notebook</a>' : "";
    }
    function missionHtml(st) {
      if (st.when === "ready") return '<section class="mission" aria-labelledby="m-h"><p class="kicker">Ready when you are</p><h2 id="m-h">' + esc(sess.title) + "</h2><p>This one takes about " + hrs(sess.totalMins) + ". Press Start when you're sat down with a drink, a pen and some paper. The timer runs from then, and you can pause it if you need to stop.</p>" +
        '<button type="button" class="btn btn-big" id="clock-start">Start</button></section>';
      if (st.when === "future") return '<section class="mission" aria-labelledby="m-h"><p class="kicker">Next session</p><h2 id="m-h">' + longDate(date) + ", " + sess.start + '</h2><p>Have a look through the plan below so nothing surprises you. When it starts, this box tells you exactly what to do and how long you\'ve got.</p></section>';
      if (st.when === "before") return '<section class="mission" aria-labelledby="m-h"><p class="kicker">Today</p><h2 id="m-h">Starts at ' + sess.start + '</h2><p class="countdown">' + clockText(st.secs) + "<small>to go</small></p><p>Get a drink, get your calculator, and get the notebook open.</p></section>";
      if (st.when === "past") return completeHtml();
      if (st.i < 0) return "";
      var sl = st.slot, title = slotTitle(subj, sl, idx), isBreak = sl.type === "break";
      var nextLine = st.next ? '<p class="next">Next: <strong>' + esc(slotTitle(subj, st.next, idx)) + "</strong> at " + st.next.start + "</p>" : '<p class="next">This is the last one. Finish strong.</p>';
      if (sess.flexible) nextLine = st.next ? '<p class="next">Next: <strong>' + esc(slotTitle(subj, st.next, idx)) + "</strong>, " + dur(st.next) + "</p>" : '<p class="next">This is the last one. Finish strong.</p>';
      var controls = sess.flexible ? '<div class="btn-row clock-row">' + (st.paused ? '<button type="button" class="btn" id="clock-resume">Carry on</button>' : '<button type="button" class="btn btn-ghost" id="clock-pause">Pause</button>') +
        '<button type="button" class="btn btn-ghost" id="clock-skip">' + (st.next ? "Done early? Next slot" : "Finish the session") + "</button></div>" : "";
      return '<section class="mission" aria-labelledby="m-h"><p class="kicker">' + (st.paused ? "Paused" : isBreak ? "Break" : "Right now") + '</p><h2 id="m-h">' + esc(title) + '</h2>' +
        '<p class="countdown">' + clockText(st.left) + "<small>" + (st.paused ? "left, paused" : isBreak ? "until you're back on" : "left on this one") + "</small></p>" + controls +
        (sl.note ? '<p class="note"><strong>' + esc(sl.note) + "</strong></p>" : "") +
        '<ol class="steps">' + steps(sl).map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ol>" +
        ((sl.type === "report" || sl.type === "practice") && subj.stuck ? '<div class="stuck"><p class="stuck-h">' + esc(subj.stuck.title) + "</p><ol>" + subj.stuck.lines.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ol>" + (subj.stuck.dad ? '<p class="stuck-dad">' + esc(subj.stuck.dad) + "</p>" : "") + "</div>" : "") +
        '<div class="btn-row">' + (isBreak ? "" : (sl.type === "practice" ? '<a class="btn" href="#slot-' + st.i + '">Go to the practice</a>' : missionLink(sl) + '<a class="btn btn-ghost" href="#slot-' + st.i + '">Go to this slot</a>')) +
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
      var practice = [];
      sess.slots.forEach(function (s, i) { if (s.type !== "practice") return; var p = (ss.practice || {})[i] || {}; practice.push(slotTitle(subj, s, idx).replace(/^Practice: /, "") + ": " + (p.ok ? "got it right" : p.shown ? "answers shown" : "not done yet")); });
      return { n: n, c: c, scores: scores, missing: missing, practice: practice };
    }
    function completeHtml() {
      var r = results(), all = r.n === total;
      var text = sess.title + (sess.flexible ? "" : ", " + longDate(date)) + "\nSlots done: " + r.n + " of " + total +
        "\nRed: " + (r.c.red.join(", ") || "none") + "\nAmber: " + (r.c.amber.join(", ") || "none") + "\nGreen: " + (r.c.green.join(", ") || "none") +
        (r.scores.length ? "\nQuiz scores: " + r.scores.join(", ") : "") + (r.practice.length ? "\nPractice: " + r.practice.join(", ") : "");
      return '<section class="mission complete" aria-labelledby="m-h"><p class="kicker">Done</p><h2 id="m-h">Session complete</h2>' +
        "<p>You ticked " + r.n + " of " + total + " slots." + (all ? " All of them. Respect." : "") + "</p>" +
        '<div class="stuck send-dad"><p class="stuck-h">First, send your results to Dad</p><p>Press the button, then send the message to Dad on WhatsApp or by text.</p>' +
        '<button type="button" class="btn btn-big" id="send-dad">Send my results to Dad</button><p class="send-note" id="send-dad-note" aria-live="polite"></p></div>' +
        '<ul class="counts"><li class="count count-red">Red ' + r.c.red.length + '</li><li class="count count-amber">Amber ' + r.c.amber.length + '</li><li class="count count-green">Green ' + r.c.green.length + "</li></ul>" +
        (r.c.red.length ? "<h3>Your priority list for next time</h3><ul>" + r.c.red.map(function (k) { return "<li>" + esc(k) + "</li>"; }).join("") + "</ul>"
          : "<p>Nothing rated red. Start with your amber ones next time.</p>") +
        '<h3>What Dad gets</h3><div class="summary-box" id="results-text">' + esc(text) + "</div>" +
        '<button type="button" class="btn btn-ghost" data-copy="results-text" data-label="Copy results">Copy results</button><span class="copied" aria-live="polite"></span></section>';
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
      if (ev.target.id === "send-dad") {
        var msg = document.getElementById("results-text").textContent, note = document.getElementById("send-dad-note");
        if (navigator.share) { navigator.share({ title: "Dougie's results", text: msg }).catch(function () {}); return; }
        var ok = function () { note.textContent = "Copied. Now open a message to Dad and paste it in."; }, no = function () { note.textContent = "That didn't copy. Use the Copy results button further down."; };
        try { navigator.clipboard.writeText(msg).then(ok, no); } catch (e) { no(); }
        return;
      }
      if (/^clock-/.test(ev.target.id)) {
        var dc = store.read(slug), sc = store.session(dc, date), t0 = Date.now(), cs = sessionState(sess);
        if (ev.target.id === "clock-start") sc.clock = { el: 0, since: t0, first: t0 };
        var c = sc.clock;
        if (c) {
          var el = c.el + (c.since ? (t0 - c.since) / 1000 : 0);
          if (ev.target.id === "clock-pause") { c.el = el; c.since = null; }
          if (ev.target.id === "clock-resume") c.since = t0;
          if (ev.target.id === "clock-skip" && cs.when === "on") { c.el = cs.next ? cs.next.off : sess.totalMins * 60; if (c.since) c.since = t0; }
          store.write(slug, dc);
        }
        document.getElementById("mission").setAttribute("data-key", ""); clock(); wake();
        var f = document.querySelector("#mission button"); if (f) f.focus();
        return;
      }
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
    bindPractice(main, slug, subj, sess, date);
    progress(); clock(); wake();
    setInterval(function () { clock(); }, 1000);
    setInterval(wake, 30000);
  }

  /* ---------- practice activities: trace tables, truth tables, sorts, binary search, Python ---------- */
  function boolEval(expr, env) {
    var t = expr.match(/\(|\)|[A-Za-z]+/g) || [], p = 0;
    function or() { var v = and(); while (t[p] === "OR") { p++; var r = and(); v = v || r; } return v; }
    function and() { var v = not(); while (t[p] === "AND") { p++; var r = not(); v = v && r; } return v; }
    function not() { if (t[p] === "NOT") { p++; return !not(); } return atom(); }
    function atom() { if (t[p] === "(") { p++; var v = or(); p++; return v; } return !!env[t[p++]]; }
    return or() ? 1 : 0;
  }
  function sortStates(alg, list) {
    var a = list.slice(), out = [], n = a.length, j, k;
    if (alg === "bubble") { var sw; do { sw = false; for (j = 0; j < n - 1; j++) if (a[j] > a[j + 1]) { k = a[j]; a[j] = a[j + 1]; a[j + 1] = k; sw = true; } if (sw) out.push(a.slice()); } while (sw); }
    if (alg === "insertion") for (var i = 1; i < n; i++) { k = a[i]; j = i - 1; while (j >= 0 && a[j] > k) { a[j + 1] = a[j]; j--; } a[j + 1] = k; out.push(a.slice()); }
    if (alg === "merge") for (var w = 1; w < n; w *= 2) { for (var lo = 0; lo < n; lo += 2 * w) { var L = a.slice(lo, lo + w), R = a.slice(lo + w, lo + 2 * w), m = []; while (L.length && R.length) m.push(L[0] <= R[0] ? L.shift() : R.shift()); m = m.concat(L, R); for (j = 0; j < m.length; j++) a[lo + j] = m[j]; } out.push(a.slice()); }
    return out;
  }
  function binarySteps(list, target) {
    var lo = 0, hi = list.length - 1, out = [];
    while (lo <= hi) { var mid = Math.floor((lo + hi) / 2); out.push(list[mid]); if (list[mid] === target) break; if (list[mid] < target) lo = mid + 1; else hi = mid - 1; }
    return out;
  }
  /* Every activity becomes rows of labelled answer boxes with their expected answers */
  function actModel(a) {
    if (a.kind === "trace") return { cols: a.columns, rows: a.rows.map(function (r, i) { return { label: "Row " + (i + 1), cells: r }; }) };
    if (a.kind === "truth") {
      var n = a.inputs.length, rows = [];
      for (var r = 0; r < Math.pow(2, n); r++) { var env = {}, given = []; a.inputs.forEach(function (x, k) { var b = (r >> (n - 1 - k)) & 1; env[x] = b; given.push(String(b)); }); rows.push({ given: given, cells: [String(boolEval(a.expr, env))] }); }
      return { cols: a.inputs.concat([a.output || "P"]), given: n, rows: rows };
    }
    if (a.kind === "sort") { var lab = { bubble: "After pass ", insertion: "After step ", merge: "After merge stage " }[a.algorithm]; return { cols: ["The list"], rows: sortStates(a.algorithm, a.list).map(function (st, i) { return { label: lab + (i + 1), cells: [st.join(", ")] }; }) }; }
    if (a.kind === "binary") return { cols: ["Item checked"], rows: binarySteps(a.list, a.target).map(function (v, i) { return { label: "Step " + (i + 1), cells: [String(v)] }; }) };
    return null;
  }
  function norm(v) { return String(v == null ? "" : v).toLowerCase().replace(/["'\[\]]/g, "").replace(/\s*,\s*/g, ",").replace(/\s+/g, " ").trim(); }
  function actHtml(subj, sl, i, ss) {
    var a = (subj.activities || {})[sl.activity]; if (!a) return "";
    var saved = (ss.practice || {})[i] || {}, v = saved.v || {};
    var head = '<div class="act" data-act="' + i + '">' + (a.intro ? "<p>" + esc(a.intro) + "</p>" : "") + (a.code ? '<pre class="code">' + esc(a.code) + "</pre>" : "") +
      (a.kind === "sort" || a.kind === "binary" ? '<p class="act-list">The list: <strong>' + esc(a.list.join(", ")) + "</strong>" + (a.kind === "binary" ? ". Looking for <strong>" + esc(a.target) + "</strong>" : "") + "</p>" : "");
    var foot = '<div class="btn-row"><button type="button" class="btn" data-check="' + i + '">' + (a.kind === "python" ? "Run and check" : "Check") + '</button><button type="button" class="linkbtn" data-show="' + i + '">' + (a.kind === "python" && (saved.ok || saved.shown) ? "Hide the answers" : "Show the answers") + '</button><button type="button" class="linkbtn" data-clear="' + i + '">' + (a.kind === "python" ? "Start the code again" : "Clear and try again") + '</button></div><p class="act-result" aria-live="polite">' + (saved.ok ? "Done: you got it right." : "") + "</p>";
    if (a.kind === "python") {
      return head + "<p>" + esc(a.task) + '</p><label class="sr-only" for="code-' + i + '">Your Python code</label><textarea class="code-box" id="code-' + i + '" spellcheck="false" autocapitalize="off" autocomplete="off" rows="10">' + esc(saved.code != null ? saved.code : a.starter || "") + "</textarea>" +
        '<pre class="py-out" id="out-' + i + '" hidden></pre>' + foot + '<details class="erl"' + (saved.ok || saved.shown ? "" : " hidden") + '><summary>The same thing in OCR Exam Reference Language</summary><pre class="code">' + esc(a.erl) + "</pre>" + (a.answer ? '<p class="label">One way to write it in Python</p><pre class="code">' + esc(a.answer) + "</pre>" : "") + "</details></div>";
    }
    var m = actModel(a), body = '<div class="table-wrap"><table class="act-table"><thead><tr>' + (m.given ? "" : '<th scope="col"><span class="sr-only">Row</span></th>') + m.cols.map(function (c) { return '<th scope="col">' + esc(c) + "</th>"; }).join("") + "</tr></thead><tbody>";
    m.rows.forEach(function (r, ri) {
      body += "<tr>" + (m.given ? r.given.map(function (g) { return '<td class="given">' + g + "</td>"; }).join("") : '<th scope="row">' + esc(r.label) + "</th>");
      r.cells.forEach(function (c, ci) {
        var id = ri + "-" + ci, lab = (m.given ? "Row " + (ri + 1) : r.label) + ", " + m.cols[(m.given || 0) + ci];
        body += '<td><input type="text" class="cell' + (a.kind === "sort" ? " wide" : "") + '" data-cell="' + id + '" aria-label="' + esc(lab) + '" value="' + esc(v[id] || "") + '" autocomplete="off" autocapitalize="off" spellcheck="false"' + (a.kind === "truth" ? ' inputmode="numeric" maxlength="1"' : "") + "></td>";
      });
      body += "</tr>";
    });
    return head + body + "</tbody></table></div>" + foot + "</div>";
  }
  /* Python runs in a worker, so a loop that never ends can be stopped */
  var py = { worker: null, ready: false, wait: [] };
  function pyRun(code, tests, cb) {
    if (!py.worker) { py.worker = new Worker(BASE + "/assets/py-worker.js?v=" + (window.DR_V || "")); py.worker.onmessage = function (e) { var f = py.cb; py.cb = null; clearTimeout(py.timer); if (f) f(e.data); }; }
    py.cb = cb;
    clearTimeout(py.timer);
    py.timer = setTimeout(function () { if (!py.cb) return; py.worker.terminate(); py.worker = null; var f = py.cb; py.cb = null; f({ timeout: true }); }, py.started ? 8000 : 60000);
    py.worker.postMessage({ code: code, tests: tests }); py.started = true;
  }
  function bindPractice(main, slug, subj, sess, date) {
    function save(i, patch) { var d = store.read(slug), ss = store.session(d, date); ss.practice = ss.practice || {}; ss.practice[i] = Object.assign(ss.practice[i] || {}, patch); store.write(slug, d); }
    function vals(box) { var o = {}; [].forEach.call(box.querySelectorAll("[data-cell]"), function (c) { o[c.getAttribute("data-cell")] = c.value; }); return o; }
    main.addEventListener("input", function (ev) {
      var box = ev.target.closest(".act"); if (!box) return;
      var i = +box.getAttribute("data-act");
      if (ev.target.classList.contains("cell")) { ev.target.classList.remove("ok", "bad"); save(i, { v: vals(box) }); }
      if (ev.target.classList.contains("code-box")) save(i, { code: ev.target.value });
    });
    main.addEventListener("keydown", function (ev) {
      if (ev.key !== "Tab" || !ev.target.classList.contains("code-box") || ev.shiftKey) return;
      var t = ev.target, a = t.selectionStart; ev.preventDefault();
      t.value = t.value.slice(0, a) + "    " + t.value.slice(t.selectionEnd); t.selectionStart = t.selectionEnd = a + 4; save(+t.closest(".act").getAttribute("data-act"), { code: t.value });
    });
    main.addEventListener("click", function (ev) {
      var b = ev.target.closest("[data-check],[data-show],[data-clear]"); if (!b) return;
      var i = +(b.getAttribute("data-check") || b.getAttribute("data-show") || b.getAttribute("data-clear")), sl = sess.slots[i], a = subj.activities[sl.activity], box = main.querySelector('[data-act="' + i + '"]'), res = box.querySelector(".act-result");
      var show = b.hasAttribute("data-show");
      if (b.hasAttribute("data-clear")) {
        if (a.kind === "python") { var t = box.querySelector(".code-box"); t.value = a.starter || ""; box.querySelector(".py-out").hidden = true; save(i, { code: t.value }); t.focus(); }
        else { [].forEach.call(box.querySelectorAll("[data-cell]"), function (c) { c.value = ""; c.classList.remove("ok", "bad"); }); save(i, { v: {} }); box.querySelector("[data-cell]").focus(); }
        res.textContent = ""; res.className = "act-result";
        return;
      }
      if (a.kind === "python") {
        var ta = box.querySelector(".code-box"), out = box.querySelector(".py-out"), erl = box.querySelector(".erl");
        if (show) {
          var hide = !erl.hidden; erl.hidden = hide; erl.open = !hide; b.textContent = hide ? "Show the answers" : "Hide the answers";
          if (!hide) save(i, { shown: true });
          return;
        }
        res.textContent = py.started ? "Running your code..." : "Starting Python. The first run takes a few seconds...";
        b.disabled = true;
        pyRun(ta.value, a.tests.map(function (t) { return t[0]; }), function (r) {
          b.disabled = false; out.hidden = false;
          if (r.timeout) { out.textContent = "Your code took too long. Check that every loop has a way to finish."; res.textContent = "Not yet."; return; }
          if (r.error) { out.textContent = (r.out || "") + r.error; res.textContent = "Python found an error. Read the last line of the message above, fix it and run again."; res.className = "act-result bad"; return; }
          var pass = 0, lines = r.results.map(function (x, k) { var ok = x.got === a.tests[k][1]; if (ok) pass++; return (ok ? "Pass: " : "Fail: ") + x.call + " gave " + x.got + (ok ? "" : ", it should give " + a.tests[k][1]); });
          out.textContent = (r.out ? r.out + "\n" : "") + lines.join("\n");
          var all = pass === a.tests.length;
          res.textContent = all ? "All " + pass + " tests pass. Nice work." : pass + " of " + a.tests.length + " tests pass. Keep going.";
          res.className = "act-result " + (all ? "good" : "bad");
          if (all) { save(i, { ok: true, code: ta.value }); erl.hidden = false; box.querySelector("[data-show]").textContent = "Hide the answers"; }
        });
        return;
      }
      var m = actModel(a), right = 0, cells = 0;
      m.rows.forEach(function (r, ri) { r.cells.forEach(function (want, ci) {
        var inp = box.querySelector('[data-cell="' + ri + "-" + ci + '"]'); cells++;
        if (show) inp.value = want;
        var ok = norm(inp.value) === norm(want); if (ok) right++;
        inp.classList.toggle("ok", ok); inp.classList.toggle("bad", !ok);
      }); });
      var allRight = right === cells;
      res.textContent = show ? "Here are the answers. Compare them with yours and work out where it went wrong." : allRight ? "All " + cells + " right. Nice work." : right + " of " + cells + " right. The red boxes need another look.";
      res.className = "act-result " + (show ? "" : allRight ? "good" : "bad");
      save(i, show ? { v: vals(box), shown: true } : { v: vals(box), ok: allRight || ((store.read(slug).sessions[date].practice || {})[i] || {}).ok || false });
    });
  }

  function pageNotFound() {
    frame(null, [{ href: BASE + "/", name: "Hub" }, { name: "Not found" }], "<h1>Page not found</h1><p>Wrong dimension, Dougie. Head back to the <a href=\"" + BASE + "/\">hub</a>.</p>", "Page not found");
  }

  /* ---------- router: works for real pages and for the 404 fallback ---------- */
  function route() {
    var path = location.pathname.slice(BASE.length).replace(/index\.html$/, "") || "/";
    var m;
    if (path === "/") return pageHub();
    if ((m = path.match(/^\/([a-z0-9-]+)\/sessions\/([a-z0-9-]+)\/?$/))) return pageSession(m[1], m[2]);
    if ((m = path.match(/^\/([a-z0-9-]+)\/?$/))) return pageSubject(m[1]);
    pageNotFound();
  }
  DR.route = route;
  function start() { if (DR.firebase) cloud.start(route); else route(); }
  document.addEventListener("click", function (ev) { if (ev.target.id === "signout" && window.firebase) window.firebase.auth().signOut().then(function () { location.reload(); }); });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
}());
