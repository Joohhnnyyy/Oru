/* Oru service worker. The build (scripts/prerender.mjs) fills in VERSION and PRECACHE. */
const VERSION = '__VERSION__';
const PRECACHE = self.__PRECACHE__ || ['/', '/offline.html'];
const CACHE = `oru-${VERSION}`;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('oru-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Pages: network first, and every successfully loaded page is kept for offline use.
  // Offline, a page falls back to its cached copy (with or without a trailing slash),
  // then to the offline page.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const withSlash = url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`;
          return (
            (await caches.match(request, { ignoreVary: true, ignoreSearch: true })) ||
            (await caches.match(withSlash, { ignoreVary: true })) ||
            (await caches.match('/offline.html'))
          );
        }),
    );
    return;
  }

  // Hashed assets and icons: cache first.
  event.respondWith(
    caches.match(request, { ignoreVary: true }).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        }),
    ),
  );
});
