/* ==========================================================================
   PD Builder — Flat table + bottom menu editor
   No sidebar — all editing happens in the dh-bottom-menu Editor tab
   Exposes window.pdBuilder
   ========================================================================== */

(function () {
  'use strict';

  // ── Init ───────────────────────────────────────────────────────────

  function init(appEl) {
    window.bottomMenuEditor.resetSummary();

    var html = '';

    // Sub-header
    html += '<div class="sub-header sub-header--pd">';
    html += '<span class="sub-header__title">Promotion Database Builder</span>';
    html += '<span class="sub-header__spacer"></span>';
    html += '<button class="sub-header__action"><i class="pi pi-plus"></i> New Promotion</button>';
    html += '<button class="sub-header__action"><i class="pi pi-upload"></i> Import</button>';
    html += '<button class="sub-header__action"><i class="pi pi-download"></i> Export</button>';
    html += '</div>';

    // Content area (table + bottom menu, no sidebar)
    html += '<div class="content-area">';
    html += '<div class="main-panel">';
    html += '<div class="data-table pd-table" id="pd-table-container"></div>';

    // Bottom menu (dh-bottom-menu)
    html += '<div class="bottom-menu" id="pd-bottom-menu">';
    html += '<div class="bottom-menu__tab-bar">';
    html += '<button class="bottom-menu__tab bottom-menu__tab--active">Editor</button>';
    html += '<button class="bottom-menu__tab">Media</button>';
    html += '<button class="bottom-menu__tab">Promotions</button>';
    html += '<button class="bottom-menu__tab">Categories</button>';
    html += '<span class="bottom-menu__tab-spacer"></span>';
    html += '<button class="bottom-menu__close" id="pd-bottom-close"><i class="pi pi-times"></i></button>';
    html += '</div>';
    html += '<div class="bottom-menu__body" id="pd-bottom-body"></div>';
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
    var container = document.getElementById('pd-table-container');
    if (!container) return;

    var promos = window.lockState.state.promotions;
    var html = '<table>';

    // Header
    html += '<thead><tr>';
    html += '<th class="col-checkbox"><input type="checkbox" class="row-checkbox"></th>';
    html += '<th class="col-thumb">Thumb</th>';
    html += '<th class="col-title">Title</th>';
    html += '<th class="col-price">Price</th>';
    html += '<th class="col-dealtype">Deal Type</th>';
    html += '<th class="col-category">Category</th>';
    html += '<th class="col-visibility">Visible</th>';
    html += '<th class="col-lock">Lock</th>';
    html += '<th class="col-stacked">Stacked</th>';
    html += '<th class="col-edit">Edit</th>';
    html += '</tr></thead>';

    // Body (flat list, no category grouping)
    html += '<tbody>';
    promos.forEach(function (promo) {
      html += renderPromoRow(promo);
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
    var visIcon = promo.hidden ? 'pi-eye-slash visibility-icon--hidden' : 'pi-eye';

    var html = '<tr' + classAttr + ' data-promo-row="' + promo.hash + '">';
    html += '<td class="col-checkbox"><input type="checkbox" class="row-checkbox"></td>';
    html += '<td class="col-thumb"><div class="thumb-placeholder" style="width:48px;height:48px"></div></td>';
    html += '<td class="col-title" title="' + escapeHtml(promo.title) + '"><strong>' + escapeHtml(promo.title) + '</strong><br><span style="font-size:var(--dh-font-size-xs);color:var(--dh-color-text-low-contrast)">' + escapeHtml(promo.description) + '</span></td>';
    html += '<td class="col-price" data-inline-field="deal.price" data-inline-promo="' + promo.hash + '" data-inline-type="number">' + price + '</td>';
    html += '<td class="col-dealtype"><span class="deal-type-badge deal-type-badge--' + dealType + '">' + dealType + '</span></td>';
    html += '<td class="col-category">' + (promo.categoryName || '') + '</td>';
    html += '<td class="col-visibility"><i class="pi ' + visIcon + ' visibility-icon"></i></td>';
    html += '<td class="col-lock">' + window.lockIcon.renderRowLockIcon(promo) + '</td>';
    html += '<td class="col-stacked">—</td>';
    html += '<td class="col-edit"><button class="pd-edit-btn" data-pd-edit="' + promo.hash + '">Edit</button></td>';
    html += '</tr>';
    return html;
  }

  // ── Table Events ───────────────────────────────────────────────────

  function bindTableEvents(container) {
    // Promo row click → select
    container.querySelectorAll('[data-promo-row]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        if (e.target.closest('.row-checkbox') || e.target.closest('.pd-edit-btn') || e.target.closest('.cell-edit-input') || e.target.closest('.cell-editing')) return;
        var hash = this.getAttribute('data-promo-row');
        if (window.lockState.state.selectedPromotionHash === hash) {
          window.lockState.deselectPromotion();
        } else {
          window.lockState.selectPromotion(hash);
        }
      });
    });

    // Edit button
    container.querySelectorAll('[data-pd-edit]').forEach(function (el) {
      el.addEventListener('click', function () {
        var hash = this.getAttribute('data-pd-edit');
        window.lockState.selectPromotion(hash);
      });
    });
  }

  // ── Global Events ──────────────────────────────────────────────────

  function bindGlobalEvents() {
    var bottomClose = document.getElementById('pd-bottom-close');
    if (bottomClose) {
      bottomClose.addEventListener('click', function () {
        var menu = document.getElementById('pd-bottom-menu');
        menu.classList.remove('bottom-menu--open');
        window.lockState.setBottomMenuOpen(false);
      });
    }
  }

  // ── State Event Handlers ───────────────────────────────────────────

  function onPromotionSelected() {
    // Open bottom menu and render editor
    var menu = document.getElementById('pd-bottom-menu');
    if (menu) menu.classList.add('bottom-menu--open');
    var bottomBody = document.getElementById('pd-bottom-body');
    if (bottomBody) window.bottomMenuEditor.render(bottomBody);

    renderTable();
  }

  function onPromotionDeselected() {
    // Close bottom menu
    var menu = document.getElementById('pd-bottom-menu');
    if (menu) menu.classList.remove('bottom-menu--open');

    renderTable();
  }

  function onLockChanged() {
    renderTable();
    var bottomBody = document.getElementById('pd-bottom-body');
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

  window.pdBuilder = {
    init: init,
    destroy: destroy
  };
})();
