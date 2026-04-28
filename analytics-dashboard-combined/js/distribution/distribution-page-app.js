/**
 * distribution-page-app.js — Lightweight controller for standalone distribution pages.
 *
 * Replaces app.js on distribution-media.html, distribution-visitation.html,
 * and distribution-traffic.html. Handles: header wiring, dashboard switcher
 * navigation, context card → modal bindings, and window resize for charts.
 *
 * The section to initialize is read from <body data-dist-page="media|visitation|traffic">.
 */

(function () {
  'use strict';

  // ── Dashboard Switcher ────────────────────────────────────────────────────────

  function initDashboardSwitcher() {
    var dropdown = document.getElementById('performance-type-dropdown');
    var menu     = document.getElementById('dashboard-menu');
    if (!dropdown || !menu) return;

    dropdown.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = dropdown.getAttribute('aria-expanded') === 'true';
      dropdown.setAttribute('aria-expanded', String(!isOpen));
      menu.classList.toggle('open', !isOpen);
    });

    // Items with data-href navigate directly (e.g. Engagement → index.html)
    menu.querySelectorAll('[data-href]').forEach(function (item) {
      item.addEventListener('click', function () {
        window.location.href = item.dataset.href;
      });
    });

    // Close on outside click
    document.addEventListener('click', function () {
      dropdown.setAttribute('aria-expanded', 'false');
      menu.classList.remove('open');
    });
  }

  // ── Context Card → Distribution Modals ───────────────────────────────────────

  function initContextCards() {
    var dateBtn   = document.getElementById('date-selector');
    var entityBtn = document.getElementById('entity-selector');

    if (dateBtn) {
      dateBtn.addEventListener('click', function () {
        if (typeof DistributionModals !== 'undefined') DistributionModals.openDatePicker();
      });
    }
    if (entityBtn) {
      entityBtn.addEventListener('click', function () {
        if (typeof DistributionModals !== 'undefined') DistributionModals.openEntitySelector();
      });
    }
  }

  // ── Window Resize → eCharts + Leaflet ────────────────────────────────────────

  function initResizeHandler() {
    window.addEventListener('resize', function () {
      if (typeof echarts !== 'undefined') {
        document.querySelectorAll('[_echarts_instance_]').forEach(function (el) {
          var inst = echarts.getInstanceByDom(el);
          if (inst) inst.resize();
        });
      }
      if (typeof StoreMap !== 'undefined') StoreMap.invalidateSize();
    });
  }

  // ── Boot ──────────────────────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', function () {
    // Brand/logo → home
    var brand = document.querySelector('.brand');
    if (brand) {
      brand.style.cursor = 'pointer';
      brand.addEventListener('click', function () {
        window.location.href = 'index.html';
      });
    }

    initDashboardSwitcher();
    initContextCards();
    initResizeHandler();

    // Init only the section that belongs to this page
    var section = document.body.dataset.distPage;
    if (section && typeof window.initDistributionPage === 'function') {
      window.initDistributionPage(section);
    }
  });

})();
