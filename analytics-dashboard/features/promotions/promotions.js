/**
 * Promotions Feature JavaScript
 * Handles promotions view initialization and data rendering
 */

(function() {
  'use strict';

  // DOM Elements
  let elements = {};

  // Local state
  let promoViewMode = 'table';

  /**
   * Initialize the promotions feature
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

      console.log('Promotions feature initialized');
    } catch (error) {
      console.error('Failed to initialize promotions:', error);
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
    HeaderComponent.setActiveView('promotions');
  }

  /**
   * Cache DOM element references
   */
  function cacheElements() {
    elements = {
      promotionGrid: document.getElementById('promotion-grid'),
      promotionTable: document.getElementById('promotion-table'),
      detailPanel: document.getElementById('detail-panel'),
      detailContent: document.getElementById('detail-content'),
      closeDetailBtn: document.getElementById('close-detail-btn'),
      cardViewToggle: document.getElementById('card-view-toggle')
    };
  }

  /**
   * Bind event listeners
   */
  function bindEvents() {
    if (elements.closeDetailBtn) {
      elements.closeDetailBtn.addEventListener('click', closeDetailPanel);
    }

    if (elements.cardViewToggle) {
      elements.cardViewToggle.addEventListener('change', handleCardViewToggle);
    }
  }

  /**
   * Load promotion data
   */
  async function loadData() {
    try {
      // Use existing DataService if available
      if (typeof DataService !== 'undefined') {
        const data = await DataService.getPromotions();
        renderPromotions(data);
      } else if (typeof MockData !== 'undefined') {
        renderPromotions(MockData.promotions);
      }
    } catch (error) {
      console.error('Failed to load promotion data:', error);
    }
  }

  /**
   * Render promotions
   */
  function renderPromotions(promotions) {
    if (promoViewMode === 'cards') {
      renderPromotionCards(promotions);
    } else {
      renderPromotionTable(promotions);
    }
  }

  /**
   * Render promotion cards
   */
  function renderPromotionCards(promotions) {
    if (!elements.promotionGrid) return;
    // TODO: Implement card rendering
    console.log('Rendering promotion cards:', promotions?.length || 0);
  }

  /**
   * Render promotion table
   */
  function renderPromotionTable(promotions) {
    if (!elements.promotionTable) return;
    // TODO: Implement table rendering
    console.log('Rendering promotion table:', promotions?.length || 0);
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
        console.log('Compare mode not yet implemented');
        break;
    }
  }

  /**
   * Handle view change within base mode
   */
  function handleViewChange(view) {
    if (view === 'categories') {
      window.location.href = '../categories/categories.html';
    }
  }

  /**
   * Open date picker modal
   */
  function openDatePicker() {
    console.log('Open date picker');
  }

  /**
   * Open entity selector modal
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
   * Close detail panel
   */
  function closeDetailPanel() {
    if (elements.detailPanel) {
      elements.detailPanel.classList.add('panel--collapsed');
    }
    StateService.set('activePromotion', null);
  }

  /**
   * Handle card view toggle
   */
  function handleCardViewToggle(e) {
    promoViewMode = e.target.checked ? 'cards' : 'table';
    StateService.set('promoViewMode', promoViewMode);

    // Toggle visibility
    if (elements.promotionGrid && elements.promotionTable) {
      elements.promotionGrid.style.display = promoViewMode === 'cards' ? '' : 'none';
      elements.promotionTable.style.display = promoViewMode === 'table' ? '' : 'none';
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
