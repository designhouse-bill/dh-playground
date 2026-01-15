/**
 * clean-data.js
 * Phase 0-1: Data Quality Gating & Cleaning
 *
 * Processes raw promotion JSON and outputs cleaned, analysis-ready data
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Configuration
const INPUT_FILE = '/Users/billklingensmith/Desktop/ideal-circular-captures/output/week-2026-01-14_all-promotions_2026-01-14-21-32-21.json';
const OUTPUT_DIR = '/Users/billklingensmith/Desktop/ideal-circular-captures/template-analysis';

// Quality thresholds
const QUALITY_THRESHOLDS = {
  minConfidence: 40,
  minProductsForTemplate: 1,
  maxProductCount: 5,
  validTemplateTypes: ['product-only', 'lifestyle-only', 'product-on-lifestyle', 'product-on-solid'],
  validGridSizes: ['1x1', '1x2', '1x3', '2x1', '2x2', '2x3', '3x1', '3x2', '3x3']
};

// Background type mapping
const BACKGROUND_MAPPING = {
  'solid': { normalized: 'solid', group: 'simple' },
  'gradient': { normalized: 'gradient', group: 'simple' },
  'lifestyle-blurred': { normalized: 'lifestyle-blurred', group: 'lifestyle' },
  'lifestyle-sharp': { normalized: 'lifestyle-sharp', group: 'lifestyle' },
  'lifestyle': { normalized: 'lifestyle-sharp', group: 'lifestyle' },
  'image': { normalized: 'lifestyle-sharp', group: 'lifestyle' },
  'marble': { normalized: 'pattern', group: 'decorative' },
  'pattern': { normalized: 'pattern', group: 'decorative' },
  'transparent': { normalized: 'transparent', group: 'simple' },
};

// Rejection tracking
const rejections = {
  INVALID_GRIDSIZE: { count: 0, examples: [] },
  INVALID_TEMPLATE_TYPE: { count: 0, examples: [] },
  EMPTY_PRODUCTS: { count: 0, examples: [] },
  LOW_CONFIDENCE: { count: 0, examples: [] },
  PROCESSING_FAILURE: { count: 0, examples: [] },
  EXCEEDS_PRODUCT_LIMIT: { count: 0, examples: [] },
  STATIC_OR_HEADER: { count: 0, examples: [] },
  MISSING_REQUIRED_FIELDS: { count: 0, examples: [] }
};

// Helper: Generate unique ID
function generateUniqueId(promo, index) {
  const sanitize = (str) => (str || '').replace(/[^a-zA-Z0-9]/g, '-').substring(0, 50);

  if (promo.folder && promo.sourceFile) {
    return `${sanitize(promo.folder)}_${sanitize(promo.sourceFile)}_${index}`;
  }

  // Hash fallback
  const hash = crypto.createHash('md5')
    .update(`${JSON.stringify(promo.products || {})}_${promo.gridSize}_${index}`)
    .digest('hex')
    .slice(0, 8);
  return `unknown_${hash}_${index}`;
}

// Helper: Derive store name
function deriveStoreName(promo) {
  if (promo.storeName) return promo.storeName;
  if (promo.folder) return promo.folder.replace(/_\d+$/, '').trim();
  if (promo.sourceFile) return promo.sourceFile.split('_')[0];
  return '__UNKNOWN_STORE__';
}

// Helper: Parse grid size
function parseGridSize(gridSize) {
  if (!gridSize || typeof gridSize !== 'string') {
    return { valid: false, reason: 'MISSING_GRIDSIZE' };
  }
  const match = gridSize.match(/^(\d+)x(\d+)$/);
  if (!match) {
    return { valid: false, reason: 'INVALID_FORMAT', value: gridSize };
  }
  const cols = parseInt(match[1], 10);
  const rows = parseInt(match[2], 10);
  if (cols < 1 || cols > 3 || rows < 1 || rows > 3) {
    return { valid: false, reason: 'OUT_OF_RANGE', value: gridSize };
  }
  return { valid: true, gridColumns: cols, gridRows: rows };
}

// Helper: Normalize background type
function normalizeBackgroundType(bgType) {
  if (!bgType) return { normalized: 'unknown', group: 'other' };
  const mapping = BACKGROUND_MAPPING[bgType.toLowerCase()];
  return mapping || { normalized: 'unknown', group: 'other' };
}

// Helper: Count products
function countProducts(products) {
  if (!products || typeof products !== 'object') return 0;
  return Object.keys(products).length;
}

// Helper: Add rejection
function addRejection(reason, promoId) {
  if (rejections[reason]) {
    rejections[reason].count++;
    if (rejections[reason].examples.length < 5) {
      rejections[reason].examples.push(promoId);
    }
  }
}

// Main cleaning function
function cleanData(rawPromotions) {
  const cleaned = [];
  const seen = new Set();

  rawPromotions.forEach((promo, index) => {
    // Generate unique ID
    const uniqueId = generateUniqueId(promo, index);

    // Skip duplicates
    if (seen.has(uniqueId)) return;
    seen.add(uniqueId);

    // Check for static/header cards
    if (promo.templateType === 'static' || promo.templateType === 'category-header') {
      addRejection('STATIC_OR_HEADER', uniqueId);
      return;
    }

    // Parse grid size
    const gridParsed = parseGridSize(promo.gridSize);
    if (!gridParsed.valid) {
      addRejection('INVALID_GRIDSIZE', uniqueId);
      return;
    }

    // Validate template type
    if (!QUALITY_THRESHOLDS.validTemplateTypes.includes(promo.templateType)) {
      addRejection('INVALID_TEMPLATE_TYPE', uniqueId);
      return;
    }

    // Check products
    const productCount = countProducts(promo.products);
    if (productCount === 0) {
      addRejection('EMPTY_PRODUCTS', uniqueId);
      return;
    }

    if (productCount > QUALITY_THRESHOLDS.maxProductCount) {
      addRejection('EXCEEDS_PRODUCT_LIMIT', uniqueId);
      return;
    }

    // Check confidence (if available)
    if (promo.confidence !== undefined && promo.confidence < QUALITY_THRESHOLDS.minConfidence) {
      addRejection('LOW_CONFIDENCE', uniqueId);
      return;
    }

    // Normalize background
    const bgNormalized = normalizeBackgroundType(promo.backgroundType);

    // Derive store name
    const storeName = deriveStoreName(promo);

    // Build cleaned record
    const cleanedRecord = {
      id: uniqueId,
      originalId: promo.id,
      sourceFile: promo.sourceFile,
      folder: promo.folder,
      storeName: storeName,

      // Grid info
      gridSize: promo.gridSize,
      gridColumns: gridParsed.gridColumns,
      gridRows: gridParsed.gridRows,

      // Template info
      templateType: promo.templateType,
      productCount: productCount,

      // Background (metadata only)
      backgroundType: bgNormalized.normalized,
      backgroundGroup: bgNormalized.group,

      // Products with position data
      products: promo.products,

      // Confidence
      confidence: promo.confidence || 100,

      // Additional metadata
      title: promo.title,
      visibility: promo.visibility || 'complete'
    };

    cleaned.push(cleanedRecord);
  });

  return cleaned;
}

// Calculate shape profile for a promotion
function calculateShapeProfile(products) {
  const shapes = { tall: 0, square: 0, wide: 0, unknown: 0 };

  Object.values(products).forEach(product => {
    const shape = (product.shape || 'unknown').toLowerCase();
    if (shapes.hasOwnProperty(shape)) {
      shapes[shape]++;
    } else {
      shapes.unknown++;
    }
  });

  // Find dominant shape
  let dominant = 'mixed';
  let maxCount = 0;
  for (const [shape, count] of Object.entries(shapes)) {
    if (count > maxCount) {
      maxCount = count;
      dominant = shape;
    }
  }

  return {
    dominant,
    distribution: shapes
  };
}

// Aggregate data by gridSize + productCount
function aggregateData(cleanedData) {
  const groups = {};

  // Initialize all 45 slots
  QUALITY_THRESHOLDS.validGridSizes.forEach(gridSize => {
    for (let pc = 1; pc <= 5; pc++) {
      const key = `${gridSize}_${pc}`;
      groups[key] = {
        gridSize,
        productCount: pc,
        instances: [],
        shapeProfiles: { 'all-tall': 0, 'all-square': 0, 'all-wide': 0, 'mixed': 0 }
      };
    }
  });

  // Populate with data
  cleanedData.forEach(promo => {
    const key = `${promo.gridSize}_${promo.productCount}`;
    if (groups[key]) {
      groups[key].instances.push(promo);

      // Track shape profiles
      const shapeProfile = calculateShapeProfile(promo.products);
      promo.shapeProfile = shapeProfile;

      // Categorize shape pattern
      const totalProducts = promo.productCount;
      if (shapeProfile.distribution.tall === totalProducts) {
        groups[key].shapeProfiles['all-tall']++;
      } else if (shapeProfile.distribution.square === totalProducts) {
        groups[key].shapeProfiles['all-square']++;
      } else if (shapeProfile.distribution.wide === totalProducts) {
        groups[key].shapeProfiles['all-wide']++;
      } else {
        groups[key].shapeProfiles['mixed']++;
      }
    }
  });

  return groups;
}

// Generate quality report
function generateQualityReport(rawCount, cleanedData, groups) {
  const totalRejected = Object.values(rejections).reduce((sum, r) => sum + r.count, 0);

  // Count by source
  const storeNameSources = { fromFolder: 0, fromFile: 0, unknown: 0 };
  cleanedData.forEach(promo => {
    if (promo.storeName === '__UNKNOWN_STORE__') {
      storeNameSources.unknown++;
    } else if (promo.folder) {
      storeNameSources.fromFolder++;
    } else {
      storeNameSources.fromFile++;
    }
  });

  // Count groups with data
  let slotsWithData = 0;
  let slotsWithSufficientData = 0;
  Object.values(groups).forEach(group => {
    if (group.instances.length > 0) slotsWithData++;
    if (group.instances.length >= 10) slotsWithSufficientData++;
  });

  return {
    dataQuality: {
      inputRecords: rawCount,
      cleanedRecords: cleanedData.length,
      rejections: rejections,
      totalRejected,
      rejectionRate: ((totalRejected / rawCount) * 100).toFixed(1) + '%',
      eligibilityRate: ((cleanedData.length / rawCount) * 100).toFixed(1) + '%',
      storeNameSources
    },
    matrixCoverage: {
      totalSlots: 45,
      slotsWithData,
      slotsWithSufficientData,
      slotsNeedingFallback: 45 - slotsWithData
    }
  };
}

// Main execution
function main() {
  console.log('=== Template Data Cleaning ===\n');

  // Load data
  console.log('Loading source data...');
  const rawData = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
  console.log(`Loaded ${rawData.length} raw promotions\n`);

  // Clean data
  console.log('Cleaning data...');
  const cleanedData = cleanData(rawData);
  console.log(`Cleaned: ${cleanedData.length} eligible promotions\n`);

  // Aggregate
  console.log('Aggregating by gridSize + productCount...');
  const groups = aggregateData(cleanedData);

  // Generate quality report
  const qualityReport = generateQualityReport(rawData.length, cleanedData, groups);

  // Output summary
  console.log('\n=== Data Quality Summary ===');
  console.log(`Input records: ${qualityReport.dataQuality.inputRecords}`);
  console.log(`Cleaned records: ${qualityReport.dataQuality.cleanedRecords}`);
  console.log(`Rejection rate: ${qualityReport.dataQuality.rejectionRate}`);
  console.log(`\nMatrix coverage:`);
  console.log(`  Slots with data: ${qualityReport.matrixCoverage.slotsWithData}/45`);
  console.log(`  Slots with sufficient data (≥10): ${qualityReport.matrixCoverage.slotsWithSufficientData}/45`);
  console.log(`  Slots needing fallback: ${qualityReport.matrixCoverage.slotsNeedingFallback}/45`);

  // Show rejection breakdown
  console.log('\nRejection breakdown:');
  Object.entries(rejections).forEach(([reason, data]) => {
    if (data.count > 0) {
      console.log(`  ${reason}: ${data.count}`);
    }
  });

  // Show group distribution
  console.log('\n=== Group Distribution ===');
  const distribution = {};
  Object.entries(groups).forEach(([key, group]) => {
    const [gridSize, pc] = key.split('_');
    if (!distribution[gridSize]) distribution[gridSize] = {};
    distribution[gridSize][pc] = group.instances.length;
  });

  console.log('\n        1 prod  2 prod  3 prod  4 prod  5 prod');
  QUALITY_THRESHOLDS.validGridSizes.forEach(gridSize => {
    const row = [gridSize.padEnd(6)];
    for (let pc = 1; pc <= 5; pc++) {
      const count = distribution[gridSize][pc] || 0;
      row.push(String(count).padStart(6));
    }
    console.log(row.join('  '));
  });

  // Save outputs
  console.log('\n=== Saving Outputs ===');

  // Save cleaned data
  const cleanedPath = path.join(OUTPUT_DIR, 'cleaned-data.json');
  fs.writeFileSync(cleanedPath, JSON.stringify(cleanedData, null, 2));
  console.log(`Saved: ${cleanedPath}`);

  // Save aggregated groups
  const groupsPath = path.join(OUTPUT_DIR, 'aggregated-groups.json');
  const groupsSummary = {};
  Object.entries(groups).forEach(([key, group]) => {
    groupsSummary[key] = {
      gridSize: group.gridSize,
      productCount: group.productCount,
      instanceCount: group.instances.length,
      shapeProfiles: group.shapeProfiles
    };
  });
  fs.writeFileSync(groupsPath, JSON.stringify(groupsSummary, null, 2));
  console.log(`Saved: ${groupsPath}`);

  // Save rejection report
  const rejectionPath = path.join(OUTPUT_DIR, 'rejection-report.json');
  fs.writeFileSync(rejectionPath, JSON.stringify(qualityReport, null, 2));
  console.log(`Saved: ${rejectionPath}`);

  console.log('\n=== Data Cleaning Complete ===');

  return { cleanedData, groups, qualityReport };
}

// Export for use by other scripts
export { main, cleanData, aggregateData, QUALITY_THRESHOLDS };

// Run if called directly
const isMain = process.argv[1] && process.argv[1].includes('clean-data.js');
if (isMain) {
  main();
}
