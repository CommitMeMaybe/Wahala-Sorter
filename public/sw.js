const CACHE = 'wahala-v1';
const ASSETS = [
  '/',
  '/#/app',
  '/index.html',
  '/favicon.svg',
  '/apple-touch-icon.svg',
  '/manifest.json',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(response => {
      if (response.ok && request.url.startsWith(self.location.origin)) {
        const clone = response.clone();
        caches.open(CACHE).then(cache => cache.put(request, clone));
      }
      return response;
    }).catch(() => caches.match('/')))
  );
});
