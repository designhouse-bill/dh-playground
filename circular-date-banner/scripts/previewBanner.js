/**
 * Preview Banner Module
 * Renders a preview banner in the modal that updates in real-time with config changes
 * Mirrors Banner.js rendering logic but without sticky scroll behavior
 */

import DateUtils from './dateUtils.js';
import BannerConfig from './config.js';

const PreviewBanner = {
  // DOM element references
  elements: {
    container: null,
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
    heading: 'var(--font-heading)',
    inter: 'var(--font-inter)',
    poppins: 'var(--font-poppins)',
    montserrat: 'var(--font-montserrat)',
    roboto: 'var(--font-roboto)',
    'open-sans': 'var(--font-open-sans)'
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
   * Initialize the preview banner
   * @param {string} selector - CSS selector for preview banner container
   */
  init(selector = '#modal-preview-banner') {
    this.elements.container = document.querySelector(selector);

    if (!this.elements.container) {
      console.warn('[PreviewBanner] Container not found:', selector);
      return this;
    }

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

    // Subscribe to config changes for real-time updates
    BannerConfig.on('change', () => this.render(BannerConfig.getAll()));
    BannerConfig.on('reset', () => this.render(BannerConfig.getAll()));
    BannerConfig.on('preset', () => this.render(BannerConfig.getAll()));

    // Re-render when modal opens (ensures dates are populated)
    document.addEventListener('modal:open', () => this.render(BannerConfig.getAll()));

    console.log('[PreviewBanner] Initialized');
    return this;
  },

  /**
   * Render the preview banner with given configuration
   * @param {object} config - Banner configuration
   */
  render(config) {
    if (!this.elements.container) {
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
          monthFormat: config.monthFormat || 'abbreviated',
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
        // Horizontal single-line: inline format with day names
        const formatOpts = {
          dayNameFormat: config.dayNameFormat || 'abbreviated',
          monthFormat: config.monthFormat || 'abbreviated',
          showYear: config.showYear ?? true,
          locale: config.locale || 'en',
          twoLine: true
        };
        const { startLine, endLine } = DateUtils.formatInlineDateRange(startDate, endDate, formatOpts);

        if (this.elements.datePartStart) this.elements.datePartStart.textContent = startLine;
        if (this.elements.datePartEnd) this.elements.datePartEnd.textContent = endLine;
        if (this.elements.datePartSeparator) this.elements.datePartSeparator.style.display = '';
        if (this.elements.dateRange) this.elements.dateRange.style.display = '';
        if (this.elements.dateLines) this.elements.dateLines.style.display = 'none';
      } else {
        // Vertical layout
        if (config.showDayNames) {
          const formatOpts = {
            dayNameFormat: config.dayNameFormat || 'abbreviated',
            monthFormat: config.monthFormat || 'abbreviated',
            showYear: config.showYear ?? false,
            locale: config.locale || 'en',
            twoLine: true
          };
          const { startLine, endLine } = DateUtils.formatInlineDateRange(startDate, endDate, formatOpts);

          if (this.elements.datePartStart) this.elements.datePartStart.textContent = startLine;
          if (this.elements.datePartEnd) this.elements.datePartEnd.textContent = endLine;
          if (this.elements.datePartSeparator) this.elements.datePartSeparator.style.display = '';
        } else {
          const formatOpts = {
            format: config.dateFormat || 'explicit',
            monthFormat: config.monthFormat || 'abbreviated',
            showYear: config.showYear ?? false,
            showDayNames: false,
            locale: config.locale || 'en'
          };

          const dateRangeText = DateUtils.formatDateRange(startDate, endDate, formatOpts);

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

    // Day names element - always hide
    if (this.elements.dayNames) {
      this.elements.dayNames.style.display = 'none';
      if (this.elements.content) {
        this.elements.content.classList.remove('banner__content--stacked');
      }
    }

    // Apply styles
    this.applyStyles(config);

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

    // Text color
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

    // Apply layout and alignment via CSS classes (not inline styles)
    this.applyLayoutClasses(config);

    // Typography - Font Family
    const fontFamily = this.fontFamilyMap[config.fontFamily] || this.fontFamilyMap.primary;
    if (title) {
      title.style.fontFamily = config.fontFamily === 'primary' ? fontFamily : 'var(--font-heading)';
    }
    if (dateRange) dateRange.style.fontFamily = fontFamily;
    if (dayNames) dayNames.style.fontFamily = fontFamily;

    // Typography - Font Weight
    if (title) title.style.fontWeight = config.fontWeight || 600;

    // Typography - Text Transform (for title)
    const textTransform = config.textTransform || 'uppercase';
    if (title) title.style.textTransform = textTransform;

    // Date Text Transform
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
   * Apply layout and alignment via CSS classes
   * Uses CSS modifier classes instead of inline styles for cleaner separation
   * @param {object} config - Configuration object
   */
  applyLayoutClasses(config) {
    const container = this.elements.container;
    const content = this.elements.content;
    const title = this.elements.title;
    const dateRange = this.elements.dateRange;
    const dateLines = this.elements.dateLines;

    if (!container) return;

    const isHorizontal = config.layoutMode === 'horizontal';
    const isReversed = config.flexDirection === 'reverse';

    // --- Content Position Classes (horizontal mode only) ---
    // Remove all position classes first
    container.classList.remove(
      'circular-date-banner--position-center',
      'circular-date-banner--position-spread',
      'circular-date-banner--position-left',
      'circular-date-banner--position-right'
    );

    if (isHorizontal) {
      // Use contentPosition (renamed from contentAlignment)
      const position = config.contentPosition || 'center';
      container.classList.add(`circular-date-banner--position-${position}`);

      // Set flex direction for content (row or row-reverse)
      if (content) {
        content.style.flexDirection = isReversed ? 'row-reverse' : 'row';
      }
    } else {
      // Vertical mode: set flex direction (column or column-reverse)
      if (content) {
        content.style.flexDirection = isReversed ? 'column-reverse' : 'column';
      }
    }

    // --- Title Alignment Classes ---
    if (title) {
      title.classList.remove(
        'banner__title--align-left',
        'banner__title--align-center',
        'banner__title--align-right'
      );
      const titleAlign = config.titleAlignment || 'left';
      title.classList.add(`banner__title--align-${titleAlign}`);
    }

    // --- Date Alignment Classes ---
    if (dateRange) {
      dateRange.classList.remove(
        'banner__date-range--align-left',
        'banner__date-range--align-center',
        'banner__date-range--align-right'
      );
      const dateAlign = config.dateAlignment || 'right';
      dateRange.classList.add(`banner__date-range--align-${dateAlign}`);
    }

    if (dateLines) {
      dateLines.classList.remove(
        'banner__date-lines--align-left',
        'banner__date-lines--align-center',
        'banner__date-lines--align-right'
      );
      const dateAlign = config.dateAlignment || 'right';
      dateLines.classList.add(`banner__date-lines--align-${dateAlign}`);
    }
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

};

export default PreviewBanner;
