/* chart-card init — the traffic page's inline ep-sub-tab driver slice
   (distribution-traffic.html "Traffic Share — ep-sub-tab driver",
   UX-846 D2 2026-06-04), carved verbatim minus the DOMContentLoaded
   tail (the shell calls init after fragment injection). Panel copy +
   default sub come from data/sections.js (cfg.panelCopy / cfg.defaultSub).
   Engine hooks stay guarded no-ops here: echarts resize and
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
    var tabs  = card.querySelectorAll('.ep-sub-tabs .ep-sub-tab');
    var panes = card.querySelectorAll('[data-dist-sub-pane]');
    var title = card.querySelector('.panel-label');
    var sub   = card.querySelector('.panel-subtitle');
    var storeBuilt = false;

    function showSub(name) {
      tabs.forEach(function (t) {
        var on = t.dataset.distSub === name;
        t.classList.toggle('ep-sub-tab--active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      panes.forEach(function (p) {
        p.classList.toggle('ep-sub-pane--active', p.dataset.distSubPane === name);
      });
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

    tabs.forEach(function (t) {
      t.addEventListener('click', function () { showSub(t.dataset.distSub); });
    });

    // Initialize control visibility for the default tab.
    showSub(cfg.defaultSub);
  }

  window.DistChartCard = { init: init };
})();
