/**
 * Configuration Modal Module
 * Handles the modal overlay configuration panel with bidirectional sync to BannerConfig
 */

import BannerConfig from './config.js';

// Config keys that should be parsed as numbers
const NUMERIC_KEYS = ['borderWidth', 'stickyThreshold', 'patternOpacity'];

const Modal = {
  overlay: null,

  /**
   * Initialize the modal module
   */
  init() {
    this.overlay = document.getElementById('config-modal-overlay');
    if (!this.overlay) {
      console.warn('[Modal] Modal overlay not found');
      return;
    }

    this.bindOpenClose();
    this.bindPanelToggles();
    this.bindControlEvents();
    this.bindPresetButtons();
    this.syncFormToConfig();

    // Listen for external config changes (from sidebar)
    BannerConfig.on('change', () => this.syncFormToConfig());
    BannerConfig.on('reset', () => this.syncFormToConfig());
    BannerConfig.on('preset', () => this.syncFormToConfig());

    console.log('[Modal] Configuration modal initialized');
  },

  /**
   * Open the modal
   */
  open() {
    this.syncFormToConfig();
    this.overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Dispatch event for PreviewBanner to re-render
    document.dispatchEvent(new CustomEvent('modal:open'));

    console.log('[Modal] Modal opened');
  },

  /**
   * Close the modal
   */
  close() {
    this.overlay.style.display = 'none';
    document.body.style.overflow = '';
    console.log('[Modal] Modal closed');
  },

  /**
   * Bind open/close event handlers
   */
  bindOpenClose() {
    // Open button
    const openBtn = document.getElementById('open-modal-btn');
    if (openBtn) {
      openBtn.addEventListener('click', () => this.open());
    }

    // Close buttons (Close + Done both just close)
    this.overlay.querySelectorAll('[data-modal-close]').forEach(btn => {
      btn.addEventListener('click', () => this.close());
    });

    // Click backdrop to close
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });

    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.overlay.style.display === 'flex') {
        this.close();
      }
    });
  },

  /**
   * Bind panel collapse/expand toggles
   */
  bindPanelToggles() {
    this.overlay.querySelectorAll('.modal-panel-header').forEach(header => {
      header.addEventListener('click', () => {
        header.closest('.modal-panel').classList.toggle('collapsed');
      });
    });
  },

  /**
   * Parse value based on config key type
   * @param {string} key - Config key
   * @param {*} rawValue - Raw value from input
   * @param {string} inputType - Input element type
   * @returns {*} Parsed value
   */
  parseValue(key, rawValue, inputType) {
    if (inputType === 'checkbox') {
      return rawValue; // already boolean
    }
    if (NUMERIC_KEYS.includes(key) || inputType === 'number' || inputType === 'range') {
      return parseFloat(rawValue);
    }
    return rawValue; // string
  },

  /**
   * Bind control input event handlers
   */
  bindControlEvents() {
    // All inputs with data-modal-config-key
    this.overlay.querySelectorAll('[data-modal-config-key]').forEach(el => {
      const key = el.dataset.modalConfigKey;
      const tagName = el.tagName.toLowerCase();

      // Use 'change' for select and checkbox, 'input' for text/number/range
      const eventType = (tagName === 'select' || el.type === 'checkbox' || el.type === 'radio')
        ? 'change'
        : 'input';

      el.addEventListener(eventType, () => {
        let value;
        if (el.type === 'checkbox') {
          value = el.checked;
        } else {
          value = this.parseValue(key, el.value, el.type);
        }
        BannerConfig.set(key, value);
      });
    });

    // Range displays - update on input for live feedback
    this.overlay.querySelectorAll('[data-modal-range-display]').forEach(display => {
      const key = display.dataset.modalRangeDisplay;
      const range = this.overlay.querySelector(`[data-modal-config-key="${key}"]`);
      if (range) {
        range.addEventListener('input', () => {
          display.textContent = range.value;
        });
      }
    });

    // Color displays - update on input for live feedback
    this.overlay.querySelectorAll('[data-modal-color-display]').forEach(display => {
      const key = display.dataset.modalColorDisplay;
      const picker = this.overlay.querySelector(`[data-modal-config-key="${key}"]`);
      if (picker) {
        // Update text input when color picker changes
        picker.addEventListener('input', () => {
          if (display.tagName === 'INPUT') {
            display.value = picker.value;
          } else {
            display.textContent = picker.value;
          }
        });

        // If display is an input, allow typing to update color picker and config
        if (display.tagName === 'INPUT') {
          display.addEventListener('input', () => {
            const val = display.value;
            // Validate hex color format
            if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
              picker.value = val;
              BannerConfig.set(key, val);
            }
          });
        }
      }
    });

    // Toggle switches with hidden checkbox - CSS handles visual state via :checked
    // The change event is already bound above via data-modal-config-key
  },

  /**
   * Bind preset button event handlers
   */
  bindPresetButtons() {
    // Use modal-specific class to avoid double-binding with sidebar presets
    this.overlay.querySelectorAll('.modal-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        BannerConfig.applyPreset(btn.dataset.preset);
        this.syncFormToConfig();
      });
    });
  },

  /**
   * Sync modal form controls to current BannerConfig state
   */
  syncFormToConfig() {
    if (!this.overlay) return;
    const config = BannerConfig.getAll();

    // Sync all inputs with data-modal-config-key
    this.overlay.querySelectorAll('[data-modal-config-key]').forEach(el => {
      const key = el.dataset.modalConfigKey;
      const value = config[key];

      if (el.type === 'checkbox') {
        el.checked = !!value;
        // Update visual state for toggle switches
        const toggle = el.closest('.modal-toggle');
        if (toggle) {
          toggle.classList.toggle('checked', !!value);
        }
      } else if (el.type === 'radio') {
        // Compare as strings to handle mixed types
        el.checked = String(el.value) === String(value);
      } else {
        el.value = value ?? '';
      }
    });

    // Sync range displays (initialize on open + external changes)
    this.overlay.querySelectorAll('[data-modal-range-display]').forEach(display => {
      const key = display.dataset.modalRangeDisplay;
      display.textContent = config[key] ?? '';
    });

    // Sync color displays (initialize on open + external changes)
    this.overlay.querySelectorAll('[data-modal-color-display]').forEach(display => {
      const key = display.dataset.modalColorDisplay;
      const value = config[key] ?? '';
      if (display.tagName === 'INPUT') {
        display.value = value;
      } else {
        display.textContent = value;
      }
    });
  }
};

export default Modal;
