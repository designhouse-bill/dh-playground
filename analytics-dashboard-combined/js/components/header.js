/**
 * Header Component — Combined Prototype
 * Handles dashboard switching, view modes, date/entity selection, filters.
 * Header is inlined in index.html — no fetch needed.
 */

const HeaderComponent = (function() {
  'use strict';

  let elements = {};
  let activeDashboard = 'engagement';

  let callbacks = {
    onModeChange: null,
    onViewChange: null,
    onDashboardChange: null,
    onDateSelect: null,
    onEntitySelect: null,
    onFilterAdd: null,
    onFilterRemove: null
  };

  function init(opts = {}) {
    Object.assign(callbacks, opts);
    cacheElements();
    bindEvents();
  }

  function cacheElements() {
    elements = {
      modeBtns: document.querySelectorAll('.mode-btn'),
      modeGroups: document.querySelectorAll('.mode-group'),
      subtabs: document.querySelectorAll('.subtab'),
      viewModes: document.querySelector('.view-modes'),
      dateSelector: document.getElementById('date-selector'),
      entitySelector: document.getElementById('entity-selector'),
      filterChips: document.getElementById('filter-chips'),
      addFilterBtn: document.getElementById('add-filter-btn'),
      dashboardSwitcher: document.getElementById('dashboard-switcher'),
      dashboardToggle: document.getElementById('performance-type-dropdown'),
      dashboardMenu: document.getElementById('dashboard-menu'),
      dashboardLabel: document.querySelector('.performance-dropdown__text'),
      dashboardItems: document.querySelectorAll('.dashboard-switcher__item')
    };
  }

  function bindEvents() {
    if (elements.dashboardToggle) {
      elements.dashboardToggle.addEventListener('click', toggleDashboardMenu);
    }

    elements.dashboardItems.forEach(item => {
      item.addEventListener('click', handleDashboardSelect);
    });

    document.addEventListener('click', (e) => {
      if (elements.dashboardSwitcher && !elements.dashboardSwitcher.contains(e.target)) {
        closeDashboardMenu();
      }
    });

    elements.modeBtns.forEach(btn => btn.addEventListener('click', handleModeClick));
    elements.subtabs.forEach(tab => tab.addEventListener('click', handleSubtabClick));

    if (elements.dateSelector) {
      elements.dateSelector.addEventListener('click', () => {
        if (callbacks.onDateSelect) callbacks.onDateSelect();
      });
    }

    if (elements.entitySelector) {
      elements.entitySelector.addEventListener('click', () => {
        if (callbacks.onEntitySelect) callbacks.onEntitySelect();
      });
    }

    if (elements.addFilterBtn) {
      elements.addFilterBtn.addEventListener('click', () => {
        if (callbacks.onFilterAdd) callbacks.onFilterAdd();
      });
    }
  }

  // ========================================
  // Dashboard Switcher
  // ========================================

  function toggleDashboardMenu() {
    const isOpen = elements.dashboardMenu.classList.contains('open');
    isOpen ? closeDashboardMenu() : openDashboardMenu();
  }

  function openDashboardMenu() {
    elements.dashboardMenu.classList.add('open');
    elements.dashboardToggle.setAttribute('aria-expanded', 'true');
  }

  function closeDashboardMenu() {
    if (elements.dashboardMenu) elements.dashboardMenu.classList.remove('open');
    if (elements.dashboardToggle) elements.dashboardToggle.setAttribute('aria-expanded', 'false');
  }

  function handleDashboardSelect(e) {
    const item = e.currentTarget;
    const dashboard = item.dataset.dashboard;
    if (!dashboard || dashboard === activeDashboard) {
      closeDashboardMenu();
      return;
    }
    setActiveDashboard(dashboard);
    closeDashboardMenu();
    if (callbacks.onDashboardChange) callbacks.onDashboardChange(dashboard);
  }

  function setActiveDashboard(dashboard) {
    activeDashboard = dashboard;

    if (elements.dashboardLabel) {
      elements.dashboardLabel.textContent = dashboard === 'distribution' ? 'Distribution' : 'Engagement';
    }

    elements.dashboardItems.forEach(item => {
      item.classList.toggle('active', item.dataset.dashboard === dashboard);
    });

    // Show/hide engagement-only view modes
    if (elements.viewModes) {
      elements.viewModes.style.display = dashboard === 'distribution' ? 'none' : '';
    }
  }

  // ========================================
  // Mode & View Handlers
  // ========================================

  function handleModeClick(e) {
    const btn = e.currentTarget;
    const mode = btn.dataset.mode;
    if (!mode) return;
    setActiveMode(mode);
    if (callbacks.onModeChange) callbacks.onModeChange(mode);
  }

  function handleSubtabClick(e) {
    const tab = e.currentTarget;
    const view = tab.dataset.view;
    if (!view) return;
    setActiveView(view);
    if (callbacks.onViewChange) callbacks.onViewChange(view);
  }

  function setActiveMode(mode) {
    elements.modeBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    elements.modeGroups.forEach(group => {
      group.classList.toggle('active', group.dataset.mode === mode);
    });
  }

  function setActiveView(view) {
    elements.subtabs.forEach(tab => {
      const isActive = tab.dataset.view === view;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  // ========================================
  // Display Helpers
  // ========================================

  function updateDateDisplay(weekLabel, dateRange) {
    const valueEl = elements.dateSelector?.querySelector('.card-value');
    const subEl = elements.dateSelector?.querySelector('.card-sub');
    if (valueEl) valueEl.textContent = weekLabel;
    if (subEl) subEl.textContent = dateRange;
  }

  function updateEntityDisplay(type, name, subtext) {
    const breadcrumbEl = elements.entitySelector?.querySelector('.card-breadcrumb');
    const valueEl = elements.entitySelector?.querySelector('.card-value');
    const subEl = elements.entitySelector?.querySelector('.card-sub');
    if (breadcrumbEl) breadcrumbEl.textContent = type;
    if (valueEl) valueEl.textContent = name;
    if (subEl) subEl.textContent = subtext;
  }

  function renderFilterChips(filters) {
    if (!elements.filterChips) return;
    const existingChips = elements.filterChips.querySelectorAll('.filter-chip');
    existingChips.forEach(chip => chip.remove());
    filters.forEach(filter => {
      const chip = createFilterChip(filter);
      elements.filterChips.insertBefore(chip, elements.addFilterBtn);
    });
  }

  function createFilterChip(filter) {
    const chip = document.createElement('span');
    chip.className = `filter-chip filter-chip--${filter.type}`;
    chip.innerHTML = `
      ${filter.label}
      <button onclick="HeaderComponent.removeFilter('${filter.id}')" aria-label="Remove filter">
        <span class="material-symbols-outlined" style="font-size: 14px;">close</span>
      </button>
    `;
    return chip;
  }

  function removeFilter(filterId) {
    if (callbacks.onFilterRemove) callbacks.onFilterRemove(filterId);
  }

  return {
    init,
    setActiveMode,
    setActiveView,
    setActiveDashboard,
    updateDateDisplay,
    updateEntityDisplay,
    renderFilterChips,
    removeFilter
  };
})();
