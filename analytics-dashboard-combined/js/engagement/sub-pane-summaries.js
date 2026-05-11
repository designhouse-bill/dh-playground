// Section summary cards — Standard mode 3-up.
//
// Wraps each .ep-sub-pane in a .section-card container and adds a
// "top finding" header and a footer (link or chips) as SIBLINGS of the
// sub-pane, so the .ep-sub-pane element itself is untouched by our
// chrome.
//
// In Advanced mode the wrapper collapses to display:contents and the
// sub-pane renders exactly as before.

(function () {
  'use strict';

  // MVP synthetic findings keyed by data-ep-pane + data-ep-sub-pane.
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

  function buildHeader(title, finding) {
    const header = document.createElement('div');
    header.className = 'section-card__header';
    header.innerHTML =
      '<div class="section-card__title">' + title + '</div>' +
      (finding
        ? '<div class="section-card__stat">' + finding.stat + '</div>' +
          '<div class="section-card__detail">' + finding.detail + '</div>'
        : '');
    return header;
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

  function buildFooter(subPane, paneKey, subKey) {
    if (subKey === 'store') {
      // by-Store: suppress link when entity has 5 or fewer stores.
      const totalRows = subPane.querySelectorAll('.ep-stacked-list__row').length;
      if (totalRows > 0 && totalRows <= 5) return null;
      const footer = document.createElement('div');
      footer.className = 'section-card__footer';
      const link = document.createElement('button');
      link.type = 'button';
      link.className = 'section-card__link';
      link.innerHTML = 'View all <span class="material-symbols-outlined">arrow_forward</span>';
      link.addEventListener('click', () => jumpToSubTab(paneKey, 'store'));
      footer.appendChild(link);
      return footer;
    }
    if (subKey === 'trend') {
      const footer = document.createElement('div');
      footer.className = 'section-card__footer';
      const ranges = [
        { key: '1w',  label: '1 week' },
        { key: '4w',  label: '4 week', active: true },
        { key: '13w', label: '13 week' },
        { key: '1y',  label: '1 year' },
      ];
      const chipsWrap = document.createElement('div');
      chipsWrap.className = 'section-card__chips';
      ranges.forEach((r) => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'section-card__chip' + (r.active ? ' is-active' : '');
        chip.textContent = r.label;
        chip.addEventListener('click', () => jumpToSubTab(paneKey, 'trend', r.key));
        chipsWrap.appendChild(chip);
      });
      footer.appendChild(chipsWrap);
      return footer;
    }
    return null;
  }

  function wrapSubPane(subPane, paneKey) {
    if (subPane.parentElement?.classList.contains('section-card')) return; // idempotent
    const subKey = subPane.dataset.epSubPane;
    if (!subKey || subKey === 'data') return;

    const card = document.createElement('div');
    card.className = 'section-card';
    card.dataset.sectionCardSub = subKey;

    const parent = subPane.parentNode;
    parent.insertBefore(card, subPane);

    const parentPane = subPane.closest('.perf-tab-pane');
    const title = parentPane ? findSubTabLabel(parentPane, subKey) : subKey;
    const finding = FINDINGS[paneKey]?.[subKey];

    card.appendChild(buildHeader(title, finding));
    card.appendChild(subPane);

    const footer = buildFooter(subPane, paneKey, subKey);
    if (footer) {
      card.appendChild(footer);
      // Re-check after async row renderers — drop the link if rows
      // arrived later and the entity has ≤5 stores total.
      if (subKey === 'store') {
        setTimeout(() => {
          const total = subPane.querySelectorAll('.ep-stacked-list__row').length;
          if (total > 0 && total <= 5) footer.remove();
        }, 800);
      }
    }
  }

  function paint() {
    document.querySelectorAll('.perf-tab-pane').forEach((pane) => {
      const paneKey = pane.dataset.epPane;
      if (!paneKey || paneKey === 'overview') return;
      pane.querySelectorAll('.ep-sub-pane').forEach((sp) => wrapSubPane(sp, paneKey));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', paint);
  } else {
    paint();
  }
})();
