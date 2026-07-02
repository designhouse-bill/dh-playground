/* sub-tabs init — the tab-activation slice of the old inline ep-sub-tab
   driver (split out of shared/chart-card/init.js 2026-07-02): active
   class + aria-selected on the strip, .ep-sub-pane--active on panes,
   onChange seam for card chrome (panel copy, data-show-on-sub, engine
   hooks stay in chart-card). Mirrors dh-sub-tabs (activeChange) +
   dh-sub-pane in the Angular twin. */
(function () {
  'use strict';

  function init(strip, opts) {
    if (!strip) return null;
    opts = opts || {};
    var root  = opts.paneRoot || document;
    var tabs  = strip.querySelectorAll('.ep-sub-tab');
    var panes = root.querySelectorAll('[data-dist-sub-pane]');

    function activate(name) {
      tabs.forEach(function (t) {
        var on = t.dataset.distSub === name;
        t.classList.toggle('ep-sub-tab--active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      panes.forEach(function (p) {
        p.classList.toggle('ep-sub-pane--active', p.dataset.distSubPane === name);
      });
      if (opts.onChange) opts.onChange(name);
    }

    tabs.forEach(function (t) {
      t.addEventListener('click', function () { activate(t.dataset.distSub); });
    });

    return { activate: activate };
  }

  window.DistSubTabs = { init: init };
})();
