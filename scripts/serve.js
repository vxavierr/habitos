#!/usr/bin/env node
"use strict";

var http = require("http");
var fs = require("fs");
var path = require("path");
var os = require("os");

var ROOT = path.join(__dirname, "..", "dist");
var PORT = Number(process.env.PORT || 4173);
var TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png": "image/png",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

function send(res, code, type, body) {
  res.writeHead(code, {
    "Content-Type": type,
    "Cache-Control": "no-store",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

var server = http.createServer(function (req, res) {
  var urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  if (urlPath === "/") {
    urlPath = "/index.html";
  }
  var file = path.normalize(path.join(ROOT, urlPath));
  if (file.indexOf(ROOT) !== 0) {
    send(res, 403, "text/plain", "forbidden");
    return;
  }
  fs.readFile(file, function (err, data) {
    if (err) {
      send(res, 404, "text/plain; charset=utf-8", "not found");
      return;
    }
    var type = TYPES[path.extname(file)] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-store" });
    res.end(data);
  });
});

server.listen(PORT, "127.0.0.1", function () {
  var nets = os.networkInterfaces();
  var lan = [];
  Object.keys(nets).forEach(function (name) {
    (nets[name] || []).forEach(function (net) {
      if (net.family === "IPv4" && !net.internal) {
        lan.push(net.address);
      }
    });
  });
  console.log("Hábitos (HTTP local, só desenvolvimento)");
  console.log("  desktop: http://127.0.0.1:" + PORT + "/");
  if (lan.length) {
    console.log("  LAN HTTP (NÃO serve para service worker no iPod): http://" + lan[0] + ":" + PORT + "/");
  }
  console.log("localhost é contexto seguro no computador. No iPod isso NÃO vale: precisa HTTPS com certificado confiável.");
});
