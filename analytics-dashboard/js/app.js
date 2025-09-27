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

    // Simulate 200ms load time for all data operations
    this.loadDelay = 200;
  }

  /**
   * Initialize the dashboard
   */
  async init() {
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

      // Load page-specific content
      await this.loadPageContent();

      // Initialize tooltips
      this.initializeTooltips();

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
          <li><a href="explore.html" class="nav-item">Explore</a></li>
          <li><a href="analyze.html" class="nav-item">Analyze</a></li>
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
   * Initialize context bar with user context
   */
  initializeContextBar() {
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
   * Update context and reload data
   */
  async updateContext(key, value) {
    if (this.currentContext[key] === value) return;

    console.log(`📊 Updating context: ${key} = ${value}`);
    this.currentContext[key] = value;

    // Reload page content with new context
    await this.loadPageContent();
  }

  /**
   * Load content specific to current page
   */
  async loadPageContent() {
    this.showLoading();

    try {
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

    // Load YTD metrics
    await this.loadYTDStrip();

    // Load 6 KPI tiles
    await this.loadKPITiles();

    // Load additional panels
    await this.loadAdditionalPanels();
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
  async loadKPITiles() {
    const weeklyData = mockDatabase.weeklyMetrics;
    const categories = mockDatabase.categories;

    // Load each KPI tile
    await Promise.all([
      this.loadWeekPerformanceTile(weeklyData),
      this.loadWeekTrafficTile(weeklyData),
      this.loadShareActivityTile(weeklyData)
    ]);
  }

  /**
   * Load Week Performance Status tile
   */
  async loadWeekPerformanceTile(data) {
    const tile = this.createKPITile('week-performance', {
      title: 'Week Performance Status',
      value: data.performance_score,
      trend: data.week_over_week_change,
      status: data.week_over_week_change > 0 ? 'positive' : 'negative',
      definition: kpiDefinitions.weekPerformance.definition,
      whyItMatters: kpiDefinitions.weekPerformance.whyItMatters,
      drillDownFilter: 'week-performance'
    });

    const content = tile.querySelector('.kpi-content');
    content.innerHTML = `
      <div class="big-number">${data.performance_score}</div>
      <div class="trend ${data.week_over_week_change > 0 ? 'positive' : 'negative'}">
        ${data.week_over_week_change > 0 ? '+' : ''}${data.week_over_week_change}% vs Week ${data.current_week - 1}
      </div>
      <div style="font-size: 0.875rem; color: var(--medium-gray); margin-top: var(--space-sm);">
        Week ${data.current_week} of 52 • Day 5 of 7
      </div>
    `;

    this.appendTileToContainer(tile);
  }

  /**
   * Load Week Traffic tile
   */
  async loadWeekTrafficTile(data) {
    const tile = this.createKPITile('week-traffic', {
      title: 'Week Traffic',
      value: data.unique_viewers,
      trend: data.traffic_week_over_week_change,
      status: data.traffic_week_over_week_change > 0 ? 'positive' : 'negative',
      definition: kpiDefinitions.weekTraffic.definition,
      whyItMatters: kpiDefinitions.weekTraffic.whyItMatters,
      drillDownFilter: 'traffic'
    });

    const content = tile.querySelector('.kpi-content');
    content.innerHTML = `
      <div class="big-number">${data.unique_viewers.toLocaleString()}</div>
      <div class="trend ${data.traffic_week_over_week_change > 0 ? 'positive' : 'negative'}">
        ${data.traffic_week_over_week_change > 0 ? '+' : ''}${data.traffic_week_over_week_change}% vs Week ${data.current_week - 1}
      </div>
      <div style="font-size: 0.875rem; color: var(--medium-gray); margin-top: var(--space-sm);">
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
   * Load Share Activity Summary tile
   */
  async loadShareActivityTile(data) {
    const tile = this.createKPITile('share-activity', {
      title: 'Share Activity Summary',
      value: data.share_total,
      trend: data.share_trend,
      status: data.share_trend > 0 ? 'positive' : 'negative',
      definition: kpiDefinitions.shareActivity.definition,
      whyItMatters: kpiDefinitions.shareActivity.whyItMatters,
      drillDownFilter: 'sharing'
    });

    const content = tile.querySelector('.kpi-content');
    content.innerHTML = `
      <div class="big-number">${data.share_total}</div>
      <div class="trend ${data.share_trend > 0 ? 'positive' : 'negative'}">
        ${data.share_trend > 0 ? '+' : ''}${data.share_trend}% vs last week
      </div>
      <div style="font-size: 0.875rem; color: var(--medium-gray); margin-top: var(--space-sm);">
        Social amplification metric
      </div>
    `;

    this.appendTileToContainer(tile);
  }

  /**
   * Load additional panels (performance, categories, promotions)
   */
  async loadAdditionalPanels() {
    await Promise.all([
      this.loadPerformancePanel(),
      this.loadCategoriesAndPerformanceRow(),
      this.loadPromotionsPanel()
    ]);
  }

  /**
   * Load performance panel with week lifecycle
   */
  async loadPerformancePanel() {
    const performanceContainer = document.createElement('div');
    performanceContainer.className = 'performance-panel';

    const weeklyData = mockDatabase.weeklyMetrics;

    performanceContainer.innerHTML = `
      <h2>Week ${weeklyData.current_week} Performance - Day 5 of 7</h2>
      <div class="score-display">
        <span class="big-number">${weeklyData.performance_score}</span>
        <span class="trend ${weeklyData.week_over_week_change > 0 ? 'positive' : 'negative'}">
          ▲ +${weeklyData.week_over_week_change}% from Week ${weeklyData.current_week - 1}
        </span>
      </div>

      <div class="lifecycle-pattern">
        <h4>Engagement Pattern</h4>
        <div class="pattern-bars">
          ${weeklyData.daily_progression.map((value, index) => {
            const height = value ? (value / Math.max(...weeklyData.daily_progression.filter(v => v !== null))) * 100 : 0;
            const isProjected = value === null;
            const expectedHeight = weeklyData.expected_pattern[index] || 0;

            return `
              <div class="pattern-bar ${value !== null ? 'current' : 'projected'}"
                   style="height: ${isProjected ? expectedHeight : height}%"
                   title="${['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue'][index]}: ${value || 'Projected'}">
              </div>
            `;
          }).join('')}
        </div>
        <div class="pattern-labels">
          <span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span><span>Mon</span><span>Tue</span>
        </div>
      </div>

      <div class="insight">
        <p>Strong weekend performance expected - Consider Monday flash promotion to maintain momentum</p>
      </div>
    `;

    this.appendToMainContainer(performanceContainer);
  }

  /**
   * Load Categories and Performance Row
   */
  async loadCategoriesAndPerformanceRow() {
    // Create the flex row container
    const rowContainer = document.createElement('div');
    rowContainer.className = 'categories-performance-row';

    // Create Top Categories tile as a card
    const categoriesContainer = document.createElement('div');
    categoriesContainer.className = 'card chart-card';
    categoriesContainer.id = 'top-categories-card';

    const categories = mockDatabase.categories;
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
          <button class="detail-btn" onclick="window.location.href='analyze.html?view=categories'">Inquiry →</button>
        </div>
      </div>
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

    const topPromotions = mockDatabase.getTopPromotions(10, 'composite');

    promotionsContainer.innerHTML = `
      <div class="card-head">
        <div class="card-head-left">
          <h3>Top Performing Promotions</h3>
          <button class="info-btn" aria-label="Show definition for Performance" tabindex="0">
            <span aria-hidden="true">i</span>
          </button>
        </div>
        <div class="card-head-right">
          <button class="detail-btn" onclick="window.location.href='analyze.html?view=promotions'">Inquiry →</button>
        </div>
      </div>
      <div class="promo-controls">
        <div class="promo-buttons">
          <button class="score-type-btn active" data-score="composite">Composite</button>
          <button class="score-type-btn" data-score="percentile">Percentile</button>
        </div>
        <div class="promo-topn-input">
          <label for="topn-control">Top</label>
          <input type="number" id="topn-control" value="10" min="1" max="50">
        </div>
      </div>
      <div class="promotion-list">
        ${topPromotions.map((promo, index) => {
          // Handle both enhanced promotions and regular promotions data structures
          const name = promo.name || promo.card_name || 'Unknown Product';
          const score = promo.compositeScore || promo.composite_score || 0;
          const maxScore = topPromotions[0].compositeScore || topPromotions[0].composite_score || 1;
          const percentage = Math.round((score / maxScore) * 100);
          const imageSrc = promo.image_url || promo.thumbnail || '/images/placeholder-product.jpg';

          return `
            <div class="promotion-item">
              <div class="promotion-rank">${index + 1}</div>
              <div class="promotion-thumbnail">
                <img src="${imageSrc}" alt="${name}" onerror="this.src='/images/placeholder-product.jpg'">
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

    // Handle Top N input changes
    const topnInput = document.getElementById('topn-control');
    if (topnInput) {
      topnInput.addEventListener('change', (e) => {
        const topN = parseInt(e.target.value);
        if (topN >= 1 && topN <= 50) {
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
    const topnInput = document.getElementById('topn-control');
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
        const imageSrc = promo.image_url || promo.thumbnail || '/images/placeholder-product.jpg';

        return `
          <div class="promotion-item">
            <div class="promotion-rank">${index + 1}</div>
            <div class="promotion-thumbnail">
              <img src="${imageSrc}" alt="${name}" onerror="this.src='/images/placeholder-product.jpg'">
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
  async loadPromotionsPanel() {
    // Create row container for performance section
    const rowContainer = document.createElement('div');
    rowContainer.className = 'row-container-performance';

    // Create the general interaction rate card
    const interactionRateContainer = this.createInteractionRateCard();

    // Add tooltip content to the Interaction Rate info button
    const interactionInfoBtn = interactionRateContainer.querySelector('.info-btn');
    if (interactionInfoBtn) {
      const tooltipData = {
        title: 'Interaction Rate Funnel',
        tooltip: '4-segment funnel tracking user engagement from never viewed to added to list, showing complete interaction journey.',
        whyImportant: 'Reveals where users drop off in the engagement process and identifies optimization opportunities.'
      };
      interactionInfoBtn.setAttribute('data-tooltip-content', encodeURIComponent(JSON.stringify(tooltipData)));
    }

    // Create promotion container column to wrap the interaction rate card only
    const promotionContainerCol = document.createElement('div');
    promotionContainerCol.className = 'promotion-container-col';
    promotionContainerCol.appendChild(interactionRateContainer);

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
    rowContainer.appendChild(promotionContainerCol);
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
          <button class="detail-btn" onclick="window.location.href='analyze.html?view=interaction'">Inquiry →</button>
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
                  <button class="detail-btn" onclick="window.location.href='analyze.html?view=size'">Inquiry →</button>
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
                  <button class="detail-btn" onclick="window.location.href='analyze.html?view=size_performance'">Inquiry →</button>
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
                <button class="detail-btn" onclick="window.location.href='analyze.html?view=deal_preference'">Inquiry →</button>
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
          <button class="detail-btn" onclick="window.location.href='analyze.html?view=${config.drillDownFilter || 'all'}'">Inquiry →</button>
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
    let container = document.querySelector('.dashboard-grid');

    if (!container) {
      container = document.createElement('div');
      container.className = 'dashboard-grid';
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
    title: "Week Performance Status",
    definition: "Compares total promotion engagement this week against last week's performance",
    whyItMatters: "Quickly identify if your circular is trending up or down, enabling early course corrections",
    calculation: "Sum of all card_in_view scores for current week / previous week"
  },
  weekTraffic: {
    title: "Week Traffic",
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
    title: "Share Activity Summary",
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