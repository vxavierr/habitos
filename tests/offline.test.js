"use strict";

var test = require("node:test");
var assert = require("node:assert/strict");
var fs = require("fs");
var path = require("path");
var offline = require("../app/js/offline.js");

test("lista essencial do worker cobre arquivos reais", function () {
  var app = path.join(__dirname, "..", "app");
  var sw = fs.readFileSync(path.join(app, "sw.js"), "utf8");
  offline.ESSENTIAL.forEach(function (rel) {
    if (rel === "./") {
      return;
    }
    var file = path.join(app, rel.replace(/^\.\//, ""));
    assert.ok(fs.existsSync(file), "faltando " + rel);
    assert.ok(sw.indexOf(rel) !== -1, "sw.js não cacheia " + rel);
  });
});

test("offline só fica pronto com worker no controle e cache completo", function () {
  var incomplete = offline.essentialsPresent(["./index.html"]);
  var complete = offline.essentialsPresent(offline.ESSENTIAL);
  assert.equal(incomplete.ok, false);
  assert.ok(incomplete.missing.length > 0);
  assert.equal(complete.ok, true);
  assert.equal(offline.isControlled(), false);
  assert.equal(offline.cacheName("0.1.0"), "habitos-0.1.0");
});
