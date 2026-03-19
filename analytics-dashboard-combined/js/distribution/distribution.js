/**
 * Distribution Tab Feature
 * Renders all 3 sections: Media Buy, Store Visitation, Traffic Share
 */

(function() {
  'use strict';

  const D = DistributionData;
  let elements = {};
  let charts = {};

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

  // Update context bar with Distribution data (header is inlined — no fetch needed)
  function initContext() {
    const rc = D.retailerConfig;
    const storeCount = D.entities.stores.length;

    const dateValue = document.getElementById('context-date-value');
    const dateSub = document.getElementById('context-date-sub');
    const entityBreadcrumb = document.getElementById('context-entity-breadcrumb');
    const entityValue = document.getElementById('context-entity-value');
    const entitySub = document.getElementById('context-entity-sub');

    if (dateValue) dateValue.textContent = 'Flight Weeks 3–2';
    if (dateSub) dateSub.textContent = 'Dec 10, 2025 – Jan 13, 2026';
    if (entityBreadcrumb) entityBreadcrumb.textContent = 'ALL STORES';
    if (entityValue) entityValue.textContent = rc.name;
    if (entitySub) entitySub.textContent = storeCount + ' stores · ' + rc.pilotLabel;
  }

  function cacheElements() {
    elements = {
      mediaKpis: document.getElementById('media-kpis'),
      creativeVariants: document.getElementById('creative-variants'),
      videoKpis: document.getElementById('video-kpis'),
      visitationKpis: document.getElementById('visitation-kpis'),
      crossoverDetail: document.getElementById('crossover-detail'),
      spotlightCards: document.getElementById('spotlight-cards'),
      trafficKpis: document.getElementById('traffic-kpis'),
      leaderboardTable: document.getElementById('leaderboard-table'),
      concentrationStats: document.getElementById('concentration-stats'),
      threatList: document.getElementById('threat-list'),
      sectionNav: document.getElementById('section-nav')
    };
  }

  function bindEvents() {
    // Section nav
    document.querySelectorAll('.section-nav__link').forEach(link => {
      link.addEventListener('click', handleSectionNavClick);
    });

    // Store view toggle
    document.querySelectorAll('#store-view-toggle .toggle-btn').forEach(btn => {
      btn.addEventListener('click', handleViewToggle);
    });

    // Leaderboard sort toggle
    document.querySelectorAll('#leaderboard-sort .toggle-btn').forEach(btn => {
      btn.addEventListener('click', handleLeaderboardSort);
    });

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
    renderConcentration();
    renderThreats();
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

  function renderMediaKpis() {
    const metrics = D.mediaBuyMetrics;
    const m = metrics.summary;
    if (!m) return;

    // Calculate trends from weekly data
    const trend = metrics.weeklyTrend;
    let cpvTrend = '', imprTrend = '', clickTrend = '', ctrTrend = '', vptTrend = '';
    if (trend.length >= 2) {
      const first = trend[0];
      const last = trend[trend.length - 1];
      const cpvDiff = (last.cost_per_visit - first.cost_per_visit).toFixed(2);
      cpvTrend = (cpvDiff <= 0 ? '' : '+') + '$' + cpvDiff + ' vs ' + first.week;
      imprTrend = '+' + (((last.impressions - first.impressions) / first.impressions) * 100).toFixed(1) + '%';
      clickTrend = '+' + (((last.clicks - first.clicks) / first.clicks) * 100).toFixed(1) + '%';
      ctrTrend = '+' + (last.ctr - first.ctr).toFixed(2) + ' pp';
      vptTrend = '+' + (last.visits_per_thousand - first.visits_per_thousand).toFixed(1);
    }

    elements.mediaKpis.innerHTML = [
      kpiTile('Cost Per Visit', fmtCurrency(m.cost_per_visit), { primary: true, trend: -1, trendLabel: cpvTrend }),
      kpiTile('Impressions', fmtNumber(m.impressions), { trend: 1, trendLabel: imprTrend }),
      kpiTile('Clicks', fmtNumber(m.clicks), { trend: 1, trendLabel: clickTrend }),
      kpiTile('CTR', fmtPct(m.ctr), { trend: 1, trendLabel: ctrTrend }),
      kpiTile('Visits / 1,000', m.visits_per_thousand.toFixed(1), { trend: 1, trendLabel: vptTrend }),
      kpiTile('Budget', fmtCurrency(m.budget))
    ].join('');
  }

  function renderCreativePanel() {
    const records = D.creativeRecords;
    if (!records.length) return;

    const isABTest = records.length >= 2;

    elements.creativeVariants.innerHTML = records.map((cr, i) => {
      const variantLabel = isABTest ? `Variant ${String.fromCharCode(65 + i)}` : '';
      const typeIcon = cr.creative_type === 'video' ? 'movie' : (cr.creative_type === 'gif' ? 'gif_box' : 'image');

      return `
        <div class="creative-card">
          ${variantLabel ? `<span class="badge badge--variant">${variantLabel}</span>` : ''}
          <div class="creative-preview">
            <span class="material-symbols-outlined creative-placeholder-icon">${typeIcon}</span>
            <span class="creative-type-badge">${cr.creative_type.toUpperCase()}</span>
          </div>
          <div class="creative-info">
            <div class="creative-label">${cr.label || cr.notes}</div>
            <div class="creative-meta">
              <span>${cr.date_range_start} — ${cr.date_range_end}</span>
              <span>${cr.store_group.length} stores</span>
            </div>
            ${cr.metrics ? `
              <div class="creative-metrics">
                <span class="creative-metric">${fmtNumber(cr.metrics.impressions)} impr</span>
                <span class="creative-metric">${fmtPct(cr.metrics.ctr)} CTR</span>
                <span class="creative-metric">${fmtNumber(cr.metrics.gross_visits)} visits</span>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  function renderVideoKpis() {
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
    const vm = D.visitationMetrics;
    const latest = vm.summary;
    if (!latest) return;
    const zeroPct = ((latest.visits_zero_prev / latest.gross_visits) * 100).toFixed(1);

    // Calculate growth from first to last week
    const trend = vm.weeklyTrend;
    const growthPct = trend.length >= 2
      ? (((trend[trend.length - 1].gross_visits - trend[0].gross_visits) / trend[0].gross_visits) * 100).toFixed(1)
      : '0.0';

    elements.visitationKpis.innerHTML = [
      kpiTile('Cost Per Visit', fmtCurrency(latest.cost_per_visit), { primary: true }),
      kpiTile('Gross Visits', fmtNumber(latest.gross_visits), { trend: parseFloat(growthPct), trendLabel: '+' + growthPct + '%' }),
      kpiTile('Visits / 1,000', latest.visits_per_thousand.toFixed(1)),
      kpiTile('Zero Previous (30d)', fmtNumber(latest.visits_zero_prev), { trend: 1, trendLabel: zeroPct + '%' }),
      kpiTile('1-3 Previous', fmtNumber(latest.visits_one_three_prev)),
      kpiTile('4+ Previous', fmtNumber(latest.visits_four_plus_prev))
    ].join('');
  }

  function renderCrossoverDetail() {
    elements.crossoverDetail.innerHTML = D.competitiveCrossover.map(comp => {
      const total = comp.crossover_visits_zero_prev + comp.crossover_visits_one_three + comp.crossover_visits_four_plus;
      return `
        <details class="crossover-row">
          <summary class="crossover-row__summary">
            <span class="crossover-name">${comp.competitor_name}</span>
            <span class="crossover-address">${comp.competitor_store_address}</span>
            <span class="crossover-pct">${comp.crossover_pct}%</span>
          </summary>
          <div class="crossover-row__detail">
            <div class="crossover-buckets">
              <div class="bucket bucket--zero">
                <span class="bucket-label">Zero Prev</span>
                <span class="bucket-value">${fmtNumber(comp.crossover_visits_zero_prev)}</span>
                <span class="bucket-pct">${((comp.crossover_visits_zero_prev / total) * 100).toFixed(0)}%</span>
              </div>
              <div class="bucket bucket--mid">
                <span class="bucket-label">1-3 Prev</span>
                <span class="bucket-value">${fmtNumber(comp.crossover_visits_one_three)}</span>
                <span class="bucket-pct">${((comp.crossover_visits_one_three / total) * 100).toFixed(0)}%</span>
              </div>
              <div class="bucket bucket--loyal">
                <span class="bucket-label">4+ Prev</span>
                <span class="bucket-value">${fmtNumber(comp.crossover_visits_four_plus)}</span>
                <span class="bucket-pct">${((comp.crossover_visits_four_plus / total) * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </details>
      `;
    }).join('');
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
    const s = D.trafficShareMetrics.summary;
    elements.trafficKpis.innerHTML = [
      kpiTile('Traffic Share', s.retailer_traffic_share + '%', { primary: true }),
      kpiTile('Share Change', fmtPp(s.share_change_pp), { trend: s.share_change_pp }),
      kpiTile('Outperforming', `${s.stores_outperforming} of ${s.stores_total}`, { trend: 1, trendLabel: '75%' }),
      kpiTile('Growth Advantage', (s.growth_advantage >= 0 ? '+' : '') + s.growth_advantage.toFixed(1) + '%', { trend: s.growth_advantage })
    ].join('');
  }

  function renderLeaderboard(sortBy) {
    let stores = [...D.trafficShareMetrics.storeLeaderboard];
    if (sortBy === 'change') {
      stores.sort((a, b) => b.change_pp - a.change_pp);
    } else {
      stores.sort((a, b) => b.wk2_share - a.wk2_share);
    }

    elements.leaderboardTable.innerHTML = `
      <div class="lb-header">
        <span class="lb-col lb-col--store">Store</span>
        <span class="lb-col lb-col--city">City</span>
        <span class="lb-col lb-col--share">Share</span>
        <span class="lb-col lb-col--change">Change</span>
        <span class="lb-col lb-col--alert">Status</span>
      </div>
      ${stores.map((s, i) => `
        <div class="lb-row lb-row--${s.group}">
          <span class="lb-col lb-col--store">
            <span class="lb-rank">${i + 1}</span>
            ${s.store_id}
          </span>
          <span class="lb-col lb-col--city">${s.city}</span>
          <span class="lb-col lb-col--share">${s.wk2_share}%</span>
          <span class="lb-col lb-col--change ${s.change_pp >= 0 ? 'positive' : 'negative'}">${fmtPp(s.change_pp)}</span>
          <span class="lb-col lb-col--alert">
            ${s.alert_type !== 'none' ? `<span class="alert-badge alert-badge--${s.alert_type}">${s.alert_type}</span>` : '—'}
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
    elements.threatList.innerHTML = threats.map(t => `
      <div class="threat-item">
        <span class="threat-name">${t.brand}</span>
        <span class="threat-count">${t.store_count} store${t.store_count > 1 ? 's' : ''}</span>
        <div class="threat-bar">
          <div class="threat-bar__fill" style="width: ${(t.store_count / totalStores) * 100}%;"></div>
        </div>
      </div>
    `).join('');
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
      HeaderComponent.updateDateDisplay('Flight Weeks 3-2', 'Dec 10, 2025 – Jan 13, 2026');
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

  function updateRetailerLabels() {
    const name = D.retailerConfig.name;
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
    initShareTrendChart();
    initVolumeChart();
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
    const el = document.getElementById('chart-crossover');
    if (!el) return;
    const chart = echarts.init(el);
    charts.crossover = chart;

    const sorted = [...D.competitiveCrossover].sort((a, b) => a.crossover_pct - b.crossover_pct);

    chart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 180, right: 40, top: 10, bottom: 30 },
      xAxis: { type: 'value', max: 40, axisLabel: { formatter: '{value}%' } },
      yAxis: {
        type: 'category',
        data: sorted.map(c => c.competitor_name),
        axisLabel: { fontSize: 12 }
      },
      series: [{
        type: 'bar',
        data: sorted.map(c => ({
          value: c.crossover_pct,
          itemStyle: { color: c.competitor_name === 'Publix' ? ChartColors.red : ChartColors.indigo }
        })),
        barWidth: 20,
        label: { show: true, position: 'right', formatter: '{c}%', fontSize: 11 }
      }]
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

  function initShareTrendChart() {
    const el = document.getElementById('chart-share-trend');
    if (!el) return;
    const chart = echarts.init(el);
    charts.shareTrend = chart;

    const shareTrend = D.trafficShareMetrics.trend;
    const weeks = shareTrend.map(w => D.getWeekLabel(w.week));
    const shareChange = D.trafficShareMetrics.summary.share_change_pp;

    chart.setOption({
      tooltip: {
        trigger: 'axis',
        formatter: function(params) {
          let html = `<strong>${params[0].axisValue}</strong><br>`;
          params.forEach(p => {
            html += `${p.marker} ${p.seriesName}: ${p.value}%<br>`;
          });
          const gap = params[0].value - params[1].value;
          html += `<strong>Gap: ${gap > 0 ? '+' : ''}${gap.toFixed(1)} pp</strong>`;
          return html;
        }
      },
      legend: { show: false },
      grid: { left: 50, right: 20, top: 30, bottom: 40 },
      xAxis: { type: 'category', data: weeks, axisLabel: { fontSize: 11 } },
      yAxis: { type: 'value', min: 30, max: 70, axisLabel: { formatter: '{value}%' } },
      series: [
        {
          name: D.retailerConfig.name,
          type: 'line',
          data: shareTrend.map(w => w.retailer_share),
          smooth: true,
          lineStyle: { color: ChartColors.green, width: 3 },
          itemStyle: { color: ChartColors.green },
          symbolSize: 8,
          areaStyle: { color: 'rgba(16, 185, 129, 0.08)' }
        },
        {
          name: 'Competitors',
          type: 'line',
          data: shareTrend.map(w => w.comp_share),
          smooth: true,
          lineStyle: { color: ChartColors.gray, width: 3 },
          itemStyle: { color: ChartColors.gray },
          symbolSize: 8,
          areaStyle: { color: 'rgba(156, 163, 175, 0.08)' }
        }
      ],
      // Gap annotation
      graphic: [{
        type: 'text',
        left: 'center',
        top: 10,
        style: {
          text: `Gap ${shareChange >= 0 ? 'widening' : 'narrowing'}: ${shareChange >= 0 ? '+' : ''}${shareChange.toFixed(1)} pp over campaign`,
          fill: ChartColors.green,
          fontSize: 12,
          fontWeight: 600
        }
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

  function initVolumeChart() {
    const el = document.getElementById('chart-volume');
    if (!el) return;
    const chart = echarts.init(el);
    charts.volume = chart;

    const trend = D.trafficShareMetrics.trend;
    const weeks = trend.map(w => D.getWeekLabel(w.week));

    chart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: function(params) {
          let html = '<strong>' + params[0].axisValue + '</strong><br>';
          let total = 0;
          params.forEach(function(p) { total += p.value; });
          params.forEach(function(p) {
            const pct = ((p.value / total) * 100).toFixed(1);
            html += p.marker + ' ' + p.seriesName + ': ' + p.value.toLocaleString() + ' (' + pct + '%)<br>';
          });
          html += '<strong>Total: ' + total.toLocaleString() + '</strong>';
          return html;
        }
      },
      grid: { left: 70, right: 20, top: 20, bottom: 40 },
      xAxis: { type: 'category', data: weeks, axisLabel: { fontSize: 11 } },
      yAxis: { type: 'value', axisLabel: { formatter: function(val) { return (val / 1000).toFixed(0) + 'K'; } } },
      series: [
        {
          name: D.retailerConfig.name,
          type: 'bar',
          data: trend.map(function(w) { return w.retailer_visits; }),
          itemStyle: { color: ChartColors.green, borderRadius: [3, 3, 0, 0] },
          barGap: '10%'
        },
        {
          name: 'Competitors',
          type: 'bar',
          data: trend.map(function(w) { return w.comp_visits; }),
          itemStyle: { color: ChartColors.gray, borderRadius: [3, 3, 0, 0] }
        }
      ]
    });
  }

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

  function handleViewToggle(e) {
    const btn = e.currentTarget;
    document.querySelectorAll('#store-view-toggle .toggle-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const view = btn.dataset.view;
    if (view === 'groups') {
      renderGroupView();
    } else {
      renderLeaderboard('change');
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

  function handleLeaderboardSort(e) {
    const btn = e.currentTarget;
    document.querySelectorAll('#leaderboard-sort .toggle-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderLeaderboard(btn.dataset.sort);
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

  // Expose init for lazy activation by app.js (no auto-init in combined prototype)
  window.initDistribution = init;
})();
