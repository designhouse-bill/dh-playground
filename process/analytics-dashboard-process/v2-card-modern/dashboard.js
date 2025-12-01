/**
 * Version 2: Card Modern - Dashboard Page
 *
 * Shows KPIs, Quick Stats, Trends, and Category Performance
 * This is the summary view - Performance page shows the detailed data grid
 */

(function() {
  'use strict';

  let allPromotions = [];
  let allCategories = [];

  // Helpers
  function formatNumber(num) {
    if (num === undefined || num === null) return '--';
    return num.toLocaleString();
  }

  function formatCategoryName(name) {
    if (!name) return 'Unknown';
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Update KPIs
  function updateKPIs() {
    const totalViews = allPromotions.reduce((sum, p) => sum + (p.card_in_view || 0), 0);
    const totalClicks = allPromotions.reduce((sum, p) => sum + (p.card_clicked || 0), 0);
    const totalATL = allPromotions.reduce((sum, p) => sum + (p.added_to_list || 0), 0);
    const avgCTR = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : 0;

    document.getElementById('kpi-views').textContent = formatNumber(totalViews);
    document.getElementById('kpi-clicks').textContent = formatNumber(totalClicks);
    document.getElementById('kpi-atl').textContent = formatNumber(totalATL);
    document.getElementById('kpi-ctr').textContent = avgCTR + '%';
  }

  // Update Quick Stats
  function updateQuickStats() {
    const totalPromos = allPromotions.length;
    const totalCats = allCategories.length;
    const avgScore = allPromotions.length > 0
      ? Math.round(allPromotions.reduce((sum, p) => sum + (p.composite_score || 0), 0) / allPromotions.length)
      : 0;

    // Calculate top performers (75th percentile and above)
    const scores = allPromotions.map(p => p.composite_score || 0).sort((a, b) => b - a);
    const p75Index = Math.floor(scores.length * 0.25);
    const topPerformers = p75Index;

    document.getElementById('stat-promos').textContent = formatNumber(totalPromos);
    document.getElementById('stat-cats').textContent = formatNumber(totalCats);
    document.getElementById('stat-avg-score').textContent = formatNumber(avgScore);
    document.getElementById('stat-top-pct').textContent = formatNumber(topPerformers);
  }

  // Render Category Performance list
  function renderCategoryList() {
    const container = document.getElementById('category-list');
    if (!container) return;

    const maxScore = Math.max(...allCategories.map(c => c.avgScore || 0));

    container.innerHTML = allCategories.map((cat) => {
      const barWidth = maxScore > 0 ? (cat.avgScore / maxScore) * 100 : 0;

      return `
        <div class="category-list-item">
          <div class="category-list-item__info">
            <span class="category-list-item__name">${formatCategoryName(cat.name)}</span>
            <span class="category-list-item__count">${cat.count} promotions</span>
          </div>
          <div class="category-list-item__metrics">
            <div class="category-list-item__metric">
              <span class="category-list-item__value">${formatNumber(cat.totalViews)}</span>
              <span class="category-list-item__label">Views</span>
            </div>
            <div class="category-list-item__metric">
              <span class="category-list-item__value">${cat.ctr}%</span>
              <span class="category-list-item__label">CTR</span>
            </div>
            <div class="category-list-item__metric">
              <span class="category-list-item__value">${cat.avgScore}</span>
              <span class="category-list-item__label">Avg Score</span>
            </div>
          </div>
          <div class="category-list-item__bar">
            <div class="category-list-item__bar-fill" style="width: ${barWidth}%"></div>
          </div>
        </div>
      `;
    }).join('');

    // Update count
    const countEl = document.getElementById('category-count');
    if (countEl) {
      countEl.textContent = `${allCategories.length} categories`;
    }
  }

  // Initialize
  function init() {
    MockDataLoader.onReady(function(data) {
      console.log('Dashboard: Data loaded', data);

      // Store data
      allPromotions = data.promotions || [];
      allCategories = MockDataLoader.getCategoryPerformance();

      // Update UI
      updateKPIs();
      updateQuickStats();
      renderCategoryList();
    });

    // Initialize context system if available
    if (window.ContextSystem) {
      ContextSystem.init({
        onChange: function(state) {
          console.log('Context changed:', state);
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
