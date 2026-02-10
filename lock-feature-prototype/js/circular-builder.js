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

    var html = '';

    // Sub-header
    html += '<div class="sub-header">';
    html += '<span class="sub-header__title">Circular Builder</span>';
    html += '<input type="date" class="sub-header__action" value="2026-02-10">';
    html += '<span class="sub-header__spacer"></span>';
    html += '<button class="sub-header__action"><i class="pi pi-save"></i> Save</button>';
    html += '<button class="sub-header__action"><i class="pi pi-eye"></i> Preview</button>';
    html += '</div>';

    // Content area (table + bottom menu, no sidebar)
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

    // Header
    html += '<thead><tr>';
    html += '<th class="col-checkbox"><input type="checkbox" class="row-checkbox"></th>';
    html += '<th class="col-drag"></th>';
    html += '<th class="col-thumb"></th>';
    html += '<th class="col-title">Title</th>';
    html += '<th class="col-owner">Owner</th>';
    html += '<th class="col-lock">Lock</th>';
    html += '<th class="col-size">Size</th>';
    html += '<th class="col-dealtype">Deal Type</th>';
    html += '<th class="col-price">Price</th>';
    html += '<th class="col-units">Units</th>';
    html += '<th class="col-category">Category</th>';
    html += '<th class="col-days">Days</th>';
    html += '<th class="col-utils">Actions</th>';
    html += '</tr></thead>';

    // Body with category grouping
    html += '<tbody>';
    categories.forEach(function (cat) {
      var promos = window.lockState.getPromotionsByCategory(cat.hash);
      var isCollapsed = !!collapsedCategories[cat.hash];
      var chevronClass = isCollapsed ? ' category-chevron--collapsed' : '';

      // Category row
      html += '<tr class="category-row" data-category-toggle="' + cat.hash + '">';
      html += '<td colspan="13"><div class="category-label">';
      html += '<i class="pi pi-chevron-down category-chevron' + chevronClass + '"></i>';
      html += cat.name + ' (' + promos.length + ')';
      html += '</div></td></tr>';

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

  // ── Promo Row ──────────────────────────────────────────────────────

  function renderPromoRow(promo) {
    var isSelected = promo.hash === window.lockState.state.selectedPromotionHash;
    var classAttr = isSelected ? ' class="row--selected"' : '';

    var dealType = promo.deal ? promo.deal.type : '';
    var price = promo.deal && promo.deal.price != null ? '$' + promo.deal.price.toFixed(2) : '';
    var units = promo.deal ? promo.deal.units || '' : '';

    var html = '<tr' + classAttr + ' data-promo-row="' + promo.hash + '">';
    html += '<td class="col-checkbox"><input type="checkbox" class="row-checkbox"></td>';
    html += '<td class="col-drag"><span class="drag-handle"><i class="pi pi-bars"></i></span></td>';
    html += '<td class="col-thumb"><div class="thumb-placeholder"></div></td>';
    html += '<td class="col-title" data-inline-field="title" data-inline-promo="' + promo.hash + '" data-inline-type="text">' + escapeHtml(promo.title) + '</td>';
    html += '<td class="col-owner" title="' + escapeHtml(promo.nodeName) + '">' + escapeHtml(promo.nodeName) + '</td>';
    html += '<td class="col-lock">' + window.lockIcon.renderRowLockIcon(promo) + '</td>';
    html += '<td class="col-size" data-inline-field="promoSize" data-inline-promo="' + promo.hash + '" data-inline-type="text">' + (promo.promoSize || '') + '</td>';
    html += '<td class="col-dealtype"><span class="deal-type-badge deal-type-badge--' + dealType + '">' + dealType + '</span></td>';
    html += '<td class="col-price" data-inline-field="deal.price" data-inline-promo="' + promo.hash + '" data-inline-type="number">' + price + '</td>';
    html += '<td class="col-units" data-inline-field="deal.units" data-inline-promo="' + promo.hash + '" data-inline-type="text">' + units + '</td>';
    html += '<td class="col-category">' + (promo.categoryName || '') + '</td>';
    html += '<td class="col-days">7</td>';
    html += '<td class="col-utils"><div class="row-actions">';
    html += '<button class="row-action-btn" title="Edit"><i class="pi pi-pencil"></i></button>';
    html += '<button class="row-action-btn" title="Duplicate"><i class="pi pi-copy"></i></button>';
    html += '<button class="row-action-btn" title="Delete"><i class="pi pi-trash"></i></button>';
    html += '<button class="row-action-btn" title="Move Up"><i class="pi pi-arrow-up"></i></button>';
    html += '<button class="row-action-btn" title="Move Down"><i class="pi pi-arrow-down"></i></button>';
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
        if (e.target.closest('.row-checkbox') || e.target.closest('.row-action-btn') || e.target.closest('.cell-edit-input') || e.target.closest('.cell-editing')) return;
        var hash = this.getAttribute('data-promo-row');
        if (window.lockState.state.selectedPromotionHash === hash) {
          window.lockState.deselectPromotion();
        } else {
          window.lockState.selectPromotion(hash);
        }
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
