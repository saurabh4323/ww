const CACHE_NAME = "speech-to-text-cache-v3";

const urlsToCache = [
  "/",
  "https://cdn.jsdelivr.net/npm/vosk-browser@0.0.8/dist/vosk.js",
  "https://cdn.jsdelivr.net/npm/vosk-browser@0.0.8/dist/vosk.wasm",
  "/models/vosk-model-small-cn-0.22.tar.gz",
];

self.addEventListener("install", (event) => {
  console.log("Service Worker: Install event triggered.");
  console.log("Service Worker: Opening cache:", CACHE_NAME);
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Cache opened successfully.");
        console.log("Service Worker: Files to cache:", urlsToCache);
        return Promise.all(
          urlsToCache.map((url) => {
            console.log(`Service Worker: Attempting to cache ${url}...`);
            return cache.add(url).catch((err) => {
              console.error(`Failed to cache ${url}:`, err.message);
              console.error("Error stack:", err.stack);
            });
          })
        );
      })
      .catch((err) => {
        console.error("Service Worker: Failed to open cache:", err.message);
        console.error("Error stack:", err.stack);
      })
  );
  console.log("Service Worker: Skipping waiting...");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activate event triggered.");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        console.log("Service Worker: Found caches:", cacheNames);
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log(`Service Worker: Deleting old cache ${cacheName}...`);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("Service Worker: Old caches deleted.");
      })
      .catch((err) => {
        console.error("Service Worker: Error during activation:", err.message);
        console.error("Error stack:", err.stack);
      })
  );
});

self.addEventListener("fetch", (event) => {
  console.log(`Service Worker: Fetch event for ${event.request.url}`);
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        console.log(`Service Worker: Cache hit for ${event.request.url}`);
        return response;
      }
      console.log(
        `Service Worker: Cache miss, fetching ${event.request.url}...`
      );
      return fetch(event.request).catch((err) => {
        console.error(
          `Service Worker: Fetch failed for ${event.request.url}:`,
          err.message
        );
        console.error("Error stack:", err.stack);
      });
    })
  );
});
