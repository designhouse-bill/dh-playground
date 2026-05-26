/**
 * SHARED CORE - Common Functions for Analytics Dashboard
 * Multi-Page Architecture
 *
 * Contains:
 * - Configuration and constants
 * - State management
 * - Utility functions
 * - Context initialization
 * - Data loading
 */

const DashboardCore = (() => {
  'use strict';

  /* ============================================
     CONFIGURATION
     ============================================ */
  const CONFIG = {
    DEBUG: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    SEARCH_DEBOUNCE_MS: 300
  };

  /* ============================================
     FILTER OPTIONS
     ============================================ */
  const DEAL_TYPES = ['BOGO', 'BOGO 50%', '$1 Off', '$2 Off', '$3 Off', '$ Off', '2 for $5', '2 for $6', '2 for $7', '2 for $8', '3 for $10', '3 for $12', '4 for $5', '5 for $5', 'Mix & Match'];
  const CARD_SIZES = ['1x1', '2x1', '2x2'];

  /* ============================================
     GRID MODE COLUMN CONFIGURATION
     ============================================ */
  const GRID_COLUMNS = [
    { key: 'name', label: 'Promotion', type: 'promotion', sortable: true, sticky: true, visible: true },
    { key: 'categoryName', label: 'Category', type: 'category', sortable: true, sticky: false, visible: true },
    { key: 'dealType', label: 'Deal Type', type: 'deal', sortable: true, sticky: false, visible: true },
    { key: 'views', label: 'CIV', type: 'currency', sortable: true, sticky: false, visible: true },
    { key: 'cc', label: 'CC', type: 'number', sortable: true, sticky: false, visible: true },
    { key: 'addToListCount', label: 'ATL', type: 'currency', sortable: true, sticky: false, visible: true },
    { key: 'percentile', label: 'Percentile', type: 'number', sortable: true, sticky: false, visible: true },
    { key: 'totalScore', label: 'Performance', type: 'performance', sortable: true, sticky: false, visible: true },
    { key: 'cardSize', label: 'Card Size', type: 'text', sortable: true, sticky: false, visible: false },
    { key: 'originalPrice', label: 'Original Price', type: 'currency', sortable: true, sticky: false, visible: false },
    { key: 'salePrice', label: 'Sale Price', type: 'currency', sortable: true, sticky: false, visible: false },
    { key: 'storeCount', label: 'Store Count', type: 'number', sortable: true, sticky: false, visible: false }
  ];

  /* ============================================
     STATE MANAGEMENT
     ============================================ */
  const state = {
    // Data
    allPromotions: [],
    filteredPromotions: [],
    categories: [],
    filteredCategories: [],

    // Active selections
    activeCategory: null,
    activePromotion: null,
    selectedCategoryId: null,

    // Current context (date & entity)
    currentWeek: null,
    currentEntity: null,

    // Filters
    activeFilters: [],

    // Modal state
    selectedWeekId: null,
    selectedEntityId: null,
    selectedFilterType: 'category',
    selectedFilterValue: null,

    // Search
    searchQuery: '',

    // View mode
    viewMode: 'categories',

    // Promo view mode (cards or table)
    promoViewMode: 'table',

    // Loading states
    isLoading: false,
    loadError: null,

    // Comparison mode
    comparisonEnabled: false,

    // Debounce timer
    searchDebounceTimer: null,

    // Table sorting (Promotions view)
    sortColumn: null,
    sortDirection: 'desc',

    // Table sorting (Categories view)
    categorySortColumn: null,
    categorySortDirection: 'desc',

    // Column filters
    columnFilters: {
      dealType: null,
      category: null,
      name: null
    },

    // App Mode (Base, Grid, Compare)
    appMode: 'base',

    // Grid Mode state
    gridMode: {
      currentPage: 1,
      rowsPerPage: 25,
      visibleColumns: [],
      sortColumn: null,
      sortDirection: 'asc',
      columnsDropdownOpen: false,
      columnFilters: {}
    },

    // More Data toggle for category grid
    moreDataEnabled: false,

    // Compare Mode state
    compareMode: {
      layer: 'circulars', // 'circulars' | 'categories' | 'promotions'
      contextA: {
        weekId: null,
        entityId: 'all',
        entityName: 'All Stores',
        entityLevel: 'all',
        entityCount: 0,
        categoryId: null,
        categoryName: null,
        promotionId: null,
        promotionName: null
      },
      contextB: {
        weekId: null,
        entityId: null,
        entityName: null,
        entityLevel: null,
        entityCount: 0,
        categoryId: null,
        categoryName: null,
        promotionId: null,
        promotionName: null
      }
    }
  };

  /* ============================================
     DOM ELEMENT REFERENCES
     ============================================ */
  let elements = {};

  /**
   * Initialize DOM element references
   * Called after DOM is ready
   */
  function initElements() {
    elements = {
      // Layouts
      categoriesLayout: document.getElementById('categories-layout'),
      promotionsLayout: document.getElementById('promotions-layout'),
      gridLayout: document.getElementById('grid-layout'),

      // View By: Categories layout elements
      categoryDataGrid: document.getElementById('category-data-grid'),
      categoryDetailPanel: document.getElementById('category-detail-panel'),
      categoryDetailContent: document.getElementById('category-detail-content'),

      // View By: Promotions layout elements
      categoryList: document.getElementById('category-list'),
      categoryCount: document.getElementById('category-count'),
      promotionGrid: document.getElementById('promotion-grid'),
      promotionTable: document.getElementById('promotion-table'),
      detailPanel: document.getElementById('detail-panel'),
      detailContent: document.getElementById('detail-content'),

      // Grid mode elements
      gridTableHead: document.getElementById('grid-table-head'),
      gridTableBody: document.getElementById('grid-table-body'),
      gridRecordCount: document.getElementById('grid-record-count'),
      gridPageInfo: document.getElementById('grid-page-info'),
      gridRangeInfo: document.getElementById('grid-range-info'),
      gridPrevBtn: document.getElementById('grid-prev-btn'),
      gridNextBtn: document.getElementById('grid-next-btn'),
      gridColumnsBtn: document.getElementById('grid-columns-btn'),
      gridColumnsDropdown: document.getElementById('grid-columns-dropdown'),
      gridColumnsList: document.getElementById('grid-columns-list'),

      // Header elements
      dateSelector: document.getElementById('date-selector'),
      entitySelector: document.getElementById('entity-selector'),
      filterChips: document.getElementById('filter-chips'),
      addFilterBtn: document.getElementById('add-filter-btn'),

      // Mode buttons
      modeGroup: document.querySelector('.mode-group'),
      modeBtns: document.querySelectorAll('.mode-btn'),
      subtabs: document.querySelectorAll('.mode-subtabs .subtab'),

      // Segment buttons (for legacy categories/promotions toggle)
      segmentBtns: document.querySelectorAll('.segment-btn'),

      // View toggles
      cardViewToggle: document.getElementById('card-view-toggle'),
      moreDataToggle: document.getElementById('more-data-toggle'),

      // Modals
      datePickerModal: document.getElementById('date-picker-modal'),
      entitySelectorModal: document.getElementById('entity-selector-modal'),
      addFilterModal: document.getElementById('add-filter-modal'),

      // Search
      weekSearchInput: document.getElementById('week-search-input'),
      entitySearchInput: document.getElementById('entity-search-input'),
      groupSearchInput: document.getElementById('group-search-input')
    };

    return elements;
  }

  /**
   * Get elements reference
   */
  function getElements() {
    return elements;
  }

  /**
   * Get state reference
   */
  function getState() {
    return state;
  }

  /* ============================================
     UTILITY FUNCTIONS
     ============================================ */

  /**
   * Get percentile class for color coding
   */
  function getPercentileClass(percentile) {
    if (percentile >= 75) return 'high';
    if (percentile >= 50) return 'medium';
    return 'low';
  }

  /**
   * Generate HTML for the percentile badge component
   */
  function getPercentileBadgeHTML(percentile) {
    const colorClass = getPercentileClass(percentile);
    return `
      <div class="percentile-badge">
        <img src="./assets/chart-bar.svg" alt="" class="percentile-badge__icon">
        <span class="percentile-badge__value percentile-badge__value--${colorClass}">${percentile}%</span>
      </div>
    `;
  }

  /**
   * Format large numbers with commas
   */
  function formatNumber(num) {
    if (typeof MockData !== 'undefined' && MockData && MockData.formatNumber) {
      return MockData.formatNumber(num);
    }
    return num.toLocaleString();
  }

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
  }

  /**
   * Format date for display
   */
  function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  /**
   * Get deal type badge HTML
   */
  function getDealBadgeHTML(dealType) {
    const typeClass = dealType.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    const badgeClass = typeClass.includes('bogo') ? 'bogo' :
                       typeClass.includes('off') ? 'percent-off' :
                       typeClass.includes('for') ? 'price-point' : 'digital-coupon';
    return `<span class="grid-deal-badge grid-deal-badge--${badgeClass}">${escapeHtml(dealType)}</span>`;
  }

  /**
   * Get comparison badge HTML
   */
  function getComparisonBadgeHTML(change) {
    if (change === 0 || change === null || change === undefined) return '';

    const changeType = typeof MockData !== 'undefined' ? MockData.getChangeIndicator(change) : (change > 0 ? 'up' : 'down');
    const formattedChange = typeof MockData !== 'undefined' ? MockData.formatChange(change) : `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
    const arrow = changeType === 'up' ? 'arrow_upward' : changeType === 'down' ? 'arrow_downward' : 'remove';

    return `
      <div class="comparison-badge comparison-badge--${changeType === 'up' ? 'increase' : changeType === 'down' ? 'decrease' : 'stable'}">
        <span class="material-symbols-outlined">${arrow}</span>
        ${formattedChange}
      </div>
    `;
  }

  /**
   * Get comparison arrow HTML
   */
  function getComparisonArrowHTML(change) {
    if (change === 0 || change === null || change === undefined) return '';

    const changeType = typeof MockData !== 'undefined' ? MockData.getChangeIndicator(change) : (change > 0 ? 'up' : 'down');
    const arrow = changeType === 'up' ? 'trending_up' : changeType === 'down' ? 'trending_down' : 'trending_flat';
    const cssClass = changeType === 'up' ? 'up' : changeType === 'down' ? 'down' : 'stable';

    return `
      <span class="comparison-arrow comparison-arrow--${cssClass}">
        <span class="material-symbols-outlined">${arrow}</span>
      </span>
    `;
  }

  /**
   * Get computed chart colors from CSS custom properties
   * @returns {Object} Color values for chart rendering
   */
  function getChartColors() {
    const styles = getComputedStyle(document.documentElement);
    return {
      views: styles.getPropertyValue('--color-views').trim() || '#4272D8',
      clicks: styles.getPropertyValue('--color-clicks').trim() || '#B8D64D',
      adds: styles.getPropertyValue('--color-adds').trim() || '#937DF8',
      total: styles.getPropertyValue('--color-total').trim() || '#06989D'
    };
  }

  /**
   * Get unique deal types from promotions
   */
  function getUniqueDealTypes() {
    const types = new Set(state.allPromotions.map(p => p.dealType));
    return Array.from(types).sort();
  }

  /**
   * Get unique categories from promotions
   */
  function getUniqueCategories() {
    const cats = new Set(state.allPromotions.map(p => p.categoryName));
    return Array.from(cats).sort();
  }

  /* ============================================
     CONTEXT MANAGEMENT
     ============================================ */

  /**
   * Initialize context from MockData
   * Defaults to most recent publication when no URL params
   */
  function initializeContext() {
    if (typeof MockData === 'undefined' || !MockData || !MockData.context) return;

    // Check if there's a week/pub specified in URL params
    const urlParams = typeof StateManager !== 'undefined' ? StateManager.parseUrlParams() : {};
    const hasUrlWeek = urlParams.weekId || urlParams.pub;

    // If no URL param, default to most recent publication
    if (!hasUrlWeek && !state.selectedWeekId) {
      const weeks = MockData.weeks || [];
      if (weeks.length > 0) {
        // Sort by startDate descending to get most recent first
        const sortedWeeks = [...weeks].sort((a, b) => {
          return new Date(b.startDate) - new Date(a.startDate);
        });
        const mostRecent = sortedWeeks[0];
        state.currentWeek = mostRecent;
        state.selectedWeekId = mostRecent.id;
        // Also update MockData context
        MockData.context.week = mostRecent;
        MockData.context.weekId = mostRecent.id;
        if (CONFIG.DEBUG) {
          console.log('[DashboardCore] Defaulted to most recent publication:', mostRecent.label);
        }
      }
    } else if (hasUrlWeek) {
      // URL param takes precedence
      const weekId = urlParams.weekId || urlParams.pub;
      const week = MockData.weeks.find(w => w.id === weekId);
      if (week) {
        state.currentWeek = week;
        state.selectedWeekId = weekId;
        MockData.context.week = week;
        MockData.context.weekId = weekId;
      }
    } else {
      // Fall back to saved state or MockData default
      state.currentWeek = MockData.context.week;
      state.selectedWeekId = state.selectedWeekId || MockData.context.weekId;
    }

    // Initialize entity context — URL param wins if present
    if (urlParams.entityId && typeof MockData.getEntityById === 'function') {
      const ent = MockData.getEntityById(urlParams.entityId);
      if (ent) {
        MockData.setEntity(ent.id, ent.level, ent.name);
        state.currentEntity = MockData.context.entity;
        state.selectedEntityId = ent.id;
      } else {
        state.currentEntity = MockData.context.entity;
        state.selectedEntityId = MockData.context.entity.id;
      }
    } else {
      state.currentEntity = MockData.context.entity;
      state.selectedEntityId = MockData.context.entity.id;
    }

    updateDateDisplay();
    updateEntityDisplay();
  }

  /**
   * Update date display in header
   */
  function updateDateDisplay() {
    if (typeof MockData === 'undefined') return;
    const week = MockData.weeks.find(w => w.id === state.selectedWeekId);
    if (!week) return;

    const dateCard = elements.dateSelector;
    if (!dateCard) return;

    const valueEl = dateCard.querySelector('.card-value');
    const subEl = dateCard.querySelector('.card-sub');

    if (valueEl) {
      // Include days run in the week label (e.g., "Week 48 (7 Days)")
      const daysRun = week.daysRun || 7;
      const daysLabel = daysRun === 1 ? 'Day' : 'Days';
      valueEl.textContent = `${week.label} (${daysRun} ${daysLabel})`;
    }
    if (subEl) subEl.textContent = week.dateRange;
  }

  /**
   * Update entity display in header
   */
  function updateEntityDisplay() {
    console.log('[DashboardCore] updateEntityDisplay called');
    console.log('[DashboardCore] state.currentEntity:', state.currentEntity);

    const entityCard = elements.entitySelector;
    if (!entityCard) {
      console.log('[DashboardCore] entityCard not found, returning early');
      return;
    }

    const entity = state.currentEntity || (typeof MockData !== 'undefined' ? MockData.context.entity : null);
    console.log('[DashboardCore] Using entity:', entity);
    if (!entity) {
      console.log('[DashboardCore] No entity found, returning early');
      return;
    }

    const valueEl = entityCard.querySelector('.card-value');
    const subEl = entityCard.querySelector('.card-sub');
    const breadcrumbEl = entityCard.querySelector('.card-breadcrumb');
    const iconEl = entityCard.querySelector('.card-icon .material-symbols-outlined');

    console.log('[DashboardCore] Setting entity name to:', entity.name);
    console.log('[DashboardCore] Entity level:', entity.level);
    if (valueEl) valueEl.textContent = entity.name;

    const locationCount = entity.count || (typeof MockData !== 'undefined' ? MockData.entities.stores.length : 0);
    if (subEl) subEl.textContent = `${locationCount} ${locationCount === 1 ? 'Location' : 'locations'}`;

    // Update icon and breadcrumb based on entity level
    if (entity.level === 'all' || entity.level === 'brand') {
      if (iconEl) iconEl.textContent = 'table_rows';
      if (breadcrumbEl) breadcrumbEl.textContent = 'BRAND';
    } else if (entity.level === 'sub-brand') {
      if (iconEl) iconEl.textContent = 'storefront';
      const subBrand = typeof MockData !== 'undefined' ? MockData.entities.subBrands.find(sb => sb.id === entity.id) : null;
      const parentBrand = subBrand ? MockData.entities.brands.find(b => b.id === subBrand.brandId) : null;
      const parentBrandName = parentBrand ? parentBrand.name : 'Brand';
      if (breadcrumbEl) breadcrumbEl.textContent = parentBrandName;
    } else if (entity.level === 'store') {
      if (iconEl) iconEl.textContent = 'storefront';
      const store = typeof MockData !== 'undefined' ? MockData.entities.stores.find(s => s.id === entity.id) : null;
      const subBrand = store ? MockData.entities.subBrands.find(sb => sb.id === store.subBrand) : null;
      const parentBrand = subBrand ? MockData.entities.brands.find(b => b.id === subBrand.brandId) : null;
      const brandName = parentBrand ? parentBrand.name.toUpperCase() : 'BRAND';
      const subBrandName = subBrand ? subBrand.name.toUpperCase() : 'SUB-BRAND';
      if (breadcrumbEl) breadcrumbEl.textContent = `${brandName} > ${subBrandName}`;
    } else if (entity.level === 'brand-group' || entity.level === 'sub-brand-group') {
      if (iconEl) iconEl.textContent = 'workspaces';
      if (breadcrumbEl) breadcrumbEl.textContent = 'GROUP';
    } else {
      if (iconEl) iconEl.textContent = 'table_rows';
      if (breadcrumbEl) breadcrumbEl.textContent = 'BRAND';
    }
  }

  /**
   * Get extended weeks list from MockData
   */
  function getExtendedWeeks() {
    if (typeof MockData === 'undefined') return [];
    return MockData.weeks.map(week => ({
      id: week.id,
      num: week.num,
      label: week.label,
      dateRange: week.dateRange
    }));
  }

  /* ============================================
     DATA LOADING
     ============================================ */

  /**
   * Load initial data from DataService
   */
  async function loadData() {
    state.isLoading = true;

    try {
      if (typeof DataService !== 'undefined') {
        // Call DataService methods with proper arguments
        const [promotions, categories] = await Promise.all([
          DataService.getPromotions({}),
          DataService.getCategories()
        ]);
        state.allPromotions = promotions || [];
        state.categories = categories || [];
        state.filteredPromotions = [...state.allPromotions];
        state.filteredCategories = [...state.categories];
      } else if (typeof MockData !== 'undefined') {
        // Fallback to MockData directly
        state.allPromotions = MockData.promotions || [];
        state.categories = MockData.categories || [];
        state.filteredPromotions = [...state.allPromotions];
        state.filteredCategories = [...state.categories];
      }

      state.isLoading = false;
      state.loadError = null;

      return true;
    } catch (error) {
      console.error('[DashboardCore] Failed to load data:', error);
      state.isLoading = false;
      state.loadError = error.message;
      return false;
    }
  }

  /* ============================================
     SORTING FUNCTIONS
     ============================================ */

  /**
   * Sort promotions by column
   */
  function sortPromotions(promotions, column, direction) {
    if (!column) return promotions;

    return [...promotions].sort((a, b) => {
      let valA, valB;

      switch (column) {
        case 'name':
          valA = (a.name || '').toLowerCase();
          valB = (b.name || '').toLowerCase();
          break;
        case 'dealType':
          valA = (a.dealType || '').toLowerCase();
          valB = (b.dealType || '').toLowerCase();
          break;
        case 'views':
          valA = a.views || 0;
          valB = b.views || 0;
          break;
        case 'cc':
          valA = a.cc || 0;
          valB = b.cc || 0;
          break;
        case 'addToListCount':
          valA = a.addToListCount || 0;
          valB = b.addToListCount || 0;
          break;
        case 'percentile':
          valA = a.percentile || 0;
          valB = b.percentile || 0;
          break;
        default:
          valA = a[column] || 0;
          valB = b[column] || 0;
      }

      if (typeof valA === 'string') {
        const cmp = valA.localeCompare(valB);
        return direction === 'asc' ? cmp : -cmp;
      } else {
        const cmp = valA - valB;
        return direction === 'asc' ? cmp : -cmp;
      }
    });
  }

  /**
   * Sort categories by column
   */
  function sortCategories(categories, column, direction) {
    if (!column) return categories;

    return [...categories].sort((a, b) => {
      let valA, valB;

      switch (column) {
        case 'name':
          valA = (a.name || '').toLowerCase();
          valB = (b.name || '').toLowerCase();
          break;
        case 'promotionCount':
          valA = a.promotionCount || 0;
          valB = b.promotionCount || 0;
          break;
        case 'views':
          valA = a.views || 0;
          valB = b.views || 0;
          break;
        case 'cc':
          valA = a.cc || 0;
          valB = b.cc || 0;
          break;
        case 'addToListCount':
          valA = a.addToListCount || 0;
          valB = b.addToListCount || 0;
          break;
        case 'percentile':
          valA = a.percentile || 0;
          valB = b.percentile || 0;
          break;
        case 'totalScore':
          valA = a.totalScore || 0;
          valB = b.totalScore || 0;
          break;
        default:
          valA = a[column] || 0;
          valB = b[column] || 0;
      }

      if (typeof valA === 'string') {
        const cmp = valA.localeCompare(valB);
        return direction === 'asc' ? cmp : -cmp;
      } else {
        const cmp = valA - valB;
        return direction === 'asc' ? cmp : -cmp;
      }
    });
  }

  /* ============================================
     NAVIGATION HELPERS
     ============================================ */

  /**
   * Set active state for navigation based on current page
   */
  function setActiveNavigation() {
    const currentPage = StateManager.getCurrentPage();

    // Determine which mode we're in
    let activeMode = 'base';
    let activeView = 'categories';

    if (currentPage === 'base_circulars' || currentPage === 'engagement-circulars' || currentPage === 'index') {
      activeMode = 'base';
      activeView = 'circulars';
    } else if (currentPage === 'base_categories' || currentPage === 'engagement-categories') {
      activeMode = 'base';
      activeView = 'categories';
    } else if (currentPage === 'base_promotions' || currentPage === 'engagement-promotions') {
      activeMode = 'base';
      activeView = 'promotions';
    } else if (currentPage === 'grid-inquiry' || currentPage === 'engagement-grid') {
      activeMode = 'grid';
    } else if (currentPage === 'compare' || currentPage === 'engagement-compare') {
      activeMode = 'compare';
    }

    state.appMode = activeMode;

    // Update mode buttons. Links that explicitly declare `aria-current="page"`
    // in markup keep their static .active state (used by Report + Explore Data
    // main-nav links which don't use data-mode).
    document.querySelectorAll('.mode-btn').forEach(btn => {
      if (btn.getAttribute('aria-current') === 'page') {
        btn.classList.add('active');
        return;
      }
      const mode = btn.dataset.mode;
      if (mode === activeMode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update breadcrumb dropdown options (active state)
    document.querySelectorAll('.breadcrumb-option').forEach(option => {
      const view = option.dataset.view;
      if (view === activeView) {
        option.classList.add('active');
      } else {
        option.classList.remove('active');
      }
    });
  }

  /**
   * Navigate to another page with state preservation
   */
  function navigateTo(page, params = {}) {
    StateManager.navigateTo(page, state, params);
  }

  /**
   * Save current state to localStorage
   */
  function saveState() {
    StateManager.save(state);
  }

  /* ============================================
     TOAST NOTIFICATION SYSTEM
     ============================================ */

  /**
   * Show a toast notification
   * @param {string} message - Message to display
   * @param {Object} options - Optional settings
   * @param {number} options.duration - Duration in ms (default 3000)
   * @param {string} options.type - Type: 'success', 'error', 'info' (default 'success')
   */
  function showToast(message, options = {}) {
    const { duration = 3000, type = 'success' } = options;

    // Remove any existing toasts
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
      existingToast.remove();
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-notification--${type}`;

    // Add icon based on type
    let icon = 'check_circle';
    if (type === 'error') icon = 'error';
    if (type === 'info') icon = 'info';

    toast.innerHTML = `
      <span class="material-symbols-outlined toast-icon">${icon}</span>
      <span class="toast-message">${escapeHtml(message)}</span>
    `;

    document.body.appendChild(toast);

    // Trigger show animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Auto-hide after duration
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.remove();
        }
      }, 300);
    }, duration);

    return toast;
  }

  /**
   * Handle share button click - copies URL to clipboard and shows toast
   */
  async function handleShareClick() {
    const success = await StateManager.copyShareUrl(state);
    if (success) {
      showToast('Link copied to clipboard');
    } else {
      showToast('Failed to copy link', { type: 'error' });
    }
  }

  /**
   * Restore state from localStorage and URL params
   */
  function restoreState() {
    const savedState = StateManager.initialize();
    if (savedState) {
      // Merge saved state into current state
      Object.keys(savedState).forEach(key => {
        if (savedState[key] !== undefined && savedState[key] !== null) {
          state[key] = savedState[key];
        }
      });
    }
  }

  /* ============================================
     PUBLIC API
     ============================================ */
  return {
    // Config & Constants
    CONFIG,
    DEAL_TYPES,
    CARD_SIZES,
    GRID_COLUMNS,

    // State & Elements
    getState,
    getElements,
    initElements,

    // Utilities
    getPercentileClass,
    getPercentileBadgeHTML,
    formatNumber,
    escapeHtml,
    formatDate,
    getDealBadgeHTML,
    getComparisonBadgeHTML,
    getComparisonArrowHTML,
    getChartColors,
    getUniqueDealTypes,
    getUniqueCategories,

    // Context
    initializeContext,
    updateDateDisplay,
    updateEntityDisplay,
    getExtendedWeeks,

    // Data
    loadData,
    sortPromotions,
    sortCategories,

    // Navigation
    setActiveNavigation,
    navigateTo,
    saveState,
    restoreState,

    // Toast & Share
    showToast,
    handleShareClick
  };
})();

// Make available globally
window.DashboardCore = DashboardCore;

/* ============================================
   BREADCRUMB DROPDOWN FUNCTIONS
   Global functions for panel breadcrumb navigation
   ============================================ */

/**
 * Toggle the breadcrumb dropdown visibility
 */
function toggleBreadcrumbDropdown(event) {
  event.stopPropagation();
  const dropdown = document.getElementById('panel-breadcrumb-dropdown');
  const button = document.getElementById('panel-breadcrumb');

  if (!dropdown || !button) return;

  const isOpen = dropdown.classList.contains('open');

  if (isOpen) {
    closeBreadcrumbDropdown();
  } else {
    dropdown.classList.add('open');
    button.setAttribute('aria-expanded', 'true');

    // Add click outside listener
    setTimeout(() => {
      document.addEventListener('click', closeBreadcrumbDropdownOnOutsideClick);
    }, 0);
  }
}

/**
 * Close the breadcrumb dropdown
 */
function closeBreadcrumbDropdown() {
  const dropdown = document.getElementById('panel-breadcrumb-dropdown');
  const button = document.getElementById('panel-breadcrumb');

  if (dropdown) dropdown.classList.remove('open');
  if (button) button.setAttribute('aria-expanded', 'false');

  document.removeEventListener('click', closeBreadcrumbDropdownOnOutsideClick);
}

/**
 * Close dropdown when clicking outside
 */
function closeBreadcrumbDropdownOnOutsideClick(event) {
  const wrapper = document.querySelector('.panel-breadcrumb-wrapper');
  if (wrapper && !wrapper.contains(event.target)) {
    closeBreadcrumbDropdown();
  }
}

/**
 * Navigate to a view while maintaining relevant filters
 * @param {Event} event - Click event
 * @param {string} page - Target page URL
 * @param {string} targetView - Target view type (circulars, categories, promotions)
 */
function navigateWithFilters(event, page, targetView) {
  event.preventDefault();
  event.stopPropagation();

  closeBreadcrumbDropdown();

  // Get current state
  const state = DashboardCore.getState();

  // Determine which filters are relevant for the target view
  const relevantFilters = filterFiltersForView(state.activeFilters || [], targetView);

  // Update state with filtered filters
  state.activeFilters = relevantFilters;

  // Clear view-specific selections when changing views
  if (targetView === 'circulars') {
    state.selectedCategoryId = null;
    state.activeCategory = null;
    state.selectedPromoId = null;
  } else if (targetView === 'categories') {
    state.selectedStoreId = null;
    state.activeStore = null;
    state.selectedPromoId = null;
  } else if (targetView === 'promotions') {
    state.selectedStoreId = null;
    state.activeStore = null;
  }

  // Save state and navigate
  DashboardCore.saveState();
  StateManager.navigateTo(page, state);
}

/**
 * Filter filters based on target view relevance
 * @param {Array} filters - Current active filters
 * @param {string} targetView - Target view (circulars, categories, promotions)
 * @returns {Array} - Filtered array of relevant filters
 */
function filterFiltersForView(filters, targetView) {
  if (!filters || !Array.isArray(filters)) return [];

  return filters.filter(filter => {
    // Date filters are always relevant
    if (filter.type === 'date' || filter.type === 'dateRange') return true;

    // Deal type filters are relevant for categories and promotions
    if (filter.type === 'deal' || filter.type === 'dealType') {
      return targetView === 'categories' || targetView === 'promotions';
    }

    // Store filters are relevant for categories and promotions (drilling down from store)
    if (filter.type === 'store') {
      return targetView === 'categories' || targetView === 'promotions';
    }

    // Category filters are only relevant for promotions
    if (filter.type === 'category') {
      return targetView === 'promotions';
    }

    // Promotion filters are only relevant for promotions view
    if (filter.type === 'promotion') {
      return targetView === 'promotions';
    }

    // Keep other filters by default
    return true;
  });
}

/**
 * Toggle the BASE layer dropdown (Promotions/Categories/Circulars)
 */
function toggleBaseLayerDropdown() {
  const wrapper = document.getElementById('base-layer-dropdown-wrapper');
  const button = document.getElementById('base-layer-dropdown');

  if (!wrapper || !button) return;

  const isOpen = wrapper.classList.contains('open');

  if (isOpen) {
    closeBaseLayerDropdown();
  } else {
    wrapper.classList.add('open');
    button.setAttribute('aria-expanded', 'true');

    // Close on outside click
    setTimeout(() => {
      document.addEventListener('click', closeBaseLayerDropdownOnOutsideClick);
    }, 0);
  }
}

/**
 * Close the BASE layer dropdown
 */
function closeBaseLayerDropdown() {
  const wrapper = document.getElementById('base-layer-dropdown-wrapper');
  const button = document.getElementById('base-layer-dropdown');

  if (wrapper) wrapper.classList.remove('open');
  if (button) button.setAttribute('aria-expanded', 'false');

  document.removeEventListener('click', closeBaseLayerDropdownOnOutsideClick);
}

/**
 * Close BASE layer dropdown when clicking outside
 */
function closeBaseLayerDropdownOnOutsideClick(event) {
  const wrapper = document.getElementById('base-layer-dropdown-wrapper');
  if (wrapper && !wrapper.contains(event.target)) {
    closeBaseLayerDropdown();
  }
}

/**
 * Initialize BASE layer dropdown event listeners
 */
function initBaseLayerDropdown() {
  const trigger = document.getElementById('base-layer-dropdown');
  if (trigger) {
    trigger.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleBaseLayerDropdown();
    });
  }
}

// Initialize dropdown when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBaseLayerDropdown);
} else {
  initBaseLayerDropdown();
}

// Expose functions globally
window.toggleBreadcrumbDropdown = toggleBreadcrumbDropdown;
window.closeBreadcrumbDropdown = closeBreadcrumbDropdown;
window.navigateWithFilters = navigateWithFilters;
window.toggleBaseLayerDropdown = toggleBaseLayerDropdown;
window.closeBaseLayerDropdown = closeBaseLayerDropdown;
