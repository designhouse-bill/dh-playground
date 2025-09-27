/**
 * Trend Chart Component
 * Handles KPI 4: Current Week Trend visualization
 */

const TrendChartComponent = {

  element: null,
  chartElement: null,
  chart: null,

  /**
   * Initialize component
   */
  init() {
    this.element = document.getElementById('trend-tile');
    this.chartElement = document.getElementById('trend-chart');

    if (!this.element || !this.chartElement) {
      console.warn('Trend Chart component elements not found');
      return false;
    }

    if (!window.echarts) {
      console.warn('ECharts library not found');
      return false;
    }

    return true;
  },

  /**
   * Render component with data
   */
  render(data) {
    if (!this.init()) return;

    const formatted = DataFormatter.formatTrendData(data);

    // Initialize chart if not already done
    if (!this.chart) {
      this.chart = echarts.init(this.chartElement);
    }

    // Configure chart options
    const option = {
      grid: {
        top: 10,
        bottom: 25,
        left: 30,
        right: 10
      },
      xAxis: {
        type: 'category',
        data: formatted.labels,
        axisLine: {
          lineStyle: { color: '#e5e7eb' }
        },
        axisTick: {
          lineStyle: { color: '#e5e7eb' }
        },
        axisLabel: {
          color: '#6b7280',
          fontSize: 11
        }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#6b7280',
          fontSize: 11
        },
        splitLine: {
          lineStyle: { color: '#f3f4f6' }
        }
      },
      series: [{
        type: 'line',
        data: formatted.values,
        smooth: true,
        lineStyle: {
          color: this.getTrendColor(formatted.direction),
          width: 3
        },
        itemStyle: {
          color: this.getTrendColor(formatted.direction)
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: this.getTrendColor(formatted.direction, 0.3) },
              { offset: 1, color: this.getTrendColor(formatted.direction, 0.05) }
            ]
          }
        },
        symbol: 'circle',
        symbolSize: 6,
        emphasis: {
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 2
          }
        }
      }],
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#fff',
        borderColor: '#e5e7eb',
        textStyle: { color: '#0f172a' },
        formatter: function(params) {
          const data = params[0];
          return `${data.name}: ${data.value} engagement score`;
        }
      }
    };

    // Set chart option
    this.chart.setOption(option);

    // Handle resize
    window.addEventListener('resize', () => {
      if (this.chart) {
        this.chart.resize();
      }
    });

    // Add click handler for drill-down
    this.element.addEventListener('click', () => {
      this.handleClick();
    });
  },

  /**
   * Get color based on trend direction
   */
  getTrendColor(direction, opacity = 1) {
    const colors = {
      positive: `rgba(184, 214, 77, ${opacity})`, // --green
      negative: `rgba(239, 68, 68, ${opacity})`,  // --red
      neutral: `rgba(66, 114, 216, ${opacity})`   // --blue
    };

    return colors[direction] || colors.neutral;
  },

  /**
   * Handle tile click for drill-down
   */
  handleClick() {
    // Navigate to inquiry with trend filter
    const url = new URL('inquiry.html', window.location.origin);
    url.searchParams.set('filter', 'trends');
    window.location.href = url.toString();
  },

  /**
   * Update with new data (for week changes)
   */
  update(data) {
    this.render(data);
  },

  /**
   * Cleanup chart instance
   */
  destroy() {
    if (this.chart) {
      this.chart.dispose();
      this.chart = null;
    }
  }
};

// Export for global access
window.TrendChartComponent = TrendChartComponent;