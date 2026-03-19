/**
 * DataGrid Component
 * Advanced data grid with filtering, sorting, pagination, and export functionality
 */
class DataGrid {
    constructor(containerId, data, options = {}) {
        this.container = document.getElementById(containerId);
        this.data = data;
        this.filteredData = [...data];
        this.currentPage = 1;
        this.itemsPerPage = options.itemsPerPage || 25;
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.filters = {};
        this.searchTerm = '';

        this.columns = options.columns || this.inferColumns();
        this.options = {
            searchable: true,
            sortable: true,
            paginated: true,
            exportable: true,
            selectable: false,
            ...options
        };

        this.init();
    }

    inferColumns() {
        if (this.data.length === 0) return [];

        const firstItem = this.data[0];
        return Object.keys(firstItem).map(key => ({
            key: key,
            title: this.formatColumnTitle(key),
            sortable: true,
            filterable: this.isFilterableColumn(key, firstItem[key]),
            formatter: this.getDefaultFormatter(key, firstItem[key])
        }));
    }

    formatColumnTitle(key) {
        return key.replace(/_/g, ' ')
                 .replace(/([a-z])([A-Z])/g, '$1 $2')
                 .replace(/\b\w/g, l => l.toUpperCase());
    }

    isFilterableColumn(key, value) {
        return typeof value === 'string' || typeof value === 'number';
    }

    getDefaultFormatter(key, value) {
        if (key.includes('price') || key.includes('cost')) {
            return (val) => typeof val === 'number' ? `$${val.toFixed(2)}` : val;
        }
        if (key.includes('score') || key.includes('percent')) {
            return (val) => typeof val === 'number' ? `${val}%` : val;
        }
        if (key.includes('date') || key.includes('time')) {
            return (val) => new Date(val).toLocaleDateString();
        }
        return (val) => val;
    }

    init() {
        this.render();
        this.attachEventListeners();
    }

    render() {
        this.container.innerHTML = `
            <div class="data-grid">
                ${this.renderControls()}
                ${this.renderTable()}
                ${this.renderPagination()}
                ${this.renderInfo()}
            </div>
        `;
    }

    renderControls() {
        if (!this.options.searchable && !this.options.exportable) return '';

        return `
            <div class="grid-controls">
                ${this.options.searchable ? this.renderSearch() : ''}
                ${this.renderFilters()}
                ${this.options.exportable ? this.renderExportControls() : ''}
            </div>
        `;
    }

    renderSearch() {
        return `
            <div class="search-container">
                <input
                    type="text"
                    id="grid-search"
                    placeholder="Search promotions..."
                    value="${this.searchTerm}"
                    class="search-input"
                >
                <button type="button" class="search-clear" title="Clear search">×</button>
            </div>
        `;
    }

    renderFilters() {
        const filterableColumns = this.columns.filter(col => col.filterable);
        if (filterableColumns.length === 0) return '';

        return `
            <div class="filter-container">
                ${filterableColumns.map(col => this.renderColumnFilter(col)).join('')}
                <button type="button" class="filter-clear">Clear Filters</button>
            </div>
        `;
    }

    renderColumnFilter(column) {
        const uniqueValues = [...new Set(this.data.map(item => item[column.key]))]
            .filter(val => val !== null && val !== undefined)
            .sort();

        if (uniqueValues.length > 20) {
            return `
                <div class="filter-group">
                    <label>${column.title}</label>
                    <input
                        type="text"
                        data-filter="${column.key}"
                        placeholder="Filter ${column.title.toLowerCase()}..."
                        class="filter-input"
                    >
                </div>
            `;
        }

        return `
            <div class="filter-group">
                <label>${column.title}</label>
                <select data-filter="${column.key}" class="filter-select">
                    <option value="">All ${column.title}</option>
                    ${uniqueValues.map(val =>
                        `<option value="${val}" ${this.filters[column.key] === val ? 'selected' : ''}>${val}</option>`
                    ).join('')}
                </select>
            </div>
        `;
    }

    renderExportControls() {
        return `
            <div class="export-controls">
                <button type="button" class="export-csv">Export CSV</button>
                <button type="button" class="export-json">Export JSON</button>
                <button type="button" class="print-grid">Print</button>
            </div>
        `;
    }

    renderTable() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageData = this.filteredData.slice(startIndex, endIndex);

        return `
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            ${this.options.selectable ? '<th><input type="checkbox" class="select-all"></th>' : ''}
                            ${this.columns.map(col => this.renderColumnHeader(col)).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${pageData.map((item, index) => this.renderRow(item, startIndex + index)).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderColumnHeader(column) {
        const sortClass = this.sortColumn === column.key ?
            `sorted ${this.sortDirection}` : '';
        const sortIcon = this.sortColumn === column.key ?
            (this.sortDirection === 'asc' ? '↑' : '↓') : '';

        return `
            <th class="${sortClass}" ${column.sortable ? `data-sort="${column.key}"` : ''}>
                ${column.title}
                ${column.sortable ? `<span class="sort-icon">${sortIcon}</span>` : ''}
            </th>
        `;
    }

    renderRow(item, index) {
        return `
            <tr data-index="${index}" ${this.options.selectable ? 'class="selectable"' : ''}>
                ${this.options.selectable ? `<td><input type="checkbox" data-id="${item.id || index}"></td>` : ''}
                ${this.columns.map(col => this.renderCell(item, col)).join('')}
            </tr>
        `;
    }

    renderCell(item, column) {
        const value = item[column.key];
        const formattedValue = column.formatter ? column.formatter(value) : value;
        const cellClass = this.getCellClass(column.key, value);

        return `<td class="${cellClass}">${formattedValue}</td>`;
    }

    getCellClass(key, value) {
        let classes = [];

        if (key.includes('score')) {
            if (value >= 80) classes.push('score-high');
            else if (value >= 60) classes.push('score-medium');
            else classes.push('score-low');
        }

        if (key.includes('trend')) {
            if (value > 0) classes.push('trend-positive');
            else if (value < 0) classes.push('trend-negative');
        }

        if (typeof value === 'number') classes.push('number');

        return classes.join(' ');
    }

    renderPagination() {
        if (!this.options.paginated) return '';

        const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
        if (totalPages <= 1) return '';

        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);

        let pagination = '<div class="pagination">';

        // Previous button
        pagination += `
            <button type="button" class="page-btn" data-page="${this.currentPage - 1}"
                    ${this.currentPage <= 1 ? 'disabled' : ''}>←</button>
        `;

        // First page
        if (startPage > 1) {
            pagination += `<button type="button" class="page-btn" data-page="1">1</button>`;
            if (startPage > 2) pagination += '<span class="page-ellipsis">...</span>';
        }

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            pagination += `
                <button type="button" class="page-btn ${i === this.currentPage ? 'active' : ''}"
                        data-page="${i}">${i}</button>
            `;
        }

        // Last page
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) pagination += '<span class="page-ellipsis">...</span>';
            pagination += `<button type="button" class="page-btn" data-page="${totalPages}">${totalPages}</button>`;
        }

        // Next button
        pagination += `
            <button type="button" class="page-btn" data-page="${this.currentPage + 1}"
                    ${this.currentPage >= totalPages ? 'disabled' : ''}>→</button>
        `;

        pagination += '</div>';
        return pagination;
    }

    renderInfo() {
        const start = Math.min((this.currentPage - 1) * this.itemsPerPage + 1, this.filteredData.length);
        const end = Math.min(this.currentPage * this.itemsPerPage, this.filteredData.length);

        return `
            <div class="grid-info">
                Showing ${start}-${end} of ${this.filteredData.length} items
                ${this.data.length !== this.filteredData.length ?
                    `(filtered from ${this.data.length} total)` : ''}
            </div>
        `;
    }

    attachEventListeners() {
        const container = this.container;

        // Search
        const searchInput = container.querySelector('#grid-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this.applyFilters();
            });
        }

        // Clear search
        const clearBtn = container.querySelector('.search-clear');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.searchTerm = '';
                this.applyFilters();
            });
        }

        // Filters
        container.querySelectorAll('[data-filter]').forEach(filter => {
            filter.addEventListener('change', (e) => {
                this.filters[e.target.dataset.filter] = e.target.value;
                this.applyFilters();
            });

            filter.addEventListener('input', (e) => {
                this.filters[e.target.dataset.filter] = e.target.value;
                this.debounce(() => this.applyFilters(), 300)();
            });
        });

        // Clear filters
        const clearFilters = container.querySelector('.filter-clear');
        if (clearFilters) {
            clearFilters.addEventListener('click', () => {
                this.filters = {};
                this.searchTerm = '';
                container.querySelectorAll('[data-filter]').forEach(filter => {
                    filter.value = '';
                });
                const searchInput = container.querySelector('#grid-search');
                if (searchInput) searchInput.value = '';
                this.applyFilters();
            });
        }

        // Sorting
        container.querySelectorAll('[data-sort]').forEach(header => {
            header.addEventListener('click', () => {
                const column = header.dataset.sort;
                if (this.sortColumn === column) {
                    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    this.sortColumn = column;
                    this.sortDirection = 'asc';
                }
                this.applySorting();
            });
        });

        // Pagination
        container.querySelectorAll('.page-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = parseInt(e.target.dataset.page);
                if (page && page !== this.currentPage) {
                    this.currentPage = page;
                    this.render();
                    this.attachEventListeners();
                }
            });
        });

        // Export
        const exportCsv = container.querySelector('.export-csv');
        if (exportCsv) {
            exportCsv.addEventListener('click', () => this.exportToCsv());
        }

        const exportJson = container.querySelector('.export-json');
        if (exportJson) {
            exportJson.addEventListener('click', () => this.exportToJson());
        }

        const printBtn = container.querySelector('.print-grid');
        if (printBtn) {
            printBtn.addEventListener('click', () => this.printGrid());
        }

        // Row selection
        if (this.options.selectable) {
            const selectAll = container.querySelector('.select-all');
            if (selectAll) {
                selectAll.addEventListener('change', (e) => {
                    const checkboxes = container.querySelectorAll('tbody input[type="checkbox"]');
                    checkboxes.forEach(cb => cb.checked = e.target.checked);
                });
            }
        }
    }

    applyFilters() {
        this.filteredData = this.data.filter(item => {
            // Search filter
            if (this.searchTerm) {
                const searchLower = this.searchTerm.toLowerCase();
                const searchMatch = Object.values(item).some(value =>
                    value && value.toString().toLowerCase().includes(searchLower)
                );
                if (!searchMatch) return false;
            }

            // Column filters
            for (const [key, value] of Object.entries(this.filters)) {
                if (value && item[key] && !item[key].toString().toLowerCase().includes(value.toLowerCase())) {
                    return false;
                }
            }

            return true;
        });

        this.currentPage = 1;
        this.applySorting();
    }

    applySorting() {
        if (this.sortColumn) {
            this.filteredData.sort((a, b) => {
                const aVal = a[this.sortColumn];
                const bVal = b[this.sortColumn];

                let comparison = 0;
                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    comparison = aVal - bVal;
                } else {
                    comparison = String(aVal).localeCompare(String(bVal));
                }

                return this.sortDirection === 'asc' ? comparison : -comparison;
            });
        }

        this.render();
        this.attachEventListeners();
    }

    exportToCsv() {
        const headers = this.columns.map(col => col.title);
        const rows = this.filteredData.map(item =>
            this.columns.map(col => {
                const value = item[col.key];
                return col.formatter ? col.formatter(value) : value;
            })
        );

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n');

        this.downloadFile(csvContent, 'analytics-data.csv', 'text/csv');
    }

    exportToJson() {
        const jsonContent = JSON.stringify(this.filteredData, null, 2);
        this.downloadFile(jsonContent, 'analytics-data.json', 'application/json');
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    printGrid() {
        const printWindow = window.open('', '_blank');
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Analytics Data</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { padding: 8px; text-align: left; border: 1px solid #ddd; }
                    th { background-color: #f5f5f5; font-weight: bold; }
                    .number { text-align: right; }
                    .score-high { color: #27ae60; }
                    .score-medium { color: #f39c12; }
                    .score-low { color: #e74c3c; }
                    @media print {
                        body { margin: 0; }
                        table { font-size: 12px; }
                    }
                </style>
            </head>
            <body>
                <h1>Analytics Dashboard Data</h1>
                <p>Generated on ${new Date().toLocaleString()}</p>
                <p>Total Records: ${this.filteredData.length}</p>
                <table>
                    <thead>
                        <tr>
                            ${this.columns.map(col => `<th>${col.title}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${this.filteredData.map(item => `
                            <tr>
                                ${this.columns.map(col => {
                                    const value = item[col.key];
                                    const formattedValue = col.formatter ? col.formatter(value) : value;
                                    const cellClass = this.getCellClass(col.key, value);
                                    return `<td class="${cellClass}">${formattedValue}</td>`;
                                }).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 250);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Public API methods
    refresh() {
        this.render();
        this.attachEventListeners();
    }

    updateData(newData) {
        this.data = newData;
        this.applyFilters();
    }

    getSelectedRows() {
        if (!this.options.selectable) return [];

        const checkboxes = this.container.querySelectorAll('tbody input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(cb => {
            const id = cb.dataset.id;
            return this.filteredData.find(item => item.id === id || item.card_id === id);
        }).filter(Boolean);
    }

    clearSelection() {
        const checkboxes = this.container.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = false);
    }

    addColumn(column) {
        this.columns.push(column);
        this.refresh();
    }

    removeColumn(key) {
        this.columns = this.columns.filter(col => col.key !== key);
        this.refresh();
    }

    setFilter(key, value) {
        this.filters[key] = value;
        this.applyFilters();
    }

    clearFilters() {
        this.filters = {};
        this.searchTerm = '';
        this.applyFilters();
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataGrid;
}