// Speech synthesis for the read-aloud page, kept off the main thread. espeak-ng
// (compiled to wasm) turns text into phonemes the same way Piper did during
// training, and the voice model turns those into audio.
//
// Messages in:  { type: "init", model, config }
//               { type: "speak", id, text, speed }
// Messages out: { type: "progress", loaded, total }
//               { type: "ready", sampleRate }
//               { type: "audio", id, samples }   (Float32Array, peak-normalised)
//               { type: "error", id, message }
"use strict";

var ORT = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/";
var PHONEMIZE = "https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/";
var CACHE = "read-aloud-voice-v1"; // bump when the model changes

importScripts(ORT + "ort.wasm.min.js", PHONEMIZE + "piper_phonemize.js");
ort.env.wasm.wasmPaths = ORT;
ort.env.wasm.numThreads = 1; // threads need cross-origin isolation, which GitHub Pages can't turn on

var config, session, phonemizer, printed;
var ready = null;

// The model is about 60 MB, so it is downloaded once and kept in Cache Storage.
async function fetchModel(url) {
  var cache = null;
  try {
    cache = await caches.open(CACHE);
    (await caches.keys()).forEach(function (key) {
      if (key.indexOf("read-aloud-voice-") === 0 && key !== CACHE) caches.delete(key);
    });
    var hit = await cache.match(url);
    if (hit) return await hit.arrayBuffer();
  } catch (e) { cache = null; }

  var res = await fetch(url);
  if (!res.ok) throw new Error("Could not download the voice (HTTP " + res.status + ")");
  var total = Number(res.headers.get("Content-Length")) || 0;
  var reader = res.body.getReader(), chunks = [], loaded = 0;
  for (;;) {
    var part = await reader.read();
    if (part.done) break;
    chunks.push(part.value);
    loaded += part.value.length;
    postMessage({ type: "progress", loaded: loaded, total: total });
  }
  var bytes = new Uint8Array(loaded), at = 0;
  chunks.forEach(function (c) { bytes.set(c, at); at += c.length; });
  if (cache) {
    try { await cache.put(url, new Response(bytes.slice())); } catch (e) {}
  }
  return bytes.buffer;
}

async function init(modelUrl, configUrl) {
  config = await (await fetch(configUrl)).json();
  phonemizer = await createPiperPhonemize({
    print: function (line) { printed = line; },
    printErr: function () {},
    locateFile: function (file) { return PHONEMIZE + file; },
  });
  session = await ort.InferenceSession.create(await fetchModel(modelUrl), { executionProviders: ["wasm"] });
  postMessage({ type: "ready", sampleRate: config.audio.sample_rate });
}

// Mirrors piper's phonemes_to_ids: BOS, then every phoneme followed by PAD, then EOS.
function phonemeIds(text) {
  printed = null;
  phonemizer.callMain(["-l", config.espeak.voice, "--input", JSON.stringify([{ text: text }]), "--espeak_data", "/espeak-ng-data"]);
  var map = config.phoneme_id_map;
  var phonemes = Array.from(JSON.parse(printed).phonemes.join("").normalize("NFD"));
  var ids = map["^"].concat(map["_"]);
  phonemes.forEach(function (p) {
    if (map[p]) ids.push.apply(ids, map[p].concat(map["_"]));
  });
  return ids.concat(map["$"]);
}

async function speak(text, speed) {
  var ids = phonemeIds(text);
  var inf = config.inference;
  var out = await session.run({
    input: new ort.Tensor("int64", BigInt64Array.from(ids, function (n) { return BigInt(n); }), [1, ids.length]),
    input_lengths: new ort.Tensor("int64", BigInt64Array.of(BigInt(ids.length)), [1]),
    scales: new ort.Tensor("float32", Float32Array.of(inf.noise_scale, inf.length_scale / speed, inf.noise_w), [3]),
  });
  var samples = out.output.data;
  var peak = 0;
  for (var i = 0; i < samples.length; i++) peak = Math.max(peak, Math.abs(samples[i]));
  if (peak > 1e-8) for (i = 0; i < samples.length; i++) samples[i] /= peak;
  return samples;
}

onmessage = function (e) {
  var msg = e.data;
  if (msg.type === "init") {
    ready = init(msg.model, msg.config);
    ready.catch(function (err) { postMessage({ type: "error", id: null, message: err.message }); });
  } else if (msg.type === "speak") {
    // One sentence at a time: the model can't run two requests at once.
    ready = ready
      .then(function () { return speak(msg.text, msg.speed); })
      .then(function (samples) {
        samples = new Float32Array(samples);
        postMessage({ type: "audio", id: msg.id, samples: samples }, [samples.buffer]);
      })
      .catch(function (err) { postMessage({ type: "error", id: msg.id, message: err.message }); });
  }
};

