/**
 * ContextStateService - State persistence and URL management
 * Angular-ready service for context state persistence
 *
 * Features:
 * - sessionStorage persistence for cross-page state
 * - URL parameter synchronization
 * - Automatic state restoration
 * - Change tracking and auto-save
 * - State validation and migration
 * - Event-driven state updates
 *
 * @version 1.0.0
 * @author Analytics Dashboard Team
 */

class ContextStateService {
  /**
   * Constructor - Angular-style singleton service
   */
  constructor() {
    // Service configuration
    this.config = {
      storageKey: 'analytics_dashboard_context_state',
      urlPrefix: 'ctx_',
      autoSave: true,
      debounceDelay: 300,
      maxStateHistory: 5
    };

    // Service state
    this.isInitialized = false;
    this.currentState = null;
    this.stateHistory = [];
    this.saveTimeout = null;

    // Event handling
    this._subscribers = new Map();
    this._eventListeners = [];

    // Bind methods to preserve 'this' context
    this.init = this.init.bind(this);
    this.destroy = this.destroy.bind(this);
    this.saveState = this.saveState.bind(this);
    this.loadState = this.loadState.bind(this);
    this.updateURL = this.updateURL.bind(this);
    this.parseURL = this.parseURL.bind(this);
    this.setState = this.setState.bind(this);
    this.getState = this.getState.bind(this);
    this._debouncedSave = this._debouncedSave.bind(this);
    this._handleStorageChange = this._handleStorageChange.bind(this);
    this._handlePopState = this._handlePopState.bind(this);
  }

  /**
   * Initialize the service
   *
   * @returns {Promise<boolean>} Success status
   */
  async init() {
    if (this.isInitialized) {
      return true;
    }

    try {

      // Load initial state
      this.currentState = this._createDefaultState();

      // Try to restore from storage first
      const storedState = this.loadState();
      if (storedState) {
        this.currentState = { ...this.currentState, ...storedState };
      }

      // Then check URL parameters (higher priority)
      const urlState = this.parseURL();
      if (urlState && Object.keys(urlState).length > 0) {
        this.currentState = { ...this.currentState, ...urlState };
      }

      // Set up event listeners
      this._setupEventListeners();

      // Save initial state
      if (this.config.autoSave) {
        this.saveState(this.currentState);
      }

      // Mark as initialized
      this.isInitialized = true;

      return true;

    } catch (error) {
      console.error('❌ ContextStateService initialization failed:', error);
      return false;
    }
  }

  /**
   * Create default state structure
   *
   * @private
   * @returns {Object} Default state
   */
  _createDefaultState() {
    return {
      // Period configuration
      periodMode: 'single', // 'single' | 'compare'
      primaryWeek: this._getCurrentWeek(),
      compareWeek: null,

      // Scope configuration
      scopeLevel: 'all', // 'all' | 'region' | 'store'
      scopeValue: 'all_stores', // ID of selected scope
      scopeName: 'All Stores', // Display name
      storeCount: 50, // Number of stores included

      // Context metadata
      pageType: 'overview', // 'overview' | 'reports' | 'datagrid-inquiry'
      analysisSource: null, // Source of analysis (for datagrid inquiry)
      analysisFilter: null, // Applied filters
      lastUpdated: Date.now(),
      version: '1.0'
    };
  }

  /**
   * Get current week number (simplified calculation)
   *
   * @private
   * @returns {number} Current week number
   */
  _getCurrentWeek() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.floor(diff / oneWeek) + 1;
  }

  /**
   * Set up event listeners for state changes
   *
   * @private
   */
  _setupEventListeners() {
    // Listen for storage changes from other tabs/windows
    const storageListener = (event) => this._handleStorageChange(event);
    window.addEventListener('storage', storageListener);
    this._eventListeners.push({ type: 'storage', listener: storageListener });

    // Listen for browser navigation (back/forward)
    const popstateListener = (event) => this._handlePopState(event);
    window.addEventListener('popstate', popstateListener);
    this._eventListeners.push({ type: 'popstate', listener: popstateListener });

    // Listen for page unload to save final state
    const beforeUnloadListener = () => {
      if (this.currentState) {
        this.saveState(this.currentState, { immediate: true });
      }
    };
    window.addEventListener('beforeunload', beforeUnloadListener);
    this._eventListeners.push({ type: 'beforeunload', listener: beforeUnloadListener });
  }

  /**
   * Handle storage changes from other tabs
   *
   * @private
   * @param {StorageEvent} event - Storage change event
   */
  _handleStorageChange(event) {
    if (event.key === this.config.storageKey && event.newValue) {
      try {
        const newState = JSON.parse(event.newValue);
        if (this._validateState(newState)) {
          const oldState = { ...this.currentState };
          this.currentState = newState;


          // Notify subscribers
          this._notifySubscribers('stateChanged', this.currentState, oldState);
        }
      } catch (error) {
        console.error('❌ Error handling external state change:', error);
      }
    }
  }

  /**
   * Handle browser navigation events
   *
   * @private
   * @param {PopStateEvent} event - Pop state event
   */
  _handlePopState(event) {

    const urlState = this.parseURL();
    if (urlState && Object.keys(urlState).length > 0) {
      const oldState = { ...this.currentState };
      this.currentState = { ...this.currentState, ...urlState };

      // Save the updated state
      this.saveState(this.currentState);

      // Notify subscribers
      this._notifySubscribers('stateChanged', this.currentState, oldState);
    }
  }

  /**
   * Save state to sessionStorage
   *
   * @param {Object} state - State to save
   * @param {Object} options - Save options
   * @returns {boolean} Success status
   */
  saveState(state = null, options = {}) {
    const { immediate = false } = options;

    try {
      const stateToSave = state || this.currentState;

      if (!this._validateState(stateToSave)) {
        console.error('❌ Invalid state provided to saveState');
        return false;
      }

      // Add metadata
      const stateWithMeta = {
        ...stateToSave,
        lastUpdated: Date.now(),
        version: this.config.version || '1.0'
      };

      if (immediate) {
        // Save immediately
        this._performSave(stateWithMeta);
      } else {
        // Debounced save
        this._debouncedSave(stateWithMeta);
      }

      return true;

    } catch (error) {
      console.error('❌ Failed to save state:', error);
      return false;
    }
  }

  /**
   * Perform the actual save to sessionStorage
   *
   * @private
   * @param {Object} state - State to save
   */
  _performSave(state) {
    try {
      // Add to history
      this._addToHistory(state);

      // Save to storage
      sessionStorage.setItem(this.config.storageKey, JSON.stringify(state));


      // Notify subscribers
      this._notifySubscribers('stateSaved', state);

    } catch (error) {
      console.error('❌ Error performing state save:', error);
    }
  }

  /**
   * Debounced save to prevent excessive storage writes
   *
   * @private
   * @param {Object} state - State to save
   */
  _debouncedSave(state) {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(() => {
      this._performSave(state);
      this.saveTimeout = null;
    }, this.config.debounceDelay);
  }

  /**
   * Load state from sessionStorage
   *
   * @returns {Object|null} Loaded state or null if not found
   */
  loadState() {
    try {
      const storedData = sessionStorage.getItem(this.config.storageKey);

      if (!storedData) {
        return null;
      }

      const parsedState = JSON.parse(storedData);

      if (!this._validateState(parsedState)) {
        console.warn('⚠️ Invalid stored state, ignoring');
        return null;
      }

      // Migrate old state versions if needed
      const migratedState = this._migrateState(parsedState);

      return migratedState;

    } catch (error) {
      console.error('❌ Failed to load state:', error);
      return null;
    }
  }

  /**
   * Update URL with current state parameters
   *
   * @param {Object} state - State to encode in URL (defaults to current state)
   * @param {Object} options - URL update options
   */
  updateURL(state = null, options = {}) {
    const {
      replaceState = false,
      includeAll = false,
      pageSpecific = true
    } = options;

    try {
      const stateToEncode = state || this.currentState;
      const url = new URL(window.location.href);
      const params = url.searchParams;

      // Clear existing context parameters
      this._clearContextParams(params);

      // Add state parameters based on page type
      if (pageSpecific && stateToEncode.pageType) {
        switch (stateToEncode.pageType) {
          case 'datagrid-inquiry':
            this._addDatagridParams(params, stateToEncode);
            break;
          case 'reports':
            this._addReportsParams(params, stateToEncode);
            break;
          default:
            if (includeAll) {
              this._addAllParams(params, stateToEncode);
            }
        }
      } else if (includeAll) {
        this._addAllParams(params, stateToEncode);
      }

      // Update the URL
      const newUrl = url.toString();
      if (newUrl !== window.location.href) {
        if (replaceState) {
          window.history.replaceState(stateToEncode, '', newUrl);
        } else {
          window.history.pushState(stateToEncode, '', newUrl);
        }

      }

    } catch (error) {
      console.error('❌ Failed to update URL:', error);
    }
  }

  /**
   * Clear context-related URL parameters
   *
   * @private
   * @param {URLSearchParams} params - URL parameters object
   */
  _clearContextParams(params) {
    const contextParams = [
      'source', 'filter', 'sort', 'direction',
      'ctx_period_mode', 'ctx_primary_week', 'ctx_compare_week',
      'ctx_scope_level', 'ctx_scope_value'
    ];

    contextParams.forEach(param => params.delete(param));
  }

  /**
   * Add datagrid-specific parameters
   *
   * @private
   * @param {URLSearchParams} params - URL parameters object
   * @param {Object} state - State to encode
   */
  _addDatagridParams(params, state) {
    // Analysis context
    if (state.analysisSource) params.set('source', state.analysisSource);
    if (state.analysisFilter) params.set('filter', state.analysisFilter);

    // Period context
    if (state.periodMode !== 'single') {
      params.set('ctx_period_mode', state.periodMode);
    }
    if (state.primaryWeek) {
      params.set('ctx_primary_week', state.primaryWeek.toString());
    }
    if (state.compareWeek) {
      params.set('ctx_compare_week', state.compareWeek.toString());
    }

    // Scope context
    if (state.scopeLevel !== 'all') {
      params.set('ctx_scope_level', state.scopeLevel);
      params.set('ctx_scope_value', state.scopeValue);
    }
  }

  /**
   * Add reports-specific parameters
   *
   * @private
   * @param {URLSearchParams} params - URL parameters object
   * @param {Object} state - State to encode
   */
  _addReportsParams(params, state) {
    // Period configuration for reports
    params.set('ctx_period_mode', state.periodMode);
    params.set('ctx_primary_week', state.primaryWeek.toString());
    if (state.compareWeek) {
      params.set('ctx_compare_week', state.compareWeek.toString());
    }

    // Scope configuration
    params.set('ctx_scope_level', state.scopeLevel);
    params.set('ctx_scope_value', state.scopeValue);
  }

  /**
   * Add all parameters (for comprehensive state sharing)
   *
   * @private
   * @param {URLSearchParams} params - URL parameters object
   * @param {Object} state - State to encode
   */
  _addAllParams(params, state) {
    // All context parameters
    params.set('ctx_period_mode', state.periodMode);
    params.set('ctx_primary_week', state.primaryWeek.toString());
    if (state.compareWeek) {
      params.set('ctx_compare_week', state.compareWeek.toString());
    }
    params.set('ctx_scope_level', state.scopeLevel);
    params.set('ctx_scope_value', state.scopeValue);

    // Analysis context if available
    if (state.analysisSource) params.set('source', state.analysisSource);
    if (state.analysisFilter) params.set('filter', state.analysisFilter);
  }

  /**
   * Parse URL parameters to restore state
   *
   * @returns {Object} Parsed state from URL
   */
  parseURL() {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlState = {};

      // Parse legacy parameters (for datagrid inquiry)
      if (params.has('source')) {
        urlState.analysisSource = params.get('source');
      }
      if (params.has('filter')) {
        urlState.analysisFilter = params.get('filter');
      }

      // Parse context parameters
      if (params.has('ctx_period_mode')) {
        urlState.periodMode = params.get('ctx_period_mode');
      }
      if (params.has('ctx_primary_week')) {
        urlState.primaryWeek = parseInt(params.get('ctx_primary_week'));
      }
      if (params.has('ctx_compare_week')) {
        urlState.compareWeek = parseInt(params.get('ctx_compare_week'));
      }
      if (params.has('ctx_scope_level')) {
        urlState.scopeLevel = params.get('ctx_scope_level');
      }
      if (params.has('ctx_scope_value')) {
        urlState.scopeValue = params.get('ctx_scope_value');
      }

      // Validate and return
      if (Object.keys(urlState).length > 0) {
        return urlState;
      }

      return {};

    } catch (error) {
      console.error('❌ Failed to parse URL:', error);
      return {};
    }
  }

  /**
   * Set current state (with validation and auto-save)
   *
   * @param {Object} newState - New state or partial state update
   * @param {Object} options - Set options
   * @returns {boolean} Success status
   */
  setState(newState, options = {}) {
    const {
      merge = true,
      updateUrl = true,
      autoSave = this.config.autoSave,
      silent = false
    } = options;

    try {
      if (!newState || typeof newState !== 'object') {
        console.error('❌ Invalid state provided to setState');
        return false;
      }

      const oldState = { ...this.currentState };

      // Merge or replace state
      this.currentState = merge
        ? { ...this.currentState, ...newState, lastUpdated: Date.now() }
        : { ...this._createDefaultState(), ...newState, lastUpdated: Date.now() };

      // Validate the new state
      if (!this._validateState(this.currentState)) {
        console.error('❌ New state failed validation, reverting');
        this.currentState = oldState;
        return false;
      }

      // Auto-save if enabled
      if (autoSave) {
        this.saveState(this.currentState);
      }

      // Update URL if requested
      if (updateUrl) {
        this.updateURL(this.currentState, { replaceState: true });
      }

      // Notify subscribers unless silent
      if (!silent) {
        this._notifySubscribers('stateChanged', this.currentState, oldState);
      }

      return true;

    } catch (error) {
      console.error('❌ Failed to set state:', error);
      return false;
    }
  }

  /**
   * Get current state (immutable copy)
   *
   * @returns {Object} Current state
   */
  getState() {
    return { ...this.currentState };
  }

  /**
   * Validate state structure
   *
   * @private
   * @param {Object} state - State to validate
   * @returns {boolean} Is valid
   */
  _validateState(state) {
    if (!state || typeof state !== 'object') {
      return false;
    }

    // Required fields
    const requiredFields = ['periodMode', 'primaryWeek', 'scopeLevel', 'scopeValue'];
    for (const field of requiredFields) {
      if (!(field in state)) {
        return false;
      }
    }

    // Value validation
    if (!['single', 'compare'].includes(state.periodMode)) {
      return false;
    }

    if (!['all', 'region', 'store'].includes(state.scopeLevel)) {
      return false;
    }

    if (typeof state.primaryWeek !== 'number' || state.primaryWeek < 1 || state.primaryWeek > 53) {
      return false;
    }

    // Compare week validation (if compare mode)
    if (state.periodMode === 'compare') {
      if (!state.compareWeek || typeof state.compareWeek !== 'number') {
        return false;
      }
    }

    return true;
  }

  /**
   * Migrate state from older versions
   *
   * @private
   * @param {Object} state - State to migrate
   * @returns {Object} Migrated state
   */
  _migrateState(state) {
    // Version 1.0 - no migration needed yet
    // Future versions would implement migration logic here
    return state;
  }

  /**
   * Add state to history
   *
   * @private
   * @param {Object} state - State to add
   */
  _addToHistory(state) {
    this.stateHistory.unshift({ ...state });

    // Limit history size
    if (this.stateHistory.length > this.config.maxStateHistory) {
      this.stateHistory = this.stateHistory.slice(0, this.config.maxStateHistory);
    }
  }

  /**
   * Get state history
   *
   * @returns {Array} State history
   */
  getHistory() {
    return [...this.stateHistory];
  }

  /**
   * Subscribe to state changes
   *
   * @param {string} event - Event type ('stateChanged', 'stateSaved')
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribe(event, callback) {
    if (!this._subscribers.has(event)) {
      this._subscribers.set(event, new Set());
    }

    this._subscribers.get(event).add(callback);

    // Return unsubscribe function
    return () => {
      const eventSubscribers = this._subscribers.get(event);
      if (eventSubscribers) {
        eventSubscribers.delete(callback);
      }
    };
  }

  /**
   * Notify all subscribers of an event
   *
   * @private
   * @param {string} event - Event type
   * @param {...any} args - Arguments to pass to callbacks
   */
  _notifySubscribers(event, ...args) {
    const eventSubscribers = this._subscribers.get(event);
    if (eventSubscribers) {
      eventSubscribers.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`❌ Error in state subscriber callback:`, error);
        }
      });
    }
  }

  /**
   * Clear all stored state
   *
   * @returns {boolean} Success status
   */
  clearState() {
    try {
      sessionStorage.removeItem(this.config.storageKey);
      this.currentState = this._createDefaultState();
      this.stateHistory = [];


      // Notify subscribers
      this._notifySubscribers('stateCleared');

      return true;

    } catch (error) {
      console.error('❌ Failed to clear state:', error);
      return false;
    }
  }

  /**
   * Clean up service resources
   *
   * @returns {boolean} Success status
   */
  destroy() {
    try {

      // Clear debounce timeout
      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout);
        this.saveTimeout = null;
      }

      // Save final state
      if (this.currentState) {
        this.saveState(this.currentState, { immediate: true });
      }

      // Remove event listeners
      this._eventListeners.forEach(({ type, listener }) => {
        window.removeEventListener(type, listener);
      });
      this._eventListeners = [];

      // Clear subscribers
      this._subscribers.clear();

      // Reset state
      this.currentState = null;
      this.stateHistory = [];
      this.isInitialized = false;

      return true;

    } catch (error) {
      console.error('❌ Error destroying ContextStateService:', error);
      return false;
    }
  }

  /**
   * Get service instance (singleton pattern)
   *
   * @static
   * @returns {ContextStateService} Service instance
   */
  static getInstance() {
    if (!ContextStateService._instance) {
      ContextStateService._instance = new ContextStateService();
    }
    return ContextStateService._instance;
  }

  /**
   * Check if service has been instantiated
   *
   * @static
   * @returns {boolean} True if instance exists
   */
  static hasInstance() {
    return !!ContextStateService._instance;
  }

  /**
   * Reset singleton instance (useful for testing)
   *
   * @static
   */
  static resetInstance() {
    if (ContextStateService._instance) {
      ContextStateService._instance.destroy();
      ContextStateService._instance = null;
    }
  }
}

// Static instance holder
ContextStateService._instance = null;

// Auto-cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (ContextStateService.hasInstance()) {
      ContextStateService.getInstance().destroy();
    }
  });
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContextStateService;
} else if (typeof window !== 'undefined') {
  window.ContextStateService = ContextStateService;
}