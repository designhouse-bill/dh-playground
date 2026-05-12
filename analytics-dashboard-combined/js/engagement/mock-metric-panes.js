/**
 * mock-metric-panes.js — UX-846 2026-05-12
 *
 * Populates the empty metric-pane sub-pane placeholders on the
 * Circulars + Categories pages so clicking a perf-tab shows
 * grain-correct, metric-correct content instead of an empty pane.
 *
 * Reads body[data-grain] to pick the entity vocabulary
 *   circular -> stores ("#336 Hollywood, FL")
 *   category -> categories ("Produce", "Beverages", ...)
 *
 * In Angular: a MetricPaneComponent receives (grain, metric, dataset) inputs
 * and renders this same idiom against the real dataset.
 */
(function () {
  'use strict';

  // Mock entity rosters per grain.
  const ENTITIES = {
    circular: [
      { lbl: '#336 Hollywood, FL', short: '336' },
      { lbl: '#421 Pembroke Pines', short: '421' },
      { lbl: '#189 Aventura',      short: '189' },
      { lbl: '#052 Miami Beach',   short: '052' },
      { lbl: '#214 Boca Raton',    short: '214' },
    ],
    category: [
      { lbl: 'Produce',   short: 'PR' },
      { lbl: 'Beverages', short: 'BV' },
      { lbl: 'Bakery',    short: 'BK' },
      { lbl: 'Dairy',     short: 'DA' },
      { lbl: 'Snacks',    short: 'SN' },
    ],
  };

  // Mock values per metric. Index 0..4 lines up with ENTITIES[grain].
  // Width is the bar fill %. v/c/a or n/r/e are the stacked segments.
  const METRIC_DATA = {
    sessions: {
      values: ['18.2K', '15.3K', '12.9K', '10.5K', '8.4K'],
      widths: [100, 84, 71, 58, 46],
      label: 'sessions',
    },
    users: {
      values: ['12.4K', '10.8K', '9.1K', '7.5K', '6.2K'],
      widths: [100, 87, 73, 60, 50],
      label: 'users',
      segments: [
        { v: 38, c: 32, a: 30 },
        { v: 42, c: 30, a: 28 },
        { v: 40, c: 33, a: 27 },
        { v: 37, c: 35, a: 28 },
        { v: 41, c: 31, a: 28 },
      ],
      legend: ['New', 'Returning', 'Engaged'],
    },
    duration: {
      values: ['7m 12s', '6m 48s', '6m 15s', '5m 42s', '5m 08s'],
      widths: [100, 94, 87, 79, 71],
      label: 'avg duration',
    },
    cardevents: {
      values: ['48.2K', '41.7K', '36.4K', '29.8K', '24.1K'],
      widths: [100, 86, 75, 62, 50],
      label: 'card events',
      segments: [
        { v: 56, c: 28, a: 16 },
        { v: 58, c: 26, a: 16 },
        { v: 54, c: 30, a: 16 },
        { v: 60, c: 25, a: 15 },
        { v: 55, c: 30, a: 15 },
      ],
      legend: ['Views', 'Clicks', 'Adds'],
    },
  };

  // Day-of-week mock bar heights, peak on Saturday.
  const DOW = [
    { d: 'M', h: 62 }, { d: 'T', h: 48 }, { d: 'W', h: 55 },
    { d: 'T', h: 71 }, { d: 'F', h: 88 }, { d: 'S', h: 96, peak: true }, { d: 'S', h: 42 },
  ];

  // 5-week trend, current week last.
  const TREND = [
    { wk: 'W43', h: 58 }, { wk: 'W44', h: 64 }, { wk: 'W45', h: 71 },
    { wk: 'W46', h: 79 }, { wk: 'W47', h: 88, current: true },
  ];

  function rowHTML(entry, metricData, idx) {
    const seg = metricData.segments && metricData.segments[idx];
    const bar = seg
      ? `<div class="ep-store-rank__bar">
           <div class="ep-store-rank__seg" style="width:${seg.v * metricData.widths[idx] / 100}%; background:var(--series-v, #2196F3);"></div>
           <div class="ep-store-rank__seg" style="width:${seg.c * metricData.widths[idx] / 100}%; background:var(--series-c, #f59e0b);"></div>
           <div class="ep-store-rank__seg" style="width:${seg.a * metricData.widths[idx] / 100}%; background:var(--series-a, #22c55e);"></div>
         </div>`
      : `<div class="ep-store-rank__bar"><div class="ep-store-rank__fill" style="width:${metricData.widths[idx]}%;"></div></div>`;
    return `
      <div class="ep-store-rank__row">
        <span class="ep-store-rank__lbl">${entry.lbl}</span>
        ${bar}
        <span class="ep-store-rank__val">${metricData.values[idx]}</span>
      </div>`;
  }

  function rankedHTML(grain, metricKey) {
    const entries = ENTITIES[grain];
    const data = METRIC_DATA[metricKey];
    if (!entries || !data) return '';
    const legend = data.legend
      ? `<div class="ep-dealtype-rank__legend" style="margin-top:8px;">
           ${data.legend.map((l, i) => `<span class="ep-dealtype-rank__legend-item" style="--swatch: var(--series-${'vca'[i]}, ${['#2196F3','#f59e0b','#22c55e'][i]});">${l}</span>`).join('')}
         </div>`
      : '';
    return `
      <div class="ep-store-rank ep-store-rank--${metricKey}" aria-label="Top 5 ${grain}s by ${metricKey}">
        ${entries.map((e, i) => rowHTML(e, data, i)).join('')}
        ${legend}
      </div>`;
  }

  function dowHTML(metricKey) {
    const data = METRIC_DATA[metricKey];
    const peakVal = data ? data.values[0] : '';
    return `
      <div style="padding:12px 0;">
        <div style="font-size:13px; color:var(--color-text-secondary,#6b7280); margin-bottom:8px;">
          Peak day: <strong>Saturday</strong> · ${peakVal} ${data ? data.label : ''}
        </div>
        <div class="ep-dow-bars" aria-hidden="true" style="height:120px;">
          ${DOW.map(d => `<div class="ep-dow-bar${d.peak ? ' ep-dow-bar--peak' : ''}">
            <div class="ep-dow-bar__fill" style="height:${d.h}%"></div>
            <div class="ep-dow-bar__label">${d.d}</div>
          </div>`).join('')}
        </div>
      </div>`;
  }

  function trendHTML(metricKey) {
    const data = METRIC_DATA[metricKey];
    return `
      <div style="padding:12px 0;">
        <div style="font-size:13px; color:var(--color-text-secondary,#6b7280); margin-bottom:8px;">
          5-week trend · current week highlighted · ${data ? data.label : ''}
        </div>
        <div class="ep-dow-bars" aria-hidden="true" style="height:120px;">
          ${TREND.map(t => `<div class="ep-dow-bar${t.current ? ' ep-dow-bar--peak' : ''}">
            <div class="ep-dow-bar__fill" style="height:${t.h}%"></div>
            <div class="ep-dow-bar__label">${t.wk}</div>
          </div>`).join('')}
        </div>
      </div>`;
  }

  function fill(id, html, force) {
    const el = document.getElementById(id);
    if (!el) return;
    if (force || !el.innerHTML.trim()) el.innerHTML = html;
  }

  function populate() {
    const grain = document.body.dataset.grain;
    if (grain !== 'circular' && grain !== 'category') return;

    // On category grain the existing data layer renders store-level rows
    // (grain-blind), so we override the *-by-store divs with category-named
    // rows. On circular grain those rows ARE stores and stay as rendered.
    const force = grain === 'category';

    ['sessions', 'users', 'duration', 'cardevents'].forEach((m) => {
      fill('ep-' + m + '-by-store', rankedHTML(grain, m), force);
      fill('ep-' + m + '-by-day',   dowHTML(m), false);
      fill('ep-' + m + '-trend',    trendHTML(m), false);
    });
  }

  function run() {
    populate();
    // Race with the existing data-driven renderers — re-apply after they finish.
    setTimeout(populate, 250);
    setTimeout(populate, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
