/**
 * ECharts Implementation - Version 4
 * All chart components using ECharts for consistency
 */

class DashboardCharts {
  constructor() {
    this.charts = new Map();
    this.chartColors = [
      // Colors from prototype_001 - exact match
      '#4272D8', // Primary Blue
      '#B8D64D', // Success Green
      '#F39C12', // Warning Amber
      '#E74C3C', // Danger Red
      '#9B59B6', // Accent Purple
      '#06B6D4', // Cyan
      '#84CC16', // Lime
      '#F97316'  // Orange
    ];
  }

  /**
   * Base chart configuration for consistency
   */
  getBaseConfig() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      color: this.chartColors,
      textStyle: {
        fontFamily: 'inherit',
        fontSize: 12
      },
      grid: {
        containLabel: true,
        left: 10,
        right: 10,
        top: 10,
        bottom: 10
      }
    };
  }

  /**
   * Performance Day Chart (ECharts Bar)
   * Implementation in Phase 3A
   */
  createPerformanceDayChart(containerId, data) {
    console.log('📊 Creating Performance Day Chart...');

    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container ${containerId} not found`);
      return null;
    }

    // Dispose existing chart if any
    this.disposeChart(containerId);

    // Initialize ECharts instance
    const chart = echarts.init(container);

    // Prepare data - daily progression with day labels
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const currentDay = data.weeklyMetrics?.daily_progression?.length || 5;
    const dailyData = data.weeklyMetrics?.daily_progression || [32, 38, 45, 51, 55, null, null];

    // Chart configuration
    const option = {
      ...this.getBaseConfig(),
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '8%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: dayLabels,
        axisLine: {
          show: true,
          lineStyle: { color: '#e5e7eb' }
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#6b7280',
          fontSize: 12,
          fontFamily: 'Inter, sans-serif'
        }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#6b7280',
          fontSize: 12,
          fontFamily: 'Inter, sans-serif',
          formatter: '{value}%'
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#f3f4f6',
            type: 'solid'
          }
        }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#ffffff',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: {
          color: '#0f172a',
          fontFamily: 'Inter, sans-serif'
        },
        formatter: function(params) {
          if (params[0] && params[0].value !== null) {
            return `${params[0].axisValue}: ${params[0].value}%`;
          }
          return `${params[0].axisValue}: No data`;
        }
      },
      series: [{
        name: 'Daily Performance',
        type: 'bar',
        data: dailyData.map((value, index) => ({
          value: value,
          itemStyle: {
            color: index < currentDay ? this.chartColors[0] : '#f3f4f6' // Blue for current days, gray for future
          }
        })),
        barWidth: '60%',
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.1)'
          }
        }
      }]
    };

    // Set chart option
    chart.setOption(option);

    // Store chart reference
    this.charts.set(containerId, chart);

    // Handle responsive resize
    const resizeObserver = new ResizeObserver(() => {
      chart.resize();
    });
    resizeObserver.observe(container);

    return chart;
  }

  /**
   * Interaction Rate Donut (ECharts Pie)
   * Implementation in Phase 3B
   */
  createInteractionRateChart(containerId, data) {
    console.log('📊 Creating Interaction Rate Chart...');

    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container ${containerId} not found`);
      return null;
    }

    // Dispose existing chart if any
    this.disposeChart(containerId);

    // Initialize ECharts instance
    const chart = echarts.init(container);

    // Calculate funnel data from promotions
    const promotions = data.promotions || [];
    const totalPromotions = promotions.length;

    // Calculate averages for funnel segments
    let totalViewed = 0;
    let totalClicked = 0;
    let totalAddedToList = 0;

    promotions.forEach(promo => {
      totalViewed += promo.card_in_view || 0;
      totalClicked += promo.card_clicked || 0;
      totalAddedToList += promo.added_to_list || 0;
    });

    // Calculate percentages (4-segment funnel)
    const avgViewed = totalViewed / totalPromotions;
    const avgClicked = totalClicked / totalPromotions;
    const avgAddedToList = totalAddedToList / totalPromotions;

    // 4-segment funnel: Never Viewed, Viewed Only, Clicked Only, Added to List
    const neverViewed = Math.max(0, 100 - avgViewed);
    const viewedOnly = Math.max(0, avgViewed - avgClicked);
    const clickedOnly = Math.max(0, avgClicked - avgAddedToList);
    const addedToList = avgAddedToList;

    const funnelData = [
      {
        name: 'Never Viewed',
        value: Math.round(neverViewed),
        itemStyle: { color: '#f3f4f6' }
      },
      {
        name: 'Viewed Only',
        value: Math.round(viewedOnly),
        itemStyle: { color: this.chartColors[3] } // Red
      },
      {
        name: 'Clicked Only',
        value: Math.round(clickedOnly),
        itemStyle: { color: this.chartColors[2] } // Amber
      },
      {
        name: 'Added to List',
        value: Math.round(addedToList),
        itemStyle: { color: this.chartColors[1] } // Green
      }
    ];

    // Chart configuration
    const option = {
      ...this.getBaseConfig(),
      tooltip: {
        trigger: 'item',
        backgroundColor: '#ffffff',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: {
          color: '#0f172a',
          fontFamily: 'Inter, sans-serif'
        },
        formatter: function(params) {
          return `${params.name}: ${params.value}%<br/>
                  <small style="color: #6b7280">of total user base</small>`;
        }
      },
      legend: {
        orient: 'horizontal',
        bottom: 0,
        left: 'center',
        textStyle: {
          color: '#6b7280',
          fontSize: 12,
          fontFamily: 'Inter, sans-serif'
        },
        itemGap: 20,
        itemWidth: 12,
        itemHeight: 12
      },
      series: [{
        name: 'Interaction Rate',
        type: 'pie',
        radius: ['40%', '70%'], // Donut with hollow center
        center: ['50%', '45%'], // Slightly up to make room for legend
        avoidLabelOverlap: false,
        label: {
          show: false // No center text per requirements
        },
        labelLine: {
          show: false
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.1)'
          }
        },
        data: funnelData
      }]
    };

    // Set chart option
    chart.setOption(option);

    // Store chart reference
    this.charts.set(containerId, chart);

    // Handle responsive resize
    const resizeObserver = new ResizeObserver(() => {
      chart.resize();
    });
    resizeObserver.observe(container);

    return chart;
  }

  /**
   * Size Class Mix Donut (ECharts Pie)
   * Implementation in Phase 3C
   */
  createSizeClassMixChart(containerId, data) {
    console.log('📊 Creating Size Class Mix Chart...');

    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container ${containerId} not found`);
      return null;
    }

    // Dispose existing chart if any
    this.disposeChart(containerId);

    // Initialize ECharts instance
    const chart = echarts.init(container);

    // Calculate size distribution from promotions
    const promotions = data.promotions || [];
    const sizeCount = {};

    promotions.forEach(promo => {
      const size = promo.card_size || 'Unknown';
      sizeCount[size] = (sizeCount[size] || 0) + 1;
    });

    // Convert to percentage and prepare data
    const total = promotions.length;
    const sizeData = Object.entries(sizeCount).map(([size, count], index) => ({
      name: size,
      value: Math.round((count / total) * 100),
      itemStyle: { color: this.chartColors[index % this.chartColors.length] }
    }));

    // Chart configuration
    const option = {
      ...this.getBaseConfig(),
      tooltip: {
        trigger: 'item',
        backgroundColor: '#ffffff',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: {
          color: '#0f172a',
          fontFamily: 'Inter, sans-serif'
        },
        formatter: function(params) {
          return `${params.name}: ${params.value}%<br/>
                  <small style="color: #6b7280">of all promotions</small>`;
        }
      },
      legend: {
        orient: 'horizontal',
        bottom: 0,
        left: 'center',
        textStyle: {
          color: '#6b7280',
          fontSize: 11,
          fontFamily: 'Inter, sans-serif'
        },
        itemGap: 12,
        itemWidth: 10,
        itemHeight: 10
      },
      series: [{
        name: 'Size Class Mix',
        type: 'pie',
        radius: ['35%', '65%'],
        center: ['50%', '42%'],
        avoidLabelOverlap: false,
        label: { show: false },
        labelLine: { show: false },
        emphasis: {
          itemStyle: {
            shadowBlur: 8,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.1)'
          }
        },
        data: sizeData
      }]
    };

    chart.setOption(option);
    this.charts.set(containerId, chart);

    const resizeObserver = new ResizeObserver(() => chart.resize());
    resizeObserver.observe(container);

    return chart;
  }

  /**
   * Size Performance Bars (ECharts Bar)
   * Implementation in Phase 3C
   */
  createSizePerformanceChart(containerId, data) {
    console.log('📊 Creating Size Performance Chart...');

    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container ${containerId} not found`);
      return null;
    }

    // Dispose existing chart if any
    this.disposeChart(containerId);

    // Initialize ECharts instance
    const chart = echarts.init(container);

    // Calculate average performance by size
    const promotions = data.promotions || [];
    const sizePerformance = {};

    promotions.forEach(promo => {
      const size = promo.card_size || 'Unknown';
      if (!sizePerformance[size]) {
        sizePerformance[size] = { scores: [], total: 0, count: 0 };
      }
      sizePerformance[size].scores.push(promo.composite_score || 0);
      sizePerformance[size].total += promo.composite_score || 0;
      sizePerformance[size].count += 1;
    });

    // Calculate averages and prepare data
    const sizeData = Object.entries(sizePerformance).map(([size, perf]) => ({
      size,
      avgScore: Math.round(perf.total / perf.count)
    })).sort((a, b) => b.avgScore - a.avgScore); // Sort by performance

    const sizes = sizeData.map(item => item.size);
    const scores = sizeData.map(item => item.avgScore);

    // Chart configuration
    const option = {
      ...this.getBaseConfig(),
      grid: {
        left: '20%',
        right: '10%',
        bottom: '10%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#6b7280',
          fontSize: 11,
          fontFamily: 'Inter, sans-serif'
        },
        splitLine: {
          show: true,
          lineStyle: { color: '#f3f4f6', type: 'solid' }
        }
      },
      yAxis: {
        type: 'category',
        data: sizes,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#6b7280',
          fontSize: 11,
          fontFamily: 'Inter, sans-serif'
        }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#ffffff',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: {
          color: '#0f172a',
          fontFamily: 'Inter, sans-serif'
        },
        formatter: function(params) {
          return `${params[0].name}: ${params[0].value}<br/>
                  <small style="color: #6b7280">average composite score</small>`;
        }
      },
      series: [{
        name: 'Size Performance',
        type: 'bar',
        data: scores.map(score => ({
          value: score,
          itemStyle: { color: this.chartColors[0] }
        })),
        barWidth: '60%',
        emphasis: {
          itemStyle: {
            shadowBlur: 8,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.1)'
          }
        }
      }]
    };

    chart.setOption(option);
    this.charts.set(containerId, chart);

    const resizeObserver = new ResizeObserver(() => chart.resize());
    resizeObserver.observe(container);

    return chart;
  }

  /**
   * Deal Type Preference Donut (ECharts Pie)
   * Implementation in Phase 3C
   */
  createDealTypeChart(containerId, data) {
    console.log('📊 Creating Deal Type Preference Chart...');

    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container ${containerId} not found`);
      return null;
    }

    // Dispose existing chart if any
    this.disposeChart(containerId);

    // Initialize ECharts instance
    const chart = echarts.init(container);

    // Calculate deal type distribution from promotions
    const promotions = data.promotions || [];
    const dealTypeCount = {};

    promotions.forEach(promo => {
      const dealType = promo.deal_type || 'Unknown';
      dealTypeCount[dealType] = (dealTypeCount[dealType] || 0) + 1;
    });

    // Convert to percentage and prepare data
    const total = promotions.length;
    const dealData = Object.entries(dealTypeCount).map(([dealType, count], index) => ({
      name: this.formatDealType(dealType),
      value: Math.round((count / total) * 100),
      itemStyle: { color: this.chartColors[index % this.chartColors.length] }
    }));

    // Chart configuration
    const option = {
      ...this.getBaseConfig(),
      tooltip: {
        trigger: 'item',
        backgroundColor: '#ffffff',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: {
          color: '#0f172a',
          fontFamily: 'Inter, sans-serif'
        },
        formatter: function(params) {
          return `${params.name}: ${params.value}%<br/>
                  <small style="color: #6b7280">of all promotions</small>`;
        }
      },
      legend: {
        orient: 'horizontal',
        bottom: 0,
        left: 'center',
        textStyle: {
          color: '#6b7280',
          fontSize: 11,
          fontFamily: 'Inter, sans-serif'
        },
        itemGap: 12,
        itemWidth: 10,
        itemHeight: 10
      },
      series: [{
        name: 'Deal Type Preference',
        type: 'pie',
        radius: ['35%', '65%'],
        center: ['50%', '42%'],
        avoidLabelOverlap: false,
        label: { show: false },
        labelLine: { show: false },
        emphasis: {
          itemStyle: {
            shadowBlur: 8,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.1)'
          }
        },
        data: dealData
      }]
    };

    chart.setOption(option);
    this.charts.set(containerId, chart);

    const resizeObserver = new ResizeObserver(() => chart.resize());
    resizeObserver.observe(container);

    return chart;
  }

  /**
   * Format deal type for display
   */
  formatDealType(dealType) {
    const typeMap = {
      'fixed_price': 'Fixed Price',
      'club_price': 'Club Price',
      'limit_quantity': 'Limit Quantity',
      'per_pound': 'Per Pound',
      'Multi-Buy': 'Multi-Buy',
      'Buy 2 Get 1': 'Buy 2 Get 1',
      '% Off': '% Off',
      '$ Off': '$ Off',
      'BOGO': 'BOGO'
    };
    return typeMap[dealType] || dealType;
  }

  /**
   * Dispose chart and remove from registry
   */
  disposeChart(chartId) {
    const chart = this.charts.get(chartId);
    if (chart) {
      chart.dispose();
      this.charts.delete(chartId);
    }
  }

  /**
   * Resize all charts
   */
  resizeAll() {
    this.charts.forEach(chart => {
      if (chart && typeof chart.resize === 'function') {
        chart.resize();
      }
    });
  }
}