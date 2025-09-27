/**
 * Quick Wins Component
 * Handles KPI 5: Quick Win Opportunity display
 */

const QuickWinsComponent = {

  element: null,
  contentElement: null,

  /**
   * Initialize component
   */
  init() {
    this.element = document.getElementById('quick-wins-tile');
    this.contentElement = document.getElementById('quick-win-content');

    if (!this.element || !this.contentElement) {
      console.warn('Quick Wins component elements not found');
      return false;
    }

    return true;
  },

  /**
   * Render component with data
   */
  render(data) {
    if (!this.init()) return;

    const formatted = DataFormatter.formatQuickWin(data);

    // Clear existing content
    this.contentElement.innerHTML = '';

    // Create insight element
    const insightElement = document.createElement('div');
    insightElement.className = 'quick-win-insight';
    insightElement.textContent = formatted.insight;

    // Create action element
    const actionElement = document.createElement('div');
    actionElement.className = 'quick-win-action';
    actionElement.textContent = `→ ${formatted.action}`;

    // Add elements to content
    this.contentElement.appendChild(insightElement);
    this.contentElement.appendChild(actionElement);

    // Add click handler for drill-down
    this.element.addEventListener('click', () => {
      this.handleClick();
    });
  },

  /**
   * Handle tile click for drill-down
   */
  handleClick() {
    // Navigate to inquiry with optimization filter
    const url = new URL('inquiry.html', window.location.origin);
    url.searchParams.set('filter', 'optimization');
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
window.QuickWinsComponent = QuickWinsComponent;