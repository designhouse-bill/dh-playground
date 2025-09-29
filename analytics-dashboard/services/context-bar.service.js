/**
 * ContextBarService - Angular-ready context bar service
 * Manages context state and navigation for analytics dashboard
 *
 * Features:
 * - Singleton pattern for global state management
 * - Angular service pattern for future migration
 * - Context state management with getter/setter
 * - Page type detection and context mapping
 * - Lifecycle methods for proper initialization/cleanup
 *
 * Known Issues & Browser Compatibility:
 * - Firefox: Context bar may flicker on initial load due to CSS loading timing
 * - Safari (iOS): Overlay panels may not respect safe-area-insets on older iOS versions (<12)
 * - Edge Legacy: URL parameter parsing may fail with special characters in source names
 * - Mobile Safari: Context state persistence may be cleared when memory pressure occurs
 * - Chrome DevTools: Console errors during hot reload due to event listener cleanup timing
 *
 * Limitations:
 * - State persistence relies on sessionStorage (cleared on tab close)
 * - Page type detection is DOM-dependent and may fail on dynamically loaded content
 * - URL synchronization limited to 2048 characters (browser URL limit)
 * - Context changes during page navigation may cause race conditions
 *
 * @version 1.0.0
 * @author Analytics Dashboard Team
 */

class ContextBarService {
  constructor() {
    this._contextState = {
      pageType: null,
      source: null,
      filter: null,
      sort: null,
      direction: 'desc',
      breadcrumb: [],
      description: '',
      isAnalysisContext: false
    };

    this.isInitialized = false;
    this._subscribers = new Map();
    this._eventListeners = [];

    // Bind methods to preserve 'this' context
    this.init = this.init.bind(this);
    this.destroy = this.destroy.bind(this);
    this.getContextState = this.getContextState.bind(this);
    this.setContextState = this.setContextState.bind(this);
    this._detectPageType = this._detectPageType.bind(this);
    this._handleUrlChange = this._handleUrlChange.bind(this);
    this._notifySubscribers = this._notifySubscribers.bind(this);
  }

  /**
   * Initialize the service - single entry point
   * Sets up context state, page detection, and event listeners
   *
   * @returns {Promise<boolean>} Success status
   */
  async init() {
    if (this.isInitialized) {
      return true;
    }

    try {

      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        await new Promise(resolve => {
          document.addEventListener('DOMContentLoaded', resolve);
        });
      }

      // Detect current page type and context
      this._detectPageType();

      // Parse URL parameters for context
      this._parseUrlContext();

      // Set up URL change listeners
      this._setupUrlListeners();

      // Mark as initialized
      this.isInitialized = true;

      // Notify any early subscribers
      this._notifySubscribers('initialized', this._contextState);

      return true;

    } catch (error) {
      console.error('❌ ContextBarService initialization failed:', error);
      return false;
    }
  }

  /**
   * Detect the current page type based on URL and DOM
   * Sets pageType in context state
   *
   * @private
   * @returns {string} Detected page type
   */
  _detectPageType() {
    const pathname = window.location.pathname;
    const filename = pathname.split('/').pop() || 'index.html';

    let pageType = 'overview';

    // Detect based on filename
    if (filename.includes('index') || filename === '' || filename === '/') {
      pageType = 'overview';
    } else if (filename.includes('reports')) {
      pageType = 'reports';
    } else if (filename.includes('datagrid-inquiry')) {
      pageType = 'datagrid-inquiry';
    }

    // Enhanced detection based on DOM elements
    if (document.getElementById('datagrid-inquiry-container')) {
      pageType = 'datagrid-inquiry';
    } else if (document.querySelector('.reports-container')) {
      pageType = 'reports';
    } else if (document.querySelector('.dashboard-overview')) {
      pageType = 'overview';
    }

    this._contextState.pageType = pageType;
    return pageType;
  }

  /**
   * Parse URL parameters to extract context information
   * Updates context state with URL parameters
   *
   * @private
   */
  _parseUrlContext() {
    const urlParams = new URLSearchParams(window.location.search);

    const source = urlParams.get('source');
    const filter = urlParams.get('filter');
    const sort = urlParams.get('sort');
    const direction = urlParams.get('direction') || 'desc';

    if (source) {
      this._contextState.source = source;
      this._contextState.isAnalysisContext = true;

      // Build breadcrumb based on source
      this._buildBreadcrumb(source, filter);

      // Set description based on context
      this._setContextDescription(source, filter);
    }

    if (filter) this._contextState.filter = filter;
    if (sort) this._contextState.sort = sort;
    if (direction) this._contextState.direction = direction;

  }

  /**
   * Build breadcrumb navigation based on source and filter
   *
   * @private
   * @param {string} source - Source context identifier
   * @param {string} filter - Optional filter context
   */
  _buildBreadcrumb(source, filter) {
    const breadcrumb = [
      { label: 'Dashboard', href: '../index.html' }
    ];

    // Format source name for display
    const sourceFormatted = source
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());

    breadcrumb.push({
      label: sourceFormatted,
      href: null // Current context, no link
    });

    if (filter) {
      const filterFormatted = filter
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());

      breadcrumb.push({
        label: filterFormatted,
        href: null
      });
    }

    this._contextState.breadcrumb = breadcrumb;
  }

  /**
   * Set context description based on source and filter
   *
   * @private
   * @param {string} source - Source context identifier
   * @param {string} filter - Optional filter context
   */
  _setContextDescription(source, filter) {
    const descriptions = {
      'ytd-traffic': 'Year-to-date traffic analysis and performance metrics',
      'digital-adoption': 'Digital engagement and adoption patterns',
      'print-rate': 'Print sharing activity and distribution rates',
      'digital-performance': 'Digital circular performance and engagement metrics',
      'traffic': 'Traffic patterns and user engagement analysis',
      'share-activity': 'Social sharing and viral activity metrics',
      'performance-day': 'Daily performance trends and patterns',
      'interaction-rate': 'User interaction rates and engagement metrics',
      'categories': 'Category-wise performance and analysis',
      'promotions': 'Promotion effectiveness and performance data',
      'size-mix': 'Size distribution and mix analysis',
      'size-performance': 'Size-based performance comparisons',
      'deal-preference': 'Deal type preferences and effectiveness'
    };

    let description = descriptions[source] || 'Detailed data exploration and insights';

    if (filter) {
      const filterText = filter.replace(/-/g, ' ');
      description += ` - ${filterText} view`;
    }

    this._contextState.description = `Analyzing: ${description}`;
  }

  /**
   * Set up URL change listeners for navigation tracking
   *
   * @private
   */
  _setupUrlListeners() {
    // Listen for popstate (back/forward navigation)
    const popstateListener = (event) => {
      this._handleUrlChange();
    };
    window.addEventListener('popstate', popstateListener);
    this._eventListeners.push({ type: 'popstate', listener: popstateListener });

    // Listen for hash changes
    const hashchangeListener = (event) => {
      this._handleUrlChange();
    };
    window.addEventListener('hashchange', hashchangeListener);
    this._eventListeners.push({ type: 'hashchange', listener: hashchangeListener });
  }

  /**
   * Handle URL changes and update context
   *
   * @private
   */
  _handleUrlChange() {
    // Re-detect page type
    this._detectPageType();

    // Re-parse URL context
    this._parseUrlContext();

    // Notify subscribers of context change
    this._notifySubscribers('contextChanged', this._contextState);
  }

  /**
   * Get current context state
   *
   * @returns {Object} Current context state object
   */
  getContextState() {
    return { ...this._contextState }; // Return copy to prevent mutation
  }

  /**
   * Set context state with validation and change detection
   *
   * @param {Object} newState - New context state or partial update
   * @param {boolean} merge - Whether to merge with existing state (default: true)
   * @returns {boolean} Success status
   */
  setContextState(newState, merge = true) {
    if (!newState || typeof newState !== 'object') {
      console.error('❌ Invalid context state provided');
      return false;
    }

    try {
      const oldState = { ...this._contextState };

      if (merge) {
        // Merge with existing state
        this._contextState = { ...this._contextState, ...newState };
      } else {
        // Replace entire state (preserve required fields)
        this._contextState = {
          pageType: newState.pageType || this._contextState.pageType,
          source: null,
          filter: null,
          sort: null,
          direction: 'desc',
          breadcrumb: [],
          description: '',
          isAnalysisContext: false,
          ...newState
        };
      }

      // Notify subscribers of state change
      this._notifySubscribers('stateChanged', this._contextState, oldState);

      return true;

    } catch (error) {
      console.error('❌ Failed to set context state:', error);
      return false;
    }
  }

  /**
   * Subscribe to context changes
   *
   * @param {string} event - Event type ('initialized', 'contextChanged', 'stateChanged')
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
          console.error(`❌ Error in context subscriber callback:`, error);
        }
      });
    }
  }

  /**
   * Clean up resources and event listeners
   * Should be called before page unload or service destruction
   *
   * @returns {boolean} Success status
   */
  destroy() {
    try {
      // Remove event listeners
      this._eventListeners.forEach(({ type, listener }) => {
        window.removeEventListener(type, listener);
      });
      this._eventListeners = [];

      // Clear subscribers
      this._subscribers.clear();

      // Reset state
      this._contextState = {
        pageType: null,
        source: null,
        filter: null,
        sort: null,
        direction: 'desc',
        breadcrumb: [],
        description: '',
        isAnalysisContext: false
      };

      // Mark as uninitialized
      this.isInitialized = false;

      return true;

    } catch (error) {
      console.error('❌ Error destroying ContextBarService:', error);
      return false;
    }
  }

  /**
   * Get service instance (singleton pattern)
   * Creates new instance if none exists
   *
   * @static
   * @returns {ContextBarService} Service instance
   */
  static getInstance() {
    if (!ContextBarService._instance) {
      ContextBarService._instance = new ContextBarService();
    }
    return ContextBarService._instance;
  }

  /**
   * Check if service has been instantiated
   *
   * @static
   * @returns {boolean} True if instance exists
   */
  static hasInstance() {
    return !!ContextBarService._instance;
  }

  /**
   * Reset singleton instance (useful for testing)
   *
   * @static
   */
  static resetInstance() {
    if (ContextBarService._instance) {
      ContextBarService._instance.destroy();
      ContextBarService._instance = null;
    }
  }
}

// Static instance holder
ContextBarService._instance = null;

// Auto-cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (ContextBarService.hasInstance()) {
      ContextBarService.getInstance().destroy();
    }
  });
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContextBarService;
} else if (typeof window !== 'undefined') {
  window.ContextBarService = ContextBarService;
}