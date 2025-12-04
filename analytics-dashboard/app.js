/**
 * Analytics Dashboard v6 Production - Application Logic
 * CLIENT RETENTION PROJECT - Production-Grade Quality Required
 *
 * Architecture:
 * - State management for categories, promotions, filters
 * - Event handling for user interactions
 * - Dynamic rendering of UI components
 * - Error handling and performance optimization
 */

(function() {
  'use strict';

  /* ============================================
     CONFIGURATION
     ============================================ */
  const CONFIG = {
    DEBUG: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    SEARCH_DEBOUNCE_MS: 300
  };

  /* ============================================
     FILTER OPTIONS (extracted from promotions)
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
    { key: 'civ', label: 'CIV', type: 'currency', sortable: true, sticky: false, visible: true },
    { key: 'cc', label: 'CC', type: 'number', sortable: true, sticky: false, visible: true },
    { key: 'atl', label: 'ATL', type: 'currency', sortable: true, sticky: false, visible: true },
    { key: 'percentile', label: 'Percentile', type: 'number', sortable: true, sticky: false, visible: true },
    { key: 'compositeScore', label: 'Performance', type: 'performance', sortable: true, sticky: false, visible: true },
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
    selectedCategoryId: null, // For category grid detail panel

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
    viewMode: 'categories', // 'categories' or 'promotions'

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
    sortColumn: null,      // 'name', 'dealType', 'civ', 'cc', 'atl', 'percentile'
    sortDirection: 'desc', // 'asc' or 'desc'

    // Table sorting (Categories view)
    categorySortColumn: null,      // 'name', 'civ', 'cc', 'atl', 'percentile', 'compositeScore'
    categorySortDirection: 'desc', // 'asc' or 'desc'

    // Column filters
    columnFilters: {
      dealType: null,      // Selected deal type filter
      category: null       // Selected category filter
    },

    // App Mode (Base, Grid, Compare)
    appMode: 'base', // 'base' | 'grid' | 'compare'

    // Grid Mode state
    gridMode: {
      currentPage: 1,
      rowsPerPage: 25,
      visibleColumns: [], // Column keys that are visible
      sortColumn: null,
      sortDirection: 'asc',
      columnsDropdownOpen: false,
      columnFilters: {} // Per-column filters: { columnKey: filterValue }
    },

    // More Data toggle for category grid
    moreDataEnabled: false
  };

  /* ============================================
     DOM ELEMENT REFERENCES
     ============================================ */
  const elements = {
    // View By: Categories layout
    categoriesLayout: document.getElementById('categories-layout'),
    categoryGridBody: document.getElementById('category-grid-body'),
    categoryGridCount: document.getElementById('category-grid-count'),
    categoryDetailPanel: document.getElementById('category-detail-panel'),
    categoryDetailContent: document.getElementById('category-detail-content'),
    // View By: Promotions layout
    promotionsLayout: document.getElementById('promotions-layout'),
    categoryList: document.getElementById('category-list'),
    promotionGrid: document.getElementById('promotion-grid'),
    promotionTable: document.getElementById('promotion-table'),
    detailContent: document.getElementById('detail-content'),
    categoryCount: document.getElementById('category-count'),
    promoCount: document.getElementById('promo-count'),
    detailPanel: document.getElementById('detail-panel'),
    // Shared elements
    searchInput: document.getElementById('search-input'),
    filterChips: document.getElementById('filter-chips'),
    addFilterBtn: document.getElementById('add-filter-btn'),
    segmentBtns: document.querySelectorAll('.segment-btn'),
    comparisonToggle: document.getElementById('comparison-toggle'),
    // Context cards
    dateSelector: document.getElementById('date-selector'),
    entitySelector: document.getElementById('entity-selector'),
    // Modals
    datePickerModal: document.getElementById('date-picker-modal'),
    entitySelectorModal: document.getElementById('entity-selector-modal'),
    addFilterModal: document.getElementById('add-filter-modal'),
    weekList: document.getElementById('week-list'),
    entityTree: document.getElementById('entity-tree'),
    entityTreeBody: document.getElementById('entity-tree-body'),
    // Grid Mode elements
    gridLayout: document.getElementById('grid-layout'),
    gridTableHead: document.getElementById('grid-table-head'),
    gridTableBody: document.getElementById('grid-table-body'),
    gridRecordCount: document.getElementById('grid-record-count'),
    gridColumnsBtn: document.getElementById('grid-columns-btn'),
    gridColumnsDropdown: document.getElementById('grid-columns-dropdown'),
    gridColumnsList: document.getElementById('grid-columns-list'),
    gridRowsSelect: document.getElementById('grid-rows-select'),
    gridPrevBtn: document.getElementById('grid-prev-btn'),
    gridNextBtn: document.getElementById('grid-next-btn'),
    gridPageInfo: document.getElementById('grid-page-info'),
    gridRangeInfo: document.getElementById('grid-range-info'),
    // Mode buttons
    modeBtns: document.querySelectorAll('.mode-btn')
  };

  /* ============================================
     INITIALIZATION
     ============================================ */
  async function init() {
    try {
      // Check dependencies
      if (typeof MockData === 'undefined') {
        throw new Error('MockData not loaded. Please ensure mock-data.js is included.');
      }
      if (typeof DataService === 'undefined') {
        throw new Error('DataService not loaded. Please ensure data-service.js is included.');
      }
      if (typeof CacheManager === 'undefined') {
        console.warn('⚠️ CacheManager not loaded. Caching will be disabled.');
      }

      // Bind event listeners first (so loading state can be shown)
      bindEvents();

      // Show loading state
      setLoading(true);
      renderLoadingState();

      // Load data from DataService (with caching)
      const [categories, promotions] = await Promise.all([
        DataService.getCategories(),
        DataService.getPromotions()
      ]);

      state.categories = categories || [];
      state.filteredCategories = [...state.categories];
      state.allPromotions = promotions || [];
      state.filteredPromotions = [...state.allPromotions];
      state.loadError = null;

      // Clear loading and render content
      setLoading(false);
      renderCategoryGrid();  // View By: Categories
      renderCategories();    // View By: Promotions sidebar
      renderPromotions();
      updateCounts();

      // Initialize context from MockData
      initializeContext();

      // Render modal content
      renderWeekList();
      renderEntityTree();
      renderFilterOptions();

      console.log('✅ v6 Production Dashboard initialized successfully');

      // Log data service stats in debug mode
      if (window.location.hostname === 'localhost') {
        DataService.getStats().then(stats => {
          console.log('📊 DataService Stats:', stats);
        });
      }
    } catch (error) {
      console.error('❌ Initialization error:', error);
      state.loadError = error;
      setLoading(false);
      renderErrorState(error);
    }
  }

  /* ============================================
     RENDERING FUNCTIONS
     ============================================ */

  /**
   * Render the category list in the left panel
   */
  function renderCategories() {
    if (!elements.categoryList) return;

    // "All Categories" item
    const allItem = createCategoryItem({
      id: 'all',
      name: 'All Categories',
      promotionCount: state.allPromotions.length,
      isAll: true
    });

    // Individual category items
    const categoryItems = state.categories.map(cat => createCategoryItem(cat));

    elements.categoryList.innerHTML = allItem + categoryItems.join('');
  }

  /**
   * Create HTML for a single category item
   */
  function createCategoryItem(cat) {
    const isActive = state.activeCategory === cat.id || (cat.isAll && state.activeCategory === null);
    const percentileClass = cat.percentile ? getPercentileClass(cat.percentile) : '';
    const allClass = cat.isAll ? 'category-item--all' : '';

    // Get comparison data if comparison mode is enabled and not "All" category
    let comparisonHTML = '';
    if (state.comparisonEnabled && !cat.isAll && cat.id !== 'all') {
      const comparison = MockData.getCategoryComparison(cat.id);
      if (comparison && comparison.change) {
        comparisonHTML = `
          <div class="category-item__comparison">
            ${getComparisonArrowHTML(comparison.change.civ)}
            <span style="font-size: var(--font-size-xs);">${MockData.formatChange(comparison.change.civ)}</span>
          </div>
        `;
      }
    }

    return `
      <div class="category-item ${allClass} ${isActive ? 'active' : ''}"
           data-id="${cat.id}"
           role="listitem"
           tabindex="0"
           aria-label="${cat.name}, ${cat.promotionCount} promotions">
        <div class="category-item__info">
          <div class="category-item__name">${escapeHtml(cat.name)}</div>
          <div class="category-item__meta">
            ${cat.promotionCount} promotion${cat.promotionCount !== 1 ? 's' : ''}
            ${comparisonHTML}
          </div>
        </div>
        ${cat.percentile ? getPercentileBadgeHTML(cat.percentile) : ''}
      </div>
    `;
  }

  /* ============================================
     CATEGORY DATA GRID (View By: Categories)
     ============================================ */

  /**
   * Render the category data grid for "View By: Categories"
   * Supports "More Data" toggle to show/hide additional columns
   */
  function renderCategoryGrid() {
    const gridContainer = document.getElementById('category-data-grid');
    if (!gridContainer) return;

    // Use filtered categories if filters are active, otherwise use all categories
    let categories = state.filteredCategories.length > 0 || state.activeFilters.length > 0
      ? state.filteredCategories
      : state.categories;

    if (!categories || categories.length === 0) {
      gridContainer.innerHTML = `
        <div class="table-empty">
          <span class="material-symbols-outlined">category</span>
          <p>No categories available</p>
        </div>
      `;
      return;
    }

    // Apply sorting
    categories = sortCategories(categories, state.categorySortColumn, state.categorySortDirection);

    // Calculate max composite score for performance bars
    const maxScore = Math.max(...categories.map(c => c.compositeScore || 0));

    const rows = categories.map((cat, index) => {
      const isSelected = state.selectedCategoryId === cat.id;
      const perfPercent = maxScore > 0 ? ((cat.compositeScore || 0) / maxScore * 100) : 0;
      const perfClass = cat.percentile >= 75 ? 'high' : cat.percentile >= 50 ? 'medium' : 'low';

      return `
        <tr class="category-row ${isSelected ? 'selected' : ''}"
            data-category-id="${cat.id}"
            onclick="selectCategoryGridRow('${cat.id}')">
          <td class="col-num">
            <span class="row-number">${index + 1}</span>
          </td>
          <td class="col-category">
            <div class="category-name">
              <div class="category-icon">
                <span class="material-symbols-outlined">category</span>
              </div>
              <span class="category-label">${escapeHtml(cat.name)}</span>
            </div>
          </td>
          <td class="col-views">${formatNumber(cat.civ)}</td>
          <td class="col-clicks">${formatNumber(cat.cc)}</td>
          <td class="col-added">${formatNumber(cat.atl)}</td>
          <td class="col-perf">
            <div class="perf-bar">
              <div class="perf-bar__track perf-bar__track--${perfClass}">
                <div class="perf-bar__fill perf-bar__fill--${perfClass}" style="width: ${perfPercent}%"></div>
              </div>
              <span class="perf-bar__value">${formatNumber(cat.compositeScore)}</span>
            </div>
          </td>
          <td class="col-percentile">
            <div class="percentile-badge">
              <img src="./assets/chart-bar.svg" alt="" class="percentile-badge__icon">
              <span class="percentile-badge__value percentile-badge__value--${perfClass}">${cat.percentile}%</span>
            </div>
          </td>
        </tr>
      `;
    });

    // Maintain more-data-enabled class if set
    const moreDataClass = state.moreDataEnabled ? 'more-data-enabled' : '';

    gridContainer.innerHTML = `
      <table class="category-grid-table data-table--sortable ${moreDataClass}">
        <thead>
          <tr>
            <th class="col-num">#</th>
            ${getCategorySortableHeaderHTML('Category', 'name', 'col-category')}
            ${getCategorySortableHeaderHTML('Views', 'civ', 'col-views')}
            ${getCategorySortableHeaderHTML('Clicks', 'cc', 'col-clicks')}
            ${getCategorySortableHeaderHTML('Added', 'atl', 'col-added')}
            ${getCategorySortableHeaderHTML('Performance', 'compositeScore', 'col-perf')}
            ${getCategorySortableHeaderHTML('%tile', 'percentile', 'col-percentile')}
          </tr>
        </thead>
        <tbody id="category-grid-body">
          ${rows.join('')}
        </tbody>
      </table>
    `;

    // Apply more-data-enabled class to container for CSS styling
    gridContainer.classList.toggle('more-data-enabled', state.moreDataEnabled);
  }

  /**
   * Handle category row selection in grid view
   */
  function selectCategoryGridRow(categoryId) {
    state.selectedCategoryId = categoryId;
    state.activeCategory = categoryId; // Sync with Promotions view

    // Update row selection styling
    const rows = document.querySelectorAll('.category-row');
    rows.forEach(row => {
      row.classList.toggle('selected', row.dataset.categoryId === categoryId);
    });

    // Render the category detail panel
    renderCategoryDetail(categoryId);

    // Expand the detail panel
    if (elements.categoryDetailPanel) {
      elements.categoryDetailPanel.classList.remove('panel--collapsed');
      elements.categoryDetailPanel.classList.add('panel--expanded');
    }
  }

  /**
   * Render category detail panel content
   */
  function renderCategoryDetail(categoryId) {
    if (!elements.categoryDetailContent) return;

    const category = state.categories.find(c => c.id === categoryId);
    if (!category) {
      elements.categoryDetailContent.innerHTML = '<p>Category not found</p>';
      return;
    }

    elements.categoryDetailContent.innerHTML = `
      <div class="category-detail-header">
        <h3 class="category-detail-name">${escapeHtml(category.name)}</h3>
        <div class="category-detail-count">
          <span class="material-symbols-outlined" style="font-size: 16px;">local_offer</span>
          <strong>${category.promotionCount}</strong> Promotions
        </div>
      </div>

      <div class="category-metrics">
        <div class="category-metric">
          <div class="category-metric__label">Views</div>
          <div class="category-metric__value">${formatNumber(category.civ)}</div>
        </div>
        <div class="category-metric">
          <div class="category-metric__label">Clicks</div>
          <div class="category-metric__value">${formatNumber(category.cc)}</div>
        </div>
        <div class="category-metric">
          <div class="category-metric__label">Added to List</div>
          <div class="category-metric__value">${formatNumber(category.atl)}</div>
        </div>
        <div class="category-metric">
          <div class="category-metric__label">Percentile</div>
          <div class="category-metric__value">${category.percentile}%</div>
        </div>
      </div>

      <div class="category-actions">
        <button class="category-action-btn category-action-btn--primary" onclick="viewCategoryPromotions('${categoryId}')">
          <span class="material-symbols-outlined">visibility</span>
          View Promotions (${category.promotionCount})
        </button>
        <button class="category-action-btn category-action-btn--secondary" onclick="openCategoryInquiry('${categoryId}')">
          <span class="material-symbols-outlined">table_chart</span>
          Inquiry Data Grid
        </button>
        <button class="category-action-btn category-action-btn--secondary" onclick="compareCategoryAction('${categoryId}')">
          <span class="material-symbols-outlined">compare</span>
          Compare
        </button>
      </div>
    `;
  }

  /**
   * Close category detail panel
   */
  function closeCategoryDetail() {
    state.selectedCategoryId = null;
    // Also sync with Promotions view context
    state.activeCategory = null;

    // Update row selection styling
    const rows = document.querySelectorAll('.category-row');
    rows.forEach(row => row.classList.remove('selected'));

    // Collapse the detail panel
    if (elements.categoryDetailPanel) {
      elements.categoryDetailPanel.classList.add('panel--collapsed');
      elements.categoryDetailPanel.classList.remove('panel--expanded');
    }
  }

  /**
   * Switch to Promotions view filtered by category
   */
  function viewCategoryPromotions(categoryId) {
    // Get category details for filter
    const category = state.categories.find(c => c.id === categoryId);
    if (!category) return;

    // Set the active category filter
    state.activeCategory = categoryId;
    state.selectedCategoryId = categoryId;

    // Switch to Promotions view
    state.viewMode = 'promotions';

    // Update mode-subtabs (Categories/Promotions tabs in view-modes)
    const subtabs = document.querySelectorAll('.mode-subtabs .subtab');
    subtabs.forEach(tab => {
      const isPromotions = tab.dataset.view === 'promotions';
      tab.classList.toggle('active', isPromotions);
      tab.setAttribute('aria-selected', isPromotions ? 'true' : 'false');
    });

    // Update segment buttons (legacy support)
    elements.segmentBtns.forEach(btn => {
      const isPromotions = btn.dataset.view === 'promotions';
      btn.classList.toggle('active', isPromotions);
      btn.setAttribute('aria-selected', isPromotions);
    });

    // Toggle layouts
    if (elements.categoriesLayout && elements.promotionsLayout) {
      elements.categoriesLayout.style.display = 'none';
      elements.promotionsLayout.style.display = 'flex';
    }

    // Add category filter chip to context row
    // First remove any existing category filters
    state.activeFilters = state.activeFilters.filter(f => f.type !== 'category');
    // Add the new category filter
    state.activeFilters.push({
      type: 'category',
      value: categoryId,
      label: 'Category',
      fromColumn: false
    });

    // Also set the column filter for the table header dropdown
    state.columnFilters.category = category.name;

    // Render filter chips in context row
    renderFilterChips();

    // Update promotions sidebar selection
    renderCategories();

    // Filter and render promotions
    applyFilters();

    // Update search placeholder
    if (elements.searchInput) {
      elements.searchInput.placeholder = 'Search promotions...';
    }

    console.log(`Viewing promotions for category: ${categoryId}`);
  }

  /**
   * Open Inquiry Data Grid for category
   */
  function openCategoryInquiry(categoryId) {
    console.log(`Opening Inquiry Grid for category: ${categoryId}`);

    // Get category name for filter
    const category = state.categories.find(c => c.id === categoryId);
    if (category) {
      // Set category filter in Grid mode
      state.gridMode.columnFilters.categoryName = category.name;
    }

    // Switch to Grid mode
    handleModeChange('grid');
  }

  /**
   * Open Compare view for category
   */
  function compareCategoryAction(categoryId) {
    console.log(`Opening Compare for category: ${categoryId}`);

    // Enable comparison mode
    state.comparisonEnabled = true;

    // Update comparison toggle button
    if (elements.comparisonToggle) {
      elements.comparisonToggle.classList.add('active');
    }

    // Switch to compare mode
    handleModeChange('compare');
  }

  /**
   * Open Compare view for a promotion
   */
  function comparePromotion(promoId) {
    console.log(`Opening Compare for promotion: ${promoId}`);

    // Enable comparison mode
    state.comparisonEnabled = true;

    // Update comparison toggle button
    if (elements.comparisonToggle) {
      elements.comparisonToggle.classList.add('active');
    }

    // Switch to compare mode
    handleModeChange('compare');
  }

  /**
   * Render the promotion grid in the center panel
   */
  function renderPromotions() {
    if (!elements.promotionGrid) return;

    if (state.filteredPromotions.length === 0) {
      elements.promotionGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: var(--space-8); color: var(--color-text-tertiary);">
          <div style="font-size: 48px; margin-bottom: var(--space-4);">📭</div>
          <p>No promotions found</p>
        </div>
      `;
      return;
    }

    // Calculate max values for bar charts
    const maxCiv = Math.max(...state.filteredPromotions.map(p => p.civ));
    const maxCc = Math.max(...state.filteredPromotions.map(p => p.cc));
    const maxAtl = Math.max(...state.filteredPromotions.map(p => p.atl));

    const promoCards = state.filteredPromotions.map((promo, index) =>
      createPromoCard(promo, index + 1, { maxCiv, maxCc, maxAtl })
    );
    elements.promotionGrid.innerHTML = promoCards.join('');

    // Also render table view
    renderPromotionTable({ maxCiv, maxCc, maxAtl });
  }

  /**
   * Create HTML for a single promotion card
   */
  function createPromoCard(promo, position, maxValues) {
    const isActive = state.activePromotion === promo.id;

    // Calculate performance bar width (based on percentile)
    const performanceWidth = promo.percentile;
    const perfClass = promo.percentile >= 75 ? 'high' : promo.percentile >= 50 ? 'medium' : 'low';

    // Get comparison data if comparison mode is enabled
    let comparisonHTML = '';
    if (state.comparisonEnabled) {
      const comparison = MockData.getPromotionComparison(promo.id);
      if (comparison && comparison.change) {
        comparisonHTML = `
          <div class="promo-card__comparison">
            <span style="font-size: var(--font-size-xs); color: var(--color-text-tertiary);">vs. Last Week:</span>
            ${getComparisonBadgeHTML(comparison.change.civ)}
          </div>
        `;
      }
    }

    return `
      <div class="promo-card ${isActive ? 'active' : ''}"
           data-id="${promo.id}"
           role="listitem"
           tabindex="0"
           aria-label="${promo.name}">
        <div class="promo-card__image-wrapper">
          <div class="promo-card__position">${position}</div>
          <img class="promo-card__image"
               src="${promo.thumbImage}"
               alt="${escapeHtml(promo.name)}"
               loading="lazy">
        </div>
        <div class="promo-card__content">
          <div class="promo-card__badges">
            <span class="promo-card__deal-badge">${escapeHtml(promo.dealType)}</span>
            ${getPercentileBadgeHTML(promo.percentile)}
          </div>
          <h3 class="promo-card__title">${escapeHtml(promo.name)}</h3>
          <p class="promo-card__meta">${escapeHtml(promo.categoryName)}</p>
          <div class="promo-card__stats">
            <div class="promo-stat">
              <span class="promo-stat__value">${formatNumber(promo.civ)}</span>
              <span class="promo-stat__label">Views</span>
            </div>
            <div class="promo-stat">
              <span class="promo-stat__value">${formatNumber(promo.cc)}</span>
              <span class="promo-stat__label">Clicks</span>
            </div>
            <div class="promo-stat">
              <span class="promo-stat__value">${formatNumber(promo.atl)}</span>
              <span class="promo-stat__label">Added</span>
            </div>
          </div>
          <div class="promo-card__chart">
            <div class="perf-bar">
              <div class="perf-bar__track perf-bar__track--${perfClass}">
                <div class="perf-bar__fill perf-bar__fill--${perfClass}" style="width: ${performanceWidth}%"></div>
              </div>
              <span class="perf-bar__value">${promo.compositeScore || Math.round(performanceWidth)}</span>
            </div>
          </div>
          ${comparisonHTML}
        </div>
      </div>
    `;
  }

  /**
   * Render promotion table view
   */
  function renderPromotionTable(maxValues) {
    if (!elements.promotionTable) return;

    // Apply column filters first, then sort
    let displayPromotions = applyColumnFilters(state.filteredPromotions);
    displayPromotions = sortPromotions(displayPromotions, state.sortColumn, state.sortDirection);

    // Always show filters in the table
    const showFilters = true;

    if (displayPromotions.length === 0) {
      elements.promotionTable.innerHTML = `
        <div class="table-empty">
          <span class="material-symbols-outlined">filter_list_off</span>
          <p>No promotions match the current filters</p>
        </div>
      `;
      return;
    }

    // Calculate max composite score for performance bars
    const maxScore = Math.max(...displayPromotions.map(p => p.compositeScore || 0));

    const rows = displayPromotions.map((promo, index) => {
      const isActive = state.activePromotion === promo.id;
      const perfPercent = maxScore > 0 ? ((promo.compositeScore || 0) / maxScore * 100) : 0;
      const perfClass = promo.percentile >= 75 ? 'high' : promo.percentile >= 50 ? 'medium' : 'low';

      return `
        <tr class="${isActive ? 'active' : ''}" data-id="${promo.id}">
          <td>
            <div class="table-position">${index + 1}</div>
          </td>
          <td>
            <div class="table-promo">
              <img class="table-thumb" src="${promo.thumbImage}" alt="${escapeHtml(promo.name)}">
              <div class="table-info">
                <div class="table-title">${escapeHtml(promo.name)}</div>
              </div>
            </div>
          </td>
          <td><span class="table-category">${escapeHtml(promo.categoryName)}</span></td>
          <td><span class="table-deal">${escapeHtml(promo.dealType)}</span></td>
          <td class="table-metric">${formatNumber(promo.civ)}</td>
          <td class="table-metric">${formatNumber(promo.cc)}</td>
          <td class="table-metric">${formatNumber(promo.atl)}</td>
          <td>${getPercentileBadgeHTML(promo.percentile)}</td>
          <td class="col-perf table-performance">
            <div class="perf-bar table-bar--wide">
              <div class="perf-bar__track perf-bar__track--${perfClass}">
                <div class="perf-bar__fill perf-bar__fill--${perfClass}" style="width: ${perfPercent}%"></div>
              </div>
              <span class="perf-bar__value">${formatNumber(promo.compositeScore)}</span>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    elements.promotionTable.innerHTML = `
      <table class="data-table data-table--sortable">
        <thead>
          <tr>
            <th>#</th>
            ${getSortableHeaderHTML('Promotion', 'name', true, 'text')}
            ${getSortableHeaderHTML('Category', 'categoryName', showFilters, 'category')}
            ${getSortableHeaderHTML('Deal', 'dealType', showFilters, 'dealType')}
            ${getSortableHeaderHTML('Views', 'civ')}
            ${getSortableHeaderHTML('Clicks', 'cc')}
            ${getSortableHeaderHTML('Added', 'atl')}
            ${getSortableHeaderHTML('%ile', 'percentile')}
            ${getSortableHeaderHTML('Performance', 'compositeScore', false, null)}
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  }

  /**
   * Render detail panel for selected promotion
   */
  function renderDetail(promo) {
    if (!elements.detailContent) return;

    const percentileClass = getPercentileClass(promo.percentile);
    const ctr = ((promo.cc / promo.civ) * 100).toFixed(1);

    // Build comparison section if enabled
    let comparisonSectionHTML = '';
    if (state.comparisonEnabled) {
      const comparison = MockData.getPromotionComparison(promo.id);
      if (comparison && comparison.change) {
        const overallChange = comparison.change.civ;
        const isPositive = overallChange > 0;
        const sectionClass = isPositive ? '' : 'detail-comparison--negative';

        comparisonSectionHTML = `
          <div class="detail-comparison ${sectionClass}">
            <div class="detail-comparison__header">
              <div class="detail-comparison__title">Week-over-Week Performance</div>
              <div class="detail-comparison__period">Week 47 vs. Week 46</div>
            </div>
            <div class="detail-comparison__metrics">
              <div class="detail-comparison__metric">
                <div class="detail-comparison__metric-label">Card in View</div>
                <div class="detail-comparison__metric-value">
                  ${getComparisonArrowHTML(comparison.change.civ)}
                  ${MockData.formatChange(comparison.change.civ)}
                </div>
              </div>
              <div class="detail-comparison__metric">
                <div class="detail-comparison__metric-label">Card Clicked</div>
                <div class="detail-comparison__metric-value">
                  ${getComparisonArrowHTML(comparison.change.cc)}
                  ${MockData.formatChange(comparison.change.cc)}
                </div>
              </div>
              <div class="detail-comparison__metric">
                <div class="detail-comparison__metric-label">Add to List</div>
                <div class="detail-comparison__metric-value">
                  ${getComparisonArrowHTML(comparison.change.atl)}
                  ${MockData.formatChange(comparison.change.atl)}
                </div>
              </div>
              <div class="detail-comparison__metric">
                <div class="detail-comparison__metric-label">Score</div>
                <div class="detail-comparison__metric-value">
                  ${getComparisonArrowHTML(comparison.change.compositeScore)}
                  ${MockData.formatChange(comparison.change.compositeScore)}
                </div>
              </div>
            </div>
          </div>
        `;
      }
    }

    // Get percentile variant class (high/medium/low)
    const getPercentileVariant = (percentile) => {
      if (percentile >= 75) return 'high';
      if (percentile >= 50) return 'medium';
      return 'low';
    };

    elements.detailContent.innerHTML = `
      <div class="detail-hero">
        <img src="${promo.heroImage}" alt="${escapeHtml(promo.name)}">
      </div>
      <div class="detail-body">
        <h2 class="detail-title">${escapeHtml(promo.name)}</h2>

        <div class="detail-tags">
          <span class="detail-tag detail-tag--category">${escapeHtml(promo.categoryName)}</span>
          <span class="detail-tag detail-tag--deal">${escapeHtml(promo.dealType)}</span>
        </div>

        <div class="detail-percentile-row">
          <div class="percentile-bar percentile-bar--${getPercentileVariant(promo.percentile)}">
            <div class="percentile-bar-fill percentile-bar-fill--${getPercentileVariant(promo.percentile)}" style="width: ${promo.percentile}%;"></div>
          </div>
          <span class="percentile-score">${promo.compositeScore}</span>
          <img src="./assets/chart-bar.svg" alt="Percentile" class="percentile-icon">
          <span class="percentile-value percentile-value--${getPercentileVariant(promo.percentile)}">${promo.percentile}%</span>
        </div>

        <div class="detail-kpis">
          <div class="detail-kpi">
            <span class="detail-kpi__value">${formatNumber(promo.civ)}</span>
            <span class="detail-kpi__label">Card in View</span>
          </div>
          <div class="detail-kpi">
            <span class="detail-kpi__value">${formatNumber(promo.cc)}</span>
            <span class="detail-kpi__label">Card Clicked</span>
          </div>
          <div class="detail-kpi">
            <span class="detail-kpi__value">${formatNumber(promo.atl)}</span>
            <span class="detail-kpi__label">Add to List</span>
          </div>
          <div class="detail-kpi">
            <span class="detail-kpi__value">${ctr}%</span>
            <span class="detail-kpi__label">Click-Through Rate</span>
          </div>
        </div>

        ${comparisonSectionHTML}

        <div class="detail-section">
          <div class="detail-section__title">Interaction Rate</div>
          <div class="detail-chart-container" id="interaction-rate-chart" style="width: 100%; height: 200px;"></div>
        </div>

        <div class="detail-section">
          <div class="detail-section__title">7-Day Trend</div>
          <div class="detail-chart-container" id="trend-chart" style="width: 100%; height: 180px;"></div>
        </div>

        <div class="detail-section">
          <div class="detail-section__title">Top Performing Stores</div>
          <div class="top-stores">
            <div class="top-stores__list">
              ${MockData.topStores.slice(0, 5).map((store, index) => `
                <div class="top-stores__item">
                  <span class="top-stores__rank">${index + 1}</span>
                  <span class="top-stores__name">${escapeHtml(store.name)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    // Render the charts after DOM update
    setTimeout(() => {
      renderInteractionRateChart(promo);
      renderTrendChart();
    }, 0);
  }

  /**
   * Chart colors matching the process design
   */
  const chartColors = [
    '#4272D8', // Primary Blue
    '#B8D64D', // Success Green
    '#F39C12', // Warning Amber
    '#E74C3C', // Danger Red
    '#9B59B6', // Accent Purple
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316'  // Orange
  ];

  /**
   * Render Interaction Rate donut chart (ECharts)
   */
  function renderInteractionRateChart(promo) {
    const container = document.getElementById('interaction-rate-chart');
    if (!container || typeof echarts === 'undefined') {
      console.warn('ECharts not available for interaction rate chart');
      return;
    }

    // Dispose existing chart if any
    const existingChart = echarts.getInstanceByDom(container);
    if (existingChart) {
      existingChart.dispose();
    }

    // Initialize ECharts instance
    const chart = echarts.init(container);

    // Get metrics from promotion
    const views = promo.civ || 0;
    const clicks = promo.cc || 0;
    const added = promo.atl || 0;

    // Donut chart data - Views, Clicks, Added
    const donutData = [
      {
        name: 'Views',
        value: views,
        itemStyle: { color: '#E74C3C' } // Coral red
      },
      {
        name: 'Clicks',
        value: clicks,
        itemStyle: { color: '#F39C12' } // Orange
      },
      {
        name: 'Added',
        value: added,
        itemStyle: { color: '#B8D64D' } // Yellow-green
      }
    ]

    // Chart configuration
    const option = {
      tooltip: {
        trigger: 'item',
        backgroundColor: '#ffffff',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: {
          color: '#0f172a',
          fontFamily: 'inherit',
          fontSize: 12
        },
        formatter: function(params) {
          return `${params.name}: ${formatNumber(params.value)}`;
        }
      },
      legend: {
        orient: 'horizontal',
        bottom: 0,
        left: 'center',
        textStyle: {
          color: '#6b7280',
          fontSize: 11,
          fontFamily: 'inherit',
          fontWeight: 400
        },
        itemGap: 16,
        itemWidth: 10,
        itemHeight: 10
      },
      series: [{
        name: 'Interaction Rate',
        type: 'pie',
        radius: ['40%', '70%'],
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
        data: donutData
      }]
    };

    chart.setOption(option);

    // Handle responsive resize
    const resizeObserver = new ResizeObserver(() => {
      chart.resize();
    });
    resizeObserver.observe(container);
  }

  /**
   * Render 7-Day Trend bar chart (ECharts)
   */
  function renderTrendChart() {
    const container = document.getElementById('trend-chart');
    if (!container || !MockData.weeklyTrend) return;

    // Check if ECharts is available
    if (typeof echarts === 'undefined') {
      // Fallback to simple bars if ECharts not available
      const maxValue = Math.max(...MockData.weeklyTrend.map(d => d.value));
      const bars = MockData.weeklyTrend.map(day => {
        const height = (day.value / maxValue) * 100;
        return `<div class="chart-bar"
                     style="height: ${height}%"
                     title="${day.day}: ${day.value}"
                     role="img"
                     aria-label="${day.day}: ${day.value} views"></div>`;
      });
      container.innerHTML = `<div class="mini-chart">${bars.join('')}</div>`;
      return;
    }

    // Dispose existing chart if any
    const existingChart = echarts.getInstanceByDom(container);
    if (existingChart) {
      existingChart.dispose();
    }

    // Initialize ECharts instance
    const chart = echarts.init(container);

    // Prepare data
    const dayLabels = MockData.weeklyTrend.map(d => d.day);
    const dailyData = MockData.weeklyTrend.map(d => d.value);
    const currentDay = dailyData.filter(v => v !== null && v !== undefined).length;

    // Chart configuration matching Digital Circular Performance (Day)
    const option = {
      grid: {
        left: '3%',
        right: '4%',
        bottom: '12%',
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
        axisTick: { show: false },
        axisLabel: {
          color: '#6b7280',
          fontSize: 11,
          fontFamily: 'inherit'
        }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#6b7280',
          fontSize: 11,
          fontFamily: 'inherit'
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
          fontFamily: 'inherit',
          fontSize: 12
        },
        formatter: function(params) {
          if (params[0] && params[0].value !== null) {
            return `${params[0].axisValue}: ${params[0].value.toLocaleString()}`;
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
            color: index < currentDay ? chartColors[0] : '#f3f4f6'
          }
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

    // Handle responsive resize
    const resizeObserver = new ResizeObserver(() => {
      chart.resize();
    });
    resizeObserver.observe(container);
  }

  /**
   * Render empty state for detail panel
   */
  function renderEmptyDetail() {
    if (!elements.detailContent) return;

    elements.detailContent.innerHTML = `
      <div class="detail-empty">
        <div class="detail-empty__icon" aria-hidden="true">👆</div>
        <p class="detail-empty__text">Select a promotion to view details</p>
      </div>
    `;
  }

  /**
   * Update the count badges
   */
  function updateCounts() {
    if (elements.categoryCount) {
      elements.categoryCount.textContent = state.categories.length;
    }
    if (elements.promoCount) {
      elements.promoCount.textContent = state.filteredPromotions.length;
    }
  }

  /**
   * Set loading state
   */
  function setLoading(isLoading) {
    state.isLoading = isLoading;
    DataService.setLoading(isLoading);
  }

  /**
   * Render loading state in all panels
   */
  function renderLoadingState() {
    const loadingHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p class="loading-text">Loading data...</p>
      </div>
    `;

    if (elements.categoryList) {
      elements.categoryList.innerHTML = loadingHTML;
    }
    if (elements.promotionGrid) {
      elements.promotionGrid.innerHTML = loadingHTML;
    }
    if (elements.detailContent) {
      elements.detailContent.innerHTML = loadingHTML;
    }
  }

  /**
   * Render error state
   */
  function renderErrorState(error) {
    const errorHTML = `
      <div class="error-state">
        <div class="error-icon" aria-hidden="true">⚠️</div>
        <h3 class="error-title">Failed to Load Data</h3>
        <p class="error-message">${escapeHtml(error.message || 'An unexpected error occurred')}</p>
        <button class="btn btn--primary retry-btn" onclick="location.reload()">
          <span class="material-symbols-outlined">refresh</span>
          Retry
        </button>
      </div>
    `;

    if (elements.categoryList) {
      elements.categoryList.innerHTML = errorHTML;
    }
    if (elements.promotionGrid) {
      elements.promotionGrid.innerHTML = errorHTML;
    }
    if (elements.detailContent) {
      elements.detailContent.innerHTML = errorHTML;
    }
  }

  /* ============================================
     EVENT HANDLERS
     ============================================ */

  /**
   * Bind all event listeners
   */
  function bindEvents() {
    // Category selection
    if (elements.categoryList) {
      elements.categoryList.addEventListener('click', handleCategoryClick);
      elements.categoryList.addEventListener('keydown', handleCategoryKeydown);
    }

    // Promotion selection
    if (elements.promotionGrid) {
      elements.promotionGrid.addEventListener('click', handlePromotionClick);
      elements.promotionGrid.addEventListener('keydown', handlePromotionKeydown);
    }

    // Promotion table selection
    if (elements.promotionTable) {
      elements.promotionTable.addEventListener('click', handleTableRowClick);
    }

    // Promo view toggle (cards/table)
    document.querySelectorAll('.view-toggle__btn').forEach(btn => {
      btn.addEventListener('click', handlePromoViewToggle);
    });

    // Search input
    if (elements.searchInput) {
      elements.searchInput.addEventListener('input', handleSearch);
    }

    // View segment toggle
    elements.segmentBtns.forEach(btn => {
      btn.addEventListener('click', handleSegmentChange);
    });

    // Comparison toggle
    if (elements.comparisonToggle) {
      elements.comparisonToggle.addEventListener('click', handleComparisonToggle);
    }

    // Add filter button
    if (elements.addFilterBtn) {
      elements.addFilterBtn.addEventListener('click', openFilterModal);
    }

    // Date selector click
    if (elements.dateSelector) {
      elements.dateSelector.addEventListener('click', openDatePicker);
    }

    // Entity selector click
    if (elements.entitySelector) {
      elements.entitySelector.addEventListener('click', openEntitySelector);
    }

    // More Data toggle for category grid
    const moreDataToggle = document.getElementById('more-data-toggle');
    if (moreDataToggle) {
      moreDataToggle.addEventListener('change', function(e) {
        state.moreDataEnabled = e.target.checked;
        renderCategoryGrid();
      });
    }

    // Card View toggle for promotions (checkbox toggle switch)
    const cardViewToggle = document.getElementById('card-view-toggle');
    if (cardViewToggle) {
      cardViewToggle.addEventListener('change', function(e) {
        const view = e.target.checked ? 'cards' : 'table';
        state.promoViewMode = view;

        // Toggle visibility
        if (elements.promotionGrid && elements.promotionTable) {
          elements.promotionGrid.style.display = view === 'cards' ? '' : 'none';
          elements.promotionTable.style.display = view === 'table' ? '' : 'none';
        }
      });
    }

    // Subtab navigation (Categories/Promotions within BASE mode)
    document.querySelectorAll('.subtab').forEach(btn => {
      btn.addEventListener('click', function() {
        const view = this.dataset.view;
        if (view) {
          handleSegmentChange({ target: this });
        }
      });
    });

    // Modal overlay clicks (close on backdrop click)
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', function(e) {
        if (e.target === this) {
          this.classList.remove('active');
        }
      });
    });

    // Detail panel close button
    const closeBtn = document.querySelector('.panel-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeDetailPanel);
    }

    // Keyboard navigation
    document.addEventListener('keydown', handleGlobalKeydown);

    // Mode buttons (Base / Grid / Compare)
    elements.modeBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        handleModeChange(this.dataset.mode);
      });
    });

    // Grid columns dropdown toggle
    if (elements.gridColumnsBtn) {
      elements.gridColumnsBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleColumnsDropdown();
      });
    }

    // Close columns dropdown when clicking outside
    document.addEventListener('click', function(e) {
      if (state.gridMode.columnsDropdownOpen) {
        const dropdown = elements.gridColumnsDropdown;
        const btn = elements.gridColumnsBtn;
        if (dropdown && btn && !dropdown.contains(e.target) && !btn.contains(e.target)) {
          state.gridMode.columnsDropdownOpen = false;
          dropdown.classList.remove('open');
          btn.classList.remove('active');
        }
      }
    });
  }

  /**
   * Close the detail panel
   */
  function closeDetailPanel() {
    state.activePromotion = null;

    if (elements.detailPanel) {
      elements.detailPanel.classList.remove('panel--expanded');
      elements.detailPanel.classList.add('panel--collapsed');
    }

    // Re-render to remove active state
    renderPromotions();
  }

  /**
   * Handle category item click
   */
  function handleCategoryClick(e) {
    const item = e.target.closest('.category-item');
    if (!item) return;

    const categoryId = item.dataset.id;
    selectCategory(categoryId);
  }

  /**
   * Handle category item keyboard navigation
   */
  function handleCategoryKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const item = e.target.closest('.category-item');
      if (item) {
        selectCategory(item.dataset.id);
      }
    }
  }

  /**
   * Select a category and filter promotions
   */
  function selectCategory(categoryId) {
    if (categoryId === 'all') {
      state.activeCategory = null;
      state.selectedCategoryId = null; // Sync with Categories view
      state.filteredPromotions = [...state.allPromotions];
      // Remove any category filter chips when selecting "All"
      state.activeFilters = state.activeFilters.filter(f => f.type !== 'category');
    } else {
      state.activeCategory = categoryId;
      state.selectedCategoryId = categoryId; // Sync with Categories view
      state.filteredPromotions = state.allPromotions.filter(p => p.category === categoryId);

      // Add category as a filter chip (remove existing category filter first)
      state.activeFilters = state.activeFilters.filter(f => f.type !== 'category');
      const categoryData = state.categories.find(c => c.id === categoryId);
      if (categoryData) {
        state.activeFilters.push({
          type: 'category',
          value: categoryId,
          label: 'Category'
        });
      }
    }

    // Apply search filter if active
    if (state.searchQuery) {
      applySearchFilter();
    }

    // Re-render
    renderCategories();
    renderFilterChips();
    renderPromotions();
    updateCounts();

    // Close detail panel when changing categories
    closeDetailPanel();
  }

  /**
   * Handle promotion card click
   */
  function handlePromotionClick(e) {
    const card = e.target.closest('.promo-card');
    if (!card) return;

    const promoId = card.dataset.id;
    selectPromotion(promoId);
  }

  /**
   * Handle promotion card keyboard navigation
   */
  function handlePromotionKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const card = e.target.closest('.promo-card');
      if (card) {
        selectPromotion(card.dataset.id);
      }
    }
  }

  /**
   * Handle table row click
   */
  function handleTableRowClick(e) {
    const row = e.target.closest('tr[data-id]');
    if (!row) return;

    const promoId = row.dataset.id;
    selectPromotion(promoId);
  }

  /**
   * Handle promo view toggle (cards/table)
   */
  function handlePromoViewToggle(e) {
    const btn = e.target.closest('.view-toggle__btn');
    if (!btn) return;

    const view = btn.dataset.promoView;
    if (view === state.promoViewMode) return;

    state.promoViewMode = view;

    // Update button states
    document.querySelectorAll('.view-toggle__btn').forEach(b => {
      b.classList.toggle('active', b.dataset.promoView === view);
    });

    // Toggle visibility
    if (elements.promotionGrid && elements.promotionTable) {
      elements.promotionGrid.style.display = view === 'cards' ? '' : 'none';
      elements.promotionTable.style.display = view === 'table' ? '' : 'none';
    }
  }

  /**
   * Select a promotion and show its details
   */
  async function selectPromotion(promoId) {
    state.activePromotion = promoId;

    // Re-render promotions to show active state
    renderPromotions();

    // Expand the detail panel
    if (elements.detailPanel) {
      elements.detailPanel.classList.remove('panel--collapsed');
      elements.detailPanel.classList.add('panel--expanded');
    }

    try {
      // Show loading in detail panel
      if (elements.detailContent) {
        elements.detailContent.innerHTML = `
          <div class="loading-state">
            <div class="spinner"></div>
            <p class="loading-text">Loading details...</p>
          </div>
        `;
      }

      // Fetch detailed data (may include additional info from API)
      const promo = await DataService.getPromotionDetail(promoId);

      if (!promo) {
        throw new Error('Promotion not found');
      }

      // Render the detail panel
      renderDetail(promo);

      // On mobile/tablet, open the detail panel
      const detailPanel = document.querySelector('.panel--right');
      if (detailPanel && window.innerWidth <= 1100) {
        detailPanel.classList.add('open');
      }
    } catch (error) {
      console.error('Error loading promotion details:', error);
      if (elements.detailContent) {
        elements.detailContent.innerHTML = `
          <div class="error-state">
            <div class="error-icon" aria-hidden="true">⚠️</div>
            <h3 class="error-title">Failed to Load Details</h3>
            <p class="error-message">${escapeHtml(error.message)}</p>
            <button class="btn btn--outline" onclick="location.reload()">Retry</button>
          </div>
        `;
      }
    }
  }

  /**
   * Handle search input with debouncing
   */
  function handleSearch(e) {
    const query = e.target.value;

    // Clear existing timer
    if (state.searchDebounceTimer) {
      clearTimeout(state.searchDebounceTimer);
    }

    // Set new timer
    state.searchDebounceTimer = setTimeout(() => {
      state.searchQuery = query.toLowerCase().trim();
      applySearchFilter();
    }, CONFIG.SEARCH_DEBOUNCE_MS);
  }

  /**
   * Apply search filter to promotions
   */
  function applySearchFilter() {
    // Use the unified applyFilters function
    applyFilters();
  }

  /**
   * Handle view segment change (Categories vs Promotions)
   * Context persists across view changes (category selection, filters, etc.)
   * Only applies in Base mode
   */
  function handleSegmentChange(e) {
    const btn = e.currentTarget || e.target;
    const view = btn.dataset.view;

    if (state.viewMode === view) return;

    state.viewMode = view;

    // Update button states (old segment buttons)
    elements.segmentBtns.forEach(b => {
      b.classList.toggle('active', b.dataset.view === view);
      b.setAttribute('aria-selected', b.dataset.view === view);
    });

    // Update subtab states (new design)
    document.querySelectorAll('.subtab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.view === view);
      tab.setAttribute('aria-selected', tab.dataset.view === view);
    });

    // Update panel breadcrumb text
    const breadcrumb = document.querySelector('.breadcrumb-text');
    if (breadcrumb) {
      breadcrumb.textContent = view === 'categories' ? 'BASE > Categories' : 'BASE > Promotions';
    }

    // Only switch layouts if in Base mode
    if (state.appMode !== 'base') return;

    // Toggle layouts visibility
    if (elements.categoriesLayout && elements.promotionsLayout) {
      if (view === 'categories') {
        elements.categoriesLayout.style.display = 'flex';
        elements.promotionsLayout.style.display = 'none';

        // CONTEXT PERSISTENCE: Sync category selection from Promotions view
        if (state.activeCategory && state.activeCategory !== 'all') {
          state.selectedCategoryId = state.activeCategory;
        }

        // Re-render with current filters applied
        if (state.activeFilters.length > 0) {
          applyFilters();
        } else {
          renderCategoryGrid();
        }

        // Show detail panel if a category is selected
        if (state.selectedCategoryId) {
          renderCategoryDetail(state.selectedCategoryId);
          if (elements.categoryDetailPanel) {
            elements.categoryDetailPanel.classList.remove('panel--collapsed');
            elements.categoryDetailPanel.classList.add('panel--expanded');
          }
        }
      } else {
        elements.categoriesLayout.style.display = 'none';
        elements.promotionsLayout.style.display = 'flex';

        // CONTEXT PERSISTENCE: Sync category selection from Categories view
        if (state.selectedCategoryId) {
          state.activeCategory = state.selectedCategoryId;
          // Re-render categories sidebar with selection and filter promotions
          renderCategories();
          applyFilters();
        }
      }
    }

    // Update search placeholder
    if (elements.searchInput) {
      elements.searchInput.placeholder = view === 'categories'
        ? 'Search categories...'
        : 'Search promotions...';
    }

    console.log(`View mode changed to: ${view}`);
  }

  /**
   * Handle comparison toggle click
   */
  function handleComparisonToggle() {
    state.comparisonEnabled = !state.comparisonEnabled;

    // Update button state
    if (elements.comparisonToggle) {
      elements.comparisonToggle.setAttribute('aria-pressed', state.comparisonEnabled);
    }

    // Toggle body class for CSS visibility
    document.body.classList.toggle('comparison-active', state.comparisonEnabled);

    // Re-render all views with comparison data
    renderCategories();
    renderPromotions();

    // Re-render detail if a promotion is selected
    if (state.activePromotion) {
      const promo = MockData.getPromotionById(state.activePromotion);
      if (promo) {
        renderDetail(promo);
      }
    }

    if (CONFIG.DEBUG) {
      console.log(`Comparison mode: ${state.comparisonEnabled ? 'ON' : 'OFF'}`);
    }
  }

  /**
   * Handle global keyboard shortcuts
   */
  function handleGlobalKeydown(e) {
    // Escape closes modals and detail panel
    if (e.key === 'Escape') {
      // Close any open modals
      document.querySelectorAll('.modal-overlay.active').forEach(overlay => {
        overlay.classList.remove('active');
      });

      // Close detail panel on mobile
      const detailPanel = document.querySelector('.panel--right');
      if (detailPanel) {
        detailPanel.classList.remove('open');
      }
    }

    // Focus search with Ctrl/Cmd + K
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if (elements.searchInput) {
        elements.searchInput.focus();
      }
    }
  }

  /* ============================================
     CONTEXT & MODAL FUNCTIONS
     ============================================ */

  /**
   * Initialize the current context from MockData
   */
  function initializeContext() {
    if (!MockData || !MockData.context) return;

    state.currentWeek = MockData.context.week;
    state.selectedWeekId = MockData.context.weekId;
    state.currentEntity = MockData.context.entity;
    state.selectedEntityId = MockData.context.entity.id;

    // Update the header display
    updateDateDisplay();
    updateEntityDisplay();
  }

  /**
   * Update the date display in the header
   */
  function updateDateDisplay() {
    const week = MockData.weeks.find(w => w.id === state.selectedWeekId);
    if (!week) return;

    const dateCard = elements.dateSelector;
    if (!dateCard) return;

    const valueEl = dateCard.querySelector('.card-value');
    const subEl = dateCard.querySelector('.card-sub');

    if (valueEl) valueEl.textContent = week.label;
    if (subEl) subEl.textContent = week.dateRange;
  }

  /**
   * Update the entity display in the header
   * Patterns:
   * - Brand/All: "BRAND" breadcrumb, table_rows icon, entity name, "X locations"
   * - Sub-brand: Parent brand name breadcrumb, storefront icon, entity name, "X locations"
   * - Store: "BRAND > SUBBRAND" breadcrumb, storefront icon, store name, "1 Location"
   */
  function updateEntityDisplay() {
    const entityCard = elements.entitySelector;
    if (!entityCard) return;

    const entity = state.currentEntity || MockData.context.entity;
    const valueEl = entityCard.querySelector('.card-value');
    const subEl = entityCard.querySelector('.card-sub');
    const breadcrumbEl = entityCard.querySelector('.card-breadcrumb');
    const iconEl = entityCard.querySelector('.card-icon .material-symbols-outlined');

    if (valueEl) valueEl.textContent = entity.name;

    const locationCount = entity.count || MockData.entities.stores.length;
    if (subEl) subEl.textContent = `${locationCount} ${locationCount === 1 ? 'Location' : 'locations'}`;

    // Update icon and breadcrumb based on entity level
    if (entity.level === 'all' || entity.level === 'brand') {
      // Brand level: "BRAND" label with grid icon
      if (iconEl) iconEl.textContent = 'table_rows';
      if (breadcrumbEl) breadcrumbEl.textContent = 'BRAND';
    } else if (entity.level === 'sub-brand') {
      // Sub-brand level: Parent brand name as breadcrumb
      if (iconEl) iconEl.textContent = 'storefront';
      // Find the parent brand for this sub-brand
      const subBrand = MockData.entities.subBrands.find(sb => sb.id === entity.id);
      const parentBrand = subBrand ? MockData.entities.brands.find(b => b.id === subBrand.brandId) : null;
      const parentBrandName = parentBrand ? parentBrand.name : 'Brand';
      if (breadcrumbEl) breadcrumbEl.textContent = parentBrandName;
    } else if (entity.level === 'store') {
      // Store level: "BRAND > SUBBRAND" breadcrumb
      if (iconEl) iconEl.textContent = 'storefront';
      // Find the sub-brand and brand for this store
      const store = MockData.entities.stores.find(s => s.id === entity.id);
      const subBrand = store ? MockData.entities.subBrands.find(sb => sb.id === store.subBrand) : null;
      const parentBrand = subBrand ? MockData.entities.brands.find(b => b.id === subBrand.brandId) : null;
      const brandName = parentBrand ? parentBrand.name.toUpperCase() : 'BRAND';
      const subBrandName = subBrand ? subBrand.name.toUpperCase() : 'SUB-BRAND';
      if (breadcrumbEl) breadcrumbEl.textContent = `${brandName} > ${subBrandName}`;
    } else if (entity.level === 'brand-group' || entity.level === 'sub-brand-group') {
      if (iconEl) iconEl.textContent = 'workspaces';
      if (breadcrumbEl) breadcrumbEl.textContent = 'GROUP';
    } else {
      // Default fallback
      if (iconEl) iconEl.textContent = 'table_rows';
      if (breadcrumbEl) breadcrumbEl.textContent = 'BRAND';
    }
  }

  /**
   * Get weeks list from MockData
   * Most recent on top (higher week number first)
   */
  function getExtendedWeeks() {
    // Use only weeks that have data in MockData
    const weeks = MockData.weeks.map(week => ({
      id: week.id,
      label: week.label,
      dateRange: week.dateRange
    }));

    // Sort by week number descending (most recent first)
    return weeks.sort((a, b) => {
      const numA = parseInt(a.id.replace('week-', ''));
      const numB = parseInt(b.id.replace('week-', ''));
      return numB - numA;
    });
  }

  /**
   * Render the week list in the date picker modal
   */
  function renderWeekList(searchQuery = '') {
    if (!elements.weekList) return;

    const weeks = getExtendedWeeks();
    const query = searchQuery.toLowerCase().trim();

    // Filter weeks based on search
    const filteredWeeks = query
      ? weeks.filter(week =>
          week.label.toLowerCase().includes(query) ||
          week.dateRange.toLowerCase().includes(query)
        )
      : weeks;

    const weeksHTML = filteredWeeks.map(week => {
      const isSelected = week.id === state.selectedWeekId;
      return `
        <div class="week-option ${isSelected ? 'selected' : ''}"
             data-week-id="${week.id}"
             onclick="selectWeek('${week.id}')">
          <div class="week-option-left">
            <div class="week-option-label">${week.label}</div>
            <div class="week-option-dates">${week.dateRange}</div>
          </div>
          <div class="week-option-check">
            <span class="material-symbols-outlined">check</span>
          </div>
        </div>
      `;
    }).join('');

    elements.weekList.innerHTML = weeksHTML || '<div class="week-option" style="text-align:center;color:var(--color-text-tertiary);">No weeks found</div>';
  }

  /**
   * Render the entity tree table in the entity selector modal
   * Supports multiple brands with Brand → SubBrand → Store hierarchy
   * @param {string} searchQuery - Optional search query to filter entities
   */
  function renderEntityTree(searchQuery = '') {
    const tbody = elements.entityTreeBody;
    if (!tbody || !MockData.entities) return;

    const query = searchQuery.toLowerCase().trim();
    let html = '';

    // Helper to check if entity matches search
    const matchesSearch = (text) => !query || (text && text.toLowerCase().includes(query));

    // Track expanded state (initialize if not exists)
    if (!state.expandedNodes) {
      state.expandedNodes = { 'all': true }; // All Brands expanded by default
    }

    // "All Brands" row at top
    const allBrands = MockData.entities.brand;
    const isAllExpanded = state.expandedNodes['all'] !== false;
    const isAllSelected = state.selectedEntityId === 'all';
    const totalStoreCount = MockData.entities.stores.length;

    if (matchesSearch('All') || !query) {
      html += `
        <tr class="tree-row--brand ${isAllSelected ? 'selected' : ''}"
            data-entity-id="all"
            data-level="all"
            data-parent=""
            onclick="selectTreeEntity('all', 'all', 'All Stores', ${totalStoreCount})">
          <td class="tree-indent-0">
            <div class="tree-name-cell">
              <button class="tree-toggle ${isAllExpanded ? '' : 'collapsed'}" onclick="toggleTreeRow('all', event)">
                <span class="material-symbols-outlined">expand_more</span>
              </button>
              <span>All Stores</span>
            </div>
          </td>
          <td><span class="type-badge type-badge--brand">All</span></td>
          <td></td>
          <td>all</td>
          <td>${totalStoreCount}</td>
        </tr>
      `;
    }

    // Render each brand and its sub-brands/stores
    MockData.entities.brands.forEach(brand => {
      const isBrandExpanded = state.expandedNodes[brand.id] !== false;
      const isBrandSelected = state.selectedEntityId === brand.id;
      const brandHidden = !isAllExpanded ? 'tree-row-hidden' : '';

      if (matchesSearch(brand.name) || !query) {
        html += `
          <tr class="tree-row--brand ${isBrandSelected ? 'selected' : ''} ${brandHidden}"
              data-entity-id="${brand.id}"
              data-level="brand"
              data-parent="all"
              onclick="selectTreeEntity('${brand.id}', 'brand', '${escapeHtml(brand.name)}', ${brand.storeCount})">
            <td class="tree-indent-1">
              <div class="tree-name-cell">
                <button class="tree-toggle ${isBrandExpanded ? '' : 'collapsed'}" onclick="toggleTreeRow('${brand.id}', event)">
                  <span class="material-symbols-outlined">expand_more</span>
                </button>
                <span>${escapeHtml(brand.name)}</span>
              </div>
            </td>
            <td><span class="type-badge type-badge--brand">Brand</span></td>
            <td></td>
            <td>${brand.id}</td>
            <td>${brand.storeCount}</td>
          </tr>
        `;
      }

      // Sub-brands for this brand
      const brandSubBrands = MockData.entities.subBrands.filter(sb => sb.brandId === brand.id);
      brandSubBrands.forEach(subBrand => {
        const stores = MockData.entities.stores.filter(s => s.subBrand === subBrand.id);
        const subBrandMatches = matchesSearch(subBrand.name);
        const matchingStores = query ? stores.filter(s =>
          matchesSearch(s.name) || matchesSearch(s.title)
        ) : stores;
        const hasMatchingChildren = matchingStores.length > 0;

        if (subBrandMatches || hasMatchingChildren || !query) {
          const isSubExpanded = state.expandedNodes[subBrand.id] !== false;
          const isSubSelected = state.selectedEntityId === subBrand.id;
          const subHidden = (!isAllExpanded || !isBrandExpanded) ? 'tree-row-hidden' : '';

          html += `
            <tr class="tree-row--subbrand ${isSubSelected ? 'selected' : ''} ${subHidden}"
                data-entity-id="${subBrand.id}"
                data-level="subbrand"
                data-parent="${brand.id}"
                onclick="selectTreeEntity('${subBrand.id}', 'sub-brand', '${escapeHtml(subBrand.name)}', ${subBrand.storeCount})">
              <td class="tree-indent-2">
                <div class="tree-name-cell">
                  <button class="tree-toggle ${isSubExpanded ? '' : 'collapsed'}" onclick="toggleTreeRow('${subBrand.id}', event)">
                    <span class="material-symbols-outlined">expand_more</span>
                  </button>
                  <span>${escapeHtml(subBrand.name)}</span>
                </div>
              </td>
              <td><span class="type-badge type-badge--subbrand">SubBrand</span></td>
              <td></td>
              <td>${subBrand.id}</td>
              <td>${subBrand.storeCount}</td>
            </tr>
          `;

          // Store rows
          const storesToShow = query && !subBrandMatches ? matchingStores : stores;
          storesToShow.forEach(store => {
            const isStoreSelected = state.selectedEntityId === store.id;
            const storeHidden = (!isAllExpanded || !isBrandExpanded || !isSubExpanded) ? 'tree-row-hidden' : '';

            html += `
              <tr class="tree-row--store ${isStoreSelected ? 'selected' : ''} ${storeHidden}"
                  data-entity-id="${store.id}"
                  data-level="store"
                  data-parent="${subBrand.id}"
                  onclick="selectTreeEntity('${store.id}', 'store', '${escapeHtml(store.title)}', 1)">
                <td class="tree-indent-3">
                  <div class="tree-name-cell">
                    <span class="tree-toggle-placeholder"></span>
                    <span>${escapeHtml(store.name)}</span>
                  </div>
                </td>
                <td><span class="type-badge type-badge--store">Store</span></td>
                <td class="tree-address-cell" title="${escapeHtml(store.address || '')}">${escapeHtml(store.address || '')}</td>
                <td>${subBrand.id}</td>
                <td>${store.storeNumber}</td>
              </tr>
            `;
          });
        }
      });
    });

    // Show empty state if no results
    if (!html) {
      html = `
        <tr>
          <td colspan="5" style="text-align: center; padding: var(--space-8); color: var(--color-text-tertiary);">
            <div style="font-size: 32px; margin-bottom: var(--space-2);">🔍</div>
            <div>No entities match "${escapeHtml(query)}"</div>
          </td>
        </tr>
      `;
    }

    tbody.innerHTML = html;
  }

  /**
   * Toggle tree row expand/collapse
   */
  function toggleTreeRow(entityId, event) {
    event.stopPropagation();

    // Toggle expanded state
    if (!state.expandedNodes) state.expandedNodes = {};
    state.expandedNodes[entityId] = !state.expandedNodes[entityId];

    // Re-render the tree to update visibility
    const searchInput = document.getElementById('entity-search-input');
    renderEntityTree(searchInput ? searchInput.value : '');
  }

  /**
   * Select entity from tree table
   */
  function selectTreeEntity(entityId, level, name, count) {
    state.selectedEntityId = entityId;
    state.currentEntity = { id: entityId, level: level, name: name, count: count };

    // Update UI selection
    document.querySelectorAll('#entity-tree-body tr').forEach(row => {
      row.classList.toggle('selected', row.dataset.entityId === entityId);
    });

    // Clear group selection
    document.querySelectorAll('.group-item').forEach(el => {
      el.classList.remove('selected');
    });
  }

  /**
   * Render filter options in the add filter modal
   */
  function renderFilterOptions() {
    // Category options
    const categoryOptions = document.getElementById('category-filter-options');
    if (categoryOptions && state.categories) {
      const html = state.categories.map(cat =>
        `<button class="filter-option" data-value="${cat.id}" onclick="selectFilterOption(this)">${escapeHtml(cat.name)}</button>`
      ).join('');
      categoryOptions.innerHTML = html;
    }

    // Deal type options
    const dealOptions = document.getElementById('deal-filter-options');
    if (dealOptions) {
      const uniqueDeals = [...new Set(state.allPromotions.map(p => p.dealType))];
      const html = uniqueDeals.map(deal =>
        `<button class="filter-option" data-value="${deal}" onclick="selectFilterOption(this)">${escapeHtml(deal)}</button>`
      ).join('');
      dealOptions.innerHTML = html;
    }

    // Card size options
    const sizeOptions = document.getElementById('size-filter-options');
    if (sizeOptions) {
      const uniqueSizes = [...new Set(state.allPromotions.map(p => p.cardSize))];
      const html = uniqueSizes.map(size =>
        `<button class="filter-option" data-value="${size}" onclick="selectFilterOption(this)">${escapeHtml(size)}</button>`
      ).join('');
      sizeOptions.innerHTML = html;
    }
  }

  // =====================================================
  // DATE PICKER MODAL FUNCTIONS
  // =====================================================

  function openDatePicker() {
    if (elements.datePickerModal) {
      elements.datePickerModal.classList.add('active');
      // Reset to "By Week" tab and clear search
      switchDateTab('week');
      const searchInput = document.getElementById('week-search-input');
      if (searchInput) searchInput.value = '';
      renderWeekList(); // Refresh the list
    }
  }

  function closeDatePicker() {
    if (elements.datePickerModal) {
      elements.datePickerModal.classList.remove('active');
    }
  }

  /**
   * Switch between "By Week" and "Custom Range" tabs
   */
  function switchDateTab(tabName) {
    // Update tab button states
    document.querySelectorAll('.date-picker-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Update tab content visibility
    document.querySelectorAll('.date-tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `${tabName}-tab-content`);
    });
  }

  /**
   * Filter weeks based on search input
   */
  function filterWeeks(searchValue) {
    renderWeekList(searchValue);
  }

  function selectWeek(weekId) {
    state.selectedWeekId = weekId;

    // Update UI selection
    document.querySelectorAll('.week-option').forEach(el => {
      el.classList.toggle('selected', el.dataset.weekId === weekId);
    });
  }

  function applyDateSelection() {
    // Check which tab is active
    const customTab = document.querySelector('.date-picker-tab[data-tab="custom"]');
    const isCustomRange = customTab && customTab.classList.contains('active');

    if (isCustomRange) {
      // Handle custom date range
      const startDate = document.getElementById('custom-start-date')?.value;
      const endDate = document.getElementById('custom-end-date')?.value;

      if (startDate && endDate) {
        // Format dates for display
        const start = new Date(startDate);
        const end = new Date(endDate);
        const options = { month: 'short', day: 'numeric' };
        const formattedRange = `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}, ${end.getFullYear()}`;

        // Update header display manually for custom range
        const dateCard = elements.dateSelector;
        if (dateCard) {
          const valueEl = dateCard.querySelector('.card-value');
          const subEl = dateCard.querySelector('.card-sub');
          if (valueEl) valueEl.textContent = 'Custom Range';
          if (subEl) subEl.textContent = formattedRange;
        }

        state.selectedWeekId = 'custom';
      }
    } else {
      // Handle week selection
      updateDateDisplay();
    }

    closeDatePicker();

    // Refresh data based on new date selection
    refreshDataForDateChange();

    if (CONFIG.DEBUG) {
      console.log('Date changed to:', state.selectedWeekId);
    }
  }

  /**
   * Refresh data when date selection changes
   * Updates MockData context and re-renders all views
   */
  async function refreshDataForDateChange() {
    // Parse week number from week ID (e.g., 'week-47' -> 47)
    if (state.selectedWeekId && state.selectedWeekId.startsWith('week-')) {
      const weekNum = parseInt(state.selectedWeekId.replace('week-', ''), 10);
      if (!isNaN(weekNum)) {
        MockData.setWeek(weekNum);
      }
    }

    // Reload data from MockData (now filtered by new week)
    state.categories = MockData.categories || [];
    state.filteredCategories = [...state.categories];
    state.allPromotions = MockData.promotions || [];
    state.filteredPromotions = [...state.allPromotions];

    // Re-apply active filters to maintain filter state
    if (state.activeFilters.length > 0) {
      applyFilters();
    } else {
      // Re-render all views
      renderCategoryGrid();  // View By: Categories
      renderCategories();    // View By: Promotions sidebar
      renderPromotions();
      updateCounts();

      // Re-render Grid Mode if active
      if (state.appMode === 'grid') {
        state.gridMode.currentPage = 1; // Reset to first page
        renderGridTable();
      }
    }

    if (CONFIG.DEBUG) {
      console.log('Data refreshed for date change:', state.selectedWeekId, 'Records:', state.allPromotions.length);
    }
  }

  // =====================================================
  // ENTITY SELECTOR MODAL FUNCTIONS
  // =====================================================

  function openEntitySelector() {
    if (elements.entitySelectorModal) {
      elements.entitySelectorModal.classList.add('active');
      // Reset to Nodes tab and clear search
      switchEntityTab('nodes');
      const entitySearch = document.getElementById('entity-search-input');
      const groupSearch = document.getElementById('group-search-input');
      if (entitySearch) entitySearch.value = '';
      if (groupSearch) groupSearch.value = '';
      renderEntityTree(); // Refresh the tree
      renderGroupList(); // Refresh groups
    }
  }

  function closeEntitySelector() {
    if (elements.entitySelectorModal) {
      elements.entitySelectorModal.classList.remove('active');
    }
  }

  /**
   * Switch between "Nodes" and "Groups" tabs in entity selector
   */
  function switchEntityTab(tabName) {
    // Update tab button states
    document.querySelectorAll('.entity-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Update tab content visibility
    document.querySelectorAll('.entity-tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `${tabName}-tab-content`);
    });
  }

  /**
   * Filter entities based on search input
   */
  function filterEntities(searchValue) {
    renderEntityTree(searchValue);
  }

  /**
   * Filter groups based on search input
   */
  function filterGroups(searchValue) {
    renderGroupList(searchValue);
  }

  /**
   * Render the groups list in the Groups tab
   */
  function renderGroupList(searchQuery = '') {
    const groupList = document.getElementById('group-list');
    if (!groupList || !MockData.entities.groups) return;

    const groups = MockData.entities.groups;
    const query = searchQuery.toLowerCase().trim();

    // Filter groups based on search
    const filteredGroups = query
      ? groups.filter(group =>
          group.name.toLowerCase().includes(query) ||
          group.description.toLowerCase().includes(query)
        )
      : groups;

    if (filteredGroups.length === 0) {
      groupList.innerHTML = `
        <div class="group-empty">
          <div class="group-empty-icon">📁</div>
          <p class="group-empty-text">${query ? 'No groups match your search' : 'No custom groups created yet'}</p>
        </div>
      `;
      return;
    }

    const groupsHTML = filteredGroups.map(group => {
      const isSelected = state.selectedEntityId === group.id;
      const iconClass = group.type === 'brand-group' ? 'group-icon--subbrand-group' : 'group-icon--store-group';
      const icon = group.type === 'brand-group' ? 'workspaces' : 'folder_special';

      return `
        <div class="group-item ${isSelected ? 'selected' : ''}"
             data-group-id="${group.id}"
             onclick="selectGroup('${group.id}')">
          <div class="group-icon ${iconClass}">
            <span class="material-symbols-outlined">${icon}</span>
          </div>
          <div class="group-info">
            <div class="group-name">${escapeHtml(group.name)}</div>
            <div class="group-meta">${group.storeCount} stores · ${escapeHtml(group.description)}</div>
          </div>
          <div class="group-check">
            <span class="material-symbols-outlined">check</span>
          </div>
        </div>
      `;
    }).join('');

    groupList.innerHTML = groupsHTML;
  }

  /**
   * Select a group from the Groups tab
   */
  function selectGroup(groupId) {
    const group = MockData.entities.groups.find(g => g.id === groupId);
    if (!group) return;

    state.selectedEntityId = groupId;
    state.currentEntity = {
      id: groupId,
      level: group.type,
      name: group.name,
      count: group.storeCount,
      storeIds: group.storeIds
    };

    // Update UI selection for groups
    document.querySelectorAll('.group-item').forEach(el => {
      el.classList.toggle('selected', el.dataset.groupId === groupId);
    });

    // Clear entity tree selection
    document.querySelectorAll('#entity-tree-body tr').forEach(row => {
      row.classList.remove('selected');
    });
  }

  /**
   * Placeholder for creating new groups
   */
  function openCreateGroupModal() {
    // TODO: Implement group creation modal
    alert('Create Group functionality coming soon!\n\nThis will allow you to create custom groups of stores for analysis.');
  }

  function selectEntity(entityId, level, name, count) {
    state.selectedEntityId = entityId;
    state.currentEntity = { id: entityId, level: level, name: name, count: count };

    // Update UI selection for entities in tree table
    document.querySelectorAll('#entity-tree-body tr').forEach(row => {
      row.classList.toggle('selected', row.dataset.entityId === entityId);
    });

    // Clear group selection
    document.querySelectorAll('.group-item').forEach(el => {
      el.classList.remove('selected');
    });
  }

  function applyEntitySelection() {
    updateEntityDisplay();
    closeEntitySelector();

    // Refresh data based on new entity selection
    refreshDataForEntityChange();

    if (CONFIG.DEBUG) {
      console.log('Entity changed to:', state.currentEntity);
    }
  }

  /**
   * Refresh data when entity selection changes
   * Updates MockData context and re-renders all views
   */
  async function refreshDataForEntityChange() {
    // Update MockData context with selected entity
    if (state.currentEntity) {
      MockData.setEntity(
        state.currentEntity.id,
        state.currentEntity.level,
        state.currentEntity.name
      );
    }

    // Reload data from MockData (now filtered by new entity)
    state.categories = MockData.categories || [];
    state.filteredCategories = [...state.categories];
    state.allPromotions = MockData.promotions || [];
    state.filteredPromotions = [...state.allPromotions];

    // Re-apply active filters to maintain filter state
    if (state.activeFilters.length > 0) {
      applyFilters();
    } else {
      // Re-render all views
      renderCategoryGrid();  // View By: Categories
      renderCategories();    // View By: Promotions sidebar
      renderPromotions();
      updateCounts();

      // Re-render Grid Mode if active
      if (state.appMode === 'grid') {
        state.gridMode.currentPage = 1; // Reset to first page
        renderGridTable();
      }
    }

    if (CONFIG.DEBUG) {
      console.log('Data refreshed for entity change:', state.currentEntity, 'Records:', state.allPromotions.length);
    }
  }

  // =====================================================
  // FILTER MODAL FUNCTIONS
  // =====================================================

  function openFilterModal() {
    if (elements.addFilterModal) {
      elements.addFilterModal.classList.add('active');
      // Reset state
      state.selectedFilterType = 'category';
      state.selectedFilterValue = null;

      // Reset UI
      document.querySelectorAll('.filter-type-btn').forEach(b => b.classList.remove('active'));
      document.querySelector('[data-type="category"]')?.classList.add('active');
      document.querySelectorAll('.filter-value-select').forEach(s => s.classList.remove('active'));
      document.getElementById('category-options')?.classList.add('active');
      document.querySelectorAll('.filter-option').forEach(o => o.classList.remove('selected'));
    }
  }

  function closeFilterModal() {
    if (elements.addFilterModal) {
      elements.addFilterModal.classList.remove('active');
    }
  }

  function selectFilterType(element) {
    state.selectedFilterType = element.dataset.type;
    state.selectedFilterValue = null;

    // Update button states
    document.querySelectorAll('.filter-type-btn').forEach(b => b.classList.remove('active'));
    element.classList.add('active');

    // Show corresponding options
    document.querySelectorAll('.filter-value-select').forEach(s => s.classList.remove('active'));
    document.getElementById(`${state.selectedFilterType}-options`)?.classList.add('active');

    // Clear selected options
    document.querySelectorAll('.filter-option').forEach(o => o.classList.remove('selected'));
  }

  function selectFilterOption(element) {
    const parent = element.closest('.filter-options');
    parent.querySelectorAll('.filter-option').forEach(o => o.classList.remove('selected'));
    element.classList.add('selected');
    state.selectedFilterValue = element.dataset.value;
  }

  function applyFilter() {
    if (!state.selectedFilterValue) {
      alert('Please select a filter value');
      return;
    }

    const typeLabels = {
      'category': 'Category',
      'deal': 'Deal',
      'size': 'Size'
    };

    // Add the filter
    const newFilter = {
      type: state.selectedFilterType,
      value: state.selectedFilterValue,
      label: typeLabels[state.selectedFilterType]
    };

    // Check if filter already exists
    const exists = state.activeFilters.some(f =>
      f.type === newFilter.type && f.value === newFilter.value
    );

    if (!exists) {
      state.activeFilters.push(newFilter);
      renderFilterChips();
      applyFilters();
    }

    closeFilterModal();
  }

  /**
   * Render filter chips in the header
   */
  function renderFilterChips() {
    if (!elements.filterChips) return;

    const chipsHTML = state.activeFilters.map((filter, index) => {
      const colorClass = filter.type === 'category' ? 'filter-chip--category'
                       : filter.type === 'deal' ? 'filter-chip--deal'
                       : filter.type === 'promotion' ? 'filter-chip--promotion'
                       : 'filter-chip--size';

      // Get display name for category
      let displayValue = filter.value;
      if (filter.type === 'category' && !filter.fromColumn) {
        const cat = state.categories.find(c => c.id === filter.value);
        if (cat) displayValue = cat.name;
      }

      return `
        <span class="filter-chip ${colorClass}">
          ${filter.label}: ${escapeHtml(displayValue)}
          <button onclick="removeFilter(${index})">
            <span class="material-symbols-outlined" style="font-size: 14px;">close</span>
          </button>
        </span>
      `;
    }).join('');

    // Add the "Add Filter" button
    const addButtonHTML = `
      <button class="add-filter" id="add-filter-btn" aria-label="Add filter">
        <span class="material-symbols-outlined">add</span>
        Add Filter
      </button>
    `;

    elements.filterChips.innerHTML = chipsHTML + addButtonHTML;

    // Re-attach event listener
    const newAddBtn = document.getElementById('add-filter-btn');
    if (newAddBtn) {
      newAddBtn.addEventListener('click', openFilterModal);
    }
  }

  /**
   * Remove a filter by index
   */
  function removeFilter(index) {
    const filter = state.activeFilters[index];

    // Clear column filter state for ANY filter of this type (not just fromColumn)
    // This ensures the TH dropdown/input also resets
    if (filter) {
      if (filter.type === 'promotion') {
        state.columnFilters.name = null;
      } else if (filter.type === 'category') {
        state.columnFilters.category = null;
        // Also clear category-related state
        state.activeCategory = null;
        state.selectedCategoryId = null;
        renderCategories();
      } else if (filter.type === 'deal') {
        state.columnFilters.dealType = null;
      }
    }

    state.activeFilters.splice(index, 1);
    renderFilterChips();
    applyFilters();
    renderPromotions();
  }

  /**
   * Apply all active filters to promotions and categories
   */
  function applyFilters() {
    // Start with category filter if active
    let filtered = state.activeCategory
      ? state.allPromotions.filter(p => p.category === state.activeCategory)
      : [...state.allPromotions];

    // Apply each active filter to promotions
    state.activeFilters.forEach(filter => {
      switch (filter.type) {
        case 'category':
          filtered = filtered.filter(p => p.category === filter.value);
          break;
        case 'deal':
          filtered = filtered.filter(p => p.dealType === filter.value);
          break;
        case 'size':
          filtered = filtered.filter(p => p.cardSize === filter.value);
          break;
      }
    });

    // Apply search filter if active
    if (state.searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(state.searchQuery) ||
        p.categoryName.toLowerCase().includes(state.searchQuery) ||
        p.dealType.toLowerCase().includes(state.searchQuery)
      );
    }

    state.filteredPromotions = filtered;

    // Filter categories based on which ones have promotions after filtering
    if (state.activeFilters.length > 0) {
      // Get unique category IDs from filtered promotions
      const activeCategoryIds = new Set(filtered.map(p => p.category));
      state.filteredCategories = state.categories.filter(cat => activeCategoryIds.has(cat.id));
    } else {
      // No filters active - show all categories
      state.filteredCategories = [...state.categories];
    }

    // Re-render views
    renderCategoryGrid();
    renderPromotions();
    updateCounts();

    // Re-render Grid if in Grid mode
    if (state.appMode === 'grid') {
      state.gridMode.currentPage = 1; // Reset to first page on filter change
      renderGridTable();
    }

    if (CONFIG.DEBUG) {
      console.log(`Filters applied: ${state.activeFilters.length} filters, ${filtered.length} promotions, ${state.filteredCategories.length} categories`);
    }
  }

  /* ============================================
     GRID MODE FUNCTIONS
     ============================================ */

  /**
   * Initialize Grid Mode visible columns from configuration
   */
  function initGridColumns() {
    state.gridMode.visibleColumns = GRID_COLUMNS
      .filter(col => col.visible)
      .map(col => col.key);
  }

  /**
   * Get visible columns for Grid Mode
   */
  function getVisibleGridColumns() {
    return GRID_COLUMNS.filter(col =>
      state.gridMode.visibleColumns.includes(col.key)
    );
  }

  /**
   * Get Grid Mode filtered and sorted data
   */
  function getGridData() {
    let data = [...state.filteredPromotions];

    // Apply column filters
    const filters = state.gridMode.columnFilters;
    Object.keys(filters).forEach(key => {
      const filterValue = filters[key];
      if (filterValue === null || filterValue === '' || filterValue === undefined) return;

      const col = GRID_COLUMNS.find(c => c.key === key);
      if (!col) return;

      data = data.filter(item => {
        const value = item[key];
        if (value == null) return false;

        // Type-specific filtering
        if (col.type === 'text') {
          return String(value).toLowerCase().includes(filterValue.toLowerCase());
        } else if (col.type === 'category' || col.type === 'deal') {
          return value === filterValue;
        } else if (col.type === 'number' || col.type === 'currency') {
          // For numeric, filter value can be ">=50" or "<=100" or just a number
          const numValue = parseFloat(value) || 0;
          if (filterValue.startsWith('>=')) {
            return numValue >= parseFloat(filterValue.slice(2));
          } else if (filterValue.startsWith('<=')) {
            return numValue <= parseFloat(filterValue.slice(2));
          } else {
            return numValue >= parseFloat(filterValue);
          }
        }
        return true;
      });
    });

    // Apply sorting
    if (state.gridMode.sortColumn) {
      const col = GRID_COLUMNS.find(c => c.key === state.gridMode.sortColumn);
      if (col) {
        data.sort((a, b) => {
          let aVal = a[col.key];
          let bVal = b[col.key];

          // Handle nulls
          if (aVal == null) return 1;
          if (bVal == null) return -1;

          // Type-specific comparison
          if (col.type === 'number' || col.type === 'currency') {
            aVal = parseFloat(aVal) || 0;
            bVal = parseFloat(bVal) || 0;
          } else if (col.type === 'date') {
            aVal = new Date(aVal).getTime();
            bVal = new Date(bVal).getTime();
          } else {
            aVal = String(aVal).toLowerCase();
            bVal = String(bVal).toLowerCase();
          }

          if (aVal < bVal) return state.gridMode.sortDirection === 'asc' ? -1 : 1;
          if (aVal > bVal) return state.gridMode.sortDirection === 'asc' ? 1 : -1;
          return 0;
        });
      }
    }

    return data;
  }

  /**
   * Get paginated Grid data
   */
  function getGridPageData() {
    const data = getGridData();
    const start = (state.gridMode.currentPage - 1) * state.gridMode.rowsPerPage;
    const end = start + state.gridMode.rowsPerPage;
    return {
      data: data.slice(start, end),
      total: data.length,
      start: start + 1,
      end: Math.min(end, data.length),
      totalPages: Math.ceil(data.length / state.gridMode.rowsPerPage)
    };
  }

  /**
   * Render the Grid Mode table
   */
  function renderGridTable() {
    if (!elements.gridTableHead || !elements.gridTableBody) return;

    const columns = getVisibleGridColumns();
    const { data, total, start, end, totalPages } = getGridPageData();

    // Render header row using same structure as Base Mode
    const headerRowHtml = `<tr>${columns.map(col => renderGridHeaderCell(col)).join('')}</tr>`;

    elements.gridTableHead.innerHTML = headerRowHtml;

    // Calculate max composite score for performance bars
    const maxScore = Math.max(...data.map(p => p.compositeScore || 0), 1);

    // Render body
    if (data.length === 0) {
      elements.gridTableBody.innerHTML = `
        <tr>
          <td colspan="${columns.length}">
            <div class="grid-empty">
              <span class="material-symbols-outlined grid-empty__icon">search_off</span>
              <div class="grid-empty__title">No records found</div>
              <div class="grid-empty__message">Try adjusting your filters or search criteria</div>
            </div>
          </td>
        </tr>
      `;
    } else {
      elements.gridTableBody.innerHTML = data.map(promo => `
        <tr data-promo-id="${promo.id}">
          ${columns.map(col => renderGridCell(promo, col, maxScore)).join('')}
        </tr>
      `).join('');
    }

    // Update counts and pagination
    updateGridPagination(total, start, end, totalPages);
  }

  /**
   * Render a single Grid cell
   */
  function renderGridCell(promo, col, maxScore) {
    const value = promo[col.key];
    let displayValue = '';
    let cellClass = '';

    switch (col.type) {
      case 'promotion':
        // Promotion cell with thumbnail and name
        cellClass = 'col-promotion';
        const thumbHtml = promo.thumbImage
          ? `<img class="grid-thumb" src="${promo.thumbImage}" alt="${escapeHtml(promo.name)}" loading="lazy">`
          : '';
        displayValue = `<div class="promotion-cell">${thumbHtml}<span class="promotion-name">${escapeHtml(value)}</span></div>`;
        break;
      case 'currency':
        displayValue = value != null ? `$${formatNumber(value)}` : '-';
        cellClass = 'col-currency';
        break;
      case 'number':
        displayValue = value != null ? formatNumber(value) : '-';
        cellClass = 'col-number';
        break;
      case 'percent':
        displayValue = value != null ? `${value}%` : '-';
        cellClass = 'col-percent';
        break;
      case 'date':
        displayValue = value ? formatDate(value) : '-';
        cellClass = 'col-date';
        break;
      case 'deal':
        displayValue = value ? getDealBadgeHTML(value) : '-';
        break;
      case 'category':
        displayValue = value ? `<span class="grid-category-badge">${escapeHtml(value)}</span>` : '-';
        break;
      case 'performance':
        const perfPercent = maxScore > 0 ? ((value || 0) / maxScore * 100) : 0;
        const perfClass = promo.percentile >= 75 ? 'high' : promo.percentile >= 50 ? 'medium' : 'low';
        cellClass = 'col-perf';
        displayValue = `
          <div class="perf-bar">
            <div class="perf-bar__track perf-bar__track--${perfClass}">
              <div class="perf-bar__fill perf-bar__fill--${perfClass}" style="width: ${perfPercent}%"></div>
            </div>
            <span class="perf-bar__value">${formatNumber(value)}</span>
          </div>
        `;
        break;
      default:
        displayValue = value != null ? escapeHtml(String(value)) : '-';
    }

    return `<td class="${cellClass}">${displayValue}</td>`;
  }

  /**
   * Get deal type badge HTML for Grid
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
   * Format date for Grid display
   */
  function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  /**
   * Update Grid pagination controls
   */
  function updateGridPagination(total, start, end, totalPages) {
    if (elements.gridRecordCount) {
      elements.gridRecordCount.textContent = formatNumber(total);
    }
    if (elements.gridPageInfo) {
      elements.gridPageInfo.textContent = `Page ${state.gridMode.currentPage} of ${totalPages || 1}`;
    }
    if (elements.gridRangeInfo) {
      elements.gridRangeInfo.textContent = total > 0 ? `${start}-${end} of ${total}` : '0 of 0';
    }
    if (elements.gridPrevBtn) {
      elements.gridPrevBtn.disabled = state.gridMode.currentPage <= 1;
    }
    if (elements.gridNextBtn) {
      elements.gridNextBtn.disabled = state.gridMode.currentPage >= totalPages;
    }
  }

  /**
   * Render column visibility dropdown
   */
  function renderGridColumnsDropdown() {
    if (!elements.gridColumnsList) return;

    elements.gridColumnsList.innerHTML = GRID_COLUMNS.map(col => {
      const isChecked = state.gridMode.visibleColumns.includes(col.key);
      const isSticky = col.sticky;
      return `
        <div class="grid-column-item ${isSticky ? 'grid-column-item--sticky' : ''}">
          <input type="checkbox"
                 id="col-${col.key}"
                 ${isChecked ? 'checked' : ''}
                 ${isSticky ? 'disabled' : ''}
                 onchange="toggleGridColumn('${col.key}', this.checked)">
          <label for="col-${col.key}">${col.label}${isSticky ? ' (sticky)' : ''}</label>
        </div>
      `;
    }).join('');
  }

  /**
   * Render a single grid header cell matching Base Mode structure
   */
  function renderGridHeaderCell(col) {
    const isSorted = state.gridMode.sortColumn === col.key;
    const direction = isSorted ? state.gridMode.sortDirection : null;
    const sortIcon = direction === 'asc' ? 'arrow_upward' : direction === 'desc' ? 'arrow_downward' : 'unfold_more';
    const activeClass = isSorted ? 'th-sort--active' : '';

    // Build filter HTML based on column type
    let filterHTML = '';
    const currentValue = state.gridMode.columnFilters[col.key] || '';

    if (col.type === 'promotion') {
      // Text input filter for promotion name
      filterHTML = `
        <input type="text" class="th-filter-input" placeholder="Filter..."
               value="${escapeHtml(currentValue)}"
               onchange="applyGridFilter('${col.key}', this.value)"
               onclick="event.stopPropagation()">
      `;
    } else if (col.type === 'category') {
      const categories = [...new Set(state.allPromotions.map(p => p.categoryName).filter(Boolean))].sort();
      filterHTML = `
        <select class="th-filter" onchange="applyGridFilter('${col.key}', this.value)" onclick="event.stopPropagation()">
          <option value="">All</option>
          ${categories.map(cat => `<option value="${escapeHtml(cat)}" ${currentValue === cat ? 'selected' : ''}>${escapeHtml(cat)}</option>`).join('')}
        </select>
      `;
    } else if (col.type === 'deal') {
      const dealTypes = [...new Set(state.allPromotions.map(p => p.dealType).filter(Boolean))].sort();
      filterHTML = `
        <select class="th-filter" onchange="applyGridFilter('${col.key}', this.value)" onclick="event.stopPropagation()">
          <option value="">All</option>
          ${dealTypes.map(dt => `<option value="${escapeHtml(dt)}" ${currentValue === dt ? 'selected' : ''}>${escapeHtml(dt)}</option>`).join('')}
        </select>
      `;
    }
    // No filter for number/currency/performance columns

    if (!col.sortable) {
      // Non-sortable column (like row number)
      return `<th>${escapeHtml(col.label)}</th>`;
    }

    return `
      <th class="th-sortable ${activeClass}" data-column="${col.key}">
        <div class="th-content">
          <div class="th-header header-sort" onclick="sortGridColumn('${col.key}')">
            <span class="th-label">${escapeHtml(col.label)}</span>
            <span class="th-sort-icon material-symbols-outlined">${sortIcon}</span>
          </div>
          ${filterHTML}
        </div>
      </th>
    `;
  }

  /**
   * Render filter input for a grid column based on its type
   * @deprecated Use renderGridHeaderCell instead
   */
  function renderGridFilterInput(col) {
    const currentValue = state.gridMode.columnFilters[col.key] || '';

    switch (col.type) {
      case 'text':
        return `<input type="text" class="grid-filter-input" placeholder="Filter..."
                  value="${escapeHtml(currentValue)}"
                  onchange="applyGridFilter('${col.key}', this.value)"
                  onclick="event.stopPropagation()">`;

      case 'category':
        const categories = [...new Set(state.allPromotions.map(p => p.categoryName).filter(Boolean))].sort();
        return `<select class="grid-filter-select" onchange="applyGridFilter('${col.key}', this.value)" onclick="event.stopPropagation()">
                  <option value="">All</option>
                  ${categories.map(cat => `<option value="${escapeHtml(cat)}" ${currentValue === cat ? 'selected' : ''}>${escapeHtml(cat)}</option>`).join('')}
                </select>`;

      case 'deal':
        const dealTypes = [...new Set(state.allPromotions.map(p => p.dealType).filter(Boolean))].sort();
        return `<select class="grid-filter-select" onchange="applyGridFilter('${col.key}', this.value)" onclick="event.stopPropagation()">
                  <option value="">All</option>
                  ${dealTypes.map(dt => `<option value="${escapeHtml(dt)}" ${currentValue === dt ? 'selected' : ''}>${escapeHtml(dt)}</option>`).join('')}
                </select>`;

      case 'number':
      case 'currency':
        return `<input type="text" class="grid-filter-input grid-filter-input--number" placeholder="≥ value"
                  value="${escapeHtml(currentValue)}"
                  onchange="applyGridFilter('${col.key}', this.value)"
                  onclick="event.stopPropagation()">`;

      default:
        return '';
    }
  }

  /**
   * Apply a filter to a grid column
   */
  function applyGridFilter(columnKey, value) {
    if (value === '' || value === null) {
      delete state.gridMode.columnFilters[columnKey];
    } else {
      state.gridMode.columnFilters[columnKey] = value;
    }
    state.gridMode.currentPage = 1; // Reset to first page
    renderGridTable();
    syncGridFiltersToChips();
  }

  /**
   * Clear all grid column filters
   */
  function clearGridFilters() {
    state.gridMode.columnFilters = {};
    state.gridMode.currentPage = 1;
    renderGridTable();
    syncGridFiltersToChips();
  }

  /**
   * Sync grid column filters to header filter chips
   * Creates chips in .filter-chips for each active column filter
   */
  function syncGridFiltersToChips() {
    const filterChipsContainer = document.getElementById('filter-chips');
    if (!filterChipsContainer) return;

    // Remove existing grid filter chips
    clearGridFilterChips();

    const filters = state.gridMode.columnFilters;
    const addFilterBtn = filterChipsContainer.querySelector('.add-filter');

    // Create a chip for each active filter
    Object.keys(filters).forEach(key => {
      const value = filters[key];
      if (value === null || value === '' || value === undefined) return;

      const col = GRID_COLUMNS.find(c => c.key === key);
      if (!col) return;

      // Format display value based on column type
      let displayValue = value;
      if (col.type === 'number' || col.type === 'currency') {
        displayValue = `≥ ${value}`;
      }

      const chip = document.createElement('div');
      chip.className = 'filter-chip filter-chip--grid';
      chip.dataset.column = key;
      chip.innerHTML = `
        <span class="filter-chip__label">${escapeHtml(col.label)}</span>
        <span class="filter-chip__value">${escapeHtml(displayValue)}</span>
        <button class="filter-chip__remove" onclick="removeGridFilterChip('${key}')" aria-label="Remove filter">
          <span class="material-symbols-outlined">close</span>
        </button>
      `;

      // Insert before the Add Filter button
      if (addFilterBtn) {
        filterChipsContainer.insertBefore(chip, addFilterBtn);
      } else {
        filterChipsContainer.appendChild(chip);
      }
    });
  }

  /**
   * Clear all grid filter chips from the header
   */
  function clearGridFilterChips() {
    const filterChipsContainer = document.getElementById('filter-chips');
    if (!filterChipsContainer) return;

    const gridChips = filterChipsContainer.querySelectorAll('.filter-chip--grid');
    gridChips.forEach(chip => chip.remove());
  }

  /**
   * Remove a grid filter chip and clear the corresponding column filter
   */
  function removeGridFilterChip(columnKey) {
    // Clear the column filter
    delete state.gridMode.columnFilters[columnKey];
    state.gridMode.currentPage = 1;

    // Re-render grid table
    renderGridTable();

    // Update chips
    syncGridFiltersToChips();
  }

  /**
   * Toggle column visibility
   */
  function toggleGridColumn(key, visible) {
    if (visible) {
      if (!state.gridMode.visibleColumns.includes(key)) {
        state.gridMode.visibleColumns.push(key);
      }
    } else {
      state.gridMode.visibleColumns = state.gridMode.visibleColumns.filter(k => k !== key);
    }
    renderGridTable();
  }

  /**
   * Reset Grid columns to default
   */
  function resetGridColumns() {
    initGridColumns();
    renderGridColumnsDropdown();
    renderGridTable();
  }

  /**
   * Toggle columns dropdown
   */
  function toggleColumnsDropdown() {
    state.gridMode.columnsDropdownOpen = !state.gridMode.columnsDropdownOpen;
    if (elements.gridColumnsDropdown) {
      elements.gridColumnsDropdown.classList.toggle('open', state.gridMode.columnsDropdownOpen);
    }
    if (elements.gridColumnsBtn) {
      elements.gridColumnsBtn.classList.toggle('active', state.gridMode.columnsDropdownOpen);
    }
  }

  /**
   * Sort Grid by column
   */
  function sortGridColumn(key) {
    if (state.gridMode.sortColumn === key) {
      // Toggle direction
      state.gridMode.sortDirection = state.gridMode.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      state.gridMode.sortColumn = key;
      state.gridMode.sortDirection = 'asc';
    }
    state.gridMode.currentPage = 1; // Reset to first page
    renderGridTable();
  }

  /**
   * Go to previous page in Grid
   */
  function gridPrevPage() {
    if (state.gridMode.currentPage > 1) {
      state.gridMode.currentPage--;
      renderGridTable();
    }
  }

  /**
   * Go to next page in Grid
   */
  function gridNextPage() {
    const { totalPages } = getGridPageData();
    if (state.gridMode.currentPage < totalPages) {
      state.gridMode.currentPage++;
      renderGridTable();
    }
  }

  /**
   * Change rows per page in Grid
   */
  function changeGridRowsPerPage(value) {
    state.gridMode.rowsPerPage = parseInt(value, 10);
    state.gridMode.currentPage = 1;
    renderGridTable();
  }

  /**
   * Handle App Mode change (Base / Grid / Compare)
   */
  function handleModeChange(mode) {
    if (state.appMode === mode) return;

    const previousMode = state.appMode;
    state.appMode = mode;

    // Update body class for CSS styling hooks
    document.body.classList.remove('app-mode-base', 'app-mode-grid', 'app-mode-compare');
    document.body.classList.add(`app-mode-${mode}`);

    // Update button states for all mode buttons
    elements.modeBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    // Update mode-group active state (for BASE group container)
    const modeGroups = document.querySelectorAll('.mode-group');
    modeGroups.forEach(group => {
      group.classList.toggle('active', group.dataset.mode === mode);
    });

    // Show/hide subtabs - only visible when BASE is active
    const subtabsContainer = document.querySelector('.mode-subtabs');
    if (subtabsContainer) {
      subtabsContainer.style.display = mode === 'base' ? '' : 'none';
    }

    // Hide all layouts
    if (elements.categoriesLayout) elements.categoriesLayout.style.display = 'none';
    if (elements.promotionsLayout) elements.promotionsLayout.style.display = 'none';
    if (elements.gridLayout) elements.gridLayout.style.display = 'none';

    // Clear grid filter chips when leaving grid mode
    if (previousMode === 'grid' && mode !== 'grid') {
      clearGridFilterChips();
    }

    // Show appropriate layout based on mode
    if (mode === 'base') {
      // When switching TO Base from Grid or Compare, default to Categories view
      if (previousMode === 'grid' || previousMode === 'compare') {
        state.viewMode = 'categories';
        // Update subtab active states
        const subtabs = document.querySelectorAll('.subtab');
        subtabs.forEach(tab => {
          const isActive = tab.dataset.view === 'categories';
          tab.classList.toggle('active', isActive);
          tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
      }

      // Show current view mode (categories or promotions)
      if (state.viewMode === 'categories') {
        if (elements.categoriesLayout) elements.categoriesLayout.style.display = '';
        // Re-apply filters to ensure categories view is up to date
        if (state.activeFilters.length > 0) {
          applyFilters();
        }
      } else {
        if (elements.promotionsLayout) elements.promotionsLayout.style.display = '';
        // Re-apply filters to ensure promotions view is up to date
        if (state.activeFilters.length > 0) {
          applyFilters();
        }
      }
    } else if (mode === 'grid') {
      // Initialize Grid if needed
      if (state.gridMode.visibleColumns.length === 0) {
        initGridColumns();
      }
      if (elements.gridLayout) elements.gridLayout.style.display = '';
      renderGridColumnsDropdown();
      renderGridTable();
      // Sync existing column filters to header chips
      syncGridFiltersToChips();
    } else if (mode === 'compare') {
      // Compare mode - show message for now
      if (elements.categoriesLayout) {
        elements.categoriesLayout.style.display = '';
        // TODO: Add compare mode implementation
      }
    }

    if (CONFIG.DEBUG) {
      console.log(`Mode changed to: ${mode}`);
    }
  }

  // Expose modal functions globally for onclick handlers
  window.openDatePicker = openDatePicker;
  window.closeDatePicker = closeDatePicker;
  window.switchDateTab = switchDateTab;
  window.filterWeeks = filterWeeks;
  window.selectWeek = selectWeek;
  window.applyDateSelection = applyDateSelection;
  window.openEntitySelector = openEntitySelector;
  window.closeEntitySelector = closeEntitySelector;
  window.switchEntityTab = switchEntityTab;
  window.filterEntities = filterEntities;
  window.filterGroups = filterGroups;
  window.selectEntity = selectEntity;
  window.selectGroup = selectGroup;
  window.toggleTreeRow = toggleTreeRow;
  window.selectTreeEntity = selectTreeEntity;
  window.applyEntitySelection = applyEntitySelection;
  window.openCreateGroupModal = openCreateGroupModal;
  window.openFilterModal = openFilterModal;
  window.closeFilterModal = closeFilterModal;
  window.selectFilterType = selectFilterType;
  window.selectFilterOption = selectFilterOption;
  window.applyFilter = applyFilter;
  window.removeFilter = removeFilter;
  window.closeDetailPanel = closeDetailPanel;
  // Category grid functions
  window.selectCategoryGridRow = selectCategoryGridRow;
  window.closeCategoryDetail = closeCategoryDetail;
  window.viewCategoryPromotions = viewCategoryPromotions;
  window.openCategoryInquiry = openCategoryInquiry;
  window.compareCategoryAction = compareCategoryAction;
  window.comparePromotion = comparePromotion;
  // Grid Mode functions
  window.sortGridColumn = sortGridColumn;
  window.toggleGridColumn = toggleGridColumn;
  window.resetGridColumns = resetGridColumns;
  window.gridPrevPage = gridPrevPage;
  window.gridNextPage = gridNextPage;
  window.changeGridRowsPerPage = changeGridRowsPerPage;
  window.toggleColumnsDropdown = toggleColumnsDropdown;
  window.applyGridFilter = applyGridFilter;
  window.clearGridFilters = clearGridFilters;
  window.removeGridFilterChip = removeGridFilterChip;

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
    if (MockData && MockData.formatNumber) {
      return MockData.formatNumber(num);
    }
    return num.toLocaleString();
  }

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /* ============================================
     TABLE SORTING & FILTERING
     ============================================ */

  /**
   * Get unique deal types from current promotions
   */
  function getUniqueDealTypes() {
    const types = new Set(state.allPromotions.map(p => p.dealType));
    return Array.from(types).sort();
  }

  /**
   * Get unique categories from current promotions
   */
  function getUniqueCategories() {
    const cats = new Set(state.allPromotions.map(p => p.categoryName));
    return Array.from(cats).sort();
  }

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
        case 'civ':
          valA = a.civ || 0;
          valB = b.civ || 0;
          break;
        case 'cc':
          valA = a.cc || 0;
          valB = b.cc || 0;
          break;
        case 'atl':
          valA = a.atl || 0;
          valB = b.atl || 0;
          break;
        case 'percentile':
          valA = a.percentile || 0;
          valB = b.percentile || 0;
          break;
        default:
          return 0;
      }

      if (typeof valA === 'string') {
        const cmp = valA.localeCompare(valB);
        return direction === 'asc' ? cmp : -cmp;
      } else {
        return direction === 'asc' ? valA - valB : valB - valA;
      }
    });
  }

  /**
   * Apply column filters to promotions
   */
  function applyColumnFilters(promotions) {
    let result = promotions;

    if (state.columnFilters.name) {
      const searchTerm = state.columnFilters.name.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(searchTerm));
    }

    if (state.columnFilters.dealType) {
      result = result.filter(p => p.dealType === state.columnFilters.dealType);
    }

    if (state.columnFilters.category) {
      result = result.filter(p => p.categoryName === state.columnFilters.category);
    }

    return result;
  }

  /**
   * Handle column header click for sorting
   */
  function handleColumnSort(column) {
    if (state.sortColumn === column) {
      // Toggle direction
      state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      state.sortColumn = column;
      state.sortDirection = 'desc'; // Default to descending for new column
    }
    renderPromotions();
  }

  /**
   * Handle column filter change
   */
  function handleColumnFilter(filterType, value) {
    state.columnFilters[filterType] = value || null;

    // Sync column filters to context filter chips
    syncColumnFiltersToChips();

    renderPromotions();
  }

  /**
   * Sync column filters to context filter chips
   */
  function syncColumnFiltersToChips() {
    // SINGLE FILTER PER TYPE: Remove ALL existing filters of these types (not just fromColumn)
    // Only one filter per type (promotion, category, deal) is allowed
    if (state.columnFilters.name) {
      state.activeFilters = state.activeFilters.filter(f => f.type !== 'promotion');
    }
    if (state.columnFilters.category) {
      state.activeFilters = state.activeFilters.filter(f => f.type !== 'category');
    }
    if (state.columnFilters.dealType) {
      state.activeFilters = state.activeFilters.filter(f => f.type !== 'deal');
    }

    // Add column filters as chips
    if (state.columnFilters.name) {
      state.activeFilters.push({
        type: 'promotion',
        value: state.columnFilters.name,
        label: 'Promotion',
        fromColumn: true
      });
    }

    if (state.columnFilters.category) {
      state.activeFilters.push({
        type: 'category',
        value: state.columnFilters.category,
        label: 'Category',
        fromColumn: true
      });
    }

    if (state.columnFilters.dealType) {
      state.activeFilters.push({
        type: 'deal',
        value: state.columnFilters.dealType,
        label: 'Deal Type',
        fromColumn: true
      });
    }

    renderFilterChips();
  }

  /**
   * Generate sortable header HTML
   */
  function getSortableHeaderHTML(label, column, filterable = false, filterType = null) {
    const isActive = state.sortColumn === column;
    const direction = isActive ? state.sortDirection : null;
    const sortIcon = direction === 'asc' ? 'arrow_upward' : direction === 'desc' ? 'arrow_downward' : 'unfold_more';
    const activeClass = isActive ? 'th-sort--active' : '';

    let filterHTML = '';
    if (filterable && filterType) {
      if (filterType === 'text') {
        // Text input filter for promotion name
        const currentValue = state.columnFilters.name || '';
        filterHTML = `
          <input type="text" class="th-filter-input" placeholder="Filter..."
                 value="${escapeHtml(currentValue)}"
                 onchange="window.__handleColumnFilter && window.__handleColumnFilter('name', this.value)"
                 onclick="event.stopPropagation()">
        `;
      } else {
        // Dropdown filter for category/dealType
        const options = filterType === 'dealType' ? getUniqueDealTypes() : getUniqueCategories();
        const currentValue = state.columnFilters[filterType] || '';

        filterHTML = `
          <select class="th-filter" data-filter="${filterType}" onchange="window.__handleColumnFilter && window.__handleColumnFilter('${filterType}', this.value)">
            <option value="">All</option>
            ${options.map(opt => `<option value="${escapeHtml(opt)}" ${currentValue === opt ? 'selected' : ''}>${escapeHtml(opt)}</option>`).join('')}
          </select>
        `;
      }
    }

    return `
      <th class="th-sortable ${activeClass}" data-column="${column}">
        <div class="th-content">
          <div class="th-header header-sort" onclick="window.__handleColumnSort && window.__handleColumnSort('${column}')">
            <span class="th-label">${label}</span>
            <span class="th-sort-icon material-symbols-outlined">${sortIcon}</span>
          </div>
          ${filterHTML}
        </div>
      </th>
    `;
  }

  // Expose sort/filter handlers to window for onclick
  window.__handleColumnSort = handleColumnSort;
  window.__handleColumnFilter = handleColumnFilter;

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
        case 'civ':
          valA = a.civ || 0;
          valB = b.civ || 0;
          break;
        case 'cc':
          valA = a.cc || 0;
          valB = b.cc || 0;
          break;
        case 'atl':
          valA = a.atl || 0;
          valB = b.atl || 0;
          break;
        case 'percentile':
          valA = a.percentile || 0;
          valB = b.percentile || 0;
          break;
        case 'compositeScore':
          valA = a.compositeScore || 0;
          valB = b.compositeScore || 0;
          break;
        default:
          return 0;
      }

      if (typeof valA === 'string') {
        const cmp = valA.localeCompare(valB);
        return direction === 'asc' ? cmp : -cmp;
      } else {
        return direction === 'asc' ? valA - valB : valB - valA;
      }
    });
  }

  /**
   * Handle category column header click for sorting
   */
  function handleCategoryColumnSort(column) {
    if (state.categorySortColumn === column) {
      // Toggle direction
      state.categorySortDirection = state.categorySortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      state.categorySortColumn = column;
      state.categorySortDirection = 'desc'; // Default to descending for new column
    }
    renderCategoryGrid();
  }

  /**
   * Generate sortable header HTML for categories
   */
  function getCategorySortableHeaderHTML(label, column, cssClass = '') {
    const isActive = state.categorySortColumn === column;
    const direction = isActive ? state.categorySortDirection : null;
    const sortIcon = direction === 'asc' ? 'arrow_upward' : direction === 'desc' ? 'arrow_downward' : 'unfold_more';
    const activeClass = isActive ? 'th-sort--active' : '';

    return `
      <th class="th-sortable ${activeClass} ${cssClass}" data-column="${column}">
        <div class="th-content">
          <div class="th-header header-sort" onclick="window.__handleCategoryColumnSort && window.__handleCategoryColumnSort('${column}')">
            <span class="th-label">${label}</span>
            <span class="th-sort-icon material-symbols-outlined">${sortIcon}</span>
          </div>
        </div>
      </th>
    `;
  }

  // Expose category sort handler to window
  window.__handleCategoryColumnSort = handleCategoryColumnSort;

  /**
   * Generate comparison badge HTML
   * @param {number} change - Percentage change
   * @returns {string} HTML for comparison badge
   */
  function getComparisonBadgeHTML(change) {
    if (change === 0 || change === null || change === undefined) return '';

    const changeType = MockData.getChangeIndicator(change);
    const formattedChange = MockData.formatChange(change);
    const arrow = changeType === 'up' ? 'arrow_upward' : changeType === 'down' ? 'arrow_downward' : 'remove';

    return `
      <div class="comparison-badge comparison-badge--${changeType === 'up' ? 'increase' : changeType === 'down' ? 'decrease' : 'stable'}">
        <span class="material-symbols-outlined">${arrow}</span>
        ${formattedChange}
      </div>
    `;
  }

  /**
   * Generate comparison arrow HTML
   * @param {number} change - Percentage change
   * @returns {string} HTML for comparison arrow
   */
  function getComparisonArrowHTML(change) {
    if (change === 0 || change === null || change === undefined) return '';

    const changeType = MockData.getChangeIndicator(change);
    const arrow = changeType === 'up' ? 'trending_up' : changeType === 'down' ? 'trending_down' : 'trending_flat';
    const cssClass = changeType === 'up' ? 'up' : changeType === 'down' ? 'down' : 'stable';

    return `
      <span class="comparison-arrow comparison-arrow--${cssClass}">
        <span class="material-symbols-outlined">${arrow}</span>
      </span>
    `;
  }

  /* ============================================
     INITIALIZE ON DOM READY
     ============================================ */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose state for debugging (remove in production)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.__v6State = state;
    console.log('Debug: Access dashboard state via window.__v6State');
  }

})();
