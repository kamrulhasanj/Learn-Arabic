#!/usr/bin/env python3
"""Generate offline MP3s for Tanween, Madd/Leen, and Word-by-Word Surahs (Fatihah, Ikhlas, Asr)."""

import os
import subprocess
import tempfile
from concurrent.futures import ThreadPoolExecutor

AUDIO_DIR = "/Users/kamrul/Areas/Learn-Arabic/audio"
os.makedirs(AUDIO_DIR, exist_ok=True)

TASKS = [
    # Tanween & Khada Harakat examples
    ("tw_baa_an", "بًا"),
    ("tw_baa_in", "بٍ"),
    ("tw_baa_un", "بٌ"),
    ("tw_aliman", "عَلِيمًا"),
    ("tw_kitabun", "كِتَابٌ"),
    ("tw_baytin", "بَيْتٍ"),
    ("tw_dhalika", "ذٰلِكَ"),
    ("tw_bihi", "بِهِ"),
    ("tw_lahu", "لَهُ"),

    # Madd & Leen examples
    ("md_qala", "قَالَ"),
    ("md_qeela", "قِيلَ"),
    ("md_yaqoolu", "يَقُولُ"),
    ("md_bayt", "بَيْتٌ"),
    ("md_khawf", "خَوْفٌ"),
    ("md_samaa", "سَمَاءٌ"),
    ("md_ulaika", "أُولٰئِكَ"),

    # Surah Al-Fatihah (Word by Word)
    ("sf_01", "بِسْمِ"),
    ("sf_02", "اللَّهِ"),
    ("sf_03", "الرَّحْمٰنِ"),
    ("sf_04", "الرَّحِيمِ"),
    ("sf_05", "الْحَمْدُ"),
    ("sf_06", "لِلَّهِ"),
    ("sf_07", "رَبِّ"),
    ("sf_08", "الْعَالَمِينَ"),
    ("sf_09", "مَالِكِ"),
    ("sf_10", "يَوْمِ"),
    ("sf_11", "الدِّينِ"),
    ("sf_12", "إِيَّاكَ"),
    ("sf_13", "نَعْبُدُ"),
    ("sf_14", "وَإِيَّاكَ"),
    ("sf_15", "نَسْتَعِينُ"),
    ("sf_16", "اهْدِنَا"),
    ("sf_17", "الصِّرَاطَ"),
    ("sf_18", "الْمُسْتَقِيمَ"),
    ("sf_19", "صِرَاطَ"),
    ("sf_20", "الَّذِينَ"),
    ("sf_21", "أَنْعَمْتَ"),
    ("sf_22", "عَلَيْهِمْ"),
    ("sf_23", "غَيْرِ"),
    ("sf_24", "الْمَغْضُوبِ"),
    ("sf_25", "وَلَا"),
    ("sf_26", "الضَّالِّينَ"),

    # Surah Al-Ikhlas (Word by Word)
    ("si_01", "قُلْ"),
    ("si_02", "هُوَ"),
    ("si_03", "اللَّهُ"),
    ("si_04", "أَحَدٌ"),
    ("si_05", "الصَّمَدُ"),
    ("si_06", "لَمْ"),
    ("si_07", "يَلِدْ"),
    ("si_08", "وَلَمْ"),
    ("si_09", "يُولَدْ"),
    ("si_10", "وَلَمْ"),
    ("si_11", "يَكُنْ"),
    ("si_12", "لَهُ"),
    ("si_13", "كُفُوًا"),

    # Surah Al-Asr (Word by Word)
    ("sa_01", "وَالْعَصْرِ"),
    ("sa_02", "إِنَّ"),
    ("sa_03", "الْإِنْسَانَ"),
    ("sa_04", "لَفِي"),
    ("sa_05", "خُسْرٍ"),
    ("sa_06", "إِلَّا"),
    ("sa_07", "الَّذِينَ"),
    ("sa_08", "آمَنُوا"),
    ("sa_09", "وَعَمِلُوا"),
    ("sa_10", "الصَّالِحَاتِ"),
    ("sa_11", "وَتَوَاصَوْا"),
    ("sa_12", "بِالْحَقِّ"),
    ("sa_13", "بِالصَّبْرِ"),
]


def render_one(item):
    key, text = item
    mp3_path = os.path.join(AUDIO_DIR, f"{key}.mp3")
    if os.path.exists(mp3_path):
        return key
    with tempfile.TemporaryDirectory() as tmpdir:
        aiff_path = os.path.join(tmpdir, f"{key}.aiff")
        subprocess.run(["say", "-v", "Majed", "-r", "145", "-o", aiff_path, text], check=True)
        subprocess.run(
            ["ffmpeg", "-y", "-i", aiff_path, "-codec:a", "libmp3lame", "-qscale:a", "5", mp3_path],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=True,
        )
    return key


with ThreadPoolExecutor(max_workers=4) as ex:
    done = list(ex.map(render_one, TASKS))

print(f"Generated/verified {len(done)} curriculum audio files.")
