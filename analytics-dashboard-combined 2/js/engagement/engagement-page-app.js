/**
 * engagement-page-app.js — Lightweight controller for standalone engagement pages.
 *
 * Replaces app.js on engagement-promotions.html, engagement-categories.html,
 * engagement-circulars.html, engagement-grid.html, and engagement-compare.html.
 *
 * Handles: dashboard switcher navigation, brand/logo click → home,
 * and window resize for eCharts.
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

    // Items with data-href navigate directly (e.g. Distribution → distribution-media.html)
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

  // ── Window Resize → eCharts ─────────────────────────────────────────────────

  function initResizeHandler() {
    window.addEventListener('resize', function () {
      if (typeof echarts !== 'undefined') {
        document.querySelectorAll('[_echarts_instance_]').forEach(function (el) {
          var inst = echarts.getInstanceByDom(el);
          if (inst) inst.resize();
        });
      }
    });
  }

  // ── Context Cards (Date + Entity selectors) ──────────────────────────────────

  function initContextCards() {
    var dateBtn = document.getElementById('date-selector');
    var entityBtn = document.getElementById('entity-selector');

    if (dateBtn) {
      dateBtn.addEventListener('click', function () {
        if (typeof DashboardModals !== 'undefined') DashboardModals.openDatePicker();
      });
    }
    if (entityBtn) {
      entityBtn.addEventListener('click', function () {
        if (typeof DashboardModals !== 'undefined') DashboardModals.openEntitySelector();
      });
    }
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
    initResizeHandler();
    initContextCards();
  });

})();
