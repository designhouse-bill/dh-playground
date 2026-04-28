/**
 * Distribution Modals — Date Picker, Entity Selector, Filter Stub
 * Wired to DistributionData + DistributionEntities (not DashboardCore).
 *
 * Pattern matches js/shared-modals.js but standalone for Distribution tab.
 */

const DistributionModals = (function() {
  'use strict';

  const D = typeof DistributionData !== 'undefined' ? DistributionData : null;
  const E = typeof DistributionEntities !== 'undefined' ? DistributionEntities : null;

  let _initialized = false;
  let _selectedWeekId = (D && D.LATEST_WEEK_ID) || 'wk2';
  let _selectedEntityId = 'all';
  let _selectedEntityLevel = 'all';
  let _selectedEntityName = 'All Stores';
  let _expandedNodes = { 'all': true };
  let _treeView = 'stores'; // hierarchy is now Ideal → Brand → Store; sub-brands removed

  // ========================================
  // Modal Infrastructure
  // ========================================

  function ensureModalsContainer() {
    if (_initialized) return;
    const container = document.getElementById('modals-container');
    if (!container) return;

    container.innerHTML = getDatePickerHTML() + getEntitySelectorHTML() + getFilterModalHTML();
    _initialized = true;

    // Close on overlay click
    container.querySelectorAll('.dist-modal-overlay').forEach(function(overlay) {
      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
          overlay.classList.remove('active');
        }
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeAllModals();
      }
    });
  }

  function closeAllModals() {
    document.querySelectorAll('.dist-modal-overlay').forEach(function(m) {
      m.classList.remove('active');
    });
  }

  // ========================================
  // DATE PICKER
  // ========================================

  function getDatePickerHTML() {
    return '' +
      '<div class="dist-modal-overlay" id="dist-date-modal">' +
        '<div class="dist-modal-content">' +
          '<div class="dist-modal-header">' +
            '<h3>Select Date Range</h3>' +
            '<button class="dist-modal-close" onclick="DistributionModals.closeDatePicker()">' +
              '<span class="material-symbols-outlined">close</span>' +
            '</button>' +
          '</div>' +
          '<div class="dist-modal-body">' +
            '<div class="dist-week-list" id="dist-week-list"></div>' +
          '</div>' +
          '<div class="dist-modal-footer">' +
            '<button class="dist-btn dist-btn--secondary" onclick="DistributionModals.closeDatePicker()">Cancel</button>' +
            '<button class="dist-btn dist-btn--primary" onclick="DistributionModals.applyDateSelection()">Apply</button>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function openDatePicker() {
    ensureModalsContainer();
    var ctx = D ? D.context : {};
    _selectedWeekId = ctx.flightWeek || 'all';
    renderWeekList();
    var modal = document.getElementById('dist-date-modal');
    if (modal) modal.classList.add('active');
  }

  function closeDatePicker() {
    var modal = document.getElementById('dist-date-modal');
    if (modal) modal.classList.remove('active');
  }

  function renderWeekList() {
    var list = document.getElementById('dist-week-list');
    if (!list || !D) return;

    var weeks = D.flightWeeks;
    var html = '';

    // "All Weeks" option
    html += '<div class="dist-week-option' + (_selectedWeekId === 'all' ? ' selected' : '') + '" ' +
      'data-week-id="all" onclick="DistributionModals.selectWeek(\'all\')">' +
      '<div class="dist-week-option__left">' +
        '<div class="dist-week-option__label">All Weeks</div>' +
        '<div class="dist-week-option__dates">' + weeks[0].start + ' — ' + weeks[weeks.length - 1].end + '</div>' +
        '<div class="dist-week-option__sub">Campaign totals · ' + weeks.length + ' weeks</div>' +
      '</div>' +
      '<div class="dist-week-option__check">' +
        '<span class="material-symbols-outlined">check</span>' +
      '</div>' +
    '</div>';

    // Individual weeks
    weeks.forEach(function(week) {
      var isSelected = _selectedWeekId === week.id;
      html += '<div class="dist-week-option' + (isSelected ? ' selected' : '') + '" ' +
        'data-week-id="' + week.id + '" onclick="DistributionModals.selectWeek(\'' + week.id + '\')">' +
        '<div class="dist-week-option__left">' +
          '<div class="dist-week-option__label">' + week.label + '</div>' +
          '<div class="dist-week-option__dates">' + week.start + ' — ' + week.end + '</div>' +
        '</div>' +
        '<div class="dist-week-option__check">' +
          '<span class="material-symbols-outlined">check</span>' +
        '</div>' +
      '</div>';
    });

    list.innerHTML = html;
  }

  function selectWeek(weekId) {
    _selectedWeekId = weekId;
    renderWeekList();
  }

  function applyDateSelection() {
    if (!D) return;

    D.setFlightWeek(_selectedWeekId);

    // Update header display — initContext handles this on refresh
    // No need to call HeaderComponent separately

    closeDatePicker();
    dispatchRefresh('dateChange');
  }

  // ========================================
  // ENTITY SELECTOR
  // ========================================

  function getEntitySelectorHTML() {
    return '' +
      '<div class="dist-modal-overlay" id="dist-entity-modal">' +
        '<div class="dist-modal-content dist-modal-content--wide">' +
          '<div class="dist-modal-header">' +
            '<h3>Select Entity</h3>' +
            '<button class="dist-modal-close" onclick="DistributionModals.closeEntitySelector()">' +
              '<span class="material-symbols-outlined">close</span>' +
            '</button>' +
          '</div>' +
          '<div class="dist-modal-body">' +
            '<div class="dist-entity-toolbar">' +
              '<div class="dist-entity-search">' +
                '<span class="material-symbols-outlined">search</span>' +
                '<input type="text" id="dist-entity-search-input" placeholder="Search stores, brands..." ' +
                  'oninput="DistributionModals.filterEntityTree(this.value)">' +
              '</div>' +
              '<div class="dist-entity-view-toggle">' +
                '<button class="dist-view-btn active" id="dist-view-groups" onclick="DistributionModals.setTreeView(\'groups\')">' +
                  '<span class="material-symbols-outlined">folder</span> Groups' +
                '</button>' +
                '<button class="dist-view-btn" id="dist-view-stores" onclick="DistributionModals.setTreeView(\'stores\')">' +
                  '<span class="material-symbols-outlined">store</span> Stores' +
                '</button>' +
              '</div>' +
            '</div>' +
            '<div class="dist-entity-tree" id="dist-entity-tree"></div>' +
          '</div>' +
          '<div class="dist-modal-footer">' +
            '<button class="dist-btn dist-btn--secondary" onclick="DistributionModals.closeEntitySelector()">Cancel</button>' +
            '<button class="dist-btn dist-btn--primary" onclick="DistributionModals.applyEntitySelection()">Apply</button>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function openEntitySelector() {
    ensureModalsContainer();
    var ctx = D ? D.context : {};
    _selectedEntityId = ctx.entityId || 'all';
    _selectedEntityLevel = ctx.entityLevel || 'all';
    _selectedEntityName = ctx.entityName || 'All Stores';
    var searchInput = document.getElementById('dist-entity-search-input');
    if (searchInput) searchInput.value = '';
    renderEntityTree();
    var modal = document.getElementById('dist-entity-modal');
    if (modal) modal.classList.add('active');
  }

  function closeEntitySelector() {
    var modal = document.getElementById('dist-entity-modal');
    if (modal) modal.classList.remove('active');
  }

  function setTreeView(view) {
    _treeView = view;
    // Update toggle button states
    var groupsBtn = document.getElementById('dist-view-groups');
    var storesBtn = document.getElementById('dist-view-stores');
    if (groupsBtn) groupsBtn.classList.toggle('active', view === 'groups');
    if (storesBtn) storesBtn.classList.toggle('active', view === 'stores');
    var searchInput = document.getElementById('dist-entity-search-input');
    renderEntityTree(searchInput ? searchInput.value : '');
  }

  function renderEntityTree(filter) {
    var tree = document.getElementById('dist-entity-tree');
    if (!tree || !E) return;

    var html = '';
    var query = (filter || '').toLowerCase().trim();

    // Level 1: Ideal (All Stores) — top retailer container
    var allSelected = _selectedEntityId === 'all';
    var topName = (E.retailerConfig && E.retailerConfig.name) || 'All Stores';
    html += treeRow('all', 'all', topName, E.stores.length + ' stores', 0, allSelected, true);

    // Level 2: Brands (SEG, UNFI, Houchen's, Lunds, Gelson's, MDI, Agne)
    E.brands.forEach(function(brand) {
      var brandStores = E.getStoresForEntity(brand.id, 'brand');
      var brandExpanded = !!_expandedNodes[brand.id];
      var brandSelected = _selectedEntityId === brand.id;

      if (query) {
        var brandMatch = brand.name.toLowerCase().includes(query);
        var childMatch = brand.stores.some(function(store) {
          return storeMatchesQuery(store, query);
        });
        if (!brandMatch && !childMatch) return;
        brandExpanded = true;
      }

      html += treeRow(brand.id, 'brand', brand.name, brandStores.length + ' stores', 1, brandSelected, brandExpanded);

      // Level 3: Stores under brand (grandchildren)
      if (brandExpanded) {
        renderStoreRows(brandStores, 2, query, function(row) { html += row; });
      }
    });

    tree.innerHTML = html;
  }

  function storeMatchesQuery(store, query) {
    var name = (store.name || '').toLowerCase();
    var city = (store.city || '').toLowerCase();
    var num = store.storeNumber != null ? String(store.storeNumber) : '';
    return name.includes(query) || city.includes(query) || num.includes(query);
  }

  function renderStoreRows(storeIds, depth, query, append) {
    storeIds.forEach(function(storeId) {
      var store = E.getStoreById(storeId);
      if (!store) return;

      if (query && !storeMatchesQuery(store, query)) return;

      var storeSelected = _selectedEntityId === store.id;
      var paddingLeft = depth * 24 + 16;
      var storeNumLabel = store.storeNumber != null ? 'Store ' + store.storeNumber : store.name;
      var storeCity = store.city || '';
      var storeFullName = store.storeNumber != null
        ? 'Store ' + store.storeNumber + ' (' + store.name + ')'
        : store.name;
      var clickLabel = (storeNumLabel + (storeCity ? ' · ' + storeCity : '')).replace(/'/g, "\\'");
      append(
        '<div class="dist-tree-row dist-tree-row--store' + (storeSelected ? ' selected' : '') + '" ' +
          'style="padding-left: ' + paddingLeft + 'px;" ' +
          'onclick="DistributionModals.selectEntity(\'' + store.id + '\', \'store\', \'' + clickLabel + '\')">' +
          '<span class="material-symbols-outlined" style="font-size: 16px; color: var(--color-text-tertiary);">store</span>' +
          '<div class="dist-tree-row__content">' +
            '<span class="dist-tree-row__name">' + storeFullName + '</span>' +
            '<span class="dist-tree-row__meta">' + storeCity + '</span>' +
          '</div>' +
          '<div class="dist-tree-row__check"><span class="material-symbols-outlined">check</span></div>' +
        '</div>'
      );
    });
  }

  function treeRow(id, level, name, meta, depth, selected, expanded) {
    var hasChildren = level !== 'store';
    var icon = expanded ? 'expand_more' : 'chevron_right';
    var paddingLeft = depth * 24 + 16;

    return '<div class="dist-tree-row' + (selected ? ' selected' : '') + '" style="padding-left: ' + paddingLeft + 'px;">' +
      (hasChildren
        ? '<span class="dist-tree-toggle material-symbols-outlined" onclick="event.stopPropagation(); DistributionModals.toggleNode(\'' + id + '\')">' + icon + '</span>'
        : '<span style="width: 24px; display: inline-block;"></span>') +
      '<div class="dist-tree-row__content" onclick="DistributionModals.selectEntity(\'' + id + '\', \'' + level + '\', \'' + name.replace(/'/g, "\\'") + '\')">' +
        '<span class="dist-tree-row__name">' + name + '</span>' +
        '<span class="dist-tree-row__meta">' + meta + '</span>' +
      '</div>' +
      '<div class="dist-tree-row__check"><span class="material-symbols-outlined">check</span></div>' +
    '</div>';
  }

  function toggleNode(nodeId) {
    _expandedNodes[nodeId] = !_expandedNodes[nodeId];
    renderEntityTree();
  }

  function selectEntity(id, level, name) {
    _selectedEntityId = id;
    _selectedEntityLevel = level;
    _selectedEntityName = name;
    renderEntityTree();
  }

  function filterEntityTree(query) {
    renderEntityTree(query);
  }

  function applyEntitySelection() {
    if (!D) return;

    D.setEntity(_selectedEntityId, _selectedEntityLevel, _selectedEntityName);

    // Update header display
    if (typeof HeaderComponent !== 'undefined') {
      var storeCount = E ? E.getStoresForEntity(_selectedEntityId, _selectedEntityLevel).length : 0;
      var levelLabel = _selectedEntityLevel === 'all' ? 'RETAILER'
        : _selectedEntityLevel === 'brand' ? 'BRAND'
        : 'STORE';
      var subtext = storeCount + ' store' + (storeCount !== 1 ? 's' : '');
      if (_selectedEntityLevel === 'all') {
        subtext += ' · ' + (D.retailerConfig ? D.retailerConfig.pilotLabel : '');
      }
      HeaderComponent.updateEntityDisplay(levelLabel, _selectedEntityName, subtext);
    }

    closeEntitySelector();
    dispatchRefresh('entityChange');
  }

  // ========================================
  // FILTER MODAL (stub)
  // ========================================

  function getFilterModalHTML() {
    return '' +
      '<div class="dist-modal-overlay" id="dist-filter-modal">' +
        '<div class="dist-modal-content">' +
          '<div class="dist-modal-header">' +
            '<h3>Add Filter</h3>' +
            '<button class="dist-modal-close" onclick="DistributionModals.closeFilterModal()">' +
              '<span class="material-symbols-outlined">close</span>' +
            '</button>' +
          '</div>' +
          '<div class="dist-modal-body" style="text-align: center; padding: 48px 24px;">' +
            '<span class="material-symbols-outlined" style="font-size: 48px; color: var(--color-text-tertiary); margin-bottom: 16px; display: block;">filter_list</span>' +
            '<p style="color: var(--color-text-secondary); font-size: 14px;">Additional filters for the Distribution tab are coming soon.</p>' +
            '<p style="color: var(--color-text-tertiary); font-size: 12px; margin-top: 8px;">Use the Date and Entity selectors above to filter data.</p>' +
          '</div>' +
          '<div class="dist-modal-footer">' +
            '<button class="dist-btn dist-btn--secondary" onclick="DistributionModals.closeFilterModal()">Close</button>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function openFilterModal() {
    ensureModalsContainer();
    var modal = document.getElementById('dist-filter-modal');
    if (modal) modal.classList.add('active');
  }

  function closeFilterModal() {
    var modal = document.getElementById('dist-filter-modal');
    if (modal) modal.classList.remove('active');
  }

  // ========================================
  // Refresh Dispatch
  // ========================================

  function dispatchRefresh(source) {
    document.dispatchEvent(new CustomEvent('distribution:dataRefresh', {
      detail: { source: source }
    }));
  }

  // ========================================
  // Public API
  // ========================================

  return {
    openDatePicker: openDatePicker,
    closeDatePicker: closeDatePicker,
    selectWeek: selectWeek,
    applyDateSelection: applyDateSelection,

    openEntitySelector: openEntitySelector,
    closeEntitySelector: closeEntitySelector,
    toggleNode: toggleNode,
    selectEntity: selectEntity,
    filterEntityTree: filterEntityTree,
    applyEntitySelection: applyEntitySelection,
    setTreeView: setTreeView,

    openFilterModal: openFilterModal,
    closeFilterModal: closeFilterModal
  };
})();
