/**
 * Banner Configuration v2
 * Simplified configuration with clear, non-overlapping options
 */

const STORAGE_KEY = 'banner-config-v2';
const CONFIG_VERSION = 1;

const BannerConfigV2 = {
  // Preset configurations
  presets: {
    standard: {
      layout: 'centered',
      showTitle: true,
      showDayNames: true,
      showYear: false,
      backgroundColor: '#1a5f2a',
      textColor: '#ffffff',
      padding: 'md',
      titleFontFamily: 'opensans',
      titleFontSize: 'md',
      titleFontWeight: 'semibold',
      titleTransform: 'uppercase',
      dateFontFamily: 'opensans',
      dateFontSize: 'md',
      dateFontWeight: 'medium',
      dateTransform: 'capitalize',
      stickyEnabled: true,
      stickyThreshold: 200
    },
    minimal: {
      layout: 'centered',
      showTitle: true,
      showDayNames: false,
      showYear: false,
      backgroundColor: '#374151',
      textColor: '#ffffff',
      padding: 'sm',
      titleFontFamily: 'opensans',
      titleFontSize: 'sm',
      titleFontWeight: 'medium',
      titleTransform: 'uppercase',
      dateFontFamily: 'opensans',
      dateFontSize: 'sm',
      dateFontWeight: 'normal',
      dateTransform: 'capitalize',
      stickyEnabled: false,
      stickyThreshold: 200
    },
    bold: {
      layout: 'spread',
      showTitle: true,
      showDayNames: true,
      showYear: false,
      backgroundColor: '#991b1b',
      textColor: '#ffffff',
      padding: 'lg',
      titleFontFamily: 'montserrat',
      titleFontSize: 'lg',
      titleFontWeight: 'bold',
      titleTransform: 'uppercase',
      dateFontFamily: 'montserrat',
      dateFontSize: 'md',
      dateFontWeight: 'semibold',
      dateTransform: 'capitalize',
      stickyEnabled: true,
      stickyThreshold: 150
    }
  },

  // Default configuration
  defaults: {
    // Layout
    layout: 'centered', // 'centered' | 'spread' | 'stacked'

    // Display
    showTitle: true,
    showDayNames: true,
    showYear: false,

    // Colors
    backgroundColor: '#1a5f2a',
    textColor: '#ffffff',

    // Spacing
    padding: 'md', // 'sm' | 'md' | 'lg'

    // Title Typography
    titleFontFamily: 'opensans', // 'opensans' | 'inter' | 'poppins' | 'montserrat' | 'roboto'
    titleFontSize: 'md', // 'sm' | 'md' | 'lg'
    titleFontWeight: 'semibold', // 'normal' | 'medium' | 'semibold' | 'bold'
    titleTransform: 'uppercase', // 'uppercase' | 'capitalize' | 'none'

    // Date Typography
    dateFontFamily: 'opensans',
    dateFontSize: 'md',
    dateFontWeight: 'medium',
    dateTransform: 'capitalize',

    // Sticky Behavior
    stickyEnabled: true,
    stickyThreshold: 200,

    // Content
    headerText: 'WEEKLY AD',
    startDayOfWeek: 'Wednesday',
    locale: 'en'
  },

  // Current state
  state: {},

  // Event listeners
  _listeners: {},

  /**
   * Initialize configuration
   */
  init() {
    const saved = this.loadFromStorage();

    if (saved) {
      this.state = { ...this.defaults, ...saved };
      console.log('[BannerConfigV2] Loaded from localStorage');
    } else {
      this.state = { ...this.defaults };
      console.log('[BannerConfigV2] Initialized with defaults');
    }

    return this;
  },

  /**
   * Load from localStorage
   */
  loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed._configVersion || parsed._configVersion < CONFIG_VERSION) {
          console.log('[BannerConfigV2] Outdated config, resetting');
          this.clearStorage();
          return null;
        }
        return parsed;
      }
    } catch (e) {
      console.warn('[BannerConfigV2] Failed to load:', e);
    }
    return null;
  },

  /**
   * Save to localStorage
   */
  saveToStorage() {
    try {
      const toSave = { ...this.state, _configVersion: CONFIG_VERSION };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.warn('[BannerConfigV2] Failed to save:', e);
    }
    return this;
  },

  /**
   * Clear localStorage
   */
  clearStorage() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('[BannerConfigV2] Failed to clear:', e);
    }
    return this;
  },

  /**
   * Set a config value
   */
  set(key, value, save = true) {
    if (key in this.state) {
      const oldValue = this.state[key];
      this.state[key] = value;

      if (save) {
        this.saveToStorage();
      }

      this.emit('change', { key, value, oldValue });
    }
    return this;
  },

  /**
   * Set multiple values
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

    this.emit('change', { key: 'multiple', changes });
    return this;
  },

  /**
   * Get a config value
   */
  get(key) {
    return this.state[key];
  },

  /**
   * Get all config
   */
  getAll() {
    return { ...this.state };
  },

  /**
   * Reset to defaults
   */
  reset(clearSaved = true) {
    this.state = { ...this.defaults };

    if (clearSaved) {
      this.clearStorage();
    }

    this.emit('reset', this.state);
    return this;
  },

  /**
   * Apply a preset
   */
  applyPreset(name) {
    const preset = this.presets[name];
    if (!preset) {
      console.warn('[BannerConfigV2] Unknown preset:', name);
      return this;
    }

    this.setMultiple(preset);
    this.emit('preset', { name, config: preset });
    return this;
  },

  /**
   * Get CSS classes for current config
   */
  getCSSClasses() {
    const config = this.state;
    const classes = ['banner'];

    // Layout
    classes.push(`banner--${config.layout}`);

    // Padding
    classes.push(`banner--padding-${config.padding}`);

    // Sticky
    if (config.stickyEnabled) {
      classes.push('banner--sticky-enabled');
    }

    return classes;
  },

  /**
   * Get CSS classes for title
   */
  getTitleClasses() {
    const config = this.state;
    const classes = ['banner__title'];

    classes.push(`banner__title--font-${config.titleFontFamily}`);
    classes.push(`banner__title--size-${config.titleFontSize}`);
    classes.push(`banner__title--weight-${config.titleFontWeight}`);
    classes.push(`banner__title--${config.titleTransform}`);

    if (!config.showTitle) {
      classes.push('banner__title--hidden');
    }

    return classes;
  },

  /**
   * Get CSS classes for dates
   */
  getDatesClasses() {
    const config = this.state;
    const classes = ['banner__dates'];

    classes.push(`banner__dates--font-${config.dateFontFamily}`);
    classes.push(`banner__dates--size-${config.dateFontSize}`);
    classes.push(`banner__dates--weight-${config.dateFontWeight}`);
    classes.push(`banner__dates--${config.dateTransform}`);

    return classes;
  },

  /**
   * Get inline styles (colors only)
   */
  getInlineStyles() {
    return {
      backgroundColor: this.state.backgroundColor,
      color: this.state.textColor
    };
  },

  // Event emitter
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

export default BannerConfigV2;
