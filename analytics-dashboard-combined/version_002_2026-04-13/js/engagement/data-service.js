/**
 * DATA SERVICE - API Simulation & Cache Integration
 * v6-production Analytics Dashboard
 *
 * Provides a fetch-like interface for analytics data with intelligent caching.
 * Simulates realistic API behavior with network delays, error handling, and retry logic.
 *
 * Features:
 * - Cache-first strategy with fallback to fresh data
 * - Configurable network delay simulation
 * - Automatic retry on failure
 * - Loading state management
 * - Week-over-week comparison data
 * - Error tracking and reporting
 */

const DataService = (() => {
  'use strict';

  // ========================================
  // CONFIGURATION
  // ========================================

  const CONFIG = {
    SIMULATE_NETWORK_DELAY: true,
    MIN_DELAY: 100,  // Minimum simulated network delay (ms)
    MAX_DELAY: 400,  // Maximum simulated network delay (ms)
    CACHE_TTL: {
      promotions: 1000 * 60 * 10,    // 10 minutes
      categories: 1000 * 60 * 30,     // 30 minutes
      detail: 1000 * 60 * 5,          // 5 minutes
      comparison: 1000 * 60 * 15      // 15 minutes
    },
    MAX_RETRIES: 2,
    RETRY_DELAY: 1000,
    DEBUG: window.location.hostname === 'localhost'
  };

  // ========================================
  // STATE
  // ========================================

  const state = {
    isLoading: false,
    lastError: null,
    requestCount: 0,
    cacheHitCount: 0,
    cacheMissCount: 0
  };

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  /**
   * Simulate network delay for realistic API behavior
   * @returns {Promise<void>}
   */
  function simulateNetworkDelay() {
    if (!CONFIG.SIMULATE_NETWORK_DELAY) {
      return Promise.resolve();
    }

    const delay = Math.random() * (CONFIG.MAX_DELAY - CONFIG.MIN_DELAY) + CONFIG.MIN_DELAY;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Generate cache key for request
   * @param {string} endpoint - API endpoint name
   * @param {Object} params - Request parameters
   * @returns {string}
   */
  function getCacheKey(endpoint, params = {}) {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return paramString ? `${endpoint}?${paramString}` : endpoint;
  }

  /**
   * Sleep utility for retry logic
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ========================================
  // DATA FETCHING WITH CACHE
  // ========================================

  /**
   * Fetch data with cache-first strategy
   * @param {string} endpoint - API endpoint name
   * @param {Function} dataFn - Function to fetch fresh data
   * @param {Object} options - Fetch options
   * @returns {Promise<*>}
   */
  async function fetchWithCache(endpoint, dataFn, options = {}) {
    const {
      params = {},
      ttl = CONFIG.CACHE_TTL[endpoint] || CONFIG.CACHE_TTL.promotions,
      useCache = true,
      retries = CONFIG.MAX_RETRIES
    } = options;

    state.requestCount++;
    const cacheKey = getCacheKey(endpoint, params);

    // Try cache first if enabled
    if (useCache) {
      try {
        const cached = await CacheManager.get(cacheKey);
        if (cached !== null) {
          state.cacheHitCount++;
          if (CONFIG.DEBUG) {
            console.log(`💾 DataService: Cache hit for ${endpoint}`);
          }
          return cached;
        }
        state.cacheMissCount++;
      } catch (error) {
        if (CONFIG.DEBUG) {
          console.warn(`⚠️ DataService: Cache read error for ${endpoint}`, error);
        }
      }
    }

    // Fetch fresh data with retry logic
    let lastError = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        if (CONFIG.DEBUG) {
          console.log(`🌐 DataService: Fetching ${endpoint} (attempt ${attempt + 1}/${retries + 1})`);
        }

        // Simulate network delay
        await simulateNetworkDelay();

        // Fetch data
        const data = await dataFn(params);

        // Cache the result
        if (useCache) {
          try {
            await CacheManager.set(cacheKey, data, ttl);
          } catch (cacheError) {
            if (CONFIG.DEBUG) {
              console.warn(`⚠️ DataService: Cache write error for ${endpoint}`, cacheError);
            }
          }
        }

        if (CONFIG.DEBUG) {
          console.log(`✅ DataService: Successfully fetched ${endpoint}`);
        }

        return data;
      } catch (error) {
        lastError = error;
        if (CONFIG.DEBUG) {
          console.error(`❌ DataService: Fetch error for ${endpoint} (attempt ${attempt + 1})`, error);
        }

        // Wait before retry
        if (attempt < retries) {
          await sleep(CONFIG.RETRY_DELAY);
        }
      }
    }

    // All retries failed
    state.lastError = lastError;
    throw new Error(`Failed to fetch ${endpoint} after ${retries + 1} attempts: ${lastError.message}`);
  }

  // ========================================
  // API ENDPOINTS
  // ========================================

  /**
   * Fetch all promotions with optional filtering
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Array>}
   */
  async function getPromotions(filters = {}) {
    return fetchWithCache('promotions', async () => {
      // Simulate API call - in production, this would be an actual fetch
      if (!window.MockData || !window.MockData.promotions) {
        throw new Error('Mock data not available');
      }

      let promotions = [...window.MockData.promotions];

      // Apply filters
      if (filters.category && filters.category !== 'all') {
        promotions = promotions.filter(p => p.category === filters.category);
      }

      if (filters.search) {
        const query = filters.search.toLowerCase();
        promotions = promotions.filter(p =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
        );
      }

      if (filters.minViews) {
        promotions = promotions.filter(p => p.views >= filters.minViews);
      }

      if (filters.dealType) {
        promotions = promotions.filter(p => p.dealType === filters.dealType);
      }

      return promotions;
    }, {
      params: filters,
      ttl: CONFIG.CACHE_TTL.promotions
    });
  }

  /**
   * Fetch all categories
   * @returns {Promise<Array>}
   */
  async function getCategories() {
    return fetchWithCache('categories', async () => {
      if (!window.MockData || !window.MockData.categories) {
        throw new Error('Mock data not available');
      }

      return [...window.MockData.categories];
    }, {
      ttl: CONFIG.CACHE_TTL.categories
    });
  }

  /**
   * Fetch detailed data for a specific promotion
   * @param {string} promotionId - Promotion ID
   * @returns {Promise<Object>}
   */
  async function getPromotionDetail(promotionId) {
    return fetchWithCache('detail', async () => {
      if (!window.MockData || !window.MockData.promotions) {
        throw new Error('Mock data not available');
      }

      const promotion = window.MockData.promotions.find(p => p.id === promotionId);

      if (!promotion) {
        throw new Error(`Promotion ${promotionId} not found`);
      }

      // In production, this would fetch additional detail data
      // For now, we'll enhance the existing promotion data
      return {
        ...promotion,
        // Additional detail fields that might come from a separate endpoint
        description: promotion.description || `Detailed information about ${promotion.name}`,
        terms: promotion.terms || 'Standard terms and conditions apply.',
        validUntil: promotion.validUntil || '2025-12-31',
        targetAudience: promotion.targetAudience || 'All customers',
        redemptionLimit: promotion.redemptionLimit || null
      };
    }, {
      params: { id: promotionId },
      ttl: CONFIG.CACHE_TTL.detail
    });
  }

  /**
   * Fetch week-over-week comparison data
   * @param {string} dateRange - Date range identifier (e.g., 'week-47')
   * @returns {Promise<Object>}
   */
  async function getComparisonData(dateRange = 'week-47') {
    return fetchWithCache('comparison', async () => {
      if (!window.MockData || !window.MockData.comparisonData) {
        // If comparison data doesn't exist yet, return a default structure
        if (CONFIG.DEBUG) {
          console.warn('⚠️ DataService: Comparison data not available in MockData');
        }
        return {
          currentWeek: dateRange,
          previousWeek: 'week-46',
          metrics: {
            totalViews: { current: 0, previous: 0, change: 0 },
            totalClicks: { current: 0, previous: 0, change: 0 },
            avgCTR: { current: 0, previous: 0, change: 0 }
          }
        };
      }

      return window.MockData.comparisonData;
    }, {
      params: { range: dateRange },
      ttl: CONFIG.CACHE_TTL.comparison
    });
  }

  /**
   * Refresh specific cached endpoint
   * @param {string} endpoint - Endpoint to refresh
   * @param {Object} params - Request parameters
   * @returns {Promise<*>}
   */
  async function refresh(endpoint, params = {}) {
    const cacheKey = getCacheKey(endpoint, params);
    await CacheManager.remove(cacheKey);

    if (CONFIG.DEBUG) {
      console.log(`🔄 DataService: Refreshing ${endpoint}`);
    }

    // Re-fetch based on endpoint
    switch (endpoint) {
      case 'promotions':
        return getPromotions(params);
      case 'categories':
        return getCategories();
      case 'comparison':
        return getComparisonData(params.range);
      default:
        throw new Error(`Unknown endpoint: ${endpoint}`);
    }
  }

  /**
   * Refresh all cached data
   * @returns {Promise<void>}
   */
  async function refreshAll() {
    if (CONFIG.DEBUG) {
      console.log('🔄 DataService: Refreshing all cached data');
    }

    await CacheManager.clear();
    state.cacheHitCount = 0;
    state.cacheMissCount = 0;

    // Pre-fetch essential data
    await Promise.all([
      getCategories(),
      getPromotions()
    ]);

    if (CONFIG.DEBUG) {
      console.log('✅ DataService: All data refreshed');
    }
  }

  // ========================================
  // STATE & DIAGNOSTICS
  // ========================================

  /**
   * Get current service statistics
   * @returns {Promise<Object>}
   */
  async function getStats() {
    const cacheStats = await CacheManager.getStats();

    return {
      requests: {
        total: state.requestCount,
        cacheHits: state.cacheHitCount,
        cacheMisses: state.cacheMissCount,
        hitRate: state.requestCount > 0
          ? ((state.cacheHitCount / state.requestCount) * 100).toFixed(1) + '%'
          : '0%'
      },
      cache: cacheStats,
      lastError: state.lastError ? state.lastError.message : null,
      isLoading: state.isLoading
    };
  }

  /**
   * Reset service statistics
   */
  function resetStats() {
    state.requestCount = 0;
    state.cacheHitCount = 0;
    state.cacheMissCount = 0;
    state.lastError = null;

    if (CONFIG.DEBUG) {
      console.log('✅ DataService: Statistics reset');
    }
  }

  /**
   * Get loading state
   * @returns {boolean}
   */
  function isLoading() {
    return state.isLoading;
  }

  /**
   * Set loading state
   * @param {boolean} loading
   */
  function setLoading(loading) {
    state.isLoading = loading;
  }

  // ========================================
  // PUBLIC API
  // ========================================

  return {
    // Data fetching
    getPromotions,
    getCategories,
    getPromotionDetail,
    getComparisonData,

    // Cache management
    refresh,
    refreshAll,

    // State & diagnostics
    getStats,
    resetStats,
    isLoading,
    setLoading,

    // Expose config for testing
    config: CONFIG
  };
})();

// ========================================
// INITIALIZATION & DEBUG
// ========================================

// Expose to window for debugging
if (window.location.hostname === 'localhost') {
  window.__dataService = DataService;
  console.log('💡 Debug: Access DataService via window.__dataService');
}
