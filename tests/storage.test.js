"use strict";

var test = require("node:test");
var assert = require("node:assert/strict");
var storage = require("../app/js/storage.js");
var validate = require("../app/js/validate.js");

function openMemory() {
  var store = storage.create({ backend: "memory" });
  return store.open().then(function () {
    return store;
  });
}

test("fatia: criar → marcar → exportar → reabrir em banco limpo", async function () {
  var store = await openMemory();
  await store.createHabit("Água", "2026-09-18");
  var id = store.getState().habits[0].id;
  await store.toggleCheckin(id, "2026-09-18");
  var json = await store.exportBackup();
  var parsed = JSON.parse(json);
  assert.equal(parsed.format, "habitos-backup");
  assert.equal(parsed.habits.length, 1);
  assert.equal(parsed.checkins.length, 1);

  var other = await openMemory();
  await other.importBackup(json);
  var state = other.getState();
  assert.equal(state.habits[0].name, "Água");
  assert.equal(state.checkins.length, 1);
});

test("toques repetidos serializados não duplicam registros", async function () {
  var store = await openMemory();
  await store.createHabit("Ler", "2026-09-18");
  var id = store.getState().habits[0].id;
  await Promise.all([
    store.toggleCheckin(id, "2026-09-18"),
    store.toggleCheckin(id, "2026-09-18"),
    store.toggleCheckin(id, "2026-09-18")
  ]);
  assert.equal(store.getState().checkins.length, 1);
});

test("falha de gravação reverte o estado e não marca como salvo", async function () {
  var store = await openMemory();
  await store.createHabit("Água", "2026-09-18");
  store._setPersistFail(true);
  await assert.rejects(function () {
    return store.createHabit("Ler", "2026-09-18");
  });
  assert.equal(store.getState().habits.length, 1);
  assert.equal(store.getState().habits[0].name, "Água");
});

test("importação inválida não altera o banco", async function () {
  var store = await openMemory();
  await store.createHabit("Água", "2026-09-18");
  await assert.rejects(function () {
    return store.importBackup("{nao-json");
  });
  await assert.rejects(function () {
    return store.importBackup({ format: "outro", habits: [], checkins: [], settings: {} });
  });
  await assert.rejects(function () {
    return store.importBackup({
      format: "habitos-backup",
      formatVersion: 1,
      schemaVersion: 1,
      habits: [{ id: "h1", name: "X", createdOn: "2026-09-18", archivedOn: null }],
      checkins: [
        {
          key: "ghost|2026-09-18",
          habitId: "ghost",
          localDate: "2026-09-18",
          completedAt: "2026-09-18T12:00:00.000Z"
        }
      ],
      settings: { locale: "pt-BR", weekStartsOn: 1 }
    });
  });
  assert.equal(store.getState().habits[0].name, "Água");
  assert.equal(store.getState().habits.length, 1);

  await assert.rejects(function () {
    return store.importBackup({
      format: "habitos-backup",
      formatVersion: 1,
      schemaVersion: 1,
      habits: [{ id: "h1", name: "X", createdOn: "2026-09-18", archivedOn: null }],
      checkins: [
        {
          key: "h1|2026-09-18",
          habitId: "h1",
          localDate: "2026-09-18",
          completedAt: "2026-09-18T12:00:00.000Z"
        },
        {
          key: "h1|2026-09-18",
          habitId: "h1",
          localDate: "2026-09-18",
          completedAt: "2026-09-18T12:01:00.000Z"
        }
      ],
      settings: { locale: "pt-BR", weekStartsOn: 1 }
    });
  });
  assert.equal(store.getState().habits[0].name, "Água");
});

test("importação substitui o conjunto inteiro", async function () {
  var store = await openMemory();
  await store.createHabit("Velho", "2026-09-01");
  var payload = validate.serializeBackup({
    schemaVersion: 1,
    habits: [{ id: "h_novo", name: "Novo", createdOn: "2026-09-18", archivedOn: null }],
    checkins: [],
    settings: { id: "app", locale: "pt-BR", weekStartsOn: 0 }
  });
  await store.importBackup(payload);
  var state = store.getState();
  assert.equal(state.habits.length, 1);
  assert.equal(state.habits[0].name, "Novo");
  assert.equal(state.settings.weekStartsOn, 0);
});
