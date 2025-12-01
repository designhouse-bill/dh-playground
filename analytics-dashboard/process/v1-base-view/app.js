/**
 * V1 Base View - Application Logic
 *
 * Features:
 * - Category list (default) / Promotion list (filtered)
 * - Detail Panel for selected items
 * - Filter chips for navigation
 * - Hero/Thumb images for promotions
 */

(function() {
  'use strict';

  // State
  let currentView = 'categories'; // 'categories' or 'promotions'
  let selectedCategory = null;
  let selectedItem = null;
  let filters = [];

  // DOM Elements
  const contentList = document.getElementById('content-list');
  const listTitle = document.getElementById('list-title');
  const listCount = document.getElementById('list-count');
  const filterRow = document.getElementById('filter-row');
  const filterChips = document.getElementById('filter-chips');
  const detailPanel = document.getElementById('detail-panel');
  const detailOverlay = document.getElementById('detail-overlay');
  const panelBody = document.getElementById('panel-body');
  const panelFooter = document.getElementById('panel-footer');
  const panelType = document.getElementById('panel-type');
  const mainContent = document.querySelector('.main-content');

  // Initialize
  function init() {
    updateKPIs();
    renderCategoryList();
    bindEvents();
  }

  // Update KPI strip
  function updateKPIs() {
    const kpis = MockData.getTotalKPIs();
    document.getElementById('kpi-civ').textContent = MockData.formatNumber(kpis.civ);
    document.getElementById('kpi-cc').textContent = MockData.formatNumber(kpis.cc);
    document.getElementById('kpi-atl').textContent = MockData.formatNumber(kpis.atl);
    document.getElementById('kpi-ctr').textContent = kpis.ctr + '%';
    document.getElementById('kpi-score').textContent = kpis.avgScore;
  }

  // Render category list
  function renderCategoryList() {
    currentView = 'categories';
    listTitle.textContent = 'Categories';
    listCount.textContent = `${MockData.categories.length} categories`;

    contentList.innerHTML = MockData.categories.map((cat, index) => {
      const percentileClass = getPercentileClass(cat.percentile);
      return `
        <div class="list-row" data-type="category" data-id="${cat.id}">
          <div class="list-row__rank ${index < 3 ? 'list-row__rank--top' : ''}">${index + 1}</div>
          <div class="list-row__icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z"/>
              <path d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z"/>
            </svg>
          </div>
          <div class="list-row__content">
            <div class="list-row__name">${cat.name}</div>
            <div class="list-row__meta">${cat.promotionCount} promotions</div>
          </div>
          <div class="list-row__metrics">
            <div class="list-row__metric">
              <div class="list-row__metric-value">${MockData.formatNumber(cat.civ)}</div>
              <div class="list-row__metric-label">CIV</div>
            </div>
            <div class="list-row__metric">
              <div class="list-row__metric-value">${MockData.formatNumber(cat.cc)}</div>
              <div class="list-row__metric-label">CC</div>
            </div>
            <div class="list-row__metric">
              <div class="list-row__metric-value">${cat.compositeScore}</div>
              <div class="list-row__metric-label">Score</div>
            </div>
          </div>
          <div class="list-row__percentile">
            <div class="percentile-bar">
              <div class="percentile-bar__fill percentile-bar__fill--${percentileClass}" style="width: ${cat.percentile}%"></div>
            </div>
            <span class="percentile-value percentile-value--${percentileClass}">${cat.percentile}</span>
          </div>
          <svg class="list-row__arrow" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/>
          </svg>
        </div>
      `;
    }).join('');
  }

  // Render promotion list
  function renderPromotionList(categoryId) {
    currentView = 'promotions';
    const category = MockData.getCategoryById(categoryId);
    const promotions = MockData.getPromotionsByCategory(categoryId);

    listTitle.textContent = category ? category.name : 'Promotions';
    listCount.textContent = `${promotions.length} promotions`;

    contentList.innerHTML = promotions.map((promo, index) => {
      const percentileClass = getPercentileClass(promo.percentile);
      return `
        <div class="list-row" data-type="promotion" data-id="${promo.id}">
          <div class="list-row__rank ${index < 3 ? 'list-row__rank--top' : ''}">${index + 1}</div>
          <div class="list-row__thumb">
            <img src="${promo.thumbImage}" alt="${promo.name}">
          </div>
          <div class="list-row__content">
            <div class="list-row__name">${promo.name}</div>
            <div class="list-row__meta">${promo.dealType} • ${promo.cardSize}</div>
          </div>
          <div class="list-row__metrics">
            <div class="list-row__metric">
              <div class="list-row__metric-value">${MockData.formatNumber(promo.civ)}</div>
              <div class="list-row__metric-label">CIV</div>
            </div>
            <div class="list-row__metric">
              <div class="list-row__metric-value">${MockData.formatNumber(promo.cc)}</div>
              <div class="list-row__metric-label">CC</div>
            </div>
            <div class="list-row__metric">
              <div class="list-row__metric-value">${promo.compositeScore}</div>
              <div class="list-row__metric-label">Score</div>
            </div>
          </div>
          <div class="list-row__percentile">
            <div class="percentile-bar">
              <div class="percentile-bar__fill percentile-bar__fill--${percentileClass}" style="width: ${promo.percentile}%"></div>
            </div>
            <span class="percentile-value percentile-value--${percentileClass}">${promo.percentile}</span>
          </div>
          <svg class="list-row__arrow" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/>
          </svg>
        </div>
      `;
    }).join('');
  }

  // Show detail panel
  function showDetailPanel(type, id) {
    selectedItem = { type, id };

    if (type === 'category') {
      renderCategoryDetail(id);
    } else {
      renderPromotionDetail(id);
    }

    detailPanel.classList.add('detail-panel--open');
    detailOverlay.classList.add('detail-overlay--visible');
    mainContent.classList.add('main-content--panel-open');

    // Mark row as selected
    document.querySelectorAll('.list-row').forEach(row => {
      row.classList.toggle('list-row--selected', row.dataset.id === id);
    });
  }

  // Hide detail panel
  function hideDetailPanel() {
    selectedItem = null;
    detailPanel.classList.remove('detail-panel--open');
    detailOverlay.classList.remove('detail-overlay--visible');
    mainContent.classList.remove('main-content--panel-open');

    document.querySelectorAll('.list-row').forEach(row => {
      row.classList.remove('list-row--selected');
    });
  }

  // Render category detail
  function renderCategoryDetail(id) {
    const category = MockData.getCategoryById(id);
    if (!category) return;

    panelType.textContent = 'Category Details';

    panelBody.innerHTML = `
      <div class="detail-title">
        <div class="detail-title__name">${category.name}</div>
        <div class="detail-title__meta">${category.promotionCount} promotions</div>
      </div>

      <div class="detail-percentile">
        <div class="detail-percentile__ring">
          <svg viewBox="0 0 36 36">
            <circle class="detail-percentile__ring-bg" cx="18" cy="18" r="15"/>
            <circle class="detail-percentile__ring-fill ${getPercentileClass(category.percentile) !== 'high' ? 'detail-percentile__ring-fill--' + getPercentileClass(category.percentile) : ''}"
              cx="18" cy="18" r="15"
              stroke-dasharray="${category.percentile}, 100"/>
          </svg>
          <span class="detail-percentile__value">${category.percentile}</span>
        </div>
        <div class="detail-percentile__info">
          <div class="detail-percentile__label">Percentile Rank</div>
          <div class="detail-percentile__desc">Top ${100 - category.percentile}% of categories</div>
        </div>
      </div>

      <div class="detail-kpis">
        <div class="detail-kpi detail-kpi--highlight">
          <div class="detail-kpi__value">${category.compositeScore}</div>
          <div class="detail-kpi__label">Composite Score</div>
        </div>
        <div class="detail-kpi">
          <div class="detail-kpi__value">${MockData.formatNumber(category.civ)}</div>
          <div class="detail-kpi__label">Card in View</div>
        </div>
        <div class="detail-kpi">
          <div class="detail-kpi__value">${MockData.formatNumber(category.cc)}</div>
          <div class="detail-kpi__label">Card Clicked</div>
        </div>
        <div class="detail-kpi">
          <div class="detail-kpi__value">${MockData.formatNumber(category.atl)}</div>
          <div class="detail-kpi__label">Added to List</div>
        </div>
      </div>

      <div class="detail-section">
        <div class="detail-section__title">7-Day Trend</div>
        <div class="detail-trend">
          ${MockData.weeklyTrend.map((d, i) => `
            <div class="detail-trend__bar ${i === MockData.weeklyTrend.length - 1 ? 'detail-trend__bar--current' : ''}"
              style="height: ${d.value}%"></div>
          `).join('')}
        </div>
      </div>

      <div class="detail-section">
        <div class="detail-section__title">Top 5 Stores</div>
        <div class="detail-stores">
          ${MockData.topStores.map((store, i) => `
            <div class="detail-store">
              <span class="detail-store__rank">${i + 1}</span>
              <span class="detail-store__name">${store.name}</span>
              <span class="detail-store__value">${store.score}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    panelFooter.innerHTML = `
      <button class="detail-action detail-action--primary" id="view-promotions-btn" data-category="${id}">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/>
        </svg>
        View Promotions
      </button>
      <button class="detail-action detail-action--secondary">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
          <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8z"/>
          <path d="M12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z"/>
        </svg>
        Compare Category
      </button>
    `;

    // Bind view promotions button
    document.getElementById('view-promotions-btn').addEventListener('click', function() {
      const categoryId = this.dataset.category;
      const category = MockData.getCategoryById(categoryId);
      drillToCategory(categoryId, category.name);
    });
  }

  // Render promotion detail
  function renderPromotionDetail(id) {
    const promo = MockData.getPromotionById(id);
    if (!promo) return;

    panelType.textContent = 'Promotion Details';

    panelBody.innerHTML = `
      <div class="detail-hero">
        <img class="detail-hero__image" src="${promo.heroImage}" alt="${promo.name}">
      </div>

      <div class="detail-title">
        <div class="detail-title__name">${promo.name}</div>
        <div class="detail-title__meta">${promo.categoryName} • ${promo.dealType} • ${promo.cardSize}</div>
      </div>

      <div class="detail-percentile">
        <div class="detail-percentile__ring">
          <svg viewBox="0 0 36 36">
            <circle class="detail-percentile__ring-bg" cx="18" cy="18" r="15"/>
            <circle class="detail-percentile__ring-fill ${getPercentileClass(promo.percentile) !== 'high' ? 'detail-percentile__ring-fill--' + getPercentileClass(promo.percentile) : ''}"
              cx="18" cy="18" r="15"
              stroke-dasharray="${promo.percentile}, 100"/>
          </svg>
          <span class="detail-percentile__value">${promo.percentile}</span>
        </div>
        <div class="detail-percentile__info">
          <div class="detail-percentile__label">Percentile Rank</div>
          <div class="detail-percentile__desc">Top ${100 - promo.percentile}% of promotions</div>
        </div>
      </div>

      <div class="detail-kpis">
        <div class="detail-kpi detail-kpi--highlight">
          <div class="detail-kpi__value">${promo.compositeScore}</div>
          <div class="detail-kpi__label">Composite Score</div>
        </div>
        <div class="detail-kpi">
          <div class="detail-kpi__value">${MockData.formatNumber(promo.civ)}</div>
          <div class="detail-kpi__label">Card in View</div>
        </div>
        <div class="detail-kpi">
          <div class="detail-kpi__value">${MockData.formatNumber(promo.cc)}</div>
          <div class="detail-kpi__label">Card Clicked</div>
        </div>
        <div class="detail-kpi">
          <div class="detail-kpi__value">${MockData.formatNumber(promo.atl)}</div>
          <div class="detail-kpi__label">Added to List</div>
        </div>
      </div>

      <div class="detail-section">
        <div class="detail-section__title">7-Day Trend</div>
        <div class="detail-trend">
          ${MockData.weeklyTrend.map((d, i) => `
            <div class="detail-trend__bar ${i === MockData.weeklyTrend.length - 1 ? 'detail-trend__bar--current' : ''}"
              style="height: ${d.value}%"></div>
          `).join('')}
        </div>
      </div>

      <div class="detail-section">
        <div class="detail-section__title">Details</div>
        <div class="detail-attributes">
          <div class="detail-attribute">
            <span class="detail-attribute__label">Deal Type</span>
            <span class="detail-attribute__value">${promo.dealType}</span>
          </div>
          <div class="detail-attribute">
            <span class="detail-attribute__label">Card Size</span>
            <span class="detail-attribute__value">${promo.cardSize}</span>
          </div>
          <div class="detail-attribute">
            <span class="detail-attribute__label">Start Date</span>
            <span class="detail-attribute__value">${promo.startDate}</span>
          </div>
          <div class="detail-attribute">
            <span class="detail-attribute__label">End Date</span>
            <span class="detail-attribute__value">${promo.endDate}</span>
          </div>
          <div class="detail-attribute">
            <span class="detail-attribute__label">CTR</span>
            <span class="detail-attribute__value">${((promo.cc / promo.civ) * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <div class="detail-section__title">Top 5 Stores</div>
        <div class="detail-stores">
          ${MockData.topStores.map((store, i) => `
            <div class="detail-store">
              <span class="detail-store__rank">${i + 1}</span>
              <span class="detail-store__name">${store.name}</span>
              <span class="detail-store__value">${store.score}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    panelFooter.innerHTML = `
      <button class="detail-action detail-action--secondary">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
          <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8z"/>
          <path d="M12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z"/>
        </svg>
        Compare Promotion
      </button>
    `;
  }

  // Drill to category (show promotions)
  function drillToCategory(categoryId, categoryName) {
    selectedCategory = { id: categoryId, name: categoryName };
    addFilter('category', categoryId, categoryName);
    renderPromotionList(categoryId);
    hideDetailPanel();
  }

  // Add filter chip
  function addFilter(type, id, label) {
    // Remove existing filter of same type
    filters = filters.filter(f => f.type !== type);
    filters.push({ type, id, label });
    renderFilterChips();
  }

  // Remove filter
  function removeFilter(type) {
    filters = filters.filter(f => f.type !== type);
    renderFilterChips();

    if (type === 'category') {
      selectedCategory = null;
      renderCategoryList();
      hideDetailPanel();
    }
  }

  // Clear all filters
  function clearAllFilters() {
    filters = [];
    selectedCategory = null;
    renderFilterChips();
    renderCategoryList();
    hideDetailPanel();
  }

  // Render filter chips
  function renderFilterChips() {
    if (filters.length === 0) {
      filterRow.classList.add('filter-row--empty');
      return;
    }

    filterRow.classList.remove('filter-row--empty');

    filterChips.innerHTML = filters.map(filter => `
      <div class="filter-chip filter-chip--${filter.type}" data-type="${filter.type}">
        <span class="filter-chip__label">${capitalizeFirst(filter.type)}:</span>
        <span class="filter-chip__value">${filter.label}</span>
        <button class="filter-chip__remove" data-type="${filter.type}">
          <svg class="filter-chip__remove-icon" viewBox="0 0 12 12" fill="currentColor">
            <path d="M3.05 3.05a.75.75 0 011.06 0L6 4.94l1.89-1.89a.75.75 0 111.06 1.06L7.06 6l1.89 1.89a.75.75 0 11-1.06 1.06L6 7.06l-1.89 1.89a.75.75 0 01-1.06-1.06L4.94 6 3.05 4.11a.75.75 0 010-1.06z"/>
          </svg>
        </button>
      </div>
    `).join('');

    // Bind remove handlers
    filterChips.querySelectorAll('.filter-chip__remove').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        removeFilter(this.dataset.type);
      });
    });
  }

  // Bind events
  function bindEvents() {
    // Row clicks
    contentList.addEventListener('click', function(e) {
      const row = e.target.closest('.list-row');
      if (row) {
        showDetailPanel(row.dataset.type, row.dataset.id);
      }
    });

    // Panel close
    document.getElementById('panel-close').addEventListener('click', hideDetailPanel);
    detailOverlay.addEventListener('click', hideDetailPanel);

    // Clear all
    document.getElementById('clear-all').addEventListener('click', clearAllFilters);

    // Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        hideDetailPanel();
      }
    });
  }

  // Helpers
  function getPercentileClass(percentile) {
    if (percentile >= 75) return 'high';
    if (percentile >= 50) return 'medium';
    return 'low';
  }

  function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
