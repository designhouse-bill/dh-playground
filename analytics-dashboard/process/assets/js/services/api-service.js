/**
 * Mock API Service
 * Implements Analytics API v2 structure with mock data
 */

class AnalyticsAPIService {
  constructor() {
    this.dataGenerator = new MockDataGenerator();
    this.data = this.dataGenerator.getData();
    this.baseURL = '/api';
    this.brandHash = 'your_market_hash';
  }

  // Helper method to create API response envelope
  createResponse(data, meta = {}, errors = []) {
    return {
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta
      },
      errors
    };
  }

  // Helper to find node hash for subbrand
  getNodeHash(subbrand) {
    const circular = this.data.circulars.find(c => c.subbrand === subbrand);
    return circular ? circular.node_hash : 'default_node_hash';
  }

  // 1. Header KPIs (Traffic, Visitors, Marketing Health)
  async getOverview(nodeHash, startDate, endDate) {
    // Simulate API delay
    await this.delay(100);

    // Find matching analytics data
    const analytics = Object.values(this.data.analytics).find(a =>
      a.site_visits > 0 // Just get first available data for now
    ) || this.data.analytics[Object.keys(this.data.analytics)[0]];

    return this.createResponse({
      traffic: analytics.site_visits,
      visitors: analytics.unique_users,
      marketingHealth: analytics.marketing_health
    }, {
      start_date: startDate,
      end_date: endDate,
      node_hash: nodeHash
    });
  }

  // 2. Digital Circular KPIs (Pulse, Engagement, Audience)
  async getCircularOverview(nodeHash, startDate, endDate, versionId = 'all') {
    await this.delay(100);

    // Get circular data for the date range
    const week = this.data.weeks.find(w =>
      w.start_date <= startDate && w.end_date >= endDate
    ) || this.data.weeks[this.data.weeks.length - 1];

    const subbrand = this.data.circulars.find(c => c.node_hash === nodeHash)?.subbrand || this.data.subbrands[0];
    const analyticsKey = `${week.week_id}_${subbrand}_v1`;
    const analytics = this.data.analytics[analyticsKey] || this.data.analytics[Object.keys(this.data.analytics)[0]];

    return this.createResponse({
      pulseScore: analytics.pulse_score,
      engagementRate: analytics.engagement_rate,
      audienceReach: analytics.audience_reach
    }, {
      start_date: startDate,
      end_date: endDate,
      version_id: versionId,
      node_hash: nodeHash
    });
  }

  // 3. Trend Overview (Weekly)
  async getTrend(nodeHash, weekId, weeks = 4, versionId = 'all') {
    await this.delay(100);

    const currentWeekIndex = this.data.weeks.findIndex(w => w.week_id === weekId);
    const startIndex = Math.max(0, currentWeekIndex - weeks + 1);
    const trendWeeks = this.data.weeks.slice(startIndex, currentWeekIndex + 1);

    const subbrand = this.data.circulars.find(c => c.node_hash === nodeHash)?.subbrand || this.data.subbrands[0];

    const labels = trendWeeks.map(w => w.week_id);
    const values = trendWeeks.map(w => {
      const analyticsKey = `${w.week_id}_${subbrand}_v1`;
      const analytics = this.data.analytics[analyticsKey];
      return analytics ? analytics.engagement_rate : 0.5 + (Math.random() * 0.3);
    });

    return this.createResponse({
      labels,
      values
    }, {
      week_id: weekId,
      weeks,
      version_id: versionId,
      node_hash: nodeHash
    });
  }

  // 4. Promotion Position Performance (PPP)
  async getPromotionPositionPerformance(nodeHash, startDate, endDate, versionId = 'all') {
    await this.delay(100);

    const promotions = this.dataGenerator.getPromotionsByFilters({
      week_id: this.dateToWeekId(startDate)
    });

    // Calculate quartile distributions
    const total = promotions.length;
    const sorted = promotions.sort((a, b) => b.composite - a.composite);

    const qTop = Math.floor(total * 0.25);
    const qUpperMid = Math.floor(total * 0.25);
    const qLowerMid = Math.floor(total * 0.25);
    const qBottom = total - qTop - qUpperMid - qLowerMid;

    return this.createResponse({
      total,
      qTop,
      qUpperMid,
      qLowerMid,
      qBottom
    }, {
      start_date: startDate,
      end_date: endDate,
      version_id: versionId,
      node_hash: nodeHash
    });
  }

  // 5. Store Lift (Engagement vs Lift)
  async getStorePerformance(nodeHash, startDate, endDate, versionId = 'all') {
    await this.delay(100);

    const stores = this.data.stores.slice(0, 5).map(store => ({
      name: store,
      engagementPct: 0.3 + (Math.random() * 0.4), // 30-70%
      liftPct: 0.2 + (Math.random() * 0.3), // 20-50%
      size: Math.floor(80 + Math.random() * 120) // 80-200
    }));

    return this.createResponse(stores, {
      start_date: startDate,
      end_date: endDate,
      version_id: versionId,
      node_hash: nodeHash
    });
  }

  // 6. Category Performance
  async getCategoryPerformance(nodeHash, startDate, endDate) {
    await this.delay(100);

    const promotions = this.dataGenerator.getPromotionsByFilters({
      week_id: this.dateToWeekId(startDate)
    });

    // Calculate category shares
    const categoryStats = {};
    promotions.forEach(promo => {
      if (!categoryStats[promo.category]) {
        categoryStats[promo.category] = { count: 0, totalComposite: 0 };
      }
      categoryStats[promo.category].count++;
      categoryStats[promo.category].totalComposite += promo.composite;
    });

    const categoryShare = Object.entries(categoryStats)
      .map(([name, stats]) => ({
        name,
        valuePct: Math.round((stats.count / promotions.length) * 100) / 100
      }))
      .sort((a, b) => b.valuePct - a.valuePct)
      .slice(0, 6);

    const categoryTop = Object.entries(categoryStats)
      .map(([name, stats]) => ({
        name,
        value: Math.round(stats.totalComposite / stats.count)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    return this.createResponse({
      categoryShare,
      categoryTop
    }, {
      start_date: startDate,
      end_date: endDate,
      node_hash: nodeHash
    });
  }

  // 7. Promotion Size Metrics
  async getPromotionSizeMetrics(nodeHash, startDate, endDate) {
    await this.delay(100);

    const promotions = this.dataGenerator.getPromotionsByFilters({
      week_id: this.dateToWeekId(startDate)
    });

    // Calculate size class performance
    const sizeStats = { S: [], M: [], L: [] };
    promotions.forEach(promo => {
      sizeStats[promo.size_class].push(promo.composite);
    });

    const sizeMix = Object.entries(sizeStats).map(([size, scores]) => ({
      size,
      count: scores.length,
      percentage: Math.round((scores.length / promotions.length) * 100) / 100
    }));

    const bestSize = Object.entries(sizeStats).map(([size, scores]) => ({
      size,
      avgScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
    })).sort((a, b) => b.avgScore - a.avgScore);

    const expandRate = sizeMix.map(item => ({
      size: item.size,
      rate: 0.1 + (Math.random() * 0.3) // 10-40% expand rate
    }));

    const sizeEffectIndex = 0.8 + (Math.random() * 0.6); // 0.8-1.4

    return this.createResponse({
      sizeMix,
      bestSize,
      expandRate,
      sizeEffectIndex: Math.round(sizeEffectIndex * 100) / 100
    }, {
      start_date: startDate,
      end_date: endDate,
      node_hash: nodeHash
    });
  }

  // 8. Deal Type Effectiveness
  async getDealTypeEffectiveness(nodeHash, startDate, endDate) {
    await this.delay(100);

    const promotions = this.dataGenerator.getPromotionsByFilters({
      week_id: this.dateToWeekId(startDate)
    });

    const dealStats = {};
    promotions.forEach(promo => {
      if (!dealStats[promo.deal_type]) {
        dealStats[promo.deal_type] = { count: 0, totalComposite: 0 };
      }
      dealStats[promo.deal_type].count++;
      dealStats[promo.deal_type].totalComposite += promo.composite;
    });

    const dealEffectiveness = Object.entries(dealStats)
      .map(([dealType, stats]) => ({
        dealType,
        valuePct: Math.round((stats.totalComposite / stats.count / 10000) * 100) / 100 // Normalize to 0-1
      }))
      .sort((a, b) => b.valuePct - a.valuePct);

    return this.createResponse(dealEffectiveness, {
      start_date: startDate,
      end_date: endDate,
      node_hash: nodeHash
    });
  }

  // 9. Promotions Score (Ranked List) - Main data grid endpoint
  async getPromotionScores(nodeHash, startDate, endDate, versionId = 'all', topN = 25) {
    await this.delay(150);

    let promotions = this.dataGenerator.getPromotionsByFilters({
      week_id: this.dateToWeekId(startDate)
    });

    if (versionId !== 'all') {
      promotions = promotions.filter(p => p.version_id === versionId);
    }

    // Sort by composite score and limit
    promotions = promotions
      .sort((a, b) => b.composite - a.composite)
      .slice(0, topN);

    const formattedData = promotions.map(promo => ({
      id: promo.promotion_id,
      title: promo.title,
      name: promo.title,
      category: promo.category,
      dealType: promo.deal_type,
      position: promo.position,
      price: promo.price,
      days: promo.days_active,
      civ: promo.civ,
      cc: promo.cc,
      atl: promo.atl,
      composite: promo.composite,
      percentile: promo.percentile,
      rank: promo.rank,
      rankTotal: promo.rank_total,
      performance: promo.performance,
      thumbnail: promo.thumbnail,
      sizeClass: promo.size_class,
      sizeDimensions: promo.size_dimensions,
      positionRange: promo.position_range,
      shared: promo.is_shared,
      shareOpens: promo.share_opens,
      shareAdds: promo.share_adds,
      expanded: promo.is_expanded,
      expansionClicks: promo.expansion_clicks,
      subbrand: promo.subbrand,
      version: promo.version_id,
      store: promo.store_id
    }));

    return this.createResponse(formattedData, {
      start_date: startDate,
      end_date: endDate,
      version_id: versionId,
      mode: 'composite',
      top_n: topN,
      node_hash: nodeHash
    });
  }

  // 10. Sharing Metrics
  async getSharingMetrics(nodeHash, startDate, endDate) {
    await this.delay(100);

    return this.createResponse({
      sharedCount: Math.floor(200 + Math.random() * 200), // 200-400
      shareOpenRate: Math.round((0.3 + Math.random() * 0.3) * 100) / 100, // 30-60%
      shareAddRate: Math.round((0.15 + Math.random() * 0.25) * 100) / 100  // 15-40%
    }, {
      start_date: startDate,
      end_date: endDate,
      node_hash: nodeHash
    });
  }

  // 11. Aggregate Analytics (for inquiry page insights)
  async getAggregateAnalytics(nodeHash, startDate, endDate, filters = {}) {
    await this.delay(80);

    // Apply any additional filters to the data generator
    let promotions = this.dataGenerator.getPromotionsByFilters({
      week_id: this.dateToWeekId(startDate),
      ...filters
    });

    // Calculate real-time aggregates from filtered data
    const aggregates = this.calculateFilteredAggregates(promotions);

    return this.createResponse(aggregates, {
      start_date: startDate,
      end_date: endDate,
      node_hash: nodeHash,
      filters_applied: filters,
      total_items: promotions.length
    });
  }

  calculateFilteredAggregates(promotions) {
    if (promotions.length === 0) {
      return {
        totalPromotions: 0,
        avgComposite: 0,
        avgPercentile: 0,
        topPerformerPercentile: 0,
        categoryCount: 0,
        shareRate: 0,
        expandRate: 0
      };
    }

    return {
      totalPromotions: promotions.length,
      avgComposite: Math.round(promotions.reduce((sum, p) => sum + p.composite, 0) / promotions.length),
      avgPercentile: Math.round(promotions.reduce((sum, p) => sum + p.percentile, 0) / promotions.length),
      topPerformerPercentile: Math.max(...promotions.map(p => p.percentile)),

      // Category insights
      categoryCount: new Set(promotions.map(p => p.category)).size,
      topCategory: this.getTopCategory(promotions),

      // Size insights
      sizeClassDistribution: this.getSizeDistribution(promotions),
      topSizeClass: this.getTopSizeClass(promotions),

      // Position insights
      positionRangeDistribution: this.getPositionDistribution(promotions),
      avgPosition: Math.round(promotions.reduce((sum, p) => sum + p.position, 0) / promotions.length),

      // Engagement insights
      avgCIV: Math.round(promotions.reduce((sum, p) => sum + p.civ, 0) / promotions.length),
      avgCC: Math.round(promotions.reduce((sum, p) => sum + p.cc, 0) / promotions.length),
      avgATL: Math.round(promotions.reduce((sum, p) => sum + p.atl, 0) / promotions.length),

      // Sharing insights
      shareRate: Math.round((promotions.filter(p => p.is_shared).length / promotions.length) * 100),
      expandRate: Math.round((promotions.filter(p => p.is_expanded).length / promotions.length) * 100),

      // Deal type insights
      dealTypeCount: new Set(promotions.map(p => p.deal_type)).size,
      topDealType: this.getTopDealType(promotions)
    };
  }

  getTopCategory(promotions) {
    const scores = {};
    promotions.forEach(p => {
      if (!scores[p.category]) scores[p.category] = [];
      scores[p.category].push(p.composite);
    });

    let topCat = null;
    let topAvg = 0;
    Object.entries(scores).forEach(([cat, values]) => {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      if (avg > topAvg) {
        topAvg = avg;
        topCat = cat;
      }
    });

    return { name: topCat, avgScore: Math.round(topAvg) };
  }

  getSizeDistribution(promotions) {
    const dist = { S: 0, M: 0, L: 0 };
    promotions.forEach(p => dist[p.size_class]++);
    const total = promotions.length;
    return {
      S: Math.round((dist.S / total) * 100),
      M: Math.round((dist.M / total) * 100),
      L: Math.round((dist.L / total) * 100)
    };
  }

  getTopSizeClass(promotions) {
    const scores = { S: [], M: [], L: [] };
    promotions.forEach(p => scores[p.size_class].push(p.composite));

    let topSize = null;
    let topAvg = 0;
    Object.entries(scores).forEach(([size, values]) => {
      if (values.length > 0) {
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        if (avg > topAvg) {
          topAvg = avg;
          topSize = size;
        }
      }
    });

    return { size: topSize, avgScore: Math.round(topAvg) };
  }

  getPositionDistribution(promotions) {
    const dist = { 'Top': 0, 'Upper Mid': 0, 'Lower Mid': 0, 'Bottom': 0 };
    promotions.forEach(p => dist[p.position_range]++);
    const total = promotions.length;
    return {
      'Top': Math.round((dist['Top'] / total) * 100),
      'Upper Mid': Math.round((dist['Upper Mid'] / total) * 100),
      'Lower Mid': Math.round((dist['Lower Mid'] / total) * 100),
      'Bottom': Math.round((dist['Bottom'] / total) * 100)
    };
  }

  getTopDealType(promotions) {
    const scores = {};
    promotions.forEach(p => {
      if (!scores[p.deal_type]) scores[p.deal_type] = [];
      scores[p.deal_type].push(p.composite);
    });

    let topDeal = null;
    let topAvg = 0;
    Object.entries(scores).forEach(([deal, values]) => {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      if (avg > topAvg) {
        topAvg = avg;
        topDeal = deal;
      }
    });

    return { name: topDeal, avgScore: Math.round(topAvg) };
  }

  // Helper methods
  dateToWeekId(dateString) {
    const date = new Date(dateString);
    const week = this.data.weeks.find(w =>
      new Date(w.start_date) <= date && new Date(w.end_date) >= date
    );
    return week ? week.week_id : this.data.weeks[this.data.weeks.length - 1].week_id;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Convenience methods for specific data needs
  getWeeks() {
    return this.data.weeks;
  }

  getSubbrands() {
    return this.data.subbrands;
  }

  getVersions() {
    return this.data.versions;
  }

  getCategories() {
    return this.data.categories;
  }

  getDealTypes() {
    return this.data.dealTypes;
  }

  getStores() {
    return this.data.stores;
  }

  // Method to get all data for a specific entity
  async getEntityData(subbrand, weekId, versionId = 'all') {
    const nodeHash = this.getNodeHash(subbrand);
    const week = this.data.weeks.find(w => w.week_id === weekId);

    if (!week) {
      throw new Error(`Week ${weekId} not found`);
    }

    const startDate = week.start_date;
    const endDate = week.end_date;

    const [
      overview,
      circularOverview,
      promotions
    ] = await Promise.all([
      this.getOverview(nodeHash, startDate, endDate),
      this.getCircularOverview(nodeHash, startDate, endDate, versionId),
      this.getPromotionScores(nodeHash, startDate, endDate, versionId, 100)
    ]);

    return {
      overview: overview.data,
      circular: circularOverview.data,
      promotions: promotions.data,
      meta: {
        subbrand,
        week_id: weekId,
        version_id: versionId,
        start_date: startDate,
        end_date: endDate,
        node_hash: nodeHash
      }
    };
  }
}

// Create global instance
window.AnalyticsAPI = new AnalyticsAPIService();