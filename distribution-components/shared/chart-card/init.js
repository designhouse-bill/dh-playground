/* chart-card init — the CARD-CHROME slice of the traffic page's inline
   ep-sub-tab driver (distribution-traffic.html, UX-846 D2 2026-06-04):
   panel copy, data-show-on-sub control visibility, engine hooks. Tab
   activation + pane visibility split out to shared/sub-tabs/init.js
   (2026-07-02) — this reacts via its onChange seam, mirroring the
   Angular twin (chart-card composes dh-sub-tabs/dh-sub-pane). Panel
   copy + default sub come from data/sections.js (cfg.panelCopy /
   cfg.defaultSub). Engine hooks stay guarded no-ops: echarts resize and
   window.DistributionTraffic.buildStorePane arrive with the trend /
   leaderboard / store-map carves. */
(function () {
  'use strict';

  function resizePane(pane) {
    if (typeof echarts === 'undefined' || !echarts.getInstanceByDom) return;
    pane.querySelectorAll('[_echarts_instance_]').forEach(function (el) {
      var inst = echarts.getInstanceByDom(el);
      if (inst) inst.resize();
    });
  }

  function init(card, cfg) {
    if (!card || !cfg) return;
    var PANEL_COPY = cfg.panelCopy || {};
    var strip = card.querySelector('.ep-sub-tabs');
    var title = card.querySelector('.panel-label');
    var sub   = card.querySelector('.panel-subtitle');
    var storeBuilt = false;

    // Card chrome reacting to a tab change (activation itself lives in sub-tabs).
    function onSub(name) {
      // Sub-tab-scoped controls (duration presets, view toggles).
      card.querySelectorAll('[data-show-on-sub]').forEach(function (el) {
        el.style.display = el.dataset.showOnSub === name ? '' : 'none';
      });
      // Panel copy.
      var copy = PANEL_COPY[name];
      if (copy) {
        if (title) title.textContent = copy.title;
        if (sub) sub.innerHTML = copy.sub;
      }
      var active = card.querySelector('[data-dist-sub-pane="' + name + '"]');
      if (!active) return;
      // By Store pane: lazy-build leaderboard + Leaflet map on first show
      // (renderMap needs a visible, sized container); invalidate size on return.
      if (name === 'store') {
        var DT = window.DistributionTraffic;
        if (DT) {
          if (!storeBuilt) { DT.buildStorePane(); storeBuilt = true; }
          else if (DT.invalidateMap) { DT.invalidateMap(); }
        }
      }
      resizePane(active);
    }

    // Toggle groups: activation via shared/toggle; data swaps are engine
    // hooks (guarded no-ops until the trend / by-competitor carves).
    card.querySelectorAll('.view-toggle').forEach(function (el) {
      var attr = el.querySelector('[data-traffic-view]') ? 'trafficView'
        : el.querySelector('[data-xover-cohort]') ? 'xoverCohort' : 'xoverMetric';
      window.DistToggle.init(el, { attr: attr });
    });
    card.querySelectorAll('.duration-presets').forEach(function (el) {
      window.DistToggle.init(el, { attr: 'period', activeClass: 'duration-preset--active' });
    });

    var tabsApi = window.DistSubTabs.init(strip, { paneRoot: card, onChange: onSub });

    // Initialize control visibility for the default tab.
    tabsApi.activate(cfg.defaultSub);
  }

  window.DistChartCard = { init: init };
})();
