/**
 * COMPARE - A/B Comparison View for Analytics Dashboard
 * Page-specific logic for engagement-compare.html
 *
 * Features:
 * - Compare Circulars by Entity and/or Date
 * - Compare Categories by Entity, Date and/or Other Categories
 * - Compare Promotions by Entity, Date and/or Promotions from other categories
 * - Side-by-side two-column layout with synchronized scrolling
 * - Copy A to B functionality
 * - Context A persists when switching to Base/Grid modes
 */

const ComparePage = (function() {
  'use strict';

  // References to shared modules
  let core = null;
  let state = null;
  let elements = null;

  // Local state for compare mode
  let currentLayer = 'circulars';
  let contextA = {
    weekId: null,
    weekLabel: '',
    weekRange: '',
    entityId: null,
    entityName: '',
    entityLevel: '',
    entityCount: 0,
    categoryId: null,
    categoryName: '',
    promotionId: null,
    promotionName: '',
    daysFilter: 'all'
  };
  let contextB = {
    weekId: null,
    weekLabel: '',
    weekRange: '',
    entityId: null,
    entityName: '',
    entityLevel: '',
    entityCount: 0,
    categoryId: null,
    categoryName: '',
    promotionId: null,
    promotionName: '',
    daysFilter: 'all'
  };

  // Modal state
  let _currentPickerTarget = null; // 'A' or 'B'
  let _selectedCategoryId = null;
  let _selectedPromotionId = null;

  // Data cache
  let dataA = null;
  let dataB = null;

  // Saved selections for breadcrumb restore on layer switch (1.5)
  let _savedSelectionsA = { categoryId: null, categoryName: '', promotionId: null, promotionName: '' };
  let _savedSelectionsB = { categoryId: null, categoryName: '', promotionId: null, promotionName: '' };

  /* ============================================
     INITIALIZATION
     ============================================ */

  async function init() {
    console.log('[Compare] Initializing page...');

    // Initialize core module
    core = window.DashboardCore;
    elements = core.initElements();
    state = core.getState();

    // Restore state from localStorage/URL
    core.restoreState();

    // Initialize modals
    if (window.DashboardModals) {
      window.DashboardModals.init(core);
    }

    // Set app mode to compare
    state.appMode = 'compare';

    // Set active navigation state
    core.setActiveNavigation();

    // Load data
    await core.loadData();

    // Restore compare mode state
    restoreCompareState();

    // Bind events
    bindEvents();

    // Update UI
    updateContextButtons();
    updateLayerVisibility();

    // If both contexts are complete, render comparison
    if (isContextComplete('A') && isContextComplete('B')) {
      loadAndRenderComparison();
    }

    console.log('[Compare] Page initialized');
  }

  /**
   * Restore compare state from stored state
   */
  function restoreCompareState() {
    const savedCompare = state.compareMode;
    if (savedCompare) {
      // Always land on Circulars; stored A/B context (week/entity) is still
      // honored so users don't lose their selected periods/entities on reload.
      // Only an explicit ?layer= URL param can switch to Categories/Promotions
      // (handled below).
      currentLayer = 'circulars';
      if (savedCompare.contextA) {
        Object.assign(contextA, savedCompare.contextA);
      }
      if (savedCompare.contextB) {
        Object.assign(contextB, savedCompare.contextB);
      }
    }

    // Read URL parameters (URL takes precedence over saved state)
    const params = new URLSearchParams(window.location.search);

    // Check for quick compare parameters (Panel A pre-population)
    const weekA = params.get('weekA');
    const entityA = params.get('entityA');
    const entityLevelA = params.get('entityLevelA');
    const daysA = params.get('daysA');
    const promoA = params.get('promoA');
    const layer = params.get('layer');

    // Set layer if provided
    if (layer) {
      currentLayer = layer;
    }

    // Pre-populate Panel A from URL params (quick compare flow)
    if (weekA) {
      contextA.weekId = weekA;
      const week = MockData?.weeks?.find(w => w.id === weekA);
      if (week) {
        contextA.weekLabel = week.label;
        contextA.weekRange = week.dateRange;
      }
    }

    if (entityA) {
      contextA.entityId = entityA;
      contextA.entityLevel = entityLevelA || 'all';
      const entity = MockData?.getEntityById?.(entityA);
      if (entity) {
        contextA.entityName = entity.name;
        contextA.entityCount = entity.storeCount || 1;
      } else if (entityA === 'all') {
        contextA.entityName = 'All Stores';
        contextA.entityCount = MockData?.entities?.stores?.length || 0;
      }
    }

    if (daysA) {
      contextA.daysFilter = daysA;
    }

    // Pre-populate promotion for Panel A (promotions layer)
    if (promoA && currentLayer === 'promotions') {
      contextA.promotionId = promoA;
      // Get promotion details to populate category and name
      const weekNum = contextA.weekId ? parseInt(contextA.weekId.replace('week-', ''), 10) : null;
      const records = MockData?.getRecords?.(weekNum, contextA.entityId, contextA.entityLevel) || [];
      const promotions = MockData?.getUniquePromotions?.(records) || [];
      const promo = promotions.find(p => p.id === promoA);
      if (promo) {
        contextA.promotionName = promo.name;
        contextA.categoryId = promo.category;
        contextA.categoryName = promo.categoryName || '';
      }
    }

    // Days filter for Panel B
    const daysB = params.get('daysB');
    if (daysB) {
      contextB.daysFilter = daysB;
    }

    // Sync context A with base mode context if not set from URL
    if (!contextA.weekId && state.selectedWeekId) {
      contextA.weekId = state.selectedWeekId;
      const week = MockData?.weeks?.find(w => w.id === state.selectedWeekId);
      if (week) {
        contextA.weekLabel = week.label;
        contextA.weekRange = week.dateRange;
      }
    }
    if (!contextA.entityId && state.currentEntity) {
      contextA.entityId = state.currentEntity.id || 'all';
      contextA.entityName = state.currentEntity.name || 'All Stores';
      contextA.entityLevel = state.currentEntity.level || 'all';
      contextA.entityCount = state.currentEntity.count || MockData?.entities?.stores?.length || 0;
    }

    // Apply Compare landing defaults: A = most recent week, B = previous week.
    // Both contexts always populated (entity = All Stores) so the page never
    // lands with an empty Panel B.
    applyCompareDefaults();

    // Update layer tabs
    updateLayerTabs();

    // Update days dropdowns to match restored state
    updateDaysDropdowns();

    // Show Panel B prompt if Panel A is complete but Panel B is not
    updatePanelBPrompt();
  }

  /**
   * Ensure A + B contexts are populated on first landing.
   * A defaults to the most recent week, B to the week before A.
   * Entity defaults to All Stores on both.
   */
  function applyCompareDefaults() {
    const weeks = MockData?.weeks || [];
    if (!weeks.length) return;

    const mostRecent = weeks[weeks.length - 1];
    const previous = weeks[weeks.length - 2] || weeks[weeks.length - 1];
    const totalStores = MockData?.entities?.stores?.length || 0;

    function ensureContext(ctx, week) {
      if (!ctx.weekId) {
        ctx.weekId = week.id;
        ctx.weekLabel = week.label;
        ctx.weekRange = week.dateRange;
      }
      if (!ctx.entityId) {
        ctx.entityId = 'all';
        ctx.entityName = 'All Stores';
        ctx.entityLevel = 'all';
        ctx.entityCount = totalStores;
      }
    }

    ensureContext(contextA, mostRecent);
    ensureContext(contextB, previous);

    // If A and B happened to coincide (only one week available, or restored
    // state put them on the same week with B empty), nudge B one week back.
    if (contextB.weekId === contextA.weekId && previous.id !== mostRecent.id) {
      contextB.weekId = previous.id;
      contextB.weekLabel = previous.label;
      contextB.weekRange = previous.dateRange;
    }
  }

  /**
   * Update Panel B prompt visibility
   * Shows helper prompt when Panel A is complete but Panel B needs selections
   */
  function updatePanelBPrompt() {
    const promptEl = document.getElementById('panelBPrompt');
    if (!promptEl) return;

    const aComplete = isContextComplete('A');
    const bComplete = isContextComplete('B');

    // Show prompt when A is complete but B is not
    if (aComplete && !bComplete) {
      promptEl.style.display = 'flex';
    } else {
      promptEl.style.display = 'none';
    }
  }

  /**
   * Bind event listeners
   */
  function bindEvents() {
    // Listen for date selection events from modal
    document.addEventListener('compare:dateSelected', handleDateSelected);
    document.addEventListener('compare:entitySelected', handleEntitySelected);

    // Save state on navigation
    document.querySelectorAll('.mode-btn, .subtab').forEach(link => {
      link.addEventListener('click', () => {
        saveCompareState();
        core.saveState();
      });
    });

    // Layer tabs are plain buttons — no dropdown init needed
  }

  /* ============================================
     LAYER MANAGEMENT
     ============================================ */

  /**
   * Switch comparison layer (circulars, categories, promotions)
   */
  function selectLayer(layer) {
    if (layer === currentLayer) return;

    // Save leaf selections only when leaving promotions layer (breadcrumb trail)
    if (currentLayer === 'promotions') {
      _savedSelectionsA = {
        categoryId: contextA.categoryId,
        categoryName: contextA.categoryName,
        promotionId: contextA.promotionId,
        promotionName: contextA.promotionName
      };
      _savedSelectionsB = {
        categoryId: contextB.categoryId,
        categoryName: contextB.categoryName,
        promotionId: contextB.promotionId,
        promotionName: contextB.promotionName
      };
    }

    currentLayer = layer;

    // Update tabs
    updateLayerTabs();

    // Update visibility of category/promotion selectors
    updateLayerVisibility();

    // Reset or restore layer-specific selections
    if (layer === 'circulars') {
      // No need for category/promotion
    } else if (layer === 'categories') {
      // Need category, reset promotion
      contextA.promotionId = null;
      contextA.promotionName = '';
      contextB.promotionId = null;
      contextB.promotionName = '';
    } else if (layer === 'promotions') {
      // Restore last-known selections
      if (_savedSelectionsA.categoryId) {
        contextA.categoryId = _savedSelectionsA.categoryId;
        contextA.categoryName = _savedSelectionsA.categoryName;
      }
      if (_savedSelectionsA.promotionId) {
        contextA.promotionId = _savedSelectionsA.promotionId;
        contextA.promotionName = _savedSelectionsA.promotionName;
      }
      if (_savedSelectionsB.categoryId) {
        contextB.categoryId = _savedSelectionsB.categoryId;
        contextB.categoryName = _savedSelectionsB.categoryName;
      }
      if (_savedSelectionsB.promotionId) {
        contextB.promotionId = _savedSelectionsB.promotionId;
        contextB.promotionName = _savedSelectionsB.promotionName;
      }
    }

    // Update buttons
    updateContextButtons();

    // Re-render if contexts are complete
    if (isContextComplete('A') && isContextComplete('B')) {
      loadAndRenderComparison();
    } else {
      showEmptyState();
    }

    // Save state
    saveCompareState();
  }

  /**
   * Update layer dropdown active states and value
   */
  function updateLayerTabs() {
    document.querySelectorAll('.compare-layer-tabs [data-layer]').forEach(btn => {
      const active = btn.dataset.layer === currentLayer;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', String(active));
    });
  }

  /**
   * Show/hide category, promotion selectors and days filter based on layer
   */
  function updateLayerVisibility() {
    const showCategory = currentLayer === 'categories' || currentLayer === 'promotions';
    const showPromotion = currentLayer === 'promotions';
    const showDaysFilter = currentLayer === 'promotions';

    // Context A
    const aCat = document.getElementById('context-a-category');
    const aPromo = document.getElementById('context-a-promotion');
    if (aCat) aCat.style.display = showCategory ? 'inline-flex' : 'none';
    if (aPromo) aPromo.style.display = showPromotion ? 'inline-flex' : 'none';

    // Context B
    const bCat = document.getElementById('context-b-category');
    const bPromo = document.getElementById('context-b-promotion');
    if (bCat) bCat.style.display = showCategory ? 'inline-flex' : 'none';
    if (bPromo) bPromo.style.display = showPromotion ? 'inline-flex' : 'none';

    // Days filter - only show for Promotions layer
    const daysFilterA = document.getElementById('daysFilterA')?.closest('.compare-filter');
    const daysFilterB = document.getElementById('daysFilterB')?.closest('.compare-filter');
    if (daysFilterA) daysFilterA.style.display = showDaysFilter ? 'flex' : 'none';
    if (daysFilterB) daysFilterB.style.display = showDaysFilter ? 'flex' : 'none';
  }

  /* ============================================
     CONTEXT MANAGEMENT
     ============================================ */

  /**
   * Open date picker for A or B context
   */
  function openDatePicker(target) {
    window.openDatePicker(target);
  }

  /**
   * Open entity selector for A or B context
   */
  function openEntityPicker(target) {
    window.openEntitySelector(target);
  }

  /**
   * Handle date selection from modal
   */
  function handleDateSelected(event) {
    const { target, weekId, weekLabel, weekRange } = event.detail;
    const ctx = target === 'A' ? contextA : contextB;

    ctx.weekId = weekId;
    ctx.weekLabel = weekLabel;
    ctx.weekRange = weekRange;

    updateContextButtons();
    saveCompareState();

    // Re-render if both contexts complete
    if (isContextComplete('A') && isContextComplete('B')) {
      loadAndRenderComparison();
    }
  }

  /**
   * Handle entity selection from modal
   */
  function handleEntitySelected(event) {
    const { target, entityId, entityName, entityLevel, entityCount } = event.detail;
    const ctx = target === 'A' ? contextA : contextB;

    ctx.entityId = entityId;
    ctx.entityName = entityName;
    ctx.entityLevel = entityLevel;
    ctx.entityCount = entityCount;

    updateContextButtons();
    saveCompareState();

    // Re-render if both contexts complete
    if (isContextComplete('A') && isContextComplete('B')) {
      loadAndRenderComparison();
    }
  }

  /**
   * Open category picker modal
   */
  function openCategoryPicker(target) {
    _currentPickerTarget = target;
    _selectedCategoryId = null;

    const modal = document.getElementById('category-picker-modal');
    if (modal) {
      modal.classList.add('active');
      renderCategoryList();
    }
  }

  /**
   * Close category picker modal
   */
  function closeCategoryPicker() {
    const modal = document.getElementById('category-picker-modal');
    if (modal) {
      modal.classList.remove('active');
    }
    _currentPickerTarget = null;
  }

  /**
   * Render category list in picker
   */
  function renderCategoryList(searchQuery = '') {
    const list = document.getElementById('category-list');
    if (!list) return;

    // Get context-specific categories based on the picker target
    const ctx = _currentPickerTarget === 'A' ? contextA : contextB;
    const weekNum = ctx.weekId ? parseInt(ctx.weekId.replace('week-', ''), 10) : null;
    const records = MockData.getRecords(weekNum, ctx.entityId, ctx.entityLevel);
    const categories = MockData.aggregateByCategory(records);

    const query = searchQuery.toLowerCase().trim();
    const filtered = query
      ? categories.filter(c => c.name.toLowerCase().includes(query))
      : categories;

    if (filtered.length === 0) {
      list.innerHTML = '<div style="text-align: center; padding: 24px; color: var(--color-text-tertiary);">No categories found</div>';
      return;
    }

    const html = filtered.map(cat => {
      const isSelected = _selectedCategoryId === cat.id;
      return `
        <div class="group-item ${isSelected ? 'selected' : ''}" data-id="${cat.id}" onclick="ComparePage.selectCategory('${cat.id}')">
          <div class="group-icon" style="background-color: var(--color-primary-100); color: var(--color-primary-600);">
            <span class="material-symbols-outlined">category</span>
          </div>
          <div class="group-info">
            <div class="group-name">${core.escapeHtml(cat.name)}</div>
            <div class="group-meta">${cat.promotionCount || 0} promotions</div>
          </div>
          <div class="group-check">
            <span class="material-symbols-outlined">check</span>
          </div>
        </div>
      `;
    }).join('');

    list.innerHTML = html;
  }

  /**
   * Filter categories in picker
   */
  function filterCategories(value) {
    renderCategoryList(value);
  }

  /**
   * Select a category in picker
   */
  function selectCategory(categoryId) {
    _selectedCategoryId = categoryId;

    // Update selection UI
    document.querySelectorAll('#category-list .group-item').forEach(item => {
      item.classList.toggle('selected', item.dataset.id === categoryId);
    });
  }

  /**
   * Apply category selection
   */
  function applyCategorySelection() {
    if (!_selectedCategoryId || !_currentPickerTarget) {
      closeCategoryPicker();
      return;
    }

    const ctx = _currentPickerTarget === 'A' ? contextA : contextB;

    // Get context-specific categories to find the selected one
    const weekNum = ctx.weekId ? parseInt(ctx.weekId.replace('week-', ''), 10) : null;
    const records = MockData.getRecords(weekNum, ctx.entityId, ctx.entityLevel);
    const categories = MockData.aggregateByCategory(records);
    const category = categories.find(c => c.id === _selectedCategoryId);

    ctx.categoryId = _selectedCategoryId;
    ctx.categoryName = category ? category.name : '';

    // Reset promotion if category changed
    ctx.promotionId = null;
    ctx.promotionName = '';

    closeCategoryPicker();
    updateContextButtons();
    saveCompareState();

    // Re-render if both contexts complete
    if (isContextComplete('A') && isContextComplete('B')) {
      loadAndRenderComparison();
    }
  }

  /**
   * Open promotion picker modal
   */
  function openPromotionPicker(target) {
    _currentPickerTarget = target;
    _selectedPromotionId = null;

    const modal = document.getElementById('promotion-picker-modal');
    if (modal) {
      modal.classList.add('active');
      renderPromotionList();
    }
  }

  /**
   * Close promotion picker modal
   */
  function closePromotionPicker() {
    const modal = document.getElementById('promotion-picker-modal');
    if (modal) {
      modal.classList.remove('active');
    }
    _currentPickerTarget = null;
  }

  /**
   * Render promotion list in picker
   */
  function renderPromotionList(searchQuery = '') {
    const list = document.getElementById('promotion-list');
    if (!list) return;

    // Get context-specific promotions based on the picker target
    const ctx = _currentPickerTarget === 'A' ? contextA : contextB;
    const weekNum = ctx.weekId ? parseInt(ctx.weekId.replace('week-', ''), 10) : null;
    const records = MockData.getRecords(weekNum, ctx.entityId, ctx.entityLevel);
    const promotions = MockData.getUniquePromotions(records);

    const query = searchQuery.toLowerCase().trim();
    let filtered = promotions;

    // Filter by context's category if set
    if (ctx.categoryId) {
      // Category ID is lowercase-hyphenated (e.g., "bakery")
      // Promotion's category field is also lowercase-hyphenated from getUniquePromotions
      const categoryIdLower = ctx.categoryId.toLowerCase();
      filtered = filtered.filter(p => p.category === categoryIdLower);
    }

    if (query) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(query));
    }

    if (filtered.length === 0) {
      list.innerHTML = '<div style="text-align: center; padding: 24px; color: var(--color-text-tertiary);">No promotions found</div>';
      return;
    }

    const html = filtered.map(promo => {
      const isSelected = _selectedPromotionId === promo.id;
      const categoryDisplay = promo.categoryName || promo.category || '';
      return `
        <div class="group-item ${isSelected ? 'selected' : ''}" data-id="${promo.id}" onclick="ComparePage.selectPromotion('${promo.id}')">
          <div class="group-icon" style="background-color: var(--color-success-100); color: var(--color-success-600);">
            <span class="material-symbols-outlined">local_offer</span>
          </div>
          <div class="group-info">
            <div class="group-name">${core.escapeHtml(promo.name)}</div>
            <div class="group-meta">${core.escapeHtml(categoryDisplay)} - ${core.escapeHtml(promo.dealType || '')}</div>
          </div>
          <div class="group-check">
            <span class="material-symbols-outlined">check</span>
          </div>
        </div>
      `;
    }).join('');

    list.innerHTML = html;
  }

  /**
   * Filter promotions in picker
   */
  function filterPromotions(value) {
    renderPromotionList(value);
  }

  /**
   * Select a promotion in picker
   */
  function selectPromotion(promotionId) {
    _selectedPromotionId = promotionId;

    // Update selection UI
    document.querySelectorAll('#promotion-list .group-item').forEach(item => {
      item.classList.toggle('selected', item.dataset.id === promotionId);
    });
  }

  /**
   * Apply promotion selection
   */
  function applyPromotionSelection() {
    if (!_selectedPromotionId || !_currentPickerTarget) {
      closePromotionPicker();
      return;
    }

    const ctx = _currentPickerTarget === 'A' ? contextA : contextB;

    // Get context-specific promotions to find the selected one
    const weekNum = ctx.weekId ? parseInt(ctx.weekId.replace('week-', ''), 10) : null;
    const records = MockData.getRecords(weekNum, ctx.entityId, ctx.entityLevel);
    const promotions = MockData.getUniquePromotions(records);
    const promo = promotions.find(p => p.id === _selectedPromotionId);

    ctx.promotionId = _selectedPromotionId;
    ctx.promotionName = promo ? promo.name : '';

    // Also set category if not set
    if (!ctx.categoryId && promo) {
      // promo.category is already lowercase-hyphenated from getUniquePromotions
      ctx.categoryId = promo.category;
      ctx.categoryName = promo.categoryName || '';
    }

    closePromotionPicker();
    updateContextButtons();
    saveCompareState();

    // Re-render if both contexts complete
    if (isContextComplete('A') && isContextComplete('B')) {
      loadAndRenderComparison();
    }
  }

  /**
   * Copy Context A to Context B
   */
  function copyAtoB() {
    contextB = { ...contextA };
    updateContextButtons();
    updateDaysDropdowns();
    saveCompareState();

    // Re-render if both contexts complete
    if (isContextComplete('A') && isContextComplete('B')) {
      loadAndRenderComparison();
    }
  }

  /**
   * Copy Context B to Context A
   */
  function copyBtoA() {
    contextA = { ...contextB };
    updateContextButtons();
    updateDaysDropdowns();
    saveCompareState();

    // Re-render if both contexts complete
    if (isContextComplete('A') && isContextComplete('B')) {
      loadAndRenderComparison();
    }
  }

  /**
   * Set days filter for a panel
   */
  function setDaysFilter(target, value) {
    const ctx = target === 'A' ? contextA : contextB;
    ctx.daysFilter = value;

    // Update URL with days filter state
    updateUrlParams();

    saveCompareState();

    // Re-render if both contexts complete
    if (isContextComplete('A') && isContextComplete('B')) {
      loadAndRenderComparison();
    }
  }

  /**
   * Update URL parameters with current days filter state
   */
  function updateUrlParams() {
    const params = new URLSearchParams(window.location.search);

    // Update daysA parameter
    if (contextA.daysFilter && contextA.daysFilter !== 'all') {
      params.set('daysA', contextA.daysFilter);
    } else {
      params.delete('daysA');
    }

    // Update daysB parameter
    if (contextB.daysFilter && contextB.daysFilter !== 'all') {
      params.set('daysB', contextB.daysFilter);
    } else {
      params.delete('daysB');
    }

    // Update URL without page reload
    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    history.replaceState({}, '', newUrl);
  }

  /**
   * Update days dropdown UI to match state
   */
  function updateDaysDropdowns() {
    const dropdownA = document.getElementById('daysFilterA');
    const dropdownB = document.getElementById('daysFilterB');

    if (dropdownA) dropdownA.value = contextA.daysFilter || 'all';
    if (dropdownB) dropdownB.value = contextB.daysFilter || 'all';
  }

  /**
   * Format week label with run completeness stats for context button (1.1)
   */
  function formatWeekLabel(ctx) {
    if (!ctx.weekId) return 'Select Week';
    const week = MockData?.weeks?.find(w => w.id === ctx.weekId);
    const daysRun = week?.daysRun || 7;
    const totalDays = 7;
    const isPartial = daysRun < totalDays;
    const star = isPartial ? '★ ' : '';
    // "(N of N days)" + "(N of N locations)" suffixes dropped per design.
    // Replace with the actual date range (start - end with year) for context.
    // Star prefix still flags partial weeks visually.
    let label = `${star}${ctx.weekLabel}`;
    const range = ctx.weekRange || week?.dateRange;
    if (range) label += ` · ${range}`;
    return label;
  }

  /**
   * Update context button displays
   */
  function updateContextButtons() {
    // Context A
    updateButton('context-a-date', formatWeekLabel(contextA), !!contextA.weekId);
    updateButton('context-a-entity', contextA.entityName || 'Select Entity', !!contextA.entityId);
    updateButton('context-a-category', contextA.categoryName || 'Select Category', !!contextA.categoryId);
    updateButton('context-a-promotion', contextA.promotionName || 'Select Promotion', !!contextA.promotionId);

    // Context B
    updateButton('context-b-date', formatWeekLabel(contextB), !!contextB.weekId);
    updateButton('context-b-entity', contextB.entityName || 'Select Entity', !!contextB.entityId);
    updateButton('context-b-category', contextB.categoryName || 'Select Category', !!contextB.categoryId);
    updateButton('context-b-promotion', contextB.promotionName || 'Select Promotion', !!contextB.promotionId);

    // Update Panel B prompt visibility
    updatePanelBPrompt();
  }

  /**
   * Update a single context button
   */
  function updateButton(id, text, hasValue) {
    const btn = document.getElementById(id);
    if (!btn) return;

    const textEl = btn.querySelector('.btn-text');
    if (textEl) textEl.textContent = text;

    btn.classList.toggle('context-btn--empty', !hasValue);
  }

  /**
   * Check if a context is complete for the current layer
   */
  function isContextComplete(target) {
    const ctx = target === 'A' ? contextA : contextB;

    // Always need date and entity
    if (!ctx.weekId || !ctx.entityId) return false;

    // Layer-specific requirements
    if (currentLayer === 'categories') {
      return !!ctx.categoryId;
    }
    if (currentLayer === 'promotions') {
      return !!ctx.promotionId;
    }

    // Circulars layer just needs date and entity
    return true;
  }

  /* ============================================
     DATA LOADING
     ============================================ */

  /**
   * Filter records by days based on daysFilter value
   * @param {Array} records - Records to filter
   * @param {string} daysFilter - 'all', '7', '3', or '1'
   * @returns {Array} Filtered records
   */
  function filterRecordsByDays(records, daysFilter) {
    if (!daysFilter || daysFilter === 'all') {
      return records;
    }
    const days = parseInt(daysFilter, 10);
    return records.filter(r => r.daysRun === days);
  }

  /**
   * Load data for both contexts and render comparison
   */
  async function loadAndRenderComparison() {
    showLoadingState();

    try {
      // Load data based on layer
      dataA = await loadContextData('A');
      dataB = await loadContextData('B');

      renderComparison();
    } catch (error) {
      console.error('[Compare] Error loading data:', error);
      showErrorState('Failed to load comparison data');
    }
  }

  /**
   * Load data for a specific context
   */
  async function loadContextData(target) {
    const ctx = target === 'A' ? contextA : contextB;

    switch (currentLayer) {
      case 'circulars':
        return getCircularData(ctx);
      case 'categories':
        return getCategoryData(ctx);
      case 'promotions':
        return getPromotionData(ctx);
      default:
        return null;
    }
  }

  /**
   * Get circular/entity level data
   */
  function getCircularData(ctx) {
    // Extract weekNum from weekId (e.g., "week-48" -> 48)
    const weekNum = ctx.weekId ? parseInt(ctx.weekId.replace('week-', ''), 10) : null;

    // Get records for this specific context's week and entity
    let records = MockData.getRecords(weekNum, ctx.entityId, ctx.entityLevel);

    // Filter by days if set
    records = filterRecordsByDays(records, ctx.daysFilter);

    // Aggregate by category to get category count
    const categories = MockData.aggregateByCategory(records);

    // Get unique promotions for this context
    const promotions = MockData.getUniquePromotions(records);

    // Calculate totals from context-specific data
    const totalCIV = promotions.reduce((sum, p) => sum + (p.civ || 0), 0);
    const totalCC = promotions.reduce((sum, p) => sum + (p.cc || 0), 0);
    const totalATL = promotions.reduce((sum, p) => sum + (p.atl || 0), 0);

    // Calculate a meaningful engagement score based on totals
    // Using the same formula as composite score but for totals
    const totalEngagementScore = Math.round((totalCIV * 0.4 + totalCC * 10 + totalATL * 15) / 100);

    // Calculate percentile by comparing against all stores for this week
    // This gives a meaningful ranking that changes with different contexts
    let entityPercentile = 50; // Default
    if (ctx.entityLevel === 'store' && weekNum) {
      // For store-level, compare against all stores for this week
      const allStoresRecords = MockData.getRecords(weekNum, 'all', 'all');
      const storeScores = [];

      // Group records by store and calculate each store's score
      const storeRecordsMap = {};
      allStoresRecords.forEach(r => {
        if (!storeRecordsMap[r.storeId]) {
          storeRecordsMap[r.storeId] = [];
        }
        storeRecordsMap[r.storeId].push(r);
      });

      Object.keys(storeRecordsMap).forEach(storeId => {
        const storePromos = MockData.getUniquePromotions(storeRecordsMap[storeId]);
        const storeCIV = storePromos.reduce((sum, p) => sum + (p.civ || 0), 0);
        const storeCC = storePromos.reduce((sum, p) => sum + (p.cc || 0), 0);
        const storeATL = storePromos.reduce((sum, p) => sum + (p.atl || 0), 0);
        const storeScore = Math.round((storeCIV * 0.4 + storeCC * 10 + storeATL * 15) / 100);
        storeScores.push({ storeId, score: storeScore });
      });

      // Sort by score descending and find percentile
      storeScores.sort((a, b) => b.score - a.score);
      const rank = storeScores.findIndex(s => s.storeId === ctx.entityId);
      if (rank >= 0 && storeScores.length > 0) {
        entityPercentile = Math.round(100 - (rank / storeScores.length) * 100);
      }
    } else {
      // For brand/sub-brand level, use average percentile of promotions as fallback
      entityPercentile = promotions.length > 0
        ? Math.round(promotions.reduce((sum, p) => sum + (p.percentile || 0), 0) / promotions.length)
        : 50;
    }

    // Get entity info for logo
    const entity = MockData.getEntityById(ctx.entityId);
    const entityLogo = entity?.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(ctx.entityName || 'All')}&background=4F46E5&color=fff&size=80`;

    return {
      context: ctx,
      name: ctx.entityName || 'All Stores',
      logo: entityLogo,
      metrics: {
        engagementScore: totalEngagementScore,
        civ: totalCIV,
        cc: totalCC,
        atl: totalATL,
        percentile: entityPercentile,
        promotionCount: promotions.length,
        categoryCount: categories.length,
        storeCount: ctx.entityCount || MockData?.entities?.stores?.length || 0
      }
    };
  }

  /**
   * Get category level data
   */
  function getCategoryData(ctx) {
    // Extract weekNum from weekId (e.g., "week-48" -> 48)
    const weekNum = ctx.weekId ? parseInt(ctx.weekId.replace('week-', ''), 10) : null;

    // Get records for this specific context's week and entity
    let records = MockData.getRecords(weekNum, ctx.entityId, ctx.entityLevel);

    // Filter by days if set
    records = filterRecordsByDays(records, ctx.daysFilter);

    // Aggregate by category for this context
    const categories = MockData.aggregateByCategory(records);

    // Find the specific category
    const category = categories.find(c => c.id === ctx.categoryId);
    if (!category) return null;

    // Get category image
    const categoryImages = {
      'produce': 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=300&h=200&fit=crop',
      'meat': 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=300&h=200&fit=crop',
      'dairy': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&h=200&fit=crop',
      'bakery': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=200&fit=crop',
      'frozen': 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=300&h=200&fit=crop',
      'beverages': 'https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=300&h=200&fit=crop',
      'snacks': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300&h=200&fit=crop',
      'pantry': 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=300&h=200&fit=crop'
    };
    const categoryImage = categoryImages[category.id] || categoryImages['produce'];

    return {
      context: ctx,
      name: category.name,
      image: categoryImage,
      metrics: {
        engagementScore: category.totalScore || 0,
        civ: category.civ || 0,
        cc: category.cc || 0,
        atl: category.atl || 0,
        percentile: category.percentile || 0,
        promotionCount: category.promotionCount || 0
      }
    };
  }

  /**
   * Get promotion level data
   */
  function getPromotionData(ctx) {
    // Extract weekNum from weekId (e.g., "week-48" -> 48)
    const weekNum = ctx.weekId ? parseInt(ctx.weekId.replace('week-', ''), 10) : null;

    // Get records for this specific context's week and entity
    let records = MockData.getRecords(weekNum, ctx.entityId, ctx.entityLevel);

    // Filter by days if set
    records = filterRecordsByDays(records, ctx.daysFilter);

    // Get unique promotions for this context
    const promotions = MockData.getUniquePromotions(records);

    // Find the specific promotion
    const promo = promotions.find(p => p.id === ctx.promotionId);
    if (!promo) return null;

    return {
      context: ctx,
      name: promo.name,
      categoryName: promo.categoryName || promo.category || '',
      image: promo.heroImage || promo.thumbImage || '',
      metrics: {
        engagementScore: promo.totalScore || 0,
        civ: promo.civ || 0,
        cc: promo.cc || 0,
        atl: promo.atl || 0,
        percentile: promo.percentile || 0,
        dealType: promo.dealType || '',
        cardSize: promo.cardSize || '',
        originalPrice: promo.originalPrice || 0,
        salePrice: promo.salePrice || 0
      }
    };
  }

  /* ============================================
     RENDERING
     ============================================ */

  /**
   * Render the comparison results
   */
  function renderComparison() {
    const grid = document.getElementById('compare-grid');
    if (!grid) return;

    // Hide empty state
    const emptyState = document.getElementById('compare-empty-state');
    if (emptyState) emptyState.style.display = 'none';

    let html = '';

    switch (currentLayer) {
      case 'circulars':
        html = renderCircularComparison();
        break;
      case 'categories':
        html = renderCategoryComparison();
        break;
      case 'promotions':
        html = renderPromotionComparison();
        break;
    }

    grid.innerHTML = html;

    // Initialize performance charts after DOM is updated
    if (window.PerfCharts) {
      // Scale both bars against the same max engagement score so widths are directly comparable
      const metricsA = dataA?.metrics || {};
      const metricsB = dataB?.metrics || {};
      const maxTotal = Math.max(metricsA.engagementScore || 0, metricsB.engagementScore || 0) || 1;

      const chartContainers = document.querySelectorAll('.perf-chart[data-views]');
      chartContainers.forEach(container => {
        const data = {
          views:     parseInt(container.dataset.views, 10)     || 0,
          clicks:    parseInt(container.dataset.clicks, 10)    || 0,
          adds:      parseInt(container.dataset.adds, 10)      || 0,
          composite: parseInt(container.dataset.composite, 10) || 0
        };
        PerfCharts.createChart(container.id, data, {
          height: 16,
          maxTotal,
          entityName: ''
        });
      });
    }
  }

  /**
   * Render circular/entity comparison
   */
  function renderCircularComparison() {
    if (!dataA || !dataB) return '';

    const metricsA = dataA.metrics;
    const metricsB = dataB.metrics;

    const cellContent = (col, data, metrics, showVariance, percentileA, chartId, ctx) => `
      <div class="compare-cell compare-cell--${col}">
        <div class="compare-col-label compare-col-label--${col}">${col.toUpperCase()}</div>
        ${renderPercentileRow(metrics.percentile, metrics.engagementScore, showVariance, percentileA, metrics, chartId, ctx)}
        <div class="compare-mini-cards">
          ${renderMiniCard('Views', formatNumber(metrics.civ), metricsA.civ, metrics.civ, showVariance)}
          ${renderMiniCard('Clicks', formatNumber(metrics.cc), metricsA.cc, metrics.cc, showVariance)}
          ${renderMiniCard('Adds', formatNumber(metrics.atl), metricsA.atl, metrics.atl, showVariance)}
          ${renderMiniCard('Stores', formatNumber(metrics.storeCount), metricsA.storeCount, metrics.storeCount, showVariance)}
          ${renderMiniCard('Categories', formatNumber(metrics.categoryCount), metricsA.categoryCount, metrics.categoryCount, showVariance)}
          ${renderMiniCard('Promotions', formatNumber(metrics.promotionCount), metricsA.promotionCount, metrics.promotionCount, showVariance)}
        </div>
      </div>`;

    return cellContent('a', dataA, metricsA, false, 0, 'compare-perf-circulars-a', contextA)
         + cellContent('b', dataB, metricsB, true, metricsA.percentile, 'compare-perf-circulars-b', contextB);
  }

  /**
   * Render category comparison
   */
  function renderCategoryComparison() {
    if (!dataA || !dataB) return '';

    const metricsA = dataA.metrics;
    const metricsB = dataB.metrics;

    const cellContent = (col, data, metrics, showVariance, percentileA, chartId, ctx) => `
      <div class="compare-cell compare-cell--${col}">
        <div class="compare-col-label compare-col-label--${col}">${col.toUpperCase()}</div>
        <h3 class="compare-hero__title">${core.escapeHtml(data.name)}</h3>
        ${renderPercentileRow(metrics.percentile, metrics.engagementScore, showVariance, percentileA, metrics, chartId, ctx)}
        <div class="compare-mini-cards">
          ${renderMiniCard('Views', formatNumber(metrics.civ), metricsA.civ, metrics.civ, showVariance)}
          ${renderMiniCard('Clicks', formatNumber(metrics.cc), metricsA.cc, metrics.cc, showVariance)}
          ${renderMiniCard('Adds', formatNumber(metrics.atl), metricsA.atl, metrics.atl, showVariance)}
          ${renderMiniCard('Promotions', formatNumber(metrics.promotionCount), metricsA.promotionCount, metrics.promotionCount, showVariance)}
        </div>
      </div>`;

    return cellContent('a', dataA, metricsA, false, 0, 'compare-perf-categories-a', contextA)
         + cellContent('b', dataB, metricsB, true, metricsA.percentile, 'compare-perf-categories-b', contextB);
  }

  /**
   * Render promotion comparison
   */
  function renderPromotionComparison() {
    if (!dataA || !dataB) return '';

    const metricsA = dataA.metrics;
    const metricsB = dataB.metrics;

    const cellContent = (col, data, metrics, showVariance, percentileA, chartId, ctx) => `
      <div class="compare-cell compare-cell--${col}">
        <div class="compare-col-label compare-col-label--${col}">${col.toUpperCase()}</div>
        <div class="compare-hero compare-hero--promotion">
          <img src="${data.image}" alt="${core.escapeHtml(data.name)}" class="compare-hero__image">
        </div>
        <h3 class="compare-hero__title">${core.escapeHtml(data.name)}</h3>
        <div class="compare-tags">
          <span class="compare-tag compare-tag--category">${core.escapeHtml(data.categoryName)}</span>
          <span class="compare-tag compare-tag--deal">${core.escapeHtml(metrics.dealType || '')}</span>
        </div>
        ${renderPercentileRow(metrics.percentile, metrics.engagementScore, showVariance, percentileA, metrics, chartId, ctx)}
        <div class="compare-mini-cards">
          ${renderMiniCard('Views', formatNumber(metrics.civ), metricsA.civ, metrics.civ, showVariance)}
          ${renderMiniCard('Clicks', formatNumber(metrics.cc), metricsA.cc, metrics.cc, showVariance)}
          ${renderMiniCard('Adds', formatNumber(metrics.atl), metricsA.atl, metrics.atl, showVariance)}
          ${renderMiniCard('Deal Type', metrics.dealType || '-', metricsA.dealType, metrics.dealType, showVariance, true)}
          ${renderMiniCard('Orig. Price', formatCurrency(metrics.originalPrice), metricsA.originalPrice, metrics.originalPrice, showVariance)}
          ${renderMiniCard('Sale Price', formatCurrency(metrics.salePrice), metricsA.salePrice, metrics.salePrice, showVariance)}
        </div>
      </div>`;

    return cellContent('a', dataA, metricsA, false, 0, 'compare-perf-promotions-a', contextA)
         + cellContent('b', dataB, metricsB, true, metricsA.percentile, 'compare-perf-promotions-b', contextB);
  }

  /**
   * Render context summary header
   */

  /**
   * Get percentile variant class (high/medium/low)
   */
  function getPercentileVariant(percentile) {
    if (percentile >= 75) return 'high';
    if (percentile >= 50) return 'medium';
    return 'low';
  }

  function ordinal(n) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  /**
   * Render percentile row with eCharts performance bar (matching BASE)
   */
  function renderPercentileRow(percentile, score, showVariance = false, percentileA = 0, metrics = null, chartId = null, ctx = null) {
    const variance = showVariance ? calculateVariance(percentileA, percentile) : null;
    const variant = getPercentileVariant(percentile);
    const uniqueId = chartId || `compare-perf-chart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    let contextBlock = '';
    if (ctx) {
      const week = ctx.weekLabel || 'this week';
      const entity = core.escapeHtml(ctx.entityName || 'all stores');
      const n = metrics?.promotionCount;

      const dealType = metrics?.dealType ? core.escapeHtml(metrics.dealType) : null;
      const featuredPhrase = dealType
        ? `that featured the ${dealType}`
        : 'that were featured';
      const categoryClause = ctx.categoryId && ctx.categoryName
        ? ` in the <span class="category">${core.escapeHtml(ctx.categoryName)}</span>`
        : '';
      const subject = ctx.promotionId
        ? core.escapeHtml(ctx.promotionName || 'this promotion')
        : ctx.categoryId
          ? 'this category'
          : 'this circular';

      // Layer-adaptive sentence (1.4)
      let sentence;
      if (ctx.promotionId) {
        const promoSpan = `<span class="promotion">${n ? `${n} promotions` : 'promotions'}</span>`;
        const subjectCap = subject.charAt(0).toUpperCase() + subject.slice(1);
        sentence = `Among the ${promoSpan} ${featuredPhrase}${categoryClause} during <span class="week">${week}</span> across <span class="store">${entity}</span>.<br>${subjectCap} scored in the <span class="percentile">${ordinal(percentile)} percentile</span>.`;
      } else if (ctx.categoryId) {
        sentence = `Categories that were featured during <span class="week">${week}</span> across <span class="store">${entity}</span>. The category scored in the <span class="percentile">${ordinal(percentile)} percentile</span>.`;
      } else {
        const catCount = metrics?.categoryCount || 0;
        const promoCount = metrics?.promotionCount || n || 0;
        sentence = `<span class="category">${catCount} categories</span> and <span class="promotion">${promoCount} promotions</span>. The circular scored in the <span class="percentile">${ordinal(percentile)} percentile</span>.`;
      }

      let comparisonLine = '';
      if (showVariance && percentileA > 0) {
        const diff = percentile - percentileA;
        if (diff > 0) {
          comparisonLine = `<span class="percentile-context__vs percentile-context__vs--ahead">Scored ${diff} percentile point${diff === 1 ? '' : 's'} ahead of column A</span>`;
        } else if (diff < 0) {
          comparisonLine = `<span class="percentile-context__vs percentile-context__vs--behind">Scored ${Math.abs(diff)} percentile point${Math.abs(diff) === 1 ? '' : 's'} behind column A</span>`;
        } else {
          comparisonLine = `<span class="percentile-context__vs">Tied with column A this week</span>`;
        }
      }

      const varianceInContext = showVariance && variance
        ? `<span class="percentile-context__variance">${renderVarianceIndicator(variance)}</span>`
        : '';

      contextBlock = `
        <div class="percentile-context">
          <div class="percentile-context__body">
            <span class="percentile-context__lead-in">How to interpret:</span>
            <span class="percentile-context__sentence">${sentence}</span>
            ${comparisonLine}
          </div>
          ${varianceInContext}
        </div>`;
    }

    // If metrics are provided, render eCharts bar, otherwise fallback to simple bar
    if (metrics && metrics.civ !== undefined) {
      return `
        <div class="detail-percentile-row">
          <div class="perf-chart-container" style="flex: 1;">
            <div class="perf-chart" id="${uniqueId}"
                 data-name=""
                 data-views="${metrics.civ || 0}"
                 data-clicks="${metrics.cc || 0}"
                 data-adds="${metrics.atl || 0}"
                 data-composite="${score || 0}">
            </div>
          </div>
          <span class="percentile-score">${Number(score).toLocaleString('en-US')}</span>
          <img src="assets/chart-bar.svg" alt="Percentile" class="percentile-icon">
          <span class="percentile-value percentile-value--${variant}">${percentile}%</span>
        </div>
        ${contextBlock}
      `;
    }

    // Fallback to simple CSS bar if no metrics provided
    return `
      <div class="detail-percentile-row">
        <div class="percentile-bar percentile-bar--${variant}">
          <div class="percentile-bar-fill percentile-bar-fill--${variant}" style="width: ${percentile}%;"></div>
        </div>
        <span class="percentile-score">${score}</span>
        <img src="assets/chart-bar.svg" alt="Percentile" class="percentile-icon">
        <span class="percentile-value percentile-value--${variant}">${percentile}%</span>
      </div>
      ${contextBlock}
    `;
  }

  /**
   * Render a mini-card for the compare 2×3 grid (1.3)
   */
  function renderMiniCard(label, value, varA, varB, showVariance, isText = false) {
    let varianceHtml = '';
    if (showVariance) {
      if (isText) {
        varianceHtml = (varA !== varB)
          ? '<span class="variance variance--different"><span class="material-symbols-outlined">sync_alt</span></span>'
          : '';
      } else if (varA !== undefined && varB !== undefined) {
        const v = calculateVariance(varA, varB);
        varianceHtml = v.direction !== 'equal' ? renderVarianceIndicator(v) : '';
      }
    }
    return `
      <div class="compare-mini-card">
        <span class="compare-mini-card__label">${label}</span>
        <span class="compare-mini-card__value">${value}${varianceHtml ? ' ' + varianceHtml : ''}</span>
      </div>
    `;
  }

  /**
   * Render a metric row (no variance)
   */
  function renderMetricRow(label, value) {
    return `
      <div class="metric-row">
        <span class="metric-row__label">${label}</span>
        <span class="metric-row__value">${value}</span>
      </div>
    `;
  }

  /**
   * Render a metric row with variance indicator
   */
  function renderMetricRowWithVariance(label, displayValue, valueA, valueB) {
    const variance = calculateVariance(valueA, valueB);
    return `
      <div class="metric-row">
        <span class="metric-row__label">${label}</span>
        <span class="metric-row__value">
          ${displayValue}
          ${renderVarianceIndicator(variance)}
        </span>
      </div>
    `;
  }

  /**
   * Render a metric row with text comparison (not numeric)
   */
  function renderMetricRowText(label, displayValue, valueA, valueB) {
    const isDifferent = valueA !== valueB;
    return `
      <div class="metric-row">
        <span class="metric-row__label">${label}</span>
        <span class="metric-row__value">
          ${displayValue}
          ${isDifferent ? '<span class="variance variance--different"><span class="material-symbols-outlined">sync_alt</span></span>' : ''}
        </span>
      </div>
    `;
  }

  /**
   * Calculate variance between two values
   */
  function calculateVariance(valueA, valueB) {
    if (valueA === valueB) {
      return { direction: 'equal', percent: 0 };
    }
    if (valueA === 0) {
      return { direction: valueB > 0 ? 'up' : 'down', percent: 100 };
    }
    const percent = ((valueB - valueA) / Math.abs(valueA)) * 100;
    return {
      direction: percent > 0 ? 'up' : 'down',
      percent: Math.abs(percent).toFixed(1)
    };
  }

  /**
   * Render variance indicator
   */
  function renderVarianceIndicator(variance) {
    if (variance.direction === 'equal') {
      return '<span class="variance variance--equal"><span class="material-symbols-outlined">remove</span>=</span>';
    }

    const icon = variance.direction === 'up' ? 'arrow_upward' : 'arrow_downward';
    const cssClass = variance.direction === 'up' ? 'variance--up' : 'variance--down';
    const sign = variance.direction === 'up' ? '+' : '-';

    return `
      <span class="variance ${cssClass}">
        <span class="material-symbols-outlined">${icon}</span>
        ${sign}${variance.percent}%
      </span>
    `;
  }

  /**
   * Render standalone variance for score display
   */
  function renderVariance(valueA, valueB) {
    const variance = calculateVariance(valueA, valueB);
    if (variance.direction === 'equal') return '';
    return `<div style="margin-top: var(--space-2);">${renderVarianceIndicator(variance)}</div>`;
  }

  /**
   * Show empty state
   */
  function showEmptyState() {
    const grid = document.getElementById('compare-grid');
    const emptyState = document.getElementById('compare-empty-state');

    if (grid) {
      grid.innerHTML = '';
      if (emptyState) {
        grid.appendChild(emptyState);
        emptyState.style.display = 'flex';
      }
    }
  }

  /**
   * Show loading state
   */
  function showLoadingState() {
    const grid = document.getElementById('compare-grid');
    if (grid) {
      grid.innerHTML = `
        <div class="compare-loading">
          <div class="compare-loading__spinner"></div>
          <div class="compare-loading__text">Loading comparison data...</div>
        </div>
      `;
    }
  }

  /**
   * Show error state
   */
  function showErrorState(message) {
    const grid = document.getElementById('compare-grid');
    if (grid) {
      grid.innerHTML = `
        <div class="compare-empty-state">
          <span class="compare-empty-state__icon material-symbols-outlined">error</span>
          <h2 class="compare-empty-state__title">Error</h2>
          <p class="compare-empty-state__message">${message}</p>
        </div>
      `;
    }
  }

  /* ============================================
     FORMATTING HELPERS
     ============================================ */

  function formatNumber(num) {
    if (num === null || num === undefined) return '-';
    return num.toLocaleString();
  }

  function formatCurrency(num) {
    if (num === null || num === undefined) return '-';
    return '$' + num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  /* ============================================
     STATE PERSISTENCE
     ============================================ */

  /**
   * Save compare state to global state
   */
  function saveCompareState() {
    state.compareMode = {
      layer: currentLayer,
      contextA: { ...contextA },
      contextB: { ...contextB }
    };
    core.saveState();
  }

  /* ============================================
     PUBLIC API
     ============================================ */
  return {
    init,
    selectLayer,
    openDatePicker,
    openEntityPicker,
    openCategoryPicker,
    closeCategoryPicker,
    filterCategories,
    selectCategory,
    applyCategorySelection,
    openPromotionPicker,
    closePromotionPicker,
    filterPromotions,
    selectPromotion,
    applyPromotionSelection,
    copyAtoB,
    copyBtoA,
    setDaysFilter
  };
})();

// Make available globally
window.ComparePage = ComparePage;

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', ComparePage.init);
} else {
  ComparePage.init();
}
