/**
 * Date Formatting Utilities
 * Helper functions for formatting and calculating dates in the circular banner
 */

const DateUtils = {
  /**
   * Day name to index mapping (0 = Sunday, 6 = Saturday)
   */
  DAY_NAMES: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

  /**
   * Abbreviated day names (English)
   */
  DAY_NAMES_SHORT: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],

  /**
   * Spanish day names
   */
  DAY_NAMES_ES: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],

  /**
   * Abbreviated Spanish day names
   */
  DAY_NAMES_ES_SHORT: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],

  /**
   * Spanish month names
   */
  MONTH_NAMES_ES: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],

  /**
   * Calculate the circular date range based on a starting day of week
   * @param {string} startDayOfWeek - Day name ("Wednesday", "Thursday", etc.)
   * @param {Date} referenceDate - Reference date (defaults to today)
   * @returns {{ startDate: Date, endDate: Date }} Date range object
   */
  calculateCircularDateRange(startDayOfWeek, referenceDate = new Date()) {
    // Normalize the day name and find its index
    const targetDayIndex = this.DAY_NAMES.findIndex(
      day => day.toLowerCase() === startDayOfWeek.toLowerCase()
    );

    if (targetDayIndex === -1) {
      console.error('[DateUtils] Invalid day name:', startDayOfWeek);
      return { startDate: null, endDate: null };
    }

    // Clone reference date and reset time
    const ref = new Date(referenceDate);
    ref.setHours(0, 0, 0, 0);

    const currentDayIndex = ref.getDay();

    // Calculate days since the target day
    // If today IS the target day, we consider it as the start of the current circular
    let daysSinceTarget = currentDayIndex - targetDayIndex;

    // If negative or we need to go back to the previous week
    if (daysSinceTarget < 0) {
      daysSinceTarget += 7;
    }

    // Calculate start date (most recent occurrence of startDayOfWeek)
    const startDate = new Date(ref);
    startDate.setDate(ref.getDate() - daysSinceTarget);

    // End date is 6 days after start date
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    return { startDate, endDate };
  },

  /**
   * Format a date range for display
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {object} options - Formatting options
   * @param {string} options.format - 'compact' | 'explicit' | 'numeric'
   * @param {boolean} options.showYear - Whether to show the year
   * @param {boolean} options.showDayNames - Whether to show day names
   * @param {string} options.locale - 'en' | 'es'
   * @returns {string} Formatted date range string
   */
  formatDateRange(startDate, endDate, options = {}) {
    if (!startDate || !endDate) {
      return 'Date Range Here';
    }

    const {
      format = 'compact',
      showYear = false,
      showDayNames = false,
      locale = 'en'
    } = options;

    const isSpanish = locale === 'es';
    let result = '';

    // Get date components
    const startDay = startDate.getDate();
    const endDay = endDate.getDate();
    const startMonth = startDate.getMonth();
    const endMonth = endDate.getMonth();
    const endYear = endDate.getFullYear();

    // Check if months are different
    const sameMonth = startMonth === endMonth;

    // Format based on locale and format type
    if (format === 'numeric') {
      // Numeric format: "11/6 - 11/12"
      const startMonthNum = startMonth + 1;
      const endMonthNum = endMonth + 1;
      result = `${startMonthNum}/${startDay} - ${endMonthNum}/${endDay}`;
    } else if (isSpanish) {
      // Spanish formats
      const startMonthName = this.MONTH_NAMES_ES[startMonth];
      const endMonthName = this.MONTH_NAMES_ES[endMonth];

      if (format === 'compact' && sameMonth) {
        // "6 - 12 de Noviembre"
        result = `${startDay} - ${endDay} de ${endMonthName}`;
      } else {
        // "28 de Noviembre - 4 de Diciembre" (explicit or cross-month compact)
        result = `${startDay} de ${startMonthName} - ${endDay} de ${endMonthName}`;
      }
    } else {
      // English formats
      const monthOptions = { month: 'short' };
      const startMonthName = startDate.toLocaleDateString('en-US', monthOptions);
      const endMonthName = endDate.toLocaleDateString('en-US', monthOptions);

      if (format === 'compact' && sameMonth) {
        // "Nov 6 - 12"
        result = `${startMonthName} ${startDay} - ${endDay}`;
      } else {
        // "Nov 6 - Dec 4" (explicit or cross-month compact)
        result = `${startMonthName} ${startDay} - ${endMonthName} ${endDay}`;
      }
    }

    // Add year if requested
    if (showYear) {
      if (isSpanish) {
        result += `, ${endYear}`;
      } else {
        result += `, ${endYear}`;
      }
    }

    // Add day names if requested
    if (showDayNames) {
      const dayNameStr = this.formatDayRange(startDate, endDate, locale);
      if (isSpanish) {
        result = `${dayNameStr}\n${result}`;
      } else {
        result = `${dayNameStr}\n${result}`;
      }
    }

    return result;
  },

  /**
   * Format the day name range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {string} locale - 'en' | 'es'
   * @param {string} format - 'full' | 'abbreviated'
   * @returns {string} Day name range string
   */
  formatDayRange(startDate, endDate, locale = 'en', format = 'full') {
    const startDayIndex = startDate.getDay();
    const endDayIndex = endDate.getDay();

    if (locale === 'es') {
      const dayNames = format === 'abbreviated' ? this.DAY_NAMES_ES_SHORT : this.DAY_NAMES_ES;
      return `${dayNames[startDayIndex]} - ${dayNames[endDayIndex]}`;
    }

    const dayNames = format === 'abbreviated' ? this.DAY_NAMES_SHORT : this.DAY_NAMES;
    return `${dayNames[startDayIndex]} - ${dayNames[endDayIndex]}`;
  },

  /**
   * Get day name for a date
   * @param {Date} date - Date
   * @param {string} locale - 'en' | 'es'
   * @param {string} format - 'full' | 'abbreviated'
   * @returns {string} Day name
   */
  getDayName(date, locale = 'en', format = 'full') {
    const dayIndex = date.getDay();

    if (locale === 'es') {
      return format === 'abbreviated' ? this.DAY_NAMES_ES_SHORT[dayIndex] : this.DAY_NAMES_ES[dayIndex];
    }

    return format === 'abbreviated' ? this.DAY_NAMES_SHORT[dayIndex] : this.DAY_NAMES[dayIndex];
  },

  /**
   * Format inline date range with day names (horizontal layout)
   * Example: "Wednesday, Dec 31 - Tuesday, January 6, 2026"
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {object} options - Formatting options
   * @param {string} options.dayNameFormat - 'full' | 'abbreviated'
   * @param {boolean} options.showYear - Whether to show the year
   * @param {string} options.locale - 'en' | 'es'
   * @param {boolean} options.twoLine - Return object with startLine and endLine
   * @returns {string|object} Formatted inline date range or object with two lines
   */
  formatInlineDateRange(startDate, endDate, options = {}) {
    if (!startDate || !endDate) {
      return options.twoLine ? { startLine: 'Start Date', endLine: 'End Date' } : 'Date Range Here';
    }

    const {
      dayNameFormat = 'abbreviated',
      showYear = true,
      locale = 'en',
      twoLine = false
    } = options;

    const isSpanish = locale === 'es';

    // Get day names
    const startDayName = this.getDayName(startDate, locale, dayNameFormat);
    const endDayName = this.getDayName(endDate, locale, dayNameFormat);

    // Get date components
    const startDay = startDate.getDate();
    const endDay = endDate.getDate();
    const startMonth = startDate.getMonth();
    const endMonth = endDate.getMonth();
    const endYear = endDate.getFullYear();

    // Check if same month
    const sameMonth = startMonth === endMonth;

    let startLine = '';
    let endLine = '';

    if (isSpanish) {
      const startMonthName = this.MONTH_NAMES_ES[startMonth];
      const endMonthName = this.MONTH_NAMES_ES[endMonth];

      if (sameMonth) {
        startLine = `${startDayName}, ${startDay} de ${startMonthName}`;
        endLine = `${endDayName}, ${endDay} de ${endMonthName}`;
      } else {
        startLine = `${startDayName}, ${startDay} de ${startMonthName}`;
        endLine = `${endDayName}, ${endDay} de ${endMonthName}`;
      }
    } else {
      // Use abbreviated month format for both dates (consistent display)
      const startMonthName = startDate.toLocaleDateString('en-US', { month: 'short' });
      const endMonthName = endDate.toLocaleDateString('en-US', { month: 'short' });

      startLine = `${startDayName}, ${startMonthName} ${startDay}`;
      endLine = `${endDayName}, ${endMonthName} ${endDay}`;
    }

    // Add year to end line if requested
    if (showYear) {
      endLine += `, ${endYear}`;
    }

    // Return two-line format if requested
    if (twoLine) {
      return { startLine, endLine };
    }

    // Return single line with dash separator
    return `${startLine} - ${endLine}`;
  },

  /**
   * Format a single date
   * @param {Date} date - Date to format
   * @param {string} format - Format type: 'short', 'medium', 'long'
   * @returns {string} Formatted date string
   */
  formatDate(date, format = 'medium') {
    if (!date) return '';

    const formats = {
      short: { month: 'numeric', day: 'numeric' },
      medium: { month: 'short', day: 'numeric' },
      long: { month: 'long', day: 'numeric', year: 'numeric' }
    };

    return date.toLocaleDateString('en-US', formats[format] || formats.medium);
  },

  /**
   * Check if a date range is currently valid
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {string} Status: 'upcoming', 'active', 'expired'
   */
  getValidityStatus(startDate, endDate) {
    if (!startDate || !endDate) return 'unknown';

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    if (now < start) return 'upcoming';
    if (now > end) return 'expired';
    return 'active';
  },

  /**
   * Get days remaining in a date range
   * @param {Date} endDate - End date
   * @returns {number} Days remaining (0 if expired)
   */
  getDaysRemaining(endDate) {
    if (!endDate) return 0;

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    const diffTime = end - now;
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Return 0 if expired (negative days)
    return Math.max(0, days);
  },

  /**
   * Format days remaining as a human-readable string
   * @param {number} daysLeft - Number of days remaining
   * @param {string} locale - 'en' | 'es'
   * @returns {string} Formatted string
   */
  formatDaysRemaining(daysLeft, locale = 'en') {
    const isSpanish = locale === 'es';

    if (daysLeft < 0 || daysLeft === 0) {
      // Check if it's truly expired or last day
      if (daysLeft < 0) {
        return isSpanish ? 'Expirado' : 'Expired';
      }
      return isSpanish ? '¡Último día!' : 'Last day!';
    }

    if (daysLeft === 1) {
      return isSpanish ? 'Queda 1 día' : '1 day left';
    }

    return isSpanish ? `Quedan ${daysLeft} días` : `${daysLeft} days left`;
  },

  /**
   * Run tests and log results to console
   * @param {Date} referenceDate - Optional reference date for testing
   */
  runTests(referenceDate = new Date()) {
    console.group('[DateUtils] Running Tests');

    // Test calculateCircularDateRange
    console.group('calculateCircularDateRange');
    ['Wednesday', 'Thursday', 'Sunday'].forEach(day => {
      const range = this.calculateCircularDateRange(day, referenceDate);
      console.log(`Starting ${day}:`, {
        start: range.startDate?.toDateString(),
        end: range.endDate?.toDateString()
      });
    });
    console.groupEnd();

    // Test formatDateRange with all formats
    const testRange = this.calculateCircularDateRange('Wednesday', referenceDate);
    console.group('formatDateRange');

    const formatTests = [
      { format: 'compact', showYear: false, showDayNames: false, locale: 'en' },
      { format: 'explicit', showYear: false, showDayNames: false, locale: 'en' },
      { format: 'numeric', showYear: false, showDayNames: false, locale: 'en' },
      { format: 'compact', showYear: true, showDayNames: false, locale: 'en' },
      { format: 'compact', showYear: false, showDayNames: true, locale: 'en' },
      { format: 'compact', showYear: false, showDayNames: false, locale: 'es' },
      { format: 'compact', showYear: true, showDayNames: true, locale: 'es' }
    ];

    formatTests.forEach(opts => {
      const result = this.formatDateRange(testRange.startDate, testRange.endDate, opts);
      console.log(`${JSON.stringify(opts)}:`, result.replace('\n', ' | '));
    });
    console.groupEnd();

    // Test getDaysRemaining and formatDaysRemaining
    console.group('getDaysRemaining / formatDaysRemaining');
    const daysLeft = this.getDaysRemaining(testRange.endDate);
    console.log('Days remaining:', daysLeft);
    console.log('English:', this.formatDaysRemaining(daysLeft, 'en'));
    console.log('Spanish:', this.formatDaysRemaining(daysLeft, 'es'));

    // Test edge cases
    console.log('Last day (0):', this.formatDaysRemaining(0, 'en'));
    console.log('Expired (-1):', this.formatDaysRemaining(-1, 'en'));
    console.log('1 day:', this.formatDaysRemaining(1, 'en'));
    console.log('5 days:', this.formatDaysRemaining(5, 'en'));
    console.groupEnd();

    console.groupEnd();
  }
};

export default DateUtils;
