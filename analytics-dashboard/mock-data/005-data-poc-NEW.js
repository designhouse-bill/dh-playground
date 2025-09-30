/**
 * 005-data-poc.js - Complete POC Integration
 * Combines all POC components for dashboard testing
 *
 * Components:
 * - Store hierarchy (5 stores, 5 groups)
 * - Product catalog (8 categories, 30 products)
 * - Promotions (150 total across all stores)
 * - Weekly metrics aggregation
 * - Helper functions for dashboard integration
 */

// Store hierarchy from POC.01
const storeHierarchyPOC = {
  banner: "FreshMart",
  groups: [
    {
      group_id: "GROUP_A",
      group_name: "Urban Premium",
      description: "High-end urban locations with premium focus",
      store_count: 1,
      performance_index: 1.15
    },
    {
      group_id: "GROUP_B",
      group_name: "Suburban Family",
      description: "Family-oriented suburban stores",
      store_count: 1,
      performance_index: 1.05
    },
    {
      group_id: "GROUP_C",
      group_name: "Rural Value",
      description: "Value-focused rural locations",
      store_count: 1,
      performance_index: 0.85
    },
    {
      group_id: "GROUP_D",
      group_name: "Test Alpha",
      description: "Alpha test group for new features",
      store_count: 1,
      performance_index: 1.20
    },
    {
      group_id: "GROUP_E",
      group_name: "Test Beta",
      description: "Beta test group for experimental features",
      store_count: 1,
      performance_index: 0.95
    }
  ],
  stores: [
    {
      store_id: "STORE_001",
      store_name: "FreshMart Downtown Manhattan",
      group_id: "GROUP_A",
      group_name: "Urban Premium",
      performance_index: 1.15,
      location_type: "urban"
    },
    {
      store_id: "STORE_011",
      store_name: "FreshMart Westfield Commons",
      group_id: "GROUP_B",
      group_name: "Suburban Family",
      performance_index: 1.05,
      location_type: "suburban"
    },
    {
      store_id: "STORE_021",
      store_name: "FreshMart Country Plaza",
      group_id: "GROUP_C",
      group_name: "Rural Value",
      performance_index: 0.85,
      location_type: "rural"
    },
    {
      store_id: "STORE_031",
      store_name: "FreshMart Innovation Hub",
      group_id: "GROUP_D",
      group_name: "Test Alpha",
      performance_index: 1.20,
      location_type: "test"
    },
    {
      store_id: "STORE_041",
      store_name: "FreshMart Beta Center",
      group_id: "GROUP_E",
      group_name: "Test Beta",
      performance_index: 0.95,
      location_type: "test"
    }
  ]
};

// Categories from POC.02
const categoriesPOC = [
  {
    category_id: "featured_deals",
    category_name: "Featured Deals",
    description: "Premium promotional items and seasonal highlights",
    product_count: 5
  },
  {
    category_id: "fresh_market",
    category_name: "Fresh Market",
    description: "Fresh produce, bakery, and deli items",
    product_count: 5
  },
  {
    category_id: "meat_seafood",
    category_name: "Meat & Seafood",
    description: "Fresh meats, poultry, and seafood",
    product_count: 4
  },
  {
    category_id: "dairy_frozen",
    category_name: "Dairy & Frozen",
    description: "Dairy products and frozen foods",
    product_count: 4
  },
  {
    category_id: "grocery_essentials",
    category_name: "Grocery Essentials",
    description: "Pantry staples and everyday items",
    product_count: 4
  },
  {
    category_id: "beverages_snacks",
    category_name: "Beverages & Snacks",
    description: "Drinks, chips, and snack foods",
    product_count: 4
  },
  {
    category_id: "health_beauty",
    category_name: "Health & Beauty",
    description: "Personal care and health products",
    product_count: 4
  },
  {
    category_id: "home_seasonal",
    category_name: "Home & Seasonal",
    description: "Household items and seasonal products",
    product_count: 4
  }
];

// Helper functions for pricing and performance
function applyGroupPricing(basePrice, groupId) {
  const price = parseFloat(basePrice.replace('$', ''));
  const multipliers = {
    'GROUP_A': 1.15, // Urban Premium (+15%)
    'GROUP_B': 1.08, // Suburban Family (+8%)
    'GROUP_C': 0.90, // Rural Value (-10%)
    'GROUP_D': 1.20, // Test Alpha (+20%)
    'GROUP_E': 1.05  // Test Beta (+5%)
  };
  return '$' + (price * (multipliers[groupId] || 1.0)).toFixed(2);
}

function applyPerformanceVariation(baseValue, groupMultiplier, variation = 0.2) {
  const randomFactor = 1 + (Math.random() - 0.5) * 2 * variation;
  return Math.round(baseValue * groupMultiplier * randomFactor);
}

function getGroupDealType(originalDeal, groupId) {
  const dealMaps = {
    'GROUP_A': originalDeal, // Keep premium deals
    'GROUP_B': originalDeal === 'Amount' ? 'BOGO' : originalDeal, // BOGO focus
    'GROUP_C': originalDeal === 'BOGO' ? 'Save X' : originalDeal, // Value focus
    'GROUP_D': Math.random() > 0.5 ? 'Num For' : originalDeal, // Test variants
    'GROUP_E': originalDeal // Digital focus
  };
  return dealMaps[groupId];
}

// Base product template data (simulating 30 products from POC.02-03)
const baseProducts = [
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

// Generate 150 promotions (30 per store across 5 stores)
function generatePromotionsForStore(storeId, groupId, storeIndex) {
  return baseProducts.map((product, productIndex) => {
    const globalIndex = (storeIndex * 30) + productIndex;
    const baseViews = Math.floor(50 + (Math.random() * 50)); // 50-100 range
    const groupMultiplier = storeHierarchyPOC.stores.find(s => s.store_id === storeId).performance_index;

    const views = applyPerformanceVariation(baseViews, groupMultiplier);
    const clicks = Math.round(views * (0.75 + Math.random() * 0.15)); // 75-90% CTR
    const addedToList = Math.round(clicks * (0.65 + Math.random() * 0.25)); // 65-90% conversion
    const shares = Math.round(views * (0.05 + Math.random() * 0.15)); // 5-20% share rate

    return {
      // Identity
      card_id: `POC_${storeId.slice(-3)}_${product.id}`,
      upc: `POC${storeId.slice(-3)}${String(productIndex + 1).padStart(3, '0')}`,

      // Product Info
      card_name: product.name,
      card_price: applyGroupPricing(`$${product.price}`, groupId),
      units: product.department === 'meat' ? 'Lb.' : 'Each',
      description: `${product.name} | ${groupId} Pricing | CLUB CARD PRICE`,

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
      version: groupId.slice(-1), // A, B, C, D, E
      store_codes: [storeId],
      type_hint: "POC",

      // Performance Metrics
      card_in_view: views,
      card_clicked: clicks,
      added_to_list: addedToList,
      composite_score: Math.round(views * 10 + clicks * 15 + addedToList * 25),
      percentile: Math.max(1, Math.min(100, Math.round((globalIndex / 150) * 100))),
      quartile: globalIndex < 38 ? "Q1" : globalIndex < 75 ? "Q2" : globalIndex < 113 ? "Q3" : "Q4",

      // Deal Information
      deal_type: getGroupDealType(['Amount', 'Save X', 'BOGO', 'Num For'][productIndex % 4], groupId),
      quantity: 1,
      savings: `$${(product.price * 0.15).toFixed(2)}`,
      reg_price: `$${(product.price * 1.25).toFixed(2)}`,

      // Tracking
      week: 40,
      stage: "post_publish",
      media_freshness: groupId === 'GROUP_D' ? 'experimental' : groupId === 'GROUP_E' ? 'digital_optimized' : 'new',
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

// Generate all 150 promotions
const allPromotions = [];
storeHierarchyPOC.stores.forEach((store, index) => {
  const storePromotions = generatePromotionsForStore(store.store_id, store.group_id, index);
  allPromotions.push(...storePromotions);
});

// Metrics calculation functions
function calculateMetrics(dataSet, label) {
  if (!dataSet || dataSet.length === 0) {
    return {
      label: label,
      promotion_count: 0,
      total_views: 0,
      total_clicks: 0,
      total_added_to_list: 0,
      total_share_count: 0,
      performance_score: 0,
      avg_ctr: 0,
      avg_conversion_rate: 0,
      avg_share_rate: 0,
      quartile_distribution: { Q1: 0, Q2: 0, Q3: 0, Q4: 0 }
    };
  }

  const total_views = dataSet.reduce((sum, item) => sum + item.card_in_view, 0);
  const total_clicks = dataSet.reduce((sum, item) => sum + item.card_clicked, 0);
  const total_added_to_list = dataSet.reduce((sum, item) => sum + item.added_to_list, 0);
  const total_share_count = dataSet.reduce((sum, item) => sum + item.share_count, 0);
  const total_composite_score = dataSet.reduce((sum, item) => sum + item.composite_score, 0);

  const quartileCounts = dataSet.reduce((acc, item) => {
    acc[item.quartile] = (acc[item.quartile] || 0) + 1;
    return acc;
  }, {});

  return {
    label: label,
    promotion_count: dataSet.length,
    total_views: total_views,
    total_clicks: total_clicks,
    total_added_to_list: total_added_to_list,
    total_share_count: total_share_count,
    performance_score: Math.round(total_composite_score / dataSet.length),
    avg_ctr: total_views > 0 ? Math.round((total_clicks / total_views) * 10000) / 100 : 0,
    avg_conversion_rate: total_clicks > 0 ? Math.round((total_added_to_list / total_clicks) * 10000) / 100 : 0,
    avg_share_rate: total_views > 0 ? Math.round((total_share_count / total_views) * 10000) / 100 : 0,
    quartile_distribution: quartileCounts
  };
}

// Enhanced DataUtils with POC-specific functions
const DataUtils = {
  // Original functions (simplified for POC)
  getTopPromotions: function(count = 10, scoreType = 'composite') {
    return allPromotions
      .sort((a, b) => b.composite_score - a.composite_score)
      .slice(0, count);
  },

  getBottomPromotions: function(count = 10, scoreType = 'composite') {
    return allPromotions
      .sort((a, b) => a.composite_score - b.composite_score)
      .slice(0, count);
  },

  // POC-specific functions
  getPromotionsByStore: function(storeId) {
    return allPromotions.filter(promo =>
      promo.store_codes && promo.store_codes.includes(storeId)
    );
  },

  getPromotionsByGroup: function(groupId) {
    const groupStores = storeHierarchyPOC.stores
      .filter(store => store.group_id === groupId)
      .map(store => store.store_id);

    return allPromotions.filter(promo =>
      promo.store_codes && groupStores.some(storeId => promo.store_codes.includes(storeId))
    );
  },

  getPromotionsByDepartment: function(department) {
    return allPromotions.filter(promo => promo.department === department);
  },

  getPromotionsByCategory: function(categoryId) {
    return allPromotions.filter(promo => promo.marketing_category === categoryId);
  },

  // Metrics functions
  getMetricsByStore: function(storeId) {
    const storeData = this.getPromotionsByStore(storeId);
    const storeInfo = storeHierarchyPOC.stores.find(store => store.store_id === storeId);
    const label = storeInfo ? `${storeInfo.store_name} (${storeId})` : storeId;
    return calculateMetrics(storeData, label);
  },

  getMetricsByGroup: function(groupId) {
    const groupData = this.getPromotionsByGroup(groupId);
    const groupInfo = storeHierarchyPOC.groups.find(group => group.group_id === groupId);
    const label = groupInfo ? `${groupInfo.group_name} (${groupId})` : groupId;
    return calculateMetrics(groupData, label);
  }
};

// Weekly metrics object
const weeklyMetrics = {
  current_week: 40,  // Current week for context bar

  overall: calculateMetrics(allPromotions, 'All Stores Combined'),

  by_store: {
    STORE_001: DataUtils.getMetricsByStore('STORE_001'),
    STORE_011: DataUtils.getMetricsByStore('STORE_011'),
    STORE_021: DataUtils.getMetricsByStore('STORE_021'),
    STORE_031: DataUtils.getMetricsByStore('STORE_031'),
    STORE_041: DataUtils.getMetricsByStore('STORE_041')
  },

  by_group: {
    GROUP_A: DataUtils.getMetricsByGroup('GROUP_A'),
    GROUP_B: DataUtils.getMetricsByGroup('GROUP_B'),
    GROUP_C: DataUtils.getMetricsByGroup('GROUP_C'),
    GROUP_D: DataUtils.getMetricsByGroup('GROUP_D'),
    GROUP_E: DataUtils.getMetricsByGroup('GROUP_E')
  },

  summary: {
    total_stores: 5,
    total_groups: 5,
    total_promotions: allPromotions.length,
    data_quality: {
      complete_records: allPromotions.length,
      missing_data: 0
    }
  }
};

// Transform POC data structure for context bar compatibility
const contextBarStoreHierarchy = {
  all_stores: {
    total_count: storeHierarchyPOC.stores.length
  },
  version_groups: storeHierarchyPOC.groups.map(group => ({
    id: group.group_id,
    name: group.group_name,
    count: group.store_count
  })),
  individual_stores: storeHierarchyPOC.stores.map(store => ({
    id: store.store_id,
    name: store.store_name,
    versionGroup: store.group_id
  }))
};

// Main database object matching 004-data.js structure
window.mockDatabase = {
  // Core data
  promotions: allPromotions,
  categories: categoriesPOC,

  // POC-specific additions
  storeHierarchy: storeHierarchyPOC,
  store_hierarchy: contextBarStoreHierarchy,  // Transformed for context bar
  weeklyMetrics: weeklyMetrics,

  // Helper functions
  getTopPromotions: function(count = 10, scoreType = 'composite') {
    return DataUtils.getTopPromotions(count, scoreType);
  },

  getBottomPromotions: function(count = 10, scoreType = 'composite') {
    return DataUtils.getBottomPromotions(count, scoreType);
  }
};

// Additional exports for compatibility
window.mockPromotions = allPromotions;
window.DataUtils = DataUtils;
window.storeHierarchyPOC = storeHierarchyPOC;
window.weeklyMetrics = weeklyMetrics;

// Version comparison and page performance (simplified for POC)
window.getVersionComparison = function() {
  return {
    comparison: "POC Version",
    stores: storeHierarchyPOC.stores.length,
    promotions: allPromotions.length
  };
};

window.getPagePerformance = function() {
  return {
    page: "POC Dashboard",
    load_time: "Fast",
    data_points: allPromotions.length
  };
};

