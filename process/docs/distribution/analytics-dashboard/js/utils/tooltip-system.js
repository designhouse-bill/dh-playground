/**
 * Tooltip System
 * Manages educational overlay tooltips for KPI tiles
 */

const TooltipSystem = {

  overlay: null,
  isVisible: false,

  /**
   * Initialize tooltip system
   */
  init() {
    this.overlay = document.getElementById('tooltip-overlay');
    this.bindEvents();
  },

  /**
   * Bind click events to info buttons and overlay
   */
  bindEvents() {
    // Info button clicks
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('info-btn')) {
        const tooltipId = e.target.getAttribute('data-tooltip');
        this.show(tooltipId);
        e.preventDefault();
      }
    });

    // Close button click
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('tooltip-close')) {
        this.hide();
        e.preventDefault();
      }
    });

    // Overlay background click
    if (this.overlay) {
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) {
          this.hide();
        }
      });
    }

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });
  },

  /**
   * Show tooltip with content for specific KPI
   */
  show(kpiId) {
    const definition = window.getTooltipDefinition(kpiId);

    if (!definition || !this.overlay) {
      console.warn(`Tooltip definition not found for: ${kpiId}`);
      return;
    }

    // Populate content
    const titleEl = document.getElementById('tooltip-title');
    const descEl = document.getElementById('tooltip-description');
    const importanceEl = document.getElementById('tooltip-importance');

    if (titleEl) titleEl.textContent = definition.title;
    if (descEl) descEl.textContent = definition.description;
    if (importanceEl) importanceEl.textContent = definition.importance;

    // Show overlay
    this.overlay.classList.remove('hidden');
    this.isVisible = true;

    // Focus management for accessibility
    const closeBtn = this.overlay.querySelector('.tooltip-close');
    if (closeBtn) closeBtn.focus();

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  },

  /**
   * Hide tooltip overlay
   */
  hide() {
    if (!this.overlay) return;

    this.overlay.classList.add('hidden');
    this.isVisible = false;

    // Restore body scroll
    document.body.style.overflow = '';

    // Return focus to trigger element if possible
    const activeElement = document.activeElement;
    if (activeElement && activeElement.classList.contains('tooltip-close')) {
      // Find the info button that was clicked
      const infoButtons = document.querySelectorAll('.info-btn');
      if (infoButtons.length > 0) {
        infoButtons[0].focus();
      }
    }
  },

  /**
   * Check if tooltip is currently visible
   */
  isOpen() {
    return this.isVisible;
  },

  /**
   * Toggle tooltip for specific KPI
   */
  toggle(kpiId) {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show(kpiId);
    }
  }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  TooltipSystem.init();
});

// Export for global access
window.TooltipSystem = TooltipSystem;