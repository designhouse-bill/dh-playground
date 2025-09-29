/**
 * PeriodSelectorComponent - Period selection overlay panel
 * Angular-ready component for time period selection
 *
 * Features:
 * - Single week mode (dashboard)
 * - Compare mode (analyze/reports)
 * - Week dropdown selectors with recent weeks
 * - Overlay backdrop with smooth animations
 * - Apply/Cancel button actions
 * - Page-specific behavior logic
 *
 * @version 1.0.0
 * @author Analytics Dashboard Team
 */

class PeriodSelectorComponent {
  /**
   * Constructor - Angular-style dependency injection
   *
   * @param {HTMLElement} containerElement - DOM element to render overlay in
   * @param {ContextBarService} contextService - Context service instance
   * @param {Object} options - Configuration options
   */
  constructor(containerElement, contextService, options = {}) {
    if (!containerElement) {
      throw new Error('PeriodSelectorComponent requires a container element');
    }

    if (!contextService) {
      throw new Error('PeriodSelectorComponent requires a ContextBarService instance');
    }

    // Dependency injection
    this.container = containerElement;
    this.contextService = contextService;

    // Configuration options
    this.options = {
      enableCompareMode: true,
      defaultWeek: this._getCurrentWeek(),
      weeksToShow: 12,
      animationDuration: 300,
      ...options
    };

    // Component state
    this.isInitialized = false;
    this.isVisible = false;
    this.isAnimating = false;
    this.currentPageType = 'overview';

    // Selection state
    this.selectedPeriod = {
      mode: 'single', // 'single' or 'compare'
      primaryWeek: this.options.defaultWeek,
      compareWeek: this.options.defaultWeek - 1
    };

    // DOM references
    this.overlayElement = null;
    this.panelElement = null;
    this.backdropElement = null;
    this.modeToggle = null;
    this.primaryWeekSelect = null;
    this.compareWeekSelect = null;
    this.applyButton = null;
    this.cancelButton = null;

    // Available weeks data
    this.availableWeeks = [];

    // Event handling
    this._eventListeners = [];
    this._serviceSubscriptions = [];
    this._callbacks = {
      onApply: null,
      onCancel: null,
      onModeChange: null
    };

    // Bind methods to preserve 'this' context
    this.init = this.init.bind(this);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.destroy = this.destroy.bind(this);
    this._generateHTML = this._generateHTML.bind(this);
    this._handleApply = this._handleApply.bind(this);
    this._handleCancel = this._handleCancel.bind(this);
    this._handleModeToggle = this._handleModeToggle.bind(this);
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

      // Get page type from context service
      const contextState = this.contextService.getContextState();
      this.currentPageType = contextState.pageType || 'overview';

      // Configure component based on page type
      this._configureForPageType();

      // Generate available weeks
      this._generateAvailableWeeks();

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
      console.error('❌ PeriodSelectorComponent initialization failed:', error);
      return false;
    }
  }

  /**
   * Configure component behavior based on page type
   *
   * @private
   */
  _configureForPageType() {
    switch (this.currentPageType) {
      case 'overview':
        // Dashboard: single week only
        this.selectedPeriod.mode = 'single';
        this.options.enableCompareMode = false;
        break;

      case 'reports':
      case 'datagrid-inquiry':
        // Reports/Analysis: comparison enabled
        this.options.enableCompareMode = true;
        break;

      default:
        this.options.enableCompareMode = true;
    }
  }

  /**
   * Generate available weeks data
   *
   * @private
   */
  _generateAvailableWeeks() {
    const currentWeek = this._getCurrentWeek();
    const weeks = [];

    for (let i = 0; i < this.options.weeksToShow; i++) {
      const weekNum = currentWeek - i;
      const startDate = this._getWeekStartDate(weekNum);
      const endDate = this._getWeekEndDate(weekNum);
      const isCurrentWeek = weekNum === currentWeek;

      weeks.push({
        value: weekNum,
        label: `Week ${weekNum}`,
        fullLabel: `Week ${weekNum}: ${startDate} - ${endDate}${isCurrentWeek ? ' (Current)' : ''}`,
        startDate: startDate,
        endDate: endDate,
        isCurrent: isCurrentWeek
      });
    }

    this.availableWeeks = weeks;
  }

  /**
   * Subscribe to context service events
   *
   * @private
   */
  _subscribeToContextService() {
    // Subscribe to page type changes
    const contextSubscription = this.contextService.subscribe('stateChanged', (newState) => {
      if (newState.pageType !== this.currentPageType) {
        this.currentPageType = newState.pageType;
        this._configureForPageType();
        this._updateModeToggleVisibility();
      }
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
      this.overlayElement = this.container.querySelector('.period-selector-overlay');
      this.panelElement = this.container.querySelector('.period-selector-panel');
      this.backdropElement = this.container.querySelector('.period-selector-backdrop');
      this.modeToggle = this.container.querySelector('.mode-toggle');
      this.primaryWeekSelect = this.container.querySelector('#primary-week-select');
      this.compareWeekSelect = this.container.querySelector('#compare-week-select');
      this.applyButton = this.container.querySelector('.apply-btn');
      this.cancelButton = this.container.querySelector('.cancel-btn');

      // Set initial values
      this._updateSelections();

      return true;

    } catch (error) {
      console.error('❌ PeriodSelectorComponent render failed:', error);
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
    const weekOptions = this.availableWeeks.map(week =>
      `<option value="${week.value}" ${week.isCurrent ? 'selected' : ''}>${week.fullLabel}</option>`
    ).join('');

    const modeToggleHTML = this.options.enableCompareMode ? `
      <div class="mode-section">
        <label class="section-label">Selection Mode</label>
        <div class="mode-toggle" role="radiogroup" aria-label="Period selection mode">
          <button type="button"
                  class="mode-option ${this.selectedPeriod.mode === 'single' ? 'active' : ''}"
                  data-mode="single"
                  role="radio"
                  aria-checked="${this.selectedPeriod.mode === 'single'}"
                  aria-label="Single week mode">
            <span class="mode-icon">📅</span>
            <span class="mode-text">Single Week</span>
          </button>
          <button type="button"
                  class="mode-option ${this.selectedPeriod.mode === 'compare' ? 'active' : ''}"
                  data-mode="compare"
                  role="radio"
                  aria-checked="${this.selectedPeriod.mode === 'compare'}"
                  aria-label="Compare weeks mode">
            <span class="mode-icon">📊</span>
            <span class="mode-text">Compare Weeks</span>
          </button>
        </div>
      </div>
    ` : '';

    const compareWeekHTML = this.options.enableCompareMode && this.selectedPeriod.mode === 'compare' ? `
      <div class="week-selector compare-week-selector">
        <label for="compare-week-select" class="selector-label">Compare to Week</label>
        <select id="compare-week-select" class="week-select" aria-label="Select comparison week">
          ${weekOptions}
        </select>
      </div>
    ` : '';

    return `
      <div class="period-selector-overlay"
           role="dialog"
           aria-modal="true"
           aria-labelledby="period-selector-title"
           style="display: none;">
        <div class="period-selector-backdrop" aria-hidden="true"></div>
        <div class="period-selector-panel">
          <div class="panel-header">
            <h3 id="period-selector-title" class="panel-title">Select Time Period</h3>
            <button type="button"
                    class="close-btn"
                    aria-label="Close period selector"
                    title="Close">
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <div class="panel-content">
            ${modeToggleHTML}

            <div class="week-selectors">
              <div class="week-selector primary-week-selector">
                <label for="primary-week-select" class="selector-label">
                  ${this.selectedPeriod.mode === 'compare' ? 'Primary Week' : 'Select Week'}
                </label>
                <select id="primary-week-select" class="week-select" aria-label="Select primary week">
                  ${weekOptions}
                </select>
              </div>

              ${compareWeekHTML}
            </div>

            <div class="period-preview" id="period-preview">
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
   * Generate preview text for selected period
   *
   * @private
   * @returns {string} Preview text
   */
  _generatePreviewText() {
    const primaryWeek = this.availableWeeks.find(w => w.value === this.selectedPeriod.primaryWeek);

    if (this.selectedPeriod.mode === 'single') {
      return `Showing data for ${primaryWeek ? primaryWeek.fullLabel : 'selected week'}`;
    } else {
      const compareWeek = this.availableWeeks.find(w => w.value === this.selectedPeriod.compareWeek);
      return `Comparing ${primaryWeek ? primaryWeek.label : 'primary week'} vs ${compareWeek ? compareWeek.label : 'comparison week'}`;
    }
  }

  /**
   * Update form selections based on current state
   *
   * @private
   */
  _updateSelections() {
    if (this.primaryWeekSelect) {
      this.primaryWeekSelect.value = this.selectedPeriod.primaryWeek;
    }

    if (this.compareWeekSelect) {
      this.compareWeekSelect.value = this.selectedPeriod.compareWeek;
    }

    // Update preview
    const previewElement = this.container.querySelector('#period-preview .preview-content');
    if (previewElement) {
      previewElement.textContent = this._generatePreviewText();
    }
  }

  /**
   * Update mode toggle visibility and state
   *
   * @private
   */
  _updateModeToggleVisibility() {
    if (!this.modeToggle) return;

    if (this.options.enableCompareMode) {
      this.modeToggle.style.display = 'flex';
    } else {
      this.modeToggle.style.display = 'none';
      this.selectedPeriod.mode = 'single';
    }
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

    // Mode toggle buttons
    if (this.modeToggle) {
      const modeButtons = this.modeToggle.querySelectorAll('.mode-option');
      modeButtons.forEach(button => {
        const modeListener = (e) => this._handleModeToggle(e);
        button.addEventListener('click', modeListener);
        this._eventListeners.push({ element: button, type: 'click', listener: modeListener });
      });
    }

    // Week selectors
    if (this.primaryWeekSelect) {
      const primaryListener = (e) => this._handleWeekChange(e, 'primary');
      this.primaryWeekSelect.addEventListener('change', primaryListener);
      this._eventListeners.push({ element: this.primaryWeekSelect, type: 'change', listener: primaryListener });
    }

    if (this.compareWeekSelect) {
      const compareListener = (e) => this._handleWeekChange(e, 'compare');
      this.compareWeekSelect.addEventListener('change', compareListener);
      this._eventListeners.push({ element: this.compareWeekSelect, type: 'change', listener: compareListener });
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
   * Handle mode toggle button clicks
   *
   * @private
   * @param {Event} event - Click event
   */
  _handleModeToggle(event) {
    const button = event.currentTarget;
    const newMode = button.getAttribute('data-mode');

    if (newMode === this.selectedPeriod.mode) return;

    this.selectedPeriod.mode = newMode;

    // Update button states
    const modeButtons = this.modeToggle.querySelectorAll('.mode-option');
    modeButtons.forEach(btn => {
      const isActive = btn.getAttribute('data-mode') === newMode;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-checked', isActive);
    });

    // Show/hide compare week selector
    this._toggleCompareWeekSelector();

    // Update preview
    this._updateSelections();

    // Trigger callback
    if (this._callbacks.onModeChange) {
      this._callbacks.onModeChange(newMode);
    }
  }

  /**
   * Toggle compare week selector visibility
   *
   * @private
   */
  _toggleCompareWeekSelector() {
    const compareSelector = this.container.querySelector('.compare-week-selector');
    if (compareSelector) {
      if (this.selectedPeriod.mode === 'compare') {
        compareSelector.style.display = 'block';
        // Re-render to add the selector if it doesn't exist
        if (!this.compareWeekSelect) {
          this._render();
          this._attachEventListeners();
        }
      } else {
        compareSelector.style.display = 'none';
      }
    }
  }

  /**
   * Handle week selection changes
   *
   * @private
   * @param {Event} event - Change event
   * @param {string} type - 'primary' or 'compare'
   */
  _handleWeekChange(event, type) {
    const selectedWeek = parseInt(event.target.value);

    if (type === 'primary') {
      this.selectedPeriod.primaryWeek = selectedWeek;
    } else if (type === 'compare') {
      this.selectedPeriod.compareWeek = selectedWeek;
    }

    // Update preview
    this._updateSelections();
  }

  /**
   * Handle apply button click
   *
   * @private
   * @param {Event} event - Click event
   */
  _handleApply(event) {
    event.preventDefault();

    // Trigger callback with selection
    if (this._callbacks.onApply) {
      this._callbacks.onApply(this.selectedPeriod);
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
   * Show the period selector overlay
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
      console.error('❌ Failed to show period selector:', error);
      this.isAnimating = false;
      return false;
    }
  }

  /**
   * Hide the period selector overlay
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
      console.error('❌ Failed to hide period selector:', error);
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
   * @param {Function} callbacks.onModeChange - Called when mode changes
   */
  setCallbacks(callbacks) {
    this._callbacks = { ...this._callbacks, ...callbacks };
  }

  /**
   * Get current selection
   *
   * @returns {Object} Current period selection
   */
  getSelection() {
    return { ...this.selectedPeriod };
  }

  /**
   * Set selection programmatically
   *
   * @param {Object} selection - Period selection to set
   */
  setSelection(selection) {
    this.selectedPeriod = { ...this.selectedPeriod, ...selection };
    this._updateSelections();
  }

  /**
   * Get current week number
   *
   * @private
   * @returns {number} Current week number
   */
  _getCurrentWeek() {
    // Simplified week calculation for demo
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.floor(diff / oneWeek) + 1;
  }

  /**
   * Get week start date
   *
   * @private
   * @param {number} weekNumber - Week number
   * @returns {string} Formatted start date
   */
  _getWeekStartDate(weekNumber) {
    // Simplified date calculation for demo
    const year = new Date().getFullYear();
    const start = new Date(year, 0, 1);
    const weekStart = new Date(start.getTime() + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1000);
    return weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  /**
   * Get week end date
   *
   * @private
   * @param {number} weekNumber - Week number
   * @returns {string} Formatted end date
   */
  _getWeekEndDate(weekNumber) {
    // Simplified date calculation for demo
    const year = new Date().getFullYear();
    const start = new Date(year, 0, 1);
    const weekEnd = new Date(start.getTime() + weekNumber * 7 * 24 * 60 * 60 * 1000 - 1);
    return weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
      this.modeToggle = null;
      this.primaryWeekSelect = null;
      this.compareWeekSelect = null;
      this.applyButton = null;
      this.cancelButton = null;

      // Reset state
      this.isInitialized = false;
      this.isVisible = false;
      this.isAnimating = false;

      return true;

    } catch (error) {
      console.error('❌ Error destroying PeriodSelectorComponent:', error);
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
  module.exports = PeriodSelectorComponent;
} else if (typeof window !== 'undefined') {
  window.PeriodSelectorComponent = PeriodSelectorComponent;
}