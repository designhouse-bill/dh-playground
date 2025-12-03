/**
 * COMPARE - Comparison View for Analytics Dashboard
 * Page-specific logic for compare.html
 *
 * This is a placeholder for the compare functionality.
 * Full implementation will include side-by-side comparison of:
 * - Promotions
 * - Categories
 * - Time periods (week over week)
 */

(function() {
  'use strict';

  // References to shared modules
  let core = null;
  let state = null;
  let elements = null;

  /**
   * Initialize the compare page
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

    // Initialize filters
    if (window.DashboardFilters) {
      window.DashboardFilters.init(core);
      window.DashboardFilters.setRenderCallbacks({
        renderCategories: () => {},
        renderPromotions: () => {},
        renderCategoryGrid: () => {},
        updateCounts: () => {}
      });
    }

    // Set app mode to compare
    state.appMode = 'compare';

    // Set active navigation state
    core.setActiveNavigation();

    // Initialize context
    core.initializeContext();

    // Load data
    await core.loadData();

    // Handle URL parameters
    handleUrlParams();

    // Render filter chips
    if (window.DashboardFilters) {
      window.DashboardFilters.renderFilterChips();
    }

    // Bind events
    bindEvents();

    console.log('[Compare] Page initialized');
  }

  /**
   * Handle URL parameters for pre-selection
   */
  function handleUrlParams() {
    const urlParams = StateManager.parseUrlParams();
    const infoContainer = document.getElementById('compare-info');

    if (!infoContainer) return;

    if (urlParams.categoryId) {
      const category = state.categories.find(c => c.id === urlParams.categoryId);
      if (category) {
        infoContainer.innerHTML = `
          <div class="compare-selected-item">
            <span class="material-symbols-outlined">category</span>
            <div>
              <strong>Selected Category:</strong> ${core.escapeHtml(category.name)}
              <br><small>Select another category to compare</small>
            </div>
          </div>
        `;
      }
    } else if (urlParams.promotionId) {
      const promo = state.allPromotions.find(p => p.id === urlParams.promotionId);
      if (promo) {
        infoContainer.innerHTML = `
          <div class="compare-selected-item">
            <span class="material-symbols-outlined">local_offer</span>
            <div>
              <strong>Selected Promotion:</strong> ${core.escapeHtml(promo.name)}
              <br><small>Select another promotion to compare</small>
            </div>
          </div>
        `;
      }
    }
  }

  /**
   * Bind page-specific events
   */
  function bindEvents() {
    // Save state on navigation clicks
    document.querySelectorAll('.mode-btn, .subtab').forEach(link => {
      link.addEventListener('click', () => {
        core.saveState();
      });
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
