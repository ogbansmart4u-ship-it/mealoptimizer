/**
 * MealOptimiza Service Worker (PWA Offline Engine v5.0)
 * 100% Guaranteed Offline SPA Shell + Cache-First Static Assets
 */

const CACHE_NAME = 'mealoptimiza-pwa-v5.0';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.webmanifest',
];

// Install: precache core app shell
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Precache notice:', err);
      });
    })
  );
});

// Activate: clean up old cache versions & claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Purging old cache version:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Engine
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Skip remote API / Supabase / Auth endpoints from caching
  if (
    url.hostname.includes('supabase.co') ||
    url.pathname.includes('/ai/') ||
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('brevo.com') ||
    url.hostname.includes('google-analytics.com')
  ) {
    return;
  }

  // A. ALL Navigation Requests (URLs like /home, /goals, /logs, /health, etc.):
  // Try Network first; If Offline -> Return cached /index.html (SPA Shell)
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, copy);
              cache.put('/index.html', networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          console.log('[SW] Offline navigation requested for:', request.url);
          const cachedExact = await caches.match(request);
          if (cachedExact) return cachedExact;

          const cachedIndex = (await caches.match('/index.html')) || (await caches.match('/'));
          if (cachedIndex) return cachedIndex;

          return new Response(
            '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MealOptimiza Offline</title><style>body{font-family:sans-serif;text-align:center;padding:40px;background:#F0FDFA;color:#0F172A}.card{background:#fff;padding:24px;border-radius:24px;max-width:360px;margin:auto;box-shadow:0 8px 24px rgba(0,0,0,0.06)}button{background:#0D9488;color:#fff;border:none;padding:12px 20px;border-radius:12px;font-weight:bold;cursor:pointer;margin-top:12px}</style></head><body><div class="card"><div style="font-size:40px">🥑📡</div><h2>Offline Mode</h2><p>You are offline. Your local logs & water tracker remain accessible.</p><button onclick="location.reload()">Retry Connection</button></div></body></html>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // B. Static Assets (JS, CSS, Images, Fonts, Video, WebM): Stale-While-Revalidate
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
        .catch(() => {
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});
