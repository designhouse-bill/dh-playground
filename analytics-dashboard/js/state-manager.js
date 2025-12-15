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

    // Publication/week parameter
    if (params.has('pub')) {
      result.weekId = params.get('pub');
    }

    // Entity parameter
    if (params.has('entity')) {
      result.entityId = params.get('entity');
    }

    // Days filter parameter
    if (params.has('days')) {
      result.days = params.get('days');
    }

    // Sort parameters
    if (params.has('sort')) {
      result.sortColumn = params.get('sort');
    }
    if (params.has('sortDir')) {
      result.sortDirection = params.get('sortDir');
    }

    // View mode parameter
    if (params.has('view')) {
      result.viewMode = params.get('view');
    }

    // Active filters (JSON encoded)
    if (params.has('filters')) {
      try {
        result.activeFilters = JSON.parse(decodeURIComponent(params.get('filters')));
      } catch (e) {
        log('Failed to parse filters from URL:', e);
      }
    }

    // Compare mode URL params
    if (params.has('layer')) {
      result.compareLayer = params.get('layer');
    }
    if (params.has('a_week')) {
      result.aWeekId = params.get('a_week');
    }
    if (params.has('a_entity')) {
      result.aEntityId = params.get('a_entity');
    }
    if (params.has('a_category')) {
      result.aCategoryId = params.get('a_category');
    }
    if (params.has('a_promotion')) {
      result.aPromotionId = params.get('a_promotion');
    }
    if (params.has('b_week')) {
      result.bWeekId = params.get('b_week');
    }
    if (params.has('b_entity')) {
      result.bEntityId = params.get('b_entity');
    }
    if (params.has('b_category')) {
      result.bCategoryId = params.get('b_category');
    }
    if (params.has('b_promotion')) {
      result.bPromotionId = params.get('b_promotion');
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

        // Compare mode state
        compareMode: state.compareMode || {},

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

    // URL publication/week param overrides saved
    if (urlParams.weekId) {
      merged.selectedWeekId = urlParams.weekId;
    }

    // URL entity param overrides saved
    if (urlParams.entityId) {
      merged.selectedEntityId = urlParams.entityId;
    }

    // URL days filter
    if (urlParams.days) {
      if (!merged.gridMode) merged.gridMode = { columnFilters: {} };
      if (!merged.gridMode.columnFilters) merged.gridMode.columnFilters = {};
      merged.gridMode.columnFilters.daysRun = urlParams.days;
      // Also add as filter chip
      if (!merged.activeFilters) merged.activeFilters = [];
      merged.activeFilters = merged.activeFilters.filter(f => f.type !== 'days');
      merged.activeFilters.push({
        type: 'days',
        value: urlParams.days,
        label: 'Days',
        fromUrl: true
      });
    }

    // URL sort params
    if (urlParams.sortColumn) {
      merged.sortColumn = urlParams.sortColumn;
      if (merged.gridMode) {
        merged.gridMode.sortColumn = urlParams.sortColumn;
      }
    }
    if (urlParams.sortDirection) {
      merged.sortDirection = urlParams.sortDirection;
      if (merged.gridMode) {
        merged.gridMode.sortDirection = urlParams.sortDirection;
      }
    }

    // URL view mode
    if (urlParams.viewMode) {
      merged.promoViewMode = urlParams.viewMode;
    }

    // URL active filters (full array from JSON)
    if (urlParams.activeFilters && Array.isArray(urlParams.activeFilters)) {
      merged.activeFilters = urlParams.activeFilters;
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

    // Compare mode params
    if (params.layer) {
      url.searchParams.set('layer', params.layer);
    }
    if (params.aWeekId) {
      url.searchParams.set('a_week', params.aWeekId);
    }
    if (params.aEntityId) {
      url.searchParams.set('a_entity', params.aEntityId);
    }
    if (params.aCategoryId) {
      url.searchParams.set('a_category', params.aCategoryId);
    }
    if (params.aPromotionId) {
      url.searchParams.set('a_promotion', params.aPromotionId);
    }
    if (params.bWeekId) {
      url.searchParams.set('b_week', params.bWeekId);
    }
    if (params.bEntityId) {
      url.searchParams.set('b_entity', params.bEntityId);
    }
    if (params.bCategoryId) {
      url.searchParams.set('b_category', params.bCategoryId);
    }
    if (params.bPromotionId) {
      url.searchParams.set('b_promotion', params.bPromotionId);
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

  /**
   * Generate a shareable URL with complete current state
   * @param {Object} state - Current application state
   * @returns {string} Full shareable URL
   */
  function getShareableUrl(state) {
    const params = new URLSearchParams();

    // Publication/week
    if (state.selectedWeekId) {
      params.set('pub', state.selectedWeekId);
    }

    // Entity
    if (state.selectedEntityId && state.selectedEntityId !== 'all') {
      params.set('entity', state.selectedEntityId);
    }

    // Days filter (from gridMode or activeFilters)
    const daysFilter = state.gridMode?.columnFilters?.daysRun ||
                       state.activeFilters?.find(f => f.type === 'days')?.value;
    if (daysFilter) {
      params.set('days', daysFilter);
    }

    // Sort column and direction
    const sortColumn = state.sortColumn || state.gridMode?.sortColumn ||
                       state.categorySortColumn || state.storeSortColumn;
    const sortDirection = state.sortDirection || state.gridMode?.sortDirection ||
                          state.categorySortDirection || state.storeSortDirection;
    if (sortColumn) {
      params.set('sort', sortColumn);
      params.set('sortDir', sortDirection || 'desc');
    }

    // View mode
    if (state.promoViewMode && state.promoViewMode !== 'table') {
      params.set('view', state.promoViewMode);
    }

    // Active filters (only category, deal, size - excluding days which is separate)
    const filters = (state.activeFilters || []).filter(f =>
      ['category', 'deal', 'size', 'promotion', 'store'].includes(f.type)
    );
    if (filters.length > 0) {
      // Simplify filter data for URL
      const simplifiedFilters = filters.map(f => ({
        type: f.type,
        value: f.value,
        label: f.label
      }));
      params.set('filters', encodeURIComponent(JSON.stringify(simplifiedFilters)));
    }

    const queryString = params.toString();
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }

  /**
   * Copy shareable URL to clipboard
   * @param {Object} state - Current application state
   * @returns {Promise<boolean>} True if copy succeeded
   */
  async function copyShareUrl(state) {
    const url = getShareableUrl(state);
    try {
      await navigator.clipboard.writeText(url);
      log('Share URL copied:', url);
      return true;
    } catch (error) {
      console.error('[StateManager] Failed to copy URL:', error);
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        log('Share URL copied (fallback):', url);
        return true;
      } catch (fallbackError) {
        console.error('[StateManager] Fallback copy failed:', fallbackError);
        return false;
      }
    }
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
    getCurrentPage,
    getShareableUrl,
    copyShareUrl
  };
})();

// Make available globally
window.StateManager = StateManager;
