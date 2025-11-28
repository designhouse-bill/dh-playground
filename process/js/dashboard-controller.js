/**
 * Enhanced Dashboard Controller - Prototype_003
 * Orchestrates the sophisticated analytics dashboard with real-world data patterns
 */

class DashboardController {
  constructor() {
    this.dataService = new DataService();
    this.currentWeek = 'w36';
    this.currentFilters = {
      store_id: 'all',
      category: 'all'
    };
    this.components = {};
    this.isLoading = false;
    this.loadingIndicator = null;
    this.errorDisplay = null;
  }

  /**
   * Initialize the dashboard
   */
  async init() {
    console.log('🚀 Initializing Enhanced Analytics Dashboard...');

    try {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        await new Promise(resolve => {
          document.addEventListener('DOMContentLoaded', resolve);
        });
      }

      // Initialize UI components
      this.initializeUIComponents();

      // Set up event listeners
      this.setupEventListeners();

      // Initialize tooltip system
      if (window.TooltipSystem) {
        window.TooltipSystem.init();
      }

      // Load initial data
      await this.loadDashboardData();

      console.log('✅ Dashboard initialized successfully');

    } catch (error) {
      console.error('❌ Dashboard initialization failed:', error);
      this.showError('Failed to initialize dashboard', error.message);
    }
  }

  /**
   * Initialize UI components and references
   */
  initializeUIComponents() {
    // Get UI element references
    this.loadingIndicator = document.getElementById('loading-indicator');
    this.errorDisplay = document.getElementById('error-display');

    // Initialize filter controls
    this.weekSelect = document.getElementById('week-select');
    this.storeSelect = document.getElementById('store-select');
    this.categorySelect = document.getElementById('category-select');
    this.refreshBtn = document.getElementById('refresh-btn');

    // Set initial values
    if (this.weekSelect) this.weekSelect.value = this.currentWeek;
    if (this.storeSelect) this.storeSelect.value = this.currentFilters.store_id;
    if (this.categorySelect) this.categorySelect.value = this.currentFilters.category;

    // Validate required elements
    const requiredElements = [
      'week-performance-tile',
      'top-categories-tile',
      'alerts-tile',
      'trend-tile',
      'quick-wins-tile',
      'share-activity-tile'
    ];

    requiredElements.forEach(id => {
      const element = document.getElementById(id);
      if (!element) {
        console.warn(`⚠️ Required element not found: ${id}`);
      }
    });
  }

  /**
   * Set up event listeners for dashboard interactions
   */
  setupEventListeners() {
    // Week selector
    if (this.weekSelect) {
      this.weekSelect.addEventListener('change', (e) => {
        this.changeWeek(e.target.value);
      });
    }

    // Store filter
    if (this.storeSelect) {
      this.storeSelect.addEventListener('change', (e) => {
        this.updateFilter('store_id', e.target.value);
      });
    }

    // Category filter
    if (this.categorySelect) {
      this.categorySelect.addEventListener('change', (e) => {
        this.updateFilter('category', e.target.value);
      });
    }

    // Refresh button
    if (this.refreshBtn) {
      this.refreshBtn.addEventListener('click', () => {
        this.refreshDashboard();
      });
    }

    // Error retry button
    const retryBtn = document.getElementById('retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        this.hideError();
        this.refreshDashboard();
      });
    }

    // KPI tile click handlers for drill-down
    this.setupTileClickHandlers();

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'r' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        this.refreshDashboard();
      }
    });
  }

  /**
   * Set up click handlers for KPI tiles (drill-down navigation)
   */
  setupTileClickHandlers() {
    const tileConfigs = [
      { id: 'week-performance-tile', filter: 'week-performance' },
      { id: 'top-categories-tile', filter: 'categories' },
      { id: 'alerts-tile', filter: 'underperforming' },
      { id: 'trend-tile', filter: 'trends' },
      { id: 'quick-wins-tile', filter: 'optimization' },
      { id: 'share-activity-tile', filter: 'sharing' }
    ];

    tileConfigs.forEach(config => {
      const tile = document.getElementById(config.id);
      if (tile) {
        tile.addEventListener('click', (e) => {
          // Don't trigger on info button clicks
          if (e.target.classList.contains('info-btn')) return;

          this.drillDownToInquiry(config.filter);
        });

        // Add cursor pointer to indicate clickability
        tile.style.cursor = 'pointer';
      }
    });
  }

  /**
   * Load all dashboard data
   */
  async loadDashboardData() {
    if (this.isLoading) return;

    try {
      this.showLoading('Loading dashboard data...');
      this.isLoading = true;

      // Build filters for data request
      const filters = {
        week_id: this.currentWeek,
        limit: 1000 // Get more data for accurate calculations
      };

      if (this.currentFilters.store_id !== 'all') {
        filters.store_id = this.currentFilters.store_id;
      }

      if (this.currentFilters.category !== 'all') {
        filters.category = this.currentFilters.category;
      }

      // Load data in parallel for better performance
      const [kpiData, insightsData] = await Promise.all([
        this.dataService.getDashboardKPIs(this.currentWeek),
        this.loadInsightsData()
      ]);

      // Render all components
      await this.renderDashboard(kpiData, insightsData);

      // Update week status display
      this.updateWeekStatus();

      this.hideLoading();

    } catch (error) {
      console.error('❌ Failed to load dashboard data:', error);
      this.hideLoading();
      this.showError('Failed to load dashboard data', error.message);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Load insights data for the enhanced insights section
   */
  async loadInsightsData() {
    try {
      const [categoryData, storeData, sizeData] = await Promise.all([
        this.dataService.getCategoryAnalytics(this.currentWeek),
        this.dataService.getStoreAnalytics(this.currentWeek),
        this.dataService.getSizeAnalytics(this.currentWeek)
      ]);

      return {
        categories: categoryData,
        stores: storeData,
        sizes: sizeData
      };
    } catch (error) {
      console.warn('⚠️ Failed to load insights data:', error);
      return null;
    }
  }

  /**
   * Render the entire dashboard
   */
  async renderDashboard(kpiData, insightsData) {
    try {
      // Render KPI tiles with realistic data
      await this.renderKPITiles(kpiData);

      // Render insights section
      if (insightsData) {
        this.renderInsights(insightsData);
      }

      console.log('✅ Dashboard rendered successfully');

    } catch (error) {
      console.error('❌ Failed to render dashboard:', error);
      throw error;
    }
  }

  /**
   * Render all KPI tiles
   */
  async renderKPITiles(data) {
    // Week Performance
    this.renderWeekPerformance(data.weekPerformance);

    // Top Categories
    this.renderTopCategories(data.topCategories);

    // Alerts
    this.renderAlerts(data.alerts);

    // Trend Chart
    await this.renderTrendChart(data.dailyTrend);

    // Quick Wins
    this.renderQuickWins(data.quickWin);

    // Share Activity
    this.renderShareActivity(data.shareActivity);
  }

  /**
   * Render week performance tile
   */
  renderWeekPerformance(data) {
    const valueEl = document.getElementById('week-performance-value');
    const changeEl = document.getElementById('week-performance-change');
    const contextEl = document.getElementById('week-performance-context');

    if (valueEl) valueEl.textContent = data.current;

    if (changeEl) {
      const changeText = data.change > 0 ? `+${data.change}%` : `${data.change}%`;
      changeEl.textContent = `${changeText} vs last week`;
      changeEl.className = `change-indicator ${data.status}`;
    }

    if (contextEl) {
      const weekNum = this.currentWeek.replace('w', '');
      contextEl.textContent = `Week ${weekNum} performance analysis`;
    }
  }

  /**
   * Render top categories tile
   */
  renderTopCategories(categories) {
    const listEl = document.getElementById('top-categories-list');
    const summaryEl = document.getElementById('category-summary');

    if (!listEl) return;

    listEl.innerHTML = '';

    categories.forEach((category, index) => {
      const item = document.createElement('div');
      item.className = 'category-item';

      const changeClass = category.change > 0 ? 'positive' : category.change < 0 ? 'negative' : 'neutral';
      const changeText = category.change > 0 ? `+${category.change}%` : `${category.change}%`;

      item.innerHTML = `
        <div class="category-name">${index + 1}. ${category.name}</div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <div class="category-score">${category.score}</div>
          <div class="category-change ${changeClass}">${changeText}</div>
        </div>
      `;

      listEl.appendChild(item);
    });

    if (summaryEl) {
      const topCategory = categories[0];
      summaryEl.textContent = `${topCategory.name} leads with ${topCategory.score} engagement score`;
    }
  }

  /**
   * Render alerts tile
   */
  renderAlerts(alerts) {
    const countEl = document.getElementById('alert-count');
    const descEl = document.getElementById('alert-description');
    const itemsEl = document.getElementById('alert-items');

    if (countEl) {
      countEl.textContent = alerts.count === 0 ? 'No Alerts' : `${alerts.count} Alert${alerts.count > 1 ? 's' : ''}`;
    }

    if (descEl) {
      descEl.textContent = alerts.count === 0
        ? 'All categories performing above threshold'
        : `Categories need immediate attention`;
    }

    if (itemsEl) {
      itemsEl.innerHTML = '';

      if (alerts.count === 0) {
        const noAlerts = document.createElement('div');
        noAlerts.className = 'alert-item';
        noAlerts.style.background = 'var(--green-light)';
        noAlerts.style.color = 'var(--green)';
        noAlerts.style.borderColor = 'var(--green)';
        noAlerts.innerHTML = '✓ All categories performing well';
        itemsEl.appendChild(noAlerts);
      } else {
        alerts.items.forEach(item => {
          const alertDiv = document.createElement('div');
          alertDiv.className = 'alert-item';
          alertDiv.innerHTML = `
            <span>⚠️</span>
            <strong>${item.name}</strong>
            scoring ${item.score}/${item.threshold}
          `;
          itemsEl.appendChild(alertDiv);
        });
      }
    }
  }

  /**
   * Render trend chart
   */
  async renderTrendChart(trendData) {
    const chartEl = document.getElementById('trend-chart');
    const summaryEl = document.getElementById('trend-summary');

    if (!chartEl || !window.echarts) return;

    try {
      // Clear loading placeholder
      chartEl.innerHTML = '';

      const chart = echarts.init(chartEl);

      const option = {
        grid: {
          top: 20,
          bottom: 30,
          left: 40,
          right: 20
        },
        xAxis: {
          type: 'category',
          data: trendData.labels,
          axisLine: { lineStyle: { color: '#e2e8f0' } },
          axisTick: { lineStyle: { color: '#e2e8f0' } },
          axisLabel: { color: '#64748b', fontSize: 12 }
        },
        yAxis: {
          type: 'value',
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: '#64748b', fontSize: 12 },
          splitLine: { lineStyle: { color: '#f1f5f9' } }
        },
        series: [{
          type: 'line',
          data: trendData.values,
          smooth: true,
          lineStyle: { color: '#8b5cf6', width: 3 },
          itemStyle: { color: '#8b5cf6' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(139, 92, 246, 0.3)' },
                { offset: 1, color: 'rgba(139, 92, 246, 0.05)' }
              ]
            }
          },
          symbol: 'circle',
          symbolSize: 6
        }],
        tooltip: {
          trigger: 'axis',
          backgroundColor: '#fff',
          borderColor: '#e2e8f0',
          textStyle: { color: '#0f172a' }
        }
      };

      chart.setOption(option);

      // Handle resize
      const resizeHandler = () => chart.resize();
      window.addEventListener('resize', resizeHandler);

      if (summaryEl) {
        const startValue = trendData.values[0];
        const endValue = trendData.values[trendData.values.length - 1];
        const growth = ((endValue - startValue) / startValue * 100).toFixed(1);
        summaryEl.textContent = `${growth > 0 ? '+' : ''}${growth}% growth this week`;
      }

    } catch (error) {
      console.error('Failed to render trend chart:', error);
      chartEl.innerHTML = '<div class="loading-placeholder">Chart unavailable</div>';
    }
  }

  /**
   * Render quick wins tile
   */
  renderQuickWins(quickWin) {
    const contentEl = document.getElementById('quick-win-content');
    const actionsEl = document.getElementById('opportunity-actions');

    if (contentEl) {
      contentEl.innerHTML = `
        <div class="quick-win-insight">${quickWin.insight}</div>
        <div class="quick-win-action">→ ${quickWin.action}</div>
      `;
    }

    if (actionsEl) {
      actionsEl.innerHTML = `
        <button class="action-btn" onclick="window.location.href='../inquiry.html?filter=optimization'">
          View Optimization Details →
        </button>
      `;
    }
  }

  /**
   * Render share activity tile
   */
  renderShareActivity(shareData) {
    const valueEl = document.getElementById('share-activity-value');
    const changeEl = document.getElementById('share-activity-change');
    const breakdownEl = document.getElementById('share-breakdown');

    if (valueEl) valueEl.textContent = shareData.current.toLocaleString();

    if (changeEl) {
      const changeText = shareData.change > 0 ? `+${shareData.change}%` : `${shareData.change}%`;
      changeEl.textContent = `${changeText} vs last week`;
      changeEl.className = `change-indicator ${shareData.change > 0 ? 'positive' : shareData.change < 0 ? 'negative' : 'neutral'}`;
    }

    if (breakdownEl) {
      const openRate = Math.round(shareData.current * 0.75);
      const conversionRate = Math.round(shareData.current * 0.18);

      breakdownEl.innerHTML = `
        <div class="share-stat">
          <span>Share Opens:</span>
          <strong>${openRate.toLocaleString()}</strong>
        </div>
        <div class="share-stat">
          <span>Conversions:</span>
          <strong>${conversionRate.toLocaleString()}</strong>
        </div>
      `;
    }
  }

  /**
   * Render insights section
   */
  renderInsights(data) {
    // Category insight
    const categoryInsight = document.getElementById('category-insight');
    if (categoryInsight && data.categories) {
      const topCategory = data.categories.categories[0];
      const insight = categoryInsight.querySelector('.insight-content');
      if (insight && topCategory) {
        insight.innerHTML = `
          <strong>${topCategory.name}</strong> is performing best with
          <span style="color: var(--green); font-weight: 600;">${topCategory.avg_engagement_score.toFixed(1)}</span>
          average engagement score across ${topCategory.promotion_count} promotions.
        `;
      }
    }

    // Size insight
    const sizeInsight = document.getElementById('size-insight');
    if (sizeInsight && data.sizes) {
      const bestSize = data.sizes.sort((a, b) => b.efficiency_score - a.efficiency_score)[0];
      const insight = sizeInsight.querySelector('.insight-content');
      if (insight && bestSize) {
        insight.innerHTML = `
          <strong>${bestSize.size_code}</strong> cards offer best ROI with
          <span style="color: var(--blue); font-weight: 600;">${bestSize.efficiency_score.toFixed(1)}</span>
          efficiency score per footprint unit.
        `;
      }
    }

    // Store insight
    const storeInsight = document.getElementById('store-insight');
    if (storeInsight && data.stores) {
      const topStore = data.stores.sort((a, b) => b.avg_engagement_score - a.avg_engagement_score)[0];
      const insight = storeInsight.querySelector('.insight-content');
      if (insight && topStore) {
        insight.innerHTML = `
          <strong>${topStore.store_name}</strong> leads store performance with
          <span style="color: var(--purple); font-weight: 600;">${topStore.avg_engagement_score.toFixed(1)}</span>
          average engagement score.
        `;
      }
    }
  }

  /**
   * Change active week
   */
  async changeWeek(weekId) {
    if (weekId === this.currentWeek) return;

    console.log(`📅 Changing from ${this.currentWeek} to ${weekId}`);
    this.currentWeek = weekId;

    // Clear cache for new week
    this.dataService.clearCache();

    // Reload data
    await this.loadDashboardData();
  }

  /**
   * Update filter and reload
   */
  async updateFilter(filterName, value) {
    if (this.currentFilters[filterName] === value) return;

    console.log(`🔽 Updating filter ${filterName}: ${value}`);
    this.currentFilters[filterName] = value;

    // Reload data with new filters
    await this.loadDashboardData();
  }

  /**
   * Refresh dashboard data
   */
  async refreshDashboard() {
    console.log('🔄 Refreshing dashboard...');

    // Clear all caches
    this.dataService.clearCache();

    // Reload data
    await this.loadDashboardData();
  }

  /**
   * Update week status display
   */
  updateWeekStatus() {
    const weekStatus = document.getElementById('week-status');
    if (weekStatus) {
      const weekNumber = this.currentWeek.replace('w', '');
      weekStatus.textContent = `Week ${weekNumber}, 2024`;
    }
  }

  /**
   * Navigate to inquiry page with filters
   */
  drillDownToInquiry(filter) {
    const params = new URLSearchParams({
      filter: filter,
      week: this.currentWeek,
      source: 'dashboard'
    });

    if (this.currentFilters.store_id !== 'all') {
      params.set('store', this.currentFilters.store_id);
    }

    if (this.currentFilters.category !== 'all') {
      params.set('category', this.currentFilters.category);
    }

    window.location.href = `../inquiry.html?${params.toString()}`;
  }

  /**
   * Show loading indicator
   */
  showLoading(message = 'Loading...') {
    if (this.loadingIndicator) {
      const messageEl = this.loadingIndicator.querySelector('span');
      if (messageEl) messageEl.textContent = message;
      this.loadingIndicator.classList.remove('hidden');
    }
  }

  /**
   * Hide loading indicator
   */
  hideLoading() {
    if (this.loadingIndicator) {
      this.loadingIndicator.classList.add('hidden');
    }
  }

  /**
   * Show error message
   */
  showError(title, message) {
    if (this.errorDisplay) {
      const titleEl = this.errorDisplay.querySelector('h4');
      const messageEl = this.errorDisplay.querySelector('p');

      if (titleEl) titleEl.textContent = title;
      if (messageEl) messageEl.textContent = message;

      this.errorDisplay.classList.remove('hidden');

      // Auto-hide after 10 seconds
      setTimeout(() => {
        this.hideError();
      }, 10000);
    }
  }

  /**
   * Hide error message
   */
  hideError() {
    if (this.errorDisplay) {
      this.errorDisplay.classList.add('hidden');
    }
  }

  /**
   * Get current dashboard state
   */
  getState() {
    return {
      currentWeek: this.currentWeek,
      currentFilters: this.currentFilters,
      isLoading: this.isLoading
    };
  }
}

// Initialize dashboard when DOM is ready
const dashboard = new DashboardController();
dashboard.init();

// Export for global access
window.Dashboard = dashboard;