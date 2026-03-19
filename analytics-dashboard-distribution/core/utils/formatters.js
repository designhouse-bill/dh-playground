/**
 * Formatting Utilities
 * Consistent number, currency, and date formatting
 */

const Formatters = (function() {
  'use strict';

  /**
   * Format number with commas
   * @param {number} num - Number to format
   * @param {number} decimals - Decimal places (default: 0)
   * @returns {string}
   */
  function formatNumber(num, decimals = 0) {
    if (num === null || num === undefined || isNaN(num)) {
      return '—';
    }
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  /**
   * Format currency value
   * @param {number} amount - Amount to format
   * @param {boolean} showCents - Whether to show cents (default: false)
   * @returns {string}
   */
  function formatCurrency(amount, showCents = false) {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '—';
    }
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: showCents ? 2 : 0,
      maximumFractionDigits: showCents ? 2 : 0
    });
  }

  /**
   * Format large numbers with K/M suffix
   * @param {number} num - Number to format
   * @returns {string}
   */
  function formatCompact(num) {
    if (num === null || num === undefined || isNaN(num)) {
      return '—';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
  }

  /**
   * Format percentage
   * @param {number} value - Value (0-100 or 0-1)
   * @param {boolean} isDecimal - Whether value is decimal (0-1)
   * @returns {string}
   */
  function formatPercent(value, isDecimal = false) {
    if (value === null || value === undefined || isNaN(value)) {
      return '—';
    }
    const pct = isDecimal ? value * 100 : value;
    return pct.toFixed(0) + '%';
  }

  /**
   * Format percentile with ordinal suffix
   * @param {number} value - Percentile value (0-100)
   * @returns {string}
   */
  function formatPercentile(value) {
    if (value === null || value === undefined || isNaN(value)) {
      return '—';
    }
    const num = Math.round(value);
    const suffix = getOrdinalSuffix(num);
    return num + suffix;
  }

  /**
   * Get ordinal suffix for number
   * @param {number} num - Number
   * @returns {string}
   */
  function getOrdinalSuffix(num) {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  }

  /**
   * Format date range for display
   * @param {Date|string} start - Start date
   * @param {Date|string} end - End date
   * @returns {string}
   */
  function formatDateRange(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const options = { month: 'short', day: 'numeric' };

    const startStr = startDate.toLocaleDateString('en-US', options);
    const endStr = endDate.toLocaleDateString('en-US', { ...options, year: 'numeric' });

    return `${startStr}-${endStr}`;
  }

  /**
   * Get performance tier based on percentile
   * @param {number} percentile - Percentile value (0-100)
   * @returns {string} - 'high', 'medium', or 'low'
   */
  function getPerformanceTier(percentile) {
    if (percentile >= 70) return 'high';
    if (percentile >= 40) return 'medium';
    return 'low';
  }

  /**
   * Get CSS class for performance tier
   * @param {number} percentile - Percentile value (0-100)
   * @returns {string}
   */
  function getPerformanceClass(percentile) {
    const tier = getPerformanceTier(percentile);
    return `performance--${tier}`;
  }

  // Public API
  return {
    formatNumber,
    formatCurrency,
    formatCompact,
    formatPercent,
    formatPercentile,
    getOrdinalSuffix,
    formatDateRange,
    getPerformanceTier,
    getPerformanceClass
  };
})();
