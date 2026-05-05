/**
 * canonical-shell-renderers.js — UX-846 Phase 5e
 *
 * Shared sub-pane renderers for the canonical Engagement shell.
 * Source-extracted (zero-drift) from engagement-promotions.html
 * inline factories so bare engagement pages (categories / circulars / grid)
 * render the same By Store / By Day / Time Trend visuals.
 *
 * Public API (window.CanonicalShellRenderers):
 *   - renderStackedList(hostId, rows, segDefs, totalFmt)
 *   - renderDoWColumns(hostId, days, opts)
 *   - renderTrend(hostId, weeks, vals, opts)
 *   - wireTrendRanges()                              — wires .ep-trend-range buttons
 *   - renderDefaultPlaceholders()                    — populates all 4 metrics' panes
 *
 * Pages call renderDefaultPlaceholders() + wireTrendRanges() after DOMContentLoaded.
 */
(function () {
  'use strict';

  var perfTooltip = null;
  function ensurePerfTooltip(opts) {
    if (!perfTooltip) {
      perfTooltip = document.createElement('div');
      perfTooltip.className = 'ep-perf-tooltip';
      document.body.appendChild(perfTooltip);
    }
    if (opts && opts.tooltip === 'dark') perfTooltip.classList.add('ep-perf-tooltip--dark');
    else perfTooltip.classList.remove('ep-perf-tooltip--dark');
    return perfTooltip;
  }

  function formatMinSec(seconds) {
    var s = Math.max(0, Math.round(+seconds || 0));
    var m = Math.floor(s / 60);
    var r = s % 60;
    return m + 'm ' + r + 's';
  }
  function positionPerfTooltip(e) {
    ensurePerfTooltip();
    var x = e.clientX + 14, y = e.clientY + 14;
    var tw = perfTooltip.offsetWidth, th = perfTooltip.offsetHeight;
    var vw = window.innerWidth, vh = window.innerHeight;
    perfTooltip.style.left = (x + tw > vw ? e.clientX - tw - 14 : x) + 'px';
    perfTooltip.style.top  = (y + th > vh ? e.clientY - th - 14 : y) + 'px';
  }

  window.epMetrics = window.epMetrics || {};

  function renderStackedList(hostId, rows, segDefs, totalFmt) {
    var host = document.getElementById(hostId);
    if (!host) return;
    window.epMetrics[hostId] = { rows: rows, segDefs: segDefs, totalFmt: totalFmt };
    var totals = rows.map(function (r) { return segDefs.reduce(function (s, d) { return s + (r[d.key] || 0); }, 0); });
    var max = Math.max.apply(null, totals);
    host.innerHTML = rows.map(function (r, i) {
      var total = totals[i];
      var w = function (n) { return (n / max * 100).toFixed(1) + '%'; };
      var segs = segDefs.map(function (d) {
        return '<div class="ep-stacked-list__seg ep-stacked-list__seg--' + d.cls + '" style="width:' + w(r[d.key]) + '" title="' + d.label + ': ' + (r[d.key] || 0).toLocaleString() + '"></div>';
      }).join('');
      return ''
        + '<div class="ep-stacked-list__row">'
        +   '<div class="ep-stacked-list__rank">' + r.rank + '</div>'
        +   '<div class="ep-stacked-list__name">' + r.name + (r.sub ? '<small>' + r.sub + '</small>' : '') + '</div>'
        +   '<div class="ep-stacked-list__bar">' + segs + '</div>'
        +   '<div class="ep-stacked-list__total">' + (totalFmt ? totalFmt(total) : total.toLocaleString()) + '</div>'
        + '</div>';
    }).join('');
  }

  var DOW_FULL = { MON:'Monday', TUE:'Tuesday', WED:'Wednesday', THU:'Thursday', FRI:'Friday', SAT:'Saturday', SUN:'Sunday' };
  function dowDayDates() {
    var weekLabel = 'W47';
    if (typeof window.DashboardCore !== 'undefined' && window.DashboardCore.getState) {
      var st = window.DashboardCore.getState();
      if (st && st.selectedWeekId) weekLabel = st.selectedWeekId;
    }
    var m = weekLabel.match(/W(\d+)/);
    var w = m ? parseInt(m[1]) : 47;
    var anchor = new Date(2025, 10, 17);
    var start = new Date(anchor);
    start.setDate(anchor.getDate() + (w - 47) * 7);
    var mo = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return Array.from({ length: 7 }, function (_, i) {
      var d = new Date(start);
      d.setDate(start.getDate() + i);
      return mo[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
    });
  }

  function renderDoWColumns(hostId, days, opts) {
    var host = document.getElementById(hostId);
    if (!host) return;
    if (typeof opts === 'function') opts = { fmt: opts };
    opts = opts || {};
    var fmt = opts.fmt;
    var label = opts.label || '';
    var max = Math.max.apply(null, days.map(function (d) { return d.n; }));
    var total = days.reduce(function (s, d) { return s + d.n; }, 0);
    var avg = total / days.length;
    var dates = dowDayDates();
    host.innerHTML = '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:12px;align-items:end;height:240px;">'
      + days.map(function (d, i) {
          var h = (d.n / max * 100).toFixed(1) + '%';
          var peak = d.n === max;
          return '<div class="ep-dow-col" data-dow-idx="' + i + '" style="display:flex;flex-direction:column;align-items:center;gap:6px;height:100%;justify-content:flex-end;cursor:default;">'
            + '<div style="font-size:12px;font-weight:700;">' + (fmt ? fmt(d.n) : d.n.toLocaleString()) + '</div>'
            + '<div class="dow-bar' + (peak ? ' dow-bar--peak' : '') + '" style="height:' + h + ';"></div>'
            + '<div style="font-size:11px;font-weight:600;color:#6b7280;">' + d.d + '</div>'
            + '</div>';
        }).join('')
      + '</div>';
    host.querySelectorAll('.ep-dow-col').forEach(function (col) {
      var i = parseInt(col.dataset.dowIdx);
      var d = days[i];
      col.addEventListener('mouseenter', function () {
        var tip = ensurePerfTooltip(opts);
        var fullDay = DOW_FULL[d.d] || d.d;
        var dateStr = dates[i] || '';
        var valStr = fmt ? fmt(d.n) : d.n.toLocaleString();
        var sharePct = total > 0 ? (d.n / total * 100).toFixed(1) + '%' : '';
        var vsAvg = avg > 0 ? ((d.n - avg) / avg * 100) : 0;
        var vsAvgStr = (vsAvg >= 0 ? '+' : '') + vsAvg.toFixed(1) + '% vs daily avg';
        tip.innerHTML = '<div class="ep-perf-tooltip__title">' + fullDay + '</div>'
          + '<div style="color:rgba(255,255,255,0.5);font-size:11px;margin-bottom:6px;margin-top:-4px;">' + dateStr + '</div>'
          + (label ? '<div style="color:rgba(255,255,255,0.7);font-size:11px;">' + label + '</div>' : '')
          + '<div style="color:#fff;font-size:15px;font-weight:700;padding-top:2px;">' + valStr + '</div>'
          + '<div style="color:rgba(255,255,255,0.6);font-size:11px;margin-top:4px;">' + sharePct + ' of week · ' + vsAvgStr + '</div>';
        tip.classList.add('ep-perf-tooltip--visible');
      });
      col.addEventListener('mousemove', positionPerfTooltip);
      col.addEventListener('mouseleave', function () {
        ensurePerfTooltip().classList.remove('ep-perf-tooltip--visible');
      });
    });
  }

  function weekDateRange(weekLabel) {
    var m = weekLabel.match(/W(\d+)/);
    if (!m) return '';
    var w = parseInt(m[1]);
    var anchor = new Date(2025, 10, 17);
    var start = new Date(anchor);
    start.setDate(anchor.getDate() + (w - 47) * 7);
    var end = new Date(start);
    end.setDate(start.getDate() + 6);
    var mo = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return mo[start.getMonth()] + ' ' + start.getDate() + ' – ' + mo[end.getMonth()] + ' ' + end.getDate() + ', ' + end.getFullYear();
  }

  function sectionColor(host) {
    var c = '';
    try { c = (getComputedStyle(host).getPropertyValue('--section-color') || '').trim(); } catch (_) {}
    return c || '#2196F3';
  }

  function renderTrend(hostId, weeks, vals, opts) {
    var host = document.getElementById(hostId);
    if (!host) return;
    opts = opts || {};
    var accent = sectionColor(host);
    var W = 880, H = 280, pad = 40;
    var yMax = opts.yMax || Math.ceil(Math.max.apply(null, vals) * 1.15);
    var ySteps = opts.ySteps || 5;
    var fmt = opts.yFmt || function (v) { return v; };
    var xs = vals.map(function (_, i) { return pad + i * ((W - pad * 2) / (vals.length - 1)); });
    var ys = vals.map(function (v) { return H - pad - (v / yMax) * (H - pad * 2); });
    var baseY = H - pad;
    var linePath = xs.map(function (x, i) { return (i ? 'L' : 'M') + x + ',' + ys[i]; }).join(' ');
    var areaPath = linePath + ' L' + xs[xs.length - 1] + ',' + baseY + ' L' + xs[0] + ',' + baseY + ' Z';
    var gradId = hostId + '-grad';
    var gridLines = [];
    for (var i = 0; i <= ySteps; i++) {
      var g = (yMax / ySteps) * i;
      var y = H - pad - (g / yMax) * (H - pad * 2);
      gridLines.push('<line x1="' + pad + '" x2="' + (W - pad) + '" y1="' + y + '" y2="' + y + '" stroke="#e5e7eb"/>'
        + '<text x="' + (pad - 8) + '" y="' + (y + 4) + '" font-size="10" fill="#6b7280" text-anchor="end">' + fmt(g) + '</text>');
    }
    var labelStep = vals.length > 26 ? 4 : vals.length > 8 ? 2 : 1;
    var labels = weeks.map(function (w, i) {
      var show = i % labelStep === 0 || i === weeks.length - 1;
      return show ? '<text x="' + xs[i] + '" y="' + (H - 12) + '" font-size="10" fill="#6b7280" text-anchor="middle">' + w + '</text>' : '';
    }).join('');
    var dots = xs.map(function (x, i) {
      return '<circle class="ep-trend-dot" cx="' + x + '" cy="' + ys[i] + '" r="4" fill="#fff" stroke="' + accent + '" stroke-width="2" data-week="' + weeks[i] + '" data-val="' + vals[i] + '" style="cursor:crosshair;"/>'
        + '<circle class="ep-trend-hit" cx="' + x + '" cy="' + ys[i] + '" r="12" fill="transparent" stroke="none" data-week="' + weeks[i] + '" data-val="' + vals[i] + '" style="cursor:crosshair;"/>';
    }).join('');
    host.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;height:auto;display:block;">'
      + '<defs><linearGradient id="' + gradId + '" x1="0" y1="0" x2="0" y2="1">'
      +   '<stop offset="0%" stop-color="' + accent + '" stop-opacity="0.18"/>'
      +   '<stop offset="100%" stop-color="' + accent + '" stop-opacity="0"/>'
      + '</linearGradient></defs>'
      + gridLines.join('')
      + '<path d="' + areaPath + '" fill="url(#' + gradId + ')" stroke="none"/>'
      + '<path d="' + linePath + '" fill="none" stroke="' + accent + '" stroke-width="2"/>'
      + dots
      + labels
      + '</svg>'
      + (opts.note ? '<div style="font-size:11px;color:#6b7280;margin-top:8px;">' + opts.note + '</div>' : '');

    host.querySelectorAll('.ep-trend-hit, .ep-trend-dot').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        var tip = ensurePerfTooltip(opts);
        var wNum = (el.dataset.week || '').replace('W', '');
        var dateRange = weekDateRange(el.dataset.week);
        tip.innerHTML = '<div class="ep-perf-tooltip__title">Week ' + wNum + '</div>'
          + (dateRange ? '<div style="color:rgba(255,255,255,0.5);font-size:11px;margin-bottom:6px;margin-top:-4px;">' + dateRange + '</div>' : '')
          + '<div style="color:#fff;font-size:15px;font-weight:700;padding-top:2px;">' + fmt(+el.dataset.val) + '</div>';
        tip.classList.add('ep-perf-tooltip--visible');
        var dot = host.querySelector('.ep-trend-dot[data-week="' + el.dataset.week + '"]');
        if (dot) { dot.setAttribute('r', '6'); dot.setAttribute('fill', accent); }
      });
      el.addEventListener('mousemove', positionPerfTooltip);
      el.addEventListener('mouseleave', function () {
        ensurePerfTooltip().classList.remove('ep-perf-tooltip--visible');
        var dot = host.querySelector('.ep-trend-dot[data-week="' + el.dataset.week + '"]');
        if (dot) { dot.setAttribute('r', '4'); dot.setAttribute('fill', '#fff'); }
      });
    });
  }

  // ─── Default placeholder data (mirrors proposed-max for zero-drift) ────────
  var W52 = ['W01','W02','W03','W04','W05','W06','W07','W08','W09','W10','W11','W12','W13',
             'W14','W15','W16','W17','W18','W19','W20','W21','W22','W23','W24','W25','W26',
             'W27','W28','W29','W30','W31','W32','W33','W34','W35','W36','W37','W38','W39',
             'W40','W41','W42','W43','W44','W45','W46','W47','W48','W49','W50','W51','W52'];
  var W13 = W52.slice(-13);

  var trendFull = {
    'ep-sessions-trend': {
      weeks: W52,
      vals: [18,17,17,18,18,19,20,20,21,20,20,19,18,
             19,20,21,21,22,22,23,22,21,20,20,21,21,
             20,20,21,22,22,22,22,23,22,22,21,22,22,
             22,21,22,22,21,22,22,22,22, 8, 7, 7, 7],
      opts: { yMax:25, ySteps:5, yFmt: function (v) { return v.toFixed(0)+'%'; }, note:'Among visitors attributed to paid media (placeholder — real BQ feed per IN-33).' }
    },
    'ep-users-trend': {
      weeks: W52,
      vals: [14,14,14,15,15,15,16,16,16,15,15,15,14,
             15,15,16,16,17,17,17,17,16,16,16,16,16,
             15,15,16,16,17,17,17,18,17,17,16,17,17,
             16,17,18,18,17,18,18,18,17, 7, 6, 6, 6],
      opts: { yMax:25, ySteps:5, yFmt: function (v) { return v.toFixed(0)+'%'; }, note:'Unique users per week (% of cohort). Real BQ user-dimension feed per IN-33.' }
    },
    'ep-duration-trend': {
      weeks: W52,
      vals: [350,345,352,358,360,355,360,358,362,368,372,375,378,
             375,380,382,380,378,375,376,378,380,380,378,382,380,
             382,380,378,380,382,384,386,385,382,380,382,380,382,
             380,380,370,372,370,370,365,368,360,350,360,365,360],
      opts: { yMax:450, ySteps:5, yFmt: function (v) { return v.toFixed(0)+'s'; }, note:'Avg session duration (seconds) per week. From GA → BQ session-duration field.' }
    },
    'ep-cardevents-trend': {
      weeks: W52,
      vals: [22,22,22,23,23,24,24,24,24,23,23,23,23,
             23,24,24,25,25,25,26,25,25,24,24,25,25,
             25,25,26,26,26,27,27,27,27,26,26,27,27,
             28,28,28,28,28,27,27,27,27,12,11,11,11],
      opts: { yMax:35, ySteps:5, yFmt: function (v) { return v.toFixed(0)+'%'; }, note:'Card events per week (% of cohort). Adds + Clicks + share/save/print roll-up.' }
    }
  };

  function renderDefaultPlaceholders() {
    // Sessions
    renderStackedList('ep-sessions-by-store', [
      { rank: 1, name: '#336 Hollywood, FL',     sub: '31% new', v: 180, c: 130, a: 116 },
      { rank: 2, name: '#508 Fort Myers, FL',    sub: '27% new', v: 165, c: 125, a: 108 },
      { rank: 3, name: '#195 Jacksonville, FL',  sub: '28% new', v: 158, c: 122, a: 104 },
      { rank: 4, name: '#2415 Tampa, FL',        sub: '33% new', v: 152, c: 118, a:  93 },
      { rank: 5, name: '#2487 Sarasota, FL',     sub: '34% new', v: 148, c: 115, a:  92 },
      { rank: 6, name: '#2288 Orlando, FL',      sub: '36% new', v: 142, c: 110, a:  92 },
      { rank: 7, name: '#2247 Palm Coast, FL',   sub: '29% new', v: 135, c: 108, a:  91 },
      { rank: 8, name: '#2545 The Villages, FL', sub: '34% new', v: 132, c: 105, a:  92 },
      { rank: 9, name: '#319 Homestead, FL',     sub: '30% new', v: 130, c: 102, a:  92 }
    ], [
      { key: 'v', cls: 'v', label: 'Sessions' },
      { key: 'c', cls: 'c', label: 'Returning' },
      { key: 'a', cls: 'a', label: 'Engaged' }
    ]);
    renderDoWColumns('ep-sessions-by-day', [
      { d: 'MON', n: 9420 },  { d: 'TUE', n: 10120 }, { d: 'WED', n: 10880 },
      { d: 'THU', n: 11540 }, { d: 'FRI', n: 13260 }, { d: 'SAT', n: 12940 }, { d: 'SUN', n: 10382 }
    ], { label: 'Sessions' });
    renderTrend('ep-sessions-trend', W13,
      [22,21,22,22,21,22,22,22,22,8,7,7,7],
      trendFull['ep-sessions-trend'].opts
    );

    // Total Users
    renderStackedList('ep-users-by-store', [
      { rank: 1, name: '#336 Hollywood, FL',     sub: '31% new', new: 1280, ret: 920, eng: 540 },
      { rank: 2, name: '#508 Fort Myers, FL',    sub: '27% new', new: 1180, ret: 880, eng: 510 },
      { rank: 3, name: '#195 Jacksonville, FL',  sub: '28% new', new: 1140, ret: 850, eng: 490 },
      { rank: 4, name: '#2415 Tampa, FL',        sub: '33% new', new: 1090, ret: 820, eng: 460 },
      { rank: 5, name: '#2487 Sarasota, FL',     sub: '34% new', new: 1050, ret: 800, eng: 450 },
      { rank: 6, name: '#2288 Orlando, FL',      sub: '36% new', new: 1010, ret: 780, eng: 440 },
      { rank: 7, name: '#2247 Palm Coast, FL',   sub: '29% new', new:  980, ret: 770, eng: 430 },
      { rank: 8, name: '#2545 The Villages, FL', sub: '34% new', new:  960, ret: 750, eng: 420 },
      { rank: 9, name: '#319 Homestead, FL',     sub: '30% new', new:  940, ret: 730, eng: 410 }
    ], [
      { key: 'new', cls: 'v', label: 'New' },
      { key: 'ret', cls: 'c', label: 'Returning' },
      { key: 'eng', cls: 'a', label: 'Engaged' }
    ]);
    renderDoWColumns('ep-users-by-day', [
      { d: 'MON', n: 6500 }, { d: 'TUE', n: 7000 }, { d: 'WED', n: 7500 },
      { d: 'THU', n: 8000 }, { d: 'FRI', n: 9100 }, { d: 'SAT', n: 8900 }, { d: 'SUN', n: 7011 }
    ], { label: 'Total Users' });
    renderTrend('ep-users-trend', W13,
      [16,17,18,18,17,18,18,18,17,7,6,6,6],
      trendFull['ep-users-trend'].opts
    );

    // Avg Session Duration — N/R/E spell-out, Min/Sec format
    renderStackedList('ep-duration-by-store', [
      { rank: 1, name: '#336 Hollywood, FL',     sub: '4m 32s avg', n: 180, r: 240, e: 412 },
      { rank: 2, name: '#508 Fort Myers, FL',    sub: '4m 18s avg', n: 172, r: 230, e: 398 },
      { rank: 3, name: '#195 Jacksonville, FL',  sub: '4m 04s avg', n: 168, r: 222, e: 384 },
      { rank: 4, name: '#2415 Tampa, FL',        sub: '3m 52s avg', n: 158, r: 215, e: 372 },
      { rank: 5, name: '#2487 Sarasota, FL',     sub: '3m 45s avg', n: 152, r: 210, e: 365 },
      { rank: 6, name: '#2288 Orlando, FL',      sub: '3m 38s avg', n: 148, r: 205, e: 358 },
      { rank: 7, name: '#2247 Palm Coast, FL',   sub: '3m 28s avg', n: 142, r: 198, e: 348 },
      { rank: 8, name: '#2545 The Villages, FL', sub: '3m 22s avg', n: 138, r: 192, e: 342 },
      { rank: 9, name: '#319 Homestead, FL',     sub: '3m 12s avg', n: 132, r: 184, e: 332 }
    ], [
      { key: 'n', cls: 'v', label: 'New (avg)' },
      { key: 'r', cls: 'c', label: 'Returning (avg)' },
      { key: 'e', cls: 'a', label: 'Engaged (avg)' }
    ], formatMinSec);
    renderDoWColumns('ep-duration-by-day', [
      { d: 'MON', n: 320 }, { d: 'TUE', n: 340 }, { d: 'WED', n: 355 },
      { d: 'THU', n: 372 }, { d: 'FRI', n: 410 }, { d: 'SAT', n: 405 }, { d: 'SUN', n: 350 }
    ], { label: 'Avg Session Duration', fmt: formatMinSec, tooltip: 'dark' });
    var durationOpts = Object.assign({}, trendFull['ep-duration-trend'].opts, { yFmt: formatMinSec, tooltip: 'dark' });
    renderTrend('ep-duration-trend', W13,
      [380,380,370,372,370,370,365,368,360,350,360,365,360],
      durationOpts
    );
    var heroEl = document.getElementById('ep-duration-hero-value');
    if (heroEl) heroEl.textContent = formatMinSec(372);

    // Card Engagement Events
    renderStackedList('ep-cardevents-by-store', [
      { rank: 1, name: '#336 Hollywood, FL',     sub: '14,210 total', adds: 4800, clicks: 6800, other: 2610 },
      { rank: 2, name: '#508 Fort Myers, FL',    sub: '13,580 total', adds: 4500, clicks: 6500, other: 2580 },
      { rank: 3, name: '#195 Jacksonville, FL',  sub: '13,120 total', adds: 4350, clicks: 6300, other: 2470 },
      { rank: 4, name: '#2415 Tampa, FL',        sub: '12,640 total', adds: 4200, clicks: 6100, other: 2340 },
      { rank: 5, name: '#2487 Sarasota, FL',     sub: '12,210 total', adds: 4050, clicks: 5900, other: 2260 },
      { rank: 6, name: '#2288 Orlando, FL',      sub: '11,820 total', adds: 3900, clicks: 5700, other: 2220 },
      { rank: 7, name: '#2247 Palm Coast, FL',   sub: '11,440 total', adds: 3800, clicks: 5500, other: 2140 },
      { rank: 8, name: '#2545 The Villages, FL', sub: '11,090 total', adds: 3700, clicks: 5350, other: 2040 },
      { rank: 9, name: '#319 Homestead, FL',     sub: '10,720 total', adds: 3580, clicks: 5180, other: 1960 }
    ], [
      { key: 'adds',   cls: 'a', label: 'Add to List' },
      { key: 'clicks', cls: 'c', label: 'Card Click' },
      { key: 'other',  cls: 'v', label: 'Card View / Share' }
    ]);
    renderDoWColumns('ep-cardevents-by-day', [
      { d: 'MON', n: 32500 }, { d: 'TUE', n: 35000 }, { d: 'WED', n: 37500 },
      { d: 'THU', n: 40000 }, { d: 'FRI', n: 45800 }, { d: 'SAT', n: 44500 }, { d: 'SUN', n: 35998 }
    ], { label: 'Card Engagement Events' });
    renderTrend('ep-cardevents-trend', W13,
      [28,28,28,28,28,27,27,27,27,12,11,11,11],
      trendFull['ep-cardevents-trend'].opts
    );
  }

  function wireTrendRanges() {
    var rangeCounts = { '1w': 1, '4w': 4, '13w': 13, '1y': 52 };
    document.querySelectorAll('.ep-trend-range').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var strip = btn.closest('.ep-trend-ranges');
        strip.querySelectorAll('.ep-trend-range').forEach(function (b) { b.classList.remove('ep-trend-range--active'); });
        btn.classList.add('ep-trend-range--active');

        var pane = btn.closest('.ep-sub-pane');
        var host = pane && pane.querySelector('[id$="-trend"]');
        if (!host) return;
        var full = trendFull[host.id];
        if (!full) return;

        var n = rangeCounts[btn.dataset.range] || 13;
        var weeks = full.weeks.slice(-n);
        var vals  = full.vals.slice(-n);
        renderTrend(host.id,
          weeks.length < 2 ? [weeks[0], weeks[0]] : weeks,
          vals.length  < 2 ? [vals[0],  vals[0]]  : vals,
          full.opts
        );
      });
    });
  }

  window.CanonicalShellRenderers = {
    renderStackedList: renderStackedList,
    renderDoWColumns: renderDoWColumns,
    renderTrend: renderTrend,
    wireTrendRanges: wireTrendRanges,
    renderDefaultPlaceholders: renderDefaultPlaceholders,
    ensurePerfTooltip: ensurePerfTooltip,
    positionPerfTooltip: positionPerfTooltip,
    formatMinSec: formatMinSec
  };
})();
