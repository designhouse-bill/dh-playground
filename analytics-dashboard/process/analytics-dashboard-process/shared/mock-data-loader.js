/**
 * Mock Data Loader
 * Loads mock data from the process folder for use in all versions.
 * This provides a consistent data interface across all UI variations.
 */

(function() {
  'use strict';

  // Data state
  let dataLoaded = false;
  let loadCallbacks = [];

  /**
   * Check if mock data is already loaded
   */
  function isDataLoaded() {
    return window.mockDatabase && window.mockDatabase.promotions;
  }

  /**
   * Load mock data script dynamically
   */
  function loadMockData() {
    if (isDataLoaded()) {
      dataLoaded = true;
      notifyCallbacks();
      return;
    }

    const script = document.createElement('script');
    script.src = '../../process/mock-data/007-scaled-data.js';
    script.onload = function() {
      if (isDataLoaded()) {
        dataLoaded = true;
        console.log('Mock data loaded successfully');
        console.log('Promotions:', window.mockDatabase.promotions?.length || 0);
        console.log('Categories:', Object.keys(window.mockDatabase.categories || {}).length);
        notifyCallbacks();
      } else {
        console.error('Mock data script loaded but data not found');
      }
    };
    script.onerror = function() {
      console.error('Failed to load mock data');
    };
    document.head.appendChild(script);
  }

  /**
   * Register callback for when data is ready
   */
  function onDataReady(callback) {
    if (dataLoaded) {
      callback(window.mockDatabase);
    } else {
      loadCallbacks.push(callback);
    }
  }

  /**
   * Notify all registered callbacks
   */
  function notifyCallbacks() {
    loadCallbacks.forEach(cb => cb(window.mockDatabase));
    loadCallbacks = [];
  }

  /**
   * Get summary metrics from mock data
   */
  function getSummaryMetrics() {
    if (!isDataLoaded()) return null;

    const promotions = window.mockDatabase.promotions || [];
    const totalViews = promotions.reduce((sum, p) => sum + (p.card_in_view || 0), 0);
    const totalClicks = promotions.reduce((sum, p) => sum + (p.card_clicked || 0), 0);
    const totalATL = promotions.reduce((sum, p) => sum + (p.added_to_list || 0), 0);

    return {
      totalPromotions: promotions.length,
      totalViews,
      totalClicks,
      totalATL,
      avgCTR: totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : 0,
      avgConversion: totalClicks > 0 ? ((totalATL / totalClicks) * 100).toFixed(1) : 0
    };
  }

  /**
   * Get top performing promotions
   */
  function getTopPromotions(limit = 10, sortBy = 'composite_score') {
    if (!isDataLoaded()) return [];

    const promotions = [...(window.mockDatabase.promotions || [])];
    return promotions
      .sort((a, b) => (b[sortBy] || 0) - (a[sortBy] || 0))
      .slice(0, limit);
  }

  /**
   * Get category performance summary
   */
  function getCategoryPerformance() {
    if (!isDataLoaded()) return [];

    const promotions = window.mockDatabase.promotions || [];
    const categories = {};

    promotions.forEach(p => {
      const cat = p.marketing_category || 'unknown';
      if (!categories[cat]) {
        categories[cat] = {
          name: cat,
          count: 0,
          totalViews: 0,
          totalClicks: 0,
          totalATL: 0,
          totalScore: 0
        };
      }
      categories[cat].count++;
      categories[cat].totalViews += p.card_in_view || 0;
      categories[cat].totalClicks += p.card_clicked || 0;
      categories[cat].totalATL += p.added_to_list || 0;
      categories[cat].totalScore += p.composite_score || 0;
    });

    return Object.values(categories)
      .map(c => ({
        ...c,
        avgScore: c.count > 0 ? Math.round(c.totalScore / c.count) : 0,
        ctr: c.totalViews > 0 ? ((c.totalClicks / c.totalViews) * 100).toFixed(1) : 0
      }))
      .sort((a, b) => b.avgScore - a.avgScore);
  }

  /**
   * Get store performance summary
   */
  function getStorePerformance() {
    if (!isDataLoaded()) return [];

    const storeHierarchy = window.mockDatabase.store_hierarchy;
    if (!storeHierarchy || !storeHierarchy.all_stores) return [];

    return storeHierarchy.all_stores.stores || [];
  }

  // Public API
  window.MockDataLoader = {
    load: loadMockData,
    onReady: onDataReady,
    isLoaded: () => dataLoaded,
    getSummaryMetrics,
    getTopPromotions,
    getCategoryPerformance,
    getStorePerformance,
    getData: () => window.mockDatabase
  };

  // Auto-load on script inclusion
  loadMockData();
})();
