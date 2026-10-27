"""Build a recording script for Piper Recording Studio.

    python tools/voice/make_prompts.py --studio path/to/piper-recording-studio --out path/to/prompts

Lines of five shuffle words ("Cat. Teapot. Lighthouse. Socks. Mango.")
alternate with the studio's general English sentences, followed by its chat
sentences. The studio asks for prompts in file order, so stopping at any point
still leaves a mix of both. The words teach the model exactly what it will be
asked to say; the sentences cover the rest of English.
"""
import argparse
import random
from pathlib import Path

from generate import load_words

# Its own language entry, because the studio always loads its built-in prompts
# first and would otherwise put these at the end.
LANGUAGE_DIR = "English (cognitive shuffle)_en-shuffle"
STUDIO_EN = Path("prompts") / "English (United States)_en-US"
WORDS_PER_LINE = 5


def read_prompts(path):
    return [line.split("\t")[-1].strip() for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--studio", type=Path, required=True, help="piper-recording-studio checkout")
    p.add_argument("--out", type=Path, required=True, help="prompts directory to pass to the studio")
    a = p.parse_args()

    words = load_words()
    random.Random(1).shuffle(words)  # fixed seed: rerunning keeps the same ids for the same text
    word_lines = [
        " ".join(w.capitalize() + "." for w in words[i:i + WORDS_PER_LINE])
        for i in range(0, len(words), WORDS_PER_LINE)
    ]
    general = read_prompts(a.studio / STUDIO_EN / "0000000001_0300000050_General.txt")
    chat = read_prompts(a.studio / STUDIO_EN / "3000000001_3000000300_Chat.txt")

    lines = []
    for i in range(max(len(word_lines), len(general))):
        if i < len(word_lines):
            lines.append(word_lines[i])
        if i < len(general):
            lines.append(general[i])
    lines += chat

    out = a.out / LANGUAGE_DIR
    out.mkdir(parents=True, exist_ok=True)
    (out / "prompts.txt").write_text(
        "".join(f"{i:04d}\t{text}\n" for i, text in enumerate(lines, 1)), encoding="utf-8"
    )
    print(f"{len(lines)} prompts ({len(word_lines)} word lines) written to {out}")


if __name__ == "__main__":
    main()
