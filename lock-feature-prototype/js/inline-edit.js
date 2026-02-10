/* ==========================================================================
   Inline Edit — Double-click-to-edit table cells with lock awareness
   Exposes window.inlineEdit

   Behavior by role:
   ┌──────────────┬────────────────────────────────────────────────────────┐
   │ Wholesaler   │ All cells always editable (locks restrict retailer)   │
   │ Retailer     │ Open → editable, Locked → not-allowed + tooltip,     │
   │              │ Constrained → editable with min/max validation        │
   └──────────────┴────────────────────────────────────────────────────────┘
   ========================================================================== */

(function () {
  'use strict';

  // ── Bind ──────────────────────────────────────────────────────────────

  /**
   * Attach inline-edit behavior to all [data-inline-field] cells in a container.
   * Call after each table render (DOM is replaced each time).
   */
  function bind(container) {
    container.querySelectorAll('[data-inline-field]').forEach(function (cell) {
      var fieldKey = cell.getAttribute('data-inline-field');
      var promoHash = cell.getAttribute('data-inline-promo');
      var promo = window.lockState.getPromotion(promoHash);
      if (!promo) return;

      var isRetailer = window.lockState.state.currentProfile === 'retailer';
      var fieldState = window.lockService.getFieldState(promo, fieldKey);

      // Retailer + locked → not editable
      if (isRetailer && fieldState === 'locked') {
        cell.classList.add('cell-locked');
        cell.setAttribute('data-tooltip', 'Field locked');
        return;
      }

      // All other cases → editable (double-click)
      cell.classList.add('cell-editable');

      cell.addEventListener('dblclick', function (e) {
        e.stopPropagation();
        enterEditMode(cell);
      });
    });
  }

  // ── Enter Edit Mode ───────────────────────────────────────────────────

  function enterEditMode(cell) {
    if (cell.querySelector('.cell-edit-input')) return; // already editing

    var fieldKey = cell.getAttribute('data-inline-field');
    var promoHash = cell.getAttribute('data-inline-promo');
    var inputType = cell.getAttribute('data-inline-type') || 'text';
    var promo = window.lockState.getPromotion(promoHash);
    if (!promo) return;

    var isRetailer = window.lockState.state.currentProfile === 'retailer';
    var fieldState = window.lockService.getFieldState(promo, fieldKey);
    var currentValue = getFieldValue(promo, fieldKey);
    var originalContent = cell.innerHTML;

    // Build input
    var input = document.createElement('input');
    input.type = inputType;
    input.className = 'cell-edit-input';
    input.value = currentValue;

    // Constrained fields (retailer): set min/max on input
    var range = null;
    if (isRetailer && fieldState === 'constrained') {
      range = window.lockService.getConstraintRange(promo, fieldKey);
      if (range) {
        input.min = range.min;
        input.max = range.max;
        input.step = '0.01';
      }
    }

    cell.innerHTML = '';
    cell.appendChild(input);

    // Show constraint hint below input for retailer
    if (range) {
      var hint = document.createElement('div');
      hint.className = 'cell-edit-hint';
      hint.textContent = 'Allowed: $' + range.min.toFixed(2) + ' \u2013 $' + range.max.toFixed(2);
      cell.appendChild(hint);
    }

    cell.classList.add('cell-editing');
    input.focus();
    input.select();

    // Save on blur
    input.addEventListener('blur', function () {
      saveEdit(cell, input, promo, fieldKey, isRetailer, originalContent);
    });

    // Enter saves, Escape cancels
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        input.blur();
      } else if (e.key === 'Escape') {
        cell.innerHTML = originalContent;
        cell.classList.remove('cell-editing');
      }
    });
  }

  // ── Save Edit ─────────────────────────────────────────────────────────

  function saveEdit(cell, input, promo, fieldKey, isRetailer, originalContent) {
    var value = input.value;
    var fieldState = window.lockService.getFieldState(promo, fieldKey);

    // Validate constrained fields for retailer
    if (isRetailer && fieldState === 'constrained') {
      var range = window.lockService.getConstraintRange(promo, fieldKey);
      if (range) {
        var num = parseFloat(value);
        if (isNaN(num) || num < range.min || num > range.max) {
          // Invalid — shake + revert
          cell.classList.add('cell-invalid');
          setTimeout(function () {
            cell.classList.remove('cell-invalid');
            cell.innerHTML = originalContent;
            cell.classList.remove('cell-editing');
          }, 600);
          return;
        }
      }
    }

    // Persist value to state
    setFieldValue(promo, fieldKey, value);

    // Update cell display
    cell.classList.remove('cell-editing');
    cell.textContent = formatFieldValue(fieldKey, value);

    // Re-render bottom menu editor if open (keeps editor in sync)
    var bottomBody = document.querySelector('.bottom-menu--open .bottom-menu__body');
    if (bottomBody && window.lockState.state.selectedPromotionHash) {
      window.bottomMenuEditor.render(bottomBody);
    }
  }

  // ── Field Value Helpers ───────────────────────────────────────────────

  function getFieldValue(promo, fieldKey) {
    if (fieldKey.indexOf('.') > -1) {
      var parts = fieldKey.split('.');
      var obj = promo;
      for (var i = 0; i < parts.length; i++) {
        if (obj == null) return '';
        obj = obj[parts[i]];
      }
      return obj != null ? obj : '';
    }
    return promo[fieldKey] != null ? promo[fieldKey] : '';
  }

  function setFieldValue(promo, fieldKey, value) {
    if (fieldKey.indexOf('.') > -1) {
      var parts = fieldKey.split('.');
      var obj = promo;
      for (var i = 0; i < parts.length - 1; i++) {
        if (!obj[parts[i]]) obj[parts[i]] = {};
        obj = obj[parts[i]];
      }
      var lastKey = parts[parts.length - 1];
      if (lastKey === 'price' || lastKey === 'couponAmountOff') {
        obj[lastKey] = parseFloat(value) || 0;
      } else {
        obj[lastKey] = value;
      }
    } else {
      promo[fieldKey] = value;
    }
  }

  function formatFieldValue(fieldKey, value) {
    if (fieldKey === 'deal.price' || fieldKey === 'loyaltyDeal.price') {
      var num = parseFloat(value);
      return isNaN(num) ? '' : '$' + num.toFixed(2);
    }
    return value;
  }

  // ── Public API ────────────────────────────────────────────────────────

  window.inlineEdit = {
    bind: bind
  };
})();
