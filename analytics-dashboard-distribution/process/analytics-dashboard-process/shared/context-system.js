/**
 * Context System - Progressive Disclosure Logic
 *
 * HIERARCHY:
 *   Level 0: All Circulars (default view)
 *   Level 1: Category (filtered by category)
 *   Level 2: Promotion (single promotion detail)
 *
 * This module manages:
 * - Current view context and level
 * - Filter chip creation/removal
 * - Drill-down navigation
 * - Breadcrumb generation
 * - Clear all filters
 */

(function() {
  'use strict';

  // View hierarchy levels
  const VIEW_LEVELS = {
    CIRCULAR: 0,      // All circulars - no filters
    CATEGORY: 1,      // Filtered to category
    PROMOTION: 2      // Single promotion
  };

  // Current context state
  let contextState = {
    level: VIEW_LEVELS.CIRCULAR,
    filters: [],
    dateRange: { week: 47, label: 'Week 47', dates: 'Nov 18-24, 2025' },
    entity: { id: 'all', name: 'All Stores', count: 67 }
  };

  // Event callbacks
  let onContextChange = null;

  /**
   * Initialize context system
   */
  function init(options = {}) {
    onContextChange = options.onChange || null;

    // Render initial state
    renderBreadcrumb();
    renderFilterChips();
    renderViewContext();

    // Bind clear all button
    bindClearAllButton();

    console.log('Context System initialized:', contextState);
  }

  /**
   * Get current context state
   */
  function getState() {
    return { ...contextState };
  }

  /**
   * Get current view level
   */
  function getLevel() {
    return contextState.level;
  }

  /**
   * Get level name for display
   */
  function getLevelName(level) {
    switch (level) {
      case VIEW_LEVELS.CIRCULAR: return 'All Circulars';
      case VIEW_LEVELS.CATEGORY: return 'Category';
      case VIEW_LEVELS.PROMOTION: return 'Promotion';
      default: return 'Unknown';
    }
  }

  /**
   * Add a filter (creates chip, updates level)
   */
  function addFilter(type, value, label) {
    // Check if filter already exists
    const existing = contextState.filters.find(f => f.type === type && f.value === value);
    if (existing) return;

    const filter = {
      id: `filter-${Date.now()}`,
      type,
      value,
      label: label || value
    };

    contextState.filters.push(filter);
    updateLevel();
    notifyChange();
    renderFilterChips();
    renderBreadcrumb();
  }

  /**
   * Remove a filter by ID
   */
  function removeFilter(filterId) {
    contextState.filters = contextState.filters.filter(f => f.id !== filterId);
    updateLevel();
    notifyChange();
    renderFilterChips();
    renderBreadcrumb();
  }

  /**
   * Remove filter by type
   */
  function removeFilterByType(type) {
    contextState.filters = contextState.filters.filter(f => f.type !== type);
    updateLevel();
    notifyChange();
    renderFilterChips();
    renderBreadcrumb();
  }

  /**
   * Clear all filters
   */
  function clearAllFilters() {
    contextState.filters = [];
    contextState.level = VIEW_LEVELS.CIRCULAR;
    notifyChange();
    renderFilterChips();
    renderBreadcrumb();
    renderViewContext();
  }

  /**
   * Drill down to category
   */
  function drillToCategory(categoryId, categoryName) {
    // Remove any existing category filter first
    removeFilterByType('category');

    addFilter('category', categoryId, categoryName);
    contextState.level = VIEW_LEVELS.CATEGORY;
    notifyChange();
  }

  /**
   * Drill down to promotion
   */
  function drillToPromotion(promotionId, promotionName) {
    addFilter('promotion', promotionId, promotionName);
    contextState.level = VIEW_LEVELS.PROMOTION;
    notifyChange();
  }

  /**
   * Navigate back to level
   */
  function navigateToLevel(level) {
    if (level === VIEW_LEVELS.CIRCULAR) {
      clearAllFilters();
    } else if (level === VIEW_LEVELS.CATEGORY) {
      removeFilterByType('promotion');
    }
  }

  /**
   * Update date range
   */
  function setDateRange(week, label, dates) {
    contextState.dateRange = { week, label, dates };
    notifyChange();
  }

  /**
   * Update entity selection
   */
  function setEntity(id, name, count) {
    contextState.entity = { id, name, count };
    notifyChange();
  }

  /**
   * Update level based on filters
   */
  function updateLevel() {
    const hasPromotion = contextState.filters.some(f => f.type === 'promotion');
    const hasCategory = contextState.filters.some(f => f.type === 'category');

    if (hasPromotion) {
      contextState.level = VIEW_LEVELS.PROMOTION;
    } else if (hasCategory) {
      contextState.level = VIEW_LEVELS.CATEGORY;
    } else {
      contextState.level = VIEW_LEVELS.CIRCULAR;
    }
  }

  /**
   * Notify listeners of context change
   */
  function notifyChange() {
    if (typeof onContextChange === 'function') {
      onContextChange(getState());
    }

    // Dispatch custom event
    document.dispatchEvent(new CustomEvent('contextChanged', {
      detail: getState()
    }));
  }

  /**
   * Render breadcrumb navigation
   */
  function renderBreadcrumb() {
    const container = document.getElementById('context-breadcrumb');
    if (!container) return;

    const items = ['<span class="breadcrumb__item">'];

    // Always show "All Circulars" as root
    if (contextState.level === VIEW_LEVELS.CIRCULAR) {
      items.push('<span class="breadcrumb__current">All Circulars</span>');
    } else {
      items.push('<a href="#" class="breadcrumb__link" data-level="0">All Circulars</a>');
    }

    items.push('</span>');

    // Add category level if present
    const categoryFilter = contextState.filters.find(f => f.type === 'category');
    if (categoryFilter) {
      items.push('<span class="breadcrumb__separator">›</span>');
      items.push('<span class="breadcrumb__item">');

      if (contextState.level === VIEW_LEVELS.CATEGORY) {
        items.push(`<span class="breadcrumb__current">${categoryFilter.label}</span>`);
      } else {
        items.push(`<a href="#" class="breadcrumb__link" data-level="1">${categoryFilter.label}</a>`);
      }

      items.push('</span>');
    }

    // Add promotion level if present
    const promotionFilter = contextState.filters.find(f => f.type === 'promotion');
    if (promotionFilter) {
      items.push('<span class="breadcrumb__separator">›</span>');
      items.push('<span class="breadcrumb__item">');
      items.push(`<span class="breadcrumb__current">${promotionFilter.label}</span>`);
      items.push('</span>');
    }

    container.innerHTML = items.join('');

    // Bind click handlers
    container.querySelectorAll('.breadcrumb__link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const level = parseInt(link.dataset.level, 10);
        navigateToLevel(level);
      });
    });
  }

  /**
   * Render filter chips
   */
  function renderFilterChips() {
    const container = document.getElementById('filter-chips-container');
    if (!container) return;

    const filterRow = container.closest('.filter-row');

    if (contextState.filters.length === 0) {
      container.innerHTML = '';
      if (filterRow) filterRow.classList.add('filter-row--empty');
      return;
    }

    if (filterRow) filterRow.classList.remove('filter-row--empty');

    const chips = contextState.filters.map(filter => {
      const chipClass = getChipClass(filter.type);

      return `
        <div class="filter-chip ${chipClass}" data-filter-id="${filter.id}">
          <span class="filter-chip__label">${getFilterTypeLabel(filter.type)}:</span>
          <span class="filter-chip__value">${filter.label}</span>
          <button class="filter-chip__remove" data-filter-id="${filter.id}" title="Remove filter">
            <svg class="filter-chip__remove-icon" viewBox="0 0 12 12" fill="currentColor">
              <path d="M3.05 3.05a.75.75 0 011.06 0L6 4.94l1.89-1.89a.75.75 0 111.06 1.06L7.06 6l1.89 1.89a.75.75 0 11-1.06 1.06L6 7.06l-1.89 1.89a.75.75 0 01-1.06-1.06L4.94 6 3.05 4.11a.75.75 0 010-1.06z"/>
            </svg>
          </button>
        </div>
      `;
    }).join('');

    container.innerHTML = chips;

    // Bind remove handlers
    container.querySelectorAll('.filter-chip__remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const filterId = btn.dataset.filterId;
        removeFilter(filterId);
      });
    });
  }

  /**
   * Get chip CSS class based on filter type
   */
  function getChipClass(type) {
    switch (type) {
      case 'category': return 'filter-chip--category';
      case 'date': return 'filter-chip--date';
      case 'entity': return 'filter-chip--entity';
      default: return '';
    }
  }

  /**
   * Get human-readable filter type label
   */
  function getFilterTypeLabel(type) {
    switch (type) {
      case 'category': return 'Category';
      case 'promotion': return 'Promotion';
      case 'dealType': return 'Deal Type';
      case 'size': return 'Card Size';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  }

  /**
   * Render view context indicator
   */
  function renderViewContext() {
    const container = document.getElementById('view-context');
    if (!container) return;

    const levelName = getLevelName(contextState.level);
    const description = getViewDescription();

    container.innerHTML = `
      <div class="view-context__icon">
        ${getViewIcon(contextState.level)}
      </div>
      <div class="view-context__info">
        <div class="view-context__title">${levelName}</div>
        <div class="view-context__description">${description}</div>
      </div>
    `;
  }

  /**
   * Get view description based on current state
   */
  function getViewDescription() {
    const parts = [];

    parts.push(contextState.dateRange.label);
    parts.push(contextState.entity.name);

    const categoryFilter = contextState.filters.find(f => f.type === 'category');
    if (categoryFilter) {
      parts.push(categoryFilter.label);
    }

    return parts.join(' • ');
  }

  /**
   * Get icon SVG for view level
   */
  function getViewIcon(level) {
    switch (level) {
      case VIEW_LEVELS.CIRCULAR:
        return '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>';
      case VIEW_LEVELS.CATEGORY:
        return '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z"/><path d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z"/></svg>';
      case VIEW_LEVELS.PROMOTION:
        return '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"/></svg>';
      default:
        return '';
    }
  }

  /**
   * Bind clear all button
   */
  function bindClearAllButton() {
    const btn = document.getElementById('clear-all-filters');
    if (btn) {
      btn.addEventListener('click', clearAllFilters);
    }
  }

  /**
   * Create drill action HTML
   */
  function createDrillAction(type, id, label) {
    return `
      <button class="drill-action" data-drill-type="${type}" data-drill-id="${id}" data-drill-label="${label}">
        <span>View ${type === 'category' ? 'Promotions' : 'Details'}</span>
        <svg class="drill-action__icon" viewBox="0 0 12 12" fill="currentColor">
          <path d="M4.5 2L8.5 6L4.5 10" stroke="currentColor" stroke-width="1.5" fill="none"/>
        </svg>
      </button>
    `;
  }

  /**
   * Bind drill actions to table/list items
   */
  function bindDrillActions() {
    document.querySelectorAll('.drill-action').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const type = btn.dataset.drillType;
        const id = btn.dataset.drillId;
        const label = btn.dataset.drillLabel;

        if (type === 'category') {
          drillToCategory(id, label);
        } else if (type === 'promotion') {
          drillToPromotion(id, label);
        }
      });
    });
  }

  // Public API
  window.ContextSystem = {
    init,
    getState,
    getLevel,
    getLevelName,
    addFilter,
    removeFilter,
    removeFilterByType,
    clearAllFilters,
    drillToCategory,
    drillToPromotion,
    navigateToLevel,
    setDateRange,
    setEntity,
    createDrillAction,
    bindDrillActions,
    VIEW_LEVELS
  };

})();
