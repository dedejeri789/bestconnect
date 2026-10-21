// Naikkan versi ini setiap kali Anda mengubah file agar cache lama diganti
const CACHE = 'al-ukhuwah-v2';
const ASSETS = [
  '/',
  '/index.html'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Jangan campuri Google Apps Script / gambar eksternal: biarkan langsung ke jaringan
  if (url.origin !== self.location.origin) return;

  // Halaman: network-first, jatuh ke cache jika offline
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('/index.html', copy));
          return res;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // File statis: cache-first
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
