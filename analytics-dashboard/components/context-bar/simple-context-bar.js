/**
 * Simple Context Bar - Working Implementation
 * Minimal, functional context bar with working overlay buttons
 */

class SimpleContextBar {
  constructor(container) {
    this.container = container;
    this.currentWeek = this.getCurrentWeek();
    this.pageType = this.detectPageType();

    // Get store count dynamically from data
    const hierarchy = this.getStoreHierarchy();
    const storeCount = hierarchy.all.count;

    // Initialize with defaults
    this.selectedWeek = this.currentWeek;
    this.selectedScope = {
      level: 'all', // 'all', 'version-group', 'store'
      id: 'all',
      name: 'All Stores',
      count: storeCount
    };
    this.comparisonMode = false;
    this.selectedCompareWeek = null;

    // Visual state tracking
    this.isLoading = false;

    // Error handling
    this.debugMode = this.isDebugMode();
    this.errorState = null;
    this.availableWeeks = this.getAvailableWeeks();

    // Load saved state if available
    this.loadSavedState();

    this.init();
  }

  init() {
    this.render();
    this.attachEvents();
  }

  /**
   * Check if debug mode is enabled
   */
  isDebugMode() {
    return window.location.search.includes('debug=true') ||
           window.location.hostname === 'localhost' ||
           localStorage.getItem('contextBar.debug') === 'true' ||
           window.location.protocol === 'file:'; // Add file protocol for local testing
  }

  enableDebug() {
    localStorage.setItem('contextBar.debug', 'true');
    this.debugMode = true;
    console.log('🐛 Debug mode enabled');
  }

  /**
   * Log error messages (dev mode only)
   */
  logError(message, error = null, context = {}) {
    if (this.debugMode) {
      console.error('🚨 Context Bar Error:', message, {
        error,
        context,
        currentState: {
          week: this.selectedWeek,
          scope: this.selectedScope,
          comparison: this.comparisonMode,
          compareWeek: this.selectedCompareWeek
        }
      });
    }
  }

  /**
   * Log warning messages (dev mode only)
   */
  logWarning(message, context = {}) {
    if (this.debugMode) {
      console.warn('⚠️ Context Bar Warning:', message, { context });
    }
  }

  /**
   * Validate week selection
   */
  validateWeekSelection(selectedWeek, compareWeek = null) {
    const errors = [];

    // Check if selected week is available
    if (!this.availableWeeks.find(w => w.number === selectedWeek)) {
      errors.push({
        type: 'invalid_week',
        message: `Week ${selectedWeek} is not available`,
        code: 'WEEK_NOT_AVAILABLE'
      });
    }

    // Check if week has data (basic validation)
    if (!this.hasWeekData(selectedWeek)) {
      errors.push({
        type: 'no_data',
        message: `No data available for Week ${selectedWeek}`,
        code: 'WEEK_NO_DATA'
      });
    }

    // Validate comparison weeks
    if (compareWeek !== null) {
      if (selectedWeek === compareWeek) {
        errors.push({
          type: 'same_week_comparison',
          message: 'Please select different weeks to compare',
          code: 'SAME_WEEK_COMPARISON'
        });
      }

      if (!this.availableWeeks.find(w => w.number === compareWeek)) {
        errors.push({
          type: 'invalid_compare_week',
          message: `Week ${compareWeek} is not available for comparison`,
          code: 'COMPARE_WEEK_NOT_AVAILABLE'
        });
      }

      if (!this.hasWeekData(compareWeek)) {
        errors.push({
          type: 'no_compare_data',
          message: `No data available for Week ${compareWeek} comparison`,
          code: 'COMPARE_WEEK_NO_DATA'
        });
      }
    }

    return errors;
  }

  /**
   * Validate store selection
   */
  validateStoreSelection(scope) {
    const errors = [];

    if (!scope || typeof scope !== 'object') {
      errors.push({
        type: 'invalid_scope',
        message: 'Invalid store scope selection',
        code: 'INVALID_SCOPE'
      });
      return errors;
    }

    // Validate scope level
    if (!['all', 'version-group', 'store'].includes(scope.level)) {
      errors.push({
        type: 'invalid_scope_level',
        message: `Invalid scope level: ${scope.level}`,
        code: 'INVALID_SCOPE_LEVEL'
      });
    }

    // Validate scope data availability
    if (scope.level === 'version-group') {
      const hierarchy = this.getStoreHierarchy();
      if (!hierarchy.versionGroups.find(r => r.id === scope.id)) {
        errors.push({
          type: 'version_group_not_found',
          message: `Version-Group "${scope.id}" not found`,
          code: 'VERSION_GROUP_NOT_FOUND'
        });
      }
    } else if (scope.level === 'store') {
      const hierarchy = this.getStoreHierarchy();
      if (!hierarchy.stores.find(s => s.id === scope.id)) {
        errors.push({
          type: 'store_not_found',
          message: `Store "${scope.id}" not found`,
          code: 'STORE_NOT_FOUND'
        });
      }
    }

    return errors;
  }

  /**
   * Check if week has data available
   */
  hasWeekData(week) {
    // Basic check - in a real implementation, this would check against actual data
    const minWeek = 30;
    const maxWeek = 45;
    return week >= minWeek && week <= maxWeek;
  }

  /**
   * Show error message to user
   */
  showErrorMessage(errors) {
    if (!errors || errors.length === 0) return;

    const primaryError = errors[0];
    const errorContainer = this.createErrorContainer();

    errorContainer.innerHTML = `
      <div class="context-error-message">
        <div class="error-icon">⚠️</div>
        <div class="error-content">
          <h4>Selection Error</h4>
          <p>${primaryError.message}</p>
          ${errors.length > 1 ? `<p class="error-count">+ ${errors.length - 1} more issue${errors.length > 2 ? 's' : ''}</p>` : ''}
        </div>
        <button class="error-dismiss" onclick="this.parentElement.remove()">×</button>
      </div>
    `;

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      if (errorContainer.parentElement) {
        errorContainer.remove();
      }
    }, 5000);

    this.logError(`Validation failed: ${primaryError.message}`, null, { errors });
  }

  /**
   * Create or get error container
   */
  createErrorContainer() {
    let errorContainer = document.querySelector('.context-error-container');

    if (!errorContainer) {
      errorContainer = document.createElement('div');
      errorContainer.className = 'context-error-container';

      // Insert after context bar
      this.container.parentNode.insertBefore(errorContainer, this.container.nextSibling);
    }

    return errorContainer;
  }

  /**
   * Fallback to safe defaults on error
   */
  fallbackToDefaults(reason = 'error') {
    this.logWarning(`Falling back to defaults due to: ${reason}`);

    // Get current store count from data
    const hierarchy = this.getStoreHierarchy();
    const storeCount = hierarchy.all.count;

    const safeDefaults = {
      selectedWeek: this.currentWeek,
      selectedScope: {
        level: 'all',
        id: 'all',
        name: 'All Stores',
        count: storeCount
      },
      comparisonMode: false,
      selectedCompareWeek: null
    };

    // Apply safe defaults
    Object.assign(this, safeDefaults);

    // Clear error state
    this.errorState = null;

    // Re-render with safe state
    this.render();
    this.saveCurrentState();

    return safeDefaults;
  }

  detectPageType() {
    const pathname = window.location.pathname;
    const filename = pathname.split('/').pop() || 'index.html';

    // Detect page type based on filename and URL patterns
    if (filename === 'index.html' || filename === '' || pathname.endsWith('/')) {
      return 'dashboard';
    } else if (filename === 'reports.html' || pathname.includes('reports')) {
      return 'reports';
    } else if (filename === 'analyze.html' || pathname.includes('analyze')) {
      return 'analyze';
    } else if (filename.includes('datagrid') || filename.includes('inquiry')) {
      return 'analyze'; // Treat inquiry pages as analyze type
    }

    // Default to dashboard for unknown pages
    return 'dashboard';
  }

  getPageCapabilities() {
    switch (this.pageType) {
      case 'dashboard':
        return {
          allowComparison: true, // Enable comparison for dashboard too
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
          allowComparison: true, // Enable comparison by default
          defaultMode: 'single',
          title: 'Context'
        };
    }
  }

  getCurrentWeek() {
    // Get current week from mock database or default to 40
    const mockData = window.mockDatabase;
    return mockData?.weeklyMetrics?.current_week || 40;
  }

  getWeekDateRange(weekNumber) {
    // Calculate date range for a given week number
    // Using 2025 and assuming week 40 starts on Sep 29, 2025
    const week40Start = new Date(2025, 8, 29); // Sep 29, 2025 (month is 0-indexed)
    const weekDiff = weekNumber - 40;
    const weekStart = new Date(week40Start);
    weekStart.setDate(weekStart.getDate() + (weekDiff * 7));

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const formatDate = (date) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[date.getMonth()]} ${date.getDate()}`;
    };

    return {
      start: formatDate(weekStart),
      end: formatDate(weekEnd),
      startDate: weekStart,
      endDate: weekEnd
    };
  }

  getAvailableWeeks() {
    // Get weeks that actually have data from the promotions
    const mockData = window.mockDatabase;
    const availableWeekNumbers = new Set();

    if (mockData && mockData.promotions) {
      // Extract unique weeks from actual data
      mockData.promotions.forEach(promo => {
        if (promo.week) {
          availableWeekNumbers.add(promo.week);
        }
      });
    }

    // If no weeks found in data, default to current week only
    if (availableWeekNumbers.size === 0) {
      availableWeekNumbers.add(this.currentWeek);
    }

    // Generate week objects for each available week
    const weeks = Array.from(availableWeekNumbers).map(weekNumber => {
      const dateRange = this.getWeekDateRange(weekNumber);
      return {
        number: weekNumber,
        label: `Week ${weekNumber}: ${dateRange.start}-${dateRange.end}, 2025`,
        isCurrent: weekNumber === this.currentWeek,
        ...dateRange
      };
    });

    // Sort in reverse chronological order (most recent first)
    return weeks.sort((a, b) => b.number - a.number);
  }

  getSelectedWeekInfo() {
    const weeks = this.getAvailableWeeks();
    return weeks.find(w => w.number === this.selectedWeek) || weeks[weeks.length - 1];
  }

  getStoreHierarchy() {
    // Try to get from mock database first, then fallback to built-in data
    const mockData = window.mockDatabase;
    if (mockData && mockData.store_hierarchy) {
      return {
        all: { name: "All Stores", count: mockData.store_hierarchy.all_stores?.total_count || 67 },
        versionGroups: mockData.store_hierarchy.version_groups || [],
        stores: mockData.store_hierarchy.individual_stores || []
      };
    }

    // Fallback store hierarchy data
    return {
      all: { name: "All Stores", count: 67 },
      versionGroups: [
        { id: "northeast", name: "Northeast Version-Group", count: 15 },
        { id: "southeast", name: "Southeast Version-Group", count: 12 },
        { id: "midwest", name: "Midwest Version-Group", count: 10 },
        { id: "west", name: "West Version-Group", count: 13 },
        { id: "southwest", name: "Southwest Version-Group", count: 8 },
        { id: "pacific", name: "Pacific Version-Group", count: 9 }
      ],
      stores: [
        // Northeast stores
        { id: "001", name: "Boston Downtown", versionGroup: "northeast" },
        { id: "002", name: "Cambridge Square", versionGroup: "northeast" },
        { id: "003", name: "Worcester Mall", versionGroup: "northeast" },
        { id: "004", name: "Hartford Center", versionGroup: "northeast" },
        { id: "005", name: "Albany Plaza", versionGroup: "northeast" },
        // Southeast stores
        { id: "016", name: "Miami Lakes", versionGroup: "southeast" },
        { id: "017", name: "Atlanta Midtown", versionGroup: "southeast" },
        { id: "018", name: "Charlotte Plaza", versionGroup: "southeast" },
        { id: "019", name: "Jacksonville Beach", versionGroup: "southeast" },
        { id: "020", name: "Tampa Bay", versionGroup: "southeast" },
        // Midwest stores
        { id: "028", name: "Chicago Loop", versionGroup: "midwest" },
        { id: "029", name: "Detroit Center", versionGroup: "midwest" },
        { id: "030", name: "Cleveland Heights", versionGroup: "midwest" },
        { id: "031", name: "Indianapolis Square", versionGroup: "midwest" },
        { id: "032", name: "Milwaukee Downtown", versionGroup: "midwest" },
        // Add more stores for other version groups...
        { id: "041", name: "Denver Tech", versionGroup: "west" },
        { id: "042", name: "Salt Lake Plaza", versionGroup: "west" },
        { id: "050", name: "Phoenix Mall", versionGroup: "southwest" },
        { id: "051", name: "Austin Center", versionGroup: "southwest" },
        { id: "060", name: "Los Angeles Beach", versionGroup: "pacific" },
        { id: "061", name: "San Francisco Bay", versionGroup: "pacific" }
      ]
    };
  }

  getStoresByVersionGroup(versionGroupId) {
    const hierarchy = this.getStoreHierarchy();
    return hierarchy.stores.filter(store => store.versionGroup === versionGroupId);
  }

  getContextState() {
    // Return context state that can be passed to ContextBarService
    return {
      pageType: this.pageType,
      mode: this.comparisonMode ? 'compare' : 'single',
      primaryWeek: this.selectedWeek,
      compareWeek: this.selectedCompareWeek,
      scope: this.selectedScope,
      capabilities: this.getPageCapabilities()
    };
  }

  loadSavedState() {
    // Load state from ContextStateService if available
    if (window.contextStateService) {
      // First, try to parse state from URL
      const urlState = window.contextStateService.parseStateFromUrl();

      let stateToApply;

      if (urlState) {
        // URL state takes precedence - save it and use it
        window.contextStateService.saveState(urlState);
        stateToApply = urlState;
        console.log('🔗 State loaded from URL:', urlState);
      } else {
        // Fall back to stored state
        stateToApply = window.contextStateService.loadState(this.pageType);
        console.log('📂 State loaded from storage:', stateToApply);
      }

      // Apply state to component
      this.selectedWeek = stateToApply.week;
      this.selectedCompareWeek = stateToApply.compareWeek;
      this.comparisonMode = stateToApply.comparisonMode;
      this.selectedScope = {
        level: stateToApply.scopeLevel,
        id: stateToApply.scopeValue,
        name: stateToApply.scopeName,
        count: stateToApply.scopeCount
      };

      // If we loaded from URL, sync to URL without pushing new history entry
      if (urlState) {
        window.contextStateService.syncStateToUrl(stateToApply, true); // replaceState
      }
    }
  }

  saveCurrentState() {
    // Save current state using ContextStateService
    if (window.contextStateService) {
      const currentState = window.contextStateService.createStateFromContext(this);
      window.contextStateService.saveState(currentState);

      // Sync state to URL
      window.contextStateService.syncStateToUrl(currentState);

      // Emit context change event for dashboard integration
      this.emitContextChange(currentState);
    }
  }

  /**
   * Emit context change event for dashboard integration
   */
  emitContextChange(contextState) {
    const event = new CustomEvent('contextChanged', {
      detail: contextState,
      bubbles: true
    });

    document.dispatchEvent(event);
    console.log('📊 Context change event emitted:', contextState);
  }

  render() {
    if (this.debugMode) {
      console.log('🎨 Starting render...');
    }

    const weekInfo = this.getSelectedWeekInfo();
    const weekStartFormatted = weekInfo.startDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).toUpperCase();
    const weekEndFormatted = weekInfo.endDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).toUpperCase();

    // Generate week display based on comparison mode
    let weekDisplay;
    if (this.comparisonMode && this.selectedCompareWeek) {
      const compareWeekInfo = this.getAvailableWeeks().find(w => w.number === this.selectedCompareWeek);

      if (compareWeekInfo) {
        // Format compare week dates
        const compareStartFormatted = compareWeekInfo.startDate.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }).toUpperCase();
        const compareEndFormatted = compareWeekInfo.endDate.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }).toUpperCase();

        weekDisplay = `
          <div class="pill-content comparison-mode">
            <span class="pill-title">WEEK ${this.selectedWeek} vs ${this.selectedCompareWeek}</span>
            <div class="pill-details">
              <div class="date-row">
                <span class="date-label">PRIMARY</span>
                <span class="date-value">${weekStartFormatted}</span>
              </div>
              <div class="date-row">
                <span class="date-label">COMPARE</span>
                <span class="date-value">${compareStartFormatted}</span>
              </div>
            </div>
          </div>
        `;
      } else {
        // Fallback if compare week info not found
        weekDisplay = `
          <div class="pill-content comparison-mode">
            <span class="pill-title">WEEK ${this.selectedWeek} vs ${this.selectedCompareWeek}</span>
            <div class="pill-details">
              <div class="date-row">
                <span class="date-label">PRIMARY</span>
                <span class="date-value">${weekStartFormatted}</span>
              </div>
              <div class="date-row">
                <span class="date-label">COMPARE</span>
                <span class="date-value">Week ${this.selectedCompareWeek}</span>
              </div>
            </div>
          </div>
        `;
      }
    } else {
      weekDisplay = `
        <div class="pill-content">
          <span class="pill-title">WEEK ${this.selectedWeek}</span>
          <div class="pill-details">
            <div class="date-row">
              <span class="date-label">START</span>
              <span class="date-value">${weekStartFormatted}</span>
            </div>
            <div class="date-row">
              <span class="date-label">END</span>
              <span class="date-value">${weekEndFormatted}</span>
            </div>
          </div>
        </div>
      `;
    }

    // Determine visual state classes
    const weekClasses = this.getWeekSelectorClasses();
    const storeClasses = this.getStoreSelectorClasses();

    this.container.innerHTML = `
      <div class="context-bar-v2-content">
        <!-- Week Selector -->
        <button class="pill-component week-selector ${weekClasses}" data-action="period">
          <img src="../images/Calendar-week-icon.svg" alt="Calendar" class="week-icon" onerror="this.src='images/Calendar-week-icon.svg'">
          ${weekDisplay}
          <span class="pill-arrow">▼</span>
        </button>

        <!-- Store Selector -->
        <button class="pill-component store-selector ${storeClasses}" data-action="scope">
          <img src="images/store-icon.svg" alt="Store" class="store-icon" onerror="this.style.display='none'">
          <span class="pill-text">${this.selectedScope.name} (${this.selectedScope.count})</span>
          <span class="pill-arrow">▼</span>
        </button>
      </div>
    `;

    if (this.debugMode) {
      console.log('🎨 Render complete, DOM updated');
    }

    // Always ensure events are attached after render
    // Use requestAnimationFrame to ensure DOM is fully updated
    requestAnimationFrame(() => {
      this.attachEvents();
    });
  }

  /**
   * Get CSS classes for week selector based on current state
   */
  getWeekSelectorClasses() {
    const classes = [];

    // Add comparison mode class
    if (this.comparisonMode) {
      classes.push('comparison-mode');
    }

    // Add filtered class if not current week
    if (this.selectedWeek !== this.currentWeek) {
      classes.push('filtered');
    }

    // Add loading class if currently updating
    if (this.isLoading) {
      classes.push('loading');
    }

    return classes.join(' ');
  }

  /**
   * Get CSS classes for store selector based on current state
   */
  getStoreSelectorClasses() {
    const classes = [];

    // Add filtered class if not "all stores" or "version-group"
    if (this.selectedScope.level !== 'all' && this.selectedScope.level !== 'version-group') {
      classes.push('filtered');
    }

    // Add loading class if currently updating
    if (this.isLoading) {
      classes.push('loading');
    }

    return classes.join(' ');
  }

  /**
   * Set loading state for visual feedback
   */
  setLoading(isLoading) {
    this.isLoading = isLoading;

    // Update visual state without full re-render
    this.updateVisualStates();

    // Disable/enable buttons during loading
    const buttons = this.container.querySelectorAll('.pill-component');
    buttons.forEach(button => {
      if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
      } else {
        button.classList.remove('loading');
        button.disabled = false;
      }
    });
  }

  /**
   * Update visual states without full re-render
   */
  updateVisualStates() {
    const weekButton = this.container.querySelector('.week-selector');
    const storeButton = this.container.querySelector('.store-selector');

    if (weekButton) {
      // Clear existing state classes
      weekButton.classList.remove('comparison-mode', 'filtered', 'loading');

      // Add current state classes
      const weekClasses = this.getWeekSelectorClasses().split(' ').filter(c => c);
      weekClasses.forEach(cls => weekButton.classList.add(cls));
    }

    if (storeButton) {
      // Clear existing state classes
      storeButton.classList.remove('filtered', 'loading');

      // Add current state classes
      const storeClasses = this.getStoreSelectorClasses().split(' ').filter(c => c);
      storeClasses.forEach(cls => storeButton.classList.add(cls));
    }
  }

  attachEvents() {
    // Remove existing event listeners first to avoid duplicates
    this.removeEvents();

    const buttons = this.container.querySelectorAll('.pill-component');

    if (this.debugMode) {
      console.log(`🔧 Attaching events to ${buttons.length} pill components`);
    }

    buttons.forEach((button, index) => {
      const action = button.getAttribute('data-action');

      const clickHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (this.debugMode) {
          console.log(`🖱️ Pill clicked: ${action}`);
        }

        if (action === 'period') {
          this.showPeriodSelector();
        } else if (action === 'scope') {
          this.showScopeSelector();
        }
      };

      // Store reference to handler for later removal
      button._clickHandler = clickHandler;
      button.addEventListener('click', clickHandler);

      if (this.debugMode) {
        console.log(`✅ Event attached to pill ${index + 1}: ${action}`);
      }
    });
  }

  removeEvents() {
    const buttons = this.container.querySelectorAll('.pill-component');

    if (this.debugMode) {
      console.log(`🧹 Removing events from ${buttons.length} pill components`);
    }

    buttons.forEach(button => {
      if (button._clickHandler) {
        button.removeEventListener('click', button._clickHandler);
        delete button._clickHandler;
      }
    });
  }

  showPeriodSelector() {
    const weeks = this.getAvailableWeeks();
    const capabilities = this.getPageCapabilities();

    const weekOptions = weeks.map(week => `
      <label>
        <input type="radio" name="week" value="${week.number}" ${week.number === this.selectedWeek ? 'checked' : ''}>
        <span>${week.label}${week.isCurrent ? ' (Current)' : ''}</span>
      </label>
    `).join('');

    // Analysis Mode section for analyze/reports pages
    const analysisSection = capabilities.allowComparison ? `
      <div class="analysis-mode-section">
        <h4>Analysis Mode</h4>
        <div class="analysis-mode-toggle">
          <label class="mode-option">
            <input type="radio" name="analysis-mode" value="single" ${!this.comparisonMode ? 'checked' : ''}>
            <span>Single Week</span>
          </label>
          <label class="mode-option">
            <input type="radio" name="analysis-mode" value="compare" ${this.comparisonMode ? 'checked' : ''}>
            <span>Compare Weeks</span>
          </label>
        </div>

        ${this.comparisonMode ? `
          <div class="comparison-options">
            <h4>Select Second Week:</h4>
            <div class="compare-week-options">
              ${weeks.filter(w => w.number !== this.selectedWeek).map(week => `
                <label>
                  <input type="radio" name="compare-week" value="${week.number}" ${week.number === this.selectedCompareWeek ? 'checked' : ''}>
                  <span>${week.label}</span>
                </label>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    ` : '';

    this.showOverlay('Period Selector', `
      <div class="selector-content-scrollable">
        <div class="quick-presets-section">
          <h3>Quick Presets</h3>
          <div class="preset-buttons">
            <button class="preset-btn" data-preset="current-week">Current Week</button>
            <button class="preset-btn" data-preset="last-week">Last Week</button>
            <button class="preset-btn" data-preset="last-4-weeks">Last 4 Weeks</button>
          </div>
        </div>

        <div class="manual-selection-section">
          <h3>Select Time Period</h3>
          <div class="week-options">
            ${weekOptions}
          </div>
        </div>

        ${analysisSection}
      </div>
      <div class="selector-actions">
        <button class="btn-cancel">Cancel</button>
        <button class="btn-apply">Apply</button>
      </div>
    `);

    // Add comparison mode listener if available
    if (capabilities.allowComparison) {
      this.setupComparisonListener();
    }

    // Add preset button listeners
    this.setupPresetListeners();
  }

  setupComparisonListener() {
    const overlay = document.querySelector('.context-overlay');
    const analysisModeInputs = overlay.querySelectorAll('input[name="analysis-mode"]');

    analysisModeInputs.forEach(input => {
      input.addEventListener('change', () => {
        if (input.checked) {
          const isComparisonMode = input.value === 'compare';

          // Update the comparison options dynamically
          const comparisonOptionsContainer = overlay.querySelector('.comparison-options');
          const weeks = this.getAvailableWeeks();

          if (isComparisonMode && !comparisonOptionsContainer) {
            // Add comparison options
            const analysisSection = overlay.querySelector('.analysis-mode-section');
            const comparisonOptionsHTML = `
              <div class="comparison-options">
                <h4>Select Second Week:</h4>
                <div class="compare-week-options">
                  ${weeks.filter(w => w.number !== this.selectedWeek).map(week => `
                    <label>
                      <input type="radio" name="compare-week" value="${week.number}">
                      <span>${week.label}</span>
                    </label>
                  `).join('')}
                </div>
              </div>
            `;
            analysisSection.insertAdjacentHTML('beforeend', comparisonOptionsHTML);
          } else if (!isComparisonMode && comparisonOptionsContainer) {
            // Remove comparison options
            comparisonOptionsContainer.remove();
          }
        }
      });
    });
  }

  /**
   * Setup event listeners for preset buttons
   */
  setupPresetListeners() {
    const overlay = document.querySelector('.context-overlay');
    const presetButtons = overlay.querySelectorAll('.preset-btn');

    presetButtons.forEach(button => {
      button.addEventListener('click', () => {
        const preset = button.getAttribute('data-preset');
        this.applyPeriodPreset(preset);
      });
    });
  }

  /**
   * Apply period preset immediately
   */
  async applyPeriodPreset(preset) {
    try {
      // Show loading state
      this.setLoading(true);

      // Small delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 300));

      let targetWeek = this.currentWeek;
      let comparisonMode = false;
      let compareWeek = null;

      switch (preset) {
        case 'current-week':
          targetWeek = this.currentWeek;
          break;

        case 'last-week':
          targetWeek = this.currentWeek - 1;
          break;

        case 'last-4-weeks':
          // Set up comparison between current week and 4 weeks ago
          // Ensure the compare week is within available range
          const availableWeeks = this.getAvailableWeeks();
          const oldestWeek = availableWeeks[0].number; // First available week
          const fourWeeksAgo = this.currentWeek - 4;

          targetWeek = this.currentWeek;
          comparisonMode = true;
          // Use the older of (4 weeks ago OR oldest available week)
          compareWeek = Math.max(fourWeeksAgo, oldestWeek);

          if (this.debugMode) {
            console.log(`📅 Last 4 weeks: current=${targetWeek}, compare=${compareWeek}, available=[${oldestWeek}-${this.currentWeek}]`);
          }
          break;

      }

      // Validate week selection
      const weekValidationErrors = this.validateWeekSelection(targetWeek, compareWeek);
      if (weekValidationErrors.length > 0) {
        // Show first error and fallback to defaults
        this.showErrorMessage(weekValidationErrors[0].message, weekValidationErrors[0].type);
        this.logError('Week validation failed in preset', {
          preset,
          errors: weekValidationErrors,
          targetWeek,
          compareWeek
        });

        this.fallbackToDefaults();
        this.setLoading(false);
        return;
      }

      // Apply the preset
      this.selectedWeek = targetWeek;
      this.comparisonMode = comparisonMode && this.getPageCapabilities().allowComparison;
      this.selectedCompareWeek = comparisonMode ? compareWeek : null;

      if (this.debugMode) {
        console.log(`🎯 Preset applied: week=${this.selectedWeek}, comparisonMode=${this.comparisonMode}, compareWeek=${this.selectedCompareWeek}`);
      }

      // Close overlay and update
      this.hideOverlay();
      this.saveCurrentState();
      this.render();

      // Clear loading state
      this.setLoading(false);

      console.log(`✅ Applied preset "${preset}":`, {
        week: this.selectedWeek,
        comparison: this.comparisonMode,
        compareWeek: this.selectedCompareWeek
      });
    } catch (error) {
      this.logError('Error applying period preset', { preset, error: error.message });
      this.showErrorMessage('Failed to apply preset. Please try again.', 'preset_error');
      this.fallbackToDefaults();
      this.setLoading(false);
    }
  }

  /**
   * Get week number from date (simplified calculation)
   */
  getWeekFromDate(date) {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const daysSinceStart = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
    return Math.ceil((daysSinceStart + 1) / 7) + 20; // Approximate week 20+ range
  }

  showScopeSelector() {
    const hierarchy = this.getStoreHierarchy();

    this.showOverlay('Store Selector', `
      <div class="selector-content-scrollable">
        <div class="manual-selection-section">
          <h3>Select Store Scope</h3>

          <!-- Level Selection -->
          <div class="level-selector">
            <label class="level-option">
              <input type="radio" name="store-level" value="all" ${this.selectedScope.level === 'all' ? 'checked' : ''}>
              <span>All Stores</span>
            </label>
            <label class="level-option">
              <input type="radio" name="store-level" value="version-group" ${this.selectedScope.level === 'version-group' ? 'checked' : ''}>
              <span>By Version-Group</span>
            </label>
            <label class="level-option">
              <input type="radio" name="store-level" value="store" ${this.selectedScope.level === 'store' ? 'checked' : ''}>
              <span>Individual Store</span>
            </label>
          </div>

          <!-- Dynamic Options Based on Level -->
          <div class="store-options">
            ${this.generateStoreOptions(hierarchy)}
          </div>
        </div>
      </div>
      <div class="selector-actions">
        <button class="btn-cancel">Cancel</button>
        <button class="btn-apply">Apply</button>
      </div>
    `);

    // Add level change listener
    this.setupLevelChangeListener();
  }

  generateStoreOptions(hierarchy) {
    if (this.selectedScope.level === 'all') {
      return `
        <div class="all-stores-option">
          <label>
            <input type="radio" name="store-selection" value="all" checked>
            <span>${hierarchy.all.name} (${hierarchy.all.count})</span>
          </label>
        </div>
      `;
    } else if (this.selectedScope.level === 'version-group') {
      return hierarchy.versionGroups.map(versionGroup => `
        <label>
          <input type="radio" name="store-selection" value="${versionGroup.id}" ${this.selectedScope.id === versionGroup.id ? 'checked' : ''}>
          <span>${versionGroup.name} (${versionGroup.count} stores)</span>
        </label>
      `).join('');
    } else if (this.selectedScope.level === 'store') {
      // Show stores grouped by version-group for better organization
      const storesByVersionGroup = {};
      hierarchy.stores.forEach(store => {
        if (!storesByVersionGroup[store.versionGroup]) {
          storesByVersionGroup[store.versionGroup] = [];
        }
        storesByVersionGroup[store.versionGroup].push(store);
      });

      return Object.entries(storesByVersionGroup).map(([versionGroupId, stores]) => {
        const versionGroupName = hierarchy.versionGroups.find(r => r.id === versionGroupId)?.name || versionGroupId;
        return `
          <div class="version-group-group">
            <h4>${versionGroupName}</h4>
            ${stores.map(store => `
              <label>
                <input type="radio" name="store-selection" value="${store.id}" ${this.selectedScope.id === store.id ? 'checked' : ''}>
                <span>${store.name}</span>
              </label>
            `).join('')}
          </div>
        `;
      }).join('');
    }
  }

  setupLevelChangeListener() {
    const overlay = document.querySelector('.context-overlay');
    const levelInputs = overlay.querySelectorAll('input[name="store-level"]');

    levelInputs.forEach(input => {
      input.addEventListener('change', () => {
        if (input.checked) {
          // Update the store options dynamically
          const hierarchy = this.getStoreHierarchy();
          const tempScope = { ...this.selectedScope, level: input.value };

          // Reset selection when changing levels
          if (input.value === 'all') {
            tempScope.id = 'all';
          } else {
            tempScope.id = null; // Will be set when user selects
          }

          const storeOptionsContainer = overlay.querySelector('.store-options');
          storeOptionsContainer.innerHTML = this.generateStoreOptionsForLevel(hierarchy, input.value);
        }
      });
    });
  }


  generateStoreOptionsForLevel(hierarchy, level) {
    if (level === 'all') {
      return `
        <div class="all-stores-option">
          <label>
            <input type="radio" name="store-selection" value="all" checked>
            <span>${hierarchy.all.name} (${hierarchy.all.count})</span>
          </label>
        </div>
      `;
    } else if (level === 'version-group') {
      return hierarchy.versionGroups.map(versionGroup => `
        <label>
          <input type="radio" name="store-selection" value="${versionGroup.id}">
          <span>${versionGroup.name} (${versionGroup.count} stores)</span>
        </label>
      `).join('');
    } else if (level === 'store') {
      const storesByVersionGroup = {};
      hierarchy.stores.forEach(store => {
        if (!storesByVersionGroup[store.versionGroup]) {
          storesByVersionGroup[store.versionGroup] = [];
        }
        storesByVersionGroup[store.versionGroup].push(store);
      });

      return Object.entries(storesByVersionGroup).map(([versionGroupId, stores]) => {
        const versionGroupName = hierarchy.versionGroups.find(r => r.id === versionGroupId)?.name || versionGroupId;
        return `
          <div class="version-group-group">
            <h4>${versionGroupName}</h4>
            ${stores.map(store => `
              <label>
                <input type="radio" name="store-selection" value="${store.id}">
                <span>${store.name}</span>
              </label>
            `).join('')}
          </div>
        `;
      }).join('');
    }
  }

  showOverlay(title, content) {
    // Remove existing overlay
    const existing = document.querySelector('.context-overlay');
    if (existing) existing.remove();

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'context-overlay';
    overlay.innerHTML = `
      <div class="overlay-backdrop"></div>
      <div class="overlay-panel">
        <div class="overlay-header">
          <h2>${title}</h2>
          <button class="overlay-close">×</button>
        </div>
        ${content}
      </div>
    `;

    document.body.appendChild(overlay);

    // Add event listeners
    overlay.querySelector('.overlay-close').addEventListener('click', () => this.hideOverlay());
    overlay.querySelector('.overlay-backdrop').addEventListener('click', () => this.hideOverlay());
    overlay.querySelector('.btn-cancel').addEventListener('click', () => this.hideOverlay());
    overlay.querySelector('.btn-apply').addEventListener('click', () => {
      this.handleApplySelection(overlay);
    });

    // Animate in
    setTimeout(() => overlay.classList.add('show'), 10);
  }

  async handleApplySelection(overlay) {
    try {
      // Show loading state
      this.setLoading(true);

      // Add loading state to apply button
      const applyButton = overlay.querySelector('.btn-apply');
      applyButton.disabled = true;
      applyButton.textContent = 'Applying...';

      // Small delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 400));

      // Check if this is a week selection
      const weekRadio = overlay.querySelector('input[name="week"]:checked');
      if (weekRadio) {
        const newWeek = parseInt(weekRadio.value);
        let newCompareWeek = null;
        let hasChanges = false;

        // Check for analysis mode and compare week selection first
        const analysisModeRadio = overlay.querySelector('input[name="analysis-mode"]:checked');
        if (analysisModeRadio) {
          const newComparisonMode = analysisModeRadio.value === 'compare';

          if (newComparisonMode) {
            const compareWeekRadio = overlay.querySelector('input[name="compare-week"]:checked');
            if (compareWeekRadio) {
              newCompareWeek = parseInt(compareWeekRadio.value);
            }
          }
        }

        // Validate week selection before applying
        const weekValidationErrors = this.validateWeekSelection(newWeek, newCompareWeek);
        if (weekValidationErrors.length > 0) {
          // Show error and don't apply changes
          this.showErrorMessage(weekValidationErrors[0].message, weekValidationErrors[0].type);
          this.logError('Week validation failed in overlay', {
            errors: weekValidationErrors,
            newWeek,
            newCompareWeek
          });

          // Reset button state
          applyButton.disabled = false;
          applyButton.textContent = 'Apply';
          this.setLoading(false);
          return;
        }

        // Apply week changes
        if (newWeek !== this.selectedWeek) {
          this.selectedWeek = newWeek;
          hasChanges = true;
          console.log(`Week changed to: ${this.selectedWeek}`);
        }

        // Apply comparison mode changes
        if (analysisModeRadio) {
          const newComparisonMode = analysisModeRadio.value === 'compare';
          if (newComparisonMode !== this.comparisonMode) {
            this.comparisonMode = newComparisonMode;
            hasChanges = true;
            console.log(`Analysis mode changed to: ${this.comparisonMode ? 'compare' : 'single'}`);
          }

          if (this.comparisonMode && newCompareWeek !== this.selectedCompareWeek) {
            this.selectedCompareWeek = newCompareWeek;
            hasChanges = true;
            console.log(`Compare week changed to: ${this.selectedCompareWeek}`);
          } else if (!this.comparisonMode && this.selectedCompareWeek !== null) {
            // Reset compare week when comparison mode is disabled
            this.selectedCompareWeek = null;
            hasChanges = true;
          }
        }

        if (hasChanges) {
          this.render(); // Re-render to show changes (events auto-attached)

          // Save state to sessionStorage
          this.saveCurrentState();

          // Log context state for debugging/integration
          console.log('📊 Context state updated:', this.getContextState());
        }

        // Close overlay after successful week selection
        this.setLoading(false);
        this.hideOverlay();
        return;
      }

    // Check if this is a store hierarchy selection
    const storeLevelRadio = overlay.querySelector('input[name="store-level"]:checked');
    const storeSelectionRadio = overlay.querySelector('input[name="store-selection"]:checked');

    if (storeLevelRadio && storeSelectionRadio) {
      const level = storeLevelRadio.value;
      const selectionId = storeSelectionRadio.value;
      const hierarchy = this.getStoreHierarchy();

      let newScope;

      if (level === 'all') {
        newScope = {
          level: 'all',
          id: 'all',
          name: hierarchy.all.name,
          count: hierarchy.all.count
        };
      } else if (level === 'version-group') {
        const versionGroup = hierarchy.versionGroups.find(r => r.id === selectionId);
        if (versionGroup) {
          newScope = {
            level: 'version-group',
            id: versionGroup.id,
            name: versionGroup.name,
            count: versionGroup.count
          };
        }
      } else if (level === 'store') {
        const store = hierarchy.stores.find(s => s.id === selectionId);
        if (store) {
          newScope = {
            level: 'store',
            id: store.id,
            name: store.name,
            count: 1
          };
        }
      }

      if (newScope) {
        // Validate store selection before applying
        const storeValidationErrors = this.validateStoreSelection(newScope);
        if (storeValidationErrors.length > 0) {
          // Show error and don't apply changes
          this.showErrorMessage(storeValidationErrors[0].message, storeValidationErrors[0].type);
          this.logError('Store validation failed in overlay', {
            errors: storeValidationErrors,
            newScope
          });

          // Reset button state
          applyButton.disabled = false;
          applyButton.textContent = 'Apply';
          this.setLoading(false);
          return;
        }

        if (newScope.level !== this.selectedScope.level || newScope.id !== this.selectedScope.id) {
          this.selectedScope = newScope;
          console.log(`Store scope changed to: ${this.selectedScope.level} - ${this.selectedScope.name}`);
          this.render(); // Re-render to show new scope (events auto-attached)

          // Save state to sessionStorage
          this.saveCurrentState();
        }

        // Close overlay after successful store selection
        this.setLoading(false);
        this.hideOverlay();
        return;
      }
    }

    // If no changes were made, still close the overlay
    this.setLoading(false);
    this.hideOverlay();

  } catch (error) {
    this.logError('Error applying overlay selection', { error: error.message });
    this.showErrorMessage('Failed to apply selection. Please try again.', 'apply_error');

    // Reset button state
    const applyButton = overlay.querySelector('.btn-apply');
    if (applyButton) {
      applyButton.disabled = false;
      applyButton.textContent = 'Apply';
    }

    this.setLoading(false);
    // Don't hide overlay on error so user can try again
  }
}

  hideOverlay() {
    const overlays = document.querySelectorAll('.context-overlay');
    overlays.forEach(overlay => {
      overlay.classList.remove('show');
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.remove();
        }
      }, 300);
    });
  }
}

// Export for global use
window.SimpleContextBar = SimpleContextBar;