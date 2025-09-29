/**
 * Main Application Controller
 * Orchestrates the entire analytics dashboard experience
 */

class AnalyticsDashboard {
  constructor() {
    this.currentPage = this.getCurrentPage();
    this.currentContext = {
      scope: 'all_stores',
      period: 'w36',
      user: { role: 'General Manager' }
    };
    this.components = {};
    this.isLoading = false;
    this.isInitialized = false;

    // Simulate 200ms load time for all data operations
    this.loadDelay = 200;

    // Context integration
    this.contextBar = null;
    this.currentContextState = null;
  }

  /**
   * Initialize the dashboard
   */
  async init() {
    // Prevent multiple initialization
    if (this.isInitialized) {
      console.log('⚠️ Dashboard already initialized, skipping...');
      return;
    }

    console.log('🚀 Initializing Analytics Dashboard...');

    try {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        await new Promise(resolve => {
          document.addEventListener('DOMContentLoaded', resolve);
        });
      }

      // Initialize navigation
      this.initializeNavigation();

      // Initialize context bar
      this.initializeContextBar();

      // Listen for context changes
      this.setupContextListeners();

      // Load page-specific content
      await this.loadPageContent();

      // Initialize tooltips
      this.initializeTooltips();

      // Mark as initialized
      this.isInitialized = true;

      console.log('✅ Dashboard initialized successfully');

    } catch (error) {
      console.error('❌ Dashboard initialization failed:', error);
      this.showError('Failed to initialize dashboard', error.message);
    }
  }

  /**
   * Get current page from URL
   */
  getCurrentPage() {
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
    return page.replace('.html', '');
  }

  /**
   * Initialize navigation system
   */
  initializeNavigation() {
    // Add navigation if it doesn't exist
    if (!document.querySelector('.main-nav')) {
      this.createNavigation();
    }

    // Set active navigation item
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      const href = item.getAttribute('href') || '';
      const page = href.replace('.html', '') || 'index';

      if (page === this.currentPage) {
        item.classList.add('active');
      }
    });
  }

  /**
   * Create main navigation
   */
  createNavigation() {
    const nav = document.createElement('nav');
    nav.className = 'main-nav';
    nav.innerHTML = `
      <div class="nav-container">
        <ul class="nav-list">
          <li><a href="index.html" class="nav-item">Overview</a></li>
          <li><a href="reports.html" class="nav-item">Reports</a></li>
        </ul>
      </div>
    `;

    // Insert after context bar or at beginning of body
    const contextBar = document.querySelector('.context-bar');
    if (contextBar) {
      contextBar.insertAdjacentElement('afterend', nav);
    } else {
      document.body.insertBefore(nav, document.body.firstChild);
    }
  }

  /**
   * Initialize context bar integration
   */
  initializeContextBar() {
    // Check if SimpleContextBar is available
    if (typeof SimpleContextBar !== 'undefined' && window.contextBar) {
      this.contextBar = window.contextBar;
      console.log('📊 Dashboard connected to context bar');
    }

    // Legacy context bar support
    const viewingSelect = document.getElementById('viewingScope');
    const timeSelect = document.getElementById('timePeriod');

    if (viewingSelect) {
      viewingSelect.value = this.currentContext.scope;
      viewingSelect.addEventListener('change', (e) => {
        this.updateContext('scope', e.target.value);
      });
    }

    if (timeSelect) {
      timeSelect.value = this.currentContext.period;
      timeSelect.addEventListener('change', (e) => {
        this.updateContext('period', e.target.value);
      });
    }
  }

  /**
   * Setup context change listeners
   */
  setupContextListeners() {
    // Listen for context bar changes
    document.addEventListener('contextChanged', (event) => {
      console.log('📊 Context changed:', event.detail);
      this.handleContextChange(event.detail);
    });

    // Listen for direct context state service changes
    if (window.contextStateService) {
      // Periodically check for context changes (fallback)
      setInterval(() => {
        this.checkContextChanges();
      }, 1000);
    }
  }

  /**
   * Handle context changes from context bar
   */
  async handleContextChange(contextData) {
    if (!this.isInitialized) return;

    this.showLoading();

    try {
      // Update current context state
      this.currentContextState = contextData;

      // Reload content with new context
      await this.loadPageContent();

      console.log('✅ Dashboard updated with new context');
    } catch (error) {
      console.error('❌ Failed to update dashboard with context:', error);
      this.showError('Context Update Failed', error.message);
    } finally {
      this.hideLoading();
    }
  }

  /**
   * Check for context changes (fallback method)
   */
  checkContextChanges() {
    if (!window.contextStateService) return;

    try {
      const currentState = window.contextStateService.loadState(this.currentPage);

      // Compare with stored state
      if (!this.currentContextState || this.hasContextChanged(this.currentContextState, currentState)) {
        console.log('📊 Context change detected via polling');
        this.handleContextChange(currentState);
      }
    } catch (error) {
      // Silently handle polling errors
    }
  }

  /**
   * Check if context has changed
   */
  hasContextChanged(oldState, newState) {
    if (!oldState || !newState) return true;

    return oldState.week !== newState.week ||
           oldState.scopeLevel !== newState.scopeLevel ||
           oldState.scopeValue !== newState.scopeValue ||
           oldState.comparisonMode !== newState.comparisonMode;
  }

  /**
   * Update context and reload data
   */
  async updateContext(key, value) {
    if (this.currentContext[key] === value) return;

    console.log(`📊 Updating context: ${key} = ${value}`);
    this.currentContext[key] = value;

    // Only reload content if dashboard is fully initialized
    if (this.isInitialized) {
      console.log('🔄 Reloading content due to context change...');
      await this.loadPageContent();
    } else {
      console.log('⏳ Skipping content reload - dashboard still initializing...');
    }
  }

  /**
   * Clear existing dashboard content to prevent duplicates
   */
  clearContent() {
    console.log('🧹 Clearing existing content...');

    // Clear YTD strip
    const ytdStrip = document.querySelector('.ytd-strip');
    if (ytdStrip) {
      ytdStrip.innerHTML = '';
    }

    // Clear main container content
    const container = document.querySelector('.container');
    if (container) {
      container.innerHTML = '';
    }
  }

  /**
   * Load content specific to current page
   */
  async loadPageContent() {
    this.showLoading();

    try {
      // Clear existing content to prevent duplicates
      this.clearContent();

      switch (this.currentPage) {
        case 'index':
          await this.loadOverviewPage();
          break;
        case 'explore':
          await this.loadExplorePage();
          break;
        case 'analyze':
          await this.loadAnalyzePage();
          break;
        case 'reports':
          await this.loadReportsPage();
          break;
        default:
          await this.loadOverviewPage();
      }
    } catch (error) {
      console.error(`❌ Failed to load ${this.currentPage} page:`, error);
      this.showError(`Failed to load ${this.currentPage} page`, error.message);
    } finally {
      this.hideLoading();
    }
  }

  /**
   * Load overview/landing page content
   */
  async loadOverviewPage() {
    console.log('📈 Loading overview page...');

    // Simulate loading delay
    await this.delay(this.loadDelay);

    // Get current context for filtering
    const contextState = this.getCurrentContextState();
    console.log('📊 Loading with context:', contextState);

    // Load YTD metrics
    await this.loadYTDStrip();

    // Load 6 KPI tiles with context filtering
    await this.loadKPITiles(contextState);

    // Load additional panels with context filtering
    await this.loadAdditionalPanels(contextState);
  }

  /**
   * Get current context state for filtering
   */
  getCurrentContextState() {
    if (this.currentContextState) {
      return this.currentContextState;
    }

    // Fallback to context state service
    if (window.contextStateService) {
      return window.contextStateService.loadState(this.currentPage);
    }

    // Default context
    return {
      week: 40,
      scopeLevel: 'all',
      scopeValue: 'all',
      comparisonMode: false
    };
  }

  /**
   * Filter data by context
   */
  filterByContext(data, contextState) {
    let filteredData = { ...data };

    // Filter by week
    if (contextState.week && contextState.week !== 40) {
      filteredData = this.filterByWeek(filteredData, contextState.week);
    }

    // Filter by store scope
    if (contextState.scopeLevel !== 'all') {
      filteredData = this.filterByStoreScope(filteredData, contextState);
    }

    return filteredData;
  }

  /**
   * Filter data by selected week
   */
  filterByWeek(data, selectedWeek) {
    const filteredData = { ...data };

    // Adjust weekly metrics for selected week
    if (data.weeklyMetrics) {
      filteredData.weeklyMetrics = { ...data.weeklyMetrics };

      // Calculate week offset from current week (40)
      const weekOffset = selectedWeek - 40;

      // Simulate different performance for different weeks
      if (weekOffset !== 0) {
        const performanceVariation = 1 + (Math.sin(weekOffset) * 0.1); // ±10% variation

        filteredData.weeklyMetrics.current_week = selectedWeek;
        filteredData.weeklyMetrics.performance_score = Math.round(data.weeklyMetrics.performance_score * performanceVariation);
        filteredData.weeklyMetrics.unique_viewers = Math.round(data.weeklyMetrics.unique_viewers * performanceVariation);
        filteredData.weeklyMetrics.share_total = Math.round(data.weeklyMetrics.share_total * performanceVariation);

        // Recalculate trends
        const prevWeekScore = Math.round(filteredData.weeklyMetrics.performance_score * (1 - 0.05));
        filteredData.weeklyMetrics.week_over_week_change = Math.round(((filteredData.weeklyMetrics.performance_score - prevWeekScore) / prevWeekScore) * 100);

        console.log(`📊 Data filtered for week ${selectedWeek}, performance: ${filteredData.weeklyMetrics.performance_score}`);
      }
    }

    // Filter promotions by week
    if (data.promotions) {
      filteredData.promotions = data.promotions.filter(promo => promo.week === selectedWeek || !promo.week);
    }

    return filteredData;
  }

  /**
   * Filter data by store scope
   */
  filterByStoreScope(data, contextState) {
    const filteredData = { ...data };

    if (contextState.scopeLevel === 'region') {
      // Find region data
      const regions = data.regions || mockDatabase.regions;
      const selectedRegion = regions ? regions.find(r => r.id === contextState.scopeValue) : null;

      if (selectedRegion) {
        // Apply regional modifier to metrics
        const regionModifier = selectedRegion.stores.length / 67; // Ratio compared to all stores

        if (filteredData.weeklyMetrics) {
          filteredData.weeklyMetrics.unique_viewers = Math.round(filteredData.weeklyMetrics.unique_viewers * regionModifier);
          filteredData.weeklyMetrics.share_total = Math.round(filteredData.weeklyMetrics.share_total * regionModifier);
          console.log(`📊 Data filtered for region ${selectedRegion.name}, modifier: ${regionModifier.toFixed(2)}`);
        }
      }
    } else if (contextState.scopeLevel === 'store') {
      // Individual store - significantly reduce numbers
      const storeModifier = 1 / 67; // Single store out of 67

      if (filteredData.weeklyMetrics) {
        filteredData.weeklyMetrics.unique_viewers = Math.round(filteredData.weeklyMetrics.unique_viewers * storeModifier);
        filteredData.weeklyMetrics.share_total = Math.round(filteredData.weeklyMetrics.share_total * storeModifier);
        console.log(`📊 Data filtered for individual store ${contextState.scopeValue}, modifier: ${storeModifier.toFixed(3)}`);
      }
    }

    return filteredData;
  }

  /**
   * Load YTD performance strip
   */
  async loadYTDStrip() {
    const ytdStrip = document.querySelector('.ytd-strip');
    if (!ytdStrip) return;

    const ytdData = mockDatabase.ytdMetrics;

    ytdStrip.innerHTML = `
      <div class="ytd-metric">
        <span class="label">YTD Traffic:</span>
        <span class="value">${this.formatNumber(ytdData.total_traffic)} views</span>
        <span class="trend positive">+${ytdData.yoy_growth}% YoY</span>
      </div>
      <div class="ytd-metric">
        <span class="label">Digital Adoption:</span>
        <span class="value">${ytdData.digital_adoption_rate}%</span>
        <span class="trend positive">+8% from 2024</span>
      </div>
      <div class="ytd-metric">
        <span class="label">Print Rate:</span>
        <span class="value">${ytdData.print_rate}%</span>
        <span class="trend negative">-3%</span>
      </div>
    `;
  }

  /**
   * Load 6 KPI tiles with real data
   */
  async loadKPITiles(contextState) {
    // Get filtered data based on context
    const filteredData = this.filterByContext(mockDatabase, contextState);
    const weeklyData = filteredData.weeklyMetrics;
    const categories = filteredData.categories || mockDatabase.categories;

    console.log('📊 Loading KPI tiles with filtered data:', {
      week: contextState.week,
      scope: `${contextState.scopeLevel}:${contextState.scopeValue}`,
      performance: weeklyData.performance_score,
      viewers: weeklyData.unique_viewers
    });

    // Load each KPI tile
    await Promise.all([
      this.loadWeekPerformanceTile(weeklyData),
      this.loadWeekTrafficTile(weeklyData),
      this.loadShareActivityTile(weeklyData)
    ]);
  }

  /**
   * Load Digital Circular Performance tile
   */
  async loadWeekPerformanceTile(data) {
    const tile = this.createKPITile('digital-circular-performance-week', {
      title: 'Digital Circular Performance <br>(Week)',
      value: data.performance_score,
      trend: data.week_over_week_change,
      status: data.week_over_week_change > 0 ? 'positive' : 'negative',
      definition: kpiDefinitions.weekPerformance.definition,
      whyItMatters: kpiDefinitions.weekPerformance.whyItMatters,
      drillDownFilter: 'week-performance'
    });

    const content = tile.querySelector('.kpi-content');
    content.innerHTML = `
      <div class="big-number-container">
        <div class="big-number">${data.performance_score}%</div>
        <div class="sub-text">Average of All Promotions</div>
      </div>
      <div class="trend ${data.week_over_week_change > 0 ? 'positive' : 'negative'}">
        ${data.week_over_week_change > 0 ? '+' : ''}${data.week_over_week_change}% vs Week ${data.current_week - 1}
      </div>
      <div class="week-day">
        Week ${data.current_week} of 52 • Day 5 of 7
      </div>
    `;

    this.appendTileToContainer(tile);
  }

  /**
   * Load Traffic tile
   */
  async loadWeekTrafficTile(data) {
    const tile = this.createKPITile('traffic-week', {
      title: 'Traffic <br>(Week)',
      value: data.unique_viewers,
      trend: data.traffic_week_over_week_change,
      status: data.traffic_week_over_week_change > 0 ? 'positive' : 'negative',
      definition: kpiDefinitions.weekTraffic.definition,
      whyItMatters: kpiDefinitions.weekTraffic.whyItMatters,
      drillDownFilter: 'traffic'
    });

    const content = tile.querySelector('.kpi-content');
    content.innerHTML = `
      <div class="big-number-container">
        <div class="big-number">${data.unique_viewers.toLocaleString()}</div>
        <div class="sub-text">Total Visitors</div>
      </div>
      <div class="trend ${data.traffic_week_over_week_change > 0 ? 'positive' : 'negative'}">
        ${data.traffic_week_over_week_change > 0 ? '+' : ''}${data.traffic_week_over_week_change}% vs Week ${data.current_week - 1}
      </div>
      <div class="week-day">
        Week ${data.current_week} of 52 • All Stores
      </div>
    `;

    this.appendTileToContainer(tile);
  }

  /**
   * Load Top Performing Categories tile
   */
  async loadTopCategoriesTile(categories) {
    const topCategories = categories;

    const tile = this.createKPITile('top-categories', {
      title: 'Top Performing Categories',
      definition: kpiDefinitions.topCategories.definition,
      whyItMatters: kpiDefinitions.topCategories.whyItMatters,
      drillDownFilter: 'categories'
    });

    const content = tile.querySelector('.kpi-content');
    content.innerHTML = `
      <div class="category-ranking">
        ${topCategories.map((cat, index) => `
          <div class="rank-item" style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-xs) 0; border-bottom: 1px solid var(--light-gray);">
            <span style="font-weight: 600; font-size: 0.875rem;">${index + 1}. ${this.formatCategoryName(cat.name)}</span>
            <div style="display: flex; align-items: center; gap: var(--space-sm);">
              <span style="font-weight: 700; color: var(--dark-gray); min-width: 40px; text-align: right; display: inline-block;">${cat.score}</span>
              <span class="trend ${cat.trend > 0 ? 'positive' : cat.trend < 0 ? 'negative' : 'neutral'}" style="font-size: 0.75rem; min-width: 50px; text-align: center;">
                ${cat.trend > 0 ? '+' : ''}${cat.trend}%
              </span>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    this.appendTileToContainer(tile);
  }




  /**
   * Load Share Activity tile
   */
  async loadShareActivityTile(data) {
    const tile = this.createKPITile('share-activity-week', {
      title: 'Share Activity <br>(Week)',
      value: data.share_total,
      trend: data.share_trend,
      status: data.share_trend > 0 ? 'positive' : 'negative',
      definition: kpiDefinitions.shareActivity.definition,
      whyItMatters: kpiDefinitions.shareActivity.whyItMatters,
      drillDownFilter: 'sharing'
    });

    const content = tile.querySelector('.kpi-content');
    content.innerHTML = `
      <div class="big-number-container">
        <div class="big-number">${data.share_total}</div>
        <div class="sub-text">Total Promotions Shared</div>
      </div>
      <div class="trend ${data.share_trend > 0 ? 'positive' : 'negative'}">
        ${data.share_trend > 0 ? '+' : ''}${data.share_trend}% vs last week
      </div>
      <div class="week-day">
        Social amplification metric
      </div>
    `;

    this.appendTileToContainer(tile);
  }

  /**
   * Load additional panels (performance, categories, promotions)
   */
  async loadAdditionalPanels(contextState) {
    // Get filtered data for additional panels
    const filteredData = this.filterByContext(mockDatabase, contextState);

    await Promise.all([
      this.loadPerformanceContainerRow(filteredData),
      this.loadCategoriesAndPerformanceRow(filteredData),
      this.loadPromotionsPanel(filteredData)
    ]);
  }


  /**
   * Load performance container row (new pattern following categories-performance-row)
   */
  async loadPerformanceContainerRow(filteredData = mockDatabase) {
    // Create the row container following categories-performance-row pattern
    const rowContainer = document.createElement('div');
    rowContainer.className = 'row-container-performance';

    // Create first child: Performance Panel with the specified content
    const performancePanel = document.createElement('div');
    performancePanel.className = 'card';

    const weeklyData = filteredData.weeklyMetrics;
    performancePanel.innerHTML = `
      <div class="card-head">
        <div class="card-head-left">
          <h3>Digital Circular Performance (Day)</h3>
          <button class="info-btn" aria-label="Show definition for Digital Circular Performance" tabindex="0">
            <span aria-hidden="true">i</span>
          </button>
        </div>
        <div class="card-head-right">
          <button class="detail-btn" onclick="window.location.href='datagrid-inquiry/datagrid-inquiry.html?source=performance&filter=performance-metrics'">Inquiry →</button>
        </div>
      </div>
      <div class="card-body">
        <div class="performance-header">
          <h2>Week ${weeklyData.current_week}</h2>
          <div class="date-context">
            ${this.getDateContext(weeklyData.current_week)}
          </div>
        </div>

        <div class="lifecycle-pattern">
          <h4>Engagement Pattern</h4>
          <div class="pattern-bars">
${(() => {
          // Show all 7 days: actual data (Wed-Sun) + future days (Mon-Tue) as 0%
          const actualValues = weeklyData.daily_progression; // [32, 38, 45, 51, 55, null, null]
          const allValues = [
            actualValues[0] || 0, // Wed: 32
            actualValues[1] || 0, // Thu: 38
            actualValues[2] || 0, // Fri: 45
            actualValues[3] || 0, // Sat: 51
            actualValues[4] || 0, // Sun: 55
            0,                    // Mon: 0 (future)
            0                     // Tue: 0 (future)
          ];
          const maxValue = Math.max(...allValues.filter(v => v > 0)); // 55 is the max (ignore 0s)
          const dayLabels = ['WED', 'THU', 'FRI', 'SAT', 'SUN', 'MON', 'TUE'];

          return allValues.map((value, index) => {
            const heightPercent = value > 0 ? Math.round((value / maxValue) * 100) : 0;
            const isFuture = index >= 5; // Mon and Tue are future
            const statusClass = isFuture ? 'future' : 'current';
            const displayValue = value > 0 ? `${heightPercent}%` : '0%';
            const tooltipText = isFuture ? `${dayLabels[index]}: ${value} (future)` : `${dayLabels[index]}: ${value}`;

            return `
                <div class="pattern-bar-container">
                  <div class="pattern-bar ${statusClass}" title="${tooltipText}">
                    <div class="pattern-bar-fill" style="height: ${heightPercent}%"></div>
                  </div>
                  <div class="pattern-value">${displayValue}</div>
                  <div class="pattern-day-label">${dayLabels[index]}</div>
                </div>
              `;
          }).join('');
        })()}
        </div>
      </div>

        <div class="insight">
          <p>Digital circular performance typically builds Wed-Sun, peaking on weekends</p>
          <p>Watch for your trends and increased performance around holidays.</p>
        </div>
      </div>
    `;

    // Create second child: Fresh Interaction Rate donut
    const interactionRatePanel = this.createFreshInteractionRatePanel();

    // Add both children to the row
    rowContainer.appendChild(performancePanel);
    rowContainer.appendChild(interactionRatePanel);

    // Append the row to main container
    this.appendToMainContainer(rowContainer);
  }

  /**
   * Create fresh interaction rate panel (clean implementation)
   */
  createFreshInteractionRatePanel() {
    const container = document.createElement('div');
    container.className = 'card';

    const interactionData = {
      addedToList: 48,
      clickedOnly: 14,
      viewedOnly: 14,
      neverInView: 24
    };

    container.innerHTML = `
      <div class="card-head">
        <div class="card-head-left">
          <h3>Interaction Rate</h3>
          <button class="info-btn" aria-label="Show definition for Interaction Rate" tabindex="0">
            <span aria-hidden="true">i</span>
          </button>
        </div>
        <div class="card-head-right">
          <button class="detail-btn" onclick="window.location.href='datagrid-inquiry/datagrid-inquiry.html?source=interaction&filter=engagement'">Inquiry →</button>
        </div>
      </div>
      <div class="card-body">
        <div class="interaction-donut-container">
          <div class="interaction-donut-chart">
            <svg viewBox="0 0 100 100" class="interaction-donut-svg">
              ${this.generateInteractionFunnelSegments(interactionData)}
            </svg>
          </div>
          <div class="interaction-donut-legend">
            <div class="legend-item">
              <div class="legend-color" style="background-color: var(--green);"></div>
              <span class="legend-label">Added to List — ${interactionData.addedToList}%</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background-color: var(--blue);"></div>
              <span class="legend-label">Clicked Only — ${interactionData.clickedOnly}%</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background-color: var(--medium-gray);"></div>
              <span class="legend-label">Viewed Only — ${interactionData.viewedOnly}%</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background-color: var(--light-gray);"></div>
              <span class="legend-label">Never In View — ${interactionData.neverInView}%</span>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add tooltip content
    const infoBtn = container.querySelector('.info-btn');
    if (infoBtn) {
      const tooltipData = {
        title: 'Interaction Rate Funnel',
        tooltip: '4-segment funnel tracking user engagement from never viewed to added to list, showing complete interaction journey.',
        whyImportant: 'Reveals where users drop off in the engagement process and identifies optimization opportunities.'
      };
      infoBtn.setAttribute('data-tooltip-content', encodeURIComponent(JSON.stringify(tooltipData)));
    }


    return container;
  }



  /**
   * Load Categories and Performance Row
   */
  async loadCategoriesAndPerformanceRow(filteredData = mockDatabase) {
    // Create the flex row container
    const rowContainer = document.createElement('div');
    rowContainer.className = 'categories-performance-row';

    // Create Top Categories tile as a card
    const categoriesContainer = document.createElement('div');
    categoriesContainer.className = 'card chart-card';
    categoriesContainer.id = 'top-categories-card';

    const categories = filteredData.categories || mockDatabase.categories;
    const topCategories = categories;

    categoriesContainer.innerHTML = `
      <div class="card-head">
        <div class="card-head-left">
          <h3>Top Performing Categories</h3>
          <button class="info-btn" aria-label="Show definition for Top Performing Categories" tabindex="0">
            <span aria-hidden="true">i</span>
          </button>
        </div>
        <div class="card-head-right">
          <button class="detail-btn" onclick="window.location.href='datagrid-inquiry/datagrid-inquiry.html?source=categories&filter=category-performance'">Inquiry →</button>
        </div>
      </div>
      <div class="card-body">
        <div class="category-ranking">
          ${topCategories.map((cat, index) => `
          <div class="rank-item" style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-xs) 0; border-bottom: 1px solid var(--light-gray);">
            <span style="font-weight: 600; font-size: 0.875rem;">${index + 1}. ${this.formatCategoryName(cat.name)}</span>
            <div style="display: flex; align-items: center; gap: var(--space-sm);">
              <span style="font-weight: 700; color: var(--dark-gray); min-width: 40px; text-align: right; display: inline-block;">${cat.score}</span>
              <span class="trend ${cat.trend > 0 ? 'positive' : cat.trend < 0 ? 'negative' : 'neutral'}" style="font-size: 0.75rem; min-width: 50px; text-align: center;">
                ${cat.trend > 0 ? '+' : ''}${cat.trend}%
              </span>
            </div>
          </div>
          `).join('')}
        </div>
      </div>
    `;

    // Add tooltip content to Categories info button
    const categoriesInfoBtn = categoriesContainer.querySelector('.info-btn');
    if (categoriesInfoBtn) {
      const tooltipData = {
        title: 'Top Performing Categories',
        tooltip: kpiDefinitions.topCategories.definition,
        whyImportant: kpiDefinitions.topCategories.whyItMatters
      };
      categoriesInfoBtn.setAttribute('data-tooltip-content', encodeURIComponent(JSON.stringify(tooltipData)));
    }

    // Create the promotions chart card
    const promotionsContainer = document.createElement('div');
    promotionsContainer.className = 'card chart-card';
    promotionsContainer.id = 'promotion-performance';

    const topPromotions = (filteredData.getTopPromotions || mockDatabase.getTopPromotions).call(filteredData, 10, 'composite');

    promotionsContainer.innerHTML = `
      <div class="card-head">
        <div class="card-head-left">
          <h3>Top Performing Promotions</h3>
          <button class="info-btn" aria-label="Show definition for Performance" tabindex="0">
            <span aria-hidden="true">i</span>
          </button>
        </div>
        <div class="card-head-right">
          <button class="detail-btn" onclick="window.location.href='datagrid-inquiry/datagrid-inquiry.html?source=promotions&filter=promotion-analysis'">Inquiry →</button>
        </div>
      </div>
      <div class="promo-controls">
        <div class="promo-buttons">
          <button class="score-type-btn active" data-score="composite">Composite</button>
          <button class="score-type-btn" data-score="percentile">Percentile</button>
        </div>
        <div class="promo-topn-input">
          <label for="pp-topn">Top</label>
          <select id="pp-topn" style="background:var(--card);color:var(--text);border:1px solid var(--border);border-radius:8px;padding:4px 8px;font-size:12px">
            <option value="10" selected="">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>
      <div class="card-body">
        <div class="promotion-list">
          ${topPromotions.map((promo, index) => {
          // Handle both enhanced promotions and regular promotions data structures
          const name = promo.name || promo.card_name || 'Unknown Product';
          const score = promo.compositeScore || promo.composite_score || 0;
          const maxScore = topPromotions[0].compositeScore || topPromotions[0].composite_score || 1;
          const percentage = Math.round((score / maxScore) * 100);
          const imageSrc = promo.image_url || promo.thumbnail || 'images/mock-image.png';

          return `
            <div class="promotion-item">
              <div class="promotion-rank">${index + 1}.</div>
              <div class="promotion-thumbnail">
                <img src="${imageSrc}" alt="${name}" onerror="this.src='images/mock-image.png'">
              </div>
              <div class="promotion-details">
                <div class="promotion-name">${name}</div>
                <div class="promotion-meter">
                  <div class="microbar">
                    <div class="microbar-fill" style="width: ${percentage}%"></div>
                  </div>
                  <div class="promotion-score">${score}</div>
                </div>
              </div>
            </div>
          `;
          }).join('')}
        </div>
      </div>
    `;

    // Add tooltip content to Performance info button
    const performanceInfoBtn = promotionsContainer.querySelector('.info-btn');
    if (performanceInfoBtn) {
      const tooltipData = {
        title: 'Enhanced Promotions Performance',
        tooltip: 'Real-time analytics showing current week promotion effectiveness across all circular positions and deal types.',
        whyImportant: 'Critical for understanding which promotion strategies drive the highest engagement and conversion rates.'
      };
      performanceInfoBtn.setAttribute('data-tooltip-content', encodeURIComponent(JSON.stringify(tooltipData)));
    }

    // Add both containers to the row
    rowContainer.appendChild(categoriesContainer);
    rowContainer.appendChild(promotionsContainer);

    // Append the row to the main container
    this.appendToMainContainer(rowContainer);

    // Setup controls for the score type selector
    this.setupSimplePromotionsControls();
  }

  /**
   * Setup sophisticated controls for the promotions performance in categories row
   */
  setupSimplePromotionsControls() {
    // Handle score type toggle buttons
    const scoreTypeButtons = document.querySelectorAll('.score-type-btn');
    scoreTypeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Remove active class from all buttons
        scoreTypeButtons.forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        e.target.classList.add('active');

        const scoreType = e.target.getAttribute('data-score');
        console.log('Score type changed to:', scoreType);

        // Update microbar colors based on score type
        this.updateMicrobarColors(scoreType);
      });
    });

    // Handle Top N select changes
    const topnInput = document.getElementById('pp-topn');
    if (topnInput) {
      topnInput.addEventListener('change', (e) => {
        const topN = parseInt(e.target.value);
        if (topN >= 1 && topN <= 100) {
          console.log('Top N changed to:', topN);

          // Get current score type
          const activeBtn = document.querySelector('.score-type-btn.active');
          const scoreType = activeBtn ? activeBtn.getAttribute('data-score') : 'composite';

          // Update display with new Top N value
          this.updateMicrobarColors(scoreType);
        }
      });
    }
  }

  /**
   * Update promotion data and display based on selected score type
   */
  updateMicrobarColors(scoreType) {
    // Get current Top N value
    const topnInput = document.getElementById('pp-topn');
    const topN = topnInput ? parseInt(topnInput.value) : 10;

    // Get fresh data with the selected score type
    const topPromotions = mockDatabase.getTopPromotions(topN, scoreType);

    // Determine color based on score type
    const color = scoreType === 'composite' ? 'var(--blue)' : 'var(--green)';

    // Update the promotion list with new data
    const promotionList = document.querySelector('#promotion-performance .promotion-list');
    if (promotionList) {
      promotionList.innerHTML = topPromotions.map((promo, index) => {
        // Handle both enhanced promotions and regular promotions data structures
        const name = promo.name || promo.card_name || 'Unknown Product';
        const score = scoreType === 'composite'
          ? (promo.compositeScore || promo.composite_score || 0)
          : (promo.percentileScore || promo.percentile || 0);

        // Calculate percentage based on the maximum score in current dataset
        const maxScore = scoreType === 'composite'
          ? (topPromotions[0].compositeScore || topPromotions[0].composite_score || 1)
          : (topPromotions[0].percentileScore || topPromotions[0].percentile || 1);

        const percentage = Math.round((score / maxScore) * 100);
        const imageSrc = promo.image_url || promo.thumbnail || 'images/mock-image.png';

        return `
          <div class="promotion-item">
            <div class="promotion-rank">${index + 1}.</div>
            <div class="promotion-thumbnail">
              <img src="${imageSrc}" alt="${name}" onerror="this.src='images/mock-image.png'">
            </div>
            <div class="promotion-details">
              <div class="promotion-name">${name}</div>
              <div class="promotion-meter">
                <div class="microbar">
                  <div class="microbar-fill" style="width: ${percentage}%; background-color: ${color};"></div>
                </div>
                <div class="promotion-score">${score}${scoreType === 'percentile' ? '%' : ''}</div>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  /**
   * Load enhanced promotions panel with prototype_001 design
   */
  async loadPromotionsPanel(filteredData = mockDatabase) {
    // Create row container for size-deal section only
    const rowContainer = document.createElement('div');
    rowContainer.className = 'dashboard-row-week';

    // Create the size-deal analytics section
    const sizeDealContainer = this.createSizeDealSection();

    // Add tooltip content to Size-Deal section info buttons
    const sizeClassMixBtn = sizeDealContainer.querySelector('.card:nth-child(1) .info-btn');
    if (sizeClassMixBtn) {
      const tooltipData = {
        title: 'Size Class Mix Analysis',
        tooltip: 'Distribution breakdown of promotion performance across different product size categories and pack configurations.',
        whyImportant: 'Helps optimize inventory planning and promotional strategy based on size preference patterns.'
      };
      sizeClassMixBtn.setAttribute('data-tooltip-content', encodeURIComponent(JSON.stringify(tooltipData)));
    }

    const sizePerformanceBtn = sizeDealContainer.querySelector('.card:nth-child(2) .info-btn');
    if (sizePerformanceBtn) {
      const tooltipData = {
        title: 'Size Performance Rankings',
        tooltip: 'Comparative performance metrics showing which product sizes generate the highest engagement and conversion rates.',
        whyImportant: 'Identifies the most effective size categories for promotional focus and resource allocation.'
      };
      sizePerformanceBtn.setAttribute('data-tooltip-content', encodeURIComponent(JSON.stringify(tooltipData)));
    }

    const dealTypeBtn = sizeDealContainer.querySelector('.card:nth-child(3) .info-btn');
    if (dealTypeBtn) {
      const tooltipData = {
        title: 'Deal Type Preference Analysis',
        tooltip: 'Customer preference patterns across different promotional deal types including discounts, BOGO, and premium offers.',
        whyImportant: 'Guides promotional strategy by showing which deal structures resonate most with your customer base.'
      };
      dealTypeBtn.setAttribute('data-tooltip-content', encodeURIComponent(JSON.stringify(tooltipData)));
    }

    // Add components to the row container
    rowContainer.appendChild(sizeDealContainer);

    // Append the row container to main content
    this.appendToMainContainer(rowContainer);

    // Add event listeners for size-deal charts
    this.setupSizeDealCharts();
  }

  /**
   * Setup interactive controls for promotions panel
   */
  setupPromotionsPanelControls() {
    const topNSelect = document.getElementById('pp-topn');
    const toggleButtons = document.querySelectorAll('.toggle-btn');

    // Handle top N selection
    if (topNSelect) {
      topNSelect.addEventListener('change', (e) => {
        this.updatePromotionsDisplay(parseInt(e.target.value), this.getCurrentScoreType());
      });
    }

    // Handle score type toggle
    toggleButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        // Update active state
        toggleButtons.forEach(btn => btn.classList.remove('is-active'));
        e.target.classList.add('is-active');

        const scoreType = e.target.dataset.mode;
        const topN = topNSelect ? parseInt(topNSelect.value) : 10;
        this.updatePromotionsDisplay(topN, scoreType);
      });
    });
  }

  /**
   * Update promotions display based on controls
   */
  updatePromotionsDisplay(count, scoreType) {
    const promotions = mockDatabase.getTopPromotions(count, scoreType);
    const barsContainer = document.getElementById('pp-bars');

    if (!barsContainer || promotions.length === 0) return;

    const scoreKey = scoreType === 'composite' ? 'compositeScore' : 'percentileScore';
    const maxScore = promotions[0][scoreKey];

    barsContainer.innerHTML = promotions.map(promo => {
      const percentage = Math.round((promo[scoreKey] / maxScore) * 100);
      return `
        <div class="bar" role="listitem">
          <img class="thumb" alt="" src="${promo.thumbnail}" onerror="this.style.display='none'">
          <div class="label" title="${promo.name}">${promo.name}</div>
          <div class="meter">
            <div class="microbar">
              <div class="microbar-shell">
                <div class="microbar-fill" data-target="${percentage}" style="width: ${percentage}%; background: var(--green);"></div>
              </div>
            </div>
          </div>
          <div class="val">${promo[scoreKey]}</div>
        </div>
      `;
    }).join('');
  }

  /**
   * Get current score type from toggle buttons
   */
  getCurrentScoreType() {
    const activeToggle = document.querySelector('.toggle-btn.is-active');
    return activeToggle ? activeToggle.dataset.mode : 'composite';
  }

  /**
   * Create general Interaction Rate card
   */
  createInteractionRateCard() {
    const dealAnalytics = this.calculateDealAnalytics();

    const container = document.createElement('div');
    container.className = 'card chart-card';
    container.id = 'general-interaction-rate';

    container.innerHTML = `
      <div class="card-head">
        <div class="card-head-left">
          <h3>Interaction Rate</h3>
          <button class="info-btn" aria-label="Show definition for Interaction Rate" tabindex="0">
            <span aria-hidden="true">i</span>
          </button>
        </div>
        <div class="card-head-right">
          <button class="detail-btn" onclick="window.location.href='datagrid-inquiry/datagrid-inquiry.html?source=interaction&filter=engagement'">Inquiry →</button>
        </div>
      </div>
      <div class="card-body">
        <div id="general-interaction-chart" class="chart-host">
          <div class="interaction-donut-container">
            <div class="interaction-donut-chart">
              <svg viewBox="0 0 100 100" class="interaction-donut-svg">
                ${this.generateInteractionFunnelSegments(dealAnalytics.interactionData)}
                <text x="50" y="42" class="donut-center-text" text-anchor="middle">Interaction</text>
                <text x="50" y="55" class="donut-center-text" text-anchor="middle">Funnel</text>
              </svg>
            </div>
            <div class="interaction-donut-legend">
              <div class="legend-item">
                <span class="legend-color" style="background-color: var(--green);"></span>
                <span class="legend-label">Added to List — ${dealAnalytics.interactionData.addedToList}%</span>
              </div>
              <div class="legend-item">
                <span class="legend-color" style="background-color: var(--blue);"></span>
                <span class="legend-label">Clicked Only — ${dealAnalytics.interactionData.clickedOnly}%</span>
              </div>
              <div class="legend-item">
                <span class="legend-color" style="background-color: #9CA3AF;"></span>
                <span class="legend-label">Viewed Only — ${dealAnalytics.interactionData.viewedOnly}%</span>
              </div>
              <div class="legend-item">
                <span class="legend-color" style="background-color: #E5E7EB;"></span>
                <span class="legend-label">Never In View — ${dealAnalytics.interactionData.neverInView}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    return container;
  }

  /**
   * Create the Size & Deal analytics section
   */
  createSizeDealSection() {
    const container = document.createElement('div');
    container.className = 'size-deal';

    // Calculate size and deal analytics from our data
    const sizeAnalytics = this.calculateSizeAnalytics();
    const dealAnalytics = this.calculateDealAnalytics();

    container.innerHTML = `
      <div class="grid two-up">
        <!-- Card Size Section -->
        <div class="size">
          <h5 class="subsection-header">Card Size</h5>
          <div class="grid two-col">
            <div class="card small">
              <div class="card-head">
                <div class="card-head-left">
                  <h3>Size Class Mix</h3>
                  <button class="info-btn" aria-label="Show definition for Size Class Mix" tabindex="0">
                    <span aria-hidden="true">i</span>
                  </button>
                </div>
                <div class="card-head-right">
                  <button class="detail-btn" onclick="window.location.href='datagrid-inquiry/datagrid-inquiry.html?source=size-analysis&filter=size-mix'">Inquiry →</button>
                </div>
              </div>
              <div class="card-body">
                <div id="size-mix-chart" class="chart-host">
                  <div class="donut-chart-container">
                    <div class="donut-chart">
                      <svg viewBox="0 0 100 100" class="donut-svg">
                        ${this.generateDonutSegments(sizeAnalytics.distribution)}
                        <text x="50" y="45" class="donut-center-text" text-anchor="middle">Class</text>
                        <text x="50" y="58" class="donut-center-text" text-anchor="middle">Mix</text>
                      </svg>
                    </div>
                    <div class="donut-legend">
                      ${Object.entries(sizeAnalytics.distribution).map(([size, data], index) => `
                        <div class="legend-item">
                          <span class="legend-color" style="background-color: ${this.getSizeColor(index)};"></span>
                          <span class="legend-label">${size} — ${data.percentage}%</span>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="card small">
              <div class="card-head">
                <div class="card-head-left">
                  <h3>Size Performance</h3>
                  <button class="info-btn" aria-label="Show definition for Size Performance" tabindex="0">
                    <span aria-hidden="true">i</span>
                  </button>
                </div>
                <div class="card-head-right">
                  <button class="detail-btn" onclick="window.location.href='datagrid-inquiry/datagrid-inquiry.html?source=size-performance&filter=performance-ranking'">Inquiry →</button>
                </div>
              </div>
              <div class="card-body">
                <div id="best-size-chart" class="chart-host">
                  <div class="horizontal-bar-chart">
                    ${Object.entries(sizeAnalytics.distribution)
                      .sort((a, b) => b[1].avgScore - a[1].avgScore)
                      .map(([size, data], index) => {
                        const maxScore = Math.max(...Object.values(sizeAnalytics.distribution).map(d => d.avgScore));
                        const barWidth = (data.avgScore / maxScore) * 100;
                        const isHighest = index === 0;
                        return `
                          <div class="bar-item ${isHighest ? 'highest' : ''}">
                            <div class="bar-label">${size}</div>
                            <div class="bar-container">
                              <div class="bar-fill" style="width: ${barWidth}%"></div>
                            </div>
                            <div class="bar-value">${data.avgScore}</div>
                          </div>
                        `;
                      }).join('')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Deal Type Section -->
        <div class="deal">
          <h5 class="subsection-header">Deal Type</h5>
          <div class="card small">
            <div class="card-head">
              <div class="card-head-left">
                <h3>Deal Type Preference</h3>
                <button class="info-btn" aria-label="Show definition for Deal Type Preference" tabindex="0">
                  <span aria-hidden="true">i</span>
                </button>
              </div>
              <div class="card-head-right">
                <button class="detail-btn" onclick="window.location.href='datagrid-inquiry/datagrid-inquiry.html?source=deal-preference&filter=deal-type'">Inquiry →</button>
              </div>
            </div>
            <div class="card-body">
              <div id="deal-preference-chart" class="chart-host">
                <div class="deal-preference-donut-container">
                  <div class="deal-preference-donut-chart">
                    <svg viewBox="0 0 100 100" class="deal-preference-donut-svg">
                      ${this.generateDealPreferenceDonutSegments(dealAnalytics.dealPreference)}
                      <text x="50" y="45" class="donut-center-text" text-anchor="middle">Deal</text>
                      <text x="50" y="58" class="donut-center-text" text-anchor="middle">Preference</text>
                    </svg>
                  </div>
                  <div class="deal-preference-donut-legend">
                    ${Object.entries(dealAnalytics.dealPreference).map(([dealType, data], index) => `
                      <div class="legend-item">
                        <span class="legend-color" style="background-color: ${this.getDealPreferenceColor(index)};"></span>
                        <span class="legend-label">${dealType} — ${data.percentage}%</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    return container;
  }

  /**
   * Calculate size analytics from promotion data
   */
  calculateSizeAnalytics() {
    const promotions = mockDatabase.promotions || [];
    const sizeData = {};
    let totalPromotions = 0;

    promotions.forEach(promo => {
      const size = promo.card_size || '1X1';
      if (!sizeData[size]) {
        sizeData[size] = { count: 0, scores: [] };
      }
      sizeData[size].count++;
      sizeData[size].scores.push(promo.composite_score || 0);
      totalPromotions++;
    });

    const distribution = {};
    let bestPerforming = { size: '1X1', avgScore: 0 };

    Object.entries(sizeData).forEach(([size, data]) => {
      const avgScore = Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length);
      const percentage = Math.round((data.count / totalPromotions) * 100);

      distribution[size] = {
        count: data.count,
        percentage: percentage,
        avgScore: avgScore
      };

      if (avgScore > bestPerforming.avgScore) {
        bestPerforming = { size, avgScore };
      }
    });

    return { distribution, bestPerforming };
  }

  /**
   * Calculate deal type analytics from promotion data
   */
  calculateDealAnalytics() {
    const promotions = mockDatabase.promotions || [];
    const dealData = {};
    let totalInteractionRate = 0;
    let maxScore = 0;

    let totalExpandedInteractions = 0;
    let totalInteractions = 0;

    promotions.forEach(promo => {
      const dealType = promo.deal_type || 'Multi-Buy';
      if (!dealData[dealType]) {
        dealData[dealType] = { scores: [], count: 0 };
      }
      dealData[dealType].scores.push(promo.composite_score || 0);
      dealData[dealType].count++;

      totalExpandedInteractions += (promo.expanded_interactions || 0);
      totalInteractions += (promo.total_interactions || promo.card_clicked || 50);
      maxScore = Math.max(maxScore, promo.composite_score || 0);
    });

    const effectiveness = {};
    Object.entries(dealData).forEach(([dealType, data]) => {
      const avgScore = Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length);
      effectiveness[dealType] = { avgScore, count: data.count };
    });

    // Calculate expanded interaction rate (28% as shown in prototype)
    const expandedRate = Math.round((totalExpandedInteractions / totalInteractions) * 100);
    const avgInteractionRate = expandedRate;

    // Calculate 4-segment interaction funnel using average percentages
    const totalPromotions = promotions.length;

    // Calculate average engagement rates across all promotions
    const avgCardInView = Math.round(promotions.reduce((sum, promo) => sum + (promo.card_in_view || 0), 0) / totalPromotions);
    const avgCardClicked = Math.round(promotions.reduce((sum, promo) => sum + (promo.card_clicked || 0), 0) / totalPromotions);
    const avgAddedToList = Math.round(promotions.reduce((sum, promo) => sum + (promo.added_to_list || 0), 0) / totalPromotions);

    // Calculate funnel segments as percentages of total engagement
    // Assume card_in_view represents the base (100% of cards that could be viewed)
    const baseEngagement = 100; // Total possible engagement

    const addedToListPct = Math.round((avgAddedToList / baseEngagement) * 100);
    const clickedOnlyPct = Math.round(((avgCardClicked - avgAddedToList) / baseEngagement) * 100);
    const viewedOnlyPct = Math.round(((avgCardInView - avgCardClicked) / baseEngagement) * 100);
    const neverInViewPct = Math.round(((baseEngagement - avgCardInView) / baseEngagement) * 100);

    // Ensure segments sum to 100% (adjust largest segment if needed)
    const totalCheck = neverInViewPct + viewedOnlyPct + clickedOnlyPct + addedToListPct;
    const adjustment = 100 - totalCheck;

    const interactionData = {
      neverInView: neverInViewPct + (adjustment > 0 ? adjustment : 0),
      viewedOnly: viewedOnlyPct,
      clickedOnly: clickedOnlyPct,
      addedToList: addedToListPct,
      // Legacy support for existing expanded/not expanded
      expanded: expandedRate,
      notExpanded: 100 - expandedRate
    };

    // Calculate deal type preference (interaction volume distribution)
    const dealPreference = {};
    Object.entries(dealData).forEach(([dealType, data]) => {
      const totalInteractions = data.scores.length; // Number of promotions of this deal type
      const percentage = Math.round((totalInteractions / promotions.length) * 100);
      dealPreference[dealType] = { count: totalInteractions, percentage };
    });

    return { effectiveness, avgInteractionRate, maxScore, interactionData, dealPreference };
  }

  /**
   * Generate SVG donut chart segments
   */
  generateDonutSegments(distribution) {
    const total = Object.values(distribution).reduce((sum, data) => sum + data.count, 0);
    let currentAngle = 0;
    const segments = [];

    Object.entries(distribution).forEach(([size, data], index) => {
      const percentage = data.percentage;
      const angle = (percentage / 100) * 360;
      const largeArcFlag = angle > 180 ? 1 : 0;

      const startAngle = (currentAngle * Math.PI) / 180;
      const endAngle = ((currentAngle + angle) * Math.PI) / 180;

      const outerRadius = 40;
      const innerRadius = 25;

      const x1 = 50 + outerRadius * Math.cos(startAngle);
      const y1 = 50 + outerRadius * Math.sin(startAngle);
      const x2 = 50 + outerRadius * Math.cos(endAngle);
      const y2 = 50 + outerRadius * Math.sin(endAngle);

      const x3 = 50 + innerRadius * Math.cos(endAngle);
      const y3 = 50 + innerRadius * Math.sin(endAngle);
      const x4 = 50 + innerRadius * Math.cos(startAngle);
      const y4 = 50 + innerRadius * Math.sin(startAngle);

      const pathData = [
        `M ${x1} ${y1}`,
        `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        `L ${x3} ${y3}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
        'Z'
      ].join(' ');

      segments.push(`<path d="${pathData}" fill="${this.getSizeColor(index)}" class="donut-segment" data-size="${size}" data-percentage="${percentage}"/>`);

      currentAngle += angle;
    });

    return segments.join('');
  }

  /**
   * Get color for size chart segments
   */
  getSizeColor(index) {
    const colors = ['var(--green)', 'var(--blue)', 'var(--warning-amber)', 'var(--chart-accent)'];
    return colors[index % colors.length];
  }

  /**
   * Generate SVG donut chart segments for interaction data
   */
  generateInteractionDonutSegments(interactionData) {
    const segments = [];
    const { expanded, notExpanded } = interactionData;

    // Expanded segment (green) - starts at top
    const expandedAngle = (expanded / 100) * 360;
    const expandedLargeArcFlag = expandedAngle > 180 ? 1 : 0;

    const expandedStartAngle = -90 * Math.PI / 180; // Start at top
    const expandedEndAngle = (-90 + expandedAngle) * Math.PI / 180;

    const outerRadius = 40;
    const innerRadius = 25;

    // Expanded segment path
    const ex1 = 50 + outerRadius * Math.cos(expandedStartAngle);
    const ey1 = 50 + outerRadius * Math.sin(expandedStartAngle);
    const ex2 = 50 + outerRadius * Math.cos(expandedEndAngle);
    const ey2 = 50 + outerRadius * Math.sin(expandedEndAngle);
    const ex3 = 50 + innerRadius * Math.cos(expandedEndAngle);
    const ey3 = 50 + innerRadius * Math.sin(expandedEndAngle);
    const ex4 = 50 + innerRadius * Math.cos(expandedStartAngle);
    const ey4 = 50 + innerRadius * Math.sin(expandedStartAngle);

    const expandedPath = [
      `M ${ex1} ${ey1}`,
      `A ${outerRadius} ${outerRadius} 0 ${expandedLargeArcFlag} 1 ${ex2} ${ey2}`,
      `L ${ex3} ${ey3}`,
      `A ${innerRadius} ${innerRadius} 0 ${expandedLargeArcFlag} 0 ${ex4} ${ey4}`,
      'Z'
    ].join(' ');

    segments.push(`<path d="${expandedPath}" fill="var(--green)" class="donut-segment" data-type="expanded" data-percentage="${expanded}"/>`);

    // Not Expanded segment (blue) - remainder of circle
    const notExpandedAngle = (notExpanded / 100) * 360;
    const notExpandedLargeArcFlag = notExpandedAngle > 180 ? 1 : 0;

    const notExpandedStartAngle = expandedEndAngle;
    const notExpandedEndAngle = expandedStartAngle + (2 * Math.PI);

    const nx1 = 50 + outerRadius * Math.cos(notExpandedStartAngle);
    const ny1 = 50 + outerRadius * Math.sin(notExpandedStartAngle);
    const nx2 = 50 + outerRadius * Math.cos(notExpandedEndAngle);
    const ny2 = 50 + outerRadius * Math.sin(notExpandedEndAngle);
    const nx3 = 50 + innerRadius * Math.cos(notExpandedEndAngle);
    const ny3 = 50 + innerRadius * Math.sin(notExpandedEndAngle);
    const nx4 = 50 + innerRadius * Math.cos(notExpandedStartAngle);
    const ny4 = 50 + innerRadius * Math.sin(notExpandedStartAngle);

    const notExpandedPath = [
      `M ${nx1} ${ny1}`,
      `A ${outerRadius} ${outerRadius} 0 ${notExpandedLargeArcFlag} 1 ${nx2} ${ny2}`,
      `L ${nx3} ${ny3}`,
      `A ${innerRadius} ${innerRadius} 0 ${notExpandedLargeArcFlag} 0 ${nx4} ${ny4}`,
      'Z'
    ].join(' ');

    segments.push(`<path d="${notExpandedPath}" fill="var(--blue)" class="donut-segment" data-type="not-expanded" data-percentage="${notExpanded}"/>`);

    return segments.join('');
  }

  /**
   * Generate SVG donut chart segments for 4-segment interaction funnel
   */
  generateInteractionFunnelSegments(interactionData) {
    const segments = [];
    const { neverInView, viewedOnly, clickedOnly, addedToList } = interactionData;
    const segmentData = [
      { name: 'neverInView', percentage: neverInView, color: '#E5E7EB' },
      { name: 'viewedOnly', percentage: viewedOnly, color: '#9CA3AF' },
      { name: 'clickedOnly', percentage: clickedOnly, color: 'var(--blue)' },
      { name: 'addedToList', percentage: addedToList, color: 'var(--green)' }
    ];

    let currentAngle = 0;
    const outerRadius = 40;
    const innerRadius = 25;

    segmentData.forEach((segment) => {
      if (segment.percentage > 0) {
        const angle = (segment.percentage / 100) * 360;
        const largeArcFlag = angle > 180 ? 1 : 0;

        const startAngle = (currentAngle * Math.PI) / 180;
        const endAngle = ((currentAngle + angle) * Math.PI) / 180;

        const x1 = 50 + outerRadius * Math.cos(startAngle);
        const y1 = 50 + outerRadius * Math.sin(startAngle);
        const x2 = 50 + outerRadius * Math.cos(endAngle);
        const y2 = 50 + outerRadius * Math.sin(endAngle);

        const x3 = 50 + innerRadius * Math.cos(endAngle);
        const y3 = 50 + innerRadius * Math.sin(endAngle);
        const x4 = 50 + innerRadius * Math.cos(startAngle);
        const y4 = 50 + innerRadius * Math.sin(startAngle);

        const pathData = [
          `M ${x1} ${y1}`,
          `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
          `L ${x3} ${y3}`,
          `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
          'Z'
        ].join(' ');

        segments.push(`<path d="${pathData}" fill="${segment.color}" class="donut-segment" data-type="${segment.name}" data-percentage="${segment.percentage}"/>`);

        currentAngle += angle;
      }
    });

    return segments.join('');
  }

  /**
   * Generate SVG donut chart segments for deal preference data
   */
  generateDealPreferenceDonutSegments(dealPreference) {
    const total = Object.values(dealPreference).reduce((sum, data) => sum + data.count, 0);
    let currentAngle = 0;
    const segments = [];

    Object.entries(dealPreference).forEach(([dealType, data], index) => {
      const percentage = data.percentage;
      const angle = (percentage / 100) * 360;
      const largeArcFlag = angle > 180 ? 1 : 0;

      const startAngle = (currentAngle * Math.PI) / 180;
      const endAngle = ((currentAngle + angle) * Math.PI) / 180;

      const outerRadius = 40;
      const innerRadius = 25;

      const x1 = 50 + outerRadius * Math.cos(startAngle);
      const y1 = 50 + outerRadius * Math.sin(startAngle);
      const x2 = 50 + outerRadius * Math.cos(endAngle);
      const y2 = 50 + outerRadius * Math.sin(endAngle);

      const x3 = 50 + innerRadius * Math.cos(endAngle);
      const y3 = 50 + innerRadius * Math.sin(endAngle);
      const x4 = 50 + innerRadius * Math.cos(startAngle);
      const y4 = 50 + innerRadius * Math.sin(startAngle);

      const pathData = [
        `M ${x1} ${y1}`,
        `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        `L ${x3} ${y3}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
        'Z'
      ].join(' ');

      segments.push(`<path d="${pathData}" fill="${this.getDealPreferenceColor(index)}" class="donut-segment" data-deal="${dealType}" data-percentage="${percentage}"/>`);

      currentAngle += angle;
    });

    return segments.join('');
  }

  /**
   * Get color for deal preference chart segments
   */
  getDealPreferenceColor(index) {
    const colors = ['var(--blue)', 'var(--green)', 'var(--warning-amber)', 'var(--danger-red)', 'var(--chart-accent)'];
    return colors[index % colors.length];
  }

  /**
   * Setup charts for size and deal analytics (placeholder for future chart integration)
   */
  setupSizeDealCharts() {
    // Future: Initialize ECharts or other charting library here
    console.log('Size & Deal charts initialized');
  }

  /**
   * Create a KPI tile with standard structure
   */
  createKPITile(id, config) {
    const tile = document.createElement('div');
    tile.className = `kpi-tile ${config.status || ''}`;
    tile.id = id;

    tile.innerHTML = `
      <div class="card-head">
        <div class="card-head-left">
          <h3>${config.title}</h3>
          <button class="info-btn" aria-label="Show definition for ${config.title}" tabindex="0">
            <span aria-hidden="true">i</span>
          </button>
        </div>
        <div class="card-head-right">
          <button class="detail-btn" onclick="window.location.href='datagrid-inquiry/datagrid-inquiry.html?source=grid-drilldown&filter=${config.drillDownFilter || 'all'}'">Inquiry →</button>
        </div>
      </div>
      <div class="kpi-content">
        <!-- Content will be filled by specific tile loaders -->
      </div>
    `;

    // Add tooltip content to the info button
    const infoBtn = tile.querySelector('.info-btn');
    if (infoBtn) {
      const tooltipData = {
        title: config.title,
        tooltip: config.definition || '',
        whyImportant: config.whyItMatters || ''
      };
      infoBtn.setAttribute('data-tooltip-content', encodeURIComponent(JSON.stringify(tooltipData)));
    }

    return tile;
  }

  /**
   * Append tile to dashboard grid container
   */
  appendTileToContainer(tile) {
    let container = document.querySelector('.dashboard-row-week');

    if (!container) {
      container = document.createElement('div');
      container.className = 'dashboard-row-week';
      this.appendToMainContainer(container);
    }

    container.appendChild(tile);
  }

  /**
   * Append element to main container
   */
  appendToMainContainer(element) {
    let container = document.querySelector('.container');

    if (!container) {
      container = document.createElement('div');
      container.className = 'container';

      // Insert after YTD strip or nav, or at end of body
      const ytdStrip = document.querySelector('.ytd-strip');
      const nav = document.querySelector('.main-nav');

      if (ytdStrip) {
        ytdStrip.insertAdjacentElement('afterend', container);
      } else if (nav) {
        nav.insertAdjacentElement('afterend', container);
      } else {
        document.body.appendChild(container);
      }
    }

    container.appendChild(element);
  }

  /**
   * Render week trend chart using Canvas
   */
  renderWeekTrendChart(data) {
    const canvas = document.getElementById('weekTrendChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Chart settings
    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const validData = data.filter(d => d !== null);
    const maxValue = Math.max(...validData);
    const minValue = Math.min(...validData);
    const range = maxValue - minValue || 1;

    // Draw grid lines
    ctx.strokeStyle = '#ECF0F1';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight * i / 4);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw data line
    ctx.strokeStyle = '#3498DB';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    data.forEach((value, index) => {
      if (value !== null) {
        const x = padding + (chartWidth * index / (data.length - 1));
        const y = padding + chartHeight - ((value - minValue) / range * chartHeight);

        if (index === 0 || data[index - 1] === null) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
    });
    ctx.stroke();

    // Draw data points
    ctx.fillStyle = '#3498DB';
    data.forEach((value, index) => {
      if (value !== null) {
        const x = padding + (chartWidth * index / (data.length - 1));
        const y = padding + chartHeight - ((value - minValue) / range * chartHeight);

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  /**
   * Initialize tooltip system
   */
  initializeTooltips() {
    // Call the new tooltip initialization
    this.initTooltips();
  }

  /**
   * Show loading state
   */
  showLoading() {
    if (this.isLoading) return;

    this.isLoading = true;
    document.body.classList.add('loading');

    // Create loading overlay
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <div>Loading dashboard data...</div>
      </div>
    `;

    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      font-family: var(--font-primary);
    `;

    overlay.querySelector('.loading-content').style.cssText = `
      text-align: center;
      color: var(--primary-navy);
    `;

    overlay.querySelector('.loading-spinner').style.cssText = `
      width: 40px;
      height: 40px;
      border: 3px solid var(--light-gray);
      border-top: 3px solid var(--primary-blue);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto var(--space-md) auto;
    `;

    document.body.appendChild(overlay);
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    this.isLoading = false;
    document.body.classList.remove('loading');

    const overlay = document.querySelector('.loading-overlay');
    if (overlay) {
      overlay.remove();
    }
  }

  /**
   * Show error message
   */
  showError(title, message) {
    console.error(`${title}: ${message}`);

    const alert = document.createElement('div');
    alert.className = 'alert alert-danger';
    alert.innerHTML = `
      <h4>${title}</h4>
      <p>${message}</p>
      <button onclick="this.parentElement.remove()" class="btn btn-secondary">Dismiss</button>
    `;

    // Insert at top of container
    const container = document.querySelector('.container') || document.body;
    container.insertBefore(alert, container.firstChild);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (alert.parentElement) {
        alert.remove();
      }
    }, 10000);
  }

  /**
   * Utility: Convert UPPERCASE category names to Proper Case
   */
  formatCategoryName(category) {
    if (!category) return '';
    return category
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Utility: Format large numbers
   */
  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  }

  /**
   * Utility: Add loading delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get date context for performance panel
   */
  getDateContext(weekNumber) {
    const today = new Date();
    const currentWeek = 40; // This should match your current week from data

    if (weekNumber === currentWeek) {
      // Current week - show today's date and day progress
      const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });
      const monthDay = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      const dayOfWeekNumber = today.getDay(); // 0=Sunday, 1=Monday, etc.
      // Convert to circular week (Wed=1, Thu=2, Fri=3, Sat=4, Sun=5, Mon=6, Tue=7)
      const circularDay = dayOfWeekNumber === 0 ? 5 : // Sunday = 5
                         dayOfWeekNumber === 1 ? 6 : // Monday = 6
                         dayOfWeekNumber === 2 ? 7 : // Tuesday = 7
                         dayOfWeekNumber - 2;       // Wed=1, Thu=2, Fri=3, Sat=4

      return `Today: ${dayOfWeek}, ${monthDay} • Day ${circularDay} of 7`;
    } else {
      // Previous week - show week date range
      const baseDate = new Date(2024, 9, 3); // Oct 3, 2024 (Week 40 start)
      const weekStart = new Date(baseDate);
      weekStart.setDate(baseDate.getDate() + ((weekNumber - 40) * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const startStr = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endStr = weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      return `Week ${weekNumber}: ${startStr} - ${endStr}`;
    }
  }

  // Placeholder methods for other pages
  async loadExplorePage() {
    console.log('🔍 Loading explore page...');
    await this.delay(this.loadDelay);
    // TODO: Implement explore page content
  }

  async loadAnalyzePage() {
    console.log('📊 Loading analyze page...');
    await this.delay(this.loadDelay);
    // TODO: Implement analyze page content
  }

  async loadReportsPage() {
    console.log('📄 Loading reports page...');
    await this.delay(this.loadDelay);
    // TODO: Implement reports page content
  }

  /**
   * Initialize tooltip functionality for info buttons
   */
  initTooltips() {
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
      if (e.key === 'Enter' || e.key === ' ') {
        if (e.target.classList.contains('info-btn')) {
          e.preventDefault();
          const btn = e.target;
          this.toggleTooltip(btn);
        }
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
   * Toggle tooltip visibility for a button
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
   * Open tooltip for a button
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

    // Get tooltip dimensions (overlay is already in DOM but hidden)
    const overlayRect = overlay.getBoundingClientRect();
    const overlayWidth = overlayRect.width;
    const overlayHeight = overlayRect.height;

    let left, top, position = 'bottom';

    // Try to position below the button first (preferred)
    if (btnRect.bottom + overlayHeight + 10 <= viewportHeight) {
      position = 'bottom';
      top = btnRect.bottom + 8;
      left = btnRect.left + (btnRect.width / 2) - 32; // Offset for arrow position
    }
    // Try above if no room below
    else if (btnRect.top - overlayHeight - 10 >= 0) {
      position = 'top';
      top = btnRect.top - overlayHeight - 8;
      left = btnRect.left + (btnRect.width / 2) - 32;
      overlay.classList.add('position-top');
    }
    // Try to the right
    else if (btnRect.right + overlayWidth + 10 <= viewportWidth) {
      position = 'right';
      top = btnRect.top + (btnRect.height / 2) - (overlayHeight / 2);
      left = btnRect.right + 8;
      overlay.classList.add('position-right');
    }
    // Try to the left
    else if (btnRect.left - overlayWidth - 10 >= 0) {
      position = 'left';
      top = btnRect.top + (btnRect.height / 2) - (overlayHeight / 2);
      left = btnRect.left - overlayWidth - 8;
      overlay.classList.add('position-left');
    }
    // Fallback: position below but adjust horizontally to fit
    else {
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
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Global KPI definitions for tooltips
const kpiDefinitions = {
  weekPerformance: {
    title: "Digital Circular Performance (Week)",
    definition: "Compares total promotion engagement this week against last week's performance",
    whyItMatters: "Quickly identify if your circular is trending up or down, enabling early course corrections",
    calculation: "Sum of all card_in_view scores for current week / previous week"
  },
  weekTraffic: {
    title: "Traffic (Week)",
    definition: "Total unique visitors across all stores viewing digital circular content this week compared to last week",
    whyItMatters: "Monitor overall audience reach and engagement trends to identify seasonal patterns and marketing effectiveness",
    calculation: "Sum of unique visitors current week vs previous week"
  },
  topCategories: {
    title: "Top Performing Categories",
    definition: "Shows which product categories are driving the most customer engagement",
    whyItMatters: "Double down on successful categories and apply winning strategies to underperformers",
    calculation: "Average card_in_view score by category, ranked"
  },
  underperformingAlerts: {
    title: "Underperforming Alerts",
    definition: "Identifies promotions performing significantly below average that may need immediate adjustment",
    whyItMatters: "Catch failing promotions early to swap products or adjust pricing mid-week",
    threshold: "Items with score < 40 or categories with score < 20"
  },
  currentWeekTrend: {
    title: "Current Week Trend",
    definition: "Shows daily engagement accumulation to reveal if performance is accelerating or declining",
    whyItMatters: "Understand if weekend performance will recover or if immediate action is needed",
    visualization: "Line chart of daily cumulative engagement"
  },
  quickWin: {
    title: "Quick Win Opportunity",
    definition: "Highlights the most effective promotion size and placement combination currently working",
    whyItMatters: "Apply winning layout strategies to improve underperforming promotions",
    calculation: "Correlation analysis of size + position + engagement"
  },
  shareActivity: {
    title: "Share Activity (Week)",
    definition: "Tracks how often customers share your promotions socially, indicating brand amplification",
    whyItMatters: "Understand which promotions generate word-of-mouth marketing beyond your direct reach",
    metric: "Total share button clicks this week vs last"
  }
};

// Add spin animation for loading spinner
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

// Initialize dashboard when DOM is ready
const dashboard = new AnalyticsDashboard();
dashboard.init();

// Export for global access
window.AnalyticsDashboard = dashboard;