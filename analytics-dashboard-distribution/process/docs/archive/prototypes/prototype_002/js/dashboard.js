/**
 * Dashboard Main Controller
 * Orchestrates the 6-KPI dashboard initialization and data flow
 */

const Dashboard = {

  currentWeek: 'w36',
  currentData: null,
  components: {},

  /**
   * Initialize dashboard
   */
  init() {
    // Wait for DOM and dependencies
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initialize());
    } else {
      this.initialize();
    }
  },

  /**
   * Main initialization logic
   */
  initialize() {
    console.log('Initializing Analytics Dashboard...');

    // Initialize components
    this.initializeComponents();

    // Set up week selector
    this.initializeWeekSelector();

    // Load initial data
    this.loadData(this.currentWeek);

    console.log('Dashboard initialized successfully');
  },

  /**
   * Initialize all KPI components
   */
  initializeComponents() {
    this.components = {
      weekPerformance: WeekPerformanceComponent,
      topCategories: TopCategoriesComponent,
      alerts: AlertsComponent,
      trendChart: TrendChartComponent,
      quickWins: QuickWinsComponent,
      shareActivity: ShareActivityComponent
    };

    // Initialize each component
    Object.values(this.components).forEach(component => {
      if (component.init) {
        component.init();
      }
    });
  },

  /**
   * Set up week selector functionality
   */
  initializeWeekSelector() {
    const weekSelect = document.getElementById('week-select');

    if (weekSelect) {
      weekSelect.value = this.currentWeek;
      weekSelect.addEventListener('change', (e) => {
        this.changeWeek(e.target.value);
      });
    }
  },

  /**
   * Load data for specific week
   */
  loadData(weekId) {
    console.log(`Loading data for ${weekId}...`);

    try {
      // Get data from data layer
      this.currentData = window.getWeekData(weekId);
      this.currentWeek = weekId;

      // Update week status display
      this.updateWeekStatus(weekId);

      // Render all components
      this.renderComponents();

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.showError('Failed to load dashboard data');
    }
  },

  /**
   * Update week status in header
   */
  updateWeekStatus(weekId) {
    const weekStatus = document.getElementById('week-status');
    const weekSelect = document.getElementById('week-select');

    if (weekStatus) {
      const weekNumber = weekId.replace('w', '');
      weekStatus.textContent = `Week ${weekNumber}, 2024`;
    }

    if (weekSelect) {
      weekSelect.value = weekId;
    }
  },

  /**
   * Render all dashboard components
   */
  renderComponents() {
    if (!this.currentData) {
      console.warn('No data available for rendering');
      return;
    }

    try {
      // Render each KPI component with appropriate data
      this.components.weekPerformance.render(this.currentData.weekPerformance);
      this.components.topCategories.render(this.currentData.topCategories);
      this.components.alerts.render(this.currentData.alerts);
      this.components.trendChart.render(this.currentData.dailyTrend);
      this.components.quickWins.render(this.currentData.quickWin);
      this.components.shareActivity.render(this.currentData.shares);

      console.log('All components rendered successfully');

    } catch (error) {
      console.error('Error rendering components:', error);
      this.showError('Failed to render dashboard components');
    }
  },

  /**
   * Change to different week
   */
  changeWeek(weekId) {
    if (weekId === this.currentWeek) return;

    console.log(`Changing from ${this.currentWeek} to ${weekId}`);
    this.loadData(weekId);
  },

  /**
   * Refresh current week data
   */
  refresh() {
    console.log('Refreshing dashboard data...');
    this.loadData(this.currentWeek);
  },

  /**
   * Show error message to user
   */
  showError(message) {
    // Simple error display - could be enhanced with toast notifications
    console.error(message);

    // Try to show error in a user-friendly way
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--red);
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      z-index: 10000;
      font-family: inherit;
      font-size: 14px;
      box-shadow: var(--shadow);
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 5000);
  },

  /**
   * Get current dashboard state
   */
  getState() {
    return {
      currentWeek: this.currentWeek,
      currentData: this.currentData,
      isInitialized: Object.keys(this.components).length > 0
    };
  }
};

// Auto-initialize dashboard
Dashboard.init();

// Export for global access
window.Dashboard = Dashboard;