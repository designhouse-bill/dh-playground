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
    }

    // Set active navigation state
    core.setActiveNavigation();

    // Initialize context
    core.initializeContext();

    // Load data
    await core.loadData();

    // Render initial view
    renderCategoryGrid();
    updateCounts();

    // Render filter chips
    if (window.DashboardFilters) {
      window.DashboardFilters.renderFilterChips();
    }

    // Bind events
    bindEvents();

    // Listen for data refresh events
    document.addEventListener('dashboard:dataRefresh', handleDataRefresh);
    document.addEventListener('dashboard:filterApply', handleFilterApply);

    console.log('[Categories] Page initialized');
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
   * Render the category data grid
   */
  function renderCategoryGrid() {
    const gridContainer = document.getElementById('category-data-grid');
    if (!gridContainer) return;

    let categories = state.filteredCategories.length > 0 || state.activeFilters.length > 0
      ? state.filteredCategories
      : state.categories;

    // Update showing count
    const showingCount = document.getElementById('category-showing-count');
    if (showingCount) {
      showingCount.textContent = categories ? categories.length : 0;
    }

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
    categories = core.sortCategories(categories, state.categorySortColumn, state.categorySortDirection);

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
              <span class="category-label">${core.escapeHtml(cat.name)}</span>
            </div>
          </td>
          <td class="col-views">${core.formatNumber(cat.civ)}</td>
          <td class="col-clicks">${core.formatNumber(cat.cc)}</td>
          <td class="col-added">${core.formatNumber(cat.atl)}</td>
          <td class="col-perf">
            <div class="perf-bar">
              <div class="perf-bar__track perf-bar__track--${perfClass}">
                <div class="perf-bar__fill perf-bar__fill--${perfClass}" style="width: ${perfPercent}%"></div>
              </div>
              <span class="perf-bar__value">${core.formatNumber(cat.compositeScore)}</span>
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

    gridContainer.classList.toggle('more-data-enabled', state.moreDataEnabled);
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
          <div class="th-header header-sort" onclick="handleCategoryColumnSort('${column}')">
            <span class="th-label">${label}</span>
            <span class="th-sort-icon material-symbols-outlined">${sortIcon}</span>
          </div>
        </div>
      </th>
    `;
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
   * Navigate to promotions view filtered by category
   */
  function viewCategoryPromotions(categoryId) {
    core.saveState();
    StateManager.navigateTo('base_promotions.html', state, { categoryId: categoryId });
  }

  /**
   * Navigate to grid inquiry filtered by category
   */
  function openCategoryInquiry(categoryId) {
    core.saveState();
    StateManager.navigateTo('grid-inquiry.html', state, { categoryId: categoryId });
  }

  /**
   * Navigate to compare view for category
   */
  function compareCategoryAction(categoryId) {
    core.saveState();
    StateManager.navigateTo('compare.html', state, { categoryId: categoryId });
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

  // Expose functions globally for onclick handlers
  window.selectCategoryGridRow = selectCategoryGridRow;
  window.closeCategoryDetail = closeCategoryDetail;
  window.viewCategoryPromotions = viewCategoryPromotions;
  window.openCategoryInquiry = openCategoryInquiry;
  window.compareCategoryAction = compareCategoryAction;
  window.handleCategoryColumnSort = handleCategoryColumnSort;

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
