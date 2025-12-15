/**
 * COMPARE - A/B Comparison View for Analytics Dashboard
 * Page-specific logic for compare.html
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
      currentLayer = savedCompare.layer || 'circulars';
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

    // Update layer tabs
    updateLayerTabs();

    // Update days dropdowns to match restored state
    updateDaysDropdowns();

    // Show Panel B prompt if Panel A is complete but Panel B is not
    updatePanelBPrompt();
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
  }

  /* ============================================
     LAYER MANAGEMENT
     ============================================ */

  /**
   * Switch comparison layer (circulars, categories, promotions)
   */
  function selectLayer(layer) {
    if (layer === currentLayer) return;

    currentLayer = layer;

    // Update tabs
    updateLayerTabs();

    // Update visibility of category/promotion selectors
    updateLayerVisibility();

    // Reset layer-specific selections if needed
    if (layer === 'circulars') {
      // No need for category/promotion
    } else if (layer === 'categories') {
      // Need category, reset promotion
      contextA.promotionId = null;
      contextA.promotionName = '';
      contextB.promotionId = null;
      contextB.promotionName = '';
    }
    // Promotions layer keeps all selections

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
   * Update layer tab active states
   */
  function updateLayerTabs() {
    document.querySelectorAll('.compare-layer-tabs button').forEach(btn => {
      const layer = btn.dataset.layer;
      btn.classList.toggle('active', layer === currentLayer);
      btn.setAttribute('aria-selected', layer === currentLayer);
    });
  }

  /**
   * Show/hide category and promotion selectors based on layer
   */
  function updateLayerVisibility() {
    const showCategory = currentLayer === 'categories' || currentLayer === 'promotions';
    const showPromotion = currentLayer === 'promotions';

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
   * Update context button displays
   */
  function updateContextButtons() {
    // Context A
    updateButton('context-a-date', contextA.weekLabel || 'Select Week', !!contextA.weekId);
    updateButton('context-a-entity', contextA.entityName || 'Select Entity', !!contextA.entityId);
    updateButton('context-a-category', contextA.categoryName || 'Select Category', !!contextA.categoryId);
    updateButton('context-a-promotion', contextA.promotionName || 'Select Promotion', !!contextA.promotionId);

    // Context B
    updateButton('context-b-date', contextB.weekLabel || 'Select Week', !!contextB.weekId);
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
        engagementScore: category.compositeScore || 0,
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
        engagementScore: promo.compositeScore || 0,
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
  }

  /**
   * Render circular/entity comparison
   */
  function renderCircularComparison() {
    if (!dataA || !dataB) return '';

    const metricsA = dataA.metrics;
    const metricsB = dataB.metrics;

    return `
      <!-- Summary Section -->
      <div class="compare-section-header">
        <span class="material-symbols-outlined">summarize</span>
        Summary
      </div>
      <div class="compare-row">
        <div class="compare-cell compare-cell--a">
          ${renderContextSummary('A', contextA)}
          <div class="compare-hero">
            <img src="${dataA.logo}" alt="${core.escapeHtml(dataA.name)}" class="compare-hero__logo">
            <h3 class="compare-hero__title">${core.escapeHtml(dataA.name)}</h3>
          </div>
          ${renderPercentileRow(metricsA.percentile, metricsA.engagementScore)}
        </div>
        <div class="compare-cell compare-cell--b">
          ${renderContextSummary('B', contextB)}
          <div class="compare-hero">
            <img src="${dataB.logo}" alt="${core.escapeHtml(dataB.name)}" class="compare-hero__logo">
            <h3 class="compare-hero__title">${core.escapeHtml(dataB.name)}</h3>
          </div>
          ${renderPercentileRow(metricsB.percentile, metricsB.engagementScore, true, metricsA.percentile)}
        </div>
      </div>

      <!-- Primary Metrics Section -->
      <div class="compare-section-header">
        <span class="material-symbols-outlined">analytics</span>
        Engagement Metrics
      </div>
      <div class="compare-row">
        <div class="compare-cell compare-cell--a">
          <div class="metric-rows">
            ${renderMetricRow('Views', formatNumber(metricsA.civ))}
            ${renderMetricRow('Clicks', formatNumber(metricsA.cc))}
            ${renderMetricRow('Added', formatNumber(metricsA.atl))}
          </div>
        </div>
        <div class="compare-cell compare-cell--b">
          <div class="metric-rows">
            ${renderMetricRowWithVariance('Views', formatNumber(metricsB.civ), metricsA.civ, metricsB.civ)}
            ${renderMetricRowWithVariance('Clicks', formatNumber(metricsB.cc), metricsA.cc, metricsB.cc)}
            ${renderMetricRowWithVariance('Added', formatNumber(metricsB.atl), metricsA.atl, metricsB.atl)}
          </div>
        </div>
      </div>

      <!-- Details Section -->
      <div class="compare-section-header">
        <span class="material-symbols-outlined">info</span>
        Details
      </div>
      <div class="compare-row">
        <div class="compare-cell compare-cell--a">
          <div class="metric-rows">
            ${renderMetricRow('Stores', formatNumber(metricsA.storeCount))}
            ${renderMetricRow('Categories', formatNumber(metricsA.categoryCount))}
            ${renderMetricRow('Promotions', formatNumber(metricsA.promotionCount))}
          </div>
        </div>
        <div class="compare-cell compare-cell--b">
          <div class="metric-rows">
            ${renderMetricRowWithVariance('Stores', formatNumber(metricsB.storeCount), metricsA.storeCount, metricsB.storeCount)}
            ${renderMetricRowWithVariance('Categories', formatNumber(metricsB.categoryCount), metricsA.categoryCount, metricsB.categoryCount)}
            ${renderMetricRowWithVariance('Promotions', formatNumber(metricsB.promotionCount), metricsA.promotionCount, metricsB.promotionCount)}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render category comparison
   */
  function renderCategoryComparison() {
    if (!dataA || !dataB) return '';

    const metricsA = dataA.metrics;
    const metricsB = dataB.metrics;

    return `
      <!-- Summary Section -->
      <div class="compare-section-header">
        <span class="material-symbols-outlined">summarize</span>
        Summary
      </div>
      <div class="compare-row">
        <div class="compare-cell compare-cell--a">
          ${renderContextSummary('A', contextA)}
          <div class="compare-hero compare-hero--category">
            <img src="${dataA.image}" alt="${core.escapeHtml(dataA.name)}" class="compare-hero__image">
            <h3 class="compare-hero__title">${core.escapeHtml(dataA.name)}</h3>
          </div>
          ${renderPercentileRow(metricsA.percentile, metricsA.engagementScore)}
        </div>
        <div class="compare-cell compare-cell--b">
          ${renderContextSummary('B', contextB)}
          <div class="compare-hero compare-hero--category">
            <img src="${dataB.image}" alt="${core.escapeHtml(dataB.name)}" class="compare-hero__image">
            <h3 class="compare-hero__title">${core.escapeHtml(dataB.name)}</h3>
          </div>
          ${renderPercentileRow(metricsB.percentile, metricsB.engagementScore, true, metricsA.percentile)}
        </div>
      </div>

      <!-- Primary Metrics Section -->
      <div class="compare-section-header">
        <span class="material-symbols-outlined">analytics</span>
        Engagement Metrics
      </div>
      <div class="compare-row">
        <div class="compare-cell compare-cell--a">
          <div class="metric-rows">
            ${renderMetricRow('Views', formatNumber(metricsA.civ))}
            ${renderMetricRow('Clicks', formatNumber(metricsA.cc))}
            ${renderMetricRow('Added', formatNumber(metricsA.atl))}
            ${renderMetricRow('Promotions', formatNumber(metricsA.promotionCount))}
          </div>
        </div>
        <div class="compare-cell compare-cell--b">
          <div class="metric-rows">
            ${renderMetricRowWithVariance('Views', formatNumber(metricsB.civ), metricsA.civ, metricsB.civ)}
            ${renderMetricRowWithVariance('Clicks', formatNumber(metricsB.cc), metricsA.cc, metricsB.cc)}
            ${renderMetricRowWithVariance('Added', formatNumber(metricsB.atl), metricsA.atl, metricsB.atl)}
            ${renderMetricRowWithVariance('Promotions', formatNumber(metricsB.promotionCount), metricsA.promotionCount, metricsB.promotionCount)}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render promotion comparison
   */
  function renderPromotionComparison() {
    if (!dataA || !dataB) return '';

    const metricsA = dataA.metrics;
    const metricsB = dataB.metrics;

    return `
      <!-- Summary Section -->
      <div class="compare-section-header">
        <span class="material-symbols-outlined">summarize</span>
        Summary
      </div>
      <div class="compare-row">
        <div class="compare-cell compare-cell--a">
          ${renderContextSummary('A', contextA)}
          <div class="compare-hero compare-hero--promotion">
            <img src="${dataA.image}" alt="${core.escapeHtml(dataA.name)}" class="compare-hero__image">
          </div>
          <h3 class="compare-hero__title">${core.escapeHtml(dataA.name)}</h3>
          <div class="compare-tags">
            <span class="compare-tag compare-tag--category">${core.escapeHtml(dataA.categoryName)}</span>
            <span class="compare-tag compare-tag--deal">${core.escapeHtml(metricsA.dealType || '')}</span>
          </div>
          ${renderPercentileRow(metricsA.percentile, metricsA.engagementScore)}
        </div>
        <div class="compare-cell compare-cell--b">
          ${renderContextSummary('B', contextB)}
          <div class="compare-hero compare-hero--promotion">
            <img src="${dataB.image}" alt="${core.escapeHtml(dataB.name)}" class="compare-hero__image">
          </div>
          <h3 class="compare-hero__title">${core.escapeHtml(dataB.name)}</h3>
          <div class="compare-tags">
            <span class="compare-tag compare-tag--category">${core.escapeHtml(dataB.categoryName)}</span>
            <span class="compare-tag compare-tag--deal">${core.escapeHtml(metricsB.dealType || '')}</span>
          </div>
          ${renderPercentileRow(metricsB.percentile, metricsB.engagementScore, true, metricsA.percentile)}
        </div>
      </div>

      <!-- Primary Metrics Section -->
      <div class="compare-section-header">
        <span class="material-symbols-outlined">analytics</span>
        Engagement Metrics
      </div>
      <div class="compare-row">
        <div class="compare-cell compare-cell--a">
          <div class="metric-rows">
            ${renderMetricRow('Views', formatNumber(metricsA.civ))}
            ${renderMetricRow('Clicks', formatNumber(metricsA.cc))}
            ${renderMetricRow('Added', formatNumber(metricsA.atl))}
          </div>
        </div>
        <div class="compare-cell compare-cell--b">
          <div class="metric-rows">
            ${renderMetricRowWithVariance('Views', formatNumber(metricsB.civ), metricsA.civ, metricsB.civ)}
            ${renderMetricRowWithVariance('Clicks', formatNumber(metricsB.cc), metricsA.cc, metricsB.cc)}
            ${renderMetricRowWithVariance('Added', formatNumber(metricsB.atl), metricsA.atl, metricsB.atl)}
          </div>
        </div>
      </div>

      <!-- Details Section -->
      <div class="compare-section-header">
        <span class="material-symbols-outlined">info</span>
        Details
      </div>
      <div class="compare-row">
        <div class="compare-cell compare-cell--a">
          <div class="metric-rows">
            ${renderMetricRow('Card Size', metricsA.cardSize || '-')}
            ${renderMetricRow('Original Price', formatCurrency(metricsA.originalPrice))}
            ${renderMetricRow('Sale Price', formatCurrency(metricsA.salePrice))}
          </div>
        </div>
        <div class="compare-cell compare-cell--b">
          <div class="metric-rows">
            ${renderMetricRowText('Card Size', metricsB.cardSize || '-', metricsA.cardSize, metricsB.cardSize)}
            ${renderMetricRowWithVariance('Original Price', formatCurrency(metricsB.originalPrice), metricsA.originalPrice, metricsB.originalPrice)}
            ${renderMetricRowWithVariance('Sale Price', formatCurrency(metricsB.salePrice), metricsA.salePrice, metricsB.salePrice)}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render context summary header
   */
  function renderContextSummary(label, ctx) {
    // Format days display
    const daysDisplay = ctx.daysFilter === 'all' || !ctx.daysFilter
      ? 'All Days'
      : `Days: ${ctx.daysFilter}`;

    return `
      <div class="context-summary">
        <span class="context-summary__label">${label}</span>
        <span class="context-summary__details">
          ${ctx.weekLabel || 'No date'} &bull; ${ctx.entityName || 'No entity'} &bull; ${daysDisplay}
        </span>
      </div>
    `;
  }

  /**
   * Get percentile variant class (high/medium/low)
   */
  function getPercentileVariant(percentile) {
    if (percentile >= 75) return 'high';
    if (percentile >= 50) return 'medium';
    return 'low';
  }

  /**
   * Render percentile row with bar chart icon (matching BASE Details)
   */
  function renderPercentileRow(percentile, score, showVariance = false, percentileA = 0) {
    const variance = showVariance ? calculateVariance(percentileA, percentile) : null;
    const variant = getPercentileVariant(percentile);
    return `
      <div class="detail-percentile-row">
        <div class="percentile-bar percentile-bar--${variant}">
          <div class="percentile-bar-fill percentile-bar-fill--${variant}" style="width: ${percentile}%;"></div>
        </div>
        <span class="percentile-score">${score}</span>
        <img src="./assets/chart-bar.svg" alt="Percentile" class="percentile-icon">
        <span class="percentile-value percentile-value--${variant}">${percentile}%</span>
        ${showVariance && variance ? renderVarianceIndicator(variance) : ''}
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
