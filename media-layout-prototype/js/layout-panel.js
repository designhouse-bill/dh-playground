/**
 * Layout Panel Component
 * Slide-up panel with Quick Set and Advanced views
 */

class LayoutPanel {
  constructor(options = {}) {
    this.container = null;
    this.overlayEl = null;
    this.panelEl = null;

    // State
    this.state = 'collapsed'; // collapsed, quick, advanced
    this.isOpen = false;

    // Callbacks
    this.onStateChange = options.onStateChange || (() => {});
    this.onApply = options.onApply || (() => {});
    this.onCancel = options.onCancel || (() => {});

    // Bind methods
    this.render = this.render.bind(this);
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.toggle = this.toggle.bind(this);
    this.setState = this.setState.bind(this);
    this.handleKeyboard = this.handleKeyboard.bind(this);
  }

  /**
   * Initialize the panel
   */
  init(containerElement) {
    this.container = containerElement;
    this.render();
    this.setupKeyboardShortcuts();
  }

  /**
   * Set panel state
   */
  setState(state) {
    if (this.state === state) return;

    const oldState = this.state;
    this.state = state;

    if (this.panelEl) {
      this.panelEl.setAttribute('data-state', state);
    }

    // Update AppState
    if (typeof AppState !== 'undefined') {
      AppState.setPanelState(state);
    }

    this.onStateChange(state, oldState);
    this.updateViews();
  }

  /**
   * Open the panel
   */
  open(view = 'quick') {
    this.isOpen = true;
    this.setState(view);

    if (this.overlayEl) this.overlayEl.classList.add('active');
    if (this.panelEl) this.panelEl.classList.add('active');

    this.renderContent();
  }

  /**
   * Close the panel
   */
  close() {
    this.isOpen = false;
    this.setState('collapsed');

    if (this.overlayEl) this.overlayEl.classList.remove('active');
    if (this.panelEl) this.panelEl.classList.remove('active');
  }

  /**
   * Toggle panel open/close
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open('quick');
    }
  }

  /**
   * Setup keyboard shortcuts
   */
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', this.handleKeyboard);
  }

  /**
   * Handle keyboard events
   */
  handleKeyboard(e) {
    // Cmd/Ctrl + M - Toggle panel
    if ((e.metaKey || e.ctrlKey) && e.key === 'm') {
      e.preventDefault();
      this.toggle();
    }

    // Cmd/Ctrl + 1 - Quick view
    if ((e.metaKey || e.ctrlKey) && e.key === '1') {
      e.preventDefault();
      this.open('quick');
    }

    // Cmd/Ctrl + 2 - Advanced view
    if ((e.metaKey || e.ctrlKey) && e.key === '2') {
      e.preventDefault();
      this.open('advanced');
    }

    // Escape - Close panel
    if (e.key === 'Escape' && this.isOpen) {
      e.preventDefault();
      this.close();
    }
  }

  /**
   * Update view visibility
   */
  updateViews() {
    const quickView = this.panelEl?.querySelector('.quick-view');
    const advancedView = this.panelEl?.querySelector('.advanced-view');

    if (quickView) {
      quickView.classList.toggle('active', this.state === 'quick');
    }
    if (advancedView) {
      advancedView.classList.toggle('active', this.state === 'advanced');
    }

    // Update tabs
    this.panelEl?.querySelectorAll('.layout-panel__tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.view === this.state);
    });
  }

  /**
   * Render the panel structure
   */
  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="layout-panel-overlay"></div>
      <div class="layout-panel" data-state="collapsed">
        <div class="layout-panel__header">
          <div class="layout-panel__title">
            <i class="pi pi-sliders-h"></i>
            <span>Layout Configuration</span>
          </div>

          <div class="layout-panel__tabs">
            <button class="layout-panel__tab" data-view="quick">
              <i class="pi pi-bolt"></i> Quick
            </button>
            <button class="layout-panel__tab" data-view="advanced">
              <i class="pi pi-cog"></i> Advanced
            </button>
          </div>

          <div class="layout-panel__actions">
            <button class="layout-panel__close" title="Close (Esc)">
              <i class="pi pi-times"></i>
            </button>
          </div>
        </div>

        <div class="layout-panel__body">
          <!-- Quick View -->
          <div class="quick-view">
            <div class="quick-view__row">
              <div class="quick-view__section">
                <div class="quick-view__section-title">
                  <i class="pi pi-th-large"></i> Card Size
                </div>
                <div class="quick-size-grid" id="panel-size-grid"></div>
              </div>

              <div class="quick-view__section">
                <div class="quick-view__section-title">
                  <i class="pi pi-images"></i> Image Count
                </div>
                <div class="quick-count-row" id="panel-count-row"></div>
              </div>

              <div class="quick-preview" id="panel-quick-preview">
                <!-- Mini preview renders here -->
              </div>
            </div>
          </div>

          <!-- Advanced View -->
          <div class="advanced-view">
            <div class="advanced-view__grid">
              <!-- Slots Section -->
              <div class="advanced-view__section">
                <div class="advanced-view__section-header">
                  <div class="advanced-view__section-title">
                    <i class="pi pi-list"></i> Image Slots
                  </div>
                </div>
                <div class="slot-list" id="panel-slot-list"></div>
              </div>

              <!-- Settings Section -->
              <div class="advanced-view__section">
                <div class="advanced-view__section-header">
                  <div class="advanced-view__section-title">
                    <i class="pi pi-cog"></i> Settings
                  </div>
                </div>

                <div style="margin-bottom: var(--spacing-4);">
                  <label class="text-sm font-medium mb-2 block">Card Size</label>
                  <div class="quick-size-grid" id="panel-adv-size-grid"></div>
                </div>

                <div style="margin-bottom: var(--spacing-4);">
                  <label class="text-sm font-medium mb-2 block">Image Count</label>
                  <div class="quick-count-row" id="panel-adv-count-row"></div>
                </div>

                <div>
                  <label class="text-sm font-medium mb-2 block">Background</label>
                  <div id="panel-bg-picker"></div>
                </div>
              </div>

              <!-- Preview Section -->
              <div class="advanced-view__section advanced-view__preview">
                <div class="advanced-view__section-header">
                  <div class="advanced-view__section-title">
                    <i class="pi pi-eye"></i> Preview
                  </div>
                </div>
                <div class="advanced-preview" id="panel-adv-preview"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="layout-panel__footer">
          <button class="p-button p-button-secondary" id="panel-cancel-btn">
            Cancel
          </button>
          <button class="p-button p-button-primary" id="panel-apply-btn">
            <i class="pi pi-check"></i> Apply
          </button>
        </div>
      </div>
    `;

    // Cache elements
    this.overlayEl = this.container.querySelector('.layout-panel-overlay');
    this.panelEl = this.container.querySelector('.layout-panel');

    // Setup event listeners
    this.setupEventListeners();
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Overlay click to close
    this.overlayEl?.addEventListener('click', () => this.close());

    // Close button
    this.panelEl?.querySelector('.layout-panel__close')?.addEventListener('click', () => this.close());

    // Tab clicks
    this.panelEl?.querySelectorAll('.layout-panel__tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.stopPropagation();
        const view = tab.dataset.view;
        if (view) {
          this.setState(view);
          this.renderContent();
        }
      });
    });

    // Header click to toggle
    this.panelEl?.querySelector('.layout-panel__header')?.addEventListener('click', (e) => {
      // Don't toggle if clicking on tabs or close button
      if (e.target.closest('.layout-panel__tabs') || e.target.closest('.layout-panel__close')) {
        return;
      }
      this.toggle();
    });

    // Apply button
    this.panelEl?.querySelector('#panel-apply-btn')?.addEventListener('click', () => {
      this.onApply();
      this.close();
    });

    // Cancel button
    this.panelEl?.querySelector('#panel-cancel-btn')?.addEventListener('click', () => {
      this.onCancel();
      this.close();
    });
  }

  /**
   * Render panel content based on state
   */
  renderContent() {
    this.renderSizeGrid('panel-size-grid');
    this.renderSizeGrid('panel-adv-size-grid');
    this.renderCountRow('panel-count-row');
    this.renderCountRow('panel-adv-count-row');
    this.renderSlotList();
    this.renderQuickPreview();
    this.renderAdvancedPreview();
    this.renderBackgroundPicker();
    this.updateViews();
  }

  /**
   * Render size grid
   */
  renderSizeGrid(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const sizes = ['1x1', '2x1', '3x1', '1x2', '2x2', '3x2', '1x3', '2x3', '3x3'];
    const currentSize = AppState?.cardSize || '2x2';

    container.innerHTML = sizes.map(size => `
      <button class="quick-size-btn ${currentSize === size ? 'active' : ''}"
              data-size="${size}">
        ${size}
      </button>
    `).join('');

    container.querySelectorAll('[data-size]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (typeof AppState !== 'undefined') {
          AppState.setCardSize(btn.dataset.size);
          this.renderContent();
          // Update main UI
          if (typeof renderCardSizeSelector === 'function') renderCardSizeSelector();
          if (typeof renderPreview === 'function') renderPreview();
          if (typeof updateTemplateStripSize === 'function') updateTemplateStripSize();
        }
      });
    });
  }

  /**
   * Render count row
   */
  renderCountRow(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const currentCount = AppState?.imageCount || 2;

    container.innerHTML = [1, 2, 3, 4, 5].map(count => `
      <button class="quick-count-btn ${currentCount === count ? 'active' : ''}"
              data-count="${count}">
        ${count}
      </button>
    `).join('');

    container.querySelectorAll('[data-count]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (typeof AppState !== 'undefined') {
          AppState.setImageCount(parseInt(btn.dataset.count));
          this.renderContent();
          // Update main UI
          if (typeof renderImageCountSelector === 'function') renderImageCountSelector();
          if (typeof renderImageList === 'function') renderImageList();
          if (typeof renderPreview === 'function') renderPreview();
          if (typeof renderSlotInfo === 'function') renderSlotInfo();
        }
      });
    });
  }

  /**
   * Render slot list in advanced view
   */
  renderSlotList() {
    const container = document.getElementById('panel-slot-list');
    if (!container || typeof AppState === 'undefined') return;

    const sortedSlots = [...AppState.slots].sort((a, b) => b.zIndex - a.zIndex);

    container.innerHTML = sortedSlots.length > 0 ? sortedSlots.map(slot => {
      const index = AppState.slots.indexOf(slot);
      return `
        <div class="slot-list-item ${AppState.selectedSlotIndex === index ? 'selected' : ''}"
             data-slot-index="${index}">
          <span class="slot-list-item__drag">
            <i class="pi pi-bars"></i>
          </span>
          <div class="slot-list-item__thumb">
            <img src="${slot.image.url}" alt="${slot.image.name}">
          </div>
          <div class="slot-list-item__info">
            <div class="slot-list-item__name">${slot.image.name}</div>
            <div class="slot-list-item__meta">
              Pos: ${slot.position.x}%, ${slot.position.y}% | Scale: ${slot.scale.toFixed(2)}x
            </div>
          </div>
          <span class="slot-list-item__layer">${slot.zIndex}</span>
        </div>
      `;
    }).join('') : `
      <div class="text-center text-muted p-4">
        <i class="pi pi-inbox" style="font-size: 2rem; opacity: 0.3;"></i>
        <p class="mt-2">No images added</p>
      </div>
    `;

    container.querySelectorAll('[data-slot-index]').forEach(item => {
      item.addEventListener('click', () => {
        const index = parseInt(item.dataset.slotIndex);
        AppState.selectSlot(index);
        this.renderSlotList();
        if (typeof renderImageList === 'function') renderImageList();
        if (typeof renderPreview === 'function') renderPreview();
        if (typeof renderSlotInfo === 'function') renderSlotInfo();
      });
    });
  }

  /**
   * Render quick preview thumbnail
   */
  renderQuickPreview() {
    const container = document.getElementById('panel-quick-preview');
    if (!container || typeof AppState === 'undefined') return;

    // Handle color (solid or gradient) vs image backgrounds
    let bgStyle;
    if (AppState.background.type === 'image') {
      bgStyle = `background-image: url(${AppState.background.value}); background-size: cover;`;
    } else if (AppState.background.value.includes('gradient')) {
      bgStyle = `background: ${AppState.background.value};`;
    } else {
      bgStyle = `background-color: ${AppState.background.value};`;
    }

    container.innerHTML = `
      <div class="preview-card quick-preview__card" data-size="${AppState.cardSize}" style="${bgStyle}">
        <div class="preview-area">
          ${AppState.slots.map(slot => `
            <div class="preview-slot"
                 style="
                   left: ${slot.position.x}%;
                   top: ${slot.position.y}%;
                   width: ${slot.size || 50}%;
                   height: ${slot.size || 50}%;
                   z-index: ${slot.zIndex};
                   transform: scale(${slot.scale}) rotate(${slot.rotation || 0}deg);
                 ">
              <img src="${slot.image.url}" alt="">
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Render advanced preview
   */
  renderAdvancedPreview() {
    const container = document.getElementById('panel-adv-preview');
    if (!container) return;

    // Reuse quick preview rendering
    this.renderQuickPreview();

    container.innerHTML = `
      <div style="transform: scale(0.6); transform-origin: center;">
        ${document.getElementById('panel-quick-preview')?.innerHTML || ''}
      </div>
      <div class="advanced-preview__label">${AppState?.cardSize || '2x2'} Card</div>
    `;
  }

  /**
   * Render background picker using BackgroundChooser component
   */
  renderBackgroundPicker() {
    const container = document.getElementById('panel-bg-picker');
    if (!container) return;

    // If BackgroundChooser is available, use it
    if (typeof BackgroundChooser !== 'undefined') {
      // Destroy existing instance if any
      if (this.panelBackgroundChooser) {
        this.panelBackgroundChooser.destroy();
      }

      const currentBg = AppState?.background || { type: 'color', value: '#ffffff' };

      this.panelBackgroundChooser = new BackgroundChooser({
        type: currentBg.type,
        value: currentBg.value,
        onChange: (type, value) => {
          if (typeof AppState !== 'undefined') {
            AppState.setBackground(type, value);
            this.renderQuickPreview();
            this.renderAdvancedPreview();
            if (typeof renderPreview === 'function') renderPreview();
            // Sync sidebar background chooser
            if (typeof sidebarBackgroundChooser !== 'undefined' && sidebarBackgroundChooser) {
              sidebarBackgroundChooser.updateFromState(type, value);
            }
          }
        }
      });

      this.panelBackgroundChooser.init(container);

      // Add compact class for panel
      container.querySelector('.background-chooser')?.classList.add('background-chooser--compact');
    } else {
      // Fallback to simple color picker
      const currentBg = AppState?.background || { type: 'color', value: '#ffffff' };

      container.innerHTML = `
        <div class="flex gap-2 items-center">
          <input type="color" value="${currentBg.type === 'color' ? currentBg.value : '#ffffff'}"
                 id="panel-bg-color" style="width: 40px; height: 32px; border: none; cursor: pointer;">
          <span class="text-sm text-muted">${currentBg.value}</span>
        </div>
      `;

      container.querySelector('#panel-bg-color')?.addEventListener('input', (e) => {
        if (typeof AppState !== 'undefined') {
          AppState.setBackground('color', e.target.value);
          this.renderQuickPreview();
          this.renderAdvancedPreview();
          if (typeof renderPreview === 'function') renderPreview();
        }
      });
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    document.removeEventListener('keydown', this.handleKeyboard);
    if (this.panelBackgroundChooser) {
      this.panelBackgroundChooser.destroy();
      this.panelBackgroundChooser = null;
    }
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

// Make available globally
window.LayoutPanel = LayoutPanel;
