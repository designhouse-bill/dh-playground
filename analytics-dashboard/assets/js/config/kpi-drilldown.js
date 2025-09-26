/* ==========================================================================
   KPI Drill-down Configuration
   Maps each KPI to its corresponding inquiry page filter state
   ========================================================================== */

window.KPI_DRILL_DOWN_CONFIG = {
  // Header KPI Tiles
  total_items: {
    scope: 'promotion',
    lens: 'engagement',
    week: 'current',
    description: 'All Promotions Analysis',
    sortBy: 'composite'
  },

  avg_composite: {
    scope: 'promotion',
    lens: 'performance',
    sortBy: 'composite',
    metric: 'composite',
    description: 'Composite Score Analysis'
  },

  top_performer: {
    scope: 'promotion',
    lens: 'performance',
    sortBy: 'percentile',
    metric: 'percentile',
    description: 'Top Performing Promotions'
  },

  categories_count: {
    scope: 'promotion',
    lens: 'performance',
    description: 'Category Performance Analysis'
  },

  // Row 1 - Digital Circular KPIs
  pulse_score: {
    scope: 'promotion',
    lens: 'engagement',
    metric: 'composite',
    sortBy: 'composite',
    description: 'Pulse Score Deep Dive - Engagement Performance'
  },

  engagement_rate: {
    scope: 'promotion',
    lens: 'engagement',
    metric: 'percentile',
    sortBy: 'percentile',
    description: 'Engagement Rate Analysis'
  },

  audience_reach: {
    scope: 'promotion',
    lens: 'traffic',
    entityLevel: 'subbrand',
    description: 'Audience Reach Analysis'
  },

  // Row 2 - Trend & Position Performance
  trend_overview: {
    scope: 'promotion',
    lens: 'engagement',
    description: 'Promotion Engagement Trend Analysis'
  },

  position_performance: {
    scope: 'promotion',
    lens: 'performance',
    positionRanges: ['Top', 'Upper Mid', 'Lower Mid', 'Bottom'],
    sortBy: 'position',
    description: 'Position Performance Analysis'
  },

  store_lift: {
    scope: 'promotion',
    lens: 'traffic',
    entityLevel: 'store',
    description: 'Store Performance Analysis'
  },

  // Row 3 - Category KPIs
  category_share: {
    scope: 'promotion',
    lens: 'performance',
    description: 'Category Performance Analysis'
  },

  category_lift: {
    scope: 'promotion',
    lens: 'performance',
    metric: 'lift',
    sortBy: 'lift',
    description: 'Category Lift vs Baseline Performance'
  },

  category_quality: {
    scope: 'promotion',
    lens: 'engagement',
    metric: 'quality',
    sortBy: 'engagement',
    description: 'Category Size vs Engagement Quality'
  },

  // Row 4 - Promotion Performance (already implemented)
  promotion_performance: {
    scope: 'promotion',
    lens: 'performance',
    sortBy: 'composite',
    description: 'Promotion Performance Deep Dive'
  },

  // Row 5 - Size & Deal Type KPIs
  size_mix: {
    scope: 'promotion',
    lens: 'performance',
    sizeClasses: ['S', 'M', 'L'],
    sortBy: 'sizeClass',
    description: 'Size Class Mix Analysis'
  },

  best_size: {
    scope: 'promotion',
    lens: 'performance',
    sortBy: 'composite',
    metric: 'composite',
    description: 'Best Performing Size Classes'
  },

  expand_rate: {
    scope: 'promotion',
    lens: 'engagement',
    description: 'Expanded Interaction Analysis'
  },

  deal_effectiveness: {
    scope: 'promotion',
    lens: 'performance',
    sortBy: 'dealType',
    description: 'Deal Type Effectiveness Analysis'
  },

  // Row 6 - Sharing KPIs
  shared_promotions: {
    scope: 'promotion',
    lens: 'engagement',
    description: 'Shared Promotions Analysis'
  },

  share_open_rate: {
    scope: 'promotion',
    lens: 'engagement',
    description: 'Share Open Rate Analysis'
  },

  share_add_rate: {
    scope: 'promotion',
    lens: 'engagement',
    description: 'Share Add-to-List Rate Analysis'
  }
};

// Navigation helper function
window.drillDownToInquiry = function(kpiKey) {
  const config = window.KPI_DRILL_DOWN_CONFIG[kpiKey];
  if (!config) {
    console.error('No drill-down config found for:', kpiKey);
    return;
  }

  const params = new URLSearchParams({
    source: kpiKey,
    scope: config.scope,
    lens: config.lens,
    sortBy: config.sortBy || 'composite',
    metric: config.metric || 'composite',
    description: config.description
  });

  // Add current dashboard context
  if (window.AD && window.AD.state) {
    if (window.AD.state.week && window.AD.state.week !== 'all') {
      params.set('week', window.AD.state.week);
    }
    if (window.AD.state.version && window.AD.state.version !== 'all') {
      params.set('version', window.AD.state.version);
    }
  }

  // Get current store selection
  const storeSelect = document.getElementById('store-select');
  if (storeSelect && storeSelect.value && storeSelect.value !== 'all') {
    params.set('store', storeSelect.value);
  }

  // Add optional KPI-specific parameters
  if (config.entityLevel) params.set('entityLevel', config.entityLevel);
  if (config.categories) params.set('categories', config.categories.join(','));
  if (config.dealTypes) params.set('dealTypes', config.dealTypes.join(','));
  if (config.sizeClasses) params.set('sizeClasses', config.sizeClasses.join(','));
  if (config.positionRanges) params.set('positionRanges', config.positionRanges.join(','));

  // Navigate to inquiry page with URL fragment to auto-scroll to table
  window.location.href = `inquiry.html?${params.toString()}#analytics-treetable`;
};