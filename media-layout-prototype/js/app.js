/**
 * Media Layout Prototype - Main Application
 * Initializes and manages the application state
 */

// Application State
const AppState = {
  // Current configuration
  cardSize: '2x2',
  layout: 'horizontal',
  emphasis: 'equal',
  template: null,
  imageCount: 1, // Target image count (1-5)

  // Background settings (includes image properties: position, size, repeat)
  background: {
    type: 'color',
    value: '#ffffff',
    position: 'center center',
    size: 'cover',
    repeat: 'no-repeat',
    color: '#ffffff' // Background color even when image is set
  },

  // Image slots
  slots: [],
  selectedSlotIndex: -1,

  // Available sample images
  sampleImages: [],

  // UI State
  panelState: 'collapsed', // collapsed, quick, advanced

  // Subscribers for state changes
  _subscribers: [],

  // 9-Config Model: Independent layout per card size
  allConfigs: {
    '1x1': { isCustomized: false, templateId: null, slots: null },
    '2x1': { isCustomized: false, templateId: null, slots: null },
    '3x1': { isCustomized: false, templateId: null, slots: null },
    '1x2': { isCustomized: false, templateId: null, slots: null },
    '2x2': { isCustomized: false, templateId: null, slots: null },
    '3x2': { isCustomized: false, templateId: null, slots: null },
    '1x3': { isCustomized: false, templateId: null, slots: null },
    '2x3': { isCustomized: false, templateId: null, slots: null },
    '3x3': { isCustomized: false, templateId: null, slots: null }
  },

  // Dirty state tracking: only sizes with actual user modifications get purple dot
  _dirtyConfigs: new Set(),

  // Preview width for responsive testing
  previewMaxWidth: 472,

  // Grid system (computed properties)
  get gridSystem() {
    const self = this;
    return {
      get unitSize() { return self.previewMaxWidth / 3; },
      get cols() { return parseInt(self.cardSize.split('x')[0]); },
      get rows() { return parseInt(self.cardSize.split('x')[1]); },
      get canvasWidth() { return this.cols * this.unitSize; },
      get canvasHeight() { return this.rows * this.unitSize; }
    };
  },

  /**
   * Subscribe to state changes
   */
  subscribe(callback) {
    this._subscribers.push(callback);
    return () => {
      this._subscribers = this._subscribers.filter(cb => cb !== callback);
    };
  },

  /**
   * Notify all subscribers of state change
   */
  _notify(changeType, data) {
    this._subscribers.forEach(cb => cb(changeType, data));
  },

  /**
   * Save current slots configuration to the active card size
   * Called automatically when switching sizes or manually via UI
   */
  saveConfigForCurrentSize() {
    const sizeKey = this.cardSize;
    this.allConfigs[sizeKey] = {
      isCustomized: true,
      templateId: this.template?.id || null,
      slots: this.slots.map(slot => ({
        ...slot,
        image: { ...slot.image },
        position: { ...slot.position }
      }))
    };
    this._notify('configSaved', { size: sizeKey });
  },

  /**
   * Load config for a specific size
   * If customized, restores saved slots; otherwise keeps current template-based layout
   */
  loadConfigForSize(sizeKey) {
    const config = this.allConfigs[sizeKey];
    if (config && config.isCustomized && config.slots) {
      // Restore saved slots with deep copy
      this.slots = config.slots.map(s => ({
        ...s,
        image: { ...s.image },
        position: { ...s.position }
      }));
      // Restore template reference if available
      if (config.templateId && typeof getTemplateById === 'function') {
        this.template = getTemplateById(config.templateId);
      }
      this._notify('configLoaded', { size: sizeKey, isCustomized: true });
    }
    // If not customized, keep current slots (derived from template)
  },

  /**
   * Check if a size has been customized (has actual user modifications)
   */
  isConfigCustomized(sizeKey) {
    return this._dirtyConfigs.has(sizeKey);
  },

  /**
   * Mark the current config as dirty (user made actual modification)
   * Call this when: drag, scale, rotate, template change, z-index change
   */
  markCurrentConfigDirty() {
    this._dirtyConfigs.add(this.cardSize);
    this._notify('configDirty', { size: this.cardSize });
  },

  /**
   * Clear dirty flag for a size (e.g., when resetting to defaults)
   */
  clearConfigDirty(sizeKey) {
    this._dirtyConfigs.delete(sizeKey);
    this._notify('configClean', { size: sizeKey });
  },

  /**
   * Set preview max width for responsive testing
   */
  setPreviewMaxWidth(width) {
    this.previewMaxWidth = Math.max(320, Math.min(472, width));
    this._notify('previewWidth', { width: this.previewMaxWidth });
  },

  /**
   * Mark excess images as inactive when size constraints change
   * Returns slots with active property set appropriately
   */
  handleImageCountConstraint(newSize, currentSlots) {
    if (typeof getMaxImages !== 'function') return currentSlots;

    const maxImages = getMaxImages(newSize);
    if (currentSlots.length > maxImages) {
      return currentSlots.map((slot, index) => ({
        ...slot,
        active: index < maxImages
      }));
    }
    return currentSlots.map(slot => ({ ...slot, active: slot.active !== false }));
  },

  /**
   * Update card size with 9-config model support
   * Saves current config before switching, loads saved config if available
   * Shows image selection modal if reducing to a size with fewer allowed images
   */
  setCardSize(size, skipModal = false) {
    if (this.cardSize === size) return;

    const oldSize = this.cardSize;

    // Save current config before switching (if we have slots)
    if (this.slots.length > 0) {
      this.saveConfigForCurrentSize();
    }

    // Check if we need to show image selection modal
    if (!skipModal && typeof getMaxImages === 'function' && typeof imageSelectionModal !== 'undefined' && imageSelectionModal) {
      const maxImages = getMaxImages(size);
      const activeSlots = this.slots.filter(s => s.active !== false);

      if (activeSlots.length > maxImages) {
        // Store pending size and show modal
        pendingSizeChange = size;
        imageSelectionModal.show(this.slots, maxImages, size);
        return; // Don't proceed until user selects
      }
    }

    this.cardSize = size;

    // Validate layout for new size
    if (typeof isLayoutAllowed === 'function' && !isLayoutAllowed(size, this.layout)) {
      this.layout = getDefaultLayout(size);
    }

    // Check if new size has a saved config
    if (this.isConfigCustomized(size)) {
      // Load saved config for this size
      this.loadConfigForSize(size);
    } else {
      // Handle image count constraint - mark excess as inactive instead of removing
      this.slots = this.handleImageCountConstraint(size, this.slots);
    }

    this._notify('cardSize', { oldSize, newSize: size });
  },

  /**
   * Update layout type
   */
  setLayout(layout) {
    if (this.layout === layout) return;

    // Validate layout is allowed
    if (typeof isLayoutAllowed === 'function' && !isLayoutAllowed(this.cardSize, layout)) {
      console.warn(`Layout "${layout}" not allowed for card size "${this.cardSize}"`);
      return;
    }

    const oldLayout = this.layout;
    this.layout = layout;
    this._notify('layout', { oldLayout, newLayout: layout });
  },

  /**
   * Update emphasis
   */
  setEmphasis(emphasis) {
    if (this.emphasis === emphasis) return;

    const oldEmphasis = this.emphasis;
    this.emphasis = emphasis;
    this._notify('emphasis', { oldEmphasis, newEmphasis: emphasis });
  },

  /**
   * Set target image count (1-5)
   */
  setImageCount(count) {
    count = Math.max(1, Math.min(5, count));
    if (this.imageCount === count) return;

    const oldCount = this.imageCount;
    this.imageCount = count;

    // Add or remove slots to match target count
    while (this.slots.length < count && this.sampleImages.length > this.slots.length) {
      const nextImage = this.sampleImages[this.slots.length % this.sampleImages.length];
      this.addSlot(nextImage);
    }
    while (this.slots.length > count) {
      this.slots.pop();
    }

    // Reset selection if needed
    if (this.selectedSlotIndex >= this.slots.length) {
      this.selectedSlotIndex = this.slots.length - 1;
    }

    this._notify('imageCount', { oldCount, newCount: count });
  },

  /**
   * Apply a template
   */
  applyTemplate(template) {
    this.template = template;
    this._notify('template', { template });
  },

  /**
   * Update background
   * @param {string} type - 'color' or 'image'
   * @param {string} value - Color value or image URL
   * @param {Object} fullConfig - Optional full config with position, size, repeat
   */
  setBackground(type, value, fullConfig = null) {
    if (fullConfig) {
      this.background = {
        type,
        value,
        position: fullConfig.position || 'center center',
        size: fullConfig.size || 'cover',
        repeat: fullConfig.repeat || 'no-repeat',
        color: fullConfig.color || '#ffffff'
      };
    } else {
      this.background = {
        type,
        value,
        position: this.background.position || 'center center',
        size: this.background.size || 'cover',
        repeat: this.background.repeat || 'no-repeat',
        color: type === 'color' ? value : this.background.color
      };
    }
    this._notify('background', this.background);
  },

  /**
   * Add an image slot with staggered default positioning
   */
  addSlot(imageData) {
    if (this.slots.length >= 5) {
      console.warn('Maximum 5 images allowed');
      return false;
    }

    // Calculate staggered position based on slot count
    const index = this.slots.length;
    const offset = index * 15; // Stagger by 15% each

    const slot = {
      id: `slot-${Date.now()}-${index}`,
      image: imageData,
      // Position as percentage of container (top-left origin)
      position: { x: offset, y: offset },
      scale: 0.6, // Start at 60% size
      rotation: 0, // Rotation in degrees
      zIndex: index + 1, // 1-indexed z-index
      size: 50 // Slot size as percentage of card width
    };

    this.slots.push(slot);
    this._notify('slots', { action: 'add', slot });
    return true;
  },

  /**
   * Remove an image slot
   */
  removeSlot(index) {
    if (index < 0 || index >= this.slots.length) return;

    const removed = this.slots.splice(index, 1)[0];

    // Adjust selected index
    if (this.selectedSlotIndex >= this.slots.length) {
      this.selectedSlotIndex = this.slots.length - 1;
    }

    this._notify('slots', { action: 'remove', slot: removed, index });
  },

  /**
   * Update a slot's properties
   */
  updateSlot(index, updates) {
    if (index < 0 || index >= this.slots.length) return;

    Object.assign(this.slots[index], updates);
    this._notify('slots', { action: 'update', slot: this.slots[index], index });
  },

  /**
   * Reorder slots
   */
  reorderSlots(fromIndex, toIndex) {
    if (fromIndex === toIndex) return;

    const [moved] = this.slots.splice(fromIndex, 1);
    this.slots.splice(toIndex, 0, moved);

    // Update z-indices
    this.slots.forEach((slot, i) => slot.zIndex = i + 1);

    this._notify('slots', { action: 'reorder', fromIndex, toIndex });
  },

  /**
   * Move selected slot up in layer order (increase z-index)
   */
  bringForward(index) {
    if (index < 0 || index >= this.slots.length) return;

    const slot = this.slots[index];
    const maxZ = Math.max(...this.slots.map(s => s.zIndex));

    if (slot.zIndex < maxZ) {
      // Find slot with next higher z-index and swap
      const higherSlot = this.slots.find(s => s.zIndex === slot.zIndex + 1);
      if (higherSlot) {
        higherSlot.zIndex -= 1;
      }
      slot.zIndex += 1;
      this._notify('slots', { action: 'zindex', index });
    }
  },

  /**
   * Move selected slot down in layer order (decrease z-index)
   */
  sendBackward(index) {
    if (index < 0 || index >= this.slots.length) return;

    const slot = this.slots[index];

    if (slot.zIndex > 1) {
      // Find slot with next lower z-index and swap
      const lowerSlot = this.slots.find(s => s.zIndex === slot.zIndex - 1);
      if (lowerSlot) {
        lowerSlot.zIndex += 1;
      }
      slot.zIndex -= 1;
      this._notify('slots', { action: 'zindex', index });
    }
  },

  /**
   * Bring slot to front (max z-index)
   */
  bringToFront(index) {
    if (index < 0 || index >= this.slots.length) return;

    const slot = this.slots[index];
    const maxZ = Math.max(...this.slots.map(s => s.zIndex));

    // Move all slots above this one down
    this.slots.forEach(s => {
      if (s.zIndex > slot.zIndex) {
        s.zIndex -= 1;
      }
    });
    slot.zIndex = maxZ;
    this._notify('slots', { action: 'zindex', index });
  },

  /**
   * Send slot to back (min z-index)
   */
  sendToBack(index) {
    if (index < 0 || index >= this.slots.length) return;

    const slot = this.slots[index];

    // Move all slots below this one up
    this.slots.forEach(s => {
      if (s.zIndex < slot.zIndex) {
        s.zIndex += 1;
      }
    });
    slot.zIndex = 1;
    this._notify('slots', { action: 'zindex', index });
  },

  /**
   * Select a slot
   */
  selectSlot(index) {
    this.selectedSlotIndex = index;
    this._notify('selection', { index });
  },

  /**
   * Set panel state
   */
  setPanelState(state) {
    if (this.panelState === state) return;

    const oldState = this.panelState;
    this.panelState = state;
    this._notify('panel', { oldState, newState: state });
  },

  /**
   * Toggle panel between collapsed and quick/advanced
   */
  togglePanel() {
    if (this.panelState === 'collapsed') {
      this.setPanelState('quick');
    } else {
      this.setPanelState('collapsed');
    }
  },

  /**
   * Get current configuration as exportable object
   */
  getConfiguration() {
    return {
      cardSize: this.cardSize,
      layout: this.layout,
      emphasis: this.emphasis,
      template: this.template,
      background: { ...this.background },
      slots: this.slots.map(slot => ({
        image: slot.image,
        position: { ...slot.position },
        scale: slot.scale,
        fit: slot.fit,
        zIndex: slot.zIndex
      }))
    };
  },

  /**
   * Reset to defaults
   */
  reset() {
    this.cardSize = '2x2';
    this.layout = 'horizontal';
    this.emphasis = 'equal';
    this.template = null;
    this.background = { type: 'color', value: '#ffffff' };
    this.slots = [];
    this.selectedSlotIndex = -1;
    this._notify('reset', {});
  }
};

/**
 * Load sample images from process folder
 */
function loadSampleImages() {
  const sampleImageNames = [
    'CocaCola_Cherry2Liter_large_43dd9fba-2992-4e49-aa4b-6c3b5e32a673.png',
    'CocaCola_Original2Liter_large_66a21ff4-7055-4178-a532-19ab3b6374cf.png',
    'CocaCola_ZeroSugar2Liter_large_2b855144-e47e-468b-8c83-e318376f5f2c.png',
    'DietCoke_2Liter_large_160df7cd-11c7-4297-8882-1dcf54dc64be.png',
    'Nescafe_Clasico150Cups_large_635ca600-168b-42f1-906e-3149509a8ba0.png',
    'Nestle_CarnationEvaporatedMilk_large_cf0d165c-37cc-4e3b-8099-633ead9e5e60.png',
    'Niagara_DrinkingWater24Pack_large_fe35393a-1c30-47db-bec1-e948103cd864.png',
    'RussetPotatoes_large_7d0ccc22-12d8-4c8d-9c19-5571fe92f03e.png',
    'Tide_SimplyAllInOneDaybreakFresh89Loads_large_19c3da74-3ac6-4608-8b33-b6883960935b.png',
    'Tide_SimplyAllInOneRefreshingBreeze89Loads_large_96f3c653-6a40-4fe7-8c04-3ce1339e3e7e.png',
    'Tide_SimplyFreeSensitive89Loads_large_398aeebe-7abd-471c-894a-c2e5e9b5d099.png',
    'Tide_SimplyOxiStain74Loads_large_d5adc55e-1f2d-48c3-81e3-b5f5ca6933e3.png'
  ];

  AppState.sampleImages = sampleImageNames.map((filename, index) => {
    // Extract product name from filename
    const name = filename.split('_').slice(0, -1).join(' ').replace(/_/g, ' ');

    return {
      id: `sample-${index}`,
      name: name,
      filename: filename,
      url: `process/sample-images/${filename}`
    };
  });

  console.log(`Loaded ${AppState.sampleImages.length} sample images`);
}

/**
 * Initialize sample slots for demo
 */
function initializeDemoSlots() {
  // Add first sample image as demo slot (single hero)
  if (AppState.sampleImages.length >= 1) {
    AppState.addSlot(AppState.sampleImages[0]);
  }

  // Apply Centered Hero template by default
  if (typeof applyTemplateToState === 'function') {
    applyTemplateToState('hero-centered');
    // Clear the dirty flag since this is initial setup, not user modification
    AppState._dirtyConfigs.clear();
  }
}

/**
 * Setup keyboard shortcuts
 * Note: LayoutPanel has its own keyboard handlers, but we keep these
 * for when the panel is not yet initialized or as fallback
 */
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Cmd/Ctrl + M - Toggle panel
    if ((e.metaKey || e.ctrlKey) && e.key === 'm') {
      e.preventDefault();
      if (layoutPanel) {
        layoutPanel.toggle();
      } else {
        AppState.togglePanel();
      }
    }

    // Cmd/Ctrl + 1 - Quick view
    if ((e.metaKey || e.ctrlKey) && e.key === '1') {
      e.preventDefault();
      if (layoutPanel) {
        layoutPanel.open('quick');
      } else {
        AppState.setPanelState('quick');
      }
    }

    // Cmd/Ctrl + 2 - Advanced view
    if ((e.metaKey || e.ctrlKey) && e.key === '2') {
      e.preventDefault();
      if (layoutPanel) {
        layoutPanel.open('advanced');
      } else {
        AppState.setPanelState('advanced');
      }
    }

    // Escape - Close panel
    if (e.key === 'Escape') {
      if (layoutPanel && layoutPanel.isOpen) {
        layoutPanel.close();
      } else if (AppState.panelState !== 'collapsed') {
        AppState.setPanelState('collapsed');
      }
    }
  });
}

/**
 * Render the card size selector as 3x3 grid
 */
function renderCardSizeSelector() {
  // Render the 3x3 card size grid
  const gridContainer = document.getElementById('card-size-grid');
  if (gridContainer) {
    const sizes = ['1x1', '2x1', '3x1', '1x2', '2x2', '3x2', '1x3', '2x3', '3x3'];
    gridContainer.innerHTML = sizes.map(size => {
      const isCustomized = AppState.isConfigCustomized(size);
      return `
        <button class="card-size-btn ${AppState.cardSize === size ? 'card-size-btn--selected' : ''}"
                data-size="${size}">
          ${size.replace('x', '×')}
          ${isCustomized ? '<span class="customized-dot"></span>' : ''}
        </button>
      `;
    }).join('');

    // Add click handlers
    gridContainer.querySelectorAll('[data-size]').forEach(btn => {
      btn.addEventListener('click', () => {
        AppState.setCardSize(btn.dataset.size);
        renderAll();
      });
    });
  }

  // Render config status badges
  const configList = document.getElementById('config-list');
  if (configList) {
    const sizes = ['1x1', '2x1', '3x1', '1x2', '2x2', '3x2', '1x3', '2x3', '3x3'];
    configList.innerHTML = sizes.map(size => {
      const config = AppState.allConfigs[size];
      const cls = config.isCustomized ? 'customized' : 'default';
      return `<span class="config-badge ${cls}">${size.replace('x', '×')}</span>`;
    }).join('');
  }

  // Update grid info
  updateGridInfo();
}

/**
 * Update grid info display
 */
function updateGridInfo() {
  const grid = AppState.gridSystem;

  const unitSizeEl = document.getElementById('grid-unit-size');
  if (unitSizeEl) unitSizeEl.textContent = `${Math.round(grid.unitSize)}px`;

  const canvasDimEl = document.getElementById('grid-canvas-dim');
  if (canvasDimEl) canvasDimEl.textContent = `${Math.round(grid.canvasWidth)}×${Math.round(grid.canvasHeight)}px`;

  const cardSizeEl = document.getElementById('grid-card-size');
  if (cardSizeEl) cardSizeEl.textContent = `${grid.cols}×${grid.rows}`;
}

/**
 * Setup width control slider and presets
 */
function setupWidthControl() {
  const widthSlider = document.getElementById('width-slider');
  const widthValue = document.getElementById('width-value');

  if (widthSlider) {
    widthSlider.value = AppState.previewMaxWidth;
    widthSlider.addEventListener('input', () => {
      const width = parseInt(widthSlider.value);
      AppState.setPreviewMaxWidth(width);
      if (widthValue) widthValue.textContent = `${width}px`;
      updateWidthPresets(width);
      updateGridInfo();
      renderPreview();
    });
  }

  // Width presets
  document.querySelectorAll('.width-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const width = parseInt(btn.dataset.width);
      AppState.setPreviewMaxWidth(width);
      if (widthSlider) widthSlider.value = width;
      if (widthValue) widthValue.textContent = `${width}px`;
      updateWidthPresets(width);
      updateGridInfo();
      renderPreview();
    });
  });
}

/**
 * Update width preset button active states
 */
function updateWidthPresets(activeWidth) {
  document.querySelectorAll('.width-preset-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.width) === activeWidth);
  });
}

/**
 * Render layout type options
 */
function renderLayoutOptions() {
  const container = document.getElementById('layout-options');
  if (!container) return;

  const layouts = ['horizontal', 'vertical', 'grid'];

  container.innerHTML = `
    <div class="flex gap-2">
      ${layouts.map(layout => {
        const allowed = typeof isLayoutAllowed === 'function'
          ? isLayoutAllowed(AppState.cardSize, layout)
          : true;
        const reason = !allowed && typeof getDisabledReason === 'function'
          ? getDisabledReason(AppState.cardSize, layout)
          : '';

        return `
          <button class="p-button ${AppState.layout === layout ? 'p-button-primary' : 'p-button-secondary'} ${!allowed ? 'p-button-disabled' : ''}"
                  data-layout="${layout}"
                  ${!allowed ? 'disabled title="' + reason + '"' : ''}>
            <i class="pi ${layout === 'horizontal' ? 'pi-arrows-h' : layout === 'vertical' ? 'pi-arrows-v' : 'pi-th-large'}"></i>
            ${layout.charAt(0).toUpperCase() + layout.slice(1)}
          </button>
        `;
      }).join('')}
    </div>
  `;

  // Add click handlers
  container.querySelectorAll('[data-layout]:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => {
      AppState.setLayout(btn.dataset.layout);
      renderLayoutOptions();
      renderPreview();
    });
  });
}

/**
 * Render the preview card with canvas-based slots and Moveable.js support
 */
function renderPreview() {
  const container = document.getElementById('preview-container');
  if (!container) return;

  const grid = AppState.gridSystem;
  const bg = AppState.background;

  // Build background style for the card canvas
  let bgStyle = '';
  if (bg.type === 'image' && bg.value) {
    // Background image with color fallback
    const bgPosition = bg.position || 'center center';
    const bgSize = bg.size || 'cover';
    const bgRepeat = bg.repeat || 'no-repeat';
    const bgColor = bg.color || '#ffffff';
    bgStyle = `background-color: ${bgColor}; background-image: url('${bg.value}'); background-position: ${bgPosition}; background-size: ${bgSize}; background-repeat: ${bgRepeat};`;
  } else {
    // Solid color background
    bgStyle = `background: ${bg.value || '#ffffff'};`;
  }

  // Sort slots by z-index for rendering order
  const sortedSlots = [...AppState.slots].sort((a, b) => a.zIndex - b.zIndex);

  container.innerHTML = `
    <div class="canvas-wrapper">
      <div class="grid-background" style="width: ${AppState.previewMaxWidth}px; height: ${AppState.previewMaxWidth}px;">
        ${Array(9).fill('<div class="grid-cell"></div>').join('')}
      </div>

      <div class="card-canvas" id="card-canvas"
           style="width: ${Math.round(grid.canvasWidth)}px; height: ${Math.round(grid.canvasHeight)}px; ${bgStyle}">
        <div class="card-canvas__content" id="canvas-content">
          ${sortedSlots.length > 0
            ? sortedSlots.map((slot) => {
                const index = AppState.slots.indexOf(slot);
                const slotSize = slot.size || 50;
                const posX = slot.position?.x || 0;
                const posY = slot.position?.y || 0;
                const rotation = slot.rotation || 0;

                return `
                  <div class="canvas-product ${AppState.selectedSlotIndex === index ? 'selected' : ''}"
                       id="product-${index}"
                       data-slot-index="${index}"
                       style="
                         left: ${posX}%;
                         top: ${posY}%;
                         width: ${slotSize}%;
                         z-index: ${slot.zIndex};
                         transform: rotate(${rotation}deg);
                       ">
                    <div class="canvas-product__visual">
                      ${slot.image?.url
                        ? `<img src="${slot.image.url}" alt="${slot.image.name || ''}">`
                        : `<div class="demo-product slot-${index}">${index + 1}</div>`
                      }
                    </div>
                  </div>
                `;
              }).join('')
            : ''
          }
        </div>
      </div>
    </div>

    <div class="canvas-status-bar">
      <span><span class="label">Size:</span> <span class="value">${grid.cols}×${grid.rows}</span></span>
      <span><span class="label">Canvas:</span> <span class="value">${Math.round(grid.canvasWidth)}×${Math.round(grid.canvasHeight)}</span></span>
      <span><span class="label">Selected:</span> <span class="value">${AppState.selectedSlotIndex >= 0 ? AppState.selectedSlotIndex + 1 : '-'}</span></span>
      <span><span class="label">Images:</span> <span class="value">${AppState.slots.length}</span></span>
    </div>
  `;

  // Add slot click handlers
  container.querySelectorAll('[data-slot-index]').forEach(product => {
    product.addEventListener('mousedown', (e) => {
      // Don't interfere with Moveable controls
      if (e.target.closest('.moveable-control')) return;
      const index = parseInt(product.dataset.slotIndex);
      selectSlot(index);
    });
  });

  // Add click handler on canvas content to deselect when clicking empty area
  const canvasContent = container.querySelector('#canvas-content');
  if (canvasContent) {
    canvasContent.addEventListener('mousedown', (e) => {
      // Only deselect if clicking directly on canvas-content (not on products or Moveable controls)
      if (e.target === canvasContent || e.target.classList.contains('card-canvas__content')) {
        deselectSlot();
      }
    });
  }

  // Setup Moveable for the selected slot
  setupMoveableForSelected();
}

/**
 * Deselect current slot (set selection to none)
 */
function deselectSlot() {
  if (AppState.selectedSlotIndex === -1) return;

  AppState.selectSlot(-1);

  // Remove visual selection
  document.querySelectorAll('.canvas-product').forEach(p => {
    p.classList.remove('selected');
  });

  // Update selected image buttons
  document.querySelectorAll('.image-select-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Destroy Moveable controls
  if (currentMoveable) {
    currentMoveable.destroy();
    currentMoveable = null;
  }

  updateAdjustmentSliders();
  renderLiveData();
  renderSelectedImageButtons();
  renderSlotInfo();
}

/**
 * Select a slot and update UI
 */
function selectSlot(index) {
  if (AppState.selectedSlotIndex === index) return;
  if (index >= AppState.slots.length) return;

  AppState.selectSlot(index);

  // Update visual selection
  document.querySelectorAll('.canvas-product').forEach((p, i) => {
    p.classList.toggle('selected', parseInt(p.dataset.slotIndex) === index);
  });

  // Update selected image buttons
  document.querySelectorAll('.image-select-btn').forEach((btn, i) => {
    btn.classList.toggle('active', i === index);
  });

  setupMoveableForSelected();
  updateAdjustmentSliders();
  renderLiveData();
  renderSelectedImageButtons();
}

/**
 * Setup Moveable.js for the currently selected slot
 */
let currentMoveable = null;
let scaleStartState = null; // Track initial state for center-based scaling

function setupMoveableForSelected() {
  // Destroy existing Moveable
  if (currentMoveable) {
    currentMoveable.destroy();
    currentMoveable = null;
  }
  scaleStartState = null;

  if (AppState.selectedSlotIndex < 0) return;
  if (typeof Moveable === 'undefined') return;

  const target = document.getElementById(`product-${AppState.selectedSlotIndex}`);
  const canvasContent = document.getElementById('canvas-content');
  if (!target || !canvasContent) return;

  currentMoveable = new Moveable(canvasContent, {
    target: target,
    container: canvasContent,
    draggable: true,
    scalable: true,
    rotatable: true,
    keepRatio: true,
    // Add throttle for less sensitive controls
    throttleDrag: 2,      // Minimum 2px movement before drag fires
    throttleScale: 0.02,  // Minimum 2% scale change before firing
    throttleRotate: 1,    // Minimum 1 degree rotation before firing
    renderDirections: ["nw", "ne", "sw", "se"],
    rotationPosition: "top",
    origin: false,        // Hide origin point indicator
  });

  currentMoveable.on('drag', e => {
    const rect = canvasContent.getBoundingClientRect();
    const xPercent = (e.left / rect.width) * 100;
    const yPercent = (e.top / rect.height) * 100;

    const slot = AppState.slots[AppState.selectedSlotIndex];
    if (slot) {
      slot.position = { x: xPercent, y: yPercent };
    }

    e.target.style.left = `${xPercent}%`;
    e.target.style.top = `${yPercent}%`;

    // Mark config as dirty (user made actual modification)
    AppState.markCurrentConfigDirty();
    renderCardSizeSelector(); // Update purple dots

    updateAdjustmentSliders();
    renderLiveData();
    renderJsonCode();
  });

  // Scale from center: capture initial state on scale start
  currentMoveable.on('scaleStart', e => {
    const slot = AppState.slots[AppState.selectedSlotIndex];
    if (slot) {
      const size = slot.size || 50;
      const posX = slot.position?.x || 0;
      const posY = slot.position?.y || 0;
      scaleStartState = {
        size: size,
        centerX: posX + size / 2,
        centerY: posY + size / 2
      };
    }
  });

  currentMoveable.on('scale', e => {
    const slot = AppState.slots[AppState.selectedSlotIndex];
    if (!slot || !scaleStartState) return;

    // Calculate new size from scale (relative to start size)
    const newSize = Math.max(10, Math.min(100, scaleStartState.size * e.scale[0]));
    slot.size = newSize;

    // Scale from center: adjust position to keep center point fixed
    slot.position = {
      x: scaleStartState.centerX - newSize / 2,
      y: scaleStartState.centerY - newSize / 2
    };

    // Apply to element (height handled by CSS aspect-ratio: 1)
    e.target.style.left = `${slot.position.x}%`;
    e.target.style.top = `${slot.position.y}%`;
    e.target.style.width = `${slot.size}%`;
    e.target.style.transform = `rotate(${slot.rotation || 0}deg)`;

    // Mark config as dirty (user made actual modification)
    AppState.markCurrentConfigDirty();
    renderCardSizeSelector(); // Update purple dots

    updateAdjustmentSliders();
    renderLiveData();
    renderJsonCode();
  });

  currentMoveable.on('scaleEnd', e => {
    scaleStartState = null;
  });

  currentMoveable.on('rotate', e => {
    const slot = AppState.slots[AppState.selectedSlotIndex];
    if (slot) {
      slot.rotation = e.rotate;
    }
    e.target.style.transform = `rotate(${e.rotate}deg)`;

    // Mark config as dirty (user made actual modification)
    AppState.markCurrentConfigDirty();
    renderCardSizeSelector(); // Update purple dots

    updateAdjustmentSliders();
    renderLiveData();
    renderJsonCode();
  });
}

/**
 * Update adjustment sliders to reflect current slot values
 */
function updateAdjustmentSliders() {
  const slot = AppState.slots[AppState.selectedSlotIndex];
  if (!slot) return;

  const sliderX = document.getElementById('slider-x');
  const sliderY = document.getElementById('slider-y');
  const sliderSize = document.getElementById('slider-size');
  const sliderRotation = document.getElementById('slider-rotation');

  if (sliderSize) {
    sliderSize.value = slot.size || 50;
    document.getElementById('slider-size-val').value = `${Math.round(slot.size || 50)}%`;
  }
  if (sliderX) {
    sliderX.value = slot.position?.x || 0;
    document.getElementById('slider-x-val').value = `${(slot.position?.x || 0).toFixed(0)}%`;
  }
  if (sliderY) {
    sliderY.value = slot.position?.y || 0;
    document.getElementById('slider-y-val').value = `${(slot.position?.y || 0).toFixed(0)}%`;
  }
  if (sliderRotation) {
    sliderRotation.value = slot.rotation || 0;
    document.getElementById('slider-rotation-val').value = `${Math.round(slot.rotation || 0)}°`;
  }

  // Update layer buttons (dynamically rendered based on image count)
  renderLayerButtons();
}

/**
 * Setup adjustment slider and button event listeners
 */
function setupAdjustmentSliders() {
  const sliderX = document.getElementById('slider-x');
  const sliderY = document.getElementById('slider-y');
  const sliderSize = document.getElementById('slider-size');
  const sliderRotation = document.getElementById('slider-rotation');

  // Helper function to update slot and UI
  const updateSlotValue = (property, value, displayId, displayFormat) => {
    const slot = AppState.slots[AppState.selectedSlotIndex];
    if (!slot) return;

    if (property === 'posX') {
      slot.position = { ...slot.position, x: value };
    } else if (property === 'posY') {
      slot.position = { ...slot.position, y: value };
    } else if (property === 'size') {
      slot.size = value;
    } else if (property === 'rotation') {
      slot.rotation = value;
    } else if (property === 'zIndex') {
      slot.zIndex = value;
    }

    document.getElementById(displayId).value = displayFormat(value);
    applySlotToDOM(AppState.selectedSlotIndex);
    // Wait for CSS transition to complete (300ms) before updating Moveable rect
    setTimeout(() => {
      if (currentMoveable) currentMoveable.updateRect();
    }, 320);
    AppState.markCurrentConfigDirty();
    renderCardSizeSelector();
    renderLiveData();
    renderJsonCode();
  };

  // Size slider and stepper buttons
  if (sliderSize) {
    sliderSize.addEventListener('input', () => {
      updateSlotValue('size', parseFloat(sliderSize.value), 'slider-size-val', v => `${Math.round(v)}%`);
    });
  }

  document.getElementById('size-decrease')?.addEventListener('click', () => {
    const slot = AppState.slots[AppState.selectedSlotIndex];
    if (!slot) return;
    const newValue = Math.max(10, (slot.size || 50) - 5);
    if (sliderSize) sliderSize.value = newValue;
    updateSlotValue('size', newValue, 'slider-size-val', v => `${Math.round(v)}%`);
  });

  document.getElementById('size-increase')?.addEventListener('click', () => {
    const slot = AppState.slots[AppState.selectedSlotIndex];
    if (!slot) return;
    const newValue = Math.min(200, (slot.size || 50) + 5);
    if (sliderSize) sliderSize.value = newValue;
    updateSlotValue('size', newValue, 'slider-size-val', v => `${Math.round(v)}%`);
  });

  // Position X slider and stepper buttons
  if (sliderX) {
    sliderX.addEventListener('input', () => {
      updateSlotValue('posX', parseFloat(sliderX.value), 'slider-x-val', v => `${v.toFixed(0)}%`);
    });
  }

  document.getElementById('pos-x-decrease')?.addEventListener('click', () => {
    const slot = AppState.slots[AppState.selectedSlotIndex];
    if (!slot) return;
    const newValue = Math.max(-100, (slot.position?.x || 0) - 5);
    if (sliderX) sliderX.value = newValue;
    updateSlotValue('posX', newValue, 'slider-x-val', v => `${v.toFixed(0)}%`);
  });

  document.getElementById('pos-x-increase')?.addEventListener('click', () => {
    const slot = AppState.slots[AppState.selectedSlotIndex];
    if (!slot) return;
    const newValue = Math.min(100, (slot.position?.x || 0) + 5);
    if (sliderX) sliderX.value = newValue;
    updateSlotValue('posX', newValue, 'slider-x-val', v => `${v.toFixed(0)}%`);
  });

  // Position Y slider and stepper buttons
  if (sliderY) {
    sliderY.addEventListener('input', () => {
      updateSlotValue('posY', parseFloat(sliderY.value), 'slider-y-val', v => `${v.toFixed(0)}%`);
    });
  }

  document.getElementById('pos-y-decrease')?.addEventListener('click', () => {
    const slot = AppState.slots[AppState.selectedSlotIndex];
    if (!slot) return;
    const newValue = Math.max(-100, (slot.position?.y || 0) - 5);
    if (sliderY) sliderY.value = newValue;
    updateSlotValue('posY', newValue, 'slider-y-val', v => `${v.toFixed(0)}%`);
  });

  document.getElementById('pos-y-increase')?.addEventListener('click', () => {
    const slot = AppState.slots[AppState.selectedSlotIndex];
    if (!slot) return;
    const newValue = Math.min(100, (slot.position?.y || 0) + 5);
    if (sliderY) sliderY.value = newValue;
    updateSlotValue('posY', newValue, 'slider-y-val', v => `${v.toFixed(0)}%`);
  });

  // Rotation slider and stepper buttons
  if (sliderRotation) {
    sliderRotation.addEventListener('input', () => {
      updateSlotValue('rotation', parseFloat(sliderRotation.value), 'slider-rotation-val', v => `${Math.round(v)}°`);
    });
  }

  document.getElementById('rotation-decrease')?.addEventListener('click', () => {
    const slot = AppState.slots[AppState.selectedSlotIndex];
    if (!slot) return;
    const newValue = Math.max(-180, (slot.rotation || 0) - 5);
    if (sliderRotation) sliderRotation.value = newValue;
    updateSlotValue('rotation', newValue, 'slider-rotation-val', v => `${Math.round(v)}°`);
  });

  document.getElementById('rotation-increase')?.addEventListener('click', () => {
    const slot = AppState.slots[AppState.selectedSlotIndex];
    if (!slot) return;
    const newValue = Math.min(180, (slot.rotation || 0) + 5);
    if (sliderRotation) sliderRotation.value = newValue;
    updateSlotValue('rotation', newValue, 'slider-rotation-val', v => `${Math.round(v)}°`);
  });

  // Editable value input handlers (Enter key and blur to apply)
  const setupValueInput = (inputId, sliderId, property, min, max, parser, formatter) => {
    const input = document.getElementById(inputId);
    const slider = document.getElementById(sliderId);
    if (!input) return;

    const applyValue = () => {
      const slot = AppState.slots[AppState.selectedSlotIndex];
      if (!slot) return;

      // Parse the value (strip % or ° suffix)
      let rawValue = input.value.replace(/[%°]/g, '').trim();
      let numValue = parser(rawValue);

      // Clamp to min/max
      if (isNaN(numValue)) {
        // Reset to current value if invalid
        updateAdjustmentSliders();
        return;
      }
      numValue = Math.max(min, Math.min(max, numValue));

      // Update slider and slot
      if (slider) slider.value = numValue;
      updateSlotValue(property, numValue, inputId, formatter);
    };

    // Apply on Enter key
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        applyValue();
        input.blur();
      }
    });

    // Apply on blur (focus loss)
    input.addEventListener('blur', applyValue);
  };

  // Setup all value inputs
  setupValueInput('slider-size-val', 'slider-size', 'size', 10, 200, parseFloat, v => `${Math.round(v)}%`);
  setupValueInput('slider-x-val', 'slider-x', 'posX', -100, 100, parseFloat, v => `${v.toFixed(0)}%`);
  setupValueInput('slider-y-val', 'slider-y', 'posY', -100, 100, parseFloat, v => `${v.toFixed(0)}%`);
  setupValueInput('slider-rotation-val', 'slider-rotation', 'rotation', -180, 180, parseFloat, v => `${Math.round(v)}°`);

  // Reset button handlers
  document.getElementById('reset-size')?.addEventListener('click', () => {
    if (sliderSize) sliderSize.value = 50;
    updateSlotValue('size', 50, 'slider-size-val', v => `${Math.round(v)}%`);
  });

  document.getElementById('reset-pos-x')?.addEventListener('click', () => {
    if (sliderX) sliderX.value = 0;
    updateSlotValue('posX', 0, 'slider-x-val', v => `${v.toFixed(0)}%`);
  });

  document.getElementById('reset-pos-y')?.addEventListener('click', () => {
    if (sliderY) sliderY.value = 0;
    updateSlotValue('posY', 0, 'slider-y-val', v => `${v.toFixed(0)}%`);
  });

  document.getElementById('reset-rotation')?.addEventListener('click', () => {
    if (sliderRotation) sliderRotation.value = 0;
    updateSlotValue('rotation', 0, 'slider-rotation-val', v => `${Math.round(v)}°`);
  });

  // Auto-center button handler
  document.getElementById('auto-center-btn')?.addEventListener('click', () => {
    const slot = AppState.slots[AppState.selectedSlotIndex];
    if (!slot) return;

    // Calculate center position based on size
    // For an image with size S%, center position = (100 - S) / 2
    const size = slot.size || 50;
    const centerX = (100 - size) / 2;
    const centerY = (100 - size) / 2;

    // Update both X and Y positions
    slot.position = { x: centerX, y: centerY };

    // Update sliders
    if (sliderX) sliderX.value = centerX;
    if (sliderY) sliderY.value = centerY;
    document.getElementById('slider-x-val').value = `${centerX.toFixed(0)}%`;
    document.getElementById('slider-y-val').value = `${centerY.toFixed(0)}%`;

    // Update UI
    applySlotToDOM(AppState.selectedSlotIndex);
    // Wait for CSS transition to complete (300ms) before updating Moveable rect
    setTimeout(() => {
      if (currentMoveable) currentMoveable.updateRect();
    }, 320);
    AppState.markCurrentConfigDirty();
    renderCardSizeSelector();
    renderLiveData();
    renderJsonCode();
  });

  // Layer buttons are now dynamically rendered - see renderLayerButtons()
}

/**
 * Apply slot state to DOM element
 */
function applySlotToDOM(index) {
  const slot = AppState.slots[index];
  if (!slot) return;

  const product = document.getElementById(`product-${index}`);
  if (!product) return;

  product.style.left = `${slot.position?.x || 0}%`;
  product.style.top = `${slot.position?.y || 0}%`;
  product.style.width = `${slot.size || 50}%`;
  // height is handled by CSS aspect-ratio: 1 for square containers
  product.style.zIndex = slot.zIndex || 1;
  product.style.transform = `rotate(${slot.rotation || 0}deg)`;
}

/**
 * Render live data for all slots
 */
function renderLiveData() {
  const container = document.getElementById('live-data');
  if (!container) return;

  if (AppState.slots.length === 0) {
    container.innerHTML = '<p class="text-muted text-xs">No images to display</p>';
    return;
  }

  container.innerHTML = AppState.slots.map((slot, i) => `
    <div style="margin-bottom: 8px; ${i === AppState.selectedSlotIndex ? 'background: var(--primary-color-light); padding: 4px; border-radius: 4px;' : ''}">
      <div class="live-data-title">Image ${i + 1}</div>
      <div class="live-data-row">
        <span class="live-data-label">position</span>
        <span class="live-data-value">${(slot.position?.x || 0).toFixed(0)}%, ${(slot.position?.y || 0).toFixed(0)}%</span>
      </div>
      <div class="live-data-row">
        <span class="live-data-label">size</span>
        <span class="live-data-value">${(slot.size || 50).toFixed(0)}%</span>
      </div>
      <div class="live-data-row">
        <span class="live-data-label">rotation</span>
        <span class="live-data-value">${(slot.rotation || 0).toFixed(0)}°</span>
      </div>
      <div class="live-data-row">
        <span class="live-data-label">z-index</span>
        <span class="live-data-value">${slot.zIndex || 1}</span>
      </div>
    </div>
  `).join('');
}

/**
 * Render selected image buttons in Hero Adjustments (with thumbnails)
 */
function renderSelectedImageButtons() {
  const container = document.getElementById('selected-image-buttons');
  if (!container) return;

  container.innerHTML = '';

  // Only show buttons for existing slots (no placeholder buttons)
  for (let i = 0; i < AppState.slots.length; i++) {
    const slot = AppState.slots[i];
    const btn = document.createElement('button');
    btn.className = 'image-select-btn';
    if (i === AppState.selectedSlotIndex) btn.classList.add('active');

    // Use thumbnail image instead of colored dot
    if (slot.image?.url) {
      btn.innerHTML = `<img src="${slot.image.url}" alt="${slot.image.name || ''}" class="thumb"><span class="slot-number">${i + 1}</span>`;
    } else {
      btn.innerHTML = `<span class="slot-number">${i + 1}</span>`;
    }

    btn.onclick = () => {
      selectSlot(i);
    };
    container.appendChild(btn);
  }
}

/**
 * Render all UI components
 */
function renderAll() {
  renderCardSizeSelector();
  renderPreview();
  renderImageCountSelector();
  renderLayersList();
  renderSlotInfo();
  renderSelectedImageButtons();
  renderLiveData();
  renderLayerButtons();
  renderJsonCode();
  updateTemplateStripSize();
}

/**
 * Render slot/image info with full transform controls
 */
function renderSlotInfo() {
  const container = document.getElementById('slot-info');
  if (!container) return;

  if (AppState.selectedSlotIndex < 0 || AppState.selectedSlotIndex >= AppState.slots.length) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center" style="min-height: 200px;">
        <i class="pi pi-sliders-h" style="font-size: 2rem; color: var(--text-color-muted);"></i>
        <p class="text-muted text-sm mt-4">Select an image to adjust</p>
        <p class="text-xs text-muted">Click on the preview or a layer</p>
      </div>
    `;
    return;
  }

  const slot = AppState.slots[AppState.selectedSlotIndex];
  const maxZ = Math.max(...AppState.slots.map(s => s.zIndex));
  const minZ = Math.min(...AppState.slots.map(s => s.zIndex));

  container.innerHTML = `
    <!-- Selected Image Header -->
    <div class="flex items-center gap-3 mb-4 pb-3" style="border-bottom: 1px solid var(--surface-border);">
      <img src="${slot.image.url}" alt="${slot.image.name}"
           style="width: 48px; height: 48px; object-fit: contain; border-radius: var(--border-radius); background: var(--surface-ground);">
      <div class="flex-1">
        <div class="font-semibold" style="font-size: 13px;">${slot.image.name}</div>
        <div class="text-xs text-muted">Layer ${slot.zIndex} of ${AppState.slots.length}</div>
      </div>
    </div>

    <!-- Layer Order -->
    <div class="mb-4">
      <label class="text-sm font-medium mb-2 block">Layer Order</label>
      <div class="flex gap-1">
        <button class="p-button p-button-secondary p-button-sm" id="send-back-btn"
                ${slot.zIndex <= minZ ? 'disabled' : ''} title="Send to Back">
          <i class="pi pi-angle-double-down"></i>
        </button>
        <button class="p-button p-button-secondary p-button-sm" id="send-backward-btn"
                ${slot.zIndex <= minZ ? 'disabled' : ''} title="Send Backward">
          <i class="pi pi-angle-down"></i>
        </button>
        <button class="p-button p-button-secondary p-button-sm" id="bring-forward-btn"
                ${slot.zIndex >= maxZ ? 'disabled' : ''} title="Bring Forward">
          <i class="pi pi-angle-up"></i>
        </button>
        <button class="p-button p-button-secondary p-button-sm" id="bring-front-btn"
                ${slot.zIndex >= maxZ ? 'disabled' : ''} title="Bring to Front">
          <i class="pi pi-angle-double-up"></i>
        </button>
      </div>
    </div>

    <!-- Position -->
    <div class="mb-4">
      <label class="text-sm font-medium mb-2 block">Position</label>
      <div class="flex gap-3">
        <div class="flex-1">
          <label class="text-xs text-muted block mb-1">X: ${slot.position.x}%</label>
          <input type="range" min="0" max="60" step="1" value="${slot.position.x}"
                 class="p-slider-input" data-prop="posX">
        </div>
        <div class="flex-1">
          <label class="text-xs text-muted block mb-1">Y: ${slot.position.y}%</label>
          <input type="range" min="0" max="60" step="1" value="${slot.position.y}"
                 class="p-slider-input" data-prop="posY">
        </div>
      </div>
    </div>

    <!-- Size -->
    <div class="mb-4">
      <label class="text-sm font-medium mb-2 block">Size: ${slot.size || 50}%</label>
      <input type="range" min="20" max="100" step="5" value="${slot.size || 50}"
             class="p-slider-input" data-prop="size">
    </div>

    <!-- Scale -->
    <div class="mb-4">
      <label class="text-sm font-medium mb-2 block">Scale: ${slot.scale.toFixed(2)}x</label>
      <input type="range" min="0.3" max="1.5" step="0.05" value="${slot.scale}"
             class="p-slider-input" data-prop="scale">
    </div>

    <!-- Rotation -->
    <div class="mb-4">
      <label class="text-sm font-medium mb-2 block">Rotation: ${slot.rotation || 0}°</label>
      <input type="range" min="-45" max="45" step="1" value="${slot.rotation || 0}"
             class="p-slider-input" data-prop="rotation">
    </div>

    <!-- Actions -->
    <div class="flex justify-between pt-3" style="border-top: 1px solid var(--surface-border);">
      <button class="p-button p-button-text p-button-sm" id="remove-slot-btn">
        <i class="pi pi-times"></i> Remove
      </button>
      <button class="p-button p-button-secondary p-button-sm" id="reset-slot-btn">
        <i class="pi pi-refresh"></i> Reset
      </button>
    </div>
  `;

  // Layer order buttons
  document.getElementById('send-back-btn')?.addEventListener('click', () => {
    AppState.sendToBack(AppState.selectedSlotIndex);
    AppState.markCurrentConfigDirty();
    renderCardSizeSelector();
    renderPreview();
    renderSlotInfo();
    renderImageList();
    renderLayersList();
  });

  document.getElementById('send-backward-btn')?.addEventListener('click', () => {
    AppState.sendBackward(AppState.selectedSlotIndex);
    AppState.markCurrentConfigDirty();
    renderCardSizeSelector();
    renderPreview();
    renderSlotInfo();
    renderImageList();
    renderLayersList();
  });

  document.getElementById('bring-forward-btn')?.addEventListener('click', () => {
    AppState.bringForward(AppState.selectedSlotIndex);
    AppState.markCurrentConfigDirty();
    renderCardSizeSelector();
    renderPreview();
    renderSlotInfo();
    renderImageList();
    renderLayersList();
  });

  document.getElementById('bring-front-btn')?.addEventListener('click', () => {
    AppState.bringToFront(AppState.selectedSlotIndex);
    AppState.markCurrentConfigDirty();
    renderCardSizeSelector();
    renderPreview();
    renderSlotInfo();
    renderImageList();
    renderLayersList();
  });

  // Sliders
  container.querySelectorAll('[data-prop]').forEach(input => {
    input.addEventListener('input', () => {
      const prop = input.dataset.prop;
      const value = parseFloat(input.value);

      if (prop === 'scale') {
        AppState.updateSlot(AppState.selectedSlotIndex, { scale: value });
      } else if (prop === 'rotation') {
        AppState.updateSlot(AppState.selectedSlotIndex, { rotation: value });
      } else if (prop === 'size') {
        AppState.updateSlot(AppState.selectedSlotIndex, { size: value });
      } else if (prop === 'posX') {
        const slot = AppState.slots[AppState.selectedSlotIndex];
        AppState.updateSlot(AppState.selectedSlotIndex, {
          position: { ...slot.position, x: value }
        });
      } else if (prop === 'posY') {
        const slot = AppState.slots[AppState.selectedSlotIndex];
        AppState.updateSlot(AppState.selectedSlotIndex, {
          position: { ...slot.position, y: value }
        });
      }

      AppState.markCurrentConfigDirty();
      renderCardSizeSelector();
      renderPreview();
      renderSlotInfo();
    });
  });

  // Remove button
  document.getElementById('remove-slot-btn')?.addEventListener('click', () => {
    AppState.removeSlot(AppState.selectedSlotIndex);
    renderPreview();
    renderSlotInfo();
    renderImageList();
    renderLayersList();
    renderImageCountSelector();
  });

  // Reset button
  document.getElementById('reset-slot-btn')?.addEventListener('click', () => {
    const index = AppState.selectedSlotIndex;
    AppState.updateSlot(index, {
      position: { x: index * 15, y: index * 15 },
      scale: 0.6,
      rotation: 0,
      size: 50
    });
    renderPreview();
    renderSlotInfo();
  });
}

/**
 * Render image count selector (1-5) - Full width with equal buttons
 */
function renderImageCountSelector() {
  const container = document.getElementById('image-count-selector');
  if (!container) return;

  container.innerHTML = [1, 2, 3, 4, 5].map(count => `
    <button class="image-count-btn ${AppState.imageCount === count ? 'active' : ''}"
            data-count="${count}">
      ${count}
    </button>
  `).join('');

  // Add click handlers
  container.querySelectorAll('[data-count]').forEach(btn => {
    btn.addEventListener('click', () => {
      const count = parseInt(btn.dataset.count);
      AppState.setImageCount(count);
      renderImageCountSelector();
      renderImageList();
      renderLayersList();
      renderPreview();
      renderSlotInfo();
      renderLayerButtons(); // Update layer buttons based on new count
      renderSelectedImageButtons();
    });
  });
}

/**
 * Render layer buttons based on image count
 * 1 = No buttons (hide section)
 * 2 = Top, Bottom
 * 3 = Top, Middle, Bottom
 * 4 = Top, Middle Top, Middle Bottom, Bottom
 * 5 = Top, Middle Top, Middle, Middle Bottom, Bottom
 */
function renderLayerButtons() {
  const layerGroup = document.getElementById('layer-group');
  const container = document.getElementById('layer-buttons');
  if (!container || !layerGroup) return;

  const imageCount = AppState.slots.length;

  // Hide layer section if only 1 image
  if (imageCount <= 1) {
    layerGroup.style.display = 'none';
    return;
  }

  layerGroup.style.display = '';

  // Define layer configurations based on image count
  // Higher z-index = renders on top in CSS, so Top has highest z value
  const layerConfigs = {
    2: [
      { z: 2, label: 'Top' },
      { z: 1, label: 'Bottom' }
    ],
    3: [
      { z: 3, label: 'Top' },
      { z: 2, label: 'Middle' },
      { z: 1, label: 'Bottom' }
    ],
    4: [
      { z: 4, label: 'Top' },
      { z: 3, label: 'Mid Top' },
      { z: 2, label: 'Mid Bot' },
      { z: 1, label: 'Bottom' }
    ],
    5: [
      { z: 5, label: 'Top' },
      { z: 4, label: 'Mid Top' },
      { z: 3, label: 'Middle' },
      { z: 2, label: 'Mid Bot' },
      { z: 1, label: 'Bottom' }
    ]
  };

  const config = layerConfigs[imageCount] || layerConfigs[3];
  const currentZ = AppState.slots[AppState.selectedSlotIndex]?.zIndex || 1;

  container.innerHTML = config.map(layer => `
    <button class="layer-btn ${currentZ === layer.z ? 'active' : ''}"
            data-z="${layer.z}"
            title="Layer ${layer.z} (${layer.label})">
      ${layer.label}
    </button>
  `).join('');

  // Add click handlers
  container.querySelectorAll('.layer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const slot = AppState.slots[AppState.selectedSlotIndex];
      if (!slot) return;

      const currentZ = slot.zIndex;
      const targetZ = parseInt(btn.dataset.z);

      // Skip if already at target layer
      if (currentZ === targetZ) return;

      // Cascade reorder: push other images to make room
      // Higher z-index = Top (front), Lower z-index = Bottom (back)
      if (targetZ > currentZ) {
        // Moving up (to front): push others down (decrease their z-index)
        AppState.slots.forEach(s => {
          if (s !== slot && s.zIndex > currentZ && s.zIndex <= targetZ) {
            s.zIndex -= 1;
          }
        });
      } else {
        // Moving down (to back): push others up (increase their z-index)
        AppState.slots.forEach(s => {
          if (s !== slot && s.zIndex >= targetZ && s.zIndex < currentZ) {
            s.zIndex += 1;
          }
        });
      }

      // Set the selected slot to target layer
      slot.zIndex = targetZ;

      // Update active state on buttons
      container.querySelectorAll('.layer-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update all affected UI elements
      AppState.slots.forEach((s, i) => applySlotToDOM(i));
      AppState.markCurrentConfigDirty();
      renderCardSizeSelector();
      renderLiveData();
      renderPreview();
      renderJsonCode();
      renderLayersList();
    });
  });
}

/**
 * Render JSON code window with image data
 */
function renderJsonCode() {
  const container = document.getElementById('json-code');
  if (!container) return;

  // Build image data object
  const imageData = AppState.slots.map((slot, index) => ({
    id: index + 1,
    name: slot.image?.name || `Image ${index + 1}`,
    position: {
      x: Math.round(slot.position?.x || 0),
      y: Math.round(slot.position?.y || 0)
    },
    size: Math.round(slot.size || 50),
    rotation: Math.round(slot.rotation || 0),
    zIndex: slot.zIndex || 1
  }));

  const jsonString = JSON.stringify(imageData, null, 2);
  container.textContent = jsonString;

  // Setup copy button handler (only once)
  const copyBtn = document.getElementById('json-copy-btn');
  if (copyBtn && !copyBtn.hasAttribute('data-initialized')) {
    copyBtn.setAttribute('data-initialized', 'true');
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(jsonString).then(() => {
        copyBtn.innerHTML = '<i class="pi pi-check"></i>';
        setTimeout(() => {
          copyBtn.innerHTML = '<i class="pi pi-copy"></i>';
        }, 1500);
      });
    });
  }
}

/**
 * Render hero image list in the Hero Image card
 * Format: Thumbnail + URL/filename + Replace button + X button
 */
function renderLayersList() {
  const container = document.getElementById('layers-list');
  if (!container) return;

  // Sort slots by z-index for display (highest z-index = position 1 = top of list)
  const sortedByLayer = [...AppState.slots].sort((a, b) => b.zIndex - a.zIndex);

  if (sortedByLayer.length === 0) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center" style="padding: var(--spacing-6);">
        <i class="pi pi-images" style="font-size: 2rem; color: var(--text-color-muted);"></i>
        <p class="text-muted text-sm mt-3">No images yet</p>
        <p class="text-xs text-muted">Select an image count above</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="hero-image-list">
      ${sortedByLayer.map((slot) => {
        const slotIndex = AppState.slots.indexOf(slot);
        // Generate a display URL (truncate filename for display)
        const displayUrl = slot.image.url || slot.image.filename || 'No URL';
        return `
          <div class="hero-image-item ${AppState.selectedSlotIndex === slotIndex ? 'hero-image-item--selected' : ''}"
               data-slot-index="${slotIndex}">
            <img src="${slot.image.url}" alt="${slot.image.name}" class="hero-image-item__thumb">
            <span class="hero-image-item__url" title="${displayUrl}">${displayUrl}</span>
            <div class="hero-image-item__actions">
              <button class="hero-image-item__replace-btn" data-action="replace" data-slot-index="${slotIndex}">
                <i class="pi pi-images"></i> Change Media
              </button>
            </div>
            <button class="hero-image-item__remove-btn" data-action="remove" data-slot-index="${slotIndex}" title="Remove image">
              <i class="pi pi-times"></i>
            </button>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Slot selection (click on row)
  container.querySelectorAll('.hero-image-item').forEach(item => {
    item.addEventListener('click', (e) => {
      // Don't select if clicking buttons
      if (e.target.closest('button')) return;
      AppState.selectSlot(parseInt(item.dataset.slotIndex));
      renderLayersList();
      renderSlotInfo();
      renderPreview();
      renderSelectedImageButtons();
      updateAdjustmentSliders();
    });
  });

  // Replace button
  container.querySelectorAll('[data-action="replace"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const slotIndex = parseInt(btn.dataset.slotIndex);
      showImageReplacePicker(slotIndex);
    });
  });

  // Remove button
  container.querySelectorAll('[data-action="remove"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const slotIndex = parseInt(btn.dataset.slotIndex);
      AppState.removeSlot(slotIndex);
      AppState.setImageCount(AppState.slots.length);
      renderAll();
    });
  });
}

/**
 * Setup drag and drop for layers list
 */
function setupLayersDragAndDrop(container) {
  let draggedItem = null;
  let draggedIndex = null;

  const layerItems = container.querySelectorAll('.layer-item');

  layerItems.forEach(item => {
    // Drag start
    item.addEventListener('dragstart', (e) => {
      draggedItem = item;
      draggedIndex = parseInt(item.dataset.displayIndex);
      item.classList.add('layer-item--dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', item.dataset.slotIndex);
    });

    // Drag end
    item.addEventListener('dragend', () => {
      if (draggedItem) {
        draggedItem.classList.remove('layer-item--dragging');
      }
      layerItems.forEach(i => i.classList.remove('layer-item--drop-target'));
      draggedItem = null;
      draggedIndex = null;
    });

    // Drag over
    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (item !== draggedItem) {
        item.classList.add('layer-item--drop-target');
      }
    });

    // Drag leave
    item.addEventListener('dragleave', () => {
      item.classList.remove('layer-item--drop-target');
    });

    // Drop
    item.addEventListener('drop', (e) => {
      e.preventDefault();
      item.classList.remove('layer-item--drop-target');

      if (!draggedItem || item === draggedItem) return;

      const targetDisplayIndex = parseInt(item.dataset.displayIndex);

      // Reorder the z-indices based on the new visual order
      reorderLayersByDrag(draggedIndex, targetDisplayIndex);
    });
  });
}

/**
 * Reorder layers by updating z-indices after drag
 * displayIndex 0 = top of list = highest z-index
 */
function reorderLayersByDrag(fromDisplayIndex, toDisplayIndex) {
  // Get current sorted order (highest z-index first)
  const sortedSlots = [...AppState.slots].sort((a, b) => b.zIndex - a.zIndex);

  // Remove the dragged item and insert at new position
  const [movedSlot] = sortedSlots.splice(fromDisplayIndex, 1);
  sortedSlots.splice(toDisplayIndex, 0, movedSlot);

  // Reassign z-indices based on new order
  // Position 0 in array (top of list) gets highest z-index
  const maxZ = sortedSlots.length;
  sortedSlots.forEach((slot, displayIndex) => {
    const slotIndex = AppState.slots.indexOf(slot);
    AppState.slots[slotIndex].zIndex = maxZ - displayIndex;
  });

  // Mark config as dirty (user made actual modification)
  AppState.markCurrentConfigDirty();

  // Re-render everything
  renderCardSizeSelector();
  renderLayersList();
  renderPreview();
  renderSlotInfo();
}

/**
 * Render image list in sidebar (kept for sidebar layers display)
 */
function renderImageList() {
  const container = document.getElementById('image-list');
  if (!container) return;

  // Sort slots by z-index for display
  const sortedByLayer = [...AppState.slots].sort((a, b) => b.zIndex - a.zIndex);

  container.innerHTML = `
    <div class="nav-section">
      <div class="nav-section-title">Layers (${AppState.slots.length})</div>
      ${sortedByLayer.map((slot) => {
        const index = AppState.slots.indexOf(slot);
        return `
          <div class="nav-item ${AppState.selectedSlotIndex === index ? 'active' : ''}"
               data-slot-index="${index}">
            <span style="font-size: 10px; color: var(--surface-dark-text-muted); width: 16px;">${slot.zIndex}</span>
            <img src="${slot.image.url}" alt=""
                 style="width: 32px; height: 32px; object-fit: contain; border-radius: 4px; background: rgba(255,255,255,0.1);">
            <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px;">
              ${slot.image.name}
            </span>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Slot selection
  container.querySelectorAll('[data-slot-index]').forEach(item => {
    item.addEventListener('click', () => {
      AppState.selectSlot(parseInt(item.dataset.slotIndex));
      renderImageList();
      renderLayersList();
      renderSlotInfo();
      renderPreview();
    });
  });
}

/**
 * Show image picker modal
 */
function showImagePicker() {
  const modal = document.getElementById('image-picker-modal');
  if (!modal) return;

  const grid = modal.querySelector('.image-picker-grid');
  if (grid) {
    grid.innerHTML = AppState.sampleImages.map(img => `
      <div class="image-picker-item" data-image-id="${img.id}">
        <img src="${img.url}" alt="${img.name}">
        <span>${img.name}</span>
      </div>
    `).join('');

    grid.querySelectorAll('[data-image-id]').forEach(item => {
      item.addEventListener('click', () => {
        const img = AppState.sampleImages.find(i => i.id === item.dataset.imageId);
        if (img) {
          AppState.addSlot(img);
          renderImageList();
          renderLayersList();
          renderPreview();
          hideImagePicker();
        }
      });
    });
  }

  modal.classList.add('active');
}

/**
 * Hide image picker modal
 */
function hideImagePicker() {
  const modal = document.getElementById('image-picker-modal');
  if (modal) {
    modal.classList.remove('active');
  }
}

// Track which slot is being replaced
let replaceSlotIndex = null;

/**
 * Show image picker to replace an existing image
 */
function showImageReplacePicker(slotIndex) {
  replaceSlotIndex = slotIndex;
  const modal = document.getElementById('image-picker-modal');
  if (!modal) return;

  const grid = modal.querySelector('.image-picker-grid');
  if (grid) {
    grid.innerHTML = AppState.sampleImages.map(img => `
      <div class="image-picker-item" data-image-id="${img.id}">
        <img src="${img.url}" alt="${img.name}">
        <span>${img.name}</span>
      </div>
    `).join('');

    grid.querySelectorAll('[data-image-id]').forEach(item => {
      item.addEventListener('click', () => {
        const img = AppState.sampleImages.find(i => i.id === item.dataset.imageId);
        if (img && replaceSlotIndex !== null) {
          // Replace the image in the slot
          AppState.slots[replaceSlotIndex].image = img;
          AppState.markCurrentConfigDirty();
          replaceSlotIndex = null;
          hideImagePicker();
          renderAll();
        }
      });
    });
  }

  modal.classList.add('active');
}

// Template Strip instance
let templateStrip = null;

// Layout Panel instance
let layoutPanel = null;

// Background Chooser instance (sidebar)
let sidebarBackgroundChooser = null;

// Moveable Controller instance
let moveableController = null;

// Image Selection Modal instance
let imageSelectionModal = null;

// Pending size change (for modal flow)
let pendingSizeChange = null;

/**
 * Initialize Image Selection Modal
 */
function initImageSelectionModal() {
  if (typeof ImageSelectionModal === 'undefined') {
    console.warn('ImageSelectionModal class not found');
    return;
  }

  imageSelectionModal = new ImageSelectionModal({
    onSelect: (selectedIndices) => {
      if (!pendingSizeChange) return;

      // Mark slots as active/inactive based on selection
      AppState.slots.forEach((slot, index) => {
        slot.active = selectedIndices.includes(index);
      });

      // Complete the size change
      const targetSize = pendingSizeChange;
      pendingSizeChange = null;

      AppState.cardSize = targetSize;

      // Validate layout for new size
      if (typeof isLayoutAllowed === 'function' && !isLayoutAllowed(targetSize, AppState.layout)) {
        AppState.layout = getDefaultLayout(targetSize);
      }

      // Load config if customized
      if (AppState.isConfigCustomized(targetSize)) {
        AppState.loadConfigForSize(targetSize);
      }

      AppState._notify('cardSize', { oldSize: null, newSize: targetSize });

      // Re-render UI
      renderCardSizeSelector();
      renderPreview();
      renderLayoutOptions();
      renderImageList();
      renderLayersList();
      renderSlotInfo();
      updateTemplateStripSize();
    },
    onCancel: () => {
      // User cancelled - restore the size selector without changing
      pendingSizeChange = null;
      renderCardSizeSelector();
    }
  });

  console.log('ImageSelectionModal initialized');
}

/**
 * Initialize Moveable Controller for drag/drop/scale/rotate
 */
function initMoveableController() {
  if (typeof MoveableController === 'undefined') {
    console.warn('MoveableController class not found');
    return;
  }

  moveableController = new MoveableController({
    onUpdate: (slotIndex, updates) => {
      // Update AppState when user drags/scales/rotates
      AppState.updateSlot(slotIndex, updates);
      // Update slider UI
      renderSlotInfo();
    },
    onSelect: (index) => {
      // Update selection in AppState
      AppState.selectSlot(index);
      renderPreview();
      renderSlotInfo();
      renderImageList();
      renderLayersList();
    }
  });

  // Initialize with preview area
  const previewArea = document.querySelector('.preview-area');
  if (previewArea) {
    moveableController.init(previewArea);
  }

  // Subscribe to selection changes from other UI (like layers list)
  AppState.subscribe((changeType, data) => {
    if (changeType === 'selection' && moveableController) {
      moveableController.updateSelection(data.index);
    }
  });

  console.log('MoveableController initialized');
}

/**
 * Initialize Template Strip component
 */
function initTemplateStrip() {
  const container = document.getElementById('template-strip-container');
  if (!container || typeof TemplateStrip === 'undefined') {
    console.warn('Template strip container or class not found');
    return;
  }

  templateStrip = new TemplateStrip({
    cardSize: AppState.cardSize,
    imageCount: AppState.slots.length || 1,
    selectedTemplateId: AppState.template?.id || null,
    onSelect: (template, previousId) => {
      console.log('Template selected:', template.name);

      // Apply template to state
      if (typeof applyTemplateToState === 'function') {
        applyTemplateToState(template.id);
      }

      // Re-render affected components
      renderLayoutOptions();
      renderPreview();
      renderImageList();
      renderSlotInfo();
    },
    onPreview: (template) => {
      // Could show a preview tooltip or highlight
      console.log('Hovering template:', template.name);
    }
  });

  templateStrip.init(container);
}

/**
 * Update template strip when card size changes
 */
function updateTemplateStripSize() {
  if (templateStrip) {
    templateStrip.setCardSize(AppState.cardSize);
    templateStrip.setImageCount(AppState.slots.length || 1);
  }
}

/**
 * Update template strip when image count changes
 */
function updateTemplateStripImageCount() {
  if (templateStrip) {
    templateStrip.setImageCount(AppState.slots.length || 1);
  }
}

/**
 * Initialize Layout Panel component
 */
function initLayoutPanel() {
  const container = document.getElementById('layout-panel-container');
  if (!container || typeof LayoutPanel === 'undefined') {
    console.warn('Layout panel container or class not found');
    return;
  }

  layoutPanel = new LayoutPanel({
    onStateChange: (newState, oldState) => {
      console.log(`Panel state changed: ${oldState} -> ${newState}`);
    },
    onApply: () => {
      console.log('Layout configuration applied');
      // Refresh main UI
      renderCardSizeSelector();
      renderImageCountSelector();
      renderPreview();
      renderImageList();
      renderLayersList();
      renderSlotInfo();
      updateTemplateStripSize();
    },
    onCancel: () => {
      console.log('Layout configuration cancelled');
    }
  });

  layoutPanel.init(container);
}

/**
 * Initialize Background Chooser in main content area
 * Uses split mode: color controls in Background Color card, image controls in Background Image card
 */
function initBackgroundChooser() {
  const imageContainer = document.getElementById('background-chooser-container');
  const colorContainer = document.getElementById('background-color-container');

  if (!imageContainer || typeof BackgroundChooser === 'undefined') {
    console.warn('Background chooser container or class not found');
    return;
  }

  sidebarBackgroundChooser = new BackgroundChooser({
    type: AppState.background.type,
    value: AppState.background.value,
    position: AppState.background.position,
    size: AppState.background.size,
    repeat: AppState.background.repeat,
    onChange: (type, value, fullConfig) => {
      AppState.setBackground(type, value, fullConfig);
      renderPreview();
      // Update layout panel background picker if open
      if (layoutPanel && layoutPanel.isOpen) {
        layoutPanel.renderBackgroundPicker();
      }
    }
  });

  // Initialize with split mode if color container exists
  if (colorContainer) {
    sidebarBackgroundChooser.init(imageContainer, colorContainer);
  } else {
    // Fallback to legacy single container mode
    sidebarBackgroundChooser.init(imageContainer);
  }

  // Add compact class for the editor card
  imageContainer.querySelector('.background-chooser')?.classList.add('background-chooser--compact');
  colorContainer?.querySelector('.background-chooser')?.classList.add('background-chooser--compact');
}

/**
 * Initialize the application
 */
function initApp() {
  console.log('Initializing Media Layout Prototype...');

  // Load sample images
  loadSampleImages();

  // Setup keyboard shortcuts
  setupKeyboardShortcuts();

  // Initialize demo slots
  initializeDemoSlots();

  // Select first slot by default
  if (AppState.slots.length > 0) {
    AppState.selectedSlotIndex = 0;
  }

  // Initial render
  renderCardSizeSelector();
  renderImageCountSelector();
  renderPreview();
  renderImageList();
  renderLayersList();
  renderSlotInfo();
  renderSelectedImageButtons();
  renderLiveData();
  renderLayerButtons();
  renderJsonCode();

  // Setup adjustment sliders
  setupAdjustmentSliders();

  // Setup width control
  setupWidthControl();

  // Initialize Template Strip
  initTemplateStrip();

  // Initialize Layout Panel
  initLayoutPanel();

  // Initialize Background Chooser
  initBackgroundChooser();

  // Initialize Moveable Controller for drag/drop (deprecated - using inline Moveable now)
  // initMoveableController();

  // Initialize Image Selection Modal
  initImageSelectionModal();

  // Modal close button
  document.getElementById('close-picker-btn')?.addEventListener('click', hideImagePicker);

  // Configure Layout button - opens the layout panel
  document.getElementById('configure-layout-btn')?.addEventListener('click', () => {
    if (layoutPanel) {
      layoutPanel.open('quick');
    }
  });

  // Export config button
  document.getElementById('export-config-btn')?.addEventListener('click', () => {
    const config = AppState.getConfiguration();
    console.log('Configuration:', JSON.stringify(config, null, 2));
    alert('Configuration exported to console. Check developer tools.');
  });

  console.log('Media Layout Prototype initialized!');
  console.log('Keyboard shortcuts: Cmd+M (toggle), Cmd+1 (quick), Cmd+2 (advanced), Esc (close), 1-9 (templates)');
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
