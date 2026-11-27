#!/usr/bin/env python3
"""Generate Madani Qaida spelling-style Harakat MP3s ('বা যবর বা', 'বা যের বি', 'বা পেশ বু') using bn-BD-PradeepNeural."""

import asyncio
import os
import edge_tts

AUDIO_DIR = "/Users/kamrul/Areas/Learn-Arabic/audio"
VOICE = "bn-BD-PradeepNeural"

# (letter_id, letter_name_bn, a_sound, i_sound, u_sound)
ITEMS = [
    ("alif", "আলিফ", "আ", "ই", "উ"),
    ("baa", "বা", "বা", "বি", "বু"),
    ("taa", "তা", "তা", "তি", "তু"),
    ("thaa", "ছা", "ছা", "ছি", "ছু"),
    ("jeem", "জীম", "জা", "জি", "জু"),
    ("haa_sharp", "হা", "হা", "হি", "হু"),
    ("khaa", "খ", "খ", "খি", "খু"),
    ("daal", "দাল", "দা", "দি", "দু"),
    ("dhaal", "যাল", "যা", "যি", "যু"),
    ("raa", "র", "র", "রি", "রু"),
    ("zaa", "যা", "যা", "যি", "যু"),
    ("seen", "সীন", "সা", "সি", "সু"),
    ("sheen", "শীন", "শা", "শি", "শু"),
    ("saad", "ছদ", "ছ", "ছি", "ছু"),
    ("daad", "দ্বদ", "দ্ব", "দ্বি", "দ্বু"),
    ("taa_heavy", "ত্ব", "ত্ব", "ত্বি", "ত্বু"),
    ("zaa_heavy", "জ্ব", "জ্ব", "জ্বি", "জ্বু"),
    ("ain", "আ-ইন", "আ", "ই", "উ"),
    ("ghain", "গ-ইন", "গ", "গি", "গু"),
    ("faa", "ফা", "ফা", "ফি", "ফু"),
    ("qaaf", "ক্বফ", "ক্ব", "ক্বি", "ক্বু"),
    ("kaaf", "কাফ", "কা", "কি", "কু"),
    ("laam", "লা-ম", "লা", "লি", "লু"),
    ("meem", "মীম", "মা", "মি", "মু"),
    ("noon", "নূন", "না", "নি", "নু"),
    ("waaw", "ওয়াও", "ওয়া", "উই", "উ"),
    ("haa_soft", "হা", "হা", "হি", "হু"),
    ("yaa", "ইয়া", "ইয়া", "ইয়ি", "ইউ"),
]

TASKS = []
for lid, name, a_s, i_s, u_s in ITEMS:
    TASKS.append((f"hz_{lid}_a", f"{name}, যবর {a_s}"))
    TASKS.append((f"hz_{lid}_i", f"{name}, যের {i_s}"))
    TASKS.append((f"hz_{lid}_u", f"{name}, পেশ {u_s}"))


async def gen_all():
    sem = asyncio.Semaphore(4)

    async def gen_one(key, text):
        out_path = os.path.join(AUDIO_DIR, f"{key}.mp3")
        async with sem:
            for attempt in range(3):
                try:
                    comm = edge_tts.Communicate(text, VOICE, rate="-8%")
                    await comm.save(out_path)
                    return
                except Exception:
                    await asyncio.sleep(0.5)

    await asyncio.gather(*(gen_one(k, t) for k, t in TASKS))
    print(f"Generated/verified {len(TASKS)} Madani Qaida Harakat spelling MP3s.")


asyncio.run(gen_all())
