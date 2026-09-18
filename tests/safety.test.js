"use strict";

var test = require("node:test");
var assert = require("node:assert/strict");
var fs = require("fs");
var path = require("path");

test("nomes e JSON nunca entram via innerHTML", function () {
  var files = ["app/js/ui.js", "app/js/app.js", "app/index.html"];
  files.forEach(function (rel) {
    var src = fs.readFileSync(path.join(__dirname, "..", rel), "utf8");
    assert.equal(src.indexOf("innerHTML"), -1, rel + " usa innerHTML");
  });
});
