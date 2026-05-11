/**
 * engagement-grain-init.js
 *
 * Reads body[data-grain] + grain config and applies grain-specific
 * adjustments to the existing DOM:
 *
 *   - Sets hero-stat title + question text.
 *   - Renders the entity counts row.
 *   - Sets the cohort note count.
 *   - Removes perf-tab strip items + perf-tab-panes that don't apply
 *     at this grain (e.g. Coupon / Deal Type only on promotion grain).
 *
 * Maps to Angular: the EngagementPageComponent reads @Input() grain,
 * binds text via interpolation, and uses *ngIf on grain-specific panes.
 *
 * Depends on engagement-grain-config.js (loaded earlier).
 */
(function () {
  'use strict';

  function applyHeroText(cfg) {
    const titleEl = document.getElementById('ep-hero-title');
    if (titleEl) titleEl.textContent = cfg.title;
    const qEl = document.getElementById('ep-hero-question');
    if (qEl) qEl.textContent = cfg.question;
  }

  function applyCounts(cfg) {
    const counts = document.querySelector('.narrative-header .ep-circular-info');
    if (!counts || !Array.isArray(cfg.counts)) return;
    const html = cfg.counts.map((c, i) => {
      const item = '<span class="ep-circular-info__item"><span class="ep-circular-info__num">'
        + c.num + '</span> ' + c.label + '</span>';
      const sep = i < cfg.counts.length - 1
        ? '<span class="ep-circular-info__sep">·</span>'
        : '';
      return item + sep;
    }).join('');
    counts.innerHTML = html;
  }

  function applyCohort(cfg) {
    const cohortCount = document.querySelector('.ep-cohort-note .ep-cohort-note__count');
    if (cohortCount) cohortCount.textContent = cfg.cohortLabel;
  }

  // Remove perf-tab strip items + perf-tab-panes that aren't in the
  // grain's pane list. Other JS expects this filtering to happen BEFORE
  // it queries the DOM, so call this early in the boot sequence.
  function filterPanes(cfg) {
    const keep = new Set(cfg.panes);
    // Strip items.
    document.querySelectorAll('.perf-tabs .perf-tab[data-ep-tab]').forEach((tab) => {
      if (!keep.has(tab.dataset.epTab)) tab.remove();
    });
    // Mobile select options (if any).
    document.querySelectorAll('#ep-section-select option').forEach((opt) => {
      if (opt.value && !keep.has(opt.value)) opt.remove();
    });
    // Panes themselves.
    document.querySelectorAll('.perf-tab-pane[data-ep-pane]').forEach((pane) => {
      if (!keep.has(pane.dataset.epPane)) pane.remove();
    });
  }

  function init() {
    const grain = window.EngagementGrain?.currentGrain?.();
    if (!grain) return;
    const cfg = window.EngagementGrain?.configFor?.(grain);
    if (!cfg) return;
    filterPanes(cfg);
    applyHeroText(cfg);
    applyCounts(cfg);
    applyCohort(cfg);
    document.dispatchEvent(new CustomEvent('engagement-grain:applied', { detail: { grain } }));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
