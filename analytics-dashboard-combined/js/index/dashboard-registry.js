/* ============================================================
   UX-846 L0 — Configurable KPI cell registry

   Each entry: storyId → render() + dataSource(). Render fns emit the
   LOCKED ep-kpi-cell HTML verbatim (head + chart slot + view footer).
   Mock data populates the chart slot using the same shapes as the
   stripped Engagement Overview (donut SVG / users-by-store list /
   mini-dow / mini-device). No placeholder shimmer — visual fidelity
   matches the locked pattern from day one.

   ep-kpi-cell shell rules — DO NOT diverge:
   - <a class="ep-kpi-cell ep-kpi-cell--equal" href="..." data-jump-to="...">
   - .ep-kpi-cell__head with story / metric / value / delta
   - .ep-kpi-cell__chart with the per-story viz body
   - .ep-kpi-cell__view footer with chevron icon

   Angular shape mirrors this object — see
   memory/topics/analytics-kpi-cell-registry-pattern.md.
   ============================================================ */
(function () {
  'use strict';

  // ── Canonical display names (storyId → label) ──────────────────
  // Authoritative source for the human-readable cell name: renderCell uses
  // LABELS[storyId] first, falling back to the render fn's `story:` arg only
  // if a label is missing — so LABELS wins wherever it's defined, and the
  // Customize modal reads the same map. (The render fns still pass `story:`
  // as a fallback; the Angular port should drop those and read label off the
  // registry entry.)
  var LABELS = {
    'media-impact':      'Media Impact',
    'top-creative':      'Top Creative',
    'share-of-visits':   'Share of Visits',
    'competitive-cross': 'Competitive Crossover',
    'attributed-visits': 'Attributed Visits',
    'lift-vs-baseline':  'Lift vs Baseline',
    'audience-profile':  'Audience Profile',
    'target-match':      'Target Match',
    'eng-performance':   'Performance Score',
    'eng-users':         'Total Users by Store',
    'eng-sessions':      'Sessions',
    'eng-duration':      'Avg Duration'
  };
  window.CELL_LABELS = LABELS;

  // ── Shared shell renderer ──────────────────────────────────────
  // Builds the locked ep-kpi-cell wrapper around a body HTML string.
  function renderCell(opts) {
    var deltaDir = opts.deltaDir || 'flat';
    var deltaCls = 'ep-kpi-cell__delta--' + deltaDir;
    var deltaSym = deltaDir === 'up' ? '▲' : deltaDir === 'down' ? '▼' : '—';
    var chartExtra = opts.chartExtraClass ? ' ' + opts.chartExtraClass : '';
    return ''
      + '<a id="' + opts.storyId + '-panel" class="ep-kpi-cell ep-kpi-cell--equal" href="' + opts.href + '" data-story-id="' + opts.storyId + '" data-jump-to="' + (opts.jumpTo || '') + '">'
      +   '<div class="ep-kpi-cell__head">'
      +     '<div class="ep-kpi-cell__title">'
      +       '<h3 class="ep-kpi-cell__story">' + (LABELS[opts.storyId] || opts.story || opts.storyId) + '</h3>'
      +     '</div>'
      +     '<div>'
      +       '<div class="ep-kpi-cell__metric">' + opts.metric + '</div>'
      +     '</div>'
      +     '<div style="text-align:right;">'
      +       '<div class="ep-kpi-cell__value">' + opts.value + '</div>'
      +       '<div class="ep-kpi-cell__delta ' + deltaCls + '" title="Versus last week">'
      +         deltaSym + ' ' + opts.delta + '<span class="ep-kpi-cell__delta-vs">vs last week</span>'
      +       '</div>'
      +     '</div>'
      +   '</div>'
      +   '<div class="ep-kpi-cell__chart' + chartExtra + '">' + opts.bodyHtml + '</div>'
      +   '<span class="ep-kpi-cell__view">Open ' + opts.openLabel + ' <span class="material-symbols-outlined">chevron_right</span></span>'
      + '</a>';
  }

  // ── Reusable body shapes (port from Engagement Overview) ───────

  // V/C/A donut SVG (3-slice). Slices accept arc-path strings; defaults
  // mirror Performance Score shape (56% / 28% / 16%).
  function donutVCA(opts) {
    var paths = opts.paths || {
      v: 'M 100.00 10.00 A 90 90 0 1 1 66.34 183.47 L 81.30 146.37 A 50 50 0 1 0 100.00 50.00 Z',
      c: 'M 66.34 183.47 A 90 90 0 0 1 24.31 51.30 L 57.95 72.94 A 50 50 0 0 0 81.30 146.37 Z',
      a: 'M 24.31 51.30 A 90 90 0 0 1 100.00 10.00 L 100.00 50.00 A 50 50 0 0 0 57.95 72.94 Z'
    };
    var legend = opts.legend || ['Views', 'Clicks', 'Adds'];
    var label  = opts.label  || 'V/C/A composite';
    return ''
      + '<svg class="ep-perf-donut-svg" viewBox="0 0 200 200" aria-label="' + label + '">'
      +   '<path class="ep-perf-donut-svg__slice ep-perf-donut-svg__slice--v" d="' + paths.v + '" fill="var(--series-v, #2196F3)"></path>'
      +   '<path class="ep-perf-donut-svg__slice ep-perf-donut-svg__slice--c" d="' + paths.c + '" fill="var(--series-c, #f59e0b)"></path>'
      +   '<path class="ep-perf-donut-svg__slice ep-perf-donut-svg__slice--a" d="' + paths.a + '" fill="var(--series-a, #22c55e)"></path>'
      + '</svg>'
      + '<div class="ep-perf-donut__legend ep-perf-donut__legend--pills">'
      +   '<span class="ep-perf-donut__legend-pill ep-perf-donut__legend-pill--views"><span class="ep-perf-donut__legend-dot"></span>' + legend[0] + '</span>'
      +   '<span class="ep-perf-donut__legend-pill ep-perf-donut__legend-pill--clicks"><span class="ep-perf-donut__legend-dot"></span>' + legend[1] + '</span>'
      +   '<span class="ep-perf-donut__legend-pill ep-perf-donut__legend-pill--adds"><span class="ep-perf-donut__legend-dot"></span>' + legend[2] + '</span>'
      + '</div>';
  }

  // Ranked horizontal bar list (Users-by-store shape). Items: [{name, val, pct}]
  function rankedBarList(items, listId) {
    var rows = items.map(function (r) {
      return ''
        + '<li class="ep-users-by-store__row">'
        +   '<span class="ep-users-by-store__name">' + r.name + '</span>'
        +   '<span class="ep-users-by-store__track"><span class="ep-users-by-store__fill" style="width:' + r.pct + '%;"></span></span>'
        +   '<span class="ep-users-by-store__val">' + r.val + '</span>'
        + '</li>';
    }).join('');
    return '<ol id="' + (listId || '') + '" class="ep-users-by-store">' + rows + '</ol>';
  }

  // Day-of-week mini bars (Sessions shape). Items: [{label, val, pct, peak?}]
  function miniDow(items, listId) {
    var cols = items.map(function (c) {
      var peakCls = c.peak ? ' ep-mini-dow__bar--peak' : '';
      return ''
        + '<div class="ep-mini-dow__col">'
        +   '<div class="ep-mini-dow__bar' + peakCls + '" style="height:' + c.pct + '%"></div>'
        +   '<span class="ep-mini-dow__lbl">' + c.label + '</span>'
        + '</div>';
    }).join('');
    return '<div id="' + (listId || '') + '" class="ep-mini-dow" aria-label="Distribution by category">' + cols + '</div>';
  }

  // Device-style horizontal bars (Avg Duration shape). Items: [{label, val, pct}]
  function miniDevice(items, listId) {
    var rows = items.map(function (r) {
      return ''
        + '<div class="ep-mini-device__row">'
        +   '<span class="ep-mini-device__lbl">' + r.label + '</span>'
        +   '<div class="ep-mini-device__bar"><div class="ep-mini-device__fill" style="width:' + r.pct + '%"></div></div>'
        +   '<span class="ep-mini-device__val">' + r.val + '</span>'
        + '</div>';
    }).join('');
    return '<div id="' + (listId || '') + '" class="ep-mini-device">' + rows + '</div>';
  }

  // ── DISTRIBUTION cell render fns ───────────────────────────────

  function renderMediaImpactCell(d) {
    // Donut: Impressions / Clicks / Conversions (V/C/A palette analog)
    return renderCell({
      storyId: 'media-impact', story: 'Media Impact', jumpTo: 'paid-media',
      metric: d.metric, value: d.value, delta: d.delta, deltaDir: d.deltaDir,
      href: 'distribution-media.html', openLabel: 'Paid Media',
      chartExtraClass: 'ep-kpi-cell__chart--perf',
      bodyHtml: donutVCA({ legend: ['Impressions', 'Clicks', 'Conversions'], label: 'Media Impact composite' })
    });
  }

  function renderTopCreativeCell(d) {
    return renderCell({
      storyId: 'top-creative', story: 'Top Creative', jumpTo: 'creative-library',
      metric: d.metric, value: d.value, delta: d.delta, deltaDir: d.deltaDir,
      href: 'distribution-media.html#creative-library', openLabel: 'Creative Library',
      bodyHtml: rankedBarList([
        { name: 'Holiday Pies 30s', val: '3.41%', pct: 100 },
        { name: 'Turkey Bundle 15s', val: '2.87%', pct: 84 },
        { name: 'BOGO Cereal Static', val: '2.40%', pct: 70 }
      ])
    });
  }

  function renderShareCell(d) {
    return renderCell({
      storyId: 'share-of-visits', story: 'Share of Visits', jumpTo: 'traffic-share',
      metric: d.metric, value: d.value, delta: d.delta, deltaDir: d.deltaDir,
      href: 'distribution-traffic.html', openLabel: 'Traffic Share',
      bodyHtml: rankedBarList([
        { name: 'Ideal Foods', val: '24.1%', pct: 100 },
        { name: 'Wegmans',     val: '18.0%', pct: 75 },
        { name: 'Publix',      val: '14.6%', pct: 60 },
        { name: 'Kroger',      val: '12.2%', pct: 51 },
        { name: 'All Other',   val: '31.1%', pct: 0 } // 0 fill = excluded from rank visual
      ])
    });
  }

  function renderCrossoverCell(d) {
    return renderCell({
      storyId: 'competitive-cross', story: 'Competitive Crossover', jumpTo: 'by-competitor',
      metric: d.metric, value: d.value, delta: d.delta, deltaDir: d.deltaDir,
      href: 'distribution-traffic.html#by-competitor', openLabel: 'By Competitor',
      bodyHtml: rankedBarList([
        { name: 'Wegmans',  val: '18%', pct: 100 },
        { name: 'Publix',   val: '14%', pct: 78 },
        { name: 'Kroger',   val: '11%', pct: 61 },
        { name: 'Aldi',     val: '8%',  pct: 44 },
        { name: 'Whole Fds',val: '6%',  pct: 33 }
      ])
    });
  }

  function renderAttribCell(d) {
    // Donut: New / Returning / Loyal (V/C/A palette — locked Greenberg buckets)
    return renderCell({
      storyId: 'attributed-visits', story: 'Attributed Visits', jumpTo: 'observed-visits',
      metric: d.metric, value: d.value, delta: d.delta, deltaDir: d.deltaDir,
      href: 'distribution-visitation.html', openLabel: 'Observed Visits',
      chartExtraClass: 'ep-kpi-cell__chart--perf',
      bodyHtml: donutVCA({ legend: ['New', 'Returning', 'Loyal'], label: 'Attributed Visits by frequency' })
    });
  }

  function renderLiftCell(d) {
    return renderCell({
      storyId: 'lift-vs-baseline', story: 'Lift vs Baseline', jumpTo: 'time-trend',
      metric: d.metric, value: d.value, delta: d.delta, deltaDir: d.deltaDir,
      href: 'distribution-visitation.html#time-trend', openLabel: 'Time Trend',
      bodyHtml: miniDevice([
        { label: 'Flighted',   val: '38.9K visits', pct: 100 },
        { label: 'Ambient',    val: '32.8K visits', pct: 84 }
      ])
    });
  }

  function renderProfileCell(d) {
    // Age brackets — dow-style mini bars
    return renderCell({
      storyId: 'audience-profile', story: 'Audience Profile', jumpTo: 'observed-demographics',
      metric: d.metric, value: d.value, delta: d.delta, deltaDir: d.deltaDir,
      href: 'distribution-demographics.html', openLabel: 'Observed Demographics',
      bodyHtml: miniDow([
        { label: '18-24', val: '8%',  pct: 25 },
        { label: '25-34', val: '22%', pct: 68 },
        { label: '35-44', val: '32%', pct: 100, peak: true },
        { label: '45-54', val: '24%', pct: 75 },
        { label: '55-64', val: '10%', pct: 32 },
        { label: '65+',   val: '4%',  pct: 14 }
      ])
    });
  }

  function renderMatchCell(d) {
    return renderCell({
      storyId: 'target-match', story: 'Target Match', jumpTo: 'by-store',
      metric: d.metric, value: d.value, delta: d.delta, deltaDir: d.deltaDir,
      href: 'distribution-demographics.html#by-store', openLabel: 'By Store',
      bodyHtml: miniDevice([
        { label: 'Age',    val: '78%', pct: 78 },
        { label: 'HHI',    val: '70%', pct: 70 },
        { label: 'Gender', val: '68%', pct: 68 }
      ])
    });
  }

  // ── ENGAGEMENT cell render fns (port from stripped Overview verbatim) ──

  function renderEngPerfCell(d) {
    return renderCell({
      storyId: 'eng-performance', story: 'Performance Score', jumpTo: 'performance',
      metric: d.metric, value: d.value, delta: d.delta, deltaDir: d.deltaDir,
      href: 'engagement-report.html?tab=performance', openLabel: 'Performance Score',
      chartExtraClass: 'ep-kpi-cell__chart--perf',
      bodyHtml: donutVCA({ legend: ['Views', 'Clicks', 'Adds'], label: 'Performance Score V/C/A composite' })
    });
  }

  function renderEngUsersCell(d) {
    return renderCell({
      storyId: 'eng-users', story: 'Total Users by Store', jumpTo: 'users',
      metric: d.metric, value: d.value, delta: d.delta, deltaDir: d.deltaDir,
      href: 'engagement-report.html?tab=users', openLabel: 'Total Users',
      bodyHtml: rankedBarList([
        { name: 'WinnDixie 481', val: '1,524', pct: 100 },
        { name: 'WinnDixie 436', val: '1,218', pct: 80 },
        { name: 'WinnDixie 123', val: '924',   pct: 61 },
        { name: 'WinnDixie 726', val: '748',   pct: 49 },
        { name: 'WinnDixie 711', val: '604',   pct: 40 }
      ])
    });
  }

  function renderEngSessionsCell(d) {
    return renderCell({
      storyId: 'eng-sessions', story: 'Sessions', jumpTo: 'sessions',
      metric: d.metric, value: d.value, delta: d.delta, deltaDir: d.deltaDir,
      href: 'engagement-report.html?tab=sessions', openLabel: 'Sessions',
      bodyHtml: miniDow([
        { label: 'M', val: '9,840',  pct: 62 },
        { label: 'T', val: '7,510',  pct: 48 },
        { label: 'W', val: '8,620',  pct: 55 },
        { label: 'T', val: '11,180', pct: 71 },
        { label: 'F', val: '13,810', pct: 88 },
        { label: 'S', val: '15,050', pct: 96, peak: true },
        { label: 'S', val: '6,580',  pct: 42 }
      ])
    });
  }

  function renderEngDurationCell(d) {
    return renderCell({
      storyId: 'eng-duration', story: 'Avg Duration', jumpTo: 'duration',
      metric: d.metric, value: d.value, delta: d.delta, deltaDir: d.deltaDir,
      href: 'engagement-report.html?tab=duration', openLabel: 'Avg Duration',
      bodyHtml: miniDevice([
        { label: 'Mobile',  val: '7m 12s', pct: 100 },
        { label: 'Desktop', val: '5m 02s', pct: 70 },
        { label: 'Tablet',  val: '4m 31s', pct: 63 },
        { label: 'Other',   val: '2m 18s', pct: 32 }
      ])
    });
  }

  // ── Mock data sources (replace one-at-a-time when real data lands) ──
  function mock(storyId) {
    var f = {
      'media-impact':       { metric: 'Impressions · Week 47',   value: '4.82M',         delta: '6.3%',   deltaDir: 'up' },
      'top-creative':       { metric: 'Best CTR · this week',     value: '3.41%',         delta: '0.4 pp', deltaDir: 'up' },
      'share-of-visits':    { metric: 'Share of market visits',   value: '24.1%',         delta: '0.8 pp', deltaDir: 'up' },
      'competitive-cross':  { metric: 'Top crossover · Week 47',  value: 'Wegmans · 18%', delta: '1.2 pp', deltaDir: 'down' },
      'attributed-visits':  { metric: 'Visits · Week 47 · N/R/L', value: '38,910',        delta: '4.2%',   deltaDir: 'up' },
      'lift-vs-baseline':   { metric: 'Flighted vs ambient',      value: '+18.4%',        delta: '2.1 pp', deltaDir: 'up' },
      'audience-profile':   { metric: 'Top bracket · Week 47',    value: '35-44 · 32%',   delta: '0.6 pp', deltaDir: 'up' },
      'target-match':       { metric: 'Observed vs target',       value: '72%',           delta: '3.0 pp', deltaDir: 'up' },
      'eng-performance':    { metric: 'V/C/A composite · Week 47',value: '142.8K',        delta: '5.8%',   deltaDir: 'up' },
      'eng-users':          { metric: 'Total · Week 47 · top stores', value: '12,460',    delta: '3.1%',   deltaDir: 'up' },
      'eng-sessions':       { metric: 'Total · Week 47 · by day', value: '78,542',        delta: '4.2%',   deltaDir: 'up' },
      'eng-duration':       { metric: 'Per session · device share', value: '6m 8s',       delta: '1.5%',   deltaDir: 'down' }
    };
    if (!f[storyId]) {
      // Unknown storyId would render a valid-looking em-dash cell that reads
      // as "no data this week" rather than a wiring bug. Warn so it can't hide.
      console.warn('dashboard: no mock data for', storyId);
      return { metric: '—', value: '—', delta: '—', deltaDir: 'flat' };
    }
    return f[storyId];
  }

  // ── Registry ───────────────────────────────────────────────────
  window.CELL_REGISTRY = {
    // Distribution (8)
    'media-impact':       { section: 'paid-media',   product: 'distribution', render: renderMediaImpactCell, dataSource: function () { return mock('media-impact'); },      defaultEnabled: true, defaultOrder: 1 },
    'top-creative':       { section: 'paid-media',   product: 'distribution', render: renderTopCreativeCell, dataSource: function () { return mock('top-creative'); },      defaultEnabled: true, defaultOrder: 2 },
    'share-of-visits':    { section: 'traffic',      product: 'distribution', render: renderShareCell,       dataSource: function () { return mock('share-of-visits'); },   defaultEnabled: true, defaultOrder: 3 },
    'competitive-cross':  { section: 'traffic',      product: 'distribution', render: renderCrossoverCell,   dataSource: function () { return mock('competitive-cross'); }, defaultEnabled: true, defaultOrder: 4 },
    'attributed-visits':  { section: 'visitation',   product: 'distribution', render: renderAttribCell,      dataSource: function () { return mock('attributed-visits'); }, defaultEnabled: true, defaultOrder: 5 },
    'lift-vs-baseline':   { section: 'visitation',   product: 'distribution', render: renderLiftCell,        dataSource: function () { return mock('lift-vs-baseline'); },  defaultEnabled: true, defaultOrder: 6 },
    'audience-profile':   { section: 'demographics', product: 'distribution', render: renderProfileCell,     dataSource: function () { return mock('audience-profile'); },  defaultEnabled: true, defaultOrder: 7 },
    'target-match':       { section: 'demographics', product: 'distribution', render: renderMatchCell,       dataSource: function () { return mock('target-match'); },      defaultEnabled: true, defaultOrder: 8 },

    // Engagement (4) — ported from stripped Engagement Report Overview verbatim shape
    'eng-performance':    { section: 'engagement-report', product: 'engagement', render: renderEngPerfCell,     dataSource: function () { return mock('eng-performance'); }, defaultEnabled: true, defaultOrder: 9 },
    'eng-users':          { section: 'engagement-report', product: 'engagement', render: renderEngUsersCell,    dataSource: function () { return mock('eng-users'); },       defaultEnabled: true, defaultOrder: 10 },
    'eng-sessions':       { section: 'engagement-report', product: 'engagement', render: renderEngSessionsCell, dataSource: function () { return mock('eng-sessions'); },    defaultEnabled: true, defaultOrder: 11 },
    'eng-duration':       { section: 'engagement-report', product: 'engagement', render: renderEngDurationCell, dataSource: function () { return mock('eng-duration'); },    defaultEnabled: true, defaultOrder: 12 }
  };

  // All registry entries, mode-filtered, default order. Used by the
  // Customize modal to show the full universe a user can enable/reorder.
  window.getAllDashboardCells = function (mode) {
    var entries = Object.keys(window.CELL_REGISTRY).map(function (id) {
      return Object.assign({ storyId: id }, window.CELL_REGISTRY[id]);
    });
    if (mode === 'engagement')   entries = entries.filter(function (e) { return e.product === 'engagement'; });
    if (mode === 'distribution') entries = entries.filter(function (e) { return e.product === 'distribution'; });
    return entries.sort(function (a, b) { return a.defaultOrder - b.defaultOrder; });
  };

  // Cells to RENDER for a mode, honoring the saved enabled+ordered set.
  //
  // savedOrder is AUTHORITATIVE when present: a cell's absence means the
  // user disabled it (not "append at the end"). This is what lets the
  // Customize modal toggle cells off. New registry cells added later stay
  // hidden until the user re-customizes — same contract as the Angular
  // admin-config/per-tenant override model.
  //
  // ONLY null/undefined savedOrder means "never customized" → all cells in
  // default order. An EMPTY array is a real state ("user disabled every
  // cell") and must round-trip as zero enabled — NOT fall through to all.
  window.getDashboardCells = function (mode, savedOrder) {
    var entries = window.getAllDashboardCells(mode);
    if (savedOrder == null) return entries;

    var byId = {};
    entries.forEach(function (e) { byId[e.storyId] = e; });
    return savedOrder.map(function (id) {
      var hit = byId[id];
      // id absent from this mode's entries: either a legit cross-mode id
      // (saved in combined, viewed in a single-product mode) or genuinely
      // unknown. Warn only on the latter so stale/typo'd ids aren't silent.
      if (!hit && !window.CELL_REGISTRY[id]) console.warn('dashboard: dropping unknown saved cell id', id);
      return hit;
    }).filter(Boolean);
  };
})();
