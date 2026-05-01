/**
 * chart-defaults.js — Shared eCharts helpers for all Distribution pages.
 *
 * Exports (globals, consumed before page scripts):
 *   chartTooltipDark(valueFmt?)  → tooltip config object
 *   darkAxisTooltip(params, valueFmt)  → tooltip formatter (renders HTML)
 *   lazyChartInit(triggerEl, guard, renderFn)  → deferred init on tab show
 *   resizeChartsIn(paneEl)  → resize all eCharts instances inside a pane
 *
 * Depends on: echarts (vendor), ChartColors (chart-colors.js)
 */

// ── Dark tooltip style constants ───────────────────────────────────────────

const _TOOLTIP_BG    = 'rgba(17,24,39,0.96)';
const _TOOLTIP_BORDER = 'rgba(255,255,255,0.12)';

/**
 * Returns the shared dark-themed eCharts tooltip config object.
 * Merge into any setOption() call: { ...chartTooltipDark(myFmt), trigger: 'item' }
 *
 * @param {function} [valueFmt] - optional value formatter: (v) => string.
 *   When provided, wraps darkAxisTooltip as the formatter.
 *   Omit if you're supplying a custom formatter yourself.
 */
function chartTooltipDark(valueFmt) {
  var base = {
    backgroundColor: _TOOLTIP_BG,
    borderColor: _TOOLTIP_BORDER,
    textStyle: { color: '#fff', fontSize: 12 },
    trigger: 'axis',
    axisPointer: { type: 'shadow' }
  };
  if (valueFmt) {
    base.formatter = function(params) { return darkAxisTooltip(params, valueFmt); };
  }
  return base;
}

// ── Date range helpers (used by darkAxisTooltip) ────────────────────────────

function _fmtDateRangeISO(startISO, endISO) {
  var mo = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var s = new Date(startISO + 'T00:00:00Z');
  var e = new Date(endISO + 'T00:00:00Z');
  if (s.getUTCMonth() === e.getUTCMonth()) {
    return mo[s.getUTCMonth()] + ' ' + s.getUTCDate() + '–' + e.getUTCDate() + ', ' + e.getUTCFullYear();
  }
  return mo[s.getUTCMonth()] + ' ' + s.getUTCDate() + ' – ' + mo[e.getUTCMonth()] + ' ' + e.getUTCDate() + ', ' + e.getUTCFullYear();
}

/**
 * Returns a human-readable date hint for a bucket label used in axis tooltips.
 * Understands: 'Week N', 'W1'–'W13', 'Q1'–'Q4', day names.
 * Returns '' when no annotation is needed (label is self-explanatory).
 * Reads D.flightWeeks when available (set by distribution data layer).
 */
function bucketDateHint(label) {
  if (!label) return '';
  if (/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)$/.test(label)) return '';

  var wm = label.match(/^Week\s+(\d+)$/);
  if (wm && typeof D !== 'undefined' && D && D.flightWeeks) {
    var fw = D.flightWeeks.find(function(w) { return w.label === label; });
    if (fw) return _fmtDateRangeISO(fw.start, fw.end);
  }

  var rm = label.match(/^W(\d+)$/);
  if (rm) {
    var n = parseInt(rm[1]);
    var anchorMs = Date.UTC(2025, 11, 10);
    var startMs = anchorMs + (n - 13) * 7 * 86400000;
    return _fmtDateRangeISO(
      new Date(startMs).toISOString().slice(0, 10),
      new Date(startMs + 6 * 86400000).toISOString().slice(0, 10)
    );
  }

  var quarters = { Q1: 'Jan – Mar 2025', Q2: 'Apr – Jun 2025', Q3: 'Jul – Sep 2025', Q4: 'Oct – Dec 2025' };
  if (quarters[label]) return quarters[label];
  return '';
}

/**
 * Renders a dark-themed eCharts axis tooltip body.
 * Call from any tooltip.formatter: (params) => darkAxisTooltip(params, myFmt)
 *
 * @param {Array} params  - eCharts tooltip params array
 * @param {function} valueFmt - (value: number) => string
 */
function darkAxisTooltip(params, valueFmt) {
  if (!params || !params.length) return '';
  var label = params[0].axisValueLabel || params[0].name;
  var hint = bucketDateHint(label);
  var header = hint
    ? '<div style="font-size:13px;font-weight:600;color:#fff;margin-bottom:2px;">' + label + '</div>'
      + '<div style="font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:7px;padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,0.18);">' + hint + '</div>'
    : '<div style="font-size:13px;font-weight:600;color:#fff;margin-bottom:7px;padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,0.18);">' + label + '</div>';
  var rows = params.map(function(p) {
    return '<div style="display:flex;justify-content:space-between;gap:14px;padding:2px 0;">'
      + '<span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:'
      + p.color + ';margin-right:6px;vertical-align:middle;"></span>'
      + '<span style="color:rgba(255,255,255,0.85);">' + p.seriesName + '</span></span>'
      + '<span style="font-weight:600;color:#fff;">' + valueFmt(p.value) + '</span>'
      + '</div>';
  });
  return header + rows.join('');
}

// ── Lazy init + resize helpers ──────────────────────────────────────────────

/**
 * Deferred chart init for perf-tab panes.
 * eCharts cannot measure a display:none container — call this when a tab is
 * shown for the first time rather than at page load.
 *
 * @param {Element|string} triggerEl - element (or selector) whose click shows the pane
 * @param {{ done: boolean }} guard   - object with a `done` boolean; set to true after first init
 * @param {function} renderFn        - function that creates the chart(s) inside the pane
 *
 * Usage:
 *   var _tabGuard = { done: false };
 *   lazyChartInit(myTabBtn, _tabGuard, function() { initMyChart(); });
 */
function lazyChartInit(triggerEl, guard, renderFn) {
  var el = typeof triggerEl === 'string' ? document.querySelector(triggerEl) : triggerEl;
  if (!el) return;
  el.addEventListener('click', function() {
    if (guard.done) return;
    guard.done = true;
    renderFn();
  });
}

/**
 * Resize every eCharts instance found inside paneEl.
 * Call after a tab becomes visible (display:none → visible) to fix sizing.
 * Uses a 0ms setTimeout so the browser has a chance to paint before resize.
 *
 * @param {Element|string} paneEl - container element (or selector)
 * @param {number} [delay=0]      - ms before resize; use 50 for CSS transitions
 */
function resizeChartsIn(paneEl, delay) {
  var el = typeof paneEl === 'string' ? document.querySelector(paneEl) : paneEl;
  if (!el) return;
  setTimeout(function() {
    el.querySelectorAll('[id]').forEach(function(child) {
      var inst = echarts.getInstanceByDom(child);
      if (inst) inst.resize();
    });
  }, delay == null ? 0 : delay);
}
