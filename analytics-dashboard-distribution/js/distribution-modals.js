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
  let _selectedWeekId = 'all';
  let _selectedEntityId = 'all';
  let _selectedEntityLevel = 'all';
  let _selectedEntityName = 'All Stores';
  let _expandedNodes = { 'all': true };

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
            '<h3>Select Flight Week</h3>' +
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
        '<div class="dist-week-option__label">All Flight Weeks</div>' +
        '<div class="dist-week-option__dates">' + weeks[0].start + ' — ' + weeks[weeks.length - 1].end + '</div>' +
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

    // Update header display
    if (typeof HeaderComponent !== 'undefined') {
      if (_selectedWeekId === 'all') {
        var weeks = D.flightWeeks;
        HeaderComponent.updateDateDisplay(
          'Flight Weeks 3-2',
          'Dec 10, 2025 – Jan 13, 2026'
        );
      } else {
        var week = D.flightWeeks.find(function(w) { return w.id === _selectedWeekId; });
        if (week) {
          HeaderComponent.updateDateDisplay(week.label, week.start + ' — ' + week.end);
        }
      }
    }

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
            '<div class="dist-entity-search">' +
              '<span class="material-symbols-outlined">search</span>' +
              '<input type="text" id="dist-entity-search-input" placeholder="Search stores, brands..." ' +
                'oninput="DistributionModals.filterEntityTree(this.value)">' +
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

  function renderEntityTree(filter) {
    var tree = document.getElementById('dist-entity-tree');
    if (!tree || !E) return;

    var html = '';
    var query = (filter || '').toLowerCase().trim();

    // "All Stores" root
    var allSelected = _selectedEntityId === 'all';
    html += treeRow('all', 'all', 'All Stores', E.stores.length + ' stores', 0, allSelected, true);

    // Brands
    E.brands.forEach(function(brand) {
      var brandStores = E.getStoresForEntity(brand.id, 'brand');
      var brandExpanded = !!_expandedNodes[brand.id];
      var brandSelected = _selectedEntityId === brand.id;

      // Filter: show brand if it matches or any child matches
      if (query) {
        var brandMatch = brand.name.toLowerCase().includes(query);
        var childMatch = brand.subBrands.some(function(sb) {
          if (sb.name.toLowerCase().includes(query)) return true;
          var sbStores = E.getStoresForEntity(sb.id, 'sub-brand');
          return sbStores.some(function(sid) {
            var store = E.getStoreById(sid);
            return store && (store.name.toLowerCase().includes(query) || store.city.toLowerCase().includes(query) || store.storeNumber.toString().includes(query));
          });
        });
        if (!brandMatch && !childMatch) return;
        brandExpanded = true;
      }

      html += treeRow(brand.id, 'brand', brand.name, brandStores.length + ' stores', 1, brandSelected, brandExpanded);

      if (brandExpanded) {
        // Sub-brands
        brand.subBrands.forEach(function(sb) {
          var sbStores = E.getStoresForEntity(sb.id, 'sub-brand');
          var sbExpanded = !!_expandedNodes[sb.id];
          var sbSelected = _selectedEntityId === sb.id;

          if (query) {
            var sbMatch = sb.name.toLowerCase().includes(query);
            var sbChildMatch = sbStores.some(function(sid) {
              var store = E.getStoreById(sid);
              return store && (store.name.toLowerCase().includes(query) || store.city.toLowerCase().includes(query) || store.storeNumber.toString().includes(query));
            });
            if (!sbMatch && !sbChildMatch) return;
            sbExpanded = true;
          }

          html += treeRow(sb.id, 'sub-brand', sb.name, sbStores.length + ' stores', 2, sbSelected, sbExpanded);

          if (sbExpanded) {
            // Stores
            sbStores.forEach(function(storeId) {
              var store = E.getStoreById(storeId);
              if (!store) return;

              if (query) {
                var storeMatch = store.name.toLowerCase().includes(query) ||
                  store.city.toLowerCase().includes(query) ||
                  store.storeNumber.toString().includes(query);
                if (!storeMatch) return;
              }

              var storeSelected = _selectedEntityId === store.id;
              html += '<div class="dist-tree-row dist-tree-row--store' + (storeSelected ? ' selected' : '') + '" ' +
                'style="padding-left: ' + (3 * 24 + 16) + 'px;" ' +
                'onclick="DistributionModals.selectEntity(\'' + store.id + '\', \'store\', \'Store ' + store.storeNumber + ' · ' + store.city + '\')">' +
                '<span class="material-symbols-outlined" style="font-size: 16px; color: var(--color-text-tertiary);">store</span>' +
                '<div class="dist-tree-row__content">' +
                  '<span class="dist-tree-row__name">Store ' + store.storeNumber + '</span>' +
                  '<span class="dist-tree-row__meta">' + store.city + '</span>' +
                '</div>' +
                '<div class="dist-tree-row__check"><span class="material-symbols-outlined">check</span></div>' +
              '</div>';
            });
          }
        });
      }
    });

    tree.innerHTML = html;
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
      var levelLabel = _selectedEntityLevel === 'all' ? 'ALL STORES'
        : _selectedEntityLevel === 'brand' ? 'BRAND'
        : _selectedEntityLevel === 'sub-brand' ? 'SUB-BRAND'
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

    openFilterModal: openFilterModal,
    closeFilterModal: closeFilterModal
  };
})();
