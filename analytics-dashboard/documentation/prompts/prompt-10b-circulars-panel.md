# Prompt 10B: Circulars Panel Component

## Prerequisites
- **MUST READ FIRST:** [Prompt 00 - Constants & Standards](./prompt-00-constants-standards.md)
- Completed: Prompt 10A (Categories Panel)

## Context
You are implementing the Analytics Dashboard feature in the `ideal-sale-circular` Angular repository. This is prompt 10B of the restructured series. The Categories panel was created in 10A. Now we add the final BASE view tab.

## Working Directory
`/Users/billklingensmith/Code/ideal-sale-circular`

## Objective
Create the CircularsPanelComponent - the center panel content when the Circulars tab is selected, displaying a searchable table of stores with performance data.

---

## FILES CHECKLIST

### Files to CREATE:
| # | Path | Purpose | Est. Lines | Complete |
|---|------|---------|------------|----------|
| 1 | `.../circulars-panel/circulars-panel.component.ts` | Circulars table logic | ~115 | ☐ |
| 2 | `.../circulars-panel/circulars-panel.component.html` | Circulars table template | ~105 | ☐ |
| 3 | `.../circulars-panel/circulars-panel.component.scss` | Circulars panel styles | ~160 | ☐ |

### Files to MODIFY:
| # | Path | Changes | Complete |
|---|------|---------|----------|
| 1 | `/src/app/analytic-dashboard/components/index.ts` | Add CircularsPanelComponent export | ☐ |
| 2 | `analytic-dashboard.component.html` | Replace circulars placeholder | ☐ |

### Required Imports for circulars-panel.component.ts:
```typescript
// Angular
import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';

// RxJS
import { Subject, takeUntil } from 'rxjs';

// App Services (3 levels deep)
import { AnalyticsDataService, AnalyticsFilterService, AnalyticsStateService } from '../../../services';

// App DTOs (3 levels deep)
import { CircularDto, FilterContextDto } from '../../../dto';
```

---

## Tasks

### 1. Create Circulars Panel Component Folder
```bash
mkdir -p /src/app/analytic-dashboard/components/base-view/circulars-panel
```

### 2. Create `circulars-panel.component.ts`

```typescript
import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AnalyticsDataService, AnalyticsFilterService, AnalyticsStateService } from '../../../services';
import { CircularDto, FilterContextDto } from '../../../dto';

/**
 * Center panel showing circulars/stores list in table format
 * Includes search and sorting capabilities
 *
 * Formula Reference: CIV×1 + CC×10 + ATL×50
 */
@Component({
  selector: 'dh-circulars-panel',
  templateUrl: './circulars-panel.component.html',
  styleUrls: ['./circulars-panel.component.scss']
})
export class CircularsPanelComponent implements OnInit, OnDestroy {

  @Output() circularSelected = new EventEmitter<CircularDto>();

  circulars: CircularDto[] = [];
  selectedCircular: CircularDto | null = null;
  totalCount = 0;
  loading = false;
  searchText = '';

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
    // Load circulars when filter changes
    this.filterService.filterContext$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(filterContext => {
        this.loadCirculars(filterContext);
      });

    // Track selected circular
    this.stateService.selectedCircular$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(circular => {
        this.selectedCircular = circular;
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private loadCirculars(filterContext: FilterContextDto): void {
    this.loading = true;
    this.dataService.getCirculars(filterContext)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(circulars => {
        this.circulars = circulars;
        this.totalCount = circulars.length;
        this.loading = false;
      });
  }

  selectCircular(circular: CircularDto): void {
    this.stateService.selectCircular(circular);
    this.circularSelected.emit(circular);
  }

  isSelected(circular: CircularDto): boolean {
    return this.selectedCircular?.id === circular.id;
  }

  onSort(event: any): void {
    this.sortField = event.field;
    this.sortOrder = event.order;
    this.filterService.setSorting(event.field, event.order === -1 ? 'desc' : 'asc');
  }

  onRowSelect(event: any): void {
    this.selectCircular(event.data);
  }

  getPercentileClass(percentile: number): string {
    if (percentile >= 80) return 'percentile-high';
    if (percentile >= 50) return 'percentile-medium';
    return 'percentile-low';
  }

  getSizeClass(size: string): string {
    switch (size) {
      case 'large': return 'size-large';
      case 'medium': return 'size-medium';
      case 'small': return 'size-small';
      default: return '';
    }
  }

  get filteredCirculars(): CircularDto[] {
    if (!this.searchText) return this.circulars;
    const search = this.searchText.toLowerCase();
    return this.circulars.filter(c =>
      c.storeName.toLowerCase().includes(search) ||
      c.address.toLowerCase().includes(search) ||
      c.storeNumber.toString().includes(search)
    );
  }
}
```

✓ This file is COMPLETE: YES
✓ All imports included: YES
✓ Compiles standalone: YES

---

### 3. Create `circulars-panel.component.html`

```html
<div class="circulars-panel">
  <!-- Panel Header -->
  <div class="panel-header">
    <div class="header-left">
      <h3 class="panel-title">Circulars</h3>
      <span class="item-count" *ngIf="totalCount > 0">{{ totalCount }} stores</span>
    </div>
    <div class="header-right">
      <span class="p-input-icon-left search-input">
        <i class="pi pi-search"></i>
        <input
          type="text"
          pInputText
          placeholder="Search stores..."
          [(ngModel)]="searchText">
      </span>
    </div>
  </div>

  <!-- Circulars Table -->
  <div class="table-container" *ngIf="!loading">
    <p-table
      [value]="filteredCirculars"
      [sortField]="sortField"
      [sortOrder]="sortOrder"
      (onSort)="onSort($event)"
      selectionMode="single"
      [(selection)]="selectedCircular"
      (onRowSelect)="onRowSelect($event)"
      [scrollable]="true"
      scrollHeight="flex"
      styleClass="p-datatable-sm circulars-table">

      <ng-template pTemplate="header">
        <tr>
          <th pSortableColumn="storeName" style="min-width: 200px">
            Store <p-sortIcon field="storeName"></p-sortIcon>
          </th>
          <th pSortableColumn="storeNumber" style="width: 100px">
            Store # <p-sortIcon field="storeNumber"></p-sortIcon>
          </th>
          <th style="width: 80px">Size</th>
          <th pSortableColumn="promotionCount" style="width: 100px">
            Promos <p-sortIcon field="promotionCount"></p-sortIcon>
          </th>
          <th style="width: 200px">Performance</th>
          <th pSortableColumn="percentile" style="width: 80px">
            Rank <p-sortIcon field="percentile"></p-sortIcon>
          </th>
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-circular>
        <tr [pSelectableRow]="circular" [class.selected-row]="isSelected(circular)">
          <td>
            <div class="store-info">
              <span class="store-name">{{ circular.storeName }}</span>
              <span class="store-address">{{ circular.address }}</span>
            </div>
          </td>
          <td>{{ circular.storeNumber }}</td>
          <td>
            <span class="size-badge" [ngClass]="getSizeClass(circular.size)">
              {{ circular.size }}
            </span>
          </td>
          <td>{{ circular.promotionCount }}</td>
          <td>
            <dh-performance-chart
              [civValue]="circular.civ"
              [ccValue]="circular.cc"
              [atlValue]="circular.atl"
              [height]="24"
              [compact]="true">
            </dh-performance-chart>
          </td>
          <td>
            <span class="percentile-badge" [ngClass]="getPercentileClass(circular.percentile)">
              {{ circular.percentile }}%
            </span>
          </td>
        </tr>
      </ng-template>

      <ng-template pTemplate="emptymessage">
        <tr>
          <td colspan="6" class="empty-message">
            <span class="material-symbols-outlined">store</span>
            <p>No stores found</p>
          </td>
        </tr>
      </ng-template>
    </p-table>
  </div>

  <!-- Loading State -->
  <div class="loading-container" *ngIf="loading">
    <p-skeleton *ngFor="let i of [1,2,3,4,5,6,7,8]"
                width="100%" height="48px" styleClass="mb-2">
    </p-skeleton>
  </div>

  <!-- Pagination -->
  <dh-pagination-controls [totalItems]="filteredCirculars.length"></dh-pagination-controls>
</div>
```

✓ This file is COMPLETE: YES
✓ All imports included: N/A (HTML)
✓ Compiles standalone: YES

---

### 4. Create `circulars-panel.component.scss`

```scss
@import '../../../styles/design-tokens';

.circulars-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-md;
  border-bottom: 1px solid $gray-200;
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: $spacing-sm;
}

.panel-title {
  margin: 0;
  font-size: $font-size-lg;
  font-weight: 600;
  color: $gray-800;
}

.item-count {
  font-size: $font-size-sm;
  color: $gray-500;
}

.search-input {
  input {
    width: 200px;
  }
}

.table-container {
  flex: 1;
  overflow: hidden;

  :host ::ng-deep .circulars-table {
    .p-datatable-wrapper {
      overflow: auto;
    }

    .p-datatable-thead > tr > th {
      background: $gray-50;
      font-weight: 600;
      font-size: $font-size-xs;
      text-transform: uppercase;
      color: $gray-600;
    }

    .p-datatable-tbody > tr {
      cursor: pointer;

      &:hover {
        background: $gray-50;
      }

      // Selected row uses metric-views-color (Blue #4272D8)
      &.selected-row {
        background: rgba($metric-views-color, 0.08);
      }

      > td {
        padding: $spacing-sm $spacing-md;
        font-size: $font-size-sm;
      }
    }
  }
}

.store-info {
  display: flex;
  flex-direction: column;
}

.store-name {
  font-weight: 600;
  color: $gray-800;
}

.store-address {
  font-size: $font-size-xs;
  color: $gray-500;
}

// Size badges use metric colors for visual consistency
.size-badge {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: $radius-sm;
  font-size: $font-size-xs;
  font-weight: 600;
  text-transform: capitalize;

  // Large - Blue (#4272D8)
  &.size-large {
    background: rgba($metric-views-color, 0.1);
    color: $metric-views-color;
  }

  // Medium - Green (#B8D64D)
  &.size-medium {
    background: rgba($metric-clicks-color, 0.1);
    color: darken($metric-clicks-color, 15%);
  }

  // Small - Gray
  &.size-small {
    background: rgba($gray-500, 0.1);
    color: $gray-600;
  }
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

.loading-container {
  padding: $spacing-md;
}
```

✓ This file is COMPLETE: YES
✓ All imports included: YES (design-tokens)
✓ Compiles standalone: YES

---

### 5. Update Components Index

Update `/src/app/analytic-dashboard/components/index.ts` - **ADD**:

```typescript
// Add to imports section
import { CircularsPanelComponent } from './base-view/circulars-panel/circulars-panel.component';

// Add to components array
export const components = [
  // ... existing components
  CircularsPanelComponent
];

// Add to exports section
export * from './base-view/circulars-panel/circulars-panel.component';
```

---

### 6. Update Container Template

Update `/src/app/analytic-dashboard/components/analytic-dashboard/analytic-dashboard.component.html`:

Replace the circulars placeholder:
```html
<!-- OLD -->
<div class="placeholder-panel" *ngIf="showCircularsTab">
  <p>Circulars Panel - Coming Soon (Prompt 10B)</p>
</div>

<!-- NEW -->
<dh-circulars-panel *ngIf="showCircularsTab"></dh-circulars-panel>
```

---

## SMOKE TEST

### Quick Compile Check
```bash
cd /Users/billklingensmith/Code/ideal-sale-circular
yarn build 2>&1 | grep -E "(error|ERROR)" | head -20
```

### Visual Verification
Navigate to: `http://localhost:4200/analytics`

1. Click **Circulars** tab in context bar
2. Expected: Table of stores displays with columns:
   - Store (name + address)
   - Store # (number)
   - Size (badge: large/medium/small)
   - Promos (count)
   - Performance (bar chart)
   - Rank (percentile badge)

3. Interaction test:
   - Type in search box → table should filter by store name, address, or number
   - Click column headers → table should sort
   - Click a row → should highlight and open detail panel with store info

---

## SENIOR DEV REVIEW CHECKLIST

Before finalizing, verify:

### Code Quality
- [ ] All code blocks complete (no `// ...`)
- [ ] All imports explicitly listed
- [ ] No hardcoded color values (uses $metric-* variables)
- [ ] Component selector uses `dh-` prefix
- [ ] Services via constructor injection

### Consistency with Prompt 00
- [ ] Variables: `civ`, `cc`, `atl`, `compositeScore`
- [ ] Colors: $metric-views-color for selected row, $metric-clicks-color for size-medium
- [ ] Formula reference in component comment

### Angular Patterns
- [ ] OnDestroy with takeUntil pattern
- [ ] @Output EventEmitter typed properly
- [ ] Services via constructor injection
- [ ] PrimeNG Table integration correct

### Would this compile on first try? [YES]

---

## CHECKPOINT G: All BASE View Tabs Complete

Before proceeding to Prompt 11 (Grid Inquiry View), verify:

### Compile Check
```bash
cd /Users/billklingensmith/Code/ideal-sale-circular
yarn build
```
Expected: No errors

### All Three Tabs Functional:
- [ ] **Promotions tab**: Table with filtering, sorting, card view toggle
- [ ] **Categories tab**: Grid of category cards with metrics
- [ ] **Circulars tab**: Searchable table of stores

### Selection & Detail Panel:
- [ ] Clicking any item opens detail panel
- [ ] Detail panel shows appropriate content based on item type
- [ ] Close button dismisses panel

### Component Inventory (All BASE view components):
- [ ] `dh-category-sidebar` (from 08A)
- [ ] `dh-promotions-panel` (from 08B)
- [ ] `dh-detail-panel` (from 09A)
- [ ] `dh-categories-panel` (from 10A)
- [ ] `dh-circulars-panel` (from 10B)

### Issues Found:
(List any issues here before continuing)

### Ready to Continue to Prompt 11: [YES/NO]

---

## Notes for Prompt 11
- All three BASE view tabs are now complete
- Grid Inquiry view is next (full-width data grid for advanced queries)
- Uses same data services but different layout
- Full-width mode without sidebar/detail panel
