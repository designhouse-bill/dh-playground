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

  function paint() {
    document.querySelectorAll('.perf-tab-pane').forEach((pane) => {
      const paneKey = pane.dataset.epPane;
      if (!paneKey || paneKey === 'overview') return;
      pane.querySelectorAll('.ep-sub-pane').forEach((sp) => injectHeader(sp, paneKey));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', paint);
  } else {
    paint();
  }
})();
