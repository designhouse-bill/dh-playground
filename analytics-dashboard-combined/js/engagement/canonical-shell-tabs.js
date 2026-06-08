/**
 * canonical-shell-tabs.js — UX-846 Phase 5
 *
 * Wires perf-tabs + ep-sub-tabs + ep-kpi-tile interactions for any page that
 * mounts the canonical Engagement shell (partials/canonical-engagement-shell.html).
 *
 * Scope: pages with a wrapper element matching `.engagement-canonical`.
 * Hooks: data-ep-tab, data-ep-pane, data-ep-sub, data-ep-sub-pane, data-jump-to.
 *
 * Behavior mirrors engagement-report.html inline tab logic so
 * bare pages (categories/circulars/grid) get the same UX without duplicating it.
 */
(function () {
  'use strict';

  function init(root) {
    // Phase 1: perf-tabs strip lives in the injected shell (sibling of root).
    // Look up at document level; sub-tab wiring runs even if tab strip is absent.
    var tabBar = root.querySelector('#ep-perf-tabs') || document.querySelector('#ep-perf-tabs');
    var tabs = tabBar ? tabBar.querySelectorAll('.perf-tab') : [];
    var panes = root.querySelectorAll('.perf-tab-pane');
    // UX-846 Report mode 2026-05-12: Time Trend is default sub-tab per plan.
    var currentSubTab = 'trend';

    // UX-846 2026-05-27: page-level hero-stat swaps title/question/color per
    // active perf-tab (mirrors Distribution one-hero pattern). Replaces the
    // per-pane .hero-stat blocks that previously owned section identity.
    var HERO_COPY = {
      overview:    { title: 'Overview',             q: 'How is engagement performing this week?' },
      performance: { title: 'Performance Score',    q: 'How is the Views/Clicks/Adds composite trending?' },
      users:       { title: 'Total Users',          q: 'How many unique users engaged this week, and which stores drove them?' },
      sessions:    { title: 'Sessions',             q: 'How are sessions distributed across stores, days, and weeks?' },
      duration:    { title: 'Avg Session Duration', q: 'How long are users spending on each store?' }
    };
    var pageHero = document.getElementById('ep-page-hero-stat');
    var heroTitle = document.getElementById('ep-hero-title');
    var heroQuestion = document.getElementById('ep-hero-question');
    function updatePageHero(target) {
      var copy = HERO_COPY[target];
      if (!copy || !pageHero) return;
      pageHero.dataset.epActive = target;
      if (heroTitle) heroTitle.textContent = copy.title;
      if (heroQuestion) heroQuestion.textContent = copy.q;
    }

    function applySubTab(pane, key) {
      var subTabs = pane.querySelectorAll('.ep-sub-tab');
      var subPanes = pane.querySelectorAll('.ep-sub-pane');
      var matched = false;
      subTabs.forEach(function (t) {
        var on = t.dataset.epSub === key;
        if (on) matched = true;
        t.classList.toggle('ep-sub-tab--active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      subPanes.forEach(function (sp) {
        sp.classList.toggle('ep-sub-pane--active', sp.dataset.epSubPane === key);
      });
      if (!matched && subTabs.length) {
        subTabs[0].classList.add('ep-sub-tab--active');
        subTabs[0].setAttribute('aria-selected', 'true');
        if (subPanes[0]) subPanes[0].classList.add('ep-sub-pane--active');
      }
      // Toggle header-right controls scoped to specific sub-tab (e.g. duration-presets[data-show-on-sub="trend"]).
      pane.querySelectorAll('[data-show-on-sub]').forEach(function (el) {
        el.style.display = (el.dataset.showOnSub === key) ? '' : 'none';
      });
    }

    function activateTab(target) {
      tabs.forEach(function (t) {
        var on = t.dataset.epTab === target;
        t.classList.toggle('active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      panes.forEach(function (p) {
        p.classList.toggle('active', p.dataset.epPane === target);
      });
      updatePageHero(target);
      var targetPane = root.querySelector('[data-ep-pane="' + target + '"]');
      if (targetPane) applySubTab(targetPane, currentSubTab);
    }

    // Phase 4.5: URL is the single source of truth for nav state. Write the
    // active tab / sub-tab on click via history.replaceState (not push — avoids
    // back-button spam) so the view survives refresh and rides along in Share
    // links. Sole writer of ?tab / ?sub (surface-controller owns ?view).
    function writeNavParam(key, val) {
      try {
        var url = new URL(window.location.href);
        url.searchParams.set(key, val);
        window.history.replaceState({}, '', url.toString());
      } catch (_) {}
    }

    // Initial state — overview tint + copy on load.
    updatePageHero('overview');

    // Phase 4.5: read ?sub= on load so the sub-sub tab (Time Trend / By Store /
    // By Day) survives refresh. Set before the ?tab activation below so the
    // initial pane renders the resolved sub-tab.
    try {
      var urlSub = new URLSearchParams(window.location.search).get('sub');
      if (urlSub) currentSubTab = urlSub;
    } catch (_) {}

    // UX-846 Report mode 2026-05-12: parse ?tab=X on load so KPI tile
     // hrefs (engagement-report.html?tab=performance) activate the pane.
    try {
      var urlTab = new URLSearchParams(window.location.search).get('tab');
      if (urlTab) {
        var match = Array.from(tabs).some(function (t) { return t.dataset.epTab === urlTab; });
        if (match) {
          document.body.dataset.activeTab = urlTab;
          activateTab(urlTab);
        }
      }
    } catch (_) {}

    // Apply the resolved sub-tab to whichever pane is active on load — covers
    // the no-?tab path where the HTML default-active pane never goes through
    // activateTab (idempotent if it did).
    var activePaneOnLoad = root.querySelector('.perf-tab-pane.active') || panes[0];
    if (activePaneOnLoad) applySubTab(activePaneOnLoad, currentSubTab);

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        activateTab(tab.dataset.epTab);
        writeNavParam('tab', tab.dataset.epTab);
      });
    });

    root.querySelectorAll('.ep-kpi-tile[data-jump-to]').forEach(function (tile) {
      tile.addEventListener('click', function () {
        activateTab(tile.dataset.jumpTo);
        writeNavParam('tab', tile.dataset.jumpTo);
        tabBar.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    panes.forEach(function (pane) {
      var subTabs = pane.querySelectorAll('.ep-sub-tab:not(.ep-sub-tab--data)');
      subTabs.forEach(function (st) {
        st.addEventListener('click', function () {
          currentSubTab = st.dataset.epSub;
          applySubTab(pane, currentSubTab);
          writeNavParam('sub', currentSubTab);
        });
      });
    });
  }

  function boot() {
    document.querySelectorAll('.engagement-canonical').forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
