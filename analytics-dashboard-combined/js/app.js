/**
 * app.js — Dashboard switcher controller
 * Handles: dashboard switching, view mode visibility, context updates
 */

(function () {
  'use strict';

  // Default target for context-card clicks. The legacy dashboard switcher that
  // used to seed this from the DOM was retired with the A1 shared header.
  let currentDashboard = 'engagement';
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

    if (name === 'home') {
      // Home: reveal header, drop the distribution accent.
      if (header) header.classList.add('header--home');
      if (header) header.classList.remove('header--distribution');
      if (window.HeaderSlide) window.HeaderSlide.revealHeader();
      return; // no further header/context work needed
    }

    // Entering a real dashboard — always reveal header on switch
    if (window.HeaderSlide) window.HeaderSlide.revealHeader();
    if (header) header.classList.remove('header--home');
    if (header) header.classList.toggle('header--distribution', name === 'distribution');

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
      var weeks = (typeof DistributionData !== 'undefined' && DistributionData.flightWeeks) || [];
      if (dateValue && weeks.length) dateValue.textContent = weeks[0].label + ' \u2013 ' + weeks[weeks.length - 1].label;
      if (dateSub && weeks.length) dateSub.textContent = weeks[0].start + ' \u2013 ' + weeks[weeks.length - 1].end;
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
        // Charts in the active section may have rendered before the container
        // was fully painted — a second resize pass locks in the correct dimensions
        setTimeout(resizeVisibleCharts, 100);
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

  // ── Home Cards ────────────────────────────────────────────────────────────────

  function initHomeCards() {
    document.querySelectorAll('.home-card').forEach(function (card) {
      function activate() {
        var target = card.dataset.dashboard;
        // Both dashboards are standalone pages
        if (target === 'distribution') {
          window.location.href = 'distribution-visitation.html';
          return;
        }
        if (target === 'engagement') {
          window.location.href = 'engagement-report.html';
          return;
        }
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

    initContextCards();
    initHomeCards();

    // Hash routing: distribution pages link back as index.html#engagement
    // Redirect to standalone engagement page
    if (window.location.hash === '#engagement') {
      window.location.href = 'engagement-report.html';
      return;
    }
  });

})();
