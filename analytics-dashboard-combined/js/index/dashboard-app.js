/* ============================================================
   UX-846 L0 — Dashboard app (prototype)

   Boots the configurable KPI cell grid on index.html.
   - Reads mode + cell order from localStorage (key: dashboard-cells-v1)
   - Renders cells via CELL_REGISTRY (see dashboard-registry.js)
   - Wires mode switcher (Engagement / Distribution / Combined)
   - Re-renders on dashboard:dataRefresh
   - Customize modal stubbed — TODO once viz lands

   Angular port: replace fn refs with KpiCellRegistry service +
   ngComponentOutlet. See memory pin
   analytics-kpi-cell-registry-pattern.md.
   ============================================================ */
(function () {
  'use strict';

  var STORAGE_KEY = 'dashboard-cells-v1';
  var DEFAULT_CONFIG = { mode: 'combined', cells: null }; // null cells = use defaults

  function loadConfig() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      return saved || Object.assign({}, DEFAULT_CONFIG);
    } catch (e) {
      console.warn('dashboard-app: invalid saved config, falling back to defaults', e);
      return Object.assign({}, DEFAULT_CONFIG);
    }
  }

  function saveConfig(cfg) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg)); }
    catch (e) { console.warn('dashboard-app: failed to persist config', e); }
  }

  function renderGrid(cfg) {
    var grid = document.getElementById('dash-cell-grid');
    if (!grid || typeof window.getDashboardCells !== 'function') return;

    var cells = window.getDashboardCells(cfg.mode, cfg.cells);
    if (!cells.length) {
      grid.innerHTML = '<div class="dash-empty">No cells enabled for this mode. Use Customize to add cells.</div>';
      return;
    }

    grid.innerHTML = cells.map(function (entry) {
      try {
        var data = entry.dataSource();
        return entry.render(data);
      } catch (e) {
        console.error('dashboard-app: render failed for', entry.storyId, e);
        return '<div class="dash-cell-error">Cell "' + entry.storyId + '" failed to render.</div>';
      }
    }).join('');

    grid.setAttribute('data-mode', cfg.mode);
    grid.setAttribute('data-cell-count', cells.length);
  }

  function initModeSwitcher(cfg) {
    var switcher = document.getElementById('dash-mode-switcher');
    if (!switcher) return;

    // Reflect current mode in active button
    switcher.querySelectorAll('.dash-mode-btn').forEach(function (btn) {
      var on = btn.dataset.dashMode === cfg.mode;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
    });

    switcher.addEventListener('click', function (e) {
      var btn = e.target.closest('.dash-mode-btn');
      if (!btn) return;
      var mode = btn.dataset.dashMode;
      if (!mode || mode === cfg.mode) return;
      cfg.mode = mode;
      saveConfig(cfg);
      switcher.querySelectorAll('.dash-mode-btn').forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('active', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      renderGrid(cfg);
    });
  }

  function initCustomizeBtn(cfg) {
    var btn = document.getElementById('dash-customize-btn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      // TODO: replace stub w/ modal (checkbox + up/down arrows + reset)
      var enabled = (cfg.cells && cfg.cells.length)
        ? cfg.cells
        : window.getDashboardCells(cfg.mode).map(function (e) { return e.storyId; });
      alert('Customize modal coming next iteration.\n\nCurrently enabled (' + enabled.length + '):\n' + enabled.join('\n'));
    });
  }

  function init() {
    if (!document.getElementById('dash-cell-grid')) return; // not on the dashboard page
    var cfg = loadConfig();
    initModeSwitcher(cfg);
    initCustomizeBtn(cfg);
    renderGrid(cfg);

    // Re-render on shared data refresh (existing event used across pages)
    document.addEventListener('dashboard:dataRefresh', function () { renderGrid(cfg); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
