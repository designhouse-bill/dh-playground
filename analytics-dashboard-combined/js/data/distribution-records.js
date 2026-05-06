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
 *
 * ─────────────────────────────────────────────────────────────────────
 * PULSE CSV → MOCK FIELD MAPPING (for Angular ingest alignment)
 * Source: dh.idealmedialab.com (Pulse DSP / api.adinfra.io)
 * ─────────────────────────────────────────────────────────────────────
 *
 * /dsp/campaign export columns → mock fields:
 *   Agency ID            → (not modeled — single agency)
 *   Advertiser ID        → entity.id (DistributionEntities)
 *   Advertiser Name      → entity.name
 *   ID                   → creative_id  (Pulse "campaign" = our "creative" 1:1)
 *   Name                 → creative.label
 *   Group                → creative.group       (e.g. "SEG 27")
 *   Channel              → creative.channel     ('display' | 'youtube' | 'meta')
 *   On/Off               → creative.status_on   ('on' | 'off')
 *   Status               → creative.status      ('Live' | 'Paused' | 'Ended')
 *   Audience ID          → (not modeled — single audience per creative for demo)
 *   Creative IDs         → (not modeled — Pulse calls assets "Creative IDs"; we
 *                            collapse to one creative-per-campaign)
 *   KPI                  → creative.kpi         ('awareness' | 'click_and_traffic' | 'conversions' | 'video')
 *   KPI metric           → creative.kpi_metric  ('ctr' | 'cpa' | 'vcr')
 *   KPI value            → creative.kpi_value   (numeric target, e.g. 0.6 for CTR)
 *   Is Ongoing           → creative.flights.length > 0 ? 'on' : 'off'
 *   Ongoing Interval     → 'flights' (we only model the flight pattern)
 *   Ongoing Flights      → creative.flights[]   ([{start, end, budget}])
 *   Budget($)            → sum(creative.flights[].budget)
 *   Start Date           → creative.flights[0].start
 *   End Date             → creative.flights[creative.flights.length-1].end
 *   Max Bid($)           → (not modeled)
 *   Daily cap($)         → (not modeled)
 *   Frequency amount     → creative.frequency_amount   (e.g. 4)
 *   Frequency interval   → creative.frequency_interval (e.g. 'hour')
 *   Pacing               → creative.pacing             (e.g. 'evenly')
 *   Conversion Tracking  → (not modeled)
 *
 * /dsp/reporting/campaign export columns → mock mediaRecords fields:
 *   ID                   → mediaRecord.creative_id (1:1 in mock)
 *   Campaign Name        → creativeRecord.label
 *   Impressions          → mediaRecord.impressions
 *   Clicks               → mediaRecord.clicks
 *   CTR                  → mediaRecord.ctr
 *   CPM                  → mediaRecord.cpm
 *   CPC                  → mediaRecord.cpc
 *   Conversions          → visitationRecord.gross_visits  (visit-attribution conversions)
 *   CPA                  → visitationRecord.cpa  (alias of cost_per_visit)
 *   VCR                  → videoEngagement.video_completion_rate
 *   Spend                → mediaRecord.spend  (alias of budget_allocated)
 *   Status               → mediaRecord.status
 *
 * /dsp/activate_creatives export columns → mock creativeRecords fields:
 *   Creative ID          → creative.creative_id
 *   Creative Name        → creative.label
 *   Type                 → creative.pulse_type  ('BannerAd' | 'MetaSingleImageVideoAd' | 'VideoAd')
 *                            mapped from creative.creative_type ('jpeg'|'gif'|'video') for UI
 *   On/Off               → creative.status_on
 *   File URL             → creative.file_url   (https://img.adinfra.io/creative/{id}/{filename})
 *   Landing Page         → creative.landing_page  (alias of target_url)
 *   Click URL Tracker    → (not modeled)
 *   Display URL          → (not modeled)
 *   Impression Tracker   → (not modeled)
 *   Ad Tag               → (not modeled)
 *   Start Date           → creative.date_range_start
 *   End Date             → creative.date_range_end
 *   Meta Primary Text…   → (Meta-only — not modeled for SEG which is display-only)
 *   YouTube Video Link…  → (YouTube-only — not modeled)
 *
 * Pulse "Type" enum observed in real exports:
 *   BannerAd                  — display banner (jpeg/gif/png)
 *   MetaSingleImageVideoAd    — Meta channel video creative
 *   VideoAd                   — assumed YouTube/CTV video (verify with Greenberg)
 * ─────────────────────────────────────────────────────────────────────
 */

const DistributionRecords = (function() {
  'use strict';

  // ────────────────────────────────────────────────────────────────────
  // Real Pulse data injection (2026-04-27)
  // PulseReal (js/data/pulse-real.js) holds raw CSV exports — direct port
  // from idealmedialab.com. Where a mock store has a real campaign match,
  // we OVERRIDE synthetic budget/group/status/flights/kpi/frequency with
  // the real values. Reporting metrics (impressions/clicks/CTR/CPM/CPC)
  // are NOT in the SEG export, so per-week metrics remain synthetic until
  // Greenberg/Pulse provides reporting for SEG IDs.
  // See pulse-real.js header for full transition mapping.
  // ────────────────────────────────────────────────────────────────────
  const PULSE = (typeof PulseReal !== 'undefined') ? PulseReal : null;

  // Helper: pull real per-store primary campaign by store number.
  // Returns null when unmatched (10 of 35 stores: 508, 518, 2399, 2434,
  // 2449, 2474, 2480, 2482, 2490, 2501).
  function realCampaignForStore(storeId) {
    if (!PULSE) return null;
    const m = /store-(\d+)/.exec(storeId);
    if (!m) return null;
    return PULSE.primaryCampaignForStoreNumber(parseInt(m[1], 10));
  }

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

  // ────────────────────────────────────────────────────────────────────
  // Flight weeks — generated forward so demo stays populated as time advances.
  // Anchor: 2025-12-10 (Wed) = wk50/2025. Sequential 7-day Wed–Tue weeks
  // through wk52/2026. Adam can keep showing this for the full year without
  // running out of dates.
  // ────────────────────────────────────────────────────────────────────
  function generateFlightWeeks() {
    var seq = [];
    for (var n = 1; n <= 52; n++) seq.push({ id: 'wk' + n, label: 'Week ' + n });
    var anchor = Date.UTC(2025, 11, 31); // Dec 31, 2025 (Wed) = wk1/2026
    var oneDay = 86400000;
    return seq.map(function (w, idx) {
      var s = new Date(anchor + idx * 7 * oneDay);
      var e = new Date(s.getTime() + 6 * oneDay);
      return {
        id: w.id,
        label: w.label,
        start: s.toISOString().slice(0, 10),
        end: e.toISOString().slice(0, 10)
      };
    });
  }

  const flightWeeks = generateFlightWeeks();
  const WEEKS = flightWeeks.map(function (w) { return w.id; });

  // Trend multipliers: original ramp wk50→wk2 preserved, all later weeks
  // default 1.0 with seeded ±15% variance still applied per record.
  const WEEK_MULT = WEEKS.reduce(function (acc, id) { acc[id] = 1.0; return acc; }, {});
  WEEK_MULT.wk50 = 0.82;
  WEEK_MULT.wk51 = 0.89;
  WEEK_MULT.wk52 = 0.95;
  WEEK_MULT.wk1  = 1.02;
  WEEK_MULT.wk2  = 1.00;

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

  // ────────────────────────────────────────────────────────────────────
  // Real-data overlay on STORE_PARAMS — 25 of 35 stores have real
  // SEG campaign budgets. We replace the synthetic per-store .budget
  // with the real total Budget($) from /dsp/campaign so downstream
  // budget/spend math reflects real Pulse values.
  // ────────────────────────────────────────────────────────────────────
  Object.keys(STORE_PARAMS).forEach(storeId => {
    const real = realCampaignForStore(storeId);
    if (real && real['Budget($)']) {
      STORE_PARAMS[storeId].real_pulse_campaign_id = real.ID;
      STORE_PARAMS[storeId].real_pulse_budget_total = parseFloat(real['Budget($)']);
      STORE_PARAMS[storeId].real_pulse_group = real.Group;
      STORE_PARAMS[storeId].real_pulse_status = real.Status;
      STORE_PARAMS[storeId].real_pulse_kpi = real.KPI;
      STORE_PARAMS[storeId].real_pulse_kpi_metric = real['KPI metric'];
      STORE_PARAMS[storeId].real_pulse_name = real.Name;
      // Override synthetic budget with real total — no alteration of value.
      STORE_PARAMS[storeId].budget = parseFloat(real['Budget($)']);
    }
  });

  // ────────────────────────────────────────────────────────────────────
  // Non-SEG store extension — drive params from real Pulse data where
  // available (campaign Budget($) + reporting Impressions/Clicks/Spend/
  // Conversions). Falls back to seeded synthetic only when neither is
  // present. Numbers represent the cumulative campaign run; record-level
  // generation below distributes them across the dataset's flight weeks.
  // ────────────────────────────────────────────────────────────────────
  function _parseMoney(s) { return parseFloat(String(s == null ? '' : s).replace(/[$,]/g, '')) || 0; }
  function _parseNum(s)   { return parseInt(String(s == null ? '' : s).replace(/,/g, ''), 10) || 0; }

  // Compute the list of dataset weeks that overlap a campaign's flight window
  // (Start Date / End Date). Returned ids gate per-week record generation
  // below so non-SEG stores only show data for weeks the campaign actually ran.
  function _activeWeeksForCampaign(campaign) {
    if (!campaign) return null;
    var s = campaign['Start Date'], e = campaign['End Date'];
    if (!s || !e) return null;
    return flightWeeks
      .filter(function (w) { return w.start <= e && w.end >= s; })
      .map(function (w) { return w.id; });
  }

  (function addNonSegStoreParams() {
    if (typeof DistributionEntities === 'undefined') return;
    var brands = DistributionEntities.brands || [];
    brands.forEach(function (b) {
      if (b.id === 'brand-seg') return;
      b.stores.forEach(function (s) {
        if (STORE_PARAMS[s.id]) return;
        var seed = 0;
        for (var i = 0; i < s.id.length; i++) {
          seed = ((seed << 5) - seed + s.id.charCodeAt(i)) | 0;
        }
        seed = Math.abs(seed);

        // Real Pulse campaign + reporting (cumulative over campaign run)
        var campaign = s.pulseCampaign || null;
        var reporting = (campaign && PULSE && PULSE.reportingForCampaignId)
          ? PULSE.reportingForCampaignId(campaign.ID)
          : null;

        var realBudgetTotal = campaign ? _parseMoney(campaign['Budget($)']) : 0;
        var realImpressions = reporting ? _parseNum(reporting.Impressions) : 0;
        var realClicks      = reporting ? _parseNum(reporting.Clicks) : 0;
        var realSpend       = reporting ? _parseMoney(reporting.Spend) : 0;
        var realVisits      = reporting ? _parseNum(reporting.Conversions) : 0;

        // Demo alignment: distribute every campaign's cumulative totals across
        // the full dataset (55 weeks) so non-SEG brands populate every week,
        // matching SEG's always-on coverage. Prevents blank screens when Adam
        // jumps brand → brand on a week outside the campaign's actual flight.
        // Per-week numbers shrink relative to the real flight, but stay non-zero
        // and visually consistent across the full Wk50/2025 → Wk52/2026 range.
        var denom = WEEKS.length;

        var imp = reporting ? Math.round(realImpressions / denom) : (5500 + (seed % 4500));
        var clk = reporting ? Math.round(realClicks      / denom) : Math.max(20, Math.round(imp * 0.0075));
        var bud = reporting ? Math.round(realSpend       / denom)
                : realBudgetTotal > 0 ? Math.round(realBudgetTotal / denom)
                : Math.round(imp * 0.055);
        var vis = reporting ? Math.round(realVisits      / denom) : Math.max(150, Math.round(imp * 0.04));

        var shr = 38 + (seed % 25);
        var cv  = Math.round(imp * 0.7);
        var hhi = 2200 + (seed % 800);
        var p = defaultParams(imp, clk, bud, vis, shr, cv, hhi, 'Local Competitor', '');

        // Stamp real Pulse references onto the params so downstream code can
        // surface real campaign metadata the same way SEG already does.
        if (campaign) {
          p.real_pulse_campaign_id  = campaign.ID;
          p.real_pulse_budget_total = realBudgetTotal;
          p.real_pulse_group        = campaign.Group;
          p.real_pulse_status       = campaign.Status;
          p.real_pulse_kpi          = campaign.KPI;
          p.real_pulse_kpi_metric   = campaign['KPI metric'];
          p.real_pulse_name         = campaign.Name;
          // Real Pulse creative IDs (space-separated). First one is the
          // primary creative for this campaign — used to drive per-record
          // creative_id below so Performance Ranking groups by real creative.
          var creativeIds = String(campaign['Creative IDs'] || '').split(/\s+/).filter(Boolean);
          if (creativeIds.length) {
            p.real_pulse_creative_id  = creativeIds[0];
            p.real_pulse_creative_ids = creativeIds;
          }
        }
        // active_weeks intentionally not stamped — see denom comment above.
        STORE_PARAMS[s.id] = p;
        STORE_IDS.push(s.id);
      });
    });
  })();

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
    // Determine the creative_id list for this store. SEG stores use a single
    // canonical mock creative; non-SEG stores fan out across every Pulse
    // Creative ID listed on their campaign so each banner-size variant
    // surfaces as its own card in Performance Ranking / Detailed Breakdown.
    const segCreative =
        CREATIVE_A_STORES.includes(storeId) ? 'creative-a'
      : CREATIVE_B_STORES.includes(storeId) ? 'creative-b'
      : CREATIVE_C_STORES.includes(storeId) ? 'creative-c'
      : CREATIVE_D_STORES.includes(storeId) ? 'creative-d'
      : null;
    const creativeIdList = segCreative
      ? [segCreative]
      : (params.real_pulse_creative_ids && params.real_pulse_creative_ids.length
          ? params.real_pulse_creative_ids
          : ['creative-b']);
    const variantCount = creativeIdList.length;

    WEEKS.forEach(weekId => {
      if (params.active_weeks && params.active_weeks.indexOf(weekId) < 0) return;
      const wm = WEEK_MULT[weekId];
      const totalImpressions = vary(params.impressions * wm, storeId, weekId, 'impr');
      const totalClicks      = vary(params.clicks      * wm, storeId, weekId, 'click');
      const totalBudget      = vary(params.budget      * wm, storeId, weekId, 'budget');
      const totalVisits      = vary(params.visits      * wm, storeId, weekId, 'visit');

      creativeIdList.forEach((cid, vIdx) => {
        // Split per-week metrics across variants. Use a small seeded skew
        // so the variants don't show identical numbers.
        const skew = 1 + seedRandom(storeId, weekId, 'split-' + vIdx) * 0.4;
        const share = skew / variantCount;
        const impressions = Math.max(1, Math.round(totalImpressions * share));
        const clicks      = Math.max(0, Math.round(totalClicks      * share));
        const budget      = Math.max(0, Math.round(totalBudget      * share));
        const grossVisits = Math.max(0, Math.round(totalVisits      * share));

        mediaRecords.push({
          id: `media-${storeId.replace('store-', '')}-${weekId}` + (variantCount > 1 ? `-v${vIdx}` : ''),
          store_id: storeId,
          week_id: weekId,
          impressions: impressions,
          clicks: clicks,
          ctr: parseFloat(((clicks / impressions) * 100).toFixed(2)),
          cost_per_impression: parseFloat((budget / impressions).toFixed(4)),
          budget_allocated: budget,
          gross_visits: grossVisits,
          cost_per_visit: grossVisits > 0 ? parseFloat((budget / grossVisits).toFixed(2)) : null,
          visits_per_thousand: parseFloat(((grossVisits / impressions) * 1000).toFixed(1)),
          spend: budget,
          cpm: parseFloat(((budget / impressions) * 1000).toFixed(2)),
          cpc: parseFloat((budget / Math.max(clicks, 1)).toFixed(2)),
          status: 'Live',
          creative_id: cid
        });
      });
    });
  });

  // Additional media records for Creative E (video — runs wk5, wk1, wk2 only)
  // Video runs from wk52 onward (3-week stretch in original demo, now extended
  // through every generated week so the video panel populates regardless of
  // which week the user picks).
  const VIDEO_WEEKS = WEEKS.slice(2);
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
        // Pulse-aligned fields
        spend: budget,
        cpm: parseFloat(((budget / impressions) * 1000).toFixed(2)),
        cpc: parseFloat((budget / Math.max(clicks, 1)).toFixed(2)),
        status: 'Live',
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
      if (params.active_weeks && params.active_weeks.indexOf(weekId) < 0) return;
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
        cost_per_visit: parseFloat((budget / grossVisits).toFixed(2)),
        // Pulse-aligned fields
        conversions: grossVisits,
        cpa: parseFloat((budget / grossVisits).toFixed(2))
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
      if (params.active_weeks && params.active_weeks.indexOf(weekId) < 0) return;
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
    { name: 'Other Retailers', address: '4100 N Federal Hwy, Fort Lauderdale, FL 33308', basePct: 7.1, growthRate: 0.3 },
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
      file_url: 'https://img.adinfra.io/creative/creative-a/holiday-steak-300x250.gif',
      date_range_start: '2025-12-10',
      date_range_end: '2025-12-30',
      uploaded_by: 'tammy.mdi',
      uploaded_at: '2025-12-09T14:30:00Z',
      notes: 'Holiday T-bone steak hero — animated price drop GIF',
      label: 'Holiday Steak — South FL',
      // Pulse-aligned campaign fields
      channel: 'display',
      pulse_type: 'BannerAd',
      group: 'SEG 27',
      kpi: 'awareness',
      kpi_metric: 'ctr',
      kpi_value: 0.6,
      status: 'Live',
      status_on: 'on',
      landing_page: 'https://www.winndixie.com/circular?week=12&promo=steak',
      frequency_amount: 4,
      frequency_interval: 'hour',
      pacing: 'evenly',
      flights: [{ start: '2025-12-10', end: '2025-12-30', budget: 1394.98 }]
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
      file_url: 'https://img.adinfra.io/creative/creative-b/holiday-banner-728x90.jpg',
      date_range_start: '2025-12-10',
      date_range_end: '2025-12-30',
      uploaded_by: 'tammy.mdi',
      uploaded_at: '2025-12-09T14:35:00Z',
      notes: 'Holiday general circular hero — leaderboard banner',
      label: 'Holiday Banner — Central FL',
      channel: 'display',
      pulse_type: 'BannerAd',
      group: 'SEG 27',
      kpi: 'awareness',
      kpi_metric: 'ctr',
      kpi_value: 0.6,
      status: 'Live',
      status_on: 'on',
      landing_page: 'https://www.winndixie.com/circular?week=12',
      frequency_amount: 4,
      frequency_interval: 'hour',
      pacing: 'evenly',
      flights: [{ start: '2025-12-10', end: '2025-12-30', budget: 2062.39 }]
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
      file_url: 'https://img.adinfra.io/creative/creative-c/bogo-produce-320x480.gif',
      date_range_start: '2025-12-17',
      date_range_end: '2026-01-06',
      uploaded_by: 'tammy.mdi',
      uploaded_at: '2025-12-16T10:00:00Z',
      notes: 'BOGO Fresh Produce — tall interstitial animation',
      label: 'BOGO Produce — North FL',
      channel: 'display',
      pulse_type: 'BannerAd',
      group: 'SEG 27',
      kpi: 'awareness',
      kpi_metric: 'ctr',
      kpi_value: 0.6,
      status: 'Live',
      status_on: 'on',
      landing_page: 'https://www.winndixie.com/circular?week=12&promo=bogo-produce',
      frequency_amount: 4,
      frequency_interval: 'hour',
      pacing: 'evenly',
      flights: [{ start: '2025-12-17', end: '2026-01-06', budget: 1820.50 }]
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
      file_url: 'https://img.adinfra.io/creative/creative-d/value-pack-harveys-300x250.jpg',
      date_range_start: '2025-12-10',
      date_range_end: '2025-12-30',
      uploaded_by: 'tammy.mdi',
      uploaded_at: '2025-12-09T15:00:00Z',
      notes: 'Harveys Value Pack holiday bundle — medium rectangle',
      label: 'Value Pack — Harveys',
      channel: 'display',
      pulse_type: 'BannerAd',
      group: 'SEG 27',
      kpi: 'awareness',
      kpi_metric: 'ctr',
      kpi_value: 0.6,
      status: 'Live',
      status_on: 'on',
      landing_page: 'https://www.harveyssupermarkets.com/circular?week=12&promo=value',
      frequency_amount: 4,
      frequency_interval: 'hour',
      pacing: 'evenly',
      flights: [{ start: '2025-12-10', end: '2025-12-30', budget: 980.00 }]
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
      file_url: 'https://img.adinfra.io/creative/creative-e/holiday-preroll-1920x1080.mp4',
      date_range_start: '2025-12-24',
      date_range_end: '2026-01-06',
      uploaded_by: 'adam.seg',
      uploaded_at: '2025-12-23T09:00:00Z',
      notes: 'YouTube pre-roll 15s — "Holiday Savings Start Here"',
      label: 'YouTube Pre-Roll — Holiday',
      channel: 'youtube',
      pulse_type: 'VideoAd',
      group: 'SEG 27 - Video',
      kpi: 'video',
      kpi_metric: 'vcr',
      kpi_value: 50,
      status: 'Live',
      status_on: 'on',
      landing_page: 'https://www.youtube.com/watch?v=seg-holiday-2025',
      frequency_amount: 2,
      frequency_interval: 'day',
      pacing: 'evenly',
      flights: [{ start: '2025-12-24', end: '2026-01-06', budget: 597.09 }]
    }
  ];

  // ────────────────────────────────────────────────────────────────────
  // Real Pulse creatives — append one creativeRecord per Creative ID
  // referenced by non-SEG campaigns. Drives Performance Ranking +
  // Detailed Breakdown to surface the actual Pulse creatives instead of
  // collapsing every non-SEG store into the SEG creative-b card.
  // ────────────────────────────────────────────────────────────────────
  (function appendRealPulseCreatives() {
    if (!PULSE) return;
    var creativeUseStores = {};
    Object.keys(STORE_PARAMS).forEach(function (sid) {
      var p = STORE_PARAMS[sid];
      if (!p.real_pulse_creative_ids) return;
      p.real_pulse_creative_ids.forEach(function (cid) {
        (creativeUseStores[cid] = creativeUseStores[cid] || []).push(sid);
      });
    });
    Object.keys(creativeUseStores).forEach(function (cid) {
      var c = PULSE.creativeById ? PULSE.creativeById(cid) : null;
      if (!c) return;
      var typeRaw = c.Type || 'BannerAd';
      var ext = (c['File URL'] || '').split('?')[0].split('.').pop().toLowerCase();
      var creativeType = typeRaw === 'VideoAd' || typeRaw === 'MetaSingleImageVideoAd' || ext === 'mp4'
        ? 'video'
        : (ext === 'gif' ? 'gif' : 'jpeg');
      // Parse dimensions from Creative Name (e.g. "0425_EMH_Heath_320x50_2" → "320x50")
      var dimMatch = /(\d{2,4})x(\d{2,4})/.exec(c['Creative Name'] || '');
      var width  = dimMatch ? parseInt(dimMatch[1], 10) : null;
      var height = dimMatch ? parseInt(dimMatch[2], 10) : null;
      creativeRecords.push({
        creative_id: cid,
        retailer_id: c['Advertiser ID'] || null,
        store_group: creativeUseStores[cid],
        creative_type: creativeType,
        dimensions: dimMatch ? (dimMatch[1] + 'x' + dimMatch[2]) : '',
        width: width,
        height: height,
        target_url: c['Landing Page'] || '',
        file_url: c['File URL'] || '',
        date_range_start: c['Start Date'] || '',
        date_range_end: c['End Date'] || '',
        uploaded_by: '',
        uploaded_at: '',
        notes: c['Creative Name'] || '',
        label: (c['Creative Name'] || '').replace(/_/g, ' '),
        channel: 'display',
        pulse_type: typeRaw,
        group: '',
        kpi: 'awareness',
        kpi_metric: 'ctr',
        kpi_value: 0.6,
        status: c['On/Off'] === 'on' ? 'Live' : 'Paused',
        status_on: c['On/Off'] || 'off',
        landing_page: c['Landing Page'] || '',
        frequency_amount: null,
        frequency_interval: null,
        pacing: 'evenly',
        flights: []
      });
    });
  })();

  // ────────────────────────────────────────────────────────────────────
  // Real Pulse campaign overlay on creativeRecords (2026-04-27).
  // Each of our 5 mock creatives represents a real Pulse "Group". We pull
  // ONE representative real campaign per group and overlay its values
  // (no value modification — direct port from CSV):
  //   creative-a → Winn-Dixie 319        (Group: SEG 27)
  //   creative-b → Winn-Dixie 2288       (Group: Winn-Dixie Ongoing 20)
  //   creative-c → Winn-Dixie 195        (Group: Winn-Dixie December Only)
  //   creative-d → Harveys 1671          (Group: Harveys December Only)
  //   creative-e → no real video data — kept synthetic, awaiting Greenberg
  // ────────────────────────────────────────────────────────────────────
  const CREATIVE_REAL_SOURCE = {
    'creative-a': 319,
    'creative-b': 2288,
    'creative-c': 195,
    'creative-d': 1671
  };
  function parseFlights(s) {
    if (!s) return [];
    return s.split(/\r?\n/).map(line => {
      const m = line.match(/(\S+)\s*\/\s*(\S+)\s*:\s*([\d.]+)/);
      return m ? { start: m[1], end: m[2], budget: parseFloat(m[3]) } : null;
    }).filter(Boolean);
  }
  creativeRecords.forEach(cr => {
    const storeNum = CREATIVE_REAL_SOURCE[cr.creative_id];
    if (!storeNum || !PULSE) return;
    const real = PULSE.primaryCampaignForStoreNumber(storeNum);
    if (!real) return;
    cr.real_pulse_source = { campaign_id: real.ID, name: real.Name };
    cr.group = real.Group;
    cr.kpi = real.KPI;
    cr.kpi_metric = real['KPI metric'];
    cr.kpi_value = real['KPI value'] ? parseFloat(real['KPI value']) : cr.kpi_value;
    cr.status = real.Status;
    cr.status_on = real['On/Off'];
    cr.frequency_amount = real['Frequency amount'] ? parseInt(real['Frequency amount'], 10) : cr.frequency_amount;
    cr.frequency_interval = real['Frequency interval'] || cr.frequency_interval;
    cr.pacing = real.Pacing || cr.pacing;
    cr.channel = real.Channel || cr.channel;
    cr.date_range_start = real['Start Date'] || cr.date_range_start;
    cr.date_range_end = real['End Date'] || cr.date_range_end;
    const realFlights = parseFlights(real['Ongoing Flights']);
    if (realFlights.length) cr.flights = realFlights;
  });

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
    flightWeeks,
    STORE_PARAMS,
    ALERT_MAP,
    GROUP_MAP,

    // Competitor store locations — derived from STORE_PARAMS threat data
    // Each has: id, brand, address, lat, lng, and the SEG stores it threatens
    COMPETITOR_STORES: [
      // ── Publix ──
      { id: 'comp-pub-1',  brand: 'Publix', storeName: 'Publix Homestead Plaza',    city: 'Homestead, FL',     address: '28200 S Dixie Hwy, Homestead, FL 33033',         lat: 25.475, lng: -80.440, threatens: ['store-319'], wk2_share: 18.2 },
      { id: 'comp-pub-2',  brand: 'Publix', storeName: 'Publix Hollywood Station',  city: 'Hollywood, FL',     address: '1250 S Federal Hwy, Hollywood, FL 33020',         lat: 26.010, lng: -80.145, threatens: ['store-336'], wk2_share: 16.8 },
      { id: 'comp-pub-3',  brand: 'Publix', storeName: 'Publix Cleveland Center',   city: 'Fort Myers, FL',    address: '4650 S Cleveland Ave, Fort Myers, FL 33907',      lat: 26.598, lng: -81.870, threatens: ['store-508'], wk2_share: 19.4 },
      { id: 'comp-pub-4',  brand: 'Publix', storeName: 'Publix Naples Commons',     city: 'Naples, FL',        address: '5765 Naples Blvd, Naples, FL 34109',              lat: 26.241, lng: -81.760, threatens: ['store-518'], wk2_share: 21.1 },
      { id: 'comp-pub-5',  brand: 'Publix', storeName: 'Publix Pine Island',        city: 'Matlacha, FL',      address: '2345 Pine Island Rd, Matlacha, FL 33993',         lat: 26.636, lng: -82.072, threatens: ['store-726'], wk2_share: 14.6 },
      { id: 'comp-pub-6',  brand: 'Publix', storeName: 'Publix Haines City',        city: 'Haines City, FL',   address: '35951 US Hwy 27, Haines City, FL 33844',          lat: 28.088, lng: -81.617, threatens: ['store-705'], wk2_share: 17.3 },
      { id: 'comp-pub-7',  brand: 'Publix', storeName: 'Publix Sand Lake',          city: 'Orlando, FL',       address: '7640 W Sand Lake Rd, Orlando, FL 32819',          lat: 28.449, lng: -81.470, threatens: ['store-2288'], wk2_share: 20.5 },
      { id: 'comp-pub-8',  brand: 'Publix', storeName: 'Publix North Tampa',        city: 'Tampa, FL',         address: '13521 N Florida Ave, Tampa, FL 33612',            lat: 28.060, lng: -82.459, threatens: ['store-2415'], wk2_share: 18.9 },
      { id: 'comp-pub-9',  brand: 'Publix', storeName: 'Publix Speedway Square',    city: 'Daytona Beach, FL', address: '1570 W Intl Speedway Blvd, Daytona Beach, FL 32114', lat: 29.210, lng: -81.065, threatens: ['store-2434'], wk2_share: 15.7 },
      { id: 'comp-pub-10', brand: 'Publix', storeName: 'Publix Melbourne West',     city: 'Melbourne, FL',     address: '1555 W New Haven Ave, Melbourne, FL 32904',       lat: 28.078, lng: -80.640, threatens: ['store-2474'], wk2_share: 16.2 },
      { id: 'comp-pub-11', brand: 'Publix', storeName: 'Publix Lakeland North',     city: 'Lakeland, FL',      address: '3950 US-98 N, Lakeland, FL 33809',                lat: 28.080, lng: -81.970, threatens: ['store-2480'], wk2_share: 17.8 },
      { id: 'comp-pub-12', brand: 'Publix', storeName: 'Publix Bee Ridge',          city: 'Sarasota, FL',      address: '3870 Bee Ridge Rd, Sarasota, FL 34233',           lat: 27.302, lng: -82.480, threatens: ['store-2487'], wk2_share: 19.1 },
      { id: 'comp-pub-13', brand: 'Publix', storeName: 'Publix Cortez Plaza',       city: 'Bradenton, FL',     address: '6255 Cortez Rd W, Bradenton, FL 34210',           lat: 27.463, lng: -82.600, threatens: ['store-2509'], wk2_share: 15.3 },
      { id: 'comp-pub-14', brand: 'Publix', storeName: 'Publix The Villages',       city: 'The Villages, FL',  address: '2510 Burnsed Blvd, The Villages, FL 32163',       lat: 28.930, lng: -81.990, threatens: ['store-2545'], wk2_share: 22.4 },
      { id: 'comp-pub-15', brand: 'Publix', storeName: 'Publix Timberlane',         city: 'Tallahassee, FL',   address: '1415 Timberlane Rd, Tallahassee, FL 32312',       lat: 30.490, lng: -84.310, threatens: ['store-86'], wk2_share: 20.8 },
      { id: 'comp-pub-16', brand: 'Publix', storeName: 'Publix Beach Blvd',         city: 'Jacksonville, FL',  address: '11500 Beach Blvd, Jacksonville, FL 32246',        lat: 30.290, lng: -81.528, threatens: ['store-195'], wk2_share: 17.5 },
      { id: 'comp-pub-17', brand: 'Publix', storeName: 'Publix Emerald Coast',      city: 'Destin, FL',        address: '34940 Emerald Coast Pkwy, Destin, FL 32541',      lat: 30.393, lng: -86.460, threatens: ['store-560'], wk2_share: 23.1 },
      { id: 'comp-pub-18', brand: 'Publix', storeName: 'Publix Palm Coast',         city: 'Palm Coast, FL',    address: '1200 Palm Coast Pkwy NW, Palm Coast, FL 32137',   lat: 29.565, lng: -81.230, threatens: ['store-2247'], wk2_share: 16.9 },
      { id: 'comp-pub-19', brand: 'Publix', storeName: 'Publix San Juan',           city: 'Jacksonville, FL',  address: '4525 San Juan Ave, Jacksonville, FL 32210',       lat: 30.298, lng: -81.733, threatens: ['store-2399'], wk2_share: 14.2 },
      { id: 'comp-pub-20', brand: 'Publix', storeName: 'Publix College Square',     city: 'Ocala, FL',         address: '3100 SW College Rd, Ocala, FL 34474',             lat: 29.170, lng: -82.180, threatens: ['store-2437'], wk2_share: 18.6 },
      { id: 'comp-pub-21', brand: 'Publix', storeName: 'Publix NW Gainesville',     city: 'Gainesville, FL',   address: '3720 NW 13th St, Gainesville, FL 32609',          lat: 29.680, lng: -82.340, threatens: ['store-2482'], wk2_share: 19.7 },
      { id: 'comp-pub-22', brand: 'Publix', storeName: 'Publix Monroe St',          city: 'Tallahassee, FL',   address: '1700 N Monroe St, Tallahassee, FL 32303',         lat: 30.455, lng: -84.275, threatens: ['store-2495'], wk2_share: 17.4 },
      { id: 'comp-pub-23', brand: 'Publix', storeName: 'Publix University Blvd',    city: 'Jacksonville, FL',  address: '5910 University Blvd W, Jacksonville, FL 32216',  lat: 30.263, lng: -81.590, threatens: ['store-1690'], wk2_share: 15.8 },
      { id: 'comp-pub-24', brand: 'Publix', storeName: 'Publix US-92 Lakeland',     city: 'Lakeland, FL',      address: '2640 US Hwy 92, Lakeland, FL 33801',              lat: 28.040, lng: -81.950, threatens: ['store-1710'], wk2_share: 16.5 },
      { id: 'comp-pub-25', brand: 'Publix', storeName: 'Publix Ariana',             city: 'Lakeland, FL',      address: '1310 Ariana St W, Lakeland, FL 33803',            lat: 28.030, lng: -81.970, threatens: ['store-1712'], wk2_share: 14.9 },

      // ── Walmart ──
      { id: 'comp-wm-1', brand: 'Walmart', storeName: 'Walmart Supercenter #1234',  city: 'Pensacola, FL',     address: '2601 N Davis Hwy, Pensacola, FL 32503',           lat: 30.448, lng: -87.230, threatens: ['store-2449'], wk2_share: 24.3 },
      { id: 'comp-wm-2', brand: 'Walmart', storeName: 'Walmart Supercenter #5678',  city: 'Palm Bay, FL',      address: '1040 Malabar Rd SE, Palm Bay, FL 32907',           lat: 28.003, lng: -80.621, threatens: ['store-2501'], wk2_share: 22.1 },
      { id: 'comp-wm-3', brand: 'Walmart', storeName: 'Walmart Supercenter #3456',  city: 'Lynn Haven, FL',    address: '2101 S Hwy 77, Lynn Haven, FL 32444',              lat: 30.227, lng: -85.640, threatens: ['store-436'], wk2_share: 26.8 },
      { id: 'comp-wm-4', brand: 'Walmart', storeName: 'Walmart Supercenter #7890',  city: 'Lake City, FL',     address: '2767 W US Hwy 90, Lake City, FL 32055',            lat: 30.188, lng: -82.664, threatens: ['store-1671'], wk2_share: 23.5 },
      { id: 'comp-wm-5', brand: 'Walmart', storeName: 'Walmart Supercenter #2345',  city: 'Jacksonville, FL',  address: '5250 Moncrief Rd W, Jacksonville, FL 32209',       lat: 30.365, lng: -81.710, threatens: ['store-1692'], wk2_share: 21.7 },
      { id: 'comp-wm-6', brand: 'Walmart', storeName: 'Walmart Supercenter #4567',  city: 'Jacksonville, FL',  address: '100 W 48th St, Jacksonville, FL 32208',            lat: 30.387, lng: -81.670, threatens: ['store-1694'], wk2_share: 20.4 },
      { id: 'comp-wm-7', brand: 'Walmart', storeName: 'Walmart Neighborhood Mkt',   city: 'Jacksonville, FL',  address: '50 S Arlington Rd, Jacksonville, FL 32211',        lat: 30.329, lng: -81.600, threatens: ['store-1716'], wk2_share: 18.9 },

      // ── ALDI ──
      { id: 'comp-aldi-1', brand: 'ALDI', storeName: 'ALDI Port Charlotte',         city: 'Port Charlotte, FL', address: '1900 Tamiami Trail, Port Charlotte, FL 33948',     lat: 26.985, lng: -82.120, threatens: ['store-2490'], wk2_share: 8.4 },
      { id: 'comp-aldi-2', brand: 'ALDI', storeName: 'ALDI Spring Hill',             city: 'Spring Hill, FL',    address: '1233 Wendy Ct, Spring Hill, FL 34607',             lat: 28.482, lng: -82.548, threatens: ['store-711'], wk2_share: 7.2 },

      // ── Save A Lot ──
      { id: 'comp-sal-1', brand: 'Save A Lot', storeName: 'Save A Lot Belle Glade', city: 'Belle Glade, FL',    address: '920 S Main St, Belle Glade, FL 33430',             lat: 26.678, lng: -80.670, threatens: ['store-381'], wk2_share: 5.8 }
    ]
  };
})();
