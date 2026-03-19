/**
 * Validation Script for 007-scaled-data.js
 * Tests data integrity, completeness, and structure
 */

// Load the data file
const fs = require('fs');
const path = require('path');

console.log('🔍 SCALED DATA VALIDATION SUITE\n');
console.log('=' .repeat(80));

// Simulate window object for Node.js environment
global.window = {};

// Load the data file
const dataFilePath = path.join(__dirname, '007-scaled-data.js');
const dataFileContent = fs.readFileSync(dataFilePath, 'utf8');

// Execute the file to populate window object
eval(dataFileContent);

// Extract data from window object
const mockDatabase = window.mockDatabase;
const allPromotions = window.allPromotionsScaled || mockDatabase.promotions;
const storeHierarchy = window.storeHierarchyScaled;
const weeklyMetrics = window.weeklyMetricsScaled;
const DataUtils = window.DataUtilsScaled;

// Validation Results
const results = {
    dataIntegrity: {},
    structure: {},
    completeness: {},
    performance: {},
    errors: [],
    warnings: []
};

console.log('\n📊 TEST 1: DATA INTEGRITY CHECKS');
console.log('-'.repeat(80));

// Test 1.1: Total Promotions Count
const expectedPromotions = 8500; // 50 stores × 34 products × 5 weeks
const actualPromotions = allPromotions.length;
results.dataIntegrity.totalPromotions = {
    expected: expectedPromotions,
    actual: actualPromotions,
    pass: actualPromotions === expectedPromotions
};

console.log(`Total Promotions: ${actualPromotions} / ${expectedPromotions}`);
if (actualPromotions === expectedPromotions) {
    console.log('✅ PASS - Correct number of promotions');
} else {
    console.log(`❌ FAIL - Expected ${expectedPromotions}, got ${actualPromotions}`);
    results.errors.push(`Promotion count mismatch: ${actualPromotions} vs ${expectedPromotions}`);
}

// Test 1.2: Unique Store Count
const uniqueStores = new Set(allPromotions.map(p => p.store_id));
const expectedStores = 50;
const actualStores = uniqueStores.size;
results.dataIntegrity.uniqueStores = {
    expected: expectedStores,
    actual: actualStores,
    pass: actualStores === expectedStores,
    stores: Array.from(uniqueStores).sort()
};

console.log(`\nUnique Stores: ${actualStores} / ${expectedStores}`);
if (actualStores === expectedStores) {
    console.log('✅ PASS - Correct number of unique stores');
} else {
    console.log(`❌ FAIL - Expected ${expectedStores}, got ${actualStores}`);
    results.errors.push(`Store count mismatch: ${actualStores} vs ${expectedStores}`);
}

// Test 1.3: Week Range
const uniqueWeeks = new Set(allPromotions.map(p => p.week));
const expectedWeeks = [36, 37, 38, 39, 40];
const actualWeeks = Array.from(uniqueWeeks).sort((a, b) => a - b);
const weeksMatch = JSON.stringify(actualWeeks) === JSON.stringify(expectedWeeks);
results.dataIntegrity.weeks = {
    expected: expectedWeeks,
    actual: actualWeeks,
    pass: weeksMatch
};

console.log(`\nWeeks Present: [${actualWeeks.join(', ')}]`);
console.log(`Expected: [${expectedWeeks.join(', ')}]`);
if (weeksMatch) {
    console.log('✅ PASS - Correct week range (36-40)');
} else {
    console.log('❌ FAIL - Week range mismatch');
    results.errors.push(`Week range mismatch: [${actualWeeks.join(', ')}] vs [${expectedWeeks.join(', ')}]`);
}

// Test 1.4: Promotions per Week
console.log('\nPromotions per Week:');
const promotionsPerWeek = {};
expectedWeeks.forEach(week => {
    const count = allPromotions.filter(p => p.week === week).length;
    promotionsPerWeek[week] = count;
    const expected = 1700; // 50 stores × 34 products
    const pass = count === expected;
    results.dataIntegrity[`week_${week}`] = { expected, actual: count, pass };

    console.log(`  Week ${week}: ${count} / ${expected} ${pass ? '✅' : '❌'}`);
    if (!pass) {
        results.errors.push(`Week ${week} has ${count} promotions, expected ${expected}`);
    }
});

// Test 1.5: Products per Store per Week
console.log('\nProducts per Store (sample check):');
const sampleStores = ['STORE_001', 'STORE_025', 'STORE_050'];
const expectedProductsPerStore = 34;

sampleStores.forEach(storeId => {
    const productsWeek40 = allPromotions.filter(p => p.store_id === storeId && p.week === 40).length;
    const pass = productsWeek40 === expectedProductsPerStore;

    console.log(`  ${storeId} (Week 40): ${productsWeek40} / ${expectedProductsPerStore} ${pass ? '✅' : '❌'}`);

    if (!pass) {
        results.warnings.push(`${storeId} has ${productsWeek40} products in week 40, expected ${expectedProductsPerStore}`);
    }
});

console.log('\n📋 TEST 2: STRUCTURE & COMPLETENESS CHECKS');
console.log('-'.repeat(80));

// Test 2.1: Required Fields
const requiredFields = [
    'card_id', 'week', 'store_id', 'product_name', 'category',
    'deal_type', 'card_size', 'card_position', 'stage',
    'card_in_view', 'card_clicked', 'card_added_to_list',
    'media_type', 'media_freshness', 'composite_score'
];

console.log('Required Fields Check (first 10 promotions):');
const samplePromos = allPromotions.slice(0, 10);
let fieldCheckPass = true;

requiredFields.forEach(field => {
    const missingCount = samplePromos.filter(p => p[field] === undefined || p[field] === null).length;
    const pass = missingCount === 0;

    if (!pass) {
        console.log(`  ❌ ${field}: ${missingCount} missing`);
        results.errors.push(`Field "${field}" missing in ${missingCount} sample promotions`);
        fieldCheckPass = false;
    }
});

if (fieldCheckPass) {
    console.log('✅ PASS - All required fields present in sample');
}

// Test 2.2: Store Hierarchy Structure
console.log('\nStore Hierarchy Check:');
const hierarchyChecks = {
    totalStores: storeHierarchy.stores.length === 50,
    totalGroups: storeHierarchy.groups.length === 5,
    bannerPresent: !!storeHierarchy.banner
};

results.structure.storeHierarchy = hierarchyChecks;

console.log(`  Total Stores in Hierarchy: ${storeHierarchy.stores.length} / 50 ${hierarchyChecks.totalStores ? '✅' : '❌'}`);
console.log(`  Total Groups: ${storeHierarchy.groups.length} / 5 ${hierarchyChecks.totalGroups ? '✅' : '❌'}`);
console.log(`  Banner Name: "${storeHierarchy.banner}" ${hierarchyChecks.bannerPresent ? '✅' : '❌'}`);

// Test 2.3: Group Distribution
console.log('\nGroup Distribution:');
const groupCounts = {};
storeHierarchy.stores.forEach(store => {
    groupCounts[store.group_id] = (groupCounts[store.group_id] || 0) + 1;
});

let groupDistributionPass = true;
Object.entries(groupCounts).forEach(([groupId, count]) => {
    const expected = 10;
    const pass = count === expected;
    console.log(`  ${groupId}: ${count} stores / ${expected} ${pass ? '✅' : '❌'}`);

    if (!pass) {
        results.errors.push(`Group ${groupId} has ${count} stores, expected ${expected}`);
        groupDistributionPass = false;
    }
});

// Test 2.4: Weekly Metrics Structure
console.log('\nWeekly Metrics Check:');
const metricsChecks = {
    currentWeek: weeklyMetrics.current_week === 40,
    availableWeeks: weeklyMetrics.available_weeks.length === 5,
    byWeekKeys: Object.keys(weeklyMetrics.by_week).length === 5,
    byStoreKeys: Object.keys(weeklyMetrics.by_store).length === 50,
    byGroupKeys: Object.keys(weeklyMetrics.by_group).length === 5
};

results.structure.weeklyMetrics = metricsChecks;

console.log(`  Current Week: ${weeklyMetrics.current_week} / 40 ${metricsChecks.currentWeek ? '✅' : '❌'}`);
console.log(`  Available Weeks: ${weeklyMetrics.available_weeks.length} / 5 ${metricsChecks.availableWeeks ? '✅' : '❌'}`);
console.log(`  By Week Keys: ${Object.keys(weeklyMetrics.by_week).length} / 5 ${metricsChecks.byWeekKeys ? '✅' : '❌'}`);
console.log(`  By Store Keys: ${Object.keys(weeklyMetrics.by_store).length} / 50 ${metricsChecks.byStoreKeys ? '✅' : '❌'}`);
console.log(`  By Group Keys: ${Object.keys(weeklyMetrics.by_group).length} / 5 ${metricsChecks.byGroupKeys ? '✅' : '❌'}`);

console.log('\n📦 TEST 3: WINDOW EXPORTS CHECK');
console.log('-'.repeat(80));

// Test 3.1: All Required Exports
const requiredExports = [
    'mockDatabase',
    'allPromotionsScaled',
    'storeHierarchyScaled',
    'weeklyMetricsScaled',
    'DataUtilsScaled',
    'groupA_data',
    'groupB_data',
    'groupC_data',
    'groupD_data',
    'groupE_data',
    'allStoresScaled'
];

console.log('Window Exports:');
let exportsPass = true;
requiredExports.forEach(exp => {
    const exists = window[exp] !== undefined;
    console.log(`  ${exp}: ${exists ? '✅ Present' : '❌ Missing'}`);

    if (!exists) {
        results.errors.push(`Required export "${exp}" is missing from window object`);
        exportsPass = false;
    }
});

// Test 3.2: mockDatabase Interface
console.log('\nmockDatabase Interface:');
const dbInterfaceChecks = {
    promotions: Array.isArray(mockDatabase.promotions),
    storeHierarchy: !!mockDatabase.store_hierarchy,
    weeklyMetrics: !!mockDatabase.weeklyMetrics,
    getTopPromotions: typeof mockDatabase.getTopPromotions === 'function',
    getBottomPromotions: typeof mockDatabase.getBottomPromotions === 'function'
};

results.structure.mockDatabaseInterface = dbInterfaceChecks;

Object.entries(dbInterfaceChecks).forEach(([key, pass]) => {
    console.log(`  ${key}: ${pass ? '✅' : '❌'}`);
    if (!pass) {
        results.errors.push(`mockDatabase.${key} is missing or incorrect type`);
    }
});

console.log('\n⚡ TEST 4: PERFORMANCE METRICS');
console.log('-'.repeat(80));

// Test 4.1: File Size
const stats = fs.statSync(dataFilePath);
const fileSizeKB = stats.size / 1024;
const fileSizeMB = fileSizeKB / 1024;
const sizePass = fileSizeMB < 1;

results.performance.fileSize = {
    bytes: stats.size,
    kb: Math.round(fileSizeKB * 100) / 100,
    mb: Math.round(fileSizeMB * 1000) / 1000,
    pass: sizePass
};

console.log(`File Size: ${results.performance.fileSize.kb} KB (${results.performance.fileSize.mb} MB)`);
console.log(`Limit: 1 MB ${sizePass ? '✅ PASS' : '❌ FAIL'}`);

if (!sizePass) {
    results.errors.push(`File size ${fileSizeMB.toFixed(2)} MB exceeds 1 MB limit`);
}

// Test 4.2: Memory Estimate
const memoryEstimate = (JSON.stringify(allPromotions).length / 1024 / 1024);
const memoryPass = memoryEstimate < 10;

results.performance.estimatedMemory = {
    mb: Math.round(memoryEstimate * 100) / 100,
    pass: memoryPass
};

console.log(`Estimated Memory: ${results.performance.estimatedMemory.mb} MB ${memoryPass ? '✅' : '❌'}`);

console.log('\n🎯 TEST 5: DATA QUALITY CHECKS');
console.log('-'.repeat(80));

// Test 5.1: Unique Card IDs
const cardIds = new Set(allPromotions.map(p => p.card_id));
const uniqueCardIds = cardIds.size === allPromotions.length;

results.completeness.uniqueCardIds = {
    total: allPromotions.length,
    unique: cardIds.size,
    pass: uniqueCardIds
};

console.log(`Unique Card IDs: ${cardIds.size} / ${allPromotions.length} ${uniqueCardIds ? '✅ PASS' : '❌ FAIL'}`);

if (!uniqueCardIds) {
    results.errors.push(`Duplicate card_id values found: ${allPromotions.length - cardIds.size} duplicates`);
}

// Test 5.2: Composite Score Range
const compositeScores = allPromotions.map(p => p.composite_score);
const minScore = Math.min(...compositeScores);
const maxScore = Math.max(...compositeScores);
const scoresValid = minScore >= 0 && maxScore <= 10000;

results.completeness.compositeScores = {
    min: minScore,
    max: maxScore,
    pass: scoresValid
};

console.log(`Composite Score Range: ${minScore} - ${maxScore} ${scoresValid ? '✅ PASS' : '❌ FAIL'}`);

if (!scoresValid) {
    results.warnings.push(`Composite scores outside expected range: ${minScore} - ${maxScore}`);
}

// Test 5.3: Week Variance Check
console.log('\nWeek Variance (Average CTR by Week):');
expectedWeeks.forEach(week => {
    const weekPromos = allPromotions.filter(p => p.week === week);
    const avgCTR = weekPromos.reduce((sum, p) => sum + (p.card_clicked / p.card_in_view), 0) / weekPromos.length;
    console.log(`  Week ${week}: ${(avgCTR * 100).toFixed(2)}% CTR`);
});

console.log('\n' + '='.repeat(80));
console.log('📊 VALIDATION SUMMARY');
console.log('='.repeat(80));

// Calculate pass/fail counts
const allTests = [
    ...Object.values(results.dataIntegrity),
    ...Object.values(results.structure.storeHierarchy || {}),
    ...Object.values(results.structure.weeklyMetrics || {}),
    ...Object.values(results.structure.mockDatabaseInterface || {}),
    { pass: results.performance.fileSize.pass },
    { pass: results.performance.estimatedMemory.pass },
    { pass: results.completeness.uniqueCardIds.pass },
    { pass: results.completeness.compositeScores.pass }
];

const passCount = allTests.filter(t => t.pass).length;
const failCount = allTests.filter(t => !t.pass).length;
const totalTests = allTests.length;
const passRate = Math.round((passCount / totalTests) * 100);

console.log(`\nTotal Tests: ${totalTests}`);
console.log(`✅ Passed: ${passCount}`);
console.log(`❌ Failed: ${failCount}`);
console.log(`Pass Rate: ${passRate}%`);

console.log(`\n⚠️  Warnings: ${results.warnings.length}`);
console.log(`❌ Errors: ${results.errors.length}`);

if (results.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    results.errors.forEach((err, i) => {
        console.log(`  ${i + 1}. ${err}`);
    });
}

if (results.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    results.warnings.forEach((warn, i) => {
        console.log(`  ${i + 1}. ${warn}`);
    });
}

// Final verdict
console.log('\n' + '='.repeat(80));
if (results.errors.length === 0) {
    console.log('🎉 VALIDATION PASSED - Data is production-ready!');
    console.log('='.repeat(80));
    process.exit(0);
} else {
    console.log('❌ VALIDATION FAILED - Please review errors above');
    console.log('='.repeat(80));
    process.exit(1);
}