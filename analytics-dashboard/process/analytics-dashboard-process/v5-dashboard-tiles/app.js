/**
 * Version 5: Dashboard Tiles - Application Logic
 */

(function() {
  'use strict';

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

  function updateKPIs(metrics) {
    if (!metrics) return;

    document.getElementById('kpi-civ').textContent = formatNumber(metrics.totalViews);
    document.getElementById('kpi-cc').textContent = formatNumber(metrics.totalClicks);
    document.getElementById('kpi-atl').textContent = formatNumber(metrics.totalATL);
    document.getElementById('kpi-ctr').textContent = metrics.avgCTR + '%';
  }

  function updatePromotionsTable(promotions) {
    const tbody = document.getElementById('promotions-table');
    if (!tbody || !promotions) return;

    tbody.innerHTML = promotions.slice(0, 8).map((promo, index) => `
      <tr>
        <td class="tile-table__rank">${index + 1}</td>
        <td class="tile-table__name">${promo.card_name || 'Unknown'}</td>
        <td>${formatCategoryName(promo.marketing_category)}</td>
        <td class="tile-table__number">${formatNumber(promo.card_in_view)}</td>
        <td class="tile-table__number">${formatNumber(promo.card_clicked)}</td>
        <td class="tile-table__number">${formatNumber(promo.added_to_list)}</td>
        <td class="tile-table__score">${formatNumber(promo.composite_score)}</td>
      </tr>
    `).join('');
  }

  function updateCategoryBars(categories) {
    const container = document.getElementById('category-bars');
    if (!container || !categories) return;

    const maxScore = Math.max(...categories.map(c => c.avgScore || 0));

    container.innerHTML = categories.slice(0, 6).map(cat => {
      const barWidth = maxScore > 0 ? (cat.avgScore / maxScore) * 100 : 0;

      return `
        <div class="bar-item">
          <div class="bar-item__header">
            <span class="bar-item__name">${formatCategoryName(cat.name)}</span>
            <span class="bar-item__value">${cat.avgScore}</span>
          </div>
          <div class="bar-item__bar">
            <div class="bar-item__fill" style="width: ${barWidth}%"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  function init() {
    MockDataLoader.onReady(function(data) {
      console.log('Dashboard Tiles: Data loaded', data);

      const metrics = MockDataLoader.getSummaryMetrics();
      updateKPIs(metrics);

      const topPromotions = MockDataLoader.getTopPromotions(8);
      updatePromotionsTable(topPromotions);

      const categories = MockDataLoader.getCategoryPerformance();
      updateCategoryBars(categories);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
