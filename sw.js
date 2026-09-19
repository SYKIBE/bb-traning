// Service worker: cachar app-skalet så appen fungerar offline.
// Strategi: nätverk först, cache som reserv. Online får man alltid senaste filerna
// (viktigt när man utvecklar och efter en ny version), offline används cachen.
// Lägg till nya filer i SHELL. CACHE sätts automatiskt av tools/sync-version.mjs
// (via `npm version`), så varje release får en ny cache och gamla rensas.
const CACHE = 'bb-shell-v0.2.0';

const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/style.css',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './js/main.js',
  './js/router.js',
  './js/dom.js',
  './js/store.js',
  './js/version.js',
  './js/audio.js',
  './js/wakeLock.js',
  './js/data/momentTypes.js',
  './js/data/exercises.js',
  './js/engine/expand.js',
  './js/engine/runner.js',
  './js/engine/summary.js',
  './js/components/navbar.js',
  './js/components/difficultyBar.js',
  './js/components/pelvicAnimation.js',
  './js/views/common.js',
  './js/views/home.js',
  './js/views/category.js',
  './js/views/exercise.js',
  './js/views/training.js',
  './js/views/about.js',
  './js/views/settings.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    // `no-cache` tvingar fram omvalidering mot servern i stället för webbläsarens heuristiska cache.
    fetch(request, { cache: 'no-cache' })
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request, { ignoreSearch: true })),
  );
});
