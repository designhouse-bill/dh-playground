/**
 * STATE MANAGER - Centralized Application State
 * Analytics Dashboard - Stand-alone Version
 *
 * Provides pub/sub pattern for component communication
 * and centralized state management.
 */

const StateManager = (() => {
  'use strict';

  // ========================================
  // INITIAL STATE
  // ========================================

  const initialState = {
    // Data
    allPromotions: [],
    filteredPromotions: [],
    categories: [],

    // Active selections
    activeCategory: null,
    activePromotion: null,
    selectedCategoryId: null,

    // Current context
    currentWeek: null,
    currentEntity: null,

    // Filters
    activeFilters: [],

    // Modal state
    selectedWeekId: null,
    selectedEntityId: null,
    selectedFilterType: 'category',
    selectedFilterValue: null,

    // Search
    searchQuery: '',

    // View mode
    viewMode: 'categories', // 'categories' or 'promotions'

    // Promo view mode
    promoViewMode: 'table',

    // Loading states
    isLoading: false,
    loadError: null,

    // Comparison mode
    comparisonEnabled: false,

    // Table sorting
    sortColumn: null,
    sortDirection: 'desc',
    categorySortColumn: null,
    categorySortDirection: 'desc',

    // Column filters
    columnFilters: {
      dealType: null,
      category: null
    },

    // App Mode
    appMode: 'base', // 'base' | 'grid' | 'compare'

    // Grid Mode state
    gridMode: {
      currentPage: 1,
      rowsPerPage: 25,
      visibleColumns: [],
      sortColumn: null,
      sortDirection: 'asc',
      columnsDropdownOpen: false
    }
  };

  // ========================================
  // STATE & SUBSCRIBERS
  // ========================================

  let state = { ...initialState };
  const subscribers = new Map();
  let subscriberId = 0;

  // ========================================
  // CORE METHODS
  // ========================================

  /**
   * Get current state or specific property
   * @param {string} [key] - Optional state key
   * @returns {*}
   */
  function getState(key) {
    if (key) {
      return state[key];
    }
    return { ...state };
  }

  /**
   * Update state and notify subscribers
   * @param {Object} updates - Partial state updates
   */
  function setState(updates) {
    const prevState = { ...state };
    state = { ...state, ...updates };

    // Notify subscribers of changes
    const changedKeys = Object.keys(updates);
    notifySubscribers(changedKeys, prevState);
  }

  /**
   * Reset state to initial values
   */
  function resetState() {
    state = { ...initialState };
    notifySubscribers(Object.keys(state), initialState);
  }

  // ========================================
  // PUB/SUB METHODS
  // ========================================

  /**
   * Subscribe to state changes
   * @param {string|string[]} keys - State key(s) to watch
   * @param {Function} callback - Function to call on change
   * @returns {number} Subscriber ID for unsubscribe
   */
  function subscribe(keys, callback) {
    const id = ++subscriberId;
    const keyArray = Array.isArray(keys) ? keys : [keys];

    subscribers.set(id, {
      keys: keyArray,
      callback
    });

    return id;
  }

  /**
   * Unsubscribe from state changes
   * @param {number} id - Subscriber ID
   */
  function unsubscribe(id) {
    subscribers.delete(id);
  }

  /**
   * Notify subscribers of state changes
   * @param {string[]} changedKeys - Keys that changed
   * @param {Object} prevState - Previous state
   */
  function notifySubscribers(changedKeys, prevState) {
    subscribers.forEach(({ keys, callback }) => {
      const hasRelevantChange = keys.some(key =>
        changedKeys.includes(key) || key === '*'
      );

      if (hasRelevantChange) {
        callback(state, prevState);
      }
    });
  }

  // ========================================
  // CONVENIENCE METHODS
  // ========================================

  /**
   * Set loading state
   * @param {boolean} loading
   */
  function setLoading(loading) {
    setState({ isLoading: loading });
  }

  /**
   * Set error state
   * @param {Error|string|null} error
   */
  function setError(error) {
    setState({
      loadError: error ? (error.message || error) : null
    });
  }

  /**
   * Set view mode
   * @param {'categories'|'promotions'} mode
   */
  function setViewMode(mode) {
    setState({ viewMode: mode });
  }

  /**
   * Set app mode
   * @param {'base'|'grid'|'compare'} mode
   */
  function setAppMode(mode) {
    setState({ appMode: mode });
  }

  /**
   * Set active category
   * @param {Object|null} category
   */
  function setActiveCategory(category) {
    setState({
      activeCategory: category,
      activePromotion: null
    });
  }

  /**
   * Set active promotion
   * @param {Object|null} promotion
   */
  function setActivePromotion(promotion) {
    setState({ activePromotion: promotion });
  }

  /**
   * Add filter
   * @param {Object} filter
   */
  function addFilter(filter) {
    const filters = [...state.activeFilters, filter];
    setState({ activeFilters: filters });
  }

  /**
   * Remove filter
   * @param {number} index
   */
  function removeFilter(index) {
    const filters = state.activeFilters.filter((_, i) => i !== index);
    setState({ activeFilters: filters });
  }

  /**
   * Clear all filters
   */
  function clearFilters() {
    setState({ activeFilters: [] });
  }

  // ========================================
  // PUBLIC API
  // ========================================

  return {
    // Core
    getState,
    setState,
    resetState,

    // Pub/Sub
    subscribe,
    unsubscribe,

    // Convenience
    setLoading,
    setError,
    setViewMode,
    setAppMode,
    setActiveCategory,
    setActivePromotion,
    addFilter,
    removeFilter,
    clearFilters
  };
})();

// Expose for debugging
if (window.location.hostname === 'localhost') {
  window.__stateManager = StateManager;
}
