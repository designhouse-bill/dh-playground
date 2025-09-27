/**
 * Enhanced Mock Data Generator for Prototype_003
 * Generates realistic grocery retail circular interaction data
 * Designed to match expected data engineering schema structure
 */

class EnhancedMockDataGenerator {
  constructor() {
    this.seed = 42;

    // Realistic grocery categories from Sedanos analysis
    this.categories = [
      'Featured', 'Farm Fresh', 'Good Food Matters', 'Custom Cuts',
      'Deals For Days', 'Beef Pork Chicken', 'Fresh Is A Promise',
      'Flavors Of The Sea', 'Everyday Living', 'Weekly BOGOs',
      'Beverages', 'Beer And Wine', 'Great Quality Low Prices',
      'Banners', 'Organic Produce', 'Flowers', 'Household Goods'
    ];

    // Card sizes for digital circular layout
    this.cardSizes = [
      { code: '1X1', width: 1, height: 1, footprint: 1 },
      { code: '2X1', width: 2, height: 1, footprint: 2 },
      { code: '1X2', width: 1, height: 2, footprint: 2 },
      { code: '2X2', width: 2, height: 2, footprint: 4 },
      { code: '3X1', width: 3, height: 1, footprint: 3 },
      { code: '3X2', width: 3, height: 2, footprint: 6 },
      { code: '3X3', width: 3, height: 3, footprint: 9 }
    ];

    // Deal types for promotions
    this.dealTypes = [
      'BOGO', '$ Off', '% Off', 'Buy 2 Get 1', 'Multi-Buy',
      'Price Drop', 'Manager Special', 'Digital Coupon'
    ];

    // Store locations for multi-store analysis
    this.stores = [
      { id: 'ST001', name: 'Miami Lakes', region: 'North', tier: 'A' },
      { id: 'ST002', name: 'Kendall', region: 'South', tier: 'A+' },
      { id: 'ST003', name: 'Hialeah', region: 'Central', tier: 'B' },
      { id: 'ST004', name: 'Aventura', region: 'North', tier: 'A' },
      { id: 'ST005', name: 'Homestead', region: 'South', tier: 'B' },
      { id: 'ST006', name: 'Coral Gables', region: 'Central', tier: 'A+' }
    ];

    // Realistic product templates by category
    this.productTemplates = {
      'Featured': [
        { name: 'USDA Choice Beef Chuck Steak', price: 4.99, unit: 'lb' },
        { name: 'Chicken Drumsticks Family Pack', price: 0.79, unit: 'lb' },
        { name: 'Fresh Atlantic Salmon Fillet', price: 8.99, unit: 'lb' }
      ],
      'Farm Fresh': [
        { name: 'Organic Tomatoes On The Vine', price: 2.99, unit: 'lb' },
        { name: 'Fresh Strawberries', price: 3.99, unit: 'container' },
        { name: 'Avocados Hass', price: 1.50, unit: 'each' }
      ],
      'Beverages': [
        { name: 'Coca-Cola 12-Pack Cans', price: 4.99, unit: 'pack' },
        { name: 'Tropicana Orange Juice', price: 3.79, unit: '52oz' },
        { name: 'Dasani Water 24-Pack', price: 5.99, unit: 'case' }
      ],
      'Household Goods': [
        { name: 'Tide Laundry Detergent', price: 12.99, unit: '100oz' },
        { name: 'Charmin Ultra Soft', price: 8.99, unit: '12-roll' },
        { name: 'Bounty Paper Towels', price: 6.99, unit: '6-roll' }
      ]
    };

    // Week definitions for time-series data
    this.weeks = this.generateWeekStructure();
  }

  /**
   * Generate circular interaction records (main data table)
   * Simulates the structure expected from Sedanos spreadsheet
   */
  generateCircularInteractionData(weekId = 'w36', recordCount = 500) {
    const interactions = [];

    for (let i = 0; i < recordCount; i++) {
      const category = this.randomChoice(this.categories);
      const product = this.generateProductData(category);
      const store = this.randomChoice(this.stores);
      const cardSize = this.randomChoice(this.cardSizes);
      const dealType = this.randomChoice(this.dealTypes);

      // Generate engagement metrics
      const impressions = this.randomInt(1000, 50000);
      const views = Math.floor(impressions * this.random(0.05, 0.25));
      const clicks = Math.floor(views * this.random(0.10, 0.35));
      const addToList = Math.floor(clicks * this.random(0.15, 0.45));
      const shares = Math.floor(addToList * this.random(0.02, 0.08));

      const interaction = {
        // Primary identifiers
        week_id: weekId,
        card_id: `CARD_${String(i + 1).padStart(4, '0')}`,
        store_id: store.id,
        store_name: store.name,
        store_region: store.region,
        store_tier: store.tier,

        // Product information
        category: category,
        card_name: product.name,
        card_deal_price: product.price,
        card_deal_unit: product.unit,
        deal_type: dealType,

        // Layout information
        card_size_code: cardSize.code,
        card_width: cardSize.width,
        card_height: cardSize.height,
        card_footprint: cardSize.footprint,
        position_x: this.randomInt(1, 4),
        position_y: this.randomInt(1, 6),
        position_quartile: this.calculatePositionQuartile(),

        // Engagement metrics
        impressions: impressions,
        views: views,
        clicks: clicks,
        add_to_list: addToList,
        shares: shares,
        expanded_views: Math.floor(views * this.random(0.20, 0.60)),

        // Calculated metrics
        view_rate: views / impressions,
        click_rate: clicks / views,
        atl_rate: addToList / clicks,
        share_rate: shares / addToList,
        engagement_score: this.calculateEngagementScore(views, clicks, addToList, impressions),

        // Time information
        created_date: this.getWeekDate(weekId),
        last_updated: new Date().toISOString()
      };

      interactions.push(interaction);
    }

    return interactions;
  }

  /**
   * Generate aggregated KPI data for dashboard
   */
  generateDashboardKPIs(interactionData) {
    const kpis = {
      // Week Performance Status
      weekPerformance: this.calculateWeekPerformance(interactionData),

      // Top Performing Categories
      topCategories: this.calculateTopCategories(interactionData),

      // Underperforming Alerts
      alerts: this.calculateAlerts(interactionData),

      // Daily Trend
      dailyTrend: this.calculateDailyTrend(interactionData),

      // Quick Win Opportunity
      quickWin: this.calculateQuickWin(interactionData),

      // Share Activity Summary
      shareActivity: this.calculateShareActivity(interactionData)
    };

    return kpis;
  }

  /**
   * Generate YTD performance data
   */
  generateYTDData() {
    return {
      traffic: this.randomInt(2500000, 3500000),
      visitors: this.randomInt(450000, 650000),
      marketingHealth: this.randomInt(75, 95),
      shopperReach: this.randomInt(380000, 520000),
      engagementVolume: this.randomInt(1200000, 1800000),
      addToListTotal: this.randomInt(180000, 280000),
      liftFromPromotions: this.randomFloat(15.5, 28.7),
      roiOnPromotions: this.randomFloat(3.2, 5.8)
    };
  }

  /**
   * Calculate week performance metrics
   */
  calculateWeekPerformance(data) {
    const totalEngagement = data.reduce((sum, item) => sum + item.engagement_score, 0);
    const avgEngagement = totalEngagement / data.length;

    return {
      current: Math.round(avgEngagement),
      previous: Math.round(avgEngagement * this.random(0.85, 1.05)),
      change: this.randomInt(-8, 12),
      status: avgEngagement > 80 ? 'positive' : avgEngagement > 60 ? 'neutral' : 'negative'
    };
  }

  /**
   * Calculate top performing categories
   */
  calculateTopCategories(data) {
    const categoryPerformance = {};

    // Aggregate by category
    data.forEach(item => {
      if (!categoryPerformance[item.category]) {
        categoryPerformance[item.category] = {
          name: item.category,
          totalEngagement: 0,
          count: 0
        };
      }
      categoryPerformance[item.category].totalEngagement += item.engagement_score;
      categoryPerformance[item.category].count++;
    });

    // Calculate averages and sort
    const categories = Object.values(categoryPerformance)
      .map(cat => ({
        name: cat.name,
        score: Math.round(cat.totalEngagement / cat.count),
        change: this.randomInt(-15, 15)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    return categories;
  }

  /**
   * Calculate underperforming alerts
   */
  calculateAlerts(data) {
    const categoryPerformance = this.calculateTopCategories(data);
    const threshold = 40;

    const underperforming = categoryPerformance
      .filter(cat => cat.score < threshold)
      .map(cat => ({
        name: cat.name,
        score: cat.score,
        threshold: threshold
      }));

    return {
      count: underperforming.length,
      items: underperforming
    };
  }

  /**
   * Calculate daily trend data
   */
  calculateDailyTrend(data) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const baseScore = 15;
    const values = days.map((day, index) => {
      return Math.round(baseScore + (index * 12) + this.random(-3, 5));
    });

    return {
      labels: days,
      values: values
    };
  }

  /**
   * Calculate quick win opportunity
   */
  calculateQuickWin(data) {
    const sizePerformance = {};

    data.forEach(item => {
      if (!sizePerformance[item.card_size_code]) {
        sizePerformance[item.card_size_code] = [];
      }
      sizePerformance[item.card_size_code].push(item.engagement_score);
    });

    // Find best performing size
    let bestSize = '2X1';
    let bestPerformance = 0;

    Object.entries(sizePerformance).forEach(([size, scores]) => {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (avg > bestPerformance) {
        bestPerformance = avg;
        bestSize = size;
      }
    });

    return {
      insight: `${bestSize} promotions in top position performing ${Math.round(bestPerformance - 60)}% better`,
      action: 'Apply to underperforming beverages category'
    };
  }

  /**
   * Calculate share activity metrics
   */
  calculateShareActivity(data) {
    const totalShares = data.reduce((sum, item) => sum + item.shares, 0);
    const previousShares = Math.round(totalShares * this.random(0.88, 1.08));

    return {
      current: totalShares,
      previous: previousShares,
      change: Math.round(((totalShares - previousShares) / previousShares) * 100)
    };
  }

  // Utility methods
  calculateEngagementScore(views, clicks, addToList, impressions) {
    const viewWeight = 0.3;
    const clickWeight = 0.4;
    const atlWeight = 0.3;

    const viewScore = (views / impressions) * 100;
    const clickScore = views > 0 ? (clicks / views) * 100 : 0;
    const atlScore = clicks > 0 ? (addToList / clicks) * 100 : 0;

    return Math.round(
      (viewScore * viewWeight) +
      (clickScore * clickWeight) +
      (atlScore * atlWeight)
    );
  }

  calculatePositionQuartile() {
    const quartiles = ['Top', 'Upper Mid', 'Lower Mid', 'Bottom'];
    return this.randomChoice(quartiles);
  }

  generateProductData(category) {
    const templates = this.productTemplates[category] || this.productTemplates['Featured'];
    const template = this.randomChoice(templates);

    return {
      name: template.name,
      price: template.price * this.random(0.85, 1.15),
      unit: template.unit
    };
  }

  generateWeekStructure() {
    const weeks = {};
    for (let i = 30; i <= 40; i++) {
      weeks[`w${i}`] = {
        id: `w${i}`,
        label: `Week ${i}`,
        startDate: new Date(2024, 6, (i - 30) * 7 + 1),
        endDate: new Date(2024, 6, (i - 30) * 7 + 7)
      };
    }
    return weeks;
  }

  getWeekDate(weekId) {
    const week = this.weeks[weekId];
    return week ? week.startDate.toISOString() : new Date().toISOString();
  }

  // Random utilities with seeded generation
  random(min = 0, max = 1) {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return min + (this.seed / 233280) * (max - min);
  }

  randomInt(min, max) {
    return Math.floor(this.random(min, max + 1));
  }

  randomFloat(min, max, decimals = 1) {
    return parseFloat(this.random(min, max).toFixed(decimals));
  }

  randomChoice(array) {
    return array[Math.floor(this.random() * array.length)];
  }
}

// Export for use
window.EnhancedMockDataGenerator = EnhancedMockDataGenerator;