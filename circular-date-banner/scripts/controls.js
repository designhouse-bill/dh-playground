/**
 * Configuration Panel Controls
 * Handles the config panel UI and bindings to ConfigManager
 */

import BannerConfig from './config.js';

const Controls = {
  elements: {
    panel: null,
    header: null,
    body: null,
    sections: []
  },

  /**
   * Initialize the controls panel
   * @param {string} selector - CSS selector for the panel
   */
  init(selector = '.config-panel') {
    this.elements.panel = document.querySelector(selector);

    if (!this.elements.panel) {
      console.warn('[Controls] Panel not found:', selector);
      return this;
    }

    this.elements.header = this.elements.panel.querySelector('.config-panel__header');
    this.elements.body = this.elements.panel.querySelector('.config-panel__body');
    this.elements.sections = this.elements.panel.querySelectorAll('.config-section');

    this.bindEvents();
    this.syncFormToConfig();

    console.log('[Controls] Initialized');
    return this;
  },

  /**
   * Bind all event listeners
   */
  bindEvents() {
    // Toggle panel collapse
    if (this.elements.header) {
      this.elements.header.addEventListener('click', (e) => {
        // Don't toggle if clicking on a button inside header
        if (e.target.closest('button')) return;
        this.toggle();
      });
    }

    // Bind section headers for collapse
    this.elements.sections.forEach(section => {
      const header = section.querySelector('.config-section__header');
      if (header) {
        header.addEventListener('click', () => {
          section.classList.toggle('config-section--collapsed');
        });
      }
    });

    // Bind all form controls
    this.bindFormControls();

    // Listen for config reset to sync form
    BannerConfig.on('reset', () => {
      this.syncFormToConfig();
    });
  },

  /**
   * Bind all form control events
   */
  bindFormControls() {
    if (!this.elements.body) return;

    // Text inputs
    this.elements.body.querySelectorAll('input[type="text"]').forEach(input => {
      input.addEventListener('input', (e) => {
        const key = e.target.dataset.configKey;
        if (key) {
          BannerConfig.set(key, e.target.value);
        }
      });
    });

    // Number inputs
    this.elements.body.querySelectorAll('input[type="number"]').forEach(input => {
      input.addEventListener('input', (e) => {
        const key = e.target.dataset.configKey;
        if (key) {
          BannerConfig.set(key, parseFloat(e.target.value) || 0);
        }
      });
    });

    // Range inputs
    this.elements.body.querySelectorAll('input[type="range"]').forEach(input => {
      input.addEventListener('input', (e) => {
        const key = e.target.dataset.configKey;
        if (key) {
          BannerConfig.set(key, parseFloat(e.target.value));
          // Update display value if exists
          const display = document.querySelector(`[data-range-display="${key}"]`);
          if (display) {
            display.textContent = e.target.value;
          }
        }
      });
    });

    // Color inputs
    this.elements.body.querySelectorAll('input[type="color"]').forEach(input => {
      input.addEventListener('input', (e) => {
        const key = e.target.dataset.configKey;
        if (key) {
          BannerConfig.set(key, e.target.value);
        }
      });
    });

    // Date inputs
    this.elements.body.querySelectorAll('input[type="date"]').forEach(input => {
      input.addEventListener('change', (e) => {
        const key = e.target.dataset.configKey;
        if (key) {
          const value = e.target.value ? new Date(e.target.value + 'T00:00:00') : new Date();
          BannerConfig.set(key, value);
        }
      });
    });

    // Checkbox inputs
    this.elements.body.querySelectorAll('input[type="checkbox"]').forEach(input => {
      input.addEventListener('change', (e) => {
        const key = e.target.dataset.configKey;
        if (key) {
          BannerConfig.set(key, e.target.checked);
        }
      });
    });

    // Radio inputs
    this.elements.body.querySelectorAll('input[type="radio"]').forEach(input => {
      input.addEventListener('change', (e) => {
        const key = e.target.dataset.configKey;
        if (key && e.target.checked) {
          BannerConfig.set(key, e.target.value);
        }
      });
    });

    // Select dropdowns
    this.elements.body.querySelectorAll('select').forEach(select => {
      select.addEventListener('change', (e) => {
        const key = e.target.dataset.configKey;
        if (key) {
          BannerConfig.set(key, e.target.value);
        }
      });
    });
  },

  /**
   * Sync all form controls to current config state
   */
  syncFormToConfig() {
    const config = BannerConfig.getAll();

    Object.entries(config).forEach(([key, value]) => {
      this.setFormValue(key, value);
    });
  },

  /**
   * Set a single form control value
   * @param {string} key - Config key
   * @param {*} value - Value to set
   */
  setFormValue(key, value) {
    // Find all elements with this config key
    const elements = document.querySelectorAll(`[data-config-key="${key}"]`);

    elements.forEach(el => {
      if (el.type === 'checkbox') {
        el.checked = Boolean(value);
      } else if (el.type === 'radio') {
        el.checked = el.value === String(value);
      } else if (el.type === 'date' && value instanceof Date) {
        el.value = value.toISOString().split('T')[0];
      } else if (el.type === 'range') {
        el.value = value;
        const display = document.querySelector(`[data-range-display="${key}"]`);
        if (display) {
          display.textContent = value;
        }
      } else if (el.tagName === 'SELECT') {
        el.value = value;
      } else {
        el.value = value;
      }
    });
  },

  /**
   * Toggle panel collapsed state
   */
  toggle() {
    if (this.elements.panel) {
      this.elements.panel.classList.toggle('config-panel--collapsed');
      this.updateToggleIcon();
    }
    return this;
  },

  /**
   * Expand the panel
   */
  expand() {
    if (this.elements.panel) {
      this.elements.panel.classList.remove('config-panel--collapsed');
      this.updateToggleIcon();
    }
    return this;
  },

  /**
   * Collapse the panel
   */
  collapse() {
    if (this.elements.panel) {
      this.elements.panel.classList.add('config-panel--collapsed');
      this.updateToggleIcon();
    }
    return this;
  },

  /**
   * Update the toggle icon based on state
   */
  updateToggleIcon() {
    const toggleEl = this.elements.panel?.querySelector('.config-panel__toggle');
    if (toggleEl) {
      const isCollapsed = this.elements.panel.classList.contains('config-panel--collapsed');
      toggleEl.textContent = isCollapsed ? '+' : '-';
    }
  },

  /**
   * Legacy method for backward compatibility
   * @param {function} onChange - Callback function(key, value)
   */
  onConfigChange(onChange) {
    BannerConfig.on('change', ({ key, value }) => {
      onChange(key, value);
    });
    return this;
  }
};

export default Controls;
