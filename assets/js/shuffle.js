// Cognitive shuffle: shows (and optionally speaks) one random, unrelated word
// at a time. Words come from a shuffled deck that persists in localStorage, so
// nothing repeats until the whole list has been shown, even across nights.
(function () {
  "use strict";

  var STORAGE = { settings: "shuffle.settings", order: "shuffle.order", pos: "shuffle.pos", hash: "shuffle.hash" };
  var RECENT_GUARD = 200; // words from the end of one pass kept away from the start of the next
  var DEFAULTS = { seconds: 8, minutes: 15, speak: false, show: true };

  // ---- word list ---------------------------------------------------------

  function loadWords(source) {
    var words = [];
    Object.keys(source).forEach(function (category) {
      source[category].split(",").forEach(function (raw) {
        var text = raw.trim();
        if (text) words.push({ text: text, category: category });
      });
    });
    return words;
  }

  function hashWords(words) {
    var h = 5381;
    var s = words.map(function (w) { return w.text; }).join("|");
    for (var i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
    return String(h);
  }

  // ---- randomness --------------------------------------------------------

  function randomInt(n) {
    var c = window.crypto || window.msCrypto;
    if (!c || !c.getRandomValues) return Math.floor(Math.random() * n);
    var buf = new Uint32Array(1);
    var limit = Math.floor(0x100000000 / n) * n; // reject to avoid modulo bias
    do { c.getRandomValues(buf); } while (buf[0] >= limit);
    return buf[0] % n;
  }

  function shuffleInPlace(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = randomInt(i + 1);
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  // Builds a new pass over the list. `recent` holds indices shown at the end of
  // the previous pass; they are moved out of the opening stretch so a word
  // never comes back within a few minutes of the deck rolling over.
  function buildDeck(words, recent, lastCategory) {
    var n = words.length;
    var order = shuffleInPlace(words.map(function (_, i) { return i; }));
    var guard = Math.min(recent.length, Math.floor(n / 4));
    var isRecent = {};
    recent.forEach(function (i) { isRecent[i] = true; });

    for (var i = 0; i < guard; i++) {
      if (!isRecent[order[i]]) continue;
      for (var tries = 0; tries < 20; tries++) {
        var j = guard + randomInt(n - guard);
        if (!isRecent[order[j]]) { var t = order[i]; order[i] = order[j]; order[j] = t; break; }
      }
    }

    spreadCategories(words, order, lastCategory);
    return order;
  }

  // Single left-to-right pass: whenever a word shares its category with the
  // one before it, swap in the next word further down that doesn't.
  function spreadCategories(words, order, lastCategory) {
    for (var i = 0; i < order.length; i++) {
      var prev = i === 0 ? lastCategory : words[order[i - 1]].category;
      if (!prev || words[order[i]].category !== prev) continue;
      for (var j = i + 1; j < order.length; j++) {
        if (words[order[j]].category !== prev) {
          var t = order[i]; order[i] = order[j]; order[j] = t;
          break;
        }
      }
    }
    return order;
  }

  // ---- persistence -------------------------------------------------------

  function load(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) { return fallback; }
  }

  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }

  function Deck(words) {
    this.words = words;
    this.hash = hashWords(words);
    var order = load(STORAGE.order, null);
    var pos = load(STORAGE.pos, 0);
    if (load(STORAGE.hash, "") !== this.hash || !Array.isArray(order) || order.length !== words.length) {
      order = buildDeck(words, [], null);
      pos = 0;
      save(STORAGE.hash, this.hash);
      save(STORAGE.order, order);
    }
    this.order = order;
    this.pos = Math.min(Math.max(pos | 0, 0), order.length);
  }

  Deck.prototype.next = function () {
    if (this.pos >= this.order.length) {
      var last = this.words[this.order[this.order.length - 1]];
      this.order = buildDeck(this.words, this.order.slice(-RECENT_GUARD), last && last.category);
      this.pos = 0;
      save(STORAGE.order, this.order);
    }
    var word = this.words[this.order[this.pos++]];
    save(STORAGE.pos, this.pos);
    return word;
  };

  Deck.prototype.remaining = function () { return this.order.length - this.pos; };

  Deck.prototype.reset = function () {
    this.order = buildDeck(this.words, [], null);
    this.pos = 0;
    save(STORAGE.order, this.order);
    save(STORAGE.pos, 0);
  };

  // Exposed for testing outside the browser.
  if (typeof module !== "undefined") {
    module.exports = { loadWords: loadWords, buildDeck: buildDeck, spreadCategories: spreadCategories, Deck: Deck };
    return;
  }

  // ---- page --------------------------------------------------------------

  var $ = function (id) { return document.getElementById(id); };
  var AUDIO_BASE = new URL("../audio/", document.currentScript.src).href;
  var FADE = 0.45; // seconds between one word fading out and the next appearing
  var deck = new Deck(loadWords(window.SHUFFLE_WORDS));
  var settings = Object.assign({}, DEFAULTS, load(STORAGE.settings, {}));

  var ui = {
    setup: $("setup"), session: $("session"), word: $("word"),
    clock: $("clock"), hint: $("hint"), status: $("status"),
    seconds: $("seconds"), secondsOut: $("seconds-out"), minutes: $("minutes"),
    speak: $("speak"), show: $("show"),
    deckInfo: $("deck-info"), reset: $("reset"), start: $("start"),
  };

  var run = null; // { elapsed, startedAt, paused, audio, phase, word, wordTimer, tickTimer, wakeLock }
  var clips = {}; // { text: true } for every word in assets/audio/manifest.json
  var player = new Audio();

  // settings form

  function renderSettings() {
    ui.seconds.value = settings.seconds;
    ui.secondsOut.textContent = settings.seconds + " s";
    ui.minutes.value = String(settings.minutes);
    ui.speak.checked = settings.speak;
    ui.show.checked = settings.show;
    renderDeckInfo();
  }

  function renderDeckInfo() {
    var total = deck.words.length, left = deck.remaining();
    ui.deckInfo.textContent = total + " words in the list. " +
      (left === total ? "Starting a fresh pass." : left + " left before any word repeats.");
  }

  function readSettings() {
    settings.seconds = Number(ui.seconds.value);
    settings.minutes = Number(ui.minutes.value);
    settings.speak = ui.speak.checked;
    settings.show = ui.show.checked;
    save(STORAGE.settings, settings);
    renderSettings();
  }

  ["input", "change"].forEach(function (type) {
    [ui.seconds, ui.minutes, ui.speak, ui.show].forEach(function (el) {
      el.addEventListener(type, readSettings);
    });
  });

  ui.reset.addEventListener("click", function () { deck.reset(); renderDeckInfo(); });
  ui.start.addEventListener("click", start);

  // voice
  //
  // Words are read from clips pre-rendered with a voice model (see tools/voice).
  // With reading on, one audio element plays without a break: a short gap, the
  // word, then silence for the rest of its time, each started when the last one
  // ends. Phones keep a page running while it plays audio, so the session goes
  // on with the screen locked, which timers alone would not.

  fetch(AUDIO_BASE + "manifest.json")
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (m) {
      if (m && Array.isArray(m.words)) m.words.forEach(function (w) { clips[w] = true; });
    })
    .catch(function () {});

  var silences = {};

  // A silent WAV of about `seconds` length (in 50 ms steps), cached as a blob URL.
  function silence(seconds) {
    var ms = Math.max(100, Math.round(seconds * 20) * 50);
    if (!silences[ms]) {
      var rate = 8000, bytes = rate * ms / 1000 * 2;
      var view = new DataView(new ArrayBuffer(44 + bytes));
      var text = function (at, s) { for (var i = 0; i < s.length; i++) view.setUint8(at + i, s.charCodeAt(i)); };
      text(0, "RIFF"); view.setUint32(4, 36 + bytes, true); text(8, "WAVE");
      text(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
      view.setUint32(24, rate, true); view.setUint32(28, rate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
      text(36, "data"); view.setUint32(40, bytes, true);
      silences[ms] = URL.createObjectURL(new Blob([view.buffer], { type: "audio/wav" }));
    }
    return silences[ms];
  }

  function playSegment(phase, src) {
    run.phase = phase;
    player.src = src;
    player.volume = 0.8;
    player.play().catch(function () {});
  }

  // Runs whenever a segment ends: fade -> word -> rest -> fade -> ...
  function nextSegment() {
    if (!run || !run.audio || run.done) return;
    if (run.phase === "fade") {
      run.word = deck.next();
      showText(run.word.text);
      if (clips[run.word.text]) return playSegment("word", AUDIO_BASE + encodeURIComponent(run.word.text) + ".mp3");
      return playSegment("rest", silence(settings.seconds - FADE));
    }
    if (run.phase === "word") {
      var spoken = isFinite(player.duration) ? player.duration : 0;
      return playSegment("rest", silence(settings.seconds - FADE - spoken));
    }
    if (elapsed() >= sessionMs()) return finish();
    hideText();
    playSegment("fade", silence(FADE));
  }

  player.addEventListener("ended", nextSegment);
  // A clip that fails to load just leaves its word unspoken.
  player.addEventListener("error", function () { if (run && run.phase === "word") nextSegment(); });

  // Pausing can also come from the lock screen, headphones or a phone call, so
  // the session follows the player instead of the other way round.
  player.addEventListener("pause", function () {
    if (run && run.audio && !run.paused && !run.done && !player.ended) pause();
  });
  player.addEventListener("play", function () {
    if (run && run.audio && run.paused && !run.done) resume();
  });

  function onMediaAction(action, handler) {
    try { navigator.mediaSession.setActionHandler(action, handler); } catch (e) {}
  }

  if ("mediaSession" in navigator) {
    onMediaAction("play", function () { if (run && run.paused) togglePause(); });
    onMediaAction("pause", function () { if (run && !run.paused) togglePause(); });
    onMediaAction("stop", stop);
  }

  // session

  function sessionMs() { return settings.minutes > 0 ? settings.minutes * 60000 : Infinity; }

  function elapsed() {
    return run.elapsed + (run.paused ? 0 : performance.now() - run.startedAt);
  }

  function formatClock(ms) {
    var s = Math.max(0, Math.ceil(ms / 1000));
    return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
  }

  function tick() {
    if (!run) return;
    var total = sessionMs();
    if (total === Infinity) {
      ui.clock.textContent = formatClock(elapsed());
    } else {
      var left = total - elapsed();
      ui.clock.textContent = formatClock(left);
      if (left <= 0) finish();
    }
  }

  function showText(text) {
    ui.word.textContent = settings.show ? text : "";
    ui.word.classList.add("visible");
  }

  function hideText() { ui.word.classList.remove("visible"); }

  // Without reading aloud, timers pace the words.
  function showWord() {
    if (!run || run.paused) return;
    if (elapsed() >= sessionMs()) return finish();
    var w = deck.next();
    hideText();
    setTimeout(function () {
      if (!run || run.paused || run.done) return;
      showText(w.text);
    }, FADE * 1000);
    run.wordTimer = setTimeout(showWord, settings.seconds * 1000);
  }

  function requestWakeLock() {
    if (!("wakeLock" in navigator) || !run) return;
    navigator.wakeLock.request("screen").then(function (lock) {
      if (run) run.wakeLock = lock; else lock.release();
    }).catch(function () {});
  }

  function start() {
    readSettings();
    run = { elapsed: 0, startedAt: performance.now(), paused: false, audio: settings.speak };
    ui.setup.hidden = true;
    ui.session.hidden = false;
    ui.status.textContent = "";
    ui.word.textContent = "";
    ui.hint.classList.remove("faded");
    setTimeout(function () { ui.hint.classList.add("faded"); }, 4000);
    requestWakeLock();
    tick();
    run.tickTimer = setInterval(tick, 1000);
    if (run.audio) {
      if ("mediaSession" in navigator && window.MediaMetadata) {
        navigator.mediaSession.metadata = new MediaMetadata({ title: "Cognitive shuffle" });
      }
      // iOS only lets audio start inside a user gesture, so the first segment starts here.
      playSegment("fade", silence(FADE));
    } else {
      showWord();
    }
  }

  function pause() {
    run.elapsed = elapsed();
    run.paused = true;
    clearTimeout(run.wordTimer);
    hideText();
    ui.status.textContent = "paused";
  }

  function resume() {
    run.paused = false;
    run.startedAt = performance.now();
    ui.status.textContent = "";
    if (!run.audio) showWord();
    else if (run.word && run.phase !== "fade") showText(run.word.text);
  }

  function togglePause() {
    if (!run || run.done) return;
    if (run.audio) {
      if (run.paused) player.play().catch(function () {}); else player.pause();
    } else if (run.paused) {
      resume();
    } else {
      pause();
    }
  }

  function finish() {
    if (!run || run.done) return;
    run.done = true;
    clearTimeout(run.wordTimer);
    clearInterval(run.tickTimer);
    player.pause();
    hideText();
    ui.clock.textContent = "";
    ui.status.textContent = "good night";
    if (run.wakeLock) run.wakeLock.release().catch(function () {});
  }

  function stop() {
    if (!run) return;
    clearTimeout(run.wordTimer);
    clearInterval(run.tickTimer);
    player.pause();
    if (run.wakeLock) run.wakeLock.release().catch(function () {});
    run = null;
    ui.session.hidden = true;
    ui.setup.hidden = false;
    renderDeckInfo();
  }

  ui.session.addEventListener("click", function (e) {
    if (e.target.closest("#stop")) return stop();
    if (run && run.done) return stop();
    togglePause();
  });

  document.addEventListener("keydown", function (e) {
    if (!run) return;
    if (e.key === "Escape") stop();
    else if (e.key === " ") { e.preventDefault(); if (run.done) stop(); else togglePause(); }
  });

  // The wake lock is dropped whenever the tab is hidden; take it again on return.
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible" && run && !run.done) requestWakeLock();
  });

  renderSettings();
})();
