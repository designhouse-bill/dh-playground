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
    // Winn-Dixie South FL
    'store-319', 'store-336', 'store-381', 'store-508', 'store-518', 'store-726',
    // Winn-Dixie Central FL
    'store-705', 'store-2288', 'store-2415', 'store-2434', 'store-2474', 'store-2480',
    'store-2487', 'store-2490', 'store-2501', 'store-2509', 'store-2545', 'store-711',
    // Winn-Dixie North FL
    'store-86', 'store-195', 'store-560', 'store-2247', 'store-2399', 'store-2437',
    'store-2449', 'store-2482', 'store-2495', 'store-436',
    // Harveys FL
    'store-1671', 'store-1690', 'store-1692', 'store-1694', 'store-1710', 'store-1712', 'store-1716'
  ];

  const WEEKS = ['wk50', 'wk51', 'wk52', 'wk1', 'wk2'];

  // Week multipliers for trend: ramp-up through wk52, peak wk1, slight pullback wk2
  const WEEK_MULT = { wk50: 0.82, wk51: 0.89, wk52: 0.95, wk1: 1.02, wk2: 1.00 };

  // Store-level base parameters (vary by market size / geography)
  // South FL: larger markets, higher impressions, lower share (more competition)
  // North FL: smaller markets, lower impressions, higher share
  // Central FL: mid-range
  // Generate base params for any store not explicitly listed
  function defaultParams(impressions, clicks, budget, visits, share, compVisits, hhi, threat, threatAddr) {
    return { impressions, clicks, budget, visits, share, compVisits, hhi, threat, threatAddr };
  }

  const STORE_PARAMS = {
    // ── Winn-Dixie South FL ──
    'store-319':  defaultParams(7800, 68, 500, 340, 40, 7200, 2200, 'Publix', '28200 S Dixie Hwy, Homestead, FL 33033'),
    'store-336':  defaultParams(9400, 88, 580, 410, 42, 7800, 2100, 'Publix', '1250 S Federal Hwy, Hollywood, FL 33020'),
    'store-381':  defaultParams(6100, 52, 440, 285, 58, 3200, 2800, 'Save A Lot', '920 S Main St, Belle Glade, FL 33430'),
    'store-508':  defaultParams(8800, 81, 560, 380, 44, 6200, 2400, 'Publix', '4650 S Cleveland Ave, Fort Myers, FL 33907'),
    'store-518':  defaultParams(7200, 62, 480, 310, 38, 7000, 2200, 'Publix', '5765 Naples Blvd, Naples, FL 34109'),
    'store-726':  defaultParams(8200, 74, 520, 338, 62, 4800, 3200, 'Publix', '2345 Pine Island Rd, Matlacha, FL 33993'),

    // ── Winn-Dixie Central FL ──
    'store-705':  defaultParams(6800, 58, 460, 295, 50, 4500, 2650, 'Publix', '35951 US Hwy 27, Haines City, FL 33844'),
    'store-2288': defaultParams(9200, 85, 570, 395, 48, 6600, 2350, 'Publix', '7640 W Sand Lake Rd, Orlando, FL 32819'),
    'store-2415': defaultParams(8400, 76, 540, 360, 46, 6100, 2400, 'Publix', '13521 N Florida Ave, Tampa, FL 33612'),
    'store-2434': defaultParams(7000, 60, 470, 300, 45, 5500, 2350, 'Publix', '1570 W Intl Speedway Blvd, Daytona Beach, FL 32114'),
    'store-2474': defaultParams(7600, 66, 490, 325, 46, 5400, 2500, 'Publix', '1555 W New Haven Ave, Melbourne, FL 32904'),
    'store-2480': defaultParams(7400, 64, 485, 315, 50, 4800, 2700, 'Publix', '3950 US-98 N, Lakeland, FL 33809'),
    'store-2487': defaultParams(8600, 78, 550, 365, 44, 6400, 2550, 'Publix', '3870 Bee Ridge Rd, Sarasota, FL 34233'),
    'store-2490': defaultParams(6400, 54, 450, 282, 52, 3900, 2900, 'ALDI', '1900 Tamiami Trail, Port Charlotte, FL 33948'),
    'store-2501': defaultParams(5800, 48, 420, 268, 43, 5100, 2450, 'Walmart', '1040 Malabar Rd SE, Palm Bay, FL 32907'),
    'store-2509': defaultParams(7800, 68, 500, 330, 47, 5600, 2600, 'Publix', '6255 Cortez Rd W, Bradenton, FL 34210'),
    'store-2545': defaultParams(7200, 63, 480, 312, 51, 4600, 2700, 'Publix', '2510 Burnsed Blvd, The Villages, FL 32163'),
    'store-711':  defaultParams(7100, 61, 475, 305, 53, 4100, 2850, 'ALDI', '1233 Wendy Ct, Spring Hill, FL 34607'),

    // ── Winn-Dixie North FL ──
    'store-86':   defaultParams(7300, 64, 485, 318, 54, 3900, 2750, 'Publix', '1415 Timberlane Rd, Tallahassee, FL 32312'),
    'store-195':  defaultParams(8100, 73, 530, 348, 50, 5200, 2500, 'Publix', '11500 Beach Blvd, Jacksonville, FL 32246'),
    'store-560':  defaultParams(6500, 56, 450, 288, 56, 3300, 2850, 'Publix', '34940 Emerald Coast Pkwy, Destin, FL 32541'),
    'store-2247': defaultParams(6900, 59, 465, 298, 53, 3700, 2800, 'Publix', '1200 Palm Coast Pkwy NW, Palm Coast, FL 32137'),
    'store-2399': defaultParams(8000, 72, 530, 350, 52, 4800, 2600, 'Publix', '4525 San Juan Ave, Jacksonville, FL 32210'),
    'store-2437': defaultParams(6800, 58, 460, 295, 58, 3200, 2900, 'Publix', '3100 SW College Rd, Ocala, FL 34474'),
    'store-2449': defaultParams(7000, 60, 470, 300, 56, 3500, 2800, 'Walmart', '2601 N Davis Hwy, Pensacola, FL 32503'),
    'store-2482': defaultParams(7200, 63, 480, 310, 54, 3900, 2650, 'Publix', '3720 NW 13th St, Gainesville, FL 32609'),
    'store-2495': defaultParams(7500, 65, 495, 320, 55, 3800, 2750, 'Publix', '1700 N Monroe St, Tallahassee, FL 32303'),
    'store-436':  defaultParams(5600, 46, 410, 255, 48, 4200, 2700, 'Walmart', '2101 S Hwy 77, Lynn Haven, FL 32444'),

    // ── Harveys FL ──
    'store-1671': defaultParams(5200, 42, 380, 235, 44, 4800, 2600, 'Walmart', '2767 W US Hwy 90, Lake City, FL 32055'),
    'store-1690': defaultParams(5800, 48, 400, 258, 40, 5200, 2400, 'Publix', '5910 University Blvd W, Jacksonville, FL 32216'),
    'store-1692': defaultParams(4800, 38, 350, 218, 38, 5600, 2300, 'Walmart', '5250 Moncrief Rd W, Jacksonville, FL 32209'),
    'store-1694': defaultParams(4600, 36, 340, 210, 36, 5800, 2250, 'Walmart', '100 W 48th St, Jacksonville, FL 32208'),
    'store-1710': defaultParams(5400, 44, 390, 242, 42, 5000, 2500, 'Publix', '2640 US Hwy 92, Lakeland, FL 33801'),
    'store-1712': defaultParams(5100, 41, 375, 230, 41, 5100, 2450, 'Publix', '1310 Ariana St W, Lakeland, FL 33803'),
    'store-1716': defaultParams(5000, 40, 370, 225, 39, 5300, 2350, 'Walmart', '50 S Arlington Rd, Jacksonville, FL 32211')
  };

  // Creative store assignments — 5 variants across the full entity hierarchy
  // A: Winn-Dixie South (display GIF — holiday steak hero)
  // B: Winn-Dixie Central (static JPEG — general circular)
  // C: Winn-Dixie North (animated GIF — BOGO produce)
  // D: Harveys all stores (static JPEG — value pack)
  // E: Winn-Dixie South + Central (video — YouTube pre-roll)
  const CREATIVE_A_STORES = ['store-319', 'store-336', 'store-381', 'store-508', 'store-518', 'store-726'];
  const CREATIVE_B_STORES = ['store-705', 'store-2288', 'store-2415', 'store-2434', 'store-2474', 'store-2480', 'store-2487', 'store-2490', 'store-2501', 'store-2509', 'store-2545', 'store-711'];
  const CREATIVE_C_STORES = ['store-86', 'store-195', 'store-560', 'store-2247', 'store-2399', 'store-2437', 'store-2449', 'store-2482', 'store-2495', 'store-436'];
  const CREATIVE_D_STORES = ['store-1671', 'store-1690', 'store-1692', 'store-1694', 'store-1710', 'store-1712', 'store-1716'];
  const CREATIVE_E_STORES = ['store-319', 'store-336', 'store-508', 'store-518', 'store-726', 'store-705', 'store-2288', 'store-2415', 'store-2487', 'store-2509'];

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
        creative_id: CREATIVE_A_STORES.includes(storeId) ? 'creative-a'
          : CREATIVE_B_STORES.includes(storeId) ? 'creative-b'
          : CREATIVE_C_STORES.includes(storeId) ? 'creative-c'
          : CREATIVE_D_STORES.includes(storeId) ? 'creative-d'
          : 'creative-b'
      });
    });
  });

  // Additional media records for Creative E (video — runs wk5, wk1, wk2 only)
  const VIDEO_WEEKS = ['wk52', 'wk1', 'wk2'];
  CREATIVE_E_STORES.forEach(storeId => {
    const params = STORE_PARAMS[storeId];
    if (!params) return;
    VIDEO_WEEKS.forEach(weekId => {
      const wm = WEEK_MULT[weekId];
      // Video has lower impressions but similar budget (YouTube is more expensive per impression)
      const impressions = vary(Math.round(params.impressions * 0.4 * wm), storeId, weekId, 'vid-impr');
      const clicks = vary(Math.round(params.clicks * 0.3 * wm), storeId, weekId, 'vid-click');
      const budget = vary(Math.round(params.budget * 0.3 * wm), storeId, weekId, 'vid-budget');
      const grossVisits = vary(Math.round(params.visits * 0.25 * wm), storeId, weekId, 'vid-visit');

      mediaRecords.push({
        id: `media-vid-${storeId.replace('store-', '')}-${weekId}`,
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
        creative_id: 'creative-e'
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
    // Opportunity — strong performers
    'store-726': 'opportunity', 'store-381': 'opportunity', 'store-336': 'opportunity',
    'store-2437': 'opportunity', 'store-2399': 'opportunity', 'store-2495': 'opportunity',
    'store-508': 'opportunity', 'store-2482': 'opportunity', 'store-86': 'opportunity',
    'store-560': 'opportunity',
    // Critical — data QA or declining
    'store-2288': 'critical', 'store-436': 'critical', 'store-711': 'critical',
    'store-1692': 'critical', 'store-1694': 'critical'
  };

  const GROUP_MAP = {
    // Green — strong performers
    'store-726': 'green', 'store-381': 'green', 'store-336': 'green',
    'store-2437': 'green', 'store-2399': 'green', 'store-2495': 'green',
    'store-508': 'green', 'store-2482': 'green', 'store-319': 'green',
    'store-86': 'green', 'store-560': 'green', 'store-195': 'green',
    // Amber — moderate / watch
    'store-2434': 'amber', 'store-2449': 'amber', 'store-2474': 'amber',
    'store-2480': 'amber', 'store-518': 'amber', 'store-2487': 'amber',
    'store-2490': 'amber', 'store-2501': 'amber', 'store-2509': 'amber',
    'store-705': 'amber', 'store-2415': 'amber', 'store-2545': 'amber',
    'store-2247': 'amber', 'store-1671': 'amber', 'store-1710': 'amber',
    'store-1712': 'amber', 'store-1716': 'amber', 'store-1690': 'amber',
    // Red — critical / data QA
    'store-2288': 'red', 'store-436': 'red', 'store-711': 'red',
    'store-1692': 'red', 'store-1694': 'red'
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
      retailer_id: null,
      store_group: CREATIVE_A_STORES,
      creative_type: 'gif',
      dimensions: '300x250',
      width: 300,
      height: 250,
      target_url: 'https://www.winndixie.com/circular?week=12&promo=steak',
      file_url: null,
      date_range_start: '2025-12-10',
      date_range_end: '2025-12-30',
      uploaded_by: 'tammy.mdi',
      uploaded_at: '2025-12-09T14:30:00Z',
      notes: 'Holiday T-bone steak hero — animated price drop GIF',
      label: 'Holiday Steak — South FL'
    },
    {
      creative_id: 'creative-b',
      retailer_id: null,
      store_group: CREATIVE_B_STORES,
      creative_type: 'jpeg',
      dimensions: '728x90',
      width: 728,
      height: 90,
      target_url: 'https://www.winndixie.com/circular?week=12',
      file_url: null,
      date_range_start: '2025-12-10',
      date_range_end: '2025-12-30',
      uploaded_by: 'tammy.mdi',
      uploaded_at: '2025-12-09T14:35:00Z',
      notes: 'Holiday general circular hero — leaderboard banner',
      label: 'Holiday Banner — Central FL'
    },
    {
      creative_id: 'creative-c',
      retailer_id: null,
      store_group: CREATIVE_C_STORES,
      creative_type: 'gif',
      dimensions: '320x480',
      width: 320,
      height: 480,
      target_url: 'https://www.winndixie.com/circular?week=12&promo=bogo-produce',
      file_url: null,
      date_range_start: '2025-12-17',
      date_range_end: '2026-01-06',
      uploaded_by: 'tammy.mdi',
      uploaded_at: '2025-12-16T10:00:00Z',
      notes: 'BOGO Fresh Produce — tall interstitial animation',
      label: 'BOGO Produce — North FL'
    },
    {
      creative_id: 'creative-d',
      retailer_id: null,
      store_group: CREATIVE_D_STORES,
      creative_type: 'jpeg',
      dimensions: '300x250',
      width: 300,
      height: 250,
      target_url: 'https://www.harveyssupermarkets.com/circular?week=12&promo=value',
      file_url: null,
      date_range_start: '2025-12-10',
      date_range_end: '2025-12-30',
      uploaded_by: 'tammy.mdi',
      uploaded_at: '2025-12-09T15:00:00Z',
      notes: 'Harveys Value Pack holiday bundle — medium rectangle',
      label: 'Value Pack — Harveys'
    },
    {
      creative_id: 'creative-e',
      retailer_id: null,
      store_group: CREATIVE_E_STORES,
      creative_type: 'video',
      dimensions: '1920x1080',
      width: 1920,
      height: 1080,
      target_url: 'https://www.youtube.com/watch?v=seg-holiday-2025',
      file_url: null,
      date_range_start: '2025-12-24',
      date_range_end: '2026-01-06',
      uploaded_by: 'adam.seg',
      uploaded_at: '2025-12-23T09:00:00Z',
      notes: 'YouTube pre-roll 15s — "Holiday Savings Start Here"',
      label: 'YouTube Pre-Roll — Holiday'
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
    GROUP_MAP,

    // Competitor store locations — derived from STORE_PARAMS threat data
    // Each has: id, brand, address, lat, lng, and the SEG stores it threatens
    COMPETITOR_STORES: [
      // ── Publix ──
      { id: 'comp-pub-1',  brand: 'Publix', address: '28200 S Dixie Hwy, Homestead, FL 33033',         lat: 25.475, lng: -80.440, threatens: ['store-319'] },
      { id: 'comp-pub-2',  brand: 'Publix', address: '1250 S Federal Hwy, Hollywood, FL 33020',         lat: 26.010, lng: -80.145, threatens: ['store-336'] },
      { id: 'comp-pub-3',  brand: 'Publix', address: '4650 S Cleveland Ave, Fort Myers, FL 33907',      lat: 26.598, lng: -81.870, threatens: ['store-508'] },
      { id: 'comp-pub-4',  brand: 'Publix', address: '5765 Naples Blvd, Naples, FL 34109',              lat: 26.241, lng: -81.760, threatens: ['store-518'] },
      { id: 'comp-pub-5',  brand: 'Publix', address: '2345 Pine Island Rd, Matlacha, FL 33993',         lat: 26.636, lng: -82.072, threatens: ['store-726'] },
      { id: 'comp-pub-6',  brand: 'Publix', address: '35951 US Hwy 27, Haines City, FL 33844',          lat: 28.088, lng: -81.617, threatens: ['store-705'] },
      { id: 'comp-pub-7',  brand: 'Publix', address: '7640 W Sand Lake Rd, Orlando, FL 32819',          lat: 28.449, lng: -81.470, threatens: ['store-2288'] },
      { id: 'comp-pub-8',  brand: 'Publix', address: '13521 N Florida Ave, Tampa, FL 33612',            lat: 28.060, lng: -82.459, threatens: ['store-2415'] },
      { id: 'comp-pub-9',  brand: 'Publix', address: '1570 W Intl Speedway Blvd, Daytona Beach, FL 32114', lat: 29.210, lng: -81.065, threatens: ['store-2434'] },
      { id: 'comp-pub-10', brand: 'Publix', address: '1555 W New Haven Ave, Melbourne, FL 32904',       lat: 28.078, lng: -80.640, threatens: ['store-2474'] },
      { id: 'comp-pub-11', brand: 'Publix', address: '3950 US-98 N, Lakeland, FL 33809',                lat: 28.080, lng: -81.970, threatens: ['store-2480'] },
      { id: 'comp-pub-12', brand: 'Publix', address: '3870 Bee Ridge Rd, Sarasota, FL 34233',           lat: 27.302, lng: -82.480, threatens: ['store-2487'] },
      { id: 'comp-pub-13', brand: 'Publix', address: '6255 Cortez Rd W, Bradenton, FL 34210',           lat: 27.463, lng: -82.600, threatens: ['store-2509'] },
      { id: 'comp-pub-14', brand: 'Publix', address: '2510 Burnsed Blvd, The Villages, FL 32163',       lat: 28.930, lng: -81.990, threatens: ['store-2545'] },
      { id: 'comp-pub-15', brand: 'Publix', address: '1415 Timberlane Rd, Tallahassee, FL 32312',       lat: 30.490, lng: -84.310, threatens: ['store-86'] },
      { id: 'comp-pub-16', brand: 'Publix', address: '11500 Beach Blvd, Jacksonville, FL 32246',        lat: 30.290, lng: -81.528, threatens: ['store-195'] },
      { id: 'comp-pub-17', brand: 'Publix', address: '34940 Emerald Coast Pkwy, Destin, FL 32541',      lat: 30.393, lng: -86.460, threatens: ['store-560'] },
      { id: 'comp-pub-18', brand: 'Publix', address: '1200 Palm Coast Pkwy NW, Palm Coast, FL 32137',   lat: 29.565, lng: -81.230, threatens: ['store-2247'] },
      { id: 'comp-pub-19', brand: 'Publix', address: '4525 San Juan Ave, Jacksonville, FL 32210',       lat: 30.298, lng: -81.733, threatens: ['store-2399'] },
      { id: 'comp-pub-20', brand: 'Publix', address: '3100 SW College Rd, Ocala, FL 34474',             lat: 29.170, lng: -82.180, threatens: ['store-2437'] },
      { id: 'comp-pub-21', brand: 'Publix', address: '3720 NW 13th St, Gainesville, FL 32609',          lat: 29.680, lng: -82.340, threatens: ['store-2482'] },
      { id: 'comp-pub-22', brand: 'Publix', address: '1700 N Monroe St, Tallahassee, FL 32303',         lat: 30.455, lng: -84.275, threatens: ['store-2495'] },
      { id: 'comp-pub-23', brand: 'Publix', address: '5910 University Blvd W, Jacksonville, FL 32216',  lat: 30.263, lng: -81.590, threatens: ['store-1690'] },
      { id: 'comp-pub-24', brand: 'Publix', address: '2640 US Hwy 92, Lakeland, FL 33801',              lat: 28.040, lng: -81.950, threatens: ['store-1710'] },
      { id: 'comp-pub-25', brand: 'Publix', address: '1310 Ariana St W, Lakeland, FL 33803',            lat: 28.030, lng: -81.970, threatens: ['store-1712'] },

      // ── Walmart ──
      { id: 'comp-wm-1', brand: 'Walmart', address: '2601 N Davis Hwy, Pensacola, FL 32503',           lat: 30.448, lng: -87.230, threatens: ['store-2449'] },
      { id: 'comp-wm-2', brand: 'Walmart', address: '1040 Malabar Rd SE, Palm Bay, FL 32907',           lat: 28.003, lng: -80.621, threatens: ['store-2501'] },
      { id: 'comp-wm-3', brand: 'Walmart', address: '2101 S Hwy 77, Lynn Haven, FL 32444',              lat: 30.227, lng: -85.640, threatens: ['store-436'] },
      { id: 'comp-wm-4', brand: 'Walmart', address: '2767 W US Hwy 90, Lake City, FL 32055',            lat: 30.188, lng: -82.664, threatens: ['store-1671'] },
      { id: 'comp-wm-5', brand: 'Walmart', address: '5250 Moncrief Rd W, Jacksonville, FL 32209',       lat: 30.365, lng: -81.710, threatens: ['store-1692'] },
      { id: 'comp-wm-6', brand: 'Walmart', address: '100 W 48th St, Jacksonville, FL 32208',            lat: 30.387, lng: -81.670, threatens: ['store-1694'] },
      { id: 'comp-wm-7', brand: 'Walmart', address: '50 S Arlington Rd, Jacksonville, FL 32211',        lat: 30.329, lng: -81.600, threatens: ['store-1716'] },

      // ── ALDI ──
      { id: 'comp-aldi-1', brand: 'ALDI', address: '1900 Tamiami Trail, Port Charlotte, FL 33948',      lat: 26.985, lng: -82.120, threatens: ['store-2490'] },
      { id: 'comp-aldi-2', brand: 'ALDI', address: '1233 Wendy Ct, Spring Hill, FL 34607',              lat: 28.482, lng: -82.548, threatens: ['store-711'] },

      // ── Save A Lot ──
      { id: 'comp-sal-1', brand: 'Save A Lot', address: '920 S Main St, Belle Glade, FL 33430',         lat: 26.678, lng: -80.670, threatens: ['store-381'] }
    ]
  };
})();
