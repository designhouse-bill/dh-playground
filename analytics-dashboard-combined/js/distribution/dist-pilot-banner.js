/* ============================================================
   ⚠ DEMO-ONLY · DO NOT PORT TO ANGULAR
   Distribution pilot-data overlay (UX-846, 2026-05-28)

   Sets expectations that distribution mock data covers Q1 2026
   pilot while engagement covers Nov 2025. Throwaway scaffolding
   — disappears once distribution shares the unified data layer
   (Phase 6 work).

   ── REMOVAL CHECKLIST (one grep wipes everything) ──
   1. `grep -rn "dist-pilot" analytics-dashboard-combined/`
   2. Delete this entire file.
   3. Delete the `.dist-pilot-banner*` block in css/distribution.css
      (search for "DEMO-ONLY · dist-pilot").
   4. Delete the `<div class="dist-pilot-banner" …>` markup +
      `<script src="…/dist-pilot-banner.js">` line in:
        - distribution-media.html
        - distribution-demographics.html
        - distribution-traffic.html
        - distribution-visitation.html
   5. No state, store, service, or Angular module references this.
      Removal is purely additive deletion. Zero runtime coupling.
   ============================================================ */
(function () {
  'use strict';

  const STORAGE_KEY = 'dist-pilot-shown';
  const AUTO_CLOSE_MS = 10000;
  const FADE_MS = 220;

  function init() {
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    const el = document.getElementById('dist-pilot-banner');
    if (!el) return;

    sessionStorage.setItem(STORAGE_KEY, '1');
    show(el);
  }

  function show(el) {
    el.hidden = false;
    el.classList.add('is-active');

    let closed = false;
    const closeOnce = () => {
      if (closed) return;
      closed = true;
      clearTimeout(autoCloseTimer);
      close(el);
    };

    const autoCloseTimer = setTimeout(closeOnce, AUTO_CLOSE_MS);

    // Backdrop click (target is overlay itself, not card)
    el.addEventListener('click', (e) => {
      if (e.target === el) closeOnce();
    });

    // X button
    const btn = el.querySelector('[data-action="dist-pilot-close"]');
    if (btn) btn.addEventListener('click', closeOnce);

    // Escape key
    const escHandler = (e) => {
      if (e.key === 'Escape') closeOnce();
    };
    document.addEventListener('keydown', escHandler);

    // Cleanup escHandler when closed
    el.addEventListener('transitionend', () => document.removeEventListener('keydown', escHandler), { once: true });
  }

  function close(el) {
    el.classList.add('is-closing');
    setTimeout(() => {
      el.classList.remove('is-active', 'is-closing');
      el.hidden = true;
    }, FADE_MS);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
