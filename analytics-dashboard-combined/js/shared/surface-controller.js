// UX-846 Phase 1 — Surface controller.
// Single source of truth for Standard/Advanced surface state.
// URL param ?advanced=1 + localStorage + body[data-advanced] are projections.

(function () {
  const STORAGE_KEY = 'ux846.advanced';
  const URL_PARAM = 'advanced';
  const BODY_ATTR = 'data-advanced';

  function readUrl() {
    const v = new URLSearchParams(window.location.search).get(URL_PARAM);
    return v === '1' ? 'on' : v === '0' ? 'off' : null;
  }

  function readStorage() {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
  }

  function writeStorage(state) {
    try { localStorage.setItem(STORAGE_KEY, state); } catch {}
  }

  function syncUrl(state) {
    const url = new URL(window.location.href);
    if (state === 'on') url.searchParams.set(URL_PARAM, '1');
    else url.searchParams.delete(URL_PARAM);
    window.history.replaceState({}, '', url.toString());
  }

  function applyBody(state) {
    document.body.setAttribute(BODY_ATTR, state);
  }

  function getAdvanced() {
    return document.body.getAttribute(BODY_ATTR) === 'on';
  }

  function setAdvanced(on) {
    const state = on ? 'on' : 'off';
    applyBody(state);
    writeStorage(state);
    syncUrl(state);
    document.dispatchEvent(new CustomEvent('ux846:advanced-change', { detail: { advanced: on } }));
    refreshToggleUi();
  }

  function refreshToggleUi() {
    const btn = document.getElementById('ux846-advanced-toggle');
    if (!btn) return;
    const on = getAdvanced();
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.classList.toggle('is-on', on);
  }

  function resolveInitialState() {
    const fromUrl = readUrl();
    if (fromUrl) return fromUrl;
    const fromStorage = readStorage();
    if (fromStorage === 'on' || fromStorage === 'off') return fromStorage;
    return 'off';
  }

  function init() {
    applyBody(resolveInitialState());
    // Toggle button injected by the shell partial. Wire it up if present.
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('#ux846-advanced-toggle');
      if (!btn) return;
      setAdvanced(!getAdvanced());
    });
    // After chrome injection by shell-loader, re-sync button UI.
    document.addEventListener('engagement-shell:loaded', refreshToggleUi);
    document.addEventListener('ux846:chrome-ready', refreshToggleUi);
    refreshToggleUi();
  }

  window.UX846Surface = { getAdvanced, setAdvanced };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
