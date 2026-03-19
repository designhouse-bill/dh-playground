/**
 * ScopeSelectorComponent - Scope selection overlay panel
 * Angular-ready component for store scope selection
 *
 * Features:
 * - Three-level hierarchy: All Stores -> Regional Groups -> Individual Stores
 * - Dynamic dropdown population based on selection
 * - Store count indicators for each level
 * - Connected to mock data store hierarchy
 * - Overlay backdrop with smooth animations
 * - Apply/Cancel button actions
 *
 * @version 1.0.0
 * @author Analytics Dashboard Team
 */

class ScopeSelectorComponent {
  /**
   * Constructor - Angular-style dependency injection
   *
   * @param {HTMLElement} containerElement - DOM element to render overlay in
   * @param {ContextBarService} contextService - Context service instance
   * @param {Object} options - Configuration options
   */
  constructor(containerElement, contextService, options = {}) {
    if (!containerElement) {
      throw new Error('ScopeSelectorComponent requires a container element');
    }

    if (!contextService) {
      throw new Error('ScopeSelectorComponent requires a ContextBarService instance');
    }

    // Dependency injection
    this.container = containerElement;
    this.contextService = contextService;

    // Configuration options
    this.options = {
      defaultScope: 'all_stores',
      animationDuration: 300,
      showStoreCounts: true,
      ...options
    };

    // Component state
    this.isInitialized = false;
    this.isVisible = false;
    this.isAnimating = false;

    // Selection state - three-level hierarchy
    this.selectedScope = {
      level: 'all', // 'all', 'region', 'store'
      value: 'all_stores', // selected value ID
      name: 'All Stores', // display name
      storeCount: 0 // number of stores included
    };

    // Store hierarchy data
    this.storeData = {
      allStores: null,
      regions: [],
      individualStores: []
    };

    // DOM references
    this.overlayElement = null;
    this.panelElement = null;
    this.backdropElement = null;
    this.levelSelector = null;
    this.regionSelector = null;
    this.storeSelector = null;
    this.storeCountDisplay = null;
    this.applyButton = null;
    this.cancelButton = null;

    // Event handling
    this._eventListeners = [];
    this._serviceSubscriptions = [];
    this._callbacks = {
      onApply: null,
      onCancel: null,
      onLevelChange: null
    };

    // Bind methods to preserve 'this' context
    this.init = this.init.bind(this);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.destroy = this.destroy.bind(this);
    this._generateHTML = this._generateHTML.bind(this);
    this._loadStoreData = this._loadStoreData.bind(this);
    this._handleLevelChange = this._handleLevelChange.bind(this);
    this._handleRegionChange = this._handleRegionChange.bind(this);
    this._handleStoreChange = this._handleStoreChange.bind(this);
    this._handleApply = this._handleApply.bind(this);
    this._handleCancel = this._handleCancel.bind(this);
    this._handleBackdropClick = this._handleBackdropClick.bind(this);
    this._handleKeydown = this._handleKeydown.bind(this);
  }

  /**
   * Initialize component - Angular ngOnInit equivalent
   *
   * @returns {Promise<boolean>} Success status
   */
  async init() {
    if (this.isInitialized) {
      return true;
    }

    try {

      // Load store data from mock database
      this._loadStoreData();

      // Set initial selection
      this._setInitialSelection();

      // Set up service subscriptions
      this._subscribeToContextService();

      // Render initial HTML (hidden)
      await this._render();

      // Set up event listeners
      this._attachEventListeners();

      // Mark as initialized
      this.isInitialized = true;

      return true;

    } catch (error) {
      console.error('❌ ScopeSelectorComponent initialization failed:', error);
      return false;
    }
  }

  /**
   * Load store data from mock database
   *
   * @private
   */
  _loadStoreData() {
    try {
      const mockData = window.mockDatabase;

      if (mockData && mockData.store_hierarchy) {
        const hierarchy = mockData.store_hierarchy;

        // Load all stores info
        this.storeData.allStores = hierarchy.all_stores;

        // Load regions
        this.storeData.regions = hierarchy.regions || [];

        // Load individual stores
        this.storeData.individualStores = hierarchy.individual_stores || [];

        console.log('✅ Store hierarchy loaded from mock database');
      } else {
        console.log('📊 Using fallback store hierarchy data');
        this._generateFallbackData();
      }

    } catch (error) {
      console.error('❌ Failed to load store data:', error);
      this._generateFallbackData();
    }
  }

  /**
   * Generate fallback data if mock data is unavailable
   *
   * @private
   */
  _generateFallbackData() {
    this.storeData.allStores = {
      id: 'all_stores',
      name: 'All Stores',
      type: 'all',
      total_count: 50,
      description: 'All stores in the network'
    };

    this.storeData.regions = [
      { id: 'northeast', name: 'Northeast Region', type: 'region', store_count: 15 },
      { id: 'southeast', name: 'Southeast Region', type: 'region', store_count: 12 },
      { id: 'midwest', name: 'Midwest Region', type: 'region', store_count: 10 },
      { id: 'west', name: 'West Region', type: 'region', store_count: 13 }
    ];

    this.storeData.individualStores = [];
    for (let i = 1; i <= 50; i++) {
      const storeId = String(i).padStart(3, '0');
      this.storeData.individualStores.push({
        id: storeId,
        name: `Store ${storeId}`,
        type: 'store',
        region: i <= 15 ? 'northeast' : i <= 27 ? 'southeast' : i <= 37 ? 'midwest' : 'west'
      });
    }
  }

  /**
   * Set initial selection based on current context
   *
   * @private
   */
  _setInitialSelection() {
    // Default to all stores
    this.selectedScope = {
      level: 'all',
      value: 'all_stores',
      name: this.storeData.allStores?.name || 'All Stores',
      storeCount: this.storeData.allStores?.total_count || 0
    };
  }

  /**
   * Subscribe to context service events
   *
   * @private
   */
  _subscribeToContextService() {
    // Subscribe to context changes
    const contextSubscription = this.contextService.subscribe('stateChanged', (newState) => {
      // Handle context updates if needed
    });
    this._serviceSubscriptions.push(contextSubscription);
  }

  /**
   * Render component HTML
   *
   * @private
   * @returns {Promise<boolean>} Success status
   */
  async _render() {
    try {
      // Generate HTML content
      const html = this._generateHTML();

      // Insert into container
      this.container.innerHTML = html;

      // Get DOM references
      this.overlayElement = this.container.querySelector('.scope-selector-overlay');
      this.panelElement = this.container.querySelector('.scope-selector-panel');
      this.backdropElement = this.container.querySelector('.scope-selector-backdrop');
      this.levelSelector = this.container.querySelector('#scope-level-select');
      this.regionSelector = this.container.querySelector('#region-select');
      this.storeSelector = this.container.querySelector('#store-select');
      this.storeCountDisplay = this.container.querySelector('.store-count-display');
      this.applyButton = this.container.querySelector('.apply-btn');
      this.cancelButton = this.container.querySelector('.cancel-btn');

      // Set initial values
      this._updateSelections();

      return true;

    } catch (error) {
      console.error('❌ ScopeSelectorComponent render failed:', error);
      return false;
    }
  }

  /**
   * Generate HTML content for the component
   *
   * @private
   * @returns {string} Generated HTML string
   */
  _generateHTML() {
    // Generate level selector options
    const levelOptions = [
      { value: 'all', label: 'All Stores', count: this.storeData.allStores?.total_count || 0 },
      { value: 'region', label: 'Regional Groups', count: this.storeData.regions.length },
      { value: 'store', label: 'Individual Stores', count: this.storeData.individualStores.length }
    ];

    const levelOptionsHTML = levelOptions.map(option =>
      `<option value="${option.value}">${option.label} (${option.count})</option>`
    ).join('');

    // Generate region options
    const regionOptionsHTML = this.storeData.regions.map(region =>
      `<option value="${region.id}">${region.name} (${region.store_count} stores)</option>`
    ).join('');

    return `
      <div class="scope-selector-overlay"
           role="dialog"
           aria-modal="true"
           aria-labelledby="scope-selector-title"
           style="display: none;">
        <div class="scope-selector-backdrop" aria-hidden="true"></div>
        <div class="scope-selector-panel">
          <div class="panel-header">
            <h3 id="scope-selector-title" class="panel-title">Select Store Scope</h3>
            <button type="button"
                    class="close-btn"
                    aria-label="Close scope selector"
                    title="Close">
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <div class="panel-content">
            <!-- Level Selection -->
            <div class="scope-level-section">
              <label for="scope-level-select" class="section-label">Scope Level</label>
              <select id="scope-level-select" class="scope-select" aria-label="Select scope level">
                ${levelOptionsHTML}
              </select>
              <div class="level-description">
                <span id="level-description-text">Select the level of store grouping for your analysis</span>
              </div>
            </div>

            <!-- Regional Selection (when region level is selected) -->
            <div class="region-selection-section" id="region-selection" style="display: none;">
              <label for="region-select" class="section-label">Select Region</label>
              <select id="region-select" class="scope-select" aria-label="Select region">
                <option value="">Choose a region...</option>
                ${regionOptionsHTML}
              </select>
            </div>

            <!-- Store Selection (when store level is selected) -->
            <div class="store-selection-section" id="store-selection" style="display: none;">
              <label for="store-select" class="section-label">Select Store</label>
              <select id="store-select" class="scope-select" aria-label="Select individual store">
                <option value="">Choose a store...</option>
              </select>
              <div class="store-search">
                <input type="search"
                       id="store-search"
                       class="store-search-input"
                       placeholder="Search stores by name or location...">
              </div>
            </div>

            <!-- Selection Summary -->
            <div class="selection-summary">
              <div class="summary-header">Current Selection</div>
              <div class="summary-content">
                <div class="selection-name" id="selection-name-display">All Stores</div>
                <div class="store-count-display">
                  <span class="count-label">Stores included:</span>
                  <span class="count-value" id="store-count-value">0</span>
                </div>
              </div>
            </div>

            <!-- Scope Preview -->
            <div class="scope-preview" id="scope-preview">
              <div class="preview-content">
                ${this._generatePreviewText()}
              </div>
            </div>
          </div>

          <div class="panel-footer">
            <button type="button" class="cancel-btn btn btn-secondary">Cancel</button>
            <button type="button" class="apply-btn btn btn-primary">Apply</button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Generate preview text for selected scope
   *
   * @private
   * @returns {string} Preview text
   */
  _generatePreviewText() {
    const { level, name, storeCount } = this.selectedScope;

    switch (level) {
      case 'all':
        return `Analysis will include all ${storeCount} stores across all regions`;
      case 'region':
        return `Analysis will focus on ${name} with ${storeCount} stores`;
      case 'store':
        return `Analysis will focus on ${name} only`;
      default:
        return 'Select a scope level to see analysis coverage';
    }
  }

  /**
   * Update form selections based on current state
   *
   * @private
   */
  _updateSelections() {
    // Update level selector
    if (this.levelSelector) {
      this.levelSelector.value = this.selectedScope.level;
    }

    // Update region selector
    if (this.regionSelector && this.selectedScope.level === 'region') {
      this.regionSelector.value = this.selectedScope.value;
    }

    // Update store selector
    if (this.storeSelector && this.selectedScope.level === 'store') {
      this.storeSelector.value = this.selectedScope.value;
    }

    // Update display elements
    const nameDisplay = this.container.querySelector('#selection-name-display');
    if (nameDisplay) {
      nameDisplay.textContent = this.selectedScope.name;
    }

    const countDisplay = this.container.querySelector('#store-count-value');
    if (countDisplay) {
      countDisplay.textContent = this.selectedScope.storeCount;
    }

    // Update preview
    const previewElement = this.container.querySelector('#scope-preview .preview-content');
    if (previewElement) {
      previewElement.textContent = this._generatePreviewText();
    }

    // Show/hide appropriate sections
    this._updateSectionVisibility();
  }

  /**
   * Update visibility of selection sections based on level
   *
   * @private
   */
  _updateSectionVisibility() {
    const regionSection = this.container.querySelector('#region-selection');
    const storeSection = this.container.querySelector('#store-selection');
    const levelDescription = this.container.querySelector('#level-description-text');

    if (regionSection) {
      regionSection.style.display = this.selectedScope.level === 'region' ? 'block' : 'none';
    }

    if (storeSection) {
      storeSection.style.display = this.selectedScope.level === 'store' ? 'block' : 'none';
    }

    // Update level description
    if (levelDescription) {
      const descriptions = {
        all: 'Analysis will include data from all stores across all regions',
        region: 'Analysis will be grouped by regional performance',
        store: 'Analysis will focus on individual store performance'
      };
      levelDescription.textContent = descriptions[this.selectedScope.level] || '';
    }
  }

  /**
   * Populate store selector based on selected region
   *
   * @private
   * @param {string} regionId - Selected region ID
   */
  _populateStoreSelector(regionId = null) {
    if (!this.storeSelector) return;

    let storesToShow = this.storeData.individualStores;

    // Filter by region if specified
    if (regionId) {
      storesToShow = this.storeData.individualStores.filter(store => store.region === regionId);
    }

    // Generate options HTML
    const storeOptionsHTML = storesToShow.map(store =>
      `<option value="${store.id}">${store.name}</option>`
    ).join('');

    // Update selector
    this.storeSelector.innerHTML = `
      <option value="">Choose a store...</option>
      ${storeOptionsHTML}
    `;
  }

  /**
   * Attach event listeners
   *
   * @private
   */
  _attachEventListeners() {
    if (!this.overlayElement) return;

    // Backdrop click
    if (this.backdropElement) {
      const backdropListener = (e) => this._handleBackdropClick(e);
      this.backdropElement.addEventListener('click', backdropListener);
      this._eventListeners.push({ element: this.backdropElement, type: 'click', listener: backdropListener });
    }

    // Close button
    const closeBtn = this.container.querySelector('.close-btn');
    if (closeBtn) {
      const closeListener = (e) => this._handleCancel(e);
      closeBtn.addEventListener('click', closeListener);
      this._eventListeners.push({ element: closeBtn, type: 'click', listener: closeListener });
    }

    // Level selector
    if (this.levelSelector) {
      const levelListener = (e) => this._handleLevelChange(e);
      this.levelSelector.addEventListener('change', levelListener);
      this._eventListeners.push({ element: this.levelSelector, type: 'change', listener: levelListener });
    }

    // Region selector
    if (this.regionSelector) {
      const regionListener = (e) => this._handleRegionChange(e);
      this.regionSelector.addEventListener('change', regionListener);
      this._eventListeners.push({ element: this.regionSelector, type: 'change', listener: regionListener });
    }

    // Store selector
    if (this.storeSelector) {
      const storeListener = (e) => this._handleStoreChange(e);
      this.storeSelector.addEventListener('change', storeListener);
      this._eventListeners.push({ element: this.storeSelector, type: 'change', listener: storeListener });
    }

    // Store search
    const storeSearch = this.container.querySelector('#store-search');
    if (storeSearch) {
      const searchListener = (e) => this._handleStoreSearch(e);
      storeSearch.addEventListener('input', searchListener);
      this._eventListeners.push({ element: storeSearch, type: 'input', listener: searchListener });
    }

    // Action buttons
    if (this.applyButton) {
      const applyListener = (e) => this._handleApply(e);
      this.applyButton.addEventListener('click', applyListener);
      this._eventListeners.push({ element: this.applyButton, type: 'click', listener: applyListener });
    }

    if (this.cancelButton) {
      const cancelListener = (e) => this._handleCancel(e);
      this.cancelButton.addEventListener('click', cancelListener);
      this._eventListeners.push({ element: this.cancelButton, type: 'click', listener: cancelListener });
    }

    // Keyboard support
    const keydownListener = (e) => this._handleKeydown(e);
    this.overlayElement.addEventListener('keydown', keydownListener);
    this._eventListeners.push({ element: this.overlayElement, type: 'keydown', listener: keydownListener });
  }

  /**
   * Handle level selection changes
   *
   * @private
   * @param {Event} event - Change event
   */
  _handleLevelChange(event) {
    const newLevel = event.target.value;

    // Update selected scope
    this.selectedScope.level = newLevel;

    // Reset selection based on level
    switch (newLevel) {
      case 'all':
        this.selectedScope.value = 'all_stores';
        this.selectedScope.name = this.storeData.allStores?.name || 'All Stores';
        this.selectedScope.storeCount = this.storeData.allStores?.total_count || 0;
        break;

      case 'region':
        this.selectedScope.value = '';
        this.selectedScope.name = 'Select Region';
        this.selectedScope.storeCount = 0;
        break;

      case 'store':
        this.selectedScope.value = '';
        this.selectedScope.name = 'Select Store';
        this.selectedScope.storeCount = 1;
        // Populate all stores for selection
        this._populateStoreSelector();
        break;
    }

    // Update UI
    this._updateSelections();

    // Trigger callback
    if (this._callbacks.onLevelChange) {
      this._callbacks.onLevelChange(newLevel);
    }
  }

  /**
   * Handle region selection changes
   *
   * @private
   * @param {Event} event - Change event
   */
  _handleRegionChange(event) {
    const regionId = event.target.value;

    if (!regionId) return;

    const selectedRegion = this.storeData.regions.find(r => r.id === regionId);
    if (selectedRegion) {
      this.selectedScope.value = regionId;
      this.selectedScope.name = selectedRegion.name;
      this.selectedScope.storeCount = selectedRegion.store_count;

      // Update UI
      this._updateSelections();
    }
  }

  /**
   * Handle individual store selection changes
   *
   * @private
   * @param {Event} event - Change event
   */
  _handleStoreChange(event) {
    const storeId = event.target.value;

    if (!storeId) return;

    const selectedStore = this.storeData.individualStores.find(s => s.id === storeId);
    if (selectedStore) {
      this.selectedScope.value = storeId;
      this.selectedScope.name = selectedStore.name;
      this.selectedScope.storeCount = 1;

      // Update UI
      this._updateSelections();
    }
  }

  /**
   * Handle store search input
   *
   * @private
   * @param {Event} event - Input event
   */
  _handleStoreSearch(event) {
    const searchTerm = event.target.value.toLowerCase();

    if (!this.storeSelector) return;

    // Filter stores based on search term
    const filteredStores = this.storeData.individualStores.filter(store =>
      store.name.toLowerCase().includes(searchTerm) ||
      store.city?.toLowerCase().includes(searchTerm) ||
      store.id.includes(searchTerm)
    );

    // Update store selector options
    const storeOptionsHTML = filteredStores.map(store =>
      `<option value="${store.id}">${store.name}</option>`
    ).join('');

    this.storeSelector.innerHTML = `
      <option value="">Choose a store...</option>
      ${storeOptionsHTML}
    `;
  }

  /**
   * Handle apply button click
   *
   * @private
   * @param {Event} event - Click event
   */
  _handleApply(event) {
    event.preventDefault();

    // Validate selection
    if (this.selectedScope.level !== 'all' && !this.selectedScope.value) {
      alert('Please make a selection before applying.');
      return;
    }

    // Trigger callback with selection
    if (this._callbacks.onApply) {
      this._callbacks.onApply(this.selectedScope);
    }

    // Hide overlay
    this.hide();
  }

  /**
   * Handle cancel button click
   *
   * @private
   * @param {Event} event - Click event
   */
  _handleCancel(event) {
    event.preventDefault();

    // Trigger callback
    if (this._callbacks.onCancel) {
      this._callbacks.onCancel();
    }

    // Hide overlay
    this.hide();
  }

  /**
   * Handle backdrop click
   *
   * @private
   * @param {Event} event - Click event
   */
  _handleBackdropClick(event) {
    if (event.target === this.backdropElement) {
      this._handleCancel(event);
    }
  }

  /**
   * Handle keyboard events
   *
   * @private
   * @param {KeyboardEvent} event - Keyboard event
   */
  _handleKeydown(event) {
    switch (event.key) {
      case 'Escape':
        this._handleCancel(event);
        break;

      case 'Enter':
        if (event.target === this.applyButton || event.target === this.cancelButton) {
          event.target.click();
        }
        break;

      case 'Tab':
        // Keep focus within modal
        this._trapFocus(event);
        break;
    }
  }

  /**
   * Trap focus within the modal
   *
   * @private
   * @param {KeyboardEvent} event - Tab key event
   */
  _trapFocus(event) {
    if (!this.panelElement) return;

    const focusableElements = this.panelElement.querySelectorAll(
      'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  /**
   * Show the scope selector overlay
   *
   * @returns {Promise<boolean>} Success status
   */
  async show() {
    if (this.isVisible || this.isAnimating) {
      return false;
    }

    try {
      this.isAnimating = true;

      // Show overlay
      this.overlayElement.style.display = 'flex';

      // Trigger animation
      requestAnimationFrame(() => {
        this.overlayElement.classList.add('visible');
        this.panelElement.classList.add('visible');
      });

      // Wait for animation
      await new Promise(resolve => setTimeout(resolve, this.options.animationDuration));

      this.isVisible = true;
      this.isAnimating = false;

      // Focus first element
      const firstFocusable = this.panelElement.querySelector('button, input, select');
      if (firstFocusable) {
        firstFocusable.focus();
      }

      return true;

    } catch (error) {
      console.error('❌ Failed to show scope selector:', error);
      this.isAnimating = false;
      return false;
    }
  }

  /**
   * Hide the scope selector overlay
   *
   * @returns {Promise<boolean>} Success status
   */
  async hide() {
    if (!this.isVisible || this.isAnimating) {
      return false;
    }

    try {
      this.isAnimating = true;

      // Start hide animation
      this.overlayElement.classList.remove('visible');
      this.panelElement.classList.remove('visible');

      // Wait for animation
      await new Promise(resolve => setTimeout(resolve, this.options.animationDuration));

      // Hide overlay
      this.overlayElement.style.display = 'none';

      this.isVisible = false;
      this.isAnimating = false;

      return true;

    } catch (error) {
      console.error('❌ Failed to hide scope selector:', error);
      this.isAnimating = false;
      return false;
    }
  }

  /**
   * Set callback functions
   *
   * @param {Object} callbacks - Callback functions
   * @param {Function} callbacks.onApply - Called when apply is clicked
   * @param {Function} callbacks.onCancel - Called when cancel is clicked
   * @param {Function} callbacks.onLevelChange - Called when level changes
   */
  setCallbacks(callbacks) {
    this._callbacks = { ...this._callbacks, ...callbacks };
  }

  /**
   * Get current selection
   *
   * @returns {Object} Current scope selection
   */
  getSelection() {
    return { ...this.selectedScope };
  }

  /**
   * Set selection programmatically
   *
   * @param {Object} selection - Scope selection to set
   */
  setSelection(selection) {
    this.selectedScope = { ...this.selectedScope, ...selection };
    this._updateSelections();
  }

  /**
   * Remove event listeners
   *
   * @private
   */
  _removeEventListeners() {
    this._eventListeners.forEach(({ element, type, listener }) => {
      if (element && element.removeEventListener) {
        element.removeEventListener(type, listener);
      }
    });
    this._eventListeners = [];
  }

  /**
   * Clean up component resources - Angular ngOnDestroy equivalent
   *
   * @returns {boolean} Success status
   */
  destroy() {
    try {
      // Hide if visible
      if (this.isVisible) {
        this.hide();
      }

      // Remove event listeners
      this._removeEventListeners();

      // Unsubscribe from service
      this._serviceSubscriptions.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
      this._serviceSubscriptions = [];

      // Clear DOM
      if (this.container) {
        this.container.innerHTML = '';
      }

      // Reset references
      this.overlayElement = null;
      this.panelElement = null;
      this.backdropElement = null;
      this.levelSelector = null;
      this.regionSelector = null;
      this.storeSelector = null;
      this.storeCountDisplay = null;
      this.applyButton = null;
      this.cancelButton = null;

      // Reset state
      this.isInitialized = false;
      this.isVisible = false;
      this.isAnimating = false;

      return true;

    } catch (error) {
      console.error('❌ Error destroying ScopeSelectorComponent:', error);
      return false;
    }
  }

  /**
   * Check if component is ready for interaction
   *
   * @returns {boolean} Ready state
   */
  isReady() {
    return this.isInitialized && !!this.overlayElement;
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScopeSelectorComponent;
} else if (typeof window !== 'undefined') {
  window.ScopeSelectorComponent = ScopeSelectorComponent;
}