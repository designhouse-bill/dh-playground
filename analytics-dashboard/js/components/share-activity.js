/**
 * Share Activity Component
 * Handles KPI 6: Share Activity Summary display
 */

const ShareActivityComponent = {

  element: null,
  valueElement: null,
  changeElement: null,

  /**
   * Initialize component
   */
  init() {
    this.element = document.getElementById('share-activity-tile');
    this.valueElement = document.getElementById('share-activity-value');
    this.changeElement = document.getElementById('share-activity-change');

    if (!this.element || !this.valueElement || !this.changeElement) {
      console.warn('Share Activity component elements not found');
      return false;
    }

    return true;
  },

  /**
   * Render component with data
   */
  render(data) {
    if (!this.init()) return;

    const formatted = DataFormatter.formatShareActivity(data);

    // Display current share count
    this.valueElement.textContent = formatted.current;
    this.valueElement.className = 'large-number';

    // Display change indicator
    this.changeElement.textContent = `${formatted.change.text} vs last week`;
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
    // Navigate to inquiry with share activity filter
    const url = new URL('inquiry.html', window.location.origin);
    url.searchParams.set('filter', 'sharing');
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
window.ShareActivityComponent = ShareActivityComponent;