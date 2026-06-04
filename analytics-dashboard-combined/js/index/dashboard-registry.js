/* ============================================================
   UX-846 L0 — Configurable KPI cell registry (prototype)

   POC scaffold. Each entry maps storyId → render() + dataSource().
   Render fns currently emit shell-only (head + link) — viz fills in
   per plan build sequence (lowest-mock-cost first).

   Angular shape mirrors this object — see
   memory/topics/analytics-kpi-cell-registry-pattern.md.
   ============================================================ */
(function () {
  'use strict';

  // ── Shared shell renderer ────────────────────────────────────
  // Every cell uses the locked `ep-kpi-cell` contract. Body is the
  // per-story chart slot — empty in scaffold, filled by individual
  // render fns once viz wiring lands.
  function renderShell(opts) {
    var deltaCls = 'ep-kpi-cell__delta--' + (opts.deltaDir || 'flat');
    var deltaSym = opts.deltaDir === 'up' ? '▲' : opts.deltaDir === 'down' ? '▼' : '—';
    return ''
      + '<a class="ep-kpi-cell ep-kpi-cell--equal" href="' + opts.href + '" data-story-id="' + opts.storyId + '">'
      +   '<div class="ep-kpi-cell__head">'
      +     '<div class="ep-kpi-cell__title">'
      +       '<h3 class="ep-kpi-cell__story">' + opts.story + '</h3>'
      +     '</div>'
      +     '<div>'
      +       '<div class="ep-kpi-cell__metric">' + opts.metric + '</div>'
      +     '</div>'
      +     '<div style="text-align:right;">'
      +       '<div class="ep-kpi-cell__value">' + opts.value + '</div>'
      +       '<div class="ep-kpi-cell__delta ' + deltaCls + '">'
      +         deltaSym + ' ' + opts.delta + '<span class="ep-kpi-cell__delta-vs">vs last week</span>'
      +       '</div>'
      +     '</div>'
      +   '</div>'
      +   '<div class="ep-kpi-cell__chart" data-story-body="' + opts.storyId + '">'
      +     (opts.bodyHtml || '<div class="ep-kpi-cell__placeholder">Mini viz — POC stub</div>')
      +   '</div>'
      +   '<span class="ep-kpi-cell__view">Open ' + opts.openLabel + ' <span class="material-symbols-outlined">chevron_right</span></span>'
      + '</a>';
  }

  // ── Mock data sources (replace one-by-one per build sequence) ─
  // Each returns plain object the matching render fn consumes.
  function mockData(storyId) {
    var fixtures = {
      'media-impact':       { metric: 'Impressions · Week 47', value: '4.82M',  delta: '6.3%', deltaDir: 'up' },
      'top-creative':       { metric: 'Best CTR · this week',   value: '3.41%',  delta: '0.4 pp', deltaDir: 'up' },
      'share-of-visits':    { metric: 'Share of market visits', value: '24.1%',  delta: '0.8 pp', deltaDir: 'up' },
      'competitive-cross':  { metric: 'Top crossover',          value: 'Wegmans · 18%', delta: '1.2 pp', deltaDir: 'down' },
      'attributed-visits':  { metric: 'Visits · Week 47',       value: '38,910', delta: '4.2%', deltaDir: 'up' },
      'lift-vs-baseline':   { metric: 'Flighted vs ambient',    value: '+18.4%', delta: '2.1 pp', deltaDir: 'up' },
      'audience-profile':   { metric: 'Top age bracket',        value: '35-44 · 32%', delta: '0.6 pp', deltaDir: 'up' },
      'target-match':       { metric: 'Observed vs target',     value: '72%',    delta: '3.0 pp', deltaDir: 'up' }
    };
    return fixtures[storyId] || { metric: '—', value: '—', delta: '—', deltaDir: 'flat' };
  }

  // ── Per-story render fns (shell-only scaffold) ───────────────
  function renderMediaImpactCell(data) {
    return renderShell({
      storyId: 'media-impact', story: 'Media Impact',
      metric: data.metric, value: data.value, delta: data.delta, deltaDir: data.deltaDir,
      href: 'distribution-media.html', openLabel: 'Paid Media'
    });
  }
  function renderTopCreativeCell(data) {
    return renderShell({
      storyId: 'top-creative', story: 'Top Creative',
      metric: data.metric, value: data.value, delta: data.delta, deltaDir: data.deltaDir,
      href: 'distribution-media.html#creative-library', openLabel: 'Creative Library'
    });
  }
  function renderShareCell(data) {
    return renderShell({
      storyId: 'share-of-visits', story: 'Share of Visits',
      metric: data.metric, value: data.value, delta: data.delta, deltaDir: data.deltaDir,
      href: 'distribution-traffic.html', openLabel: 'Traffic Share'
    });
  }
  function renderCrossoverCell(data) {
    return renderShell({
      storyId: 'competitive-cross', story: 'Competitive Crossover',
      metric: data.metric, value: data.value, delta: data.delta, deltaDir: data.deltaDir,
      href: 'distribution-traffic.html#by-competitor', openLabel: 'By Competitor'
    });
  }
  function renderAttribCell(data) {
    return renderShell({
      storyId: 'attributed-visits', story: 'Attributed Visits',
      metric: data.metric, value: data.value, delta: data.delta, deltaDir: data.deltaDir,
      href: 'distribution-visitation.html', openLabel: 'Observed Visits'
    });
  }
  function renderLiftCell(data) {
    return renderShell({
      storyId: 'lift-vs-baseline', story: 'Lift vs Baseline',
      metric: data.metric, value: data.value, delta: data.delta, deltaDir: data.deltaDir,
      href: 'distribution-visitation.html#time-trend', openLabel: 'Time Trend'
    });
  }
  function renderProfileCell(data) {
    return renderShell({
      storyId: 'audience-profile', story: 'Audience Profile',
      metric: data.metric, value: data.value, delta: data.delta, deltaDir: data.deltaDir,
      href: 'distribution-demographics.html', openLabel: 'Observed Demographics'
    });
  }
  function renderMatchCell(data) {
    return renderShell({
      storyId: 'target-match', story: 'Target Match',
      metric: data.metric, value: data.value, delta: data.delta, deltaDir: data.deltaDir,
      href: 'distribution-demographics.html#by-store', openLabel: 'By Store'
    });
  }

  // ── Engagement cell stubs (combined-mode parity) ─────────────
  // Re-register existing Engagement Report cells so combined mode
  // shows all 12. Real impl: pull live data from engagement data
  // service; scaffold uses static seed values.
  function renderEngagementShell(storyId, story, openLabel, value, delta) {
    return renderShell({
      storyId: storyId, story: story,
      metric: 'Week 47', value: value, delta: delta, deltaDir: 'up',
      href: 'engagement-report.html?tab=' + storyId.replace('eng-', ''),
      openLabel: openLabel
    });
  }

  // ── Registry ─────────────────────────────────────────────────
  window.CELL_REGISTRY = {
    // Distribution (8)
    'media-impact':       { section: 'paid-media',   product: 'distribution', render: renderMediaImpactCell, dataSource: function () { return mockData('media-impact'); },      defaultEnabled: true, defaultOrder: 1 },
    'top-creative':       { section: 'paid-media',   product: 'distribution', render: renderTopCreativeCell, dataSource: function () { return mockData('top-creative'); },      defaultEnabled: true, defaultOrder: 2 },
    'share-of-visits':    { section: 'traffic',      product: 'distribution', render: renderShareCell,       dataSource: function () { return mockData('share-of-visits'); },   defaultEnabled: true, defaultOrder: 3 },
    'competitive-cross':  { section: 'traffic',      product: 'distribution', render: renderCrossoverCell,   dataSource: function () { return mockData('competitive-cross'); }, defaultEnabled: true, defaultOrder: 4 },
    'attributed-visits':  { section: 'visitation',   product: 'distribution', render: renderAttribCell,      dataSource: function () { return mockData('attributed-visits'); }, defaultEnabled: true, defaultOrder: 5 },
    'lift-vs-baseline':   { section: 'visitation',   product: 'distribution', render: renderLiftCell,        dataSource: function () { return mockData('lift-vs-baseline'); },  defaultEnabled: true, defaultOrder: 6 },
    'audience-profile':   { section: 'demographics', product: 'distribution', render: renderProfileCell,     dataSource: function () { return mockData('audience-profile'); },  defaultEnabled: true, defaultOrder: 7 },
    'target-match':       { section: 'demographics', product: 'distribution', render: renderMatchCell,       dataSource: function () { return mockData('target-match'); },      defaultEnabled: true, defaultOrder: 8 },

    // Engagement (4) — combined-mode parity, scaffold values; real wiring comes from engagement data service
    'eng-performance':    { section: 'engagement-report', product: 'engagement', render: function (d) { return renderEngagementShell('eng-performance', 'Performance Score', 'Performance Score', d.value, d.delta); }, dataSource: function () { return { value: '142.8K', delta: '5.8%' }; }, defaultEnabled: true, defaultOrder: 9 },
    'eng-users':          { section: 'engagement-report', product: 'engagement', render: function (d) { return renderEngagementShell('eng-users',       'Total Users by Store', 'Total Users', d.value, d.delta); }, dataSource: function () { return { value: '12,460', delta: '3.1%' }; }, defaultEnabled: true, defaultOrder: 10 },
    'eng-sessions':       { section: 'engagement-report', product: 'engagement', render: function (d) { return renderEngagementShell('eng-sessions',    'Sessions', 'Sessions', d.value, d.delta); },                  dataSource: function () { return { value: '78,542', delta: '4.2%' }; }, defaultEnabled: true, defaultOrder: 11 },
    'eng-duration':       { section: 'engagement-report', product: 'engagement', render: function (d) { return renderEngagementShell('eng-duration',    'Avg. Duration', 'Duration', d.value, d.delta); },             dataSource: function () { return { value: '4m 12s', delta: '0.3%' }; }, defaultEnabled: true, defaultOrder: 12 }
  };

  // Helper for dashboard-app — list entries by mode + saved order
  window.getDashboardCells = function (mode, savedOrder) {
    var entries = Object.keys(window.CELL_REGISTRY).map(function (id) {
      return Object.assign({ storyId: id }, window.CELL_REGISTRY[id]);
    });

    // Mode filter
    if (mode === 'engagement')   entries = entries.filter(function (e) { return e.product === 'engagement'; });
    if (mode === 'distribution') entries = entries.filter(function (e) { return e.product === 'distribution'; });
    // 'combined' = no filter

    // Order: saved → defaultOrder
    if (savedOrder && savedOrder.length) {
      var byId = {};
      entries.forEach(function (e) { byId[e.storyId] = e; });
      var ordered = savedOrder.map(function (id) { return byId[id]; }).filter(Boolean);
      // Append any cells not in savedOrder (new since save)
      entries.forEach(function (e) { if (savedOrder.indexOf(e.storyId) === -1) ordered.push(e); });
      return ordered;
    }
    return entries.sort(function (a, b) { return a.defaultOrder - b.defaultOrder; });
  };
})();
