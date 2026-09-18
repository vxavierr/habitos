(function (root) {
  "use strict";

  function randomHex(len) {
    var out = "";
    var i;
    var n;
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      var bytes = new Uint8Array(len);
      crypto.getRandomValues(bytes);
      for (i = 0; i < len; i += 1) {
        n = bytes[i];
        out += (n < 16 ? "0" : "") + n.toString(16);
      }
      return out.slice(0, len);
    }
    for (i = 0; i < len; i += 1) {
      n = Math.floor(Math.random() * 16);
      out += n.toString(16);
    }
    return out;
  }

  function newId(prefix) {
    return (prefix || "h") + "_" + Date.now().toString(36) + "_" + randomHex(12);
  }

  function checkinKey(habitId, localDate) {
    return habitId + "|" + localDate;
  }

  var api = {
    newId: newId,
    checkinKey: checkinKey
  };

  root.Habitos = root.Habitos || {};
  root.Habitos.id = api;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : (typeof global !== "undefined" ? global : this));
