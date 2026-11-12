// Offline-Speicher: liefert alles aus dem Cache und aktualisiert im Hintergrund, wenn Internet da ist.
const CACHE = 'uke-griffe-v3';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(e.request, { ignoreSearch: true }).then(cached => {
        const net = fetch(e.request)
          .then(res => { if (res && res.ok) cache.put(e.request, res.clone()); return res; })
          .catch(() => cached);
        return cached || net;
      })
    )
  );
});
