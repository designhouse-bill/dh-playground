/**
 * Alerts Component
 * Handles KPI 3: Underperforming Alerts display
 */

const AlertsComponent = {

  element: null,
  countElement: null,
  itemsElement: null,

  /**
   * Initialize component
   */
  init() {
    this.element = document.getElementById('alerts-tile');
    this.countElement = document.getElementById('alert-count');
    this.itemsElement = document.getElementById('alert-items');

    if (!this.element || !this.countElement || !this.itemsElement) {
      console.warn('Alerts component elements not found');
      return false;
    }

    return true;
  },

  /**
   * Render component with data
   */
  render(data) {
    if (!this.init()) return;

    const formatted = DataFormatter.formatAlerts(data);

    // Display alert count badge
    this.countElement.textContent = `${formatted.count} items need attention`;

    // Clear existing items
    this.itemsElement.innerHTML = '';

    // Create alert items
    if (formatted.items.length > 0) {
      formatted.items.forEach(item => {
        const alertItem = this.createAlertItem(item);
        this.itemsElement.appendChild(alertItem);
      });
    } else {
      const noAlertsMessage = document.createElement('div');
      noAlertsMessage.className = 'alert-item';
      noAlertsMessage.textContent = 'All categories performing above threshold';
      noAlertsMessage.style.color = 'var(--green)';
      this.itemsElement.appendChild(noAlertsMessage);
    }

    // Add click handler for drill-down
    this.element.addEventListener('click', () => {
      this.handleClick();
    });
  },

  /**
   * Create individual alert item element
   */
  createAlertItem(item) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert-item';

    const severityIcon = this.getSeverityIcon(item.severity);
    const scoreText = `${item.score}/${item.threshold}`;

    alertDiv.innerHTML = `
      <span style="display: flex; align-items: center; gap: 6px;">
        ${severityIcon}
        <strong>${item.name}</strong>
        <span style="color: var(--muted);">scoring ${scoreText}</span>
      </span>
    `;

    return alertDiv;
  },

  /**
   * Get appropriate icon for alert severity
   */
  getSeverityIcon(severity) {
    switch (severity) {
      case 'critical':
        return '<span style="color: var(--red); font-weight: bold;">⚠️</span>';
      case 'warning':
        return '<span style="color: var(--yellow); font-weight: bold;">⚡</span>';
      case 'moderate':
        return '<span style="color: var(--muted); font-weight: bold;">●</span>';
      default:
        return '<span style="color: var(--muted);">●</span>';
    }
  },

  /**
   * Handle tile click for drill-down
   */
  handleClick() {
    // Navigate to inquiry with alerts filter
    const url = new URL('inquiry.html', window.location.origin);
    url.searchParams.set('filter', 'underperforming');
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
window.AlertsComponent = AlertsComponent;