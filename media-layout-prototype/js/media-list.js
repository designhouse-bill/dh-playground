/**
 * Media List Component (V2)
 *
 * A draggable list component for managing media items with:
 * - Drag and drop reordering (HTML5 Drag and Drop API)
 * - Single selection with visual feedback
 * - Content mode toggle (cover/contain) per image - integrates with heroState
 * - Add/remove items with modal picker
 * - Keyboard navigation (Arrow keys, Ctrl+Arrow to reorder, Delete to remove)
 * - ARIA accessibility attributes
 *
 * IMPORTANT: This component integrates with heroState for content mode changes.
 * When contentMode is toggled, it calls heroState.updateImageAdjustment().
 *
 * @module MediaList
 */

// Sample product data - using local images from process/assets
const SAMPLE_PRODUCTS = [
  { id: 'product-1', name: 'Coca-Cola Original 2L', image: 'process/assets/CocaCola_Original2Liter_large_66a21ff4-7055-4178-a532-19ab3b6374cf.png' },
  { id: 'product-2', name: 'Coca-Cola Cherry 2L', image: 'process/assets/CocaCola_Cherry2Liter_large_43dd9fba-2992-4e49-aa4b-6c3b5e32a673.png' },
  { id: 'product-3', name: 'Coca-Cola Zero Sugar 2L', image: 'process/assets/CocaCola_ZeroSugar2Liter_large_2b855144-e47e-468b-8c83-e318376f5f2c.png' },
  { id: 'product-4', name: 'Diet Coke 2L', image: 'process/assets/DietCoke_2Liter_large_160df7cd-11c7-4297-8882-1dcf54dc64be.png' },
  { id: 'product-5', name: 'Nescafe Clasico 150 Cups', image: 'process/assets/Nescafe_Clasico150Cups_large_635ca600-168b-42f1-906e-3149509a8ba0.png' }
];

// Additional products for adding
const ADDITIONAL_PRODUCTS = [
  { id: 'product-6', name: 'Carnation Evaporated Milk', image: 'process/assets/Nestle_CarnationEvaporatedMilk_large_cf0d165c-37cc-4e3b-8099-633ead9e5e60.png' },
  { id: 'product-7', name: 'Niagara Water 24 Pack', image: 'process/assets/Niagara_DrinkingWater24Pack_large_fe35393a-1c30-47db-bec1-e948103cd864.png' },
  { id: 'product-8', name: 'Russet Potatoes', image: 'process/assets/RussetPotatoes_large_7d0ccc22-12d8-4c8d-9c19-5571fe92f03e.png' },
  { id: 'product-9', name: 'Tide Simply Daybreak Fresh', image: 'process/assets/Tide_SimplyAllInOneDaybreakFresh89Loads_large_19c3da74-3ac6-4608-8b33-b6883960935b.png' },
  { id: 'product-10', name: 'Tide Simply Refreshing Breeze', image: 'process/assets/Tide_SimplyAllInOneRefreshingBreeze89Loads_large_96f3c653-6a40-4fe7-8c04-3ce1339e3e7e.png' },
  { id: 'product-11', name: 'Tide Simply Free Sensitive', image: 'process/assets/Tide_SimplyFreeSensitive89Loads_large_398aeebe-7abd-471c-894a-c2e5e9b5d099.png' },
  { id: 'product-12', name: 'Tide Simply Oxi Stain', image: 'process/assets/Tide_SimplyOxiStain74Loads_large_d5adc55e-1f2d-48c3-81e3-b5f5ca6933e3.png' }
];

class MediaList {
  constructor(options = {}) {
    this.container = null;
    this.items = [];
    this.selectedIndex = null;
    this.maxImages = options.maxImages || 5;
    this.cardSize = options.cardSize || '2x2';

    // Integration with heroState
    this.heroState = options.heroState || (typeof window !== 'undefined' ? window.heroState : null);

    // Callbacks
    this.onReorder = options.onReorder || (() => {});
    this.onSelect = options.onSelect || (() => {});
    this.onRemove = options.onRemove || (() => {});
    this.onAdd = options.onAdd || (() => {});
    this.onChange = options.onChange || (() => {});
    this.onContentModeChange = options.onContentModeChange || (() => {});

    // Drag state
    this.draggedIndex = null;
    this.draggedElement = null;

    // Bound methods for event listeners
    this._handleDragStart = this._handleDragStart.bind(this);
    this._handleDragOver = this._handleDragOver.bind(this);
    this._handleDragEnter = this._handleDragEnter.bind(this);
    this._handleDragLeave = this._handleDragLeave.bind(this);
    this._handleDrop = this._handleDrop.bind(this);
    this._handleDragEnd = this._handleDragEnd.bind(this);
    this._handleKeyDown = this._handleKeyDown.bind(this);
  }

  /**
   * Initialize the media list in a container
   */
  init(container, initialItems = null) {
    this.container = typeof container === 'string'
      ? document.getElementById(container)
      : container;

    if (!this.container) {
      console.error('MediaList: Container not found');
      return;
    }

    // Set initial items
    if (initialItems) {
      this.items = [...initialItems];
    } else {
      // Use first 3 sample products by default
      this.items = SAMPLE_PRODUCTS.slice(0, 3).map(p => ({
        ...p,
        contentMode: 'cover' // Default content mode
      }));
    }

    // Add keyboard listener to container
    this.container.setAttribute('tabindex', '0');
    this.container.addEventListener('keydown', this._handleKeyDown);

    // Sync with heroState if available
    this._syncWithHeroState();

    this.render();
  }

  /**
   * Sync items with heroState
   * @private
   */
  _syncWithHeroState() {
    if (!this.heroState) return;

    // If heroState has images, use those
    const stateImages = this.heroState.images || [];
    if (stateImages.length > 0) {
      this.items = stateImages.map((img, index) => ({
        id: img.id || `image-${index}`,
        name: img.name || `Image ${index + 1}`,
        image: img.src,
        contentMode: img.contentMode || 'cover'
      }));
    } else {
      // Push our items to heroState
      this._updateHeroStateImages();
    }
  }

  /**
   * Update heroState with current items
   * @private
   */
  _updateHeroStateImages() {
    if (!this.heroState || typeof this.heroState.setImages !== 'function') return;

    const heroImages = this.items.map(item => ({
      id: item.id,
      name: item.name,
      src: item.image,
      contentMode: item.contentMode || 'cover',
      offsetX: 0,
      offsetY: 0,
      scale: 1,
      rotation: 0,
      zIndex: 0,
      opacity: 100
    }));

    this.heroState.setImages(heroImages);
  }

  /**
   * Render the complete media list
   */
  render() {
    if (!this.container) return;

    this.container.innerHTML = '';
    this.container.className = 'media-list';
    this.container.setAttribute('role', 'listbox');
    this.container.setAttribute('aria-label', 'Media items list');

    // Empty state
    if (this.items.length === 0) {
      this._renderEmptyState();
      return;
    }

    // Single image state
    if (this.items.length === 1) {
      this._renderSingleImageState();
      return;
    }

    // Render list items
    const listEl = document.createElement('div');
    listEl.className = 'media-list__items';

    this.items.forEach((item, index) => {
      const itemEl = this._createItemElement(item, index);
      listEl.appendChild(itemEl);
    });

    this.container.appendChild(listEl);

    // Render add button
    const addBtn = this._createAddButton();
    this.container.appendChild(addBtn);
  }

  /**
   * Render empty state
   * @private
   */
  _renderEmptyState() {
    const emptyEl = document.createElement('div');
    emptyEl.className = 'media-list__empty';
    emptyEl.innerHTML = `
      <div class="media-list__empty-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <path d="M21 15l-5-5L5 21"/>
        </svg>
      </div>
      <p class="media-list__empty-title">No images added</p>
      <p class="media-list__empty-text">Add images to create a layout for your promotion</p>
    `;
    this.container.appendChild(emptyEl);

    // Add button
    const addBtn = this._createAddButton();
    this.container.appendChild(addBtn);
  }

  /**
   * Render single image state with content mode toggle
   * @private
   */
  _renderSingleImageState() {
    const item = this.items[0];
    const contentMode = item.contentMode || 'cover';

    const singleEl = document.createElement('div');
    singleEl.className = 'media-list__single';

    singleEl.innerHTML = `
      <div class="media-list__single-preview">
        <img src="${item.image}" alt="${item.name}" style="object-fit: ${contentMode};" />
        <button class="media-list__single-remove" aria-label="Remove image" data-index="0">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z"/>
          </svg>
        </button>
      </div>
      <div class="media-list__single-info">
        <span class="media-list__single-name">${item.name}</span>
        <span class="media-list__single-hint">Single image - select fit mode below</span>
      </div>
      <div class="media-list__content-mode">
        <label class="content-mode__label">Content Mode:</label>
        <div class="content-mode__options" role="radiogroup" aria-label="Content mode">
          <button
            class="content-mode__option ${contentMode === 'cover' ? 'content-mode__option--active' : ''}"
            data-mode="cover"
            role="radio"
            aria-checked="${contentMode === 'cover'}"
            title="Fill area, may crop edges"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="2" y="2" width="12" height="12" rx="1" />
            </svg>
            <span>Cover</span>
          </button>
          <button
            class="content-mode__option ${contentMode === 'contain' ? 'content-mode__option--active' : ''}"
            data-mode="contain"
            role="radio"
            aria-checked="${contentMode === 'contain'}"
            title="Show entire image, may letterbox"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="2" y="2" width="12" height="12" rx="1" />
              <rect x="4" y="5" width="8" height="6" rx="0.5" fill="currentColor" />
            </svg>
            <span>Contain</span>
          </button>
        </div>
      </div>
    `;

    // Remove button handler
    const removeBtn = singleEl.querySelector('.media-list__single-remove');
    removeBtn.addEventListener('click', () => this._handleRemove(0));

    // Content mode toggle handlers
    const modeOptions = singleEl.querySelectorAll('.content-mode__option');
    modeOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        const newMode = opt.dataset.mode;
        this._handleContentModeChange(0, newMode);
      });
    });

    this.container.appendChild(singleEl);

    // Add button
    const addBtn = this._createAddButton();
    this.container.appendChild(addBtn);
  }

  /**
   * Create a single media item element
   * @private
   */
  _createItemElement(item, index) {
    const el = document.createElement('div');
    el.className = 'media-item';
    el.setAttribute('draggable', 'true');
    el.setAttribute('data-index', index);
    el.setAttribute('role', 'option');
    el.setAttribute('aria-selected', this.selectedIndex === index ? 'true' : 'false');
    el.setAttribute('tabindex', '0');

    if (this.selectedIndex === index) {
      el.classList.add('media-item--selected');
    }

    const contentMode = item.contentMode || 'cover';
    const contentModeIcon = contentMode === 'contain' ? '&#8865;' : '&#8862;'; // Box with margins vs filled box
    const contentModeLabel = contentMode === 'contain' ? 'Contain' : 'Cover';

    el.innerHTML = `
      <div class="media-item__radio" aria-hidden="true">
        <span class="radio-dot"></span>
      </div>
      <div class="media-item__drag-handle" title="Drag to reorder position">
        <span class="drag-dots">
          <span></span><span></span>
          <span></span><span></span>
          <span></span><span></span>
        </span>
      </div>
      <div class="media-item__position">
        <span class="media-item__position-num">${index + 1}</span>
      </div>
      <div class="media-item__thumbnail">
        <img src="${item.image}" alt="${item.name}" loading="lazy" style="object-fit: ${contentMode};" />
      </div>
      <div class="media-item__info">
        <span class="media-item__label">${item.name}</span>
        <span class="media-item__content-mode-badge" title="Content mode: ${contentModeLabel}">
          ${contentModeIcon} ${contentModeLabel}
        </span>
      </div>
      <div class="media-item__actions">
        <button
          class="btn-icon btn-content-mode"
          title="Toggle Content Mode (${contentModeLabel})"
          aria-label="Toggle content mode for ${item.name}"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            ${contentMode === 'cover'
              ? '<rect x="2" y="2" width="12" height="12" rx="1" />'
              : '<rect x="2" y="2" width="12" height="12" rx="1" fill="none" stroke="currentColor" stroke-width="1.5" /><rect x="4" y="5" width="8" height="6" rx="0.5" />'
            }
          </svg>
        </button>
        <button class="btn-icon btn-remove" title="Remove" aria-label="Remove ${item.name}">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z"/>
          </svg>
        </button>
      </div>
    `;

    // Event listeners
    el.addEventListener('click', (e) => this._handleItemClick(e, index));
    el.addEventListener('dragstart', this._handleDragStart);
    el.addEventListener('dragover', this._handleDragOver);
    el.addEventListener('dragenter', this._handleDragEnter);
    el.addEventListener('dragleave', this._handleDragLeave);
    el.addEventListener('drop', this._handleDrop);
    el.addEventListener('dragend', this._handleDragEnd);

    // Action button listeners
    const removeBtn = el.querySelector('.btn-remove');
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._handleRemove(index);
    });

    const contentModeBtn = el.querySelector('.btn-content-mode');
    contentModeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const newMode = contentMode === 'cover' ? 'contain' : 'cover';
      this._handleContentModeChange(index, newMode);
    });

    return el;
  }

  /**
   * Handle content mode change - integrates with heroState
   * @private
   */
  _handleContentModeChange(index, newMode) {
    const item = this.items[index];
    if (!item) return;

    const oldMode = item.contentMode || 'cover';
    if (oldMode === newMode) return;

    // Update local state
    item.contentMode = newMode;

    // Update heroState if available (single source of truth)
    if (this.heroState && typeof this.heroState.updateImageAdjustment === 'function') {
      this.heroState.updateImageAdjustment(index, 'contentMode', newMode);
    }

    // Re-render
    this.render();

    // Callbacks
    this.onContentModeChange({ index, oldMode, newMode, item });
    this._emitChange();
  }

  /**
   * Create the add button
   * @private
   */
  _createAddButton() {
    const wrapper = document.createElement('div');
    wrapper.className = 'media-list__add-wrapper';

    const isMaxed = this.items.length >= this.maxImages;

    const btn = document.createElement('button');
    btn.className = 'media-list__add-btn';
    btn.disabled = isMaxed;
    btn.setAttribute('aria-disabled', isMaxed);

    btn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"/>
      </svg>
      <span>Add Image</span>
    `;

    if (!isMaxed) {
      btn.addEventListener('click', () => this._showAddModal());
    }

    wrapper.appendChild(btn);

    // Max images message
    if (isMaxed) {
      const msg = document.createElement('div');
      msg.className = 'media-list__max-message';
      msg.textContent = `Maximum ${this.maxImages} images for this card size`;
      wrapper.appendChild(msg);
    }

    return wrapper;
  }

  /**
   * Handle item click for selection
   * @private
   */
  _handleItemClick(e, index) {
    // Don't select if clicking action buttons
    if (e.target.closest('.media-item__actions')) return;

    const previousIndex = this.selectedIndex;
    this.selectedIndex = index;

    // Update heroState selected index if available
    if (this.heroState && typeof this.heroState.setSelectedIndex === 'function') {
      this.heroState.setSelectedIndex(index);
    }

    // Update visual states
    this.container.querySelectorAll('.media-item').forEach((el, i) => {
      const isSelected = i === index;
      el.classList.toggle('media-item--selected', isSelected);
      el.setAttribute('aria-selected', isSelected);
    });

    this.onSelect(this.items[index], index, previousIndex);
  }

  /**
   * Handle drag start
   * @private
   */
  _handleDragStart(e) {
    const itemEl = e.target.closest('.media-item');
    if (!itemEl) return;

    this.draggedElement = itemEl;
    this.draggedIndex = parseInt(itemEl.dataset.index);

    // Set drag data
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.draggedIndex.toString());

    // Add dragging class after a small delay
    requestAnimationFrame(() => {
      itemEl.classList.add('media-item--dragging');
    });

    itemEl.setAttribute('aria-grabbed', 'true');
  }

  /**
   * Handle drag over
   * @private
   */
  _handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  /**
   * Handle drag enter
   * @private
   */
  _handleDragEnter(e) {
    const itemEl = e.target.closest('.media-item');
    if (!itemEl || itemEl === this.draggedElement) return;

    itemEl.classList.add('media-item--drop-target');
  }

  /**
   * Handle drag leave
   * @private
   */
  _handleDragLeave(e) {
    const itemEl = e.target.closest('.media-item');
    if (!itemEl) return;

    if (!itemEl.contains(e.relatedTarget)) {
      itemEl.classList.remove('media-item--drop-target');
    }
  }

  /**
   * Handle drop
   * @private
   */
  _handleDrop(e) {
    e.preventDefault();

    const targetEl = e.target.closest('.media-item');
    if (!targetEl || !this.draggedElement || targetEl === this.draggedElement) return;

    const fromIndex = this.draggedIndex;
    const toIndex = parseInt(targetEl.dataset.index);

    // Reorder items array
    const [movedItem] = this.items.splice(fromIndex, 1);
    this.items.splice(toIndex, 0, movedItem);

    // Update heroState if available
    if (this.heroState && typeof this.heroState.reorderImages === 'function') {
      this.heroState.reorderImages(fromIndex, toIndex);
    }

    // Re-render
    this.render();

    // Update selection if needed
    if (this.selectedIndex === fromIndex) {
      this.selectedIndex = toIndex;
    } else if (this.selectedIndex > fromIndex && this.selectedIndex <= toIndex) {
      this.selectedIndex--;
    } else if (this.selectedIndex < fromIndex && this.selectedIndex >= toIndex) {
      this.selectedIndex++;
    }

    // Callbacks
    this.onReorder(this.items, fromIndex, toIndex);
    this._emitChange();
  }

  /**
   * Handle drag end
   * @private
   */
  _handleDragEnd(e) {
    this.container.querySelectorAll('.media-item').forEach(el => {
      el.classList.remove('media-item--dragging', 'media-item--drop-target');
      el.setAttribute('aria-grabbed', 'false');
    });

    this.draggedElement = null;
    this.draggedIndex = null;
  }

  /**
   * Handle keyboard navigation
   * @private
   */
  _handleKeyDown(e) {
    if (this.selectedIndex === null || this.selectedIndex === undefined) return;

    // Ctrl/Cmd + Arrow for reordering
    if ((e.ctrlKey || e.metaKey) && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();

      const direction = e.key === 'ArrowUp' ? -1 : 1;
      const newIndex = this.selectedIndex + direction;

      if (newIndex >= 0 && newIndex < this.items.length) {
        const fromIndex = this.selectedIndex;

        // Swap items
        [this.items[fromIndex], this.items[newIndex]] = [this.items[newIndex], this.items[fromIndex]];

        // Update heroState if available
        if (this.heroState && typeof this.heroState.reorderImages === 'function') {
          this.heroState.reorderImages(fromIndex, newIndex);
        }

        this.selectedIndex = newIndex;
        this.render();

        this.onReorder(this.items, fromIndex, newIndex);
        this._emitChange();
      }
    }
    // Arrow keys for navigation
    else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();

      const direction = e.key === 'ArrowUp' ? -1 : 1;
      const newIndex = this.selectedIndex + direction;

      if (newIndex >= 0 && newIndex < this.items.length) {
        this.selectedIndex = newIndex;
        this.render();

        // Focus the new item
        const itemEl = this.container.querySelector(`[data-index="${newIndex}"]`);
        if (itemEl) itemEl.focus();

        this.onSelect(this.items[newIndex], newIndex, this.selectedIndex - direction);
      }
    }
    // C key for content mode toggle
    else if (e.key === 'c' || e.key === 'C') {
      e.preventDefault();
      const item = this.items[this.selectedIndex];
      if (item) {
        const newMode = (item.contentMode || 'cover') === 'cover' ? 'contain' : 'cover';
        this._handleContentModeChange(this.selectedIndex, newMode);
      }
    }
    // Delete/Backspace to remove
    else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      this._handleRemove(this.selectedIndex);
    }
  }

  /**
   * Handle remove item
   * @private
   */
  _handleRemove(index) {
    if (index < 0 || index >= this.items.length) return;

    const removedItem = this.items[index];
    this.items.splice(index, 1);

    // Update heroState if available
    if (this.heroState && typeof this.heroState.removeImage === 'function') {
      this.heroState.removeImage(index);
    }

    // Update selection
    if (this.selectedIndex === index) {
      this.selectedIndex = this.items.length > 0 ? Math.min(index, this.items.length - 1) : null;
    } else if (this.selectedIndex > index) {
      this.selectedIndex--;
    }

    this.render();
    this.onRemove(removedItem, index);
    this._emitChange();
  }

  /**
   * Show add image modal
   * @private
   */
  _showAddModal() {
    const overlay = document.createElement('div');
    overlay.className = 'media-modal-overlay';

    // Find available products
    const usedIds = new Set(this.items.map(i => i.id));
    const available = [...SAMPLE_PRODUCTS, ...ADDITIONAL_PRODUCTS]
      .filter(p => !usedIds.has(p.id));

    if (available.length === 0) {
      alert('No more sample products available');
      return;
    }

    const modal = document.createElement('div');
    modal.className = 'media-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'modal-title');

    modal.innerHTML = `
      <div class="media-modal__header">
        <h3 id="modal-title">Add Image</h3>
        <button class="btn-icon modal-close" aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4.646 4.646a.5.5 0 01.708 0L10 9.293l4.646-4.647a.5.5 0 01.708.708L10.707 10l4.647 4.646a.5.5 0 01-.708.708L10 10.707l-4.646 4.647a.5.5 0 01-.708-.708L9.293 10 4.646 5.354a.5.5 0 010-.708z"/>
          </svg>
        </button>
      </div>
      <div class="media-modal__body">
        <p class="media-modal__subtitle">Select a product to add:</p>
        <div class="media-modal__grid">
          ${available.slice(0, 6).map(p => `
            <button class="media-modal__product" data-id="${p.id}">
              <img src="${p.image}" alt="${p.name}" />
              <span>${p.name}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Focus trap
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.focus();

    // Close handlers
    const closeModal = () => {
      overlay.classList.add('media-modal-overlay--closing');
      setTimeout(() => overlay.remove(), 150);
    };

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    // Product selection
    modal.querySelectorAll('.media-modal__product').forEach(btn => {
      btn.addEventListener('click', () => {
        const product = available.find(p => p.id === btn.dataset.id);
        if (product) {
          this._addItem({
            ...product,
            contentMode: 'cover' // Default to cover for new items
          });
          closeModal();
        }
      });
    });

    // Escape to close
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);

    // Animate in
    requestAnimationFrame(() => {
      overlay.classList.add('media-modal-overlay--visible');
    });
  }

  /**
   * Add a new item
   * @private
   */
  _addItem(item) {
    if (this.items.length >= this.maxImages) return;

    this.items.push(item);

    // Update heroState if available
    if (this.heroState && typeof this.heroState.addImage === 'function') {
      this.heroState.addImage({
        id: item.id,
        name: item.name,
        src: item.image,
        contentMode: item.contentMode || 'cover',
        offsetX: 0,
        offsetY: 0,
        scale: 1,
        rotation: 0,
        zIndex: 0,
        opacity: 100
      });
    }

    this.render();
    this.onAdd(item, this.items.length - 1);
    this._emitChange();
  }

  /**
   * Emit change event
   * @private
   */
  _emitChange() {
    this.onChange({
      items: [...this.items],
      count: this.items.length,
      selectedIndex: this.selectedIndex
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // PUBLIC METHODS
  // ─────────────────────────────────────────────────────────────────

  /**
   * Set max images (when card size changes)
   */
  setMaxImages(max) {
    this.maxImages = max;

    // Trim items if needed
    if (this.items.length > max) {
      this.items = this.items.slice(0, max);
      this._updateHeroStateImages();
    }

    // Update selection if needed
    if (this.selectedIndex !== null && this.selectedIndex >= this.items.length) {
      this.selectedIndex = this.items.length > 0 ? this.items.length - 1 : null;
    }

    this.render();
    this._emitChange();
  }

  /**
   * Set card size (updates max images from constraints)
   */
  setCardSize(cardSize) {
    this.cardSize = cardSize;

    // Use constraints if available
    if (typeof getMaxImages === 'function') {
      const max = getMaxImages(cardSize);
      this.setMaxImages(max);
    }
  }

  /**
   * Get current items
   */
  getItems() {
    return [...this.items];
  }

  /**
   * Get images array (for preview)
   */
  getImages() {
    return this.items.map(i => i.image);
  }

  /**
   * Get selected item
   */
  getSelectedItem() {
    return this.selectedIndex !== null ? this.items[this.selectedIndex] : null;
  }

  /**
   * Get selected index
   */
  getSelectedIndex() {
    return this.selectedIndex;
  }

  /**
   * Select by index
   */
  selectByIndex(index) {
    if (index >= 0 && index < this.items.length) {
      this.selectedIndex = index;
      this.render();
      this.onSelect(this.items[index], index, null);
    }
  }

  /**
   * Set items directly
   */
  setItems(items) {
    this.items = items.map(item => ({
      ...item,
      contentMode: item.contentMode || 'cover'
    }));

    // Update selection if needed
    if (this.selectedIndex !== null && this.selectedIndex >= this.items.length) {
      this.selectedIndex = this.items.length > 0 ? 0 : null;
    }

    this._updateHeroStateImages();
    this.render();
    this._emitChange();
  }

  /**
   * Set content mode for an item by index
   */
  setContentMode(index, mode) {
    if (index >= 0 && index < this.items.length) {
      this._handleContentModeChange(index, mode);
    }
  }

  /**
   * Get content mode for an item
   */
  getContentMode(index) {
    if (index >= 0 && index < this.items.length) {
      return this.items[index].contentMode || 'cover';
    }
    return 'cover';
  }

  /**
   * Destroy and cleanup
   */
  destroy() {
    if (this.container) {
      this.container.removeEventListener('keydown', this._handleKeyDown);
      this.container.innerHTML = '';
    }
  }
}

// ─────────────────────────────────────────────────────────────────
// CSS STYLES (inject if not already present)
// ─────────────────────────────────────────────────────────────────

const mediaListStyles = `
  .media-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .media-list__items {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .media-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    background: white;
    border: 1px solid var(--color-gray-200, #e5e7eb);
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .media-item:hover {
    border-color: var(--color-gray-300, #d1d5db);
    background: var(--color-gray-50, #f9fafb);
  }

  .media-item--selected {
    border-color: var(--color-primary, #3b82f6);
    background: var(--color-primary-50, #eff6ff);
  }

  .media-item--dragging {
    opacity: 0.5;
  }

  .media-item--drop-target {
    border-color: var(--color-primary, #3b82f6);
    border-style: dashed;
  }

  .media-item__radio {
    width: 18px;
    height: 18px;
    border: 2px solid var(--color-gray-300, #d1d5db);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .media-item--selected .media-item__radio {
    border-color: var(--color-primary, #3b82f6);
  }

  .media-item--selected .radio-dot {
    width: 10px;
    height: 10px;
    background: var(--color-primary, #3b82f6);
    border-radius: 50%;
  }

  .media-item__drag-handle {
    cursor: grab;
    padding: 0.25rem;
    color: var(--color-gray-400, #9ca3af);
  }

  .media-item__drag-handle:active {
    cursor: grabbing;
  }

  .drag-dots {
    display: grid;
    grid-template-columns: repeat(2, 4px);
    gap: 2px;
  }

  .drag-dots span {
    width: 4px;
    height: 4px;
    background: currentColor;
    border-radius: 50%;
  }

  .media-item__position {
    width: 24px;
    height: 24px;
    background: var(--color-gray-100, #f3f4f6);
    border-radius: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .media-item__position-num {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-gray-600, #4b5563);
  }

  .media-item__thumbnail {
    width: 40px;
    height: 40px;
    border-radius: 0.25rem;
    overflow: hidden;
    background: var(--color-gray-100, #f3f4f6);
    flex-shrink: 0;
  }

  .media-item__thumbnail img {
    width: 100%;
    height: 100%;
  }

  .media-item__info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .media-item__label {
    font-size: 0.875rem;
    color: var(--color-gray-700, #374151);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .media-item__content-mode-badge {
    font-size: 0.625rem;
    color: var(--color-gray-500, #6b7280);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .media-item__actions {
    display: flex;
    gap: 0.25rem;
    flex-shrink: 0;
  }

  .btn-icon {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    color: var(--color-gray-500, #6b7280);
    transition: all 0.15s ease;
  }

  .btn-icon:hover {
    background: var(--color-gray-100, #f3f4f6);
    color: var(--color-gray-700, #374151);
  }

  .btn-icon:active {
    background: var(--color-gray-200, #e5e7eb);
  }

  /* Content Mode Toggle */
  .media-list__content-mode,
  .content-mode__options {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .content-mode__label {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--color-gray-600, #4b5563);
  }

  .content-mode__option {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.625rem;
    background: white;
    border: 1px solid var(--color-gray-300, #d1d5db);
    border-radius: 0.375rem;
    cursor: pointer;
    font-size: 0.75rem;
    color: var(--color-gray-600, #4b5563);
    transition: all 0.15s ease;
  }

  .content-mode__option:hover {
    border-color: var(--color-gray-400, #9ca3af);
    background: var(--color-gray-50, #f9fafb);
  }

  .content-mode__option--active {
    border-color: var(--color-primary, #3b82f6);
    background: var(--color-primary-50, #eff6ff);
    color: var(--color-primary-700, #1d4ed8);
  }

  /* Single Image State */
  .media-list__single {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    background: white;
    border: 1px solid var(--color-gray-200, #e5e7eb);
    border-radius: 0.5rem;
  }

  .media-list__single-preview {
    position: relative;
    aspect-ratio: 1 / 1;
    border-radius: 0.375rem;
    overflow: hidden;
    background: var(--color-gray-100, #f3f4f6);
  }

  .media-list__single-preview img {
    width: 100%;
    height: 100%;
  }

  .media-list__single-remove {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    color: white;
    opacity: 0;
    transition: opacity 0.15s ease;
  }

  .media-list__single-preview:hover .media-list__single-remove {
    opacity: 1;
  }

  .media-list__single-info {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .media-list__single-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-gray-700, #374151);
  }

  .media-list__single-hint {
    font-size: 0.75rem;
    color: var(--color-gray-500, #6b7280);
  }

  /* Empty State */
  .media-list__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem 1rem;
    text-align: center;
  }

  .media-list__empty-icon {
    color: var(--color-gray-300, #d1d5db);
    margin-bottom: 0.75rem;
  }

  .media-list__empty-title {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-gray-700, #374151);
    margin: 0 0 0.25rem 0;
  }

  .media-list__empty-text {
    font-size: 0.75rem;
    color: var(--color-gray-500, #6b7280);
    margin: 0;
  }

  /* Add Button */
  .media-list__add-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .media-list__add-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    width: 100%;
    padding: 0.625rem;
    background: var(--color-gray-50, #f9fafb);
    border: 1px dashed var(--color-gray-300, #d1d5db);
    border-radius: 0.375rem;
    cursor: pointer;
    color: var(--color-gray-600, #4b5563);
    font-size: 0.875rem;
    transition: all 0.15s ease;
  }

  .media-list__add-btn:hover:not(:disabled) {
    border-color: var(--color-primary, #3b82f6);
    color: var(--color-primary, #3b82f6);
    background: var(--color-primary-50, #eff6ff);
  }

  .media-list__add-btn:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .media-list__max-message {
    font-size: 0.75rem;
    color: var(--color-gray-500, #6b7280);
    text-align: center;
  }

  /* Modal */
  .media-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.15s ease;
  }

  .media-modal-overlay--visible {
    opacity: 1;
  }

  .media-modal-overlay--closing {
    opacity: 0;
  }

  .media-modal {
    background: white;
    border-radius: 0.5rem;
    width: 90%;
    max-width: 480px;
    max-height: 80vh;
    overflow: auto;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  }

  .media-modal__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-bottom: 1px solid var(--color-gray-200, #e5e7eb);
  }

  .media-modal__header h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
  }

  .media-modal__body {
    padding: 1rem;
  }

  .media-modal__subtitle {
    margin: 0 0 0.75rem 0;
    font-size: 0.875rem;
    color: var(--color-gray-600, #4b5563);
  }

  .media-modal__grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }

  .media-modal__product {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.75rem;
    background: white;
    border: 1px solid var(--color-gray-200, #e5e7eb);
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .media-modal__product:hover {
    border-color: var(--color-primary, #3b82f6);
    background: var(--color-primary-50, #eff6ff);
  }

  .media-modal__product img {
    width: 60px;
    height: 60px;
    object-fit: contain;
    margin-bottom: 0.5rem;
  }

  .media-modal__product span {
    font-size: 0.75rem;
    text-align: center;
    color: var(--color-gray-700, #374151);
  }
`;

// Inject styles if not already present
if (typeof document !== 'undefined' && !document.getElementById('media-list-styles')) {
  const styleEl = document.createElement('style');
  styleEl.id = 'media-list-styles';
  styleEl.textContent = mediaListStyles;
  document.head.appendChild(styleEl);
}

// ─────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────

window.MediaList = MediaList;
window.SAMPLE_PRODUCTS = SAMPLE_PRODUCTS;
window.ADDITIONAL_PRODUCTS = ADDITIONAL_PRODUCTS;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MediaList, SAMPLE_PRODUCTS, ADDITIONAL_PRODUCTS };
}
