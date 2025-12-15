/**
 * BASE PROMOTIONS - Promotions View for Analytics Dashboard
 * Page-specific logic for base_promotions.html
 */

(function() {
  'use strict';

  // References to shared modules
  let core = null;
  let state = null;
  let elements = null;

  // Pagination state
  let paginationState = {
    currentPage: 1,
    rowsPerPage: 25,
    topN: 25
  };

  // All promotions data (before pagination)
  let allDisplayPromotions = [];

  /**
   * Initialize the promotions page
   */
  async function init() {
    // Initialize core module
    core = window.DashboardCore;
    elements = core.initElements();
    state = core.getState();

    // Restore state from localStorage/URL
    core.restoreState();

    // Initialize modals
    if (window.DashboardModals) {
      window.DashboardModals.init(core);
    }

    // Initialize filters with render callbacks
    if (window.DashboardFilters) {
      window.DashboardFilters.init(core);
      window.DashboardFilters.setRenderCallbacks({
        renderCategories: renderCategories,
        renderPromotions: renderPromotions,
        renderCategoryGrid: () => {},
        updateCounts: updateCounts
      });
      // Initialize metrics key tooltip system
      window.DashboardFilters.initMetricsKeyTooltip();
    }

    // Set active navigation state
    core.setActiveNavigation();

    // Initialize context
    core.initializeContext();

    // Load data
    await core.loadData();

    // Check for store filter from URL
    handleUrlStoreFilter();

    // Check for category filter from URL
    handleUrlCategoryFilter();

    // Initialize topN state
    state.topN = state.topN || 25;
    paginationState.topN = state.topN;

    // Render initial views
    renderCategories();
    renderPromotions();
    updateCounts();
    updatePaginationUI();

    // Render filter chips
    if (window.DashboardFilters) {
      window.DashboardFilters.renderFilterChips();
    }

    // Bind events
    bindEvents();

    // Listen for data refresh events
    document.addEventListener('dashboard:dataRefresh', handleDataRefresh);
    document.addEventListener('dashboard:filterApply', handleFilterApply);

    // Restore TopN select value
    const topNSelect = document.getElementById('topn-select');
    if (topNSelect) {
      topNSelect.value = state.topN === 'all' ? 'all' : state.topN.toString();
    }

    console.log('[Promotions] Page initialized');
  }

  /**
   * Handle store filter from URL parameter
   * Sets Entity context for progressive disclosure from Circulars
   */
  function handleUrlStoreFilter() {
    const urlParams = StateManager.parseUrlParams();
    if (urlParams.storeId) {
      state.activeStore = urlParams.storeId;
      state.selectedStoreId = urlParams.storeId;

      // Get store info from MockData
      let storeName = urlParams.storeId;
      let store = null;
      if (typeof MockData !== 'undefined' && MockData.getStoreById) {
        store = MockData.getStoreById(urlParams.storeId);
        if (store) {
          storeName = store.name;
        }
      }

      // Set Entity context for progressive disclosure
      if (typeof MockData !== 'undefined') {
        MockData.setEntity(urlParams.storeId, 'store', storeName);
      }

      // Update state entity info
      state.entityId = urlParams.storeId;
      state.entityLevel = 'store';
      state.entityName = storeName;
      state.currentEntity = {
        id: urlParams.storeId,
        level: 'store',
        name: storeName,
        count: 1
      };

      // Update entity display in header
      core.updateEntityDisplay();

      // Add store filter if not already present
      const hasFilter = state.activeFilters.some(f => f.type === 'store');
      if (!hasFilter) {
        state.activeFilters.push({
          type: 'store',
          value: urlParams.storeId,
          label: storeName,
          fromUrl: true
        });
      }

      // Apply filters
      if (window.DashboardFilters) {
        window.DashboardFilters.applyFilters();
      }
    }
  }

  /**
   * Handle category filter from URL parameter
   */
  function handleUrlCategoryFilter() {
    const urlParams = StateManager.parseUrlParams();
    if (urlParams.categoryId) {
      state.activeCategory = urlParams.categoryId;
      state.selectedCategoryId = urlParams.categoryId;

      // Add category filter if not already present
      const hasFilter = state.activeFilters.some(f => f.type === 'category');
      if (!hasFilter) {
        const category = state.categories.find(c => c.id === urlParams.categoryId);
        if (category) {
          state.activeFilters.push({
            type: 'category',
            value: urlParams.categoryId,
            label: 'Category',
            fromUrl: true
          });
          state.columnFilters.category = category.name;
        }
      }

      // Apply filters
      if (window.DashboardFilters) {
        window.DashboardFilters.applyFilters();
      }
    }
  }

  /**
   * Bind page-specific events
   */
  function bindEvents() {
    // More Data toggle
    const moreDataToggle = document.getElementById('more-data-toggle');
    if (moreDataToggle) {
      moreDataToggle.checked = state.promoMoreDataEnabled || false;
      moreDataToggle.addEventListener('change', (e) => {
        state.promoMoreDataEnabled = e.target.checked;
        renderPromotions();
        core.saveState();
      });
    }

    // Card view toggle
    const cardViewToggle = document.getElementById('card-view-toggle');
    if (cardViewToggle) {
      cardViewToggle.checked = state.promoViewMode === 'cards';
      cardViewToggle.addEventListener('change', (e) => {
        state.promoViewMode = e.target.checked ? 'cards' : 'table';
        togglePromoView();
        core.saveState();
      });
    }

    // Set initial More Data toggle visibility
    updateMoreDataToggleVisibility();

    // Category list click handler
    const categoryList = document.getElementById('category-list');
    if (categoryList) {
      categoryList.addEventListener('click', handleCategoryClick);
    }

    // Promotion table click handler
    const promotionTable = document.getElementById('promotion-table');
    if (promotionTable) {
      promotionTable.addEventListener('click', handlePromotionClick);
    }

    // Promotion grid click handler
    const promotionGrid = document.getElementById('promotion-grid');
    if (promotionGrid) {
      promotionGrid.addEventListener('click', handlePromotionClick);
    }

    // Share button handler
    const shareBtn = document.getElementById('promo-share-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        core.handleShareClick();
      });
    }

    // Save state on navigation clicks
    document.querySelectorAll('.mode-btn, .subtab').forEach(link => {
      link.addEventListener('click', () => {
        core.saveState();
      });
    });
  }

  /**
   * Handle data refresh events from modals
   */
  function handleDataRefresh(event) {
    renderCategories();
    renderPromotions();
    updateCounts();
    if (window.DashboardFilters) {
      window.DashboardFilters.applyFilters();
    }
  }

  /**
   * Handle filter apply events
   */
  function handleFilterApply(event) {
    if (window.DashboardFilters) {
      window.DashboardFilters.renderFilterChips();
      window.DashboardFilters.applyFilters();
    }
  }

  /**
   * Toggle between card and table view
   */
  function togglePromoView() {
    const grid = document.getElementById('promotion-grid');
    const table = document.getElementById('promotion-table');

    if (state.promoViewMode === 'cards') {
      if (grid) grid.style.display = 'grid';
      if (table) table.style.display = 'none';
    } else {
      if (grid) grid.style.display = 'none';
      if (table) table.style.display = 'block';
    }

    // Update More Data toggle visibility
    updateMoreDataToggleVisibility();
  }

  /**
   * Show/hide More Data toggle based on Card View state
   * More Data is only available when Card View is OFF (table mode)
   */
  function updateMoreDataToggleVisibility() {
    const moreDataWrapper = document.getElementById('more-data-toggle-wrapper');
    if (moreDataWrapper) {
      moreDataWrapper.style.display = state.promoViewMode === 'cards' ? 'none' : 'flex';
    }
  }

  /**
   * Render category list in left panel
   */
  function renderCategories() {
    const categoryList = document.getElementById('category-list');
    if (!categoryList) return;

    // "All Categories" item
    const allItem = createCategoryItem({
      id: 'all',
      name: 'All Categories',
      promotionCount: state.allPromotions.length,
      isAll: true
    });

    // Individual category items
    const categoryItems = state.categories.map(cat => createCategoryItem(cat));

    categoryList.innerHTML = allItem + categoryItems.join('');
  }

  /**
   * Create HTML for a single category item
   */
  function createCategoryItem(cat) {
    const isActive = state.activeCategory === cat.id || (cat.isAll && state.activeCategory === null);
    const percentileClass = cat.percentile ? core.getPercentileClass(cat.percentile) : '';
    const allClass = cat.isAll ? 'category-item--all' : '';

    return `
      <div class="category-item ${allClass} ${isActive ? 'active' : ''}"
           data-id="${cat.id}"
           role="listitem"
           tabindex="0"
           aria-label="${cat.name}, ${cat.promotionCount} promotions">
        <div class="category-item__info">
          <div class="category-item__name">${core.escapeHtml(cat.name)}</div>
          <div class="category-item__meta">
            ${cat.promotionCount} promotion${cat.promotionCount !== 1 ? 's' : ''}
          </div>
        </div>
        ${cat.percentile ? core.getPercentileBadgeHTML(cat.percentile) : ''}
      </div>
    `;
  }

  /**
   * Handle category click
   */
  function handleCategoryClick(e) {
    const categoryItem = e.target.closest('.category-item');
    if (!categoryItem) return;

    const categoryId = categoryItem.dataset.id;
    selectCategory(categoryId);
  }

  /**
   * Select a category
   */
  function selectCategory(categoryId) {
    if (categoryId === 'all') {
      state.activeCategory = null;
      state.columnFilters.category = null;
      // Remove category filters
      state.activeFilters = state.activeFilters.filter(f => f.type !== 'category');
    } else {
      state.activeCategory = categoryId;
      const category = state.categories.find(c => c.id === categoryId);
      if (category) {
        state.columnFilters.category = category.name;
        // Add category filter
        state.activeFilters = state.activeFilters.filter(f => f.type !== 'category');
        state.activeFilters.push({
          type: 'category',
          value: categoryId,
          label: 'Category',
          fromColumn: false
        });
      }
    }

    renderCategories();
    if (window.DashboardFilters) {
      window.DashboardFilters.renderFilterChips();
      window.DashboardFilters.applyFilters();
    }
    core.saveState();
  }

  /**
   * Render promotions (cards or table based on view mode)
   */
  function renderPromotions() {
    const grid = document.getElementById('promotion-grid');
    const table = document.getElementById('promotion-table');

    if (state.filteredPromotions.length === 0) {
      const emptyHTML = `
        <div style="text-align: center; padding: var(--space-8); color: var(--color-text-tertiary);">
          <div style="font-size: 48px; margin-bottom: var(--space-4);">&#128237;</div>
          <p>No promotions found</p>
        </div>
      `;
      if (grid) grid.innerHTML = emptyHTML;
      if (table) table.innerHTML = emptyHTML;
      return;
    }

    // Calculate max values for bar charts
    const maxCiv = Math.max(...state.filteredPromotions.map(p => p.civ));
    const maxCc = Math.max(...state.filteredPromotions.map(p => p.cc));
    const maxAtl = Math.max(...state.filteredPromotions.map(p => p.atl));
    const maxValues = { maxCiv, maxCc, maxAtl };

    // Render cards
    if (grid) {
      const promoCards = state.filteredPromotions.map((promo, index) =>
        createPromoCard(promo, index + 1, maxValues)
      );
      grid.innerHTML = promoCards.join('');
    }

    // Render table
    renderPromotionTable(maxValues);

    // Set correct view visibility
    togglePromoView();
  }

  /**
   * Create HTML for a promotion card
   */
  function createPromoCard(promo, position, maxValues) {
    const isActive = state.activePromotion === promo.id;
    const performanceWidth = promo.percentile;
    const perfClass = promo.percentile >= 75 ? 'high' : promo.percentile >= 50 ? 'medium' : 'low';

    // Generate variants badge HTML if this is a parent with children
    const variantsBadgeHTML = promo.isParent && promo.childCount > 0
      ? `<span class="variants-badge">Includes ${promo.childCount} variant${promo.childCount !== 1 ? 's' : ''}</span>`
      : '';

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
               alt="${core.escapeHtml(promo.name)}"
               loading="lazy">
        </div>
        <div class="promo-card__content">
          <div class="promo-card__badges">
            <span class="promo-card__deal-badge">${core.escapeHtml(promo.dealType)}</span>
            ${core.getPercentileBadgeHTML(promo.percentile)}
          </div>
          <h3 class="promo-card__title">${core.escapeHtml(promo.name)}${variantsBadgeHTML}</h3>
          <p class="promo-card__meta">${core.escapeHtml(promo.categoryName)}</p>
          <div class="promo-card__stats">
            <div class="promo-stat">
              <span class="promo-stat__value">${core.formatNumber(promo.civ)}</span>
              <span class="promo-stat__label">Views</span>
            </div>
            <div class="promo-stat">
              <span class="promo-stat__value">${core.formatNumber(promo.cc)}</span>
              <span class="promo-stat__label">Clicks</span>
            </div>
            <div class="promo-stat">
              <span class="promo-stat__value">${core.formatNumber(promo.atl)}</span>
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
        </div>
      </div>
    `;
  }

  /**
   * Get current page of data with TopN as page size (not a total limit)
   * TopN controls how many records to show per page, with pagination to see all records
   */
  function getPageData() {
    let promos = [...allDisplayPromotions];

    // TopN is now the page size (records per page), not a total limit
    const pageSize = paginationState.topN === 'all'
      ? promos.length
      : paginationState.topN;

    const totalRecords = promos.length; // All filtered promotions, not limited
    const totalPages = pageSize > 0 ? Math.ceil(totalRecords / pageSize) : 1;

    // Ensure current page is valid
    if (paginationState.currentPage > totalPages) {
      paginationState.currentPage = Math.max(1, totalPages);
    }

    const start = (paginationState.currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageData = promos.slice(start, end);

    return {
      data: pageData,
      total: totalRecords,
      totalFiltered: totalRecords,
      start: start + 1,
      end: Math.min(end, totalRecords),
      currentPage: paginationState.currentPage,
      totalPages: totalPages,
      pageSize: pageSize
    };
  }

  /**
   * Render promotion table view
   */
  function renderPromotionTable(maxValues) {
    const table = document.getElementById('promotion-table');
    if (!table) return;

    // Dispose existing charts before re-render
    if (typeof PerfCharts !== 'undefined') {
      PerfCharts.disposeAllCharts();
    }

    // Apply column filters first, then sort
    let displayPromotions = applyColumnFilters(state.filteredPromotions);
    displayPromotions = core.sortPromotions(displayPromotions, state.sortColumn, state.sortDirection);

    // Store all promotions for pagination
    allDisplayPromotions = displayPromotions;

    // Get page data with TopN and pagination applied
    const pageInfo = getPageData();
    const pagePromotions = pageInfo.data;

    // Update showing count (shows TopN-limited total, not full total)
    const showingCount = document.getElementById('promo-showing-count');
    if (showingCount) {
      showingCount.textContent = pageInfo.total;
    }

    if (pagePromotions.length === 0) {
      table.innerHTML = `
        <div class="table-empty">
          <span class="material-symbols-outlined">filter_list_off</span>
          <p>No promotions match the current filters</p>
        </div>
      `;
      updatePaginationUI();
      return;
    }

    const maxScore = Math.max(...allDisplayPromotions.map(p => p.compositeScore || 0));
    const showMoreData = state.promoMoreDataEnabled || false;

    const rows = pagePromotions.map((promo, index) => {
      const isActive = state.activePromotion === promo.id;
      const perfPercent = maxScore > 0 ? ((promo.compositeScore || 0) / maxScore * 100) : 0;
      const perfClass = promo.percentile >= 75 ? 'high' : promo.percentile >= 50 ? 'medium' : 'low';
      const globalIndex = pageInfo.start + index;

      // More Data columns (Deal, Views, Clicks, Added)
      const moreDataCells = showMoreData ? `
          <td class="col-deal"><span class="promo-deal">${core.escapeHtml(promo.dealType)}</span></td>
          <td class="col-views">${core.formatNumber(promo.civ)}</td>
          <td class="col-clicks">${core.formatNumber(promo.cc)}</td>
          <td class="col-added">${core.formatNumber(promo.atl)}</td>
      ` : '';

      // Generate variants badge HTML if this is a parent with children
      const variantsBadgeHTML = promo.isParent && promo.childCount > 0
        ? `<span class="variants-badge">Includes ${promo.childCount} variant${promo.childCount !== 1 ? 's' : ''}</span>`
        : '';

      return `
        <tr class="promo-row ${isActive ? 'selected' : ''}" data-id="${promo.id}">
          <td class="col-num">
            <span class="row-number">${globalIndex}</span>
          </td>
          <td class="col-promo">
            <div class="promo-name">
              <div class="promo-thumb">
                <img src="${promo.thumbImage}" alt="${core.escapeHtml(promo.name)}">
              </div>
              <div class="promo-name-content">
                <span class="promo-label">${core.escapeHtml(promo.name)}</span>
                ${variantsBadgeHTML}
              </div>
            </div>
          </td>
          <td class="col-category"><span class="promo-category">${core.escapeHtml(promo.categoryName)}</span></td>
          ${moreDataCells}
          <td class="col-perf">
            <div class="perf-chart-container">
              <div class="perf-chart" id="perf-chart-promo-${promo.id}"
                   data-name="${core.escapeHtml(promo.name)}"
                   data-views="${promo.civ || 0}"
                   data-clicks="${promo.cc || 0}"
                   data-adds="${promo.atl || 0}"
                   data-composite="${promo.compositeScore || 0}">
              </div>
              <span class="perf-chart__value">${core.formatNumber(promo.compositeScore)}</span>
            </div>
          </td>
          <td class="col-percentile">${core.getPercentileBadgeHTML(promo.percentile)}</td>
          <td class="col-actions">
            <button class="btn-compare" onclick="quickCompare('${promo.id}'); event.stopPropagation();" title="Compare this promotion">
              <span class="material-symbols-outlined">compare</span>
              Compare
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Update pagination UI after rendering
    updatePaginationUI();

    // More Data headers (Deal, Views, Clicks, Added)
    const moreDataHeaders = showMoreData ? `
            ${getPromoSortableHeaderHTML('Deal', 'dealType', 'col-deal', 'dealType')}
            ${getPromoSortableHeaderHTML('Views', 'civ', 'col-views')}
            ${getPromoSortableHeaderHTML('Clicks', 'cc', 'col-clicks')}
            ${getPromoSortableHeaderHTML('Added', 'atl', 'col-added')}
    ` : '';

    // Toggle more-data-enabled class on container
    table.classList.toggle('more-data-enabled', showMoreData);

    table.innerHTML = `
      <table class="promo-grid-table data-table--sortable">
        <thead id="promo-table-head">
          <tr>
            <th class="col-num">#</th>
            ${getPromoSortableHeaderHTML('Promotion', 'name', 'col-promo', 'text')}
            ${getPromoSortableHeaderHTML('Category', 'categoryName', 'col-category', 'category')}
            ${moreDataHeaders}
            ${getPromoSortableHeaderHTML('Performance', 'compositeScore', 'col-perf')}
            ${getPromoSortableHeaderHTML('%tile', 'percentile', 'col-percentile')}
            <th class="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody id="promo-grid-body">
          ${rows}
        </tbody>
      </table>
    `;

    // Initialize performance charts
    if (typeof PerfCharts !== 'undefined') {
      const chartHeight = showMoreData ? 12 : 16;
      PerfCharts.calculateMaxValues(allDisplayPromotions);
      PerfCharts.initAllCharts({ height: chartHeight, dataArray: allDisplayPromotions });
    }
  }

  /**
   * Generate sortable header HTML for promotions (matching grid-inquiry pattern)
   */
  function getPromoSortableHeaderHTML(label, column, cssClass = '', filterType = null) {
    const isActive = state.sortColumn === column;
    const direction = isActive ? state.sortDirection : null;
    const sortIcon = direction === 'asc' ? 'arrow_upward' : direction === 'desc' ? 'arrow_downward' : 'unfold_more';
    const activeClass = isActive ? 'th-sort--active' : '';

    // Build filter HTML based on type
    let filterHTML = '';

    if (filterType === 'text') {
      // Text filter input with clear button for promotion name
      const currentValue = state.columnFilters.name || '';
      const hasValue = currentValue.length > 0;
      filterHTML = `
        <div class="th-filter-wrapper">
          <input type="text" class="th-filter-input ${hasValue ? 'has-value' : ''}"
                 placeholder="Filter..."
                 value="${core.escapeHtml(currentValue)}"
                 oninput="updatePromoFilterClearBtn(this)"
                 onchange="handleColumnFilter('name', this.value)"
                 onclick="event.stopPropagation()">
          <button class="th-filter-clear ${hasValue ? 'visible' : ''}"
                  onclick="clearPromoFilter('name'); event.stopPropagation();"
                  aria-label="Clear filter">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
      `;
    } else if (filterType === 'category') {
      // Category dropdown filter
      const categories = core.getUniqueCategories();
      const currentValue = state.columnFilters.category || '';
      const options = ['<option value="">All</option>'].concat(
        categories.map(cat => `<option value="${core.escapeHtml(cat)}" ${cat === currentValue ? 'selected' : ''}>${core.escapeHtml(cat)}</option>`)
      ).join('');
      filterHTML = `
        <select class="th-filter-select"
                onchange="handleColumnFilter('category', this.value)"
                onclick="event.stopPropagation()">
          ${options}
        </select>
      `;
    } else if (filterType === 'dealType') {
      // Deal type dropdown filter
      const dealTypes = core.getUniqueDealTypes();
      const currentValue = state.columnFilters.dealType || '';
      const options = ['<option value="">All</option>'].concat(
        dealTypes.map(dt => `<option value="${core.escapeHtml(dt)}" ${dt === currentValue ? 'selected' : ''}>${core.escapeHtml(dt)}</option>`)
      ).join('');
      filterHTML = `
        <select class="th-filter-select"
                onchange="handleColumnFilter('dealType', this.value)"
                onclick="event.stopPropagation()">
          ${options}
        </select>
      `;
    } else if (column === 'compositeScore' && typeof PerfCharts !== 'undefined') {
      // Performance metric dropdown
      filterHTML = PerfCharts.getDropdownHTML();
    }

    // Add info button for Performance column
    const infoButtonHTML = (column === 'compositeScore' && typeof DashboardFilters !== 'undefined')
      ? DashboardFilters.getMetricsKeyButtonHTML()
      : '';

    return `
      <th class="th-sortable ${activeClass} ${cssClass}" data-column="${column}">
        <div class="th-content">
          <div class="th-header header-sort" onclick="handleColumnSort('${column}')">
            <span class="th-label">${label}</span>
            ${infoButtonHTML}
            <span class="th-sort-icon material-symbols-outlined">${sortIcon}</span>
          </div>
          ${filterHTML}
        </div>
      </th>
    `;
  }

  /**
   * Clear filter for a promo column
   */
  function clearPromoFilter(column) {
    state.columnFilters[column] = '';
    paginationState.currentPage = 1;
    renderPromotionTable();
    core.saveState();
  }

  /**
   * Update filter clear button visibility
   */
  function updatePromoFilterClearBtn(input) {
    const wrapper = input.closest('.th-filter-wrapper');
    const clearBtn = wrapper ? wrapper.querySelector('.th-filter-clear') : null;
    if (clearBtn) {
      if (input.value.length > 0) {
        clearBtn.classList.add('visible');
        input.classList.add('has-value');
      } else {
        clearBtn.classList.remove('visible');
        input.classList.remove('has-value');
      }
    }
  }

  /**
   * Apply column filters to promotions
   */
  function applyColumnFilters(promotions) {
    let filtered = [...promotions];

    if (state.columnFilters.name) {
      const search = state.columnFilters.name.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(search));
    }

    if (state.columnFilters.category) {
      filtered = filtered.filter(p => p.categoryName === state.columnFilters.category);
    }

    if (state.columnFilters.dealType) {
      filtered = filtered.filter(p => p.dealType === state.columnFilters.dealType);
    }

    return filtered;
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
        const currentValue = state.columnFilters.name || '';
        filterHTML = `
          <input type="text" class="th-filter-input" placeholder="Filter..."
                 value="${core.escapeHtml(currentValue)}"
                 onchange="handleColumnFilter('name', this.value)"
                 onclick="event.stopPropagation()">
        `;
      } else if (filterType === 'category') {
        const categories = core.getUniqueCategories();
        const currentValue = state.columnFilters.category || '';
        const options = ['<option value="">All</option>'].concat(
          categories.map(cat => `<option value="${core.escapeHtml(cat)}" ${cat === currentValue ? 'selected' : ''}>${core.escapeHtml(cat)}</option>`)
        ).join('');
        filterHTML = `
          <select class="th-filter-select" onchange="handleColumnFilter('category', this.value)" onclick="event.stopPropagation()">
            ${options}
          </select>
        `;
      } else if (filterType === 'dealType') {
        const dealTypes = core.getUniqueDealTypes();
        const currentValue = state.columnFilters.dealType || '';
        const options = ['<option value="">All</option>'].concat(
          dealTypes.map(dt => `<option value="${core.escapeHtml(dt)}" ${dt === currentValue ? 'selected' : ''}>${core.escapeHtml(dt)}</option>`)
        ).join('');
        filterHTML = `
          <select class="th-filter-select" onchange="handleColumnFilter('dealType', this.value)" onclick="event.stopPropagation()">
            ${options}
          </select>
        `;
      }
    }

    return `
      <th class="th-sortable ${activeClass}" data-column="${column}">
        <div class="th-content">
          <div class="th-header header-sort" onclick="handleColumnSort('${column}')">
            <span class="th-label">${label}</span>
            <span class="th-sort-icon material-symbols-outlined">${sortIcon}</span>
          </div>
          ${filterHTML}
        </div>
      </th>
    `;
  }

  /**
   * Handle column sort click
   */
  function handleColumnSort(column) {
    if (state.sortColumn === column) {
      state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      state.sortColumn = column;
      state.sortDirection = 'desc';
    }
    renderPromotions();
    core.saveState();
  }

  /**
   * Handle column filter change
   */
  function handleColumnFilter(filterType, value) {
    state.columnFilters[filterType] = value || null;
    if (window.DashboardFilters) {
      window.DashboardFilters.syncColumnFiltersToChips();
    }
    renderPromotions();
    core.saveState();
  }

  /**
   * Handle promotion click
   */
  function handlePromotionClick(e) {
    const promoElement = e.target.closest('.promo-card, .promo-row');
    if (!promoElement) return;

    const promoId = promoElement.dataset.id;
    selectPromotion(promoId);
  }

  /**
   * Select a promotion
   */
  function selectPromotion(promoId) {
    state.activePromotion = promoId;

    // Update active states in UI - cards use 'active', rows use 'selected'
    document.querySelectorAll('.promo-card').forEach(el => {
      el.classList.toggle('active', el.dataset.id === promoId);
    });
    document.querySelectorAll('.promo-row').forEach(el => {
      el.classList.toggle('selected', el.dataset.id === promoId);
    });

    // Render detail panel
    const promo = state.filteredPromotions.find(p => p.id === promoId);
    if (promo) {
      renderDetail(promo);

      // Expand detail panel
      const detailPanel = document.getElementById('detail-panel');
      if (detailPanel) {
        detailPanel.classList.remove('panel--collapsed');
        detailPanel.classList.add('panel--expanded');
      }
    }

    core.saveState();
  }

  /**
   * Format date as "Mon D" (e.g., "Oct 28")
   */
  function formatShortDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  }

  /**
   * Format date range as "Mon D - Mon D, YYYY" (e.g., "Oct 28 - Nov 3, 2025")
   */
  function formatDateRange(startDate, endDate) {
    if (!startDate || !endDate) return '';
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    const startFormatted = formatShortDate(startDate);
    const endFormatted = formatShortDate(endDate);
    const year = end.getFullYear();
    return `${startFormatted} - ${endFormatted}, ${year}`;
  }

  /**
   * Get days label with correct singular/plural
   */
  function getDaysLabel(days) {
    return days === 1 ? '1 Day' : `${days} Days`;
  }

  /**
   * Render promotion detail panel
   */
  function renderDetail(promo) {
    const detailContent = document.getElementById('detail-content');
    if (!detailContent) return;

    const ctr = ((promo.cc / promo.civ) * 100).toFixed(1);

    // Get chart colors from DashboardCore
    const colors = core.getChartColors();

    // Helper functions for percentile colors (matching app.js)
    const getPercentileVariant = (percentile) => {
      if (percentile >= 75) return 'high';
      if (percentile >= 50) return 'medium';
      return 'low';
    };

    // Determine bar color based on metric mode
    // Default to composite/total view which uses teal
    const metricMode = state.detailMetricMode || 'composite';
    let barColor;
    if (metricMode === 'all' || metricMode === 'total' || metricMode === 'composite') {
      barColor = colors.total;  // Teal #06989D for aggregate/composite score
    } else {
      // Individual metric colors
      barColor = colors[metricMode] || colors.total;  // views, clicks, or adds
    }

    // Build date context row HTML
    const daysLabel = getDaysLabel(promo.daysRun || 7);
    const dateRangeFormatted = formatDateRange(promo.startDate, promo.endDate);
    const dateContextHTML = dateRangeFormatted ? `
      <div class="detail-date-context">
        <span class="days-badge">${daysLabel}</span>
        <span class="date-separator">•</span>
        <span class="date-range">${dateRangeFormatted}</span>
      </div>
    ` : '';

    // Generate variants badge for detail panel (under title, before tags)
    const detailVariantsBadge = promo.isParent && promo.childCount > 0
      ? `<span class="detail-variants-badge">Includes ${promo.childCount} variant${promo.childCount !== 1 ? 's' : ''}</span>`
      : '';

    detailContent.innerHTML = `
      <div class="detail-hero">
        <img src="${promo.heroImage || promo.thumbImage}" alt="${core.escapeHtml(promo.name)}">
      </div>
      ${dateContextHTML}
      <div class="detail-body">
        <h2 class="detail-title">${core.escapeHtml(promo.name)}</h2>
        ${detailVariantsBadge}

        <div class="detail-tags">
          <span class="detail-tag detail-tag--category">${core.escapeHtml(promo.categoryName)}</span>
          <span class="detail-tag detail-tag--deal">${core.escapeHtml(promo.dealType)}</span>
        </div>

        ${promo.originalPosition ? `
        <div class="detail-meta-item">
          <span class="meta-label">Original Position:</span>
          <span class="meta-value">Row ${promo.originalPosition}</span>
        </div>
        ` : ''}

        <div class="detail-percentile-row">
          <div class="percentile-bar" style="background-color: ${barColor}22;">
            <div class="percentile-bar-fill" style="width: ${promo.percentile}%; background-color: ${barColor};"></div>
          </div>
          <span class="percentile-score">${promo.compositeScore}</span>
          <img src="./assets/chart-bar.svg" alt="Percentile" class="percentile-icon">
          <span class="percentile-value percentile-value--${getPercentileVariant(promo.percentile)}">${promo.percentile}%</span>
        </div>

        <div class="detail-kpis">
          <div class="detail-kpi">
            <div class="kpi-value">
              <span class="kpi-weighted">${core.formatNumber(promo.civ * 1)}</span>
              <span class="kpi-raw">(${core.formatNumber(promo.civ)} - raw)</span>
            </div>
            <div class="kpi-label">Card in View</div>
          </div>
          <div class="detail-kpi">
            <div class="kpi-value">
              <span class="kpi-weighted">${core.formatNumber(promo.cc * 5)}</span>
              <span class="kpi-raw">(${core.formatNumber(promo.cc)} - raw)</span>
            </div>
            <div class="kpi-label">Card Clicked</div>
          </div>
          <div class="detail-kpi">
            <div class="kpi-value">
              <span class="kpi-weighted">${core.formatNumber(promo.atl * 20)}</span>
              <span class="kpi-raw">(${core.formatNumber(promo.atl)} - raw)</span>
            </div>
            <div class="kpi-label">Add to List</div>
          </div>
          <div class="detail-kpi">
            <div class="kpi-value">
              <span class="kpi-weighted">${ctr}%</span>
            </div>
            <div class="kpi-label">Click-Through Rate</div>
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-section__title">Interaction Rate</div>
          <div class="detail-chart-container" id="interaction-rate-chart" style="width: 100%; height: 200px;"></div>
        </div>
      </div>
    `;

    // Render interaction rate chart if ECharts is available
    setTimeout(() => {
      if (typeof echarts !== 'undefined') {
        renderInteractionRateChart(promo);
      }
    }, 0);
  }

  /**
   * Render interaction rate donut chart (matching app.js)
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

    // Get colors from CSS variables
    const colors = core.getChartColors();

    // Donut chart data - Views, Clicks, Added
    const donutData = [
      { name: 'Views', value: views, itemStyle: { color: colors.views } },
      { name: 'Clicks', value: clicks, itemStyle: { color: colors.clicks } },
      { name: 'Added', value: added, itemStyle: { color: colors.adds } }
    ];

    // Chart configuration
    const option = {
      tooltip: {
        trigger: 'item',
        backgroundColor: '#ffffff',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: { color: '#0f172a', fontFamily: 'inherit', fontSize: 12 },
        formatter: (params) => `${params.name}: ${core.formatNumber(params.value)}`
      },
      legend: {
        orient: 'horizontal',
        bottom: 0,
        left: 'center',
        textStyle: { color: '#6b7280', fontSize: 11, fontFamily: 'inherit', fontWeight: 400 },
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
   * Close detail panel
   */
  function closeDetailPanel() {
    state.activePromotion = null;

    document.querySelectorAll('.promo-card, tr[data-id]').forEach(el => {
      el.classList.remove('active');
    });

    const detailPanel = document.getElementById('detail-panel');
    if (detailPanel) {
      detailPanel.classList.add('panel--collapsed');
      detailPanel.classList.remove('panel--expanded');
    }

    core.saveState();
  }

  /**
   * Print current promotion
   */
  function printPromotion() {
    window.print();
  }

  /**
   * Navigate to grid inquiry for current promotion
   */
  function openPromotionInquiry() {
    if (state.activePromotion) {
      core.saveState();
      StateManager.navigateTo('grid-inquiry.html', state, { promotionId: state.activePromotion });
    }
  }

  /**
   * Navigate to compare for current promotion
   */
  function compareCurrentPromotion() {
    if (state.activePromotion) {
      core.saveState();
      StateManager.navigateTo('compare.html', state, { promotionId: state.activePromotion });
    }
  }

  /**
   * Quick compare - navigate to Compare with Panel A pre-populated
   * @param {string} promotionId - The promotion ID to compare
   */
  function quickCompare(promotionId) {
    // Get current context (week, entity, days)
    const weekId = state.selectedWeekId || state.currentWeek?.id || 'week-47';
    const entityId = state.currentEntity?.id || 'all';
    const entityLevel = state.currentEntity?.level || 'all';
    const daysFilter = state.columnFilters?.days || 'all';

    // Build URL params for Panel A
    const params = new URLSearchParams();
    params.set('weekA', weekId);
    params.set('entityA', entityId);
    params.set('entityLevelA', entityLevel);
    params.set('daysA', daysFilter);
    params.set('promoA', promotionId);
    params.set('layer', 'promotions'); // Set layer to promotions since we're comparing a promotion

    // Save state and navigate
    core.saveState();
    window.location.href = `compare.html?${params.toString()}`;
  }

  /**
   * Update counts display
   */
  function updateCounts() {
    const categoryCount = document.getElementById('category-count');
    if (categoryCount) {
      categoryCount.textContent = state.categories.length;
    }
  }

  /**
   * Change TopN limit
   */
  function changeTopN(value) {
    paginationState.topN = value === 'all' ? 'all' : parseInt(value, 10);
    state.topN = paginationState.topN;
    paginationState.currentPage = 1;
    renderPromotions();
    updatePaginationUI();
    core.saveState();
  }

  /**
   * Change rows per page
   */
  function changeRowsPerPage(value) {
    paginationState.rowsPerPage = parseInt(value, 10);
    paginationState.currentPage = 1;
    renderPromotions();
    updatePaginationUI();
    core.saveState();
  }

  /**
   * Go to previous page
   */
  function prevPage() {
    if (paginationState.currentPage > 1) {
      paginationState.currentPage--;
      renderPromotions();
      updatePaginationUI();
    }
  }

  /**
   * Go to next page
   */
  function nextPage() {
    const pageInfo = getPageData();
    if (paginationState.currentPage < pageInfo.totalPages) {
      paginationState.currentPage++;
      renderPromotions();
      updatePaginationUI();
    }
  }

  /**
   * Update pagination UI controls
   */
  function updatePaginationUI() {
    const pageInfo = getPageData();

    const pageInfoEl = document.getElementById('grid-page-info');
    if (pageInfoEl) {
      pageInfoEl.textContent = `Page ${pageInfo.currentPage} of ${pageInfo.totalPages || 1}`;
    }

    const rangeInfoEl = document.getElementById('grid-range-info');
    if (rangeInfoEl) {
      if (pageInfo.total === 0) {
        rangeInfoEl.textContent = '0 of 0';
      } else {
        rangeInfoEl.textContent = `${pageInfo.start}-${pageInfo.end} of ${pageInfo.total}`;
      }
    }

    const prevBtn = document.getElementById('grid-prev-btn');
    if (prevBtn) {
      prevBtn.disabled = pageInfo.currentPage <= 1;
    }

    const nextBtn = document.getElementById('grid-next-btn');
    if (nextBtn) {
      nextBtn.disabled = pageInfo.currentPage >= pageInfo.totalPages;
    }
  }

  // Expose functions globally for onclick handlers
  window.closeDetailPanel = closeDetailPanel;
  window.printPromotion = printPromotion;
  window.openPromotionInquiry = openPromotionInquiry;
  window.compareCurrentPromotion = compareCurrentPromotion;
  window.quickCompare = quickCompare;
  window.handleColumnSort = handleColumnSort;
  window.handleColumnFilter = handleColumnFilter;
  window.clearPromoFilter = clearPromoFilter;
  window.updatePromoFilterClearBtn = updatePromoFilterClearBtn;
  window.changeTopN = changeTopN;
  window.changeRowsPerPage = changeRowsPerPage;
  window.prevPage = prevPage;
  window.nextPage = nextPage;

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
