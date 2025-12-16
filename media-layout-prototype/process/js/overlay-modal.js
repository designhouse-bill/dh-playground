/**
 * Media Layout Component - Phase 7: Complete Overlay Modal
 *
 * Assembles all components into a complete overlay modal with:
 * - Modal structure with header, body columns, footer
 * - Open/close functionality with animations
 * - Preview-list selection sync
 * - Central state management
 */

class OverlayModal {
  constructor(options = {}) {
    this.options = {
      onSave: options.onSave || null,
      onCancel: options.onCancel || null,
      initialLayout: options.initialLayout || '2-equal',
      initialItems: options.initialItems || [],
      ...options
    };

    // Central state management
    this.state = {
      isOpen: false,
      selectedLayout: this.options.initialLayout,
      mediaItems: [...this.options.initialItems],
      selectedItemId: null,
      itemAdjustments: new Map()
    };

    // Component references
    this.components = {
      layoutSelector: null,
      mediaList: null,
      previewRenderer: null,
      adjustmentPanel: null
    };

    // DOM references
    this.elements = {
      overlay: null,
      container: null,
      header: null,
      body: null,
      leftColumn: null,
      rightColumn: null,
      footer: null
    };

    this.boundHandleKeydown = this.handleKeydown.bind(this);
    this.boundHandleOverlayClick = this.handleOverlayClick.bind(this);

    this.init();
  }

  init() {
    this.createModalStructure();
    this.initializeComponents();
    this.attachEventListeners();
  }

  createModalStructure() {
    // Create overlay
    this.elements.overlay = document.createElement('div');
    this.elements.overlay.className = 'modal-overlay';
    this.elements.overlay.setAttribute('role', 'dialog');
    this.elements.overlay.setAttribute('aria-modal', 'true');
    this.elements.overlay.setAttribute('aria-labelledby', 'modal-title');

    // Create container
    this.elements.container = document.createElement('div');
    this.elements.container.className = 'modal-container';

    // Create header
    this.elements.header = document.createElement('header');
    this.elements.header.className = 'modal-header';
    this.elements.header.innerHTML = `
      <h2 id="modal-title" class="modal-title">Configure Media Layout</h2>
      <button type="button" class="modal-close-btn" aria-label="Close modal">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;

    // Create body
    this.elements.body = document.createElement('div');
    this.elements.body.className = 'modal-body';

    // Create left column (controls)
    this.elements.leftColumn = document.createElement('div');
    this.elements.leftColumn.className = 'modal-left-column';

    // Helper to create collapsible editor card
    const createEditorCard = (id, title, isOpen = true) => {
      const card = document.createElement('section');
      card.className = `editor-card${isOpen ? ' editor-card--open' : ''}`;
      card.id = id;
      card.innerHTML = `
        <button type="button" class="editor-card__header" aria-expanded="${isOpen}" aria-controls="${id}-content">
          <h3 class="editor-card__title">${title}</h3>
          <svg class="editor-card__chevron" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 6l4 4 4-4H4z"/>
          </svg>
        </button>
        <div class="editor-card__content" id="${id}-content">
        </div>
      `;
      // Toggle functionality
      const header = card.querySelector('.editor-card__header');
      header.addEventListener('click', () => {
        const isExpanded = card.classList.toggle('editor-card--open');
        header.setAttribute('aria-expanded', isExpanded);
      });
      return card;
    };

    // Background Color Card
    const bgColorCard = createEditorCard('bg-color-card', 'Background Color', false);
    const bgColorContainer = document.createElement('div');
    bgColorContainer.className = 'bg-color-container';
    bgColorCard.querySelector('.editor-card__content').appendChild(bgColorContainer);

    // Background Image Card
    const bgImageCard = createEditorCard('bg-image-card', 'Background Image', false);
    const bgImageContainer = document.createElement('div');
    bgImageContainer.className = 'bg-image-container';
    bgImageCard.querySelector('.editor-card__content').appendChild(bgImageContainer);

    // Hero Templates Card (Quick Templates)
    const templatesCard = createEditorCard('hero-templates-card', 'Hero Templates', true);
    const templatesContainer = document.createElement('div');
    templatesContainer.className = 'layout-selector-container';
    templatesCard.querySelector('.editor-card__content').appendChild(templatesContainer);

    // Hero Image Card (Media Items / Layers)
    const heroImageCard = createEditorCard('hero-image-card', 'Hero Image', true);
    const heroImageContent = heroImageCard.querySelector('.editor-card__content');
    // Image count selector will be inside hero image card
    const imageCountContainer = document.createElement('div');
    imageCountContainer.className = 'image-count-selector-container';
    imageCountContainer.id = 'modal-image-count-container';
    heroImageContent.appendChild(imageCountContainer);
    // Media list container
    const mediaContainer = document.createElement('div');
    mediaContainer.className = 'media-list-container';
    heroImageContent.appendChild(mediaContainer);

    this.elements.leftColumn.appendChild(bgColorCard);
    this.elements.leftColumn.appendChild(bgImageCard);
    this.elements.leftColumn.appendChild(templatesCard);
    this.elements.leftColumn.appendChild(heroImageCard);

    // Create right column (preview + adjustments)
    this.elements.rightColumn = document.createElement('div');
    this.elements.rightColumn.className = 'modal-right-column';

    const previewSection = document.createElement('section');
    previewSection.className = 'modal-section modal-preview-section';
    previewSection.innerHTML = '<h3 class="modal-section-title">Preview</h3>';
    const previewContainer = document.createElement('div');
    previewContainer.className = 'preview-container';
    previewSection.appendChild(previewContainer);

    // Hero Adjustments Card
    const adjustmentCard = createEditorCard('hero-adjustments-card', 'Hero Adjustments', true);
    const adjustmentContainer = document.createElement('div');
    adjustmentContainer.className = 'adjustment-panel-container';
    adjustmentCard.querySelector('.editor-card__content').appendChild(adjustmentContainer);

    this.elements.rightColumn.appendChild(previewSection);
    this.elements.rightColumn.appendChild(adjustmentCard);

    this.elements.body.appendChild(this.elements.leftColumn);
    this.elements.body.appendChild(this.elements.rightColumn);

    // Create footer
    this.elements.footer = document.createElement('footer');
    this.elements.footer.className = 'modal-footer';
    this.elements.footer.innerHTML = `
      <button type="button" class="modal-btn modal-btn-secondary" data-action="cancel">
        Cancel
      </button>
      <button type="button" class="modal-btn modal-btn-primary" data-action="save">
        Save Layout
      </button>
    `;

    // Assemble structure
    this.elements.container.appendChild(this.elements.header);
    this.elements.container.appendChild(this.elements.body);
    this.elements.container.appendChild(this.elements.footer);
    this.elements.overlay.appendChild(this.elements.container);

    // Add to document
    document.body.appendChild(this.elements.overlay);
  }

  initializeComponents() {
    // Initialize Layout Selector (Hero Templates)
    const layoutContainer = this.elements.leftColumn.querySelector('.layout-selector-container');

    // Create sub-containers for layout selector components
    // Image count is now in the Hero Image card
    layoutContainer.innerHTML = `
      <div class="selector-group">
        <label class="selector-group__label">Layout Type</label>
        <div id="modal-layout-type-container"></div>
      </div>
      <div class="selector-group">
        <label class="selector-group__label">Emphasis</label>
        <div id="modal-emphasis-container"></div>
      </div>
      <div class="selector-group">
        <label class="selector-group__label">Direction</label>
        <div id="modal-direction-container"></div>
      </div>
    `;

    // Image count selector is now in Hero Image card
    const imageCountContainer = this.elements.leftColumn.querySelector('#modal-image-count-container');
    imageCountContainer.innerHTML = `
      <div class="selector-group">
        <label class="selector-group__label">Image Count</label>
        <div id="modal-image-count-selector"></div>
      </div>
    `;

    this.components.layoutSelector = new LayoutSelector({
      cardSize: '2x2',
      imageCount: this.state.mediaItems.length || 3,
      layoutType: 'horizontal',
      emphasis: 'equal',
      direction: 'normal',
      onChange: (config) => this.handleLayoutChange(config)
    });

    this.components.layoutSelector.init({
      imageCount: imageCountContainer.querySelector('#modal-image-count-selector'),
      layoutType: layoutContainer.querySelector('#modal-layout-type-container'),
      emphasis: layoutContainer.querySelector('#modal-emphasis-container'),
      direction: layoutContainer.querySelector('#modal-direction-container')
    });

    // Initialize Media List
    const mediaContainer = this.elements.leftColumn.querySelector('.media-list-container');
    this.components.mediaList = new MediaList({
      maxImages: 5,
      cardSize: '2x2',
      onSelect: (item, index) => this.handleItemSelect(item ? item.id : null),
      onReorder: (items) => this.handleItemsReorder(items),
      onAdd: (item) => this.handleAddItem(),
      onRemove: (item) => this.handleRemoveItem(item.id),
      onChange: (data) => this.handleMediaListChange(data)
    });
    this.components.mediaList.init(mediaContainer, this.state.mediaItems);

    // Initialize Preview Renderer
    const previewContainer = this.elements.rightColumn.querySelector('.preview-container');
    this.components.previewRenderer = new PreviewRenderer();
    this.components.previewRenderer.init(previewContainer);
    this.components.previewRenderer.setCardSize('2x2');
    this.components.previewRenderer.setImages(this.state.mediaItems.map(item => item.image));

    // Initialize Adjustment Panel
    const adjustmentContainer = this.elements.rightColumn.querySelector('.adjustment-panel-container');
    this.components.adjustmentPanel = new AdjustmentPanel({
      onChange: (adjustments) => this.handleAdjustmentChange(adjustments),
      onStackingChange: (direction) => this.handleStackingChange(direction)
    });
    this.components.adjustmentPanel.init(adjustmentContainer);

    // Initialize default adjustments for each item
    this.state.mediaItems.forEach(item => {
      if (!this.state.itemAdjustments.has(item.id)) {
        this.state.itemAdjustments.set(item.id, { ...DEFAULT_ADJUSTMENTS });
      }
    });
  }

  attachEventListeners() {
    // Close button
    const closeBtn = this.elements.header.querySelector('.modal-close-btn');
    closeBtn.addEventListener('click', () => this.close());

    // Footer buttons
    this.elements.footer.addEventListener('click', (e) => {
      const action = e.target.dataset.action;
      if (action === 'cancel') {
        this.close();
      } else if (action === 'save') {
        this.save();
      }
    });

    // Overlay click (close on outside click)
    this.elements.overlay.addEventListener('click', this.boundHandleOverlayClick);
  }

  handleOverlayClick(e) {
    if (e.target === this.elements.overlay) {
      this.close();
    }
  }

  handleKeydown(e) {
    if (e.key === 'Escape') {
      this.close();
    }
  }

  // --- Component Event Handlers ---

  handleLayoutChange(config) {
    this.state.selectedLayout = config;
    // Update preview with new layout configuration
    if (this.components.previewRenderer) {
      this.components.previewRenderer.setLayoutType(config.layoutType);
      this.components.previewRenderer.setEmphasis(config.emphasis);
      this.components.previewRenderer.setDirection(config.direction);
      this.components.previewRenderer.render();
    }
  }

  handleItemSelect(itemId) {
    this.state.selectedItemId = itemId;

    // Update adjustment panel
    const item = this.state.mediaItems.find(i => i.id === itemId);
    const index = this.state.mediaItems.findIndex(i => i.id === itemId);

    if (item && this.components.adjustmentPanel) {
      const adjustments = this.state.itemAdjustments.get(itemId) || { ...DEFAULT_ADJUSTMENTS };
      this.components.adjustmentPanel.setSelectedItem(
        item,
        index,
        this.state.mediaItems.length,
        adjustments
      );
    } else if (this.components.adjustmentPanel) {
      this.components.adjustmentPanel.clearSelection();
    }

    // Update preview selection with highlight animation
    if (this.components.previewRenderer) {
      if (item && index >= 0) {
        this.components.previewRenderer.selectItem(index);
      } else {
        this.components.previewRenderer.clearSelection();
      }
    }
  }

  handlePreviewItemClick(itemId) {
    // Sync: Preview click → List selection → Adjustment panel
    this.state.selectedItemId = itemId;
    this.components.mediaList.selectItem(itemId);
    // This triggers handleItemSelect which updates adjustment panel
  }

  handleItemsReorder(items) {
    this.state.mediaItems = items;
    this.updatePreviewWithItems();

    // Update position in adjustment panel if item is selected
    if (this.state.selectedItemId && this.components.adjustmentPanel) {
      const item = items.find(i => i.id === this.state.selectedItemId);
      if (item) {
        const index = items.findIndex(i => i.id === this.state.selectedItemId);
        const adjustments = this.state.itemAdjustments.get(this.state.selectedItemId) || { ...DEFAULT_ADJUSTMENTS };
        this.components.adjustmentPanel.setSelectedItem(
          item,
          index,
          items.length,
          adjustments
        );
      }
    }
  }

  handleAddItem() {
    // The MediaList component handles adding via its modal
    // Just update our state when it notifies us
    this.state.mediaItems = this.components.mediaList.getItems();
    this.updatePreviewWithItems();
  }

  handleRemoveItem(itemId) {
    // Update our state from the MediaList
    this.state.mediaItems = this.components.mediaList.getItems();
    this.state.itemAdjustments.delete(itemId);

    this.updatePreviewWithItems();

    // Clear selection if removed item was selected
    if (this.state.selectedItemId === itemId) {
      this.state.selectedItemId = null;
      if (this.components.adjustmentPanel) {
        this.components.adjustmentPanel.clearSelection();
      }
    }
  }

  /**
   * Handle general media list changes (fit toggle, etc.)
   */
  handleMediaListChange(data) {
    // Update state from media list
    this.state.mediaItems = this.components.mediaList.getItems();

    // Handle fit change specifically
    if (data && data.fitChange) {
      console.log('Fit changed:', data.fitChange);
    }

    this.updatePreviewWithItems();
  }

  /**
   * Update preview with full item objects (includes objectFit per item)
   */
  updatePreviewWithItems() {
    if (this.components.previewRenderer) {
      // Pass full item objects so preview can use per-item objectFit
      this.components.previewRenderer.setItems(this.state.mediaItems);
      this.components.previewRenderer.render();
    }
  }

  handleAdjustmentChange(data) {
    const { adjustments } = data;

    // Handle highlight toggle (global setting, not per-item)
    if (adjustments && adjustments.highlightSelected !== undefined) {
      if (this.components.previewRenderer) {
        this.components.previewRenderer.setHighlightSelected(adjustments.highlightSelected);
      }
    }

    if (!this.state.selectedItemId) return;

    // Update stored adjustments
    this.state.itemAdjustments.set(this.state.selectedItemId, { ...adjustments });

    // Apply to preview
    this.applyAdjustmentsToPreview(this.state.selectedItemId, adjustments);
  }

  handleStackingChange(direction, selectedIndex) {
    if (!this.state.selectedItemId) return;

    const items = [...this.state.mediaItems];
    const currentIndex = items.findIndex(i => i.id === this.state.selectedItemId);

    if (currentIndex === -1) return;

    let newIndex = currentIndex;

    switch (direction) {
      case 'front':
        newIndex = items.length - 1;
        break;
      case 'back':
        newIndex = 0;
        break;
      case 'forward':
        newIndex = Math.min(currentIndex + 1, items.length - 1);
        break;
      case 'backward':
        newIndex = Math.max(currentIndex - 1, 0);
        break;
    }

    if (newIndex !== currentIndex) {
      const [item] = items.splice(currentIndex, 1);
      items.splice(newIndex, 0, item);

      this.state.mediaItems = items;
      if (this.components.mediaList) {
        this.components.mediaList.setItems(items);
      }
      if (this.components.previewRenderer) {
        this.components.previewRenderer.setImages(items.map(i => i.image));
        this.components.previewRenderer.render();
      }

      // Update position in adjustment panel
      if (this.components.adjustmentPanel) {
        const adjustments = this.state.itemAdjustments.get(this.state.selectedItemId) || { ...DEFAULT_ADJUSTMENTS };
        this.components.adjustmentPanel.setSelectedItem(
          item,
          newIndex,
          items.length,
          adjustments
        );
      }
    }
  }

  applyAdjustmentsToPreview(itemId, adjustments) {
    // For now, we'll just trigger a re-render
    // Full adjustment support would require PreviewRenderer to accept per-item adjustments
    if (this.components.previewRenderer) {
      this.components.previewRenderer.render();
    }
  }

  updatePreview() {
    if (this.components.previewRenderer) {
      this.components.previewRenderer.render();
    }
  }

  // --- Public API ---

  open(config = {}) {
    // Apply config if provided
    if (config.items) {
      this.state.mediaItems = [...config.items];
      this.state.itemAdjustments.clear();
      config.items.forEach(item => {
        this.state.itemAdjustments.set(item.id, { ...DEFAULT_ADJUSTMENTS });
      });
      if (this.components.mediaList) {
        this.components.mediaList.setItems(config.items);
      }
      if (this.components.previewRenderer) {
        this.components.previewRenderer.setImages(config.items.map(item => item.image));
      }
      if (this.components.layoutSelector) {
        this.components.layoutSelector.setConfig({
          imageCount: config.items.length
        });
      }
    }

    if (config.adjustments) {
      Object.entries(config.adjustments).forEach(([itemId, adj]) => {
        this.state.itemAdjustments.set(itemId, { ...DEFAULT_ADJUSTMENTS, ...adj });
      });
    }

    // Clear selection
    this.state.selectedItemId = null;
    if (this.components.adjustmentPanel) {
      this.components.adjustmentPanel.clearSelection();
    }

    // Show modal
    this.state.isOpen = true;
    this.elements.overlay.classList.add('is-open');
    document.body.classList.add('modal-open');

    // Add keyboard listener
    document.addEventListener('keydown', this.boundHandleKeydown);

    // Focus first focusable element
    const firstFocusable = this.elements.container.querySelector('button, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) {
      firstFocusable.focus();
    }

    // Initial render
    this.updatePreview();
  }

  close() {
    this.state.isOpen = false;
    this.elements.overlay.classList.remove('is-open');
    document.body.classList.remove('modal-open');

    // Remove keyboard listener
    document.removeEventListener('keydown', this.boundHandleKeydown);

    // Callback
    if (this.options.onCancel) {
      this.options.onCancel();
    }
  }

  save() {
    // Compile final configuration
    const configuration = {
      layout: this.state.selectedLayout,
      items: this.state.mediaItems.map(item => ({
        ...item,
        adjustments: this.state.itemAdjustments.get(item.id) || { ...DEFAULT_ADJUSTMENTS }
      }))
    };

    // Close modal
    this.state.isOpen = false;
    this.elements.overlay.classList.remove('is-open');
    document.body.classList.remove('modal-open');
    document.removeEventListener('keydown', this.boundHandleKeydown);

    // Callback with configuration
    if (this.options.onSave) {
      this.options.onSave(configuration);
    }

    return configuration;
  }

  getState() {
    return {
      layout: this.state.selectedLayout,
      items: [...this.state.mediaItems],
      selectedItemId: this.state.selectedItemId,
      adjustments: Object.fromEntries(this.state.itemAdjustments)
    };
  }

  destroy() {
    document.removeEventListener('keydown', this.boundHandleKeydown);

    if (this.elements.overlay && this.elements.overlay.parentNode) {
      this.elements.overlay.parentNode.removeChild(this.elements.overlay);
    }

    // Cleanup components
    Object.values(this.components).forEach(component => {
      if (component && typeof component.destroy === 'function') {
        component.destroy();
      }
    });
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { OverlayModal };
}
