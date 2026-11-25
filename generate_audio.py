#!/usr/bin/env python3
"""Generate offline MP3 audio files for Madani Qaida 29 Arabic letters + examples using macOS 'say' (Majed) and ffmpeg."""

import os
import subprocess
import tempfile

AUDIO_DIR = "/Users/kamrul/Areas/Learn-Arabic/audio"
os.makedirs(AUDIO_DIR, exist_ok=True)

# Mapping of filename -> Arabic text with harakat for accurate Majed pronunciation
# Note: Arabic letter names in Madani Qaida:
# Alif, Baa, Taa, Thaa, Jeem, Haa (ح), Khaa (خ), Daal, Dhaal, Raa, Zaa, Seen, Sheen,
# Saad, Daad, Taa (ط), Zaa (ظ), 'Ain, Ghain, Faa, Qaaf, Kaaf, Laam, Meem, Noon, Waaw, Haa (ه), Hamzah, Yaa
LETTERS_AUDIO = [
    ("01_alif", "أَلِفْ"),
    ("02_baa", "بَاءْ"),
    ("03_taa", "تَاءْ"),
    ("04_thaa", "ثَاءْ"),
    ("05_jeem", "جِيمْ"),
    ("06_haa_sharp", "حَاءْ"),
    ("07_khaa", "خَاءْ"),
    ("08_daal", "دَالْ"),
    ("09_dhaal", "ذَالْ"),
    ("10_raa", "رَاءْ"),
    ("11_zaa", "زَايْ"),
    ("12_seen", "سِينْ"),
    ("13_sheen", "شِينْ"),
    ("14_saad", "صَادْ"),
    ("15_daad", "ضَادْ"),
    ("16_taa_heavy", "طَاءْ"),
    ("17_zaa_heavy", "ظَاءْ"),
    ("18_ain", "عَيْنْ"),
    ("19_ghain", "غَيْنْ"),
    ("20_faa", "فَاءْ"),
    ("21_qaaf", "قَافْ"),
    ("22_kaaf", "كَافْ"),
    ("23_laam", "لَامْ"),
    ("24_meem", "مِيمْ"),
    ("25_noon", "نُونْ"),
    ("26_waaw", "وَاوْ"),
    ("27_haa_soft", "هَاءْ"),
    ("28_hamzah", "هَمْزَةْ"),
    ("29_yaa", "يَاءْ"),
    # Makhraj 16 & 17 examples from Madani Qaida
    ("ex_makhraj16", "نُوحِيهَا"),
    ("ex_makhraj17", "أَنَّ عَمَّ"),
    ("dua_rabbana", "رَبِّ يَسِّرْ وَلَا تُعَسِّرْ وَتَمِّمْ عَلَيْنَا بِالْخَيْرِ"),
]

with tempfile.TemporaryDirectory() as tmpdir:
    for key, text in LETTERS_AUDIO:
        aiff_path = os.path.join(tmpdir, f"{key}.aiff")
        mp3_path = os.path.join(AUDIO_DIR, f"{key}.mp3")
        # Slightly slower rate (-r 155) for clear learner pronunciation
        subprocess.run(["say", "-v", "Majed", "-r", "155", "-o", aiff_path, text], check=True)
        subprocess.run(
            ["ffmpeg", "-y", "-i", aiff_path, "-codec:a", "libmp3lame", "-qscale:a", "4", mp3_path],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=True,
        )
        print(f"Generated {mp3_path}")

print("All audio files generated successfully.")
