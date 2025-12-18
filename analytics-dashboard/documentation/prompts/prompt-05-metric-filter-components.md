# Prompt 05: Metric Display + Filter Components

## Prerequisites
- **MUST READ FIRST:** [Prompt 00 - Constants & Standards](./prompt-00-constants-standards.md)
- Completed: [Prompt 04 - Performance Chart Component](./prompt-04-performance-chart.md)
- CHECKPOINT C verified

## Context
You are implementing the Analytics Dashboard feature in the `ideal-sale-circular` Angular repository. This is prompt 5 of 18 in the restructured series. Chart components have been set up in prompt 04.

## Working Directory
`/Users/billklingensmith/Code/ideal-sale-circular`

## Objective
Create MetricDisplayComponent, FilterChipsComponent, and FilterModalComponent for displaying metrics and managing filters.

---

## Tasks

### 1. Create Metric Display Component

#### 1.1 Create component folder
`/src/app/analytic-dashboard/components/shared/metric-display/`

#### 1.2 Create `metric-display.component.ts`
```typescript
import { Component, Input } from '@angular/core';
import { AnalyticsMetricsDto } from '../../../dto';

/**
 * Compact display of analytics metrics (CIV, CC, ATL)
 *
 * @example
 * <dh-metric-display [metrics]="promotion" layout="horizontal"></dh-metric-display>
 */
@Component({
  selector: 'dh-metric-display',
  templateUrl: './metric-display.component.html',
  styleUrls: ['./metric-display.component.scss']
})
export class MetricDisplayComponent {

  @Input() metrics: AnalyticsMetricsDto | null = null;
  @Input() layout: 'horizontal' | 'vertical' | 'compact' = 'horizontal';
  @Input() showLabels: boolean = true;
  @Input() showPercentile: boolean = false;

  readonly COLORS = {
    views: '#4272D8',
    clicks: '#B8D64D',
    adds: '#937DF8',
    performance: '#06989D'
  };

  formatNumber(value: number): string {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toLocaleString();
  }
}
```

#### 1.3 Create `metric-display.component.html`
```html
<div class="metric-display" [class]="layout" *ngIf="metrics">
  <!-- Views (CIV) -->
  <div class="metric-item views">
    <span class="metric-dot" [style.background]="COLORS.views"></span>
    <span class="metric-label" *ngIf="showLabels">CIV</span>
    <span class="metric-value">{{ formatNumber(metrics.civ) }}</span>
  </div>

  <!-- Clicks (CC) -->
  <div class="metric-item clicks">
    <span class="metric-dot" [style.background]="COLORS.clicks"></span>
    <span class="metric-label" *ngIf="showLabels">CC</span>
    <span class="metric-value">{{ formatNumber(metrics.cc) }}</span>
  </div>

  <!-- Adds (ATL) -->
  <div class="metric-item adds">
    <span class="metric-dot" [style.background]="COLORS.adds"></span>
    <span class="metric-label" *ngIf="showLabels">ATL</span>
    <span class="metric-value">{{ formatNumber(metrics.atl) }}</span>
  </div>

  <!-- Percentile (optional) -->
  <div class="metric-item percentile" *ngIf="showPercentile">
    <span class="metric-label" *ngIf="showLabels">Rank</span>
    <span class="metric-value percentile-value">{{ metrics.percentile }}%</span>
  </div>
</div>
```

#### 1.4 Create `metric-display.component.scss`
```scss
@import '../../../styles/design-tokens';

.metric-display {
  display: flex;
  gap: $spacing-md;

  &.horizontal {
    flex-direction: row;
    align-items: center;
  }

  &.vertical {
    flex-direction: column;
    gap: $spacing-sm;
  }

  &.compact {
    flex-direction: row;
    gap: $spacing-sm;

    .metric-item {
      gap: 4px;
    }

    .metric-label {
      display: none;
    }

    .metric-value {
      font-size: $font-size-xs;
    }
  }
}

.metric-item {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
}

.metric-dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  flex-shrink: 0;
}

.metric-label {
  font-size: $font-size-xs;
  color: $gray-500;
  font-weight: 500;
  text-transform: uppercase;
}

.metric-value {
  font-size: $font-size-sm;
  font-weight: 600;
  color: $gray-800;
}

.percentile-value {
  color: $metric-total-color;
}
```

### 2. Create Filter Chips Component

#### 2.1 Create component folder
`/src/app/analytic-dashboard/components/shared/filter-chips/`

#### 2.2 Create `filter-chips.component.ts`
```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AnalyticsFilterService, FilterChip } from '../../../services';

/**
 * Displays active filters as removable chips
 */
@Component({
  selector: 'dh-filter-chips',
  templateUrl: './filter-chips.component.html',
  styleUrls: ['./filter-chips.component.scss']
})
export class FilterChipsComponent implements OnInit, OnDestroy {

  activeFilters: FilterChip[] = [];
  private unsubscribe$ = new Subject<void>();

  constructor(private filterService: AnalyticsFilterService) {}

  ngOnInit(): void {
    this.filterService.activeFilters$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(filters => {
        this.activeFilters = filters;
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  removeFilter(chip: FilterChip): void {
    this.filterService.removeFilter(chip);
  }

  clearAll(): void {
    this.filterService.clearFilters();
  }

  getChipIcon(type: string): string {
    switch (type) {
      case 'category': return 'category';
      case 'dealType': return 'local_offer';
      case 'cardSize': return 'crop_square';
      case 'search': return 'search';
      default: return 'filter_list';
    }
  }
}
```

#### 2.3 Create `filter-chips.component.html`
```html
<div class="filter-chips" *ngIf="activeFilters.length > 0">
  <div class="chips-container">
    <p-chip
      *ngFor="let chip of activeFilters"
      [label]="chip.label"
      [removable]="true"
      (onRemove)="removeFilter(chip)"
      styleClass="filter-chip filter-chip--{{ chip.type }}">
      <ng-template pTemplate="content">
        <span class="material-symbols-outlined chip-icon">{{ getChipIcon(chip.type) }}</span>
        <span class="chip-label">{{ chip.label }}</span>
      </ng-template>
    </p-chip>
  </div>

  <button
    pButton
    type="button"
    label="Clear All"
    class="p-button-text p-button-sm clear-btn"
    (click)="clearAll()">
  </button>
</div>
```

#### 2.4 Create `filter-chips.component.scss`
```scss
@import '../../../styles/design-tokens';

.filter-chips {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  flex-wrap: wrap;
}

.chips-container {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-xs;
}

:host ::ng-deep {
  .filter-chip {
    background: $gray-100;
    border: 1px solid $gray-200;
    border-radius: $radius-md;
    font-size: $font-size-sm;
    padding: 4px 8px;

    &--category {
      background: rgba($metric-views-color, 0.1);
      border-color: rgba($metric-views-color, 0.2);
    }

    &--dealType {
      background: rgba($metric-clicks-color, 0.1);
      border-color: rgba($metric-clicks-color, 0.2);
    }

    &--cardSize {
      background: rgba($metric-adds-color, 0.1);
      border-color: rgba($metric-adds-color, 0.2);
    }

    &--search {
      background: rgba($metric-total-color, 0.1);
      border-color: rgba($metric-total-color, 0.2);
    }

    .p-chip-remove-icon {
      font-size: 14px;
      margin-left: $spacing-xs;
    }
  }
}

.chip-icon {
  font-size: 14px;
  margin-right: 4px;
}

.chip-label {
  font-weight: 500;
}

.clear-btn {
  font-size: $font-size-xs;
  padding: 4px 8px;
  color: $gray-600;

  &:hover {
    color: $gray-800;
  }
}
```

### 3. Create Filter Modal Component

#### 3.1 Create component folder
`/src/app/analytic-dashboard/components/shared/filter-modal/`

#### 3.2 Create `filter-modal.component.ts`
```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { AnalyticsFilterService } from '../../../services';
import { AnalyticsDataService } from '../../../services';
import { DealTypeEnum, CardSizeEnum } from '../../../enums';
import { CategoryDto, FilterContextDto } from '../../../dto';

/**
 * Modal dialog for selecting multiple filters
 */
@Component({
  selector: 'dh-filter-modal',
  templateUrl: './filter-modal.component.html',
  styleUrls: ['./filter-modal.component.scss']
})
export class FilterModalComponent implements OnInit, OnDestroy {

  categories: CategoryDto[] = [];
  selectedCategoryIds: string[] = [];

  dealTypes = Object.values(DealTypeEnum);
  selectedDealTypes: string[] = [];

  cardSizes = Object.values(CardSizeEnum);
  selectedCardSizes: string[] = [];

  loading = false;
  private unsubscribe$ = new Subject<void>();

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private filterService: AnalyticsFilterService,
    private dataService: AnalyticsDataService
  ) {}

  ngOnInit(): void {
    // Load categories
    this.loading = true;
    const filter = this.filterService.getFilterContext();
    this.dataService.getCategories(filter)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(categories => {
        this.categories = categories;
        this.loading = false;
      });

    // Initialize selections from current filter
    const currentFilter = this.filterService.getFilterContext();
    this.selectedCategoryIds = [...currentFilter.categoryIds];
    this.selectedDealTypes = [...currentFilter.dealTypes] as string[];
    this.selectedCardSizes = [...currentFilter.cardSizes] as string[];
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  applyFilters(): void {
    this.filterService.setCategoryIds(this.selectedCategoryIds);
    this.filterService.setDealTypes(this.selectedDealTypes);
    this.filterService.setCardSizes(this.selectedCardSizes);
    this.ref.close(true);
  }

  clearAll(): void {
    this.selectedCategoryIds = [];
    this.selectedDealTypes = [];
    this.selectedCardSizes = [];
  }

  cancel(): void {
    this.ref.close(false);
  }

  get hasSelections(): boolean {
    return (
      this.selectedCategoryIds.length > 0 ||
      this.selectedDealTypes.length > 0 ||
      this.selectedCardSizes.length > 0
    );
  }
}
```

#### 3.3 Create `filter-modal.component.html`
```html
<div class="filter-modal">
  <!-- Categories Section -->
  <div class="filter-section">
    <h4 class="section-title">
      <span class="material-symbols-outlined">category</span>
      Categories
    </h4>
    <div class="checkbox-grid" *ngIf="!loading; else loadingTpl">
      <div *ngFor="let category of categories" class="checkbox-item">
        <p-checkbox
          [value]="category.id"
          [(ngModel)]="selectedCategoryIds"
          [label]="category.name"
          [inputId]="'cat-' + category.id">
        </p-checkbox>
        <span class="item-count">({{ category.promotionCount }})</span>
      </div>
    </div>
  </div>

  <!-- Deal Types Section -->
  <div class="filter-section">
    <h4 class="section-title">
      <span class="material-symbols-outlined">local_offer</span>
      Deal Types
    </h4>
    <div class="checkbox-grid">
      <div *ngFor="let dealType of dealTypes" class="checkbox-item">
        <p-checkbox
          [value]="dealType"
          [(ngModel)]="selectedDealTypes"
          [label]="dealType"
          [inputId]="'deal-' + dealType">
        </p-checkbox>
      </div>
    </div>
  </div>

  <!-- Card Sizes Section -->
  <div class="filter-section">
    <h4 class="section-title">
      <span class="material-symbols-outlined">crop_square</span>
      Card Sizes
    </h4>
    <div class="checkbox-grid checkbox-grid--inline">
      <div *ngFor="let size of cardSizes" class="checkbox-item">
        <p-checkbox
          [value]="size"
          [(ngModel)]="selectedCardSizes"
          [label]="size"
          [inputId]="'size-' + size">
        </p-checkbox>
      </div>
    </div>
  </div>

  <!-- Actions -->
  <div class="filter-actions">
    <button
      pButton
      type="button"
      label="Clear All"
      class="p-button-text"
      [disabled]="!hasSelections"
      (click)="clearAll()">
    </button>
    <div class="action-buttons">
      <button
        pButton
        type="button"
        label="Cancel"
        class="p-button-outlined"
        (click)="cancel()">
      </button>
      <button
        pButton
        type="button"
        label="Apply Filters"
        (click)="applyFilters()">
      </button>
    </div>
  </div>
</div>

<ng-template #loadingTpl>
  <div class="loading-container">
    <p-skeleton width="100%" height="24px" styleClass="mb-2"></p-skeleton>
    <p-skeleton width="80%" height="24px" styleClass="mb-2"></p-skeleton>
    <p-skeleton width="90%" height="24px"></p-skeleton>
  </div>
</ng-template>
```

#### 3.4 Create `filter-modal.component.scss`
```scss
@import '../../../styles/design-tokens';

.filter-modal {
  padding: $spacing-md;
  min-width: 400px;
  max-width: 600px;
}

.filter-section {
  margin-bottom: $spacing-lg;

  &:last-of-type {
    margin-bottom: $spacing-xl;
  }
}

.section-title {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  margin: 0 0 $spacing-md 0;
  font-size: $font-size-md;
  font-weight: 600;
  color: $gray-800;

  .material-symbols-outlined {
    font-size: 20px;
    color: $gray-600;
  }
}

.checkbox-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-sm;

  &--inline {
    grid-template-columns: repeat(3, 1fr);
  }
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: $spacing-xs;

  :host ::ng-deep .p-checkbox-label {
    font-size: $font-size-sm;
    color: $gray-700;
  }
}

.item-count {
  font-size: $font-size-xs;
  color: $gray-500;
}

.filter-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: $spacing-md;
  border-top: 1px solid $gray-200;
}

.action-buttons {
  display: flex;
  gap: $spacing-sm;
}

.loading-container {
  padding: $spacing-md 0;
}

// Responsive
@media (max-width: $breakpoint-tablet) {
  .filter-modal {
    min-width: 100%;
  }

  .checkbox-grid {
    grid-template-columns: 1fr;
  }

  .checkbox-grid--inline {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

### 4. Update Components Index

Update `/src/app/analytic-dashboard/components/index.ts` to include new components:
```typescript
import { AnalyticDashboardComponent } from './analytic-dashboard/analytic-dashboard.component';
import { PerformanceChartComponent } from './shared/performance-chart/performance-chart.component';
import { TrendChartComponent } from './shared/trend-chart/trend-chart.component';
import { MetricDisplayComponent } from './shared/metric-display/metric-display.component';
import { FilterChipsComponent } from './shared/filter-chips/filter-chips.component';
import { FilterModalComponent } from './shared/filter-modal/filter-modal.component';

export const components = [
  AnalyticDashboardComponent,
  PerformanceChartComponent,
  TrendChartComponent,
  MetricDisplayComponent,
  FilterChipsComponent,
  FilterModalComponent
];

export * from './analytic-dashboard/analytic-dashboard.component';
export * from './shared/performance-chart/performance-chart.component';
export * from './shared/trend-chart/trend-chart.component';
export * from './shared/metric-display/metric-display.component';
export * from './shared/filter-chips/filter-chips.component';
export * from './shared/filter-modal/filter-modal.component';
```

---

## FILES CHECKLIST

### Files to CREATE:
| # | Path | Purpose | Est. Lines | Complete |
|---|------|---------|------------|----------|
| 1 | `/src/app/analytic-dashboard/components/shared/metric-display/metric-display.component.ts` | Compact metric display | ~60 | ☐ |
| 2 | `/src/app/analytic-dashboard/components/shared/metric-display/metric-display.component.html` | Metric display template | ~28 | ☐ |
| 3 | `/src/app/analytic-dashboard/components/shared/metric-display/metric-display.component.scss` | Metric display styles | ~60 | ☐ |
| 4 | `/src/app/analytic-dashboard/components/shared/filter-chips/filter-chips.component.ts` | Active filter chips display | ~50 | ☐ |
| 5 | `/src/app/analytic-dashboard/components/shared/filter-chips/filter-chips.component.html` | Filter chips template | ~18 | ☐ |
| 6 | `/src/app/analytic-dashboard/components/shared/filter-chips/filter-chips.component.scss` | Filter chips styles | ~54 | ☐ |
| 7 | `/src/app/analytic-dashboard/components/shared/filter-modal/filter-modal.component.ts` | Filter selection modal | ~101 | ☐ |
| 8 | `/src/app/analytic-dashboard/components/shared/filter-modal/filter-modal.component.html` | Filter modal template | ~99 | ☐ |
| 9 | `/src/app/analytic-dashboard/components/shared/filter-modal/filter-modal.component.scss` | Filter modal styles | ~99 | ☐ |

### Files to MODIFY:
| # | Path | Changes | Complete |
|---|------|---------|----------|
| 1 | `/src/app/analytic-dashboard/components/index.ts` | Add MetricDisplayComponent, FilterChipsComponent, FilterModalComponent | ☐ |

---

## SMOKE TEST

### Quick Compile Check
```bash
cd /Users/billklingensmith/Code/ideal-sale-circular
yarn build 2>&1 | grep -E "(error|ERROR)" | head -20
```

### Visual Verification
1. Test MetricDisplayComponent:
   ```html
   <dh-metric-display
     [metrics]="{civ: 5000, cc: 800, atl: 150, percentile: 75}"
     layout="horizontal"
     [showLabels]="true">
   </dh-metric-display>
   ```
2. Expected:
   - Displays 3 colored dots with values
   - CIV (Blue), CC (Green), ATL (Purple)
   - Formatted numbers (5K, 800, 150)

3. Test FilterChipsComponent renders active filters

4. Test FilterModalComponent opens via DialogService

---

## SENIOR DEV REVIEW CHECKLIST

Before finalizing, verify:

### Code Quality
- [ ] All code blocks complete (no `// ...`)
- [ ] All imports explicitly listed
- [ ] No hardcoded colors (use COLORS constant)
- [ ] Component selectors use `dh-` prefix
- [ ] OnDestroy with takeUntil pattern where needed

### Consistency with Prompt 00
- [ ] Colors: Views=#4272D8, Clicks=#B8D64D, Adds=#937DF8, Total=#06989D ✓
- [ ] Variables: `civ`, `cc`, `atl` (no alternatives like `views`, `clicks`, `adds`) ✓
- [ ] SCSS uses token variables (`$metric-views-color`, etc.) ✓
- [ ] Component prefix: `dh-` ✓

### Angular Patterns
- [ ] FilterChipsComponent properly unsubscribes (OnDestroy + takeUntil)
- [ ] FilterModalComponent uses DynamicDialogRef pattern
- [ ] @Input/@Output properly typed
- [ ] Services via constructor injection

### Would this compile on first try? [YES/NO]

---

## Notes for Next Prompt
- MetricDisplayComponent ready for use in tables and detail panels
- FilterChipsComponent connected to AnalyticsFilterService
- FilterModalComponent uses PrimeNG DynamicDialog pattern
- All components use design tokens for consistent styling
- Next: Prompt 06 will create date and entity selector components
