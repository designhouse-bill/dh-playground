/**
 * app.js — Dashboard switcher controller
 * Handles: dashboard switching, view mode visibility, context updates
 */

(function () {
  'use strict';

  let currentDashboard = 'home';
  let distributionInitialized = false;

  // ── Dashboard Switching ──────────────────────────────────────────────────────

  function switchDashboard(name) {
    if (name === currentDashboard) return;
    currentDashboard = name;

    // Toggle active class on all <main> dashboard sections (including home)
    document.querySelectorAll('.dashboard-content').forEach(function (el) {
      el.classList.toggle('active', el.id === name + '-dashboard');
    });

    var header = document.querySelector('header.header');
    var label = document.getElementById('dashboard-switcher-label');
    var viewModes = document.getElementById('view-modes');

    if (name === 'home') {
      // Home: hide switcher, separator, context row, view modes
      if (header) header.classList.add('header--home');
      if (header) header.classList.remove('header--distribution');
      if (window.HeaderSlide) window.HeaderSlide.revealHeader();
      return; // no further header/context work needed
    }

    // Entering a real dashboard — always reveal header on switch
    if (window.HeaderSlide) window.HeaderSlide.revealHeader();
    if (header) header.classList.remove('header--home');
    if (header) header.classList.toggle('header--distribution', name === 'distribution');

    // Update dropdown label
    if (label) {
      label.textContent = name === 'engagement' ? 'Engagement' : 'Distribution';
    }

    // Update active state on menu items
    document.querySelectorAll('.dashboard-switcher__item').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.dashboard === name);
    });

    // Show/hide view modes (engagement only)
    if (viewModes) {
      viewModes.style.display = name === 'engagement' ? '' : 'none';
    }

    // Show/hide distribution section tabs (distribution only)
    var distTabs = document.getElementById('dist-section-tabs');
    if (distTabs) {
      distTabs.style.display = name === 'distribution' ? '' : 'none';
    }

    // Restore context bar for the active dashboard
    if (name === 'engagement' && typeof window.DashboardCore !== 'undefined') {
      window.DashboardCore.updateDateDisplay();
      window.DashboardCore.updateEntityDisplay();
    }
    if (name === 'distribution' && typeof window.initDistribution === 'function' && distributionInitialized) {
      // Re-sync distribution context (already initialized)
      var rc = DistributionData.retailerConfig;
      var storeCount = DistributionData.entities.stores.length;
      var dateValue = document.getElementById('context-date-value');
      var dateSub = document.getElementById('context-date-sub');
      var entityBreadcrumb = document.getElementById('context-entity-breadcrumb');
      var entityValue = document.getElementById('context-entity-value');
      var entitySub = document.getElementById('context-entity-sub');
      if (dateValue) dateValue.textContent = 'Flight Weeks 3\u20132';
      if (dateSub) dateSub.textContent = 'Dec 10, 2025 \u2013 Jan 13, 2026';
      if (entityBreadcrumb) entityBreadcrumb.textContent = 'ALL STORES';
      if (entityValue) entityValue.textContent = rc.name;
      if (entitySub) entitySub.textContent = storeCount + ' stores \u00b7 ' + rc.pilotLabel;
    }

    // Lazy-init distribution on first switch
    if (name === 'distribution' && !distributionInitialized) {
      distributionInitialized = true;
      // Give layout time to reflow before Leaflet calculates dimensions
      setTimeout(function () {
        if (typeof window.initDistribution === 'function') {
          window.initDistribution();
        } else if (typeof window.DistributionDashboard !== 'undefined' &&
                   typeof window.DistributionDashboard.init === 'function') {
          window.DistributionDashboard.init();
        }
      }, 50);
    }

    // Resize visible eCharts after switch (layout reflow needed)
    setTimeout(resizeVisibleCharts, 0);
  }

  // ── eCharts Resize ────────────────────────────────────────────────────────────

  function resizeVisibleCharts() {
    if (typeof echarts === 'undefined') return;
    echarts.getInstanceByDom && document.querySelectorAll('[_echarts_instance_]').forEach(function (el) {
      var instance = echarts.getInstanceByDom(el);
      if (instance) instance.resize();
    });
  }

  // ── Header Init ───────────────────────────────────────────────────────────────

  function initDashboardSwitcher() {
    var dropdown = document.getElementById('performance-type-dropdown');
    var menu = document.getElementById('dashboard-menu');

    if (!dropdown || !menu) return;

    dropdown.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = dropdown.getAttribute('aria-expanded') === 'true';
      dropdown.setAttribute('aria-expanded', String(!isOpen));
      menu.classList.toggle('open', !isOpen);
    });

    menu.querySelectorAll('.dashboard-switcher__item').forEach(function (btn) {
      btn.addEventListener('click', function () {
        dropdown.setAttribute('aria-expanded', 'false');
        menu.classList.remove('open');
        switchDashboard(btn.dataset.dashboard);
      });
    });

    // Close on outside click
    document.addEventListener('click', function () {
      dropdown.setAttribute('aria-expanded', 'false');
      menu.classList.remove('open');
    });
  }

  // ── Context Card Wiring ───────────────────────────────────────────────────────

  function initContextCards() {
    var dateBtn = document.getElementById('date-selector');
    var entityBtn = document.getElementById('entity-selector');
    var filterBtn = document.getElementById('add-filter-btn');

    if (dateBtn) {
      dateBtn.addEventListener('click', function () {
        if (currentDashboard === 'engagement') {
          if (typeof openDatePicker === 'function') openDatePicker();
        } else {
          if (typeof DistributionModals !== 'undefined') DistributionModals.openDatePicker();
        }
      });
    }

    if (entityBtn) {
      entityBtn.addEventListener('click', function () {
        if (currentDashboard === 'engagement') {
          if (typeof openEntitySelector === 'function') openEntitySelector();
        } else {
          if (typeof DistributionModals !== 'undefined') DistributionModals.openEntitySelector();
        }
      });
    }

    if (filterBtn) {
      filterBtn.addEventListener('click', function () {
        if (currentDashboard === 'engagement') {
          if (typeof openFilterModal === 'function') openFilterModal();
        } else {
          if (typeof DistributionModals !== 'undefined') DistributionModals.openFilterModal();
        }
      });
    }
  }

  // ── Navigation Stubs (no separate pages in combined prototype) ───────────────

  window.navigateToInquiry = function (filter, sort, direction) {
    console.log('[stub] navigateToInquiry:', filter, sort, direction);
  };
  window.viewPromotionCirculars = function () {
    console.log('[stub] viewPromotionCirculars');
  };
  window.viewPromotionCategories = function () {
    console.log('[stub] viewPromotionCategories');
  };
  window.openPromotionInquiry = function () {
    console.log('[stub] openPromotionInquiry');
  };
  window.compareCurrentPromotion = function () {
    console.log('[stub] compareCurrentPromotion');
  };

  // ── Distribution Section Tabs ─────────────────────────────────────────────────

  function initDistSectionTabs() {
    var tabs = document.querySelectorAll('#dist-section-tabs .dist-tab');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var sectionId = tab.dataset.section;
        // Update active tab button
        tabs.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        // Show only the selected section
        document.querySelectorAll('.dist-section').forEach(function (s) {
          s.classList.toggle('active', s.id === sectionId);
        });
      });
    });
  }

  // ── Home Cards ────────────────────────────────────────────────────────────────

  function initHomeCards() {
    document.querySelectorAll('.home-card').forEach(function (card) {
      function activate() {
        var target = card.dataset.dashboard;
        if (target) switchDashboard(target);
      }
      card.addEventListener('click', activate);
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
      });
    });

    // Logo / title click → return to home
    var brand = document.querySelector('.brand');
    if (brand) {
      brand.addEventListener('click', function () {
        switchDashboard('home');
      });
    }
  }

  // ── Boot ──────────────────────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', function () {
    // Start in home mode — header hides switcher/context until a dashboard is selected
    var header = document.querySelector('header.header');
    if (header) header.classList.add('header--home');

    initDashboardSwitcher();
    initContextCards();
    initDistSectionTabs();
    initHomeCards();
  });

})();
