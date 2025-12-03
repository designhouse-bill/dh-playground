/**
 * SHARED FILTERS - Filter Management for Analytics Dashboard
 * Multi-Page Architecture
 *
 * Contains:
 * - Filter chip rendering
 * - Filter application logic
 * - Column filter synchronization
 */

const DashboardFilters = (() => {
  'use strict';

  // Reference to core module
  let core = null;
  let state = null;
  let elements = null;

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
      const colorClass = filter.type === 'category' ? 'filter-chip--category'
                       : filter.type === 'deal' ? 'filter-chip--deal'
                       : filter.type === 'promotion' ? 'filter-chip--promotion'
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
      } else if (filter.type === 'category') {
        state.columnFilters.category = null;
        state.activeCategory = null;
        state.selectedCategoryId = null;
        if (renderCallbacks.renderCategories) {
          renderCallbacks.renderCategories();
        }
      } else if (filter.type === 'deal') {
        state.columnFilters.dealType = null;
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
    getFilterValue
  };
})();

// Make available globally
window.DashboardFilters = DashboardFilters;

// Legacy function exports for onclick handlers
window.removeFilter = (index) => DashboardFilters.removeFilter(index);
