/**
 * Distribution Tab — Mock Data
 * Based on real client data from PRD (UX-846):
 * - Winn-Dixie 20-store pilot (Black Friday → Jan 13, 2026)
 * - HFG / Price Less IGA YouTube campaign (Store 485, 12/26-12/31/25)
 * - Pulse by Greenberg Enterprises foot traffic data
 */

const DistributionMockData = (function() {
  'use strict';

  // ========================================
  // Flight Weeks
  // ========================================
  const flightWeeks = [
    { id: 'wk3', label: 'Week 3', start: '2025-12-10', end: '2025-12-16' },
    { id: 'wk4', label: 'Week 4', start: '2025-12-17', end: '2025-12-23' },
    { id: 'wk5', label: 'Week 5', start: '2025-12-24', end: '2025-12-30' },
    { id: 'wk1', label: 'Week 1', start: '2025-12-31', end: '2026-01-06' },
    { id: 'wk2', label: 'Week 2', start: '2026-01-07', end: '2026-01-13' }
  ];

  // ========================================
  // Section 1 — Media Buy Metrics
  // ========================================
  const mediaBuyMetrics = {
    // Aggregated across all stores, current period (wk2)
    summary: {
      cost_per_visit: 2.14,
      impressions: 142800,
      clicks: 1274,
      ctr: 0.89,
      cost_per_impression: 0.08,
      visits_per_thousand: 47.3,
      budget: 14475.00,
      gross_visits: 6757
    },

    // Per-week trend
    weeklyTrend: [
      { week: 'wk3', impressions: 118200, clicks: 982, ctr: 0.83, cost_per_visit: 2.58, visits_per_thousand: 41.2, budget: 12500, gross_visits: 4870 },
      { week: 'wk4', impressions: 126400, clicks: 1085, ctr: 0.86, cost_per_visit: 2.41, visits_per_thousand: 43.8, budget: 13200, gross_visits: 5536 },
      { week: 'wk5', impressions: 131600, clicks: 1142, ctr: 0.87, cost_per_visit: 2.31, visits_per_thousand: 44.9, budget: 13800, gross_visits: 5909 },
      { week: 'wk1', impressions: 137200, clicks: 1198, ctr: 0.87, cost_per_visit: 2.22, visits_per_thousand: 46.1, budget: 14100, gross_visits: 6326 },
      { week: 'wk2', impressions: 142800, clicks: 1274, ctr: 0.89, cost_per_visit: 2.14, visits_per_thousand: 47.3, budget: 14475, gross_visits: 6757 }
    ]
  };

  // ========================================
  // Media Creative Records
  // ========================================
  const creativeRecords = [
    {
      creative_id: 'cr-001',
      retailer_id: 'winn-dixie',
      store_group: ['726', '381', '336', '2437', '2288', '2399', '2495', '508', '2482', '2434'],
      creative_type: 'gif',
      file_url: null, // placeholder — no actual file
      date_range_start: '2025-12-10',
      date_range_end: '2025-12-30',
      uploaded_by: 'tammy.mdi',
      uploaded_at: '2025-12-09T14:30:00Z',
      notes: 'Holiday T-bone steak hero — animated price drop GIF',
      label: 'Holiday Steak A',
      metrics: { impressions: 72400, clicks: 682, ctr: 0.94, gross_visits: 3520 }
    },
    {
      creative_id: 'cr-002',
      retailer_id: 'winn-dixie',
      store_group: ['436', '711', '518', '2449', '2474', '2480', '2487', '2490', '2501', '2509'],
      creative_type: 'jpeg',
      file_url: null,
      date_range_start: '2025-12-10',
      date_range_end: '2025-12-30',
      uploaded_by: 'tammy.mdi',
      uploaded_at: '2025-12-09T14:35:00Z',
      notes: 'Holiday general circular hero — static JPEG',
      label: 'Holiday General B',
      metrics: { impressions: 70400, clicks: 600, ctr: 0.85, gross_visits: 3237 }
    }
  ];

  // ========================================
  // Video Engagement (HFG / Price Less IGA)
  // ========================================
  const videoEngagement = {
    store_id: '485',
    retailer: 'HFG / Price Less IGA',
    campaign_period: '12/26/2025 - 12/31/2025',
    creative_type: 'video',
    platform: 'YouTube',
    budget: 225.00,
    impressions: 3595,
    clicks: 32,
    ctr: 0.89,
    cost_per_impression: 0.08,
    video_complete_views: 2757,
    video_completion_rate: 76.69,
    video_first_quartile_views: 2695,
    video_first_quartile_seconds: 4,
    video_midpoint_views: 3219,
    video_midpoint_seconds: 8,
    video_third_quartile_views: 2870,
    video_third_quartile_seconds: 11,
    avg_circular_time: '01:44',
    circular_views: 364
  };

  // ========================================
  // Demographics (Winn-Dixie 11/28-12/31/25)
  // ========================================
  const demographics = {
    period: '11/28/2025 - 12/31/2025',
    retailer: 'Winn-Dixie',
    gender: [
      { label: 'Female', value: 53 },
      { label: 'Male', value: 47 }
    ],
    marital_status: [
      { label: 'Married', value: 57 },
      { label: 'Single', value: 43 }
    ],
    children: [
      { label: 'No Children', value: 69 },
      { label: 'Has Children', value: 31 }
    ],
    homeowner: [
      { label: 'Homeowner', value: 69 },
      { label: 'Renter', value: 31 }
    ],
    age: [
      { label: '18-24', value: 8 },
      { label: '25-34', value: 18 },
      { label: '35-44', value: 14 },
      { label: '45-54', value: 16 },
      { label: '55-64', value: 15 },
      { label: '65+', value: 29 }
    ],
    household_income: [
      { label: '<$19K', value: 8 },
      { label: '$19-34K', value: 12 },
      { label: '$35-49K', value: 14 },
      { label: '$50-64K', value: 11 },
      { label: '$65-99K', value: 19 },
      { label: '$100-149K', value: 18 },
      { label: '$150-249K', value: 12 },
      { label: '$250K+', value: 6 }
    ],
    net_worth: [
      { label: '<$4K', value: 33 },
      { label: '$5-24K', value: 10 },
      { label: '$25-99K', value: 14 },
      { label: '$100-499K', value: 28 },
      { label: '$500K+', value: 15 }
    ],
    household_size: [
      { label: '1', value: 32 },
      { label: '2', value: 28 },
      { label: '3', value: 16 },
      { label: '4', value: 13 },
      { label: '5+', value: 11 }
    ]
  };

  // ========================================
  // Section 2 — Store Visitation
  // ========================================

  // Visit frequency by week (aggregated across all 20 stores)
  const visitationByWeek = [
    { week: 'wk3', gross_visits: 4870, visits_zero_prev: 1704, visits_one_three_prev: 1461, visits_four_plus_prev: 1705, cost_per_visit: 2.58, visits_per_thousand: 41.2 },
    { week: 'wk4', gross_visits: 5536, visits_zero_prev: 1992, visits_one_three_prev: 1605, visits_four_plus_prev: 1939, cost_per_visit: 2.41, visits_per_thousand: 43.8 },
    { week: 'wk5', gross_visits: 5909, visits_zero_prev: 2127, visits_one_three_prev: 1714, visits_four_plus_prev: 2068, cost_per_visit: 2.31, visits_per_thousand: 44.9 },
    { week: 'wk1', gross_visits: 6326, visits_zero_prev: 2277, visits_one_three_prev: 1835, visits_four_plus_prev: 2214, cost_per_visit: 2.22, visits_per_thousand: 46.1 },
    { week: 'wk2', gross_visits: 6757, visits_zero_prev: 2432, visits_one_three_prev: 1960, visits_four_plus_prev: 2365, cost_per_visit: 2.14, visits_per_thousand: 47.3 }
  ];

  // Competitive crossover (wk2 snapshot, top competitors)
  const competitiveCrossover = [
    {
      competitor_name: 'Publix',
      competitor_store_address: '1250 S Federal Hwy, Hollywood, FL 33020',
      crossover_pct: 34.2,
      crossover_visits_zero_prev: 312,
      crossover_visits_one_three: 445,
      crossover_visits_four_plus: 558,
      trend: [28.1, 29.8, 31.4, 32.9, 34.2]
    },
    {
      competitor_name: 'ALDI',
      competitor_store_address: '3401 W Vine St, Kissimmee, FL 34741',
      crossover_pct: 18.7,
      crossover_visits_zero_prev: 198,
      crossover_visits_one_three: 267,
      crossover_visits_four_plus: 189,
      trend: [15.2, 16.1, 17.0, 17.8, 18.7]
    },
    {
      competitor_name: 'Walmart',
      competitor_store_address: '8990 Turkey Lake Rd, Orlando, FL 32819',
      crossover_pct: 22.5,
      crossover_visits_zero_prev: 245,
      crossover_visits_one_three: 310,
      crossover_visits_four_plus: 412,
      trend: [19.3, 20.1, 21.0, 21.8, 22.5]
    },
    {
      competitor_name: 'Winn-Dixie (other location)',
      competitor_store_address: '4100 N Federal Hwy, Fort Lauderdale, FL 33308',
      crossover_pct: 8.4,
      crossover_visits_zero_prev: 62,
      crossover_visits_one_three: 98,
      crossover_visits_four_plus: 145,
      trend: [7.1, 7.5, 7.8, 8.1, 8.4]
    },
    {
      competitor_name: 'Save A Lot',
      competitor_store_address: '920 S Main St, Belle Glade, FL 33430',
      crossover_pct: 6.1,
      crossover_visits_zero_prev: 78,
      crossover_visits_one_three: 52,
      crossover_visits_four_plus: 34,
      trend: [5.8, 5.9, 6.0, 6.0, 6.1]
    }
  ];

  // ========================================
  // Section 3 — Traffic Share Shift
  // ========================================

  // 20-store panel data (from Pulse / Winn-Dixie pilot)
  const storeTrafficShare = [
    { store_id: '726', city: 'St James City, FL', wk3_share: 12.9, wk2_share: 82.1, change_pp: 69.2, alert_type: 'opportunity', hhi: 3200, hhi_status: 'Highly Concentrated', primary_threat: 'Publix', primary_threat_address: '2345 Pine Island Rd, Matlacha, FL 33993', group: 'green' },
    { store_id: '381', city: 'Belle Glade, FL', wk3_share: 54.3, wk2_share: 71.1, change_pp: 16.9, alert_type: 'opportunity', hhi: 2800, hhi_status: 'Highly Concentrated', primary_threat: 'Save A Lot', primary_threat_address: '920 S Main St, Belle Glade, FL 33430', group: 'green' },
    { store_id: '336', city: 'Hollywood, FL', wk3_share: 38.8, wk2_share: 54.4, change_pp: 15.6, alert_type: 'opportunity', hhi: 2100, hhi_status: 'Moderately Concentrated', primary_threat: 'Publix', primary_threat_address: '1250 S Federal Hwy, Hollywood, FL 33020', group: 'green' },
    { store_id: '2437', city: 'Ocala, FL', wk3_share: 52.2, wk2_share: 64.1, change_pp: 12.0, alert_type: 'opportunity', hhi: 2900, hhi_status: 'Highly Concentrated', primary_threat: 'Publix', primary_threat_address: '3100 SW College Rd, Ocala, FL 34474', group: 'green' },
    { store_id: '2399', city: 'Jacksonville, FL', wk3_share: 44.8, wk2_share: 55.9, change_pp: 11.1, alert_type: 'opportunity', hhi: 2600, hhi_status: 'Highly Concentrated', primary_threat: 'Publix', primary_threat_address: '4525 San Juan Ave, Jacksonville, FL 32210', group: 'green' },
    { store_id: '2495', city: 'Tallahassee, FL', wk3_share: 48.1, wk2_share: 58.6, change_pp: 10.5, alert_type: 'opportunity', hhi: 2750, hhi_status: 'Highly Concentrated', primary_threat: 'Publix', primary_threat_address: '1700 N Monroe St, Tallahassee, FL 32303', group: 'green' },
    { store_id: '508', city: 'Fort Myers, FL', wk3_share: 42.3, wk2_share: 51.7, change_pp: 9.4, alert_type: 'opportunity', hhi: 2400, hhi_status: 'Moderately Concentrated', primary_threat: 'Publix', primary_threat_address: '4650 S Cleveland Ave, Fort Myers, FL 33907', group: 'green' },
    { store_id: '2482', city: 'Gainesville, FL', wk3_share: 46.5, wk2_share: 54.8, change_pp: 8.3, alert_type: 'opportunity', hhi: 2650, hhi_status: 'Highly Concentrated', primary_threat: 'Publix', primary_threat_address: '3720 NW 13th St, Gainesville, FL 32609', group: 'green' },
    { store_id: '2434', city: 'Daytona Beach, FL', wk3_share: 39.7, wk2_share: 47.5, change_pp: 7.8, alert_type: 'opportunity', hhi: 2350, hhi_status: 'Moderately Concentrated', primary_threat: 'Publix', primary_threat_address: '1570 W Int\'l Speedway Blvd, Daytona Beach, FL 32114', group: 'amber' },
    { store_id: '2449', city: 'Pensacola, FL', wk3_share: 51.4, wk2_share: 58.1, change_pp: 6.7, alert_type: 'opportunity', hhi: 2800, hhi_status: 'Highly Concentrated', primary_threat: 'Walmart', primary_threat_address: '2601 N Davis Hwy, Pensacola, FL 32503', group: 'amber' },
    { store_id: '2474', city: 'Melbourne, FL', wk3_share: 43.9, wk2_share: 49.8, change_pp: 5.9, alert_type: 'none', hhi: 2500, hhi_status: 'Highly Concentrated', primary_threat: 'Publix', primary_threat_address: '1555 W New Haven Ave, Melbourne, FL 32904', group: 'amber' },
    { store_id: '2480', city: 'Lakeland, FL', wk3_share: 47.2, wk2_share: 52.4, change_pp: 5.2, alert_type: 'none', hhi: 2700, hhi_status: 'Highly Concentrated', primary_threat: 'Publix', primary_threat_address: '3950 US-98 N, Lakeland, FL 33809', group: 'amber' },
    { store_id: '518', city: 'Naples, FL', wk3_share: 35.6, wk2_share: 40.1, change_pp: 4.5, alert_type: 'none', hhi: 2200, hhi_status: 'Moderately Concentrated', primary_threat: 'Publix', primary_threat_address: '5765 Naples Blvd, Naples, FL 34109', group: 'amber' },
    { store_id: '2487', city: 'Sarasota, FL', wk3_share: 41.3, wk2_share: 44.8, change_pp: 3.5, alert_type: 'none', hhi: 2550, hhi_status: 'Highly Concentrated', primary_threat: 'Publix', primary_threat_address: '3870 Bee Ridge Rd, Sarasota, FL 34233', group: 'amber' },
    { store_id: '2490', city: 'Port Charlotte, FL', wk3_share: 49.8, wk2_share: 52.1, change_pp: 2.3, alert_type: 'none', hhi: 2900, hhi_status: 'Highly Concentrated', primary_threat: 'ALDI', primary_threat_address: '1900 Tamiami Trail, Port Charlotte, FL 33948', group: 'amber' },
    { store_id: '2501', city: 'Palm Bay, FL', wk3_share: 44.1, wk2_share: 45.8, change_pp: 1.7, alert_type: 'none', hhi: 2450, hhi_status: 'Moderately Concentrated', primary_threat: 'Walmart', primary_threat_address: '1040 Malabar Rd SE, Palm Bay, FL 32907', group: 'amber' },
    { store_id: '2509', city: 'Bradenton, FL', wk3_share: 46.7, wk2_share: 47.9, change_pp: 1.2, alert_type: 'none', hhi: 2600, hhi_status: 'Highly Concentrated', primary_threat: 'Publix', primary_threat_address: '6255 Cortez Rd W, Bradenton, FL 34210', group: 'amber' },
    { store_id: '2288', city: 'Orlando, FL', wk3_share: 45.3, wk2_share: 56.7, change_pp: 11.3, alert_type: 'critical', hhi: 2350, hhi_status: 'Moderately Concentrated', primary_threat: 'Publix', primary_threat_address: '7640 W Sand Lake Rd, Orlando, FL 32819', group: 'red' },
    { store_id: '436', city: 'Lynn Haven, FL', wk3_share: 43.1, wk2_share: 40.1, change_pp: -3.1, alert_type: 'critical', hhi: 2700, hhi_status: 'Highly Concentrated', primary_threat: 'Walmart', primary_threat_address: '2101 S Hwy 77, Lynn Haven, FL 32444', group: 'red' },
    { store_id: '711', city: 'Spring Hill, FL', wk3_share: 51.2, wk2_share: 50.8, change_pp: -0.4, alert_type: 'critical', hhi: 2850, hhi_status: 'Highly Concentrated', primary_threat: 'ALDI', primary_threat_address: '1233 Wendy Ct, Spring Hill, FL 34607', group: 'red' }
  ];

  // Aggregated traffic share trend (all 20 stores)
  const trafficShareTrend = [
    { week: 'wk3', wd_share: 40.5, comp_share: 59.5, wd_visits: 48200, comp_visits: 70800 },
    { week: 'wk4', wd_share: 42.8, comp_share: 57.2, wd_visits: 52100, comp_visits: 69600 },
    { week: 'wk5', wd_share: 44.6, comp_share: 55.4, wd_visits: 55400, comp_visits: 68800 },
    { week: 'wk1', wd_share: 46.7, comp_share: 53.3, wd_visits: 58900, comp_visits: 67200 },
    { week: 'wk2', wd_share: 48.5, comp_share: 51.5, wd_visits: 62300, comp_visits: 66100 }
  ];

  // Aggregated summary (current period = wk2)
  const trafficShareSummary = {
    wd_traffic_share: 48.5,
    share_change_pp: 8.0,
    stores_outperforming: 15,
    stores_total: 20,
    wd_growth_rate: 29.3,
    comp_growth_rate: -6.6,
    growth_advantage: 35.9,
    highly_concentrated_count: 16,
    moderately_concentrated_count: 4
  };

  // Store groups
  const storeGroups = [
    { id: 'green', label: 'Green — Strong Performers', color: '#10b981', stores: ['726', '381', '336', '2437', '2399', '2495', '508', '2482'] },
    { id: 'amber', label: 'Amber — Moderate / Watch', color: '#f59e0b', stores: ['2434', '2449', '2474', '2480', '518', '2487', '2490', '2501', '2509'] },
    { id: 'red', label: 'Red — Critical / Data QA', color: '#ef4444', stores: ['2288', '436', '711'] }
  ];

  // Primary threat breakdown
  const primaryThreats = [
    { brand: 'Publix', store_count: 11 },
    { brand: 'ALDI', store_count: 3 },
    { brand: 'Walmart', store_count: 3 },
    { brand: 'Save A Lot', store_count: 1 },
    { brand: 'Other', store_count: 2 }
  ];

  // ========================================
  // Helper: get week label
  // ========================================
  function getWeekLabel(weekId) {
    const week = flightWeeks.find(w => w.id === weekId);
    if (!week) return weekId;
    const start = new Date(week.start);
    const end = new Date(week.end);
    const fmt = (d) => `${d.getMonth() + 1}/${d.getDate()}`;
    return `${week.label} (${fmt(start)}-${fmt(end)})`;
  }

  // ========================================
  // Helper: get store by ID
  // ========================================
  function getStore(storeId) {
    return storeTrafficShare.find(s => s.store_id === storeId) || null;
  }

  // ========================================
  // Helper: filter stores by group
  // ========================================
  function getStoresByGroup(groupId) {
    const group = storeGroups.find(g => g.id === groupId);
    if (!group) return [];
    return group.stores.map(id => getStore(id)).filter(Boolean);
  }

  // Public API
  return {
    flightWeeks,
    mediaBuyMetrics,
    creativeRecords,
    videoEngagement,
    demographics,
    visitationByWeek,
    competitiveCrossover,
    storeTrafficShare,
    trafficShareTrend,
    trafficShareSummary,
    storeGroups,
    primaryThreats,
    getWeekLabel,
    getStore,
    getStoresByGroup
  };
})();
