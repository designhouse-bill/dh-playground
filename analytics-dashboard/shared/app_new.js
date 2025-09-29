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

    // Context integration
    this.contextStateService = null;
    this.contextSubscriptions = [];
    this.lastContextState = null;
    this.filteredData = null;
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

      // Initialize context state service
      await this.initializeContextService();

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
   * Initialize context state service
   */
  async initializeContextService() {
    try {
      if (window.contextStateService) {
        this.contextStateService = window.contextStateService;

        // Initialize URL synchronization
        this.contextStateService.initUrlSync();

        // Get initial context state
        this.lastContextState = this.contextStateService.loadState('dashboard');
        console.log('🔗 Context service initialized with state:', this.lastContextState);

      } else {
        console.warn('⚠️ ContextStateService not available');
      }
    } catch (error) {
      console.error('❌ Failed to initialize context service:', error);
    }
  }

  /**
   * Handle context state changes
   */
  handleContextChange(newState, oldState) {
    console.log('🔄 Context changed in dashboard:', { old: oldState, new: newState });

    // Check if we need to reload data
    const needsDataReload = this.shouldReloadData(newState, oldState);

    if (needsDataReload) {
      console.log('🔄 Context change requires data reload');
      this.reloadDashboardWithContext(newState);
    } else {
      console.log('ℹ️ Context change does not require data reload');
    }

    // Update current context for legacy compatibility
    this.updateLegacyContext(newState);

    this.lastContextState = newState;
  }

  /**
   * Determine if data reload is needed based on context changes
   */
  shouldReloadData(newState, oldState) {
    if (!oldState) return true;

    // Check if period changed
    if (newState.primaryWeek !== oldState.primaryWeek ||
        newState.periodMode !== oldState.periodMode ||
        newState.compareWeek !== oldState.compareWeek) {
      return true;
    }

    // Check if scope changed
    if (newState.scopeLevel !== oldState.scopeLevel ||
        newState.scopeValue !== oldState.scopeValue) {
      return true;
    }

    return false;
  }

  /**
   * Update legacy context format for backward compatibility
   */
  updateLegacyContext(newState) {
    this.currentContext = {
      scope: this.mapScopeToLegacy(newState),
      period: `w${newState.primaryWeek}`,
      user: this.currentContext.user || { role: 'General Manager' }
    };
  }

  /**
   * Map new scope format to legacy format
   */
  mapScopeToLegacy(state) {
    switch (state.scopeLevel) {
      case 'all':
        return 'all_stores';
      case 'version-group':
        return `version_group_${state.scopeValue}`;
      case 'store':
        return `store_${state.scopeValue}`;
      default:
        return 'all_stores';
    }
  }

  /**
   * Reload dashboard with new context
   */
  async reloadDashboardWithContext(contextState) {
    try {
      console.log('📊 Reloading dashboard with new context...');

      // Filter data based on context
      const filteredData = this.filterDataByContext(contextState);
      this.filteredData = filteredData;

      // Update week display in UI
      this.updateWeekDisplay(contextState);

      // Recreate charts with filtered data
      if (this.chartsComponent) {
        // Phase 3A: Recreate Performance Day Chart
        this.createPerformanceDayChart(filteredData);

        // Phase 3B: Recreate Interaction Rate Chart
        this.createInteractionRateChart(filteredData);

        // Phase 3C: Recreate Size & Deal Charts
        this.createSizeAndDealCharts(filteredData);
      }

      // Update KPIs
      this.updateKPIDisplays(filteredData, contextState);

      console.log('✅ Dashboard reloaded with context');

    } catch (error) {
      console.error('❌ Failed to reload dashboard with context:', error);
    }
  }

  /**
   * Filter mock data based on context state
   */
  filterDataByContext(contextState) {
    const baseData = window.mockDatabase || {};

    if (!baseData.promotions) {
      console.warn('⚠️ No promotions data available');
      return baseData;
    }

    let filteredPromotions = [...baseData.promotions];

    // Apply week filtering
    filteredPromotions = this.filterByWeek(filteredPromotions, contextState);

    // Apply scope filtering
    filteredPromotions = this.filterByScope(filteredPromotions, contextState);

    // Return filtered data structure
    return {
      ...baseData,
      promotions: filteredPromotions,
      filteredStats: {
        originalCount: baseData.promotions.length,
        filteredCount: filteredPromotions.length,
        weekFilter: `w${contextState.week}`,
        scopeFilter: `${contextState.scopeLevel}:${contextState.scopeValue}`
      }
    };
  }

  /**
   * Filter promotions by week
   */
  filterByWeek(promotions, contextState) {
    // For demo purposes, simulate week-based filtering
    // In a real system, this would filter by actual week data

    const targetWeek = contextState.week;
    const currentWeek = this.getCurrentWeek();

    // If selecting current week, return all data
    if (targetWeek === currentWeek) {
      return promotions;
    }

    // For other weeks, simulate reduced data set
    const reductionFactor = Math.abs(currentWeek - targetWeek) * 0.1;
    const keepPercentage = Math.max(0.3, 1 - reductionFactor);
    const keepCount = Math.floor(promotions.length * keepPercentage);

    console.log(`📅 Week ${targetWeek} filter: keeping ${keepCount}/${promotions.length} promotions`);

    return promotions.slice(0, keepCount);
  }

  /**
   * Filter promotions by scope (store selection)
   */
  filterByScope(promotions, contextState) {
    const { scopeLevel, scopeValue } = contextState;

    switch (scopeLevel) {
      case 'all':
        // No filtering needed for all stores
        return promotions;

      case 'version-group':
        return this.filterByVersionGroup(promotions, scopeValue);

      case 'store':
        return this.filterByStore(promotions, scopeValue);

      default:
        return promotions;
    }
  }

  /**
   * Filter promotions by version group
   */
  filterByVersionGroup(promotions, versionGroupId) {
    // Get stores in the version group
    const storeHierarchy = window.DataUtils?.store_hierarchy || window.mockDatabase?.store_hierarchy;
    if (!storeHierarchy) {
      console.warn('⚠️ Store hierarchy data not available');
      return promotions;
    }

    const versionGroup = storeHierarchy.version_groups.find(r => r.id === versionGroupId);
    if (!versionGroup) {
      console.warn(`⚠️ Version-Group ${versionGroupId} not found`);
      return promotions;
    }

    // For demo purposes, filter based on version group percentage
    const versionGroupMultipliers = {
      'northeast': 0.3,   // 30% of promotions
      'southeast': 0.25,  // 25% of promotions
      'midwest': 0.2,     // 20% of promotions
      'west': 0.25        // 25% of promotions
    };

    const keepPercentage = versionGroupMultipliers[versionGroupId] || 0.25;
    const keepCount = Math.floor(promotions.length * keepPercentage);

    console.log(`🏪 Version-Group ${versionGroupId} filter: keeping ${keepCount}/${promotions.length} promotions`);

    return promotions.slice(0, keepCount);
  }

  /**
   * Filter promotions by individual store
   */
  filterByStore(promotions, storeId) {
    // For individual store, significantly reduce data set
    const keepPercentage = 0.02; // 2% of promotions per store
    const keepCount = Math.max(5, Math.floor(promotions.length * keepPercentage));

    console.log(`🏬 Store ${storeId} filter: keeping ${keepCount}/${promotions.length} promotions`);

    return promotions.slice(0, keepCount);
  }

  /**
   * Update week display in the UI
   */
  updateWeekDisplay(contextState) {
    const weekElements = document.querySelectorAll('.week-display, .period-indicator');
    const weekText = `Week ${contextState.primaryWeek}`;

    weekElements.forEach(element => {
      if (element) {
        element.textContent = weekText;
      }
    });

    // Update YTD metrics section if present
    const ytdSection = document.querySelector('.ytd-metrics-section');
    if (ytdSection && contextState.primaryWeek) {
      const weekIndicator = ytdSection.querySelector('.week-indicator') ||
                           this.createWeekIndicator();

      if (!ytdSection.contains(weekIndicator)) {
        ytdSection.appendChild(weekIndicator);
      }

      weekIndicator.textContent = `Data for ${weekText}`;
    }
  }

  /**
   * Create week indicator element
   */
  createWeekIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'week-indicator';
    indicator.style.cssText = `
      font-size: 12px;
      color: #6c757d;
      text-align: center;
      padding: 4px 8px;
      background: rgba(0,0,0,0.05);
      border-radius: 4px;
      margin-top: 8px;
    `;
    return indicator;
  }

  /**
   * Update KPI displays with filtered data
   */
  updateKPIDisplays(filteredData, contextState) {
    try {
      const stats = this.calculateKPIStats(filteredData);

      // Update traffic metrics
      this.updateTrafficKPI(stats);

      // Update digital adoption
      this.updateDigitalAdoptionKPI(stats);

      // Update print rate
      this.updatePrintRateKPI(stats);

      // Update weekly KPIs
      this.updateWeeklyKPIs(stats, contextState);

      console.log('📊 KPI displays updated with filtered data');

    } catch (error) {
      console.error('❌ Failed to update KPI displays:', error);
    }
  }

  /**
   * Calculate KPI statistics from filtered data
   */
  calculateKPIStats(data) {
    const promotions = data.promotions || [];

    if (promotions.length === 0) {
      return this.getEmptyStats();
    }

    // Calculate aggregated metrics
    const totalViews = promotions.reduce((sum, p) => sum + (p.card_in_view || 0), 0);
    const totalClicks = promotions.reduce((sum, p) => sum + (p.card_clicked || 0), 0);
    const totalShares = promotions.reduce((sum, p) => sum + (p.share_count || 0), 0);
    const totalAddedToList = promotions.reduce((sum, p) => sum + (p.added_to_list || 0), 0);

    const avgCompositeScore = promotions.reduce((sum, p) => sum + (p.composite_score || 0), 0) / promotions.length;

    // Calculate rates
    const clickRate = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;
    const addToListRate = totalViews > 0 ? (totalAddedToList / totalViews) * 100 : 0;
    const shareRate = totalViews > 0 ? (totalShares / totalViews) * 100 : 0;

    return {
      totalPromotions: promotions.length,
      totalViews: totalViews,
      totalClicks: totalClicks,
      totalShares: totalShares,
      totalAddedToList: totalAddedToList,
      avgCompositeScore: avgCompositeScore,
      clickRate: clickRate,
      addToListRate: addToListRate,
      shareRate: shareRate,
      digitalAdoption: clickRate + addToListRate, // Simplified calculation
      printRate: Math.max(0, 100 - (clickRate + addToListRate)) // Inverse of digital
    };
  }

  /**
   * Get empty statistics for no-data state
   */
  getEmptyStats() {
    return {
      totalPromotions: 0,
      totalViews: 0,
      totalClicks: 0,
      totalShares: 0,
      totalAddedToList: 0,
      avgCompositeScore: 0,
      clickRate: 0,
      addToListRate: 0,
      shareRate: 0,
      digitalAdoption: 0,
      printRate: 0
    };
  }

  /**
   * Update traffic KPI display
   */
  updateTrafficKPI(stats) {
    const trafficElements = document.querySelectorAll('.ytd-metric .value');
    if (trafficElements.length > 0) {
      const trafficValue = `${(stats.totalViews / 1000).toFixed(1)}K views`;
      trafficElements[0].textContent = trafficValue;
    }
  }

  /**
   * Update digital adoption KPI display
   */
  updateDigitalAdoptionKPI(stats) {
    const digitalElements = document.querySelectorAll('.ytd-metric .value');
    if (digitalElements.length > 1) {
      const digitalValue = `${stats.digitalAdoption.toFixed(1)}%`;
      digitalElements[1].textContent = digitalValue;
    }
  }

  /**
   * Update print rate KPI display
   */
  updatePrintRateKPI(stats) {
    const printElements = document.querySelectorAll('.ytd-metric .value');
    if (printElements.length > 2) {
      const printValue = `${stats.printRate.toFixed(1)}%`;
      printElements[2].textContent = printValue;
    }
  }

  /**
   * Update weekly KPI tiles
   */
  updateWeeklyKPIs(stats, contextState) {
    // Update digital circular performance
    const digitalPerfElement = document.querySelector('#digital-circular-performance-week .metric-value');
    if (digitalPerfElement) {
      digitalPerfElement.textContent = `${stats.avgCompositeScore.toFixed(0)}`;
    }

    // Update traffic week
    const trafficWeekElement = document.querySelector('#traffic-week .metric-value');
    if (trafficWeekElement) {
      trafficWeekElement.textContent = `${(stats.totalViews / 1000).toFixed(1)}K`;
    }

    // Update share activity
    const shareActivityElement = document.querySelector('#share-activity-week .metric-value');
    if (shareActivityElement) {
      shareActivityElement.textContent = `${stats.totalShares.toFixed(0)}`;
    }

    // Add scope indicator to KPI tiles
    this.addScopeIndicators(contextState);
  }

  /**
   * Add scope indicators to KPI tiles
   */
  addScopeIndicators(contextState) {
    const kpiTiles = document.querySelectorAll('.kpi-tile');

    kpiTiles.forEach(tile => {
      // Remove existing scope indicators
      const existingIndicator = tile.querySelector('.scope-indicator');
      if (existingIndicator) {
        existingIndicator.remove();
      }

      // Add new scope indicator
      if (contextState.scopeLevel !== 'all') {
        const indicator = document.createElement('div');
        indicator.className = 'scope-indicator';
        indicator.textContent = contextState.scopeName || contextState.scopeValue;
        indicator.style.cssText = `
          font-size: 10px;
          color: #6c757d;
          background: rgba(33, 150, 243, 0.1);
          border-radius: 3px;
          padding: 2px 6px;
          margin-top: 4px;
          display: inline-block;
        `;

        const metricContent = tile.querySelector('.metric-content');
        if (metricContent) {
          metricContent.appendChild(indicator);
        }
      }
    });
  }

  /**
   * Get current week number
   */
  getCurrentWeek() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.floor(diff / oneWeek) + 1;
  }

  /**
   * Load all dashboard content - updated with context integration
   */
  async loadDashboardContent() {
    console.log('📊 Loading dashboard content...');

    try {
      // Initialize charts component
      console.log('📊 DashboardCharts class available:', typeof DashboardCharts);
      this.chartsComponent = new DashboardCharts();
      console.log('📊 Charts component initialized:', !!this.chartsComponent);

      // Load data with context filtering
      const baseData = window.mockDatabase || {};
      const contextState = this.contextStateService?.loadState('dashboard');

      let data = baseData;
      if (contextState && this.shouldReloadData(contextState, null)) {
        data = this.filterDataByContext(contextState);
        this.filteredData = data;
      }

      // Update week display
      if (contextState) {
        this.updateWeekDisplay(contextState);
        this.updateKPIDisplays(data, contextState);
      }

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
    console.log('📊 Charts component available:', !!this.chartsComponent);
    console.log('📊 Data available:', !!data);
    console.log('📊 ECharts available:', typeof echarts !== 'undefined');

    // Check if chart containers exist
    const sizeChartContainer = document.getElementById('size-mix-chart');
    const dealChartContainer = document.getElementById('deal-type-chart');
    console.log('📊 Size chart container exists:', !!sizeChartContainer);
    console.log('📊 Deal chart container exists:', !!dealChartContainer);

    if (this.chartsComponent) {
      // Size Class Mix donut chart
      console.log('📊 Creating size mix chart...');
      setTimeout(() => {
        const sizeClassChart = this.chartsComponent.createSizeClassMixChart('size-mix-chart', data);
        console.log('📊 Size chart result:', !!sizeClassChart);
        if (sizeClassChart) {
          console.log('✅ Size Class Mix Chart created successfully');
          // Force resize after creation
          setTimeout(() => sizeClassChart.resize(), 100);
        } else {
          console.error('❌ Size Class Mix Chart creation failed');
        }
      }, 100);

      // Size Performance horizontal bars
      const sizePerformanceChart = this.chartsComponent.createSizePerformanceChart('size-performance-chart', data);
      if (sizePerformanceChart) {
        console.log('✅ Size Performance Chart created successfully');
      }

      // Deal Type Preference donut chart
      console.log('📊 Creating deal type chart...');
      setTimeout(() => {
        const dealTypeChart = this.chartsComponent.createDealTypeChart('deal-type-chart', data);
        console.log('📊 Deal chart result:', !!dealTypeChart);
        if (dealTypeChart) {
          console.log('✅ Deal Type Preference Chart created successfully');
          // Force resize after creation
          setTimeout(() => dealTypeChart.resize(), 100);
        } else {
          console.error('❌ Deal Type Preference Chart creation failed');
        }
      }, 200);
    } else {
      console.error('❌ Charts component not available');
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
   * Initialize header controls (Phase 4A) - DISABLED
   * Header controls removed in Prompt 7.01
   */
  initializeHeaderControls() {
    // Header controls disabled - elements removed from HTML
    // this.populateHeaderDropdowns();
    // this.setupHeaderEventListeners();
    // this.updateHeaderStatus();
  }

  /**
   * Populate header dropdown options from data - DISABLED
   * Header dropdowns removed in Prompt 7.01
   */
  populateHeaderDropdowns() {
    // Header dropdowns disabled - elements removed from HTML
    // const data = window.mockDatabase || {};
    // this.populateWeekSelector();
    // this.populateVersionSelector(data);
    // this.populateStoreSelector(data);
  }

  /**
   * Populate week selector with recent weeks - DISABLED
   * Week selector removed in Prompt 7.01
   */
  populateWeekSelector() {
    // Week selector disabled - element removed from HTML
    // const weekSelect = document.getElementById('week-select');
    // if (!weekSelect) return;
    return;
  }

  /**
   * Populate version selector from promotion data - DISABLED
   * Version selector removed in Prompt 7.01
   */
  populateVersionSelector(data) {
    // Version selector disabled - element removed from HTML
    // const versionSelect = document.getElementById('version-select');
    // if (!versionSelect) return;
    return;
  }

  /**
   * Populate store selector from store codes - DISABLED
   * Store selector removed in Prompt 7.01
   */
  populateStoreSelector(data) {
    // Store selector disabled - element removed from HTML
    // const storeSelect = document.getElementById('store-select');
    // if (!storeSelect) return;
    return;
  }

  /**
   * Set up event listeners for header controls - DISABLED
   * Header controls removed in Prompt 7.01
   */
  setupHeaderEventListeners() {
    // Header controls disabled - elements removed from HTML
    // const weekSelect = document.getElementById('week-select');
    // const versionSelect = document.getElementById('version-select');
    // const storeSelect = document.getElementById('store-select');
    return;
  }

  /**
   * Update header status display - DISABLED
   * Header status removed in Prompt 7.01
   */
  updateHeaderStatus() {
    // Header status disabled - element removed from HTML
    // const statusElement = document.getElementById('week-status');
    // const weekSelect = document.getElementById('week-select');
    return;
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

  /**
   * Clean up dashboard resources
   */
  destroy() {
    try {
      console.log('🧹 Destroying AnalyticsDashboard...');

      // Unsubscribe from context changes
      this.contextSubscriptions.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
      this.contextSubscriptions = [];

      // Clear charts
      if (this.charts) {
        this.charts.forEach(chart => {
          if (chart && typeof chart.dispose === 'function') {
            chart.dispose();
          }
        });
        this.charts.clear();
      }

      // Reset state
      this.isInitialized = false;
      this.filteredData = null;
      this.lastContextState = null;

      console.log('✅ AnalyticsDashboard destroyed successfully');
      return true;

    } catch (error) {
      console.error('❌ Error destroying AnalyticsDashboard:', error);
      return false;
    }
  }
}

// Global resize handler for chart responsiveness
window.addEventListener('resize', () => {
  if (window.dashboardInstance && window.dashboardInstance.charts) {
    window.dashboardInstance.resizeCharts();
  }
});

// Auto-cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.dashboardInstance && typeof window.dashboardInstance.destroy === 'function') {
    window.dashboardInstance.destroy();
  }
});