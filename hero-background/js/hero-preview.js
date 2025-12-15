/**
 * Hero Preview Renderer
 * Renders hero cards with configurable backgrounds
 *
 * TypeScript-ready architecture with JSDoc type definitions
 * Designed for easy migration to Angular components
 */

// =============================================================================
// Type Definitions (JSDoc for TypeScript compatibility)
// =============================================================================

/**
 * @typedef {Object} BackgroundColorDto
 * @property {string} type - Color type ('solid' | 'transparent')
 * @property {string} hexCode - Hex color string (e.g., "#FF5722")
 * @property {number} red - Red channel (0-255)
 * @property {number} green - Green channel (0-255)
 * @property {number} blue - Blue channel (0-255)
 * @property {number} alpha - Alpha channel (0-100, percentage)
 */

/**
 * @typedef {Object} BackgroundImageDto
 * @property {string|null} imageName - Image name identifier
 * @property {string|null} imageHref - Image source URL or null
 * @property {string|null} imageHash - Optional image hash
 * @property {string} position - CSS background-position value
 * @property {string} size - CSS background-size value
 * @property {string} repeat - CSS background-repeat value
 */

/**
 * @typedef {Object} HeroConfig
 * @property {string} cardSize - Card size key (e.g., "2x2")
 * @property {BackgroundColorDto} backgroundColor - Background color configuration
 * @property {BackgroundImageDto} backgroundImage - Background image configuration
 */

/**
 * @typedef {Object} CardSizeInfo
 * @property {number} width - Width in pixels
 * @property {number} height - Height in pixels
 * @property {string} aspect - CSS aspect-ratio value
 */

/**
 * @typedef {Object} SelectOption
 * @property {string} value - Option value
 * @property {string} label - Display label
 */

// =============================================================================
// Constants
// =============================================================================

/** @type {Record<string, CardSizeInfo>} */
const CARD_SIZES = {
  '1x1': { width: 125, height: 125, aspect: '1 / 1' },
  '1x2': { width: 125, height: 250, aspect: '1 / 2' },
  '1x3': { width: 125, height: 375, aspect: '1 / 3' },
  '2x1': { width: 250, height: 125, aspect: '2 / 1' },
  '2x2': { width: 250, height: 250, aspect: '1 / 1' },
  '2x3': { width: 250, height: 375, aspect: '2 / 3' },
  '3x1': { width: 375, height: 125, aspect: '3 / 1' },
  '3x2': { width: 375, height: 250, aspect: '3 / 2' },
  '3x3': { width: 375, height: 375, aspect: '1 / 1' }
};

/** @type {Array<{id: string, src: string, label: string}>} */
const BACKGROUND_IMAGES = [
  { id: 'wood-grain', src: 'sample-images/Wood_Grain_BG.jpg', label: 'Wood Grain' },
  { id: 'wood', src: 'sample-images/wood-BG.png', label: 'Wood' },
  { id: 'stone', src: 'sample-images/stone-BG.jpg', label: 'Stone' },
  { id: 'wood-table', src: 'sample-images/wood-table_BG.png', label: 'Wood Table' },
  { id: 'diagonal', src: 'sample-images/diagonal_BG.png', label: 'Diagonal' },
  { id: 'polka-dots', src: 'sample-images/polka-dots_BG.png', label: 'Polka Dots' }
];

/** @type {string} */
const HERO_IMAGE = 'sample-images/CocaCola_Original2Liter_large_66a21ff4-7055-4178-a532-19ab3b6374cf.png';

/** @type {SelectOption[]} */
const POSITION_OPTIONS = [
  { value: 'top left', label: 'Top Left' },
  { value: 'top center', label: 'Top Center' },
  { value: 'top right', label: 'Top Right' },
  { value: 'center left', label: 'Center Left' },
  { value: 'center center', label: 'Center Center' },
  { value: 'center right', label: 'Center Right' },
  { value: 'bottom left', label: 'Bottom Left' },
  { value: 'bottom center', label: 'Bottom Center' },
  { value: 'bottom right', label: 'Bottom Right' }
];

/** @type {SelectOption[]} */
const SIZE_OPTIONS = [
  { value: 'cover', label: 'Cover', icon: 'cover' },
  { value: 'contain', label: 'Contain', icon: 'contain' },
  { value: 'auto', label: 'Auto', icon: 'auto' },
  { value: 'custom', label: 'Custom', icon: 'custom' }
];

/** @type {SelectOption[]} */
const REPEAT_OPTIONS = [
  { value: 'no-repeat', label: 'No Repeat' },
  { value: 'repeat', label: 'Repeat' },
  { value: 'repeat-x', label: 'Repeat-X' },
  { value: 'repeat-y', label: 'Repeat-Y' }
];

/** @type {SelectOption[]} */
const BLEND_MODE_OPTIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'darken', label: 'Darken' },
  { value: 'lighten', label: 'Lighten' },
  { value: 'color-dodge', label: 'Color Dodge' },
  { value: 'color-burn', label: 'Color Burn' },
  { value: 'hard-light', label: 'Hard Light' },
  { value: 'soft-light', label: 'Soft Light' }
];

/** @type {SelectOption[]} */
const ATTACHMENT_OPTIONS = [
  { value: 'scroll', label: 'Scroll' },
  { value: 'fixed', label: 'Fixed' }
];

/** @type {SelectOption[]} */
const ORIGIN_OPTIONS = [
  { value: 'padding-box', label: 'Padding Box' },
  { value: 'border-box', label: 'Border Box' },
  { value: 'content-box', label: 'Content Box' }
];

/** @type {SelectOption[]} */
const CLIP_OPTIONS = [
  { value: 'border-box', label: 'Border Box' },
  { value: 'padding-box', label: 'Padding Box' },
  { value: 'content-box', label: 'Content Box' },
  { value: 'text', label: 'Text' }
];

/** @type {Array<{hex: string, label: string}>} */
const COLOR_SWATCHES = [
  { hex: '#FFFFFF', label: 'White' },
  { hex: '#000000', label: 'Black' },
  { hex: '#F5F5F5', label: 'Light Gray' },
  { hex: '#9E9E9E', label: 'Medium Gray' },
  { hex: '#424242', label: 'Dark Gray' },
  { hex: '#D32F2F', label: 'Red' },
  { hex: '#1976D2', label: 'Blue' },
  { hex: '#388E3C', label: 'Green' }
];

// =============================================================================
// HeroPreview Class
// =============================================================================

/**
 * HeroPreview class
 * Manages rendering of hero cards with backgrounds
 *
 * @example
 * const preview = new HeroPreview();
 * preview.setBackgroundColorHex('#FF5722');
 * preview.setBackgroundImage('path/to/image.jpg');
 * preview.render(containerElement);
 *
 * // Subscribe to changes (Angular-like pattern)
 * const unsubscribe = preview.onChange((config) => {
 *   console.log('Config changed:', config);
 * });
 */
class HeroPreview {
  /**
   * Create a new HeroPreview instance
   * @param {Partial<HeroConfig>} [options={}] - Initial configuration options
   */
  constructor(options = {}) {
    /** @type {HeroConfig} */
    this.config = {
      cardSize: '2x2',
      backgroundColor: {
        type: 'solid',
        hexCode: '#ffffff',
        red: 255,
        green: 255,
        blue: 255,
        alpha: 100
      },
      backgroundImage: {
        imageName: null,
        imageHref: null,
        imageHash: null,
        position: 'center center',
        size: 'cover',
        repeat: 'no-repeat'
      },
      ...options
    };

    /** @type {Function[]} */
    this._changeListeners = [];

    /** @type {string[]} */
    this._recentColors = [];
  }

  // ===========================================================================
  // Event Emitter Pattern (Angular-ready)
  // ===========================================================================

  /**
   * Subscribe to configuration changes
   * @param {Function} callback - Callback function receiving updated config
   * @returns {Function} Unsubscribe function
   */
  onChange(callback) {
    this._changeListeners.push(callback);
    return () => {
      this._changeListeners = this._changeListeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Emit change event to all subscribers
   * @private
   */
  _emitChange() {
    const configCopy = JSON.parse(JSON.stringify(this.config));
    this._changeListeners.forEach(cb => cb(configCopy));
  }

  // ===========================================================================
  // Color Conversion Utilities
  // ===========================================================================

  /**
   * Convert background color config to CSS rgba string
   * @param {BackgroundColorDto} color - Background color object
   * @returns {string} CSS rgba() string
   */
  colorToString(color) {
    const alpha = color.alpha / 100; // Convert 0-100 to 0-1
    return `rgba(${color.red}, ${color.green}, ${color.blue}, ${alpha})`;
  }

  /**
   * Convert hex color to RGB values
   * @param {string} hex - Hex color string (e.g., "#FF5722")
   * @returns {{red: number, green: number, blue: number}} RGB values
   */
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      return {
        red: parseInt(result[1], 16),
        green: parseInt(result[2], 16),
        blue: parseInt(result[3], 16)
      };
    }
    return { red: 255, green: 255, blue: 255 };
  }

  /**
   * Convert RGB values to hex string
   * @param {number} red - Red channel (0-255)
   * @param {number} green - Green channel (0-255)
   * @param {number} blue - Blue channel (0-255)
   * @returns {string} Hex color string
   */
  rgbToHex(red, green, blue) {
    const toHex = (n) => {
      const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
  }

  // ===========================================================================
  // Configuration Setters
  // ===========================================================================

  /**
   * Update full configuration
   * @param {Partial<HeroConfig>} newConfig - Partial configuration to merge
   * @returns {void}
   */
  setConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this._emitChange();
  }

  /**
   * Set background color type
   * @param {string} type - Color type ('solid' | 'transparent')
   * @returns {void}
   */
  setBackgroundColorType(type) {
    this.config.backgroundColor = {
      ...this.config.backgroundColor,
      type: type
    };
    if (type === 'transparent') {
      this.config.backgroundColor.alpha = 0;
    }
    this._emitChange();
  }

  /**
   * Set background color from hex string
   * @param {string} hex - Hex color (e.g., "#FF5722")
   * @param {number|null} [alpha=null] - Optional alpha override (0-100)
   * @returns {void}
   */
  setBackgroundColorHex(hex, alpha = null) {
    const rgb = this.hexToRgb(hex);
    const currentAlpha = alpha !== null ? alpha : this.config.backgroundColor.alpha;
    this.config.backgroundColor = {
      type: currentAlpha === 0 ? 'transparent' : 'solid',
      hexCode: hex,
      red: rgb.red,
      green: rgb.green,
      blue: rgb.blue,
      alpha: currentAlpha
    };
    this._addRecentColor(hex);
    this._emitChange();
  }

  /**
   * Set background color from RGB values
   * @param {number} red - Red channel (0-255)
   * @param {number} green - Green channel (0-255)
   * @param {number} blue - Blue channel (0-255)
   * @param {number} [alpha=100] - Alpha channel (0-100)
   * @returns {void}
   */
  setBackgroundColorRgb(red, green, blue, alpha = 100) {
    const hex = this.rgbToHex(red, green, blue);
    this.config.backgroundColor = {
      type: alpha === 0 ? 'transparent' : 'solid',
      hexCode: hex,
      red: Math.max(0, Math.min(255, red)),
      green: Math.max(0, Math.min(255, green)),
      blue: Math.max(0, Math.min(255, blue)),
      alpha: Math.max(0, Math.min(100, alpha))
    };
    this._addRecentColor(hex);
    this._emitChange();
  }

  /**
   * Set background color alpha only
   * @param {number} alpha - Alpha value (0-100)
   * @returns {void}
   */
  setBackgroundColorAlpha(alpha) {
    this.config.backgroundColor = {
      ...this.config.backgroundColor,
      type: alpha === 0 ? 'transparent' : 'solid',
      alpha: Math.max(0, Math.min(100, alpha))
    };
    this._emitChange();
  }

  /**
   * Set background image
   * @param {string|null} imageHref - Image URL or null to clear
   * @param {string|null} [imageName=null] - Image name identifier
   * @returns {void}
   */
  setBackgroundImage(imageHref, imageName = null) {
    this.config.backgroundImage = {
      ...this.config.backgroundImage,
      imageHref: imageHref,
      imageName: imageName
    };
    this._emitChange();
  }

  /**
   * Set background image position
   * @param {string} position - CSS background-position value
   * @returns {void}
   */
  setBackgroundPosition(position) {
    this.config.backgroundImage = {
      ...this.config.backgroundImage,
      position: position
    };
    this._emitChange();
  }

  /**
   * Set background image size
   * @param {string} size - CSS background-size value
   * @returns {void}
   */
  setBackgroundSize(size) {
    this.config.backgroundImage = {
      ...this.config.backgroundImage,
      size: size
    };
    this._emitChange();
  }

  /**
   * Set background image repeat
   * @param {string} repeat - CSS background-repeat value
   * @returns {void}
   */
  setBackgroundRepeat(repeat) {
    this.config.backgroundImage = {
      ...this.config.backgroundImage,
      repeat: repeat
    };
    this._emitChange();
  }

  /**
   * Set card size
   * @param {string} size - Card size key (e.g., "2x2")
   * @returns {void}
   */
  setCardSize(size) {
    if (CARD_SIZES[size]) {
      this.config.cardSize = size;
      this._emitChange();
    }
  }

  // ===========================================================================
  // Recent Colors
  // ===========================================================================

  /**
   * Add color to recent colors list
   * @param {string} hex - Hex color to add
   * @private
   */
  _addRecentColor(hex) {
    const normalized = hex.toUpperCase();
    this._recentColors = this._recentColors.filter(c => c !== normalized);
    this._recentColors.unshift(normalized);
    if (this._recentColors.length > 5) {
      this._recentColors = this._recentColors.slice(0, 5);
    }
  }

  /**
   * Get recent colors
   * @returns {string[]} Array of recent hex colors
   */
  getRecentColors() {
    return [...this._recentColors];
  }

  // ===========================================================================
  // Style Building
  // ===========================================================================

  /**
   * Build inline styles object for hero card
   * @returns {Record<string, string>} CSS property-value pairs
   */
  buildStyles() {
    /** @type {Record<string, string>} */
    const styles = {};
    const bg = this.config.backgroundColor;
    const bgImg = this.config.backgroundImage;

    // Background color
    styles.backgroundColor = this.colorToString(bg);

    // Background image (if set)
    if (bgImg.imageHref) {
      styles.backgroundImage = `url('${bgImg.imageHref}')`;
      styles.backgroundPosition = bgImg.position;
      styles.backgroundSize = bgImg.size;
      styles.backgroundRepeat = bgImg.repeat;
    }

    return styles;
  }

  /**
   * Build styles string for inline style attribute
   * @returns {string} CSS style string
   */
  buildStyleString() {
    const styles = this.buildStyles();
    return Object.entries(styles)
      .map(([key, value]) => {
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${cssKey}: ${value}`;
      })
      .join('; ');
  }

  // ===========================================================================
  // Rendering
  // ===========================================================================

  /**
   * Render hero card HTML into container
   * @param {HTMLElement} container - Container element
   * @returns {HTMLElement|undefined} The rendered hero card element
   */
  render(container) {
    if (!container) return;

    const styleString = this.buildStyleString();
    const cardHtml = `
      <div class="hero-card"
           data-card-size="${this.config.cardSize}"
           style="${styleString}">
        <img class="hero-card__image"
             src="${HERO_IMAGE}"
             alt="Hero Product"
             draggable="false">
      </div>
    `;

    container.innerHTML = cardHtml;
    return container.querySelector('.hero-card');
  }

  /**
   * Render multiple sizes for comparison
   * @param {HTMLElement} container - Container element
   * @returns {void}
   */
  renderAllSizes(container) {
    if (!container) return;

    const sizes = Object.keys(CARD_SIZES);
    const styleString = this.buildStyleString();

    container.innerHTML = sizes.map(size => {
      const info = CARD_SIZES[size];

      const cardHtml = `
        <div class="hero-card"
             data-card-size="${size}"
             style="${styleString}">
          <img class="hero-card__image"
               src="${HERO_IMAGE}"
               alt="Hero Product"
               draggable="false">
        </div>
      `;

      return `
        <div class="size-item">
          ${cardHtml}
          <span class="size-item__label">${size} (${info.width}x${info.height})</span>
        </div>
      `;
    }).join('');
  }

  /**
   * Render hero card using Angular circular-card structure
   * @param {HTMLElement} container - Container element
   * @returns {HTMLElement|undefined} The rendered circular card element
   */
  renderCircularCard(container) {
    if (!container) return;

    const styleString = this.buildStyleString();
    // Convert cardSize format from "2x2" to "22" for Angular class
    const sizeClass = `size-${this.config.cardSize.replace('x', '')}`;

    const cardHtml = `
      <div class="cardwrapper ${sizeClass}">
        <div class="circular-card ${sizeClass}"
             style="${styleString}">
          <div class="circular-card-content">
            <img class="circular-card-image"
                 src="${HERO_IMAGE}"
                 alt="Hero Product"
                 draggable="false"
                 style="width: 90%; height: auto; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); object-fit: contain;">
          </div>
        </div>
      </div>
    `;

    container.innerHTML = cardHtml;
    return container.querySelector('.circular-card');
  }

  /**
   * Get Angular circular-card HTML output
   * @returns {string} HTML markup using circular-card structure
   */
  getCircularCardHtmlOutput() {
    const bg = this.config.backgroundColor;
    const bgImg = this.config.backgroundImage;
    const hasImage = bgImg.imageHref !== null;
    const sizeClass = `size-${this.config.cardSize.replace('x', '')}`;

    const indent = '  ';
    const lines = [];

    lines.push(`<div class="cardwrapper">`);
    lines.push(`${indent}<div class="circular-card ${sizeClass}"`);

    const styleLines = [];
    styleLines.push(`background-color: ${this.colorToString(bg)}`);

    if (hasImage) {
      styleLines.push(`background-image: url('${bgImg.imageHref}')`);
      styleLines.push(`background-position: ${bgImg.position}`);
      styleLines.push(`background-size: ${bgImg.size}`);
      styleLines.push(`background-repeat: ${bgImg.repeat}`);
    }

    lines.push(`${indent}${indent}style="${styleLines.join('; ')};">`);
    lines.push(`${indent}${indent}<div class="circular-card-content">`);
    lines.push(`${indent}${indent}${indent}<img class="circular-card-image"`);
    lines.push(`${indent}${indent}${indent}${indent}src="${HERO_IMAGE}"`);
    lines.push(`${indent}${indent}${indent}${indent}alt="Hero Product">`);
    lines.push(`${indent}${indent}</div>`);
    lines.push(`${indent}</div>`);
    lines.push(`</div>`);

    return lines.join('\n');
  }

  // ===========================================================================
  // Output Methods
  // ===========================================================================

  /**
   * Get current configuration as JSON string
   * @returns {string} Formatted JSON string
   */
  getConfigJson() {
    return JSON.stringify(this.config, null, 2);
  }

  /**
   * Get CSS output for the hero card
   * @returns {string} CSS rules
   */
  getCssOutput() {
    const styles = this.buildStyles();

    const lines = ['.hero-card {'];

    for (const [key, value] of Object.entries(styles)) {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      lines.push(`  ${cssKey}: ${value};`);
    }

    lines.push('}');
    lines.push('');
    lines.push('.hero-card__image {');
    lines.push('  position: relative;');
    lines.push('  z-index: 1;');
    lines.push('  object-fit: contain;');
    lines.push('}');

    return lines.join('\n');
  }

  /**
   * Get inline HTML output for the hero card
   * @returns {string} HTML markup
   */
  getHtmlOutput() {
    const bg = this.config.backgroundColor;
    const bgImg = this.config.backgroundImage;
    const hasImage = bgImg.imageHref !== null;

    const indent = '  ';
    const lines = [];

    lines.push(`<div class="hero-card"`);
    lines.push(`${indent}data-card-size="${this.config.cardSize}"`);

    const styleLines = [];
    styleLines.push(`background-color: ${this.colorToString(bg)}`);

    if (hasImage) {
      styleLines.push(`background-image: url('${bgImg.imageHref}')`);
      styleLines.push(`background-position: ${bgImg.position}`);
      styleLines.push(`background-size: ${bgImg.size}`);
      styleLines.push(`background-repeat: ${bgImg.repeat}`);
    }

    lines.push(`${indent}style="${styleLines.join('; ')};">`);
    lines.push(`${indent}<img class="hero-card__image"`);
    lines.push(`${indent}${indent}src="${HERO_IMAGE}"`);
    lines.push(`${indent}${indent}alt="Hero Product">`);
    lines.push(`</div>`);

    return lines.join('\n');
  }
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch (e) {
      document.body.removeChild(textarea);
      return false;
    }
  }
}

// =============================================================================
// Exports
// =============================================================================

window.HeroPreview = HeroPreview;
window.CARD_SIZES = CARD_SIZES;
window.BACKGROUND_IMAGES = BACKGROUND_IMAGES;
window.HERO_IMAGE = HERO_IMAGE;
window.POSITION_OPTIONS = POSITION_OPTIONS;
window.SIZE_OPTIONS = SIZE_OPTIONS;
window.REPEAT_OPTIONS = REPEAT_OPTIONS;
window.BLEND_MODE_OPTIONS = BLEND_MODE_OPTIONS;
window.ATTACHMENT_OPTIONS = ATTACHMENT_OPTIONS;
window.ORIGIN_OPTIONS = ORIGIN_OPTIONS;
window.CLIP_OPTIONS = CLIP_OPTIONS;
window.COLOR_SWATCHES = COLOR_SWATCHES;
window.copyToClipboard = copyToClipboard;
