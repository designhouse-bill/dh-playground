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
  imageCount: 2, // Target image count (1-5)

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
   * Update card size
   */
  setCardSize(size) {
    if (this.cardSize === size) return;

    const oldSize = this.cardSize;
    this.cardSize = size;

    // Validate layout for new size
    if (typeof isLayoutAllowed === 'function' && !isLayoutAllowed(size, this.layout)) {
      this.layout = getDefaultLayout(size);
    }

    // Validate image count
    if (typeof getMaxImages === 'function') {
      const maxImages = getMaxImages(size);
      if (this.slots.length > maxImages) {
        this.slots = this.slots.slice(0, maxImages);
      }
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
  // Add first 2 sample images as demo slots
  if (AppState.sampleImages.length >= 2) {
    AppState.addSlot(AppState.sampleImages[0]);
    AppState.addSlot(AppState.sampleImages[1]);
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
  const container = document.getElementById('card-size-selector');
  if (!container) return;

  // Arrange in 3x3 grid order
  const sizes = [
    ['1x1', '2x1', '3x1'],
    ['1x2', '2x2', '3x2'],
    ['1x3', '2x3', '3x3']
  ];

  container.innerHTML = `
    <div class="card-size-grid">
      ${sizes.map(row => row.map(size => `
        <button class="card-size-btn ${AppState.cardSize === size ? 'card-size-btn--selected' : ''}"
                data-size="${size}">
          ${size}
        </button>
      `).join('')).join('')}
    </div>
  `;

  // Add click handlers
  container.querySelectorAll('[data-size]').forEach(btn => {
    btn.addEventListener('click', () => {
      AppState.setCardSize(btn.dataset.size);
      renderCardSizeSelector();
      renderPreview();
      renderLayoutOptions();
      updateTemplateStripSize();
    });
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
 * Render the preview card with absolute positioned slots
 */
function renderPreview() {
  const container = document.getElementById('preview-container');
  if (!container) return;

  const bg = AppState.background;

  // Build background style with all properties
  let bgStyle = '';

  // Background color (always applied, even when image is set)
  if (bg.type === 'image' && bg.color) {
    // When image is set, use the separate color property
    bgStyle += `background-color: ${bg.color};`;
  } else if (bg.value === 'transparent') {
    bgStyle += 'background-color: transparent;';
  } else if (bg.value && bg.value.includes('gradient')) {
    bgStyle += `background: ${bg.value};`;
  } else {
    bgStyle += `background-color: ${bg.value};`;
  }

  // Background image with full properties
  if (bg.type === 'image' && bg.value) {
    bgStyle += ` background-image: url('${bg.value}');`;
    bgStyle += ` background-position: ${bg.position || 'center center'};`;
    bgStyle += ` background-size: ${bg.size || 'cover'};`;
    bgStyle += ` background-repeat: ${bg.repeat || 'no-repeat'};`;
  }

  // Sort slots by z-index for rendering order
  const sortedSlots = [...AppState.slots].sort((a, b) => a.zIndex - b.zIndex);

  container.innerHTML = `
    <div class="preview-card" data-size="${AppState.cardSize}" style="${bgStyle}">
      <div class="preview-area">
        ${sortedSlots.length > 0
          ? sortedSlots.map((slot) => {
              const index = AppState.slots.indexOf(slot);
              // Calculate slot dimensions - square slots
              const slotSize = slot.size || 50; // percentage of card width
              // Position is percentage from top-left
              const posX = slot.position.x;
              const posY = slot.position.y;
              // Transform includes scale and rotation
              const transform = `scale(${slot.scale}) rotate(${slot.rotation || 0}deg)`;

              return `
                <div class="preview-slot ${AppState.selectedSlotIndex === index ? 'selected' : ''}"
                     data-slot-index="${index}"
                     style="
                       left: ${posX}%;
                       top: ${posY}%;
                       width: ${slotSize}%;
                       height: ${slotSize}%;
                       z-index: ${slot.zIndex};
                       transform: ${transform};
                       transform-origin: center center;
                     ">
                  <span class="preview-slot__layer">${slot.zIndex}</span>
                  <img src="${slot.image.url}"
                       alt="${slot.image.name}"
                       style="object-fit: contain;">
                </div>
              `;
            }).join('')
          : `
              <div class="preview-empty">
                <i class="pi pi-image" style="font-size: 3rem; color: var(--text-color-muted);"></i>
                <p class="text-muted text-sm mt-4">No images added</p>
              </div>
            `
        }
      </div>
    </div>
  `;

  // Add slot click handlers
  container.querySelectorAll('[data-slot-index]').forEach(slot => {
    slot.addEventListener('click', (e) => {
      e.stopPropagation();
      AppState.selectSlot(parseInt(slot.dataset.slotIndex));
      renderPreview();
      renderSlotInfo();
      renderImageList();
      renderLayersList();
    });
  });

  // Click on empty area to deselect
  container.querySelector('.preview-area')?.addEventListener('click', (e) => {
    if (e.target.classList.contains('preview-area')) {
      AppState.selectSlot(-1);
      renderPreview();
      renderSlotInfo();
      renderImageList();
      renderLayersList();
    }
  });
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
        <i class="pi pi-trash"></i> Remove
      </button>
      <button class="p-button p-button-secondary p-button-sm" id="reset-slot-btn">
        <i class="pi pi-refresh"></i> Reset
      </button>
    </div>
  `;

  // Layer order buttons
  document.getElementById('send-back-btn')?.addEventListener('click', () => {
    AppState.sendToBack(AppState.selectedSlotIndex);
    renderPreview();
    renderSlotInfo();
    renderImageList();
    renderLayersList();
  });

  document.getElementById('send-backward-btn')?.addEventListener('click', () => {
    AppState.sendBackward(AppState.selectedSlotIndex);
    renderPreview();
    renderSlotInfo();
    renderImageList();
    renderLayersList();
  });

  document.getElementById('bring-forward-btn')?.addEventListener('click', () => {
    AppState.bringForward(AppState.selectedSlotIndex);
    renderPreview();
    renderSlotInfo();
    renderImageList();
    renderLayersList();
  });

  document.getElementById('bring-front-btn')?.addEventListener('click', () => {
    AppState.bringToFront(AppState.selectedSlotIndex);
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
 * Render image count selector (1-5)
 */
function renderImageCountSelector() {
  const container = document.getElementById('image-count-selector');
  if (!container) return;

  container.innerHTML = `
    <div class="image-count-selector">
      <div class="p-selectbutton">
        ${[1, 2, 3, 4, 5].map(count => `
          <button class="p-button p-button-sm ${AppState.imageCount === count ? 'p-highlight' : ''}"
                  data-count="${count}"
                  style="min-width: 36px;">
            ${count}
          </button>
        `).join('')}
      </div>
    </div>
  `;

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
    });
  });
}

/**
 * Render layers list in the main content area card with drag-and-drop
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
        <p class="text-muted text-sm mt-3">No layers yet</p>
        <p class="text-xs text-muted">Add images to create layers</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="layers-list" role="listbox" aria-label="Layers list">
      ${sortedByLayer.map((slot, displayIndex) => {
        const slotIndex = AppState.slots.indexOf(slot);
        const layerPosition = displayIndex + 1; // 1 = top (highest z-index)
        return `
          <div class="layer-item ${AppState.selectedSlotIndex === slotIndex ? 'layer-item--selected' : ''}"
               draggable="true"
               data-slot-index="${slotIndex}"
               data-display-index="${displayIndex}"
               role="option"
               aria-selected="${AppState.selectedSlotIndex === slotIndex}"
               tabindex="0">
            <div class="layer-item__drag-handle" title="Drag to reorder">
              <span class="drag-dots">
                <span></span><span></span>
                <span></span><span></span>
                <span></span><span></span>
              </span>
            </div>
            <div class="layer-item__index">${layerPosition}</div>
            <img src="${slot.image.url}" alt="${slot.image.name}" class="layer-item__thumb">
            <span class="layer-item__name">${slot.image.name}</span>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Setup drag and drop
  setupLayersDragAndDrop(container);

  // Slot selection
  container.querySelectorAll('[data-slot-index]').forEach(item => {
    item.addEventListener('click', (e) => {
      // Don't select if clicking drag handle
      if (e.target.closest('.layer-item__drag-handle')) return;
      AppState.selectSlot(parseInt(item.dataset.slotIndex));
      renderLayersList();
      renderSlotInfo();
      renderPreview();
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

  // Re-render everything
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

// Template Strip instance
let templateStrip = null;

// Layout Panel instance
let layoutPanel = null;

// Background Chooser instance (sidebar)
let sidebarBackgroundChooser = null;

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

  // Initial render
  renderCardSizeSelector();
  renderImageCountSelector();
  renderPreview();
  renderImageList();
  renderLayersList();
  renderSlotInfo();

  // Initialize Template Strip
  initTemplateStrip();

  // Initialize Layout Panel
  initLayoutPanel();

  // Initialize Background Chooser
  initBackgroundChooser();

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
