/**
 * Data Service for Prototype_003
 * Defines the interface and data structure that data engineers need to implement
 * This service simulates the expected API endpoints and data formats
 */

class DataService {
  constructor() {
    this.baseUrl = '/api/v1'; // Future API endpoint
    this.mockGenerator = new EnhancedMockDataGenerator();
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get circular interaction data
   * This is the main data table that data engineers need to populate
   *
   * Expected data source: Digital Circular Interaction data structure
   */
  async getCircularInteractionData(filters = {}) {
    const cacheKey = `interaction_${JSON.stringify(filters)}`;

    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    // In production, this would be an API call:
    // const response = await fetch(`${this.baseUrl}/circular-interactions`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(filters)
    // });
    // return response.json();

    // For prototype, generate mock data
    const data = this.mockGenerator.generateCircularInteractionData(
      filters.week_id || 'w36',
      filters.limit || 500
    );

    // Apply filters
    let filteredData = data;

    if (filters.store_id) {
      filteredData = filteredData.filter(item => item.store_id === filters.store_id);
    }

    if (filters.category) {
      filteredData = filteredData.filter(item => item.marketing_category === filters.category);
    }

    if (filters.card_size_code) {
      filteredData = filteredData.filter(item => item.card_size_code === filters.card_size_code);
    }

    if (filters.deal_type) {
      filteredData = filteredData.filter(item => item.deal_type === filters.deal_type);
    }

    // Cache result
    this.cache.set(cacheKey, {
      data: filteredData,
      timestamp: Date.now()
    });

    return filteredData;
  }

  /**
   * Get aggregated dashboard KPIs
   * Data engineers should provide pre-calculated KPI values for performance
   */
  async getDashboardKPIs(weekId = 'w36') {
    const cacheKey = `kpis_${weekId}`;

    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    // In production:
    // const response = await fetch(`${this.baseUrl}/dashboard/kpis/${weekId}`);
    // return response.json();

    // For prototype, calculate from interaction data
    const interactionData = await this.getCircularInteractionData({ week_id: weekId });
    const kpis = this.mockGenerator.generateDashboardKPIs(interactionData);

    this.cache.set(cacheKey, {
      data: kpis,
      timestamp: Date.now()
    });

    return kpis;
  }

  /**
   * Get year-to-date performance metrics
   */
  async getYTDMetrics() {
    const cacheKey = 'ytd_metrics';

    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    // In production:
    // const response = await fetch(`${this.baseUrl}/dashboard/ytd`);
    // return response.json();

    const data = this.mockGenerator.generateYTDData();

    this.cache.set(cacheKey, {
      data: data,
      timestamp: Date.now()
    });

    return data;
  }

  /**
   * Get category performance analysis
   */
  async getCategoryAnalytics(weekId = 'w36') {
    const interactionData = await this.getCircularInteractionData({ week_id: weekId });

    const categoryAnalytics = this.aggregateByCategory(interactionData);

    return {
      categories: categoryAnalytics,
      trends: this.calculateCategoryTrends(categoryAnalytics),
      insights: this.generateCategoryInsights(categoryAnalytics)
    };
  }

  /**
   * Get store performance comparison
   */
  async getStoreAnalytics(weekId = 'w36') {
    const interactionData = await this.getCircularInteractionData({ week_id: weekId });

    return this.aggregateByStore(interactionData);
  }

  /**
   * Get promotion size analysis
   */
  async getSizeAnalytics(weekId = 'w36') {
    const interactionData = await this.getCircularInteractionData({ week_id: weekId });

    return this.aggregateBySize(interactionData);
  }

  /**
   * Get time series data for trends
   */
  async getTimeSeriesData(metric = 'engagement_score', weeks = ['w34', 'w35', 'w36']) {
    const timeSeriesData = {};

    for (const weekId of weeks) {
      const data = await this.getCircularInteractionData({ week_id: weekId });
      timeSeriesData[weekId] = this.calculateWeeklyAggregate(data, metric);
    }

    return timeSeriesData;
  }

  // Aggregation methods that data engineers should implement in the backend
  aggregateByCategory(data) {
    const categories = {};

    data.forEach(item => {
      if (!categories[item.marketing_category]) {
        categories[item.marketing_category] = {
          name: item.marketing_category,
          totalImpressions: 0,
          totalViews: 0,
          totalClicks: 0,
          totalAddToList: 0,
          totalShares: 0,
          engagementScore: 0,
          promotionCount: 0
        };
      }

      const cat = categories[item.marketing_category];
      cat.totalImpressions += item.impressions;
      cat.totalViews += item.views;
      cat.totalClicks += item.clicks;
      cat.totalAddToList += item.add_to_list;
      cat.totalShares += item.shares;
      cat.engagementScore += item.engagement_score;
      cat.promotionCount++;
    });

    // Calculate rates
    Object.values(categories).forEach(cat => {
      cat.viewRate = cat.totalViews / cat.totalImpressions;
      cat.clickRate = cat.totalClicks / cat.totalViews;
      cat.atlRate = cat.totalAddToList / cat.totalClicks;
      cat.avgEngagementScore = cat.engagementScore / cat.promotionCount;
    });

    return Object.values(categories);
  }

  aggregateByStore(data) {
    const stores = {};

    data.forEach(item => {
      if (!stores[item.store_id]) {
        stores[item.store_id] = {
          storeId: item.store_id,
          storeName: item.store_name,
          region: item.store_region,
          tier: item.store_tier,
          totalImpressions: 0,
          totalViews: 0,
          totalClicks: 0,
          totalAddToList: 0,
          engagementScore: 0,
          promotionCount: 0
        };
      }

      const store = stores[item.store_id];
      store.totalImpressions += item.impressions;
      store.totalViews += item.views;
      store.totalClicks += item.clicks;
      store.totalAddToList += item.add_to_list;
      store.engagementScore += item.engagement_score;
      store.promotionCount++;
    });

    // Calculate rates
    Object.values(stores).forEach(store => {
      store.viewRate = store.totalViews / store.totalImpressions;
      store.clickRate = store.totalClicks / store.totalViews;
      store.atlRate = store.totalAddToList / store.totalClicks;
      store.avgEngagementScore = store.engagementScore / store.promotionCount;
    });

    return Object.values(stores);
  }

  aggregateBySize(data) {
    const sizes = {};

    data.forEach(item => {
      if (!sizes[item.card_size_code]) {
        sizes[item.card_size_code] = {
          sizeCode: item.card_size_code,
          footprint: item.card_footprint,
          totalImpressions: 0,
          totalViews: 0,
          totalClicks: 0,
          totalAddToList: 0,
          engagementScore: 0,
          promotionCount: 0
        };
      }

      const size = sizes[item.card_size_code];
      size.totalImpressions += item.impressions;
      size.totalViews += item.views;
      size.totalClicks += item.clicks;
      size.totalAddToList += item.add_to_list;
      size.engagementScore += item.engagement_score;
      size.promotionCount++;
    });

    // Calculate efficiency metrics
    Object.values(sizes).forEach(size => {
      size.viewRate = size.totalViews / size.totalImpressions;
      size.clickRate = size.totalClicks / size.totalViews;
      size.atlRate = size.totalAddToList / size.totalClicks;
      size.avgEngagementScore = size.engagementScore / size.promotionCount;
      size.efficiencyScore = size.avgEngagementScore / size.footprint; // ROI per footprint unit
    });

    return Object.values(sizes);
  }

  calculateWeeklyAggregate(data, metric) {
    return {
      total: data.reduce((sum, item) => sum + item[metric], 0),
      average: data.reduce((sum, item) => sum + item[metric], 0) / data.length,
      count: data.length
    };
  }

  calculateCategoryTrends(categories) {
    // In production, this would query historical data
    return categories.map(cat => ({
      category: cat.name,
      fourWeekTrend: [
        cat.avgEngagementScore * 0.92,
        cat.avgEngagementScore * 0.96,
        cat.avgEngagementScore * 0.98,
        cat.avgEngagementScore
      ]
    }));
  }

  generateCategoryInsights(categories) {
    const topPerformer = categories.sort((a, b) => b.avgEngagementScore - a.avgEngagementScore)[0];
    const worstPerformer = categories.sort((a, b) => a.avgEngagementScore - b.avgEngagementScore)[0];

    return {
      topPerformer: {
        category: topPerformer.name,
        score: topPerformer.avgEngagementScore,
        insight: `${topPerformer.name} is your top performing category this week`
      },
      improvementOpportunity: {
        category: worstPerformer.name,
        score: worstPerformer.avgEngagementScore,
        insight: `${worstPerformer.name} has the most room for improvement`
      }
    };
  }

  /**
   * Clear cache - useful for testing
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get data schema for documentation
   * This documents the expected data structure for data engineers
   */
  getDataSchema() {
    return {
      circularInteractionRecord: {
        description: 'Main data table for circular promotion interactions',
        requiredFields: [
          'week_id', 'card_id', 'store_id', 'category', 'card_name',
          'card_deal_price', 'card_size_code', 'impressions', 'views',
          'clicks', 'add_to_list', 'shares'
        ],
        optionalFields: [
          'deal_type', 'position_x', 'position_y', 'expanded_views'
        ],
        calculatedFields: [
          'view_rate', 'click_rate', 'atl_rate', 'engagement_score'
        ]
      },
      kpiAggregates: {
        description: 'Pre-calculated KPI values for dashboard performance',
        weekPerformance: 'Current vs previous week engagement comparison',
        topCategories: 'Ranked categories by performance score',
        alerts: 'Categories performing below threshold',
        dailyTrend: 'Daily engagement accumulation',
        quickWin: 'Best performing size/position combination',
        shareActivity: 'Social sharing engagement metrics'
      }
    };
  }
}

// Export for global access
window.DataService = DataService;