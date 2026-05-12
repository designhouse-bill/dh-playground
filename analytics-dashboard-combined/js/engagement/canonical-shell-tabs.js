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
      // UX-846 Report mode 2026-05-12: page-level hero-stat stays neutral (gray).
      // Per-pane .hero-stat[data-ep-active="<key>"] is hardcoded in markup and
      // owns the section color tint for its KPI sub-section.
      var targetPane = root.querySelector('[data-ep-pane="' + target + '"]');
      if (targetPane) applySubTab(targetPane, currentSubTab);
    }

    // Initial state — overview tint on load (otherwise hero-stat falls back to
    // the default --hero-stat-bg / primary-50 blue from analytics-architecture.css).
    var initialHero = document.getElementById('ep-page-hero-stat');
    if (initialHero && !initialHero.dataset.epActive) {
      initialHero.dataset.epActive = 'overview';
    }

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

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        activateTab(tab.dataset.epTab);
      });
    });

    root.querySelectorAll('.ep-kpi-tile[data-jump-to]').forEach(function (tile) {
      tile.addEventListener('click', function () {
        activateTab(tile.dataset.jumpTo);
        tabBar.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    panes.forEach(function (pane) {
      var subTabs = pane.querySelectorAll('.ep-sub-tab:not(.ep-sub-tab--data)');
      subTabs.forEach(function (st) {
        st.addEventListener('click', function () {
          currentSubTab = st.dataset.epSub;
          applySubTab(pane, currentSubTab);
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
