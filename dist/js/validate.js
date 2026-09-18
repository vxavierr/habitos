(function (root) {
  "use strict";

  var date = (root.Habitos && root.Habitos.date) || (typeof require !== "undefined" ? require("./date.js") : null);
  var ids = (root.Habitos && root.Habitos.id) || (typeof require !== "undefined" ? require("./id.js") : null);
  var model = (root.Habitos && root.Habitos.model) || (typeof require !== "undefined" ? require("./model.js") : null);

  function fail(msg) {
    var err = new Error(msg);
    err.code = "INVALID_BACKUP";
    throw err;
  }

  function isPlainObject(v) {
    return v !== null && typeof v === "object" && Object.prototype.toString.call(v) === "[object Object]";
  }

  function asString(v, field) {
    if (typeof v !== "string" || v.length === 0) {
      fail("Campo inválido: " + field);
    }
    return v;
  }

  function parseBackup(raw) {
    var data = raw;
    if (typeof raw === "string") {
      try {
        data = JSON.parse(raw);
      } catch (err) {
        fail("JSON inválido. Cole o arquivo de backup completo.");
      }
    }
    if (!isPlainObject(data)) {
      fail("O backup precisa ser um objeto JSON.");
    }
    if (data.format !== model.FORMAT) {
      fail("Formato desconhecido. Esperado: " + model.FORMAT);
    }
    if (data.formatVersion !== model.FORMAT_VERSION) {
      fail("Versão de arquivo não suportada.");
    }
    if (data.schemaVersion !== model.SCHEMA_VERSION) {
      fail("Versão de esquema não suportada.");
    }
    if (!Array.isArray(data.habits) || !Array.isArray(data.checkins) || !isPlainObject(data.settings)) {
      fail("Backup incompleto: hábitos, registros e ajustes são obrigatórios.");
    }

    var habits = [];
    var seenHabit = {};
    var i;
    var h;
    var name;
    for (i = 0; i < data.habits.length; i += 1) {
      h = data.habits[i];
      if (!isPlainObject(h)) {
        fail("Hábito inválido na posição " + i);
      }
      asString(h.id, "habits.id");
      if (seenHabit[h.id]) {
        fail("ID de hábito duplicado: " + h.id);
      }
      seenHabit[h.id] = true;
      name = model.trimName(h.name);
      if (!name) {
        fail("Hábito sem nome: " + h.id);
      }
      if (!date.isISODate(h.createdOn)) {
        fail("createdOn inválido em " + h.id);
      }
      if (h.archivedOn !== null && h.archivedOn !== undefined && h.archivedOn !== "") {
        if (!date.isISODate(h.archivedOn)) {
          fail("archivedOn inválido em " + h.id);
        }
      } else {
        h.archivedOn = null;
      }
      habits.push({
        id: h.id,
        name: name,
        createdOn: h.createdOn,
        archivedOn: h.archivedOn
      });
    }

    var checkins = [];
    var seenCheckin = {};
    var c;
    var key;
    for (i = 0; i < data.checkins.length; i += 1) {
      c = data.checkins[i];
      if (!isPlainObject(c)) {
        fail("Registro inválido na posição " + i);
      }
      asString(c.habitId, "checkins.habitId");
      if (!seenHabit[c.habitId]) {
        fail("Registro aponta para hábito inexistente: " + c.habitId);
      }
      if (!date.isISODate(c.localDate)) {
        fail("Data de registro inválida.");
      }
      key = c.key ? asString(c.key, "checkins.key") : ids.checkinKey(c.habitId, c.localDate);
      if (key !== ids.checkinKey(c.habitId, c.localDate)) {
        fail("Chave de registro não confere com hábito/data.");
      }
      if (seenCheckin[key]) {
        fail("Registro duplicado para o mesmo dia.");
      }
      seenCheckin[key] = true;
      if (typeof c.completedAt !== "string" || c.completedAt.length < 10) {
        fail("completedAt inválido.");
      }
      checkins.push({
        key: key,
        habitId: c.habitId,
        localDate: c.localDate,
        completedAt: c.completedAt
      });
    }

    var weekStartsOn = data.settings.weekStartsOn === 0 ? 0 : 1;
    var locale = typeof data.settings.locale === "string" && data.settings.locale ? data.settings.locale : "pt-BR";

    return {
      format: model.FORMAT,
      formatVersion: model.FORMAT_VERSION,
      schemaVersion: model.SCHEMA_VERSION,
      exportedAt: typeof data.exportedAt === "string" ? data.exportedAt : null,
      habits: habits,
      checkins: checkins,
      settings: {
        id: "app",
        locale: locale,
        weekStartsOn: weekStartsOn
      }
    };
  }

  function serializeBackup(state) {
    return {
      format: model.FORMAT,
      formatVersion: model.FORMAT_VERSION,
      schemaVersion: state.schemaVersion || model.SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      appVersion: model.APP_VERSION,
      habits: state.habits || [],
      checkins: state.checkins || [],
      settings: {
        id: "app",
        locale: (state.settings && state.settings.locale) || "pt-BR",
        weekStartsOn: (state.settings && state.settings.weekStartsOn) === 0 ? 0 : 1
      }
    };
  }

  var api = {
    parseBackup: parseBackup,
    serializeBackup: serializeBackup
  };

  root.Habitos = root.Habitos || {};
  root.Habitos.validate = api;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : (typeof global !== "undefined" ? global : this));
