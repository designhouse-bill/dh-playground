// UX-846 β-3 — Sub-pane summary headers (hybrid A+B).
//
// In Standard mode each .ep-sub-pane (rendered as a card) gets a header
// injected at the top: title pulled from the matching sub-tab label, plus
// a one-line "top finding" sentence. The existing viz stays below in
// condensed form (CSS truncates by-store list to top 5).
//
// Findings are synthetic placeholders for the MVP. A future pass reads
// the same data source the sub-pane renderers use to compute real
// extrema.

(function () {
  'use strict';

  // MVP synthetic findings keyed by data-ep-pane + data-ep-sub-pane.
  // Real data wiring later — for now these prove the pattern.
  const FINDINGS = {
    sessions: {
      store: { stat: 'Acme #1234',  detail: '28% of sessions · ▲21% wow' },
      day:   { stat: 'Saturday',    detail: '▲35% above weekly avg' },
      trend: { stat: '▲18% in 13w', detail: 'current 12.4K · trending up' },
    },
    users: {
      store: { stat: 'Acme #1234',  detail: '24% of users · ▲14% wow' },
      day:   { stat: 'Friday',      detail: '▲28% above weekly avg' },
      trend: { stat: '▲9% in 13w',  detail: 'current 9.1K · steady climb' },
    },
    duration: {
      store: { stat: 'Acme #2099',  detail: '3:42 avg · 18% above brand' },
      day:   { stat: 'Sunday',      detail: 'longest avg session (4:12)' },
      trend: { stat: 'Stable',      detail: '13w range 3:10–3:55' },
    },
    cardevents: {
      store: { stat: 'Acme #1234',  detail: '31% of card events · ▲24% wow' },
      day:   { stat: 'Saturday',    detail: 'peak 9.4K events' },
      trend: { stat: '▲24% in 13w', detail: 'current 38.7K · accelerating' },
    },
    coupon: {
      store: { stat: 'Acme #0418',  detail: '22% of redemptions · ▼3% wow' },
      day:   { stat: 'Wednesday',   detail: 'highest redemption rate' },
      trend: { stat: '▼7% in 13w',  detail: 'softening — investigate' },
    },
    dealtype: {
      store: { stat: 'BOGO',        detail: '38% of activity · top deal' },
      day:   { stat: 'Saturday',    detail: '▲40% above weekly avg' },
      trend: { stat: '▲6% in 13w',  detail: 'BOGO holds lead' },
    },
  };

  function findSubTabLabel(pane, subKey) {
    const nav = pane.querySelector('.ep-sub-tabs');
    if (!nav) return subKey;
    const btn = nav.querySelector('[data-ep-sub="' + subKey + '"]');
    return (btn?.textContent || subKey).trim();
  }

  function injectHeader(subPane, paneKey) {
    if (subPane.querySelector('.ux846-card-header')) return; // idempotent
    const subKey = subPane.dataset.epSubPane;
    if (!subKey || subKey === 'data') return;
    const finding = FINDINGS[paneKey]?.[subKey];
    const parentPane = subPane.closest('.perf-tab-pane');
    const title = parentPane ? findSubTabLabel(parentPane, subKey) : subKey;

    const header = document.createElement('div');
    header.className = 'ux846-card-header';
    header.innerHTML =
      '<div class="ux846-card-header__title">' + title + '</div>' +
      (finding
        ? '<div class="ux846-card-header__stat">' + finding.stat + '</div>' +
          '<div class="ux846-card-header__detail">' + finding.detail + '</div>'
        : '');
    subPane.insertBefore(header, subPane.firstChild);
  }

  function jumpToSubTab(paneKey, subKey, rangeKey) {
    if (!window.UX846Surface) return;
    window.UX846Surface.setAdvanced(true);
    requestAnimationFrame(() => {
      const pane = document.querySelector('[data-ep-pane="' + paneKey + '"]');
      const subTab = pane?.querySelector('[data-ep-sub="' + subKey + '"]');
      subTab?.click();
      if (rangeKey) {
        const rangeBtn = pane?.querySelector('.ep-trend-range[data-range="' + rangeKey + '"]');
        rangeBtn?.click();
      }
    });
  }

  function injectFooter(subPane, paneKey) {
    if (subPane.querySelector('.ux846-card-footer')) return;
    const subKey = subPane.dataset.epSubPane;
    if (!subKey || subKey === 'data') return;

    const footer = document.createElement('div');
    footer.className = 'ux846-card-footer';

    if (subKey === 'store') {
      // by-Store: top 3 shown via CSS — link to full list in Advanced.
      const link = document.createElement('button');
      link.type = 'button';
      link.className = 'ux846-card-footer__link';
      link.innerHTML = 'View all <span class="material-symbols-outlined">arrow_forward</span>';
      link.addEventListener('click', () => jumpToSubTab(paneKey, 'store'));
      footer.appendChild(link);
    } else if (subKey === 'trend') {
      // Time Trend: 4w default + range chips. Each chip flips Advanced
      // ON, activates the trend sub-tab, and sets the chosen range.
      const ranges = [
        { key: '1w',  label: '1 week' },
        { key: '4w',  label: '4 week', active: true },
        { key: '13w', label: '13 week' },
        { key: '1y',  label: '1 year' },
      ];
      const chipsWrap = document.createElement('div');
      chipsWrap.className = 'ux846-card-footer__chips';
      ranges.forEach((r) => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'ux846-card-footer__chip' + (r.active ? ' is-active' : '');
        chip.textContent = r.label;
        chip.addEventListener('click', () => jumpToSubTab(paneKey, 'trend', r.key));
        chipsWrap.appendChild(chip);
      });
      footer.appendChild(chipsWrap);
    } else {
      // by-Day: no footer (card matches Advanced — no further drill).
      return;
    }

    subPane.appendChild(footer);
  }

  function paint() {
    document.querySelectorAll('.perf-tab-pane').forEach((pane) => {
      const paneKey = pane.dataset.epPane;
      if (!paneKey || paneKey === 'overview') return;
      pane.querySelectorAll('.ep-sub-pane').forEach((sp) => {
        injectHeader(sp, paneKey);
        injectFooter(sp, paneKey);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', paint);
  } else {
    paint();
  }
})();
