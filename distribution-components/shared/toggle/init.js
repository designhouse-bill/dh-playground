/* toggle init — activation driver for the segmented-control family
   (.view-toggle / .duration-presets), split out of the traffic page's
   engine wiring (2026-07-02). Active class + aria-selected on the
   clicked button, onChange seam for the engine (chart data swaps
   arrive with the trend carve). Mirrors the Angular twin (dh-toggle
   backed by p-selectbutton, onChange output); the p-selectbutton DOM
   swap itself lands at the 2.1 dial (static-visible). */
(function () {
  'use strict';

  /* el = the group root; opts.attr = the per-button value dataset key
     (e.g. 'trafficView', 'period'); opts.activeClass defaults to
     'active' ('.duration-preset--active' groups pass the modifier). */
  function init(el, opts) {
    if (!el) return null;
    opts = opts || {};
    var attr = opts.attr;
    var activeClass = opts.activeClass || 'active';
    var btns = el.querySelectorAll('[role="tab"], button');

    function activate(value) {
      btns.forEach(function (b) {
        var on = attr ? b.dataset[attr] === value : b === value;
        b.classList.toggle(activeClass, on);
        if (b.hasAttribute('aria-selected')) {
          b.setAttribute('aria-selected', on ? 'true' : 'false');
        }
      });
      if (opts.onChange) opts.onChange(value);
    }

    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        activate(attr ? b.dataset[attr] : b);
      });
    });

    return { activate: activate };
  }

  window.DistToggle = { init: init };
})();
