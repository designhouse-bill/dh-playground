/**
 * Test: Same promotion, different stores = different but similar metrics
 *
 * Run with: node test/test-consistency.js
 */

const { generatePromoMetrics, generateWeeklyCircular, generateAllPromotions, getGenerationStats } = require('../generators/promotion-generator');
const { sizeConfig } = require('../store-config');
const { getCatalogStats } = require('../product-catalog');

const DIVIDER = '='.repeat(70);
const SUBDIV = '-'.repeat(70);

console.log(DIVIDER);
console.log('MOCK DATA GENERATOR - CONSISTENCY TESTS');
console.log(DIVIDER);

// ============================================================
// TEST 1: Same Promotion Across Different Stores
// ============================================================
console.log('\n[TEST 1] Same Promotion Across Different Stores');
console.log(SUBDIV);

const testPromoId = 'promo-wk47-pantry-0';
const testWeek = 47;

const testStores = [
  { id: 'store-101', name: 'SF Market St', size: 'large' },
  { id: 'store-102', name: 'SF Mission', size: 'medium' },
  { id: 'store-201', name: 'LA Downtown', size: 'large' },
  { id: 'store-204', name: 'SD Gaslamp', size: 'medium' },
  { id: 'store-301', name: 'Sacramento', size: 'large' },
  { id: 'store-306', name: 'Tacoma', size: 'medium' },
  { id: 'store-303', name: 'Stockton', size: 'small' }
];

console.log(`\nPromotion: "${testPromoId}" | Week: ${testWeek}`);
console.log(SUBDIV);
console.log(
  'Store'.padEnd(20) +
  'Size'.padEnd(10) +
  'CIV'.padEnd(10) +
  'CC'.padEnd(10) +
  'ATL'
);
console.log(SUBDIV);

const results = [];
testStores.forEach(store => {
  const metrics = generatePromoMetrics(testPromoId, store.id, testWeek, store.size);
  results.push({ ...store, ...metrics });
  console.log(
    store.name.padEnd(20) +
    store.size.padEnd(10) +
    String(metrics.civ).padEnd(10) +
    String(metrics.cc).padEnd(10) +
    metrics.atl
  );
});

// Verify variance exists but is reasonable
const largeCIVs = results.filter(r => r.size === 'large').map(r => r.civ);
const mediumCIVs = results.filter(r => r.size === 'medium').map(r => r.civ);

console.log('\n[ANALYSIS]');
console.log(`  Large stores CIV range: ${Math.min(...largeCIVs)} - ${Math.max(...largeCIVs)}`);
console.log(`  Medium stores CIV range: ${Math.min(...mediumCIVs)} - ${Math.max(...mediumCIVs)}`);
console.log(`  Large stores have higher base metrics: ${Math.min(...largeCIVs) > Math.max(...mediumCIVs) * 0.8 ? '✓' : '~'}`);

// ============================================================
// TEST 2: Reproducibility (same inputs = same outputs)
// ============================================================
console.log('\n' + DIVIDER);
console.log('[TEST 2] Reproducibility (same inputs = same outputs)');
console.log(SUBDIV);

const run1 = generatePromoMetrics(testPromoId, 'store-101', testWeek, 'large');
const run2 = generatePromoMetrics(testPromoId, 'store-101', testWeek, 'large');
const run3 = generatePromoMetrics(testPromoId, 'store-101', testWeek, 'large');

console.log('\nSame promotion, same store, 3 consecutive runs:');
console.log(`  Run 1: CIV=${run1.civ}, CC=${run1.cc}, ATL=${run1.atl}`);
console.log(`  Run 2: CIV=${run2.civ}, CC=${run2.cc}, ATL=${run2.atl}`);
console.log(`  Run 3: CIV=${run3.civ}, CC=${run3.cc}, ATL=${run3.atl}`);

const consistent = run1.civ === run2.civ && run2.civ === run3.civ;
console.log(`\n  Consistent: ${consistent ? '✓ PASS' : '✗ FAIL'}`);

// ============================================================
// TEST 3: Different Week = Different Metrics
// ============================================================
console.log('\n' + DIVIDER);
console.log('[TEST 3] Different Week = Different Metrics');
console.log(SUBDIV);

console.log('\nSame promotion at SF Market St across 5 weeks:');
console.log(SUBDIV);

const weekMetrics = [];
[44, 45, 46, 47, 48].forEach(week => {
  const metrics = generatePromoMetrics(testPromoId, 'store-101', week, 'large');
  weekMetrics.push(metrics);
  console.log(`  Week ${week}: CIV=${String(metrics.civ).padEnd(6)} CC=${String(metrics.cc).padEnd(4)} ATL=${metrics.atl}`);
});

// Check that at least some weeks have different values
const uniqueCIVs = new Set(weekMetrics.map(m => m.civ)).size;
console.log(`\n  Unique CIV values across weeks: ${uniqueCIVs}/5`);
console.log(`  Weeks produce different data: ${uniqueCIVs > 1 ? '✓ PASS' : '✗ FAIL'}`);

// ============================================================
// TEST 4: Weekly Circular Generation
// ============================================================
console.log('\n' + DIVIDER);
console.log('[TEST 4] Weekly Circular Generation');
console.log(SUBDIV);

const circular = generateWeeklyCircular(47, 3);
console.log(`\nWeek 47 Circular (3 products per category):`);
console.log(`  Total promotions: ${circular.length}`);

// Show sample by category
const byCategory = {};
circular.forEach(p => {
  if (!byCategory[p.category]) byCategory[p.category] = [];
  byCategory[p.category].push(p);
});

Object.entries(byCategory).forEach(([cat, promos]) => {
  console.log(`\n  ${cat}:`);
  promos.forEach(p => {
    console.log(`    - ${p.title} (${p.dealType}) $${p.originalPrice} → $${p.salePrice}`);
  });
});

// ============================================================
// TEST 5: Full Generation Test (Small Sample)
// ============================================================
console.log('\n' + DIVIDER);
console.log('[TEST 5] Full Generation - Small Sample');
console.log(SUBDIV);

const allRecords = generateAllPromotions({ productsPerCategory: 3 });
const stats = getGenerationStats(allRecords);

console.log('\nGeneration Results:');
console.log(`  Total records: ${stats.totalRecords}`);
console.log(`  Unique promotions: ${stats.uniquePromotions}`);
console.log(`  Unique stores: ${stats.uniqueStores}`);
console.log(`  Unique weeks: ${stats.uniqueWeeks}`);
console.log(`  Avg records/store: ${stats.avgRecordsPerStore}`);
console.log(`  Avg records/week: ${stats.avgRecordsPerWeek}`);

// Verify same promotion has different metrics across stores
console.log('\n[CROSS-CHECK] Same promotion across multiple stores:');
const samplePromoId = allRecords[0].promotionId;
const samePromoRecords = allRecords.filter(r => r.promotionId === samplePromoId);
console.log(`  Promotion: ${samplePromoId}`);
console.log(`  Found in ${samePromoRecords.length} store×week combinations`);

if (samePromoRecords.length > 1) {
  const civValues = samePromoRecords.map(r => r.civ);
  const uniqueCIVCount = new Set(civValues).size;
  console.log(`  Unique CIV values: ${uniqueCIVCount}/${samePromoRecords.length}`);
  console.log(`  Different stores have different metrics: ${uniqueCIVCount > 1 ? '✓ PASS' : '✗ FAIL'}`);
}

// ============================================================
// SUMMARY
// ============================================================
console.log('\n' + DIVIDER);
console.log('CATALOG & CONFIG SUMMARY');
console.log(SUBDIV);

const catalogStats = getCatalogStats();
console.log(`\nProduct Catalog:`);
console.log(`  Total products: ${catalogStats.total}`);
Object.entries(catalogStats.byCategory).forEach(([cat, count]) => {
  console.log(`    ${cat}: ${count}`);
});

console.log(`\nStore Sizes (base metrics):`);
Object.entries(sizeConfig).forEach(([size, config]) => {
  console.log(`  ${size}: CIV=${config.baseCIV}, CC=${config.baseCC}, ATL=${config.baseATL} (${config.minPromos}-${config.maxPromos} promos)`);
});

console.log('\n' + DIVIDER);
console.log('ALL TESTS COMPLETE');
console.log(DIVIDER);
