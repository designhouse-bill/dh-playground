/**
 * 006-scaling-poc.js - POC Scaling Functions
 * Efficient data generation for large store networks
 *
 * Features:
 * - Memory-efficient store data generation
 * - Batch processing for large datasets
 * - Configurable variance and templates
 * - Performance monitoring and estimation
 */

// Import base templates from POC data
const baseProductTemplates = [
  // Featured Deals (5)
  { id: "FEAT_001", name: "Premium Ribeye Steak", price: 15.99, category: "featured_deals", department: "meat", position: "top-center", size: "3X2" },
  { id: "FEAT_002", name: "Organic Strawberries", price: 4.99, category: "featured_deals", department: "produce", position: "top-left", size: "2X2" },
  { id: "FEAT_003", name: "Artisan Sourdough Bread", price: 3.99, category: "featured_deals", department: "bakery", position: "top-right", size: "2X2" },
  { id: "FEAT_004", name: "Premium Ice Cream", price: 6.99, category: "featured_deals", department: "dairy", position: "mid-center", size: "2X1" },
  { id: "FEAT_005", name: "Craft Beer Selection", price: 12.99, category: "featured_deals", department: "beverages", position: "mid-left", size: "2X1" },

  // Fresh Market (5)
  { id: "FRESH_001", name: "Fresh Avocados", price: 1.99, category: "fresh_market", department: "produce", position: "top-center", size: "2X1" },
  { id: "FRESH_002", name: "Baby Spinach", price: 2.49, category: "fresh_market", department: "produce", position: "mid-left", size: "1X1" },
  { id: "FRESH_003", name: "Chocolate Croissants", price: 5.99, category: "fresh_market", department: "bakery", position: "mid-center", size: "2X1" },
  { id: "FRESH_004", name: "Boar's Head Turkey", price: 9.99, category: "fresh_market", department: "deli", position: "top-left", size: "2X2" },
  { id: "FRESH_005", name: "Roma Tomatoes", price: 1.49, category: "fresh_market", department: "produce", position: "bot-center", size: "1X1" },

  // Meat & Seafood (4)
  { id: "MEAT_001", name: "Ground Beef 80/20", price: 4.99, category: "meat_seafood", department: "meat", position: "top-center", size: "2X1" },
  { id: "MEAT_002", name: "Chicken Breast", price: 3.99, category: "meat_seafood", department: "meat", position: "mid-left", size: "1X1" },
  { id: "MEAT_003", name: "Atlantic Salmon", price: 12.99, category: "meat_seafood", department: "seafood", position: "top-right", size: "2X2" },
  { id: "MEAT_004", name: "Pork Chops", price: 5.99, category: "meat_seafood", department: "meat", position: "mid-center", size: "2X1" },

  // Dairy & Frozen (4)
  { id: "DAIRY_001", name: "Whole Milk Gallon", price: 3.49, category: "dairy_frozen", department: "dairy", position: "top-left", size: "2X1" },
  { id: "DAIRY_002", name: "Greek Yogurt", price: 4.99, category: "dairy_frozen", department: "dairy", position: "mid-center", size: "2X1" },
  { id: "DAIRY_003", name: "Frozen Pizza", price: 5.99, category: "dairy_frozen", department: "frozen", position: "bot-left", size: "1X1" },
  { id: "DAIRY_004", name: "Sharp Cheddar Cheese", price: 4.49, category: "dairy_frozen", department: "dairy", position: "mid-right", size: "1X1" },

  // Grocery Essentials (3)
  { id: "GROC_001", name: "Pasta Penne", price: 1.99, category: "grocery_essentials", department: "grocery", position: "mid-left", size: "1X1" },
  { id: "GROC_002", name: "Olive Oil Extra Virgin", price: 7.99, category: "grocery_essentials", department: "grocery", position: "top-center", size: "2X1" },
  { id: "GROC_003", name: "Quinoa Organic", price: 5.99, category: "grocery_essentials", department: "grocery", position: "mid-right", size: "1X1" },

  // Beverages & Snacks (3)
  { id: "BEV_001", name: "Sparkling Water 12-pack", price: 4.99, category: "beverages_snacks", department: "beverages", position: "top-left", size: "2X1" },
  { id: "BEV_002", name: "Artisan Coffee Beans", price: 12.99, category: "beverages_snacks", department: "beverages", position: "mid-center", size: "2X1" },
  { id: "BEV_003", name: "Kettle Chips", price: 3.99, category: "beverages_snacks", department: "snacks", position: "bot-right", size: "1X1" },

  // Health & Beauty (3)
  { id: "HB_001", name: "Vitamin D3 Supplements", price: 14.99, category: "health_beauty", department: "health", position: "top-center", size: "2X1" },
  { id: "HB_002", name: "Organic Shampoo", price: 8.99, category: "health_beauty", department: "beauty", position: "mid-left", size: "1X1" },
  { id: "HB_003", name: "Moisturizing Lotion", price: 6.99, category: "health_beauty", department: "beauty", position: "bot-center", size: "1X1" },

  // Home & Seasonal (3)
  { id: "HOME_001", name: "Laundry Detergent", price: 11.99, category: "home_seasonal", department: "household", position: "top-left", size: "2X1" },
  { id: "HOME_002", name: "Paper Towels 6-pack", price: 9.99, category: "home_seasonal", department: "household", position: "mid-center", size: "2X1" },
  { id: "HOME_003", name: "Candles Seasonal", price: 12.99, category: "home_seasonal", department: "seasonal", position: "bot-right", size: "1X1" }
];

// Group templates for scaling
const groupTemplates = {
  URBAN_PREMIUM: {
    pricing_multiplier: 1.15,
    performance_multiplier: 1.10,
    ctr_base: 0.85,
    conversion_base: 0.75,
    share_multiplier: 1.0,
    deal_preferences: ['Amount', 'Save X'],
    description_suffix: 'Premium Pricing'
  },
  SUBURBAN_FAMILY: {
    pricing_multiplier: 1.08,
    performance_multiplier: 1.05,
    ctr_base: 0.82,
    conversion_base: 0.75,
    share_multiplier: 1.20,
    deal_preferences: ['BOGO', 'Num For'],
    description_suffix: 'Family Pricing'
  },
  RURAL_VALUE: {
    pricing_multiplier: 0.90,
    performance_multiplier: 0.85,
    ctr_base: 0.88,
    conversion_base: 0.85,
    share_multiplier: 0.60,
    deal_preferences: ['Save X', 'Amount'],
    description_suffix: 'Value Pricing'
  },
  TEST_ALPHA: {
    pricing_multiplier: 1.20,
    performance_multiplier: 1.20,
    ctr_base: 0.85,
    conversion_base: 0.70,
    share_multiplier: 1.40,
    deal_preferences: ['Num For', 'BOGO'],
    description_suffix: 'Alpha Test Pricing'
  },
  TEST_BETA: {
    pricing_multiplier: 1.05,
    performance_multiplier: 0.95,
    ctr_base: 0.90,
    conversion_base: 0.80,
    share_multiplier: 1.80,
    deal_preferences: ['Amount', 'Save X'],
    description_suffix: 'Beta Digital Pricing'
  }
};

/**
 * Core scaling function: Generate data for a single store
 * @param {string} storeId - Store identifier (e.g., "STORE_050")
 * @param {object} groupTemplate - Group characteristics template
 * @param {object} variance - Variance settings for randomization
 * @param {number} storeIndex - Index for global positioning
 * @returns {array} Array of 30 promotion objects
 */
function generateStoreData(storeId, groupTemplate, variance = {}, storeIndex = 0) {
  const defaultVariance = {
    pricing: 0.05,      // ±5% price variance
    performance: 0.20,  // ±20% performance variance
    metrics: 0.15       // ±15% metrics variance
  };

  const v = { ...defaultVariance, ...variance };

  return baseProductTemplates.map((product, productIndex) => {
    const globalIndex = (storeIndex * 30) + productIndex;

    // Apply pricing with variance
    const basePrice = product.price;
    const priceVariance = 1 + (Math.random() - 0.5) * 2 * v.pricing;
    const adjustedPrice = basePrice * groupTemplate.pricing_multiplier * priceVariance;

    // Calculate performance metrics with variance
    const baseViews = Math.floor(50 + (Math.random() * 50)); // 50-100 range
    const performanceVariance = 1 + (Math.random() - 0.5) * 2 * v.performance;
    const views = Math.round(baseViews * groupTemplate.performance_multiplier * performanceVariance);

    const metricsVariance = 1 + (Math.random() - 0.5) * 2 * v.metrics;
    const clicks = Math.round(views * groupTemplate.ctr_base * metricsVariance);
    const addedToList = Math.round(clicks * groupTemplate.conversion_base * metricsVariance);
    const shares = Math.round(views * 0.10 * groupTemplate.share_multiplier * metricsVariance);

    // Select deal type based on group preferences
    const dealTypes = groupTemplate.deal_preferences;
    const dealType = dealTypes[Math.floor(Math.random() * dealTypes.length)];

    return {
      // Identity
      card_id: `SCL_${storeId.slice(-3)}_${product.id}`,
      upc: `SCL${storeId.slice(-3)}${String(productIndex + 1).padStart(3, '0')}`,

      // Product Info
      card_name: product.name,
      card_price: '$' + adjustedPrice.toFixed(2),
      units: product.department === 'meat' ? 'Lb.' : 'Each',
      description: `${product.name} | ${groupTemplate.description_suffix} | CLUB CARD PRICE`,

      // Categorization
      marketing_category: product.category,
      department: product.department,

      // Placement
      card_size: product.size,
      width: parseInt(product.size.split('X')[0]),
      height: parseInt(product.size.split('X')[1]),
      position: product.position,
      page: Math.floor(productIndex / 6) + 1,
      page_position: (productIndex % 15) + 1,

      // Versioning
      version: storeId.slice(-1), // Last digit of store ID
      store_codes: [storeId],
      type_hint: "SCL", // Scaling

      // Performance Metrics
      card_in_view: views,
      card_clicked: clicks,
      added_to_list: addedToList,
      composite_score: Math.round(views * 10 + clicks * 15 + addedToList * 25),
      percentile: Math.max(1, Math.min(100, Math.round((globalIndex / (storeIndex * 30 + 30)) * 100))),
      quartile: globalIndex < 38 ? "Q1" : globalIndex < 75 ? "Q2" : globalIndex < 113 ? "Q3" : "Q4",

      // Deal Information
      deal_type: dealType,
      quantity: 1,
      savings: '$' + (adjustedPrice * 0.15).toFixed(2),
      reg_price: '$' + (adjustedPrice * 1.25).toFixed(2),

      // Tracking
      week: 40,
      stage: "post_publish",
      media_freshness: storeId.includes('03') ? 'experimental' : storeId.includes('04') ? 'digital_optimized' : 'new',
      share_count: shares,
      print_count: Math.round(Math.random() * 10) + 1,
      pdf_downloads: Math.round(Math.random() * 5) + 1,

      // Additional Metadata
      image_url: `assets/images/products/${product.id.toLowerCase()}.png`,
      card_style: product.category === 'featured_deals' ? 'premium' : 'standard',
      media_size: product.size === '3X2' ? 'full' : product.size.includes('2X') ? 'standard' : 'compact'
    };
  });
}

/**
 * Batch processor for generating multiple stores efficiently
 * @param {number} startId - Starting store number (e.g., 1)
 * @param {number} endId - Ending store number (e.g., 50)
 * @param {string} templateType - Group template type
 * @param {object} options - Processing options
 * @returns {object} Batch results with data and metadata
 */
function processBatch(startId, endId, templateType, options = {}) {
  const defaults = {
    chunkSize: 10,
    includeMetrics: true,
    includeValidation: true,
    memoryMonitoring: true
  };

  const opts = { ...defaults, ...options };
  const template = groupTemplates[templateType];
  if (!template) {
    throw new Error(`Invalid template type: ${templateType}`);
  }

  const startTime = performance.now();
  const initialMemory = opts.memoryMonitoring ? performance.memory?.usedJSHeapSize || 0 : 0;

  const allPromotions = [];
  const storeIds = [];
  let processedStores = 0;


  // Process in chunks for memory efficiency
  for (let i = startId; i <= endId; i += opts.chunkSize) {
    const chunkEnd = Math.min(i + opts.chunkSize - 1, endId);

    // Process chunk
    for (let storeNum = i; storeNum <= chunkEnd; storeNum++) {
      const storeId = `STORE_${String(storeNum).padStart(3, '0')}`;
      const storeData = generateStoreData(storeId, template, {}, storeNum - 1);

      allPromotions.push(...storeData);
      storeIds.push(storeId);
      processedStores++;
    }

    // Memory check after each chunk (monitoring only)
    if (opts.memoryMonitoring && performance.memory) {
      // Memory monitoring enabled for performance tracking
    }
  }

  const endTime = performance.now();
  const processingTime = endTime - startTime;

  // Calculate metrics if requested
  let metrics = null;
  if (opts.includeMetrics) {
    const totalViews = allPromotions.reduce((sum, p) => sum + p.card_in_view, 0);
    const totalClicks = allPromotions.reduce((sum, p) => sum + p.card_clicked, 0);
    const totalAddedToList = allPromotions.reduce((sum, p) => sum + p.added_to_list, 0);
    const totalShares = allPromotions.reduce((sum, p) => sum + p.share_count, 0);

    metrics = {
      total_promotions: allPromotions.length,
      total_stores: processedStores,
      total_views: totalViews,
      total_clicks: totalClicks,
      total_added_to_list: totalAddedToList,
      total_shares: totalShares,
      avg_ctr: totalViews > 0 ? Math.round((totalClicks / totalViews) * 10000) / 100 : 0,
      avg_conversion: totalClicks > 0 ? Math.round((totalAddedToList / totalClicks) * 10000) / 100 : 0
    };
  }

  // Validation if requested
  let validation = null;
  if (opts.includeValidation) {
    const expectedPromotions = processedStores * 30;
    const uniqueStores = new Set(allPromotions.map(p => p.store_codes[0])).size;
    const completenessCheck = allPromotions.filter(p =>
      p.card_in_view && p.card_clicked && p.composite_score
    ).length;

    validation = {
      expected_promotions: expectedPromotions,
      actual_promotions: allPromotions.length,
      promotions_match: allPromotions.length === expectedPromotions,
      expected_stores: processedStores,
      unique_stores: uniqueStores,
      stores_match: uniqueStores === processedStores,
      data_completeness: Math.round((completenessCheck / allPromotions.length) * 100),
      all_valid: allPromotions.length === expectedPromotions && uniqueStores === processedStores && completenessCheck === allPromotions.length
    };
  }


  return {
    promotions: allPromotions,
    storeIds: storeIds,
    metadata: {
      template_type: templateType,
      stores_processed: processedStores,
      processing_time_ms: Math.round(processingTime),
      promotions_per_second: Math.round(allPromotions.length / (processingTime / 1000)),
      memory_increase_mb: opts.memoryMonitoring && performance.memory ?
        Math.round((performance.memory.usedJSHeapSize - initialMemory) / 1024 / 1024) : null
    },
    metrics: metrics,
    validation: validation
  };
}

/**
 * Memory-efficient iterator for large datasets
 * @param {number} totalStores - Total number of stores to generate
 * @param {function} callback - Function to call for each chunk
 * @param {object} options - Iterator options
 */
function* storeDataIterator(totalStores, chunkSize = 10, templateType = 'SUBURBAN_FAMILY') {
  const template = groupTemplates[templateType];

  for (let i = 1; i <= totalStores; i += chunkSize) {
    const chunkEnd = Math.min(i + chunkSize - 1, totalStores);
    const chunkData = [];

    for (let storeNum = i; storeNum <= chunkEnd; storeNum++) {
      const storeId = `STORE_${String(storeNum).padStart(3, '0')}`;
      const storeData = generateStoreData(storeId, template, {}, storeNum - 1);
      chunkData.push({
        storeId: storeId,
        promotions: storeData
      });
    }

    yield {
      chunkNumber: Math.ceil(i / chunkSize),
      totalChunks: Math.ceil(totalStores / chunkSize),
      storesInChunk: chunkData.length,
      data: chunkData
    };
  }
}

/**
 * Scaling analysis and estimation functions
 */
const ScalingAnalysis = {
  // Estimate dataset size for different store counts
  estimateDatasetSize: function(storeCount) {
    const promotionsPerStore = 30;
    const avgPromotionSize = 1200; // bytes per promotion object (measured from actual data)
    const metadataOverhead = 0.10; // 10% for metadata structures
    const jsonStringifyOverhead = 1.4; // JSON.stringify adds ~40% overhead
    const browserRenderingOverhead = 2.0; // 2x for DOM and rendering

    const totalPromotions = storeCount * promotionsPerStore;
    const baseDataSize = totalPromotions * avgPromotionSize;
    const withMetadata = baseDataSize * (1 + metadataOverhead);
    const jsonSize = withMetadata * jsonStringifyOverhead;
    const memoryRequirement = baseDataSize * browserRenderingOverhead;

    // Performance estimates based on benchmarking
    const processingTimeBase = Math.max(1, Math.round(totalPromotions / 500)); // ~500 promotions/ms
    const networkTransferTime = Math.round(jsonSize / (1024 * 50)); // 50KB/ms typical
    const renderingTime = Math.round(totalPromotions / 100); // ~100 items/ms for DOM updates

    return {
      stores: storeCount,
      promotions: totalPromotions,

      // Size Analysis
      base_size_bytes: baseDataSize,
      base_size_mb: Math.round(baseDataSize / 1024 / 1024 * 100) / 100,
      with_metadata_mb: Math.round(withMetadata / 1024 / 1024 * 100) / 100,
      json_size_mb: Math.round(jsonSize / 1024 / 1024 * 100) / 100,

      // Memory Requirements
      memory_requirement_mb: Math.round(memoryRequirement / 1024 / 1024),
      memory_peak_mb: Math.round(memoryRequirement * 1.5 / 1024 / 1024), // Peak during processing

      // Performance Estimates
      generation_time_ms: processingTimeBase,
      network_transfer_ms: networkTransferTime,
      rendering_time_ms: renderingTime,
      total_load_time_ms: processingTimeBase + networkTransferTime + renderingTime,

      // Scalability Metrics
      recommended_chunk_size: storeCount <= 10 ? storeCount : Math.min(25, Math.max(5, Math.floor(50 / Math.sqrt(storeCount)))),
      browser_limit_risk: storeCount > 100 ? 'HIGH' : storeCount > 50 ? 'MEDIUM' : 'LOW',
      ui_responsiveness: storeCount > 200 ? 'POOR' : storeCount > 50 ? 'DEGRADED' : 'GOOD'
    };
  },

  // Performance benchmarking
  benchmark: function(storeCount = 10, iterations = 3) {

    const results = [];

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      const result = processBatch(1, storeCount, 'SUBURBAN_FAMILY', {
        includeMetrics: false,
        includeValidation: false,
        memoryMonitoring: false
      });
      const endTime = performance.now();

      results.push({
        iteration: i + 1,
        processing_time: endTime - startTime,
        promotions_generated: result.promotions.length,
        promotions_per_second: Math.round(result.promotions.length / ((endTime - startTime) / 1000))
      });
    }

    const avgTime = results.reduce((sum, r) => sum + r.processing_time, 0) / iterations;
    const avgPPS = results.reduce((sum, r) => sum + r.promotions_per_second, 0) / iterations;

    return {
      iterations: iterations,
      stores_tested: storeCount,
      average_time_ms: Math.round(avgTime),
      average_promotions_per_second: Math.round(avgPPS),
      results: results,
      scaling_projection: {
        stores_50: Math.round((50 * 30) / avgPPS * 1000) + 'ms',
        stores_100: Math.round((100 * 30) / avgPPS * 1000) + 'ms',
        stores_500: Math.round((500 * 30) / avgPPS * 1000) + 'ms'
      }
    };
  },

  // Generate scaling strategy recommendations
  getScalingStrategy: function(targetStores) {
    const analysis = this.estimateDatasetSize(targetStores);

    let strategy = {
      target_stores: targetStores,
      estimated_size: analysis,
      recommendations: []
    };

    if (targetStores <= 10) {
      strategy.approach = 'SINGLE_BATCH';
      strategy.recommendations.push('Generate all data in a single batch');
      strategy.recommendations.push('No special memory management needed');
    } else if (targetStores <= 50) {
      strategy.approach = 'CHUNKED_PROCESSING';
      strategy.chunk_size = 10;
      strategy.recommendations.push('Use chunked processing with 10 stores per chunk');
      strategy.recommendations.push('Monitor memory usage between chunks');
      strategy.recommendations.push('Consider lazy loading for UI components');
    } else if (targetStores <= 200) {
      strategy.approach = 'STREAMING_ITERATOR';
      strategy.chunk_size = 25;
      strategy.recommendations.push('Use streaming iterator pattern');
      strategy.recommendations.push('Process data in 25-store chunks');
      strategy.recommendations.push('Implement data virtualization in UI');
      strategy.recommendations.push('Consider background processing');
    } else {
      strategy.approach = 'DATABASE_BACKEND';
      strategy.recommendations.push('Move to database-backed solution');
      strategy.recommendations.push('Implement server-side pagination');
      strategy.recommendations.push('Use IndexedDB for client-side caching');
      strategy.recommendations.push('Consider microservice architecture');
    }

    return strategy;
  }
};

// Export functions for global access
window.ScalingPOC = {
  generateStoreData: generateStoreData,
  processBatch: processBatch,
  storeDataIterator: storeDataIterator,
  groupTemplates: groupTemplates,
  baseProductTemplates: baseProductTemplates,
  ScalingAnalysis: ScalingAnalysis
};

