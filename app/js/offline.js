(function (root) {
  "use strict";

  var ESSENTIAL = [
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

  function cacheName(version) {
    return "habitos-" + (version || "0.1.0");
  }

  function normalizeCachedPath(url) {
    var u;
    try {
      u = new URL(url, root.location ? root.location.href : "http://localhost/");
    } catch (err) {
      return url;
    }
    var path = u.pathname;
    if (/\/$/.test(path)) {
      return "./";
    }
    var idxIcons = path.lastIndexOf("/icons/");
    if (idxIcons !== -1) {
      return "." + path.slice(idxIcons);
    }
    var idxCss = path.lastIndexOf("/css/");
    if (idxCss !== -1) {
      return "." + path.slice(idxCss);
    }
    var idxJs = path.lastIndexOf("/js/");
    if (idxJs !== -1) {
      return "." + path.slice(idxJs);
    }
    return "./" + path.split("/").pop();
  }

  function isControlled() {
    return !!(root.navigator && root.navigator.serviceWorker && root.navigator.serviceWorker.controller);
  }

  function hasSW() {
    return !!(root.navigator && "serviceWorker" in root.navigator);
  }

  function essentialsPresent(cachedPaths) {
    var map = {};
    var i;
    for (i = 0; i < cachedPaths.length; i += 1) {
      map[cachedPaths[i]] = true;
    }
    var missing = [];
    for (i = 0; i < ESSENTIAL.length; i += 1) {
      if (!map[ESSENTIAL[i]]) {
        missing.push(ESSENTIAL[i]);
      }
    }
    return { ok: missing.length === 0, missing: missing };
  }

  function inspectCaches(version) {
    if (typeof caches === "undefined") {
      return Promise.resolve({
        available: false,
        ok: false,
        missing: ESSENTIAL.slice(),
        keys: []
      });
    }
    var expected = cacheName(version);
    return caches.keys().then(function (names) {
      if (names.indexOf(expected) === -1) {
        return {
          available: true,
          ok: false,
          missing: ESSENTIAL.slice(),
          keys: names
        };
      }
      return caches.open(expected).then(function (cache) {
        return cache.keys().then(function (reqs) {
          var paths = [];
          var i;
          for (i = 0; i < reqs.length; i += 1) {
            paths.push(normalizeCachedPath(reqs[i].url));
          }
          var check = essentialsPresent(paths);
          return {
            available: true,
            ok: check.ok,
            missing: check.missing,
            keys: names,
            cacheName: expected
          };
        });
      });
    });
  }

  function register(version, hooks) {
    hooks = hooks || {};
    if (!hasSW()) {
      return Promise.resolve({ registered: false, reason: "service-worker-unsupported" });
    }
    return root.navigator.serviceWorker
      .register("sw.js")
      .then(function (reg) {
        if (hooks.onRegistered) {
          hooks.onRegistered(reg);
        }
        root.navigator.serviceWorker.addEventListener("controllerchange", function () {
          if (hooks.isWriting && hooks.isWriting()) {
            return;
          }
          if (hooks.onUpdateReady) {
            hooks.onUpdateReady();
          }
        });
        return { registered: true, registration: reg };
      })
      .catch(function (err) {
        return { registered: false, reason: String(err && err.message ? err.message : err) };
      });
  }

  function offlineReady(version) {
    return inspectCaches(version).then(function (info) {
      return {
        controlled: isControlled(),
        cacheOk: info.ok,
        ready: isControlled() && info.ok,
        missing: info.missing,
        cacheName: info.cacheName || null
      };
    });
  }

  var api = {
    ESSENTIAL: ESSENTIAL,
    cacheName: cacheName,
    isControlled: isControlled,
    hasSW: hasSW,
    inspectCaches: inspectCaches,
    register: register,
    offlineReady: offlineReady,
    normalizeCachedPath: normalizeCachedPath,
    essentialsPresent: essentialsPresent
  };

  root.Habitos = root.Habitos || {};
  root.Habitos.offline = api;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : (typeof global !== "undefined" ? global : this));
