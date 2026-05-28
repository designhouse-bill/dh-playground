// UX-846 Phase 2 — Deterministic seeded row generator per UX-846-DATA-LAYER-SCHEMA.md §7.
// Same (entityId, weekId, grain) → same records. Seed = hash of "entityId:weekId:grain".
//
// Public API (window.MockDataRowGenerator):
//   - generatePromotionRecords({ entityId, weekId })  → PromotionRecord[]  (~75)
//   - generateCreativeRecords({ entityId, weekId })   → CreativeRecord[]   (~5)
//   - generateCrossoverRecords({ entityId, weekId })  → CrossoverRecord[]  (~8)
//
// PHASE-2-ASSUMPTION: entity-store attribution — when entityId is above store level we
//   attribute records round-robin across the descendant stores derived from
//   MockDataHierarchy. If hierarchy is not loaded we fall back to a single synthetic
//   storeId = entityId-as-store. This keeps the generator runnable in isolation.
// PHASE-2-ASSUMPTION: parent-child combo rollup is mocked via a small fixed share
//   (~12% of promos are parents with 2 children each); childCount/parentPromoId wired
//   so consumers can exercise the shape. Real combo data deferred to API contract.
// PHASE-2-ASSUMPTION: creative `flights` always 1 flight aligned to the week start/end.
// PHASE-2-ASSUMPTION: realPulse* fields null in mock (Pulse overlay deferred to v2).

(function (root) {
  'use strict';

  // ---------- Hash / PRNG ----------
  // FNV-1a 32-bit hash for stable seed across runs.
  function fnv1a(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h >>> 0;
  }

  // Mulberry32 — small, fast, deterministic PRNG.
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

  function makeRng(entityId, weekId, grain) {
    return mulberry32(fnv1a(entityId + ':' + weekId + ':' + grain));
  }

  function randInt(rng, min, max) {
    return Math.floor(rng() * (max - min + 1)) + min;
  }
  function randFloat(rng, min, max, decimals) {
    const v = rng() * (max - min) + min;
    const p = Math.pow(10, decimals || 2);
    return Math.round(v * p) / p;
  }
  function choice(rng, arr) {
    return arr[Math.floor(rng() * arr.length)];
  }

  // ---------- Reference data ----------
  const CATEGORIES = [
    { id: 'category-meat',      name: 'meat',      displayName: 'Meat & Seafood' },
    { id: 'category-produce',   name: 'produce',   displayName: 'Produce' },
    { id: 'category-dairy',     name: 'dairy',     displayName: 'Dairy' },
    { id: 'category-bakery',    name: 'bakery',    displayName: 'Bakery' },
    { id: 'category-pantry',    name: 'pantry',    displayName: 'Pantry' },
    { id: 'category-beverages', name: 'beverages', displayName: 'Beverages' },
    { id: 'category-snacks',    name: 'snacks',    displayName: 'Snacks' },
    { id: 'category-frozen',    name: 'frozen',    displayName: 'Frozen' }
  ];

  const PROMO_NAMES_BY_CAT = {
    meat:      ['Ribeye Steak Family', 'Ground Beef 5lb', 'Boneless Chicken Breast', 'Pork Loin Roast', 'Atlantic Salmon Fillet', 'Bacon Thick Cut', 'Turkey Burger Patties', 'Shrimp 16-20ct'],
    produce:   ['Strawberries Family', 'Hass Avocados', 'Honeycrisp Apples', 'Organic Spring Mix', 'Roma Tomatoes', 'Sweet Corn 6pk', 'Seedless Grapes', 'Iceberg Lettuce'],
    dairy:     ['Greek Yogurt Family', 'Whole Milk Gallon', 'Sharp Cheddar Block', 'Salted Butter 1lb', 'Sour Cream 16oz', 'Cream Cheese Bar', 'Half & Half Quart', 'String Cheese 12pk'],
    bakery:    ['Sourdough Boule', 'Glazed Donut Dozen', 'French Baguette', 'Blueberry Muffin 4pk', 'Whole Wheat Loaf', 'Croissant 6pk', 'Apple Pie 9in', 'Bagel Variety 6pk'],
    pantry:    ['Pasta Penne 1lb', 'Marinara Jar 24oz', 'Olive Oil 750ml', 'Cereal Family', 'Peanut Butter 28oz', 'Canned Tuna 5oz', 'Rice 5lb Bag', 'Black Beans Can'],
    beverages: ['Soda 12pk Cans', 'Bottled Water 24pk', 'Sparkling Water 8pk', 'Orange Juice Gallon', 'Sports Drink 8pk', 'Cold Brew Carton', 'Energy Drink 4pk', 'Iced Tea Gallon'],
    snacks:    ['Tortilla Chips Family', 'Pretzels 16oz', 'Mixed Nuts Canister', 'Granola Bars 12pk', 'Popcorn Microwave 6pk', 'Cookies Family Pack', 'Trail Mix 1lb', 'Crackers Variety'],
    frozen:    ['Frozen Pizza Family', 'Ice Cream Half Gallon', 'Frozen Veggies 16oz', 'Frozen Berries 3lb', 'Frozen Waffles 24ct', 'Frozen Shrimp 1lb', 'Frozen Lasagna Family', 'Frozen Burritos 8pk']
  };

  const DEAL_TYPES = ['bogo', 'saleFlat', 'salePercent', 'couponClip', 'comboCard'];
  const DAYS_RUN_OPTIONS = [1, 3, 7];

  const CREATIVE_TYPES = ['static', 'video', 'dynamic'];
  const CHANNELS = ['email', 'display', 'social', 'video'];
  const CREATIVE_STATUS = ['active', 'paused', 'archived'];
  const KPIS = ['awareness', 'clickAndTraffic', 'conversions', 'video'];
  const KPI_METRICS = ['ctr', 'cpa', 'vcr', 'cpm'];
  const PACING = ['evenly', 'frontLoaded', 'backLoaded'];
  const FREQ_INTERVAL = ['hour', 'day', 'week'];

  const COMPETITORS = [
    { name: 'FreshChoice Market',    address: '1234 Main St' },
    { name: 'GreenLeaf Grocers',     address: '892 Oak Ave' },
    { name: 'Sunshine Supermarket',  address: '4501 Palm Blvd' },
    { name: 'CoastalMart',           address: '210 Harbor Way' },
    { name: 'Citrus Valley Foods',   address: '77 Orange Grove Rd' },
    { name: 'BlueWater Market',      address: '3320 Lakeside Dr' },
    { name: 'Heartland Pantry',      address: '1500 Prairie Ln' },
    { name: 'Magnolia Fresh',        address: '618 Magnolia St' },
    { name: 'TrailHead Grocer',      address: '92 Ridge Way' },
    { name: 'PalmettoFoods',         address: '4040 Palmetto Hwy' }
  ];
  const CROSSOVER_TRENDS = ['rising', 'falling', 'stable'];

  // ---------- Store resolution ----------
  // Returns an array of storeIds for any entityId by walking MockDataHierarchy.
  // Falls back to [entityId] if hierarchy not loaded (graceful degradation).
  function resolveStoreIds(entityId) {
    const h = root && root.MockDataHierarchy;
    if (!h) return [entityId];
    const { brand, subBrands, groups, stores } = h;

    if (entityId === h.retailer.id || entityId === brand.id) {
      return stores.map(s => s.id);
    }
    if (subBrands.some(sb => sb.id === entityId)) {
      return stores.filter(s => s.parentSubBrandId === entityId).map(s => s.id);
    }
    if (groups.some(g => g.id === entityId)) {
      return stores.filter(s => s.parentGroupId === entityId).map(s => s.id);
    }
    const direct = stores.find(s => s.id === entityId);
    if (direct) return [direct.id];
    return stores.map(s => s.id); // unknown entity → all
  }

  // ---------- Promotion records ----------
  function generatePromotionRecords({ entityId, weekId } = {}) {
    if (!entityId || !weekId) return [];
    const rng = makeRng(entityId, weekId, 'promotion');
    const storeIds = resolveStoreIds(entityId);
    const weekNum = parseInt(String(weekId).replace('week-', ''), 10) || 0;

    const TARGET = 75;
    const records = [];
    // Pre-pick parents — ~12% of records.
    const parentSlots = new Set();
    const parentCount = Math.max(1, Math.floor(TARGET * 0.12));
    while (parentSlots.size < parentCount) parentSlots.add(randInt(rng, 0, TARGET - 1));

    // Map promotionId → parentPromoId for children sequencing.
    const parentIdByIndex = {};

    for (let i = 0; i < TARGET; i++) {
      const cat = CATEGORIES[i % CATEGORIES.length];
      const nameList = PROMO_NAMES_BY_CAT[cat.name];
      const promotionName = nameList[i % nameList.length];
      const seq = String(i + 1).padStart(2, '0');
      const promotionId = `promo-wk${weekNum}-${cat.name}-${seq}`;
      const storeId = storeIds[i % storeIds.length];

      const isParent = parentSlots.has(i);
      const parentPromoId = !isParent && parentIdByIndex[i - 1]
        ? parentIdByIndex[i - 1]
        : null;
      const childCount = isParent ? 2 : 0;
      if (isParent) {
        // Children claim next 2 indices (best-effort, parent metadata only here).
        parentIdByIndex[i + 1] = promotionId;
        parentIdByIndex[i + 2] = promotionId;
      }

      const dealType = choice(rng, DEAL_TYPES);
      const originalPrice = randFloat(rng, 2.99, 24.99, 2);
      const discount = randFloat(rng, 0.15, 0.50, 2);
      const salePrice = Math.round(originalPrice * (1 - discount) * 100) / 100;

      const views = randInt(rng, 200, 5000);
      const clicks = Math.floor(views * randFloat(rng, 0.05, 0.35, 3));
      const addToListCount = Math.floor(clicks * randFloat(rng, 0.10, 0.45, 3));

      const inViewScore = views * 1;
      const clickScore = clicks * 5;
      const addToListScore = addToListCount * 20;
      const totalScore = inViewScore + clickScore + addToListScore;

      records.push({
        recordId: `rec-${promotionId}-${storeId}`,
        promotionId,
        promotionName,
        category: cat.name,
        categoryName: cat.displayName,
        weekId,
        storeId,
        originalPrice,
        salePrice,
        dealType,
        views,
        clicks,
        addToListCount,
        inViewScore,
        clickScore,
        addToListScore,
        totalScore,
        originalPosition: i + 1,
        unit: choice(rng, ['each', 'lb', '16oz', '12pk', 'family']),
        daysRun: choice(rng, DAYS_RUN_OPTIONS),
        isParent,
        parentPromoId,
        childCount
      });
    }
    return records;
  }

  // ---------- Creative records ----------
  function generateCreativeRecords({ entityId, weekId } = {}) {
    if (!entityId || !weekId) return [];
    const rng = makeRng(entityId, weekId, 'creative');
    const storeIds = resolveStoreIds(entityId);
    const weekNum = parseInt(String(weekId).replace('week-', ''), 10) || 0;

    // Resolve week start/end from MockDataWeeks if available.
    const weeks = (root && root.MockDataWeeks) || [];
    const wk = weeks.find(w => w.id === weekId) || { startDate: '2025-11-18', endDate: '2025-11-24' };

    const TARGET = 5;
    const labelPrefixes = ['Pre-Holiday', 'Weekly Flyer', 'Featured Categories', 'Loyalty Push', 'New Customer'];
    const records = [];
    for (let i = 0; i < TARGET; i++) {
      const creativeId = `creative-wk${weekNum}-${String.fromCharCode(97 + i)}`;
      const creativeType = choice(rng, CREATIVE_TYPES);
      const channel = creativeType === 'video' ? 'video' : choice(rng, ['email', 'display', 'social']);
      const storeId = storeIds[i % storeIds.length];

      const impressions = randInt(rng, 150000, 1200000);
      const ctr = randFloat(rng, 0.004, 0.012, 4);
      const clicks = Math.floor(impressions * ctr);
      const cpm = randFloat(rng, 4.00, 9.00, 2);
      const spend = Math.round((impressions / 1000) * cpm * 100) / 100;
      const cpc = clicks > 0 ? Math.round((spend / clicks) * 100) / 100 : 0;
      const budgetAllocated = Math.round(spend * randFloat(rng, 1.00, 1.10, 2) * 100) / 100;
      const grossVisits = Math.floor(impressions * randFloat(rng, 0.0003, 0.0008, 5));
      const costPerVisit = grossVisits > 0 ? Math.round((spend / grossVisits) * 100) / 100 : 0;
      const visitsPerThousand = Math.round((grossVisits / (impressions / 1000)) * 100) / 100;

      records.push({
        recordId: `rec-${creativeId}-${storeId}`,
        creativeId,
        label: `${labelPrefixes[i]} ${creativeType[0].toUpperCase() + creativeType.slice(1)}`,
        creativeType,
        channel,
        creativeStatus: choice(rng, CREATIVE_STATUS),
        weekId,
        storeId,
        kpi: choice(rng, KPIS),
        kpiMetric: choice(rng, KPI_METRICS),
        kpiValue: randFloat(rng, 0.5, 10.0, 2),
        pacing: choice(rng, PACING),
        frequencyAmount: randInt(rng, 1, 6),
        frequencyInterval: choice(rng, FREQ_INTERVAL),
        impressions,
        clicks,
        ctr,
        spend,
        budgetAllocated,
        cpm,
        cpc,
        costPerImpression: Math.round((cpm / 1000) * 10000) / 10000,
        grossVisits,
        costPerVisit,
        visitsPerThousand,
        flights: [{ startDate: wk.startDate, endDate: wk.endDate, budget: budgetAllocated }],
        realPulseCampaignId: null,
        realPulseBudgetTotal: null,
        realPulseGroup: null,
        realPulseStatus: null,
        realPulseKpi: null,
        realPulseKpiMetric: null,
        realPulseName: null
      });
    }
    return records;
  }

  // ---------- Crossover records ----------
  function generateCrossoverRecords({ entityId, weekId } = {}) {
    if (!entityId || !weekId) return [];
    const rng = makeRng(entityId, weekId, 'crossover');
    const storeIds = resolveStoreIds(entityId);

    const TARGET = 8;
    const records = [];
    for (let i = 0; i < TARGET; i++) {
      const comp = COMPETITORS[i % COMPETITORS.length];
      const storeId = storeIds[i % storeIds.length];
      const crossoverPct = randFloat(rng, 0.04, 0.28, 3);
      const z = randInt(rng, 80, 600);
      const o = randInt(rng, 150, 900);
      const f = randInt(rng, 60, 500);

      records.push({
        recordId: `rec-crossover-${weekId}-${storeId}-${i}`,
        competitorName: comp.name,
        competitorAddress: `${comp.address}, FL`,
        weekId,
        storeId,
        crossoverPct,
        crossoverVisitsZeroPrev: z,
        crossoverVisitsOneThree: o,
        crossoverVisitsFourPlus: f,
        primaryThreat: i === 0
      });
    }
    return records;
  }

  const api = {
    generatePromotionRecords,
    generateCreativeRecords,
    generateCrossoverRecords,
    // Exposed for testing / debugging only.
    _internal: { fnv1a, mulberry32, makeRng, resolveStoreIds }
  };

  if (root) root.MockDataRowGenerator = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : null);
