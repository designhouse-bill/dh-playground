/**
 * Dashboard Data Structure - 6 KPI Focused Sample Data
 * Matches the requirements from the implementation guide
 */

const dashboardData = {
  // KPI 1: Week Performance Status
  weekPerformance: {
    current: 92,
    previous: 87,
    change: 6,
    status: 'positive' // positive, neutral, negative
  },

  // KPI 2: Top Performing Categories
  topCategories: [
    { name: "Featured", score: 100, change: 5 },
    { name: "Farm Fresh", score: 96, change: -2 },
    { name: "Good Food Matters", score: 74, change: 8 },
    { name: "Custom Cuts", score: 69, change: 3 }
  ],

  // KPI 3: Underperforming Alerts
  alerts: {
    count: 3,
    items: [
      { name: "Beverages", score: 26, threshold: 40 },
      { name: "Household Goods", score: 18, threshold: 30 },
      { name: "Beer And Wine", score: 15, threshold: 25 }
    ]
  },

  // KPI 4: Current Week Trend - Daily engagement accumulation
  dailyTrend: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    values: [15, 28, 42, 65, 78, 88, 92]
  },

  // KPI 5: Quick Win Opportunity
  quickWin: {
    insight: "2X1 promotions in top position performing 40% better",
    action: "Apply to underperforming beverages category"
  },

  // KPI 6: Share Activity Summary
  shares: {
    current: 145,
    previous: 129,
    change: 12
  }
};

// Historical data for week comparison
const historicalData = {
  w35: {
    weekPerformance: { current: 87, previous: 82, change: 6, status: 'positive' },
    topCategories: [
      { name: "Featured", score: 95, change: 2 },
      { name: "Farm Fresh", score: 98, change: 4 },
      { name: "Good Food Matters", score: 66, change: -3 },
      { name: "Custom Cuts", score: 66, change: 1 }
    ],
    alerts: {
      count: 4,
      items: [
        { name: "Beverages", score: 22, threshold: 40 },
        { name: "Household Goods", score: 16, threshold: 30 },
        { name: "Beer And Wine", score: 12, threshold: 25 },
        { name: "Flowers", score: 8, threshold: 15 }
      ]
    },
    dailyTrend: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      values: [12, 25, 38, 58, 72, 82, 87]
    },
    quickWin: {
      insight: "3X2 promotions generating 35% more engagement",
      action: "Expand large format promotions in Featured category"
    },
    shares: { current: 129, previous: 118, change: 9 }
  },

  w34: {
    weekPerformance: { current: 82, previous: 79, change: 4, status: 'positive' },
    topCategories: [
      { name: "Featured", score: 93, change: -1 },
      { name: "Farm Fresh", score: 94, change: 6 },
      { name: "Custom Cuts", score: 65, change: 5 },
      { name: "Good Food Matters", score: 69, change: 8 }
    ],
    alerts: {
      count: 2,
      items: [
        { name: "Beverages", score: 28, threshold: 40 },
        { name: "Beer And Wine", score: 18, threshold: 25 }
      ]
    },
    dailyTrend: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      values: [10, 22, 35, 52, 68, 76, 82]
    },
    quickWin: {
      insight: "Featured category placement driving 45% more clicks",
      action: "Move high-performing items to featured positions"
    },
    shares: { current: 118, previous: 105, change: 12 }
  }
};

// Tooltip definitions matching the implementation guide
const tooltipDefinitions = {
  'week-performance': {
    title: 'Week Performance Status',
    description: 'Compares total promotion engagement this week against last week\'s performance with visual indicator.',
    importance: 'Quickly identify if your circular is trending up or down, enabling early course corrections for better results.'
  },
  'top-categories': {
    title: 'Top Performing Categories',
    description: 'Shows the 3-4 highest engagement categories this week, ranked by customer interaction scores.',
    importance: 'Double down on successful categories and apply winning strategies to underperformers for optimized results.'
  },
  'alerts': {
    title: 'Underperforming Alerts',
    description: 'Identifies categories or promotions performing significantly below threshold that may need immediate adjustment.',
    importance: 'Catch failing promotions early to swap products or adjust pricing mid-week before performance deteriorates further.'
  },
  'trend': {
    title: 'Current Week Trend',
    description: 'Shows daily engagement accumulation to reveal if performance is accelerating or declining throughout the week.',
    importance: 'Understand if weekend performance will recover or if immediate action is needed to course-correct.'
  },
  'quick-wins': {
    title: 'Quick Win Opportunity',
    description: 'Highlights the most effective promotion size and placement combination currently working in your circular.',
    importance: 'Apply winning layout strategies to improve underperforming promotions for immediate impact.'
  },
  'share-activity': {
    title: 'Share Activity Summary',
    description: 'Tracks how often customers share your promotions socially, indicating brand amplification beyond paid reach.',
    importance: 'Understand which promotions generate word-of-mouth marketing and organic reach expansion.'
  }
};

// Data access functions
function getCurrentWeekData() {
  return dashboardData;
}

function getWeekData(weekId) {
  if (weekId === 'w36') return dashboardData;
  return historicalData[weekId] || dashboardData;
}

function getTooltipDefinition(kpiId) {
  return tooltipDefinitions[kpiId] || null;
}

// Export for global access
window.dashboardData = dashboardData;
window.historicalData = historicalData;
window.tooltipDefinitions = tooltipDefinitions;
window.getCurrentWeekData = getCurrentWeekData;
window.getWeekData = getWeekData;
window.getTooltipDefinition = getTooltipDefinition;