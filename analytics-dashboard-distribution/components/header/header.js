/**
 * Header Component JavaScript
 * Handles dashboard switching, view mode switching, date/entity selection, and filters
 */

const HeaderComponent = (function() {
  'use strict';

  // DOM element references (populated on init)
  let elements = {};

  // Current dashboard type
  let activeDashboard = 'engagement';

  // Callbacks for external handlers
  let callbacks = {
    onModeChange: null,
    onViewChange: null,
    onDashboardChange: null,
    onDateSelect: null,
    onEntitySelect: null,
    onFilterAdd: null,
    onFilterRemove: null
  };

  /**
   * Initialize the header component
   * @param {object} opts - Configuration options
   */
  function init(opts = {}) {
    // Store callbacks
    Object.assign(callbacks, opts);

    // Cache DOM elements
    cacheElements();

    // Bind event listeners
    bindEvents();

    // Set initial state from StateService if available
    if (typeof StateService !== 'undefined') {
      const state = StateService.get();
      setActiveMode(state.appMode || 'base');
      setActiveView(state.viewMode || 'categories');
    }
  }

  /**
   * Cache DOM element references
   */
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

  /**
   * Bind event listeners
   */
  function bindEvents() {
    // Dashboard switcher toggle
    if (elements.dashboardToggle) {
      elements.dashboardToggle.addEventListener('click', toggleDashboardMenu);
    }

    // Dashboard menu items
    elements.dashboardItems.forEach(item => {
      item.addEventListener('click', handleDashboardSelect);
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (elements.dashboardSwitcher && !elements.dashboardSwitcher.contains(e.target)) {
        closeDashboardMenu();
      }
    });

    // Mode buttons (BASE, GRID, COMPARE)
    elements.modeBtns.forEach(btn => {
      btn.addEventListener('click', handleModeClick);
    });

    // Subtabs (Categories, Promotions)
    elements.subtabs.forEach(tab => {
      tab.addEventListener('click', handleSubtabClick);
    });

    // Context cards
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

    // Add filter button
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
    if (isOpen) {
      closeDashboardMenu();
    } else {
      openDashboardMenu();
    }
  }

  function openDashboardMenu() {
    elements.dashboardMenu.classList.add('open');
    elements.dashboardToggle.setAttribute('aria-expanded', 'true');
  }

  function closeDashboardMenu() {
    if (elements.dashboardMenu) {
      elements.dashboardMenu.classList.remove('open');
    }
    if (elements.dashboardToggle) {
      elements.dashboardToggle.setAttribute('aria-expanded', 'false');
    }
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

    // Store in state
    if (typeof StateService !== 'undefined') {
      StateService.set('dashboard', dashboard);
    }

    // Trigger callback for page-level navigation
    if (callbacks.onDashboardChange) {
      callbacks.onDashboardChange(dashboard);
    }
  }

  /**
   * Set the active dashboard (engagement or distribution)
   * Updates dropdown label and shows/hides view modes
   */
  function setActiveDashboard(dashboard) {
    activeDashboard = dashboard;

    // Update dropdown label
    if (elements.dashboardLabel) {
      elements.dashboardLabel.textContent = dashboard === 'distribution' ? 'Distribution' : 'Engagement';
    }

    // Update active item in menu
    elements.dashboardItems.forEach(item => {
      item.classList.toggle('active', item.dataset.dashboard === dashboard);
    });

    // Show/hide engagement view modes (BASE/GRID/COMPARE)
    if (elements.viewModes) {
      elements.viewModes.style.display = dashboard === 'distribution' ? 'none' : '';
    }
  }

  // ========================================
  // Mode & View Handlers
  // ========================================

  /**
   * Handle mode button click
   */
  function handleModeClick(e) {
    const btn = e.currentTarget;
    const mode = btn.dataset.mode;

    if (!mode) return;

    setActiveMode(mode);

    // Update state
    if (typeof StateService !== 'undefined') {
      StateService.set('appMode', mode);
    }

    // Trigger callback
    if (callbacks.onModeChange) {
      callbacks.onModeChange(mode);
    }
  }

  /**
   * Handle subtab click
   */
  function handleSubtabClick(e) {
    const tab = e.currentTarget;
    const view = tab.dataset.view;

    if (!view) return;

    setActiveView(view);

    // Update state
    if (typeof StateService !== 'undefined') {
      StateService.set('viewMode', view);
    }

    // Trigger callback
    if (callbacks.onViewChange) {
      callbacks.onViewChange(view);
    }
  }

  /**
   * Set active mode (base, grid, compare)
   */
  function setActiveMode(mode) {
    // Update mode buttons
    elements.modeBtns.forEach(btn => {
      const isActive = btn.dataset.mode === mode;
      btn.classList.toggle('active', isActive);
    });

    // Update mode groups
    elements.modeGroups.forEach(group => {
      const isActive = group.dataset.mode === mode;
      group.classList.toggle('active', isActive);
    });
  }

  /**
   * Set active view (categories, promotions)
   */
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

  /**
   * Update date display
   */
  function updateDateDisplay(weekLabel, dateRange) {
    const valueEl = elements.dateSelector?.querySelector('.card-value');
    const subEl = elements.dateSelector?.querySelector('.card-sub');

    if (valueEl) valueEl.textContent = weekLabel;
    if (subEl) subEl.textContent = dateRange;
  }

  /**
   * Update entity display
   */
  function updateEntityDisplay(type, name, subtext) {
    const breadcrumbEl = elements.entitySelector?.querySelector('.card-breadcrumb');
    const valueEl = elements.entitySelector?.querySelector('.card-value');
    const subEl = elements.entitySelector?.querySelector('.card-sub');

    if (breadcrumbEl) breadcrumbEl.textContent = type;
    if (valueEl) valueEl.textContent = name;
    if (subEl) subEl.textContent = subtext;
  }

  /**
   * Render filter chips
   */
  function renderFilterChips(filters) {
    if (!elements.filterChips) return;

    // Clear existing chips (keep add button)
    const existingChips = elements.filterChips.querySelectorAll('.filter-chip');
    existingChips.forEach(chip => chip.remove());

    // Add new chips before the add button
    filters.forEach(filter => {
      const chip = createFilterChip(filter);
      elements.filterChips.insertBefore(chip, elements.addFilterBtn);
    });
  }

  /**
   * Create a filter chip element
   */
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

  /**
   * Remove a filter
   */
  function removeFilter(filterId) {
    if (callbacks.onFilterRemove) {
      callbacks.onFilterRemove(filterId);
    }
  }

  // Public API
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
