/**
 * Card Size Constraints Configuration
 * Defines the allowed sizes, layouts, and image limits for media cards
 */

// Layout types
const LAYOUT_TYPES = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',
  GRID: 'grid'
};

// Card size constraint definitions
const CARD_SIZE_CONSTRAINTS = {
  '1x1': {
    maxImages: 2,
    allowedLayouts: [LAYOUT_TYPES.GRID],
    forcedLayout: LAYOUT_TYPES.GRID,
    defaultLayout: LAYOUT_TYPES.GRID,
    disabledLayoutReasons: {
      horizontal: 'Card is too small for horizontal layout',
      vertical: 'Card is too small for vertical layout'
    }
  },
  '2x1': {
    maxImages: 3,
    allowedLayouts: [LAYOUT_TYPES.HORIZONTAL],
    forcedLayout: LAYOUT_TYPES.HORIZONTAL,
    defaultLayout: LAYOUT_TYPES.HORIZONTAL,
    disabledLayoutReasons: {
      vertical: 'Wide cards work best with horizontal layout',
      grid: 'Card height is too limited for grid layout'
    }
  },
  '1x2': {
    maxImages: 3,
    allowedLayouts: [LAYOUT_TYPES.VERTICAL],
    forcedLayout: LAYOUT_TYPES.VERTICAL,
    defaultLayout: LAYOUT_TYPES.VERTICAL,
    disabledLayoutReasons: {
      horizontal: 'Tall cards work best with vertical layout',
      grid: 'Card width is too limited for grid layout'
    }
  },
  '1x3': {
    maxImages: 4,
    allowedLayouts: [LAYOUT_TYPES.VERTICAL],
    forcedLayout: LAYOUT_TYPES.VERTICAL,
    defaultLayout: LAYOUT_TYPES.VERTICAL,
    disabledLayoutReasons: {
      horizontal: 'Extra-tall cards require vertical layout',
      grid: 'Card width is too limited for grid layout'
    }
  },
  '2x2': {
    maxImages: 4,
    allowedLayouts: [LAYOUT_TYPES.HORIZONTAL, LAYOUT_TYPES.VERTICAL, LAYOUT_TYPES.GRID],
    forcedLayout: null,
    defaultLayout: LAYOUT_TYPES.HORIZONTAL,
    disabledLayoutReasons: {}
  },
  '2x3': {
    maxImages: 5,
    allowedLayouts: [LAYOUT_TYPES.HORIZONTAL, LAYOUT_TYPES.VERTICAL, LAYOUT_TYPES.GRID],
    forcedLayout: null,
    defaultLayout: LAYOUT_TYPES.VERTICAL,
    disabledLayoutReasons: {}
  },
  '3x1': {
    maxImages: 5,
    allowedLayouts: [LAYOUT_TYPES.HORIZONTAL],
    forcedLayout: LAYOUT_TYPES.HORIZONTAL,
    defaultLayout: LAYOUT_TYPES.HORIZONTAL,
    disabledLayoutReasons: {
      vertical: 'Extra-wide cards require horizontal layout',
      grid: 'Card height is too limited for grid layout'
    }
  },
  '3x2': {
    maxImages: 5,
    allowedLayouts: [LAYOUT_TYPES.HORIZONTAL, LAYOUT_TYPES.VERTICAL, LAYOUT_TYPES.GRID],
    forcedLayout: null,
    defaultLayout: LAYOUT_TYPES.HORIZONTAL,
    disabledLayoutReasons: {}
  },
  '3x3': {
    maxImages: 5,
    allowedLayouts: [LAYOUT_TYPES.HORIZONTAL, LAYOUT_TYPES.VERTICAL, LAYOUT_TYPES.GRID],
    forcedLayout: null,
    defaultLayout: LAYOUT_TYPES.HORIZONTAL,
    disabledLayoutReasons: {}
  }
};

// All available card sizes
const CARD_SIZES = Object.keys(CARD_SIZE_CONSTRAINTS);

/**
 * Get maximum number of images allowed for a card size
 * @param {string} cardSize - The card size (e.g., '2x2')
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
 * Get allowed layouts for a card size
 * @param {string} cardSize - The card size (e.g., '2x2')
 * @returns {string[]} Array of allowed layout types
 */
function getAllowedLayouts(cardSize) {
  const constraint = CARD_SIZE_CONSTRAINTS[cardSize];
  if (!constraint) {
    console.warn(`Unknown card size: ${cardSize}, defaulting to grid only`);
    return [LAYOUT_TYPES.GRID];
  }
  return [...constraint.allowedLayouts];
}

/**
 * Check if a layout is allowed for a card size
 * @param {string} cardSize - The card size (e.g., '2x2')
 * @param {string} layout - The layout type to check
 * @returns {boolean} Whether the layout is allowed
 */
function isLayoutAllowed(cardSize, layout) {
  const constraint = CARD_SIZE_CONSTRAINTS[cardSize];
  if (!constraint) {
    return layout === LAYOUT_TYPES.GRID;
  }
  return constraint.allowedLayouts.includes(layout);
}

/**
 * Get the reason why a layout is disabled for a card size
 * @param {string} cardSize - The card size (e.g., '2x2')
 * @param {string} layout - The layout type to check
 * @returns {string|null} Reason string or null if layout is allowed
 */
function getDisabledReason(cardSize, layout) {
  const constraint = CARD_SIZE_CONSTRAINTS[cardSize];
  if (!constraint) {
    return layout !== LAYOUT_TYPES.GRID ? 'Unknown card size' : null;
  }

  if (constraint.allowedLayouts.includes(layout)) {
    return null;
  }

  return constraint.disabledLayoutReasons[layout] || 'Layout not supported for this size';
}

/**
 * Get the default layout for a card size
 * @param {string} cardSize - The card size (e.g., '2x2')
 * @returns {string} Default layout type
 */
function getDefaultLayout(cardSize) {
  const constraint = CARD_SIZE_CONSTRAINTS[cardSize];
  if (!constraint) {
    console.warn(`Unknown card size: ${cardSize}, defaulting to grid`);
    return LAYOUT_TYPES.GRID;
  }
  return constraint.defaultLayout;
}

/**
 * Get the forced layout for a card size (if any)
 * @param {string} cardSize - The card size (e.g., '2x2')
 * @returns {string|null} Forced layout type or null if multiple layouts allowed
 */
function getForcedLayout(cardSize) {
  const constraint = CARD_SIZE_CONSTRAINTS[cardSize];
  if (!constraint) {
    return LAYOUT_TYPES.GRID;
  }
  return constraint.forcedLayout;
}

/**
 * Get full constraint object for a card size
 * @param {string} cardSize - The card size (e.g., '2x2')
 * @returns {Object|null} Full constraint object or null if not found
 */
function getConstraints(cardSize) {
  return CARD_SIZE_CONSTRAINTS[cardSize] || null;
}

/**
 * Validate image count for a card size
 * @param {string} cardSize - The card size (e.g., '2x2')
 * @param {number} imageCount - Number of images to validate
 * @returns {Object} Validation result with isValid and message
 */
function validateImageCount(cardSize, imageCount) {
  const maxImages = getMaxImages(cardSize);

  if (imageCount < 1) {
    return {
      isValid: false,
      message: 'At least 1 image is required'
    };
  }

  if (imageCount > maxImages) {
    return {
      isValid: false,
      message: `Maximum ${maxImages} images allowed for ${cardSize} card`
    };
  }

  return {
    isValid: true,
    message: null
  };
}

// Export for use in other modules (Node.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    LAYOUT_TYPES,
    CARD_SIZE_CONSTRAINTS,
    CARD_SIZES,
    getMaxImages,
    getAllowedLayouts,
    isLayoutAllowed,
    getDisabledReason,
    getDefaultLayout,
    getForcedLayout,
    getConstraints,
    validateImageCount
  };
}
