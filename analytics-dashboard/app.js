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
     STATE MANAGEMENT
     ============================================ */
  const state = {
    // Data
    allPromotions: [],
    filteredPromotions: [],
    categories: [],

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
    }
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
    entityTreeBody: document.getElementById('entity-tree-body')
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

    // "All Promotions" item
    const allItem = createCategoryItem({
      id: 'all',
      name: 'All Promotions',
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
   */
  function renderCategoryGrid() {
    const gridContainer = document.getElementById('category-data-grid');
    if (!gridContainer) return;

    let categories = state.categories;
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
            <span class="table-position">${index + 1}</span>
          </td>
          <td class="col-category">
            <div class="category-name">
              <div class="category-icon">
                <span class="material-symbols-outlined">category</span>
              </div>
              <span class="category-label">${escapeHtml(cat.name)}</span>
            </div>
          </td>
          <td class="col-perf table-performance">
            <div class="perf-bar table-bar--wide">
              <div class="perf-bar__track">
                <div class="perf-bar__fill perf-bar__fill--${perfClass}" style="width: ${perfPercent}%"></div>
              </div>
              <span class="perf-bar__value">${formatNumber(cat.compositeScore)}</span>
            </div>
          </td>
          <td class="col-metric table-metric">${formatNumber(cat.civ)}</td>
          <td class="col-metric table-metric">${formatNumber(cat.cc)}</td>
          <td class="col-metric table-metric">${formatNumber(cat.atl)}</td>
          <td class="col-metric table-metric">${cat.percentile}%</td>
        </tr>
      `;
    });

    gridContainer.innerHTML = `
      <table class="data-table data-table--sortable">
        <thead>
          <tr>
            <th class="col-num">#</th>
            ${getCategorySortableHeaderHTML('Category', 'name', 'col-category')}
            ${getCategorySortableHeaderHTML('Performance', 'compositeScore', 'col-perf th-performance')}
            ${getCategorySortableHeaderHTML('Views', 'civ', 'col-metric')}
            ${getCategorySortableHeaderHTML('Clicks', 'cc', 'col-metric')}
            ${getCategorySortableHeaderHTML('Added', 'atl', 'col-metric')}
            ${getCategorySortableHeaderHTML('%tile', 'percentile', 'col-metric')}
          </tr>
        </thead>
        <tbody id="category-grid-body">
          ${rows.join('')}
        </tbody>
      </table>
    `;

    // Update count
    if (elements.categoryGridCount) {
      elements.categoryGridCount.textContent = categories.length;
    }
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
    // Set the active category filter
    state.activeCategory = categoryId;

    // Switch to Promotions view
    state.viewMode = 'promotions';

    // Update segment buttons
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
   * Open Inquiry Data Grid for category (placeholder)
   */
  function openCategoryInquiry(categoryId) {
    console.log(`Opening Inquiry Grid for category: ${categoryId}`);
    // TODO: Switch to Grid mode filtered by category
    alert(`Inquiry Data Grid for "${state.categories.find(c => c.id === categoryId)?.name}" - Coming soon`);
  }

  /**
   * Open Compare view for category (placeholder)
   */
  function compareCategoryAction(categoryId) {
    console.log(`Opening Compare for category: ${categoryId}`);
    // TODO: Switch to Compare mode for category
    alert(`Compare view for "${state.categories.find(c => c.id === categoryId)?.name}" - Coming soon`);
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
            <div class="promo-bar">
              <span class="promo-bar__label">Perf</span>
              <div class="promo-bar__track">
                <div class="promo-bar__fill promo-bar__fill--views" style="width: ${performanceWidth}%"></div>
              </div>
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

    // Only show filters in "All Promotions" view (no category selected)
    const showFilters = !state.activeCategory;

    if (displayPromotions.length === 0) {
      elements.promotionTable.innerHTML = `
        <div class="table-empty">
          <span class="material-symbols-outlined">filter_list_off</span>
          <p>No promotions match the current filters</p>
        </div>
      `;
      return;
    }

    const rows = displayPromotions.map((promo, index) => {
      const isActive = state.activePromotion === promo.id;
      const performanceWidth = promo.percentile;

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
                <div class="table-meta">${escapeHtml(promo.categoryName)}</div>
              </div>
            </div>
          </td>
          <td class="table-performance">
            <div class="table-bar table-bar--wide">
              <div class="table-bar__track">
                <div class="table-bar__fill" style="width: ${performanceWidth}%"></div>
              </div>
            </div>
          </td>
          <td><span class="table-deal">${escapeHtml(promo.dealType)}</span></td>
          <td class="table-metric">${formatNumber(promo.civ)}</td>
          <td class="table-metric">${formatNumber(promo.cc)}</td>
          <td class="table-metric">${formatNumber(promo.atl)}</td>
          <td>${getPercentileBadgeHTML(promo.percentile)}</td>
        </tr>
      `;
    }).join('');

    elements.promotionTable.innerHTML = `
      <table class="data-table data-table--sortable">
        <thead>
          <tr>
            <th>#</th>
            ${getSortableHeaderHTML('Promotion', 'name', showFilters, 'category')}
            <th class="th-performance">Performance</th>
            ${getSortableHeaderHTML('Deal', 'dealType', showFilters, 'dealType')}
            ${getSortableHeaderHTML('Views', 'civ')}
            ${getSortableHeaderHTML('Clicks', 'cc')}
            ${getSortableHeaderHTML('Added', 'atl')}
            ${getSortableHeaderHTML('%ile', 'percentile')}
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

    elements.detailContent.innerHTML = `
      <div class="detail-hero">
        <img src="${promo.heroImage}" alt="${escapeHtml(promo.name)}">
      </div>
      <div class="detail-body">
        <h2 class="detail-title">${escapeHtml(promo.name)}</h2>
        <p class="detail-meta">
          ${escapeHtml(promo.categoryName)} • ${escapeHtml(promo.dealType)} • ${escapeHtml(promo.cardSize)}
        </p>

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
          <div class="detail-section__title">Performance</div>
          <div style="display: flex; align-items: center; gap: var(--space-4); margin-top: var(--space-2);">
            ${getPercentileBadgeHTML(promo.percentile)}
            <span style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">
              Score: ${promo.compositeScore}
            </span>
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-section__title">7-Day Trend</div>
          <div class="mini-chart" id="trend-chart"></div>
        </div>

        <div class="detail-section">
          <div class="detail-section__title">Top Performing Stores</div>
          <div class="store-list">
            ${MockData.topStores.slice(0, 5).map(store => `
              <div class="store-item">
                <span class="store-item__name">${escapeHtml(store.name)}</span>
                <span class="store-item__score">${store.score}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="detail-actions">
          <button class="btn btn--outline" onclick="window.print()">
            <span class="material-symbols-outlined">print</span>
            Print
          </button>
          <button class="btn btn--primary">
            <span class="material-symbols-outlined">compare</span>
            Compare
          </button>
        </div>
      </div>
    `;

    // Render the trend chart after DOM update
    setTimeout(() => renderTrendChart(), 0);
  }

  /**
   * Render trend chart mini visualization
   */
  function renderTrendChart() {
    const container = document.getElementById('trend-chart');
    if (!container || !MockData.weeklyTrend) return;

    const maxValue = Math.max(...MockData.weeklyTrend.map(d => d.value));

    const bars = MockData.weeklyTrend.map(day => {
      const height = (day.value / maxValue) * 100;
      return `<div class="chart-bar"
                   style="height: ${height}%"
                   title="${day.day}: ${day.value}"
                   role="img"
                   aria-label="${day.day}: ${day.value} views"></div>`;
    });

    container.innerHTML = bars.join('');
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
    } else {
      state.activeCategory = categoryId;
      state.selectedCategoryId = categoryId; // Sync with Categories view
      state.filteredPromotions = state.allPromotions.filter(p => p.category === categoryId);
    }

    // Apply search filter if active
    if (state.searchQuery) {
      applySearchFilter();
    }

    // Re-render
    renderCategories();
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
   */
  function handleSegmentChange(e) {
    const btn = e.currentTarget;
    const view = btn.dataset.view;

    if (state.viewMode === view) return;

    state.viewMode = view;

    // Update button states
    elements.segmentBtns.forEach(b => {
      b.classList.toggle('active', b === btn);
      b.setAttribute('aria-selected', b === btn);
    });

    // Toggle layouts visibility
    if (elements.categoriesLayout && elements.promotionsLayout) {
      if (view === 'categories') {
        elements.categoriesLayout.style.display = 'flex';
        elements.promotionsLayout.style.display = 'none';

        // CONTEXT PERSISTENCE: Sync category selection from Promotions view
        if (state.activeCategory && state.activeCategory !== 'all') {
          state.selectedCategoryId = state.activeCategory;
          // Re-render grid with selection and show detail panel
          renderCategoryGrid();
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
    if (subEl) subEl.textContent = `${entity.count || MockData.entities.brand.storeCount} locations`;

    // Update icon and breadcrumb based on entity level
    if (entity.level === 'brand') {
      if (iconEl) iconEl.textContent = 'corporate_fare';
      if (breadcrumbEl) breadcrumbEl.textContent = 'BRAND';
    } else if (entity.level === 'sub-brand') {
      if (iconEl) iconEl.textContent = 'store';
      if (breadcrumbEl) breadcrumbEl.textContent = 'BRAND > SUB-BRAND';
    } else if (entity.level === 'store') {
      if (iconEl) iconEl.textContent = 'storefront';
      // Find the sub-brand for this store
      const store = MockData.entities.stores.find(s => s.id === entity.id);
      const subBrand = store ? MockData.entities.subBrands.find(sb => sb.id === store.subBrand) : null;
      const subBrandName = subBrand ? subBrand.name : '';
      if (breadcrumbEl) breadcrumbEl.textContent = `BRAND > ${subBrandName.toUpperCase()} > STORE`;
    } else if (entity.level === 'brand-group' || entity.level === 'sub-brand-group') {
      if (iconEl) iconEl.textContent = 'workspaces';
      if (breadcrumbEl) breadcrumbEl.textContent = 'GROUP';
    } else {
      if (iconEl) iconEl.textContent = 'store';
      if (breadcrumbEl) breadcrumbEl.textContent = 'BRAND > SUB-BRAND';
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
            data-parent="">
          <td class="tree-indent-0">
            <div class="tree-name-cell">
              <button class="tree-toggle ${isAllExpanded ? '' : 'collapsed'}" onclick="toggleTreeRow('all', event)">
                <span class="material-symbols-outlined">expand_more</span>
              </button>
              <span onclick="selectTreeEntity('all', 'all', 'All Stores', ${totalStoreCount})">All Stores</span>
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
              data-parent="all">
            <td class="tree-indent-1">
              <div class="tree-name-cell">
                <button class="tree-toggle ${isBrandExpanded ? '' : 'collapsed'}" onclick="toggleTreeRow('${brand.id}', event)">
                  <span class="material-symbols-outlined">expand_more</span>
                </button>
                <span onclick="selectTreeEntity('${brand.id}', 'brand', '${escapeHtml(brand.name)}', ${brand.storeCount})">${escapeHtml(brand.name)}</span>
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
                data-parent="${brand.id}">
              <td class="tree-indent-2">
                <div class="tree-name-cell">
                  <button class="tree-toggle ${isSubExpanded ? '' : 'collapsed'}" onclick="toggleTreeRow('${subBrand.id}', event)">
                    <span class="material-symbols-outlined">expand_more</span>
                  </button>
                  <span onclick="selectTreeEntity('${subBrand.id}', 'sub-brand', '${escapeHtml(subBrand.name)}', ${subBrand.storeCount})">${escapeHtml(subBrand.name)}</span>
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
                  data-parent="${subBrand.id}">
                <td class="tree-indent-3">
                  <div class="tree-name-cell">
                    <span class="tree-toggle-placeholder"></span>
                    <span onclick="selectTreeEntity('${store.id}', 'store', '${escapeHtml(store.title)}', 1)">${escapeHtml(store.name)}</span>
                  </div>
                </td>
                <td><span class="type-badge type-badge--store">Store</span></td>
                <td>${escapeHtml(store.title)}</td>
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
    state.allPromotions = MockData.promotions || [];
    state.filteredPromotions = [...state.allPromotions];

    // Re-render all views
    renderCategoryGrid();  // View By: Categories
    renderCategories();    // View By: Promotions sidebar
    renderPromotions();
    updateCounts();

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
    document.querySelectorAll('.entity-item').forEach(el => {
      el.classList.remove('selected');
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

    // Update UI selection for entities
    document.querySelectorAll('.entity-item').forEach(el => {
      el.classList.toggle('selected', el.dataset.entityId === entityId);
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
    state.allPromotions = MockData.promotions || [];
    state.filteredPromotions = [...state.allPromotions];

    // Re-render all views
    renderCategoryGrid();  // View By: Categories
    renderCategories();    // View By: Promotions sidebar
    renderPromotions();
    updateCounts();

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
                       : 'filter-chip--size';

      // Get display name for category
      let displayValue = filter.value;
      if (filter.type === 'category') {
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
    state.activeFilters.splice(index, 1);
    renderFilterChips();
    applyFilters();
  }

  /**
   * Apply all active filters to promotions
   */
  function applyFilters() {
    // Start with category filter if active
    let filtered = state.activeCategory
      ? state.allPromotions.filter(p => p.category === state.activeCategory)
      : [...state.allPromotions];

    // Apply each active filter
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
    renderPromotions();
    updateCounts();

    if (CONFIG.DEBUG) {
      console.log(`Filters applied: ${state.activeFilters.length} filters, ${filtered.length} results`);
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
  // Category grid functions
  window.selectCategoryGridRow = selectCategoryGridRow;
  window.closeCategoryDetail = closeCategoryDetail;
  window.viewCategoryPromotions = viewCategoryPromotions;
  window.openCategoryInquiry = openCategoryInquiry;
  window.compareCategoryAction = compareCategoryAction;

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
        <span class="material-symbols-outlined percentile-badge__icon">bar_chart</span>
        <span class="percentile-badge__value percentile-badge__value--${colorClass}">${percentile}</span>
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
    renderPromotions();
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
      const options = filterType === 'dealType' ? getUniqueDealTypes() : getUniqueCategories();
      const currentValue = state.columnFilters[filterType] || '';

      filterHTML = `
        <select class="th-filter" data-filter="${filterType}" onchange="window.__handleColumnFilter && window.__handleColumnFilter('${filterType}', this.value)">
          <option value="">All</option>
          ${options.map(opt => `<option value="${escapeHtml(opt)}" ${currentValue === opt ? 'selected' : ''}>${escapeHtml(opt)}</option>`).join('')}
        </select>
      `;
    }

    return `
      <th class="th-sortable ${activeClass}" data-column="${column}">
        <div class="th-content">
          <span class="th-label" onclick="window.__handleColumnSort && window.__handleColumnSort('${column}')">${label}</span>
          <span class="th-sort-icon material-symbols-outlined" onclick="window.__handleColumnSort && window.__handleColumnSort('${column}')">${sortIcon}</span>
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
          <span class="th-label" onclick="window.__handleCategoryColumnSort && window.__handleCategoryColumnSort('${column}')">${label}</span>
          <span class="th-sort-icon material-symbols-outlined" onclick="window.__handleCategoryColumnSort && window.__handleCategoryColumnSort('${column}')">${sortIcon}</span>
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
