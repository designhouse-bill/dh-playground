/**
 * Promotion Generator
 * Creates store×week×promotion records with realistic variance
 *
 * KEY BEHAVIOR:
 * - Same promotion at different stores = different metrics (within ±25%)
 * - Same promotion at same store, different week = different metrics
 * - Seeded randomness ensures reproducibility
 */

const { createSeededRandom } = require('../seed-random');
const { catalog, dealTypes } = require('../product-catalog');
const { weeks, sizeConfig, getAllStores } = require('../store-config');

/**
 * Generate metrics for a promotion at a specific store
 *
 * KEY: Same promotion ID + different store = different seed
 * This creates variation within a reasonable range (±25%)
 */
function generatePromoMetrics(promotionId, storeId, weekNum, storeSize) {
  // Seed combines promotion identity + store + week
  // Same promo at different stores → different seeds → different values
  const seed = `${promotionId}-${storeId}-${weekNum}`;
  const rng = createSeededRandom(seed);

  const config = sizeConfig[storeSize];

  // Vary within ±25% - enough to show difference, not huge
  const civ = rng.varyBy(config.baseCIV, 25);
  const cc = rng.varyBy(config.baseCC, 25);
  const atl = rng.varyBy(config.baseATL, 25);

  return { civ, cc, atl };
}

/**
 * Generate a weekly "circular" of promotions shared across stores
 * Each week has a consistent set of promotions, but metrics vary by store
 */
function generateWeeklyCircular(weekNum, productsPerCategory = 3) {
  const seed = `circular-week-${weekNum}`;
  const rng = createSeededRandom(seed);

  const promotions = [];
  const categories = Object.keys(catalog);

  categories.forEach((category, catIndex) => {
    const products = catalog[category];
    // Shuffle products for this week to get variety
    const shuffled = rng.shuffle(products);

    // Take top N products for this category
    const selected = shuffled.slice(0, productsPerCategory);

    selected.forEach((product, prodIndex) => {
      const dealType = rng.pick(dealTypes);
      // Discount between 20% and 45%
      const discountPercent = 20 + rng.intBetween(0, 25);
      const salePrice = +(product.basePrice * (1 - discountPercent / 100)).toFixed(2);

      // Promotion ID is consistent across all stores for the same week
      const promoId = `promo-wk${weekNum}-${category.toLowerCase()}-${prodIndex}`;

      promotions.push({
        promotionId: promoId,
        category,
        title: product.name,
        unit: product.unit,
        originalPrice: product.basePrice,
        salePrice,
        dealType,
        discountPercent
      });
    });
  });

  return promotions;
}

/**
 * Determine which promotions a specific store carries for a week
 * Larger stores carry more of the weekly circular
 */
function getStorePromotions(storeId, storeSize, weekNum, weeklyCircular) {
  const seed = `store-selection-${storeId}-${weekNum}`;
  const rng = createSeededRandom(seed);

  const config = sizeConfig[storeSize];
  const targetCount = rng.intBetween(config.minPromos, config.maxPromos);

  // Shuffle and take appropriate number
  const shuffled = rng.shuffle(weeklyCircular);
  return shuffled.slice(0, Math.min(targetCount, weeklyCircular.length));
}

/**
 * Generate all store×week×promotion records
 */
function generateAllPromotions(options = {}) {
  const {
    productsPerCategory = 3  // How many products per category per week
  } = options;

  const records = [];
  const stores = getAllStores();

  // Generate weekly circulars first (shared across stores)
  const weeklyCirculars = {};
  weeks.forEach(week => {
    weeklyCirculars[week.num] = generateWeeklyCircular(week.num, productsPerCategory);
  });

  // Now generate store-specific records
  stores.forEach(store => {
    weeks.forEach(week => {
      const storePromos = getStorePromotions(
        store.id,
        store.size,
        week.num,
        weeklyCirculars[week.num]
      );

      storePromos.forEach(promo => {
        const metrics = generatePromoMetrics(
          promo.promotionId,
          store.id,
          week.num,
          store.size
        );

        records.push({
          // Entity hierarchy
          storeId: store.id,
          storeName: store.name,
          storeSize: store.size,
          subBrandId: store.subBrandId,
          subBrandName: store.subBrandName,
          brandId: store.brandId,
          brandName: store.brandName,

          // Week
          weekNum: week.num,
          weekLabel: week.label,
          weekStartDate: week.startDate,

          // Promotion details
          promotionId: promo.promotionId,
          category: promo.category,
          title: promo.title,
          unit: promo.unit,
          originalPrice: promo.originalPrice,
          salePrice: promo.salePrice,
          dealType: promo.dealType,

          // Metrics (vary by store+week)
          civ: metrics.civ,
          cc: metrics.cc,
          atl: metrics.atl
        });
      });
    });
  });

  return records;
}

/**
 * Aggregate records by category for a given filter
 */
function aggregateByCategory(records) {
  const byCategory = {};

  records.forEach(record => {
    if (!byCategory[record.category]) {
      byCategory[record.category] = {
        category: record.category,
        promotionCount: 0,
        totalCIV: 0,
        totalCC: 0,
        totalATL: 0
      };
    }

    const cat = byCategory[record.category];
    cat.promotionCount++;
    cat.totalCIV += record.civ;
    cat.totalCC += record.cc;
    cat.totalATL += record.atl;
  });

  return Object.values(byCategory);
}

/**
 * Get summary statistics
 */
function getGenerationStats(records) {
  const uniquePromos = new Set(records.map(r => r.promotionId)).size;
  const uniqueStores = new Set(records.map(r => r.storeId)).size;
  const uniqueWeeks = new Set(records.map(r => r.weekNum)).size;

  return {
    totalRecords: records.length,
    uniquePromotions: uniquePromos,
    uniqueStores: uniqueStores,
    uniqueWeeks: uniqueWeeks,
    avgRecordsPerStore: Math.round(records.length / uniqueStores),
    avgRecordsPerWeek: Math.round(records.length / uniqueWeeks)
  };
}

module.exports = {
  generatePromoMetrics,
  generateWeeklyCircular,
  getStorePromotions,
  generateAllPromotions,
  aggregateByCategory,
  getGenerationStats
};
