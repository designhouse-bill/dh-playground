/* ==========================================================================
   Lock Service — Pure lock logic functions
   Exposes window.lockService
   ========================================================================== */

(function () {
  'use strict';

  var FIELDS = window.lockState.LOCKABLE_FIELDS;
  var SECTIONS = window.lockState.SECTIONS;

  // ── Helpers ───────────────────────────────────────────────────────────

  function ensureLockConfig(promo) {
    if (!promo.lockConfig) {
      promo.lockConfig = buildDefaultLockConfig();
    }
    if (!promo.lockConfig.attributes) {
      promo.lockConfig.attributes = {};
    }
    return promo.lockConfig;
  }

  function buildDefaultLockConfig() {
    return {
      global: 'none',
      attributes: {},
      lockedBy: 'Midwest Grocery Co.',
      lockedAt: new Date().toISOString()
    };
  }

  function cloneConfig(config) {
    return JSON.parse(JSON.stringify(config));
  }

  // ── Field State ───────────────────────────────────────────────────────

  /** Returns 'open' | 'locked' | 'constrained' for a given field key */
  function getFieldState(promo, fieldKey) {
    if (!promo || !promo.lockConfig || !promo.lockConfig.attributes) return 'open';
    var attr = promo.lockConfig.attributes[fieldKey];
    if (!attr) return 'open';
    return attr.state || 'open';
  }

  /** Get constraint range for a field (returns { min, max } or null) */
  function getConstraintRange(promo, fieldKey) {
    if (!promo || !promo.lockConfig || !promo.lockConfig.attributes) return null;
    var attr = promo.lockConfig.attributes[fieldKey];
    if (!attr || attr.state !== 'constrained') return null;
    return { min: attr.min, max: attr.max };
  }

  // ── Toggle ────────────────────────────────────────────────────────────

  /** Cycle: open → locked → constrained (if supported) → open */
  function toggleLockState(promo, fieldKey) {
    var config = ensureLockConfig(promo);
    var fieldDef = FIELDS[fieldKey];
    if (!fieldDef) return;

    var current = getFieldState(promo, fieldKey);

    if (current === 'open') {
      config.attributes[fieldKey] = { state: 'locked' };
    } else if (current === 'locked') {
      if (fieldDef.supportsConstrained) {
        config.attributes[fieldKey] = { state: 'constrained', min: 0, max: 0 };
      } else {
        delete config.attributes[fieldKey];
      }
    } else {
      // constrained → open
      delete config.attributes[fieldKey];
    }

    config.lockedAt = new Date().toISOString();
  }

  // ── Bulk Operations ───────────────────────────────────────────────────

  function lockAll(promo) {
    var config = ensureLockConfig(promo);
    Object.keys(FIELDS).forEach(function (key) {
      config.attributes[key] = { state: 'locked' };
    });
    config.lockedAt = new Date().toISOString();
  }

  function unlockAll(promo) {
    var config = ensureLockConfig(promo);
    config.attributes = {};
    config.lockedAt = new Date().toISOString();
  }

  // ── Query Functions ───────────────────────────────────────────────────

  function hasAnyLocks(promo) {
    if (!promo || !promo.lockConfig || !promo.lockConfig.attributes) return false;
    var attrs = promo.lockConfig.attributes;
    return Object.keys(attrs).some(function (key) {
      return attrs[key].state === 'locked' || attrs[key].state === 'constrained';
    });
  }

  function isFullyLocked(promo) {
    if (!promo || !promo.lockConfig || !promo.lockConfig.attributes) return false;
    var attrs = promo.lockConfig.attributes;
    return Object.keys(FIELDS).every(function (key) {
      return attrs[key] && (attrs[key].state === 'locked' || attrs[key].state === 'constrained');
    });
  }

  function isSectionFullyLocked(promo, sectionName) {
    var fieldKeys = SECTIONS[sectionName];
    if (!fieldKeys || fieldKeys.length === 0) return false;
    return fieldKeys.every(function (key) {
      var s = getFieldState(promo, key);
      return s === 'locked' || s === 'constrained';
    });
  }

  // ── Constraint Range ──────────────────────────────────────────────────

  function updateConstraintRange(promo, fieldKey, min, max) {
    var config = ensureLockConfig(promo);
    var fieldDef = FIELDS[fieldKey];
    if (!fieldDef || !fieldDef.supportsConstrained) return;

    config.attributes[fieldKey] = {
      state: 'constrained',
      min: parseFloat(min) || 0,
      max: parseFloat(max) || 0
    };
    config.lockedAt = new Date().toISOString();
  }

  // ── Summary / Display ─────────────────────────────────────────────────

  /** Returns state class for the row-level lock column */
  function getSummaryIconClass(promo) {
    if (isFullyLocked(promo)) return 'lock-icon--locked';
    if (hasAnyLocks(promo)) return 'lock-icon--partial';
    return 'lock-icon--open';
  }

  /** Returns PrimeIcon class for the row-level lock column */
  function getSummaryPiIcon(promo) {
    if (isFullyLocked(promo)) return 'pi-lock';
    if (hasAnyLocks(promo)) return 'pi-lock';
    return 'pi-lock-open';
  }

  /** Returns tooltip text for the row-level lock column */
  function getSummaryTooltip(promo) {
    if (isFullyLocked(promo)) return 'All fields locked';
    if (hasAnyLocks(promo)) return 'Some fields locked';
    return 'No locks';
  }

  /** Returns "Locked by ..." label */
  function getLockedByLabel(promo) {
    if (!promo || !promo.lockConfig || !promo.lockConfig.lockedBy) return '';
    return 'Locked by ' + promo.lockConfig.lockedBy;
  }

  /** Returns summary data: { locked, constrained, open, total, fields[] } */
  function getLockSummaryData(promo) {
    var locked = 0;
    var constrained = 0;
    var open = 0;
    var fields = [];

    Object.keys(FIELDS).forEach(function (key) {
      var fieldDef = FIELDS[key];
      var state = getFieldState(promo, key);
      var constraint = getConstraintRange(promo, key);

      if (state === 'locked') locked++;
      else if (state === 'constrained') constrained++;
      else open++;

      fields.push({
        key: key,
        displayName: fieldDef.displayName,
        section: fieldDef.section,
        state: state,
        supportsConstrained: fieldDef.supportsConstrained,
        constraint: constraint
      });
    });

    return {
      locked: locked,
      constrained: constrained,
      open: open,
      total: Object.keys(FIELDS).length,
      fields: fields
    };
  }

  // ── Public API ────────────────────────────────────────────────────────

  window.lockService = {
    buildDefaultLockConfig: buildDefaultLockConfig,
    cloneConfig: cloneConfig,
    ensureLockConfig: ensureLockConfig,

    getFieldState: getFieldState,
    getConstraintRange: getConstraintRange,
    toggleLockState: toggleLockState,

    lockAll: lockAll,
    unlockAll: unlockAll,

    hasAnyLocks: hasAnyLocks,
    isFullyLocked: isFullyLocked,
    isSectionFullyLocked: isSectionFullyLocked,

    updateConstraintRange: updateConstraintRange,

    getSummaryIconClass: getSummaryIconClass,
    getSummaryPiIcon: getSummaryPiIcon,
    getSummaryTooltip: getSummaryTooltip,
    getLockedByLabel: getLockedByLabel,
    getLockSummaryData: getLockSummaryData
  };
})();
