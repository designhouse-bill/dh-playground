/**
 * ContextStateService - State persistence across navigation
 * Manages context bar state in sessionStorage for seamless navigation
 *
 * Features:
 * - Save/load state to/from sessionStorage
 * - Clear comparison mode when navigating to dashboard
 * - Validate state data integrity
 * - Handle page-specific state constraints
 *
 * @version 1.0.0
 */

class ContextStateService {
  constructor() {
    this.storageKey = 'analytics_dashboard_context_state';
    this.defaultState = {
      week: 40,
      compareWeek: null,
      comparisonMode: false,
      scopeLevel: 'all',
      scopeValue: 'all',
      scopeName: 'All Stores',
      scopeCount: 67,
      pageType: 'dashboard'
    };
  }

  /**
   * Save current state to sessionStorage
   * @param {Object} state - State object to save
   */
  saveState(state) {
    try {
      // Validate state structure
      const validatedState = this.validateState(state);

      // Apply page-specific constraints
      const constrainedState = this.applyPageConstraints(validatedState);

      sessionStorage.setItem(this.storageKey, JSON.stringify(constrainedState));
      console.log('💾 Context state saved:', constrainedState);
    } catch (error) {
      console.error('❌ Failed to save context state:', error);
    }
  }

  /**
   * Load state from sessionStorage
   * @param {string} currentPageType - Current page type for constraints
   * @returns {Object} Loaded and validated state
   */
  loadState(currentPageType = 'dashboard') {
    try {
      const storedState = sessionStorage.getItem(this.storageKey);

      if (!storedState) {
        console.log('📄 No stored state found, using defaults');
        return { ...this.defaultState, pageType: currentPageType };
      }

      const parsedState = JSON.parse(storedState);
      const validatedState = this.validateState(parsedState);

      // Update page type and apply constraints
      validatedState.pageType = currentPageType;
      const constrainedState = this.applyPageConstraints(validatedState);

      console.log('📂 Context state loaded:', constrainedState);
      return constrainedState;
    } catch (error) {
      console.error('❌ Failed to load context state:', error);
      return { ...this.defaultState, pageType: currentPageType };
    }
  }

  /**
   * Clear all stored state
   */
  clearState() {
    try {
      sessionStorage.removeItem(this.storageKey);
      console.log('🗑️ Context state cleared');
    } catch (error) {
      console.error('❌ Failed to clear context state:', error);
    }
  }

  /**
   * Validate state structure and apply defaults for missing fields
   * @param {Object} state - State to validate
   * @returns {Object} Validated state
   */
  validateState(state) {
    const validated = { ...this.defaultState };

    // Validate week (must be positive number)
    if (typeof state.week === 'number' && state.week > 0) {
      validated.week = state.week;
    }

    // Validate compareWeek (must be null or positive number different from week)
    if (state.compareWeek === null ||
        (typeof state.compareWeek === 'number' &&
         state.compareWeek > 0 &&
         state.compareWeek !== validated.week)) {
      validated.compareWeek = state.compareWeek;
    }

    // Validate comparison mode
    if (typeof state.comparisonMode === 'boolean') {
      validated.comparisonMode = state.comparisonMode;
    }

    // Validate scope level
    if (['all', 'version-group', 'store'].includes(state.scopeLevel)) {
      validated.scopeLevel = state.scopeLevel;
    }

    // Validate scope value
    if (typeof state.scopeValue === 'string' && state.scopeValue.length > 0) {
      validated.scopeValue = state.scopeValue;
    }

    // Validate scope name
    if (typeof state.scopeName === 'string' && state.scopeName.length > 0) {
      validated.scopeName = state.scopeName;
    }

    // Validate scope count
    if (typeof state.scopeCount === 'number' && state.scopeCount > 0) {
      validated.scopeCount = state.scopeCount;
    }

    // Validate page type
    if (['dashboard', 'reports', 'analyze'].includes(state.pageType)) {
      validated.pageType = state.pageType;
    }

    return validated;
  }

  /**
   * Apply page-specific constraints to state
   * @param {Object} state - State to constrain
   * @returns {Object} Constrained state
   */
  applyPageConstraints(state) {
    const constrained = { ...state };

    // Dashboard pages don't support comparison mode
    if (constrained.pageType === 'dashboard') {
      constrained.comparisonMode = false;
      constrained.compareWeek = null;
      console.log('🚫 Comparison mode disabled for dashboard page');
    }

    // Ensure comparison mode consistency
    if (!constrained.comparisonMode) {
      constrained.compareWeek = null;
    } else if (constrained.compareWeek === null || constrained.compareWeek === constrained.week) {
      // If comparison mode is on but no valid compare week, disable comparison
      constrained.comparisonMode = false;
      constrained.compareWeek = null;
    }

    return constrained;
  }

  /**
   * Get page capabilities based on page type
   * @param {string} pageType - Page type
   * @returns {Object} Page capabilities
   */
  getPageCapabilities(pageType) {
    switch (pageType) {
      case 'dashboard':
        return {
          allowComparison: false,
          defaultMode: 'single',
          title: 'Dashboard Context'
        };
      case 'reports':
      case 'analyze':
        return {
          allowComparison: true,
          defaultMode: 'single',
          title: 'Analysis Context'
        };
      default:
        return {
          allowComparison: false,
          defaultMode: 'single',
          title: 'Context'
        };
    }
  }

  /**
   * Check if current state is valid for the given page type
   * @param {Object} state - State to check
   * @param {string} pageType - Page type to check against
   * @returns {boolean} True if state is valid for page type
   */
  isStateValidForPage(state, pageType) {
    const capabilities = this.getPageCapabilities(pageType);

    // Check if comparison mode is allowed on this page
    if (state.comparisonMode && !capabilities.allowComparison) {
      return false;
    }

    return true;
  }

  /**
   * Create state object from context bar component
   * @param {Object} contextBar - Context bar component instance
   * @returns {Object} State object
   */
  createStateFromContext(contextBar) {
    return {
      week: contextBar.selectedWeek,
      compareWeek: contextBar.selectedCompareWeek,
      comparisonMode: contextBar.comparisonMode,
      scopeLevel: contextBar.selectedScope.level,
      scopeValue: contextBar.selectedScope.id,
      scopeName: contextBar.selectedScope.name,
      scopeCount: contextBar.selectedScope.count,
      pageType: contextBar.pageType
    };
  }

  /**
   * Apply state to context bar component
   * @param {Object} contextBar - Context bar component instance
   * @param {Object} state - State to apply
   */
  applyStateToContext(contextBar, state) {
    // Apply week selection
    contextBar.selectedWeek = state.week;
    contextBar.selectedCompareWeek = state.compareWeek;
    contextBar.comparisonMode = state.comparisonMode;

    // Apply scope selection
    contextBar.selectedScope = {
      level: state.scopeLevel,
      id: state.scopeValue,
      name: state.scopeName,
      count: state.scopeCount
    };

    console.log('🔄 State applied to context bar:', state);
  }

  /**
   * Update URL to reflect current context state
   * @param {Object} state - State to sync to URL
   * @param {boolean} replaceState - Use replaceState instead of pushState
   */
  syncStateToUrl(state, replaceState = false) {
    try {
      const url = new URL(window.location);

      // Clear existing context parameters
      url.searchParams.delete('week');
      url.searchParams.delete('compare');
      url.searchParams.delete('scope');
      url.searchParams.delete('scopeValue');

      // Add current context parameters
      if (state.week && state.week !== 40) {
        url.searchParams.set('week', state.week);
      }

      if (state.comparisonMode && state.compareWeek) {
        url.searchParams.set('compare', state.compareWeek);
      }

      if (state.scopeLevel && state.scopeLevel !== 'all') {
        url.searchParams.set('scope', state.scopeLevel);
        if (state.scopeValue && state.scopeValue !== 'all') {
          url.searchParams.set('scopeValue', state.scopeValue);
        }
      }

      // Update URL without page reload
      const method = replaceState ? 'replaceState' : 'pushState';
      window.history[method]({ contextState: state }, '', url.toString());

      console.log('🔗 URL updated:', url.toString());
    } catch (error) {
      console.error('❌ Failed to sync state to URL:', error);
    }
  }

  /**
   * Parse context state from URL parameters
   * @returns {Object|null} Context state from URL or null if no context found
   */
  parseStateFromUrl() {
    try {
      const urlParams = new URLSearchParams(window.location.search);

      const week = urlParams.get('week');
      const compare = urlParams.get('compare');
      const scope = urlParams.get('scope');
      const scopeValue = urlParams.get('scopeValue');

      // Return null if no context parameters found
      if (!week && !compare && !scope) {
        return null;
      }

      const urlState = {
        week: week ? parseInt(week) : 40,
        compareWeek: compare ? parseInt(compare) : null,
        comparisonMode: !!compare,
        scopeLevel: scope || 'all',
        scopeValue: scopeValue || 'all',
        scopeName: this.getScopeNameFromValue(scope, scopeValue),
        scopeCount: this.getScopeCountFromValue(scope, scopeValue),
        pageType: this.detectPageType()
      };

      // Validate parsed state
      const validatedState = this.validateState(urlState);
      const constrainedState = this.applyPageConstraints(validatedState);

      console.log('🔗 State parsed from URL:', constrainedState);
      return constrainedState;

    } catch (error) {
      console.error('❌ Failed to parse state from URL:', error);
      return null;
    }
  }

  /**
   * Get scope name from scope level and value
   */
  getScopeNameFromValue(scopeLevel, scopeValue) {
    if (!scopeLevel || scopeLevel === 'all') {
      return 'All Stores';
    }

    if (scopeLevel === 'version-group') {
      // Try to find version group name from mock data
      if (window.mockDatabase && window.mockDatabase.version_groups) {
        const versionGroup = window.mockDatabase.version_groups.find(r => r.id === scopeValue);
        return versionGroup ? versionGroup.name : `${scopeValue} Version-Group`;
      }
      return `${scopeValue} Version-Group`;
    }

    if (scopeLevel === 'store') {
      return `Store ${scopeValue}`;
    }

    return scopeValue;
  }

  /**
   * Get scope count from scope level and value
   */
  getScopeCountFromValue(scopeLevel, scopeValue) {
    if (!scopeLevel || scopeLevel === 'all') {
      return 67; // All stores
    }

    if (scopeLevel === 'version-group') {
      // Try to find version group count from mock data
      if (window.mockDatabase && window.mockDatabase.version_groups) {
        const versionGroup = window.mockDatabase.version_groups.find(r => r.id === scopeValue);
        return versionGroup ? versionGroup.stores.length : 15; // Default version group size
      }
      return 15; // Default version group size
    }

    if (scopeLevel === 'store') {
      return 1; // Individual store
    }

    return 1;
  }

  /**
   * Detect page type from current URL
   */
  detectPageType() {
    const pathname = window.location.pathname;
    const filename = pathname.split('/').pop() || 'index.html';

    if (filename === 'index.html' || filename === '' || pathname.endsWith('/')) {
      return 'dashboard';
    } else if (filename === 'reports.html' || pathname.includes('reports')) {
      return 'reports';
    } else if (filename.includes('datagrid') || filename.includes('inquiry')) {
      return 'analyze';
    }

    return 'dashboard';
  }

  /**
   * Initialize URL state synchronization
   */
  initUrlSync() {
    // Listen for browser back/forward navigation
    window.addEventListener('popstate', (event) => {
      console.log('🔄 Browser navigation detected');

      if (event.state && event.state.contextState) {
        // Restore state from history
        console.log('📂 Restoring state from history:', event.state.contextState);
        this.saveState(event.state.contextState);

        // Emit context change event
        const contextChangeEvent = new CustomEvent('contextChanged', {
          detail: event.state.contextState,
          bubbles: true
        });
        document.dispatchEvent(contextChangeEvent);
      } else {
        // Parse state from URL
        const urlState = this.parseStateFromUrl();
        if (urlState) {
          console.log('🔗 Restoring state from URL after navigation');
          this.saveState(urlState);

          // Emit context change event
          const contextChangeEvent = new CustomEvent('contextChanged', {
            detail: urlState,
            bubbles: true
          });
          document.dispatchEvent(contextChangeEvent);
        }
      }
    });

    console.log('🔗 URL synchronization initialized');
  }
}

// Create singleton instance
const contextStateService = new ContextStateService();

// Export for global use
window.ContextStateService = ContextStateService;
window.contextStateService = contextStateService;