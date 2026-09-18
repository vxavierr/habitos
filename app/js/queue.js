(function (root) {
  "use strict";

  function create() {
    var chain = Promise.resolve();

    function run(fn) {
      var task = chain.then(fn, fn);
      chain = task.then(function () {}, function () {});
      return task;
    }

    return { run: run };
  }

  var api = { create: create };

  root.Habitos = root.Habitos || {};
  root.Habitos.queue = api;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : (typeof global !== "undefined" ? global : this));
