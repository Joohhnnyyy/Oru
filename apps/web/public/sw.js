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

  // Pages: network first. Offline, the home page falls back to the cached shell
  // and every other page to the offline page.
  if (request.mode === 'navigate') {
    const isHome = url.pathname === '/';
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (isHome && response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put('/', copy));
          }
          return response;
        })
        .catch(async () => (isHome && (await caches.match('/'))) || (await caches.match('/offline.html'))),
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
