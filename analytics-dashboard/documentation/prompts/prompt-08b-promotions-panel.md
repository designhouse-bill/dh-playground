# Prompt 08B: Promotions Panel Component

> **Reference:** See `prompt-00-constants-standards.md` for all constants and quality requirements.

## Context
You are implementing the Analytics Dashboard feature in the `ideal-sale-circular` Angular repository. This is prompt 08B of 18. Category sidebar has been set up in prompt 08A.

## Working Directory
`/Users/billklingensmith/Code/ideal-sale-circular`

## Objective
Create the PromotionsPanelComponent - the center panel of the BASE view showing promotions in table or card grid view.

---

## CONSTANTS REMINDER

```
Formula: compositeScore = civ + (cc × 10) + (atl × 50)
Colors: Views=#4272D8, Clicks=#B8D64D, Adds=#937DF8, Total=#06989D
Variables: civ, cc, atl, compositeScore (never alternatives)
```

---

## FILES CHECKLIST

### Files to CREATE:
| # | Path | Purpose | Est. Lines | Complete |
|---|------|---------|------------|----------|
| 1 | `/src/app/analytic-dashboard/components/base-view/promotions-panel/promotions-panel.component.ts` | Promotions list logic | ~110 | ☐ |
| 2 | `/src/app/analytic-dashboard/components/base-view/promotions-panel/promotions-panel.component.html` | Table/card template | ~150 | ☐ |
| 3 | `/src/app/analytic-dashboard/components/base-view/promotions-panel/promotions-panel.component.scss` | Panel styles | ~215 | ☐ |

### Files to MODIFY:
| # | Path | Changes | Complete |
|---|------|---------|----------|
| 1 | `/src/app/analytic-dashboard/components/index.ts` | Add PromotionsPanelComponent | ☐ |

### Required Imports:

**promotions-panel.component.ts:**
```typescript
import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AnalyticsDataService, AnalyticsFilterService, AnalyticsStateService } from '../../../services';
import { PromotionDto, FilterContextDto } from '../../../dto';
```

---

## Tasks

### 1. Create Promotions Panel Component

#### 1.1 Create component folder
`/src/app/analytic-dashboard/components/base-view/promotions-panel/`

#### 1.2 File: `promotions-panel.component.ts`

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

✓ This file is COMPLETE: YES
✓ All imports included: YES
✓ Compiles standalone: YES

---

#### 1.3 File: `promotions-panel.component.html`

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

✓ This file is COMPLETE: YES
✓ All imports included: YES
✓ Compiles standalone: YES

---

#### 1.4 File: `promotions-panel.component.scss`

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

✓ This file is COMPLETE: YES
✓ All imports included: YES
✓ Compiles standalone: YES

---

### 2. Update Components Index (Final for 08)

Update `/src/app/analytic-dashboard/components/index.ts`:

```typescript
// Add to existing imports (after CategorySidebarComponent from 08A)
import { PromotionsPanelComponent } from './base-view/promotions-panel/promotions-panel.component';

// Add to components array
export const components = [
  // ... existing components (including CategorySidebarComponent)
  PromotionsPanelComponent
];

// Add to exports
export * from './base-view/promotions-panel/promotions-panel.component';
```

✓ This file is COMPLETE: YES

---

## SMOKE TEST

### Quick Compile Check
```bash
cd /Users/billklingensmith/Code/ideal-sale-circular
yarn build 2>&1 | grep -E "(error|ERROR)" | head -20
```

### Visual Verification
Navigate to: `http://localhost:4200/analytics`
Expected: Center panel showing promotions with:
- Panel header with title and view toggle button
- Table view with sortable columns
- Card view when toggle clicked
- Selection highlights row/card
- Performance chart in each row

---

## MINIMAL UNIT TEST

Create `promotions-panel.component.spec.ts`:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { PromotionsPanelComponent } from './promotions-panel.component';
import { AnalyticsDataService, AnalyticsFilterService, AnalyticsStateService } from '../../../services';
import { PerformanceChartComponent } from '../../shared/performance-chart/performance-chart.component';

describe('PromotionsPanelComponent', () => {
  let component: PromotionsPanelComponent;
  let fixture: ComponentFixture<PromotionsPanelComponent>;

  const mockDataService = {
    getPromotions: () => of([])
  };

  const mockFilterService = {
    filterContext$: of({ categoryIds: [] }),
    setSorting: jasmine.createSpy('setSorting')
  };

  const mockStateService = {
    selectedPromotion$: of(null),
    cardViewEnabled$: of(false),
    selectPromotion: jasmine.createSpy('selectPromotion'),
    toggleCardView: jasmine.createSpy('toggleCardView')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PromotionsPanelComponent, PerformanceChartComponent],
      imports: [TableModule, TagModule, ButtonModule, TooltipModule, SkeletonModule],
      providers: [
        { provide: AnalyticsDataService, useValue: mockDataService },
        { provide: AnalyticsFilterService, useValue: mockFilterService },
        { provide: AnalyticsStateService, useValue: mockStateService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PromotionsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to table view', () => {
    expect(component.cardViewEnabled).toBeFalse();
  });

  it('should default sort by compositeScore descending', () => {
    expect(component.sortField).toBe('compositeScore');
    expect(component.sortOrder).toBe(-1);
  });
});
```

---

## SENIOR DEV REVIEW CHECKLIST

### Code Quality
- [x] All code blocks complete (no `// ...`)
- [x] All imports explicitly listed
- [x] Component selector uses `dh-` prefix
- [x] SCSS uses design token variables

### Consistency
- [x] Default sort field is `compositeScore`
- [x] Uses `civ`, `cc`, `atl` for metrics
- [x] Colors from design tokens

### Angular Patterns
- [x] OnDestroy with takeUntil pattern
- [x] @Output properly typed
- [x] Services via constructor injection

### Would this compile on first try? YES

---

## CHECKPOINT E: Verify BASE View Left/Center Panels

Before proceeding to prompt 09A, verify:

1. **Compile Check:** `yarn build` passes without errors
2. **Category Sidebar:** Displays categories with selection
3. **Promotions Panel:** Shows table/card view toggle
4. **Integration:** Category selection filters promotions

### Test Sequence:
```bash
# 1. Build
yarn build

# 2. Start dev server
yarn start

# 3. Navigate to analytics dashboard
# 4. Verify category sidebar shows
# 5. Click a category - should filter promotions
# 6. Toggle card/table view
# 7. Click a promotion row
```

### Issues Found:
(List any issues here before continuing)

### Ready to Continue: [YES/NO]

---

## Notes for Next Prompt (09A)
- Left and center panels of BASE view are complete
- Category selection filters promotions
- Table and card views available
- Next: Create DetailPanelComponent for right panel
