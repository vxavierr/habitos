#!/usr/bin/env node
"use strict";

var fs = require("fs");
var path = require("path");

var ROOT = path.join(__dirname, "..", "app");
var BANS = [
  { re: /\?\./, name: "optional chaining (?.)" },
  { re: /\?\?/, name: "nullish coalescing (??)" },
  { re: /\?\?=/, name: "??= " },
  { re: /\|\|=/, name: "||=" },
  { re: /&&=/, name: "&&=" },
  { re: /Promise\.allSettled/, name: "Promise.allSettled" },
  { re: /Object\.fromEntries/, name: "Object.fromEntries" },
  { re: /globalThis/, name: "globalThis" },
  { re: /queueMicrotask/, name: "queueMicrotask" },
  { re: /crypto\.randomUUID/, name: "crypto.randomUUID" },
  { re: /\.replaceAll\s*\(/, name: "String.replaceAll" },
  { re: /\.at\s*\(/, name: "Array/String.at" },
  { re: /structuredClone/, name: "structuredClone" },
  { re: /showOpenFilePicker/, name: "showOpenFilePicker" },
  { re: /for\s+await/, name: "for await" },
  { re: /async\s+function\s*\*/, name: "async generator" },
  { re: /this\.#/, name: "private field (this.#)" }
];

function walk(dir, acc) {
  var entries = fs.readdirSync(dir);
  var i;
  var full;
  var st;
  for (i = 0; i < entries.length; i += 1) {
    full = path.join(dir, entries[i]);
    st = fs.statSync(full);
    if (st.isDirectory()) {
      walk(full, acc);
    } else if (/\.js$/.test(entries[i])) {
      acc.push(full);
    }
  }
  return acc;
}

var files = walk(ROOT, []);
var hits = [];
var i;
var j;
var source;
var rel;
for (i = 0; i < files.length; i += 1) {
  source = fs.readFileSync(files[i], "utf8");
  rel = path.relative(path.join(__dirname, ".."), files[i]);
  for (j = 0; j < BANS.length; j += 1) {
    if (BANS[j].re.test(source)) {
      hits.push(rel + " → " + BANS[j].name);
    }
  }
}

if (hits.length) {
  console.error("Sintaxe incompatível com Safari/iOS 12:");
  for (i = 0; i < hits.length; i += 1) {
    console.error("  " + hits[i]);
  }
  process.exit(1);
}

console.log("check-ios12-syntax: ok (" + files.length + " arquivos)");
