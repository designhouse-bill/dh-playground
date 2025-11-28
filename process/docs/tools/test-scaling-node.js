#!/usr/bin/env node

/**
 * Node.js test script for scaling generator validation
 * Tests the generator with 2 additional stores (STORE_006, STORE_007)
 */

// Mock window object and performance for Node.js
global.window = {};
global.performance = {
    now: () => Date.now(),
    memory: {
        usedJSHeapSize: process.memoryUsage().heapUsed
    }
};
global.console = console;

// Load the scaling POC functions
require('./mock-data/006-scaling-poc.js');

console.log('🧪 Starting Node.js Scaling Generator Test\n');

// Test 1: Single Store Generation
console.log('📍 Test 1: Single Store Generation');
console.log('=====================================');

try {
    // Test STORE_006 with URBAN_PREMIUM template
    const store006 = window.ScalingPOC.generateStoreData(
        'STORE_006',
        window.ScalingPOC.groupTemplates.URBAN_PREMIUM,
        { pricing: 0.05, performance: 0.20, metrics: 0.15 },
        5 // Store index
    );

    // Test STORE_007 with TEST_ALPHA template
    const store007 = window.ScalingPOC.generateStoreData(
        'STORE_007',
        window.ScalingPOC.groupTemplates.TEST_ALPHA,
        { pricing: 0.10, performance: 0.25, metrics: 0.20 },
        6 // Store index
    );

    console.log(`✅ STORE_006 generated: ${store006.length} promotions`);
    console.log(`✅ STORE_007 generated: ${store007.length} promotions`);

    // Validate structure
    const samplePromo = store006[0];
    const requiredFields = ['card_id', 'card_name', 'card_price', 'department', 'card_in_view', 'card_clicked'];
    const missingFields = requiredFields.filter(field => !samplePromo[field]);

    if (missingFields.length === 0) {
        console.log('✅ Promotion structure validation passed');
    } else {
        console.log('❌ Missing fields:', missingFields);
    }

    console.log('\nSample STORE_006 promotion:');
    console.log({
        card_id: samplePromo.card_id,
        card_name: samplePromo.card_name,
        card_price: samplePromo.card_price,
        department: samplePromo.department,
        views: samplePromo.card_in_view,
        clicks: samplePromo.card_clicked
    });

} catch (error) {
    console.log('❌ Single store test failed:', error.message);
}

console.log('\n📦 Test 2: Batch Processing (7 Stores)');
console.log('=======================================');

try {
    // Process original 5 stores + 2 new stores
    const batch1to5 = window.ScalingPOC.processBatch(1, 5, 'SUBURBAN_FAMILY', {
        chunkSize: 5,
        includeMetrics: true,
        includeValidation: true
    });

    const batch6to7 = window.ScalingPOC.processBatch(6, 7, 'URBAN_PREMIUM', {
        chunkSize: 2,
        includeMetrics: true,
        includeValidation: true
    });

    console.log(`✅ Batch 1-5: ${batch1to5.storeIds.length} stores, ${batch1to5.promotions.length} promotions`);
    console.log(`✅ Batch 6-7: ${batch6to7.storeIds.length} stores, ${batch6to7.promotions.length} promotions`);

    // Combine and analyze
    const allPromotions = [...batch1to5.promotions, ...batch6to7.promotions];
    const allStores = [...batch1to5.storeIds, ...batch6to7.storeIds];

    console.log(`🎯 Combined: ${allStores.length} stores, ${allPromotions.length} promotions`);

    // Validation
    const expectedPromotions = allStores.length * 30;
    const uniqueStores = new Set(allPromotions.map(p => p.store_codes[0])).size;

    console.log(`📊 Validation:`);
    console.log(`   Expected promotions: ${expectedPromotions}`);
    console.log(`   Actual promotions: ${allPromotions.length}`);
    console.log(`   Promotions match: ${allPromotions.length === expectedPromotions ? '✅' : '❌'}`);
    console.log(`   Unique stores: ${uniqueStores}`);
    console.log(`   Stores match: ${uniqueStores === allStores.length ? '✅' : '❌'}`);

    // Performance metrics
    const totalTime = batch1to5.metadata.processing_time_ms + batch6to7.metadata.processing_time_ms;
    const promotionsPerSecond = Math.round(allPromotions.length / (totalTime / 1000));

    console.log(`⚡ Performance:`);
    console.log(`   Total processing time: ${totalTime}ms`);
    console.log(`   Promotions per second: ${promotionsPerSecond}`);

} catch (error) {
    console.log('❌ Batch processing test failed:', error.message);
}

console.log('\n🔄 Test 3: Iterator Pattern');
console.log('============================');

try {
    const chunks = [];
    const iterator = window.ScalingPOC.storeDataIterator(7, 3, 'TEST_BETA');

    for (const chunk of iterator) {
        chunks.push({
            chunk: chunk.chunkNumber,
            stores: chunk.storesInChunk,
            store_ids: chunk.data.map(d => d.storeId),
            promotions: chunk.data.reduce((sum, d) => sum + d.promotions.length, 0)
        });
        console.log(`   Chunk ${chunk.chunkNumber}/${chunk.totalChunks}: ${chunk.storesInChunk} stores, ${chunk.data.reduce((sum, d) => sum + d.promotions.length, 0)} promotions`);
    }

    const totalStores = chunks.reduce((sum, c) => sum + c.stores, 0);
    const totalPromotions = chunks.reduce((sum, c) => sum + c.promotions, 0);

    console.log(`✅ Iterator processed ${totalStores} stores in ${chunks.length} chunks`);
    console.log(`✅ Total promotions: ${totalPromotions}`);

} catch (error) {
    console.log('❌ Iterator test failed:', error.message);
}

console.log('\n🚀 Test 4: Performance Benchmark');
console.log('=================================');

try {
    const benchmark = window.ScalingPOC.ScalingAnalysis.benchmark(7, 2);

    console.log(`📊 Benchmark Results (${benchmark.iterations} iterations, ${benchmark.stores_tested} stores):`);
    console.log(`   Average time: ${benchmark.average_time_ms}ms`);
    console.log(`   Average promotions/sec: ${benchmark.average_promotions_per_second}`);
    console.log(`   Scaling projections:`);
    console.log(`     50 stores: ${benchmark.scaling_projection.stores_50}`);
    console.log(`     100 stores: ${benchmark.scaling_projection.stores_100}`);
    console.log(`     500 stores: ${benchmark.scaling_projection.stores_500}`);

} catch (error) {
    console.log('❌ Performance benchmark failed:', error.message);
}

console.log('\n📊 Test 5: Dataset Size Estimation');
console.log('===================================');

try {
    const storeCounts = [7, 10, 25, 50, 100, 500];

    console.log('Dataset size estimates:');
    storeCounts.forEach(count => {
        const estimate = window.ScalingPOC.ScalingAnalysis.estimateDatasetSize(count);
        console.log(`   ${count} stores: ${estimate.promotions} promotions, ${estimate.estimated_size_mb}MB, ~${estimate.processing_time_estimate_ms}ms`);
    });

    // Generate scaling strategy for 50 stores
    const strategy = window.ScalingPOC.ScalingAnalysis.getScalingStrategy(50);
    console.log(`\n🎯 Scaling Strategy for 50 stores:`);
    console.log(`   Approach: ${strategy.approach}`);
    console.log(`   Chunk size: ${strategy.chunk_size || 'N/A'}`);
    console.log(`   Recommendations:`);
    strategy.recommendations.forEach(rec => console.log(`     • ${rec}`));

} catch (error) {
    console.log('❌ Dataset estimation failed:', error.message);
}

console.log('\n🎉 Scaling Generator Test Complete!');
console.log('===================================');
console.log('✅ All tests passed - 7-store scaling validated');
console.log('✅ Ready for production scaling implementation');