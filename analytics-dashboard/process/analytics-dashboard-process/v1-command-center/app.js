/**
 * Version 1: Command Center - Application Logic
 */

(function() {
  'use strict';

  // Update clock
  function updateClock() {
    const timeEl = document.getElementById('current-time');
    if (timeEl) {
      const now = new Date();
      timeEl.textContent = now.toLocaleTimeString('en-US', { hour12: false });
    }
  }

  // Format number with commas
  function formatNumber(num) {
    if (num === undefined || num === null) return '--';
    return num.toLocaleString();
  }

  // Update KPI values
  function updateKPIs(metrics) {
    if (!metrics) return;

    document.getElementById('kpi-views').textContent = formatNumber(metrics.totalViews);
    document.getElementById('kpi-clicks').textContent = formatNumber(metrics.totalClicks);
    document.getElementById('kpi-atl').textContent = formatNumber(metrics.totalATL);
    document.getElementById('kpi-ctr').textContent = metrics.avgCTR + '%';
    document.getElementById('kpi-conv').textContent = metrics.avgConversion + '%';

    const avgScore = Math.round(metrics.totalViews / Math.max(metrics.totalPromotions, 1));
    document.getElementById('kpi-score').textContent = formatNumber(avgScore);

    document.getElementById('stat-promos').textContent = metrics.totalPromotions;
  }

  // Update promotions table
  function updatePromotionsTable(promotions) {
    const tbody = document.getElementById('promotions-table');
    if (!tbody || !promotions) return;

    const maxScore = Math.max(...promotions.map(p => p.composite_score || 0));

    tbody.innerHTML = promotions.slice(0, 10).map((promo, index) => {
      const score = promo.composite_score || 0;
      const barWidth = maxScore > 0 ? (score / maxScore) * 100 : 0;

      return `
        <tr>
          <td class="data-table__rank">${index + 1}</td>
          <td class="data-table__name">${promo.card_name || 'Unknown'}</td>
          <td>${formatCategoryName(promo.marketing_category)}</td>
          <td>${formatNumber(promo.card_in_view)}</td>
          <td>${formatNumber(promo.card_clicked)}</td>
          <td>${formatNumber(promo.added_to_list)}</td>
          <td class="data-table__score">${formatNumber(score)}</td>
          <td class="data-table__bar">
            <div class="data-table__bar-fill" style="width: ${barWidth}%"></div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Format category name
  function formatCategoryName(name) {
    if (!name) return 'Unknown';
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Update category rankings
  function updateCategoryRankings(categories) {
    const container = document.getElementById('category-rankings');
    if (!container || !categories) return;

    container.innerHTML = categories.slice(0, 8).map((cat, index) => `
      <div class="rank-item">
        <span class="rank-item__position">${index + 1}</span>
        <span class="rank-item__name">${formatCategoryName(cat.name)}</span>
        <span class="rank-item__value">${cat.avgScore}</span>
      </div>
    `).join('');

    // Update category count
    const statCats = document.getElementById('stat-cats');
    if (statCats) {
      statCats.textContent = categories.length;
    }
  }

  // Initialize dashboard
  function init() {
    // Start clock
    updateClock();
    setInterval(updateClock, 1000);

    // Wait for data
    MockDataLoader.onReady(function(data) {
      console.log('Command Center: Data loaded', data);

      // Update KPIs
      const metrics = MockDataLoader.getSummaryMetrics();
      updateKPIs(metrics);

      // Update promotions table
      const topPromotions = MockDataLoader.getTopPromotions(10);
      updatePromotionsTable(topPromotions);

      // Update category rankings
      const categories = MockDataLoader.getCategoryPerformance();
      updateCategoryRankings(categories);
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
