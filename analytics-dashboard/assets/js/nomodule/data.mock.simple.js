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

    const topPromotions = promotions
      .sort((a, b) => b.composite - a.composite)
      .slice(0, 10)
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

      // YTD KPIs (header tiles) - Updated to YTD persistent metrics
      ytdKpis: [
        {
          label: 'TRAFFIC (YTD)',
          value: 1325812, // Cumulative YTD traffic
          unit: '',
          trend: 'up',
          change: '+15%',
          tooltip: 'Traffic (YTD) measures the cumulative number of circular views across all campaigns year-to-date, providing total exposure volume.',
          whyImportant: 'Essential baseline metric for measuring overall campaign reach and brand visibility; tracks aggregate performance trends over time.'
        },
        {
          label: 'VISITORS (YTD)',
          value: 285551, // Cumulative YTD unique visitors
          unit: '',
          trend: 'up',
          change: '+8%',
          tooltip: 'Visitors (YTD) counts unique individuals who have viewed circulars year-to-date, measuring actual audience reach beyond repeat views.',
          whyImportant: 'Shows true audience penetration and market coverage; key for understanding brand awareness and customer acquisition effectiveness.'
        },
        {
          label: 'MARKETING HEALTH (YTD)',
          value: 73, // Marketing health composite score
          unit: '',
          trend: 'up',
          change: '+5pts',
          tooltip: 'Marketing Health (YTD) is a composite score measuring overall circular program effectiveness, combining engagement quality and audience growth.',
          whyImportant: 'Single north-star metric for marketing performance; indicates program health and optimization opportunities across all campaigns.'
        }
      ],

      // Row 1: Main KPIs - Updated with composite scoring focus
      row1: [
        {
          label: 'Pulse Score',
          value: analytics.pulse_score,
          unit: '',
          tooltip: 'CIV + CC×10 + ATL×50 composite score'
        },
        {
          label: 'Engagement Rate',
          value: Math.round(analytics.engagement_rate * 100),
          unit: '%',
          tooltip: 'Overall promotion interaction rate'
        },
        {
          label: 'Top Percentile',
          value: promotions.length > 0 ? Math.max(...promotions.map(p => p.percentile)) : 0,
          unit: '%',
          tooltip: 'Highest performing promotion percentile'
        }
      ],

      // Row 2: Charts
      row2: {
        trend: {
          labels: ['W33', 'W34', 'W35', 'W36'],
          values: [0.62, 0.65, 0.71, analytics.engagement_rate]
        },
        positionPerformance: {
          qTop: 25,
          qUpperMid: 30,
          qLowerMid: 40,
          qBottom: 25
        },
        storeLift: STORE_LIFT
      },

      // Row 3: Categories
      row3: {
        categoryShare: CATEGORIES.slice(0, 6),
        categoryTop: CATEGORIES.slice(0, 6).map(cat => ({
          name: cat.name,
          value: Math.round(cat.engagement * 100)
        }))
      },

      // Row 4: Promotion Performance - Enhanced with ranking data
      row4: {
        promotions: topPromotions.map((promo, index) => ({
          ...promo,
          rank: index + 1, // Simple rank based on sorted position
          rankTotal: promotions.length,
          performance: Math.round(((10 - index) / 10) * 100) // Calculate performance percentage based on rank
        }))
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

      // Top-level promotions array for renderRow4 compatibility
      promotions: topPromotions.map((promo, index) => ({
        ...promo,
        rank: index + 1, // Simple rank based on sorted position
        rankTotal: promotions.length,
        performance: Math.round(((10 - index) / 10) * 100) // Calculate performance percentage based on rank
      })),

      // Top-level properties for renderRow1 compatibility
      pulseScore: analytics.pulse_score,
      engagementRate: analytics.engagement_rate,
      audienceReach: analytics.audience_reach,

      // Top-level properties for renderRow2 compatibility
      trend4w: {
        labels: ['W33', 'W34', 'W35', 'W36'],
        values: [0.62, 0.65, 0.71, analytics.engagement_rate]
      },
      ppp: {
        total: promotions.length,
        qTop: 25,
        qUpMid: 30,
        qLoMid: 40,
        qBottom: 25
      },
      stores: STORE_LIFT,

      // Top-level properties for renderRow3 compatibility
      categoryShare: CATEGORIES.slice(0, 6).map(cat => ({
        name: cat.name,
        value: cat.share
      })),
      categoryTop: CATEGORIES.slice(0, 6).map(cat => ({
        name: cat.name,
        value: Math.round(cat.engagement * 100)
      })),

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
      ytdKpis: [
        {
          label: 'TRAFFIC (YTD)',
          value: 1325812,
          unit: '',
          trend: 'stable',
          change: '0%',
          tooltip: 'Traffic (YTD) measures the cumulative number of circular views across all campaigns year-to-date, providing total exposure volume.',
          whyImportant: 'Essential baseline metric for measuring overall campaign reach and brand visibility; tracks aggregate performance trends over time.'
        },
        {
          label: 'VISITORS (YTD)',
          value: 285551,
          unit: '',
          trend: 'stable',
          change: '0%',
          tooltip: 'Visitors (YTD) counts unique individuals who have viewed circulars year-to-date, measuring actual audience reach beyond repeat views.',
          whyImportant: 'Shows true audience penetration and market coverage; key for understanding brand awareness and customer acquisition effectiveness.'
        },
        {
          label: 'MARKETING HEALTH (YTD)',
          value: 73,
          unit: '',
          trend: 'stable',
          change: '0pts',
          tooltip: 'Marketing Health (YTD) is a composite score measuring overall circular program effectiveness, combining engagement quality and audience growth.',
          whyImportant: 'Single north-star metric for marketing performance; indicates program health and optimization opportunities across all campaigns.'
        }
      ],
      row1: [
        { label: 'Pulse Score', value: 73, unit: '', tooltip: 'CIV + CC×10 + ATL×50 composite score' },
        { label: 'Engagement Rate', value: 42, unit: '%', tooltip: 'Overall promotion interaction rate' },
        { label: 'Top Percentile', value: 0, unit: '%', tooltip: 'Highest performing promotion percentile' }
      ],
      row2: {
        trend: { labels: ['W33', 'W34', 'W35', 'W36'], values: [0.62, 0.65, 0.71, 0.73] },
        positionPerformance: { qTop: 25, qUpperMid: 30, qLowerMid: 40, qBottom: 25 },
        storeLift: STORE_LIFT
      },
      row3: {
        categoryShare: CATEGORIES.slice(0, 6),
        categoryTop: CATEGORIES.slice(0, 6).map(cat => ({ name: cat.name, value: Math.round(cat.engagement * 100) }))
      },
      row4: { promotions: [] },
      row5: { sizeClasses: SIZE_CLASSES, sizeEffect: 1.12, expandRate: 0.28 },
      row6: { sharedCount: 310, shareOpenRate: 0.41, shareAddRate: 0.28 },
      dealTypes: DEAL_TYPES,
      promotions: [],
      pulseScore: 73,
      engagementRate: 0.42,
      audienceReach: 15600,
      trend4w: { labels: ['W33', 'W34', 'W35', 'W36'], values: [0.62, 0.65, 0.71, 0.73] },
      ppp: { total: 0, qTop: 25, qUpMid: 30, qLoMid: 40, qBottom: 25 },
      stores: STORE_LIFT,
      categoryShare: CATEGORIES.slice(0, 6).map(cat => ({ name: cat.name, value: cat.share })),
      categoryTop: CATEGORIES.slice(0, 6).map(cat => ({ name: cat.name, value: Math.round(cat.engagement * 100) })),
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