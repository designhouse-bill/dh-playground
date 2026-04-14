/**
 * SHARED FILTERS - Filter Management for Analytics Dashboard
 * Multi-Page Architecture
 *
 * Contains:
 * - Filter chip rendering
 * - Filter application logic
 * - Column filter synchronization
 * - Metrics Key tooltip system
 */

const DashboardFilters = (() => {
  'use strict';

  // Reference to core module
  let core = null;
  let state = null;
  let elements = null;

  // =========================================
  // METRICS KEY DEFINITIONS
  // =========================================
  const METRIC_DEFINITIONS = {
    views: {
      name: 'Views',
      color: '#4272D8',
      weight: '×1',
      description: 'Card displayed in viewport'
    },
    clicks: {
      name: 'Clicks',
      color: '#B8D64D',
      weight: '×5',
      description: 'Shopper expanded the card'
    },
    adds: {
      name: 'Adds',
      color: '#937DF8',
      weight: '×20',
      description: 'Added to shopping list'
    },
    performance: {
      name: 'Performance',
      formula: 'Views×1 + Clicks×5 + Adds×20',
      description: 'Composite engagement score'
    },
    percentile: {
      name: 'Percentile',
      description: 'Ranking vs all items (0-100)'
    }
  };

  // Render callbacks (set by page-specific modules)
  let renderCallbacks = {
    renderCategories: null,
    renderPromotions: null,
    renderCategoryGrid: null,
    renderGridTable: null,
    updateCounts: null
  };

  /**
   * Initialize filters with core references
   */
  function init(dashboardCore) {
    core = dashboardCore;
    state = core.getState();
    elements = core.getElements();
  }

  /**
   * Set render callbacks for page-specific rendering
   */
  function setRenderCallbacks(callbacks) {
    renderCallbacks = { ...renderCallbacks, ...callbacks };
  }

  /**
   * Render filter chips in the header
   */
  function renderFilterChips() {
    const filterChips = elements.filterChips || document.getElementById('filter-chips');
    if (!filterChips) return;

    const chipsHTML = state.activeFilters.map((filter, index) => {
      const colorClass = filter.type === 'store' ? 'filter-chip--store'
                       : filter.type === 'category' ? 'filter-chip--category'
                       : filter.type === 'deal' ? 'filter-chip--deal'
                       : filter.type === 'promotion' ? 'filter-chip--promotion'
                       : filter.type === 'days' ? 'filter-chip--days'
                       : 'filter-chip--size';

      // Get display name for category
      let displayValue = filter.value;
      if (filter.type === 'category' && !filter.fromColumn) {
        const cat = state.categories.find(c => c.id === filter.value);
        if (cat) displayValue = cat.name;
      }

      return `
        <span class="filter-chip ${colorClass}">
          ${filter.label}: ${core.escapeHtml(displayValue)}
          <button onclick="DashboardFilters.removeFilter(${index})">
            <span class="material-symbols-outlined" style="font-size: 14px;">close</span>
          </button>
        </span>
      `;
    }).join('');

    const addButtonHTML = `
      <button class="add-filter" id="add-filter-btn" aria-label="Add filter">
        <span class="material-symbols-outlined">add</span>
        Add Filter
      </button>
    `;

    filterChips.innerHTML = chipsHTML + addButtonHTML;

    // Re-attach event listener
    const newAddBtn = document.getElementById('add-filter-btn');
    if (newAddBtn && typeof DashboardModals !== 'undefined') {
      newAddBtn.addEventListener('click', () => DashboardModals.openFilterModal());
    }
  }

  /**
   * Remove a filter by index
   */
  function removeFilter(index) {
    const filter = state.activeFilters[index];

    // Clear column filter state for ANY filter of this type
    if (filter) {
      if (filter.type === 'promotion') {
        state.columnFilters.name = null;
        // Also clear grid mode column filter
        if (state.gridMode && state.gridMode.columnFilters) {
          state.gridMode.columnFilters.name = null;
        }
      } else if (filter.type === 'category') {
        state.columnFilters.category = null;
        state.activeCategory = null;
        state.selectedCategoryId = null;
        // Also clear grid mode column filter
        if (state.gridMode && state.gridMode.columnFilters) {
          state.gridMode.columnFilters.categoryName = null;
        }
        if (renderCallbacks.renderCategories) {
          renderCallbacks.renderCategories();
        }
      } else if (filter.type === 'deal') {
        state.columnFilters.dealType = null;
        // Also clear grid mode column filter
        if (state.gridMode && state.gridMode.columnFilters) {
          state.gridMode.columnFilters.dealType = null;
        }
      } else if (filter.type === 'store') {
        state.activeStore = null;
        state.selectedStoreId = null;
        if (renderCallbacks.renderStoreGrid) {
          renderCallbacks.renderStoreGrid();
        }
      } else if (filter.type === 'days') {
        // Clear grid mode column filter for days
        if (state.gridMode && state.gridMode.columnFilters) {
          state.gridMode.columnFilters.daysRun = null;
        }
        // Reset the dropdown to "All Days"
        const daysDropdown = document.getElementById('daysFilter');
        if (daysDropdown) {
          daysDropdown.value = '';
        }
      }
    }

    state.activeFilters.splice(index, 1);
    renderFilterChips();
    applyFilters();

    if (renderCallbacks.renderPromotions) {
      renderCallbacks.renderPromotions();
    }

    core.saveState();
  }

  /**
   * Apply all active filters to promotions and categories
   */
  function applyFilters() {
    // Start with category filter if active
    let filtered = state.activeCategory
      ? state.allPromotions.filter(p => p.category === state.activeCategory)
      : [...state.allPromotions];

    // Apply each active filter to promotions
    state.activeFilters.forEach(filter => {
      switch (filter.type) {
        case 'category':
          filtered = filtered.filter(p => p.category === filter.value);
          break;
        case 'deal':
          filtered = filtered.filter(p => p.dealType === filter.value);
          break;
        case 'size':
          filtered = filtered.filter(p => p.cardSize === filter.value);
          break;
        case 'promotion':
          // Text filter on promotion name
          const searchTerm = filter.value.toLowerCase();
          filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(searchTerm)
          );
          break;
      }
    });

    // Apply search filter if active
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.categoryName.toLowerCase().includes(query) ||
        p.dealType.toLowerCase().includes(query)
      );
    }

    state.filteredPromotions = filtered;

    // Filter categories based on which ones have promotions after filtering
    if (state.activeFilters.length > 0) {
      const activeCategoryIds = new Set(filtered.map(p => p.category));
      state.filteredCategories = state.categories.filter(cat => activeCategoryIds.has(cat.id));
    } else {
      state.filteredCategories = [...state.categories];
    }

    // Call render callbacks
    if (renderCallbacks.renderCategoryGrid) {
      renderCallbacks.renderCategoryGrid();
    }
    if (renderCallbacks.renderPromotions) {
      renderCallbacks.renderPromotions();
    }
    if (renderCallbacks.updateCounts) {
      renderCallbacks.updateCounts();
    }

    // Re-render Grid if in Grid mode
    if (state.appMode === 'grid' && renderCallbacks.renderGridTable) {
      state.gridMode.currentPage = 1;
      renderCallbacks.renderGridTable();
    }

    if (core.CONFIG.DEBUG) {
      console.log(`Filters applied: ${state.activeFilters.length} filters, ${filtered.length} promotions, ${state.filteredCategories.length} categories`);
    }
  }

  /**
   * Handle column filter change
   */
  function handleColumnFilter(filterType, value) {
    state.columnFilters[filterType] = value || null;
    syncColumnFiltersToChips();

    if (renderCallbacks.renderPromotions) {
      renderCallbacks.renderPromotions();
    }

    core.saveState();
  }

  /**
   * Sync column filters to context filter chips
   * Enforces single filter per type rule
   */
  function syncColumnFiltersToChips() {
    // SINGLE FILTER PER TYPE: Remove ALL existing filters of these types
    if (state.columnFilters.name) {
      state.activeFilters = state.activeFilters.filter(f => f.type !== 'promotion');
    }
    if (state.columnFilters.category) {
      state.activeFilters = state.activeFilters.filter(f => f.type !== 'category');
    }
    if (state.columnFilters.dealType) {
      state.activeFilters = state.activeFilters.filter(f => f.type !== 'deal');
    }

    // Add column filters as chips
    if (state.columnFilters.name) {
      state.activeFilters.push({
        type: 'promotion',
        value: state.columnFilters.name,
        label: 'Promotion',
        fromColumn: true
      });
    }

    if (state.columnFilters.category) {
      state.activeFilters.push({
        type: 'category',
        value: state.columnFilters.category,
        label: 'Category',
        fromColumn: true
      });
    }

    if (state.columnFilters.dealType) {
      state.activeFilters.push({
        type: 'deal',
        value: state.columnFilters.dealType,
        label: 'Deal Type',
        fromColumn: true
      });
    }

    renderFilterChips();
  }

  /**
   * Apply column filters to promotions (for table filtering)
   */
  function applyColumnFilters(promotions) {
    let filtered = [...promotions];

    if (state.columnFilters.name) {
      const search = state.columnFilters.name.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(search));
    }

    if (state.columnFilters.category) {
      filtered = filtered.filter(p => p.categoryName === state.columnFilters.category);
    }

    if (state.columnFilters.dealType) {
      filtered = filtered.filter(p => p.dealType === state.columnFilters.dealType);
    }

    return filtered;
  }

  /**
   * Clear all filters
   */
  function clearAllFilters() {
    state.activeFilters = [];
    state.columnFilters = {
      name: null,
      category: null,
      dealType: null
    };
    state.activeCategory = null;
    state.selectedCategoryId = null;

    // Also clear grid mode column filters
    if (state.gridMode && state.gridMode.columnFilters) {
      state.gridMode.columnFilters = {};
    }

    renderFilterChips();
    applyFilters();

    core.saveState();
  }

  /**
   * Add a filter programmatically
   */
  function addFilter(type, value, label, fromColumn = false) {
    // Remove existing filter of same type (single filter per type)
    state.activeFilters = state.activeFilters.filter(f => f.type !== type);

    state.activeFilters.push({
      type,
      value,
      label,
      fromColumn
    });

    renderFilterChips();
    applyFilters();

    core.saveState();
  }

  /**
   * Check if a filter of a specific type exists
   */
  function hasFilter(type) {
    return state.activeFilters.some(f => f.type === type);
  }

  /**
   * Get current filter value for a type
   */
  function getFilterValue(type) {
    const filter = state.activeFilters.find(f => f.type === type);
    return filter ? filter.value : null;
  }

  // =========================================
  // METRICS KEY TOOLTIP SYSTEM
  // =========================================

  /**
   * Initialize metrics key tooltip event listeners
   */
  function initMetricsKeyTooltip() {
    // Use event delegation for dynamically rendered content
    document.addEventListener('click', handleTooltipClick);
    document.addEventListener('keydown', handleTooltipKeydown);
    window.addEventListener('resize', closeAllTooltips, { passive: true });
  }

  /**
   * Handle click events for tooltip
   */
  function handleTooltipClick(e) {
    if (e.target.closest('.metrics-key-btn')) {
      e.preventDefault();
      e.stopPropagation();
      const btn = e.target.closest('.metrics-key-btn');
      toggleMetricsKeyTooltip(btn);
    } else {
      // Close tooltips when clicking outside
      closeAllTooltips();
    }
  }

  /**
   * Handle keyboard events for tooltip
   */
  function handleTooltipKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      if (e.target.classList.contains('metrics-key-btn')) {
        e.preventDefault();
        toggleMetricsKeyTooltip(e.target);
      }
    } else if (e.key === 'Escape') {
      closeAllTooltips();
    }
  }

  /**
   * Toggle metrics key tooltip
   */
  function toggleMetricsKeyTooltip(btn) {
    const isExpanded = btn.getAttribute('aria-expanded') === 'true';
    closeAllTooltips();

    if (!isExpanded) {
      openMetricsKeyTooltip(btn);
    }
  }

  /**
   * Open metrics key tooltip
   */
  function openMetricsKeyTooltip(btn) {
    const overlay = createMetricsKeyOverlay();
    document.body.appendChild(overlay);

    positionTooltip(btn, overlay);

    btn.setAttribute('aria-expanded', 'true');
    btn.tooltipOverlay = overlay;

    requestAnimationFrame(() => {
      overlay.classList.add('visible');
    });
  }

  /**
   * Create metrics key tooltip overlay HTML
   */
  function createMetricsKeyOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'tooltip-overlay metrics-key-tooltip';
    overlay.setAttribute('role', 'tooltip');
    overlay.setAttribute('aria-hidden', 'false');

    overlay.innerHTML = `
      <div class="tooltip-title">Performance Metrics Key</div>
      <div class="metrics-key-list">
        <div class="metrics-key-item">
          <div class="metrics-key-row">
            <span class="metrics-key-swatch" style="background:${METRIC_DEFINITIONS.views.color}"></span>
            <span class="metrics-key-name">${METRIC_DEFINITIONS.views.name}</span>
            <span class="metrics-key-weight">${METRIC_DEFINITIONS.views.weight}</span>
          </div>
          <div class="metrics-key-desc">${METRIC_DEFINITIONS.views.description}</div>
        </div>
        <div class="metrics-key-item">
          <div class="metrics-key-row">
            <span class="metrics-key-swatch" style="background:${METRIC_DEFINITIONS.clicks.color}"></span>
            <span class="metrics-key-name">${METRIC_DEFINITIONS.clicks.name}</span>
            <span class="metrics-key-weight">${METRIC_DEFINITIONS.clicks.weight}</span>
          </div>
          <div class="metrics-key-desc">${METRIC_DEFINITIONS.clicks.description}</div>
        </div>
        <div class="metrics-key-item">
          <div class="metrics-key-row">
            <span class="metrics-key-swatch" style="background:${METRIC_DEFINITIONS.adds.color}"></span>
            <span class="metrics-key-name">${METRIC_DEFINITIONS.adds.name}</span>
            <span class="metrics-key-weight">${METRIC_DEFINITIONS.adds.weight}</span>
          </div>
          <div class="metrics-key-desc">${METRIC_DEFINITIONS.adds.description}</div>
        </div>
      </div>
      <div class="metrics-key-divider"></div>
      <div class="metrics-key-formula">
        <span class="metrics-key-formula-label">Performance:</span>
        <span class="metrics-key-formula-value">${METRIC_DEFINITIONS.performance.formula}</span>
      </div>
      <div class="metrics-key-normalization" style="margin-top:8px;padding:8px 10px;background:#f1f5f9;border-radius:4px;font-size:11px;color:#475569;line-height:1.4;">
        Scores are normalized by days run for fair comparison across promotions with different durations.
      </div>
      <div class="metrics-key-item">
        <div class="metrics-key-row">
          <span class="metrics-key-name">${METRIC_DEFINITIONS.percentile.name}</span>
        </div>
        <div class="metrics-key-desc">${METRIC_DEFINITIONS.percentile.description}</div>
      </div>
      <div class="tooltip-why-important">
        <strong>Why this matters:</strong> Higher weights reflect stronger purchase intent. An "Add" is 20× more valuable than a view.
      </div>
    `;

    return overlay;
  }

  /**
   * Position tooltip relative to button
   */
  function positionTooltip(btn, overlay) {
    const btnRect = btn.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Set initial position to measure
    overlay.style.left = '0px';
    overlay.style.top = '0px';

    // Get tooltip dimensions after adding to DOM
    const overlayRect = overlay.getBoundingClientRect();
    const overlayWidth = overlayRect.width;
    const overlayHeight = overlayRect.height;

    let left, top;

    // Try to position below the button first
    if (btnRect.bottom + overlayHeight + 10 <= viewportHeight) {
      top = btnRect.bottom + 8;
      left = btnRect.left + (btnRect.width / 2) - 32;
    }
    // Try above if no room below
    else if (btnRect.top - overlayHeight - 10 >= 0) {
      top = btnRect.top - overlayHeight - 8;
      left = btnRect.left + (btnRect.width / 2) - 32;
      overlay.classList.add('position-top');
    }
    // Fallback: position below but adjust
    else {
      top = btnRect.bottom + 8;
      left = Math.max(10, Math.min(viewportWidth - overlayWidth - 10, btnRect.left));
    }

    // Ensure tooltip stays within viewport
    left = Math.max(10, Math.min(viewportWidth - overlayWidth - 10, left));
    top = Math.max(10, Math.min(viewportHeight - overlayHeight - 10, top));

    overlay.style.left = left + 'px';
    overlay.style.top = top + 'px';
  }

  /**
   * Close all open tooltips
   */
  function closeAllTooltips() {
    document.querySelectorAll('.tooltip-overlay').forEach(overlay => {
      overlay.classList.remove('visible');
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }, 200);
    });

    document.querySelectorAll('.metrics-key-btn[aria-expanded="true"]').forEach(btn => {
      btn.setAttribute('aria-expanded', 'false');
      btn.tooltipOverlay = null;
    });
  }

  /**
   * Get HTML for metrics key info button
   */
  function getMetricsKeyButtonHTML() {
    return `
      <button class="info-btn metrics-key-btn"
              aria-label="Show metrics key"
              aria-expanded="false"
              tabindex="0">
        <span aria-hidden="true">i</span>
      </button>
    `;
  }

  /* ============================================
     PUBLIC API
     ============================================ */
  return {
    init,
    setRenderCallbacks,

    // Core functions
    renderFilterChips,
    removeFilter,
    applyFilters,
    handleColumnFilter,
    syncColumnFiltersToChips,
    applyColumnFilters,

    // Utility functions
    clearAllFilters,
    addFilter,
    hasFilter,
    getFilterValue,

    // Metrics Key Tooltip
    initMetricsKeyTooltip,
    getMetricsKeyButtonHTML,
    closeAllTooltips,
    METRIC_DEFINITIONS
  };
})();

// Make available globally
window.DashboardFilters = DashboardFilters;

// Legacy function exports for onclick handlers
window.removeFilter = (index) => DashboardFilters.removeFilter(index);
