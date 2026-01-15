import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { generateId } from './schema.js';

const client = new Anthropic();

// Image compression config - adaptive based on content
const IMAGE_CONFIG = {
  maxWidth: 1200,           // Max width in pixels (sufficient for grid detection)
  maxHeight: 1600,          // Max height in pixels
  jpegQuality: 80,          // JPEG quality (0-100)
  pngCompressionLevel: 6,   // PNG compression (0-9)
  // Adaptive format: use PNG for text-heavy images to preserve clarity
  textDensityThreshold: 0.15, // If >15% high-contrast edges, likely text-heavy
};

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 2,
  // Escalating fixes for each retry
  escalation: [
    { quality: 90, maxWidth: 1400 },  // Higher quality on first retry
    { quality: 95, maxWidth: 1600 },  // Even higher on second retry
  ],
  // Validation thresholds that trigger retry
  warningThreshold: 3,  // Retry if more than 3 validation warnings
};

// Model selection - trade-off between cost and accuracy
// Haiku 3.5: $0.80/$4 per 1M tokens - weak vision
// Haiku 4: $1/$5 per 1M tokens - good vision, 3x cheaper than Sonnet
// Sonnet 4: $3/$15 per 1M tokens - excellent vision
const MODEL = 'claude-sonnet-4-20250514'; // Best accuracy for vision tasks

/**
 * FULL DATA Analysis prompt - rich JSON for template normalization
 * Includes all product positioning, sizing, and taxonomy data
 */
const ANALYSIS_PROMPT = `Analyze this grocery circular screenshot. Extract ALL promotional cards from the 3-column grid layout.

**GRID SIZES** (columns x rows based on 3-column grid):
- 1x1: Small card, 1/3 screen width
- 2x2: Hero card, 2/3 screen width, 2 rows tall
- 3x1: Full-width banner, 1 row (category headers)
- 3x2: Large hero, full width, 2 rows

**TEMPLATE TYPES**:
- product-only: PACKAGED CPG products (bottles, cans, boxes with brand labels)
- lifestyle-only: Fresh/unpackaged food (produce, raw meat, bakery items)
- product-on-lifestyle: Packaged products over lifestyle background
- product-on-solid: Packaged products on solid color background
- category-header: Section dividers (DELI, GROCERY, BAKERY) - set categoryName field
- static: Store announcements, events, membership info

**VISIBILITY** (check for "+" icon in top-right corner and gaps around card):
- complete: Has gap above AND below, "+" icon visible
- cropped-top: No gap above (cut off at screenshot top)
- cropped-bottom: No gap below (cut off at screenshot bottom)

**SKIP**: Navigation bars, footers, popups, store logos, rewards banners

**OUTPUT JSON**:
{"promotions":[
  {
    "position": 1,
    "visibility": "complete",
    "hasPlusIcon": true,
    "gridSize": "1x1",
    "templateType": "product-only",
    "categoryName": null,
    "backgroundType": "solid",
    "backgroundColor": "#FFFFFF",
    "title": "$2.99",
    "productCount": 1,
    "products": {
      "1": {
        "cx": 50, "cy": 45,
        "width": 80, "height": 60,
        "scale": 1, "rotation": 0, "zIndex": 1,
        "shape": "tall",
        "description": "Brand Product Name",
        "brand": "Brand",
        "productType": "category",
        "variant": "flavor/variety",
        "packaging": "bottle/can/box/bag",
        "size": "12oz"
      }
    }
  }
]}

**PRODUCT POSITION FIELDS** (all as % of card dimensions 0-100):
- cx, cy: Center point position
- width, height: Product image size
- scale: Relative size (1=normal)
- rotation: Degrees (-180 to 180, 0=upright)
- zIndex: Layer order (1=back, higher=front)
- shape: "square", "tall", "wide", or "circular"

Output ONLY valid JSON. Start with { end with }.`;

/**
 * Compute SHA256 hash of image file for caching
 * @param {string} imagePath - Full path to the image
 * @returns {string} Hex hash string
 */
function computeImageHash(imagePath) {
  const buffer = fs.readFileSync(imagePath);
  return crypto.createHash('sha256').update(buffer).digest('hex').substring(0, 16);
}

/**
 * Detect if image needs PNG (text-heavy with sharp edges)
 * Uses multiple heuristics to reduce false positives from textured photos
 * @param {sharp.Sharp} image - Sharp image instance
 * @param {Object} metadata - Image metadata
 * @returns {Promise<boolean>} True if PNG is recommended
 */
async function shouldUsePng(image, metadata) {
  try {
    // Heuristic 1: If already PNG and small, keep it
    if (metadata.format === 'png' && metadata.size && metadata.size < 500000) {
      return true;
    }

    // Heuristic 2: Screenshots typically have specific aspect ratios
    const aspectRatio = metadata.width / metadata.height;
    const isScreenshotAspect = aspectRatio > 0.4 && aspectRatio < 0.7; // Mobile portrait

    // Get a small sample for analysis
    const sampleBuffer = await image
      .clone()
      .resize(100, 100, { fit: 'cover' })
      .greyscale()
      .raw()
      .toBuffer();

    // Heuristic 3: Check for large flat color regions (UI elements)
    // Count unique intensity levels - text/UI has fewer unique values
    const histogram = new Map();
    for (let i = 0; i < sampleBuffer.length; i++) {
      const bucket = Math.floor(sampleBuffer[i] / 16); // 16 buckets
      histogram.set(bucket, (histogram.get(bucket) || 0) + 1);
    }

    // UI/text images tend to have concentrated histogram (fewer colors)
    const dominantBuckets = Array.from(histogram.values()).filter((v) => v > sampleBuffer.length * 0.05);
    const hasConcentratedColors = dominantBuckets.length <= 6;

    // Only use PNG if it looks like a screenshot with UI elements
    return isScreenshotAspect && hasConcentratedColors;
  } catch (e) {
    return false; // Default to JPEG on error
  }
}

/**
 * Compress image with adaptive format selection
 * Uses PNG for text-heavy images, JPEG otherwise
 * @param {string} imagePath - Full path to the image
 * @param {Object} options - Override options for retry escalation
 * @returns {Promise<{buffer: Buffer, format: string}>} Compressed image buffer and format
 */
async function compressImage(imagePath, options = {}) {
  const quality = options.quality || IMAGE_CONFIG.jpegQuality;
  const maxWidth = options.maxWidth || IMAGE_CONFIG.maxWidth;
  const maxHeight = options.maxHeight || IMAGE_CONFIG.maxHeight;

  try {
    const image = sharp(imagePath);
    const metadata = await image.metadata();

    // Detect if PNG is recommended (better heuristics to avoid false positives)
    const usesPng = await shouldUsePng(image, metadata);

    // Only resize if larger than max dimensions
    let pipeline = sharp(imagePath); // Fresh instance after clone usage
    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      pipeline = pipeline.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Use appropriate format based on content
    let buffer;
    let format;
    if (usesPng) {
      buffer = await pipeline
        .png({ compressionLevel: IMAGE_CONFIG.pngCompressionLevel })
        .toBuffer();
      format = 'image/png';
    } else {
      buffer = await pipeline
        .jpeg({ quality })
        .toBuffer();
      format = 'image/jpeg';
    }

    return { buffer, format };
  } catch (error) {
    // Fallback to original if compression fails
    console.warn(`  Warning: Image compression failed, using original: ${error.message}`);
    const ext = path.extname(imagePath).toLowerCase();
    const format = ext === '.png' ? 'image/png' : 'image/jpeg';
    return { buffer: fs.readFileSync(imagePath), format };
  }
}


/**
 * Normalize response data to standard format
 * Handles both full JSON object format and any legacy formats
 */
function normalizeResponse(data) {
  // Already in correct format with promotions array
  if (data && data.promotions && Array.isArray(data.promotions)) {
    return data;
  }

  // Handle legacy short-key format
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return expandShortKeys(data);
  }

  // Fallback for unexpected formats
  return { promotions: [] };
}

/**
 * Expand short keys to full keys (legacy format support)
 */
function expandShortKeys(obj) {
  const keyMap = {
    p: 'promotions',
    pos: 'position',
    vis: 'visibility',
    plus: 'hasPlusIcon',
    grid: 'gridSize',
    type: 'templateType',
    cat: 'categoryName',
    bg: 'backgroundType',
    bgc: 'backgroundColor',
    cnt: 'productCount',
    prod: 'products',
    desc: 'description',
  };

  if (Array.isArray(obj)) {
    return obj.map(expandShortKeys);
  }
  if (obj && typeof obj === 'object') {
    const expanded = {};
    for (const [key, value] of Object.entries(obj)) {
      const newKey = keyMap[key] || key;
      expanded[newKey] = expandShortKeys(value);
    }
    return expanded;
  }
  return obj;
}

/**
 * Attempt to repair and parse JSON from response text
 * @param {string} responseText - Raw response from Claude
 * @returns {Object|null} Parsed JSON or null if repair failed
 */
function parseJsonResponse(responseText) {
  let jsonStr = responseText.trim();

  // Try markdown code blocks first
  const codeBlockMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim();
  } else {
    // Try to find JSON object directly
    const jsonObjMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonObjMatch) {
      jsonStr = jsonObjMatch[0];
    }
  }

  try {
    const parsed = JSON.parse(jsonStr);
    return normalizeResponse(parsed);
  } catch (e) {
    // Try common JSON repairs
    try {
      // Fix trailing commas
      const repaired = jsonStr
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']');
      const parsed = JSON.parse(repaired);
      return normalizeResponse(parsed);
    } catch (e2) {
      return null;
    }
  }
}

/**
 * Validate analysis results for sanity
 * @param {Object} analysis - Parsed analysis object
 * @returns {Object} Analysis with validation flags
 */
function validateAnalysis(analysis) {
  const warnings = [];

  if (!analysis.promotions) {
    analysis.promotions = [];
    warnings.push('Missing promotions array, defaulting to empty');
  }

  for (const promo of analysis.promotions) {
    const actualProductCount = promo.products ? Object.keys(promo.products).length : 0;

    // For lifestyle-only cards, productCount can be 1 even with no products object
    // (the entire image IS the product). Don't overwrite in this case.
    const isLifestyle = promo.templateType === 'lifestyle-only';
    const isHeaderOrStatic = ['category-header', 'static'].includes(promo.templateType);

    if (isHeaderOrStatic) {
      // Headers and static cards should have 0 products
      if (promo.productCount !== 0 && actualProductCount === 0) {
        warnings.push(`${promo.templateType} should have productCount 0, was ${promo.productCount}`);
        promo.productCount = 0;
      }
    } else if (isLifestyle && actualProductCount === 0 && promo.productCount === 1) {
      // Lifestyle with count=1 and no products object is valid (whole image is the product)
      // Don't warn or change
    } else if (promo.productCount !== actualProductCount) {
      // Only warn (don't auto-fix) - let retry logic handle if severe
      warnings.push(`Product count mismatch: claimed ${promo.productCount}, found ${actualProductCount}`);
      // Only fix if clearly wrong (claimed products but none found)
      if (actualProductCount === 0 && promo.productCount > 1) {
        promo._productCountMismatch = true; // Flag for retry logic
      }
    }

    // Validate gridSize matches gridColumns/gridRows
    if (promo.gridColumns && promo.gridRows) {
      const expectedGridSize = `${promo.gridColumns}x${promo.gridRows}`;
      if (promo.gridSize !== expectedGridSize) {
        warnings.push(`Grid size mismatch: ${promo.gridSize} vs ${expectedGridSize}`);
        promo.gridSize = expectedGridSize;
      }
    }

    // Validate position values are in valid range (0-100)
    if (promo.products) {
      for (const [key, product] of Object.entries(promo.products)) {
        for (const field of ['cx', 'cy', 'width', 'height']) {
          if (product[field] !== undefined && (product[field] < 0 || product[field] > 100)) {
            warnings.push(`Product ${key} has out-of-range ${field}: ${product[field]}`);
            product[field] = Math.max(0, Math.min(100, product[field]));
          }
        }
      }
    }
  }

  if (warnings.length > 0) {
    analysis._validationWarnings = warnings;
  }

  return analysis;
}

/**
 * Core analysis logic - calls Claude API and parses response
 * @param {string} imagePath - Full path to the image
 * @param {Object} imageOptions - Options for image compression (for retry escalation)
 * @returns {Promise<Object>} Raw analysis result
 */
async function performAnalysis(imagePath, imageOptions = {}) {
  // Read and compress image with adaptive format
  const { buffer, format } = await compressImage(imagePath, imageOptions);
  const base64Image = buffer.toString('base64');

  // Call Claude Vision with temperature:0 for deterministic output
  // Use system prompt + prompt caching to reduce costs on repeated calls
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096, // Full output for rich template data
    temperature: 0, // Deterministic output for consistent JSON
    system: [
      {
        type: 'text',
        text: ANALYSIS_PROMPT,
        cache_control: { type: 'ephemeral' }, // Enable prompt caching
      },
    ],
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: format,
              data: base64Image,
            },
          },
          {
            type: 'text',
            text: 'Analyze this image and output the JSON.',
          },
        ],
      },
    ],
  });

  // Parse the JSON response with repair logic
  const responseText = response.content[0].text;
  const analysis = parseJsonResponse(responseText);

  // If parsing failed, throw to trigger retry
  if (!analysis) {
    const error = new Error(`Failed to parse JSON response: ${responseText.substring(0, 200)}...`);
    error.failureReason = 'parse_failure';
    throw error;
  }

  return analysis;
}

/**
 * Check if analysis should trigger a retry using weighted severity
 * @param {Object} analysis - Validated analysis result
 * @returns {string|null} Failure reason or null if OK
 */
function shouldRetry(analysis) {
  const warnings = analysis._validationWarnings || [];
  const promotions = analysis.promotions || [];

  // Weight warnings by severity
  let severityScore = 0;
  for (const warning of warnings) {
    if (warning.includes('out-of-range')) {
      severityScore += 2; // Position errors are serious
    } else if (warning.includes('Product count mismatch')) {
      severityScore += 3; // Product count issues are very serious
    } else if (warning.includes('Grid size mismatch')) {
      severityScore += 0.5; // Grid size is usually auto-fixed, low severity
    } else {
      severityScore += 1; // Default severity
    }
  }

  // Check for flagged product count mismatches
  const hasSeriousMismatch = promotions.some((p) => p._productCountMismatch);
  if (hasSeriousMismatch) {
    severityScore += 5;
  }

  // Trigger retry if severity is high
  if (severityScore >= 5) {
    return 'validation_severity';
  }

  // Check for product cards with issues
  const productCards = promotions.filter(
    (p) => !['category-header', 'static', 'lifestyle-only'].includes(p.templateType)
  );

  // Zero products on product-type cards (not lifestyle)
  const emptyProductCards = productCards.filter((p) => {
    const actualCount = p.products ? Object.keys(p.products).length : 0;
    return actualCount === 0;
  });
  if (productCards.length > 0 && emptyProductCards.length === productCards.length) {
    return 'zero_products';
  }

  // NOTE: Confidence check removed - model doesn't output confidence scores
  // Only retry on actual data issues (zero products, validation errors)

  return null;
}

/**
 * Analyze a single screenshot with retry ladder
 * @param {string} imagePath - Full path to the image
 * @param {string} folder - Folder name for context
 * @returns {Promise<Object>} Analysis result with array of promotions
 */
export async function analyzeImage(imagePath, folder = '') {
  const filename = path.basename(imagePath);
  const imageHash = computeImageHash(imagePath);
  let lastError = null;
  let failureReasons = [];

  // Try with escalating quality/resolution on failures
  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      const imageOptions = attempt > 0 ? RETRY_CONFIG.escalation[attempt - 1] : {};

      if (attempt > 0) {
        console.log(`  Retry ${attempt}/${RETRY_CONFIG.maxRetries} with higher quality...`);
      }

      const analysis = await performAnalysis(imagePath, imageOptions);

      // Validate and fix common issues
      const validated = validateAnalysis(analysis);
      if (validated._validationWarnings) {
        console.warn(`  Validation warnings: ${validated._validationWarnings.join('; ')}`);
      }

      // Check if we should retry with better settings
      const retryReason = shouldRetry(validated);
      if (retryReason && attempt < RETRY_CONFIG.maxRetries) {
        console.log(`  Triggering retry due to: ${retryReason}`);
        failureReasons.push(retryReason);
        continue;
      }

      // Process promotions: track categories and separate complete vs cropped
      const allPromotions = validated.promotions || [];
      const completePromotions = [];
      const croppedPromotions = [];
      const categoryHeaders = [];
      let currentCategory = null;

      // First pass: extract category headers and assign categories to promotions
      allPromotions.forEach((promo) => {
        // Track category headers
        if (promo.templateType === 'category-header') {
          currentCategory = promo.categoryName || promo.title || 'Unknown';
          categoryHeaders.push({
            name: currentCategory,
            position: promo.position,
            gridSize: promo.gridSize,
          });
          // Skip adding headers to promotions list (they're metadata)
          return;
        }

        // Apply current category to this promotion
        promo.category = currentCategory;

        // Separate by visibility
        if (promo.visibility === 'complete') {
          completePromotions.push(promo);
        } else {
          const cropType = promo.visibility || 'unknown';
          console.log(`  [${cropType}] ${promo.products?.['1']?.description || 'unknown card'}`);
          croppedPromotions.push(promo);
        }
      });

      // Enhance each promotion with source metadata
      const promotions = completePromotions.map((promo, index) => ({
        id: generateId(folder || 'root', `${filename}_promo${index + 1}`),
        sourceFile: filename,
        folder: folder || path.basename(path.dirname(imagePath)),
        imageHash,
        ...promo,
      }));

      // Also track cropped cards for cross-image stitching
      const cropped = croppedPromotions.map((promo) => ({
        sourceFile: filename,
        folder: folder || path.basename(path.dirname(imagePath)),
        ...promo,
      }));

      return {
        sourceFile: filename,
        folder: folder || path.basename(path.dirname(imagePath)),
        imageHash,
        promotions,
        categoryHeaders,
        croppedTop: cropped.filter((p) => p.visibility === 'cropped-top'),
        croppedBottom: cropped.filter((p) => p.visibility === 'cropped-bottom'),
        screenshotNotes: validated.screenshotNotes || '',
        totalPromotionsFound: promotions.length,
        totalCropped: cropped.length,
        retryAttempts: attempt,
      };
    } catch (error) {
      lastError = error;
      failureReasons.push(error.failureReason || 'api_error');

      if (attempt < RETRY_CONFIG.maxRetries) {
        console.warn(`  Attempt ${attempt + 1} failed: ${error.message}`);
      }
    }
  }

  // All retries exhausted
  console.error(`Error analyzing ${imagePath} after ${RETRY_CONFIG.maxRetries + 1} attempts:`, lastError?.message);
  return {
    sourceFile: filename,
    folder: folder || path.basename(path.dirname(imagePath)),
    imageHash,
    promotions: [],
    screenshotNotes: `Error: ${lastError?.message}`,
    totalPromotionsFound: 0,
    error: lastError?.message,
    failureReasons,
  };
}

// Export for use in batch processor caching
export { computeImageHash };

/**
 * CLI entry point - analyze a single image
 */
async function main() {
  const imagePath = process.argv[2];

  if (!imagePath) {
    console.log('Usage: node src/analyze-single.js <image-path>');
    console.log('Example: node src/analyze-single.js ~/Desktop/ideal-circular-captures/Store_2026-01-14/Store_001.png');
    process.exit(1);
  }

  if (!fs.existsSync(imagePath)) {
    console.error(`File not found: ${imagePath}`);
    process.exit(1);
  }

  console.log(`Analyzing: ${imagePath}`);
  console.log('Using model:', MODEL, '(cheapest vision model)');
  console.log('---');

  const result = await analyzeImage(imagePath);

  console.log(JSON.stringify(result, null, 2));

  // Save result
  const outputDir = path.join(
    path.dirname(new URL(import.meta.url).pathname.replace(/^\//, '')),
    '..',
    'output'
  );
  fs.mkdirSync(outputDir, { recursive: true });

  const outputFilename = path.basename(imagePath, path.extname(imagePath)) + '_analysis.json';
  const outputPath = path.join(outputDir, outputFilename);
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(`\nSaved to: ${outputPath}`);
  console.log(`Promotions found: ${result.totalPromotionsFound}`);
}

// Run if called directly
const scriptPath = new URL(import.meta.url).pathname;
if (process.argv[1] === scriptPath || process.argv[1].endsWith('analyze-single.js')) {
  main().catch(console.error);
}
