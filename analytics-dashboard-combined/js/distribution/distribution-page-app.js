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

  // ── Cohort Note (Count · Scope · Period) ─────────────────────────────────────

  function renderCohortNote(section) {
    var note = document.getElementById('dist-cohort-note-' + section);
    if (!note || typeof DistributionData === 'undefined') return;
    var ctx = DistributionData.context || {};
    var summary = DistributionData.trafficShareMetrics && DistributionData.trafficShareMetrics.summary;
    var count = summary ? summary.stores_total : null;
    var scope = ctx.entityName || 'All Stores';
    var period;
    if (ctx.flightWeek === 'all') {
      period = 'All weeks';
    } else if (ctx.flightWeek) {
      var fw = (DistributionRecords && DistributionRecords.flightWeeks) || [];
      var wk = fw.find(function (w) { return w.id === ctx.flightWeek; });
      period = wk ? wk.label : ctx.flightWeek;
    }
    var countEl  = note.querySelector('.ep-cohort-note__count');
    var scopeEl  = note.querySelector('.ep-cohort-note__scope');
    var periodEl = note.querySelector('.ep-cohort-note__period');
    if (countEl  && count != null) countEl.textContent  = count + ' stores';
    if (scopeEl)  scopeEl.textContent  = scope;
    if (periodEl && period) periodEl.textContent = period;
  }

  // ── Visitation Data Freshness Banner (UX-846 — Adam 2026-06-16) ──────────────
  // Impressions/clicks are near-real-time; visitation data lags (~20d, manual
  // push). The banner tells retailers WHEN the lagged data lands so the surface
  // never just reads as broken. Lagged surfaces only — media (engagement) skips.
  var VISITATION_SECTIONS = { visitation: true, traffic: true, demographics: true };
  // Primary visitation data card(s) per page — dimmed + disabled while the
  // selected period's data is pending (charts then read as last-available).
  var VISITATION_CARDS = {
    visitation: ['ov-chart-card'],
    traffic: ['ts-chart-card']
  };

  function setVizInactive(section, inactive) {
    (VISITATION_CARDS[section] || []).forEach(function (id) {
      var card = document.getElementById(id);
      if (card) card.classList.toggle('viz-inactive', inactive);
    });
  }

  function renderFreshnessBanner(section) {
    if (!VISITATION_SECTIONS[section]) return;
    if (typeof DistributionData === 'undefined' || !DistributionData.getVisitationFreshness) return;
    var host = document.getElementById('section-' + section);
    if (!host) return;

    var f = DistributionData.getVisitationFreshness(DistributionData.context);
    var existing = host.querySelector('.freshness-banner');

    // D1: a fully-settled range shows no banner (avoid noise) and no dimming.
    if (f.status === 'available') {
      if (existing) existing.remove();
      setVizInactive(section, false);
      return;
    }

    var banner = existing;
    if (!banner) {
      banner = document.createElement('div');
      banner.className = 'freshness-banner';
      banner.setAttribute('role', 'status');
      banner.innerHTML =
        '<span class="freshness-banner__icon material-symbols-outlined" aria-hidden="true"></span>' +
        '<div class="freshness-banner__text">' +
          '<span class="freshness-banner__title"></span>' +
          '<span class="freshness-banner__detail"></span>' +
        '</div>';
      host.insertBefore(banner, host.firstChild);
    }

    // Fluid timing — deliberately no hard day-counts or calendar dates (Bill 2026-06-19):
    // keep expectations soft since the manual push can slip.
    function fluidWhen(n) {
      if (n <= 3) return 'shortly';
      if (n <= 10) return 'in the coming days';
      return 'in the coming weeks';
    }
    var icon, title, detail;
    if (f.status === 'pending') {
      icon = 'schedule';
      title = 'Visitation data in progress';
      var stand = f.lastSettledLabel ? ' Charts show ' + f.lastSettledLabel + ' (latest available).' : '';
      if (f.inProgress) {
        detail = f.weekLabel + ' is still in progress — visitation data compiles after it closes, ' +
          'expected ' + fluidWhen(f.daysUntil) + '.' + stand + ' Impressions & clicks update live.';
      } else {
        detail = 'Visit, frequency & demographic metrics for ' + f.weekLabel +
          ' are expected ' + fluidWhen(f.daysUntil) + '.' + stand + ' Impressions & clicks are current.';
      }
      setVizInactive(section, true);
    } else if (f.status === 'partial') {
      icon = 'schedule';
      title = 'Recent weeks still compiling';
      detail = 'Visitation data is complete through ' + (f.throughLabel || 'earlier weeks') +
        '. The most recent week' + (f.pendingCount > 1 ? 's are' : ' is') +
        ' expected ' + fluidWhen(f.nextDaysUntil) + '. Impressions & clicks are current.';
      setVizInactive(section, false); // aggregate view stays active
    } else { // out-of-bounds — selected period hasn't occurred yet
      icon = 'event_busy';
      title = 'Dates not yet reached';
      detail = f.weekLabel + ' hasn’t occurred yet — there’s no data to show. ' +
        'It will populate after the week begins.';
      setVizInactive(section, true);
    }

    banner.dataset.status = f.status;
    banner.querySelector('.freshness-banner__icon').textContent = icon;
    banner.querySelector('.freshness-banner__title').textContent = title;
    banner.querySelector('.freshness-banner__detail').textContent = detail;
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
    if (section) {
      renderCohortNote(section);
      renderFreshnessBanner(section);
      // Re-render when a modal applies a new week/entity (date math depends on week).
      document.addEventListener('distribution:dataRefresh', function () {
        renderCohortNote(section);
        renderFreshnessBanner(section);
      });
    }
  });

})();
