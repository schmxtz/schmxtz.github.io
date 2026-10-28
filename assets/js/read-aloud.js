// Read aloud: fetches a Wikipedia article, keeps only its running text and reads
// it sentence by sentence in my voice. The Piper model runs in the browser
// (see read-aloud-worker.js and tools/voice).
(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  var BASE = new URL("../", document.currentScript.src).href; // assets/
  var AHEAD = 6; // sentences synthesised ahead of the one playing
  var MAX_CHARS = 250; // longer sentences are split at commas so each piece synthesises quickly
  var PAUSE = { sentence: 0.25, paragraph: 0.7, heading: 0.9 }; // silence after each, in seconds
  var STORAGE = { speed: "readaloud.speed", place: "readaloud.place." };

  // Everything that isn't running text: images, tables, boxes, references,
  // pronunciations and maths.
  var DROP = [
    "style", "script", "link", "meta", "figure", "figure-inline", "table", "math",
    "span[typeof~='mw:File']", ".mw-file-element", ".gallery", ".thumb",
    ".infobox", ".navbox", ".vertical-navbox", ".sidebar", ".metadata", ".ambox",
    ".hatnote", ".shortdescription", ".noprint", ".toc", ".mw-editsection",
    ".mw-ref", "sup.reference", ".reference", ".mw-references-wrap", "ol.references",
    ".reflist", ".refbegin", ".mw-cite-backlink",
    ".IPA", ".rt-commentedText", ".mwe-math-element", "#coordinates",
    ".quotebox", ".side-box", ".portalbox", ".sistersitebox",
    "[role='note']", "[role='navigation']",
  ].join(",");

  var SKIP_SECTIONS = /^(see also|notes|footnotes|references|citations|sources|bibliography|further reading|external links|works cited|notes and references|explanatory notes|gallery)$/i;

  function load(key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; }
  }

  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }

  var ui = {
    form: $("form"), url: $("url"), status: $("status"), article: $("article"),
    bar: $("bar"), prev: $("prev"), play: $("play"), next: $("next"), speed: $("speed"),
  };

  // article: { key, title, sents: [{ text, el, pause }], starts: [index of each block's first sentence] }
  var article = null;
  var cursor = 0; // the sentence playing, or the next one to play
  var playing = false; // what the reader wants; the player may be between segments
  var segment = null; // what the player holds: "sentence" or "wait"
  var speed = load(STORAGE.speed) || 1;
  var player = new Audio();

  // ---- wikipedia -----------------------------------------------------------

  // Accepts a Wikipedia link (desktop or mobile, any language) or a bare title.
  function parseTarget(value) {
    value = value.trim();
    if (!value) return null;
    var url;
    try { url = new URL(value); } catch (e) { return { lang: "en", title: value, anchor: "" }; }
    var host = url.hostname.match(/^([a-z-]+)\.(?:m\.)?wikipedia\.org$/i);
    var title = url.pathname.indexOf("/wiki/") === 0 ? decodeURIComponent(url.pathname.slice(6)) : url.searchParams.get("title");
    if (!host || !title) return null;
    return { lang: host[1].toLowerCase(), title: title, anchor: decodeURIComponent(url.hash.slice(1)) };
  }

  function clean(text) {
    return text
      .replace(/\[(\d+|[a-z]|note \d+|nb \d+|citation needed|clarification needed)\]/gi, "")
      .replace(/\s+/g, " ")
      .replace(/\(\s*[;,:]?\s*\)/g, "") // brackets left empty by removed pronunciations
      .replace(/\(\s+/g, "(")
      .replace(/\s+([,.;:!?)])/g, "$1")
      .trim();
  }

  // Returns the readable blocks of a Parsoid page: [{ heading, text, id }].
  function extract(doc) {
    doc.querySelectorAll(DROP).forEach(function (el) { el.remove(); });
    doc.querySelectorAll("h2, h3, h4, h5, h6").forEach(function (h) {
      if (SKIP_SECTIONS.test(clean(h.textContent))) (h.closest("section") || h).remove();
    });
    var blocks = [];
    doc.body.querySelectorAll("h2, h3, h4, p, li, dd, blockquote").forEach(function (el) {
      if (el.parentElement.closest("p, li, dd, blockquote")) return;
      var text = clean(el.textContent);
      if (text) blocks.push({ heading: /^H\d$/.test(el.tagName), text: text, id: el.id });
    });
    return blocks;
  }

  var segmenter = window.Intl && Intl.Segmenter ? new Intl.Segmenter("en", { granularity: "sentence" }) : null;

  function splitSentences(text) {
    var parts = segmenter
      ? Array.from(segmenter.segment(text), function (s) { return s.segment; })
      : text.match(/[^.!?]+(?:[.!?]+["')\]]*|$)/g) || [text];
    var out = [];
    parts.forEach(function (s) {
      s = s.trim();
      if (!s) return;
      if (s.length <= MAX_CHARS) return out.push(s);
      var cur = "";
      (s.match(/[^,;:]+[,;:]*\s*/g) || [s]).forEach(function (piece) {
        if (cur && (cur + piece).length > MAX_CHARS) { out.push(cur.trim()); cur = ""; }
        cur += piece;
      });
      if (cur.trim()) out.push(cur.trim());
    });
    return out;
  }

  function fetchArticle(target) {
    var api = "https://" + target.lang + ".wikipedia.org/api/rest_v1/page/html/" +
      encodeURIComponent(target.title.replace(/ /g, "_")) + "?redirect=true";
    return fetch(api).then(function (res) {
      if (res.status === 404) throw new Error("There's no Wikipedia article with that name.");
      if (!res.ok) throw new Error("Wikipedia answered with an error (" + res.status + ").");
      return res.text();
    }).then(function (html) {
      var doc = new DOMParser().parseFromString(html, "text/html");
      var title = doc.title || target.title.replace(/_/g, " ");
      return { title: title, blocks: extract(doc) };
    });
  }

  // ---- article view ----------------------------------------------------------

  function render(target, page) {
    var sents = [], starts = [];
    ui.article.innerHTML = "";

    var h1 = document.createElement("h1");
    var source = document.createElement("p");
    var link = document.createElement("a");
    source.className = "source";
    link.href = "https://" + target.lang + ".wikipedia.org/wiki/" + encodeURIComponent(page.title.replace(/ /g, "_"));
    link.textContent = "Wikipedia";
    source.append("From ", link, ", CC BY-SA. Tap a sentence to read from there.");
    ui.article.append(h1, source);

    var anchorIndex = -1;
    [{ heading: true, text: page.title, el: h1 }].concat(page.blocks).forEach(function (block) {
      var el = block.el || document.createElement(block.heading ? "h2" : "p");
      if (!block.el) ui.article.append(el);
      if (block.id && block.id === target.anchor) anchorIndex = sents.length;
      starts.push(sents.length);
      var parts = splitSentences(block.text);
      parts.forEach(function (text, i) {
        var span = document.createElement("span");
        span.className = "s";
        span.textContent = text;
        span.dataset.index = sents.length;
        el.append(span, " ");
        var last = i === parts.length - 1;
        sents.push({ text: text, el: span, pause: !last ? PAUSE.sentence : block.heading ? PAUSE.heading : PAUSE.paragraph });
      });
    });

    var key = target.lang + ":" + page.title;
    article = { key: key, title: page.title, sents: sents, starts: starts };
    var saved = load(STORAGE.place + key);
    cursor = anchorIndex >= 0 ? anchorIndex : saved > 0 && saved < sents.length ? saved : 0;
    document.title = page.title + " · Read aloud";
    ui.article.hidden = false;
    ui.bar.hidden = false;
    highlight();
    if ("mediaSession" in navigator && window.MediaMetadata) {
      navigator.mediaSession.metadata = new MediaMetadata({ title: page.title, artist: "Read aloud" });
    }
  }

  function highlight() {
    var now = ui.article.querySelector(".s.now");
    if (now) now.classList.remove("now");
    var s = article && article.sents[cursor];
    if (!s) return;
    s.el.classList.add("now");
    var box = s.el.getBoundingClientRect();
    if (document.visibilityState === "visible" && (box.top < 0 || box.bottom > window.innerHeight - ui.bar.offsetHeight)) {
      s.el.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }

  function setStatus(text) { ui.status.textContent = text || ""; }

  // ---- voice -------------------------------------------------------------------

  var worker = null;
  var voiceReady = false;
  var sampleRate = 22050;
  var audio = {}; // sentence index -> { url } once synthesised
  var busy = -1; // sentence index the worker is working on
  var generation = 0; // bumped when the queue is thrown away, so late results are ignored

  function startVoice() {
    if (worker) return;
    setStatus("Loading the voice…");
    worker = new Worker(BASE + "js/read-aloud-worker.js");
    worker.onmessage = function (e) {
      var msg = e.data;
      if (msg.type === "progress") {
        setStatus(msg.total
          ? "Downloading the voice: " + Math.round(100 * msg.loaded / msg.total) + "% (first time only)"
          : "Downloading the voice: " + Math.round(msg.loaded / 1e6) + " MB (first time only)");
      } else if (msg.type === "ready") {
        voiceReady = true;
        sampleRate = msg.sampleRate;
        setStatus("");
        pump();
      } else if (msg.type === "audio" || msg.type === "error") {
        if (msg.id === null) return setStatus("The voice failed to load: " + msg.message);
        var id = msg.id.split(":"), index = Number(id[1]);
        if (Number(id[0]) !== generation) return;
        busy = -1;
        // A sentence that fails is skipped with a short silence.
        audio[index] = { url: wavUrl(msg.type === "audio" ? msg.samples : new Float32Array(0), article.sents[index].pause) };
        pump();
      }
    };
    worker.postMessage({ type: "init", model: BASE + "voice/my-voice.onnx", config: BASE + "voice/my-voice.onnx.json" });
  }

  // Asks the worker for the next missing sentence within AHEAD of the cursor.
  function pump() {
    if (!voiceReady || busy >= 0 || !article) return;
    for (var i = cursor; i < Math.min(cursor + AHEAD, article.sents.length); i++) {
      if (audio[i]) continue;
      busy = i;
      worker.postMessage({ type: "speak", id: generation + ":" + i, text: article.sents[i].text, speed: speed });
      return;
    }
  }

  // Drops synthesised audio outside [from, to) and anything in flight.
  function dropAudio(from, to) {
    Object.keys(audio).forEach(function (k) {
      if (Number(k) < from || Number(k) >= to) { URL.revokeObjectURL(audio[k].url); delete audio[k]; }
    });
    generation++;
    busy = -1;
  }

  // 16-bit mono WAV of `samples` followed by `pause` seconds of silence.
  function wavUrl(samples, pause) {
    var n = samples.length + Math.round(pause * sampleRate), bytes = n * 2;
    var view = new DataView(new ArrayBuffer(44 + bytes));
    var text = function (at, s) { for (var i = 0; i < s.length; i++) view.setUint8(at + i, s.charCodeAt(i)); };
    text(0, "RIFF"); view.setUint32(4, 36 + bytes, true); text(8, "WAVE");
    text(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
    text(36, "data"); view.setUint32(40, bytes, true);
    for (var i = 0; i < samples.length; i++) {
      view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, samples[i])) * 32767, true);
    }
    return URL.createObjectURL(new Blob([view.buffer], { type: "audio/wav" }));
  }

  var waitUrl = null;

  // ---- playback ------------------------------------------------------------------
  //
  // One audio element plays without a break: each sentence, or a short silence
  // while the next one is still being synthesised. Phones keep a page running
  // while it plays audio, so reading goes on with the screen locked.

  function advance() {
    if (!playing || !article) return;
    if (cursor >= article.sents.length) {
      playing = false;
      segment = null;
      save(STORAGE.place + article.key, 0);
      setStatus("Finished.");
      return renderPlayButton();
    }
    if (audio[cursor]) {
      segment = "sentence";
      player.src = audio[cursor].url;
      save(STORAGE.place + article.key, cursor);
      highlight();
    } else {
      segment = "wait";
      waitUrl = waitUrl || wavUrl(new Float32Array(0), 0.3);
      player.src = waitUrl;
    }
    player.play().catch(function () {});
    pump();
  }

  player.addEventListener("ended", function () {
    if (segment === "sentence") {
      if (audio[cursor]) URL.revokeObjectURL(audio[cursor].url);
      delete audio[cursor];
      cursor++;
    }
    advance();
  });

  // Pausing can also come from the lock screen, headphones or a phone call.
  player.addEventListener("pause", function () {
    if (playing && player.paused && !player.ended) { playing = false; renderPlayButton(); }
  });
  player.addEventListener("play", function () {
    if (!playing) { playing = true; renderPlayButton(); }
  });

  function play() {
    if (!article) return;
    startVoice();
    playing = true;
    renderPlayButton();
    if (segment && !player.ended && player.src) player.play().catch(function () {});
    else advance();
  }

  function pause() {
    playing = false;
    player.pause();
    renderPlayButton();
  }

  function jumpTo(index) {
    if (!article) return;
    cursor = Math.max(0, Math.min(index, article.sents.length - 1));
    dropAudio(cursor, cursor + AHEAD);
    segment = null;
    highlight();
    setStatus("");
    if (playing) advance(); else pump();
  }

  function blockStart(direction) {
    var starts = article.starts;
    if (direction > 0) {
      for (var i = 0; i < starts.length; i++) if (starts[i] > cursor) return starts[i];
      return article.sents.length - 1;
    }
    for (i = starts.length - 1; i >= 0; i--) if (starts[i] < cursor) return starts[i];
    return 0;
  }

  function renderPlayButton() {
    ui.play.textContent = playing ? "Pause" : "Play";
    ui.play.setAttribute("aria-pressed", String(playing));
  }

  // ---- controls ------------------------------------------------------------------

  function open(target, autoplay) {
    startVoice();
    setStatus("Fetching the article…");
    return fetchArticle(target).then(function (page) {
      render(target, page);
      // Voice download progress takes over the status line until the voice is ready.
      setStatus(voiceReady ? "" : "Loading the voice…");
      var query = "?lang=" + encodeURIComponent(target.lang) + "&title=" + encodeURIComponent(page.title);
      history.replaceState(null, "", query + (target.anchor ? "#" + encodeURIComponent(target.anchor) : ""));
      if (autoplay) play(); else pump();
    }).catch(function (err) { setStatus(err.message); });
  }

  ui.form.addEventListener("submit", function (e) {
    e.preventDefault();
    var target = parseTarget(ui.url.value);
    if (!target) return setStatus("That doesn't look like a Wikipedia link.");
    pause();
    article = null;
    dropAudio(0, 0);
    segment = null;
    // iOS only lets audio start inside a user gesture, so unlock the player here.
    waitUrl = waitUrl || wavUrl(new Float32Array(0), 0.3);
    player.src = waitUrl;
    player.play().catch(function () {});
    open(target, true);
  });

  ui.play.addEventListener("click", function () { if (playing) pause(); else play(); });
  ui.prev.addEventListener("click", function () { if (article) jumpTo(blockStart(-1)); });
  ui.next.addEventListener("click", function () { if (article) jumpTo(blockStart(1)); });

  ui.article.addEventListener("click", function (e) {
    var s = e.target.closest(".s");
    if (!s) return;
    jumpTo(Number(s.dataset.index));
    if (!playing) play();
  });

  ui.speed.value = String(speed);
  ui.speed.addEventListener("change", function () {
    speed = Number(ui.speed.value);
    save(STORAGE.speed, speed);
    if (article) dropAudio(cursor, cursor + 1); // keep the sentence playing, redo the ones after it
    pump();
  });

  document.addEventListener("keydown", function (e) {
    if (!article || e.target === ui.url || e.target === ui.speed) return;
    if (e.key === " ") { e.preventDefault(); if (playing) pause(); else play(); }
    else if (e.key === "ArrowRight") jumpTo(blockStart(1));
    else if (e.key === "ArrowLeft") jumpTo(blockStart(-1));
  });

  function onMediaAction(action, handler) {
    try { navigator.mediaSession.setActionHandler(action, handler); } catch (e) {}
  }

  if ("mediaSession" in navigator) {
    onMediaAction("play", play);
    onMediaAction("pause", pause);
    onMediaAction("previoustrack", function () { if (article) jumpTo(blockStart(-1)); });
    onMediaAction("nexttrack", function () { if (article) jumpTo(blockStart(1)); });
  }

  // Opening a saved link (?lang=en&title=Teapot) loads the article; playing
  // still needs a tap.
  var params = new URLSearchParams(location.search);
  if (params.get("title")) {
    var target = { lang: params.get("lang") || "en", title: params.get("title"), anchor: decodeURIComponent(location.hash.slice(1)) };
    ui.url.value = "https://" + target.lang + ".wikipedia.org/wiki/" + target.title.replace(/ /g, "_");
    open(target, false);
  }

  renderPlayButton();
})();
