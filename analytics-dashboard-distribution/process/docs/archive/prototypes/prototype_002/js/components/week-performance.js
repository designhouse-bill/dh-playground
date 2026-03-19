/**
 * Week Performance Component
 * Handles KPI 1: Week Performance Status display
 */

const WeekPerformanceComponent = {

  element: null,
  valueElement: null,
  changeElement: null,

  /**
   * Initialize component
   */
  init() {
    this.element = document.getElementById('week-performance-tile');
    this.valueElement = document.getElementById('week-performance-value');
    this.changeElement = document.getElementById('week-performance-change');

    if (!this.element || !this.valueElement || !this.changeElement) {
      console.warn('Week Performance component elements not found');
      return false;
    }

    return true;
  },

  /**
   * Render component with data
   */
  render(data) {
    if (!this.init()) return;

    const formatted = DataFormatter.formatWeekPerformance(data);

    // Display current week score
    this.valueElement.textContent = formatted.current;
    this.valueElement.className = `large-number ${formatted.formatted.className}`;

    // Display change indicator
    this.changeElement.textContent = `vs last week ${formatted.change.text}`;
    this.changeElement.className = `change-indicator ${formatted.change.className}`;

    // Add click handler for drill-down
    this.element.addEventListener('click', () => {
      this.handleClick();
    });
  },

  /**
   * Handle tile click for drill-down
   */
  handleClick() {
    // Navigate to inquiry with week performance filter
    const url = new URL('inquiry.html', window.location.origin);
    url.searchParams.set('filter', 'week-performance');
    window.location.href = url.toString();
  },

  /**
   * Update with new data (for week changes)
   */
  update(data) {
    this.render(data);
  }
};

// Export for global access
window.WeekPerformanceComponent = WeekPerformanceComponent;