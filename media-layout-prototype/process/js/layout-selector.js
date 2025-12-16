/**
 * Layout Selector UI Components
 * Provides constraint-aware selection controls for media layouts
 */

/**
 * LayoutSelector class - Main controller for all layout selection UI
 */
class LayoutSelector {
  constructor(options = {}) {
    this.config = {
      cardSize: '2x2',
      imageCount: 3,
      layoutType: 'horizontal',
      emphasis: 'equal',
      direction: 'normal',
      ...options
    };

    this.containers = {
      imageCount: null,
      layoutType: null,
      emphasis: null,
      direction: null
    };

    this.onChange = options.onChange || null;

    // Bind methods
    this.handleImageCountChange = this.handleImageCountChange.bind(this);
    this.handleLayoutTypeChange = this.handleLayoutTypeChange.bind(this);
    this.handleEmphasisChange = this.handleEmphasisChange.bind(this);
    this.handleDirectionChange = this.handleDirectionChange.bind(this);
  }

  /**
   * Initialize all selectors
   * @param {Object} containers - Container elements for each selector
   */
  init(containers) {
    this.containers = containers;
    this.renderAll();
  }

  /**
   * Render all selector components
   */
  renderAll() {
    this.renderImageCountSelector();
    this.renderLayoutTypeSelector();
    this.renderEmphasisSelector();
    this.renderDirectionSelector();
  }

  /**
   * Update card size and re-validate all selections
   * @param {string} newCardSize
   */
  setCardSize(newCardSize) {
    this.config.cardSize = newCardSize;

    // Validate and reset if needed
    const maxImages = getMaxImages(newCardSize);
    if (this.config.imageCount > maxImages) {
      this.config.imageCount = maxImages;
    }

    const allowedLayouts = getAllowedLayouts(newCardSize);
    if (!allowedLayouts.includes(this.config.layoutType)) {
      this.config.layoutType = getDefaultLayout(newCardSize);
    }

    // Re-validate emphasis for center option
    if (this.config.emphasis === 'center' && this.config.imageCount < 3) {
      this.config.emphasis = 'equal';
    }

    this.renderAll();
    this.emitChange();
  }

  /**
   * Get current configuration
   * @returns {Object}
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * Set full configuration
   * @param {Object} newConfig
   */
  setConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.renderAll();
  }

  /**
   * Emit change event
   */
  emitChange() {
    if (this.onChange) {
      this.onChange(this.getConfig());
    }
  }

  // ============================================================================
  // Image Count Selector
  // ============================================================================

  renderImageCountSelector() {
    const container = this.containers.imageCount;
    if (!container) return;

    const maxImages = getMaxImages(this.config.cardSize);
    const buttons = [];

    for (let i = 1; i <= 5; i++) {
      const isValid = i <= maxImages;
      const isSelected = i === this.config.imageCount;

      buttons.push(`
        <button
          class="image-count-btn ${isSelected ? 'image-count-btn--selected' : ''} ${!isValid ? 'image-count-btn--hidden' : ''}"
          data-count="${i}"
          ${!isValid ? 'disabled' : ''}
          aria-label="${i} image${i > 1 ? 's' : ''}"
        >
          ${i}
        </button>
      `);
    }

    container.innerHTML = `
      <div class="image-count-selector">
        <div class="image-count-buttons">
          ${buttons.join('')}
        </div>
        <span class="image-count-label">images (max ${maxImages})</span>
      </div>
    `;

    // Add event listeners
    container.querySelectorAll('.image-count-btn:not([disabled])').forEach(btn => {
      btn.addEventListener('click', () => {
        this.handleImageCountChange(parseInt(btn.dataset.count));
      });
    });
  }

  handleImageCountChange(count) {
    if (count === this.config.imageCount) return;

    this.config.imageCount = count;

    // Re-validate emphasis for center option
    if (this.config.emphasis === 'center' && count < 3) {
      this.config.emphasis = 'equal';
    }

    this.renderImageCountSelector();
    this.renderEmphasisSelector();
    this.emitChange();
  }

  // ============================================================================
  // Layout Type Selector
  // ============================================================================

  renderLayoutTypeSelector() {
    const container = this.containers.layoutType;
    if (!container) return;

    const allowedLayouts = getAllowedLayouts(this.config.cardSize);
    const defaultLayout = getDefaultLayout(this.config.cardSize);

    const layoutConfigs = [
      {
        type: 'horizontal',
        label: 'Horizontal',
        icon: this.getHorizontalIcon()
      },
      {
        type: 'vertical',
        label: 'Vertical',
        icon: this.getVerticalIcon()
      },
      {
        type: 'grid',
        label: 'Grid',
        icon: this.getGridIcon()
      }
    ];

    const cards = layoutConfigs.map(layout => {
      const isAllowed = allowedLayouts.includes(layout.type);
      const isSelected = this.config.layoutType === layout.type;
      const isRecommended = layout.type === defaultLayout;
      const disabledReason = !isAllowed ? getDisabledReason(this.config.cardSize, layout.type) : null;

      return `
        <div
          class="layout-card ${isSelected ? 'layout-card--selected' : ''} ${!isAllowed ? 'layout-card--disabled' : ''}"
          data-layout="${layout.type}"
          ${!isAllowed ? `data-tooltip="${disabledReason}"` : ''}
          role="button"
          tabindex="${isAllowed ? '0' : '-1'}"
          aria-label="${layout.label}${!isAllowed ? ' (disabled)' : ''}"
          aria-pressed="${isSelected}"
        >
          <div class="layout-card__icon">
            ${layout.icon}
          </div>
          <div class="layout-card__label">${layout.label}</div>
          ${isRecommended && isAllowed ? '<span class="layout-card__badge">Recommended</span>' : ''}
          ${!isAllowed ? `<div class="layout-card__tooltip">${disabledReason}</div>` : ''}
        </div>
      `;
    });

    container.innerHTML = `
      <div class="layout-type-selector">
        ${cards.join('')}
      </div>
    `;

    // Add event listeners
    container.querySelectorAll('.layout-card:not(.layout-card--disabled)').forEach(card => {
      card.addEventListener('click', () => {
        this.handleLayoutTypeChange(card.dataset.layout);
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.handleLayoutTypeChange(card.dataset.layout);
        }
      });
    });
  }

  handleLayoutTypeChange(layoutType) {
    if (layoutType === this.config.layoutType) return;

    this.config.layoutType = layoutType;
    this.renderLayoutTypeSelector();
    this.emitChange();
  }

  getHorizontalIcon() {
    return `
      <svg width="40" height="24" viewBox="0 0 40 24" fill="currentColor">
        <rect x="1" y="4" width="11" height="16" rx="2" />
        <rect x="14" y="4" width="11" height="16" rx="2" />
        <rect x="27" y="4" width="11" height="16" rx="2" />
      </svg>
    `;
  }

  getVerticalIcon() {
    return `
      <svg width="24" height="40" viewBox="0 0 24 40" fill="currentColor">
        <rect x="4" y="1" width="16" height="11" rx="2" />
        <rect x="4" y="14" width="16" height="11" rx="2" />
        <rect x="4" y="27" width="16" height="11" rx="2" />
      </svg>
    `;
  }

  getGridIcon() {
    return `
      <svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor">
        <rect x="1" y="1" width="13" height="13" rx="2" />
        <rect x="18" y="1" width="13" height="13" rx="2" />
        <rect x="1" y="18" width="13" height="13" rx="2" />
        <rect x="18" y="18" width="13" height="13" rx="2" />
      </svg>
    `;
  }

  // ============================================================================
  // Emphasis Selector
  // ============================================================================

  renderEmphasisSelector() {
    const container = this.containers.emphasis;
    if (!container) return;

    const emphasisOptions = [
      { value: 'equal', label: 'Equal', pattern: this.getEqualPattern() },
      { value: 'first', label: 'First', pattern: this.getFirstPattern() },
      { value: 'last', label: 'Last', pattern: this.getLastPattern() },
      { value: 'center', label: 'Center', pattern: this.getCenterPattern(), minImages: 3 }
    ];

    const options = emphasisOptions.map(opt => {
      const isDisabled = opt.minImages && this.config.imageCount < opt.minImages;
      const isSelected = this.config.emphasis === opt.value;

      return `
        <label class="emphasis-option ${isSelected ? 'emphasis-option--selected' : ''} ${isDisabled ? 'emphasis-option--disabled' : ''}">
          <input
            type="radio"
            name="emphasis"
            value="${opt.value}"
            ${isSelected ? 'checked' : ''}
            ${isDisabled ? 'disabled' : ''}
          />
          <span class="emphasis-option__pattern">${opt.pattern}</span>
          <span class="emphasis-option__label">${opt.label}</span>
          ${isDisabled ? '<span class="emphasis-option__hint">3+ images</span>' : ''}
        </label>
      `;
    });

    container.innerHTML = `
      <div class="emphasis-selector">
        ${options.join('')}
      </div>
    `;

    // Add event listeners
    container.querySelectorAll('input[name="emphasis"]').forEach(input => {
      input.addEventListener('change', () => {
        this.handleEmphasisChange(input.value);
      });
    });
  }

  handleEmphasisChange(emphasis) {
    if (emphasis === this.config.emphasis) return;

    this.config.emphasis = emphasis;
    this.renderEmphasisSelector();
    this.emitChange();
  }

  getEqualPattern() {
    return `
      <svg width="32" height="16" viewBox="0 0 32 16" fill="currentColor">
        <rect x="1" y="1" width="9" height="14" rx="1" opacity="0.6" />
        <rect x="12" y="1" width="9" height="14" rx="1" opacity="0.6" />
        <rect x="23" y="1" width="8" height="14" rx="1" opacity="0.6" />
      </svg>
    `;
  }

  getFirstPattern() {
    return `
      <svg width="32" height="16" viewBox="0 0 32 16" fill="currentColor">
        <rect x="1" y="1" width="14" height="14" rx="1" opacity="1" />
        <rect x="17" y="1" width="6" height="14" rx="1" opacity="0.4" />
        <rect x="25" y="1" width="6" height="14" rx="1" opacity="0.4" />
      </svg>
    `;
  }

  getLastPattern() {
    return `
      <svg width="32" height="16" viewBox="0 0 32 16" fill="currentColor">
        <rect x="1" y="1" width="6" height="14" rx="1" opacity="0.4" />
        <rect x="9" y="1" width="6" height="14" rx="1" opacity="0.4" />
        <rect x="17" y="1" width="14" height="14" rx="1" opacity="1" />
      </svg>
    `;
  }

  getCenterPattern() {
    return `
      <svg width="32" height="16" viewBox="0 0 32 16" fill="currentColor">
        <rect x="1" y="1" width="6" height="14" rx="1" opacity="0.4" />
        <rect x="9" y="1" width="14" height="14" rx="1" opacity="1" />
        <rect x="25" y="1" width="6" height="14" rx="1" opacity="0.4" />
      </svg>
    `;
  }

  // ============================================================================
  // Direction Selector
  // ============================================================================

  renderDirectionSelector() {
    const container = this.containers.direction;
    if (!container) return;

    container.innerHTML = `
      <div class="direction-selector">
        <button
          class="direction-btn ${this.config.direction === 'normal' ? 'direction-btn--selected' : ''}"
          data-direction="normal"
          aria-pressed="${this.config.direction === 'normal'}"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M1 8h12M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Normal</span>
        </button>
        <button
          class="direction-btn ${this.config.direction === 'flip' ? 'direction-btn--selected' : ''}"
          data-direction="flip"
          aria-pressed="${this.config.direction === 'flip'}"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M15 8H3M7 4L3 8l4 4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Flip</span>
        </button>
      </div>
    `;

    // Add event listeners
    container.querySelectorAll('.direction-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.handleDirectionChange(btn.dataset.direction);
      });
    });
  }

  handleDirectionChange(direction) {
    if (direction === this.config.direction) return;

    this.config.direction = direction;
    this.renderDirectionSelector();
    this.emitChange();
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Destroy the selector and clean up
   */
  destroy() {
    Object.values(this.containers).forEach(container => {
      if (container) {
        container.innerHTML = '';
      }
    });
    this.containers = {};
  }
}

// Export for use in other modules (Node.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LayoutSelector };
}
