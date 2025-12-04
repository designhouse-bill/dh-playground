/**
 * Mock Data for Analytics Dashboard v6
 * Dynamic data with multi-week, multi-entity support
 *
 * Data flows UP from store-level atomic records:
 * Store × Week × Promotion → aggregated to categories, entities
 *
 * Generated: 2025-11-30
 * Stats: 3,673 records, 31 stores, 5 weeks, 8 categories
 */

const MockData = (() => {
  'use strict';

  // ============================================
  // WEEKS CONFIGURATION
  // ============================================
  const weeks = [
    { id: 'week-44', num: 44, label: 'Week 44', dateRange: 'Oct 28 - Nov 3, 2025', startDate: '2025-10-28' },
    { id: 'week-45', num: 45, label: 'Week 45', dateRange: 'Nov 4 - Nov 10, 2025', startDate: '2025-11-04' },
    { id: 'week-46', num: 46, label: 'Week 46', dateRange: 'Nov 11 - Nov 17, 2025', startDate: '2025-11-11' },
    { id: 'week-47', num: 47, label: 'Week 47', dateRange: 'Nov 18 - Nov 24, 2025', startDate: '2025-11-18' },
    { id: 'week-48', num: 48, label: 'Week 48', dateRange: 'Nov 25 - Dec 1, 2025', startDate: '2025-11-25' }
  ];

  // ============================================
  // ENTITY HIERARCHY
  // Brand → SubBrand → Store
  // ============================================
  const brands = [
    {
      id: 'brand-safeway',
      name: 'Safeway',
      subBrands: [
        {
          id: 'subbrand-safeway-west',
          name: 'Safeway West',
          stores: [
            { id: 'store-101', name: 'SF Market St', title: 'SF Market St', size: 'large', storeNumber: 101 },
            { id: 'store-102', name: 'SF Mission', title: 'SF Mission', size: 'medium', storeNumber: 102 },
            { id: 'store-103', name: 'Oakland Downtown', title: 'Oakland Downtown', size: 'large', storeNumber: 103 }
          ]
        },
        {
          id: 'subbrand-safeway-east',
          name: 'Safeway East',
          stores: [
            { id: 'store-104', name: 'Berkeley', title: 'Berkeley', size: 'medium', storeNumber: 104 },
            { id: 'store-105', name: 'Walnut Creek', title: 'Walnut Creek', size: 'large', storeNumber: 105 },
            { id: 'store-106', name: 'Concord', title: 'Concord', size: 'medium', storeNumber: 106 }
          ]
        }
      ]
    },
    {
      id: 'brand-vons',
      name: 'Vons',
      subBrands: [
        {
          id: 'subbrand-vons-socal',
          name: 'Vons SoCal',
          stores: [
            { id: 'store-201', name: 'LA Downtown', title: 'LA Downtown', size: 'large', storeNumber: 201 },
            { id: 'store-202', name: 'Santa Monica', title: 'Santa Monica', size: 'large', storeNumber: 202 },
            { id: 'store-203', name: 'Pasadena', title: 'Pasadena', size: 'medium', storeNumber: 203 }
          ]
        },
        {
          id: 'subbrand-vons-sd',
          name: 'Vons San Diego',
          stores: [
            { id: 'store-204', name: 'SD Gaslamp', title: 'SD Gaslamp', size: 'medium', storeNumber: 204 },
            { id: 'store-205', name: 'La Jolla', title: 'La Jolla', size: 'large', storeNumber: 205 },
            { id: 'store-206', name: 'Chula Vista', title: 'Chula Vista', size: 'medium', storeNumber: 206 }
          ]
        }
      ]
    },
    {
      id: 'brand-albertsons',
      name: 'Albertsons',
      subBrands: [
        {
          id: 'subbrand-albertsons-norcal',
          name: 'Albertsons NorCal',
          stores: [
            { id: 'store-301', name: 'Sacramento', title: 'Sacramento', size: 'large', storeNumber: 301 },
            { id: 'store-302', name: 'Fresno', title: 'Fresno', size: 'medium', storeNumber: 302 },
            { id: 'store-303', name: 'Stockton', title: 'Stockton', size: 'small', storeNumber: 303 }
          ]
        },
        {
          id: 'subbrand-albertsons-pnw',
          name: 'Albertsons PNW',
          stores: [
            { id: 'store-304', name: 'Portland', title: 'Portland', size: 'large', storeNumber: 304 },
            { id: 'store-305', name: 'Seattle', title: 'Seattle', size: 'large', storeNumber: 305 },
            { id: 'store-306', name: 'Tacoma', title: 'Tacoma', size: 'medium', storeNumber: 306 }
          ]
        }
      ]
    },
    {
      id: 'brand-jewelosco',
      name: 'Jewel-Osco',
      subBrands: [
        {
          id: 'subbrand-jewelosco-chicago',
          name: 'Jewel-Osco Chicago',
          stores: [
            { id: 'store-401', name: 'Chicago Loop', title: 'Chicago Loop', size: 'large', storeNumber: 401 },
            { id: 'store-402', name: 'Evanston', title: 'Evanston', size: 'medium', storeNumber: 402 },
            { id: 'store-403', name: 'Oak Park', title: 'Oak Park', size: 'medium', storeNumber: 403 }
          ]
        },
        {
          id: 'subbrand-jewelosco-suburbs',
          name: 'Jewel-Osco Suburbs',
          stores: [
            { id: 'store-404', name: 'Naperville', title: 'Naperville', size: 'large', storeNumber: 404 },
            { id: 'store-405', name: 'Schaumburg', title: 'Schaumburg', size: 'medium', storeNumber: 405 }
          ]
        }
      ]
    },
    {
      id: 'brand-acme',
      name: 'Acme Markets',
      subBrands: [
        {
          id: 'subbrand-acme-philly',
          name: 'Acme Philadelphia',
          stores: [
            { id: 'store-501', name: 'Center City', title: 'Center City', size: 'medium', storeNumber: 501 },
            { id: 'store-502', name: 'University City', title: 'University City', size: 'small', storeNumber: 502 }
          ]
        },
        {
          id: 'subbrand-acme-nj',
          name: 'Acme New Jersey',
          stores: [
            { id: 'store-503', name: 'Cherry Hill', title: 'Cherry Hill', size: 'large', storeNumber: 503 },
            { id: 'store-504', name: 'Princeton', title: 'Princeton', size: 'medium', storeNumber: 504 }
          ]
        }
      ]
    },
    {
      id: 'brand-shaws',
      name: "Shaw's",
      subBrands: [
        {
          id: 'subbrand-shaws-boston',
          name: "Shaw's Boston",
          stores: [
            { id: 'store-601', name: 'Boston Back Bay', title: 'Boston Back Bay', size: 'medium', storeNumber: 601 },
            { id: 'store-602', name: 'Cambridge', title: 'Cambridge', size: 'medium', storeNumber: 602 }
          ]
        },
        {
          id: 'subbrand-shaws-ne',
          name: "Shaw's New England",
          stores: [
            { id: 'store-603', name: 'Providence', title: 'Providence', size: 'medium', storeNumber: 603 },
            { id: 'store-604', name: 'Hartford', title: 'Hartford', size: 'small', storeNumber: 604 }
          ]
        }
      ]
    }
  ];

  // ============================================
  // CURRENT CONTEXT (mutable)
  // ============================================
  let currentContext = {
    weekNum: 48,
    weekId: 'week-48',
    weekLabel: 'Week 48',
    dateRange: 'Nov 25 - Dec 1, 2025',
    entityId: 'all',
    entityLevel: 'all',
    entityName: 'All Stores'
  };

  // ============================================
  // ATOMIC PROMOTION RECORDS
  // Loaded from promotion-records-data.js
  // ============================================
  let promotionRecords = [];

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  function getAllStores() {
    const stores = [];
    brands.forEach(brand => {
      brand.subBrands.forEach(subBrand => {
        subBrand.stores.forEach(store => {
          stores.push({
            ...store,
            subBrandId: subBrand.id,
            subBrandName: subBrand.name,
            brandId: brand.id,
            brandName: brand.name
          });
        });
      });
    });
    return stores;
  }

  function getStoreIdsForEntity(entityId, entityLevel) {
    if (entityLevel === 'all' || entityId === 'all') {
      return getAllStores().map(s => s.id);
    }

    if (entityLevel === 'brand') {
      const brand = brands.find(b => b.id === entityId);
      if (!brand) return [];
      const storeIds = [];
      brand.subBrands.forEach(sb => {
        sb.stores.forEach(s => storeIds.push(s.id));
      });
      return storeIds;
    }

    if (entityLevel === 'sub-brand') {
      for (const brand of brands) {
        const subBrand = brand.subBrands.find(sb => sb.id === entityId);
        if (subBrand) {
          return subBrand.stores.map(s => s.id);
        }
      }
      return [];
    }

    if (entityLevel === 'store') {
      return [entityId];
    }

    return getAllStores().map(s => s.id);
  }

  function getFilteredRecords(weekNum = null, entityId = null, entityLevel = null) {
    const week = weekNum || currentContext.weekNum;
    const entId = entityId || currentContext.entityId;
    const entLevel = entityLevel || currentContext.entityLevel;

    const storeIds = getStoreIdsForEntity(entId, entLevel);

    return promotionRecords.filter(r =>
      r.weekNum === week && storeIds.includes(r.storeId)
    );
  }

  function aggregateByCategory(records) {
    const byCategory = {};

    records.forEach(record => {
      if (!byCategory[record.category]) {
        byCategory[record.category] = {
          id: record.category.toLowerCase().replace(/\s+/g, '-'),
          name: record.category,
          promotionCount: 0,
          civ: 0,
          cc: 0,
          atl: 0,
          promotionIds: new Set()
        };
      }

      const cat = byCategory[record.category];
      cat.civ += record.civ;
      cat.cc += record.cc;
      cat.atl += record.atl;
      cat.promotionIds.add(record.promotionId);
    });

    const categories = Object.values(byCategory).map(cat => {
      cat.promotionCount = cat.promotionIds.size;
      delete cat.promotionIds;
      cat.compositeScore = Math.round((cat.civ * 0.4 + cat.cc * 10 + cat.atl * 15) / 100);
      return cat;
    });

    categories.sort((a, b) => b.compositeScore - a.compositeScore);
    categories.forEach((cat, idx) => {
      cat.percentile = Math.round(100 - (idx / categories.length) * 100);
    });

    categories.sort((a, b) => a.name.localeCompare(b.name));
    return categories;
  }

  function getUniquePromotions(records) {
    const promoMap = {};

    records.forEach(record => {
      if (!promoMap[record.promotionId]) {
        promoMap[record.promotionId] = {
          id: record.promotionId,
          name: record.title,
          category: record.category.toLowerCase().replace(/\s+/g, '-'),
          categoryName: record.category,
          dealType: record.dealType,
          cardSize: '1x1',
          heroImage: getPlaceholderImage(record.category),
          thumbImage: getPlaceholderImage(record.category),
          originalPrice: record.originalPrice,
          salePrice: record.salePrice,
          unit: record.unit,
          civ: 0,
          cc: 0,
          atl: 0,
          storeCount: 0
        };
      }

      const promo = promoMap[record.promotionId];
      promo.civ += record.civ;
      promo.cc += record.cc;
      promo.atl += record.atl;
      promo.storeCount++;
    });

    const promotions = Object.values(promoMap).map(p => {
      p.compositeScore = Math.round((p.civ * 0.4 + p.cc * 10 + p.atl * 15) / 100);
      return p;
    });

    promotions.sort((a, b) => b.compositeScore - a.compositeScore);
    promotions.forEach((p, idx) => {
      p.percentile = Math.round(100 - (idx / promotions.length) * 100);
    });

    return promotions;
  }

  function getPlaceholderImage(category) {
    const images = {
      'Produce': 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=300&h=200&fit=crop',
      'Meat': 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=300&h=200&fit=crop',
      'Dairy': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&h=200&fit=crop',
      'Bakery': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=200&fit=crop',
      'Frozen': 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=300&h=200&fit=crop',
      'Beverages': 'https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=300&h=200&fit=crop',
      'Snacks': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300&h=200&fit=crop',
      'Pantry': 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=300&h=200&fit=crop'
    };
    return images[category] || images['Produce'];
  }

  function loadPromotionRecords(records) {
    promotionRecords = records;
    console.log(`📊 MockData: Loaded ${records.length} promotion records`);
  }

  function buildEntitiesStructure() {
    const subBrandsList = [];
    const storesList = [];

    brands.forEach(brand => {
      brand.subBrands.forEach(subBrand => {
        subBrandsList.push({
          id: subBrand.id,
          name: subBrand.name,
          level: 'sub-brand',
          brandId: brand.id,
          storeCount: subBrand.stores.length,
          stores: subBrand.stores.map(s => s.id)
        });

        subBrand.stores.forEach(store => {
          storesList.push({
            id: store.id,
            name: store.name,
            title: store.title,
            storeNumber: store.storeNumber,
            subBrand: subBrand.id,
            brandId: brand.id
          });
        });
      });
    });

    return {
      brand: {
        id: 'all',
        name: 'All Brands',
        level: 'all',
        storeCount: storesList.length
      },
      brands: brands.map(b => ({
        id: b.id,
        name: b.name,
        level: 'brand',
        storeCount: b.subBrands.reduce((sum, sb) => sum + sb.stores.length, 0)
      })),
      subBrands: subBrandsList,
      stores: storesList,
      groups: []
    };
  }

  // ============================================
  // PUBLIC API
  // ============================================
  return {
    weeks,
    brands,

    get context() {
      return {
        week: currentContext.weekNum,
        weekId: currentContext.weekId,
        weekLabel: currentContext.weekLabel,
        dateRange: currentContext.dateRange,
        entity: {
          id: currentContext.entityId,
          name: currentContext.entityName,
          level: currentContext.entityLevel,
          count: getStoreIdsForEntity(currentContext.entityId, currentContext.entityLevel).length
        }
      };
    },

    get entities() {
      return buildEntitiesStructure();
    },

    get categories() {
      const records = getFilteredRecords();
      return aggregateByCategory(records);
    },

    get promotions() {
      const records = getFilteredRecords();
      return getUniquePromotions(records);
    },

    getRecords(weekNum, entityId, entityLevel) {
      return getFilteredRecords(weekNum, entityId, entityLevel);
    },

    setContext(weekNum, entityId, entityLevel, entityName) {
      const week = weeks.find(w => w.num === weekNum);
      if (week) {
        currentContext.weekNum = weekNum;
        currentContext.weekId = week.id;
        currentContext.weekLabel = week.label;
        currentContext.dateRange = week.dateRange;
      }
      if (entityId !== undefined) {
        currentContext.entityId = entityId;
        currentContext.entityLevel = entityLevel || 'all';
        currentContext.entityName = entityName || 'All Stores';
      }
    },

    setWeek(weekNum) {
      const week = weeks.find(w => w.num === weekNum);
      if (week) {
        currentContext.weekNum = weekNum;
        currentContext.weekId = week.id;
        currentContext.weekLabel = week.label;
        currentContext.dateRange = week.dateRange;
      }
    },

    setEntity(entityId, entityLevel, entityName) {
      currentContext.entityId = entityId;
      currentContext.entityLevel = entityLevel || 'all';
      currentContext.entityName = entityName || 'All Stores';
    },

    loadPromotionRecords,
    getAllStores,
    getStoreIdsForEntity,
    aggregateByCategory,
    getUniquePromotions,

    // Backward compatibility helpers
    getCategoryById(id) {
      return this.categories.find(c => c.id === id);
    },

    getPromotionById(id) {
      return this.promotions.find(p => p.id === id);
    },

    getPromotionsByCategory(categoryId) {
      return this.promotions.filter(p => p.category === categoryId);
    },

    getEntityById(id) {
      if (id === 'all') return this.entities.brand;
      const brand = this.entities.brands.find(b => b.id === id);
      if (brand) return brand;
      const subBrand = this.entities.subBrands.find(sb => sb.id === id);
      if (subBrand) return subBrand;
      return this.entities.stores.find(s => s.id === id);
    },

    comparisonData: {
      currentWeek: { id: 'week-48', label: 'Week 48', dateRange: 'Nov 25 - Dec 1, 2025' },
      previousWeek: { id: 'week-47', label: 'Week 47', dateRange: 'Nov 18 - Nov 24, 2025' },
      overallMetrics: {
        totalCIV: { current: 0, previous: 0, change: 0, changeType: 'stable' },
        totalCC: { current: 0, previous: 0, change: 0, changeType: 'stable' },
        totalATL: { current: 0, previous: 0, change: 0, changeType: 'stable' }
      },
      categoryMetrics: [],
      trendSummary: { topGainers: [], topDecliners: [], insights: [] }
    },

    topStores: []
  };
})();

// Expose to window for data-service.js access
window.MockData = MockData;

// Load data when promotionRecordsData is available
(function() {
  if (typeof window.promotionRecordsData !== 'undefined') {
    MockData.loadPromotionRecords(window.promotionRecordsData);
  }
})();
