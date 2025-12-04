/**
 * SHARED MODALS - Modal Dialogs for Analytics Dashboard
 * Multi-Page Architecture
 *
 * Contains:
 * - Date Picker Modal
 * - Entity Selector Modal
 * - Add Filter Modal
 */

const DashboardModals = (() => {
  'use strict';

  // Reference to core module
  let core = null;
  let state = null;
  let elements = null;

  /**
   * Initialize modals with core references
   */
  function init(dashboardCore) {
    core = dashboardCore;
    state = core.getState();
    elements = core.getElements();

    // Initialize expanded nodes for entity tree
    if (!state.expandedNodes) {
      state.expandedNodes = { 'all': true };
    }
  }

  /* ============================================
     DATE PICKER MODAL
     ============================================ */

  // Track which context (A or B) the modal is targeting for compare mode
  let _modalTarget = null; // 'A', 'B', or null for base mode

  // Track selected year for week filtering
  let _selectedYear = new Date().getFullYear();

  /**
   * Get available years from the weeks data
   */
  function getAvailableYears() {
    const weeks = core.getExtendedWeeks();
    const years = new Set();

    weeks.forEach(week => {
      // Extract year from dateRange (e.g., "Nov 25 - Dec 1, 2025")
      const match = week.dateRange.match(/\d{4}/);
      if (match) {
        years.add(parseInt(match[0], 10));
      }
    });

    // Return sorted years in descending order (most recent first)
    return Array.from(years).sort((a, b) => b - a);
  }

  /**
   * Change selected year and re-render week list
   */
  function selectYear(year) {
    _selectedYear = parseInt(year, 10);
    const yearSelect = document.getElementById('week-year-select');
    if (yearSelect) yearSelect.value = _selectedYear;
    renderWeekList();
  }

  function openDatePicker(target = null) {
    _modalTarget = target;
    const modal = elements.datePickerModal || document.getElementById('date-picker-modal');
    if (modal) {
      modal.classList.add('active');
      switchDateTab('week');
      const searchInput = document.getElementById('week-search-input');
      if (searchInput) searchInput.value = '';

      // Reset to current year and render
      _selectedYear = new Date().getFullYear();
      renderYearSelector();
      renderWeekList();
    }
  }

  /**
   * Render year selector dropdown
   */
  function renderYearSelector() {
    const container = document.getElementById('week-year-selector');
    if (!container) return;

    const years = getAvailableYears();

    const html = `
      <select id="week-year-select" class="year-select" onchange="DashboardModals.selectYear(this.value)">
        ${years.map(year => `
          <option value="${year}" ${year === _selectedYear ? 'selected' : ''}>${year}</option>
        `).join('')}
      </select>
    `;

    container.innerHTML = html;
  }

  function closeDatePicker() {
    const modal = elements.datePickerModal || document.getElementById('date-picker-modal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  function switchDateTab(tabName) {
    document.querySelectorAll('.date-picker-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    document.querySelectorAll('.date-tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `${tabName}-tab-content`);
    });
  }

  function filterWeeks(searchValue) {
    renderWeekList(searchValue);
  }

  function selectWeek(weekId) {
    state.selectedWeekId = weekId;

    document.querySelectorAll('.week-option').forEach(el => {
      el.classList.toggle('selected', el.dataset.weekId === weekId);
    });
  }

  function renderWeekList(searchQuery = '') {
    const weekList = document.getElementById('week-list');
    if (!weekList) return;

    const weeks = core.getExtendedWeeks();
    const query = searchQuery.toLowerCase().trim();

    // Filter by selected year first
    let filteredWeeks = weeks.filter(week => {
      const match = week.dateRange.match(/\d{4}/);
      return match && parseInt(match[0], 10) === _selectedYear;
    });

    // Then filter by search query if provided
    if (query) {
      filteredWeeks = filteredWeeks.filter(week =>
        week.label.toLowerCase().includes(query) ||
        week.dateRange.toLowerCase().includes(query)
      );
    }

    // Sort by week number descending (most recent first)
    filteredWeeks.sort((a, b) => b.num - a.num);

    const weeksHTML = filteredWeeks.map(week => {
      const isSelected = week.id === state.selectedWeekId;
      return `
        <div class="week-option ${isSelected ? 'selected' : ''}"
             data-week-id="${week.id}"
             onclick="DashboardModals.selectWeek('${week.id}')">
          <div class="week-option-left">
            <div class="week-option-label">${week.label}</div>
            <div class="week-option-dates">${week.dateRange}</div>
          </div>
          <div class="week-option-check">
            <span class="material-symbols-outlined">check</span>
          </div>
        </div>
      `;
    }).join('');

    weekList.innerHTML = weeksHTML || '<div class="week-option" style="text-align:center;color:var(--color-text-tertiary);">No weeks found for ' + _selectedYear + '</div>';
  }

  function applyDateSelection() {
    const customTab = document.querySelector('.date-picker-tab[data-tab="custom"]');
    const isCustomRange = customTab && customTab.classList.contains('active');

    // Get the week info
    let weekId = state.selectedWeekId;
    let weekLabel = '';
    let weekRange = '';

    if (isCustomRange) {
      const startDate = document.getElementById('custom-start-date')?.value;
      const endDate = document.getElementById('custom-end-date')?.value;

      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const options = { month: 'short', day: 'numeric' };
        weekRange = `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}, ${end.getFullYear()}`;
        weekLabel = 'Custom Range';
        weekId = 'custom';
      }
    } else {
      const week = typeof MockData !== 'undefined' ? MockData.weeks.find(w => w.id === state.selectedWeekId) : null;
      if (week) {
        weekLabel = week.label;
        weekRange = week.dateRange;
      }
    }

    // Check if we're in compare mode (A or B target)
    if (_modalTarget === 'A' || _modalTarget === 'B') {
      // Dispatch compare-specific event
      document.dispatchEvent(new CustomEvent('compare:dateSelected', {
        detail: {
          target: _modalTarget,
          weekId: weekId,
          weekLabel: weekLabel,
          weekRange: weekRange
        }
      }));
      closeDatePicker();
      _modalTarget = null;
      return;
    }

    // Base mode behavior
    if (isCustomRange) {
      const dateCard = elements.dateSelector || document.getElementById('date-selector');
      if (dateCard) {
        const valueEl = dateCard.querySelector('.card-value');
        const subEl = dateCard.querySelector('.card-sub');
        if (valueEl) valueEl.textContent = weekLabel;
        if (subEl) subEl.textContent = weekRange;
      }
      state.selectedWeekId = 'custom';
    } else {
      core.updateDateDisplay();
    }

    closeDatePicker();
    refreshDataForDateChange();
    core.saveState();
  }

  async function refreshDataForDateChange() {
    if (typeof MockData === 'undefined') return;

    if (state.selectedWeekId && state.selectedWeekId.startsWith('week-')) {
      const weekNum = parseInt(state.selectedWeekId.replace('week-', ''), 10);
      if (!isNaN(weekNum)) {
        MockData.setWeek(weekNum);
      }
    }

    state.categories = MockData.categories || [];
    state.filteredCategories = [...state.categories];
    state.allPromotions = MockData.promotions || [];
    state.filteredPromotions = [...state.allPromotions];

    // Trigger re-render via event
    document.dispatchEvent(new CustomEvent('dashboard:dataRefresh', {
      detail: { source: 'dateChange' }
    }));
  }

  /* ============================================
     ENTITY SELECTOR MODAL
     ============================================ */

  function openEntitySelector(target = null) {
    _modalTarget = target;
    const modal = elements.entitySelectorModal || document.getElementById('entity-selector-modal');
    if (modal) {
      modal.classList.add('active');
      switchEntityTab('nodes');
      const entitySearch = document.getElementById('entity-search-input');
      const groupSearch = document.getElementById('group-search-input');
      if (entitySearch) entitySearch.value = '';
      if (groupSearch) groupSearch.value = '';
      renderEntityTree();
      renderGroupList();
    }
  }

  function closeEntitySelector() {
    const modal = elements.entitySelectorModal || document.getElementById('entity-selector-modal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  function switchEntityTab(tabName) {
    document.querySelectorAll('.entity-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    document.querySelectorAll('.entity-tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `${tabName}-tab-content`);
    });
  }

  function filterEntities(searchValue) {
    renderEntityTree(searchValue);
  }

  function filterGroups(searchValue) {
    renderGroupList(searchValue);
  }

  function renderEntityTree(searchQuery = '') {
    const tbody = document.getElementById('entity-tree-body');
    if (!tbody || typeof MockData === 'undefined' || !MockData.entities) return;

    const query = searchQuery.toLowerCase().trim();
    let html = '';

    const matchesSearch = (text) => !query || (text && text.toLowerCase().includes(query));

    if (!state.expandedNodes) {
      state.expandedNodes = { 'all': true };
    }

    const isAllExpanded = state.expandedNodes['all'] !== false;
    const isAllSelected = state.selectedEntityId === 'all';
    const totalStoreCount = MockData.entities.stores.length;

    if (matchesSearch('All') || !query) {
      html += `
        <tr class="tree-row--brand ${isAllSelected ? 'selected' : ''}"
            data-entity-id="all"
            data-level="all"
            onclick="DashboardModals.selectTreeEntity('all', 'all', 'All Stores', ${totalStoreCount})">
          <td class="tree-indent-0">
            <div class="tree-name-cell">
              <button class="tree-toggle ${isAllExpanded ? '' : 'collapsed'}" onclick="DashboardModals.toggleTreeRow('all', event)">
                <span class="material-symbols-outlined">expand_more</span>
              </button>
              <span>All Stores</span>
            </div>
          </td>
          <td><span class="type-badge type-badge--brand">All</span></td>
          <td></td>
          <td>all</td>
          <td>${totalStoreCount}</td>
        </tr>
      `;
    }

    MockData.entities.brands.forEach(brand => {
      const isBrandExpanded = state.expandedNodes[brand.id] !== false;
      const isBrandSelected = state.selectedEntityId === brand.id;
      const brandHidden = !isAllExpanded ? 'tree-row-hidden' : '';

      if (matchesSearch(brand.name) || !query) {
        html += `
          <tr class="tree-row--brand ${isBrandSelected ? 'selected' : ''} ${brandHidden}"
              data-entity-id="${brand.id}"
              data-level="brand"
              onclick="DashboardModals.selectTreeEntity('${brand.id}', 'brand', '${core.escapeHtml(brand.name)}', ${brand.storeCount})">
            <td class="tree-indent-1">
              <div class="tree-name-cell">
                <button class="tree-toggle ${isBrandExpanded ? '' : 'collapsed'}" onclick="DashboardModals.toggleTreeRow('${brand.id}', event)">
                  <span class="material-symbols-outlined">expand_more</span>
                </button>
                <span>${core.escapeHtml(brand.name)}</span>
              </div>
            </td>
            <td><span class="type-badge type-badge--brand">Brand</span></td>
            <td></td>
            <td>${brand.id}</td>
            <td>${brand.storeCount}</td>
          </tr>
        `;
      }

      const brandSubBrands = MockData.entities.subBrands.filter(sb => sb.brandId === brand.id);
      brandSubBrands.forEach(subBrand => {
        const stores = MockData.entities.stores.filter(s => s.subBrand === subBrand.id);
        const subBrandMatches = matchesSearch(subBrand.name);
        const matchingStores = query ? stores.filter(s =>
          matchesSearch(s.name) || matchesSearch(s.title)
        ) : stores;
        const hasMatchingChildren = matchingStores.length > 0;

        if (subBrandMatches || hasMatchingChildren || !query) {
          const isSubExpanded = state.expandedNodes[subBrand.id] !== false;
          const isSubSelected = state.selectedEntityId === subBrand.id;
          const subHidden = (!isAllExpanded || !isBrandExpanded) ? 'tree-row-hidden' : '';

          html += `
            <tr class="tree-row--subbrand ${isSubSelected ? 'selected' : ''} ${subHidden}"
                data-entity-id="${subBrand.id}"
                data-level="subbrand"
                onclick="DashboardModals.selectTreeEntity('${subBrand.id}', 'sub-brand', '${core.escapeHtml(subBrand.name)}', ${subBrand.storeCount})">
              <td class="tree-indent-2">
                <div class="tree-name-cell">
                  <button class="tree-toggle ${isSubExpanded ? '' : 'collapsed'}" onclick="DashboardModals.toggleTreeRow('${subBrand.id}', event)">
                    <span class="material-symbols-outlined">expand_more</span>
                  </button>
                  <span>${core.escapeHtml(subBrand.name)}</span>
                </div>
              </td>
              <td><span class="type-badge type-badge--subbrand">SubBrand</span></td>
              <td></td>
              <td>${subBrand.id}</td>
              <td>${subBrand.storeCount}</td>
            </tr>
          `;

          const storesToShow = query && !subBrandMatches ? matchingStores : stores;
          storesToShow.forEach(store => {
            const isStoreSelected = state.selectedEntityId === store.id;
            const storeHidden = (!isAllExpanded || !isBrandExpanded || !isSubExpanded) ? 'tree-row-hidden' : '';

            html += `
              <tr class="tree-row--store ${isStoreSelected ? 'selected' : ''} ${storeHidden}"
                  data-entity-id="${store.id}"
                  data-level="store"
                  onclick="DashboardModals.selectTreeEntity('${store.id}', 'store', '${core.escapeHtml(store.title)}', 1)">
                <td class="tree-indent-3">
                  <div class="tree-name-cell">
                    <span class="tree-toggle-placeholder"></span>
                    <span>${core.escapeHtml(store.name)}</span>
                  </div>
                </td>
                <td><span class="type-badge type-badge--store">Store</span></td>
                <td class="tree-address-cell" title="${core.escapeHtml(store.address || '')}">${core.escapeHtml(store.address || '')}</td>
                <td>${subBrand.id}</td>
                <td>${store.storeNumber}</td>
              </tr>
            `;
          });
        }
      });
    });

    if (!html) {
      html = `
        <tr>
          <td colspan="5" style="text-align: center; padding: var(--space-8); color: var(--color-text-tertiary);">
            <div style="font-size: 32px; margin-bottom: var(--space-2);">&#128269;</div>
            <div>No entities match "${core.escapeHtml(query)}"</div>
          </td>
        </tr>
      `;
    }

    tbody.innerHTML = html;
  }

  function toggleTreeRow(entityId, event) {
    event.stopPropagation();

    if (!state.expandedNodes) state.expandedNodes = {};
    state.expandedNodes[entityId] = state.expandedNodes[entityId] === false ? true : false;

    const searchInput = document.getElementById('entity-search-input');
    renderEntityTree(searchInput ? searchInput.value : '');
  }

  function selectTreeEntity(entityId, level, name, count) {
    state.selectedEntityId = entityId;
    state.currentEntity = { id: entityId, level: level, name: name, count: count };

    document.querySelectorAll('#entity-tree-body tr').forEach(row => {
      row.classList.toggle('selected', row.dataset.entityId === entityId);
    });

    document.querySelectorAll('.group-item').forEach(el => {
      el.classList.remove('selected');
    });
  }

  function renderGroupList(searchQuery = '') {
    const groupList = document.getElementById('group-list');
    if (!groupList || typeof MockData === 'undefined' || !MockData.entities.groups) return;

    const groups = MockData.entities.groups;
    const query = searchQuery.toLowerCase().trim();

    const filteredGroups = query
      ? groups.filter(group =>
          group.name.toLowerCase().includes(query) ||
          group.description.toLowerCase().includes(query)
        )
      : groups;

    if (filteredGroups.length === 0) {
      groupList.innerHTML = `
        <div class="group-empty">
          <div class="group-empty-icon">&#128193;</div>
          <p class="group-empty-text">${query ? 'No groups match your search' : 'No custom groups created yet'}</p>
        </div>
      `;
      return;
    }

    const groupsHTML = filteredGroups.map(group => {
      const isSelected = state.selectedEntityId === group.id;
      const iconClass = group.type === 'brand-group' ? 'group-icon--subbrand-group' : 'group-icon--store-group';
      const icon = group.type === 'brand-group' ? 'workspaces' : 'folder_special';

      return `
        <div class="group-item ${isSelected ? 'selected' : ''}"
             data-group-id="${group.id}"
             onclick="DashboardModals.selectGroup('${group.id}')">
          <div class="group-icon ${iconClass}">
            <span class="material-symbols-outlined">${icon}</span>
          </div>
          <div class="group-info">
            <div class="group-name">${core.escapeHtml(group.name)}</div>
            <div class="group-meta">${group.storeCount} stores - ${core.escapeHtml(group.description)}</div>
          </div>
          <div class="group-check">
            <span class="material-symbols-outlined">check</span>
          </div>
        </div>
      `;
    }).join('');

    groupList.innerHTML = groupsHTML;
  }

  function selectGroup(groupId) {
    if (typeof MockData === 'undefined') return;
    const group = MockData.entities.groups.find(g => g.id === groupId);
    if (!group) return;

    state.selectedEntityId = groupId;
    state.currentEntity = {
      id: groupId,
      level: group.type,
      name: group.name,
      count: group.storeCount,
      storeIds: group.storeIds
    };

    document.querySelectorAll('.group-item').forEach(el => {
      el.classList.toggle('selected', el.dataset.groupId === groupId);
    });

    document.querySelectorAll('#entity-tree-body tr').forEach(row => {
      row.classList.remove('selected');
    });
  }

  function openCreateGroupModal() {
    alert('Create Group functionality coming soon!\n\nThis will allow you to create custom groups of stores for analysis.');
  }

  function applyEntitySelection() {
    // Check if we're in compare mode (A or B target)
    if (_modalTarget === 'A' || _modalTarget === 'B') {
      // Dispatch compare-specific event
      document.dispatchEvent(new CustomEvent('compare:entitySelected', {
        detail: {
          target: _modalTarget,
          entityId: state.selectedEntityId,
          entityName: state.currentEntity?.name || '',
          entityLevel: state.currentEntity?.level || '',
          entityCount: state.currentEntity?.count || 0
        }
      }));
      closeEntitySelector();
      _modalTarget = null;
      return;
    }

    // Base mode behavior
    core.updateEntityDisplay();
    closeEntitySelector();
    refreshDataForEntityChange();
    core.saveState();
  }

  async function refreshDataForEntityChange() {
    if (typeof MockData === 'undefined') return;

    if (state.currentEntity) {
      MockData.setEntity(
        state.currentEntity.id,
        state.currentEntity.level,
        state.currentEntity.name
      );
    }

    state.categories = MockData.categories || [];
    state.filteredCategories = [...state.categories];
    state.allPromotions = MockData.promotions || [];
    state.filteredPromotions = [...state.allPromotions];

    document.dispatchEvent(new CustomEvent('dashboard:dataRefresh', {
      detail: { source: 'entityChange' }
    }));
  }

  /* ============================================
     FILTER MODAL
     ============================================ */

  function openFilterModal() {
    const modal = elements.addFilterModal || document.getElementById('add-filter-modal');
    if (modal) {
      modal.classList.add('active');
      state.selectedFilterType = 'category';
      state.selectedFilterValue = null;

      document.querySelectorAll('.filter-type-btn').forEach(b => b.classList.remove('active'));
      document.querySelector('[data-type="category"]')?.classList.add('active');
      document.querySelectorAll('.filter-value-select').forEach(s => s.classList.remove('active'));
      document.getElementById('category-options')?.classList.add('active');
      document.querySelectorAll('.filter-option').forEach(o => o.classList.remove('selected'));

      renderFilterOptions();
    }
  }

  function closeFilterModal() {
    const modal = elements.addFilterModal || document.getElementById('add-filter-modal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  function selectFilterType(element) {
    state.selectedFilterType = element.dataset.type;
    state.selectedFilterValue = null;

    document.querySelectorAll('.filter-type-btn').forEach(b => b.classList.remove('active'));
    element.classList.add('active');

    document.querySelectorAll('.filter-value-select').forEach(s => s.classList.remove('active'));
    document.getElementById(`${state.selectedFilterType}-options`)?.classList.add('active');

    document.querySelectorAll('.filter-option').forEach(o => o.classList.remove('selected'));
  }

  function selectFilterOption(element) {
    state.selectedFilterValue = element.dataset.value;

    document.querySelectorAll('.filter-option').forEach(o => o.classList.remove('selected'));
    element.classList.add('selected');
  }

  function renderFilterOptions() {
    const categoryOptions = document.getElementById('category-filter-options');
    if (categoryOptions && state.categories) {
      const html = state.categories.map(cat =>
        `<button class="filter-option" data-value="${cat.id}" onclick="DashboardModals.selectFilterOption(this)">${core.escapeHtml(cat.name)}</button>`
      ).join('');
      categoryOptions.innerHTML = html;
    }

    const dealOptions = document.getElementById('deal-filter-options');
    if (dealOptions) {
      const uniqueDeals = [...new Set(state.allPromotions.map(p => p.dealType))];
      const html = uniqueDeals.map(deal =>
        `<button class="filter-option" data-value="${deal}" onclick="DashboardModals.selectFilterOption(this)">${core.escapeHtml(deal)}</button>`
      ).join('');
      dealOptions.innerHTML = html;
    }

    const sizeOptions = document.getElementById('size-filter-options');
    if (sizeOptions) {
      const uniqueSizes = [...new Set(state.allPromotions.map(p => p.cardSize))];
      const html = uniqueSizes.map(size =>
        `<button class="filter-option" data-value="${size}" onclick="DashboardModals.selectFilterOption(this)">${core.escapeHtml(size)}</button>`
      ).join('');
      sizeOptions.innerHTML = html;
    }
  }

  function applyFilter() {
    if (!state.selectedFilterValue) {
      closeFilterModal();
      return;
    }

    // Build filter object
    let label = 'Filter';
    if (state.selectedFilterType === 'category') {
      const cat = state.categories.find(c => c.id === state.selectedFilterValue);
      label = 'Category';
      state.selectedFilterValue = cat ? cat.id : state.selectedFilterValue;
    } else if (state.selectedFilterType === 'deal') {
      label = 'Deal Type';
    } else if (state.selectedFilterType === 'size') {
      label = 'Card Size';
    }

    const newFilter = {
      type: state.selectedFilterType,
      value: state.selectedFilterValue,
      label: label,
      fromModal: true
    };

    // Remove existing filters of same type (single filter per type)
    state.activeFilters = state.activeFilters.filter(f => f.type !== newFilter.type);
    state.activeFilters.push(newFilter);

    closeFilterModal();

    // Dispatch event for filter application
    document.dispatchEvent(new CustomEvent('dashboard:filterApply', {
      detail: { filter: newFilter }
    }));

    core.saveState();
  }

  /* ============================================
     PUBLIC API
     ============================================ */
  return {
    init,

    // Date Picker
    openDatePicker,
    closeDatePicker,
    switchDateTab,
    filterWeeks,
    selectWeek,
    selectYear,
    applyDateSelection,

    // Entity Selector
    openEntitySelector,
    closeEntitySelector,
    switchEntityTab,
    filterEntities,
    filterGroups,
    renderEntityTree,
    toggleTreeRow,
    selectTreeEntity,
    selectGroup,
    openCreateGroupModal,
    applyEntitySelection,

    // Filter Modal
    openFilterModal,
    closeFilterModal,
    selectFilterType,
    selectFilterOption,
    applyFilter,
    renderFilterOptions
  };
})();

// Make available globally
window.DashboardModals = DashboardModals;

// Legacy function exports for onclick handlers in HTML
window.openDatePicker = (target) => DashboardModals.openDatePicker(target);
window.closeDatePicker = () => DashboardModals.closeDatePicker();
window.switchDateTab = (tab) => DashboardModals.switchDateTab(tab);
window.filterWeeks = (val) => DashboardModals.filterWeeks(val);
window.selectWeek = (id) => DashboardModals.selectWeek(id);
window.applyDateSelection = () => DashboardModals.applyDateSelection();

window.openEntitySelector = (target) => DashboardModals.openEntitySelector(target);
window.closeEntitySelector = () => DashboardModals.closeEntitySelector();
window.switchEntityTab = (tab) => DashboardModals.switchEntityTab(tab);
window.filterEntities = (val) => DashboardModals.filterEntities(val);
window.filterGroups = (val) => DashboardModals.filterGroups(val);
window.toggleTreeRow = (id, e) => DashboardModals.toggleTreeRow(id, e);
window.selectTreeEntity = (id, level, name, count) => DashboardModals.selectTreeEntity(id, level, name, count);
window.selectGroup = (id) => DashboardModals.selectGroup(id);
window.openCreateGroupModal = () => DashboardModals.openCreateGroupModal();
window.applyEntitySelection = () => DashboardModals.applyEntitySelection();

window.openFilterModal = () => DashboardModals.openFilterModal();
window.closeFilterModal = () => DashboardModals.closeFilterModal();
window.selectFilterType = (el) => DashboardModals.selectFilterType(el);
window.selectFilterOption = (el) => DashboardModals.selectFilterOption(el);
window.applyFilter = () => DashboardModals.applyFilter();
