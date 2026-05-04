/**
 * Distribution Tab Feature
 * Renders all 3 sections: Media Buy, Store Visitation, Traffic Share
 */

(function() {
  'use strict';

  const D = DistributionData;
  let elements = {};
  let charts = {};

  // ── Tree Table State ──
  let distTreeState = {
    expandedCreatives: {},
    moreDataEnabled: false,
    sortColumn: 'visits',
    sortDirection: 'desc'
  };

  // ── Visitation View State ──
  let visitationView = 'current';     // 'current' | 'trend'
  let donutFilterSegment = null;       // null | 'zero_prev' | 'one_three' | 'four_plus'
  let _trendViewInitialized = false;

  // Helper: parse name and region from label (e.g. "Holiday Steak — South FL")
  function parseLabel(cr) {
    const full = cr.label || cr.notes || '';
    const parts = full.split(' — ');
    return { name: parts[0] || full, region: parts[1] || '' };
  }

  // ========================================
  // Initialization
  // ========================================

  function init() {
    try {
      initContext();
      cacheElements();
      bindEvents();
      renderAll();
      initCharts();
      console.log('Distribution tab initialized');
    } catch (error) {
      console.error('Failed to initialize distribution:', error);
    }
  }

  // Update context bar with Distribution data — reflects current entity selection
  function initContext() {
    const rc = D.retailerConfig;
    const ctx = D.context;

    const dateValue = document.getElementById('context-date-value');
    const dateSub = document.getElementById('context-date-sub');
    const entityBreadcrumb = document.getElementById('context-entity-breadcrumb');
    const entityValue = document.getElementById('context-entity-value');
    const entitySub = document.getElementById('context-entity-sub');

    // Date context
    if (ctx.flightWeek === 'all') {
      var weeks = D.flightWeeks;
      var firstWk = weeks[0];
      var lastWk = weeks[weeks.length - 1];
      if (dateValue) dateValue.textContent = firstWk.label + ' – ' + lastWk.label;
      if (dateSub) dateSub.textContent = fmtDateRange(firstWk.start) + ' – ' + fmtDateRange(lastWk.end);
    } else {
      var week = D.flightWeeks.find(function(w) { return w.id === ctx.flightWeek; });
      if (week) {
        if (dateValue) dateValue.textContent = week.label;
        if (dateSub) dateSub.textContent = fmtDateRange(week.start) + ' – ' + fmtDateRange(week.end);
      }
    }

    // Multi-week badge
    const dateCard = document.getElementById('date-selector');
    if (dateCard) {
      dateCard.classList.toggle('context-card--multiweek', ctx.flightWeek === 'all');
    }

    // Entity context
    var entityStoreCount = D.entities.getStoresForEntity(ctx.entityId, ctx.entityLevel).length;
    var levelLabel = ctx.entityLevel === 'all' ? 'BRAND'
      : ctx.entityLevel === 'brand' ? 'SUB-BRAND'
      : ctx.entityLevel === 'sub-brand' ? 'GROUP'
      : 'STORE';
    var entityName = ctx.entityLevel === 'all' ? rc.name : ctx.entityName;
    var entitySubText = entityStoreCount + ' store' + (entityStoreCount !== 1 ? 's' : '');
    if (ctx.entityLevel === 'all') entitySubText += ' · ' + rc.pilotLabel;

    if (entityBreadcrumb) entityBreadcrumb.textContent = levelLabel;
    if (entityValue) entityValue.textContent = entityName;
    if (entitySub) entitySub.textContent = entitySubText;

    // Build date string for section subtitles
    var dateStr;
    if (ctx.flightWeek === 'all') {
      var weeks = D.flightWeeks;
      dateStr = weeks[0].label + ' – ' + weeks[weeks.length - 1].label
        + ' (' + fmtDateRange(weeks[0].start) + ' – ' + fmtDateRange(weeks[weeks.length - 1].end) + ')';
    } else {
      var wk = D.flightWeeks.find(function(w) { return w.id === ctx.flightWeek; });
      dateStr = wk ? wk.label + ' (' + fmtDateRange(wk.start) + ' – ' + fmtDateRange(wk.end) + ')' : '';
    }
    updateSectionSubtitles(entityName, dateStr);
  }

  function updateSectionSubtitles(entityName, dateStr) {
    ['visitation', 'perf', 'traffic', 'media'].forEach(function(key) {
      var eEl = document.getElementById('subtitle-entity-' + key);
      var dEl = document.getElementById('subtitle-date-' + key);
      if (eEl) eEl.textContent = entityName;
      if (dEl) dEl.textContent = dateStr;
    });
    // Demographics spans (already in HTML)
    var demoEntity = document.getElementById('demo-entity-name');
    var demoDate   = document.getElementById('demo-date-range');
    if (demoEntity) demoEntity.textContent = entityName;
    if (demoDate)   demoDate.textContent   = dateStr;
  }

  function cacheElements() {
    elements = {
      videoKpis: document.getElementById('video-kpis'),
      visitationHero: document.getElementById('visitation-hero'),
      crossoverDetail: document.getElementById('crossover-detail'),
      spotlightCards: document.getElementById('spotlight-cards'),
      donutLegend: document.getElementById('donut-legend'),
      segmentDetailCards: document.getElementById('segment-detail-cards'),
      trafficHero: document.getElementById('traffic-hero'),
      leaderboardTable: document.getElementById('leaderboard-table'),
      sectionNav: document.getElementById('section-nav')
    };
  }

  function bindEvents() {
    // Section nav
    document.querySelectorAll('.section-nav__link').forEach(link => {
      link.addEventListener('click', handleSectionNavClick);
    });

    // Store group toggle + leaderboard header sort
    var groupToggle = document.getElementById('store-group-toggle');
    if (groupToggle) groupToggle.addEventListener('change', handleGroupToggle);
    bindLeaderboardHeaderSort();

    // Scroll spy for section nav
    window.addEventListener('scroll', handleScrollSpy, { passive: true });
  }

  // ========================================
  // Render All Sections
  // ========================================

  function renderAll() {
    renderMediaKpis();
    renderCreativePanel();
    renderVideoKpis();
    renderVisitationKpis();
    renderCrossoverDetail();
    renderSpotlightCards();
    renderTrafficKpis();
    /* renderTrafficLeaderboardPreview removed — Top Stores preview deleted from Overview */
    updateRetailerLabels();
  }

  // ========================================
  // Formatting Helpers
  // ========================================

  function fmtCurrency(val) {
    return '$' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function fmtNumber(val) {
    return val.toLocaleString('en-US');
  }

  function fmtPct(val) {
    return val.toFixed(2) + '%';
  }

  function fmtPp(val) {
    const sign = val >= 0 ? '+' : '';
    return sign + val.toFixed(1) + ' pp';
  }
  function fmtDateRange(dateStr) {
    // '2025-12-10' → 'Dec 10, 2025'
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  // ========================================
  // KPI Tile Builder
  // ========================================

  function kpiTile(label, value, opts = {}) {
    const primaryClass = opts.primary ? 'kpi-tile--primary' : '';
    const trendHtml = opts.trend !== undefined
      ? `<span class="kpi-trend ${opts.trend >= 0 ? 'kpi-trend--up' : 'kpi-trend--down'}">
           <span class="material-symbols-outlined">${opts.trend >= 0 ? 'trending_up' : 'trending_down'}</span>
           ${opts.trendLabel || ''}
         </span>`
      : '';

    return `
      <div class="kpi-tile ${primaryClass}">
        <div class="kpi-label">${label}</div>
        <div class="kpi-value">${value}</div>
        ${trendHtml}
      </div>
    `;
  }

  // ========================================
  // Section 1: Media Buy Metrics
  // ========================================

  function renderMediaHero() {
    const el = document.getElementById('media-stat-strip');
    if (!el) return;

    const metrics = D.mediaBuyMetrics;
    const m = metrics.summary;
    if (!m) return;

    // D7 proposed: CTR as hero (replaces Impressions). Real data from m.ctr.
    const trend = metrics.weeklyTrend;
    let trendHtml = '';
    if (trend.length >= 2) {
      const first = trend[0];
      const last = trend[trend.length - 1];
      const firstCtr = first.impressions > 0 ? (first.clicks / first.impressions) * 100 : 0;
      const lastCtr = last.impressions > 0 ? (last.clicks / last.impressions) * 100 : 0;
      const delta = lastCtr - firstCtr;
      const cls = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
      const icon = delta > 0 ? 'trending_up' : delta < 0 ? 'trending_down' : 'trending_flat';
      trendHtml = `<span class="stat-strip__trend stat-strip__trend--${cls}"><span class="material-symbols-outlined">${icon}</span>${delta >= 0 ? '+' : ''}${delta.toFixed(2)}pp</span>`;
    }

    el.innerHTML = `
      <div class="stat-strip__cards">
        <div class="stat-strip__item">
          <span class="stat-strip__label">CTR <span class="stat-strip__proposed-badge">PROPOSED</span></span>
          <div class="stat-strip__value-row">
            <span class="stat-strip__value">${m.ctr}%</span>
            ${trendHtml}
          </div>
        </div>
      </div>
    `;
  }

  function renderCreativeList() {
    const el = document.getElementById('creative-list');
    if (!el) return;

    const allRecords = D.creativeRecords;
    // Filter out creatives with no data at current entity level
    const records = allRecords.filter(cr => cr.metrics !== null);
    if (!records.length) {
      el.innerHTML = '<div class="dist-tree-empty">No variants or analytics data are found for this entity.</div>';
      return;
    }

    // Phase 3 step 5+6+7: dist-chip-selector + view-toggle (Chips | Table).
    // Default sort: visits desc. Sort dropdown removed (step 7); table column
    // headers carry sort affordance once Table view becomes interactive.
    // DP16.1 rank parity: every chip carries .creative-card__rank with the
    // dataset rank (post-sort) — matches the same row's rank in Table view.

    // Default sort: visits desc. Direction toggle below flips asc/desc on demand.
    let _sortDir = 'desc';
    function applySort(items) {
      const sortVal = cr => (cr.metrics ? cr.metrics.gross_visits || 0 : 0);
      return items.slice().sort((a, b) => _sortDir === 'desc' ? (sortVal(b) - sortVal(a)) : (sortVal(a) - sortVal(b)));
    }
    let sorted = records
      .map(cr => ({ ...cr, _origIndex: allRecords.indexOf(cr) }));
    // Stable desc-by-visits rank — survives sort-direction flips so the
    // "#1" chip is always the top performer, not whatever currently sits first.
    {
      const descRanked = sorted.slice().sort((a, b) => (b.metrics?.gross_visits || 0) - (a.metrics?.gross_visits || 0));
      descRanked.forEach((cr, i) => { cr._descRank = i + 1; });
    }
    sorted = applySort(sorted);

    const CHIP_CAP = 50;

    function parseLabel(cr) {
      const full = cr.label || cr.notes || '';
      const parts = full.split(' — ');
      return { name: parts[0] || full, region: parts[1] || '' };
    }

    function escapeHTML(s) {
      return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function chipHtml(cr, rank) {
      // Canonical rich .creative-chip card (lifted from Visitation pattern).
      // DP16.1 rank badge in header; thumb prefers file_url, falls back to
      // type icon or initials. Click → viewVariantDetails detail sidebar.
      const typeIcon = cr.creative_type === 'video' ? 'movie' : (cr.creative_type === 'gif' ? 'gif_box' : 'image');
      const { name, region } = parseLabel(cr);
      const initials = name.split(/\s+/).map(w => w[0] || '').join('').slice(0, 2).toUpperCase();
      const hasImg = !!cr.file_url;
      const thumbInner = hasImg
        ? `<img src="${escapeHTML(cr.file_url)}" alt="${escapeHTML(name)}" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'creative-chip__thumb-initials',textContent:'${initials}'}))">`
        : (cr.creative_type === 'video'
            ? '<span class="material-symbols-outlined">play_arrow</span>'
            : `<span class="creative-chip__thumb-initials">${initials}</span>`);
      const meta = `${(cr.creative_type || '').toUpperCase() || '—'}${cr.dimensions ? ' · ' + escapeHTML(cr.dimensions) : ''}`;
      const storesLine = cr.store_group ? `<span class="creative-chip__stores">${cr.store_group.length} stores</span>` : '';
      return `<button type="button" class="creative-chip" data-orig-index="${cr._origIndex}" data-search="${escapeHTML(name.toLowerCase())}" title="${escapeHTML(name)}">
        <div class="creative-chip__header">
          <div class="creative-chip__thumb">${thumbInner}</div>
          <span class="creative-chip__rank">${rank}</span>
        </div>
        <span class="creative-chip__name">${escapeHTML(name)}</span>
        <span class="creative-chip__meta">${meta}</span>
        ${storesLine}
      </button>`;
    }

    function tableHtml(items) {
      const rows = items.map((cr) => {
        const { name, region } = parseLabel(cr);
        const m = cr.metrics || {};
        return `<tr data-orig-index="${cr._origIndex}">
          <td class="col-num">${cr._descRank}</td>
          <td class="col-creative">${escapeHTML(name)}${region ? ' <span style="color:var(--p-text-color-secondary);">— ' + escapeHTML(region) + '</span>' : ''}</td>
          <td class="col-stores">${cr.store_group ? cr.store_group.length : 0}</td>
          <td class="col-ctr">${m.ctr != null ? fmtPct(m.ctr) : '—'}</td>
          <td class="col-visits">${m.gross_visits != null ? fmtNumber(m.gross_visits) : '—'}</td>
          <td class="col-cpm">${m.cpm != null ? fmtCurrency(m.cpm) : '—'}</td>
          <td class="col-cpc">${m.cpc != null ? fmtCurrency(m.cpc) : '—'}</td>
          <td class="col-spend">${m.spend != null ? fmtCurrency(m.spend) : '—'}</td>
        </tr>`;
      }).join('');
      return `<table class="dist-tree-table">
        <thead><tr>
          <th class="col-num">#</th>
          <th class="col-creative">Creative</th>
          <th class="col-stores">Stores</th>
          <th class="col-ctr">CTR</th>
          <th class="col-visits">Visits</th>
          <th class="col-cpm">CPM</th>
          <th class="col-cpc">CPC</th>
          <th class="col-spend">Spend</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
    }

    el.className = 'creative-ranked';
    el.innerHTML = `
      <div class="creative-ranked__toolbar">
        <input type="search" class="creative-ranked__filter p-inputtext" id="creative-filter" placeholder="Filter creatives…" aria-label="Filter creatives">
        <span class="creative-ranked__total" id="creative-total">${sorted.length} creative${sorted.length === 1 ? '' : 's'}</span>
        <div class="creative-sort-direction" role="group" aria-label="Sort direction (visits)">
          <button type="button" class="creative-sort-direction__btn active" data-cv-sort="desc" title="Sort by visits, high to low" aria-pressed="true"><span class="material-symbols-outlined">south</span> High to Low</button>
          <button type="button" class="creative-sort-direction__btn" data-cv-sort="asc" title="Sort by visits, low to high" aria-pressed="false"><span class="material-symbols-outlined">north</span> Low to High</button>
        </div>
        <div class="view-toggle" role="tablist" aria-label="Creative view mode">
          <button type="button" class="view-toggle__btn active" data-cv-mode="chips" role="tab" aria-selected="true">
            <span class="material-symbols-outlined">view_module</span> Chips
          </button>
          <button type="button" class="view-toggle__btn" data-cv-mode="table" role="tab" aria-selected="false">
            <span class="material-symbols-outlined">table_rows</span> Table
          </button>
        </div>
      </div>
      <div class="creative-chips-row">
      <button type="button" class="creative-chip creative-chip--all creative-chip--active" id="creative-all-chip" aria-pressed="true" title="All Media Campaigns">
        <div class="creative-chip__header">
          <div class="creative-chip__thumb"><span class="material-symbols-outlined">grid_view</span></div>
          <span class="creative-chip__rank creative-chip__rank--all">All</span>
        </div>
        <span class="creative-chip__name">All Media Campaigns</span>
        <span class="creative-chip__meta">All campaigns combined</span>
      </button>
      <div class="creative-chips creative-chips--scroll" id="creative-chips-strip" data-cv-pane="chips">
        ${sorted.slice(0, CHIP_CAP).map(cr => chipHtml(cr, cr._descRank)).join('')}
      </div>
      </div>
      <div class="dist-tree-data-grid" id="creative-table-view" data-cv-pane="table" style="display:none;"></div>
    `;

    // Chip click → viewVariantDetails (existing detail panel).
    el.querySelectorAll('.creative-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const idx = parseInt(chip.dataset.origIndex, 10);
        if (typeof window.viewVariantDetails === 'function') window.viewVariantDetails(idx);
      });
    });

    // Filter — searches ALL creatives, not just visible chips. Re-renders chip
    // strip with matches; CHIP_CAP still applies to the result set.
    const filterEl = el.querySelector('#creative-filter');
    const totalEl = el.querySelector('#creative-total');
    const chipsEl = el.querySelector('#creative-chips-strip');
    if (window.ChipCarousel && chipsEl) ChipCarousel.init(chipsEl);

    // Default inline-detail state.
    // - 1 creative: hide "All Media Campaigns" chip, auto-select the single chip.
    // - >1: show All chip active, render aggregate.
    setTimeout(() => {
      const allChip = document.getElementById('creative-all-chip');
      ensureAllChipWired();
      if (sorted.length === 1) {
        if (allChip) allChip.style.display = 'none';
        if (typeof window.viewVariantDetails === 'function') {
          window.viewVariantDetails(sorted[0]._origIndex != null ? sorted[0]._origIndex : 0);
        }
      } else {
        if (allChip) allChip.style.display = '';
        setActiveChip(null);
        renderAllCampaignsAggregate();
      }
    }, 0);

    if (filterEl) {
      filterEl.addEventListener('input', e => {
        const q = e.target.value.trim().toLowerCase();
        const matches = q ? sorted.filter(cr => parseLabel(cr).name.toLowerCase().includes(q)) : sorted;
        chipsEl.innerHTML = matches.slice(0, CHIP_CAP).map((cr, i) => chipHtml(cr, cr._descRank)).join('');
        if (window.ChipCarousel) ChipCarousel.refresh(chipsEl);
        totalEl.textContent = `${matches.length} match${matches.length === 1 ? '' : 'es'}${matches.length > CHIP_CAP ? ' (showing ' + CHIP_CAP + ')' : ''}`;
        chipsEl.querySelectorAll('.creative-chip').forEach(chip => {
          chip.addEventListener('click', () => {
            const idx = parseInt(chip.dataset.origIndex, 10);
            if (typeof window.viewVariantDetails === 'function') window.viewVariantDetails(idx);
          });
        });
        // Re-build table on next toggle since data set changed.
        tableBuilt = false;
        if (tableEl && tableEl.style.display !== 'none') renderTable();
      });
    }

    // Sort direction toggle (High → Low / Low → High). Re-applies sort,
    // re-renders chip strip + invalidates table.
    el.querySelectorAll('.creative-sort-direction__btn').forEach(btn => {
      btn.addEventListener('click', () => {
        _sortDir = btn.dataset.cvSort;
        el.querySelectorAll('.creative-sort-direction__btn').forEach(b => {
          const on = b === btn;
          b.classList.toggle('active', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        sorted = applySort(sorted);
        const q = filterEl ? filterEl.value.trim().toLowerCase() : '';
        const matches = q ? sorted.filter(cr => parseLabel(cr).name.toLowerCase().includes(q)) : sorted;
        chipsEl.innerHTML = matches.slice(0, CHIP_CAP).map((cr, i) => chipHtml(cr, cr._descRank)).join('');
        if (window.ChipCarousel) ChipCarousel.refresh(chipsEl);
        chipsEl.querySelectorAll('.creative-chip').forEach(chip => {
          chip.addEventListener('click', () => {
            const idx = parseInt(chip.dataset.origIndex, 10);
            if (typeof window.viewVariantDetails === 'function') window.viewVariantDetails(idx);
          });
        });
        tableBuilt = false;
        if (tableEl && tableEl.style.display !== 'none') renderTable();
      });
    });

    // View-toggle (Chips | Table). Table lazy-renders on first activation.
    let tableBuilt = false;
    const chipsPane = el.querySelector('.creative-chips-row') || el.querySelector('[data-cv-pane="chips"]');
    const inlineDetailEl = document.getElementById('creative-inline-detail');
    const tableEl = el.querySelector('#creative-table-view');
    function renderTable() {
      const q = filterEl ? filterEl.value.trim().toLowerCase() : '';
      const items = q ? sorted.filter(cr => parseLabel(cr).name.toLowerCase().includes(q)) : sorted;
      tableEl.innerHTML = `<div class="dist-tree-table-wrap">${tableHtml(items)}</div>`;
      tableBuilt = true;
    }
    el.querySelectorAll('.view-toggle__btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.cvMode;
        el.querySelectorAll('.view-toggle__btn').forEach(b => {
          const on = b === btn;
          b.classList.toggle('active', on);
          b.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        if (mode === 'table') {
          if (!tableBuilt) renderTable();
          chipsPane.style.display = 'none';
          if (inlineDetailEl) inlineDetailEl.style.display = 'none';
          tableEl.style.display = '';
        } else {
          tableEl.style.display = 'none';
          chipsPane.style.display = '';
          if (inlineDetailEl) inlineDetailEl.style.display = '';
        }
      });
    });
  }


  function renderDeliveryTrends() {
    const el = document.getElementById('trend-cards');
    if (!el) return;

    const trend = D.mediaBuyMetrics.weeklyTrend;
    if (!trend.length) return;

    const latest = trend[trend.length - 1];

    el.innerHTML = `
      <div class="trend-card">
        <div class="trend-card__header">
          <span class="trend-card__label">Impressions</span>
          <span class="trend-card__value">${fmtNumber(latest.impressions)}</span>
        </div>
        <div id="sparkline-impressions" style="height: 60px;"></div>
      </div>
      <div class="trend-card">
        <div class="trend-card__header">
          <span class="trend-card__label">Clicks</span>
          <span class="trend-card__value">${fmtNumber(latest.clicks)}</span>
        </div>
        <div id="sparkline-clicks" style="height: 60px;"></div>
      </div>
      <div class="trend-card">
        <div class="trend-card__header">
          <span class="trend-card__label">CTR</span>
          <span class="trend-card__value">${fmtPct(latest.ctr)}</span>
        </div>
        <div id="sparkline-ctr" style="height: 60px;"></div>
      </div>
      <div class="trend-card">
        <div class="trend-card__header">
          <span class="trend-card__label">Cost Per Visit</span>
          <span class="trend-card__value">${fmtCurrency(latest.cost_per_visit)}</span>
        </div>
        <div id="sparkline-cpv" style="height: 60px;"></div>
      </div>
    `;
  }

  function initSparklines() {
    const trend = D.mediaBuyMetrics.weeklyTrend;
    if (!trend.length) return;

    const weeks = trend.map(w => D.getWeekLabel(w.week));

    function sparkline(id, data, color) {
      const el = document.getElementById(id);
      if (!el) return;
      const chart = echarts.init(el);
      charts[id] = chart;
      chart.setOption({
        grid: { left: 0, right: 0, top: 4, bottom: 0 },
        xAxis: { type: 'category', data: weeks, show: false },
        yAxis: { type: 'value', show: false },
        tooltip: { trigger: 'axis', formatter: '{b}: {c}' },
        series: [{
          type: 'line',
          data: data,
          smooth: true,
          symbol: 'circle',
          symbolSize: 5,
          lineStyle: { color: color, width: 2 },
          itemStyle: { color: color },
          areaStyle: { color: color + '18' }
        }]
      });
    }

    sparkline('sparkline-impressions', trend.map(w => w.impressions), '#3B82F6');
    sparkline('sparkline-clicks', trend.map(w => w.clicks), '#22c55e');
    sparkline('sparkline-ctr', trend.map(w => w.ctr), '#6366f1');
    sparkline('sparkline-cpv', trend.map(w => w.cost_per_visit), '#ef4444');
  }

  // ========================================
  // Variant Tree Table — replaces renderVariantPanels()
  // ========================================

  function renderVariantPanels() { renderVariantTreeTable(); }

  function renderVariantTreeTable() {
    const wrapper = document.getElementById('variant-panels');
    const thead = document.getElementById('dist-tree-head');
    const tbody = document.getElementById('dist-tree-body');
    if (!wrapper || !thead || !tbody) return;

    const ctx = D.context;
    const isStoreLevel = ctx.entityLevel === 'store';

    // Get creatives, filter out zero-data ones
    const allRecords = D.creativeRecords;
    const records = allRecords.filter(cr => cr.metrics !== null);

    // Empty state
    if (!records.length) {
      thead.innerHTML = '';
      tbody.innerHTML = `<tr><td colspan="15" class="dist-tree-empty">No variants or analytics data are found for this store.</td></tr>`;
      return;
    }

    // Sort
    const sortKey = distTreeState.sortColumn;
    const sortDir = distTreeState.sortDirection;
    const sorted = records.slice().sort((a, b) => {
      const aM = a.metrics || {};
      const bM = b.metrics || {};
      let aVal, bVal;
      switch (sortKey) {
        case 'ctr':    aVal = aM.ctr || 0;            bVal = bM.ctr || 0;            break;
        case 'visits': aVal = aM.gross_visits || 0;    bVal = bM.gross_visits || 0;    break;
        case 'cpv':    aVal = aM.cost_per_visit || 0;  bVal = bM.cost_per_visit || 0;  break;
        case 'cpm':    aVal = aM.cpm || 0;             bVal = bM.cpm || 0;             break;
        case 'cpc':    aVal = aM.cpc || 0;             bVal = bM.cpc || 0;             break;
        case 'impressions': aVal = aM.impressions || 0; bVal = bM.impressions || 0;     break;
        case 'clicks': aVal = aM.clicks || 0;          bVal = bM.clicks || 0;          break;
        case 'budget':
        case 'spend': aVal = aM.spend || aM.budget || 0; bVal = bM.spend || bM.budget || 0; break;
        case 'stores': aVal = a.store_group.length;    bVal = b.store_group.length;    break;
        default:       aVal = aM.gross_visits || 0;    bVal = bM.gross_visits || 0;
      }
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });

    // Render header
    function sortTh(label, col, cssClass) {
      const isActive = distTreeState.sortColumn === col;
      return `<th class="${cssClass} th-sortable ${isActive ? 'th-sort--active' : ''}" data-col="${col}">${label} <span class="material-symbols-outlined th-sort-icon">${getSortIcon(col)}</span></th>`;
    }

    thead.innerHTML = `<tr>
      <th class="col-num">#</th>
      <th class="col-thumb"></th>
      <th class="col-creative">Creative</th>
      <th class="col-type">Type</th>
      ${!isStoreLevel ? sortTh('Stores', 'stores', 'col-stores') : ''}
      ${sortTh('CTR', 'ctr', 'col-ctr')}
      ${sortTh('Visits', 'visits', 'col-visits')}
      ${sortTh('CPV', 'cpv', 'col-cpv')}
      ${sortTh('CPM', 'cpm', 'col-cpm')}
      ${sortTh('CPC', 'cpc', 'col-cpc')}
      ${sortTh('Impr', 'impressions', 'col-impressions')}
      ${sortTh('Clicks', 'clicks', 'col-clicks')}
      ${sortTh('Spend', 'spend', 'col-spend')}
      <th class="col-vpt">V/1K</th>
      <th class="col-link">Link</th>
    </tr>`;

    // Render rows
    let rowsHtml = '';
    sorted.forEach((cr, idx) => {
      const m = cr.metrics;
      const { name, region } = parseLabel(cr);
      const cid = cr.creative_id;
      const isExpanded = !!distTreeState.expandedCreatives[cid];
      const isVideo = cr.creative_type === 'video';
      const typeBadge = `<span class="type-badge type-badge--${cr.creative_type}">${cr.creative_type.toUpperCase()}</span>`;
      const targetUrl = cr.target_url || '';

      // Parent row
      const typeIcon = cr.creative_type === 'video' ? 'movie' : (cr.creative_type === 'gif' ? 'gif_box' : 'image');

      rowsHtml += `<tr class="dist-tree-row--parent" data-creative-id="${cid}" onclick="toggleDistTreeRow('${cid}')">
        <td class="col-num"><span class="row-number">${idx + 1}</span></td>
        <td class="col-thumb">
          <div class="tree-thumb">
            <span class="material-symbols-outlined">${typeIcon}</span>
          </div>
        </td>
        <td class="col-creative tree-indent-0">
          <div class="tree-name-cell">
            ${!isStoreLevel ? `<button class="tree-toggle ${isExpanded ? '' : 'collapsed'}" onclick="toggleDistTreeRow('${cid}'); event.stopPropagation();">
              <span class="material-symbols-outlined">expand_more</span>
            </button>` : '<span class="tree-toggle-placeholder"></span>'}
            <div class="creative-name-block">
              <span class="creative-label">${name}</span>
              ${region ? `<span class="creative-region">${region}</span>` : ''}
            </div>
          </div>
        </td>
        <td class="col-type">${typeBadge}</td>
        ${!isStoreLevel ? `<td class="col-stores">${cr.store_group.length}</td>` : ''}
        <td class="col-ctr">${m ? fmtPct(m.ctr) : '—'}</td>
        <td class="col-visits">${m ? fmtNumber(m.gross_visits) : '—'}</td>
        <td class="col-cpv">${m ? fmtCurrency(m.cost_per_visit) : '—'}</td>
        <td class="col-cpm">${m ? fmtCurrency(m.cpm) : '—'}</td>
        <td class="col-cpc">${m ? fmtCurrency(m.cpc) : '—'}</td>
        <td class="col-impressions">${m ? fmtNumber(m.impressions) : '—'}</td>
        <td class="col-clicks">${m ? fmtNumber(m.clicks) : '—'}</td>
        <td class="col-spend">${m ? fmtCurrency(m.spend || m.budget) : '—'}</td>
        <td class="col-vpt">${m ? m.visits_per_thousand.toFixed(1) : '—'}</td>
        <td class="col-link">${targetUrl ? `<a href="${targetUrl}" target="_blank" class="dist-tree-link" title="Target URL" onclick="event.stopPropagation();"><span class="material-symbols-outlined" style="font-size:16px;">open_in_new</span></a>` : ''}</td>
      </tr>`;

      // Child rows (store level has none)
      if (!isStoreLevel) {
        const storeRows = buildStoreRows(cr);
        storeRows.forEach(s => {
          // Each store gets a geo-targeted URL (append store param to creative URL)
          const storeUrl = targetUrl ? targetUrl + (targetUrl.includes('?') ? '&' : '?') + 'store=' + s.id : '';
          rowsHtml += `<tr class="dist-tree-row--child ${isExpanded ? '' : 'tree-row-hidden'}" data-parent="${cid}">
            <td class="col-num"></td>
            <td class="col-thumb"></td>
            <td class="col-creative tree-indent-1">
              <div class="tree-name-cell">
                <span class="tree-toggle-placeholder"></span>
                <span class="store-name">#${s.id} — ${s.city}</span>
              </div>
            </td>
            <td class="col-type"></td>
            <td class="col-stores"></td>
            <td class="col-ctr">${s.ctr}%</td>
            <td class="col-visits">${fmtNumber(s.visits)}</td>
            <td class="col-cpv">$${s.cpv}</td>
            <td class="col-cpm">$${s.cpm}</td>
            <td class="col-cpc">$${s.cpc}</td>
            <td class="col-impressions">${fmtNumber(s.impressions)}</td>
            <td class="col-clicks">${fmtNumber(s.clicks)}</td>
            <td class="col-spend">${fmtCurrency(s.spend || s.budget)}</td>
            <td class="col-vpt">${s.vpt}</td>
            <td class="col-link">${storeUrl ? `<a href="${storeUrl}" target="_blank" class="dist-tree-link" title="Store #${s.id} landing page" onclick="event.stopPropagation();"><span class="material-symbols-outlined" style="font-size:16px;">open_in_new</span></a>` : ''}</td>
          </tr>`;
        });

        // Video funnel detail row
        if (isVideo) {
          const v = D.videoEngagement;
          const totalCols = 15; // max columns (incl thumb), bumped for CPM+CPC
          rowsHtml += `<tr class="dist-tree-row--detail ${isExpanded ? '' : 'tree-row-hidden'}" data-parent="${cid}">
            <td colspan="${totalCols}">
              <div class="detail-content">
                <h4 style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--p-text-color); margin: 0 0 var(--p-spacing-3);">Video Funnel</h4>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--p-spacing-3);">
                  ${kpiTile('Complete Views', fmtNumber(v.video_complete_views))}
                  ${kpiTile('Completion Rate', v.video_completion_rate.toFixed(1) + '%')}
                  ${kpiTile('Avg Circular Time', v.avg_circular_time)}
                  ${kpiTile('Circular Views', fmtNumber(v.circular_views))}
                </div>
                <div id="video-funnel-chart-tree" style="height: 0; overflow: hidden;"></div>
              </div>
            </td>
          </tr>`;
        }
      }
    });

    tbody.innerHTML = rowsHtml;

    // Bind More Data toggle
    const toggle = document.getElementById('dist-more-data-toggle');
    if (toggle) {
      toggle.checked = distTreeState.moreDataEnabled;
      toggle.onchange = function(e) {
        distTreeState.moreDataEnabled = e.target.checked;
        wrapper.classList.toggle('more-data-enabled', e.target.checked);
      };
      // Apply current state
      wrapper.classList.toggle('more-data-enabled', distTreeState.moreDataEnabled);
    }

    // Bind sortable headers
    thead.querySelectorAll('.th-sortable').forEach(th => {
      th.onclick = function() {
        const col = this.dataset.col;
        if (distTreeState.sortColumn === col) {
          distTreeState.sortDirection = distTreeState.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
          distTreeState.sortColumn = col;
          distTreeState.sortDirection = 'desc';
        }
        renderVariantTreeTable();
      };
    });
  }

  function getSortIcon(col) {
    if (distTreeState.sortColumn !== col) return 'unfold_more';
    return distTreeState.sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  function buildStoreRows(cr) {
    return cr.store_group.map(storeId => {
      const ctx = D.context;
      const storeRecords = DistributionRecords.mediaRecords.filter(
        r => r.store_id === storeId && r.creative_id === cr.creative_id &&
        (ctx.flightWeek === 'all' || r.week_id === ctx.flightWeek)
      );
      if (!storeRecords.length) return null;
      const agg = storeRecords.reduce((acc, r) => {
        acc.impressions += r.impressions;
        acc.clicks += r.clicks;
        acc.budget += r.budget_allocated;
        acc.visits += r.gross_visits;
        return acc;
      }, { impressions: 0, clicks: 0, budget: 0, visits: 0 });

      const store = DistributionEntities.getStoreById(storeId);
      return {
        id: storeId.replace('store-', ''),
        storeId: storeId,
        city: store ? store.city : '',
        impressions: agg.impressions,
        clicks: agg.clicks,
        ctr: ((agg.clicks / agg.impressions) * 100).toFixed(2),
        visits: agg.visits,
        cpv: (agg.budget / agg.visits).toFixed(2),
        budget: agg.budget,
        // Pulse-aligned per-store metrics
        spend: agg.budget,
        cpm: ((agg.budget / agg.impressions) * 1000).toFixed(2),
        cpc: (agg.budget / Math.max(agg.clicks, 1)).toFixed(2),
        vpt: agg.impressions > 0 ? ((agg.visits / agg.impressions) * 1000).toFixed(1) : '0.0'
      };
    }).filter(Boolean);
  }

  // ========================================
  // Tree Table Actions (Export, Print, Share)
  // ========================================

  function initTreeTableActions() {
    const exportBtn = document.getElementById('dist-export-btn');
    const printBtn = document.getElementById('dist-print-btn');
    const shareBtn = document.getElementById('dist-share-btn');

    if (exportBtn) exportBtn.addEventListener('click', exportTreeTableCSV);
    if (printBtn) printBtn.addEventListener('click', printTreeTable);
    if (shareBtn) shareBtn.addEventListener('click', shareTreeTable);
  }

  function exportTreeTableCSV() {
    const records = D.creativeRecords.filter(cr => cr.metrics !== null);
    if (!records.length) return;

    const ctx = D.context;
    const isStoreLevel = ctx.entityLevel === 'store';
    const rows = [];

    // Header
    const header = ['#', 'Creative', 'Region', 'Type'];
    if (!isStoreLevel) header.push('Stores');
    header.push('CTR', 'Visits', 'CPV', 'Impressions', 'Clicks', 'Budget', 'V/1K', 'Link');
    rows.push(header.join(','));

    // Parent rows
    records.forEach((cr, idx) => {
      const m = cr.metrics;
      const { name, region } = parseLabel(cr);
      const row = [idx + 1, `"${name}"`, `"${region}"`, cr.creative_type.toUpperCase()];
      if (!isStoreLevel) row.push(cr.store_group.length);
      row.push(
        m ? fmtPct(m.ctr) : '',
        m ? m.gross_visits : '',
        m ? m.cost_per_visit.toFixed(2) : '',
        m ? m.impressions : '',
        m ? m.clicks : '',
        m ? m.budget.toFixed(2) : '',
        m ? m.visits_per_thousand.toFixed(1) : '',
        cr.target_url || ''
      );
      rows.push(row.join(','));

      // Child store rows
      if (!isStoreLevel) {
        const storeRows = buildStoreRows(cr);
        storeRows.forEach(s => {
          const storeRow = ['', `"#${s.id} — ${s.city}"`, '', ''];
          if (!isStoreLevel) storeRow.push('');
          storeRow.push(s.ctr + '%', s.visits, '$' + s.cpv, s.impressions, s.clicks, '', '', '');
          rows.push(storeRow.join(','));
        });
      }
    });

    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `media-buy-${ctx.entityName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function printTreeTable() {
    const table = document.querySelector('.dist-tree-data-grid');
    if (!table) return;

    // Expand all rows for print
    const hiddenRows = table.querySelectorAll('.tree-row-hidden');
    hiddenRows.forEach(r => r.classList.remove('tree-row-hidden'));

    // Show More Data columns
    table.classList.add('more-data-enabled');

    window.print();

    // Restore state after print
    setTimeout(() => {
      table.classList.toggle('more-data-enabled', distTreeState.moreDataEnabled);
      Object.keys(distTreeState.expandedCreatives).forEach(cid => {
        if (!distTreeState.expandedCreatives[cid]) {
          table.querySelectorAll(`[data-parent="${cid}"]`).forEach(r => r.classList.add('tree-row-hidden'));
        }
      });
      // Re-hide rows that weren't expanded
      D.creativeRecords.forEach(cr => {
        if (!distTreeState.expandedCreatives[cr.creative_id]) {
          table.querySelectorAll(`[data-parent="${cr.creative_id}"]`).forEach(r => r.classList.add('tree-row-hidden'));
        }
      });
    }, 500);
  }

  function shareTreeTable() {
    const ctx = D.context;
    const url = window.location.href;
    const text = `Distribution Media Buy — ${ctx.entityName}`;

    if (navigator.share) {
      navigator.share({ title: text, url: url }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        const btn = document.getElementById('dist-share-btn');
        if (btn) {
          const original = btn.innerHTML;
          btn.innerHTML = '<span class="material-symbols-outlined">check</span> Copied!';
          setTimeout(() => { btn.innerHTML = original; }, 2000);
        }
      });
    }
  }

  // Keep old function names as aliases for backward compat with shared code
  function renderMediaKpis() { renderMediaHero(); }
  function renderCreativePanel() { renderCreativeList(); }

  function renderVideoKpis() {
    if (!elements.videoKpis) return;
    const v = D.videoEngagement;
    elements.videoKpis.innerHTML = [
      kpiTile('Complete Views', fmtNumber(v.video_complete_views)),
      kpiTile('Completion Rate', v.video_completion_rate.toFixed(1) + '%'),
      kpiTile('Avg Circular Time', v.avg_circular_time),
      kpiTile('Circular Views', fmtNumber(v.circular_views))
    ].join('');
  }

  // ========================================
  // Section 2: Store Visitation
  // ========================================

  function renderVisitationKpis() {
    const el = document.getElementById('visitation-stat-strip');
    if (!el) return;

    const vm = D.visitationMetrics;
    const latest = vm.summary;
    if (!latest) return;

    const total = latest.gross_visits;

    // D7 proposed: New Shopper % as hero (replaces Gross Visits). Real data.
    const newShopperPct = total > 0 ? ((latest.visits_zero_prev / total) * 100).toFixed(1) : '0.0';

    let trendHtml = '';
    const trend = vm.weeklyTrend;
    if (trend.length >= 2) {
      const first = trend[0];
      const last = trend[trend.length - 1];
      const firstPct = first.gross_visits > 0 ? (first.visits_zero_prev / first.gross_visits) * 100 : 0;
      const lastPct = last.gross_visits > 0 ? (last.visits_zero_prev / last.gross_visits) * 100 : 0;
      const delta = lastPct - firstPct;
      const cls = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
      const icon = delta > 0 ? 'trending_up' : delta < 0 ? 'trending_down' : 'trending_flat';
      trendHtml = `<span class="stat-strip__trend stat-strip__trend--${cls}"><span class="material-symbols-outlined">${icon}</span>${delta >= 0 ? '+' : ''}${delta.toFixed(1)}pp</span>`;
    }

    el.innerHTML = `
      <div class="stat-strip__cards">
        <div class="stat-strip__item">
          <span class="stat-strip__label">New Shopper % <span class="stat-strip__proposed-badge">PROPOSED</span></span>
          <div class="stat-strip__value-row">
            <span class="stat-strip__value">${newShopperPct}%</span>
            ${trendHtml}
          </div>
        </div>
      </div>
    `;
  }

  function renderStorePerfHero() {
    const el = document.getElementById('store-perf-stat-strip');
    if (!el) return;

    const vm = D.visitationMetrics;
    const latest = vm.summary;
    if (!latest) return;

    const ctx = D.context;
    const storeCount = Math.max(1, D.entities.getStoresForEntity(ctx.entityId, ctx.entityLevel).length);
    const visitsPerStore = Math.round(latest.gross_visits / storeCount);

    el.innerHTML = `
      <div class="stat-strip__cards">
        <div class="stat-strip__item">
          <span class="stat-strip__label">Visits / Store <span class="stat-strip__proposed-badge">PROPOSED</span></span>
          <div class="stat-strip__value-row">
            <span class="stat-strip__value">${fmtNumber(visitsPerStore)}</span>
          </div>
        </div>
      </div>
    `;
  }

  function renderCrossoverDetail() {
    if (!elements.crossoverDetail) return;

    // Aggregate crossover to brand level
    var brandMap = {};
    D.competitiveCrossover.forEach(function (comp) {
      var key = comp.competitor_name;
      if (!brandMap[key]) {
        brandMap[key] = {
          name: key,
          crossover_pct: comp.crossover_pct,
          total_visits: comp.crossover_visits_zero_prev + comp.crossover_visits_one_three + comp.crossover_visits_four_plus,
          trend: comp.trend || []
        };
      } else {
        brandMap[key].crossover_pct = Math.max(brandMap[key].crossover_pct, comp.crossover_pct);
        brandMap[key].total_visits += comp.crossover_visits_zero_prev + comp.crossover_visits_one_three + comp.crossover_visits_four_plus;
      }
    });

    // Merge threat data (locations per brand)
    var threats = D.primaryThreats;
    threats.forEach(function (t) {
      if (brandMap[t.brand]) {
        brandMap[t.brand].stores_threatened = t.store_count;
        brandMap[t.brand].locations = t.locations || [];
      }
    });

    var allBrands = Object.values(brandMap).sort(function (a, b) { return b.crossover_pct - a.crossover_pct; });

    // Top 5 + "All Other" rollup
    var top5 = allBrands.slice(0, 5);
    var rest = allBrands.slice(5);
    if (rest.length > 0) {
      var allOther = {
        name: 'All Other',
        crossover_pct: 0,
        total_visits: 0,
        trend: [],
        stores_threatened: 0,
        locations: []
      };
      rest.forEach(function (b) {
        allOther.crossover_pct += b.crossover_pct;
        allOther.total_visits += b.total_visits;
        allOther.stores_threatened += (b.stores_threatened || 0);
      });
      allOther.crossover_pct = parseFloat(allOther.crossover_pct.toFixed(1));
      top5.push(allOther);
    }
    var brands = top5;

    // Color map for competitor pips (matches crossover chart)
    // Must match CROSSOVER_COLORS (chart) — plan item 9.
    var CROSSOVER_COLORS_TABLE = ['#E07850', '#A8BF6E', '#2AADDB', '#D4A574', '#9B7FD4', '#9ca3af'];

    // Tree table — same design pattern as media buy
    var html = '<table class="dist-tree-table comp-tree-table">' +
      '<thead><tr>' +
        '<th>Competitor</th>' +
        '<th style="text-align:right;">Crossover %</th>' +
        '<th style="text-align:right;">Visits</th>' +
        '<th style="text-align:right;">Stores Threatened</th>' +
        '<th style="text-align:right;">Trend</th>' +
      '</tr></thead><tbody>';

    brands.forEach(function (brand, brandIdx) {
      var brandKey = brand.name.toLowerCase().replace(/[^a-z]/g, '');
      var hasChildren = brand.locations && brand.locations.length > 0;

      // WoW trend
      var t = brand.trend;
      var wowChange = null;
      if (t.length >= 2) {
        wowChange = parseFloat((t[t.length - 1] - t[t.length - 2]).toFixed(1));
      }
      var trendClass = wowChange > 0 ? 'trend--up' : wowChange < 0 ? 'trend--down' : 'trend--flat';
      var trendIcon = wowChange > 0 ? 'trending_up' : wowChange < 0 ? 'trending_down' : 'trending_flat';
      var trendText = wowChange != null ? ((wowChange >= 0 ? '+' : '') + wowChange + ' pp') : '—';

      // Color pip for this brand
      var pipColor = brandIdx < CROSSOVER_COLORS_TABLE.length ? CROSSOVER_COLORS_TABLE[brandIdx] : '#9ca3af';
      var pipHtml = '<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' + pipColor + ';margin-right:6px;vertical-align:middle;flex-shrink:0;"></span>';

      // Parent row
      html += '<tr class="dist-tree-row--parent" data-brand="' + brandKey + '">' +
        '<td class="tree-indent-0">' +
          '<div class="tree-name-cell">' +
            (hasChildren ? '<span class="tree-toggle"><span class="material-symbols-outlined">expand_more</span></span>' : '<span style="width:20px;display:inline-block;"></span>') +
            pipHtml +
            '<span class="creative-label">' + brand.name + '</span>' +
          '</div>' +
        '</td>' +
        '<td style="text-align:right;font-weight:600;color:var(--color-primary-600);">' + brand.crossover_pct + '%</td>' +
        '<td style="text-align:right;">' + fmtNumber(brand.total_visits) + '</td>' +
        '<td style="text-align:right;">' + (brand.stores_threatened || '—') + '</td>' +
        '<td style="text-align:right;" class="' + trendClass + '">' +
          '<span class="material-symbols-outlined" style="font-size:14px;vertical-align:middle;">' + trendIcon + '</span> ' +
          trendText +
        '</td>' +
      '</tr>';

      // Child rows — individual competitor store locations
      if (hasChildren) {
        brand.locations.forEach(function (loc) {
          html += '<tr class="dist-tree-row--child tree-row-hidden" data-parent="' + brandKey + '">' +
            '<td class="tree-indent-1">' + loc.address + '</td>' +
            '<td></td>' +
            '<td></td>' +
            '<td></td>' +
            '<td style="text-align:right;color:var(--color-error-500);font-weight:600;">' +
              (loc.threat_pct != null ? loc.threat_pct + '% comp share' : '—') +
            '</td>' +
          '</tr>';
        });
      }
    });

    html += '</tbody></table>';
    elements.crossoverDetail.innerHTML = html;

    // Bind expand/collapse on parent rows
    elements.crossoverDetail.addEventListener('click', function (e) {
      var parentRow = e.target.closest('.dist-tree-row--parent');
      if (!parentRow) return;
      var brandKey = parentRow.dataset.brand;
      var children = elements.crossoverDetail.querySelectorAll('[data-parent="' + brandKey + '"]');
      var isExpanded = !children[0]?.classList.contains('tree-row-hidden');
      children.forEach(function (row) {
        row.classList.toggle('tree-row-hidden', isExpanded);
      });
      // Rotate toggle icon
      var toggle = parentRow.querySelector('.tree-toggle .material-symbols-outlined');
      if (toggle) {
        toggle.textContent = isExpanded ? 'expand_more' : 'expand_less';
      }
    });
  }

  // ── Visitation View Toggle ──────────────────────────────────────────────────

  function initViewToggle() {
    var toggle = document.getElementById('visitation-view-toggle');
    if (!toggle) return;
    toggle.querySelectorAll('[data-view]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var view = btn.dataset.view;
        if (view === visitationView) return;
        visitationView = view;

        // Toggle active on buttons
        toggle.querySelectorAll('[data-view]').forEach(function (b) {
          b.classList.toggle('active', b.dataset.view === view);
        });

        // Toggle active on view containers
        var currentEl = document.getElementById('visitation-current');
        var trendEl = document.getElementById('visitation-trend');
        if (currentEl) currentEl.classList.toggle('active', view === 'current');
        if (trendEl) trendEl.classList.toggle('active', view === 'trend');

        // Lazy-init trend charts on first switch (eCharts needs visible container)
        if (view === 'trend' && !_trendViewInitialized) {
          _trendViewInitialized = true;
          initFrequencyChart();
          initCrossoverTrendChart();
        }

        // Resize all visible charts after toggle
        setTimeout(function () {
          Object.values(charts).forEach(function (c) { if (c && c.resize) c.resize(); });
        }, 0);
      });
    });
  }

  // ── Visit Frequency Donut ──────────────────────────────────────────────────

  function initVisitDonut() {
    var el = document.getElementById('chart-visit-donut');
    if (!el) return;
    if (charts.visitDonut) { charts.visitDonut.dispose(); charts.visitDonut = null; }

    var chart = echarts.init(el);
    charts.visitDonut = chart;

    var vm = D.visitationMetrics;
    var s = vm.summary;
    if (!s) return;

    var total = s.gross_visits;
    var segments = [
      { name: 'Zero Previous (30d)', value: s.visits_zero_prev, segmentKey: 'zero_prev', color: ChartColors.blue },
      { name: '1-3 Previous', value: s.visits_one_three_prev, segmentKey: 'one_three', color: ChartColors.amber },
      { name: '4+ Previous', value: s.visits_four_plus_prev, segmentKey: 'four_plus', color: ChartColors.green }
    ];

    chart.setOption({
      tooltip: {
        trigger: 'item',
        formatter: function (p) {
          return '<strong>' + p.name + '</strong><br>' +
            p.value.toLocaleString() + ' visits (' + p.percent + '%)';
        }
      },
      graphic: [
        {
          type: 'text',
          left: 'center',
          top: '42%',
          style: {
            text: fmtNumber(total),
            fontSize: 22,
            fontWeight: 'bold',
            fill: '#1f2937',
            textAlign: 'center'
          }
        },
        {
          type: 'text',
          left: 'center',
          top: '54%',
          style: {
            text: 'Total Visits',
            fontSize: 11,
            fill: '#6b7280',
            textAlign: 'center'
          }
        }
      ],
      series: [{
        type: 'pie',
        radius: ['52%', '80%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        selectedMode: 'single',
        label: { show: false },
        labelLine: { show: false },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.2)'
          }
        },
        data: segments.map(function (seg) {
          return {
            name: seg.name,
            value: seg.value,
            segmentKey: seg.segmentKey,
            itemStyle: { color: seg.color }
          };
        })
      }]
    });

    // Click handler for donut↔segment detail highlighting
    chart.on('click', function (params) {
      var segKey = params.data.segmentKey;
      if (donutFilterSegment === segKey) {
        // Toggle off
        donutFilterSegment = null;
        chart.dispatchAction({ type: 'downplay', seriesIndex: 0 });
        highlightSegmentCard(null);
      } else {
        donutFilterSegment = segKey;
        chart.dispatchAction({ type: 'downplay', seriesIndex: 0 });
        chart.dispatchAction({ type: 'highlight', seriesIndex: 0, name: params.name });
        highlightSegmentCard(segKey);
      }
    });

    // Render HTML legend
    renderDonutLegend(segments, total);
  }

  function renderDonutLegend(segments, total) {
    if (!elements.donutLegend) return;
    elements.donutLegend.innerHTML = segments.map(function (seg) {
      var pct = total > 0 ? ((seg.value / total) * 100).toFixed(0) : 0;
      var activeClass = donutFilterSegment === seg.segmentKey ? ' active' : '';
      return '<span class="donut-legend__item' + activeClass + '" data-segment="' + seg.segmentKey + '">' +
        '<span class="donut-legend__dot" style="background: ' + seg.color + ';"></span>' +
        seg.name +
        ' <span class="donut-legend__value">' + pct + '%</span>' +
        '</span>';
    }).join('');

    // Legend clicks highlight segment cards
    elements.donutLegend.querySelectorAll('.donut-legend__item').forEach(function (item) {
      item.addEventListener('click', function () {
        var segKey = item.dataset.segment;
        if (donutFilterSegment === segKey) {
          donutFilterSegment = null;
          if (charts.visitDonut) charts.visitDonut.dispatchAction({ type: 'downplay', seriesIndex: 0 });
          highlightSegmentCard(null);
        } else {
          donutFilterSegment = segKey;
          var seg = segments.find(function (s) { return s.segmentKey === segKey; });
          if (charts.visitDonut) {
            charts.visitDonut.dispatchAction({ type: 'downplay', seriesIndex: 0 });
            charts.visitDonut.dispatchAction({ type: 'highlight', seriesIndex: 0, name: seg ? seg.name : '' });
          }
          highlightSegmentCard(segKey);
        }
      });
    });
  }

  // ── Donut ↔ Segment Detail Interaction ──────────────────────────────────

  var SEGMENT_SUMMARY_FIELDS = {
    zero_prev: 'visits_zero_prev',
    one_three: 'visits_one_three_prev',
    four_plus: 'visits_four_plus_prev'
  };

  function renderSegmentDetail() {
    if (!elements.segmentDetailCards) return;
    var vm = D.visitationMetrics;
    var s = vm.summary;
    if (!s) return;

    var trend = vm.trend || [];
    var total = s.gross_visits;

    var segments = [
      {
        key: 'zero_prev', label: 'Zero Previous (30d)', sublabel: 'New Shoppers',
        value: s.visits_zero_prev, color: ChartColors.blue, icon: 'person_add',
        cpvField: 'cpv_zero_prev'
      },
      {
        key: 'one_three', label: '1–3 Previous', sublabel: 'Returning',
        value: s.visits_one_three_prev, color: ChartColors.amber, icon: 'replay',
        cpvField: 'cpv_one_three'
      },
      {
        key: 'four_plus', label: '4+ Previous', sublabel: 'Loyal',
        value: s.visits_four_plus_prev, color: ChartColors.green, icon: 'loyalty',
        cpvField: 'cpv_four_plus'
      }
    ];

    // Compute per-segment CPV from store-level data
    var ctx = D.context;
    var storeIds = D.entities.getStoresForEntity(ctx.entityId, ctx.entityLevel);
    var latestWeek = ctx.flightWeek === 'all' ? D.LATEST_WEEK_ID : ctx.flightWeek;

    // Aggregate CPV per segment (avg across stores)
    var segCpv = {};
    segments.forEach(function (seg) {
      var totalVisits = seg.value;
      // Use overall CPV as proxy scaled by segment share
      segCpv[seg.key] = totalVisits > 0 ? (s.total_budget || s.gross_visits * 1.15) / s.gross_visits : 0;
    });

    // Compute week-over-week trend per segment
    function getSegTrend(segKey) {
      if (trend.length < 2) return { delta: 0, direction: 'flat' };
      var field = segKey === 'zero_prev' ? 'visits_zero_prev'
        : segKey === 'one_three' ? 'visits_one_three_prev'
        : 'visits_four_plus_prev';
      var prev = trend[trend.length - 2];
      var curr = trend[trend.length - 1];
      if (!prev || !curr) return { delta: 0, direction: 'flat' };
      var prevTotal = prev.visits_zero_prev + prev.visits_one_three_prev + prev.visits_four_plus_prev;
      var currTotal = curr.visits_zero_prev + curr.visits_one_three_prev + curr.visits_four_plus_prev;
      var prevPct = prevTotal > 0 ? (prev[field] / prevTotal) * 100 : 0;
      var currPct = currTotal > 0 ? (curr[field] / currTotal) * 100 : 0;
      var delta = currPct - prevPct;
      return { delta: delta, direction: delta > 0.5 ? 'up' : delta < -0.5 ? 'down' : 'flat' };
    }

    elements.segmentDetailCards.innerHTML = segments.map(function (seg) {
      var pct = total > 0 ? ((seg.value / total) * 100).toFixed(1) : '0.0';
      var t = getSegTrend(seg.key);
      var trendIcon = t.direction === 'up' ? 'trending_up' : t.direction === 'down' ? 'trending_down' : 'trending_flat';
      var trendClass = t.direction === 'up' ? 'trend--up' : t.direction === 'down' ? 'trend--down' : 'trend--flat';
      var avgCpv = (s.gross_visits > 0 && s.visits_zero_prev > 0) ? (seg.value * 1.15 / seg.value).toFixed(2) : '—';

      return '<div class="segment-card" data-segment="' + seg.key + '">' +
        '<div class="segment-card__header">' +
          '<div class="segment-card__identity">' +
            '<span class="segment-card__dot" style="background: ' + seg.color + ';"></span>' +
            '<div class="segment-card__titles">' +
              '<span class="segment-card__label">' + seg.label + '</span>' +
              '<span class="segment-card__sublabel">' + seg.sublabel + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="segment-card__visits">' +
            '<span class="segment-card__visits-value">' + fmtNumber(seg.value) + '</span>' +
            '<span class="segment-card__visits-label">Visits</span>' +
          '</div>' +
          '<span class="segment-card__pct">' + pct + '%</span>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  function highlightSegmentCard(segKey) {
    if (!elements.segmentDetailCards) return;
    elements.segmentDetailCards.querySelectorAll('.segment-card').forEach(function (card) {
      if (!segKey) {
        card.classList.remove('segment-card--highlighted', 'segment-card--dimmed');
      } else if (card.dataset.segment === segKey) {
        card.classList.add('segment-card--highlighted');
        card.classList.remove('segment-card--dimmed');
      } else {
        card.classList.remove('segment-card--highlighted');
        card.classList.add('segment-card--dimmed');
      }
    });

    // Also update legend
    if (elements.donutLegend) {
      elements.donutLegend.querySelectorAll('.donut-legend__item').forEach(function (item) {
        item.classList.toggle('active', item.dataset.segment === segKey);
      });
    }
  }

  function initCrossoverChartWithData(sortedData, pctField) {
    var el = document.getElementById('chart-crossover');
    if (!el) return;
    var chart = echarts.init(el);
    charts.crossover = chart;

    var maxVal = Math.max.apply(null, sortedData.map(function (c) { return c[pctField]; }));
    var chartMax = Math.ceil(maxVal / 10) * 10 || 40;

    chart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 180, right: 40, top: 10, bottom: 30 },
      xAxis: { type: 'value', max: chartMax, axisLabel: { formatter: '{value}%' } },
      yAxis: {
        type: 'category',
        data: sortedData.map(function (c) { return c.competitor_name; }),
        axisLabel: { fontSize: 12 }
      },
      series: [{
        type: 'bar',
        data: sortedData.map(function (c) {
          return {
            value: c[pctField],
            itemStyle: { color: c.competitor_name === 'Publix' ? ChartColors.red : ChartColors.indigo }
          };
        }),
        barWidth: 20,
        label: { show: true, position: 'right', formatter: '{c}%', fontSize: 11 }
      }]
    });
  }

  // Bind filter chip close
  function bindDonutFilterChip() {
    if (!elements.donutFilterChip) return;
    elements.donutFilterChip.addEventListener('click', function () {
      clearDonutFilter();
    });
  }

  function renderSpotlightCards() {
    const alertStores = D.trafficShareMetrics.storeLeaderboard.filter(s => s.alert_type !== 'none');
    elements.spotlightCards.innerHTML = alertStores.map(s => {
      const alertClass = `spotlight-card--${s.alert_type}`;
      const alertIcon = s.alert_type === 'opportunity' ? 'trending_up' : (s.alert_type === 'critical' ? 'warning' : 'info');

      return `
        <div class="spotlight-card ${alertClass}">
          <div class="spotlight-badge">
            <span class="material-symbols-outlined">${alertIcon}</span>
            ${s.alert_type}
          </div>
          <div class="spotlight-store">Store ${s.store_id}</div>
          <div class="spotlight-city">${s.city}</div>
          <div class="spotlight-change">${fmtPp(s.change_pp)}</div>
          <div class="spotlight-share">${s.wk3_share}% → ${s.wk2_share}%</div>
          <div class="spotlight-threat">
            <span class="material-symbols-outlined" style="font-size: 14px;">store</span>
            ${s.primary_threat}
          </div>
        </div>
      `;
    }).join('');
  }

  // ── Store Performance Table ──────────────────────────────────────────────────

  var storePerfState = {
    sortColumn: 'visits',
    sortDirection: 'desc',
    allRows: []
  };

  var PERF_GROUP_COLORS = { green: '#10B981', amber: '#F59E0B', red: '#EF4444' };

  function buildStorePerformanceData() {
    var ctx = D.context;
    var storeIds = D.entities.getStoresForEntity(ctx.entityId, ctx.entityLevel);
    var latestWeek = ctx.flightWeek === 'all' ? D.LATEST_WEEK_ID : ctx.flightWeek;

    var rows = storeIds.map(function (storeId) {
      var store = D.entities.getStoreById(storeId);
      var records = D.getVisitRecords(latestWeek, [storeId]);
      if (!records.length) return null;

      var agg = { gross_visits: 0, visits_zero_prev: 0, visits_one_three_prev: 0, visits_four_plus_prev: 0 };
      records.forEach(function (r) {
        agg.gross_visits += r.gross_visits;
        agg.visits_zero_prev += r.visits_zero_prev;
        agg.visits_one_three_prev += r.visits_one_three_prev;
        agg.visits_four_plus_prev += r.visits_four_plus_prev;
      });

      var cpv = records.length > 0 ? records[0].cost_per_visit : 0;
      var newPct = agg.gross_visits > 0 ? (agg.visits_zero_prev / agg.gross_visits) * 100 : 0;
      var group = newPct >= 40 ? 'green' : newPct >= 30 ? 'amber' : 'red';

      return {
        storeId: storeId,
        storeNumber: store ? store.storeNumber : storeId.replace('store-', ''),
        city: store ? store.city : '',
        visits: agg.gross_visits,
        new_pct: newPct,
        cpv: cpv,
        visits_zero_prev: agg.visits_zero_prev,
        visits_one_three_prev: agg.visits_one_three_prev,
        visits_four_plus_prev: agg.visits_four_plus_prev,
        one_three_pct: agg.gross_visits > 0 ? (agg.visits_one_three_prev / agg.gross_visits) * 100 : 0,
        four_plus_pct: agg.gross_visits > 0 ? (agg.visits_four_plus_prev / agg.gross_visits) * 100 : 0,
        vpt: 0,
        group: group
      };
    }).filter(Boolean);

    // Sort
    var col = storePerfState.sortColumn;
    var dir = storePerfState.sortDirection === 'asc' ? 1 : -1;
    rows.sort(function (a, b) { return (a[col] - b[col]) * dir; });

    storePerfState.allRows = rows;
    return rows;
  }

  function renderStorePerformanceTable() {
    var headEl = document.getElementById('store-perf-head');
    var bodyEl = document.getElementById('store-perf-body');
    if (!headEl || !bodyEl) return;

    // Render header
    function sortClass(col) {
      if (storePerfState.sortColumn !== col) return '';
      return ' sort-active' + (storePerfState.sortDirection === 'asc' ? ' sort-asc' : '');
    }
    headEl.innerHTML = '<tr>' +
      '<th class="col-num">#</th>' +
      '<th class="col-store">Store</th>' +
      '<th class="col-city">City</th>' +
      '<th class="col-visits sortable' + sortClass('visits') + '" data-sort="visits">Visits</th>' +
      '<th class="col-new sortable' + sortClass('new_pct') + '" data-sort="new_pct">New Shoppers</th>' +
      '<th class="col-cpv sortable' + sortClass('cpv') + '" data-sort="cpv">CPV</th>' +
      '<th class="col-one-three">1-3 Prev</th>' +
      '<th class="col-four-plus">4+ Prev</th>' +
      '<th class="col-zero-raw">Zero Prev</th>' +
      '<th class="col-vpt">V/1K</th>' +
    '</tr>';

    // Build or use cached data
    var rows = storePerfState.allRows.length > 0 ? storePerfState.allRows : buildStorePerformanceData();

    // Empty state
    if (rows.length === 0) {
      bodyEl.innerHTML = '<tr><td colspan="11" class="store-perf-empty">No visitation data available for this selection.</td></tr>';
      return;
    }

    // Render all rows (scrollable container handles overflow, virtual scroll in production)
    bodyEl.innerHTML = rows.map(function (r, i) {
      var newClass = r.new_pct >= 40 ? 'metric--good' : r.new_pct < 30 ? 'metric--warn' : '';
      var cpvClass = r.cpv <= 1.50 ? 'metric--good' : r.cpv > 2.00 ? 'metric--warn' : '';
      var dotColor = PERF_GROUP_COLORS[r.group] || '#9CA3AF';
      var selectedClass = storePerfState.selectedStoreId === r.storeId ? ' store-row--selected' : '';

      return '<tr class="store-row' + selectedClass + '" data-store-id="' + r.storeId + '">' +
        '<td class="col-num">' + (i + 1) + '</td>' +
        '<td class="col-store">Store ' + r.storeNumber + '</td>' +
        '<td class="col-city">' + r.city + '</td>' +
        '<td class="col-visits">' + fmtNumber(r.visits) + '</td>' +
        '<td class="col-new ' + newClass + '">' + r.new_pct.toFixed(1) + '%</td>' +
        '<td class="col-cpv ' + cpvClass + '">' + fmtCurrency(r.cpv) + '</td>' +
        '<td class="col-one-three">' + fmtNumber(r.visits_one_three_prev) + ' (' + r.one_three_pct.toFixed(0) + '%)</td>' +
        '<td class="col-four-plus">' + fmtNumber(r.visits_four_plus_prev) + ' (' + r.four_plus_pct.toFixed(0) + '%)</td>' +
        '<td class="col-zero-raw">' + fmtNumber(r.visits_zero_prev) + '</td>' +
        '<td class="col-vpt">' + (r.vpt > 0 ? r.vpt.toFixed(1) : '—') + '</td>' +
      '</tr>';
    }).join('');
  }

  function bindStorePerformanceActions() {
    // More Data toggle
    var toggle = document.getElementById('store-perf-more-toggle');
    var section = document.getElementById('store-perf-section');
    if (toggle && section) {
      toggle.addEventListener('change', function () {
        section.classList.toggle('more-data-enabled', toggle.checked);
      });
    }

    // Sortable headers
    var head = document.getElementById('store-perf-head');
    if (head) {
      head.addEventListener('click', function (e) {
        var th = e.target.closest('th.sortable');
        if (!th) return;
        var col = th.dataset.sort;
        if (storePerfState.sortColumn === col) {
          storePerfState.sortDirection = storePerfState.sortDirection === 'desc' ? 'asc' : 'desc';
        } else {
          storePerfState.sortColumn = col;
          storePerfState.sortDirection = col === 'cpv' ? 'asc' : 'desc';
        }
        buildStorePerformanceData();
        renderStorePerformanceTable();
      });
    }

    // Row click → highlight selected row
    var body = document.getElementById('store-perf-body');
    if (body) {
      body.addEventListener('click', function (e) {
        var row = e.target.closest('.store-row');
        if (!row) return;
        var prev = document.querySelector('.store-row--selected');
        if (prev) prev.classList.remove('store-row--selected');
        row.classList.add('store-row--selected');
        row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      });
    }
  }

  // ========================================
  // Section 3: Traffic Share
  // ========================================

  function renderTrafficKpis() {
    // Phase 2: Render insight strip instead of hero
    const el = document.getElementById('traffic-insight-strip');
    if (!el) return;

    const s = D.trafficShareMetrics.summary;
    const trend = D.trafficShareMetrics.trend;

    // Share change trend
    let changePp = s.share_change_pp || 0;
    let changeCls = changePp > 0 ? 'up' : changePp < 0 ? 'down' : 'flat';
    let changeIcon = changePp > 0 ? 'trending_up' : changePp < 0 ? 'trending_down' : 'trending_flat';

    // Gap direction from trend
    let gapText = 'Stable';
    if (trend.length >= 3) {
      const mid = trend[Math.floor(trend.length / 2)];
      const last = trend[trend.length - 1];
      const delta = last.retailer_share - mid.retailer_share;
      gapText = delta > 0.3 ? `Gap widening over ${trend.length} wks` : delta < -0.3 ? `Gap narrowing over ${trend.length} wks` : `Stable over ${trend.length} wks`;
    }

    el.innerHTML = `
      <div class="stat-strip__cards">
        <div class="stat-strip__item">
          <span class="stat-strip__label">Share</span>
          <div class="stat-strip__value-row">
            <span class="stat-strip__value">${s.retailer_traffic_share}%</span>
            <span class="stat-strip__trend stat-strip__trend--${changeCls}">
              <span class="material-symbols-outlined">${changeIcon}</span>${changePp >= 0 ? '+' : ''}${changePp.toFixed(1)}pp
            </span>
          </div>
        </div>
        <div class="stat-strip__item">
          <span class="stat-strip__label">Outperforming</span>
          <div class="stat-strip__value-row">
            <span class="stat-strip__value">${s.stores_outperforming} <span style="font-size:13px;font-weight:500;color:var(--color-text-secondary);">of ${s.stores_total}</span></span>
          </div>
        </div>
        <div class="stat-strip__item">
          <span class="stat-strip__label">Trend</span>
          <div class="stat-strip__value-row">
            <span class="stat-strip__value" style="font-size:14px;font-weight:600;">${gapText}</span>
          </div>
        </div>
      </div>
    `;
  }

  let _leaderboardSort = 'change';  // current sort column
  let _leaderboardView = 'ours';    // 'ours' | 'competitors'

  // Brand pip colors matching crossover chart
  var LEADERBOARD_BRAND_COLORS = {
    'Publix': '#E07850',
    'Walmart': '#A8BF6E',
    'ALDI': '#2AADDB',
    'Other Retailers': '#9CA3AF',
    'Save A Lot': '#9B7FD4'
  };

  function renderLeaderboard(sortBy) {
    if (sortBy) _leaderboardSort = sortBy;

    // Competitors view: flat list of competitor stores sorted by share.
    if (_leaderboardView === 'competitors') {
      var comps = [].concat(D.competitorStores).sort(function(a, b) {
        return (b.wk2_share || 0) - (a.wk2_share || 0);
      });
      // Competitor → Our Stores within trade-area radius. Trade area = grocery
      // industry default 5 mi (Bill: shown to Adam/Max as "directly competing").
      // Future: per-format threshold (supercenter ~7–10 mi, convenience ~1 mi)
      // and panel-crossover overlay where available.
      var COMPETITOR_TRADE_AREA_MI = 5;
      var shareByStoreId = {};
      (D.trafficShareMetrics && D.trafficShareMetrics.storeLeaderboard || []).forEach(function(lb) {
        shareByStoreId['store-' + lb.store_id] = lb;
      });
      var compStoreMap = {};
      D.competitorStores.forEach(function(cs) {
        if (!cs.lat || !cs.lng) return;
        var inRange = D.entities.stores
          .filter(function(s) { return s.lat && s.lng; })
          .map(function(s) { return { s: s, dist: haversineDistance(cs.lat, cs.lng, s.lat, s.lng) }; })
          .filter(function(x) { return x.dist <= COMPETITOR_TRADE_AREA_MI; })
          .sort(function(a, b) {
            var sa = (shareByStoreId[a.s.id] || {}).wk2_share || 0;
            var sb = (shareByStoreId[b.s.id] || {}).wk2_share || 0;
            return sb - sa;
          })
          .map(function(x) { return x.s; });
        if (inRange.length) compStoreMap[cs.id] = inRange;
      });

      var compHtml = '<div class="lb-header">' +
        '<span class="lb-col lb-col--expand"></span>' +
        '<span class="lb-col lb-col--store">Competitor</span>' +
        '<span class="lb-col lb-col--city">City</span>' +
        '<span class="lb-col lb-col--share">Share</span>' +
      '</div>';
      comps.forEach(function(cs, i) {
        var pipColor = LEADERBOARD_BRAND_COLORS[cs.brand] || '#9CA3AF';
        var ourStores = compStoreMap[cs.id] || [];
        var hasChildren = ourStores.length > 0;
        compHtml += '<div class="lb-row lb-row--parent' + (hasChildren ? '' : ' lb-row--leaf') + '" data-comp-id="' + cs.id + '">' +
          '<span class="lb-col lb-col--expand">' +
            (hasChildren
              ? '<button class="lb-expand-btn" aria-expanded="false" title="Show our stores in range"><span class="material-symbols-outlined">chevron_right</span></button>'
              : '') +
          '</span>' +
          '<span class="lb-col lb-col--store">' +
            '<span class="lb-rank">' + (i + 1) + '</span>' +
            '<span class="lb-comp-pip" style="background:' + pipColor + ';"></span>' +
            (cs.storeName || cs.brand) +
          '</span>' +
          '<span class="lb-col lb-col--city">' + (cs.city || '') + '</span>' +
          '<span class="lb-col lb-col--share">' + (cs.wk2_share != null ? cs.wk2_share + '%' : '—') + '</span>' +
        '</div>';
        if (hasChildren) {
          compHtml += '<div class="lb-children" id="lb-children-comp-' + cs.id + '">';
          ourStores.forEach(function(s) {
            var lb = shareByStoreId[s.id] || {};
            var displayName = '#' + (s.storeNumber != null ? s.storeNumber : s.id.replace(/^store-/, '')) + (s.name ? ' ' + s.name : '');
            compHtml += '<div class="lb-row lb-row--child" data-store-id="' + s.id + '" data-parent-comp-id="' + cs.id + '">' +
              '<span class="lb-col lb-col--expand"></span>' +
              '<span class="lb-col lb-col--store">' + displayName + '</span>' +
              '<span class="lb-col lb-col--city">' + (s.city || '') + '</span>' +
              '<span class="lb-col lb-col--share">' + (lb.wk2_share != null ? lb.wk2_share + '%' : '—') + '</span>' +
            '</div>';
          });
          compHtml += '</div>';
        }
      });
      elements.leaderboardTable.innerHTML = compHtml;
      return;
    }

    var stores = [].concat(D.trafficShareMetrics.storeLeaderboard);
    if (_leaderboardSort === 'share') {
      stores.sort(function(a, b) { return b.wk2_share - a.wk2_share; });
    } else {
      stores.sort(function(a, b) { return b.change_pp - a.change_pp; });
    }

    // Build store → top 5 competitors: nearest 10 by distance, then ranked by crossover share desc
    var storeCompMap = {};
    var validComps = D.competitorStores.filter(function(cs) { return cs.lat && cs.lng; });
    D.entities.stores.forEach(function(store) {
      if (!store.lat || !store.lng) return;
      var withDist = validComps.map(function(cs) {
        return { cs: cs, dist: haversineDistance(store.lat, store.lng, cs.lat, cs.lng) };
      });
      withDist.sort(function(a, b) { return a.dist - b.dist; });
      // Take nearest 10 for geographic relevance, then rank by crossover share
      storeCompMap[store.id] = withDist.slice(0, 10)
        .map(function(x) { return x.cs; })
        .sort(function(a, b) { return (b.wk2_share || 0) - (a.wk2_share || 0) ; })
        .slice(0, 5);
    });

    var sortIcon = function(col) {
      return col === _leaderboardSort
        ? '<span class="material-symbols-outlined lb-sort-icon lb-sort-icon--active">arrow_downward</span>'
        : '<span class="material-symbols-outlined lb-sort-icon lb-sort-icon--inactive">unfold_more</span>';
    };

    var html = '<div class="lb-header">' +
      '<span class="lb-col lb-col--expand"></span>' +
      '<span class="lb-col lb-col--store">Store</span>' +
      '<span class="lb-col lb-col--city">City</span>' +
      '<span class="lb-col lb-col--share lb-col--sortable' + (_leaderboardSort === 'share' ? ' lb-col--sorted' : '') + '" data-sort="share">Share ' + sortIcon('share') + '</span>' +
    '</div>';

    stores.forEach(function(s, i) {
      var storeId = 'store-' + s.store_id;
      var competitors = storeCompMap[storeId] || [];
      var hasChildren = competitors.length > 0;

      html += '<div class="lb-row lb-row--parent' + (hasChildren ? '' : ' lb-row--leaf') + '" data-store-id="' + storeId + '">' +
        '<span class="lb-col lb-col--expand">' +
          (hasChildren
            ? '<button class="lb-expand-btn" aria-expanded="false" title="Show competitors"><span class="material-symbols-outlined">chevron_right</span></button>'
            : '') +
        '</span>' +
        '<span class="lb-col lb-col--store">' +
          '<span class="lb-rank">' + (i + 1) + '</span>' +
          s.store_id +
        '</span>' +
        '<span class="lb-col lb-col--city">' + s.city + '</span>' +
        '<span class="lb-col lb-col--share">' + s.wk2_share + '%</span>' +
      '</div>';

      if (hasChildren) {
        html += '<div class="lb-children" id="lb-children-' + storeId + '">';
        competitors.forEach(function(cs) {
          var pipColor = LEADERBOARD_BRAND_COLORS[cs.brand] || '#9CA3AF';
          html += '<div class="lb-row lb-row--child" data-comp-id="' + cs.id + '" data-parent-store-id="' + storeId + '">' +
            '<span class="lb-col lb-col--expand"></span>' +
            '<span class="lb-col lb-col--store">' +
              '<span class="lb-comp-pip" style="background:' + pipColor + ';"></span>' +
              (cs.storeName || cs.brand) +
            '</span>' +
            '<span class="lb-col lb-col--city">' + cs.city + '</span>' +
            '<span class="lb-col lb-col--share">' + cs.wk2_share + '%</span>' +
          '</div>';
        });
        html += '</div>';
      }
    });

    elements.leaderboardTable.innerHTML = html;
  }

  function renderLeaderboardInto(targetEl, viewOverride, sortBy) {
    if (!targetEl) return;
    var savedTable = elements.leaderboardTable;
    var savedView = _leaderboardView;
    elements.leaderboardTable = targetEl;
    if (viewOverride) _leaderboardView = viewOverride;
    renderLeaderboard(sortBy);
    elements.leaderboardTable = savedTable;
    _leaderboardView = savedView;
  }

  function renderConcentration() {
    const s = D.trafficShareMetrics.summary;
    elements.concentrationStats.innerHTML = `
      <div class="conc-stat">
        <span class="conc-label">Highly Concentrated (HHI > 2500)</span>
        <span class="conc-value">${s.highly_concentrated_count} stores</span>
      </div>
      <div class="conc-stat">
        <span class="conc-label">Moderately Concentrated</span>
        <span class="conc-value">${s.moderately_concentrated_count} stores</span>
      </div>
    `;
  }

  function renderThreats() {
    const threats = D.primaryThreats;
    const totalStores = D.trafficShareMetrics.summary.stores_total || 20;

    elements.threatList.innerHTML = threats.map(t => {
      const locationsHtml = t.locations && t.locations.length > 0
        ? t.locations.map(loc => `
            <div class="threat-location">
              <span class="threat-location__address">${loc.address}</span>
              <span class="threat-location__pct">${loc.threat_pct != null ? loc.threat_pct + '% comp share' : '—'}</span>
            </div>
          `).join('')
        : '<div class="threat-location"><span class="threat-location__address" style="color:var(--text-muted);">No store-level data</span></div>';

      return `
        <details class="threat-item">
          <summary class="threat-item__summary">
            <span class="threat-name">${t.brand}</span>
            <span class="threat-count">${t.store_count} store${t.store_count > 1 ? 's' : ''} threatened</span>
            <div class="threat-bar">
              <div class="threat-bar__fill" style="width: ${(t.store_count / totalStores) * 100}%;"></div>
            </div>
          </summary>
          <div class="threat-item__locations">
            <div class="threat-locations-header">
              <span>Competitor Location</span>
              <span>Impact</span>
            </div>
            ${locationsHtml}
          </div>
        </details>
      `;
    }).join('');
  }

  // ========================================
  // Traffic Overview Preview (top 5, links to By Store tab)
  // ========================================

  function renderTrafficLeaderboardPreview() {
    var host = document.getElementById('traffic-overview-preview');
    if (!host) return;

    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    function fmtChange(pp) {
      if (pp == null) return '<span style="color:var(--p-text-color-muted)">—</span>';
      var sign = pp > 0 ? '+' : '';
      var color = pp > 0 ? 'var(--p-green-500)' : pp < 0 ? 'var(--p-red-500)' : 'var(--p-text-color-secondary)';
      return '<span style="color:' + color + '">' + sign + pp.toFixed(1) + ' pp</span>';
    }

    var top5 = [].concat(D.trafficShareMetrics.storeLeaderboard || [])
      .sort(function(a, b) { return (b.wk2_share || 0) - (a.wk2_share || 0); })
      .slice(0, 5);

    var header = '<div class="lb-header">' +
      '<span class="lb-col lb-col--rank">#</span>' +
      '<span class="lb-col lb-col--store">Store</span>' +
      '<span class="lb-col lb-col--city">City</span>' +
      '<span class="lb-col lb-col--share">Share</span>' +
      '<span class="lb-col lb-col--change">Change</span>' +
    '</div>';

    var rows = top5.map(function(s, i) {
      return '<div class="lb-row lb-row--leaf">' +
        '<span class="lb-col lb-col--rank"><span class="lb-rank">' + (i + 1) + '</span></span>' +
        '<span class="lb-col lb-col--store">Store #' + esc(s.store_id) + '</span>' +
        '<span class="lb-col lb-col--city">' + esc(s.city || '') + '</span>' +
        '<span class="lb-col lb-col--share">' + (s.wk2_share != null ? s.wk2_share + '%' : '—') + '</span>' +
        '<span class="lb-col lb-col--change">' + fmtChange(s.change_pp) + '</span>' +
      '</div>';
    }).join('');

    host.innerHTML = header + rows;

    var link = document.getElementById('ts-overview-preview-link');
    if (link && !link.dataset.bound) {
      link.dataset.bound = '1';
      link.addEventListener('click', function() {
        var compareTab = document.querySelector('[data-ts-tab="compare"]');
        if (compareTab) compareTab.click();
      });
    }
  }

  // ========================================
  // Traffic Data Pane (dense flat leaderboard)
  // ========================================

  function renderTrafficDataPane() {
    var host = document.getElementById('ts-data-grid');
    if (!host) return;

    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    function fmtChange(pp) {
      if (pp == null) return '<span style="color:var(--p-text-color-muted)">—</span>';
      var sign = pp > 0 ? '+' : '';
      var color = pp > 0 ? 'var(--p-green-500)' : pp < 0 ? 'var(--p-red-500)' : 'var(--p-text-color-secondary)';
      return '<span style="color:' + color + '">' + sign + pp.toFixed(1) + ' pp</span>';
    }

    var ourRows = (D.trafficShareMetrics.storeLeaderboard || []).map(function(s) {
      return { name: 'Store #' + s.store_id, type: 'Our Store', city: s.city || '', share: s.wk2_share, change_pp: s.change_pp };
    });
    var compRows = (D.competitorStores || []).map(function(cs) {
      return { name: cs.storeName || cs.brand, type: cs.brand, city: cs.city || '', share: cs.wk2_share, change_pp: null };
    });

    var combined = ourRows.concat(compRows).sort(function(a, b) { return (b.share || 0) - (a.share || 0); });

    var rows = combined.map(function(r, i) {
      var isOur = r.type === 'Our Store';
      var typeChip = isOur
        ? '<span class="ts-data-chip ts-data-chip--our">Our Store</span>'
        : '<span class="ts-data-chip ts-data-chip--comp">' + esc(r.type) + '</span>';
      return '<tr>'
        + '<td class="col-num">' + (i + 1) + '</td>'
        + '<td class="col-name">' + esc(r.name) + '</td>'
        + '<td class="col-type">' + typeChip + '</td>'
        + '<td class="col-city">' + esc(r.city) + '</td>'
        + '<td class="col-share">' + (r.share != null ? r.share + '%' : '—') + '</td>'
        + '<td class="col-change">' + fmtChange(r.change_pp) + '</td>'
        + '</tr>';
    }).join('');

    host.innerHTML = '<div class="dist-tree-table-wrap">'
      + '<table class="dist-tree-table ts-data-table">'
      + '<thead><tr>'
      + '<th class="col-num">#</th>'
      + '<th class="col-name">Location</th>'
      + '<th class="col-type">Type</th>'
      + '<th class="col-city">City</th>'
      + '<th class="col-share">Share %</th>'
      + '<th class="col-change">Change</th>'
      + '</tr></thead>'
      + '<tbody>' + rows + '</tbody>'
      + '</table>'
      + '</div>';
  }

  // ========================================
  // Store Map
  // ========================================

  function renderMap(containerId) {
    if (typeof StoreMap === 'undefined') return;

    StoreMap.init(containerId || 'store-map');
    const stores = D.entities.stores;
    const storeData = {};

    D.trafficShareMetrics.storeLeaderboard.forEach(s => {
      storeData['store-' + s.store_id] = {
        share: s.wk2_share,
        change_pp: s.change_pp,
        primary_threat: s.primary_threat,
        new_pct: s.new_pct || 33,
        ret_pct: s.ret_pct || 33,
        loy_pct: s.loy_pct || 34,
        visits: s.total_visits || 0
      };
    });

    StoreMap.renderStores(stores, storeData);
    StoreMap.fitBounds();

    // Set competitor ranking so pip colors match crossover chart
    var crossover = D.competitiveCrossover;
    var seen = {};
    var rankedNames = [];
    crossover.forEach(function (c) {
      if (!seen[c.competitor_name]) {
        seen[c.competitor_name] = true;
        rankedNames.push(c.competitor_name);
      }
    });
    rankedNames.sort(function (a, b) {
      var ac = crossover.find(function (c) { return c.competitor_name === a; });
      var bc = crossover.find(function (c) { return c.competitor_name === b; });
      return (bc ? bc.crossover_pct : 0) - (ac ? ac.crossover_pct : 0);
    });
    StoreMap.setCompetitorRanking(rankedNames.slice(0, 5));

    var competitorStores = D.competitorStores;
    var storeIds = stores.map(function(s) { return s.id; });
    StoreMap.renderCompetitors(competitorStores, storeIds);
  }

  // ── Traffic: Row ↔ Map selection ─────────────────────────────────────────

  let _trafficSelectedStoreId = null;

  function selectTrafficStore(storeId) {
    // Clear all row selections
    document.querySelectorAll('.lb-row--parent').forEach(function(r) { r.classList.remove('lb-row--selected'); });
    document.querySelectorAll('.lb-row--child').forEach(function(r) { r.classList.remove('lb-row--selected'); });

    _trafficSelectedStoreId = storeId;
    hideComparePanel();

    // Highlight row + scroll into view
    var row = document.querySelector('.lb-row--parent[data-store-id="' + storeId + '"]');
    if (row) {
      row.classList.add('lb-row--selected');
      row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    // Zoom to store, show rings, open popup
    if (typeof StoreMap !== 'undefined') {
      StoreMap.highlightStore(storeId);
    }

    // Show ring legend
    var legend = document.getElementById('ring-legend');
    if (legend) legend.style.display = 'flex';
  }

  function bindTrafficStoreSelection() {
    var table = document.getElementById('leaderboard-table');
    if (table) {
      table.addEventListener('click', function (e) {
        // Expand/collapse button
        var expandBtn = e.target.closest('.lb-expand-btn');
        if (expandBtn) {
          e.stopPropagation();
          var parentRow = expandBtn.closest('.lb-row--parent');
          var sid = parentRow ? parentRow.dataset.storeId : null;
          if (!sid) return;
          var children = document.getElementById('lb-children-' + sid);
          if (!children) return;
          var isOpen = children.classList.contains('open');
          children.classList.toggle('open', !isOpen);
          expandBtn.setAttribute('aria-expanded', String(!isOpen));
          return;
        }

        // Child competitor row → show parent with rings + competitor in view
        var childRow = e.target.closest('.lb-row--child');
        if (childRow) {
          var compId = childRow.dataset.compId;
          var parentStoreId = childRow.dataset.parentStoreId;
          // Highlight parent row + selected child
          document.querySelectorAll('.lb-row--parent').forEach(function(r) { r.classList.remove('lb-row--selected'); });
          document.querySelectorAll('.lb-row--child').forEach(function(r) { r.classList.remove('lb-row--selected'); });
          var parentRow2 = document.querySelector('.lb-row--parent[data-store-id="' + parentStoreId + '"]');
          if (parentRow2) parentRow2.classList.add('lb-row--selected');
          childRow.classList.add('lb-row--selected');
          _trafficSelectedStoreId = parentStoreId;
          // Fit map to show parent (with rings) + competitor, open competitor popup
          if (typeof StoreMap !== 'undefined') {
            StoreMap.showParentAndCompetitor(parentStoreId, compId);
            var legend = document.getElementById('ring-legend');
            if (legend) legend.style.display = 'flex';
          }
          return;
        }

        // Parent store row → focus map pin
        var parentRow3 = e.target.closest('.lb-row--parent');
        if (!parentRow3 || !parentRow3.dataset.storeId) return;
        selectTrafficStore(parentRow3.dataset.storeId);
      });
    }

    // Map store pin click → select row
    if (typeof StoreMap !== 'undefined') {
      StoreMap.onStoreClick(function (storeId) {
        selectTrafficStore(storeId);
      });
    }

    // Map competitor Compare button → toggle compare panel
    if (typeof StoreMap !== 'undefined') {
      StoreMap.onCompetitorClick(function (compData) {
        var panel = document.getElementById('compare-panel');
        var isOpen = panel && panel.style.display !== 'none';
        var sameComp = panel && panel.dataset.compId === compData.id;
        if (isOpen && sameComp) {
          hideComparePanel();
        } else {
          showComparePanel(_trafficSelectedStoreId, compData);
          if (panel) panel.dataset.compId = compData.id;
          // No pan needed — marker is already centered (user clicked it)
        }
      });
    }

    // Reset map button
    var resetBtn = document.getElementById('traffic-map-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        _trafficSelectedStoreId = null;
        document.querySelectorAll('.lb-row--selected').forEach(function(r) { r.classList.remove('lb-row--selected'); });
        hideComparePanel();
        var legend = document.getElementById('ring-legend');
        if (legend) legend.style.display = 'none';
        if (typeof StoreMap !== 'undefined') StoreMap.fitBounds();
      });
    }

    // Compare panel close button
    var closeBtn = document.getElementById('compare-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', hideComparePanel);
    }
  }


  // ── 1v1 Store vs Competitor Comparison Panel ───────────────────────────────

  function showComparePanel(storeId, compData, panelEl, bodyEl) {
    var panel = panelEl || document.getElementById('compare-panel');
    var body = bodyEl || document.getElementById('compare-panel-body');
    if (!panel || !body) return;

    // Get crossover data for this competitor brand
    var crossover = D.competitiveCrossover;
    var compCrossover = crossover.find(function (c) { return c.competitor_name === compData.brand; });

    var crossoverPct = compCrossover ? compCrossover.crossover_pct : 0;
    var zeroPrev = compCrossover ? compCrossover.crossover_visits_zero_prev : 0;
    var oneThree = compCrossover ? compCrossover.crossover_visits_one_three : 0;
    var fourPlus = compCrossover ? compCrossover.crossover_visits_four_plus : 0;
    var totalFreq = zeroPrev + oneThree + fourPlus || 1;

    // Get our store info (may be null when no store is selected)
    var store = storeId ? D.entities.stores.find(function (s) { return s.id === storeId; }) : null;
    var leaderboard = D.trafficShareMetrics.storeLeaderboard;
    var storePerf = storeId ? leaderboard.find(function (s) { return ('store-' + s.store_id) === storeId; }) : null;

    var compCol =
      '<div class="compare-panel__col">' +
        '<div class="compare-panel__name" style="color:#6b7280;">' +
          '<span class="material-symbols-outlined" style="font-size:16px;vertical-align:-3px;margin-right:4px;">storefront</span>' +
          compData.brand +
        '</div>' +
        '<div class="compare-panel__sub">' + compData.address + '</div>' +
        (store ? '<div class="compare-panel__stat"><span class="compare-panel__stat-label">Distance</span><span class="compare-panel__stat-value">' + haversineDistance(store.lat, store.lng, compData.lat, compData.lng).toFixed(1) + ' mi</span></div>' : '') +
        '<div class="compare-panel__stat"><span class="compare-panel__stat-label">Crossover Rate</span><span class="compare-panel__stat-value">' + crossoverPct + '%</span></div>' +
        '<div class="compare-panel__stat"><span class="compare-panel__stat-label">Trend</span><span class="compare-panel__stat-value">' + (compCrossover ? trendArrow(compCrossover.trend) : '—') + '</span></div>' +
      '</div>';

    if (store) {
      var storeShare = storePerf ? storePerf.wk2_share + '%' : '—';
      var storeChange = storePerf ? ((storePerf.change_pp >= 0 ? '+' : '') + storePerf.change_pp + ' pp') : '—';
      var storeVisits = storePerf && storePerf.total_visits != null ? storePerf.total_visits.toLocaleString() : '—';

      body.innerHTML =
        '<div class="compare-panel__row">' +
          '<div class="compare-panel__col">' +
            '<div class="compare-panel__name" style="color:#4272D8;">' +
              '<span class="material-symbols-outlined" style="font-size:16px;vertical-align:-3px;margin-right:4px;">store</span>' +
              store.name + ' (#' + store.storeNumber + ')' +
            '</div>' +
            '<div class="compare-panel__sub">' + store.city + '</div>' +
            '<div class="compare-panel__stat"><span class="compare-panel__stat-label">Share</span><span class="compare-panel__stat-value">' + storeShare + '</span></div>' +
            '<div class="compare-panel__stat"><span class="compare-panel__stat-label">Change</span><span class="compare-panel__stat-value">' + storeChange + '</span></div>' +
            '<div class="compare-panel__stat"><span class="compare-panel__stat-label">Observed Visits</span><span class="compare-panel__stat-value">' + storeVisits + '</span></div>' +
          '</div>' +
          '<div class="compare-panel__vs">VS</div>' +
          compCol +
        '</div>' +
        '<div class="compare-panel__crossover">' +
          '<div class="compare-panel__crossover-pct">' + crossoverPct + '%</div>' +
          '<div class="compare-panel__crossover-label">of our visitors also shop at ' + compData.brand + '</div>' +
        '</div>' +
        '<div style="margin-top:var(--space-3);">' +
          '<div style="font-size:12px;font-weight:600;color:var(--color-text-secondary);margin-bottom:6px;">Crossover Visit Frequency</div>' +
          '<div class="compare-panel__freq-bars">' +
            buildFreqBar('New (0 prev)', zeroPrev, totalFreq, '#4272D8') +
            buildFreqBar('Returning (1-3)', oneThree, totalFreq, '#F59E0B') +
            buildFreqBar('Loyal (4+)', fourPlus, totalFreq, '#10B981') +
          '</div>' +
        '</div>';
    } else {
      // No our-store selected — competitor-only view
      body.innerHTML =
        '<div class="compare-panel__row">' +
          compCol +
        '</div>' +
        '<div class="compare-panel__crossover">' +
          '<div class="compare-panel__crossover-pct">' + crossoverPct + '%</div>' +
          '<div class="compare-panel__crossover-label">of our visitors also shop at ' + compData.brand + '</div>' +
        '</div>' +
        '<div style="margin-top:var(--space-3);">' +
          '<div style="font-size:12px;font-weight:600;color:var(--color-text-secondary);margin-bottom:6px;">Crossover Visit Frequency</div>' +
          '<div class="compare-panel__freq-bars">' +
            buildFreqBar('New (0 prev)', zeroPrev, totalFreq, '#4272D8') +
            buildFreqBar('Returning (1-3)', oneThree, totalFreq, '#F59E0B') +
            buildFreqBar('Loyal (4+)', fourPlus, totalFreq, '#10B981') +
          '</div>' +
          '<div style="margin-top:var(--space-2);font-size:11px;color:var(--color-text-secondary);">Select a store from the leaderboard to compare side-by-side</div>' +
        '</div>';
    }

    panel.style.display = '';
  }

  function hideComparePanel() {
    var panel = document.getElementById('compare-panel');
    if (panel) panel.style.display = 'none';
  }

  // ── By Store tab interactions ─────────────────────────────────────────────
  function bindStoreTabInteractions() {
    var table = document.getElementById('leaderboard-table-store');
    if (!table) return;
    table.addEventListener('click', function(e) {
      var expandBtn = e.target.closest('.lb-expand-btn');
      if (expandBtn) {
        e.stopPropagation();
        var parentRow = expandBtn.closest('.lb-row--parent');
        var sid = parentRow ? parentRow.dataset.storeId : null;
        if (!sid) return;
        var children = document.getElementById('lb-children-' + sid);
        if (!children) return;
        children.classList.toggle('open', !children.classList.contains('open'));
        expandBtn.setAttribute('aria-expanded', String(children.classList.contains('open')));
        return;
      }
      var parentRow = e.target.closest('.lb-row--parent');
      if (!parentRow || !parentRow.dataset.storeId) return;
      table.querySelectorAll('.lb-row--parent').forEach(function(r) { r.classList.remove('lb-row--selected'); });
      parentRow.classList.add('lb-row--selected');
      parentRow.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      if (typeof StoreMap !== 'undefined') StoreMap.highlightStore(parentRow.dataset.storeId);
      var legend = document.getElementById('ring-legend-store');
      if (legend) legend.style.display = 'flex';
    });
    var resetBtn = document.getElementById('traffic-map-reset-btn-store');
    if (resetBtn) {
      resetBtn.addEventListener('click', function() {
        table.querySelectorAll('.lb-row--selected').forEach(function(r) { r.classList.remove('lb-row--selected'); });
        var legend = document.getElementById('ring-legend-store');
        if (legend) legend.style.display = 'none';
        if (typeof StoreMap !== 'undefined') StoreMap.fitBounds();
      });
    }
  }

  // ── Compare Map tab interactions (Phase B: toggle swaps source) ───────────
  var _compareSource = 'ours';
  function bindCompareTabInteractions() {
    var table = document.getElementById('leaderboard-table-compare');
    var toggle = document.getElementById('compare-source-toggle');
    var labelEl = document.getElementById('compare-panel-label');
    var subtitleEl = document.getElementById('compare-panel-subtitle');
    if (!table || !toggle) return;

    function applySource(source) {
      _compareSource = source;
      toggle.querySelectorAll('.view-toggle__btn').forEach(function(b) {
        var on = b.dataset.compareSource === source;
        b.classList.toggle('active', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      if (labelEl) labelEl.textContent = source === 'competitors' ? 'Competitor Performance' : 'Store Performance';
      if (subtitleEl) subtitleEl.textContent = source === 'competitors'
        ? 'Competitor traffic share — click a row to see crossover detail'
        : 'Traffic share by store — click a row to focus on the map';
      renderLeaderboardInto(table, source);
    }

    toggle.addEventListener('click', function(e) {
      var btn = e.target.closest('.view-toggle__btn');
      if (!btn || btn.classList.contains('active')) return;
      applySource(btn.dataset.compareSource);
    });

    // Row interactions — store rows pan map, competitor rows open modal (Phase A
    // parity with old panes; Phase C/D will replace modal with map-side detail).
    table.addEventListener('click', function(e) {
      var sortCol = e.target.closest('.lb-col--sortable');
      if (sortCol) {
        renderLeaderboardInto(table, _compareSource, sortCol.dataset.sort);
        return;
      }
      if (_compareSource === 'ours') {
        var expandBtn = e.target.closest('.lb-expand-btn');
        if (expandBtn) {
          e.stopPropagation();
          var pr = expandBtn.closest('.lb-row--parent');
          var sid = pr ? pr.dataset.storeId : null;
          if (!sid) return;
          var children = document.getElementById('lb-children-' + sid);
          if (!children) return;
          children.classList.toggle('open', !children.classList.contains('open'));
          expandBtn.setAttribute('aria-expanded', String(children.classList.contains('open')));
          return;
        }
        var parentRow = e.target.closest('.lb-row--parent');
        if (!parentRow || !parentRow.dataset.storeId) return;
        table.querySelectorAll('.lb-row--parent').forEach(function(r) { r.classList.remove('lb-row--selected'); });
        parentRow.classList.add('lb-row--selected');
        parentRow.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        if (typeof StoreMap !== 'undefined') StoreMap.highlightStore(parentRow.dataset.storeId);
        var legend = document.getElementById('ring-legend-compare');
        if (legend) legend.style.display = 'flex';
      } else {
        var expandBtnC = e.target.closest('.lb-expand-btn');
        if (expandBtnC) {
          e.stopPropagation();
          var parentCompRow = expandBtnC.closest('.lb-row--parent');
          var cidExpand = parentCompRow ? parentCompRow.dataset.compId : null;
          if (!cidExpand) return;
          var children = document.getElementById('lb-children-comp-' + cidExpand);
          if (!children) return;
          children.classList.toggle('open', !children.classList.contains('open'));
          expandBtnC.setAttribute('aria-expanded', String(children.classList.contains('open')));
          return;
        }
        var childRow = e.target.closest('.lb-row--child');
        if (childRow && childRow.dataset.storeId) {
          if (typeof StoreMap !== 'undefined' && StoreMap.highlightStore) StoreMap.highlightStore(childRow.dataset.storeId);
          return;
        }
        var compRow = e.target.closest('.lb-row--parent, .lb-row--leaf');
        if (!compRow || !compRow.dataset.compId) return;
        table.querySelectorAll('.lb-row--selected').forEach(function(r) { r.classList.remove('lb-row--selected'); });
        compRow.classList.add('lb-row--selected');
        if (typeof StoreMap !== 'undefined' && StoreMap.highlightCompetitor) StoreMap.highlightCompetitor(compRow.dataset.compId);
      }
    });

    var resetBtn = document.getElementById('traffic-map-reset-btn-compare');
    if (resetBtn) {
      resetBtn.addEventListener('click', function() {
        table.querySelectorAll('.lb-row--selected').forEach(function(r) { r.classList.remove('lb-row--selected'); });
        var legend = document.getElementById('ring-legend-compare');
        if (legend) legend.style.display = 'none';
        if (typeof StoreMap !== 'undefined') StoreMap.fitBounds();
      });
    }
  }

  // ── By Competitor tab interactions ────────────────────────────────────────
  function bindCompTabInteractions() {
    var table = document.getElementById('leaderboard-table-comp');
    if (!table) return;
    table.addEventListener('click', function(e) {
      var sortCol = e.target.closest('.lb-col--sortable');
      if (sortCol) {
        renderLeaderboardInto(table, 'competitors', sortCol.dataset.sort);
        return;
      }
      var row = e.target.closest('.lb-row--leaf');
      if (!row || !row.dataset.compId) return;
      var compData = D.competitorStores.find(function(c) { return c.id === row.dataset.compId; });
      if (!compData) return;
      table.querySelectorAll('.lb-row--leaf').forEach(function(r) { r.classList.remove('lb-row--selected'); });
      row.classList.add('lb-row--selected');
      showComparePanelModal(null, compData);
    });
    var closeBtn = document.getElementById('comp-modal-close');
    if (closeBtn) closeBtn.addEventListener('click', hideComparePanelModal);
    var backdrop = document.getElementById('comp-modal-backdrop');
    if (backdrop) backdrop.addEventListener('click', function(e) {
      if (e.target === backdrop) hideComparePanelModal();
    });
  }

  function showComparePanelModal(storeId, compData) {
    showComparePanel(storeId, compData,
      document.getElementById('comp-modal'),
      document.getElementById('comp-modal-body')
    );
    var backdrop = document.getElementById('comp-modal-backdrop');
    if (backdrop) backdrop.style.display = 'flex';
  }

  function hideComparePanelModal() {
    var backdrop = document.getElementById('comp-modal-backdrop');
    if (backdrop) backdrop.style.display = 'none';
  }

  function buildFreqBar(label, value, total, color) {
    var pct = total > 0 ? (value / total * 100).toFixed(0) : 0;
    return '<div class="compare-panel__freq-bar">' +
      '<div class="compare-panel__freq-track"><div class="compare-panel__freq-fill" style="width:' + pct + '%;background:' + color + ';"></div></div>' +
      '<div class="compare-panel__freq-value">' + pct + '%</div>' +
      '<div class="compare-panel__freq-label">' + label + '</div>' +
    '</div>';
  }

  function trendArrow(trend) {
    if (!trend || trend.length < 2) return '—';
    var first = trend[0];
    var last = trend[trend.length - 1];
    var delta = last - first;
    var arrow = delta > 0 ? '↑' : delta < 0 ? '↓' : '→';
    var color = delta > 0 ? '#ef4444' : delta < 0 ? '#10b981' : '#6b7280';
    return '<span style="color:' + color + ';">' + arrow + ' ' + (delta >= 0 ? '+' : '') + delta.toFixed(1) + ' pp</span>';
  }

  function haversineDistance(lat1, lng1, lat2, lng2) {
    var R = 3959; // Earth radius in miles
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLng = (lng2 - lng1) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  // ========================================
  // Dynamic Retailer Labels
  // ========================================

  function updateFilterChips() {
    if (typeof HeaderComponent === 'undefined') return;
    var ctx = D.context;
    var chips = [];
    if (ctx.flightWeek !== 'all') {
      var wk = D.flightWeeks.find(function(w) { return w.id === ctx.flightWeek; });
      chips.push({ id: 'flight-week', type: 'category', label: wk ? wk.label : ctx.flightWeek });
    }
    if (ctx.entityLevel !== 'all') {
      chips.push({ id: 'entity', type: 'deal', label: ctx.entityName });
    }
    HeaderComponent.renderFilterChips(chips);
  }

  function handleFilterRemove(filterId) {
    if (filterId === 'flight-week') {
      D.setFlightWeek('all');
      var weeks = D.flightWeeks;
      var firstWk = weeks[0];
      var lastWk = weeks[weeks.length - 1];
      HeaderComponent.updateDateDisplay(firstWk.label + ' – ' + lastWk.label, fmtDateRange(firstWk.start) + ' – ' + fmtDateRange(lastWk.end));
    } else if (filterId === 'entity') {
      D.setEntity('all', 'all', 'All Stores');
      var rc = D.retailerConfig;
      var storeCount = D.entities.stores.length;
      HeaderComponent.updateEntityDisplay('ALL STORES', rc.name, storeCount + ' stores · ' + rc.pilotLabel);
    }
    // Re-render with reset context
    renderAll();
    Object.values(charts).forEach(function(chart) {
      if (chart && chart.dispose) chart.dispose();
    });
    charts = {};
    initCharts();
    updateFilterChips();
  }

  function getEntityLabel() {
    const ctx = D.context;
    if (ctx.entityLevel === 'all') return D.retailerConfig.name;
    return ctx.entityName || D.retailerConfig.name;
  }

  function updateRetailerLabels() {
    const name = getEntityLabel();
    const labelEl = document.getElementById('retailer-legend-label');
    if (labelEl) labelEl.textContent = name;
    const volumeEl = document.getElementById('retailer-volume-label');
    if (volumeEl) volumeEl.textContent = name;
  }

  // ========================================
  // eCharts Initialization
  // ========================================

  function initCharts() {
    initFrequencyChart();
    initCrossoverChart();
    initCrossoverTrendChart();
    initTrafficCombinedChart();
    initVideoFunnelChart();
    initDemographicCharts();
  }

  // Synthetic extended trend data — generated once, sliced per duration preset.
  // Seeded from real 5-week averages to keep baseline magnitudes realistic.
  var _freqTrendCache = null;
  function buildFrequencyTrendData() {
    if (_freqTrendCache) return _freqTrendCache;
    var real = D.visitationMetrics.weeklyTrend;
    // Baseline averages from real data
    var n = real.length || 1;
    var avgZero = real.reduce(function(s,w){ return s + (w.visits_zero_prev || 0); }, 0) / n;
    var avgOneThree = real.reduce(function(s,w){ return s + (w.visits_one_three_prev || 0); }, 0) / n;
    var avgFourPlus = real.reduce(function(s,w){ return s + (w.visits_four_plus_prev || 0); }, 0) / n;

    // Seeded pseudo-random for deterministic variance
    function seedRand(seed) {
      var x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    }
    function vary(base, seed) {
      return Math.round(base * (0.82 + seedRand(seed) * 0.36));
    }

    // 52 weeks (oldest first), last entry = most recent
    var weeks52 = [];
    for (var i = 0; i < 52; i++) {
      var growth = 1 + (i / 52) * 0.12; // slight upward trend
      weeks52.push({
        idx: i,
        label: 'Wk ' + (i - 51 + 52), // labels 1..52
        zero: vary(avgZero * growth, i * 7 + 1),
        oneThree: vary(avgOneThree * growth, i * 7 + 2),
        fourPlus: vary(avgFourPlus * growth, i * 7 + 3)
      });
    }
    // Overwrite the last 5 weeks with real data so the current-week tail matches known values
    for (var r = 0; r < Math.min(real.length, 5); r++) {
      var dst = weeks52[52 - real.length + r];
      if (!dst) continue;
      dst.zero = real[r].visits_zero_prev || dst.zero;
      dst.oneThree = real[r].visits_one_three_prev || dst.oneThree;
      dst.fourPlus = real[r].visits_four_plus_prev || dst.fourPlus;
      dst.label = D.getWeekLabel(real[r].week);
    }

    // 7 daily bars — split the final week's totals across days
    var lastWk = weeks52[51];
    var dayLabels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    var dayWeights = [0.12, 0.13, 0.14, 0.14, 0.16, 0.18, 0.13];
    var days7 = dayLabels.map(function(lbl, i) {
      return {
        label: lbl,
        zero: Math.round(lastWk.zero * dayWeights[i]),
        oneThree: Math.round(lastWk.oneThree * dayWeights[i]),
        fourPlus: Math.round(lastWk.fourPlus * dayWeights[i])
      };
    });

    // 12 monthly bars — aggregate weeks in groups of ~4.33
    // Labels: last bar = current month (Jan '26), count backwards 11 months.
    var monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var endDate = new Date();
    var monthLabels = [];
    for (var i = 11; i >= 0; i--) {
      var d = new Date(endDate.getFullYear(), endDate.getMonth() - i, 1);
      var yr = String(d.getFullYear()).slice(-2);
      monthLabels.push(monthNames[d.getMonth()] + " '" + yr);
    }
    var months12 = [];
    for (var m = 0; m < 12; m++) {
      var startW = Math.round(m * 52 / 12);
      var endW = Math.round((m + 1) * 52 / 12);
      var acc = { zero: 0, oneThree: 0, fourPlus: 0 };
      for (var w = startW; w < endW; w++) {
        acc.zero += weeks52[w].zero;
        acc.oneThree += weeks52[w].oneThree;
        acc.fourPlus += weeks52[w].fourPlus;
      }
      months12.push({ label: monthLabels[m], zero: acc.zero, oneThree: acc.oneThree, fourPlus: acc.fourPlus });
    }

    _freqTrendCache = { weeks52: weeks52, days7: days7, months12: months12 };
    return _freqTrendCache;
  }

  function getFrequencyBuckets(preset, yearGran) {
    var cache = buildFrequencyTrendData();
    switch (preset) {
      case '1w': return cache.days7;
      case '1m': return cache.weeks52.slice(-4);
      case '1q': return cache.weeks52.slice(-13);
      case '1y':
        if (yearGran === 'month') return cache.months12;  // 12 monthly bars
        return buildYearByQuarter(cache.weeks52);          // default: 4 quarterly bars
      default:   return cache.months12;
    }
  }

  function buildYearByQuarter(weeks52) {
    var quarters = [];
    var qLabels = ['Q1', 'Q2', 'Q3', 'Q4'];
    for (var q = 0; q < 4; q++) {
      var startW = q * 13;
      var acc = { zero: 0, oneThree: 0, fourPlus: 0 };
      for (var w = startW; w < startW + 13; w++) {
        acc.zero += weeks52[w].zero;
        acc.oneThree += weeks52[w].oneThree;
        acc.fourPlus += weeks52[w].fourPlus;
      }
      quarters.push({ label: qLabels[q], zero: acc.zero, oneThree: acc.oneThree, fourPlus: acc.fourPlus });
    }
    return quarters;
  }

  function getActiveDurationPreset() {
    var active = document.querySelector('#duration-presets .duration-preset.active');
    return (active && active.dataset.duration) || '1y';
  }

  function getActiveYearGranularity() {
    var active = document.querySelector('#year-granularity .year-gran-btn.active');
    return (active && active.dataset.gran) || 'quarter';
  }

  function initFrequencyChart() {
    const el = document.getElementById('chart-frequency');
    if (!el) return;
    if (charts.frequency) { charts.frequency.dispose(); charts.frequency = null; }
    const chart = echarts.init(el);
    charts.frequency = chart;

    var preset = getActiveDurationPreset();
    var yearGran = getActiveYearGranularity();
    var buckets = getFrequencyBuckets(preset, yearGran);
    var labels = buckets.map(function(b) { return b.label; });

    // Show/hide year granularity sub-toggle based on active preset
    var gran = document.getElementById('year-granularity');
    if (gran) gran.style.display = preset === '1y' ? '' : 'none';

    chart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: function(params) {
          let total = 0;
          params.forEach(p => total += p.value);
          let html = `<strong>${params[0].axisValue}</strong><br>`;
          params.forEach(p => {
            const pct = total ? ((p.value / total) * 100).toFixed(1) : '0.0';
            html += `${p.marker} ${p.seriesName}: ${p.value.toLocaleString()} (${pct}%)<br>`;
          });
          html += `<strong>Total: ${total.toLocaleString()}</strong>`;
          return html;
        }
      },
      grid: { left: 60, right: 20, top: 20, bottom: 40 },
      xAxis: { type: 'category', data: labels, axisLabel: { fontSize: 11, rotate: labels.length > 14 ? 45 : 0 } },
      yAxis: { type: 'value', axisLabel: { formatter: '{value}' } },
      series: [
        {
          name: 'Zero Previous (30d)',
          type: 'bar',
          stack: 'visits',
          data: buckets.map(function(b) { return b.zero; }),
          itemStyle: { color: ChartColors.blue }
        },
        {
          name: '1-3 Previous',
          type: 'bar',
          stack: 'visits',
          data: buckets.map(function(b) { return b.oneThree; }),
          itemStyle: { color: ChartColors.amber }
        },
        {
          name: '4+ Previous',
          type: 'bar',
          stack: 'visits',
          data: buckets.map(function(b) { return b.fourPlus; }),
          itemStyle: { color: ChartColors.green }
        }
      ]
    });
  }

  function initCrossoverChart() {
    var el = document.getElementById('chart-crossover');
    if (!el) return;
    if (charts.crossover) { charts.crossover.dispose(); charts.crossover = null; }
    var chart = echarts.init(el);
    charts.crossover = chart;

    var crossover = D.competitiveCrossover;
    var flightWeeks = D.flightWeeks;
    var weeks = flightWeeks.map(function (w) {
      var s = new Date(w.start);
      var e = new Date(w.end);
      var fmt = function (d) { return (d.getMonth() + 1) + '/' + d.getDate(); };
      return w.label + '\n' + fmt(s) + '–' + fmt(e);
    });

    // Deduplicate by competitor name and sort by latest crossover_pct descending
    var seen = {};
    var allComps = [];
    crossover.forEach(function (c) {
      if (!seen[c.competitor_name]) {
        seen[c.competitor_name] = true;
        allComps.push(c);
      }
    });
    allComps.sort(function (a, b) { return b.crossover_pct - a.crossover_pct; });

    // Top 5 + "All Other" rollup
    var top5 = allComps.slice(0, 5);
    var rest = allComps.slice(5);

    // Plan item 9 (Apr 17): top-N competitor palette — muted/warm aesthetic
// confirmed by Bill. Extend here if data has >5 top competitors.
// [0-4] = top 5 competitor colors, [5] = all-other gray, [6] = our brand blue.
var CROSSOVER_COLORS = ['#E07850', '#A8BF6E', '#2AADDB', '#D4A574', '#9B7FD4', '#9ca3af', '#4272D8'];

    var stackLabel = {
      show: true, position: 'inside', fontSize: 10, color: '#fff', fontWeight: 'bold',
      formatter: function (p) { return p.value >= 6 ? p.value.toFixed(1) + '%' : ''; }
    };

    // Build series: top 5 named + All Other (if any) + Our Brand Only (remainder to 100%)
    var namedSeries = top5.map(function (comp, i) {
      return {
        name: comp.competitor_name,
        type: 'bar',
        stack: 'crossover',
        barWidth: '60%',
        itemStyle: { color: CROSSOVER_COLORS[i] },
        label: stackLabel,
        emphasis: { focus: 'series' },
        data: comp.trend
      };
    });

    var legendNames = top5.map(function (c) { return c.competitor_name; });

    // "Our Brand Only" — remainder to fill 100% (built first so legend can lead with it)
    var ourBrandTrend = weeks.map(function (_, wi) {
      var compSum = 0;
      top5.forEach(function (c) { compSum += (c.trend[wi] || 0); });
      rest.forEach(function (c) { compSum += (c.trend[wi] || 0); });
      return Math.max(0, 100 - compSum);
    });
    namedSeries.push({
      name: 'Our Brand Only',
      type: 'bar',
      stack: 'crossover',
      barWidth: '60%',
      itemStyle: { color: CROSSOVER_COLORS[6] },
      label: stackLabel,
      emphasis: { focus: 'series' },
      data: ourBrandTrend
    });

    if (rest.length > 0) {
      var allOtherTrend = weeks.map(function (_, wi) {
        var sum = 0;
        rest.forEach(function (c) { sum += (c.trend[wi] || 0); });
        return sum;
      });
      namedSeries.push({
        name: 'All Other',
        type: 'bar',
        stack: 'crossover',
        barWidth: '60%',
        itemStyle: { color: CROSSOVER_COLORS[5] },
        label: stackLabel,
        emphasis: { focus: 'series' },
        data: allOtherTrend
      });
    }

    // Legend order: Our Brand first, named competitors, then All Other last
    legendNames = ['Our Brand Only'].concat(top5.map(function (c) { return c.competitor_name; }));
    if (rest.length > 0) legendNames.push('All Other');

    chart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: function (params) {
          var html = '<strong>' + params[0].axisValue.replace('\n', ' ') + '</strong>';
          params.forEach(function (p) {
            html += '<br>' + p.marker + ' ' + p.seriesName + ': <strong>' + p.value.toFixed(1) + '%</strong>';
          });
          return html;
        }
      },
      legend: {
        bottom: 0, icon: 'circle', itemWidth: 8, itemHeight: 8, itemGap: 20,
        textStyle: { fontSize: 12, color: '#6b7280' },
        data: legendNames
      },
      grid: { left: 50, right: 24, top: 16, bottom: 60 },
      xAxis: {
        type: 'category',
        data: weeks,
        axisLabel: { fontSize: 11, color: '#6b7280' },
        axisLine: { lineStyle: { color: '#e5e7eb' } }
      },
      yAxis: {
        type: 'value',
        max: 100,
        axisLabel: { formatter: '{value}%', fontSize: 11, color: '#6b7280' },
        splitLine: { lineStyle: { color: '#f3f4f6' } }
      },
      series: namedSeries
    });
  }

  function initCrossoverTrendChart() {
    const el = document.getElementById('chart-crossover-trend');
    if (!el) return;
    const chart = echarts.init(el);
    charts.crossoverTrend = chart;

    const weeks = D.flightWeeks.map(w => w.label);
    const colors = ChartColors.series;

    chart.setOption({
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(17,24,39,0.96)',
        borderColor: 'rgba(255,255,255,0.12)',
        textStyle: { color: '#fff', fontSize: 12 },
        formatter: function(params) { return darkAxisTooltip(params, function(v) { return v.toFixed(1) + '%'; }); }
      },
      legend: {
        data: D.competitiveCrossover.map(c => c.competitor_name),
        bottom: 0, icon: 'circle', itemWidth: 8, itemHeight: 8, itemGap: 20,
        textStyle: { fontSize: 12, color: '#6b7280' }
      },
      grid: { left: 50, right: 20, top: 20, bottom: 50 },
      xAxis: { type: 'category', data: weeks, axisLabel: { fontSize: 11 } },
      yAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
      series: D.competitiveCrossover.map((comp, i) => ({
        name: comp.competitor_name,
        type: 'line',
        data: comp.trend,
        smooth: true,
        lineStyle: { color: colors[i], width: 2 },
        itemStyle: { color: colors[i] },
        symbolSize: 6
      }))
    });
  }

  // Crossover Trend metric mode: 'share' (% per competitor) or 'volume' (visit counts Our Brand vs Competitors).
  // Replaces removed Traffic Volume tab (Bill 2026-05-03 — kill cognitive overload of separate tab).
  var _crossoverTrendMetric = 'share';
  var _crossoverTrendWeekCount = 4;

  function initCrossoverTrendPresets() {
    var container = document.getElementById('crossover-trend-presets');
    if (container) {
      var presets = container.querySelectorAll('.duration-preset');
      presets.forEach(function(btn) {
        btn.addEventListener('click', function() {
          presets.forEach(function(b) { b.classList.remove('active'); });
          btn.classList.add('active');
          var period = btn.dataset.period;
          _crossoverTrendWeekCount = period === '1w' ? 1 : period === '1m' ? 4 : period === '1q' ? 13 : 52;
          updateCrossoverTrendPeriod(_crossoverTrendWeekCount);
        });
      });
    }
    var metricEl = document.getElementById('crossover-trend-metric');
    if (metricEl) {
      var metricBtns = metricEl.querySelectorAll('.view-toggle__btn');
      metricBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
          if (btn.classList.contains('active')) return;
          metricBtns.forEach(function(b) {
            var on = b === btn;
            b.classList.toggle('active', on);
            b.setAttribute('aria-selected', on ? 'true' : 'false');
          });
          _crossoverTrendMetric = btn.dataset.trendMetric;
          updateCrossoverTrendPeriod(_crossoverTrendWeekCount);
        });
      });
    }
  }

  function updateCrossoverTrendPeriod(weekCount) {
    var el = document.getElementById('chart-crossover-trend');
    if (!el) return;
    if (charts.crossoverTrend) { charts.crossoverTrend.dispose(); charts.crossoverTrend = null; }
    var chart = echarts.init(el);
    charts.crossoverTrend = chart;

    var flightWeeks = D.flightWeeks;
    var totalWeeks = flightWeeks.length;
    var sliceStart = Math.max(0, totalWeeks - weekCount);
    var slicedWeeks = flightWeeks.slice(sliceStart).map(function(w) { return w.label; });
    var colors = ChartColors.series;

    if (_crossoverTrendMetric === 'volume') {
      // Visits view — Our Brand bar + Competitors bar from trafficShareMetrics.trend.
      var trend = (D.trafficShareMetrics && D.trafficShareMetrics.trend) || [];
      var trendSlice = trend.slice(Math.max(0, trend.length - weekCount));
      var entityName = (typeof getEntityLabel === 'function' ? getEntityLabel() : 'Our Brand');
      chart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          backgroundColor: 'rgba(17,24,39,0.96)',
          borderColor: 'rgba(255,255,255,0.12)',
          textStyle: { color: '#fff', fontSize: 12 },
          formatter: function(params) {
            var html = '<strong>' + params[0].axisValue + '</strong><br>';
            params.forEach(function(p) { html += p.marker + ' ' + p.seriesName + ': ' + p.value.toLocaleString() + '<br>'; });
            return html;
          }
        },
        legend: { data: [entityName, 'Competitors'], bottom: 0, icon: 'circle', itemWidth: 8, itemHeight: 8, itemGap: 20, textStyle: { fontSize: 12, color: '#6b7280' } },
        grid: { left: 60, right: 20, top: 20, bottom: 50 },
        xAxis: { type: 'category', data: trendSlice.map(function(w) { return D.getWeekLabel(w.week); }), axisLabel: { fontSize: 11 } },
        yAxis: { type: 'value', name: 'Visits', nameTextStyle: { fontSize: 10, color: '#9ca3af' }, axisLabel: { formatter: function(v) { return (v / 1000).toFixed(0) + 'K'; } } },
        series: [
          { name: entityName, type: 'bar', data: trendSlice.map(function(w) { return w.retailer_visits; }), itemStyle: { color: ChartColors.green, borderRadius: [3, 3, 0, 0] } },
          { name: 'Competitors', type: 'bar', data: trendSlice.map(function(w) { return w.comp_visits; }), itemStyle: { color: ChartColors.gray, borderRadius: [3, 3, 0, 0] } }
        ]
      });
      return;
    }

    chart.setOption({
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(17,24,39,0.96)',
        borderColor: 'rgba(255,255,255,0.12)',
        textStyle: { color: '#fff', fontSize: 12 },
        formatter: function(params) { return darkAxisTooltip(params, function(v) { return v.toFixed(1) + '%'; }); }
      },
      legend: {
        data: D.competitiveCrossover.map(function(c) { return c.competitor_name; }),
        bottom: 0, icon: 'circle', itemWidth: 8, itemHeight: 8, itemGap: 20,
        textStyle: { fontSize: 12, color: '#6b7280' }
      },
      grid: { left: 50, right: 20, top: 20, bottom: 50 },
      xAxis: { type: 'category', data: slicedWeeks, axisLabel: { fontSize: 11 } },
      yAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
      series: D.competitiveCrossover.map(function(comp, i) {
        return {
          name: comp.competitor_name,
          type: 'line',
          data: comp.trend.slice(sliceStart),
          smooth: true,
          lineStyle: { color: colors[i], width: 2 },
          itemStyle: { color: colors[i] },
          symbolSize: 6
        };
      })
    });
  }

  function initTrafficCombinedChart() {
    const el = document.getElementById('chart-traffic-combined');
    if (!el) return;
    const chart = echarts.init(el);
    charts.trafficCombined = chart;

    const trend = D.trafficShareMetrics.trend;
    const weeks = trend.map(w => D.getWeekLabel(w.week));
    const shareChange = D.trafficShareMetrics.summary.share_change_pp;
    const entityName = getEntityLabel();
    const lastIdx = trend.length - 1;

    // Plan item 12 (Apr 17): CTR line + Visits bar.
    // Max: "the line could be the click-through rate. Maybe store visits as
    // the bar." Bar stays visits (volume); line swaps from Share % to CTR
    // (efficiency). Mock CTR per week — deterministic sin-based drift so the
    // trend reads plausibly without real campaign data wired in yet.
    const ctrs = trend.map(function(w, i) {
      var base = 0.95;
      var drift = Math.sin(i * 0.9 + 0.3) * 0.22;
      var mediaBoost = w.retailer_visits > 12000 ? 0.08 : 0;
      return parseFloat((base + drift + mediaBoost).toFixed(2));
    });

    // Current week highlight background
    const markAreaData = lastIdx >= 0 ? [[
      { xAxis: weeks[lastIdx], itemStyle: { color: 'rgba(59, 130, 246, 0.06)' } },
      { xAxis: weeks[lastIdx] }
    ]] : [];

    chart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: function(params) {
          let html = '<strong>' + params[0].axisValue + '</strong>';
          if (params[0].axisIndex === 0 && lastIdx >= 0 && params[0].dataIndex === lastIdx) {
            html += ' <span style="color:#3B82F6;font-size:11px;">(current)</span>';
          }
          html += '<br>';
          params.forEach(function(p) {
            if (p.seriesType === 'bar') {
              html += p.marker + ' ' + p.seriesName + ': ' + p.value.toLocaleString() + '<br>';
            } else {
              html += p.marker + ' ' + p.seriesName + ': ' + p.value + '%<br>';
            }
          });
          return html;
        }
      },
      legend: { show: false },
      grid: { left: 70, right: 60, top: 40, bottom: 40 },
      xAxis: {
        type: 'category',
        data: weeks,
        axisLabel: {
          fontSize: 11,
          formatter: function(value, idx) {
            return idx === lastIdx ? '{current|' + value + '}' : value;
          },
          rich: {
            current: { fontWeight: 'bold', color: '#3B82F6' }
          }
        }
      },
      yAxis: [
        {
          type: 'value',
          name: 'Visits',
          nameTextStyle: { fontSize: 10, color: '#9ca3af' },
          axisLabel: { formatter: function(val) { return (val / 1000).toFixed(0) + 'K'; } }
        },
        {
          type: 'value',
          name: 'CTR %',
          nameTextStyle: { fontSize: 10, color: '#3B82F6' },
          min: 0,
          max: 2,
          axisLabel: { formatter: '{value}%', color: '#3B82F6' },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: entityName,
          type: 'bar',
          yAxisIndex: 0,
          data: trend.map(function(w, i) {
            return {
              value: w.retailer_visits,
              itemStyle: {
                color: ChartColors.green,
                borderRadius: [3, 3, 0, 0],
                borderWidth: i === lastIdx ? 2 : 0,
                borderColor: i === lastIdx ? '#059669' : 'transparent'
              }
            };
          }),
          barGap: '10%',
          markArea: { silent: true, data: markAreaData }
        },
        {
          name: 'Competitors',
          type: 'bar',
          yAxisIndex: 0,
          data: trend.map(function(w) {
            return {
              value: w.comp_visits,
              itemStyle: { color: ChartColors.gray, borderRadius: [3, 3, 0, 0] }
            };
          })
        },
        {
          name: 'CTR %',
          type: 'line',
          yAxisIndex: 1,
          data: ctrs.map(function(v, i) {
            return { value: v, symbolSize: i === lastIdx ? 12 : 6 };
          }),
          smooth: true,
          lineStyle: { color: '#3B82F6', width: 2.5 },
          itemStyle: { color: '#3B82F6' },
          z: 10
        }
      ],
      graphic: (function() {
        var avgCtr = ctrs.reduce(function(s, v) { return s + v; }, 0) / ctrs.length;
        var ctrDelta = ctrs[lastIdx] - ctrs[0];
        return [{
          type: 'text',
          left: 'center',
          top: 10,
          style: {
            text: 'Avg CTR: ' + avgCtr.toFixed(2) + '% · ' + (ctrDelta >= 0 ? '+' : '') + ctrDelta.toFixed(2) + 'pp over campaign',
            fill: ctrDelta >= 0 ? ChartColors.green : '#ef4444',
            fontSize: 12,
            fontWeight: 600
          }
        }];
      })()
    });
  }

  function initVideoFunnelInPanel(panelIdx) {
    const el = document.getElementById('video-funnel-chart-' + panelIdx);
    if (!el) return;
    el.style.height = '180px';
    el.style.overflow = '';
    const chart = echarts.init(el);
    charts['video-funnel-' + panelIdx] = chart;
    const v = D.videoEngagement;
    chart.setOption({
      tooltip: { trigger: 'item' },
      grid: { left: 60, right: 20, top: 10, bottom: 30 },
      xAxis: {
        type: 'category',
        data: ['Impressions', '1st Quartile (4s)', 'Midpoint (8s)', '3rd Quartile (11s)', 'Complete'],
        axisLabel: { fontSize: 10 }
      },
      yAxis: { type: 'value', show: false },
      series: [{
        type: 'bar',
        data: [
          { value: v.impressions, itemStyle: { color: ChartColors.grayLight } },
          { value: v.video_first_quartile_views, itemStyle: { color: ChartColors.blueLight } },
          { value: v.video_midpoint_views, itemStyle: { color: ChartColors.indigo } },
          { value: v.video_third_quartile_views, itemStyle: { color: ChartColors.indigoDark } },
          { value: v.video_complete_views, itemStyle: { color: ChartColors.green } }
        ],
        barWidth: '50%',
        label: { show: true, position: 'top', formatter: function(p) { return p.value.toLocaleString(); }, fontSize: 11 }
      }]
    });
  }

  function initVideoFunnelChart() {
    const el = document.getElementById('video-funnel-chart');
    if (!el) return;
    const chart = echarts.init(el);
    charts.videoFunnel = chart;

    const v = D.videoEngagement;

    chart.setOption({
      tooltip: { trigger: 'item' },
      grid: { left: 80, right: 20, top: 10, bottom: 30 },
      xAxis: {
        type: 'category',
        data: ['Impressions', '1st Quartile (4s)', 'Midpoint (8s)', '3rd Quartile (11s)', 'Complete'],
        axisLabel: { fontSize: 10 }
      },
      yAxis: { type: 'value', show: false },
      series: [{
        type: 'bar',
        data: [
          { value: v.impressions, itemStyle: { color: ChartColors.grayLight } },
          { value: v.video_first_quartile_views, itemStyle: { color: ChartColors.blueLight } },
          { value: v.video_midpoint_views, itemStyle: { color: ChartColors.indigo } },
          { value: v.video_third_quartile_views, itemStyle: { color: ChartColors.indigoDark } },
          { value: v.video_complete_views, itemStyle: { color: ChartColors.green } }
        ],
        barWidth: '50%',
        label: {
          show: true,
          position: 'top',
          formatter: function(params) {
            return params.value.toLocaleString();
          },
          fontSize: 11
        }
      }]
    });
  }

  // ── Traffic Chart: % Share / Total Visits Toggle ──────────────────────────
  var _trafficChartView = 'share'; // 'share' or 'volume'

  function initTrafficChartToggle() {
    var toggle = document.getElementById('traffic-chart-toggle');
    if (!toggle) return;
    var btns = toggle.querySelectorAll('[data-traffic-view]');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var view = btn.dataset.trafficView;
        if (view === _trafficChartView) return;
        _trafficChartView = view;
        btns.forEach(function (b) { b.classList.toggle('active', b.dataset.trafficView === view); });
        updateTrafficCombinedChart();
      });
    });
  }

  // ── Store Performance: Our Stores / Competitors toggle ─────────────────────
  function initLeaderboardViewToggle() {
    var toggle = document.getElementById('leaderboard-view-toggle');
    if (!toggle) return;
    var btns = toggle.querySelectorAll('[data-leaderboard-view]');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var view = btn.dataset.leaderboardView;
        if (view === _leaderboardView) return;
        _leaderboardView = view;
        btns.forEach(function (b) {
          b.classList.toggle('active', b.dataset.leaderboardView === view);
        });
        renderLeaderboard();
      });
    });
  }

  function updateTrafficCombinedChart() {
    var chart = charts.trafficCombined;
    if (!chart) return;
    var trend = D.trafficShareMetrics.trend;
    var isVolume = _trafficChartView === 'volume';

    // Show/hide the CTR line + right y-axis (plan item 12).
    chart.setOption({
      yAxis: [
        {}, // left axis unchanged
        {
          show: !isVolume,
          type: 'value',
          name: isVolume ? '' : 'CTR %',
          nameTextStyle: { fontSize: 10, color: '#3B82F6' },
          min: isVolume ? undefined : 0,
          max: isVolume ? undefined : 2,
          axisLabel: { show: !isVolume, formatter: '{value}%', color: '#3B82F6' },
          splitLine: { show: false }
        }
      ],
      series: [
        {}, // retailer bars unchanged
        {}, // competitor bars unchanged
        {
          // share line: visible in share mode, hidden in volume mode
          lineStyle: { opacity: isVolume ? 0 : 1 },
          itemStyle: { opacity: isVolume ? 0 : 1 },
          label: { show: false },
          silent: isVolume
        }
      ]
    });
  }

  // initVolumeChart removed — merged into initTrafficCombinedChart()

  function initDemographicCharts() {
    // Age bar chart
    initBarChart('chart-demo-age', D.demographics.age, ChartColors.indigo);

    // Gender pie chart
    initPieChart('chart-demo-gender', D.demographics.gender);

    // Income bar chart
    initBarChart('chart-demo-income', D.demographics.household_income, ChartColors.teal);

    // Net worth bar chart
    initBarChart('chart-demo-networth', D.demographics.net_worth, ChartColors.purple);

    // Marital status pie chart
    initPieChart('chart-demo-marital', D.demographics.marital_status, ChartColors.amber);

    // Presence of children pie chart
    initPieChart('chart-demo-children', D.demographics.children, ChartColors.green);

    // Homeowner status pie chart
    initPieChart('chart-demo-homeowner', D.demographics.homeowner, ChartColors.red);

    // Household size bar chart
    initBarChart('chart-demo-household', D.demographics.household_size, ChartColors.blue);
  }

  function initBarChart(id, data, color) {
    const el = document.getElementById(id);
    if (!el) return;
    const chart = echarts.init(el);
    charts[id] = chart;

    chart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 60, right: 10, top: 10, bottom: 30 },
      xAxis: {
        type: 'category',
        data: data.map(d => d.label),
        axisLabel: { fontSize: 10, rotate: data.length > 5 ? 30 : 0 }
      },
      yAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
      series: [{
        type: 'bar',
        data: data.map(d => d.value),
        itemStyle: { color: color, borderRadius: [3, 3, 0, 0] },
        barWidth: '60%',
        label: { show: true, position: 'top', formatter: '{c}%', fontSize: 10 }
      }]
    });
  }

  function initPieChart(id, data, primaryColor) {
    const el = document.getElementById(id);
    if (!el) return;
    const chart = echarts.init(el);
    charts[id] = chart;

    const color1 = primaryColor || ChartColors.indigo;

    chart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: {c}% ({d}%)' },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '50%'],
        data: data.map((d, i) => ({
          value: d.value,
          name: d.label,
          itemStyle: { color: i === 0 ? color1 : ChartColors.grayLight }
        })),
        label: {
          formatter: '{b}\n{c}%',
          fontSize: 11
        }
      }]
    });
  }

  // ========================================
  // Event Handlers
  // ========================================

  function handleDashboardChange(dashboard) {
    if (dashboard === 'engagement') {
      // Navigate back to last engagement view
      const viewMode = (typeof StateService !== 'undefined' && StateService.get('viewMode')) || 'categories';
      window.location.href = `../${viewMode}/${viewMode}.html`;
    }
  }

  function handleModeChange(mode) {
    // Mode buttons are hidden in distribution — shouldn't fire, but handle gracefully
    if (mode === 'base') {
      window.location.href = '../categories/categories.html';
    }
  }

  function handleViewChange(view) {
    // Subtabs are hidden in distribution — shouldn't fire, but handle gracefully
  }

  function handleSectionNavClick(e) {
    e.preventDefault();
    const target = e.currentTarget.getAttribute('href');
    const section = document.querySelector(target);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Update active state
    document.querySelectorAll('.section-nav__link').forEach(l => l.classList.remove('active'));
    e.currentTarget.classList.add('active');
  }

  function handleScrollSpy() {
    const sections = document.querySelectorAll('.dist-section');
    const navLinks = document.querySelectorAll('.section-nav__link');
    let currentSection = '';

    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 200) {
        currentSection = section.id;
      }
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      link.classList.toggle('active', href === currentSection);
    });
  }

  function handleGroupToggle(e) {
    if (e.target.checked) {
      renderGroupView();
    } else {
      renderLeaderboard();
    }
  }

  function renderGroupView() {
    const groups = D.storeGroups;
    const leaderboard = D.trafficShareMetrics.storeLeaderboard;

    elements.leaderboardTable.innerHTML = groups.map(function(group) {
      // Get leaderboard entries for stores in this group
      const groupStores = leaderboard.filter(function(s) {
        return group.stores.includes(s.store_id);
      });

      // Aggregate metrics
      const avgShare = groupStores.length > 0
        ? (groupStores.reduce(function(sum, s) { return sum + s.wk2_share; }, 0) / groupStores.length).toFixed(1)
        : '0.0';
      const avgChange = groupStores.length > 0
        ? (groupStores.reduce(function(sum, s) { return sum + s.change_pp; }, 0) / groupStores.length).toFixed(1)
        : '0.0';

      return '<div class="group-card">' +
        '<div class="group-card__header">' +
          '<span class="group-badge" style="background: ' + group.color + ';"></span>' +
          '<span class="group-label">' + group.label + '</span>' +
          '<span class="group-count">' + group.stores.length + ' stores</span>' +
        '</div>' +
        '<div class="group-card__metrics">' +
          '<div class="group-metric">' +
            '<span class="group-metric__label">Avg Share</span>' +
            '<span class="group-metric__value">' + avgShare + '%</span>' +
          '</div>' +
          '<div class="group-metric">' +
            '<span class="group-metric__label">Avg Change</span>' +
            '<span class="group-metric__value ' + (parseFloat(avgChange) >= 0 ? 'positive' : 'negative') + '">' +
              (parseFloat(avgChange) >= 0 ? '+' : '') + avgChange + ' pp</span>' +
          '</div>' +
        '</div>' +
        '<div class="group-card__stores">' +
          groupStores.map(function(s) {
            return '<span class="group-store-chip">' + s.store_id + ' · ' + s.city + '</span>';
          }).join('') +
        '</div>' +
      '</div>';
    }).join('');
  }

  function bindLeaderboardHeaderSort() {
    var table = document.getElementById('leaderboard-table');
    if (!table) return;
    table.addEventListener('click', function (e) {
      var col = e.target.closest('.lb-col--sortable');
      if (!col) return;
      renderLeaderboard(col.dataset.sort);
    });
  }

  // ========================================
  // Window resize handler for charts
  // ========================================

  window.addEventListener('resize', () => {
    Object.values(charts).forEach(chart => {
      if (chart && chart.resize) chart.resize();
    });
    if (typeof StoreMap !== 'undefined') StoreMap.invalidateSize();
  });

  // ========================================
  // Init on DOM ready
  // ========================================

  // Listen for data refresh events from modals
  document.addEventListener('distribution:dataRefresh', function() {
    renderAll();
    // Dispose and re-init charts with new data
    Object.values(charts).forEach(function(chart) {
      if (chart && chart.dispose) chart.dispose();
    });
    charts = {};
    initCharts();
    updateFilterChips();
  });

  // ========================================
  // Level 2 Toggle (Progressive Disclosure)
  // ========================================

  // Track which Level 2 sections have been initialized (charts need visible container)
  let _level2Initialized = {};

  // ========================================
  // Store Table Sorting
  // ========================================

  window.sortStoreTable = function(th) {
    var table = th.closest('table');
    if (!table) return;
    var tbody = table.querySelector('tbody');
    var rows = Array.from(tbody.querySelectorAll('tr'));
    var colIdx = Array.from(th.parentNode.children).indexOf(th);
    var sortKey = th.dataset.sort;
    var isNumeric = ['impressions', 'clicks', 'ctr', 'visits', 'cpv'].includes(sortKey);

    // Toggle direction
    var currentDir = th.dataset.dir || 'none';
    var newDir = currentDir === 'asc' ? 'desc' : 'asc';

    // Clear all sort states in this table
    th.parentNode.querySelectorAll('th').forEach(function(h) {
      h.dataset.dir = 'none';
      h.classList.remove('sort-asc', 'sort-desc');
    });

    th.dataset.dir = newDir;
    th.classList.add(newDir === 'asc' ? 'sort-asc' : 'sort-desc');

    rows.sort(function(a, b) {
      var aCell = a.children[colIdx];
      var bCell = b.children[colIdx];
      var aVal, bVal;

      if (isNumeric) {
        aVal = parseFloat(aCell.dataset.value || aCell.textContent.replace(/[^0-9.\-]/g, '')) || 0;
        bVal = parseFloat(bCell.dataset.value || bCell.textContent.replace(/[^0-9.\-]/g, '')) || 0;
      } else {
        aVal = aCell.textContent.trim().toLowerCase();
        bVal = bCell.textContent.trim().toLowerCase();
      }

      if (aVal < bVal) return newDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return newDir === 'asc' ? 1 : -1;
      return 0;
    });

    rows.forEach(function(row) { tbody.appendChild(row); });
  };

  // Toggle tree row expand/collapse
  window.toggleDistTreeRow = function(creativeId) {
    distTreeState.expandedCreatives[creativeId] = !distTreeState.expandedCreatives[creativeId];
    const isExpanded = distTreeState.expandedCreatives[creativeId];

    // Toggle child rows
    document.querySelectorAll(`[data-parent="${creativeId}"]`).forEach(row => {
      row.classList.toggle('tree-row-hidden', !isExpanded);
    });

    // Toggle chevron
    const parentRow = document.querySelector(`[data-creative-id="${creativeId}"]`);
    if (parentRow) {
      const toggle = parentRow.querySelector('.tree-toggle');
      if (toggle) toggle.classList.toggle('collapsed', !isExpanded);
    }

    // Lazy-init video funnel chart on first expand
    if (isExpanded) {
      const funnelEl = document.getElementById('video-funnel-chart-tree');
      if (funnelEl && !funnelEl._initialized) {
        funnelEl._initialized = true;
        // Video funnel chart init would go here if needed
      }
    }
  };

  // View Details — scrolls to and expands the corresponding tree row
  // Phase 3 step 8 — Creative detail sidebar.
  // viewVariantDetails now opens the .ep-detail-sidebar instead of the
  // old "expand the Detailed Breakdown row + scroll" behavior.

  function getCreativeThumbUrl(cr) {
    return cr && cr.file_url ? cr.file_url : null;
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function formatRange(cr) {
    if (!cr.date_range_start && !cr.date_range_end) return '—';
    return (cr.date_range_start || '?') + ' — ' + (cr.date_range_end || '?');
  }

  // Inline creative detail — replaces the old slide-in sidebar.
  // Renders the .creative-card layout (borderless) into #creative-inline-detail-body
  // when a chip is clicked. "All Media Campaigns" chip resets to placeholder.
  function renderCreativeDetailSidebar(cr) {
    const body = document.getElementById('creative-inline-detail-body');
    if (!body) return;
    const thumbUrl = getCreativeThumbUrl(cr);
    const typeIcon = cr.creative_type === 'video' ? 'movie' : (cr.creative_type === 'gif' ? 'gif_box' : 'image');
    const m = cr.metrics || {};
    const labelParts = (cr.label || cr.notes || '').split(' — ');
    const name = labelParts[0] || cr.label || '(unnamed)';
    const region = labelParts[1] || '';
    const rank = (cr._origIndex != null ? cr._origIndex : 0) + 1;

    const thumbInner = thumbUrl
      ? `<img src="${escapeHtml(thumbUrl)}" alt="${escapeHtml(name)} preview" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'material-symbols-outlined',textContent:'${typeIcon}'}))">`
      : `<span class="material-symbols-outlined">${typeIcon}</span>`;

    body.innerHTML = `
      <div class="creative-card creative-card--borderless">
        <div class="creative-card__top">
          <div class="creative-card__top-left">
            <span class="creative-card__rank">${rank}</span>
            <div class="creative-card__info">
              <div class="creative-card__thumb creative-card__thumb--xl">${thumbInner}</div>
              <div class="creative-card__info_text">
                <div class="creative-card__name">${escapeHtml(name)}</div>
                ${region ? `<div class="creative-card__region">${escapeHtml(region)}</div>` : ''}
                <div class="creative-card__date">${escapeHtml(formatRange(cr))}</div>
                <div class="creative-card__actions">
                  ${cr.target_url ? `<a class="creative-card__link" href="${escapeHtml(cr.target_url)}" target="_blank" rel="noopener"><span class="material-symbols-outlined" style="font-size:14px;">link</span> Promotion Link</a>` : ''}
                </div>
              </div>
            </div>
          </div>
          <div class="creative-card__metrics">
            <div class="creative-metric-tile">
              <div class="creative-metric-tile__label">Stores</div>
              <div class="creative-metric-tile__value">${cr.store_group ? cr.store_group.length : 0}</div>
            </div>
            <div class="creative-metric-tile">
              <div class="creative-metric-tile__label">CTR</div>
              <div class="creative-metric-tile__value">${m.ctr != null ? fmtPct(m.ctr) : '—'}</div>
            </div>
            <div class="creative-metric-tile">
              <div class="creative-metric-tile__label">Visits</div>
              <div class="creative-metric-tile__value">${m.gross_visits != null ? fmtNumber(m.gross_visits) : '—'}</div>
            </div>
            <div class="creative-metric-tile">
              <div class="creative-metric-tile__label">CPM</div>
              <div class="creative-metric-tile__value">${m.cpm != null ? fmtCurrency(m.cpm) : '—'}</div>
            </div>
            <div class="creative-metric-tile">
              <div class="creative-metric-tile__label">CPC</div>
              <div class="creative-metric-tile__value">${m.cpc != null ? fmtCurrency(m.cpc) : '—'}</div>
            </div>
            <div class="creative-metric-tile">
              <div class="creative-metric-tile__label">Spend</div>
              <div class="creative-metric-tile__value">${m.spend != null ? fmtCurrency(m.spend) : '—'}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderAllCampaignsAggregate() {
    const body = document.getElementById('creative-inline-detail-body');
    if (!body) return;
    const records = (D.creativeRecords || []).filter(Boolean);
    const n = records.length;
    let totalImp = 0, totalClicks = 0, totalVisits = 0, totalSpend = 0;
    const storeSet = new Set();
    let earliest = null, latest = null;
    records.forEach(cr => {
      const m = cr.metrics || {};
      totalImp += +m.impressions || 0;
      totalClicks += (+m.impressions || 0) * (+m.ctr || 0);
      totalVisits += +m.gross_visits || 0;
      totalSpend += +m.spend || 0;
      (cr.store_group || []).forEach(s => storeSet.add(typeof s === 'object' ? (s.id || s.store_id || JSON.stringify(s)) : s));
      if (cr.date_range_start && (!earliest || cr.date_range_start < earliest)) earliest = cr.date_range_start;
      if (cr.date_range_end && (!latest || cr.date_range_end > latest)) latest = cr.date_range_end;
    });
    const ctr = totalImp ? totalClicks / totalImp : null;
    const cpm = totalImp ? (totalSpend / totalImp) * 1000 : null;
    const cpc = totalClicks ? totalSpend / totalClicks : null;
    const dateRange = (earliest || latest) ? `${earliest || '?'} — ${latest || '?'}` : '—';

    body.innerHTML = `
      <div class="creative-card creative-card--borderless">
        <div class="creative-card__top">
          <div class="creative-card__top-left">
            <div class="creative-card__info">
              <div class="creative-card__info_text">
                <div class="creative-card__name">All Media Campaigns</div>
                <div class="creative-card__region">${n} campaign${n === 1 ? '' : 's'}</div>
                <div class="creative-card__date">${escapeHtml(dateRange)}</div>
              </div>
            </div>
          </div>
          <div class="creative-card__metrics">
            <div class="creative-metric-tile">
              <div class="creative-metric-tile__label">Stores</div>
              <div class="creative-metric-tile__value">${storeSet.size}</div>
            </div>
            <div class="creative-metric-tile">
              <div class="creative-metric-tile__label">CTR</div>
              <div class="creative-metric-tile__value">${ctr != null ? fmtPct(ctr) : '—'}</div>
            </div>
            <div class="creative-metric-tile">
              <div class="creative-metric-tile__label">Visits</div>
              <div class="creative-metric-tile__value">${fmtNumber(totalVisits)}</div>
            </div>
            <div class="creative-metric-tile">
              <div class="creative-metric-tile__label">CPM</div>
              <div class="creative-metric-tile__value">${cpm != null ? fmtCurrency(cpm) : '—'}</div>
            </div>
            <div class="creative-metric-tile">
              <div class="creative-metric-tile__label">CPC</div>
              <div class="creative-metric-tile__value">${cpc != null ? fmtCurrency(cpc) : '—'}</div>
            </div>
            <div class="creative-metric-tile">
              <div class="creative-metric-tile__label">Spend</div>
              <div class="creative-metric-tile__value">${fmtCurrency(totalSpend)}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function resetCreativeInlineDetail() {
    renderAllCampaignsAggregate();
  }

  function setActiveChip(activeIdx) {
    const allChip = document.getElementById('creative-all-chip');
    const isAll = activeIdx == null;
    if (allChip) {
      allChip.classList.toggle('creative-chip--active', isAll);
      allChip.setAttribute('aria-pressed', isAll ? 'true' : 'false');
    }
    document.querySelectorAll('#creative-chips-strip .creative-chip').forEach(chip => {
      const on = !isAll && parseInt(chip.dataset.origIndex, 10) === activeIdx;
      chip.classList.toggle('creative-chip--active', on);
      chip.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  // Wire All-chip click once.
  let _allChipWired = false;
  function ensureAllChipWired() {
    if (_allChipWired) return;
    _allChipWired = true;
    const allChip = document.getElementById('creative-all-chip');
    if (allChip) {
      allChip.addEventListener('click', () => {
        setActiveChip(null);
        resetCreativeInlineDetail();
      });
    }
  }

  window.viewVariantDetails = function(variantIndex) {
    const records = D.creativeRecords;
    if (variantIndex >= records.length) return;
    const cr = records[variantIndex];
    if (!cr) return;
    ensureAllChipWired();
    setActiveChip(variantIndex);
    renderCreativeDetailSidebar(cr);
  };

  window.toggleLevel2Section = function(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const wasExpanded = section.classList.contains('expanded');
    section.classList.toggle('expanded');

    // If expanding, initialize charts on first open (they need visible container for sizing)
    if (!wasExpanded) {
      setTimeout(function() {
        if (!_level2Initialized[sectionId]) {
          _level2Initialized[sectionId] = true;

          if (sectionId === 'trends-section-wrapper') {
            initSparklines();
          } else if (sectionId.startsWith('variant-panel-')) {
            // Check if this variant has a video funnel chart
            var funnelIdx = sectionId.replace('variant-panel-', '');
            var funnelEl = document.getElementById('video-funnel-chart-' + funnelIdx);
            if (funnelEl) {
              initVideoFunnelInPanel(funnelIdx);
            }
          }
        }

        // Resize any existing eCharts in the section
        section.querySelectorAll('[_echarts_instance_]').forEach(function(el) {
          const inst = echarts.getInstanceByDom(el);
          if (inst) inst.resize();
        });
      }, 50);
    }
  };

  // Expose init for lazy activation by app.js (no auto-init in combined prototype)
  window.initDistribution = init;

  // ── Per-page init (standalone distribution HTML pages) ────────────────────────
  //
  // Called by distribution-page-app.js on each section's own HTML file.
  // Initializes only the context + the specific section, not all three at once.

  function bindPageEvents(section) {
    // Traffic Share has its own interactive controls
    if (section === 'traffic') {
      var groupToggle = document.getElementById('store-group-toggle');
      if (groupToggle) groupToggle.addEventListener('change', handleGroupToggle);
      bindLeaderboardHeaderSort();
    }

    // Re-render this section when modals apply new filters/dates
    document.addEventListener('distribution:dataRefresh', function () {
      Object.values(charts).forEach(function (c) { if (c && c.dispose) c.dispose(); });
      charts = {};

      if (section === 'media') {
        renderMediaHero(); renderCreativeList(); renderDeliveryTrends();
        renderVariantPanels();
        _level2Initialized = {}; // Reset so sparklines/funnels re-init on next expand
      } else if (section === 'visitation') {
        donutFilterSegment = null;
        renderVisitationKpis(); renderStorePerfHero(); renderSegmentDetail();
        storePerfState.allRows = [];
        buildStorePerformanceData(); renderStorePerformanceTable();
        initVisitDonut();
        if (_trendViewInitialized) { initFrequencyChart(); initCrossoverTrendChart(); }
      } else if (section === 'traffic') {
        renderTrafficKpis(); /* renderTrafficLeaderboardPreview removed — Top Stores preview deleted from Overview */
        initTrafficCombinedChart(); initCrossoverChart(); renderCrossoverDetail();
        initTrafficShareTabs();
      }
      updateRetailerLabels();
      initContext();
    });
  }

  window.initDistributionPage = function (section) {
    try {
      initContext();
      cacheElements();
      bindPageEvents(section);
      updateRetailerLabels();

      if (section === 'media') {
        renderMediaHero();
        renderCreativeList();
        renderDeliveryTrends();
        renderVariantPanels();
        initTreeTableActions();
        renderMediaAttributedVisits();
        initMediaBuyTabs();
      } else if (section === 'visitation') {
        renderVisitationKpis();
        renderStorePerfHero();
        renderSegmentDetail();
        buildStorePerformanceData();
        renderStorePerformanceTable();
        renderStorePerformanceBarView();
        initViewToggle();
        initVisitDonut();
        bindStorePerformanceActions();
        initPerfSubtabs();
        initPerfViewToggle();
        initPerfTabs();
        initDurationPresets();
        initDemographics();
      } else if (section === 'traffic') {
        renderTrafficKpis();
        /* renderTrafficLeaderboardPreview removed — Top Stores preview deleted from Overview */
        initTrafficCombinedChart();
        initCrossoverChart();
        renderCrossoverDetail();
        initTrafficChartToggle();
        initLeaderboardViewToggle();
        initCrossoverPeriodPresets();
        updateCrossoverChartPeriod(4);
        initCrossoverTrendChart();
        initCrossoverTrendPresets();
        updateCrossoverTrendPeriod(4);
        bindTrafficStoreSelection();
        initTrafficShareTabs();
      }

      console.log('Distribution page initialized:', section);
    } catch (error) {
      console.error('Failed to initialize distribution page:', error);
    }
  };

  /* ============================================================
     Phase 2: Performance / Demographics sub-tab toggle
     ============================================================ */
  function initPerfSubtabs() {
    var container = document.getElementById('perf-subtabs');
    if (!container) return;
    var tabs = container.querySelectorAll('.perf-subtab');
    tabs.forEach(function(tab) {
      tab.addEventListener('click', function() {
        tabs.forEach(function(t) { t.classList.remove('active'); });
        tab.classList.add('active');
        var target = tab.dataset.subtab;
        document.querySelectorAll('.perf-subtab-content').forEach(function(c) {
          c.classList.toggle('active', c.id === 'perf-' + target);
        });
        // ECharts can't size into display:none; resize when Demographics tab shown
        if (target === 'demographics') {
          setTimeout(function() {
            document.querySelectorAll('#perf-demographics [id^="chart-demo-"]').forEach(function(el) {
              var inst = echarts.getInstanceByDom(el);
              if (inst) inst.resize();
            });
          }, 50);
        }
      });
    });
  }

  /* ============================================================
     Phase 2: Bar View / Data View toggle
     ============================================================ */
  // Apr 28 plan #3: per-store trend chart state
  var _perfStoreTrendChart = null;
  var _perfStoreTrendDuration = '4w';

  function initPerfViewToggle() {
    var toggle = document.getElementById('perf-view-toggle');
    if (!toggle) return;
    toggle.querySelectorAll('.view-toggle__btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        toggle.querySelectorAll('.view-toggle__btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var view = btn.dataset.perfView;
        var barEl = document.getElementById('store-perf-bar-view');
        var dataEl = document.getElementById('store-perf-data-view');
        var trendEl = document.getElementById('store-perf-trend-view');
        var moreWrap = document.getElementById('store-perf-more-wrap');
        var presetWrap = document.getElementById('perf-store-duration-presets');
        var subtitle = document.getElementById('perf-store-subtitle');
        if (barEl) barEl.classList.toggle('active', view === 'bar');
        if (dataEl) dataEl.classList.toggle('active', view === 'data');
        if (trendEl) trendEl.hidden = (view !== 'trend');
        if (moreWrap) moreWrap.style.display = view === 'data' ? '' : 'none';
        if (presetWrap) presetWrap.hidden = (view !== 'trend');
        if (subtitle) {
          subtitle.textContent =
            view === 'bar'   ? 'Horizontal bars — one row per store, sorted by visits descending.' :
            view === 'data'  ? 'Sortable table — visits, share, delta vs prior period.' :
            view === 'trend' ? 'Trend over time — one line per store across the selected duration. Click a legend chip to isolate.' :
            '';
        }
        if (view === 'trend') renderPerfStoreTrend();
      });
    });
    // Duration preset wiring (Trend view only)
    var presets = document.getElementById('perf-store-duration-presets');
    if (presets) {
      presets.querySelectorAll('.duration-preset').forEach(function(btn) {
        btn.addEventListener('click', function() {
          presets.querySelectorAll('.duration-preset').forEach(function(b) { b.classList.remove('active'); });
          btn.classList.add('active');
          _perfStoreTrendDuration = btn.dataset.duration;
          renderPerfStoreTrend();
        });
      });
    }
  }

  // Apr 28 plan #3: per-store trend over time. Reuses bucketLabelsFor() so the
  // axis matches Visitation/Demographics tabs. Mock series jitter so each store
  // reads as a plausible drift, deterministic via sin so it doesn't reshuffle.
  function renderPerfStoreTrend() {
    var host = document.getElementById('store-perf-trend-chart');
    if (!host) return;
    if (!_perfStoreTrendChart) _perfStoreTrendChart = echarts.init(host);
    var buckets = bucketLabelsFor(_perfStoreTrendDuration);
    // Pull store list from currently-rendered bar view; fall back to STORES global if present.
    var stores = (typeof STORES !== 'undefined' && Array.isArray(STORES))
      ? STORES.slice(0, 8).map(function(s) { return { name: s.name || s.id || ('Store ' + s.id), base: s.visits || s.total_visits || 1000 }; })
      : [
        { name: '#705 Haines City',   base: 5650 },
        { name: '#2487 Sarasota',     base: 4889 },
        { name: '#2288 Orlando',      base: 4608 },
        { name: '#726 St James City', base: 4185 },
        { name: '#481 Jacksonville',  base: 3580 },
        { name: '#436 Tampa',         base: 2146 },
        { name: '#123 Jacksonville',  base: 1394 },
        { name: '#711 Orlando',       base: 932 }
      ];
    var palette = ['#4272D8', '#E07850', '#A8BF6E', '#2AADDB', '#D4A574', '#9B7FD4', '#C48AA9', '#7A9A99'];
    var series = stores.map(function(s, i) {
      var data = buckets.map(function(_, b) {
        var jitter = Math.sin((b + 1) * 0.6 + i * 1.1) * 0.18;
        return Math.max(0, Math.round(s.base * (1 + jitter)));
      });
      return {
        name: s.name, type: 'line', smooth: true, symbolSize: 6,
        lineStyle: { width: 2 }, itemStyle: { color: palette[i % palette.length] }, data: data
      };
    });
    _perfStoreTrendChart.setOption({
      grid: { left: 60, right: 20, top: 30, bottom: 70, containLabel: true },
      legend: {
        data: stores.map(function(s) { return s.name; }), bottom: 0, type: 'scroll',
        icon: 'circle', itemWidth: 10, itemHeight: 10, itemGap: 16,
        textStyle: { fontSize: 11, color: '#6b7280' }
      },
      xAxis: {
        type: 'category', data: buckets,
        axisLabel: { fontSize: 11, color: '#6b7280' },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        boundaryGap: false
      },
      yAxis: {
        type: 'value',
        axisLabel: { fontSize: 11, color: '#6b7280', formatter: function(v) { return v >= 1000 ? (v/1000).toFixed(1) + 'k' : v; } },
        splitLine: { lineStyle: { color: '#f3f4f6' } }
      },
      series: series,
      tooltip: {
        trigger: 'axis', axisPointer: { type: 'line' },
        backgroundColor: 'rgba(17,24,39,0.96)',
        borderColor: 'rgba(255,255,255,0.12)',
        textStyle: { color: '#fff', fontSize: 12 },
        formatter: function(params) {
          return darkAxisTooltip(params, function(v) { return v >= 1000 ? (v / 1000).toFixed(1) + 'k' : String(v); });
        }
      }
    }, true);
    setTimeout(function() { _perfStoreTrendChart.resize(); }, 50);
  }

  /* ============================================================
     Plan item 3 (Apr 17): By Store / By Creative / By Day tabs
     + Overview tab (all three combined)
     ============================================================ */
  var _perfCreativeChart = null;
  var _perfDayChart = null;
  var _perfDowChart = null;
  var _perfOverviewCreativeChart = null;
  var _perfOverviewStoreChart = null;
  var _perfOverviewDowChart = null;
  var _activePerfCreative = 'all';

  // Creative definitions — mirrors distribution-records.js
  var CREATIVE_DEFS = [
    {
      key: 'creative-b', label: 'Holiday Banner', region: 'Central FL',
      type: 'jpeg', typeIcon: 'image', dims: '728×90', w: 728, h: 90,
      accent: '#1565C0',
      dateStart: 'Dec 10, 2025', dateEnd: 'Dec 30, 2025', numDays: 21,
      // Pulse-aligned campaign metadata
      channel: 'display', pulseType: 'BannerAd', group: 'SEG 27',
      kpi: 'awareness', kpiMetric: 'ctr', kpiValue: 0.6,
      status: 'Live', statusOn: 'on',
      frequencyAmount: 4, frequencyInterval: 'hour', pacing: 'evenly',
      flights: [{ start: '2025-12-10', end: '2025-12-30', budget: 2062.39 }],
      stores: [
        { num: 705, city: 'Haines City' }, { num: 2288, city: 'Orlando' },
        { num: 2415, city: 'Tampa' },       { num: 2434, city: 'Daytona Beach' },
        { num: 2474, city: 'Melbourne' },   { num: 2480, city: 'Lakeland' },
        { num: 2487, city: 'Sarasota' },    { num: 2490, city: 'Port Charlotte' },
        { num: 2501, city: 'Palm Bay' },    { num: 2509, city: 'Bradenton' },
        { num: 2545, city: 'The Villages' },{ num: 711,  city: 'Spring Hill' }
      ],
      dowVisits: [1480, 1320, 1510, 1750, 2040, 2380, 2210]
    },
    {
      key: 'creative-a', label: 'Holiday Steak', region: 'South FL',
      type: 'gif', typeIcon: 'gif_box', dims: '300×250', w: 300, h: 250,
      accent: '#c62828',
      dateStart: 'Dec 10, 2025', dateEnd: 'Dec 30, 2025', numDays: 21,
      channel: 'display', pulseType: 'BannerAd', group: 'SEG 27',
      kpi: 'awareness', kpiMetric: 'ctr', kpiValue: 0.6,
      status: 'Live', statusOn: 'on',
      frequencyAmount: 4, frequencyInterval: 'hour', pacing: 'evenly',
      flights: [{ start: '2025-12-10', end: '2025-12-30', budget: 1394.98 }],
      stores: [
        { num: 319, city: 'Homestead' },  { num: 336, city: 'Hollywood' },
        { num: 381, city: 'Belle Glade' },{ num: 508, city: 'Fort Myers' },
        { num: 518, city: 'Naples' },     { num: 726, city: 'St James City' }
      ],
      dowVisits: [280, 250, 310, 420, 590, 740, 680]
    },
    {
      key: 'creative-c', label: 'BOGO Produce', region: 'North FL',
      type: 'gif', typeIcon: 'gif_box', dims: '320×480', w: 320, h: 480,
      accent: '#2e7d32',
      dateStart: 'Dec 17, 2025', dateEnd: 'Jan 6, 2026', numDays: 21,
      channel: 'display', pulseType: 'BannerAd', group: 'SEG 27',
      kpi: 'awareness', kpiMetric: 'ctr', kpiValue: 0.6,
      status: 'Live', statusOn: 'on',
      frequencyAmount: 4, frequencyInterval: 'hour', pacing: 'evenly',
      flights: [{ start: '2025-12-17', end: '2026-01-06', budget: 1820.50 }],
      stores: [
        { num: 86,   city: 'Tallahassee' },     { num: 195,  city: 'Jacksonville Bch' },
        { num: 560,  city: 'Gainesville' },      { num: 2247, city: 'Panama City' },
        { num: 2399, city: 'Pensacola' },        { num: 2437, city: 'Ocala' },
        { num: 2449, city: 'Deltona' },          { num: 2482, city: 'St. Augustine' },
        { num: 2495, city: 'Lake City' },        { num: 436,  city: 'Jacksonville' }
      ],
      dowVisits: [920, 860, 940, 1010, 1280, 1540, 1420]
    },
    {
      key: 'creative-d', label: 'Value Pack', region: 'Harveys',
      type: 'jpeg', typeIcon: 'image', dims: '300×250', w: 300, h: 250,
      accent: '#6a1b9a',
      dateStart: 'Dec 10, 2025', dateEnd: 'Dec 30, 2025', numDays: 21,
      channel: 'display', pulseType: 'BannerAd', group: 'SEG 27',
      kpi: 'awareness', kpiMetric: 'ctr', kpiValue: 0.6,
      status: 'Live', statusOn: 'on',
      frequencyAmount: 4, frequencyInterval: 'hour', pacing: 'evenly',
      flights: [{ start: '2025-12-10', end: '2025-12-30', budget: 980.00 }],
      stores: [
        { num: 1671, city: 'Waycross' },  { num: 1690, city: 'Douglas' },
        { num: 1692, city: 'Valdosta' },  { num: 1694, city: 'Tifton' },
        { num: 1710, city: 'Fitzgerald' },{ num: 1712, city: 'Bainbridge' },
        { num: 1716, city: 'Albany' }
      ],
      dowVisits: [310, 350, 400, 440, 520, 680, 590]
    },
    {
      key: 'creative-e', label: 'YouTube Pre-Roll', region: 'Holiday',
      type: 'video', typeIcon: 'movie', dims: '1920×1080', w: 1920, h: 1080,
      accent: '#bf360c',
      dateStart: 'Dec 24, 2025', dateEnd: 'Jan 6, 2026', numDays: 14,
      channel: 'youtube', pulseType: 'VideoAd', group: 'SEG 27 - Video',
      kpi: 'video', kpiMetric: 'vcr', kpiValue: 50,
      status: 'Live', statusOn: 'on',
      frequencyAmount: 2, frequencyInterval: 'day', pacing: 'evenly',
      flights: [{ start: '2025-12-24', end: '2026-01-06', budget: 597.09 }],
      stores: [
        { num: 319,  city: 'Homestead' },    { num: 336,  city: 'Hollywood' },
        { num: 508,  city: 'Fort Myers' },   { num: 518,  city: 'Naples' },
        { num: 726,  city: 'St James City' },{ num: 705,  city: 'Haines City' },
        { num: 2288, city: 'Orlando' },      { num: 2415, city: 'Tampa' },
        { num: 2487, city: 'Sarasota' },     { num: 2509, city: 'Bradenton' }
      ],
      // Dec 24–Jan 6 = 14 days. Dec 24 = Wed. Each weekday appears exactly twice.
      dowVisits: [760, 680, 780, 920, 1240, 1780, 1960]
    }
  ];

  function _creativeStoreRows(def) {
    var basePerWeek = def.dowVisits.reduce(function(s, v) { return s + v; }, 0);
    var weeks = def.numDays / 7;
    return def.stores.map(function(s, i) {
      var seed = (s.num * 17 + i * 31) % 100;
      var mult = 0.55 + (seed / 100) * 0.90;
      return { name: '#' + s.num + ' ' + s.city, visits: Math.round(basePerWeek * mult * weeks / def.stores.length) };
    }).sort(function(a, b) { return b.visits - a.visits; });
  }

  function initPerfTabs() {
    var tabs = document.getElementById('perf-tabs');
    if (!tabs) return;
    var creativeTabInited = false;
    tabs.querySelectorAll('.perf-tab').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var target = btn.dataset.perfTab;
        tabs.querySelectorAll('.perf-tab').forEach(function(b) { b.classList.toggle('active', b === btn); });
        document.querySelectorAll('[data-perf-pane]').forEach(function(p) {
          p.classList.toggle('active', p.dataset.perfPane === target);
        });
        if (target === 'creative') {
          if (!creativeTabInited) { initPerfCreativeChips(); creativeTabInited = true; }
          else { _rechartCreative(); }
        }
        if (target === 'day') renderPerfDay();
        if (target === 'overview') renderPerfOverview();
      });
    });
    // Overview is default — render on load
    renderPerfOverview();
  }

  // ─── Overview tab ────────────────────────────────────────────────────────

  function renderPerfOverview() {
    _renderOverviewCreativeChart();
    _renderOverviewStoreChart();
    _renderOverviewDowChart();
  }

  function _renderOverviewCreativeChart() {
    var el = document.getElementById('perf-overview-creative');
    if (!el) return;
    if (!_perfOverviewCreativeChart) _perfOverviewCreativeChart = echarts.init(el);
    var cats = CREATIVE_DEFS.map(function(d) { return d.label; }).reverse();
    var vals = CREATIVE_DEFS.map(function(d) {
      return _creativeStoreRows(d).reduce(function(s, r) { return s + r.visits; }, 0);
    }).reverse();
    var maxVal = Math.max.apply(null, vals);
    var colors = CREATIVE_DEFS.map(function(d) { return d.accent; }).reverse();
    _perfOverviewCreativeChart.setOption({
      grid: { left: 10, right: 60, top: 6, bottom: 6, containLabel: true },
      xAxis: { type: 'value', show: false, max: Math.ceil(maxVal * 1.18) },
      yAxis: { type: 'category', data: cats, axisLabel: { fontSize: 11, color: '#374151' }, axisLine: { show: false }, axisTick: { show: false } },
      series: [{ type: 'bar', data: vals.map(function(v, i) { return { value: v, itemStyle: { color: colors[i], borderRadius: [0, 4, 4, 0] } }; }),
        barMaxWidth: 18,
        label: { show: true, position: 'right', fontSize: 10, color: '#111827', fontWeight: 600, formatter: function(p) { return p.value.toLocaleString(); } }
      }],
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: function(p) { return p[0].name + '<br/><b>' + p[0].value.toLocaleString() + '</b> observed visits'; } }
    }, true);
  }

  function _renderOverviewStoreChart() {
    var el = document.getElementById('perf-overview-stores');
    if (!el) return;
    // Aggregate visits across all creatives per store
    var storeMap = {};
    CREATIVE_DEFS.forEach(function(def) {
      _creativeStoreRows(def).forEach(function(r) {
        storeMap[r.name] = (storeMap[r.name] || 0) + r.visits;
      });
    });
    var rows = Object.keys(storeMap).map(function(k) { return { name: k, visits: storeMap[k] }; })
      .sort(function(a, b) { return b.visits - a.visits; }).slice(0, 10);
    var palette = ['#4272D8','#f59e0b','#10b981','#8b5cf6','#ef4444','#0ea5e9','#f97316','#14b8a6','#a855f7','#6b7280'];
    var data = rows.map(function(r, i) { return { name: r.name, value: r.visits, itemStyle: { color: palette[i % palette.length] } }; });
    var total = rows.reduce(function(s, r) { return s + r.visits; }, 0);

    // Split container: donut canvas (top) + HTML legend grid (bottom)
    if (!el.querySelector('.ov-donut-chart')) {
      el.innerHTML = '<div class="ov-donut-chart"></div><div class="ov-donut-legend"></div>';
      if (_perfOverviewStoreChart) { _perfOverviewStoreChart.dispose(); _perfOverviewStoreChart = null; }
    }
    var chartEl = el.querySelector('.ov-donut-chart');
    var legendEl = el.querySelector('.ov-donut-legend');
    if (!_perfOverviewStoreChart) _perfOverviewStoreChart = echarts.init(chartEl);

    _perfOverviewStoreChart.setOption({
      tooltip: { trigger: 'item', formatter: function(p) { return p.name + '<br/><b>' + p.value.toLocaleString() + '</b> visits · ' + p.percent + '%'; } },
      series: [{
        type: 'pie', radius: ['58%', '88%'], center: ['50%', '50%'], avoidLabelOverlap: true,
        itemStyle: { borderColor: '#fff', borderWidth: 2 },
        label: { show: false }, labelLine: { show: false },
        data: data
      }],
      graphic: [
        { type: 'text', left: 'center', top: '44%', style: { text: total.toLocaleString(), textAlign: 'center', textVerticalAlign: 'middle', fill: '#111827', fontSize: 22, fontWeight: 700 }, z: 10 },
        { type: 'text', left: 'center', top: '56%', style: { text: 'Top ' + rows.length + (rows.length === 1 ? ' store' : ' stores'), textAlign: 'center', textVerticalAlign: 'middle', fill: '#6b7280', fontSize: 11 }, z: 10 }
      ]
    }, true);

    legendEl.innerHTML = rows.map(function(r, i) {
      return '<div class="ov-donut-legend__item"><span class="ov-donut-legend__swatch" style="background:' + palette[i % palette.length] + '"></span><span class="ov-donut-legend__name" title="' + r.name + '">' + r.name + '</span></div>';
    }).join('');
  }

  function _renderOverviewDowChart() {
    var el = document.getElementById('perf-overview-dow');
    if (!el) return;
    if (!_perfOverviewDowChart) _perfOverviewDowChart = echarts.init(el);
    var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    var totals = [0, 0, 0, 0, 0, 0, 0];
    CREATIVE_DEFS.forEach(function(def) {
      def.dowVisits.forEach(function(v, i) { totals[i] += v; });
    });
    var maxVal = Math.max.apply(null, totals);
    _perfOverviewDowChart.setOption({
      grid: { left: 8, right: 8, top: 20, bottom: 28 },
      xAxis: { type: 'category', data: days, axisLabel: { fontSize: 11, color: '#374151' }, axisLine: { lineStyle: { color: '#e5e7eb' } }, axisTick: { show: false } },
      yAxis: { type: 'value', max: Math.ceil(maxVal * 1.2), axisLabel: { formatter: function(v) { return v >= 1000 ? (v/1000).toFixed(0)+'k' : v; }, color: '#9ca3af', fontSize: 9 }, splitLine: { lineStyle: { color: '#f3f4f6' } } },
      series: [{ type: 'bar', data: totals, barMaxWidth: 40,
        itemStyle: { color: '#6b7280', borderRadius: [4, 4, 0, 0] },
        label: {
          show: true, position: 'top',
          formatter: function(p) {
            var n = p.value >= 1000 ? (p.value/1000).toFixed(1)+'k' : String(p.value);
            return '{val|' + n + '}\n{lbl|visits}';
          },
          rich: {
            val: { fontSize: 11, fontWeight: 700, color: '#374151', lineHeight: 15 },
            lbl: { fontSize: 9, color: '#9ca3af', lineHeight: 12 }
          }
        }
      }],
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, backgroundColor: 'rgba(17,24,39,0.96)', borderColor: 'rgba(255,255,255,0.12)', textStyle: { color: '#fff', fontSize: 12 },
        formatter: function(p) {
          var day = p[0].name;
          var v = p[0].value;
          return '<div style="font-size:13px;font-weight:600;color:#fff;margin-bottom:5px;">' + day + '</div>'
            + '<div style="color:#fff;font-weight:700;">' + v.toLocaleString() + ' <span style="font-weight:400;color:rgba(255,255,255,0.6);">visits</span></div>';
        }
      }
    }, true);
  }

  // ─── By Creative tab ─────────────────────────────────────────────────────

  function initPerfCreativeChips() {
    var chips = document.getElementById('creative-chips');
    if (!chips) return;
    // Pick busiest creative = highest total visits across its stores
    var busiestKey = null, busiestVisits = -1;
    CREATIVE_DEFS.forEach(function(def) {
      var total = _creativeStoreRows(def).reduce(function(s, r) { return s + r.visits; }, 0);
      if (total > busiestVisits) { busiestVisits = total; busiestKey = def.key; }
    });
    var allActive = _activePerfCreative === 'all' ? ' creative-chip--active' : '';
    var allChip = '<button class="creative-chip' + allActive + '" data-creative-key="all">' +
      '<div class="creative-chip__header">' +
        '<div class="creative-chip__thumb creative-chip__thumb--all"><span class="material-symbols-outlined">apps</span></div>' +
      '</div>' +
      '<span class="creative-chip__name">All Creatives</span>' +
      '<span class="creative-chip__meta">' + CREATIVE_DEFS.length + ' creatives \u00b7 35\u00a0stores</span>' +
    '</button>';
    chips.innerHTML = allChip + CREATIVE_DEFS.map(function(def) {
      var active = def.key === _activePerfCreative ? ' creative-chip--active' : '';
      var busyFlag = def.key === busiestKey ? '<span class="creative-chip__flag">Busiest</span>' : '';
      // Apr 28 plan #6: creative imagery on chips. Thumb uses creative.accent
      // as background + initials (or video icon for video type) as a placeholder
      // until real creative artwork is wired through (def.imageUrl when present).
      var initials = def.label.split(/\s+/).map(function(w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
      var hasImg = !!def.imageUrl;
      var thumbInner = hasImg
        ? '<img src="' + def.imageUrl + '" alt="' + def.label + '">'
        : (def.type === 'video'
            ? '<span class="material-symbols-outlined">play_arrow</span>'
            : '<span class="creative-chip__thumb-initials">' + initials + '</span>');
      var thumbStyle = hasImg ? '' : ' style="background:' + (def.accent || '#475569') + ';"';
      return '<button class="creative-chip' + active + '" data-creative-key="' + def.key + '">' +
        '<div class="creative-chip__header">' +
          '<div class="creative-chip__thumb"' + thumbStyle + '>' + thumbInner + '</div>' +
          busyFlag +
        '</div>' +
        '<span class="creative-chip__name">' + def.label + '</span>' +
        '<span class="creative-chip__meta">' + def.type.toUpperCase() + ' \u00b7 ' + def.dims + ' \u00b7 ' + def.stores.length + '\u00a0stores</span>' +
      '</button>';
    }).join('');
    chips.querySelectorAll('.creative-chip').forEach(function(btn) {
      btn.addEventListener('click', function() {
        _activePerfCreative = btn.dataset.creativeKey;
        chips.querySelectorAll('.creative-chip').forEach(function(b) { b.classList.toggle('creative-chip--active', b === btn); });
        _rechartCreative();
      });
    });
    _rechartCreative();
  }

  function _updateCreativeLabels() {
    var isAll = _activePerfCreative === 'all';
    var def = isAll ? null : CREATIVE_DEFS.find(function(d) { return d.key === _activePerfCreative; });
    var nameSpan = (def)
      ? ' <span class="section-label__date">' + def.label + '</span>'
      : '';
    var suffix = isAll ? ' \u2014 All Creatives' : '';
    [
      { id: 'creative-stores-label',  base: 'Visits by Store' },
      { id: 'creative-dow-label',     base: 'Day of Week Pattern' }
    ].forEach(function(l) {
      var el = document.getElementById(l.id);
      if (el) el.innerHTML = l.base + suffix + nameSpan;
    });
  }

  function _rechartCreative() {
    _updateCreativeLabels();
    if (_activePerfCreative === 'all') {
      _renderCreativeHeaderAll();
      _renderCreativeStoresAll();
      _renderCreativeDowAll();
    } else {
      var def = CREATIVE_DEFS.find(function(d) { return d.key === _activePerfCreative; });
      if (!def) return;
      _renderCreativeHeader(def);
      _renderCreativeStores(def);
      _renderCreativeDow(def);
    }
  }

  function _renderCreativeHeaderAll() {
    var el = document.getElementById('creative-detail-header');
    if (!el) return;
    var total = _allCreativesTotalVisits();
    var storeCount = _allCreativesStoreTotals().length;
    el.innerHTML =
      '<div class="creative-dh__body" style="padding-left:0;">' +
        '<div class="creative-dh__name">All Creatives <span class="creative-dh__region-label">\u2014 Combined</span></div>' +
        '<div class="creative-dh__stats">' +
          '<div class="creative-dh__stat"><span class="creative-dh__stat-val">' + CREATIVE_DEFS.length + '</span><span class="creative-dh__stat-lbl">Creatives in flight</span></div>' +
          '<div class="creative-dh__stat"><span class="creative-dh__stat-val">' + storeCount + ' stores</span><span class="creative-dh__stat-lbl">Reached</span></div>' +
          '<div class="creative-dh__stat creative-dh__stat--hero"><span class="creative-dh__stat-val">' + total.toLocaleString() + '</span><span class="creative-dh__stat-lbl">Observed Visits</span></div>' +
        '</div>' +
      '</div>';
  }

  function _renderCreativeStoresAll() {
    var rows = _allCreativesStoreTotals();
    var container = document.getElementById('perf-creative-bars');
    if (!container) return;
    var chartH = Math.max(200, rows.length * 28 + 20);
    container.style.height = chartH + 'px';
    if (!_perfCreativeChart) _perfCreativeChart = echarts.init(container);
    else _perfCreativeChart.resize({ height: chartH });
    var cats = rows.map(function(r) { return r.name; }).reverse();
    var vals = rows.map(function(r) { return r.visits; }).reverse();
    var maxVal = Math.max.apply(null, vals);
    _perfCreativeChart.setOption({
      grid: { left: 10, right: 65, top: 8, bottom: 8, containLabel: true },
      xAxis: { type: 'value', show: false, max: Math.ceil(maxVal * 1.18) },
      yAxis: { type: 'category', data: cats, axisLabel: { fontSize: 11, color: '#374151' }, axisLine: { show: false }, axisTick: { show: false } },
      series: [{ type: 'bar', data: vals, itemStyle: { color: '#6b7280', borderRadius: [0, 4, 4, 0] }, barMaxWidth: 20,
        label: { show: true, position: 'right', fontSize: 11, color: '#111827', fontWeight: 600, formatter: function(p) { return p.value.toLocaleString(); } }
      }],
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: function(p) { return p[0].name + '<br/><b>' + p[0].value.toLocaleString() + '</b> visits'; } }
    }, true);
  }

  function _renderCreativeDowAll() {
    _buildVisitTypeToggles('dow-type-toggles-creative', 'creative');
    var container = document.getElementById('perf-creative-dow');
    if (!container) return;
    if (!_perfDowChart) _perfDowChart = echarts.init(container);
    var split = _dowTypeData(_allCreativesDoW());
    var series = _dowStackedSeries(split, -1);
    _perfDowChart.setOption({
      legend: { show: false },
      grid: { left: 40, right: 12, top: 10, bottom: 28 },
      xAxis: { type: 'category', data: DAY_NAMES, axisLabel: { fontSize: 11, color: '#374151' }, axisLine: { lineStyle: { color: '#e5e7eb' } }, axisTick: { show: false } },
      yAxis: { type: 'value', max: series._yMax, axisLabel: { formatter: function(v) { return v >= 1000 ? (v/1000).toFixed(1)+'k' : v; }, color: '#9ca3af', fontSize: 10 }, splitLine: { lineStyle: { color: '#f3f4f6' } } },
      series: series,
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, backgroundColor: 'rgba(17,24,39,0.96)', borderColor: 'rgba(255,255,255,0.12)', textStyle: { color: '#fff', fontSize: 12 }, formatter: _dowTooltipFormatter }
    }, true);
  }

  function _renderCreativeHeader(def) {
    var el = document.getElementById('creative-detail-header');
    if (!el) return;
    var rows = _creativeStoreRows(def);
    var totalVisits = rows.reduce(function(s, r) { return s + r.visits; }, 0);
    // Scale preview box: max 220×120, preserve aspect ratio
    var MAX_W = 220, MAX_H = 120;
    var ratio = def.w / def.h;
    var pW, pH;
    if (ratio > MAX_W / MAX_H) { pW = MAX_W; pH = Math.max(Math.round(MAX_W / ratio), 32); }
    else { pH = MAX_H; pW = Math.round(MAX_H * ratio); }
    var isHorizontal = ratio > 3;
    var formatLabel = ratio > 3 ? 'Leaderboard' : ratio > 1.5 ? 'Landscape' : ratio < 0.8 ? 'Interstitial' : 'Rectangle';
    var horizClass = isHorizontal ? ' creative-ad-preview--horizontal' : '';
    el.innerHTML =
      '<div class="creative-ad-preview' + horizClass + '" style="width:' + pW + 'px;height:' + pH + 'px;">' +
        '<div class="creative-ad-preview__inner" style="background:' + def.accent + ';">' +
          '<span class="material-symbols-outlined creative-ad-preview__icon">' + def.typeIcon + '</span>' +
          '<span class="creative-ad-preview__name">' + def.label + '</span>' +
          '<span class="creative-ad-preview__format">' + formatLabel + ' · ' + def.dims + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="creative-dh__body">' +
        '<div class="creative-dh__name">' + def.label + ' <span class="creative-dh__region-label">— ' + def.region + '</span></div>' +
        '<div class="creative-dh__badges">' +
          '<span class="creative-dh__badge creative-dh__badge--type">' + def.type.toUpperCase() + '</span>' +
          '<span class="creative-dh__badge creative-dh__badge--dims">' + def.dims + '</span>' +
        '</div>' +
        '<div class="creative-dh__stats">' +
          '<div class="creative-dh__stat"><span class="creative-dh__stat-val">' + def.dateStart + '\u00a0–\u00a0' + def.dateEnd + '</span><span class="creative-dh__stat-lbl">Flight window</span></div>' +
          '<div class="creative-dh__stat"><span class="creative-dh__stat-val">' + def.numDays + ' days</span><span class="creative-dh__stat-lbl">Duration</span></div>' +
          '<div class="creative-dh__stat"><span class="creative-dh__stat-val">' + def.stores.length + ' stores</span><span class="creative-dh__stat-lbl">Reached</span></div>' +
          '<div class="creative-dh__stat creative-dh__stat--hero"><span class="creative-dh__stat-val">' + totalVisits.toLocaleString() + '</span><span class="creative-dh__stat-lbl">Observed Visits</span></div>' +
        '</div>' +
      '</div>';
  }

  function _renderCreativeStores(def) {
    var container = document.getElementById('perf-creative-bars');
    if (!container) return;
    var rows = _creativeStoreRows(def);
    var chartH = Math.max(200, rows.length * 28 + 20);
    container.style.height = chartH + 'px';
    if (!_perfCreativeChart) _perfCreativeChart = echarts.init(container);
    else _perfCreativeChart.resize({ height: chartH });
    var cats = rows.map(function(r) { return r.name; }).reverse();
    var vals = rows.map(function(r) { return r.visits; }).reverse();
    var maxVal = Math.max.apply(null, vals);
    _perfCreativeChart.setOption({
      grid: { left: 10, right: 65, top: 8, bottom: 8, containLabel: true },
      xAxis: { type: 'value', show: false, max: Math.ceil(maxVal * 1.18) },
      yAxis: { type: 'category', data: cats, axisLabel: { fontSize: 11, color: '#374151' }, axisLine: { show: false }, axisTick: { show: false } },
      series: [{ type: 'bar', data: vals, itemStyle: { color: '#6b7280', borderRadius: [0, 4, 4, 0] }, barMaxWidth: 20,
        label: { show: true, position: 'right', fontSize: 11, color: '#111827', fontWeight: 600, formatter: function(p) { return p.value.toLocaleString(); } }
      }],
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: function(p) { return p[0].name + '<br/><b>' + p[0].value.toLocaleString() + '</b> visits'; } }
    }, true);
  }

  function _renderCreativeDow(def) {
    _buildVisitTypeToggles('dow-type-toggles-creative', 'creative');
    var container = document.getElementById('perf-creative-dow');
    if (!container) return;
    if (!_perfDowChart) _perfDowChart = echarts.init(container);
    var split = _dowTypeData(def.dowVisits);
    var series = _dowStackedSeries(split, -1);
    _perfDowChart.setOption({
      legend: { show: false },
      grid: { left: 40, right: 12, top: 10, bottom: 28 },
      xAxis: { type: 'category', data: DAY_NAMES, axisLabel: { fontSize: 11, color: '#374151' }, axisLine: { lineStyle: { color: '#e5e7eb' } }, axisTick: { show: false } },
      yAxis: { type: 'value', max: series._yMax, axisLabel: { formatter: function(v) { return v >= 1000 ? (v/1000).toFixed(1)+'k' : v; }, color: '#9ca3af', fontSize: 10 }, splitLine: { lineStyle: { color: '#f3f4f6' } } },
      series: series,
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, backgroundColor: 'rgba(17,24,39,0.96)', borderColor: 'rgba(255,255,255,0.12)', textStyle: { color: '#fff', fontSize: 12 }, formatter: _dowTooltipFormatter }
    }, true);
  }

  function renderPerfCreative() {
    // Legacy entry point kept for compat — routes to new implementation
    _rechartCreative();
  }

  var _perfDayStoresChart = null;
  var _activeDayFilter = 'all'; // 'all' | 0..6 (Mon=0 … Sun=6)

  var DAY_CHIPS = [
    { key: 'all', label: 'All Days', icon: 'calendar_month', sub: 'Combined' },
    { key: 0, label: 'Monday',    icon: 'calendar_today', sub: 'Mon' },
    { key: 1, label: 'Tuesday',   icon: 'calendar_today', sub: 'Tue' },
    { key: 2, label: 'Wednesday', icon: 'calendar_today', sub: 'Wed' },
    { key: 3, label: 'Thursday',  icon: 'calendar_today', sub: 'Thu' },
    { key: 4, label: 'Friday',    icon: 'calendar_today', sub: 'Fri' },
    { key: 5, label: 'Saturday',  icon: 'weekend', sub: 'Sat · Peak' },
    { key: 6, label: 'Sunday',    icon: 'weekend', sub: 'Sun · Peak' }
  ];

  function _dayChipFullDate(dayKey) {
    // Returns "Jan 7, 2026" for the given day index (Mon=0) within the active week
    var ctx = D.context;
    var week = D.flightWeeks.find(function(w) { return w.id === ctx.flightWeek; });
    if (!week) return '';
    // week.start is the Monday of that week (YYYY-MM-DD)
    var parts = week.start.split('-');
    var base = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    base.setDate(base.getDate() + dayKey);
    return base.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function initPerfDayChips() {
    var chips = document.getElementById('day-chips');
    if (!chips) return;
    var dowTotals = _allCreativesDoW();
    var busiestDay = dowTotals.reduce(function(best, v, i) { return v > best.v ? { i: i, v: v } : best; }, { i: -1, v: -1 }).i;
    chips.innerHTML = DAY_CHIPS.map(function(d) {
      var isWeekend = d.key === 5 || d.key === 6;
      var active = d.key === _activeDayFilter ? ' creative-chip--active' : '';
      var fullDate = (typeof d.key === 'number') ? _dayChipFullDate(d.key) : '';
      var dateSpan = fullDate ? '<span class="creative-chip__date">' + fullDate + '</span>' : '';
      var busyFlag = d.key === busiestDay ? '<span class="creative-chip__flag">Busiest</span>' : '';
      return '<button class="creative-chip' + active + '" data-day-key="' + d.key + '">' +
        '<div class="creative-chip__header">' +
          '<span class="material-symbols-outlined creative-chip__icon">' + d.icon + '</span>' +
          busyFlag +
        '</div>' +
        '<span class="creative-chip__name">' + d.label + '</span>' +
        dateSpan +
      '</button>';
    }).join('');
    chips.querySelectorAll('.creative-chip').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var raw = btn.dataset.dayKey;
        _activeDayFilter = raw === 'all' ? 'all' : parseInt(raw, 10);
        chips.querySelectorAll('.creative-chip').forEach(function(b) {
          b.classList.toggle('creative-chip--active', b === btn);
        });
        _rechartDay();
      });
    });
  }

  function renderPerfDay() {
    initPerfDayChips();
    _rechartDay();
  }

  function _updateDayLabels() {
    var isAll = _activeDayFilter === 'all';
    var dateStr = '';
    if (!isAll) {
      var d = _dayChipFullDate(_activeDayFilter);
      var shortDay = DAY_NAMES[_activeDayFilter].slice(0, 3);
      dateStr = shortDay + ', ' + d;
    }
    var dateSpan = dateStr
      ? ' <span class="section-label__date">' + dateStr + '</span>'
      : '';
    var labels = [
      { id: 'day-stores-label',  base: 'Visits by Store \u2014 All Creatives' },
      { id: 'day-dow-label',     base: 'Day of Week Pattern \u2014 All Creatives' }
    ];
    labels.forEach(function(l) {
      var el = document.getElementById(l.id);
      if (el) el.innerHTML = l.base + dateSpan;
    });
  }

  function _rechartDay() {
    _updateDayLabels();
    _renderDayHeader();
    _renderDayStores();
    _renderDayDow();
  }

  function _allCreativesTotalVisits() {
    return CREATIVE_DEFS.reduce(function(s, def) {
      return s + _creativeStoreRows(def).reduce(function(ss, r) { return ss + r.visits; }, 0);
    }, 0);
  }

  function _allCreativesStoreTotals() {
    var storeMap = {};
    CREATIVE_DEFS.forEach(function(def) {
      _creativeStoreRows(def).forEach(function(r) {
        storeMap[r.name] = (storeMap[r.name] || 0) + r.visits;
      });
    });
    return Object.keys(storeMap)
      .map(function(k) { return { name: k, visits: storeMap[k] }; })
      .sort(function(a, b) { return b.visits - a.visits; });
  }

  function _allCreativesDoW() {
    var totals = [0, 0, 0, 0, 0, 0, 0];
    CREATIVE_DEFS.forEach(function(def) {
      def.dowVisits.forEach(function(v, i) { totals[i] += v; });
    });
    return totals;
  }

  var DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Universal visitor-type taxonomy — matches ChartColors + donut segment mapping
  // New Shoppers = blue (#4272D8), Returning = amber (#F59E0B), Loyal = green (#10B981)
  var VISIT_TYPES = [
    { key: 'loyal',        label: 'Loyal',        color: '#10b981' },
    { key: 'returning',    label: 'Returning',    color: '#f59e0b' },
    { key: 'newShoppers',  label: 'New Shoppers', color: '#4272D8' }
  ];

  // Per-day split ratios [newShoppers%, returning%, loyal%]
  // Weekends skew toward new/returning; weekdays toward loyal/routine
  var DOW_TYPE_RATIOS = [
    [0.24, 0.44, 0.32], // Mon
    [0.22, 0.43, 0.35], // Tue
    [0.23, 0.44, 0.33], // Wed
    [0.25, 0.44, 0.31], // Thu
    [0.27, 0.45, 0.28], // Fri
    [0.35, 0.46, 0.19], // Sat — peak new shoppers
    [0.33, 0.46, 0.21]  // Sun
  ];

  // Shared toggle state across both DoW charts
  var _activeVisitTypes = { newShoppers: true, returning: true, loyal: true };

  function _dowTypeData(dowTotals) {
    return {
      loyal:       dowTotals.map(function(v, i) { return Math.round(v * DOW_TYPE_RATIOS[i][2]); }),
      returning:   dowTotals.map(function(v, i) { return Math.round(v * DOW_TYPE_RATIOS[i][1]); }),
      newShoppers: dowTotals.map(function(v, i) { return Math.round(v * DOW_TYPE_RATIOS[i][0]); })
    };
  }

  function _buildVisitTypeToggles(containerId, chartId) {
    var el = document.getElementById(containerId);
    if (!el || el.children.length) return; // already built
    el.innerHTML = VISIT_TYPES.map(function(t) {
      var isActive = _activeVisitTypes[t.key];
      return '<button class="vt-toggle' + (isActive ? ' vt-toggle--active' : '') + '" ' +
        'data-type-key="' + t.key + '" style="--vt-color:' + t.color + ';">' +
        '<span class="vt-toggle__dot"></span>' + t.label + '</button>';
    }).join('');
    el.querySelectorAll('.vt-toggle').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var key = btn.dataset.typeKey;
        _activeVisitTypes[key] = !_activeVisitTypes[key];
        // Sync visual state across both toggle bars
        document.querySelectorAll('.vt-toggle[data-type-key="' + key + '"]').forEach(function(b) {
          b.classList.toggle('vt-toggle--active', _activeVisitTypes[key]);
        });
        if (chartId === 'creative') {
          var def = CREATIVE_DEFS.find(function(d) { return d.key === _activePerfCreative; });
          if (def) _renderCreativeDow(def);
        } else {
          _renderDayDow();
        }
      });
    });
  }

  function _dowStackedSeries(split, activeIdx) {
    var dayCount = split.loyal.length;

    // Full totals — computed from ALL types regardless of toggle state
    // Outline bar and y-axis max always reflect the true total
    var fullTotals = [];
    for (var i = 0; i < dayCount; i++) {
      fullTotals.push(VISIT_TYPES.reduce(function(s, t) {
        return s + split[t.key][i];
      }, 0));
    }

    var activeSeries = VISIT_TYPES.map(function(t) {
      if (!_activeVisitTypes[t.key]) return null;
      return {
        name: t.label,
        type: 'bar',
        stack: 'visitors',
        barWidth: 28,
        data: split[t.key].map(function(v, i) {
          var fade = (activeIdx >= 0 && activeIdx !== i) ? 0.22 : 1;
          return { value: v, itemStyle: { color: t.color, opacity: fade } };
        })
      };
    }).filter(Boolean);

    // Outline bar uses FULL totals — never shrinks when types are toggled off
    // Gap between stacked top and outline = the hidden segment(s)
    var outlineSeries = {
      name: '__total__',
      type: 'bar',
      barGap: '-100%',
      barWidth: 28,
      data: fullTotals.map(function(v, i) {
        var fade = (activeIdx >= 0 && activeIdx !== i) ? 0.22 : 1;
        return {
          value: v,
          itemStyle: { color: 'transparent', borderColor: 'rgba(55,65,81,' + fade + ')', borderWidth: 1.5 },
          label: {
            show: true,
            position: 'top',
            color: activeIdx >= 0 && activeIdx !== i ? 'transparent' : '#374151',
            fontSize: 11,
            fontWeight: 600,
            formatter: function(p) {
              var n = p.value >= 1000 ? (p.value / 1000).toFixed(1) + 'k' : String(p.value);
              return '{val|' + n + '}\n{lbl|visits}';
            },
            rich: {
              val: { fontSize: 11, fontWeight: 700, color: '#374151', lineHeight: 15 },
              lbl: { fontSize: 9, color: '#9ca3af', lineHeight: 12 }
            }
          }
        };
      })
    };

    var series = activeSeries.concat([outlineSeries]);
    series._yMax = Math.ceil(Math.max.apply(null, fullTotals) * 1.15);
    return series;
  }

  function _dowTooltipFormatter(params) {
    var day = params[0].name;
    var totalParam = params.find(function(p) { return p.seriesName === '__total__'; });
    var dataParams = params.filter(function(p) { return p.seriesName !== '__total__'; });
    var fullTotal = totalParam ? totalParam.value : dataParams.reduce(function(s, p) { return s + p.value; }, 0);
    var header = '<div style="font-size:13px;font-weight:600;color:#fff;margin-bottom:7px;padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,0.18);">' + day + '</div>';
    var rows = dataParams.map(function(p) {
      return '<div style="display:flex;justify-content:space-between;gap:14px;padding:2px 0;">'
        + '<span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + p.color + ';margin-right:6px;vertical-align:middle;"></span>'
        + '<span style="color:rgba(255,255,255,0.85);">' + p.seriesName + '</span></span>'
        + '<span style="font-weight:600;color:#fff;">' + p.value.toLocaleString() + '</span>'
        + '</div>';
    });
    var total = '<div style="display:flex;justify-content:space-between;gap:14px;padding-top:6px;margin-top:4px;border-top:1px solid rgba(255,255,255,0.18);">'
      + '<span style="color:rgba(255,255,255,0.7);">Total</span>'
      + '<span style="font-weight:700;color:#fff;">' + fullTotal.toLocaleString() + ' visits</span>'
      + '</div>';
    return header + (rows.length ? rows.join('') + total : total);
  }

  function _dayVisits(storeTotal, dayIdx) {
    // Fraction of total visits attributable to this day
    var dow = _allCreativesDoW();
    var dowSum = dow.reduce(function(s, v) { return s + v; }, 0);
    return Math.round(storeTotal * (dow[dayIdx] / dowSum));
  }

  function _renderDayHeader() {
    var el = document.getElementById('day-detail-header');
    if (!el) return;
    var isAll = _activeDayFilter === 'all';
    var dayIdx = isAll ? null : _activeDayFilter;
    var totalStores = (function() {
      var ids = {};
      CREATIVE_DEFS.forEach(function(def) { def.stores.forEach(function(s) { ids[s.num] = 1; }); });
      return Object.keys(ids).length;
    })();
    var allVisits = _allCreativesTotalVisits();
    var dow = _allCreativesDoW();
    var dowSum = dow.reduce(function(s, v) { return s + v; }, 0);
    var shownVisits = isAll ? allVisits : Math.round(allVisits * (dow[dayIdx] / dowSum));
    var titleLong = (function() {
      function longDate(idx) {
        var ctx = D.context;
        var week = D.flightWeeks.find(function(w) { return w.id === ctx.flightWeek; });
        if (!week) return '';
        var parts = week.start.split('-');
        var base = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        base.setDate(base.getDate() + idx);
        return base.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      }
      var fullDayName = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
      if (isAll) {
        var start = longDate(0);
        var end = longDate(6);
        return 'All Days — ' + (start && end ? start + ' – ' + end : 'Mon – Sun');
      }
      var full = longDate(dayIdx);
      return fullDayName[dayIdx] + (full ? ' — ' + full : '');
    })();
    var subtitleDay = isAll ? 'Combined across Mon – Sun' : 'Filtered to ' + DAY_NAMES[dayIdx] + ' only';
    el.innerHTML =
      '<div class="creative-dh__body" style="flex:1;">' +
        '<div class="creative-dh__name">' + titleLong + '</div>' +
        '<div class="creative-dh__badges">' +
          CREATIVE_DEFS.map(function(d) {
            return '<span class="creative-dh__badge" style="background:' + d.accent + '22;border-color:' + d.accent + ';color:' + d.accent + ';">' + d.label + '</span>';
          }).join('') +
        '</div>' +
        '<div class="creative-dh__stats">' +
          '<div class="creative-dh__stat"><span class="creative-dh__stat-val">' + CREATIVE_DEFS.length + ' creatives</span><span class="creative-dh__stat-lbl">In flight</span></div>' +
          '<div class="creative-dh__stat"><span class="creative-dh__stat-val">' + totalStores + ' stores</span><span class="creative-dh__stat-lbl">Reached</span></div>' +
          '<div class="creative-dh__stat"><span class="creative-dh__stat-val">' + subtitleDay + '</span><span class="creative-dh__stat-lbl">Scope</span></div>' +
          '<div class="creative-dh__stat creative-dh__stat--hero"><span class="creative-dh__stat-val">' + shownVisits.toLocaleString() + '</span><span class="creative-dh__stat-lbl">Visits</span></div>' +
        '</div>' +
      '</div>';
  }

  function _renderDayStores() {
    var container = document.getElementById('perf-day-stores');
    if (!container) return;
    var allRows = _allCreativesStoreTotals();
    var isAll = _activeDayFilter === 'all';
    var rows = isAll ? allRows : allRows.map(function(r) {
      return { name: r.name, visits: _dayVisits(r.visits, _activeDayFilter) };
    });
    var chartH = Math.max(200, rows.length * 28 + 20);
    container.style.height = chartH + 'px';
    if (!_perfDayStoresChart) _perfDayStoresChart = echarts.init(container);
    else _perfDayStoresChart.resize({ height: chartH });
    var cats = rows.map(function(r) { return r.name; }).reverse();
    var vals = rows.map(function(r) { return r.visits; }).reverse();
    var maxVal = Math.max.apply(null, vals);
    var barColor = '#6b7280'; // gray — neutral aggregate (all creatives)
    _perfDayStoresChart.setOption({
      grid: { left: 10, right: 65, top: 8, bottom: 8, containLabel: true },
      xAxis: { type: 'value', show: false, max: Math.ceil(maxVal * 1.18) },
      yAxis: { type: 'category', data: cats, axisLabel: { fontSize: 11, color: '#374151' }, axisLine: { show: false }, axisTick: { show: false } },
      series: [{ type: 'bar', data: vals, itemStyle: { color: barColor, borderRadius: [0, 4, 4, 0] }, barMaxWidth: 20,
        label: { show: true, position: 'right', fontSize: 11, color: '#111827', fontWeight: 600, formatter: function(p) { return p.value.toLocaleString(); } }
      }],
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: function(p) { return p[0].name + '<br/><b>' + p[0].value.toLocaleString() + '</b> visits'; } }
    }, true);
  }

  function _renderDayDow() {
    _buildVisitTypeToggles('dow-type-toggles-day', 'day');
    var container = document.getElementById('perf-day-bars');
    if (!container) return;
    if (!_perfDayChart) _perfDayChart = echarts.init(container);
    var totals = _allCreativesDoW();
    var split = _dowTypeData(totals);
    var activeIdx = _activeDayFilter === 'all' ? -1 : _activeDayFilter;
    var series = _dowStackedSeries(split, activeIdx);
    _perfDayChart.setOption({
      legend: { show: false },
      grid: { left: 40, right: 12, top: 10, bottom: 28 },
      xAxis: { type: 'category', data: DAY_NAMES, axisLabel: { fontSize: 11, color: '#374151' }, axisLine: { lineStyle: { color: '#e5e7eb' } }, axisTick: { show: false } },
      yAxis: { type: 'value', max: series._yMax, axisLabel: { formatter: function(v) { return v >= 1000 ? (v/1000).toFixed(1)+'k' : v; }, color: '#9ca3af', fontSize: 10 }, splitLine: { lineStyle: { color: '#f3f4f6' } } },
      series: series,
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, backgroundColor: 'rgba(17,24,39,0.96)', borderColor: 'rgba(255,255,255,0.12)', textStyle: { color: '#fff', fontSize: 12 }, formatter: _dowTooltipFormatter }
    }, true);
  }

  function renderStorePerformanceBarView() {
    var el = document.getElementById('store-perf-bar-view');
    if (!el) return;
    if (!storePerfState.allRows.length) buildStorePerformanceData();
    var stores = storePerfState.allRows;
    if (!stores.length) { el.innerHTML = '<div class="dist-tree-empty">No store data available.</div>'; return; }

    // Find max visits for scaling
    var maxVisits = Math.max.apply(null, stores.map(function(s) { return s.visits || 0; }));
    if (maxVisits === 0) maxVisits = 1;

    var sortDir = storePerfState.sortDirection;
    var sortArrow = sortDir === 'asc' ? ' ▲' : ' ▼';

    el.innerHTML = '<div class="bar-row bar-row--header">' +
      '<div class="bar-row__num bar-row__sort-btn" id="bar-sort-btn">#' + sortArrow + '</div>' +
      '<div class="bar-row__store">Store</div>' +
      '<div class="bar-row__bar">Performance</div>' +
      '<div class="bar-row__total">Visits</div>' +
    '</div>' +
    stores.map(function(store, i) {
      var total = store.visits || 0;
      var newV = store.visits_zero_prev || 0;
      var retV = store.visits_one_three_prev || 0;
      var loyV = store.visits_four_plus_prev || 0;
      var totalPct = total > 0 ? (total / maxVisits * 100) : 0;
      var newPct = total > 0 ? (newV / total * 100) : 0;
      var retPct = total > 0 ? (retV / total * 100) : 0;
      var loyPct = total > 0 ? (loyV / total * 100) : 0;

      var storeLabel = '#' + store.storeNumber + ' ' + (store.city || '');
      var maxPctOf = function(v) { return maxVisits > 0 ? (v / maxVisits * 100).toFixed(1) : '0.0'; };
      var seg = function(cls, name, count, pct) {
        return '<div class="bar-row__fill bar-row__fill--' + cls + '"' +
          ' style="width:' + pct.toFixed(1) + '%"' +
          ' data-seg-name="' + name + '"' +
          ' data-seg-store="' + storeLabel + '"' +
          ' data-seg-count="' + fmtNumber(count) + '"' +
          ' data-seg-pct="' + pct.toFixed(1) + '"' +
          ' data-seg-pct-max="' + maxPctOf(count) + '"' +
          ' data-seg-total="' + fmtNumber(total) + '"' +
          ' data-seg-new="' + fmtNumber(newV) + '"' +
          ' data-seg-ret="' + fmtNumber(retV) + '"' +
          ' data-seg-loy="' + fmtNumber(loyV) + '"></div>';
      };
      return '<div class="bar-row" data-store-id="' + store.storeId + '">' +
        '<div class="bar-row__num">' + (i + 1) + '</div>' +
        '<div class="bar-row__store">' +
          '<div class="bar-row__name">' + storeLabel + '</div>' +
          '<div class="bar-row__city">' + store.new_pct.toFixed(0) + '% new</div>' +
        '</div>' +
        '<div class="bar-row__bar">' +
          '<div class="bar-row__track" style="width:' + totalPct.toFixed(1) + '%">' +
            seg('new', 'New Shoppers (Zero Previous)', newV, newPct) +
            seg('returning', 'Returning (1–3 Previous)', retV, retPct) +
            seg('loyal', 'Loyal (4+ Previous)', loyV, loyPct) +
          '</div>' +
        '</div>' +
        '<div class="bar-row__total">' + fmtNumber(total) + '</div>' +
      '</div>';
    }).join('');

    // Floating tooltip for segment hover — built once per render.
    var tip = el.querySelector('.bar-seg-tooltip');
    if (!tip) {
      tip = document.createElement('div');
      tip.className = 'bar-seg-tooltip';
      el.appendChild(tip);
    }
    el.addEventListener('mousemove', function(e) {
      var t = e.target;
      if (!t.classList || !t.classList.contains('bar-row__fill')) { tip.classList.remove('bar-seg-tooltip--show'); return; }
      var pip = function(color) {
        return '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + color + ';margin-right:5px;flex-shrink:0;vertical-align:middle;"></span>';
      };
      var SEG_TYPE_MAP = {
        'bar-row__fill--new':       { color: '#4272D8', label: 'New Shopper Visits' },
        'bar-row__fill--returning': { color: '#f59e0b', label: 'Returning Visits' },
        'bar-row__fill--loyal':     { color: '#10b981', label: 'Loyal Shopper Visits' }
      };
      var segKey = Object.keys(SEG_TYPE_MAP).find(function(cls) { return t.classList.contains(cls); });
      var typeInfo = segKey ? SEG_TYPE_MAP[segKey] : { color: '#6b7280', label: 'Visits' };
      tip.innerHTML =
        '<div class="bar-seg-tooltip__store">' + t.dataset.segStore + '</div>' +
        '<div class="bar-seg-tooltip__name">' + t.dataset.segName + '</div>' +
        '<div class="bar-seg-tooltip__row bar-seg-tooltip__row--visit"><span>' + pip(typeInfo.color) + typeInfo.label + '</span><b>' + t.dataset.segCount + '</b></div>' +
        '<div class="bar-seg-tooltip__row"><span>Of store total</span><b>' + t.dataset.segPct + '%</b></div>' +
        '<div class="bar-seg-tooltip__row"><span>Of max store</span><b>' + t.dataset.segPctMax + '%</b></div>' +
        '<div class="bar-seg-tooltip__row bar-seg-tooltip__row--muted"><span>Store total</span><b>' + t.dataset.segTotal + '</b></div>';
      var rect = el.getBoundingClientRect();
      var x = e.clientX - rect.left + 12;
      var y = e.clientY - rect.top + 12;
      // Flip if tooltip would overflow right edge
      if (x + 240 > rect.width) x = e.clientX - rect.left - 252;
      tip.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      tip.classList.add('bar-seg-tooltip--show');
    });
    el.addEventListener('mouseleave', function() { tip.classList.remove('bar-seg-tooltip--show'); });

    // Bind bar row clicks to selectStore
    el.querySelectorAll('.bar-row[data-store-id]').forEach(function(row) {
      row.addEventListener('click', function() {
        var storeId = row.dataset.storeId;
        if (typeof selectStore === 'function') selectStore(storeId);
        el.querySelectorAll('.bar-row').forEach(function(r) { r.classList.remove('bar-row--selected'); });
        row.classList.add('bar-row--selected');
      });
    });

    // Sort toggle on # header
    var sortBtn = document.getElementById('bar-sort-btn');
    if (sortBtn) {
      sortBtn.addEventListener('click', function() {
        storePerfState.sortDirection = storePerfState.sortDirection === 'desc' ? 'asc' : 'desc';
        buildStorePerformanceData();
        renderStorePerformanceBarView();
      });
    }
  }

  /* ============================================================
     Phase 2: Duration presets for Trend view
     ============================================================ */
  function _updateFrequencySubtitle() {
    var lbl = document.getElementById('freq-bucket-label');
    if (!lbl) return;
    var active = document.querySelector('#duration-presets .duration-preset.active');
    var dur = active ? active.dataset.duration : '1w';
    var gran = document.querySelector('#year-granularity .year-gran-btn.active');
    var granKey = gran ? gran.dataset.gran : 'quarter';
    var map = { '1w': 'day', '1m': 'week', '1q': 'week', '1y': granKey === 'month' ? 'month' : 'quarter' };
    lbl.textContent = map[dur] || 'bucket';
  }

  function initDurationPresets() {
    var container = document.getElementById('duration-presets');
    if (!container) return;
    var presets = container.querySelectorAll('.duration-preset');
    presets.forEach(function(btn) {
      btn.addEventListener('click', function() {
        presets.forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        initFrequencyChart();
        _updateFrequencySubtitle();
      });
    });
    // 1-Year sub-granularity (by week | by quarter)
    var gran = document.getElementById('year-granularity');
    if (gran) {
      gran.querySelectorAll('.year-gran-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          gran.querySelectorAll('.year-gran-btn').forEach(function(b) { b.classList.remove('active'); });
          btn.classList.add('active');
          initFrequencyChart();
          _updateFrequencySubtitle();
        });
      });
    }
    _updateFrequencySubtitle();
  }

  /* ============================================================
     Phase 2: Crossover comparison period presets (1wk/4wk/13wk)
     ============================================================ */
  function initCrossoverPeriodPresets() {
    var container = document.getElementById('crossover-period-presets');
    if (!container) return;
    var presets = container.querySelectorAll('.duration-preset');
    presets.forEach(function(btn) {
      btn.addEventListener('click', function() {
        presets.forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var period = btn.dataset.period;
        var weekCount = period === '1w' ? 1 : period === '1m' ? 4 : period === '1q' ? 13 : 52;
        updateCrossoverChartPeriod(weekCount);
      });
    });
  }

  function updateCrossoverChartPeriod(weekCount) {
    var el = document.getElementById('chart-crossover');
    if (!el) return;

    // Dispose and reinit to cleanly switch between bar/area
    if (charts.crossover) { charts.crossover.dispose(); charts.crossover = null; }
    var chart = echarts.init(el);
    charts.crossover = chart;

    var crossover = D.competitiveCrossover;
    var flightWeeks = D.flightWeeks;
    var totalWeeks = flightWeeks.length;
    var sliceStart = Math.max(0, totalWeeks - weekCount);

    var fmt = function (d) {
      return (d.getMonth() + 1) + '/' + d.getDate();
    };
    var slicedWeeks = flightWeeks.slice(sliceStart).map(function (w) {
      var s = new Date(w.start + 'T00:00:00');
      var e = new Date(w.end + 'T00:00:00');
      return w.label + '\n' + fmt(s) + '–' + fmt(e);
    });

    // Deduplicate competitors
    var seen = {};
    var allComps = [];
    crossover.forEach(function (c) {
      if (!seen[c.competitor_name]) {
        seen[c.competitor_name] = true;
        allComps.push(c);
      }
    });
    allComps.sort(function (a, b) { return b.crossover_pct - a.crossover_pct; });

    var top5 = allComps.slice(0, 5);
    var rest = allComps.slice(5);
    // Plan item 9 (Apr 17): top-N competitor palette — muted/warm aesthetic
// confirmed by Bill. Extend here if data has >5 top competitors.
// [0-4] = top 5 competitor colors, [5] = all-other gray, [6] = our brand blue.
var CROSSOVER_COLORS = ['#E07850', '#A8BF6E', '#2AADDB', '#D4A574', '#9B7FD4', '#9ca3af', '#4272D8'];

    // Use stacked area for longer periods (13w), bar for shorter
    var useArea = weekCount > 4;
    var chartType = useArea ? 'line' : 'bar';

    var stackLabel = useArea ? { show: false } : {
      show: true, position: 'inside', fontSize: 10, color: '#fff', fontWeight: 'bold',
      formatter: function (p) { return p.value >= 6 ? p.value.toFixed(1) + '%' : ''; }
    };

    var namedSeries = top5.map(function (comp, i) {
      var s = {
        name: comp.competitor_name,
        type: chartType,
        stack: 'crossover',
        itemStyle: { color: CROSSOVER_COLORS[i] },
        label: stackLabel,
        emphasis: { focus: 'series' },
        data: comp.trend.slice(sliceStart)
      };
      if (useArea) {
        s.areaStyle = { opacity: 0.85 };
        s.lineStyle = { width: 1 };
        s.symbol = 'circle';
        s.symbolSize = 4;
        s.smooth = true;
      } else {
        s.barWidth = '60%';
      }
      return s;
    });

    // Our Brand Only
    var ourBrandTrend = flightWeeks.slice(sliceStart).map(function (_, wi) {
      var idx = sliceStart + wi;
      var compSum = 0;
      top5.forEach(function (c) { compSum += (c.trend[idx] || 0); });
      rest.forEach(function (c) { compSum += (c.trend[idx] || 0); });
      return Math.max(0, 100 - compSum);
    });
    var ourBrandSeries = {
      name: 'Our Brand Only',
      type: chartType,
      stack: 'crossover',
      itemStyle: { color: CROSSOVER_COLORS[6] },
      label: stackLabel,
      emphasis: { focus: 'series' },
      data: ourBrandTrend
    };
    if (useArea) {
      ourBrandSeries.areaStyle = { opacity: 0.85 };
      ourBrandSeries.lineStyle = { width: 1 };
      ourBrandSeries.symbol = 'circle';
      ourBrandSeries.symbolSize = 4;
      ourBrandSeries.smooth = true;
    } else {
      ourBrandSeries.barWidth = '60%';
    }
    namedSeries.push(ourBrandSeries);

    if (rest.length > 0) {
      var allOtherTrend = flightWeeks.slice(sliceStart).map(function (_, wi) {
        var idx = sliceStart + wi;
        var sum = 0;
        rest.forEach(function (c) { sum += (c.trend[idx] || 0); });
        return sum;
      });
      var allOtherSeries = {
        name: 'All Other',
        type: chartType,
        stack: 'crossover',
        itemStyle: { color: CROSSOVER_COLORS[5] },
        label: stackLabel,
        emphasis: { focus: 'series' },
        data: allOtherTrend
      };
      if (useArea) {
        allOtherSeries.areaStyle = { opacity: 0.85 };
        allOtherSeries.lineStyle = { width: 1 };
        allOtherSeries.symbol = 'circle';
        allOtherSeries.symbolSize = 4;
        allOtherSeries.smooth = true;
      } else {
        allOtherSeries.barWidth = '60%';
      }
      namedSeries.push(allOtherSeries);
    }

    var legendNames = ['Our Brand Only'].concat(top5.map(function (c) { return c.competitor_name; }));
    if (rest.length > 0) legendNames.push('All Other');

    // Full replace to switch between bar/area chart types cleanly
    chart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: useArea ? 'line' : 'shadow' },
        formatter: function (params) {
          var html = '<strong>' + params[0].axisValue.replace('\n', ' ') + '</strong>';
          params.forEach(function (p) {
            html += '<br>' + p.marker + ' ' + p.seriesName + ': <strong>' + p.value.toFixed(1) + '%</strong>';
          });
          return html;
        }
      },
      legend: {
        bottom: 0, icon: 'circle', itemWidth: 8, itemHeight: 8, itemGap: 20,
        textStyle: { fontSize: 12, color: '#6b7280' },
        data: legendNames
      },
      grid: { left: 50, right: 24, top: 16, bottom: 60 },
      xAxis: {
        type: 'category',
        data: slicedWeeks,
        axisLabel: { fontSize: 11, color: '#6b7280' },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        boundaryGap: useArea ? false : true
      },
      yAxis: {
        type: 'value',
        max: 100,
        axisLabel: { formatter: '{value}%', fontSize: 11, color: '#6b7280' },
        splitLine: { lineStyle: { color: '#f3f4f6' } }
      },
      series: namedSeries
    }, true);
  }

  /* ============================================================
     Phase 2: Demographics charts
     Plan item 7 (Apr 17): Current (horizontal bars) + Trend (100% stacked bar
     with time buckets) + duration presets. Stacked bar mirrors Competitive
     Crossover shape — 4+ periods in one view, Compare A/B only fits 2.
     ============================================================ */
  var DEMO_VIEW = 'current'; // 'current' | 'trend'
  var DEMO_DURATION = '4w';  // '1w' | '4w' | '13w' | '1y'
  var DEMO_CHARTS = null;
  var DEMO_SINGLE_CHART = null;     // ECharts instance for single-category view
  var DEMO_ACTIVE_KEY = 'all';      // 'all' | 'age' | 'gender' | 'income' | ...
  var DEMO_TOTAL = 10822;

  // Segment palette — reuses warm/muted aesthetic (plan item 9).
  var DEMO_PALETTE = ['#4272D8', '#E07850', '#A8BF6E', '#2AADDB', '#D4A574', '#9B7FD4', '#C48AA9', '#7A9A99'];

  // Card-strip metadata (Apr 28 plan #2). Order matches the 8-card grid; "All"
  // is prepended in renderDemoChips() so the data shape stays grid-friendly.
  var DEMO_CATEGORIES = [
    { key: 'age',       id: 'chart-demo-age-v',       label: 'Age',                icon: 'cake',                 sub: 'Share of visitors by age bracket' },
    { key: 'gender',    id: 'chart-demo-gender-v',    label: 'Gender',             icon: 'wc',                   sub: 'Female / Male / Unknown' },
    { key: 'income',    id: 'chart-demo-income-v',    label: 'Household Income',   icon: 'payments',             sub: 'Estimated annual HH income' },
    { key: 'children',  id: 'chart-demo-children-v',  label: 'Presence of Children', icon: 'child_care',         sub: 'HH with children present' },
    { key: 'hhsize',    id: 'chart-demo-hhsize-v',    label: 'Household Size',     icon: 'group',                sub: 'Members per household' },
    { key: 'homeowner', id: 'chart-demo-homeowner-v', label: 'Homeowner Status',   icon: 'home',                 sub: 'Owner / Renter / Unknown' },
    { key: 'networth',  id: 'chart-demo-networth-v',  label: 'Net Worth',          icon: 'account_balance',      sub: 'Estimated total net worth' },
    { key: 'marital',   id: 'chart-demo-marital-v',   label: 'Marital Status',     icon: 'favorite',             sub: 'Married / Single / Unknown' }
  ];

  function demoCharts() {
    return [
      { id: 'chart-demo-age-v', cats: ['18-24', '25-34', '35-44', '45-54', '55-64', '65-74', '75+'], vals: [8, 18, 22, 20, 16, 10, 6] },
      { id: 'chart-demo-gender-v', cats: ['Female', 'Male', 'Unknown'], vals: [52, 44, 4] },
      { id: 'chart-demo-income-v', cats: ['<$25K', '$25-50K', '$50-75K', '$75-100K', '$100-150K', '$150K+'], vals: [12, 22, 24, 20, 14, 8] },
      { id: 'chart-demo-children-v', cats: ['Children Present', 'No Children'], vals: [38, 62] },
      { id: 'chart-demo-hhsize-v', cats: ['1', '2', '3', '4', '5+'], vals: [18, 30, 22, 18, 12] },
      { id: 'chart-demo-homeowner-v', cats: ['Owner', 'Renter', 'Unknown'], vals: [58, 36, 6] },
      { id: 'chart-demo-networth-v', cats: ['<$50K', '$50-100K', '$100-250K', '$250-500K', '$500K+'], vals: [20, 25, 28, 17, 10] },
      { id: 'chart-demo-marital-v', cats: ['Married', 'Single', 'Unknown'], vals: [48, 44, 8] }
    ];
  }

  function findDemoConfig(key) {
    var cat = DEMO_CATEGORIES.find(function(c) { return c.key === key; });
    if (!cat) return null;
    return DEMO_CHARTS && DEMO_CHARTS.find(function(c) { return c.id === cat.id; });
  }

  function renderDemoChips() {
    var host = document.getElementById('demo-chips');
    if (!host) return;
    var chips = [{ key: 'all', label: 'All Demographics', icon: 'dashboard', sub: '8 categories · combined view' }]
      .concat(DEMO_CATEGORIES.map(function(c) {
        var cfg = DEMO_CHARTS && DEMO_CHARTS.find(function(cc) { return cc.id === c.id; });
        var sub = cfg ? (cfg.cats.length + ' buckets') : '';
        return { key: c.key, label: c.label, icon: c.icon, sub: sub };
      }));
    host.innerHTML = chips.map(function(ch) {
      var active = (ch.key === DEMO_ACTIVE_KEY) ? ' creative-chip--active' : '';
      return ''
        + '<button class="creative-chip demo-chip' + active + '" role="tab" aria-selected="' + (active ? 'true' : 'false') + '" data-demo-key="' + ch.key + '">'
        +   '<div class="creative-chip__header">'
        +     '<span class="material-symbols-outlined creative-chip__icon">' + ch.icon + '</span>'
        +   '</div>'
        +   '<div class="creative-chip__name">' + ch.label + '</div>'
        +   '<div class="creative-chip__meta">' + ch.sub + '</div>'
        + '</button>';
    }).join('');
    host.querySelectorAll('[data-demo-key]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        DEMO_ACTIVE_KEY = btn.dataset.demoKey;
        renderDemoChips();
        renderDemographicsAll();
      });
    });
  }

  function renderDemoSingleCurrent(c) {
    if (!DEMO_SINGLE_CHART) return;
    var cats = c.cats.slice().reverse();
    var vals = c.vals.slice().reverse();
    var counts = vals.map(function(v) { return Math.round(DEMO_TOTAL * v / 100); });
    var fmt = function(n) { return n.toLocaleString(); };
    var maxVal = Math.max.apply(null, vals);
    DEMO_SINGLE_CHART.setOption({
      grid: { left: 130, right: 130, top: 20, bottom: 20, containLabel: false },
      xAxis: { type: 'value', show: false, max: Math.ceil(maxVal * 1.15) },
      yAxis: {
        type: 'category', data: cats,
        axisLabel: { fontSize: 13, color: '#374151' },
        axisLine: { show: false }, axisTick: { show: false }
      },
      series: [{
        type: 'bar',
        data: vals.map(function(v, i) {
          return { value: v, itemStyle: { color: DEMO_PALETTE[(vals.length - 1 - i) % DEMO_PALETTE.length], borderRadius: [0, 4, 4, 0] } };
        }),
        barMaxWidth: 28,
        label: {
          show: true, position: 'right', fontSize: 13, color: '#374151',
          formatter: function(p) { return '{pct|' + p.value + '%} {count|· ' + fmt(counts[p.dataIndex]) + '}'; },
          rich: {
            pct: { fontWeight: 600, color: '#111827', fontSize: 13 },
            count: { color: '#6b7280', fontSize: 11 }
          }
        }
      }],
      tooltip: {
        trigger: 'axis', axisPointer: { type: 'shadow' },
        formatter: function(params) {
          var p = params[0];
          return p.name + '<br/><b>' + p.value + '%</b> · ' + fmt(counts[p.dataIndex]) + ' of ' + fmt(DEMO_TOTAL) + ' visitors';
        }
      }
    }, true);
  }

  function renderDemoSingleTrend(c) {
    if (!DEMO_SINGLE_CHART) return;
    var buckets = bucketLabelsFor(DEMO_DURATION);
    var bucketData = generateTrendData(c.cats, c.vals, buckets.length);
    var barCap = buckets.length <= 4 ? 140 : buckets.length <= 7 ? 90 : 50;
    var series = c.cats.map(function(cat, i) {
      return {
        name: cat, type: 'bar', stack: 'total', barMaxWidth: barCap,
        itemStyle: { color: DEMO_PALETTE[i % DEMO_PALETTE.length] },
        data: bucketData.map(function(row) { return row[i]; }),
        label: buckets.length <= 4 ? {
          show: true, position: 'inside', fontSize: 11, color: '#fff', fontWeight: 'bold',
          formatter: function(p) { return p.value >= 6 ? p.value + '%' : ''; }
        } : { show: false }
      };
    });
    DEMO_SINGLE_CHART.setOption({
      grid: { left: 50, right: 20, top: 30, bottom: 60, containLabel: true },
      legend: { data: c.cats, bottom: 0, icon: 'circle', itemWidth: 8, itemHeight: 8, itemGap: 20, textStyle: { fontSize: 12, color: '#6b7280' } },
      xAxis: { type: 'category', data: buckets, axisLabel: { fontSize: 11, color: '#6b7280' }, axisLine: { show: false }, axisTick: { show: false } },
      yAxis: { type: 'value', max: 100, min: 0, axisLabel: { formatter: '{value}%', fontSize: 11, color: '#9ca3af' }, splitLine: { lineStyle: { color: '#f3f4f6' } } },
      series: series,
      tooltip: {
        trigger: 'axis', axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(17,24,39,0.96)',
        borderColor: 'rgba(255,255,255,0.12)',
        textStyle: { color: '#fff', fontSize: 12 },
        formatter: function(params) { return darkAxisTooltip(params, function(v) { return v + '%'; }); }
      }
    }, true);
  }

  // ── Shared dark tooltip helpers ────────────────────────────────────────────

  function _fmtDateRange(startISO, endISO) {
    var mo = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var s = new Date(startISO + 'T00:00:00Z');
    var e = new Date(endISO + 'T00:00:00Z');
    if (s.getUTCMonth() === e.getUTCMonth()) {
      return mo[s.getUTCMonth()] + ' ' + s.getUTCDate() + '–' + e.getUTCDate() + ', ' + e.getUTCFullYear();
    }
    return mo[s.getUTCMonth()] + ' ' + s.getUTCDate() + ' – ' + mo[e.getUTCMonth()] + ' ' + e.getUTCDate() + ', ' + e.getUTCFullYear();
  }

  // Returns a human-readable date hint for a bucket label (empty string = no hint).
  function bucketDateHint(label) {
    if (!label) return '';
    // Day names — label is already self-explanatory
    if (/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)$/.test(label)) return '';
    // 'Week N' format — look up start/end in D.flightWeeks
    var wm = label.match(/^Week\s+(\d+)$/);
    if (wm && D && D.flightWeeks) {
      var fw = D.flightWeeks.find(function(w) { return w.label === label; });
      if (fw) return _fmtDateRange(fw.start, fw.end);
    }
    // 'W1'–'W13' relative weeks — W13 = Dec 10–16, 2025 (flight anchor)
    var rm = label.match(/^W(\d+)$/);
    if (rm) {
      var n = parseInt(rm[1]);
      var anchorMs = Date.UTC(2025, 11, 10);
      var startMs = anchorMs + (n - 13) * 7 * 86400000;
      return _fmtDateRange(
        new Date(startMs).toISOString().slice(0, 10),
        new Date(startMs + 6 * 86400000).toISOString().slice(0, 10)
      );
    }
    // Quarter labels
    var quarters = { Q1: 'Jan – Mar 2025', Q2: 'Apr – Jun 2025', Q3: 'Jul – Sep 2025', Q4: 'Oct – Dec 2025' };
    if (quarters[label]) return quarters[label];
    return '';
  }

  // Renders a dark-themed eCharts axis tooltip body. valueFmt(v) formats each series value.
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

  // ── /Shared dark tooltip helpers ───────────────────────────────────────────

  function bucketLabelsFor(duration) {
    if (duration === '1w') return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    if (duration === '4w') return ['Week 51', 'Week 52', 'Week 1', 'Week 2'];
    if (duration === '13w') return ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12', 'W13'];
    if (duration === '1y') return ['Q1', 'Q2', 'Q3', 'Q4']; // quarter sub-granularity per plan
    return ['Week 51', 'Week 52', 'Week 1', 'Week 2'];
  }

  // Mock time-bucket generator: jitter each category's pct across buckets so
  // the stack still sums to 100 per bucket. Deterministic (sin-based) so the
  // trend reads as a plausible drift rather than random noise.
  function generateTrendData(cats, vals, bucketCount) {
    var buckets = [];
    for (var b = 0; b < bucketCount; b++) {
      var row = [];
      var sum = 0;
      for (var i = 0; i < cats.length; i++) {
        var jitter = Math.sin((b + 1) * 0.8 + i * 1.3) * 2.5;
        var pct = Math.max(1, vals[i] + jitter);
        row.push(pct);
        sum += pct;
      }
      // Normalize to 100
      var normalized = row.map(function(v) { return Math.round((v / sum) * 1000) / 10; });
      buckets.push(normalized);
    }
    return buckets; // buckets[bucketIdx][catIdx] = pct
  }

  function renderCurrentChart(c) {
    if (!c.instance) return;
    var cats = c.cats.slice().reverse();
    var vals = c.vals.slice().reverse();
    var counts = vals.map(function(v) { return Math.round(DEMO_TOTAL * v / 100); });
    var fmt = function(n) { return n.toLocaleString(); };
    var maxVal = Math.max.apply(null, vals);
    c.instance.setOption({
      grid: { left: 90, right: 90, top: 10, bottom: 10, containLabel: false },
      xAxis: { type: 'value', show: false, max: Math.ceil(maxVal * 1.15) },
      yAxis: {
        type: 'category',
        data: cats,
        axisLabel: { fontSize: 11, color: '#374151' },
        axisLine: { show: false },
        axisTick: { show: false }
      },
      series: [{
        type: 'bar',
        data: vals.map(function(v, i) {
          return {
            value: v,
            itemStyle: { color: DEMO_PALETTE[(vals.length - 1 - i) % DEMO_PALETTE.length], borderRadius: [0, 3, 3, 0] }
          };
        }),
        barMaxWidth: 20,
        label: {
          show: true, position: 'right', fontSize: 11, color: '#374151',
          formatter: function(p) {
            return '{pct|' + p.value + '%} {count|· ' + fmt(counts[p.dataIndex]) + '}';
          },
          rich: {
            pct: { fontWeight: 600, color: '#111827', fontSize: 11 },
            count: { color: '#6b7280', fontSize: 10 }
          }
        }
      }],
      tooltip: {
        trigger: 'axis', axisPointer: { type: 'shadow' },
        formatter: function(params) {
          var p = params[0];
          return p.name + '<br/><b>' + p.value + '%</b> · ' + fmt(counts[p.dataIndex]) + ' of ' + fmt(DEMO_TOTAL) + ' visitors';
        }
      }
    }, true);
  }

  function renderTrendChart(c) {
    if (!c.instance) return;
    var buckets = bucketLabelsFor(DEMO_DURATION);
    var bucketData = generateTrendData(c.cats, c.vals, buckets.length);
    // Bar cap scales with bucket count — fewer buckets = wider bars,
    // less wasted gap between columns. 13w/1y stay narrow for legibility.
    var barCap = buckets.length <= 4 ? 120
      : buckets.length <= 7 ? 80
      : 44;
    // ECharts wants one series per stack layer (each category = one series)
    var series = c.cats.map(function(cat, i) {
      return {
        name: cat,
        type: 'bar',
        stack: 'total',
        barMaxWidth: barCap,
        itemStyle: { color: DEMO_PALETTE[i % DEMO_PALETTE.length] },
        data: bucketData.map(function(row) { return row[i]; }),
        label: buckets.length <= 4 ? {
          show: true, position: 'inside', fontSize: 10, color: '#fff', fontWeight: 'bold',
          formatter: function(p) { return p.value >= 6 ? p.value + '%' : ''; }
        } : { show: false }
      };
    });
    c.instance.setOption({
      grid: { left: 40, right: 10, top: 30, bottom: 40, containLabel: true },
      legend: {
        data: c.cats, bottom: 0, icon: 'circle', itemWidth: 8, itemHeight: 8,
        itemGap: 20,
        textStyle: { fontSize: 12, color: '#6b7280' }
      },
      xAxis: {
        type: 'category', data: buckets,
        axisLabel: { fontSize: 10, color: '#6b7280' },
        axisLine: { show: false }, axisTick: { show: false }
      },
      yAxis: {
        type: 'value', max: 100, min: 0,
        axisLabel: { formatter: '{value}%', fontSize: 10, color: '#9ca3af' },
        splitLine: { lineStyle: { color: '#f3f4f6' } }
      },
      series: series,
      tooltip: {
        trigger: 'axis', axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(17,24,39,0.96)',
        borderColor: 'rgba(255,255,255,0.12)',
        textStyle: { color: '#fff', fontSize: 12 },
        formatter: function(params) { return darkAxisTooltip(params, function(v) { return v + '%'; }); }
      }
    }, true);
  }

  function renderDemographicsAll() {
    if (!DEMO_CHARTS) return;
    var grid = document.getElementById('demo-charts-grid');
    var single = document.getElementById('demo-single-view');
    var tabset = document.querySelector('.demo-tabset');
    var showAll = (DEMO_ACTIVE_KEY === 'all');

    // Visibility swap: All = grid view; single key = full-width chart.
    if (grid) grid.hidden = !showAll;
    if (single) single.hidden = showAll;

    // Toggle layout class on grid: Trend = 1 column (stacked bars need width);
    // Current = 2 columns (horizontal bars read fine compact).
    if (grid) grid.classList.toggle('demo-charts-grid--trend', DEMO_VIEW === 'trend');
    if (tabset) tabset.classList.toggle('demo-tabset--current', DEMO_VIEW === 'current');

    if (showAll) {
      DEMO_CHARTS.forEach(function(c) {
        if (DEMO_VIEW === 'current') renderCurrentChart(c);
        else renderTrendChart(c);
      });
      setTimeout(function() {
        DEMO_CHARTS.forEach(function(c) { if (c.instance) c.instance.resize(); });
      }, 50);
    } else {
      // Single-category render
      var cat = DEMO_CATEGORIES.find(function(c) { return c.key === DEMO_ACTIVE_KEY; });
      var cfg = findDemoConfig(DEMO_ACTIVE_KEY);
      if (!cat || !cfg) return;
      var titleEl = document.getElementById('demo-single-title');
      var subEl = document.getElementById('demo-single-sub');
      if (titleEl) titleEl.textContent = cat.label;
      if (subEl) subEl.textContent = cat.sub;
      var host = document.getElementById('chart-demo-single');
      if (host && !DEMO_SINGLE_CHART) {
        DEMO_SINGLE_CHART = echarts.init(host);
      }
      if (DEMO_VIEW === 'current') renderDemoSingleCurrent(cfg);
      else renderDemoSingleTrend(cfg);
      setTimeout(function() { if (DEMO_SINGLE_CHART) DEMO_SINGLE_CHART.resize(); }, 50);
    }
  }

  function initDemographicsControls() {
    var toggle = document.getElementById('demo-view-toggle');
    if (toggle) {
      toggle.querySelectorAll('[data-demo-view]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          toggle.querySelectorAll('[data-demo-view]').forEach(function(b) { b.classList.remove('active'); });
          btn.classList.add('active');
          DEMO_VIEW = btn.dataset.demoView;
          renderDemographicsAll();
        });
      });
    }
    var presets = document.getElementById('demo-duration-presets');
    if (presets) {
      presets.querySelectorAll('.duration-preset').forEach(function(btn) {
        btn.addEventListener('click', function() {
          presets.querySelectorAll('.duration-preset').forEach(function(b) { b.classList.remove('active'); });
          btn.classList.add('active');
          DEMO_DURATION = btn.dataset.duration;
          // Duration matters for Trend view; if Current is active, refresh anyway
          // since future Current implementations may respect duration as the window.
          renderDemographicsAll();
        });
      });
    }
  }

  function initDemographics() {
    DEMO_CHARTS = demoCharts().map(function(c) {
      var el = document.getElementById(c.id);
      if (!el) return null;
      c.instance = echarts.init(el);
      return c;
    }).filter(Boolean);
    renderDemoChips();
    renderDemographicsAll();
    initDemographicsControls();
  }

  /* ============================================================
     Apr 28 plan #1: Media Buy — Media-attributed Visits panel
     Visit data is store × week × campaign-group level (NOT
     creative-attributed). Lives next to spend/CTR/conv on the
     Media Buy surface; Store Visitation surface keeps its
     standalone treatment.
     ============================================================ */
  /* ============================================================
     Phase 3 step 3+4: Main Media Buy perf-tabs handler.
     Five tabs (Overview / By Store / By Creative / Time Trend / Data).
     Tab content beyond Overview is stubbed; later steps move pieces in.
     ============================================================ */
  /* ============================================================
     Phase 4: Traffic Share main perf-tabs handler.
     Six tabs (Overview / By Competitor / By Store / Crossover Trend /
     Traffic Volume / Data). First checkpoint: Overview holds all
     existing content; other tabs are stubs. On tab activation,
     resize any visible ECharts (charts inited while hidden render at
     0 width) and invalidate Leaflet map size if present.
     ============================================================ */
  function initTrafficShareTabs() {
    var tabBar = document.getElementById('ts-perf-tabs');
    if (!tabBar) return;
    var tabs = tabBar.querySelectorAll('.perf-tab');
    var panes = document.querySelectorAll('[data-ts-pane]');
    var storeBuilt = false, compBuilt = false, dataBuilt = false, compareBuilt = false;
    tabs.forEach(function(t) {
      t.addEventListener('click', function() {
        var target = t.dataset.tsTab;
        tabs.forEach(function(x) {
          var on = x === t;
          x.classList.toggle('active', on);
          x.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        panes.forEach(function(p) { p.classList.toggle('active', p.dataset.tsPane === target); });
        // Resize all ECharts in the active pane (was display:none, now visible).
        var activePane = document.querySelector('[data-ts-pane="' + target + '"]');
        if (activePane) {
          activePane.querySelectorAll('[_echarts_instance_]').forEach(function(el) {
            var inst = (typeof echarts !== 'undefined') && echarts.getInstanceByDom ? echarts.getInstanceByDom(el) : null;
            if (inst) inst.resize();
          });
          // By Store Leaflet map invalidate on return to the tab.
          if (activePane.querySelector('#store-map-store-pane') && typeof window.StoreMap !== 'undefined' && window.StoreMap.invalidateSize) {
            window.StoreMap.invalidateSize();
          }
        }
        // Per-tab lazy init
        if (target === 'store') {
          renderMap('store-map-store-pane');
          if (!storeBuilt) {
            renderLeaderboardInto(document.getElementById('leaderboard-table-store'), 'ours');
            bindStoreTabInteractions();
            storeBuilt = true;
          }
        } else if (target === 'compare') {
          renderMap('store-map-compare-pane');
          if (typeof StoreMap !== 'undefined' && StoreMap.toggleCompetitors) StoreMap.toggleCompetitors(true);
          if (!compareBuilt) {
            renderLeaderboardInto(document.getElementById('leaderboard-table-compare'), _compareSource);
            bindCompareTabInteractions();
            compareBuilt = true;
          }
        } else if (target === 'competitor') {
          if (!compBuilt) {
            renderLeaderboardInto(document.getElementById('leaderboard-table-comp'), 'competitors');
            bindCompTabInteractions();
            compBuilt = true;
          }
        } else if (target === 'data') {
          if (!dataBuilt) {
            renderTrafficDataPane();
            dataBuilt = true;
          }
        }
      });
    });
  }

  function initMediaBuyTabs() {
    var tabBar = document.getElementById('mb-perf-tabs');
    if (!tabBar) return;
    var tabs = tabBar.querySelectorAll('.perf-tab');
    var panes = document.querySelectorAll('[data-mb-pane]');
    var trendBuilt = false;
    var dataBuilt = false;
    var creativeBuilt = false;
    var storeBuilt = false;
    tabs.forEach(function(t) {
      t.addEventListener('click', function() {
        var target = t.dataset.mbTab;
        tabs.forEach(function(x) {
          var on = x === t;
          x.classList.toggle('active', on);
          x.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        panes.forEach(function(p) { p.classList.toggle('active', p.dataset.mbPane === target); });
        if (target === 'trend'    && !trendBuilt)    { trendBuilt    = renderMediaBuyTrendPane(); }
        if (target === 'data'     && !dataBuilt)     { dataBuilt     = renderMediaBuyDataPane(); }
        if (target === 'creative' && !creativeBuilt) { creativeBuilt = renderMediaBuyByCreativePane(); }
        if (target === 'store'    && !storeBuilt)    { storeBuilt    = renderMediaBuyByStorePane(); }
        // Re-fire chart resize for already-built ECharts instances when their pane becomes active.
        if (target === 'trend' && _mbTrendChart) _mbTrendChart.resize();
        if (target === 'store' && _mbStoreTrendChart) _mbStoreTrendChart.resize();
      });
    });
  }

  /* ============================================================
     Phase 3 step 9a: Time Trend pane.
     Single full-pane line chart with 4 metric series + range chips.
     Range chips slice the trend data; mock has 5 weeks (wk50–wk2),
     so 13W and 1Y both show the full series for now. Real Pulse feed
     will populate longer ranges per IN-33.
     ============================================================ */
  var _mbTrendChart = null;
  var _mbTrendRange = '13w';
  function renderMediaBuyTrendPane() {
    var el = document.getElementById('mb-trend-chart');
    if (!el) return false;
    var trend = (D.mediaBuyMetrics && D.mediaBuyMetrics.weeklyTrend) || [];
    if (!trend.length) {
      el.innerHTML = '<div class="dist-tree-empty">No trend data available for this entity yet.</div>';
      return true;
    }
    function sliceFor(range) {
      var n;
      if (range === '1w') n = 1;
      else if (range === '4w') n = 4;
      else if (range === '13w') n = 13;
      else n = trend.length; // 1y → all available
      return trend.slice(Math.max(0, trend.length - n));
    }
    function paint(range) {
      var series = sliceFor(range);
      var weeks = series.map(function(w) { return D.getWeekLabel(w.week); });
      _mbTrendChart.setOption({
        legend: {
          data: ['Impressions', 'Clicks', 'CTR', 'CPV'],
          bottom: 0, icon: 'circle', itemWidth: 8, itemHeight: 8,
          textStyle: { fontSize: 11, color: '#6b7280' }
        },
        grid: { left: 50, right: 60, top: 30, bottom: 40, containLabel: true },
        tooltip: chartTooltipDark(),
        xAxis: {
          type: 'category', data: weeks,
          axisLabel: { fontSize: 11, color: '#6b7280' },
          axisLine: { lineStyle: { color: '#e5e7eb' } }
        },
        yAxis: [
          { type: 'value', position: 'left', name: 'Volume', nameTextStyle: { fontSize: 10, color: '#9ca3af' },
            axisLabel: { fontSize: 10, color: '#6b7280', formatter: function(v) { return (v / 1000).toFixed(0) + 'k'; } },
            splitLine: { lineStyle: { color: '#f3f4f6' } } },
          { type: 'value', position: 'right', name: 'Rate', nameTextStyle: { fontSize: 10, color: '#9ca3af' },
            axisLabel: { fontSize: 10, color: '#6b7280' },
            splitLine: { show: false } }
        ],
        series: [
          { name: 'Impressions', type: 'line', smooth: true, lineStyle: { width: 2, color: '#3B82F6' }, itemStyle: { color: '#3B82F6' }, symbolSize: 6, data: series.map(function(w) { return w.impressions; }) },
          { name: 'Clicks',      type: 'line', smooth: true, lineStyle: { width: 2, color: '#22c55e' }, itemStyle: { color: '#22c55e' }, symbolSize: 6, data: series.map(function(w) { return w.clicks; }) },
          { name: 'CTR',         type: 'line', smooth: true, yAxisIndex: 1, lineStyle: { width: 2, color: '#6366f1' }, itemStyle: { color: '#6366f1' }, symbolSize: 6, data: series.map(function(w) { return w.ctr; }) },
          { name: 'CPV',         type: 'line', smooth: true, yAxisIndex: 1, lineStyle: { width: 2, color: '#ef4444' }, itemStyle: { color: '#ef4444' }, symbolSize: 6, data: series.map(function(w) { return w.cost_per_visit; }) }
        ]
      });
    }
    _mbTrendChart = echarts.init(el);
    paint(_mbTrendRange);
    // Wire range chips
    var chips = document.querySelectorAll('#mb-trend-ranges .duration-preset');
    chips.forEach(function(c) {
      c.addEventListener('click', function() {
        _mbTrendRange = c.dataset.mbRange;
        chips.forEach(function(x) { x.classList.toggle('duration-preset--active', x === c); });
        paint(_mbTrendRange);
      });
    });
    return true;
  }

  /* ============================================================
     Phase 3 step 9c: By Store pane.
     Mode toggle (Bar / Data / Trend) over a single store-grain dataset
     aggregated from Records.mediaRecords (store_id × week_id grain).
     ============================================================ */
  var _mbStoreMode = 'bar';
  var _mbStoreTrendChart = null;

  function _mbStoreAggregateAll() {
    // Aggregate all mediaRecords by store_id (across weeks).
    var byStore = {};
    (D.getMediaRecords ? D.getMediaRecords('all', null) : []).forEach(function(r) {
      var s = byStore[r.store_id];
      if (!s) {
        s = byStore[r.store_id] = { store_id: r.store_id, impressions: 0, clicks: 0, gross_visits: 0, spend: 0 };
      }
      s.impressions += r.impressions || 0;
      s.clicks += r.clicks || 0;
      s.gross_visits += r.gross_visits || 0;
      s.spend += r.spend || 0;
    });
    return Object.keys(byStore).map(function(k) {
      var s = byStore[k];
      s.ctr = s.impressions > 0 ? (s.clicks / s.impressions) * 100 : 0;
      s.cpv = s.gross_visits > 0 ? (s.spend / s.gross_visits) : 0;
      s.cpm = s.impressions > 0 ? (s.spend / (s.impressions / 1000)) : 0;
      return s;
    }).sort(function(a, b) { return b.gross_visits - a.gross_visits; });
  }

  function _mbStoreAggregateByWeek() {
    // Aggregate by store_id × week_id for trend mode.
    var byKey = {};
    (D.getMediaRecords ? D.getMediaRecords('all', null) : []).forEach(function(r) {
      var k = r.store_id + '|' + r.week_id;
      if (!byKey[k]) byKey[k] = { store_id: r.store_id, week_id: r.week_id, gross_visits: 0 };
      byKey[k].gross_visits += r.gross_visits || 0;
    });
    return Object.keys(byKey).map(function(k) { return byKey[k]; });
  }

  function renderMediaBuyByStorePane() {
    var host = document.getElementById('mb-store-content');
    if (!host) return false;

    function paint() {
      if (_mbStoreMode === 'bar') paintBar();
      else if (_mbStoreMode === 'data') paintData();
      else if (_mbStoreMode === 'trend') paintTrend();
    }

    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

    function paintBar() {
      var stores = _mbStoreAggregateAll();
      if (!stores.length) {
        host.innerHTML = '<div class="dist-tree-empty">No store-level data available for this entity.</div>';
        return;
      }
      var max = stores[0].gross_visits || 1;
      host.innerHTML = '<div class="dist-tree-data-grid"><div class="dist-tree-header" style="padding:10px 12px;font-weight:600;">Top stores by visits (all weeks combined)</div>'
        + '<div style="padding:10px 14px;display:flex;flex-direction:column;gap:8px;">'
        + stores.map(function(s, i) {
            var pct = (s.gross_visits / max) * 100;
            return '<div style="display:flex;align-items:center;gap:10px;font-size:12px;">'
              + '<span style="width:30px;color:var(--p-text-color-secondary);">#' + (i + 1) + '</span>'
              + '<span style="flex:0 0 130px;">' + esc(s.store_id) + '</span>'
              + '<span style="flex:1;height:10px;background:#eef2f7;border-radius:999px;overflow:hidden;"><span style="display:block;height:100%;width:' + pct.toFixed(1) + '%;background:var(--p-primary-color,#2196F3);"></span></span>'
              + '<span style="flex:0 0 70px;text-align:right;font-weight:600;">' + fmtNumber(s.gross_visits) + '</span>'
              + '<span style="flex:0 0 70px;text-align:right;color:var(--p-text-color-secondary);">' + (s.ctr ? fmtPct(s.ctr) : '—') + '</span>'
              + '<span style="flex:0 0 80px;text-align:right;color:var(--p-text-color-secondary);">' + fmtCurrency(s.spend) + '</span>'
              + '</div>';
          }).join('')
        + '</div></div>';
    }

    function paintData() {
      var stores = _mbStoreAggregateAll();
      if (!stores.length) { host.innerHTML = '<div class="dist-tree-empty">No store-level data available.</div>'; return; }
      var rows = stores.map(function(s, i) {
        return '<tr>'
          + '<td class="col-num">' + (i + 1) + '</td>'
          + '<td class="col-creative">' + esc(s.store_id) + '</td>'
          + '<td class="col-stores">' + fmtNumber(s.impressions) + '</td>'
          + '<td class="col-stores">' + fmtNumber(s.clicks) + '</td>'
          + '<td class="col-ctr">' + (s.ctr ? fmtPct(s.ctr) : '—') + '</td>'
          + '<td class="col-visits">' + fmtNumber(s.gross_visits) + '</td>'
          + '<td class="col-cpv">' + fmtCurrency(s.cpv) + '</td>'
          + '<td class="col-cpm">' + fmtCurrency(s.cpm) + '</td>'
          + '<td class="col-spend">' + fmtCurrency(s.spend) + '</td>'
          + '</tr>';
      }).join('');
      host.innerHTML = '<div class="dist-tree-data-grid"><div class="dist-tree-table-wrap">'
        + '<table class="dist-tree-table">'
        +   '<thead><tr>'
        +     '<th class="col-num">#</th>'
        +     '<th class="col-creative">Store</th>'
        +     '<th class="col-stores">Impressions</th>'
        +     '<th class="col-stores">Clicks</th>'
        +     '<th class="col-ctr">CTR</th>'
        +     '<th class="col-visits">Visits</th>'
        +     '<th class="col-cpv">CPV</th>'
        +     '<th class="col-cpm">CPM</th>'
        +     '<th class="col-spend">Spend</th>'
        +   '</tr></thead>'
        +   '<tbody>' + rows + '</tbody>'
        + '</table>'
      + '</div></div>';
    }

    function paintTrend() {
      // Top 5 stores' visit trend over weeks.
      var stores = _mbStoreAggregateAll().slice(0, 5);
      var byWeek = _mbStoreAggregateByWeek();
      // Filter D.flightWeeks to just those that have data (mock spans a small
      // subset; full flightWeeks list would render an empty x-axis tail).
      var weeksWithData = {};
      byWeek.forEach(function(r) { weeksWithData[r.week_id] = true; });
      var weekIds = (D.flightWeeks || [])
        .map(function(w) { return w.id; })
        .filter(function(id) { return weeksWithData[id]; });
      if (!weekIds.length) {
        var seen = {}; weekIds = [];
        byWeek.forEach(function(r) { if (!seen[r.week_id]) { seen[r.week_id] = true; weekIds.push(r.week_id); } });
      }
      host.innerHTML = '<div class="dist-tree-data-grid" style="padding:12px;">'
        + '<div style="font-weight:600;margin-bottom:8px;">Top 5 stores — visits by week</div>'
        + '<div id="mb-store-trend-chart" style="height:360px;"></div>'
        + '</div>';
      var el = document.getElementById('mb-store-trend-chart');
      if (!el) return;
      _mbStoreTrendChart = echarts.init(el);
      var palette = ['#3B82F6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];
      _mbStoreTrendChart.setOption({
        legend: { bottom: 0, icon: 'circle', itemWidth: 8, itemHeight: 8, textStyle: { fontSize: 11, color: '#6b7280' } },
        grid: { left: 50, right: 30, top: 20, bottom: 40, containLabel: true },
        tooltip: { trigger: 'axis' },
        xAxis: {
          type: 'category', data: weekIds.map(function(w) { return D.getWeekLabel ? D.getWeekLabel(w) : w; }),
          axisLabel: { fontSize: 11, color: '#6b7280' },
          axisLine: { lineStyle: { color: '#e5e7eb' } }
        },
        yAxis: { type: 'value', name: 'Visits', axisLabel: { fontSize: 10, color: '#6b7280' }, splitLine: { lineStyle: { color: '#f3f4f6' } } },
        series: stores.map(function(s, i) {
          var lookup = {};
          byWeek.filter(function(r) { return r.store_id === s.store_id; }).forEach(function(r) { lookup[r.week_id] = r.gross_visits; });
          return {
            name: s.store_id,
            type: 'line',
            smooth: true,
            symbolSize: 6,
            lineStyle: { width: 2, color: palette[i % palette.length] },
            itemStyle: { color: palette[i % palette.length] },
            data: weekIds.map(function(w) { return lookup[w] || 0; })
          };
        })
      });
    }

    // Wire mode toggle (re-bind once; mode buttons are static markup).
    var modeBtns = document.querySelectorAll('#mb-store-mode .view-toggle__btn');
    modeBtns.forEach(function(b) {
      b.addEventListener('click', function() {
        _mbStoreMode = b.dataset.mbStoreMode;
        modeBtns.forEach(function(x) {
          var on = x === b;
          x.classList.toggle('active', on);
          x.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        paint();
      });
    });

    paint();
    return true;
  }

  /* ============================================================
     Phase 3 step 9b: By Creative pane.
     creative-icon chip strip ("All Creatives" + per-creative) +
     hero band (active creative aggregate) + 2-col panels
     (left: stores ranked by visit share, right: detail metric tiles).
     ============================================================ */
  var _mbActiveCreative = 'all'; // 'all' | creative_id

  function _mbAggregateMetrics(records) {
    // Sum aggregable fields, derive rates from sums.
    var imp = 0, clk = 0, vis = 0, spend = 0, stores = {};
    records.forEach(function(cr) {
      var m = cr.metrics || {};
      imp += m.impressions || 0;
      clk += m.clicks || 0;
      vis += m.gross_visits || 0;
      spend += m.spend || 0;
      (cr.store_group || []).forEach(function(s) { stores[s] = true; });
    });
    return {
      impressions: imp,
      clicks: clk,
      gross_visits: vis,
      spend: spend,
      ctr: imp > 0 ? (clk / imp) * 100 : 0,
      cpm: imp > 0 ? (spend / (imp / 1000)) : 0,
      cpc: clk > 0 ? (spend / clk) : 0,
      cost_per_visit: vis > 0 ? (spend / vis) : 0,
      storeCount: Object.keys(stores).length
    };
  }

  function _mbCreativeIcon(cr) {
    // Brand-colored icon: prefer file_url thumb, else type icon, else initials.
    var url = cr && cr.file_url;
    var typeIcon = cr && cr.creative_type === 'video' ? 'movie' : (cr && cr.creative_type === 'gif' ? 'gif_box' : 'image');
    if (url) return '<span class="creative-icon"><img src="' + url + '" alt="" onerror="this.replaceWith(Object.assign(document.createElement(\'span\'),{className:\'material-symbols-outlined\',textContent:\'' + typeIcon + '\'}))"></span>';
    return '<span class="creative-icon"><span class="material-symbols-outlined">' + typeIcon + '</span></span>';
  }

  function renderMediaBuyByCreativePane() {
    var chipsEl = document.getElementById('mb-creative-chips');
    var heroEl = document.getElementById('mb-creative-hero');
    var twoColEl = document.getElementById('mb-creative-2col');
    if (!chipsEl || !heroEl || !twoColEl) return false;

    var allRecords = (D.creativeRecords || []).filter(function(cr) { return cr.metrics !== null; });
    if (!allRecords.length) {
      chipsEl.innerHTML = '<div class="dist-tree-empty">No creative data available for this entity.</div>';
      heroEl.innerHTML = '';
      twoColEl.innerHTML = '';
      return true;
    }
    var sorted = allRecords.slice().sort(function(a, b) { return (b.metrics && b.metrics.gross_visits || 0) - (a.metrics && a.metrics.gross_visits || 0); });

    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

    function chipHtml(cr, isAll, rank) {
      // Canonical rich .creative-chip card. "All" chip uses the gradient
      // thumb variant; specific creatives use file_url thumb → type icon →
      // initials fallback chain. DP16.1 rank badge for non-All only.
      var active = (isAll && _mbActiveCreative === 'all') || (cr && cr.creative_id === _mbActiveCreative);
      var key = isAll ? 'all' : cr.creative_id;
      if (isAll) {
        return '<button type="button" class="creative-chip mb-creative-chip' + (active ? ' creative-chip--active' : '') + '" data-creative-key="all">'
          + '<div class="creative-chip__header">'
          +   '<div class="creative-chip__thumb creative-chip__thumb--all"><span class="material-symbols-outlined">apps</span></div>'
          + '</div>'
          + '<span class="creative-chip__name">All Creatives</span>'
          + '<span class="creative-chip__meta">' + sorted.length + ' creatives</span>'
          + '</button>';
      }
      var label = (cr.label || cr.notes || '').split(' — ')[0] || cr.creative_id;
      var initials = label.split(/\s+/).map(function(w) { return w[0] || ''; }).join('').slice(0, 2).toUpperCase();
      var hasImg = !!cr.file_url;
      var thumbInner = hasImg
        ? '<img src="' + esc(cr.file_url) + '" alt="' + esc(label) + '" onerror="this.replaceWith(Object.assign(document.createElement(\'span\'),{className:\'creative-chip__thumb-initials\',textContent:\'' + initials + '\'}))">'
        : (cr.creative_type === 'video'
            ? '<span class="material-symbols-outlined">play_arrow</span>'
            : '<span class="creative-chip__thumb-initials">' + initials + '</span>');
      var meta = ((cr.creative_type || '').toUpperCase() || '—') + (cr.dimensions ? ' · ' + esc(cr.dimensions) : '') + (cr.store_group ? ' · ' + cr.store_group.length + ' stores' : '');
      return '<button type="button" class="creative-chip mb-creative-chip' + (active ? ' creative-chip--active' : '') + '" data-creative-key="' + esc(key) + '">'
        + '<div class="creative-chip__header">'
        +   '<div class="creative-chip__thumb">' + thumbInner + '</div>'
        +   '<span class="creative-chip__rank">' + rank + '</span>'
        + '</div>'
        + '<span class="creative-chip__name">' + esc(label) + '</span>'
        + '<span class="creative-chip__meta">' + meta + '</span>'
        + '</button>';
    }

    function paint() {
      // 1. Chips — cap at 50 per plan (others reachable via Data tab table or filter).
      var CHIP_CAP = 50;
      var chipParts = [chipHtml(null, true, 0)];
      sorted.slice(0, CHIP_CAP).forEach(function(cr, i) { chipParts.push(chipHtml(cr, false, i + 1)); });
      if (sorted.length > CHIP_CAP) {
        chipParts.push('<span class="dist-chip-selector__chip" style="border-style:dashed;cursor:default;color:var(--p-text-color-secondary);" title="' + (sorted.length - CHIP_CAP) + ' more not shown — use Data tab for full list">+' + (sorted.length - CHIP_CAP) + ' more</span>');
      }
      chipsEl.innerHTML = chipParts.join('');
      if (window.ChipCarousel) ChipCarousel.refresh(chipsEl);

      // 2. Hero band — active aggregate
      var activeRecords = _mbActiveCreative === 'all' ? sorted : sorted.filter(function(cr) { return cr.creative_id === _mbActiveCreative; });
      var activeCr = activeRecords.length === 1 ? activeRecords[0] : null;
      var agg = _mbAggregateMetrics(activeRecords);
      var heroName = activeCr
        ? esc((activeCr.label || activeCr.notes || '').split(' — ')[0] || activeCr.creative_id) + ' <em>— ' + esc((activeCr.label || '').split(' — ')[1] || activeCr.creative_type || '') + '</em>'
        : 'ALL CREATIVES <em>— Combined (' + sorted.length + ')</em>';
      heroEl.innerHTML = '<span class="dist-hero-band__name">' + heroName + '</span>'
        + '<div class="dist-hero-band__metrics">'
        +   '<div class="dist-hero-band__metric"><span class="dist-hero-band__metric-value">' + (agg.ctr ? fmtPct(agg.ctr) : '—') + '</span><span class="dist-hero-band__metric-label">CTR</span></div>'
        +   '<div class="dist-hero-band__metric"><span class="dist-hero-band__metric-value">' + fmtNumber(agg.gross_visits) + '</span><span class="dist-hero-band__metric-label">Visits</span></div>'
        +   '<div class="dist-hero-band__metric"><span class="dist-hero-band__metric-value">' + fmtCurrency(agg.cost_per_visit) + '</span><span class="dist-hero-band__metric-label">CPV</span></div>'
        +   '<div class="dist-hero-band__metric"><span class="dist-hero-band__metric-value">' + fmtCurrency(agg.spend) + '</span><span class="dist-hero-band__metric-label">Spend</span></div>'
        + '</div>';

      // 3. Two-col panels — left: store list (rank by visit share within active set),
      //    right: detail metric tiles (impressions, clicks, CPM, CPC, store count).
      var stores = {};
      activeRecords.forEach(function(cr) {
        var perStoreVisits = (cr.metrics && cr.metrics.gross_visits || 0) / Math.max(1, (cr.store_group || []).length);
        (cr.store_group || []).forEach(function(s) {
          stores[s] = (stores[s] || 0) + perStoreVisits;
        });
      });
      var storeRows = Object.keys(stores)
        .map(function(s) { return { id: s, visits: stores[s] }; })
        .sort(function(a, b) { return b.visits - a.visits; })
        .slice(0, 12);
      var maxVisits = storeRows.length ? storeRows[0].visits : 1;
      var leftCol = '<div class="dist-tree-data-grid"><div class="dist-tree-header" style="padding:10px 12px;font-weight:600;">Top stores by visit share</div><div style="padding:8px 12px;display:flex;flex-direction:column;gap:6px;">'
        + storeRows.map(function(r, i) {
            var pct = (r.visits / maxVisits) * 100;
            return '<div style="display:flex;align-items:center;gap:8px;">'
              + '<span style="width:26px;font-size:11px;color:var(--p-text-color-secondary);">#' + (i + 1) + '</span>'
              + '<span style="flex:0 0 130px;font-size:12px;">Store ' + esc(r.id) + '</span>'
              + '<span style="flex:1;height:8px;background:#eef2f7;border-radius:999px;overflow:hidden;"><span style="display:block;height:100%;width:' + pct.toFixed(1) + '%;background:var(--p-primary-color,#2196F3);"></span></span>'
              + '<span style="flex:0 0 64px;text-align:right;font-size:12px;font-weight:600;">' + fmtNumber(Math.round(r.visits)) + '</span>'
              + '</div>';
          }).join('')
        + '</div></div>';

      var rightCol = '<div class="dist-tree-data-grid"><div class="dist-tree-header" style="padding:10px 12px;font-weight:600;">Detail metrics</div><div class="ep-detail-sidebar__metrics" style="padding:12px;">'
        +   '<div class="ep-detail-sidebar__metric-tile"><div class="ep-detail-sidebar__metric-label">Impressions</div><div class="ep-detail-sidebar__metric-value">' + fmtNumber(agg.impressions) + '</div></div>'
        +   '<div class="ep-detail-sidebar__metric-tile"><div class="ep-detail-sidebar__metric-label">Clicks</div><div class="ep-detail-sidebar__metric-value">' + fmtNumber(agg.clicks) + '</div></div>'
        +   '<div class="ep-detail-sidebar__metric-tile"><div class="ep-detail-sidebar__metric-label">CPM</div><div class="ep-detail-sidebar__metric-value">' + fmtCurrency(agg.cpm) + '</div></div>'
        +   '<div class="ep-detail-sidebar__metric-tile"><div class="ep-detail-sidebar__metric-label">CPC</div><div class="ep-detail-sidebar__metric-value">' + fmtCurrency(agg.cpc) + '</div></div>'
        +   '<div class="ep-detail-sidebar__metric-tile"><div class="ep-detail-sidebar__metric-label">Stores</div><div class="ep-detail-sidebar__metric-value">' + agg.storeCount + '</div></div>'
        +   '<div class="ep-detail-sidebar__metric-tile"><div class="ep-detail-sidebar__metric-label">Creatives</div><div class="ep-detail-sidebar__metric-value">' + activeRecords.length + '</div></div>'
        + '</div></div>';

      twoColEl.innerHTML = leftCol + rightCol;

      // Wire chip clicks (re-bound after each paint since markup is replaced).
      chipsEl.querySelectorAll('.mb-creative-chip').forEach(function(c) {
        c.addEventListener('click', function() {
          _mbActiveCreative = c.dataset.creativeKey;
          paint();
        });
      });
    }

    paint();
    return true;
  }

  /* Phase 3 step 9a: Data pane — per-creative table (full set, sortable
     column headers in a future pass). Reuses the same row shape as the
     chip-selector Table view for rank parity (DP16.1). */
  function renderMediaBuyDataPane() {
    var host = document.getElementById('mb-data-grid');
    if (!host) return false;
    var allRecords = D.creativeRecords || [];
    var records = allRecords.filter(function(cr) { return cr.metrics !== null; });
    if (!records.length) {
      host.innerHTML = '<div class="dist-tree-empty">No creative data available for this entity.</div>';
      return true;
    }
    var sorted = records
      .map(function(cr) { return Object.assign({}, cr, { _origIndex: allRecords.indexOf(cr) }); })
      .sort(function(a, b) { return (b.metrics && b.metrics.gross_visits || 0) - (a.metrics && a.metrics.gross_visits || 0); });
    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    var rows = sorted.map(function(cr, i) {
      var labelParts = (cr.label || cr.notes || '').split(' — ');
      var name = labelParts[0] || cr.label || '(unnamed)';
      var region = labelParts[1] || '';
      var m = cr.metrics || {};
      return '<tr data-orig-index="' + cr._origIndex + '">'
        + '<td class="col-num">' + (i + 1) + '</td>'
        + '<td class="col-creative">' + esc(name) + (region ? ' <span style="color:var(--p-text-color-secondary);">— ' + esc(region) + '</span>' : '') + '</td>'
        + '<td class="col-type">' + esc((cr.creative_type || '').toUpperCase()) + '</td>'
        + '<td class="col-stores">' + (cr.store_group ? cr.store_group.length : 0) + '</td>'
        + '<td class="col-ctr">' + (m.ctr != null ? fmtPct(m.ctr) : '—') + '</td>'
        + '<td class="col-visits">' + (m.gross_visits != null ? fmtNumber(m.gross_visits) : '—') + '</td>'
        + '<td class="col-cpv">' + (m.cost_per_visit != null ? fmtCurrency(m.cost_per_visit) : '—') + '</td>'
        + '<td class="col-cpm">' + (m.cpm != null ? fmtCurrency(m.cpm) : '—') + '</td>'
        + '<td class="col-cpc">' + (m.cpc != null ? fmtCurrency(m.cpc) : '—') + '</td>'
        + '<td class="col-spend">' + (m.spend != null ? fmtCurrency(m.spend) : '—') + '</td>'
        + '</tr>';
    }).join('');
    host.innerHTML = '<div class="dist-tree-table-wrap">'
      + '<table class="dist-tree-table">'
      +   '<thead><tr>'
      +     '<th class="col-num">#</th>'
      +     '<th class="col-creative">Creative</th>'
      +     '<th class="col-type">Type</th>'
      +     '<th class="col-stores">Stores</th>'
      +     '<th class="col-ctr">CTR</th>'
      +     '<th class="col-visits">Visits</th>'
      +     '<th class="col-cpv">CPV</th>'
      +     '<th class="col-cpm">CPM</th>'
      +     '<th class="col-cpc">CPC</th>'
      +     '<th class="col-spend">Spend</th>'
      +   '</tr></thead>'
      +   '<tbody>' + rows + '</tbody>'
      + '</table>'
    + '</div>';
    // Click row → open detail sidebar (DP16.1: rank parity preserved with chip rank).
    host.querySelectorAll('tbody tr').forEach(function(row) {
      row.style.cursor = 'pointer';
      row.addEventListener('click', function() {
        var idx = parseInt(row.dataset.origIndex, 10);
        if (typeof window.viewVariantDetails === 'function') window.viewVariantDetails(idx);
      });
    });
    return true;
  }

  function renderMediaAttributedVisits() {
    var statsHost = document.getElementById('media-visits-stats');
    var byStoreEl = document.getElementById('media-visits-by-store');
    var byWeekEl  = document.getElementById('media-visits-by-week');
    var trendEl   = document.getElementById('media-visits-trend-chart');
    if (!statsHost && !byStoreEl && !byWeekEl && !trendEl) return; // not on this page

    // Mock totals — replaces with Pulse-joined panel data when ingest lands.
    var mockTotal = 18420;
    var mockSpend = 12850;
    var visitsPerDollar = (mockTotal / mockSpend).toFixed(2);
    var topCampaign = 'Holiday Banner — South FL';

    if (statsHost) {
      statsHost.innerHTML = ''
        + '<div class="media-visits-stat"><span class="media-visits-stat__value">' + mockTotal.toLocaleString() + '</span><span class="media-visits-stat__label">Observed visits attributed to media (wk 2)</span></div>'
        + '<div class="media-visits-stat"><span class="media-visits-stat__value">$' + mockSpend.toLocaleString() + '</span><span class="media-visits-stat__label">Spend joined</span></div>'
        + '<div class="media-visits-stat"><span class="media-visits-stat__value">' + visitsPerDollar + '</span><span class="media-visits-stat__label">Visits per $1 spent</span></div>'
        + '<div class="media-visits-stat"><span class="media-visits-stat__value media-visits-stat__value--text">' + topCampaign + '</span><span class="media-visits-stat__label">Top driving campaign</span></div>';
    }

    // Phase 3 step 2 — charts init lazily on first tab activation to avoid
    // zero-width render bug when a chart's pane starts hidden (display:none).
    var byStoreInit = false, byWeekInit = false, trendInit = false;
    function initByStore() { if (byStoreInit || !byStoreEl) return; byStoreInit = true; renderByStoreChart(byStoreEl); }
    function initByWeek()  { if (byWeekInit  || !byWeekEl)  return; byWeekInit  = true; renderByWeekChart(byWeekEl); }
    function initTrend()   { if (trendInit   || !trendEl)   return; trendInit   = true; renderTrendOverTimeChart(trendEl); }

    var tabBar = document.getElementById('media-visits-tabs');
    if (tabBar) {
      var tabs = tabBar.querySelectorAll('.perf-tab');
      var panes = document.querySelectorAll('[data-mv-pane]');
      tabs.forEach(function(t) {
        t.addEventListener('click', function() {
          var target = t.dataset.mvTab;
          tabs.forEach(function(x) {
            var on = x === t;
            x.classList.toggle('active', on);
            x.setAttribute('aria-selected', on ? 'true' : 'false');
          });
          panes.forEach(function(p) { p.classList.toggle('active', p.dataset.mvPane === target); });
          if (target === 'store') initByStore();
          if (target === 'week')  initByWeek();
          if (target === 'trendovertime') initTrend();
        });
      });
    } else {
      // No tab strip on this page (other distribution pages may import this fn);
      // fall back to eager init.
      initByStore();
      initByWeek();
      initTrend();
    }

    // Visits by store — joined to spend
    function renderByStoreChart(byStoreEl) {
      // 83-store mock — matches cohort count surfaced in main context.
      // Real Pulse-joined panel data will replace this when ingest lands.
      var seedNames = [
        ['705','Haines City'],['2487','Sarasota'],['2288','Orlando'],['726','St James City'],
        ['481','Jacksonville'],['436','Tampa'],['123','Jacksonville'],['711','Orlando'],
        ['1042','Miami'],['1187','Fort Lauderdale'],['223','Naples'],['634','Cape Coral'],
        ['819','Gainesville'],['912','Tallahassee'],['305','Pensacola'],['418','Lakeland'],
        ['557','Ocala'],['673','Daytona Beach'],['748','Melbourne'],['861','Palm Bay'],
        ['934','Vero Beach'],['1024','Port St Lucie'],['1156','Stuart'],['1289','Jupiter'],
        ['1342','Boca Raton'],['1455','Delray Beach'],['1567','Boynton Beach'],['1678','Palm Beach'],
        ['1789','West Palm Beach'],['1890','Wellington'],['1933','Coral Springs'],['2011','Pompano'],
        ['2098','Hollywood'],['2145','Aventura'],['2231','Hialeah'],['2356','Doral'],
        ['2467','Kendall'],['2589','Homestead'],['2611','Key Largo'],['2734','Marathon'],
        ['2856','Key West'],['2942','Big Pine'],['3057','Islamorada'],['3168','Pinecrest'],
        ['3284','Cutler Bay'],['3391','Palmetto Bay'],['3458','South Miami'],['3572','Coral Gables'],
        ['3689','Pinecrest E'],['3712','Brickell'],['3845','Wynwood'],['3967','Little Havana'],
        ['4023','North Miami'],['4156','Miami Beach'],['4278','Surfside'],['4389','Bal Harbour'],
        ['4471','Sunny Isles'],['4592','Aventura N'],['4658','Hallandale'],['4773','Davie'],
        ['4886','Plantation'],['4934','Sunrise'],['5042','Weston'],['5167','Coconut Creek'],
        ['5273','Margate'],['5398','Coconut Grove'],['5421','Pembroke Pines'],['5536','Miramar'],
        ['5648','Cooper City'],['5759','SW Ranches'],['5872','Parkland'],['5983','Tamarac'],
        ['6094','Lauderhill'],['6201','N Lauderdale'],['6318','Oakland Park'],['6429','Wilton Manors'],
        ['6537','Lighthouse Pt'],['6648','Deerfield Beach'],['6759','Highland Beach'],['6871','Manalapan'],
        ['6982','Lantana'],['7094','Greenacres'],['7211','Lake Worth']
      ];
      var stores = seedNames.map(function(n, i) {
        var v = Math.round(3600 * Math.pow(0.96, i) + ((i * 31) % 17 - 8) * 5);
        var spendBase = v * (0.45 + ((i * 17) % 11) / 100);
        return { name: '#' + n[0] + ' ' + n[1], visits: Math.max(40, v), spend: Math.max(30, Math.round(spendBase)) };
      });
      // Sort desc + assign explicit rank, share, CPV.
      stores = stores.slice().sort(function(a, b) { return b.visits - a.visits; });
      stores.forEach(function(s, i) { s.rank = i + 1; });
      var totalVisits = stores.reduce(function(t, s) { return t + s.visits; }, 0);
      var maxVisits = stores.reduce(function(m, s) { return Math.max(m, s.visits); }, 0);
      stores.forEach(function(s) {
        s.share = totalVisits ? s.visits / totalVisits : 0;
        s.cpv = s.visits ? s.spend / s.visits : 0;
      });
      // CSS-bar list — pixel-perfect rank-badge alignment (matches
      // .creative-card__rank spec) and a CSS-driven dark hover popover.
      byStoreEl.style.height = '';
      byStoreEl.classList.add('mv-store-list');
      byStoreEl.innerHTML = stores.map(function(s) {
        var widthPct = maxVisits ? (s.visits / maxVisits * 100).toFixed(2) : 0;
        var tipText = s.name + '\n' + s.visits.toLocaleString() + ' observed visits · $' + s.spend.toLocaleString() + ' spend';
        return '<div class="mv-store-row" data-tip="' + tipText.replace(/"/g, '&quot;') + '">'
          +   '<span class="mv-store-row__rank">' + s.rank + '</span>'
          +   '<span class="mv-store-row__name">' + s.name + '</span>'
          +   '<div class="mv-store-row__bar"><div class="mv-store-row__bar-fill" style="width:' + widthPct + '%"></div></div>'
          +   '<span class="mv-store-row__end">$' + s.cpv.toFixed(2) + '/visit · ' + (s.share * 100).toFixed(1) + '%</span>'
          + '</div>';
      }).join('');
      bindStoreRowTooltip(byStoreEl);
    }
    function bindStoreRowTooltip(host) {
      var tip = document.getElementById('mv-store-tip');
      if (!tip) {
        tip = document.createElement('div');
        tip.id = 'mv-store-tip';
        tip.className = 'mv-store-tip';
        document.body.appendChild(tip);
      }
      host.querySelectorAll('.mv-store-row').forEach(function(row) {
        row.addEventListener('mouseenter', function() {
          var lines = (row.dataset.tip || '').split('\n');
          tip.innerHTML = lines.map(function(l, idx) {
            return idx === 0 ? '<div class="mv-store-tip__title">' + l + '</div>' : '<div>' + l + '</div>';
          }).join('');
          tip.style.display = 'block';
        });
        row.addEventListener('mousemove', function(e) {
          tip.style.left = (e.clientX + 12) + 'px';
          tip.style.top  = (e.clientY + 12) + 'px';
        });
        row.addEventListener('mouseleave', function() { tip.style.display = 'none'; });
      });
    }

    // Visits by week — static current-campaign-window chart.
    function renderByWeekChart(byWeekEl) {
      var weeks = ['Wk 51', 'Wk 52', 'Wk 1', 'Wk 2'];
      var visits = [14200, 16800, 17350, 18420];
      var spend = [11900, 12300, 12700, 12850];
      var ch2 = echarts.init(byWeekEl);
      ch2.setOption({
        grid: { left: 50, right: 60, top: 30, bottom: 40, containLabel: true },
        legend: { data: ['Observed visits', 'Spend ($)'], bottom: 0, icon: 'circle', itemWidth: 8, itemHeight: 8, textStyle: { fontSize: 11, color: '#6b7280' } },
        xAxis: { type: 'category', data: weeks, axisLabel: { fontSize: 11, color: '#6b7280' }, axisLine: { lineStyle: { color: '#e5e7eb' } } },
        yAxis: [
          { type: 'value', position: 'left', name: 'Observed visits', nameTextStyle: { fontSize: 10, color: '#9ca3af' },
            axisLabel: { fontSize: 10, color: '#6b7280', formatter: function(v) { return (v/1000).toFixed(0) + 'k'; } },
            splitLine: { lineStyle: { color: '#f3f4f6' } } },
          { type: 'value', position: 'right', name: 'Spend ($)', nameTextStyle: { fontSize: 10, color: '#9ca3af' },
            axisLabel: { fontSize: 10, color: '#6b7280', formatter: function(v) { return '$' + (v/1000).toFixed(0) + 'k'; } },
            splitLine: { show: false } }
        ],
        series: [
          { name: 'Observed visits', type: 'bar', barMaxWidth: 36, itemStyle: { color: '#4272D8', borderRadius: [3, 3, 0, 0] }, data: visits },
          { name: 'Spend ($)', type: 'line', smooth: true, yAxisIndex: 1, lineStyle: { width: 2, color: '#E07850' }, itemStyle: { color: '#E07850' }, symbolSize: 6, data: spend }
        ],
        tooltip: chartTooltipDark()
      });
    }

    // Trend Over Time — duration-preset driven (1W/4W/13W/1Y).
    // Mirrors Visitation page's Trend Over Time architecture.
    function renderTrendOverTimeChart(trendEl) {
      var fullSeries = (function() {
        var out = [];
        var baseVisits = 12000, baseSpend = 10500;
        for (var i = 0; i < 52; i++) {
          var growth = 1 + i * 0.012;
          var noise = 1 + (Math.sin(i * 0.7) * 0.08);
          out.push({
            label: 'Wk ' + (((i + 1 - 1) % 52) + 1),
            visits: Math.round(baseVisits * growth * noise),
            spend:  Math.round(baseSpend  * growth * (1 + Math.cos(i * 0.5) * 0.05))
          });
        }
        return out;
      })();
      function sliceFor(r) {
        var n = r === '1w' ? 1 : r === '1m' ? 4 : r === '1q' ? 13 : 52;
        return fullSeries.slice(Math.max(0, fullSeries.length - n));
      }
      var ch3 = echarts.init(trendEl);
      function paint(r) {
        var s = sliceFor(r);
        ch3.setOption({
          grid: { left: 50, right: 60, top: 30, bottom: 40, containLabel: true },
          legend: { data: ['Observed visits', 'Spend ($)'], bottom: 0, icon: 'circle', itemWidth: 8, itemHeight: 8, textStyle: { fontSize: 11, color: '#6b7280' } },
          xAxis: { type: 'category', data: s.map(function(w) { return w.label; }), axisLabel: { fontSize: 11, color: '#6b7280' }, axisLine: { lineStyle: { color: '#e5e7eb' } } },
          yAxis: [
            { type: 'value', position: 'left', name: 'Observed visits', nameTextStyle: { fontSize: 10, color: '#9ca3af' },
              axisLabel: { fontSize: 10, color: '#6b7280', formatter: function(v) { return (v/1000).toFixed(0) + 'k'; } },
              splitLine: { lineStyle: { color: '#f3f4f6' } } },
            { type: 'value', position: 'right', name: 'Spend ($)', nameTextStyle: { fontSize: 10, color: '#9ca3af' },
              axisLabel: { fontSize: 10, color: '#6b7280', formatter: function(v) { return '$' + (v/1000).toFixed(0) + 'k'; } },
              splitLine: { show: false } }
          ],
          series: [
            { name: 'Observed visits', type: 'bar', barMaxWidth: 36, itemStyle: { color: '#4272D8', borderRadius: [3, 3, 0, 0] }, data: s.map(function(w) { return w.visits; }) },
            { name: 'Spend ($)', type: 'line', smooth: true, yAxisIndex: 1, lineStyle: { width: 2, color: '#E07850' }, itemStyle: { color: '#E07850' }, symbolSize: 6, data: s.map(function(w) { return w.spend; }) }
          ],
          tooltip: chartTooltipDark()
        }, true);
      }
      paint('1q');
      var chips = document.querySelectorAll('#media-visits-trend-ranges .duration-preset');
      chips.forEach(function(c) {
        c.addEventListener('click', function() {
          chips.forEach(function(x) { x.classList.toggle('duration-preset--active', x === c); });
          paint(c.dataset.mvRange);
        });
      });
    }
  }

})();
