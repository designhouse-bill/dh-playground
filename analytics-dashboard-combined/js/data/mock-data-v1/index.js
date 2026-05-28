/**
 * MockData v1 — Public API (Phase 2)
 *
 * Replaces the Phase 0 stub. Exposes a single window-global entry point
 * for both engagement and distribution dashboards.
 *
 *   window.MockData.getAggregate({ entityId, weekId })
 *   window.MockData.getRecords({ entityId, weekId, grain, page, pageSize })
 *   window.MockData.getEntityTree()
 *   window.MockData.getWeeks()
 *   window.MockData.currentContext()           — URL → { entityId, weekId }
 *
 * Aggregate cache:
 *   - LRU, capacity 12
 *   - Keyed `entityId|weekId` (pipe — matches aggregates.json native key format)
 *   - aggregates.json lazy-loaded on first getAggregate() call
 *
 * PHASE-4 (UX-846): key delimiter fix. Previously index.js built lookup
 *   keys with ':' while aggregates.json shipped with '|', causing every
 *   Phase 3 consumer to fall back to _internal.loadAggregates(). Now
 *   aligned to '|' across the board. Consumers should no longer need
 *   the fallback path; we keep it for one release as a safety net.
 *
 * Compat shim:
 *   - window.MockData.v1 is preserved so the Phase 0 engagement-report.html
 *     consumer (calls window.MockData.v1.getAggregate / .currentContext)
 *     keeps working. v1.* delegates to the new top-level functions.
 *
 * Spec: ~/.claude/plans/UX-846/UX-846-DATA-LAYER-SCHEMA.md
 *
 * PHASE-2-ASSUMPTION: aggregates.json path is resolved relative to the
 *   HTML page that loaded this script. We use a hard-coded relative path
 *   "js/data/mock-data-v1/aggregates.json" — consistent with how the
 *   existing dashboards reference their data files.
 * PHASE-2-ASSUMPTION: Node-side consumers (build scripts) read aggregates.json
 *   directly via fs; this module is browser-first. A Node fallback is
 *   exposed via module.exports but does NOT fetch aggregates.json.
 */

(function (root) {
  'use strict';

  // ----- Aggregate cache (LRU, cap 12) -----
  const CACHE_CAP = 12;
  const cache = new Map(); // insertion order = recency

  function cacheGet(key) {
    if (!cache.has(key)) return undefined;
    const val = cache.get(key);
    cache.delete(key);
    cache.set(key, val); // bump to MRU
    return val;
  }
  function cacheSet(key, val) {
    if (cache.has(key)) cache.delete(key);
    cache.set(key, val);
    while (cache.size > CACHE_CAP) {
      const oldest = cache.keys().next().value;
      cache.delete(oldest);
    }
  }

  // ----- Aggregates JSON (lazy load) -----
  // PHASE-4: key delimiter unified to '|' (matches aggregates.json native keys).
  const KEY_DELIM = '|';
  let aggregatesIndex = null;     // map: "entityId|weekId" → Aggregate
  let aggregatesPromise = null;   // in-flight fetch
  const AGGREGATES_URL = 'js/data/mock-data-v1/aggregates.json';

  function loadAggregates() {
    if (aggregatesIndex) return Promise.resolve(aggregatesIndex);
    if (aggregatesPromise) return aggregatesPromise;
    if (typeof fetch !== 'function') {
      // Non-browser environment — surface an explicit error.
      return Promise.reject(new Error('MockData: fetch unavailable; aggregates.json cannot be loaded outside the browser.'));
    }
    aggregatesPromise = fetch(AGGREGATES_URL)
      .then(res => {
        if (!res.ok) throw new Error('MockData: failed to load ' + AGGREGATES_URL + ' (' + res.status + ')');
        return res.json();
      })
      .then(json => {
        // Phase 1 may have written either a flat map or an array; normalize to map.
        if (Array.isArray(json)) {
          const map = {};
          json.forEach(a => {
            const key = (a.entity && a.entity.id) + KEY_DELIM + (a.week && a.week.id);
            map[key] = a;
          });
          aggregatesIndex = map;
        } else if (json && json.aggregates && typeof json.aggregates === 'object') {
          aggregatesIndex = json.aggregates;
        } else {
          aggregatesIndex = json; // assume flat map (aggregates.json uses '|' keys)
        }
        return aggregatesIndex;
      })
      .catch(err => {
        aggregatesPromise = null; // allow retry
        throw err;
      });
    return aggregatesPromise;
  }

  // ----- getAggregate -----
  // Sync return when cache is warm or aggregates already loaded; otherwise returns
  // a Promise. Consumers that prefer always-async can `Promise.resolve(getAggregate(...))`.
  //
  // PHASE-2-ASSUMPTION: returning sync-or-promise mirrors how the Phase 0 stub
  //   returned sync; promoting to always-async would break engagement-report.html
  //   which calls `MockData.v1.getAggregate(...)` and uses the value immediately.
  //   The dashboard pre-warms by calling getAggregate during DOMContentLoaded.
  function getAggregate(opts) {
    const entityId = (opts && opts.entityId) || 'brand-ideal-foods';
    const weekId   = (opts && opts.weekId)   || 'week-47';
    const key = entityId + KEY_DELIM + weekId;

    const cached = cacheGet(key);
    if (cached) return cached;

    if (aggregatesIndex) {
      const val = aggregatesIndex[key] || null;
      if (val) cacheSet(key, val);
      return val;
    }

    return loadAggregates().then(idx => {
      const val = idx[key] || null;
      if (val) cacheSet(key, val);
      return val;
    });
  }

  // ----- getRecords (paginated, via row-generator) -----
  function getRecords(opts) {
    const entityId = opts && opts.entityId;
    const weekId   = opts && opts.weekId;
    const grain    = (opts && opts.grain) || 'promotion';
    const page     = (opts && opts.page) || 1;
    const pageSize = (opts && opts.pageSize) || 50;

    if (!entityId || !weekId) {
      return { records: [], page, pageSize, totalRecords: 0, totalPages: 0 };
    }

    const gen = root && root.MockDataRowGenerator;
    if (!gen) {
      throw new Error('MockData.getRecords: row-generator.js not loaded.');
    }

    let all;
    switch (grain) {
      case 'promotion': all = gen.generatePromotionRecords({ entityId, weekId }); break;
      case 'creative':  all = gen.generateCreativeRecords({ entityId, weekId });  break;
      case 'crossover': all = gen.generateCrossoverRecords({ entityId, weekId }); break;
      case 'store':
      case 'category':
        // PHASE-2-ASSUMPTION: store/category grains are aggregate-derived (not row-level
        //   generators). Consumers should read aggregate.engagement.topStores /
        //   topCategories. Returning empty record set with a hint.
        return { records: [], page, pageSize, totalRecords: 0, totalPages: 0, hint: 'derive from aggregate.engagement.top' + (grain === 'store' ? 'Stores' : 'Categories') };
      default:
        throw new Error('MockData.getRecords: unknown grain "' + grain + '"');
    }

    const totalRecords = all.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
    const start = (page - 1) * pageSize;
    const records = all.slice(start, start + pageSize);
    return { records, page, pageSize, totalRecords, totalPages };
  }

  // ----- getEntityTree / getWeeks -----
  function getEntityTree() {
    return (root && root.MockDataHierarchy) || null;
  }
  function getWeeks() {
    return (root && root.MockDataWeeks) || [];
  }

  // ----- currentContext (URL → { entityId, weekId }) -----
  function currentContext() {
    if (typeof window === 'undefined') {
      return { entityId: 'brand-ideal-foods', weekId: 'week-47' };
    }
    const params = new URLSearchParams(window.location.search);
    return {
      entityId: params.get('entity') || 'brand-ideal-foods',
      weekId:   params.get('pub')    || 'week-47'
    };
  }

  // ----- Public surface -----
  const MockData = {
    getAggregate,
    getRecords,
    getEntityTree,
    getWeeks,
    currentContext,
    // Diagnostics
    _internal: {
      loadAggregates,
      cache,
      get aggregatesLoaded() { return !!aggregatesIndex; }
    }
  };

  // Compat shim: preserve Phase 0 consumer pattern (window.MockData.v1.*)
  MockData.v1 = {
    getAggregate,
    currentContext,
    _isStub: false,
    _compatShim: true
  };

  if (root) {
    root.MockData = MockData;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = MockData;
  }
})(typeof window !== 'undefined' ? window : null);
