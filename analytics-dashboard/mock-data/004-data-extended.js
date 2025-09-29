/**
 * 004-data.js - Enhanced Analytics Dashboard Mock Database
 * Extended with mockPromotions array for Datagrid Inquiry feature
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

// NEW: mockPromotions array for Datagrid Inquiry feature
window.mockPromotions = [
  // Deli Department (25 items)
  { card_id: "deli_001", card_name: "Boar's Head Ham", department: "deli", card_price: "$8.99/lb", card_in_view: 95, card_clicked: 82, share_count: 45, composite_score: 2890, percentile: 96, quartile: "Q1" },
  { card_id: "deli_002", card_name: "Fresh Sliced Turkey", department: "deli", card_price: "$7.49/lb", card_in_view: 89, card_clicked: 75, share_count: 38, composite_score: 2654, percentile: 92, quartile: "Q1" },
  { card_id: "deli_003", card_name: "Italian Salami", department: "deli", card_price: "$9.99/lb", card_in_view: 87, card_clicked: 71, share_count: 32, composite_score: 2445, percentile: 88, quartile: "Q1" },
  { card_id: "deli_004", card_name: "Swiss Cheese", department: "deli", card_price: "$6.99/lb", card_in_view: 83, card_clicked: 68, share_count: 29, composite_score: 2289, percentile: 84, quartile: "Q1" },
  { card_id: "deli_005", card_name: "Roast Beef Deli", department: "deli", card_price: "$10.49/lb", card_in_view: 81, card_clicked: 65, share_count: 26, composite_score: 2156, percentile: 81, quartile: "Q1" },
  { card_id: "deli_006", card_name: "Chicken Salad", department: "deli", card_price: "$5.99/lb", card_in_view: 78, card_clicked: 62, share_count: 24, composite_score: 2034, percentile: 78, quartile: "Q2" },
  { card_id: "deli_007", card_name: "Pastrami Sliced", department: "deli", card_price: "$11.99/lb", card_in_view: 76, card_clicked: 58, share_count: 21, composite_score: 1967, percentile: 75, quartile: "Q2" },
  { card_id: "deli_008", card_name: "Provolone Cheese", department: "deli", card_price: "$7.99/lb", card_in_view: 73, card_clicked: 55, share_count: 19, composite_score: 1843, percentile: 72, quartile: "Q2" },
  { card_id: "deli_009", card_name: "Honey Ham", department: "deli", card_price: "$8.49/lb", card_in_view: 71, card_clicked: 52, share_count: 17, composite_score: 1756, percentile: 69, quartile: "Q2" },
  { card_id: "deli_010", card_name: "Corned Beef", department: "deli", card_price: "$12.99/lb", card_in_view: 68, card_clicked: 49, share_count: 15, composite_score: 1634, percentile: 65, quartile: "Q2" },
  { card_id: "deli_011", card_name: "American Cheese", department: "deli", card_price: "$5.49/lb", card_in_view: 65, card_clicked: 46, share_count: 13, composite_score: 1523, percentile: 62, quartile: "Q2" },
  { card_id: "deli_012", card_name: "Bologna Sliced", department: "deli", card_price: "$4.99/lb", card_in_view: 62, card_clicked: 43, share_count: 11, composite_score: 1412, percentile: 58, quartile: "Q2" },
  { card_id: "deli_013", card_name: "Cheddar Cheese", department: "deli", card_price: "$6.49/lb", card_in_view: 59, card_clicked: 40, share_count: 9, composite_score: 1298, percentile: 55, quartile: "Q3" },
  { card_id: "deli_014", card_name: "Potato Salad", department: "deli", card_price: "$4.49/lb", card_in_view: 56, card_clicked: 37, share_count: 8, composite_score: 1189, percentile: 52, quartile: "Q3" },
  { card_id: "deli_015", card_name: "Salami Milano", department: "deli", card_price: "$13.99/lb", card_in_view: 53, card_clicked: 34, share_count: 7, composite_score: 1078, percentile: 48, quartile: "Q3" },
  { card_id: "deli_016", card_name: "Coleslaw Fresh", department: "deli", card_price: "$3.99/lb", card_in_view: 50, card_clicked: 31, share_count: 6, composite_score: 967, percentile: 45, quartile: "Q3" },
  { card_id: "deli_017", card_name: "Pepperoni Sliced", department: "deli", card_price: "$9.49/lb", card_in_view: 47, card_clicked: 28, share_count: 5, composite_score: 856, percentile: 42, quartile: "Q3" },
  { card_id: "deli_018", card_name: "Macaroni Salad", department: "deli", card_price: "$4.99/lb", card_in_view: 44, card_clicked: 25, share_count: 4, composite_score: 745, percentile: 38, quartile: "Q3" },
  { card_id: "deli_019", card_name: "Olive Loaf", department: "deli", card_price: "$5.99/lb", card_in_view: 41, card_clicked: 22, share_count: 3, composite_score: 634, percentile: 35, quartile: "Q4" },
  { card_id: "deli_020", card_name: "Egg Salad", department: "deli", card_price: "$5.49/lb", card_in_view: 38, card_clicked: 19, share_count: 2, composite_score: 523, percentile: 32, quartile: "Q4" },
  { card_id: "deli_021", card_name: "Liverwurst", department: "deli", card_price: "$4.99/lb", card_in_view: 35, card_clicked: 16, share_count: 2, composite_score: 412, percentile: 28, quartile: "Q4" },
  { card_id: "deli_022", card_name: "Head Cheese", department: "deli", card_price: "$6.99/lb", card_in_view: 32, card_clicked: 13, share_count: 1, composite_score: 301, percentile: 25, quartile: "Q4" },
  { card_id: "deli_023", card_name: "Pickle Loaf", department: "deli", card_price: "$5.49/lb", card_in_view: 29, card_clicked: 10, share_count: 1, composite_score: 234, percentile: 22, quartile: "Q4" },
  { card_id: "deli_024", card_name: "Pepper Jack", department: "deli", card_price: "$7.49/lb", card_in_view: 26, card_clicked: 8, share_count: 0, composite_score: 167, percentile: 18, quartile: "Q4" },
  { card_id: "deli_025", card_name: "Summer Sausage", department: "deli", card_price: "$8.99/lb", card_in_view: 23, card_clicked: 6, share_count: 0, composite_score: 112, percentile: 15, quartile: "Q4" },

  // Bakery Department (25 items)
  { card_id: "bakery_001", card_name: "Fresh Baked Bread", department: "bakery", card_price: "$2.99", card_in_view: 94, card_clicked: 81, share_count: 43, composite_score: 2834, percentile: 95, quartile: "Q1" },
  { card_id: "bakery_002", card_name: "Chocolate Cake", department: "bakery", card_price: "$12.99", card_in_view: 91, card_clicked: 78, share_count: 40, composite_score: 2723, percentile: 93, quartile: "Q1" },
  { card_id: "bakery_003", card_name: "Apple Pie", department: "bakery", card_price: "$8.99", card_in_view: 88, card_clicked: 74, share_count: 37, composite_score: 2598, percentile: 90, quartile: "Q1" },
  { card_id: "bakery_004", card_name: "Blueberry Muffins", department: "bakery", card_price: "$4.99", card_in_view: 85, card_clicked: 70, share_count: 34, composite_score: 2456, percentile: 87, quartile: "Q1" },
  { card_id: "bakery_005", card_name: "Cinnamon Rolls", department: "bakery", card_price: "$6.99", card_in_view: 82, card_clicked: 66, share_count: 31, composite_score: 2334, percentile: 83, quartile: "Q1" },
  { card_id: "bakery_006", card_name: "Sourdough Bread", department: "bakery", card_price: "$3.49", card_in_view: 79, card_clicked: 62, share_count: 28, composite_score: 2198, percentile: 80, quartile: "Q1" },
  { card_id: "bakery_007", card_name: "Croissants", department: "bakery", card_price: "$5.99", card_in_view: 76, card_clicked: 58, share_count: 25, composite_score: 2067, percentile: 77, quartile: "Q2" },
  { card_id: "bakery_008", card_name: "Bagels Assorted", department: "bakery", card_price: "$4.49", card_in_view: 73, card_clicked: 54, share_count: 22, composite_score: 1934, percentile: 74, quartile: "Q2" },
  { card_id: "bakery_009", card_name: "Strawberry Cake", department: "bakery", card_price: "$14.99", card_in_view: 70, card_clicked: 50, share_count: 19, composite_score: 1823, percentile: 70, quartile: "Q2" },
  { card_id: "bakery_010", card_name: "Dinner Rolls", department: "bakery", card_price: "$2.49", card_in_view: 67, card_clicked: 46, share_count: 16, composite_score: 1689, percentile: 67, quartile: "Q2" },
  { card_id: "bakery_011", card_name: "Banana Bread", department: "bakery", card_price: "$5.49", card_in_view: 64, card_clicked: 42, share_count: 14, composite_score: 1567, percentile: 64, quartile: "Q2" },
  { card_id: "bakery_012", card_name: "Donuts Glazed", department: "bakery", card_price: "$3.99", card_in_view: 61, card_clicked: 38, share_count: 12, composite_score: 1445, percentile: 60, quartile: "Q2" },
  { card_id: "bakery_013", card_name: "Pumpkin Pie", department: "bakery", card_price: "$7.99", card_in_view: 58, card_clicked: 34, share_count: 10, composite_score: 1323, percentile: 57, quartile: "Q3" },
  { card_id: "bakery_014", card_name: "French Bread", department: "bakery", card_price: "$2.99", card_in_view: 55, card_clicked: 30, share_count: 8, composite_score: 1201, percentile: 54, quartile: "Q3" },
  { card_id: "bakery_015", card_name: "Cupcakes", department: "bakery", card_price: "$8.99", card_in_view: 52, card_clicked: 26, share_count: 6, composite_score: 1079, percentile: 50, quartile: "Q3" },
  { card_id: "bakery_016", card_name: "Wheat Bread", department: "bakery", card_price: "$3.99", card_in_view: 49, card_clicked: 22, share_count: 5, composite_score: 957, percentile: 47, quartile: "Q3" },
  { card_id: "bakery_017", card_name: "Cookies Sugar", department: "bakery", card_price: "$4.99", card_in_view: 46, card_clicked: 18, share_count: 4, composite_score: 835, percentile: 44, quartile: "Q3" },
  { card_id: "bakery_018", card_name: "Rye Bread", department: "bakery", card_price: "$4.49", card_in_view: 43, card_clicked: 15, share_count: 3, composite_score: 713, percentile: 40, quartile: "Q3" },
  { card_id: "bakery_019", card_name: "Brownies", department: "bakery", card_price: "$6.99", card_in_view: 40, card_clicked: 12, share_count: 2, composite_score: 591, percentile: 37, quartile: "Q4" },
  { card_id: "bakery_020", card_name: "Pita Bread", department: "bakery", card_price: "$2.99", card_in_view: 37, card_clicked: 10, share_count: 2, composite_score: 469, percentile: 34, quartile: "Q4" },
  { card_id: "bakery_021", card_name: "English Muffins", department: "bakery", card_price: "$3.49", card_in_view: 34, card_clicked: 8, share_count: 1, composite_score: 347, percentile: 30, quartile: "Q4" },
  { card_id: "bakery_022", card_name: "Pound Cake", department: "bakery", card_price: "$9.99", card_in_view: 31, card_clicked: 6, share_count: 1, composite_score: 267, percentile: 27, quartile: "Q4" },
  { card_id: "bakery_023", card_name: "Tortillas", department: "bakery", card_price: "$2.49", card_in_view: 28, card_clicked: 5, share_count: 0, composite_score: 189, percentile: 24, quartile: "Q4" },
  { card_id: "bakery_024", card_name: "Hot Dog Buns", department: "bakery", card_price: "$1.99", card_in_view: 25, card_clicked: 4, share_count: 0, composite_score: 134, percentile: 20, quartile: "Q4" },
  { card_id: "bakery_025", card_name: "Hamburger Buns", department: "bakery", card_price: "$1.99", card_in_view: 22, card_clicked: 3, share_count: 0, composite_score: 89, percentile: 17, quartile: "Q4" },

  // Produce Department (25 items)
  { card_id: "produce_001", card_name: "Organic Strawberries", department: "produce", card_price: "$3.99", card_in_view: 93, card_clicked: 80, share_count: 42, composite_score: 2789, percentile: 94, quartile: "Q1" },
  { card_id: "produce_002", card_name: "Fresh Avocados", department: "produce", card_price: "$1.99", card_in_view: 90, card_clicked: 76, share_count: 39, composite_score: 2656, percentile: 91, quartile: "Q1" },
  { card_id: "produce_003", card_name: "Baby Spinach", department: "produce", card_price: "$2.49", card_in_view: 87, card_clicked: 72, share_count: 36, composite_score: 2523, percentile: 89, quartile: "Q1" },
  { card_id: "produce_004", card_name: "Sweet Corn", department: "produce", card_price: "$0.79", card_in_view: 84, card_clicked: 68, share_count: 33, composite_score: 2390, percentile: 86, quartile: "Q1" },
  { card_id: "produce_005", card_name: "Roma Tomatoes", department: "produce", card_price: "$1.49/lb", card_in_view: 81, card_clicked: 64, share_count: 30, composite_score: 2257, percentile: 82, quartile: "Q1" },
  { card_id: "produce_006", card_name: "Broccoli Crowns", department: "produce", card_price: "$2.99", card_in_view: 78, card_clicked: 60, share_count: 27, composite_score: 2124, percentile: 79, quartile: "Q2" },
  { card_id: "produce_007", card_name: "Red Bell Peppers", department: "produce", card_price: "$3.49", card_in_view: 75, card_clicked: 56, share_count: 24, composite_score: 1991, percentile: 76, quartile: "Q2" },
  { card_id: "produce_008", card_name: "Cucumber", department: "produce", card_price: "$0.99", card_in_view: 72, card_clicked: 52, share_count: 21, composite_score: 1858, percentile: 73, quartile: "Q2" },
  { card_id: "produce_009", card_name: "Mixed Salad", department: "produce", card_price: "$3.99", card_in_view: 69, card_clicked: 48, share_count: 18, composite_score: 1725, percentile: 68, quartile: "Q2" },
  { card_id: "produce_010", card_name: "Yellow Onions", department: "produce", card_price: "$1.99", card_in_view: 66, card_clicked: 44, share_count: 15, composite_score: 1592, percentile: 66, quartile: "Q2" },
  { card_id: "produce_011", card_name: "Carrots Baby", department: "produce", card_price: "$1.79", card_in_view: 63, card_clicked: 40, share_count: 13, composite_score: 1459, percentile: 63, quartile: "Q2" },
  { card_id: "produce_012", card_name: "Green Grapes", department: "produce", card_price: "$2.99/lb", card_in_view: 60, card_clicked: 36, share_count: 11, composite_score: 1326, percentile: 59, quartile: "Q2" },
  { card_id: "produce_013", card_name: "Celery Stalks", department: "produce", card_price: "$1.49", card_in_view: 57, card_clicked: 32, share_count: 9, composite_score: 1193, percentile: 56, quartile: "Q3" },
  { card_id: "produce_014", card_name: "Potatoes Russet", department: "produce", card_price: "$2.49", card_in_view: 54, card_clicked: 28, share_count: 7, composite_score: 1060, percentile: 53, quartile: "Q3" },
  { card_id: "produce_015", card_name: "Apples Gala", department: "produce", card_price: "$1.99/lb", card_in_view: 51, card_clicked: 24, share_count: 5, composite_score: 927, percentile: 49, quartile: "Q3" },
  { card_id: "produce_016", card_name: "Lettuce Iceberg", department: "produce", card_price: "$1.99", card_in_view: 48, card_clicked: 20, share_count: 4, composite_score: 794, percentile: 46, quartile: "Q3" },
  { card_id: "produce_017", card_name: "Mushrooms White", department: "produce", card_price: "$2.49", card_in_view: 45, card_clicked: 17, share_count: 3, composite_score: 661, percentile: 43, quartile: "Q3" },
  { card_id: "produce_018", card_name: "Zucchini", department: "produce", card_price: "$1.49/lb", card_in_view: 42, card_clicked: 14, share_count: 2, composite_score: 528, percentile: 39, quartile: "Q3" },
  { card_id: "produce_019", card_name: "Limes", department: "produce", card_price: "$0.50", card_in_view: 39, card_clicked: 11, share_count: 2, composite_score: 395, percentile: 36, quartile: "Q4" },
  { card_id: "produce_020", card_name: "Lemons", department: "produce", card_price: "$0.75", card_in_view: 36, card_clicked: 9, share_count: 1, composite_score: 262, percentile: 33, quartile: "Q4" },
  { card_id: "produce_021", card_name: "Cabbage Green", department: "produce", card_price: "$1.99", card_in_view: 33, card_clicked: 7, share_count: 1, composite_score: 201, percentile: 29, quartile: "Q4" },
  { card_id: "produce_022", card_name: "Radishes", department: "produce", card_price: "$1.29", card_in_view: 30, card_clicked: 5, share_count: 0, composite_score: 156, percentile: 26, quartile: "Q4" },
  { card_id: "produce_023", card_name: "Turnips", department: "produce", card_price: "$1.99/lb", card_in_view: 27, card_clicked: 4, share_count: 0, composite_score: 123, percentile: 23, quartile: "Q4" },
  { card_id: "produce_024", card_name: "Parsnips", department: "produce", card_price: "$2.49/lb", card_in_view: 24, card_clicked: 3, share_count: 0, composite_score: 95, percentile: 19, quartile: "Q4" },
  { card_id: "produce_025", card_name: "Rutabaga", department: "produce", card_price: "$1.99/lb", card_in_view: 21, card_clicked: 2, share_count: 0, composite_score: 67, percentile: 16, quartile: "Q4" },

  // Meat Department (25 items)
  { card_id: "meat_001", card_name: "Premium Ribeye", department: "meat", card_price: "$15.99/lb", card_in_view: 92, card_clicked: 79, share_count: 41, composite_score: 2745, percentile: 93, quartile: "Q1" },
  { card_id: "meat_002", card_name: "Ground Beef 80/20", department: "meat", card_price: "$4.99/lb", card_in_view: 89, card_clicked: 75, share_count: 38, composite_score: 2612, percentile: 90, quartile: "Q1" },
  { card_id: "meat_003", card_name: "Chicken Breast", department: "meat", card_price: "$3.99/lb", card_in_view: 86, card_clicked: 71, share_count: 35, composite_score: 2479, percentile: 88, quartile: "Q1" },
  { card_id: "meat_004", card_name: "Pork Chops", department: "meat", card_price: "$5.99/lb", card_in_view: 83, card_clicked: 67, share_count: 32, composite_score: 2346, percentile: 85, quartile: "Q1" },
  { card_id: "meat_005", card_name: "Sirloin Steak", department: "meat", card_price: "$8.99/lb", card_in_view: 80, card_clicked: 63, share_count: 29, composite_score: 2213, percentile: 81, quartile: "Q1" },
  { card_id: "meat_006", card_name: "Baby Back Ribs", department: "meat", card_price: "$7.99/lb", card_in_view: 77, card_clicked: 59, share_count: 26, composite_score: 2080, percentile: 78, quartile: "Q2" },
  { card_id: "meat_007", card_name: "Chicken Thighs", department: "meat", card_price: "$2.99/lb", card_in_view: 74, card_clicked: 55, share_count: 23, composite_score: 1947, percentile: 75, quartile: "Q2" },
  { card_id: "meat_008", card_name: "Ground Turkey", department: "meat", card_price: "$4.49/lb", card_in_view: 71, card_clicked: 51, share_count: 20, composite_score: 1814, percentile: 71, quartile: "Q2" },
  { card_id: "meat_009", card_name: "Beef Brisket", department: "meat", card_price: "$6.99/lb", card_in_view: 68, card_clicked: 47, share_count: 17, composite_score: 1681, percentile: 68, quartile: "Q2" },
  { card_id: "meat_010", card_name: "Pork Shoulder", department: "meat", card_price: "$3.99/lb", card_in_view: 65, card_clicked: 43, share_count: 14, composite_score: 1548, percentile: 65, quartile: "Q2" },
  { card_id: "meat_011", card_name: "Chicken Wings", department: "meat", card_price: "$4.99/lb", card_in_view: 62, card_clicked: 39, share_count: 12, composite_score: 1415, percentile: 61, quartile: "Q2" },
  { card_id: "meat_012", card_name: "Italian Sausage", department: "meat", card_price: "$5.49/lb", card_in_view: 59, card_clicked: 35, share_count: 10, composite_score: 1282, percentile: 58, quartile: "Q2" },
  { card_id: "meat_013", card_name: "Lamb Chops", department: "meat", card_price: "$12.99/lb", card_in_view: 56, card_clicked: 31, share_count: 8, composite_score: 1149, percentile: 55, quartile: "Q3" },
  { card_id: "meat_014", card_name: "Bratwurst", department: "meat", card_price: "$4.99/lb", card_in_view: 53, card_clicked: 27, share_count: 6, composite_score: 1016, percentile: 51, quartile: "Q3" },
  { card_id: "meat_015", card_name: "Beef Short Ribs", department: "meat", card_price: "$8.49/lb", card_in_view: 50, card_clicked: 23, share_count: 4, composite_score: 883, percentile: 48, quartile: "Q3" },
  { card_id: "meat_016", card_name: "Chicken Drumsticks", department: "meat", card_price: "$1.99/lb", card_in_view: 47, card_clicked: 19, share_count: 3, composite_score: 750, percentile: 45, quartile: "Q3" },
  { card_id: "meat_017", card_name: "Pork Tenderloin", department: "meat", card_price: "$7.99/lb", card_in_view: 44, card_clicked: 16, share_count: 2, composite_score: 617, percentile: 41, quartile: "Q3" },
  { card_id: "meat_018", card_name: "Beef Stew Meat", department: "meat", card_price: "$5.99/lb", card_in_view: 41, card_clicked: 13, share_count: 2, composite_score: 484, percentile: 38, quartile: "Q3" },
  { card_id: "meat_019", card_name: "Turkey Breast", department: "meat", card_price: "$6.99/lb", card_in_view: 38, card_clicked: 10, share_count: 1, composite_score: 351, percentile: 35, quartile: "Q4" },
  { card_id: "meat_020", card_name: "Veal Cutlets", department: "meat", card_price: "$14.99/lb", card_in_view: 35, card_clicked: 8, share_count: 1, composite_score: 280, percentile: 31, quartile: "Q4" },
  { card_id: "meat_021", card_name: "Duck Breast", department: "meat", card_price: "$11.99/lb", card_in_view: 32, card_clicked: 6, share_count: 0, composite_score: 218, percentile: 28, quartile: "Q4" },
  { card_id: "meat_022", card_name: "Rabbit Whole", department: "meat", card_price: "$8.99/lb", card_in_view: 29, card_clicked: 4, share_count: 0, composite_score: 167, percentile: 25, quartile: "Q4" },
  { card_id: "meat_023", card_name: "Venison Steak", department: "meat", card_price: "$16.99/lb", card_in_view: 26, card_clicked: 3, share_count: 0, composite_score: 123, percentile: 21, quartile: "Q4" },
  { card_id: "meat_024", card_name: "Quail", department: "meat", card_price: "$12.99/lb", card_in_view: 23, card_clicked: 2, share_count: 0, composite_score: 89, percentile: 18, quartile: "Q4" },
  { card_id: "meat_025", card_name: "Ostrich Fillet", department: "meat", card_price: "$24.99/lb", card_in_view: 20, card_clicked: 1, share_count: 0, composite_score: 54, percentile: 14, quartile: "Q4" }
];

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
  },

  // Store Hierarchy and Regional Structure
  store_hierarchy: {
    all_stores: {
      id: "all_stores",
      name: "All Stores",
      type: "all",
      total_count: 50,
      description: "All stores in the network"
    },
    version_groups: [
      {
        id: "northeast",
        name: "Northeast Version-Group",
        type: "version-group",
        store_count: 15,
        stores: ["001", "002", "003", "004", "005", "006", "007", "008", "009", "010", "011", "012", "013", "014", "015"],
        cities: ["New York", "Boston", "Philadelphia", "Hartford", "Albany"]
      },
      {
        id: "southeast",
        name: "Southeast Version-Group",
        type: "version-group",
        store_count: 12,
        stores: ["016", "017", "018", "019", "020", "021", "022", "023", "024", "025", "026", "027"],
        cities: ["Atlanta", "Miami", "Charlotte", "Jacksonville", "Tampa"]
      },
      {
        id: "midwest",
        name: "Midwest Version-Group",
        type: "version-group",
        store_count: 10,
        stores: ["028", "029", "030", "031", "032", "033", "034", "035", "036", "037"],
        cities: ["Chicago", "Detroit", "Cleveland", "Milwaukee", "Indianapolis"]
      },
      {
        id: "west",
        name: "West Version-Group",
        type: "version-group",
        store_count: 13,
        stores: ["038", "039", "040", "041", "042", "043", "044", "045", "046", "047", "048", "049", "050"],
        cities: ["Los Angeles", "San Francisco", "Seattle", "Phoenix", "Denver"]
      }
    ],
    individual_stores: [
      { id: "001", name: "Store 001 - Manhattan", versionGroup: "northeast", city: "New York", type: "store" },
      { id: "002", name: "Store 002 - Brooklyn", versionGroup: "northeast", city: "New York", type: "store" },
      { id: "003", name: "Store 003 - Boston Downtown", versionGroup: "northeast", city: "Boston", type: "store" },
      { id: "004", name: "Store 004 - Boston North", versionGroup: "northeast", city: "Boston", type: "store" },
      { id: "005", name: "Store 005 - Philadelphia Center", versionGroup: "northeast", city: "Philadelphia", type: "store" },
      { id: "006", name: "Store 006 - Philadelphia West", versionGroup: "northeast", city: "Philadelphia", type: "store" },
      { id: "007", name: "Store 007 - Hartford", versionGroup: "northeast", city: "Hartford", type: "store" },
      { id: "008", name: "Store 008 - Albany", versionGroup: "northeast", city: "Albany", type: "store" },
      { id: "009", name: "Store 009 - Syracuse", versionGroup: "northeast", city: "Syracuse", type: "store" },
      { id: "010", name: "Store 010 - Buffalo", versionGroup: "northeast", city: "Buffalo", type: "store" },
      { id: "011", name: "Store 011 - Queens", versionGroup: "northeast", city: "New York", type: "store" },
      { id: "012", name: "Store 012 - Bronx", versionGroup: "northeast", city: "New York", type: "store" },
      { id: "013", name: "Store 013 - Boston South", versionGroup: "northeast", city: "Boston", type: "store" },
      { id: "014", name: "Store 014 - Philadelphia East", versionGroup: "northeast", city: "Philadelphia", type: "store" },
      { id: "015", name: "Store 015 - Newark", versionGroup: "northeast", city: "Newark", type: "store" },

      { id: "016", name: "Store 016 - Atlanta Downtown", versionGroup: "southeast", city: "Atlanta", type: "store" },
      { id: "017", name: "Store 017 - Atlanta North", versionGroup: "southeast", city: "Atlanta", type: "store" },
      { id: "018", name: "Store 018 - Miami Beach", versionGroup: "southeast", city: "Miami", type: "store" },
      { id: "019", name: "Store 019 - Miami Downtown", versionGroup: "southeast", city: "Miami", type: "store" },
      { id: "020", name: "Store 020 - Charlotte Center", versionGroup: "southeast", city: "Charlotte", type: "store" },
      { id: "021", name: "Store 021 - Charlotte South", versionGroup: "southeast", city: "Charlotte", type: "store" },
      { id: "022", name: "Store 022 - Jacksonville", versionGroup: "southeast", city: "Jacksonville", type: "store" },
      { id: "023", name: "Store 023 - Tampa", versionGroup: "southeast", city: "Tampa", type: "store" },
      { id: "024", name: "Store 024 - Orlando", versionGroup: "southeast", city: "Orlando", type: "store" },
      { id: "025", name: "Store 025 - Fort Lauderdale", versionGroup: "southeast", city: "Fort Lauderdale", type: "store" },
      { id: "026", name: "Store 026 - Savannah", versionGroup: "southeast", city: "Savannah", type: "store" },
      { id: "027", name: "Store 027 - Nashville", versionGroup: "southeast", city: "Nashville", type: "store" },

      { id: "028", name: "Store 028 - Chicago Loop", versionGroup: "midwest", city: "Chicago", type: "store" },
      { id: "029", name: "Store 029 - Chicago North", versionGroup: "midwest", city: "Chicago", type: "store" },
      { id: "030", name: "Store 030 - Detroit Downtown", versionGroup: "midwest", city: "Detroit", type: "store" },
      { id: "031", name: "Store 031 - Detroit West", versionGroup: "midwest", city: "Detroit", type: "store" },
      { id: "032", name: "Store 032 - Cleveland", versionGroup: "midwest", city: "Cleveland", type: "store" },
      { id: "033", name: "Store 033 - Milwaukee", versionGroup: "midwest", city: "Milwaukee", type: "store" },
      { id: "034", name: "Store 034 - Indianapolis", versionGroup: "midwest", city: "Indianapolis", type: "store" },
      { id: "035", name: "Store 035 - Columbus", versionGroup: "midwest", city: "Columbus", type: "store" },
      { id: "036", name: "Store 036 - Cincinnati", versionGroup: "midwest", city: "Cincinnati", type: "store" },
      { id: "037", name: "Store 037 - St. Louis", versionGroup: "midwest", city: "St. Louis", type: "store" },

      { id: "038", name: "Store 038 - Los Angeles Downtown", versionGroup: "west", city: "Los Angeles", type: "store" },
      { id: "039", name: "Store 039 - Los Angeles West", versionGroup: "west", city: "Los Angeles", type: "store" },
      { id: "040", name: "Store 040 - San Francisco", versionGroup: "west", city: "San Francisco", type: "store" },
      { id: "041", name: "Store 041 - Oakland", versionGroup: "west", city: "Oakland", type: "store" },
      { id: "042", name: "Store 042 - Seattle Downtown", versionGroup: "west", city: "Seattle", type: "store" },
      { id: "043", name: "Store 043 - Seattle North", versionGroup: "west", city: "Seattle", type: "store" },
      { id: "044", name: "Store 044 - Phoenix", versionGroup: "west", city: "Phoenix", type: "store" },
      { id: "045", name: "Store 045 - Denver", versionGroup: "west", city: "Denver", type: "store" },
      { id: "046", name: "Store 046 - Portland", versionGroup: "west", city: "Portland", type: "store" },
      { id: "047", name: "Store 047 - San Diego", versionGroup: "west", city: "San Diego", type: "store" },
      { id: "048", name: "Store 048 - Las Vegas", versionGroup: "west", city: "Las Vegas", type: "store" },
      { id: "049", name: "Store 049 - Sacramento", versionGroup: "west", city: "Sacramento", type: "store" },
      { id: "050", name: "Store 050 - Salt Lake City", versionGroup: "west", city: "Salt Lake City", type: "store" }
    ]
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