/**
 * 003-data.js - Enhanced Analytics Dashboard Mock Database
 * Hybrid structure combining ARS and Brookshire Brothers patterns
 * Includes pre-publish and post-publish data for complete lifecycle tracking
 */

const mockDatabase = {
  // Enhanced promotions with real grocery data structure
  promotions: [
    // Top Performers - Real products from circulars
    {
      // Identity
      card_id: "promo_001",
      upc: "04138741224",

      // Product Info
      card_name: "Boar's Head Ovengold Turkey",
      card_price: "$9.99",
      units: "Lb.",
      description: "Sliced To Order | CLUB CARD PRICE",

      // Categorization (dual system)
      marketing_category: "featured",  // Promotional theme
      department: "deli",              // Actual department

      // Placement
      card_size: "3X2",
      width: 3,
      height: 2,
      position: "top-center",
      page: 1,
      page_position: 2,

      // Versioning
      version: "NY",
      store_codes: ["NY427", "NY428", "NY429"],
      type_hint: "10A",

      // Performance Metrics
      card_in_view: 98,
      card_clicked: 85,
      added_to_list: 72,
      composite_score: 3134,
      percentile: 99,
      quartile: "Q1",

      // Deal Information
      deal_type: "Amount",
      quantity: 1,
      savings: "$3.00",
      reg_price: "$12.99",

      // Tracking
      week: 40,
      stage: "post_publish",
      media_freshness: "new",
      share_count: 145,
      print_count: 12,
      pdf_downloads: 8,

      // Additional Metadata
      image_url: "assets/images/products/BoarsHeadCrackedPeppermillTurkey.png",
      card_style: "premium",
      media_size: "full"
    },
    {
      card_id: "promo_002",
      upc: "02114502000",
      card_name: "Smithfield Bacon",
      card_price: "$4.99",
      units: "16 oz.",
      description: "Original or Thick Cut | limit 4 offers per family | CLUB CARD PRICE",
      marketing_category: "featured",
      department: "meat",
      card_size: "2X2",
      width: 2,
      height: 2,
      position: "top-left",
      page: 1,
      page_position: 1,
      version: "ALL",
      store_codes: ["NY427", "NJ414", "CT301"],
      type_hint: "9A",
      card_in_view: 96,
      card_clicked: 82,
      added_to_list: 68,
      composite_score: 2883,
      percentile: 97,
      quartile: "Q1",
      deal_type: "Save X",
      quantity: 4,
      savings: "$2.00",
      reg_price: "$6.99",
      week: 40,
      stage: "post_publish",
      media_freshness: "new",
      share_count: 125,
      print_count: 18,
      pdf_downloads: 10,
      image_url: "assets/images/products/BanquetBreadedChicken.png",
      card_style: "standard",
      media_size: "full"
    },
    {
      card_id: "promo_003",
      upc: "04850001163",
      card_name: "Carolina Rice 20 Lb Bag",
      card_price: "$11.99",
      units: "20 Lb.",
      description: "Long Grain White or Parboiled Gold | limit 4 offers per family | CLUB CARD PRICE",
      marketing_category: "pantry stock-up",
      department: "grocery",
      card_size: "3X2",
      width: 3,
      height: 2,
      position: "mid-center",
      page: 1,
      page_position: 8,
      version: "NY",
      store_codes: ["NY427", "NY428"],
      type_hint: "10A",
      card_in_view: 92,
      card_clicked: 78,
      added_to_list: 65,
      composite_score: 2545,
      percentile: 94,
      quartile: "Q1",
      deal_type: "Amount",
      quantity: 1,
      savings: "$4.00",
      reg_price: "$15.99",
      week: 40,
      stage: "post_publish",
      media_freshness: "reused",
      share_count: 98,
      print_count: 25,
      pdf_downloads: 15,
      image_url: "assets/images/products/BobEvansSideDishes.png",
      card_style: "standard",
      media_size: "full"
    },
    {
      card_id: "promo_004",
      card_name: "Fresh Atlantic Salmon",
      card_price: "$8.99/lb",
      card_size: "2X1",
      position: "mid-left",
      marketing_category: "farm fresh",
      department: "seafood",
      card_in_view: 89,
      card_clicked: 74,
      added_to_list: 58,
      composite_score: 2234,
      percentile: 89,
      quartile: "Q1",
      week: 40,
      version: "standard",
      store_id: "all",
      image_url: "assets/images/products/Boneless-Ribeye-steak.jpg",
      deal_type: "Amount",
      media_freshness: "new",
      share_count: 67,
      print_count: 8,
      pdf_downloads: 5,
      expanded_interactions: 18,
      total_interactions: 74
    },
    {
      card_id: "promo_005",
      card_name: "Organic Bananas",
      card_price: "$1.29/lb",
      card_size: "1X1",
      position: "bot-right",
      marketing_category: "organic produce",
      department: "produce",
      card_in_view: 85,
      card_clicked: 68,
      added_to_list: 52,
      composite_score: 1987,
      percentile: 82,
      quartile: "Q1",
      week: 40,
      version: "standard",
      store_id: "all",
      image_url: "assets/images/products/ApplePie.png",
      deal_type: "Amount",
      media_freshness: "reused",
      share_count: 34,
      print_count: 15,
      pdf_downloads: 12,
      expanded_interactions: 14,
      total_interactions: 68
    },

    // Additional promotions showcasing different deal types
    {
      card_id: "promo_006",
      upc: "07143000256",
      card_name: "Progresso Soup",
      card_price: "2/$4",
      units: "18-19 oz.",
      description: "Select Varieties | MFR",
      marketing_category: "pantry stock-up sale",
      department: "grocery",
      card_size: "1X1",
      width: 1,
      height: 1,
      position: "mid-right",
      page: 1,
      page_position: 9,
      version: "ALL",
      store_codes: ["NY427", "NJ414", "CT301"],
      type_hint: "9A",
      card_in_view: 78,
      card_clicked: 65,
      added_to_list: 48,
      composite_score: 1987,
      percentile: 78,
      quartile: "Q2",
      deal_type: "Num For",
      quantity: 2,
      reg_price: "$2.49",
      savings: "$0.98",
      week: 40,
      stage: "post_publish",
      media_freshness: "new",
      share_count: 67,
      print_count: 12,
      pdf_downloads: 8
    },
    {
      card_id: "promo_007",
      upc: "04850001163",
      card_name: "Ocean Spray Juice",
      card_price: "2/$7",
      units: "64 fl. oz.",
      description: "Assorted Varieties | CLUB CARD PRICE",
      marketing_category: "featured",
      department: "beverages",
      card_size: "1X1",
      width: 1,
      height: 1,
      position: "bot-left",
      page: 1,
      page_position: 16,
      version: "ALL",
      composite_score: 1654,
      percentile: 65,
      quartile: "Q2",
      deal_type: "Num For",
      quantity: 2,
      week: 40,
      card_in_view: 72,
      card_clicked: 58,
      added_to_list: 42
    },
    {
      card_id: "promo_008",
      upc: "02114502001",
      card_name: "Häagen-Dazs Ice Cream",
      card_price: "Buy 2 Get 1 Free",
      units: "14 fl. oz.",
      description: "Select Varieties",
      marketing_category: "scream for ice cream",
      department: "frozen",
      card_size: "2X1",
      width: 2,
      height: 1,
      position: "mid-center",
      page: 2,
      version: "ALL",
      composite_score: 2234,
      percentile: 85,
      quartile: "Q1",
      deal_type: "BOGO",
      quantity: 3,
      week: 40,
      card_in_view: 89,
      card_clicked: 76,
      added_to_list: 58
    }
  ],

  // New departments array for store departments
  departments: [
    { id: "bakery", name: "Bakery", section: "perishables" },
    { id: "deli", name: "Deli", section: "perishables" },
    { id: "meat", name: "Meat", section: "perishables" },
    { id: "seafood", name: "Seafood", section: "perishables" },
    { id: "produce", name: "Produce", section: "perishables" },
    { id: "dairy", name: "Dairy", section: "perishables" },
    { id: "frozen", name: "Frozen", section: "center_store" },
    { id: "grocery", name: "Grocery", section: "center_store" },
    { id: "beverages", name: "Beverages", section: "center_store" },
    { id: "snacks_and_breads", name: "Snacks and Breads", section: "center_store" },
    { id: "health_and_beauty", name: "Health and Beauty", section: "general_merchandise" },
    { id: "household", name: "Household", section: "general_merchandise" },
    { id: "pets", name: "Pets", section: "general_merchandise" },
    { id: "general_merchandise", name: "General Merchandise", section: "general_merchandise" }
  ],

  // Category performance data (now lowercase)
  categories: [
    { name: "featured", score: 100, trend: 5, week: 40, promotion_count: 24, avg_engagement: 95.2 },
    { name: "farm fresh", score: 96, trend: -2, week: 40, promotion_count: 32, avg_engagement: 89.4 },
    { name: "good food matters", score: 74, trend: 8, week: 40, promotion_count: 18, avg_engagement: 71.8 },
    { name: "custom cuts", score: 69, trend: 3, week: 40, promotion_count: 15, avg_engagement: 67.2 },
    { name: "deals for days", score: 63, trend: 0, week: 40, promotion_count: 28, avg_engagement: 61.5 },
    { name: "beef pork chicken", score: 53, trend: 1, week: 40, promotion_count: 22, avg_engagement: 52.1 },
    { name: "fresh is a promise", score: 52, trend: -3, week: 40, promotion_count: 19, avg_engagement: 50.8 },
    { name: "flavors of the sea", score: 43, trend: 2, week: 40, promotion_count: 12, avg_engagement: 42.3 },
    { name: "everyday living", score: 38, trend: 0, week: 40, promotion_count: 25, avg_engagement: 37.9 },
    { name: "weekly bogo's", score: 26, trend: -5, week: 40, promotion_count: 16, avg_engagement: 25.4 },
    { name: "beverages", score: 26, trend: -12, week: 40, promotion_count: 31, avg_engagement: 24.8 },
    { name: "beer and wine", score: 26, trend: 4, week: 40, promotion_count: 14, avg_engagement: 25.1 },
    { name: "great quality low prices", score: 17, trend: 0, week: 40, promotion_count: 20, avg_engagement: 16.9 },
    { name: "banners", score: 16, trend: 1, week: 40, promotion_count: 8, avg_engagement: 15.8 },
    { name: "organic produce", score: 15, trend: -2, week: 40, promotion_count: 13, avg_engagement: 14.7 },
    { name: "flowers", score: 8, trend: 0, week: 40, promotion_count: 6, avg_engagement: 7.9 },
    { name: "household goods", score: 4, trend: -15, week: 40, promotion_count: 11, avg_engagement: 3.8 }
  ],

  // Weekly performance metrics (updated to week 40)
  weeklyMetrics: {
    current_week: 40,
    performance_score: 94,
    previous_week_score: 89,
    week_over_week_change: 6,
    daily_progression: [32, 38, 45, 51, 55, null, null], // Wed through Tue (current day 5)
    expected_pattern: [35, 25, 15, 10, 8, 5, 2], // Expected percentage by day
    total_views: 142750,
    unique_viewers: 31240,
    previous_week_unique_viewers: 28551,
    traffic_week_over_week_change: 9.4,
    print_clicks: 2134,
    pdf_downloads: 1067,
    share_total: 178,
    share_trend: 18,
    alerts: {
      underperforming_count: 3,
      items: [
        { category: "beverages", score: 26, threshold: 40 },
        { category: "household goods", score: 4, threshold: 20 },
        { category: "flowers", score: 8, threshold: 15 }
      ]
    },
    summary: {
      total_promotions: 285,
      active_promotions: 267,
      top_quartile_count: 71,
      bottom_quartile_count: 67,
      avg_composite_score: 1847,
      median_composite_score: 1623
    }
  },

  // YTD Metrics (Year-to-Date performance data)
  ytdMetrics: {
    total_traffic: 2847650,
    yoy_growth: 12.4,
    digital_adoption_rate: 73.2,
    print_rate: 18.5
  },

  // Enhanced promotions array (keeping existing structure for compatibility)
  enhancedPromotions: []
};

// New utility functions
function getVersionComparison() {
  const versions = {};
  mockDatabase.promotions.forEach(promo => {
    if (!versions[promo.version]) {
      versions[promo.version] = {
        count: 0,
        avg_score: 0,
        total_score: 0,
        avg_engagement: 0,
        total_engagement: 0
      };
    }
    versions[promo.version].count++;
    versions[promo.version].total_score += promo.composite_score;
    versions[promo.version].total_engagement += promo.card_clicked;
  });

  Object.keys(versions).forEach(version => {
    versions[version].avg_score = Math.round(versions[version].total_score / versions[version].count);
    versions[version].avg_engagement = Math.round(versions[version].total_engagement / versions[version].count);
  });

  return versions;
}

function getPagePerformance() {
  const pages = {};
  mockDatabase.promotions.forEach(promo => {
    if (!pages[promo.page]) {
      pages[promo.page] = {
        promotions: 0,
        total_views: 0,
        total_clicks: 0,
        avg_score: 0,
        total_score: 0
      };
    }
    pages[promo.page].promotions++;
    pages[promo.page].total_views += promo.card_in_view;
    pages[promo.page].total_clicks += promo.card_clicked;
    pages[promo.page].total_score += promo.composite_score;
  });

  Object.keys(pages).forEach(page => {
    pages[page].avg_score = Math.round(pages[page].total_score / pages[page].promotions);
    pages[page].click_through_rate = ((pages[page].total_clicks / pages[page].total_views) * 100).toFixed(1);
  });

  return pages;
}

// Generate additional promotions (preserving existing functionality)
function generateAdditionalPromotions() {
  const additionalPromotions = [];
  const positions = ["top-left", "top-center", "top-right", "mid-left", "mid-center", "mid-right", "bot-left", "bot-center", "bot-right"];
  const sizes = ["1X1", "2X1", "1X2", "2X2"];
  const dealTypes = ["Amount", "BOGO", "From Num", "Num For", "Num Slash", "Save X", "Coupon Combo Tag", "Coupon Points", "Coupon Tag", "Loyalty Combo Tag", "Loyalty Coupon Combo Tag"];

  const productTemplates = {
    "featured": ["Premium Ribeye Steak", "Organic Free-Range Chicken", "Fresh Maine Lobster"],
    "farm fresh": ["Local Tomatoes", "Farm Fresh Eggs", "Seasonal Corn"],
    "grocery": ["Pasta Sauce", "Breakfast Cereal", "Canned Soup"],
    "beverages": ["Craft Soda", "Energy Drinks", "Bottled Water"],
    "household goods": ["Paper Towels", "Laundry Detergent", "Cleaning Supplies"]
  };

  const categories = [
    { name: "featured", score: 95, promotion_count: 20 },
    { name: "farm fresh", score: 85, promotion_count: 25 },
    { name: "grocery", score: 70, promotion_count: 40 },
    { name: "beverages", score: 60, promotion_count: 30 },
    { name: "household goods", score: 45, promotion_count: 15 }
  ];

  categories.forEach((category, categoryIndex) => {
    const templates = productTemplates[category.name] || ["Generic Product"];
    const targetCount = category.promotion_count;

    for (let i = 0; i < targetCount; i++) {
      const template = templates[i % templates.length];
      const baseScore = category.score;
      const variation = Math.random() * 20 - 10;
      const score = Math.max(1, Math.min(100, Math.round(baseScore + variation)));

      additionalPromotions.push({
        card_id: `generated_${categoryIndex}_${i}`,
        card_name: template,
        card_price: `$${(Math.random() * 20 + 1).toFixed(2)}`,
        card_size: sizes[Math.floor(Math.random() * sizes.length)],
        position: positions[Math.floor(Math.random() * positions.length)],
        marketing_category: category.name,
        department: category.name === "farm fresh" ? "produce" : category.name,
        card_in_view: Math.round(score + Math.random() * 10),
        card_clicked: Math.round(score * 0.8 + Math.random() * 10),
        added_to_list: Math.round(score * 0.6 + Math.random() * 10),
        composite_score: Math.round(score * 30 + Math.random() * 500),
        percentile: Math.max(1, Math.min(100, score)),
        quartile: score > 75 ? "Q1" : score > 50 ? "Q2" : score > 25 ? "Q3" : "Q4",
        week: 40,
        version: "standard",
        store_id: "all",
        image_url: "images/mock-image.png",
        deal_type: dealTypes[Math.floor(Math.random() * dealTypes.length)],
        media_freshness: Math.random() > 0.5 ? "new" : "reused",
        share_count: Math.round(Math.random() * 50),
        print_count: Math.round(Math.random() * 20),
        pdf_downloads: Math.round(Math.random() * 15)
      });
    }
  });

  return additionalPromotions;
}

// Utility functions for data access
const DataUtils = {
  getPromotion: function(id) {
    return mockDatabase.promotions.find(p => p.card_id === id);
  },

  getPromotionsByCategory: function(category) {
    return mockDatabase.promotions.filter(p => p.marketing_category === category);
  },

  getTopPerformers: function(count = 10) {
    return [...mockDatabase.promotions]
      .sort((a, b) => b.composite_score - a.composite_score)
      .slice(0, count);
  },

  getBottomPerformers: function(count = 10) {
    return [...mockDatabase.promotions]
      .sort((a, b) => a.composite_score - b.composite_score)
      .slice(0, count);
  },

  getAverageScoreByPosition: function() {
    const positionScores = {};
    mockDatabase.promotions.forEach(promo => {
      if (!positionScores[promo.position]) {
        positionScores[promo.position] = [];
      }
      positionScores[promo.position].push(promo.composite_score);
    });

    Object.keys(positionScores).forEach(pos => {
      const scores = positionScores[pos];
      positionScores[pos] = {
        average: scores.reduce((sum, score) => sum + score, 0) / scores.length,
        count: scores.length,
        scores: scores
      };
    });

    return positionScores;
  },

  getAverageScoreBySize: function() {
    const sizeScores = {};
    mockDatabase.promotions.forEach(promo => {
      if (!sizeScores[promo.card_size]) {
        sizeScores[promo.card_size] = [];
      }
      sizeScores[promo.card_size].push(promo.composite_score);
    });

    Object.keys(sizeScores).forEach(size => {
      const scores = sizeScores[size];
      sizeScores[size] = {
        average: scores.reduce((sum, score) => sum + score, 0) / scores.length,
        count: scores.length,
        scores: scores
      };
    });

    return sizeScores;
  }
};

// Helper functions for enhanced promotions
mockDatabase.getTopPromotions = function(count = 10, scoreType = 'composite') {
  const sortedPromotions = [...this.promotions].sort((a, b) => {
    const scoreKey = scoreType === 'composite' ? 'composite_score' : 'percentile';
    return b[scoreKey] - a[scoreKey];
  });
  return sortedPromotions.slice(0, count);
};

mockDatabase.getBottomPromotions = function(count = 10, scoreType = 'composite') {
  const sortedPromotions = [...this.promotions].sort((a, b) => {
    const scoreKey = scoreType === 'composite' ? 'composite_score' : 'percentile';
    return a[scoreKey] - b[scoreKey];
  });
  return sortedPromotions.slice(0, count);
};

// Generate additional promotions and add them to the database
mockDatabase.promotions.push(...generateAdditionalPromotions());

// Export for global access
window.mockDatabase = mockDatabase;
window.DataUtils = DataUtils;
window.getVersionComparison = getVersionComparison;
window.getPagePerformance = getPagePerformance;