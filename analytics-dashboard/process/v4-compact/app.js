/**
 * V4 Compact Density - Application Logic
 * High information density for power users
 */

(function() {
  'use strict';

  let allData = [];
  let filteredData = [];
  let sortField = 'percentile';
  let sortDirection = 'desc';
  let activeFilters = [];
  let activeRowId = null;

  const tableBody = document.getElementById('table-body');
  const rowIndicator = document.getElementById('row-indicator');
  const quickView = document.getElementById('quick-view');
  const filterChipsRow = document.getElementById('filter-chips-row');

  function init() {
    allData = MockData.promotions.map(p => ({
      ...p,
      ctr: ((p.cc / p.civ) * 100).toFixed(1)
    }));
    filteredData = [...allData];

    sortData();
    renderTable();
    bindEvents();
    updateRowIndicator();
  }

  function sortData() {
    filteredData.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  function renderTable() {
    tableBody.innerHTML = filteredData.map(promo => {
      const percentileClass = getPercentileClass(promo.percentile);

      return `
        <tr class="compact-table__tr ${promo.id === activeRowId ? 'active' : ''}" data-id="${promo.id}">
          <td class="compact-table__td">
            <div class="promo-cell">
              <div class="promo-cell__thumb">
                <img src="${promo.thumbImage}" alt="${promo.name}">
              </div>
              <span class="promo-cell__name">${promo.name}</span>
            </div>
          </td>
          <td class="compact-table__td">
            <span class="category-badge">${getCategoryAbbrev(promo.categoryName)}</span>
          </td>
          <td class="compact-table__td compact-table__td--number">${MockData.formatNumber(promo.civ)}</td>
          <td class="compact-table__td compact-table__td--number">${MockData.formatNumber(promo.cc)}</td>
          <td class="compact-table__td compact-table__td--number">${MockData.formatNumber(promo.atl)}</td>
          <td class="compact-table__td compact-table__td--number">${promo.ctr}%</td>
          <td class="compact-table__td compact-table__td--number">${promo.compositeScore}</td>
          <td class="compact-table__td">
            <span class="percentile-compact">
              <span class="percentile-dot percentile-dot--${percentileClass}"></span>
              ${promo.percentile}
            </span>
          </td>
          <td class="compact-table__td">${promo.dealType}</td>
          <td class="compact-table__td">${promo.cardSize}</td>
        </tr>
      `;
    }).join('');
  }

  function getCategoryAbbrev(name) {
    const abbrevs = {
      'Produce': 'PRD',
      'Dairy': 'DRY',
      'Meat & Seafood': 'M&S',
      'Bakery': 'BKY',
      'Frozen Foods': 'FRZ',
      'Beverages': 'BEV',
      'Snacks & Candy': 'SNK',
      'Household': 'HH'
    };
    return abbrevs[name] || name.substring(0, 3).toUpperCase();
  }

  function getPercentileClass(percentile) {
    if (percentile >= 75) return 'high';
    if (percentile >= 50) return 'medium';
    return 'low';
  }

  function updateRowIndicator() {
    rowIndicator.textContent = `${filteredData.length} promotions`;
  }

  function bindEvents() {
    // Sort headers
    document.querySelectorAll('.compact-table__th--sortable').forEach(th => {
      th.addEventListener('click', () => {
        const field = th.dataset.sort;

        // Update header classes
        document.querySelectorAll('.compact-table__th--sortable').forEach(h => {
          h.classList.remove('compact-table__th--asc', 'compact-table__th--desc');
        });

        if (sortField === field) {
          sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
          sortField = field;
          sortDirection = 'desc';
        }

        th.classList.add(`compact-table__th--${sortDirection}`);

        sortData();
        renderTable();
      });
    });

    // Row click for quick view
    tableBody.addEventListener('click', e => {
      const row = e.target.closest('.compact-table__tr');
      if (!row) return;

      const id = row.dataset.id;
      activeRowId = id;

      renderTable();
      showQuickView(id);
    });

    // Close quick view
    document.getElementById('close-quick-view').addEventListener('click', () => {
      quickView.classList.remove('open');
      activeRowId = null;
      renderTable();
    });

    // Search
    document.getElementById('search-input').addEventListener('input', e => {
      const query = e.target.value.toLowerCase();
      filteredData = allData.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.categoryName.toLowerCase().includes(query) ||
        p.dealType.toLowerCase().includes(query)
      );
      sortData();
      renderTable();
      updateRowIndicator();
    });

    // Density toggle
    document.querySelectorAll('.density-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.density-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const density = btn.dataset.density;
        document.querySelector('.app').classList.toggle('comfortable', density === 'comfortable');
      });
    });

    // Clear filters
    document.getElementById('clear-filters').addEventListener('click', () => {
      activeFilters = [];
      filteredData = [...allData];
      sortData();
      renderTable();
      updateRowIndicator();
      renderFilterChips();
    });

    // Keyboard navigation
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && quickView.classList.contains('open')) {
        quickView.classList.remove('open');
        activeRowId = null;
        renderTable();
      }
    });
  }

  function showQuickView(id) {
    const promo = MockData.getPromotionById(id);
    if (!promo) return;

    document.getElementById('qv-title').textContent = promo.name;
    document.getElementById('qv-image').src = promo.heroImage;
    document.getElementById('qv-image').alt = promo.name;

    document.getElementById('qv-stats').innerHTML = `
      <div class="qv-stat">
        <div class="qv-stat__value">${MockData.formatNumber(promo.civ)}</div>
        <div class="qv-stat__label">Item Views</div>
      </div>
      <div class="qv-stat">
        <div class="qv-stat__value">${MockData.formatNumber(promo.cc)}</div>
        <div class="qv-stat__label">Clicks</div>
      </div>
      <div class="qv-stat">
        <div class="qv-stat__value">${MockData.formatNumber(promo.atl)}</div>
        <div class="qv-stat__label">Add to List</div>
      </div>
      <div class="qv-stat">
        <div class="qv-stat__value">${promo.compositeScore}</div>
        <div class="qv-stat__label">Score</div>
      </div>
      <div class="qv-stat">
        <div class="qv-stat__value">${promo.percentile}</div>
        <div class="qv-stat__label">Percentile</div>
      </div>
      <div class="qv-stat">
        <div class="qv-stat__value">${((promo.cc / promo.civ) * 100).toFixed(1)}%</div>
        <div class="qv-stat__label">CTR</div>
      </div>
    `;

    quickView.classList.add('open');
  }

  function renderFilterChips() {
    if (activeFilters.length === 0) {
      filterChipsRow.style.display = 'none';
      return;
    }

    filterChipsRow.style.display = 'flex';
    document.getElementById('filter-chips').innerHTML = activeFilters.map(filter => `
      <div class="filter-chip" data-filter="${filter.id}">
        <span>${filter.label}</span>
        <button class="filter-chip__remove">×</button>
      </div>
    `).join('');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
