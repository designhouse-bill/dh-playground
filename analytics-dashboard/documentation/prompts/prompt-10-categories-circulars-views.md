# Prompt 10: Categories + Circulars Views

## Context
You are implementing the Analytics Dashboard feature in the `ideal-sale-circular` Angular repository. This is prompt 10 of 12. The MVP BASE view with Promotions is complete from prompt 09.

## Working Directory
`/Users/billklingensmith/Code/ideal-sale-circular`

## Objective
Create CategoriesPanelComponent and CircularsPanelComponent to complete all three tabs of the BASE view.

---

## Tasks

### 1. Create Categories Panel Component

This is the center panel content when the Categories tab is selected.

#### 1.1 Create component folder
`/src/app/analytic-dashboard/components/base-view/categories-panel/`

#### 1.2 Create `categories-panel.component.ts`
```typescript
import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AnalyticsDataService, AnalyticsFilterService, AnalyticsStateService } from '../../../services';
import { CategoryDto, FilterContextDto } from '../../../dto';

/**
 * Center panel showing categories grid view
 */
@Component({
  selector: 'dh-categories-panel',
  templateUrl: './categories-panel.component.html',
  styleUrls: ['./categories-panel.component.scss']
})
export class CategoriesPanelComponent implements OnInit, OnDestroy {

  @Output() categorySelected = new EventEmitter<CategoryDto>();

  categories: CategoryDto[] = [];
  selectedCategory: CategoryDto | null = null;
  totalCount = 0;
  loading = false;

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
    // Load categories when filter changes
    this.filterService.filterContext$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(filter => {
        this.loadCategories(filter);
      });

    // Track selected category
    this.stateService.selectedCategory$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(category => {
        this.selectedCategory = category;
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private loadCategories(filter: FilterContextDto): void {
    this.loading = true;
    this.dataService.getCategories(filter)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(categories => {
        this.categories = this.sortCategories(categories);
        this.totalCount = categories.length;
        this.loading = false;
      });
  }

  private sortCategories(categories: CategoryDto[]): CategoryDto[] {
    return [...categories].sort((a, b) => {
      const aVal = a[this.sortField];
      const bVal = b[this.sortField];
      return this.sortOrder === -1 ? bVal - aVal : aVal - bVal;
    });
  }

  selectCategory(category: CategoryDto): void {
    this.stateService.selectCategory(category);
    this.categorySelected.emit(category);
  }

  isSelected(category: CategoryDto): boolean {
    return this.selectedCategory?.id === category.id;
  }

  onSortChange(event: any): void {
    this.sortField = event.value;
    this.categories = this.sortCategories(this.categories);
  }

  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === -1 ? 1 : -1;
    this.categories = this.sortCategories(this.categories);
  }

  getPercentileClass(percentile: number): string {
    if (percentile >= 80) return 'percentile-high';
    if (percentile >= 50) return 'percentile-medium';
    return 'percentile-low';
  }

  formatNumber(value: number): string {
    return value.toLocaleString();
  }

  getMaxScore(): number {
    if (this.categories.length === 0) return 1;
    return Math.max(...this.categories.map(c => c.compositeScore));
  }

  sortOptions = [
    { label: 'Performance', value: 'compositeScore' },
    { label: 'Views (CIV)', value: 'civ' },
    { label: 'Clicks (CC)', value: 'cc' },
    { label: 'Adds (ATL)', value: 'atl' },
    { label: 'Promotions', value: 'promotionCount' },
    { label: 'Name', value: 'name' }
  ];
}
```

#### 1.3 Create `categories-panel.component.html`
```html
<div class="categories-panel">
  <!-- Panel Header -->
  <div class="panel-header">
    <div class="header-left">
      <h3 class="panel-title">Categories</h3>
      <span class="item-count" *ngIf="totalCount > 0">{{ totalCount }} categories</span>
    </div>
    <div class="header-right">
      <div class="sort-controls">
        <span class="sort-label">Sort by</span>
        <p-dropdown
          [options]="sortOptions"
          [(ngModel)]="sortField"
          (onChange)="onSortChange($event)"
          optionLabel="label"
          optionValue="value"
          styleClass="sort-dropdown">
        </p-dropdown>
        <button
          pButton
          type="button"
          [icon]="sortOrder === -1 ? 'pi pi-sort-amount-down' : 'pi pi-sort-amount-up'"
          class="p-button-text p-button-sm"
          (click)="toggleSortOrder()">
        </button>
      </div>
    </div>
  </div>

  <!-- Categories Grid -->
  <div class="categories-grid" *ngIf="!loading">
    <div
      *ngFor="let category of categories"
      class="category-card"
      [class.selected]="isSelected(category)"
      (click)="selectCategory(category)">

      <div class="card-header">
        <h4 class="category-name">{{ category.name }}</h4>
        <span class="percentile-badge" [ngClass]="getPercentileClass(category.percentile)">
          {{ category.percentile }}%
        </span>
      </div>

      <div class="card-stats">
        <span class="promo-count">{{ category.promotionCount }} promotions</span>
      </div>

      <div class="card-metrics">
        <dh-metric-display
          [metrics]="category"
          layout="horizontal"
          [showLabels]="true">
        </dh-metric-display>
      </div>

      <div class="card-chart">
        <dh-performance-chart
          [civValue]="category.civ"
          [ccValue]="category.cc"
          [atlValue]="category.atl"
          [maxValue]="getMaxScore()"
          [height]="28"
          [compact]="true">
        </dh-performance-chart>
      </div>

      <div class="card-footer">
        <span class="score-label">Performance Score</span>
        <span class="score-value">{{ formatNumber(category.compositeScore) }}</span>
      </div>
    </div>
  </div>

  <!-- Loading State -->
  <div class="loading-grid" *ngIf="loading">
    <p-skeleton *ngFor="let i of [1,2,3,4,5,6,7,8]"
                width="100%" height="180px" styleClass="category-skeleton">
    </p-skeleton>
  </div>

  <!-- Empty State -->
  <div class="empty-state" *ngIf="!loading && categories.length === 0">
    <span class="material-symbols-outlined">category</span>
    <p>No categories found</p>
  </div>
</div>
```

#### 1.4 Create `categories-panel.component.scss`
```scss
@import '../../../styles/design-tokens';

.categories-panel {
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

.sort-controls {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.sort-label {
  font-size: $font-size-sm;
  color: $gray-600;
}

:host ::ng-deep .sort-dropdown {
  .p-dropdown {
    min-width: 140px;
  }
}

.categories-grid {
  flex: 1;
  overflow-y: auto;
  padding: $spacing-md;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: $spacing-md;
  align-content: start;
}

.category-card {
  padding: $spacing-md;
  background: white;
  border: 1px solid $gray-200;
  border-radius: $radius-md;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover {
    border-color: $metric-views-color;
    box-shadow: $shadow-md;
  }

  &.selected {
    border-color: $metric-views-color;
    background: rgba($metric-views-color, 0.05);
    box-shadow: $shadow-md;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: $spacing-sm;
}

.category-name {
  margin: 0;
  font-size: $font-size-md;
  font-weight: 600;
  color: $gray-800;
  line-height: 1.3;
}

.percentile-badge {
  padding: 2px 8px;
  border-radius: $radius-sm;
  font-size: $font-size-xs;
  font-weight: 600;
  flex-shrink: 0;

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

.card-stats {
  margin-bottom: $spacing-md;
}

.promo-count {
  font-size: $font-size-sm;
  color: $gray-600;
}

.card-metrics {
  margin-bottom: $spacing-md;
}

.card-chart {
  margin-bottom: $spacing-md;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: $spacing-sm;
  border-top: 1px solid $gray-100;
}

.score-label {
  font-size: $font-size-xs;
  color: $gray-500;
}

.score-value {
  font-size: $font-size-md;
  font-weight: 700;
  color: $metric-total-color;
}

.loading-grid {
  padding: $spacing-md;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: $spacing-md;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: $gray-400;

  .material-symbols-outlined {
    font-size: 48px;
    margin-bottom: $spacing-md;
  }

  p {
    margin: 0;
  }
}
```

### 2. Create Circulars Panel Component

#### 2.1 Create component folder
`/src/app/analytic-dashboard/components/base-view/circulars-panel/`

#### 2.2 Create `circulars-panel.component.ts`
```typescript
import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AnalyticsDataService, AnalyticsFilterService, AnalyticsStateService } from '../../../services';
import { CircularDto, FilterContextDto } from '../../../dto';

/**
 * Center panel showing circulars/stores list
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
      .subscribe(filter => {
        this.loadCirculars(filter);
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

  private loadCirculars(filter: FilterContextDto): void {
    this.loading = true;
    this.dataService.getCirculars(filter)
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

#### 2.3 Create `circulars-panel.component.html`
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

#### 2.4 Create `circulars-panel.component.scss`
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

.size-badge {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: $radius-sm;
  font-size: $font-size-xs;
  font-weight: 600;
  text-transform: capitalize;

  &.size-large {
    background: rgba($metric-views-color, 0.1);
    color: $metric-views-color;
  }

  &.size-medium {
    background: rgba($metric-clicks-color, 0.1);
    color: darken($metric-clicks-color, 15%);
  }

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

### 3. Update Main Container Template

Update `/src/app/analytic-dashboard/components/analytic-dashboard/analytic-dashboard.component.html` to use the new panels:

```html
<!-- Replace placeholder panels with actual components -->

<!-- In the center-panel section, replace: -->
<main class="center-panel">
  <dh-promotions-panel *ngIf="showPromotionsTab"></dh-promotions-panel>
  <dh-categories-panel *ngIf="showCategoriesTab"></dh-categories-panel>
  <dh-circulars-panel *ngIf="showCircularsTab"></dh-circulars-panel>
</main>
```

### 4. Update Components Index

Update `/src/app/analytic-dashboard/components/index.ts`:
```typescript
// ... existing imports
import { CategoriesPanelComponent } from './base-view/categories-panel/categories-panel.component';
import { CircularsPanelComponent } from './base-view/circulars-panel/circulars-panel.component';

export const components = [
  // ... existing components
  CategoriesPanelComponent,
  CircularsPanelComponent
];

// ... existing exports
export * from './base-view/categories-panel/categories-panel.component';
export * from './base-view/circulars-panel/circulars-panel.component';
```

---

## Files to Create
- `/src/app/analytic-dashboard/components/base-view/categories-panel/categories-panel.component.ts`
- `/src/app/analytic-dashboard/components/base-view/categories-panel/categories-panel.component.html`
- `/src/app/analytic-dashboard/components/base-view/categories-panel/categories-panel.component.scss`
- `/src/app/analytic-dashboard/components/base-view/circulars-panel/circulars-panel.component.ts`
- `/src/app/analytic-dashboard/components/base-view/circulars-panel/circulars-panel.component.html`
- `/src/app/analytic-dashboard/components/base-view/circulars-panel/circulars-panel.component.scss`

## Files to Modify
- `/src/app/analytic-dashboard/components/analytic-dashboard/analytic-dashboard.component.html`
- `/src/app/analytic-dashboard/components/index.ts`

---

## Verification Steps

1. Run `yarn build` - Should compile without errors
2. Navigate to Analytics Dashboard
3. Click Categories tab - verify categories grid displays
4. Click a category card - verify detail panel shows category info
5. Verify sorting works on categories
6. Click Circulars tab - verify stores table displays
7. Click a store row - verify detail panel shows store info
8. Verify search filters stores
9. All three BASE view tabs should now be fully functional

---

## Notes for Next Prompt
- All three BASE view tabs are complete
- Grid Inquiry view is next (full-width data grid)
- Compare view follows in prompt 12
