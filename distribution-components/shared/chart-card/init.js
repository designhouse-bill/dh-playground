/* chart-card init — the CARD-CHROME slice of the traffic page's inline
   ep-sub-tab driver (distribution-traffic.html, UX-846 D2 2026-06-04):
   panel copy, data-show-on-sub control visibility, engine hooks. Tab
   activation + pane visibility split out to shared/sub-tabs/init.js
   (2026-07-02) — this reacts via its onChange seam, mirroring the
   Angular twin (chart-card composes dh-sub-tabs/dh-sub-pane). Panel
   copy + default sub come from data/sections.js (cfg.panelCopy /
   cfg.defaultSub). Engine hooks: trend seams → window.DistTrend,
   store pane → window.DistLeaderboard + window.DistStoreMap (both live,
   traffic-share carves). */
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
        if (!storeBuilt) {
          if (window.DistLeaderboard) window.DistLeaderboard.build();
          if (window.DistStoreMap) window.DistStoreMap.build();
          storeBuilt = true;
        } else if (window.DistStoreMap) {
          window.DistStoreMap.invalidate();
        }
      }
      resizePane(active);
    }

    // Toggle groups: activation via shared/toggle; data swaps are engine
    // hooks (guarded no-ops until their component carves land). The trend
    // seams route to window.DistTrend (traffic-share/trend carve 2026-07-02).
    function trendHook(method) {
      return function (value) {
        if (window.DistTrend && window.DistTrend[method]) window.DistTrend[method](value);
      };
    }
    card.querySelectorAll('.view-toggle').forEach(function (el) {
      var attr = el.querySelector('[data-traffic-view]') ? 'trafficView'
        : el.querySelector('[data-xover-cohort]') ? 'xoverCohort' : 'xoverMetric';
      var opts = { attr: attr };
      if (el.id === 'traffic-chart-toggle') opts.onChange = trendHook('setView');
      window.DistToggle.init(el, opts);
    });
    card.querySelectorAll('.duration-presets').forEach(function (el) {
      var opts = { attr: 'period', activeClass: 'duration-preset--active' };
      if (el.id === 'crossover-trend-presets') opts.onChange = trendHook('setWeeks');
      window.DistToggle.init(el, opts);
    });

    var tabsApi = window.DistSubTabs.init(strip, { paneRoot: card, onChange: onSub });

    // Initialize control visibility for the default tab.
    tabsApi.activate(cfg.defaultSub);
  }

  window.DistChartCard = { init: init };
})();
