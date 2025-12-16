/**
 * Media Layout Component - Phase 8: Size Change Handler
 *
 * Handles card size change workflows including:
 * - Image count validation with selection modal
 * - Layout type auto-switching with toast notifications
 * - Per-size configuration storage and management
 */

// Configuration status types for size config manager
const CONFIG_STATUS = {
  PRIMARY: 'primary',      // The main/active size
  CUSTOM: 'custom',        // Has custom override configuration
  AUTO: 'auto',            // Auto-derived from primary
  NA: 'na'                 // Not applicable / no config
};

/**
 * Toast Notification Manager
 */
class ToastManager {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    // Create toast container if it doesn't exist
    this.container = document.querySelector('.toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  }

  show(message, type = 'info', duration = 4000) {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;

    const icon = this.getIcon(type);
    toast.innerHTML = `
      <span class="toast__icon">${icon}</span>
      <span class="toast__message">${message}</span>
      <button class="toast__close" aria-label="Close">&times;</button>
    `;

    // Add close button handler
    toast.querySelector('.toast__close').addEventListener('click', () => {
      this.dismiss(toast);
    });

    this.container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('toast--visible');
    });

    // Auto dismiss
    if (duration > 0) {
      setTimeout(() => this.dismiss(toast), duration);
    }

    return toast;
  }

  dismiss(toast) {
    toast.classList.remove('toast--visible');
    toast.classList.add('toast--hiding');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }

  getIcon(type) {
    switch (type) {
      case 'success': return '&#10003;';
      case 'warning': return '&#9888;';
      case 'error': return '&#10005;';
      case 'info':
      default: return '&#8505;';
    }
  }

  info(message, duration) {
    return this.show(message, 'info', duration);
  }

  success(message, duration) {
    return this.show(message, 'success', duration);
  }

  warning(message, duration) {
    return this.show(message, 'warning', duration);
  }

  error(message, duration) {
    return this.show(message, 'error', duration);
  }
}

/**
 * Image Selection Modal
 * Shown when image count exceeds maximum for new size
 */
class ImageSelectionModal {
  constructor(options = {}) {
    this.options = {
      onConfirm: options.onConfirm || null,
      onCancel: options.onCancel || null
    };

    this.elements = {
      overlay: null,
      container: null
    };

    this.state = {
      fromSize: null,
      toSize: null,
      items: [],
      maxImages: 0,
      selectedIds: new Set()
    };
  }

  show({ fromSize, toSize, items, maxImages }) {
    this.state = {
      fromSize,
      toSize,
      items: [...items],
      maxImages,
      selectedIds: new Set(items.slice(0, maxImages).map(i => i.id))
    };

    this.render();
    this.elements.overlay.classList.add('is-open');
    document.body.classList.add('modal-open');
  }

  hide() {
    if (this.elements.overlay) {
      this.elements.overlay.classList.remove('is-open');
      document.body.classList.remove('modal-open');
      setTimeout(() => {
        if (this.elements.overlay && this.elements.overlay.parentNode) {
          this.elements.overlay.parentNode.removeChild(this.elements.overlay);
        }
        this.elements.overlay = null;
      }, 200);
    }
  }

  render() {
    // Remove existing modal if present
    if (this.elements.overlay) {
      this.elements.overlay.parentNode.removeChild(this.elements.overlay);
    }

    const { fromSize, toSize, items, maxImages, selectedIds } = this.state;

    this.elements.overlay = document.createElement('div');
    this.elements.overlay.className = 'size-change-modal-overlay';
    this.elements.overlay.setAttribute('role', 'dialog');
    this.elements.overlay.setAttribute('aria-modal', 'true');

    this.elements.overlay.innerHTML = `
      <div class="size-change-modal">
        <div class="size-change-modal__header">
          <span class="size-change-modal__icon">&#9888;</span>
          <h3 class="size-change-modal__title">Card Size Changed: ${fromSize} &rarr; ${toSize}</h3>
        </div>

        <div class="size-change-modal__body">
          <p class="size-change-modal__info">
            Maximum images for <strong>${toSize}</strong>: <strong>${maxImages}</strong>.
            You have <strong>${items.length}</strong>.
          </p>
          <p class="size-change-modal__prompt">Select which images to keep:</p>

          <div class="image-selector" role="group" aria-label="Select images to keep">
            ${items.map((item, index) => `
              <label class="image-selector__item ${selectedIds.has(item.id) ? 'image-selector__item--selected' : ''}">
                <input type="checkbox"
                       class="image-selector__checkbox"
                       value="${item.id}"
                       ${selectedIds.has(item.id) ? 'checked' : ''}>
                <div class="image-selector__thumbnail">
                  <img src="${item.image}" alt="${item.name}">
                </div>
                <span class="image-selector__name">${item.name}</span>
                <span class="image-selector__index">#${index + 1}</span>
                <span class="image-selector__check">&#10003;</span>
              </label>
            `).join('')}
          </div>

          <div class="image-selector__count">
            Selected: <span class="image-selector__count-current">${selectedIds.size}</span>
            of <span class="image-selector__count-required">${maxImages}</span> required
          </div>

          <p class="size-change-modal__note">
            <span class="size-change-modal__note-icon">&#8505;</span>
            Unselected images will be hidden for ${toSize} only. They'll reappear if you switch back.
          </p>
        </div>

        <div class="size-change-modal__footer">
          <button type="button" class="modal-btn modal-btn-secondary" data-action="cancel">
            Cancel
          </button>
          <button type="button" class="modal-btn modal-btn-primary" data-action="apply" ${selectedIds.size !== maxImages ? 'disabled' : ''}>
            Apply Selection
          </button>
        </div>
      </div>
    `;

    // Add event listeners
    this.attachEventListeners();

    document.body.appendChild(this.elements.overlay);
  }

  attachEventListeners() {
    const checkboxes = this.elements.overlay.querySelectorAll('.image-selector__checkbox');
    const applyBtn = this.elements.overlay.querySelector('[data-action="apply"]');
    const cancelBtn = this.elements.overlay.querySelector('[data-action="cancel"]');

    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const itemId = e.target.value;
        const item = e.target.closest('.image-selector__item');

        if (e.target.checked) {
          // Check if we're at max
          if (this.state.selectedIds.size >= this.state.maxImages) {
            e.target.checked = false;
            return;
          }
          this.state.selectedIds.add(itemId);
          item.classList.add('image-selector__item--selected');
        } else {
          this.state.selectedIds.delete(itemId);
          item.classList.remove('image-selector__item--selected');
        }

        this.updateCount();
      });
    });

    applyBtn.addEventListener('click', () => {
      if (this.state.selectedIds.size === this.state.maxImages) {
        const selectedItems = this.state.items.filter(item =>
          this.state.selectedIds.has(item.id)
        );

        if (this.options.onConfirm) {
          this.options.onConfirm({
            selectedItems,
            hiddenItems: this.state.items.filter(item =>
              !this.state.selectedIds.has(item.id)
            ),
            toSize: this.state.toSize
          });
        }
        this.hide();
      }
    });

    cancelBtn.addEventListener('click', () => {
      if (this.options.onCancel) {
        this.options.onCancel();
      }
      this.hide();
    });

    // Click outside to cancel
    this.elements.overlay.addEventListener('click', (e) => {
      if (e.target === this.elements.overlay) {
        if (this.options.onCancel) {
          this.options.onCancel();
        }
        this.hide();
      }
    });

    // Escape key
    document.addEventListener('keydown', this.handleKeydown = (e) => {
      if (e.key === 'Escape') {
        if (this.options.onCancel) {
          this.options.onCancel();
        }
        this.hide();
        document.removeEventListener('keydown', this.handleKeydown);
      }
    });
  }

  updateCount() {
    const countCurrent = this.elements.overlay.querySelector('.image-selector__count-current');
    const applyBtn = this.elements.overlay.querySelector('[data-action="apply"]');

    countCurrent.textContent = this.state.selectedIds.size;

    // Enable apply button only when exact count is selected
    applyBtn.disabled = this.state.selectedIds.size !== this.state.maxImages;
  }
}

/**
 * Size Config Manager Panel
 * Shows configuration status for all card sizes
 */
class SizeConfigManager {
  constructor(options = {}) {
    this.options = {
      container: options.container || null,
      primarySize: options.primarySize || '2x2',
      onSizeClick: options.onSizeClick || null,
      onApplyToAll: options.onApplyToAll || null
    };

    this.state = {
      primarySize: this.options.primarySize,
      configs: new Map()
    };

    this.element = null;
  }

  init(container) {
    this.options.container = container || this.options.container;
    if (!this.options.container) {
      console.error('SizeConfigManager: No container provided');
      return;
    }

    this.render();
  }

  render() {
    if (!this.options.container) return;

    this.element = document.createElement('div');
    this.element.className = 'size-config-manager';

    this.element.innerHTML = `
      <div class="size-config-manager__header">
        <h4 class="size-config-manager__title">Size Configurations</h4>
        <button type="button" class="size-config-manager__apply-all" title="Use same configuration for all sizes">
          Apply to All Sizes
        </button>
      </div>
      <div class="size-config-manager__sizes">
        ${CARD_SIZES.map(size => this.renderSizeIndicator(size)).join('')}
      </div>
      <div class="size-config-manager__legend">
        <span class="legend-item"><span class="legend-dot legend-dot--primary"></span> Primary</span>
        <span class="legend-item"><span class="legend-dot legend-dot--custom"></span> Custom</span>
        <span class="legend-item"><span class="legend-dot legend-dot--auto"></span> Auto</span>
        <span class="legend-item"><span class="legend-dot legend-dot--na"></span> N/A</span>
      </div>
    `;

    this.attachEventListeners();
    this.options.container.appendChild(this.element);
  }

  renderSizeIndicator(size) {
    const status = this.getConfigStatus(size);
    const constraint = CARD_SIZE_CONSTRAINTS[size];
    const maxImages = constraint ? constraint.maxImages : 0;

    return `
      <button type="button"
              class="size-indicator size-indicator--${status}"
              data-size="${size}"
              title="${size} - ${this.getStatusLabel(status)} (max ${maxImages} images)">
        <span class="size-indicator__label">${size}</span>
        <span class="size-indicator__dot"></span>
      </button>
    `;
  }

  getConfigStatus(size) {
    if (size === this.state.primarySize) {
      return CONFIG_STATUS.PRIMARY;
    }
    if (this.state.configs.has(size)) {
      return CONFIG_STATUS.CUSTOM;
    }
    // Check if size is compatible for auto-derive
    const primaryConstraint = CARD_SIZE_CONSTRAINTS[this.state.primarySize];
    const sizeConstraint = CARD_SIZE_CONSTRAINTS[size];
    if (primaryConstraint && sizeConstraint) {
      return CONFIG_STATUS.AUTO;
    }
    return CONFIG_STATUS.NA;
  }

  getStatusLabel(status) {
    switch (status) {
      case CONFIG_STATUS.PRIMARY: return 'Primary configuration';
      case CONFIG_STATUS.CUSTOM: return 'Custom override';
      case CONFIG_STATUS.AUTO: return 'Auto-derived';
      case CONFIG_STATUS.NA: return 'Not applicable';
      default: return '';
    }
  }

  attachEventListeners() {
    const sizeButtons = this.element.querySelectorAll('.size-indicator');
    const applyAllBtn = this.element.querySelector('.size-config-manager__apply-all');

    sizeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const size = btn.dataset.size;
        if (this.options.onSizeClick) {
          this.options.onSizeClick(size, this.getConfigStatus(size));
        }
      });
    });

    applyAllBtn.addEventListener('click', () => {
      if (this.options.onApplyToAll) {
        this.options.onApplyToAll(this.state.primarySize);
      }
    });
  }

  setPrimarySize(size) {
    this.state.primarySize = size;
    this.updateDisplay();
  }

  setConfig(size, config) {
    if (config) {
      this.state.configs.set(size, config);
    } else {
      this.state.configs.delete(size);
    }
    this.updateDisplay();
  }

  getConfig(size) {
    return this.state.configs.get(size) || null;
  }

  hasCustomConfig(size) {
    return this.state.configs.has(size);
  }

  clearConfig(size) {
    this.state.configs.delete(size);
    this.updateDisplay();
  }

  clearAllConfigs() {
    this.state.configs.clear();
    this.updateDisplay();
  }

  updateDisplay() {
    if (!this.element) return;

    const sizeButtons = this.element.querySelectorAll('.size-indicator');
    sizeButtons.forEach(btn => {
      const size = btn.dataset.size;
      const status = this.getConfigStatus(size);

      // Remove all status classes
      btn.classList.remove(
        'size-indicator--primary',
        'size-indicator--custom',
        'size-indicator--auto',
        'size-indicator--na'
      );

      // Add current status class
      btn.classList.add(`size-indicator--${status}`);
      btn.title = `${size} - ${this.getStatusLabel(status)}`;
    });
  }

  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
  }
}

/**
 * Main Size Change Handler
 * Coordinates size changes between all components
 */
class SizeChangeHandler {
  constructor(options = {}) {
    this.options = {
      onSizeChange: options.onSizeChange || null,
      onLayoutChange: options.onLayoutChange || null,
      onItemsChange: options.onItemsChange || null,
      onConfigChange: options.onConfigChange || null
    };

    // State per size
    this.sizeConfigs = new Map();

    // Current state
    this.currentSize = options.initialSize || '2x2';
    this.currentLayout = options.initialLayout || 'horizontal';
    this.currentItems = options.initialItems || [];

    // Components
    this.toast = new ToastManager();
    this.imageSelectionModal = new ImageSelectionModal({
      onConfirm: (result) => this.handleImageSelectionConfirm(result),
      onCancel: () => this.handleImageSelectionCancel()
    });
    this.configManager = null;

    // Track pending size change
    this.pendingSizeChange = null;
  }

  /**
   * Initialize the size config manager panel
   */
  initConfigManager(container, options = {}) {
    this.configManager = new SizeConfigManager({
      container,
      primarySize: this.currentSize,
      onSizeClick: (size, status) => this.handleConfigManagerSizeClick(size, status),
      onApplyToAll: (primarySize) => this.handleApplyToAll(primarySize),
      ...options
    });
    this.configManager.init();
    return this.configManager;
  }

  /**
   * Handle size change request
   * Returns: { proceed: boolean, requiresSelection: boolean }
   */
  requestSizeChange(newSize, options = {}) {
    const fromSize = this.currentSize;
    const toSize = newSize;

    if (fromSize === toSize) {
      return { proceed: false, reason: 'Same size' };
    }

    // Store current config for the old size before changing
    this.saveCurrentConfig(fromSize);

    // Check for existing config for new size
    const existingConfig = this.sizeConfigs.get(toSize);
    if (existingConfig && !options.forceNew) {
      // Restore saved configuration
      return this.restoreConfig(toSize, existingConfig);
    }

    // Analyze the size change
    const analysis = this.analyzeSizeChange(fromSize, toSize);

    // Handle image count exceeds maximum
    if (analysis.imageCountExceeds) {
      this.pendingSizeChange = { fromSize, toSize, analysis };
      this.imageSelectionModal.show({
        fromSize,
        toSize,
        items: this.currentItems,
        maxImages: analysis.newMaxImages
      });
      return { proceed: false, requiresSelection: true };
    }

    // Handle layout change needed
    if (analysis.layoutChangeNeeded) {
      this.handleLayoutAutoSwitch(fromSize, toSize, analysis);
    }

    // Apply the size change
    this.currentSize = toSize;

    if (this.configManager) {
      this.configManager.setPrimarySize(toSize);
    }

    if (this.options.onSizeChange) {
      this.options.onSizeChange({
        fromSize,
        toSize,
        layoutChanged: analysis.layoutChangeNeeded,
        newLayout: analysis.newLayout
      });
    }

    return { proceed: true };
  }

  /**
   * Analyze what changes are needed for a size transition
   */
  analyzeSizeChange(fromSize, toSize) {
    const currentItemCount = this.currentItems.length;
    const newMaxImages = getMaxImages(toSize);
    const newAllowedLayouts = getAllowedLayouts(toSize);
    const newDefaultLayout = getDefaultLayout(toSize);

    const analysis = {
      fromSize,
      toSize,
      currentItemCount,
      newMaxImages,
      newAllowedLayouts,
      newDefaultLayout,
      imageCountExceeds: currentItemCount > newMaxImages,
      excessCount: Math.max(0, currentItemCount - newMaxImages),
      layoutChangeNeeded: !newAllowedLayouts.includes(this.currentLayout),
      newLayout: this.currentLayout,
      reason: null
    };

    // Determine new layout if current is not allowed
    if (analysis.layoutChangeNeeded) {
      analysis.newLayout = newDefaultLayout;
      analysis.reason = getDisabledReason(toSize, this.currentLayout);
    }

    return analysis;
  }

  /**
   * Handle layout auto-switch with toast notification
   */
  handleLayoutAutoSwitch(fromSize, toSize, analysis) {
    const oldLayout = this.currentLayout;
    const newLayout = analysis.newLayout;

    this.currentLayout = newLayout;

    // Show toast notification
    const layoutLabel = this.getLayoutLabel(newLayout);
    const reason = analysis.reason || `required for ${toSize} cards`;

    this.toast.warning(
      `Layout changed to ${layoutLabel} (${reason})`,
      5000
    );

    if (this.options.onLayoutChange) {
      this.options.onLayoutChange({
        fromLayout: oldLayout,
        toLayout: newLayout,
        reason: analysis.reason,
        automatic: true
      });
    }
  }

  /**
   * Handle confirmed image selection from modal
   */
  handleImageSelectionConfirm(result) {
    const { selectedItems, hiddenItems, toSize } = result;
    const pending = this.pendingSizeChange;

    if (!pending) return;

    // Update items
    this.currentItems = selectedItems;

    // Store hidden items in size config
    const config = this.sizeConfigs.get(pending.fromSize) || {};
    config.hiddenItems = hiddenItems;
    this.sizeConfigs.set(pending.fromSize, config);

    // Check if layout change is also needed
    const analysis = this.analyzeSizeChange(pending.fromSize, pending.toSize);
    if (analysis.layoutChangeNeeded) {
      this.handleLayoutAutoSwitch(pending.fromSize, pending.toSize, analysis);
    }

    // Apply size change
    this.currentSize = pending.toSize;

    if (this.configManager) {
      this.configManager.setPrimarySize(pending.toSize);
    }

    // Show success toast
    this.toast.success(
      `Size changed to ${pending.toSize}. ${hiddenItems.length} image(s) hidden.`,
      4000
    );

    if (this.options.onItemsChange) {
      this.options.onItemsChange({
        items: selectedItems,
        hiddenItems,
        reason: 'size_change'
      });
    }

    if (this.options.onSizeChange) {
      this.options.onSizeChange({
        fromSize: pending.fromSize,
        toSize: pending.toSize,
        layoutChanged: analysis.layoutChangeNeeded,
        newLayout: analysis.newLayout,
        itemsChanged: true
      });
    }

    this.pendingSizeChange = null;
  }

  /**
   * Handle cancelled image selection
   */
  handleImageSelectionCancel() {
    this.pendingSizeChange = null;
    this.toast.info('Size change cancelled', 2000);
  }

  /**
   * Save current configuration for a size
   */
  saveCurrentConfig(size) {
    const config = {
      layout: this.currentLayout,
      items: [...this.currentItems],
      savedAt: Date.now()
    };
    this.sizeConfigs.set(size, config);

    if (this.configManager) {
      this.configManager.setConfig(size, config);
    }

    if (this.options.onConfigChange) {
      this.options.onConfigChange({ size, config, action: 'save' });
    }
  }

  /**
   * Restore configuration for a size
   */
  restoreConfig(size, config) {
    const fromSize = this.currentSize;

    // Restore layout
    if (config.layout && getAllowedLayouts(size).includes(config.layout)) {
      this.currentLayout = config.layout;
    } else {
      this.currentLayout = getDefaultLayout(size);
    }

    // Restore items (including any that were hidden)
    if (config.items) {
      const hiddenItems = config.hiddenItems || [];
      this.currentItems = [...config.items, ...hiddenItems].slice(0, getMaxImages(size));
    }

    this.currentSize = size;

    if (this.configManager) {
      this.configManager.setPrimarySize(size);
    }

    this.toast.info(`Restored saved configuration for ${size}`, 3000);

    if (this.options.onSizeChange) {
      this.options.onSizeChange({
        fromSize,
        toSize: size,
        restored: true
      });
    }

    if (this.options.onConfigChange) {
      this.options.onConfigChange({ size, config, action: 'restore' });
    }

    return { proceed: true, restored: true };
  }

  /**
   * Handle click on size in config manager
   */
  handleConfigManagerSizeClick(size, status) {
    if (size === this.currentSize) {
      this.toast.info(`${size} is the current size`, 2000);
      return;
    }

    // Request size change
    this.requestSizeChange(size);
  }

  /**
   * Handle "Apply to All" button
   */
  handleApplyToAll(primarySize) {
    const primaryConfig = {
      layout: this.currentLayout,
      items: [...this.currentItems]
    };

    // Apply to all sizes (with appropriate adjustments)
    CARD_SIZES.forEach(size => {
      if (size === primarySize) return;

      const maxImages = getMaxImages(size);
      const allowedLayouts = getAllowedLayouts(size);

      const adjustedConfig = {
        layout: allowedLayouts.includes(primaryConfig.layout)
          ? primaryConfig.layout
          : getDefaultLayout(size),
        items: primaryConfig.items.slice(0, maxImages),
        derivedFrom: primarySize,
        savedAt: Date.now()
      };

      this.sizeConfigs.set(size, adjustedConfig);
    });

    if (this.configManager) {
      this.configManager.updateDisplay();
    }

    this.toast.success('Configuration applied to all sizes', 3000);

    if (this.options.onConfigChange) {
      this.options.onConfigChange({
        action: 'apply_all',
        primarySize,
        configs: Object.fromEntries(this.sizeConfigs)
      });
    }
  }

  /**
   * Get human-readable layout label
   */
  getLayoutLabel(layout) {
    const labels = {
      horizontal: 'Horizontal',
      vertical: 'Vertical',
      grid: 'Grid'
    };
    return labels[layout] || layout;
  }

  /**
   * Update current items
   */
  setItems(items) {
    this.currentItems = [...items];
  }

  /**
   * Update current layout
   */
  setLayout(layout) {
    this.currentLayout = layout;
  }

  /**
   * Get current state
   */
  getState() {
    return {
      currentSize: this.currentSize,
      currentLayout: this.currentLayout,
      currentItems: [...this.currentItems],
      configs: Object.fromEntries(this.sizeConfigs)
    };
  }

  /**
   * Get configuration for a specific size
   */
  getConfigForSize(size) {
    return this.sizeConfigs.get(size) || null;
  }

  /**
   * Check if size has custom configuration
   */
  hasConfigForSize(size) {
    return this.sizeConfigs.has(size);
  }

  /**
   * Clear configuration for a size
   */
  clearConfigForSize(size) {
    this.sizeConfigs.delete(size);
    if (this.configManager) {
      this.configManager.clearConfig(size);
    }
  }

  /**
   * Clear all configurations
   */
  clearAllConfigs() {
    this.sizeConfigs.clear();
    if (this.configManager) {
      this.configManager.clearAllConfigs();
    }
  }

  /**
   * Destroy and cleanup
   */
  destroy() {
    if (this.configManager) {
      this.configManager.destroy();
    }
    if (this.toast && this.toast.container) {
      this.toast.container.parentNode.removeChild(this.toast.container);
    }
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SizeChangeHandler,
    ToastManager,
    ImageSelectionModal,
    SizeConfigManager,
    CONFIG_STATUS
  };
}
