#!/usr/bin/env python3
"""Regenerate Madd & Leen MP3s using Saudi Arabic male neural voice (ar-SA-HamedNeural) at slower rate for clear Madd."""

import asyncio
import os
import edge_tts

AUDIO_DIR = "/Users/kamrul/Areas/Learn-Arabic/audio"
VOICE = "ar-SA-HamedNeural"

MADD_ITEMS = [
    ("md_qala", "قَالَ", "-30%"),
    ("md_qeela", "قِيلَ", "-30%"),
    ("md_yaqoolu", "يَقُولُ", "-30%"),
    ("md_bayt", "بَيْتٌ", "-20%"),
    ("md_khawf", "خَوْفٌ", "-20%"),
    ("md_samaa", "سَمَاءٌ", "-35%"),
    ("md_ulaika", "أُولَائِكَ", "-35%"),
]


async def main():
    for key, text, rate in MADD_ITEMS:
        out_path = os.path.join(AUDIO_DIR, f"{key}.mp3")
        comm = edge_tts.Communicate(text, VOICE, rate=rate)
        await comm.save(out_path)
        print(f"Generated {key}.mp3 ({os.path.getsize(out_path)} bytes)")


asyncio.run(main())
