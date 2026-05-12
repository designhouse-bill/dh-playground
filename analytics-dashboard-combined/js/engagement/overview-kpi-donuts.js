/* ============================================================
   overview-kpi-donuts.js — Phase 5a (UX-846, 2026-05-04)
   Renders 4 donut charts in the Overview 2×2 KPI grid on
   engagement-report.html. Each cell breaks down its KPI by
   semantically meaningful segments. Center stat is provided
   inline by the HTML; donut shows distribution behind it.
   ============================================================ */
(function () {
  if (typeof echarts === 'undefined') return;

  function cssVar(name, fallback) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  }

  function shade(hex, alpha) {
    if (!hex || hex[0] !== '#' || hex.length !== 7) return hex;
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  function paletteFor(kpi) {
    var base;
    switch (kpi) {
      case 'sessions':   base = cssVar('--section-sessions',   '#2563eb'); break;
      case 'users':      base = cssVar('--section-users',      '#0891b2'); break;
      case 'duration':   base = cssVar('--section-duration',   '#d97706'); break;
      case 'cardevents': base = cssVar('--section-cardevents', '#7c3aed'); break;
      default:           base = '#2196F3';
    }
    return [base, shade(base, 0.66), shade(base, 0.4), shade(base, 0.22)];
  }

  var DATA = {
    sessions: [
      { name: 'New',              value: 31420 },
      { name: 'Returning',        value: 28910 },
      { name: 'Engaged',          value: 18212 }
    ],
    users: [
      { name: 'New',       value: 22640 },
      { name: 'Returning', value: 19825 },
      { name: 'Engaged',   value: 11546 }
    ],
    duration: [
      { name: '< 1 min',  value: 18 },
      { name: '1–5 min',  value: 42 },
      { name: '5–10 min', value: 27 },
      { name: '10+ min',  value: 13 }
    ],
    cardevents: [
      { name: 'Adds',          value: 96420 },
      { name: 'Clicks',        value: 138750 },
      { name: 'Share/Save/Print', value: 36128 }
    ]
  };

  function fmtNum(n) { return n.toLocaleString(); }
  function fmtMinSec(s) { var m = Math.floor(s / 60); var r = Math.round(s % 60); return m + 'm ' + (r < 10 ? '0' + r : r) + 's'; }

  // Cohort values for Overview mini-additivity rows. Pills are ordered --n, --r, --e.
  // duration values are seconds (cohort-mean). Hero is weighted across cohorts.
  var COHORT_VALUES = {
    users:      { fmt: fmtNum,    vals: [22640, 19825, 11546] },
    duration:   { fmt: fmtMinSec, vals: [252, 365, 524] },
    cardevents: { fmt: fmtNum,    vals: [138750, 96420, 36128] }
  };

  function renderAdditivity(kpi) {
    var entry = COHORT_VALUES[kpi];
    if (!entry) return;
    var card = document.querySelector('.ep-kpi-card[data-kpi="' + kpi + '"]');
    if (!card) return;
    var pills = card.querySelectorAll('.ep-additivity__pill');
    pills.forEach(function (p, i) {
      if (i >= entry.vals.length) return;
      var label = p.textContent.trim();
      p.innerHTML = label + ' <span class="ep-additivity__pill-val">' + entry.fmt(entry.vals[i]) + '</span>';
    });
  }

  function renderLegend(kpi, items, colors) {
    var ul = document.getElementById('ep-kpi-legend-' + kpi);
    if (!ul) return;
    ul.innerHTML = items.map(function (it, i) {
      return '<li><span class="swatch" style="background:' + colors[i] + '"></span>' +
             it.name + '</li>';
    }).join('');
  }

  function renderDonut(kpi) {
    var el = document.getElementById('ep-kpi-donut-' + kpi);
    if (!el) return;
    var existing = echarts.getInstanceByDom(el);
    if (existing) existing.dispose();

    var chart = echarts.init(el);
    var colors = paletteFor(kpi);
    var data = DATA[kpi].map(function (d, i) {
      return { name: d.name, value: d.value, itemStyle: { color: colors[i] } };
    });

    chart.setOption({
      tooltip: {
        trigger: 'item',
        backgroundColor: '#ffffff',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: { color: '#0f172a', fontFamily: 'inherit', fontSize: 12 },
        formatter: function (p) {
          var unit = (kpi === 'duration') ? '%' : '';
          return p.name + ': ' + p.value.toLocaleString() + unit +
                 ' (' + p.percent + '%)';
        }
      },
      series: [{
        name: kpi,
        type: 'pie',
        radius: ['62%', '86%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        label: { show: false },
        labelLine: { show: false },
        emphasis: {
          itemStyle: { shadowBlur: 8, shadowColor: 'rgba(0,0,0,0.12)' }
        },
        data: data
      }]
    });

    renderLegend(kpi, DATA[kpi], colors);

    if (window.ResizeObserver) {
      new ResizeObserver(function () { chart.resize(); }).observe(el);
    }
  }

  function renderAll() {
    ['sessions', 'users', 'duration', 'cardevents'].forEach(function (kpi) {
      renderDonut(kpi);
      renderAdditivity(kpi);
    });
  }

  function wireJumps() {
    document.querySelectorAll('.ep-kpi-card[data-jump-to]').forEach(function (card) {
      card.addEventListener('click', function () {
        var target = card.getAttribute('data-jump-to');
        // Page-aware: if a same-doc pane exists, activate the perf-tab (inline-pane page,
        // e.g. Categories). Otherwise navigate to the sibling sub-page (Circulars model).
        var inlinePane = document.querySelector('[data-ep-pane="' + target + '"]');
        if (inlinePane) {
          var tab = document.querySelector('.perf-tab[data-ep-tab="' + target + '"]');
          if (tab) {
            tab.click();
            var bar = document.getElementById('ep-perf-tabs');
            if (bar && bar.scrollIntoView) bar.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          return;
        }
        // R2 (2026-05-06): sub-pages dropped; deep-link via ?tab=X.
        if (['sessions','users','duration','cardevents'].indexOf(target) !== -1) {
          window.location.href = 'engagement-report.html?tab=' + target;
        }
      });
    });
  }

  function init() {
    if (!document.querySelector('.ep-kpi-grid')) return;
    renderAll();
    wireJumps();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
