/**
 * State Management Service
 * Centralized state with sessionStorage persistence for cross-page navigation
 */

const StateService = (function() {
  'use strict';

  const STORAGE_KEY = 'analytics_dashboard_state';

  // Default state structure
  const defaultState = {
    // Data (not persisted - loaded fresh per page)
    allPromotions: [],
    filteredPromotions: [],
    categories: [],
    filteredCategories: [],

    // Active selections (persisted)
    activeCategory: null,
    activePromotion: null,
    selectedCategoryId: null,

    // Current context (persisted)
    currentWeek: null,
    currentEntity: null,

    // Filters (persisted)
    activeFilters: [],

    // View mode (persisted)
    viewMode: 'categories',
    promoViewMode: 'table',
    appMode: 'base',

    // Sorting (persisted)
    sortColumn: null,
    sortDirection: 'desc',
    categorySortColumn: null,
    categorySortDirection: 'desc',

    // Column filters
    columnFilters: {
      dealType: null,
      category: null
    },

    // Grid Mode state
    gridMode: {
      currentPage: 1,
      rowsPerPage: 25,
      visibleColumns: [],
      sortColumn: null,
      sortDirection: 'asc',
      columnsDropdownOpen: false,
      columnFilters: {}
    },

    // More Data toggle
    moreDataEnabled: false
  };

  // Keys that should be persisted to sessionStorage
  const persistedKeys = [
    'activeCategory',
    'activePromotion',
    'selectedCategoryId',
    'currentWeek',
    'currentEntity',
    'activeFilters',
    'viewMode',
    'promoViewMode',
    'appMode',
    'sortColumn',
    'sortDirection',
    'categorySortColumn',
    'categorySortDirection',
    'columnFilters',
    'gridMode',
    'moreDataEnabled'
  ];

  // Current state
  let state = { ...defaultState };

  /**
   * Load persisted state from sessionStorage
   */
  function loadFromStorage() {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge persisted values into state
        persistedKeys.forEach(key => {
          if (parsed[key] !== undefined) {
            state[key] = parsed[key];
          }
        });
      }
    } catch (e) {
      console.warn('Failed to load state from sessionStorage:', e);
    }
  }

  /**
   * Save persisted state to sessionStorage
   */
  function saveToStorage() {
    try {
      const toStore = {};
      persistedKeys.forEach(key => {
        toStore[key] = state[key];
      });
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch (e) {
      console.warn('Failed to save state to sessionStorage:', e);
    }
  }

  /**
   * Get current state or specific key
   */
  function get(key) {
    if (key) {
      return state[key];
    }
    return { ...state };
  }

  /**
   * Set state value(s)
   * @param {string|object} keyOrObject - Key name or object of key-value pairs
   * @param {*} value - Value (if keyOrObject is string)
   */
  function set(keyOrObject, value) {
    if (typeof keyOrObject === 'string') {
      state[keyOrObject] = value;
    } else if (typeof keyOrObject === 'object') {
      Object.assign(state, keyOrObject);
    }
    saveToStorage();
  }

  /**
   * Reset state to defaults
   * @param {boolean} clearStorage - Whether to also clear sessionStorage
   */
  function reset(clearStorage = true) {
    state = { ...defaultState };
    if (clearStorage) {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }

  /**
   * Initialize state service
   */
  function init() {
    loadFromStorage();
  }

  // Public API
  return {
    init,
    get,
    set,
    reset,
    loadFromStorage,
    saveToStorage
  };
})();

// Auto-initialize
if (typeof window !== 'undefined') {
  StateService.init();
}
