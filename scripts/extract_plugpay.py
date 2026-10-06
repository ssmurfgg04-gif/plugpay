#!/usr/bin/env python3
"""Extract PlugPay source files from the packaged markdown handoff files.

Each source file is wrapped in <file path="..."> ... </file> blocks inside
plugpay-code-{1,2,3}-of-3.md. This script writes them out under OUT_DIR,
preserving the relative paths, and reports the count and any anomalies.
"""
import html
import os
import re
import sys

SRC_DIR = "/home/z/my-project/upload"
OUT_DIR = "/home/z/my-project/plugpay-next-src"
PARTS = [
    "plugpay-code-1-of-3.md",
    "plugpay-code-2-of-3.md",
    "plugpay-code-3-of-3.md",
]

BLOCK_RE = re.compile(r'<file path="([^"]+)">\n(.*?)\n</file>', re.DOTALL)


def main() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)
    written = []
    skipped = []
    for part in PARTS:
        text = open(os.path.join(SRC_DIR, part), encoding="utf-8").read()
        for match in BLOCK_RE.finditer(text):
            path, body = match.group(1), match.group(2)
            if path == "...":  # literal example inside doc content
                skipped.append((part, path))
                continue
            dest = os.path.join(OUT_DIR, path)
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            with open(dest, "w", encoding="utf-8") as fh:
                fh.write(html.unescape(body))
            written.append(path)

    # globals.css arrives in its own packaging file
    css_path = os.path.join(SRC_DIR, "plugpay-styles.css.md")
    css_text = open(css_path, encoding="utf-8").read()
    m = BLOCK_RE.search(css_text)
    if m:
        dest = os.path.join(OUT_DIR, m.group(1))
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        with open(dest, "w", encoding="utf-8") as fh:
            fh.write(html.unescape(m.group(2)))
        written.append(m.group(1))
    else:
        # fallback: treat the whole file as CSS
        dest = os.path.join(OUT_DIR, "src/app/globals.css")
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        with open(dest, "w", encoding="utf-8") as fh:
            fh.write(css_text)
        written.append("src/app/globals.css")

    print(f"written: {len(written)} files")
    print(f"skipped example blocks: {len(skipped)}")
    if "--list" in sys.argv:
        for p in sorted(written):
            print(p)


if __name__ == "__main__":
    main()
