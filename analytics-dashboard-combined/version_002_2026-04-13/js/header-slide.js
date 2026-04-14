/**
 * header-slide.js — Scroll-aware header hide/reveal
 *
 * Translates DC2's HeaderSlideService (UX-803 branch) to vanilla JS.
 *
 * Behavior (matches DC2 content-header desktop collapse):
 *   • Scroll DOWN past threshold → header slides up off-screen, content fills the gap
 *   • Scroll UP                  → header slides back into view
 *   • 30px minimum scroll delta prevents jitter on direction changes
 *   • 400ms cooldown after each state change prevents layout-shift bounce
 *   • Always revealed on dashboard switch (called from app.js)
 */

(function () {
  'use strict';

  // ── Constants (mirrors HeaderSlideService) ────────────────────────────────
  var SCROLL_DELTA_THRESHOLD = 30;   // px — minimum delta before acting
  var COLLAPSE_COOLDOWN_MS   = 400;  // ms — ignore scroll events after state change

  // ── State ─────────────────────────────────────────────────────────────────
  var header              = null;
  var headerHeight        = 0;
  var lastScrollY         = 0;
  var collapsed           = false;
  var cooldownUntil       = 0;
  var scheduled           = false;   // rAF gate (replaces fastdom)

  // ── Helpers ───────────────────────────────────────────────────────────────

  function getScrollY() {
    return Math.max(0, window.scrollY || window.pageYOffset);
  }

  function measureHeaderHeight() {
    if (header) {
      headerHeight = header.offsetHeight;
      header.style.setProperty('--header-height', headerHeight + 'px');
    }
  }

  function collapse() {
    if (collapsed) return;
    collapsed = true;
    header.classList.add('header--scrolled-away');
    cooldownUntil = Date.now() + COLLAPSE_COOLDOWN_MS;
  }

  function reveal() {
    if (!collapsed) return;
    collapsed = false;
    header.classList.remove('header--scrolled-away');
    cooldownUntil = Date.now() + COLLAPSE_COOLDOWN_MS;
  }

  // ── Core scroll processor (mirrors processContentHeaderScroll) ────────────

  function processScroll() {
    scheduled = false;
    if (!header) return;

    var currentY = getScrollY();

    // During cooldown: passively track position, don't toggle
    if (Date.now() < cooldownUntil) {
      lastScrollY = currentY;
      return;
    }

    var delta = currentY - lastScrollY;

    // Require minimum scroll delta to avoid jitter on micro-movements
    if (Math.abs(delta) < SCROLL_DELTA_THRESHOLD) return;

    var scrollingDown  = delta > 0;
    var pastThreshold  = currentY > headerHeight;

    if (scrollingDown && pastThreshold && !collapsed) {
      collapse();
    } else if (!scrollingDown && collapsed) {
      reveal();
    }

    lastScrollY = currentY;
  }

  function onScroll() {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(processScroll);
    }
  }

  // ── Public API (used by app.js on dashboard switch) ───────────────────────

  window.HeaderSlide = {
    /** Force-reveal the header (call when switching dashboards). */
    revealHeader: function () {
      reveal();
      lastScrollY = getScrollY();
      cooldownUntil = 0;
    }
  };

  // ── Init ──────────────────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', function () {
    header = document.querySelector('header.header');
    if (!header) return;

    measureHeaderHeight();

    // Keep --header-height in sync if the header resizes (e.g. context-row toggled)
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(function () {
        measureHeaderHeight();
      }).observe(header);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  });

})();
