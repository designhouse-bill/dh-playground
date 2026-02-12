/* ==========================================================================
   Bottom Menu Editor — Multi-column card layout for Circular Builder & PD Builder
   Includes lock toolbar, lock summary, card-based form, and role-based visibility
   Exposes window.bottomMenuEditor
   ========================================================================== */

(function () {
  'use strict';

  var FIELDS = window.lockState.LOCKABLE_FIELDS;
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

    // Editor Header
    html += '<div class="editor-header">';
    html += '<div class="editor-header__top">';
    html += '<span class="editor-header__label">EDITOR</span>';
    html += '<span class="editor-header__subtitle">Edit Single Promotion</span>';
    html += '</div>';
    html += '<div class="editor-header__promo-row">';
    html += '<div class="editor-header__promo-title">' + escapeHtml(promo.title) + '</div>';
    html += '<div class="editor-header__nav">';
    html += '<button class="editor-header__nav-btn">&lsaquo; Previous</button>';
    html += '<button class="editor-header__nav-btn">Next &rsaquo;</button>';
    html += '</div>';
    html += '</div>';
    html += '<div class="editor-header__actions">';
    html += '<select class="form-select" style="width:auto;font-size:var(--dh-font-size-xs);padding:var(--dh-space-2xs) var(--dh-space-xs)"><option>English</option></select>';
    html += '<button class="btn btn--sm"><i class="pi pi-eye"></i> Visible</button>';
    html += '<button class="btn btn--sm" style="color:var(--dh-color-danger)"><i class="pi pi-trash"></i> Delete</button>';
    html += '</div>';
    html += '</div>';

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

    // 4-Column Card Grid
    html += '<div class="editor-card-grid">';
    html += renderColumn1(promo, isRetailer);
    html += renderColumn2(promo, isRetailer);
    html += renderColumn3(promo, isRetailer);
    html += renderColumn4(promo, isRetailer);
    html += '</div>';

    container.innerHTML = html;
    bindEvents(container, promo);
  }

  // ── Column 1: Content + Coupon ────────────────────────────────────

  function renderColumn1(promo, isRetailer) {
    var contentBadge = !isRetailer ? window.lockIcon.renderSectionLockBadge(promo, 'General', isRetailer) : '';
    var couponBadge = !isRetailer ? window.lockIcon.renderSectionLockBadge(promo, 'Coupon', isRetailer) : '';

    var html = '<div class="editor-card-col">';

    // Content Card
    html += '<div class="editor-card">';
    html += '<div class="editor-card__header">Content ' + contentBadge + '</div>';
    html += '<div class="editor-card__body">';
    html += renderField('title', promo, isRetailer);
    html += renderField('description', promo, isRetailer);
    html += renderField('dateText', promo, isRetailer);
    html += renderField('categoryHash', promo, isRetailer);
    html += renderField('promoSize', promo, isRetailer);
    html += '</div></div>';

    // Coupon Card
    html += '<div class="editor-card">';
    html += '<div class="editor-card__header">Coupon ' + couponBadge + '</div>';
    html += '<div class="editor-card__body">';
    html += renderField('couponId', promo, isRetailer);
    html += renderField('deal.couponAmountOff', promo, isRetailer);
    html += '</div></div>';

    html += '</div>';
    return html;
  }

  // ── Column 2: Deal/Offer + Headline + Media/Icons ─────────────────

  function renderColumn2(promo, isRetailer) {
    var dealBadge = !isRetailer ? window.lockIcon.renderSectionLockBadge(promo, 'Card', isRetailer) : '';
    var headlineBadge = !isRetailer ? window.lockIcon.renderSectionLockBadge(promo, 'Headline', isRetailer) : '';
    var mediaBadge = !isRetailer ? window.lockIcon.renderSectionLockBadge(promo, 'Media/Icons', isRetailer) : '';

    var html = '<div class="editor-card-col">';

    // Deal/Offer Card
    html += '<div class="editor-card">';
    html += '<div class="editor-card__header">Deal/Offer ' + dealBadge + '</div>';
    html += '<div class="editor-card__body">';
    html += renderField('cardStyleHash', promo, isRetailer);
    html += renderField('deal.type', promo, isRetailer);
    html += renderField('deal.price', promo, isRetailer);
    html += renderField('deal.units', promo, isRetailer);
    html += renderField('upc', promo, isRetailer);
    html += renderField('bogoDeal', promo, isRetailer);
    html += renderField('loyaltyDeal.type', promo, isRetailer);
    html += renderField('loyaltyDeal.price', promo, isRetailer);
    html += '</div></div>';

    // Headline Card
    html += '<div class="editor-card">';
    html += '<div class="editor-card__header">Headline ' + headlineBadge + '</div>';
    html += '<div class="editor-card__body">';
    html += renderField('headline', promo, isRetailer);
    html += '</div></div>';

    // Media/Icons Card
    html += '<div class="editor-card">';
    html += '<div class="editor-card__header">Media/Icons ' + mediaBadge + '</div>';
    html += '<div class="editor-card__body">';
    html += renderField('icons', promo, isRetailer);
    html += renderField('mediaSize', promo, isRetailer);
    html += '</div></div>';

    html += '</div>';
    return html;
  }

  // ── Column 3: Date Range + Media + Background ─────────────────────

  function renderColumn3(promo, isRetailer) {
    var dateBadge = !isRetailer ? window.lockIcon.renderSectionLockBadge(promo, 'Date Range', isRetailer) : '';
    var bgBadge = !isRetailer ? window.lockIcon.renderSectionLockBadge(promo, 'Background', isRetailer) : '';

    var html = '<div class="editor-card-col">';

    // Date Range Card
    html += '<div class="editor-card">';
    html += '<div class="editor-card__header">Date range ' + dateBadge + '</div>';
    html += '<div class="editor-card__body">';
    html += renderField('dateRange', promo, isRetailer);
    html += '</div></div>';

    // Media Card (placeholder)
    html += '<div class="editor-card">';
    html += '<div class="editor-card__header">Media</div>';
    html += '<div class="editor-card__body">';
    html += '<button class="add-media-btn"><i class="pi pi-image"></i> Change Media</button>';
    html += '</div></div>';

    // Background Card
    html += '<div class="editor-card">';
    html += '<div class="editor-card__header">Background ' + bgBadge + '</div>';
    html += '<div class="editor-card__body">';
    html += renderField('background', promo, isRetailer);
    html += '</div></div>';

    html += '</div>';
    return html;
  }

  // ── Column 4: Preview + Hero Image + Background Image ─────────────

  function renderColumn4(promo, isRetailer) {
    var html = '<div class="editor-card-col">';

    // Preview Card
    html += '<div class="editor-card">';
    html += '<div class="editor-card__header">Preview Promotion</div>';
    html += '<div class="editor-card__body">';
    html += '<div class="preview-placeholder">IMAGE UNAVAILABLE</div>';
    html += '</div></div>';

    // Hero Image
    html += '<div class="editor-card">';
    html += '<div class="editor-card__header">Hero Image</div>';
    html += '<div class="editor-card__body">';
    html += '<button class="add-media-btn"><i class="pi pi-image"></i> Add Media</button>';
    html += '</div></div>';

    // Background Image
    html += '<div class="editor-card">';
    html += '<div class="editor-card__header">Background Image</div>';
    html += '<div class="editor-card__body">';
    html += '<button class="add-media-btn"><i class="pi pi-image"></i> Add Media</button>';
    html += '</div></div>';

    html += '</div>';
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
      html += '<div style="display:flex;flex-direction:column;gap:var(--dh-space-xs)">';
      html += '<div><label class="form-label" style="font-size:0.65rem;color:var(--dh-color-primary);margin-bottom:2px">Starts on</label>';
      html += '<input type="datetime-local" class="form-input' + disabledClass + '" value="' + (promo.validFrom ? promo.validFrom + 'T12:00' : '') + '"' + disabledAttr + '></div>';
      html += '<div><label class="form-label" style="font-size:0.65rem;color:var(--dh-color-primary);margin-bottom:2px">Expires</label>';
      html += '<input type="datetime-local" class="form-input' + disabledClass + '" value="' + (promo.validTo ? promo.validTo + 'T23:59' : '') + '"' + disabledAttr + '></div>';
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
    var html = '<div style="display:flex;flex-direction:column;gap:var(--dh-space-xs)">';

    // Color picker row
    html += '<div>';
    html += '<label class="form-label" style="font-size:0.65rem;margin-bottom:2px">Background Color</label>';
    html += '<div style="display:flex;gap:var(--dh-space-2xs);align-items:center">';
    html += '<input type="color" class="form-input' + disabledClass + '" value="' + (bg.backgroundColor || '#ffffff') + '"' + disabledAttr + ' style="height:30px;width:30px;padding:2px;flex-shrink:0">';
    html += '<input type="text" class="form-input' + disabledClass + '" value="' + (bg.backgroundColor || '#FFFFFF').replace('#', '') + '"' + disabledAttr + ' style="flex:1" placeholder="Hex">';
    html += '</div>';
    html += '</div>';

    // Background Image
    html += '<div>';
    html += '<label class="form-label" style="font-size:0.65rem;margin-bottom:2px">Background Image</label>';
    html += '<button class="add-media-btn"><i class="pi pi-image"></i> Add Media</button>';
    html += '</div>';

    // Position & Size row
    html += '<div style="display:flex;gap:var(--dh-space-xs)">';
    html += '<div style="flex:1">';
    html += '<label class="form-label" style="font-size:0.65rem;margin-bottom:2px">Position</label>';
    html += '<select class="form-select' + (isLocked ? ' form-select--disabled' : '') + '"' + disabledAttr + '>';
    ['Center Center', 'Top Left', 'Top Center', 'Top Right', 'Center Left', 'Center Right', 'Bottom Left', 'Bottom Center', 'Bottom Right'].forEach(function (p) {
      var sel = (bg.position || 'center') === p.toLowerCase().replace(' ', ' ') ? ' selected' : '';
      html += '<option value="' + p + '"' + sel + '>' + p + '</option>';
    });
    html += '</select>';
    html += '</div>';
    html += '<div style="flex:1">';
    html += '<label class="form-label" style="font-size:0.65rem;margin-bottom:2px">Size</label>';
    html += '<select class="form-select' + (isLocked ? ' form-select--disabled' : '') + '"' + disabledAttr + '>';
    ['Cover', 'Contain', 'Auto'].forEach(function (s) {
      var sel = (bg.size || 'cover') === s.toLowerCase() ? ' selected' : '';
      html += '<option value="' + s.toLowerCase() + '"' + sel + '>' + s + '</option>';
    });
    html += '</select>';
    html += '</div>';
    html += '</div>';

    // Repeat
    html += '<div>';
    html += '<label class="form-label" style="font-size:0.65rem;margin-bottom:2px">Repeat</label>';
    html += '<select class="form-select' + (isLocked ? ' form-select--disabled' : '') + '"' + disabledAttr + '>';
    ['No Repeat', 'Repeat', 'Repeat X', 'Repeat Y'].forEach(function (r) {
      var val = r.toLowerCase().replace(' ', '-');
      var sel = (bg.repeat || 'no-repeat') === val ? ' selected' : '';
      html += '<option value="' + val + '"' + sel + '>' + r + '</option>';
    });
    html += '</select>';
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
