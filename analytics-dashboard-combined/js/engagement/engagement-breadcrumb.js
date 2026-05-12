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
  const GRAIN_PAGE = {
    circular: 'engagement-circulars.html',
    category: 'engagement-categories.html',
    promotion: 'engagement-promotions.html',
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
    crumbs.push('<span class="grain-breadcrumb__crumb grain-breadcrumb__crumb--current">' + GRAIN_LABEL[grain] + '</span>');

    const nav = document.createElement('nav');
    nav.className = 'grain-breadcrumb';
    nav.setAttribute('aria-label', 'Breadcrumb');
    nav.innerHTML = crumbs.join('');
    hero.parentNode.insertBefore(nav, hero);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
  document.addEventListener('engagement-shell:loaded', render);
})();
