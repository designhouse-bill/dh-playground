/**
 * Categories Feature JavaScript
 * Handles categories view initialization and data rendering
 */

(function() {
  'use strict';

  // DOM Elements
  let elements = {};

  /**
   * Initialize the categories feature
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

      console.log('Categories feature initialized');
    } catch (error) {
      console.error('Failed to initialize categories:', error);
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
      onDateSelect: openDatePicker,
      onEntitySelect: openEntitySelector,
      onFilterAdd: openFilterModal
    });

    // Set active state
    HeaderComponent.setActiveMode('base');
    HeaderComponent.setActiveView('categories');
  }

  /**
   * Cache DOM element references
   */
  function cacheElements() {
    elements = {
      categoryGrid: document.getElementById('category-data-grid'),
      detailPanel: document.getElementById('category-detail-panel'),
      detailContent: document.getElementById('category-detail-content'),
      closeDetailBtn: document.getElementById('close-detail-btn'),
      moreDataToggle: document.getElementById('more-data-toggle')
    };
  }

  /**
   * Bind event listeners
   */
  function bindEvents() {
    if (elements.closeDetailBtn) {
      elements.closeDetailBtn.addEventListener('click', closeDetailPanel);
    }

    if (elements.moreDataToggle) {
      elements.moreDataToggle.addEventListener('change', handleMoreDataToggle);
    }
  }

  /**
   * Load category data
   */
  async function loadData() {
    try {
      // Use existing DataService if available
      if (typeof DataService !== 'undefined') {
        const data = await DataService.getCategories();
        renderCategoryGrid(data);
      } else if (typeof MockData !== 'undefined') {
        renderCategoryGrid(MockData.categories);
      }
    } catch (error) {
      console.error('Failed to load category data:', error);
    }
  }

  /**
   * Render category grid
   */
  function renderCategoryGrid(categories) {
    if (!elements.categoryGrid) return;

    // TODO: Implement category grid rendering
    // This will reuse logic from app.js renderCategoryDataGrid()
    console.log('Rendering categories:', categories?.length || 0);
  }

  /**
   * Handle mode change (navigate to different page)
   */
  function handleModeChange(mode) {
    switch (mode) {
      case 'grid':
        window.location.href = '../grid/grid.html';
        break;
      case 'compare':
        // TODO: Implement compare view
        console.log('Compare mode not yet implemented');
        break;
    }
  }

  /**
   * Handle view change within base mode
   */
  function handleViewChange(view) {
    if (view === 'promotions') {
      window.location.href = '../promotions/promotions.html';
    }
  }

  /**
   * Open date picker modal
   */
  function openDatePicker() {
    // TODO: Implement date picker modal
    console.log('Open date picker');
  }

  /**
   * Open entity selector modal
   */
  function openEntitySelector() {
    // TODO: Implement entity selector modal
    console.log('Open entity selector');
  }

  /**
   * Open filter modal
   */
  function openFilterModal() {
    // TODO: Implement filter modal
    console.log('Open filter modal');
  }

  /**
   * Close detail panel
   */
  function closeDetailPanel() {
    if (elements.detailPanel) {
      elements.detailPanel.classList.add('panel--collapsed');
    }
    StateService.set('selectedCategoryId', null);
  }

  /**
   * Handle more data toggle
   */
  function handleMoreDataToggle(e) {
    const enabled = e.target.checked;
    StateService.set('moreDataEnabled', enabled);
    // Re-render grid with expanded columns
    loadData();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
