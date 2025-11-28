/**
 * Modern Data Grid Application with API Integration
 * Uses Analytics API v2 structure with mock data
 */

class DataGridApp {
  constructor() {
    this.api = window.AnalyticsAPI;

    this.state = {
      // Tier 1 filters
      scope: 'promotion',
      lens: 'engagement',
      week: '2025-W36',
      entityLevel: 'subbrand',
      entities: new Set(),

      // Header filters (moved from Tier 1)
      selectedStore: 'all',
      selectedVersion: 'all',

      // Tier 2 filters
      categories: new Set(),
      dealTypes: new Set(),
      sizeClasses: new Set(),
      positionRanges: new Set(),
      sortBy: 'composite',
      metric: 'composite',
      chartLimit: 10,

      // Grid state
      columnFilters: {},
      globalSearch: '',
      sortColumn: null,
      sortDirection: 'desc',

      // UI state
      tier1Collapsed: false,
      tier2Collapsed: false,

      // Current data
      currentData: [],
      filteredData: [],

      // API state
      loading: false,
      currentNodeHash: null,
      currentSubbrand: null,

      // Drill-down context
      drillDownSource: null,
      drillDownDescription: null
    };

    // Charts removed - using promotion performance bars instead
    this.initializeFromURL();
    this.init();
  }

  initializeFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get('source');

    if (source && window.KPI_DRILL_DOWN_CONFIG && window.KPI_DRILL_DOWN_CONFIG[source]) {
      const config = window.KPI_DRILL_DOWN_CONFIG[source];
      this.applyDrillDownConfig(config, source);
    }

    // Sync with InquiryState if available
    this.syncWithInquiryState();
  }

  syncWithInquiryState() {
    if (!window.InquiryState || !window.InquiryState.state) return;

    const inquiryState = window.InquiryState.state;

    // Sync core configuration
    if (inquiryState.scope) this.state.scope = inquiryState.scope;
    if (inquiryState.lens) this.state.lens = inquiryState.lens;
    if (inquiryState.sortBy) this.state.sortBy = inquiryState.sortBy;
    if (inquiryState.metric) this.state.metric = inquiryState.metric;
    if (inquiryState.entityLevel) this.state.entityLevel = inquiryState.entityLevel;

    // Sync context with format conversion
    if (inquiryState.week) {
      // Convert week format from 'w36' to '2025-W36'
      this.state.week = this.convertWeekFormat(inquiryState.week);
    }
    if (inquiryState.store) this.state.selectedStore = inquiryState.store;
    if (inquiryState.version) this.state.selectedVersion = inquiryState.version;

    // Sync filters
    if (inquiryState.categories.length > 0) this.state.categories = new Set(inquiryState.categories);
    if (inquiryState.dealTypes.length > 0) this.state.dealTypes = new Set(inquiryState.dealTypes);
    if (inquiryState.sizeClasses.length > 0) this.state.sizeClasses = new Set(inquiryState.sizeClasses);
    if (inquiryState.positionRanges.length > 0) this.state.positionRanges = new Set(inquiryState.positionRanges);

    // Store drill-down context
    if (inquiryState.source) this.state.drillDownSource = inquiryState.source;
    if (inquiryState.description) this.state.drillDownDescription = inquiryState.description;

    console.log('Synced data grid state with InquiryState:', this.state);
  }

  // Method to reload data after URL sync
  async reloadDataWithCurrentState() {
    console.log('Reloading data with updated state from URL parameters');
    await this.loadData();
  }

  // Helper to convert week format from 'w36' to '2025-W36'
  convertWeekFormat(week) {
    if (!week) return '2025-W36'; // default

    // If already in correct format (2025-W36), return as-is
    if (week.match(/^\d{4}-W\d+$/)) {
      return week;
    }

    // Convert from 'w36' to '2025-W36'
    if (week.match(/^w\d+$/i)) {
      const weekNumber = week.toLowerCase().replace('w', '');
      return `2025-W${weekNumber}`;
    }

    // If unrecognized format, return default
    console.warn('Unrecognized week format:', week, 'Using default');
    return '2025-W36';
  }

  applyDrillDownConfig(config, source) {
    // Store drill-down context
    this.state.drillDownSource = source;
    this.state.drillDownDescription = config.description;

    // Apply filter configuration
    this.state.scope = config.scope || 'promotion';
    this.state.lens = config.lens || 'engagement';
    this.state.sortBy = config.sortBy || 'composite';
    this.state.metric = config.metric || 'composite';

    if (config.entityLevel) this.state.entityLevel = config.entityLevel;
    if (config.categories) this.state.categories = new Set(config.categories);
    if (config.dealTypes) this.state.dealTypes = new Set(config.dealTypes);
    if (config.sizeClasses) this.state.sizeClasses = new Set(config.sizeClasses);
    if (config.positionRanges) this.state.positionRanges = new Set(config.positionRanges);

    console.log('Applied drill-down config:', config);
  }

  async init() {
    this.initializeHeader();
    this.renderUI();
    this.bindEvents();
    this.initializeMultiselects();
    this.showDrillDownContext();
    await this.loadInitialData();
  }

  showDrillDownContext() {
    if (this.state.drillDownDescription) {
      const contextBanner = document.getElementById('drill-down-context');
      const contextDescription = document.getElementById('context-description');
      const resetButton = document.getElementById('reset-context');

      if (contextBanner && contextDescription) {
        contextDescription.textContent = this.state.drillDownDescription;
        contextBanner.style.display = 'block';

        if (resetButton) {
          resetButton.addEventListener('click', () => {
            window.location.href = 'index.html';
          });
        }
      }
    }
  }

  initializeHeader() {
    // Initialize week selector in header
    const weekSelect = document.getElementById('week-select');
    const weeks = this.api.getWeeks();

    weekSelect.innerHTML = weeks.map(week =>
      `<option value="${week.week_id}" ${week.week_id === this.state.week ? 'selected' : ''}>${week.label}</option>`
    ).join('');

    // Initialize store selector in header
    const storeSelect = document.getElementById('store-select');
    const stores = [
      { value: 'all', text: 'All' },
      ...this.api.getStores().map(s => ({ value: s, text: s }))
    ];

    storeSelect.innerHTML = stores.map(store =>
      `<option value="${store.value}">${store.text}</option>`
    ).join('');

    // Initialize version selector in header
    const versionSelect = document.getElementById('version-select');
    const versions = [
      { value: 'all', text: 'All' },
      ...this.api.getVersions().map((v, i) => ({ value: `v${i+1}`, text: v }))
    ];

    versionSelect.innerHTML = versions.map(version =>
      `<option value="${version.value}">${version.text}</option>`
    ).join('');
  }

  renderUI() {
    this.renderTier1Controls();
    this.renderTier2Controls();
    this.renderGridHeaders();
    // Render KPIs after data is loaded
  }

  renderKPIs() {
    // Use the exact same renderer as index.html with the same data
    if (window.AD && window.AD.renderHeaderTiles && window.DATA) {
      console.log('Rendering KPI tiles with DATA:', window.DATA);
      window.AD.renderHeaderTiles();
    } else {
      console.log('Cannot render KPIs - AD:', !!window.AD, 'renderHeaderTiles:', !!(window.AD && window.AD.renderHeaderTiles), 'DATA:', !!window.DATA);
    }
  }

  renderTier1Controls() {
    const container = document.getElementById('tier1-content');

    const controls = [
      {
        label: 'Scope',
        type: 'select',
        id: 'scope-select',
        options: [
          { value: 'circular', text: 'Circular' },
          { value: 'category', text: 'Category' },
          { value: 'promotion', text: 'Promotion' }
        ],
        value: this.state.scope
      },
      {
        label: 'Lens',
        type: 'select',
        id: 'lens-select',
        options: [
          { value: 'engagement', text: 'Engagement' },
          { value: 'performance', text: 'Performance' },
          { value: 'traffic', text: 'Traffic' }
        ],
        value: this.state.lens
      }
    ];

    container.innerHTML = controls.map(control => {
      if (control.type === 'select') {
        return `
          <div class="filter-control-group">
            <label for="${control.id}" class="filter-label">${control.label}</label>
            <select id="${control.id}" class="filter-select">
              ${control.options.map(opt => `<option value="${opt.value}" ${opt.value === control.value ? 'selected' : ''}>${opt.text}</option>`).join('')}
            </select>
          </div>
        `;
      } else if (control.type === 'multiselect') {
        return `
          <div class="filter-control-group">
            <label for="${control.id}" class="filter-label">${control.label}</label>
            <div class="prime-multiselect" data-control-id="${control.id}">
              <div class="prime-multiselect-trigger" tabindex="0">
                <div class="prime-multiselect-label">
                  <span class="prime-multiselect-placeholder">${control.value.length === 0 ? `-` : `${control.value.length} selected`}</span>
                </div>
                <div class="prime-multiselect-dropdown">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" class="prime-multiselect-dropdown-icon">
                    <path d="M7.01744 10.398C6.91269 10.3985 6.8089 10.378 6.71215 10.3379C6.61541 10.2977 6.52766 10.2386 6.45405 10.1641L1.13907 4.84913C1.03306 4.69404 0.985221 4.5065 1.00399 4.31958C1.02276 4.13266 1.10693 3.95838 1.24166 3.82747C1.37639 3.69655 1.55301 3.61742 1.74039 3.60402C1.92777 3.59062 2.11386 3.64382 2.26584 3.75424L7.01744 8.47394L11.769 3.75424C11.9189 3.65709 12.097 3.61306 12.2748 3.62921C12.4527 3.64535 12.6199 3.72073 12.7498 3.84328C12.8797 3.96582 12.9647 4.12842 12.9912 4.30502C13.0177 4.48162 12.9841 4.662 12.8958 4.81724L7.58083 10.1322C7.50996 10.2125 7.42344 10.2775 7.32656 10.3232C7.22968 10.3689 7.12449 10.3944 7.01744 10.398Z" fill="currentColor"></path>
                  </svg>
                </div>
              </div>
              <div class="prime-multiselect-overlay" style="display: none;">
                <div class="prime-multiselect-header">
                  <div class="prime-checkbox-container">
                    <input type="checkbox" class="prime-select-all" id="${control.id}-select-all">
                    <label for="${control.id}-select-all" class="prime-checkbox-label">Select All</label>
                  </div>
                  <div class="prime-filter-container">
                    <input type="text" class="prime-filter-input" placeholder="Search...">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" class="prime-search-icon">
                      <g clip-path="url(#search-clip)">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M2.67602 11.0265C3.6661 11.688 4.83011 12.0411 6.02086 12.0411C6.81149 12.0411 7.59438 11.8854 8.32483 11.5828C8.87005 11.357 9.37808 11.0526 9.83317 10.6803L12.9769 13.8241C13.0323 13.8801 13.0983 13.9245 13.171 13.9548C13.2438 13.985 13.3219 14.0003 13.4007 14C13.4795 14.0003 13.5575 13.985 13.6303 13.9548C13.7031 13.9245 13.7691 13.8801 13.8244 13.8241C13.9367 13.7116 13.9998 13.5592 13.9998 13.4003C13.9998 13.2414 13.9367 13.089 13.8244 12.9765L10.6807 9.8328C11.053 9.37773 11.3573 8.86972 11.5831 8.32452C11.8857 7.59408 12.0414 6.81119 12.0414 6.02056C12.0414 4.8298 11.6883 3.66579 11.0268 2.67572C10.3652 1.68564 9.42494 0.913972 8.32483 0.45829C7.22472 0.00260857 6.01418 -0.116618 4.84631 0.115686C3.67844 0.34799 2.60568 0.921393 1.76369 1.76338C0.921698 2.60537 0.348296 3.67813 0.115991 4.84601C-0.116313 6.01388 0.00291375 7.22441 0.458595 8.32452C0.914277 9.42464 1.68595 10.3649 2.67602 11.0265ZM3.35565 2.0158C4.14456 1.48867 5.07206 1.20731 6.02086 1.20731C7.29317 1.20731 8.51338 1.71274 9.41304 2.6124C10.3127 3.51206 10.8181 4.73226 10.8181 6.00457C10.8181 6.95337 10.5368 7.88088 10.0096 8.66978C9.48251 9.45868 8.73328 10.0736 7.85669 10.4367C6.98011 10.7997 6.01554 10.8947 5.08496 10.7096C4.15439 10.5245 3.2996 10.0676 2.62869 9.39674C1.95778 8.72583 1.50089 7.87104 1.31579 6.94046C1.13068 6.00989 1.22568 5.04532 1.58878 4.16874C1.95187 3.29215 2.56675 2.54292 3.35565 2.0158Z" fill="currentColor"></path>
                      </g>
                      <defs><clipPath id="search-clip"><rect width="14" height="14" fill="white"></rect></clipPath></defs>
                    </svg>
                  </div>
                </div>
                <div class="prime-multiselect-list">
                  ${control.options.map(opt => `
                    <div class="prime-multiselect-item" data-value="${opt.value}">
                      <input type="checkbox" value="${opt.value}" id="${control.id}-${opt.value}" ${control.value.includes(opt.value) ? 'checked' : ''}>
                      <label for="${control.id}-${opt.value}">${opt.text}</label>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
        `;
      }
    }).join('');

    // Update all multiselect displays after rendering
    this.refreshAllMultiselectDisplays();
  }

  renderTier2Controls() {
    const container = document.getElementById('tier2-content');

    const controls = [
      {
        label: 'Categories',
        type: 'multiselect',
        id: 'categories-select',
        options: this.api.getCategories().map(cat => ({ value: cat, text: cat })),
        value: Array.from(this.state.categories)
      },
      {
        label: 'Deal Types',
        type: 'multiselect',
        id: 'deal-types-select',
        options: this.api.getDealTypes().map(deal => ({ value: deal, text: deal })),
        value: Array.from(this.state.dealTypes)
      },
      {
        label: 'Size Classes',
        type: 'multiselect',
        id: 'size-classes-select',
        options: [
          { value: 'Small (S)', text: 'Small (S)' },
          { value: 'Medium (M)', text: 'Medium (M)' },
          { value: 'Large (L)', text: 'Large (L)' }
        ],
        value: Array.from(this.state.sizeClasses)
      },
      {
        label: 'Position Ranges',
        type: 'multiselect',
        id: 'position-ranges-select',
        options: [
          { value: 'Top', text: 'Top' },
          { value: 'Upper Mid', text: 'Upper Mid' },
          { value: 'Lower Mid', text: 'Lower Mid' },
          { value: 'Bottom', text: 'Bottom' }
        ],
        value: Array.from(this.state.positionRanges)
      },
      {
        label: 'Sort By',
        type: 'select',
        id: 'sort-by-select',
        options: [
          { value: 'composite', text: 'Composite Score' },
          { value: 'performance', text: 'Performance Rank' },
          { value: 'percentile', text: 'Percentile' },
          { value: 'name', text: 'Name' },
          { value: 'category', text: 'Category' },
          { value: 'position', text: 'Position' },
          { value: 'sizeClass', text: 'Size Class' }
        ],
        value: this.state.sortBy
      }
    ];

    container.innerHTML = controls.map(control => {
      if (control.type === 'select') {
        return `
          <div class="filter-control-group">
            <label for="${control.id}" class="filter-label">${control.label}</label>
            <select id="${control.id}" class="filter-select">
              ${control.options.map(opt => `<option value="${opt.value}" ${opt.value === control.value ? 'selected' : ''}>${opt.text}</option>`).join('')}
            </select>
          </div>
        `;
      } else if (control.type === 'multiselect') {
        return `
          <div class="filter-control-group">
            <label for="${control.id}" class="filter-label">${control.label}</label>
            <div class="prime-multiselect" data-control-id="${control.id}">
              <div class="prime-multiselect-trigger" tabindex="0">
                <div class="prime-multiselect-label">
                  <span class="prime-multiselect-placeholder">${control.value.length === 0 ? `-` : `${control.value.length} selected`}</span>
                </div>
                <div class="prime-multiselect-dropdown">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" class="prime-multiselect-dropdown-icon">
                    <path d="M7.01744 10.398C6.91269 10.3985 6.8089 10.378 6.71215 10.3379C6.61541 10.2977 6.52766 10.2386 6.45405 10.1641L1.13907 4.84913C1.03306 4.69404 0.985221 4.5065 1.00399 4.31958C1.02276 4.13266 1.10693 3.95838 1.24166 3.82747C1.37639 3.69655 1.55301 3.61742 1.74039 3.60402C1.92777 3.59062 2.11386 3.64382 2.26584 3.75424L7.01744 8.47394L11.769 3.75424C11.9189 3.65709 12.097 3.61306 12.2748 3.62921C12.4527 3.64535 12.6199 3.72073 12.7498 3.84328C12.8797 3.96582 12.9647 4.12842 12.9912 4.30502C13.0177 4.48162 12.9841 4.662 12.8958 4.81724L7.58083 10.1322C7.50996 10.2125 7.42344 10.2775 7.32656 10.3232C7.22968 10.3689 7.12449 10.3944 7.01744 10.398Z" fill="currentColor"></path>
                  </svg>
                </div>
              </div>
              <div class="prime-multiselect-overlay" style="display: none;">
                <div class="prime-multiselect-header">
                  <div class="prime-checkbox-container">
                    <input type="checkbox" class="prime-select-all" id="${control.id}-select-all">
                    <label for="${control.id}-select-all" class="prime-checkbox-label">Select All</label>
                  </div>
                  <div class="prime-filter-container">
                    <input type="text" class="prime-filter-input" placeholder="Search...">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" class="prime-search-icon">
                      <g clip-path="url(#search-clip)">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M2.67602 11.0265C3.6661 11.688 4.83011 12.0411 6.02086 12.0411C6.81149 12.0411 7.59438 11.8854 8.32483 11.5828C8.87005 11.357 9.37808 11.0526 9.83317 10.6803L12.9769 13.8241C13.0323 13.8801 13.0983 13.9245 13.171 13.9548C13.2438 13.985 13.3219 14.0003 13.4007 14C13.4795 14.0003 13.5575 13.985 13.6303 13.9548C13.7031 13.9245 13.7691 13.8801 13.8244 13.8241C13.9367 13.7116 13.9998 13.5592 13.9998 13.4003C13.9998 13.2414 13.9367 13.089 13.8244 12.9765L10.6807 9.8328C11.053 9.37773 11.3573 8.86972 11.5831 8.32452C11.8857 7.59408 12.0414 6.81119 12.0414 6.02056C12.0414 4.8298 11.6883 3.66579 11.0268 2.67572C10.3652 1.68564 9.42494 0.913972 8.32483 0.45829C7.22472 0.00260857 6.01418 -0.116618 4.84631 0.115686C3.67844 0.34799 2.60568 0.921393 1.76369 1.76338C0.921698 2.60537 0.348296 3.67813 0.115991 4.84601C-0.116313 6.01388 0.00291375 7.22441 0.458595 8.32452C0.914277 9.42464 1.68595 10.3649 2.67602 11.0265ZM3.35565 2.0158C4.14456 1.48867 5.07206 1.20731 6.02086 1.20731C7.29317 1.20731 8.51338 1.71274 9.41304 2.6124C10.3127 3.51206 10.8181 4.73226 10.8181 6.00457C10.8181 6.95337 10.5368 7.88088 10.0096 8.66978C9.48251 9.45868 8.73328 10.0736 7.85669 10.4367C6.98011 10.7997 6.01554 10.8947 5.08496 10.7096C4.15439 10.5245 3.2996 10.0676 2.62869 9.39674C1.95778 8.72583 1.50089 7.87104 1.31579 6.94046C1.13068 6.00989 1.22568 5.04532 1.58878 4.16874C1.95187 3.29215 2.56675 2.54292 3.35565 2.0158Z" fill="currentColor"></path>
                      </g>
                      <defs><clipPath id="search-clip"><rect width="14" height="14" fill="white"></rect></clipPath></defs>
                    </svg>
                  </div>
                </div>
                <div class="prime-multiselect-list">
                  ${control.options.map(opt => `
                    <div class="prime-multiselect-item" data-value="${opt.value}">
                      <input type="checkbox" value="${opt.value}" id="${control.id}-${opt.value}" ${control.value.includes(opt.value) ? 'checked' : ''}>
                      <label for="${control.id}-${opt.value}">${opt.text}</label>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
        `;
      }
    }).join('');

    // Update all multiselect displays after rendering
    this.refreshAllMultiselectDisplays();
  }

  getHeadersForScope(scope) {
    switch (scope) {
      case 'circular':
        return [
          { key: 'week', label: 'Week', sortable: true },
          { key: 'subbrand', label: 'Sub-brand', sortable: true },
          { key: 'version', label: 'Version', sortable: true },
          { key: 'totalPromotions', label: 'Total Promos', sortable: true },
          { key: 'avgComposite', label: 'Avg Composite', sortable: true },
          { key: 'topPerformer', label: 'Top Performer', sortable: true },
          { key: 'categoryCount', label: 'Categories', sortable: true },
          { key: 'engagementRate', label: 'Engagement', sortable: true },
          { key: 'audienceReach', label: 'Audience Reach', sortable: true },
          { key: 'marketingHealth', label: 'Health Score', sortable: true }
        ];

      case 'category':
        return [
          { key: 'category', label: 'Category', sortable: true },
          { key: 'totalPromotions', label: 'Total Promos', sortable: true },
          { key: 'avgComposite', label: 'Avg Composite', sortable: true },
          { key: 'topPerformer', label: 'Top Performer', sortable: true },
          { key: 'avgPosition', label: 'Avg Position', sortable: true },
          { key: 'shareRate', label: 'Share Rate', sortable: true },
          { key: 'expandRate', label: 'Expand Rate', sortable: true },
          { key: 'bestDealType', label: 'Best Deal Type', sortable: true },
          { key: 'bestSizeClass', label: 'Best Size', sortable: true }
        ];

      case 'promotion':
      default:
        return [
          { key: 'thumbnail', label: 'Image', sortable: false, type: 'image', class: 'col-thumbnail' },
          { key: 'name', label: 'Name', sortable: true, type: 'text', class: 'col-name' },
          { key: 'category', label: 'Category', sortable: true, type: 'text', class: 'col-category' },
          { key: 'dealType', label: 'Deal Type', sortable: true, type: 'text', class: 'col-dealtype' },
          { key: 'sizeClass', label: 'Size', sortable: true, type: 'text', class: 'col-size' },
          { key: 'position', label: 'Position', sortable: true, type: 'number', class: 'col-position' },
          { key: 'positionRange', label: 'Pos Range', sortable: true, type: 'text', class: 'col-posrange' },
          { key: 'price', label: 'Price', sortable: true, type: 'number', class: 'col-price' },
          { key: 'days', label: 'Days', sortable: true, type: 'number', class: 'col-days' },
          { key: 'civ', label: 'CIV', sortable: true, type: 'number', class: 'col-civ' },
          { key: 'cc', label: 'CC', sortable: true, type: 'number', class: 'col-cc' },
          { key: 'atl', label: 'ATL', sortable: true, type: 'number', class: 'col-atl' },
          { key: 'composite', label: 'Composite', sortable: true, type: 'number', class: 'col-composite' },
          { key: 'percentile', label: 'Percentile', sortable: true, type: 'number', class: 'col-percentile' },
          { key: 'rank', label: 'Rank', sortable: true, type: 'number', class: 'col-rank' },
          { key: 'performance', label: 'Performance', sortable: true, type: 'text', class: 'col-performance' },
          { key: 'shared', label: 'Shared', sortable: true, type: 'text', class: 'col-shared' },
          { key: 'expanded', label: 'Expanded', sortable: true, type: 'text', class: 'col-expanded' }
        ];
    }
  }

  renderGridHeaders() {
    const headers = this.getHeadersForScope(this.state.scope);

    // Render header row
    const headerRow = document.getElementById('grid-header-row');
    headerRow.innerHTML = headers.map(header => `
      <th class="p-sortable-column ${header.class} ${header.type === 'number' ? 'number' : ''} ${this.state.sortColumn === header.key ? 'p-highlight' : ''}"
          role="columnheader"
          data-key="${header.key}"
          data-type="${header.type}"
          ${header.sortable ? 'data-sortable="true" tabindex="0"' : ''}
          ${header.sortable && this.state.sortColumn === header.key ?
            `aria-sort="${this.state.sortDirection === 'asc' ? 'ascending' : 'descending'}"` :
            header.sortable ? 'aria-sort="none"' : ''}>
        ${header.label}
        ${header.sortable ? `
          <span class="p-sortable-column-icon" aria-hidden="true">
            ${this.state.sortColumn === header.key ?
              (this.state.sortDirection === 'asc' ? '↑' : '↓') : '↕'}
          </span>
        ` : ''}
      </th>
    `).join('');

    // Render filter row
    const filterRow = document.getElementById('grid-filter-row');
    filterRow.innerHTML = headers.map(header => `
      <th class="${header.class} ${header.type === 'number' ? 'number' : ''}">
        ${header.key !== 'thumbnail' ? `
          <input type="text"
                 placeholder="Filter by ${header.label.toLowerCase()}"
                 class="p-component p-inputtext p-column-filter-input"
                 data-column="${header.key}">
        ` : ''}
      </th>
    `).join('');
  }

  getEntityOptions() {
    const level = this.state.entityLevel;
    if (level === 'subbrand') return this.api.getSubbrands().map(s => ({ value: s, text: s }));
    if (level === 'category') return this.api.getCategories().map(c => ({ value: c, text: c }));
    return [];
  }

  bindEvents() {
    // Header controls
    document.getElementById('week-select').addEventListener('change', async (e) => {
      this.state.week = e.target.value;

      const tier1WeekSelect = document.getElementById('week-select-tier1');
      if (tier1WeekSelect) {
        tier1WeekSelect.value = this.state.week;
      }

      this.updateChips();
      await this.loadData();
    });

    document.getElementById('store-select').addEventListener('change', async (e) => {
      this.state.selectedStore = e.target.value;
      this.updateChips();
      await this.loadData();
    });

    document.getElementById('version-select').addEventListener('change', async (e) => {
      this.state.selectedVersion = e.target.value;
      await this.loadData();
    });

    // Unified apply/reset buttons
    document.getElementById('apply-btn')?.addEventListener('click', async () => {
      // Apply Tier 1 changes
      this.state.scope = document.getElementById('scope-select').value;
      this.state.lens = document.getElementById('lens-select').value;

      // Apply Tier 2 filters
      this.applyTier2Filters();

      this.updateChips();
      await this.loadData();
    });

    document.getElementById('reset-btn')?.addEventListener('click', async () => {
      // Reset Tier 1
      this.state.scope = 'promotion';
      this.state.lens = 'engagement';

      // Reset Tier 2
      this.state.categories.clear();
      this.state.dealTypes.clear();
      this.state.sizeClasses.clear();
      this.state.positionRanges.clear();

      // Re-render controls and update
      this.renderTier1Controls();
      this.renderTier2Controls();
      this.updateChips();
      await this.loadData();
    });

    this.bindTier1Events();
    this.bindTier2Events();
    this.bindGridEvents();
  }

  applyTier2Filters() {
    // Categories
    const categoriesMultiselect = document.querySelector('[data-control-id="categories-select"]');
    if (categoriesMultiselect) {
      const checkedBoxes = categoriesMultiselect.querySelectorAll('.prime-multiselect-item input[type="checkbox"]:checked');
      this.state.categories = new Set(Array.from(checkedBoxes).map(cb => cb.value));
    }

    // Deal Types
    const dealTypesMultiselect = document.querySelector('[data-control-id="deal-types-select"]');
    if (dealTypesMultiselect) {
      const checkedBoxes = dealTypesMultiselect.querySelectorAll('.prime-multiselect-item input[type="checkbox"]:checked');
      this.state.dealTypes = new Set(Array.from(checkedBoxes).map(cb => cb.value));
    }

    // Size Classes
    const sizeClassesMultiselect = document.querySelector('[data-control-id="size-classes-select"]');
    if (sizeClassesMultiselect) {
      const checkedBoxes = sizeClassesMultiselect.querySelectorAll('.prime-multiselect-item input[type="checkbox"]:checked');
      this.state.sizeClasses = new Set(Array.from(checkedBoxes).map(cb => cb.value));
    }

    // Position Ranges
    const positionRangesMultiselect = document.querySelector('[data-control-id="position-ranges-select"]');
    if (positionRangesMultiselect) {
      const checkedBoxes = positionRangesMultiselect.querySelectorAll('.prime-multiselect-item input[type="checkbox"]:checked');
      this.state.positionRanges = new Set(Array.from(checkedBoxes).map(cb => cb.value));
    }

    // Handle regular select elements (Sort By and Metric)
    const sortBySelect = document.getElementById('sort-by-select');
    if (sortBySelect) {
      this.state.sortBy = sortBySelect.value;
    }

    const metricSelect = document.getElementById('metric-select');
    if (metricSelect) {
      this.state.metric = metricSelect.value;
    }
  }

  bindTier1Events() {
    // Tier 1 events are now handled by the apply/reset buttons in bindEvents()
  }

  bindTier2Events() {
    // Tier 2 events are now handled by the apply/reset buttons in bindEvents()
  }

  bindGridEvents() {
    // Column sorting - delegate to parent container to handle dynamically rendered headers
    document.addEventListener('click', (e) => {
      const sortableColumn = e.target.closest('.p-sortable-column[data-sortable="true"]');
      if (sortableColumn) {
        this.handleSort(sortableColumn);
      }
    });

    // Keyboard support for sortable headers
    document.addEventListener('keydown', (e) => {
      const sortableColumn = e.target.closest('.p-sortable-column[data-sortable="true"]');
      if (sortableColumn && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        this.handleSort(sortableColumn);
      }
    });

    // Column filters - delegate to handle dynamically rendered inputs
    document.addEventListener('input', (e) => {
      if (e.target.classList.contains('p-column-filter-input')) {
        this.state.columnFilters[e.target.dataset.column] = e.target.value;
        this.applyFiltersAndRender();
      }
    });

    // Global search
    document.getElementById('global-search-input')?.addEventListener('input', (e) => {
      this.state.globalSearch = e.target.value;
      this.applyFiltersAndRender();
    });

    // Export button
    document.getElementById('export-btn')?.addEventListener('click', () => this.exportToCSV());

    // Synchronize header and body scroll
    this.setupScrollSync();
  }

  setupScrollSync() {
    // No scroll sync needed - the parent container handles both header and body scrolling
    const scrollableView = document.querySelector('.p-treetable-scrollable-view');
    if (scrollableView) {
      // Ensure the container can scroll both directions
      scrollableView.style.overflowX = 'auto';
      scrollableView.style.overflowY = 'auto';
    }
  }

  handleSort(sortableColumn) {
    const column = sortableColumn.dataset.key;
    if (this.state.sortColumn === column) {
      this.state.sortDirection = this.state.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.state.sortColumn = column;
      this.state.sortDirection = 'desc';
    }
    this.renderGridHeaders(); // Re-render headers to show sort indicators
    this.applyFiltersAndRender();
  }

  async loadInitialData() {
    // Ensure we have the same global DATA object as index.html
    if (!window.DATA) {
      console.log('Loading initial DATA for data grid...');
      // Load the same data structure as index.html
      if (window.getWeekData) {
        window.DATA = window.getWeekData('w36', 'all');
      }
    }

    // Initialize AD object for header tiles (wait for main.nomodule.js to load)
    this.waitForAD();

    // Load with default subbrand
    this.state.currentSubbrand = this.api.getSubbrands()[0];
    await this.loadData();
  }

  waitForAD() {
    const checkAD = () => {
      if (window.AD && window.AD.renderHeaderTiles) {
        console.log('AD object ready, rendering header tiles');
        // Render the header tiles once AD is available
        this.renderKPIs();
      } else {
        console.log('Waiting for AD object...');
        setTimeout(checkAD, 100);
      }
    };
    checkAD();
  }

  async loadData() {
    this.state.loading = true;
    this.showLoading();

    try {
      const subbrand = this.state.entities.size > 0 ?
        Array.from(this.state.entities)[0] :
        this.state.currentSubbrand || this.api.getSubbrands()[0];

      this.state.currentSubbrand = subbrand;
      this.state.currentNodeHash = this.api.getNodeHash(subbrand);

      const versionId = this.state.selectedVersion;
      const week = this.api.getWeeks().find(w => w.week_id === this.state.week);

      if (!week) {
        console.error('Week not found:', this.state.week);
        return;
      }

      // Filter data by selected store if not "all"
      const response = await this.api.getPromotionScores(
        this.state.currentNodeHash,
        week.start_date,
        week.end_date,
        versionId,
        250
      );

      // Apply store filtering to the response data
      let promotionData = response.data;
      if (this.state.selectedStore !== 'all') {
        promotionData = promotionData.filter(promo => promo.store === this.state.selectedStore);
      }

      this.state.currentData = promotionData;
      this.applyFiltersAndRender();

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      this.state.loading = false;
      this.hideLoading();
    }
  }

  applyFiltersAndRender() {
    let filteredData = [...this.state.currentData];

    // Apply category filters
    if (this.state.categories.size > 0) {
      filteredData = filteredData.filter(item => this.state.categories.has(item.category));
    }

    // Apply deal type filters
    if (this.state.dealTypes.size > 0) {
      filteredData = filteredData.filter(item => this.state.dealTypes.has(item.dealType));
    }

    // Apply size class filters
    if (this.state.sizeClasses.size > 0) {
      filteredData = filteredData.filter(item => this.state.sizeClasses.has(item.sizeClass));
    }

    // Apply position range filters
    if (this.state.positionRanges.size > 0) {
      filteredData = filteredData.filter(item => this.state.positionRanges.has(item.positionRange));
    }

    // Apply global search filter
    if (this.state.globalSearch && this.state.globalSearch.trim()) {
      const searchTerm = this.state.globalSearch.toLowerCase().trim();
      filteredData = filteredData.filter(item => {
        // Search across multiple fields
        const searchableFields = [
          item.name, item.category, item.dealType, item.sizeClass,
          item.positionRange, String(item.position), String(item.price),
          String(item.civ), String(item.cc), String(item.atl),
          String(item.composite), String(item.percentile)
        ];

        return searchableFields.some(field =>
          String(field).toLowerCase().includes(searchTerm)
        );
      });
    }

    // Apply column filters
    Object.entries(this.state.columnFilters).forEach(([column, value]) => {
      if (value.trim()) {
        filteredData = filteredData.filter(item => {
          const itemValue = String(item[column]).toLowerCase();
          return itemValue.includes(value.toLowerCase().trim());
        });
      }
    });

    // Apply sorting
    if (this.state.sortColumn) {
      filteredData.sort((a, b) => {
        const aVal = a[this.state.sortColumn];
        const bVal = b[this.state.sortColumn];

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return this.state.sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }

        const comparison = String(aVal).localeCompare(String(bVal));
        return this.state.sortDirection === 'asc' ? comparison : -comparison;
      });
    } else {
      // Default sort by composite score descending
      filteredData.sort((a, b) => b.composite - a.composite);
    }

    this.state.filteredData = filteredData;

    // Keep original ytdKpis - don't modify them with filtered data
    // The user wants the exact same Traffic, Visitors, Marketing Health KPIs as index.html

    this.renderKPIs();
    this.renderPromotionPerformance(filteredData);
    this.renderGrid(filteredData);
  }


  renderPromotionPerformance(data) {
    const barsHost = document.getElementById('pp-bars');
    if (!barsHost) return;

    const modeBtn = (m) => document.querySelector(`.toggle-btn[data-mode="${m}"]`);
    const sel = document.getElementById('pp-topn');

    const draw = () => {
      const mode = modeBtn('percentile') && modeBtn('percentile').classList.contains('is-active') ? 'percentile' : 'composite';
      const topN = sel ? Number(sel.value || 10) : 10;
      const items = data.slice(0, topN);

      // Update the promotion-performance mode class for CSS styling
      const performanceCard = document.getElementById('promotion-performance');
      if (performanceCard) {
        performanceCard.className = `card chart-card mode-${mode}`;
      }

      if (barsHost) {
        barsHost.innerHTML = items.map(item => {
          const val = (mode === 'percentile' ? item.percentile : item.composite) || 0;
          const pct = Math.max(0, Math.min(100, mode === 'percentile' ? val : Math.round((val / 8700) * 100))); // 8700 is max composite from mock data
          const seed = encodeURIComponent(item.name || 'promotion');

          const barColor = (mode === 'percentile')
            ? 'background: var(--blue);'
            : 'background: var(--green);';

          const valDisplay = (mode === 'percentile') ? val + '%' : val.toLocaleString();

          return `
            <div class="bar" role="listitem">
              <img class="thumb" alt="" src="${item.thumbnail || `https://picsum.photos/seed/${seed}/72/48`}">
              <div class="label" title="${item.name}">${item.name}</div>
              <div class="meter">
                <div class="microbar">
                  <div class="microbar-shell">
                    <div class="microbar-fill"
                         data-target="${pct}"
                         style="width:0%;${barColor}"></div>
                  </div>
                </div>
              </div>
              <div class="val">${valDisplay}</div>
            </div>
          `;
        }).join('');

        // Animate width to data-target
        requestAnimationFrame(() => {
          barsHost.querySelectorAll('.microbar-fill').forEach(el => {
            const target = el.getAttribute('data-target') || '0';
            el.style.width = target + '%';
          });
        });
      }
    };

    // Bind events if not already bound
    if (sel && !sel.onchange) {
      sel.onchange = draw;
    }

    const btns = document.querySelectorAll('#promotion-performance .toggle-btn');
    btns.forEach(b => {
      if (!b.onclick) {
        b.onclick = () => {
          btns.forEach(x => x.classList.remove('is-active'));
          b.classList.add('is-active');
          draw();
        };
      }
    });

    draw();
  }

  renderGrid(data) {
    const tbody = document.getElementById('grid-body');
    const count = document.getElementById('grid-count');
    const headers = this.getHeadersForScope(this.state.scope);

    count.textContent = `${data.length} items`;

    tbody.innerHTML = data.map((item, index) => `
      <tr class="p-element"
          role="row"
          tabindex="0"
          aria-level="1"
          aria-posinset="${index + 1}"
          aria-setsize="${data.length}">
        ${headers.map(header => `
          <td role="cell" class="${header.class} ${header.type === 'number' ? 'number' : ''}">
            ${this.renderCellContent(item, header)}
          </td>
        `).join('')}
      </tr>
    `).join('');
  }

  renderCellContent(item, header) {
    switch (header.key) {
      case 'thumbnail':
        return `<img src="${item.thumbnail}" alt="Item ${item.id}" class="promotion-thumbnail">`;

      case 'name':
        return `<div class="promotion-name" title="${item.name}">${item.name}</div>`;

      case 'category':
        return `<span class="category-badge">${item.category}</span>`;

      case 'dealType':
        return `<span class="deal-type-badge">${item.dealType}</span>`;

      case 'sizeClass':
        return `<span class="size-class-badge">${item.sizeClass}</span>`;

      case 'position':
        return item.position;

      case 'positionRange':
        const rangeClass = item.positionRange === 'Top' ? 'position-range-top' :
                          item.positionRange === 'Upper Mid' ? 'position-range-upper' :
                          item.positionRange === 'Lower Mid' ? 'position-range-lower' :
                          'position-range-bottom';
        return `<span class="position-range-badge ${rangeClass}">${item.positionRange}</span>`;

      case 'price':
        return `$${item.price.toFixed(2)}`;

      case 'days':
        return item.days;

      case 'civ':
        return item.civ.toLocaleString();

      case 'cc':
        return item.cc;

      case 'atl':
        return item.atl;

      case 'composite':
        return item.composite.toLocaleString();

      case 'percentile':
        return `
          <div class="percentile-display">
            <div class="percentile-value">${item.percentile}%</div>
            <div class="percentile-bar">
              <div class="percentile-progress" style="width: ${item.percentile}%"></div>
            </div>
          </div>`;

      case 'rank':
        return `#${item.rank} of ${item.rankTotal}`;

      case 'performance':
        const perfClass = item.performance >= 75 ? 'performance-high' :
                         item.performance >= 25 ? 'performance-medium' :
                         'performance-low';
        return `<span class="performance-badge ${perfClass}">Top ${100 - item.performance + 1}%</span>`;

      case 'shared':
        return `<span class="status-badge ${item.shared ? 'status-active' : 'status-inactive'}">${item.shared ? 'Yes' : 'No'}</span>`;

      case 'expanded':
        return `<span class="status-badge ${item.expanded ? 'status-active' : 'status-inactive'}">${item.expanded ? 'Yes' : 'No'}</span>`;

      default:
        return item[header.key] || '';
    }
  }

  togglePanel(panel) {
    const isCollapsed = this.state[`${panel}Collapsed`];
    this.state[`${panel}Collapsed`] = !isCollapsed;
    this.updatePanelVisibility();
  }

  updatePanelVisibility() {
    const tier1Content = document.getElementById('tier1-content');
    const tier1Chevron = document.getElementById('tier1-chevron');
    const tier2Content = document.getElementById('tier2-content');
    const tier2Chevron = document.getElementById('tier2-chevron');

    tier1Content.style.display = this.state.tier1Collapsed ? 'none' : 'grid';
    tier1Chevron.style.transform = this.state.tier1Collapsed ? 'rotate(-90deg)' : 'rotate(0deg)';

    tier2Content.style.display = this.state.tier2Collapsed ? 'none' : 'grid';
    tier2Chevron.style.transform = this.state.tier2Collapsed ? 'rotate(-90deg)' : 'rotate(0deg)';
  }

  updateChips() {
    // Tier 1 chips
    const tier1Chips = document.getElementById('tier1-chips');
    const tier1ActiveFilters = [
      `Scope: ${this.state.scope}`,
      `Lens: ${this.state.lens}`,
      `Week: ${this.state.week}`,
      `Level: ${this.state.entityLevel}`
    ];

    if (this.state.entities.size > 0) {
      tier1ActiveFilters.push(`Entities: ${Array.from(this.state.entities).slice(0, 2).join(', ')}${this.state.entities.size > 2 ? '...' : ''}`);
    }

    tier1Chips.innerHTML = tier1ActiveFilters.map(filter =>
      `<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">${filter}</span>`
    ).join('');

    // Tier 2 chips
    const tier2Chips = document.getElementById('tier2-chips');
    const tier2ActiveFilters = [`Sort: ${this.state.sortBy}`, `Metric: ${this.state.metric}`];

    if (this.state.categories.size > 0) {
      tier2ActiveFilters.push(`Categories: ${Array.from(this.state.categories).slice(0, 2).join(', ')}${this.state.categories.size > 2 ? '...' : ''}`);
    }

    if (this.state.dealTypes.size > 0) {
      tier2ActiveFilters.push(`Deals: ${Array.from(this.state.dealTypes).slice(0, 2).join(', ')}${this.state.dealTypes.size > 2 ? '...' : ''}`);
    }

    if (this.state.sizeClasses.size > 0) {
      tier2ActiveFilters.push(`Sizes: ${Array.from(this.state.sizeClasses).slice(0, 2).join(', ')}${this.state.sizeClasses.size > 2 ? '...' : ''}`);
    }

    if (this.state.positionRanges.size > 0) {
      tier2ActiveFilters.push(`Positions: ${Array.from(this.state.positionRanges).slice(0, 2).join(', ')}${this.state.positionRanges.size > 2 ? '...' : ''}`);
    }

    tier2Chips.innerHTML = tier2ActiveFilters.map(filter =>
      `<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">${filter}</span>`
    ).join('');
  }

  showLoading() {
    // Add loading indicators to grid
    const gridCount = document.getElementById('grid-count');
    if (gridCount) {
      gridCount.textContent = 'Loading...';
    }

    const gridBody = document.getElementById('grid-body');
    if (gridBody) {
      gridBody.innerHTML = '<tr><td colspan="18" class="px-6 py-4 text-center text-gray-500">Loading data...</td></tr>';
    }
  }

  hideLoading() {
    // Loading indicators will be replaced by actual data in renderGrid
  }

  exportToCSV() {
    const data = this.state.filteredData;
    const headers = ['Name', 'Category', 'Deal Type', 'Position', 'Price', 'Days', 'CIV', 'CC', 'ATL', 'Composite', 'Percentile', 'Rank', 'Performance'];

    const csvContent = [
      headers.join(','),
      ...data.map(item => [
        `"${item.name}"`,
        item.category,
        item.dealType,
        item.position,
        item.price,
        item.days,
        item.civ,
        item.cc,
        item.atl,
        item.composite,
        item.percentile,
        `"#${item.rank} of ${item.rankTotal}"`,
        `"Top ${100 - item.performance + 1}%"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `analytics-data-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // PrimeNG-style Multiselect functionality
  initializeMultiselects() {
    // Set up event listeners for all multiselect components
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('.prime-multiselect-trigger');
      if (trigger) {
        this.toggleMultiselect(trigger.closest('.prime-multiselect'));
        return;
      }

      const checkbox = e.target.closest('.prime-multiselect-item input[type="checkbox"]');
      if (checkbox) {
        this.handleCheckboxChange(checkbox);
        return;
      }

      const selectAll = e.target.closest('.prime-select-all');
      if (selectAll) {
        this.handleSelectAll(selectAll);
        return;
      }

      // Close multiselects when clicking outside
      if (!e.target.closest('.prime-multiselect')) {
        this.closeAllMultiselects();
      }
    });

    // Set up search input listeners
    document.addEventListener('input', (e) => {
      if (e.target.classList.contains('prime-filter-input')) {
        this.handleSearch(e.target);
      }
    });

    // Prevent clicks inside overlay from closing the dropdown
    document.addEventListener('click', (e) => {
      if (e.target.closest('.prime-multiselect-overlay')) {
        e.stopPropagation();
      }
    });
  }

  toggleMultiselect(multiselect) {
    const overlay = multiselect.querySelector('.prime-multiselect-overlay');
    const isOpen = multiselect.classList.contains('open');

    // Close all other multiselects
    this.closeAllMultiselects();

    if (!isOpen) {
      multiselect.classList.add('open');
      overlay.style.display = 'block';

      // Focus search input if it exists
      const searchInput = overlay.querySelector('.prime-filter-input');
      if (searchInput) {
        setTimeout(() => searchInput.focus(), 100);
      }
    }
  }

  closeAllMultiselects() {
    document.querySelectorAll('.prime-multiselect.open').forEach(multiselect => {
      multiselect.classList.remove('open');
      multiselect.querySelector('.prime-multiselect-overlay').style.display = 'none';
    });
  }

  handleCheckboxChange(checkbox) {
    const multiselect = checkbox.closest('.prime-multiselect');
    const controlId = multiselect.dataset.controlId;
    const value = checkbox.value;
    const isChecked = checkbox.checked;

    // Map control ID to state property
    let stateProperty = null;
    switch (controlId) {
      case 'categories-select':
        stateProperty = 'categories';
        break;
      case 'deal-types-select':
        stateProperty = 'dealTypes';
        break;
      case 'size-classes-select':
        stateProperty = 'sizeClasses';
        break;
      case 'position-ranges-select':
        stateProperty = 'positionRanges';
        break;
    }

    // Update state based on control type
    if (stateProperty && this.state[stateProperty]) {
      if (isChecked) {
        this.state[stateProperty].add(value);
      } else {
        this.state[stateProperty].delete(value);
      }
    }

    // Update the display
    this.updateMultiselectDisplay(multiselect, stateProperty);
    this.updateSelectAllState(multiselect);
  }

  handleSelectAll(selectAllCheckbox) {
    const multiselect = selectAllCheckbox.closest('.prime-multiselect');
    const controlId = multiselect.dataset.controlId;
    const isChecked = selectAllCheckbox.checked;
    const allCheckboxes = multiselect.querySelectorAll('.prime-multiselect-item input[type="checkbox"]:not([style*="display: none"])');

    // Map control ID to state property
    let stateProperty = null;
    switch (controlId) {
      case 'categories-select':
        stateProperty = 'categories';
        break;
      case 'deal-types-select':
        stateProperty = 'dealTypes';
        break;
      case 'size-classes-select':
        stateProperty = 'sizeClasses';
        break;
      case 'position-ranges-select':
        stateProperty = 'positionRanges';
        break;
    }

    allCheckboxes.forEach(checkbox => {
      checkbox.checked = isChecked;
      const value = checkbox.value;

      if (stateProperty && this.state[stateProperty]) {
        if (isChecked) {
          this.state[stateProperty].add(value);
        } else {
          this.state[stateProperty].delete(value);
        }
      }
    });

    this.updateMultiselectDisplay(multiselect, stateProperty);
  }

  handleSearch(searchInput) {
    const multiselect = searchInput.closest('.prime-multiselect');
    const searchTerm = searchInput.value.toLowerCase();
    const items = multiselect.querySelectorAll('.prime-multiselect-item');

    items.forEach(item => {
      const label = item.querySelector('label').textContent.toLowerCase();
      const checkbox = item.querySelector('input[type="checkbox"]');

      if (label.includes(searchTerm)) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });

    // Update select all state after filtering
    this.updateSelectAllState(multiselect);
  }

  updateMultiselectDisplay(multiselect, controlId) {
    const trigger = multiselect.querySelector('.prime-multiselect-trigger');
    const label = trigger.querySelector('.prime-multiselect-placeholder');
    const selectedValues = this.state[controlId];

    if (selectedValues && selectedValues.size > 0) {
      if (selectedValues.size === 1) {
        label.textContent = Array.from(selectedValues)[0];
      } else {
        label.textContent = `${selectedValues.size} selected`;
      }
      label.style.color = 'var(--text)';
    } else {
      const controlName = controlId.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      label.textContent = `Select ${controlName}`;
      label.style.color = 'var(--muted)';
    }
  }

  updateSelectAllState(multiselect) {
    const selectAllCheckbox = multiselect.querySelector('.prime-select-all');
    if (!selectAllCheckbox) return;

    const visibleCheckboxes = Array.from(multiselect.querySelectorAll('.prime-multiselect-item input[type="checkbox"]'))
      .filter(cb => cb.closest('.prime-multiselect-item').style.display !== 'none');

    const checkedCount = visibleCheckboxes.filter(cb => cb.checked).length;

    if (checkedCount === 0) {
      selectAllCheckbox.checked = false;
      selectAllCheckbox.indeterminate = false;
    } else if (checkedCount === visibleCheckboxes.length) {
      selectAllCheckbox.checked = true;
      selectAllCheckbox.indeterminate = false;
    } else {
      selectAllCheckbox.checked = false;
      selectAllCheckbox.indeterminate = true;
    }
  }

  refreshAllMultiselectDisplays() {
    // Update display for all multiselect components
    document.querySelectorAll('.prime-multiselect').forEach(multiselect => {
      const controlId = multiselect.dataset.controlId;
      let stateProperty = null;

      // Map control IDs to state properties
      switch (controlId) {
        case 'categories-select':
          stateProperty = 'categories';
          break;
        case 'deal-types-select':
          stateProperty = 'dealTypes';
          break;
        case 'size-classes-select':
          stateProperty = 'sizeClasses';
          break;
        case 'position-ranges-select':
          stateProperty = 'positionRanges';
          break;
      }

      if (stateProperty && this.state[stateProperty]) {
        this.updateMultiselectDisplay(multiselect, stateProperty);
        this.updateSelectAllState(multiselect);
      }
    });
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.dataGridApp = new DataGridApp();
});