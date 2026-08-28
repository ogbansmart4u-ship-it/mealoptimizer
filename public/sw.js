/**
 * MealOptimizer Service Worker (PWA Offline Engine v4.0)
 * Offline-First & Stale-While-Revalidate for instantaneous offline speed & high resilience
 */

const CACHE_NAME = 'mealoptimizer-pwa-v4.0';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.webmanifest',
  '/assets/mascot-v2.png',
  '/assets/mascot.png',
  '/assets/mascot/avo-idle.webm',
  '/assets/mascot/avo-drink.webm',
];

// Install: precache critical assets and immediately claim execution
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .catch((err) => {
        console.warn('[SW] Precache skipped items:', err);
      })
  );
});

// Activate: purge old caches and claim all clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              console.log('[SW] Purging old cache version:', key);
              return caches.delete(key);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// Message listener for skip waiting
self.addEventListener('message', (event) => {
  if (event.data && (event.data.type === 'SKIP_WAITING' || event.data === 'SKIP_WAITING')) {
    self.skipWaiting();
  }
});

// Fetch Strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests and chrome-extension/data URLs
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // 1. Skip backend APIs and edge functions (Supabase, external endpoints)
  if (
    url.hostname.includes('supabase.co') ||
    url.pathname.includes('/ai/') ||
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('brevo.com') ||
    url.hostname.includes('google-analytics.com')
  ) {
    return;
  }

  // 2. Navigation Requests (HTML Pages / Routes): Network-first with SPA Shell Fallback
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
          // Offline fallback: serve cached page or SPA index.html shell
          const cached = await caches.match(request);
          if (cached) return cached;

          const rootCached = await caches.match('/');
          if (rootCached) return rootCached;

          const indexCached = await caches.match('/index.html');
          if (indexCached) return indexCached;

          return new Response(
            '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MealOptimiza - Offline</title><style>body{font-family:system-ui,-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#F0FDFA;color:#0F172A;text-align:center;padding:24px}.card{background:#fff;padding:32px;border-radius:24px;box-shadow:0 10px 25px rgba(0,0,0,0.08);max-width:380px}h2{color:#0D9488;margin:0 0 12px}p{color:#64748B;font-size:14px;line-height:1.5;margin:0 0 20px}button{background:#0D9488;color:#fff;border:none;padding:12px 24px;border-radius:14px;font-weight:700;font-size:14px;cursor:pointer}</style></head><body><div class="card"><div style="font-size:48px;margin-bottom:12px">🥑📡</div><h2>MealOptimiza Offline</h2><p>You are currently offline. Your saved meal plans and water logs are preserved locally.</p><button onclick="location.reload()">Retry Connection 🔄</button></div></body></html>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // 3. Static Assets (JS, CSS, Fonts, Images, Audio/Video): Stale-While-Revalidate
  const isStaticAsset =
    url.pathname.startsWith('/assets/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|webm|mp4|apng|woff2|woff|ttf|ico|webmanifest)$/i);

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const copy = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        // Return cached version immediately if available, otherwise wait for network
        return cachedResponse || fetchPromise;
      })
    );
  }
});
