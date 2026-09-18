"use strict";

var test = require("node:test");
var assert = require("node:assert/strict");
var date = require("../app/js/date.js");

test("localISODate usa componentes locais, não UTC", function () {
  var d = new Date(2026, 8, 18, 23, 30, 0);
  assert.equal(date.localISODate(d), "2026-09-18");
  var utcDay = d.toISOString().slice(0, 10);
  if (utcDay !== "2026-09-18") {
    assert.notEqual(utcDay, date.localISODate(d));
  }
});

test("meia-noite local permanece no dia civil", function () {
  var d = new Date(2026, 8, 18, 0, 0, 0);
  assert.equal(date.localISODate(d), "2026-09-18");
});

test("virada de mês e de ano", function () {
  assert.equal(date.addDays("2026-01-31", 1), "2026-02-01");
  assert.equal(date.addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(date.addDays("2028-02-28", 1), "2028-02-29");
  assert.equal(date.parseISODate("2026-02-29"), null);
});

test("semana começando na segunda", function () {
  assert.equal(date.startOfWeek("2026-09-18", 1), "2026-09-14");
  assert.deepEqual(date.weekDates("2026-09-14"), [
    "2026-09-14",
    "2026-09-15",
    "2026-09-16",
    "2026-09-17",
    "2026-09-18",
    "2026-09-19",
    "2026-09-20"
  ]);
});

test("semana começando no domingo", function () {
  assert.equal(date.startOfWeek("2026-09-18", 0), "2026-09-13");
});
