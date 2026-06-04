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
   - Customize modal: toggle cells on/off + up/down reorder + reset,
     persisted to localStorage. Reuses the LOCKED .modal-overlay/.modal
     shell (UI-PATTERNS §8.1); no DashboardModals fork, no new global.
     Drag/drop reorder is the deferred stretch (plan L0 out-of-scope).

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

  // ── Customize modal ────────────────────────────────────────────
  // Working draft of the enabled+ordered storyId list while the modal is
  // open. Committed to cfg.cells on Save, discarded on Cancel/close.
  var draftOrder = null;

  function currentEnabledIds(cfg) {
    // The effective enabled+ordered list for the active mode.
    return window.getDashboardCells(cfg.mode, cfg.cells).map(function (e) { return e.storyId; });
  }

  function ensureModal() {
    var existing = document.getElementById('dash-customize-modal');
    if (existing) return existing;
    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'dash-customize-modal';
    overlay.innerHTML = ''
      + '<div class="modal">'
      +   '<div class="modal-header">'
      +     '<div class="modal-header-title"><h3 class="modal-title">Customize dashboard</h3></div>'
      +     '<button class="modal-close" type="button" data-dash-customize-close aria-label="Close">'
      +       '<span class="material-symbols-outlined">close</span>'
      +     '</button>'
      +   '</div>'
      +   '<div class="modal-body">'
      +     '<p class="dash-customize__hint">Toggle cells on or off, and reorder with the arrows. Showing cells available in the current <strong data-dash-customize-mode></strong> view.</p>'
      +     '<ol class="dash-customize__list" id="dash-customize-list"></ol>'
      +   '</div>'
      +   '<div class="modal-footer modal-footer--split">'
      +     '<button class="modal-btn modal-btn--text" type="button" data-dash-customize-reset>Reset to default</button>'
      +     '<div class="dash-customize__footer-right">'
      +       '<button class="modal-btn modal-btn--secondary" type="button" data-dash-customize-close>Cancel</button>'
      +       '<button class="modal-btn modal-btn--primary" type="button" data-dash-customize-save>Save</button>'
      +     '</div>'
      +   '</div>'
      + '</div>';
    document.body.appendChild(overlay);
    return overlay;
  }

  function renderCustomizeRows(cfg) {
    var list = document.getElementById('dash-customize-list');
    if (!list) return;
    var all = window.getAllDashboardCells(cfg.mode);
    var byId = {};
    all.forEach(function (e) { byId[e.storyId] = e; });

    // Enabled rows first (in draft order), then disabled rows (default order).
    var enabled = draftOrder.filter(function (id) { return byId[id]; });
    var disabled = all.filter(function (e) { return draftOrder.indexOf(e.storyId) === -1; })
                      .map(function (e) { return e.storyId; });
    var rowIds = enabled.concat(disabled);

    list.innerHTML = rowIds.map(function (id, i) {
      var e = byId[id];
      var label = (window.CELL_LABELS && window.CELL_LABELS[id]) || e.story || id;
      var on = draftOrder.indexOf(id) !== -1;
      var enabledPos = enabled.indexOf(id); // -1 if disabled
      var isFirst = enabledPos === 0;
      var isLast = enabledPos === enabled.length - 1;
      return ''
        + '<li class="dash-customize__row' + (on ? '' : ' dash-customize__row--off') + '" data-story-id="' + id + '">'
        +   '<label class="dash-customize__toggle">'
        +     '<input type="checkbox" ' + (on ? 'checked' : '') + ' data-dash-toggle>'
        +     '<span class="dash-customize__name">' + label + '</span>'
        +   '</label>'
        +   '<span class="dash-customize__product dash-customize__product--' + e.product + '">' + e.product + '</span>'
        +   '<span class="dash-customize__arrows">'
        +     '<button type="button" class="dash-customize__arrow" data-dash-up aria-label="Move up"' + ((!on || isFirst) ? ' disabled' : '') + '><span class="material-symbols-outlined">keyboard_arrow_up</span></button>'
        +     '<button type="button" class="dash-customize__arrow" data-dash-down aria-label="Move down"' + ((!on || isLast) ? ' disabled' : '') + '><span class="material-symbols-outlined">keyboard_arrow_down</span></button>'
        +   '</span>'
        + '</li>';
    }).join('');
  }

  function openCustomize(cfg) {
    var overlay = ensureModal();
    draftOrder = currentEnabledIds(cfg);
    var modeEl = overlay.querySelector('[data-dash-customize-mode]');
    if (modeEl) modeEl.textContent = (MODE_LABELS[cfg.mode] || 'Combined view').replace(' view', '');
    renderCustomizeRows(cfg);
    overlay.classList.add('active');
  }

  function closeCustomize() {
    var overlay = document.getElementById('dash-customize-modal');
    if (overlay) overlay.classList.remove('active');
    draftOrder = null;
  }

  function moveDraft(id, dir) {
    var i = draftOrder.indexOf(id);
    if (i === -1) return;
    var j = i + dir;
    if (j < 0 || j >= draftOrder.length) return;
    var tmp = draftOrder[i]; draftOrder[i] = draftOrder[j]; draftOrder[j] = tmp;
  }

  function initCustomizeBtn(cfg) {
    var btn = document.getElementById('dash-customize-btn');
    if (!btn) return;
    btn.addEventListener('click', function () { openCustomize(cfg); });

    // Delegated handlers on the (lazily-created) modal.
    document.addEventListener('click', function (e) {
      var overlay = document.getElementById('dash-customize-modal');
      if (!overlay || !overlay.classList.contains('active')) return;

      if (e.target === overlay) { closeCustomize(); return; } // click backdrop
      if (e.target.closest('[data-dash-customize-close]')) { closeCustomize(); return; }

      if (e.target.closest('[data-dash-customize-reset]')) {
        draftOrder = window.getAllDashboardCells(cfg.mode).map(function (en) { return en.storyId; });
        renderCustomizeRows(cfg);
        return;
      }

      if (e.target.closest('[data-dash-customize-save]')) {
        // Persist the full effective list: draft (this mode) + any enabled
        // cells from other modes that the user didn't see, so switching modes
        // doesn't silently wipe the other product's customization.
        var others = (cfg.cells || []).filter(function (id) {
          var entry = window.CELL_REGISTRY[id];
          if (!entry) return false;
          if (cfg.mode === 'engagement')   return entry.product !== 'engagement';
          if (cfg.mode === 'distribution') return entry.product !== 'distribution';
          return false; // combined mode saw everything
        });
        cfg.cells = draftOrder.concat(others);
        saveConfig(cfg);
        renderGrid(cfg);
        closeCustomize();
        return;
      }

      var row = e.target.closest('.dash-customize__row');
      if (!row) return;
      var id = row.getAttribute('data-story-id');

      if (e.target.closest('[data-dash-up]'))   { moveDraft(id, -1); renderCustomizeRows(cfg); return; }
      if (e.target.closest('[data-dash-down]')) { moveDraft(id,  1); renderCustomizeRows(cfg); return; }
    });

    // Toggle checkboxes (change event — separate from click delegation).
    document.addEventListener('change', function (e) {
      var overlay = document.getElementById('dash-customize-modal');
      if (!overlay || !overlay.classList.contains('active')) return;
      if (!e.target.matches('[data-dash-toggle]')) return;
      var row = e.target.closest('.dash-customize__row');
      if (!row) return;
      var id = row.getAttribute('data-story-id');
      if (e.target.checked) { if (draftOrder.indexOf(id) === -1) draftOrder.push(id); }
      else { draftOrder = draftOrder.filter(function (x) { return x !== id; }); }
      renderCustomizeRows(cfg);
    });

    // Esc closes.
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var overlay = document.getElementById('dash-customize-modal');
      if (overlay && overlay.classList.contains('active')) closeCustomize();
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
