# Prompt 08: Category Sidebar + Promotions Panel

## Context
You are implementing the Analytics Dashboard feature in the `ideal-sale-circular` Angular repository. This is prompt 8 of 12. Context bar and view switcher have been set up in prompt 07.

## Working Directory
`/Users/billklingensmith/Code/ideal-sale-circular`

## Objective
Create CategorySidebarComponent (left panel) and PromotionsPanelComponent (center panel) for the BASE view's three-column layout.

---

## Tasks

### 1. Create Base View Folder

Create folder: `/src/app/analytic-dashboard/components/base-view/`

### 2. Create Category Sidebar Component

This is the left panel showing category list with counts and selection.

#### 2.1 Create component folder
`/src/app/analytic-dashboard/components/base-view/category-sidebar/`

#### 2.2 Create `category-sidebar.component.ts`
```typescript
import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AnalyticsDataService, AnalyticsFilterService, AnalyticsStateService } from '../../../services';
import { CategoryDto, FilterContextDto } from '../../../dto';

/**
 * Left sidebar showing category list with selection
 */
@Component({
  selector: 'dh-category-sidebar',
  templateUrl: './category-sidebar.component.html',
  styleUrls: ['./category-sidebar.component.scss']
})
export class CategorySidebarComponent implements OnInit, OnDestroy {

  @Output() categorySelected = new EventEmitter<CategoryDto | null>();

  categories: CategoryDto[] = [];
  selectedCategoryId: string | null = null;
  loading = false;
  searchText = '';

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

    // Track selected category from state
    this.stateService.selectedCategory$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(category => {
        this.selectedCategoryId = category?.id || null;
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
        this.categories = categories;
        this.loading = false;
      });
  }

  selectCategory(category: CategoryDto | null): void {
    if (category && this.selectedCategoryId === category.id) {
      // Deselect if clicking same category
      this.selectedCategoryId = null;
      this.filterService.setCategoryIds([]);
      this.stateService.selectCategory(null);
      this.categorySelected.emit(null);
    } else {
      this.selectedCategoryId = category?.id || null;
      if (category) {
        this.filterService.setCategoryIds([category.id]);
        this.stateService.selectCategory(category);
      } else {
        this.filterService.setCategoryIds([]);
        this.stateService.selectCategory(null);
      }
      this.categorySelected.emit(category);
    }
  }

  selectAll(): void {
    this.selectCategory(null);
  }

  isSelected(category: CategoryDto): boolean {
    return this.selectedCategoryId === category.id;
  }

  get filteredCategories(): CategoryDto[] {
    if (!this.searchText) return this.categories;
    const search = this.searchText.toLowerCase();
    return this.categories.filter(c =>
      c.name.toLowerCase().includes(search)
    );
  }

  get totalPromotions(): number {
    return this.categories.reduce((sum, c) => sum + c.promotionCount, 0);
  }

  getPerformanceWidth(category: CategoryDto): number {
    if (this.categories.length === 0) return 0;
    const maxScore = Math.max(...this.categories.map(c => c.compositeScore));
    return maxScore > 0 ? (category.compositeScore / maxScore) * 100 : 0;
  }
}
```

#### 2.3 Create `category-sidebar.component.html`
```html
<div class="category-sidebar">
  <!-- Search -->
  <div class="sidebar-search">
    <span class="p-input-icon-left">
      <i class="pi pi-search"></i>
      <input
        type="text"
        pInputText
        placeholder="Search categories..."
        [(ngModel)]="searchText">
    </span>
  </div>

  <!-- All Categories Option -->
  <div class="category-item all-categories"
       [class.selected]="!selectedCategoryId"
       (click)="selectAll()">
    <div class="category-info">
      <span class="category-name">All Categories</span>
      <span class="category-count">{{ totalPromotions }} promotions</span>
    </div>
  </div>

  <!-- Category List -->
  <div class="category-list" *ngIf="!loading; else loadingTpl">
    <div
      *ngFor="let category of filteredCategories"
      class="category-item"
      [class.selected]="isSelected(category)"
      (click)="selectCategory(category)">
      <div class="category-info">
        <span class="category-name">{{ category.name }}</span>
        <span class="category-count">{{ category.promotionCount }}</span>
      </div>
      <div class="category-performance">
        <div class="performance-bar">
          <div class="performance-fill" [style.width.%]="getPerformanceWidth(category)"></div>
        </div>
        <dh-metric-display
          [metrics]="category"
          layout="compact"
          [showLabels]="false">
        </dh-metric-display>
      </div>
    </div>
  </div>

  <ng-template #loadingTpl>
    <div class="loading-list">
      <p-skeleton *ngFor="let i of [1,2,3,4,5,6,7,8]"
                  width="100%" height="56px" styleClass="mb-2">
      </p-skeleton>
    </div>
  </ng-template>
</div>
```

#### 2.4 Create `category-sidebar.component.scss`
```scss
@import '../../../styles/design-tokens';

.category-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border-right: 1px solid $gray-200;
}

.sidebar-search {
  padding: $spacing-md;
  border-bottom: 1px solid $gray-200;

  .p-input-icon-left {
    width: 100%;

    input {
      width: 100%;
      font-size: $font-size-sm;
    }
  }
}

.category-list {
  flex: 1;
  overflow-y: auto;
}

.category-item {
  padding: $spacing-sm $spacing-md;
  border-bottom: 1px solid $gray-100;
  cursor: pointer;
  transition: background $transition-fast;

  &:hover {
    background: $gray-50;
  }

  &.selected {
    background: rgba($metric-views-color, 0.08);
    border-left: 3px solid $metric-views-color;
    padding-left: calc(#{$spacing-md} - 3px);
  }

  &.all-categories {
    background: $gray-50;
    border-bottom: 2px solid $gray-200;

    .category-name {
      font-weight: 600;
    }
  }
}

.category-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-xs;
}

.category-name {
  font-size: $font-size-sm;
  font-weight: 500;
  color: $gray-800;
}

.category-count {
  font-size: $font-size-xs;
  color: $gray-500;
}

.category-performance {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.performance-bar {
  flex: 1;
  height: 4px;
  background: $gray-200;
  border-radius: 2px;
  overflow: hidden;
}

.performance-fill {
  height: 100%;
  background: linear-gradient(90deg, $metric-views-color, $metric-clicks-color, $metric-adds-color);
  border-radius: 2px;
  transition: width $transition-normal;
}

.loading-list {
  padding: $spacing-md;
}
```

### 3. Create Promotions Panel Component

This is the center panel showing promotions in table or card grid view.

#### 3.1 Create component folder
`/src/app/analytic-dashboard/components/base-view/promotions-panel/`

#### 3.2 Create `promotions-panel.component.ts`
```typescript
import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AnalyticsDataService, AnalyticsFilterService, AnalyticsStateService } from '../../../services';
import { PromotionDto, FilterContextDto } from '../../../dto';

/**
 * Center panel showing promotions table or card grid
 */
@Component({
  selector: 'dh-promotions-panel',
  templateUrl: './promotions-panel.component.html',
  styleUrls: ['./promotions-panel.component.scss']
})
export class PromotionsPanelComponent implements OnInit, OnDestroy {

  @Output() promotionSelected = new EventEmitter<PromotionDto>();

  promotions: PromotionDto[] = [];
  selectedPromotion: PromotionDto | null = null;
  totalCount = 0;
  loading = false;
  cardViewEnabled = false;

  // Table sorting
  sortField = 'compositeScore';
  sortOrder = -1; // -1 = desc, 1 = asc

  private unsubscribe$ = new Subject<void>();

  constructor(
    private dataService: AnalyticsDataService,
    private filterService: AnalyticsFilterService,
    private stateService: AnalyticsStateService
  ) {}

  ngOnInit(): void {
    // Load promotions when filter changes
    this.filterService.filterContext$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(filter => {
        this.loadPromotions(filter);
      });

    // Track card view state
    this.stateService.cardViewEnabled$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(enabled => {
        this.cardViewEnabled = enabled;
      });

    // Track selected promotion
    this.stateService.selectedPromotion$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(promotion => {
        this.selectedPromotion = promotion;
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private loadPromotions(filter: FilterContextDto): void {
    this.loading = true;
    this.dataService.getPromotions(filter)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(promotions => {
        this.promotions = promotions;
        this.totalCount = promotions.length;
        this.loading = false;
      });
  }

  selectPromotion(promotion: PromotionDto): void {
    this.stateService.selectPromotion(promotion);
    this.promotionSelected.emit(promotion);
  }

  isSelected(promotion: PromotionDto): boolean {
    return this.selectedPromotion?.id === promotion.id;
  }

  toggleCardView(): void {
    this.stateService.toggleCardView();
  }

  onSort(event: any): void {
    this.sortField = event.field;
    this.sortOrder = event.order;
    this.filterService.setSorting(event.field, event.order === -1 ? 'desc' : 'asc');
  }

  onRowSelect(event: any): void {
    this.selectPromotion(event.data);
  }

  getPercentileClass(percentile: number): string {
    if (percentile >= 80) return 'percentile-high';
    if (percentile >= 50) return 'percentile-medium';
    return 'percentile-low';
  }

  formatPrice(price: number): string {
    return '$' + price.toFixed(2);
  }
}
```

#### 3.3 Create `promotions-panel.component.html`
```html
<div class="promotions-panel">
  <!-- Panel Header -->
  <div class="panel-header">
    <div class="header-left">
      <h3 class="panel-title">Promotions</h3>
      <span class="item-count" *ngIf="totalCount > 0">{{ totalCount }} items</span>
    </div>
    <div class="header-right">
      <!-- View Toggle -->
      <div class="view-toggle">
        <button
          pButton
          type="button"
          [icon]="cardViewEnabled ? 'pi pi-list' : 'pi pi-th-large'"
          [pTooltip]="cardViewEnabled ? 'Table View' : 'Card View'"
          tooltipPosition="bottom"
          class="p-button-text p-button-sm"
          (click)="toggleCardView()">
        </button>
      </div>
    </div>
  </div>

  <!-- Table View -->
  <div class="table-container" *ngIf="!cardViewEnabled && !loading">
    <p-table
      [value]="promotions"
      [sortField]="sortField"
      [sortOrder]="sortOrder"
      (onSort)="onSort($event)"
      selectionMode="single"
      [(selection)]="selectedPromotion"
      (onRowSelect)="onRowSelect($event)"
      [scrollable]="true"
      scrollHeight="flex"
      styleClass="p-datatable-sm promotions-table">

      <ng-template pTemplate="header">
        <tr>
          <th pSortableColumn="name" style="min-width: 200px">
            Promotion <p-sortIcon field="name"></p-sortIcon>
          </th>
          <th pSortableColumn="categoryName" style="width: 120px">
            Category <p-sortIcon field="categoryName"></p-sortIcon>
          </th>
          <th pSortableColumn="dealType" style="width: 100px">
            Deal Type <p-sortIcon field="dealType"></p-sortIcon>
          </th>
          <th pSortableColumn="salePrice" style="width: 80px">
            Price <p-sortIcon field="salePrice"></p-sortIcon>
          </th>
          <th style="width: 200px">Performance</th>
          <th pSortableColumn="percentile" style="width: 80px">
            Rank <p-sortIcon field="percentile"></p-sortIcon>
          </th>
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-promo>
        <tr [pSelectableRow]="promo" [class.selected-row]="isSelected(promo)">
          <td>
            <div class="promo-name">
              <span class="card-size-badge">{{ promo.cardSize }}</span>
              {{ promo.name }}
            </div>
          </td>
          <td>{{ promo.categoryName }}</td>
          <td>
            <p-tag [value]="promo.dealType" styleClass="deal-tag"></p-tag>
          </td>
          <td>
            <div class="price-cell">
              <span class="original-price" *ngIf="promo.originalPrice !== promo.salePrice">
                {{ formatPrice(promo.originalPrice) }}
              </span>
              <span class="sale-price">{{ formatPrice(promo.salePrice) }}</span>
            </div>
          </td>
          <td>
            <dh-performance-chart
              [civValue]="promo.civ"
              [ccValue]="promo.cc"
              [atlValue]="promo.atl"
              [height]="24"
              [compact]="true">
            </dh-performance-chart>
          </td>
          <td>
            <span class="percentile-badge" [ngClass]="getPercentileClass(promo.percentile)">
              {{ promo.percentile }}%
            </span>
          </td>
        </tr>
      </ng-template>

      <ng-template pTemplate="emptymessage">
        <tr>
          <td colspan="6" class="empty-message">
            <span class="material-symbols-outlined">search_off</span>
            <p>No promotions found matching your filters</p>
          </td>
        </tr>
      </ng-template>
    </p-table>
  </div>

  <!-- Card Grid View -->
  <div class="card-grid" *ngIf="cardViewEnabled && !loading">
    <div
      *ngFor="let promo of promotions"
      class="promo-card"
      [class.selected]="isSelected(promo)"
      (click)="selectPromotion(promo)">
      <div class="card-header">
        <span class="card-size-badge">{{ promo.cardSize }}</span>
        <span class="percentile-badge" [ngClass]="getPercentileClass(promo.percentile)">
          {{ promo.percentile }}%
        </span>
      </div>
      <h4 class="card-title">{{ promo.name }}</h4>
      <p class="card-category">{{ promo.categoryName }}</p>
      <div class="card-pricing">
        <span class="original-price" *ngIf="promo.originalPrice !== promo.salePrice">
          {{ formatPrice(promo.originalPrice) }}
        </span>
        <span class="sale-price">{{ formatPrice(promo.salePrice) }}</span>
        <p-tag [value]="promo.dealType" styleClass="deal-tag"></p-tag>
      </div>
      <dh-performance-chart
        [civValue]="promo.civ"
        [ccValue]="promo.cc"
        [atlValue]="promo.atl"
        [height]="24"
        [compact]="true">
      </dh-performance-chart>
    </div>
  </div>

  <!-- Loading State -->
  <div class="loading-container" *ngIf="loading">
    <p-skeleton *ngFor="let i of [1,2,3,4,5,6,7,8]"
                width="100%" height="48px" styleClass="mb-2">
    </p-skeleton>
  </div>

  <!-- Pagination -->
  <dh-pagination-controls [totalItems]="totalCount"></dh-pagination-controls>
</div>
```

#### 3.4 Create `promotions-panel.component.scss`
```scss
@import '../../../styles/design-tokens';

.promotions-panel {
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

.header-right {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

// Table Styles
.table-container {
  flex: 1;
  overflow: hidden;

  :host ::ng-deep .promotions-table {
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

.promo-name {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.card-size-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 6px;
  background: $gray-200;
  border-radius: $radius-sm;
  font-size: 10px;
  font-weight: 600;
  color: $gray-700;
}

.price-cell {
  display: flex;
  flex-direction: column;
}

.original-price {
  font-size: $font-size-xs;
  color: $gray-500;
  text-decoration: line-through;
}

.sale-price {
  font-weight: 600;
  color: $gray-800;
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

// Card Grid Styles
.card-grid {
  flex: 1;
  overflow-y: auto;
  padding: $spacing-md;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: $spacing-md;
  align-content: start;
}

.promo-card {
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
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-sm;
}

.card-title {
  margin: 0 0 $spacing-xs 0;
  font-size: $font-size-sm;
  font-weight: 600;
  color: $gray-800;
  line-height: 1.3;
}

.card-category {
  margin: 0 0 $spacing-sm 0;
  font-size: $font-size-xs;
  color: $gray-500;
}

.card-pricing {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-sm;
}

.loading-container {
  padding: $spacing-md;
}
```

### 4. Update Components Index

Update `/src/app/analytic-dashboard/components/index.ts`:
```typescript
// ... existing imports
import { CategorySidebarComponent } from './base-view/category-sidebar/category-sidebar.component';
import { PromotionsPanelComponent } from './base-view/promotions-panel/promotions-panel.component';

export const components = [
  // ... existing components
  CategorySidebarComponent,
  PromotionsPanelComponent
];

// ... existing exports
export * from './base-view/category-sidebar/category-sidebar.component';
export * from './base-view/promotions-panel/promotions-panel.component';
```

---

## Files to Create
- `/src/app/analytic-dashboard/components/base-view/category-sidebar/category-sidebar.component.ts`
- `/src/app/analytic-dashboard/components/base-view/category-sidebar/category-sidebar.component.html`
- `/src/app/analytic-dashboard/components/base-view/category-sidebar/category-sidebar.component.scss`
- `/src/app/analytic-dashboard/components/base-view/promotions-panel/promotions-panel.component.ts`
- `/src/app/analytic-dashboard/components/base-view/promotions-panel/promotions-panel.component.html`
- `/src/app/analytic-dashboard/components/base-view/promotions-panel/promotions-panel.component.scss`

## Files to Modify
- `/src/app/analytic-dashboard/components/index.ts` - Add new components

---

## Verification Steps

1. Run `yarn build` - Should compile without errors
2. Test CategorySidebarComponent:
   - Verify categories load and display
   - Verify selection highlights and filters promotions
   - Verify performance bars render
3. Test PromotionsPanelComponent:
   - Verify promotions load in table view
   - Verify card view toggle works
   - Verify sorting works
   - Verify selection opens detail panel
   - Verify pagination controls work

---

## Notes for Next Prompt
- Left and center panels of BASE view complete
- Category selection filters promotions
- Table and card views available
- Ready for detail panel (right) in next prompt
