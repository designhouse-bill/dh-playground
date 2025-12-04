/**
 * Layout Template Generation
 * Generates CSS Grid templates for media card layouts
 */

// Emphasis types
const EMPHASIS_TYPES = {
  EQUAL: 'equal',
  FIRST: 'first',
  LAST: 'last',
  CENTER: 'center'
};

// Direction types
const DIRECTION_TYPES = {
  NORMAL: 'normal',
  FLIP: 'flip'
};

/**
 * Parse card size string into width and height units
 * @param {string} cardSize - Card size (e.g., '3x2')
 * @returns {{ width: number, height: number }}
 */
function parseCardSize(cardSize) {
  const [width, height] = cardSize.split('x').map(Number);
  return { width: width || 1, height: height || 1 };
}

/**
 * Determine if card is landscape, portrait, or square
 * @param {string} cardSize - Card size (e.g., '3x2')
 * @returns {'landscape' | 'portrait' | 'square'}
 */
function getCardAspect(cardSize) {
  const { width, height } = parseCardSize(cardSize);
  if (width > height) return 'landscape';
  if (height > width) return 'portrait';
  return 'square';
}

/**
 * Generate horizontal layout (items in a row)
 * @param {number} imageCount - Number of images
 * @param {string} emphasis - Emphasis type
 * @param {string} direction - Direction type
 * @returns {Object} Grid template configuration
 */
function generateHorizontalLayout(imageCount, emphasis, direction) {
  let columns = [];

  // Generate column sizes based on emphasis
  switch (emphasis) {
    case EMPHASIS_TYPES.FIRST:
      columns = ['2fr', ...Array(imageCount - 1).fill('1fr')];
      break;
    case EMPHASIS_TYPES.LAST:
      columns = [...Array(imageCount - 1).fill('1fr'), '2fr'];
      break;
    case EMPHASIS_TYPES.CENTER:
      if (imageCount >= 3) {
        const centerIndex = Math.floor(imageCount / 2);
        columns = Array(imageCount).fill('1fr');
        columns[centerIndex] = '2fr';
      } else {
        columns = Array(imageCount).fill('1fr');
      }
      break;
    case EMPHASIS_TYPES.EQUAL:
    default:
      columns = Array(imageCount).fill('1fr');
  }

  // Generate item placements
  let itemPlacements = columns.map((_, index) => ({
    gridColumn: `${index + 1}`,
    gridRow: '1',
    index: index
  }));

  // Handle flip direction
  if (direction === DIRECTION_TYPES.FLIP) {
    itemPlacements = itemPlacements.reverse().map((item, newIndex) => ({
      ...item,
      gridColumn: `${newIndex + 1}`
    }));
    columns = columns.reverse();
  }

  return {
    gridTemplateColumns: columns.join(' '),
    gridTemplateRows: '1fr',
    gridTemplateAreas: null,
    itemPlacements
  };
}

/**
 * Generate vertical layout (items stacked)
 * @param {number} imageCount - Number of images
 * @param {string} emphasis - Emphasis type
 * @param {string} direction - Direction type
 * @returns {Object} Grid template configuration
 */
function generateVerticalLayout(imageCount, emphasis, direction) {
  let rows = [];

  // Generate row sizes based on emphasis
  switch (emphasis) {
    case EMPHASIS_TYPES.FIRST:
      rows = ['2fr', ...Array(imageCount - 1).fill('1fr')];
      break;
    case EMPHASIS_TYPES.LAST:
      rows = [...Array(imageCount - 1).fill('1fr'), '2fr'];
      break;
    case EMPHASIS_TYPES.CENTER:
      if (imageCount >= 3) {
        const centerIndex = Math.floor(imageCount / 2);
        rows = Array(imageCount).fill('1fr');
        rows[centerIndex] = '2fr';
      } else {
        rows = Array(imageCount).fill('1fr');
      }
      break;
    case EMPHASIS_TYPES.EQUAL:
    default:
      rows = Array(imageCount).fill('1fr');
  }

  // Generate item placements
  let itemPlacements = rows.map((_, index) => ({
    gridColumn: '1',
    gridRow: `${index + 1}`,
    index: index
  }));

  // Handle flip direction
  if (direction === DIRECTION_TYPES.FLIP) {
    itemPlacements = itemPlacements.reverse().map((item, newIndex) => ({
      ...item,
      gridRow: `${newIndex + 1}`
    }));
    rows = rows.reverse();
  }

  return {
    gridTemplateColumns: '1fr',
    gridTemplateRows: rows.join(' '),
    gridTemplateAreas: null,
    itemPlacements
  };
}

/**
 * Generate grid layout (2D arrangement)
 * @param {number} imageCount - Number of images
 * @param {string} cardSize - Card size for aspect ratio
 * @param {string} emphasis - Emphasis type
 * @param {string} direction - Direction type
 * @returns {Object} Grid template configuration
 */
function generateGridLayout(imageCount, cardSize, emphasis, direction) {
  const aspect = getCardAspect(cardSize);
  let cols, rows, areas, itemPlacements;

  // Determine grid structure based on image count and card aspect
  switch (imageCount) {
    case 1:
      return generateSingleItemGrid(emphasis);

    case 2:
      return generate2ItemGrid(aspect, emphasis, direction);

    case 3:
      return generate3ItemGrid(aspect, emphasis, direction);

    case 4:
      return generate4ItemGrid(emphasis, direction);

    case 5:
      return generate5ItemGrid(aspect, emphasis, direction);

    default:
      // Fallback to equal distribution
      return generateEqualGrid(imageCount, aspect, direction);
  }
}

/**
 * Generate single item grid
 */
function generateSingleItemGrid(emphasis) {
  return {
    gridTemplateColumns: '1fr',
    gridTemplateRows: '1fr',
    gridTemplateAreas: '"a"',
    itemPlacements: [{
      gridArea: 'a',
      gridColumn: '1',
      gridRow: '1',
      index: 0
    }]
  };
}

/**
 * Generate 2 item grid
 */
function generate2ItemGrid(aspect, emphasis, direction) {
  const isLandscape = aspect === 'landscape';
  let itemPlacements;
  let columns, rows, areas;

  if (isLandscape) {
    // Side by side
    columns = emphasis === EMPHASIS_TYPES.FIRST ? '2fr 1fr' :
              emphasis === EMPHASIS_TYPES.LAST ? '1fr 2fr' : '1fr 1fr';
    rows = '1fr';
    areas = '"a b"';
    itemPlacements = [
      { gridArea: 'a', gridColumn: '1', gridRow: '1', index: 0 },
      { gridArea: 'b', gridColumn: '2', gridRow: '1', index: 1 }
    ];
  } else {
    // Stacked
    rows = emphasis === EMPHASIS_TYPES.FIRST ? '2fr 1fr' :
           emphasis === EMPHASIS_TYPES.LAST ? '1fr 2fr' : '1fr 1fr';
    columns = '1fr';
    areas = '"a" "b"';
    itemPlacements = [
      { gridArea: 'a', gridColumn: '1', gridRow: '1', index: 0 },
      { gridArea: 'b', gridColumn: '1', gridRow: '2', index: 1 }
    ];
  }

  if (direction === DIRECTION_TYPES.FLIP) {
    itemPlacements = flipPlacements(itemPlacements);
  }

  return {
    gridTemplateColumns: columns,
    gridTemplateRows: rows,
    gridTemplateAreas: areas,
    itemPlacements
  };
}

/**
 * Generate 3 item grid
 */
function generate3ItemGrid(aspect, emphasis, direction) {
  const isLandscape = aspect === 'landscape';
  let itemPlacements;
  let columns, rows, areas;

  if (isLandscape) {
    // 3 in a row for landscape
    if (emphasis === EMPHASIS_TYPES.FIRST) {
      columns = '2fr 1fr 1fr';
    } else if (emphasis === EMPHASIS_TYPES.LAST) {
      columns = '1fr 1fr 2fr';
    } else if (emphasis === EMPHASIS_TYPES.CENTER) {
      columns = '1fr 2fr 1fr';
    } else {
      columns = '1fr 1fr 1fr';
    }
    rows = '1fr';
    areas = '"a b c"';
    itemPlacements = [
      { gridArea: 'a', gridColumn: '1', gridRow: '1', index: 0 },
      { gridArea: 'b', gridColumn: '2', gridRow: '1', index: 1 },
      { gridArea: 'c', gridColumn: '3', gridRow: '1', index: 2 }
    ];
  } else {
    // 1 on top, 2 on bottom (or stacked for portrait)
    if (aspect === 'portrait') {
      // Stacked vertically
      rows = emphasis === EMPHASIS_TYPES.FIRST ? '2fr 1fr 1fr' :
             emphasis === EMPHASIS_TYPES.LAST ? '1fr 1fr 2fr' :
             emphasis === EMPHASIS_TYPES.CENTER ? '1fr 2fr 1fr' : '1fr 1fr 1fr';
      columns = '1fr';
      areas = '"a" "b" "c"';
      itemPlacements = [
        { gridArea: 'a', gridColumn: '1', gridRow: '1', index: 0 },
        { gridArea: 'b', gridColumn: '1', gridRow: '2', index: 1 },
        { gridArea: 'c', gridColumn: '1', gridRow: '3', index: 2 }
      ];
    } else {
      // Square: 1 large on top, 2 small on bottom
      columns = '1fr 1fr';
      if (emphasis === EMPHASIS_TYPES.FIRST) {
        rows = '2fr 1fr';
      } else if (emphasis === EMPHASIS_TYPES.LAST) {
        rows = '1fr 2fr';
      } else {
        rows = '1fr 1fr';
      }
      areas = '"a a" "b c"';
      itemPlacements = [
        { gridArea: 'a', gridColumn: '1 / 3', gridRow: '1', index: 0 },
        { gridArea: 'b', gridColumn: '1', gridRow: '2', index: 1 },
        { gridArea: 'c', gridColumn: '2', gridRow: '2', index: 2 }
      ];
    }
  }

  if (direction === DIRECTION_TYPES.FLIP) {
    itemPlacements = flipPlacements(itemPlacements);
  }

  return {
    gridTemplateColumns: columns,
    gridTemplateRows: rows,
    gridTemplateAreas: areas,
    itemPlacements
  };
}

/**
 * Generate 4 item grid (2x2)
 */
function generate4ItemGrid(emphasis, direction) {
  let columns = '1fr 1fr';
  let rows = '1fr 1fr';
  let areas = '"a b" "c d"';

  // Emphasis adjustments
  if (emphasis === EMPHASIS_TYPES.FIRST) {
    columns = '2fr 1fr';
    rows = '2fr 1fr';
  } else if (emphasis === EMPHASIS_TYPES.LAST) {
    columns = '1fr 2fr';
    rows = '1fr 2fr';
  }

  let itemPlacements = [
    { gridArea: 'a', gridColumn: '1', gridRow: '1', index: 0 },
    { gridArea: 'b', gridColumn: '2', gridRow: '1', index: 1 },
    { gridArea: 'c', gridColumn: '1', gridRow: '2', index: 2 },
    { gridArea: 'd', gridColumn: '2', gridRow: '2', index: 3 }
  ];

  if (direction === DIRECTION_TYPES.FLIP) {
    itemPlacements = flipPlacements(itemPlacements);
  }

  return {
    gridTemplateColumns: columns,
    gridTemplateRows: rows,
    gridTemplateAreas: areas,
    itemPlacements
  };
}

/**
 * Generate 5 item grid (3+2 or 2+3)
 */
function generate5ItemGrid(aspect, emphasis, direction) {
  const isLandscape = aspect === 'landscape' || aspect === 'square';
  let columns, rows, areas, itemPlacements;

  if (isLandscape) {
    // 3 on top, 2 on bottom
    columns = '1fr 1fr 1fr';
    rows = emphasis === EMPHASIS_TYPES.FIRST ? '2fr 1fr' :
           emphasis === EMPHASIS_TYPES.LAST ? '1fr 2fr' : '1fr 1fr';
    areas = '"a b c" "d d e"';

    // Adjust areas based on emphasis
    if (emphasis === EMPHASIS_TYPES.CENTER) {
      areas = '"a b c" "d e e"';
    }

    itemPlacements = [
      { gridArea: 'a', gridColumn: '1', gridRow: '1', index: 0 },
      { gridArea: 'b', gridColumn: '2', gridRow: '1', index: 1 },
      { gridArea: 'c', gridColumn: '3', gridRow: '1', index: 2 },
      { gridArea: 'd', gridColumn: '1 / 3', gridRow: '2', index: 3 },
      { gridArea: 'e', gridColumn: '3', gridRow: '2', index: 4 }
    ];

    if (emphasis === EMPHASIS_TYPES.CENTER) {
      itemPlacements[3] = { gridArea: 'd', gridColumn: '1', gridRow: '2', index: 3 };
      itemPlacements[4] = { gridArea: 'e', gridColumn: '2 / 4', gridRow: '2', index: 4 };
    }
  } else {
    // Portrait: 2 on top, 3 on bottom
    columns = '1fr 1fr';
    rows = '1fr 1fr 1fr';
    areas = '"a b" "c c" "d e"';

    if (emphasis === EMPHASIS_TYPES.FIRST) {
      rows = '2fr 1fr 1fr';
    } else if (emphasis === EMPHASIS_TYPES.LAST) {
      rows = '1fr 1fr 2fr';
    }

    itemPlacements = [
      { gridArea: 'a', gridColumn: '1', gridRow: '1', index: 0 },
      { gridArea: 'b', gridColumn: '2', gridRow: '1', index: 1 },
      { gridArea: 'c', gridColumn: '1 / 3', gridRow: '2', index: 2 },
      { gridArea: 'd', gridColumn: '1', gridRow: '3', index: 3 },
      { gridArea: 'e', gridColumn: '2', gridRow: '3', index: 4 }
    ];
  }

  if (direction === DIRECTION_TYPES.FLIP) {
    itemPlacements = flipPlacements(itemPlacements);
  }

  return {
    gridTemplateColumns: columns,
    gridTemplateRows: rows,
    gridTemplateAreas: areas,
    itemPlacements
  };
}

/**
 * Generate equal distribution grid (fallback)
 */
function generateEqualGrid(imageCount, aspect, direction) {
  const cols = aspect === 'portrait' ? 2 : 3;
  const rows = Math.ceil(imageCount / cols);

  const itemPlacements = [];
  for (let i = 0; i < imageCount; i++) {
    const col = (i % cols) + 1;
    const row = Math.floor(i / cols) + 1;
    itemPlacements.push({
      gridColumn: `${col}`,
      gridRow: `${row}`,
      index: i
    });
  }

  if (direction === DIRECTION_TYPES.FLIP) {
    return {
      gridTemplateColumns: Array(cols).fill('1fr').join(' '),
      gridTemplateRows: Array(rows).fill('1fr').join(' '),
      gridTemplateAreas: null,
      itemPlacements: flipPlacements(itemPlacements)
    };
  }

  return {
    gridTemplateColumns: Array(cols).fill('1fr').join(' '),
    gridTemplateRows: Array(rows).fill('1fr').join(' '),
    gridTemplateAreas: null,
    itemPlacements
  };
}

/**
 * Flip item placements (reverse order while keeping grid positions)
 */
function flipPlacements(placements) {
  const count = placements.length;
  return placements.map((placement, i) => ({
    ...placements[count - 1 - i],
    index: i
  }));
}

/**
 * Main function to generate grid template
 * @param {Object} options - Generation options
 * @param {string} options.cardSize - Card size (e.g., '3x2')
 * @param {number} options.imageCount - Number of images (1-5)
 * @param {string} options.layoutType - 'horizontal' | 'vertical' | 'grid'
 * @param {string} options.emphasis - 'equal' | 'first' | 'last' | 'center'
 * @param {string} options.direction - 'normal' | 'flip'
 * @returns {Object} Grid template configuration
 */
function generateGridTemplate(options) {
  const {
    cardSize = '2x2',
    imageCount = 1,
    layoutType = LAYOUT_TYPES.GRID,
    emphasis = EMPHASIS_TYPES.EQUAL,
    direction = DIRECTION_TYPES.NORMAL
  } = options;

  // Validate against constraints
  const maxImages = getMaxImages(cardSize);
  if (imageCount > maxImages) {
    return {
      isValid: false,
      error: `Maximum ${maxImages} images allowed for ${cardSize} card (requested ${imageCount})`,
      gridTemplateColumns: null,
      gridTemplateRows: null,
      gridTemplateAreas: null,
      itemPlacements: []
    };
  }

  if (imageCount < 1) {
    return {
      isValid: false,
      error: 'At least 1 image is required',
      gridTemplateColumns: null,
      gridTemplateRows: null,
      gridTemplateAreas: null,
      itemPlacements: []
    };
  }

  if (!isLayoutAllowed(cardSize, layoutType)) {
    const reason = getDisabledReason(cardSize, layoutType);
    return {
      isValid: false,
      error: `Layout "${layoutType}" is not allowed for ${cardSize} card: ${reason}`,
      gridTemplateColumns: null,
      gridTemplateRows: null,
      gridTemplateAreas: null,
      itemPlacements: []
    };
  }

  // Generate layout based on type
  let result;

  switch (layoutType) {
    case LAYOUT_TYPES.HORIZONTAL:
      result = generateHorizontalLayout(imageCount, emphasis, direction);
      break;

    case LAYOUT_TYPES.VERTICAL:
      result = generateVerticalLayout(imageCount, emphasis, direction);
      break;

    case LAYOUT_TYPES.GRID:
    default:
      result = generateGridLayout(imageCount, cardSize, emphasis, direction);
      break;
  }

  return {
    isValid: true,
    error: null,
    ...result,
    // Include metadata
    metadata: {
      cardSize,
      imageCount,
      layoutType,
      emphasis,
      direction,
      cardAspect: getCardAspect(cardSize)
    }
  };
}

/**
 * Generate CSS string from template result
 * @param {Object} template - Template result from generateGridTemplate
 * @returns {string} CSS string for the grid container
 */
function templateToCSS(template) {
  if (!template.isValid) {
    return `/* Error: ${template.error} */`;
  }

  let css = `display: grid;\n`;
  css += `grid-template-columns: ${template.gridTemplateColumns};\n`;
  css += `grid-template-rows: ${template.gridTemplateRows};`;

  if (template.gridTemplateAreas) {
    css += `\ngrid-template-areas: ${template.gridTemplateAreas};`;
  }

  return css;
}

/**
 * Generate inline style object from template result
 * @param {Object} template - Template result from generateGridTemplate
 * @returns {Object} Style object for React/Vue inline styles
 */
function templateToStyleObject(template) {
  if (!template.isValid) {
    return {};
  }

  const style = {
    display: 'grid',
    gridTemplateColumns: template.gridTemplateColumns,
    gridTemplateRows: template.gridTemplateRows
  };

  if (template.gridTemplateAreas) {
    style.gridTemplateAreas = template.gridTemplateAreas;
  }

  return style;
}

// Export for use in other modules (Node.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    EMPHASIS_TYPES,
    DIRECTION_TYPES,
    parseCardSize,
    getCardAspect,
    generateGridTemplate,
    templateToCSS,
    templateToStyleObject
  };
}
