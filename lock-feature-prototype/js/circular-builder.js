/* ==========================================================================
   Circular Builder — TreeTable with category grouping + bottom menu editor
   No sidebar — all editing happens in the dh-bottom-menu Editor tab
   Exposes window.circularBuilder
   ========================================================================== */

(function () {
  'use strict';

  var collapsedCategories = {};

  // ── Init ───────────────────────────────────────────────────────────

  function init(appEl) {
    collapsedCategories = {};
    window.bottomMenuEditor.resetSummary();

    var totalPromos = window.lockState.state.promotions.length;
    var html = '';

    // Toolbar row (Browse, Add Page, Export, Bulk Upload, New Card)
    html += '<div class="toolbar-row">';
    html += '<button class="btn btn--sm"><i class="pi pi-home"></i> Browse/Home</button>';
    html += '<button class="btn btn--sm"><i class="pi pi-plus"></i> Add Page</button>';
    html += '<button class="btn btn--sm"><i class="pi pi-file-export" style="color:var(--dh-btn-danger-bg)"></i> Export</button>';
    html += '<span class="toolbar-row__spacer"></span>';
    html += '<button class="btn btn--sm">Bulk Upload</button>';
    html += '<button class="btn btn--sm btn--danger-fill"><i class="pi pi-plus"></i> New Card</button>';
    html += '</div>';

    // Filter/Status bar
    html += '<div class="filter-bar">';
    html += '<div class="filter-bar__tabs">';
    html += '<button class="filter-bar__tab filter-bar__tab--active">All (' + totalPromos + ')</button>';
    html += '<span class="filter-bar__pipe">|</span>';
    html += '<button class="filter-bar__tab" style="color:var(--dh-color-primary)">Active (' + totalPromos + ')</button>';
    html += '<span class="filter-bar__pipe">|</span>';
    html += '<button class="filter-bar__tab">Inactive (0)</button>';
    html += '</div>';
    html += '<span class="filter-bar__selected-count">(0 Selected)</span>';
    html += '<span class="filter-bar__spacer"></span>';
    html += '<div class="filter-bar__search">';
    html += '<input type="text" class="filter-bar__search-input" placeholder="By Title... Circular Content">';
    html += '<button class="filter-bar__search-btn"><i class="pi pi-search"></i></button>';
    html += '</div>';
    html += '<button class="filter-bar__kebab"><i class="pi pi-ellipsis-v"></i></button>';
    html += '</div>';

    // Content area (table + sidebar + bottom menu)
    html += '<div class="content-area">';
    html += '<div class="main-panel" id="cb-main-panel">';
    html += '<div class="data-table" id="cb-table-container"></div>';

    // Bottom menu (dh-bottom-menu)
    html += '<div class="bottom-menu" id="cb-bottom-menu">';
    html += '<div class="bottom-menu__tab-bar">';
    html += '<button class="bottom-menu__tab bottom-menu__tab--active">Editor</button>';
    html += '<button class="bottom-menu__tab">Media</button>';
    html += '<button class="bottom-menu__tab">Promotions</button>';
    html += '<button class="bottom-menu__tab">Categories</button>';
    html += '<span class="bottom-menu__tab-spacer"></span>';
    html += '<button class="bottom-menu__close" id="cb-bottom-close"><i class="pi pi-times"></i></button>';
    html += '</div>';
    html += '<div class="bottom-menu__body" id="cb-bottom-body"></div>';
    html += '</div>';

    html += '</div>'; // end main-panel

    // Right sidebar (PREVIEW)
    html += '<div class="sidebar sidebar--collapsed" id="cb-sidebar">';
    html += '<div class="sidebar__bar" id="cb-sidebar-toggle">';
    html += '<span class="sidebar__bar-text">PREVIEW</span>';
    html += '</div>';
    html += '<div class="sidebar__content">';
    html += '<div style="padding:var(--dh-space-md);color:var(--dh-color-text-low-contrast);font-size:var(--dh-font-size-sm);">Preview panel</div>';
    html += '</div>';
    html += '</div>';

    html += '</div>'; // end content-area

    appEl.innerHTML = html;

    renderTable();
    bindGlobalEvents();

    // Subscribe to state events
    window.lockState.on('lock-changed', onLockChanged);
    window.lockState.on('promotion-selected', onPromotionSelected);
    window.lockState.on('promotion-deselected', onPromotionDeselected);
  }

  // ── Table Render ───────────────────────────────────────────────────

  function renderTable() {
    var container = document.getElementById('cb-table-container');
    if (!container) return;

    var categories = window.lockState.state.categories;
    var html = '<table>';

    // Header — production column layout
    html += '<thead><tr>';
    html += '<th class="col-checkbox"><input type="checkbox" class="row-checkbox"></th>';
    html += '<th class="col-drag"></th>';
    html += '<th class="col-thumb"></th>';
    html += '<th class="col-title">TITLE</th>';
    html += '<th class="col-size">SIZE</th>';
    html += '<th class="col-price">PRICE</th>';
    html += '<th class="col-units">UNITS</th>';
    html += '<th class="col-lock">LOCK</th>';
    html += '<th class="col-utils">UTILITIES</th>';
    html += '</tr></thead>';

    // Body with category grouping
    html += '<tbody>';
    categories.forEach(function (cat) {
      var promos = window.lockState.getPromotionsByCategory(cat.hash);
      var isCollapsed = !!collapsedCategories[cat.hash];
      var chevronClass = isCollapsed ? ' category-chevron--collapsed' : '';

      // Category row — blue with white text
      html += '<tr class="category-row" data-category-toggle="' + cat.hash + '">';
      html += '<td class="col-checkbox"><input type="checkbox" class="row-checkbox"></td>';
      html += '<td colspan="6"><div class="category-label">';
      html += '<i class="pi pi-chevron-down category-chevron' + chevronClass + '"></i>';
      html += cat.name;
      html += '</div></td>';
      html += '<td colspan="2"><div class="category-utils">';
      html += '<button title="Visibility"><i class="pi pi-eye"></i></button>';
      html += '<button title="Pin"><i class="pi pi-bookmark"></i></button>';
      html += '</div></td>';
      html += '</tr>';

      // Promotion rows
      if (!isCollapsed) {
        promos.forEach(function (promo) {
          html += renderPromoRow(promo);
        });
      }
    });
    html += '</tbody></table>';

    container.innerHTML = html;
    bindTableEvents(container);
    window.inlineEdit.bind(container);
  }

  // ── Promo Row — production layout ─────────────────────────────────

  function renderPromoRow(promo) {
    var isSelected = promo.hash === window.lockState.state.selectedPromotionHash;
    var classAttr = isSelected ? ' class="row--selected"' : '';

    var price = promo.deal && promo.deal.price != null ? '$' + promo.deal.price.toFixed(2) : '';
    var units = promo.deal ? promo.deal.units || '' : '';

    // Format size as "W x H"
    var w = promo.length || 0;
    var h = promo.height || 0;
    var sizeDisplay = w && h ? w + ' \u00D7 ' + h : (promo.promoSize || '');

    var html = '<tr' + classAttr + ' data-promo-row="' + promo.hash + '">';
    html += '<td class="col-checkbox"><input type="checkbox" class="row-checkbox"></td>';
    html += '<td class="col-drag"><span class="drag-handle"><i class="pi pi-th-large"></i></span></td>';
    html += '<td class="col-thumb"><div class="thumb-wrapper"><div class="thumb-placeholder"></div><span class="thumb-copy-overlay"><i class="pi pi-copy"></i></span></div></td>';
    html += '<td class="col-title" data-inline-field="title" data-inline-promo="' + promo.hash + '" data-inline-type="text">' + escapeHtml(promo.title) + '</td>';
    html += '<td class="col-size">' + sizeDisplay + '</td>';
    html += '<td class="col-price" data-inline-field="deal.price" data-inline-promo="' + promo.hash + '" data-inline-type="number">' + price + '</td>';
    html += '<td class="col-units">' + units + '</td>';
    html += '<td class="col-lock">' + window.lockIcon.renderRowLockIcon(promo) + '</td>';
    html += '<td class="col-utils"><div class="utils-cell">';
    html += '<button class="util-icon-btn" title="Visibility"><i class="pi pi-eye"></i></button>';
    html += '<button class="util-edit-pill" title="Edit" data-edit-promo="' + promo.hash + '"><i class="pi pi-pencil"></i> Edit</button>';
    html += '<button class="util-kebab" title="More"><i class="pi pi-ellipsis-v"></i></button>';
    html += '</div></td>';
    html += '</tr>';
    return html;
  }

  // ── Table Events ───────────────────────────────────────────────────

  function bindTableEvents(container) {
    // Category row expand/collapse
    container.querySelectorAll('[data-category-toggle]').forEach(function (el) {
      el.addEventListener('click', function () {
        var catHash = this.getAttribute('data-category-toggle');
        collapsedCategories[catHash] = !collapsedCategories[catHash];
        renderTable();
      });
    });

    // Promo row click → select
    container.querySelectorAll('[data-promo-row]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        if (e.target.closest('.row-checkbox') || e.target.closest('.util-edit-pill') || e.target.closest('.util-icon-btn') || e.target.closest('.util-kebab') || e.target.closest('.cell-edit-input') || e.target.closest('.cell-editing')) return;
        var hash = this.getAttribute('data-promo-row');
        if (window.lockState.state.selectedPromotionHash === hash) {
          window.lockState.deselectPromotion();
        } else {
          window.lockState.selectPromotion(hash);
        }
      });
    });

    // Edit pill click → select promotion
    container.querySelectorAll('[data-edit-promo]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        var hash = this.getAttribute('data-edit-promo');
        window.lockState.selectPromotion(hash);
      });
    });
  }

  // ── Global Events ──────────────────────────────────────────────────

  function bindGlobalEvents() {
    // Bottom menu close
    var bottomClose = document.getElementById('cb-bottom-close');
    if (bottomClose) {
      bottomClose.addEventListener('click', function () {
        var menu = document.getElementById('cb-bottom-menu');
        menu.classList.remove('bottom-menu--open');
        window.lockState.setBottomMenuOpen(false);
      });
    }

    // Sidebar toggle
    var sidebarToggle = document.getElementById('cb-sidebar-toggle');
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', function () {
        var sidebar = document.getElementById('cb-sidebar');
        sidebar.classList.toggle('sidebar--collapsed');
        sidebar.classList.toggle('sidebar--expanded');
      });
    }
  }

  // ── State Event Handlers ───────────────────────────────────────────

  function onPromotionSelected() {
    // Open bottom menu and render editor
    var menu = document.getElementById('cb-bottom-menu');
    if (menu) menu.classList.add('bottom-menu--open');
    var bottomBody = document.getElementById('cb-bottom-body');
    if (bottomBody) window.bottomMenuEditor.render(bottomBody);

    // Re-render table for selection highlight
    renderTable();
  }

  function onPromotionDeselected() {
    // Close bottom menu
    var menu = document.getElementById('cb-bottom-menu');
    if (menu) menu.classList.remove('bottom-menu--open');

    renderTable();
  }

  function onLockChanged() {
    renderTable();
    var bottomBody = document.getElementById('cb-bottom-body');
    if (bottomBody && window.lockState.state.selectedPromotionHash) {
      window.bottomMenuEditor.render(bottomBody);
    }
  }

  // ── Destroy ────────────────────────────────────────────────────────

  function destroy() {
    window.lockState.off('lock-changed', onLockChanged);
    window.lockState.off('promotion-selected', onPromotionSelected);
    window.lockState.off('promotion-deselected', onPromotionDeselected);
  }

  // ── Utilities ──────────────────────────────────────────────────────

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ── Public API ─────────────────────────────────────────────────────

  window.circularBuilder = {
    init: init,
    destroy: destroy
  };
})();
