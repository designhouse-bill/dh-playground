# Prompt 10A: Categories Panel Component

## Prerequisites
- **MUST READ FIRST:** [Prompt 00 - Constants & Standards](./prompt-00-constants-standards.md)
- Completed: Prompt 09B (Container Integration)
- Checkpoint F passed

## Context
You are implementing the Analytics Dashboard feature in the `ideal-sale-circular` Angular repository. This is prompt 10A of the restructured series. The BASE view container is complete with the Promotions tab from prompts 08-09.

## Working Directory
`/Users/billklingensmith/Code/ideal-sale-circular`

## Objective
Create the CategoriesPanelComponent - the center panel content when the Categories tab is selected, displaying a grid of category cards with performance metrics.

---

## FILES CHECKLIST

### Files to CREATE:
| # | Path | Purpose | Est. Lines | Complete |
|---|------|---------|------------|----------|
| 1 | `.../categories-panel/categories-panel.component.ts` | Categories grid logic | ~120 | ☐ |
| 2 | `.../categories-panel/categories-panel.component.html` | Categories grid template | ~90 | ☐ |
| 3 | `.../categories-panel/categories-panel.component.scss` | Categories panel styles | ~180 | ☐ |

### Files to MODIFY:
| # | Path | Changes | Complete |
|---|------|---------|----------|
| 1 | `/src/app/analytic-dashboard/components/index.ts` | Add CategoriesPanelComponent export | ☐ |
| 2 | `analytic-dashboard.component.html` | Replace categories placeholder | ☐ |

### Required Imports for categories-panel.component.ts:
```typescript
// Angular
import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';

// RxJS
import { Subject, takeUntil } from 'rxjs';

// App Services (3 levels deep)
import { AnalyticsDataService, AnalyticsFilterService, AnalyticsStateService } from '../../../services';

// App DTOs (3 levels deep)
import { CategoryDto, FilterContextDto } from '../../../dto';
```

---

## Tasks

### 1. Create Categories Panel Component Folder
```bash
mkdir -p /src/app/analytic-dashboard/components/base-view/categories-panel
```

### 2. Create `categories-panel.component.ts`

```typescript
import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AnalyticsDataService, AnalyticsFilterService, AnalyticsStateService } from '../../../services';
import { CategoryDto, FilterContextDto } from '../../../dto';

/**
 * Center panel showing categories grid view
 * Displays category cards with performance metrics
 *
 * Formula Reference: CIV×1 + CC×10 + ATL×50
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
      .subscribe(filterContext => {
        this.loadCategories(filterContext);
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

  private loadCategories(filterContext: FilterContextDto): void {
    this.loading = true;
    this.dataService.getCategories(filterContext)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(categories => {
        this.categories = this.sortCategories(categories);
        this.totalCount = categories.length;
        this.loading = false;
      });
  }

  private sortCategories(categories: CategoryDto[]): CategoryDto[] {
    return [...categories].sort((a, b) => {
      const aVal = a[this.sortField as keyof CategoryDto] as number;
      const bVal = b[this.sortField as keyof CategoryDto] as number;
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

✓ This file is COMPLETE: YES
✓ All imports included: YES
✓ Compiles standalone: YES

---

### 3. Create `categories-panel.component.html`

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
          (click)="toggleSortOrder()"
          pTooltip="Toggle sort order">
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

✓ This file is COMPLETE: YES
✓ All imports included: N/A (HTML)
✓ Compiles standalone: YES

---

### 4. Create `categories-panel.component.scss`

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

// Score value uses metric-total-color (Teal #06989D)
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

✓ This file is COMPLETE: YES
✓ All imports included: YES (design-tokens)
✓ Compiles standalone: YES

---

### 5. Update Components Index

Update `/src/app/analytic-dashboard/components/index.ts` - **ADD**:

```typescript
// Add to imports section
import { CategoriesPanelComponent } from './base-view/categories-panel/categories-panel.component';

// Add to components array
export const components = [
  // ... existing components
  CategoriesPanelComponent
];

// Add to exports section
export * from './base-view/categories-panel/categories-panel.component';
```

---

### 6. Update Container Template

Update `/src/app/analytic-dashboard/components/analytic-dashboard/analytic-dashboard.component.html`:

Replace the categories placeholder:
```html
<!-- OLD -->
<div class="placeholder-panel" *ngIf="showCategoriesTab">
  <p>Categories Panel - Coming Soon (Prompt 10A)</p>
</div>

<!-- NEW -->
<dh-categories-panel *ngIf="showCategoriesTab"></dh-categories-panel>
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

1. Click **Categories** tab in context bar
2. Expected: Grid of category cards displays
3. Each card should show:
   - Category name
   - Percentile badge (colored by performance tier)
   - Promotion count
   - Metric display (CIV, CC, ATL)
   - Performance chart bar
   - Composite score in teal (#06989D)

4. Interaction test:
   - Click a category card → should highlight and open detail panel
   - Use sort dropdown → cards should reorder
   - Toggle sort order button → ascending/descending switch

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
- [ ] UI Labels: "Views (CIV)", "Clicks (CC)", "Adds (ATL)"
- [ ] Colors: $metric-total-color for score value
- [ ] Formula reference in component comment

### Angular Patterns
- [ ] OnDestroy with takeUntil pattern
- [ ] @Output EventEmitter typed properly
- [ ] Services via constructor injection

### Would this compile on first try? [YES]

---

## Dependencies for This Prompt

**Components Required (from 04, 05):**
- dh-metric-display
- dh-performance-chart

**Services Required (from 03A/03B):**
- AnalyticsDataService.getCategories()
- AnalyticsFilterService.filterContext$
- AnalyticsStateService.selectCategory(), selectedCategory$

**DTOs Required (from 02):**
- CategoryDto, FilterContextDto

---

## Notes for Prompt 10B
- Categories panel is now functional
- Next prompt adds CircularsPanelComponent for the Circulars tab
- Circulars panel uses a table layout (different from categories grid)
- Will complete all three BASE view tabs
