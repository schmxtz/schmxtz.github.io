// Cognitive shuffle: shows (and optionally speaks) one random, unrelated word
// at a time. Words come from a shuffled deck that persists in localStorage, so
// nothing repeats until the whole list has been shown, even across nights.
(function () {
  "use strict";

  var STORAGE = { settings: "shuffle.settings", order: "shuffle.order", pos: "shuffle.pos", hash: "shuffle.hash" };
  var RECENT_GUARD = 200; // words from the end of one pass kept away from the start of the next
  var DEFAULTS = { seconds: 8, minutes: 15, speak: false, show: true, voice: "" };

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
  var SILENCE = "data:audio/wav;base64,UklGRjQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YRAAAAAAAAAAAAAAAAAAAAAAAAAA";
  var deck = new Deck(loadWords(window.SHUFFLE_WORDS));
  var settings = Object.assign({}, DEFAULTS, load(STORAGE.settings, {}));

  var ui = {
    setup: $("setup"), session: $("session"), word: $("word"),
    clock: $("clock"), hint: $("hint"), status: $("status"),
    seconds: $("seconds"), secondsOut: $("seconds-out"), minutes: $("minutes"),
    speak: $("speak"), show: $("show"), voice: $("voice"), voiceRow: $("voice-row"),
    deckInfo: $("deck-info"), reset: $("reset"), start: $("start"),
  };

  var run = null; // { elapsed, startedAt, paused, wordTimer, tickTimer, wakeLock }
  var clips = null; // { label, words: { text: true } } once assets/audio/manifest.json has loaded
  var player = new Audio();

  // settings form

  function renderSettings() {
    ui.seconds.value = settings.seconds;
    ui.secondsOut.textContent = settings.seconds + " s";
    ui.minutes.value = String(settings.minutes);
    ui.speak.checked = settings.speak;
    ui.show.checked = settings.show;
    ui.voiceRow.hidden = !settings.speak || (!clips && !("speechSynthesis" in window));
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
    settings.voice = ui.voice.value;
    save(STORAGE.settings, settings);
    renderSettings();
  }

  ["input", "change"].forEach(function (type) {
    [ui.seconds, ui.minutes, ui.speak, ui.show, ui.voice].forEach(function (el) {
      el.addEventListener(type, readSettings);
    });
  });

  ui.reset.addEventListener("click", function () { deck.reset(); renderDeckInfo(); });
  ui.start.addEventListener("click", start);

  // voices
  //
  // The default voice ("") plays pre-rendered clips from assets/audio when they
  // exist (see tools/voice) and falls back to the browser's speech otherwise.

  function englishVoices() {
    if (!("speechSynthesis" in window)) return [];
    return speechSynthesis.getVoices().filter(function (v) { return /^en(-|_|$)/i.test(v.lang); });
  }

  function addOption(value, text) {
    var o = document.createElement("option");
    o.value = value; o.textContent = text;
    ui.voice.appendChild(o);
  }

  function fillVoices() {
    var voices = englishVoices();
    ui.voice.innerHTML = "";
    addOption("", clips ? clips.label : "Default");
    if (clips && voices.length) addOption("browser", "Browser default");
    voices.forEach(function (v) { addOption(v.name, v.name + " (" + v.lang + ")"); });
    var known = [].some.call(ui.voice.options, function (o) { return o.value === settings.voice; });
    ui.voice.value = known ? settings.voice : "";
  }

  fillVoices();
  if ("speechSynthesis" in window) speechSynthesis.addEventListener("voiceschanged", fillVoices);

  fetch(AUDIO_BASE + "manifest.json")
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (m) {
      if (!m || !Array.isArray(m.words) || !m.words.length) return;
      clips = { label: m.label || "Recorded voice", words: {} };
      m.words.forEach(function (w) { clips.words[w] = true; });
      fillVoices();
      renderSettings();
    })
    .catch(function () {});

  function stopSpeech() {
    player.pause();
    if ("speechSynthesis" in window) speechSynthesis.cancel();
  }

  function say(text) {
    if (!settings.speak) return;
    stopSpeech();
    if (clips && settings.voice === "" && clips.words[text]) {
      player.src = AUDIO_BASE + encodeURIComponent(text) + ".mp3";
      player.volume = 0.8;
      player.play().catch(function () {});
      return;
    }
    if (!("speechSynthesis" in window)) return;
    var u = new SpeechSynthesisUtterance(text);
    var voices = englishVoices();
    var chosen = voices.filter(function (v) { return v.name === settings.voice; })[0] ||
      voices.filter(function (v) { return v.default; })[0] || voices[0];
    if (chosen) { u.voice = chosen; u.lang = chosen.lang; } else { u.lang = "en-US"; }
    u.rate = 0.8;
    u.volume = 0.8;
    speechSynthesis.speak(u);
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

  function showWord() {
    if (!run || run.paused) return;
    if (elapsed() >= sessionMs()) return finish();
    var w = deck.next();
    ui.word.classList.remove("visible");
    setTimeout(function () {
      if (!run || run.paused || run.done) return;
      ui.word.textContent = settings.show ? w.text : "";
      ui.word.classList.add("visible");
      say(w.text);
    }, 450);
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
    run = { elapsed: 0, startedAt: performance.now(), paused: false };
    ui.setup.hidden = true;
    ui.session.hidden = false;
    ui.status.textContent = "";
    ui.word.textContent = "";
    ui.hint.classList.remove("faded");
    setTimeout(function () { ui.hint.classList.add("faded"); }, 4000);
    requestWakeLock();
    // iOS only lets speech and audio start inside a user gesture, so unlock both here.
    if (settings.speak) {
      player.src = SILENCE;
      player.play().catch(function () {});
      if ("speechSynthesis" in window) speechSynthesis.speak(new SpeechSynthesisUtterance(""));
    }
    tick();
    run.tickTimer = setInterval(tick, 1000);
    showWord();
  }

  function togglePause() {
    if (!run || run.done) return;
    if (run.paused) {
      run.paused = false;
      run.startedAt = performance.now();
      ui.status.textContent = "";
      showWord();
    } else {
      run.elapsed = elapsed();
      run.paused = true;
      clearTimeout(run.wordTimer);
      stopSpeech();
      ui.word.classList.remove("visible");
      ui.status.textContent = "paused";
    }
  }

  function finish() {
    if (!run || run.done) return;
    run.done = true;
    clearTimeout(run.wordTimer);
    clearInterval(run.tickTimer);
    ui.word.classList.remove("visible");
    ui.clock.textContent = "";
    ui.status.textContent = "good night";
    if (run.wakeLock) run.wakeLock.release().catch(function () {});
  }

  function stop() {
    if (!run) return;
    clearTimeout(run.wordTimer);
    clearInterval(run.tickTimer);
    stopSpeech();
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
