/* trend init — the Time Trend engine slice of js/distribution/distribution.js
   (initTrafficCombinedChart, initCrossoverTrendChart, updateCrossoverTrendPeriod
   + the in-IIFE darkAxisTooltip/bucketDateHint helpers), carved verbatim.
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
  var _crossoverTrendMetric = 'share';
  var _crossoverTrendWeekCount = 8; // default = 8 Week preset (matches duration-preset--active in markup)
  var CROSSOVER_TREND_WEEKS = { '1w': 1, '4w': 4, '8w': 8, '13w': 13, '1m': 4, '1q': 13, '1y': 52 };

  function getEntityLabel() { return D.entityLabel; }

  // ── Shared dark tooltip helpers (distribution.js in-IIFE variants) ───────
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

  function _fmtDateRange(startISO, endISO) {
    var mo = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var s = new Date(startISO + 'T00:00:00Z');
    var e = new Date(endISO + 'T00:00:00Z');
    if (s.getUTCMonth() === e.getUTCMonth()) {
      return mo[s.getUTCMonth()] + ' ' + s.getUTCDate() + '–' + e.getUTCDate() + ', ' + e.getUTCFullYear();
    }
    return mo[s.getUTCMonth()] + ' ' + s.getUTCDate() + ' – ' + mo[e.getUTCMonth()] + ' ' + e.getUTCDate() + ', ' + e.getUTCFullYear();
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

  // ── Crossover trend (per-competitor lines — UX-928 #15 removes at dial) ──
  function initCrossoverTrendChart() {
    const el = document.getElementById('chart-crossover-trend');
    if (!el) return;
    // Honor the active duration preset (default 8 Week) instead of plotting the
    // full 52-week year. Delegates to updateCrossoverTrendPeriod so the init and
    // preset-click paths share one render — matches the canonical Time Trend
    // duration-preset contract in the Engagement shell.
    updateCrossoverTrendPeriod(_crossoverTrendWeekCount);
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

  function updateTrafficCombinedChart() { initTrafficCombinedChart(_crossoverTrendWeekCount); }

  window.DistTrend = {
    // Mirrors initDistributionPage('traffic'): eager-init both trend charts at
    // the default 8-week preset; the hidden pane renders 0×0 and chart-card's
    // resizePane fixes sizing on first tab show (proto contract).
    init: function () {
      initTrafficCombinedChart(_crossoverTrendWeekCount);
      initCrossoverTrendChart();
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
      updateCrossoverTrendPeriod(_crossoverTrendWeekCount);
      initTrafficCombinedChart(_crossoverTrendWeekCount); // bar chart shares the duration
    }
  };
})();
