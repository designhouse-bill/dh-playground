/**
 * Distribution Records — Atomic Data
 * Store × Week granularity for all distribution metrics
 *
 * Record types:
 *   A. Media Delivery  (20 stores × 5 weeks = 100)
 *   B. Visitation       (20 stores × 5 weeks = 100)
 *   C. Traffic Share     (20 stores × 5 weeks = 100)
 *   D. Crossover         (5 competitors × 5 weeks = 25)
 *   E. Static            (creatives, video, demographics)
 *
 * Total: ~325 atomic records
 */

const DistributionRecords = (function() {
  'use strict';

  // ========================================
  // Store IDs (ordered by brand)
  // ========================================

  const STORE_IDS = [
    // South Florida
    'store-726', 'store-381', 'store-336', 'store-508', 'store-518', 'store-2474', 'store-2501',
    // Central Florida
    'store-2288', 'store-2434', 'store-2480', 'store-2487', 'store-2490', 'store-2509', 'store-711',
    // North Florida
    'store-2437', 'store-2399', 'store-2495', 'store-2482', 'store-2449', 'store-436'
  ];

  const WEEKS = ['wk3', 'wk4', 'wk5', 'wk1', 'wk2'];

  // Week multipliers for trend: ramp-up through wk5, peak wk1, slight pullback wk2
  const WEEK_MULT = { wk3: 0.82, wk4: 0.89, wk5: 0.95, wk1: 1.02, wk2: 1.00 };

  // Store-level base parameters (vary by market size / geography)
  // South FL: larger markets, higher impressions, lower share (more competition)
  // North FL: smaller markets, lower impressions, higher share
  // Central FL: mid-range
  const STORE_PARAMS = {
    // South Florida — larger markets, more competition
    'store-726':  { impressions: 8200, clicks: 74, budget: 520, visits: 338, share: 62, compVisits: 4800, hhi: 3200, threat: 'Publix', threatAddr: '2345 Pine Island Rd, Matlacha, FL 33993' },
    'store-381':  { impressions: 6100, clicks: 52, budget: 440, visits: 285, share: 58, compVisits: 3200, hhi: 2800, threat: 'Save A Lot', threatAddr: '920 S Main St, Belle Glade, FL 33430' },
    'store-336':  { impressions: 9400, clicks: 88, budget: 580, visits: 410, share: 42, compVisits: 7800, hhi: 2100, threat: 'Publix', threatAddr: '1250 S Federal Hwy, Hollywood, FL 33020' },
    'store-508':  { impressions: 8800, clicks: 81, budget: 560, visits: 380, share: 44, compVisits: 6200, hhi: 2400, threat: 'Publix', threatAddr: '4650 S Cleveland Ave, Fort Myers, FL 33907' },
    'store-518':  { impressions: 7200, clicks: 62, budget: 480, visits: 310, share: 38, compVisits: 7000, hhi: 2200, threat: 'Publix', threatAddr: '5765 Naples Blvd, Naples, FL 34109' },
    'store-2474': { impressions: 7600, clicks: 66, budget: 490, visits: 325, share: 46, compVisits: 5400, hhi: 2500, threat: 'Publix', threatAddr: '1555 W New Haven Ave, Melbourne, FL 32904' },
    'store-2501': { impressions: 5800, clicks: 48, budget: 420, visits: 268, share: 43, compVisits: 5100, hhi: 2450, threat: 'Walmart', threatAddr: '1040 Malabar Rd SE, Palm Bay, FL 32907' },

    // Central Florida — mid-range
    'store-2288': { impressions: 9200, clicks: 85, budget: 570, visits: 395, share: 48, compVisits: 6600, hhi: 2350, threat: 'Publix', threatAddr: '7640 W Sand Lake Rd, Orlando, FL 32819' },
    'store-2434': { impressions: 7000, clicks: 60, budget: 470, visits: 300, share: 45, compVisits: 5500, hhi: 2350, threat: 'Publix', threatAddr: '1570 W Intl Speedway Blvd, Daytona Beach, FL 32114' },
    'store-2480': { impressions: 7400, clicks: 64, budget: 485, visits: 315, share: 50, compVisits: 4800, hhi: 2700, threat: 'Publix', threatAddr: '3950 US-98 N, Lakeland, FL 33809' },
    'store-2487': { impressions: 8600, clicks: 78, budget: 550, visits: 365, share: 44, compVisits: 6400, hhi: 2550, threat: 'Publix', threatAddr: '3870 Bee Ridge Rd, Sarasota, FL 34233' },
    'store-2490': { impressions: 6400, clicks: 54, budget: 450, visits: 282, share: 52, compVisits: 3900, hhi: 2900, threat: 'ALDI', threatAddr: '1900 Tamiami Trail, Port Charlotte, FL 33948' },
    'store-2509': { impressions: 7800, clicks: 68, budget: 500, visits: 330, share: 47, compVisits: 5600, hhi: 2600, threat: 'Publix', threatAddr: '6255 Cortez Rd W, Bradenton, FL 34210' },
    'store-711':  { impressions: 7100, clicks: 61, budget: 475, visits: 305, share: 53, compVisits: 4100, hhi: 2850, threat: 'ALDI', threatAddr: '1233 Wendy Ct, Spring Hill, FL 34607' },

    // North Florida — smaller markets, higher share
    'store-2437': { impressions: 6800, clicks: 58, budget: 460, visits: 295, share: 58, compVisits: 3200, hhi: 2900, threat: 'Publix', threatAddr: '3100 SW College Rd, Ocala, FL 34474' },
    'store-2399': { impressions: 8000, clicks: 72, budget: 530, visits: 350, share: 52, compVisits: 4800, hhi: 2600, threat: 'Publix', threatAddr: '4525 San Juan Ave, Jacksonville, FL 32210' },
    'store-2495': { impressions: 7500, clicks: 65, budget: 495, visits: 320, share: 55, compVisits: 3800, hhi: 2750, threat: 'Publix', threatAddr: '1700 N Monroe St, Tallahassee, FL 32303' },
    'store-2482': { impressions: 7200, clicks: 63, budget: 480, visits: 310, share: 54, compVisits: 3900, hhi: 2650, threat: 'Publix', threatAddr: '3720 NW 13th St, Gainesville, FL 32609' },
    'store-2449': { impressions: 7000, clicks: 60, budget: 470, visits: 300, share: 56, compVisits: 3500, hhi: 2800, threat: 'Walmart', threatAddr: '2601 N Davis Hwy, Pensacola, FL 32503' },
    'store-436':  { impressions: 5600, clicks: 46, budget: 410, visits: 255, share: 48, compVisits: 4200, hhi: 2700, threat: 'Walmart', threatAddr: '2101 S Hwy 77, Lynn Haven, FL 32444' }
  };

  // Creative assignment: A/B split
  const CREATIVE_A_STORES = ['store-726', 'store-381', 'store-336', 'store-2437', 'store-2288', 'store-2399', 'store-2495', 'store-508', 'store-2482', 'store-2434'];
  const CREATIVE_B_STORES = ['store-436', 'store-711', 'store-518', 'store-2449', 'store-2474', 'store-2480', 'store-2487', 'store-2490', 'store-2501', 'store-2509'];

  // ========================================
  // Deterministic variance (seeded by store + week)
  // ========================================

  function seedRandom(storeId, weekId, salt) {
    // Simple hash to get deterministic but varied values
    let hash = 0;
    const str = storeId + weekId + (salt || '');
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    // Return a value between -0.15 and +0.15 (±15% variance)
    return ((Math.abs(hash) % 300) - 150) / 1000;
  }

  function vary(base, storeId, weekId, salt) {
    return Math.round(base * (1 + seedRandom(storeId, weekId, salt)));
  }

  // ========================================
  // A. Media Delivery Records (20 × 5 = 100)
  // ========================================

  const mediaRecords = [];

  STORE_IDS.forEach(storeId => {
    const params = STORE_PARAMS[storeId];
    WEEKS.forEach(weekId => {
      const wm = WEEK_MULT[weekId];
      const impressions = vary(params.impressions * wm, storeId, weekId, 'impr');
      const clicks = vary(params.clicks * wm, storeId, weekId, 'click');
      const budget = vary(params.budget * wm, storeId, weekId, 'budget');
      const grossVisits = vary(params.visits * wm, storeId, weekId, 'visit');

      mediaRecords.push({
        id: `media-${storeId.replace('store-', '')}-${weekId}`,
        store_id: storeId,
        week_id: weekId,
        impressions: impressions,
        clicks: clicks,
        ctr: parseFloat(((clicks / impressions) * 100).toFixed(2)),
        cost_per_impression: parseFloat((budget / impressions).toFixed(4)),
        budget_allocated: budget,
        gross_visits: grossVisits,
        cost_per_visit: parseFloat((budget / grossVisits).toFixed(2)),
        visits_per_thousand: parseFloat(((grossVisits / impressions) * 1000).toFixed(1)),
        creative_id: CREATIVE_A_STORES.includes(storeId) ? 'creative-a' : 'creative-b'
      });
    });
  });

  // ========================================
  // B. Visitation Records (20 × 5 = 100)
  // ========================================

  const visitationRecords = [];

  STORE_IDS.forEach(storeId => {
    const params = STORE_PARAMS[storeId];
    WEEKS.forEach(weekId => {
      const wm = WEEK_MULT[weekId];
      const grossVisits = vary(params.visits * wm, storeId, weekId, 'visit');

      // Frequency distribution: ~35% zero, ~30% 1-3, ~35% 4+
      const zeroPct = 0.35 + seedRandom(storeId, weekId, 'zero') * 0.5;
      const onePct = 0.30 + seedRandom(storeId, weekId, 'one') * 0.3;
      const fourPlusPct = 1 - zeroPct - onePct;

      const visitsZero = Math.round(grossVisits * zeroPct);
      const visitsOneThree = Math.round(grossVisits * onePct);
      const visitsFourPlus = grossVisits - visitsZero - visitsOneThree;

      const budget = vary(params.budget * wm, storeId, weekId, 'budget');

      visitationRecords.push({
        id: `visit-${storeId.replace('store-', '')}-${weekId}`,
        store_id: storeId,
        week_id: weekId,
        gross_visits: grossVisits,
        visits_zero_prev: visitsZero,
        visits_one_three_prev: visitsOneThree,
        visits_four_plus_prev: visitsFourPlus,
        cost_per_visit: parseFloat((budget / grossVisits).toFixed(2))
      });
    });
  });

  // ========================================
  // C. Traffic Share Records (20 × 5 = 100)
  // ========================================

  // Alert assignments from existing data
  const ALERT_MAP = {
    'store-726': 'opportunity', 'store-381': 'opportunity', 'store-336': 'opportunity',
    'store-2437': 'opportunity', 'store-2399': 'opportunity', 'store-2495': 'opportunity',
    'store-508': 'opportunity', 'store-2482': 'opportunity',
    'store-2288': 'critical', 'store-436': 'critical', 'store-711': 'critical'
  };

  // Group assignments from existing data
  const GROUP_MAP = {
    'store-726': 'green', 'store-381': 'green', 'store-336': 'green',
    'store-2437': 'green', 'store-2399': 'green', 'store-2495': 'green',
    'store-508': 'green', 'store-2482': 'green',
    'store-2434': 'amber', 'store-2449': 'amber', 'store-2474': 'amber',
    'store-2480': 'amber', 'store-518': 'amber', 'store-2487': 'amber',
    'store-2490': 'amber', 'store-2501': 'amber', 'store-2509': 'amber',
    'store-2288': 'red', 'store-436': 'red', 'store-711': 'red'
  };

  const trafficRecords = [];

  STORE_IDS.forEach(storeId => {
    const params = STORE_PARAMS[storeId];
    const alert = ALERT_MAP[storeId] || 'none';
    const group = GROUP_MAP[storeId] || 'amber';

    // Generate share trajectory per store
    // Green stores: share increases significantly over campaign
    // Amber stores: share increases moderately
    // Red stores: share flat or declining
    WEEKS.forEach((weekId, weekIdx) => {
      let shareBase;
      if (group === 'green') {
        // Share increases ~10-70pp from wk3 to wk2
        const growthRange = params.share - (params.share * 0.3);
        shareBase = (params.share * 0.3) + (growthRange * (weekIdx / 4));
      } else if (group === 'red') {
        // Share flat or slightly declining
        shareBase = params.share + (seedRandom(storeId, weekId, 'share') * 20) - (weekIdx * 0.5);
      } else {
        // Amber: moderate growth ~2-8pp
        const growth = 2 + (seedRandom(storeId, 'base', 'growth') + 0.15) * 20;
        shareBase = (params.share - growth / 2) + (growth * (weekIdx / 4));
      }

      const share = parseFloat(Math.max(10, Math.min(85, shareBase + seedRandom(storeId, weekId, 'share') * 10)).toFixed(1));
      const retailerVisits = vary(params.visits * 12 * WEEK_MULT[weekId], storeId, weekId, 'wdv');
      const compVisits = vary(params.compVisits * WEEK_MULT[weekId], storeId, weekId, 'comp');

      trafficRecords.push({
        id: `traffic-${storeId.replace('store-', '')}-${weekId}`,
        store_id: storeId,
        week_id: weekId,
        retailer_visits: retailerVisits,
        comp_visits: compVisits,
        total_market_visits: retailerVisits + compVisits,
        retailer_share: share,
        hhi: params.hhi + vary(0, storeId, weekId, 'hhi') * 2,
        primary_threat: params.threat,
        primary_threat_address: params.threatAddr,
        alert_type: alert,
        group: group
      });
    });
  });

  // ========================================
  // D. Competitive Crossover Records (5 × 5 = 25)
  // ========================================

  const COMPETITORS = [
    { name: 'Publix', address: '1250 S Federal Hwy, Hollywood, FL 33020', basePct: 28.1, growthRate: 1.5 },
    { name: 'Walmart', address: '8990 Turkey Lake Rd, Orlando, FL 32819', basePct: 19.3, growthRate: 0.8 },
    { name: 'ALDI', address: '3401 W Vine St, Kissimmee, FL 34741', basePct: 15.2, growthRate: 0.9 },
    { name: 'Retailer (other location)', address: '4100 N Federal Hwy, Fort Lauderdale, FL 33308', basePct: 7.1, growthRate: 0.3 },
    { name: 'Save A Lot', address: '920 S Main St, Belle Glade, FL 33430', basePct: 5.8, growthRate: 0.08 }
  ];

  const crossoverRecords = [];

  COMPETITORS.forEach(comp => {
    WEEKS.forEach((weekId, weekIdx) => {
      const pct = parseFloat((comp.basePct + (comp.growthRate * weekIdx)).toFixed(1));
      // Distribute visit buckets
      const totalBase = 800 + (pct * 20);
      const zeroPrev = Math.round(totalBase * 0.24);
      const oneThree = Math.round(totalBase * 0.34);
      const fourPlus = Math.round(totalBase * 0.42);

      crossoverRecords.push({
        id: `xover-${comp.name.toLowerCase().replace(/[^a-z]/g, '')}-${weekId}`,
        competitor_name: comp.name,
        competitor_store_address: comp.address,
        week_id: weekId,
        crossover_pct: pct,
        crossover_visits_zero_prev: zeroPrev + vary(0, comp.name, weekId, 'xz'),
        crossover_visits_one_three: oneThree + vary(0, comp.name, weekId, 'x1'),
        crossover_visits_four_plus: fourPlus + vary(0, comp.name, weekId, 'x4')
      });
    });
  });

  // ========================================
  // E. Static Records (not per-week)
  // ========================================

  const creativeRecords = [
    {
      creative_id: 'creative-a',
      retailer_id: null,  // Set dynamically from DistributionEntities.retailerConfig.id
      store_group: CREATIVE_A_STORES,
      creative_type: 'gif',
      file_url: null,
      date_range_start: '2025-12-10',
      date_range_end: '2025-12-30',
      uploaded_by: 'tammy.mdi',
      uploaded_at: '2025-12-09T14:30:00Z',
      notes: 'Holiday T-bone steak hero — animated price drop GIF',
      label: 'Holiday Steak A'
    },
    {
      creative_id: 'creative-b',
      retailer_id: null,  // Set dynamically from DistributionEntities.retailerConfig.id
      store_group: CREATIVE_B_STORES,
      creative_type: 'jpeg',
      file_url: null,
      date_range_start: '2025-12-10',
      date_range_end: '2025-12-30',
      uploaded_by: 'tammy.mdi',
      uploaded_at: '2025-12-09T14:35:00Z',
      notes: 'Holiday general circular hero — static JPEG',
      label: 'Holiday General B'
    }
  ];

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

  const demographics = {
    period: '11/28/2025 - 12/31/2025',
    retailer: null,  // Set dynamically from DistributionEntities.retailerConfig.name
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
  // Public API
  // ========================================

  return {
    mediaRecords,
    visitationRecords,
    trafficRecords,
    crossoverRecords,
    creativeRecords,
    videoEngagement,
    demographics,
    // Expose constants for data module
    STORE_IDS,
    WEEKS,
    WEEK_MULT,
    STORE_PARAMS,
    ALERT_MAP,
    GROUP_MAP
  };
})();
