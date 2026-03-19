# Project Context - Analytics Dashboard

## Overview
This document provides context and background information for the analytics dashboard project, following Angular-ready naming conventions and architectural patterns for future migration to Angular framework.

## Current Project Structure

### Root Level Files
- `index.html` - Main dashboard entry point (Version 004)
- `reports.html` - Reports functionality
- `datagrid-inquiry/datagrid-inquiry.html` - Data analysis and inquiry interface

### Directory Structure (Angular-Ready)
```
/components           # UI Components (Angular component pattern)
  /data-grid         # Grid component with template, styles, logic
/services            # Business logic services (Angular service pattern)
  /data-service.js   # Data access layer
/models              # Data models and interfaces
/utils               # Shared utilities
/mock-data           # Development data
/css                 # Global styles
/docs                # Project documentation
/prototype_*         # Legacy prototypes (candidates for cleanup)
```

## Angular-Ready Naming Conventions

### CLASSES (will become Angular Services/Components)
- **PascalCase with descriptive suffixes**
- `DataService` (not DataManager or DataHandler)
- `PromotionGridComponent` (not PromotionTable)
- `FilterStateService` (not FilterManager)
- `ReportGeneratorService` (not ReportBuilder)

### INTERFACES/MODELS (define as JS objects for now)
- **IPrefixed or plain PascalCase**
- `IPromotion` or `Promotion` (model)
- `IFilterConfig` or `FilterConfig` (config object)
- `GridOptions` (options object)
- `SortDirection: 'asc' | 'desc'` (use constants)

### METHODS following Angular patterns
- **Lifecycle-like:** `ngOnInit` → `init()`
- **Getters:** `getPromotions()` not `fetchPromotions()`
- **Setters:** `setFilter()` not `applyFilter()`
- **Events:** `onClick()`, `onChange()`, `onSort()`
- **Handlers:** `handleFilterChange()` not `filterChanged()`
- **Subscriptions:** `subscribe-`, `unsubscribe-` prefixes
- **Cleanup:** `destroy()` or `cleanup()`

### OBSERVABLES PREPARATION (as async patterns)
- Method names ending in $ for future Observables
- `getPromotions$()` → `async getPromotions()` for now
- Use Promise patterns that convert easily to Observables

### PROPERTY NAMING

**Private (will be private in TS):**
- Prefix with underscore: `_internalState`
- Will become: `private internalState`

**Public:**
- camelCase: `currentPage`, `totalItems`
- Boolean: `isLoading`, `hasError`, `canEdit`

### EVENTS/OUTPUTS (EventEmitter ready)
- `filterChange` (not onFilterChange for the event name)
- `sortChange`, `pageChange`, `selectionChange`
- Use past tense for after: `filterChanged`, `sortCompleted`

## FOLDER STRUCTURE matching Angular

```
/components
  /promotion-grid
    promotion-grid.component.js (will be .ts)
    promotion-grid.styles.css
    promotion-grid.template.html
/services
  data.service.js
  filter.service.js
  export.service.js
/models
  promotion.model.js
  filter-config.model.js
/utils (or /shared)
  grid.utils.js
  date.utils.js
```

## DEPENDENCY INJECTION READY

```javascript
class PromotionService {
  constructor(dataService, filterService) {
    // Ready for Angular DI
    this.dataService = dataService;
    this.filterService = filterService;
  }
}
```

## METHOD ORGANIZATION (Angular component lifecycle order)

```javascript
class GridComponent {
  // 1. Properties
  currentPage = 1;
  pageSize = 50;

  // 2. Constructor
  constructor() {}

  // 3. Lifecycle-like
  init() {}
  afterViewInit() {}

  // 4. Public methods
  getPromotions() {}
  setFilter() {}

  // 5. Event handlers
  onSort() {}
  onFilterChange() {}

  // 6. Private methods (prefix with _)
  _calculateTotals() {}
  _formatData() {}

  // 7. Cleanup
  destroy() {}
}
```

## ENUM-LIKE CONSTANTS

```javascript
const SortDirection = {
  ASC: 'asc',
  DESC: 'desc'
};

const FilterOperator = {
  EQUALS: 'eq',
  CONTAINS: 'contains',
  GREATER_THAN: 'gt'
};
```

## ASYNC/REACTIVE PATTERNS

```javascript
// Promise pattern (easily converts to Observable)
async getPromotions(filters) {
  try {
    const data = await this.dataService.fetch(filters);
    return this._transformData(data);
  } catch (error) {
    this._handleError(error);
  }
}

// Event emitter pattern (like Angular Output)
class GridComponent {
  constructor() {
    this.onFilterChange = new EventEmitter();
  }

  applyFilter(filter) {
    this.onFilterChange.emit(filter);
  }
}
```

## TYPE-READY DOCUMENTATION

```javascript
/**
 * @param {IFilterConfig} config - Filter configuration
 * @returns {Promise<IPromotion[]>} Filtered promotions
 */
async getFilteredPromotions(config) {
  // Implementation
}
```

## AVOID THESE PATTERNS

- jQuery-style naming: `$('#grid')`, `.click()`
- Underscore/lodash chaining (use array methods)
- Global variables
- Prototype manipulation
- Non-standard event names

## Key Components
- Analytics dashboard with interactive visualizations
- Data exploration and reporting capabilities
- Mock data integration for development and testing
- Responsive design with modern CSS styling

## Documentation Files
- `data-engineering-specification.md`: Technical specifications for data engineering (**KEEP**)
- `kpi-definitions.csv`: Key Performance Indicator definitions (**KEEP**)
- `Dashboard_DataPoints_Complete_Matrix.csv`: Complete data points matrix (**KEEP**)
- `Content_Field_Mapping.csv`: Field mapping documentation (**KEEP**)
- `prototype_001_kpi_matrix.csv`: Legacy prototype data (**REVIEW FOR CLEANUP**)

## Development Notes
- Project uses vanilla HTML, CSS, and JavaScript
- Mock data located in `/js/mock-data/`
- Styling managed through `/css/main.css`
- Version control managed with Git

## Current Status
- **Active Version**: Version 004 (`index.html`)
- **Legacy Versions**: `prototype_001`, `prototype_002`, `prototype_003` (candidates for cleanup)
- **File Status**: Modified files include CSS and mock data
- **Development Approach**: Vanilla HTML/CSS/JS with Angular migration preparation

## Cleanup Recommendations

### Files/Folders to Review for Deletion:
1. `prototype_001/` - Legacy prototype (unless historical reference needed)
2. `prototype_002/` - Legacy prototype (unless historical reference needed)
3. `prototype_003/` - Legacy prototype (unless historical reference needed)
4. `js/mock-data/004-data-backup.js` - Backup file (if no longer needed)
5. Duplicate asset folders in each prototype directory

### Files to Keep:
- All `/docs` files (contain important specifications)
- Current `/js`, `/css`, `/assets` (active development)
- `index.html` (current implementation)
- Main project mock data files

**Note**: Do not touch "prototype_*" until cleanup is confirmed to avoid losing important reference code.