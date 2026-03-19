/**
 * Mock Data Generator
 * Generates realistic data matching the API v2 schema and database structure
 */

class MockDataGenerator {
  constructor() {
    // Seeded random for consistent results
    this.seed = 42;

    // Master data arrays - Updated from Sedano's real data
    this.categories = [
      'Featured', 'Farm Fresh', 'Good Food Matters', 'Custom Cuts',
      'Deals For Days', 'Beef Pork Chicken', 'Fresh Is A Promise', 'Flavors Of The Sea',
      'Everyday Living', 'Weekly BOGOs', 'Beverages', 'Beer And Wine',
      'Great Quality Low Prices', 'Banners', 'Organic Produce', 'Flowers', 'Household Goods'
    ];

    // Category performance weights based on Sedano's data
    this.categoryWeights = {
      'Featured': 1.00,
      'Farm Fresh': 0.96,
      'Good Food Matters': 0.74,
      'Custom Cuts': 0.69,
      'Deals For Days': 0.63,
      'Beef Pork Chicken': 0.53,
      'Fresh Is A Promise': 0.52,
      'Flavors Of The Sea': 0.43,
      'Everyday Living': 0.38,
      'Weekly BOGOs': 0.26,
      'Beverages': 0.26,
      'Beer And Wine': 0.26,
      'Great Quality Low Prices': 0.17,
      'Banners': 0.16,
      'Organic Produce': 0.15,
      'Flowers': 0.08,
      'Household Goods': 0.04
    };

    this.dealTypes = [
      'BOGO', '$ Off', '% Off', 'Buy 2 Get 1', 'Multi-Buy'
    ];

    // Realistic product templates based on Sedano's data
    this.productTemplates = {
      'Featured': [
        { name: 'USDA Choice Beef Chuck Under Shoulder Steak', price: 4.99 },
        { name: 'USDA Choice Beef Round Top Round Steak Boneless', price: 5.99 },
        { name: 'Tomato On The Vine', price: 0.99 },
        { name: 'Chicken Drumsticks', price: 0.79 },
        { name: 'Pilon Espresso Coffee Ground Coffee', price: 3.99 }
      ],
      'Farm Fresh': [
        { name: 'Seedless Watermelon', price: 2.99 },
        { name: 'Mango', price: 5.00 },
        { name: 'Red Onion 2lb', price: 4.00 },
        { name: 'Butternut Squash', price: 1.19 },
        { name: 'Baby Bella Mushrooms 8oz', price: 3.00 },
        { name: 'White Onions 2lb', price: 4.00 },
        { name: 'Baking Potatoes', price: 0.79 },
        { name: 'Pineapple', price: 5.00 },
        { name: 'Limes 2lb', price: 3.49 }
      ],
      'Beef Pork Chicken': [
        { name: 'USDA Choice Beef Round Top Round London Broil Roast', price: 5.99 },
        { name: 'USDA Inspected Fresh Pork Shoulder Picnic Cut in Cubes', price: 1.99 },
        { name: 'USDA Choice Beef For Stew', price: 6.99 },
        { name: 'USDA Choice Beef Loin Sirloin Steak Boneless', price: 10.99 },
        { name: 'Pork Tender Loin', price: 3.99 },
        { name: 'Beef Chuck Neck Bones', price: 3.99 }
      ],
      'Flavors Of The Sea': [
        { name: 'Panamei Seafood X Jumbo 16 20 Uncooked Ez Peel Tail On Shrimp', price: 8.99 },
        { name: 'Swai Fillet', price: 3.99 },
        { name: 'Panamei Cooked Shrimp 90/110 ct', price: 6.99 },
        { name: 'King Fish Steak', price: 7.99 },
        { name: 'Tuna Loin', price: 8.99 },
        { name: 'Whole Octopus', price: 7.99 }
      ],
      'Beverages': [
        { name: 'Gatorade Sports Drinks 6 CT 12 OZ Select Varieties', price: 3.99 },
        { name: 'Pepsi or Schweppes Soda 6 CT 7.5 OZ Select Varieties', price: 3.99 },
        { name: 'Canada Dry, 7UP, or Sunkist Soda 2 LT Select Varieties', price: 5.00 },
        { name: 'Mistic Carrot Drinks 64 OZ Select Varieties', price: 4.00 },
        { name: 'Kool-Aid Bursts Drinks 6 CT Select Varieties', price: 4.00 }
      ],
      'Good Food Matters': [
        { name: 'Able Farm Sweetened Condensed Cream', price: 0.99 },
        { name: 'Pompeian 100% Grapeseed Oil 24 Fl Oz', price: 6.99 },
        { name: 'Cremica Marie Cookies 7 Oz', price: 0.79 },
        { name: 'Knorr Bouillon, Chicken Flavor', price: 5.00 },
        { name: 'Pompeian Extra Virgin Olive Oil 68 OZ Select Varieties', price: 23.99 }
      ]
    };

    this.subbrands = [
      'YOUR Market Miami', 'YOUR Market Orlando', 'YOUR Market Tampa'
    ];

    this.versions = ['Version A', 'Version B', 'Version C'];

    this.stores = [
      'Store 101', 'Store 203', 'Store 310', 'Store 412', 'Store 509',
      'Store 618', 'Store 725', 'Store 834', 'Store 947', 'Store 156'
    ];

    this.sizeClasses = ['S', 'M', 'L'];

    // Generate week data for last 5 weeks
    this.weeks = this.generateWeeks();

    // Generate master datasets
    this.circulars = this.generateCirculars();
    this.promotions = this.generatePromotions();
    this.analytics = this.generateAnalytics();
  }

  // Seeded random number generator
  random() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  randomInt(min, max) {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }

  randomChoice(array) {
    return array[Math.floor(this.random() * array.length)];
  }

  generateWeeks() {
    const weeks = [];
    const now = new Date('2025-09-15'); // Fixed date for consistency

    for (let i = 4; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7));

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const weekNumber = 36 - i; // Week 32-36

      weeks.push({
        week_id: `2025-W${weekNumber}`,
        week_number: weekNumber,
        start_date: weekStart.toISOString().split('T')[0],
        end_date: weekEnd.toISOString().split('T')[0],
        label: `Week ${weekNumber} • ${this.formatDateRange(weekStart, weekEnd)}`
      });
    }

    return weeks;
  }

  formatDateRange(start, end) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const startMonth = monthNames[start.getMonth()];
    const endMonth = monthNames[end.getMonth()];

    if (startMonth === endMonth) {
      return `${startMonth} ${start.getDate()}-${end.getDate()}`;
    } else {
      return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}`;
    }
  }

  generateCirculars() {
    const circulars = [];

    this.weeks.forEach(week => {
      this.subbrands.forEach(subbrand => {
        this.versions.forEach((version, versionIndex) => {
          const circularId = `circ_${week.week_number}_${subbrand.replace(/\s+/g, '_').toLowerCase()}_${versionIndex + 1}`;

          circulars.push({
            circular_id: circularId,
            week_id: week.week_id,
            subbrand: subbrand,
            version_id: `v${versionIndex + 1}`,
            version_name: version,
            start_date: week.start_date,
            end_date: week.end_date,
            is_active: week.week_number === 36, // Only current week is active
            brand_hash: 'your_market_hash',
            node_hash: this.generateNodeHash(subbrand)
          });
        });
      });
    });

    return circulars;
  }

  generateNodeHash(subbrand) {
    // Generate consistent hash for subbrand
    let hash = 0;
    for (let i = 0; i < subbrand.length; i++) {
      const char = subbrand.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).substring(0, 8);
  }

  generatePromotions() {
    const promotions = [];
    let promotionCounter = 1;

    this.circulars.forEach(circular => {
      // Generate 25-35 promotions per circular to ensure enough data for 100+ filter
      const promoCount = this.randomInt(25, 35);

      for (let i = 0; i < promoCount; i++) {
        const category = this.randomChoice(this.categories);
        const dealType = this.randomChoice(this.dealTypes);
        const sizeClass = this.randomChoice(this.sizeClasses);

        // Generate realistic metrics with power law distribution
        const basePerformance = this.generatePowerLawPerformance();
        const categoryMultiplier = this.getCategoryMultiplier(category);
        const versionMultiplier = this.getVersionMultiplier(circular.version_id);
        const sizeMultiplier = this.getSizeMultiplier(sizeClass);

        const adjustedPerformance = Math.min(1.0, basePerformance * categoryMultiplier * versionMultiplier * sizeMultiplier);

        // Generate CIV, CC, ATL based on realistic ranges from Sedano's data
        const civ = this.randomInt(50, 1000); // Wider realistic range
        const cc = Math.floor(civ * (0.03 + adjustedPerformance * 0.12)); // 3-15% click rate
        const atl = Math.floor(cc * (0.08 + adjustedPerformance * 0.32)); // 8-40% add rate

        const composite = this.calculateCompositeScore(civ, cc, atl);
        const percentile = this.calculatePercentile(composite);

        const position = this.randomInt(1, 100);
        const promotionId = `promo_${circular.circular_id}_${position.toString().padStart(3, '0')}`;

        // Get realistic product name and price
        const productData = this.getRealisticProduct(category);
        const price = productData.price;
        const days = this.randomChoice([3, 5, 7]);

        promotions.push({
          promotion_id: promotionId,
          circular_id: circular.circular_id,
          week_id: circular.week_id,
          subbrand: circular.subbrand,
          version_id: circular.version_id,
          brand_hash: circular.brand_hash,
          node_hash: circular.node_hash,

          // Promotion details
          title: productData.name,
          category: category,
          deal_type: dealType,
          position: position,
          position_id: `pos_${position}`,
          price: price,
          days_active: days,
          size_class: sizeClass,
          size_dimensions: this.generateSizeDimensions(sizeClass),

          // Core metrics
          civ: civ,
          cc: cc,
          atl: atl,
          composite: composite,
          percentile: percentile,

          // Additional fields
          upc: this.generateUPC(),
          store_id: this.randomChoice(this.stores),
          thumbnail: this.generateThumbnail(promotionCounter),

          // Extended data points for advanced filtering
          is_shared: this.random() < 0.3, // 30% sharing rate
          share_opens: this.randomInt(0, Math.floor(civ * 0.1)), // Up to 10% of views
          share_adds: this.randomInt(0, Math.floor(atl * 0.15)), // Up to 15% of adds
          is_expanded: this.random() < 0.28, // 28% expansion rate
          expansion_clicks: this.randomInt(0, Math.floor(cc * 0.2)), // Up to 20% of clicks

          // Position range calculation
          position_range: this.calculatePositionRange(position),

          // Dates
          start_date: circular.start_date,
          end_date: circular.end_date
        });

        promotionCounter++;
      }
    });

    // Calculate performance rankings
    this.calculatePerformanceRankings(promotions);

    return promotions;
  }

  getCategoryMultiplier(category) {
    // Use the realistic category weights from Sedano's data
    return this.categoryWeights[category] || 0.5;
  }

  getVersionMultiplier(versionId) {
    const multipliers = {
      'v1': 1.0,
      'v2': 1.1,
      'v3': 0.9
    };
    return multipliers[versionId] || 1.0;
  }

  calculateCompositeScore(civ, cc, atl) {
    return (civ * 1) + (cc * 10) + (atl * 50);
  }

  calculatePercentile(compositeScore) {
    // Adjusted max possible to be more realistic
    const maxPossible = (1000 * 1) + (150 * 10) + (70 * 50); // 5500
    return Math.min(Math.round((compositeScore / maxPossible) * 100), 100);
  }

  // Generate power law distributed performance (most items low, few high)
  generatePowerLawPerformance() {
    const rand = this.random();
    // Power law with exponent ~2 (Sedano's pattern: 100, 96, 82, 58, 57, 55...)
    return Math.pow(rand, 2.5);
  }

  // Size class multipliers based on Sedano's correlation (larger = better engagement)
  getSizeMultiplier(sizeClass) {
    const multipliers = {
      'S': 0.8,  // 1x1 baseline
      'M': 1.1,  // 2x2, 2x1 better
      'L': 1.3   // 3x2, 3x3 best
    };
    return multipliers[sizeClass] || 1.0;
  }

  // Get realistic product data for category
  getRealisticProduct(category) {
    const templates = this.productTemplates[category];
    if (templates && templates.length > 0) {
      return this.randomChoice(templates);
    }

    // Fallback for categories without templates
    return {
      name: `${category} Special Item`,
      price: this.randomInt(99, 1599) / 100
    };
  }

  calculatePerformanceRankings(promotions) {
    // Sort by composite score descending
    const sorted = [...promotions].sort((a, b) => b.composite - a.composite);

    // Assign rankings
    sorted.forEach((promotion, index) => {
      const rank = index + 1;
      const total = promotions.length;
      const performance = Math.round(((total - rank + 1) / total) * 100);

      // Update original promotion object
      const originalPromo = promotions.find(p => p.promotion_id === promotion.promotion_id);
      originalPromo.rank = rank;
      originalPromo.rank_total = total;
      originalPromo.performance = performance;
    });
  }

  generateSizeDimensions(sizeClass) {
    const dimensions = {
      'S': ['1x1', '1x2', '2x1'],
      'M': ['2x2', '2x3', '3x2'],
      'L': ['3x3', '3x4', '4x3', '4x4']
    };
    return this.randomChoice(dimensions[sizeClass]);
  }

  generateUPC() {
    return this.randomInt(100000000000, 999999999999).toString();
  }

  generateThumbnail(index) {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
    const color = colors[index % colors.length];

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
      <svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'>
        <rect width='40' height='40' fill='${color}' rx='6'/>
        <text x='20' y='24' font-family='Inter, sans-serif' font-size='10' font-weight='600'
              text-anchor='middle' fill='white'>${index}</text>
      </svg>
    `)}`;
  }

  generateAnalytics() {
    const analytics = {};

    // Generate GA4-style analytics for each week/subbrand/version combination
    this.weeks.forEach(week => {
      this.subbrands.forEach(subbrand => {
        this.versions.forEach((version, versionIndex) => {
          const key = `${week.week_id}_${subbrand}_v${versionIndex + 1}`;

          const baseVisits = this.randomInt(800, 2000);
          const engagementRate = 0.3 + this.random() * 0.4; // 30-70%

          analytics[key] = {
            site_visits: baseVisits,
            circular_visits: Math.floor(baseVisits * (0.6 + this.random() * 0.3)), // 60-90% of site visits
            unique_users: Math.floor(baseVisits * 0.7), // ~70% of visits are unique
            engagement_rate: Math.round(engagementRate * 100) / 100,
            audience_reach: this.randomInt(10000, 25000),
            marketing_health: this.randomInt(65, 95),
            pulse_score: this.randomInt(60, 85)
          };
        });
      });
    });

    return analytics;
  }

  // API-style data getters
  getPromotionsByFilters(filters = {}) {
    let filtered = [...this.promotions];

    if (filters.week_id) {
      filtered = filtered.filter(p => p.week_id === filters.week_id);
    }

    if (filters.subbrand) {
      filtered = filtered.filter(p => p.subbrand === filters.subbrand);
    }

    if (filters.version_id) {
      filtered = filtered.filter(p => p.version_id === filters.version_id);
    }

    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(p => filters.categories.includes(p.category));
    }

    if (filters.deal_types && filters.deal_types.length > 0) {
      filtered = filtered.filter(p => filters.deal_types.includes(p.deal_type));
    }

    return filtered;
  }

  getAnalyticsByKey(week_id, subbrand, version_id) {
    const key = `${week_id}_${subbrand}_${version_id}`;
    return this.analytics[key] || this.analytics[Object.keys(this.analytics)[0]];
  }

  getCircularsByWeek(week_id) {
    return this.circulars.filter(c => c.week_id === week_id);
  }

  calculatePositionRange(position) {
    if (position <= 25) return 'Top';
    if (position <= 50) return 'Upper Mid';
    if (position <= 75) return 'Lower Mid';
    return 'Bottom';
  }

  // Calculate aggregate analytics for current dataset
  calculateAggregateAnalytics() {
    const aggregates = {
      totalPromotions: this.promotions.length,
      avgComposite: Math.round(this.promotions.reduce((sum, p) => sum + p.composite, 0) / this.promotions.length),
      avgPercentile: Math.round(this.promotions.reduce((sum, p) => sum + p.percentile, 0) / this.promotions.length),
      topPerformerPercentile: Math.max(...this.promotions.map(p => p.percentile)),

      // Category insights
      categoryCount: new Set(this.promotions.map(p => p.category)).size,
      topCategory: this.getTopPerformingCategory(),

      // Size class insights
      sizeClassDistribution: this.getSizeClassDistribution(),
      topSizeClass: this.getTopPerformingSizeClass(),

      // Position insights
      positionRangeDistribution: this.getPositionRangeDistribution(),
      avgPosition: Math.round(this.promotions.reduce((sum, p) => sum + p.position, 0) / this.promotions.length),

      // Engagement insights
      avgCIV: Math.round(this.promotions.reduce((sum, p) => sum + p.civ, 0) / this.promotions.length),
      avgCC: Math.round(this.promotions.reduce((sum, p) => sum + p.cc, 0) / this.promotions.length),
      avgATL: Math.round(this.promotions.reduce((sum, p) => sum + p.atl, 0) / this.promotions.length),

      // Sharing insights
      shareRate: Math.round((this.promotions.filter(p => p.is_shared).length / this.promotions.length) * 100),
      expandRate: Math.round((this.promotions.filter(p => p.is_expanded).length / this.promotions.length) * 100),

      // Deal type insights
      dealTypeCount: new Set(this.promotions.map(p => p.deal_type)).size,
      topDealType: this.getTopPerformingDealType()
    };

    return aggregates;
  }

  getTopPerformingCategory() {
    const categoryScores = {};
    this.promotions.forEach(p => {
      if (!categoryScores[p.category]) {
        categoryScores[p.category] = { total: 0, count: 0 };
      }
      categoryScores[p.category].total += p.composite;
      categoryScores[p.category].count += 1;
    });

    let topCategory = null;
    let topAvg = 0;
    Object.entries(categoryScores).forEach(([category, data]) => {
      const avg = data.total / data.count;
      if (avg > topAvg) {
        topAvg = avg;
        topCategory = category;
      }
    });

    return { name: topCategory, avgScore: Math.round(topAvg) };
  }

  getSizeClassDistribution() {
    const distribution = { S: 0, M: 0, L: 0 };
    this.promotions.forEach(p => {
      distribution[p.size_class]++;
    });

    const total = this.promotions.length;
    return {
      S: Math.round((distribution.S / total) * 100),
      M: Math.round((distribution.M / total) * 100),
      L: Math.round((distribution.L / total) * 100)
    };
  }

  getTopPerformingSizeClass() {
    const sizeScores = { S: [], M: [], L: [] };
    this.promotions.forEach(p => {
      sizeScores[p.size_class].push(p.composite);
    });

    let topSize = null;
    let topAvg = 0;
    Object.entries(sizeScores).forEach(([size, scores]) => {
      if (scores.length > 0) {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        if (avg > topAvg) {
          topAvg = avg;
          topSize = size;
        }
      }
    });

    return { size: topSize, avgScore: Math.round(topAvg) };
  }

  getPositionRangeDistribution() {
    const distribution = { 'Top': 0, 'Upper Mid': 0, 'Lower Mid': 0, 'Bottom': 0 };
    this.promotions.forEach(p => {
      distribution[p.position_range]++;
    });

    const total = this.promotions.length;
    return {
      'Top': Math.round((distribution['Top'] / total) * 100),
      'Upper Mid': Math.round((distribution['Upper Mid'] / total) * 100),
      'Lower Mid': Math.round((distribution['Lower Mid'] / total) * 100),
      'Bottom': Math.round((distribution['Bottom'] / total) * 100)
    };
  }

  getTopPerformingDealType() {
    const dealScores = {};
    this.promotions.forEach(p => {
      if (!dealScores[p.deal_type]) {
        dealScores[p.deal_type] = { total: 0, count: 0 };
      }
      dealScores[p.deal_type].total += p.composite;
      dealScores[p.deal_type].count += 1;
    });

    let topDeal = null;
    let topAvg = 0;
    Object.entries(dealScores).forEach(([dealType, data]) => {
      const avg = data.total / data.count;
      if (avg > topAvg) {
        topAvg = avg;
        topDeal = dealType;
      }
    });

    return { name: topDeal, avgScore: Math.round(topAvg) };
  }

  // Export for use in other modules
  getData() {
    return {
      weeks: this.weeks,
      circulars: this.circulars,
      promotions: this.promotions,
      analytics: this.analytics,
      aggregates: this.calculateAggregateAnalytics(),
      categories: this.categories,
      dealTypes: this.dealTypes,
      subbrands: this.subbrands,
      versions: this.versions,
      stores: this.stores
    };
  }
}

// Create global instance
window.MockDataGenerator = MockDataGenerator;