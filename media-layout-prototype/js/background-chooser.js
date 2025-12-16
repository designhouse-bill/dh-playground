/**
 * Background Chooser Component
 * Matches the hero-background prototype "Current State" controls
 * With Color Type, RGBA, Position, Size, Repeat
 */

class BackgroundChooser {
  constructor(options = {}) {
    this.container = null;

    // Current state - matches hero-background config structure
    this.config = {
      backgroundColor: {
        type: options.colorType || 'solid', // 'solid' or 'transparent'
        hexCode: options.hexCode || '#ffffff',
        red: options.red || 255,
        green: options.green || 255,
        blue: options.blue || 255,
        alpha: options.alpha || 100
      },
      backgroundImage: {
        imageHref: options.imageHref || null,
        imageName: options.imageName || null,
        position: options.position || 'center center',
        size: options.size || 'cover',
        repeat: options.repeat || 'no-repeat'
      }
    };

    // Initialize from legacy format if provided
    if (options.type && options.value) {
      this.updateFromState(options.type, options.value);
    }

    // Sample background images from assets folder
    this.sampleImages = [
      { id: 'wood-grain', name: 'Wood Grain', url: 'process/assets/Wood_Grain_BG.jpg' },
      { id: 'wood', name: 'Wood', url: 'process/assets/wood-BG.png' },
      { id: 'wood-table', name: 'Wood Table', url: 'process/assets/wood-table_BG.png' },
      { id: 'stone', name: 'Stone', url: 'process/assets/stone-BG.jpg' },
      { id: 'diagonal', name: 'Diagonal', url: 'process/assets/diagonal_BG.png' },
      { id: 'polka-dots', name: 'Polka Dots', url: 'process/assets/polka-dots_BG.png' }
    ];

    // Position options
    this.positionOptions = [
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

    // Size options
    this.sizeOptions = [
      { value: 'cover', label: 'Cover' },
      { value: 'contain', label: 'Contain' },
      { value: 'auto', label: 'Auto' },
      { value: '100% 100%', label: '100%' },
      { value: '50% 50%', label: '50%' }
    ];

    // Repeat options
    this.repeatOptions = [
      { value: 'no-repeat', label: 'No Repeat' },
      { value: 'repeat', label: 'Repeat' },
      { value: 'repeat-x', label: 'Repeat-X' },
      { value: 'repeat-y', label: 'Repeat-Y' }
    ];

    // Callbacks
    this.onChange = options.onChange || (() => {});

    // Bind methods
    this.render = this.render.bind(this);
    this.updatePreview = this.updatePreview.bind(this);
  }

  /**
   * Initialize the component
   */
  init(containerElement) {
    this.container = containerElement;
    this.render();
  }

  /**
   * Convert hex to RGB
   */
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 255, g: 255, b: 255 };
  }

  /**
   * Convert RGB to hex
   */
  rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = Math.max(0, Math.min(255, x)).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  /**
   * Set background color from hex
   */
  setColorHex(hex) {
    const rgb = this.hexToRgb(hex);
    this.config.backgroundColor.hexCode = hex;
    this.config.backgroundColor.red = rgb.r;
    this.config.backgroundColor.green = rgb.g;
    this.config.backgroundColor.blue = rgb.b;
    this.config.backgroundColor.type = 'solid';
    this.notifyChange();
  }

  /**
   * Set background color from RGBA
   */
  setColorRgba(r, g, b, a) {
    this.config.backgroundColor.red = r;
    this.config.backgroundColor.green = g;
    this.config.backgroundColor.blue = b;
    this.config.backgroundColor.alpha = a;
    this.config.backgroundColor.hexCode = this.rgbToHex(r, g, b);
    this.config.backgroundColor.type = a === 0 ? 'transparent' : 'solid';
    this.notifyChange();
  }

  /**
   * Set transparent
   */
  setTransparent() {
    this.config.backgroundColor.type = 'transparent';
    this.config.backgroundColor.alpha = 0;
    this.notifyChange();
  }

  /**
   * Reset to white
   */
  resetColor() {
    this.config.backgroundColor = {
      type: 'solid',
      hexCode: '#ffffff',
      red: 255,
      green: 255,
      blue: 255,
      alpha: 100
    };
    this.notifyChange();
  }

  /**
   * Set background image
   */
  setImage(url, name) {
    this.config.backgroundImage.imageHref = url;
    this.config.backgroundImage.imageName = name;
    this.notifyChange();
  }

  /**
   * Clear background image
   */
  clearImage() {
    this.config.backgroundImage.imageHref = null;
    this.config.backgroundImage.imageName = null;
    this.notifyChange();
  }

  /**
   * Set image position
   */
  setPosition(position) {
    this.config.backgroundImage.position = position;
    this.notifyChange();
  }

  /**
   * Set image size
   */
  setSize(size) {
    this.config.backgroundImage.size = size;
    this.notifyChange();
  }

  /**
   * Set image repeat
   */
  setRepeat(repeat) {
    this.config.backgroundImage.repeat = repeat;
    this.notifyChange();
  }

  /**
   * Notify change callback
   */
  notifyChange() {
    // Call with legacy format for AppState compatibility
    const appStateConfig = this.getAppStateConfig();
    this.onChange(appStateConfig.type, appStateConfig.value);
    this.updatePreview();
  }

  /**
   * Get CSS string for background
   */
  getCssString() {
    const bg = this.config.backgroundColor;
    const img = this.config.backgroundImage;

    let css = '';

    // Background color
    if (bg.type === 'transparent') {
      css += 'background-color: transparent;';
    } else {
      if (bg.alpha < 100) {
        css += `background-color: rgba(${bg.red}, ${bg.green}, ${bg.blue}, ${bg.alpha / 100});`;
      } else {
        css += `background-color: ${bg.hexCode};`;
      }
    }

    // Background image
    if (img.imageHref) {
      css += ` background-image: url('${img.imageHref}');`;
      css += ` background-position: ${img.position};`;
      css += ` background-size: ${img.size};`;
      css += ` background-repeat: ${img.repeat};`;
    }

    return css;
  }

  /**
   * Get configuration for AppState
   */
  getAppStateConfig() {
    const bg = this.config.backgroundColor;
    const img = this.config.backgroundImage;

    if (img.imageHref) {
      return { type: 'image', value: img.imageHref };
    } else if (bg.type === 'transparent') {
      return { type: 'color', value: 'transparent' };
    } else if (bg.alpha < 100) {
      return { type: 'color', value: `rgba(${bg.red}, ${bg.green}, ${bg.blue}, ${bg.alpha / 100})` };
    } else {
      return { type: 'color', value: bg.hexCode };
    }
  }

  /**
   * Update from external state
   */
  updateFromState(type, value) {
    if (type === 'image') {
      this.config.backgroundImage.imageHref = value;
    } else if (value === 'transparent') {
      this.config.backgroundColor.type = 'transparent';
      this.config.backgroundColor.alpha = 0;
    } else if (value && value.startsWith('rgba')) {
      const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)/);
      if (match) {
        this.config.backgroundColor.red = parseInt(match[1]);
        this.config.backgroundColor.green = parseInt(match[2]);
        this.config.backgroundColor.blue = parseInt(match[3]);
        this.config.backgroundColor.alpha = match[4] ? Math.round(parseFloat(match[4]) * 100) : 100;
        this.config.backgroundColor.hexCode = this.rgbToHex(
          this.config.backgroundColor.red,
          this.config.backgroundColor.green,
          this.config.backgroundColor.blue
        );
        this.config.backgroundColor.type = 'solid';
      }
    } else if (value) {
      this.config.backgroundColor.hexCode = value;
      const rgb = this.hexToRgb(value);
      this.config.backgroundColor.red = rgb.r;
      this.config.backgroundColor.green = rgb.g;
      this.config.backgroundColor.blue = rgb.b;
      this.config.backgroundColor.alpha = 100;
      this.config.backgroundColor.type = 'solid';
    }
    this.render();
  }

  /**
   * Update preview thumbnail
   */
  updatePreview() {
    const preview = this.container?.querySelector('.bg-chooser__preview');
    if (preview) {
      preview.style.cssText = this.getCssString();
    }
  }

  /**
   * Render the component - matches hero-background "Current State" layout
   */
  render() {
    if (!this.container) return;

    const bg = this.config.backgroundColor;
    const img = this.config.backgroundImage;

    this.container.innerHTML = `
      <div class="background-chooser">
        <!-- Background Color Section -->
        <div class="bg-chooser__section">
          <label class="bg-chooser__label">Background Color</label>
          <select class="bg-chooser__select" id="bg-color-type">
            <option value="solid" ${bg.type === 'solid' ? 'selected' : ''}>Solid</option>
            <option value="transparent" ${bg.type === 'transparent' ? 'selected' : ''}>Transparent</option>
          </select>

          <!-- Color Picker + Hex -->
          <div class="bg-chooser__color-row">
            <input type="color" id="bg-color-picker" class="bg-chooser__color-input"
                   value="${bg.hexCode}" ${bg.type === 'transparent' ? 'disabled' : ''}>
            <input type="text" id="bg-hex-input" class="bg-chooser__hex-input"
                   value="${bg.hexCode.toUpperCase()}" placeholder="#FFFFFF"
                   ${bg.type === 'transparent' ? 'disabled' : ''}>
          </div>

          <!-- RGBA Inputs -->
          <div class="bg-chooser__rgba-grid">
            <div class="bg-chooser__rgba-item">
              <label class="bg-chooser__rgba-label">R</label>
              <input type="number" id="bg-color-r" class="bg-chooser__rgba-input"
                     min="0" max="255" value="${bg.red}" ${bg.type === 'transparent' ? 'disabled' : ''}>
            </div>
            <div class="bg-chooser__rgba-item">
              <label class="bg-chooser__rgba-label">G</label>
              <input type="number" id="bg-color-g" class="bg-chooser__rgba-input"
                     min="0" max="255" value="${bg.green}" ${bg.type === 'transparent' ? 'disabled' : ''}>
            </div>
            <div class="bg-chooser__rgba-item">
              <label class="bg-chooser__rgba-label">B</label>
              <input type="number" id="bg-color-b" class="bg-chooser__rgba-input"
                     min="0" max="255" value="${bg.blue}" ${bg.type === 'transparent' ? 'disabled' : ''}>
            </div>
            <div class="bg-chooser__rgba-item">
              <label class="bg-chooser__rgba-label">A%</label>
              <input type="number" id="bg-color-a" class="bg-chooser__rgba-input"
                     min="0" max="100" value="${bg.alpha}" ${bg.type === 'transparent' ? 'disabled' : ''}>
            </div>
          </div>

          <!-- Buttons -->
          <div class="bg-chooser__buttons">
            <button class="bg-chooser__btn" id="bg-btn-transparent">
              <i class="pi pi-stop"></i> Transparent
            </button>
            <button class="bg-chooser__btn" id="bg-btn-reset">
              <i class="pi pi-refresh"></i> Reset
            </button>
          </div>
        </div>

        <!-- Background Image Section -->
        <div class="bg-chooser__section">
          <label class="bg-chooser__label">Background Image</label>

          <!-- Media Picker Placeholder -->
          <div class="bg-chooser__media-picker">
            <div class="bg-chooser__media-preview ${img.imageHref ? 'has-image' : ''}" id="bg-media-preview"
                 style="${img.imageHref ? `background-image: url('${img.imageHref}')` : ''}">
            </div>
            <div class="bg-chooser__media-buttons">
              <button class="bg-chooser__btn bg-chooser__btn--media" id="bg-btn-add-media">
                <i class="pi pi-image"></i> Replace Media
              </button>
              <button class="bg-chooser__btn bg-chooser__btn--icon" id="bg-btn-delete-media" title="Delete">
                <i class="pi pi-trash"></i>
              </button>
            </div>
          </div>

          <!-- Position Dropdown -->
          <div class="bg-chooser__control">
            <label class="bg-chooser__control-label">Position</label>
            <select class="bg-chooser__select" id="bg-position">
              ${this.positionOptions.map(opt =>
                `<option value="${opt.value}" ${img.position === opt.value ? 'selected' : ''}>${opt.label}</option>`
              ).join('')}
            </select>
          </div>

          <!-- Size Dropdown -->
          <div class="bg-chooser__control">
            <label class="bg-chooser__control-label">Size</label>
            <select class="bg-chooser__select" id="bg-size">
              ${this.sizeOptions.map(opt =>
                `<option value="${opt.value}" ${img.size === opt.value ? 'selected' : ''}>${opt.label}</option>`
              ).join('')}
            </select>
          </div>

          <!-- Repeat Dropdown -->
          <div class="bg-chooser__control">
            <label class="bg-chooser__control-label">Repeat</label>
            <select class="bg-chooser__select" id="bg-repeat">
              ${this.repeatOptions.map(opt =>
                `<option value="${opt.value}" ${img.repeat === opt.value ? 'selected' : ''}>${opt.label}</option>`
              ).join('')}
            </select>
          </div>
        </div>

        <!-- Sample Background Images -->
        <div class="bg-chooser__section">
          <label class="bg-chooser__label">Quick Backgrounds</label>
          <div class="bg-chooser__samples">
            <button class="bg-chooser__sample ${!img.imageHref ? 'selected' : ''}" data-src="" title="None">
              <span class="bg-chooser__sample-none">None</span>
            </button>
            ${this.sampleImages.map(sample => `
              <button class="bg-chooser__sample ${img.imageHref === sample.url ? 'selected' : ''}"
                      data-src="${sample.url}" data-name="${sample.name}" title="${sample.name}">
                <img src="${sample.url}" alt="${sample.name}">
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    this.setupEventListeners();
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Color type dropdown
    this.container.querySelector('#bg-color-type')?.addEventListener('change', (e) => {
      if (e.target.value === 'transparent') {
        this.setTransparent();
      } else {
        this.config.backgroundColor.type = 'solid';
        this.config.backgroundColor.alpha = 100;
        this.notifyChange();
      }
      this.render();
    });

    // Color picker
    this.container.querySelector('#bg-color-picker')?.addEventListener('input', (e) => {
      this.setColorHex(e.target.value);
      this.syncColorInputs();
    });

    // Hex input
    this.container.querySelector('#bg-hex-input')?.addEventListener('change', (e) => {
      let hex = e.target.value.trim();
      if (!hex.startsWith('#')) hex = '#' + hex;
      if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
        this.setColorHex(hex);
        this.syncColorInputs();
      }
    });

    // RGB inputs
    ['r', 'g', 'b'].forEach(channel => {
      this.container.querySelector(`#bg-color-${channel}`)?.addEventListener('input', () => {
        const r = parseInt(this.container.querySelector('#bg-color-r').value) || 0;
        const g = parseInt(this.container.querySelector('#bg-color-g').value) || 0;
        const b = parseInt(this.container.querySelector('#bg-color-b').value) || 0;
        const a = parseInt(this.container.querySelector('#bg-color-a').value) || 100;
        this.setColorRgba(r, g, b, a);
        this.syncColorInputs();
      });
    });

    // Alpha input
    this.container.querySelector('#bg-color-a')?.addEventListener('input', (e) => {
      const a = parseInt(e.target.value) || 0;
      this.config.backgroundColor.alpha = a;
      if (a === 0) {
        this.config.backgroundColor.type = 'transparent';
      } else {
        this.config.backgroundColor.type = 'solid';
      }
      this.notifyChange();
    });

    // Transparent button
    this.container.querySelector('#bg-btn-transparent')?.addEventListener('click', () => {
      this.setTransparent();
      this.render();
    });

    // Reset button
    this.container.querySelector('#bg-btn-reset')?.addEventListener('click', () => {
      this.resetColor();
      this.render();
    });

    // Add media button (scroll to samples for now)
    this.container.querySelector('#bg-btn-add-media')?.addEventListener('click', () => {
      const samples = this.container.querySelector('.bg-chooser__samples');
      samples?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    // Delete media button
    this.container.querySelector('#bg-btn-delete-media')?.addEventListener('click', () => {
      this.clearImage();
      this.render();
    });

    // Position dropdown
    this.container.querySelector('#bg-position')?.addEventListener('change', (e) => {
      this.setPosition(e.target.value);
    });

    // Size dropdown
    this.container.querySelector('#bg-size')?.addEventListener('change', (e) => {
      this.setSize(e.target.value);
    });

    // Repeat dropdown
    this.container.querySelector('#bg-repeat')?.addEventListener('change', (e) => {
      this.setRepeat(e.target.value);
    });

    // Sample background images
    this.container.querySelectorAll('.bg-chooser__sample').forEach(sample => {
      sample.addEventListener('click', () => {
        const src = sample.dataset.src;
        const name = sample.dataset.name || null;
        if (src) {
          this.setImage(src, name);
        } else {
          this.clearImage();
        }
        this.render();
      });
    });
  }

  /**
   * Sync color inputs after programmatic change
   */
  syncColorInputs() {
    const bg = this.config.backgroundColor;
    const picker = this.container?.querySelector('#bg-color-picker');
    const hex = this.container?.querySelector('#bg-hex-input');
    if (picker) picker.value = bg.hexCode;
    if (hex) hex.value = bg.hexCode.toUpperCase();
  }

  /**
   * Destroy the component
   */
  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

// Make available globally
window.BackgroundChooser = BackgroundChooser;
