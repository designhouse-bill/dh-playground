/**
 * ContextBarComponent - Angular-ready context bar component
 * Displays context information and breadcrumb navigation
 *
 * Features:
 * - Angular component lifecycle pattern
 * - Dependency injection ready (constructor injection)
 * - Context state integration with ContextBarService
 * - Responsive breadcrumb navigation
 * - Dynamic content updates
 * - Clean event handling and cleanup
 *
 * @version 1.0.0
 * @author Analytics Dashboard Team
 */

class ContextBarComponent {
  /**
   * Constructor - Angular-style dependency injection
   *
   * @param {HTMLElement} containerElement - DOM element to render component in
   * @param {ContextBarService} contextService - Context service instance
   */
  constructor(containerElement, contextService) {
    if (!containerElement) {
      throw new Error('ContextBarComponent requires a container element');
    }

    if (!contextService) {
      throw new Error('ContextBarComponent requires a ContextBarService instance');
    }

    // Dependency injection
    this.container = containerElement;
    this.contextService = contextService;

    // Component state
    this.isInitialized = false;
    this.isRendered = false;
    this.contextState = {};

    // DOM references
    this.element = null;
    this.breadcrumbContainer = null;
    this.descriptionContainer = null;

    // Child components
    this.periodSelectorComponent = null;
    this.scopeSelectorComponent = null;

    // Event handling
    this._eventListeners = [];
    this._serviceSubscriptions = [];

    // Bind methods to preserve 'this' context
    this.init = this.init.bind(this);
    this.render = this.render.bind(this);
    this.destroy = this.destroy.bind(this);
    this._generateHTML = this._generateHTML.bind(this);
    this.attachEventListeners = this.attachEventListeners.bind(this);
    this._handleContextChange = this._handleContextChange.bind(this);
    this._handleBreadcrumbClick = this._handleBreadcrumbClick.bind(this);
    this._updateContent = this._updateContent.bind(this);
  }

  /**
   * Initialize component - Angular ngOnInit equivalent
   * Sets up service subscriptions and initial render
   *
   * @returns {Promise<boolean>} Success status
   */
  async init() {
    if (this.isInitialized) {
      return true;
    }

    try {

      // Ensure context service is initialized
      if (!this.contextService.isInitialized) {
        await this.contextService.init();
      }

      // Get initial context state
      this.contextState = this.contextService.getContextState();

      // Subscribe to context service changes
      this._subscribeToContextService();

      // Perform initial render
      await this.render();

      // Set up event listeners
      console.log('🎯 Attaching event listeners...');
      const listenerResult = this.attachEventListeners();
      console.log('🎯 Event listeners attached:', listenerResult);

      // Mark as initialized
      this.isInitialized = true;
      console.log('✅ Context bar component initialized successfully');

      return true;

    } catch (error) {
      console.error('❌ ContextBarComponent initialization failed:', error);
      return false;
    }
  }

  /**
   * Subscribe to context service events
   *
   * @private
   */
  _subscribeToContextService() {
    // Subscribe to context changes
    const contextSubscription = this.contextService.subscribe('stateChanged', this._handleContextChange);
    this._serviceSubscriptions.push(contextSubscription);

    // Subscribe to URL changes
    const urlSubscription = this.contextService.subscribe('contextChanged', this._handleContextChange);
    this._serviceSubscriptions.push(urlSubscription);
  }

  /**
   * Handle context service changes
   *
   * @private
   * @param {Object} newState - New context state
   */
  _handleContextChange(newState) {

    this.contextState = newState;
    this._updateContent();
  }

  /**
   * Render component - Angular template equivalent
   * Generates HTML and inserts into container
   *
   * @returns {Promise<boolean>} Success status
   */
  async render() {
    try {
      // Show context bar on all pages - basic version for non-analysis pages
      const isAnalysisPage = this.contextState.isAnalysisContext && this.contextState.source;

      // Generate HTML content
      const html = this._generateHTML();

      // Insert into container
      this.container.innerHTML = html;

      // Get DOM references
      this.element = this.container.querySelector('.context-bar') || this.container.querySelector('.context-bar-v2-content') || this.container;
      this.breadcrumbContainer = this.container.querySelector('.context-breadcrumb');
      this.descriptionContainer = this.container.querySelector('.context-description');

      // Mark as rendered
      this.isRendered = true;

      return true;

    } catch (error) {
      console.error('❌ ContextBarComponent render failed:', error);
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
    const { breadcrumb, description, source, filter, sort, direction } = this.contextState;

    // If no analysis context, show basic context bar with date/scope controls
    if (!source) {
      return this._generateBasicContextBar();
    }

    // Generate breadcrumb HTML
    const breadcrumbHTML = breadcrumb.map((item, index) => {
      const isLast = index === breadcrumb.length - 1;
      const isClickable = item.href && !isLast;

      return `
        <span class="breadcrumb-item ${isLast ? 'active' : ''}"
              data-breadcrumb-index="${index}"
              ${isLast ? 'aria-current="page"' : ''}>
          ${isClickable ?
            `<a href="${item.href}"
               class="breadcrumb-link"
               title="Navigate to ${item.label}"
               aria-label="Navigate to ${item.label}">${item.label}</a>` :
            `<span class="breadcrumb-text">${item.label}</span>`
          }
        </span>
        ${!isLast ? '<span class="breadcrumb-separator" aria-hidden="true">›</span>' : ''}
      `;
    }).join('');

    // Generate back button if we have a breadcrumb with links
    const hasBackLink = breadcrumb.some(item => item.href);
    const backButtonHTML = hasBackLink ? `
      <a href="${breadcrumb[0].href}"
         class="back-link"
         title="Back to Dashboard"
         aria-label="Back to Dashboard"
         data-action="back">
        <span class="back-arrow" aria-hidden="true">←</span>
      </a>
    ` : '';

    // Generate context sections
    const leftSectionHTML = this._generateLeftSection();
    const rightSectionHTML = this._generateRightSection();

    return `
      <div class="context-bar-v2-content analysis-mode"
           data-context-source="${source}"
           data-context-filter="${filter || ''}"
           data-context-sort="${sort || ''}">
        <!-- Week Selector Pill -->
        ${leftSectionHTML}

        <!-- Store Selector Pill -->
        ${rightSectionHTML}
      </div>
    `;
  }

  /**
   * Generate basic context bar for non-analysis pages
   * Shows date/scope controls without analysis context
   *
   * @private
   * @returns {string} Basic context bar HTML
   */
  _generateBasicContextBar() {
    // Get current week information
    const weekInfo = this._getCurrentWeekInfo();

    return `
      <div class="context-bar-v2-content">

          <!-- Week Selector Pill -->
          <button type="button" class="pill-component week-selector-pill"
                  data-action="modify-period"
                  aria-label="Change time period"
                  title="Change time period">

            <!-- Calendar Icon -->
            <span class="week-icon" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M31.5 12.375H29.625V10.5C29.625 10.2016 29.5065 9.91548 29.2955 9.7045C29.0845 9.49353 28.7984 9.375 28.5 9.375C28.2016 9.375 27.9155 9.49353 27.7045 9.7045C27.4935 9.91548 27.375 10.2016 27.375 10.5V12.375H20.625V10.5C20.625 10.2016 20.5065 9.91548 20.2955 9.7045C20.0845 9.49353 19.7984 9.375 19.5 9.375C19.2016 9.375 18.9155 9.49353 18.7045 9.7045C18.4935 9.91548 18.375 10.2016 18.375 10.5V12.375H16.5C15.406 12.375 14.3568 12.8096 13.5832 13.5832C12.8096 14.3568 12.375 15.406 12.375 16.5V33C12.375 34.094 12.8096 35.1432 13.5832 35.9168C14.3568 36.6904 15.406 37.125 16.5 37.125H31.5C32.594 37.125 33.6432 36.6904 34.4168 35.9168C35.1904 35.1432 35.625 34.094 35.625 33V16.5C35.625 15.406 35.1904 14.3568 34.4168 13.5832C33.6432 12.8096 32.594 12.375 31.5 12.375ZM16.5 14.625H18.375V16.5C18.375 16.7984 18.4935 17.0845 18.7045 17.2955C18.9155 17.5065 19.2016 17.625 19.5 17.625C19.7984 17.625 20.0845 17.5065 20.2955 17.2955C20.5065 17.0845 20.625 16.7984 20.625 16.5V14.625H27.375V16.5C27.375 16.7984 27.4935 17.0845 27.7045 17.2955C27.9155 17.5065 28.2016 17.625 28.5 17.625C28.7984 17.625 29.0845 17.5065 29.2955 17.2955C29.5065 17.0845 29.625 16.7984 29.625 16.5V14.625H31.5C31.9973 14.625 32.4742 14.8225 32.8258 15.1742C33.1775 15.5258 33.375 16.0027 33.375 16.5V20.625H14.625V16.5C14.625 16.0027 14.8225 15.5258 15.1742 15.1742C15.5258 14.8225 16.0027 14.625 16.5 14.625V14.625ZM31.5 34.875H16.5C16.0027 34.875 15.5258 34.6775 15.1742 34.3258C14.8225 33.9742 14.625 33.4973 14.625 33V22.875H33.375V33C33.375 33.4973 33.1775 33.9742 32.8258 34.3258C32.4742 34.6775 31.9973 34.875 31.5 34.875Z" fill="currentColor"/>
                <rect x="16.125" y="24.75" width="2.25" height="2.25" rx="1" fill="currentColor"/>
                <rect x="20.625" y="24.75" width="2.25" height="2.25" rx="1" fill="currentColor"/>
                <rect x="25.125" y="24.75" width="2.25" height="2.25" rx="1" fill="currentColor"/>
                <rect x="29.625" y="24.75" width="2.25" height="2.25" rx="1" fill="currentColor"/>
                <rect x="16.125" y="28.5" width="2.25" height="2.25" rx="1" fill="currentColor"/>
                <rect x="20.625" y="28.5" width="2.25" height="2.25" rx="1" fill="currentColor"/>
                <rect x="25.125" y="28.5" width="2.25" height="2.25" rx="1" fill="currentColor"/>
              </svg>
            </span>

            <!-- Week Content -->
            <div class="week-content">
              <div class="week-main">
                <!-- Week Number -->
                <p class="week-number">WEEK ${weekInfo.weekNumber}</p>

                <!-- Date Details -->
                <div class="week-dates">
                  <div class="date-range">
                    <p class="date-label">START:</p>
                    <p class="date-value">${weekInfo.startDate}</p>
                  </div>
                  <div class="date-range">
                    <p class="date-label">END:</p>
                    <p class="date-value">${weekInfo.endDate}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Dropdown Arrow -->
            <span class="week-dropdown" aria-hidden="true">▼</span>
          </button>

          <!-- Store Selector Pill -->
          <button type="button" class="pill-component store-selector"
                  data-action="scope"
                  aria-label="Change store scope"
                  title="Change store scope">

            <!-- Store Icon -->
            <span class="pill-icon" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M33.54 19.5L34.44 24H13.56L14.46 19.5H33.54ZM36 12H12V15H36V12ZM36 16.5H12L10.5 24V27H12V36H27V27H33V36H36V27H37.5V24L36 16.5ZM15 33V27H24V33H15Z" fill="currentColor"/>
              </svg>
            </span>

            <!-- Store Text -->
            <span class="pill-text">All Stores (50)</span>

            <!-- Dropdown Arrow -->
            <span class="pill-arrow" aria-hidden="true">▼</span>
          </button>

      </div>
    `;
  }

  /**
   * Check if current context is in comparison mode
   *
   * @private
   * @returns {boolean} True if in comparison mode
   */
  _isComparisonMode() {
    const { source, filter } = this.contextState;

    // Check for comparison indicators in source or filter
    return source.includes('vs') || source.includes('compare') ||
           (filter && (filter.includes('vs') || filter.includes('compare')));
  }

  /**
   * Get comparison information for display
   *
   * @private
   * @returns {Object} Comparison information object
   */
  _getComparisonInfo() {
    const { source, filter } = this.contextState;

    // Default comparison info
    let title = 'WEEK 36 vs WEEK 35';
    let details = 'Comparison View';

    // Try to extract comparison info from source or filter
    if (source.includes('vs')) {
      const parts = source.split('vs');
      if (parts.length === 2) {
        const period1 = parts[0].trim().toUpperCase();
        const period2 = parts[1].trim().toUpperCase();
        title = `${period1} vs ${period2}`;
      }
    } else if (filter && filter.includes('vs')) {
      const parts = filter.split('vs');
      if (parts.length === 2) {
        const period1 = parts[0].trim().toUpperCase().replace(/-/g, ' ');
        const period2 = parts[1].trim().toUpperCase().replace(/-/g, ' ');
        title = `${period1} vs ${period2}`;
      }
    }

    // Set appropriate details based on context
    if (source.includes('weekly') || filter?.includes('weekly')) {
      details = 'Weekly Comparison';
    } else if (source.includes('monthly') || filter?.includes('monthly')) {
      details = 'Monthly Comparison';
    } else if (source.includes('yearly') || filter?.includes('yearly')) {
      details = 'Yearly Comparison';
    }

    return {
      title,
      details
    };
  }

  /**
   * Get current week information for display
   *
   * @private
   * @returns {Object} Week information object
   */
  _getCurrentWeekInfo() {
    const now = new Date();

    // Calculate current week number (ISO week)
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now - startOfYear) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);

    // Get start of current week (Monday)
    const dayOfWeek = now.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, Monday = 1
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - daysToMonday);

    // Get end of current week (Sunday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    // Format dates
    const formatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    };

    const startDate = startOfWeek.toLocaleDateString('en-US', formatOptions).toUpperCase();
    const endDate = endOfWeek.toLocaleDateString('en-US', formatOptions).toUpperCase();

    return {
      weekNumber,
      startDate,
      endDate
    };
  }

  /**
   * Generate left section HTML (Period/Time context)
   *
   * @private
   * @returns {string} Left section HTML
   */
  _generateLeftSection() {
    const { source, filter } = this.contextState;

    // Check if this is a comparison analysis
    const isComparison = this._isComparisonMode();

    if (isComparison) {
      const comparisonInfo = this._getComparisonInfo();

      return `
        <button type="button" class="pill-component week-selector-pill"
                data-action="modify-period"
                aria-label="Modify analysis period"
                title="Modify analysis period">

          <!-- Calendar Icon -->
          <span class="pill-icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M31.5 12.375H29.625V10.5C29.625 10.2016 29.5065 9.91548 29.2955 9.7045C29.0845 9.49353 28.7984 9.375 28.5 9.375C28.2016 9.375 27.9155 9.49353 27.7045 9.7045C27.4935 9.91548 27.375 10.2016 27.375 10.5V12.375H20.625V10.5C20.625 10.2016 20.5065 9.91548 20.2955 9.7045C20.0845 9.49353 19.7984 9.375 19.5 9.375C19.2016 9.375 18.9155 9.49353 18.7045 9.7045C18.4935 9.91548 18.375 10.2016 18.375 10.5V12.375H16.5C15.406 12.375 14.3568 12.8096 13.5832 13.5832C12.8096 14.3568 12.375 15.406 12.375 16.5V33C12.375 34.094 12.8096 35.1432 13.5832 35.9168C14.3568 36.6904 15.406 37.125 16.5 37.125H31.5C32.594 37.125 33.6432 36.6904 34.4168 35.9168C35.1904 35.1432 35.625 34.094 35.625 33V16.5C35.625 15.406 35.1904 14.3568 34.4168 13.5832C33.6432 12.8096 32.594 12.375 31.5 12.375ZM16.5 14.625H18.375V16.5C18.375 16.7984 18.4935 17.0845 18.7045 17.2955C18.9155 17.5065 19.2016 17.625 19.5 17.625C19.7984 17.625 20.0845 17.5065 20.2955 17.2955C20.5065 17.0845 20.625 16.7984 20.625 16.5V14.625H27.375V16.5C27.375 16.7984 27.4935 17.0845 27.7045 17.2955C27.9155 17.5065 28.2016 17.625 28.5 17.625C28.7984 17.625 29.0845 17.5065 29.2955 17.2955C29.5065 17.0845 29.625 16.7984 29.625 16.5V14.625H31.5C31.9973 14.625 32.4742 14.8225 32.8258 15.1742C33.1775 15.5258 33.375 16.0027 33.375 16.5V20.625H14.625V16.5C14.625 16.0027 14.8225 15.5258 15.1742 15.1742C15.5258 14.8225 16.0027 14.625 16.5 14.625V14.625ZM31.5 34.875H16.5C16.0027 34.875 15.5258 34.6775 15.1742 34.3258C14.8225 33.9742 14.625 33.4973 14.625 33V22.875H33.375V33C33.375 33.4973 33.1775 33.9742 32.8258 34.3258C32.4742 34.6775 31.9973 34.875 31.5 34.875Z" fill="currentColor"/>
              <rect x="16.125" y="24.75" width="2.25" height="2.25" rx="1" fill="currentColor"/>
              <rect x="20.625" y="24.75" width="2.25" height="2.25" rx="1" fill="currentColor"/>
              <rect x="25.125" y="24.75" width="2.25" height="2.25" rx="1" fill="currentColor"/>
              <rect x="29.625" y="24.75" width="2.25" height="2.25" rx="1" fill="currentColor"/>
              <rect x="16.125" y="28.5" width="2.25" height="2.25" rx="1" fill="currentColor"/>
              <rect x="20.625" y="28.5" width="2.25" height="2.25" rx="1" fill="currentColor"/>
              <rect x="25.125" y="28.5" width="2.25" height="2.25" rx="1" fill="currentColor"/>
            </svg>
          </span>

          <!-- Comparison Content -->
          <div class="pill-content">
            <div class="pill-title">${comparisonInfo.title}</div>
            <div class="pill-details">${comparisonInfo.details}</div>
          </div>

          <!-- Dropdown Arrow -->
          <span class="pill-arrow" aria-hidden="true">▼</span>
        </button>
      `;
    }

    // Regular analysis mode - get current week information
    const weekInfo = this._getCurrentWeekInfo();

    return `
      <button type="button" class="pill-component week-selector-pill"
              data-action="modify-period"
              aria-label="Change time period"
              title="Change time period">

        <!-- Calendar Icon -->
        <span class="week-icon" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M31.5 12.375H29.625V10.5C29.625 10.2016 29.5065 9.91548 29.2955 9.7045C29.0845 9.49353 28.7984 9.375 28.5 9.375C28.2016 9.375 27.9155 9.49353 27.7045 9.7045C27.4935 9.91548 27.375 10.2016 27.375 10.5V12.375H20.625V10.5C20.625 10.2016 20.5065 9.91548 20.2955 9.7045C20.0845 9.49353 19.7984 9.375 19.5 9.375C19.2016 9.375 18.9155 9.49353 18.7045 9.7045C18.4935 9.91548 18.375 10.2016 18.375 10.5V12.375H16.5C15.406 12.375 14.3568 12.8096 13.5832 13.5832C12.8096 14.3568 12.375 15.406 12.375 16.5V33C12.375 34.094 12.8096 35.1432 13.5832 35.9168C14.3568 36.6904 15.406 37.125 16.5 37.125H31.5C32.594 37.125 33.6432 36.6904 34.4168 35.9168C35.1904 35.1432 35.625 34.094 35.625 33V16.5C35.625 15.406 35.1904 14.3568 34.4168 13.5832C33.6432 12.8096 32.594 12.375 31.5 12.375ZM16.5 14.625H18.375V16.5C18.375 16.7984 18.4935 17.0845 18.7045 17.2955C18.9155 17.5065 19.2016 17.625 19.5 17.625C19.7984 17.625 20.0845 17.5065 20.2955 17.2955C20.5065 17.0845 20.625 16.7984 20.625 16.5V14.625H27.375V16.5C27.375 16.7984 27.4935 17.0845 27.7045 17.2955C27.9155 17.5065 28.2016 17.625 28.5 17.625C28.7984 17.625 29.0845 17.5065 29.2955 17.2955C29.5065 17.0845 29.625 16.7984 29.625 16.5V14.625H31.5C31.9973 14.625 32.4742 14.8225 32.8258 15.1742C33.1775 15.5258 33.375 16.0027 33.375 16.5V20.625H14.625V16.5C14.625 16.0027 14.8225 15.5258 15.1742 15.1742C15.5258 14.8225 16.0027 14.625 16.5 14.625V14.625ZM31.5 34.875H16.5C16.0027 34.875 15.5258 34.6775 15.1742 34.3258C14.8225 33.9742 14.625 33.4973 14.625 33V22.875H33.375V33C33.375 33.4973 33.1775 33.9742 32.8258 34.3258C32.4742 34.6775 31.9973 34.875 31.5 34.875Z" fill="currentColor"/>
            <rect x="16.125" y="24.75" width="2.25" height="2.25" rx="1" fill="currentColor"/>
            <rect x="20.625" y="24.75" width="2.25" height="2.25" rx="1" fill="currentColor"/>
            <rect x="25.125" y="24.75" width="2.25" height="2.25" rx="1" fill="currentColor"/>
            <rect x="29.625" y="24.75" width="2.25" height="2.25" rx="1" fill="currentColor"/>
            <rect x="16.125" y="28.5" width="2.25" height="2.25" rx="1" fill="currentColor"/>
            <rect x="20.625" y="28.5" width="2.25" height="2.25" rx="1" fill="currentColor"/>
            <rect x="25.125" y="28.5" width="2.25" height="2.25" rx="1" fill="currentColor"/>
          </svg>
        </span>

        <!-- Week Content -->
        <div class="week-content">
          <div class="week-main">
            <!-- Week Number -->
            <p class="week-number">WEEK ${weekInfo.weekNumber}</p>

            <!-- Date Details -->
            <div class="week-dates">
              <div class="date-range">
                <p class="date-label">START:</p>
                <p class="date-value">${weekInfo.startDate}</p>
              </div>
              <div class="date-range">
                <p class="date-label">END:</p>
                <p class="date-value">${weekInfo.endDate}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Dropdown Arrow -->
        <span class="week-dropdown" aria-hidden="true">▼</span>
      </button>
    `;
  }

  /**
   * Get store scope information for display
   *
   * @private
   * @returns {Object} Store scope information
   */
  _getStoreScopeInfo() {
    const { source, filter } = this.contextState;

    // Default scope information
    let scopeText = 'All Stores';
    let storeCount = 67; // Default total store count

    if (filter) {
      if (filter.includes('category') || filter === 'by-category') {
        scopeText = 'By Category';
        storeCount = null; // No count for category filter
      } else if (filter.includes('size') || filter === 'by-size') {
        scopeText = 'By Size';
        storeCount = null; // No count for size filter
      } else if (filter.includes('deal') || filter === 'by-deal-type') {
        scopeText = 'By Deal Type';
        storeCount = null; // No count for deal type filter
      } else if (filter === 'digital') {
        scopeText = 'Digital Only';
        storeCount = 45; // Digital stores count
      } else if (filter === 'print') {
        scopeText = 'Print Only';
        storeCount = 22; // Print stores count
      } else if (filter.includes('northeast')) {
        scopeText = 'Northeast Region';
        storeCount = 12; // Northeast region count
      } else if (filter.includes('store-')) {
        // Individual store selection
        const storeNumber = filter.replace('store-', '');
        scopeText = `Store #${storeNumber}`;
        storeCount = null; // No count for individual store
      } else {
        scopeText = filter.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        storeCount = null; // Unknown filter, no count
      }
    }

    // Format display text with count if available
    const displayText = storeCount ? `${scopeText} (${storeCount})` : scopeText;

    return {
      scopeText,
      storeCount,
      displayText
    };
  }

  /**
   * Generate right section HTML (Scope/Filter context)
   *
   * @private
   * @returns {string} Right section HTML
   */
  _generateRightSection() {
    const storeInfo = this._getStoreScopeInfo();

    return `
      <button type="button" class="pill-component store-selector"
              data-action="scope"
              aria-label="Change store scope"
              title="Change store scope">

        <!-- Store Icon -->
        <span class="pill-icon" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M33.54 19.5L34.44 24H13.56L14.46 19.5H33.54ZM36 12H12V15H36V12ZM36 16.5H12L10.5 24V27H12V36H27V27H33V36H36V27H37.5V24L36 16.5ZM15 33V27H24V33H15Z" fill="currentColor"/>
          </svg>
        </span>

        <!-- Store Text -->
        <span class="pill-text">${storeInfo.displayText}</span>

        <!-- Dropdown Arrow -->
        <span class="pill-arrow" aria-hidden="true">▼</span>
      </button>
    `;
  }

  /**
   * Hide component when not in analysis context
   *
   * @private
   */
  _hideComponent() {
    this.container.innerHTML = '';
    this.element = null;
    this.breadcrumbContainer = null;
    this.descriptionContainer = null;
    this.isRendered = false;
  }

  /**
   * Update component content without full re-render
   *
   * @private
   */
  _updateContent() {
    if (!this.isRendered || !this.element) {
      // Full re-render needed
      this.render();
      return;
    }

    const { description, source } = this.contextState;

    // Update description
    if (this.descriptionContainer && description) {
      this.descriptionContainer.textContent = description;
    }

    // Update data attributes
    if (this.element && source) {
      this.element.setAttribute('data-context-source', source);
    }

  }

  /**
   * Attach event listeners - Angular event binding equivalent
   * Sets up click handlers for navigation elements
   *
   * @returns {boolean} Success status
   */
  attachEventListeners() {
    if (!this.isRendered || !this.element) {
      return false;
    }

    try {
      // Breadcrumb link clicks
      const breadcrumbLinks = this.element.querySelectorAll('.breadcrumb-link, .back-link');
      breadcrumbLinks.forEach(link => {
        const clickListener = (e) => this._handleBreadcrumbClick(e, link);
        link.addEventListener('click', clickListener);
        this._eventListeners.push({
          element: link,
          type: 'click',
          listener: clickListener
        });
      });

      // Modify/Change button clicks and pill component clicks
      const actionElements = this.element.querySelectorAll('.modify-btn, .change-btn, .pill-component');
      console.log('🔍 Found action elements:', actionElements.length, Array.from(actionElements).map(el => ({
        className: el.className,
        tagName: el.tagName,
        action: el.getAttribute('data-action')
      })));

      actionElements.forEach(element => {
        const clickListener = (e) => this._handleActionButtonClick(e, element);
        element.addEventListener('click', clickListener);
        this._eventListeners.push({
          element: element,
          type: 'click',
          listener: clickListener
        });
      });

      // Keyboard navigation support
      const keydownListener = (e) => this._handleKeydown(e);
      this.element.addEventListener('keydown', keydownListener);
      this._eventListeners.push({
        element: this.element,
        type: 'keydown',
        listener: keydownListener
      });

      return true;

    } catch (error) {
      console.error('❌ Failed to attach event listeners:', error);
      return false;
    }
  }

  /**
   * Handle breadcrumb navigation clicks
   *
   * @private
   * @param {Event} event - Click event
   * @param {HTMLElement} link - Clicked link element
   */
  _handleBreadcrumbClick(event, link) {
    const href = link.getAttribute('href');

    if (!href || href === '#') {
      event.preventDefault();
      return;
    }


    // Let the browser handle navigation normally for now
    // In future, we could add analytics tracking here
  }

  /**
   * Handle action button clicks (Modify/Change)
   *
   * @private
   * @param {Event} event - Click event
   * @param {HTMLElement} button - Clicked button element
   */
  _handleActionButtonClick(event, button) {
    console.log('🔥 Button clicked!', {
      className: button.className,
      action: button.getAttribute('data-action'),
      tagName: button.tagName
    });

    event.preventDefault();

    const action = button.getAttribute('data-action');

    switch (action) {
      case 'modify-period':
        console.log('📅 Calling _openPeriodSelector...');
        this._openPeriodSelector();
        break;
      case 'change-scope':
      case 'scope':
        console.log('🏪 Calling _openScopeSelector...');
        this._openScopeSelector();
        break;
      default:
        console.warn('⚠️ Unknown action:', action);
    }
  }

  /**
   * Open period selector overlay
   *
   * @private
   */
  _openPeriodSelector() {
    // Create period selector if it doesn't exist
    if (!this.periodSelectorComponent) {
      this._initializePeriodSelector();
    }

    // Show the period selector
    if (this.periodSelectorComponent) {
      this.periodSelectorComponent.show();
    } else {
      console.error('❌ Period selector component not available');
    }
  }

  /**
   * Open scope selector overlay
   *
   * @private
   */
  _openScopeSelector() {
    // Create scope selector if it doesn't exist
    if (!this.scopeSelectorComponent) {
      this._initializeScopeSelector();
    }

    // Show the scope selector
    if (this.scopeSelectorComponent) {
      this.scopeSelectorComponent.show();
    } else {
      console.error('❌ Scope selector component not available');
    }
  }

  /**
   * Initialize period selector component
   *
   * @private
   */
  _initializePeriodSelector() {
    try {
      console.log('📅 Checking PeriodSelectorComponent availability:', !!window.PeriodSelectorComponent);

      if (!window.PeriodSelectorComponent) {
        console.error('❌ PeriodSelectorComponent not available');
        return;
      }

      // Create container for period selector
      let container = document.getElementById('period-selector-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'period-selector-container';
        document.body.appendChild(container);
      }

      // Initialize component
      this.periodSelectorComponent = new window.PeriodSelectorComponent(container, this.contextService);
      this.periodSelectorComponent.init();

      // Set up callbacks
      this.periodSelectorComponent.setCallbacks({
        onApply: (selection) => this._handlePeriodChange(selection),
      });


    } catch (error) {
      console.error('❌ Failed to initialize period selector:', error);
    }
  }

  /**
   * Initialize scope selector component
   *
   * @private
   */
  _initializeScopeSelector() {
    try {
      console.log('🏪 Checking ScopeSelectorComponent availability:', !!window.ScopeSelectorComponent);

      if (!window.ScopeSelectorComponent) {
        console.error('❌ ScopeSelectorComponent not available');
        return;
      }

      // Create container for scope selector
      let container = document.getElementById('scope-selector-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'scope-selector-container';
        document.body.appendChild(container);
      }

      // Initialize component
      this.scopeSelectorComponent = new window.ScopeSelectorComponent(container, this.contextService);
      this.scopeSelectorComponent.init();

      // Set up callbacks
      this.scopeSelectorComponent.setCallbacks({
        onApply: (selection) => this._handleScopeChange(selection),
      });


    } catch (error) {
      console.error('❌ Failed to initialize scope selector:', error);
    }
  }

  /**
   * Handle period selection changes
   *
   * @private
   * @param {Object} selection - Period selection
   */
  _handlePeriodChange(selection) {

    // Update context service state
    if (window.ContextStateService && window.ContextStateService.hasInstance()) {
      const stateService = window.ContextStateService.getInstance();
      stateService.setState({
        periodMode: selection.mode,
        primaryWeek: selection.primaryWeek,
        compareWeek: selection.compareWeek
      });
    }
  }

  /**
   * Handle scope selection changes
   *
   * @private
   * @param {Object} selection - Scope selection
   */
  _handleScopeChange(selection) {

    // Update context service state
    if (window.ContextStateService && window.ContextStateService.hasInstance()) {
      const stateService = window.ContextStateService.getInstance();
      stateService.setState({
        scopeLevel: selection.level,
        scopeValue: selection.value,
        scopeName: selection.name,
        storeCount: selection.storeCount
      });
    }
  }

  /**
   * Handle keyboard navigation
   *
   * @private
   * @param {KeyboardEvent} event - Keyboard event
   */
  _handleKeydown(event) {
    // ESC key - could be used to close expanded states
    if (event.key === 'Escape') {
      // Future: close any expanded menus or dropdowns
    }

    // Enter/Space on focusable elements (pill-component buttons handle this automatically)
    // Keep this for backward compatibility with non-button elements
    if ((event.key === 'Enter' || event.key === ' ') &&
        (event.target.classList.contains('breadcrumb-link') ||
         event.target.classList.contains('modify-btn') ||
         event.target.classList.contains('change-btn'))) {
      event.preventDefault();
      event.target.click();
    }

    // Button elements (pill-component) automatically handle Enter and Space keys
    // No additional handling needed for pill-component buttons
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
   * Removes event listeners and service subscriptions
   *
   * @returns {boolean} Success status
   */
  destroy() {
    try {

      // Remove event listeners
      this._removeEventListeners();

      // Unsubscribe from service
      this._serviceSubscriptions.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
      this._serviceSubscriptions = [];

      // Destroy child components
      if (this.periodSelectorComponent) {
        this.periodSelectorComponent.destroy();
        this.periodSelectorComponent = null;
      }

      if (this.scopeSelectorComponent) {
        this.scopeSelectorComponent.destroy();
        this.scopeSelectorComponent = null;
      }

      // Clear DOM
      if (this.container) {
        this.container.innerHTML = '';
      }

      // Reset references
      this.element = null;
      this.breadcrumbContainer = null;
      this.descriptionContainer = null;

      // Reset state
      this.isInitialized = false;
      this.isRendered = false;
      this.contextState = {};

      return true;

    } catch (error) {
      console.error('❌ Error destroying ContextBarComponent:', error);
      return false;
    }
  }

  /**
   * Get component state for debugging
   *
   * @returns {Object} Component state information
   */
  getState() {
    return {
      isInitialized: this.isInitialized,
      isRendered: this.isRendered,
      hasElement: !!this.element,
      contextState: this.contextState,
      eventListeners: this._eventListeners.length,
      serviceSubscriptions: this._serviceSubscriptions.length
    };
  }

  /**
   * Check if component is ready for interaction
   *
   * @returns {boolean} Ready state
   */
  isReady() {
    return this.isInitialized && this.isRendered && !!this.element;
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContextBarComponent;
} else if (typeof window !== 'undefined') {
  window.ContextBarComponent = ContextBarComponent;
}