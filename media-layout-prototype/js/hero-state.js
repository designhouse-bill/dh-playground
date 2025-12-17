/**
 * Hero State Management
 *
 * Single source of truth for hero image layout state.
 * Both sliders and drag manipulation call updateImageAdjustment().
 * Preview passively renders current state.
 */

// ─────────────────────────────────────────────────────────────────
// STATE DEFINITION
// ─────────────────────────────────────────────────────────────────

/**
 * Hero State Object
 * @type {Object}
 */
const heroState = {
  // Current template ID
  templateId: 'h-single',

  // Current card size (e.g., '3x2')
  cardSize: '2x2',

  // Selected image index (for adjustment panel sync)
  selectedIndex: 0,

  // Array of image objects
  images: [
    // Example structure:
    // {
    //   src: 'path/to/image.png',
    //   contentMode: 'contain',  // 'cover' | 'contain' | 'fill'
    //   offsetX: 0,
    //   offsetY: 0,
    //   scale: 1,
    //   rotation: 0,
    //   zIndex: 0,
    //   opacity: 1
    // }
  ],

  // Listeners for state changes
  _listeners: [],

  // Change history for undo (future feature)
  _history: [],
  _historyIndex: -1
};

// ─────────────────────────────────────────────────────────────────
// STATE CHANGE LISTENERS
// ─────────────────────────────────────────────────────────────────

/**
 * Add a listener for state changes
 * @param {Function} callback - Function to call on state change
 * @returns {Function} Unsubscribe function
 */
function addStateListener(callback) {
  heroState._listeners.push(callback);

  // Return unsubscribe function
  return () => {
    const index = heroState._listeners.indexOf(callback);
    if (index > -1) {
      heroState._listeners.splice(index, 1);
    }
  };
}

/**
 * Notify all listeners of a state change
 * @param {string} type - Type of change ('image', 'template', 'cardSize', 'selection')
 * @param {Object} detail - Details about the change
 */
function notifyListeners(type, detail = {}) {
  heroState._listeners.forEach(callback => {
    try {
      callback({ type, detail, state: heroState });
    } catch (e) {
      console.error('State listener error:', e);
    }
  });
}

// ─────────────────────────────────────────────────────────────────
// IMAGE MANAGEMENT
// ─────────────────────────────────────────────────────────────────

/**
 * Create a default image object
 * @param {string} src - Image source URL
 * @returns {Object} Image object with default values
 */
function createImageObject(src) {
  return {
    src: src,
    contentMode: 'contain',
    offsetX: 0,
    offsetY: 0,
    scale: 1,
    rotation: 0,
    zIndex: 0,
    opacity: 1
  };
}

/**
 * Add an image to the state
 * @param {string} src - Image source URL
 * @param {Object} options - Optional initial values
 * @returns {number} Index of the new image
 */
function addImage(src, options = {}) {
  const image = {
    ...createImageObject(src),
    ...options
  };

  heroState.images.push(image);
  const index = heroState.images.length - 1;

  notifyListeners('image', { action: 'add', index, image });
  return index;
}

/**
 * Remove an image from the state
 * @param {number} index - Index of image to remove
 */
function removeImage(index) {
  if (index < 0 || index >= heroState.images.length) return;

  const removed = heroState.images.splice(index, 1)[0];

  // Adjust selected index if needed
  if (heroState.selectedIndex >= heroState.images.length) {
    heroState.selectedIndex = Math.max(0, heroState.images.length - 1);
  }

  notifyListeners('image', { action: 'remove', index, image: removed });
}

/**
 * Set all images at once
 * @param {Array} images - Array of image objects or src strings
 */
function setImages(images) {
  heroState.images = images.map(img => {
    if (typeof img === 'string') {
      return createImageObject(img);
    }
    return { ...createImageObject(img.src || img.image), ...img };
  });

  // Reset selection if out of bounds
  if (heroState.selectedIndex >= heroState.images.length) {
    heroState.selectedIndex = 0;
  }

  notifyListeners('image', { action: 'set', images: heroState.images });
}

/**
 * Reorder images
 * @param {number} fromIndex - Current index
 * @param {number} toIndex - New index
 */
function reorderImages(fromIndex, toIndex) {
  if (fromIndex < 0 || fromIndex >= heroState.images.length) return;
  if (toIndex < 0 || toIndex >= heroState.images.length) return;

  const [image] = heroState.images.splice(fromIndex, 1);
  heroState.images.splice(toIndex, 0, image);

  notifyListeners('image', { action: 'reorder', fromIndex, toIndex });
}

// ─────────────────────────────────────────────────────────────────
// IMAGE ADJUSTMENT (Core Function - Used by Sliders AND Drag)
// ─────────────────────────────────────────────────────────────────

/**
 * Update a single property of an image's adjustments
 * THIS IS THE CORE FUNCTION - both sliders and drag call this
 *
 * @param {number} index - Image index
 * @param {string} property - Property name (offsetX, offsetY, scale, rotation, etc.)
 * @param {*} value - New value
 */
function updateImageAdjustment(index, property, value) {
  if (index < 0 || index >= heroState.images.length) {
    console.warn(`Invalid image index: ${index}`);
    return;
  }

  const image = heroState.images[index];
  const oldValue = image[property];

  // Only update if value changed
  if (oldValue === value) return;

  // Update the value
  image[property] = value;

  // Notify listeners
  notifyListeners('image', {
    action: 'adjust',
    index,
    property,
    oldValue,
    newValue: value
  });
}

/**
 * Update multiple properties of an image at once
 * @param {number} index - Image index
 * @param {Object} adjustments - Object with property/value pairs
 */
function updateImageAdjustments(index, adjustments) {
  if (index < 0 || index >= heroState.images.length) return;

  const image = heroState.images[index];
  const changes = {};

  Object.entries(adjustments).forEach(([property, value]) => {
    if (image[property] !== value) {
      changes[property] = { oldValue: image[property], newValue: value };
      image[property] = value;
    }
  });

  if (Object.keys(changes).length > 0) {
    notifyListeners('image', { action: 'adjustMultiple', index, changes });
  }
}

/**
 * Reset an image's adjustments to defaults
 * @param {number} index - Image index
 */
function resetImageAdjustments(index) {
  if (index < 0 || index >= heroState.images.length) return;

  const image = heroState.images[index];
  const src = image.src;

  heroState.images[index] = createImageObject(src);

  notifyListeners('image', { action: 'reset', index });
}

/**
 * Get adjustments for an image
 * @param {number} index - Image index
 * @returns {Object} Image adjustments or empty object
 */
function getImageAdjustments(index) {
  if (index < 0 || index >= heroState.images.length) {
    return createImageObject('');
  }
  return { ...heroState.images[index] };
}

// ─────────────────────────────────────────────────────────────────
// SELECTION
// ─────────────────────────────────────────────────────────────────

/**
 * Set the selected image index
 * @param {number} index - Image index to select
 */
function setSelectedIndex(index) {
  if (index < 0 || index >= heroState.images.length) return;

  const oldIndex = heroState.selectedIndex;
  heroState.selectedIndex = index;

  if (oldIndex !== index) {
    notifyListeners('selection', { oldIndex, newIndex: index });
  }
}

/**
 * Get the currently selected image index
 * @returns {number} Selected index
 */
function getSelectedIndex() {
  return heroState.selectedIndex;
}

/**
 * Get the currently selected image
 * @returns {Object|null} Selected image or null
 */
function getSelectedImage() {
  return heroState.images[heroState.selectedIndex] || null;
}

// ─────────────────────────────────────────────────────────────────
// TEMPLATE MANAGEMENT
// ─────────────────────────────────────────────────────────────────

/**
 * Set the current template
 * @param {string} templateId - Template ID
 */
function setTemplate(templateId) {
  const oldTemplate = heroState.templateId;
  heroState.templateId = templateId;

  if (oldTemplate !== templateId) {
    notifyListeners('template', { oldTemplate, newTemplate: templateId });
  }
}

/**
 * Get the current template ID
 * @returns {string} Current template ID
 */
function getTemplateId() {
  return heroState.templateId;
}

// ─────────────────────────────────────────────────────────────────
// CARD SIZE MANAGEMENT
// ─────────────────────────────────────────────────────────────────

/**
 * Set the card size with validation
 * @param {string} newSize - New card size (e.g., '3x2')
 * @returns {Object} Result with valid flag and any messages
 */
function setCardSize(newSize) {
  const oldSize = heroState.cardSize;

  // Validate format
  if (!/^\d+x\d+$/.test(newSize)) {
    return { valid: false, message: 'Invalid card size format' };
  }

  // Check max images constraint (using constraints.js if available)
  if (typeof getMaxImages === 'function') {
    const maxImages = getMaxImages(newSize);
    if (heroState.images.length > maxImages) {
      return {
        valid: false,
        action: 'reduce_images',
        message: `Card size ${newSize} supports max ${maxImages} images. You have ${heroState.images.length}.`,
        currentImages: heroState.images.length,
        maxImages: maxImages
      };
    }
  }

  heroState.cardSize = newSize;

  if (oldSize !== newSize) {
    notifyListeners('cardSize', { oldSize, newSize });
  }

  return { valid: true };
}

/**
 * Get the current card size
 * @returns {string} Current card size
 */
function getCardSize() {
  return heroState.cardSize;
}

// ─────────────────────────────────────────────────────────────────
// FULL STATE ACCESS
// ─────────────────────────────────────────────────────────────────

/**
 * Get a snapshot of the current state
 * @returns {Object} State snapshot (deep copy)
 */
function getState() {
  return {
    templateId: heroState.templateId,
    cardSize: heroState.cardSize,
    selectedIndex: heroState.selectedIndex,
    images: heroState.images.map(img => ({ ...img }))
  };
}

/**
 * Load state from a saved object
 * @param {Object} savedState - Previously saved state
 */
function loadState(savedState) {
  if (savedState.templateId) {
    heroState.templateId = savedState.templateId;
  }
  if (savedState.cardSize) {
    heroState.cardSize = savedState.cardSize;
  }
  if (savedState.selectedIndex !== undefined) {
    heroState.selectedIndex = savedState.selectedIndex;
  }
  if (savedState.images) {
    heroState.images = savedState.images.map(img => ({ ...img }));
  }

  notifyListeners('load', { state: savedState });
}

/**
 * Export state as JSON string
 * @returns {string} JSON string
 */
function exportState() {
  return JSON.stringify(getState(), null, 2);
}

/**
 * Import state from JSON string
 * @param {string} jsonString - JSON state string
 * @returns {boolean} Success
 */
function importState(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    loadState(parsed);
    return true;
  } catch (e) {
    console.error('Failed to import state:', e);
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────

// Create a public API object
const HeroState = {
  // State access
  getState,
  loadState,
  exportState,
  importState,

  // Listeners
  addStateListener,

  // Images
  addImage,
  removeImage,
  setImages,
  reorderImages,

  // Adjustments (CORE)
  updateImageAdjustment,
  updateImageAdjustments,
  resetImageAdjustments,
  getImageAdjustments,

  // Selection
  setSelectedIndex,
  getSelectedIndex,
  getSelectedImage,

  // Template
  setTemplate,
  getTemplateId,

  // Card size
  setCardSize,
  getCardSize
};

// Attach methods directly to heroState object for convenience
heroState.subscribe = addStateListener;
heroState.addImage = addImage;
heroState.removeImage = removeImage;
heroState.setImages = setImages;
heroState.reorderImages = reorderImages;
heroState.updateImageAdjustment = updateImageAdjustment;
heroState.updateImageAdjustments = updateImageAdjustments;
heroState.resetImageAdjustments = resetImageAdjustments;
heroState.getImageAdjustments = getImageAdjustments;
heroState.setSelectedIndex = setSelectedIndex;
heroState.getSelectedIndex = getSelectedIndex;
heroState.getSelectedImage = getSelectedImage;
heroState.setTemplate = setTemplate;
heroState.getTemplateId = getTemplateId;
heroState.setCardSize = setCardSize;
heroState.getCardSize = getCardSize;
heroState.getState = getState;
heroState.loadState = loadState;

// Make available globally
window.heroState = heroState;
window.HeroState = HeroState;

// Also expose individual functions for convenience
window.updateImageAdjustment = updateImageAdjustment;
window.getImageAdjustments = getImageAdjustments;
window.setSelectedIndex = setSelectedIndex;
window.addStateListener = addStateListener;

// Node.js export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HeroState;
}
