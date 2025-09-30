/* ==========================================================================
   Inquiry State Management
   Handles URL parameter parsing, selector state, and chip management
   ========================================================================== */

(function() {
  const InquiryState = window.InquiryState = window.InquiryState || {};

  // State object to track current selections
  InquiryState.state = {
    scope: null,
    lens: null,
    week: null,
    store: null,
    version: null,
    sortBy: null,
    metric: null,
    description: null,
    source: null,
    categories: [],
    dealTypes: [],
    sizeClasses: [],
    positionRanges: [],
    entityLevel: null
  };

  // Initialize from URL parameters
  InquiryState.initFromURL = function() {
    const urlParams = new URLSearchParams(window.location.search);

    // Parse single value parameters
    InquiryState.state.source = urlParams.get('source');
    InquiryState.state.scope = urlParams.get('scope');
    InquiryState.state.lens = urlParams.get('lens');
    InquiryState.state.week = urlParams.get('week');
    InquiryState.state.store = urlParams.get('store');
    InquiryState.state.version = urlParams.get('version');
    InquiryState.state.sortBy = urlParams.get('sortBy');
    InquiryState.state.metric = urlParams.get('metric');
    InquiryState.state.description = urlParams.get('description');
    InquiryState.state.entityLevel = urlParams.get('entityLevel');

    // Parse array parameters
    if (urlParams.get('categories')) {
      InquiryState.state.categories = urlParams.get('categories').split(',');
    }
    if (urlParams.get('dealTypes')) {
      InquiryState.state.dealTypes = urlParams.get('dealTypes').split(',');
    }
    if (urlParams.get('sizeClasses')) {
      InquiryState.state.sizeClasses = urlParams.get('sizeClasses').split(',');
    }
    if (urlParams.get('positionRanges')) {
      InquiryState.state.positionRanges = urlParams.get('positionRanges').split(',');
    }

    console.log('Initialized inquiry state from URL:', InquiryState.state);
  };

  // Apply state to selectors
  InquiryState.applyToSelectors = function() {
    // Update Scope selector
    if (InquiryState.state.scope) {
      const scopeSelect = document.getElementById('scope-select');
      if (scopeSelect) {
        scopeSelect.value = InquiryState.state.scope;
        // Trigger change event to update dependent selectors
        scopeSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }

    // Update Lens selector
    if (InquiryState.state.lens) {
      const lensSelect = document.getElementById('lens-select');
      if (lensSelect) {
        lensSelect.value = InquiryState.state.lens;
        lensSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }

    // Update Sort By selector
    if (InquiryState.state.sortBy) {
      const sortSelect = document.getElementById('sort-select');
      if (sortSelect) {
        sortSelect.value = InquiryState.state.sortBy;
        sortSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }

    // Update Metric selector
    if (InquiryState.state.metric) {
      const metricSelect = document.getElementById('metric-select');
      if (metricSelect) {
        metricSelect.value = InquiryState.state.metric;
        metricSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }

    // Update context banner if description is available
    if (InquiryState.state.description) {
      InquiryState.updateContextBanner();
    }

    console.log('Applied state to selectors');
  };

  // Update context banner
  InquiryState.updateContextBanner = function() {
    const contextBanner = document.getElementById('drill-down-context');
    const contextDescription = document.getElementById('context-description');

    if (contextBanner && contextDescription && InquiryState.state.description) {
      contextDescription.textContent = InquiryState.state.description;
      contextBanner.style.display = 'block';
    }
  };

  // Generate chips with hierarchical ordering and always show required chips
  InquiryState.generateChips = function() {
    const chipsContainer = document.getElementById('inquiry-chips');
    if (!chipsContainer) return;

    chipsContainer.innerHTML = '';
    const chips = [];

    // Get current form values directly
    const scopeSelect = document.getElementById('scope-select');
    const lensSelect = document.getElementById('lens-select');
    const sortSelect = document.getElementById('sort-select');
    const metricSelect = document.getElementById('metric-select');

    // 1. HEADER CHIPS (always show) - #4E5370
    // Week (from URL/context) - convert format for display
    let weekValue = InquiryState.state.week || '-';
    if (weekValue !== '-' && weekValue.match(/^w\d+$/i)) {
      // Convert 'w36' to '2025-W36' for display
      const weekNumber = weekValue.toLowerCase().replace('w', '');
      weekValue = `2025-W${weekNumber}`;
    }
    chips.push({
      type: 'week',
      label: 'Week',
      value: weekValue,
      cssClass: 'chip-header',
      order: 1
    });

    // Store (from URL/context) - show "All" for header chips when no selection
    const storeValue = InquiryState.state.store || 'All';
    chips.push({
      type: 'store',
      label: 'Store',
      value: storeValue,
      cssClass: 'chip-header',
      order: 2
    });

    // Version (from URL/context) - show "All" for header chips when no selection
    const versionValue = InquiryState.state.version || 'All';
    chips.push({
      type: 'version',
      label: 'Version',
      value: versionValue,
      cssClass: 'chip-header',
      order: 3
    });

    // 2. ANALYSIS APPROACH CHIPS (always show) - #4272D8
    // Scope
    const scopeValue = (scopeSelect && scopeSelect.value && scopeSelect.value !== '')
      ? (scopeSelect.options[scopeSelect.selectedIndex]?.text || scopeSelect.value)
      : '-';
    chips.push({
      type: 'scope',
      label: 'Scope',
      value: scopeValue,
      cssClass: 'chip-analysis',
      elementId: 'scope-select',
      order: 4
    });

    // Lens
    const lensValue = (lensSelect && lensSelect.value && lensSelect.value !== '')
      ? (lensSelect.options[lensSelect.selectedIndex]?.text || lensSelect.value)
      : '-';
    chips.push({
      type: 'lens',
      label: 'Lens',
      value: lensValue,
      cssClass: 'chip-analysis',
      elementId: 'lens-select',
      order: 5
    });

    // 3. CONTENT FILTER CHIPS - #7a9130
    // Sort By (part of Content Filters tile)
    const sortValue = (sortSelect && sortSelect.value && sortSelect.value !== '')
      ? (sortSelect.options[sortSelect.selectedIndex]?.text || sortSelect.value)
      : '-';
    chips.push({
      type: 'sortBy',
      label: 'Sort By',
      value: sortValue,
      cssClass: 'chip-content',
      elementId: 'sort-select',
      order: 6
    });


    // Additional Content Filter multiselects (only show when assigned)
    const multiselects = [
      { id: 'categories-select', type: 'categories', label: 'Categories', order: 8 },
      { id: 'deal-types-select', type: 'dealTypes', label: 'Deal Types', order: 9 },
      { id: 'size-classes-select', type: 'sizeClasses', label: 'Size Classes', order: 10 },
      { id: 'position-ranges-select', type: 'positionRanges', label: 'Position Ranges', order: 11 }
    ];

    multiselects.forEach(({ id, type, label, order }) => {
      const selectedValues = InquiryState.getMultiselectValues(id);
      if (selectedValues.length > 0) {
        chips.push({
          type: type,
          label: label,
          value: selectedValues.join(', '),
          cssClass: 'chip-content',
          elementId: id,
          order: order
        });
      }
    });

    // Sort chips by order
    chips.sort((a, b) => a.order - b.order);

    // Render chips
    chips.forEach(chip => {
      const chipElement = document.createElement('div');
      chipElement.className = `inquiry-chip ${chip.cssClass}`;

      // Only show remove button for chips that have actual values (not "-" or "All" for header chips)
      const showRemoveButton = chip.value !== '-' &&
        !(chip.cssClass === 'chip-header' && chip.value === 'All');
      const removeButton = showRemoveButton
        ? `<button class="inquiry-chip-remove" onclick="InquiryState.removeChip('${chip.type}', '${chip.elementId || ''}')" aria-label="Remove ${chip.label} filter"></button>`
        : '';

      chipElement.innerHTML = `
        <span class="inquiry-chip-label">${chip.label}:</span>
        <span class="inquiry-chip-value">${chip.value}</span>
        ${removeButton}
      `;
      chipsContainer.appendChild(chipElement);
    });

    console.log('Generated hierarchical chips:', chips);
  };

  // Helper to get multiselect values
  InquiryState.getMultiselectValues = function(selectId) {
    const container = document.querySelector(`[data-control-id="${selectId}"]`);
    if (!container) return [];

    const checkboxes = container.querySelectorAll('input[type="checkbox"]:checked');
    const values = [];
    checkboxes.forEach(checkbox => {
      if (checkbox.classList.contains('prime-select-all')) return; // Skip "Select All"
      const label = container.querySelector(`label[for="${checkbox.id}"]`);
      if (label) {
        values.push(label.textContent.trim());
      }
    });
    return values;
  };

  // Remove a chip and update form controls
  InquiryState.removeChip = function(chipType, elementId) {
    // Reset form controls directly
    if (elementId) {
      const element = document.getElementById(elementId);
      if (element) {
        if (element.tagName === 'SELECT') {
          element.value = '';
          element.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    }

    // Handle multiselect controls
    if (chipType === 'categories' || chipType === 'dealTypes' || chipType === 'sizeClasses' || chipType === 'positionRanges') {
      const container = document.querySelector(`[data-control-id="${elementId}"]`);
      if (container) {
        // Uncheck all boxes
        const checkboxes = container.querySelectorAll('input[type="checkbox"]:checked');
        checkboxes.forEach(checkbox => {
          checkbox.checked = false;
        });

        // Update display
        const trigger = container.querySelector('.prime-multiselect-trigger');
        const placeholder = container.querySelector('.prime-multiselect-placeholder');
        if (trigger && placeholder) {
          placeholder.textContent = `-`;
        }
      }
    }

    // Handle context chips (remove from internal state)
    switch (chipType) {
      case 'week':
        InquiryState.state.week = null;
        break;
      case 'store':
        InquiryState.state.store = null;
        break;
      case 'version':
        InquiryState.state.version = null;
        break;
    }

    // Regenerate chips and update grid
    InquiryState.generateChips();

    // Sync back to data grid and trigger update
    if (window.dataGridApp) {
      window.dataGridApp.syncWithInquiryState();
      window.dataGridApp.loadData(); // Force data reload with new state
    }

    console.log('Removed chip:', chipType, 'Element:', elementId);
  };

  // Reset context (back to overview)
  InquiryState.resetToOverview = function() {
    // Clear URL parameters and redirect to current page without params
    window.location.href = window.location.pathname;
  };

  // Add auto-refresh functionality for chips
  InquiryState.bindFormChangeListeners = function() {
    // Listen for changes on select elements
    const selectors = ['scope-select', 'lens-select', 'sort-select'];
    selectors.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('change', () => {
          setTimeout(() => InquiryState.generateChips(), 100);
        });
      }
    });

    // Listen for multiselect changes (delegate to document for dynamic content)
    document.addEventListener('change', function(e) {
      if (e.target.type === 'checkbox' && e.target.closest('.prime-multiselect')) {
        setTimeout(() => InquiryState.generateChips(), 100);
      }
    });

    console.log('Bound form change listeners for auto-chip refresh');
  };

  // Force update multiselect placeholders to show "-"
  InquiryState.updateMultiselectPlaceholders = function() {
    const multiselects = [
      'categories-select',
      'deal-types-select',
      'size-classes-select',
      'position-ranges-select'
    ];

    multiselects.forEach(id => {
      const container = document.querySelector(`[data-control-id="${id}"]`);
      if (container) {
        const placeholder = container.querySelector('.prime-multiselect-placeholder');
        if (placeholder && placeholder.textContent.includes('Select')) {
          placeholder.textContent = '-';
        }
      }
    });

    console.log('Updated multiselect placeholders to show "-"');
  };

  // Handle scroll-to-table functionality for drill-down navigation
  InquiryState.handleScrollToTable = function() {
    if (window.location.hash === '#analytics-treetable') {
      setTimeout(() => {
        const tableElement = document.getElementById('analytics-treetable');
        const header = document.querySelector('.page-header');

        if (tableElement && header) {
          const headerHeight = header.offsetHeight;
          const elementPosition = tableElement.offsetTop;
          const offsetPosition = elementPosition - headerHeight - 20; // 20px extra padding

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 1200); // Wait for all content to load before scrolling
    }
  };

  // Initialize when page loads
  document.addEventListener('DOMContentLoaded', function() {
    InquiryState.initFromURL();

    // Wait for selectors to be rendered then apply state and bind listeners
    setTimeout(() => {
      InquiryState.applyToSelectors();
      InquiryState.updateMultiselectPlaceholders();
      InquiryState.generateChips();
      InquiryState.bindFormChangeListeners();
    }, 500);

    // Additional update after a longer delay to ensure all elements are rendered
    setTimeout(() => {
      InquiryState.updateMultiselectPlaceholders();
      InquiryState.generateChips();

      // Sync with data grid and reload data if coming from drill-down
      if (window.dataGridApp && (InquiryState.state.source || window.location.search)) {
        window.dataGridApp.syncWithInquiryState();
        window.dataGridApp.reloadDataWithCurrentState();
      }

      // Handle scroll-to-table after everything is loaded
      InquiryState.handleScrollToTable();
    }, 1000);

    // Bind reset context button
    const resetContextBtn = document.getElementById('reset-context');
    if (resetContextBtn) {
      resetContextBtn.addEventListener('click', InquiryState.resetToOverview);
    }
  });

  console.log('InquiryState module loaded');
})();