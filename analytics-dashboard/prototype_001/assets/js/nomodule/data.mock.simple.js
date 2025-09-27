/* ==========================================================================
   Data scaffolding for prototype - Simple API Integration
   Provides synchronous data in original format using API data
   ========================================================================== */

(function(){
  // Wait for API to be ready
  if (!window.AnalyticsAPI) {
    setTimeout(() => {
      // Re-run this script when API is ready
      document.head.appendChild(document.createElement('script')).src = 'assets/js/nomodule/data.mock.simple.js';
    }, 100);
    return;
  }

  const api = window.AnalyticsAPI;

  // ---- Meta (banner + versions)
  window.DATA_META = {
    bannerName: 'Fresh Local Market',
    versions: api.getVersions().map((name, index) => ({
      id: `v${index + 1}`,
      name: name
    }))
  };

  // ---- Weeks (convert to dashboard format)
  const weeks = api.getWeeks();

  // Convert to object format expected by dashboard (indexed by week ID)
  window.DATA_WEEKS = {};
  const weekOrder = [];

  weeks.forEach(week => {
    // Convert 2025-W36 to w36 format for dashboard compatibility
    const dashboardWeekId = week.week_id.replace('2025-W', 'w');

    window.DATA_WEEKS[dashboardWeekId] = {
      id: dashboardWeekId,
      label: week.label,
      startISO: week.start_date,
      endISO: week.end_date
    };

    weekOrder.push(dashboardWeekId);
  });

  window.DATA_WEEK_ORDER = weekOrder;

  console.log('Weeks loaded:', window.DATA_WEEKS, 'Order:', window.DATA_WEEK_ORDER);

  // --- Static data arrays for dashboard
  const DEAL_TYPES = api.getDealTypes().map((dealType, index) => ({
    name: dealType,
    value: 80 - (index * 5)
  }));

  const SIZE_CLASSES = [
    { label: 'Small (S)',  value: 45, color: '#60A5FA' },
    { label: 'Medium (M)', value: 35, color: '#34D399' },
    { label: 'Large (L)',  value: 20, color: '#FBBF24' }
  ];

  const CATEGORIES = api.getCategories().slice(0, 8).map((category, index) => ({
    name: category,
    share: Math.round((20 - index * 2) * 100) / 100,
    engagement: Math.round((0.7 - index * 0.05) * 100) / 100
  }));

  const STORE_LIFT = api.getStores().slice(0, 6).map((store, index) => ({
    name: store.replace('Store ', 'Store '),
    engagement: Math.round((0.65 - index * 0.08) * 100) / 100,
    lift: Math.round((0.45 - index * 0.06) * 100) / 100,
    engagementPct: (0.65 - index * 0.08) * 100, // For scatter plot X axis
    liftPct: (0.45 - index * 0.06) * 100, // For scatter plot Y axis
    size: 10 + index * 3 // Much smaller bubble sizes (10, 13, 16, 19, 22, 25)
  }));

  // ---- Synchronous data generation
  function generateDataForWeek(weekId, version = 'all') {
    // Handle different week formats (w36 vs 2025-W36)
    let normalizedWeekId = weekId;
    if (weekId && weekId.startsWith('w')) {
      normalizedWeekId = `2025-W${weekId.substring(1)}`;
    }

    const week = weeks.find(w => w.week_id === normalizedWeekId);
    if (!week) {
      console.error('Week not found:', weekId, 'normalized:', normalizedWeekId, 'available:', weeks.map(w => w.week_id));
      return getDefaultData();
    }

    console.log('Found week:', week);

    // Get sample analytics data (synchronous)
    const subbrand = api.getSubbrands()[0];
    const analyticsKey = `${normalizedWeekId}_${subbrand}_v1`;
    const analytics = api.dataGenerator.analytics[analyticsKey] || {
      site_visits: 15420,
      circular_visits: 11565,
      unique_users: 8750,
      pulse_score: 73,
      engagement_rate: 0.42,
      audience_reach: 15600
    };

    console.log('Analytics key:', analyticsKey, 'data:', analytics);

    // Get promotion data (synchronous) - now with improved realistic generation
    const promotions = api.dataGenerator.getPromotionsByFilters({ week_id: normalizedWeekId });
    console.log('Generated promotions sample:', promotions.slice(0, 3));
    console.log('Total promotions available:', promotions.length);

    const topPromotions = promotions
      .sort((a, b) => b.composite - a.composite)
      .slice(0, 100) // Increase limit to support up to 100 items in the dropdown
      .map(promo => ({
        title: promo.title,
        score: promo.percentile / 100, // Keep this for backward compatibility
        percentile: promo.percentile, // Add raw percentile for microbar rendering
        composite: promo.composite,
        category: promo.category,
        dealType: promo.deal_type,
        position: promo.position,
        civ: promo.civ,
        cc: promo.cc,
        atl: promo.atl
      }));


    return {
      meta: { week: weekId, version, normalized_week: normalizedWeekId },

      // YTD - Consolidated single source of truth for all year-to-date metrics
      ytd: {
        // Basic metrics (moved from ytdKpis array)
        traffic: {
          value: 1325812,
          label: 'Traffic',
          unit: '',
          trend: 'up',
          change: '+15%',
          tooltip: 'Traffic (YTD) measures the cumulative number of circular views across all campaigns year-to-date, providing total exposure volume.',
          whyImportant: 'Essential baseline metric for measuring overall campaign reach and brand visibility; tracks aggregate performance trends over time.'
        },
        visitors: {
          value: 285551,
          label: 'Visitors',
          unit: '',
          trend: 'up',
          change: '+8%',
          tooltip: 'Visitors (YTD) counts unique individuals who have viewed circulars year-to-date, measuring actual audience reach beyond repeat views.',
          whyImportant: 'Shows true audience penetration and market coverage; key for understanding brand awareness and customer acquisition effectiveness.'
        },
        marketingHealth: {
          value: 73,
          label: 'Marketing Health',
          unit: '',
          trend: 'up',
          change: '+5pts',
          tooltip: 'Marketing Health (YTD) is a composite score measuring overall circular program effectiveness, combining engagement quality and audience growth.',
          whyImportant: 'Single north-star metric for marketing performance; indicates program health and optimization opportunities across all campaigns.'
        },

        // Advanced metrics (consolidated from individual properties)
        shopperReach: {
          value: 125450,
          label: 'Shopper Reach',
          unit: 'Unique Shoppers'
        },
        engagementVolume: {
          value: 2847293,
          label: 'Engagement Volume',
          unit: 'Total Interactions'
        },
        addToListTotal: {
          value: 89340,
          label: 'Add-to-List Total',
          unit: 'Total ATL Actions'
        },
        liftFromPromotions: {
          value: 2840000,
          label: 'Lift From Promotions',
          unit: 'Incremental Sales'
        },
        roiOnPromotions: {
          value: 4.2,
          label: 'ROI On Promotions',
          unit: 'Return on Investment'
        },

        // Chart data
        trendline: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
          values: [185000, 347000, 528000, 742000, 1024000, 1345000, 1689000, 2078000, 2460000]
        }
      },

      // Row 1: Main KPIs - Updated with composite scoring focus

      // Categories - Consolidated single source of truth for all category data
      categories: {
        // Master category list with all metrics
        list: [
          {
            name: 'Featured',
            share: CATEGORIES[0]?.share || 20,
            engagement: CATEGORIES[0]?.engagement || 0.7,
            lift: 12,
            traffic: 1180,
            conversion: 11,
            performanceScore: 78,
            atlRate: 12.8
          },
          {
            name: 'Farm Fresh',
            share: CATEGORIES[1]?.share || 18,
            engagement: CATEGORIES[1]?.engagement || 0.65,
            lift: -5,
            traffic: 920,
            conversion: 7,
            performanceScore: 58,
            atlRate: 10.2
          },
          {
            name: 'Good Food Matters',
            share: CATEGORIES[2]?.share || 16,
            engagement: CATEGORIES[2]?.engagement || 0.6,
            lift: 18,
            traffic: 1520,
            conversion: 14,
            performanceScore: 85,
            atlRate: 15.1
          },
          {
            name: 'Custom Cuts',
            share: CATEGORIES[3]?.share || 14,
            engagement: CATEGORIES[3]?.engagement || 0.55,
            lift: -10,
            traffic: 680,
            conversion: 5,
            performanceScore: 42,
            atlRate: 8.9
          },
          {
            name: 'Deals For Days',
            share: CATEGORIES[4]?.share || 12,
            engagement: CATEGORIES[4]?.engagement || 0.5,
            lift: 15,
            traffic: 1820,
            conversion: 9,
            performanceScore: 71,
            atlRate: 11.6
          },
          {
            name: 'Beef Pork Chicken',
            share: CATEGORIES[5]?.share || 10,
            engagement: CATEGORIES[5]?.engagement || 0.45,
            lift: -3,
            traffic: 1080,
            conversion: 10,
            performanceScore: 65,
            atlRate: 13.2
          }
        ],

        // Aggregated metrics
        contributionLift: 42.8, // % of total lift from top category
        averageATLRate: 12.4, // Average add-to-list rate across categories

        // Time series data
        trends: {
          fourWeek: {
            labels: ['W33', 'W34', 'W35', 'W36'],
            series: [
              { name: 'Featured', values: [68, 72, 75, 78] },
              { name: 'Farm Fresh', values: [52, 54, 56, 58] },
              { name: 'Good Food Matters', values: [80, 82, 84, 85] }
            ]
          }
        }
      },

      // Digital Circular - Consolidated single source of truth for all digital circular metrics
      digitalCircular: {
        // Core KPI metrics (Row 1)
        pulseScore: {
          value: analytics.pulse_score,
          label: 'Pulse Score',
          unit: '',
          tooltip: 'CIV + CC×10 + ATL×50 composite score',
          whyImportant: 'Primary engagement health indicator combining all interaction types'
        },
        engagementRate: {
          value: Math.round(analytics.engagement_rate * 100),
          label: 'Engagement Rate',
          unit: '%',
          tooltip: 'Overall promotion interaction rate',
          whyImportant: 'Shows how effectively content drives user actions'
        },
        audienceReach: {
          value: analytics.audience_reach,
          label: 'Audience Reach',
          unit: '',
          tooltip: 'Total unique visitors reached by circular',
          whyImportant: 'Measures campaign penetration and market coverage'
        },
        topPercentile: {
          value: promotions.length > 0 ? Math.max(...promotions.map(p => p.percentile)) : 0,
          label: 'TOP PERCENTILE',
          unit: '%',
          tooltip: 'Highest performing promotion percentile',
          whyImportant: 'Identifies peak performance potential in current campaign'
        },

        // Trend analysis (Row 2)
        trends: {
          fourWeek: {
            labels: ['W33', 'W34', 'W35', 'W36'],
            values: [0.62, 0.65, 0.71, analytics.engagement_rate]
          }
        },

        // Position performance data (Row 2)
        positionPerformance: {
          qTop: 25,
          qUpperMid: 30,
          qLowerMid: 40,
          qBottom: 25
        },

        // Store lift data (Row 2)
        storeLift: STORE_LIFT
      },

      // Promotions - Consolidated single source of truth for all promotion data
      promotions: {
        // Complete promotion list (normalized from API)
        list: topPromotions.map((promo, index) => ({
          id: `promo_${String(index + 1).padStart(3, '0')}`,
          title: promo.title,
          category: promo.category,
          composite: promo.composite,
          percentile: promo.percentile,
          rank: index + 1,
          rankTotal: promotions.length,
          performance: Math.round(((10 - index) / 10) * 100),
          dealType: promo.dealType,
          position: promo.position,
          size: index < 3 ? 'Large' : index < 7 ? 'Medium' : 'Small', // Derived size based on performance
          salesLift: Math.round(45000 - (index * 2000)), // Synthetic sales lift based on rank
          mediaFreshness: index < Math.floor(promotions.length * 0.87), // 87.3% fresh
          civ: promo.civ,
          cc: promo.cc,
          atl: promo.atl
        })),

        // Aggregated metrics
        topQuartilePercentage: 23.5, // % of promos in top 25% performance
        mediaFreshnessRate: 87.3, // % using current/fresh assets
        totalCount: promotions.length,

        // Specific promotion performance data
        salesLiftByPromo: [
          { name: 'Promo A', value: 45000, category: 'Featured' },
          { name: 'Promo B', value: 38000, category: 'Farm Fresh' },
          { name: 'Promo C', value: 52000, category: 'Good Food Matters' },
          { name: 'Promo D', value: 29000, category: 'Custom Cuts' }
        ],

        // Size impact analysis
        sizeImpact: [
          { name: 'Small (1x1)', value: 32, engagement: 42 },
          { name: 'Medium (2x2)', value: 58, engagement: 65 },
          { name: 'Large (3x3)', value: 75, engagement: 78 }
        ]
      },

      // Row 5: Size metrics
      row5: {
        sizeClasses: SIZE_CLASSES,
        sizeEffect: 1.12,
        expandRate: 0.28
      },

      // Row 6: Sharing
      row6: {
        sharedCount: 310,
        shareOpenRate: 0.41,
        shareAddRate: 0.28
      },

      // Deal types for charts
      dealTypes: DEAL_TYPES,






      // Top-level properties for renderRow5 compatibility
      sizeMix: SIZE_CLASSES.map(size => ({
        name: size.label,
        value: size.value
      })),
      bestSize: SIZE_CLASSES.slice(0, 3).map(size => ({
        name: size.label,
        value: size.value
      })),
      expandRate: [
        { name: 'Expanded', value: 28 },
        { name: 'Not Expanded', value: 72 }
      ],
      sizeEffectIndex: 1.12,

      // Top-level properties for renderRow6 compatibility
      sharedCount: 310,
      shareOpenRate: 41, // Store as percentage for pct() function
      shareAddRate: 28
    };
  }

  function getDefaultData() {
    return {
      meta: { week: '2025-W36', version: 'all' },

      // YTD - Consolidated single source of truth for all year-to-date metrics (default/fallback data)
      ytd: {
        // Basic metrics (moved from ytdKpis array)
        traffic: {
          value: 1325812,
          label: 'Traffic',
          unit: '',
          trend: 'stable',
          change: '0%',
          tooltip: 'Traffic (YTD) measures the cumulative number of circular views across all campaigns year-to-date, providing total exposure volume.',
          whyImportant: 'Essential baseline metric for measuring overall campaign reach and brand visibility; tracks aggregate performance trends over time.'
        },
        visitors: {
          value: 285551,
          label: 'Visitors',
          unit: '',
          trend: 'stable',
          change: '0%',
          tooltip: 'Visitors (YTD) counts unique individuals who have viewed circulars year-to-date, measuring actual audience reach beyond repeat views.',
          whyImportant: 'Shows true audience penetration and market coverage; key for understanding brand awareness and customer acquisition effectiveness.'
        },
        marketingHealth: {
          value: 73,
          label: 'Marketing Health',
          unit: '',
          trend: 'stable',
          change: '0pts',
          tooltip: 'Marketing Health (YTD) is a composite score measuring overall circular program effectiveness, combining engagement quality and audience growth.',
          whyImportant: 'Single north-star metric for marketing performance; indicates program health and optimization opportunities across all campaigns.'
        },

        // Advanced metrics (default values)
        shopperReach: {
          value: 125450,
          label: 'Shopper Reach',
          unit: 'Unique Shoppers'
        },
        engagementVolume: {
          value: 2847293,
          label: 'Engagement Volume',
          unit: 'Total Interactions'
        },
        addToListTotal: {
          value: 89340,
          label: 'Add-to-List Total',
          unit: 'Total ATL Actions'
        },
        liftFromPromotions: {
          value: 2840000,
          label: 'Lift From Promotions',
          unit: 'Incremental Sales'
        },
        roiOnPromotions: {
          value: 4.2,
          label: 'ROI On Promotions',
          unit: 'Return on Investment'
        },

        // Chart data
        trendline: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
          values: [185000, 347000, 528000, 742000, 1024000, 1345000, 1689000, 2078000, 2460000]
        }
      },
      // Categories - Consolidated single source of truth (default/fallback data)
      categories: {
        // Master category list with all metrics
        list: [
          { name: 'Featured', share: 20, engagement: 0.7, lift: 15, traffic: 1250, conversion: 12, performanceScore: 78, atlRate: 12.8 },
          { name: 'Farm Fresh', share: 18, engagement: 0.65, lift: -8, traffic: 980, conversion: 8, performanceScore: 58, atlRate: 10.2 },
          { name: 'Good Food Matters', share: 16, engagement: 0.6, lift: 22, traffic: 1580, conversion: 15, performanceScore: 85, atlRate: 15.1 },
          { name: 'Custom Cuts', share: 14, engagement: 0.55, lift: -12, traffic: 720, conversion: 6, performanceScore: 42, atlRate: 8.9 },
          { name: 'Deals For Days', share: 12, engagement: 0.5, lift: 18, traffic: 1890, conversion: 10, performanceScore: 71, atlRate: 11.6 },
          { name: 'Beef Pork Chicken', share: 10, engagement: 0.45, lift: -5, traffic: 1120, conversion: 11, performanceScore: 65, atlRate: 13.2 }
        ],
        contributionLift: 42.8,
        averageATLRate: 12.4,
        trends: {
          fourWeek: {
            labels: ['W33', 'W34', 'W35', 'W36'],
            series: [
              { name: 'Featured', values: [68, 72, 75, 78] },
              { name: 'Farm Fresh', values: [52, 54, 56, 58] },
              { name: 'Good Food Matters', values: [80, 82, 84, 85] }
            ]
          }
        }
      },
      // Promotions - Consolidated single source of truth for all promotion data (default/fallback)
      promotions: {
        list: [], // Empty list for default/fallback
        topQuartilePercentage: 0,
        mediaFreshnessRate: 0,
        totalCount: 0,
        salesLiftByPromo: [],
        sizeImpact: []
      },

      // Digital Circular - Consolidated single source of truth for all digital circular metrics (default/fallback)
      digitalCircular: {
        // Core KPI metrics (Row 1)
        pulseScore: {
          value: 73,
          label: 'Pulse Score',
          unit: '',
          tooltip: 'CIV + CC×10 + ATL×50 composite score',
          whyImportant: 'Primary engagement health indicator combining all interaction types'
        },
        engagementRate: {
          value: 42,
          label: 'Engagement Rate',
          unit: '%',
          tooltip: 'Overall promotion interaction rate',
          whyImportant: 'Shows how effectively content drives user actions'
        },
        audienceReach: {
          value: 15600,
          label: 'Audience Reach',
          unit: '',
          tooltip: 'Total unique visitors reached by circular',
          whyImportant: 'Measures campaign penetration and market coverage'
        },
        topPercentile: {
          value: 0,
          label: 'TOP PERCENTILE',
          unit: '%',
          tooltip: 'Highest performing promotion percentile',
          whyImportant: 'Identifies peak performance potential in current campaign'
        },

        // Trend analysis (Row 2)
        trends: {
          fourWeek: {
            labels: ['W33', 'W34', 'W35', 'W36'],
            values: [0.62, 0.65, 0.71, 0.73]
          }
        },

        // Position performance data (Row 2)
        positionPerformance: {
          qTop: 25,
          qUpperMid: 30,
          qLowerMid: 40,
          qBottom: 25
        },

        // Store lift data (Row 2)
        storeLift: STORE_LIFT
      },

      row5: { sizeClasses: SIZE_CLASSES, sizeEffect: 1.12, expandRate: 0.28 },
      row6: { sharedCount: 310, shareOpenRate: 0.41, shareAddRate: 0.28 },
      dealTypes: DEAL_TYPES,
      sizeMix: SIZE_CLASSES.map(size => ({ name: size.label, value: size.value })),
      bestSize: SIZE_CLASSES.slice(0, 3).map(size => ({ name: size.label, value: size.value })),
      expandRate: [{ name: 'Expanded', value: 28 }, { name: 'Not Expanded', value: 72 }],
      sizeEffectIndex: 1.12,
      sharedCount: 310,
      shareOpenRate: 41,
      shareAddRate: 28
    };
  }

  // ---- Exposed functions
  window.getScopedData = function(version = 'all') {
    return generateDataForWeek(window.AD?.state?.week || 'w36', version);
  };

  window.getWeekData = function(weekId, version = 'all') {
    return generateDataForWeek(weekId, version);
  };

  // ---- Initialize with current week data (synchronous)
  window.DATA = generateDataForWeek('w36', 'all');

  console.log('Mock data initialized synchronously:', window.DATA);
})();