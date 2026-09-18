var CACHE = "habitos-0.1.0";
var ASSETS = [
  "./",
  "./index.html",
  "./css/app.css",
  "./js/compat.js",
  "./js/date.js",
  "./js/id.js",
  "./js/queue.js",
  "./js/model.js",
  "./js/validate.js",
  "./js/storage.js",
  "./js/offline.js",
  "./js/ui.js",
  "./js/app.js",
  "./sw.js",
  "./manifest.webmanifest",
  "./icons/apple-touch-icon.png",
  "./icons/icon-192.png",
  "./icons/favicon.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.map(function (key) {
          if (key !== CACHE) {
            return caches.delete(key);
          }
          return undefined;
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET") {
    return;
  }
  event.respondWith(
    caches.match(req).then(function (cached) {
      if (cached) {
        return cached;
      }
      return fetch(req).then(function (res) {
        return res;
      }).catch(function () {
        if (req.mode === "navigate") {
          return caches.match("./index.html");
        }
        return caches.match(req.url);
      });
    })
  );
});
