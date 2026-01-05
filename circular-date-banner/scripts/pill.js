/**
 * Floating Validity Pill
 * Shows days remaining and expands to show full date range details
 */

import DateUtils from './dateUtils.js';
import BannerConfig from './config.js';

const Pill = {
  // DOM element references
  elements: {
    container: null,
    countdown: null,
    dateStart: null,
    dateEnd: null,
    header: null
  },

  // Current state
  state: {
    expanded: false,
    startDate: null,
    endDate: null,
    collapseTimeout: null
  },

  // Touch detection
  isTouchDevice: false,

  // Auto-collapse timeout (ms) for mobile
  MOBILE_COLLAPSE_DELAY: 5000,

  /**
   * Initialize the pill
   * @param {string} selector - CSS selector for pill container
   */
  init(selector = '.validity-pill') {
    this.elements.container = document.querySelector(selector);

    if (!this.elements.container) {
      // Create the pill element if it doesn't exist
      this.createElement();
    }

    this.cacheElements();
    this.detectTouch();
    this.bindEvents();

    // Subscribe to config changes
    BannerConfig.on('change', () => {
      this.render(BannerConfig.getAll());
    });

    BannerConfig.on('reset', () => {
      this.state.expanded = false;
      this.render(BannerConfig.getAll());
    });

    console.log('[Pill] Initialized');
    return this;
  },

  /**
   * Create the pill DOM element
   */
  createElement() {
    const pill = document.createElement('div');
    pill.className = 'validity-pill validity-pill--bottom-left validity-pill--active';
    pill.innerHTML = `
      <div class="validity-pill__container">
        <div class="validity-pill__collapsed">
          <span class="validity-pill__countdown">Loading...</span>
          <span class="validity-pill__expand-hint">▼</span>
        </div>
        <div class="validity-pill__expanded-wrapper">
          <div class="validity-pill__expanded">
            <div class="validity-pill__expanded-inner">
              <div class="validity-pill__divider"></div>
              <div class="validity-pill__header">Weekly Ad</div>
              <div class="validity-pill__dates">
                <div class="validity-pill__date-start">-</div>
                <div class="validity-pill__date-end">-</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Append to promotions-column for positioning relative to the column
    const column = document.querySelector('.promotions-column');
    if (column) {
      column.appendChild(pill);
    } else {
      // Fallback to body if column not found
      document.body.appendChild(pill);
    }
    this.elements.container = pill;
  },

  /**
   * Cache DOM element references
   */
  cacheElements() {
    if (!this.elements.container) return;

    this.elements.countdown = this.elements.container.querySelector('.validity-pill__countdown');
    this.elements.dateStart = this.elements.container.querySelector('.validity-pill__date-start');
    this.elements.dateEnd = this.elements.container.querySelector('.validity-pill__date-end');
    this.elements.header = this.elements.container.querySelector('.validity-pill__header');
  },

  /**
   * Detect if this is a touch device
   */
  detectTouch() {
    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  /**
   * Bind event listeners
   */
  bindEvents() {
    if (!this.elements.container) return;

    const container = this.elements.container.querySelector('.validity-pill__container');

    if (this.isTouchDevice) {
      // Mobile: tap to expand, auto-collapse after 5 seconds
      container.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleMobileTap();
      });

      // Close when tapping outside
      document.addEventListener('click', (e) => {
        if (this.state.expanded && !this.elements.container.contains(e.target)) {
          this.collapse();
          this.clearCollapseTimeout();
        }
      });
    } else {
      // Desktop: hover to expand (CSS handles this), no click behavior needed
      // The CSS @media (hover: hover) rules handle the expansion
      // We just need to prevent any click behavior
      container.addEventListener('click', (e) => {
        e.preventDefault();
      });
    }

    // Keyboard accessibility
    container.setAttribute('tabindex', '0');
    container.setAttribute('role', 'button');
    container.setAttribute('aria-label', 'Circular validity information');

    container.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (this.isTouchDevice) {
          this.handleMobileTap();
        }
      }
      if (e.key === 'Escape' && this.state.expanded) {
        this.collapse();
        this.clearCollapseTimeout();
      }
    });
  },

  /**
   * Handle mobile tap - expand and set auto-collapse timeout
   */
  handleMobileTap() {
    // Clear any existing timeout
    this.clearCollapseTimeout();

    if (this.state.expanded) {
      // If already expanded, collapse immediately
      this.collapse();
    } else {
      // Expand and set timeout to auto-collapse
      this.expand();
      this.state.collapseTimeout = setTimeout(() => {
        this.collapse();
      }, this.MOBILE_COLLAPSE_DELAY);
    }
  },

  /**
   * Clear the auto-collapse timeout
   */
  clearCollapseTimeout() {
    if (this.state.collapseTimeout) {
      clearTimeout(this.state.collapseTimeout);
      this.state.collapseTimeout = null;
    }
  },

  /**
   * Toggle expanded state
   */
  toggleExpanded() {
    this.state.expanded = !this.state.expanded;
    this.updateExpandedState();
  },

  /**
   * Expand the pill
   */
  expand() {
    this.state.expanded = true;
    this.updateExpandedState();
  },

  /**
   * Collapse the pill
   */
  collapse() {
    this.state.expanded = false;
    this.updateExpandedState();
  },

  /**
   * Update DOM to reflect expanded state
   */
  updateExpandedState() {
    if (!this.elements.container) return;

    this.elements.container.classList.toggle('validity-pill--expanded', this.state.expanded);

    // Update ARIA
    const container = this.elements.container.querySelector('.validity-pill__container');
    container.setAttribute('aria-expanded', this.state.expanded.toString());
  },

  /**
   * Render the pill with current configuration
   * @param {object} config - Banner configuration
   */
  render(config) {
    if (!this.elements.container) return this;

    // Show/hide based on config
    const show = config.showValidityPill !== false;
    this.elements.container.classList.toggle('validity-pill--hidden', !show);

    if (!show) return this;

    // Calculate dates
    let startDate, endDate;
    if (config.startDayOfWeek) {
      const calculatedRange = DateUtils.calculateCircularDateRange(
        config.startDayOfWeek,
        config.referenceDate || new Date()
      );
      startDate = calculatedRange.startDate;
      endDate = calculatedRange.endDate;
      this.state.startDate = startDate;
      this.state.endDate = endDate;
    }

    // Update position
    this.elements.container.classList.remove('validity-pill--bottom-left', 'validity-pill--bottom-right');
    const position = config.pillPosition || 'bottom-left';
    this.elements.container.classList.add(`validity-pill--${position}`);

    // Calculate days remaining and status
    const daysRemaining = DateUtils.getDaysRemaining(endDate);
    const status = this.getStatus(daysRemaining);

    // Update status classes
    this.elements.container.classList.remove('validity-pill--active', 'validity-pill--expiring', 'validity-pill--expired');
    this.elements.container.classList.add(`validity-pill--${status}`);

    // Update colors to match banner
    const bgColor = config.backgroundColor || '#1a5f2a';
    const textColor = config.textColor || '#ffffff';

    // Only apply custom colors if not expiring/expired
    if (status === 'active') {
      this.elements.container.style.setProperty('--pill-bg-color', bgColor);
      this.elements.container.style.setProperty('--pill-text-color', textColor);
    } else {
      this.elements.container.style.removeProperty('--pill-bg-color');
      this.elements.container.style.removeProperty('--pill-text-color');
    }

    // Update countdown text
    const locale = config.locale || 'en';
    if (this.elements.countdown) {
      this.elements.countdown.textContent = DateUtils.formatDaysRemaining(daysRemaining, locale);
    }

    // Update expanded content
    this.updateExpandedContent(config, startDate, endDate, locale);

    return this;
  },

  /**
   * Get status based on days remaining
   * @param {number} daysRemaining
   * @returns {string} 'active' | 'expiring' | 'expired'
   */
  getStatus(daysRemaining) {
    if (daysRemaining <= 0) return 'expired';
    if (daysRemaining <= 2) return 'expiring';
    return 'active';
  },

  /**
   * Update the expanded content
   * @param {object} config
   * @param {Date} startDate
   * @param {Date} endDate
   * @param {string} locale
   */
  updateExpandedContent(config, startDate, endDate, locale) {
    // Update header text
    if (this.elements.header) {
      const headerText = locale === 'es'
        ? (config.headerTextTranslated || config.headerText || 'OFERTAS SEMANALES')
        : (config.headerText || 'WEEKLY AD');
      this.elements.header.textContent = headerText;
    }

    // Update stacked dates (same format as banner)
    if (startDate && endDate) {
      const formatOpts = {
        dayNameFormat: config.dayNameFormat || 'abbreviated',
        showYear: config.showYear ?? false,
        locale,
        twoLine: true
      };
      const { startLine, endLine } = DateUtils.formatInlineDateRange(startDate, endDate, formatOpts);

      if (this.elements.dateStart) {
        this.elements.dateStart.textContent = startLine;
      }
      if (this.elements.dateEnd) {
        this.elements.dateEnd.textContent = endLine;
      }

      // Apply text transform to match banner (uppercase or capitalize)
      const textTransform = config.dateTextTransform || 'capitalize';
      const datesContainer = this.elements.container.querySelector('.validity-pill__dates');
      if (datesContainer) {
        datesContainer.style.textTransform = textTransform;
      }
    }
  },

  /**
   * Show the pill
   */
  show() {
    if (this.elements.container) {
      this.elements.container.classList.remove('validity-pill--hidden');
    }
    return this;
  },

  /**
   * Hide the pill
   */
  hide() {
    if (this.elements.container) {
      this.elements.container.classList.add('validity-pill--hidden');
    }
    return this;
  }
};

export default Pill;
