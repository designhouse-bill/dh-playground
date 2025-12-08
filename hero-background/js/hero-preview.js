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
 * @typedef {Object} RgbaColor
 * @property {number} r - Red channel (0-255)
 * @property {number} g - Green channel (0-255)
 * @property {number} b - Blue channel (0-255)
 * @property {number} a - Alpha channel (0-1)
 */

/**
 * @typedef {Object} BackgroundColorConfig
 * @property {string} hex - Hex color string (e.g., "#FF5722")
 * @property {RgbaColor} rgba - RGBA color object
 */

/**
 * @typedef {Object} BackgroundImageConfig
 * @property {string|null} src - Image source URL or null
 * @property {string} position - CSS background-position value
 * @property {string} size - CSS background-size value
 * @property {string} repeat - CSS background-repeat value
 * @property {number} opacity - Opacity value (0-1)
 * @property {string} blendMode - CSS background-blend-mode value
 * @property {string} attachment - CSS background-attachment value
 * @property {string} origin - CSS background-origin value
 * @property {string} clip - CSS background-clip value
 */

/**
 * @typedef {Object} HeroConfig
 * @property {string} cardSize - Card size key (e.g., "2x2")
 * @property {BackgroundColorConfig} backgroundColor - Background color configuration
 * @property {BackgroundImageConfig} backgroundImage - Background image configuration
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
        hex: '#ffffff',
        rgba: { r: 255, g: 255, b: 255, a: 1 }
      },
      backgroundImage: {
        src: null,
        position: 'center center',
        size: 'cover',
        repeat: 'no-repeat',
        opacity: 1,
        blendMode: 'normal',
        attachment: 'scroll',
        origin: 'padding-box',
        clip: 'border-box'
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
   * Convert RGBA object to CSS string
   * @param {RgbaColor} rgba - RGBA color object
   * @returns {string} CSS rgba() string
   */
  rgbaToString(rgba) {
    return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
  }

  /**
   * Convert hex color to RGBA object
   * @param {string} hex - Hex color string (e.g., "#FF5722")
   * @param {number} [alpha=1] - Alpha value (0-1)
   * @returns {RgbaColor} RGBA color object
   */
  hexToRgba(hex, alpha = 1) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: alpha
      };
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  }

  /**
   * Convert RGBA object to hex string
   * @param {RgbaColor} rgba - RGBA color object
   * @returns {string} Hex color string
   */
  rgbaToHex(rgba) {
    const toHex = (n) => {
      const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(rgba.r)}${toHex(rgba.g)}${toHex(rgba.b)}`;
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
   * Set background color from hex string
   * @param {string} hex - Hex color (e.g., "#FF5722")
   * @param {number|null} [alpha=null] - Optional alpha override (0-1)
   * @returns {void}
   */
  setBackgroundColorHex(hex, alpha = null) {
    const currentAlpha = alpha !== null ? alpha : this.config.backgroundColor.rgba.a;
    this.config.backgroundColor = {
      hex: hex,
      rgba: this.hexToRgba(hex, currentAlpha)
    };
    this._addRecentColor(hex);
    this._emitChange();
  }

  /**
   * Set background color from RGBA object
   * @param {RgbaColor} rgba - RGBA color object
   * @returns {void}
   */
  setBackgroundColorRgba(rgba) {
    const hex = this.rgbaToHex(rgba);
    this.config.backgroundColor = {
      rgba: { ...rgba },
      hex: hex
    };
    this._addRecentColor(hex);
    this._emitChange();
  }

  /**
   * Set background image source
   * @param {string|null} src - Image URL or null to clear
   * @returns {void}
   */
  setBackgroundImage(src) {
    this.config.backgroundImage = {
      ...this.config.backgroundImage,
      src: src
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
   * Set background image opacity
   * @param {number} opacity - Opacity value (0-1)
   * @returns {void}
   */
  setBackgroundOpacity(opacity) {
    this.config.backgroundImage = {
      ...this.config.backgroundImage,
      opacity: Math.max(0, Math.min(1, opacity))
    };
    this._emitChange();
  }

  /**
   * Set background blend mode
   * @param {string} blendMode - CSS background-blend-mode value
   * @returns {void}
   */
  setBackgroundBlendMode(blendMode) {
    this.config.backgroundImage = {
      ...this.config.backgroundImage,
      blendMode: blendMode
    };
    this._emitChange();
  }

  /**
   * Set background attachment
   * @param {string} attachment - CSS background-attachment value
   * @returns {void}
   */
  setBackgroundAttachment(attachment) {
    this.config.backgroundImage = {
      ...this.config.backgroundImage,
      attachment: attachment
    };
    this._emitChange();
  }

  /**
   * Set background origin
   * @param {string} origin - CSS background-origin value
   * @returns {void}
   */
  setBackgroundOrigin(origin) {
    this.config.backgroundImage = {
      ...this.config.backgroundImage,
      origin: origin
    };
    this._emitChange();
  }

  /**
   * Set background clip
   * @param {string} clip - CSS background-clip value
   * @returns {void}
   */
  setBackgroundClip(clip) {
    this.config.backgroundImage = {
      ...this.config.backgroundImage,
      clip: clip
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
    styles.backgroundColor = this.rgbaToString(bg.rgba);

    // Background image (if set)
    if (bgImg.src) {
      styles.backgroundImage = `url('${bgImg.src}')`;
      styles.backgroundPosition = bgImg.position;
      styles.backgroundSize = bgImg.size;
      styles.backgroundRepeat = bgImg.repeat;
      styles.backgroundBlendMode = bgImg.blendMode;
      styles.backgroundAttachment = bgImg.attachment;
      styles.backgroundOrigin = bgImg.origin;
      styles.backgroundClip = bgImg.clip;
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

  /**
   * Build CSS custom properties for opacity support
   * @returns {string} CSS custom properties string
   */
  buildCssVariables() {
    const bgImg = this.config.backgroundImage;
    const vars = [];

    if (bgImg.src) {
      vars.push(`--bg-image: url('${bgImg.src}')`);
      vars.push(`--bg-position: ${bgImg.position}`);
      vars.push(`--bg-size: ${bgImg.size}`);
      vars.push(`--bg-repeat: ${bgImg.repeat}`);
      vars.push(`--bg-opacity: ${bgImg.opacity}`);
    }

    return vars.join('; ');
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

    const bg = this.config.backgroundColor;
    const bgImg = this.config.backgroundImage;
    const hasImage = bgImg.src !== null;
    const needsOpacityLayer = hasImage && bgImg.opacity < 1;

    let cardHtml;

    if (needsOpacityLayer) {
      // Use layered approach for opacity support
      cardHtml = `
        <div class="hero-card hero-card--layered"
             data-card-size="${this.config.cardSize}"
             style="background-color: ${this.rgbaToString(bg.rgba)};">
          <div class="hero-card__bg-layer"
               style="background-image: url('${bgImg.src}');
                      background-position: ${bgImg.position};
                      background-size: ${bgImg.size};
                      background-repeat: ${bgImg.repeat};
                      background-origin: ${bgImg.origin};
                      background-clip: ${bgImg.clip};
                      opacity: ${bgImg.opacity};
                      mix-blend-mode: ${bgImg.blendMode};"></div>
          <img class="hero-card__image"
               src="${HERO_IMAGE}"
               alt="Hero Product"
               draggable="false">
        </div>
      `;
    } else {
      // Standard single-element approach
      const styleString = this.buildStyleString();
      cardHtml = `
        <div class="hero-card"
             data-card-size="${this.config.cardSize}"
             style="${styleString}">
          <img class="hero-card__image"
               src="${HERO_IMAGE}"
               alt="Hero Product"
               draggable="false">
        </div>
      `;
    }

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

    const bg = this.config.backgroundColor;
    const bgImg = this.config.backgroundImage;
    const hasImage = bgImg.src !== null;
    const needsOpacityLayer = hasImage && bgImg.opacity < 1;
    const sizes = Object.keys(CARD_SIZES);

    container.innerHTML = sizes.map(size => {
      const info = CARD_SIZES[size];

      let cardHtml;
      if (needsOpacityLayer) {
        cardHtml = `
          <div class="hero-card hero-card--layered"
               data-card-size="${size}"
               style="background-color: ${this.rgbaToString(bg.rgba)};">
            <div class="hero-card__bg-layer"
                 style="background-image: url('${bgImg.src}');
                        background-position: ${bgImg.position};
                        background-size: ${bgImg.size};
                        background-repeat: ${bgImg.repeat};
                        opacity: ${bgImg.opacity};
                        mix-blend-mode: ${bgImg.blendMode};"></div>
            <img class="hero-card__image"
                 src="${HERO_IMAGE}"
                 alt="Hero Product"
                 draggable="false">
          </div>
        `;
      } else {
        const styleString = this.buildStyleString();
        cardHtml = `
          <div class="hero-card"
               data-card-size="${size}"
               style="${styleString}">
            <img class="hero-card__image"
                 src="${HERO_IMAGE}"
                 alt="Hero Product"
                 draggable="false">
          </div>
        `;
      }

      return `
        <div class="size-item">
          ${cardHtml}
          <span class="size-item__label">${size} (${info.width}x${info.height})</span>
        </div>
      `;
    }).join('');
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
    const bgImg = this.config.backgroundImage;
    const needsOpacityLayer = bgImg.src && bgImg.opacity < 1;

    const lines = ['.hero-card {'];

    if (needsOpacityLayer) {
      // Layered approach CSS
      lines.push(`  position: relative;`);
      lines.push(`  background-color: ${styles.backgroundColor};`);
      lines.push(`  overflow: hidden;`);
      lines.push('}');
      lines.push('');
      lines.push('.hero-card__bg-layer {');
      lines.push(`  position: absolute;`);
      lines.push(`  inset: 0;`);
      lines.push(`  background-image: url('${bgImg.src}');`);
      lines.push(`  background-position: ${bgImg.position};`);
      lines.push(`  background-size: ${bgImg.size};`);
      lines.push(`  background-repeat: ${bgImg.repeat};`);
      lines.push(`  background-origin: ${bgImg.origin};`);
      lines.push(`  background-clip: ${bgImg.clip};`);
      lines.push(`  opacity: ${bgImg.opacity};`);
      lines.push(`  mix-blend-mode: ${bgImg.blendMode};`);
      lines.push(`  pointer-events: none;`);
    } else {
      // Standard approach CSS
      for (const [key, value] of Object.entries(styles)) {
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        lines.push(`  ${cssKey}: ${value};`);
      }
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
    const hasImage = bgImg.src !== null;
    const needsOpacityLayer = hasImage && bgImg.opacity < 1;

    const indent = '  ';
    const lines = [];

    if (needsOpacityLayer) {
      // Layered HTML structure
      lines.push(`<div class="hero-card"`);
      lines.push(`${indent}data-card-size="${this.config.cardSize}"`);
      lines.push(`${indent}style="background-color: ${this.rgbaToString(bg.rgba)};">`);
      lines.push(`${indent}<div class="hero-card__bg-layer"`);
      lines.push(`${indent}${indent}style="background-image: url('${bgImg.src}');`);
      lines.push(`${indent}${indent}${indent}background-position: ${bgImg.position};`);
      lines.push(`${indent}${indent}${indent}background-size: ${bgImg.size};`);
      lines.push(`${indent}${indent}${indent}background-repeat: ${bgImg.repeat};`);
      lines.push(`${indent}${indent}${indent}opacity: ${bgImg.opacity};`);
      lines.push(`${indent}${indent}${indent}mix-blend-mode: ${bgImg.blendMode};"></div>`);
      lines.push(`${indent}<img class="hero-card__image"`);
      lines.push(`${indent}${indent}src="${HERO_IMAGE}"`);
      lines.push(`${indent}${indent}alt="Hero Product">`);
      lines.push(`</div>`);
    } else {
      // Standard HTML structure
      lines.push(`<div class="hero-card"`);
      lines.push(`${indent}data-card-size="${this.config.cardSize}"`);

      const styleLines = [];
      styleLines.push(`background-color: ${this.rgbaToString(bg.rgba)}`);

      if (hasImage) {
        styleLines.push(`background-image: url('${bgImg.src}')`);
        styleLines.push(`background-position: ${bgImg.position}`);
        styleLines.push(`background-size: ${bgImg.size}`);
        styleLines.push(`background-repeat: ${bgImg.repeat}`);
        if (bgImg.blendMode !== 'normal') {
          styleLines.push(`background-blend-mode: ${bgImg.blendMode}`);
        }
        if (bgImg.attachment !== 'scroll') {
          styleLines.push(`background-attachment: ${bgImg.attachment}`);
        }
        if (bgImg.origin !== 'padding-box') {
          styleLines.push(`background-origin: ${bgImg.origin}`);
        }
        if (bgImg.clip !== 'border-box') {
          styleLines.push(`background-clip: ${bgImg.clip}`);
        }
      }

      lines.push(`${indent}style="${styleLines.join('; ')};">`);
      lines.push(`${indent}<img class="hero-card__image"`);
      lines.push(`${indent}${indent}src="${HERO_IMAGE}"`);
      lines.push(`${indent}${indent}alt="Hero Product">`);
      lines.push(`</div>`);
    }

    return lines.join('\n');
  }

  /**
   * Get Angular template output
   * @returns {string} Angular template HTML
   */
  getAngularTemplate() {
    const lines = [];
    lines.push(`<div class="hero-card"`);
    lines.push(`  [attr.data-card-size]="config.cardSize"`);
    lines.push(`  [ngStyle]="getCardStyles()">`);
    lines.push(`  <div *ngIf="needsOpacityLayer"`);
    lines.push(`    class="hero-card__bg-layer"`);
    lines.push(`    [ngStyle]="getBgLayerStyles()"></div>`);
    lines.push(`  <img class="hero-card__image"`);
    lines.push(`    [src]="heroImageSrc"`);
    lines.push(`    alt="Hero Product">`);
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
