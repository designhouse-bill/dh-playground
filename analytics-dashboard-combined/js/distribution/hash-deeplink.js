/* ============================================================
   UX-846 D2 step 8 — KPI-cell deep-jump (distribution sub-tabs)

   index.html KPI cells link to <distribution-page>#<sub> so a click lands
   on the exact sub-tab, not just the page. The distribution pages drive
   their ep-sub-tabs via a click handler per page; this reader maps the URL
   hash to a data-dist-sub value and clicks the matching tab, reusing each
   page's own activation (including lazy-init like By Store's map build).

   Mirrors the engagement-report ?tab= handling in canonical-shell-tabs.js.
   Shared by all four distribution pages.
   ============================================================ */
(function () {
  'use strict';

  // Semantic hash (cell href) → internal data-dist-sub value.
  // Unmapped hashes fall through to a literal data-dist-sub match.
  var HASH_TO_SUB = {
    'by-competitor':    'competitor',
    'time-trend':       'trend',
    'by-store':         'store',
    'creative-library': 'creative',
    'current':          'current'
  };

  function activateFromHash() {
    var raw = (window.location.hash || '').replace(/^#/, '');
    if (!raw) return;
    var sub = HASH_TO_SUB[raw] || raw;
    // Order-independent: each page wires its sub-tab driver on its own schedule
    // (e.g. traffic does DOMContentLoaded -> setTimeout(initTabs) -> showSub('trend')),
    // so a single click can hit an unwired button or get reset by the default.
    // Poll briefly and re-assert the target until it sticks; only clicks while
    // off-target, so it self-quiets once the page settles.
    var tries = 0;
    (function attempt() {
      var active = document.querySelector('.ep-sub-tab--active');
      if (!active || active.dataset.distSub !== sub) {
        var btn = document.querySelector('.ep-sub-tab[data-dist-sub="' + sub + '"]');
        if (btn) btn.click();
      }
      if (tries++ < 20) setTimeout(attempt, 120);
    })();
  }

  // Kick off as soon as possible; the poll inside handles driver-wiring timing.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', activateFromHash);
  } else {
    activateFromHash();
  }
  // Support in-page hash changes (e.g. back/forward between cells).
  window.addEventListener('hashchange', activateFromHash);
})();
