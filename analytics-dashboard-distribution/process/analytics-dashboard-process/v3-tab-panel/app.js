/**
 * Version 3: Tab Panel View - Application Logic
 *
 * Tab-based navigation with focused content panels
 * Performance tab shows the data grid as primary view
 */

(function() {
  'use strict';

  // State
  let currentTab = 'performance';
  let currentLevel = 0;
  let currentCategory = null;
  let allPromotions = [];
  let currentPage = 1;
  let pageSize = 25;
  let sortField = 'percentile';
  let sortDirection = 'desc';

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

  function calculatePercentile(score, allScores) {
    const sorted = [...allScores].sort((a, b) => a - b);
    const index = sorted.findIndex(s => s >= score);
    return Math.round((index / sorted.length) * 100);
  }

  function getPercentileClass(percentile) {
    if (percentile >= 75) return 'high';
    if (percentile >= 50) return 'medium';
    return 'low';
  }

  // Tab Navigation
  function initTabNav() {
    document.querySelectorAll('.tab-nav__item').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabId = tab.dataset.tab;
        switchTab(tabId);
      });
    });
  }

  function switchTab(tabId) {
    currentTab = tabId;

    // Update tab nav
    document.querySelectorAll('.tab-nav__item').forEach(tab => {
      tab.classList.toggle('tab-nav__item--active', tab.dataset.tab === tabId);
    });

    // Update panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.toggle('tab-panel--active', panel.id === `panel-${tabId}`);
    });
  }

  // Get filtered promotions
  function getFilteredPromotions() {
    if (currentCategory) {
      return allPromotions.filter(p => p.marketing_category === currentCategory.id);
    }
    return allPromotions;
  }

  // Sort promotions
  function sortPromotions(promotions) {
    return [...promotions].sort((a, b) => {
      let aVal, bVal;

      switch (sortField) {
        case 'percentile':
          aVal = a.percentile || 0;
          bVal = b.percentile || 0;
          break;
        case 'score':
          aVal = a.composite_score || 0;
          bVal = b.composite_score || 0;
          break;
        case 'views':
          aVal = a.card_in_view || 0;
          bVal = b.card_in_view || 0;
          break;
        case 'ctr':
          aVal = a.card_in_view > 0 ? (a.card_clicked / a.card_in_view) : 0;
          bVal = b.card_in_view > 0 ? (b.card_clicked / b.card_in_view) : 0;
          break;
        default:
          aVal = a.percentile || 0;
          bVal = b.percentile || 0;
      }

      return sortDirection === 'desc' ? bVal - aVal : aVal - bVal;
    });
  }

  // Update summary strip
  function updateSummaryStrip() {
    const filtered = getFilteredPromotions();

    const totalViews = filtered.reduce((sum, p) => sum + (p.card_in_view || 0), 0);
    const totalClicks = filtered.reduce((sum, p) => sum + (p.card_clicked || 0), 0);
    const avgCTR = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : 0;
    const avgScore = filtered.length > 0
      ? Math.round(filtered.reduce((sum, p) => sum + (p.composite_score || 0), 0) / filtered.length)
      : 0;

    document.getElementById('summary-promos').textContent = formatNumber(filtered.length);
    document.getElementById('summary-views').textContent = formatNumber(totalViews);
    document.getElementById('summary-ctr').textContent = avgCTR + '%';
    document.getElementById('summary-score').textContent = formatNumber(avgScore);
  }

  // Render performance table
  function renderPerformanceTable() {
    const tbody = document.getElementById('performance-table-body');
    if (!tbody) return;

    const filtered = getFilteredPromotions();
    const sorted = sortPromotions(filtered);
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageData = sorted.slice(start, end);

    tbody.innerHTML = pageData.map((promo, index) => {
      const rank = start + index + 1;
      const isTop3 = rank <= 3;
      const percentile = promo.percentile || 0;
      const percentileClass = getPercentileClass(percentile);
      const ctr = promo.card_in_view > 0
        ? ((promo.card_clicked / promo.card_in_view) * 100).toFixed(1)
        : '0.0';

      return `
        <tr class="data-grid__tr" data-promo-id="${promo.id || index}">
          <td class="data-grid__td data-grid__td--rank">
            <span class="rank-badge ${isTop3 ? 'rank-badge--top' : ''}">${rank}</span>
          </td>
          <td class="data-grid__td">
            <div class="promo-cell">
              <span class="promo-cell__name">${promo.card_name || 'Unknown'}</span>
              <span class="promo-cell__meta">${promo.deal_type || 'Standard'} • ${promo.card_size || '1x1'}</span>
            </div>
          </td>
          <td class="data-grid__td">
            <span class="category-badge">${formatCategoryName(promo.marketing_category)}</span>
          </td>
          <td class="data-grid__td data-grid__td--number">${formatNumber(promo.card_in_view)}</td>
          <td class="data-grid__td data-grid__td--number">${formatNumber(promo.card_clicked)}</td>
          <td class="data-grid__td data-grid__td--number">${formatNumber(promo.added_to_list)}</td>
          <td class="data-grid__td data-grid__td--number">${ctr}%</td>
          <td class="data-grid__td data-grid__td--score">${formatNumber(promo.composite_score)}</td>
          <td class="data-grid__td">
            <div class="percentile-cell">
              <div class="percentile-bar">
                <div class="percentile-bar__fill percentile-bar__fill--${percentileClass}" style="width: ${percentile}%"></div>
              </div>
              <span class="percentile-value percentile-value--${percentileClass}">${percentile}</span>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Update counts
    updateCounts(filtered.length);
    renderPagination(sorted.length);
  }

  // Update counts
  function updateCounts(total) {
    const tableTitle = document.getElementById('table-title');
    const tableCount = document.getElementById('table-count');
    const totalCount = document.getElementById('total-count');

    if (tableTitle) {
      tableTitle.textContent = currentCategory ? currentCategory.name : 'All Promotions';
    }
    if (tableCount) {
      tableCount.textContent = `${total} items`;
    }
    if (totalCount) {
      totalCount.textContent = total;
    }
  }

  // Render pagination
  function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / pageSize);
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalItems);

    const infoEl = document.querySelector('.pagination__info');
    if (infoEl) {
      infoEl.innerHTML = `Showing ${start}-${end} of <span id="total-count">${totalItems}</span>`;
    }

    const controlsEl = document.querySelector('.pagination__controls');
    if (!controlsEl) return;

    let html = `<button class="pagination__btn" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">Prev</button>`;

    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    for (let i = startPage; i <= endPage; i++) {
      html += `<button class="pagination__btn ${i === currentPage ? 'pagination__btn--active' : ''}" data-page="${i}">${i}</button>`;
    }

    html += `<button class="pagination__btn" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">Next</button>`;

    controlsEl.innerHTML = html;

    controlsEl.querySelectorAll('.pagination__btn[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = parseInt(btn.dataset.page, 10);
        if (page >= 1 && page <= totalPages) {
          currentPage = page;
          renderPerformanceTable();
        }
      });
    });
  }

  // Drill to category
  function drillToCategory(categoryId, categoryName) {
    currentLevel = 1;
    currentCategory = { id: categoryId, name: categoryName };
    currentPage = 1;

    renderBreadcrumb();
    addFilterChip('category', categoryId, categoryName);
    updateSummaryStrip();
    renderPerformanceTable();
  }

  // Navigate to all
  function navigateToAll() {
    currentLevel = 0;
    currentCategory = null;
    currentPage = 1;

    renderBreadcrumb();
    clearAllFilters();
    updateSummaryStrip();
    renderPerformanceTable();
  }

  // Render breadcrumb
  function renderBreadcrumb() {
    const container = document.getElementById('context-breadcrumb');
    if (!container) return;

    let html = '<span class="breadcrumb__item">';

    if (currentLevel === 0) {
      html += '<span class="breadcrumb__current">Circular Performance</span>';
    } else {
      html += '<a href="#" class="breadcrumb__link" id="breadcrumb-root">Circular Performance</a>';
      html += '</span>';
      html += '<span class="breadcrumb__separator">›</span>';
      html += '<span class="breadcrumb__item">';
      html += `<span class="breadcrumb__current">${currentCategory.name}</span>`;
    }

    html += '</span>';
    container.innerHTML = html;

    const rootLink = document.getElementById('breadcrumb-root');
    if (rootLink) {
      rootLink.addEventListener('click', (e) => {
        e.preventDefault();
        navigateToAll();
      });
    }
  }

  // Add filter chip
  function addFilterChip(type, id, label) {
    const container = document.getElementById('filter-chips-container');
    const filterRow = document.getElementById('filter-row');
    if (!container || !filterRow) return;

    filterRow.classList.remove('filter-row--empty');

    container.innerHTML = `
      <div class="filter-chip filter-chip--category" data-filter-type="${type}" data-filter-id="${id}">
        <span class="filter-chip__label">Category:</span>
        <span class="filter-chip__value">${label}</span>
        <button class="filter-chip__remove" title="Remove filter">
          <svg class="filter-chip__remove-icon" viewBox="0 0 12 12" fill="currentColor">
            <path d="M3.05 3.05a.75.75 0 011.06 0L6 4.94l1.89-1.89a.75.75 0 111.06 1.06L7.06 6l1.89 1.89a.75.75 0 11-1.06 1.06L6 7.06l-1.89 1.89a.75.75 0 01-1.06-1.06L4.94 6 3.05 4.11a.75.75 0 010-1.06z"/>
          </svg>
        </button>
      </div>
    `;

    container.querySelector('.filter-chip__remove').addEventListener('click', (e) => {
      e.stopPropagation();
      navigateToAll();
    });
  }

  // Clear all filters
  function clearAllFilters() {
    const container = document.getElementById('filter-chips-container');
    const filterRow = document.getElementById('filter-row');
    if (container) container.innerHTML = '';
    if (filterRow) filterRow.classList.add('filter-row--empty');
  }

  // Calculate percentiles
  function calculateAllPercentiles() {
    const scores = allPromotions.map(p => p.composite_score || 0);
    allPromotions.forEach(promo => {
      promo.percentile = calculatePercentile(promo.composite_score || 0, scores);
    });
  }

  // Bind events
  function bindEvents() {
    // Sort select
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        sortField = e.target.value;
        currentPage = 1;
        renderPerformanceTable();
      });
    }

    // Category clicks
    document.addEventListener('click', (e) => {
      const categoryBadge = e.target.closest('.category-badge');
      if (categoryBadge && currentLevel === 0) {
        const row = categoryBadge.closest('.data-grid__tr');
        if (row) {
          const promoId = row.dataset.promoId;
          const promo = allPromotions.find((p, i) => (p.id || i) == promoId);
          if (promo) {
            drillToCategory(promo.marketing_category, formatCategoryName(promo.marketing_category));
          }
        }
      }
    });

    // Clear all button
    const clearBtn = document.getElementById('clear-all-filters');
    if (clearBtn) {
      clearBtn.addEventListener('click', navigateToAll);
    }
  }

  // Initialize
  function init() {
    initTabNav();

    MockDataLoader.onReady(function(data) {
      console.log('Tab Panel: Data loaded', data);

      allPromotions = data.promotions || [];
      calculateAllPercentiles();

      updateSummaryStrip();
      renderPerformanceTable();
      renderBreadcrumb();
      bindEvents();
    });

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
