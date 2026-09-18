(function (root) {
  "use strict";

  function hasPromise() {
    return typeof Promise === "function";
  }

  function hasIndexedDB() {
    try {
      return typeof root.indexedDB !== "undefined" && root.indexedDB !== null;
    } catch (err) {
      return false;
    }
  }

  function hasServiceWorker() {
    return typeof root.navigator !== "undefined" && "serviceWorker" in root.navigator;
  }

  function isStandalone() {
    if (typeof root.navigator !== "undefined" && root.navigator.standalone === true) {
      return true;
    }
    if (typeof root.matchMedia === "function") {
      try {
        return root.matchMedia("(display-mode: standalone)").matches;
      } catch (err) {
        return false;
      }
    }
    return false;
  }

  function capabilityError() {
    if (!hasPromise()) {
      return "Este navegador não oferece Promise. O Safari do iOS 12 é o alvo mínimo.";
    }
    if (!hasIndexedDB()) {
      return "IndexedDB indisponível. Não use aba privada e abra no Safari (não em outro app). Sem IndexedDB os hábitos não podem ser guardados.";
    }
    return null;
  }

  var api = {
    hasPromise: hasPromise,
    hasIndexedDB: hasIndexedDB,
    hasServiceWorker: hasServiceWorker,
    isStandalone: isStandalone,
    capabilityError: capabilityError
  };

  root.Habitos = root.Habitos || {};
  root.Habitos.compat = api;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : (typeof global !== "undefined" ? global : this));
