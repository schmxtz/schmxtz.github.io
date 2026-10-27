"""Render one audio clip per cognitive shuffle word with a Piper voice model.

    python tools/voice/generate.py --model path/to/voice.onnx

Writes assets/audio/<word>.mp3 and assets/audio/manifest.json, which the page
picks up on its own. Existing clips are kept, so after adding words only the
new ones are rendered. Pass --words to redo specific ones, --force to redo all.
"""
import argparse
import json
import re
import shlex
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
WORDS_JS = ROOT / "assets" / "js" / "shuffle-words.js"

# Text goes to the command on stdin; {model} and {out} are filled in per word.
DEFAULT_CMD = "piper -m {model} -f {out}"

# Trim silence at both ends, then even out loudness so no word jumps out.
FILTER = (
    "silenceremove=start_periods=1:start_threshold=-50dB,areverse,"
    "silenceremove=start_periods=1:start_threshold=-50dB,areverse,"
    "loudnorm=I=-23:TP=-2"
)


def load_words():
    text = WORDS_JS.read_text(encoding="utf-8")
    words = []
    for block in re.findall(r"`([^`]*)`", text):
        words += [w.strip() for w in block.split(",") if w.strip()]
    return words


def render(word, cmd, model, mp3):
    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp) / "word.wav"
        args = [part.format(model=model, out=wav) for part in shlex.split(cmd)]
        subprocess.run(args, input=f"{word}.".encode(), check=True, stdout=subprocess.DEVNULL)
        subprocess.run(
            ["ffmpeg", "-nostdin", "-loglevel", "error", "-y", "-i", str(wav),
             "-af", FILTER, "-ac", "1", "-ar", "22050", "-b:a", "48k", str(mp3)],
            check=True,
        )


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--model", help="Piper .onnx voice (its .onnx.json must sit next to it)")
    p.add_argument("--cmd", default=DEFAULT_CMD, help=f"TTS command template (default: {DEFAULT_CMD!r})")
    p.add_argument("--label", default="My voice", help="name shown in the page's voice menu")
    p.add_argument("--words", nargs="+", help="only (re)render these words")
    p.add_argument("--force", action="store_true", help="re-render clips that already exist")
    p.add_argument("--out", type=Path, default=ROOT / "assets" / "audio")
    a = p.parse_args()

    words = load_words()
    if a.words:
        unknown = sorted(set(a.words) - set(words))
        if unknown:
            sys.exit("not in the word list: " + ", ".join(unknown))
    a.out.mkdir(parents=True, exist_ok=True)

    todo = [w for w in (a.words or words) if a.words or a.force or not (a.out / f"{w}.mp3").exists()]
    if todo and not a.model and "{model}" in a.cmd:
        sys.exit("--model is required to render clips")
    for i, word in enumerate(todo, 1):
        print(f"[{i}/{len(todo)}] {word}")
        render(word, a.cmd, a.model, a.out / f"{word}.mp3")

    have = [w for w in words if (a.out / f"{w}.mp3").exists()]
    manifest = {"label": a.label, "words": have}
    (a.out / "manifest.json").write_text(json.dumps(manifest, indent=0) + "\n", encoding="utf-8")

    stale = sorted({f.stem for f in a.out.glob("*.mp3")} - set(words))
    print(f"{len(have)}/{len(words)} words have clips.")
    if stale:
        print("Clips for words no longer in the list (safe to delete): " + ", ".join(stale))


if __name__ == "__main__":
    main()
