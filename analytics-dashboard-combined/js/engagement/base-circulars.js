/**
 * BASE CIRCULARS - Stores View for Analytics Dashboard
 * Page-specific logic for engagement-circulars.html
 *
 * Shows all stores with their aggregated metrics,
 * allowing drill-down to categories and promotions.
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
    name: '',
    brandName: ''
  };

  // Stores data
  let allStores = [];
  let filteredStores = [];

  /**
   * Initialize the circulars page
   */
  async function init() {
    // Initialize core module
    core = window.DashboardCore;
    elements = core.initElements();
    state = core.getState();

    // Initialize circulars-specific state
    state.selectedStoreId = state.selectedStoreId || null;
    state.activeStore = state.activeStore || null;
    state.storeSortColumn = state.storeSortColumn || 'compositeScore';
    state.storeSortDirection = state.storeSortDirection || 'desc';
    state.topN = state.topN || 25;

    // Sync pagination state
    paginationState.topN = state.topN;

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
        renderCategories: () => {},
        renderPromotions: () => {},
        renderCategoryGrid: () => {},
        renderStoreGrid: renderStoreGrid,
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

    // Load store metrics
    loadStoreData();

    // Render initial view
    renderStoreGrid();
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

    console.log('[Circulars] Page initialized');
  }

  /**
   * Load store data with metrics from MockData
   */
  function loadStoreData() {
    if (typeof MockData !== 'undefined' && MockData.getStoresWithMetrics) {
      allStores = MockData.getStoresWithMetrics();
      filteredStores = [...allStores];
      console.log(`[Circulars] Loaded ${allStores.length} stores with metrics`);
    } else {
      console.warn('[Circulars] MockData.getStoresWithMetrics not available');
      allStores = [];
      filteredStores = [];
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
        renderStoreGrid();
        core.saveState();
      });
    }

    // Share button handler
    const shareBtn = document.getElementById('panel-share-btn');
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
    loadStoreData();
    renderStoreGrid();
    updateCounts();
    updatePaginationUI();
  }

  /**
   * Handle filter apply events
   */
  function handleFilterApply(event) {
    if (window.DashboardFilters) {
      window.DashboardFilters.renderFilterChips();
    }
    renderStoreGrid();
    updateCounts();
    updatePaginationUI();
  }

  /**
   * Get current page of data with TopN as page size (not a total limit)
   * TopN controls how many records to show per page, with pagination to see all records
   */
  function getPageData() {
    let stores = [...filteredStores];

    // TopN is now the page size (records per page), not a total limit
    const pageSize = paginationState.topN === 'all'
      ? stores.length
      : paginationState.topN;

    const totalRecords = stores.length; // All filtered stores, not limited
    const totalPages = pageSize > 0 ? Math.ceil(totalRecords / pageSize) : 1;

    // Ensure current page is valid
    if (paginationState.currentPage > totalPages) {
      paginationState.currentPage = Math.max(1, totalPages);
    }

    const start = (paginationState.currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageData = stores.slice(start, end);

    return {
      data: pageData,
      total: totalRecords,
      totalFiltered: totalRecords, // For display: "X of Y total"
      start: start + 1,
      end: Math.min(end, totalRecords),
      currentPage: paginationState.currentPage,
      totalPages: totalPages,
      pageSize: pageSize
    };
  }

  /**
   * Render the store data grid
   */
  function renderStoreGrid() {
    const gridContainer = document.getElementById('store-data-grid');
    if (!gridContainer) return;

    // Dispose existing charts before re-render
    if (typeof PerfCharts !== 'undefined') {
      PerfCharts.disposeAllCharts();
    }

    // Apply column filters first, then sort
    let displayStores = applyColumnFiltersToStores(allStores);
    filteredStores = sortStores(displayStores, state.storeSortColumn, state.storeSortDirection);

    // Get page data
    const pageInfo = getPageData();
    const stores = pageInfo.data;

    // Update showing count
    const showingCount = document.getElementById('store-showing-count');
    if (showingCount) {
      showingCount.textContent = pageInfo.total;
    }

    if (!stores || stores.length === 0) {
      gridContainer.innerHTML = `
        <div class="table-empty">
          <span class="material-symbols-outlined">storefront</span>
          <p>No stores available</p>
        </div>
      `;
      return;
    }

    // Calculate max composite score for performance bars
    const maxScore = Math.max(...allStores.map(s => s.compositeScore || 0));

    const rows = stores.map((store, index) => {
      const isSelected = state.selectedStoreId === store.id;
      const perfPercent = maxScore > 0 ? ((store.compositeScore || 0) / maxScore * 100) : 0;
      const perfClass = store.percentile >= 75 ? 'high' : store.percentile >= 50 ? 'medium' : 'low';
      const globalIndex = pageInfo.start + index;

      return `
        <tr class="store-row ${isSelected ? 'selected' : ''}"
            data-store-id="${store.id}"
            onclick="selectStoreGridRow('${store.id}')">
          <td class="col-num">
            <span class="row-number">${globalIndex}</span>
          </td>
          <td class="col-store">
            <div class="store-name">
              <div class="store-logo">
                <img src="${store.logo}" alt="${core.escapeHtml(store.name)}" onerror="this.src='https://ui-avatars.com/api/?name=Store&background=6366F1&color=fff&size=40'">
              </div>
              <div class="store-info">
                <span class="store-label">${core.escapeHtml(store.name)}</span>
                <span class="store-sublabel">${core.escapeHtml(store.brandName || '')}</span>
              </div>
            </div>
          </td>
          <td class="col-views">${core.formatNumber(store.civ)}</td>
          <td class="col-clicks">${core.formatNumber(store.cc)}</td>
          <td class="col-added">${core.formatNumber(store.atl)}</td>
          <td class="col-perf">
            <div class="perf-chart-container">
              <div class="perf-chart" id="perf-chart-store-${store.id}"
                   data-name="${core.escapeHtml(store.name)}"
                   data-views="${store.civ || 0}"
                   data-clicks="${store.cc || 0}"
                   data-adds="${store.atl || 0}"
                   data-composite="${store.compositeScore || 0}">
              </div>
              <span class="perf-chart__value">${core.formatNumber(store.compositeScore)}</span>
            </div>
          </td>
          <td class="col-days">${store.daysRun || 7}</td>
          <td class="col-percentile">
            <div class="percentile-badge">
              <img src="assets/chart-bar.svg" alt="" class="percentile-badge__icon">
              <span class="percentile-badge__value percentile-badge__value--${perfClass}">${store.percentile}%</span>
            </div>
          </td>
          <td class="col-drill">
            <button type="button" class="drill-btn"
                    data-drill-to="category"
                    data-drill-id="${store.id}"
                    data-drill-name="${core.escapeHtml(store.name)}"
                    aria-label="Drill into categories for ${core.escapeHtml(store.name)}">
              <span class="material-symbols-outlined">arrow_forward</span>
            </button>
          </td>
        </tr>
      `;
    });

    const moreDataClass = state.moreDataEnabled ? 'more-data-enabled' : '';

    gridContainer.innerHTML = `
      <table class="store-grid-table data-table--sortable ${moreDataClass}">
        <thead id="store-table-head">
          <tr>
            <th class="col-num">#</th>
            ${getStoreSortableHeaderHTML('Store', 'name', 'col-store', 'text')}
            ${getStoreSortableHeaderHTML('Views', 'civ', 'col-views')}
            ${getStoreSortableHeaderHTML('Clicks', 'cc', 'col-clicks')}
            ${getStoreSortableHeaderHTML('Added', 'atl', 'col-added')}
            ${getStoreSortableHeaderHTML('Performance', 'compositeScore', 'col-perf')}
            ${getStoreSortableHeaderHTML('Days', 'daysRun', 'col-days')}
            ${getStoreSortableHeaderHTML('%tile', 'percentile', 'col-percentile')}
            <th class="col-drill" aria-label="Drill"></th>
          </tr>
        </thead>
        <tbody id="store-grid-body">
          ${rows.join('')}
        </tbody>
      </table>
    `;

    gridContainer.classList.toggle('more-data-enabled', state.moreDataEnabled);

    // Initialize performance charts
    if (typeof PerfCharts !== 'undefined') {
      const chartHeight = state.moreDataEnabled ? 12 : 16;
      PerfCharts.calculateMaxValues(allStores);
      PerfCharts.initAllCharts({ height: chartHeight, dataArray: allStores });
    }
  }

  /**
   * Sort stores array
   */
  function sortStores(stores, column, direction) {
    if (!column) return stores;

    return stores.sort((a, b) => {
      let aVal = a[column];
      let bVal = b[column];

      // Handle string comparison
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
        return direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      // Handle numeric comparison
      aVal = aVal || 0;
      bVal = bVal || 0;
      return direction === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }

  /**
   * Generate sortable header HTML for stores (matching grid-inquiry pattern)
   */
  function getStoreSortableHeaderHTML(label, column, cssClass = '', filterType = null) {
    const isActive = state.storeSortColumn === column;
    const direction = isActive ? state.storeSortDirection : null;
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
                 oninput="updateStoreFilterClearBtn(this)"
                 onchange="applyStoreFilter('${column}', this.value)"
                 onclick="event.stopPropagation()">
          <button class="th-filter-clear ${hasValue ? 'visible' : ''}"
                  onclick="clearStoreFilter('${column}'); event.stopPropagation();"
                  aria-label="Clear filter">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
      `;
    } else if (filterType === 'brand') {
      // Brand dropdown filter
      const brands = [...new Set(allStores.map(s => s.brandName).filter(Boolean))].sort();
      const currentValue = columnFilters.brandName || '';
      const options = ['<option value="">All</option>'].concat(
        brands.map(brand => `<option value="${core.escapeHtml(brand)}" ${brand === currentValue ? 'selected' : ''}>${core.escapeHtml(brand)}</option>`)
      ).join('');
      filterHTML = `
        <select class="th-filter-select"
                onchange="applyStoreFilter('brandName', this.value)"
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
          <div class="th-header header-sort" onclick="handleStoreColumnSort('${column}')">
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
   * Apply filter to store column
   */
  function applyStoreFilter(column, value) {
    columnFilters[column] = value || '';
    paginationState.currentPage = 1;
    renderStoreGrid();
    core.saveState();
  }

  /**
   * Clear filter for a store column
   */
  function clearStoreFilter(column) {
    columnFilters[column] = '';
    paginationState.currentPage = 1;
    renderStoreGrid();
    core.saveState();
  }

  /**
   * Update filter clear button visibility
   */
  function updateStoreFilterClearBtn(input) {
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
   * Apply column filters to stores array
   */
  function applyColumnFiltersToStores(stores) {
    let filtered = [...stores];

    // Name filter (text search)
    if (columnFilters.name) {
      const search = columnFilters.name.toLowerCase();
      filtered = filtered.filter(s => s.name.toLowerCase().includes(search));
    }

    // Brand filter (dropdown)
    if (columnFilters.brandName) {
      filtered = filtered.filter(s => s.brandName === columnFilters.brandName);
    }

    return filtered;
  }

  /**
   * Handle store column sort
   */
  function handleStoreColumnSort(column) {
    if (state.storeSortColumn === column) {
      state.storeSortDirection = state.storeSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      state.storeSortColumn = column;
      state.storeSortDirection = 'desc';
    }
    paginationState.currentPage = 1; // Reset to first page on sort
    renderStoreGrid();
    updatePaginationUI();
    core.saveState();
  }

  /**
   * Handle store row selection
   */
  function selectStoreGridRow(storeId) {
    state.selectedStoreId = storeId;
    state.activeStore = storeId;

    const rows = document.querySelectorAll('.store-row');
    rows.forEach(row => {
      row.classList.toggle('selected', row.dataset.storeId === storeId);
    });

    renderStoreDetail(storeId);

    const detailPanel = document.getElementById('store-detail-panel');
    if (detailPanel) {
      detailPanel.classList.remove('panel--collapsed');
      detailPanel.classList.add('panel--expanded');
    }

    core.saveState();
  }

  /**
   * Render store detail panel
   */
  function renderStoreDetail(storeId) {
    const detailContent = document.getElementById('store-detail-content');
    if (!detailContent) return;

    const store = allStores.find(s => s.id === storeId);
    if (!store) {
      detailContent.innerHTML = '<p>Store not found</p>';
      return;
    }

    const perfClass = store.percentile >= 75 ? 'high' : store.percentile >= 50 ? 'medium' : 'low';

    detailContent.innerHTML = `
      <div class="store-detail-header">
        <div class="store-detail-logo">
          <img src="${store.logo}" alt="${core.escapeHtml(store.name)}" onerror="this.src='https://ui-avatars.com/api/?name=Store&background=6366F1&color=fff&size=120'">
        </div>
        <h3 class="store-detail-name">${core.escapeHtml(store.name)}</h3>
        <div class="store-detail-address">
          <span class="material-symbols-outlined" style="font-size: 16px;">location_on</span>
          ${core.escapeHtml(store.address || 'Address not available')}
        </div>
        <div class="store-detail-brand">
          ${core.escapeHtml(store.brandName || '')} ${store.subBrandName ? '> ' + core.escapeHtml(store.subBrandName) : ''}
        </div>
      </div>

      <div class="store-detail-counts">
        <div class="store-count-item">
          <span class="material-symbols-outlined">category</span>
          <strong>${store.categoryCount || 0}</strong> Categories
        </div>
        <div class="store-count-item">
          <span class="material-symbols-outlined">local_offer</span>
          <strong>${store.promotionCount || 0}</strong> Promotions
        </div>
      </div>

      <div class="store-metrics">
        <div class="store-metric">
          <div class="store-metric__label">Views</div>
          <div class="store-metric__value">${core.formatNumber(store.civ)}</div>
        </div>
        <div class="store-metric">
          <div class="store-metric__label">Clicks</div>
          <div class="store-metric__value">${core.formatNumber(store.cc)}</div>
        </div>
        <div class="store-metric">
          <div class="store-metric__label">Added to List</div>
          <div class="store-metric__value">${core.formatNumber(store.atl)}</div>
        </div>
        <div class="store-metric">
          <div class="store-metric__label">Percentile</div>
          <div class="store-metric__value percentile-badge__value--${perfClass}">${store.percentile}%</div>
        </div>
      </div>
    `;
  }

  /**
   * Close store detail panel
   */
  function closeStoreDetail() {
    state.selectedStoreId = null;
    state.activeStore = null;

    const rows = document.querySelectorAll('.store-row');
    rows.forEach(row => row.classList.remove('selected'));

    const detailPanel = document.getElementById('store-detail-panel');
    if (detailPanel) {
      detailPanel.classList.add('panel--collapsed');
      detailPanel.classList.remove('panel--expanded');
    }

    core.saveState();
  }

  /**
   * Add store filter to state before navigation
   */
  function addStoreFilterToState() {
    const storeId = state.selectedStoreId;
    if (!storeId) return;

    // Remove existing store filter
    state.activeFilters = state.activeFilters.filter(f => f.type !== 'store');

    // Get store name
    const store = filteredStores.find(s => s.id === storeId) || allStores.find(s => s.id === storeId);
    const storeName = store ? store.name : storeId;

    // Add new store filter
    state.activeFilters.push({
      type: 'store',
      value: storeId,
      label: storeName,
      fromUrl: false
    });
  }

  /**
   * Set entity context to selected store for progressive disclosure
   */
  function setStoreEntityContext() {
    const storeId = state.selectedStoreId;
    if (!storeId) return;

    // Get store details
    const store = filteredStores.find(s => s.id === storeId) || allStores.find(s => s.id === storeId);
    const storeName = store ? store.name : storeId;

    // Update MockData entity context
    if (typeof MockData !== 'undefined') {
      MockData.setEntity(storeId, 'store', storeName);
    }

    // Save entity info to state for persistence across pages
    state.entityId = storeId;
    state.entityLevel = 'store';
    state.entityName = storeName;
  }

  /**
   * Navigate to categories view filtered by store
   */
  function viewStoreCategories() {
    if (!state.selectedStoreId) return;

    // Add store filter to state
    addStoreFilterToState();

    // Set entity context for progressive disclosure
    setStoreEntityContext();

    core.saveState();
    StateManager.navigateTo('engagement-categories.html', state, { storeId: state.selectedStoreId });
  }

  /**
   * Navigate to promotions view filtered by store
   */
  function viewStorePromotions() {
    if (!state.selectedStoreId) return;

    // Add store filter to state
    addStoreFilterToState();

    // Set entity context for progressive disclosure
    setStoreEntityContext();

    core.saveState();
    StateManager.navigateTo('engagement-promotions.html', state, { storeId: state.selectedStoreId });
  }

  /**
   * Navigate to grid inquiry filtered by store
   */
  function openStoreInquiry() {
    if (!state.selectedStoreId) return;

    // Add store filter to state
    addStoreFilterToState();

    // Set entity context for progressive disclosure
    setStoreEntityContext();

    core.saveState();
    // R2 (2026-05-06): data-grid sub-page dropped; route to canonical Explore surface.
    StateManager.navigateTo('engagement-grid.html', state, { storeId: state.selectedStoreId });
  }

  /**
   * Navigate to compare view for store
   */
  function compareStore() {
    if (!state.selectedStoreId) return;

    // Add store filter to state
    addStoreFilterToState();

    // Set entity context for progressive disclosure
    setStoreEntityContext();

    core.saveState();
    StateManager.navigateTo('engagement-compare.html', state, { storeId: state.selectedStoreId });
  }

  /**
   * Change TopN limit
   */
  function changeTopN(value) {
    paginationState.topN = value === 'all' ? 'all' : parseInt(value, 10);
    state.topN = paginationState.topN;
    paginationState.currentPage = 1;
    renderStoreGrid();
    updatePaginationUI();
    core.saveState();
  }

  /**
   * Change rows per page
   */
  function changeRowsPerPage(value) {
    paginationState.rowsPerPage = parseInt(value, 10);
    paginationState.currentPage = 1;
    renderStoreGrid();
    updatePaginationUI();
    core.saveState();
  }

  /**
   * Go to previous page
   */
  function prevPage() {
    if (paginationState.currentPage > 1) {
      paginationState.currentPage--;
      renderStoreGrid();
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
      renderStoreGrid();
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

  /**
   * Update counts display
   */
  function updateCounts() {
    const storeCount = document.getElementById('store-showing-count');
    if (storeCount) {
      const pageInfo = getPageData();
      storeCount.textContent = pageInfo.total;
    }
  }

  // Expose functions globally for onclick handlers
  window.selectStoreGridRow = selectStoreGridRow;
  window.closeStoreDetail = closeStoreDetail;
  window.viewStoreCategories = viewStoreCategories;
  window.viewStorePromotions = viewStorePromotions;
  window.openStoreInquiry = openStoreInquiry;
  window.compareStore = compareStore;
  window.handleStoreColumnSort = handleStoreColumnSort;
  window.changeTopN = changeTopN;
  window.changeRowsPerPage = changeRowsPerPage;
  window.prevPage = prevPage;
  window.nextPage = nextPage;
  // Filter functions
  window.applyStoreFilter = applyStoreFilter;
  window.clearStoreFilter = clearStoreFilter;
  window.updateStoreFilterClearBtn = updateStoreFilterClearBtn;

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
