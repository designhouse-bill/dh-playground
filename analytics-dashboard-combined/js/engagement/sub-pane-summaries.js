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

  // Re-render the trend SVG at a more compact aspect ratio so it fits
  // legibly inside the summary card slot. The canonical renderer uses
  // viewBox 880x280 (3.14:1) which, in a 1/3-page-wide card, renders only
  // ~127px tall with ~4-5px text. We extract the data from the rendered
  // .ep-trend-dot elements and re-emit a chart at 500x380 (1.32:1) with
  // proportionally larger paddings and text — actual element sizes, not
  // scale-stretching.
  function rerenderTrendCompact(host) {
    if (!host) return;
    const dots = host.querySelectorAll('.ep-trend-dot');
    if (!dots.length) return;
    const data = Array.from(dots).map((d) => ({
      week: d.getAttribute('data-week'),
      val: parseFloat(d.getAttribute('data-val')),
    }));
    if (data.some((d) => isNaN(d.val))) return;

    // Reuse existing axis label strings so formatting (e.g. "%", "K") is
    // preserved.  text-anchor="end" identifies y-axis labels.
    const yLabels = Array.from(host.querySelectorAll('svg text[text-anchor="end"]')).map((t) => t.textContent);
    if (yLabels.length < 2) return;

    // Pull the accent color from the existing line path stroke.
    const line = host.querySelector('path[fill="none"][stroke]');
    const accent = line ? line.getAttribute('stroke') : '#2563eb';

    const W = 500, H = 380, pad = 50;
    const vals = data.map((d) => d.val);
    const yMax = Math.ceil(Math.max.apply(null, vals) * 1.15) || 1;
    const ySteps = yLabels.length - 1;
    const xs = data.map((_, i) => pad + (data.length > 1 ? i * (W - pad * 2) / (data.length - 1) : 0));
    const ys = vals.map((v) => H - pad - (v / yMax) * (H - pad * 2));
    const baseY = H - pad;
    const lineD = xs.map((x, i) => (i ? 'L' : 'M') + x + ',' + ys[i]).join(' ');
    const areaD = lineD + ' L' + xs[xs.length - 1] + ',' + baseY + ' L' + xs[0] + ',' + baseY + ' Z';
    const gradId = host.id + '-grad-c';

    let grid = '';
    for (let i = 0; i <= ySteps; i++) {
      const y = H - pad - (i / ySteps) * (H - pad * 2);
      grid +=
        '<line x1="' + pad + '" x2="' + (W - pad) + '" y1="' + y + '" y2="' + y + '" stroke="#e5e7eb"/>' +
        '<text x="' + (pad - 8) + '" y="' + (y + 5) + '" font-size="14" fill="#6b7280" text-anchor="end">' + (yLabels[i] || '') + '</text>';
    }

    const xLbls = data.map((d, i) =>
      '<text x="' + xs[i] + '" y="' + (H - 15) + '" font-size="14" fill="#6b7280" text-anchor="middle">' + d.week + '</text>'
    ).join('');

    const dotsSvg = xs.map((x, i) =>
      '<circle class="ep-trend-dot" cx="' + x + '" cy="' + ys[i] + '" r="5" fill="#fff" stroke="' + accent + '" stroke-width="2.5" data-week="' + data[i].week + '" data-val="' + data[i].val + '"/>'
    ).join('');

    host.dataset.trendCompact = '1';
    host.innerHTML =
      '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;height:auto;display:block;">' +
      '<defs><linearGradient id="' + gradId + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="' + accent + '" stop-opacity="0.18"/>' +
      '<stop offset="100%" stop-color="' + accent + '" stop-opacity="0"/>' +
      '</linearGradient></defs>' +
      grid +
      '<path d="' + areaD + '" fill="url(#' + gradId + ')" stroke="none"/>' +
      '<path d="' + lineD + '" fill="none" stroke="' + accent + '" stroke-width="2.5"/>' +
      dotsSvg + xLbls +
      '</svg>';
  }

  function rerenderAllTrendsCompact() {
    document.querySelectorAll('.ep-sub-pane[data-ep-sub-pane="trend"] [id$="-trend"]').forEach(rerenderTrendCompact);
  }

  function restoreCanonicalTrends() {
    // Re-trigger the canonical renderer by clicking the currently active
    // .ep-trend-range button. The renderer overwrites the host innerHTML
    // with the natural 880x280 SVG suitable for the wider detail view.
    document.querySelectorAll('.ep-sub-pane[data-ep-sub-pane="trend"] .ep-trend-range--active').forEach((btn) => btn.click());
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
    document.addEventListener('ux846:view-change', (e) => {
      syncOverviewActive();
      // Compact trend SVG in summary; canonical render in detail.
      if (e.detail?.view === 'summary') {
        setTimeout(rerenderAllTrendsCompact, 50);
      } else {
        setTimeout(restoreCanonicalTrends, 50);
      }
    });
    // Defer 4w default until canonical-shell-renderers has wired the
    // toolbar (it runs on DOMContentLoaded too). After it paints, re-emit
    // a compact-aspect SVG for the summary view.
    setTimeout(() => {
      setTrendDefault();
      setTimeout(rerenderAllTrendsCompact, 100);
    }, 200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', paint);
  } else {
    paint();
  }
})();
