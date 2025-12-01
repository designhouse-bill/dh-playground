/**
 * Version 4: Minimal Focus - Application Logic
 */

(function() {
  'use strict';

  function formatNumber(num) {
    if (num === undefined || num === null) return '--';
    return num.toLocaleString();
  }

  function formatCompact(num) {
    if (num === undefined || num === null) return '--';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
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

    document.getElementById('kpi-views').textContent = formatCompact(metrics.totalViews);
    document.getElementById('kpi-clicks').textContent = formatCompact(metrics.totalClicks);
    document.getElementById('kpi-atl').textContent = formatCompact(metrics.totalATL);
    document.getElementById('kpi-ctr').textContent = metrics.avgCTR + '%';
  }

  function updatePromotionsList(promotions) {
    const container = document.getElementById('promo-list');
    if (!container || !promotions) return;

    container.innerHTML = promotions.slice(0, 8).map((promo, index) => `
      <div class="promo-item">
        <div class="promo-item__rank">${index + 1}</div>
        <div class="promo-item__info">
          <div class="promo-item__name">${promo.card_name || 'Unknown'}</div>
          <div class="promo-item__category">${formatCategoryName(promo.marketing_category)}</div>
        </div>
        <div class="promo-item__metrics">
          <div class="promo-item__metric">
            <div class="promo-item__metric-value">${formatNumber(promo.card_in_view)}</div>
            <div class="promo-item__metric-label">Views</div>
          </div>
          <div class="promo-item__metric">
            <div class="promo-item__metric-value">${formatNumber(promo.card_clicked)}</div>
            <div class="promo-item__metric-label">Clicks</div>
          </div>
          <div class="promo-item__metric">
            <div class="promo-item__metric-value">${formatNumber(promo.added_to_list)}</div>
            <div class="promo-item__metric-label">ATL</div>
          </div>
        </div>
        <div class="promo-item__score">${formatNumber(promo.composite_score)}</div>
      </div>
    `).join('');
  }

  function updateCategoryList(categories) {
    const container = document.getElementById('category-list');
    if (!container || !categories) return;

    container.innerHTML = categories.slice(0, 8).map((cat, index) => `
      <div class="category-item">
        <div class="category-item__info">
          <span class="category-item__rank">${index + 1}</span>
          <span class="category-item__name">${formatCategoryName(cat.name)}</span>
        </div>
        <span class="category-item__score">${cat.avgScore}</span>
      </div>
    `).join('');
  }

  function updateInsight(promotions) {
    if (!promotions) return;

    // Count promotions above 75th percentile
    const highPerformers = promotions.filter(p => (p.percentile || 0) >= 75).length;
    const percentage = Math.round((highPerformers / promotions.length) * 100);

    document.getElementById('insight-value').textContent = percentage + '%';
    document.getElementById('insight-description').textContent =
      `${highPerformers} of ${promotions.length} promotions are performing above the 75th percentile this week, indicating ${percentage > 50 ? 'strong' : 'moderate'} overall engagement.`;
  }

  function init() {
    MockDataLoader.onReady(function(data) {
      console.log('Minimal Focus: Data loaded', data);

      const metrics = MockDataLoader.getSummaryMetrics();
      updateKPIs(metrics);

      const topPromotions = MockDataLoader.getTopPromotions(8);
      updatePromotionsList(topPromotions);

      const categories = MockDataLoader.getCategoryPerformance();
      updateCategoryList(categories);

      const allPromotions = MockDataLoader.getData()?.promotions || [];
      updateInsight(allPromotions);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
