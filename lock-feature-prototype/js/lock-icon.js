/* ==========================================================================
   Lock Icon — Renderers for lock icons, toolbar, summary panel, badges
   Exposes window.lockIcon
   ========================================================================== */

(function () {
  'use strict';

  var FIELDS = window.lockState.LOCKABLE_FIELDS;

  // ── Lock Icon (field-level) ────────────────────────────────────────

  /**
   * Returns HTML string for a lock icon next to a field label.
   * @param {string} fieldKey
   * @param {object} promo
   * @param {boolean} readonly - true for retailer view
   * @returns {string} HTML
   */
  function renderLockIcon(fieldKey, promo, readonly) {
    var state = window.lockService.getFieldState(promo, fieldKey);
    var iconClass, stateClass, piIcon, tooltip;

    if (state === 'locked') {
      piIcon = 'pi-lock';
      stateClass = 'lock-icon--locked';
      tooltip = readonly ? window.lockService.getLockedByLabel(promo) : 'Click to change lock state';
    } else if (state === 'constrained') {
      piIcon = 'pi-lock';
      stateClass = 'lock-icon--constrained';
      tooltip = readonly ? window.lockService.getLockedByLabel(promo) : 'Click to change lock state';
    } else {
      piIcon = 'pi-lock-open';
      stateClass = 'lock-icon--open';
      tooltip = readonly ? '' : 'Click to lock';
    }

    var readonlyClass = readonly ? ' lock-icon--readonly' : '';
    var clickAttr = readonly ? '' : ' data-lock-field="' + fieldKey + '"';
    var tooltipAttr = tooltip ? ' data-tooltip="' + tooltip + '"' : '';

    return '<span class="lock-icon ' + stateClass + readonlyClass + '"' +
      clickAttr + tooltipAttr + '>' +
      '<i class="pi ' + piIcon + '"></i>' +
      '</span>';
  }

  // ── Row-Level Lock Icon (table Lock column) ────────────────────────

  function renderRowLockIcon(promo) {
    var stateClass = window.lockService.getSummaryIconClass(promo);
    var piIcon = window.lockService.getSummaryPiIcon(promo);
    var tooltip = window.lockService.getSummaryTooltip(promo);

    return '<span class="row-lock-icon ' + stateClass + '"' +
      ' data-tooltip="' + tooltip + '">' +
      '<i class="pi ' + piIcon + '"></i>' +
      '</span>';
  }

  // ── Lock Toolbar (Wholesaler only) ─────────────────────────────────

  function renderLockToolbar(promoHash) {
    return '<div class="lock-toolbar">' +
      '<button class="btn btn--sm" data-lock-action="lock-all" data-promo="' + promoHash + '">' +
        '<i class="pi pi-lock"></i> Lock All' +
      '</button>' +
      '<button class="btn btn--sm" data-lock-action="unlock-all" data-promo="' + promoHash + '">' +
        '<i class="pi pi-lock-open"></i> Unlock All' +
      '</button>' +
      '<span class="lock-toolbar__spacer"></span>' +
      '<button class="btn btn--sm btn--primary" data-lock-action="toggle-summary" data-promo="' + promoHash + '">' +
        '<i class="pi pi-list"></i> Lock Summary' +
      '</button>' +
    '</div>';
  }

  // ── Lock Summary Panel ─────────────────────────────────────────────

  function renderLockSummaryPanel(promo, readonly) {
    var data = window.lockService.getLockSummaryData(promo);
    var html = '<div class="lock-summary" id="lock-summary-panel">';

    // Header
    html += '<div class="lock-summary__header">' +
      '<span>Lock Summary</span>' +
    '</div>';

    // Totals
    html += '<div class="lock-summary__totals">' +
      '<span style="color:var(--lock-color-locked);font-weight:600">' + data.locked + ' locked</span>, ' +
      '<span style="color:var(--dh-color-primary);font-weight:600">' + data.constrained + ' constrained</span>, ' +
      '<span style="color:var(--lock-color-open);font-weight:600">' + data.open + ' open</span> ' +
      'of ' + data.total + ' fields' +
    '</div>';

    // Field list
    html += '<ul class="lock-summary__list">';
    data.fields.forEach(function (f) {
      var itemClass = readonly ? ' lock-summary__item--readonly' : '';
      var clickAttr = readonly ? '' : ' data-summary-toggle="' + f.key + '"';

      html += '<li class="lock-summary__item' + itemClass + '"' + clickAttr + '>';

      // Field name
      html += '<span class="lock-summary__field-name">' + f.displayName + '</span>';

      // State badge
      html += '<span class="lock-summary__field-state lock-summary__field-state--' + f.state + '">';
      if (f.state === 'locked') html += '<i class="pi pi-lock"></i> ';
      else if (f.state === 'constrained') html += '<i class="pi pi-lock"></i> ';
      else html += '<i class="pi pi-lock-open"></i> ';
      html += f.state;
      html += '</span>';

      // Constraint range
      if (f.constraint) {
        html += '<span class="lock-summary__constraint">$' +
          f.constraint.min.toFixed(2) + ' – $' + f.constraint.max.toFixed(2) +
        '</span>';
      }

      html += '</li>';
    });
    html += '</ul></div>';

    return html;
  }

  // ── Section Lock Badge (accordion header) ──────────────────────────

  function renderSectionLockBadge(promo, sectionName, isRetailer) {
    if (!window.lockService.isSectionFullyLocked(promo, sectionName)) return '';

    var label = isRetailer
      ? '<i class="pi pi-lock"></i> Category Locked'
      : '<i class="pi pi-lock"></i> Locked';

    return '<span class="section-lock-badge">' + label + '</span>';
  }

  // ── Constraint Range Inputs (Wholesaler) ───────────────────────────

  function renderConstraintInputs(fieldKey, promo, readonly) {
    var range = window.lockService.getConstraintRange(promo, fieldKey);
    if (!range) return '';

    if (readonly) {
      return '<div class="constraint-hint">Allowed: $' +
        range.min.toFixed(2) + ' – $' + range.max.toFixed(2) +
      '</div>';
    }

    return '<div class="constraint-range">' +
      '<span class="constraint-range__label">Range:</span>' +
      '<span class="constraint-range__label">$</span>' +
      '<input type="number" class="constraint-range__input" ' +
        'data-constraint-field="' + fieldKey + '" data-constraint-bound="min" ' +
        'value="' + range.min.toFixed(2) + '" step="0.01" min="0">' +
      '<span class="constraint-range__separator">–</span>' +
      '<span class="constraint-range__label">$</span>' +
      '<input type="number" class="constraint-range__input" ' +
        'data-constraint-field="' + fieldKey + '" data-constraint-bound="max" ' +
        'value="' + range.max.toFixed(2) + '" step="0.01" min="0">' +
    '</div>';
  }

  // ── Public API ─────────────────────────────────────────────────────

  window.lockIcon = {
    renderLockIcon: renderLockIcon,
    renderRowLockIcon: renderRowLockIcon,
    renderLockToolbar: renderLockToolbar,
    renderLockSummaryPanel: renderLockSummaryPanel,
    renderSectionLockBadge: renderSectionLockBadge,
    renderConstraintInputs: renderConstraintInputs
  };
})();
