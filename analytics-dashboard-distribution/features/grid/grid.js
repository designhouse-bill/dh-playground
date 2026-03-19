/**
 * Grid Feature JavaScript
 * Handles grid inquiry view with full data table
 */

(function() {
  'use strict';

  // DOM Elements
  let elements = {};

  // Grid state
  let gridState = {
    currentPage: 1,
    rowsPerPage: 25,
    totalRecords: 0,
    sortColumn: null,
    sortDirection: 'asc',
    columnsDropdownOpen: false
  };

  /**
   * Initialize the grid feature
   */
  async function init() {
    try {
      // Load header component
      await loadHeader();

      // Cache DOM elements
      cacheElements();

      // Bind events
      bindEvents();

      // Load data
      await loadData();

      console.log('Grid feature initialized');
    } catch (error) {
      console.error('Failed to initialize grid:', error);
    }
  }

  /**
   * Load the header component
   */
  async function loadHeader() {
    const container = document.getElementById('header-container');
    await ComponentLoader.loadHTML('../../components/header/header.html', container);

    // Initialize header component
    HeaderComponent.init({
      onModeChange: handleModeChange,
      onViewChange: handleViewChange,
      onDashboardChange: handleDashboardChange,
      onDateSelect: openDatePicker,
      onEntitySelect: openEntitySelector,
      onFilterAdd: openFilterModal
    });

    // Set active state
    HeaderComponent.setActiveDashboard('engagement');
    HeaderComponent.setActiveMode('grid');
  }

  /**
   * Cache DOM element references
   */
  function cacheElements() {
    elements = {
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
      resetColumnsBtn: document.getElementById('reset-columns-btn')
    };
  }

  /**
   * Bind event listeners
   */
  function bindEvents() {
    if (elements.gridColumnsBtn) {
      elements.gridColumnsBtn.addEventListener('click', toggleColumnsDropdown);
    }

    if (elements.gridRowsSelect) {
      elements.gridRowsSelect.addEventListener('change', handleRowsPerPageChange);
    }

    if (elements.gridPrevBtn) {
      elements.gridPrevBtn.addEventListener('click', prevPage);
    }

    if (elements.gridNextBtn) {
      elements.gridNextBtn.addEventListener('click', nextPage);
    }

    if (elements.resetColumnsBtn) {
      elements.resetColumnsBtn.addEventListener('click', resetColumns);
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.grid-columns-toggle')) {
        closeColumnsDropdown();
      }
    });
  }

  /**
   * Load grid data
   */
  async function loadData() {
    try {
      let promotions = [];

      if (typeof DataService !== 'undefined') {
        promotions = await DataService.getPromotions();
      } else if (typeof MockData !== 'undefined') {
        promotions = MockData.promotions;
      }

      gridState.totalRecords = promotions.length;
      updateRecordCount();
      renderGrid(promotions);
    } catch (error) {
      console.error('Failed to load grid data:', error);
    }
  }

  /**
   * Render grid table
   */
  function renderGrid(data) {
    // TODO: Implement full grid rendering with all columns
    console.log('Rendering grid with', data?.length || 0, 'records');
    updatePagination();
  }

  /**
   * Handle mode change
   */
  function handleDashboardChange(dashboard) {
    if (dashboard === 'distribution') {
      window.location.href = '../distribution/distribution.html';
    }
  }

  function handleModeChange(mode) {
    if (mode === 'base') {
      const viewMode = StateService.get('viewMode') || 'categories';
      window.location.href = `../${viewMode}/${viewMode}.html`;
    }
  }

  /**
   * Handle view change
   */
  function handleViewChange(view) {
    window.location.href = `../${view}/${view}.html`;
  }

  /**
   * Open date picker
   */
  function openDatePicker() {
    console.log('Open date picker');
  }

  /**
   * Open entity selector
   */
  function openEntitySelector() {
    console.log('Open entity selector');
  }

  /**
   * Open filter modal
   */
  function openFilterModal() {
    console.log('Open filter modal');
  }

  /**
   * Toggle columns dropdown
   */
  function toggleColumnsDropdown() {
    gridState.columnsDropdownOpen = !gridState.columnsDropdownOpen;
    if (elements.gridColumnsDropdown) {
      elements.gridColumnsDropdown.classList.toggle('active', gridState.columnsDropdownOpen);
    }
  }

  /**
   * Close columns dropdown
   */
  function closeColumnsDropdown() {
    gridState.columnsDropdownOpen = false;
    if (elements.gridColumnsDropdown) {
      elements.gridColumnsDropdown.classList.remove('active');
    }
  }

  /**
   * Handle rows per page change
   */
  function handleRowsPerPageChange(e) {
    gridState.rowsPerPage = parseInt(e.target.value, 10);
    gridState.currentPage = 1;
    loadData();
  }

  /**
   * Go to previous page
   */
  function prevPage() {
    if (gridState.currentPage > 1) {
      gridState.currentPage--;
      loadData();
    }
  }

  /**
   * Go to next page
   */
  function nextPage() {
    const totalPages = Math.ceil(gridState.totalRecords / gridState.rowsPerPage);
    if (gridState.currentPage < totalPages) {
      gridState.currentPage++;
      loadData();
    }
  }

  /**
   * Reset column visibility
   */
  function resetColumns() {
    // TODO: Implement column reset
    console.log('Reset columns');
  }

  /**
   * Update record count display
   */
  function updateRecordCount() {
    if (elements.gridRecordCount) {
      elements.gridRecordCount.textContent = Formatters.formatNumber(gridState.totalRecords);
    }
  }

  /**
   * Update pagination controls
   */
  function updatePagination() {
    const totalPages = Math.ceil(gridState.totalRecords / gridState.rowsPerPage);
    const start = (gridState.currentPage - 1) * gridState.rowsPerPage + 1;
    const end = Math.min(gridState.currentPage * gridState.rowsPerPage, gridState.totalRecords);

    if (elements.gridPageInfo) {
      elements.gridPageInfo.textContent = `Page ${gridState.currentPage} of ${totalPages}`;
    }

    if (elements.gridRangeInfo) {
      elements.gridRangeInfo.textContent = `${start}-${end} of ${gridState.totalRecords}`;
    }

    if (elements.gridPrevBtn) {
      elements.gridPrevBtn.disabled = gridState.currentPage <= 1;
    }

    if (elements.gridNextBtn) {
      elements.gridNextBtn.disabled = gridState.currentPage >= totalPages;
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
