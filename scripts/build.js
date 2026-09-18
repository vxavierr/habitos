#!/usr/bin/env node
"use strict";

var fs = require("fs");
var path = require("path");

var ROOT = path.join(__dirname, "..");
var SRC = path.join(ROOT, "app");
var DEST = path.join(ROOT, "dist");
var pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));

function rm(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }
  fs.rmSync(dir, { recursive: true, force: true });
}

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  var entries = fs.readdirSync(from);
  var i;
  var src;
  var dest;
  var st;
  for (i = 0; i < entries.length; i += 1) {
    src = path.join(from, entries[i]);
    dest = path.join(to, entries[i]);
    st = fs.statSync(src);
    if (st.isDirectory()) {
      copyDir(src, dest);
    } else {
      fs.copyFileSync(src, dest);
    }
  }
}

rm(DEST);
copyDir(SRC, DEST);

var swPath = path.join(DEST, "sw.js");
var sw = fs.readFileSync(swPath, "utf8");
sw = sw.replace(/habitos-0\.1\.0/g, "habitos-" + pkg.version);
fs.writeFileSync(swPath, sw);

var required = [
  "index.html",
  "css/app.css",
  "js/app.js",
  "sw.js",
  "manifest.webmanifest",
  "icons/apple-touch-icon.png"
];
var missing = required.filter(function (rel) {
  return !fs.existsSync(path.join(DEST, rel));
});
if (missing.length) {
  console.error("build incompleto, faltando: " + missing.join(", "));
  process.exit(1);
}

console.log("build: dist/ pronto (v" + pkg.version + ")");
