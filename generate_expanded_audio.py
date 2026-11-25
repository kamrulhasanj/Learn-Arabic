#!/usr/bin/env python3
"""Generate expanded offline MP3 audio for Harakat (Zabar/Zer/Pesh), Word Breakdown, Qalqalah, and Tashdeed."""

import os
import subprocess
import tempfile
from concurrent.futures import ThreadPoolExecutor

AUDIO_DIR = "/Users/kamrul/Areas/Learn-Arabic/audio"
os.makedirs(AUDIO_DIR, exist_ok=True)

# 28 base letters for Harakat (Zabar, Zer, Pesh)
HARAKAT_LETTERS = [
    ("alif", "ا"),
    ("baa", "ب"),
    ("taa", "ت"),
    ("thaa", "ث"),
    ("jeem", "ج"),
    ("haa_sharp", "ح"),
    ("khaa", "خ"),
    ("daal", "د"),
    ("dhaal", "ذ"),
    ("raa", "ر"),
    ("zaa", "ز"),
    ("seen", "س"),
    ("sheen", "ش"),
    ("saad", "ص"),
    ("daad", "ض"),
    ("taa_heavy", "ط"),
    ("zaa_heavy", "ظ"),
    ("ain", "ع"),
    ("ghain", "غ"),
    ("faa", "ف"),
    ("qaaf", "ق"),
    ("kaaf", "ك"),
    ("laam", "ل"),
    ("meem", "م"),
    ("noon", "ن"),
    ("waaw", "و"),
    ("haa_soft", "ه"),
    ("yaa", "ي"),
]

TASKS = []

for lid, ch in HARAKAT_LETTERS:
    base = "أ" if lid == "alif" else ch
    TASKS.append((f"h_{lid}_a", f"{base}َ"))
    TASKS.append((f"h_{lid}_i", f"{'إ' if lid == 'alif' else ch}ِ"))
    TASKS.append((f"h_{lid}_u", f"{base}ُ"))

# Word breakdown examples (3-letter joined words)
WORDS = [
    ("w_kataba", "كَتَبَ"),
    ("w_hamida", "حَمِدَ"),
    ("w_nasara", "نَصَرَ"),
    ("w_sajada", "سَجَدَ"),
    ("w_alima", "عَلِمَ"),
    ("w_fataha", "فَتَحَ"),
    ("w_khalaqa", "خَلَقَ"),
    ("w_shakara", "شَكَرَ"),
    ("w_sadaqa", "صَدَقَ"),
    ("w_dhakara", "ذَكَرَ"),
]
TASKS.extend(WORDS)

# Qalqalah & Tashdeed / Ghunnah examples
TAJWEED = [
    ("q_qaaf", "أَقْ"),
    ("q_taa", "أَطْ"),
    ("q_baa", "أَبْ"),
    ("q_jeem", "أَجْ"),
    ("q_daal", "أَدْ"),
    ("t_inna", "إِنَّ"),
    ("t_amma", "عَمَّ"),
    ("t_thumma", "ثُمَّ"),
    ("t_rabbi", "رَبِّ"),
]
TASKS.extend(TAJWEED)


def render_one(item):
    key, text = item
    mp3_path = os.path.join(AUDIO_DIR, f"{key}.mp3")
    if os.path.exists(mp3_path):
        return key
    with tempfile.TemporaryDirectory() as tmpdir:
        aiff_path = os.path.join(tmpdir, f"{key}.aiff")
        subprocess.run(["say", "-v", "Majed", "-r", "150", "-o", aiff_path, text], check=True)
        subprocess.run(
            ["ffmpeg", "-y", "-i", aiff_path, "-codec:a", "libmp3lame", "-qscale:a", "5", mp3_path],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=True,
        )
    return key


with ThreadPoolExecutor(max_workers=4) as ex:
    done = list(ex.map(render_one, TASKS))

print(f"Generated/verified {len(done)} expanded audio files.")
