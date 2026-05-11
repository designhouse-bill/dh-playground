/**
 * engagement-grain-switcher.js
 *
 * Active-state wiring for the header grain switcher
 * (Circulars | Categories | Promotions).
 *
 * Reads body[data-grain] and applies `.active` to the matching
 * <a data-grain-link="..."> anchor inside .grain-switcher.
 *
 * Re-runs on `engagement-shell:loaded` because circulars page injects
 * the switcher via partials/engagement-tabs-shell.html after DCL.
 *
 * Angular mapping: GrainSwitcherComponent + routerLinkActive.
 */
(function () {
  'use strict';

  function preserveSearch(anchor) {
    var base = anchor.dataset.grainHref || anchor.getAttribute('href');
    if (!anchor.dataset.grainHref) anchor.dataset.grainHref = base;
    var search = window.location.search;
    anchor.setAttribute('href', search ? base + search : base);
  }

  function applyActive() {
    var grain = document.body.dataset.grain;
    var anchors = document.querySelectorAll('.grain-switcher [data-grain-link]');
    anchors.forEach(function (a) {
      preserveSearch(a);
      if (grain) a.classList.toggle('active', a.dataset.grainLink === grain);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyActive);
  } else {
    applyActive();
  }
  document.addEventListener('engagement-shell:loaded', applyActive);
  // Re-sync after a modal commit pushes new params to the URL.
  document.addEventListener('engagement-url:updated', applyActive);
})();
