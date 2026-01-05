/**
 * Configuration State Management
 * Manages the banner configuration state with localStorage persistence
 */

const STORAGE_KEY = 'circular-date-banner-config';

const BannerConfig = {
  // Preset configurations
  presets: {
    minimal: {
      headerText: 'WEEKLY AD',
      backgroundColor: '#374151',
      textColor: '#ffffff',
      fontFamily: 'primary',
      fontWeight: 500,
      textTransform: 'uppercase',
      alignment: 'center',
      paddingVertical: 'sm',
      paddingHorizontal: 'sm',
      borderStyle: 'none',
      backgroundPattern: 'none',
      showDayNames: false,
      showValidityPill: false,
      stickyEnabled: false
    },
    standard: {
      headerText: 'WEEKLY AD',
      backgroundColor: '#1a5f2a',
      textColor: '#ffffff',
      fontFamily: 'primary',
      fontWeight: 600,
      textTransform: 'uppercase',
      alignment: 'center',
      paddingVertical: 'md',
      paddingHorizontal: 'md',
      borderStyle: 'none',
      backgroundPattern: 'none',
      showDayNames: true,
      showValidityPill: true,
      stickyEnabled: true,
      stickyThreshold: 200
    },
    bold: {
      headerText: 'WEEKLY AD',
      backgroundColor: '#991b1b',
      textColor: '#ffffff',
      fontFamily: 'heading',
      fontWeight: 700,
      textTransform: 'uppercase',
      alignment: 'center',
      paddingVertical: 'lg',
      paddingHorizontal: 'lg',
      borderStyle: 'bottom-only',
      borderColor: '#7f1d1d',
      borderWidth: 3,
      backgroundPattern: 'diagonal-lines',
      patternOpacity: 0.1,
      showDayNames: true,
      showValidityPill: true,
      stickyEnabled: true,
      stickyThreshold: 150
    },
    spanish: {
      headerText: 'WEEKLY AD',
      headerTextTranslated: 'OFERTAS SEMANALES',
      locale: 'es',
      backgroundColor: '#1e40af',
      textColor: '#ffffff',
      fontFamily: 'primary',
      fontWeight: 600,
      textTransform: 'uppercase',
      alignment: 'center',
      paddingVertical: 'md',
      paddingHorizontal: 'md',
      borderStyle: 'none',
      backgroundPattern: 'none',
      showDayNames: true,
      showValidityPill: true,
      stickyEnabled: true
    }
  },

  // Default configuration values
  defaults: {
    // Content
    enabled: true,
    headerText: 'WEEKLY AD',
    headerTextTranslated: 'OFERTAS SEMANALES',
    locale: 'en',
    startDayOfWeek: 'Wednesday',

    // Layout
    layoutMode: 'vertical', // 'vertical' (stacked) or 'horizontal' (inline)
    dateLayout: 'single-line', // 'single-line' or 'two-line' (for horizontal mode)
    flexDirection: 'normal', // 'normal' or 'reverse' - reverses order of title/dates

    // Date Display
    dateFormat: 'explicit',
    showTitle: true, // Show/hide the title (WEEKLY AD)
    showDayNames: true,
    showYear: false,
    dayNameFormat: 'abbreviated', // 'abbreviated' (Wed) or 'full' (Wednesday)
    dateTextTransform: 'capitalize', // 'uppercase' or 'capitalize'

    // Typography
    fontFamily: 'primary',
    fontWeight: 600,
    textTransform: 'uppercase',

    // Colors
    backgroundColor: '#1a5f2a',
    textColor: '#ffffff',

    // Layout & Alignment
    titleAlignment: 'left', // 'left', 'center', 'right'
    dateAlignment: 'right', // 'left', 'center', 'right'
    alignment: 'center', // Legacy - overall alignment for vertical mode
    paddingVertical: 'md',
    paddingHorizontal: 'md',

    // Border
    borderStyle: 'none',
    borderColor: '#000000',
    borderWidth: 2,

    // Background Pattern
    backgroundPattern: 'none',
    patternOpacity: 0.15,

    // Validity Pill
    showValidityPill: true,
    pillPosition: 'bottom-left',

    // Sticky Behavior
    stickyEnabled: true,
    stickyThreshold: 200,

    // Testing
    referenceDate: null
  },

  // Current configuration state
  state: {},

  /**
   * Initialize configuration with defaults or from localStorage
   */
  init() {
    // Try to load from localStorage
    const saved = this.loadFromStorage();

    if (saved) {
      // Merge saved config with defaults (in case new options were added)
      this.state = { ...this.defaults, ...saved };
      console.log('[BannerConfig] Loaded from localStorage:', this.state);
    } else {
      this.state = { ...this.defaults };
      console.log('[BannerConfig] Initialized with defaults:', this.state);
    }

    // Set reference date to today if not set
    if (!this.state.referenceDate) {
      this.state.referenceDate = new Date();
    }

    return this;
  },

  /**
   * Load configuration from localStorage
   * @returns {object|null} Saved configuration or null
   */
  loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convert referenceDate string back to Date
        if (parsed.referenceDate) {
          parsed.referenceDate = new Date(parsed.referenceDate);
        }
        return parsed;
      }
    } catch (e) {
      console.warn('[BannerConfig] Failed to load from localStorage:', e);
    }
    return null;
  },

  /**
   * Save current configuration to localStorage
   */
  saveToStorage() {
    try {
      const toSave = { ...this.state };
      // Convert Date to ISO string for storage
      if (toSave.referenceDate instanceof Date) {
        toSave.referenceDate = toSave.referenceDate.toISOString();
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.warn('[BannerConfig] Failed to save to localStorage:', e);
    }
    return this;
  },

  /**
   * Clear saved configuration from localStorage
   */
  clearStorage() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('[BannerConfig] Cleared localStorage');
    } catch (e) {
      console.warn('[BannerConfig] Failed to clear localStorage:', e);
    }
    return this;
  },

  /**
   * Update a configuration value
   * @param {string} key - Configuration key
   * @param {*} value - New value
   * @param {boolean} save - Whether to save to localStorage (default: true)
   */
  set(key, value, save = true) {
    if (key in this.state) {
      const oldValue = this.state[key];
      this.state[key] = value;

      // Save to localStorage
      if (save) {
        this.saveToStorage();
      }

      // Emit change event
      this.emit('change', { key, value, oldValue });

      // Also dispatch a CustomEvent for DOM listeners
      this.dispatchDOMEvent('config:change', { key, value, oldValue });
    } else {
      console.warn('[BannerConfig] Unknown config key:', key);
    }
    return this;
  },

  /**
   * Update multiple configuration values at once
   * @param {object} updates - Object with key-value pairs
   * @param {boolean} save - Whether to save to localStorage (default: true)
   */
  setMultiple(updates, save = true) {
    const changes = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key in this.state) {
        const oldValue = this.state[key];
        this.state[key] = value;
        changes.push({ key, value, oldValue });
      }
    });

    if (save) {
      this.saveToStorage();
    }

    this.emit('change', { key: 'multiple', value: updates, changes });
    this.dispatchDOMEvent('config:change', { key: 'multiple', value: updates, changes });

    return this;
  },

  /**
   * Get a configuration value
   * @param {string} key - Configuration key
   * @returns {*} Configuration value
   */
  get(key) {
    return this.state[key];
  },

  /**
   * Get all configuration values
   * @returns {object} Current state
   */
  getAll() {
    return { ...this.state };
  },

  /**
   * Reset to defaults
   * @param {boolean} clearSaved - Whether to clear localStorage (default: true)
   */
  reset(clearSaved = true) {
    this.state = { ...this.defaults };
    this.state.referenceDate = new Date();

    if (clearSaved) {
      this.clearStorage();
    }

    this.emit('reset', this.state);
    this.dispatchDOMEvent('config:reset', this.state);

    return this;
  },

  /**
   * Get the effective header text based on locale
   * @returns {string} Header text
   */
  getHeaderText() {
    if (this.state.locale === 'es') {
      return this.state.headerTextTranslated || this.state.headerText;
    }
    return this.state.headerText;
  },

  /**
   * Apply a preset configuration
   * @param {string} presetName - Name of preset (minimal, standard, bold, spanish)
   */
  applyPreset(presetName) {
    const preset = this.presets[presetName];
    if (!preset) {
      console.warn('[BannerConfig] Unknown preset:', presetName);
      return this;
    }

    // Merge preset with current state (preset overrides)
    this.setMultiple(preset);
    console.log('[BannerConfig] Applied preset:', presetName);

    this.emit('preset', { name: presetName, config: preset });
    this.dispatchDOMEvent('config:preset', { name: presetName, config: preset });

    return this;
  },

  /**
   * Get available preset names
   * @returns {string[]} Array of preset names
   */
  getPresetNames() {
    return Object.keys(this.presets);
  },

  /**
   * Export current configuration as JSON string
   * @param {boolean} pretty - Whether to format with indentation
   * @returns {string} JSON string
   */
  exportJSON(pretty = true) {
    const toExport = { ...this.state };
    // Convert Date to ISO string for export
    if (toExport.referenceDate instanceof Date) {
      toExport.referenceDate = toExport.referenceDate.toISOString();
    }
    return pretty ? JSON.stringify(toExport, null, 2) : JSON.stringify(toExport);
  },

  /**
   * Import configuration from JSON string
   * @param {string} json - JSON string to import
   * @returns {boolean} Success status
   */
  importJSON(json) {
    try {
      const imported = JSON.parse(json);
      // Convert referenceDate string back to Date
      if (imported.referenceDate) {
        imported.referenceDate = new Date(imported.referenceDate);
      }
      // Merge with defaults to ensure all keys exist
      this.state = { ...this.defaults, ...imported };
      this.saveToStorage();

      this.emit('import', this.state);
      this.dispatchDOMEvent('config:import', this.state);

      console.log('[BannerConfig] Imported configuration');
      return true;
    } catch (e) {
      console.error('[BannerConfig] Failed to import JSON:', e);
      return false;
    }
  },

  /**
   * Copy current configuration to clipboard
   * @returns {Promise<boolean>} Success status
   */
  async copyToClipboard() {
    try {
      const json = this.exportJSON();
      await navigator.clipboard.writeText(json);
      console.log('[BannerConfig] Copied to clipboard');
      return true;
    } catch (e) {
      console.error('[BannerConfig] Failed to copy to clipboard:', e);
      return false;
    }
  },

  /**
   * Dispatch a CustomEvent on the document
   * @param {string} eventName - Event name
   * @param {object} detail - Event detail data
   */
  dispatchDOMEvent(eventName, detail) {
    const event = new CustomEvent(eventName, {
      detail,
      bubbles: true
    });
    document.dispatchEvent(event);
  },

  // Simple event emitter
  _listeners: {},

  on(event, callback) {
    if (!this._listeners[event]) {
      this._listeners[event] = [];
    }
    this._listeners[event].push(callback);
    return this;
  },

  off(event, callback) {
    if (this._listeners[event]) {
      this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
    }
    return this;
  },

  emit(event, data) {
    if (this._listeners[event]) {
      this._listeners[event].forEach(callback => callback(data));
    }
    return this;
  }
};

export default BannerConfig;
