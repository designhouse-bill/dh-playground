/**
 * BASE CATEGORIES - Categories View for Analytics Dashboard
 * Page-specific logic for base_categories.html
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

  // Column filters state
  let columnFilters = {
    name: ''
  };

  // All categories data (before pagination)
  let allDisplayCategories = [];

  /**
   * Initialize the categories page
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
        renderCategories: () => {}, // Not used in categories view
        renderPromotions: () => {}, // Not used in categories view
        renderCategoryGrid: renderCategoryGrid,
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

    // Initialize topN state
    state.topN = state.topN || 25;
    paginationState.topN = state.topN;

    // Render initial view
    renderCategoryGrid();
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

    console.log('[Categories] Page initialized');
  }

  /**
   * Handle store filter from URL parameter
   * Sets Entity context for progressive disclosure from Circulars
   */
  function handleUrlStoreFilter() {
    console.log('[Categories] handleUrlStoreFilter called');
    const urlParams = StateManager.parseUrlParams();
    console.log('[Categories] URL params:', urlParams);

    if (urlParams.storeId) {
      console.log('[Categories] Found storeId in URL:', urlParams.storeId);
      state.activeStore = urlParams.storeId;
      state.selectedStoreId = urlParams.storeId;

      // Get store info from MockData
      let storeName = urlParams.storeId;
      let store = null;
      if (typeof MockData !== 'undefined' && MockData.getStoreById) {
        store = MockData.getStoreById(urlParams.storeId);
        console.log('[Categories] Store lookup result:', store);
        if (store) {
          storeName = store.name;
        }
      }

      // Set Entity context for progressive disclosure
      if (typeof MockData !== 'undefined') {
        MockData.setEntity(urlParams.storeId, 'store', storeName);
        console.log('[Categories] Called MockData.setEntity with:', urlParams.storeId, 'store', storeName);
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
      console.log('[Categories] Set state.currentEntity:', state.currentEntity);

      // Update entity display in header
      console.log('[Categories] Calling core.updateEntityDisplay()');
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
   * Bind page-specific events
   */
  function bindEvents() {
    // More Data toggle
    const moreDataToggle = document.getElementById('more-data-toggle');
    if (moreDataToggle) {
      moreDataToggle.addEventListener('change', (e) => {
        state.moreDataEnabled = e.target.checked;
        renderCategoryGrid();
        core.saveState();
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
    renderCategoryGrid();
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
   * Get current page of data with TopN and pagination applied
   */
  function getPageData() {
    let categories = [...allDisplayCategories];

    // Apply TopN limit
    const topN = paginationState.topN;
    if (topN !== 'all' && typeof topN === 'number') {
      categories = categories.slice(0, topN);
    }

    const totalRecords = categories.length;
    const totalPages = Math.ceil(totalRecords / paginationState.rowsPerPage);

    // Ensure current page is valid
    if (paginationState.currentPage > totalPages) {
      paginationState.currentPage = Math.max(1, totalPages);
    }

    const start = (paginationState.currentPage - 1) * paginationState.rowsPerPage;
    const end = start + paginationState.rowsPerPage;
    const pageData = categories.slice(start, end);

    return {
      data: pageData,
      total: totalRecords,
      start: start + 1,
      end: Math.min(end, totalRecords),
      currentPage: paginationState.currentPage,
      totalPages: totalPages
    };
  }

  /**
   * Render the category data grid
   */
  function renderCategoryGrid() {
    const gridContainer = document.getElementById('category-data-grid');
    if (!gridContainer) return;

    // Dispose existing charts before re-render
    if (typeof PerfCharts !== 'undefined') {
      PerfCharts.disposeAllCharts();
    }

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
      updatePaginationUI();
      return;
    }

    // Apply column filters first, then sort
    categories = applyColumnFiltersToCategories(categories);
    categories = core.sortCategories(categories, state.categorySortColumn, state.categorySortDirection);

    // Store all categories for pagination
    allDisplayCategories = categories;

    // Get page data with TopN and pagination applied
    const pageInfo = getPageData();
    const pageCategories = pageInfo.data;

    // Update showing count (shows TopN-limited total)
    const showingCount = document.getElementById('category-showing-count');
    if (showingCount) {
      showingCount.textContent = pageInfo.total;
    }

    // Calculate max composite score for performance bars
    const maxScore = Math.max(...allDisplayCategories.map(c => c.compositeScore || 0));

    const rows = pageCategories.map((cat, index) => {
      const isSelected = state.selectedCategoryId === cat.id;
      const perfPercent = maxScore > 0 ? ((cat.compositeScore || 0) / maxScore * 100) : 0;
      const perfClass = cat.percentile >= 75 ? 'high' : cat.percentile >= 50 ? 'medium' : 'low';
      const globalIndex = pageInfo.start + index;

      return `
        <tr class="category-row ${isSelected ? 'selected' : ''}"
            data-category-id="${cat.id}"
            onclick="selectCategoryGridRow('${cat.id}')">
          <td class="col-num">
            <span class="row-number">${globalIndex}</span>
          </td>
          <td class="col-category">
            <div class="category-name">
              <div class="category-icon">
                <span class="material-symbols-outlined">category</span>
              </div>
              <span class="category-label">${core.escapeHtml(cat.name)}</span>
            </div>
          </td>
          <td class="col-views">${core.formatNumber(cat.civ)}</td>
          <td class="col-clicks">${core.formatNumber(cat.cc)}</td>
          <td class="col-added">${core.formatNumber(cat.atl)}</td>
          <td class="col-perf">
            <div class="perf-chart-container">
              <div class="perf-chart" id="perf-chart-cat-${cat.id}"
                   data-name="${core.escapeHtml(cat.name)}"
                   data-views="${cat.civ || 0}"
                   data-clicks="${cat.cc || 0}"
                   data-adds="${cat.atl || 0}"
                   data-composite="${cat.compositeScore || 0}">
              </div>
              <span class="perf-chart__value">${core.formatNumber(cat.compositeScore)}</span>
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

    // Update pagination UI
    updatePaginationUI();

    const moreDataClass = state.moreDataEnabled ? 'more-data-enabled' : '';

    gridContainer.innerHTML = `
      <table class="category-grid-table data-table--sortable ${moreDataClass}">
        <thead id="category-table-head">
          <tr>
            <th class="col-num">#</th>
            ${getCategorySortableHeaderHTML('Category', 'name', 'col-category', 'text')}
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

    gridContainer.classList.toggle('more-data-enabled', state.moreDataEnabled);

    // Initialize performance charts
    if (typeof PerfCharts !== 'undefined') {
      const chartHeight = state.moreDataEnabled ? 12 : 16;
      PerfCharts.calculateMaxValues(allDisplayCategories);
      PerfCharts.initAllCharts({ height: chartHeight, dataArray: allDisplayCategories });
    }
  }

  /**
   * Generate sortable header HTML for categories (matching grid-inquiry pattern)
   */
  function getCategorySortableHeaderHTML(label, column, cssClass = '', filterType = null) {
    const isActive = state.categorySortColumn === column;
    const direction = isActive ? state.categorySortDirection : null;
    const sortIcon = direction === 'asc' ? 'arrow_upward' : direction === 'desc' ? 'arrow_downward' : 'unfold_more';
    const activeClass = isActive ? 'th-sort--active' : '';

    // Build filter HTML based on type
    let filterHTML = '';

    if (filterType === 'text') {
      // Text filter input with clear button
      const currentValue = columnFilters[column] || '';
      const hasValue = currentValue.length > 0;
      filterHTML = `
        <div class="th-filter-wrapper">
          <input type="text" class="th-filter-input ${hasValue ? 'has-value' : ''}"
                 placeholder="Filter..."
                 value="${core.escapeHtml(currentValue)}"
                 oninput="updateCategoryFilterClearBtn(this)"
                 onchange="applyCategoryFilter('${column}', this.value)"
                 onclick="event.stopPropagation()">
          <button class="th-filter-clear ${hasValue ? 'visible' : ''}"
                  onclick="clearCategoryFilter('${column}'); event.stopPropagation();"
                  aria-label="Clear filter">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
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
          <div class="th-header header-sort" onclick="handleCategoryColumnSort('${column}')">
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
   * Apply filter to category column
   */
  function applyCategoryFilter(column, value) {
    columnFilters[column] = value || '';
    paginationState.currentPage = 1;
    renderCategoryGrid();
    core.saveState();
  }

  /**
   * Clear filter for a category column
   */
  function clearCategoryFilter(column) {
    columnFilters[column] = '';
    paginationState.currentPage = 1;
    renderCategoryGrid();
    core.saveState();
  }

  /**
   * Update filter clear button visibility
   */
  function updateCategoryFilterClearBtn(input) {
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
   * Apply column filters to categories array
   */
  function applyColumnFiltersToCategories(categories) {
    let filtered = [...categories];

    // Name filter (text search)
    if (columnFilters.name) {
      const search = columnFilters.name.toLowerCase();
      filtered = filtered.filter(c => c.name.toLowerCase().includes(search));
    }

    return filtered;
  }

  /**
   * Handle category column sort
   */
  function handleCategoryColumnSort(column) {
    if (state.categorySortColumn === column) {
      state.categorySortDirection = state.categorySortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      state.categorySortColumn = column;
      state.categorySortDirection = 'desc';
    }
    renderCategoryGrid();
    core.saveState();
  }

  /**
   * Handle category row selection
   */
  function selectCategoryGridRow(categoryId) {
    state.selectedCategoryId = categoryId;
    state.activeCategory = categoryId;

    const rows = document.querySelectorAll('.category-row');
    rows.forEach(row => {
      row.classList.toggle('selected', row.dataset.categoryId === categoryId);
    });

    renderCategoryDetail(categoryId);

    const detailPanel = document.getElementById('category-detail-panel');
    if (detailPanel) {
      detailPanel.classList.remove('panel--collapsed');
      detailPanel.classList.add('panel--expanded');
    }

    core.saveState();
  }

  /**
   * Render category detail panel
   */
  function renderCategoryDetail(categoryId) {
    const detailContent = document.getElementById('category-detail-content');
    if (!detailContent) return;

    const category = state.categories.find(c => c.id === categoryId);
    if (!category) {
      detailContent.innerHTML = '<p>Category not found</p>';
      return;
    }

    detailContent.innerHTML = `
      <div class="category-detail-header">
        <h3 class="category-detail-name">${core.escapeHtml(category.name)}</h3>
        <div class="category-detail-count">
          <span class="material-symbols-outlined" style="font-size: 16px;">local_offer</span>
          <strong>${category.promotionCount}</strong> Promotions
        </div>
      </div>

      <div class="category-metrics">
        <div class="category-metric">
          <div class="category-metric__label">Views</div>
          <div class="category-metric__value">${core.formatNumber(category.civ)}</div>
        </div>
        <div class="category-metric">
          <div class="category-metric__label">Clicks</div>
          <div class="category-metric__value">${core.formatNumber(category.cc)}</div>
        </div>
        <div class="category-metric">
          <div class="category-metric__label">Added to List</div>
          <div class="category-metric__value">${core.formatNumber(category.atl)}</div>
        </div>
        <div class="category-metric">
          <div class="category-metric__label">Percentile</div>
          <div class="category-metric__value">${category.percentile}%</div>
        </div>
      </div>
    `;
  }

  /**
   * Close category detail panel
   */
  function closeCategoryDetail() {
    state.selectedCategoryId = null;
    state.activeCategory = null;

    const rows = document.querySelectorAll('.category-row');
    rows.forEach(row => row.classList.remove('selected'));

    const detailPanel = document.getElementById('category-detail-panel');
    if (detailPanel) {
      detailPanel.classList.add('panel--collapsed');
      detailPanel.classList.remove('panel--expanded');
    }

    core.saveState();
  }

  /**
   * Navigate to circulars (stores) view
   */
  function viewCirculars() {
    core.saveState();
    StateManager.navigateTo('base_circulars.html', state);
  }

  /**
   * Navigate to promotions view filtered by category
   */
  function viewCategoryPromotions(categoryId) {
    const catId = categoryId || state.selectedCategoryId;
    if (!catId) return;
    core.saveState();
    StateManager.navigateTo('base_promotions.html', state, { categoryId: catId });
  }

  /**
   * Navigate to grid inquiry filtered by category
   */
  function openCategoryInquiry(categoryId) {
    const catId = categoryId || state.selectedCategoryId;
    if (!catId) return;
    core.saveState();
    StateManager.navigateTo('grid-inquiry.html', state, { categoryId: catId });
  }

  /**
   * Navigate to compare view for category
   */
  function compareCategoryAction(categoryId) {
    const catId = categoryId || state.selectedCategoryId;
    if (!catId) return;
    core.saveState();
    StateManager.navigateTo('compare.html', state, { categoryId: catId });
  }

  /**
   * Update counts display
   */
  function updateCounts() {
    const categoryCount = document.getElementById('category-count');
    if (categoryCount) {
      categoryCount.textContent = state.filteredCategories.length || state.categories.length;
    }
  }

  /**
   * Change TopN limit
   */
  function changeTopN(value) {
    paginationState.topN = value === 'all' ? 'all' : parseInt(value, 10);
    state.topN = paginationState.topN;
    paginationState.currentPage = 1;
    renderCategoryGrid();
    updatePaginationUI();
    core.saveState();
  }

  /**
   * Change rows per page
   */
  function changeRowsPerPage(value) {
    paginationState.rowsPerPage = parseInt(value, 10);
    paginationState.currentPage = 1;
    renderCategoryGrid();
    updatePaginationUI();
    core.saveState();
  }

  /**
   * Go to previous page
   */
  function prevPage() {
    if (paginationState.currentPage > 1) {
      paginationState.currentPage--;
      renderCategoryGrid();
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
      renderCategoryGrid();
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
  window.selectCategoryGridRow = selectCategoryGridRow;
  window.closeCategoryDetail = closeCategoryDetail;
  window.viewCirculars = viewCirculars;
  window.viewCategoryPromotions = viewCategoryPromotions;
  window.openCategoryInquiry = openCategoryInquiry;
  window.compareCategoryAction = compareCategoryAction;
  window.handleCategoryColumnSort = handleCategoryColumnSort;
  window.changeTopN = changeTopN;
  window.changeRowsPerPage = changeRowsPerPage;
  window.prevPage = prevPage;
  window.nextPage = nextPage;
  // Filter functions
  window.applyCategoryFilter = applyCategoryFilter;
  window.clearCategoryFilter = clearCategoryFilter;
  window.updateCategoryFilterClearBtn = updateCategoryFilterClearBtn;

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
