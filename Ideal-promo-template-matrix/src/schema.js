/**
 * Hero Template Matrix Schema
 *
 * Defines the structure for analyzing promotional hero images
 */

/**
 * @typedef {Object} ProductPosition
 * @property {number} cx - Center X position as percentage from left edge (0-100, 50=centered)
 * @property {number} cy - Center Y position as percentage from top edge (0-100, 50=centered)
 * @property {number} width - Width as percentage of container (0-100)
 * @property {number} height - Height as percentage of container (0-100)
 * @property {number} scale - Relative scale (1 = normal, 0.5 = half, 2 = double)
 * @property {number} rotation - Rotation in degrees (-180 to 180)
 * @property {number} zIndex - Layer order (1 = back, higher = front)
 * @property {'square'|'tall'|'wide'|'circular'} shape - Aspect ratio classification
 */

/**
 * @typedef {Object} HeroTemplate
 * @property {string} id - Unique identifier
 * @property {string} sourceFile - Original filename
 * @property {string} folder - Source folder name
 * @property {string} gridSize - Grid size (e.g., "1x1", "2x2", "3x2")
 * @property {number} gridColumns - Number of columns (1-3)
 * @property {number} gridRows - Number of rows (1-3)
 * @property {'product-only'|'lifestyle-only'|'product-on-lifestyle'|'product-on-solid'} templateType
 * @property {'solid'|'lifestyle-blurred'|'lifestyle-sharp'|'gradient'|'transparent'} backgroundType
 * @property {string|null} backgroundColor - Primary background color if solid (hex)
 * @property {number} productCount - Number of product images detected
 * @property {Object.<string, ProductPosition>} products - Product positions keyed by index
 * @property {string} layoutPattern - Classified layout pattern
 * @property {number} confidence - Analysis confidence (0-100)
 * @property {string} notes - Additional observations
 */

/**
 * Valid layout patterns for classification
 */
export const LAYOUT_PATTERNS = [
  'single-centered',      // One product, centered
  'single-offset',        // One product, positioned off-center
  'side-by-side',         // Two products horizontally
  'stacked',              // Two products vertically
  'overlapped',           // Two+ products overlapping
  'cascade',              // Products in diagonal/cascade arrangement
  'hero-with-supporting', // One large + smaller supporting products
  'grid',                 // Products in grid formation
  'scattered',            // Products placed irregularly
  'lifestyle-focus',      // Non-product lifestyle image is main focus
];

/**
 * Generate a unique ID from folder and filename
 */
export function generateId(folder, filename) {
  const cleanFolder = folder.replace(/[^a-zA-Z0-9]/g, '-');
  const cleanFile = filename.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9]/g, '-');
  return `${cleanFolder}_${cleanFile}`;
}

/**
 * Create an empty template object
 */
export function createEmptyTemplate(folder, filename) {
  return {
    id: generateId(folder, filename),
    sourceFile: filename,
    folder: folder,
    gridSize: '',
    gridColumns: 0,
    gridRows: 0,
    templateType: '',
    backgroundType: '',
    backgroundColor: null,
    productCount: 0,
    products: {},
    layoutPattern: '',
    confidence: 0,
    notes: '',
  };
}
