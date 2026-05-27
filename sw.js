const CACHE_NAME = 'planetary-defense-v2';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './elements/pd_icon.png',
  './elements/favicon.ico',
  './elements/icons/icon-192.png',
  './elements/icons/icon-512.png',
  './elements/icons/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(
      CORE_ASSETS.map(asset => new Request(asset, { cache: 'reload' }))
    ))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const responseCopy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseCopy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
