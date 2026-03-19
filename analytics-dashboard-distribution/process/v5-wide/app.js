/**
 * V5 Wide Monitor - Application Logic
 * Optimized for large displays with persistent panels
 */

(function() {
  'use strict';

  let allPromotions = [];
  let filteredPromotions = [];
  let activeCategory = null;
  let activePromotion = null;

  const categoryList = document.getElementById('category-list');
  const promotionGrid = document.getElementById('promotion-grid');
  const detailContent = document.getElementById('detail-content');
  const categoryCount = document.getElementById('category-count');
  const promoCount = document.getElementById('promo-count');

  function init() {
    allPromotions = MockData.promotions;
    filteredPromotions = [...allPromotions];

    renderCategories();
    renderPromotions();
    bindEvents();
    updateCounts();
  }

  function renderCategories() {
    const allItem = `
      <div class="category-item all-category ${activeCategory === null ? 'active' : ''}" data-id="all">
        <div class="category-item__info">
          <div class="category-item__name">All Promotions</div>
          <div class="category-item__meta">${allPromotions.length} items</div>
        </div>
      </div>
    `;

    const categoryItems = MockData.categories.map(cat => {
      const percentileClass = getPercentileClass(cat.percentile);
      return `
        <div class="category-item ${activeCategory === cat.id ? 'active' : ''}" data-id="${cat.id}">
          <div class="category-item__info">
            <div class="category-item__name">${cat.name}</div>
            <div class="category-item__meta">${cat.promotionCount} promotions</div>
          </div>
          <div class="category-item__score">
            <div class="category-item__percentile category-item__percentile--${percentileClass}">
              ${cat.percentile}
            </div>
          </div>
        </div>
      `;
    }).join('');

    categoryList.innerHTML = allItem + categoryItems;
  }

  function renderPromotions() {
    promotionGrid.innerHTML = filteredPromotions.map(promo => `
      <div class="promo-card ${activePromotion === promo.id ? 'active' : ''}" data-id="${promo.id}">
        <img class="promo-card__image" src="${promo.thumbImage}" alt="${promo.name}">
        <div class="promo-card__content">
          <h3 class="promo-card__title">${promo.name}</h3>
          <p class="promo-card__meta">${promo.categoryName} • ${promo.dealType}</p>
          <div class="promo-card__stats">
            <div class="promo-stat">
              <div class="promo-stat__value">${MockData.formatNumber(promo.civ)}</div>
              <div class="promo-stat__label">Views</div>
            </div>
            <div class="promo-stat">
              <div class="promo-stat__value">${MockData.formatNumber(promo.cc)}</div>
              <div class="promo-stat__label">Clicks</div>
            </div>
            <div class="promo-stat">
              <div class="promo-stat__value">${promo.percentile}</div>
              <div class="promo-stat__label">%ile</div>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  function renderDetail(promo) {
    const percentileClass = getPercentileClass(promo.percentile);

    detailContent.innerHTML = `
      <div class="detail-hero">
        <img src="${promo.heroImage}" alt="${promo.name}">
      </div>
      <div class="detail-body">
        <h2 class="detail-title">${promo.name}</h2>
        <p class="detail-meta">${promo.categoryName} • ${promo.dealType} • ${promo.cardSize}</p>

        <div class="detail-kpis">
          <div class="detail-kpi">
            <div class="detail-kpi__value">${MockData.formatNumber(promo.civ)}</div>
            <div class="detail-kpi__label">Circular Item Views</div>
          </div>
          <div class="detail-kpi">
            <div class="detail-kpi__value">${MockData.formatNumber(promo.cc)}</div>
            <div class="detail-kpi__label">Circular Clicks</div>
          </div>
          <div class="detail-kpi">
            <div class="detail-kpi__value">${MockData.formatNumber(promo.atl)}</div>
            <div class="detail-kpi__label">Add to List</div>
          </div>
          <div class="detail-kpi">
            <div class="detail-kpi__value">${((promo.cc / promo.civ) * 100).toFixed(1)}%</div>
            <div class="detail-kpi__label">Click-Through Rate</div>
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-section__title">Performance</div>
          <div style="display: flex; align-items: center; gap: var(--space-3);">
            <span class="percentile-badge percentile-badge--${percentileClass}">
              ${promo.percentile}th Percentile
            </span>
            <span style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">
              Score: ${promo.compositeScore}
            </span>
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-section__title">7-Day Trend</div>
          <div class="mini-chart" id="trend-chart"></div>
        </div>

        <div class="detail-section">
          <div class="detail-section__title">Top Performing Stores</div>
          <div class="store-list">
            ${MockData.topStores.slice(0, 5).map(store => `
              <div class="store-item">
                <span class="store-item__name">${store.name}</span>
                <span class="store-item__score">${store.score}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="detail-actions">
          <button class="btn btn--outline">Export Data</button>
          <button class="btn btn--primary">View Full Report</button>
        </div>
      </div>
    `;

    renderTrendChart();
  }

  function renderTrendChart() {
    const container = document.getElementById('trend-chart');
    if (!container) return;

    const maxValue = Math.max(...MockData.weeklyTrend.map(d => d.value));

    container.innerHTML = MockData.weeklyTrend.map(day => {
      const height = (day.value / maxValue) * 100;
      return `<div class="chart-bar" style="height: ${height}%" title="${day.day}: ${day.value}"></div>`;
    }).join('');
  }

  function renderEmptyDetail() {
    detailContent.innerHTML = `
      <div class="detail-empty">
        <div class="detail-empty__icon">👆</div>
        <p class="detail-empty__text">Select a promotion to view details</p>
      </div>
    `;
  }

  function updateCounts() {
    categoryCount.textContent = MockData.categories.length;
    promoCount.textContent = filteredPromotions.length;
  }

  function getPercentileClass(percentile) {
    if (percentile >= 75) return 'high';
    if (percentile >= 50) return 'medium';
    return 'low';
  }

  function bindEvents() {
    // Category selection
    categoryList.addEventListener('click', e => {
      const item = e.target.closest('.category-item');
      if (!item) return;

      const id = item.dataset.id;

      if (id === 'all') {
        activeCategory = null;
        filteredPromotions = [...allPromotions];
      } else {
        activeCategory = id;
        filteredPromotions = allPromotions.filter(p => p.category === id);
      }

      renderCategories();
      renderPromotions();
      updateCounts();

      // Clear active promotion when changing category
      activePromotion = null;
      renderEmptyDetail();
    });

    // Promotion selection
    promotionGrid.addEventListener('click', e => {
      const card = e.target.closest('.promo-card');
      if (!card) return;

      const id = card.dataset.id;
      activePromotion = id;

      const promo = MockData.getPromotionById(id);
      if (promo) {
        renderPromotions();
        renderDetail(promo);

        // On smaller screens, open panel
        const detailPanel = document.getElementById('detail-panel');
        if (window.innerWidth <= 1100) {
          detailPanel.classList.add('open');
        }
      }
    });

    // Search
    document.getElementById('search-input').addEventListener('input', e => {
      const query = e.target.value.toLowerCase();
      const baseList = activeCategory
        ? allPromotions.filter(p => p.category === activeCategory)
        : allPromotions;

      filteredPromotions = baseList.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.categoryName.toLowerCase().includes(query) ||
        p.dealType.toLowerCase().includes(query)
      );

      renderPromotions();
      updateCounts();
    });

    // Close detail panel on mobile (click outside)
    document.addEventListener('click', e => {
      const detailPanel = document.getElementById('detail-panel');
      if (window.innerWidth <= 1100 && detailPanel.classList.contains('open')) {
        if (!e.target.closest('.side-panel--right') && !e.target.closest('.promo-card')) {
          detailPanel.classList.remove('open');
        }
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        const detailPanel = document.getElementById('detail-panel');
        detailPanel.classList.remove('open');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
