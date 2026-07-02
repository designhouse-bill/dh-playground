/* methodology-popover init — the registry + controller slice of
   js/shared/methodology-tooltip.js (proto-2.0-baseline), rebuilt on REAL
   PrimeNG Popover DOM (.p-popover > .p-popover-content, vendor/aura.css
   chrome) per PrimeNG-first. Same public contract: click/Enter/Space
   toggle, Esc + outside-click close, resize/scroll close, viewport-aware
   flip (.p-popover-flipped), aria-expanded on the .info-btn trigger.
   Mirrors dh-methodology-popover (p-popover) in the Angular twin.
   COPY = DRAFT/seed only — final wording Max-authored, Adam-approved
   (UX-846 #4). Keep the keys; swap the strings. */
(function () {
  'use strict';

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

  var ARROW_OFFSET = 20; /* --p-popover-arrow-offset (1.25rem) */
  var initialized = false;

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
    } else if (!e.target.closest('.p-popover')) {
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
    overlay.classList.add('p-popover-enter-from', 'p-popover-enter-active');
    requestAnimationFrame(function () {
      overlay.classList.remove('p-popover-enter-from');
      setTimeout(function () { overlay.classList.remove('p-popover-enter-active'); }, 150);
    });
  }

  /* Real PrimeNG Popover DOM: root + content wrapper; arrow = aura ::before/::after. */
  function createOverlay(topicId) {
    var t = COPY[topicId];
    if (!t) return null;
    var overlay = document.createElement('div');
    overlay.className = 'p-popover p-component methodology-popover';
    overlay.setAttribute('role', 'dialog');
    overlay.innerHTML =
      '<div class="p-popover-content">' +
        '<div class="tooltip-title">' + t.title + '</div>' +
        '<div class="tooltip-content">' + t.content + '</div>' +
        (t.why ? '<div class="tooltip-why-important">' + t.why + '</div>' : '') +
      '</div>';
    return overlay;
  }

  /* PrimeNG-style absolute placement: align to target left, flip above
     when no room below (.p-popover-flipped), arrow tracks the trigger
     via --p-popover-arrow-left. Aura's gutter margin supplies the gap. */
  function position(btn, overlay) {
    var b = btn.getBoundingClientRect();
    var vw = document.documentElement.clientWidth;
    var vh = document.documentElement.clientHeight;
    overlay.style.position = 'absolute';
    overlay.style.left = '0px';
    overlay.style.top = '0px';
    var o = overlay.getBoundingClientRect();
    var left = Math.max(10, Math.min(vw - o.width - 10, b.left));
    var flip = b.bottom + o.height + 20 > vh && b.top - o.height - 20 >= 0;
    var top = flip ? b.top - o.height - 10 : b.bottom;
    overlay.classList.toggle('p-popover-flipped', flip);
    overlay.style.left = (left + window.scrollX) + 'px';
    overlay.style.top = (top + window.scrollY) + 'px';
    overlay.style.setProperty('--p-popover-arrow-left',
      ((b.left + b.width / 2) - left - ARROW_OFFSET) + 'px');
  }

  function closeAll() {
    document.querySelectorAll('.p-popover.methodology-popover').forEach(function (overlay) {
      overlay.classList.add('p-popover-leave-active', 'p-popover-leave-to');
      setTimeout(function () { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 100);
    });
    document.querySelectorAll('.methodology-btn[aria-expanded="true"]').forEach(function (btn) {
      btn.setAttribute('aria-expanded', 'false');
    });
  }

  window.DistMethodologyPopover = { init: init, COPY: COPY };
})();
