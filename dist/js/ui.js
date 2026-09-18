(function (root) {
  "use strict";

  var date = (root.Habitos && root.Habitos.date) || (typeof require !== "undefined" ? require("./date.js") : null);
  var model = (root.Habitos && root.Habitos.model) || (typeof require !== "undefined" ? require("./model.js") : null);

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    if (text) {
      node.textContent = text;
    }
    return node;
  }

  function clear(node) {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  }

  function setSaveState(kind, message) {
    var node = document.getElementById("save-state");
    if (!node) {
      return;
    }
    node.className = "save-state is-" + kind;
    node.textContent = message || "";
  }

  function renderHoje(main, state, today, handlers) {
    clear(main);
    var list = model.activeHabits(state);
    if (list.length === 0) {
      var empty = el("div", "empty");
      empty.appendChild(el("p", "empty-title", "Nenhum hábito ainda"));
      empty.appendChild(
        el(
          "p",
          "empty-copy",
          "Comece vazio. Crie o primeiro, ou inclua exemplos opcionais — não são a sua lista pessoal."
        )
      );
      var createBtn = el("button", "btn btn-primary", "Criar hábito");
      createBtn.type = "button";
      createBtn.addEventListener("click", handlers.goCreate);
      empty.appendChild(createBtn);
      var examplesBtn = el("button", "btn btn-ghost", "Incluir 3 exemplos opcionais");
      examplesBtn.type = "button";
      examplesBtn.addEventListener("click", handlers.addExamples);
      empty.appendChild(examplesBtn);
      main.appendChild(empty);
      return;
    }
    var i;
    var habit;
    var row;
    var mark;
    var body;
    var done;
    for (i = 0; i < list.length; i += 1) {
      habit = list[i];
      done = !!model.findCheckin(state, habit.id, today);
      row = el("button", "habit" + (done ? " is-done" : ""));
      row.type = "button";
      row.setAttribute("data-habit-id", habit.id);
      row.setAttribute("aria-pressed", done ? "true" : "false");
      mark = el("span", "habit-mark");
      mark.setAttribute("aria-hidden", "true");
      body = el("span", "habit-body");
      body.appendChild(el("span", "habit-name", habit.name));
      body.appendChild(el("span", "habit-state", done ? "Feito" : "Ainda não"));
      row.appendChild(mark);
      row.appendChild(body);
      row.addEventListener(
        "click",
        (function (id) {
          return function () {
            handlers.toggle(id);
          };
        })(habit.id)
      );
      main.appendChild(row);
    }
  }

  function renderHistorico(main, state, today, weekStart, handlers) {
    clear(main);
    var days = date.weekDates(weekStart);
    var nav = el("div", "week-nav");
    var prev = el("button", "btn btn-ghost", "Semana anterior");
    prev.type = "button";
    prev.addEventListener("click", handlers.prevWeek);
    var next = el("button", "btn btn-ghost", "Semana seguinte");
    next.type = "button";
    var currentStart = date.startOfWeek(today, state.settings.weekStartsOn);
    if (weekStart >= currentStart) {
      next.disabled = true;
    }
    next.addEventListener("click", handlers.nextWeek);
    nav.appendChild(prev);
    nav.appendChild(next);
    main.appendChild(nav);
    main.appendChild(el("p", "week-label", date.formatWeekRange(weekStart)));

    var legend = el("p", "legend");
    legend.appendChild(el("span", "leg leg-done", "feito"));
    legend.appendChild(el("span", "leg leg-empty", "não registrado"));
    legend.appendChild(el("span", "leg leg-na", "não aplicável"));
    main.appendChild(legend);

    var head = el("div", "grid-head");
    head.appendChild(el("span", "grid-name-col", ""));
    var i;
    for (i = 0; i < days.length; i += 1) {
      head.appendChild(el("span", "grid-day", date.formatDayHead(days[i])));
    }
    main.appendChild(head);

    if (state.habits.length === 0) {
      main.appendChild(el("p", "muted", "Sem hábitos para mostrar."));
      return;
    }

    var h;
    var row;
    var cell;
    var kind;
    var checkin;
    var d;
    for (h = 0; h < state.habits.length; h += 1) {
      row = el("div", "grid-row" + (state.habits[h].archivedOn ? " is-archived" : ""));
      row.appendChild(el("span", "grid-name-col", state.habits[h].name));
      for (d = 0; d < days.length; d += 1) {
        checkin = model.findCheckin(state, state.habits[h].id, days[d]);
        kind = model.cellState(state.habits[h], days[d], checkin, today);
        cell = el("span", "grid-cell is-" + kind);
        if (kind === "done") {
          cell.textContent = "OK";
        } else if (kind === "empty") {
          cell.textContent = "·";
        } else {
          cell.textContent = "—";
        }
        cell.setAttribute("title", days[d] + " · " + model.cellLabel(kind));
        cell.setAttribute("aria-label", days[d] + " " + model.cellLabel(kind));
        row.appendChild(cell);
      }
      main.appendChild(row);
    }
  }

  function renderAjustes(main, state, diag, handlers) {
    clear(main);

    var create = el("section", "panel");
    create.appendChild(el("h2", null, "Novo hábito"));
    var form = el("form", "create-form");
    var input = el("input", "text-input");
    input.type = "text";
    input.id = "habit-name";
    input.maxLength = 80;
    input.placeholder = "Nome do hábito";
    input.setAttribute("aria-label", "Nome do hábito");
    var submit = el("button", "btn btn-primary", "Adicionar");
    submit.type = "submit";
    form.appendChild(input);
    form.appendChild(submit);
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      handlers.create(input.value);
    });
    create.appendChild(form);
    main.appendChild(create);

    var listSec = el("section", "panel");
    listSec.appendChild(el("h2", null, "Hábitos"));
    if (state.habits.length === 0) {
      listSec.appendChild(el("p", "muted", "Lista vazia. Nada foi inventado no seu lugar."));
    } else {
      var i;
      var habit;
      var row;
      var rename;
      var archive;
      for (i = 0; i < state.habits.length; i += 1) {
        habit = state.habits[i];
        row = el("div", "habit-edit" + (habit.archivedOn ? " is-archived" : ""));
        row.appendChild(el("p", "habit-edit-name", habit.name + (habit.archivedOn ? " (arquivado)" : "")));
        if (!habit.archivedOn) {
          rename = el("button", "btn btn-ghost", "Renomear");
          rename.type = "button";
          rename.addEventListener(
            "click",
            (function (id, current) {
              return function () {
                var next = window.prompt("Novo nome", current);
                if (next !== null) {
                  handlers.rename(id, next);
                }
              };
            })(habit.id, habit.name)
          );
          archive = el("button", "btn btn-ghost", "Arquivar");
          archive.type = "button";
          archive.addEventListener(
            "click",
            (function (id, current) {
              return function () {
                if (window.confirm("Arquivar \"" + current + "\"? O histórico permanece.")) {
                  handlers.archive(id);
                }
              };
            })(habit.id, habit.name)
          );
          row.appendChild(rename);
          row.appendChild(archive);
        }
        listSec.appendChild(row);
      }
    }
    main.appendChild(listSec);

    var backup = el("section", "panel");
    backup.appendChild(el("h2", null, "Backup"));
    backup.appendChild(
      el(
        "p",
        "muted",
        "O armazenamento deste site pode ser apagado pelo Safari. Guarde uma cópia fora daqui."
      )
    );
    var exp = el("button", "btn btn-primary", "Mostrar JSON para copiar");
    exp.type = "button";
    exp.addEventListener("click", handlers.exportJson);
    backup.appendChild(exp);
    var fileBtn = el("button", "btn btn-ghost", "Baixar arquivo (se o Safari deixar)");
    fileBtn.type = "button";
    fileBtn.addEventListener("click", handlers.downloadFile);
    backup.appendChild(fileBtn);
    backup.appendChild(el("p", "muted", "Importar substitui tudo. Confirme e, se quiser, copie o backup atual antes."));
    var area = el("textarea", "json-area");
    area.id = "backup-json";
    area.setAttribute("aria-label", "JSON de backup");
    area.spellcheck = false;
    backup.appendChild(area);
    var imp = el("button", "btn btn-primary", "Importar JSON colado");
    imp.type = "button";
    imp.addEventListener("click", handlers.importPasted);
    backup.appendChild(imp);
    var fileLabel = el("label", "file-label", "Importar arquivo");
    var file = document.createElement("input");
    file.type = "file";
    file.accept = "application/json,.json,.txt";
    file.addEventListener("change", handlers.importFile);
    fileLabel.appendChild(file);
    backup.appendChild(fileLabel);
    main.appendChild(backup);

    var week = el("section", "panel");
    week.appendChild(el("h2", null, "Semana"));
    var weekForm = el("div", "week-start");
    var mon = el("button", "btn " + (state.settings.weekStartsOn === 1 ? "btn-primary" : "btn-ghost"), "Começa na segunda");
    mon.type = "button";
    mon.addEventListener("click", function () {
      handlers.setWeekStart(1);
    });
    var sun = el("button", "btn " + (state.settings.weekStartsOn === 0 ? "btn-primary" : "btn-ghost"), "Começa no domingo");
    sun.type = "button";
    sun.addEventListener("click", function () {
      handlers.setWeekStart(0);
    });
    weekForm.appendChild(mon);
    weekForm.appendChild(sun);
    week.appendChild(weekForm);
    main.appendChild(week);

    var info = el("section", "panel");
    info.appendChild(el("h2", null, "Sobre"));
    info.appendChild(el("p", null, "Versão " + model.APP_VERSION));
    info.appendChild(
      el(
        "p",
        "muted",
        "O dia segue o relógio deste aparelho. Confira data, hora e fuso em Ajustes do iOS."
      )
    );
    main.appendChild(info);

    var dsec = el("section", "panel");
    dsec.appendChild(el("h2", null, "Diagnóstico"));
    var pre = el("pre", "diag");
    pre.textContent = diag || "Coletando…";
    dsec.appendChild(pre);
    main.appendChild(dsec);
  }

  function showFatal(message) {
    var box = document.getElementById("fatal");
    var app = document.getElementById("app");
    if (app) {
      app.hidden = true;
    }
    if (box) {
      box.hidden = false;
      clear(box);
      box.appendChild(el("h1", null, "Não foi possível abrir Hábitos"));
      box.appendChild(el("p", null, message));
    }
  }

  var api = {
    el: el,
    clear: clear,
    setSaveState: setSaveState,
    renderHoje: renderHoje,
    renderHistorico: renderHistorico,
    renderAjustes: renderAjustes,
    showFatal: showFatal
  };

  root.Habitos = root.Habitos || {};
  root.Habitos.ui = api;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : (typeof global !== "undefined" ? global : this));
