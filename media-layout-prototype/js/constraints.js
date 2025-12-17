/**
 * Card Size Constraints
 *
 * Defines limits and filtering rules for templates based on card size.
 * Used to validate image counts and filter available templates.
 */

// ─────────────────────────────────────────────────────────────────
// CARD SIZE CONSTRAINTS
// ─────────────────────────────────────────────────────────────────

const CARD_SIZE_CONSTRAINTS = {
  '1x1': {
    maxImages: 2,
    defaultTemplate: 'h-single',
    aspectRatio: '1 / 1'
  },
  '2x1': {
    maxImages: 3,
    defaultTemplate: 'h-2-equal',
    aspectRatio: '2 / 1'
  },
  '1x2': {
    maxImages: 3,
    defaultTemplate: 'h-2-equal',
    aspectRatio: '1 / 2'
  },
  '1x3': {
    maxImages: 4,
    defaultTemplate: 'h-3-equal',
    aspectRatio: '1 / 3'
  },
  '2x2': {
    maxImages: 4,
    defaultTemplate: 'h-2-equal',
    aspectRatio: '1 / 1'
  },
  '2x3': {
    maxImages: 5,
    defaultTemplate: 'h-3-equal',
    aspectRatio: '2 / 3'
  },
  '3x1': {
    maxImages: 5,
    defaultTemplate: 'h-3-equal',
    aspectRatio: '3 / 1'
  },
  '3x2': {
    maxImages: 5,
    defaultTemplate: 'h-3-equal',
    aspectRatio: '3 / 2'
  },
  '3x3': {
    maxImages: 5,
    defaultTemplate: 'h-3-equal',
    aspectRatio: '1 / 1'
  }
};

// All available card sizes
const CARD_SIZES = Object.keys(CARD_SIZE_CONSTRAINTS);

// ─────────────────────────────────────────────────────────────────
// CONSTRAINT FUNCTIONS
// ─────────────────────────────────────────────────────────────────

/**
 * Get maximum number of images allowed for a card size
 * @param {string} cardSize - Card size (e.g., '3x2')
 * @returns {number} Maximum images allowed
 */
function getMaxImages(cardSize) {
  const constraint = CARD_SIZE_CONSTRAINTS[cardSize];
  if (!constraint) {
    console.warn(`Unknown card size: ${cardSize}, defaulting to 2`);
    return 2;
  }
  return constraint.maxImages;
}

/**
 * Get the default template for a card size
 * @param {string} cardSize - Card size (e.g., '3x2')
 * @returns {string} Default template ID
 */
function getDefaultTemplate(cardSize) {
  const constraint = CARD_SIZE_CONSTRAINTS[cardSize];
  if (!constraint) {
    return 'h-single';
  }
  return constraint.defaultTemplate;
}

/**
 * Get the CSS aspect ratio for a card size
 * @param {string} cardSize - Card size (e.g., '3x2')
 * @returns {string} CSS aspect-ratio value
 */
function getAspectRatio(cardSize) {
  const constraint = CARD_SIZE_CONSTRAINTS[cardSize];
  if (!constraint) {
    return '1 / 1';
  }
  return constraint.aspectRatio;
}

/**
 * Validate if an image count is allowed for a card size
 * @param {string} cardSize - Card size (e.g., '3x2')
 * @param {number} imageCount - Number of images
 * @returns {Object} Validation result
 */
function validateImageCount(cardSize, imageCount) {
  const maxImages = getMaxImages(cardSize);

  if (imageCount < 1) {
    return {
      valid: false,
      message: 'At least 1 image is required'
    };
  }

  if (imageCount > maxImages) {
    return {
      valid: false,
      message: `Maximum ${maxImages} images allowed for ${cardSize} card`,
      maxImages: maxImages,
      excess: imageCount - maxImages
    };
  }

  return { valid: true };
}

/**
 * Get full constraints for a card size
 * @param {string} cardSize - Card size (e.g., '3x2')
 * @returns {Object|null} Full constraint object
 */
function getConstraints(cardSize) {
  return CARD_SIZE_CONSTRAINTS[cardSize] || null;
}

// ─────────────────────────────────────────────────────────────────
// TEMPLATE FILTERING
// ─────────────────────────────────────────────────────────────────

/**
 * Get templates available for a specific card size and image count
 * @param {string} cardSize - Card size (e.g., '3x2')
 * @param {number} imageCount - Number of images
 * @returns {Object[]} Array of available templates
 */
function getAvailableTemplates(cardSize, imageCount) {
  // Validate image count first
  const validation = validateImageCount(cardSize, imageCount);
  if (!validation.valid) {
    return [];
  }

  // Get templates for this image count (uses templates-v2.js)
  if (typeof getTemplatesForImageCount !== 'function') {
    console.warn('templates-v2.js not loaded');
    return [];
  }

  return getTemplatesForImageCount(imageCount);
}

/**
 * Check if a template is valid for a card size
 * @param {string} templateId - Template ID
 * @param {string} cardSize - Card size (e.g., '3x2')
 * @returns {boolean} Whether template is valid
 */
function isTemplateValidForSize(templateId, cardSize) {
  if (typeof getTemplate !== 'function') {
    return true; // Can't validate without templates
  }

  const template = getTemplate(templateId);
  if (!template) return false;

  const maxImages = getMaxImages(cardSize);
  return template.images <= maxImages;
}

/**
 * Get the best template when constraints change
 * @param {string} currentTemplateId - Current template ID
 * @param {string} newCardSize - New card size
 * @param {number} imageCount - Current image count
 * @returns {string} Best template ID for new constraints
 */
function getBestTemplateForChange(currentTemplateId, newCardSize, imageCount) {
  // Check if current template is still valid
  if (isTemplateValidForSize(currentTemplateId, newCardSize)) {
    return currentTemplateId;
  }

  // Find a new template
  if (typeof findBestTemplate === 'function') {
    const best = findBestTemplate(imageCount, newCardSize);
    return best ? best.id : 'h-single';
  }

  return getDefaultTemplate(newCardSize);
}

// ─────────────────────────────────────────────────────────────────
// SIZE TRANSITION HELPERS
// ─────────────────────────────────────────────────────────────────

/**
 * Calculate what happens when changing to a new card size
 * @param {string} fromSize - Current card size
 * @param {string} toSize - Target card size
 * @param {number} currentImageCount - Current number of images
 * @returns {Object} Transition info
 */
function calculateSizeTransition(fromSize, toSize, currentImageCount) {
  const fromMax = getMaxImages(fromSize);
  const toMax = getMaxImages(toSize);

  const result = {
    fromSize,
    toSize,
    fromMax,
    toMax,
    currentImages: currentImageCount,
    canTransition: true,
    imagesOverflow: 0,
    action: 'none'
  };

  if (currentImageCount > toMax) {
    result.canTransition = false;
    result.imagesOverflow = currentImageCount - toMax;
    result.action = 'reduce_images';
    result.message = `New size supports ${toMax} images. Remove ${result.imagesOverflow} to continue.`;
  }

  return result;
}

/**
 * Get recommended images to keep when reducing count
 * Strategy: Keep first N images (user can reorder before transition)
 * @param {Array} images - Current images array
 * @param {number} maxToKeep - Maximum images to keep
 * @returns {Array} Images to keep
 */
function getImagesToKeep(images, maxToKeep) {
  return images.slice(0, maxToKeep);
}

// ─────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────

// Make available globally
window.CARD_SIZE_CONSTRAINTS = CARD_SIZE_CONSTRAINTS;
window.CARD_SIZES = CARD_SIZES;
window.getMaxImages = getMaxImages;
window.getDefaultTemplate = getDefaultTemplate;
window.getAspectRatio = getAspectRatio;
window.validateImageCount = validateImageCount;
window.getConstraints = getConstraints;
window.getAvailableTemplates = getAvailableTemplates;
window.isTemplateValidForSize = isTemplateValidForSize;
window.getBestTemplateForChange = getBestTemplateForChange;
window.calculateSizeTransition = calculateSizeTransition;
window.getImagesToKeep = getImagesToKeep;

// Node.js export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CARD_SIZE_CONSTRAINTS,
    CARD_SIZES,
    getMaxImages,
    getDefaultTemplate,
    getAspectRatio,
    validateImageCount,
    getConstraints,
    getAvailableTemplates,
    isTemplateValidForSize,
    getBestTemplateForChange,
    calculateSizeTransition,
    getImagesToKeep
  };
}
