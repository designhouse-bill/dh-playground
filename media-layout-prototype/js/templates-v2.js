/**
 * Hero Image Templates v2
 *
 * Responsive template system for hero image layouts.
 * Each template defines grids for landscape, portrait, and square card aspects.
 * Templates are starting points - users can adjust images freely.
 */

// ─────────────────────────────────────────────────────────────────
// TEMPLATE DEFINITIONS
// ─────────────────────────────────────────────────────────────────

const TEMPLATES_V2 = {
  // ═══════════════════════════════════════════════════════════════
  // 1 IMAGE
  // ═══════════════════════════════════════════════════════════════

  'h-single': {
    id: 'h-single',
    name: 'Single Image',
    images: 1,
    category: 'horizontal',
    description: 'Full-width single image',

    grids: {
      landscape: {
        columns: '1fr',
        rows: '1fr',
        areas: '"a"',
        gap: '0',
        placements: [{ area: 'a', index: 0 }]
      },
      portrait: {
        columns: '1fr',
        rows: '1fr',
        areas: '"a"',
        gap: '0',
        placements: [{ area: 'a', index: 0 }]
      },
      square: {
        columns: '1fr',
        rows: '1fr',
        areas: '"a"',
        gap: '0',
        placements: [{ area: 'a', index: 0 }]
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // 2 IMAGES
  // ═══════════════════════════════════════════════════════════════

  'h-2-equal': {
    id: 'h-2-equal',
    name: 'Side by Side',
    images: 2,
    category: 'horizontal',
    description: 'Two equal images side by side',

    grids: {
      landscape: {
        columns: '1fr 1fr',
        rows: '1fr',
        areas: '"a b"',
        gap: '4px',
        placements: [
          { area: 'a', index: 0 },
          { area: 'b', index: 1 }
        ]
      },
      portrait: {
        // Becomes stacked when card is tall
        columns: '1fr',
        rows: '1fr 1fr',
        areas: '"a" "b"',
        gap: '4px',
        placements: [
          { area: 'a', index: 0 },
          { area: 'b', index: 1 }
        ]
      },
      square: {
        columns: '1fr 1fr',
        rows: '1fr',
        areas: '"a b"',
        gap: '4px',
        placements: [
          { area: 'a', index: 0 },
          { area: 'b', index: 1 }
        ]
      }
    }
  },

  'h-2-hero-left': {
    id: 'h-2-hero-left',
    name: 'Hero Left',
    images: 2,
    category: 'horizontal',
    description: 'Large image left, small right',

    grids: {
      landscape: {
        columns: '2fr 1fr',
        rows: '1fr',
        areas: '"hero a"',
        gap: '4px',
        placements: [
          { area: 'hero', index: 0 },
          { area: 'a', index: 1 }
        ]
      },
      portrait: {
        columns: '1fr',
        rows: '2fr 1fr',
        areas: '"hero" "a"',
        gap: '4px',
        placements: [
          { area: 'hero', index: 0 },
          { area: 'a', index: 1 }
        ]
      },
      square: {
        columns: '2fr 1fr',
        rows: '1fr',
        areas: '"hero a"',
        gap: '4px',
        placements: [
          { area: 'hero', index: 0 },
          { area: 'a', index: 1 }
        ]
      }
    }
  },

  'h-2-hero-right': {
    id: 'h-2-hero-right',
    name: 'Hero Right',
    images: 2,
    category: 'horizontal',
    description: 'Small image left, large right',

    grids: {
      landscape: {
        columns: '1fr 2fr',
        rows: '1fr',
        areas: '"a hero"',
        gap: '4px',
        placements: [
          { area: 'a', index: 0 },
          { area: 'hero', index: 1 }
        ]
      },
      portrait: {
        columns: '1fr',
        rows: '1fr 2fr',
        areas: '"a" "hero"',
        gap: '4px',
        placements: [
          { area: 'a', index: 0 },
          { area: 'hero', index: 1 }
        ]
      },
      square: {
        columns: '1fr 2fr',
        rows: '1fr',
        areas: '"a hero"',
        gap: '4px',
        placements: [
          { area: 'a', index: 0 },
          { area: 'hero', index: 1 }
        ]
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // 3 IMAGES
  // ═══════════════════════════════════════════════════════════════

  'h-3-equal': {
    id: 'h-3-equal',
    name: 'Three Equal',
    images: 3,
    category: 'horizontal',
    description: 'Three equal images in a row',

    grids: {
      landscape: {
        columns: '1fr 1fr 1fr',
        rows: '1fr',
        areas: '"a b c"',
        gap: '4px',
        placements: [
          { area: 'a', index: 0 },
          { area: 'b', index: 1 },
          { area: 'c', index: 2 }
        ]
      },
      portrait: {
        columns: '1fr',
        rows: '1fr 1fr 1fr',
        areas: '"a" "b" "c"',
        gap: '4px',
        placements: [
          { area: 'a', index: 0 },
          { area: 'b', index: 1 },
          { area: 'c', index: 2 }
        ]
      },
      square: {
        columns: '1fr 1fr 1fr',
        rows: '1fr',
        areas: '"a b c"',
        gap: '4px',
        placements: [
          { area: 'a', index: 0 },
          { area: 'b', index: 1 },
          { area: 'c', index: 2 }
        ]
      }
    }
  },

  'h-3-hero-left': {
    id: 'h-3-hero-left',
    name: 'Hero + 2 Right',
    images: 3,
    category: 'horizontal',
    description: 'Large left, two stacked right',

    grids: {
      landscape: {
        columns: '2fr 1fr',
        rows: '1fr 1fr',
        areas: '"hero a" "hero b"',
        gap: '4px',
        placements: [
          { area: 'hero', index: 0 },
          { area: 'a', index: 1 },
          { area: 'b', index: 2 }
        ]
      },
      portrait: {
        columns: '1fr',
        rows: '2fr 1fr 1fr',
        areas: '"hero" "a" "b"',
        gap: '4px',
        placements: [
          { area: 'hero', index: 0 },
          { area: 'a', index: 1 },
          { area: 'b', index: 2 }
        ]
      },
      square: {
        columns: '1fr 1fr',
        rows: '2fr 1fr',
        areas: '"hero hero" "a b"',
        gap: '4px',
        placements: [
          { area: 'hero', index: 0 },
          { area: 'a', index: 1 },
          { area: 'b', index: 2 }
        ]
      }
    }
  },

  'h-3-hero-center': {
    id: 'h-3-hero-center',
    name: 'Center Hero',
    images: 3,
    category: 'horizontal',
    description: 'Large center, small sides',

    grids: {
      landscape: {
        columns: '1fr 2fr 1fr',
        rows: '1fr',
        areas: '"a hero b"',
        gap: '4px',
        placements: [
          { area: 'a', index: 0 },
          { area: 'hero', index: 1 },
          { area: 'b', index: 2 }
        ]
      },
      portrait: {
        columns: '1fr 1fr',
        rows: '1fr 2fr',
        areas: '"a b" "hero hero"',
        gap: '4px',
        placements: [
          { area: 'a', index: 0 },
          { area: 'b', index: 1 },
          { area: 'hero', index: 2 }
        ]
      },
      square: {
        columns: '1fr 2fr 1fr',
        rows: '1fr',
        areas: '"a hero b"',
        gap: '4px',
        placements: [
          { area: 'a', index: 0 },
          { area: 'hero', index: 1 },
          { area: 'b', index: 2 }
        ]
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // 4 IMAGES
  // ═══════════════════════════════════════════════════════════════

  'h-4-equal': {
    id: 'h-4-equal',
    name: 'Four Equal',
    images: 4,
    category: 'horizontal',
    description: 'Four equal images in a row',

    grids: {
      landscape: {
        columns: '1fr 1fr 1fr 1fr',
        rows: '1fr',
        areas: '"a b c d"',
        gap: '4px',
        placements: [
          { area: 'a', index: 0 },
          { area: 'b', index: 1 },
          { area: 'c', index: 2 },
          { area: 'd', index: 3 }
        ]
      },
      portrait: {
        columns: '1fr 1fr',
        rows: '1fr 1fr',
        areas: '"a b" "c d"',
        gap: '4px',
        placements: [
          { area: 'a', index: 0 },
          { area: 'b', index: 1 },
          { area: 'c', index: 2 },
          { area: 'd', index: 3 }
        ]
      },
      square: {
        columns: '1fr 1fr',
        rows: '1fr 1fr',
        areas: '"a b" "c d"',
        gap: '4px',
        placements: [
          { area: 'a', index: 0 },
          { area: 'b', index: 1 },
          { area: 'c', index: 2 },
          { area: 'd', index: 3 }
        ]
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // 5 IMAGES
  // ═══════════════════════════════════════════════════════════════

  'h-5-equal': {
    id: 'h-5-equal',
    name: 'Five Equal',
    images: 5,
    category: 'horizontal',
    description: 'Five equal images in a row',

    grids: {
      landscape: {
        columns: '1fr 1fr 1fr 1fr 1fr',
        rows: '1fr',
        areas: '"a b c d e"',
        gap: '4px',
        placements: [
          { area: 'a', index: 0 },
          { area: 'b', index: 1 },
          { area: 'c', index: 2 },
          { area: 'd', index: 3 },
          { area: 'e', index: 4 }
        ]
      },
      portrait: {
        columns: '1fr 1fr',
        rows: '1fr 1fr 1fr',
        areas: '"a b" "c d" "e e"',
        gap: '4px',
        placements: [
          { area: 'a', index: 0 },
          { area: 'b', index: 1 },
          { area: 'c', index: 2 },
          { area: 'd', index: 3 },
          { area: 'e', index: 4 }
        ]
      },
      square: {
        columns: '1fr 1fr 1fr',
        rows: '1fr 1fr',
        areas: '"a b c" "d e e"',
        gap: '4px',
        placements: [
          { area: 'a', index: 0 },
          { area: 'b', index: 1 },
          { area: 'c', index: 2 },
          { area: 'd', index: 3 },
          { area: 'e', index: 4 }
        ]
      }
    }
  }
};

// ─────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────

/**
 * Get card aspect from size string (e.g., '3x2')
 * @param {string} cardSize - Card size in format 'WxH'
 * @returns {'landscape' | 'portrait' | 'square'}
 */
function getCardAspect(cardSize) {
  const [cols, rows] = cardSize.split('x').map(Number);
  if (cols > rows) return 'landscape';
  if (rows > cols) return 'portrait';
  return 'square';
}

/**
 * Get the appropriate grid definition for a template and card size
 * @param {string} templateId - Template ID
 * @param {string} cardSize - Card size (e.g., '3x2')
 * @returns {Object|null} Grid definition or null if template not found
 */
function getTemplateGrid(templateId, cardSize) {
  const template = TEMPLATES_V2[templateId];
  if (!template) return null;

  const aspect = getCardAspect(cardSize);
  return template.grids[aspect];
}

/**
 * Get all templates for a given image count
 * @param {number} count - Number of images
 * @returns {Object[]} Array of matching templates
 */
function getTemplatesForImageCount(count) {
  return Object.values(TEMPLATES_V2).filter(t => t.images === count);
}

/**
 * Get all templates filtered by category
 * @param {string} category - Category ('horizontal', 'vertical', 'grid')
 * @returns {Object[]} Array of matching templates
 */
function getTemplatesByCategory(category) {
  return Object.values(TEMPLATES_V2).filter(t => t.category === category);
}

/**
 * Get a single template by ID
 * @param {string} templateId - Template ID
 * @returns {Object|null} Template or null if not found
 */
function getTemplate(templateId) {
  return TEMPLATES_V2[templateId] || null;
}

/**
 * Get all available template IDs
 * @returns {string[]} Array of template IDs
 */
function getTemplateIds() {
  return Object.keys(TEMPLATES_V2);
}

/**
 * Find the best template for given conditions
 * @param {number} imageCount - Number of images
 * @param {string} cardSize - Card size (e.g., '3x2')
 * @returns {Object} Best matching template
 */
function findBestTemplate(imageCount, cardSize) {
  const aspect = getCardAspect(cardSize);
  const candidates = getTemplatesForImageCount(imageCount);

  if (candidates.length === 0) {
    // Fallback to single image template
    return TEMPLATES_V2['h-single'];
  }

  // Prefer horizontal for landscape, try to find matching category
  const preferred = candidates.find(t => {
    if (aspect === 'landscape' && t.category === 'horizontal') return true;
    if (aspect === 'portrait' && t.category === 'vertical') return true;
    return false;
  });

  return preferred || candidates[0];
}

/**
 * Generate CSS styles from a grid definition
 * @param {Object} grid - Grid definition from template
 * @returns {Object} CSS style object
 */
function gridToStyles(grid) {
  return {
    display: 'grid',
    gridTemplateColumns: grid.columns,
    gridTemplateRows: grid.rows,
    gridTemplateAreas: grid.areas,
    gap: grid.gap || '4px'
  };
}

/**
 * Generate CSS string from a grid definition
 * @param {Object} grid - Grid definition from template
 * @returns {string} CSS string
 */
function gridToCSS(grid) {
  return `
    display: grid;
    grid-template-columns: ${grid.columns};
    grid-template-rows: ${grid.rows};
    grid-template-areas: ${grid.areas};
    gap: ${grid.gap || '4px'};
  `.trim();
}

// ─────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────

// Make available globally
window.TEMPLATES_V2 = TEMPLATES_V2;
window.getCardAspect = getCardAspect;
window.getTemplateGrid = getTemplateGrid;
window.getTemplatesForImageCount = getTemplatesForImageCount;
window.getTemplatesByCategory = getTemplatesByCategory;
window.getTemplate = getTemplate;
window.getTemplateIds = getTemplateIds;
window.findBestTemplate = findBestTemplate;
window.gridToStyles = gridToStyles;
window.gridToCSS = gridToCSS;

// Node.js export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TEMPLATES_V2,
    getCardAspect,
    getTemplateGrid,
    getTemplatesForImageCount,
    getTemplatesByCategory,
    getTemplate,
    getTemplateIds,
    findBestTemplate,
    gridToStyles,
    gridToCSS
  };
}
