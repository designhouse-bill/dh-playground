/**
 * CACHE MANAGER - IndexedDB Caching Layer
 * v6-production Analytics Dashboard
 *
 * Provides persistent client-side caching for analytics data using IndexedDB.
 * Implements TTL (time-to-live) strategy, quota management, and graceful fallbacks.
 *
 * Features:
 * - IndexedDB persistent storage
 * - Configurable TTL per cache entry
 * - Automatic stale data cleanup
 * - Quota exceeded error handling
 * - Browser compatibility detection
 * - Debug logging for localhost
 */

const CacheManager = (() => {
  'use strict';

  // ========================================
  // CONFIGURATION
  // ========================================

  const CONFIG = {
    DB_NAME: 'v6_analytics_cache',
    DB_VERSION: 1,
    STORE_NAME: 'analytics_data',
    DEFAULT_TTL: 1000 * 60 * 15, // 15 minutes default
    MAX_CACHE_SIZE: 50 * 1024 * 1024, // 50MB soft limit
    DEBUG: window.location.hostname === 'localhost'
  };

  // ========================================
  // STATE
  // ========================================

  let db = null;
  let isSupported = false;
  let initializationPromise = null;

  // ========================================
  // INITIALIZATION
  // ========================================

  /**
   * Check if IndexedDB is supported in current browser
   * @returns {boolean}
   */
  function checkSupport() {
    try {
      return 'indexedDB' in window && window.indexedDB !== null;
    } catch (e) {
      if (CONFIG.DEBUG) {
        console.warn('IndexedDB not supported:', e);
      }
      return false;
    }
  }

  /**
   * Initialize IndexedDB connection and object store
   * @returns {Promise<IDBDatabase>}
   */
  function initDB() {
    if (initializationPromise) {
      return initializationPromise;
    }

    isSupported = checkSupport();

    if (!isSupported) {
      if (CONFIG.DEBUG) {
        console.warn('⚠️ CacheManager: IndexedDB not supported, caching disabled');
      }
      return Promise.resolve(null);
    }

    initializationPromise = new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(CONFIG.DB_NAME, CONFIG.DB_VERSION);

        request.onerror = () => {
          if (CONFIG.DEBUG) {
            console.error('❌ CacheManager: Failed to open database', request.error);
          }
          reject(request.error);
        };

        request.onsuccess = () => {
          db = request.result;
          if (CONFIG.DEBUG) {
            console.log('✅ CacheManager: Database initialized');
          }
          resolve(db);
        };

        request.onupgradeneeded = (event) => {
          const database = event.target.result;

          // Create object store if it doesn't exist
          if (!database.objectStoreNames.contains(CONFIG.STORE_NAME)) {
            const objectStore = database.createObjectStore(CONFIG.STORE_NAME, {
              keyPath: 'key'
            });

            // Create index on timestamp for cleanup operations
            objectStore.createIndex('timestamp', 'timestamp', { unique: false });
            objectStore.createIndex('expiresAt', 'expiresAt', { unique: false });

            if (CONFIG.DEBUG) {
              console.log('✅ CacheManager: Object store created');
            }
          }
        };
      } catch (error) {
        if (CONFIG.DEBUG) {
          console.error('❌ CacheManager: Initialization error', error);
        }
        reject(error);
      }
    });

    return initializationPromise;
  }

  // ========================================
  // CORE CACHE OPERATIONS
  // ========================================

  /**
   * Store data in cache with TTL
   * @param {string} key - Cache key
   * @param {*} data - Data to cache
   * @param {number} ttl - Time to live in milliseconds (optional)
   * @returns {Promise<boolean>}
   */
  async function set(key, data, ttl = CONFIG.DEFAULT_TTL) {
    if (!isSupported || !db) {
      await initDB();
      if (!db) return false;
    }

    try {
      const transaction = db.transaction([CONFIG.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(CONFIG.STORE_NAME);

      const cacheEntry = {
        key: key,
        data: data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl,
        ttl: ttl
      };

      const request = store.put(cacheEntry);

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          if (CONFIG.DEBUG) {
            console.log(`✅ CacheManager: Cached "${key}" (TTL: ${ttl}ms)`);
          }
          resolve(true);
        };

        request.onerror = () => {
          // Handle quota exceeded error
          if (request.error.name === 'QuotaExceededError') {
            if (CONFIG.DEBUG) {
              console.warn('⚠️ CacheManager: Quota exceeded, clearing old entries');
            }
            clearExpired().then(() => {
              // Retry after clearing
              set(key, data, ttl).then(resolve).catch(reject);
            });
          } else {
            if (CONFIG.DEBUG) {
              console.error(`❌ CacheManager: Failed to cache "${key}"`, request.error);
            }
            reject(request.error);
          }
        };
      });
    } catch (error) {
      if (CONFIG.DEBUG) {
        console.error(`❌ CacheManager: Error setting "${key}"`, error);
      }
      return false;
    }
  }

  /**
   * Retrieve data from cache if not expired
   * @param {string} key - Cache key
   * @returns {Promise<*|null>}
   */
  async function get(key) {
    if (!isSupported || !db) {
      await initDB();
      if (!db) return null;
    }

    try {
      const transaction = db.transaction([CONFIG.STORE_NAME], 'readonly');
      const store = transaction.objectStore(CONFIG.STORE_NAME);
      const request = store.get(key);

      return new Promise((resolve) => {
        request.onsuccess = () => {
          const entry = request.result;

          if (!entry) {
            if (CONFIG.DEBUG) {
              console.log(`⚠️ CacheManager: Cache miss for "${key}"`);
            }
            resolve(null);
            return;
          }

          // Check if expired
          if (Date.now() > entry.expiresAt) {
            if (CONFIG.DEBUG) {
              console.log(`⚠️ CacheManager: Cache expired for "${key}"`);
            }
            // Remove expired entry
            remove(key);
            resolve(null);
            return;
          }

          if (CONFIG.DEBUG) {
            const age = Date.now() - entry.timestamp;
            console.log(`✅ CacheManager: Cache hit for "${key}" (age: ${age}ms)`);
          }

          resolve(entry.data);
        };

        request.onerror = () => {
          if (CONFIG.DEBUG) {
            console.error(`❌ CacheManager: Error getting "${key}"`, request.error);
          }
          resolve(null);
        };
      });
    } catch (error) {
      if (CONFIG.DEBUG) {
        console.error(`❌ CacheManager: Error getting "${key}"`, error);
      }
      return null;
    }
  }

  /**
   * Remove specific cache entry
   * @param {string} key - Cache key
   * @returns {Promise<boolean>}
   */
  async function remove(key) {
    if (!isSupported || !db) {
      await initDB();
      if (!db) return false;
    }

    try {
      const transaction = db.transaction([CONFIG.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(CONFIG.STORE_NAME);
      const request = store.delete(key);

      return new Promise((resolve) => {
        request.onsuccess = () => {
          if (CONFIG.DEBUG) {
            console.log(`✅ CacheManager: Removed "${key}"`);
          }
          resolve(true);
        };

        request.onerror = () => {
          if (CONFIG.DEBUG) {
            console.error(`❌ CacheManager: Error removing "${key}"`, request.error);
          }
          resolve(false);
        };
      });
    } catch (error) {
      if (CONFIG.DEBUG) {
        console.error(`❌ CacheManager: Error removing "${key}"`, error);
      }
      return false;
    }
  }

  /**
   * Clear all cache entries
   * @returns {Promise<boolean>}
   */
  async function clear() {
    if (!isSupported || !db) {
      await initDB();
      if (!db) return false;
    }

    try {
      const transaction = db.transaction([CONFIG.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(CONFIG.STORE_NAME);
      const request = store.clear();

      return new Promise((resolve) => {
        request.onsuccess = () => {
          if (CONFIG.DEBUG) {
            console.log('✅ CacheManager: All cache cleared');
          }
          resolve(true);
        };

        request.onerror = () => {
          if (CONFIG.DEBUG) {
            console.error('❌ CacheManager: Error clearing cache', request.error);
          }
          resolve(false);
        };
      });
    } catch (error) {
      if (CONFIG.DEBUG) {
        console.error('❌ CacheManager: Error clearing cache', error);
      }
      return false;
    }
  }

  /**
   * Clear only expired cache entries
   * @returns {Promise<number>} Number of entries removed
   */
  async function clearExpired() {
    if (!isSupported || !db) {
      await initDB();
      if (!db) return 0;
    }

    try {
      const transaction = db.transaction([CONFIG.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(CONFIG.STORE_NAME);
      const index = store.index('expiresAt');
      const now = Date.now();

      // Get all entries that have expired
      const range = IDBKeyRange.upperBound(now);
      const request = index.openCursor(range);

      let removedCount = 0;

      return new Promise((resolve) => {
        request.onsuccess = (event) => {
          const cursor = event.target.result;

          if (cursor) {
            cursor.delete();
            removedCount++;
            cursor.continue();
          } else {
            if (CONFIG.DEBUG && removedCount > 0) {
              console.log(`✅ CacheManager: Cleared ${removedCount} expired entries`);
            }
            resolve(removedCount);
          }
        };

        request.onerror = () => {
          if (CONFIG.DEBUG) {
            console.error('❌ CacheManager: Error clearing expired entries', request.error);
          }
          resolve(0);
        };
      });
    } catch (error) {
      if (CONFIG.DEBUG) {
        console.error('❌ CacheManager: Error clearing expired entries', error);
      }
      return 0;
    }
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  /**
   * Get cache statistics
   * @returns {Promise<Object>}
   */
  async function getStats() {
    if (!isSupported || !db) {
      await initDB();
      if (!db) {
        return {
          supported: false,
          totalEntries: 0,
          expiredEntries: 0
        };
      }
    }

    try {
      const transaction = db.transaction([CONFIG.STORE_NAME], 'readonly');
      const store = transaction.objectStore(CONFIG.STORE_NAME);
      const countRequest = store.count();

      return new Promise((resolve) => {
        countRequest.onsuccess = async () => {
          const totalEntries = countRequest.result;

          // Count expired entries
          const expiredTransaction = db.transaction([CONFIG.STORE_NAME], 'readonly');
          const expiredStore = expiredTransaction.objectStore(CONFIG.STORE_NAME);
          const expiredIndex = expiredStore.index('expiresAt');
          const now = Date.now();
          const range = IDBKeyRange.upperBound(now);
          const expiredRequest = expiredIndex.count(range);

          expiredRequest.onsuccess = () => {
            resolve({
              supported: true,
              totalEntries: totalEntries,
              expiredEntries: expiredRequest.result,
              validEntries: totalEntries - expiredRequest.result
            });
          };

          expiredRequest.onerror = () => {
            resolve({
              supported: true,
              totalEntries: totalEntries,
              expiredEntries: 0,
              validEntries: totalEntries
            });
          };
        };

        countRequest.onerror = () => {
          resolve({
            supported: true,
            totalEntries: 0,
            expiredEntries: 0,
            validEntries: 0
          });
        };
      });
    } catch (error) {
      if (CONFIG.DEBUG) {
        console.error('❌ CacheManager: Error getting stats', error);
      }
      return {
        supported: false,
        totalEntries: 0,
        expiredEntries: 0,
        validEntries: 0
      };
    }
  }

  /**
   * Check if a specific key exists and is valid (not expired)
   * @param {string} key - Cache key
   * @returns {Promise<boolean>}
   */
  async function has(key) {
    const data = await get(key);
    return data !== null;
  }

  // ========================================
  // PUBLIC API
  // ========================================

  return {
    init: initDB,
    set: set,
    get: get,
    remove: remove,
    clear: clear,
    clearExpired: clearExpired,
    has: has,
    getStats: getStats,
    isSupported: () => isSupported
  };
})();

// ========================================
// AUTO-INITIALIZATION
// ========================================

// Initialize on script load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    CacheManager.init().catch(err => {
      console.error('CacheManager initialization failed:', err);
    });
  });
} else {
  CacheManager.init().catch(err => {
    console.error('CacheManager initialization failed:', err);
  });
}

// Periodic cleanup of expired entries (every 5 minutes)
setInterval(() => {
  CacheManager.clearExpired();
}, 1000 * 60 * 5);

// Expose to window for debugging
if (window.location.hostname === 'localhost') {
  window.__cacheManager = CacheManager;
}
