/**
 * V3 A/B Comparison - Application Logic
 * Side-by-side promotion comparison with delta display
 */

(function() {
  'use strict';

  let selectedPromotions = [];
  const maxSelections = 2;

  const selectionList = document.getElementById('selection-list');
  const selectionCount = document.getElementById('selection-count');
  const clearBtn = document.getElementById('clear-selection');
  const compareBtn = document.getElementById('compare-btn');
  const selectionPanel = document.getElementById('selection-panel');
  const comparisonView = document.getElementById('comparison-view');
  const instructions = document.getElementById('instructions');

  function init() {
    renderSelectionList();
    bindEvents();
  }

  function renderSelectionList() {
    selectionList.innerHTML = MockData.promotions.map(promo => `
      <div class="selection-item ${selectedPromotions.includes(promo.id) ? 'selected' : ''}"
           data-id="${promo.id}">
        <div class="selection-item__checkbox"></div>
        <div class="selection-item__thumb">
          <img src="${promo.thumbImage}" alt="${promo.name}">
        </div>
        <div class="selection-item__info">
          <div class="selection-item__name">${promo.name}</div>
          <div class="selection-item__meta">${promo.categoryName} • ${promo.dealType}</div>
        </div>
        <div class="selection-item__score">
          <div class="selection-item__score-value">${promo.percentile}</div>
          <div class="selection-item__score-label">percentile</div>
        </div>
      </div>
    `).join('');

    updateSelectionState();
  }

  function updateSelectionState() {
    selectionCount.textContent = `${selectedPromotions.length} of ${maxSelections} selected`;
    clearBtn.disabled = selectedPromotions.length === 0;
    compareBtn.disabled = selectedPromotions.length !== maxSelections;

    document.querySelectorAll('.selection-item').forEach(item => {
      const id = item.dataset.id;
      item.classList.toggle('selected', selectedPromotions.includes(id));
    });
  }

  function bindEvents() {
    // Selection items
    selectionList.addEventListener('click', e => {
      const item = e.target.closest('.selection-item');
      if (!item) return;

      const id = item.dataset.id;
      const index = selectedPromotions.indexOf(id);

      if (index > -1) {
        selectedPromotions.splice(index, 1);
      } else if (selectedPromotions.length < maxSelections) {
        selectedPromotions.push(id);
      }

      updateSelectionState();
    });

    // Clear selection
    clearBtn.addEventListener('click', () => {
      selectedPromotions = [];
      updateSelectionState();
    });

    // Compare button
    compareBtn.addEventListener('click', showComparison);

    // Back to selection
    document.getElementById('back-to-selection').addEventListener('click', () => {
      comparisonView.classList.remove('active');
      selectionPanel.classList.remove('hidden');
      instructions.classList.remove('hidden');
    });

    // Swap panels
    document.getElementById('swap-panels').addEventListener('click', () => {
      selectedPromotions.reverse();
      renderComparison();
    });
  }

  function showComparison() {
    selectionPanel.classList.add('hidden');
    instructions.classList.add('hidden');
    comparisonView.classList.add('active');
    renderComparison();
  }

  function renderComparison() {
    const promoA = MockData.getPromotionById(selectedPromotions[0]);
    const promoB = MockData.getPromotionById(selectedPromotions[1]);

    // Panel A
    document.getElementById('hero-a').src = promoA.heroImage;
    document.getElementById('hero-a').alt = promoA.name;
    document.getElementById('title-a').textContent = promoA.name;
    document.getElementById('meta-a').textContent = `${promoA.categoryName} • ${promoA.dealType} • ${promoA.cardSize}`;

    document.getElementById('kpis-a').innerHTML = `
      <div class="panel-kpi">
        <div class="panel-kpi__value">${MockData.formatNumber(promoA.civ)}</div>
        <div class="panel-kpi__label">Circular Item Views</div>
      </div>
      <div class="panel-kpi">
        <div class="panel-kpi__value">${MockData.formatNumber(promoA.cc)}</div>
        <div class="panel-kpi__label">Circular Clicks</div>
      </div>
      <div class="panel-kpi">
        <div class="panel-kpi__value">${MockData.formatNumber(promoA.atl)}</div>
        <div class="panel-kpi__label">Add to List</div>
      </div>
      <div class="panel-kpi">
        <div class="panel-kpi__value">${promoA.compositeScore}</div>
        <div class="panel-kpi__label">Composite Score</div>
      </div>
    `;

    renderChart('chart-a');
    renderStores('stores-a');

    // Panel B
    document.getElementById('hero-b').src = promoB.heroImage;
    document.getElementById('hero-b').alt = promoB.name;
    document.getElementById('title-b').textContent = promoB.name;
    document.getElementById('meta-b').textContent = `${promoB.categoryName} • ${promoB.dealType} • ${promoB.cardSize}`;

    document.getElementById('kpis-b').innerHTML = `
      <div class="panel-kpi">
        <div class="panel-kpi__value">${MockData.formatNumber(promoB.civ)}</div>
        <div class="panel-kpi__label">Circular Item Views</div>
      </div>
      <div class="panel-kpi">
        <div class="panel-kpi__value">${MockData.formatNumber(promoB.cc)}</div>
        <div class="panel-kpi__label">Circular Clicks</div>
      </div>
      <div class="panel-kpi">
        <div class="panel-kpi__value">${MockData.formatNumber(promoB.atl)}</div>
        <div class="panel-kpi__label">Add to List</div>
      </div>
      <div class="panel-kpi">
        <div class="panel-kpi__value">${promoB.compositeScore}</div>
        <div class="panel-kpi__label">Composite Score</div>
      </div>
    `;

    renderChart('chart-b');
    renderStores('stores-b');

    // Deltas
    renderDeltas(promoA, promoB);
  }

  function renderChart(containerId) {
    const container = document.getElementById(containerId);
    const maxValue = Math.max(...MockData.weeklyTrend.map(d => d.value));

    container.innerHTML = MockData.weeklyTrend.map(day => {
      const height = (day.value / maxValue) * 100;
      return `<div class="chart-bar" style="height: ${height}%" title="${day.day}: ${day.value}"></div>`;
    }).join('');
  }

  function renderStores(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = MockData.topStores.slice(0, 3).map(store => `
      <div class="store-item">
        <span class="store-item__name">${store.name}</span>
        <span class="store-item__score">${store.score}</span>
      </div>
    `).join('');
  }

  function renderDeltas(promoA, promoB) {
    const deltas = [
      { label: 'CIV', value: promoA.civ - promoB.civ },
      { label: 'CC', value: promoA.cc - promoB.cc },
      { label: 'ATL', value: promoA.atl - promoB.atl },
      { label: 'Score', value: promoA.compositeScore - promoB.compositeScore },
      { label: '%ile', value: promoA.percentile - promoB.percentile }
    ];

    document.getElementById('delta-items').innerHTML = deltas.map(delta => {
      let valueClass = 'neutral';
      let prefix = '';

      if (delta.value > 0) {
        valueClass = 'positive';
        prefix = '+';
      } else if (delta.value < 0) {
        valueClass = 'negative';
      }

      const displayValue = Math.abs(delta.value) >= 1000
        ? MockData.formatNumber(delta.value)
        : delta.value;

      return `
        <div class="delta-item">
          <div class="delta-item__value delta-item__value--${valueClass}">${prefix}${displayValue}</div>
          <div class="delta-item__label">${delta.label}</div>
        </div>
      `;
    }).join('');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
