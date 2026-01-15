import fs from 'fs';
import path from 'path';

/**
 * Get timestamp string for filenames
 */
function getTimestamp() {
  const now = new Date();
  return now.toISOString().slice(0, 19).replace(/[T:]/g, '-');
}

/**
 * Find the most recent all-promotions JSON file in a directory
 */
function findLatestPromotionsFile(outputDir) {
  if (!fs.existsSync(outputDir)) return null;

  const files = fs.readdirSync(outputDir)
    .filter(f => f.startsWith('all-promotions') && f.endsWith('.json'))
    .sort()
    .reverse();

  return files.length > 0 ? path.join(outputDir, files[0]) : null;
}

/**
 * Escape a value for CSV (handle commas, quotes, newlines)
 */
function escapeCSV(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generate summary CSV (one row per promotion)
 */
function generateSummaryCSV(promotions) {
  const headers = [
    'id',
    'folder',
    'sourceFile',
    'position',
    'gridSize',
    'gridColumns',
    'gridRows',
    'templateType',
    'backgroundType',
    'backgroundColor',
    'title',
    'pricePosition',
    'productCount',
    'layoutPattern',
    'confidence',
    'notes',
  ];

  const rows = promotions.map((p) =>
    [
      p.id,
      p.folder,
      p.sourceFile,
      p.position,
      p.gridSize,
      p.gridColumns,
      p.gridRows,
      p.templateType,
      p.backgroundType,
      p.backgroundColor || '',
      p.title || '',
      p.pricePosition || '',
      p.productCount,
      p.layoutPattern,
      p.confidence,
      p.notes,
    ].map(escapeCSV)
  );

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Generate detailed CSV (one row per product in each promotion)
 * Uses CENTER POINT positioning (cx, cy) to match media-layout-prototype
 */
function generateDetailedCSV(promotions) {
  const headers = [
    'promotion_id',
    'folder',
    'sourceFile',
    'gridSize',
    'templateType',
    'productCount',
    'layoutPattern',
    'productIndex',
    'cx',
    'cy',
    'width',
    'height',
    'scale',
    'rotation',
    'zIndex',
    'shape',
    'description',
  ];

  const rows = [];

  for (const p of promotions) {
    const products = p.products || {};
    const productKeys = Object.keys(products);

    if (productKeys.length === 0) {
      // No products - still include the row with empty product fields
      rows.push(
        [
          p.id,
          p.folder,
          p.sourceFile,
          p.gridSize,
          p.templateType,
          p.productCount,
          p.layoutPattern,
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
        ].map(escapeCSV)
      );
    } else {
      // One row per product
      for (const key of productKeys) {
        const prod = products[key];
        rows.push(
          [
            p.id,
            p.folder,
            p.sourceFile,
            p.gridSize,
            p.templateType,
            p.productCount,
            p.layoutPattern,
            key,
            prod.cx,
            prod.cy,
            prod.width,
            prod.height,
            prod.scale,
            prod.rotation,
            prod.zIndex,
            prod.shape,
            prod.description,
          ].map(escapeCSV)
        );
      }
    }
  }

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Generate summary statistics
 */
function generateStats(promotions) {
  const stats = {
    totalPromotions: promotions.length,
    uniqueScreenshots: new Set(promotions.map((p) => `${p.folder}/${p.sourceFile}`)).size,
    byGridSize: {},
    byTemplateType: {},
    byLayoutPattern: {},
    byProductCount: {},
    avgConfidence: 0,
    avgProductsPerPromotion: 0,
  };

  let totalConfidence = 0;
  let totalProducts = 0;

  for (const p of promotions) {
    // Grid size
    stats.byGridSize[p.gridSize] = (stats.byGridSize[p.gridSize] || 0) + 1;

    // Template type
    stats.byTemplateType[p.templateType] = (stats.byTemplateType[p.templateType] || 0) + 1;

    // Layout pattern
    stats.byLayoutPattern[p.layoutPattern] = (stats.byLayoutPattern[p.layoutPattern] || 0) + 1;

    // Product count
    const pCount = String(p.productCount);
    stats.byProductCount[pCount] = (stats.byProductCount[pCount] || 0) + 1;

    totalConfidence += p.confidence || 0;
    totalProducts += p.productCount || 0;
  }

  stats.avgConfidence = promotions.length > 0 ? (totalConfidence / promotions.length).toFixed(1) : 0;
  stats.avgProductsPerPromotion = promotions.length > 0 ? (totalProducts / promotions.length).toFixed(2) : 0;

  return stats;
}

/**
 * Main export function
 */
async function main() {
  const sourceDir = process.argv[2];

  if (!sourceDir) {
    console.log('Hero Template Matrix - CSV Export');
    console.log('');
    console.log('Usage: node src/export-csv.js <source-directory>');
    console.log('');
    console.log('Example:');
    console.log('  node src/export-csv.js ~/Desktop/ideal-circular-captures');
    process.exit(1);
  }

  // Resolve ~ in paths
  const resolvedDir = sourceDir.replace(/^~/, process.env.HOME);
  const outputDir = path.join(resolvedDir, '_template-matrix-output');

  // Find the latest promotions file
  const inputFile = findLatestPromotionsFile(outputDir);

  if (!inputFile) {
    console.error(`No promotions data found in: ${outputDir}`);
    console.log('Run the batch processor first: npm run batch ~/Desktop/ideal-circular-captures');
    process.exit(1);
  }

  console.log('Hero Template Matrix - CSV Export');
  console.log('='.repeat(50));
  console.log(`Input: ${path.basename(inputFile)}`);
  console.log(`Output: ${outputDir}`);

  // Load promotions
  const promotions = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
  console.log(`Loaded ${promotions.length} promotions`);

  // Generate timestamp for filenames
  const timestamp = getTimestamp();

  // Generate and save summary CSV
  const summaryCSV = generateSummaryCSV(promotions);
  const summaryFile = path.join(outputDir, `hero-template-matrix_${timestamp}.csv`);
  fs.writeFileSync(summaryFile, summaryCSV);
  console.log(`\nSummary CSV: ${path.basename(summaryFile)}`);

  // Generate and save detailed CSV
  const detailedCSV = generateDetailedCSV(promotions);
  const detailedFile = path.join(outputDir, `hero-template-products_${timestamp}.csv`);
  fs.writeFileSync(detailedFile, detailedCSV);
  console.log(`Products CSV: ${path.basename(detailedFile)}`);

  // Print statistics
  const stats = generateStats(promotions);
  console.log('\n' + '='.repeat(50));
  console.log('STATISTICS');
  console.log('='.repeat(50));
  console.log(`Total promotions: ${stats.totalPromotions}`);
  console.log(`Unique screenshots: ${stats.uniqueScreenshots}`);
  console.log(`Average confidence: ${stats.avgConfidence}%`);
  console.log(`Avg products/promo: ${stats.avgProductsPerPromotion}`);

  console.log('\nBy Grid Size:');
  for (const [size, count] of Object.entries(stats.byGridSize).sort()) {
    const pct = ((count / stats.totalPromotions) * 100).toFixed(1);
    console.log(`  ${size}: ${count} (${pct}%)`);
  }

  console.log('\nBy Template Type:');
  for (const [type, count] of Object.entries(stats.byTemplateType).sort()) {
    const pct = ((count / stats.totalPromotions) * 100).toFixed(1);
    console.log(`  ${type}: ${count} (${pct}%)`);
  }

  console.log('\nBy Product Count:');
  for (const [count, num] of Object.entries(stats.byProductCount).sort((a, b) => Number(a[0]) - Number(b[0]))) {
    const pct = ((num / stats.totalPromotions) * 100).toFixed(1);
    console.log(`  ${count} products: ${num} promotions (${pct}%)`);
  }

  console.log('\nBy Layout Pattern:');
  for (const [pattern, count] of Object.entries(stats.byLayoutPattern).sort((a, b) => b[1] - a[1])) {
    const pct = ((count / stats.totalPromotions) * 100).toFixed(1);
    console.log(`  ${pattern}: ${count} (${pct}%)`);
  }

  // Save stats as JSON
  const statsFile = path.join(outputDir, `stats_${timestamp}.json`);
  fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2));
  console.log('\nStats saved: ' + path.basename(statsFile));
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
