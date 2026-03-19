/**
 * Analytics Dashboard Combined — App Controller
 * Controls dashboard switching, header wiring, and chart resize.
 */

(function() {
  'use strict';

  let activeDashboard = 'engagement';
  let distributionInitialized = false;
  let engagementInitialized = false;

  // ========================================
  // Init
  // ========================================

  function init() {
    // Initialize header (inlined in DOM, no fetch needed)
    HeaderComponent.init({
      onDashboardChange: switchDashboard,
      onModeChange: handleModeChange,
      onViewChange: handleViewChange,
      onDateSelect: handleDateSelect,
      onEntitySelect: handleEntitySelect,
      onFilterAdd: handleFilterAdd,
      onFilterRemove: handleFilterRemove
    });

    // Set initial context bar for Engagement
    setEngagementContext();

    // Show initial dashboard
    showDashboard('engagement');

    // Initialize engagement dashboard on first load
    initEngagement();

    // Window resize — resize all visible charts
    window.addEventListener('resize', handleWindowResize, { passive: true });

    console.log('✅ App initialized');
  }

  // ========================================
  // Dashboard Switching
  // ========================================

  function switchDashboard(dashboard) {
    if (dashboard === activeDashboard) return;

    activeDashboard = dashboard;
    showDashboard(dashboard);

    // Update context bar for the active dashboard
    if (dashboard === 'engagement') {
      setEngagementContext();
    } else {
      setDistributionContext();
    }

    // Lazy-init distribution on first switch
    if (dashboard === 'distribution' && !distributionInitialized) {
      setTimeout(() => {
        DistributionFeature.init();
        distributionInitialized = true;
      }, 50);
    }

    // Resize visible charts after switch (hidden charts have zero dimensions)
    setTimeout(() => {
      resizeVisibleCharts();
    }, 0);
  }

  function showDashboard(dashboard) {
    document.querySelectorAll('.dashboard-content').forEach(el => {
      el.classList.remove('active');
    });
    const target = document.getElementById(dashboard + '-dashboard');
    if (target) target.classList.add('active');
  }

  // ========================================
  // Chart Resize
  // ========================================

  function resizeVisibleCharts() {
    if (activeDashboard === 'engagement' && window.EngagementFeature) {
      EngagementFeature.resizeCharts();
    }
    if (activeDashboard === 'distribution' && window.DistributionFeature) {
      DistributionFeature.resizeCharts();
    }
  }

  function handleWindowResize() {
    resizeVisibleCharts();
    if (typeof StoreMap !== 'undefined' && activeDashboard === 'distribution') {
      StoreMap.invalidateSize();
    }
  }

  // ========================================
  // Context Bar
  // ========================================

  function setEngagementContext() {
    HeaderComponent.updateDateDisplay('Week 40', 'Oct 2–8, 2025');
    HeaderComponent.updateEntityDisplay('ALL STORES', 'Grocery Holdings Corp', '50 stores');
    HeaderComponent.renderFilterChips([]);
  }

  function setDistributionContext() {
    if (typeof DistributionData !== 'undefined') {
      const rc = DistributionData.retailerConfig;
      const storeCount = DistributionData.entities.stores.length;
      HeaderComponent.updateDateDisplay('Flight Weeks 3-2', 'Dec 10, 2025 – Jan 13, 2026');
      HeaderComponent.updateEntityDisplay('ALL STORES', rc.name, storeCount + ' stores · ' + rc.pilotLabel);
    } else {
      HeaderComponent.updateDateDisplay('Flight Weeks 3-2', 'Dec 10, 2025 – Jan 13, 2026');
      HeaderComponent.updateEntityDisplay('ALL STORES', 'Winn-Dixie', '20 stores · FL Pilot');
    }
    HeaderComponent.renderFilterChips([]);
  }

  // ========================================
  // Event Passthrough Handlers
  // ========================================

  function handleModeChange(mode) {
    // Engagement only — BASE/GRID/COMPARE
    if (activeDashboard === 'engagement' && window.EngagementFeature) {
      EngagementFeature.handleModeChange(mode);
    }
  }

  function handleViewChange(view) {
    // Subtab change (Categories / Promotions) — Engagement only
    if (activeDashboard === 'engagement' && window.EngagementFeature) {
      EngagementFeature.handleViewChange(view);
    }
  }

  function handleDateSelect() {
    if (activeDashboard === 'distribution' && typeof DistributionModals !== 'undefined') {
      DistributionModals.openDatePicker();
    }
  }

  function handleEntitySelect() {
    if (activeDashboard === 'distribution' && typeof DistributionModals !== 'undefined') {
      DistributionModals.openEntitySelector();
    }
  }

  function handleFilterAdd() {
    if (activeDashboard === 'distribution' && typeof DistributionModals !== 'undefined') {
      DistributionModals.openFilterModal();
    }
  }

  function handleFilterRemove(filterId) {
    if (activeDashboard === 'distribution' && window.DistributionFeature) {
      DistributionFeature.handleFilterRemove(filterId);
    }
  }

  // ========================================
  // Lazy init engagement
  // ========================================

  function initEngagement() {
    if (engagementInitialized) return;
    setTimeout(() => {
      if (window.EngagementFeature) {
        EngagementFeature.init();
        engagementInitialized = true;
      }
    }, 50);
  }

  // ========================================
  // Boot
  // ========================================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
