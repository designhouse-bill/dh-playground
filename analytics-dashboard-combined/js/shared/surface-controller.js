// Surface controller — single source of truth for the engagement section
// view state. Two values:
//   "summary"  — the 3-card overview layout (default).
//   "detail"   — single sub-pane drilldown with .ep-sub-tabs nav visible.
//
// Drives body[data-view], persists in localStorage and the ?view= URL
// param so deep links stay consistent.

(function () {
  const STORAGE_KEY = 'ux846.view';
  const URL_PARAM = 'view';
  const BODY_ATTR = 'data-view';
  const VALID = { summary: 1, detail: 1 };

  function readUrl() {
    const v = new URLSearchParams(window.location.search).get(URL_PARAM);
    return VALID[v] ? v : null;
  }

  function readStorage() {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      return VALID[v] ? v : null;
    } catch {
      return null;
    }
  }

  function writeStorage(view) {
    try { localStorage.setItem(STORAGE_KEY, view); } catch {}
  }

  function syncUrl(view) {
    const url = new URL(window.location.href);
    if (view === 'detail') url.searchParams.set(URL_PARAM, 'detail');
    else url.searchParams.delete(URL_PARAM);
    window.history.replaceState({}, '', url.toString());
  }

  function applyBody(view) {
    document.body.setAttribute(BODY_ATTR, view);
  }

  function getView() {
    return document.body.getAttribute(BODY_ATTR) || 'summary';
  }

  function setView(view) {
    if (!VALID[view]) return;
    applyBody(view);
    writeStorage(view);
    syncUrl(view);
    document.dispatchEvent(new CustomEvent('ux846:view-change', { detail: { view } }));
  }

  function resolveInitialView() {
    return readUrl() || readStorage() || 'summary';
  }

  function init() {
    applyBody(resolveInitialView());
    // Switching metric perf-tabs always re-enters the section at the
    // summary view, never at the deep sub-pane the user was last in.
    document.addEventListener('click', (e) => {
      if (e.target.closest('.perf-tab')) setView('summary');
    });
  }

  window.UX846Surface = { getView, setView };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
