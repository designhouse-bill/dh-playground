/**
 * SHARED PERFORMANCE CHARTS MODULE
 * Provides eCharts-based stacked horizontal bar charts for BASE pages
 * with multi-select metric filtering (Views, Clicks, Adds)
 */
const PerfCharts = (() => {
  'use strict';

  // =========================================
  // CONSTANTS
  // =========================================
  const METRIC_COLORS = {
    views: '#4272D8',   // Blue
    clicks: '#B8D64D',  // Green
    adds: '#937DF8'     // Purple
  };

  const METRIC_NAMES = {
    views: 'Views',
    clicks: 'Clicks',
    adds: 'Adds'
  };

  // =========================================
  // STATE
  // =========================================
  const chartInstances = new Map();
  const resizeObservers = new Map();
  let selectedMetrics = ['all']; // Default: show composite (all metrics)
  let maxValues = { views: 0, clicks: 0, adds: 0, total: 0 };

  // =========================================
  // CHART FUNCTIONS
  // =========================================

  /**
   * Format number with commas
   */
  function formatNumber(num) {
    if (typeof num !== 'number' || isNaN(num)) return '0';
    return num.toLocaleString('en-US');
  }

  /**
   * Calculate the display value based on selected metrics
   * @param {Object} data - { views, clicks, adds }
   * @param {number} totalScore - The composite score to show when "All" is selected
   * @returns {number} The value to display
   */
  function getMetricDisplayValue(data, totalScore) {
    if (selectedMetrics.includes('all')) {
      return totalScore;
    }

    let total = 0;
    if (selectedMetrics.includes('views')) total += (data.views || 0);
    if (selectedMetrics.includes('clicks')) total += (data.clicks || 0);
    if (selectedMetrics.includes('adds')) total += (data.adds || 0);

    return total;
  }

  /**
   * Update all value displays based on current metric selection
   */
  function updateAllValueDisplays() {
    const chartContainers = document.querySelectorAll('.perf-chart[data-views]');
    chartContainers.forEach(container => {
      const data = {
        views: parseInt(container.dataset.views, 10) || 0,
        clicks: parseInt(container.dataset.clicks, 10) || 0,
        adds: parseInt(container.dataset.adds, 10) || 0
      };
      const totalScore = parseInt(container.dataset.composite, 10) || 0;

      // Find sibling value span
      const valueSpan = container.parentElement.querySelector('.perf-chart__value');
      if (valueSpan) {
        valueSpan.textContent = formatNumber(getMetricDisplayValue(data, totalScore));
      }
    });
  }

  /**
   * Create eCharts stacked horizontal bar chart
   * @param {string} containerId - DOM element ID for chart
   * @param {Object} data - { views, clicks, adds, composite }
   * @param {Object} options - { height, maxTotal, entityName, scoreOnly }
   */
  function createChart(containerId, data, options = {}) {
    const container = document.getElementById(containerId);
    if (!container || typeof echarts === 'undefined') return null;

    // Dispose existing chart if any
    disposeChart(containerId);

    const height = options.height || 16;
    const maxTotal = options.maxTotal || maxValues.total || 1;
    const entityName = options.entityName || '';
    const scoreOnly = options.scoreOnly || false;

    // Set container height
    container.style.height = `${height}px`;

    // Initialize chart
    const chart = echarts.init(container);
    chartInstances.set(containerId, chart);

    // Build chart option
    const chartOption = scoreOnly
      ? buildScoreOnlyChartOption(data.composite || 0, maxTotal, entityName)
      : buildChartOption(data, maxTotal, entityName);
    chart.setOption(chartOption);

    // Setup resize observer
    const resizeObserver = new ResizeObserver(() => {
      chart.resize();
    });
    resizeObserver.observe(container);
    resizeObservers.set(containerId, resizeObserver);

    return chart;
  }

  /**
   * Build eCharts option based on selected metrics
   * @param {Object} data - { views, clicks, adds }
   * @param {number} maxTotal - Maximum total for scaling
   * @param {string} entityName - Name of the entity (store/category/promotion) for tooltip title
   */
  function buildChartOption(data, maxTotal, entityName = '') {
    const views = data.views || 0;
    const clicks = data.clicks || 0;
    const adds = data.adds || 0;

    // Bar segments use weighted points, not raw counts
    const viewsPts  = views * 1;
    const clicksPts = clicks * 5;
    const addsPts   = adds * 20;

    const showAll = selectedMetrics.includes('all');
    const series = [];

    // Views series
    if (showAll || selectedMetrics.includes('views')) {
      series.push({
        name: 'Views',
        type: 'bar',
        stack: 'total',
        data: [viewsPts],
        itemStyle: {
          color: METRIC_COLORS.views,
          borderRadius: series.length === 0 ? [4, 0, 0, 4] : 0
        },
        barWidth: '100%',
        emphasis: {
          itemStyle: { shadowBlur: 4, shadowColor: 'rgba(0,0,0,0.2)' }
        }
      });
    }

    // Clicks series
    if (showAll || selectedMetrics.includes('clicks')) {
      series.push({
        name: 'Clicks',
        type: 'bar',
        stack: 'total',
        data: [clicksPts],
        itemStyle: {
          color: METRIC_COLORS.clicks,
          borderRadius: 0
        },
        barWidth: '100%',
        emphasis: {
          itemStyle: { shadowBlur: 4, shadowColor: 'rgba(0,0,0,0.2)' }
        }
      });
    }

    // Adds series
    if (showAll || selectedMetrics.includes('adds')) {
      const isLast = series.length > 0;
      series.push({
        name: 'Adds',
        type: 'bar',
        stack: 'total',
        data: [addsPts],
        itemStyle: {
          color: METRIC_COLORS.adds,
          borderRadius: [0, 4, 4, 0]
        },
        barWidth: '100%',
        emphasis: {
          itemStyle: { shadowBlur: 4, shadowColor: 'rgba(0,0,0,0.2)' }
        }
      });
    }

    // Adjust border radius for first and last visible series
    if (series.length > 0) {
      series[0].itemStyle.borderRadius = [4, 0, 0, 4];
      series[series.length - 1].itemStyle.borderRadius = [0, 4, 4, 0];
      if (series.length === 1) {
        series[0].itemStyle.borderRadius = [4, 4, 4, 4];
      }
    }

    return {
      grid: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        containLabel: false
      },
      xAxis: {
        type: 'value',
        show: false,
        max: maxTotal,
        min: 0
      },
      yAxis: {
        type: 'category',
        show: false,
        data: ['']
      },
      tooltip: {
        trigger: 'item',
        confine: false,
        appendToBody: true,
        position: function(point, params, dom, rect, size) {
          // Position tooltip below the bar element using rect
          if (rect) {
            return [rect.x + rect.width / 2 - size.contentSize[0] / 2, rect.y + rect.height + 8];
          }
          // Fallback to cursor-based positioning
          return [point[0] - size.contentSize[0] / 2, point[1] + 30];
        },
        backgroundColor: 'rgba(17,24,39,0.96)',
        borderColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1,
        padding: [10, 14],
        extraCssText: 'box-shadow: 0 6px 18px rgba(0,0,0,0.28); z-index: 9999;',
        textStyle: {
          color: '#fff',
          fontSize: 12,
          fontFamily: 'inherit'
        },
        formatter: (params) => {
          let html = '';

          if (entityName) {
            html += `<div style="font-weight:600;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,0.2);color:#fff;">${entityName}</div>`;
          }

          const inViewScore  = views * 1;
          const clickScore = clicks * 5;
          const addToListScore   = adds * 20;
          const totalScore  = inViewScore + clickScore + addToListScore;

          // Column headers
          html += `<div style="display:flex;align-items:center;color:rgba(255,255,255,0.5);font-size:10px;margin-bottom:5px;padding-left:18px;">
            <span style="min-width:52px;"></span>
            <span style="min-width:64px;text-align:right;">Interactions</span>
            <span style="min-width:64px;text-align:right;">Points</span>
          </div>`;

          const rows = [
            { name: 'Views',  value: views,  score: inViewScore,  color: METRIC_COLORS.views,  weight: '×1'  },
            { name: 'Clicks', value: clicks, score: clickScore, color: METRIC_COLORS.clicks, weight: '×5'  },
            { name: 'Adds',   value: adds,   score: addToListScore,   color: METRIC_COLORS.adds,   weight: '×20' }
          ];

          rows.forEach(row => {
            html += `<div style="display:flex;align-items:center;color:#fff;margin-bottom:3px;">
              <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${row.color};margin-right:8px;flex-shrink:0;"></span>
              <span style="min-width:52px;">${row.name} <span style="color:rgba(255,255,255,0.5);font-size:10px;">${row.weight}</span></span>
              <span style="min-width:64px;text-align:right;">${formatNumber(row.value)}</span>
              <span style="min-width:64px;text-align:right;color:rgba(255,255,255,0.5);">${formatNumber(row.score)}</span>
            </div>`;
          });

          html += `<div style="display:flex;align-items:center;margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.2);font-weight:600;color:#fff;">
            <span style="min-width:52px;padding-left:18px;">Score</span>
            <span style="min-width:64px;"></span>
            <span style="min-width:64px;text-align:right;">${formatNumber(totalScore)}</span>
          </div>`;

          return html;
        }
      },
      series: series
    };
  }

  /**
   * Build eCharts option for a single composite score bar (used in Compare view)
   * @param {number} score - Composite engagement score
   * @param {number} maxScore - Maximum score for scaling
   * @param {string} entityName
   */
  function buildScoreOnlyChartOption(score, maxScore, entityName = '') {
    return {
      grid: { left: 0, right: 0, top: 0, bottom: 0, containLabel: false },
      xAxis: { type: 'value', show: false, max: maxScore || 1, min: 0 },
      yAxis: { type: 'category', show: false, data: [''] },
      tooltip: {
        trigger: 'item',
        confine: false,
        appendToBody: true,
        backgroundColor: 'rgba(17,24,39,0.96)',
        borderColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1,
        padding: [10, 14],
        extraCssText: 'box-shadow: 0 6px 18px rgba(0,0,0,0.28); z-index: 9999;',
        textStyle: { color: '#fff', fontSize: 12, fontFamily: 'inherit' },
        formatter: () => {
          let html = entityName ? `<div style="font-weight:600;margin-bottom:6px;color:#fff;">${entityName}</div>` : '';
          html += `<div style="display:flex;align-items:center;gap:8px;color:#fff;">
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#4272D8"></span>
            <span>Engagement Score: <strong>${score}</strong></span>
          </div>`;
          return html;
        }
      },
      series: [{
        name: 'Score',
        type: 'bar',
        stack: 'total',
        data: [score],
        itemStyle: { color: '#4272D8', borderRadius: [4, 4, 4, 4] },
        barWidth: '100%',
        emphasis: { itemStyle: { shadowBlur: 4, shadowColor: 'rgba(0,0,0,0.2)' } }
      }]
    };
  }

  /**
   * Dispose a single chart instance
   */
  function disposeChart(containerId) {
    const chart = chartInstances.get(containerId);
    if (chart) {
      chart.dispose();
      chartInstances.delete(containerId);
    }

    const observer = resizeObservers.get(containerId);
    if (observer) {
      observer.disconnect();
      resizeObservers.delete(containerId);
    }
  }

  /**
   * Dispose all chart instances
   */
  function disposeAllCharts() {
    chartInstances.forEach((chart, id) => {
      chart.dispose();
    });
    chartInstances.clear();

    resizeObservers.forEach((observer) => {
      observer.disconnect();
    });
    resizeObservers.clear();
  }

  /**
   * Re-render all existing charts with current metric selection
   */
  function rerenderAllCharts() {
    const chartContainers = document.querySelectorAll('.perf-chart[data-views]');
    chartContainers.forEach(container => {
      const chart = chartInstances.get(container.id);
      if (chart) {
        const data = {
          views: parseInt(container.dataset.views, 10) || 0,
          clicks: parseInt(container.dataset.clicks, 10) || 0,
          adds: parseInt(container.dataset.adds, 10) || 0
        };
        const maxTotal = parseInt(container.dataset.max, 10) || maxValues.total || 1;
        const entityName = container.dataset.name || '';
        const option = buildChartOption(data, maxTotal, entityName);
        chart.setOption(option, true);
      }
    });
  }

  // =========================================
  // DROPDOWN FUNCTIONS
  // =========================================

  /**
   * Get the display label for currently selected metrics
   */
  function getSelectedLabel() {
    if (selectedMetrics.includes('all')) {
      return 'All (Composite)';
    }
    const labels = [];
    if (selectedMetrics.includes('views')) labels.push('Views');
    if (selectedMetrics.includes('clicks')) labels.push('Clicks');
    if (selectedMetrics.includes('adds')) labels.push('Adds');
    return labels.join(', ') || 'All (Composite)';
  }

  /**
   * Get HTML for metric filter dropdown in column header
   */
  function getDropdownHTML() {
    const allChecked = selectedMetrics.includes('all') ? 'checked' : '';
    const viewsChecked = selectedMetrics.includes('views') ? 'checked' : '';
    const clicksChecked = selectedMetrics.includes('clicks') ? 'checked' : '';
    const addsChecked = selectedMetrics.includes('adds') ? 'checked' : '';
    const selectedLabel = getSelectedLabel();

    return `
      <div class="perf-metric-dropdown">
        <button class="perf-metric-dropdown__trigger" onclick="PerfCharts.toggleDropdown(event)" title="Filter metrics">
          <span class="material-symbols-outlined">tune</span>
          <span class="perf-metric-dropdown__label">${selectedLabel}</span>
        </button>
        <div class="perf-metric-dropdown__menu" id="perf-metric-menu">
          <div class="perf-metric-dropdown__header">Show Metrics</div>
          <div class="perf-metric-dropdown__list">
            <label class="perf-metric-item">
              <input type="checkbox" value="all" ${allChecked} onchange="PerfCharts.handleMetricChange(this)">
              <span class="perf-metric-swatch perf-metric-swatch--all"></span>
              <span>All (Composite)</span>
            </label>
            <label class="perf-metric-item">
              <input type="checkbox" value="views" ${viewsChecked} onchange="PerfCharts.handleMetricChange(this)">
              <span class="perf-metric-swatch perf-metric-swatch--views"></span>
              <span>Views</span>
            </label>
            <label class="perf-metric-item">
              <input type="checkbox" value="clicks" ${clicksChecked} onchange="PerfCharts.handleMetricChange(this)">
              <span class="perf-metric-swatch perf-metric-swatch--clicks"></span>
              <span>Clicks</span>
            </label>
            <label class="perf-metric-item">
              <input type="checkbox" value="adds" ${addsChecked} onchange="PerfCharts.handleMetricChange(this)">
              <span class="perf-metric-swatch perf-metric-swatch--adds"></span>
              <span>Adds</span>
            </label>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Toggle dropdown visibility
   */
  function toggleDropdown(event) {
    event.stopPropagation();
    const menu = document.getElementById('perf-metric-menu');
    if (menu) {
      menu.classList.toggle('open');
    }

    // Close on outside click
    if (menu && menu.classList.contains('open')) {
      const closeHandler = (e) => {
        if (!menu.contains(e.target) && !e.target.closest('.perf-metric-dropdown__trigger')) {
          menu.classList.remove('open');
          document.removeEventListener('click', closeHandler);
        }
      };
      setTimeout(() => document.addEventListener('click', closeHandler), 0);
    }
  }

  /**
   * Handle metric checkbox change
   */
  function handleMetricChange(checkbox) {
    const value = checkbox.value;
    const menu = checkbox.closest('.perf-metric-dropdown__menu');

    if (value === 'all') {
      // "All" is exclusive - uncheck others when checked
      if (checkbox.checked) {
        selectedMetrics = ['all'];
        if (menu) {
          menu.querySelectorAll('input[type="checkbox"]:not([value="all"])').forEach(cb => {
            cb.checked = false;
          });
        }
      } else {
        // Don't allow unchecking "All" if it's the only one checked
        checkbox.checked = true;
      }
    } else {
      // Individual metric selected
      if (checkbox.checked) {
        // Uncheck "All" when individual is selected
        const allCheckbox = menu ? menu.querySelector('input[value="all"]') : null;
        if (allCheckbox) {
          allCheckbox.checked = false;
        }
        selectedMetrics = selectedMetrics.filter(m => m !== 'all');
        if (!selectedMetrics.includes(value)) {
          selectedMetrics.push(value);
        }
      } else {
        // Remove unchecked metric
        selectedMetrics = selectedMetrics.filter(m => m !== value);
        // If nothing selected, default back to "All"
        if (selectedMetrics.length === 0) {
          selectedMetrics = ['all'];
          const allCheckbox = menu ? menu.querySelector('input[value="all"]') : null;
          if (allCheckbox) {
            allCheckbox.checked = true;
          }
        }
      }
    }

    // Re-render all charts and update value displays
    rerenderAllCharts();
    updateAllValueDisplays();
    updateDropdownLabel();

    // Save state to localStorage
    saveState();
  }

  /**
   * Update the dropdown trigger label to show current selection
   */
  function updateDropdownLabel() {
    const labelEl = document.querySelector('.perf-metric-dropdown__label');
    if (labelEl) {
      labelEl.textContent = getSelectedLabel();
    }
  }

  // =========================================
  // STATE PERSISTENCE
  // =========================================

  /**
   * Save metric selection to localStorage
   */
  function saveState() {
    try {
      localStorage.setItem('perfChartMetrics', JSON.stringify(selectedMetrics));
    } catch (e) {
      console.warn('Could not save perf chart state:', e);
    }
  }

  /**
   * Restore metric selection from localStorage
   */
  function restoreState() {
    try {
      const saved = localStorage.getItem('perfChartMetrics');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          selectedMetrics = parsed;
        }
      }
    } catch (e) {
      console.warn('Could not restore perf chart state:', e);
    }
  }

  // =========================================
  // INITIALIZATION HELPERS
  // =========================================

  /**
   * Calculate max values from data array
   * @param {Array} dataArray - Array of items with civ, cc, atl properties
   */
  function calculateMaxValues(dataArray) {
    maxValues = {
      views: 0,
      clicks: 0,
      adds: 0,
      total: 0
    };

    dataArray.forEach(item => {
      const views = item.civ || 0;
      const clicks = item.cc || 0;
      const adds = item.atl || 0;
      const total = views + clicks + adds;

      if (views > maxValues.views) maxValues.views = views;
      if (clicks > maxValues.clicks) maxValues.clicks = clicks;
      if (adds > maxValues.adds) maxValues.adds = adds;
      if (total > maxValues.total) maxValues.total = total;
    });

    return maxValues;
  }

  /**
   * Initialize all perf charts on the page
   * @param {Object} options - { height, dataArray }
   */
  function initAllCharts(options = {}) {
    const height = options.height || 16;
    const dataArray = options.dataArray || [];
    const scoreOnly = options.scoreOnly || false;

    // Calculate max values if data provided
    if (dataArray.length > 0) {
      calculateMaxValues(dataArray);
    }

    const chartContainers = document.querySelectorAll('.perf-chart[data-views]');
    // Score-only mode scales by max composite across all rendered rows.
    let maxScore = 1;
    if (scoreOnly) {
      chartContainers.forEach(c => {
        const s = parseInt(c.dataset.composite, 10) || 0;
        if (s > maxScore) maxScore = s;
      });
    }

    chartContainers.forEach(container => {
      const data = {
        views: parseInt(container.dataset.views, 10) || 0,
        clicks: parseInt(container.dataset.clicks, 10) || 0,
        adds: parseInt(container.dataset.adds, 10) || 0,
        composite: parseInt(container.dataset.composite, 10) || 0
      };
      const entityName = container.dataset.name || '';

      createChart(container.id, data, {
        height: height,
        maxTotal: scoreOnly ? maxScore : (maxValues.total || 1),
        entityName: entityName,
        scoreOnly: scoreOnly
      });
    });
  }

  // =========================================
  // PUBLIC API
  // =========================================

  // Restore state on load
  restoreState();

  return {
    // Chart functions
    createChart,
    disposeChart,
    disposeAllCharts,
    rerenderAllCharts,
    initAllCharts,
    calculateMaxValues,

    // Dropdown functions
    getDropdownHTML,
    toggleDropdown,
    handleMetricChange,

    // State accessors
    getSelectedMetrics: () => [...selectedMetrics],
    setSelectedMetrics: (metrics) => {
      selectedMetrics = Array.isArray(metrics) ? metrics : ['all'];
      saveState();
    },
    getMaxValues: () => ({ ...maxValues }),

    // Constants
    METRIC_COLORS,
    METRIC_NAMES
  };
})();

// Make available globally
window.PerfCharts = PerfCharts;
