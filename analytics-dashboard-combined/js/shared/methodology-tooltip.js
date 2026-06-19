/**
 * Methodology Tooltip — shared, registry-driven info-icon + popover.
 * UX-846 #4 (Adam 2026-06-16). Generalizes the engagement metrics-key
 * tooltip (js/engagement/shared-filters.js) so any section header can attach
 * an "about this data" popover via a topic id. Click/tap to toggle, Esc or
 * outside-click to close, viewport-aware positioning.
 *
 * Markup:  inject MethodologyTooltip.buttonHTML('observed-visits') into a header
 * Boot:    MethodologyTooltip.init()  // idempotent, event-delegated
 *
 * Styles: css/methodology-tooltip.css
 *
 * NOTE: copy below is DRAFT/seed only. Final wording is authored by Max and
 * approved by Adam (UX-846 #4). Keep the keys; swap the strings.
 */
(function () {
  'use strict';

  // ── DRAFT methodology copy (seed) ──────────────────────────────────────────
  // Keyed by topic id. `content`/`why` accept inline HTML.
  var COPY = {
    'pulse-delivery': {
      title: 'Off-Platform Media Delivery',
      content: 'Impressions, clicks, and CTR are delivery metrics from Pulse, our off-platform media system. They measure how a creative was served and engaged with — not in-store outcomes.',
      why: '<strong>Why it matters:</strong> delivery shows reach and engagement. For shopper outcomes (attributed visits), see Observed Visits.'
    },
    'observed-visits': {
      title: 'Observed Visits & Frequency',
      content: 'Visits are panel-tracked observed visits — a representative sample, directional rather than a full census. Shoppers are grouped by 30-day visit frequency: New = 0 prior visits, Returning = 1–3, Loyal = 4+.',
      why: '<strong>Why it matters:</strong> the frequency mix shows whether media is driving new trial or deepening loyalty.'
    },
    'traffic-share': {
      title: 'Traffic Share',
      content: 'Weekly share of observed shopper visits across our stores vs. nearby competitors, from panel-tracked data (directional, not a census). Proximity is based on each store’s catchment rings.',
      why: '<strong>Why it matters:</strong> share shows competitive position over time — are we gaining or losing ground in-market?'
    },
    'greenberg-crossover': {
      title: 'Cross-Shopping',
      content: 'Where our media-exposed visitors also shop. Competitors are rolled up to the top few plus an “All Other” aggregate. Source: the Greenberg cross-shopping panel (directional sample).',
      why: '<strong>Why it matters:</strong> crossover reveals which competitors share our shoppers — and where to defend or win trips.'
    },
    'greenberg-demographics': {
      title: 'Observed Demographics',
      content: 'Demographic profile of attributed shoppers, sourced from the Greenberg panel. Reflects who was observed visiting after media exposure — a directional sample, not a census.',
      why: '<strong>Why it matters:</strong> knowing who responds helps target creative and offers to the right audience.'
    }
  };

  var initialized = false;

  // ── Public: info-button markup for a topic ─────────────────────────────────
  function buttonHTML(topicId) {
    var t = COPY[topicId];
    var aria = 'About this data' + (t ? ': ' + t.title : '');
    return '<button type="button" class="info-btn methodology-btn" ' +
      'data-methodology="' + topicId + '" aria-expanded="false" ' +
      'aria-label="' + aria + '">i</button>';
  }

  // ── Controller ─────────────────────────────────────────────────────────────
  function init() {
    if (initialized) return;
    initialized = true;
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKeydown);
    window.addEventListener('resize', closeAll, { passive: true });
    window.addEventListener('scroll', closeAll, { passive: true });
  }

  function onClick(e) {
    var btn = e.target.closest('.methodology-btn');
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      toggle(btn);
    } else if (!e.target.closest('.tooltip-overlay')) {
      closeAll();
    }
  }

  function onKeydown(e) {
    if (e.key === 'Escape') { closeAll(); return; }
    if ((e.key === 'Enter' || e.key === ' ') &&
        e.target.classList && e.target.classList.contains('methodology-btn')) {
      e.preventDefault();
      toggle(e.target);
    }
  }

  function toggle(btn) {
    var isOpen = btn.getAttribute('aria-expanded') === 'true';
    closeAll();
    if (!isOpen) open(btn);
  }

  function open(btn) {
    var overlay = createOverlay(btn.getAttribute('data-methodology'));
    if (!overlay) return;
    document.body.appendChild(overlay);
    position(btn, overlay);
    btn.setAttribute('aria-expanded', 'true');
    btn._mtOverlay = overlay;
    requestAnimationFrame(function () { overlay.classList.add('visible'); });
  }

  function createOverlay(topicId) {
    var t = COPY[topicId];
    if (!t) return null;
    var overlay = document.createElement('div');
    overlay.className = 'tooltip-overlay methodology-tooltip';
    overlay.setAttribute('role', 'tooltip');
    overlay.innerHTML =
      '<div class="tooltip-title">' + t.title + '</div>' +
      '<div class="tooltip-content">' + t.content + '</div>' +
      (t.why ? '<div class="tooltip-why-important">' + t.why + '</div>' : '');
    return overlay;
  }

  // Viewport-aware placement (below the button, flip above if no room).
  function position(btn, overlay) {
    var b = btn.getBoundingClientRect();
    var vw = window.innerWidth, vh = window.innerHeight;
    overlay.style.left = '0px';
    overlay.style.top = '0px';
    var o = overlay.getBoundingClientRect();
    var left, top;
    if (b.bottom + o.height + 10 <= vh) {
      top = b.bottom + 8;
      left = b.left + (b.width / 2) - 24;
    } else if (b.top - o.height - 10 >= 0) {
      top = b.top - o.height - 8;
      left = b.left + (b.width / 2) - 24;
      overlay.classList.add('position-top');
    } else {
      top = b.bottom + 8;
      left = b.left;
    }
    left = Math.max(10, Math.min(vw - o.width - 10, left));
    top = Math.max(10, Math.min(vh - o.height - 10, top));
    overlay.style.left = left + 'px';
    overlay.style.top = top + 'px';
  }

  function closeAll() {
    document.querySelectorAll('.tooltip-overlay.methodology-tooltip').forEach(function (overlay) {
      overlay.classList.remove('visible');
      setTimeout(function () { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 200);
    });
    document.querySelectorAll('.methodology-btn[aria-expanded="true"]').forEach(function (btn) {
      btn.setAttribute('aria-expanded', 'false');
      btn._mtOverlay = null;
    });
  }

  window.MethodologyTooltip = { init: init, buttonHTML: buttonHTML, COPY: COPY };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
