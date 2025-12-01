/* ==========================================================================
   Data scaffolding for prototype - API Integration
   Exposes:
   - DATA_META
   - DATA_WEEKS and DATA_WEEK_ORDER
   - DATA (current)
   - getScopedData(version)
   - getWeekData(weekId, version)
   ========================================================================== */

(function(){
  // Wait for API service to be ready
  function waitForAPI(callback) {
    if (window.AnalyticsAPI) {
      callback();
    } else {
      setTimeout(() => waitForAPI(callback), 50);
    }
  }

  waitForAPI(() => {
    const api = window.AnalyticsAPI;

    // ---- Meta (banner + versions)
    window.DATA_META = {
      bannerName: 'Fresh Local Market',
      versions: api.getVersions().map((name, index) => ({
        id: `v${index + 1}`,
        name: name
      }))
    };

    // ---- Weeks
    const weeks = api.getWeeks();
    window.DATA_WEEKS = weeks.map(week => ({
      id: week.week_id,
      label: week.label,
      start: week.start_date,
      end: week.end_date
    }));

    window.DATA_WEEK_ORDER = weeks.map(week => week.week_id);

    console.log('Weeks loaded:', window.DATA_WEEKS);

    // --- Deal Type Effectiveness (from API) ---
    const DEAL_TYPES = api.getDealTypes().map((dealType, index) => ({
      name: dealType,
      value: 80 - (index * 5) // Mock effectiveness values
    }));

    // ---- Size Classes
    const SIZE_CLASSES = [
      { label: 'Small (S)',  value: 45, color: '#60A5FA' },
      { label: 'Medium (M)', value: 35, color: '#34D399' },
      { label: 'Large (L)',  value: 20, color: '#FBBF24' }
    ];

    // ---- Categories for Row 3
    const CATEGORIES = api.getCategories().slice(0, 8).map((category, index) => ({
      name: category,
      share: Math.round((20 - index * 2) * 100) / 100,
      engagement: Math.round((0.7 - index * 0.05) * 100) / 100
    }));

    // ---- Store Lift data
    const STORE_LIFT = api.getStores().slice(0, 6).map((store, index) => ({
      name: store.replace('Store ', 'Store '),
      engagement: Math.round((0.65 - index * 0.08) * 100) / 100,
      lift: Math.round((0.45 - index * 0.06) * 100) / 100,
      size: 100 + index * 20
    }));

    // Generate promotion data from API
    async function generatePromotionData(weekId, version = 'all') {
      try {
        const week = weeks.find(w => w.week_id === weekId);
        if (!week) return { promotions: [], promotionPerformance: [] };

        const subbrand = api.getSubbrands()[0];
        const nodeHash = api.getNodeHash(subbrand);

        const response = await api.getPromotionScores(
          nodeHash,
          week.start_date,
          week.end_date,
          version,
          100
        );

        const promotions = response.data;

        // Format for the existing dashboard structure
        const promotionPerformance = promotions.slice(0, 10).map(promo => ({
          title: promo.name,
          score: promo.percentile / 100, // Convert to 0-1 scale
          composite: promo.composite,
          category: promo.category,
          dealType: promo.dealType,
          position: promo.position,
          civ: promo.civ,
          cc: promo.cc,
          atl: promo.atl
        }));

        return { promotions, promotionPerformance };
      } catch (error) {
        console.error('Error generating promotion data:', error);
        return { promotions: [], promotionPerformance: [] };
      }
    }

    // Generate analytics data from API
    async function generateAnalyticsData(weekId, version = 'all') {
      try {
        const week = weeks.find(w => w.week_id === weekId);
        if (!week) return {};

        const subbrand = api.getSubbrands()[0];
        const nodeHash = api.getNodeHash(subbrand);

        const [overviewResponse, circularResponse, trendResponse] = await Promise.all([
          api.getOverview(nodeHash, week.start_date, week.end_date),
          api.getCircularOverview(nodeHash, week.start_date, week.end_date, version),
          api.getTrend(nodeHash, weekId, 4, version)
        ]);

        return {
          // Header KPIs
          siteVisits: overviewResponse.data.traffic,
          circularVisits: Math.round(overviewResponse.data.traffic * 0.75),
          uniqueUsers: overviewResponse.data.visitors,

          // Circular KPIs
          pulseScore: circularResponse.data.pulseScore,
          engagementRate: circularResponse.data.engagementRate,
          audienceReach: circularResponse.data.audienceReach,

          // Trend data
          trendLabels: trendResponse.data.labels,
          trendValues: trendResponse.data.values
        };
      } catch (error) {
        console.error('Error generating analytics data:', error);
        return {};
      }
    }

    // ---- Main data generation function
    async function generateDataForWeek(weekId, version = 'all') {
      const promotionData = await generatePromotionData(weekId, version);
      const analyticsData = await generateAnalyticsData(weekId, version);

      return {
        meta: { week: weekId, version },

        // YTD KPIs (header tiles) - Updated to focus on high-level story metrics
        ytdKpis: [
          {
            label: 'Traffic',
            value: analyticsData.siteVisits || Math.floor(Math.random() * 5000) + 8000,
            unit: '',
            trend: 'up',
            change: '+15%',
            tooltip: 'Traffic measures how many times circulars have been viewed, capturing overall exposure and reach.',
            whyImportant: 'Shows total views across all circulars; high-level volume indicator for measuring campaign reach.'
          },
          {
            label: 'Engagement Rate',
            value: Math.floor((analyticsData.circularVisits || 11565) / (analyticsData.siteVisits || 15420) * 100) || Math.floor(Math.random() * 20) + 35,
            unit: '%',
            trend: 'up',
            change: '+3%',
            tooltip: 'Engagement Rate shows the percentage of exposures that led to an interaction like a click or add-to-list.',
            whyImportant: 'Measures circular stickiness and efficiency; normalizes engagement versus reach for performance evaluation.'
          },
          {
            label: 'Weekly Growth',
            value: Math.floor(Math.random() * 10) + 5,
            unit: '%',
            trend: 'up',
            change: '+2pts',
            tooltip: 'Weekly Growth shows the percentage change in performance compared to the previous week.',
            whyImportant: 'Indicates momentum and trend direction; helps spot patterns early for quick reaction to performance changes.'
          }
        ],

        // Row 1: Main KPIs
        row1: [
          {
            label: 'Pulse Score',
            value: analyticsData.pulseScore || 73,
            unit: '',
            tooltip: 'Composite engagement metric'
          },
          {
            label: 'Engagement Rate',
            value: Math.round((analyticsData.engagementRate || 0.42) * 100),
            unit: '%',
            tooltip: 'User interaction rate'
          },
          {
            label: 'Audience Reach',
            value: analyticsData.audienceReach || 15600,
            unit: '',
            tooltip: 'Total unique viewers'
          }
        ],

        // Row 2: Charts
        row2: {
          trend: {
            labels: analyticsData.trendLabels || ['W33', 'W34', 'W35', 'W36'],
            values: analyticsData.trendValues || [0.62, 0.65, 0.71, 0.73]
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

        // Row 4: Promotion Performance
        row4: {
          promotions: promotionData.promotionPerformance
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
        dealTypes: DEAL_TYPES
      };
    }

    // ---- Exposed functions
    window.getScopedData = function(version = 'all') {
      return generateDataForWeek(window.AD?.state?.week || 'w36', version);
    };

    window.getWeekData = function(weekId, version = 'all') {
      return generateDataForWeek(weekId, version);
    };

    // ---- Initialize with current week data
    generateDataForWeek('2025-W36', 'all').then(data => {
      window.DATA = data;
      console.log('Mock data loaded:', data);

      // Trigger boot process if it's waiting
      const event = new CustomEvent('dataLoaded');
      document.dispatchEvent(event);
    });
  });
})();