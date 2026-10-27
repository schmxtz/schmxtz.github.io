# Cognitive shuffle in my own voice

The shuffle page plays `assets/audio/<word>.mp3` for every word listed in
`assets/audio/manifest.json` and uses the browser's speech for the rest. The
clips come from a [Piper](https://github.com/OHF-Voice/piper1-gpl) voice model
fine-tuned on my recordings. Piper's tooling changes between versions, so check
its current training guide if a command below doesn't match.

## 1. Record

Use [Piper Recording Studio](https://github.com/rhasspy/piper-recording-studio).
It runs locally in the browser, shows one sentence at a time and exports a
dataset in the format Piper trains on.

- A quiet room, the same microphone and distance every session, no music.
- Read in a calm, slow, sleepy tone. The model copies how you read, not just
  your voice.
- Aim for at least 30 minutes of clean audio. More gives a steadier voice.
- Re-record anything with a cough, a stumble or background noise.

## 2. Train

Fine-tune an existing English Piper checkpoint (for example `en_US-lessac`,
medium quality, from the `rhasspy/piper-checkpoints` repository on Hugging Face)
on the exported dataset instead of training from scratch. That needs far less
data and time.

Training needs Linux with an NVIDIA GPU. On this Windows machine that means
WSL2 with Ubuntu (`wsl --install`) or Docker; the RTX 3080 Ti is plenty.
Expect a few hours. Listen to test sentences now and then and stop once the
voice sounds like you.

Export the result to `my-voice.onnx` plus `my-voice.onnx.json`. **Keep both out
of this repository**: anyone with the model can make it say anything in your
voice. `.gitignore` already blocks `*.onnx` and `*.ckpt`.

## 3. Render the clips

Install Piper's command-line tool (`pip install piper-tts`) and ffmpeg, then:

```sh
python tools/voice/generate.py --model path/to/my-voice.onnx
```

This writes one trimmed, loudness-matched mp3 per word plus the manifest.
1,140 words come to roughly 5 to 8 MB. If your Piper version uses different
flags, pass the command with `--cmd`; the word arrives on stdin, and `{model}`
and `{out}` are filled in. A slower pace, for example:

```sh
python tools/voice/generate.py --model my-voice.onnx \
  --cmd "piper --model {model} --length_scale 1.2 --output_file {out}"
```

Listen through the clips and redo the ones that sound off:

```sh
python tools/voice/generate.py --model my-voice.onnx --words teapot lagoon
```

If one still sounds wrong, record that word yourself and save it over the mp3.
Then commit `assets/audio/` and push.

After adding words to `shuffle-words.js`, run the script again. It only renders
words that don't have a clip yet, and lists clips for removed words.
