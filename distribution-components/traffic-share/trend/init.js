/* trend init — the Time Trend engine slice of js/distribution/distribution.js
   (initTrafficCombinedChart), carved verbatim. The per-competitor crossover
   line chart (initCrossoverTrendChart/updateCrossoverTrendPeriod + the
   darkAxisTooltip helpers it used) is REMOVED per UX-928 #15.
   D = static snapshot (data/traffic-share-data.js) instead of the live
   DistributionData getters; control wiring (initTrafficChartToggle /
   initCrossoverTrendPresets listeners) replaced by the DistToggle onChange
   seams — chart-card routes them here via window.DistTrend.setView/setWeeks.
   Angular twin: dh-traffic-share-trend (module, echarts backing). */
(function () {
  'use strict';

  var D = window.DIST_TRAFFIC_DATA;
  var charts = {};

  // ── State (verbatim names from distribution.js) ──────────────────────────
  var _trafficChartView = 'share'; // 'share' or 'volume'
  var _crossoverTrendWeekCount = 8; // default = 8 Week preset (matches duration-preset--active in markup)
  var CROSSOVER_TREND_WEEKS = { '1w': 1, '4w': 4, '8w': 8, '13w': 13, '1m': 4, '1q': 13, '1y': 52 };

  function getEntityLabel() { return D.entityLabel; }

  // weekCount: trailing weeks to show, driven by the Time Trend duration presets
  // (default 8). Omit/falsy = full series.
  function initTrafficCombinedChart(weekCount) {
    const el = document.getElementById('chart-traffic-combined');
    if (!el) return;
    if (charts.trafficCombined) { charts.trafficCombined.dispose(); charts.trafficCombined = null; }
    const chart = echarts.init(el);
    charts.trafficCombined = chart;

    const fullTrend = D.trafficShareMetrics.trend;
    const trend = weekCount ? fullTrend.slice(Math.max(0, fullTrend.length - weekCount)) : fullTrend;
    const weeks = trend.map(w => D.getWeekLabel(w.week));
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
        // Dark hover overlay — the canonical analytics dark-tooltip pattern (D3 audit fix).
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

  function updateTrafficCombinedChart() { initTrafficCombinedChart(_crossoverTrendWeekCount); }

  window.DistTrend = {
    // Mirrors initDistributionPage('traffic'): eager-init the trend chart at
    // the default 8-week preset; the hidden pane renders 0×0 and chart-card's
    // resizePane fixes sizing on first tab show (proto contract).
    init: function () {
      initTrafficCombinedChart(_crossoverTrendWeekCount);
    },
    // Share%/Visits toggle seam (proto initTrafficChartToggle body).
    setView: function (view) {
      if (view === _trafficChartView) return;
      _trafficChartView = view;
      updateTrafficCombinedChart();
    },
    // Duration-preset seam (proto initCrossoverTrendPresets click body).
    setWeeks: function (period) {
      _crossoverTrendWeekCount = CROSSOVER_TREND_WEEKS[period] || 13;
      initTrafficCombinedChart(_crossoverTrendWeekCount);
    }
  };
})();
