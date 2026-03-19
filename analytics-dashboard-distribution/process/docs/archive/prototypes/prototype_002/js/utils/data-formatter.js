/**
 * Data Formatting Utilities
 * Helper functions for formatting dashboard data display
 */

const DataFormatter = {

  /**
   * Format percentage change with appropriate sign and color class
   */
  formatChange(value, showSign = true) {
    const sign = value > 0 ? '+' : '';
    const formattedValue = showSign ? `${sign}${value}%` : `${value}%`;

    let className = 'neutral';
    if (value > 0) className = 'positive';
    if (value < 0) className = 'negative';

    return {
      text: formattedValue,
      className: className
    };
  },

  /**
   * Format large numbers with appropriate suffixes (K, M)
   */
  formatNumber(value) {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
  },

  /**
   * Format score with appropriate status color
   */
  formatScore(score) {
    let className = 'neutral';
    if (score >= 80) className = 'positive';
    else if (score >= 60) className = 'neutral';
    else className = 'negative';

    return {
      value: score,
      className: className
    };
  },

  /**
   * Format category list for display
   */
  formatCategoryList(categories, maxItems = 4) {
    return categories
      .slice(0, maxItems)
      .map(category => ({
        ...category,
        formatted: this.formatScore(category.score),
        changeFormatted: this.formatChange(category.change)
      }));
  },

  /**
   * Format alert items with severity levels
   */
  formatAlerts(alerts) {
    return {
      count: alerts.count,
      items: alerts.items.map(item => ({
        ...item,
        severity: this.getAlertSeverity(item.score, item.threshold),
        formatted: this.formatScore(item.score)
      }))
    };
  },

  /**
   * Determine alert severity based on score vs threshold
   */
  getAlertSeverity(score, threshold) {
    const ratio = score / threshold;
    if (ratio < 0.5) return 'critical';
    if (ratio < 0.75) return 'warning';
    return 'moderate';
  },

  /**
   * Format quick win content for display
   */
  formatQuickWin(quickWin) {
    return {
      insight: quickWin.insight,
      action: quickWin.action,
      formatted: true
    };
  },

  /**
   * Format trend data for chart consumption
   */
  formatTrendData(trendData) {
    return {
      labels: trendData.labels,
      values: trendData.values,
      // Calculate trend direction
      direction: this.calculateTrendDirection(trendData.values),
      // Calculate week-over-week growth
      growth: this.calculateGrowth(trendData.values)
    };
  },

  /**
   * Calculate overall trend direction
   */
  calculateTrendDirection(values) {
    if (values.length < 2) return 'neutral';

    const start = values[0];
    const end = values[values.length - 1];
    const growth = ((end - start) / start) * 100;

    if (growth > 5) return 'positive';
    if (growth < -5) return 'negative';
    return 'neutral';
  },

  /**
   * Calculate growth rate from trend values
   */
  calculateGrowth(values) {
    if (values.length < 2) return 0;

    const start = values[0];
    const end = values[values.length - 1];
    return Math.round(((end - start) / start) * 100);
  },

  /**
   * Format week performance data
   */
  formatWeekPerformance(weekData) {
    return {
      current: weekData.current,
      previous: weekData.previous,
      change: this.formatChange(weekData.change),
      status: weekData.status,
      formatted: this.formatScore(weekData.current)
    };
  },

  /**
   * Format share activity data
   */
  formatShareActivity(shareData) {
    return {
      current: this.formatNumber(shareData.current),
      previous: this.formatNumber(shareData.previous),
      change: this.formatChange(shareData.change),
      rawCurrent: shareData.current,
      rawPrevious: shareData.previous
    };
  }
};

// Export for global access
window.DataFormatter = DataFormatter;