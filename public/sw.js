// SIGNMIND Service Worker — Network-First for Navigation, Cache for Static Assets
const CACHE_NAME = 'signmind-v2';
const STATIC_ASSETS = [
  '/emblem.svg',
  '/favicon.svg',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  // Pre-cache static icons and manifest, but NOT index.html (to prevent stale HTML hash traps)
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  // Immediately purge all older cache versions
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // 1. Navigation requests (HTML pages): ALWAYS Network-First
  // This guarantees users always get the latest index.html with correct JS/CSS hashes
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => {
          // Offline fallback
          return caches.match(event.request) || caches.match('/index.html');
        })
    );
    return;
  }

  // 2. Static hashed assets or media: Network-first with cache fallback
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
