/**
 * MealOptimizer Service Worker (PWA Offline Engine v3.0)
 * Network-First for JS/CSS & Navigation to guarantee immediate live updates
 */

const CACHE_NAME = 'mealoptimizer-pwa-v3.0';

const PRECACHE_ASSETS = [
  '/',
  '/favicon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.webmanifest',
  '/assets/mascot-v2.png',
  '/assets/mascot.png',
];

// Install: immediately claim execution
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .catch((err) => {
        console.warn('[SW] Precache skipped:', err);
      })
  );
});

// Activate: purge ALL old cache versions and claim all open tabs/clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', key);
              return caches.delete(key);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// Allow app to force immediate activation
self.addEventListener('message', (event) => {
  if (event.data && (event.data.type === 'SKIP_WAITING' || event.data === 'SKIP_WAITING')) {
    self.skipWaiting();
  }
});

// Fetch Strategy: Network-First for HTML, JS, and CSS to guarantee fresh code
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests and browser extensions
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // 1. Skip backend APIs and edge functions
  if (
    url.hostname.includes('supabase.co') ||
    url.pathname.includes('/ai/') ||
    url.pathname.startsWith('/api/')
  ) {
    return;
  }

  // 2. HTML Navigation & JS/CSS chunks: Network-First with safe offline fallback
  if (
    request.mode === 'navigate' ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.startsWith('/assets/')
  ) {
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
          return new Response(
            '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MealOptimizer</title></head><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#F7F9F8;text-align:center;padding:20px;"><div><h2 style="color:#1f7a8c;">MealOptimizer</h2><p style="color:#64748B;">Please check your connection and tap reload.</p><button onclick="location.reload()" style="background:#1f7a8c;color:#fff;border:none;padding:10px 20px;border-radius:12px;font-weight:bold;cursor:pointer;">Reload</button></div></body></html>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // 3. Media & Static images: Cache-First
  if (url.pathname.match(/\.(png|jpg|jpeg|svg|webp|woff2|ttf)$/)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        });
      })
    );
  }
});
