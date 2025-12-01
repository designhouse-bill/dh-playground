#!/usr/bin/env node
/**
 * Mock Data Generator - Main Entry Point
 *
 * Usage:
 *   node index.js --test                    # Run consistency tests
 *   node index.js --generate                # Generate with defaults
 *   node index.js --generate --products=4   # 4 products per category per week
 *
 * Options:
 *   --test          Run consistency tests
 *   --generate      Generate mock data
 *   --products=N    Products per category per week (default: 3)
 *   --output=FILE   Output filename (default: mock-data-generated.js)
 *   --format=json   Output as JSON instead of JS module
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const flags = {};
args.forEach(arg => {
  if (arg.startsWith('--')) {
    const [key, value] = arg.slice(2).split('=');
    flags[key] = value || true;
  }
});

const mode = flags.test ? 'test' : flags.generate ? 'generate' : 'help';

// ============================================================
// HELP MODE
// ============================================================
if (mode === 'help') {
  console.log(`
Mock Data Generator
===================

Usage:
  node index.js --test                    Run consistency tests
  node index.js --generate                Generate mock data with defaults
  node index.js --generate --products=4   Customize products per category

Options:
  --test          Run consistency tests to verify seeded randomness
  --generate      Generate full mock data set
  --products=N    Products per category per week (default: 3)
  --output=FILE   Output filename (default: mock-data-generated.js)
  --format=json   Output as JSON instead of JS module

Examples:
  node index.js --test
  node index.js --generate
  node index.js --generate --products=5 --output=large-dataset.js
`);
  process.exit(0);
}

// ============================================================
// TEST MODE
// ============================================================
if (mode === 'test') {
  console.log('Running consistency tests...\n');
  require('./test/test-consistency');
  process.exit(0);
}

// ============================================================
// GENERATE MODE
// ============================================================
if (mode === 'generate') {
  const { generateAllPromotions, getGenerationStats, aggregateByCategory } = require('./generators/promotion-generator');
  const { getConfigStats } = require('./store-config');
  const { getCatalogStats } = require('./product-catalog');

  const productsPerCategory = parseInt(flags.products) || 3;
  const outputFile = flags.output || 'mock-data-generated.js';
  const outputFormat = flags.format || 'js';

  console.log('='.repeat(60));
  console.log('GENERATING MOCK DATA');
  console.log('='.repeat(60));

  // Show configuration
  const configStats = getConfigStats();
  const catalogStats = getCatalogStats();

  console.log('\nConfiguration:');
  console.log(`  Brands: ${configStats.brands}`);
  console.log(`  SubBrands: ${configStats.subBrands}`);
  console.log(`  Stores: ${configStats.stores} (${configStats.storesBySize.large} large, ${configStats.storesBySize.medium} medium, ${configStats.storesBySize.small} small)`);
  console.log(`  Weeks: ${configStats.weeks}`);
  console.log(`  Products per category per week: ${productsPerCategory}`);
  console.log(`  Total products in catalog: ${catalogStats.total}`);

  // Generate data
  console.log('\nGenerating...');
  const startTime = Date.now();
  const records = generateAllPromotions({ productsPerCategory });
  const endTime = Date.now();

  const stats = getGenerationStats(records);

  console.log(`\nGeneration complete in ${endTime - startTime}ms`);
  console.log(`  Total records: ${stats.totalRecords}`);
  console.log(`  Unique promotions: ${stats.uniquePromotions}`);
  console.log(`  Avg records per store: ${stats.avgRecordsPerStore}`);
  console.log(`  Avg records per week: ${stats.avgRecordsPerWeek}`);

  // Prepare output
  const outputPath = path.join(__dirname, 'output', outputFile);

  let content;
  if (outputFormat === 'json') {
    content = JSON.stringify(records, null, 2);
  } else {
    // Generate as ES module compatible with the dashboard
    content = `/**
 * Auto-generated Mock Data
 * Generated: ${new Date().toISOString()}
 *
 * Stats:
 *   Total records: ${stats.totalRecords}
 *   Unique promotions: ${stats.uniquePromotions}
 *   Stores: ${stats.uniqueStores}
 *   Weeks: ${stats.uniqueWeeks}
 */

// Atomic promotion records (store × week × promotion)
export const promotionRecords = ${JSON.stringify(records, null, 2)};

// Quick lookup helpers
export const getRecordsByStore = (storeId) => promotionRecords.filter(r => r.storeId === storeId);
export const getRecordsByWeek = (weekNum) => promotionRecords.filter(r => r.weekNum === weekNum);
export const getRecordsByCategory = (category) => promotionRecords.filter(r => r.category === category);
export const getRecordsByPromotion = (promotionId) => promotionRecords.filter(r => r.promotionId === promotionId);

// Aggregation by category for a filtered set
export const aggregateByCategory = (records) => {
  const byCategory = {};
  records.forEach(record => {
    if (!byCategory[record.category]) {
      byCategory[record.category] = {
        category: record.category,
        promotionCount: 0,
        totalCIV: 0,
        totalCC: 0,
        totalATL: 0
      };
    }
    const cat = byCategory[record.category];
    cat.promotionCount++;
    cat.totalCIV += record.civ;
    cat.totalCC += record.cc;
    cat.totalATL += record.atl;
  });
  return Object.values(byCategory);
};

// Get unique values
export const getUniqueWeeks = () => [...new Set(promotionRecords.map(r => r.weekNum))].sort();
export const getUniqueStores = () => [...new Set(promotionRecords.map(r => r.storeId))];
export const getUniqueCategories = () => [...new Set(promotionRecords.map(r => r.category))];
`;
  }

  // Write output
  fs.writeFileSync(outputPath, content);
  console.log(`\nWritten to: ${outputPath}`);

  // Show sample records
  console.log('\n' + '='.repeat(60));
  console.log('SAMPLE RECORDS (first 3)');
  console.log('='.repeat(60));
  records.slice(0, 3).forEach((r, i) => {
    console.log(`\n[${i + 1}] ${r.title}`);
    console.log(`    Store: ${r.storeName} (${r.brandName})`);
    console.log(`    Week: ${r.weekLabel}`);
    console.log(`    Price: $${r.originalPrice} → $${r.salePrice} (${r.dealType})`);
    console.log(`    Metrics: CIV=${r.civ}, CC=${r.cc}, ATL=${r.atl}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('DONE');
  console.log('='.repeat(60));
}
