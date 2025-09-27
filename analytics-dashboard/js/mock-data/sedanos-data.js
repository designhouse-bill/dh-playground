/**
 * Complete Mock Database - Sedanos Circular Analytics
 * Based on real Sedanos Circular Interaction data 2025.07.23
 * Comprehensive dataset for prototype testing
 */

const mockDatabase = {
  // Complete promotions dataset from Sedanos data
  promotions: [
    // FEATURED Category (Top Performers)
    {
      card_id: "promo_001",
      card_name: "USDA Choice Beef Chuck Under Shoulder Steak",
      card_price: "$4.99",
      card_size: "2X1",
      position: "top-left",
      category: "FEATURED",
      card_in_view: 100,
      card_clicked: 89,
      added_to_list: 76,
      composite_score: 100,
      percentile: 100,
      quartile: "Q1",
      week: 36,
      version: "standard",
      store_id: "all",
      image_url: "beef-chuck-steak.jpg",
      deal_type: "Multi-Buy",
      media_freshness: "new",
      share_count: 45,
      print_count: 12,
      pdf_downloads: 8,
      expanded_interactions: 25,
      total_interactions: 89
    },
    {
      card_id: "promo_002",
      card_name: "Chicken Drumsticks Family Pack",
      card_price: "$0.79/lb",
      card_size: "1X1",
      position: "top-center",
      category: "FEATURED",
      card_in_view: 98,
      card_clicked: 85,
      added_to_list: 72,
      composite_score: 97,
      percentile: 98,
      quartile: "Q1",
      week: 36,
      version: "standard",
      store_id: "all",
      image_url: "chicken-drumsticks.jpg",
      deal_type: "Buy 2 Get 1",
      media_freshness: "new",
      share_count: 38,
      print_count: 15,
      pdf_downloads: 6,
      expanded_interactions: 24,
      total_interactions: 85
    },
    {
      card_id: "promo_003",
      card_name: "Fresh Atlantic Salmon Fillet",
      card_price: "$8.99/lb",
      card_size: "1X2",
      position: "top-right",
      category: "FEATURED",
      card_in_view: 95,
      card_clicked: 82,
      added_to_list: 68,
      composite_score: 94,
      percentile: 96,
      quartile: "Q1",
      week: 36,
      version: "standard",
      store_id: "all",
      image_url: "salmon-fillet.jpg",
      deal_type: "fixed_price",
      media_freshness: "reused",
      share_count: 42,
      print_count: 9,
      pdf_downloads: 11
    },

    // FARM FRESH Category (Strong Performers)
    {
      card_id: "promo_004",
      card_name: "Organic Tomatoes On The Vine",
      card_price: "$2.99/lb",
      card_size: "1X1",
      position: "mid-left",
      category: "FARM FRESH",
      card_in_view: 96,
      card_clicked: 78,
      added_to_list: 65,
      composite_score: 92,
      percentile: 94,
      quartile: "Q1",
      week: 36,
      version: "standard",
      store_id: "all",
      image_url: "organic-tomatoes.jpg",
      deal_type: "fixed_price",
      media_freshness: "new",
      share_count: 34,
      print_count: 8,
      pdf_downloads: 5
    },
    {
      card_id: "promo_005",
      card_name: "Fresh Strawberries 1 lb Container",
      card_price: "$3.99",
      card_size: "1X1",
      position: "mid-center",
      category: "FARM FRESH",
      card_in_view: 89,
      card_clicked: 72,
      added_to_list: 58,
      composite_score: 86,
      percentile: 89,
      quartile: "Q1",
      week: 36,
      version: "standard",
      store_id: "all",
      image_url: "fresh-strawberries.jpg",
      deal_type: "fixed_price",
      media_freshness: "new",
      share_count: 28,
      print_count: 6,
      pdf_downloads: 4
    },

    // GOOD FOOD MATTERS Category (Mid Performers)
    {
      card_id: "promo_006",
      card_name: "Organic Avocados Hass 4-Pack",
      card_price: "$4.99",
      card_size: "1X1",
      position: "mid-right",
      category: "GOOD FOOD MATTERS",
      card_in_view: 74,
      card_clicked: 58,
      added_to_list: 45,
      composite_score: 74,
      percentile: 78,
      quartile: "Q2",
      week: 36,
      version: "standard",
      store_id: "all",
      image_url: "organic-avocados.jpg",
      deal_type: "fixed_price",
      media_freshness: "reused",
      share_count: 22,
      print_count: 4,
      pdf_downloads: 3
    },
    {
      card_id: "promo_007",
      card_name: "Quinoa Ancient Grains 16oz",
      card_price: "$5.49",
      card_size: "1X1",
      position: "bot-left",
      category: "GOOD FOOD MATTERS",
      card_in_view: 68,
      card_clicked: 52,
      added_to_list: 38,
      composite_score: 69,
      percentile: 72,
      quartile: "Q2",
      week: 36,
      version: "standard",
      store_id: "all",
      image_url: "quinoa-ancient-grains.jpg",
      deal_type: "fixed_price",
      media_freshness: "new",
      share_count: 18,
      print_count: 3,
      pdf_downloads: 2
    },

    // BEVERAGES Category (Underperforming)
    {
      card_id: "promo_008",
      card_name: "Coca-Cola 12-Pack Cans",
      card_price: "$4.99",
      card_size: "2X1",
      position: "bot-center",
      category: "BEVERAGES",
      card_in_view: 26,
      card_clicked: 18,
      added_to_list: 12,
      composite_score: 26,
      percentile: 28,
      quartile: "Q4",
      week: 36,
      version: "standard",
      store_id: "all",
      image_url: "coca-cola-12pack.jpg",
      deal_type: "fixed_price",
      media_freshness: "reused",
      share_count: 8,
      print_count: 2,
      pdf_downloads: 1
    },
    {
      card_id: "promo_009",
      card_name: "Tropicana Orange Juice 52oz",
      card_price: "$3.79",
      card_size: "1X1",
      position: "bot-right",
      category: "BEVERAGES",
      card_in_view: 22,
      card_clicked: 15,
      added_to_list: 9,
      composite_score: 22,
      percentile: 24,
      quartile: "Q4",
      week: 36,
      version: "standard",
      store_id: "all",
      image_url: "tropicana-oj.jpg",
      deal_type: "fixed_price",
      media_freshness: "reused",
      share_count: 5,
      print_count: 1,
      pdf_downloads: 1
    },

    // HOUSEHOLD GOODS Category (Worst Performers)
    {
      card_id: "promo_010",
      card_name: "Tide Laundry Detergent 100oz",
      card_price: "$12.99",
      card_size: "1X2",
      position: "mid-left",
      category: "HOUSEHOLD GOODS",
      card_in_view: 4,
      card_clicked: 2,
      added_to_list: 1,
      composite_score: 4,
      percentile: 2,
      quartile: "Q4",
      week: 36,
      version: "standard",
      store_id: "all",
      image_url: "tide-detergent.jpg",
      deal_type: "fixed_price",
      media_freshness: "reused",
      share_count: 1,
      print_count: 0,
      pdf_downloads: 0
    }
  ],

  // Category performance data (all 17 categories from Sedanos)
  categories: [
    { name: "FEATURED", score: 100, trend: 5, week: 36, promotion_count: 24, avg_engagement: 95.2 },
    { name: "FARM FRESH", score: 96, trend: -2, week: 36, promotion_count: 32, avg_engagement: 89.4 },
    { name: "GOOD FOOD MATTERS", score: 74, trend: 8, week: 36, promotion_count: 18, avg_engagement: 71.8 },
    { name: "CUSTOM CUTS", score: 69, trend: 3, week: 36, promotion_count: 15, avg_engagement: 67.2 },
    { name: "DEALS FOR DAYS", score: 63, trend: 0, week: 36, promotion_count: 28, avg_engagement: 61.5 },
    { name: "BEEF PORK CHICKEN", score: 53, trend: 1, week: 36, promotion_count: 22, avg_engagement: 52.1 },
    { name: "FRESH IS A PROMISE", score: 52, trend: -3, week: 36, promotion_count: 19, avg_engagement: 50.8 },
    { name: "FLAVORS OF THE SEA", score: 43, trend: 2, week: 36, promotion_count: 12, avg_engagement: 42.3 },
    { name: "EVERYDAY LIVING", score: 38, trend: 0, week: 36, promotion_count: 25, avg_engagement: 37.9 },
    { name: "WEEKLY BOGO'S", score: 26, trend: -5, week: 36, promotion_count: 16, avg_engagement: 25.4 },
    { name: "BEVERAGES", score: 26, trend: -12, week: 36, promotion_count: 31, avg_engagement: 24.8 },
    { name: "BEER AND WINE", score: 26, trend: 4, week: 36, promotion_count: 14, avg_engagement: 25.1 },
    { name: "GREAT QUALITY LOW PRICES", score: 17, trend: 0, week: 36, promotion_count: 20, avg_engagement: 16.9 },
    { name: "BANNERS", score: 16, trend: 1, week: 36, promotion_count: 8, avg_engagement: 15.8 },
    { name: "ORGANIC PRODUCE", score: 15, trend: -2, week: 36, promotion_count: 13, avg_engagement: 14.7 },
    { name: "FLOWERS", score: 8, trend: 0, week: 36, promotion_count: 6, avg_engagement: 7.9 },
    { name: "HOUSEHOLD GOODS", score: 4, trend: -15, week: 36, promotion_count: 11, avg_engagement: 3.8 }
  ],

  // Weekly performance metrics
  weeklyMetrics: {
    current_week: 36,
    performance_score: 92,
    previous_week_score: 87,
    week_over_week_change: 6,
    daily_progression: [28, 35, 42, 48, 52, null, null], // Wed through Tue (current day 5)
    expected_pattern: [35, 25, 15, 10, 8, 5, 2], // Expected percentage by day
    total_views: 125450,
    unique_viewers: 28551,
    previous_week_unique_viewers: 26834,
    traffic_week_over_week_change: 6.4,
    print_clicks: 1847,
    pdf_downloads: 892,
    share_total: 145,
    share_trend: 12,
    alerts: {
      underperforming_count: 3,
      items: [
        { category: "BEVERAGES", score: 26, threshold: 40 },
        { category: "HOUSEHOLD GOODS", score: 4, threshold: 20 },
        { category: "FLOWERS", score: 8, threshold: 15 }
      ]
    },
    quick_win: {
      insight: "2X1 promotions in top positions performing 40% better than average",
      action: "Apply 2X1 format to underperforming beverages category",
      data: {
        best_size: "2X1",
        best_position: "top-left",
        performance_lift: 40
      }
    }
  },

  // Year-to-date performance
  ytdMetrics: {
    total_traffic: 2800000,
    yoy_growth: 15,
    digital_adoption_rate: 73,
    print_rate: 12,
    pdf_rate: 3,
    share_rate: 2,
    top_weeks: [
      { week: 27, name: "July 4th Week", score: 98, date: "2025-07-02" },
      { week: 45, name: "Thanksgiving Week", score: 97, date: "2025-11-18" },
      { week: 51, name: "Christmas Week", score: 96, date: "2025-12-23" },
      { week: 36, name: "Current Week", score: 92, date: "2025-09-18" }
    ],
    monthly_trends: [
      { month: "Jan", traffic: 240000, engagement: 78 },
      { month: "Feb", traffic: 220000, engagement: 82 },
      { month: "Mar", traffic: 280000, engagement: 85 },
      { month: "Apr", traffic: 290000, engagement: 79 },
      { month: "May", traffic: 310000, engagement: 88 },
      { month: "Jun", traffic: 285000, engagement: 84 },
      { month: "Jul", traffic: 340000, engagement: 92 },
      { month: "Aug", traffic: 320000, engagement: 87 },
      { month: "Sep", traffic: 315000, engagement: 89 }
    ]
  },

  // Position heat map data
  positionHeatMap: {
    "top-left": 89,
    "top-center": 85,
    "top-right": 82,
    "mid-left": 71,
    "mid-center": 68,
    "mid-right": 65,
    "bot-left": 52,
    "bot-center": 48,
    "bot-right": 45
  },

  // Size performance analysis
  sizeAnalysis: {
    "1X1": { count: 180, avg_score: 58, efficiency: 58 },
    "2X1": { count: 85, avg_score: 72, efficiency: 36 },
    "1X2": { count: 25, avg_score: 65, efficiency: 32.5 },
    "2X2": { count: 8, avg_score: 85, efficiency: 21.25 },
    "3X1": { count: 2, avg_score: 78, efficiency: 26 }
  },

  // Deal type performance
  dealTypeAnalysis: {
    "fixed_price": { count: 220, avg_score: 62, conversion_rate: 0.15 },
    "percent_off": { count: 45, avg_score: 58, conversion_rate: 0.18 },
    "bogo": { count: 25, avg_score: 72, conversion_rate: 0.22 },
    "buy_x_get_y": { count: 10, avg_score: 68, conversion_rate: 0.20 }
  }
};

// Generate additional promotions to reach 300 total
function generateAdditionalPromotions() {
  const additionalPromotions = [];
  const positions = ["top-left", "top-center", "top-right", "mid-left", "mid-center", "mid-right", "bot-left", "bot-center", "bot-right"];
  const sizes = ["1X1", "2X1", "1X2", "2X2"];
  const dealTypes = ["Multi-Buy", "Buy 2 Get 1", "% Off", "$ Off", "BOGO"];

  const productTemplates = {
    "FEATURED": [
      "Premium Ground Beef 80/20", "Boneless Pork Chops", "Wild Caught Shrimp",
      "Free Range Chicken Breast", "Grass Fed Ribeye Steak"
    ],
    "FARM FRESH": [
      "Sweet Corn 4-Pack", "Baby Spinach Organic", "Red Bell Peppers",
      "Banana Bunch", "Seedless Grapes", "Cucumber English"
    ],
    "GOOD FOOD MATTERS": [
      "Almond Milk Unsweetened", "Greek Yogurt Plain", "Whole Grain Bread",
      "Extra Virgin Olive Oil", "Raw Honey"
    ],
    "BEVERAGES": [
      "Pepsi 12-Pack", "Gatorade 8-Pack", "Poland Spring Water",
      "Red Bull Energy Drink", "Starbucks Frappuccino"
    ],
    "HOUSEHOLD GOODS": [
      "Bounty Paper Towels", "Charmin Bath Tissue", "Dawn Dish Soap",
      "Lysol Disinfectant", "Febreze Air Freshener"
    ]
  };

  let promoId = 11;

  // Define categories locally to avoid dependency on mockDatabase during initialization
  const categories = [
    { name: "FEATURED", score: 100, promotion_count: 15 },
    { name: "FARM FRESH", score: 85, promotion_count: 25 },
    { name: "GOOD FOOD MATTERS", score: 78, promotion_count: 20 },
    { name: "BEVERAGES", score: 72, promotion_count: 30 },
    { name: "HOUSEHOLD GOODS", score: 68, promotion_count: 25 },
    { name: "GROCERY", score: 75, promotion_count: 35 },
    { name: "SEAFOOD", score: 82, promotion_count: 15 },
    { name: "BAKERY", score: 70, promotion_count: 20 },
    { name: "DELI", score: 76, promotion_count: 18 },
    { name: "HEALTH & BEAUTY", score: 65, promotion_count: 22 },
    { name: "BABY", score: 73, promotion_count: 12 },
    { name: "PET", score: 69, promotion_count: 15 },
    { name: "PHARMACY", score: 71, promotion_count: 10 },
    { name: "FLORAL", score: 67, promotion_count: 8 },
    { name: "SEASONAL", score: 74, promotion_count: 18 },
    { name: "ELECTRONICS", score: 66, promotion_count: 12 },
    { name: "APPAREL", score: 63, promotion_count: 15 }
  ];

  categories.forEach(category => {
    const templates = productTemplates[category.name] || ["Generic Product"];
    const targetCount = category.promotion_count;

    for (let i = 0; i < targetCount - 2; i++) { // -2 because we already have some
      const template = templates[i % templates.length];
      const baseScore = category.score;
      const variation = Math.random() * 20 - 10; // ±10 points variation
      const score = Math.max(1, Math.min(100, Math.round(baseScore + variation)));

      additionalPromotions.push({
        card_id: `promo_${String(promoId).padStart(3, '0')}`,
        card_name: `${template} ${i + 1}`,
        card_price: `$${(Math.random() * 15 + 2).toFixed(2)}`,
        card_size: sizes[Math.floor(Math.random() * sizes.length)],
        position: positions[Math.floor(Math.random() * positions.length)],
        category: category.name,
        card_in_view: score,
        card_clicked: Math.round(score * 0.8),
        added_to_list: Math.round(score * 0.6),
        composite_score: score,
        percentile: Math.round((score / 100) * 100),
        quartile: score >= 75 ? "Q1" : score >= 50 ? "Q2" : score >= 25 ? "Q3" : "Q4",
        week: 36,
        version: "standard",
        store_id: "all",
        image_url: `${template.toLowerCase().replace(/\s+/g, '-')}.jpg`,
        deal_type: dealTypes[Math.floor(Math.random() * dealTypes.length)],
        media_freshness: Math.random() > 0.7 ? "new" : "reused",
        share_count: Math.round(score * 0.4),
        print_count: Math.round(score * 0.1),
        pdf_downloads: Math.round(score * 0.05),
        expanded_interactions: Math.random() > 0.72 ? Math.round(score * 0.3) : 0,
        total_interactions: Math.round(score * 0.8)
      });

      promoId++;
    }
  });

  return additionalPromotions;
}

// Utility functions for data access
const DataUtils = {
  // Get promotions by category
  getPromotionsByCategory(category) {
    return mockDatabase.promotions.filter(p => p.category === category);
  },

  // Get top performers
  getTopPerformers(count = 25) {
    return [...mockDatabase.promotions]
      .sort((a, b) => b.composite_score - a.composite_score)
      .slice(0, count);
  },

  // Get bottom performers
  getBottomPerformers(count = 25) {
    return [...mockDatabase.promotions]
      .sort((a, b) => a.composite_score - b.composite_score)
      .slice(0, count);
  },

  // Get underperforming items (score < 40)
  getUnderperforming() {
    return mockDatabase.promotions.filter(p => p.composite_score < 40);
  },

  // Get category by name
  getCategory(name) {
    return mockDatabase.categories.find(c => c.name === name);
  },

  // Calculate position effectiveness
  getPositionEffectiveness() {
    const positionScores = {};
    mockDatabase.promotions.forEach(p => {
      if (!positionScores[p.position]) {
        positionScores[p.position] = [];
      }
      positionScores[p.position].push(p.composite_score);
    });

    Object.keys(positionScores).forEach(pos => {
      const scores = positionScores[pos];
      positionScores[pos] = scores.reduce((a, b) => a + b, 0) / scores.length;
    });

    return positionScores;
  },

  // Calculate size effectiveness
  getSizeEffectiveness() {
    const sizeScores = {};
    mockDatabase.promotions.forEach(p => {
      if (!sizeScores[p.card_size]) {
        sizeScores[p.card_size] = [];
      }
      sizeScores[p.card_size].push(p.composite_score);
    });

    Object.keys(sizeScores).forEach(size => {
      const scores = sizeScores[size];
      sizeScores[size] = {
        avg: scores.reduce((a, b) => a + b, 0) / scores.length,
        count: scores.length
      };
    });

    return sizeScores;
  }
};

// Generate comprehensive enhanced promotions data
function generateEnhancedPromotions() {
  const productData = [
    // Premium/Top Performers (90-100 percentile)
    { name: 'Boars Head Cracked Peppermill Turkey', category: 'FEATURED', thumbnail: 'BoarsHeadCrackedPeppermillTurkey.png', baseScore: 3134 },
    { name: 'Breyers Ice Cream', category: 'FEATURED', thumbnail: 'BreyersIceCream.png', baseScore: 2883 },
    { name: 'Boneless Ribeye Steak', category: 'FEATURED', thumbnail: 'Boneless-Ribeye-steak.jpg', baseScore: 2545 },
    { name: 'Sweet Baby Rays BBQ Sauce', category: 'GOOD FOOD MATTERS', thumbnail: 'sweet-baby-rays.png', baseScore: 2249 },
    { name: 'Lays Potato Chips', category: 'GROCERY', thumbnail: 'lays.png', baseScore: 2178 },

    // High Performers (70-89 percentile)
    { name: 'Classico Pasta Sauce', category: 'GROCERY', thumbnail: 'ClassicoPastaSauce.png', baseScore: 2138 },
    { name: 'Dannon Greek Yogurt', category: 'GOOD FOOD MATTERS', thumbnail: 'DannonGreekYogurtorDanimalsPouches.png', baseScore: 2060 },
    { name: 'Pepsi Cola Products', category: 'BEVERAGES', thumbnail: 'pepsi.png', baseScore: 2029 },
    { name: 'Banquet Breaded Chicken', category: 'FEATURED', thumbnail: 'BanquetBreadedChicken.png', baseScore: 1991 },
    { name: 'Apple Pie Fresh Baked', category: 'BAKERY', thumbnail: 'ApplePie.png', baseScore: 1907 },
    { name: 'General Mills Cereal', category: 'GROCERY', thumbnail: 'gen-mills.png', baseScore: 1845 },
    { name: 'Nabisco Crackers', category: 'GROCERY', thumbnail: 'Nabisco.png', baseScore: 1782 },
    { name: 'Furlani Garlic Toast', category: 'BAKERY', thumbnail: 'FurlaniGarlicToast.png', baseScore: 1721 },

    // Good Performers (50-69 percentile)
    { name: 'Coca Cola Products', category: 'BEVERAGES', thumbnail: 'coca cola products.jpg', baseScore: 1654 },
    { name: 'Birds Eye Steamfresh Vegetables', category: 'FARM FRESH', thumbnail: 'BirdsEyeSteamfreshVegetables.png', baseScore: 1521 },
    { name: 'BelGioioso Fresh Mozzarella', category: 'DELI', thumbnail: 'BelGioiosoFreshMozzarella.png', baseScore: 1463 },
    { name: 'Bob Evans Side Dishes', category: 'DELI', thumbnail: 'BobEvansSideDishes.png', baseScore: 1398 },
    { name: 'Michigan Bi-Color Sweet Corn', category: 'FARM FRESH', thumbnail: 'Michigan Bi-Color Sweet Corn.jpg', baseScore: 1334 },
    { name: 'Chex Mix Bugles or Gardettos', category: 'GROCERY', thumbnail: 'ChexMixBuglesorGardettos.png', baseScore: 1275 },

    // Lower Performers (25-49 percentile)
    { name: 'Bubly Sparkling Water', category: 'BEVERAGES', thumbnail: 'bubly-sparklingwater.png', baseScore: 1275 },
    { name: 'Donut Holes Fresh', category: 'BAKERY', thumbnail: 'DonutHoles.png', baseScore: 1187 },
    { name: 'Aluminum Foil Heavy Duty', category: 'HOUSEHOLD GOODS', thumbnail: 'AluminumFoil.png', baseScore: 1098 },
    { name: 'Angus Roast Beef Deli', category: 'DELI', thumbnail: 'AngusRoastBeef.png', baseScore: 1034 },
    { name: 'Benadryl Allergy Relief', category: 'PHARMACY', thumbnail: 'BenadrylAllergyRelief.png', baseScore: 984 },
    { name: 'Charmin Ultra Bath Tissue', category: 'HOUSEHOLD GOODS', thumbnail: 'CharminUltraBathTissue.png', baseScore: 932 }
  ];

  // Generate additional products to reach 100+
  const additionalProducts = [
    'Organic Bananas', 'Ground Turkey 93/7', 'Whole Milk Gallon', 'Sourdough Bread Loaf', 'Baby Spinach Organic',
    'Roma Tomatoes', 'Yellow Onions 3lb Bag', 'Russet Potatoes 5lb', 'Granny Smith Apples', 'Naval Oranges',
    'Greek Yogurt Vanilla', 'String Cheese 12ct', 'Eggs Large Dozen', 'Butter Unsalted', 'Cream Cheese Original',
    'Orange Juice Pulp Free', 'Whole Wheat Bread', 'Peanut Butter Creamy', 'Strawberry Jam', 'Honey Natural',
    'Chicken Breast Boneless', 'Ground Beef 80/20', 'Pork Chops Center Cut', 'Salmon Fillets Atlantic', 'Shrimp Jumbo Raw',
    'Cheddar Cheese Sharp', 'Mozzarella Shredded', 'Parmesan Grated', 'Sour Cream Regular', 'Heavy Cream',
    'Rice Long Grain White', 'Pasta Penne', 'Olive Oil Extra Virgin', 'Balsamic Vinegar', 'Sea Salt Fine',
    'Black Pepper Ground', 'Garlic Powder', 'Onion Powder', 'Italian Seasoning', 'Bay Leaves',
    'Tomato Sauce Canned', 'Diced Tomatoes', 'Tomato Paste', 'Chicken Broth Low Sodium', 'Vegetable Broth',
    'Flour All Purpose', 'Sugar Granulated', 'Brown Sugar Light', 'Baking Powder', 'Vanilla Extract',
    'Chocolate Chips Semi Sweet', 'Cocoa Powder', 'Powdered Sugar', 'Cornstarch', 'Baking Soda',
    'Laundry Detergent', 'Fabric Softener', 'Dish Soap Liquid', 'Paper Towels 6 Roll', 'Toilet Paper 12 Roll',
    'Trash Bags 13 Gallon', 'Aluminum Foil', 'Plastic Wrap', 'Sandwich Bags', 'Storage Bags Gallon',
    'Shampoo Moisturizing', 'Conditioner Repair', 'Body Wash Fresh', 'Toothpaste Whitening', 'Mouthwash Antiseptic',
    'Deodorant Unscented', 'Razor Disposable', 'Vitamins Multivitamin', 'Pain Reliever Extra Strength', 'Antacid Chewable',
    'Coffee Ground Medium', 'Tea Bags Green', 'Hot Chocolate Mix', 'Energy Drink Sugar Free', 'Sports Drink Variety',
    'Crackers Saltine', 'Cookies Chocolate Chip', 'Granola Bars Mixed', 'Nuts Mixed Salted', 'Dried Fruit Mix',
    'Frozen Pizza Supreme', 'Ice Cream Vanilla', 'Frozen Berries Mixed', 'Frozen Broccoli', 'Frozen Corn'
  ];

  const categories = ['FEATURED', 'FARM FRESH', 'GOOD FOOD MATTERS', 'GROCERY', 'BEVERAGES', 'HOUSEHOLD GOODS', 'DELI', 'BAKERY', 'PHARMACY', 'SEASONAL'];
  const thumbnails = ['BreyersIceCream.png', 'lays.png', 'pepsi.png', 'ClassicoPastaSauce.png', 'ApplePie.png'];

  let promotions = [];
  let promoId = 1;

  // Add base products with real data
  productData.forEach((product, index) => {
    const compositeScore = product.baseScore;
    const percentileScore = Math.max(10, Math.round(95 - (index * 3.5)));

    promotions.push({
      id: `promo_${String(promoId).padStart(3, '0')}`,
      name: product.name,
      category: product.category,
      thumbnail: `assets/images/products/${product.thumbnail}`,
      compositeScore: compositeScore,
      percentileScore: percentileScore,
      engagement: Math.max(30, Math.round(95 - (index * 2.1))),
      clickThrough: Math.max(1.5, Math.round((8.5 - (index * 0.15)) * 10) / 10),
      conversionRate: Math.max(0.5, Math.round((4.2 - (index * 0.08)) * 10) / 10)
    });
    promoId++;
  });

  // Generate additional products to reach 100+
  additionalProducts.forEach((productName, index) => {
    const scoreVariation = Math.random() * 400 + 200; // 200-600 range
    const categoryIndex = Math.floor(Math.random() * categories.length);
    const thumbnailIndex = Math.floor(Math.random() * thumbnails.length);

    promotions.push({
      id: `promo_${String(promoId).padStart(3, '0')}`,
      name: productName,
      category: categories[categoryIndex],
      thumbnail: `assets/images/products/${thumbnails[thumbnailIndex]}`,
      compositeScore: Math.round(scoreVariation),
      percentileScore: Math.max(5, Math.round(Math.random() * 85)),
      engagement: Math.max(15, Math.round(Math.random() * 70 + 15)),
      clickThrough: Math.max(0.8, Math.round((Math.random() * 4 + 1) * 10) / 10),
      conversionRate: Math.max(0.3, Math.round((Math.random() * 2 + 0.5) * 10) / 10)
    });
    promoId++;
  });

  return promotions;
}

// Enhanced Promotions Data with Real Product Images
mockDatabase.enhancedPromotions = generateEnhancedPromotions();

// Legacy data for backward compatibility
mockDatabase.enhancedPromotionsLegacy = [
  {
    id: 'promo_001',
    name: 'Boars Head Cracked Peppermill Turkey',
    category: 'FEATURED',
    thumbnail: 'assets/images/products/BoarsHeadCrackedPeppermillTurkey.png',
    compositeScore: 3134,
    percentileScore: 98,
    engagement: 95.2,
    clickThrough: 8.3,
    conversionRate: 4.1
  },
  {
    id: 'promo_002',
    name: 'Breyers Ice Cream',
    category: 'FEATURED',
    thumbnail: 'assets/images/products/BreyersIceCream.png',
    compositeScore: 2883,
    percentileScore: 92,
    engagement: 89.4,
    clickThrough: 7.8,
    conversionRate: 3.9
  },
  {
    id: 'promo_003',
    name: 'Boneless Ribeye Steak',
    category: 'FEATURED',
    thumbnail: 'assets/images/products/Boneless-Ribeye-steak.jpg',
    compositeScore: 2545,
    percentileScore: 81,
    engagement: 85.1,
    clickThrough: 6.9,
    conversionRate: 3.4
  },
  {
    id: 'promo_004',
    name: 'Sweet Baby Rays BBQ Sauce',
    category: 'GOOD FOOD MATTERS',
    thumbnail: 'assets/images/products/sweet-baby-rays.png',
    compositeScore: 2249,
    percentileScore: 72,
    engagement: 78.3,
    clickThrough: 6.1,
    conversionRate: 3.1
  },
  {
    id: 'promo_005',
    name: 'Lays Potato Chips',
    category: 'GROCERY',
    thumbnail: 'assets/images/products/lays.png',
    compositeScore: 2178,
    percentileScore: 69,
    engagement: 75.8,
    clickThrough: 5.8,
    conversionRate: 2.9
  },
  {
    id: 'promo_006',
    name: 'Classico Pasta Sauce',
    category: 'GROCERY',
    thumbnail: 'assets/images/products/ClassicoPastaSauce.png',
    compositeScore: 2138,
    percentileScore: 68,
    engagement: 74.2,
    clickThrough: 5.6,
    conversionRate: 2.8
  },
  {
    id: 'promo_007',
    name: 'Dannon Greek Yogurt',
    category: 'GOOD FOOD MATTERS',
    thumbnail: 'assets/images/products/DannonGreekYogurtorDanimalsPouches.png',
    compositeScore: 2060,
    percentileScore: 66,
    engagement: 71.8,
    clickThrough: 5.3,
    conversionRate: 2.6
  },
  {
    id: 'promo_008',
    name: 'Pepsi Cola Products',
    category: 'BEVERAGES',
    thumbnail: 'assets/images/products/pepsi.png',
    compositeScore: 2029,
    percentileScore: 65,
    engagement: 69.5,
    clickThrough: 5.1,
    conversionRate: 2.5
  },
  {
    id: 'promo_009',
    name: 'Banquet Breaded Chicken',
    category: 'FEATURED',
    thumbnail: 'assets/images/products/BanquetBreadedChicken.png',
    compositeScore: 1991,
    percentileScore: 64,
    engagement: 67.2,
    clickThrough: 4.9,
    conversionRate: 2.4
  },
  {
    id: 'promo_010',
    name: 'Apple Pie Fresh Baked',
    category: 'BAKERY',
    thumbnail: 'assets/images/products/ApplePie.png',
    compositeScore: 1907,
    percentileScore: 61,
    engagement: 64.8,
    clickThrough: 4.6,
    conversionRate: 2.2
  },
  {
    id: 'promo_011',
    name: 'Coca Cola Products',
    category: 'BEVERAGES',
    thumbnail: 'assets/images/products/coca cola products.jpg',
    compositeScore: 1654,
    percentileScore: 52,
    engagement: 58.1,
    clickThrough: 3.8,
    conversionRate: 1.8
  },
  {
    id: 'promo_012',
    name: 'Birds Eye Steamfresh Vegetables',
    category: 'FARM FRESH',
    thumbnail: 'assets/images/products/BirdsEyeSteamfreshVegetables.png',
    compositeScore: 1521,
    percentileScore: 48,
    engagement: 54.7,
    clickThrough: 3.5,
    conversionRate: 1.6
  },
  {
    id: 'promo_013',
    name: 'Michigan Bi-Color Sweet Corn',
    category: 'FARM FRESH',
    thumbnail: 'assets/images/products/Michigan Bi-Color Sweet Corn.jpg',
    compositeScore: 1398,
    percentileScore: 44,
    engagement: 51.3,
    clickThrough: 3.2,
    conversionRate: 1.4
  },
  {
    id: 'promo_014',
    name: 'Bubly Sparkling Water',
    category: 'BEVERAGES',
    thumbnail: 'assets/images/products/bubly-sparklingwater.png',
    compositeScore: 1275,
    percentileScore: 40,
    engagement: 47.9,
    clickThrough: 2.9,
    conversionRate: 1.2
  },
  {
    id: 'promo_015',
    name: 'Charmin Ultra Bath Tissue',
    category: 'HOUSEHOLD GOODS',
    thumbnail: 'assets/images/products/CharminUltraBathTissue.png',
    compositeScore: 984,
    percentileScore: 28,
    engagement: 38.2,
    clickThrough: 2.1,
    conversionRate: 0.8
  }
];

// Helper functions for enhanced promotions
mockDatabase.getTopPromotions = function(count = 10, scoreType = 'composite') {
  const sortedPromotions = [...this.enhancedPromotions].sort((a, b) => {
    const scoreKey = scoreType === 'composite' ? 'compositeScore' : 'percentileScore';
    return b[scoreKey] - a[scoreKey];
  });
  return sortedPromotions.slice(0, count);
};

mockDatabase.getBottomPromotions = function(count = 10, scoreType = 'composite') {
  const sortedPromotions = [...this.enhancedPromotions].sort((a, b) => {
    const scoreKey = scoreType === 'composite' ? 'compositeScore' : 'percentileScore';
    return a[scoreKey] - b[scoreKey];
  });
  return sortedPromotions.slice(0, count);
};

// Generate additional promotions and add them to the database
mockDatabase.promotions.push(...generateAdditionalPromotions());

// Export for global access
window.mockDatabase = mockDatabase;
window.DataUtils = DataUtils;