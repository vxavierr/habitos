"use strict";

var test = require("node:test");
var assert = require("node:assert/strict");
var model = require("../app/js/model.js");

test("criar, marcar, desmarcar e arquivar preserva histórico", function () {
  var today = "2026-09-18";
  var state = model.emptyState();
  state = model.createHabit(state, "Água", today, "h_1");
  var toggled = model.toggleCheckin(state, "h_1", today, "2026-09-18T12:00:00.000Z");
  assert.equal(toggled.completed, true);
  state = toggled.state;
  assert.equal(state.checkins.length, 1);
  toggled = model.toggleCheckin(state, "h_1", today, "2026-09-18T12:01:00.000Z");
  assert.equal(toggled.completed, false);
  state = toggled.state;
  assert.equal(state.checkins.length, 0);
  toggled = model.toggleCheckin(state, "h_1", today, "2026-09-18T12:02:00.000Z");
  state = toggled.state;
  state = model.archiveHabit(state, "h_1", today);
  assert.equal(model.activeHabits(state).length, 0);
  assert.equal(state.checkins.length, 1);
  assert.equal(state.habits[0].archivedOn, today);
});

test("não duplica check-in no mesmo dia", function () {
  var today = "2026-09-18";
  var state = model.createHabit(model.emptyState(), "Ler", today, "h_1");
  state = model.toggleCheckin(state, "h_1", today, "t1").state;
  assert.equal(state.checkins.length, 1);
  var keys = {};
  state.checkins.forEach(function (row) {
    assert.equal(keys[row.key], undefined);
    keys[row.key] = true;
  });
  var again = model.toggleCheckin(state, "h_1", today, "t2");
  assert.equal(again.completed, false);
  assert.equal(again.state.checkins.length, 0);
});

test("datas futuras e anteriores à criação não são falha", function () {
  var habit = { id: "h_1", name: "X", createdOn: "2026-09-10", archivedOn: null };
  assert.equal(model.cellState(habit, "2026-09-18", null, "2026-09-17"), "future");
  assert.equal(model.cellState(habit, "2026-09-09", null, "2026-09-17"), "before");
  assert.equal(model.cellState(habit, "2026-09-10", null, "2026-09-17"), "empty");
  assert.equal(model.cellState(habit, "2026-09-10", { key: "h_1|2026-09-10" }, "2026-09-17"), "done");
  assert.equal(model.canCheckin(habit, "2026-09-09"), false);
});

test("renomear e nome vazio", function () {
  var state = model.createHabit(model.emptyState(), "  Água  ", "2026-09-18", "h_1");
  assert.equal(state.habits[0].name, "Água");
  state = model.renameHabit(state, "h_1", "Caminhar");
  assert.equal(state.habits[0].name, "Caminhar");
  assert.throws(function () {
    model.renameHabit(state, "h_1", "   ");
  });
});
