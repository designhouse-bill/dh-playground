/**
 * engagement-grain-config.js
 *
 * Single source of truth for the per-grain text + structural rules on
 * the engagement pages. Three grains: circular / category / promotion.
 *
 * In the Angular conversion this becomes either a grain-config service
 * or static input data on the EngagementPageComponent.
 *
 * Grain selected per page via body[data-grain="<key>"].
 */
(function () {
  'use strict';

  const GRAIN_CONFIG = {
    circular: {
      title: 'Circulars',
      question: "How is each store's circular performing this week?",
      cohortLabel: '27 circulars',
      counts: [
        { num: 27, label: 'circulars' },
        { num: 75, label: 'promotions' },
        { num: 8,  label: 'categories' },
      ],
      // Perf-tab strip metric panes that apply at this grain. Loader
      // removes any panes / strip items not in this list.
      panes: ['overview', 'sessions', 'users', 'duration', 'cardevents'],
    },
    category: {
      title: 'Categories',
      question: 'How are categories engaging users this week?',
      cohortLabel: '8 categories',
      counts: [
        { num: 8,  label: 'categories' },
        { num: 75, label: 'promotions' },
        { num: 27, label: 'stores' },
      ],
      panes: ['overview', 'sessions', 'users', 'duration', 'cardevents'],
    },
    promotion: {
      title: 'Promotions',
      question: 'How are promotions engaging users this week?',
      cohortLabel: '75 promotions',
      counts: [
        { num: 75, label: 'promotions' },
        { num: 8,  label: 'pages' },
        { num: 8,  label: 'categories' },
      ],
      // Promotion grain also has Coupon and Deal Type panes (those are
      // promotion-level attributes that don't apply at higher grains).
      panes: ['overview', 'sessions', 'users', 'duration', 'cardevents', 'coupon', 'dealtype'],
    },
  };

  function currentGrain() {
    return document.body.dataset.grain || null;
  }

  function configFor(grain) {
    return GRAIN_CONFIG[grain] || null;
  }

  window.EngagementGrain = {
    GRAIN_CONFIG,
    currentGrain,
    configFor,
  };
})();
