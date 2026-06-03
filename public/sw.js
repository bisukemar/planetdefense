const CACHE_NAME = 'planetary-defense-alpha-0-9-72-139';
const CORE_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './version.json',
  './manifest.webmanifest',
  './elements/pd_icon.png',
  './elements/favicon.ico',
  './elements/earth-texture.png',
  './elements/vulcan-texture.png',
  './elements/toxic-texture.png',
  './elements/frost-texture.png',
  './elements/turret.png',
  './elements/plasma.png',
  './elements/missile.png',
  './elements/railgun.png',
  './elements/laser-sentry.png',
  './elements/lightning-sentry.png',
  './elements/magnet-sentry.png',
  './elements/meteoroid.png',
  './elements/meteor.png',
  './elements/asteroid.png',
  './elements/comet.png',
  './elements/scout-fighter.png',
  './elements/void-swarmer.png',
  './elements/armored-cruiser.png',
  './elements/void-harvester.png',
  './elements/boss-abyss-regent.png',
  './elements/boss-gravemind-carrier.png',
  './elements/boss-solar-warden.png',
  './elements/boss-null-engine.png',
  './elements/boss-iron-basilica.png',
  './elements/boss-dread-orchard.png',
  './elements/boss-vortex-saint.png',
  './elements/boss-eclipse-foundry.png',
  './elements/boss-omega-crucible.png',
  './elements/boss-chronos-devourer.png',
  './elements/player-fighter.png',
  './elements/Blackout_Velocity.mp3',
  './elements/Hull_Breach_Alarm.mp3',
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

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data && event.data.type === 'CLEAR_CACHES') {
    event.waitUntil(
      caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key))))
    );
  }
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
            const responseCopy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseCopy));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
