class DataGridComponent {
  constructor(container) {
    this.container = document.getElementById(container);
    this.data = [];
    this.filteredData = [];
    this.currentPage = 1;
    this.pageSize = 50;
    this.sortConfig = { field: null, direction: 'asc' };
    this.filters = { search: '', department: '' };
    this.selectedItems = new Set();
    this.isLoading = false;
    this.error = null;

    // Development mode logging (set to false for production)
    this.debug = false;

    // Virtual scrolling properties
    this.rowHeight = 40; // pixels per row
    this.viewportHeight = 500; // fixed viewport height
    this.scrollTop = 0;
    this.visibleRows = Math.ceil(this.viewportHeight / this.rowHeight);
    this.bufferRows = 5; // extra rows for smooth scrolling
    this.totalHeight = 0;

    // Performance optimization properties
    this.calculatedValues = new Map();
    this.lastRenderTime = 0;
    this.scrollRAF = null;
    this.columns = [
      { field: 'checkbox', label: '', width: 40, type: 'checkbox', visible: true, required: true },
      { field: 'card_name', label: 'Name', width: 200, visible: true, required: true },
      { field: 'department', label: 'Department', width: 100, visible: true },
      { field: 'card_price', label: 'Price', width: 80, visible: true },
      { field: 'card_in_view', label: 'Views', width: 80, visible: true },
      { field: 'card_clicked', label: 'Clicks', width: 80, visible: true },
      { field: 'ctr', label: 'CTR%', width: 60, calculated: true, visible: true },
      { field: 'composite_score', label: 'Score', width: 80, visible: true, required: true }
    ];

    // State persistence
    this.stateKey = 'datagrid-state';
    this.defaultState = {
      columns: this.columns.map(col => ({ field: col.field, visible: col.visible })),
      sortConfig: { field: null, direction: 'asc' },
      pageSize: 50,
      filters: { search: '', department: '' }
    };

    // Context mapping for dashboard navigation
    this.contextMap = {
      'traffic': {
        name: 'Traffic Analysis',
        description: 'Weekly visitor patterns and page views',
        defaultScope: 'promotion',
        defaultLens: 'traffic',
        defaultSort: 'card_in_view',
        filterHints: ['High traffic items', 'View-to-click ratio analysis'],
        visibleColumns: ['checkbox', 'card_name', 'department', 'card_in_view', 'card_clicked', 'ctr', 'composite_score'],
        defaultFilters: {
          scope: 'promotion',
          lens: 'traffic',
          timeframe: 'current-week',
          entity: 'promotion',
          sortField: 'card_in_view',
          sortDirection: 'desc'
        }
      },
      'share-activity': {
        name: 'Share Activity',
        description: 'Social sharing and viral engagement',
        defaultScope: 'promotion',
        defaultLens: 'engagement',
        defaultSort: 'share_count',
        filterHints: ['Viral content', 'Social engagement metrics'],
        visibleColumns: ['checkbox', 'card_name', 'card_clicked', 'ctr', 'composite_score'],
        defaultFilters: {
          scope: 'promotion',
          lens: 'engagement',
          timeframe: 'current-week',
          entity: 'promotion',
          dealTypes: ['bogo', 'premium'],
          sortField: 'card_clicked',
          sortDirection: 'desc'
        }
      },
      'week-performance': {
        name: 'Weekly Performance',
        description: 'Weekly circular performance metrics and trends',
        defaultScope: 'promotion',
        defaultLens: 'performance',
        defaultSort: 'composite_score',
        filterHints: ['Top performers', 'Week-over-week changes'],
        visibleColumns: ['checkbox', 'card_name', 'department', 'card_price', 'card_in_view', 'card_clicked', 'ctr', 'composite_score'],
        defaultFilters: {
          scope: 'promotion',
          lens: 'performance',
          timeframe: 'current-week',
          entity: 'promotion',
          sortField: 'composite_score',
          sortDirection: 'desc'
        }
      },
      'performance': {
        name: 'Performance Analysis',
        description: 'Comprehensive performance metrics and KPI analysis',
        defaultScope: 'promotion',
        defaultLens: 'performance',
        defaultSort: 'composite_score',
        filterHints: ['Performance ranking', 'Score optimization'],
        visibleColumns: ['checkbox', 'card_name', 'department', 'card_price', 'card_in_view', 'card_clicked', 'ctr', 'composite_score'],
        defaultFilters: {
          scope: 'promotion',
          lens: 'performance',
          timeframe: 'current-week',
          entity: 'promotion',
          sortField: 'composite_score',
          sortDirection: 'desc'
        }
      },
      'interaction': {
        name: 'User Interaction',
        description: 'User interaction patterns and engagement behavior',
        defaultScope: 'promotion',
        defaultLens: 'engagement',
        defaultSort: 'card_clicked',
        filterHints: ['Click patterns', 'Engagement depth'],
        visibleColumns: ['checkbox', 'card_name', 'card_in_view', 'card_clicked', 'ctr', 'composite_score'],
        defaultFilters: {
          scope: 'promotion',
          lens: 'engagement',
          timeframe: 'current-week',
          entity: 'promotion',
          sortField: 'card_clicked',
          sortDirection: 'desc'
        }
      },
      'categories': {
        name: 'Category Performance',
        description: 'Category-level performance analysis and comparisons',
        defaultScope: 'category',
        defaultLens: 'performance',
        defaultSort: 'composite_score',
        filterHints: ['Category rankings', 'Cross-category analysis'],
        visibleColumns: ['checkbox', 'card_name', 'department', 'card_in_view', 'card_clicked', 'composite_score'],
        defaultFilters: {
          scope: 'category',
          lens: 'performance',
          timeframe: 'current-week',
          entity: 'category',
          categories: ['bakery', 'deli', 'produce'],
          sortField: 'composite_score',
          sortDirection: 'desc'
        }
      },
      'promotions': {
        name: 'Promotion Analysis',
        description: 'Promotion effectiveness and optimization insights',
        defaultScope: 'promotion',
        defaultLens: 'performance',
        defaultSort: 'composite_score',
        filterHints: ['Promotion ROI', 'Effectiveness metrics'],
        visibleColumns: ['checkbox', 'card_name', 'department', 'card_price', 'card_clicked', 'composite_score'],
        defaultFilters: {
          scope: 'promotion',
          lens: 'performance',
          timeframe: 'current-week',
          entity: 'promotion',
          dealTypes: ['bogo', 'discount', 'premium'],
          sortField: 'composite_score',
          sortDirection: 'desc'
        }
      },
      'size-analysis': {
        name: 'Size Distribution',
        description: 'Product size mix and distribution analysis',
        defaultScope: 'promotion',
        defaultLens: 'content',
        defaultSort: 'size_class',
        filterHints: ['Size performance', 'Mix optimization'],
        visibleColumns: ['checkbox', 'card_name', 'department', 'card_price', 'composite_score'],
        defaultFilters: {
          scope: 'promotion',
          lens: 'content',
          timeframe: 'current-week',
          entity: 'promotion',
          sizeClasses: ['S', 'M', 'L'],
          sortField: 'card_in_view',
          sortDirection: 'desc'
        }
      },
      'deal-preference': {
        name: 'Deal Preferences',
        description: 'Customer deal type preferences and effectiveness',
        defaultScope: 'promotion',
        defaultLens: 'performance',
        defaultSort: 'deal_effectiveness',
        filterHints: ['Deal type ranking', 'Customer preferences'],
        visibleColumns: ['checkbox', 'card_name', 'department', 'card_price', 'card_clicked', 'composite_score'],
        defaultFilters: {
          scope: 'promotion',
          lens: 'performance',
          timeframe: 'current-week',
          entity: 'promotion',
          dealTypes: ['bogo', 'discount', 'fixed-price'],
          positionRanges: ['top', 'upper-mid'],
          sortField: 'composite_score',
          sortDirection: 'desc'
        }
      },

      // YTD Metrics Sources (3 contexts)
      'ytd-traffic': {
        name: 'YTD Traffic Analysis',
        description: 'Year-to-date traffic patterns and growth trends',
        defaultScope: 'promotion',
        defaultLens: 'traffic',
        defaultSort: 'card_in_view',
        filterHints: ['Annual traffic growth', 'YoY comparisons'],
        visibleColumns: ['checkbox', 'card_name', 'department', 'card_in_view', 'card_clicked', 'ctr', 'composite_score'],
        defaultFilters: {
          scope: 'promotion',
          lens: 'traffic',
          timeframe: 'ytd',
          entity: 'promotion',
          sortField: 'card_in_view',
          sortDirection: 'desc'
        }
      },

      'digital-adoption': {
        name: 'Digital Adoption Metrics',
        description: 'Digital circular adoption rates and trends',
        defaultScope: 'promotion',
        defaultLens: 'engagement',
        defaultSort: 'card_clicked',
        filterHints: ['Digital vs print usage', 'Adoption patterns'],
        visibleColumns: ['checkbox', 'card_name', 'department', 'card_in_view', 'card_clicked', 'ctr', 'composite_score'],
        defaultFilters: {
          scope: 'promotion',
          lens: 'engagement',
          timeframe: 'ytd',
          entity: 'promotion',
          sortField: 'card_clicked',
          sortDirection: 'desc'
        }
      },

      'print-rate': {
        name: 'Print Rate Analysis',
        description: 'Print circular usage rates and effectiveness',
        defaultScope: 'promotion',
        defaultLens: 'performance',
        defaultSort: 'composite_score',
        filterHints: ['Print vs digital performance', 'Physical circular impact'],
        visibleColumns: ['checkbox', 'card_name', 'department', 'card_price', 'composite_score'],
        defaultFilters: {
          scope: 'promotion',
          lens: 'performance',
          timeframe: 'ytd',
          entity: 'promotion',
          sortField: 'composite_score',
          sortDirection: 'desc'
        }
      },

      // Main Tiles Sources (additional contexts)
      'sharing': {
        name: 'Content Sharing Analysis',
        description: 'Social sharing patterns and viral content performance',
        defaultScope: 'promotion',
        defaultLens: 'engagement',
        defaultSort: 'card_clicked',
        filterHints: ['Viral content', 'Share rates', 'Social engagement'],
        visibleColumns: ['checkbox', 'card_name', 'card_clicked', 'ctr', 'composite_score'],
        defaultFilters: {
          scope: 'promotion',
          lens: 'engagement',
          timeframe: 'current-week',
          entity: 'promotion',
          sortField: 'card_clicked',
          sortDirection: 'desc'
        }
      },

      'size': {
        name: 'Size Distribution Analysis',
        description: 'Product size mix and distribution patterns',
        defaultScope: 'promotion',
        defaultLens: 'content',
        defaultSort: 'card_in_view',
        filterHints: ['Size performance', 'Mix optimization', 'Size preferences'],
        visibleColumns: ['checkbox', 'card_name', 'department', 'card_price', 'card_in_view', 'composite_score'],
        defaultFilters: {
          scope: 'promotion',
          lens: 'content',
          timeframe: 'current-week',
          entity: 'promotion',
          sizeClasses: ['S', 'M', 'L', 'XL'],
          sortField: 'card_in_view',
          sortDirection: 'desc'
        }
      },

      'size_performance': {
        name: 'Size Performance Metrics',
        description: 'Size-based performance analysis and optimization',
        defaultScope: 'promotion',
        defaultLens: 'performance',
        defaultSort: 'composite_score',
        filterHints: ['Size-based ROI', 'Performance by size class'],
        visibleColumns: ['checkbox', 'card_name', 'department', 'card_price', 'card_in_view', 'card_clicked', 'composite_score'],
        defaultFilters: {
          scope: 'promotion',
          lens: 'performance',
          timeframe: 'current-week',
          entity: 'promotion',
          sizeClasses: ['S', 'M', 'L', 'XL'],
          sortField: 'composite_score',
          sortDirection: 'desc'
        }
      },

      // Chart Cards and Performance Tables Sources
      'weekly-trends': {
        name: 'Weekly Trend Analysis',
        description: 'Week-over-week performance trends and patterns',
        defaultScope: 'promotion',
        defaultLens: 'performance',
        defaultSort: 'composite_score',
        filterHints: ['Trend analysis', 'Weekly comparisons', 'Growth patterns'],
        visibleColumns: ['checkbox', 'card_name', 'department', 'card_in_view', 'card_clicked', 'composite_score'],
        defaultFilters: {
          scope: 'promotion',
          lens: 'performance',
          timeframe: 'current-week',
          entity: 'promotion',
          sortField: 'composite_score',
          sortDirection: 'desc'
        }
      },

      'engagement-depth': {
        name: 'Engagement Depth Analysis',
        description: 'Deep-dive into user engagement patterns and behavior',
        defaultScope: 'promotion',
        defaultLens: 'engagement',
        defaultSort: 'card_clicked',
        filterHints: ['Engagement quality', 'User behavior patterns', 'Depth metrics'],
        visibleColumns: ['checkbox', 'card_name', 'card_in_view', 'card_clicked', 'ctr', 'composite_score'],
        defaultFilters: {
          scope: 'promotion',
          lens: 'engagement',
          timeframe: 'current-week',
          entity: 'promotion',
          sortField: 'card_clicked',
          sortDirection: 'desc'
        }
      },

      // Performance Tables Sources (2 contexts)
      'performance-day': {
        name: 'Daily Performance Analysis',
        description: 'Day-by-day performance breakdown and trends',
        defaultScope: 'promotion',
        defaultLens: 'performance',
        defaultSort: 'composite_score',
        filterHints: ['Daily trends', 'Day-of-week patterns', 'Time-based analysis'],
        visibleColumns: ['checkbox', 'card_name', 'department', 'card_in_view', 'card_clicked', 'composite_score'],
        defaultFilters: {
          scope: 'promotion',
          lens: 'performance',
          timeframe: 'current-week',
          entity: 'promotion',
          sortField: 'composite_score',
          sortDirection: 'desc'
        }
      },

      'interaction-rate': {
        name: 'Interaction Rate Analysis',
        description: 'Detailed interaction rate metrics and optimization insights',
        defaultScope: 'promotion',
        defaultLens: 'engagement',
        defaultSort: 'ctr',
        filterHints: ['Click-through rates', 'Interaction optimization', 'Engagement efficiency'],
        visibleColumns: ['checkbox', 'card_name', 'department', 'card_in_view', 'card_clicked', 'ctr', 'composite_score'],
        defaultFilters: {
          scope: 'promotion',
          lens: 'engagement',
          timeframe: 'current-week',
          entity: 'promotion',
          sortField: 'ctr',
          sortDirection: 'desc'
        }
      },

      // Additional Chart Cards Sources
      'top-categories': {
        name: 'Top Categories Analysis',
        description: 'Top performing categories and competitive analysis',
        defaultScope: 'category',
        defaultLens: 'performance',
        defaultSort: 'composite_score',
        filterHints: ['Category leaders', 'Performance rankings', 'Category insights'],
        visibleColumns: ['checkbox', 'card_name', 'department', 'card_in_view', 'card_clicked', 'composite_score'],
        defaultFilters: {
          scope: 'category',
          lens: 'performance',
          timeframe: 'current-week',
          entity: 'category',
          categories: ['bakery', 'deli', 'produce', 'meat', 'dairy'],
          sortField: 'composite_score',
          sortDirection: 'desc'
        }
      },

      'promotion-performance': {
        name: 'Promotion Performance Table',
        description: 'Detailed promotion performance metrics and rankings',
        defaultScope: 'promotion',
        defaultLens: 'performance',
        defaultSort: 'composite_score',
        filterHints: ['Promotion rankings', 'ROI analysis', 'Effectiveness metrics'],
        visibleColumns: ['checkbox', 'card_name', 'department', 'card_price', 'card_in_view', 'card_clicked', 'composite_score'],
        defaultFilters: {
          scope: 'promotion',
          lens: 'performance',
          timeframe: 'current-week',
          entity: 'promotion',
          dealTypes: ['bogo', 'discount', 'premium'],
          sortField: 'composite_score',
          sortDirection: 'desc'
        }
      },

      'size-mix': {
        name: 'Size Mix Distribution',
        description: 'Product size class distribution and mix analysis',
        defaultScope: 'promotion',
        defaultLens: 'content',
        defaultSort: 'card_in_view',
        filterHints: ['Size distribution', 'Mix optimization', 'Size class performance'],
        visibleColumns: ['checkbox', 'card_name', 'department', 'card_price', 'card_in_view', 'composite_score'],
        defaultFilters: {
          scope: 'promotion',
          lens: 'content',
          timeframe: 'current-week',
          entity: 'promotion',
          sizeClasses: ['XS', 'S', 'M', 'L', 'XL'],
          sortField: 'card_in_view',
          sortDirection: 'desc'
        }
      }
    };

    // Context integration for week filtering and comparison mode
    this.contextStateService = null;
    this.contextSubscription = null;
    this.currentContextState = null;
    this.comparisonMode = false;
    this.originalColumns = [...this.columns]; // Store original column definitions

    // Load saved state from localStorage
    this.loadState();

    // Parse URL context and apply defaults
    this.parseUrlContext();

    // Initialize context service integration
    this.initializeContextService();
  }

  /**
   * Initialize context service integration for week filtering and comparison
   */
  async initializeContextService() {
    try {
      // Wait for ContextStateService to be available
      if (window.contextStateService) {
        // Get initial context state
        this.currentContextState = window.contextStateService.loadState('analyze');

        // Listen for context changes
        document.addEventListener('contextChanged', (event) => {
          this.handleContextChange(event.detail);
        });

        this._log('✅ Context service integration initialized for DataGrid', this.currentContextState);
      } else {
        this._log('⚠️ ContextStateService not available, skipping context integration');
        // Set default context state
        this.currentContextState = {
          week: 40,
          scopeLevel: 'all',
          scopeValue: 'all',
          comparisonMode: false
        };
      }
    } catch (error) {
      console.error('❌ Failed to initialize context service in DataGrid:', error);
    }
  }

  /**
   * Handle context changes from context bar
   */
  async handleContextChange(contextState) {
    this._log('📊 Context changed in DataGrid:', contextState);

    // Update current context state
    const previousState = this.currentContextState;
    this.currentContextState = contextState;

    // Apply context filtering
    await this.applyContextFiltering(previousState);

    // Update grid header to show current context
    this.updateGridHeader();

    // Re-render the grid
    this.render();
  }

  /**
   * Apply context filtering to data
   */
  async applyContextFiltering(previousState = null) {
    if (!this.data || this.data.length === 0) {
      this._log('⚠️ No data available for context filtering');
      return;
    }

    this._setLoading(true);

    try {
      // Start with original data
      let filteredData = [...this.data];

      // Apply week filter
      if (this.currentContextState.week && this.currentContextState.week !== 40) {
        filteredData = this.filterByWeek(filteredData, this.currentContextState.week);
      }

      // Apply store scope filter
      if (this.currentContextState.scopeLevel !== 'all') {
        filteredData = this.filterByStoreScope(filteredData, this.currentContextState);
      }

      // Handle comparison mode
      if (this.currentContextState.comparisonMode && this.currentContextState.compareWeek) {
        filteredData = await this.addComparisonColumns(filteredData);
      } else if (previousState && previousState.comparisonMode && !this.currentContextState.comparisonMode) {
        // Remove comparison columns if comparison mode was turned off
        this.removeComparisonColumns();
      }

      // Update filtered data
      this.filteredData = filteredData;

      // Apply current filters
      this.applyFilters();

      this._log('✅ Context filtering applied', {
        originalCount: this.data.length,
        filteredCount: this.filteredData.length,
        context: this.currentContextState
      });

    } catch (error) {
      console.error('❌ Error applying context filtering:', error);
    } finally {
      this._setLoading(false);
    }
  }

  /**
   * Filter data by selected week
   */
  filterByWeek(data, selectedWeek) {
    // For demonstration, we'll simulate different data for different weeks
    // In a real implementation, this would filter based on actual week data

    return data.map(item => {
      const weekOffset = selectedWeek - 40;
      const performanceVariation = 1 + (Math.sin(weekOffset) * 0.15); // ±15% variation

      return {
        ...item,
        week: selectedWeek,
        card_in_view: Math.max(0, Math.round(item.card_in_view * performanceVariation)),
        card_clicked: Math.max(0, Math.round(item.card_clicked * performanceVariation)),
        composite_score: Math.max(0, Math.round(item.composite_score * performanceVariation)),
        added_to_list: Math.max(0, Math.round((item.added_to_list || 0) * performanceVariation)),
        share_count: Math.max(0, Math.round((item.share_count || 0) * performanceVariation))
      };
    });
  }

  /**
   * Filter data by store scope
   */
  filterByStoreScope(data, contextState) {
    // Apply store scope filtering based on context
    let scopeModifier = 1;

    if (contextState.scopeLevel === 'region') {
      // Find region modifier (assuming regions have different store counts)
      const regionData = mockDatabase.regions?.find(r => r.id === contextState.scopeValue);
      if (regionData) {
        scopeModifier = regionData.stores.length / 67; // Total stores
      } else {
        scopeModifier = 0.3; // Default regional modifier
      }
    } else if (contextState.scopeLevel === 'store') {
      scopeModifier = 1 / 67; // Single store
    }

    return data.map(item => ({
      ...item,
      card_in_view: Math.max(0, Math.round(item.card_in_view * scopeModifier)),
      card_clicked: Math.max(0, Math.round(item.card_clicked * scopeModifier)),
      added_to_list: Math.max(0, Math.round((item.added_to_list || 0) * scopeModifier)),
      share_count: Math.max(0, Math.round((item.share_count || 0) * scopeModifier))
    }));
  }

  /**
   * Add comparison columns for comparison mode
   */
  async addComparisonColumns(currentWeekData) {
    if (!this.currentContextState.compareWeek) {
      return currentWeekData;
    }

    // Get comparison week data
    const compareWeekData = this.filterByWeek([...this.data], this.currentContextState.compareWeek);

    // Add comparison columns
    if (!this.columns.find(col => col.field === 'card_in_view_delta')) {
      this.columns.splice(-1, 0, // Insert before last column
        { field: 'card_in_view_delta', label: 'Views Δ', width: 80, visible: true, calculated: true, comparison: true },
        { field: 'card_clicked_delta', label: 'Clicks Δ', width: 80, visible: true, calculated: true, comparison: true },
        { field: 'composite_score_delta', label: 'Score Δ', width: 80, visible: true, calculated: true, comparison: true }
      );
    }

    // Create lookup map for comparison data
    const compareMap = new Map();
    compareWeekData.forEach(item => {
      compareMap.set(item.card_id, item);
    });

    // Add delta values to current week data
    return currentWeekData.map(item => {
      const compareItem = compareMap.get(item.card_id);

      if (compareItem) {
        const viewsDelta = item.card_in_view - compareItem.card_in_view;
        const clicksDelta = item.card_clicked - compareItem.card_clicked;
        const scoreDelta = item.composite_score - compareItem.composite_score;

        return {
          ...item,
          card_in_view_delta: viewsDelta,
          card_clicked_delta: clicksDelta,
          composite_score_delta: scoreDelta,
          card_in_view_change: compareItem.card_in_view > 0 ? Math.round((viewsDelta / compareItem.card_in_view) * 100) : 0,
          card_clicked_change: compareItem.card_clicked > 0 ? Math.round((clicksDelta / compareItem.card_clicked) * 100) : 0,
          composite_score_change: compareItem.composite_score > 0 ? Math.round((scoreDelta / compareItem.composite_score) * 100) : 0
        };
      }

      return {
        ...item,
        card_in_view_delta: 0,
        card_clicked_delta: 0,
        composite_score_delta: 0,
        card_in_view_change: 0,
        card_clicked_change: 0,
        composite_score_change: 0
      };
    });
  }

  /**
   * Remove comparison columns when comparison mode is turned off
   */
  removeComparisonColumns() {
    this.columns = this.columns.filter(col => !col.comparison);
    this._populateColumnSettings();
  }

  /**
   * Update grid header to show current context
   */
  updateGridHeader() {
    const headerElement = document.getElementById('grid-header');
    if (headerElement && this.currentContextState) {
      // Grid context header removed per user request
      headerElement.innerHTML = '';
    }
  }


  /**
   * Filter data by week based on context state
   */
  filterDataByWeek(data) {
    if (!this.currentContextState || !this.currentContextState.period) {
      return data;
    }

    const periodState = this.currentContextState.period;

    if (periodState.mode === 'single') {
      // Single week filtering
      const weekId = periodState.selected?.id || periodState.selected;
      if (weekId) {
        return data.filter(item => item.week_id === weekId || item.period === weekId);
      }
    } else if (periodState.mode === 'compare') {
      // Comparison mode - include both weeks
      const primaryWeek = periodState.selected?.id || periodState.selected;
      const compareWeek = periodState.compare?.id || periodState.compare;

      if (primaryWeek || compareWeek) {
        return data.filter(item => {
          const itemWeek = item.week_id || item.period;
          return itemWeek === primaryWeek || itemWeek === compareWeek;
        });
      }
    }

    return data;
  }

  /**
   * Filter data by scope (store selection) based on context state
   */
  filterDataByScope(data) {
    if (!this.currentContextState || !this.currentContextState.scope) {
      return data;
    }

    const scopeState = this.currentContextState.scope;

    if (scopeState.level === 'store' && scopeState.selected) {
      // Filter by specific store
      return data.filter(item => {
        const itemStoreId = item.store_id || item.location_id || item.store;
        return itemStoreId === scopeState.selected.id || itemStoreId === scopeState.selected;
      });
    } else if (scopeState.level === 'region' && scopeState.selected) {
      // Filter by region (multiple stores)
      const regionStores = scopeState.stores || [];
      return data.filter(item => {
        const itemStoreId = item.store_id || item.location_id || item.store;
        return regionStores.some(store =>
          (store.id === itemStoreId) || (store === itemStoreId)
        );
      });
    }

    return data;
  }

  /**
   * Update column definitions for comparison mode
   */
  updateColumnsForComparison() {
    if (this.comparisonMode) {
      // Add comparison columns with delta calculations
      this.columns = this.createComparisonColumns();
    } else {
      // Restore original columns
      this.columns = [...this.originalColumns];
    }

    // Update column settings UI if present
    this._updateColumnSettingsUI();

    this._log('📊 Columns updated for comparison mode:', {
      comparisonMode: this.comparisonMode,
      columnCount: this.columns.length
    });
  }

  /**
   * Create comparison column definitions with delta columns
   */
  createComparisonColumns() {
    const comparisonColumns = [];
    const weekLabels = this.getWeekLabelsForComparison();

    // Start with checkbox and name columns (always visible)
    comparisonColumns.push(
      { field: 'checkbox', label: '', width: 40, type: 'checkbox', visible: true, required: true },
      { field: 'card_name', label: 'Name', width: 200, visible: true, required: true },
      { field: 'department', label: 'Department', width: 100, visible: true }
    );

    // Add comparison data columns for numeric fields
    const numericFields = ['card_price', 'card_in_view', 'card_clicked', 'composite_score'];

    numericFields.forEach(field => {
      const originalCol = this.originalColumns.find(col => col.field === field);
      if (!originalCol) return;

      // Current week column
      comparisonColumns.push({
        field: `${field}_current`,
        label: `${originalCol.label} (${weekLabels.current})`,
        width: originalCol.width + 20,
        type: 'number',
        visible: true,
        comparisonField: field
      });

      // Previous week column
      comparisonColumns.push({
        field: `${field}_compare`,
        label: `${originalCol.label} (${weekLabels.compare})`,
        width: originalCol.width + 20,
        type: 'number',
        visible: true,
        comparisonField: field
      });

      // Delta column
      comparisonColumns.push({
        field: `${field}_delta`,
        label: `Δ ${originalCol.label}`,
        width: 80,
        type: 'delta',
        visible: true,
        calculated: true,
        comparisonField: field
      });
    });

    return comparisonColumns;
  }

  /**
   * Get week labels for comparison headers
   */
  getWeekLabelsForComparison() {
    if (!this.currentContextState || !this.currentContextState.period) {
      return { current: 'Current', compare: 'Previous' };
    }

    const periodState = this.currentContextState.period;
    const currentWeek = periodState.selected;
    const compareWeek = periodState.compare;

    return {
      current: currentWeek?.label || currentWeek?.name || 'Current Week',
      compare: compareWeek?.label || compareWeek?.name || 'Compare Week'
    };
  }

  /**
   * Prepare data for comparison mode display
   */
  prepareComparisonData(data) {
    if (!this.currentContextState || !this.currentContextState.period) {
      return data;
    }

    const periodState = this.currentContextState.period;
    const primaryWeek = periodState.selected?.id || periodState.selected;
    const compareWeek = periodState.compare?.id || periodState.compare;

    if (!primaryWeek || !compareWeek) {
      return data;
    }

    // Group data by card_name to merge weeks
    const dataByCard = {};

    data.forEach(item => {
      const cardKey = item.card_name || item.name || item.id;
      const itemWeek = item.week_id || item.period;

      if (!dataByCard[cardKey]) {
        dataByCard[cardKey] = {
          card_name: item.card_name,
          department: item.department,
          primary: null,
          compare: null
        };
      }

      if (itemWeek === primaryWeek) {
        dataByCard[cardKey].primary = item;
      } else if (itemWeek === compareWeek) {
        dataByCard[cardKey].compare = item;
      }
    });

    // Create comparison rows with calculated delta columns
    const comparisonData = [];

    Object.entries(dataByCard).forEach(([cardKey, cardData]) => {
      if (!cardData.primary && !cardData.compare) return;

      const primary = cardData.primary || {};
      const compare = cardData.compare || {};

      const comparisonRow = {
        card_id: primary.card_id || compare.card_id || cardKey,
        card_name: cardData.card_name,
        department: cardData.department,

        // Current week values
        card_price_current: primary.card_price || 0,
        card_in_view_current: primary.card_in_view || 0,
        card_clicked_current: primary.card_clicked || 0,
        composite_score_current: primary.composite_score || 0,

        // Compare week values
        card_price_compare: compare.card_price || 0,
        card_in_view_compare: compare.card_in_view || 0,
        card_clicked_compare: compare.card_clicked || 0,
        composite_score_compare: compare.composite_score || 0,

        // Delta calculations
        card_price_delta: this.calculateDelta(primary.card_price, compare.card_price),
        card_in_view_delta: this.calculateDelta(primary.card_in_view, compare.card_in_view),
        card_clicked_delta: this.calculateDelta(primary.card_clicked, compare.card_clicked),
        composite_score_delta: this.calculateDelta(primary.composite_score, compare.composite_score)
      };

      comparisonData.push(comparisonRow);
    });

    this._log('🔄 Prepared comparison data:', {
      originalCount: data.length,
      comparisonCount: comparisonData.length,
      primaryWeek,
      compareWeek
    });

    return comparisonData;
  }

  /**
   * Calculate delta value and percentage for comparison
   */
  calculateDelta(current, previous) {
    if (!current && !previous) return { value: 0, percent: 0, trend: 'neutral' };
    if (!previous) return { value: current || 0, percent: 100, trend: 'up' };
    if (!current) return { value: -(previous || 0), percent: -100, trend: 'down' };

    const delta = (current || 0) - (previous || 0);
    const percent = previous !== 0 ? ((delta / previous) * 100) : 100;

    return {
      value: delta,
      percent: percent,
      trend: delta > 0 ? 'up' : delta < 0 ? 'down' : 'neutral'
    };
  }

  /**
   * Update column settings UI when columns change
   */
  _updateColumnSettingsUI() {
    const columnCheckboxes = document.getElementById('column-checkboxes');
    if (!columnCheckboxes) return;

    // Clear existing checkboxes
    columnCheckboxes.innerHTML = '';

    // Add checkboxes for each column
    this.columns.forEach((column, index) => {
      if (column.required) return; // Skip required columns

      const checkboxContainer = document.createElement('label');
      checkboxContainer.className = 'column-checkbox-item';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = column.visible;
      checkbox.dataset.columnField = column.field;

      const label = document.createElement('span');
      label.textContent = column.label;

      checkboxContainer.appendChild(checkbox);
      checkboxContainer.appendChild(label);
      columnCheckboxes.appendChild(checkboxContainer);

      // Add event listener for column visibility toggle
      checkbox.addEventListener('change', () => {
        column.visible = checkbox.checked;
        this.render();
        this._saveColumnPreferences();
      });
    });
  }

  /**
   * Debug logging method (only logs in debug mode)
   */
  _log(message, data = null) {
    if (this.debug) {
      if (data) {

      } else {

      }
    }
  }

  /**
   * Cleanup method for destroying the component
   */
  destroy() {
    // Unsubscribe from context changes
    if (this.contextSubscription) {
      this.contextStateService.unsubscribe(this.contextSubscription);
      this.contextSubscription = null;
    }

    // Clear any cached values
    if (this.calculatedValues) {
      this.calculatedValues.clear();
    }

    // Clear data references
    this.data = [];
    this.filteredData = [];
    this.contextFilteredData = [];
    this.currentContextState = null;

    this._log('🧹 DataGrid component destroyed and cleaned up');
  }

  /**
   * Parse URL parameters and establish dashboard context
   */
  parseUrlContext() {
    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get('source');
    const filter = urlParams.get('filter');

    // Set context from source parameter
    if (source && this.contextMap[source]) {
      this.currentContext = this.contextMap[source];
      this.applyContextDefaults();
    } else if (filter && this.contextMap[filter]) {
      this.currentContext = this.contextMap[filter];
      this.applyContextDefaults();
    } else {
      // Default context for direct navigation
      this.currentContext = {
        name: 'Data Analysis',
        description: 'Comprehensive data exploration and insights',
        defaultScope: 'promotion',
        defaultLens: 'performance',
        defaultSort: 'composite_score',
        filterHints: ['Data exploration', 'General analysis']
      };
    }

    // Preserve dashboard state context
    this.dashboardContext = {
      period: urlParams.get('period') || 'w36',
      version: urlParams.get('version') || 'all',
      scope: urlParams.get('scope') || 'all_stores'
    };

    this.updateContextBanner();

    this._log('📊 Context established:', {
      context: this.currentContext,
      dashboard: this.dashboardContext,
      source: source,
      filter: filter
    });
  }

  /**
   * Apply context-specific defaults to grid configuration
   */
  applyContextDefaults() {
    if (!this.currentContext) return;

    // Apply default sort if not already set
    if (!this.sortConfig.field && this.currentContext.defaultSort) {
      this.sortConfig = {
        field: this.currentContext.defaultSort,
        direction: 'desc'
      };
    }

    // Apply context-specific column visibility
    this.applyContextColumnConfig();

    // Apply context defaults to Tier 1 filters
    this.applyTier1FilterDefaults();

    // Apply comprehensive context defaults if available
    if (this.currentContext.defaultFilters) {
      this.applyContextFilterDefaults(this.currentContext.defaultFilters);
    }
  }

  /**
   * Apply comprehensive context filter defaults
   */
  applyContextFilterDefaults(defaults) {
    

    // Store flag to apply defaults after data is loaded
    this.pendingContextDefaults = defaults;
  }

  /**
   * Apply context defaults after data is loaded and filters are populated
   */
  applyPendingContextDefaults() {
    if (!this.pendingContextDefaults) return;

    // Validate defaults against available data
    const defaults = this.validateContextDefaults(this.pendingContextDefaults);
    

    // Apply Tier 1 dropdown defaults
    this.applyTier1Defaults(defaults);

    // Apply Tier 2 checkbox defaults
    this.applyTier2Defaults(defaults);

    // Apply sort configuration
    if (defaults.sortField) {
      this.sortConfig = {
        field: defaults.sortField,
        direction: defaults.sortDirection || 'desc'
      };
    }

    // Clear pending defaults
    this.pendingContextDefaults = null;

    
  }

  /**
   * Apply Tier 1 dropdown defaults
   */
  applyTier1Defaults(defaults) {
    // Set dropdown values
    const dropdownMappings = [
      { key: 'scope', elementId: 'scope-filter' },
      { key: 'lens', elementId: 'lens-filter' },
      { key: 'timeframe', elementId: 'timeframe-filter' },
      { key: 'entity', elementId: 'entity-filter' }
    ];

    dropdownMappings.forEach(({ key, elementId }) => {
      if (defaults[key]) {
        const element = document.getElementById(elementId);
        if (element) {
          // Find option with matching value
          const option = Array.from(element.options).find(opt => opt.value === defaults[key]);
          if (option) {
            element.value = defaults[key];

            // Create filter chip for non-default selections
            if (element.selectedIndex > 0) {
              this.addFilterChip(key, defaults[key], option.text);
            }

            
          }
        }
      }
    });
  }

  /**
   * Apply Tier 2 checkbox defaults
   */
  applyTier2Defaults(defaults) {
    // Apply category defaults
    if (defaults.categories && Array.isArray(defaults.categories)) {
      this.applyCheckboxDefaults('category', defaults.categories);
    }

    // Apply deal type defaults
    if (defaults.dealTypes && Array.isArray(defaults.dealTypes)) {
      this.applyCheckboxDefaults('deal-type', defaults.dealTypes);
    }

    // Apply size class defaults
    if (defaults.sizeClasses && Array.isArray(defaults.sizeClasses)) {
      this.applyCheckboxDefaults('size-class', defaults.sizeClasses);
    }

    // Apply position range defaults
    if (defaults.positionRanges && Array.isArray(defaults.positionRanges)) {
      this.applyCheckboxDefaults('position-range', defaults.positionRanges);
    }
  }

  /**
   * Apply defaults to specific checkbox group
   */
  applyCheckboxDefaults(filterType, values) {
    values.forEach(value => {
      // Find checkbox with matching value
      const checkbox = document.querySelector(`input[data-filter="${filterType}"][value="${value}"]`);
      if (checkbox && !checkbox.checked) {
        checkbox.checked = true;

        // Trigger change event to update state and create chips
        const event = new Event('change', { bubbles: true });
        checkbox.dispatchEvent(event);

        
      } else if (!checkbox) {
        
      }
    });
  }

  /**
   * Validate context defaults against available data
   */
  validateContextDefaults(defaults) {
    if (!defaults || !this.data) return defaults;

    const validated = { ...defaults };

    // Validate categories against available data
    if (defaults.categories) {
      const availableCategories = [...new Set(this.data.map(item =>
        item.department || item.category || item.category_name || item.product_category
      ).filter(Boolean))];

      validated.categories = defaults.categories.filter(cat =>
        availableCategories.includes(cat)
      );

      if (validated.categories.length !== defaults.categories.length) {
        
      }
    }

    // Validate deal types against available data
    if (defaults.dealTypes) {
      const availableDealTypes = [...new Set(this.data.map(item =>
        item.deal_type || item.dealType || item.promotion_type || item.offer_type
      ).filter(Boolean))];

      validated.dealTypes = defaults.dealTypes.filter(deal =>
        availableDealTypes.includes(deal)
      );

      if (validated.dealTypes.length !== defaults.dealTypes.length) {
        
      }
    }

    // Validate size classes against available data
    if (defaults.sizeClasses) {
      const availableSizes = [...new Set(this.data.map(item =>
        item.card_size || item.size_class || item.size || item.product_size
      ).filter(Boolean))];

      validated.sizeClasses = defaults.sizeClasses.filter(size =>
        availableSizes.includes(size)
      );

      if (validated.sizeClasses.length !== defaults.sizeClasses.length) {
        
      }
    }

    return validated;
  }

  /**
   * Apply context defaults to Tier 1 Analysis Approach filters
   */
  applyTier1FilterDefaults() {
    if (!this.currentContext) return;

    // Set scope filter
    const scopeFilter = document.getElementById('scope-filter');
    if (scopeFilter && this.currentContext.defaultScope) {
      scopeFilter.value = this.currentContext.defaultScope;
    }

    // Set lens filter
    const lensFilter = document.getElementById('lens-filter');
    if (lensFilter && this.currentContext.defaultLens) {
      lensFilter.value = this.currentContext.defaultLens;
    }

    // Set timeframe based on dashboard context
    const timeframeFilter = document.getElementById('timeframe-filter');
    if (timeframeFilter && this.dashboardContext) {
      if (this.dashboardContext.period === 'ytd') {
        timeframeFilter.value = 'ytd';
      } else if (this.dashboardContext.period.startsWith('w')) {
        timeframeFilter.value = 'current-week';
      } else {
        timeframeFilter.value = 'current-week';
      }
    }

    // Set entity level based on context
    const entityFilter = document.getElementById('entity-filter');
    if (entityFilter) {
      if (this.currentContext.defaultScope === 'category') {
        entityFilter.value = 'category';
      } else if (this.currentContext.defaultScope === 'store') {
        entityFilter.value = 'subbrand';
      } else {
        entityFilter.value = 'promotion';
      }
    }

    // Add event listeners for filter changes
    this.setupTier1FilterListeners();

    // Setup Tier 2 content filters
    this.setupTier2ContentFilters();

    // Initialize filter chips system
    this.initializeFilterChips();
  }

  /**
   * Setup event listeners for Tier 1 filter changes
   */
  setupTier1FilterListeners() {
    const filters = ['scope-filter', 'lens-filter', 'timeframe-filter', 'entity-filter'];

    filters.forEach(filterId => {
      const filterElement = document.getElementById(filterId);
      if (filterElement) {
        filterElement.addEventListener('change', (e) => {
          
          this.updateFilters();
        });
      }
    });
  }

  /**
   * Handle Tier 1 filter changes and update grid accordingly
   */
  handleTier1FilterChange(filterId, value) {
    

    // Store filter state
    if (!this.tier1Filters) {
      this.tier1Filters = {};
    }

    const filterType = filterId.replace('-filter', '');
    const previousValue = this.tier1Filters[filterType];

    // Remove previous chip if it exists
    if (previousValue && previousValue !== value) {
      this.removeFilterChip(filterType, previousValue);
    }

    this.tier1Filters[filterType] = value;

    // Add new filter chip (skip if it's the default/first option)
    const selectElement = document.getElementById(filterId);
    if (selectElement && selectElement.selectedIndex > 0) {
      const selectedOption = selectElement.options[selectElement.selectedIndex];
      this.addFilterChip(filterType, value, selectedOption.text);
    }

    // Update context based on filter changes
    this.updateContextFromFilters();

    // Re-apply data filtering if needed
    if (this.data && this.data.length > 0) {
      this.applyFilters();
      this.render();
    }
  }

  /**
   * Update context description based on current filter selections
   */
  updateContextFromFilters() {
    if (!this.tier1Filters) return;

    const scope = this.tier1Filters.scope || 'promotion';
    const lens = this.tier1Filters.lens || 'performance';
    const timeframe = this.tier1Filters.timeframe || 'current-week';
    const entity = this.tier1Filters.entity || 'promotion';

    // Update context description dynamically
    const description = document.getElementById('context-description');
    if (description) {
      const scopeText = scope.charAt(0).toUpperCase() + scope.slice(1);
      const lensText = lens.charAt(0).toUpperCase() + lens.slice(1);
      const timeText = timeframe.replace('-', ' ');

      description.textContent = `Analyzing: ${scopeText}-level ${lensText.toLowerCase()} metrics for ${timeText}`;
    }

    // Update source name if needed
    const sourceName = document.getElementById('source-name');
    if (sourceName && this.tier1Filters.scope !== this.currentContext.defaultScope) {
      const newName = `${this.currentContext.name} (${scope.charAt(0).toUpperCase() + scope.slice(1)})`;
      sourceName.textContent = newName;
    }
  }

  /**
   * Master filter update function - coordinates all filter interactions
   * Collects filter values, applies to data, updates grid, URL params, and counts
   */
  updateFilters() {
    

    try {
      // 1. Collect all Tier 1 filter values
      this.collectTier1Filters();

      // 2. Update context based on Tier 1 changes
      this.updateContextFromFilters();

      // 3. Update filter chips for Tier 1 changes
      this.updateTier1FilterChips();

      // 4. Apply all filters to data
      if (this.data && this.data.length > 0) {
        this.applyFilters();
        this.render();
      }

      // 5. Update URL parameters to preserve state
      this.updateURLParameters();

      // 6. Update dynamic filter counts
      this.updateDynamicFilterCounts();

      

    } catch (error) {
      console.error('❌ Error in updateFilters():', error);
    }
  }

  /**
   * Collect current Tier 1 filter values
   */
  collectTier1Filters() {
    if (!this.tier1Filters) {
      this.tier1Filters = {};
    }

    const filters = ['scope-filter', 'lens-filter', 'timeframe-filter', 'entity-filter'];

    filters.forEach(filterId => {
      const filterElement = document.getElementById(filterId);
      if (filterElement) {
        const filterType = filterId.replace('-filter', '');
        const value = filterElement.value;
        const previousValue = this.tier1Filters[filterType];

        // Remove previous chip if value changed
        if (previousValue && previousValue !== value) {
          this.removeFilterChip(filterType, previousValue);
        }

        this.tier1Filters[filterType] = value;
      }
    });
  }

  /**
   * Update Tier 1 filter chips based on current selections
   */
  updateTier1FilterChips() {
    const filters = ['scope-filter', 'lens-filter', 'timeframe-filter', 'entity-filter'];

    filters.forEach(filterId => {
      const filterElement = document.getElementById(filterId);
      if (filterElement && filterElement.selectedIndex > 0) {
        const filterType = filterId.replace('-filter', '');
        const value = filterElement.value;
        const selectedOption = filterElement.options[filterElement.selectedIndex];

        // Only add chip if it's not already there
        const existingChip = this.activeFilters.find(filter =>
          filter.type === filterType && filter.value === value
        );

        if (!existingChip) {
          this.addFilterChip(filterType, value, selectedOption.text);
        }
      }
    });
  }

  /**
   * Update URL parameters to preserve filter state
   */
  updateURLParameters() {
    try {
      const url = new URL(window.location);

      // Clear existing filter parameters to avoid stale data
      const filterParams = ['scope', 'lens', 'timeframe', 'entity', 'categories', 'dealTypes', 'sizeClasses', 'positionRanges'];
      filterParams.forEach(param => {
        url.searchParams.delete(param);
        url.searchParams.delete(`${param}_count`);
      });

      // Add Tier 1 filters to URL
      if (this.tier1Filters) {
        Object.entries(this.tier1Filters).forEach(([key, value]) => {
          if (value && value !== '') {
            url.searchParams.set(key, value);
          }
        });
      }

      // Add Tier 2 filter values to URL (comma-separated)
      if (this.tier2Filters) {
        Object.entries(this.tier2Filters).forEach(([key, filterSet]) => {
          if (filterSet.size > 0) {
            const values = Array.from(filterSet).join(',');
            url.searchParams.set(key, values);
          }
        });
      }

      // Add sort and page state if available
      if (this.sortConfig?.field) {
        url.searchParams.set('sort', this.sortConfig.field);
        url.searchParams.set('sortDir', this.sortConfig.direction);
      }

      if (this.currentPage > 1) {
        url.searchParams.set('page', this.currentPage.toString());
      } else {
        url.searchParams.delete('page');
      }

      // Update URL without page reload and add to history for back/forward navigation
      window.history.replaceState({
        filters: {
          tier1: { ...this.tier1Filters },
          tier2: this.tier2Filters ? Object.fromEntries(
            Object.entries(this.tier2Filters).map(([k, v]) => [k, Array.from(v)])
          ) : {},
          sort: this.sortConfig,
          page: this.currentPage
        }
      }, '', url);

      

    } catch (error) {
      console.error('❌ Error updating URL parameters:', error);
    }
  }

  /**
   * Restore filter state from URL parameters on page load
   */
  restoreFiltersFromURL() {
    try {
      const urlParams = new URLSearchParams(window.location.search);

      // Restore Tier 1 filters
      if (!this.tier1Filters) {
        this.tier1Filters = {};
      }

      const tier1FilterNames = ['scope', 'lens', 'timeframe', 'entity'];
      tier1FilterNames.forEach(filterName => {
        const value = urlParams.get(filterName);
        if (value) {
          this.tier1Filters[filterName] = value;

          // Update the corresponding UI element
          const filterElement = document.getElementById(`${filterName}-filter`);
          if (filterElement) {
            filterElement.value = value;
          }
        }
      });

      // Restore Tier 2 filters
      if (!this.tier2Filters) {
        this.tier2Filters = {
          categories: new Set(),
          dealTypes: new Set(),
          sizeClasses: new Set(),
          positionRanges: new Set()
        };
      }

      const tier2FilterNames = ['categories', 'dealTypes', 'sizeClasses', 'positionRanges'];
      tier2FilterNames.forEach(filterName => {
        const value = urlParams.get(filterName);
        if (value) {
          // Parse comma-separated values
          const values = value.split(',').filter(v => v.trim() !== '');
          values.forEach(v => this.tier2Filters[filterName].add(v.trim()));
        }
      });

      // Restore sort configuration
      const sortField = urlParams.get('sort');
      const sortDir = urlParams.get('sortDir');
      if (sortField) {
        this.sortConfig.field = sortField;
        this.sortConfig.direction = sortDir || 'asc';
      }

      // Restore page number
      const page = urlParams.get('page');
      if (page) {
        this.currentPage = parseInt(page, 10) || 1;
      }

      this._log('🔄 Restored filters from URL:', {
        urlSearch: window.location.search,
        tier1: this.tier1Filters,
        tier2: Object.fromEntries(
          Object.entries(this.tier2Filters).map(([k, v]) => [k, Array.from(v)])
        ),
        sort: this.sortConfig,
        page: this.currentPage
      });

      // Apply restored filters after a short delay to ensure DOM is ready
      setTimeout(() => {
        this.applyRestoredFilters();
      }, 100);

    } catch (error) {
      console.error('❌ Error restoring filters from URL:', error);
    }
  }

  /**
   * Apply restored filters to UI elements and trigger filter updates
   */
  applyRestoredFilters(skipURLUpdate = false) {
    try {
      // Update Tier 1 filter UI elements
      if (this.tier1Filters) {
        Object.entries(this.tier1Filters).forEach(([type, value]) => {
          const filterElement = document.getElementById(`${type}-filter`);
          if (filterElement) {
            filterElement.value = value;
          }
        });
      }

      // Update Tier 2 checkbox states
      // First, uncheck all checkboxes
      const allCheckboxes = document.querySelectorAll('[data-filter]');
      allCheckboxes.forEach(cb => cb.checked = false);

      // Then check the ones that should be checked
      Object.entries(this.tier2Filters).forEach(([filterType, valueSet]) => {
        const filterMapping = {
          categories: 'category',
          dealTypes: 'deal-type',
          sizeClasses: 'size-class',
          positionRanges: 'position-range'
        };

        const dataFilterAttr = filterMapping[filterType];
        if (dataFilterAttr) {
          valueSet.forEach(value => {
            const checkbox = document.querySelector(`input[data-filter="${dataFilterAttr}"][value="${value}"]`);
            if (checkbox) {
              checkbox.checked = true;
            }
          });
        }
      });

      // Update filter chips
      this.updateAllFilterChips();

      // Apply filters to data
      if (this.data && this.data.length > 0) {
        this.applyFilters();
        this.render();
      }

      // Update dynamic filter counts
      this.updateDynamicFilterCounts();

      // Update URL only if not called from browser navigation
      if (!skipURLUpdate) {
        this.updateURLParameters();
      }

      

    } catch (error) {
      console.error('❌ Error applying restored filters:', error);
    }
  }

  /**
   * Update all filter chips based on current filter state
   */
  updateAllFilterChips() {
    // Clear existing chips
    this.activeFilters = [];
    const container = document.getElementById('active-filters');
    if (container) {
      const chips = container.querySelectorAll('.filter-chip');
      chips.forEach(chip => chip.remove());
    }

    // Add Tier 1 chips
    if (this.tier1Filters) {
      Object.entries(this.tier1Filters).forEach(([type, value]) => {
        if (value) {
          const selectElement = document.getElementById(`${type}-filter`);
          if (selectElement) {
            const selectedOption = selectElement.querySelector(`option[value="${value}"]`);
            if (selectedOption && selectElement.selectedIndex > 0) {
              this.addFilterChip(type, value, selectedOption.text);
            }
          }
        }
      });
    }

    // Add Tier 2 chips
    if (this.tier2Filters) {
      Object.entries(this.tier2Filters).forEach(([filterType, valueSet]) => {
        const filterMapping = {
          categories: 'category',
          dealTypes: 'deal-type',
          sizeClasses: 'size-class',
          positionRanges: 'position-range'
        };

        const chipType = filterMapping[filterType];
        if (chipType) {
          valueSet.forEach(value => {
            this.addFilterChip(chipType, value, value);
          });
        }
      });
    }
  }

  /**
   * Apply context-specific column configurations
   */
  applyContextColumnConfig() {
    const context = this.currentContext;
    if (!context) return;

    // Get user preferences for this context type
    const contextKey = this.getContextKey();
    const userPrefs = this.getColumnPreferences(contextKey);

    // Use user preferences if available, otherwise use context defaults
    if (userPrefs && Object.keys(userPrefs).length > 0) {
      
      this.columns.forEach(col => {
        if (userPrefs.hasOwnProperty(col.field)) {
          col.visible = userPrefs[col.field];
        }
      });
    } else if (context.visibleColumns) {
      

      // First, hide all non-required columns
      this.columns.forEach(col => {
        if (!col.required) {
          col.visible = false;
        }
      });

      // Then show the columns specified for this context
      context.visibleColumns.forEach(fieldName => {
        const column = this.columns.find(col => col.field === fieldName);
        if (column) {
          column.visible = true;
        }
      });
    }

    this._log(`✅ Column configuration applied for ${contextKey}:`,
      this.columns.filter(col => col.visible).map(col => col.field)
    );
  }

  /**
   * Get context key for preferences storage
   */
  getContextKey() {
    if (!this.currentContext) return 'default';

    // Use the context map key if available
    const contextMapEntry = Object.entries(this.contextMap).find(
      ([key, ctx]) => ctx === this.currentContext
    );

    return contextMapEntry ? contextMapEntry[0] : 'default';
  }

  /**
   * Get column preferences for a specific context
   */
  getColumnPreferences(contextKey) {
    try {
      const prefKey = `column-preferences-${contextKey}`;
      const prefs = localStorage.getItem(prefKey);
      return prefs ? JSON.parse(prefs) : null;
    } catch (error) {
      console.error('❌ Error loading column preferences:', error);
      return null;
    }
  }

  /**
   * Save column preferences for current context
   */
  saveColumnPreferences() {
    try {
      const contextKey = this.getContextKey();
      const prefKey = `column-preferences-${contextKey}`;

      const preferences = {};
      this.columns.forEach(col => {
        preferences[col.field] = col.visible;
      });

      localStorage.setItem(prefKey, JSON.stringify(preferences));
      
    } catch (error) {
      console.error('❌ Error saving column preferences:', error);
    }
  }

  /**
   * Reset column preferences for current context to defaults
   */
  resetColumnPreferencesToDefaults() {
    try {
      const contextKey = this.getContextKey();
      const prefKey = `column-preferences-${contextKey}`;

      // Remove stored preferences
      localStorage.removeItem(prefKey);

      // Reapply context defaults
      this.applyContextColumnConfig();
      this.render();

      
    } catch (error) {
      console.error('❌ Error resetting column preferences:', error);
    }
  }

  /**
   * Clear all column preferences for all contexts
   */
  clearAllColumnPreferences() {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('column-preferences-')) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
      

      // Reapply current context defaults
      this.applyContextColumnConfig();
      this.render();
    } catch (error) {
      console.error('❌ Error clearing column preferences:', error);
    }
  }

  /**
   * Update context banner with current context information
   */
  updateContextBanner() {
    const banner = document.getElementById('context-banner');
    const sourceName = document.getElementById('source-name');
    const description = document.getElementById('context-description');

    if (this.currentContext) {
      if (sourceName) {
        sourceName.textContent = this.currentContext.name;
      }
      if (description) {
        description.textContent = `Analyzing: ${this.currentContext.description}`;
      }

    }
  }

  /**
   * Setup Tier 2 content filters with collapse/expand and dynamic generation
   */
  setupTier2ContentFilters() {
    // Initialize tier 2 filter state
    this.tier2Filters = {
      categories: new Set(),
      dealTypes: new Set(),
      sizeClasses: new Set(),
      positionRanges: new Set()
    };

    // Setup collapse/expand functionality
    this.setupCollapsibleFilters();

    // Setup checkbox event listeners
    this.setupTier2FilterListeners();

    // Generate dynamic category checkboxes if data is available
    if (this.data && this.data.length > 0) {
      this.generateCategoryFilters();
    }
  }

  /**
   * Setup collapse/expand functionality for filter groups
   */
  setupCollapsibleFilters() {
    const headers = document.querySelectorAll('.filter-group-header');

    headers.forEach(header => {
      header.addEventListener('click', (e) => {
        const target = header.getAttribute('data-target');
        const filterOptions = document.getElementById(target);
        const expandIcon = header.querySelector('.expand-icon');

        if (filterOptions) {
          const isCollapsed = filterOptions.classList.contains('collapsed');

          if (isCollapsed) {
            // Expand
            filterOptions.classList.remove('collapsed');
            header.setAttribute('aria-expanded', 'true');
            expandIcon.style.transform = 'rotate(180deg)';
          } else {
            // Collapse
            filterOptions.classList.add('collapsed');
            header.setAttribute('aria-expanded', 'false');
            expandIcon.style.transform = 'rotate(0deg)';
          }
        }
      });

      // Set initial aria-expanded state
      header.setAttribute('aria-expanded', 'false');
    });
  }

  /**
   * Setup event listeners for Tier 2 checkbox filters
   */
  setupTier2FilterListeners() {
    // Only setup listeners for static checkboxes (not dynamically generated ones)
    // Dynamic checkboxes get their listeners in createFilterCheckbox()
    const staticCheckboxes = document.querySelectorAll('[data-filter]:not(.dynamic-checkbox)');

    staticCheckboxes.forEach(checkbox => {
      // Remove existing listeners to avoid duplicates
      checkbox.removeEventListener('change', this.handleTier2FilterChange);

      checkbox.addEventListener('change', (e) => {
        this.handleTier2FilterChange(e.target);
      });
    });
  }

  /**
   * Handle Tier 2 filter checkbox changes
   */
  handleTier2FilterChange(checkbox) {
    const filterType = checkbox.getAttribute('data-filter');
    const value = checkbox.value;
    const isChecked = checkbox.checked;

    

    // Update filter state
    const filterKey = this.mapFilterTypeToKey(filterType);
    if (filterKey && this.tier2Filters[filterKey]) {
      if (isChecked) {
        this.tier2Filters[filterKey].add(value);

        // Add filter chip
        const labelElement = checkbox.nextElementSibling?.nextElementSibling;
        const label = labelElement ? labelElement.textContent : value;
        this.addFilterChip(filterType, value, label);
      } else {
        this.tier2Filters[filterKey].delete(value);

        // Remove filter chip
        this.removeFilterChip(filterType, value);
      }

      // Update count display
      this.updateFilterCount(filterType, this.tier2Filters[filterKey].size);

      // Use master updateFilters for consistency
      this.updateFilters();
    }
  }

  /**
   * Map filter type to internal key
   */
  mapFilterTypeToKey(filterType) {
    const mapping = {
      'category': 'categories',
      'deal-type': 'dealTypes',
      'size-class': 'sizeClasses',
      'position-range': 'positionRanges'
    };
    return mapping[filterType];
  }

  /**
   * Update filter count display
   */
  updateFilterCount(filterType, count) {
    const countMapping = {
      'category': 'category-count',
      'deal-type': 'deal-type-count',
      'size-class': 'size-class-count',
      'position-range': 'position-range-count'
    };

    const countElementId = countMapping[filterType];
    const countElement = document.getElementById(countElementId);

    if (countElement) {
      countElement.textContent = `(${count})`;

      // Add visual indication for active filters
      const header = countElement.closest('.filter-group-header');
      if (header) {
        if (count > 0) {
          header.style.background = 'rgba(66, 114, 216, 0.1)';
          header.style.borderColor = 'var(--blue)';
        } else {
          header.style.background = '';
          header.style.borderColor = '';
        }
      }
    }
  }

  /**
   * Populate all dynamic filters from data
   */
  populateAllDynamicFilters() {
    if (!this.data || this.data.length === 0) return;

    this.populateCategoryFilters(this.data);
    this.populateDealTypeFilters(this.data);
    this.populateSizeClassFilters(this.data);

    
  }

  /**
   * Generate dynamic category filter checkboxes from data
   */
  populateCategoryFilters(data) {
    if (!data || data.length === 0) return;

    // Extract unique categories from data with fallback fields
    const categories = [...new Set(data.map(item =>
      item.department || item.category || item.category_name || item.product_category
    ).filter(Boolean))];

    categories.sort();

    const categoryFiltersContainer = document.querySelector('#category-filters .checkbox-list');
    if (!categoryFiltersContainer) return;

    // Clear existing content
    categoryFiltersContainer.innerHTML = '';

    // Generate checkbox for each category with count
    categories.forEach(category => {
      const count = data.filter(item =>
        (item.department || item.category || item.category_name || item.product_category) === category
      ).length;

      const checkboxItem = this.createFilterCheckbox('category', category, `${category} (${count})`, count);
      categoryFiltersContainer.appendChild(checkboxItem);
    });

    
  }

  /**
   * Generate dynamic deal type filter checkboxes from data
   */
  populateDealTypeFilters(data) {
    if (!data || data.length === 0) return;

    // Extract unique deal types from data with fallback fields
    const dealTypes = [...new Set(data.map(item =>
      item.deal_type || item.dealType || item.promotion_type || item.offer_type
    ).filter(Boolean))];

    dealTypes.sort();

    const dealTypeFiltersContainer = document.querySelector('#deal-type-filters .checkbox-list');
    if (!dealTypeFiltersContainer) return;

    // Clear existing static content and populate with dynamic data
    dealTypeFiltersContainer.innerHTML = '';

    // Generate checkbox for each deal type with count
    dealTypes.forEach(dealType => {
      const count = data.filter(item =>
        (item.deal_type || item.dealType || item.promotion_type || item.offer_type) === dealType
      ).length;

      // Format deal type for better display
      const displayName = this.formatDealTypeName(dealType);
      const checkboxItem = this.createFilterCheckbox('deal-type', dealType, `${displayName} (${count})`, count);
      dealTypeFiltersContainer.appendChild(checkboxItem);
    });

    
  }

  /**
   * Generate dynamic size class filter checkboxes from data
   */
  populateSizeClassFilters(data) {
    if (!data || data.length === 0) return;

    // Extract unique size classes from data with fallback fields
    const sizeClasses = [...new Set(data.map(item =>
      item.card_size || item.size_class || item.size || item.product_size
    ).filter(Boolean))];

    // Custom sort for size classes (S, M, L, XL, etc.)
    sizeClasses.sort(this.compareSizeClasses);

    const sizeClassFiltersContainer = document.querySelector('#size-class-filters .checkbox-list');
    if (!sizeClassFiltersContainer) return;

    // Clear existing static content and populate with dynamic data
    sizeClassFiltersContainer.innerHTML = '';

    // Generate checkbox for each size class with count
    sizeClasses.forEach(sizeClass => {
      const count = data.filter(item =>
        (item.card_size || item.size_class || item.size || item.product_size) === sizeClass
      ).length;

      // Format size class for better display
      const displayName = this.formatSizeClassName(sizeClass);
      const checkboxItem = this.createFilterCheckbox('size-class', sizeClass, `${displayName} (${count})`, count);
      sizeClassFiltersContainer.appendChild(checkboxItem);
    });

    
  }

  /**
   * Create a standardized filter checkbox element
   */
  createFilterCheckbox(filterType, value, label, count = 0) {
    const checkboxItem = document.createElement('label');
    checkboxItem.className = 'checkbox-item';
    checkboxItem.setAttribute('data-count', count);

    // Escape values for safe HTML
    const safeValue = value.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const safeLabel = label.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    checkboxItem.innerHTML = `
      <input type="checkbox" value="${safeValue}" data-filter="${filterType}" class="dynamic-checkbox">
      <span class="checkmark"></span>
      <span class="label-text">${safeLabel}</span>
    `;

    // Add event listener to new checkbox
    const checkbox = checkboxItem.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', (e) => {
      this.handleTier2FilterChange(e.target);
    });

    return checkboxItem;
  }

  /**
   * Format deal type names for better display
   */
  formatDealTypeName(dealType) {
    const formatMap = {
      'bogo': 'Buy One Get One',
      'discount': 'Percentage Discount',
      'fixed_price': 'Fixed Price',
      'fixed-price': 'Fixed Price',
      'premium': 'Premium Offer',
      'coupon': 'Coupon Discount',
      'clearance': 'Clearance Sale'
    };

    return formatMap[dealType.toLowerCase()] || dealType;
  }

  /**
   * Format size class names for better display
   */
  formatSizeClassName(sizeClass) {
    const formatMap = {
      'S': 'Small (S)',
      'M': 'Medium (M)',
      'L': 'Large (L)',
      'XL': 'Extra Large (XL)',
      'XXL': 'Extra Extra Large (XXL)',
      'small': 'Small',
      'medium': 'Medium',
      'large': 'Large',
      'extra_large': 'Extra Large',
      'xs': 'Extra Small (XS)'
    };

    return formatMap[sizeClass] || sizeClass;
  }

  /**
   * Custom comparator for size classes
   */
  compareSizeClasses(a, b) {
    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
    const indexA = sizeOrder.indexOf(a.toUpperCase());
    const indexB = sizeOrder.indexOf(b.toUpperCase());

    // If both are in the standard order, use that
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }

    // If only one is in standard order, prioritize it
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;

    // Otherwise, use alphabetical order
    return a.localeCompare(b);
  }

  /**
   * Update filter counts based on currently filtered data
   */
  updateDynamicFilterCounts() {
    if (!this.filteredData || this.filteredData.length === 0) return;

    this.updateCategoryFilterCounts(this.filteredData);
    this.updateDealTypeFilterCounts(this.filteredData);
    this.updateSizeClassFilterCounts(this.filteredData);
  }

  /**
   * Update category filter counts
   */
  updateCategoryFilterCounts(data) {
    const checkboxes = document.querySelectorAll('#category-filters input[data-filter="category"]');

    checkboxes.forEach(checkbox => {
      const value = checkbox.value;
      const count = data.filter(item =>
        (item.department || item.category || item.category_name || item.product_category) === value
      ).length;

      const labelElement = checkbox.parentElement.querySelector('.label-text');
      if (labelElement) {
        const baseLabel = value;
        labelElement.textContent = `${baseLabel} (${count})`;

        // Disable if no matches
        checkbox.disabled = count === 0;
        checkbox.parentElement.style.opacity = count === 0 ? '0.5' : '1';
      }
    });
  }

  /**
   * Update deal type filter counts
   */
  updateDealTypeFilterCounts(data) {
    const checkboxes = document.querySelectorAll('#deal-type-filters input[data-filter="deal-type"]');

    checkboxes.forEach(checkbox => {
      const value = checkbox.value;
      const count = data.filter(item =>
        (item.deal_type || item.dealType || item.promotion_type || item.offer_type) === value
      ).length;

      const labelElement = checkbox.parentElement.querySelector('.label-text');
      if (labelElement) {
        const displayName = this.formatDealTypeName(value);
        labelElement.textContent = `${displayName} (${count})`;

        // Disable if no matches
        checkbox.disabled = count === 0;
        checkbox.parentElement.style.opacity = count === 0 ? '0.5' : '1';
      }
    });
  }

  /**
   * Update size class filter counts
   */
  updateSizeClassFilterCounts(data) {
    const checkboxes = document.querySelectorAll('#size-class-filters input[data-filter="size-class"]');

    checkboxes.forEach(checkbox => {
      const value = checkbox.value;
      const count = data.filter(item =>
        (item.card_size || item.size_class || item.size || item.product_size) === value
      ).length;

      const labelElement = checkbox.parentElement.querySelector('.label-text');
      if (labelElement) {
        const displayName = this.formatSizeClassName(value);
        labelElement.textContent = `${displayName} (${count})`;

        // Disable if no matches
        checkbox.disabled = count === 0;
        checkbox.parentElement.style.opacity = count === 0 ? '0.5' : '1';
      }
    });
  }

  /**
   * Legacy method name for backward compatibility
   */
  generateCategoryFilters() {
    this.populateAllDynamicFilters();
  }

  /**
   * Initialize filter chips system
   */
  initializeFilterChips() {
    // Track active filters for chip display
    this.activeFilters = [];

    // Create clear all button container
    this.createClearAllButton();
  }

  /**
   * Add a filter chip to the display
   * @param {string} type - Filter type (scope, lens, category, deal-type, etc.)
   * @param {string} value - Filter value
   * @param {string} label - Display label for the chip
   */
  addFilterChip(type, value, label) {
    // Check if chip already exists
    const existingChip = this.activeFilters.find(filter =>
      filter.type === type && filter.value === value
    );

    if (existingChip) {
      
      return;
    }

    // Create filter object
    const filter = { type, value, label };
    this.activeFilters.push(filter);

    // Generate chip HTML
    const chipId = `chip-${type}-${value}`.replace(/[^a-zA-Z0-9-]/g, '-');
    const chipElement = document.createElement('div');
    chipElement.className = 'filter-chip';
    chipElement.id = chipId;
    chipElement.setAttribute('data-type', type);
    chipElement.setAttribute('data-value', value);

    // Format type display name
    const typeDisplay = this.formatFilterType(type);

    chipElement.innerHTML = `
      <span class="filter-chip-type">${typeDisplay}</span>
      <span class="filter-chip-label">${label}</span>
      <button class="filter-chip-remove" onclick="window.grid.removeFilterChip('${type}', '${value}')" title="Remove filter">
        ×
      </button>
    `;

    // Add to container
    const container = document.getElementById('active-filters');
    if (container) {
      // Insert before clear all button if it exists
      const clearAllButton = container.querySelector('.clear-all-filters');
      if (clearAllButton) {
        container.insertBefore(chipElement, clearAllButton);
      } else {
        container.appendChild(chipElement);
      }

      // Show clear all button if not visible
      this.updateClearAllButton();
    }

    
  }

  /**
   * Remove a filter chip from the display
   * @param {string} type - Filter type
   * @param {string} value - Filter value
   */
  removeFilterChip(type, value) {
    // Find and remove from activeFilters array
    const filterIndex = this.activeFilters.findIndex(filter =>
      filter.type === type && filter.value === value
    );

    if (filterIndex === -1) {
      
      return;
    }

    this.activeFilters.splice(filterIndex, 1);

    // Find and remove chip element with animation
    const chipId = `chip-${type}-${value}`.replace(/[^a-zA-Z0-9-]/g, '-');
    const chipElement = document.getElementById(chipId);

    if (chipElement) {
      // Add removing animation
      chipElement.classList.add('removing');

      // Remove after animation completes
      setTimeout(() => {
        if (chipElement.parentNode) {
          chipElement.parentNode.removeChild(chipElement);
        }
      }, 200);
    }

    // Update the corresponding filter control
    this.syncFilterControl(type, value, false);

    // Update clear all button visibility
    this.updateClearAllButton();

    // Use master updateFilters for consistency
    this.updateFilters();

    
  }

  /**
   * Remove all filter chips
   */
  clearAllFilters() {
    

    // Reset all filter states first
    this.resetAllFilterStates();

    // Clear activeFilters array
    this.activeFilters = [];

    // Remove all chip elements
    const container = document.getElementById('active-filters');
    if (container) {
      const chips = container.querySelectorAll('.filter-chip');
      chips.forEach(chip => {
        chip.classList.add('removing');
        setTimeout(() => {
          if (chip.parentNode) {
            chip.parentNode.removeChild(chip);
          }
        }, 200);
      });
    }

    // Update clear all button visibility
    this.updateClearAllButton();

    // Use master updateFilters to refresh everything
    this.updateFilters();

    
  }

  /**
   * Sync filter control state when chip is removed
   */
  syncFilterControl(type, value, checked) {
    if (type === 'scope' || type === 'lens' || type === 'timeframe' || type === 'entity') {
      // Handle Tier 1 select dropdowns
      const selectElement = document.getElementById(`${type}-filter`);
      if (selectElement && !checked) {
        // Reset to default value
        selectElement.selectedIndex = 0;
      }
    } else {
      // Handle Tier 2 checkboxes
      const checkbox = document.querySelector(`input[data-filter="${type}"][value="${value}"]`);
      if (checkbox) {
        checkbox.checked = checked;

        // Update count and visual state
        const filterKey = this.mapFilterTypeToKey(type);
        if (filterKey && this.tier2Filters[filterKey]) {
          if (checked) {
            this.tier2Filters[filterKey].add(value);
          } else {
            this.tier2Filters[filterKey].delete(value);
          }
          this.updateFilterCount(type, this.tier2Filters[filterKey].size);
        }
      }
    }
  }

  /**
   * Reset all filter states to defaults
   */
  resetAllFilterStates() {
    // Reset Tier 1 filters
    ['scope-filter', 'lens-filter', 'timeframe-filter', 'entity-filter'].forEach(id => {
      const element = document.getElementById(id);
      if (element) element.selectedIndex = 0;
    });

    // Reset Tier 2 filters
    const checkboxes = document.querySelectorAll('[data-filter]');
    checkboxes.forEach(checkbox => {
      checkbox.checked = false;
    });

    // Reset filter state objects
    if (this.tier1Filters) {
      this.tier1Filters = {};
    }
    if (this.tier2Filters) {
      Object.keys(this.tier2Filters).forEach(key => {
        this.tier2Filters[key].clear();
      });
    }

    // Update all counts
    ['category', 'deal-type', 'size-class', 'position-range'].forEach(type => {
      this.updateFilterCount(type, 0);
    });
  }

  /**
   * Format filter type for display
   */
  formatFilterType(type) {
    const typeMap = {
      'scope': 'Scope',
      'lens': 'Lens',
      'timeframe': 'Time',
      'entity': 'Entity',
      'category': 'Category',
      'deal-type': 'Deal',
      'size-class': 'Size',
      'position-range': 'Position'
    };
    return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
  }

  /**
   * Create and manage clear all button
   */
  createClearAllButton() {
    const container = document.getElementById('active-filters');
    if (!container) return;

    const clearAllButton = document.createElement('button');
    clearAllButton.className = 'clear-all-filters';
    clearAllButton.style.display = 'none';
    clearAllButton.innerHTML = 'Clear All';
    clearAllButton.onclick = () => this.clearAllFilters();

    container.appendChild(clearAllButton);
  }

  /**
   * Update clear all button visibility
   */
  updateClearAllButton() {
    const container = document.getElementById('active-filters');
    const clearAllButton = container?.querySelector('.clear-all-filters');

    if (clearAllButton) {
      if (this.activeFilters.length > 0) {
        clearAllButton.style.display = 'inline-flex';
      } else {
        clearAllButton.style.display = 'none';
      }
    }
  }

  async loadData(data) {
    try {
      this._setLoading(true);

      // Validate input data
      if (!data) {
        throw new Error('No data provided');
      }

      if (!Array.isArray(data)) {
        throw new Error('Data must be an array');
      }


      // Simulate async loading for demonstration
      await new Promise(resolve => setTimeout(resolve, 500));

      // Validate data structure
      this._validateDataStructure(data);

      this.data = data;
      this.filteredData = [...data];
      this.error = null;

      // Handle empty data gracefully
      if (data.length === 0) {
        console.warn('⚠️ No data items found');
        this._showEmptyState();
        return;
      }

      // Pre-calculate values for performance
      this._precalculateValues();

      this._populateDepartmentFilter();
      this._populateColumnSettings();

      // Generate all dynamic filters now that data is available
      this.populateAllDynamicFilters();

      // Apply pending context defaults now that filters are populated
      setTimeout(() => {
        this.applyPendingContextDefaults();

        // Apply context filtering if context state is available
        if (this.currentContextState) {
          this.applyContextFiltering();
          this.updateGridHeader();
        }

        // Apply initial filters after defaults are set
        this.applyFilters();
        this.render();
      }, 100);

      

      // Clear any previous errors
      if (window.ErrorHandler) {
        window.ErrorHandler.clearErrors();
      }

    } catch (error) {
      this.error = 'Failed to load data';
      console.error('❌ Data loading error:', error);

      // Show user-friendly error with retry option
      if (window.ErrorHandler) {
        window.ErrorHandler.handleDataError(error, 'promotion data', () => {
          this.loadData(data);
        });
      } else {
        // Fallback if error handler not available
        alert(`Error loading data: ${error.message}`);
      }
    } finally {
      this._setLoading(false);
    }
  }

  /**
   * Apply all active filters to the data
   */
  applyFilters() {
    // Use context-filtered data as base if available, otherwise use original data
    const baseData = this.contextFilteredData || this.data;

    if (!baseData || baseData.length === 0) {
      this.filteredData = [];
      return;
    }

    let filtered = [...baseData];

    // If in comparison mode, prepare data for comparison display
    if (this.comparisonMode) {
      filtered = this.prepareComparisonData(filtered);
    }

    // Apply search filter
    if (this.filters.search) {
      const searchTerm = this.filters.search.toLowerCase();
      filtered = filtered.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchTerm)
        )
      );
    }

    // Apply department filter (legacy)
    if (this.filters.department) {
      filtered = filtered.filter(item =>
        (item.department || item.category || '').toLowerCase().includes(this.filters.department.toLowerCase())
      );
    }

    // Apply Tier 2 content filters
    if (this.tier2Filters) {
      // Apply category filters
      if (this.tier2Filters.categories && this.tier2Filters.categories.size > 0) {
        filtered = filtered.filter(item => {
          const itemCategory = item.department || item.category || item.category_name || item.product_category;
          return this.tier2Filters.categories.has(itemCategory);
        });
      }

      // Apply deal type filters
      if (this.tier2Filters.dealTypes && this.tier2Filters.dealTypes.size > 0) {
        filtered = filtered.filter(item => {
          const itemDealType = item.deal_type || item.dealType || item.promotion_type || item.offer_type;
          return this.tier2Filters.dealTypes.has(itemDealType);
        });
      }

      // Apply size class filters
      if (this.tier2Filters.sizeClasses && this.tier2Filters.sizeClasses.size > 0) {
        filtered = filtered.filter(item => {
          const itemSizeClass = item.card_size || item.size_class || item.size || item.product_size;
          return this.tier2Filters.sizeClasses.has(itemSizeClass);
        });
      }

      // Apply position range filters
      if (this.tier2Filters.positionRanges && this.tier2Filters.positionRanges.size > 0) {
        filtered = filtered.filter(item => {
          const itemPosition = item.position_range || item.position || item.card_position;
          return this.tier2Filters.positionRanges.has(itemPosition);
        });
      }
    }

    // Apply sorting
    if (this.sortConfig.field) {
      filtered.sort((a, b) => {
        const aVal = a[this.sortConfig.field];
        const bVal = b[this.sortConfig.field];

        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;

        const multiplier = this.sortConfig.direction === 'desc' ? -1 : 1;

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return (aVal - bVal) * multiplier;
        }

        return String(aVal).localeCompare(String(bVal)) * multiplier;
      });
    }

    this.filteredData = filtered;

    // Update dynamic filter counts based on filtered results
    this.updateDynamicFilterCounts();

    
  }

  render() {
    // Show loading state
    if (this.isLoading) {
      this.container.innerHTML = this._renderLoadingState();
      return;
    }

    // Show error state
    if (this.error) {
      this.container.innerHTML = this._renderErrorState();
      return;
    }

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const currentPageData = this.filteredData.slice(startIndex, endIndex);
    const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
    const resultCount = `Showing ${this.filteredData.length} of ${this.data.length} items`;
    const selectionCount = this.selectedItems.size > 0 ? ` | ${this.selectedItems.size} items selected` : '';

    // Update export button state
    this._updateExportButton();
    this._updateGenerateReportButton();

    const visibleColumns = this.columns.filter(col => col.visible);

    // Calculate virtual scrolling dimensions
    this.totalHeight = this.filteredData.length * this.rowHeight;
    const virtualRange = this._getVisibleRange();
    const virtualData = this.filteredData.slice(virtualRange.startIndex, virtualRange.endIndex);

    const tableHTML = `
      <div class="virtual-scroll-viewport" style="height: ${this.viewportHeight}px; overflow-y: auto; will-change: transform;">
        <div class="virtual-scroll-container" style="height: ${this.totalHeight}px; position: relative;">
          <!-- Top spacer -->
          <div class="virtual-spacer-top" style="height: ${virtualRange.topSpacerHeight}px;"></div>

          <!-- Visible rows -->
          <table class="dashboard-table virtual-table">
            <thead>
              <tr>
                ${visibleColumns.map(column => {
                  if (column.type === 'checkbox') {
                    return `
                      <th style="width: ${column.width}px">
                        <input type="checkbox" id="select-all-checkbox" ${this._isAllSelected() ? 'checked' : ''}>
                      </th>
                    `;
                  } else {
                    const sortIndicator = this._getSortIndicator(column.field);
                    return `
                      <th style="width: ${column.width}px; cursor: pointer" data-field="${column.field}">
                        ${column.label} ${sortIndicator}
                      </th>
                    `;
                  }
                }).join('')}
              </tr>
            </thead>
            <tbody id="virtual-tbody">
              ${this._renderRowsHTML(virtualData, visibleColumns)}
            </tbody>
          </table>

          <!-- Bottom spacer -->
          <div class="virtual-spacer-bottom" style="height: ${virtualRange.bottomSpacerHeight}px;"></div>
        </div>
      </div>

      <div class="pagination-controls">
        <div class="pagination-left">
          <button id="prev-btn" ${this.currentPage === 1 ? 'disabled' : ''}>Previous</button>
          <button id="next-btn" ${this.currentPage === totalPages ? 'disabled' : ''}>Next</button>
        </div>
        <div class="pagination-center">
          <span>Page ${this.currentPage} of ${totalPages} | ${resultCount}${selectionCount}</span>
        </div>
        <div class="pagination-right">
          <label for="page-size-select">Items per page:</label>
          <select id="page-size-select">
            <option value="25" ${this.pageSize === 25 ? 'selected' : ''}>25</option>
            <option value="50" ${this.pageSize === 50 ? 'selected' : ''}>50</option>
            <option value="100" ${this.pageSize === 100 ? 'selected' : ''}>100</option>
          </select>
        </div>
      </div>
    `;

    this.container.innerHTML = tableHTML;
    this._attachEventListeners();
    this._updateInteractionState();
    this._setupVirtualScrolling();
  }

  _calculateCTR(item) {
    return ((item.card_clicked / item.card_in_view) * 100).toFixed(1);
  }

  _getColumnValue(item, column) {
    if (column.calculated && column.field === 'ctr') {
      return this._calculateCTR(item) + '%';
    }
    return item[column.field];
  }

  nextPage() {
    const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
    if (this.currentPage < totalPages) {
      this.currentPage++;
      this.render();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.render();
    }
  }

  changePageSize(size) {
    this.pageSize = parseInt(size);
    this.currentPage = 1; // Reset to first page
    this.saveState(); // Auto-save state
    this.render();
  }

  async sortData(field) {
    try {
      this._setLoading(true);

      // Simulate async sorting for large datasets
      if (this.filteredData.length > 100) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // If same field, toggle direction, otherwise set to ascending
      if (this.sortConfig.field === field) {
        this.sortConfig.direction = this.sortConfig.direction === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortConfig.field = field;
        this.sortConfig.direction = 'asc';
      }

      // Sort the filtered data array
      this.filteredData.sort((a, b) => {
        let aValue, bValue;

        // Get values based on field type
        if (field === 'ctr') {
          aValue = parseFloat(this._calculateCTR(a));
          bValue = parseFloat(this._calculateCTR(b));
        } else if (['card_in_view', 'card_clicked', 'composite_score'].includes(field)) {
          aValue = parseFloat(a[field]) || 0;
          bValue = parseFloat(b[field]) || 0;
        } else {
          aValue = (a[field] || '').toString().toLowerCase();
          bValue = (b[field] || '').toString().toLowerCase();
        }

        // Compare values
        let comparison = 0;
        if (aValue > bValue) {
          comparison = 1;
        } else if (aValue < bValue) {
          comparison = -1;
        }

        // Apply direction
        return this.sortConfig.direction === 'desc' ? comparison * -1 : comparison;
      });

      // Reset to first page and re-render
      this.currentPage = 1;
      this.saveState(); // Auto-save state
    } finally {
      this._setLoading(false);
    }
  }

  async filterData() {
    try {
      // Validate filters before processing
      this._validateFilterInput(this.filters.search);
      this._validateFilterInput(this.filters.department);

      // Validate data exists
      if (!this.data || !Array.isArray(this.data)) {
        throw new Error('Invalid data structure for filtering');
      }

      // Show loading for large datasets
      if (this.data.length > 500) {
        this._setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Start with all data
      this.filteredData = this.data.filter(item => {
        try {
          // Validate item structure
          if (!item || typeof item !== 'object') {
            console.warn('⚠️ Invalid item found during filtering:', item);
            return false;
          }

          // Ensure required fields exist
          if (!item.card_name || !item.department) {
            console.warn('⚠️ Item missing required fields:', item);
            return false;
          }

          // Search filter - check card_name and department
          const searchTerm = this.filters.search.toLowerCase();
          const matchesSearch = !searchTerm ||
            item.card_name.toLowerCase().includes(searchTerm) ||
            item.department.toLowerCase().includes(searchTerm);

          // Department filter
          const matchesDepartment = !this.filters.department ||
            item.department === this.filters.department;

          return matchesSearch && matchesDepartment;
        } catch (itemError) {
          console.warn('⚠️ Error filtering item:', itemError, item);
          return false;
        }
      });

      // Reset to first page
      this.currentPage = 1;
      this.saveState(); // Auto-save state

      this._log('✅ Filter operation completed:', {
        totalItems: this.data.length,
        filteredItems: this.filteredData.length,
        filters: this.filters
      });

    } catch (error) {
      console.error('🚨 Error during filter operation:', error);

      if (window.ErrorHandler) {
        window.ErrorHandler.handleDataError(error, 'filter operation', () => {
          // Reset filters and retry
          this.filters = { search: '', department: '' };
          this.filterData();
        });
      } else {
        console.error('ErrorHandler not available, showing fallback error');
        alert('Error filtering data. Please try refreshing the page.');
      }
    } finally {
      if (this.data.length > 500) {
        this._setLoading(false);
      } else {
        this.render();
      }
    }
  }

  _populateDepartmentFilter() {
    const deptFilter = document.getElementById('dept-filter');
    if (!deptFilter) return;

    // Extract unique departments from data
    const departments = [...new Set(this.data.map(item => item.department))]
      .filter(dept => dept) // Remove any null/undefined values
      .sort(); // Sort alphabetically

    // Clear existing options except "All Departments"
    deptFilter.innerHTML = '<option value="">All Departments</option>';

    // Add department options
    departments.forEach(dept => {
      const option = document.createElement('option');
      option.value = dept;
      option.textContent = dept.charAt(0).toUpperCase() + dept.slice(1); // Capitalize first letter
      deptFilter.appendChild(option);
    });
  }

  clearFilters() {
    // Reset filter values
    this.filters.search = '';
    this.filters.department = '';

    // Reset UI elements
    const searchBox = document.getElementById('search-box');
    const deptFilter = document.getElementById('dept-filter');

    if (searchBox) {
      searchBox.value = '';
    }

    if (deptFilter) {
      deptFilter.value = '';
    }

    // Apply filters (which will show all data)
    this.filterData();
    this.saveState(); // Auto-save state
  }

  toggleSelection(id) {
    if (this.selectedItems.has(id)) {
      this.selectedItems.delete(id);
    } else {
      this.selectedItems.add(id);
    }
    this.render();
  }

  selectAll() {
    // Select all items in current filtered data
    this.filteredData.forEach(item => {
      this.selectedItems.add(item.card_id);
    });
    this.render();
  }

  clearSelection() {
    this.selectedItems.clear();
    this.render();
  }

  _isAllSelected() {
    if (this.filteredData.length === 0) return false;
    return this.filteredData.every(item => this.selectedItems.has(item.card_id));
  }

  exportToCSV() {
    try {
      

      // Validate data exists
      if (!this.filteredData || !Array.isArray(this.filteredData)) {
        throw new Error('No filtered data available for export');
      }

      // Get items to export - selected items or all filtered data if none selected
      const itemsToExport = this.selectedItems.size > 0
        ? this.filteredData.filter(item => {
            try {
              return this.selectedItems.has(item.card_id);
            } catch (filterError) {
              console.warn('⚠️ Error checking selected item:', filterError, item);
              return false;
            }
          })
        : this.filteredData;

      // Handle empty data gracefully
      if (itemsToExport.length === 0) {
        if (window.ErrorHandler) {
          window.ErrorHandler.showError(
            'No data available to export. Please check your filters or selection.',
            'error-container',
            { type: 'warning', timeout: 5000 }
          );
        } else {
          alert('No data to export');
        }
        return;
      }

      // Validate columns exist
      if (!this.columns || !Array.isArray(this.columns)) {
        throw new Error('Column configuration is invalid');
      }

      // Create CSV headers (exclude checkbox column and only include visible columns)
      const dataColumns = this.columns.filter(col => {
        try {
          return col && col.type !== 'checkbox' && col.visible;
        } catch (colError) {
          console.warn('⚠️ Error processing column:', colError, col);
          return false;
        }
      });

      if (dataColumns.length === 0) {
        throw new Error('No visible columns available for export');
      }

      const headers = dataColumns.map(col => col.label || col.field || 'Unknown').join(',');

      // Create CSV rows
      const rows = itemsToExport.map(item => {
        try {
          return dataColumns.map(col => {
            let value = this._getColumnValue(item, col);
            // Handle null/undefined values
            if (value == null) {
              value = '';
            }
            // Handle values that might contain commas or quotes
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              value = `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',');
        } catch (rowError) {
          console.warn('⚠️ Error processing row:', rowError, item);
          return dataColumns.map(() => '').join(','); // Return empty row on error
        }
      });

      // Combine headers and rows
      const csvContent = [headers, ...rows].join('\n');

      // Generate filename with current date
      const today = new Date();
      const dateString = today.getFullYear() +
                        String(today.getMonth() + 1).padStart(2, '0') +
                        String(today.getDate()).padStart(2, '0');
      const filename = `promotions_${dateString}.csv`;

      // Download the file
      this.downloadCSV(csvContent, filename);

      this._log('✅ CSV export completed successfully:', {
        itemsExported: itemsToExport.length,
        columnsExported: dataColumns.length,
        filename: filename
      });

      // Show success message
      if (window.ErrorHandler) {
        window.ErrorHandler.showError(
          `Successfully exported ${itemsToExport.length} items to ${filename}`,
          'error-container',
          { type: 'success', timeout: 3000 }
        );
      }

    } catch (error) {
      console.error('🚨 Error during CSV export:', error);

      if (window.ErrorHandler) {
        window.ErrorHandler.handleDataError(error, 'CSV export', () => {
          this.exportToCSV();
        });
      } else {
        console.error('ErrorHandler not available, showing fallback error');
        alert('Failed to export data. Please try again.');
      }
    }
  }

  downloadCSV(content, filename) {
    try {
      // Validate inputs
      if (!content || typeof content !== 'string') {
        throw new Error('Invalid CSV content provided');
      }

      if (!filename || typeof filename !== 'string') {
        throw new Error('Invalid filename provided');
      }

      // Create blob with UTF-8 BOM for Excel compatibility
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });

      // Check browser support
      if (!window.URL || !window.URL.createObjectURL) {
        throw new Error('Browser does not support file downloads');
      }

      // Create download link
      const link = document.createElement('a');
      if (link.download === undefined) {
        throw new Error('Browser does not support HTML5 download attribute');
      }

      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      

    } catch (error) {
      console.error('🚨 Error downloading CSV file:', error);

      if (window.ErrorHandler) {
        window.ErrorHandler.logError(error, 'CSV Download');
        window.ErrorHandler.showError(
          'Failed to download CSV file. Your browser may not support file downloads.',
          'error-container',
          { type: 'error', timeout: 7000 }
        );
      } else {
        alert('Failed to download file. Please try a different browser.');
      }

      throw error; // Re-throw to allow calling function to handle
    }
  }

  generateReport() {
    try {
      

      // Validate data exists
      if (!this.filteredData || !Array.isArray(this.filteredData)) {
        throw new Error('No filtered data available for report generation');
      }

      if (!this.data || !Array.isArray(this.data)) {
        throw new Error('No source data available for report generation');
      }

      // Get items to include in report - selected items or all filtered data if none selected
      const itemsToReport = this.selectedItems.size > 0
        ? this.filteredData.filter(item => {
            try {
              return this.selectedItems.has(item.card_id);
            } catch (filterError) {
              console.warn('⚠️ Error checking selected item for report:', filterError, item);
              return false;
            }
          })
        : this.filteredData;

      this._log('📋 Report Data Summary:', {
        selectedItems: this.selectedItems.size,
        filteredData: this.filteredData.length,
        totalData: this.data.length,
        itemsToReport: itemsToReport.length,
        currentFilters: this.filters,
        currentSort: this.sortConfig
      });

      // Handle empty data gracefully
      if (itemsToReport.length === 0) {
        console.warn('⚠️ No data available for report generation');

        if (window.ErrorHandler) {
          window.ErrorHandler.showError(
            'No data available for report generation. Please check your filters or selection.',
            'error-container',
            {
              type: 'warning',
              timeout: 5000,
              showRetry: true,
              retryCallback: () => {
                // Clear filters and try again
                this.clearFilters();
                setTimeout(() => this.generateReport(), 500);
              }
            }
          );
        } else {
          alert('No data to generate report from');
        }
        return;
      }

      // Validate required objects exist
      if (!this.filters) {
        this.filters = { search: '', department: '' };
      }

      if (!this.sortConfig) {
        this.sortConfig = { field: '', direction: 'asc' };
      }

      // Build URL parameters with validation
      const params = new URLSearchParams();

      try {
        // Add selected item IDs if any are selected
        if (this.selectedItems.size > 0) {
          const selectedIds = Array.from(this.selectedItems);
          // Validate all IDs are strings/numbers
          const validIds = selectedIds.filter(id => id != null && id !== '');
          if (validIds.length > 0) {
            params.set('selected', validIds.join(','));
          }
        }

        // Add active filters with validation
        if (this.filters.search && typeof this.filters.search === 'string') {
          // Sanitize search input for URL
          const sanitizedSearch = this.filters.search.trim().substring(0, 200);
          if (sanitizedSearch) {
            params.set('search', sanitizedSearch);
          }
        }

        if (this.filters.department && typeof this.filters.department === 'string') {
          params.set('department', this.filters.department);
        }

        // Add sort configuration with validation
        if (this.sortConfig.field && typeof this.sortConfig.field === 'string') {
          params.set('sortField', this.sortConfig.field);
          params.set('sortDirection', this.sortConfig.direction || 'asc');
        }

        // Add page size with validation
        const validPageSize = Number.isInteger(this.pageSize) && this.pageSize > 0
          ? this.pageSize : 25;
        params.set('pageSize', validPageSize.toString());

        // Add data count for context
        params.set('totalItems', this.filteredData.length.toString());
        params.set('source', 'datagrid');

        // Pre-select template based on selection
        if (this.selectedItems.size > 0) {
          params.set('template', 'custom');
        } else {
          params.set('template', 'category');
        }

      } catch (paramError) {
        console.warn('⚠️ Error building URL parameters:', paramError);
        // Continue with basic parameters
        params.set('source', 'datagrid');
        params.set('template', 'category');
      }

      // Validate navigation target
      const reportsUrl = `../reports.html?${params.toString()}`;

      if (!reportsUrl || typeof reportsUrl !== 'string') {
        throw new Error('Invalid reports URL generated');
      }

      this._log('🔗 Datagrid → Reports Navigation:', {
        selectedTemplate: this.selectedItems.size > 0 ? 'custom' : 'category',
        paramsString: params.toString(),
        fullURL: reportsUrl
      });

      // Navigate with error handling
      try {
        window.location.href = reportsUrl;
      } catch (navError) {
        throw new Error(`Navigation failed: ${navError.message}`);
      }

    } catch (error) {
      console.error('🚨 Error during report generation:', error);

      if (window.ErrorHandler) {
        window.ErrorHandler.handleNavigationError(error, '../reports.html');
      } else {
        console.error('ErrorHandler not available, showing fallback error');
        alert('Failed to generate report. Please try again or contact support.');
      }
    }
  }

  /**
   * Validate data structure
   * @param {Array} data - Data to validate
   */
  _validateDataStructure(data) {
    if (data.length === 0) {
      return; // Empty data is valid
    }

    const requiredFields = ['card_id', 'card_name'];
    const sampleItem = data[0];

    for (const field of requiredFields) {
      if (!(field in sampleItem)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate data types
    const invalidItems = data.filter(item =>
      typeof item.card_id !== 'string' ||
      typeof item.card_name !== 'string'
    );

    if (invalidItems.length > 0) {
      throw new Error(`Invalid data format found in ${invalidItems.length} items`);
    }

    
  }

  /**
   * Show empty state when no data is available
   */
  _showEmptyState() {
    const emptyStateHTML = `
      <div class="empty-state" style="text-align: center; padding: 60px 20px; color: var(--muted);">
        <div style="font-size: 48px; margin-bottom: 16px;">📭</div>
        <h3 style="margin-bottom: 8px; color: var(--text);">No Data Available</h3>
        <p style="margin-bottom: 20px;">There are no promotions to display at this time.</p>
        <button class="btn btn-primary" onclick="window.location.reload()">
          Refresh Page
        </button>
      </div>
    `;

    this.container.innerHTML = emptyStateHTML;
  }

  /**
   * Validate filter input
   * @param {string} value - Filter value
   * @param {string} type - Filter type
   */
  _validateFilterInput(value, type) {
    try {
      if (type === 'search') {
        // Sanitize search input
        if (typeof value !== 'string') {
          throw new Error('Search value must be a string');
        }

        if (value.length > 100) {
          throw new Error('Search term too long (max 100 characters)');
        }

        // Check for potentially harmful patterns
        const dangerousPatterns = /<script|javascript:|data:|vbscript:/i;
        if (dangerousPatterns.test(value)) {
          throw new Error('Invalid characters in search term');
        }
      }

      if (type === 'department') {
        const validDepartments = ['', 'deli', 'bakery', 'produce', 'meat', 'dairy', 'frozen'];
        if (!validDepartments.includes(value)) {
          throw new Error(`Invalid department: ${value}`);
        }
      }

      return true;

    } catch (error) {
      if (window.ErrorHandler) {
        window.ErrorHandler.handleValidationError(`${type}-filter`, error.message);
      }
      return false;
    }
  }

  _updateExportButton() {
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
      // Enable button if there's data to export
      exportBtn.disabled = this.filteredData.length === 0;

      // Update button text based on selection
      if (this.selectedItems.size > 0) {
        exportBtn.textContent = `Export Selected (${this.selectedItems.size})`;
      } else {
        exportBtn.textContent = 'Export All';
      }
    }
  }

  _updateGenerateReportButton() {
    const reportBtn = document.getElementById('generate-report-btn');
    if (reportBtn) {
      // Enable button if there's data to report on
      reportBtn.disabled = this.filteredData.length === 0;

      // Update button text based on selection
      if (this.selectedItems.size > 0) {
        reportBtn.textContent = `Report Selected (${this.selectedItems.size})`;
      } else {
        reportBtn.textContent = 'Generate Report';
      }
    }
  }

  _populateColumnSettings() {
    const checkboxContainer = document.getElementById('column-checkboxes');
    if (!checkboxContainer) return;

    checkboxContainer.innerHTML = '';

    // Only show toggleable columns (exclude checkbox and required columns)
    const toggleableColumns = this.columns.filter(col => col.type !== 'checkbox' && !col.required);

    toggleableColumns.forEach(column => {
      const label = document.createElement('label');
      label.className = 'column-checkbox-label';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = column.visible;
      checkbox.addEventListener('change', (e) => {
        this._toggleColumn(column.field, e.target.checked);
      });

      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(column.label));
      checkboxContainer.appendChild(label);
    });
  }

  _toggleColumnDropdown() {
    const dropdown = document.getElementById('column-dropdown');
    if (dropdown) {
      dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    }
  }

  _toggleColumn(field, visible) {
    const column = this.columns.find(col => col.field === field);
    if (!column) return;

    // Check minimum visible columns requirement (excluding checkbox)
    const visibleDataColumns = this.columns.filter(col => col.visible && col.type !== 'checkbox');

    if (!visible && visibleDataColumns.length <= 3) {
      alert('At least 3 columns must remain visible');
      // Reset the checkbox
      const checkbox = document.querySelector(`#column-checkboxes input[type="checkbox"]:nth-child(${this.columns.filter(c => c.type !== 'checkbox' && !c.required).indexOf(column) + 1})`);
      if (checkbox) checkbox.checked = true;
      return;
    }

    column.visible = visible;
    this.saveState(); // Auto-save state
    this.saveColumnPreferences(); // Save context-specific preferences
    this.render();
  }

  _saveColumnPreferences() {
    const preferences = {};
    this.columns.forEach(col => {
      if (col.type !== 'checkbox' && !col.required) {
        preferences[col.field] = col.visible;
      }
    });
    localStorage.setItem('datagrid-column-preferences', JSON.stringify(preferences));
  }

  _loadColumnPreferences() {
    try {
      const saved = localStorage.getItem('datagrid-column-preferences');
      if (saved) {
        const preferences = JSON.parse(saved);
        this.columns.forEach(col => {
          if (preferences.hasOwnProperty(col.field)) {
            col.visible = preferences[col.field];
          }
        });
      }
    } catch (e) {
      console.warn('Could not load column preferences:', e);
    }
  }

  _setLoading(loading) {
    this.isLoading = loading;
    this.render();
  }

  _renderLoadingState() {
    return `
      <div class="loading-container">
        <div class="loading-table">
          <div class="skeleton skeleton-text" style="height: 40px; margin-bottom: 16px;"></div>
          <div class="skeleton skeleton-text" style="height: 30px; margin-bottom: 8px;"></div>
          <div class="skeleton skeleton-text" style="height: 30px; margin-bottom: 8px;"></div>
          <div class="skeleton skeleton-text" style="height: 30px; margin-bottom: 8px;"></div>
          <div class="skeleton skeleton-text" style="height: 30px; margin-bottom: 8px;"></div>
          <div class="skeleton skeleton-text" style="height: 30px; margin-bottom: 8px;"></div>
        </div>
      </div>
    `;
  }

  _renderErrorState() {
    return `
      <div class="error-container">
        <div class="error-message">
          <h3>Error Loading Data</h3>
          <p>${this.error}</p>
          <button class="btn btn-primary" onclick="location.reload()">Retry</button>
        </div>
      </div>
    `;
  }

  _updateInteractionState() {
    const interactive = !this.isLoading;

    // Disable/enable filter controls
    const searchBox = document.getElementById('search-box');
    const deptFilter = document.getElementById('dept-filter');
    const exportBtn = document.getElementById('export-btn');
    const columnSettingsBtn = document.getElementById('column-settings-btn');

    if (searchBox) searchBox.disabled = !interactive;
    if (deptFilter) deptFilter.disabled = !interactive;
    if (exportBtn) exportBtn.disabled = !interactive || this.filteredData.length === 0;
    if (columnSettingsBtn) columnSettingsBtn.disabled = !interactive;

    // Add/remove loading class to container
    if (this.container.parentElement) {
      if (this.isLoading) {
        this.container.parentElement.classList.add('loading');
      } else {
        this.container.parentElement.classList.remove('loading');
      }
    }
  }

  _setupVirtualScrolling() {
    const range = this._getVisibleRange();
    this._log('Virtual scrolling setup:', {
      totalRows: this.filteredData.length,
      totalHeight: this.totalHeight,
      visibleRows: this.visibleRows,
      bufferRows: this.bufferRows,
      rowHeight: this.rowHeight,
      initialRange: range
    });
  }

  _handleVirtualScroll(event) {
    const newScrollTop = event.target.scrollTop;
    // Only re-render if we've scrolled significantly (more than half a row)
    if (Math.abs(newScrollTop - this.scrollTop) > this.rowHeight / 2) {
      this.scrollTop = newScrollTop;
      
      // Re-render only the visible portion
      this._renderVirtualRows();
    }
  }

  _renderVirtualRows() {
    const visibleColumns = this.columns.filter(col => col.visible);
    const virtualRange = this._getVisibleRange();
    const virtualData = this.filteredData.slice(virtualRange.startIndex, virtualRange.endIndex);

    // Update spacers and table content
    const topSpacer = document.querySelector('.virtual-spacer-top');
    const bottomSpacer = document.querySelector('.virtual-spacer-bottom');
    const tbody = document.querySelector('.virtual-table tbody');

    if (topSpacer) {
      topSpacer.style.height = `${virtualRange.topSpacerHeight}px`;
    }

    if (bottomSpacer) {
      bottomSpacer.style.height = `${virtualRange.bottomSpacerHeight}px`;
    }

    if (tbody) {
      tbody.innerHTML = virtualData.map(item => {
        const isSelected = this.selectedItems.has(item.card_id);
        return `
          <tr class="${isSelected ? 'selected-row' : ''}" style="height: ${this.rowHeight}px;">
            ${visibleColumns.map(column => {
              if (column.type === 'checkbox') {
                return `<td class="${column.field}-cell"><input type="checkbox" class="row-checkbox" data-id="${item.card_id}" ${isSelected ? 'checked' : ''}></td>`;
              } else {
                return `<td class="${column.field}-cell">${this._getColumnValue(item, column)}</td>`;
              }
            }).join('')}
          </tr>
        `;
      }).join('');

      // Re-attach event listeners for new checkboxes
      this._attachRowCheckboxListeners();
    }
  }

  _getVisibleRange() {
    const startIndex = Math.floor(this.scrollTop / this.rowHeight);
    const endIndex = Math.min(startIndex + this.visibleRows + this.bufferRows, this.filteredData.length);

    // Calculate spacer heights
    const topSpacerHeight = startIndex * this.rowHeight;
    const bottomSpacerHeight = Math.max(0, (this.filteredData.length - endIndex) * this.rowHeight);

    return {
      startIndex,
      endIndex,
      topSpacerHeight,
      bottomSpacerHeight,
      visibleCount: endIndex - startIndex
    };
  }

  _attachRowCheckboxListeners() {
    const rowCheckboxes = document.querySelectorAll('.row-checkbox');
    rowCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const id = e.target.getAttribute('data-id');
        this.toggleSelection(id);
      });
    });
  }

  _debounce(func, wait) {
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

  _getSortIndicator(field) {
    if (this.sortConfig.field === field) {
      return this.sortConfig.direction === 'asc' ? '▲' : '▼';
    }
    return '';
  }

  _attachEventListeners() {
    try {
      

      const prevBtn = document.getElementById('prev-btn');
      const nextBtn = document.getElementById('next-btn');
      const pageSizeSelect = document.getElementById('page-size-select');
      const headerCells = document.querySelectorAll('th[data-field]');
      const searchBox = document.getElementById('search-box');
      const deptFilter = document.getElementById('dept-filter');
      const clearFiltersBtn = document.getElementById('clear-filters');
      const exportBtn = document.getElementById('export-btn');
      const columnSettingsBtn = document.getElementById('column-settings-btn');
      const resetDefaultsBtn = document.getElementById('reset-defaults-btn');
      const selectAllCheckbox = document.getElementById('select-all-checkbox');
      const rowCheckboxes = document.querySelectorAll('.row-checkbox');
      const virtualViewport = document.querySelector('.virtual-scroll-viewport');

      // Pagination buttons with error handling
      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          try {
            this.previousPage();
          } catch (error) {
            console.error('🚨 Error in previousPage:', error);
            if (window.ErrorHandler) {
              window.ErrorHandler.logError(error, 'Previous Page Button');
            }
          }
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          try {
            this.nextPage();
          } catch (error) {
            console.error('🚨 Error in nextPage:', error);
            if (window.ErrorHandler) {
              window.ErrorHandler.logError(error, 'Next Page Button');
            }
          }
        });
      }

      if (pageSizeSelect) {
        pageSizeSelect.addEventListener('change', (e) => {
          try {
            const value = e.target.value;
            this._validateFilterInput(value);
            this.changePageSize(value);
          } catch (error) {
            console.error('🚨 Error in changePageSize:', error);
            if (window.ErrorHandler) {
              window.ErrorHandler.handleValidationError('page-size-select', 'Invalid page size selected');
            }
          }
        });
      }

      // Add click handlers to header cells for sorting with error handling
      headerCells.forEach(th => {
        try {
          th.addEventListener('click', () => {
            try {
              const field = th.getAttribute('data-field');
              if (!field) {
                throw new Error('No data-field attribute found on header cell');
              }
              this.sortData(field);
            } catch (sortError) {
              console.error('🚨 Error in sortData:', sortError);
              if (window.ErrorHandler) {
                window.ErrorHandler.logError(sortError, 'Column Sort');
              }
            }
          });
        } catch (attachError) {
          console.warn('⚠️ Could not attach sort listener to header cell:', attachError, th);
        }
      });

      // Add search box listener with debounce and validation
      if (searchBox) {
        searchBox.addEventListener('input', this._debounce((e) => {
          try {
            const searchValue = e.target.value;
            this._validateFilterInput(searchValue);
            this.filters.search = searchValue;
            this.filterData();
          } catch (error) {
            console.error('🚨 Error in search filter:', error);
            if (window.ErrorHandler) {
              window.ErrorHandler.handleValidationError('search-box', 'Invalid search input');
            }
          }
        }, 300));
      }

      // Add department filter listener with validation
      if (deptFilter) {
        deptFilter.addEventListener('change', (e) => {
          try {
            const deptValue = e.target.value;
            this._validateFilterInput(deptValue);
            this.filters.department = deptValue;
            this.filterData();
          } catch (error) {
            console.error('🚨 Error in department filter:', error);
            if (window.ErrorHandler) {
              window.ErrorHandler.handleValidationError('dept-filter', 'Invalid department filter selected');
            }
          }
        });
      }

      // Add clear filters button listener
      if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
          try {
            this.clearFilters();
          } catch (error) {
            console.error('🚨 Error clearing filters:', error);
            if (window.ErrorHandler) {
              window.ErrorHandler.logError(error, 'Clear Filters Button');
            }
          }
        });
      }

      // Add export button listener
      if (exportBtn) {
        exportBtn.addEventListener('click', () => {
          try {
            this.exportToCSV();
          } catch (error) {
            console.error('🚨 Error in export:', error);
            if (window.ErrorHandler) {
              window.ErrorHandler.logError(error, 'Export Button');
            }
          }
        });
      }

      // Add generate report button listener
      const generateReportBtn = document.getElementById('generate-report-btn');
      if (generateReportBtn) {
        generateReportBtn.addEventListener('click', () => {
          try {
            this.generateReport();
          } catch (error) {
            console.error('🚨 Error generating report:', error);
            if (window.ErrorHandler) {
              window.ErrorHandler.logError(error, 'Generate Report Button');
            }
          }
        });
      }

      // Add column settings button listener
      if (columnSettingsBtn) {
        columnSettingsBtn.addEventListener('click', (e) => {
          try {
            e.stopPropagation();
            this._toggleColumnDropdown();
          } catch (error) {
            console.error('🚨 Error toggling column dropdown:', error);
            if (window.ErrorHandler) {
              window.ErrorHandler.logError(error, 'Column Settings Button');
            }
          }
        });
      }

      // Add reset defaults button listener
      if (resetDefaultsBtn) {
        resetDefaultsBtn.addEventListener('click', () => {
          try {
            this.resetToDefaults();
          } catch (error) {
            console.error('🚨 Error resetting to defaults:', error);
            if (window.ErrorHandler) {
              window.ErrorHandler.logError(error, 'Reset Defaults Button');
            }
          }
        });
      }

      // Close dropdown when clicking outside with error handling
      document.addEventListener('click', (e) => {
        try {
          const dropdown = document.getElementById('column-dropdown');
          const settingsBtn = document.getElementById('column-settings-btn');
          if (dropdown && !dropdown.contains(e.target) && e.target !== settingsBtn) {
            dropdown.style.display = 'none';
          }
        } catch (error) {
          console.warn('⚠️ Error in dropdown close handler:', error);
        }
      });

      // Virtual scroll event listener
      if (virtualViewport) {
        virtualViewport.addEventListener('scroll', this._debounce((e) => {
          this._handleVirtualScroll(e);
        }, 10));
      }

      // Add select all checkbox listener
      if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', (e) => {
          if (e.target.checked) {
            this.selectAll();
          } else {
            this.clearSelection();
          }
        });
      }

      // Add row checkbox listeners
      rowCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
          const id = e.target.getAttribute('data-id');
          this.toggleSelection(id);
        });
      });

    } catch (error) {
      console.error('🚨 Critical error attaching event listeners:', error);
      if (window.ErrorHandler) {
        window.ErrorHandler.handleDataError(error, 'event listener setup', () => {
          // Retry attaching listeners
          setTimeout(() => this._attachEventListeners(), 1000);
        });
      }
    }
  }

  // Performance optimizations
  _throttleVirtualScroll(event) {
    if (this.scrollRAF) {
      return; // Already scheduled
    }

    this.scrollRAF = requestAnimationFrame(() => {
      this._handleVirtualScroll(event);
      this.scrollRAF = null;
    });
  }

  _handleVirtualScroll(event) {
    const now = performance.now();
    const newScrollTop = event.target.scrollTop;

    // Only re-render if we've scrolled significantly and enough time has passed
    if (Math.abs(newScrollTop - this.scrollTop) > this.rowHeight / 2 &&
        now - this.lastRenderTime > 16) { // ~60fps

      this.scrollTop = newScrollTop;
      this.lastRenderTime = now;

      

      // Re-render only the visible portion
      this._renderVirtualRows();
    }
  }

  _getColumnValue(item, column) {
    // Handle calculated CTR column
    if (column.calculated && column.field === 'ctr') {
      // Use cached value if available
      const cacheKey = `${item.card_id}_ctr`;
      if (this.calculatedValues.has(cacheKey)) {
        return this.calculatedValues.get(cacheKey) + '%';
      }

      const ctr = this._calculateCTR(item);
      this.calculatedValues.set(cacheKey, ctr);
      return ctr + '%';
    }

    // Handle delta columns in comparison mode
    if (column.comparison && column.field.includes('_delta')) {
      const deltaValue = item[column.field] || 0;
      return this._renderDeltaCell(deltaValue);
    }

    // Handle regular columns
    const value = item[column.field];

    // Format number columns
    if (column.type === 'number' && typeof value === 'number') {
      return value.toLocaleString();
    }

    return value;
  }

  /**
   * Render delta cell with proper styling
   */
  _renderDeltaCell(deltaValue) {
    if (deltaValue === 0) {
      return `<span class="delta-neutral">0</span>`;
    }

    const isPositive = deltaValue > 0;
    const className = isPositive ? 'delta-positive' : 'delta-negative';
    const prefix = isPositive ? '+' : '';

    return `<span class="${className}">${prefix}${deltaValue}</span>`;
  }

  /**
   * Render delta cell with trend indicators
   */
  _renderDeltaCell(deltaData) {
    if (!deltaData || typeof deltaData !== 'object') {
      return '—';
    }

    const { value, percent, trend } = deltaData;

    if (value === 0) {
      return '<span class="delta-neutral">—</span>';
    }

    const trendClass = `delta-${trend}`;
    const trendIcon = trend === 'up' ? '↗' : trend === 'down' ? '↘' : '—';
    const sign = value > 0 ? '+' : '';

    return `
      <span class="delta-cell ${trendClass}">
        <span class="delta-value">${sign}${value}</span>
        <span class="delta-percent">(${sign}${percent.toFixed(1)}%)</span>
        <span class="delta-trend">${trendIcon}</span>
      </span>
    `;
  }

  _precalculateValues() {
    
    const start = performance.now();

    // Use this.data instead of this.filteredData since filteredData might not be set yet
    this.data.forEach(item => {
      // Pre-calculate CTR values
      const cacheKey = `${item.card_id}_ctr`;
      if (!this.calculatedValues.has(cacheKey)) {
        const ctr = this._calculateCTR(item);
        this.calculatedValues.set(cacheKey, ctr);
      }
    });

    const end = performance.now();
    
  }

  _renderRowsHTML(virtualData, visibleColumns) {
    return virtualData.map(item => {
      const isSelected = this.selectedItems.has(item.card_id);
      return `
        <tr class="${isSelected ? 'selected-row' : ''}" style="height: ${this.rowHeight}px;" data-id="${item.card_id}">
          ${visibleColumns.map(column => {
            if (column.type === 'checkbox') {
              return `<td class="${column.field}-cell"><input type="checkbox" class="row-checkbox" data-id="${item.card_id}" ${isSelected ? 'checked' : ''}></td>`;
            } else {
              return `<td class="${column.field}-cell">${this._getColumnValue(item, column)}</td>`;
            }
          }).join('')}
        </tr>
      `;
    }).join('');
  }

  _setupVirtualScrolling() {
    const range = this._getVisibleRange();
    this._log('Virtual scrolling setup:', {
      totalRows: this.filteredData.length,
      totalHeight: this.totalHeight,
      visibleRows: this.visibleRows,
      bufferRows: this.bufferRows,
      rowHeight: this.rowHeight,
      initialRange: range
    });

    // Add scroll event listener with requestAnimationFrame throttling
    const virtualViewport = document.querySelector('.virtual-scroll-viewport');
    if (virtualViewport) {
      virtualViewport.addEventListener('scroll', (e) => {
        this._throttleVirtualScroll(e);
      });
    }
  }

  // State persistence methods
  saveState() {
    const state = {
      columns: this.columns.map(col => ({ field: col.field, visible: col.visible })),
      sortConfig: { ...this.sortConfig },
      pageSize: this.pageSize,
      filters: { ...this.filters }
    };

    try {
      localStorage.setItem(this.stateKey, JSON.stringify(state));
      
    } catch (error) {
      console.warn('Failed to save grid state:', error);
    }
  }

  loadState() {
    try {
      const saved = localStorage.getItem(this.stateKey);
      if (!saved) {
        
        return;
      }

      const state = JSON.parse(saved);
      

      // Restore column visibility
      if (state.columns) {
        state.columns.forEach(savedCol => {
          const column = this.columns.find(col => col.field === savedCol.field);
          if (column && !column.required) {
            column.visible = savedCol.visible;
          }
        });
      }

      // Restore sort configuration
      if (state.sortConfig) {
        this.sortConfig = { ...state.sortConfig };
      }

      // Restore page size
      if (state.pageSize) {
        this.pageSize = state.pageSize;
      }

      // Restore filters
      if (state.filters) {
        this.filters = { ...this.filters, ...state.filters };
      }

      // Update UI elements after state is loaded (will be called during initial load)
      this._updateUIFromState();

    } catch (error) {
      console.warn('Failed to load grid state:', error);
      this.resetToDefaults();
    }
  }

  _updateUIFromState() {
    // Update UI elements to match current state
    const searchBox = document.getElementById('search-box');
    const deptFilter = document.getElementById('dept-filter');
    const pageSizeSelect = document.getElementById('page-size-select');

    if (searchBox) searchBox.value = this.filters.search || '';
    if (deptFilter) deptFilter.value = this.filters.department || '';
    if (pageSizeSelect) pageSizeSelect.value = this.pageSize;
  }

  resetToDefaults() {
    

    // Reset columns to default visibility
    this.defaultState.columns.forEach(defaultCol => {
      const column = this.columns.find(col => col.field === defaultCol.field);
      if (column) {
        column.visible = defaultCol.visible;
      }
    });

    // Reset sort configuration
    this.sortConfig = { ...this.defaultState.sortConfig };

    // Reset page size
    this.pageSize = this.defaultState.pageSize;

    // Reset filters
    this.filters = { ...this.defaultState.filters };

    // Clear saved state and reset to defaults
    localStorage.removeItem(this.stateKey);
    this.currentPage = 1;

    // Update UI elements to match reset state
    this._updateUIFromState();

    // Re-apply filters and refresh the grid
    this.filterData();
    this._populateColumnSettings();
  }

  // Legacy method for backward compatibility
  _saveColumnPreferences() {
    this.saveState();
  }

  _loadColumnPreferences() {
    // This is now handled by loadState()
  }

  /**
   * Cleanup method to prevent memory leaks
   * Removes all event listeners and clears references
   */
  destroy() {
    try {
      // Clear timers
      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = null;
      }

      // Clear virtual scroll timeout
      if (this.virtualScrollTimeout) {
        clearTimeout(this.virtualScrollTimeout);
        this.virtualScrollTimeout = null;
      }

      // Remove all event listeners from specific elements
      const elements = [
        'prev-btn', 'next-btn', 'page-size-select', 'search-box',
        'dept-filter', 'clear-filters', 'export-btn', 'generate-report-btn',
        'column-settings-btn', 'reset-defaults-btn', 'select-all-checkbox'
      ];

      elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
          const clonedElement = element.cloneNode(true);
          element.parentNode.replaceChild(clonedElement, element);
        }
      });

      // Remove header cell event listeners
      document.querySelectorAll('th[data-field]').forEach(th => {
        const clonedTh = th.cloneNode(true);
        th.parentNode.replaceChild(clonedTh, th);
      });

      // Remove checkbox event listeners
      document.querySelectorAll('.row-checkbox').forEach(checkbox => {
        const clonedCheckbox = checkbox.cloneNode(true);
        checkbox.parentNode.replaceChild(clonedCheckbox, checkbox);
      });

      // Clear data references
      this.data = null;
      this.filteredData = null;
      this.selectedItems = null;
      this.sortConfig = null;
      this.filters = null;
      this.columns = null;

      // Clear container reference
      if (this.container) {
        this.container.innerHTML = '';
        this.container = null;
      }

    } catch (error) {
      console.error('🚨 Error during component cleanup:', error);
    }
  }
}

// Initialize
const grid = new DataGridComponent('grid-container');
window.grid = grid; // Make grid available globally for URL parameter handling

// Generate test data for virtual scrolling
function generateTestData(count = 1000) {
  const departments = ['deli', 'bakery', 'produce', 'meat', 'dairy', 'frozen'];
  const testData = [];

  for (let i = 0; i < count; i++) {
    const dept = departments[i % departments.length];
    testData.push({
      card_id: `test_${i.toString().padStart(4, '0')}`,
      card_name: `Test Item ${i + 1}`,
      department: dept,
      card_price: `$${(Math.random() * 20 + 1).toFixed(2)}`,
      card_in_view: Math.floor(Math.random() * 100) + 1,
      card_clicked: Math.floor(Math.random() * 50) + 1,
      share_count: Math.floor(Math.random() * 20),
      composite_score: Math.floor(Math.random() * 3000) + 1000,
      percentile: Math.floor(Math.random() * 100) + 1,
      quartile: ['Q1', 'Q2', 'Q3', 'Q4'][Math.floor(Math.random() * 4)]
    });
  }

  return testData;
}

// Load data on page load - use test data for virtual scrolling or mockPromotions for normal use
document.addEventListener('DOMContentLoaded', async function() {
  console.log('📊 DataGrid: DOMContentLoaded event fired');
  console.log('📊 Grid object available:', !!window.grid);
  console.log('📊 Grid container exists:', !!document.getElementById('grid-container'));

  let dataToLoad;
  const urlParams = new URLSearchParams(window.location.search);
  const testMode = urlParams.get('test') === 'virtual';
  const hasNavigation = urlParams.get('source') || urlParams.get('filter');

  console.log('📊 Test mode:', testMode);
  console.log('📊 Has navigation context:', !!hasNavigation);
  console.log('📊 mockPromotions available:', !!window.mockPromotions);

  if (testMode) {
    // Generate 1000 test rows for virtual scrolling test
    dataToLoad = generateTestData(1000);
    console.log('📊 Using test data, generated rows:', dataToLoad.length);
  } else if (window.mockPromotions && window.mockPromotions.length > 0) {
    // Use normal mock data
    dataToLoad = window.mockPromotions;
    console.log('📊 Using mockPromotions data, rows:', dataToLoad.length);
  } else {
    console.error('❌ No data available to load');
  }

  if (dataToLoad) {
    console.log('📊 Loading data into grid...');
    try {
      await grid.loadData(dataToLoad);
      console.log('✅ Grid data loaded successfully');

      // Apply default view if no navigation context
      if (!hasNavigation) {
        console.log('📊 Applying default "Digital Circular Performance" view using context bar selections');

        // Get current context from context bar (week and store selections)
        const currentContextState = window.contextStateService ?
          window.contextStateService.loadState('analyze') : null;

        console.log('📊 Current context state:', currentContextState);

        // Set default filters for Digital Circular Performance
        grid.tier1Filters = {
          scope: 'promotion',
          lens: 'performance',
          timeframe: currentContextState?.week ? `week-${currentContextState.week}` : 'current-week',
          entity: 'promotion'
        };

        // Update UI to reflect default filters
        const scopeSelect = document.getElementById('scope-filter');
        const lensSelect = document.getElementById('lens-filter');
        const timeframeSelect = document.getElementById('timeframe-filter');
        const entitySelect = document.getElementById('entity-filter');

        if (scopeSelect) {
          scopeSelect.value = 'promotion';
          console.log('📊 Set scope select to promotion, selectedIndex:', scopeSelect.selectedIndex);
        } else {
          console.log('❌ scope-filter element not found');
        }
        if (lensSelect) {
          lensSelect.value = 'performance';
          console.log('📊 Set lens select to performance, selectedIndex:', lensSelect.selectedIndex);
        } else {
          console.log('❌ lens-filter element not found');
        }
        if (timeframeSelect) {
          timeframeSelect.value = grid.tier1Filters.timeframe;
          console.log('📊 Set timeframe select to', grid.tier1Filters.timeframe, 'selectedIndex:', timeframeSelect.selectedIndex);
        } else {
          console.log('❌ timeframe-filter element not found');
        }
        if (entitySelect) {
          entitySelect.value = 'promotion';
          console.log('📊 Set entity select to promotion, selectedIndex:', entitySelect.selectedIndex);
        } else {
          console.log('❌ entity-filter element not found');
        }

        // Apply context-based filtering if we have context state
        if (currentContextState) {
          // Filter by week if specified
          if (currentContextState.week && currentContextState.week !== 40) {
            console.log(`📊 Applying week filter: ${currentContextState.week}`);
            // Week filtering logic would go here
          }

          // Filter by store scope if not "all"
          if (currentContextState.scopeLevel !== 'all') {
            console.log(`📊 Applying store filter: ${currentContextState.scopeLevel} = ${currentContextState.scopeValue}`);
            // Store filtering logic would go here
          }
        }

        // Update filter chips after UI elements are updated
        grid.updateAllFilterChips();
        console.log('📊 Filter chips updated after UI select updates');

        // Set default sort by performance (composite score)
        grid.sortConfig = { field: 'composite_score', direction: 'desc' };

        // Apply filters and sort
        grid.applyFilters();

        console.log('✅ Default Digital Circular Performance view applied with context');
      }

      // Apply initial sort from URL param if exists
      if (grid.sortBy) {
        await grid.sortData(grid.sortBy);
        console.log('✅ Initial sort applied');
      }

      // Restore filter state from URL parameters
      grid.restoreFiltersFromURL();
      console.log('✅ Filters restored from URL');

      // Render the grid
      grid.render();
      console.log('✅ Grid rendered');

    } catch (error) {
      console.error('❌ Error loading grid data:', error);
    }
  } else {
    console.error('❌ No data to load into grid');
  }
});

// Browser back/forward navigation support
window.addEventListener('popstate', function(event) {
  // Browser navigation detected

  if (window.grid && event.state && event.state.filters) {
    // Restore state from history
    const { tier1, tier2, sort, page } = event.state.filters;

    // Restore filter states
    if (tier1) {
      window.grid.tier1Filters = { ...tier1 };
    }

    if (tier2) {
      window.grid.tier2Filters = {};
      Object.entries(tier2).forEach(([key, values]) => {
        window.grid.tier2Filters[key] = new Set(values);
      });
    }

    if (sort) {
      window.grid.sortConfig = { ...sort };
    }

    if (page) {
      window.grid.currentPage = page;
    }

    // Apply the restored state without updating URL (to avoid infinite loop)
    window.grid.applyRestoredFilters(true);

    
  } else {
    // No state in history, restore from URL
    if (window.grid) {
      window.grid.restoreFiltersFromURL();
    }
  }
});

/**
 * Utility function to validate URL state management
 * For debugging and testing purposes
 */
window.validateURLState = function() {
  if (!window.grid) {
    console.error('Grid not initialized');
    return false;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const currentState = {
    tier1: window.grid.tier1Filters || {},
    tier2: window.grid.tier2Filters || {},
    sort: window.grid.sortConfig || {},
    page: window.grid.currentPage || 1
  };

  this._log('🔍 URL State Validation:', {
    urlSearch: window.location.search,
    urlParams: Object.fromEntries(urlParams.entries()),
    currentState: {
      tier1: currentState.tier1,
      tier2: Object.fromEntries(
        Object.entries(currentState.tier2).map(([k, v]) => [k, Array.from(v)])
      ),
      sort: currentState.sort,
      page: currentState.page
    }
  });

  return true;
};

/**
 * Utility functions for testing context-aware columns
 */
window.testColumnContext = function(contextName) {
  if (!window.grid) {
    console.error('Grid not initialized');
    return;
  }

  const context = window.grid.contextMap[contextName];
  if (!context) {
    console.error('Context not found:', contextName);
    
    return;
  }

  window.grid.currentContext = context;
  window.grid.applyContextColumnConfig();
  window.grid.render();

  this._log(`🎯 Applied ${contextName} context columns:`,
    window.grid.columns.filter(col => col.visible).map(col => col.field)
  );
};

window.resetColumnPrefs = function() {
  if (window.grid) {
    window.grid.clearAllColumnPreferences();
  }
};

window.showColumnPrefs = function() {
  if (!window.grid) return;

  const contextKey = window.grid.getContextKey();
  const prefs = window.grid.getColumnPreferences(contextKey);

  
  this._log('Current visible columns:',
    window.grid.columns.filter(col => col.visible).map(col => col.field)
  );
};

/**
 * Test all dashboard navigation paths with context mapping
 */
window.testAllNavigationPaths = function() {
  if (!window.grid) {
    console.error('Grid not initialized');
    return;
  }

  const allContexts = Object.keys(window.grid.contextMap);
  

  allContexts.forEach((contextName, index) => {
    setTimeout(() => {
      
      testColumnContext(contextName);

      const context = window.grid.contextMap[contextName];
      
      
      
      

      if (index === allContexts.length - 1) {
        
        
      }
    }, index * 1000); // Test one context per second
  });
};

/**
 * Test specific dashboard source categories
 */
window.testContextCategory = function(category) {
  const categories = {
    'ytd': ['ytd-traffic', 'digital-adoption', 'print-rate'],
    'main-tiles': ['week-performance', 'traffic', 'sharing'],
    'chart-cards': ['size', 'size_performance', 'deal-preference', 'size-mix', 'top-categories'],
    'performance-tables': ['performance-day', 'interaction-rate'],
    'analysis': ['performance', 'interaction', 'categories', 'promotions', 'size-analysis'],
    'engagement': ['share-activity', 'engagement-depth', 'weekly-trends'],
    'all': Object.keys(window.grid?.contextMap || {})
  };

  const contextsToTest = categories[category];
  if (!contextsToTest) {
    console.error('Category not found. Available categories:', Object.keys(categories));
    return;
  }

  
  contextsToTest.forEach((contextName, index) => {
    setTimeout(() => {
      
      testColumnContext(contextName);
    }, index * 500);
  });
};

// Memory leak prevention - cleanup on page unload
window.addEventListener('beforeunload', function() {
  if (window.grid && typeof window.grid.destroy === 'function') {
    window.grid.destroy();
  }
});

// Cleanup on page visibility change (when user switches tabs)
document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    // Page is now hidden, clear any running timers
    if (window.grid && window.grid.debounceTimeout) {
      clearTimeout(window.grid.debounceTimeout);
      window.grid.debounceTimeout = null;
    }
  }
});