/**
 * Multi-Week Mock Data Generator
 * Generates metrics for weeks 45, 46, 47 across all entities
 */

const MockWeeklyData = {
  // Week definitions
  weeks: {
    'week-45': {
      id: 'week-45',
      label: 'Week 45',
      dateRange: 'Nov 4-10, 2025',
      startDate: '2025-11-04',
      endDate: '2025-11-10'
    },
    'week-46': {
      id: 'week-46',
      label: 'Week 46',
      dateRange: 'Nov 11-17, 2025',
      startDate: '2025-11-11',
      endDate: '2025-11-17'
    },
    'week-47': {
      id: 'week-47',
      label: 'Week 47',
      dateRange: 'Nov 18-24, 2025',
      startDate: '2025-11-18',
      endDate: '2025-11-24'
    }
  },

  // Base metrics for Week 47 (current) - will derive 45, 46 from these
  baseMetrics: {
    // Category base metrics (brand level, week 47)
    categories: {
      'produce': { civ: 145000, cc: 12800, atl: 8900, compositeScore: 847, percentile: 92 },
      'dairy': { civ: 98000, cc: 7200, atl: 5100, compositeScore: 612, percentile: 78 },
      'meat': { civ: 112000, cc: 9800, atl: 7200, compositeScore: 724, percentile: 85 },
      'bakery': { civ: 67000, cc: 5400, atl: 3800, compositeScore: 489, percentile: 65 },
      'frozen': { civ: 134000, cc: 11200, atl: 8100, compositeScore: 798, percentile: 88 },
      'beverages': { civ: 89000, cc: 6800, atl: 4500, compositeScore: 548, percentile: 71 },
      'snacks': { civ: 72000, cc: 5900, atl: 4200, compositeScore: 512, percentile: 68 },
      'household': { civ: 45000, cc: 3200, atl: 2100, compositeScore: 324, percentile: 42 }
    },

    // Entity multipliers (relative to brand total)
    entityMultipliers: {
      'brand-all': 1.0,
      'metro': 0.55,      // Metro region is slightly larger
      'suburban': 0.45,
      'store-101': 0.14,  // Downtown - highest traffic
      'store-102': 0.11,
      'store-103': 0.12,
      'store-104': 0.09,
      'store-105': 0.09,
      'store-201': 0.13,  // Northgate Mall - high traffic
      'store-202': 0.11,
      'store-203': 0.08,
      'store-204': 0.07,
      'store-205': 0.06
    },

    // Week-over-week growth rates (% change from previous week)
    weeklyGrowth: {
      'week-46': { civ: -0.05, cc: -0.04, atl: -0.06 },  // Week 46 vs 45: slight decline
      'week-47': { civ: 0.08, cc: 0.07, atl: 0.065 }     // Week 47 vs 46: growth
    },

    // Category trends (some categories grow, some decline)
    categoryTrends: {
      'produce': { trend: 1.05 },    // Growing
      'dairy': { trend: 1.03 },
      'meat': { trend: 1.06 },
      'bakery': { trend: 0.94 },     // Declining
      'frozen': { trend: 1.04 },
      'beverages': { trend: 1.02 },
      'snacks': { trend: 1.01 },
      'household': { trend: 0.92 }   // Declining
    }
  },

  /**
   * Generate metrics for a specific entity, category, and week
   */
  generateMetrics(entityId, categoryId, weekId) {
    const baseCategory = this.baseMetrics.categories[categoryId];
    if (!baseCategory) return null;

    const entityMult = this.baseMetrics.entityMultipliers[entityId] || 0.1;
    const categoryTrend = this.baseMetrics.categoryTrends[categoryId]?.trend || 1.0;

    // Start with base metrics adjusted for entity
    let civ = Math.round(baseCategory.civ * entityMult);
    let cc = Math.round(baseCategory.cc * entityMult);
    let atl = Math.round(baseCategory.atl * entityMult);

    // Adjust for week (work backwards from week 47)
    if (weekId === 'week-46') {
      const growth = this.baseMetrics.weeklyGrowth['week-47'];
      civ = Math.round(civ / (1 + growth.civ));
      cc = Math.round(cc / (1 + growth.cc));
      atl = Math.round(atl / (1 + growth.atl));
    } else if (weekId === 'week-45') {
      // First go back to week 46
      const growth47 = this.baseMetrics.weeklyGrowth['week-47'];
      civ = Math.round(civ / (1 + growth47.civ));
      cc = Math.round(cc / (1 + growth47.cc));
      atl = Math.round(atl / (1 + growth47.atl));
      // Then back to week 45
      const growth46 = this.baseMetrics.weeklyGrowth['week-46'];
      civ = Math.round(civ / (1 + growth46.civ));
      cc = Math.round(cc / (1 + growth46.cc));
      atl = Math.round(atl / (1 + growth46.atl));
    }

    // Apply category trend variation
    const trendVariation = 1 + (Math.random() * 0.1 - 0.05); // ±5% random variation
    civ = Math.round(civ * trendVariation);
    cc = Math.round(cc * trendVariation);
    atl = Math.round(atl * trendVariation);

    // Calculate derived metrics
    const ctr = cc / civ;
    const compositeScore = Math.round((civ * 0.3 + cc * 0.4 + atl * 0.3) / 100);
    const percentile = Math.min(99, Math.max(1, Math.round(
      baseCategory.percentile + (Math.random() * 10 - 5)
    )));

    return { civ, cc, atl, compositeScore, percentile, ctr: (ctr * 100).toFixed(1) };
  },

  /**
   * Generate promotion metrics
   */
  generatePromotionMetrics(promoId, weekId, entityId = 'brand-all') {
    // Use promo ID to create consistent but varied metrics
    const hash = this.simpleHash(promoId);
    const baseMultiplier = 0.5 + (hash % 100) / 100; // 0.5 to 1.5
    const entityMult = this.baseMetrics.entityMultipliers[entityId] || 0.1;

    // Base metrics for a typical promotion
    let civ = Math.round(15000 * baseMultiplier * entityMult);
    let cc = Math.round(1500 * baseMultiplier * entityMult);
    let atl = Math.round(1000 * baseMultiplier * entityMult);

    // Week adjustments
    if (weekId === 'week-46') {
      civ = Math.round(civ * 0.93);
      cc = Math.round(cc * 0.94);
      atl = Math.round(atl * 0.92);
    } else if (weekId === 'week-45') {
      civ = Math.round(civ * 0.88);
      cc = Math.round(cc * 0.89);
      atl = Math.round(atl * 0.86);
    }

    // Add some randomness
    civ = Math.round(civ * (0.9 + Math.random() * 0.2));
    cc = Math.round(cc * (0.9 + Math.random() * 0.2));
    atl = Math.round(atl * (0.9 + Math.random() * 0.2));

    const compositeScore = Math.round((civ * 0.3 + cc * 0.4 + atl * 0.3) / 10);
    const percentile = Math.min(99, Math.max(1, 50 + Math.round((hash % 50) - 25 + Math.random() * 20)));

    return { civ, cc, atl, compositeScore, percentile };
  },

  /**
   * Simple hash function for consistent randomness
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  },

  /**
   * Get week-over-week comparison data
   */
  getComparison(weekId1, weekId2, entityId, categoryId) {
    const metrics1 = this.generateMetrics(entityId, categoryId, weekId1);
    const metrics2 = this.generateMetrics(entityId, categoryId, weekId2);

    if (!metrics1 || !metrics2) return null;

    return {
      current: metrics1,
      previous: metrics2,
      change: {
        civ: ((metrics1.civ - metrics2.civ) / metrics2.civ * 100).toFixed(1),
        cc: ((metrics1.cc - metrics2.cc) / metrics2.cc * 100).toFixed(1),
        atl: ((metrics1.atl - metrics2.atl) / metrics2.atl * 100).toFixed(1),
        compositeScore: ((metrics1.compositeScore - metrics2.compositeScore) / metrics2.compositeScore * 100).toFixed(1)
      }
    };
  },

  /**
   * Get all data for a specific week and entity
   */
  getWeekData(weekId, entityId = 'brand-all') {
    const week = this.weeks[weekId];
    if (!week) return null;

    const categories = Object.keys(this.baseMetrics.categories).map(catId => ({
      id: catId,
      ...this.generateMetrics(entityId, catId, weekId)
    }));

    // Calculate totals
    const totals = categories.reduce((acc, cat) => {
      acc.civ += cat.civ;
      acc.cc += cat.cc;
      acc.atl += cat.atl;
      return acc;
    }, { civ: 0, cc: 0, atl: 0 });

    totals.ctr = ((totals.cc / totals.civ) * 100).toFixed(1);
    totals.avgScore = Math.round(
      categories.reduce((sum, cat) => sum + cat.compositeScore, 0) / categories.length
    );

    return {
      week,
      entity: entityId,
      totals,
      categories
    };
  },

  /**
   * Get 7-day trend data for a week
   */
  getDailyTrend(weekId) {
    const baseValues = [65, 72, 68, 85, 92, 100, 78];
    const weekMultiplier = weekId === 'week-47' ? 1.0 :
                          weekId === 'week-46' ? 0.95 : 0.90;

    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => ({
      day,
      value: Math.round(baseValues[i] * weekMultiplier * (0.95 + Math.random() * 0.1))
    }));
  },

  /**
   * Get store rankings for an entity
   */
  getStoreRankings(weekId, subBrandId = null) {
    const storeIds = subBrandId ?
      (subBrandId === 'metro' ?
        ['store-101', 'store-102', 'store-103', 'store-104', 'store-105'] :
        ['store-201', 'store-202', 'store-203', 'store-204', 'store-205']
      ) :
      ['store-101', 'store-102', 'store-103', 'store-104', 'store-105',
       'store-201', 'store-202', 'store-203', 'store-204', 'store-205'];

    return storeIds.map(storeId => {
      const metrics = this.generateMetrics(storeId, 'produce', weekId); // Use produce as proxy
      return {
        id: storeId,
        score: metrics.compositeScore,
        percentile: metrics.percentile
      };
    }).sort((a, b) => b.score - a.score);
  }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MockWeeklyData;
}
if (typeof window !== 'undefined') {
  window.MockWeeklyData = MockWeeklyData;
}
