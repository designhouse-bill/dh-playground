/**
 * Modern Data Grid Application
 * Vanilla JavaScript with ES6+ features and best practices
 */

class DataGridApp {
  constructor() {
    this.state = {
      // Tier 1 filters
      scope: 'circular',
      lens: 'engagement',
      week: '2025-W36',
      entityLevel: 'subbrand',
      entities: new Set(),

      // Tier 2 filters
      categories: new Set(),
      dealTypes: new Set(),
      sortBy: 'percentile',
      metric: 'percentile',
      chartLimit: 10,

      // Grid state
      columnFilters: {},
      sortColumn: null,
      sortDirection: 'desc',

      // UI state
      tier1Collapsed: false,
      tier2Collapsed: false
    };

    this.data = this.generateMockData();
    this.charts = null;

    this.init();
  }

  // Data generation with improved randomization
  generateMockData() {
    const categories = ['Produce', 'Meat', 'Deli', 'Bakery', 'Dairy', 'Frozen', 'Pantry', 'Beverages'];
    const dealTypes = ['BOGO', '$ Off', '% Off', 'Buy 2 Get 1', 'Multi-Buy'];
    const subbrands = ['YOUR Market Miami', 'YOUR Market Orlando', 'YOUR Market Tampa'];
    const versions = ['V1-East', 'V2-North', 'V3-South', 'V4-West', 'V5-Central'];
    const stores = ['Store 101', 'Store 203', 'Store 310', 'Store 412', 'Store 509'];

    // Seeded random for consistent results
    let seed = 12345;
    const random = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    const items = [];
    for (let i = 1; i <= 100; i++) {
      const category = categories[Math.floor(random() * categories.length)];
      const dealType = dealTypes[Math.floor(random() * dealTypes.length)];
      const position = Math.floor(random() * 100) + 1;
      const price = Math.round((random() * 15 + 2) * 100) / 100;
      const days = [3, 5, 7][Math.floor(random() * 3)];

      // Generate correlated metrics
      const basePerformance = random();
      const civ = Math.floor(basePerformance * 1200 + 100);
      const cc = Math.floor(basePerformance * 200 + 10);
      const atl = Math.floor(basePerformance * 90 + 5);
      const composite = civ + cc * 10 + atl * 50;
      const percentile = Math.min(99, Math.max(1, Math.floor(basePerformance * 85 + 10)));

      items.push({
        id: `item-${i}`,
        name: `${category} Promotion ${i}`,
        category,
        dealType,
        position,
        price,
        days,
        civ,
        cc,
        atl,
        composite,
        percentile,
        subbrand: subbrands[Math.floor(random() * subbrands.length)],
        version: versions[Math.floor(random() * versions.length)],
        store: stores[Math.floor(random() * stores.length)],
        thumbnail: this.generateThumbnail(i)
      });
    }

    return {
      items,
      categories: [...new Set(items.map(item => item.category))].sort(),
      dealTypes: [...new Set(items.map(item => item.dealType))].sort(),
      subbrands,
      versions,
      stores
    };
  }

  generateThumbnail(index) {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    const color = colors[index % colors.length];

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
      <svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'>
        <rect width='40' height='40' fill='${color}' rx='4'/>
        <text x='20' y='24' font-family='Inter, sans-serif' font-size='12' font-weight='600'
              text-anchor='middle' fill='white'>${index}</text>
      </svg>
    `)}`;
  }

  init() {
    this.initializeHeader();
    this.renderUI();
    this.bindEvents();
    this.applyFiltersAndRender();
  }

  initializeHeader() {
    // Initialize week selector in header
    const weekSelect = document.getElementById('week-select');
    const weeks = [
      { value: '2025-W35', text: 'Week 35 • Aug 27 – Sep 2' },
      { value: '2025-W36', text: 'Week 36 • Sep 3 – Sep 9' },
      { value: '2025-W37', text: 'Week 37 • Sep 10 – Sep 16' }
    ];

    weekSelect.innerHTML = weeks.map(week =>
      `<option value="${week.value}" ${week.value === this.state.week ? 'selected' : ''}>${week.text}</option>`
    ).join('');

    // Initialize version selector in header
    const versionSelect = document.getElementById('version-select');
    const versions = [
      { value: 'all', text: 'All' },
      { value: 'v1', text: 'Version 1' },
      { value: 'v2', text: 'Version 2' },
      { value: 'v3', text: 'Version 3' }
    ];

    versionSelect.innerHTML = versions.map(version =>
      `<option value="${version.value}">${version.text}</option>`
    ).join('');

    // Make banner visible
    const banner = document.querySelector('.header-center .banner h2');
    if (banner) {
      banner.style.display = 'block';
    }
  }

  renderUI() {
    this.renderKPIs();
    this.renderTier1Controls();
    this.renderTier2Controls();
    this.renderGridHeaders();
  }

  renderKPIs() {
    const container = document.getElementById('header-tiles');
    const kpis = [
      { label: 'Items', value: '—', id: 'kpi-items' },
      { label: 'Avg %', value: '—', id: 'kpi-avg-percentile' },
      { label: 'Top', value: '—', id: 'kpi-top' },
      { label: 'Categories', value: '—', id: 'kpi-categories' }
    ];

    container.innerHTML = kpis.map(kpi => `
      <div class="header-tile" style="background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 12px; min-width: 80px;">
        <div style="font-size: 11px; color: var(--muted); font-weight: 600; text-transform: uppercase; margin-bottom: 4px;">${kpi.label}</div>
        <div style="font-size: 18px; font-weight: 800; color: var(--text);" id="${kpi.id}">${kpi.value}</div>
      </div>
    `).join('');
  }

  renderTier1Controls() {
    const container = document.getElementById('tier1-content');

    const controls = [
      {
        label: 'Scope',
        type: 'select',
        id: 'scope-select',
        options: [
          { value: 'circular', text: 'Circular' },
          { value: 'category', text: 'Category' },
          { value: 'promotion', text: 'Promotion' }
        ],
        value: this.state.scope
      },
      {
        label: 'Lens',
        type: 'select',
        id: 'lens-select',
        options: [
          { value: 'engagement', text: 'Engagement' },
          { value: 'performance', text: 'Performance' },
          { value: 'traffic', text: 'Traffic' }
        ],
        value: this.state.lens
      },
      {
        label: 'Week',
        type: 'select',
        id: 'week-select-tier1',
        options: [
          { value: '2025-W35', text: 'Week 35 • Aug 27 – Sep 2' },
          { value: '2025-W36', text: 'Week 36 • Sep 3 – Sep 9' },
          { value: '2025-W37', text: 'Week 37 • Sep 10 – Sep 16' }
        ],
        value: this.state.week
      },
      {
        label: 'Entity Level',
        type: 'select',
        id: 'entity-level-select',
        options: [
          { value: 'subbrand', text: 'Sub-brand' },
          { value: 'version', text: 'Version' },
          { value: 'store', text: 'Store' }
        ],
        value: this.state.entityLevel
      },
      {
        label: 'Entities',
        type: 'multiselect',
        id: 'entities-select',
        options: this.getEntityOptions(),
        value: Array.from(this.state.entities)
      }
    ];

    container.innerHTML = controls.map(control => {
      if (control.type === 'select') {
        return `
          <div class="space-y-2">
            <label for="${control.id}" class="block text-sm font-medium text-gray-700">${control.label}</label>
            <select id="${control.id}" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
              ${control.options.map(opt => `<option value="${opt.value}" ${opt.value === control.value ? 'selected' : ''}>${opt.text}</option>`).join('')}
            </select>
          </div>
        `;
      } else if (control.type === 'multiselect') {
        return `
          <div class="space-y-2">
            <label for="${control.id}" class="block text-sm font-medium text-gray-700">${control.label}</label>
            <select id="${control.id}" multiple class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 h-20">
              ${control.options.map(opt => `<option value="${opt.value}" ${control.value.includes(opt.value) ? 'selected' : ''}>${opt.text}</option>`).join('')}
            </select>
          </div>
        `;
      }
    }).join('') + `
      <div class="flex items-end space-x-2">
        <button id="apply-tier1-btn" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          Apply
        </button>
        <button id="reset-tier1-btn" class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          Reset
        </button>
      </div>
    `;
  }

  renderTier2Controls() {
    const container = document.getElementById('tier2-content');

    const controls = [
      {
        label: 'Categories',
        type: 'multiselect',
        id: 'categories-select',
        options: this.data.categories.map(cat => ({ value: cat, text: cat })),
        value: Array.from(this.state.categories)
      },
      {
        label: 'Deal Types',
        type: 'multiselect',
        id: 'deal-types-select',
        options: this.data.dealTypes.map(deal => ({ value: deal, text: deal })),
        value: Array.from(this.state.dealTypes)
      },
      {
        label: 'Sort By',
        type: 'select',
        id: 'sort-by-select',
        options: [
          { value: 'percentile', text: 'Percentile' },
          { value: 'composite', text: 'Composite Score' },
          { value: 'name', text: 'Name' },
          { value: 'category', text: 'Category' },
          { value: 'position', text: 'Position' }
        ],
        value: this.state.sortBy
      },
      {
        label: 'Metric',
        type: 'select',
        id: 'metric-select',
        options: [
          { value: 'percentile', text: 'Percentile' },
          { value: 'composite', text: 'Composite Score' }
        ],
        value: this.state.metric
      }
    ];

    container.innerHTML = controls.map(control => {
      if (control.type === 'select') {
        return `
          <div class="space-y-2">
            <label for="${control.id}" class="block text-sm font-medium text-gray-700">${control.label}</label>
            <select id="${control.id}" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
              ${control.options.map(opt => `<option value="${opt.value}" ${opt.value === control.value ? 'selected' : ''}>${opt.text}</option>`).join('')}
            </select>
          </div>
        `;
      } else if (control.type === 'multiselect') {
        return `
          <div class="space-y-2">
            <label for="${control.id}" class="block text-sm font-medium text-gray-700">${control.label}</label>
            <select id="${control.id}" multiple class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 h-20">
              ${control.options.map(opt => `<option value="${opt.value}" ${control.value.includes(opt.value) ? 'selected' : ''}>${opt.text}</option>`).join('')}
            </select>
          </div>
        `;
      }
    }).join('') + `
      <div class="flex items-end space-x-2">
        <button id="apply-tier2-btn" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          Apply
        </button>
        <button id="collapse-panels-btn" class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          Collapse All
        </button>
      </div>
    `;
  }

  renderGridHeaders() {
    const headers = [
      { key: 'thumbnail', label: 'Image', sortable: false },
      { key: 'name', label: 'Name', sortable: true },
      { key: 'category', label: 'Category', sortable: true },
      { key: 'dealType', label: 'Deal Type', sortable: true },
      { key: 'position', label: 'Position', sortable: true },
      { key: 'price', label: 'Price', sortable: true },
      { key: 'days', label: 'Days', sortable: true },
      { key: 'civ', label: 'CIV', sortable: true },
      { key: 'cc', label: 'CC', sortable: true },
      { key: 'atl', label: 'ATL', sortable: true },
      { key: 'composite', label: 'Composite', sortable: true },
      { key: 'percentile', label: 'Percentile', sortable: true }
    ];

    const headerContainer = document.getElementById('grid-header');
    headerContainer.innerHTML = `
      <tr class="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        ${headers.map(header => `
          <th class="px-6 py-3 ${header.sortable ? 'cursor-pointer hover:bg-gray-100 sortable-header' : ''}" data-key="${header.key}">
            <div class="flex items-center space-x-1">
              <span>${header.label}</span>
              ${header.sortable ? `
                <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 8l5-5 5 5H5z M5 12l5 5 5-5H5z"/>
                </svg>
              ` : ''}
            </div>
          </th>
        `).join('')}
      </tr>
      <tr class="bg-gray-100">
        ${headers.map(header => `
          <th class="px-6 py-2">
            ${header.key !== 'thumbnail' ? `
              <input type="text" placeholder="Filter ${header.label.toLowerCase()}..."
                     class="w-full px-2 py-1 text-xs border border-gray-300 rounded filter-input"
                     data-column="${header.key}">
            ` : ''}
          </th>
        `).join('')}
      </tr>
    `;
  }

  getEntityOptions() {
    const level = this.state.entityLevel;
    if (level === 'subbrand') return this.data.subbrands.map(s => ({ value: s, text: s }));
    if (level === 'version') return this.data.versions.map(v => ({ value: v, text: v }));
    if (level === 'store') return this.data.stores.map(s => ({ value: s, text: s }));
    return [];
  }

  bindEvents() {
    // Header controls
    document.getElementById('week-select').addEventListener('change', (e) => {
      this.state.week = e.target.value;

      // Update tier 1 week selector to match
      const tier1WeekSelect = document.getElementById('week-select-tier1');
      if (tier1WeekSelect) {
        tier1WeekSelect.value = this.state.week;
      }

      this.updateChips();
      this.applyFiltersAndRender();
    });

    document.getElementById('version-select').addEventListener('change', (e) => {
      // Version filtering could be implemented here if needed
      this.applyFiltersAndRender();
    });

    // Panel collapse/expand
    document.getElementById('tier1-header').addEventListener('click', () => this.togglePanel('tier1'));
    document.getElementById('tier2-header').addEventListener('click', () => this.togglePanel('tier2'));

    // Tier 1 controls
    document.getElementById('entity-level-select').addEventListener('change', (e) => {
      this.state.entityLevel = e.target.value;
      this.state.entities.clear();
      this.renderTier1Controls();
      this.bindTier1Events();
    });

    this.bindTier1Events();
    this.bindTier2Events();
    this.bindGridEvents();
  }

  bindTier1Events() {
    document.getElementById('apply-tier1-btn')?.addEventListener('click', () => {
      this.state.scope = document.getElementById('scope-select').value;
      this.state.lens = document.getElementById('lens-select').value;
      this.state.week = document.getElementById('week-select-tier1').value;
      this.state.entityLevel = document.getElementById('entity-level-select').value;

      // Update header week selector to match
      document.getElementById('week-select').value = this.state.week;

      const entitiesSelect = document.getElementById('entities-select');
      this.state.entities = new Set(Array.from(entitiesSelect.selectedOptions).map(opt => opt.value));

      this.updateChips();
      this.applyFiltersAndRender();
    });

    document.getElementById('reset-tier1-btn')?.addEventListener('click', () => {
      this.state.scope = 'circular';
      this.state.lens = 'engagement';
      this.state.week = '2025-W36';
      this.state.entityLevel = 'subbrand';
      this.state.entities.clear();

      // Update header week selector to match
      document.getElementById('week-select').value = this.state.week;

      this.renderTier1Controls();
      this.bindTier1Events();
      this.updateChips();
      this.applyFiltersAndRender();
    });
  }

  bindTier2Events() {
    document.getElementById('apply-tier2-btn')?.addEventListener('click', () => {
      const categoriesSelect = document.getElementById('categories-select');
      const dealTypesSelect = document.getElementById('deal-types-select');

      this.state.categories = new Set(Array.from(categoriesSelect.selectedOptions).map(opt => opt.value));
      this.state.dealTypes = new Set(Array.from(dealTypesSelect.selectedOptions).map(opt => opt.value));
      this.state.sortBy = document.getElementById('sort-by-select').value;
      this.state.metric = document.getElementById('metric-select').value;

      this.updateChips();
      this.applyFiltersAndRender();
    });

    document.getElementById('collapse-panels-btn')?.addEventListener('click', () => {
      this.state.tier1Collapsed = true;
      this.state.tier2Collapsed = true;
      this.updatePanelVisibility();
    });

    document.getElementById('chart-limit').addEventListener('change', (e) => {
      this.state.chartLimit = parseInt(e.target.value);
      this.renderCharts(this.getFilteredData());
    });

    document.getElementById('export-btn').addEventListener('click', () => this.exportToCSV());
  }

  bindGridEvents() {
    // Column sorting
    document.querySelectorAll('.sortable-header').forEach(header => {
      header.addEventListener('click', () => {
        const column = header.dataset.key;
        if (this.state.sortColumn === column) {
          this.state.sortDirection = this.state.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
          this.state.sortColumn = column;
          this.state.sortDirection = 'desc';
        }
        this.applyFiltersAndRender();
      });
    });

    // Column filters
    document.querySelectorAll('.filter-input').forEach(input => {
      input.addEventListener('input', (e) => {
        this.state.columnFilters[e.target.dataset.column] = e.target.value;
        this.applyFiltersAndRender();
      });
    });
  }

  togglePanel(panel) {
    const isCollapsed = this.state[`${panel}Collapsed`];
    this.state[`${panel}Collapsed`] = !isCollapsed;
    this.updatePanelVisibility();
  }

  updatePanelVisibility() {
    const tier1Content = document.getElementById('tier1-content');
    const tier1Chevron = document.getElementById('tier1-chevron');
    const tier2Content = document.getElementById('tier2-content');
    const tier2Chevron = document.getElementById('tier2-chevron');

    tier1Content.style.display = this.state.tier1Collapsed ? 'none' : 'grid';
    tier1Chevron.style.transform = this.state.tier1Collapsed ? 'rotate(-90deg)' : 'rotate(0deg)';

    tier2Content.style.display = this.state.tier2Collapsed ? 'none' : 'grid';
    tier2Chevron.style.transform = this.state.tier2Collapsed ? 'rotate(-90deg)' : 'rotate(0deg)';
  }

  updateChips() {
    // Tier 1 chips
    const tier1Chips = document.getElementById('tier1-chips');
    const tier1ActiveFilters = [
      `Scope: ${this.state.scope}`,
      `Lens: ${this.state.lens}`,
      `Week: ${this.state.week}`,
      `Level: ${this.state.entityLevel}`
    ];

    if (this.state.entities.size > 0) {
      tier1ActiveFilters.push(`Entities: ${Array.from(this.state.entities).slice(0, 2).join(', ')}${this.state.entities.size > 2 ? '...' : ''}`);
    }

    tier1Chips.innerHTML = tier1ActiveFilters.map(filter =>
      `<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">${filter}</span>`
    ).join('');

    // Tier 2 chips
    const tier2Chips = document.getElementById('tier2-chips');
    const tier2ActiveFilters = [`Sort: ${this.state.sortBy}`, `Metric: ${this.state.metric}`];

    if (this.state.categories.size > 0) {
      tier2ActiveFilters.push(`Categories: ${Array.from(this.state.categories).slice(0, 2).join(', ')}${this.state.categories.size > 2 ? '...' : ''}`);
    }

    if (this.state.dealTypes.size > 0) {
      tier2ActiveFilters.push(`Deals: ${Array.from(this.state.dealTypes).slice(0, 2).join(', ')}${this.state.dealTypes.size > 2 ? '...' : ''}`);
    }

    tier2Chips.innerHTML = tier2ActiveFilters.map(filter =>
      `<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">${filter}</span>`
    ).join('');
  }

  getFilteredData() {
    let filteredData = this.data.items.slice();

    // Apply entity filters
    if (this.state.entities.size > 0) {
      const entityKey = this.state.entityLevel;
      filteredData = filteredData.filter(item => this.state.entities.has(item[entityKey]));
    }

    // Apply category filters
    if (this.state.categories.size > 0) {
      filteredData = filteredData.filter(item => this.state.categories.has(item.category));
    }

    // Apply deal type filters
    if (this.state.dealTypes.size > 0) {
      filteredData = filteredData.filter(item => this.state.dealTypes.has(item.dealType));
    }

    // Apply column filters
    Object.entries(this.state.columnFilters).forEach(([column, value]) => {
      if (value.trim()) {
        filteredData = filteredData.filter(item => {
          const itemValue = String(item[column]).toLowerCase();
          return itemValue.includes(value.toLowerCase().trim());
        });
      }
    });

    // Apply sorting
    if (this.state.sortColumn) {
      filteredData.sort((a, b) => {
        const aVal = a[this.state.sortColumn];
        const bVal = b[this.state.sortColumn];

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return this.state.sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }

        const comparison = String(aVal).localeCompare(String(bVal));
        return this.state.sortDirection === 'asc' ? comparison : -comparison;
      });
    } else {
      // Default sort by percentile descending
      filteredData.sort((a, b) => b.percentile - a.percentile);
    }

    return filteredData;
  }

  applyFiltersAndRender() {
    const filteredData = this.getFilteredData();
    this.updateKPIs(filteredData);
    this.renderCharts(filteredData);
    this.renderGrid(filteredData);
  }

  updateKPIs(data) {
    const totalItems = data.length;
    const avgPercentile = data.length > 0 ? Math.round(data.reduce((sum, item) => sum + item.percentile, 0) / data.length) : 0;
    const topPerformer = data.length > 0 ? Math.max(...data.map(item => item.percentile)) : 0;
    const uniqueCategories = new Set(data.map(item => item.category)).size;

    document.getElementById('kpi-items').textContent = totalItems.toLocaleString();
    document.getElementById('kpi-avg-percentile').textContent = `${avgPercentile}%`;
    document.getElementById('kpi-top').textContent = `${topPerformer}%`;
    document.getElementById('kpi-categories').textContent = uniqueCategories.toString();
  }

  renderCharts(data) {
    const container = document.getElementById('charts-container');
    const topItems = data.slice(0, this.state.chartLimit);

    if (this.charts) {
      this.charts.dispose();
    }

    this.charts = echarts.init(container);

    const option = {
      title: {
        text: `Top ${Math.min(this.state.chartLimit, data.length)} Items by Percentile`,
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 600
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: function(params) {
          const item = topItems[params[0].dataIndex];
          return `
            <div class="font-semibold">${item.name}</div>
            <div class="text-sm text-gray-600">Category: ${item.category}</div>
            <div class="text-sm text-gray-600">Deal: ${item.dealType}</div>
            <div class="text-sm"><span class="font-medium">Percentile:</span> ${item.percentile}%</div>
            <div class="text-sm"><span class="font-medium">Composite:</span> ${item.composite}</div>
          `;
        }
      },
      xAxis: {
        type: 'category',
        data: topItems.map((item, index) => `#${index + 1}`),
        axisLabel: {
          fontSize: 11
        }
      },
      yAxis: {
        type: 'value',
        name: 'Percentile',
        min: 0,
        max: 100,
        axisLabel: {
          formatter: '{value}%',
          fontSize: 11
        }
      },
      series: [{
        type: 'bar',
        data: topItems.map(item => ({
          value: item.percentile,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#3B82F6' },
              { offset: 1, color: '#1E40AF' }
            ])
          }
        })),
        barWidth: '60%',
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%',
          fontSize: 10
        }
      }],
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      }
    };

    this.charts.setOption(option);

    // Make chart responsive
    window.addEventListener('resize', () => {
      this.charts?.resize();
    });
  }

  renderGrid(data) {
    const tbody = document.getElementById('grid-body');
    const count = document.getElementById('grid-count');

    count.textContent = `${data.length} items`;

    tbody.innerHTML = data.map((item, index) => `
      <tr class="hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
        <td class="px-6 py-4 whitespace-nowrap">
          <img src="${item.thumbnail}" alt="Item ${item.id}" class="w-10 h-10 rounded-lg">
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm font-medium text-gray-900 max-w-xs truncate" title="${item.name}">${item.name}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            ${item.category}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            ${item.dealType}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.position}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$${item.price.toFixed(2)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.days}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.civ.toLocaleString()}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.cc}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.atl}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.composite.toLocaleString()}</td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="flex items-center">
            <div class="text-sm font-medium text-gray-900 mr-2">${item.percentile}%</div>
            <div class="w-16 bg-gray-200 rounded-full h-2">
              <div class="bg-gradient-to-r from-blue-600 to-blue-400 h-2 rounded-full" style="width: ${item.percentile}%"></div>
            </div>
          </div>
        </td>
      </tr>
    `).join('');
  }

  exportToCSV() {
    const data = this.getFilteredData();
    const headers = ['Name', 'Category', 'Deal Type', 'Position', 'Price', 'Days', 'CIV', 'CC', 'ATL', 'Composite', 'Percentile'];

    const csvContent = [
      headers.join(','),
      ...data.map(item => [
        `"${item.name}"`,
        item.category,
        item.dealType,
        item.position,
        item.price,
        item.days,
        item.civ,
        item.cc,
        item.atl,
        item.composite,
        item.percentile
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `analytics-data-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new DataGridApp();
});