#!/usr/bin/env node
// UX-846 Phase 1 — Build aggregates.json
// Inputs : entity-hierarchy.js, weeks.js  (loaded via createRequire — they're UMD-ish)
// Output : ../js/data/mock-data-v1/aggregates.json
//
// Determinism: every per-store-per-week value is seeded by a stable hash of
// (entityId + ':' + weekId). Rollups (group/subBrand/brand/retailer) are
// computed by SUMMING child-store aggregates so the parent values are the
// true sum of leaves. Rates/proportions/deltas are re-derived at the parent.
//
// PHASE-1-ASSUMPTION: schema doesn't fully specify which fields are summed
//   vs. averaged at rollup. Rule used: raw counts (views, impressions, spend,
//   visits, conversions, ...) are SUMMED. Rates (ctr, cpm, cpc, completionRate,
//   costPerVisit, costPerImpression, visitsPerThousand, cpa) are recomputed
//   from the summed numerators / denominators. Demographics, share, hhi,
//   growth rates, deltaPct — recomputed as weighted means by impressions
//   (media) or grossVisits (visitation/traffic).
// PHASE-1-ASSUMPTION: percentile uses entity's totalScore vs peers at same
//   level for the same week; computed in a second pass.
// PHASE-1-ASSUMPTION: weekly trend points emitted on aggregates use the
//   current entity's series across all 13 weeks (current week's perspective).

import { createRequire } from 'module';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

const hierarchy = require('../js/data/mock-data-v1/entity-hierarchy.js');
const weeks     = require('../js/data/mock-data-v1/weeks.js');

const OUTPUT_PATH = join(__dirname, '..', 'js', 'data', 'mock-data-v1', 'aggregates.json');

// ---------- Deterministic seeded RNG ----------
// FNV-1a 32-bit hash → mulberry32 PRNG. Same string in → same stream out.
function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h >>> 0;
}
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function rngFor(entityId, weekId, salt = '') {
  return mulberry32(fnv1a(entityId + ':' + weekId + ':' + salt));
}
const ri = (rng, lo, hi) => Math.floor(rng() * (hi - lo + 1)) + lo;
const rf = (rng, lo, hi) => rng() * (hi - lo) + lo;
const round = (n, d = 0) => {
  const f = Math.pow(10, d);
  return Math.round(n * f) / f;
};

// ---------- Flattened nodes ----------
const allNodes = [
  hierarchy.retailer,
  hierarchy.brand,
  ...hierarchy.subBrands,
  ...hierarchy.groups,
  ...hierarchy.stores
];

// For each non-store entity, find the descendant stores.
function descendantStores(entity) {
  if (entity.level === 'store') return [entity];
  if (entity.level === 'retailer') return hierarchy.stores;
  if (entity.level === 'brand')    return hierarchy.stores.filter(s => s.parentBrandId === entity.id);
  if (entity.level === 'subBrand') return hierarchy.stores.filter(s => s.parentSubBrandId === entity.id);
  if (entity.level === 'group')    return hierarchy.stores.filter(s => s.parentGroupId === entity.id);
  return [];
}

// Category catalog (schema §9)
const CATEGORIES = [
  { id: 'category-meat',      name: 'Meat & Seafood' },
  { id: 'category-produce',   name: 'Produce' },
  { id: 'category-dairy',     name: 'Dairy' },
  { id: 'category-bakery',    name: 'Bakery' },
  { id: 'category-pantry',    name: 'Pantry' },
  { id: 'category-beverages', name: 'Beverages' },
  { id: 'category-snacks',    name: 'Snacks' },
  { id: 'category-frozen',    name: 'Frozen' }
];

const CREATIVE_TEMPLATES = [
  { creativeId: 'creative-a', label: 'Pre-Holiday Display',    type: 'static',  channel: 'display' },
  { creativeId: 'creative-b', label: 'Weekend Sale Email',     type: 'static',  channel: 'email' },
  { creativeId: 'creative-c', label: 'Recipe Inspiration Video', type: 'video',  channel: 'video' },
  { creativeId: 'creative-d', label: 'Social Carousel',        type: 'dynamic', channel: 'social' }
];

const COMPETITOR_NAMES = [
  'FreshChoice Market', 'GreenLeaf Grocers', 'SunCoast Supermarket', 'Harbor Foods', 'Cypress Pantry'
];

// ---------- Per-store, per-week base aggregate ----------
// All raw counts. Higher-level aggregates roll these up.
function buildStoreAggregate(store, week) {
  const rng = rngFor(store.id, week.id);
  // Engagement raw counts (single store, single week)
  const views = ri(rng, 8000, 22000);
  const clicks = Math.round(views * rf(rng, 0.4, 0.6));
  const addToListCount = Math.round(clicks * rf(rng, 0.25, 0.45));
  const sessions = Math.round(views * rf(rng, 0.45, 0.65));
  const totalScore = views * 1 + clicks * 5 + addToListCount * 20;

  // Sessions by day (Mon..Sun)
  const dowWeights = [0.13, 0.10, 0.12, 0.15, 0.18, 0.20, 0.12];
  const byDayOfWeek = dowWeights.map(w => Math.round(sessions * w));

  // Devices
  const mobileSessions = Math.round(sessions * rf(rng, 0.62, 0.74));
  const desktopSessions = Math.round(sessions * rf(rng, 0.15, 0.22));
  const tabletSessions = Math.round(sessions * rf(rng, 0.06, 0.11));
  const otherSessions = Math.max(0, sessions - mobileSessions - desktopSessions - tabletSessions);
  const mobileSecondsTotal  = mobileSessions  * ri(rng, 380, 460);
  const desktopSecondsTotal = desktopSessions * ri(rng, 270, 330);
  const tabletSecondsTotal  = tabletSessions  * ri(rng, 240, 300);
  const otherSecondsTotal   = otherSessions   * ri(rng, 100, 180);
  const secondsTotal = mobileSecondsTotal + desktopSecondsTotal + tabletSecondsTotal + otherSecondsTotal;

  // Engagement by category — proportions that sum to ~1; sum of values ≈ totalScore.
  const catWeightsRaw = CATEGORIES.map(() => rf(rng, 0.5, 1.5));
  const catSum = catWeightsRaw.reduce((a, b) => a + b, 0);
  const catScores = CATEGORIES.map((c, i) => ({
    id: c.id, name: c.name,
    score: Math.round(totalScore * (catWeightsRaw[i] / catSum)),
    views:  Math.round(views  * (catWeightsRaw[i] / catSum)),
    clicks: Math.round(clicks * (catWeightsRaw[i] / catSum)),
    adds:   Math.round(addToListCount * (catWeightsRaw[i] / catSum))
  }));

  // Promotions — 5 per category for the current week
  const promotions = [];
  for (const cat of CATEGORIES) {
    for (let i = 1; i <= 5; i++) {
      const pRng = rngFor(store.id, week.id, cat.id + ':' + i);
      const pViews = ri(pRng, 200, 1200);
      const pClicks = Math.round(pViews * rf(pRng, 0.35, 0.6));
      const pAdds = Math.round(pClicks * rf(pRng, 0.2, 0.45));
      promotions.push({
        id: `promo-${week.id}-${cat.id.replace('category-', '')}-${i}`,
        label: promoName(cat.id, i),
        category: cat.id,
        views: pViews,
        clicks: pClicks,
        adds: pAdds,
        score: pViews + pClicks * 5 + pAdds * 20
      });
    }
  }

  // Coupons & page-nav
  const coupons = CATEGORIES.slice(0, 6).map((c, i) => ({
    id: `coupon-${week.id}-${c.id.replace('category-', '')}`,
    label: c.name + ' Coupon',
    clips: ri(rng, 50, 600),
    views: ri(rng, 200, 2000)
  }));
  const pageNav = [
    { id: 'page-home',       label: 'Home',          hits: ri(rng, 800, 2500) },
    { id: 'page-circular',   label: 'Circular',      hits: ri(rng, 2000, 6000) },
    { id: 'page-list',       label: 'Shopping List', hits: ri(rng, 400, 1500) },
    { id: 'page-coupons',    label: 'Coupons',       hits: ri(rng, 300, 1200) },
    { id: 'page-account',    label: 'Account',       hits: ri(rng, 100, 600) }
  ];

  // Distribution — media
  const impressions = ri(rng, 50000, 200000);
  const mClicks = Math.round(impressions * rf(rng, 0.005, 0.012));
  const spend = round(impressions * rf(rng, 0.005, 0.008), 2);
  const budgetAllocated = round(spend * rf(rng, 1.0, 1.1), 2);
  const grossVisits = Math.round(impressions / ri(rng, 1500, 2500));
  const conversions = Math.round(grossVisits * rf(rng, 0.15, 0.25));

  // Distribution — visitation (V/C/A buckets)
  const visitsZeroPrev   = Math.round(grossVisits * rf(rng, 0.28, 0.38));
  const visitsOneThreePrev = Math.round(grossVisits * rf(rng, 0.38, 0.48));
  const visitsFourPlusPrev = Math.max(0, grossVisits - visitsZeroPrev - visitsOneThreePrev);
  const netVisits = Math.round(grossVisits * 0.95);

  // Creatives at store level — split impressions across creative templates
  const cw = CREATIVE_TEMPLATES.map(() => rf(rng, 0.5, 1.5));
  const cwSum = cw.reduce((a, b) => a + b, 0);
  const byCreativeStore = CREATIVE_TEMPLATES.map((tpl, i) => {
    const share = cw[i] / cwSum;
    const cImp = Math.round(impressions * share);
    const cClk = Math.round(mClicks * share);
    const cSpend = round(spend * share, 2);
    return {
      creativeId: tpl.creativeId,
      label: tpl.label,
      type: tpl.type,
      channel: tpl.channel,
      creativeStatus: 'active',
      impressions: cImp,
      clicks: cClk,
      spend: cSpend
    };
  });

  // Crossover — top competitor for store
  const crossoverStore = [{
    competitorName: COMPETITOR_NAMES[ri(rng, 0, COMPETITOR_NAMES.length - 1)],
    competitorAddress: store.address,
    crossoverPct: round(rf(rng, 0.08, 0.25), 3),
    crossoverVisitsZeroPrev: ri(rng, 200, 700),
    crossoverVisitsOneThree: ri(rng, 300, 900),
    crossoverVisitsFourPlus: ri(rng, 100, 500),
    trend: ['rising', 'falling', 'stable'][ri(rng, 0, 2)]
  }];

  // Demographics — proportions; carry weight = grossVisits for rollup averaging
  const ageW = [rf(rng,0.05,0.12), rf(rng,0.14,0.22), rf(rng,0.20,0.28), rf(rng,0.17,0.24), rf(rng,0.12,0.20), rf(rng,0.08,0.15)];
  const ageS = ageW.reduce((a,b)=>a+b,0);
  const ageProps = ageW.map(v => v / ageS);
  const malePct = round(rf(rng, 0.42, 0.55), 3);
  const marriedPct = round(rf(rng, 0.55, 0.68), 3);
  const childrenPct = round(rf(rng, 0.38, 0.50), 3);
  const ownerPct = round(rf(rng, 0.60, 0.74), 3);

  const incomeW = [rf(rng,0.18,0.26), rf(rng,0.34,0.42), rf(rng,0.22,0.28), rf(rng,0.10,0.18)];
  const incomeS = incomeW.reduce((a,b)=>a+b,0);
  const incomeProps = incomeW.map(v => v / incomeS);

  const hhSizeW = [rf(rng,0.18,0.26), rf(rng,0.30,0.38), rf(rng,0.17,0.23), rf(rng,0.20,0.28)];
  const hhSizeS = hhSizeW.reduce((a,b)=>a+b,0);
  const hhSizeProps = hhSizeW.map(v => v / hhSizeS);

  const nwW = [rf(rng,0.24,0.32), rf(rng,0.38,0.46), rf(rng,0.25,0.34)];
  const nwS = nwW.reduce((a,b)=>a+b,0);
  const nwProps = nwW.map(v => v / nwS);

  // Video engagement — present (≈ creative-c is video)
  const videoCreative = byCreativeStore.find(c => c.type === 'video');
  const videoImpressions = videoCreative ? videoCreative.impressions : 0;
  const completionRate = round(rf(rng, 0.65, 0.82), 3);
  const completeViews = Math.round(videoImpressions * completionRate);

  // Share — store contributes some retailerShare weight; expressed for rollups
  const compVisits = Math.round(grossVisits * rf(rng, 2.5, 4.0));
  const totalMarketVisits = grossVisits + compVisits;
  // alert classification
  const alertRoll = rng();
  const alertType = alertRoll < 0.6 ? 'green' : alertRoll < 0.85 ? 'amber' : 'red';

  return {
    // Engagement raw
    views, clicks, addToListCount, sessions, totalScore,
    byDayOfWeek,
    mobileSessions, desktopSessions, tabletSessions, otherSessions,
    mobileSecondsTotal, desktopSecondsTotal, tabletSecondsTotal, otherSecondsTotal,
    secondsTotal,
    catScores,
    promotions,
    coupons,
    pageNav,

    // Distribution raw
    impressions, mClicks, spend, budgetAllocated, grossVisits, conversions,
    visitsZeroPrev, visitsOneThreePrev, visitsFourPlusPrev, netVisits,
    byCreativeStore,
    crossoverStore,

    // Demographics (proportions with grossVisits as weight)
    demoWeight: grossVisits,
    ageProps, incomeProps, hhSizeProps, nwProps,
    malePct, marriedPct, childrenPct, ownerPct,

    // Video
    videoImpressions, completeViews, completionRate,
    videoFirstQuartileViews: Math.round(videoImpressions * 0.92),
    videoMidpointViews:      Math.round(videoImpressions * 0.85),
    videoThirdQuartileViews: Math.round(videoImpressions * completionRate * 1.05),
    videoAvgCircularTime: round(rf(rng, 18, 28), 1),
    videoCircularViews: ri(rng, 800, 3500),

    // Market context
    compVisits, totalMarketVisits, alertType, hhiInput: round(rf(rng, 0.35, 0.5), 3),
    storeRef: { id: store.id, name: store.name }
  };
}

function promoName(catId, seq) {
  const base = {
    'category-meat':      ['Ribeye Steak Family', 'Ground Chuck Bundle', 'Chicken Thighs Tray', 'Atlantic Salmon Fillet', 'Pork Loin Roast'],
    'category-produce':   ['Strawberries Family', 'Hass Avocado 4ct', 'Organic Spring Mix', 'Red Seedless Grapes', 'Sweet Corn 6ct'],
    'category-dairy':     ['Greek Yogurt Family', 'Whole Milk Gallon',  'Sharp Cheddar Block', 'Butter Quarters 1lb', 'Heavy Cream Pint'],
    'category-bakery':    ['Artisan Sourdough',   'Buttercroissant 6ct', 'Bagel Variety',      'Cinnamon Loaf',      'Dinner Rolls 12ct'],
    'category-pantry':    ['Pasta Sauce Family',  'Olive Oil 25oz',     'Rice 5lb Bag',        'Canned Tomatoes 28oz','Black Beans 6ct'],
    'category-beverages': ['Sparkling Water 12pk','Cold Brew Concentrate','Orange Juice Gallon','Sports Drink Variety','Energy Drink 4pk'],
    'category-snacks':    ['Tortilla Chips Family','Pretzel Twists 2lb','Trail Mix Variety',   'Granola Bars 12ct',   'Cheese Crackers'],
    'category-frozen':    ['Frozen Pizza Family', 'Ice Cream Quart',    'Frozen Berries 3lb',  'Veggie Burgers 8ct',  'Frozen Dumplings 1lb']
  };
  const arr = base[catId] || ['Promo'];
  return arr[(seq - 1) % arr.length];
}

// ---------- Sum store aggregates into a non-leaf bucket ----------
function sumStoreAggregates(stores, week) {
  // Pull each store base aggregate
  const bases = stores.map(s => ({ store: s, agg: buildStoreAggregate(s, week) }));

  // Initialize sums
  const sum = {
    views: 0, clicks: 0, addToListCount: 0, sessions: 0, totalScore: 0,
    byDayOfWeek: [0,0,0,0,0,0,0],
    mobileSessions: 0, desktopSessions: 0, tabletSessions: 0, otherSessions: 0,
    mobileSecondsTotal: 0, desktopSecondsTotal: 0, tabletSecondsTotal: 0, otherSecondsTotal: 0,
    secondsTotal: 0,
    impressions: 0, mClicks: 0, spend: 0, budgetAllocated: 0, grossVisits: 0, conversions: 0,
    visitsZeroPrev: 0, visitsOneThreePrev: 0, visitsFourPlusPrev: 0, netVisits: 0,
    videoImpressions: 0, completeViews: 0,
    videoFirstQuartileViews: 0, videoMidpointViews: 0, videoThirdQuartileViews: 0,
    videoCircularViews: 0, videoAvgCircularTimeWeighted: 0,
    compVisits: 0, totalMarketVisits: 0
  };

  // category scores summed
  const catTotals = new Map(); // id -> {name, score, views, clicks, adds}
  // promotion scores summed (across all stores for the week)
  const promoTotals = new Map();
  // coupon clips summed
  const couponTotals = new Map();
  // page-nav hits summed
  const pageTotals = new Map();
  // creative totals
  const creativeTotals = new Map();
  // crossover map by competitor
  const crossoverTotals = new Map();
  // alert classification counts
  const alertCounts = { green: 0, amber: 0, red: 0 };
  // store-level by-store breakdowns
  const byStore = [];
  // hhi sample
  let hhiSum = 0;
  // demographics weighted accumulators
  let demoWeight = 0;
  const ageAcc = [0,0,0,0,0,0];
  const incomeAcc = [0,0,0,0];
  const hhSizeAcc = [0,0,0,0];
  const nwAcc = [0,0,0];
  let maleAcc = 0, marriedAcc = 0, childrenAcc = 0, ownerAcc = 0;

  for (const { store, agg } of bases) {
    sum.views += agg.views;
    sum.clicks += agg.clicks;
    sum.addToListCount += agg.addToListCount;
    sum.sessions += agg.sessions;
    sum.totalScore += agg.totalScore;
    for (let i = 0; i < 7; i++) sum.byDayOfWeek[i] += agg.byDayOfWeek[i];
    sum.mobileSessions += agg.mobileSessions;
    sum.desktopSessions += agg.desktopSessions;
    sum.tabletSessions += agg.tabletSessions;
    sum.otherSessions += agg.otherSessions;
    sum.mobileSecondsTotal += agg.mobileSecondsTotal;
    sum.desktopSecondsTotal += agg.desktopSecondsTotal;
    sum.tabletSecondsTotal += agg.tabletSecondsTotal;
    sum.otherSecondsTotal += agg.otherSecondsTotal;
    sum.secondsTotal += agg.secondsTotal;

    sum.impressions += agg.impressions;
    sum.mClicks += agg.mClicks;
    sum.spend += agg.spend;
    sum.budgetAllocated += agg.budgetAllocated;
    sum.grossVisits += agg.grossVisits;
    sum.conversions += agg.conversions;
    sum.visitsZeroPrev += agg.visitsZeroPrev;
    sum.visitsOneThreePrev += agg.visitsOneThreePrev;
    sum.visitsFourPlusPrev += agg.visitsFourPlusPrev;
    sum.netVisits += agg.netVisits;
    sum.videoImpressions += agg.videoImpressions;
    sum.completeViews += agg.completeViews;
    sum.videoFirstQuartileViews += agg.videoFirstQuartileViews;
    sum.videoMidpointViews += agg.videoMidpointViews;
    sum.videoThirdQuartileViews += agg.videoThirdQuartileViews;
    sum.videoCircularViews += agg.videoCircularViews;
    sum.videoAvgCircularTimeWeighted += agg.videoAvgCircularTime * agg.videoImpressions;

    sum.compVisits += agg.compVisits;
    sum.totalMarketVisits += agg.totalMarketVisits;
    hhiSum += agg.hhiInput * agg.grossVisits;

    alertCounts[agg.alertType]++;

    byStore.push({
      storeId: store.id,
      storeName: store.name,
      users: agg.sessions,
      totalScore: agg.totalScore,
      grossVisits: agg.grossVisits,
      retailerShare: agg.grossVisits / Math.max(1, agg.totalMarketVisits),
      alertType: agg.alertType
    });

    for (const c of agg.catScores) {
      const cur = catTotals.get(c.id) || { id: c.id, name: c.name, score: 0, views: 0, clicks: 0, adds: 0 };
      cur.score += c.score; cur.views += c.views; cur.clicks += c.clicks; cur.adds += c.adds;
      catTotals.set(c.id, cur);
    }
    for (const p of agg.promotions) {
      const cur = promoTotals.get(p.id) || { id: p.id, label: p.label, category: p.category, score: 0, views: 0, clicks: 0, adds: 0 };
      cur.score += p.score; cur.views += p.views; cur.clicks += p.clicks; cur.adds += p.adds;
      promoTotals.set(p.id, cur);
    }
    for (const c of agg.coupons) {
      const cur = couponTotals.get(c.id) || { id: c.id, label: c.label, clips: 0, views: 0 };
      cur.clips += c.clips; cur.views += c.views;
      couponTotals.set(c.id, cur);
    }
    for (const pg of agg.pageNav) {
      const cur = pageTotals.get(pg.id) || { id: pg.id, label: pg.label, hits: 0 };
      cur.hits += pg.hits;
      pageTotals.set(pg.id, cur);
    }
    for (const cr of agg.byCreativeStore) {
      const cur = creativeTotals.get(cr.creativeId) || {
        creativeId: cr.creativeId, label: cr.label, type: cr.type, channel: cr.channel,
        creativeStatus: cr.creativeStatus, impressions: 0, clicks: 0, spend: 0
      };
      cur.impressions += cr.impressions; cur.clicks += cr.clicks; cur.spend += cr.spend;
      creativeTotals.set(cr.creativeId, cur);
    }
    for (const x of agg.crossoverStore) {
      const cur = crossoverTotals.get(x.competitorName) || {
        competitorName: x.competitorName, competitorAddress: x.competitorAddress,
        crossoverPctWeighted: 0, crossoverVisitsZeroPrev: 0, crossoverVisitsOneThree: 0, crossoverVisitsFourPlus: 0,
        trendVotes: { rising: 0, falling: 0, stable: 0 }, weight: 0
      };
      cur.crossoverPctWeighted += x.crossoverPct * agg.grossVisits;
      cur.crossoverVisitsZeroPrev += x.crossoverVisitsZeroPrev;
      cur.crossoverVisitsOneThree += x.crossoverVisitsOneThree;
      cur.crossoverVisitsFourPlus += x.crossoverVisitsFourPlus;
      cur.trendVotes[x.trend]++;
      cur.weight += agg.grossVisits;
      crossoverTotals.set(x.competitorName, cur);
    }

    demoWeight += agg.demoWeight;
    for (let i = 0; i < 6; i++) ageAcc[i] += agg.ageProps[i] * agg.demoWeight;
    for (let i = 0; i < 4; i++) incomeAcc[i] += agg.incomeProps[i] * agg.demoWeight;
    for (let i = 0; i < 4; i++) hhSizeAcc[i] += agg.hhSizeProps[i] * agg.demoWeight;
    for (let i = 0; i < 3; i++) nwAcc[i] += agg.nwProps[i] * agg.demoWeight;
    maleAcc     += agg.malePct     * agg.demoWeight;
    marriedAcc  += agg.marriedPct  * agg.demoWeight;
    childrenAcc += agg.childrenPct * agg.demoWeight;
    ownerAcc    += agg.ownerPct    * agg.demoWeight;
  }

  const wt = Math.max(1, demoWeight);
  return {
    sum,
    catTotals, promoTotals, couponTotals, pageTotals, creativeTotals, crossoverTotals,
    alertCounts, byStore,
    hhi: round(hhiSum / Math.max(1, sum.grossVisits), 3),
    demographics: {
      gender: [
        { label: 'Male',   value: round(maleAcc / wt, 3) },
        { label: 'Female', value: round(1 - (maleAcc / wt), 3) }
      ],
      age: ['18-24','25-34','35-44','45-54','55-64','65+'].map((label, i) => ({ label, value: round(ageAcc[i] / wt, 3) })),
      householdIncome: ['<$50K','$50-100K','$100-150K','$150K+'].map((label, i) => ({ label, value: round(incomeAcc[i] / wt, 3) })),
      maritalStatus: [
        { label: 'Married', value: round(marriedAcc / wt, 3) },
        { label: 'Single',  value: round(1 - (marriedAcc / wt), 3) }
      ],
      children: [
        { label: 'With children', value: round(childrenAcc / wt, 3) },
        { label: 'No children',   value: round(1 - (childrenAcc / wt), 3) }
      ],
      homeowner: [
        { label: 'Owner',  value: round(ownerAcc / wt, 3) },
        { label: 'Renter', value: round(1 - (ownerAcc / wt), 3) }
      ],
      householdSize: ['1','2','3','4+'].map((label, i) => ({ label, value: round(hhSizeAcc[i] / wt, 3) })),
      netWorth: ['<$100K','$100-500K','$500K+'].map((label, i) => ({ label, value: round(nwAcc[i] / wt, 3) }))
    }
  };
}

// ---------- href rules per schema §6.1 ----------
function hrefFor(rowType, id) {
  switch (rowType) {
    case 'store':       return `engagement-explore-base.html?store=${id}`;
    case 'category':    return `engagement-explore-base-categories.html?category=${id.replace('category-','')}`;
    case 'promotion':   return `engagement-explore-base-promotions.html?promotion=${id}`;
    case 'coupon':      return `engagement-explore-base-promotions.html?coupon=${id}`;
    case 'page':        return `engagement-explore-base.html?page=${id.replace('page-','')}`;
    default:            return undefined;
  }
}

// Top-5 ranker (ties broken alphabetically by label)
function top5(rows, valueKey) {
  return rows
    .slice()
    .sort((a, b) => (b[valueKey] - a[valueKey]) || a.label.localeCompare(b.label))
    .slice(0, 5);
}

// VCA breakdown helper from views/clicks/adds (weighted by 1/5/20)
function vcaFrom(views, clicks, adds) {
  const v = views * 1, c = clicks * 5, a = adds * 20;
  const total = Math.max(1, v + c + a);
  return {
    viewsProportion:  round(v / total, 3),
    clicksProportion: round(c / total, 3),
    addsProportion:   round(a / total, 3)
  };
}

// ---------- Build a full aggregate payload for one entity × one week ----------
// `rolled` = output of sumStoreAggregates (or a single-store wrapped version)
// `entity`, `week`
// `prevRolled` = same shape from previous week (for deltaPct), or null
// `storeCount` = number of descendant stores
function buildPayload(entity, week, rolled, prevRolled, storeCount, prevStoreAlerts) {
  const s = rolled.sum;
  // engagement derived
  const avgSeconds = s.sessions > 0 ? Math.round(s.secondsTotal / s.sessions) : 0;
  const fmtDuration = `${Math.floor(avgSeconds / 60)}m ${avgSeconds % 60}s`;

  const prevTotal = prevRolled ? prevRolled.sum.totalScore : null;
  const deltaTotalScore = prevTotal ? (s.totalScore - prevTotal) / Math.max(1, prevTotal) : 0;
  const prevSessions = prevRolled ? prevRolled.sum.sessions : null;
  const deltaSessions = prevSessions ? (s.sessions - prevSessions) / Math.max(1, prevSessions) : 0;
  const prevUsers = prevRolled ? prevRolled.sum.sessions : null;
  const deltaUsers = prevUsers ? (s.sessions - prevUsers) / Math.max(1, prevUsers) : 0;
  const prevAvgSeconds = prevRolled && prevRolled.sum.sessions > 0
    ? prevRolled.sum.secondsTotal / prevRolled.sum.sessions : null;
  const deltaDuration = prevAvgSeconds ? (avgSeconds - prevAvgSeconds) / Math.max(1, prevAvgSeconds) : 0;

  const dirOf = (d) => d > 0.005 ? 'up' : d < -0.005 ? 'down' : 'flat';

  // Top stores: rank descendant stores (rolled.byStore) by totalScore
  const topStoresRows = rolled.byStore.map(b => ({
    id: b.storeId, label: '#' + b.storeId.replace('store-', '') + ' ' + b.storeName, value: b.totalScore,
    deltaPct: 0, // store-week deltas would require prev-week per-store recompute; left at 0 for Phase 1
    vca: vcaFrom(s.views * (b.totalScore / Math.max(1, s.totalScore)),
                 s.clicks * (b.totalScore / Math.max(1, s.totalScore)),
                 s.addToListCount * (b.totalScore / Math.max(1, s.totalScore))),
    href: hrefFor('store', b.storeId)
  }));
  const topStores = top5(topStoresRows, 'value');

  const topCategories = top5(Array.from(rolled.catTotals.values()).map(c => ({
    id: c.id, label: c.name, value: c.score, deltaPct: 0,
    vca: vcaFrom(c.views, c.clicks, c.adds),
    href: hrefFor('category', c.id)
  })), 'value');

  const topPromotions = top5(Array.from(rolled.promoTotals.values()).map(p => ({
    id: p.id, label: p.label, value: p.score, deltaPct: 0,
    vca: vcaFrom(p.views, p.clicks, p.adds),
    href: hrefFor('promotion', p.id)
  })), 'value');

  const topCouponClips = top5(Array.from(rolled.couponTotals.values()).map(c => ({
    id: c.id, label: c.label, value: c.clips, deltaPct: 0,
    vca: vcaFrom(c.views, c.clips * 5, 0), // PHASE-1-ASSUMPTION: coupons don't track adds
    href: hrefFor('coupon', c.id)
  })), 'value');

  const topPageNavigation = top5(Array.from(rolled.pageTotals.values()).map(p => ({
    id: p.id, label: p.label, value: p.hits, deltaPct: 0,
    vca: { viewsProportion: 1, clicksProportion: 0, addsProportion: 0 }, // PHASE-1-ASSUMPTION: page views only
    href: hrefFor('page', p.id)
  })), 'value');

  // Media derived
  const ctr = s.impressions > 0 ? round(s.mClicks / s.impressions, 5) : 0;
  const cpm = s.impressions > 0 ? round((s.spend / s.impressions) * 1000, 2) : 0;
  const cpc = s.mClicks > 0 ? round(s.spend / s.mClicks, 2) : 0;
  const costPerImpression = s.impressions > 0 ? round(s.spend / s.impressions, 4) : 0;
  const costPerVisit = s.grossVisits > 0 ? round(s.spend / s.grossVisits, 2) : 0;
  const visitsPerThousand = s.impressions > 0 ? round((s.grossVisits / s.impressions) * 1000, 3) : 0;
  const cpa = s.conversions > 0 ? round(s.spend / s.conversions, 2) : 0;

  // By creative (rolled) — derive per-creative rates
  const byCreative = Array.from(rolled.creativeTotals.values()).map(c => ({
    creativeId: c.creativeId, label: c.label, type: c.type, channel: c.channel,
    creativeStatus: c.creativeStatus,
    impressions: c.impressions,
    clicks: c.clicks,
    ctr: c.impressions > 0 ? round(c.clicks / c.impressions, 5) : 0,
    spend: round(c.spend, 2),
    cpm: c.impressions > 0 ? round((c.spend / c.impressions) * 1000, 2) : 0,
    cpc: c.clicks > 0 ? round(c.spend / c.clicks, 2) : 0
  }));

  // Crossover rollup
  const crossover = Array.from(rolled.crossoverTotals.values()).map(x => {
    const trendKey = ['rising','falling','stable']
      .reduce((best, t) => x.trendVotes[t] > x.trendVotes[best] ? t : best, 'stable');
    return {
      competitorName: x.competitorName,
      competitorAddress: x.competitorAddress,
      crossoverPct: round(x.crossoverPctWeighted / Math.max(1, x.weight), 3),
      crossoverVisitsZeroPrev: x.crossoverVisitsZeroPrev,
      crossoverVisitsOneThree: x.crossoverVisitsOneThree,
      crossoverVisitsFourPlus: x.crossoverVisitsFourPlus,
      trend: trendKey
    };
  }).sort((a, b) => b.crossoverPct - a.crossoverPct).slice(0, 5);

  // Traffic
  const retailerShare = s.totalMarketVisits > 0 ? round(s.grossVisits / s.totalMarketVisits, 3) : 0;
  const prevRetShare = prevRolled && prevRolled.sum.totalMarketVisits > 0
    ? prevRolled.sum.grossVisits / prevRolled.sum.totalMarketVisits : null;
  const shareChangePp = prevRetShare !== null ? round(retailerShare - prevRetShare, 3) : 0;
  const retailerGrowthRate = prevRolled && prevRolled.sum.grossVisits > 0
    ? round((s.grossVisits - prevRolled.sum.grossVisits) / prevRolled.sum.grossVisits, 3) : 0;
  const prevCompVisits = prevRolled ? prevRolled.sum.compVisits : null;
  const compGrowthRate = prevCompVisits ? round((s.compVisits - prevCompVisits) / prevCompVisits, 3) : 0;
  const growthAdvantage = round(retailerGrowthRate - compGrowthRate, 3);
  const storeAlerts = rolled.alertCounts;
  const storesOutperforming = storeAlerts.green;
  const storeLeaderboard = rolled.byStore
    .slice()
    .sort((a, b) => b.retailerShare - a.retailerShare || a.storeName.localeCompare(b.storeName))
    .slice(0, 10)
    .map(b => ({
      storeId: b.storeId,
      storeName: b.storeName,
      retailerShare: round(b.retailerShare, 3),
      alertType: b.alertType
    }));

  // By store (engagement totalUsers panel)
  const totalUsersByStore = rolled.byStore
    .slice()
    .sort((a, b) => b.users - a.users)
    .slice(0, 10)
    .map(b => ({
      storeId: b.storeId,
      storeName: b.storeName,
      users: b.users,
      proportion: round(b.users / Math.max(1, s.sessions), 3)
    }));

  // Video engagement
  const videoEngagement = s.videoImpressions > 0 ? {
    impressions: s.videoImpressions,
    completeViews: s.completeViews,
    completionRate: round(s.completeViews / s.videoImpressions, 3),
    firstQuartileViews: s.videoFirstQuartileViews,
    midpointViews: s.videoMidpointViews,
    thirdQuartileViews: s.videoThirdQuartileViews,
    avgCircularTime: round(s.videoAvgCircularTimeWeighted / s.videoImpressions, 1),
    circularViews: s.videoCircularViews
  } : null;

  // byDevice (engagement avgDuration)
  const dev = (sessions, secondsTotal) => sessions > 0 ? Math.round(secondsTotal / sessions) : 0;
  const byDevice = [
    { device: 'mobile',  seconds: dev(s.mobileSessions,  s.mobileSecondsTotal),  sessions: s.mobileSessions,  proportion: round(s.mobileSessions  / Math.max(1, s.sessions), 3), deltaPct: 0 },
    { device: 'desktop', seconds: dev(s.desktopSessions, s.desktopSecondsTotal), sessions: s.desktopSessions, proportion: round(s.desktopSessions / Math.max(1, s.sessions), 3), deltaPct: 0 },
    { device: 'tablet',  seconds: dev(s.tabletSessions,  s.tabletSecondsTotal),  sessions: s.tabletSessions,  proportion: round(s.tabletSessions  / Math.max(1, s.sessions), 3), deltaPct: 0 },
    { device: 'other',   seconds: dev(s.otherSessions,   s.otherSecondsTotal),   sessions: s.otherSessions,   proportion: round(s.otherSessions   / Math.max(1, s.sessions), 3), deltaPct: 0 }
  ];

  return {
    entity: {
      id: entity.id,
      name: entity.name,
      level: entity.level,
      storeCount
    },
    week: { ...week },
    engagement: {
      totals: {
        views: s.views,
        clicks: s.clicks,
        addToListCount: s.addToListCount,
        sessions: s.sessions,
        totalScore: s.totalScore
      },
      perfScore: {
        value: s.totalScore,
        deltaPct: round(deltaTotalScore, 3),
        deltaDirection: dirOf(deltaTotalScore),
        percentile: 50, // filled in pass 2
        runsAt: { count: storeCount, total: storeCount }
      },
      totalUsers: {
        value: s.sessions,
        deltaPct: round(deltaUsers, 3),
        deltaDirection: dirOf(deltaUsers),
        byStore: totalUsersByStore
      },
      sessions: {
        value: s.sessions,
        deltaPct: round(deltaSessions, 3),
        deltaDirection: dirOf(deltaSessions),
        byDayOfWeek: s.byDayOfWeek
      },
      avgDuration: {
        seconds: avgSeconds,
        formatted: fmtDuration,
        deltaPct: round(deltaDuration, 3),
        deltaDirection: dirOf(deltaDuration),
        byDevice
      },
      topStores,
      topCategories,
      topPromotions,
      topCouponClips,
      topPageNavigation,
      cohort: { storesActive: storeCount, storesTotal: storeCount }
    },
    distribution: {
      media: {
        totals: {
          impressions: s.impressions,
          clicks: s.mClicks,
          ctr,
          spend: round(s.spend, 2),
          budgetAllocated: round(s.budgetAllocated, 2),
          cpm,
          cpc,
          costPerImpression,
          grossVisits: s.grossVisits,
          costPerVisit,
          visitsPerThousand
        },
        byCreative,
        weeklyTrend: [] // filled in pass 2
      },
      visitation: {
        totals: {
          grossVisits: s.grossVisits,
          netVisits: s.netVisits,
          visitsZeroPrev: s.visitsZeroPrev,
          visitsOneThreePrev: s.visitsOneThreePrev,
          visitsFourPlusPrev: s.visitsFourPlusPrev,
          costPerVisit,
          conversions: s.conversions,
          cpa
        },
        vcaSegments: {
          new: s.visitsZeroPrev,
          returning: s.visitsOneThreePrev,
          loyal: s.visitsFourPlusPrev
        },
        weeklyTrend: [] // filled in pass 2
      },
      traffic: {
        retailerShare,
        shareChangePp,
        storesOutperforming,
        storesTotal: storeCount,
        retailerGrowthRate,
        compGrowthRate,
        growthAdvantage,
        hhi: rolled.hhi,
        storeAlerts,
        storeLeaderboard
      },
      crossover,
      demographics: rolled.demographics,
      videoEngagement
    }
  };
}

// ---------- Wrap a single store agg as a "rolled" structure ----------
function wrapStoreAsRolled(store, agg) {
  // Make a fake rolled object so buildPayload works for stores too.
  const catTotals = new Map();
  for (const c of agg.catScores) catTotals.set(c.id, { id: c.id, name: c.name, score: c.score, views: c.views, clicks: c.clicks, adds: c.adds });
  const promoTotals = new Map();
  for (const p of agg.promotions) promoTotals.set(p.id, { id: p.id, label: p.label, category: p.category, score: p.score, views: p.views, clicks: p.clicks, adds: p.adds });
  const couponTotals = new Map();
  for (const c of agg.coupons) couponTotals.set(c.id, { id: c.id, label: c.label, clips: c.clips, views: c.views });
  const pageTotals = new Map();
  for (const pg of agg.pageNav) pageTotals.set(pg.id, { id: pg.id, label: pg.label, hits: pg.hits });
  const creativeTotals = new Map();
  for (const cr of agg.byCreativeStore) creativeTotals.set(cr.creativeId, { ...cr });
  const crossoverTotals = new Map();
  for (const x of agg.crossoverStore) crossoverTotals.set(x.competitorName, {
    competitorName: x.competitorName, competitorAddress: x.competitorAddress,
    crossoverPctWeighted: x.crossoverPct * agg.grossVisits,
    crossoverVisitsZeroPrev: x.crossoverVisitsZeroPrev,
    crossoverVisitsOneThree: x.crossoverVisitsOneThree,
    crossoverVisitsFourPlus: x.crossoverVisitsFourPlus,
    trendVotes: { rising: x.trend === 'rising' ? 1 : 0, falling: x.trend === 'falling' ? 1 : 0, stable: x.trend === 'stable' ? 1 : 0 },
    weight: agg.grossVisits
  });

  const sum = {
    views: agg.views, clicks: agg.clicks, addToListCount: agg.addToListCount, sessions: agg.sessions, totalScore: agg.totalScore,
    byDayOfWeek: agg.byDayOfWeek.slice(),
    mobileSessions: agg.mobileSessions, desktopSessions: agg.desktopSessions, tabletSessions: agg.tabletSessions, otherSessions: agg.otherSessions,
    mobileSecondsTotal: agg.mobileSecondsTotal, desktopSecondsTotal: agg.desktopSecondsTotal,
    tabletSecondsTotal: agg.tabletSecondsTotal, otherSecondsTotal: agg.otherSecondsTotal,
    secondsTotal: agg.secondsTotal,
    impressions: agg.impressions, mClicks: agg.mClicks, spend: agg.spend, budgetAllocated: agg.budgetAllocated,
    grossVisits: agg.grossVisits, conversions: agg.conversions,
    visitsZeroPrev: agg.visitsZeroPrev, visitsOneThreePrev: agg.visitsOneThreePrev, visitsFourPlusPrev: agg.visitsFourPlusPrev,
    netVisits: agg.netVisits,
    videoImpressions: agg.videoImpressions, completeViews: agg.completeViews,
    videoFirstQuartileViews: agg.videoFirstQuartileViews, videoMidpointViews: agg.videoMidpointViews,
    videoThirdQuartileViews: agg.videoThirdQuartileViews,
    videoCircularViews: agg.videoCircularViews,
    videoAvgCircularTimeWeighted: agg.videoAvgCircularTime * agg.videoImpressions,
    compVisits: agg.compVisits, totalMarketVisits: agg.totalMarketVisits
  };
  return {
    sum,
    catTotals, promoTotals, couponTotals, pageTotals, creativeTotals, crossoverTotals,
    alertCounts: { green: agg.alertType === 'green' ? 1 : 0, amber: agg.alertType === 'amber' ? 1 : 0, red: agg.alertType === 'red' ? 1 : 0 },
    byStore: [{
      storeId: store.id, storeName: store.name,
      users: agg.sessions, totalScore: agg.totalScore,
      grossVisits: agg.grossVisits,
      retailerShare: agg.grossVisits / Math.max(1, agg.totalMarketVisits),
      alertType: agg.alertType
    }],
    hhi: agg.hhiInput,
    demographics: {
      gender: [
        { label: 'Male',   value: agg.malePct },
        { label: 'Female', value: round(1 - agg.malePct, 3) }
      ],
      age: ['18-24','25-34','35-44','45-54','55-64','65+'].map((label, i) => ({ label, value: round(agg.ageProps[i], 3) })),
      householdIncome: ['<$50K','$50-100K','$100-150K','$150K+'].map((label, i) => ({ label, value: round(agg.incomeProps[i], 3) })),
      maritalStatus: [
        { label: 'Married', value: agg.marriedPct },
        { label: 'Single',  value: round(1 - agg.marriedPct, 3) }
      ],
      children: [
        { label: 'With children', value: agg.childrenPct },
        { label: 'No children',   value: round(1 - agg.childrenPct, 3) }
      ],
      homeowner: [
        { label: 'Owner',  value: agg.ownerPct },
        { label: 'Renter', value: round(1 - agg.ownerPct, 3) }
      ],
      householdSize: ['1','2','3','4+'].map((label, i) => ({ label, value: round(agg.hhSizeProps[i], 3) })),
      netWorth: ['<$100K','$100-500K','$500K+'].map((label, i) => ({ label, value: round(agg.nwProps[i], 3) }))
    }
  };
}

// ---------- Main build ----------
function build() {
  // Pre-compute every entity × every week, in a single rolled structure cache.
  // key = entity.id + '|' + week.id
  const rolledCache = new Map();
  for (const entity of allNodes) {
    const stores = descendantStores(entity);
    for (const week of weeks) {
      const key = entity.id + '|' + week.id;
      if (entity.level === 'store') {
        const agg = buildStoreAggregate(entity, week);
        rolledCache.set(key, wrapStoreAsRolled(entity, agg));
      } else {
        rolledCache.set(key, sumStoreAggregates(stores, week));
      }
    }
  }

  // First pass: build payloads (uses previous-week rolled for deltas)
  const payloads = {};
  for (const entity of allNodes) {
    const storeCount = entity.level === 'store' ? 1 : descendantStores(entity).length;
    for (let w = 0; w < weeks.length; w++) {
      const week = weeks[w];
      const rolled = rolledCache.get(entity.id + '|' + week.id);
      const prevRolled = w > 0 ? rolledCache.get(entity.id + '|' + weeks[w-1].id) : null;
      const payload = buildPayload(entity, week, rolled, prevRolled, storeCount, null);
      payloads[entity.id + '|' + week.id] = payload;
    }
  }

  // Pass 2: percentile (entity vs peers at same level for the same week)
  const byLevelWeek = new Map(); // 'level|week' -> [{id, totalScore}]
  for (const entity of allNodes) {
    for (const week of weeks) {
      const key = entity.level + '|' + week.id;
      if (!byLevelWeek.has(key)) byLevelWeek.set(key, []);
      const p = payloads[entity.id + '|' + week.id];
      byLevelWeek.get(key).push({ id: entity.id, value: p.engagement.perfScore.value });
    }
  }
  for (const [key, list] of byLevelWeek.entries()) {
    list.sort((a, b) => a.value - b.value);
    const n = list.length;
    list.forEach((row, idx) => {
      const percentile = n <= 1 ? 100 : Math.round((idx / (n - 1)) * 100);
      const wId = key.split('|')[1];
      payloads[row.id + '|' + wId].engagement.perfScore.percentile = percentile;
    });
  }

  // Pass 3: weekly trends (media impressions, visitation grossVisits) — entity's own 13-week trajectory
  for (const entity of allNodes) {
    let prevMediaVal = null, prevVisitsVal = null;
    for (let w = 0; w < weeks.length; w++) {
      const week = weeks[w];
      const p = payloads[entity.id + '|' + week.id];
      const mediaVal = p.distribution.media.totals.impressions;
      const visitsVal = p.distribution.visitation.totals.grossVisits;
      const mediaTrendPoint = {
        weekId: week.id, weekNum: week.num, value: mediaVal,
        deltaPct: prevMediaVal ? round((mediaVal - prevMediaVal) / Math.max(1, prevMediaVal), 3) : 0
      };
      const visitsTrendPoint = {
        weekId: week.id, weekNum: week.num, value: visitsVal,
        deltaPct: prevVisitsVal ? round((visitsVal - prevVisitsVal) / Math.max(1, prevVisitsVal), 3) : 0
      };
      // Push onto this entity's CURRENT week trend so each week-payload includes all 13 points
      // (current week's perspective = the full series)
      prevMediaVal = mediaVal;
      prevVisitsVal = visitsVal;
    }
    // Compute full series once, then attach to each week payload
    const mediaSeries = [];
    const visitsSeries = [];
    let pm = null, pv = null;
    for (const week of weeks) {
      const p = payloads[entity.id + '|' + week.id];
      const mv = p.distribution.media.totals.impressions;
      const vv = p.distribution.visitation.totals.grossVisits;
      mediaSeries.push({ weekId: week.id, weekNum: week.num, value: mv, deltaPct: pm ? round((mv - pm) / Math.max(1, pm), 3) : 0 });
      visitsSeries.push({ weekId: week.id, weekNum: week.num, value: vv, deltaPct: pv ? round((vv - pv) / Math.max(1, pv), 3) : 0 });
      pm = mv; pv = vv;
    }
    for (const week of weeks) {
      const p = payloads[entity.id + '|' + week.id];
      p.distribution.media.weeklyTrend = mediaSeries;
      p.distribution.visitation.weeklyTrend = visitsSeries;
    }
  }

  return payloads;
}

const payloads = build();

mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
writeFileSync(OUTPUT_PATH, JSON.stringify(payloads));
const sizeKb = (JSON.stringify(payloads).length / 1024).toFixed(1);
console.log(`Wrote ${Object.keys(payloads).length} aggregate payloads (${sizeKb} KB) to ${OUTPUT_PATH}`);
