const CACHE_NAME = 'petguard-shell-v1';
const APP_ASSETS = [
  './', './index.html', './manifest.webmanifest', './icons/icon.svg',
  './icons/icon-192.png', './icons/icon-512.png', './css/app.css',
  './js/application/app.js', './js/application/demo-data.js', './js/application/map-picker.js',
  './js/application/search-poster.js', './js/config.js', './js/db/database.js',
  './js/domain/index.js', './js/services/petguard-store.js',
  './vendor/leaflet/leaflet.js', './vendor/leaflet/leaflet.css',
  './vendor/maplibre/maplibre-gl.mjs', './vendor/maplibre/maplibre-gl.css',
  './vendor/maplibre/maplibre-gl-worker.mjs'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((names) => Promise.all(names
    .filter((name) => name.startsWith('petguard-shell-') && name !== CACHE_NAME)
    .map((name) => caches.delete(name)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(request).then(async (response) => {
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    }
    return response;
  }).catch(async () => (await caches.match(request)) || (request.mode === 'navigate' ? caches.match('./index.html') : Response.error())));
});
