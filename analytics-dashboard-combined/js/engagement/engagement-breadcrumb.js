/**
 * engagement-breadcrumb.js — UX-846 (revised 2026-05-12)
 *
 * Renders the cross-grain trail ABOVE the hero-stat (sibling, not inside),
 * on every Overview page. Trail always carries the base path; drill params
 * insert the parent entity hop.
 *
 *   No drill:                "Engagement › Overviews › <Grain>"
 *   ?store=<id>   on cats    "Engagement › Overviews › Circulars: <store> › Categories"
 *   ?category=<id> on promos "Engagement › Overviews › Categories: <category> › Promotions"
 *
 * Drill source links keep ?pub & ?entity but strip the deeper drill key
 * so back-navigation lands one level up rather than re-drilling.
 *
 * Angular mapping: Breadcrumb component reading ActivatedRoute.queryParamMap.
 */
(function () {
  'use strict';

  const GRAIN_LABEL = {
    circular: 'Circulars',
    category: 'Categories',
    promotion: 'Promotions',
  };

  // Active perf-tab → display label for the trailing crumb.
  const TAB_LABEL = {
    overview:    'Overview',
    sessions:    'Sessions',
    users:       'Total Users',
    duration:    'Duration',
    cardevents:  'Card Events',
    dealtype:    'Deal Types',
    coupon:      'Coupons',
  };
  // UX-846 Report mode 2026-05-12: 3 slice pages collapsed to single Report.
  const GRAIN_PAGE = {
    circular: 'engagement-report.html',
    category: 'engagement-report.html',
    promotion: 'engagement-report.html',
  };

  function lookupName(kind, id) {
    if (!window.MockData) return null;
    if (kind === 'store') return window.MockData.getStoreById?.(id)?.name || id;
    if (kind === 'category') return window.MockData.getCategoryById?.(id)?.name || id;
    return id;
  }

  // Strip drill-only keys; keep ?pub & ?entity so parent link preserves context.
  function parentHref(parentGrain, currentSearch, dropKeys) {
    const params = new URLSearchParams(currentSearch);
    dropKeys.forEach((k) => params.delete(k));
    const qs = params.toString();
    return GRAIN_PAGE[parentGrain] + (qs ? '?' + qs : '');
  }

  function render() {
    const hero = document.querySelector('.hero-stat');
    if (!hero || !hero.parentNode) return;
    const params = new URLSearchParams(window.location.search);
    const grain = document.body.dataset.grain;
    if (!grain) return;

    let parentGrain = null;
    let parentLabel = null;
    let dropKeys = [];

    if (grain === 'category' && params.has('store')) {
      parentGrain = 'circular';
      parentLabel = lookupName('store', params.get('store'));
      dropKeys = ['store'];
    } else if (grain === 'promotion' && params.has('category')) {
      parentGrain = 'category';
      parentLabel = lookupName('category', params.get('category'));
      dropKeys = ['category'];
    }

    // Remove any prior render so re-runs stay idempotent.
    const prior = document.querySelector('.grain-breadcrumb');
    if (prior) prior.remove();

    const activeTab = document.querySelector('#ep-perf-tabs .perf-tab.active')?.dataset?.epTab;
    const tabLabel = activeTab && activeTab !== 'overview' ? TAB_LABEL[activeTab] : null;

    const sep = '<span class="grain-breadcrumb__sep">›</span>';
    const crumbs = [
      '<span class="grain-breadcrumb__crumb">Engagement</span>',
      sep,
      '<span class="grain-breadcrumb__crumb">Overviews</span>',
      sep,
    ];
    if (parentGrain) {
      crumbs.push(
        '<a class="grain-breadcrumb__crumb grain-breadcrumb__crumb--link" href="' + parentHref(parentGrain, window.location.search, dropKeys) + '">' +
          GRAIN_LABEL[parentGrain] + (parentLabel ? ': ' + parentLabel : '') +
        '</a>',
        sep,
      );
    }
    // Grain crumb is current only when no perf-tab leaf is appended.
    if (tabLabel) {
      crumbs.push(
        '<span class="grain-breadcrumb__crumb">' + GRAIN_LABEL[grain] + '</span>',
        sep,
        '<span class="grain-breadcrumb__crumb grain-breadcrumb__crumb--current">' + tabLabel + '</span>',
      );
    } else {
      crumbs.push('<span class="grain-breadcrumb__crumb grain-breadcrumb__crumb--current">' + GRAIN_LABEL[grain] + '</span>');
    }

    const nav = document.createElement('nav');
    nav.className = 'grain-breadcrumb';
    nav.setAttribute('aria-label', 'Breadcrumb');
    nav.innerHTML = crumbs.join('');
    hero.parentNode.insertBefore(nav, hero);
  }

  function boot() {
    render();
    // Re-render after perf-tab clicks so the trailing crumb tracks the
    // active metric. Delegated on document because each page wires its
    // own tab click handler (canonical-shell-tabs.js for cats/circs,
    // inline IIFE on promotions) — both paths share the .perf-tab class.
    document.addEventListener('click', function (e) {
      const tab = e.target.closest && e.target.closest('#ep-perf-tabs .perf-tab[data-ep-tab]');
      if (!tab) return;
      // Wait one frame so the handler that toggles .active runs first.
      requestAnimationFrame(render);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
  document.addEventListener('engagement-shell:loaded', render);
})();
