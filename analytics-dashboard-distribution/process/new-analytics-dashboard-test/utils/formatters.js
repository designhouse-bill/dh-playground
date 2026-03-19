/**
 * FORMATTERS - Data Formatting Utilities
 * Analytics Dashboard - Stand-alone Version
 */

const Formatters = (() => {
  'use strict';

  /**
   * Format number as currency
   * @param {number} value
   * @param {string} currency - Currency code (default: USD)
   * @returns {string}
   */
  function currency(value, currency = 'USD') {
    if (value == null || isNaN(value)) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  /**
   * Format number with commas
   * @param {number} value
   * @returns {string}
   */
  function number(value) {
    if (value == null || isNaN(value)) return '0';
    return new Intl.NumberFormat('en-US').format(value);
  }

  /**
   * Format number as percentage
   * @param {number} value - Value between 0-100
   * @param {number} decimals - Decimal places
   * @returns {string}
   */
  function percent(value, decimals = 0) {
    if (value == null || isNaN(value)) return '0%';
    return value.toFixed(decimals) + '%';
  }

  /**
   * Format compact number (1K, 1M, etc.)
   * @param {number} value
   * @returns {string}
   */
  function compact(value) {
    if (value == null || isNaN(value)) return '0';
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  }

  /**
   * Format date
   * @param {Date|string} date
   * @param {string} format - 'short', 'medium', 'long'
   * @returns {string}
   */
  function date(date, format = 'medium') {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const options = {
      short: { month: 'numeric', day: 'numeric' },
      medium: { month: 'short', day: 'numeric', year: 'numeric' },
      long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
    };

    return d.toLocaleDateString('en-US', options[format] || options.medium);
  }

  /**
   * Truncate text with ellipsis
   * @param {string} text
   * @param {number} maxLength
   * @returns {string}
   */
  function truncate(text, maxLength = 50) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
  }

  /**
   * Get percentile class for styling
   * @param {number} value - Percentile value (0-100)
   * @returns {string} - 'high', 'medium', or 'low'
   */
  function percentileClass(value) {
    if (value >= 70) return 'high';
    if (value >= 40) return 'medium';
    return 'low';
  }

  return {
    currency,
    number,
    percent,
    compact,
    date,
    truncate,
    percentileClass
  };
})();
