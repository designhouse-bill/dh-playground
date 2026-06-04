/* ============================================================
   UX-846 L0 — Dashboard app

   Boots the configurable KPI cell grid on index.html.
   - Reads mode + cell order from localStorage (key: dashboard-cells-v1)
   - Renders cells via CELL_REGISTRY (see dashboard-registry.js)
   - Wires mode switcher (Engagement / Distribution / Combined) using
     the LOCKED .perf-tabs / .perf-tab grammar — same pattern used by
     Engagement Report. No custom segmented control.
   - Updates stat-strip cohort sentence (cell count + mode label)
   - Re-renders on dashboard:dataRefresh
   - Customize button stubbed; modal lands next iteration.

   Angular port: replace fn refs with KpiCellRegistry service +
   ngComponentOutlet. See memory pin
   analytics-kpi-cell-registry-pattern.md.
   ============================================================ */
(function () {
  'use strict';

  var STORAGE_KEY = 'dashboard-cells-v1';
  var DEFAULT_CONFIG = { mode: 'combined', cells: null };

  var MODE_LABELS = {
    engagement:   'Engagement view',
    distribution: 'Distribution view',
    combined:     'Combined view'
  };

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

  function updateStatStrip(cfg, cellCount) {
    var countEl = document.getElementById('dash-cell-count');
    var labelEl = document.getElementById('dash-mode-label');
    if (countEl) countEl.textContent = cellCount + ' cell' + (cellCount === 1 ? '' : 's');
    if (labelEl) labelEl.textContent = MODE_LABELS[cfg.mode] || 'Combined view';
  }

  function renderGrid(cfg) {
    var grid = document.getElementById('dash-cell-grid');
    if (!grid || typeof window.getDashboardCells !== 'function') return;

    var cells = window.getDashboardCells(cfg.mode, cfg.cells);
    if (!cells.length) {
      grid.innerHTML = '<div class="dash-empty">No cells enabled for this mode. Use Customize to add cells.</div>';
      updateStatStrip(cfg, 0);
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
    updateStatStrip(cfg, cells.length);
  }

  function initModeSwitcher(cfg) {
    var tabs = document.getElementById('dash-mode-tabs');
    if (!tabs) return;

    // Sync visual active state to current cfg (perf-tab--active is the locked class)
    tabs.querySelectorAll('.perf-tab').forEach(function (btn) {
      var on = btn.dataset.dashMode === cfg.mode;
      btn.classList.toggle('perf-tab--active', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
    });

    tabs.addEventListener('click', function (e) {
      var btn = e.target.closest('.perf-tab[data-dash-mode]');
      if (!btn) return;
      var mode = btn.dataset.dashMode;
      if (!mode || mode === cfg.mode) return;
      cfg.mode = mode;
      saveConfig(cfg);
      tabs.querySelectorAll('.perf-tab').forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('perf-tab--active', on);
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
    document.addEventListener('dashboard:dataRefresh', function () { renderGrid(cfg); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
