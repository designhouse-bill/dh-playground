/* ==========================================================================
   Bottom Menu Editor — Full editor panel for both Circular Builder & PD Builder
   Includes lock toolbar, lock summary, accordion form, and role-based visibility
   Exposes window.bottomMenuEditor
   ========================================================================== */

(function () {
  'use strict';

  var FIELDS = window.lockState.LOCKABLE_FIELDS;
  var SECTIONS = window.lockState.SECTIONS;
  var SECTION_ORDER = window.lockState.SECTION_ORDER;

  var summaryVisible = false;

  // ── Main Render ────────────────────────────────────────────────────

  function render(container) {
    var promo = window.lockState.getSelectedPromotion();
    if (!promo) {
      container.innerHTML = '<div style="padding:var(--dh-space-md);color:var(--dh-color-text-low-contrast);font-size:var(--dh-font-size-sm);">Select a promotion to edit</div>';
      return;
    }

    var isRetailer = window.lockState.state.currentProfile === 'retailer';
    var html = '';

    // Retailer info banner
    if (isRetailer && window.lockService.hasAnyLocks(promo)) {
      html += '<div class="info-banner">' +
        '<i class="pi pi-info-circle"></i>' +
        '<span>Some fields have been locked by <strong>' +
          (promo.lockConfig ? promo.lockConfig.lockedBy : 'Wholesaler') +
        '</strong></span>' +
      '</div>';
    }

    // Lock Toolbar (wholesaler only)
    if (!isRetailer) {
      html += window.lockIcon.renderLockToolbar(promo.hash);
    }

    // Lock Summary Panel (wholesaler only)
    if (!isRetailer) {
      html += '<div id="lock-summary-wrapper" class="' + (summaryVisible ? '' : 'lock-summary--hidden') + '">';
      html += window.lockIcon.renderLockSummaryPanel(promo, isRetailer);
      html += '</div>';
    }

    // Accordion sections
    html += '<div class="accordion">';
    SECTION_ORDER.forEach(function (sectionName) {
      html += renderSection(sectionName, promo, isRetailer);
    });
    html += '</div>';

    container.innerHTML = html;
    bindEvents(container, promo);
  }

  // ── Section Render ─────────────────────────────────────────────────

  function renderSection(sectionName, promo, isRetailer) {
    var fieldKeys = SECTIONS[sectionName];
    if (!fieldKeys) return '';

    var badge = window.lockIcon.renderSectionLockBadge(promo, sectionName, isRetailer);

    var html = '<div class="accordion__section" data-section="' + sectionName + '">';
    html += '<div class="accordion__header" data-accordion-toggle="' + sectionName + '">';
    html += '<i class="pi pi-chevron-down accordion__chevron"></i>';
    html += '<span class="accordion__title">' + sectionName + '</span>';
    html += badge;
    html += '</div>';
    html += '<div class="accordion__body" data-accordion-body="' + sectionName + '">';

    fieldKeys.forEach(function (fieldKey) {
      html += renderField(fieldKey, promo, isRetailer);
    });

    html += '</div></div>';
    return html;
  }

  // ── Field Render ───────────────────────────────────────────────────

  function renderField(fieldKey, promo, isRetailer) {
    var fieldDef = FIELDS[fieldKey];
    if (!fieldDef) return '';

    var state = window.lockService.getFieldState(promo, fieldKey);
    var isLocked = isRetailer && (state === 'locked');
    var isConstrained = state === 'constrained';
    var disabledAttr = isLocked ? ' disabled' : '';
    var disabledClass = isLocked ? ' form-input--disabled' : '';
    var selectDisabledClass = isLocked ? ' form-select--disabled' : '';

    var html = '<div class="form-group">';

    // Label + lock icon (wholesaler only)
    html += '<label class="form-label">';
    html += fieldDef.displayName;
    if (!isRetailer) {
      html += ' ' + window.lockIcon.renderLockIcon(fieldKey, promo, false);
    }
    html += '</label>';

    // Render appropriate input based on field key
    var value = getFieldValue(promo, fieldKey);

    if (fieldKey === 'description') {
      html += '<textarea class="form-input' + disabledClass + '"' + disabledAttr + '>' + escapeHtml(value) + '</textarea>';
    } else if (fieldKey === 'categoryHash') {
      html += '<select class="form-select' + selectDisabledClass + '"' + disabledAttr + '>';
      window.lockState.state.categories.forEach(function (cat) {
        var sel = cat.hash === value ? ' selected' : '';
        html += '<option value="' + cat.hash + '"' + sel + '>' + cat.name + '</option>';
      });
      html += '</select>';
    } else if (fieldKey === 'deal.type') {
      html += '<select class="form-select' + selectDisabledClass + '"' + disabledAttr + '>';
      ['fixed', 'bogo', 'numfor', 'recipe'].forEach(function (t) {
        var sel = t === value ? ' selected' : '';
        html += '<option value="' + t + '"' + sel + '>' + t.charAt(0).toUpperCase() + t.slice(1) + '</option>';
      });
      html += '</select>';
    } else if (fieldKey === 'dateRange') {
      html += '<div style="display:flex;gap:var(--dh-space-xs)">';
      html += '<input type="date" class="form-input' + disabledClass + '" value="' + (promo.validFrom || '') + '"' + disabledAttr + ' style="flex:1">';
      html += '<input type="date" class="form-input' + disabledClass + '" value="' + (promo.validTo || '') + '"' + disabledAttr + ' style="flex:1">';
      html += '</div>';
    } else if (fieldKey === 'background') {
      html += renderBackgroundGroup(promo, isLocked, disabledAttr, disabledClass);
    } else if (fieldKey === 'bogoDeal') {
      html += renderBogoGroup(promo, isLocked, disabledAttr, disabledClass);
    } else if (fieldKey === 'deal.price' || fieldKey === 'loyaltyDeal.price' || fieldKey === 'deal.couponAmountOff') {
      html += '<input type="number" class="form-input' + disabledClass + '" value="' + (value || '') + '" step="0.01"' + disabledAttr + '>';
    } else if (fieldKey === 'promoSize') {
      html += '<select class="form-select' + selectDisabledClass + '"' + disabledAttr + '>';
      ['200x200', '300x200', '300x300'].forEach(function (s) {
        var sel = s === value ? ' selected' : '';
        html += '<option value="' + s + '"' + sel + '>' + s + '</option>';
      });
      html += '</select>';
    } else if (fieldKey === 'mediaSize') {
      html += '<select class="form-select' + selectDisabledClass + '"' + disabledAttr + '>';
      ['small', 'medium', 'large'].forEach(function (s) {
        var sel = s === value ? ' selected' : '';
        html += '<option value="' + s + '"' + sel + '>' + s.charAt(0).toUpperCase() + s.slice(1) + '</option>';
      });
      html += '</select>';
    } else {
      html += '<input type="text" class="form-input' + disabledClass + '" value="' + escapeHtml(value || '') + '"' + disabledAttr + '>';
    }

    // Constraint inputs (wholesaler) or hint (retailer)
    if (isConstrained) {
      html += window.lockIcon.renderConstraintInputs(fieldKey, promo, isRetailer);
    }

    html += '</div>';
    return html;
  }

  // ── Grouped Field Renderers ────────────────────────────────────────

  function renderBackgroundGroup(promo, isLocked, disabledAttr, disabledClass) {
    var bg = promo.background || {};
    var html = '<div style="display:flex;flex-direction:column;gap:var(--dh-space-2xs)">';
    html += '<input type="color" class="form-input' + disabledClass + '" value="' + (bg.backgroundColor || '#ffffff') + '"' + disabledAttr + ' style="height:30px;padding:2px">';
    html += '<input type="text" class="form-input' + disabledClass + '" placeholder="Image URL" value="' + escapeHtml(bg.backgroundImage || '') + '"' + disabledAttr + '>';
    html += '<div style="display:flex;gap:var(--dh-space-2xs)">';
    html += '<input type="text" class="form-input' + disabledClass + '" placeholder="Position" value="' + escapeHtml(bg.position || 'center') + '"' + disabledAttr + ' style="flex:1">';
    html += '<input type="text" class="form-input' + disabledClass + '" placeholder="Size" value="' + escapeHtml(bg.size || 'cover') + '"' + disabledAttr + ' style="flex:1">';
    html += '</div>';
    html += '</div>';
    return html;
  }

  function renderBogoGroup(promo, isLocked, disabledAttr, disabledClass) {
    var bogo = promo.bogoDeal || {};
    var html = '<div style="display:flex;gap:var(--dh-space-2xs);flex-wrap:wrap">';
    html += '<input type="number" class="form-input' + disabledClass + '" placeholder="Buy Qty" value="' + (bogo.buyQuantity || '') + '"' + disabledAttr + ' style="flex:1;min-width:60px">';
    html += '<input type="number" class="form-input' + disabledClass + '" placeholder="Get Qty" value="' + (bogo.getQuantity || '') + '"' + disabledAttr + ' style="flex:1;min-width:60px">';
    html += '<input type="text" class="form-input' + disabledClass + '" placeholder="Deal" value="' + escapeHtml(bogo.getDeal || '') + '"' + disabledAttr + ' style="flex:1;min-width:60px">';
    html += '</div>';
    return html;
  }

  // ── Value Getter ───────────────────────────────────────────────────

  function getFieldValue(promo, fieldKey) {
    if (fieldKey.indexOf('.') > -1) {
      var parts = fieldKey.split('.');
      var obj = promo[parts[0]];
      return obj ? obj[parts[1]] : '';
    }
    return promo[fieldKey];
  }

  // ── Event Binding ──────────────────────────────────────────────────

  function bindEvents(container, promo) {
    // Lock icon clicks (wholesaler only)
    container.querySelectorAll('[data-lock-field]').forEach(function (el) {
      el.addEventListener('click', function () {
        var fieldKey = this.getAttribute('data-lock-field');
        window.lockService.toggleLockState(promo, fieldKey);
        window.lockState.notifyLockChanged(promo.hash);
        render(container);
      });
    });

    // Lock toolbar actions
    container.querySelectorAll('[data-lock-action]').forEach(function (el) {
      el.addEventListener('click', function () {
        var action = this.getAttribute('data-lock-action');
        if (action === 'lock-all') {
          window.lockService.lockAll(promo);
          window.lockState.notifyLockChanged(promo.hash);
          render(container);
        } else if (action === 'unlock-all') {
          if (confirm('Unlock all fields? This will remove all locks on this promotion.')) {
            window.lockService.unlockAll(promo);
            window.lockState.notifyLockChanged(promo.hash);
            render(container);
          }
        } else if (action === 'toggle-summary') {
          summaryVisible = !summaryVisible;
          render(container);
        }
      });
    });

    // Summary panel quick-toggle
    container.querySelectorAll('[data-summary-toggle]').forEach(function (el) {
      el.addEventListener('click', function () {
        var fieldKey = this.getAttribute('data-summary-toggle');
        window.lockService.toggleLockState(promo, fieldKey);
        window.lockState.notifyLockChanged(promo.hash);
        render(container);
      });
    });

    // Accordion toggles
    container.querySelectorAll('[data-accordion-toggle]').forEach(function (el) {
      el.addEventListener('click', function () {
        var section = this.getAttribute('data-accordion-toggle');
        var body = container.querySelector('[data-accordion-body="' + section + '"]');
        var chevron = this.querySelector('.accordion__chevron');
        if (body) {
          body.classList.toggle('accordion__body--collapsed');
          if (chevron) chevron.classList.toggle('accordion__chevron--collapsed');
        }
      });
    });

    // Constraint range inputs
    container.querySelectorAll('[data-constraint-field]').forEach(function (el) {
      el.addEventListener('change', function () {
        var fieldKey = this.getAttribute('data-constraint-field');
        var bound = this.getAttribute('data-constraint-bound');
        var range = window.lockService.getConstraintRange(promo, fieldKey) || { min: 0, max: 0 };
        if (bound === 'min') range.min = parseFloat(this.value) || 0;
        if (bound === 'max') range.max = parseFloat(this.value) || 0;
        window.lockService.updateConstraintRange(promo, fieldKey, range.min, range.max);
        window.lockState.notifyLockChanged(promo.hash);
      });
    });
  }

  // ── Utilities ──────────────────────────────────────────────────────

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ── Public API ─────────────────────────────────────────────────────

  window.bottomMenuEditor = {
    render: render,
    resetSummary: function () { summaryVisible = false; }
  };
})();
