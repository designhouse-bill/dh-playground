/**
 * Direct Manipulation Module (Optional Add-on)
 *
 * Adds drag/resize/rotate interaction to the preview.
 * Calls the same updateImageAdjustment() as sliders for state changes.
 *
 * IMPORTANT: This module is OPTIONAL. The slider version works without it.
 * To enable: include this script and handles.css after the core scripts.
 *
 * Features:
 * - Click to select image
 * - Drag to move (updates offsetX/offsetY)
 * - Corner handles for proportional resize (updates scale)
 * - Rotation handle at top (updates rotation)
 * - Two-way sync with adjustment sliders
 *
 * Browser Support:
 * - Chrome, Edge (Blink)
 * - Firefox (Gecko)
 * - Safari (WebKit)
 * - Desktop only
 *
 * @module DirectManipulation
 */

class DirectManipulation {
  constructor(options = {}) {
    this.previewContainer = null;
    this.heroState = options.heroState || (typeof window !== 'undefined' ? window.heroState : null);

    // Current interaction state
    this.selectedIndex = null;
    this.dragType = null; // 'move' | 'resize' | 'rotate'
    this.dragCorner = null; // 'nw' | 'ne' | 'sw' | 'se' for resize
    this.startValues = {};
    this.isActive = false;

    // Configuration
    this.minScale = options.minScale || 0.5;
    this.maxScale = options.maxScale || 2.0;
    this.snapRotation = options.snapRotation || false; // Snap to 15-degree increments
    this.snapThreshold = options.snapThreshold || 5; // Degrees

    // Bound event handlers
    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);

    // State subscription cleanup
    this._unsubscribe = null;
  }

  /**
   * Initialize the direct manipulation module
   * @param {HTMLElement|string} previewContainer - Preview container element or ID
   */
  init(previewContainer) {
    this.previewContainer = typeof previewContainer === 'string'
      ? document.getElementById(previewContainer)
      : previewContainer;

    if (!this.previewContainer) {
      console.error('DirectManipulation: Preview container not found');
      return;
    }

    // Add interaction class to container
    this.previewContainer.classList.add('direct-manipulation-enabled');

    // Attach event listeners
    this.previewContainer.addEventListener('pointerdown', this._onPointerDown);
    document.addEventListener('pointermove', this._onPointerMove);
    document.addEventListener('pointerup', this._onPointerUp);
    document.addEventListener('keydown', this._onKeyDown);

    // Subscribe to heroState for selection sync
    if (this.heroState && typeof this.heroState.subscribe === 'function') {
      this._unsubscribe = this.heroState.subscribe((event, data) => {
        if (event === 'selection') {
          this.selectedIndex = data.newIndex;
          this._updateSelectionVisuals();
        }
      });

      // Sync initial selection
      this.selectedIndex = this.heroState.selectedIndex;
    }

    this.isActive = true;
    console.log('DirectManipulation: Initialized');
  }

  // ─────────────────────────────────────────────────────────────────
  // POINTER DOWN - Start interaction
  // ─────────────────────────────────────────────────────────────────

  _onPointerDown(event) {
    const target = event.target;

    // Check if clicking a resize handle
    if (target.classList.contains('dm-handle--resize')) {
      this._startResize(event, target.dataset.corner);
      return;
    }

    // Check if clicking rotation handle
    if (target.classList.contains('dm-handle--rotate')) {
      this._startRotate(event);
      return;
    }

    // Check if clicking an image cell
    const cell = target.closest('.hero-preview__cell');
    if (cell) {
      const index = parseInt(cell.dataset.index, 10);
      this._selectImage(index);
      this._startMove(event, cell);
      return;
    }

    // Clicked outside - deselect
    this._deselectAll();
  }

  /**
   * Select an image by index
   * @private
   */
  _selectImage(index) {
    const previousIndex = this.selectedIndex;
    this.selectedIndex = index;

    // Update heroState selection
    if (this.heroState && typeof this.heroState.setSelectedIndex === 'function') {
      this.heroState.setSelectedIndex(index);
    }

    // Update visuals
    this._updateSelectionVisuals();

    // Dispatch custom event
    this.previewContainer.dispatchEvent(new CustomEvent('dm:select', {
      detail: { index, previousIndex }
    }));
  }

  /**
   * Deselect all images
   * @private
   */
  _deselectAll() {
    this.selectedIndex = null;

    // Update heroState
    if (this.heroState && typeof this.heroState.setSelectedIndex === 'function') {
      this.heroState.setSelectedIndex(null);
    }

    this._updateSelectionVisuals();
  }

  /**
   * Update selection visuals (add/remove handles)
   * @private
   */
  _updateSelectionVisuals() {
    // Remove all existing handles and selection states
    this.previewContainer.querySelectorAll('.dm-handles').forEach(h => h.remove());
    this.previewContainer.querySelectorAll('.hero-preview__cell--dm-selected')
      .forEach(c => c.classList.remove('hero-preview__cell--dm-selected'));

    if (this.selectedIndex === null || this.selectedIndex === undefined) return;

    // Find selected cell
    const cell = this.previewContainer.querySelector(
      `.hero-preview__cell[data-index="${this.selectedIndex}"]`
    );
    if (!cell) return;

    // Add selection class
    cell.classList.add('hero-preview__cell--dm-selected');

    // Create and add handles
    const handles = this._createHandles();
    cell.appendChild(handles);
  }

  /**
   * Create manipulation handles
   * @private
   */
  _createHandles() {
    const handles = document.createElement('div');
    handles.className = 'dm-handles';

    handles.innerHTML = `
      <div class="dm-handle dm-handle--resize" data-corner="nw"></div>
      <div class="dm-handle dm-handle--resize" data-corner="ne"></div>
      <div class="dm-handle dm-handle--resize" data-corner="sw"></div>
      <div class="dm-handle dm-handle--resize" data-corner="se"></div>
      <div class="dm-handle dm-handle--rotate"></div>
      <div class="dm-handle-rotation-line"></div>
    `;

    return handles;
  }

  // ─────────────────────────────────────────────────────────────────
  // MOVE (Drag)
  // ─────────────────────────────────────────────────────────────────

  _startMove(event, cell) {
    if (this.selectedIndex === null) return;

    this.dragType = 'move';

    const adj = this._getImageAdjustments();
    const rect = cell.getBoundingClientRect();

    this.startValues = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      offsetX: adj.offsetX || 0,
      offsetY: adj.offsetY || 0,
      cellWidth: rect.width,
      cellHeight: rect.height
    };

    event.preventDefault();
    document.body.style.cursor = 'grabbing';
  }

  // ─────────────────────────────────────────────────────────────────
  // RESIZE (Proportional Scale)
  // ─────────────────────────────────────────────────────────────────

  _startResize(event, corner) {
    if (this.selectedIndex === null) return;

    this.dragType = 'resize';
    this.dragCorner = corner;

    const cell = this.previewContainer.querySelector(
      `.hero-preview__cell[data-index="${this.selectedIndex}"]`
    );
    if (!cell) return;

    const adj = this._getImageAdjustments();
    const rect = cell.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    this.startValues = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      scale: adj.scale || 1,
      centerX,
      centerY,
      startDistance: this._getDistance(event.clientX, event.clientY, centerX, centerY)
    };

    event.preventDefault();
    event.stopPropagation();

    // Set cursor based on corner
    const cursors = { nw: 'nwse-resize', ne: 'nesw-resize', sw: 'nesw-resize', se: 'nwse-resize' };
    document.body.style.cursor = cursors[corner] || 'nwse-resize';
  }

  // ─────────────────────────────────────────────────────────────────
  // ROTATE
  // ─────────────────────────────────────────────────────────────────

  _startRotate(event) {
    if (this.selectedIndex === null) return;

    this.dragType = 'rotate';

    const cell = this.previewContainer.querySelector(
      `.hero-preview__cell[data-index="${this.selectedIndex}"]`
    );
    if (!cell) return;

    const adj = this._getImageAdjustments();
    const rect = cell.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    this.startValues = {
      rotation: adj.rotation || 0,
      centerX,
      centerY,
      startAngle: this._getAngle(event.clientX, event.clientY, centerX, centerY)
    };

    event.preventDefault();
    event.stopPropagation();
    document.body.style.cursor = 'grabbing';
  }

  // ─────────────────────────────────────────────────────────────────
  // POINTER MOVE - During drag
  // ─────────────────────────────────────────────────────────────────

  _onPointerMove(event) {
    if (!this.dragType || this.selectedIndex === null) return;

    switch (this.dragType) {
      case 'move':
        this._handleMove(event);
        break;
      case 'resize':
        this._handleResize(event);
        break;
      case 'rotate':
        this._handleRotate(event);
        break;
    }
  }

  _handleMove(event) {
    const dx = event.clientX - this.startValues.pointerX;
    const dy = event.clientY - this.startValues.pointerY;

    const newOffsetX = this.startValues.offsetX + dx;
    const newOffsetY = this.startValues.offsetY + dy;

    // Update via heroState (single source of truth)
    this._updateAdjustment('offsetX', newOffsetX);
    this._updateAdjustment('offsetY', newOffsetY);
  }

  _handleResize(event) {
    const currentDistance = this._getDistance(
      event.clientX, event.clientY,
      this.startValues.centerX, this.startValues.centerY
    );

    const scaleRatio = currentDistance / this.startValues.startDistance;
    let newScale = this.startValues.scale * scaleRatio;

    // Clamp scale
    newScale = Math.max(this.minScale, Math.min(this.maxScale, newScale));

    // Round to 2 decimal places
    newScale = Math.round(newScale * 100) / 100;

    this._updateAdjustment('scale', newScale);
  }

  _handleRotate(event) {
    const currentAngle = this._getAngle(
      event.clientX, event.clientY,
      this.startValues.centerX, this.startValues.centerY
    );

    let deltaAngle = currentAngle - this.startValues.startAngle;
    let newRotation = this.startValues.rotation + deltaAngle;

    // Normalize to -180 to 180 range
    while (newRotation > 180) newRotation -= 360;
    while (newRotation < -180) newRotation += 360;

    // Optional: Snap to 15-degree increments when holding Shift
    if (this.snapRotation || event.shiftKey) {
      const snapAngle = 15;
      newRotation = Math.round(newRotation / snapAngle) * snapAngle;
    }

    // Round to whole number
    newRotation = Math.round(newRotation);

    this._updateAdjustment('rotation', newRotation);
  }

  // ─────────────────────────────────────────────────────────────────
  // POINTER UP - End drag
  // ─────────────────────────────────────────────────────────────────

  _onPointerUp(event) {
    if (this.dragType) {
      // Dispatch completion event
      this.previewContainer.dispatchEvent(new CustomEvent('dm:change-complete', {
        detail: {
          type: this.dragType,
          index: this.selectedIndex
        }
      }));
    }

    this.dragType = null;
    this.dragCorner = null;
    this.startValues = {};
    document.body.style.cursor = '';
  }

  // ─────────────────────────────────────────────────────────────────
  // KEYBOARD - Nudge and rotate
  // ─────────────────────────────────────────────────────────────────

  _onKeyDown(event) {
    if (this.selectedIndex === null) return;

    // Only handle when preview is focused or has selection
    const focusedInPreview = this.previewContainer.contains(document.activeElement) ||
                             this.previewContainer.querySelector('.hero-preview__cell--dm-selected');

    if (!focusedInPreview) return;

    const nudgeAmount = event.shiftKey ? 10 : 1;
    const adj = this._getImageAdjustments();

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        this._updateAdjustment('offsetX', (adj.offsetX || 0) - nudgeAmount);
        break;
      case 'ArrowRight':
        event.preventDefault();
        this._updateAdjustment('offsetX', (adj.offsetX || 0) + nudgeAmount);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this._updateAdjustment('offsetY', (adj.offsetY || 0) - nudgeAmount);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this._updateAdjustment('offsetY', (adj.offsetY || 0) + nudgeAmount);
        break;
      case '[':
        event.preventDefault();
        this._updateAdjustment('rotation', (adj.rotation || 0) - (event.shiftKey ? 15 : 1));
        break;
      case ']':
        event.preventDefault();
        this._updateAdjustment('rotation', (adj.rotation || 0) + (event.shiftKey ? 15 : 1));
        break;
      case '=':
      case '+':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          const newScale = Math.min(this.maxScale, (adj.scale || 1) + 0.1);
          this._updateAdjustment('scale', Math.round(newScale * 100) / 100);
        }
        break;
      case '-':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          const newScale = Math.max(this.minScale, (adj.scale || 1) - 0.1);
          this._updateAdjustment('scale', Math.round(newScale * 100) / 100);
        }
        break;
      case 'Escape':
        this._deselectAll();
        break;
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // UTILITIES
  // ─────────────────────────────────────────────────────────────────

  _getDistance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }

  _getAngle(x, y, centerX, centerY) {
    return Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
  }

  _getImageAdjustments() {
    if (!this.heroState || this.selectedIndex === null) {
      return { offsetX: 0, offsetY: 0, scale: 1, rotation: 0 };
    }

    if (typeof this.heroState.getImageAdjustments === 'function') {
      return this.heroState.getImageAdjustments(this.selectedIndex);
    }

    const images = this.heroState.images || [];
    return images[this.selectedIndex] || { offsetX: 0, offsetY: 0, scale: 1, rotation: 0 };
  }

  _updateAdjustment(property, value) {
    if (!this.heroState || this.selectedIndex === null) return;

    if (typeof this.heroState.updateImageAdjustment === 'function') {
      this.heroState.updateImageAdjustment(this.selectedIndex, property, value);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────────────────────────

  /**
   * Select an image programmatically
   * @param {number} index - Image index
   */
  select(index) {
    this._selectImage(index);
  }

  /**
   * Deselect current selection
   */
  deselect() {
    this._deselectAll();
  }

  /**
   * Check if direct manipulation is active
   * @returns {boolean}
   */
  isEnabled() {
    return this.isActive;
  }

  /**
   * Temporarily disable direct manipulation
   */
  disable() {
    this.isActive = false;
    this.previewContainer.classList.remove('direct-manipulation-enabled');
    this._deselectAll();
  }

  /**
   * Re-enable direct manipulation
   */
  enable() {
    this.isActive = true;
    this.previewContainer.classList.add('direct-manipulation-enabled');
  }

  /**
   * Cleanup and destroy
   */
  destroy() {
    // Remove event listeners
    if (this.previewContainer) {
      this.previewContainer.removeEventListener('pointerdown', this._onPointerDown);
      this.previewContainer.classList.remove('direct-manipulation-enabled');
    }
    document.removeEventListener('pointermove', this._onPointerMove);
    document.removeEventListener('pointerup', this._onPointerUp);
    document.removeEventListener('keydown', this._onKeyDown);

    // Unsubscribe from heroState
    if (this._unsubscribe) {
      this._unsubscribe();
    }

    // Clean up visuals
    this._deselectAll();

    this.isActive = false;
    console.log('DirectManipulation: Destroyed');
  }
}

// ─────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────

window.DirectManipulation = DirectManipulation;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DirectManipulation };
}
