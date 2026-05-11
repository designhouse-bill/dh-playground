/**
 * engagement-url-sync.js — UX-846 Step 4
 *
 * Two-way sync between engagement-page context state and URL.
 *
 *   state → URL   on dashboard:dataRefresh (week / entity changes)
 *   URL   → state already handled by shared-core.initializeContext
 *                 (extended in same step to honor entity param)
 *
 * Param vocabulary (matches StateManager.parseUrlParams):
 *   pub      — selectedWeekId (e.g. "week-47")
 *   entity   — currentEntity.id (e.g. "all", "brand-x", "store-336")
 *
 * Persisted via history.replaceState so the back button is not polluted
 * by every selector change.
 *
 * Angular mapping: Router with queryParamsHandling: 'merge' subscribes
 * to a context store; component effects push params on change.
 */
(function () {
  'use strict';

  function writeUrl() {
    if (typeof window.DashboardCore === 'undefined') return;
    const state = window.DashboardCore.getState?.();
    if (!state) return;

    const url = new URL(window.location.href);
    if (state.selectedWeekId) {
      url.searchParams.set('pub', state.selectedWeekId);
    }
    const entityId = state.currentEntity?.id || state.selectedEntityId;
    if (entityId) {
      url.searchParams.set('entity', entityId);
    }
    window.history.replaceState({}, '', url.toString());
    document.dispatchEvent(new CustomEvent('engagement-url:updated'));
  }

  document.addEventListener('dashboard:dataRefresh', writeUrl);
})();
