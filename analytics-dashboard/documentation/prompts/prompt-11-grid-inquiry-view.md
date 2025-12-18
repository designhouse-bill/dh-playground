# Prompt 11: Grid Inquiry View

## Prerequisites
- **MUST READ FIRST:** [Prompt 00 - Constants & Standards](./prompt-00-constants-standards.md)
- Completed: [Prompt 10B - Circulars Panel](./prompt-10b-circulars-panel.md)
- CHECKPOINT G verified

## Context
You are implementing the Analytics Dashboard feature in the `ideal-sale-circular` Angular repository. This is prompt 11 of 18 in the restructured series. All BASE view tabs are complete from prompt 10.

## Working Directory
`/Users/billklingensmith/Code/ideal-sale-circular`

## Objective
Create the Grid Inquiry View - a full-width data grid with all columns, per-column filtering, and column visibility management.

---

## Tasks

### 1. Create Grid Inquiry View Folder

Create folder: `/src/app/analytic-dashboard/components/grid-inquiry-view/`

### 2. Create Grid Inquiry Component

#### 2.1 Create `grid-inquiry.component.ts`
```typescript
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Table } from 'primeng/table';
import { AnalyticsDataService, AnalyticsFilterService, AnalyticsStateService } from '../../services';
import { PromotionDto, FilterContextDto, GridColumnDto, DEFAULT_GRID_COLUMNS } from '../../dto';
import { slideDown } from '../../animations';

/**
 * Full-width data grid view with all columns and advanced filtering
 */
@Component({
  selector: 'dh-grid-inquiry',
  templateUrl: './grid-inquiry.component.html',
  styleUrls: ['./grid-inquiry.component.scss'],
  animations: [slideDown]
})
export class GridInquiryComponent implements OnInit, OnDestroy {

  @ViewChild('dataTable') dataTable: Table;

  promotions: PromotionDto[] = [];
  columns: GridColumnDto[] = [];
  visibleColumns: GridColumnDto[] = [];
  totalCount = 0;
  loading = false;

  // Column visibility panel
  showColumnPanel = false;

  // Global filter
  globalFilter = '';

  // Sorting
  sortField = 'compositeScore';
  sortOrder = -1;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private dataService: AnalyticsDataService,
    private filterService: AnalyticsFilterService,
    private stateService: AnalyticsStateService
  ) {}

  ngOnInit(): void {
    // Initialize columns
    this.columns = [...DEFAULT_GRID_COLUMNS];
    this.updateVisibleColumns();

    // Load data when filter changes
    this.filterService.filterContext$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(filter => {
        this.loadData(filter);
      });

    // Load saved column preferences
    this.loadColumnPreferences();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private loadData(filter: FilterContextDto): void {
    this.loading = true;
    // Load all data for grid (remove pagination limit)
    const gridFilter = { ...filter, pageSize: 0 };
    this.dataService.getPromotions(gridFilter)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(promotions => {
        this.promotions = promotions;
        this.totalCount = promotions.length;
        this.loading = false;
      });
  }

  onSort(event: any): void {
    this.sortField = event.field;
    this.sortOrder = event.order;
  }

  onGlobalFilter(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.dataTable.filterGlobal(target.value, 'contains');
  }

  clearFilters(): void {
    this.dataTable.clear();
    this.globalFilter = '';
  }

  // Column visibility management
  toggleColumnPanel(): void {
    this.showColumnPanel = !this.showColumnPanel;
  }

  toggleColumn(column: GridColumnDto): void {
    column.visible = !column.visible;
    this.updateVisibleColumns();
    this.saveColumnPreferences();
  }

  updateVisibleColumns(): void {
    this.visibleColumns = this.columns.filter(c => c.visible);
  }

  isColumnVisible(key: string): boolean {
    const column = this.columns.find(c => c.key === key);
    return column?.visible ?? false;
  }

  showAllColumns(): void {
    this.columns.forEach(c => c.visible = true);
    this.updateVisibleColumns();
    this.saveColumnPreferences();
  }

  hideAllColumns(): void {
    // Keep at least name column visible
    this.columns.forEach(c => c.visible = c.key === 'name');
    this.updateVisibleColumns();
    this.saveColumnPreferences();
  }

  // Persistence
  private saveColumnPreferences(): void {
    const prefs = this.columns.map(c => ({ key: c.key, visible: c.visible }));
    localStorage.setItem('analytics-grid-columns', JSON.stringify(prefs));
  }

  private loadColumnPreferences(): void {
    const saved = localStorage.getItem('analytics-grid-columns');
    if (saved) {
      try {
        const prefs = JSON.parse(saved);
        prefs.forEach((pref: { key: string; visible: boolean }) => {
          const column = this.columns.find(c => c.key === pref.key);
          if (column) {
            column.visible = pref.visible;
          }
        });
        this.updateVisibleColumns();
      } catch (e) {
        console.warn('Failed to load column preferences');
      }
    }
  }

  // Export functionality
  exportToCSV(): void {
    this.dataTable.exportCSV();
  }

  // Formatters
  getPercentileClass(percentile: number): string {
    if (percentile >= 80) return 'percentile-high';
    if (percentile >= 50) return 'percentile-medium';
    return 'percentile-low';
  }

  formatPrice(price: number): string {
    return '$' + price.toFixed(2);
  }

  formatNumber(value: number): string {
    return value?.toLocaleString() ?? '0';
  }
}
```

#### 2.2 Create `grid-inquiry.component.html`
```html
<div class="grid-inquiry">
  <!-- Toolbar -->
  <div class="grid-toolbar">
    <div class="toolbar-left">
      <h3 class="grid-title">All Promotions</h3>
      <span class="item-count">{{ totalCount }} items</span>
    </div>

    <div class="toolbar-center">
      <span class="p-input-icon-left global-search">
        <i class="pi pi-search"></i>
        <input
          type="text"
          pInputText
          placeholder="Search all columns..."
          [(ngModel)]="globalFilter"
          (input)="onGlobalFilter($event)">
      </span>
    </div>

    <div class="toolbar-right">
      <button
        pButton
        type="button"
        icon="pi pi-filter-slash"
        label="Clear Filters"
        class="p-button-outlined p-button-sm"
        (click)="clearFilters()">
      </button>

      <button
        pButton
        type="button"
        icon="pi pi-cog"
        label="Columns"
        class="p-button-outlined p-button-sm"
        (click)="toggleColumnPanel()">
      </button>

      <button
        pButton
        type="button"
        icon="pi pi-download"
        label="Export"
        class="p-button-sm"
        (click)="exportToCSV()">
      </button>
    </div>
  </div>

  <!-- Column Visibility Panel -->
  <div class="column-panel" *ngIf="showColumnPanel" [@slideDown]>
    <div class="column-panel-header">
      <span>Column Visibility</span>
      <div class="column-actions">
        <button pButton type="button" label="Show All" class="p-button-text p-button-sm" (click)="showAllColumns()"></button>
        <button pButton type="button" label="Hide All" class="p-button-text p-button-sm" (click)="hideAllColumns()"></button>
      </div>
    </div>
    <div class="column-checkboxes">
      <div *ngFor="let col of columns" class="column-checkbox">
        <p-checkbox
          [binary]="true"
          [(ngModel)]="col.visible"
          (onChange)="toggleColumn(col)"
          [inputId]="'col-' + col.key"
          [disabled]="col.key === 'name'">
        </p-checkbox>
        <label [for]="'col-' + col.key">{{ col.label }}</label>
      </div>
    </div>
  </div>

  <!-- Data Table -->
  <div class="table-container">
    <p-table
      #dataTable
      [value]="promotions"
      [columns]="visibleColumns"
      [sortField]="sortField"
      [sortOrder]="sortOrder"
      (onSort)="onSort($event)"
      [paginator]="true"
      [rows]="50"
      [rowsPerPageOptions]="[25, 50, 100, 250]"
      [showCurrentPageReport]="true"
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
      [globalFilterFields]="['name', 'categoryName', 'dealType']"
      [scrollable]="true"
      scrollHeight="flex"
      [loading]="loading"
      styleClass="p-datatable-sm p-datatable-gridlines grid-table"
      [exportFilename]="'promotions-export'">

      <ng-template pTemplate="header">
        <tr>
          <th *ngFor="let col of visibleColumns"
              [pSortableColumn]="col.sortable ? col.key : null"
              [style.width]="col.width"
              [class.sticky-column]="col.sticky">
            {{ col.label }}
            <p-sortIcon *ngIf="col.sortable" [field]="col.key"></p-sortIcon>
          </th>
        </tr>
        <tr>
          <th *ngFor="let col of visibleColumns" [class.sticky-column]="col.sticky">
            <ng-container [ngSwitch]="col.filterType || col.type">
              <!-- Text filter -->
              <p-columnFilter
                *ngSwitchCase="'text'"
                type="text"
                [field]="col.key"
                [showMenu]="false"
                [showClearButton]="true"
                placeholder="Filter...">
              </p-columnFilter>

              <!-- Numeric filter -->
              <p-columnFilter
                *ngSwitchCase="'number'"
                type="numeric"
                [field]="col.key"
                [showMenu]="true">
              </p-columnFilter>

              <!-- Currency filter -->
              <p-columnFilter
                *ngSwitchCase="'currency'"
                type="numeric"
                [field]="col.key"
                [showMenu]="true">
              </p-columnFilter>

              <!-- Default text filter -->
              <p-columnFilter
                *ngSwitchDefault
                type="text"
                [field]="col.key"
                [showMenu]="false"
                placeholder="Filter...">
              </p-columnFilter>
            </ng-container>
          </th>
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-promo let-columns="columns">
        <tr>
          <td *ngFor="let col of columns" [class.sticky-column]="col.sticky">
            <ng-container [ngSwitch]="col.key">
              <!-- Promotion name -->
              <ng-container *ngSwitchCase="'name'">
                <div class="promo-cell">
                  <span class="card-size-badge">{{ promo.cardSize }}</span>
                  <span class="promo-name">{{ promo.name }}</span>
                </div>
              </ng-container>

              <!-- Category -->
              <ng-container *ngSwitchCase="'categoryName'">
                {{ promo.categoryName }}
              </ng-container>

              <!-- Deal Type -->
              <ng-container *ngSwitchCase="'dealType'">
                <p-tag [value]="promo.dealType" styleClass="deal-tag"></p-tag>
              </ng-container>

              <!-- Prices -->
              <ng-container *ngSwitchCase="'originalPrice'">
                {{ formatPrice(promo.originalPrice) }}
              </ng-container>
              <ng-container *ngSwitchCase="'salePrice'">
                <span class="sale-price">{{ formatPrice(promo.salePrice) }}</span>
              </ng-container>

              <!-- Metrics -->
              <ng-container *ngSwitchCase="'civ'">
                <span class="metric-value views">{{ formatNumber(promo.civ) }}</span>
              </ng-container>
              <ng-container *ngSwitchCase="'cc'">
                <span class="metric-value clicks">{{ formatNumber(promo.cc) }}</span>
              </ng-container>
              <ng-container *ngSwitchCase="'atl'">
                <span class="metric-value adds">{{ formatNumber(promo.atl) }}</span>
              </ng-container>

              <!-- Percentile -->
              <ng-container *ngSwitchCase="'percentile'">
                <span class="percentile-badge" [ngClass]="getPercentileClass(promo.percentile)">
                  {{ promo.percentile }}%
                </span>
              </ng-container>

              <!-- Performance -->
              <ng-container *ngSwitchCase="'compositeScore'">
                <dh-performance-chart
                  [civValue]="promo.civ"
                  [ccValue]="promo.cc"
                  [atlValue]="promo.atl"
                  [height]="20"
                  [compact]="true">
                </dh-performance-chart>
              </ng-container>

              <!-- Other columns -->
              <ng-container *ngSwitchDefault>
                {{ promo[col.key] }}
              </ng-container>
            </ng-container>
          </td>
        </tr>
      </ng-template>

      <ng-template pTemplate="emptymessage">
        <tr>
          <td [attr.colspan]="visibleColumns.length" class="empty-message">
            <span class="material-symbols-outlined">search_off</span>
            <p>No data found</p>
          </td>
        </tr>
      </ng-template>
    </p-table>
  </div>
</div>
```

#### 2.3 Create `grid-inquiry.component.scss`
```scss
@import '../../styles/design-tokens';

.grid-inquiry {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border-radius: $radius-md;
  overflow: hidden;
}

.grid-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-md;
  border-bottom: 1px solid $gray-200;
  background: $gray-50;
}

.toolbar-left {
  display: flex;
  align-items: baseline;
  gap: $spacing-sm;
}

.grid-title {
  margin: 0;
  font-size: $font-size-lg;
  font-weight: 600;
  color: $gray-800;
}

.item-count {
  font-size: $font-size-sm;
  color: $gray-500;
}

.toolbar-center {
  flex: 1;
  max-width: 400px;
  margin: 0 $spacing-lg;
}

.global-search {
  width: 100%;

  input {
    width: 100%;
  }
}

.toolbar-right {
  display: flex;
  gap: $spacing-sm;
}

// Column Panel
.column-panel {
  padding: $spacing-md;
  background: $gray-50;
  border-bottom: 1px solid $gray-200;
}

.column-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-md;
  font-weight: 600;
  color: $gray-700;
}

.column-actions {
  display: flex;
  gap: $spacing-xs;
}

.column-checkboxes {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm $spacing-lg;
}

.column-checkbox {
  display: flex;
  align-items: center;
  gap: $spacing-xs;

  label {
    font-size: $font-size-sm;
    cursor: pointer;
  }
}

// Table Container
.table-container {
  flex: 1;
  overflow: hidden;

  :host ::ng-deep .grid-table {
    .p-datatable-wrapper {
      overflow: auto;
    }

    .p-datatable-thead > tr > th {
      background: $gray-100;
      font-weight: 600;
      font-size: $font-size-xs;
      text-transform: uppercase;
      color: $gray-600;
      white-space: nowrap;
      padding: $spacing-sm $spacing-md;

      &.sticky-column {
        position: sticky;
        left: 0;
        z-index: 1;
        background: $gray-100;
      }
    }

    // Filter row
    .p-datatable-thead > tr:nth-child(2) > th {
      padding: $spacing-xs $spacing-sm;
      background: white;

      .p-column-filter {
        width: 100%;
      }

      input {
        width: 100%;
        font-size: $font-size-xs;
        padding: 4px 8px;
      }
    }

    .p-datatable-tbody > tr {
      &:hover {
        background: $gray-50;
      }

      > td {
        padding: $spacing-sm $spacing-md;
        font-size: $font-size-sm;
        white-space: nowrap;

        &.sticky-column {
          position: sticky;
          left: 0;
          background: white;
          z-index: 1;
        }
      }
    }

    .p-paginator {
      padding: $spacing-sm $spacing-md;
      border-top: 1px solid $gray-200;
    }
  }
}

.promo-cell {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.card-size-badge {
  display: inline-flex;
  padding: 2px 6px;
  background: $gray-200;
  border-radius: $radius-sm;
  font-size: 10px;
  font-weight: 600;
  color: $gray-700;
}

.promo-name {
  font-weight: 500;
}

.sale-price {
  font-weight: 600;
  color: $gray-800;
}

.metric-value {
  font-weight: 600;

  &.views { color: $metric-views-color; }
  &.clicks { color: darken($metric-clicks-color, 15%); }
  &.adds { color: $metric-adds-color; }
}

.percentile-badge {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: $radius-sm;
  font-size: $font-size-xs;
  font-weight: 600;

  &.percentile-high {
    background: rgba(#22c55e, 0.1);
    color: #16a34a;
  }

  &.percentile-medium {
    background: rgba(#f59e0b, 0.1);
    color: #d97706;
  }

  &.percentile-low {
    background: rgba(#ef4444, 0.1);
    color: #dc2626;
  }
}

:host ::ng-deep .deal-tag {
  font-size: 10px;
  padding: 2px 6px;
}

.empty-message {
  text-align: center;
  padding: $spacing-xl !important;
  color: $gray-500;

  .material-symbols-outlined {
    font-size: 48px;
    margin-bottom: $spacing-sm;
  }

  p {
    margin: 0;
  }
}

// Responsive
@media (max-width: $breakpoint-tablet) {
  .grid-toolbar {
    flex-wrap: wrap;
    gap: $spacing-md;
  }

  .toolbar-center {
    order: 3;
    flex-basis: 100%;
    max-width: none;
    margin: 0;
  }
}
```

### 3. Update Main Container

Update `/src/app/analytic-dashboard/components/analytic-dashboard/analytic-dashboard.component.html`:

```html
<!-- Replace GRID View placeholder with actual component -->
<div class="grid-view-layout" *ngIf="showGridView">
  <dh-grid-inquiry></dh-grid-inquiry>
</div>
```

### 4. Update Components Index

Update `/src/app/analytic-dashboard/components/index.ts`:
```typescript
// ... existing imports
import { GridInquiryComponent } from './grid-inquiry-view/grid-inquiry.component';

export const components = [
  // ... existing components
  GridInquiryComponent
];

// ... existing exports
export * from './grid-inquiry-view/grid-inquiry.component';
```

---

## FILES CHECKLIST

### Files to CREATE:
| # | Path | Purpose | Est. Lines | Complete |
|---|------|---------|------------|----------|
| 1 | `/src/app/analytic-dashboard/components/grid-inquiry-view/grid-inquiry.component.ts` | Full-width data grid | ~193 | ☐ |
| 2 | `/src/app/analytic-dashboard/components/grid-inquiry-view/grid-inquiry.component.html` | Grid template | ~228 | ☐ |
| 3 | `/src/app/analytic-dashboard/components/grid-inquiry-view/grid-inquiry.component.scss` | Grid styles | ~252 | ☐ |

### Files to MODIFY:
| # | Path | Changes | Complete |
|---|------|---------|----------|
| 1 | `/src/app/analytic-dashboard/components/analytic-dashboard/analytic-dashboard.component.html` | Replace GRID view placeholder with <dh-grid-inquiry> | ☐ |
| 2 | `/src/app/analytic-dashboard/components/index.ts` | Add GridInquiryComponent export | ☐ |

---

## SMOKE TEST

### Quick Compile Check
```bash
cd /Users/billklingensmith/Code/ideal-sale-circular
yarn build 2>&1 | grep -E "(error|ERROR)" | head -20
```

### Visual Verification
1. Navigate to Analytics Dashboard
2. Click GRID view mode button
3. Expected:
   - Full-width data table displays
   - Toolbar with search, filters, columns, export buttons
   - All columns visible by default
   - Column headers with sort icons
   - Filter inputs below each column header
   - Performance charts in compositeScore column
   - Pagination at bottom

4. Test Features:
   - Click column header to sort
   - Type in column filter to filter data
   - Type in global search to filter all
   - Click "Columns" button to show/hide columns
   - Click "Export" to download CSV
   - Use pagination controls

---

## SENIOR DEV REVIEW CHECKLIST

Before finalizing, verify:

### Code Quality
- [ ] All code blocks complete (no `// ...`)
- [ ] All imports explicitly listed
- [ ] Component selector uses `dh-` prefix
- [ ] OnDestroy with takeUntil pattern
- [ ] Column preferences saved to localStorage

### Consistency with Prompt 00
- [ ] Formula: `civ + (cc * 10) + (atl * 50)` used in sorting ✓
- [ ] Colors: Metric values styled with correct colors ✓
- [ ] Variables: `civ`, `cc`, `atl`, `compositeScore` ✓
- [ ] SCSS uses token variables ✓

### Angular Patterns
- [ ] @ViewChild for Table reference
- [ ] GridColumnDto type for column configuration
- [ ] DEFAULT_GRID_COLUMNS imported from DTO
- [ ] Proper PrimeNG Table integration
- [ ] Column filtering with p-columnFilter

### Grid Features
- [ ] Global filter works across all columns
- [ ] Per-column filters work independently
- [ ] Column visibility toggle persists to localStorage
- [ ] CSV export includes visible columns only
- [ ] Sorting works on all sortable columns
- [ ] Pagination with configurable page size
- [ ] Sticky first column (name) for horizontal scrolling
- [ ] Performance chart renders in compositeScore column

### Would this compile on first try? [YES/NO]

---

## CHECKPOINT H: Grid View Complete

Before proceeding to Prompt 12, verify:

1. **Compile Check:** `yarn build` passes without errors
2. **Import Check:** No "Cannot find module" errors
3. **Constants Check:**
   - Formula used correctly for composite score
   - Colors match Prompt 00 exactly
4. **Pattern Check:** GridInquiryComponent has proper lifecycle management
5. **Visual Check:**
   - Grid displays all promotions in table format
   - All filtering features work
   - Column visibility toggle works
   - Export works

### Grid View Features Complete:
- [x] Full-width data table with PrimeNG Table
- [x] Global search across all columns
- [x] Per-column filtering
- [x] Column sorting
- [x] Column visibility management
- [x] CSV export
- [x] Pagination with page size selector
- [x] Performance charts in cells
- [x] Percentile badges with color coding
- [x] Sticky column for horizontal scroll

### Issues Found:
(List any issues here before continuing)

### Ready to Continue: [YES/NO]

---

## Notes for Next Prompt
- Grid Inquiry view is complete with full-featured data table
- All filtering, sorting, and export functionality working
- Column visibility preferences persist in localStorage
- PerformanceChartComponent used in compact mode within cells
- Next: Prompt 12 will create the Compare view for A/B comparison
