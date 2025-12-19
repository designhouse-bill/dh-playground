/**
 * MoveableController - Wraps Moveable.js for AppState integration
 * Designed for easy conversion to Angular service
 *
 * Features:
 * - Single selection (one slot with handles at a time)
 * - Converts pixel drag values to percentages
 * - Syncs with AppState via callback
 * - Maintains 1:1 aspect ratio for square slots
 */
class MoveableController {
  constructor(options = {}) {
    this.canvasContent = null;
    this.moveable = null;
    this.selectedSlotIndex = -1;

    // Callbacks
    this.onUpdate = options.onUpdate || (() => {});
    this.onSelect = options.onSelect || (() => {});

    // Configuration
    this.config = {
      draggable: true,
      scalable: true,
      rotatable: true,
      keepRatio: true,  // Maintain 1:1 aspect for square slots
      throttleDrag: 0,
      throttleScale: 0,
      throttleRotate: 0,
      renderDirections: ["nw", "ne", "sw", "se"],
      rotationPosition: "top",
      origin: false,
      edge: false
    };

    // Bind methods for event handlers
    this._onDrag = this._onDrag.bind(this);
    this._onScale = this._onScale.bind(this);
    this._onRotate = this._onRotate.bind(this);
  }

  /**
   * Initialize the controller with a canvas element
   * @param {HTMLElement} canvasContentElement - The container for slots
   */
  init(canvasContentElement) {
    this.canvasContent = canvasContentElement;

    // Setup click handler for slot selection
    if (this.canvasContent) {
      this.canvasContent.addEventListener('click', (e) => {
        const slotElement = e.target.closest('[data-slot-index]');
        if (slotElement) {
          const index = parseInt(slotElement.dataset.slotIndex);
          this.onSelect(index);
        } else if (e.target === this.canvasContent || e.target.classList.contains('preview-area')) {
          // Clicked on empty area - deselect
          this.onSelect(-1);
        }
      });
    }
  }

  /**
   * Update selection and create/destroy Moveable instance
   * @param {number} slotIndex - Index of selected slot (-1 for none)
   */
  updateSelection(slotIndex) {
    // Destroy existing instance
    if (this.moveable) {
      this.moveable.destroy();
      this.moveable = null;
    }

    this.selectedSlotIndex = slotIndex;

    if (slotIndex < 0 || !this.canvasContent) {
      return;
    }

    // Find the DOM element for the selected slot
    const target = this.canvasContent.querySelector(`[data-slot-index="${slotIndex}"]`);
    if (!target) {
      console.warn(`MoveableController: No element found for slot index ${slotIndex}`);
      return;
    }

    // Check if Moveable is available
    if (typeof Moveable === 'undefined') {
      console.warn('MoveableController: Moveable.js not loaded');
      return;
    }

    // Create new Moveable for selected element
    this.moveable = new Moveable(this.canvasContent, {
      target: target,
      container: this.canvasContent,
      ...this.config
    });

    this._attachEventHandlers();
  }

  /**
   * Attach Moveable event handlers
   * @private
   */
  _attachEventHandlers() {
    if (!this.moveable) return;

    // Drag handler - converts pixels to percentages
    this.moveable.on('drag', this._onDrag);

    // Scale handler - updates scale value
    this.moveable.on('scale', this._onScale);

    // Rotate handler - updates rotation degrees
    this.moveable.on('rotate', this._onRotate);

    // End handlers for final state sync
    this.moveable.on('dragEnd', () => {
      this._notifyEnd('drag');
    });

    this.moveable.on('scaleEnd', () => {
      this._notifyEnd('scale');
    });

    this.moveable.on('rotateEnd', () => {
      this._notifyEnd('rotate');
    });
  }

  /**
   * Handle drag event
   * @private
   */
  _onDrag(e) {
    if (!this.canvasContent) return;

    const rect = this.canvasContent.getBoundingClientRect();
    const xPercent = (e.left / rect.width) * 100;
    const yPercent = (e.top / rect.height) * 100;

    // Clamp to reasonable bounds
    const clampedX = Math.max(0, Math.min(80, xPercent));
    const clampedY = Math.max(0, Math.min(80, yPercent));

    // Update DOM immediately for smooth feedback
    e.target.style.left = `${clampedX}%`;
    e.target.style.top = `${clampedY}%`;

    // Notify AppState
    this.onUpdate(this.selectedSlotIndex, {
      position: { x: clampedX, y: clampedY }
    });
  }

  /**
   * Handle scale event
   * @private
   */
  _onScale(e) {
    if (!this.canvasContent) return;

    const scaleX = e.scale[0];
    const rect = this.canvasContent.getBoundingClientRect();

    // Calculate new position from drag
    const xPercent = (e.drag.left / rect.width) * 100;
    const yPercent = (e.drag.top / rect.height) * 100;

    // Clamp scale to reasonable range
    const clampedScale = Math.max(0.3, Math.min(1.5, scaleX));

    // Get current rotation from AppState or element
    const currentRotation = this._getCurrentRotation(e.target);

    // Update DOM
    e.target.style.left = `${xPercent}%`;
    e.target.style.top = `${yPercent}%`;
    e.target.style.transform = `scale(${clampedScale}) rotate(${currentRotation}deg)`;

    // Notify AppState
    this.onUpdate(this.selectedSlotIndex, {
      scale: clampedScale,
      position: { x: xPercent, y: yPercent }
    });
  }

  /**
   * Handle rotate event
   * @private
   */
  _onRotate(e) {
    if (!this.canvasContent) return;

    // Clamp rotation to -45 to 45 degrees
    const clampedRotation = Math.max(-45, Math.min(45, e.rotate));

    // Get current scale from AppState or element
    const currentScale = this._getCurrentScale(e.target);

    // Update DOM
    e.target.style.transform = `scale(${currentScale}) rotate(${clampedRotation}deg)`;

    // Notify AppState
    this.onUpdate(this.selectedSlotIndex, {
      rotation: clampedRotation
    });
  }

  /**
   * Get current rotation from element transform
   * @private
   */
  _getCurrentRotation(element) {
    const transform = element.style.transform || '';
    const match = transform.match(/rotate\(([-\d.]+)deg\)/);
    return match ? parseFloat(match[1]) : 0;
  }

  /**
   * Get current scale from element transform
   * @private
   */
  _getCurrentScale(element) {
    const transform = element.style.transform || '';
    const match = transform.match(/scale\(([-\d.]+)\)/);
    return match ? parseFloat(match[1]) : 1;
  }

  /**
   * Notify when interaction ends
   * @private
   */
  _notifyEnd(type) {
    // Could trigger a save or other action
    console.log(`MoveableController: ${type} ended for slot ${this.selectedSlotIndex}`);
  }

  /**
   * Update Moveable rect after DOM changes
   */
  updateRect() {
    if (this.moveable) {
      this.moveable.updateRect();
    }
  }

  /**
   * Refresh Moveable for current selection
   * Call this after preview re-renders
   */
  refresh() {
    if (this.selectedSlotIndex >= 0) {
      this.updateSelection(this.selectedSlotIndex);
    }
  }

  /**
   * Destroy the controller and clean up
   */
  destroy() {
    if (this.moveable) {
      this.moveable.destroy();
      this.moveable = null;
    }
    this.canvasContent = null;
    this.selectedSlotIndex = -1;
  }
}

// Make available globally (for vanilla JS prototype)
// In Angular, this would be converted to a service
window.MoveableController = MoveableController;
