const CACHE_NAME = 'hydrotech-nktc-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/icon.svg',
  '/manifest.json'
];

// Install Event - cache core static shell assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching App Shell');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Stale-while-revalidate strategy for assets
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // Bypass Firebase Auth, Firestore and Firestore emulator/API calls
  if (
    requestUrl.origin.includes('firestore.googleapis.com') ||
    requestUrl.origin.includes('identitytoolkit.googleapis.com') ||
    requestUrl.pathname.includes('/__/') ||
    event.request.method !== 'GET'
  ) {
    return; // Let browser handle network request directly
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Return cached response if found, but fetch new one in background to update cache
      const fetchPromise = fetch(event.request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline and request fails, just return cached response if exists
        });

      return cachedResponse || fetchPromise;
    })
  );
});
