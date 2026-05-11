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
      trend: { stat: '▲5.2% in 4w', detail: 'current 12.4K · trending up' },
    },
    users: {
      store: { stat: 'Acme #1234',  detail: '24% of users · ▲14% wow' },
      day:   { stat: 'Friday',      detail: '▲28% above weekly avg' },
      trend: { stat: '▲3.1% in 4w', detail: 'current 9.1K · steady climb' },
    },
    duration: {
      store: { stat: 'Acme #2099',  detail: '3:42 avg · 18% above brand' },
      day:   { stat: 'Sunday',      detail: 'longest avg session (4:12)' },
      trend: { stat: 'Stable 4w',   detail: 'range 3:30–3:55' },
    },
    cardevents: {
      store: { stat: 'Acme #1234',  detail: '31% of card events · ▲24% wow' },
      day:   { stat: 'Saturday',    detail: 'peak 9.4K events' },
      trend: { stat: '▲8.0% in 4w', detail: 'current 38.7K · accelerating' },
    },
    coupon: {
      store: { stat: 'Acme #0418',  detail: '22% of redemptions · ▼3% wow' },
      day:   { stat: 'Wednesday',   detail: 'highest redemption rate' },
      trend: { stat: '▼2.1% in 4w', detail: 'softening — investigate' },
    },
    dealtype: {
      store: { stat: 'BOGO',        detail: '38% of activity · top deal' },
      day:   { stat: 'Saturday',    detail: '▲40% above weekly avg' },
      trend: { stat: '▲1.8% in 4w', detail: 'BOGO holds lead' },
    },
  };

  function findSubTabLabel(pane, subKey) {
    const nav = pane.querySelector('.ep-sub-tabs');
    if (!nav) return subKey;
    const btn = nav.querySelector('[data-ep-sub="' + subKey + '"]');
    return (btn?.textContent || subKey).trim();
  }

  function jumpToSubTab(paneKey, subKey) {
    if (!window.UX846Surface) return;
    window.UX846Surface.setView('detail');
    requestAnimationFrame(() => {
      const pane = document.querySelector('[data-ep-pane="' + paneKey + '"]');
      pane?.querySelector('[data-ep-sub="' + subKey + '"]')?.click();
    });
  }

  function buildHeaderLink(paneKey, subKey, subPane) {
    if (subKey === 'store') {
      // Suppress when entity has 5 or fewer stores — nothing more to view.
      const totalRows = subPane.querySelectorAll('.ep-stacked-list__row').length;
      if (totalRows > 0 && totalRows <= 5) return { node: null, recheck: 'store' };
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'section-card__link';
      btn.innerHTML = 'View all <span class="material-symbols-outlined">arrow_forward</span>';
      btn.addEventListener('click', () => jumpToSubTab(paneKey, 'store'));
      return { node: btn, recheck: 'store' };
    }
    if (subKey === 'trend') {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'section-card__link';
      btn.innerHTML = 'View more <span class="material-symbols-outlined">arrow_forward</span>';
      btn.addEventListener('click', () => jumpToSubTab(paneKey, 'trend'));
      return { node: btn };
    }
    return { node: null };
  }

  function buildHeader(title, finding, link) {
    const header = document.createElement('div');
    header.className = 'section-card__header';
    const titleRow = document.createElement('div');
    titleRow.className = 'section-card__head-row';
    const titleEl = document.createElement('div');
    titleEl.className = 'section-card__title';
    titleEl.textContent = title;
    titleRow.appendChild(titleEl);
    if (link) titleRow.appendChild(link);
    header.appendChild(titleRow);
    if (finding) {
      const stat = document.createElement('div');
      stat.className = 'section-card__stat';
      stat.textContent = finding.stat;
      header.appendChild(stat);
      const detail = document.createElement('div');
      detail.className = 'section-card__detail';
      detail.textContent = finding.detail;
      header.appendChild(detail);
    }
    return header;
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
    const linkResult = buildHeaderLink(paneKey, subKey, subPane);

    card.appendChild(buildHeader(title, finding, linkResult.node));
    card.appendChild(subPane);

    // Async row renderers may finish populating after wrap. Re-check the
    // by-Store link visibility once they're done — drop it if total ≤5.
    if (linkResult.recheck === 'store' && linkResult.node) {
      setTimeout(() => {
        const total = subPane.querySelectorAll('.ep-stacked-list__row').length;
        if (total > 0 && total <= 5) linkResult.node.remove();
      }, 800);
    }
  }

  // Force Trend chart to 4-week default in Standard.  The chart renderer
  // reads the active .ep-trend-range button; click 4w once on init so the
  // chart paints at the right range even though the toolbar is hidden in
  // the summary card.
  function setTrendDefault() {
    document.querySelectorAll('.perf-tab-pane').forEach((pane) => {
      const fourWeek = pane.querySelector('.ep-trend-range[data-range="4w"]');
      if (fourWeek && !fourWeek.classList.contains('ep-trend-range--active')) {
        fourWeek.click();
      }
    });
  }

  // Stretch trend SVGs vertically so they fill the taller card slot in
  // summary view. Default viewBox is 880x280 with preserveAspectRatio=meet
  // which letterboxes when forced taller — switch to "none" to stretch.
  function stretchTrendSvgs() {
    document.querySelectorAll('.ep-sub-pane[data-ep-sub-pane="trend"] svg').forEach((svg) => {
      svg.setAttribute('preserveAspectRatio', 'none');
      svg.style.height = '100%';
    });
  }

  function ensureOverviewTab(pane) {
    const nav = pane.querySelector('.ep-sub-tabs');
    if (!nav || nav.querySelector('[data-ep-sub="overview"]')) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ep-sub-tab';
    btn.setAttribute('role', 'tab');
    btn.setAttribute('data-ep-sub', 'overview');
    btn.textContent = 'Overview';
    btn.addEventListener('click', () => {
      if (window.UX846Surface) window.UX846Surface.setView('summary');
    });
    nav.insertBefore(btn, nav.firstChild);
  }

  // Active sub-tab state must reflect the current view. In summary the
  // Overview tab is active; in detail the tab matching the active sub-pane
  // is active (handled by existing engagement-page-app handler, this
  // function only handles the summary side).
  function syncOverviewActive() {
    const isSummary = document.body.dataset.view !== 'detail';
    document.querySelectorAll('.perf-tab-pane').forEach((pane) => {
      if (pane.dataset.epPane === 'overview') return;
      const nav = pane.querySelector('.ep-sub-tabs');
      if (!nav) return;
      const overview = nav.querySelector('[data-ep-sub="overview"]');
      if (!overview) return;
      if (isSummary) {
        nav.querySelectorAll('.ep-sub-tab').forEach((t) => t.classList.remove('ep-sub-tab--active'));
        overview.classList.add('ep-sub-tab--active');
      } else {
        overview.classList.remove('ep-sub-tab--active');
      }
    });
  }

  // Clicking a non-Overview sub-tab from summary view flips into detail.
  // Existing engagement-page-app subtab handler still runs to toggle the
  // active sub-pane.
  function interceptSubTabClicks() {
    document.addEventListener('click', (e) => {
      const tab = e.target.closest('.ep-sub-tab');
      if (!tab) return;
      const sub = tab.dataset.epSub;
      if (!sub || sub === 'overview' || sub === 'data') return;
      if (window.UX846Surface?.getView() !== 'detail') {
        window.UX846Surface?.setView('detail');
      }
    }, true);
  }

  function renameDataTab(pane) {
    // The "Data" external link becomes "Data Grid" so it reads as a peer
    // alongside Overview / by Store / by Day / Time Trend.
    pane.querySelectorAll('.ep-sub-tab[data-ep-sub="data"]').forEach((el) => {
      // Find the bare "Data" text node and rewrite it.
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
      let node;
      while ((node = walker.nextNode())) {
        if (node.nodeValue.trim() === 'Data') {
          node.nodeValue = node.nodeValue.replace('Data', 'Data Grid');
          break;
        }
      }
    });
  }

  function paint() {
    // Sweep any stale .surface-back elements lingering from a prior cached
    // build. The Overview sub-tab replaces this affordance.
    document.querySelectorAll('.surface-back').forEach((el) => el.remove());

    document.querySelectorAll('.perf-tab-pane').forEach((pane) => {
      const paneKey = pane.dataset.epPane;
      if (!paneKey || paneKey === 'overview') return;
      pane.querySelectorAll('.ep-sub-pane').forEach((sp) => wrapSubPane(sp, paneKey));
      ensureOverviewTab(pane);
      renameDataTab(pane);
    });
    interceptSubTabClicks();
    syncOverviewActive();
    document.addEventListener('ux846:view-change', syncOverviewActive);
    // Defer 4w default until canonical-shell-renderers has wired the
    // toolbar (it runs on DOMContentLoaded too).
    setTimeout(() => {
      setTrendDefault();
      // Re-run after the chart repaints in 4w form.
      setTimeout(stretchTrendSvgs, 100);
    }, 200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', paint);
  } else {
    paint();
  }
})();
