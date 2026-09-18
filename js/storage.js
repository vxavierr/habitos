(function (root) {
  "use strict";

  var model = (root.Habitos && root.Habitos.model) || (typeof require !== "undefined" ? require("./model.js") : null);
  var validate = (root.Habitos && root.Habitos.validate) || (typeof require !== "undefined" ? require("./validate.js") : null);
  var queueApi = (root.Habitos && root.Habitos.queue) || (typeof require !== "undefined" ? require("./queue.js") : null);
  var date = (root.Habitos && root.Habitos.date) || (typeof require !== "undefined" ? require("./date.js") : null);

  var DB_NAME = "habitos";
  var DB_VERSION = 1;

  function openIndexedDB(indexedDB) {
    return new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains("habits")) {
          db.createObjectStore("habits", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("checkins")) {
          db.createObjectStore("checkins", { keyPath: "key" });
        }
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("meta")) {
          db.createObjectStore("meta", { keyPath: "id" });
        }
      };
      req.onsuccess = function () {
        resolve(req.result);
      };
      req.onerror = function () {
        reject(req.error || new Error("Falha ao abrir IndexedDB."));
      };
      req.onblocked = function () {
        reject(new Error("IndexedDB bloqueado. Feche outras abas deste app."));
      };
    });
  }

  function collectCursor(store, into) {
    var req = store.openCursor();
    req.onsuccess = function () {
      var cursor = req.result;
      if (cursor) {
        into.push(cursor.value);
        cursor.continue();
      }
    };
  }

  function loadFromIdb(db) {
    return new Promise(function (resolve, reject) {
      var tx = db.transaction(["habits", "checkins", "settings", "meta"], "readonly");
      var result = model.emptyState();
      tx.oncomplete = function () {
        resolve(result);
      };
      tx.onerror = function () {
        reject(tx.error);
      };
      tx.onabort = function () {
        reject(tx.error || new Error("Leitura abortada."));
      };
      collectCursor(tx.objectStore("habits"), result.habits);
      collectCursor(tx.objectStore("checkins"), result.checkins);
      var settingsReq = tx.objectStore("settings").get("app");
      settingsReq.onsuccess = function () {
        var row = settingsReq.result;
        if (row) {
          result.settings = {
            id: "app",
            locale: row.locale || "pt-BR",
            weekStartsOn: row.weekStartsOn === 0 ? 0 : 1
          };
        }
      };
      var metaReq = tx.objectStore("meta").get("schema");
      metaReq.onsuccess = function () {
        if (metaReq.result && metaReq.result.schemaVersion) {
          result.schemaVersion = metaReq.result.schemaVersion;
        }
      };
    });
  }

  function persistIdb(db, state) {
    return new Promise(function (resolve, reject) {
      var tx = db.transaction(["habits", "checkins", "settings", "meta"], "readwrite");
      tx.oncomplete = function () {
        resolve();
      };
      tx.onerror = function () {
        reject(tx.error || new Error("Falha ao gravar."));
      };
      tx.onabort = function () {
        reject(tx.error || new Error("Gravação abortada."));
      };
      var habits = tx.objectStore("habits");
      var checkins = tx.objectStore("checkins");
      var settings = tx.objectStore("settings");
      var meta = tx.objectStore("meta");
      habits.clear();
      checkins.clear();
      settings.clear();
      var i;
      for (i = 0; i < state.habits.length; i += 1) {
        habits.put(state.habits[i]);
      }
      for (i = 0; i < state.checkins.length; i += 1) {
        checkins.put(state.checkins[i]);
      }
      settings.put({
        id: "app",
        locale: state.settings.locale,
        weekStartsOn: state.settings.weekStartsOn
      });
      meta.put({ id: "schema", schemaVersion: state.schemaVersion || model.SCHEMA_VERSION });
    });
  }

  function create(options) {
    options = options || {};
    var backend = options.backend || "idb";
    var indexedDB = options.indexedDB || (typeof root.indexedDB !== "undefined" ? root.indexedDB : null);
    var queue = queueApi.create();
    var state = model.emptyState();
    var db = null;
    var opened = false;
    var persistFail = options.persistFail || false;

    function snapshot() {
      return model.clone(state);
    }

    function persist() {
      if (persistFail) {
        return Promise.reject(new Error("Falha forçada de gravação."));
      }
      if (backend === "memory") {
        return Promise.resolve();
      }
      if (!db) {
        return Promise.reject(new Error("Banco não aberto."));
      }
      return persistIdb(db, state);
    }

    function mutate(fn) {
      return queue.run(function () {
        if (!opened) {
          return Promise.reject(new Error("Armazenamento ainda não está pronto."));
        }
        var previous = snapshot();
        var out;
        try {
          out = fn(state);
          if (out && out.state) {
            state = out.state;
          } else if (out) {
            state = out;
            out = { state: state };
          }
        } catch (err) {
          state = previous;
          return Promise.reject(err);
        }
        return persist().then(
          function () {
            return out;
          },
          function (err) {
            state = previous;
            return Promise.reject(err);
          }
        );
      });
    }

    function open() {
      return queue.run(function () {
        if (backend === "memory") {
          state = model.emptyState();
          opened = true;
          return state;
        }
        if (!indexedDB) {
          return Promise.reject(new Error("IndexedDB indisponível."));
        }
        return openIndexedDB(indexedDB).then(function (openedDb) {
          db = openedDb;
          return loadFromIdb(db).then(function (loaded) {
            state = loaded && loaded.habits ? loaded : model.emptyState();
            if (!state.settings) {
              state.settings = model.defaultSettings();
            }
            opened = true;
            return persistIdb(db, state).then(function () {
              return state;
            });
          });
        });
      });
    }

    return {
      open: open,
      getState: function () {
        return snapshot();
      },
      createHabit: function (name, today) {
        return mutate(function (current) {
          return model.createHabit(current, name, today || date.localISODate());
        });
      },
      renameHabit: function (id, name) {
        return mutate(function (current) {
          return model.renameHabit(current, id, name);
        });
      },
      archiveHabit: function (id, today) {
        return mutate(function (current) {
          return model.archiveHabit(current, id, today || date.localISODate());
        });
      },
      toggleCheckin: function (habitId, localDate) {
        return mutate(function (current) {
          return model.toggleCheckin(current, habitId, localDate, new Date().toISOString());
        });
      },
      setSettings: function (patch) {
        return mutate(function (current) {
          var next = model.clone(current);
          if (patch.weekStartsOn === 0 || patch.weekStartsOn === 1) {
            next.settings.weekStartsOn = patch.weekStartsOn;
          }
          if (typeof patch.locale === "string" && patch.locale) {
            next.settings.locale = patch.locale;
          }
          return next;
        });
      },
      exportBackup: function () {
        return queue.run(function () {
          return JSON.stringify(validate.serializeBackup(state), null, 2);
        });
      },
      importBackup: function (raw) {
        return mutate(function () {
          var parsed = validate.parseBackup(raw);
          return {
            schemaVersion: parsed.schemaVersion,
            habits: parsed.habits,
            checkins: parsed.checkins,
            settings: parsed.settings
          };
        });
      },
      _setPersistFail: function (value) {
        persistFail = value;
      }
    };
  }

  var api = { create: create, DB_NAME: DB_NAME };

  root.Habitos = root.Habitos || {};
  root.Habitos.storage = api;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : (typeof global !== "undefined" ? global : this));
