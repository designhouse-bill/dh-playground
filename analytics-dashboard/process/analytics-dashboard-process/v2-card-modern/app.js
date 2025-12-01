/**
 * Version 2: Card Modern - Application Logic
 *
 * PRIMARY VIEW: Circular Performance Data Grid
 *
 * Progressive Disclosure:
 *   Level 0: All Circulars → Shows all promotions
 *   Level 1: Category → Shows Promotions in that category
 *   Level 2: Promotion → Shows promotion detail (future)
 *
 * Click a category chip to filter, use breadcrumb or "Clear All" to go back
 */

(function() {
  'use strict';

  // State
  let currentLevel = 0; // 0 = All Circulars, 1 = Category, 2 = Promotion
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

  // Get filtered promotions based on current state
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

  // Render main performance table
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
    updateCounts(filtered.length, sorted.length);
    renderPagination(sorted.length);
  }

  // Update page counts
  function updateCounts(filtered, total) {
    const pageCount = document.getElementById('page-count');
    const totalCount = document.getElementById('total-count');
    const tableTitle = document.getElementById('table-title');

    if (pageCount) {
      pageCount.textContent = `${filtered} promotions`;
    }
    if (totalCount) {
      totalCount.textContent = total;
    }
    if (tableTitle) {
      tableTitle.textContent = currentCategory ? currentCategory.name : 'All Promotions';
    }
  }

  // Render pagination controls
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

    let html = `<button class="pagination__btn" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">Previous</button>`;

    // Page numbers
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
      html += `<button class="pagination__btn" data-page="1">1</button>`;
      if (startPage > 2) {
        html += `<button class="pagination__btn" disabled>...</button>`;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      html += `<button class="pagination__btn ${i === currentPage ? 'pagination__btn--active' : ''}" data-page="${i}">${i}</button>`;
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        html += `<button class="pagination__btn" disabled>...</button>`;
      }
      html += `<button class="pagination__btn" data-page="${totalPages}">${totalPages}</button>`;
    }

    html += `<button class="pagination__btn" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">Next</button>`;

    controlsEl.innerHTML = html;

    // Bind click handlers
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

  // Drill down to category
  function drillToCategory(categoryId, categoryName) {
    currentLevel = 1;
    currentCategory = { id: categoryId, name: categoryName };
    currentPage = 1;

    // Update breadcrumb
    renderBreadcrumb();

    // Add filter chip
    addFilterChip('category', categoryId, categoryName);

    // Re-render table
    renderPerformanceTable();
  }

  // Go back to all circulars
  function navigateToAllCirculars() {
    currentLevel = 0;
    currentCategory = null;
    currentPage = 1;

    // Update breadcrumb
    renderBreadcrumb();

    // Clear filter chips
    clearAllFilters();

    // Re-render table
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

    // Bind click handler
    const rootLink = document.getElementById('breadcrumb-root');
    if (rootLink) {
      rootLink.addEventListener('click', (e) => {
        e.preventDefault();
        navigateToAllCirculars();
      });
    }
  }

  // Add filter chip
  function addFilterChip(type, id, label) {
    const container = document.getElementById('filter-chips-container');
    const filterRow = document.getElementById('filter-row');
    if (!container || !filterRow) return;

    filterRow.classList.remove('filter-row--empty');

    const chipClass = type === 'category' ? 'filter-chip--category' : '';
    const chipHtml = `
      <div class="filter-chip ${chipClass}" data-filter-type="${type}" data-filter-id="${id}">
        <span class="filter-chip__label">${type === 'category' ? 'Category' : 'Filter'}:</span>
        <span class="filter-chip__value">${label}</span>
        <button class="filter-chip__remove" title="Remove filter">
          <svg class="filter-chip__remove-icon" viewBox="0 0 12 12" fill="currentColor">
            <path d="M3.05 3.05a.75.75 0 011.06 0L6 4.94l1.89-1.89a.75.75 0 111.06 1.06L7.06 6l1.89 1.89a.75.75 0 11-1.06 1.06L6 7.06l-1.89 1.89a.75.75 0 01-1.06-1.06L4.94 6 3.05 4.11a.75.75 0 010-1.06z"/>
          </svg>
        </button>
      </div>
    `;

    container.innerHTML = chipHtml;

    // Bind remove handler
    container.querySelector('.filter-chip__remove').addEventListener('click', (e) => {
      e.stopPropagation();
      navigateToAllCirculars();
    });
  }

  // Clear all filters
  function clearAllFilters() {
    const container = document.getElementById('filter-chips-container');
    const filterRow = document.getElementById('filter-row');
    if (container) container.innerHTML = '';
    if (filterRow) filterRow.classList.add('filter-row--empty');
  }

  // Calculate percentiles for all promotions
  function calculateAllPercentiles() {
    const scores = allPromotions.map(p => p.composite_score || 0);
    allPromotions.forEach(promo => {
      promo.percentile = calculatePercentile(promo.composite_score || 0, scores);
    });
  }

  // Bind sort select
  function bindSortSelect() {
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        sortField = e.target.value;
        currentPage = 1;
        renderPerformanceTable();
      });
    }
  }

  // Bind category clicks in table
  function bindCategoryClicks() {
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
  }

  // Initialize
  function init() {
    MockDataLoader.onReady(function(data) {
      console.log('Card Modern: Data loaded', data);

      // Store data
      allPromotions = data.promotions || [];

      // Calculate percentiles
      calculateAllPercentiles();

      // Initial render
      renderPerformanceTable();
      renderBreadcrumb();

      // Bind events
      bindSortSelect();
      bindCategoryClicks();

      // Bind clear all button
      const clearBtn = document.getElementById('clear-all-filters');
      if (clearBtn) {
        clearBtn.addEventListener('click', navigateToAllCirculars);
      }
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
