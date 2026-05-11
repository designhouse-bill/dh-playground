/**
 * engagement-drill.js — UX-846 Step 3
 *
 * Cross-grain row-click drilldown.
 *
 *   Circulars  ──[store row drill]──►  Categories  (?store=<id>)
 *   Categories ──[category row drill]─► Promotions (?category=<id>)
 *   Promotions = terminal grain (no drill out)
 *
 * Markup contract — drill button per row:
 *   <button class="drill-btn" data-drill-to="category|promotion"
 *           data-drill-id="<entityId>" data-drill-name="<label>">→</button>
 *
 * Delegated click resolves the target grain's page + filter key, then
 * navigates with the current ?pub & ?entity search params preserved
 * (so Step 4 context survives the drill).
 *
 * Angular mapping: replaces with router.navigate(['/engagement/<target>'],
 * { queryParams: { ...current, [key]: id }, queryParamsHandling: 'merge' }).
 */
(function () {
  'use strict';

  const DRILL_TARGETS = {
    category: { page: 'engagement-categories.html', paramKey: 'store',    parentGrain: 'circular' },
    promotion: { page: 'engagement-promotions.html', paramKey: 'category', parentGrain: 'category' },
  };

  function onClick(event) {
    const btn = event.target.closest('[data-drill-to]');
    if (!btn) return;
    const target = DRILL_TARGETS[btn.dataset.drillTo];
    const id = btn.dataset.drillId;
    if (!target || !id) return;

    event.preventDefault();
    event.stopPropagation();

    const url = new URL(target.page, window.location.href);
    const current = new URLSearchParams(window.location.search);
    current.forEach((v, k) => url.searchParams.set(k, v));
    url.searchParams.set(target.paramKey, id);
    window.location.assign(url.toString());
  }

  document.addEventListener('click', onClick);
})();
