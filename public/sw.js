/**
 * MealOptimizer Service Worker (PWA Offline Engine)
 * Robust Network-First with Safe Fallbacks
 */

const CACHE_NAME = 'mealoptimizer-pwa-v2.4';

const PRECACHE_ASSETS = [
  '/',
  '/favicon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.webmanifest',
  '/assets/mascot-v2.png',
  '/assets/mascot.png',
];

// Install: precache essential assets and activate immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.warn('[SW] Precache skipped:', err);
        return self.skipWaiting();
      })
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

  // 1. Skip Supabase Edge Functions & Auth endpoints
  if (
    url.hostname.includes('supabase.co') ||
    url.pathname.includes('/ai/') ||
    url.pathname.startsWith('/api/')
  ) {
    return;
  }

  // 2. HTML Navigation: Network-First with safe fallback
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
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const rootCached = await caches.match('/');
          if (rootCached) return rootCached;
          // Fallback minimal offline page
          return new Response(
            '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MealOptimizer</title></head><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#F7F9F8;text-align:center;padding:20px;"><div><h2 style="color:#1f7a8c;">MealOptimizer</h2><p style="color:#64748B;">Please check your connection and tap reload.</p><button onclick="location.reload()" style="background:#1f7a8c;color:#fff;border:none;padding:10px 20px;border-radius:12px;font-weight:bold;cursor:pointer;">Reload</button></div></body></html>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // 3. Static Assets: Cache with Network Fallback
  if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|woff2|ttf|js|css)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const copy = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
            return networkResponse;
          })
          .catch(() => {
            // Safe fallback response instead of undefined
            return new Response('', { status: 408, statusText: 'Request Timeout' });
          });
      })
    );
    return;
  }
});
