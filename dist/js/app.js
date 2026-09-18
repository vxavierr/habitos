(function (root) {
  "use strict";

  var writing = false;
  var tab = "hoje";
  var weekStart = null;
  var store = null;
  var today = null;
  var updateBanner = false;

  function $(id) {
    return document.getElementById(id);
  }

  function isWriting() {
    return writing;
  }

  function currentToday() {
    return Habitos.date.localISODate();
  }

  function setTab(name) {
    tab = name;
    var buttons = document.querySelectorAll(".tabs button");
    var i;
    for (i = 0; i < buttons.length; i += 1) {
      buttons[i].className = buttons[i].getAttribute("data-tab") === name ? "is-active" : "";
      buttons[i].setAttribute("aria-current", buttons[i].getAttribute("data-tab") === name ? "page" : "false");
    }
    render();
  }

  function titleFor(name, state) {
    if (name === "hoje") {
      $("title").textContent = "Hoje";
      $("subtitle").textContent = Habitos.date.formatLong(today);
      return;
    }
    if (name === "historico") {
      $("title").textContent = "Histórico";
      $("subtitle").textContent = "Sem pontuação. Só o que foi feito ou não.";
      return;
    }
    $("title").textContent = "Ajustes";
    $("subtitle").textContent = "Tudo fica neste aparelho.";
  }

  function diagnosticsText(offlineInfo) {
    var state = store.getState();
    var ua = root.navigator ? root.navigator.userAgent : "desconhecido";
    var lines = [
      "app: " + Habitos.model.APP_VERSION,
      "data local: " + today,
      "fuso (minutos a oeste de UTC): " + new Date().getTimezoneOffset(),
      "standalone (tela inicial): " + (Habitos.compat.isStandalone() ? "sim" : "não"),
      "online: " + (root.navigator && root.navigator.onLine ? "sim" : "não"),
      "IndexedDB: ok",
      "hábitos: " + state.habits.length,
      "registros: " + state.checkins.length,
      "service worker: " + (Habitos.offline.hasSW() ? "API presente" : "indisponível"),
      "página controlada pelo worker: " + (offlineInfo && offlineInfo.controlled ? "sim" : "não"),
      "cache essencial: " + (offlineInfo && offlineInfo.cacheOk ? "completo" : "incompleto ou não verificado"),
      "offline pronto: " + (offlineInfo && offlineInfo.ready ? "sim" : "não"),
      "navegador: " + ua
    ];
    if (offlineInfo && offlineInfo.missing && offlineInfo.missing.length) {
      lines.push("faltando no cache: " + offlineInfo.missing.join(", "));
    }
    if (updateBanner) {
      lines.push("nova versão pronta: reabra o app para carregar");
    }
    return lines.join("\n");
  }

  function render() {
    var main = $("main");
    var state = store.getState();
    titleFor(tab, state);
    var handlers = {
      toggle: onToggle,
      goCreate: function () {
        setTab("ajustes");
        setTimeout(function () {
          var input = $("habit-name");
          if (input) {
            input.focus();
          }
        }, 0);
      },
      addExamples: onExamples,
      prevWeek: function () {
        weekStart = Habitos.date.addDays(weekStart, -7);
        render();
      },
      nextWeek: function () {
        weekStart = Habitos.date.addDays(weekStart, 7);
        render();
      },
      create: onCreate,
      rename: onRename,
      archive: onArchive,
      exportJson: onExportShow,
      downloadFile: onDownload,
      importPasted: onImportPasted,
      importFile: onImportFile,
      setWeekStart: onWeekStart
    };
    if (tab === "hoje") {
      Habitos.ui.renderHoje(main, state, today, handlers);
    } else if (tab === "historico") {
      Habitos.ui.renderHistorico(main, state, today, weekStart, handlers);
    } else {
      Habitos.ui.renderAjustes(main, state, "Coletando diagnóstico…", handlers);
      Habitos.offline.offlineReady(Habitos.model.APP_VERSION).then(function (info) {
        if (tab !== "ajustes") {
          return;
        }
        var diag = document.querySelector("#main .diag");
        if (diag) {
          diag.textContent = diagnosticsText(info);
        }
        var badge = $("offline-badge");
        if (badge) {
          badge.hidden = !info.ready;
          badge.textContent = info.ready ? "Disponível offline" : "";
        }
      });
    }
  }

  function withWrite(label, work) {
    writing = true;
    Habitos.ui.setSaveState("saving", "Salvando…");
    return work()
      .then(function (result) {
        Habitos.ui.setSaveState("saved", "Salvo");
        render();
        writing = false;
        return result;
      })
      .catch(function (err) {
        Habitos.ui.setSaveState("error", "Não salvou: " + (err && err.message ? err.message : "erro"));
        render();
        writing = false;
        return Promise.reject(err);
      });
  }

  function onToggle(id) {
    return withWrite("toggle", function () {
      return store.toggleCheckin(id, today);
    }).catch(function () {});
  }

  function onCreate(name) {
    return withWrite("create", function () {
      return store.createHabit(name, today);
    }).then(function () {
      var input = $("habit-name");
      if (input) {
        input.value = "";
      }
    }).catch(function () {});
  }

  function onRename(id, name) {
    return withWrite("rename", function () {
      return store.renameHabit(id, name);
    }).catch(function () {});
  }

  function onArchive(id) {
    return withWrite("archive", function () {
      return store.archiveHabit(id, today);
    }).catch(function () {});
  }

  function onExamples() {
    var examples = Habitos.model.optionalExamples();
    return withWrite("examples", function () {
      var chain = Promise.resolve();
      var i;
      for (i = 0; i < examples.length; i += 1) {
        chain = chain.then(
          (function (n) {
            return function () {
              return store.createHabit(n, today);
            };
          })(examples[i].name)
        );
      }
      return chain;
    }).catch(function () {});
  }

  function onWeekStart(value) {
    return withWrite("week", function () {
      return store.setSettings({ weekStartsOn: value });
    }).then(function () {
      weekStart = Habitos.date.startOfWeek(today, store.getState().settings.weekStartsOn);
    }).catch(function () {});
  }

  function fillBackupArea(text) {
    var area = $("backup-json");
    if (!area) {
      return;
    }
    area.value = text;
    if (area.select) {
      area.select();
    }
  }

  function onExportShow() {
    return store.exportBackup().then(function (text) {
      if (tab !== "ajustes") {
        setTab("ajustes");
      }
      fillBackupArea(text);
      Habitos.ui.setSaveState("saved", "JSON pronto para copiar. Cole num e-mail ou nota fora deste site.");
    });
  }

  function onDownload() {
    return store.exportBackup().then(function (text) {
      fillBackupArea(text);
      var blob = new Blob([text], { type: "application/json" });
      var url = (root.URL && root.URL.createObjectURL) ? root.URL.createObjectURL(blob) : null;
      if (!url) {
        Habitos.ui.setSaveState("error", "Download indisponível. Copie o JSON abaixo.");
        return;
      }
      var a = document.createElement("a");
      a.href = url;
      a.download = "habitos-backup-" + today + ".json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      Habitos.ui.setSaveState("saved", "Se o arquivo não apareceu, copie o JSON. No iPod o download costuma falhar.");
    });
  }

  function confirmReplace() {
    return window.confirm(
      "Importar substitui todos os hábitos e registros deste aparelho. O arquivo inválido é recusado e nada muda. Continuar?"
    );
  }

  function importRaw(raw) {
    if (!confirmReplace()) {
      return Promise.resolve();
    }
    return store.exportBackup().then(function (current) {
      fillBackupArea(current);
      return withWrite("import", function () {
        return store.importBackup(raw);
      }).catch(function () {});
    });
  }

  function onImportPasted() {
    var area = $("backup-json");
    var raw = area ? area.value : "";
    return importRaw(raw);
  }

  function onImportFile(ev) {
    var input = ev.target;
    var file = input.files && input.files[0];
    if (!file) {
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      importRaw(String(reader.result || "")).then(function () {
        input.value = "";
      });
    };
    reader.onerror = function () {
      Habitos.ui.setSaveState("error", "Não consegui ler o arquivo.");
      input.value = "";
    };
    reader.readAsText(file);
  }

  function refreshToday(forceRender) {
    var next = currentToday();
    var changed = next !== today;
    today = next;
    if (!weekStart || changed) {
      weekStart = Habitos.date.startOfWeek(today, store.getState().settings.weekStartsOn);
    }
    if (changed || forceRender) {
      render();
    }
  }

  function bindTodayRefresh() {
    function onResume() {
      refreshToday(true);
    }
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) {
        onResume();
      }
    });
    root.addEventListener("pageshow", onResume);
    root.addEventListener("focus", onResume);
  }

  function start() {
    var cap = Habitos.compat.capabilityError();
    if (cap) {
      Habitos.ui.showFatal(cap);
      return;
    }
    today = currentToday();
    store = Habitos.storage.create({ backend: "idb" });
    store
      .open()
      .then(function () {
        weekStart = Habitos.date.startOfWeek(today, store.getState().settings.weekStartsOn);
        Habitos.ui.setSaveState("saved", "Pronto");
        bindTodayRefresh();
        var tabs = document.querySelectorAll(".tabs button");
        var i;
        for (i = 0; i < tabs.length; i += 1) {
          tabs[i].addEventListener(
            "click",
            (function (name) {
              return function () {
                setTab(name);
              };
            })(tabs[i].getAttribute("data-tab"))
          );
        }
        setTab("hoje");
        return Habitos.offline.register(Habitos.model.APP_VERSION, {
          isWriting: isWriting,
          onUpdateReady: function () {
            updateBanner = true;
            Habitos.ui.setSaveState("saved", "Nova versão pronta. Reabra o app para carregar. Nada foi apagado.");
          }
        });
      })
      .then(function () {
        return Habitos.offline.offlineReady(Habitos.model.APP_VERSION);
      })
      .then(function (info) {
        var badge = $("offline-badge");
        if (badge && info.ready) {
          badge.hidden = false;
          badge.textContent = "Disponível offline";
        }
      })
      .catch(function (err) {
        Habitos.ui.showFatal(
          (err && err.message ? err.message : "Falha ao abrir o armazenamento.") +
            " Tente de novo no Safari, fora de aba privada."
        );
      });
  }

  root.Habitos = root.Habitos || {};
  root.Habitos.app = {
    start: start,
    isWriting: isWriting
  };

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", start);
    } else {
      start();
    }
  }
})(typeof window !== "undefined" ? window : (typeof global !== "undefined" ? global : this));
