const CACHE_NAME = "madani-qaida-v6";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./data.js",
  "./app.js",
  "./manifest.json",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-32.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/logo.svg",
  "./audio/01_alif.mp3",
  "./audio/02_baa.mp3",
  "./audio/03_taa.mp3",
  "./audio/04_thaa.mp3",
  "./audio/05_jeem.mp3",
  "./audio/06_haa_sharp.mp3",
  "./audio/07_khaa.mp3",
  "./audio/08_daal.mp3",
  "./audio/09_dhaal.mp3",
  "./audio/10_raa.mp3",
  "./audio/11_zaa.mp3",
  "./audio/12_seen.mp3",
  "./audio/13_sheen.mp3",
  "./audio/14_saad.mp3",
  "./audio/15_daad.mp3",
  "./audio/16_taa_heavy.mp3",
  "./audio/17_zaa_heavy.mp3",
  "./audio/18_ain.mp3",
  "./audio/19_ghain.mp3",
  "./audio/20_faa.mp3",
  "./audio/21_qaaf.mp3",
  "./audio/22_kaaf.mp3",
  "./audio/23_laam.mp3",
  "./audio/24_meem.mp3",
  "./audio/25_noon.mp3",
  "./audio/26_waaw.mp3",
  "./audio/27_haa_soft.mp3",
  "./audio/28_hamzah.mp3",
  "./audio/29_yaa.mp3",
  "./audio/dua_rabbana.mp3",
  "./audio/ex_makhraj16.mp3",
  "./audio/ex_makhraj17.mp3",
  "./audio/h_ain_a.mp3",
  "./audio/h_ain_i.mp3",
  "./audio/h_ain_u.mp3",
  "./audio/h_alif_a.mp3",
  "./audio/h_alif_i.mp3",
  "./audio/h_alif_u.mp3",
  "./audio/h_baa_a.mp3",
  "./audio/h_baa_i.mp3",
  "./audio/h_baa_u.mp3",
  "./audio/h_daad_a.mp3",
  "./audio/h_daad_i.mp3",
  "./audio/h_daad_u.mp3",
  "./audio/h_daal_a.mp3",
  "./audio/h_daal_i.mp3",
  "./audio/h_daal_u.mp3",
  "./audio/h_dhaal_a.mp3",
  "./audio/h_dhaal_i.mp3",
  "./audio/h_dhaal_u.mp3",
  "./audio/h_faa_a.mp3",
  "./audio/h_faa_i.mp3",
  "./audio/h_faa_u.mp3",
  "./audio/h_ghain_a.mp3",
  "./audio/h_ghain_i.mp3",
  "./audio/h_ghain_u.mp3",
  "./audio/h_haa_sharp_a.mp3",
  "./audio/h_haa_sharp_i.mp3",
  "./audio/h_haa_sharp_u.mp3",
  "./audio/h_haa_soft_a.mp3",
  "./audio/h_haa_soft_i.mp3",
  "./audio/h_haa_soft_u.mp3",
  "./audio/h_jeem_a.mp3",
  "./audio/h_jeem_i.mp3",
  "./audio/h_jeem_u.mp3",
  "./audio/h_kaaf_a.mp3",
  "./audio/h_kaaf_i.mp3",
  "./audio/h_kaaf_u.mp3",
  "./audio/h_khaa_a.mp3",
  "./audio/h_khaa_i.mp3",
  "./audio/h_khaa_u.mp3",
  "./audio/h_laam_a.mp3",
  "./audio/h_laam_i.mp3",
  "./audio/h_laam_u.mp3",
  "./audio/h_meem_a.mp3",
  "./audio/h_meem_i.mp3",
  "./audio/h_meem_u.mp3",
  "./audio/h_noon_a.mp3",
  "./audio/h_noon_i.mp3",
  "./audio/h_noon_u.mp3",
  "./audio/h_qaaf_a.mp3",
  "./audio/h_qaaf_i.mp3",
  "./audio/h_qaaf_u.mp3",
  "./audio/h_raa_a.mp3",
  "./audio/h_raa_i.mp3",
  "./audio/h_raa_u.mp3",
  "./audio/h_saad_a.mp3",
  "./audio/h_saad_i.mp3",
  "./audio/h_saad_u.mp3",
  "./audio/h_seen_a.mp3",
  "./audio/h_seen_i.mp3",
  "./audio/h_seen_u.mp3",
  "./audio/h_sheen_a.mp3",
  "./audio/h_sheen_i.mp3",
  "./audio/h_sheen_u.mp3",
  "./audio/h_taa_a.mp3",
  "./audio/h_taa_heavy_a.mp3",
  "./audio/h_taa_heavy_i.mp3",
  "./audio/h_taa_heavy_u.mp3",
  "./audio/h_taa_i.mp3",
  "./audio/h_taa_u.mp3",
  "./audio/h_thaa_a.mp3",
  "./audio/h_thaa_i.mp3",
  "./audio/h_thaa_u.mp3",
  "./audio/h_waaw_a.mp3",
  "./audio/h_waaw_i.mp3",
  "./audio/h_waaw_u.mp3",
  "./audio/h_yaa_a.mp3",
  "./audio/h_yaa_i.mp3",
  "./audio/h_yaa_u.mp3",
  "./audio/h_zaa_a.mp3",
  "./audio/h_zaa_heavy_a.mp3",
  "./audio/h_zaa_heavy_i.mp3",
  "./audio/h_zaa_heavy_u.mp3",
  "./audio/h_zaa_i.mp3",
  "./audio/h_zaa_u.mp3",
  "./audio/q_baa.mp3",
  "./audio/q_daal.mp3",
  "./audio/q_jeem.mp3",
  "./audio/q_qaaf.mp3",
  "./audio/q_taa.mp3",
  "./audio/t_amma.mp3",
  "./audio/t_inna.mp3",
  "./audio/t_rabbi.mp3",
  "./audio/t_thumma.mp3",
  "./audio/w_alima.mp3",
  "./audio/w_dhakara.mp3",
  "./audio/w_fataha.mp3",
  "./audio/w_hamida.mp3",
  "./audio/w_kataba.mp3",
  "./audio/w_khalaqa.mp3",
  "./audio/w_nasara.mp3",
  "./audio/w_sadaqa.mp3",
  "./audio/w_sajada.mp3",
  "./audio/w_shakara.mp3"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const isStaticMedia = url.pathname.includes("/audio/") || url.pathname.includes("/icons/");

  if (isStaticMedia) {
    // Cache-first for MP3s and icons
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
    return;
  }

  // Network-first for HTML/CSS/JS so updates appear immediately when online, with offline fallback
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res && res.status === 200 && event.request.method === "GET") {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
