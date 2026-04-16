const CACHE_NAME = 'flow-shell-v1';
const ASSETS = [
//  '/',
  'index.html',
  'settings.html',
  'flow.css',
  'flow.js',
  'settings.js',
  'manifest.webmanifest',
  'icons/icon-192.svg',
  'icons/icon-512.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Navigation requests: network-first, fallback to cached shell
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then((res) => {
        return res;
      }).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // For other requests: try cache first, then network (stale-while-revalidate)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request).then((res) => {
        // Only cache successful opaque or same-origin responses
        if (res && (res.status === 200 || res.type === 'opaque')) {
          caches.open(CACHE_NAME).then(cache => {
            try { cache.put(event.request, res.clone()); } catch (e) {}
          });
        }
        return res;
      }).catch(() => undefined);

      // Return cached if available, otherwise wait for network
      return cached || networkFetch;
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
