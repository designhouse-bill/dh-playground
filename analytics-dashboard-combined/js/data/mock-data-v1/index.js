/**
 * MockData v1 — Phase 0 STUB
 *
 * Minimal stub to prove the data-driven render pattern. Returns hardcoded
 * aggregate payloads for two (entity, week) tuples so widget refresh can
 * be verified without the full aggregates.json being generated yet.
 *
 * Phase 1 replaces this stub with:
 *   - Real entity-hierarchy.js + weeks.js modules
 *   - Generated aggregates.json (13 weeks × 48 entity nodes)
 *   - Row-generator for Explore-page records
 *   - LRU cache, lazy-load, etc.
 *
 * Spec: ~/.claude/plans/UX-846/UX-846-DATA-LAYER-SCHEMA.md
 */

(function () {
  'use strict';

  // Stub aggregate payloads — Top Stores only (the only field Phase 0 widget needs).
  // Real aggregates.json will be MUCH larger; this is just enough to prove the wire.
  // Two weeks shown so we can switch and watch the panel re-render with different numbers.
  const stubAggregates = {
    'brand-ideal-foods:week-47': {
      entity: { id: 'brand-ideal-foods', name: 'Ideal Foods', level: 'brand', storeCount: 35 },
      week:   { id: 'week-47', num: 47, startDate: '2025-11-18', endDate: '2025-11-24', label: 'Week 47 (Nov 18–24)', daysRun: 7 },
      engagement: {
        topStores: [
          { id: 'store-2288', label: '#2288 Orlando',        value: 18200, deltaPct:  0.063, vca: { viewsProportion: 0.56, clicksProportion: 0.28, addsProportion: 0.16 }, href: 'engagement-explore-base.html?store=store-2288' },
          { id: 'store-2415', label: '#2415 Tampa',          value: 15300, deltaPct:  0.041, vca: { viewsProportion: 0.56, clicksProportion: 0.28, addsProportion: 0.16 }, href: 'engagement-explore-base.html?store=store-2415' },
          { id: 'store-2434', label: '#2434 Daytona Beach',  value: 12900, deltaPct:  0.022, vca: { viewsProportion: 0.57, clicksProportion: 0.28, addsProportion: 0.16 }, href: 'engagement-explore-base.html?store=store-2434' },
          { id: 'store-2480', label: '#2480 Lakeland',       value: 10500, deltaPct: -0.018, vca: { viewsProportion: 0.56, clicksProportion: 0.29, addsProportion: 0.16 }, href: 'engagement-explore-base.html?store=store-2480' },
          { id: 'store-705',  label: '#705 Haines City',     value:  8400, deltaPct:  0.012, vca: { viewsProportion: 0.56, clicksProportion: 0.29, addsProportion: 0.15 }, href: 'engagement-explore-base.html?store=store-705'  }
        ]
      }
    },
    'brand-ideal-foods:week-48': {
      entity: { id: 'brand-ideal-foods', name: 'Ideal Foods', level: 'brand', storeCount: 35 },
      week:   { id: 'week-48', num: 48, startDate: '2025-11-25', endDate: '2025-12-01', label: 'Week 48 (Nov 25–Dec 1)', daysRun: 7 },
      engagement: {
        topStores: [
          { id: 'store-2415', label: '#2415 Tampa',          value: 22100, deltaPct:  0.083, vca: { viewsProportion: 0.55, clicksProportion: 0.29, addsProportion: 0.16 }, href: 'engagement-explore-base.html?store=store-2415' },
          { id: 'store-2288', label: '#2288 Orlando',        value: 19400, deltaPct:  0.066, vca: { viewsProportion: 0.56, clicksProportion: 0.28, addsProportion: 0.16 }, href: 'engagement-explore-base.html?store=store-2288' },
          { id: 'store-336',  label: '#336 Hollywood',       value: 16800, deltaPct:  0.301, vca: { viewsProportion: 0.58, clicksProportion: 0.27, addsProportion: 0.15 }, href: 'engagement-explore-base.html?store=store-336'  },
          { id: 'store-518',  label: '#518 Naples',          value: 13200, deltaPct:  0.045, vca: { viewsProportion: 0.56, clicksProportion: 0.28, addsProportion: 0.16 }, href: 'engagement-explore-base.html?store=store-518'  },
          { id: 'store-2434', label: '#2434 Daytona Beach',  value: 11700, deltaPct: -0.093, vca: { viewsProportion: 0.57, clicksProportion: 0.28, addsProportion: 0.15 }, href: 'engagement-explore-base.html?store=store-2434' }
        ]
      }
    }
  };

  function getAggregate({ entityId, weekId } = {}) {
    const key = `${entityId || 'brand-ideal-foods'}:${weekId || 'week-47'}`;
    return stubAggregates[key] || stubAggregates['brand-ideal-foods:week-47'];
  }

  function currentContext() {
    const params = new URLSearchParams(window.location.search);
    return {
      entityId: params.get('entity') || 'brand-ideal-foods',
      weekId:   params.get('pub')    || 'week-47'
    };
  }

  window.MockData = window.MockData || {};
  window.MockData.v1 = {
    getAggregate,
    currentContext,
    _isStub: true,
    _stubKeys: Object.keys(stubAggregates)
  };
})();
