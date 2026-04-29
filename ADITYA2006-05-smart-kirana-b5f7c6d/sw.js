// Service Worker v19 — Network First (always fresh JS/CSS/HTML)
const CACHE_NAME = 'localcart-v19';

// On install: immediately activate (skip waiting)
self.addEventListener('install', () => {
  self.skipWaiting();
});

// On activate: delete ALL old caches and claim clients immediately
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: Network FIRST for all requests
// Only cache images for offline use
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);
  const isLocal = url.origin === self.location.origin;
  const isImage = /\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(url.pathname);

  if (isLocal && isImage) {
    // Cache-first for images only
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(c => c.put(e.request, copy));
          }
          return response;
        });
      })
    );
    return;
  }

  // Network first for everything else (JS, CSS, HTML)
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
