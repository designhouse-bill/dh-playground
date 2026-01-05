/**
 * Banner Rendering Logic
 * Handles rendering and updating the banner component with full configuration support
 */

import DateUtils from './dateUtils.js';
import BannerConfig from './config.js';

const Banner = {
  // DOM element references
  elements: {
    wrapper: null,        // Sticky wrapper element
    container: null,      // Banner container
    content: null,
    title: null,
    dateRange: null,
    datePartStart: null,
    datePartSeparator: null,
    datePartEnd: null,
    dateLines: null,
    dateStart: null,
    dateEnd: null,
    dayNames: null
  },

  // Breakpoints (matches CSS)
  breakpoints: {
    mobile: 640,
    tablet: 1024
  },

  // Current breakpoint
  currentBreakpoint: 'desktop',

  // Scroll state tracking
  scroll: {
    enabled: false,
    threshold: 200,         // Distance to scroll before hide/show behavior activates
    lastScrollY: 0,
    direction: 'down',
    isActive: false,        // Whether banner has scrolled past threshold (shadow state)
    isHidden: false,        // Whether banner is hidden (slid up)
    ticking: false
  },

  // Spacing maps for padding classes
  spacingMap: {
    sm: 'var(--spacing-sm)',
    md: 'var(--spacing-md)',
    lg: 'var(--spacing-lg)',
    xl: 'var(--spacing-xl)'
  },

  // Font family maps
  fontFamilyMap: {
    primary: 'var(--font-primary)',
    heading: 'var(--font-heading)'
  },

  // Available pattern classes
  patternClasses: [
    'pattern-diagonal-lines',
    'pattern-dots',
    'pattern-crosshatch',
    'pattern-waves',
    'pattern-chevron',
    'pattern-grid',
    'pattern-noise'
  ],

  /**
   * Initialize the banner
   * @param {string} selector - CSS selector for banner container
   */
  init(selector = '.circular-date-banner') {
    this.elements.container = document.querySelector(selector);

    if (!this.elements.container) {
      console.error('[Banner] Container not found:', selector);
      return this;
    }

    // Find the sticky wrapper (parent element)
    this.elements.wrapper = this.elements.container.closest('.banner-sticky-wrapper');

    this.elements.content = this.elements.container.querySelector('.banner__content');
    this.elements.title = this.elements.container.querySelector('.banner__title');
    this.elements.dateRange = this.elements.container.querySelector('.banner__date-range');
    this.elements.datePartStart = this.elements.container.querySelector('.banner__date-part--start');
    this.elements.datePartSeparator = this.elements.container.querySelector('.banner__date-part--separator');
    this.elements.datePartEnd = this.elements.container.querySelector('.banner__date-part--end');
    this.elements.dateLines = this.elements.container.querySelector('.banner__date-lines');
    this.elements.dateStart = this.elements.container.querySelector('.banner__date-start');
    this.elements.dateEnd = this.elements.container.querySelector('.banner__date-end');
    this.elements.dayNames = this.elements.container.querySelector('.banner__day-names');

    // Subscribe to config changes
    BannerConfig.on('change', ({ key, value }) => {
      // Handle sticky-related config changes
      if (key === 'stickyEnabled') {
        if (value) {
          this.enableStickyScroll(BannerConfig.get('stickyThreshold') || 200);
        } else {
          this.disableStickyScroll();
        }
      } else if (key === 'stickyThreshold') {
        this.setStickyThreshold(value);
      }

      this.render(BannerConfig.getAll());
    });

    BannerConfig.on('reset', () => {
      const config = BannerConfig.getAll();
      if (config.stickyEnabled) {
        this.enableStickyScroll(config.stickyThreshold || 200);
      } else {
        this.disableStickyScroll();
      }
      this.render(config);
    });

    // Set up resize listener
    this.setupResizeListener();

    // Initial breakpoint detection
    this.updateBreakpoint();

    // Initialize sticky scroll behavior
    this.initStickyScroll();

    // Apply initial sticky state from config
    const config = BannerConfig.getAll();
    if (config.stickyEnabled) {
      this.enableStickyScroll(config.stickyThreshold || 200);
    } else {
      this.disableStickyScroll();
    }

    console.log('[Banner] Initialized');
    return this;
  },

  /**
   * Set up resize listener for responsive behavior
   */
  setupResizeListener() {
    let resizeTimeout;

    const handleResize = () => {
      // Debounce resize events
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const previousBreakpoint = this.currentBreakpoint;
        this.updateBreakpoint();

        // Re-render if breakpoint changed
        if (previousBreakpoint !== this.currentBreakpoint) {
          console.log('[Banner] Breakpoint changed:', previousBreakpoint, '->', this.currentBreakpoint);
          this.render(BannerConfig.getAll());
        }
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    console.log('[Banner] Resize listener attached');
  },

  /**
   * Update current breakpoint based on window width
   */
  updateBreakpoint() {
    const width = window.innerWidth;

    if (width < this.breakpoints.mobile) {
      this.currentBreakpoint = 'mobile';
    } else if (width < this.breakpoints.tablet) {
      this.currentBreakpoint = 'tablet';
    } else {
      this.currentBreakpoint = 'desktop';
    }
  },

  /**
   * Get the current breakpoint
   * @returns {string} 'mobile' | 'tablet' | 'desktop'
   */
  getBreakpoint() {
    return this.currentBreakpoint;
  },

  /**
   * Initialize sticky scroll behavior
   * Uses CSS position: sticky which keeps banner within parent container
   */
  initStickyScroll() {
    if (!this.elements.container) return;

    // Set up scroll listener with throttling via requestAnimationFrame
    this.boundScrollHandler = this.handleScroll.bind(this);
    window.addEventListener('scroll', this.boundScrollHandler, { passive: true });

    console.log('[Banner] Sticky scroll initialized');
  },

  /**
   * Handle scroll events (throttled via rAF)
   */
  handleScroll() {
    if (!this.scroll.enabled || this.scroll.ticking) return;

    this.scroll.ticking = true;

    requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      this.evaluateStickyState(scrollY);
      this.scroll.ticking = false;
    });
  },

  /**
   * Evaluate and update sticky state based on scroll position
   * With position: sticky, we only need to:
   * 1. Track when we're past the threshold (to show shadow)
   * 2. Hide/show based on scroll direction
   * @param {number} scrollY - Current scroll position
   */
  evaluateStickyState(scrollY) {
    const { threshold, lastScrollY } = this.scroll;

    // Determine scroll direction (need minimum delta to avoid micro-movements)
    const delta = scrollY - lastScrollY;
    const minDelta = 5; // Minimum scroll distance to trigger direction change

    let direction = this.scroll.direction;
    if (Math.abs(delta) >= minDelta) {
      direction = delta > 0 ? 'down' : 'up';
      this.scroll.direction = direction;
    }

    // Determine if we're past threshold (for shadow/active state)
    const isPastThreshold = scrollY > threshold;

    // Determine hidden state based on direction and position
    let shouldHide = false;
    if (isPastThreshold && direction === 'down') {
      // Scrolling down past threshold - hide
      shouldHide = true;
    } else if (direction === 'up') {
      // Scrolling up - always show
      shouldHide = false;
    }

    // Update state
    this.setStickyState(isPastThreshold, shouldHide);

    // Update last scroll position
    this.scroll.lastScrollY = scrollY;

    // Dispatch scroll event for debugging
    this.dispatchScrollEvent(scrollY, direction);
  },

  /**
   * Set the sticky state of the banner
   * @param {boolean} active - Whether banner is past threshold (shows shadow)
   * @param {boolean} hidden - Whether banner should be hidden
   */
  setStickyState(active, hidden) {
    const container = this.elements.container;
    if (!container) return;

    const stateChanged = this.scroll.isActive !== active || this.scroll.isHidden !== hidden;
    if (!stateChanged) return;

    // Update state
    this.scroll.isActive = active;
    this.scroll.isHidden = hidden;

    // Update classes for active state (shadow)
    container.classList.toggle('circular-date-banner--sticky-active', active);

    // Update classes for hidden/visible state
    if (hidden) {
      container.classList.add('circular-date-banner--hidden');
      container.classList.remove('circular-date-banner--visible');
    } else {
      container.classList.remove('circular-date-banner--hidden');
      container.classList.add('circular-date-banner--visible');
    }

    console.log('[Banner] Sticky state:', { active, hidden });
  },

  /**
   * Dispatch scroll event for external listeners
   * @param {number} scrollY - Current scroll position
   * @param {string} direction - Scroll direction
   */
  dispatchScrollEvent(scrollY, direction) {
    const event = new CustomEvent('banner:scroll', {
      detail: {
        scrollY,
        direction,
        isSticky: this.scroll.isActive,
        isHidden: this.scroll.isHidden
      },
      bubbles: true
    });
    document.dispatchEvent(event);
  },

  /**
   * Enable sticky scroll behavior
   * @param {number} threshold - Scroll threshold in pixels
   */
  enableStickyScroll(threshold = 200) {
    this.scroll.enabled = true;
    this.scroll.threshold = threshold;

    // Add sticky-active class to wrapper (enables position: sticky via CSS)
    if (this.elements.wrapper) {
      this.elements.wrapper.classList.add('banner-sticky-wrapper--active');
    }

    // Add the sticky-enabled class to banner for transitions
    if (this.elements.container) {
      this.elements.container.classList.add('circular-date-banner--sticky-enabled');
    }

    console.log('[Banner] Sticky scroll enabled with threshold:', threshold);
  },

  /**
   * Disable sticky scroll behavior
   */
  disableStickyScroll() {
    this.scroll.enabled = false;

    // Remove active class from wrapper
    if (this.elements.wrapper) {
      this.elements.wrapper.classList.remove('banner-sticky-wrapper--active');
    }

    // Remove all sticky-related classes from banner
    if (this.elements.container) {
      this.elements.container.classList.remove(
        'circular-date-banner--sticky-enabled',
        'circular-date-banner--sticky-active',
        'circular-date-banner--hidden',
        'circular-date-banner--visible'
      );
    }

    // Reset state
    this.scroll.isActive = false;
    this.scroll.isHidden = false;

    console.log('[Banner] Sticky scroll disabled');
  },

  /**
   * Update sticky threshold
   * @param {number} threshold - New threshold value
   */
  setStickyThreshold(threshold) {
    this.scroll.threshold = threshold;
    // Re-evaluate current state with new threshold
    if (this.scroll.enabled) {
      this.evaluateStickyState(window.scrollY);
    }
  },

  /**
   * Get current scroll state
   * @returns {object} Current scroll state
   */
  getScrollState() {
    return { ...this.scroll };
  },

  /**
   * Render the banner with given configuration
   * @param {object} config - Banner configuration
   */
  render(config) {
    if (!this.elements.container) {
      console.error('[Banner] Not initialized');
      return this;
    }

    // Apply visibility
    if (!config.enabled) {
      this.elements.container.style.display = 'none';
      return this;
    }
    this.elements.container.style.display = '';

    // Calculate dates
    let startDate, endDate;
    if (config.startDayOfWeek) {
      const calculatedRange = DateUtils.calculateCircularDateRange(
        config.startDayOfWeek,
        config.referenceDate || new Date()
      );
      startDate = calculatedRange.startDate;
      endDate = calculatedRange.endDate;
    }

    // Determine layout mode
    const isHorizontal = config.layoutMode === 'horizontal';

    // Update layout classes
    if (this.elements.container) {
      this.elements.container.classList.toggle('circular-date-banner--horizontal', isHorizontal);
      this.elements.container.classList.toggle('circular-date-banner--vertical', !isHorizontal);
    }

    // Update title with locale-appropriate text
    if (this.elements.title) {
      const headerText = config.locale === 'es'
        ? (config.headerTextTranslated || config.headerText)
        : config.headerText;
      this.elements.title.textContent = headerText;

      // Show/hide title based on showTitle config
      this.elements.title.style.display = config.showTitle ? '' : 'none';
    }

    // Determine if using two-line date layout (only in horizontal mode)
    const isTwoLine = isHorizontal && config.dateLayout === 'two-line';

    // Update date range display
    if (startDate && endDate) {
      if (isTwoLine) {
        // Two-line layout: show separate start/end lines
        const formatOpts = {
          dayNameFormat: config.dayNameFormat || 'abbreviated',
          showYear: config.showYear ?? true,
          locale: config.locale || 'en',
          twoLine: true
        };
        const { startLine, endLine } = DateUtils.formatInlineDateRange(startDate, endDate, formatOpts);

        if (this.elements.dateStart) this.elements.dateStart.textContent = startLine;
        if (this.elements.dateEnd) this.elements.dateEnd.textContent = endLine;
        if (this.elements.dateRange) this.elements.dateRange.style.display = 'none';
        if (this.elements.dateLines) this.elements.dateLines.style.display = '';
      } else if (isHorizontal) {
        // Horizontal single-line: inline format with day names (using twoLine to get separate parts)
        const formatOpts = {
          dayNameFormat: config.dayNameFormat || 'abbreviated',
          showYear: config.showYear ?? true,
          locale: config.locale || 'en',
          twoLine: true // Get start and end separately
        };
        const { startLine, endLine } = DateUtils.formatInlineDateRange(startDate, endDate, formatOpts);

        // Populate separate date parts for flex wrap
        if (this.elements.datePartStart) this.elements.datePartStart.textContent = startLine;
        if (this.elements.datePartEnd) this.elements.datePartEnd.textContent = endLine;
        if (this.elements.datePartSeparator) this.elements.datePartSeparator.style.display = '';
        if (this.elements.dateRange) this.elements.dateRange.style.display = '';
        if (this.elements.dateLines) this.elements.dateLines.style.display = 'none';
      } else {
        // Vertical layout: use same inline format as horizontal for consistency
        // When showDayNames is true, day names are inline with dates (e.g., "Wed, Dec 31")
        // When showDayNames is false, just show dates without day names
        if (config.showDayNames) {
          // Use inline format with day names (same as horizontal mode)
          const formatOpts = {
            dayNameFormat: config.dayNameFormat || 'abbreviated',
            showYear: config.showYear ?? false,
            locale: config.locale || 'en',
            twoLine: true
          };
          const { startLine, endLine } = DateUtils.formatInlineDateRange(startDate, endDate, formatOpts);

          if (this.elements.datePartStart) this.elements.datePartStart.textContent = startLine;
          if (this.elements.datePartEnd) this.elements.datePartEnd.textContent = endLine;
          if (this.elements.datePartSeparator) this.elements.datePartSeparator.style.display = '';
        } else {
          // No day names - use standard date format
          const formatOpts = {
            format: config.dateFormat || 'explicit',
            showYear: config.showYear ?? false,
            showDayNames: false,
            locale: config.locale || 'en'
          };

          const dateRangeText = DateUtils.formatDateRange(startDate, endDate, formatOpts);

          // Split at separator and populate parts
          const parts = dateRangeText.split(' - ');
          if (parts.length === 2) {
            if (this.elements.datePartStart) this.elements.datePartStart.textContent = parts[0];
            if (this.elements.datePartEnd) this.elements.datePartEnd.textContent = parts[1];
            if (this.elements.datePartSeparator) this.elements.datePartSeparator.style.display = '';
          } else {
            if (this.elements.datePartStart) this.elements.datePartStart.textContent = dateRangeText;
            if (this.elements.datePartEnd) this.elements.datePartEnd.textContent = '';
            if (this.elements.datePartSeparator) this.elements.datePartSeparator.style.display = 'none';
          }
        }

        if (this.elements.dateRange) this.elements.dateRange.style.display = '';
        if (this.elements.dateLines) this.elements.dateLines.style.display = 'none';
      }
    }

    // Day names element is no longer used - always hide it
    // Day names are now inline with dates in both vertical and horizontal modes
    if (this.elements.dayNames) {
      this.elements.dayNames.style.display = 'none';
      if (this.elements.content) {
        this.elements.content.classList.remove('banner__content--stacked');
      }
    }

    // Apply styles
    this.applyStyles(config);

    console.log('[Banner] Rendered with config, layout:', config.layoutMode);
    return this;
  },

  /**
   * Apply all style configurations to the banner
   * @param {object} config - Configuration object
   */
  applyStyles(config) {
    const container = this.elements.container;
    const content = this.elements.content;
    const title = this.elements.title;
    const dateRange = this.elements.dateRange;
    const dayNames = this.elements.dayNames;

    if (!container) return;

    // Background color
    container.style.backgroundColor = config.backgroundColor || '#1a5f2a';

    // Text color (apply to all text elements)
    const textColor = config.textColor || '#ffffff';
    container.style.color = textColor;
    if (title) title.style.color = textColor;
    if (dateRange) dateRange.style.color = textColor;
    if (dayNames) dayNames.style.color = textColor;
    if (this.elements.dateStart) this.elements.dateStart.style.color = textColor;
    if (this.elements.dateEnd) this.elements.dateEnd.style.color = textColor;
    if (this.elements.datePartStart) this.elements.datePartStart.style.color = textColor;
    if (this.elements.datePartSeparator) this.elements.datePartSeparator.style.color = textColor;
    if (this.elements.datePartEnd) this.elements.datePartEnd.style.color = textColor;

    // Padding
    const paddingV = this.spacingMap[config.paddingVertical] || this.spacingMap.md;
    const paddingH = this.spacingMap[config.paddingHorizontal] || this.spacingMap.md;
    container.style.padding = `${paddingV} ${paddingH}`;

    // Alignment - horizontal mode uses separate title/date alignment
    const isHorizontal = config.layoutMode === 'horizontal';
    const isReversed = config.flexDirection === 'reverse';

    if (isHorizontal) {
      const showTitle = config.showTitle;

      // In horizontal mode, adjust justify-content based on whether title is shown
      if (content) {
        // Set flex direction (row or row-reverse)
        content.style.flexDirection = isReversed ? 'row-reverse' : 'row';

        if (showTitle) {
          // Both title and date visible - use space-between
          content.style.justifyContent = 'space-between';
        } else {
          // Only date visible - use the date alignment for the whole content
          const dateAlign = config.dateAlignment || 'right';
          content.style.justifyContent = this.getFlexJustify(dateAlign);
        }
        content.style.alignItems = 'center';
      }

      // Title alignment
      if (title) {
        title.style.textAlign = config.titleAlignment || 'left';
      }

      // Date alignment (applies to dateRange, dateLines, dateStart, dateEnd)
      const dateAlign = config.dateAlignment || 'right';
      if (dateRange) {
        // For the flex container, use justify-content instead of text-align
        dateRange.style.justifyContent = this.getFlexJustify(dateAlign);
      }
      if (this.elements.dateLines) this.elements.dateLines.style.textAlign = dateAlign;
      if (this.elements.dateStart) this.elements.dateStart.style.textAlign = dateAlign;
      if (this.elements.dateEnd) this.elements.dateEnd.style.textAlign = dateAlign;
    } else {
      // Vertical mode: single alignment for all
      container.style.textAlign = config.alignment || 'center';
      if (content) {
        // Set flex direction (column or column-reverse)
        content.style.flexDirection = isReversed ? 'column-reverse' : 'column';
        content.style.justifyContent = 'center';
        content.style.alignItems = this.getFlexAlignment(config.alignment);
      }
    }

    // Typography - Font Family
    const fontFamily = this.fontFamilyMap[config.fontFamily] || this.fontFamilyMap.primary;
    if (title) {
      // Title uses heading font by default, but respect config
      title.style.fontFamily = config.fontFamily === 'primary' ? fontFamily : 'var(--font-heading)';
    }
    if (dateRange) dateRange.style.fontFamily = fontFamily;
    if (dayNames) dayNames.style.fontFamily = fontFamily;

    // Typography - Font Weight
    if (title) title.style.fontWeight = config.fontWeight || 600;

    // Typography - Text Transform (for title)
    const textTransform = config.textTransform || 'uppercase';
    if (title) title.style.textTransform = textTransform;

    // Date Text Transform (for date range line)
    const dateTextTransform = config.dateTextTransform || 'capitalize';
    if (dateRange) dateRange.style.textTransform = dateTextTransform;
    if (dayNames) dayNames.style.textTransform = dateTextTransform;
    if (this.elements.dateStart) this.elements.dateStart.style.textTransform = dateTextTransform;
    if (this.elements.dateEnd) this.elements.dateEnd.style.textTransform = dateTextTransform;
    if (this.elements.datePartStart) this.elements.datePartStart.style.textTransform = dateTextTransform;
    if (this.elements.datePartEnd) this.elements.datePartEnd.style.textTransform = dateTextTransform;

    // Border styles
    this.applyBorderStyles(config);

    // Background pattern
    this.applyPattern(config);
  },

  /**
   * Apply background pattern
   * @param {object} config - Configuration object
   */
  applyPattern(config) {
    const container = this.elements.container;
    if (!container) return;

    // Remove all existing pattern classes
    this.patternClasses.forEach(cls => {
      container.classList.remove(cls);
    });

    // Apply new pattern if specified
    const pattern = config.backgroundPattern || 'none';
    if (pattern !== 'none') {
      const patternClass = `pattern-${pattern}`;
      if (this.patternClasses.includes(patternClass)) {
        container.classList.add(patternClass);
      }
    }

    // Set pattern opacity via CSS custom property
    const opacity = config.patternOpacity ?? 0.1;
    container.style.setProperty('--pattern-opacity', opacity);
  },

  /**
   * Apply border styles
   * @param {object} config - Configuration object
   */
  applyBorderStyles(config) {
    const container = this.elements.container;
    if (!container) return;

    const borderStyle = config.borderStyle || 'none';
    const borderColor = config.borderColor || '#000000';
    const borderWidth = config.borderWidth || 2;

    // Reset borders first
    container.style.border = 'none';
    container.style.borderBottom = 'none';

    if (borderStyle === 'solid') {
      container.style.border = `${borderWidth}px solid ${borderColor}`;
    } else if (borderStyle === 'bottom-only') {
      container.style.borderBottom = `${borderWidth}px solid ${borderColor}`;
    }
  },

  /**
   * Convert text alignment to flex alignment (align-items)
   * @param {string} alignment - 'left' | 'center' | 'right'
   * @returns {string} Flex alignment value
   */
  getFlexAlignment(alignment) {
    switch (alignment) {
      case 'left': return 'flex-start';
      case 'right': return 'flex-end';
      default: return 'center';
    }
  },

  /**
   * Convert text alignment to flex justify-content
   * @param {string} alignment - 'left' | 'center' | 'right'
   * @returns {string} Flex justify-content value
   */
  getFlexJustify(alignment) {
    switch (alignment) {
      case 'left': return 'flex-start';
      case 'right': return 'flex-end';
      default: return 'center';
    }
  },

  /**
   * Get computed banner dimensions
   * @returns {object} Width and height
   */
  getDimensions() {
    if (!this.elements.container) return { width: 0, height: 0 };

    const rect = this.elements.container.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height
    };
  }
};

export default Banner;
