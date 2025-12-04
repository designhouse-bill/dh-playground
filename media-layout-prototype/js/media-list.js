/**
 * Media List Component
 *
 * A draggable list component for managing media items with:
 * - Drag and drop reordering (HTML5 Drag and Drop API)
 * - Single selection with visual feedback
 * - Add/remove items with modal picker
 * - Keyboard navigation (Arrow keys, Ctrl+Arrow to reorder, Delete to remove)
 * - ARIA accessibility attributes
 *
 * @example
 * const mediaList = new MediaList({
 *   maxImages: 4,
 *   cardSize: '2x2',
 *   onSelect: (item, index) => console.log('Selected:', item),
 *   onReorder: (items) => console.log('Reordered:', items)
 * });
 * mediaList.init(document.getElementById('container'), initialItems);
 *
 * @module MediaList
 */

// Sample product data - using local images from assets/sample-images
const SAMPLE_PRODUCTS = [
  { id: 'product-1', name: 'Coca-Cola Original 2L', image: 'assets/sample-images/CocaCola_Original2Liter_large_66a21ff4-7055-4178-a532-19ab3b6374cf.png' },
  { id: 'product-2', name: 'Coca-Cola Cherry 2L', image: 'assets/sample-images/CocaCola_Cherry2Liter_large_43dd9fba-2992-4e49-aa4b-6c3b5e32a673.png' },
  { id: 'product-3', name: 'Coca-Cola Zero Sugar 2L', image: 'assets/sample-images/CocaCola_ZeroSugar2Liter_large_2b855144-e47e-468b-8c83-e318376f5f2c.png' },
  { id: 'product-4', name: 'Diet Coke 2L', image: 'assets/sample-images/DietCoke_2Liter_large_160df7cd-11c7-4297-8882-1dcf54dc64be.png' },
  { id: 'product-5', name: 'Nescafe Clasico 150 Cups', image: 'assets/sample-images/Nescafe_Clasico150Cups_large_635ca600-168b-42f1-906e-3149509a8ba0.png' }
];

// Additional products for adding
const ADDITIONAL_PRODUCTS = [
  { id: 'product-6', name: 'Carnation Evaporated Milk', image: 'assets/sample-images/Nestle_CarnationEvaporatedMilk_large_cf0d165c-37cc-4e3b-8099-633ead9e5e60.png' },
  { id: 'product-7', name: 'Niagara Water 24 Pack', image: 'assets/sample-images/Niagara_DrinkingWater24Pack_large_fe35393a-1c30-47db-bec1-e948103cd864.png' },
  { id: 'product-8', name: 'Russet Potatoes', image: 'assets/sample-images/RussetPotatoes_large_7d0ccc22-12d8-4c8d-9c19-5571fe92f03e.png' },
  { id: 'product-9', name: 'Tide Simply Daybreak Fresh', image: 'assets/sample-images/Tide_SimplyAllInOneDaybreakFresh89Loads_large_19c3da74-3ac6-4608-8b33-b6883960935b.png' },
  { id: 'product-10', name: 'Tide Simply Refreshing Breeze', image: 'assets/sample-images/Tide_SimplyAllInOneRefreshingBreeze89Loads_large_96f3c653-6a40-4fe7-8c04-3ce1339e3e7e.png' },
  { id: 'product-11', name: 'Tide Simply Free Sensitive', image: 'assets/sample-images/Tide_SimplyFreeSensitive89Loads_large_398aeebe-7abd-471c-894a-c2e5e9b5d099.png' },
  { id: 'product-12', name: 'Tide Simply Oxi Stain', image: 'assets/sample-images/Tide_SimplyOxiStain74Loads_large_d5adc55e-1f2d-48c3-81e3-b5f5ca6933e3.png' }
];

class MediaList {
  constructor(options = {}) {
    this.container = null;
    this.items = [];
    this.selectedId = null;
    this.maxImages = options.maxImages || 5;
    this.cardSize = options.cardSize || '2x2';

    // Callbacks
    this.onReorder = options.onReorder || (() => {});
    this.onSelect = options.onSelect || (() => {});
    this.onRemove = options.onRemove || (() => {});
    this.onAdd = options.onAdd || (() => {});
    this.onChange = options.onChange || (() => {});

    // Drag state
    this.draggedItem = null;
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
      this.items = SAMPLE_PRODUCTS.slice(0, 3).map(p => ({ ...p }));
    }

    // Add keyboard listener to container
    this.container.setAttribute('tabindex', '0');
    this.container.addEventListener('keydown', this._handleKeyDown);

    this.render();
  }

  /**
   * Render the complete media list
   * Handles empty state and single image cases
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

    // Render items
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
   * Render empty state when no images are added
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
   * Render single image state with cover/contain toggle
   * @private
   */
  _renderSingleImageState() {
    const item = this.items[0];

    const singleEl = document.createElement('div');
    singleEl.className = 'media-list__single';

    singleEl.innerHTML = `
      <div class="media-list__single-preview">
        <img src="${item.image}" alt="${item.name}" />
        <button class="media-list__single-remove" aria-label="Remove image" data-id="${item.id}">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z"/>
          </svg>
        </button>
      </div>
      <div class="media-list__single-info">
        <span class="media-list__single-name">${item.name}</span>
        <span class="media-list__single-hint">Single image - no layout options needed</span>
      </div>
      <div class="media-list__fit-toggle">
        <label class="fit-toggle__label">Image Fit:</label>
        <div class="fit-toggle__options" role="radiogroup" aria-label="Image fit mode">
          <button class="fit-toggle__option fit-toggle__option--active" data-fit="cover" role="radio" aria-checked="true">
            Cover
          </button>
          <button class="fit-toggle__option" data-fit="contain" role="radio" aria-checked="false">
            Contain
          </button>
        </div>
      </div>
    `;

    // Remove button handler
    const removeBtn = singleEl.querySelector('.media-list__single-remove');
    removeBtn.addEventListener('click', () => this._handleRemove(item.id));

    // Fit toggle handlers
    const fitOptions = singleEl.querySelectorAll('.fit-toggle__option');
    fitOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        fitOptions.forEach(o => {
          o.classList.remove('fit-toggle__option--active');
          o.setAttribute('aria-checked', 'false');
        });
        opt.classList.add('fit-toggle__option--active');
        opt.setAttribute('aria-checked', 'true');
        this._emitChange({ fitMode: opt.dataset.fit });
      });
    });

    this.container.appendChild(singleEl);

    // Add button
    const addBtn = this._createAddButton();
    this.container.appendChild(addBtn);
  }

  /**
   * Create a single media item element
   */
  _createItemElement(item, index) {
    const el = document.createElement('div');
    el.className = 'media-item';
    el.setAttribute('draggable', 'true');
    el.setAttribute('data-id', item.id);
    el.setAttribute('data-index', index);
    el.setAttribute('role', 'option');
    el.setAttribute('aria-selected', this.selectedId === item.id ? 'true' : 'false');
    el.setAttribute('tabindex', '0');

    if (this.selectedId === item.id) {
      el.classList.add('media-item--selected');
    }

    el.innerHTML = `
      <div class="media-item__radio" aria-hidden="true">
        <span class="radio-dot"></span>
      </div>
      <div class="media-item__drag-handle" title="Drag to reorder">
        <span class="drag-dots">
          <span></span><span></span>
          <span></span><span></span>
          <span></span><span></span>
        </span>
      </div>
      <div class="media-item__thumbnail">
        <img src="${item.image}" alt="${item.name}" loading="lazy" />
      </div>
      <div class="media-item__label">${item.name}</div>
      <div class="media-item__actions">
        <button class="btn-icon btn-settings" title="Settings" aria-label="Settings for ${item.name}">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 10a2 2 0 100-4 2 2 0 000 4z"/>
            <path fill-rule="evenodd" d="M7.23 1.29a.75.75 0 011.04-.02l.7.66a.25.25 0 00.25.04l.9-.35a.75.75 0 01.94.44l.32.9a.25.25 0 00.18.16l.94.16a.75.75 0 01.62.85l-.13.94a.25.25 0 00.1.24l.76.57a.75.75 0 01.15 1.03l-.55.77a.25.25 0 000 .26l.55.77a.75.75 0 01-.15 1.03l-.76.57a.25.25 0 00-.1.24l.13.94a.75.75 0 01-.62.85l-.94.16a.25.25 0 00-.18.16l-.32.9a.75.75 0 01-.94.44l-.9-.35a.25.25 0 00-.25.04l-.7.66a.75.75 0 01-1.04-.02l-.66-.7a.25.25 0 00-.24-.06l-.9.32a.75.75 0 01-.94-.44l-.35-.9a.25.25 0 00-.16-.18l-.94-.13a.75.75 0 01-.85-.62l-.16-.94a.25.25 0 00-.16-.18l-.9-.32a.75.75 0 01-.44-.94l.35-.9a.25.25 0 00-.04-.25l-.66-.7a.75.75 0 01.02-1.04l.7-.66a.25.25 0 00.06-.24l-.32-.9a.75.75 0 01.44-.94l.9-.35a.25.25 0 00.18-.16l.13-.94a.75.75 0 01.62-.85l.94-.16a.25.25 0 00.18-.16l.32-.9a.75.75 0 01.94-.44l.9.35a.25.25 0 00.24-.06l.66-.7z"/>
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
    el.addEventListener('click', (e) => this._handleItemClick(e, item));
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
      this._handleRemove(item.id);
    });

    const settingsBtn = el.querySelector('.btn-settings');
    settingsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._handleSettings(item);
    });

    return el;
  }

  /**
   * Create the add button
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
   */
  _handleItemClick(e, item) {
    // Don't select if clicking action buttons
    if (e.target.closest('.media-item__actions')) return;

    const previousId = this.selectedId;
    this.selectedId = item.id;

    // Update visual states
    this.container.querySelectorAll('.media-item').forEach(el => {
      const isSelected = el.dataset.id === item.id;
      el.classList.toggle('media-item--selected', isSelected);
      el.setAttribute('aria-selected', isSelected);
    });

    // Find the index
    const index = this.items.findIndex(i => i.id === item.id);

    this.onSelect(item, index, previousId);
  }

  /**
   * Handle drag start
   */
  _handleDragStart(e) {
    const itemEl = e.target.closest('.media-item');
    if (!itemEl) return;

    this.draggedElement = itemEl;
    this.draggedItem = this.items.find(i => i.id === itemEl.dataset.id);

    // Set drag data
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', itemEl.dataset.id);

    // Add dragging class after a small delay (for ghost image)
    requestAnimationFrame(() => {
      itemEl.classList.add('media-item--dragging');
    });

    // Set ARIA
    itemEl.setAttribute('aria-grabbed', 'true');
  }

  /**
   * Handle drag over
   */
  _handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  /**
   * Handle drag enter
   */
  _handleDragEnter(e) {
    const itemEl = e.target.closest('.media-item');
    if (!itemEl || itemEl === this.draggedElement) return;

    itemEl.classList.add('media-item--drop-target');
  }

  /**
   * Handle drag leave
   */
  _handleDragLeave(e) {
    const itemEl = e.target.closest('.media-item');
    if (!itemEl) return;

    // Only remove if actually leaving the element
    if (!itemEl.contains(e.relatedTarget)) {
      itemEl.classList.remove('media-item--drop-target');
    }
  }

  /**
   * Handle drop
   */
  _handleDrop(e) {
    e.preventDefault();

    const targetEl = e.target.closest('.media-item');
    if (!targetEl || !this.draggedElement || targetEl === this.draggedElement) return;

    const fromIndex = parseInt(this.draggedElement.dataset.index);
    const toIndex = parseInt(targetEl.dataset.index);

    // Reorder items array
    const [movedItem] = this.items.splice(fromIndex, 1);
    this.items.splice(toIndex, 0, movedItem);

    // Re-render with animation
    this._animateReorder(fromIndex, toIndex);

    // Callbacks
    this.onReorder(this.items, fromIndex, toIndex);
    this._emitChange();
  }

  /**
   * Handle drag end
   */
  _handleDragEnd(e) {
    // Clean up all drag states
    this.container.querySelectorAll('.media-item').forEach(el => {
      el.classList.remove('media-item--dragging', 'media-item--drop-target');
      el.setAttribute('aria-grabbed', 'false');
    });

    this.draggedElement = null;
    this.draggedItem = null;
  }

  /**
   * Animate reorder transition
   */
  _animateReorder(fromIndex, toIndex) {
    // Re-render the list
    this.render();

    // Add animation class to moved items
    const itemsEl = this.container.querySelector('.media-list__items');
    const children = itemsEl.children;

    const start = Math.min(fromIndex, toIndex);
    const end = Math.max(fromIndex, toIndex);

    for (let i = start; i <= end; i++) {
      if (children[i]) {
        children[i].classList.add('media-item--animating');
        setTimeout(() => {
          children[i].classList.remove('media-item--animating');
        }, 200);
      }
    }
  }

  /**
   * Handle keyboard navigation and reordering
   */
  _handleKeyDown(e) {
    if (!this.selectedId) return;

    const selectedIndex = this.items.findIndex(i => i.id === this.selectedId);
    if (selectedIndex === -1) return;

    // Ctrl/Cmd + Arrow for reordering
    if ((e.ctrlKey || e.metaKey) && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();

      const direction = e.key === 'ArrowUp' ? -1 : 1;
      const newIndex = selectedIndex + direction;

      if (newIndex >= 0 && newIndex < this.items.length) {
        // Swap items
        [this.items[selectedIndex], this.items[newIndex]] =
          [this.items[newIndex], this.items[selectedIndex]];

        this._animateReorder(selectedIndex, newIndex);
        this.onReorder(this.items, selectedIndex, newIndex);
        this._emitChange();
      }
    }
    // Arrow keys for navigation
    else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();

      const direction = e.key === 'ArrowUp' ? -1 : 1;
      const newIndex = selectedIndex + direction;

      if (newIndex >= 0 && newIndex < this.items.length) {
        const newItem = this.items[newIndex];
        this._handleItemClick({ target: { closest: () => null } }, newItem);

        // Focus the new item
        const itemEl = this.container.querySelector(`[data-id="${newItem.id}"]`);
        if (itemEl) itemEl.focus();
      }
    }
    // Delete/Backspace to remove
    else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      this._handleRemove(this.selectedId);
    }
  }

  /**
   * Handle remove item
   */
  _handleRemove(itemId) {
    const index = this.items.findIndex(i => i.id === itemId);
    if (index === -1) return;

    const removedItem = this.items[index];
    this.items.splice(index, 1);

    // Clear selection if removed item was selected
    if (this.selectedId === itemId) {
      this.selectedId = null;
    }

    this.render();
    this.onRemove(removedItem, index);
    this._emitChange();
  }

  /**
   * Handle settings click
   */
  _handleSettings(item) {
    // For now, just select the item - settings would open adjustment panel
    const index = this.items.findIndex(i => i.id === item.id);
    this.selectedId = item.id;
    this.render();
    this.onSelect(item, index, null);
  }

  /**
   * Show add image modal
   */
  _showAddModal() {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'media-modal-overlay';

    // Find available products (not already in list)
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
          this._addItem({ ...product });
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
   */
  _addItem(item) {
    if (this.items.length >= this.maxImages) return;

    this.items.push(item);
    this.render();
    this.onAdd(item, this.items.length - 1);
    this._emitChange();
  }

  /**
   * Emit change event
   */
  _emitChange() {
    this.onChange({
      items: [...this.items],
      count: this.items.length,
      selectedId: this.selectedId
    });
  }

  /**
   * Public: Set max images (when card size changes)
   */
  setMaxImages(max) {
    this.maxImages = max;

    // Remove excess items if needed
    if (this.items.length > max) {
      this.items = this.items.slice(0, max);
      if (this.selectedId && !this.items.find(i => i.id === this.selectedId)) {
        this.selectedId = null;
      }
    }

    this.render();
    this._emitChange();
  }

  /**
   * Public: Set card size
   */
  setCardSize(cardSize) {
    this.cardSize = cardSize;
    const max = getMaxImages(cardSize);
    this.setMaxImages(max);
  }

  /**
   * Public: Get current items
   */
  getItems() {
    return [...this.items];
  }

  /**
   * Public: Get images array (for preview)
   */
  getImages() {
    return this.items.map(i => i.image);
  }

  /**
   * Public: Get selected item
   */
  getSelectedItem() {
    return this.items.find(i => i.id === this.selectedId) || null;
  }

  /**
   * Public: Get selected index
   */
  getSelectedIndex() {
    return this.items.findIndex(i => i.id === this.selectedId);
  }

  /**
   * Public: Clear selection
   */
  clearSelection() {
    this.selectedId = null;
    this.render();
  }

  /**
   * Public: Select by index
   * @param {number} index - Index of item to select
   */
  selectByIndex(index) {
    if (index >= 0 && index < this.items.length) {
      this.selectedId = this.items[index].id;
      this.render();
      this.onSelect(this.items[index], index, null);
    }
  }

  /**
   * Public: Select by item ID
   * @param {string} itemId - ID of item to select
   */
  selectItem(itemId) {
    const index = this.items.findIndex(i => i.id === itemId);
    if (index !== -1) {
      this.selectByIndex(index);
    }
  }

  /**
   * Public: Set items directly
   * @param {Array} items - Array of item objects with id, name, image
   */
  setItems(items) {
    this.items = [...items];
    // Clear selection if selected item no longer exists
    if (this.selectedId && !this.items.find(i => i.id === this.selectedId)) {
      this.selectedId = null;
    }
    this.render();
    this._emitChange();
  }

  /**
   * Public: Add a single item
   * @param {Object} item - Item object with id, name, image
   * @returns {boolean} - Whether item was added successfully
   */
  addItem(item) {
    if (this.items.length >= this.maxImages) {
      return false;
    }
    this._addItem(item);
    return true;
  }

  /**
   * Public: Check if list is empty
   * @returns {boolean}
   */
  isEmpty() {
    return this.items.length === 0;
  }

  /**
   * Public: Check if list has single item
   * @returns {boolean}
   */
  isSingleItem() {
    return this.items.length === 1;
  }

  /**
   * Public: Destroy and cleanup
   */
  destroy() {
    if (this.container) {
      this.container.removeEventListener('keydown', this._handleKeyDown);
      this.container.innerHTML = '';
    }
  }
}

// Export for use
if (typeof window !== 'undefined') {
  window.MediaList = MediaList;
  window.SAMPLE_PRODUCTS = SAMPLE_PRODUCTS;
}
