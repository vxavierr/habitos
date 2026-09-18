(function (root) {
  "use strict";

  var ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
  var WEEKDAYS = [
    "domingo",
    "segunda-feira",
    "terça-feira",
    "quarta-feira",
    "quinta-feira",
    "sexta-feira",
    "sábado"
  ];
  var MONTHS = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro"
  ];
  var MONTHS_SHORT = [
    "jan",
    "fev",
    "mar",
    "abr",
    "mai",
    "jun",
    "jul",
    "ago",
    "set",
    "out",
    "nov",
    "dez"
  ];

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function localISODate(d) {
    var dt = d ? d : new Date();
    return dt.getFullYear() + "-" + pad(dt.getMonth() + 1) + "-" + pad(dt.getDate());
  }

  function parseISODate(s) {
    if (typeof s !== "string") {
      return null;
    }
    var m = ISO_RE.exec(s);
    if (!m) {
      return null;
    }
    var y = Number(m[1]);
    var mo = Number(m[2]);
    var da = Number(m[3]);
    var dt = new Date(y, mo - 1, da);
    if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== da) {
      return null;
    }
    return dt;
  }

  function isISODate(s) {
    return parseISODate(s) !== null;
  }

  function addDays(iso, n) {
    var dt = parseISODate(iso);
    if (!dt) {
      return null;
    }
    dt.setDate(dt.getDate() + n);
    return localISODate(dt);
  }

  function compareISO(a, b) {
    if (a === b) {
      return 0;
    }
    return a < b ? -1 : 1;
  }

  function weekday(iso) {
    var dt = parseISODate(iso);
    return dt ? dt.getDay() : null;
  }

  function startOfWeek(iso, weekStartsOn) {
    var start = weekStartsOn === 0 ? 0 : 1;
    var day = weekday(iso);
    if (day === null) {
      return null;
    }
    var diff = (day - start + 7) % 7;
    return addDays(iso, -diff);
  }

  function weekDates(weekStartISO) {
    var out = [];
    var i;
    for (i = 0; i < 7; i += 1) {
      out.push(addDays(weekStartISO, i));
    }
    return out;
  }

  function formatLong(iso) {
    var dt = parseISODate(iso);
    if (!dt) {
      return iso;
    }
    return WEEKDAYS[dt.getDay()] + ", " + dt.getDate() + " de " + MONTHS[dt.getMonth()];
  }

  function formatDayHead(iso) {
    var dt = parseISODate(iso);
    if (!dt) {
      return "";
    }
    return WEEKDAYS[dt.getDay()].slice(0, 3);
  }

  function formatWeekRange(weekStartISO) {
    var start = parseISODate(weekStartISO);
    var end = parseISODate(addDays(weekStartISO, 6));
    if (!start || !end) {
      return weekStartISO;
    }
    var a = start.getDate() + " " + MONTHS_SHORT[start.getMonth()];
    var b = end.getDate() + " " + MONTHS_SHORT[end.getMonth()] + " " + end.getFullYear();
    return a + " – " + b;
  }

  var api = {
    localISODate: localISODate,
    parseISODate: parseISODate,
    isISODate: isISODate,
    addDays: addDays,
    compareISO: compareISO,
    weekday: weekday,
    startOfWeek: startOfWeek,
    weekDates: weekDates,
    formatLong: formatLong,
    formatDayHead: formatDayHead,
    formatWeekRange: formatWeekRange
  };

  root.Habitos = root.Habitos || {};
  root.Habitos.date = api;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : (typeof global !== "undefined" ? global : this));
