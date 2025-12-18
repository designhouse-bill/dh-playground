# Prompt 12A: Compare View Components

## Prerequisites
- **MUST READ FIRST:** [Prompt 00 - Constants & Standards](./prompt-00-constants-standards.md)
- Completed: Prompt 11 (Grid Inquiry View)
- Checkpoint H passed

## Context
You are implementing the Analytics Dashboard feature in the `ideal-sale-circular` Angular repository. This is prompt 12A of the restructured series. The Grid Inquiry view is complete from prompt 11. Now we add the final view mode: Compare.

## Working Directory
`/Users/billklingensmith/Code/ideal-sale-circular`

## Objective
Create the Compare View for side-by-side A/B comparison of analytics data across different time periods.

---

## FILES CHECKLIST

### Files to CREATE:
| # | Path | Purpose | Est. Lines | Complete |
|---|------|---------|------------|----------|
| 1 | `.../compare-context/compare-context.component.ts` | A/B context selector | ~70 | ☐ |
| 2 | `.../compare-context/compare-context.component.html` | Context selector template | ~20 | ☐ |
| 3 | `.../compare-context/compare-context.component.scss` | Context selector styles | ~80 | ☐ |
| 4 | `.../compare-panel/compare-panel.component.ts` | Data panel for one side | ~95 | ☐ |
| 5 | `.../compare-panel/compare-panel.component.html` | Panel template | ~90 | ☐ |
| 6 | `.../compare-panel/compare-panel.component.scss` | Panel styles | ~120 | ☐ |
| 7 | `.../compare-view/compare-view.component.ts` | Main container | ~70 | ☐ |
| 8 | `.../compare-view/compare-view.component.html` | Container template | ~75 | ☐ |
| 9 | `.../compare-view/compare-view.component.scss` | Container styles | ~115 | ☐ |

### Files to MODIFY:
| # | Path | Changes | Complete |
|---|------|---------|----------|
| 1 | `/src/app/analytic-dashboard/components/index.ts` | Add Compare components | ☐ |
| 2 | `analytic-dashboard.component.html` | Replace compare placeholder | ☐ |

---

## Tasks

### 1. Create Compare View Folder Structure
```bash
mkdir -p /src/app/analytic-dashboard/components/compare-view/compare-context
mkdir -p /src/app/analytic-dashboard/components/compare-view/compare-panel
```

---

### 2. Create Compare Context Component

This manages the A/B context selection (week picker for each side).

#### 2.1 Create `compare-context.component.ts`

```typescript
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FilterContextDto, DateRangeDto, WeekOptionDto } from '../../../dto';
import { AnalyticsDataService } from '../../../services';

/**
 * Context selector for one side of comparison (A or B)
 * Allows selecting different time periods for comparison
 */
@Component({
  selector: 'dh-compare-context',
  templateUrl: './compare-context.component.html',
  styleUrls: ['./compare-context.component.scss']
})
export class CompareContextComponent implements OnInit {

  @Input() label: 'A' | 'B' = 'A';
  @Input() context: FilterContextDto;
  @Output() contextChange = new EventEmitter<FilterContextDto>();

  weeks: WeekOptionDto[] = [];
  selectedWeekId: string | null = null;

  constructor(private dataService: AnalyticsDataService) {}

  ngOnInit(): void {
    this.dataService.getWeeks().subscribe(weeks => {
      this.weeks = weeks;
      // Default to most recent week
      if (weeks.length > 0 && !this.selectedWeekId) {
        this.selectWeek(weeks[0]);
      }
    });
  }

  selectWeek(week: WeekOptionDto): void {
    this.selectedWeekId = week.id;
    const dateRange: DateRangeDto = {
      start: week.startDate,
      end: this.calculateEndDate(week.startDate, week.daysRun),
      weekId: week.id
    };
    this.emitContextChange({ dateRange });
  }

  private emitContextChange(changes: Partial<FilterContextDto>): void {
    this.contextChange.emit({
      ...this.context,
      ...changes
    });
  }

  private calculateEndDate(startDate: string, daysRun: number): string {
    const start = new Date(startDate);
    const end = new Date(start.getTime() + (daysRun - 1) * 24 * 60 * 60 * 1000);
    return end.toISOString().split('T')[0];
  }

  isWeekSelected(week: WeekOptionDto): boolean {
    return this.selectedWeekId === week.id;
  }

  get dateRangeLabel(): string {
    const week = this.weeks.find(w => w.id === this.selectedWeekId);
    return week?.dateRange || 'Select week';
  }
}
```

✓ This file is COMPLETE: YES
✓ All imports included: YES
✓ Compiles standalone: YES

---

#### 2.2 Create `compare-context.component.html`

```html
<div class="compare-context" [class.context-a]="label === 'A'" [class.context-b]="label === 'B'">
  <div class="context-header">
    <span class="context-label">{{ label }}</span>
    <span class="context-date">{{ dateRangeLabel }}</span>
  </div>

  <div class="week-selector">
    <button
      *ngFor="let week of weeks"
      class="week-btn"
      [class.selected]="isWeekSelected(week)"
      (click)="selectWeek(week)"
      [pTooltip]="week.dateRange"
      tooltipPosition="bottom">
      {{ week.label }}
    </button>
  </div>
</div>
```

✓ This file is COMPLETE: YES

---

#### 2.3 Create `compare-context.component.scss`

```scss
@import '../../../styles/design-tokens';

.compare-context {
  padding: $spacing-md;
  border-radius: $radius-md;
  background: white;
  border: 2px solid $gray-200;

  // Context A uses Blue (#4272D8)
  &.context-a {
    border-color: $metric-views-color;

    .context-label {
      background: $metric-views-color;
    }
  }

  // Context B uses Purple (#937DF8)
  &.context-b {
    border-color: $metric-adds-color;

    .context-label {
      background: $metric-adds-color;
    }
  }
}

.context-header {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;
}

.context-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  color: white;
  font-weight: 700;
  font-size: $font-size-md;
}

.context-date {
  font-size: $font-size-sm;
  color: $gray-600;
}

.week-selector {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-xs;
}

.week-btn {
  padding: $spacing-xs $spacing-sm;
  background: $gray-100;
  border: 1px solid $gray-200;
  border-radius: $radius-sm;
  font-size: $font-size-xs;
  font-weight: 500;
  color: $gray-700;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover {
    background: $gray-200;
  }

  &.selected {
    background: $gray-800;
    border-color: $gray-800;
    color: white;
  }
}
```

✓ This file is COMPLETE: YES

---

### 3. Create Compare Panel Component

This displays the data for one side of the comparison.

#### 3.1 Create `compare-panel.component.ts`

```typescript
import { Component, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AnalyticsDataService } from '../../../services';
import { PromotionDto, CategoryDto, CircularDto, FilterContextDto } from '../../../dto';

type CompareLayer = 'promotions' | 'categories' | 'circulars';

/**
 * Panel displaying data for one side of comparison
 * Shows top items based on compositeScore
 *
 * Formula Reference: CIV×1 + CC×10 + ATL×50
 */
@Component({
  selector: 'dh-compare-panel',
  templateUrl: './compare-panel.component.html',
  styleUrls: ['./compare-panel.component.scss']
})
export class ComparePanelComponent implements OnChanges, OnDestroy {

  @Input() context: FilterContextDto;
  @Input() layer: CompareLayer = 'promotions';
  @Input() label: 'A' | 'B' = 'A';

  promotions: PromotionDto[] = [];
  categories: CategoryDto[] = [];
  circulars: CircularDto[] = [];

  loading = false;
  private unsubscribe$ = new Subject<void>();

  constructor(private dataService: AnalyticsDataService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['context'] || changes['layer']) {
      this.loadData();
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private loadData(): void {
    if (!this.context) return;

    this.loading = true;

    switch (this.layer) {
      case 'promotions':
        this.dataService.getPromotions(this.context)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe(data => {
            this.promotions = data.slice(0, 20); // Top 20 for comparison
            this.loading = false;
          });
        break;

      case 'categories':
        this.dataService.getCategories(this.context)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe(data => {
            this.categories = data;
            this.loading = false;
          });
        break;

      case 'circulars':
        this.dataService.getCirculars(this.context)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe(data => {
            this.circulars = data.slice(0, 20);
            this.loading = false;
          });
        break;
    }
  }

  getPercentileClass(percentile: number): string {
    if (percentile >= 80) return 'percentile-high';
    if (percentile >= 50) return 'percentile-medium';
    return 'percentile-low';
  }

  formatNumber(value: number): string {
    return value?.toLocaleString() ?? '0';
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

#### 3.2 Create `compare-panel.component.html`

```html
<div class="compare-panel" [class.panel-a]="label === 'A'" [class.panel-b]="label === 'B'">
  <!-- Loading -->
  <div class="loading-state" *ngIf="loading">
    <p-skeleton *ngFor="let i of [1,2,3,4,5]" width="100%" height="60px" styleClass="mb-2"></p-skeleton>
  </div>

  <!-- Promotions Layer -->
  <div class="panel-content" *ngIf="layer === 'promotions' && !loading">
    <div *ngFor="let promo of promotions; let i = index" class="compare-item">
      <span class="item-rank">{{ i + 1 }}</span>
      <div class="item-content">
        <div class="item-header">
          <span class="item-name">{{ promo.name }}</span>
          <span class="percentile-badge" [ngClass]="getPercentileClass(promo.percentile)">
            {{ promo.percentile }}%
          </span>
        </div>
        <div class="item-meta">
          <span>{{ promo.categoryName }}</span>
          <span>{{ promo.dealType }}</span>
        </div>
        <dh-performance-chart
          [civValue]="promo.civ"
          [ccValue]="promo.cc"
          [atlValue]="promo.atl"
          [height]="20"
          [compact]="true">
        </dh-performance-chart>
      </div>
    </div>
  </div>

  <!-- Categories Layer -->
  <div class="panel-content" *ngIf="layer === 'categories' && !loading">
    <div *ngFor="let cat of categories; let i = index" class="compare-item">
      <span class="item-rank">{{ i + 1 }}</span>
      <div class="item-content">
        <div class="item-header">
          <span class="item-name">{{ cat.name }}</span>
          <span class="percentile-badge" [ngClass]="getPercentileClass(cat.percentile)">
            {{ cat.percentile }}%
          </span>
        </div>
        <div class="item-meta">
          <span>{{ cat.promotionCount }} promotions</span>
        </div>
        <dh-performance-chart
          [civValue]="cat.civ"
          [ccValue]="cat.cc"
          [atlValue]="cat.atl"
          [height]="20"
          [compact]="true">
        </dh-performance-chart>
      </div>
    </div>
  </div>

  <!-- Circulars Layer -->
  <div class="panel-content" *ngIf="layer === 'circulars' && !loading">
    <div *ngFor="let circ of circulars; let i = index" class="compare-item">
      <span class="item-rank">{{ i + 1 }}</span>
      <div class="item-content">
        <div class="item-header">
          <span class="item-name">{{ circ.storeName }}</span>
          <span class="percentile-badge" [ngClass]="getPercentileClass(circ.percentile)">
            {{ circ.percentile }}%
          </span>
        </div>
        <div class="item-meta">
          <span>Store #{{ circ.storeNumber }}</span>
          <span class="size-badge">{{ circ.size }}</span>
        </div>
        <dh-performance-chart
          [civValue]="circ.civ"
          [ccValue]="circ.cc"
          [atlValue]="circ.atl"
          [height]="20"
          [compact]="true">
        </dh-performance-chart>
      </div>
    </div>
  </div>

  <!-- Empty State -->
  <div class="empty-state" *ngIf="!loading && promotions.length === 0 && categories.length === 0 && circulars.length === 0">
    <span class="material-symbols-outlined">compare</span>
    <p>No data available</p>
  </div>
</div>
```

✓ This file is COMPLETE: YES

---

#### 3.3 Create `compare-panel.component.scss`

```scss
@import '../../../styles/design-tokens';

.compare-panel {
  flex: 1;
  background: white;
  border-radius: $radius-md;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  // Panel A - Blue (#4272D8)
  &.panel-a {
    border-top: 3px solid $metric-views-color;
  }

  // Panel B - Purple (#937DF8)
  &.panel-b {
    border-top: 3px solid $metric-adds-color;
  }
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: $spacing-sm;
}

.compare-item {
  display: flex;
  gap: $spacing-sm;
  padding: $spacing-sm;
  border-bottom: 1px solid $gray-100;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: $gray-50;
  }
}

.item-rank {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: $gray-200;
  border-radius: 50%;
  font-size: $font-size-xs;
  font-weight: 700;
  color: $gray-700;
  flex-shrink: 0;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: $spacing-sm;
  margin-bottom: 4px;
}

.item-name {
  font-size: $font-size-sm;
  font-weight: 600;
  color: $gray-800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-meta {
  display: flex;
  gap: $spacing-sm;
  margin-bottom: $spacing-xs;
  font-size: $font-size-xs;
  color: $gray-500;
}

.percentile-badge {
  padding: 2px 6px;
  border-radius: $radius-sm;
  font-size: 10px;
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

.size-badge {
  text-transform: capitalize;
}

.loading-state {
  padding: $spacing-md;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
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

---

### 4. Create Compare View Container

#### 4.1 Create `compare-view.component.ts`

**File:** `/src/app/analytic-dashboard/components/compare-view/compare-view.component.ts`

```typescript
import { Component, OnInit } from '@angular/core';
import { AnalyticsFilterService } from '../../services';
import { FilterContextDto } from '../../dto';

type CompareLayer = 'promotions' | 'categories' | 'circulars';

interface LayerOption {
  label: string;
  value: CompareLayer;
  icon: string;
}

/**
 * Main container for side-by-side comparison view
 * Allows comparing analytics data across different time periods
 */
@Component({
  selector: 'dh-compare-view',
  templateUrl: './compare-view.component.html',
  styleUrls: ['./compare-view.component.scss']
})
export class CompareViewComponent implements OnInit {

  contextA: FilterContextDto;
  contextB: FilterContextDto;
  currentLayer: CompareLayer = 'promotions';

  layerOptions: LayerOption[] = [
    { label: 'Promotions', value: 'promotions', icon: 'sell' },
    { label: 'Categories', value: 'categories', icon: 'category' },
    { label: 'Circulars', value: 'circulars', icon: 'article' }
  ];

  constructor(private filterService: AnalyticsFilterService) {}

  ngOnInit(): void {
    // Initialize both contexts from current filter
    const baseFilter = this.filterService.getFilterContext();
    this.contextA = { ...baseFilter };
    this.contextB = { ...baseFilter };
  }

  onContextAChange(context: FilterContextDto): void {
    this.contextA = context;
  }

  onContextBChange(context: FilterContextDto): void {
    this.contextB = context;
  }

  selectLayer(layer: CompareLayer): void {
    this.currentLayer = layer;
  }

  copyAtoB(): void {
    this.contextB = { ...this.contextA };
  }

  swapContexts(): void {
    const temp = this.contextA;
    this.contextA = this.contextB;
    this.contextB = temp;
  }

  isLayerActive(layer: CompareLayer): boolean {
    return this.currentLayer === layer;
  }
}
```

✓ This file is COMPLETE: YES
✓ All imports included: YES
✓ Compiles standalone: YES

---

#### 4.2 Create `compare-view.component.html`

```html
<div class="compare-view">
  <!-- Compare Toolbar -->
  <div class="compare-toolbar">
    <div class="layer-selector">
      <span class="selector-label">Compare</span>
      <div class="layer-buttons">
        <button
          *ngFor="let layer of layerOptions"
          class="layer-btn"
          [class.active]="isLayerActive(layer.value)"
          (click)="selectLayer(layer.value)">
          <span class="material-symbols-outlined">{{ layer.icon }}</span>
          {{ layer.label }}
        </button>
      </div>
    </div>

    <div class="compare-actions">
      <button
        pButton
        type="button"
        icon="pi pi-arrow-right"
        label="Copy A to B"
        class="p-button-outlined p-button-sm"
        (click)="copyAtoB()">
      </button>
      <button
        pButton
        type="button"
        icon="pi pi-arrows-h"
        label="Swap"
        class="p-button-outlined p-button-sm"
        (click)="swapContexts()">
      </button>
    </div>
  </div>

  <!-- Context Selectors -->
  <div class="context-row">
    <dh-compare-context
      label="A"
      [context]="contextA"
      (contextChange)="onContextAChange($event)">
    </dh-compare-context>

    <div class="vs-divider">
      <span>VS</span>
    </div>

    <dh-compare-context
      label="B"
      [context]="contextB"
      (contextChange)="onContextBChange($event)">
    </dh-compare-context>
  </div>

  <!-- Comparison Panels -->
  <div class="compare-panels">
    <dh-compare-panel
      label="A"
      [context]="contextA"
      [layer]="currentLayer">
    </dh-compare-panel>

    <div class="panel-divider"></div>

    <dh-compare-panel
      label="B"
      [context]="contextB"
      [layer]="currentLayer">
    </dh-compare-panel>
  </div>
</div>
```

✓ This file is COMPLETE: YES

---

#### 4.3 Create `compare-view.component.scss`

```scss
@import '../../styles/design-tokens';

.compare-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: $spacing-md;
  gap: $spacing-md;
}

.compare-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-md;
  background: white;
  border-radius: $radius-md;
}

.layer-selector {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.selector-label {
  font-weight: 600;
  color: $gray-700;
}

.layer-buttons {
  display: flex;
  gap: $spacing-xs;
}

.layer-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: $spacing-xs $spacing-md;
  background: white;
  border: 1px solid $gray-300;
  border-radius: $radius-md;
  font-size: $font-size-sm;
  font-weight: 500;
  color: $gray-700;
  cursor: pointer;
  transition: all $transition-fast;

  .material-symbols-outlined {
    font-size: 18px;
  }

  &:hover {
    background: $gray-50;
    border-color: $gray-400;
  }

  // Active state uses Blue (#4272D8)
  &.active {
    background: $metric-views-color;
    border-color: $metric-views-color;
    color: white;
  }
}

.compare-actions {
  display: flex;
  gap: $spacing-sm;
}

.context-row {
  display: flex;
  gap: $spacing-md;
  align-items: center;
}

.vs-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: $gray-800;
  border-radius: 50%;
  color: white;
  font-weight: 700;
  font-size: $font-size-sm;
  flex-shrink: 0;
}

.compare-panels {
  display: flex;
  gap: $spacing-md;
  flex: 1;
  min-height: 0;
}

.panel-divider {
  width: 2px;
  background: $gray-200;
  align-self: stretch;
}

dh-compare-context {
  flex: 1;
}

dh-compare-panel {
  flex: 1;
  display: flex;
  min-width: 0;
}

// Responsive - Tablet
@media (max-width: $breakpoint-tablet) {
  .context-row {
    flex-direction: column;
  }

  .vs-divider {
    width: 100%;
    height: 32px;
    border-radius: $radius-sm;
  }

  .compare-panels {
    flex-direction: column;
  }

  .panel-divider {
    width: 100%;
    height: 2px;
  }
}
```

✓ This file is COMPLETE: YES

---

### 5. Update Main Container Template

Update `/src/app/analytic-dashboard/components/analytic-dashboard/analytic-dashboard.component.html`:

Replace the COMPARE view placeholder:
```html
<!-- OLD -->
<div class="compare-view-layout" *ngIf="showCompareView">
  <div class="placeholder-panel">
    <p>Compare View - Coming in Prompt 12A</p>
  </div>
</div>

<!-- NEW -->
<div class="compare-view-layout" *ngIf="showCompareView">
  <dh-compare-view></dh-compare-view>
</div>
```

---

### 6. Update Components Index

Update `/src/app/analytic-dashboard/components/index.ts` - **ADD**:

```typescript
// Add to imports section
import { CompareContextComponent } from './compare-view/compare-context/compare-context.component';
import { ComparePanelComponent } from './compare-view/compare-panel/compare-panel.component';
import { CompareViewComponent } from './compare-view/compare-view.component';

// Add to components array
export const components = [
  // ... existing components
  CompareContextComponent,
  ComparePanelComponent,
  CompareViewComponent
];

// Add to exports section
export * from './compare-view/compare-context/compare-context.component';
export * from './compare-view/compare-panel/compare-panel.component';
export * from './compare-view/compare-view.component';
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

1. Click **COMPARE** in view switcher
2. Expected layout:
   - Toolbar with layer selector (Promotions/Categories/Circulars)
   - Two context selectors (A and B) with week pickers
   - "VS" divider between context selectors
   - Two data panels showing ranked items side by side

3. Interaction test:
   - Click layer buttons → both panels should reload with appropriate data type
   - Click week buttons in A selector → Panel A data updates
   - Click week buttons in B selector → Panel B data updates
   - Click "Copy A to B" → Panel B matches Panel A
   - Click "Swap" → Contexts exchange positions

---

## SENIOR DEV REVIEW CHECKLIST

Before finalizing, verify:

### Code Quality
- [ ] All code blocks complete (no `// ...`)
- [ ] All imports explicitly listed
- [ ] No hardcoded color values (uses $metric-* variables)
- [ ] Component selectors use `dh-` prefix
- [ ] Services via constructor injection

### Consistency with Prompt 00
- [ ] Variables: `civ`, `cc`, `atl`, `compositeScore`
- [ ] Colors: $metric-views-color (Blue) for A, $metric-adds-color (Purple) for B
- [ ] Formula reference in component comments

### Angular Patterns
- [ ] OnDestroy with takeUntil pattern (ComparePanelComponent)
- [ ] OnChanges properly handled
- [ ] @Input/@Output properly typed
- [ ] Services via constructor injection

### Would this compile on first try? [YES]

---

## Notes for Prompt 12B
- Compare view is now functional
- Next prompt covers final verification and polish
- Will verify all views work together
- Will document API integration points
