/* by-competitor init — the by-Competitor (crossover) engine slice of
   js/distribution/distribution.js, carved verbatim: initCrossoverChart,
   updateCrossoverChartPeriod, renderCrossoverDetail + the fmtNumber helper
   and pane state (_crossoverPeriodWeekCount/_crossoverCohort/_crossoverMetric).
   D = static snapshot (data/traffic-share-data.js) instead of the live
   DistributionData getters; control wiring (initCrossoverPeriodPresets /
   initCrossoverCohort / initCrossoverMetric listeners) replaced by the
   DistToggle onChange seams — chart-card routes them here via
   window.DistCrossover.setWeeks/setCohort/setMetric.
   Angular twin: dh-distribution-crossover (module, echarts backing). */
(function () {
  'use strict';

  var D = window.DIST_TRAFFIC_DATA;
  var charts = {};
  var elements = {}; // cached in init() — mirrors proto cacheElements slice

  function fmtNumber(val) {
    return val.toLocaleString('en-US');
  }

  // ── State (verbatim names from distribution.js) ──────────────────────────
  // by-Competitor pane state (P8 parity, Max Jun-16) — mirrors Observed Visits comp controls.
  var _crossoverPeriodWeekCount = 8; // by-Competitor duration (own preset row)
  var _crossoverCohort = 'all';      // N/R/L cohort lens (all|new|returning|loyal)
  var _crossoverMetric = 'share';    // Share % (100% area) vs Visits (absolute)

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

  window.DistCrossover = {
    // Mirrors initDistributionPage('traffic') order: initCrossoverChart →
    // renderCrossoverDetail → updateCrossoverChartPeriod(8) (default 8 Week,
    // matches the standardized preset row). The hidden pane renders 0×0 and
    // chart-card's resizePane fixes sizing on first tab show (proto contract).
    init: function () {
      elements.crossoverDetail = document.getElementById('crossover-detail');
      initCrossoverChart();
      renderCrossoverDetail();
      updateCrossoverChartPeriod(8);
    },
    // Duration-preset seam (proto initCrossoverPeriodPresets click body).
    // P8 (Max Jun-16): standardized to 4/8/13/Year, matching every other trend row.
    setWeeks: function (period) {
      var weekCount = period === '4w' ? 4 : period === '8w' ? 8 : period === '13w' ? 13 : 52;
      updateCrossoverChartPeriod(weekCount);
    },
    // Cohort-lens seam (proto initCrossoverCohort click body).
    setCohort: function (cohort) {
      _crossoverCohort = cohort;
      updateCrossoverChartPeriod(_crossoverPeriodWeekCount);
    },
    // Share%/Visits seam (proto initCrossoverMetric click body).
    setMetric: function (metric) {
      _crossoverMetric = metric;
      updateCrossoverChartPeriod(_crossoverPeriodWeekCount);
    }
  };
})();
