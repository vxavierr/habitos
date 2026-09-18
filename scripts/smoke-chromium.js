#!/usr/bin/env node
"use strict";

var http = require("http");
var fs = require("fs");
var path = require("path");
var { spawn } = require("child_process");

var ROOT = path.join(__dirname, "..");
var EVIDENCE = path.join(ROOT, "evidence");
var PORT = 4179;
var BASE = "http://127.0.0.1:" + PORT;

function loadPlaywright() {
  var candidates = [
    "playwright",
    path.join(
      process.env.HOME || "",
      ".local/share/mise/installs/npm-playwright/latest/node_modules/playwright"
    )
  ];
  var i;
  for (i = 0; i < candidates.length; i += 1) {
    try {
      return require(candidates[i]);
    } catch (err) {}
  }
  return null;
}

function startServer() {
  return new Promise(function (resolve, reject) {
    var child = spawn(process.execPath, [path.join(__dirname, "serve.js")], {
      env: Object.assign({}, process.env, { PORT: String(PORT) }),
      stdio: ["ignore", "pipe", "pipe"]
    });
    var ready = false;
    child.stdout.on("data", function (buf) {
      if (!ready && String(buf).indexOf("desktop:") !== -1) {
        ready = true;
        resolve(child);
      }
    });
    child.stderr.on("data", function (buf) {
      process.stderr.write(buf);
    });
    child.on("exit", function (code) {
      if (!ready) {
        reject(new Error("serve.js saiu com código " + code));
      }
    });
    setTimeout(function () {
      if (!ready) {
        reject(new Error("serve.js não subiu"));
      }
    }, 5000);
  });
}

function waitHttp() {
  return new Promise(function (resolve, reject) {
    var tries = 0;
    function ping() {
      tries += 1;
      http
        .get(BASE + "/", function (res) {
          res.resume();
          if (res.statusCode === 200) {
            resolve();
          } else if (tries > 20) {
            reject(new Error("HTTP " + res.statusCode));
          } else {
            setTimeout(ping, 150);
          }
        })
        .on("error", function () {
          if (tries > 20) {
            reject(new Error("servidor indisponível"));
          } else {
            setTimeout(ping, 150);
          }
        });
    }
    ping();
  });
}

async function run() {
  fs.mkdirSync(EVIDENCE, { recursive: true });
  var pw = loadPlaywright();
  if (!pw) {
    console.error("smoke: Playwright não encontrado. Testes Node ainda valem; este smoke é extra.");
    process.exit(2);
  }
  var child = await startServer();
  try {
    await waitHttp();
    var launchOpts = {
      headless: true,
      args: ["--disable-dev-shm-usage", "--no-sandbox"]
    };
    if (fs.existsSync("/usr/bin/chromium")) {
      launchOpts.executablePath = "/usr/bin/chromium";
    }
    var browser = await pw.chromium.launch(launchOpts);
    var context = await browser.newContext({
      viewport: { width: 320, height: 568 },
      hasTouch: true,
      isMobile: true
    });
    var page = await context.newPage();
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Criar hábito" }).click();
    await page.locator("#habit-name").fill("Água");
    await page.getByRole("button", { name: "Adicionar" }).click();
    await page.getByRole("button", { name: "Hoje" }).click();
    await page.getByRole("button", { name: /Água/ }).click();
    await page.waitForFunction(function () {
      var el = document.querySelector(".habit-state");
      return el && el.textContent === "Feito";
    });
    await page.screenshot({ path: path.join(EVIDENCE, "hoje-320x568.png"), fullPage: true });
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForFunction(function () {
      var el = document.querySelector(".habit-state");
      return el && el.textContent === "Feito";
    });
    await page.getByRole("button", { name: "Histórico" }).click();
    await page.screenshot({ path: path.join(EVIDENCE, "historico-320x568.png"), fullPage: true });
    await page.getByRole("button", { name: "Ajustes" }).click();
    await page.screenshot({ path: path.join(EVIDENCE, "ajustes-320x568.png"), fullPage: true });
    await page.getByRole("button", { name: "Mostrar JSON para copiar" }).click();
    var json = await page.locator("#backup-json").inputValue();
    if (json.indexOf("habitos-backup") === -1) {
      throw new Error("export não preencheu JSON");
    }
    await page.locator("#backup-json").fill("{nao:valido}");
    page.once("dialog", function (dialog) {
      dialog.accept();
    });
    await page.getByRole("button", { name: "Importar JSON colado" }).click();
    await page.waitForFunction(function () {
      var el = document.getElementById("save-state");
      return el && /Não salvou/.test(el.textContent || "");
    });
    await page.getByRole("button", { name: "Hoje" }).click();
    var still = await page.locator(".habit-name").textContent();
    if (still !== "Água") {
      throw new Error("import inválido apagou dados");
    }
    await browser.close();
    fs.writeFileSync(
      path.join(EVIDENCE, "smoke.json"),
      JSON.stringify(
        {
          at: new Date().toISOString(),
          viewport: "320x568",
          browser: "chromium-headless",
          result: "pass",
          note: "Chromium moderno não prova Safari/iOS 12."
        },
        null,
        2
      )
    );
    console.log("smoke-chromium: pass (evidência em evidence/)");
  } finally {
    child.kill("SIGTERM");
  }
}

run().catch(function (err) {
  console.error("smoke-chromium: FAIL " + err.message);
  process.exit(1);
});
