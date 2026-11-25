#!/usr/bin/env python3
"""Generate fluent Bengali male-pitched MP3s for offline handwriting evaluation."""

import os
import re
import subprocess
import tempfile
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor

AUDIO_DIR = "/Users/kamrul/Areas/Learn-Arabic/audio"

PHRASES = {
    "bn_empty": "আপনি এখনো ক্যানভাসে কিছু লেখেননি। হালকা চিহ্নের উপর লিখে তারপর যাচাই করুন।",
    "bn_excellent": "মাশাআল্লাহ! হরফটি চমৎকার লিখেছেন।",
    "bn_good": "ভালো চেষ্টা করেছেন! সামান্য ঠিক করলে আরও সুন্দর হবে।",
    "bn_practice": "আরও একটু অনুশীলন প্রয়োজন।",
    "bn_dot_missing": "নুকতা সঠিক জায়গায় বসানো হয়নি।",
    "bn_miss_right": "ডান দিকের শুরুর অংশ পুরোপুরি টানা হয়নি।",
    "bn_miss_left": "বাম দিকের শেষ অংশ পুরোপুরি টানা হয়নি।",
    "bn_miss_shape": "হরফটির মূল আকৃতি সম্পূর্ণভাবে টানা হয়নি।",
    "bn_out_baseline": "রেখা বেসলাইনের নিচে বেশি সরে গেছে।",
    "bn_out_bounds": "কিছু দাগ মূল আকৃতির বাইরে চলে গেছে।",
}

with open("/Users/kamrul/Areas/Learn-Arabic/strokes.js", "r", encoding="utf-8") as f:
    src = f.read()

for m in re.finditer(r"(\w+):\s*\{[^}]*?tip:\s*\"([^\"]+)\"", src, re.S):
    lid, tip = m.group(1), m.group(2)
    PHRASES[f"bn_tip_{lid}"] = f"সঠিক নিয়ম: {tip}"


def gen_one(item):
    key, text = item
    out_path = os.path.join(AUDIO_DIR, f"{key}.mp3")
    if os.path.exists(out_path) and os.path.getsize(out_path) > 500:
        return key
    url = "https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=bn&q=" + urllib.parse.quote(text)
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    raw = urllib.request.urlopen(req, timeout=12).read()

    with tempfile.TemporaryDirectory() as tmpdir:
        raw_mp3 = os.path.join(tmpdir, "raw.mp3")
        with open(raw_mp3, "wb") as f:
            f.write(raw)
        # Shift pitch down naturally (~ -3.2 semitones) for a warm male Bengali voice while keeping normal speed
        subprocess.run(
            [
                "ffmpeg", "-y", "-i", raw_mp3,
                "-af", "asetrate=24000*0.83,aresample=24000,atempo=1/0.83",
                "-codec:a", "libmp3lame", "-qscale:a", "5", out_path,
            ],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=True,
        )
    return key


with ThreadPoolExecutor(max_workers=4) as ex:
    done = list(ex.map(gen_one, PHRASES.items()))

print(f"Generated {len(done)} Bengali male voice MP3s.")
