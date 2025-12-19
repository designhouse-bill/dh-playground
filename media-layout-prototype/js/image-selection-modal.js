/**
 * ImageSelectionModal - Prompts user to choose which images to keep
 * when switching to a card size with fewer max images
 *
 * Designed for easy conversion to Angular component
 */
class ImageSelectionModal {
  constructor(options = {}) {
    this.container = null;
    this.onSelect = options.onSelect || (() => {});
    this.onCancel = options.onCancel || (() => {});
  }

  /**
   * Show the modal with image selection options
   * @param {Array} slots - Array of slot objects with images
   * @param {number} maxAllowed - Maximum images allowed for target size
   * @param {string} targetSize - The target card size (e.g., '1x1')
   */
  show(slots, maxAllowed, targetSize) {
    // Remove any existing modal
    this.hide();

    // Pre-select the first N images by default
    const preselected = slots.slice(0, maxAllowed).map((_, i) => i);

    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'image-selection-modal-overlay';
    modal.id = 'image-selection-modal';
    modal.innerHTML = `
      <div class="image-selection-modal">
        <div class="image-selection-modal__header">
          <h3>Select Images for ${targetSize}</h3>
          <p class="text-muted text-sm">This size supports up to ${maxAllowed} image${maxAllowed > 1 ? 's' : ''}. Select which to keep active.</p>
        </div>
        <div class="image-selection-modal__body">
          <div class="image-selection-grid">
            ${slots.map((slot, index) => `
              <label class="image-selection-item ${preselected.includes(index) ? 'selected' : ''}" data-index="${index}">
                <input type="checkbox"
                       data-index="${index}"
                       ${preselected.includes(index) ? 'checked' : ''}>
                <div class="image-selection-item__preview">
                  <img src="${slot.image.url}" alt="${slot.image.name}">
                </div>
                <span class="image-selection-item__name">${slot.image.name}</span>
                <span class="image-selection-item__check">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                  </svg>
                </span>
              </label>
            `).join('')}
          </div>
          <div class="image-selection-count">
            <span id="selection-count">${preselected.length}</span> of ${maxAllowed} selected
          </div>
        </div>
        <div class="image-selection-modal__footer">
          <button class="p-button p-button-secondary" id="cancel-selection-btn">Cancel</button>
          <button class="p-button p-button-primary" id="apply-selection-btn">Apply Selection</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.container = modal;

    // Animate in
    requestAnimationFrame(() => {
      modal.classList.add('active');
    });

    // Setup handlers
    this._attachHandlers(slots, maxAllowed);
  }

  /**
   * Attach event handlers
   * @private
   */
  _attachHandlers(slots, maxAllowed) {
    if (!this.container) return;

    const checkboxes = this.container.querySelectorAll('input[type="checkbox"]');
    const countDisplay = this.container.querySelector('#selection-count');
    const applyBtn = this.container.querySelector('#apply-selection-btn');

    // Update visual state helper
    const updateVisualState = () => {
      const checked = this.container.querySelectorAll('input[type="checkbox"]:checked');
      if (countDisplay) countDisplay.textContent = checked.length;

      // Update selected class on labels
      checkboxes.forEach(cb => {
        const label = cb.closest('.image-selection-item');
        if (label) {
          label.classList.toggle('selected', cb.checked);
        }
      });

      // Disable/enable apply button
      if (applyBtn) {
        applyBtn.disabled = checked.length === 0 || checked.length > maxAllowed;
      }
    };

    // Checkbox change handler
    checkboxes.forEach(cb => {
      cb.addEventListener('change', () => {
        const checked = this.container.querySelectorAll('input[type="checkbox"]:checked');

        // Prevent selecting more than allowed
        if (checked.length > maxAllowed) {
          cb.checked = false;
        }

        updateVisualState();
      });
    });

    // Cancel button
    this.container.querySelector('#cancel-selection-btn')?.addEventListener('click', () => {
      this.hide();
      this.onCancel();
    });

    // Apply button
    this.container.querySelector('#apply-selection-btn')?.addEventListener('click', () => {
      const selectedIndices = [...this.container.querySelectorAll('input[type="checkbox"]:checked')]
        .map(cb => parseInt(cb.dataset.index));

      this.hide();
      this.onSelect(selectedIndices);
    });

    // Click outside to cancel
    this.container.addEventListener('click', (e) => {
      if (e.target === this.container) {
        this.hide();
        this.onCancel();
      }
    });

    // Escape key to cancel
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        this.hide();
        this.onCancel();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  /**
   * Hide and remove the modal
   */
  hide() {
    const existing = document.getElementById('image-selection-modal');
    if (existing) {
      existing.classList.remove('active');
      setTimeout(() => existing.remove(), 200);
    }
    this.container = null;
  }

  /**
   * Destroy the modal instance
   */
  destroy() {
    this.hide();
    this.onSelect = () => {};
    this.onCancel = () => {};
  }
}

// Make available globally (for vanilla JS prototype)
// In Angular, this would be converted to a service or component
window.ImageSelectionModal = ImageSelectionModal;
