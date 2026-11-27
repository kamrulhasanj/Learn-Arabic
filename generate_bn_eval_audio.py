#!/usr/bin/env python3
"""Generate genuine Bangladeshi Bengali male neural voice MP3s (bn-BD-PradeepNeural) for offline evaluation."""

import asyncio
import os
import re
import edge_tts

AUDIO_DIR = "/Users/kamrul/Areas/Learn-Arabic/audio"
VOICE = "bn-BD-PradeepNeural"

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


async def gen_all():
    sem = asyncio.Semaphore(3)

    async def gen_one(key, text):
        out_path = os.path.join(AUDIO_DIR, f"{key}.mp3")
        async with sem:
            for attempt in range(3):
                try:
                    comm = edge_tts.Communicate(text, VOICE)
                    await comm.save(out_path)
                    return
                except Exception as e:
                    if attempt == 2:
                        print(f"Failed {key}: {e}")
                    await asyncio.sleep(0.5)

    await asyncio.gather(*(gen_one(k, v) for k, v in PHRASES.items()))
    print(f"Generated {len(PHRASES)} genuine bn-BD-PradeepNeural MP3s.")


asyncio.run(gen_all())
