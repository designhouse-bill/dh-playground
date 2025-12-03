/**
 * STATE MANAGER - localStorage Persistence Layer
 * Analytics Dashboard Multi-Page Architecture
 *
 * Provides persistent state across page navigation and browser refresh.
 * Handles URL parameter parsing and state merging.
 */

const StateManager = (() => {
  'use strict';

  const STATE_KEY = 'analytics_dashboard_state';
  const DEBUG = window.location.hostname === 'localhost';

  /**
   * Log debug messages
   */
  function log(...args) {
    if (DEBUG) {
      console.log('[StateManager]', ...args);
    }
  }

  /**
   * Get the current page identifier from URL
   * @returns {string} Page identifier (e.g., 'base_categories', 'grid-inquiry')
   */
  function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop().replace('.html', '');
    return filename || 'index';
  }

  /**
   * Parse URL parameters into an object
   * @returns {Object} Parsed URL parameters
   */
  function parseUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};

    if (params.has('store')) {
      result.storeId = params.get('store');
    }
    if (params.has('category')) {
      result.categoryId = params.get('category');
    }
    if (params.has('promotion')) {
      result.promotionId = params.get('promotion');
    }
    if (params.has('filter')) {
      result.filterType = params.get('filter');
    }

    log('Parsed URL params:', result);
    return result;
  }

  /**
   * Save state to localStorage
   * @param {Object} state - The state object to save
   */
  function save(state) {
    try {
      const stateToSave = {
        // Core selections
        activeStore: state.activeStore,
        selectedStoreId: state.selectedStoreId,
        activeCategory: state.activeCategory,
        selectedCategoryId: state.selectedCategoryId,
        activePromotion: state.activePromotion,

        // Filters
        activeFilters: state.activeFilters || [],
        columnFilters: state.columnFilters || {},

        // Context (date & entity)
        currentWeek: state.currentWeek,
        currentEntity: state.currentEntity,
        selectedWeekId: state.selectedWeekId,
        selectedEntityId: state.selectedEntityId,

        // Sorting
        sortColumn: state.sortColumn,
        sortDirection: state.sortDirection,
        categorySortColumn: state.categorySortColumn,
        categorySortDirection: state.categorySortDirection,
        storeSortColumn: state.storeSortColumn,
        storeSortDirection: state.storeSortDirection,

        // Pagination
        topN: state.topN,

        // Grid mode state
        gridMode: state.gridMode || {},

        // View preferences
        promoViewMode: state.promoViewMode,
        moreDataEnabled: state.moreDataEnabled,

        // Timestamp for debugging
        savedAt: new Date().toISOString(),
        savedOnPage: getCurrentPage()
      };

      localStorage.setItem(STATE_KEY, JSON.stringify(stateToSave));
      log('State saved:', stateToSave);
    } catch (error) {
      console.error('[StateManager] Failed to save state:', error);
    }
  }

  /**
   * Load state from localStorage
   * @returns {Object|null} The saved state or null if not found
   */
  function load() {
    try {
      const saved = localStorage.getItem(STATE_KEY);
      if (!saved) {
        log('No saved state found');
        return null;
      }

      const state = JSON.parse(saved);
      log('State loaded:', state);
      return state;
    } catch (error) {
      console.error('[StateManager] Failed to load state:', error);
      return null;
    }
  }

  /**
   * Merge URL parameters with saved state
   * URL parameters take priority over saved state
   * @param {Object} savedState - State from localStorage
   * @param {Object} urlParams - Parsed URL parameters
   * @returns {Object} Merged state
   */
  function mergeWithUrlParams(savedState, urlParams) {
    const merged = { ...savedState };

    // URL store param overrides saved store
    if (urlParams.storeId) {
      merged.activeStore = urlParams.storeId;
      merged.selectedStoreId = urlParams.storeId;
    }

    // URL category param overrides saved category
    if (urlParams.categoryId) {
      merged.activeCategory = urlParams.categoryId;
      merged.selectedCategoryId = urlParams.categoryId;

      // Add category filter if navigating with category param
      if (!merged.activeFilters) {
        merged.activeFilters = [];
      }
      // Remove existing category filters and add new one
      merged.activeFilters = merged.activeFilters.filter(f => f.type !== 'category');
      merged.activeFilters.push({
        type: 'category',
        value: urlParams.categoryId,
        label: 'Category',
        fromUrl: true
      });
    }

    // URL promotion param overrides saved promotion
    if (urlParams.promotionId) {
      merged.activePromotion = urlParams.promotionId;
    }

    log('Merged state:', merged);
    return merged;
  }

  /**
   * Initialize state for a page
   * Loads saved state and merges with URL params
   * @returns {Object} Initial state for the page
   */
  function initialize() {
    const urlParams = parseUrlParams();
    const savedState = load() || {};
    const mergedState = mergeWithUrlParams(savedState, urlParams);

    log('Initialized state for page:', getCurrentPage());
    return mergedState;
  }

  /**
   * Clear all saved state
   */
  function clear() {
    try {
      localStorage.removeItem(STATE_KEY);
      log('State cleared');
    } catch (error) {
      console.error('[StateManager] Failed to clear state:', error);
    }
  }

  /**
   * Build navigation URL with state parameters
   * @param {string} targetPage - Target page (e.g., 'base_promotions.html')
   * @param {Object} params - Parameters to include in URL
   * @returns {string} Full URL with parameters
   */
  function buildNavigationUrl(targetPage, params = {}) {
    const url = new URL(targetPage, window.location.origin + window.location.pathname);

    if (params.storeId) {
      url.searchParams.set('store', params.storeId);
    }
    if (params.categoryId) {
      url.searchParams.set('category', params.categoryId);
    }
    if (params.promotionId) {
      url.searchParams.set('promotion', params.promotionId);
    }
    if (params.filter) {
      url.searchParams.set('filter', params.filter);
    }

    return url.toString();
  }

  /**
   * Navigate to a page with state preservation
   * @param {string} targetPage - Target page
   * @param {Object} state - Current state to save before navigation
   * @param {Object} urlParams - URL parameters for target page
   */
  function navigateTo(targetPage, state, urlParams = {}) {
    // Save current state before navigating
    if (state) {
      save(state);
    }

    // Build URL and navigate
    const url = buildNavigationUrl(targetPage, urlParams);
    log('Navigating to:', url);
    window.location.href = url;
  }

  // Public API
  return {
    save,
    load,
    initialize,
    clear,
    parseUrlParams,
    buildNavigationUrl,
    navigateTo,
    getCurrentPage
  };
})();

// Make available globally
window.StateManager = StateManager;
