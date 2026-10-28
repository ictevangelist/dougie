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
     Every key is kept in localStorage as well, so the site keeps working offline. On sign-in, and on every save, this device's copy
     and the cloud's copy are joined (mergeData), so work done on one device is never wiped by an older copy on another.
     Firestore rules let only the family's Google accounts read or write progress/dougie. */
  /* Joining two copies of the same record: anything either copy has is kept. Where both have the same thing,
     a record with its own "at" time (a report rating, a reward) keeps the newer one, a handed-in paper beats one that isn't,
     and anything else comes from the copy saved last. */
  function plain(x) { return !!x && typeof x === "object" && !Array.isArray(x); }
  function join(a, b, aNewer) {
    if (a === undefined) return b;
    if (b === undefined) return a;
    if (!plain(a) || !plain(b)) return aNewer ? a : b;
    if (typeof a.at === "number" || typeof b.at === "number") return (a.at || 0) >= (b.at || 0) ? a : b;
    if (!!a.submitted !== !!b.submitted) return a.submitted ? a : b;
    var o = {};
    Object.keys(a).concat(Object.keys(b)).forEach(function (k) { if (!(k in o)) o[k] = join(a[k], b[k], aNewer); });
    return o;
  }
  function mergeData(local, remote) {
    if (!remote) return local;
    var o = join(local, remote, (local._at || 0) >= (remote._at || 0));
    o._at = Math.max(local._at || 0, remote._at || 0);
    return o;
  }
  var SDK = "https://www.gstatic.com/firebasejs/10.12.2/";
  var cloud = DR.cloud = {
    on: false, user: null, doc: null, timers: {},
    push: function (subject, data) {
      if (!cloud.on || !cloud.doc) return;
      clearTimeout(cloud.timers[subject]);
      /* read the cloud copy, join it with this device's, and write the result back, in one transaction */
      cloud.timers[subject] = setTimeout(function () {
        cloud.doc.firestore.runTransaction(function (t) {
          return t.get(cloud.doc).then(function (snap) {
            var r = null; try { r = snap.exists && snap.data()[subject] ? JSON.parse(snap.data()[subject]) : null; } catch (e) {}
            var m = mergeData(store.read(subject), r), o = {};
            try { localStorage.setItem(store.key(subject), JSON.stringify(m)); } catch (e) {}
            o[subject] = JSON.stringify(m); t.set(cloud.doc, o, { merge: true });
          });
        }).catch(function () {});
      }, 600);
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
    /* iPhones and iPads block Google's sign-in on the firebaseapp.com address from handing the login back. For them the sign-in
       helper runs on this site (/__/auth/handler.html and friends) and the sign-in is a full-page redirect. Everything else keeps the pop-up. */
    ios: /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1),
    init: function (done) {
      var fb = window.firebase, own = cloud.ios && location.hostname === "dougie.ictevangelist.com";
      fb.initializeApp(own ? Object.assign({}, DR.firebase, { authDomain: location.hostname }) : DR.firebase);
      if (own) fb.auth().getRedirectResult().catch(function (e) { cloud.gate("Sign-in didn't work. Try again. (Google said: " + (e.code || e.message) + ")"); });
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
        var m = mergeData(l, r), js = JSON.stringify(m);
        if (!m._at) return;
        try { localStorage.setItem(store.key(k), js); } catch (e) {}
        if (js !== remote[k]) { var o = {}; o[k] = js; cloud.doc.set(o, { merge: true }).catch(function () {}); }
      });
    },
    gate: function (msg) {
      frame(null, null, '<div class="hero"><div><h1>Dougie\'s Revision</h1><p class="lede">This site is private. Sign in with Google to carry on.</p>' +
        (msg ? '<p class="note"><strong>' + esc(msg) + "</strong></p>" : "") +
        '<p><button type="button" class="btn btn-big" id="signin">Sign in with Google</button></p></div></div>', "Sign in");
      document.getElementById("signin").addEventListener("click", function () {
        var fb = window.firebase, pr = new fb.auth.GoogleAuthProvider(); pr.setCustomParameters({ prompt: "select_account" });
        (cloud.ios && location.hostname === "dougie.ictevangelist.com" ? fb.auth().signInWithRedirect(pr) : fb.auth().signInWithPopup(pr)).catch(function (e) { if (e && e.code !== "auth/popup-closed-by-user") cloud.gate("Sign-in didn't work. Try again. (Google said: " + (e.code || e.message) + ")"); });
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
      var t = 0;
      s.slots.forEach(function (sl) { if (!sl.mins && sl.start) sl.mins = mins(sl.end) - mins(sl.start); t += sl.mins || 0; });
      s.totalMins = t;
    });
  }
  function skey(s) { return s.date || s.id; }
  function slabel(s) { return s.date ? longDate(s.date) : s.title; }
  function clockOf(sess) { var d = store.read(sess._slug), ss = d.sessions && d.sessions[sess.id]; return ss && ss.clock; }
  function hrs(m) { var h = Math.floor(m / 60), r = m % 60; return (h ? h + " hour" + (h === 1 ? "" : "s") : "") + (h && r ? " " : "") + (r ? r + " minutes" : ""); }

  /* ---------- shared header, breadcrumbs and footer ---------- */
  function header(current) {
    var links = [{ href: BASE + "/", name: "Hub", slug: "" }].concat((DR.registry || []).map(function (r) { return { href: BASE + "/" + r.slug + "/", name: r.name, short: r.short, slug: r.slug }; }), [{ href: BASE + "/past-papers/", name: "Past paper practice", short: "Papers", slug: "past-papers" }]);
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
  /* No timers: he is on the first slot he hasn't finished yet */
  function sessionState(sess) {
    var d = store.read(sess._slug), ss = (d.sessions || {})[skey(sess)] || { done: {} }, started = Object.keys(ss.done || {}).length > 0;
    for (var i = 0; i < sess.slots.length; i++) if (!(ss.done || {})[i]) return { when: "on", i: i, slot: sess.slots[i], next: sess.slots[i + 1], started: started };
    return { when: "past" };
  }
  /* The next session across all live subjects, from today onwards */
  function nextSession(slugs) {
    var today = todayIso(), running = null, todays = null;
    slugs.forEach(function (slug) {
      var subj = DR.subjects[slug]; if (!subj) return;
      (subj.sessions || []).forEach(function (s) {
        var st = sessionState(s); if (st.when === "past") return;
        if (st.started && !running) running = { slug: slug, subj: subj, s: s };
        if (s.date === today && !todays) todays = { slug: slug, subj: subj, s: s };
      });
    });
    return running || todays;
  }
  function money(n) { return (DR.pay.currency || "") + n; }
  /* Money is kept in pence and can include a half penny */
  function pounds(p) {
    var a = Math.abs(p), w = Math.floor(a), half = a - w >= 0.5;
    return (p < 0 ? "-" : "") + (DR.pay.currency || "") + (w % 100 || half ? (w / 100).toFixed(2) : w / 100) + (half ? "\u00bd" : "");
  }
  function pence(p) { var w = Math.floor(p); return (w + (p - w >= 0.5 ? "\u00bd" : "")) + "p"; }
  /* A right answer starts at 5p and goes up 2½p for every 50 questions banked. A wrong answer costs nothing. */
  var STEP = 50, REPEAT = 0.25;
  function prize(banked) { return 5 + 2.5 * Math.floor(banked / STEP); }
  /* The jar is worked out from the questions banked, so it can never go down */
  function earned(n) { var t = 0; for (var k = 0; k < n; k++) t += prize(k); return t; }
  /* Which wheel and jar this page uses: the hub's (key "wheel", every subject without its own jar) or a subject's own, like Maths ("maths-wheel") */
  var JAR = { key: "wheel", slugs: [] };
  function quizStore() { var q = store.read(JAR.key); q.banked = q.banked || {}; q.pence = earned(Object.keys(q.banked).length); return q; }
  /* Typed answers: "3/4", "4 5/12", "£5.60", "x = 3" and "12 cm" all read as numbers. A leading ~ on the answer accepts anything that rounds to it. */
  function numOf(s) {
    s = String(s).toLowerCase().replace(/[\u2212\u2013]/g, "-").replace(/[,\u00a3$\u20ac\u00a5]/g, "").trim();
    var m = s.match(/^(-?)(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
    if (m) return (m[1] ? -1 : 1) * (+m[2] + m[3] / m[4]);
    s = s.replace(/\s+/g, "").replace(/^[a-z]+=/, "");
    m = s.match(/^(-?\d*\.?\d+)(?:\/(-?\d*\.?\d+))?[a-z\u00b0%\u00b2\u00b3\/]*$/);
    return m ? (m[2] != null ? m[1] / m[2] : +m[1]) : NaN;
  }
  function typedRight(spec, typed) {
    var v = numOf(typed), near = spec.charAt(0) === "~";
    return spec.replace(/^~/, "").split("|").some(function (alt) {
      var a = numOf(alt), dp = ((alt.split(".")[1] || "").match(/^\d*/) || [""])[0].length;
      return near ? Math.abs(v - a) <= 0.5 * Math.pow(10, -dp) + 1e-9 : Math.abs(v - a) <= 1e-9 * Math.max(1, Math.abs(a));
    });
  }
  /* The money jar fills only from Dougie's Wheel of Fortune: 5p the first time each question is right, rising every 50; wrong answers cost nothing.
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
      '<ol class="rungs">' + out + '</ol><p class="muted">Every ' + STEP + " right answers, each one is worth 2\u00bdp more. A wrong answer doesn't cost you anything.</p></div>";
  }

  /* Maths has a reward jar instead of money: a reward every "every" right answers (100). These are the counts that win one. */
  function rewardMarks(n) { var out = []; for (var m = JAR.rewards.every; m <= n; m += JAR.rewards.every) out.push(m); return out; }
  function cap(t) { t = String(t || ""); return t.charAt(0).toUpperCase() + t.slice(1); }
  /* Lucky dip entries are [prize, weight, short label, once only, in to start with, cost (0 free, 1 cheap, 2 dear)]. Dad ticks which are in on the prizes page
     (saved under "maths-prizes"). Behind the scenes the dearer treats have a low weight, so they come up less often, and every
     prize drops out once it's been won (Dad's rule: nothing comes up twice). The wheel itself always shows equal slices. */
  function dipChance(w) { return w < 1 ? "very rare" : w <= 1 ? "rare" : w <= 2 ? "not so common" : "common"; }
  function dipOn(d) { var on = (store.read("maths-prizes").on || {})[d[0]]; return on === undefined ? !!d[4] : !!on; }
  function dipPool(dip, st) {
    var won = {}; Object.keys(st.rewards || {}).forEach(function (k) { won[st.rewards[k].prize] = 1; });
    return dip.map(function (d, i) { return i; }).filter(function (i) { return dipOn(dip[i]) && !won[dip[i][0]]; });
  }
  /* Dad's one-off free spins (rewards.free): each is saved under its own key, so it can only happen once. A spin leaves out its "not" prizes, and with "cost" set it only has prizes that cost that much or less */
  function freeSpin(k) { return (JAR.rewards.free || []).filter(function (f) { return f.key === k; })[0]; }
  function freePool(dip, st, f) { var no = f.not || []; return dipPool(dip, st).filter(function (i) { return !no.some(function (w) { return dip[i][0].indexOf(w) > -1; }) && (f.cost === undefined || dip[i][5] <= f.cost); }); }
  function rewardName(k) { var f = freeSpin(k); return f ? f.name : "Reward " + k; }
  /* Sounds for the lucky dip, made in the browser: a tick each time a slice passes the pointer, and a fanfare at the end */
  function dipSound() {
    var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    var ac = DR.audio = DR.audio || new AC(); if (ac.state === "suspended") ac.resume();
    function beep(freq, at, len, vol, type) {
      var o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + at;
      o.type = type; o.frequency.value = freq; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + len);
      o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + len + 0.02);
    }
    return {
      tick: function () { beep(1700, 0, 0.03, 0.12, "square"); },
      win: function () { [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) { beep(f, i * 0.11, i === 3 ? 0.5 : 0.18, 0.2, "triangle"); }); }
    };
  }
  /* Spin the lucky dip wheel inside box so it stops on prize w, then call done. Call it from a tap, so the sound is allowed to play. */
  function dipSpin(box, four, w, done) {
    var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches, seg = 360 / four.length, sp = box.querySelector(".dip-spin");
    var turn = 360 * 7 + 360 - (four.indexOf(w) * seg + seg / 2) + (Math.random() - 0.5) * seg * 0.84, snd = dipSound(), last = -1, spinning = !still;
    if (still) sp.style.transition = "none";
    requestAnimationFrame(function () { requestAnimationFrame(function () { sp.style.transform = "rotate(" + turn + "deg)"; }); });
    (function watch() {
      if (!spinning || !snd) return;
      var m = new DOMMatrix(getComputedStyle(sp).transform), rot = (Math.atan2(m.b, m.a) * 180 / Math.PI + 360) % 360, slice = Math.floor(((360 - rot) % 360) / seg);
      if (last >= 0 && slice !== last) snd.tick();
      last = slice; requestAnimationFrame(watch);
    }());
    setTimeout(function () { spinning = false; if (snd) snd.win(); done(); }, still ? 100 : 6600);
  }
  function dipDraw(dip, pool) {
    var total = pool.reduce(function (t, i) { return t + dip[i][1]; }, 0), r = Math.random() * total;
    for (var k = 0; k < pool.length; k++) { r -= dip[pool[k]][1]; if (r < 0) return pool[k]; }
    return pool[pool.length - 1];
  }
  /* The wheel, like the Gran Turismo 7 roulette: four prizes from the dip (always the dearest one still in, to tempt him), equal slices, landing on the one already drawn */
  var DIP_COLOURS = [["#C0392B", "#FFFFFF"], ["#F1C40F", "#2C3E50"], ["#8E44AD", "#FFFFFF"], ["#1ABC9C", "#2C3E50"]];
  function dipFour(dip, pool, w) {
    var rarest = pool.reduce(function (m, i) { return dip[i][1] < dip[m][1] ? i : m; }, pool[0]);
    var others = shuffle(pool.filter(function (i) { return i !== w && i !== rarest; }));
    return shuffle([w].concat(w === rarest ? others.slice(0, 3) : [rarest].concat(others.slice(0, 2))));
  }
  function dipSvg(dip, four) {
    var size = 360 / four.length, out = "";
    four.forEach(function (idx, i) {
      var at = i * size, c = DIP_COLOURS[i], R = 92, mid = at + size / 2;
      var a0 = (at - 90) * Math.PI / 180, a1 = (at + size - 90) * Math.PI / 180;
      var p = function (a) { return (100 + R * Math.cos(a)).toFixed(2) + " " + (100 + R * Math.sin(a)).toFixed(2); };
      out += (four.length === 1 ? '<circle cx="100" cy="100" r="92" fill="' + c[0] + '"/>' : '<path d="M100 100 L' + p(a0) + " A" + R + " " + R + " 0 " + (size > 180 ? 1 : 0) + " 1 " + p(a1) + 'z" fill="' + c[0] + '" stroke="#2C3E50" stroke-width="1.5"/>') +
        '<g transform="rotate(' + mid + ' 100 100)"><text x="100" y="42" transform="rotate(' + (mid > 180 ? 90 : -90) + ' 100 42)" class="dip-label" fill="' + c[1] + '"' + ((dip[idx][2] || "").length > 9 ? ' font-size="9"' : "") + ">" + esc(dip[idx][2] || dip[idx][0]) + "</text></g>";
    });
    return '<svg viewBox="0 0 200 200" aria-hidden="true" focusable="false"><circle cx="100" cy="100" r="97" class="wheel-rim"/><g class="dip-spin">' + out + '<circle cx="100" cy="100" r="14" class="dip-hub"/></g><path d="M91 0 L109 0 L100 20 z" class="wheel-pointer"/></svg>';
  }
  function rewardsHtml(q, banked, n) {
    var rw = JAR.rewards, marks = rewardMarks(n), got = q.rewards || {}, next = marks.filter(function (m) { return banked < m; })[0], from = next ? (marks[marks.indexOf(next) - 1] || 0) : 0;
    var rungs = marks.map(function (m, i) {
      var k = i + 1, c = got[k];
      return '<li class="rung' + (banked >= m ? " is-past" : next === m ? " is-now" : "") + '"><span class="rung-band">' + m + ' right</span><span class="rung-prize">' + (c ? esc(cap(c.prize)) : banked >= m ? "Ready to pick" : "Reward " + k) + "</span>" + (next === m ? '<span class="rung-here">Next</span>' : "") + "</li>";
    }).join("");
    var pool = dipPool(rw.dip, q);
    var claims = marks.map(function (m, i) {
      var k = i + 1; if (banked < m || got[k]) return "";
      return '<div class="stuck reward-claim"><p class="stuck-h">You\'ve got ' + m + " right! Pick your reward</p>" +
        '<div class="btn-row"><button type="button" class="btn btn-big" data-claim="' + k + '" data-pick="fixed">' + esc(cap(rw.fixed)) + '</button><button type="button" class="btn btn-big" data-claim="' + k + '" data-pick="dip"' + (pool.length ? "" : " disabled") + '>Lucky dip</button></div>' + (pool.length ? "" : "<p>There's nothing left in the lucky dip. Ask Dad to add some more prizes.</p>") +
        "<p>Once you've picked, it's yours: no swapping.</p></div>";
    }).join("");
    claims = (rw.free || []).map(function (f) {
      if (got[f.key] || !freePool(rw.dip, q, f).length) return "";
      return '<div class="stuck reward-claim"><p class="stuck-h">' + esc(f.head) + '</p><div class="btn-row"><button type="button" class="btn btn-big" data-claim="' + f.key + '" data-pick="dip">Spin the lucky dip</button></div><p>' + esc(f.note) + "</p></div>";
    }).join("") + claims;
    var won = Object.keys(got).length ? '<div class="stuck send-dad"><p class="stuck-h">Your rewards</p><ul>' + Object.keys(got).sort().map(function (k) { return "<li>" + rewardName(k) + ": <strong>" + esc(cap(got[k].prize)) + "</strong>" + (got[k].pick === "dip" ? " (lucky dip)" : "") + "</li>"; }).join("") + '</ul><p>Tell Dad so he can sort it out.</p><button type="button" class="btn btn-big" data-tell="1">Tell Dad about my rewards</button><p class="send-note" aria-live="polite"></p></div>' : "";
    return '<div><h2 id="jar-h">' + JAR.title + '</h2><p class="jar-total">' + banked + "<small>of " + n + " questions banked</small></p>" + (JAR.note ? "<p><strong>" + JAR.note + "</strong></p>" : "") +
      "<p>Instead of money, this jar is full of rewards. It fills from " + JAR.wheel + ": every question you get right for the first time goes in. Every " + rw.every + " questions you get right, you win a reward. A wrong answer doesn't cost you anything.</p>" +
      "<p>For each reward you choose: " + esc(rw.fixed) + ", or a lucky dip. Each lucky dip prize can only be won once, and none of the prizes can be swapped for cash." + (pool.length ? " Right now the lucky dip could be:</p><ul class=\"dip-list\">" + pool.map(function (i) { return "<li>" + esc(cap(rw.dip[i][0])) + "</li>"; }).join("") + "</ul><p><a href=\"" + BASE + "/maths/lucky-dip/\">Try a demo spin of the lucky dip</a></p>" : "</p>") +
      claims + won +
      '<p class="muted"><a href="' + BASE + '/maths/prizes/">For Dad and Mum: choose what goes in the lucky dip</a></p>' +
      '<div class="ladder"><h3>' + marks.length + ' rewards to win</h3><p class="ladder-next">' + (next ? "Get <strong>" + (next - banked) + " more right</strong> for your next reward." : "That's every reward won. Brilliant work.") + "</p>" +
      (next ? '<div class="ladder-bar" role="progressbar" aria-label="Right answers towards the next reward" aria-valuemin="0" aria-valuemax="' + (next - from) + '" aria-valuenow="' + (banked - from) + '"><i style="width:' + ((banked - from) / (next - from) * 100).toFixed(1) + '%"></i></div>' : "") +
      '<ol class="rungs">' + rungs + "</ol></div></div>";
  }
  function jarHtml(still) {
    var q = quizStore(), n = 0, rw = JAR.rewards;
    JAR.slugs.forEach(function (k) { n += ((DR.subjects[k] || {}).quiz || []).length; });
    if (!n) return "";
    var maxP = 0; for (var m = 0; m < n; m++) maxP += prize(m);
    var banked = Object.keys(q.banked).length;
    var totalP = Math.max(0, q.pence), f = Math.min(1, rw ? banked / n : totalP / maxP), top = 40, bottom = 250, h = (bottom - top) * f, ticks = "";
    /* money: a mark every £5, or every £10 once that would crowd the jar. rewards: a mark at each reward */
    var tickStep = maxP > 6500 ? 1000 : 500, tickAt = [];
    if (rw) tickAt = rewardMarks(n).map(function (m) { return [m / n, String(m)]; });
    else for (var t = tickStep; t <= maxP; t += tickStep) tickAt.push([t / maxP, pounds(t)]);
    tickAt.forEach(function (tk) { var y = bottom - (bottom - top) * tk[0]; ticks += '<line x1="150" x2="164" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '" class="jar-tick"/><text x="170" y="' + (y + 5).toFixed(1) + '" class="jar-label">' + tk[1] + "</text>"; });
    return '<section class="card jar section' + (still ? " still" : "") + '" style="--accent-dark:#F1C40F" aria-labelledby="jar-h"><svg class="jar-svg" viewBox="0 0 230 270" role="img" aria-label="' + (rw ? "Reward jar: " + banked + " of " + n + " questions banked" : "Money jar: " + pounds(totalP) + " in the jar, " + pounds(maxP) + " when full") + '">' +
      '<defs><clipPath id="jar-clip"><path d="M40 40 h90 v10 q20 10 20 40 v140 q0 20 -20 20 h-90 q-20 0 -20 -20 v-140 q0 -30 20 -40 z"/></clipPath></defs>' +
      '<g clip-path="url(#jar-clip)"><g class="jar-coins"><rect class="jar-fill" x="0" y="' + (bottom - h) + '" width="170" height="' + h + '"/>' + (h ? '<rect class="jar-shine" x="0" y="' + (bottom - h) + '" width="170" height="6"/>' : "") + "</g></g>" +
      '<path class="jar-glass" d="M40 40 h90 v10 q20 10 20 40 v140 q0 20 -20 20 h-90 q-20 0 -20 -20 v-140 q0 -30 20 -40 z"/>' +
      '<rect class="jar-lid" x="34" y="22" width="102" height="20" rx="6"/>' + ticks + "</svg>" + (rw ? rewardsHtml(q, banked, n) + "</section>" :
      '<div><h2 id="jar-h">' + (JAR.title || "The money jar") + '</h2><p class="jar-total">' + pounds(totalP) + "<small>in the jar so far</small></p>" + (JAR.note ? "<p><strong>" + JAR.note + "</strong></p>" : "") +
      "<p>The jar fills from " + (JAR.wheel || "Dougie's Wheel of Fortune") + ". A question you get right for the first time starts at 5p, and every " + STEP + " questions you get right, each right answer is worth 2\u00bdp more. A wrong answer doesn't cost you anything.</p>" +
      ladderHtml(banked, n) +
      "<p>So far: " + banked + " of " + n + " questions banked. Bank them all and the jar is full at " + pounds(maxP) + ".</p></div></section>");
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
    /* a whole number of rounds, so every subject gets the same number of pockets */
    var out = [];
    while (out.length < (list.length >= 6 ? 6 : 8)) out = out.concat(list);
    /* Mix goes where it keeps red and black alternating: the middle for an even count, the end for an odd one */
    if (out.length % 2) out.push({ label: "Mix" }); else out.splice(out.length / 2, 0, { label: "Mix" });
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
      /* Mostly questions he hasn't banked yet; about one spin in four is a repeat, for practice */
      var bk = quizStore().banked, fresh = pool.filter(function (x) { return !bk[x.q[1]]; }), done = pool.filter(function (x) { return bk[x.q[1]]; });
      if (!fresh.length) fresh = bank.filter(function (x) { return !bk[x.q[1]] && x.q[1] !== lastQ; }); /* this pocket is all banked: take a fresh one from anywhere */
      var from = fresh.length && (!done.length || Math.random() >= REPEAT) ? fresh : done.length ? done : pool;
      var pick = from[Math.floor(Math.random() * from.length)], q = pick.q, u = units[pick.slug][q[0]], reg = registryItem(pick.slug), again = !!bk[q[1]];
      lastQ = q[1];
      /* A typed question is [unit, question, answer, how]; a choice is [unit, question, right, wrong, wrong, wrong, how?] */
      var typed = q.length < 6, how = typed ? q[3] : q[6], answer = typed ? q[2].replace(/^~/, "").split("|")[0] : q[2];
      var opts = typed ? [] : shuffle(q.slice(2, 6));
      dlg.innerHTML = '<p class="kicker">' + (!pocket.slug ? "Mix: anything. This one is " : "") + (multi || !pocket.slug ? esc(reg.name) + ", " : "") + (/^\d/.test(q[0]) ? "Unit " + esc(q[0]) + (u ? ": " + esc(u.title) : "") : esc(u ? u.title : q[0])) + '</p><h2 id="wheel-q-h">' + esc(q[1]) + "</h2>" + (again ? '<p class="quiz-again">You\'ve banked this one before, so it\'s practice: nothing to win or lose this time.</p>' : "") +
        (typed ? '<form class="quiz-typed" novalidate><label for="quiz-in">Your answer</label><div class="quiz-row"><input id="quiz-in" class="quiz-in" type="text" autocomplete="off" autocapitalize="off" spellcheck="false"><button type="submit" class="btn">Check</button></div><p class="quiz-tip">Work it out on paper, then type just the answer. Fractions like 3/4 are fine.</p></form>'
          : '<div class="quiz-opts">' + opts.map(function (o) { return '<button type="button" class="quiz-opt" data-right="' + (o === q[2] ? "1" : "0") + '">' + esc(o) + "</button>"; }).join("") + "</div>") +
        '<p class="quiz-result" aria-live="polite"></p><p class="quiz-how" hidden></p><div class="btn-row"><button type="button" class="btn" data-act="again" hidden>Spin again</button><button type="button" class="btn btn-ghost" data-act="close">Close</button></div>';
      dlg.showModal();
      dlg.querySelector(typed ? ".quiz-in" : ".quiz-opt").focus();
      dlg.onsubmit = function (ev) {
        ev.preventDefault();
        var inp = dlg.querySelector(".quiz-in"); if (!inp || inp.disabled) return;
        var res = dlg.querySelector(".quiz-result");
        if (!inp.value.trim() || isNaN(numOf(inp.value))) { res.textContent = "Type just the number, like 12, 0.5 or 3/4."; res.className = "quiz-result"; inp.focus(); return; }
        var ok = typedRight(q[2], inp.value);
        inp.disabled = true; dlg.querySelector(".quiz-typed .btn").disabled = true; inp.classList.add(ok ? "is-right" : "is-wrong");
        mark(ok);
      };
      dlg.onclick = function (ev) {
        var act = ev.target.closest("[data-act]");
        if (act) { dlg.close(); if (act.getAttribute("data-act") === "again") btn.click(); return; }
        var b = ev.target.closest(".quiz-opt"); if (!b || dlg.querySelector(".quiz-opt[disabled]")) return;
        [].forEach.call(dlg.querySelectorAll(".quiz-opt"), function (o) {
          o.disabled = true;
          if (o.getAttribute("data-right") === "1") { o.classList.add("is-right"); o.insertAdjacentHTML("afterbegin", '<span class="tag">Right answer</span>'); }
          else if (o === b) { o.classList.add("is-wrong"); o.insertAdjacentHTML("afterbegin", '<span class="tag">Your answer</span>'); }
        });
        mark(b.getAttribute("data-right") === "1");
      };
      function mark(right) {
        var st = quizStore(), msg;
        var before = Object.keys(st.banked).length, win = prize(before);
        if (right && !st.banked[q[1]]) {
          st.banked[q[1]] = true; st.pence += win;
          if (JAR.rewards) {
            var mk = rewardMarks(bank.length), hit = mk.indexOf(before + 1), nx = mk.filter(function (m) { return m > before + 1; })[0];
            msg = "Right! That's " + (before + 1) + " in the jar." + (hit >= 0 ? " That's a reward: close this and pick it under the jar!" : nx ? " " + (nx - before - 1) + " more to your next reward." : "");
          } else {
            msg = "Right! " + pence(win) + " goes in the jar.";
            if ((before + 1) % STEP === 0) msg += " That's " + (before + 1) + " right, so every right answer is now worth " + pence(prize(before + 1)) + ".";
          }
        }
        else if (right) msg = "Right! You've already banked this one, so nothing goes in this time.";
        else msg = "Not this time, but it hasn't cost you anything. The answer is: " + answer;
        store.write(JAR.key, st);
        var res = dlg.querySelector(".quiz-result"); res.textContent = msg; res.className = "quiz-result " + (right ? "good" : "bad");
        if (how) { var hw = dlg.querySelector(".quiz-how"); hw.innerHTML = "<strong>How to do it:</strong> " + esc(how); hw.hidden = false; }
        var again = dlg.querySelector('[data-act="again"]'); again.hidden = false; again.focus();
        var jarEl = document.querySelector(".jar"); if (jarEl) jarEl.outerHTML = jarHtml(true);
        var wp = document.getElementById("wheel-prize"); if (wp) wp.textContent = pence(prize(Object.keys(st.banked).length));
      }
    }
  }
  function wheelHtml(name) {
    return '<div class="wheel-wrap"><div class="wheel">' + wheelSvg() + '<button type="button" class="wheel-btn" id="wheel" aria-label="SPIN ' + name + ' for a question">SPIN</button></div><p class="wheel-cap"><strong>' + name + '</strong><br>Tap to spin. ' + (JAR.rewards ? "Right first time: it goes in the jar." : 'Right first time: +<span id="wheel-prize">' + pence(prize(Object.keys(quizStore().banked).length)) + "</span>.") + " Wrong: nothing lost.</p></div>";
  }

  /* ---------- hub ---------- */
  function pageHub() {
    var live = (DR.registry || []).filter(function (r) { return r.status === "live"; }).map(function (r) { return r.slug; });
    var shared = live.filter(function (sl) { return !registryItem(sl).jar; });
    loadSubjects(live, function () {
      JAR = { key: "wheel", slugs: shared };
      POCKETS = wheelPockets(shared);
      var cards = (DR.registry || []).map(function (r) {
        var subj = DR.subjects[r.slug], liveCard = r.status === "live" && subj;
        var reports = liveCard ? subj.units.reduce(function (n, u) { return n + (u.reports || []).length; }, 0) : 0;
        return '<article class="card subject-card" style="--accent-dark:' + r.accent + ";--tint:" + r.tint + '"><h2>' + esc(r.name) + "</h2>" +
          (liveCard ? "<p>" + esc(r.blurb) + ". " + (r.jar ? subj.quiz.length + " questions on its own wheel, with its own reward jar: " + Object.keys(store.read(r.jar).banked || {}).length + " banked so far." : reports + " reports in the notebook" + (subj.notebook ? "" : "s") + ".") + "</p>" + '<a class="btn" href="' + BASE + "/" + r.slug + '/">Open ' + esc(r.name) + "</a>"
            : '<p><span class="chip">Coming soon</span></p><p>Not yet. Enjoy it while it lasts.</p>') + "</article>";
      }).join("");
      frame("", null,
        '<div class="hero"><div><h1>Right then, Dougie.</h1><p class="lede">This is your revision lab. The plan and the money jar are all in here, so there\'s nothing to work out. Do each slot in order, tick each part off as you go, and take your time.</p></div>' + wheelHtml("Dougie's Wheel of Fortune") + "</div>" +
        '<dialog class="quiz" id="wheel-q" aria-labelledby="wheel-q-h"></dialog>' +
        '<div id="hub-now" aria-live="polite"></div>' +
        jarHtml() +
        '<section class="section" aria-labelledby="subjects-h"><h2 id="subjects-h">Your subjects</h2><div class="grid grid-4">' + cards + "</div></section>");
      function tick() {
        var box = document.getElementById("hub-now"); if (!box) return;
        var n = nextSession(live), html = "";
        if (n) {
          var st = sessionState(n.s), href = BASE + (n.s.paper ? "/past-papers/" + n.slug + "/" : "/" + n.slug + "/sessions/") + skey(n.s) + "/";
          html = '<section class="mission section" aria-labelledby="hub-h"><p class="kicker">' + (st.started ? "Carry on where you left off" : "Today\'s session") + '</p><h2 id="hub-h">' + esc(n.s.title) + "</h2><p>" + (st.started ? "You\'re on " + esc(slotTitle(n.subj, st.slot, reportIndex(n.subj))) + ", slot " + (st.i + 1) + " of " + n.s.slots.length + "." : "Work through it in order, at your own pace.") + "</p>" +
            '<a class="btn btn-big" href="' + href + '">' + (st.started ? "Back to it" : "Open the session") + "</a></section>";
        }
        if (box.getAttribute("data-html") !== html) { box.innerHTML = html; box.setAttribute("data-html", html); }
      }
      tick(); setInterval(tick, 1000);
      wheelInit(shared);
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
    if (reg.jar) return pageMaths(slug, reg);
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
      var sessions = sessionsNewestFirst(subj).filter(function (s) { return !s.paper; }).map(function (s) {
        return '<li class="card" style="--accent-dark:' + reg.accent + '"><a href="' + BASE + "/" + slug + "/sessions/" + skey(s) + '/"><strong>' + esc(s.title) + "</strong><span>" + (s.flexible ? "" : longDate(s.date) + ". ") + "About " + hrs(s.totalMins) + ", at your own pace.</span></a></li>";
      }).join("");
      frame(slug, [{ href: BASE + "/", name: "Hub" }, { name: subj.name }],
        '<div class="hero"><div><h1>' + esc(subj.heading) + '</h1><p class="lede">' + esc(subj.paper) + '</p>' + (subj.notebook ? '<p><a class="btn btn-big" href="' + esc(subj.notebook) + '" target="_blank" rel="noopener">Open the ' + esc(subj.name) + " Notebook</a></p>" : (subj.sessions || []).filter(function (x) { return x.notebook; }).map(function (x) { return '<a class="btn btn-big" href="' + esc(x.notebook) + '" target="_blank" rel="noopener">Open the ' + esc(x.short) + " Notebook</a>"; }).join(" ")) + "</div></div>" +
        '<div class="panel section"><h2>How this page works</h2><p><strong>1. Your revision sessions</strong> are the plan. Open one and work through it in order. It tells you which report to open in the notebook and what to do next.</p><p><strong>2. The notebook</strong> holds the reports. Each report has two quizzes, two sets of flashcards and the exam mistakes to avoid.</p><p><strong>3. Your progress on every report</strong> is the list further down. It isn\'t extra work: it\'s your record of how confident you feel and your latest quiz score.</p><p>Practice exam papers are separate. You\'ll find them in <a href="' + BASE + '/past-papers/">Past paper practice</a>.</p></div>' +
        '<section class="section" aria-labelledby="sessions-h"><h2 id="sessions-h">Your revision sessions</h2><ul class="sessions-list">' + sessions + "</ul></section>" +
        '<div class="section"><h2>Your progress on every report</h2><p>This isn\'t extra work. When you finish a report in a session, your rating lands here by itself. You can also rate a report yourself and add your latest quiz score.</p></div>' + units, subj.name);
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
      /* a report only counts as done when all five parts are ticked off */
      var fixed = false;
      sess.slots.forEach(function (sl, i) { if (sl.type === "report" && ss.done[i] && partsDone(((ss.parts || {})[i]) || {}, partLabels(subj).length) < partLabels(subj).length) { delete ss.done[i]; fixed = true; } });
      if (fixed) { data.sessions[date] = ss; store.write(slug, data); }
      var breaks = (sess.breaks || []).map(function (b) { return "break " + range(b.start, b.end); }).join(", ");
      var howTo = sess.howTo || subj.howTo || [];
      var breakMins = sess.slots.filter(function (x) { return x.type === "break"; }).reduce(function (n, x) { return n + (x.mins || 0); }, 0);
      var times = (sess.flexible ? "" : longDate(date) + ". ") + "About " + hrs(sess.totalMins) + (breakMins ? ", including a " + breakMins + " minute break" : "") + ". No timer: work through it in order, at your own pace.";
      frame(sess.paper ? "past-papers" : slug, sess.paper ? [{ href: BASE + "/", name: "Hub" }, { href: BASE + "/past-papers/", name: "Past paper practice" }, { name: subj.name + ": " + (sess.short || sess.title) }] : [{ href: BASE + "/", name: "Hub" }, { href: BASE + "/" + slug + "/", name: subj.name }, { name: sess.flexible ? sess.short || sess.title : longDate(date) }],
        '<div class="hero session-head"><div><h1>' + esc(sess.title) + '</h1><p class="times">' + times + '</p></div><div class="portal" aria-hidden="true"></div></div>' +
        '<div id="mission" class="section" aria-live="polite"></div>' +
        '<details class="panel howto section" open><summary>How this works</summary><ol>' + howTo.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ol></details>" +
        (sess.paper ? paperLinks(subj, sess) : (sess.notebook || subj.notebook) ? '<div class="section nb-row no-print"><a class="btn btn-big" href="' + esc(sess.notebook || subj.notebook) + '" target="_blank" rel="noopener">Open the ' + esc(sess.short || subj.name) + " Notebook</a></div>" : "") +
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
  /* The five parts of every report: a tick each, a score for the quizzes and flashcards, and a comment */
  var PART_KIND = ["quiz", "cards", "read", "quiz", "cards"];
  function partLabels(subj) { return (subj.steps && subj.steps.report) || []; }
  function partsDone(p, n) { var c = 0; for (var k = 0; k < n; k++) if ((p[k] || {}).done) c++; return c; }
  function partsHtml(subj, i, ss) {
    var labels = partLabels(subj), p = (ss.parts || {})[i] || {};
    return '<div class="parts" data-parts="' + i + '"><p class="parts-h">Do all five parts, in this order. Tick each one off as you finish it.</p><ol>' + labels.map(function (lab, k) {
      var v = p[k] || {}, kind = PART_KIND[k] || "read", name = lab.replace(/[,.].*$/, "");
      var num = function (f, val, al) { return '<input type="number" inputmode="numeric" min="0" max="500" data-pf="' + f + '" value="' + esc(val == null ? "" : val) + '" aria-label="' + esc(name + ": " + al) + '">'; };
      var score = kind === "read" ? "" : '<span class="part-score">' + (kind === "quiz" ? "Score " : "Cards I knew ") + num("got", v.got, kind === "quiz" ? "score" : "cards I knew") + " out of " + num("of", v.of, "out of") + "</span>";
      return '<li class="part' + (v.done ? " is-done" : "") + '" data-part="' + k + '"><label class="part-tick"><input type="checkbox" data-pf="done"' + (v.done ? " checked" : "") + "> <strong>" + esc(lab) + "</strong></label>" + score +
        '<input type="text" class="part-note" data-pf="note" value="' + esc(v.note || "") + '" placeholder="Comment: what went well, what to look at again" aria-label="' + esc(name + ": comment") + '"><p class="part-msg" aria-live="polite"></p></li>';
    }).join("") + '</ol><p class="parts-count">' + partsDone(p, labels.length) + " of " + labels.length + " parts done</p></div>";
  }
  function partsLine(subj, p) {
    var labels = partLabels(subj), bits = [];
    labels.forEach(function (lab, k) { var v = p[k] || {}, name = lab.replace(/[,.].*$/, "").replace(/^The /, ""); if (v.got !== undefined && v.got !== "" && v.of) bits.push(name + " " + v.got + "/" + v.of); });
    var notes = labels.map(function (lab, k) { var v = p[k] || {}; return v.note ? lab.replace(/[,.].*$/, "").replace(/^The /, "") + ": " + v.note : ""; }).filter(Boolean);
    return partsDone(p, labels.length) + " of " + labels.length + " parts" + (bits.length ? "; " + bits.join(", ") : "") + (notes.length ? ". Comments: " + notes.join("; ") : "");
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
        partsHtml(subj, i, ss) +
        '<div class="after" data-after="' + i + '"' + (isDone ? "" : " hidden") + ">" + rating("rate-" + i, saved.rating) + "</div>";
    } else if (sl.type === "practice") {
      u = unitByCode(subj, sl.unit);
      extra = actHtml(subj, sl, i, ss);
    } else if (sl.type === "check") {
      u = unitByCode(subj, sl.unit);
      extra = promptHtml("p-" + i, subj.checkPrompt.replace("{unit}", sl.unit + " " + (u ? u.title : "")), "Unit check prompt", subj.checkNote);
    }
    var style = u ? unitStyle(u) : (sl.type === "break" ? ' style="--accent-dark:#95A5A6"' : ' style="--accent-dark:#ECF0F1"');
    var done = sl.type === "break" ? '<label class="done"><input type="checkbox" data-done="' + i + '"' + (isDone ? " checked" : "") + "> I\'ve had my break</label>" : sl.type === "report" ? '<p class="done-status" data-status="' + i + '">' + (isDone ? "Done: all five parts ticked off." : "This report is done when all five parts are ticked off.") + "</p>"
      : '<label class="done"><input type="checkbox" data-done="' + i + '"' + (isDone ? " checked" : "") + "> Done</label>";
    var chip = code ? '<span class="chip">' + esc(code) + "</span>" : (u ? '<span class="chip">' + esc(u.code === "Mixed" ? "Mixed" : "Unit " + u.code) + "</span>" : "");
    return '<li class="card slot slot-' + sl.type + (isDone ? " is-done" : "") + '"' + style + ' id="slot-' + i + '" data-slot="' + i + '">' +
      '<div class="slot-top"><span class="slot-time">Slot ' + (i + 1) + '</span><span class="slot-dur">about ' + dur(sl) + "</span>" + chip +
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
    function partsStatus(i) {
      var p = ((ssNow().parts || {})[i]) || {}, n = partLabels(subj).length, c = partsDone(p, n);
      return '<p class="parts-mission"><strong>' + c + " of " + n + " parts done.</strong> " + (c === n ? "This report is finished." : "Tick each part off in this slot, with your scores, before you move on.") + ' <a href="#slot-' + i + '">Go to the slot</a></p>';
    }
    function missionHtml(st) {
      if (st.when === "past") return completeHtml();
      if (st.i < 0) return "";
      var sl = st.slot, title = slotTitle(subj, sl, idx), isBreak = sl.type === "break";
      var nextLine = st.next ? '<p class="next">Next: <strong>' + esc(slotTitle(subj, st.next, idx)) + "</strong></p>" : '<p class="next">This is the last one. Finish strong.</p>';
      return '<section class="mission" aria-labelledby="m-h"><p class="kicker">' + (isBreak ? "Break" : "Slot " + (st.i + 1) + " of " + sess.slots.length) + '</p><h2 id="m-h">' + esc(title) + '</h2>' +
        '<p class="pace">' + (isBreak ? "Have a proper break, about " + sl.mins + " minutes. Come back when you're ready." : "About " + sl.mins + " minutes, but there's no timer. Take your time and do it properly.") + "</p>" +
        (isBreak ? '<p><button type="button" class="btn btn-big" id="break-done" data-i="' + st.i + '">I\'ve had my break</button></p>' : "") +
        (sl.note ? '<p class="note"><strong>' + esc(sl.note) + "</strong></p>" : "") +
        '<ol class="steps">' + steps(sl).map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ol>" + (sl.type === "report" ? partsStatus(st.i) : "") +
        ((sl.type === "report" || (sl.type === "practice" && ((subj.activities || {})[sl.activity] || {}).kind !== "paper")) && subj.stuck ? '<div class="stuck"><p class="stuck-h">' + esc(subj.stuck.title) + "</p><ol>" + subj.stuck.lines.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ol>" + (subj.stuck.dad ? '<p class="stuck-dad">' + esc(subj.stuck.dad) + "</p>" : "") + "</div>" : "") +
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
      sess.slots.forEach(function (s, i) { if (s.type !== "practice") return; var p = (ss.practice || {})[i] || {}; var ak = ((subj.activities || {})[s.activity] || {}).kind; practice.push(slotTitle(subj, s, idx).replace(/^Practice: /, "") + ": " + (ak === "paper" ? (p.submitted ? "handed in" : "not handed in yet") : ak === "write" ? (p.ok ? "done, " + words(p.text) + " words" : p.text ? "started, " + words(p.text) + " words" : "not done yet") : p.ok ? "got it right" : p.shown ? "answers shown" : "not done yet")); });
      var reportLines = [];
      sess.slots.forEach(function (s, i) { if (s.type === "report") reportLines.push(slotTitle(subj, s, idx) + ": " + partsLine(subj, ((ss.parts || {})[i]) || {})); });
      return { n: n, c: c, scores: scores, missing: missing, practice: practice, reportLines: reportLines };
    }
    function completeHtml() {
      var r = results(), all = r.n === total;
      var text = sess.title + (sess.flexible ? "" : ", " + longDate(date)) + "\nSlots done: " + r.n + " of " + total +
        "\nRed: " + (r.c.red.join(", ") || "none") + "\nAmber: " + (r.c.amber.join(", ") || "none") + "\nGreen: " + (r.c.green.join(", ") || "none") +
        (r.reportLines.length ? "\nReports:\n" + r.reportLines.map(function (x) { return "- " + x; }).join("\n") : "") + (r.practice.length ? "\nPractice: " + r.practice.join(", ") : "");
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
      if (box.getAttribute("data-key") !== html) { box.innerHTML = html; box.setAttribute("data-key", html); }
      document.body.classList.toggle("focus", focus && st.when === "on");
    }
    function partEdit(ev) {
      var t = ev.target, box = t.closest("[data-parts]"); if (!box || !t.hasAttribute("data-pf")) return false;
      if (ev.type === "input" && t.type === "checkbox") return true;
      var i = +box.getAttribute("data-parts"), li = t.closest("[data-part]"), k = +li.getAttribute("data-part"), f = t.getAttribute("data-pf"), msg = li.querySelector(".part-msg");
      var d = store.read(slug), ss = store.session(d, date); ss.parts = ss.parts || {}; var p = ss.parts[i] = ss.parts[i] || {}, v = p[k] = p[k] || {}, kind = PART_KIND[k] || "read";
      msg.textContent = "";
      if (f === "note") v.note = t.value;
      if (f === "got" || f === "of") v[f] = t.value === "" ? "" : Math.max(0, Math.round(+t.value));
      if (f === "done") {
        if (t.checked && kind !== "read" && (v.got === undefined || v.got === "" || !v.of)) { t.checked = false; msg.textContent = "Put in your score first, then tick it off."; }
        else if (t.checked && kind !== "read" && +v.got > +v.of) { t.checked = false; msg.textContent = "Your score can't be more than the total."; }
        else v.done = t.checked;
      }
      if (kind !== "read" && v.done && (v.got === "" || !v.of || +v.got > +v.of)) { v.done = false; li.querySelector('[data-pf="done"]').checked = false; }
      var n = partLabels(subj).length, all = partsDone(p, n) === n, sl = sess.slots[i];
      if (all) ss.done[i] = true; else delete ss.done[i];
      store.write(slug, d);
      if (k === 3 && v.of && v.got !== "") setReport(slug, date, sl.report, { score: Math.min(10, Math.round(+v.got / +v.of * 10)) });
      li.classList.toggle("is-done", !!v.done);
      box.querySelector(".parts-count").textContent = partsDone(p, n) + " of " + n + " parts done";
      var card = box.closest(".slot"); card.classList.toggle("is-done", all);
      card.querySelector(".done-slot").innerHTML = all ? '<span class="badge-done">Done</span>' : "";
      card.querySelector("[data-status]").textContent = all ? "Done: all five parts ticked off." : "This report is done when all five parts are ticked off.";
      var after = main.querySelector('[data-after="' + i + '"]'); if (after) after.hidden = !all;
      progress(); clock();
      return true;
    }
    main.addEventListener("input", function (ev) { var t = ev.target; if (t.closest && t.closest("[data-parts]") && t.type !== "checkbox") partEdit(ev); });
    main.addEventListener("change", function (ev) {
      if (ev.target.closest("[data-parts]")) { if (ev.target.type === "checkbox") partEdit(ev); return; }
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
      if (ev.target.id === "break-done") {
        var db = store.read(slug), sb = store.session(db, date); sb.done[+ev.target.getAttribute("data-i")] = true; store.write(slug, db);
        var bl = main.querySelector('[data-done="' + ev.target.getAttribute("data-i") + '"]'); if (bl) bl.checked = true;
        progress(); clock(); var f2 = document.querySelector("#mission .btn"); if (f2) f2.focus(); return;
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
    if (a.kind === "paper") return head + paperHtml(a, i, saved) + paperFoot(i, saved, a) + "</div>";
    if (a.kind === "select" || a.kind === "choice" || a.kind === "write") return head + textActHtml(a, i, saved) + (a.kind === "write" ? writeFoot(i, saved) : foot) + "</div>";
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
  /* English-style practice: pick the true statements, multiple-choice sets on an extract, and timed writing */
  /* A fixed shuffle per question, so the options stay put after a reload (FNV hash into a small PRNG) */
  function seeded(arr, seed) {
    var h = 2166136261; for (var c = 0; c < seed.length; c++) { h ^= seed.charCodeAt(c); h = Math.imul(h, 16777619) >>> 0; }
    function rnd() { h = (h + 0x6D2B79F5) >>> 0; var t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
    var a = arr.map(function (x, k) { return k; });
    for (var k = a.length - 1; k > 0; k--) { var j = Math.floor(rnd() * (k + 1)), t = a[k]; a[k] = a[j]; a[j] = t; }
    return a;
  }
  function extractHtml(a) { return a.extract ? '<div class="extract">' + a.extract.split(/\n\n/).map(function (para) { return para.trim() === "---" ? "<hr>" : "<p>" + esc(para) + "</p>"; }).join("") + "</div>" : ""; }
  function words(t) { return (String(t || "").match(/[A-Za-z0-9\u00C0-\u017F'\u2019]+/g) || []).length; }
  function textActHtml(a, i, saved) {
    var v = saved.v || {};
    if (a.kind === "select") return extractHtml(a) + '<fieldset class="pick"><legend>Pick the ' + a.answers.length + " true statements</legend>" + a.statements.map(function (st, k) {
      return '<label class="pick-row" data-row="' + k + '"><input type="checkbox" data-pick="' + k + '"' + (v[k] ? " checked" : "") + "> <span>" + esc(st) + "</span></label>"; }).join("") + "</fieldset>";
    if (a.kind === "choice") return extractHtml(a) + a.items.map(function (it, n) {
      var order = seeded(it.options, a.title + n);
      return '<fieldset class="pick" data-item="' + n + '"><legend>' + (n + 1) + ". " + esc(it.q) + "</legend>" + order.map(function (o) {
        return '<label class="pick-row" data-opt="' + o + '"><input type="radio" name="c-' + i + "-" + n + '" value="' + o + '"' + (String(v[n]) === String(o) ? " checked" : "") + "> <span>" + esc(it.options[o]) + "</span></label>"; }).join("") + "</fieldset>";
    }).join("");
    var tick = saved.tick || {};
    return '<div class="extract"><p><strong>' + esc(a.task) + "</strong></p></div>" +
      '<details class="erl" open><summary>Plan first</summary><ul>' + a.plan.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></details>" +
      '<label class="sr-only" for="w-' + i + '">Your writing</label><textarea class="write-box" id="w-' + i + '" rows="14" spellcheck="true">' + esc(saved.text || "") + "</textarea>" +
      '<p class="wcount" id="wc-' + i + '" aria-live="polite">' + words(saved.text) + " words. Aim for at least " + a.minWords + ".</p>" +
      '<fieldset class="pick"><legend>Before you finish, check you have:</legend>' + a.checklist.map(function (c, k) { return '<label class="pick-row"><input type="checkbox" data-tick="' + k + '"' + (tick[k] ? " checked" : "") + "> <span>" + esc(c) + "</span></label>"; }).join("") + "</fieldset>";
  }
  /* Practice papers: typed answers that lock when handed in, then go to Dad for marking */
  function paperLinks(subj, sess) {
    var a = (subj.activities || {})[(sess.slots[0] || {}).activity] || {};
    return a.pdf ? '<div class="section nb-row no-print btn-row"><a class="btn btn-big" href="' + BASE + esc(a.pdf) + '" target="_blank" rel="noopener">Open the question paper (PDF)</a>' +
      (a.markscheme ? '<a class="btn btn-big btn-ghost" href="' + BASE + esc(a.markscheme) + '" target="_blank" rel="noopener">Open the mark scheme (PDF)</a>' : "") + "</div>" : "";
  }
  function paperHtml(a, i, saved) {
    var v = saved.v || {}, off = saved.submitted ? " disabled" : "", out = "";
    a.items.forEach(function (it) {
      if (it.group) out += '<h4 class="pp-group">' + esc(it.group) + "</h4>";
      if (it.context) out += "<p>" + esc(it.context) + "</p>";
      if (it.code) out += '<pre class="pp-code">' + esc(it.code) + "</pre>";
      if (it.source) [].concat(it.source).forEach(function (sc) { out += '<figure class="pp-source"><figcaption><strong>' + esc(sc.title) + "</strong> " + esc(sc.intro) + '</figcaption><ol class="src-lines">' + sc.lines.map(function (l) { return "<li>" + esc(l) + "</li>"; }).join("") + "</ol></figure>"; });
      if (it.quote) { var src = [].concat(a.items.filter(function (x) { return x.source; })[0].source)[0]; out += '<blockquote class="pp-quote">' + src.lines.slice(it.quote[0] - 1, it.quote[1]).map(esc).join(" ") + "</blockquote>"; }
      if (it.table) out += '<div class="table-wrap"><table class="act-table"><thead><tr>' + it.table[0].map(function (h) { return '<th scope="col">' + esc(h) + "</th>"; }).join("") + "</tr></thead><tbody>" + it.table.slice(1).map(function (r) { return "<tr>" + r.map(function (c) { return "<td>" + esc(c) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div>";
      var id = "pp-" + i + "-" + it.n.replace(/\W/g, ""), head = '<p class="pp-q"><strong>' + esc(it.n) + "</strong> " + esc(it.q) + ' <span class="pp-marks">[' + it.marks + " mark" + (it.marks === 1 ? "" : "s") + "]</span></p>";
      /* multi: tick up to it.max statements; saved as their letters, such as "A, C, D, G" */
      if (it.type === "multi") { var got = String(v[it.n] || "").split(/,\s*/); out += '<fieldset class="pick pp-item" data-max="' + it.max + '"><legend>' + head + "</legend>" + it.options.map(function (o) { var L = o.charAt(0), on = got.indexOf(L) >= 0; return '<label class="pick-row"><input type="checkbox" data-pa="' + esc(it.n) + '" value="' + L + '"' + (on ? " checked" : "") + (off || (!on && got.filter(Boolean).length >= it.max) ? " disabled" : "") + "> <span>" + esc(o) + "</span></label>"; }).join("") + "</fieldset>"; return; }
      if (it.type === "mcq") out += '<fieldset class="pick pp-item"><legend>' + head + "</legend>" + it.options.map(function (o) { return '<label class="pick-row"><input type="radio" name="' + id + '" data-pa="' + esc(it.n) + '" value="' + esc(o) + '"' + (v[it.n] === o ? " checked" : "") + off + "> <span>" + esc(o) + "</span></label>"; }).join("") + "</fieldset>";
      else out += '<div class="pp-item">' + head.replace('<p class="pp-q">', '<p class="pp-q" id="' + id + '-q">') + '<textarea class="paper-box" rows="' + (it.lines || 3) + '" spellcheck="false" autocapitalize="sentences" data-pa="' + esc(it.n) + '" aria-labelledby="' + id + '-q"' + off + ">" + esc(v[it.n] || "") + "</textarea></div>";
    });
    return out;
  }
  function paperFoot(i, saved, a) {
    if (!saved.submitted) return '<div class="btn-row"><button type="button" class="btn btn-big" data-check="' + i + '">Hand it in</button></div><p class="act-result" aria-live="polite">Once you hand it in, you can\'t change your answers.</p>';
    return '<div class="stuck send-dad"><p class="stuck-h">Handed in. Now send your answers to Dad</p><p>He\'ll get them marked and tell you how you did.</p><button type="button" class="btn btn-big" data-send-paper="' + i + '">Send my answers to Dad</button><p class="send-note" aria-live="polite"></p></div>';
  }
  function paperText(a, saved, subjName) {
    var v = saved.v || {};
    return a.title + " (" + subjName + ", " + a.items.reduce(function (t, it) { return t + it.marks; }, 0) + " marks)" + (saved.at ? "\nHanded in: " + new Date(saved.at).toLocaleString("en-GB") : "") + "\n\n" + a.items.map(function (it) { return it.n + " [" + it.marks + "]: " + (String(v[it.n] || "").trim() || "(left blank)"); }).join("\n\n");
  }
  function writeFoot(i, saved) { return '<div class="btn-row"><button type="button" class="btn" data-check="' + i + '">I\'ve finished</button></div><p class="act-result" aria-live="polite">' + (saved.ok ? "Done: " + words(saved.text) + " words." : "") + "</p>"; }

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
    function textActCheck(a, i, box, res, show, clear) {
      var rows = box.querySelectorAll(".pick-row"), right = 0, total = 0;
      rows.forEach(function (r) { r.classList.remove("ok", "bad"); });
      if (a.kind === "write") {
        var t = box.querySelector(".write-box").value, n = words(t), ticks = box.querySelectorAll("[data-tick]"), all = [].every.call(ticks, function (c) { return c.checked; });
        if (n < a.minWords) { res.textContent = n + " words so far. Keep going to at least " + a.minWords + "."; res.className = "act-result bad"; return; }
        if (!all) { res.textContent = "Nearly there. Go back through your writing and tick off every check first."; res.className = "act-result bad"; return; }
        save(i, { ok: true, text: t }); res.textContent = "Done: " + n + " words. Dad can read it when he signs in."; res.className = "act-result good"; return;
      }
      if (clear) {
        box.querySelectorAll("input").forEach(function (x) { x.checked = false; }); save(i, { v: {} }); res.textContent = ""; res.className = "act-result"; return;
      }
      if (a.kind === "select") {
        var picked = [].filter.call(box.querySelectorAll("[data-pick]"), function (c) { return c.checked; }).length;
        if (!show && picked !== a.answers.length) { res.textContent = "Pick exactly " + a.answers.length + " statements. You've picked " + picked + "."; res.className = "act-result bad"; return; }
        box.querySelectorAll("[data-pick]").forEach(function (c) {
          var k = +c.getAttribute("data-pick"), want = a.answers.indexOf(k) > -1; if (show) c.checked = want;
          var row = c.closest(".pick-row"); if (c.checked) { row.classList.add(want ? "ok" : "bad"); if (want) right++; } else if (show && want) row.classList.add("ok");
        });
        total = a.answers.length;
      } else {
        a.items.forEach(function (it, n) {
          var fs = box.querySelector('[data-item="' + n + '"]'); total++;
          if (show) fs.querySelector('[data-opt="' + it.answer + '"] input').checked = true;
          var ch = fs.querySelector("input:checked"); if (!ch) return;
          var row = ch.closest(".pick-row"), ok = +ch.value === it.answer; row.classList.add(ok ? "ok" : "bad"); if (ok) right++;
          if (!ok) fs.querySelector('[data-opt="' + it.answer + '"]').classList.add("ok");
        });
      }
      var allRight = right === total, v = {};
      box.querySelectorAll("[data-pick]:checked").forEach(function (c) { v[c.getAttribute("data-pick")] = true; });
      box.querySelectorAll("[data-item]").forEach(function (fs) { var ch = fs.querySelector("input:checked"); if (ch) v[fs.getAttribute("data-item")] = ch.value; });
      res.textContent = show ? "Here are the answers, marked in green. Work out why each one is right." : allRight ? "All " + total + " right. Nice work." : right + " of " + total + " right. The green ones show the right answers you missed.";
      res.className = "act-result " + (show ? "" : allRight ? "good" : "bad");
      var prev = ((store.read(slug).sessions || {})[date] || {}).practice || {};
      save(i, show ? { v: v, shown: true } : { v: v, ok: allRight || (prev[i] || {}).ok || false });
    }
    function save(i, patch) { var d = store.read(slug), ss = store.session(d, date); ss.practice = ss.practice || {}; ss.practice[i] = Object.assign(ss.practice[i] || {}, patch); store.write(slug, d); }
    function vals(box) { var o = {}; [].forEach.call(box.querySelectorAll("[data-cell]"), function (c) { o[c.getAttribute("data-cell")] = c.value; }); return o; }
    main.addEventListener("input", function (ev) {
      var box = ev.target.closest(".act"); if (!box) return;
      var i = +box.getAttribute("data-act");
      if (ev.target.classList.contains("cell")) { ev.target.classList.remove("ok", "bad"); save(i, { v: vals(box) }); }
      if (ev.target.classList.contains("code-box")) save(i, { code: ev.target.value });
      if (ev.target.classList.contains("paper-box")) { var cv = ((store.session(store.read(slug), date).practice || {})[i] || {}).v || {}; cv = Object.assign({}, cv); cv[ev.target.getAttribute("data-pa")] = ev.target.value; save(i, { v: cv }); }
      if (ev.target.classList.contains("write-box")) { save(i, { text: ev.target.value }); var wc = box.querySelector(".wcount"), aw = subj.activities[sess.slots[i].activity]; wc.textContent = words(ev.target.value) + " words. Aim for at least " + aw.minWords + "."; }
    });
    main.addEventListener("change", function (ev) {
      var box = ev.target.closest(".act"); if (!box) return;
      var i = +box.getAttribute("data-act"), d = store.read(slug), cur = ((store.session(d, date).practice || {})[i]) || {};
      if (ev.target.type === "radio" && ev.target.hasAttribute("data-pa")) { var pv = Object.assign({}, cur.v || {}); pv[ev.target.getAttribute("data-pa")] = ev.target.value; save(i, { v: pv }); return; }
      if (ev.target.type === "checkbox" && ev.target.hasAttribute("data-pa")) {
        var fs = ev.target.closest("fieldset"), on = [].filter.call(fs.querySelectorAll("input[data-pa]"), function (x) { return x.checked; }), mv = Object.assign({}, cur.v || {});
        mv[ev.target.getAttribute("data-pa")] = on.map(function (x) { return x.value; }).join(", ");
        [].forEach.call(fs.querySelectorAll("input[data-pa]"), function (x) { x.disabled = !x.checked && on.length >= +fs.getAttribute("data-max"); });
        save(i, { v: mv }); return;
      }
      if (ev.target.hasAttribute("data-pick")) { var v = Object.assign({}, cur.v || {}); if (ev.target.checked) v[ev.target.getAttribute("data-pick")] = true; else delete v[ev.target.getAttribute("data-pick")]; save(i, { v: v }); }
      else if (ev.target.type === "radio" && ev.target.name.indexOf("c-") === 0) { var w = Object.assign({}, cur.v || {}); w[ev.target.closest("[data-item]").getAttribute("data-item")] = ev.target.value; save(i, { v: w }); }
      else if (ev.target.hasAttribute("data-tick")) { var t = Object.assign({}, cur.tick || {}); if (ev.target.checked) t[ev.target.getAttribute("data-tick")] = true; else delete t[ev.target.getAttribute("data-tick")]; save(i, { tick: t }); }
      box.querySelectorAll(".pick-row").forEach(function (r) { r.classList.remove("ok", "bad"); });
    });
    main.addEventListener("keydown", function (ev) {
      if (ev.key !== "Tab" || !ev.target.classList.contains("code-box") || ev.shiftKey) return;
      var t = ev.target, a = t.selectionStart; ev.preventDefault();
      t.value = t.value.slice(0, a) + "    " + t.value.slice(t.selectionEnd); t.selectionStart = t.selectionEnd = a + 4; save(+t.closest(".act").getAttribute("data-act"), { code: t.value });
    });
    main.addEventListener("click", function (ev) {
      var sp = ev.target.closest("[data-send-paper]");
      if (sp) {
        var si = +sp.getAttribute("data-send-paper"), sa = subj.activities[sess.slots[si].activity], ss2 = ((store.read(slug).sessions || {})[date] || {}).practice || {}, txt = paperText(sa, ss2[si] || {}, subj.name), note = sp.parentNode.querySelector(".send-note");
        if (navigator.share) { navigator.share({ title: sa.title, text: txt }).catch(function () {}); return; }
        try { navigator.clipboard.writeText(txt).then(function () { note.textContent = "Copied. Now open a message to Dad and paste it in."; }, function () { note.textContent = "That didn't copy. Ask Dad to sign in and look at this page."; }); } catch (e) { note.textContent = "That didn't copy. Ask Dad to sign in and look at this page."; }
        return;
      }
      var b = ev.target.closest("[data-check],[data-show],[data-clear]"); if (!b) return;
      var i = +(b.getAttribute("data-check") || b.getAttribute("data-show") || b.getAttribute("data-clear")), sl = sess.slots[i], a = subj.activities[sl.activity], box = main.querySelector('[data-act="' + i + '"]'), res = box.querySelector(".act-result");
      var show = b.hasAttribute("data-show");
      if (a.kind === "paper") {
        var cur2 = (((store.read(slug).sessions || {})[date] || {}).practice || {})[i] || {}, vals = cur2.v || {};
        var blank = a.items.filter(function (it) { return !String(vals[it.n] || "").trim(); }).length;
        if (blank && !box.hasAttribute("data-warned")) { box.setAttribute("data-warned", "1"); res.textContent = "You've left " + blank + " question" + (blank === 1 ? "" : "s") + " blank. Have a go at them, or press Hand it in again to hand it in anyway."; res.className = "act-result bad"; return; }
        save(i, { submitted: true, ok: true, at: Date.now() });
        var dd = store.read(slug); store.session(dd, date).done[i] = true; store.write(slug, dd);
        var nb = store.session(store.read(slug), date); box.outerHTML = actHtml(subj, sess.slots[i], i, nb);
        var nbox = main.querySelector('[data-act="' + i + '"] [data-send-paper]'); if (nbox) nbox.focus();
        return;
      }
      if (a.kind === "select" || a.kind === "choice" || a.kind === "write") { textActCheck(a, i, box, res, b.hasAttribute("data-show"), b.hasAttribute("data-clear")); return; }
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

  /* ---------- Maths: no notebook or sessions; its own wheel and jar, and where his Sparx papers lost marks ---------- */
  function pageMaths(slug, reg) {
    loadSubjects([slug], function () {
      var subj = DR.subjects[slug]; if (!subj) return pageNotFound();
      JAR = { key: reg.jar, slugs: [slug], title: "The maths reward jar", wheel: "Dougie's Maths Wheel of Fortune", note: "This jar is just for maths. It's separate from the money jar on the hub.", rewards: subj.rewards };
      POCKETS = wheelPockets([slug]);
      var papers = (subj.papers || []).map(function (p) {
        var lost = p.rows.filter(function (r) { return r[2] === null || r[2] < r[3]; });
        return '<details class="card paper-res"><summary><strong>' + esc(p.name) + "</strong>: " + p.got + " out of " + p.of + ". " + lost.length + " questions to get marks back on.</summary><ul class=\"lost\">" + lost.map(function (r) {
          return "<li><strong>Q" + esc(r[0]) + "</strong> " + esc(r[1]) + "<span>" + (r[2] === null ? "0 out of " + r[3] + " (probably left blank)" : r[2] + " out of " + r[3]) + ". Sparx code " + esc(r[4]) + "</span></li>";
        }).join("") + "</ul></details>";
      }).join("");
      frame(slug, [{ href: BASE + "/", name: "Hub" }, { name: subj.name }],
        '<div class="hero"><div><h1>' + esc(subj.heading) + '</h1><p class="lede">' + esc(subj.paper) + "</p></div>" + wheelHtml("Dougie's Maths Wheel of Fortune") + "</div>" +
        '<dialog class="quiz" id="wheel-q" aria-labelledby="wheel-q-h"></dialog><dialog class="quiz" id="dip-q" aria-labelledby="dip-h"></dialog>' +
        '<div class="panel section"><h2>How the maths wheel works</h2>' +
        "<p>Spin the wheel and it lands on a topic: Number, Algebra, Ratio, Geometry, Probability or Statistics. Green is Mix, which can be any topic.</p>" +
        "<p>Most questions want you to work the answer out on paper and type it in, like the real exam. Some give you four answers to pick from.</p>" +
        "<p>Have a pen, paper and your calculator ready. If a question says no calculator, don't use one: that's practice for Paper 1.</p>" +
        "<p>After every question you'll see how to do it. Read it, even when you got it right.</p>" +
        "<p>Can't remember how to do something? Have a go first. Your CGP book is a last resort: look the topic up in its index. Write down anything you couldn't remember.</p>" +
        "<p>You can ask Dad for help wherever and whenever you want, as long as he's not in a meeting.</p></div>" +
        jarHtml() +
        '<section class="section" aria-labelledby="papers-h"><h2 id="papers-h">Your three Sparx papers: where to get marks back</h2><p>Each list shows the questions where you lost marks, in the order they came on the paper. Start at the top: the early questions are the easier ones, so that\'s where the quickest marks are. A question left blank always scores 0, so always write something.</p>' + papers + "</section>", subj.name);
      wheelInit([slug]);
      /* Picking a reward: the lucky dip is drawn once and saved, so it can't be re-rolled */
      document.getElementById("main").addEventListener("click", function (ev) {
        var c = ev.target.closest("[data-claim]"), tell = ev.target.closest("[data-tell]"), st = quizStore();
        if (c) {
          var k = c.getAttribute("data-claim"), pick = c.getAttribute("data-pick"), dip = subj.rewards.dip;
          st.rewards = st.rewards || {}; if (st.rewards[k]) return;
          /* the prize is drawn and saved before the wheel spins, so closing the page can't re-roll it */
          var pool = freeSpin(k) ? freePool(dip, st, freeSpin(k)) : dipPool(dip, st); if (pick === "dip" && !pool.length) return;
          /* his very first lucky dip always lands on a cheap treat that costs money (Dad's rule); the wheel still shows the big prizes */
          var firstDip = !Object.keys(st.rewards).some(function (r) { return st.rewards[r].pick === "dip"; }), cheap = pool.filter(function (i) { return dip[i][5] === 1; });
          var w = pick === "dip" ? dipDraw(dip, firstDip && cheap.length ? cheap : pool) : -1;
          st.rewards[k] = { pick: pick, prize: pick === "fixed" ? subj.rewards.fixed : dip[w][0], at: Date.now() };
          store.write(JAR.key, st);
          var done = function () { document.querySelector(".jar").outerHTML = jarHtml(true); var tb = document.querySelector("[data-tell]"); if (tb) tb.focus(); };
          if (w < 0) return done();
          var dd = document.getElementById("dip-q");
          /* a free spin with a cost cap still shows the usual wheel, so it looks like any other spin */
          var fs = freeSpin(k), four = dipFour(dip, fs && fs.cost !== undefined ? dipPool(dip, st) : pool, w);
          dd.innerHTML = '<p class="kicker">' + rewardName(k) + '</p><h2 id="dip-h">Lucky dip</h2><p class="dip-four">On the wheel: ' + four.map(function (i) { return esc(cap(dip[i][0])); }).join(", ") + '</p><div class="dip-wheel">' + dipSvg(dip, four) + '</div><p class="quiz-result" aria-live="polite"></p><div class="btn-row"><button type="button" class="btn" data-dip-close hidden>Brilliant</button></div>';
          dd.onclose = done;
          dd.onclick = function (e2) { if (e2.target.closest("[data-dip-close]")) dd.close(); };
          dd.showModal();
          dipSpin(dd, four, w, function () {
            var res = dd.querySelector(".quiz-result"); res.textContent = "You won: " + cap(dip[w][0]) + "!" + (fs && fs.done ? " " + fs.done : ""); res.className = "quiz-result good";
            var cb = dd.querySelector("[data-dip-close]"); cb.hidden = false; cb.focus();
          });
          return;
        }
        if (tell) {
          var got = st.rewards || {}, txt = "Dougie's maths reward jar: " + Object.keys(st.banked).length + " questions banked. Rewards won: " + Object.keys(got).sort().map(function (k) { return rewardName(k) + ": " + cap(got[k].prize); }).join("; ") + ".";
          var note = tell.parentNode.querySelector(".send-note");
          if (navigator.share) { navigator.share({ title: "Dougie's maths rewards", text: txt }).catch(function () {}); return; }
          (navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(txt) : Promise.reject()).then(function () { note.textContent = "Copied. Paste it to Dad on WhatsApp or by text."; }, function () { note.textContent = txt; });
        }
      });
    });
  }

  /* ---------- lucky dip demo: the real wheel and odds, but nothing is won or saved ---------- */
  function pageDipDemo(slug) {
    loadSubjects([slug], function () {
      var subj = DR.subjects[slug]; if (!subj || !subj.rewards) return pageNotFound();
      var dip = subj.rewards.dip, pool = dipPool(dip, store.read(registryItem(slug).jar)), w, four, spun = false;
      frame(slug, [{ href: BASE + "/", name: "Hub" }, { href: BASE + "/" + slug + "/", name: subj.name }, { name: "Lucky dip demo" }],
        "<h1>Lucky dip demo</h1><p class=\"lede\">This is what happens when you pick the lucky dip for a reward. Have a go: it's only a demo, so you won't win anything and nothing is saved.</p>" +
        '<section class="card section dip-demo" aria-labelledby="dip-h"><h2 id="dip-h">Lucky dip</h2><p class="dip-four"></p><div class="dip-wheel"></div><p class="quiz-result" aria-live="polite"></p>' +
        '<div class="btn-row"><button type="button" class="btn btn-big" id="dip-demo"' + (pool.length ? "" : " disabled") + ">Spin the demo</button></div></section>" +
        "<p>Every " + subj.rewards.every + " maths questions you get right, you win a reward. You can pick " + esc(subj.rewards.fixed) + ", or a real spin of this wheel. Each spin shows four prizes from the lucky dip. None of the prizes can be swapped for cash.</p>" +
        '<p><a href="' + BASE + "/" + slug + '/">Back to Maths</a></p>', "Lucky dip demo");
      var box = document.querySelector(".dip-demo"), btn = document.getElementById("dip-demo"), res = box.querySelector(".quiz-result");
      function setUp() {
        w = dipDraw(dip, pool); four = dipFour(dip, pool, w);
        box.querySelector(".dip-four").textContent = "On the wheel: " + four.map(function (i) { return cap(dip[i][0]); }).join(", ");
        box.querySelector(".dip-wheel").innerHTML = dipSvg(dip, four);
      }
      if (!pool.length) { res.textContent = "There's nothing left in the lucky dip. Ask Dad to add some more prizes."; return; }
      setUp();
      btn.addEventListener("click", function () {
        if (btn.disabled) return;
        btn.disabled = true; res.textContent = ""; res.className = "quiz-result";
        if (spun) setUp();
        spun = true;
        dipSpin(box, four, w, function () {
          res.textContent = "In a real lucky dip you'd have won: " + cap(dip[w][0]) + ". This was only a demo, so nothing's saved."; res.className = "quiz-result good";
          btn.disabled = false; btn.textContent = "Spin again"; btn.focus();
        });
      });
    });
  }

  /* ---------- the lucky dip prizes: Dad or Mum ticks which are in; anyone else can only look ---------- */
  function pagePrizes(slug) {
    loadSubjects([slug], function () {
      var subj = DR.subjects[slug]; if (!subj || !subj.rewards) return pageNotFound();
      var rw = subj.rewards, email = cloud.user && cloud.user.email || "", canEdit = !DR.firebase || /^(mrmarkranderson|emmaanderson1978)@gmail\.com$/i.test(email);
      var won = {}, st = store.read(registryItem(slug).jar); Object.keys(st.rewards || {}).forEach(function (k) { won[st.rewards[k].prize] = 1; });
      var rows = rw.dip.map(function (d, i) {
        var id = "prize-" + i;
        return '<li class="prize-row"><input type="checkbox" id="' + id + '" data-prize="' + i + '"' + (dipOn(d) ? " checked" : "") + (canEdit ? "" : " disabled") + '><label for="' + id + '"><strong>' + esc(cap(d[0])) + "</strong><span>" + cap(dipChance(d[1])) + (won[d[0]] ? ", already won" : "") + "</span></label></li>";
      }).join("");
      frame(slug, [{ href: BASE + "/", name: "Hub" }, { href: BASE + "/" + slug + "/", name: subj.name }, { name: "Lucky dip prizes" }],
        '<h1>Lucky dip prizes</h1><p class="lede">Tick the prizes that can come out of the maths lucky dip. Changes save straight away and show on every device.</p>' +
        (canEdit ? "" : '<p class="note"><strong>Only Dad or Mum can change these. Sign in with their Google account to make changes.</strong></p>') +
        "<p>Behind the scenes, rare prizes come up least often and common ones most often. Every prize can only be won once: after he's won it, it drops out of the lucky dip. The wheel he sees always has equal slices. None of the prizes can be swapped for cash.</p>" +
        '<section class="card section"><ul class="prizes">' + rows + "</ul></section>" +
        '<p class="muted">The other choice at every reward is ' + esc(rw.fixed) + ".</p>", "Lucky dip prizes");
      if (!canEdit) return;
      document.getElementById("main").addEventListener("change", function (ev) {
        var b = ev.target.closest("[data-prize]"); if (!b) return;
        var pz = store.read("maths-prizes"); pz.on = pz.on || {}; pz.on[rw.dip[+b.getAttribute("data-prize")][0]] = b.checked; store.write("maths-prizes", pz);
      });
    });
  }

  /* ---------- Past paper practice: every subject's practice papers in one place ---------- */
  function pagePapers() {
    var live = (DR.registry || []).filter(function (r) { return r.status === "live"; }).map(function (r) { return r.slug; });
    loadSubjects(live, function () {
      var html = live.map(function (slug) {
        var subj = DR.subjects[slug], reg = registryItem(slug), papers = (subj && subj.sessions || []).filter(function (s) { return s.paper; });
        var saved = (store.read(slug).sessions) || {};
        var items = papers.map(function (s) {
          var p = ((saved[s.id] || {}).practice) || {}, done = Object.keys(p).some(function (k) { return p[k].submitted; }), started = Object.keys(p).some(function (k) { return Object.keys(p[k].v || {}).length; });
          return '<li class="card" style="--accent-dark:' + reg.accent + '"><a href="' + BASE + "/past-papers/" + slug + "/" + s.id + '/"><strong>' + esc(s.title) + "</strong><span>" + esc(s.blurb || "") + " " + (done ? "Handed in." : started ? "Started, not handed in yet." : "Not started.") + "</span></a></li>";
        }).join("");
        return '<section class="section" aria-labelledby="pp-' + slug + '"><h2 id="pp-' + slug + '">' + esc(reg.name) + "</h2>" + (items ? '<ul class="sessions-list">' + items + "</ul>" : "<p>No practice papers for " + esc(reg.name) + " yet.</p>") + "</section>";
      }).join("");
      frame("past-papers", [{ href: BASE + "/", name: "Hub" }, { name: "Past paper practice" }],
        '<div class="hero"><div><h1>Past paper practice</h1><p class="lede">Practice papers in the style of the real exams. Do one in a single go, with no notes. There\'s no timer, but each one says roughly how long to allow. Type your answers, hand it in, then send it to Dad to be marked.</p></div></div>' + html, "Past paper practice");
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
    if (/^\/past-papers\/?$/.test(path)) return pagePapers();
    if ((m = path.match(/^\/past-papers\/([a-z0-9-]+)\/([a-z0-9-]+)\/?$/))) return pageSession(m[1], m[2]);
    if ((m = path.match(/^\/([a-z0-9-]+)\/sessions\/([a-z0-9-]+)\/?$/))) return pageSession(m[1], m[2]);
    if ((m = path.match(/^\/([a-z0-9-]+)\/prizes\/?$/))) return pagePrizes(m[1]);
    if ((m = path.match(/^\/([a-z0-9-]+)\/lucky-dip\/?$/))) return pageDipDemo(m[1]);
    if ((m = path.match(/^\/([a-z0-9-]+)\/?$/))) return pageSubject(m[1]);
    pageNotFound();
  }
  DR.route = route;
  function start() { if (DR.firebase) cloud.start(route); else route(); }
  document.addEventListener("click", function (ev) { if (ev.target.id === "signout" && window.firebase) window.firebase.auth().signOut().then(function () { location.reload(); }); });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
}());
