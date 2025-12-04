/**
 * Adjustment Panel Component
 * Panel for editing selected image properties with sliders and inputs
 */

// Shadow presets
const SHADOW_PRESETS = {
  none: { offsetX: 0, offsetY: 0, blur: 0, spread: 0, color: '#000000', opacity: 0 },
  subtle: { offsetX: 0, offsetY: 2, blur: 4, spread: 0, color: '#000000', opacity: 10 },
  medium: { offsetX: 0, offsetY: 4, blur: 8, spread: 0, color: '#000000', opacity: 15 },
  strong: { offsetX: 0, offsetY: 8, blur: 16, spread: 0, color: '#000000', opacity: 20 },
  dramatic: { offsetX: 0, offsetY: 12, blur: 24, spread: 4, color: '#000000', opacity: 25 }
};

// Default adjustment values
const DEFAULT_ADJUSTMENTS = {
  positionX: 0,
  positionY: 0,
  scale: 1,
  rotation: 0,
  zIndex: 0,
  shadowPreset: 'none',
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  shadowBlur: 0,
  shadowSpread: 0,
  shadowColor: '#000000',
  shadowOpacity: 20,
  opacity: 100
};

/**
 * Reusable Slider-Input Component
 */
class SliderInput {
  constructor(options) {
    this.id = options.id || `slider-${Math.random().toString(36).substr(2, 9)}`;
    this.label = options.label || 'Value';
    this.min = options.min !== undefined ? options.min : 0;
    this.max = options.max !== undefined ? options.max : 100;
    this.step = options.step || 1;
    this.value = options.value !== undefined ? options.value : this.min;
    this.unit = options.unit || '';
    this.onChange = options.onChange || (() => {});

    this.element = null;
    this.slider = null;
    this.input = null;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'slider-input';
    container.id = this.id;

    container.innerHTML = `
      <div class="slider-input__header">
        <label class="slider-input__label">${this.label}</label>
        <div class="slider-input__value-wrapper">
          <input type="number"
                 class="slider-input__input"
                 min="${this.min}"
                 max="${this.max}"
                 step="${this.step}"
                 value="${this.value}">
          ${this.unit ? `<span class="slider-input__unit">${this.unit}</span>` : ''}
        </div>
      </div>
      <div class="slider-input__track-wrapper">
        <input type="range"
               class="slider-input__slider"
               min="${this.min}"
               max="${this.max}"
               step="${this.step}"
               value="${this.value}">
        <div class="slider-input__track"></div>
        <div class="slider-input__fill" style="width: ${this._getFilledPercent()}%"></div>
      </div>
    `;

    this.element = container;
    this.slider = container.querySelector('.slider-input__slider');
    this.input = container.querySelector('.slider-input__input');
    this.fill = container.querySelector('.slider-input__fill');

    this._attachEvents();
    return container;
  }

  _attachEvents() {
    // Slider change
    this.slider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      this._setValue(value, 'slider');
    });

    // Input change
    this.input.addEventListener('input', (e) => {
      let value = parseFloat(e.target.value);
      if (isNaN(value)) return;

      // Clamp value
      const clamped = Math.min(Math.max(value, this.min), this.max);
      if (value !== clamped) {
        this._shake();
        value = clamped;
        e.target.value = value;
      }

      this._setValue(value, 'input');
    });

    // Input blur - ensure valid value
    this.input.addEventListener('blur', (e) => {
      let value = parseFloat(e.target.value);
      if (isNaN(value)) value = this.min;
      value = Math.min(Math.max(value, this.min), this.max);
      this._setValue(value, 'input');
    });

    // Keyboard: arrow keys
    this.input.addEventListener('keydown', (e) => {
      const increment = e.shiftKey ? this.step * 10 : this.step;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const newValue = Math.min(this.value + increment, this.max);
        this._setValue(newValue, 'keyboard');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const newValue = Math.max(this.value - increment, this.min);
        this._setValue(newValue, 'keyboard');
      }
    });
  }

  _setValue(value, source) {
    // Round to step precision
    const precision = this._getPrecision();
    this.value = parseFloat(value.toFixed(precision));

    // Update UI
    if (source !== 'slider') {
      this.slider.value = this.value;
    }
    if (source !== 'input' && source !== 'keyboard') {
      this.input.value = this.value;
    }

    this._updateFill();
    this.onChange(this.value);
  }

  _updateFill() {
    if (this.fill) {
      this.fill.style.width = `${this._getFilledPercent()}%`;
    }
  }

  _getFilledPercent() {
    return ((this.value - this.min) / (this.max - this.min)) * 100;
  }

  _getPrecision() {
    const stepStr = this.step.toString();
    const decimal = stepStr.indexOf('.');
    return decimal === -1 ? 0 : stepStr.length - decimal - 1;
  }

  _shake() {
    this.input.classList.add('slider-input__input--shake');
    setTimeout(() => {
      this.input.classList.remove('slider-input__input--shake');
    }, 300);
  }

  getValue() {
    return this.value;
  }

  setValue(value, triggerChange = false) {
    this.value = Math.min(Math.max(value, this.min), this.max);
    this.slider.value = this.value;
    this.input.value = this.value;
    this._updateFill();

    if (triggerChange) {
      this.onChange(this.value);
    }
  }

  setDisabled(disabled) {
    this.slider.disabled = disabled;
    this.input.disabled = disabled;
    this.element.classList.toggle('slider-input--disabled', disabled);
  }
}

/**
 * Adjustment Panel Class
 */
class AdjustmentPanel {
  constructor(options = {}) {
    this.container = null;
    this.selectedItem = null;
    this.selectedIndex = -1;
    this.totalItems = 0;
    this.adjustments = { ...DEFAULT_ADJUSTMENTS };
    this.customShadowExpanded = false;

    // Callbacks
    this.onChange = options.onChange || (() => {});
    this.onStackingChange = options.onStackingChange || (() => {});

    // Slider controls map
    this.sliders = {};
  }

  /**
   * Initialize the panel in a container
   */
  init(container) {
    this.container = typeof container === 'string'
      ? document.getElementById(container)
      : container;

    if (!this.container) {
      console.error('AdjustmentPanel: Container not found');
      return;
    }

    this.render();
  }

  /**
   * Render the panel
   */
  render() {
    if (!this.container) return;

    this.container.innerHTML = '';
    this.container.className = 'adjustment-panel';

    if (!this.selectedItem) {
      this._renderNoSelection();
    } else {
      this._renderPanel();
    }
  }

  /**
   * Render no selection placeholder
   */
  _renderNoSelection() {
    const placeholder = document.createElement('div');
    placeholder.className = 'adjustment-panel__placeholder';
    placeholder.innerHTML = `
      <div class="adjustment-panel__placeholder-icon">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="8" y="8" width="32" height="32" rx="4" />
          <circle cx="18" cy="18" r="4" />
          <path d="M8 32 L18 22 L28 32 L40 20" />
        </svg>
      </div>
      <p class="adjustment-panel__placeholder-text">Select an image to edit</p>
    `;
    this.container.appendChild(placeholder);
  }

  /**
   * Render the full panel
   */
  _renderPanel() {
    // Header
    const header = this._createHeader();
    this.container.appendChild(header);

    // Sections wrapper
    const sections = document.createElement('div');
    sections.className = 'adjustment-panel__sections';

    // Position Section
    sections.appendChild(this._createPositionSection());

    // Transform Section
    sections.appendChild(this._createTransformSection());

    // Stacking Section
    sections.appendChild(this._createStackingSection());

    // Shadow Section
    sections.appendChild(this._createShadowSection());

    // Opacity Section
    sections.appendChild(this._createOpacitySection());

    this.container.appendChild(sections);
  }

  /**
   * Create panel header
   */
  _createHeader() {
    const header = document.createElement('div');
    header.className = 'adjustment-panel__header';

    header.innerHTML = `
      <div class="adjustment-panel__item-info">
        <div class="adjustment-panel__thumbnail">
          <img src="${this.selectedItem.image}" alt="${this.selectedItem.name}" />
        </div>
        <div class="adjustment-panel__item-details">
          <span class="adjustment-panel__item-name">${this.selectedItem.name}</span>
          <span class="adjustment-panel__item-position">Item ${this.selectedIndex + 1} of ${this.totalItems}</span>
        </div>
      </div>
      <button class="adjustment-panel__reset-btn" title="Reset to defaults">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 3a5 5 0 00-4.546 2.914.5.5 0 01-.908-.418A6 6 0 118 14a5.972 5.972 0 01-4.546-2.086l-.354.354a.5.5 0 01-.853-.354V9.5a.5.5 0 01.5-.5h2.414a.5.5 0 01.354.854l-.354.353A4.973 4.973 0 008 13a5 5 0 000-10z"/>
        </svg>
        Reset
      </button>
    `;

    const resetBtn = header.querySelector('.adjustment-panel__reset-btn');
    resetBtn.addEventListener('click', () => this._resetAdjustments());

    return header;
  }

  /**
   * Create position section
   */
  _createPositionSection() {
    const section = this._createSection('Position');

    const posX = new SliderInput({
      id: 'adjust-pos-x',
      label: 'X Position',
      min: -100,
      max: 100,
      step: 1,
      value: this.adjustments.positionX,
      unit: '%',
      onChange: (value) => this._handleChange('positionX', value)
    });

    const posY = new SliderInput({
      id: 'adjust-pos-y',
      label: 'Y Position',
      min: -100,
      max: 100,
      step: 1,
      value: this.adjustments.positionY,
      unit: '%',
      onChange: (value) => this._handleChange('positionY', value)
    });

    this.sliders.positionX = posX;
    this.sliders.positionY = posY;

    section.appendChild(posX.render());
    section.appendChild(posY.render());

    return section;
  }

  /**
   * Create transform section
   */
  _createTransformSection() {
    const section = this._createSection('Transform');

    const scale = new SliderInput({
      id: 'adjust-scale',
      label: 'Scale',
      min: 0.5,
      max: 2.0,
      step: 0.05,
      value: this.adjustments.scale,
      unit: '\u00d7',
      onChange: (value) => this._handleChange('scale', value)
    });

    const rotation = new SliderInput({
      id: 'adjust-rotation',
      label: 'Rotation',
      min: 0,
      max: 360,
      step: 1,
      value: this.adjustments.rotation,
      unit: '\u00b0',
      onChange: (value) => this._handleChange('rotation', value)
    });

    this.sliders.scale = scale;
    this.sliders.rotation = rotation;

    section.appendChild(scale.render());
    section.appendChild(rotation.render());

    return section;
  }

  /**
   * Create stacking section
   */
  _createStackingSection() {
    const section = this._createSection('Stacking');

    const stackingContent = document.createElement('div');
    stackingContent.className = 'stacking-controls';

    const currentLayer = this.adjustments.zIndex + 1;

    stackingContent.innerHTML = `
      <div class="stacking-controls__indicator">
        <span class="stacking-controls__layer-text">Layer ${currentLayer} of ${this.totalItems}</span>
      </div>
      <div class="stacking-controls__buttons">
        <button class="stacking-btn" data-action="back" title="Send to Back" ${currentLayer === 1 ? 'disabled' : ''}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 14l-6-6h4V2h4v6h4l-6 6z"/>
            <path d="M2 14h12v1H2z"/>
          </svg>
        </button>
        <button class="stacking-btn" data-action="backward" title="Send Backward" ${currentLayer === 1 ? 'disabled' : ''}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 12l-5-5h3V3h4v4h3l-5 5z"/>
          </svg>
        </button>
        <button class="stacking-btn" data-action="forward" title="Bring Forward" ${currentLayer === this.totalItems ? 'disabled' : ''}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 4l5 5h-3v4H6V9H3l5-5z"/>
          </svg>
        </button>
        <button class="stacking-btn" data-action="front" title="Bring to Front" ${currentLayer === this.totalItems ? 'disabled' : ''}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 2l6 6h-4v6H6V8H2l6-6z"/>
            <path d="M2 1h12v1H2z"/>
          </svg>
        </button>
      </div>
    `;

    stackingContent.querySelectorAll('.stacking-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!btn.disabled) {
          this.onStackingChange(btn.dataset.action, this.selectedIndex);
        }
      });
    });

    section.appendChild(stackingContent);
    return section;
  }

  /**
   * Create shadow section
   */
  _createShadowSection() {
    const section = this._createSection('Shadow');

    // Preset buttons
    const presets = document.createElement('div');
    presets.className = 'shadow-presets';

    Object.keys(SHADOW_PRESETS).forEach(preset => {
      const btn = document.createElement('button');
      btn.className = `shadow-preset-btn ${this.adjustments.shadowPreset === preset ? 'shadow-preset-btn--selected' : ''}`;
      btn.dataset.preset = preset;
      btn.textContent = preset.charAt(0).toUpperCase() + preset.slice(1);
      btn.addEventListener('click', () => this._selectShadowPreset(preset));
      presets.appendChild(btn);
    });

    section.appendChild(presets);

    // Custom expandable section
    const customToggle = document.createElement('button');
    customToggle.className = `shadow-custom-toggle ${this.customShadowExpanded ? 'shadow-custom-toggle--expanded' : ''}`;
    customToggle.innerHTML = `
      <span>Custom Shadow</span>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M4 6l4 4 4-4H4z"/>
      </svg>
    `;
    customToggle.addEventListener('click', () => this._toggleCustomShadow());
    section.appendChild(customToggle);

    // Custom shadow controls
    const customControls = document.createElement('div');
    customControls.className = `shadow-custom-controls ${this.customShadowExpanded ? 'shadow-custom-controls--expanded' : ''}`;

    const shadowOffsetX = new SliderInput({
      id: 'shadow-offset-x',
      label: 'Offset X',
      min: -50,
      max: 50,
      step: 1,
      value: this.adjustments.shadowOffsetX,
      unit: 'px',
      onChange: (value) => this._handleShadowChange('shadowOffsetX', value)
    });

    const shadowOffsetY = new SliderInput({
      id: 'shadow-offset-y',
      label: 'Offset Y',
      min: -50,
      max: 50,
      step: 1,
      value: this.adjustments.shadowOffsetY,
      unit: 'px',
      onChange: (value) => this._handleShadowChange('shadowOffsetY', value)
    });

    const shadowBlur = new SliderInput({
      id: 'shadow-blur',
      label: 'Blur',
      min: 0,
      max: 100,
      step: 1,
      value: this.adjustments.shadowBlur,
      unit: 'px',
      onChange: (value) => this._handleShadowChange('shadowBlur', value)
    });

    const shadowSpread = new SliderInput({
      id: 'shadow-spread',
      label: 'Spread',
      min: -20,
      max: 50,
      step: 1,
      value: this.adjustments.shadowSpread,
      unit: 'px',
      onChange: (value) => this._handleShadowChange('shadowSpread', value)
    });

    const shadowOpacity = new SliderInput({
      id: 'shadow-opacity',
      label: 'Shadow Opacity',
      min: 0,
      max: 100,
      step: 1,
      value: this.adjustments.shadowOpacity,
      unit: '%',
      onChange: (value) => this._handleShadowChange('shadowOpacity', value)
    });

    this.sliders.shadowOffsetX = shadowOffsetX;
    this.sliders.shadowOffsetY = shadowOffsetY;
    this.sliders.shadowBlur = shadowBlur;
    this.sliders.shadowSpread = shadowSpread;
    this.sliders.shadowOpacity = shadowOpacity;

    customControls.appendChild(shadowOffsetX.render());
    customControls.appendChild(shadowOffsetY.render());
    customControls.appendChild(shadowBlur.render());
    customControls.appendChild(shadowSpread.render());

    // Color picker row
    const colorRow = document.createElement('div');
    colorRow.className = 'shadow-color-row';
    colorRow.innerHTML = `
      <label class="slider-input__label">Color</label>
      <div class="shadow-color-picker">
        <input type="color" id="shadow-color" value="${this.adjustments.shadowColor}" />
        <span class="shadow-color-value">${this.adjustments.shadowColor}</span>
      </div>
    `;
    const colorInput = colorRow.querySelector('#shadow-color');
    const colorValue = colorRow.querySelector('.shadow-color-value');
    colorInput.addEventListener('input', (e) => {
      colorValue.textContent = e.target.value;
      this._handleShadowChange('shadowColor', e.target.value);
    });
    customControls.appendChild(colorRow);

    customControls.appendChild(shadowOpacity.render());

    section.appendChild(customControls);
    this.customControlsEl = customControls;

    return section;
  }

  /**
   * Create opacity section
   */
  _createOpacitySection() {
    const section = this._createSection('Opacity');

    const opacity = new SliderInput({
      id: 'adjust-opacity',
      label: 'Opacity',
      min: 0,
      max: 100,
      step: 1,
      value: this.adjustments.opacity,
      unit: '%',
      onChange: (value) => this._handleChange('opacity', value)
    });

    this.sliders.opacity = opacity;
    section.appendChild(opacity.render());

    return section;
  }

  /**
   * Create a section container
   */
  _createSection(title) {
    const section = document.createElement('div');
    section.className = 'adjustment-panel__section';

    const header = document.createElement('h4');
    header.className = 'adjustment-panel__section-title';
    header.textContent = title;
    section.appendChild(header);

    return section;
  }

  /**
   * Handle value change
   */
  _handleChange(property, value) {
    this.adjustments[property] = value;
    this._emitChange();
  }

  /**
   * Handle shadow property change
   */
  _handleShadowChange(property, value) {
    this.adjustments[property] = value;
    this.adjustments.shadowPreset = 'custom';

    // Update preset button states
    this.container.querySelectorAll('.shadow-preset-btn').forEach(btn => {
      btn.classList.remove('shadow-preset-btn--selected');
    });

    this._emitChange();
  }

  /**
   * Select shadow preset
   */
  _selectShadowPreset(preset) {
    this.adjustments.shadowPreset = preset;

    const values = SHADOW_PRESETS[preset];
    this.adjustments.shadowOffsetX = values.offsetX;
    this.adjustments.shadowOffsetY = values.offsetY;
    this.adjustments.shadowBlur = values.blur;
    this.adjustments.shadowSpread = values.spread;
    this.adjustments.shadowColor = values.color;
    this.adjustments.shadowOpacity = values.opacity;

    // Update UI
    this.container.querySelectorAll('.shadow-preset-btn').forEach(btn => {
      btn.classList.toggle('shadow-preset-btn--selected', btn.dataset.preset === preset);
    });

    // Update sliders if custom controls exist
    if (this.sliders.shadowOffsetX) {
      this.sliders.shadowOffsetX.setValue(values.offsetX);
      this.sliders.shadowOffsetY.setValue(values.offsetY);
      this.sliders.shadowBlur.setValue(values.blur);
      this.sliders.shadowSpread.setValue(values.spread);
      this.sliders.shadowOpacity.setValue(values.opacity);
    }

    const colorInput = this.container.querySelector('#shadow-color');
    const colorValue = this.container.querySelector('.shadow-color-value');
    if (colorInput) {
      colorInput.value = values.color;
      colorValue.textContent = values.color;
    }

    this._emitChange();
  }

  /**
   * Toggle custom shadow section
   */
  _toggleCustomShadow() {
    this.customShadowExpanded = !this.customShadowExpanded;

    const toggle = this.container.querySelector('.shadow-custom-toggle');
    const controls = this.container.querySelector('.shadow-custom-controls');

    toggle.classList.toggle('shadow-custom-toggle--expanded', this.customShadowExpanded);
    controls.classList.toggle('shadow-custom-controls--expanded', this.customShadowExpanded);
  }

  /**
   * Reset adjustments to defaults
   */
  _resetAdjustments() {
    this.adjustments = { ...DEFAULT_ADJUSTMENTS };

    // Update all sliders
    Object.entries(this.sliders).forEach(([key, slider]) => {
      if (this.adjustments[key] !== undefined) {
        slider.setValue(this.adjustments[key]);
      }
    });

    // Reset shadow preset
    this._selectShadowPreset('none');

    this._emitChange();
  }

  /**
   * Emit change event
   */
  _emitChange() {
    this.onChange({
      index: this.selectedIndex,
      adjustments: { ...this.adjustments }
    });
  }

  /**
   * Public: Set selected item
   */
  setSelectedItem(item, index, total, adjustments = null) {
    this.selectedItem = item;
    this.selectedIndex = index;
    this.totalItems = total;

    if (adjustments) {
      this.adjustments = { ...DEFAULT_ADJUSTMENTS, ...adjustments };
    } else {
      this.adjustments = { ...DEFAULT_ADJUSTMENTS };
    }

    this.render();
  }

  /**
   * Public: Clear selection
   */
  clearSelection() {
    this.selectedItem = null;
    this.selectedIndex = -1;
    this.adjustments = { ...DEFAULT_ADJUSTMENTS };
    this.render();
  }

  /**
   * Public: Update stacking layer display
   */
  updateStackingDisplay(newIndex, total) {
    this.selectedIndex = newIndex;
    this.totalItems = total;
    this.adjustments.zIndex = newIndex;

    const layerText = this.container.querySelector('.stacking-controls__layer-text');
    if (layerText) {
      layerText.textContent = `Layer ${newIndex + 1} of ${total}`;
    }

    // Update button states
    const buttons = this.container.querySelectorAll('.stacking-btn');
    buttons.forEach(btn => {
      const action = btn.dataset.action;
      if (action === 'back' || action === 'backward') {
        btn.disabled = newIndex === 0;
      } else if (action === 'front' || action === 'forward') {
        btn.disabled = newIndex === total - 1;
      }
    });
  }

  /**
   * Public: Get current adjustments
   */
  getAdjustments() {
    return { ...this.adjustments };
  }

  /**
   * Public: Convert adjustments to CSS transform values
   */
  static adjustmentsToCSS(adjustments) {
    const transforms = [];

    if (adjustments.positionX !== 0 || adjustments.positionY !== 0) {
      transforms.push(`translate(${adjustments.positionX}%, ${adjustments.positionY}%)`);
    }

    if (adjustments.scale !== 1) {
      transforms.push(`scale(${adjustments.scale})`);
    }

    if (adjustments.rotation !== 0) {
      transforms.push(`rotate(${adjustments.rotation}deg)`);
    }

    const css = {
      transform: transforms.length > 0 ? transforms.join(' ') : 'none',
      opacity: adjustments.opacity / 100,
      zIndex: adjustments.zIndex
    };

    // Box shadow
    if (adjustments.shadowPreset !== 'none' || adjustments.shadowBlur > 0 || adjustments.shadowOpacity > 0) {
      const r = parseInt(adjustments.shadowColor.slice(1, 3), 16);
      const g = parseInt(adjustments.shadowColor.slice(3, 5), 16);
      const b = parseInt(adjustments.shadowColor.slice(5, 7), 16);
      const a = adjustments.shadowOpacity / 100;

      css.boxShadow = `${adjustments.shadowOffsetX}px ${adjustments.shadowOffsetY}px ${adjustments.shadowBlur}px ${adjustments.shadowSpread}px rgba(${r}, ${g}, ${b}, ${a})`;
    } else {
      css.boxShadow = 'none';
    }

    return css;
  }
}

// Export for use
if (typeof window !== 'undefined') {
  window.AdjustmentPanel = AdjustmentPanel;
  window.SliderInput = SliderInput;
  window.SHADOW_PRESETS = SHADOW_PRESETS;
  window.DEFAULT_ADJUSTMENTS = DEFAULT_ADJUSTMENTS;
}
