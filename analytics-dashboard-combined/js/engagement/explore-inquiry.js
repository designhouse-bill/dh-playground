/**
 * GRID INQUIRY - Data Grid View for Analytics Dashboard
 * Page-specific logic for engagement-explore.html
 */

(function() {
  'use strict';

  // Grid column configuration - matches BASE mode styling
  // Includes all promotion fields available in the aggregated data
  const GRID_COLUMNS = [
    { key: 'index', label: '#', type: 'index', sortable: false, sticky: false, visible: true },
    { key: 'name', label: 'Promotion', type: 'promotion', sortable: true, sticky: true, visible: true, filterable: true, filterType: 'text' },
    { key: 'categoryName', label: 'Category', type: 'category', sortable: true, sticky: false, visible: true, filterable: true, filterType: 'category' },
    { key: 'dealType', label: 'Deal', type: 'deal', sortable: true, sticky: false, visible: true, filterable: true, filterType: 'deal' },
    { key: 'daysRun', label: 'Days', type: 'days', sortable: true, sticky: false, visible: true, filterable: true, filterType: 'days' },
    { key: 'originalPosition', label: 'Orig. Pos.', type: 'position', sortable: true, sticky: false, visible: false },
    { key: 'civ', label: 'Views', type: 'number', sortable: true, sticky: false, visible: true },
    { key: 'cc', label: 'Clicks', type: 'number', sortable: true, sticky: false, visible: true },
    { key: 'atl', label: 'Added', type: 'number', sortable: true, sticky: false, visible: true },
    { key: 'totalScore', label: 'Performance', type: 'performance', sortable: true, sticky: false, visible: true },
    { key: 'percentile', label: '%ile', type: 'percentile', sortable: true, sticky: false, visible: true },
    // Additional promotion fields (hidden by default)
    { key: 'unit', label: 'Unit', type: 'text', sortable: true, sticky: false, visible: false },
    { key: 'originalPrice', label: 'Original Price', type: 'currency', sortable: true, sticky: false, visible: false },
    { key: 'salePrice', label: 'Sale Price', type: 'currency', sortable: true, sticky: false, visible: false },
    { key: 'cardSize', label: 'Card Size', type: 'text', sortable: true, sticky: false, visible: false },
    { key: 'storeCount', label: 'Store Count', type: 'number', sortable: true, sticky: false, visible: false },
    // Promotion ID (for advanced users)
    { key: 'id', label: 'Promotion ID', type: 'text', sortable: true, sticky: false, visible: false }
  ];

  // References to shared modules
  let core = null;
  let state = null;
  let elements = null;

  /**
   * Initialize the grid inquiry page
   */
  async function init() {
    // Initialize core module
    core = window.DashboardCore;
    elements = core.initElements();
    state = core.getState();

    // Restore state from localStorage/URL
    core.restoreState();

    // Initialize grid columns
    initGridColumns();

    // Clear stale column filters if no URL parameters are present
    // This prevents showing "No records found" from previous sessions
    const urlParams = StateManager.parseUrlParams();
    const hasUrlFilters = urlParams.categoryId || urlParams.promotionId || urlParams.days;
    if (!hasUrlFilters) {
      // Reset column filters to clean slate
      state.gridMode.columnFilters = {};
      // Also clear related activeFilters that came from grid columns
      state.activeFilters = (state.activeFilters || []).filter(f => !f.fromColumn);
    }

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
        renderGridTable: renderGridTable,
        updateCounts: () => {}
      });
    }

    // Set app mode to grid
    state.appMode = 'grid';

    // Set active navigation state
    core.setActiveNavigation();

    // Initialize context
    core.initializeContext();

    // Load data
    await core.loadData();

    // Handle URL filters
    handleUrlFilters();

    // Render initial view
    renderGridTable();
    renderGridColumnsDropdown();

    // Render filter chips
    if (window.DashboardFilters) {
      window.DashboardFilters.renderFilterChips();
    }

    // Bind events
    bindEvents();

    // Listen for data refresh events
    document.addEventListener('dashboard:dataRefresh', handleDataRefresh);
    document.addEventListener('dashboard:filterApply', handleFilterApply);

    console.log('[Grid Inquiry] Page initialized');
  }

  /**
   * Initialize visible columns
   */
  function initGridColumns() {
    if (!state.gridMode.visibleColumns || state.gridMode.visibleColumns.length === 0) {
      state.gridMode.visibleColumns = GRID_COLUMNS
        .filter(col => col.visible)
        .map(col => col.key);
    }
  }

  /**
   * Handle URL filter parameters
   */
  function handleUrlFilters() {
    const urlParams = StateManager.parseUrlParams();

    if (urlParams.categoryId) {
      const category = state.categories.find(c => c.id === urlParams.categoryId);
      if (category) {
        state.gridMode.columnFilters.categoryName = category.name;
        // Also add to activeFilters for filter chip display
        if (!state.activeFilters.some(f => f.type === 'category')) {
          state.activeFilters.push({ type: 'category', label: 'Category', value: category.name, id: category.id });
        }
      }
    }

    if (urlParams.promotionId) {
      const promo = state.allPromotions.find(p => p.id === urlParams.promotionId);
      if (promo) {
        state.gridMode.columnFilters.name = promo.name;
        // Also add to activeFilters for filter chip display
        if (!state.activeFilters.some(f => f.type === 'promotion')) {
          state.activeFilters.push({ type: 'promotion', label: 'Promotion', value: promo.name, id: promo.id });
        }
        // Also set category filter if the promotion has a category
        if (promo.categoryName && !state.gridMode.columnFilters.categoryName) {
          state.gridMode.columnFilters.categoryName = promo.categoryName;
          if (!state.activeFilters.some(f => f.type === 'category')) {
            state.activeFilters.push({ type: 'category', label: 'Category', value: promo.categoryName });
          }
        }
      }
    }
  }

  /**
   * Bind page-specific events
   */
  function bindEvents() {
    // Columns dropdown toggle
    const columnsBtn = document.getElementById('grid-columns-btn');
    if (columnsBtn) {
      columnsBtn.addEventListener('click', toggleColumnsDropdown);
    }

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.grid-columns-toggle')) {
        const dropdown = document.getElementById('grid-columns-dropdown');
        if (dropdown) dropdown.classList.remove('open');
      }
    });

    // Save state on navigation clicks
    document.querySelectorAll('.mode-btn, .subtab').forEach(link => {
      link.addEventListener('click', () => {
        core.saveState();
      });
    });
  }

  /**
   * Handle data refresh events
   */
  function handleDataRefresh(event) {
    state.gridMode.currentPage = 1;
    renderGridTable();
  }

  /**
   * Handle filter apply events
   */
  function handleFilterApply(event) {
    state.gridMode.currentPage = 1;
    if (window.DashboardFilters) {
      window.DashboardFilters.renderFilterChips();
    }
    renderGridTable();
  }

  /**
   * Get visible columns
   */
  function getVisibleGridColumns() {
    return GRID_COLUMNS.filter(col =>
      state.gridMode.visibleColumns.includes(col.key)
    );
  }

  /**
   * Get filtered and sorted grid data
   */
  function getGridData() {
    let data = [...state.filteredPromotions];

    // Apply column filters
    const filters = state.gridMode.columnFilters || {};
    Object.keys(filters).forEach(key => {
      const filterValue = filters[key];
      if (filterValue === null || filterValue === '' || filterValue === undefined) return;

      const col = GRID_COLUMNS.find(c => c.key === key);
      if (!col) return;

      data = data.filter(item => {
        const value = item[key];
        if (value == null) return false;

        if (col.type === 'text' || col.type === 'promotion') {
          return String(value).toLowerCase().includes(filterValue.toLowerCase());
        } else if (col.type === 'category' || col.type === 'deal') {
          return value === filterValue;
        } else if (col.type === 'days') {
          // Filter by exact days value (e.g., 7, 3, 1)
          return parseInt(value) === parseInt(filterValue);
        } else if (col.type === 'number' || col.type === 'currency') {
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

          if (aVal == null) return 1;
          if (bVal == null) return -1;

          if (col.type === 'number' || col.type === 'currency' || col.type === 'performance' || col.type === 'days' || col.type === 'position') {
            aVal = parseFloat(aVal) || 0;
            bVal = parseFloat(bVal) || 0;
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
   * Get paginated data
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
   * Render the grid table
   */
  function renderGridTable() {
    const tableHead = document.getElementById('grid-table-head');
    const tableBody = document.getElementById('grid-table-body');
    if (!tableHead || !tableBody) return;

    const columns = getVisibleGridColumns();
    const { data, total, start, end, totalPages } = getGridPageData();

    // Render header
    tableHead.innerHTML = `<tr>${columns.map(col => renderGridHeaderCell(col)).join('')}</tr>`;

    // Calculate max score for performance bars
    const maxScore = Math.max(...data.map(p => p.totalScore || 0), 1);

    // Render body
    if (data.length === 0) {
      tableBody.innerHTML = `
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
      tableBody.innerHTML = data.map((promo, index) => `
        <tr data-promo-id="${promo.id}">
          ${columns.map(col => renderGridCell(promo, col, maxScore, start + index)).join('')}
        </tr>
      `).join('');
    }

    updateGridPagination(total, start, end, totalPages);

    // Initialize performance charts after DOM is updated
    if (window.PerfCharts && data.length > 0) {
      // Calculate max values for chart scaling
      PerfCharts.calculateMaxValues(data);
      PerfCharts.initAllCharts({ height: 16, dataArray: data });
    }
  }

  /**
   * Render a header cell
   */
  function renderGridHeaderCell(col) {
    const isActive = state.gridMode.sortColumn === col.key;
    const direction = isActive ? state.gridMode.sortDirection : null;
    const sortIcon = direction === 'asc' ? 'arrow_upward' : direction === 'desc' ? 'arrow_downward' : 'unfold_more';
    const activeClass = isActive ? 'th-sort--active' : '';
    const stickyClass = col.sticky ? 'col-sticky' : '';
    const typeClass = col.type === 'number' ? 'col-number' : col.type === 'currency' ? 'col-currency' : col.type === 'performance' ? 'col-perf' : col.type === 'days' ? 'col-days' : '';

    let filterHTML = '';
    if (col.type === 'promotion' || col.type === 'text') {
      const currentValue = state.gridMode.columnFilters[col.key] || '';
      const hasValue = currentValue.length > 0;
      filterHTML = `
        <div class="th-filter-wrapper">
          <input type="text" class="th-filter-input ${hasValue ? 'has-value' : ''}" placeholder="Filter..."
                 value="${core.escapeHtml(currentValue)}"
                 oninput="updateFilterClearBtn(this)"
                 onchange="applyGridFilter('${col.key}', this.value)"
                 onclick="event.stopPropagation()">
          <button class="th-filter-clear ${hasValue ? 'visible' : ''}" onclick="clearGridFilter('${col.key}'); event.stopPropagation();" aria-label="Clear filter">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
      `;
    } else if (col.type === 'category') {
      const categories = core.getUniqueCategories();
      const currentValue = state.gridMode.columnFilters[col.key] || '';
      const options = ['<option value="">All</option>'].concat(
        categories.map(cat => `<option value="${core.escapeHtml(cat)}" ${cat === currentValue ? 'selected' : ''}>${core.escapeHtml(cat)}</option>`)
      ).join('');
      filterHTML = `
        <select class="th-filter-select" onchange="applyGridFilter('${col.key}', this.value)" onclick="event.stopPropagation()">
          ${options}
        </select>
      `;
    } else if (col.type === 'deal') {
      const dealTypes = core.getUniqueDealTypes();
      const currentValue = state.gridMode.columnFilters[col.key] || '';
      const options = ['<option value="">All</option>'].concat(
        dealTypes.map(dt => `<option value="${core.escapeHtml(dt)}" ${dt === currentValue ? 'selected' : ''}>${core.escapeHtml(dt)}</option>`)
      ).join('');
      filterHTML = `
        <select class="th-filter-select" onchange="applyGridFilter('${col.key}', this.value)" onclick="event.stopPropagation()">
          ${options}
        </select>
      `;
    } else if (col.type === 'days') {
      const currentValue = state.gridMode.columnFilters[col.key] || '';
      const daysOptions = [
        { value: '', label: 'All Days' },
        { value: '7', label: '7 Days' },
        { value: '3', label: '3 Days' },
        { value: '1', label: '1 Day' }
      ];
      const options = daysOptions.map(opt =>
        `<option value="${opt.value}" ${opt.value === currentValue ? 'selected' : ''}>${opt.label}</option>`
      ).join('');
      filterHTML = `
        <select class="th-filter-select days-filter" id="daysFilter" onchange="applyDaysFilter('${col.key}', this.value)" onclick="event.stopPropagation()">
          ${options}
        </select>
      `;
    }

    return `
      <th class="th-sortable ${activeClass} ${stickyClass} ${typeClass}" data-column="${col.key}">
        <div class="th-content">
          <div class="th-header header-sort" onclick="sortGridColumn('${col.key}')">
            <span class="th-label">${col.label}</span>
            <span class="th-sort-icon material-symbols-outlined">${sortIcon}</span>
          </div>
          ${filterHTML}
        </div>
      </th>
    `;
  }

  /**
   * Render a grid cell
   */
  function renderGridCell(promo, col, maxScore, rowIndex) {
    const value = promo[col.key];
    let displayValue = '';
    let cellClass = col.sticky ? 'col-sticky' : '';

    switch (col.type) {
      case 'index':
        cellClass += ' col-num';
        displayValue = `<div class="table-position">${rowIndex}</div>`;
        break;
      case 'promotion':
        cellClass += ' col-promotion';
        const thumbHtml = promo.thumbImage
          ? `<img class="table-thumb" src="${promo.thumbImage}" alt="${core.escapeHtml(promo.name)}" loading="lazy">`
          : '';
        // Generate variants badge HTML if this is a parent with children
        const variantsBadge = promo.isParent && promo.childCount > 0
          ? `<span class="variants-badge"><span class="variants-count">${promo.childCount}</span> variant${promo.childCount !== 1 ? 's' : ''}</span>`
          : '';
        displayValue = `<div class="table-promo">${thumbHtml}<div class="table-info"><div class="table-title">${core.escapeHtml(promo.name)}</div>${variantsBadge}</div></div>`;
        break;
      case 'currency':
        displayValue = value != null ? `$${core.formatNumber(value)}` : '-';
        cellClass += ' col-currency';
        break;
      case 'number':
        displayValue = value != null ? core.formatNumber(value) : '-';
        cellClass += ' table-metric';
        break;
      case 'deal':
        displayValue = value ? `<span class="table-deal">${core.escapeHtml(value)}</span>` : '-';
        break;
      case 'category':
        displayValue = value ? `<span class="table-category">${core.escapeHtml(value)}</span>` : '-';
        break;
      case 'days':
        displayValue = value != null ? value : '-';
        cellClass += ' col-days';
        break;
      case 'position':
        displayValue = value != null ? value : '-';
        cellClass += ' col-position';
        break;
      case 'percentile':
        cellClass += ' col-percentile';
        displayValue = core.getPercentileBadgeHTML ? core.getPercentileBadgeHTML(value) : `${value}%`;
        break;
      case 'performance':
        cellClass += ' col-perf table-performance';
        const chartId = `perf-chart-grid-${promo.id}`;
        // Show points total (views×1 + clicks×5 + adds×20), not raw interaction count.
        const pointsTotal = (promo.civ || 0) * 1 + (promo.cc || 0) * 5 + (promo.atl || 0) * 20;
        displayValue = `
          <div class="perf-chart-container">
            <div class="perf-chart" id="${chartId}"
                 data-name="${core.escapeHtml(promo.name || '')}"
                 data-views="${promo.civ || 0}"
                 data-clicks="${promo.cc || 0}"
                 data-adds="${promo.atl || 0}"
                 data-composite="${promo.totalScore || 0}">
            </div>
            <span class="perf-chart__value">${core.formatNumber(pointsTotal)}</span>
          </div>
        `;
        break;
      default:
        displayValue = value != null ? core.escapeHtml(String(value)) : '-';
    }

    return `<td class="${cellClass}">${displayValue}</td>`;
  }

  /**
   * Update pagination controls
   */
  function updateGridPagination(total, start, end, totalPages) {
    const recordCount = document.getElementById('grid-record-count');
    const pageInfo = document.getElementById('grid-page-info');
    const rangeInfo = document.getElementById('grid-range-info');
    const prevBtn = document.getElementById('grid-prev-btn');
    const nextBtn = document.getElementById('grid-next-btn');

    if (recordCount) recordCount.textContent = core.formatNumber(total);
    if (pageInfo) pageInfo.textContent = `Page ${state.gridMode.currentPage} of ${totalPages || 1}`;
    if (rangeInfo) rangeInfo.textContent = total > 0 ? `${start}-${end} of ${total}` : '0 of 0';
    if (prevBtn) prevBtn.disabled = state.gridMode.currentPage <= 1;
    if (nextBtn) nextBtn.disabled = state.gridMode.currentPage >= totalPages;
  }

  /**
   * Render columns dropdown
   */
  function renderGridColumnsDropdown() {
    const list = document.getElementById('grid-columns-list');
    if (!list) return;

    const html = GRID_COLUMNS.map(col => {
      const isVisible = state.gridMode.visibleColumns.includes(col.key);
      const isDisabled = col.sticky;
      return `
        <label class="grid-column-item ${isDisabled ? 'disabled' : ''}">
          <input type="checkbox" ${isVisible ? 'checked' : ''} ${isDisabled ? 'disabled' : ''}
                 onchange="toggleGridColumn('${col.key}', this.checked)">
          <span>${col.label}</span>
        </label>
      `;
    }).join('');

    list.innerHTML = html;
  }

  /**
   * Toggle columns dropdown
   */
  function toggleColumnsDropdown() {
    const dropdown = document.getElementById('grid-columns-dropdown');
    if (dropdown) dropdown.classList.toggle('open');
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
    core.saveState();
  }

  /**
   * Reset columns to default
   */
  function resetGridColumns() {
    state.gridMode.visibleColumns = GRID_COLUMNS
      .filter(col => col.visible)
      .map(col => col.key);
    renderGridColumnsDropdown();
    renderGridTable();
    core.saveState();
  }

  /**
   * Sort by column
   */
  function sortGridColumn(key) {
    if (state.gridMode.sortColumn === key) {
      state.gridMode.sortDirection = state.gridMode.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      state.gridMode.sortColumn = key;
      state.gridMode.sortDirection = 'desc';
    }
    renderGridTable();
    core.saveState();
  }

  /**
   * Apply grid filter
   */
  function applyGridFilter(columnKey, value) {
    if (!state.gridMode.columnFilters) {
      state.gridMode.columnFilters = {};
    }
    state.gridMode.columnFilters[columnKey] = value || null;
    state.gridMode.currentPage = 1;
    renderGridTable();
    core.saveState();
  }

  /**
   * Apply days filter with chip integration
   */
  function applyDaysFilter(columnKey, value) {
    if (!state.gridMode.columnFilters) {
      state.gridMode.columnFilters = {};
    }
    state.gridMode.columnFilters[columnKey] = value || null;
    state.gridMode.currentPage = 1;

    // Update filter chips through DashboardFilters
    if (window.DashboardFilters) {
      // Remove existing days filter first
      state.activeFilters = state.activeFilters.filter(f => f.type !== 'days');

      // Add new days filter chip if not "All Days"
      if (value && value !== '') {
        const labelMap = { '7': '7', '3': '3', '1': '1' };
        state.activeFilters.push({
          type: 'days',
          value: value,
          label: 'Days',
          fromColumn: true
        });
      }

      window.DashboardFilters.renderFilterChips();
    }

    renderGridTable();
    core.saveState();
  }

  /**
   * Clear days filter (called when chip is removed)
   */
  function clearDaysFilter() {
    if (state.gridMode.columnFilters) {
      state.gridMode.columnFilters.daysRun = null;
    }
    state.gridMode.currentPage = 1;

    // Reset the dropdown to "All Days"
    const daysDropdown = document.getElementById('daysFilter');
    if (daysDropdown) {
      daysDropdown.value = '';
    }

    renderGridTable();
    core.saveState();
  }

  /**
   * Clear grid filter for a column
   */
  function clearGridFilter(columnKey) {
    if (state.gridMode.columnFilters) {
      state.gridMode.columnFilters[columnKey] = null;
    }
    state.gridMode.currentPage = 1;
    renderGridTable();
    core.saveState();
  }

  /**
   * Update filter clear button visibility based on input value
   */
  function updateFilterClearBtn(input) {
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
   * Previous page
   */
  function gridPrevPage() {
    if (state.gridMode.currentPage > 1) {
      state.gridMode.currentPage--;
      renderGridTable();
      core.saveState();
    }
  }

  /**
   * Next page
   */
  function gridNextPage() {
    const { totalPages } = getGridPageData();
    if (state.gridMode.currentPage < totalPages) {
      state.gridMode.currentPage++;
      renderGridTable();
      core.saveState();
    }
  }

  /**
   * Change rows per page
   */
  function changeGridRowsPerPage(value) {
    state.gridMode.rowsPerPage = parseInt(value) || 25;
    state.gridMode.currentPage = 1;
    renderGridTable();
    core.saveState();
  }

  /**
   * Export grid data to CSV
   * Includes: Promotion, Category, Views, Clicks, Adds, Days, Start Date, End Date, Performance, Percentile
   */
  function exportGridToCSV() {
    const data = getGridData();

    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    // CSV headers
    const headers = [
      'Promotion',
      'Category',
      'Views',
      'Clicks',
      'Adds',
      'Days',
      'Original Position',
      'Start Date',
      'End Date',
      'Performance',
      'Percentile'
    ];

    // Build CSV rows
    const rows = data.map(promo => {
      return [
        `"${(promo.name || '').replace(/"/g, '""')}"`,
        `"${(promo.categoryName || '').replace(/"/g, '""')}"`,
        promo.civ || 0,
        promo.cc || 0,
        promo.atl || 0,
        promo.daysRun || 7,
        promo.originalPosition || '',
        promo.startDate || '',
        promo.endDate || '',
        promo.totalScore || 0,
        promo.percentile || 0
      ].join(',');
    });

    // Combine headers and rows
    const csvContent = [headers.join(','), ...rows].join('\n');

    // Create blob and download
    const BOM = '\uFEFF'; // UTF-8 BOM for Excel compatibility
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

    // Generate filename with date
    const now = new Date();
    const dateString = now.toISOString().split('T')[0];
    const filename = `promotions_export_${dateString}.csv`;

    // Create download link
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log(`[Grid Inquiry] CSV exported: ${data.length} records to ${filename}`);
    } else {
      alert('Your browser does not support file downloads');
    }
  }

  // Expose functions globally for onclick handlers
  window.sortGridColumn = sortGridColumn;
  window.applyGridFilter = applyGridFilter;
  window.applyDaysFilter = applyDaysFilter;
  window.clearDaysFilter = clearDaysFilter;
  window.clearGridFilter = clearGridFilter;
  window.updateFilterClearBtn = updateFilterClearBtn;
  window.toggleGridColumn = toggleGridColumn;
  window.resetGridColumns = resetGridColumns;
  window.gridPrevPage = gridPrevPage;
  window.gridNextPage = gridNextPage;
  window.changeGridRowsPerPage = changeGridRowsPerPage;
  window.exportGridToCSV = exportGridToCSV;

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
