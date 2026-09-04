const CACHE = 'gym-tracker-v12';

const PRECACHE = [
  '.',
  'index.html',
  'manifest.json',
  'icon.svg',
];

self.addEventListener('install', event => {
  event.waitUntil(
    // cache:'reload' so a precache refresh can't be served a stale copy by the HTTP cache
    caches.open(CACHE).then(cache =>
      cache.addAll(PRECACHE.map(url => new Request(url, { cache: 'reload' })))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => cached);
    })
  );
});
