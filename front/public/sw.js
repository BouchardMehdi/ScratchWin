const CACHE_NAME = "scratchwin-pwa-v1";
const BASE_PATH = "/scratchwin";
const APP_SHELL = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/manifest.webmanifest`,
  `${BASE_PATH}/favicon.png`,
  `${BASE_PATH}/apple-touch-icon.png`,
  `${BASE_PATH}/branding/scratchwin-logo.png`,
  `${BASE_PATH}/pwa/icon-192.png`,
  `${BASE_PATH}/pwa/icon-512.png`,
  `${BASE_PATH}/mobile-nav/home.png`,
  `${BASE_PATH}/mobile-nav/card.png`,
  `${BASE_PATH}/mobile-nav/historique.png`,
  `${BASE_PATH}/audio/scratch.mp3`,
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  if (url.pathname.startsWith(`${BASE_PATH}/api`)) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(`${BASE_PATH}/index.html`)));
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        return networkResponse;
      });
    }),
  );
});
