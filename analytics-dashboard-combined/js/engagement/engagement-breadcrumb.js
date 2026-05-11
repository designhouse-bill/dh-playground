/**
 * engagement-breadcrumb.js — UX-846 Step 3
 *
 * Renders the cross-grain trail above the narrative-header when a drill
 * param is present in the URL.
 *
 *   ?store=<id>     on Categories  → "Engagement › Circulars: <store> › Categories"
 *   ?category=<id>  on Promotions  → "Engagement › Categories: <category> › Promotions"
 *
 * Drill source links keep ?pub & ?entity but strip the deeper drill key
 * so back-navigation lands one level up rather than re-drilling.
 *
 * No params → element stays hidden. Failing lookup → silently no-op.
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
    const host = document.querySelector('.narrative-header');
    if (!host) return;
    const params = new URLSearchParams(window.location.search);
    const grain = document.body.dataset.grain;

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
    if (!parentGrain) return;

    const nav = document.createElement('nav');
    nav.className = 'grain-breadcrumb';
    nav.setAttribute('aria-label', 'Breadcrumb');
    nav.innerHTML = [
      '<span class="grain-breadcrumb__crumb">Engagement</span>',
      '<span class="grain-breadcrumb__sep">›</span>',
      '<a class="grain-breadcrumb__crumb grain-breadcrumb__crumb--link" href="' + parentHref(parentGrain, window.location.search, dropKeys) + '">',
        GRAIN_LABEL[parentGrain] + (parentLabel ? ': ' + parentLabel : ''),
      '</a>',
      '<span class="grain-breadcrumb__sep">›</span>',
      '<span class="grain-breadcrumb__crumb grain-breadcrumb__crumb--current">' + GRAIN_LABEL[grain] + '</span>',
    ].join('');
    host.parentNode.insertBefore(nav, host);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
  document.addEventListener('engagement-shell:loaded', render);
})();
