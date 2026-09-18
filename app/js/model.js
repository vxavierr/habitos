(function (root) {
  "use strict";

  var date = (root.Habitos && root.Habitos.date) || (typeof require !== "undefined" ? require("./date.js") : null);
  var ids = (root.Habitos && root.Habitos.id) || (typeof require !== "undefined" ? require("./id.js") : null);

  var SCHEMA_VERSION = 1;
  var FORMAT = "habitos-backup";
  var FORMAT_VERSION = 1;
  var APP_VERSION = "0.1.0";

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function defaultSettings() {
    return {
      id: "app",
      locale: "pt-BR",
      weekStartsOn: 1
    };
  }

  function emptyState() {
    return {
      schemaVersion: SCHEMA_VERSION,
      habits: [],
      checkins: [],
      settings: defaultSettings()
    };
  }

  function trimName(name) {
    if (typeof name !== "string") {
      return "";
    }
    return name.replace(/^\s+|\s+$/g, "");
  }

  function findHabit(state, id) {
    var i;
    for (i = 0; i < state.habits.length; i += 1) {
      if (state.habits[i].id === id) {
        return state.habits[i];
      }
    }
    return null;
  }

  function findCheckin(state, habitId, localDate) {
    var key = ids.checkinKey(habitId, localDate);
    var i;
    for (i = 0; i < state.checkins.length; i += 1) {
      if (state.checkins[i].key === key) {
        return state.checkins[i];
      }
    }
    return null;
  }

  function activeHabits(state) {
    var out = [];
    var i;
    for (i = 0; i < state.habits.length; i += 1) {
      if (!state.habits[i].archivedOn) {
        out.push(state.habits[i]);
      }
    }
    return out;
  }

  function createHabit(state, name, today, explicitId) {
    var next = clone(state);
    var trimmed = trimName(name);
    if (!trimmed) {
      throw new Error("Dê um nome ao hábito.");
    }
    if (!date.isISODate(today)) {
      throw new Error("Data local inválida.");
    }
    next.habits.push({
      id: explicitId || ids.newId("h"),
      name: trimmed,
      createdOn: today,
      archivedOn: null
    });
    return next;
  }

  function renameHabit(state, id, name) {
    var next = clone(state);
    var habit = findHabit(next, id);
    var trimmed = trimName(name);
    if (!habit) {
      throw new Error("Hábito não encontrado.");
    }
    if (!trimmed) {
      throw new Error("Dê um nome ao hábito.");
    }
    habit.name = trimmed;
    return next;
  }

  function archiveHabit(state, id, today) {
    var next = clone(state);
    var habit = findHabit(next, id);
    if (!habit) {
      throw new Error("Hábito não encontrado.");
    }
    if (!date.isISODate(today)) {
      throw new Error("Data local inválida.");
    }
    if (!habit.archivedOn) {
      habit.archivedOn = today;
    }
    return next;
  }

  function canCheckin(habit, localDate) {
    if (!habit || habit.archivedOn) {
      return false;
    }
    if (!date.isISODate(localDate) || !date.isISODate(habit.createdOn)) {
      return false;
    }
    if (date.compareISO(localDate, habit.createdOn) < 0) {
      return false;
    }
    return true;
  }

  function toggleCheckin(state, habitId, localDate, completedAt) {
    var next = clone(state);
    var habit = findHabit(next, habitId);
    if (!habit) {
      throw new Error("Hábito não encontrado.");
    }
    if (!canCheckin(habit, localDate)) {
      throw new Error("Este dia não aceita registro para esse hábito.");
    }
    var existing = findCheckin(next, habitId, localDate);
    if (existing) {
      next.checkins = next.checkins.filter(function (row) {
        return row.key !== existing.key;
      });
      return { state: next, completed: false, completedAt: null };
    }
    next.checkins.push({
      key: ids.checkinKey(habitId, localDate),
      habitId: habitId,
      localDate: localDate,
      completedAt: completedAt || new Date().toISOString()
    });
    return {
      state: next,
      completed: true,
      completedAt: next.checkins[next.checkins.length - 1].completedAt
    };
  }

  function cellState(habit, localDate, checkin, today) {
    if (date.compareISO(localDate, today) > 0) {
      return "future";
    }
    if (date.compareISO(localDate, habit.createdOn) < 0) {
      return "before";
    }
    if (checkin) {
      return "done";
    }
    return "empty";
  }

  function cellLabel(kind) {
    if (kind === "done") {
      return "feito";
    }
    if (kind === "empty") {
      return "não registrado";
    }
    return "não aplicável";
  }

  function optionalExamples() {
    return [
      { name: "Beber água" },
      { name: "Caminhar" },
      { name: "Ler" }
    ];
  }

  var api = {
    SCHEMA_VERSION: SCHEMA_VERSION,
    FORMAT: FORMAT,
    FORMAT_VERSION: FORMAT_VERSION,
    APP_VERSION: APP_VERSION,
    clone: clone,
    emptyState: emptyState,
    defaultSettings: defaultSettings,
    trimName: trimName,
    findHabit: findHabit,
    findCheckin: findCheckin,
    activeHabits: activeHabits,
    createHabit: createHabit,
    renameHabit: renameHabit,
    archiveHabit: archiveHabit,
    canCheckin: canCheckin,
    toggleCheckin: toggleCheckin,
    cellState: cellState,
    cellLabel: cellLabel,
    optionalExamples: optionalExamples
  };

  root.Habitos = root.Habitos || {};
  root.Habitos.model = api;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : (typeof global !== "undefined" ? global : this));
