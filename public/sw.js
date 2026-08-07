/*
 * Self-destructing service worker.
 *
 * This app previously cached assets for offline/PWA support, but that caused
 * stale-version issues ("won't load / won't refresh") that are risky for a
 * health app. This worker removes itself and clears all caches, so every device
 * loads the latest deploy directly from the network. New visitors never register
 * a worker at all (see src/main.tsx).
 */
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch (e) { /* ignore */ }
      try {
        await self.registration.unregister();
      } catch (e) { /* ignore */ }
      try {
        const clients = await self.clients.matchAll({ type: "window" });
        clients.forEach((c) => c.navigate(c.url));
      } catch (e) { /* ignore */ }
    })(),
  );
});
