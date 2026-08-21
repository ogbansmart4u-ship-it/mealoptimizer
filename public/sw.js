/**
 * MealOptimizer Service Worker (PWA Offline Engine)
 * Network-First for HTML documents (guarantees zero stale builds)
 * Cache-First for static hashed assets and icons
 */

const CACHE_NAME = 'mealoptimizer-pwa-v2.1';

const PRECACHE_ASSETS = [
  '/',
  '/favicon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.webmanifest',
  '/assets/mascot-v2.png',
  '/assets/mascot.png',
];

// Install: precache essential shell assets and activate immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => console.warn('[SW] Precache skipped:', err))
  );
});

// Activate: purge any older, obsolete cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch: Strategy based on request type
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests and browser extensions
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // 1. Skip Supabase Edge Functions & Auth endpoints (handled by offline queue)
  if (url.hostname.includes('supabase.co') || url.pathname.includes('/ai/')) {
    return;
  }

  // 2. HTML Navigation: Network-First with cached fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match('/') || caches.match(request))
    );
    return;
  }

  // 3. Static Assets (/assets/*, images, fonts): Stale-While-Revalidate / Cache-First
  if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|woff2|ttf)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const copy = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
            return networkResponse;
          })
          .catch(() => cached);

        return cached || fetchPromise;
      })
    );
    return;
  }

  // 4. Default: Network with Cache Fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
