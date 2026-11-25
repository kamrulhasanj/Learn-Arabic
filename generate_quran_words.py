#!/usr/bin/env python3
"""Generate quran_words.js and 100 offline MP3s for high-frequency Quranic words."""

import json
import os
import subprocess
import tempfile
from concurrent.futures import ThreadPoolExecutor

AUDIO_DIR = "/Users/kamrul/Areas/Learn-Arabic/audio"
os.makedirs(AUDIO_DIR, exist_ok=True)

# 100 high-frequency Quranic words: (arabic_with_harakat, bn_meaning, first_letter_id, mid_letter_id, last_letter_id)
WORDS = [
    ("اَللّٰهُ", "আল্লাহ", "alif", "laam", "haa_soft"),
    ("مُوْسٰى", "মূসা (আ.)", "meem", "waaw", "yaa_maqsura"),
    ("عِيْسٰى", "ঈসা (আ.)", "ain", "yaa", "yaa_maqsura"),
    ("مُحَمَّدٌ", "মুহাম্মাদ (সা.)", "meem", "haa_sharp", "daal"),
    ("قُرْاٰنٌ", "কোরআন", "qaaf", "raa", "noon"),
    ("رَبُّ", "রব / প্রতিপালক", "raa", "baa", "baa"),
    ("رَحْمٰنٌ", "পরম করুণাময়", "raa", "haa_sharp", "noon"),
    ("رَحِيْمٌ", "অতি দয়ালু", "raa", "haa_sharp", "meem"),
    ("مَلِكٌ", "অধিপতি / বাদশাহ", "meem", "laam", "kaaf"),
    ("يَوْمٌ", "দিন / দিবস", "yaa", "waaw", "meem"),
    ("دِيْنٌ", "দীন / জীবনব্যবস্থা", "daal", "yaa", "noon"),
    ("صِرَاطٌ", "পথ / রাস্তা", "saad", "raa", "taa_heavy"),
    ("نَعْبُدُ", "আমরা ইবাদত করি", "noon", "ain", "daal"),
    ("عَلِمَ", "সে জেনেছে", "ain", "laam", "meem"),
    ("خَلَقَ", "তিনি সৃষ্টি করেছেন", "khaa", "laam", "qaaf"),
    ("نَصَرَ", "সাহায্য করেছে", "noon", "saad", "raa"),
    ("كَتَبَ", "লিখেছে / ফরয করেছে", "kaaf", "taa", "baa"),
    ("سَجَدَ", "সিজদা করেছে", "seen", "jeem", "daal"),
    ("فَتَحَ", "খুলে দিয়েছে", "faa", "taa", "haa_sharp"),
    ("ذَكَرَ", "স্মরণ করেছে", "dhaal", "kaaf", "raa"),
    ("شَكَرَ", "কৃতজ্ঞতা প্রকাশ করেছে", "sheen", "kaaf", "raa"),
    ("صَدَقَ", "সত্য বলেছে", "saad", "daal", "qaaf"),
    ("غَفَرَ", "ক্ষমা করেছে", "ghain", "faa", "raa"),
    ("رَزَقَ", "রিযিক দিয়েছে", "raa", "zaa", "qaaf"),
    ("اٰمَنَ", "ঈমান এনেছে", "alif", "meem", "noon"),
    ("عَمِلَ", "আমল / কাজ করেছে", "ain", "meem", "laam"),
    ("صَالِحٌ", "নেককার / সৎ", "saad", "laam", "haa_sharp"),
    ("حَقٌّ", "সত্য / অধিকার", "haa_sharp", "qaaf", "qaaf"),
    ("صَبْرٌ", "ধৈর্য", "saad", "baa", "raa"),
    ("سَمَاءٌ", "আকাশ / আসমান", "seen", "meem", "hamzah"),
    ("اَرْضٌ", "পৃথিবী / জমিন", "alif", "raa", "daad"),
    ("شَمْسٌ", "সূর্য", "sheen", "meem", "seen"),
    ("قَمَرٌ", "চাঁদ", "qaaf", "meem", "raa"),
    ("لَيْلٌ", "রাত", "laam", "yaa", "laam"),
    ("نَهَارٌ", "দিন / সকাল-সন্ধ্যা", "noon", "haa_soft", "raa"),
    ("مَاءٌ", "পানি", "meem", "alif", "hamzah"),
    ("نَارٌ", "আগুন", "noon", "alif", "raa"),
    ("جَنَّةٌ", "জান্নাত / বাগান", "jeem", "noon", "taa"),
    ("نَبِيٌّ", "নবী", "noon", "baa", "yaa"),
    ("رَسُوْلٌ", "রাসূল / বার্তাবাহক", "raa", "seen", "laam"),
    ("كِتَابٌ", "কিতাব / গ্রন্থ", "kaaf", "taa", "baa"),
    ("حِكْمَةٌ", "হিকমত / প্রজ্ঞা", "haa_sharp", "kaaf", "taa"),
    ("نُوْرٌ", "নূর / আলো", "noon", "waaw", "raa"),
    ("هُدًى", "হেদায়াত / সঠিক পথ", "haa_soft", "daal", "yaa_maqsura"),
    ("تَقْوٰى", "তাকওয়া / আল্লাহভীতি", "taa", "qaaf", "yaa_maqsura"),
    ("اِيْمَانٌ", "ঈমান / বিশ্বাস", "alif", "meem", "noon"),
    ("اِسْلَامٌ", "ইসলাম", "alif", "seen", "meem"),
    ("صَلٰوةٌ", "নামাজ / সালাত", "saad", "laam", "taa"),
    ("زَكٰوةٌ", "যাকাত", "zaa", "kaaf", "taa"),
    ("صَوْمٌ", "রোজা / সিয়াম", "saad", "waaw", "meem"),
    ("حَجٌّ", "হজ্জ", "haa_sharp", "jeem", "jeem"),
    ("دُعَاءٌ", "দোয়া / প্রার্থনা", "daal", "ain", "hamzah"),
    ("ذِكْرٌ", "যিকির / স্মরণ", "dhaal", "kaaf", "raa"),
    ("تَوْبَةٌ", "তাওবা / প্রত্যাবর্তন", "taa", "waaw", "taa"),
    ("شُكْرٌ", "শোকর / কৃতজ্ঞতা", "sheen", "kaaf", "raa"),
    ("عَفْوٌ", "ক্ষমা / মাফ", "ain", "faa", "waaw"),
    ("رَحْمَةٌ", "রহমত / দয়া", "raa", "haa_sharp", "taa"),
    ("نِعْمَةٌ", "নিয়ামত / অনুগ্রহ", "noon", "ain", "taa"),
    ("فَضْلٌ", "অনুগ্রহ / মর্যাদা", "faa", "daad", "laam"),
    ("خَيْرٌ", "কল্যাণ / ভালো", "khaa", "yaa", "raa"),
    ("شَرٌّ", "অকল্যাণ / মন্দ", "sheen", "raa", "raa"),
    ("حَسَنَةٌ", "নেকী / ভালো কাজ", "haa_sharp", "seen", "taa"),
    ("قَلْبٌ", "অন্তর / হৃদয়", "qaaf", "laam", "baa"),
    ("نَفْسٌ", "নফস / আত্মা", "noon", "faa", "seen"),
    ("عَقْلٌ", "বুদ্ধি / বিবেক", "ain", "qaaf", "laam"),
    ("عَيْنٌ", "চোখ / ঝরনা", "ain", "yaa", "noon"),
    ("يَدٌ", "হাত", "yaa", "daal", "daal"),
    ("بَيْتٌ", "ঘর", "baa", "yaa", "taa"),
    ("مَسْجِدٌ", "মসজিদ", "meem", "seen", "daal"),
    ("قَرْيَةٌ", "গ্রাম / জনপদ", "qaaf", "raa", "taa"),
    ("بَلَدٌ", "শহর / দেশ", "baa", "laam", "daal"),
    ("بَحْرٌ", "সমুদ্র", "baa", "haa_sharp", "raa"),
    ("جَبَلٌ", "পাহাড়", "jeem", "baa", "laam"),
    ("شَجَرٌ", "গাছপালা", "sheen", "jeem", "raa"),
    ("ثَمَرٌ", "ফলমূল", "thaa", "meem", "raa"),
    ("مَلَكٌ", "ফেরেশতা", "meem", "laam", "kaaf"),
    ("شَيْطَانٌ", "শয়তান", "sheen", "yaa", "noon"),
    ("اِنْسَانٌ", "মানুষ", "alif", "noon", "noon"),
    ("قَوْمٌ", "সম্প্রদায় / জাতি", "qaaf", "waaw", "meem"),
    ("اُمَّةٌ", "উম্মত / জাতি", "alif", "meem", "taa"),
    ("اَبٌ", "পিতা / বাবা", "alif", "baa", "baa"),
    ("اُمٌّ", "মাতা / মা", "alif", "meem", "meem"),
    ("اَخٌ", "ভাই", "alif", "khaa", "khaa"),
    ("اِبْنٌ", "পুত্র / ছেলে", "alif", "baa", "noon"),
    ("زَوْجٌ", "স্বামী / স্ত্রী", "zaa", "waaw", "jeem"),
    ("عَبْدٌ", "বান্দা / দাস", "ain", "baa", "daal"),
    ("وَلِيٌّ", "অভিভাবক / বন্ধু", "waaw", "laam", "yaa"),
    ("شَهِيْدٌ", "শহীদ / সাক্ষী", "sheen", "haa_soft", "daal"),
    ("مُؤْمِنٌ", "মুমিন / বিশ্বাসী", "meem", "hamzah", "noon"),
    ("مُسْلِمٌ", "মুসলিম / আত্মসমর্পণকারী", "meem", "seen", "meem"),
    ("ظَالِمٌ", "জালিম / অত্যাচারী", "zaa_heavy", "laam", "meem"),
    ("مُحْسِنٌ", "সৎকর্মশীল", "meem", "haa_sharp", "noon"),
    ("صَابِرٌ", "ধৈর্যশীল", "saad", "baa", "raa"),
    ("شَاكِرٌ", "কৃতজ্ঞ", "sheen", "kaaf", "raa"),
    ("عَلِيْمٌ", "সর্বজ্ঞ", "ain", "laam", "meem"),
    ("حَكِيْمٌ", "প্রজ্ঞাময়", "haa_sharp", "kaaf", "meem"),
    ("عَزِيْزٌ", "পরাক্রমশালী", "ain", "zaa", "zaa"),
    ("غَفُوْرٌ", "ক্ষমাশীল", "ghain", "faa", "raa"),
    ("كَرِيْمٌ", "সম্মানিত / দাতা", "kaaf", "raa", "meem"),
    ("سَمِيْعٌ", "সর্বশ্রোতা", "seen", "meem", "ain"),
]

assert len(WORDS) == 100

js_list = []
tasks = []
for idx, (word, bn, f_id, m_id, l_id) in enumerate(WORDS, 1):
    key = f"qw_{idx:03d}"
    audio_rel = f"audio/{key}.mp3"
    js_list.append({
        "word": word,
        "bn": bn,
        "audio": audio_rel,
        "firstId": f_id,
        "midId": m_id,
        "lastId": l_id,
    })
    tasks.append((key, word))


def render_one(item):
    key, text = item
    mp3_path = os.path.join(AUDIO_DIR, f"{key}.mp3")
    if os.path.exists(mp3_path) and os.path.getsize(mp3_path) > 300:
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
    done = list(ex.map(render_one, tasks))

with open("/Users/kamrul/Areas/Learn-Arabic/quran_words.js", "w", encoding="utf-8") as f:
    f.write("// আল-কোরআনে বহুল ব্যবহৃত ১০০টি শব্দ (অফলাইন শব্দ বিশ্লেষণ কুইজের জন্য)\n")
    f.write("window.QURAN_WORDS = ")
    json.dump(js_list, f, ensure_ascii=False, indent=2)
    f.write(";\n")

print(f"Generated quran_words.js ({len(js_list)} words) and {len(done)} MP3s.")
