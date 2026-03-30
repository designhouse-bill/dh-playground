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
    renderMap();
    renderLeaderboard('change');
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
    const el = document.getElementById('media-hero');
    if (!el) return;

    const metrics = D.mediaBuyMetrics;
    const m = metrics.summary;
    if (!m) return;

    // Calculate trends from weekly data
    const trend = metrics.weeklyTrend;
    let cpvTrendCallout = '';
    let cpvTrendClass = 'media-hero__trend-callout--flat';
    let imprTrend = null, clickTrend = null, ctrTrend = null, vptTrend = null;

    if (trend.length >= 2) {
      const first = trend[0];
      const last = trend[trend.length - 1];
      const ctx_label = 'vs. Wk ' + first.week.replace('wk', '');

      // CPV trend callout — use summary value for consistency with hero CPV
      const cpvChange = ((m.cost_per_visit - first.cost_per_visit) / first.cost_per_visit * 100);
      if (cpvChange < -2) {
        cpvTrendCallout = `<span class="material-symbols-outlined">arrow_downward</span> CPV down ${Math.abs(cpvChange).toFixed(0)}% over campaign — $${first.cost_per_visit.toFixed(2)} → $${m.cost_per_visit.toFixed(2)}`;
        cpvTrendClass = 'media-hero__trend-callout--good';
      } else if (cpvChange > 2) {
        cpvTrendCallout = `<span class="material-symbols-outlined">arrow_upward</span> CPV up ${cpvChange.toFixed(0)}% over campaign — $${first.cost_per_visit.toFixed(2)} → $${m.cost_per_visit.toFixed(2)}`;
        cpvTrendClass = 'media-hero__trend-callout--bad';
      } else {
        cpvTrendCallout = `<span class="material-symbols-outlined">arrow_forward</span> CPV stable at $${m.cost_per_visit.toFixed(2)} — consistent delivery`;
        cpvTrendClass = 'media-hero__trend-callout--flat';
      }

      const pctDelta = (a, b) => b > 0 ? ((a - b) / b) * 100 : 0;
      imprTrend = { value: pctDelta(last.impressions, first.impressions), label: (pctDelta(last.impressions, first.impressions) >= 0 ? '+' : '') + pctDelta(last.impressions, first.impressions).toFixed(1) + '%', context: ctx_label };
      clickTrend = { value: pctDelta(last.clicks, first.clicks), label: (pctDelta(last.clicks, first.clicks) >= 0 ? '+' : '') + pctDelta(last.clicks, first.clicks).toFixed(1) + '%', context: ctx_label };
      const ctrDelta = last.ctr - first.ctr;
      ctrTrend = { value: ctrDelta, label: (ctrDelta >= 0 ? '+' : '') + ctrDelta.toFixed(2) + ' pp', context: ctx_label };
      const vptDelta = last.visits_per_thousand - first.visits_per_thousand;
      vptTrend = { value: vptDelta, label: (vptDelta >= 0 ? '+' : '') + vptDelta.toFixed(1), context: ctx_label };
    }

    // Context counts for hero cards
    const ctx = D.context;
    const storeCount = D.entities.getStoresForEntity(ctx.entityId, ctx.entityLevel).length;
    const variantCount = D.creativeRecords.filter(cr => cr.metrics !== null).length;

    el.innerHTML = `
      <div class="media-hero__budget">
        <div class="media-hero__metric-summary">
          <div class="media-hero__cpv-group">
            <div class="media-hero__cpv-label">Cost Per Visit</div>
            <div class="media-hero__cpv">${fmtCurrency(m.cost_per_visit)}</div>
          </div>
          <div class="media-hero__total-budget">
            <div class="media-hero__cpv-label">Total Budget</div>
            <div class="media-hero__budget-value">${fmtCurrency(m.budget)}</div>
          </div>
        </div>
        ${cpvTrendCallout ? `<div class="media-hero__trend-callout ${cpvTrendClass}">${cpvTrendCallout}</div>` : ''}
      </div>
      <div class="media-hero__cards">
        ${heroCard('Stores', fmtNumber(storeCount))}
        ${heroCard('Impressions', fmtNumber(m.impressions), imprTrend)}
        ${heroCard('Clicks', fmtNumber(m.clicks), clickTrend)}
        ${heroCard('Variants', fmtNumber(variantCount))}
        ${heroCard('CTR', fmtPct(m.ctr), ctrTrend)}
        ${heroCard('Visits / 1,000', m.visits_per_thousand.toFixed(1), vptTrend)}
      </div>
    `;
  }

  function heroCard(label, value, trendObj) {
    // trendObj: { value: number, label: string, context: string } or falsy
    if (!trendObj) {
      return `
        <div class="media-hero__card">
          <div class="kpi-label">${label}</div>
          <div class="kpi-value">${value}</div>
        </div>
      `;
    }
    const isPositive = trendObj.value >= 0;
    const colorClass = isPositive ? 'kpi-trend--up' : 'kpi-trend--down';
    const icon = isPositive ? 'trending_up' : 'trending_down';
    return `
      <div class="media-hero__card">
        <div class="kpi-label">${label}</div>
        <div class="kpi-value">${value}</div>
        <span class="kpi-trend ${colorClass}">
          <span class="material-symbols-outlined">${icon}</span>
          ${trendObj.label}
        </span>
        ${trendObj.context ? `<span class="kpi-trend-context">${trendObj.context}</span>` : ''}
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

    const isMultiple = records.length >= 2;

    // Sort by visits (best performing first), preserve original index for panel linking
    const sorted = records.map((cr, idx) => ({ ...cr, _origIndex: allRecords.indexOf(cr) })).sort((a, b) => {
      const aVisits = a.metrics ? a.metrics.gross_visits : 0;
      const bVisits = b.metrics ? b.metrics.gross_visits : 0;
      return bVisits - aVisits;
    });

    // Helper: parse name and region from label (e.g. "Holiday Steak — South FL")
    function parseLabel(cr) {
      const full = cr.label || cr.notes || '';
      const parts = full.split(' — ');
      return { name: parts[0] || full, region: parts[1] || '' };
    }

    if (!isMultiple) {
      // Single creative: compact inline bar
      const cr = sorted[0];
      const typeIcon = cr.creative_type === 'video' ? 'movie' : (cr.creative_type === 'gif' ? 'gif_box' : 'image');
      el.className = 'creative-list creative-list--inline';
      el.innerHTML = `
        <div class="creative-card__thumb">
          <span class="material-symbols-outlined">${typeIcon}</span>
        </div>
        <span class="creative-card__name">${cr.label || cr.notes}</span>
        <span class="creative-card__dims">${cr.dimensions || ''}</span>
        <span class="creative-card__meta">${cr.date_range_start} — ${cr.date_range_end} · ${cr.store_group.length} stores</span>
        ${cr.target_url ? `<a class="creative-card__link" href="${cr.target_url}" target="_blank" title="Open target URL"><span class="material-symbols-outlined" style="font-size:16px;">link</span> Promotion Link</a>` : ''}
      `;
    } else {
      // Multiple creatives: PrimeNG-style carousel with nav buttons + indicators
      const numVisible = 3;
      const numScroll = 1;
      const totalItems = sorted.length;
      const totalPages = Math.ceil(Math.max(totalItems - numVisible + 1, 1) / numScroll);

      el.className = 'creative-list';

      const cardsHtml = sorted.map((cr, i) => {
        const typeIcon = cr.creative_type === 'video' ? 'movie' : (cr.creative_type === 'gif' ? 'gif_box' : 'image');
        const { name, region } = parseLabel(cr);

        return `
          <div class="p-carousel-item" data-index="${i}">
            <div class="creative-card" id="creative-card-${i}">
              <div class="creative-card__top">
                <span class="creative-card__rank">${i + 1}</span>
                <div class="creative-card__info">
                  <div class="creative-card__thumb creative-card__thumb--square">
                    <span class="material-symbols-outlined">${typeIcon}</span>
                  </div>
                  <div class="creative-card__info_text">
                    <div class="creative-card__name">${name}</div>
                    <div class="creative-card__region">${region}</div>
                    <div class="creative-card__date">${cr.date_range_start} — ${cr.date_range_end}</div>
                  </div>
                </div>
              </div>
              <div class="creative-card__metrics">
                <div class="creative-metric-tile">
                  <div class="creative-metric-tile__label">Stores</div>
                  <div class="creative-metric-tile__value">${cr.store_group.length}</div>
                </div>
                <div class="creative-metric-tile">
                  <div class="creative-metric-tile__label">CTR</div>
                  <div class="creative-metric-tile__value">${cr.metrics ? fmtPct(cr.metrics.ctr) : '—'}</div>
                </div>
                <div class="creative-metric-tile">
                  <div class="creative-metric-tile__label">Visits</div>
                  <div class="creative-metric-tile__value">${cr.metrics ? fmtNumber(cr.metrics.gross_visits) : '—'}</div>
                </div>
              </div>
              <div class="creative-card__actions">
                ${cr.target_url ? `<a class="creative-card__link" href="${cr.target_url}" target="_blank"><span class="material-symbols-outlined" style="font-size:14px;">link</span> Promotion Link</a>` : ''}
                <button class="creative-card__details-btn" onclick="viewVariantDetails(${cr._origIndex})"><span class="material-symbols-outlined" style="font-size:14px;">visibility</span> View Details</button>
              </div>
            </div>
          </div>
        `;
      }).join('');

      // Indicator dots
      const dotsHtml = Array.from({ length: totalPages }, (_, i) =>
        `<li class="p-carousel-indicator${i === 0 ? ' p-carousel-indicator-active' : ''}"><button class="p-carousel-indicator-button" data-page="${i}" aria-label="Page ${i + 1}"></button></li>`
      ).join('');

      el.innerHTML = `
        <div class="p-carousel p-component">
          <div class="p-carousel-content-container">
            <button class="p-carousel-prev-button" aria-label="Previous" ${totalPages <= 1 ? 'disabled' : ''}>
              <span class="material-symbols-outlined">chevron_left</span>
            </button>
            <div class="p-carousel-viewport">
              <div class="p-carousel-item-list" style="transform: translateX(0%);">
                ${cardsHtml}
              </div>
            </div>
            <button class="p-carousel-next-button" aria-label="Next" ${totalPages <= 1 ? 'disabled' : ''}>
              <span class="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
          <ul class="p-carousel-indicator-list">
            ${dotsHtml}
          </ul>
        </div>
      `;

      // Wire up carousel JS
      initCreativeCarousel(el, totalItems, numVisible, numScroll);
    }
  }

  // ========================================
  // Creative Carousel Controller
  // ========================================

  function initCreativeCarousel(container, totalItems, numVisible, numScroll) {
    let currentPage = 0;
    const maxPage = Math.ceil(Math.max(totalItems - numVisible, 0) / numScroll);
    const itemList = container.querySelector('.p-carousel-item-list');
    const prevBtn = container.querySelector('.p-carousel-prev-button');
    const nextBtn = container.querySelector('.p-carousel-next-button');
    const indicators = container.querySelectorAll('.p-carousel-indicator');

    function goToPage(page) {
      currentPage = Math.max(0, Math.min(page, maxPage));
      const offsetIndex = currentPage * numScroll;
      // Each item is (100% / numVisible) of the viewport, so shift by that unit
      const pct = (offsetIndex / numVisible) * 100;
      itemList.style.transform = `translateX(-${pct}%)`;
      itemList.style.transition = 'transform 300ms ease';

      // Update button states
      prevBtn.disabled = currentPage === 0;
      nextBtn.disabled = currentPage >= maxPage;

      // Update indicators
      indicators.forEach((ind, i) => {
        ind.classList.toggle('p-carousel-indicator-active', i === currentPage);
      });
    }

    prevBtn.addEventListener('click', () => goToPage(currentPage - 1));
    nextBtn.addEventListener('click', () => goToPage(currentPage + 1));

    // Indicator clicks
    indicators.forEach(ind => {
      const btn = ind.querySelector('.p-carousel-indicator-button');
      btn.addEventListener('click', () => {
        goToPage(parseInt(btn.dataset.page, 10));
      });
    });

    // Initial state
    goToPage(0);
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
      tbody.innerHTML = `<tr><td colspan="12" class="dist-tree-empty">No variants or analytics data are found for this store.</td></tr>`;
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
        case 'impressions': aVal = aM.impressions || 0; bVal = bM.impressions || 0;     break;
        case 'clicks': aVal = aM.clicks || 0;          bVal = bM.clicks || 0;          break;
        case 'budget': aVal = aM.budget || 0;          bVal = bM.budget || 0;          break;
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
      ${sortTh('Impr', 'impressions', 'col-impressions')}
      ${sortTh('Clicks', 'clicks', 'col-clicks')}
      ${sortTh('Budget', 'budget', 'col-budget')}
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
        <td class="col-impressions">${m ? fmtNumber(m.impressions) : '—'}</td>
        <td class="col-clicks">${m ? fmtNumber(m.clicks) : '—'}</td>
        <td class="col-budget">${m ? fmtCurrency(m.budget) : '—'}</td>
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
            <td class="col-impressions">${fmtNumber(s.impressions)}</td>
            <td class="col-clicks">${fmtNumber(s.clicks)}</td>
            <td class="col-budget">${fmtCurrency(s.budget)}</td>
            <td class="col-vpt">${s.vpt}</td>
            <td class="col-link">${storeUrl ? `<a href="${storeUrl}" target="_blank" class="dist-tree-link" title="Store #${s.id} landing page" onclick="event.stopPropagation();"><span class="material-symbols-outlined" style="font-size:16px;">open_in_new</span></a>` : ''}</td>
          </tr>`;
        });

        // Video funnel detail row
        if (isVideo) {
          const v = D.videoEngagement;
          const totalCols = 13; // max columns (incl thumb)
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
    const el = elements.visitationHero;
    if (!el) return;

    const vm = D.visitationMetrics;
    const latest = vm.summary;
    if (!latest) return;

    // Budget = CPV × Gross Visits
    const totalBudget = latest.cost_per_visit * latest.gross_visits;

    // Trends from weekly data
    const trend = vm.weeklyTrend;
    let cpvTrendCallout = '';
    let cpvTrendClass = 'media-hero__trend-callout--flat';
    let visitsTrend = null, zeroPrevTrend = null, oneThreeTrend = null, fourPlusTrend = null, vptTrend = null;

    if (trend.length >= 2) {
      const first = trend[0];
      const last = trend[trend.length - 1];
      const ctx_label = 'vs. Wk ' + first.week.replace('wk', '');

      // CPV trend callout — use summary (latest) value for consistency with hero CPV
      const cpvChange = ((latest.cost_per_visit - first.cost_per_visit) / first.cost_per_visit * 100);
      if (cpvChange < -2) {
        cpvTrendCallout = `<span class="material-symbols-outlined">arrow_downward</span> CPV down ${Math.abs(cpvChange).toFixed(0)}% over campaign — $${first.cost_per_visit.toFixed(2)} → $${latest.cost_per_visit.toFixed(2)}`;
        cpvTrendClass = 'media-hero__trend-callout--good';
      } else if (cpvChange > 2) {
        cpvTrendCallout = `<span class="material-symbols-outlined">arrow_upward</span> CPV up ${cpvChange.toFixed(0)}% over campaign — $${first.cost_per_visit.toFixed(2)} → $${latest.cost_per_visit.toFixed(2)}`;
        cpvTrendClass = 'media-hero__trend-callout--bad';
      } else {
        cpvTrendCallout = `<span class="material-symbols-outlined">arrow_forward</span> CPV stable at $${latest.cost_per_visit.toFixed(2)} — consistent delivery`;
        cpvTrendClass = 'media-hero__trend-callout--flat';
      }

      const pctDelta = (a, b) => b > 0 ? ((a - b) / b) * 100 : 0;
      const mkTrend = (val, label) => ({ value: val, label: label, context: ctx_label });
      const signPct = (v) => (v >= 0 ? '+' : '') + v.toFixed(1) + '%';
      const signVal = (v) => (v >= 0 ? '+' : '') + v.toFixed(1);

      const vd = pctDelta(last.gross_visits, first.gross_visits);
      visitsTrend = mkTrend(vd, signPct(vd));
      if (first.visits_zero_prev > 0) { const d = pctDelta(last.visits_zero_prev, first.visits_zero_prev); zeroPrevTrend = mkTrend(d, signPct(d)); }
      if (first.visits_one_three_prev > 0) { const d = pctDelta(last.visits_one_three_prev, first.visits_one_three_prev); oneThreeTrend = mkTrend(d, signPct(d)); }
      if (first.visits_four_plus_prev > 0) { const d = pctDelta(last.visits_four_plus_prev, first.visits_four_plus_prev); fourPlusTrend = mkTrend(d, signPct(d)); }
      if (first.visits_per_thousand > 0) { const d = last.visits_per_thousand - first.visits_per_thousand; vptTrend = mkTrend(d, signVal(d)); }
    }

    el.innerHTML = `
      <div class="media-hero__budget">
        <div class="media-hero__metric-summary">
          <div class="media-hero__cpv-group">
            <div class="media-hero__cpv-label">Cost Per Visit</div>
            <div class="media-hero__cpv">${fmtCurrency(latest.cost_per_visit)}</div>
          </div>
          <div class="media-hero__total-budget">
            <div class="media-hero__cpv-label">Total Budget</div>
            <div class="media-hero__budget-value">${fmtCurrency(totalBudget)}</div>
          </div>
        </div>
        ${cpvTrendCallout ? `<div class="media-hero__trend-callout ${cpvTrendClass}">${cpvTrendCallout}</div>` : ''}
      </div>
      <div class="media-hero__cards">
        ${heroCard('Gross Visits', fmtNumber(latest.gross_visits), visitsTrend)}
        ${heroCard('Zero Previous', fmtNumber(latest.visits_zero_prev), zeroPrevTrend)}
        ${heroCard('1-3 Previous', fmtNumber(latest.visits_one_three_prev), oneThreeTrend)}
        ${heroCard('Visits / 1,000', latest.visits_per_thousand.toFixed(1), vptTrend)}
        ${heroCard('4+ Previous', fmtNumber(latest.visits_four_plus_prev), fourPlusTrend)}
        ${heroCard('New Shoppers', ((latest.visits_zero_prev / latest.gross_visits) * 100).toFixed(1) + '%')}
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

    var brands = Object.values(brandMap).sort(function (a, b) { return b.crossover_pct - a.crossover_pct; });

    // Tree table — same design pattern as media buy
    var html = '<table class="dist-tree-table comp-tree-table">' +
      '<thead><tr>' +
        '<th>Competitor</th>' +
        '<th style="text-align:right;">Crossover %</th>' +
        '<th style="text-align:right;">Visits</th>' +
        '<th style="text-align:right;">Stores Threatened</th>' +
        '<th style="text-align:right;">Trend</th>' +
      '</tr></thead><tbody>';

    brands.forEach(function (brand) {
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

      // Parent row
      html += '<tr class="dist-tree-row--parent" data-brand="' + brandKey + '">' +
        '<td class="tree-indent-0">' +
          '<div class="tree-name-cell">' +
            (hasChildren ? '<span class="tree-toggle"><span class="material-symbols-outlined">expand_more</span></span>' : '<span style="width:20px;display:inline-block;"></span>') +
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
    toggle.querySelectorAll('.view-toggle__btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var view = btn.dataset.view;
        if (view === visitationView) return;
        visitationView = view;

        // Toggle active on buttons
        toggle.querySelectorAll('.view-toggle__btn').forEach(function (b) {
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
        key: 'zero_prev', label: 'New Shoppers', sublabel: 'Zero previous visits (30d)',
        value: s.visits_zero_prev, color: ChartColors.blue, icon: 'person_add',
        cpvField: 'cpv_zero_prev'
      },
      {
        key: 'one_three', label: 'Returning', sublabel: '1–3 previous visits',
        value: s.visits_one_three_prev, color: ChartColors.amber, icon: 'replay',
        cpvField: 'cpv_one_three'
      },
      {
        key: 'four_plus', label: 'Loyal', sublabel: '4+ previous visits',
        value: s.visits_four_plus_prev, color: ChartColors.green, icon: 'loyalty',
        cpvField: 'cpv_four_plus'
      }
    ];

    // Compute per-segment CPV from store-level data
    var ctx = D.context;
    var storeIds = D.entities.getStoresForEntity(ctx.entityId, ctx.entityLevel);
    var latestWeek = ctx.flightWeek === 'all' ? 'wk2' : ctx.flightWeek;

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
          '<span class="segment-card__dot" style="background: ' + seg.color + ';"></span>' +
          '<div class="segment-card__titles">' +
            '<span class="segment-card__label">' + seg.label + '</span>' +
            '<span class="segment-card__sublabel">' + seg.sublabel + '</span>' +
          '</div>' +
          '<span class="segment-card__pct">' + pct + '%</span>' +
        '</div>' +
        '<div class="segment-card__metrics">' +
          '<div class="segment-card__metric">' +
            '<span class="segment-card__metric-value">' + fmtNumber(seg.value) + '</span>' +
            '<span class="segment-card__metric-label">Visits</span>' +
          '</div>' +
          '<div class="segment-card__metric">' +
            '<span class="segment-card__metric-value">$' + avgCpv + '</span>' +
            '<span class="segment-card__metric-label">Avg CPV</span>' +
          '</div>' +
          '<div class="segment-card__metric">' +
            '<span class="segment-card__metric-value ' + trendClass + '">' +
              '<span class="material-symbols-outlined">' + trendIcon + '</span>' +
              (Math.abs(t.delta) >= 0.1 ? (t.delta > 0 ? '+' : '') + t.delta.toFixed(1) + ' pp' : 'Stable') +
            '</span>' +
            '<span class="segment-card__metric-label">WoW Share</span>' +
          '</div>' +
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
    allRows: [],      // cached sorted data
    selectedStoreId: null
  };

  var PERF_GROUP_COLORS = { green: '#10B981', amber: '#F59E0B', red: '#EF4444' };

  function buildStorePerformanceData() {
    var ctx = D.context;
    var storeIds = D.entities.getStoresForEntity(ctx.entityId, ctx.entityLevel);
    var latestWeek = ctx.flightWeek === 'all' ? 'wk2' : ctx.flightWeek;

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
      '<th class="col-status">Status</th>' +
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
        '<td class="col-status"><span class="status-pill status-pill--' + r.group + '">' + (r.group === 'green' ? 'Strong' : r.group === 'red' ? 'Critical' : 'Watch') + '</span></td>' +
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

  // ── Row ↔ Map selection ──────────────────────────────────────────────────

  function selectStore(storeId) {
    // Deselect previous
    var prev = document.querySelector('.store-row--selected');
    if (prev) prev.classList.remove('store-row--selected');

    if (storePerfState.selectedStoreId === storeId) {
      // Toggle off — deselect
      resetMapView();
      return;
    }

    storePerfState.selectedStoreId = storeId;

    // Highlight table row + scroll into view
    var row = document.querySelector('.store-row[data-store-id="' + storeId + '"]');
    if (row) {
      row.classList.add('store-row--selected');
      row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    // Focus map pin
    if (typeof StoreMap !== 'undefined') {
      StoreMap.highlightStore(storeId);
    }

  }

  function resetMapView() {
    storePerfState.selectedStoreId = null;
    var prev = document.querySelector('.store-row--selected');
    if (prev) prev.classList.remove('store-row--selected');
    if (typeof StoreMap !== 'undefined') StoreMap.fitBounds();
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

    // Row click → focus map pin
    var body = document.getElementById('store-perf-body');
    if (body) {
      body.addEventListener('click', function (e) {
        var row = e.target.closest('.store-row');
        if (!row) return;
        selectStore(row.dataset.storeId);
      });
    }

    // Map pin click → highlight table row
    if (typeof StoreMap !== 'undefined') {
      StoreMap.onStoreClick(function (storeId) {
        selectStore(storeId);
      });
    }

    // Reset map button
    var resetBtn = document.getElementById('map-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        resetMapView();
      });
    }
  }

  // ── Visitation Store Map ──────────────────────────────────────────────────

  function renderVisitationMap() {
    if (typeof StoreMap === 'undefined') return;
    var mapEl = document.getElementById('visitation-store-map');
    if (!mapEl) return;

    // Init map on the visitation-specific element
    StoreMap.init('visitation-store-map');

    var ctx = D.context;
    var storeIds = D.entities.getStoresForEntity(ctx.entityId, ctx.entityLevel);
    var latestWeek = ctx.flightWeek === 'all' ? 'wk2' : ctx.flightWeek;
    var stores = D.entities.stores.filter(function (s) { return storeIds.includes(s.id); });
    var storeData = {};

    // Color by new shopper % performance: ≥40% green, 30-40% amber, <30% red
    storeIds.forEach(function (storeId) {
      var records = D.getVisitRecords(latestWeek, [storeId]);
      if (!records.length) return;
      var total = 0, zeroPrev = 0;
      records.forEach(function (r) { total += r.gross_visits; zeroPrev += r.visits_zero_prev; });
      var newPct = total > 0 ? (zeroPrev / total) * 100 : 0;
      var group = newPct >= 40 ? 'green' : newPct >= 30 ? 'amber' : 'red';
      var cpv = records[0].cost_per_visit || 0;

      storeData[storeId] = {
        group: group,
        share: parseFloat(newPct.toFixed(1)),
        change_pp: 0,
        primary_threat: 'CPV: $' + cpv.toFixed(2)
      };
    });

    StoreMap.renderStores(stores, storeData);
    StoreMap.fitBounds();
  }

  // ========================================
  // Section 3: Traffic Share
  // ========================================

  function renderTrafficKpis() {
    const el = elements.trafficHero;
    if (!el) return;

    const s = D.trafficShareMetrics.summary;
    const trend = D.trafficShareMetrics.trend;

    // Trend callout — share direction over campaign
    let trendCallout = '';
    let trendClass = 'media-hero__trend-callout--flat';
    if (trend.length >= 2) {
      const first = trend[0];
      const last = trend[trend.length - 1];
      const shareDelta = last.retailer_share - first.retailer_share;
      if (shareDelta > 0.5) {
        trendCallout = `<span class="material-symbols-outlined">arrow_upward</span> Share up ${shareDelta.toFixed(1)} pp over campaign — ${first.retailer_share}% → ${last.retailer_share}%`;
        trendClass = 'media-hero__trend-callout--good';
      } else if (shareDelta < -0.5) {
        trendCallout = `<span class="material-symbols-outlined">arrow_downward</span> Share down ${Math.abs(shareDelta).toFixed(1)} pp over campaign — ${first.retailer_share}% → ${last.retailer_share}%`;
        trendClass = 'media-hero__trend-callout--bad';
      } else {
        trendCallout = `<span class="material-symbols-outlined">arrow_forward</span> Share stable at ${last.retailer_share}% — holding position`;
        trendClass = 'media-hero__trend-callout--flat';
      }
    }

    // Hero cards with trends
    const outperformPct = s.stores_total > 0 ? Math.round((s.stores_outperforming / s.stores_total) * 100) : 0;

    el.innerHTML = `
      <div class="media-hero__budget">
        <div class="media-hero__metric-summary">
          <div class="media-hero__cpv-group">
            <div class="media-hero__cpv-label">Traffic Share</div>
            <div class="media-hero__cpv">${s.retailer_traffic_share}%</div>
          </div>
          <div class="media-hero__total-budget">
            <div class="media-hero__cpv-label">Share Change</div>
            <div class="media-hero__budget-value">${fmtPp(s.share_change_pp)}</div>
          </div>
        </div>
        ${trendCallout ? `<div class="media-hero__trend-callout ${trendClass}">${trendCallout}</div>` : ''}
      </div>
      <div class="media-hero__cards">
        ${heroCard('Stores', fmtNumber(s.stores_total))}
        ${heroCard('Outperforming', s.stores_outperforming + ' of ' + s.stores_total, { value: s.stores_outperforming > s.stores_total / 2 ? 1 : -1, label: outperformPct + '%', context: '' })}
        ${heroCard('Growth Advantage', (s.growth_advantage >= 0 ? '+' : '') + s.growth_advantage.toFixed(1) + '%', { value: s.growth_advantage, label: s.growth_advantage >= 0 ? 'Ahead' : 'Behind', context: '' })}
        ${heroCard('Retailer Growth', (s.retailer_growth_rate >= 0 ? '+' : '') + s.retailer_growth_rate.toFixed(1) + '%')}
        ${heroCard('Competitor Growth', (s.comp_growth_rate >= 0 ? '+' : '') + s.comp_growth_rate.toFixed(1) + '%')}
        ${heroCard('Concentrated Markets', s.highly_concentrated_count + ' of ' + s.stores_total)}
      </div>
    `;
  }

  let _leaderboardSort = 'change';  // current sort column

  function renderLeaderboard(sortBy) {
    if (sortBy) _leaderboardSort = sortBy;
    let stores = [...D.trafficShareMetrics.storeLeaderboard];
    if (_leaderboardSort === 'share') {
      stores.sort((a, b) => b.wk2_share - a.wk2_share);
    } else {
      stores.sort((a, b) => b.change_pp - a.change_pp);
    }

    const sortIcon = (col) => col === _leaderboardSort
      ? '<span class="material-symbols-outlined lb-sort-icon lb-sort-icon--active">arrow_downward</span>'
      : '<span class="material-symbols-outlined lb-sort-icon lb-sort-icon--inactive">unfold_more</span>';

    elements.leaderboardTable.innerHTML = `
      <div class="lb-header">
        <span class="lb-col lb-col--store">Store</span>
        <span class="lb-col lb-col--city">City</span>
        <span class="lb-col lb-col--share lb-col--sortable${_leaderboardSort === 'share' ? ' lb-col--sorted' : ''}" data-sort="share">Share ${sortIcon('share')}</span>
        <span class="lb-col lb-col--change lb-col--sortable${_leaderboardSort === 'change' ? ' lb-col--sorted' : ''}" data-sort="change">Change ${sortIcon('change')}</span>
        <span class="lb-col lb-col--alert">Status</span>
      </div>
      ${stores.map((s, i) => `
        <div class="lb-row lb-row--${s.group}" data-store-id="store-${s.store_id}">
          <span class="lb-col lb-col--store">
            <span class="lb-rank">${i + 1}</span>
            ${s.store_id}
          </span>
          <span class="lb-col lb-col--city">${s.city}</span>
          <span class="lb-col lb-col--share">${s.wk2_share}%</span>
          <span class="lb-col lb-col--change ${s.change_pp >= 0 ? 'positive' : 'negative'}">${fmtPp(s.change_pp)}</span>
          <span class="lb-col lb-col--alert">
            <span class="status-pill status-pill--${s.group}">${s.group === 'green' ? 'Strong' : s.group === 'red' ? 'Critical' : 'Watch'}</span>
          </span>
        </div>
      `).join('')}
    `;
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
  // Store Map
  // ========================================

  function renderMap() {
    if (typeof StoreMap === 'undefined') return;

    StoreMap.init('store-map');
    const stores = D.entities.stores;
    const storeData = {};

    D.trafficShareMetrics.storeLeaderboard.forEach(s => {
      storeData['store-' + s.store_id] = {
        group: s.group,
        share: s.wk2_share,
        change_pp: s.change_pp,
        primary_threat: s.primary_threat
      };
    });

    StoreMap.renderStores(stores, storeData);
    StoreMap.fitBounds();

    // Load competitor pins (hidden by default)
    var competitorStores = D.competitorStores;
    var storeIds = stores.map(function(s) { return s.id; });
    StoreMap.renderCompetitors(competitorStores, storeIds);
  }

  // ── Traffic: Row ↔ Map selection ─────────────────────────────────────────

  let _trafficSelectedStoreId = null;

  function selectTrafficStore(storeId) {
    // Deselect previous
    var prev = document.querySelector('.lb-row--selected');
    if (prev) prev.classList.remove('lb-row--selected');

    if (_trafficSelectedStoreId === storeId) {
      // Toggle off — show all competitors again
      _trafficSelectedStoreId = null;
      if (typeof StoreMap !== 'undefined') {
        StoreMap.fitBounds();
        // Re-render competitors for all stores
        var competitorStores = D.competitorStores;
        var allStoreIds = D.entities.stores.map(function(s) { return s.id; });
        StoreMap.renderCompetitors(competitorStores, allStoreIds);
      }
      return;
    }

    _trafficSelectedStoreId = storeId;

    // Highlight row + scroll into view
    var row = document.querySelector('.lb-row[data-store-id="' + storeId + '"]');
    if (row) {
      row.classList.add('lb-row--selected');
      row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    // Focus map pin + filter competitors to this store
    if (typeof StoreMap !== 'undefined') {
      StoreMap.highlightStore(storeId);
      var competitorStores = D.competitorStores;
      StoreMap.renderCompetitors(competitorStores, [storeId]);
    }
  }

  function bindTrafficStoreSelection() {
    // Row click → focus map pin
    var table = document.getElementById('leaderboard-table');
    if (table) {
      table.addEventListener('click', function (e) {
        var row = e.target.closest('.lb-row');
        if (!row || !row.dataset.storeId) return;
        selectTrafficStore(row.dataset.storeId);
      });
    }

    // Map pin click → highlight table row
    if (typeof StoreMap !== 'undefined') {
      StoreMap.onStoreClick(function (storeId) {
        selectTrafficStore(storeId);
      });
    }

    // Competitor toggle button
    var compToggle = document.getElementById('comp-toggle-btn');
    if (compToggle) {
      compToggle.addEventListener('click', function () {
        var visible = StoreMap.toggleCompetitors();
        compToggle.classList.toggle('active', visible);
      });
    }

    // Reset map button
    var resetBtn = document.getElementById('traffic-map-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        _trafficSelectedStoreId = null;
        var prev = document.querySelector('.lb-row--selected');
        if (prev) prev.classList.remove('lb-row--selected');
        if (typeof StoreMap !== 'undefined') StoreMap.fitBounds();
      });
    }
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

  function initFrequencyChart() {
    const el = document.getElementById('chart-frequency');
    if (!el) return;
    const chart = echarts.init(el);
    charts.frequency = chart;

    const visitTrend = D.visitationMetrics.weeklyTrend;
    const weeks = visitTrend.map(w => D.getWeekLabel(w.week));

    chart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: function(params) {
          let total = 0;
          params.forEach(p => total += p.value);
          let html = `<strong>${params[0].axisValue}</strong><br>`;
          params.forEach(p => {
            const pct = ((p.value / total) * 100).toFixed(1);
            html += `${p.marker} ${p.seriesName}: ${p.value.toLocaleString()} (${pct}%)<br>`;
          });
          html += `<strong>Total: ${total.toLocaleString()}</strong>`;
          return html;
        }
      },
      grid: { left: 60, right: 20, top: 20, bottom: 40 },
      xAxis: { type: 'category', data: weeks, axisLabel: { fontSize: 11 } },
      yAxis: { type: 'value', axisLabel: { formatter: '{value}' } },
      series: [
        {
          name: 'Zero Previous (30d)',
          type: 'bar',
          stack: 'visits',
          data: visitTrend.map(w => w.visits_zero_prev),
          itemStyle: { color: ChartColors.blue }
        },
        {
          name: '1-3 Previous',
          type: 'bar',
          stack: 'visits',
          data: visitTrend.map(w => w.visits_one_three_prev),
          itemStyle: { color: ChartColors.amber }
        },
        {
          name: '4+ Previous',
          type: 'bar',
          stack: 'visits',
          data: visitTrend.map(w => w.visits_four_plus_prev),
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
    var competitors = [];
    crossover.forEach(function (c) {
      if (!seen[c.competitor_name]) {
        seen[c.competitor_name] = true;
        competitors.push(c);
      }
    });
    competitors.sort(function (a, b) { return b.crossover_pct - a.crossover_pct; });

    var areaColors = ['#E07850', '#A8BF6E', '#2AADDB', '#E85B93', '#9B7FD4'];

    var series = competitors.map(function (comp, i) {
      return {
        name: comp.competitor_name,
        type: 'line',
        stack: 'crossover',
        areaStyle: { opacity: 0.85 },
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 1.5, color: areaColors[i % areaColors.length] },
        itemStyle: { color: areaColors[i % areaColors.length] },
        emphasis: { focus: 'series', areaStyle: { opacity: 1 } },
        data: comp.trend
      };
    });

    chart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross', label: { backgroundColor: '#333' } },
        formatter: function (params) {
          var html = '<strong>' + params[0].axisValue + '</strong>';
          params.forEach(function (p) {
            html += '<br>' + p.marker + ' ' + p.seriesName + ': <strong>' + p.value + '%</strong>';
          });
          return html;
        }
      },
      legend: {
        bottom: 0,
        itemWidth: 14,
        itemHeight: 10,
        textStyle: { fontSize: 12, color: '#4b5563' },
        data: competitors.map(function (c) { return c.competitor_name; })
      },
      grid: { left: 50, right: 24, top: 16, bottom: 60 },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: weeks,
        axisLabel: { fontSize: 11, color: '#6b7280' },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        splitLine: {
          show: true,
          lineStyle: { color: '#d1d5db', type: 'dashed', width: 1 }
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: { formatter: '{value}%', fontSize: 11, color: '#6b7280' },
        splitLine: { lineStyle: { color: '#f3f4f6' } }
      },
      series: series
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
      tooltip: { trigger: 'axis' },
      legend: {
        data: D.competitiveCrossover.map(c => c.competitor_name),
        bottom: 0,
        textStyle: { fontSize: 11 }
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
          // Compute share gap from trend data
          var idx = params[0].dataIndex;
          if (trend[idx]) {
            var gap = trend[idx].retailer_share - trend[idx].comp_share;
            html += '<strong>Gap: ' + (gap > 0 ? '+' : '') + gap.toFixed(1) + ' pp</strong>';
          }
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
          name: 'Share %',
          nameTextStyle: { fontSize: 10, color: '#3B82F6' },
          min: 30,
          max: 70,
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
          name: 'Share %',
          type: 'line',
          yAxisIndex: 1,
          data: trend.map(function(w, i) {
            return {
              value: w.retailer_share,
              symbolSize: i === lastIdx ? 12 : 6
            };
          }),
          smooth: true,
          lineStyle: { color: '#3B82F6', width: 2.5 },
          itemStyle: { color: '#3B82F6' },
          z: 10
        }
      ],
      graphic: [{
        type: 'text',
        left: 'center',
        top: 10,
        style: {
          text: 'Gap ' + (shareChange >= 0 ? 'widening' : 'narrowing') + ': ' + (shareChange >= 0 ? '+' : '') + shareChange.toFixed(1) + ' pp over campaign',
          fill: shareChange >= 0 ? ChartColors.green : '#ef4444',
          fontSize: 12,
          fontWeight: 600
        }
      }]
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
  window.viewVariantDetails = function(variantIndex) {
    // Find the creative_id from the original index
    const records = D.creativeRecords;
    if (variantIndex >= records.length) return;
    const cr = records[variantIndex];
    if (!cr) return;
    const cid = cr.creative_id;

    // Expand the row
    if (!distTreeState.expandedCreatives[cid]) {
      distTreeState.expandedCreatives[cid] = true;
      document.querySelectorAll(`[data-parent="${cid}"]`).forEach(row => {
        row.classList.remove('tree-row-hidden');
      });
      const parentRow = document.querySelector(`[data-creative-id="${cid}"]`);
      if (parentRow) {
        const toggle = parentRow.querySelector('.tree-toggle');
        if (toggle) toggle.classList.remove('collapsed');
      }
    }

    // Scroll into view
    const parentRow = document.querySelector(`[data-creative-id="${cid}"]`);
    if (parentRow) {
      parentRow.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
        renderVisitationKpis(); renderSegmentDetail();
        storePerfState.allRows = []; storePerfState.selectedStoreId = null;
        buildStorePerformanceData(); renderStorePerformanceTable(); renderVisitationMap();
        initVisitDonut();
        if (_trendViewInitialized) { initFrequencyChart(); initCrossoverTrendChart(); }
      } else if (section === 'traffic') {
        renderTrafficKpis(); renderMap(); renderLeaderboard('change');
        initTrafficCombinedChart(); initCrossoverChart(); renderCrossoverDetail();
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
      } else if (section === 'visitation') {
        renderVisitationKpis();
        renderSegmentDetail();
        buildStorePerformanceData();
        renderStorePerformanceTable();
        renderVisitationMap();
        initViewToggle();
        initVisitDonut();
        bindStorePerformanceActions();
        // Frequency + Crossover Trend charts deferred to trend view toggle
      } else if (section === 'traffic') {
        renderTrafficKpis();
        renderMap();
        renderLeaderboard('change');
        initTrafficCombinedChart();
        initCrossoverChart();
        renderCrossoverDetail();
        bindTrafficStoreSelection();
      }

      console.log('Distribution page initialized:', section);
    } catch (error) {
      console.error('Failed to initialize distribution page:', error);
    }
  };

})();
