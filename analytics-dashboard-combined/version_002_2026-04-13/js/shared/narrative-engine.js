/**
 * Narrative Engine — interpretive summary stub.
 *
 * Deferred from phase 1 per Apr 17 Max meeting. This stub is the scaffold
 * so phase 2 can add the algorithm without any DOM or callsite changes.
 *
 * When enabled (FEATURES.narrative === true), each section asks:
 *   NarrativeEngine.getInsight('visitation', context) → string | null
 *
 * Phase 2 work:
 *   1. Flip FEATURES.narrative to true in app-config.js
 *   2. Implement per-section rules inside getInsight()
 *   3. Style .insight-banner visible state in CSS (or keep current style)
 *
 * Algorithm source: pending Adam's store-health grading decision.
 */
window.NarrativeEngine = (function () {
  'use strict';

  function isEnabled() {
    return window.FEATURES && window.FEATURES.narrative === true;
  }

  /**
   * getInsight — returns a narrative string for a given section + context,
   * or null if the engine is disabled or has nothing to say.
   *
   * @param {string} section  'visitation' | 'media' | 'traffic' | 'demographics'
   * @param {object} context  current app context (entity, week, trends, etc.)
   * @returns {string|null}
   */
  function getInsight(section, context) {
    if (!isEnabled()) return null;
    // Phase 2 implementation goes here.
    // Example shape of output:
    //   "Traffic share held at 42% this week. You gained 1.3 pp vs. Walmart."
    return null;
  }

  /**
   * renderInto — look up the slot for a section and write the insight.
   * No-op when disabled or when the slot is missing.
   */
  function renderInto(section, context) {
    var slot = document.querySelector('.insight-banner[data-narrative-section="' + section + '"]');
    if (!slot) return;
    var text = getInsight(section, context);
    if (text) {
      slot.textContent = text;
      slot.hidden = false;
    } else {
      slot.textContent = '';
      slot.hidden = true;
    }
  }

  return { isEnabled: isEnabled, getInsight: getInsight, renderInto: renderInto };
})();
