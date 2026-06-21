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
    invalidateLazyPanes();
  }

  // ========================================
  // Lazy-pane invalidation on context change
  // (UX-846 deferred-decisions #1) — Main Context (entity / date range)
  // drives all surfaces. Per-tab lazy panes cache built state in the
  // _trafficShareBuilt / _mediaBuyBuilt objects below; on context change
  // (entity reset, date change, dataRefresh) renderAll() calls this to
  // reset flags, dispose stale ECharts in lazy panes, and re-trigger the
  // active tab so its content rebuilds against fresh context.
  // ========================================
  var _trafficShareBuilt = { store: false, compare: false, comp: false, data: false };
  var _mediaBuyBuilt = { trend: false, data: false, creative: false, store: false };

  function invalidateLazyPanes() {
    var tsBar = document.getElementById('ts-perf-tabs');
    var mbBar = document.getElementById('mb-perf-tabs');
    if (!tsBar && !mbBar) return; // tabs not initialized yet (initial load)

    Object.keys(_trafficShareBuilt).forEach(function(k) { _trafficShareBuilt[k] = false; });
    Object.keys(_mediaBuyBuilt).forEach(function(k) { _mediaBuyBuilt[k] = false; });

    ['data-ts-pane', 'data-mb-pane'].forEach(function(attr) {
      document.querySelectorAll('[' + attr + ']').forEach(function(p) {
        p.querySelectorAll('[_echarts_instance_]').forEach(function(el) {
          var inst = (typeof echarts !== 'undefined') && echarts.getInstanceByDom ? echarts.getInstanceByDom(el) : null;
          if (inst) inst.dispose();
        });
      });
    });

    [tsBar, mbBar].forEach(function(bar) {
      if (!bar) return;
      var active = bar.querySelector('.perf-tab.active');
      if (active) active.click();
    });
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
        <input type="search" class="creative-ranked__filter p-inputtext" id="creative-filter" placeholder="Find creative campaign" aria-label="Find creative campaign">
        <span class="creative-ranked__total" id="creative-total">${sorted.length} creative campaign${sorted.length === 1 ? '' : 's'}</span>
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
          <div class="stat-strip__context">
            <span class="stat-strip__context-line"><strong>${s.stores_outperforming} of ${s.stores_total}</strong> stores outperforming</span>
            <span class="stat-strip__context-line">${gapText}</span>
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

    // Build store → its 5 brand competitors (UX-846 D2). competitorStores now
    // carries exactly 5 per store (one per canonical brand), bound via threatens[].
    // Filter by threatens, sort by share desc — one distinct competitor entity each.
    var storeCompMap = {};
    var storeEntityById = {};
    var allComps = D.competitorStores;
    D.entities.stores.forEach(function(store) {
      storeEntityById[store.id] = store;
      storeCompMap[store.id] = allComps
        .filter(function(cs) { return cs.threatens.indexOf(store.id) !== -1; })
        .sort(function(a, b) { return (b.wk2_share || 0) - (a.wk2_share || 0); });
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
      var ent = storeEntityById[storeId];
      var storeLabel = (ent && ent.name)
        ? '#' + (ent.storeNumber != null ? ent.storeNumber : s.store_id) + ' ' + ent.name
        : 'Store #' + s.store_id;

      html += '<div class="lb-row lb-row--parent' + (hasChildren ? '' : ' lb-row--leaf') + '" data-store-id="' + storeId + '">' +
        '<span class="lb-col lb-col--expand">' +
          (hasChildren
            ? '<button class="lb-expand-btn" aria-expanded="false" title="Show competitors"><span class="material-symbols-outlined">chevron_right</span></button>'
            : '') +
        '</span>' +
        '<span class="lb-col lb-col--store">' +
          '<span class="lb-rank">' + (i + 1) + '</span>' +
          storeLabel +
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

    // #5 (Adam Jun-16): brand-store MARKER click → same effect as a table row
    // click (proximity rings + radius-key legend + row highlight). Previously the
    // marker callback was never registered, so markers showed no rings.
    if (StoreMap.onStoreClick) {
      StoreMap.onStoreClick(function (storeId) {
        StoreMap.highlightStore(storeId);
        var legend = document.getElementById('ring-legend-store');
        if (legend) legend.style.display = 'flex';
        var table = document.getElementById('leaderboard-table-store');
        if (table) {
          table.querySelectorAll('.lb-row--selected').forEach(function (r) { r.classList.remove('lb-row--selected'); });
          var row = table.querySelector('.lb-row--parent[data-store-id="' + storeId + '"]');
          if (row) { row.classList.add('lb-row--selected'); row.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
        }
      });
    }

    // Competitor diamond pips use StoreMap's default brand→color map, which
    // matches the leaderboard's LEADERBOARD_BRAND_COLORS exactly — so a diamond's
    // pip color equals its expanded-row pip. (Previously setCompetitorRanking()
    // reassigned colors by crossover rank, breaking that table↔map parity.)
    var competitorStores = D.competitorStores;
    var storeIds = stores.map(function(s) { return s.id; });
    StoreMap.renderCompetitors(competitorStores, storeIds);
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
      // Competitor child row → zoom to its diamond marker AND draw the parent
      // store's proximity rings, so it's clear which store this is a competitor of.
      var childRow = e.target.closest('.lb-row--child');
      if (childRow && childRow.dataset.compId) {
        table.querySelectorAll('.lb-row--selected').forEach(function(r) { r.classList.remove('lb-row--selected'); });
        childRow.classList.add('lb-row--selected');
        var parentStoreId = childRow.dataset.parentStoreId;
        if (typeof StoreMap !== 'undefined') {
          if (parentStoreId && StoreMap.showParentAndCompetitor) {
            StoreMap.showParentAndCompetitor(parentStoreId, childRow.dataset.compId);
            var clegend = document.getElementById('ring-legend-store');
            if (clegend) clegend.style.display = 'flex'; // rings now visible at parent
          } else {
            StoreMap.highlightCompetitor(childRow.dataset.compId);
          }
        }
        return;
      }
      var parentRow = e.target.closest('.lb-row--parent');
      if (!parentRow || !parentRow.dataset.storeId) return;
      table.querySelectorAll('.lb-row--selected').forEach(function(r) { r.classList.remove('lb-row--selected'); });
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
    initTrafficCombinedChart(_crossoverTrendWeekCount);
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
    // Honor the active duration preset (default 8 Week) instead of plotting the
    // full 52-week year. Delegates to updateCrossoverTrendPeriod so the init and
    // preset-click paths share one render — matches the canonical Time Trend
    // duration-preset contract in the Engagement shell.
    updateCrossoverTrendPeriod(_crossoverTrendWeekCount);
  }

  // Crossover Trend metric mode: 'share' (% per competitor) or 'volume' (visit counts Our Brand vs Competitors).
  // Replaces removed Traffic Volume tab (Bill 2026-05-03 — kill cognitive overload of separate tab).
  var _crossoverTrendMetric = 'share';
  var _crossoverTrendWeekCount = 8; // default = 8 Week preset (matches duration-preset--active in markup)
  // by-Competitor pane state (P8 parity, Max Jun-16) — mirrors Observed Visits comp controls.
  var _crossoverPeriodWeekCount = 8; // by-Competitor duration (own preset row)
  var _crossoverCohort = 'all';      // N/R/L cohort lens (all|new|returning|loyal)
  var _crossoverMetric = 'share';    // Share % (100% area) vs Visits (absolute)

  // Time Trend duration map: keyed by the strip's own data-period values
  // (4w/8w/13w) plus the by-Competitor strip's legacy keys (1w/1m/1q) for
  // safety. Returns the number of trailing weeks to slice.
  var CROSSOVER_TREND_WEEKS = { '1w': 1, '4w': 4, '8w': 8, '13w': 13, '1m': 4, '1q': 13, '1y': 52 };

  function initCrossoverTrendPresets() {
    var container = document.getElementById('crossover-trend-presets');
    if (container) {
      var presets = container.querySelectorAll('.duration-preset');
      presets.forEach(function(btn) {
        btn.addEventListener('click', function() {
          presets.forEach(function(b) {
            b.classList.remove('active', 'duration-preset--active');
            b.setAttribute('aria-selected', 'false');
          });
          btn.classList.add('duration-preset--active');
          btn.setAttribute('aria-selected', 'true');
          _crossoverTrendWeekCount = CROSSOVER_TREND_WEEKS[btn.dataset.period] || 13;
          updateCrossoverTrendPeriod(_crossoverTrendWeekCount);
          initTrafficCombinedChart(_crossoverTrendWeekCount); // bar chart shares the duration
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

    // Cap to top-5 competitors by average share over the visible window (window-aware,
    // matches the composition chart). Keeps the overlap chart readable as the set changes.
    var ovTop = D.competitiveCrossover.slice().sort(function (a, b) {
      function avg(c) { var t = (c.trend || []).slice(sliceStart); return t.length ? t.reduce(function (s, v) { return s + v; }, 0) / t.length : (c.crossover_pct || 0); }
      return avg(b) - avg(a);
    }).slice(0, 5);

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

    // Color-by-name for tooltip ring markers (white node itemStyle makes p.color white).
    var ovColorByName = {};
    ovTop.forEach(function(c, i) { ovColorByName[c.competitor_name] = colors[i]; });

    chart.setOption({
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(17,24,39,0.96)',
        borderColor: 'rgba(255,255,255,0.12)',
        textStyle: { color: '#fff', fontSize: 12 },
        formatter: function(params) { return darkAxisTooltip(params, function(v) { return v.toFixed(1) + '%'; }, function(p) { return ovColorByName[p.seriesName] || p.color; }); }
      },
      legend: {
        // Explicit per-item color — white node itemStyle would make icon:'circle' legend dots white.
        data: ovTop.map(function(c, i) { return { name: c.competitor_name, itemStyle: { color: colors[i] } }; }),
        bottom: 0, icon: 'circle', itemWidth: 8, itemHeight: 8, itemGap: 20,
        textStyle: { fontSize: 12, color: '#6b7280' }
      },
      grid: { left: 50, right: 20, top: 20, bottom: 50 },
      xAxis: { type: 'category', data: slicedWeeks, axisLabel: { fontSize: 11 } },
      yAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
      series: ovTop.map(function(comp, i) {
        return {
          name: comp.competitor_name,
          type: 'line',
          data: comp.trend.slice(sliceStart),
          smooth: true,
          lineStyle: { color: colors[i], width: 2 },
          // Canonical node: white fill + colored ring (pops over the fill).
          itemStyle: { color: '#fff', borderColor: colors[i], borderWidth: 2 },
          // Canonical line-chart style: nodes + gradient bottom fill (color→transparent).
          // Overlapping translucent bands composite into blended color (alpha compositing).
          areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: echarts.color.modifyAlpha(colors[i], 0.30) },
            { offset: 1, color: echarts.color.modifyAlpha(colors[i], 0) }
          ]) },
          symbol: 'circle', symbolSize: 7
        };
      })
    });
  }

  // weekCount: trailing weeks to show, driven by the Time Trend duration presets
  // (default 8). Omit/falsy = full series. Shares the slice contract with the
  // crossover line chart so both charts in the trend pane move together.
  function initTrafficCombinedChart(weekCount) {
    const el = document.getElementById('chart-traffic-combined');
    if (!el) return;
    if (charts.trafficCombined) { charts.trafficCombined.dispose(); charts.trafficCombined = null; }
    const chart = echarts.init(el);
    charts.trafficCombined = chart;

    const fullTrend = D.trafficShareMetrics.trend;
    const trend = weekCount ? fullTrend.slice(Math.max(0, fullTrend.length - weekCount)) : fullTrend;
    const weeks = trend.map(w => D.getWeekLabel(w.week));
    const shareChange = D.trafficShareMetrics.summary.share_change_pp;
    const entityName = getEntityLabel();
    const lastIdx = trend.length - 1;

    // UX-846 #7 (Adam Jun-16): 100% stacked AREA, two modes via the Share%/
    // Visits toggle. Share = retailer_share/comp_share (already sum to 100);
    // Visits = absolute stacked so total height grows/shrinks. Canonical area
    // style (UI-PATTERNS §4b.1): white-ring nodes + solid 0.9 fill.
    var tcView = _trafficChartView;                 // 'share' | 'volume'
    var tcSuffix = tcView === 'share' ? '%' : '';
    var tcColors = {};
    tcColors[entityName] = ChartColors.green;       // our stores
    tcColors['Competitors'] = ChartColors.gray;
    function tcArea(name, data, color) {
      return {
        name: name, type: 'line', stack: 'ts', smooth: false,
        symbol: 'circle', symbolSize: 7,
        data: data,
        areaStyle: { color: color, opacity: 0.9 },
        lineStyle: { color: color, width: 2 },
        // White-fill colored-ring node; white itemStyle.color requires the
        // tooltip marker to be re-colored by hand (below) — the 3-way trap.
        itemStyle: { color: '#fff', borderColor: color, borderWidth: 2 },
        markArea: name === entityName ? { silent: true, data: markAreaData } : undefined
      };
    }

    // Current week highlight background
    const markAreaData = lastIdx >= 0 ? [[
      { xAxis: weeks[lastIdx], itemStyle: { color: 'rgba(59, 130, 246, 0.06)' } },
      { xAxis: weeks[lastIdx] }
    ]] : [];

    chart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        // Dark hover overlay — matches the sibling crossover-trend chart in this
        // pane + the canonical analytics dark-tooltip pattern (D3 audit fix).
        backgroundColor: 'rgba(17,24,39,0.96)',
        borderColor: 'rgba(255,255,255,0.12)',
        textStyle: { color: '#fff', fontSize: 12 },
        formatter: function(params) {
          // Header = active metric selection + week (canonical toggle-tooltip pattern, UI-PATTERNS §4b.2).
          var metricLabel = tcView === 'share' ? 'Share %' : 'Visits';
          var wk = String(params[0].axisValue || '').replace(/^Wk\b/i, 'Week');
          var isCurrent = lastIdx >= 0 && params[0].dataIndex === lastIdx;
          let html = '<div style="font-weight:700; font-size:12px; letter-spacing:0.04em; text-transform:uppercase; margin-bottom:4px; color:#fff;">'
            + metricLabel + ' | ' + wk
            + (isCurrent ? ' <span style="color:#93c5fd; font-size:11px; text-transform:none; letter-spacing:0;">(current)</span>' : '')
            + '</div>';
          params.forEach(function(p) {
            var c = tcColors[p.seriesName] || p.color;
            html += '<span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#fff;border:2px solid ' + c + ';box-sizing:border-box;margin-right:6px;"></span>'
                 + p.seriesName + ': ' + p.value.toLocaleString() + tcSuffix + '<br>';
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
      yAxis: {
        type: 'value',
        name: tcView === 'share' ? 'Share' : 'Visits',
        max: tcView === 'share' ? 100 : null,
        nameTextStyle: { fontSize: 10, color: '#9ca3af' },
        axisLabel: {
          formatter: function(val) {
            return tcView === 'share' ? val + '%' : (val / 1000).toFixed(0) + 'K';
          }
        }
      },
      series: [
        tcArea(entityName, trend.map(function(w) { return tcView === 'share' ? w.retailer_share : w.retailer_visits; }), ChartColors.green),
        tcArea('Competitors', trend.map(function(w) { return tcView === 'share' ? w.comp_share : w.comp_visits; }), ChartColors.gray)
      ]
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

  // UX-846 #7 (Adam Jun-16): rebuild the combined chart for the active
  // Share%/Visits mode. (Was a no-op TT1 stub after the dual-axis kill;
  // now the chart is a two-mode 100% stacked area that this toggle drives.)
  function updateTrafficCombinedChart() { initTrafficCombinedChart(_crossoverTrendWeekCount); }

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

  // Listen for data refresh events from modals.
  // Full-dashboard only: standalone pages (data-dist-page) have their own per-section refresh in bindPageEvents;
  // and renderAll needs cacheElements() to have populated its refs (elements.spotlightCards is undefined/null otherwise).
  document.addEventListener('distribution:dataRefresh', function() {
    if (document.body.dataset.distPage || !elements.spotlightCards) return;
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
                  ${cr.target_url ? `<a class="creative-card__link" href="${escapeHtml(cr.target_url)}" target="_blank" rel="noopener"><span class="material-symbols-outlined" style="font-size:14px;">link</span> Target Circular Promotion Link</a>` : ''}
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
        renderVisitationKpis();
        if (_trendViewInitialized) { initFrequencyChart(); initCrossoverTrendChart(); }
      } else if (section === 'traffic') {
        renderTrafficKpis();
        initTrafficCombinedChart(_crossoverTrendWeekCount); initCrossoverChart(); renderCrossoverDetail();
      }
      updateRetailerLabels();
      initContext();
    });
  }

  // UX-846 D2: expose map fns for the Traffic Share ep-sub-tabs inline driver.
  // The Map pane lazy-inits Leaflet on first show (renderMap needs a visible,
  // sized container) and invalidates size on return.
  window.DistributionTraffic = {
    renderMap: function (containerId) { renderMap(containerId || 'store-map'); },
    invalidateMap: function () {
      if (typeof StoreMap !== 'undefined' && StoreMap.invalidateSize) StoreMap.invalidateSize();
    },
    // UX-846 D2: By Store combined pane (direct lift of the pre-strip store pane) —
    // leaderboard left + Leaflet map right. Row click → highlightStore + rings;
    // expand row → competitors in range. Locked to Our Stores.
    buildStorePane: function () {
      renderMap('store-map-store-pane');
      // Show competitor diamonds alongside our stores (renderMap renders them hidden).
      if (typeof StoreMap !== 'undefined' && StoreMap.toggleCompetitors) StoreMap.toggleCompetitors(true);
      renderLeaderboardInto(document.getElementById('leaderboard-table-store'), 'ours');
      bindStoreTabInteractions();
    }
  };

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
      } else if (section === 'visitation') {
        renderVisitationKpis();
        initDurationPresets();
      } else if (section === 'traffic') {
        renderTrafficKpis();
        initTrafficCombinedChart(_crossoverTrendWeekCount); // default 8 Week, matches active preset
        initCrossoverChart();
        renderCrossoverDetail();
        initTrafficChartToggle();
        initLeaderboardViewToggle();
        initCrossoverPeriodPresets();
        initCrossoverCohort();
        initCrossoverMetric();
        updateCrossoverChartPeriod(8); // default 8 Week (matches the standardized preset row)
        initCrossoverTrendChart(); // renders at the default 8 Week preset
        initCrossoverTrendPresets();
      }

      console.log('Distribution page initialized:', section);
    } catch (error) {
      console.error('Failed to initialize distribution page:', error);
    }
  };

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
        presets.forEach(function(b) { b.classList.remove('active', 'duration-preset--active'); });
        btn.classList.add('duration-preset--active');
        var period = btn.dataset.period;
        // P8 (Max Jun-16): standardized to 4/8/13/Year, matching every other trend row.
        var weekCount = period === '4w' ? 4 : period === '8w' ? 8 : period === '13w' ? 13 : 52;
        updateCrossoverChartPeriod(weekCount);
      });
    });
  }

  // by-Competitor cohort lens (All/New/Returning/Loyal) — mirrors Observed Visits initCompCohort.
  function initCrossoverCohort() {
    var btns = document.querySelectorAll('#crossover-cohort .view-toggle__btn');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { var on = b === btn; b.classList.toggle('active', on); b.setAttribute('aria-selected', String(on)); });
        _crossoverCohort = btn.dataset.xoverCohort;
        updateCrossoverChartPeriod(_crossoverPeriodWeekCount);
      });
    });
  }

  // by-Competitor Share%/Visits toggle — mirrors Observed Visits initCompMetric.
  function initCrossoverMetric() {
    var btns = document.querySelectorAll('#crossover-metric .view-toggle__btn');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { var on = b === btn; b.classList.toggle('active', on); b.setAttribute('aria-selected', String(on)); });
        _crossoverMetric = btn.dataset.xoverMetric;
        updateCrossoverChartPeriod(_crossoverPeriodWeekCount);
      });
    });
  }

  function updateCrossoverChartPeriod(weekCount) {
    weekCount = weekCount || _crossoverPeriodWeekCount;
    _crossoverPeriodWeekCount = weekCount;
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
    // Window-aware ranking: rank by average share over the visible window, so the
    // top-N set (and what falls into "All Other") changes as the period toggles.
    function windowAvg(c) {
      var t = (c.trend || []).slice(sliceStart);
      if (!t.length) return c.crossover_pct || 0;
      return t.reduce(function (s, v) { return s + v; }, 0) / t.length;
    }
    allComps.sort(function (a, b) { return windowAvg(b) - windowAvg(a); });

    var top5 = allComps.slice(0, 5);
    var rest = allComps.slice(5);
    // Plan item 9 (Apr 17): top-N competitor palette — muted/warm aesthetic
// confirmed by Bill. Extend here if data has >5 top competitors.
// [0-4] = top 5 competitor colors, [5] = all-other gray, [6] = our brand blue.
var CROSSOVER_COLORS = ['#E07850', '#A8BF6E', '#2AADDB', '#D4A574', '#9B7FD4', '#9ca3af', '#4272D8'];

    // Use stacked area for longer periods (13w), bar for shorter
    var useArea = weekCount > 4;
    var chartType = useArea ? 'line' : 'bar';

    // ── P8 parity (Max Jun-16): cohort lens + Share%/Visits, mirroring Observed
    //    Visits by-Competitor (distribution-visitation.html buildCompOptions). ──
    // Cohort fraction from per-competitor N/R/L crossover buckets (zero_prev=New,
    // one_three=Returning, four_plus=Loyal); constant multiplier across the window,
    // same approximation as the Observed Visits freqMix.
    function cohortFrac(c) {
      if (_crossoverCohort === 'all') return 1;
      var z = c.crossover_visits_zero_prev || 0, o = c.crossover_visits_one_three || 0, f = c.crossover_visits_four_plus || 0;
      var tot = z + o + f;
      if (!tot) return 1;
      var v = _crossoverCohort === 'new' ? z : _crossoverCohort === 'returning' ? o : f;
      return v / tot;
    }
    var asVisits = _crossoverMetric === 'visits';
    var visitsTrend = (D.trafficShareMetrics && D.trafficShareMetrics.trend) || [];
    function retailVisitsAt(idx) { var t = visitsTrend[idx]; return t ? (t.retailer_visits || 0) : 0; }
    // Cohort-scaled raw shares per visible week (competitors + All Other).
    var top5Scaled = top5.map(function (c) {
      var k = cohortFrac(c);
      return slicedWeeks.map(function (_, wi) { return (c.trend[sliceStart + wi] || 0) * k; });
    });
    var restScaled = slicedWeeks.map(function (_, wi) {
      var s = 0; rest.forEach(function (c) { s += (c.trend[sliceStart + wi] || 0) * cohortFrac(c); }); return s;
    });
    // Our Brand Only = original exclusivity (cohort-neutral); renormalization lets it
    // grow when competitors shrink under a cohort filter (Loyal = more exclusive).
    var ourBrandRaw = slicedWeeks.map(function (_, wi) {
      var idx = sliceStart + wi, s = 0;
      top5.forEach(function (c) { s += (c.trend[idx] || 0); });
      rest.forEach(function (c) { s += (c.trend[idx] || 0); });
      return Math.max(0, 100 - s);
    });
    // Renormalize each week column to 100 (cohort scaling breaks the native sum).
    var colSum = slicedWeeks.map(function (_, wi) {
      var s = ourBrandRaw[wi] + restScaled[wi];
      top5Scaled.forEach(function (arr) { s += arr[wi]; });
      return s || 1;
    });
    // Share% mode = normalized %, Visits mode = % × that week's retailer visits.
    function toVal(rawArr) {
      return rawArr.map(function (v, wi) {
        var share = +(v / colSum[wi] * 100).toFixed(1);
        return asVisits ? Math.round(retailVisitsAt(sliceStart + wi) * share / 100) : share;
      });
    }
    var top5Data = top5Scaled.map(toVal);
    var ourBrandData = toVal(ourBrandRaw);
    var allOtherData = toVal(restScaled);

    var stackLabel = useArea ? { show: false } : {
      show: true, position: 'inside', fontSize: 10, color: '#fff', fontWeight: 'bold',
      formatter: function (p) { return (!asVisits && p.value >= 6) ? p.value.toFixed(1) + '%' : ''; }
    };

    var namedSeries = top5.map(function (comp, i) {
      var s = {
        name: comp.competitor_name,
        type: chartType,
        stack: 'crossover',
        itemStyle: { color: CROSSOVER_COLORS[i] },
        label: stackLabel,
        emphasis: { focus: 'series' },
        data: top5Data[i]
      };
      if (useArea) {
        // Store/competitor composition — solid 0.9 fill + white nodes (canonical).
        s.areaStyle = { color: CROSSOVER_COLORS[i], opacity: 0.9 };
        s.lineStyle = { color: CROSSOVER_COLORS[i], width: 2 };
        s.symbol = 'circle';
        s.symbolSize = 7;
        s.smooth = true;
        s.itemStyle = { color: '#fff', borderColor: CROSSOVER_COLORS[i], borderWidth: 2 };
      } else {
        s.barWidth = '60%';
      }
      return s;
    });

    // Our Brand Only
    var ourBrandSeries = {
      name: 'Our Brand Only',
      type: chartType,
      stack: 'crossover',
      itemStyle: { color: CROSSOVER_COLORS[6] },
      label: stackLabel,
      emphasis: { focus: 'series' },
      data: ourBrandData
    };
    if (useArea) {
      ourBrandSeries.areaStyle = { color: CROSSOVER_COLORS[6], opacity: 0.9 };
      ourBrandSeries.lineStyle = { color: CROSSOVER_COLORS[6], width: 2 };
      ourBrandSeries.symbol = 'circle';
      ourBrandSeries.symbolSize = 7;
      ourBrandSeries.smooth = true;
      ourBrandSeries.itemStyle = { color: '#fff', borderColor: CROSSOVER_COLORS[6], borderWidth: 2 };
    } else {
      ourBrandSeries.barWidth = '60%';
    }
    namedSeries.push(ourBrandSeries);

    if (rest.length > 0) {
      var allOtherSeries = {
        name: 'All Other',
        type: chartType,
        stack: 'crossover',
        itemStyle: { color: CROSSOVER_COLORS[5] },
        label: stackLabel,
        emphasis: { focus: 'series' },
        data: allOtherData
      };
      if (useArea) {
        allOtherSeries.areaStyle = { color: CROSSOVER_COLORS[5], opacity: 0.9 };
        allOtherSeries.lineStyle = { color: CROSSOVER_COLORS[5], width: 2 };
        allOtherSeries.symbol = 'circle';
        allOtherSeries.symbolSize = 7;
        allOtherSeries.smooth = true;
        allOtherSeries.itemStyle = { color: '#fff', borderColor: CROSSOVER_COLORS[5], borderWidth: 2 };
      } else {
        allOtherSeries.barWidth = '60%';
      }
      namedSeries.push(allOtherSeries);
    }

    var legendNames = ['Our Brand Only'].concat(top5.map(function (c) { return c.competitor_name; }));
    if (rest.length > 0) legendNames.push('All Other');

    // Color-by-name for tooltip markers (white node itemStyle would make p.marker white).
    var crossColorByName = {};
    top5.forEach(function (c, i) { crossColorByName[c.competitor_name] = CROSSOVER_COLORS[i]; });
    crossColorByName['Our Brand Only'] = CROSSOVER_COLORS[6];
    crossColorByName['All Other'] = CROSSOVER_COLORS[5];

    // Full replace to switch between bar/area chart types cleanly
    chart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: useArea ? 'line' : 'shadow' },
        backgroundColor: '#1f2937',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        padding: [10, 12],
        textStyle: { color: '#fff', fontFamily: 'inherit', fontSize: 12 },
        formatter: function (params) {
          // Canonical toggle-state header (UI-PATTERNS §4b.2): name the active
          // metric + cohort so a hovered value isn't ambiguous against the toggles.
          var cohortLabel = { all: 'All shoppers', new: 'New shoppers', returning: 'Returning shoppers', loyal: 'Loyal shoppers' };
          var cohortColor = (_crossoverCohort && _crossoverCohort !== 'all') ? '#93c5fd' : 'rgba(255,255,255,0.55)';
          var metricLabel = asVisits ? 'Visits' : 'Share %';
          var html = '<div style="font-weight:700;font-size:12px;letter-spacing:0.04em;text-transform:uppercase;margin-bottom:2px;color:#fff;">' + metricLabel + ' | ' + params[0].axisValue.replace('\n', ' ') + '</div>' +
            '<div style="font-size:11px;font-weight:500;color:' + cohortColor + ';margin-bottom:6px;">' + (cohortLabel[_crossoverCohort] || 'All shoppers') + '</div>';
          params.forEach(function (p) {
            var c = crossColorByName[p.seriesName] || p.color;
            var dot = '<span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#fff;border:2px solid ' + c + ';box-sizing:border-box;vertical-align:middle;margin-right:6px;"></span>';
            var val = asVisits ? Math.round(p.value).toLocaleString() : p.value.toFixed(1) + '%';
            html += '<div style="display:flex;align-items:center;gap:10px;min-width:220px;margin-top:2px;">' +
              '<span>' + dot + '<span style="color:rgba(255,255,255,0.9);">' + p.seriesName + '</span></span>' +
              '<span style="flex:1;"></span>' +
              '<span style="font-weight:600;font-variant-numeric:tabular-nums;color:#fff;">' + val + '</span></div>';
          });
          return html;
        }
      },
      legend: {
        bottom: 0, icon: 'circle', itemWidth: 8, itemHeight: 8, itemGap: 20,
        textStyle: { fontSize: 12, color: '#6b7280' },
        // Explicit per-item color — white node itemStyle would make icon:'circle' legend dots white.
        data: legendNames.map(function (n) { return { name: n, itemStyle: { color: crossColorByName[n] } }; })
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
        max: asVisits ? null : 100,
        axisLabel: {
          formatter: asVisits ? function (v) { return v >= 1000 ? (v / 1000) + 'k' : v; } : '{value}%',
          fontSize: 11, color: '#6b7280'
        },
        splitLine: { lineStyle: { color: '#f3f4f6' } }
      },
      series: namedSeries
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
  // colorFn(p) optional: when the series uses white-fill nodes (itemStyle.color='#fff'),
  // p.color is white — pass a resolver to render the canonical white/colored-ring marker.
  function darkAxisTooltip(params, valueFmt, colorFn) {
    if (!params || !params.length) return '';
    var label = params[0].axisValueLabel || params[0].name;
    var hint = bucketDateHint(label);
    var header = hint
      ? '<div style="font-size:13px;font-weight:600;color:#fff;margin-bottom:2px;">' + label + '</div>'
        + '<div style="font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:7px;padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,0.18);">' + hint + '</div>'
      : '<div style="font-size:13px;font-weight:600;color:#fff;margin-bottom:7px;padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,0.18);">' + label + '</div>';
    var rows = params.map(function(p) {
      var dot = colorFn
        ? '<span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#fff;border:2px solid ' + colorFn(p) + ';box-sizing:border-box;margin-right:6px;vertical-align:middle;"></span>'
        : '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + p.color + ';margin-right:6px;vertical-align:middle;"></span>';
      return '<div style="display:flex;justify-content:space-between;gap:14px;padding:2px 0;">'
        + '<span>' + dot
        + '<span style="color:rgba(255,255,255,0.85);">' + p.seriesName + '</span></span>'
        + '<span style="font-weight:600;color:#fff;">' + valueFmt(p.value) + '</span>'
        + '</div>';
    });
    return header + rows.join('');
  }

  // ── /Shared dark tooltip helpers ───────────────────────────────────────────


})();
