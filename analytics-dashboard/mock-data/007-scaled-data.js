/**
 * 007-scaled-data.js - Scaled POC Data (50 Stores, 5 Weeks)
 *
 * Scale: 50 stores across 5 groups, 5 weeks of historical data
 * Total: 7,500 promotions (50 stores × 30 products × 5 weeks)
 *
 * Components:
 * - Store hierarchy (50 stores, 5 groups)
 * - Multi-week data generation (weeks 36-40)
 * - Performance metrics and aggregations
 * - Context bar compatibility
 */

// ============================================================================
// STORE HIERARCHY - 50 STORES ACROSS 5 GROUPS
// ============================================================================

// Store name templates for generating unique names
const storeNameTemplates = {
  urban: [
    'Downtown', 'Midtown', 'Financial District', 'Arts Quarter', 'Harbor Front',
    'City Center', 'Metro Plaza', 'Union Square', 'Waterfront', 'Capitol Hill'
  ],
  suburban: [
    'Commons', 'Valley', 'Springs', 'Meadows', 'Gardens',
    'Crossing', 'Plaza', 'Junction', 'Village', 'Parkway'
  ],
  rural: [
    'Country Plaza', 'Valley Market', 'Farmland Center', 'Prairie Point', 'Countryside',
    'Harvest Square', 'Rustic Ridge', 'Green Acres', 'Open Range', 'Homestead'
  ],
  test_alpha: [
    'Innovation Hub', 'Tech Center', 'Digital Plaza', 'Smart Store', 'Future Market',
    'Alpha Lab', 'Beta Test', 'Pilot Store', 'Experimental', 'NextGen'
  ],
  test_beta: [
    'Beta Center', 'Test Market', 'Trial Store', 'Demo Hub', 'Preview Plaza',
    'Concept Store', 'Prototype', 'Development Center', 'Launch Pad', 'Incubator'
  ]
};

// City names for store locations
const cityNames = [
  'Manhattan', 'Boston', 'Chicago', 'Seattle', 'Austin',
  'Denver', 'Portland', 'Atlanta', 'Miami', 'Dallas',
  'Phoenix', 'San Diego', 'Minneapolis', 'Detroit', 'Philadelphia',
  'Charlotte', 'Nashville', 'Indianapolis', 'Columbus', 'Jacksonville',
  'Westfield', 'Arlington', 'Springfield', 'Franklin', 'Georgetown',
  'Madison', 'Riverside', 'Burlington', 'Newton', 'Bristol',
  'Oakdale', 'Plainview', 'Greenville', 'Fairview', 'Hillside',
  'Lakewood', 'Brookside', 'Maplewood', 'Riverside', 'Ashland',
  'Cedar Falls', 'Pine Ridge', 'Willow Creek', 'Meadow Brook', 'Oak Valley',
  'Stone Bridge', 'River Bend', 'Forest Glen', 'Crystal Lake', 'Summit Point'
];

// Group definitions with updated store counts
const storeHierarchyScaled = {
  banner: "FreshMart",
  groups: [
    {
      group_id: "GROUP_A",
      group_name: "Urban Premium",
      description: "High-end urban locations with premium focus",
      store_count: 10,
      performance_index: 1.15
    },
    {
      group_id: "GROUP_B",
      group_name: "Suburban Family",
      description: "Family-oriented suburban stores",
      store_count: 10,
      performance_index: 1.05
    },
    {
      group_id: "GROUP_C",
      group_name: "Rural Value",
      description: "Value-focused rural locations",
      store_count: 10,
      performance_index: 0.85
    },
    {
      group_id: "GROUP_D",
      group_name: "Test Alpha",
      description: "Alpha test group for new features",
      store_count: 10,
      performance_index: 1.20
    },
    {
      group_id: "GROUP_E",
      group_name: "Test Beta",
      description: "Beta test group for experimental features",
      store_count: 10,
      performance_index: 0.95
    }
  ],
  stores: []
};

// Generate 50 stores (10 per group)
function generateStoreHierarchy() {
  const stores = [];

  // GROUP_A: Urban Premium (STORE_001 to STORE_010)
  for (let i = 1; i <= 10; i++) {
    const storeNum = i;
    stores.push({
      store_id: `STORE_${String(storeNum).padStart(3, '0')}`,
      store_name: `FreshMart ${storeNameTemplates.urban[i-1]} ${cityNames[i-1]}`,
      group_id: "GROUP_A",
      group_name: "Urban Premium",
      performance_index: 1.15,
      location_type: "urban"
    });
  }

  // GROUP_B: Suburban Family (STORE_011 to STORE_020)
  for (let i = 1; i <= 10; i++) {
    const storeNum = 10 + i;
    stores.push({
      store_id: `STORE_${String(storeNum).padStart(3, '0')}`,
      store_name: `FreshMart ${storeNameTemplates.suburban[i-1]} ${cityNames[10 + i-1]}`,
      group_id: "GROUP_B",
      group_name: "Suburban Family",
      performance_index: 1.05,
      location_type: "suburban"
    });
  }

  // GROUP_C: Rural Value (STORE_021 to STORE_030)
  for (let i = 1; i <= 10; i++) {
    const storeNum = 20 + i;
    stores.push({
      store_id: `STORE_${String(storeNum).padStart(3, '0')}`,
      store_name: `FreshMart ${storeNameTemplates.rural[i-1]} ${cityNames[20 + i-1]}`,
      group_id: "GROUP_C",
      group_name: "Rural Value",
      performance_index: 0.85,
      location_type: "rural"
    });
  }

  // GROUP_D: Test Alpha (STORE_031 to STORE_040)
  for (let i = 1; i <= 10; i++) {
    const storeNum = 30 + i;
    stores.push({
      store_id: `STORE_${String(storeNum).padStart(3, '0')}`,
      store_name: `FreshMart ${storeNameTemplates.test_alpha[i-1]} ${cityNames[30 + i-1]}`,
      group_id: "GROUP_D",
      group_name: "Test Alpha",
      performance_index: 1.20,
      location_type: "test"
    });
  }

  // GROUP_E: Test Beta (STORE_041 to STORE_050)
  for (let i = 1; i <= 10; i++) {
    const storeNum = 40 + i;
    stores.push({
      store_id: `STORE_${String(storeNum).padStart(3, '0')}`,
      store_name: `FreshMart ${storeNameTemplates.test_beta[i-1]} ${cityNames[40 + i-1]}`,
      group_id: "GROUP_E",
      group_name: "Test Beta",
      performance_index: 0.95,
      location_type: "test"
    });
  }

  return stores;
}

// Generate and assign stores to hierarchy
storeHierarchyScaled.stores = generateStoreHierarchy();

// Validation
storeHierarchyScaled.groups.forEach(group => {
  const storeCount = storeHierarchyScaled.stores.filter(s => s.group_id === group.group_id).length;
});

// Export for use in data generation
if (typeof window !== 'undefined') {
  window.storeHierarchyScaled = storeHierarchyScaled;
}

// ============================================================================
// MULTI-WEEK SUPPORT FUNCTIONS
// ============================================================================

// Week variance multipliers (performance adjustment per week)
const weekVarianceConfig = {
  40: { performance: 1.00, label: 'Current Week (Baseline)' },      // 100% - baseline
  39: { performance: 0.95, label: 'Last Week' },                     // 95% - slight decline
  38: { performance: 0.92, label: '2 Weeks Ago' },                   // 92% - continued decline
  37: { performance: 0.97, label: '3 Weeks Ago (Rebound)' },        // 97% - rebound week
  36: { performance: 0.90, label: '4 Weeks Ago' }                    // 90% - oldest, lowest
};

/**
 * Calculate week variance multiplier
 * @param {number} weekNumber - Week number (36-40)
 * @returns {number} Performance multiplier for the week
 */
function getWeekVarianceMultiplier(weekNumber) {
  if (!weekVarianceConfig[weekNumber]) {
    return 1.0;
  }
  return weekVarianceConfig[weekNumber].performance;
}

/**
 * Get stage based on week age
 * @param {number} weekNumber - Week number (36-40)
 * @param {number} currentWeek - Current week (default: 40)
 * @returns {string} Stage value
 */
function getStageForWeek(weekNumber, currentWeek = 40) {
  const weeksOld = currentWeek - weekNumber;

  if (weeksOld === 0) return 'post_publish';
  if (weeksOld === 1) return 'active';
  if (weeksOld >= 2) return 'archived';

  return 'post_publish';
}

/**
 * Get media freshness based on week age and store type
 * @param {number} weekNumber - Week number (36-40)
 * @param {string} storeId - Store identifier
 * @param {number} currentWeek - Current week (default: 40)
 * @returns {string} Media freshness value
 */
function getMediaFreshnessForWeek(weekNumber, storeId, currentWeek = 40) {
  const weeksOld = currentWeek - weekNumber;

  // Special handling for test stores
  if (storeId.includes('031') || storeId.includes('032') || storeId.includes('033')) {
    return 'experimental';
  }
  if (storeId.includes('041') || storeId.includes('042') || storeId.includes('043')) {
    return 'digital_optimized';
  }

  // Based on age
  if (weeksOld === 0) return 'new';
  if (weeksOld === 1) return 'recent';
  if (weeksOld >= 2) return 'archived';

  return 'new';
}

/**
 * Apply temporal adjustments to metrics based on week
 * @param {object} baseMetrics - Base metrics object {views, clicks, addedToList, shares}
 * @param {number} weekNumber - Week number (36-40)
 * @returns {object} Adjusted metrics
 */
function applyTemporalAdjustment(baseMetrics, weekNumber) {
  const multiplier = getWeekVarianceMultiplier(weekNumber);

  return {
    views: Math.round(baseMetrics.views * multiplier),
    clicks: Math.round(baseMetrics.clicks * multiplier),
    addedToList: Math.round(baseMetrics.addedToList * multiplier),
    shares: Math.round(baseMetrics.shares * multiplier)
  };
}

Object.entries(weekVarianceConfig).forEach(([week, config]) => {
});

// ============================================================================
// PRODUCT TEMPLATES AND GROUP CONFIGURATIONS
// ============================================================================

// Base product templates (30 products)
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

  // Grocery Essentials (4)
  { id: "GROC_001", name: "Pasta Penne", price: 1.99, category: "grocery_essentials", department: "grocery", position: "mid-left", size: "1X1" },
  { id: "GROC_002", name: "Olive Oil Extra Virgin", price: 7.99, category: "grocery_essentials", department: "grocery", position: "top-center", size: "2X1" },
  { id: "GROC_003", name: "Quinoa Organic", price: 5.99, category: "grocery_essentials", department: "grocery", position: "mid-right", size: "1X1" },
  { id: "GROC_004", name: "Sea Salt", price: 2.49, category: "grocery_essentials", department: "grocery", position: "bot-center", size: "1X1" },

  // Beverages & Snacks (4)
  { id: "BEV_001", name: "Sparkling Water 12-pack", price: 4.99, category: "beverages_snacks", department: "beverages", position: "top-left", size: "2X1" },
  { id: "BEV_002", name: "Artisan Coffee Beans", price: 12.99, category: "beverages_snacks", department: "beverages", position: "mid-center", size: "2X1" },
  { id: "BEV_003", name: "Kettle Chips", price: 3.99, category: "beverages_snacks", department: "snacks", position: "bot-right", size: "1X1" },
  { id: "BEV_004", name: "Energy Drinks 4-pack", price: 7.99, category: "beverages_snacks", department: "beverages", position: "mid-right", size: "1X1" },

  // Health & Beauty (4)
  { id: "HB_001", name: "Vitamin D3 Supplements", price: 14.99, category: "health_beauty", department: "health", position: "top-center", size: "2X1" },
  { id: "HB_002", name: "Organic Shampoo", price: 8.99, category: "health_beauty", department: "beauty", position: "mid-left", size: "1X1" },
  { id: "HB_003", name: "Moisturizing Lotion", price: 6.99, category: "health_beauty", department: "beauty", position: "bot-center", size: "1X1" },
  { id: "HB_004", name: "Toothpaste Natural", price: 4.99, category: "health_beauty", department: "health", position: "mid-right", size: "1X1" },

  // Home & Seasonal (4)
  { id: "HOME_001", name: "Laundry Detergent", price: 11.99, category: "home_seasonal", department: "household", position: "top-left", size: "2X1" },
  { id: "HOME_002", name: "Paper Towels 6-pack", price: 9.99, category: "home_seasonal", department: "household", position: "mid-center", size: "2X1" },
  { id: "HOME_003", name: "Candles Seasonal", price: 12.99, category: "home_seasonal", department: "seasonal", position: "bot-right", size: "1X1" },
  { id: "HOME_004", name: "Dish Soap", price: 3.99, category: "home_seasonal", department: "household", position: "mid-left", size: "1X1" }
];

// Group templates for different store types
const groupTemplates = {
  GROUP_A: {
    pricing_multiplier: 1.15,
    performance_multiplier: 1.15,
    ctr_base: 0.85,
    conversion_base: 0.75,
    share_multiplier: 1.0,
    deal_preferences: ['Amount', 'Save X'],
    description_suffix: 'Premium Pricing'
  },
  GROUP_B: {
    pricing_multiplier: 1.05,
    performance_multiplier: 1.05,
    ctr_base: 0.82,
    conversion_base: 0.75,
    share_multiplier: 1.20,
    deal_preferences: ['BOGO', 'Num For'],
    description_suffix: 'Family Pricing'
  },
  GROUP_C: {
    pricing_multiplier: 0.85,
    performance_multiplier: 0.85,
    ctr_base: 0.88,
    conversion_base: 0.85,
    share_multiplier: 0.60,
    deal_preferences: ['Save X', 'Amount'],
    description_suffix: 'Value Pricing'
  },
  GROUP_D: {
    pricing_multiplier: 1.20,
    performance_multiplier: 1.20,
    ctr_base: 0.85,
    conversion_base: 0.70,
    share_multiplier: 1.40,
    deal_preferences: ['Num For', 'BOGO'],
    description_suffix: 'Alpha Test Pricing'
  },
  GROUP_E: {
    pricing_multiplier: 0.95,
    performance_multiplier: 0.95,
    ctr_base: 0.90,
    conversion_base: 0.80,
    share_multiplier: 1.80,
    deal_preferences: ['Amount', 'Save X'],
    description_suffix: 'Beta Digital Pricing'
  }
};

// ============================================================================
// DATA GENERATION FUNCTIONS WITH MULTI-WEEK SUPPORT
// ============================================================================

/**
 * Generate store data for a single store and single week
 * @param {string} storeId - Store identifier (e.g., "STORE_001")
 * @param {string} groupId - Group identifier (e.g., "GROUP_A")
 * @param {number} weekNumber - Week number (36-40)
 * @param {number} storeIndex - Index for global positioning
 * @returns {array} Array of 30 promotion objects
 */
function generateStoreDataForWeek(storeId, groupId, weekNumber, storeIndex = 0) {
  const groupTemplate = groupTemplates[groupId];
  if (!groupTemplate) {
    throw new Error(`Invalid group ID: ${groupId}`);
  }

  // Get week variance multiplier
  const weekMultiplier = getWeekVarianceMultiplier(weekNumber);

  return baseProductTemplates.map((product, productIndex) => {
    const globalIndex = (storeIndex * 30) + productIndex;

    // Apply pricing (not affected by week)
    const basePrice = product.price;
    const priceVariance = 1 + (Math.random() - 0.5) * 2 * 0.05; // ±5%
    const adjustedPrice = basePrice * groupTemplate.pricing_multiplier * priceVariance;

    // Calculate base performance metrics
    const baseViews = Math.floor(50 + (Math.random() * 50)); // 50-100 range
    const performanceVariance = 1 + (Math.random() - 0.5) * 2 * 0.20; // ±20%

    // Apply both group performance and week variance
    const views = Math.round(baseViews * groupTemplate.performance_multiplier * performanceVariance * weekMultiplier);

    const metricsVariance = 1 + (Math.random() - 0.5) * 2 * 0.15; // ±15%
    const clicks = Math.round(views * groupTemplate.ctr_base * metricsVariance);
    const addedToList = Math.round(clicks * groupTemplate.conversion_base * metricsVariance);
    const shares = Math.round(views * 0.10 * groupTemplate.share_multiplier * metricsVariance);

    // Select deal type based on group preferences
    const dealTypes = groupTemplate.deal_preferences;
    const dealType = dealTypes[Math.floor(Math.random() * dealTypes.length)];

    return {
      // Identity
      card_id: `W${weekNumber}_${storeId.slice(-3)}_${product.id}`,
      upc: `${weekNumber}${storeId.slice(-3)}${String(productIndex + 1).padStart(3, '0')}`,

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
      type_hint: "SCALED",

      // Performance Metrics (week-adjusted)
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

      // Tracking (week-specific)
      week: weekNumber,
      stage: getStageForWeek(weekNumber),
      media_freshness: getMediaFreshnessForWeek(weekNumber, storeId),
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
 * Generate data for a single store across multiple weeks
 * @param {string} storeId - Store identifier
 * @param {string} groupId - Group identifier
 * @param {array} weekNumbers - Array of week numbers [36, 37, 38, 39, 40]
 * @param {number} storeIndex - Index for global positioning
 * @returns {array} Array of promotion objects (30 × number of weeks)
 */
function generateMultiWeekStoreData(storeId, groupId, weekNumbers, storeIndex = 0) {
  const allPromotions = [];

  weekNumbers.forEach(weekNumber => {
    const weekData = generateStoreDataForWeek(storeId, groupId, weekNumber, storeIndex);
    allPromotions.push(...weekData);
  });

  return allPromotions;
}

// ============================================================================
// TESTING: Single Store, 5 Weeks (150 records)
// ============================================================================


const testWeeks = [36, 37, 38, 39, 40];
const testData = generateMultiWeekStoreData('STORE_001', 'GROUP_A', testWeeks, 0);
const productsPerStore = baseProductTemplates.length;


// Verify weeks are present
const weekCounts = {};
testData.forEach(promo => {
  weekCounts[promo.week] = (weekCounts[promo.week] || 0) + 1;
});

testWeeks.forEach(week => {
  const count = weekCounts[week] || 0;
  const variance = weekVarianceConfig[week];
});

// Sample promotion from each week
testWeeks.forEach(week => {
  const sample = testData.find(p => p.week === week);
  if (sample) {
  }
});


// ============================================================================
// BATCH PROCESSOR FOR MULTI-WEEK DATA GENERATION
// ============================================================================

/**
 * Generate multi-week data for a range of stores
 * @param {number} startStoreNum - Starting store number (e.g., 1)
 * @param {number} endStoreNum - Ending store number (e.g., 10)
 * @param {array} weekNumbers - Array of week numbers [36, 37, 38, 39, 40]
 * @param {object} options - Processing options
 * @returns {object} Batch results with data and metadata
 */
function generateMultiWeekData(startStoreNum, endStoreNum, weekNumbers, options = {}) {
  const defaults = {
    chunkSize: 5,              // Process 5 stores at a time
    includeMetrics: true,      // Calculate aggregated metrics
    includeValidation: true,   // Validate data completeness
    memoryMonitoring: true,    // Track memory usage
    progressTracking: true     // Log progress updates
  };

  const opts = { ...defaults, ...options };

  // Track execution metadata
  const startTime = performance.now();
  const initialMemory = opts.memoryMonitoring && typeof performance !== 'undefined' && performance.memory
    ? performance.memory.usedJSHeapSize
    : 0;

  const allPromotions = [];
  const processedStores = [];
  let totalStoresProcessed = 0;

  if (opts.progressTracking) {
  }

  // Process stores in chunks
  for (let chunkStart = startStoreNum; chunkStart <= endStoreNum; chunkStart += opts.chunkSize) {
    const chunkEnd = Math.min(chunkStart + opts.chunkSize - 1, endStoreNum);
    const chunkNumber = Math.floor((chunkStart - startStoreNum) / opts.chunkSize) + 1;
    const totalChunks = Math.ceil((endStoreNum - startStoreNum + 1) / opts.chunkSize);

    if (opts.progressTracking) {
    }

    const chunkStartTime = performance.now();

    // Process each store in the chunk
    for (let storeNum = chunkStart; storeNum <= chunkEnd; storeNum++) {
      const storeId = `STORE_${String(storeNum).padStart(3, '0')}`;

      // Find store in hierarchy to get group_id
      const store = storeHierarchyScaled.stores.find(s => s.store_id === storeId);
      if (!store) {
        continue;
      }

      // Generate multi-week data for this store
      const storeData = generateMultiWeekStoreData(
        storeId,
        store.group_id,
        weekNumbers,
        storeNum - 1
      );

      allPromotions.push(...storeData);
      processedStores.push(storeId);
      totalStoresProcessed++;

      if (opts.progressTracking) {
        // Use console.log in browser, process.stdout in Node.js
        if (typeof process !== 'undefined' && process.stdout) {
          process.stdout.write(`   ✓ ${storeId} (${store.group_name}): ${storeData.length} promotions\n`);
        } else {
        }
      }
    }

    const chunkEndTime = performance.now();
    const chunkDuration = chunkEndTime - chunkStartTime;

    if (opts.progressTracking) {

      // Memory check after chunk
      if (opts.memoryMonitoring && typeof performance !== 'undefined' && performance.memory) {
        const currentMemory = performance.memory.usedJSHeapSize;
        const memoryIncreaseMB = ((currentMemory - initialMemory) / 1024 / 1024).toFixed(2);
      }
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

    // Calculate metrics by week
    const metricsByWeek = {};
    weekNumbers.forEach(week => {
      const weekPromos = allPromotions.filter(p => p.week === week);
      const weekViews = weekPromos.reduce((sum, p) => sum + p.card_in_view, 0);
      const weekClicks = weekPromos.reduce((sum, p) => sum + p.card_clicked, 0);

      metricsByWeek[`week_${week}`] = {
        promotions: weekPromos.length,
        views: weekViews,
        clicks: weekClicks,
        ctr: weekViews > 0 ? Math.round((weekClicks / weekViews) * 10000) / 100 : 0
      };
    });

    metrics = {
      total_promotions: allPromotions.length,
      total_stores: totalStoresProcessed,
      total_weeks: weekNumbers.length,
      total_views: totalViews,
      total_clicks: totalClicks,
      total_added_to_list: totalAddedToList,
      total_shares: totalShares,
      avg_ctr: totalViews > 0 ? Math.round((totalClicks / totalViews) * 10000) / 100 : 0,
      avg_conversion: totalClicks > 0 ? Math.round((totalAddedToList / totalClicks) * 10000) / 100 : 0,
      by_week: metricsByWeek
    };
  }

  // Validation if requested
  let validation = null;
  if (opts.includeValidation) {
    const expectedPromotions = totalStoresProcessed * weekNumbers.length * baseProductTemplates.length;
    const uniqueStores = new Set(allPromotions.map(p => p.store_codes[0])).size;
    const uniqueWeeks = new Set(allPromotions.map(p => p.week)).size;
    const completenessCheck = allPromotions.filter(p =>
      p.card_in_view && p.card_clicked && p.composite_score && p.week
    ).length;

    validation = {
      expected_promotions: expectedPromotions,
      actual_promotions: allPromotions.length,
      promotions_match: allPromotions.length === expectedPromotions,
      expected_stores: totalStoresProcessed,
      unique_stores: uniqueStores,
      stores_match: uniqueStores === totalStoresProcessed,
      expected_weeks: weekNumbers.length,
      unique_weeks: uniqueWeeks,
      weeks_match: uniqueWeeks === weekNumbers.length,
      data_completeness: Math.round((completenessCheck / allPromotions.length) * 100),
      all_valid: allPromotions.length === expectedPromotions &&
                 uniqueStores === totalStoresProcessed &&
                 uniqueWeeks === weekNumbers.length &&
                 completenessCheck === allPromotions.length
    };
  }

  // Final memory check
  const finalMemory = opts.memoryMonitoring && typeof performance !== 'undefined' && performance.memory
    ? performance.memory.usedJSHeapSize
    : 0;

  const result = {
    promotions: allPromotions,
    storeIds: processedStores,
    metadata: {
      stores_processed: totalStoresProcessed,
      weeks_processed: weekNumbers.length,
      processing_time_ms: Math.round(processingTime),
      promotions_per_second: Math.round(allPromotions.length / (processingTime / 1000)),
      memory_increase_mb: finalMemory > 0 ? ((finalMemory - initialMemory) / 1024 / 1024).toFixed(2) : null,
      timestamp: new Date().toISOString()
    },
    metrics: metrics,
    validation: validation
  };

  if (opts.progressTracking) {
    if (validation) {
    }
  }

  return result;
}

// ============================================================================
// TESTING: Batch Processing (5 stores × 5 weeks = 850 records)
// ============================================================================


const batchTestWeeks = [36, 37, 38, 39, 40];
const batchResult = generateMultiWeekData(1, 5, batchTestWeeks, {
  chunkSize: 5,
  includeMetrics: true,
  includeValidation: true,
  memoryMonitoring: false, // Disable in Node.js (performance.memory not available)
  progressTracking: true
});

// Display detailed results

if (batchResult.metrics) {

  Object.entries(batchResult.metrics.by_week).forEach(([week, stats]) => {
  });
}

if (batchResult.validation) {
}


// ============================================================================
// GROUP A DATA GENERATION - URBAN PREMIUM (STORES 001-010)
// ============================================================================



const groupA_weeks = [36, 37, 38, 39, 40];
const groupA_data = generateMultiWeekData(1, 10, groupA_weeks, {
  chunkSize: 5,
  includeMetrics: true,
  includeValidation: true,
  memoryMonitoring: false,
  progressTracking: true
});

// Detailed validation and analysis

// Store breakdown
groupA_data.storeIds.forEach((storeId, index) => {
  const store = storeHierarchyScaled.stores.find(s => s.store_id === storeId);
  const storePromos = groupA_data.promotions.filter(p => p.store_codes[0] === storeId);
});

// Week breakdown
groupA_weeks.forEach(week => {
  const weekPromos = groupA_data.promotions.filter(p => p.week === week);
  const weekViews = weekPromos.reduce((sum, p) => sum + p.card_in_view, 0);
  const weekClicks = weekPromos.reduce((sum, p) => sum + p.card_clicked, 0);
  const variance = weekVarianceConfig[week];

});

// Performance metrics

// Validation

// Sample data verification
const samplePromo = groupA_data.promotions[0];

// Group characteristics verification
const groupATemplate = groupTemplates.GROUP_A;


// Export for use
if (typeof window !== 'undefined') {
  window.groupA_data = groupA_data;
}

// ============================================================================
// GROUP B DATA GENERATION - SUBURBAN FAMILY (STORES 011-020)
// ============================================================================



const groupB_weeks = [36, 37, 38, 39, 40];
const groupB_data = generateMultiWeekData(11, 20, groupB_weeks, {
  chunkSize: 5,
  includeMetrics: true,
  includeValidation: true,
  memoryMonitoring: false,
  progressTracking: true
});

// Detailed validation and analysis

// Store breakdown
groupB_data.storeIds.forEach((storeId, index) => {
  const store = storeHierarchyScaled.stores.find(s => s.store_id === storeId);
  const storePromos = groupB_data.promotions.filter(p => p.store_codes[0] === storeId);
});

// Week breakdown
groupB_weeks.forEach(week => {
  const weekPromos = groupB_data.promotions.filter(p => p.week === week);
  const weekViews = weekPromos.reduce((sum, p) => sum + p.card_in_view, 0);
  const weekClicks = weekPromos.reduce((sum, p) => sum + p.card_clicked, 0);
  const variance = weekVarianceConfig[week];

});

// Performance metrics

// Validation


// Export for use
if (typeof window !== 'undefined') {
  window.groupB_data = groupB_data;
}

// ============================================================================
// GROUP C DATA GENERATION - RURAL VALUE (STORES 021-030)
// ============================================================================



const groupC_weeks = [36, 37, 38, 39, 40];
const groupC_data = generateMultiWeekData(21, 30, groupC_weeks, {
  chunkSize: 5,
  includeMetrics: true,
  includeValidation: true,
  memoryMonitoring: false,
  progressTracking: true
});

// Detailed validation and analysis

// Store breakdown
groupC_data.storeIds.forEach((storeId, index) => {
  const store = storeHierarchyScaled.stores.find(s => s.store_id === storeId);
  const storePromos = groupC_data.promotions.filter(p => p.store_codes[0] === storeId);
});

// Week breakdown
groupC_weeks.forEach(week => {
  const weekPromos = groupC_data.promotions.filter(p => p.week === week);
  const weekViews = weekPromos.reduce((sum, p) => sum + p.card_in_view, 0);
  const weekClicks = weekPromos.reduce((sum, p) => sum + p.card_clicked, 0);
  const variance = weekVarianceConfig[week];

});

// Performance metrics

// Validation


// Export for use
if (typeof window !== 'undefined') {
  window.groupC_data = groupC_data;
}

// Combined Groups A, B, C Summary

const combinedABC_promotions = groupA_data.promotions.length + groupB_data.promotions.length + groupC_data.promotions.length;
const combinedABC_views = groupA_data.metrics.total_views + groupB_data.metrics.total_views + groupC_data.metrics.total_views;
const combinedABC_clicks = groupA_data.metrics.total_clicks + groupB_data.metrics.total_clicks + groupC_data.metrics.total_clicks;




// ============================================================================
// GROUP D DATA GENERATION - TEST ALPHA (STORES 031-040)
// ============================================================================



const groupD_weeks = [36, 37, 38, 39, 40];
const groupD_data = generateMultiWeekData(31, 40, groupD_weeks, {
  chunkSize: 5,
  includeMetrics: true,
  includeValidation: true,
  memoryMonitoring: false,
  progressTracking: true
});

// Detailed validation and analysis

// Store breakdown
groupD_data.storeIds.forEach((storeId, index) => {
  const store = storeHierarchyScaled.stores.find(s => s.store_id === storeId);
  const storePromos = groupD_data.promotions.filter(p => p.store_codes[0] === storeId);
});

// Week breakdown
groupD_weeks.forEach(week => {
  const weekPromos = groupD_data.promotions.filter(p => p.week === week);
  const weekViews = weekPromos.reduce((sum, p) => sum + p.card_in_view, 0);
  const weekClicks = weekPromos.reduce((sum, p) => sum + p.card_clicked, 0);
  const variance = weekVarianceConfig[week];

});

// Performance metrics

// Test-specific features verification
const experimentalPromos = groupD_data.promotions.filter(p => p.media_freshness === 'experimental').length;

// Validation


// Export for use
if (typeof window !== 'undefined') {
  window.groupD_data = groupD_data;
}

// ============================================================================
// GROUP E DATA GENERATION - TEST BETA (STORES 041-050)
// ============================================================================



const groupE_weeks = [36, 37, 38, 39, 40];
const groupE_data = generateMultiWeekData(41, 50, groupE_weeks, {
  chunkSize: 5,
  includeMetrics: true,
  includeValidation: true,
  memoryMonitoring: false,
  progressTracking: true
});

// Detailed validation and analysis

// Store breakdown
groupE_data.storeIds.forEach((storeId, index) => {
  const store = storeHierarchyScaled.stores.find(s => s.store_id === storeId);
  const storePromos = groupE_data.promotions.filter(p => p.store_codes[0] === storeId);
});

// Week breakdown
groupE_weeks.forEach(week => {
  const weekPromos = groupE_data.promotions.filter(p => p.week === week);
  const weekViews = weekPromos.reduce((sum, p) => sum + p.card_in_view, 0);
  const weekClicks = weekPromos.reduce((sum, p) => sum + p.card_clicked, 0);
  const variance = weekVarianceConfig[week];

});

// Performance metrics

// Test-specific features verification
const digitalOptimizedPromos = groupE_data.promotions.filter(p => p.media_freshness === 'digital_optimized').length;

// Validation


// Export for use
if (typeof window !== 'undefined') {
  window.groupE_data = groupE_data;
}

// ============================================================================
// COMBINE ALL GROUPS - FINAL DATASET
// ============================================================================


// Combine all promotions
const allPromotions = [
  ...groupA_data.promotions,
  ...groupB_data.promotions,
  ...groupC_data.promotions,
  ...groupD_data.promotions,
  ...groupE_data.promotions
];

// Calculate combined metrics
const allStores = [
  ...groupA_data.storeIds,
  ...groupB_data.storeIds,
  ...groupC_data.storeIds,
  ...groupD_data.storeIds,
  ...groupE_data.storeIds
];

const totalViews = allPromotions.reduce((sum, p) => sum + p.card_in_view, 0);
const totalClicks = allPromotions.reduce((sum, p) => sum + p.card_clicked, 0);
const totalAddedToList = allPromotions.reduce((sum, p) => sum + p.added_to_list, 0);
const totalShares = allPromotions.reduce((sum, p) => sum + p.share_count, 0);





[36, 37, 38, 39, 40].forEach(week => {
  const weekPromos = allPromotions.filter(p => p.week === week);
  const weekViews = weekPromos.reduce((sum, p) => sum + p.card_in_view, 0);
  const variance = weekVarianceConfig[week];
});

// Validation
const expectedTotal = 50 * 34 * 5;
const uniqueStores = new Set(allPromotions.map(p => p.store_codes[0])).size;
const uniqueWeeks = new Set(allPromotions.map(p => p.week)).size;



// Export final dataset
if (typeof window !== 'undefined') {
  window.allPromotionsScaled = allPromotions;
  window.allStoresScaled = allStores;
}

// ============================================================================
// DATA AGGREGATION AND HELPER FUNCTIONS
// ============================================================================


/**
 * DataUtils - Utility functions for querying and aggregating data
 */
const DataUtilsScaled = {

  /**
   * Get aggregated metrics for a specific week
   * @param {number} weekNumber - Week number (36-40)
   * @returns {object} Aggregated metrics for the week
   */
  getMetricsByWeek: function(weekNumber) {
    const weekPromos = allPromotions.filter(p => p.week === weekNumber);

    if (weekPromos.length === 0) {
      return null;
    }

    const totalViews = weekPromos.reduce((sum, p) => sum + p.card_in_view, 0);
    const totalClicks = weekPromos.reduce((sum, p) => sum + p.card_clicked, 0);
    const totalAddedToList = weekPromos.reduce((sum, p) => sum + p.added_to_list, 0);
    const totalShares = weekPromos.reduce((sum, p) => sum + p.share_count, 0);

    return {
      week: weekNumber,
      promotions: weekPromos.length,
      stores: new Set(weekPromos.map(p => p.store_codes[0])).size,
      metrics: {
        views: totalViews,
        clicks: totalClicks,
        added_to_list: totalAddedToList,
        shares: totalShares,
        ctr: totalViews > 0 ? Math.round((totalClicks / totalViews) * 10000) / 100 : 0,
        conversion: totalClicks > 0 ? Math.round((totalAddedToList / totalClicks) * 10000) / 100 : 0,
        share_rate: totalViews > 0 ? Math.round((totalShares / totalViews) * 10000) / 100 : 0
      }
    };
  },

  /**
   * Get metrics for a specific store and week
   * @param {string} storeId - Store identifier (e.g., "STORE_001")
   * @param {number} weekNumber - Week number (36-40)
   * @returns {object} Store-week specific metrics
   */
  getMetricsByStoreAndWeek: function(storeId, weekNumber) {
    const promos = allPromotions.filter(p =>
      p.store_codes[0] === storeId && p.week === weekNumber
    );

    if (promos.length === 0) {
      return null;
    }

    const totalViews = promos.reduce((sum, p) => sum + p.card_in_view, 0);
    const totalClicks = promos.reduce((sum, p) => sum + p.card_clicked, 0);
    const totalAddedToList = promos.reduce((sum, p) => sum + p.added_to_list, 0);
    const totalShares = promos.reduce((sum, p) => sum + p.share_count, 0);

    const store = storeHierarchyScaled.stores.find(s => s.store_id === storeId);

    return {
      store_id: storeId,
      store_name: store ? store.store_name : storeId,
      group_id: store ? store.group_id : 'unknown',
      week: weekNumber,
      promotions: promos.length,
      metrics: {
        views: totalViews,
        clicks: totalClicks,
        added_to_list: totalAddedToList,
        shares: totalShares,
        ctr: totalViews > 0 ? Math.round((totalClicks / totalViews) * 10000) / 100 : 0,
        conversion: totalClicks > 0 ? Math.round((totalAddedToList / totalClicks) * 10000) / 100 : 0
      }
    };
  },

  /**
   * Calculate week-over-week change for a specific metric
   * @param {string} metric - Metric name ('views', 'clicks', 'ctr', etc.)
   * @param {number} week1 - Earlier week
   * @param {number} week2 - Later week
   * @param {string} storeId - Optional store filter
   * @returns {object} WoW change calculation
   */
  getWeekOverWeekChange: function(metric, week1, week2, storeId = null) {
    const getMetrics = (week) => {
      if (storeId) {
        return this.getMetricsByStoreAndWeek(storeId, week);
      } else {
        return this.getMetricsByWeek(week);
      }
    };

    const data1 = getMetrics(week1);
    const data2 = getMetrics(week2);

    if (!data1 || !data2) {
      return null;
    }

    const value1 = data1.metrics[metric];
    const value2 = data2.metrics[metric];

    if (value1 === 0) {
      return {
        metric: metric,
        week1: week1,
        week2: week2,
        value1: value1,
        value2: value2,
        change: value2,
        change_percent: null,
        direction: value2 > 0 ? 'up' : 'flat'
      };
    }

    const change = value2 - value1;
    const change_percent = Math.round((change / value1) * 10000) / 100;

    return {
      metric: metric,
      week1: week1,
      week2: week2,
      store_id: storeId,
      value1: value1,
      value2: value2,
      change: change,
      change_percent: change_percent,
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'flat'
    };
  },

  /**
   * Get weekly trend for a store across all weeks
   * @param {string} storeId - Store identifier
   * @returns {object} Weekly trend data
   */
  getWeeklyTrend: function(storeId) {
    const weeks = [36, 37, 38, 39, 40];
    const trend = weeks.map(week => this.getMetricsByStoreAndWeek(storeId, week));

    const store = storeHierarchyScaled.stores.find(s => s.store_id === storeId);

    return {
      store_id: storeId,
      store_name: store ? store.store_name : storeId,
      group_id: store ? store.group_id : 'unknown',
      weeks: trend,
      summary: {
        total_promotions: trend.reduce((sum, w) => sum + (w ? w.promotions : 0), 0),
        total_views: trend.reduce((sum, w) => sum + (w ? w.metrics.views : 0), 0),
        total_clicks: trend.reduce((sum, w) => sum + (w ? w.metrics.clicks : 0), 0),
        avg_ctr: trend.length > 0 ?
          Math.round(trend.reduce((sum, w) => sum + (w ? w.metrics.ctr : 0), 0) / trend.length * 100) / 100 : 0
      }
    };
  },

  /**
   * Get metrics by store (aggregated across all weeks)
   * @param {string} storeId - Store identifier
   * @returns {object} Store metrics
   */
  getMetricsByStore: function(storeId) {
    const promos = allPromotions.filter(p => p.store_codes[0] === storeId);

    if (promos.length === 0) {
      return null;
    }

    const store = storeHierarchyScaled.stores.find(s => s.store_id === storeId);

    const totalViews = promos.reduce((sum, p) => sum + p.card_in_view, 0);
    const totalClicks = promos.reduce((sum, p) => sum + p.card_clicked, 0);
    const totalAddedToList = promos.reduce((sum, p) => sum + p.added_to_list, 0);

    return {
      store_id: storeId,
      store_name: store ? store.store_name : storeId,
      group_id: store ? store.group_id : 'unknown',
      promotions: promos.length,
      metrics: {
        views: totalViews,
        clicks: totalClicks,
        added_to_list: totalAddedToList,
        ctr: totalViews > 0 ? Math.round((totalClicks / totalViews) * 10000) / 100 : 0,
        conversion: totalClicks > 0 ? Math.round((totalAddedToList / totalClicks) * 10000) / 100 : 0
      }
    };
  },

  /**
   * Get metrics by group (aggregated across all weeks and stores in group)
   * @param {string} groupId - Group identifier
   * @returns {object} Group metrics
   */
  getMetricsByGroup: function(groupId) {
    const groupStores = storeHierarchyScaled.stores.filter(s => s.group_id === groupId);
    const storeIds = groupStores.map(s => s.store_id);
    const promos = allPromotions.filter(p => storeIds.includes(p.store_codes[0]));

    if (promos.length === 0) {
      return null;
    }

    const group = storeHierarchyScaled.groups.find(g => g.group_id === groupId);

    const totalViews = promos.reduce((sum, p) => sum + p.card_in_view, 0);
    const totalClicks = promos.reduce((sum, p) => sum + p.card_clicked, 0);
    const totalAddedToList = promos.reduce((sum, p) => sum + p.added_to_list, 0);

    return {
      group_id: groupId,
      group_name: group ? group.group_name : groupId,
      stores: storeIds.length,
      promotions: promos.length,
      metrics: {
        views: totalViews,
        clicks: totalClicks,
        added_to_list: totalAddedToList,
        ctr: totalViews > 0 ? Math.round((totalClicks / totalViews) * 10000) / 100 : 0,
        conversion: totalClicks > 0 ? Math.round((totalAddedToList / totalClicks) * 10000) / 100 : 0
      }
    };
  }
};


// ============================================================================
// WEEKLY METRICS STRUCTURE
// ============================================================================


const weeklyMetricsScaled = {
  current_week: 40,
  available_weeks: [36, 37, 38, 39, 40],

  // Aggregated metrics by week
  by_week: {
    week_36: DataUtilsScaled.getMetricsByWeek(36),
    week_37: DataUtilsScaled.getMetricsByWeek(37),
    week_38: DataUtilsScaled.getMetricsByWeek(38),
    week_39: DataUtilsScaled.getMetricsByWeek(39),
    week_40: DataUtilsScaled.getMetricsByWeek(40)
  },

  // Aggregated metrics by store (across all weeks)
  by_store: {},

  // Aggregated metrics by group (across all weeks)
  by_group: {
    GROUP_A: DataUtilsScaled.getMetricsByGroup('GROUP_A'),
    GROUP_B: DataUtilsScaled.getMetricsByGroup('GROUP_B'),
    GROUP_C: DataUtilsScaled.getMetricsByGroup('GROUP_C'),
    GROUP_D: DataUtilsScaled.getMetricsByGroup('GROUP_D'),
    GROUP_E: DataUtilsScaled.getMetricsByGroup('GROUP_E')
  },

  // Overall metrics (all stores, all weeks)
  overall: {
    stores: 50,
    weeks: 5,
    promotions: allPromotions.length,
    metrics: {
      views: totalViews,
      clicks: totalClicks,
      added_to_list: totalAddedToList,
      shares: totalShares,
      ctr: Math.round((totalClicks / totalViews) * 10000) / 100,
      conversion: Math.round((totalAddedToList / totalClicks) * 10000) / 100
    }
  }
};

// Populate by_store metrics
allStores.forEach(storeId => {
  weeklyMetricsScaled.by_store[storeId] = DataUtilsScaled.getMetricsByStore(storeId);
});


// ============================================================================
// TEST AGGREGATION FUNCTIONS
// ============================================================================


// Test 1: Get metrics by week
const week40Metrics = DataUtilsScaled.getMetricsByWeek(40);

// Test 2: Get metrics by store and week
const store001Week40 = DataUtilsScaled.getMetricsByStoreAndWeek('STORE_001', 40);

// Test 3: Week-over-week change
const wowViews = DataUtilsScaled.getWeekOverWeekChange('views', 39, 40);

// Test 4: Week-over-week change for specific store
const wowCTRStore = DataUtilsScaled.getWeekOverWeekChange('ctr', 39, 40, 'STORE_001');

// Test 5: Weekly trend
const store001Trend = DataUtilsScaled.getWeeklyTrend('STORE_001');
store001Trend.weeks.forEach(w => {
  if (w) {
  }
});

// Test 6: Get metrics by group
const groupAMetrics = DataUtilsScaled.getMetricsByGroup('GROUP_A');


// Export for use
if (typeof window !== 'undefined') {
  window.DataUtilsScaled = DataUtilsScaled;
  window.weeklyMetricsScaled = weeklyMetricsScaled;
}


// ============================================================================
// CONTEXT BAR INTEGRATION - STORE HIERARCHY MAPPING
// ============================================================================



// Transform scaled store hierarchy for context bar compatibility
const contextBarStoreHierarchy = {
  all_stores: {
    total_count: storeHierarchyScaled.stores.length
  },

  version_groups: storeHierarchyScaled.groups.map(group => ({
    id: group.group_id,
    name: group.group_name,
    count: group.store_count
  })),

  individual_stores: storeHierarchyScaled.stores.map(store => ({
    id: store.store_id,
    name: store.store_name,
    versionGroup: store.group_id
  }))
};


// Verify each group
contextBarStoreHierarchy.version_groups.forEach(group => {
  const groupStores = contextBarStoreHierarchy.individual_stores.filter(s => s.versionGroup === group.id);
});

// Week selector structure

// Create main database export for dashboard compatibility
// Calculate YTD metrics from all available data (context-aware)
const calculateYTDMetrics = function(contextState = null) {
  // Filter promotions based on context
  let filteredPromotions = allPromotions;

  if (contextState) {
    const { store, group } = contextState;

    if (store && store !== 'all_stores') {
      // Filter by specific store
      filteredPromotions = allPromotions.filter(p => p.store_codes && p.store_codes[0] === store);
    } else if (group && group !== 'all_groups') {
      // Filter by group - get stores in this group
      const groupStores = contextBarStoreHierarchy.individual_stores
        .filter(s => s.versionGroup === group)
        .map(s => s.id);
      filteredPromotions = allPromotions.filter(p => p.store_codes && groupStores.includes(p.store_codes[0]));
    }
  }

  // Calculate metrics from filtered promotions
  const totalViews = filteredPromotions.reduce((sum, p) => sum + (p.card_in_view || 0), 0);
  const totalClicks = filteredPromotions.reduce((sum, p) => sum + (p.card_clicked || 0), 0);
  const totalAddedToList = filteredPromotions.reduce((sum, p) => sum + (p.added_to_list || 0), 0);
  const totalPrintCount = filteredPromotions.reduce((sum, p) => sum + (p.print_count || 0), 0);

  // Assume we have 5 weeks of data representing a portion of YTD
  // Project to full year (52 weeks) for YTD estimates
  const weeksInData = 5;
  const weeksInYear = 52;
  const projectionMultiplier = weeksInYear / weeksInData;

  const ytdTrafficProjected = Math.round(totalViews * projectionMultiplier);

  // Calculate digital adoption from actual data (clicks + add to list)
  const digitalAdoptionRate = totalViews > 0
    ? ((totalClicks + totalAddedToList) / totalViews * 100)
    : 0;

  // Calculate print rate from actual print_count data
  const printRate = totalViews > 0
    ? (totalPrintCount / totalViews * 100)
    : 0;

  return {
    traffic: {
      value: ytdTrafficProjected,
      formatted: (ytdTrafficProjected / 1000000).toFixed(1) + 'M',
      trend: '+12.4%',
      trendLabel: 'YoY'
    },
    digitalAdoption: {
      value: digitalAdoptionRate,
      formatted: digitalAdoptionRate.toFixed(1) + '%',
      trend: '+8%',
      trendLabel: 'from 2024'
    },
    printRate: {
      value: printRate,
      formatted: printRate.toFixed(1) + '%',
      trend: '-3%',
      trendLabel: ''
    }
  };
};

const mockDatabaseScaled = {
  // Core data
  promotions: allPromotions,

  // Store hierarchy for context bar
  store_hierarchy: contextBarStoreHierarchy,

  // Weekly metrics
  weeklyMetrics: weeklyMetricsScaled,

  // YTD metrics (calculated for all stores by default)
  ytdMetrics: calculateYTDMetrics(),

  // Helper functions
  calculateYTDMetrics: calculateYTDMetrics,

  getTopPromotions: function(count = 10, scoreType = 'composite') {
    return allPromotions
      .sort((a, b) => b.composite_score - a.composite_score)
      .slice(0, count);
  },

  getBottomPromotions: function(count = 10, scoreType = 'composite') {
    return allPromotions
      .sort((a, b) => a.composite_score - b.composite_score)
      .slice(0, count);
  }
};


// ============================================================================
// CONTEXT BAR COMPATIBILITY TESTS
// ============================================================================


// ============================================================================
// FINAL EXPORTS
// ============================================================================

// Export all components for browser use
if (typeof window !== 'undefined') {
  // Main dashboard interface (backward compatible with POC data)
  window.mockDatabase = mockDatabaseScaled;

  // Scaled data components
  window.allPromotionsScaled = allPromotions;
  window.storeHierarchyScaled = storeHierarchyScaled;
  window.weeklyMetricsScaled = weeklyMetricsScaled;
  window.DataUtilsScaled = DataUtilsScaled;

  // Group data
  window.groupA_data = groupA_data;
  window.groupB_data = groupB_data;
  window.groupC_data = groupC_data;
  window.groupD_data = groupD_data;
  window.groupE_data = groupE_data;

  // Store list
  window.allStoresScaled = allStores;
}

