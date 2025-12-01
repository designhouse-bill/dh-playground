/**
 * V2 Data Grid View - Application Logic
 * Full dataset visibility, sortable, selectable, exportable
 */

(function() {
  'use strict';

  let allData = [];
  let filteredData = [];
  let selectedRows = new Set();
  let currentPage = 1;
  let rowsPerPage = 25;
  let sortField = 'percentile';
  let sortDirection = 'desc';

  const gridBody = document.getElementById('grid-body');
  const rowCount = document.getElementById('row-count');
  const selectionCount = document.getElementById('selection-count');
  const pageInfo = document.getElementById('page-info');
  const selectAll = document.getElementById('select-all');

  function init() {
    allData = MockData.promotions.map(p => ({
      ...p,
      ctr: ((p.cc / p.civ) * 100).toFixed(1)
    }));
    filteredData = [...allData];

    sortData();
    renderGrid();
    bindEvents();
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

  function renderGrid() {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = filteredData.slice(start, end);
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    rowCount.textContent = `${filteredData.length} rows`;
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === totalPages;

    gridBody.innerHTML = pageData.map(promo => {
      const percentileClass = getPercentileClass(promo.percentile);
      const isSelected = selectedRows.has(promo.id);

      return `
        <tr class="data-grid__tr ${isSelected ? 'data-grid__tr--selected' : ''}" data-id="${promo.id}">
          <td class="data-grid__td data-grid__td--checkbox">
            <input type="checkbox" ${isSelected ? 'checked' : ''} data-id="${promo.id}">
          </td>
          <td class="data-grid__td">
            <div class="promo-cell">
              <div class="promo-cell__thumb">
                <img src="${promo.thumbImage}" alt="${promo.name}">
              </div>
              <span class="promo-cell__name">${promo.name}</span>
            </div>
          </td>
          <td class="data-grid__td">
            <span class="category-badge">${promo.categoryName}</span>
          </td>
          <td class="data-grid__td data-grid__td--number">${MockData.formatNumber(promo.civ)}</td>
          <td class="data-grid__td data-grid__td--number">${MockData.formatNumber(promo.cc)}</td>
          <td class="data-grid__td data-grid__td--number">${MockData.formatNumber(promo.atl)}</td>
          <td class="data-grid__td data-grid__td--number">${promo.ctr}%</td>
          <td class="data-grid__td data-grid__td--number">${promo.compositeScore}</td>
          <td class="data-grid__td">
            <div class="percentile-cell">
              <div class="percentile-bar">
                <div class="percentile-bar__fill percentile-bar__fill--${percentileClass}" style="width: ${promo.percentile}%"></div>
              </div>
              <span class="percentile-value percentile-value--${percentileClass}">${promo.percentile}</span>
            </div>
          </td>
          <td class="data-grid__td">${promo.dealType}</td>
          <td class="data-grid__td">${promo.cardSize}</td>
        </tr>
      `;
    }).join('');

    updateSelectionCount();
  }

  function updateSelectionCount() {
    selectionCount.textContent = `${selectedRows.size} selected`;
    selectAll.checked = selectedRows.size === filteredData.length && filteredData.length > 0;
    selectAll.indeterminate = selectedRows.size > 0 && selectedRows.size < filteredData.length;
  }

  function bindEvents() {
    // Sort headers
    document.querySelectorAll('.data-grid__th--sortable').forEach(th => {
      th.addEventListener('click', () => {
        const field = th.dataset.sort;
        if (sortField === field) {
          sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
          sortField = field;
          sortDirection = 'desc';
        }
        sortData();
        currentPage = 1;
        renderGrid();
      });
    });

    // Row checkboxes
    gridBody.addEventListener('change', e => {
      if (e.target.type === 'checkbox') {
        const id = e.target.dataset.id;
        if (e.target.checked) {
          selectedRows.add(id);
        } else {
          selectedRows.delete(id);
        }
        e.target.closest('.data-grid__tr').classList.toggle('data-grid__tr--selected', e.target.checked);
        updateSelectionCount();
      }
    });

    // Select all
    selectAll.addEventListener('change', () => {
      if (selectAll.checked) {
        filteredData.forEach(p => selectedRows.add(p.id));
      } else {
        selectedRows.clear();
      }
      renderGrid();
    });

    // Pagination
    document.getElementById('prev-page').addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderGrid();
      }
    });

    document.getElementById('next-page').addEventListener('click', () => {
      const totalPages = Math.ceil(filteredData.length / rowsPerPage);
      if (currentPage < totalPages) {
        currentPage++;
        renderGrid();
      }
    });

    // Rows per page
    document.getElementById('rows-per-page').addEventListener('change', e => {
      rowsPerPage = parseInt(e.target.value);
      currentPage = 1;
      renderGrid();
    });

    // Search
    document.querySelector('.grid-search__input').addEventListener('input', e => {
      const query = e.target.value.toLowerCase();
      filteredData = allData.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.categoryName.toLowerCase().includes(query)
      );
      sortData();
      currentPage = 1;
      renderGrid();
    });
  }

  function getPercentileClass(percentile) {
    if (percentile >= 75) return 'high';
    if (percentile >= 50) return 'medium';
    return 'low';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
