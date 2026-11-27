// মাদানী কায়দা — সম্পূর্ণ অফলাইন ডেটাবেজ (১নং সবক, ২নং সবক মুরাক্কাব, এবং ১৭টি মাখরাজ)

window.MADANI_DATA = {
  bismillah: "بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ",
  taawudh: "اَعُوْذُ بِاللّٰهِ مِنَ الشَّيْطٰنِ الرَّجِيْمِ",
  dua: "رَبِّ يَسِّرْ وَلَا تُعَسِّرْ وَتَمِّمْ عَلَيْنَا بِالْخَيْرِ",
  duaMeaning: "হে আমার রব! সহজ করে দিন, কঠিন করবেন না এবং কল্যাণের সাথে আমাদের কাজটি পূর্ণ করে দিন।",

  murakkabNote:
    "মুরাক্কাব : ডাইনের হরফকে বামের হরফের সঙ্গে মিলাইয়া লিখাকে বলে। আরবী হরফগুলি মিলিত অবস্থায় তাহার ডান মাথা অথবা নুকতা দেখিয়া চিনিতে হয় বা চিনা যায়।",

  letters: [
    {
      id: "alif",
      order: 1,
      char: "ا",
      bnName: "আলিফ",
      translit: "Alif",
      audio: "audio/01_alif.mp3",
      makhrajIds: [16],
      makhrajSummary: "খালি আলিফ মুখের খালী জায়গা (জাওফ) হইতে মাদ হিসেবে উচ্চারিত হয়; আর যবর/যের/পেশ যুক্ত হলে তা হামযার মতো হলকের শুরু থেকে পড়া হয়।",
      tip: "আলিফ বামের কোনো হরফের সাথে মিলে না। খালি আলিফের আগে যবর থাকলে টেনে (১ আলিফ মাদ) পড়তে হয়।",
      nuqta: "নুকতা নেই",
      quality: "পাতলা (তারকীক) — তবে মোটা হরফের পর আসলে মোটা হয়",
      nonJoiningLeft: true,
      forms: { isolated: "ا", initial: "ا", medial: "ـا", final: "ـا" },
      examples: { initial: "اَبٌ", medial: "قَالَ", final: "لَا" }
    },
    {
      id: "baa",
      order: 2,
      char: "ب",
      bnName: "বা",
      translit: "Baa",
      audio: "audio/02_baa.mp3",
      makhrajIds: [15],
      makhrajSummary: "দুই ঠোঁটের ভেজা অংশ একত্রিত করে উচ্চারিত হয় (মাখরাজ ১৫)।",
      tip: "নিচে ১টি নুকতা। সাকিন অবস্থায় 'বা' হরফে কলকলাহ (প্রতিধ্বনি) হয়।",
      nuqta: "নিচে ১টি নুকতা",
      quality: "পাতলা (তারকীক) ও কলকলাহ হরফ",
      nonJoiningLeft: false,
      forms: { isolated: "ب", initial: "بـ", medial: "ـبـ", final: "ـب" },
      examples: { initial: "بِسْمِ", medial: "عَبْدٌ", final: "كِتَابٌ" }
    },
    {
      id: "taa",
      order: 3,
      char: "ت",
      bnName: "তা",
      translit: "Taa",
      audio: "audio/03_taa.mp3",
      makhrajIds: [11],
      makhrajSummary: "জিহ্বার আগা সামনের উপরের দুই দাঁতের গোড়ার সঙ্গে লাগাইয়া (মাখরাজ ১১)।",
      tip: "উপরে ২টি নুকতা। বাংলা 'ত'-এর মতো তবে জিহ্বার আগা উপরের দাঁতের গোড়ায় লাগিয়ে নরমভাবে উচ্চারণ করতে হয়।",
      nuqta: "উপরে ২টি নুকতা",
      quality: "পাতলা (তারকীক)",
      nonJoiningLeft: false,
      forms: { isolated: "ت", initial: "تـ", medial: "ـتـ", final: "ـت" },
      examples: { initial: "تَبَّتْ", medial: "كِتَابٌ", final: "بَيْتٌ" }
    },
    {
      id: "thaa",
      order: 4,
      char: "ث",
      bnName: "ছা",
      translit: "Thaa",
      audio: "audio/04_thaa.mp3",
      makhrajIds: [13],
      makhrajSummary: "জিহ্বার আগা সামনের উপরের দুই দাঁতের আগার সঙ্গে লাগাইয়া (মাখরাজ ১৩)।",
      tip: "উপরে ৩টি নুকতা। একদম নরমভাবে উচ্চারিত হবে—সিস বা শিস শব্দ হবে না (বাংলা 'স' এর মতো নয়, ইংরেজি 'th' in think-এর মতো)।",
      nuqta: "উপরে ৩টি নুকতা",
      quality: "নরম ও পাতলা",
      nonJoiningLeft: false,
      forms: { isolated: "ث", initial: "ثـ", medial: "ـثـ", final: "ـث" },
      examples: { initial: "ثُمَّ", medial: "مَثَلٌ", final: "بَعَثَ" }
    },
    {
      id: "jeem",
      order: 5,
      char: "ج",
      bnName: "জীম",
      translit: "Jeem",
      audio: "audio/05_jeem.mp3",
      makhrajIds: [6],
      makhrajSummary: "জিহ্বার মধ্যখান তার বরাবর উপরের তালুর সঙ্গে লাগাইয়া (মাখরাজ ৬)।",
      tip: "পেটের ভিতরে/নিচে ১টি নুকতা। সাকিন অবস্থায় কলকলাহ হয় এবং শক্তভাবে 'জ' উচ্চারণ হয় (বাতাস ছাড়া)।",
      nuqta: "নিচে/ভিতরে ১টি নুকতা",
      quality: "শক্ত ও কলকলাহ হরফ",
      nonJoiningLeft: false,
      forms: { isolated: "ج", initial: "جـ", medial: "ـجـ", final: "ـج" },
      examples: { initial: "جَعَلَ", medial: "سَجَدَ", final: "حَجٌّ" }
    },
    {
      id: "haa_sharp",
      order: 6,
      char: "ح",
      bnName: "হা",
      translit: "Haa (ḥ)",
      audio: "audio/06_haa_sharp.mp3",
      makhrajIds: [2],
      makhrajSummary: "হলকের (গলার) মধ্যখান হইতে চাপ দিয়ে চিকন ও তীক্ষ্ণভাবে (মাখরাজ ২)।",
      tip: "নুকতা নেই। গলার মাঝখান থেকে পরিষ্কার বাতাসসহ 'হ্‌হা' উচ্চারণ হয়—এটি 'ه' (গোল হা) থেকে আলাদা।",
      nuqta: "নুকতা নেই",
      quality: "পাতলা ও হলকী হরফ",
      nonJoiningLeft: false,
      forms: { isolated: "ح", initial: "حـ", medial: "ـحـ", final: "ـح" },
      examples: { initial: "حَمْدٌ", medial: "رَحْمٰنٌ", final: "فَتَحَ" }
    },
    {
      id: "khaa",
      order: 7,
      char: "خ",
      bnName: "খ",
      translit: "Khaa",
      audio: "audio/07_khaa.mp3",
      makhrajIds: [3],
      makhrajSummary: "হলকের (গলার) শেষ অর্থাৎ মুখের দিকের অংশ হইতে মোটা ও ঘর্ষণসহ (মাখরাজ ৩)।",
      tip: "উপরে ১টি নুকতা। এটি মোটা (পুর/ইসতি'লা) হরফ—গলার উপরের অংশ থেকে হালকা ঘর্ষণের সাথে উচ্চারিত হয়।",
      nuqta: "উপরে ১টি নুকতা",
      quality: "মোটা (পুর / ইসতি'লা)",
      nonJoiningLeft: false,
      forms: { isolated: "خ", initial: "خـ", medial: "ـخـ", final: "ـخ" },
      examples: { initial: "خَلَقَ", medial: "دَخَلَ", final: "نَسَخَ" }
    },
    {
      id: "daal",
      order: 8,
      char: "د",
      bnName: "দাল",
      translit: "Daal",
      audio: "audio/08_daal.mp3",
      makhrajIds: [11],
      makhrajSummary: "জিহ্বার আগা সামনের উপরের দুই দাঁতের গোড়ার সঙ্গে লাগাইয়া (মাখরাজ ১১)।",
      tip: "নুকতা নেই এবং বামের হরফের সাথে মিলে না। সাকিন অবস্থায় কলকলাহ হয়।",
      nuqta: "নুকতা নেই",
      quality: "পাতলা ও কলকলাহ হরফ",
      nonJoiningLeft: true,
      forms: { isolated: "د", initial: "د", medial: "ـد", final: "ـد" },
      examples: { initial: "دَخَلَ", medial: "عَبْدٌ", final: "حَمْدٌ" }
    },
    {
      id: "dhaal",
      order: 9,
      char: "ذ",
      bnName: "যাল",
      translit: "Dhaal",
      audio: "audio/09_dhaal.mp3",
      makhrajIds: [13],
      makhrajSummary: "জিহ্বার আগা সামনের উপরের দুই দাঁতের আগার সঙ্গে লাগাইয়া (মাখরাজ ১৩)।",
      tip: "উপরে ১টি নুকতা। বামের হরফের সাথে মিলে না। নরমভাবে উচ্চারণ হবে (ইংরেজি 'th' in this-এর মতো), বাজবে না।",
      nuqta: "উপরে ১টি নুকতা",
      quality: "নরম ও পাতলা",
      nonJoiningLeft: true,
      forms: { isolated: "ذ", initial: "ذ", medial: "ـذ", final: "ـذ" },
      examples: { initial: "ذٰلِكَ", medial: "اِذَا", final: "اَخَذَ" }
    },
    {
      id: "raa",
      order: 10,
      char: "ر",
      bnName: "র",
      translit: "Raa",
      audio: "audio/10_raa.mp3",
      makhrajIds: [10],
      makhrajSummary: "জিহ্বার আগার পিঠ তার বরাবর উপরের তালুর সঙ্গে লাগাইয়া (মাখরাজ ১০)।",
      tip: "নুকতা নেই এবং বামের হরফের সাথে মিলে না। যবর বা পেশ থাকলে 'র' মোটা, আর যের থাকলে পাতলা হয়।",
      nuqta: "নুকতা নেই",
      quality: "অবস্থাভেদে মোটা বা পাতলা",
      nonJoiningLeft: true,
      forms: { isolated: "ر", initial: "ر", medial: "ـر", final: "ـر" },
      examples: { initial: "رَبِّ", medial: "قَرَأَ", final: "بَشَرٌ" }
    },
    {
      id: "zaa",
      order: 11,
      char: "ز",
      bnName: "যা",
      translit: "Zaa",
      audio: "audio/11_zaa.mp3",
      makhrajIds: [12],
      makhrajSummary: "জিহ্বার আগা সামনের নীচের দুই দাঁতের পেট ও আগার সঙ্গে লাগাইয়া (মাখরাজ ১২)।",
      tip: "উপরে ১টি নুকতা। বামের হরফের সাথে মিলে না। মৌমাছির গুনগুনের মতো পরিষ্কার শিস ধ্বনিতে উচ্চারিত হয়।",
      nuqta: "উপরে ১টি নুকতা",
      quality: "ছাফীর (শিসযুক্ত) ও পাতলা",
      nonJoiningLeft: true,
      forms: { isolated: "ز", initial: "ز", medial: "ـز", final: "ـز" },
      examples: { initial: "زَكٰوةٌ", medial: "نَزَلَ", final: "عَزَّ" }
    },
    {
      id: "seen",
      order: 12,
      char: "س",
      bnName: "সীন",
      translit: "Seen",
      audio: "audio/12_seen.mp3",
      makhrajIds: [12],
      makhrajSummary: "জিহ্বার আগা সামনের নীচের দুই দাঁতের পেট ও আগার সঙ্গে লাগাইয়া (মাখরাজ ১২)।",
      tip: "নুকতা নেই, ৩টি দাঁত/দাঁড়া আছে। পাতলা ও তীক্ষ্ণ শিস শব্দে 'স' উচ্চারণ হয়।",
      nuqta: "নুকতা নেই",
      quality: "ছাফীর (শিসযুক্ত) ও পাতলা",
      nonJoiningLeft: false,
      forms: { isolated: "س", initial: "سـ", medial: "ـسـ", final: "ـس" },
      examples: { initial: "سَمِعَ", medial: "بِسْمِ", final: "نَفْسٌ" }
    },
    {
      id: "sheen",
      order: 13,
      char: "ش",
      bnName: "শীন",
      translit: "Sheen",
      audio: "audio/13_sheen.mp3",
      makhrajIds: [6],
      makhrajSummary: "জিহ্বার মধ্যখান তার বরাবর উপরের তালুর সঙ্গে লাগাইয়া (মাখরাজ ৬)।",
      tip: "উপরে ৩টি নুকতা। মুখের ভিতরে বাতাস ছড়িয়ে (তাফাশশী) 'শ' উচ্চারণ করতে হয়।",
      nuqta: "উপরে ৩টি নুকতা",
      quality: "তাফাশশী (বাতাস ছড়ানো) ও পাতলা",
      nonJoiningLeft: false,
      forms: { isolated: "ش", initial: "شـ", medial: "ـشـ", final: "ـش" },
      examples: { initial: "شَكَرَ", medial: "يَشَاءُ", final: "عَرْشٌ" }
    },
    {
      id: "saad",
      order: 14,
      char: "ص",
      bnName: "ছদ",
      translit: "Saad",
      audio: "audio/14_saad.mp3",
      makhrajIds: [12],
      makhrajSummary: "জিহ্বার আগা সামনের নীচের দুই দাঁতের পেট ও আগার সঙ্গে লাগাইয়া মোটা করে (মাখরাজ ১২)।",
      tip: "নুকতা নেই। এটি মোটা (পুর) হরফ—মুখ গোল না করেই জিহ্বার গোড়া উঁচু করে শিসসহ মোটা করে পড়তে হয়।",
      nuqta: "নুকতা নেই",
      quality: "মোটা (পুর / ইসতি'লা) ও ছাফীর",
      nonJoiningLeft: false,
      forms: { isolated: "ص", initial: "صـ", medial: "ـصـ", final: "ـص" },
      examples: { initial: "صَدَقَ", medial: "نَصَرَ", final: "اَخْلَصَ" }
    },
    {
      id: "daad",
      order: 15,
      char: "ض",
      bnName: "দ্বদ",
      translit: "Daad",
      audio: "audio/15_daad.mp3",
      makhrajIds: [7],
      makhrajSummary: "জিহ্বার গোড়ার কিনারা উপরের মাড়ীর দাঁতের গোড়ার সঙ্গে লাগাইয়া (মাখরাজ ৭)।",
      tip: "উপরে ১টি নুকতা। আরবি ভাষার অনন্য মোটা হরফ—জিহ্বার ডান বা বাম কিনারা উপরের মাড়ির দাঁতে লাগিয়ে মোটা করে পড়তে হয়।",
      nuqta: "উপরে ১টি নুকতা",
      quality: "মোটা (পুর) ও ইসতিতলাহ",
      nonJoiningLeft: false,
      forms: { isolated: "ض", initial: "ضـ", medial: "ـضـ", final: "ـض" },
      examples: { initial: "ضَرَبَ", medial: "فَضْلٌ", final: "اَرْضٌ" }
    },
    {
      id: "taa_heavy",
      order: 16,
      char: "ط",
      bnName: "ত্ব",
      translit: "Taa (ṭ)",
      audio: "audio/16_taa_heavy.mp3",
      makhrajIds: [11],
      makhrajSummary: "জিহ্বার আগা সামনের উপরের দুই দাঁতের গোড়ার সঙ্গে লাগাইয়া মোটা করে (মাখরাজ ১১)।",
      tip: "নুকতা নেই। শুরু, মাঝ ও শেষে প্রায় একই আকৃতিতে থাকে। মোটা হরফ ও সাকিনে কলকলাহ হয়।",
      nuqta: "নুকতা নেই",
      quality: "সবচেয়ে শক্তিশালী মোটা ও কলকলাহ হরফ",
      nonJoiningLeft: false,
      forms: { isolated: "ط", initial: "طـ", medial: "ـطـ", final: "ـط" },
      examples: { initial: "طَيِّبٌ", medial: "شَيْطٰنٌ", final: "وَسَطًا" }
    },
    {
      id: "zaa_heavy",
      order: 17,
      char: "ظ",
      bnName: "জ্ব",
      translit: "Zaa (ẓ)",
      audio: "audio/17_zaa_heavy.mp3",
      makhrajIds: [13],
      makhrajSummary: "জিহ্বার আগা সামনের উপরের দুই দাঁতের আগার সঙ্গে লাগাইয়া মোটা করে (মাখরাজ ১৩)।",
      tip: "উপরে ১টি নুকতা। জিহ্বার আগা দাঁতের আগায় রেখে মোটা (পুর) আওয়াজে উচ্চারণ করতে হয়।",
      nuqta: "উপরে ১টি নুকতা",
      quality: "মোটা (পুর / ইসতি'লা) ও নরম",
      nonJoiningLeft: false,
      forms: { isolated: "ظ", initial: "ظـ", medial: "ـظـ", final: "ـظ" },
      examples: { initial: "ظَلَمَ", medial: "عَظِيْمٌ", final: "حَفِظَ" }
    },
    {
      id: "ain",
      order: 18,
      char: "ع",
      bnName: "আইন",
      translit: "'Ain",
      audio: "audio/18_ain.mp3",
      makhrajIds: [2],
      makhrajSummary: "হলকের (গলার) মধ্যখান হইতে গভীরভাবে চাপ দিয়ে (মাখরাজ ২)।",
      tip: "নুকতা নেই। মিলিত অবস্থায় মাঝখানে ও শেষে মাথা ভরাট হয়ে ত্রিকোণাকৃতি (ـعـ / ـع) হয়।",
      nuqta: "নুকতা নেই",
      quality: "হলকী ও পাতলা",
      nonJoiningLeft: false,
      forms: { isolated: "ع", initial: "عـ", medial: "ـعـ", final: "ـع" },
      examples: { initial: "عَلِمَ", medial: "يَعْلَمُ", final: "سَمِعَ" }
    },
    {
      id: "ghain",
      order: 19,
      char: "غ",
      bnName: "গ্বইন",
      translit: "Ghain",
      audio: "audio/19_ghain.mp3",
      makhrajIds: [3],
      makhrajSummary: "হলকের (গলার) শেষ হইতে গড়গড়ে আওয়াজে মোটা করে (মাখরাজ ৩)।",
      tip: "উপরে ১টি নুকতা। কুলকুচি করার মতো গলার উপরের দিক থেকে মোটা করে উচ্চারিত হয়।",
      nuqta: "উপরে ১টি নুকতা",
      quality: "মোটা (পুর) ও হলকী",
      nonJoiningLeft: false,
      forms: { isolated: "غ", initial: "غـ", medial: "ـغـ", final: "ـغ" },
      examples: { initial: "غَفَرَ", medial: "مَغْفِرَةٌ", final: "بَلَغَ" }
    },
    {
      id: "faa",
      order: 20,
      char: "ف",
      bnName: "ফা",
      translit: "Faa",
      audio: "audio/20_faa.mp3",
      makhrajIds: [14],
      makhrajSummary: "নীচের ঠোঁটের পেট সামনের উপরের দুই দাঁতের আগার সঙ্গে লাগাইয়া (মাখরাজ ১৪)।",
      tip: "উপরে ১টি নুকতা। দুই ঠোঁট পুরো বন্ধ না করে উপরের দাঁত নিচের ঠোঁটের ভেতরের অংশে লাগিয়ে বাতাস ছেড়ে 'ফা' পড়ুন।",
      nuqta: "উপরে ১টি নুকতা",
      quality: "পাতলা (তারকীক)",
      nonJoiningLeft: false,
      forms: { isolated: "ف", initial: "فـ", medial: "ـفـ", final: "ـف" },
      examples: { initial: "فَتَحَ", medial: "كَفَرَ", final: "خَوْفٌ" }
    },
    {
      id: "qaaf",
      order: 21,
      char: "ق",
      bnName: "ক্বফ",
      translit: "Qaaf",
      audio: "audio/21_qaaf.mp3",
      makhrajIds: [4],
      makhrajSummary: "জিহ্বার গোড়া তার বরাবর উপরের নরম তালুর সঙ্গে লাগাইয়া, দুই নুকতাওয়ালা (মাখরাজ ৪)।",
      tip: "উপরে ২টি নুকতা। গলার কাছ থেকে জিহ্বার গোড়া দিয়ে মোটা করে 'ক্ব' উচ্চারণ হয় এবং সাকিনে কলকলাহ হয়।",
      nuqta: "উপরে ২টি নুকতা",
      quality: "মোটা (পুর) ও কলকলাহ হরফ",
      nonJoiningLeft: false,
      forms: { isolated: "ق", initial: "قـ", medial: "ـقـ", final: "ـق" },
      examples: { initial: "قَالَ", medial: "يَقُوْلُ", final: "خَلَقَ" }
    },
    {
      id: "kaaf",
      order: 22,
      char: "ك",
      bnName: "কাফ",
      translit: "Kaaf",
      audio: "audio/22_kaaf.mp3",
      makhrajIds: [5],
      makhrajSummary: "জিহ্বার গোড়া হইতে একটু আগে বাড়িয়া তার বরাবর উপরের তালুর সঙ্গে লাগাইয়া, মধ্যখান পেঁচানো (মাখরাজ ৫)।",
      tip: "নুকতা নেই (ভিতরে ছোট পেঁচানো অংশ থাকে)। শুরু ও মাঝখানে আকৃতি বদলে 'کـ / ـکـ' হয়ে যায়—এটি মাদানী কায়দায় খুব গুরুত্বপূর্ণ!",
      nuqta: "নুকতা নেই (মধ্যখান পেঁচানো)",
      quality: "পাতলা (তারকীক)",
      nonJoiningLeft: false,
      forms: { isolated: "ك", initial: "كـ", medial: "ـكـ", final: "ـك" },
      examples: { initial: "كِتَابٌ", medial: "شَكَرَ", final: "مَلِكٌ" }
    },
    {
      id: "laam",
      order: 23,
      char: "ل",
      bnName: "লাম",
      translit: "Laam",
      audio: "audio/23_laam.mp3",
      makhrajIds: [8],
      makhrajSummary: "জিহ্বার আগার কিনারা সামনের উপরের দাঁতের মাড়ীর সঙ্গে লাগাইয়া (মাখরাজ ৮)।",
      tip: "নুকতা নেই। দেখতে লম্বা দাঁড়ির মতো হলেও বামের হরফের সাথে যুক্ত হয় (যা আলিফের সাথে হয় না)।",
      nuqta: "নুকতা নেই",
      quality: "পাতলা (তবে 'আল্লাহ' শব্দে যবর/পেশের পর মোটা হয়)",
      nonJoiningLeft: false,
      forms: { isolated: "ل", initial: "لـ", medial: "ـلـ", final: "ـل" },
      examples: { initial: "لَهُ", medial: "عَلِمَ", final: "جَعَلَ" }
    },
    {
      id: "meem",
      order: 24,
      char: "م",
      bnName: "মীম",
      translit: "Meem",
      audio: "audio/24_meem.mp3",
      makhrajIds: [15],
      makhrajSummary: "দুই ঠোঁটের শুকনো অংশ একত্রিত করে উচ্চারিত হয় (মাখরাজ ১৫)।",
      tip: "নুকতা নেই। তাশদীদ (مّ) থাকলে নাকের বাঁশি থেকে গুন্নাহ করে পড়তে হয় (মাখরাজ ১৭)।",
      nuqta: "নুকতা নেই",
      quality: "পাতলা; তাশদীদে গুন্নাহ ওয়াজিব",
      nonJoiningLeft: false,
      forms: { isolated: "م", initial: "مـ", medial: "ـمـ", final: "ـم" },
      examples: { initial: "مَلِكٌ", medial: "حَمْدٌ", final: "عَلِيْمٌ" }
    },
    {
      id: "noon",
      order: 25,
      char: "ن",
      bnName: "নূন",
      translit: "Noon",
      audio: "audio/25_noon.mp3",
      makhrajIds: [9],
      makhrajSummary: "জিহ্বার আগা তার বরাবর উপরের তালুর সঙ্গে লাগাইয়া (মাখরাজ ৯)।",
      tip: "উপরে ১টি নুকতা। শুরু ও মাঝখানে 'ب/ت/ث'-এর মতো দাঁত নিয়ে উপরে ১টি নুকতা থাকে। তাশদীদে (نّ) গুন্নাহ ওয়াজিব।",
      nuqta: "উপরে ১টি নুকতা",
      quality: "পাতলা; তাশদীদে গুন্নাহ ওয়াজিব",
      nonJoiningLeft: false,
      forms: { isolated: "ن", initial: "نـ", medial: "ـنـ", final: "ـن" },
      examples: { initial: "نَصَرَ", medial: "مِنْهُ", final: "رَحْمٰنٌ" }
    },
    {
      id: "waaw",
      order: 26,
      char: "و",
      bnName: "ওয়াও",
      translit: "Waaw",
      audio: "audio/26_waaw.mp3",
      makhrajIds: [15, 16],
      makhrajSummary: "দুই ঠোঁট গোল করে উচ্চারিত হয় (মাখরাজ ১৫)। মাদ অবস্থায় মুখের খালী জায়গা থেকে (মাখরাজ ১৬)।",
      tip: "নুকতা নেই এবং বামের হরফের সাথে মিলে না। উচ্চারণের সময় দুই ঠোঁট গোল করতে হয়।",
      nuqta: "নুকতা নেই",
      quality: "পাতলা",
      nonJoiningLeft: true,
      forms: { isolated: "و", initial: "و", medial: "ـو", final: "ـو" },
      examples: { initial: "وَجَدَ", medial: "يَوْمٌ", final: "هُوَ" }
    },
    {
      id: "haa_soft",
      order: 27,
      char: "ه",
      bnName: "হা",
      translit: "Haa (h)",
      audio: "audio/27_haa_soft.mp3",
      makhrajIds: [1],
      makhrajSummary: "হলকের (গলার) শুরু অর্থাৎ বুকের দিক থেকে নরমভাবে (মাখরাজ ১)।",
      tip: "নুকতা নেই। এর বিভিন্ন রূপ মনে রাখা জরুরি: শুরুতে هـ, মাঝে ـهـ (প্রজাপতির মতো), শেষে ـه বা হরকতহীন গোল হরফ।",
      nuqta: "নুকতা নেই",
      quality: "পাতলা ও হলকী হরফ",
      nonJoiningLeft: false,
      forms: { isolated: "ه", initial: "هـ", medial: "ـهـ", final: "ـه" },
      examples: { initial: "هُوَ", medial: "شَهْرٌ", final: "لَهُ" }
    },
    {
      id: "hamzah",
      order: 28,
      char: "ء",
      bnName: "হামযাহ",
      translit: "Hamzah",
      audio: "audio/28_hamzah.mp3",
      makhrajIds: [1],
      makhrajSummary: "হলকের (গলার) শুরু হইতে ঝটকা দিয়ে স্পষ্টভাবে (মাখরাজ ১)।",
      tip: "হামযাহ নিজে একা (ء) থাকতে পারে অথবা আলিফ (أ/إ), ওয়াও (ؤ), ইয়া (ئ)-এর উপরে চেয়ার নিয়ে বসে।",
      nuqta: "নুকতা নেই",
      quality: "পাতলা ও ঝটকা-যুক্ত (হলকী)",
      nonJoiningLeft: true,
      forms: { isolated: "ء", initial: "أ", medial: "ـئـ", final: "ـأ" },
      examples: { initial: "اَحَدٌ", medial: "سَأَلَ", final: "قَرَأَ" }
    },
    {
      id: "yaa_maqsura",
      order: 29,
      char: "ى",
      bnName: "ইয়া",
      translit: "Yaa (dotless)",
      audio: "audio/29_yaa.mp3",
      makhrajIds: [6],
      makhrajSummary: "জিহ্বার মধ্যখান তার বরাবর উপরের তালুর সঙ্গে লাগাইয়া (মাখরাজ ৬)।",
      tip: "মাদানী কায়দার ১নং সবকে 'ইয়া' হরফের দুইটি রূপ দেখানো হয়েছে—নুকতা ছাড়া এই রূপটিও কোরআনে (আলিফে মাকসুরা বা শেষে) ব্যবহৃত হয়।",
      nuqta: "নুকতা ছাড়া রূপ",
      quality: "পাতলা",
      nonJoiningLeft: false,
      forms: { isolated: "ى", initial: "يـ", medial: "ـيـ", final: "ـى" },
      examples: { initial: "يَوْمٌ", medial: "بَيْتٌ", final: "مُوْسٰى" }
    },
    {
      id: "yaa",
      order: 30,
      char: "ي",
      bnName: "ইয়া",
      translit: "Yaa",
      audio: "audio/29_yaa.mp3",
      makhrajIds: [6],
      makhrajSummary: "জিহ্বার মধ্যখান তার বরাবর উপরের তালুর সঙ্গে লাগাইয়া (মাখরাজ ৬)।",
      tip: "নিচে ২টি নুকতা। শুরু ও মাঝখানে নিচে ২ নুকতা থাকে, আর শেষে পূর্ণ 'ي' রূপে ফিরে আসে।",
      nuqta: "নিচে ২টি নুকতা",
      quality: "পাতলা",
      nonJoiningLeft: false,
      forms: { isolated: "ي", initial: "يـ", medial: "ـيـ", final: "ـي" },
      examples: { initial: "يَدٌ", medial: "عَلِيْمٌ", final: "فِيْ" }
    }
  ],

  // ২নং সবক পরীক্ষা (Image 1 এর নিচের অংশ)
  murakkabExam: [
    { form: "مـ", letterId: "meem", position: "শুরুর রূপ" },
    { form: "شـ", letterId: "sheen", position: "শুরুর রূপ" },
    { form: "ـهـ", letterId: "haa_soft", position: "মাঝের রূপ" },
    { form: "جـ", letterId: "jeem", position: "শুরুর রূপ" },
    { form: "ـتـ", letterId: "taa", position: "মাঝের রূপ" },
    { form: "ـب", letterId: "baa", position: "শেষের রূপ" },
    { form: "ء", letterId: "hamzah", position: "পূর্ণ রূপ" },

    { form: "ـغـ", letterId: "ghain", position: "মাঝের রূপ" },
    { form: "ظ", letterId: "zaa_heavy", position: "পূর্ণ রূপ" },
    { form: "قـ", letterId: "qaaf", position: "শুরুর রূপ" },
    { form: "سـ", letterId: "seen", position: "শুরুর রূপ" },
    { form: "ـض", letterId: "daad", position: "শেষের রূপ" },
    { form: "فـ", letterId: "faa", position: "শুরুর রূপ" },
    { form: "بـ", letterId: "baa", position: "শুরুর রূপ" },

    { form: "ن", letterId: "noon", position: "পূর্ণ রূপ" },
    { form: "ـيـ", letterId: "yaa", position: "মাঝের রূপ" },
    { form: "صـ", letterId: "saad", position: "শুরুর রূপ" },
    { form: "ثـ", letterId: "thaa", position: "শুরুর রূপ" },
    { form: "حـ", letterId: "haa_sharp", position: "শুরুর রূপ" },
    { form: "و", letterId: "waaw", position: "পূর্ণ রূপ" },
    { form: "خـ", letterId: "khaa", position: "শুরুর রূপ" },

    { form: "ـغ", letterId: "ghain", position: "শেষের রূপ" },
    { form: "كـ", letterId: "kaaf", position: "শুরুর রূপ" },
    { form: "ف", letterId: "faa", position: "পূর্ণ রূপ" },
    { form: "ـئـ", letterId: "hamzah", position: "মাঝের রূপ" },
    { form: "لـ", letterId: "laam", position: "শুরুর রূপ" },
    { form: "أ", letterId: "hamzah", position: "শুরুর রূপ" },
    { form: "ضـ", letterId: "daad", position: "শুরুর রূপ" }
  ],

  // ১৭টি মাখরাজ (Image 3 অনুযায়ী)
  makhrajList: [
    {
      num: 1,
      region: "throat",
      regionBn: "হলক (গলা)",
      title: "হলকের শুরু হইতে",
      description: "হলকের শুরু (বুকের দিকের নিচের অংশ) হইতে উচ্চারিত হয়।",
      letters: ["ء", "ه"],
      letterIds: ["hamzah", "haa_soft"]
    },
    {
      num: 2,
      region: "throat",
      regionBn: "হলক (গলা)",
      title: "হলকের মধ্যখান হইতে",
      description: "হলকের মধ্যখান হইতে উচ্চারিত হয়।",
      letters: ["ع", "ح"],
      letterIds: ["ain", "haa_sharp"]
    },
    {
      num: 3,
      region: "throat",
      regionBn: "হলক (গলা)",
      title: "হলকের শেষ হইতে",
      description: "হলকের শেষ (মুখের দিকের উপরের অংশ) হইতে উচ্চারিত হয়।",
      letters: ["غ", "خ"],
      letterIds: ["ghain", "khaa"]
    },
    {
      num: 4,
      region: "tongue",
      regionBn: "জিহ্বা",
      title: "জিহ্বার গোড়া ও উপরের তালু",
      description: "জিহ্বার গোড়া, তার বরাবর উপরের তালুর সঙ্গে লাগাইয়া, দুই নুকতাওয়ালা।",
      letters: ["ق"],
      letterIds: ["qaaf"]
    },
    {
      num: 5,
      region: "tongue",
      regionBn: "জিহ্বা",
      title: "জিহ্বার গোড়ার একটু আগে",
      description: "জিহ্বার গোড়া হইতে একটু আগে বাড়িয়া, তার বরাবর উপরের তালুর সঙ্গে লাগাইয়া, মধ্যখান পেঁচানো।",
      letters: ["ك"],
      letterIds: ["kaaf"]
    },
    {
      num: 6,
      region: "tongue",
      regionBn: "জিহ্বা",
      title: "জিহ্বার মধ্যখান ও উপরের তালু",
      description: "জিহ্বার মধ্যখান, তার বরাবর উপরের তালুর সঙ্গে লাগাইয়া।",
      letters: ["ج", "ش", "ي"],
      letterIds: ["jeem", "sheen", "yaa"]
    },
    {
      num: 7,
      region: "tongue",
      regionBn: "জিহ্বা",
      title: "জিহ্বার গোড়ার কিনারা ও মাড়ীর দাঁত",
      description: "জিহ্বার গোড়ার কিনারা, উপরের মাড়ীর দাঁতের গোড়ার সঙ্গে লাগাইয়া।",
      letters: ["ض"],
      letterIds: ["daad"]
    },
    {
      num: 8,
      region: "tongue",
      regionBn: "জিহ্বা",
      title: "জিহ্বার আগার কিনারা ও দাঁতের মাড়ী",
      description: "জিহ্বার আগার কিনারা, সামনের উপরের দাঁতের মাড়ীর সঙ্গে লাগাইয়া।",
      letters: ["ل"],
      letterIds: ["laam"]
    },
    {
      num: 9,
      region: "tongue",
      regionBn: "জিহ্বা",
      title: "জিহ্বার আগা ও উপরের তালু",
      description: "জিহ্বার আগা, তার বরাবর উপরের তালুর সঙ্গে লাগাইয়া।",
      letters: ["ن"],
      letterIds: ["noon"]
    },
    {
      num: 10,
      region: "tongue",
      regionBn: "জিহ্বা",
      title: "জিহ্বার আগার পিঠ ও উপরের তালু",
      description: "জিহ্বার আগার পিঠ, তার বরাবর উপরের তালুর সঙ্গে লাগাইয়া।",
      letters: ["ر"],
      letterIds: ["raa"]
    },
    {
      num: 11,
      region: "tongue",
      regionBn: "জিহ্বা",
      title: "জিহ্বার আগা ও উপরের দুই দাঁতের গোড়া",
      description: "জিহ্বার আগা, সামনের উপরের দুই দাঁতের গোড়ার সঙ্গে লাগাইয়া।",
      letters: ["ط", "د", "ت"],
      letterIds: ["taa_heavy", "daal", "taa"]
    },
    {
      num: 12,
      region: "tongue",
      regionBn: "জিহ্বা",
      title: "জিহ্বার আগা ও নীচের দুই দাঁতের পেট-আগা",
      description: "জিহ্বার আগা, সামনের নীচের দুই দাঁতের পেট ও আগার সঙ্গে লাগাইয়া।",
      letters: ["ص", "س", "ز"],
      letterIds: ["saad", "seen", "zaa"]
    },
    {
      num: 13,
      region: "tongue",
      regionBn: "জিহ্বা",
      title: "জিহ্বার আগা ও উপরের দুই দাঁতের আগা",
      description: "জিহ্বার আগা, সামনের উপরের দুই দাঁতের আগার সঙ্গে লাগাইয়া।",
      letters: ["ظ", "ذ", "ث"],
      letterIds: ["zaa_heavy", "dhaal", "thaa"]
    },
    {
      num: 14,
      region: "lips",
      regionBn: "ঠোঁট",
      title: "নীচের ঠোঁটের পেট ও উপরের দুই দাঁতের আগা",
      description: "নীচের ঠোঁটের পেট, সামনের উপরের দুই দাঁতের আগার সঙ্গে লাগাইয়া।",
      letters: ["ف"],
      letterIds: ["faa"]
    },
    {
      num: 15,
      region: "lips",
      regionBn: "ঠোঁট",
      title: "দুই ঠোঁট হইতে",
      description: "দুই ঠোঁট হইতে (و ঠোঁট গোল করে, ب ভেজা অংশে, م শুকনো অংশে) উচ্চারিত হয়।",
      letters: ["و", "ب", "م"],
      letterIds: ["waaw", "baa", "meem"]
    },
    {
      num: 16,
      region: "jawf",
      regionBn: "মুখের খালী জায়গা",
      title: "মুখের খালী জায়গা হইতে মদের হরফ",
      description: "মুখের খালী জায়গা হইতে মদের হরফ পড়া যায়। যেমন — نُوْحِيْهَا",
      letters: ["ا", "و", "ي"],
      letterIds: ["alif", "waaw", "yaa"],
      exampleAudio: "audio/ex_makhraj16.mp3",
      exampleText: "نُوْحِيْهَا"
    },
    {
      num: 17,
      region: "nasal",
      regionBn: "নাকের বাঁশী",
      title: "নাকের বাঁশী হইতে গুন্নাহ",
      description: "নাকের বাঁশী হইতে গুন্নাহ উচ্চারিত হয়। যেমন — اَنَّ عَمَّ",
      letters: ["نّ", "مّ"],
      letterIds: ["noon", "meem"],
      exampleAudio: "audio/ex_makhraj17.mp3",
      exampleText: "اَنَّ عَمَّ"
    }
  ],

  // মাদানী কায়দা পৃষ্ঠা ৬: আরবী হরফের ৮ ভাগের পরিচয়
  eightWritingGroups: [
    { group: "১ম ভাগ", ids: ["alif", "meem", "taa_heavy", "zaa_heavy"] },
    { group: "২য় ভাগ", ids: ["baa", "taa", "thaa", "faa", "kaaf"] },
    { group: "৩য় ভাগ", ids: ["haa_sharp", "khaa", "jeem"] },
    { group: "৪র্থ ভাগ", ids: ["raa", "zaa", "waaw", "daal", "dhaal"] },
    { group: "৫ম ভাগ", ids: ["seen", "sheen", "saad", "daad"] },
    { group: "৬ষ্ঠ ভাগ", ids: ["noon", "qaaf", "laam"] },
    { group: "৭ম ভাগ", ids: ["hamzah", "ain", "ghain"] },
    { group: "৮ম ভাগ", ids: ["haa_soft", "yaa"] }
  ],

  // মাদানী কায়দা পৃষ্ঠা ৭: নুকতা ব্যতীত ১৪ হরফ, নুকতা বিশিষ্ট ১৫ হরফ ও মশ্ক
  noNuqta14: ["alif", "haa_sharp", "daal", "raa", "seen", "saad", "taa_heavy", "ain", "kaaf", "laam", "meem", "waaw", "haa_soft", "hamzah"],
  withNuqta15: ["baa", "taa", "thaa", "jeem", "khaa", "dhaal", "zaa", "sheen", "daad", "zaa_heavy", "ghain", "faa", "qaaf", "noon", "yaa"],
  mashqPairs: [
    ["haa_sharp", "haa_soft"],
    ["taa_heavy", "taa"],
    ["qaaf", "kaaf"],
    ["zaa_heavy", "dhaal"],
    ["zaa", "dhaal"],
    ["seen", "saad"],
    ["hamzah", "ain"],
    ["seen", "thaa"],
    ["daal", "daad"],
    ["zaa", "jeem"],
    ["daad", "zaa_heavy"],
    ["hamzah", "yaa"]
  ],

  // কাছাকাছি উচ্চারণ ও আকৃতির হরফ (Confusing Pairs Drill)
  confusingPairs: [
    {
      title: "তা (ت) বনাম ত্ব (ط)",
      category: "উচ্চারণের পার্থক্য (পাতলা বনাম মোটা)",
      ids: ["taa", "taa_heavy"],
      note: "দুটিরই মাখরাজ ১১ নং (জিহ্বার আগা ও উপরের দুই দাঁতের গোড়া), কিন্তু 'ت' পাতলা ও নরম, আর 'ط' শক্তিশালী মোটা (পুর) হরফ।"
    },
    {
      title: "ছা (ث) বনাম সীন (س) বনাম ছদ (ص)",
      category: "উচ্চারণের পার্থক্য (শিস বনাম নরম)",
      ids: ["thaa", "seen", "saad"],
      note: "'ث' একদম নরম (শিস নেই), 'س' পাতলা শিসযুক্ত, আর 'ص' মোটা ও ভারী শিসযুক্ত।"
    },
    {
      title: "যাল (ذ) বনাম যা (ز) বনাম জ্ব (ظ)",
      category: "উচ্চারণের পার্থক্য",
      ids: ["dhaal", "zaa", "zaa_heavy"],
      note: "'ذ' নরম ও পাতলা (দাঁতের আগায়), 'ز' মৌমাছির মতো শিসযুক্ত, আর 'ظ' দাঁতের আগায় তবে মোটা (পুর)।"
    },
    {
      title: "হা (ح) বনাম হা (ه)",
      category: "হলকের (গলার) পার্থক্য",
      ids: ["haa_sharp", "haa_soft"],
      note: "'ح' হলকের মধ্যখান থেকে চাপ দিয়ে তীক্ষ্ণভাবে, আর 'ه' হলকের শুরু (বুক) থেকে নরম ও খোলাভাবে।"
    },
    {
      title: "কাফ (ك) বনাম ক্বফ (ق)",
      category: "জিহ্বার গোড়ার পার্থক্য",
      ids: ["kaaf", "qaaf"],
      note: "'ق' জিহ্বার একদম গোড়া থেকে মোটা ও গভীরভাবে, আর 'ك' একটু সামনে থেকে পাতলাভাবে।"
    },
    {
      title: "দাল (د) বনাম দ্বদ (ض)",
      category: "দাঁত ও মাড়ীর পার্থক্য",
      ids: ["daal", "daad"],
      note: "'د' সামনের দাঁতের গোড়া থেকে পাতলা, আর 'ض' জিহ্বার কিনারা উপরের মাড়ীর দাঁতে লাগিয়ে মোটা করে।"
    },
    {
      title: "আলিফ/হামযাহ (ء) বনাম আইন (ع)",
      category: "হলকের পার্থক্য",
      ids: ["hamzah", "ain"],
      note: "'ء' হলকের শুরু থেকে ঝটকা দিয়ে, আর 'ع' হলকের মধ্যখান চেপে গভীরভাবে উচ্চারিত হয়।"
    }
  ],

  // মুরাক্কাব শব্দ ভাঙা ও জোড়া (Word Breakdown)
  wordBreakdowns: [
    {
      word: "كَتَبَ",
      audio: "audio/w_kataba.mp3",
      meaning: "সে লিখেছে",
      parts: [
        { letterId: "kaaf", form: "كـ", pos: "শুরুর রূপ" },
        { letterId: "taa", form: "ـتـ", pos: "মাঝের রূপ" },
        { letterId: "baa", form: "ـب", pos: "শেষের রূপ" }
      ]
    },
    {
      word: "حَمِدَ",
      audio: "audio/w_hamida.mp3",
      meaning: "সে প্রশংসা করেছে",
      parts: [
        { letterId: "haa_sharp", form: "حـ", pos: "শুরুর রূপ" },
        { letterId: "meem", form: "ـمـ", pos: "মাঝের রূপ" },
        { letterId: "daal", form: "ـد", pos: "শেষের রূপ (বামে মিলে না)" }
      ]
    },
    {
      word: "نَصَرَ",
      audio: "audio/w_nasara.mp3",
      meaning: "সে সাহায্য করেছে",
      parts: [
        { letterId: "noon", form: "نـ", pos: "শুরুর রূপ" },
        { letterId: "saad", form: "ـصـ", pos: "মাঝের রূপ" },
        { letterId: "raa", form: "ـر", pos: "শেষের রূপ (বামে মিলে না)" }
      ]
    },
    {
      word: "سَجَدَ",
      audio: "audio/w_sajada.mp3",
      meaning: "সে সিজদা করেছে",
      parts: [
        { letterId: "seen", form: "سـ", pos: "শুরুর রূপ" },
        { letterId: "jeem", form: "ـجـ", pos: "মাঝের রূপ" },
        { letterId: "daal", form: "ـد", pos: "শেষের রূপ" }
      ]
    },
    {
      word: "عَلِمَ",
      audio: "audio/w_alima.mp3",
      meaning: "সে জেনেছে",
      parts: [
        { letterId: "ain", form: "عـ", pos: "শুরুর রূপ" },
        { letterId: "laam", form: "ـلـ", pos: "মাঝের রূপ" },
        { letterId: "meem", form: "ـم", pos: "শেষের রূপ" }
      ]
    },
    {
      word: "فَتَحَ",
      audio: "audio/w_fataha.mp3",
      meaning: "সে খুলেছে",
      parts: [
        { letterId: "faa", form: "فـ", pos: "শুরুর রূপ" },
        { letterId: "taa", form: "ـتـ", pos: "মাঝের রূপ" },
        { letterId: "haa_sharp", form: "ـح", pos: "শেষের রূপ" }
      ]
    },
    {
      word: "خَلَقَ",
      audio: "audio/w_khalaqa.mp3",
      meaning: "তিনি সৃষ্টি করেছেন",
      parts: [
        { letterId: "khaa", form: "خـ", pos: "শুরুর রূপ" },
        { letterId: "laam", form: "ـلـ", pos: "মাঝের রূপ" },
        { letterId: "qaaf", form: "ـق", pos: "শেষের রূপ" }
      ]
    },
    {
      word: "ذَكَرَ",
      audio: "audio/w_dhakara.mp3",
      meaning: "সে স্মরণ করেছে",
      parts: [
        { letterId: "dhaal", form: "ذ", pos: "শুরুর রূপ (বামে মিলে না!)" },
        { letterId: "kaaf", form: "كـ", pos: "শুরুর মতো মাঝের রূপ" },
        { letterId: "raa", form: "ـر", pos: "শেষের রূপ" }
      ]
    }
  ],

  // তাজবীদ: কলকলাহ ও তাশদীদ/গুন্নাহ
  qalqalahExamples: [
    { char: "ق", text: "أَقْ", audio: "audio/q_qaaf.mp3", note: "ক্বফ সাকিন (মোটা কলকলাহ)" },
    { char: "ط", text: "أَطْ", audio: "audio/q_taa.mp3", note: "ত্ব সাকিন (মোটা কলকলাহ)" },
    { char: "ب", text: "أَبْ", audio: "audio/q_baa.mp3", note: "বা সাকিন (কলকলাহ)" },
    { char: "ج", text: "أَجْ", audio: "audio/q_jeem.mp3", note: "জীম সাকিন (কলকলাহ)" },
    { char: "د", text: "أَدْ", audio: "audio/q_daal.mp3", note: "দাল সাকিন (কলকলাহ)" }
  ],

  tashdeedExamples: [
    { text: "إِنَّ", audio: "audio/t_inna.mp3", note: "নূন তাশদীদ — নাকের বাঁশি থেকে ১ আলিফ গুন্নাহ ওয়াজিব" },
    { text: "عَمَّ", audio: "audio/t_amma.mp3", note: "মীম তাশদীদ — নাকের বাঁশি থেকে ১ আলিফ গুন্নাহ ওয়াজিব" },
    { text: "ثُمَّ", audio: "audio/t_thumma.mp3", note: "মীম তাশদীদ — গুন্নাহসহ দুইবার চাপ দিয়ে পড়া" },
    { text: "رَبِّ", audio: "audio/t_rabbi.mp3", note: "সাধারণ তাশদীদ — শক্ত করে দুইবার পড়া (গুন্নাহ নয়)" }
  ],

  // তানবীন ও খাঁড়া হরকত
  tanweenExamples: [
    { text: "بًا", audio: "audio/tw_baa_an.mp3", note: "দুই যবর (আন) — বান" },
    { text: "بٍ", audio: "audio/tw_baa_in.mp3", note: "দুই যের (ইন) — বিন" },
    { text: "بٌ", audio: "audio/tw_baa_un.mp3", note: "দুই পেশ (উন) — বুন" },
    { text: "عَلِيْمًا", audio: "audio/tw_aliman.mp3", note: "শব্দের শেষে দুই যবর (আলীমান)" },
    { text: "كِتٰبٌ", audio: "audio/tw_kitabun.mp3", note: "খাঁড়া যবর ও দুই পেশ (কিতাবুন)" },
    { text: "بَيْتٍ", audio: "audio/tw_baytin.mp3", note: "শব্দের শেষে দুই যের (বাইতিন)" },
    { text: "ذٰلِكَ", audio: "audio/tw_dhalika.mp3", note: "খাঁড়া যবর — ১ আলিফ টেনে (যালিকা)" },
    { text: "بِهٖ", audio: "audio/tw_bihi.mp3", note: "খাঁড়া যের — ১ আলিফ টেনে (বিহী)" },
    { text: "لَهٗ", audio: "audio/tw_lahu.mp3", note: "উল্টা পেশ — ১ আলিফ টেনে (লাহূ)" }
  ],

  // মাদ (টেনে পড়া) ও লীন হরফ
  maddExamples: [
    { text: "قَالَ", audio: "audio/md_qala.mp3", tag: "১ আলিফ মাদ", note: "যবরের পর খালি আলিফ — ক্বা-লা" },
    { text: "قِيْلَ", audio: "audio/md_qeela.mp3", tag: "১ আলিফ মাদ", note: "যেরের পর ইয়া সাকিন — ক্বী-লা" },
    { text: "يَقُوْلُ", audio: "audio/md_yaqoolu.mp3", tag: "১ আলিফ মাদ", note: "পেশের পর ওয়াও সাকিন — ইয়াক্বূ-লু" },
    { text: "بَيْتٌ", audio: "audio/md_bayt.mp3", tag: "লীন হরফ", note: "যবরের পর ইয়া সাকিন (নরমভাবে বাইতুন)" },
    { text: "خَوْفٌ", audio: "audio/md_khawf.mp3", tag: "লীন হরফ", note: "যবরের পর ওয়াও সাকিন (নরমভাবে খাওফুন)" },
    { text: "سَمَآءٌ", audio: "audio/md_samaa.mp3", tag: "৪ আলিফ মাদ", note: "মোটা মাদ (মাদ্দে মুত্তাসিল) — সামাাা-উন" },
    { text: "اُوْلٰٓئِكَ", audio: "audio/md_ulaika.mp3", tag: "৪ আলিফ মাদ", note: "উলাাা-ইকা" }
  ],

  // ছোট সূরা (Word-by-Word)
  surahs: [
    {
      id: "fatihah",
      title: "সূরা আল-ফাতিহা (আয়াত ১–৭)",
      subtitle: "প্রতিটি শব্দে ক্লিক করে উচ্চারণ ও তাজবীদ নিয়ম দেখুন",
      ayahs: [
        [
          { ar: "بِسْمِ", bn: "বিসমি", audio: "audio/sf_01.mp3", rule: "সাধারণ" },
          { ar: "اللّٰهِ", bn: "ল্লা-হি", audio: "audio/sf_02.mp3", rule: "১ আলিফ মাদ" },
          { ar: "الرَّحْمٰنِ", bn: "ররহমা-নি", audio: "audio/sf_03.mp3", rule: "খাঁড়া যবর (১ আলিফ)" },
          { ar: "الرَّحِيْمِ", bn: "ররহী-ম", audio: "audio/sf_04.mp3", rule: "মাদ্দে আরিদ (৩ আলিফ)" }
        ],
        [
          { ar: "اَلْحَمْدُ", bn: "আলহামদু", audio: "audio/sf_05.mp3", rule: "সাকিন স্পষ্ট" },
          { ar: "لِلّٰهِ", bn: "লিল্লা-হি", audio: "audio/sf_06.mp3", rule: "১ আলিফ মাদ" },
          { ar: "رَبِّ", bn: "রব্বি", audio: "audio/sf_07.mp3", rule: "তাশদীদ" },
          { ar: "الْعٰلَمِيْنَ", bn: "ল আ-লামী-ন", audio: "audio/sf_08.mp3", rule: "খাঁড়া যবর ও মাদ" }
        ],
        [
          { ar: "مٰلِكِ", bn: "মা-লিকি", audio: "audio/sf_09.mp3", rule: "খাঁড়া যবর (১ আলিফ)" },
          { ar: "يَوْمِ", bn: "ইয়াওমি", audio: "audio/sf_10.mp3", rule: "লীন হরফ" },
          { ar: "الدِّيْنِ", bn: "দ্দী-ন", audio: "audio/sf_11.mp3", rule: "তাশদীদ ও মাদ" }
        ],
        [
          { ar: "اِيَّاكَ", bn: "ইয়্যা-কা", audio: "audio/sf_12.mp3", rule: "তাশদীদ ও ১ আলিফ মাদ" },
          { ar: "نَعْبُدُ", bn: "না'বুদু", audio: "audio/sf_13.mp3", rule: "হলকী আইন (ع)" },
          { ar: "وَاِيَّاكَ", bn: "ওয়া ইয়্যা-কা", audio: "audio/sf_14.mp3", rule: "তাশদীদ ও মাদ" },
          { ar: "نَسْتَعِيْنُ", bn: "নাসতাঈ-ন", audio: "audio/sf_15.mp3", rule: "মাদ্দে আরিদ" }
        ],
        [
          { ar: "اِهْدِنَا", bn: "ইহদিনা-", audio: "audio/sf_16.mp3", rule: "১ আলিফ মাদ" },
          { ar: "الصِّرَاطَ", bn: "স্সিরা-ত্ব", audio: "audio/sf_17.mp3", rule: "মোটা হরফ (ص ط)" },
          { ar: "الْمُسْتَقِيْمَ", bn: "ল মুসতাক্বী-ম", audio: "audio/sf_18.mp3", rule: "ক্বফ (ق) ও মাদ" }
        ],
        [
          { ar: "صِرَاطَ", bn: "সিরা-ত্ব", audio: "audio/sf_19.mp3", rule: "মোটা হরফ" },
          { ar: "الَّذِيْنَ", bn: "ল্লাযী-না", audio: "audio/sf_20.mp3", rule: "নরম যাল (ذ)" },
          { ar: "اَنْعَمْتَ", bn: "আন'আমতা", audio: "audio/sf_21.mp3", rule: "ইযহার (গুন্নাহ ছাড়া)" },
          { ar: "عَلَيْهِمْ", bn: "আলাইহিম", audio: "audio/sf_22.mp3", rule: "লীন হরফ" }
        ],
        [
          { ar: "غَيْرِ", bn: "গাইরি", audio: "audio/sf_23.mp3", rule: "গ্বইন (غ) ও লীন" },
          { ar: "الْمَغْضُوْبِ", bn: "ল মাগদূ-বি", audio: "audio/sf_24.mp3", rule: "দ্বদ (ض) ও মাদ" },
          { ar: "عَلَيْهِمْ", bn: "আলাইহিম", audio: "audio/sf_22.mp3", rule: "লীন হরফ" },
          { ar: "وَلَا", bn: "ওয়া লা-", audio: "audio/sf_25.mp3", rule: "১ আলিফ মাদ" },
          { ar: "الضَّآلِّيْنَ", bn: "দ্দাাা-ল্লী-ন", audio: "audio/sf_26.mp3", rule: "৬ আলিফ মাদ্দে লাযিম" }
        ]
      ]
    },
    {
      id: "ikhlas",
      title: "সূরা আল-ইখলাস (আয়াত ১–৪)",
      subtitle: "কলকলাহ ও তাশদীদ অনুশীলনের জন্য সেরা সূরা",
      ayahs: [
        [
          { ar: "قُلْ", bn: "কুল", audio: "audio/si_01.mp3", rule: "মোটা ক্বফ (ق)" },
          { ar: "هُوَ", bn: "হুওয়া", audio: "audio/si_02.mp3", rule: "নরম হা (ه)" },
          { ar: "اللّٰهُ", bn: "ল্লা-হু", audio: "audio/si_03.mp3", rule: "১ আলিফ মাদ" },
          { ar: "اَحَدٌ", bn: "আহাদ্", audio: "audio/si_04.mp3", rule: "দাল কলকলাহ (ওয়াকফে)" }
        ],
        [
          { ar: "اَللّٰهُ", bn: "আল্লা-হু", audio: "audio/si_03.mp3", rule: "১ আলিফ মাদ" },
          { ar: "الصَّمَدُ", bn: "স্সমাদ্", audio: "audio/si_05.mp3", rule: "মোটা ছদ ও কলকলাহ" }
        ],
        [
          { ar: "لَمْ", bn: "লাম", audio: "audio/si_06.mp3", rule: "মীম সাকিন" },
          { ar: "يَلِدْ", bn: "ইয়ালিদ", audio: "audio/si_07.mp3", rule: "দাল কলকলাহ (دْ)" },
          { ar: "وَلَمْ", bn: "ওয়া লাম", audio: "audio/si_08.mp3", rule: "মীম সাকিন" },
          { ar: "يُوْلَدْ", bn: "ইয়ূ-লাদ", audio: "audio/si_09.mp3", rule: "মাদ ও কলকলাহ" }
        ],
        [
          { ar: "وَلَمْ", bn: "ওয়া লাম", audio: "audio/si_10.mp3", rule: "মীম সাকিন" },
          { ar: "يَكُنْ", bn: "ইয়াকুল", audio: "audio/si_11.mp3", rule: "নূন সাকিনে ইদগাম" },
          { ar: "لَّهٗ", bn: "ল্লাহূ", audio: "audio/si_12.mp3", rule: "উল্টা পেশ (১ আলিফ)" },
          { ar: "كُفُوًا", bn: "কুফুওয়ান", audio: "audio/si_13.mp3", rule: "তানবীন" },
          { ar: "اَحَدٌ", bn: "আহাদ্", audio: "audio/si_04.mp3", rule: "দাল কলকলাহ" }
        ]
      ]
    },
    {
      id: "asr",
      title: "সূরা আল-আসর (আয়াত ১–৩)",
      subtitle: "গুন্নাহ ও তাশদীদসহ ছোট সূরা অনুশীলন",
      ayahs: [
        [
          { ar: "وَالْعَصْرِ", bn: "ওয়াল আসর", audio: "audio/sa_01.mp3", rule: "আইন (ع) ও মোটা ছদ" }
        ],
        [
          { ar: "اِنَّ", bn: "ইন্না", audio: "audio/sa_02.mp3", rule: "১ আলিফ গুন্নাহ (نّ)" },
          { ar: "الْاِنْسَانَ", bn: "ল ইনসা-না", audio: "audio/sa_03.mp3", rule: "ইখফা গুন্নাহ ও মাদ" },
          { ar: "لَفِيْ", bn: "লাফী-", audio: "audio/sa_04.mp3", rule: "১ আলিফ মাদ" },
          { ar: "خُسْرٍ", bn: "খুসর", audio: "audio/sa_05.mp3", rule: "মোটা খ (خ)" }
        ],
        [
          { ar: "اِلَّا", bn: "ইল্লা-", audio: "audio/sa_06.mp3", rule: "১ আলিফ মাদ" },
          { ar: "الَّذِيْنَ", bn: "ল্লাযী-না", audio: "audio/sa_07.mp3", rule: "নরম যাল (ذ)" },
          { ar: "اٰمَنُوْا", bn: "আ-মানূ-", audio: "audio/sa_08.mp3", rule: "খাঁড়া যবর ও মাদ" },
          { ar: "وَعَمِلُوا", bn: "ওয়া আমিলু", audio: "audio/sa_09.mp3", rule: "আইন (ع)" },
          { ar: "الصّٰلِحٰتِ", bn: "স্সা-লিহা-তি", audio: "audio/sa_10.mp3", rule: "মোটা ছদ ও খাঁড়া যবর" },
          { ar: "وَتَوَاصَوْا", bn: "ওয়া তাওয়া-সাও", audio: "audio/sa_11.mp3", rule: "লীন হরফ" },
          { ar: "بِالْحَقِّ", bn: "বিল হাক্ক", audio: "audio/sa_12.mp3", rule: "হলকী হা ও তাশদীদ" },
          { ar: "وَتَوَاصَوْا", bn: "ওয়া তাওয়া-সাও", audio: "audio/sa_11.mp3", rule: "লীন হরফ" },
          { ar: "بِالصَّبْرِ", bn: "বিস্সব্‌র", audio: "audio/sa_13.mp3", rule: "বা কলকলাহ (بْ)" }
        ]
      ]
    }
  ]
};
