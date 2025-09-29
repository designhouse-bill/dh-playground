/**
 * Analytics Dashboard - Version 4
 * Clean, stable implementation with ECharts integration
 */

class AnalyticsDashboard {
  constructor() {
    this.currentPage = 'index';
    this.currentContext = {
      scope: 'all_stores',
      period: 'w36',
      user: { role: 'General Manager' }
    };
    this.isInitialized = false;
    this.charts = new Map(); // Store ECharts instances
  }

  /**
   * Initialize the dashboard - single entry point
   */
  async init() {
    // Prevent multiple initialization
    if (this.isInitialized) {
      console.log('⚠️ Dashboard already initialized');
      return;
    }

    console.log('🚀 Initializing Analytics Dashboard v4...');

    try {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        await new Promise(resolve => {
          document.addEventListener('DOMContentLoaded', resolve);
        });
      }

      // Initialize components in sequence
      await this.loadDashboardContent();

      // Set up event handlers after loading
      this.initializeEventHandlers();

      // Mark as initialized
      this.isInitialized = true;

      console.log('✅ Dashboard v4 initialized successfully');

    } catch (error) {
      console.error('❌ Dashboard initialization failed:', error);
    }
  }

  /**
   * Load all dashboard content - no duplications
   */
  async loadDashboardContent() {
    console.log('📊 Loading dashboard content...');

    try {
      // Initialize charts component
      this.chartsComponent = new DashboardCharts();

      // Load data (from 004-data.js)
      const data = window.mockDatabase || {};

      // Phase 3A: Create Performance Day Chart
      this.createPerformanceDayChart(data);

      // Phase 3B: Create Interaction Rate Chart
      this.createInteractionRateChart(data);

      // Phase 3C: Create Size & Deal Charts
      this.createSizeAndDealCharts(data);

    } catch (error) {
      console.error('Error loading dashboard content:', error);
    }
  }

  /**
   * Create Performance Day Chart (Phase 3A)
   */
  createPerformanceDayChart(data) {
    console.log('📊 Creating Performance Day Chart...');

    if (this.chartsComponent) {
      const chart = this.chartsComponent.createPerformanceDayChart('performance-day-chart', data);
      if (chart) {
        console.log('✅ Performance Day Chart created successfully');
      }
    }
  }

  /**
   * Create Interaction Rate Chart (Phase 3B)
   */
  createInteractionRateChart(data) {
    console.log('📊 Creating Interaction Rate Chart...');

    if (this.chartsComponent) {
      const chart = this.chartsComponent.createInteractionRateChart('interaction-rate-chart', data);
      if (chart) {
        console.log('✅ Interaction Rate Chart created successfully');
      }
    }
  }

  /**
   * Create Size & Deal Charts (Phase 3C)
   */
  createSizeAndDealCharts(data) {
    console.log('📊 Creating Size & Deal Charts...');

    if (this.chartsComponent) {
      // Size Class Mix donut chart
      const sizeClassChart = this.chartsComponent.createSizeClassMixChart('size-mix-chart', data);
      if (sizeClassChart) {
        console.log('✅ Size Class Mix Chart created successfully');
      }

      // Size Performance horizontal bars
      const sizePerformanceChart = this.chartsComponent.createSizePerformanceChart('size-performance-chart', data);
      if (sizePerformanceChart) {
        console.log('✅ Size Performance Chart created successfully');
      }

      // Deal Type Preference donut chart
      const dealTypeChart = this.chartsComponent.createDealTypeChart('deal-type-chart', data);
      if (dealTypeChart) {
        console.log('✅ Deal Type Preference Chart created successfully');
      }
    }
  }

  /**
   * Initialize event handlers after content is loaded
   */
  initializeEventHandlers() {
    console.log('🔗 Setting up event handlers...');

    // Initialize tooltip functionality
    this.initKpiTooltips();

    // Phase 4A: Initialize header controls
    this.initializeHeaderControls();

    // Initialize navigation functionality
    this.initializeNavigation();

    // Chart interactions are handled by individual chart components
  }

  /**
   * Initialize header controls (Phase 4A)
   */
  initializeHeaderControls() {
    console.log('🔗 Setting up header controls...');

    // Initialize dropdown options from data
    this.populateHeaderDropdowns();

    // Set up event listeners for header controls
    this.setupHeaderEventListeners();

    // Update header status display
    this.updateHeaderStatus();
  }

  /**
   * Populate header dropdown options from data
   */
  populateHeaderDropdowns() {
    const data = window.mockDatabase || {};

    // Populate week selector with recent weeks
    this.populateWeekSelector();

    // Populate version selector from promotion data
    this.populateVersionSelector(data);

    // Populate store selector from store codes
    this.populateStoreSelector(data);
  }

  /**
   * Populate week selector with recent weeks
   */
  populateWeekSelector() {
    const weekSelect = document.getElementById('week-select');
    if (!weekSelect) return;

    // Generate last 8 weeks from current week (40)
    const currentWeek = 40;
    const weeks = [];

    for (let i = 0; i < 8; i++) {
      const weekNum = currentWeek - i;
      const startDate = this.getWeekStartDate(weekNum);
      const endDate = this.getWeekEndDate(weekNum);
      const isCurrentWeek = weekNum === currentWeek;

      weeks.push({
        value: `w${weekNum}`,
        label: `Week ${weekNum}: ${startDate} - ${endDate}${isCurrentWeek ? ' (Current)' : ''}`,
        week: weekNum
      });
    }

    // Clear existing options and add new ones
    weekSelect.innerHTML = '';
    weeks.forEach(week => {
      const option = document.createElement('option');
      option.value = week.value;
      option.textContent = week.label;
      if (week.week === currentWeek) {
        option.selected = true;
      }
      weekSelect.appendChild(option);
    });
  }

  /**
   * Populate version selector from promotion data
   */
  populateVersionSelector(data) {
    const versionSelect = document.getElementById('version-select');
    if (!versionSelect) return;

    // Extract unique versions from promotions
    const versions = new Set();
    (data.promotions || []).forEach(promo => {
      if (promo.version) {
        versions.add(promo.version);
      }
    });

    // Clear existing options and add new ones
    versionSelect.innerHTML = '<option value="all">All Versions</option>';
    Array.from(versions).sort().forEach(version => {
      const option = document.createElement('option');
      option.value = version;
      option.textContent = `Version ${version}`;
      versionSelect.appendChild(option);
    });
  }

  /**
   * Populate store selector from store codes
   */
  populateStoreSelector(data) {
    const storeSelect = document.getElementById('store-select');
    if (!storeSelect) return;

    // Extract unique store codes from promotions
    const stores = new Set();
    (data.promotions || []).forEach(promo => {
      if (promo.store_codes && Array.isArray(promo.store_codes)) {
        promo.store_codes.forEach(code => stores.add(code));
      }
    });

    // Clear existing options and add new ones
    storeSelect.innerHTML = '<option value="all">All Stores</option>';
    Array.from(stores).sort().forEach(store => {
      const option = document.createElement('option');
      option.value = store;
      option.textContent = `Store ${store}`;
      storeSelect.appendChild(option);
    });
  }

  /**
   * Set up event listeners for header controls
   */
  setupHeaderEventListeners() {
    const weekSelect = document.getElementById('week-select');
    const versionSelect = document.getElementById('version-select');
    const storeSelect = document.getElementById('store-select');

    // Week selection change
    if (weekSelect) {
      weekSelect.addEventListener('change', (e) => {
        console.log('📅 Week changed to:', e.target.value);
        this.updateContext('period', e.target.value);
        this.updateHeaderStatus();
      });
    }

    // Version selection change
    if (versionSelect) {
      versionSelect.addEventListener('change', (e) => {
        console.log('📋 Version changed to:', e.target.value);
        this.updateContext('version', e.target.value);
      });
    }

    // Store selection change
    if (storeSelect) {
      storeSelect.addEventListener('change', (e) => {
        console.log('🏪 Store changed to:', e.target.value);
        this.updateContext('scope', e.target.value);
      });
    }
  }

  /**
   * Update header status display
   */
  updateHeaderStatus() {
    const statusElement = document.getElementById('week-status');
    const weekSelect = document.getElementById('week-select');

    if (statusElement && weekSelect) {
      const selectedOption = weekSelect.options[weekSelect.selectedIndex];
      if (selectedOption) {
        statusElement.textContent = selectedOption.textContent;
      }
    }
  }

  /**
   * Get week start date (Monday)
   */
  getWeekStartDate(weekNumber) {
    // 2025 week calculation - simplified for demo
    const baseDate = new Date('2025-01-06'); // Week 1 Monday
    const weekOffset = (weekNumber - 1) * 7;
    const startDate = new Date(baseDate.getTime() + weekOffset * 24 * 60 * 60 * 1000);
    return startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  /**
   * Get week end date (Sunday)
   */
  getWeekEndDate(weekNumber) {
    // 2025 week calculation - simplified for demo
    const baseDate = new Date('2025-01-12'); // Week 1 Sunday
    const weekOffset = (weekNumber - 1) * 7;
    const endDate = new Date(baseDate.getTime() + weekOffset * 24 * 60 * 60 * 1000);
    return endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  /**
   * Initialize navigation functionality
   */
  initializeNavigation() {
    console.log('🔗 Setting up navigation...');

    // Set up inquiry button handlers
    this.setupInquiryButtons();

    // Set up any other navigation elements
    this.setupMainNavigation();

    // Set up datagrid inquiry navigation
    this.setupDatagridInquiryNavigation();
  }

  /**
   * Navigate to Datagrid Inquiry with parameters
   */
  navigateToDatagridInquiry(source, config = {}) {
    const params = new URLSearchParams();
    params.set('source', source);
    if (config.sort) params.set('sort', config.sort);
    if (config.filter) params.set('filter', config.filter);
    window.location.href = `/datagrid-inquiry/datagrid-inquiry.html?${params}`;
  }

  /**
   * Set up datagrid inquiry navigation handlers
   */
  setupDatagridInquiryNavigation() {
    // Define all inquiry button mappings
    const inquiryMappings = [
      // YTD Strip buttons (we'll add click handlers to the metrics)
      {
        selector: '.ytd-metric:nth-child(1)',
        source: 'ytd-traffic',
        config: { sort: 'card_in_view', filter: 'ytd' }
      },
      {
        selector: '.ytd-metric:nth-child(2)',
        source: 'digital-adoption',
        config: { sort: 'composite_score', filter: 'digital' }
      },
      {
        selector: '.ytd-metric:nth-child(3)',
        source: 'print-rate',
        config: { sort: 'share_count', filter: 'print' }
      },

      // Main KPI Tiles
      {
        selector: '#digital-circular-performance-week .info-btn',
        source: 'digital-performance',
        config: { sort: 'composite_score' }
      },
      {
        selector: '#traffic-week .info-btn',
        source: 'traffic',
        config: { sort: 'card_in_view' }
      },
      {
        selector: '#share-activity-week .info-btn',
        source: 'share-activity',
        config: { sort: 'share_count' }
      },

      // Chart Sections
      {
        selector: '#performance-day-chart-container .detail-btn',
        source: 'performance-day',
        config: { sort: 'composite_score', filter: 'daily' }
      },
      {
        selector: '#interaction-rate-chart-container .detail-btn',
        source: 'interaction-rate',
        config: { sort: 'ctr', filter: 'interaction' }
      },
      {
        selector: '#top-categories-card .detail-btn',
        source: 'categories',
        config: { sort: 'composite_score', filter: 'by-category' }
      },
      {
        selector: '#promotion-performance .detail-btn',
        source: 'promotions',
        config: { sort: 'composite_score', filter: 'top-performers' }
      },
      {
        selector: '#size-mix-chart-container .detail-btn',
        source: 'size-mix',
        config: { sort: 'composite_score', filter: 'by-size' }
      },

      // Performance Sections
      {
        selector: '#size-performance-chart-container .detail-btn',
        source: 'size-performance',
        config: { sort: 'composite_score', filter: 'size-analysis' }
      },
      {
        selector: '#deal-type-chart-container .detail-btn',
        source: 'deal-preference',
        config: { sort: 'composite_score', filter: 'by-deal-type' }
      }
    ];

    // Add click handlers for all mappings
    inquiryMappings.forEach(mapping => {
      const element = document.querySelector(mapping.selector);
      if (element) {
        element.addEventListener('click', (e) => {
          e.preventDefault();
          this.navigateToDatagridInquiry(mapping.source, mapping.config);
        });

        // Add cursor pointer for YTD metrics that don't normally have it
        if (mapping.selector.includes('ytd-metric')) {
          element.style.cursor = 'pointer';
          element.title = `View ${mapping.source} details`;
        }
      }
    });
  }

  /**
   * Set up inquiry button navigation
   */
  setupInquiryButtons() {
    // Override default onclick behavior for better control
    const inquiryButtons = document.querySelectorAll('.detail-btn');

    inquiryButtons.forEach(button => {
      // Get the original onclick attribute for the URL
      const onclickAttr = button.getAttribute('onclick');
      if (onclickAttr) {
        // Extract the URL from the onclick attribute
        const urlMatch = onclickAttr.match(/window\.location\.href='([^']+)'/);
        if (urlMatch) {
          const url = urlMatch[1];

          // Remove the onclick attribute and add our event listener
          button.removeAttribute('onclick');
          button.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleInquiryNavigation(url, button);
          });
        }
      }
    });
  }

  /**
   * Handle inquiry button navigation
   */
  handleInquiryNavigation(url, button) {
    console.log('🔍 Navigating to inquiry:', url);

    // Add current context parameters to the URL
    const urlObj = new URL(url, window.location.origin);

    // Add current context as URL parameters
    if (this.currentContext.period) {
      urlObj.searchParams.set('period', this.currentContext.period);
    }
    if (this.currentContext.scope) {
      urlObj.searchParams.set('scope', this.currentContext.scope);
    }
    if (this.currentContext.version) {
      urlObj.searchParams.set('version', this.currentContext.version);
    }

    // Navigate to the URL
    window.location.href = urlObj.toString();
  }

  /**
   * Set up main navigation elements
   */
  setupMainNavigation() {
    // Set up main navigation active states
    this.setupMainNavActive();

    // Set up navigation event handlers
    this.setupMainNavHandlers();

    // Set up keyboard shortcuts for navigation
    this.setupKeyboardNavigation();
  }

  /**
   * Set up main navigation active states
   */
  setupMainNavActive() {
    const navItems = document.querySelectorAll('.nav-item');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    navItems.forEach(item => {
      const href = item.getAttribute('href');
      item.classList.remove('active');

      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        item.classList.add('active');
      }
    });
  }

  /**
   * Set up main navigation event handlers
   */
  setupMainNavHandlers() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const href = item.getAttribute('href');

        // Skip URL modification when using file:// protocol
        if (window.location.protocol === 'file:') {
          // Let the browser handle the navigation normally for file protocol
          return;
        }

        // Add current context as URL parameters for state preservation (HTTP only)
        if (href !== 'index.html') {
          e.preventDefault();

          const url = new URL(href, window.location.origin);

          // Add current context parameters
          if (this.currentContext.period) {
            url.searchParams.set('period', this.currentContext.period);
          }
          if (this.currentContext.scope) {
            url.searchParams.set('scope', this.currentContext.scope);
          }
          if (this.currentContext.version) {
            url.searchParams.set('version', this.currentContext.version);
          }

          window.location.href = url.toString();
        }
      });
    });
  }

  /**
   * Set up keyboard navigation shortcuts
   */
  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // Only handle if no input is focused
      if (document.activeElement.tagName === 'INPUT' ||
          document.activeElement.tagName === 'SELECT' ||
          document.activeElement.tagName === 'TEXTAREA') {
        return;
      }

      // ESC key - close any open tooltips
      if (e.key === 'Escape') {
        this.closeAllTooltips();
      }

      // F5 or Ctrl+R - refresh dashboard data
      if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
        e.preventDefault();
        this.refreshDashboard();
      }
    });
  }

  /**
   * Initialize KPI tooltip functionality (from prototype_001)
   */
  initKpiTooltips() {
    console.log('🔗 Setting up info button tooltips...');

    // Use event delegation for dynamically rendered content
    document.addEventListener('click', (e) => {
      if (e.target.closest('.info-btn')) {
        e.preventDefault();
        e.stopPropagation();
        const btn = e.target.closest('.info-btn');
        this.toggleTooltip(btn);
      }
      // Close tooltips when clicking outside
      else {
        this.closeAllTooltips();
      }
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
      if (e.target.matches('.info-btn') && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        const btn = e.target;
        this.toggleTooltip(btn);
      }
      // Close on Escape key
      else if (e.key === 'Escape') {
        this.closeAllTooltips();
      }
    });

    // Close tooltips on window resize
    window.addEventListener('resize', () => this.closeAllTooltips(), { passive: true });
  }

  /**
   * Toggle tooltip visibility
   */
  toggleTooltip(btn) {
    const isExpanded = btn.getAttribute('aria-expanded') === 'true';

    // Close all tooltips first (single tooltip behavior)
    this.closeAllTooltips();

    if (!isExpanded) {
      this.openTooltip(btn);
    }
  }

  /**
   * Open tooltip overlay
   */
  openTooltip(btn) {
    const tooltipContent = btn.getAttribute('data-tooltip-content');
    if (!tooltipContent) return;

    try {
      const data = JSON.parse(decodeURIComponent(tooltipContent));

      // Create overlay element
      const overlay = this.createTooltipOverlay(data);
      document.body.appendChild(overlay);

      // Position the tooltip
      this.positionTooltip(btn, overlay);

      // Update button state
      btn.setAttribute('aria-expanded', 'true');
      btn.tooltipOverlay = overlay;

      // Show with animation
      requestAnimationFrame(() => {
        overlay.classList.add('visible');
      });
    } catch (error) {
      console.error('Error parsing tooltip content:', error);
    }
  }

  /**
   * Create tooltip overlay element
   */
  createTooltipOverlay(data) {
    const overlay = document.createElement('div');
    overlay.className = 'tooltip-overlay';
    overlay.setAttribute('role', 'tooltip');
    overlay.setAttribute('aria-hidden', 'false');

    overlay.innerHTML = `
      <div class="tooltip-title">${this.escapeHtml(data.title)}</div>
      <div class="tooltip-content">${this.escapeHtml(data.tooltip)}</div>
      ${data.whyImportant ? `<div class="tooltip-why-important"><strong>Why this matters:</strong> ${this.escapeHtml(data.whyImportant)}</div>` : ''}
    `;

    return overlay;
  }

  /**
   * Position tooltip relative to button
   */
  positionTooltip(btn, overlay) {
    const btnRect = btn.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Set initial position to measure tooltip dimensions
    overlay.style.left = '0px';
    overlay.style.top = '0px';
    const overlayRect = overlay.getBoundingClientRect();
    const overlayWidth = overlayRect.width;
    const overlayHeight = overlayRect.height;

    let position = 'bottom';
    let top = btnRect.bottom + 8;
    let left = btnRect.left;

    // Check if tooltip fits below the button
    if (top + overlayHeight > viewportHeight - 10) {
      // Position above the button
      position = 'top';
      top = btnRect.top - overlayHeight - 8;
      overlay.classList.add('position-top');
    }

    // Check if tooltip fits to the right
    if (left + overlayWidth > viewportWidth - 10) {
      // Position to the left of center
      left = Math.max(10, btnRect.right - overlayWidth);
    }

    // Final bounds check
    if (top < 10) {
      position = 'bottom';
      top = btnRect.bottom + 8;
      left = Math.max(10, Math.min(viewportWidth - overlayWidth - 10, btnRect.left));
    }

    // Ensure tooltip stays within viewport bounds
    left = Math.max(10, Math.min(viewportWidth - overlayWidth - 10, left));
    top = Math.max(10, Math.min(viewportHeight - overlayHeight - 10, top));

    overlay.style.left = left + 'px';
    overlay.style.top = top + 'px';
  }

  /**
   * Close all open tooltips
   */
  closeAllTooltips() {
    // Close all existing tooltips
    document.querySelectorAll('.tooltip-overlay').forEach(overlay => {
      overlay.classList.remove('visible');
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }, 200); // Match CSS transition duration
    });

    // Reset all button states
    document.querySelectorAll('.info-btn[aria-expanded="true"]').forEach(btn => {
      btn.setAttribute('aria-expanded', 'false');
      btn.tooltipOverlay = null;
    });
  }

  /**
   * Escape HTML for security
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Update context (scope, period, etc.)
   */
  updateContext(key, value) {
    if (this.currentContext[key] === value) return;

    console.log(`📊 Updating context: ${key} = ${value}`);
    this.currentContext[key] = value;

    // Only reload if fully initialized
    if (this.isInitialized) {
      this.refreshDashboard();
    }
  }

  /**
   * Refresh dashboard with new context
   */
  refreshDashboard() {
    console.log('🔄 Refreshing dashboard with context:', this.currentContext);

    try {
      // Get filtered data based on current context
      const data = this.getFilteredData();

      // Recreate all charts with new data
      if (this.chartsComponent) {
        // Phase 3A: Recreate Performance Day Chart
        this.createPerformanceDayChart(data);

        // Phase 3B: Recreate Interaction Rate Chart
        this.createInteractionRateChart(data);

        // Phase 3C: Recreate Size & Deal Charts
        this.createSizeAndDealCharts(data);
      }

      console.log('✅ Dashboard refreshed successfully');
    } catch (error) {
      console.error('❌ Dashboard refresh failed:', error);
    }
  }

  /**
   * Get filtered data based on current context
   */
  getFilteredData() {
    const baseData = window.mockDatabase || {};

    // For now, return base data - filtering logic can be enhanced later
    // In a real implementation, this would filter promotions by:
    // - Week/period (this.currentContext.period)
    // - Version (this.currentContext.version)
    // - Store/scope (this.currentContext.scope)

    console.log('📊 Applying filters:', this.currentContext);
    return baseData;
  }

  /**
   * Resize all charts for responsive behavior
   */
  resizeCharts() {
    // Resize ECharts from charts component
    if (this.chartsComponent) {
      this.chartsComponent.resizeAll();
    }

    // Legacy chart resizing (if any)
    if (this.charts) {
      this.charts.forEach(chart => {
        if (chart && typeof chart.resize === 'function') {
          chart.resize();
        }
      });
    }
  }
}

// Global resize handler for chart responsiveness
window.addEventListener('resize', () => {
  if (window.dashboardInstance && window.dashboardInstance.charts) {
    window.dashboardInstance.resizeCharts();
  }
});