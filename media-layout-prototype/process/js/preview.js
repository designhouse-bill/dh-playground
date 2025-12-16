/**
 * Preview Renderer
 * Renders images in a CSS Grid layout based on template configuration
 */

// Aspect ratios for card sizes
const CARD_ASPECT_RATIOS = {
  '1x1': '1 / 1',
  '2x1': '2 / 1',
  '1x2': '1 / 2',
  '1x3': '1 / 3',
  '2x2': '1 / 1',
  '2x3': '2 / 3',
  '3x1': '3 / 1',
  '3x2': '3 / 2',
  '3x3': '1 / 1'
};

// Shadow presets for preview (string values for CSS)
const PREVIEW_SHADOW_PRESETS = {
  none: 'none',
  subtle: '0 1px 2px rgba(0, 0, 0, 0.05)',
  medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  strong: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  dramatic: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
};

// Default sample images - using local assets instead of external placeholders
const DEFAULT_IMAGES = [
  'assets/sample-images/CocaCola_Original2Liter_large_66a21ff4-7055-4178-a532-19ab3b6374cf.png',
  'assets/sample-images/CocaCola_Cherry2Liter_large_43dd9fba-2992-4e49-aa4b-6c3b5e32a673.png',
  'assets/sample-images/CocaCola_ZeroSugar2Liter_large_2b855144-e47e-468b-8c83-e318376f5f2c.png',
  'assets/sample-images/DietCoke_2Liter_large_160df7cd-11c7-4297-8882-1dcf54dc64be.png',
  'assets/sample-images/Nescafe_Clasico150Cups_large_635ca600-168b-42f1-906e-3149509a8ba0.png'
];

/**
 * PreviewRenderer class
 * Renders and manages the layout preview
 */
class PreviewRenderer {
  constructor(options = {}) {
    this.containerEl = null;
    this.previewEl = null;
    this.config = {
      cardSize: '2x2',
      imageCount: 3,
      layoutType: 'grid',
      emphasis: 'equal',
      direction: 'normal',
      images: DEFAULT_IMAGES,
      objectFit: 'contain',
      highlightSelected: true,
      gap: 4,
      overflowVisible: false,
      ...options
    };

    // Item adjustments (per-item customizations)
    this.itemAdjustments = {};

    // Callbacks
    this.onItemClick = options.onItemClick || null;
    this.onItemSelect = options.onItemSelect || null;

    // State
    this.selectedItemIndex = null;
  }

  /**
   * Get aspect ratio CSS value for a card size
   * @param {string} cardSize
   * @returns {string}
   */
  getAspectRatio(cardSize) {
    return CARD_ASPECT_RATIOS[cardSize] || '1 / 1';
  }

  /**
   * Build transform string from adjustments
   * @param {Object} adjustments
   * @returns {string}
   */
  buildTransform(adjustments) {
    const transforms = [];

    if (adjustments.offsetX || adjustments.offsetY) {
      const x = adjustments.offsetX || 0;
      const y = adjustments.offsetY || 0;
      transforms.push(`translate(${x}px, ${y}px)`);
    }

    if (adjustments.scale && adjustments.scale !== 1) {
      transforms.push(`scale(${adjustments.scale})`);
    }

    if (adjustments.rotation) {
      transforms.push(`rotate(${adjustments.rotation}deg)`);
    }

    return transforms.length > 0 ? transforms.join(' ') : 'none';
  }

  /**
   * Get shadow value from preset or custom
   * @param {string|Object} shadow
   * @returns {string}
   */
  getShadowValue(shadow) {
    if (!shadow) return 'none';
    if (typeof shadow === 'string') {
      return PREVIEW_SHADOW_PRESETS[shadow] || shadow;
    }
    return shadow;
  }

  /**
   * Create the preview container element
   * @returns {HTMLElement}
   */
  createPreviewElement() {
    const preview = document.createElement('div');
    preview.className = 'layout-preview';
    if (this.config.overflowVisible) {
      preview.classList.add('layout-preview--overflow-visible');
    }
    preview.setAttribute('data-card-size', this.config.cardSize);
    return preview;
  }

  /**
   * Set overflow visible mode
   * @param {boolean} visible
   */
  setOverflowVisible(visible) {
    this.config.overflowVisible = visible;
    if (this.previewEl) {
      this.previewEl.classList.toggle('layout-preview--overflow-visible', visible);
    }
  }

  /**
   * Create a preview item element
   * @param {number} index
   * @param {string} imageSrc
   * @param {Object} placement
   * @returns {HTMLElement}
   */
  createItemElement(index, imageSrc, placement) {
    const item = document.createElement('div');
    item.className = 'preview-item';
    item.setAttribute('data-index', index);

    // Apply grid placement
    if (placement.gridArea) {
      item.style.gridArea = placement.gridArea;
    } else {
      if (placement.gridColumn) item.style.gridColumn = placement.gridColumn;
      if (placement.gridRow) item.style.gridRow = placement.gridRow;
    }

    // Create image element
    const img = document.createElement('img');
    img.src = imageSrc;
    img.alt = `Image ${index + 1}`;
    img.className = 'preview-item__image';
    img.draggable = false;

    // Apply object-fit
    img.style.objectFit = this.config.objectFit;

    item.appendChild(img);

    // Apply item adjustments if any
    const adjustments = this.itemAdjustments[index];
    if (adjustments) {
      this.applyItemAdjustments(item, img, adjustments);
    }

    // Add click handler
    item.addEventListener('click', (e) => {
      this.handleItemClick(index, e);
    });

    return item;
  }

  /**
   * Apply adjustments to an item
   * @param {HTMLElement} itemEl
   * @param {HTMLElement} imgEl
   * @param {Object} adjustments
   */
  applyItemAdjustments(itemEl, imgEl, adjustments) {
    // Transform (on image for position/scale/rotation)
    const transform = this.buildTransform(adjustments);
    if (transform !== 'none') {
      imgEl.style.transform = transform;
    }

    // Opacity
    if (adjustments.opacity !== undefined && adjustments.opacity !== 1) {
      itemEl.style.opacity = adjustments.opacity;
    }

    // Box shadow
    if (adjustments.shadow) {
      itemEl.style.boxShadow = this.getShadowValue(adjustments.shadow);
    }

    // Z-index
    if (adjustments.zIndex !== undefined) {
      itemEl.style.zIndex = adjustments.zIndex;
    }

    // Object fit override
    if (adjustments.objectFit) {
      imgEl.style.objectFit = adjustments.objectFit;
    }
  }

  /**
   * Handle item click
   * @param {number} index
   * @param {Event} event
   */
  handleItemClick(index, event) {
    // Update selection state
    const previousSelection = this.selectedItemIndex;
    this.selectedItemIndex = index;

    // Update visual selection
    if (this.previewEl) {
      const items = this.previewEl.querySelectorAll('.preview-item');
      items.forEach((item, i) => {
        const isSelected = i === index;
        item.classList.toggle('preview-item--selected', isSelected);

        // Handle highlight mode
        if (this.config.highlightSelected) {
          item.classList.toggle('preview-item--highlighted', isSelected);

          // Add pulse animation for newly selected item
          if (isSelected && previousSelection !== index) {
            item.classList.remove('preview-item--highlight-pulse');
            // Force reflow to restart animation
            void item.offsetWidth;
            item.classList.add('preview-item--highlight-pulse');
          }
        } else {
          item.classList.remove('preview-item--highlighted', 'preview-item--highlight-pulse');
        }
      });
    }

    // Log to console
    console.log(`Preview item ${index + 1} clicked`, {
      index,
      imageSrc: this.config.images[index],
      adjustments: this.itemAdjustments[index] || {}
    });

    // Call callbacks
    if (this.onItemClick) {
      this.onItemClick(index, event);
    }

    if (this.onItemSelect && previousSelection !== index) {
      this.onItemSelect(index, previousSelection);
    }
  }

  /**
   * Set highlight selected mode
   * @param {boolean} enabled
   */
  setHighlightSelected(enabled) {
    this.config.highlightSelected = enabled;

    // Update existing selection if any
    if (this.previewEl && this.selectedItemIndex !== null) {
      const items = this.previewEl.querySelectorAll('.preview-item');
      items.forEach((item, i) => {
        const isSelected = i === this.selectedItemIndex;
        if (enabled && isSelected) {
          item.classList.add('preview-item--highlighted');
        } else {
          item.classList.remove('preview-item--highlighted', 'preview-item--highlight-pulse');
        }
      });
    }
  }

  /**
   * Generate the grid template
   * @returns {Object}
   */
  generateTemplate() {
    return generateGridTemplate({
      cardSize: this.config.cardSize,
      imageCount: this.config.imageCount,
      layoutType: this.config.layoutType,
      emphasis: this.config.emphasis,
      direction: this.config.direction
    });
  }

  /**
   * Apply grid styles to preview element
   * @param {Object} template
   */
  applyGridStyles(template) {
    if (!this.previewEl || !template.isValid) return;

    this.previewEl.style.display = 'grid';
    this.previewEl.style.gridTemplateColumns = template.gridTemplateColumns;
    this.previewEl.style.gridTemplateRows = template.gridTemplateRows;
    this.previewEl.style.gap = `${this.config.gap}px`;
    this.previewEl.style.aspectRatio = this.getAspectRatio(this.config.cardSize);

    if (template.gridTemplateAreas) {
      this.previewEl.style.gridTemplateAreas = template.gridTemplateAreas;
    } else {
      this.previewEl.style.gridTemplateAreas = '';
    }
  }

  /**
   * Render the preview
   * @param {HTMLElement} containerEl - Container to render into
   * @param {Object} config - Optional config override
   * @returns {Object} Result with success status and any error
   */
  render(containerEl, config = {}) {
    // Update container reference
    this.containerEl = containerEl;

    // Merge config
    this.config = { ...this.config, ...config };

    // Generate template
    const template = this.generateTemplate();

    if (!template.isValid) {
      this.renderError(template.error);
      return { success: false, error: template.error };
    }

    // Create or update preview element
    if (!this.previewEl) {
      this.previewEl = this.createPreviewElement();
    }

    // Clear existing content
    this.previewEl.innerHTML = '';

    // Update card size attribute
    this.previewEl.setAttribute('data-card-size', this.config.cardSize);

    // Apply overflow visible class
    this.previewEl.classList.toggle('layout-preview--overflow-visible', this.config.overflowVisible);

    // Apply grid styles
    this.applyGridStyles(template);

    // Create items
    const imageCount = Math.min(this.config.imageCount, this.config.images.length);
    template.itemPlacements.forEach((placement, i) => {
      if (i < imageCount) {
        const imageSrc = this.config.images[i];
        const itemEl = this.createItemElement(i, imageSrc, placement);
        this.previewEl.appendChild(itemEl);
      }
    });

    // Add to container if not already there
    if (!this.containerEl.contains(this.previewEl)) {
      this.containerEl.innerHTML = '';
      this.containerEl.appendChild(this.previewEl);
    }

    return { success: true, template };
  }

  /**
   * Render error state
   * @param {string} errorMessage
   */
  renderError(errorMessage) {
    if (!this.containerEl) return;

    this.containerEl.innerHTML = `
      <div class="layout-preview layout-preview--error">
        <div class="layout-preview__error">
          <span class="layout-preview__error-icon">!</span>
          <span class="layout-preview__error-message">${errorMessage}</span>
        </div>
      </div>
    `;
  }

  /**
   * Update configuration and re-render
   * @param {Object} newConfig
   */
  update(newConfig) {
    if (this.containerEl) {
      this.render(this.containerEl, newConfig);
    }
  }

  /**
   * Set adjustment for a specific item
   * @param {number} index
   * @param {Object} adjustments
   */
  setItemAdjustment(index, adjustments) {
    this.itemAdjustments[index] = {
      ...(this.itemAdjustments[index] || {}),
      ...adjustments
    };

    // Re-render if already rendered
    if (this.containerEl && this.previewEl) {
      this.render(this.containerEl);
    }
  }

  /**
   * Clear adjustment for a specific item
   * @param {number} index
   */
  clearItemAdjustment(index) {
    delete this.itemAdjustments[index];

    if (this.containerEl && this.previewEl) {
      this.render(this.containerEl);
    }
  }

  /**
   * Clear all item adjustments
   */
  clearAllAdjustments() {
    this.itemAdjustments = {};

    if (this.containerEl && this.previewEl) {
      this.render(this.containerEl);
    }
  }

  /**
   * Get current configuration
   * @returns {Object}
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * Get item adjustments
   * @param {number} index - Optional, returns specific item or all
   * @returns {Object}
   */
  getItemAdjustments(index) {
    if (index !== undefined) {
      return this.itemAdjustments[index] || {};
    }
    return { ...this.itemAdjustments };
  }

  /**
   * Set images array
   * @param {string[]} images
   */
  setImages(images) {
    this.config.images = images;
    if (this.containerEl) {
      this.render(this.containerEl);
    }
  }

  /**
   * Get selected item index
   * @returns {number|null}
   */
  getSelectedIndex() {
    return this.selectedItemIndex;
  }

  /**
   * Programmatically select an item by index
   * @param {number} index
   */
  selectItem(index) {
    if (index < 0 || !this.previewEl) return;

    const previousSelection = this.selectedItemIndex;
    this.selectedItemIndex = index;

    const items = this.previewEl.querySelectorAll('.preview-item');
    items.forEach((item, i) => {
      const isSelected = i === index;
      item.classList.toggle('preview-item--selected', isSelected);

      // Handle highlight mode
      if (this.config.highlightSelected) {
        item.classList.toggle('preview-item--highlighted', isSelected);

        // Add pulse animation for newly selected item
        if (isSelected && previousSelection !== index) {
          item.classList.remove('preview-item--highlight-pulse');
          // Force reflow to restart animation
          void item.offsetWidth;
          item.classList.add('preview-item--highlight-pulse');
        }
      } else {
        item.classList.remove('preview-item--highlighted', 'preview-item--highlight-pulse');
      }
    });
  }

  /**
   * Clear selection
   */
  clearSelection() {
    this.selectedItemIndex = null;
    if (this.previewEl) {
      this.previewEl.querySelectorAll('.preview-item').forEach(item => {
        item.classList.remove('preview-item--selected', 'preview-item--highlighted', 'preview-item--highlight-pulse');
      });
    }
  }

  /**
   * Destroy the renderer and clean up
   */
  destroy() {
    if (this.previewEl && this.previewEl.parentNode) {
      this.previewEl.parentNode.removeChild(this.previewEl);
    }
    this.previewEl = null;
    this.containerEl = null;
    this.itemAdjustments = {};
    this.selectedItemIndex = null;
  }
}

// Export for use in other modules (Node.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PreviewRenderer,
    CARD_ASPECT_RATIOS,
    PREVIEW_SHADOW_PRESETS,
    DEFAULT_IMAGES
  };
}
