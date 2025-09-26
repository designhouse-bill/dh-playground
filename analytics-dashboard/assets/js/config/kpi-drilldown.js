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
  },

  // YTD Performance KPIs (moved from Digital Circular)
  ytd_traffic: {
    scope: 'promotion',
    lens: 'traffic',
    description: 'Year-to-Date Total Traffic Analysis'
  },

  ytd_visitors: {
    scope: 'promotion',
    lens: 'traffic',
    entityLevel: 'visitor',
    description: 'Year-to-Date Unique Visitors Analysis'
  },

  ytd_marketing_health: {
    scope: 'promotion',
    lens: 'performance',
    metric: 'composite',
    description: 'Year-to-Date Marketing Health Score Analysis'
  },

  ytd_shopper_reach: {
    scope: 'promotion',
    lens: 'traffic',
    entityLevel: 'shopper',
    description: 'Year-to-Date Shopper Reach Analysis'
  },

  ytd_engagement_volume: {
    scope: 'promotion',
    lens: 'engagement',
    description: 'Year-to-Date Total Engagement Volume'
  },

  ytd_add_to_list: {
    scope: 'promotion',
    lens: 'engagement',
    metric: 'add_to_list',
    description: 'Year-to-Date Add-to-List Actions'
  },

  ytd_lift_from_promotions: {
    scope: 'promotion',
    lens: 'performance',
    metric: 'lift',
    description: 'Year-to-Date Incremental Sales Lift'
  },

  ytd_roi_on_promotions: {
    scope: 'promotion',
    lens: 'performance',
    metric: 'roi',
    description: 'Year-to-Date ROI on Promotion Spend'
  },

  // Category Analytics KPIs (Row 3B)
  category_contribution_lift: {
    scope: 'category',
    lens: 'performance',
    metric: 'contribution',
    description: 'Top Category Contribution to Total Lift'
  },

  top_performing_categories: {
    scope: 'category',
    lens: 'performance',
    sortBy: 'performance_score',
    description: 'Category Performance Ranking'
  },

  category_atl_rate: {
    scope: 'category',
    lens: 'engagement',
    metric: 'add_to_list',
    description: 'Category Average Add-to-List Rate'
  },

  category_trend_4w: {
    scope: 'category',
    lens: 'performance',
    description: '4-Week Category Performance Trends'
  },

  // Individual Promotion Analytics KPIs (Row 4B)
  top_quartile_promotions: {
    scope: 'promotion',
    lens: 'performance',
    sortBy: 'percentile',
    metric: 'percentile',
    description: 'Top 25% Promotion Performance Analysis'
  },

  promotion_level_sales_lift: {
    scope: 'promotion',
    lens: 'performance',
    metric: 'sales_lift',
    sortBy: 'sales_lift',
    description: 'Individual Promotion Sales Lift Analysis'
  },

  promotion_size_impact: {
    scope: 'promotion',
    lens: 'performance',
    metric: 'size_impact',
    sortBy: 'size',
    description: 'Promotion Size vs Performance Impact'
  },

  promotion_media_freshness: {
    scope: 'promotion',
    lens: 'content',
    metric: 'freshness',
    description: 'Promotion Asset Freshness Analysis'
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