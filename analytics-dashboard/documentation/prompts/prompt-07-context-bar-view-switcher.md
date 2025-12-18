# Prompt 07: Context Bar + View Switcher

## Prerequisites
- **MUST READ FIRST:** [Prompt 00 - Constants & Standards](./prompt-00-constants-standards.md)
- Completed: [Prompt 06 - Date/Entity Selectors](./prompt-06-date-entity-selectors.md)

## Context
You are implementing the Analytics Dashboard feature in the `ideal-sale-circular` Angular repository. This is prompt 7 of 18 in the restructured series. Date and entity selector components have been set up in prompt 06.

## Working Directory
`/Users/billklingensmith/Code/ideal-sale-circular`

## Objective
Create DashboardContextBarComponent and DashboardViewSwitcherComponent for the dashboard header area.

---

## Tasks

### 1. Create Dashboard Context Bar Component

This component contains the date range selector, entity selector, and filter chips in a horizontal bar below the SubheaderComponent.

#### 1.1 Create component folder
`/src/app/analytic-dashboard/components/dashboard-context-bar/`

#### 1.2 Create `dashboard-context-bar.component.ts`
```typescript
import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AnalyticsFilterService, AnalyticsStateService } from '../../services';
import { FilterContextDto, DateRangeDto } from '../../dto';
import { FilterModalComponent } from '../shared/filter-modal/filter-modal.component';

/**
 * Context bar with date, entity, and filter controls
 * Sits below the SubheaderComponent toolbar
 */
@Component({
  selector: 'dh-dashboard-context-bar',
  templateUrl: './dashboard-context-bar.component.html',
  styleUrls: ['./dashboard-context-bar.component.scss'],
  providers: [DialogService]
})
export class DashboardContextBarComponent implements OnInit, OnDestroy {

  @Output() filterChanged = new EventEmitter<FilterContextDto>();

  filterContext: FilterContextDto;
  hasActiveFilters = false;
  private filterModalRef: DynamicDialogRef | null = null;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private filterService: AnalyticsFilterService,
    private stateService: AnalyticsStateService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    // Subscribe to filter changes
    this.filterService.filterContext$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(filter => {
        this.filterContext = filter;
        this.hasActiveFilters = this.filterService.hasActiveFilters();
        this.filterChanged.emit(filter);
      });

    // Initialize from URL if applicable
    this.filterService.initFromUrl();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    if (this.filterModalRef) {
      this.filterModalRef.close();
    }
  }

  onDateRangeChanged(dateRange: DateRangeDto): void {
    // Already handled by DateRangePickerComponent via FilterService
  }

  onEntitySelected(entityId: string): void {
    // Already handled by EntitySelectorComponent via FilterService
  }

  openFilterModal(): void {
    this.filterModalRef = this.dialogService.open(FilterModalComponent, {
      header: 'Filter Analytics',
      width: '500px',
      styleClass: 'analytics-filter-modal',
      dismissableMask: true
    });

    this.filterModalRef.onClose.subscribe((applied: boolean) => {
      if (applied) {
        // Filters were applied - UI will update via subscription
      }
    });
  }

  get dateRangeLabel(): string {
    if (!this.filterContext?.dateRange) return 'Select Date Range';
    const { start, end } = this.filterContext.dateRange;
    return `${this.formatDateShort(start)} - ${this.formatDateShort(end)}`;
  }

  private formatDateShort(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
```

#### 1.3 Create `dashboard-context-bar.component.html`
```html
<div class="dashboard-context-bar">
  <div class="context-bar-content">
    <!-- Date Range Section -->
    <div class="context-section date-section">
      <div class="section-label">
        <span class="material-symbols-outlined">calendar_today</span>
        <span>Date Range</span>
      </div>
      <dh-date-range-picker
        (dateRangeChanged)="onDateRangeChanged($event)">
      </dh-date-range-picker>
    </div>

    <!-- Divider -->
    <div class="context-divider"></div>

    <!-- Entity Section -->
    <div class="context-section entity-section">
      <div class="section-label">
        <span class="material-symbols-outlined">store</span>
        <span>Location</span>
      </div>
      <dh-entity-selector
        (entitySelected)="onEntitySelected($event)">
      </dh-entity-selector>
    </div>

    <!-- Divider -->
    <div class="context-divider"></div>

    <!-- Filters Section -->
    <div class="context-section filters-section">
      <div class="section-header">
        <div class="section-label">
          <span class="material-symbols-outlined">filter_list</span>
          <span>Filters</span>
        </div>
        <button
          pButton
          type="button"
          icon="pi pi-plus"
          label="Add Filter"
          class="p-button-text p-button-sm add-filter-btn"
          (click)="openFilterModal()">
        </button>
      </div>
      <dh-filter-chips></dh-filter-chips>
    </div>
  </div>
</div>
```

#### 1.4 Create `dashboard-context-bar.component.scss`
```scss
@import '../../styles/design-tokens';

.dashboard-context-bar {
  background: white;
  border-bottom: 1px solid $gray-200;
  padding: $spacing-md $spacing-lg;
}

.context-bar-content {
  display: flex;
  align-items: flex-start;
  gap: $spacing-lg;
  max-width: 1600px;
  margin: 0 auto;
}

.context-section {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;

  &.date-section {
    flex: 0 0 auto;
  }

  &.entity-section {
    flex: 0 0 auto;
    min-width: 200px;
  }

  &.filters-section {
    flex: 1;
    min-width: 0;
  }
}

.section-label {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  font-size: $font-size-xs;
  font-weight: 600;
  color: $gray-600;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  .material-symbols-outlined {
    font-size: 16px;
  }
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-md;
}

.add-filter-btn {
  padding: 4px 8px;
  font-size: $font-size-xs;
}

.context-divider {
  width: 1px;
  height: 48px;
  background: $gray-200;
  align-self: center;
}

// Responsive - Tablet
@media (max-width: $breakpoint-desktop) {
  .context-bar-content {
    flex-wrap: wrap;
  }

  .context-divider {
    display: none;
  }

  .context-section {
    &.filters-section {
      flex-basis: 100%;
      order: 3;
      padding-top: $spacing-md;
      border-top: 1px solid $gray-200;
      margin-top: $spacing-sm;
    }
  }
}
```

### 2. Create Dashboard View Switcher Component

This component provides BASE | GRID | COMPARE view mode tabs.

#### 2.1 Create component folder
`/src/app/analytic-dashboard/components/dashboard-view-switcher/`

#### 2.2 Create `dashboard-view-switcher.component.ts`
```typescript
import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AnalyticsStateService } from '../../services';
import { ViewModeEnum, BaseViewTabEnum } from '../../enums';
import { fadeIn } from '../../animations';

interface ViewOption {
  mode: ViewModeEnum;
  label: string;
  icon: string;
  tooltip: string;
}

interface BaseViewOption {
  tab: BaseViewTabEnum;
  label: string;
  icon: string;
}

/**
 * View mode switcher (BASE | GRID | COMPARE) with sub-tabs for BASE view
 */
@Component({
  selector: 'dh-dashboard-view-switcher',
  templateUrl: './dashboard-view-switcher.component.html',
  styleUrls: ['./dashboard-view-switcher.component.scss'],
  animations: [fadeIn]
})
export class DashboardViewSwitcherComponent implements OnInit, OnDestroy {

  @Output() viewModeChanged = new EventEmitter<ViewModeEnum>();
  @Output() baseViewTabChanged = new EventEmitter<BaseViewTabEnum>();

  currentViewMode: ViewModeEnum = ViewModeEnum.BASE;
  currentBaseTab: BaseViewTabEnum = BaseViewTabEnum.PROMOTIONS;

  viewModes: ViewOption[] = [
    {
      mode: ViewModeEnum.BASE,
      label: 'Base',
      icon: 'dashboard',
      tooltip: 'Three-column layout with categories, content, and details'
    },
    {
      mode: ViewModeEnum.GRID,
      label: 'Grid',
      icon: 'table_chart',
      tooltip: 'Full-width data grid with all columns'
    },
    {
      mode: ViewModeEnum.COMPARE,
      label: 'Compare',
      icon: 'compare',
      tooltip: 'Side-by-side A/B comparison'
    }
  ];

  baseViewTabs: BaseViewOption[] = [
    { tab: BaseViewTabEnum.PROMOTIONS, label: 'Promotions', icon: 'sell' },
    { tab: BaseViewTabEnum.CATEGORIES, label: 'Categories', icon: 'category' },
    { tab: BaseViewTabEnum.CIRCULARS, label: 'Circulars', icon: 'article' }
  ];

  private unsubscribe$ = new Subject<void>();

  constructor(private stateService: AnalyticsStateService) {}

  ngOnInit(): void {
    // Subscribe to state changes
    this.stateService.viewMode$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(mode => {
        this.currentViewMode = mode;
      });

    this.stateService.baseViewTab$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(tab => {
        this.currentBaseTab = tab;
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  selectViewMode(mode: ViewModeEnum): void {
    this.stateService.setViewMode(mode);
    this.viewModeChanged.emit(mode);
  }

  selectBaseTab(tab: BaseViewTabEnum): void {
    this.stateService.setBaseViewTab(tab);
    this.baseViewTabChanged.emit(tab);
  }

  isViewModeActive(mode: ViewModeEnum): boolean {
    return this.currentViewMode === mode;
  }

  isBaseTabActive(tab: BaseViewTabEnum): boolean {
    return this.currentBaseTab === tab;
  }

  get showBaseViewTabs(): boolean {
    return this.currentViewMode === ViewModeEnum.BASE;
  }
}
```

#### 2.3 Create `dashboard-view-switcher.component.html`
```html
<div class="dashboard-view-switcher">
  <!-- Main View Mode Selector -->
  <div class="view-mode-selector">
    <p-selectButton
      [options]="viewModes"
      [(ngModel)]="currentViewMode"
      (onChange)="selectViewMode($event.value)"
      optionLabel="label"
      optionValue="mode"
      styleClass="view-mode-buttons">
      <ng-template let-item pTemplate="item">
        <div class="view-mode-item" [pTooltip]="item.tooltip" tooltipPosition="bottom">
          <span class="material-symbols-outlined">{{ item.icon }}</span>
          <span class="mode-label">{{ item.label }}</span>
        </div>
      </ng-template>
    </p-selectButton>
  </div>

  <!-- Base View Sub-tabs -->
  <div class="base-view-tabs" *ngIf="showBaseViewTabs" [@fadeIn]>
    <div class="tabs-divider"></div>
    <div class="tab-buttons">
      <button
        *ngFor="let tab of baseViewTabs"
        class="tab-button"
        [class.active]="isBaseTabActive(tab.tab)"
        (click)="selectBaseTab(tab.tab)">
        <span class="material-symbols-outlined">{{ tab.icon }}</span>
        <span>{{ tab.label }}</span>
      </button>
    </div>
  </div>
</div>
```

#### 2.4 Create `dashboard-view-switcher.component.scss`
```scss
@import '../../styles/design-tokens';

.dashboard-view-switcher {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.view-mode-selector {
  :host ::ng-deep {
    .view-mode-buttons {
      .p-button {
        padding: $spacing-sm $spacing-md;
        background: white;
        border: 1px solid $gray-300;
        color: $gray-700;

        &:first-child {
          border-radius: $radius-md 0 0 $radius-md;
        }

        &:last-child {
          border-radius: 0 $radius-md $radius-md 0;
        }

        &:not(:first-child) {
          border-left: none;
        }

        &:hover {
          background: $gray-50;
        }

        &.p-highlight {
          background: $metric-views-color;
          border-color: $metric-views-color;
          color: white;
        }
      }
    }
  }
}

.view-mode-item {
  display: flex;
  align-items: center;
  gap: $spacing-xs;

  .material-symbols-outlined {
    font-size: 18px;
  }

  .mode-label {
    font-size: $font-size-sm;
    font-weight: 500;
  }
}

.base-view-tabs {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.tabs-divider {
  width: 1px;
  height: 24px;
  background: $gray-300;
}

.tab-buttons {
  display: flex;
  gap: $spacing-xs;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: $spacing-xs $spacing-md;
  background: transparent;
  border: 1px solid transparent;
  border-radius: $radius-md;
  color: $gray-600;
  font-size: $font-size-sm;
  font-weight: 500;
  cursor: pointer;
  transition: all $transition-fast;

  .material-symbols-outlined {
    font-size: 16px;
  }

  &:hover {
    background: $gray-100;
    color: $gray-800;
  }

  &.active {
    background: rgba($metric-views-color, 0.1);
    border-color: rgba($metric-views-color, 0.2);
    color: $metric-views-color;
  }
}

// Responsive - Tablet
@media (max-width: $breakpoint-tablet) {
  .dashboard-view-switcher {
    flex-wrap: wrap;
  }

  .view-mode-item .mode-label {
    display: none;
  }

  .tabs-divider {
    display: none;
  }

  .tab-buttons {
    flex-basis: 100%;
  }
}
```

### 3. Create Pagination Controls Component

#### 3.1 Create component folder
`/src/app/analytic-dashboard/components/shared/pagination-controls/`

#### 3.2 Create `pagination-controls.component.ts`
```typescript
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AnalyticsFilterService } from '../../../services';

/**
 * Pagination controls with row count selector
 */
@Component({
  selector: 'dh-pagination-controls',
  templateUrl: './pagination-controls.component.html',
  styleUrls: ['./pagination-controls.component.scss']
})
export class PaginationControlsComponent implements OnInit, OnDestroy {

  @Input() totalItems: number = 0;
  @Output() pageSizeChanged = new EventEmitter<number>();
  @Output() pageChanged = new EventEmitter<number>();

  pageSizeOptions = [
    { label: '25', value: 25 },
    { label: '50', value: 50 },
    { label: '100', value: 100 },
    { label: '250', value: 250 },
    { label: 'All', value: 0 }
  ];

  currentPageSize: number = 25;
  currentPage: number = 0;

  private unsubscribe$ = new Subject<void>();

  constructor(private filterService: AnalyticsFilterService) {}

  ngOnInit(): void {
    this.filterService.filterContext$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(filter => {
        this.currentPageSize = filter.pageSize || 25;
        this.currentPage = filter.pageIndex || 0;
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onPageSizeChange(event: any): void {
    const newSize = event.value;
    this.filterService.setPageSize(newSize);
    this.pageSizeChanged.emit(newSize);
  }

  onPageChange(event: any): void {
    this.filterService.setPageIndex(event.page);
    this.pageChanged.emit(event.page);
  }

  get totalPages(): number {
    if (this.currentPageSize === 0) return 1;
    return Math.ceil(this.totalItems / this.currentPageSize);
  }

  get showingFrom(): number {
    if (this.currentPageSize === 0) return 1;
    return (this.currentPage * this.currentPageSize) + 1;
  }

  get showingTo(): number {
    if (this.currentPageSize === 0) return this.totalItems;
    return Math.min((this.currentPage + 1) * this.currentPageSize, this.totalItems);
  }
}
```

#### 3.3 Create `pagination-controls.component.html`
```html
<div class="pagination-controls">
  <div class="page-size-selector">
    <span class="label">Show</span>
    <p-dropdown
      [options]="pageSizeOptions"
      [(ngModel)]="currentPageSize"
      (onChange)="onPageSizeChange($event)"
      optionLabel="label"
      optionValue="value"
      styleClass="page-size-dropdown">
    </p-dropdown>
    <span class="label">items</span>
  </div>

  <div class="page-info" *ngIf="totalItems > 0">
    <span>Showing {{ showingFrom }} - {{ showingTo }} of {{ totalItems }}</span>
  </div>

  <p-paginator
    *ngIf="currentPageSize > 0 && totalPages > 1"
    [rows]="currentPageSize"
    [totalRecords]="totalItems"
    [first]="currentPage * currentPageSize"
    (onPageChange)="onPageChange($event)"
    [showFirstLastIcon]="true"
    [showPageLinks]="true"
    [pageLinkSize]="5"
    styleClass="compact-paginator">
  </p-paginator>
</div>
```

#### 3.4 Create `pagination-controls.component.scss`
```scss
@import '../../../styles/design-tokens';

.pagination-controls {
  display: flex;
  align-items: center;
  gap: $spacing-lg;
  padding: $spacing-md;
  background: $gray-50;
  border-top: 1px solid $gray-200;
}

.page-size-selector {
  display: flex;
  align-items: center;
  gap: $spacing-sm;

  .label {
    font-size: $font-size-sm;
    color: $gray-600;
  }

  :host ::ng-deep .page-size-dropdown {
    .p-dropdown {
      min-width: 70px;

      .p-dropdown-label {
        padding: 6px 8px;
        font-size: $font-size-sm;
      }
    }
  }
}

.page-info {
  font-size: $font-size-sm;
  color: $gray-600;
}

:host ::ng-deep .compact-paginator {
  .p-paginator {
    padding: 0;
    background: transparent;

    .p-paginator-element {
      min-width: 32px;
      height: 32px;
    }
  }
}

// Push paginator to right
.page-info {
  margin-left: auto;
}
```

### 4. Update Components Index

Update `/src/app/analytic-dashboard/components/index.ts`:
```typescript
// ... existing imports
import { DashboardContextBarComponent } from './dashboard-context-bar/dashboard-context-bar.component';
import { DashboardViewSwitcherComponent } from './dashboard-view-switcher/dashboard-view-switcher.component';
import { PaginationControlsComponent } from './shared/pagination-controls/pagination-controls.component';

export const components = [
  // ... existing components
  DashboardContextBarComponent,
  DashboardViewSwitcherComponent,
  PaginationControlsComponent
];

// ... existing exports
export * from './dashboard-context-bar/dashboard-context-bar.component';
export * from './dashboard-view-switcher/dashboard-view-switcher.component';
export * from './shared/pagination-controls/pagination-controls.component';
```

---

## FILES CHECKLIST

### Files to CREATE:
| # | Path | Purpose | Est. Lines | Complete |
|---|------|---------|------------|----------|
| 1 | `/src/app/analytic-dashboard/components/dashboard-context-bar/dashboard-context-bar.component.ts` | Context bar with filters | ~112 | ☐ |
| 2 | `/src/app/analytic-dashboard/components/dashboard-context-bar/dashboard-context-bar.component.html` | Context bar template | ~49 | ☐ |
| 3 | `/src/app/analytic-dashboard/components/dashboard-context-bar/dashboard-context-bar.component.scss` | Context bar styles | ~88 | ☐ |
| 4 | `/src/app/analytic-dashboard/components/dashboard-view-switcher/dashboard-view-switcher.component.ts` | View mode switcher | ~108 | ☐ |
| 5 | `/src/app/analytic-dashboard/components/dashboard-view-switcher/dashboard-view-switcher.component.html` | View switcher template | ~35 | ☐ |
| 6 | `/src/app/analytic-dashboard/components/dashboard-view-switcher/dashboard-view-switcher.component.scss` | View switcher styles | ~123 | ☐ |
| 7 | `/src/app/analytic-dashboard/components/shared/pagination-controls/pagination-controls.component.ts` | Pagination controls | ~99 | ☐ |
| 8 | `/src/app/analytic-dashboard/components/shared/pagination-controls/pagination-controls.component.html` | Pagination template | ~30 | ☐ |
| 9 | `/src/app/analytic-dashboard/components/shared/pagination-controls/pagination-controls.component.scss` | Pagination styles | ~42 | ☐ |

### Files to MODIFY:
| # | Path | Changes | Complete |
|---|------|---------|----------|
| 1 | `/src/app/analytic-dashboard/components/index.ts` | Add DashboardContextBarComponent, DashboardViewSwitcherComponent, PaginationControlsComponent | ☐ |

---

## SMOKE TEST

### Quick Compile Check
```bash
cd /Users/billklingensmith/Code/ideal-sale-circular
yarn build 2>&1 | grep -E "(error|ERROR)" | head -20
```

### Visual Verification
1. Navigate to Analytics Dashboard
2. DashboardContextBarComponent:
   - Date range picker section visible
   - Entity selector section visible
   - Filter chips section visible (with "Add Filter" button)
   - Clicking "Add Filter" opens FilterModalComponent
3. DashboardViewSwitcherComponent:
   - Three buttons: BASE | GRID | COMPARE
   - BASE is selected by default
   - When BASE selected, sub-tabs appear: Promotions | Categories | Circulars
   - Switching to GRID or COMPARE hides sub-tabs
4. PaginationControlsComponent:
   - Page size dropdown (25, 50, 100, 250, All)
   - Shows "Showing X - Y of Z"
   - Paginator appears when multiple pages

---

## SENIOR DEV REVIEW CHECKLIST

Before finalizing, verify:

### Code Quality
- [ ] All code blocks complete (no `// ...`)
- [ ] All imports explicitly listed
- [ ] Component selectors use `dh-` prefix
- [ ] OnDestroy with takeUntil pattern in all components
- [ ] DashboardContextBarComponent closes modal ref on destroy

### Consistency with Prompt 00
- [ ] Colors use token variables: `$metric-views-color` for active states ✓
- [ ] Component prefix: `dh-` ✓
- [ ] Services injected via constructor ✓
- [ ] Animations imported and registered (fadeIn) ✓

### Angular Patterns
- [ ] DashboardContextBarComponent provides DialogService
- [ ] DashboardViewSwitcherComponent uses enums (ViewModeEnum, BaseViewTabEnum)
- [ ] PaginationControlsComponent emits @Output events
- [ ] All components subscribe with takeUntil pattern
- [ ] PrimeNG components properly imported (SelectButton, Dropdown, Paginator)

### Integration Points
- [ ] Uses AnalyticsFilterService for filter state
- [ ] Uses AnalyticsStateService for view mode state
- [ ] Opens FilterModalComponent via DialogService
- [ ] Updates state on user interactions

### Would this compile on first try? [YES/NO]

---

## CHECKPOINT D: Shared Components Complete

Before proceeding to Prompt 08, verify:

1. **Compile Check:** `yarn build` passes without errors
2. **Import Check:** No "Cannot find module" errors
3. **Constants Check:** Colors match Prompt 00 exactly
4. **Pattern Check:** All shared components created with proper lifecycle management
5. **Visual Check:**
   - Context bar renders with all sections
   - View switcher shows all modes and sub-tabs
   - Pagination controls display correctly

### Components Completed (Prompts 04-07):
- [x] PerformanceChartComponent
- [x] TrendChartComponent
- [x] MetricDisplayComponent
- [x] FilterChipsComponent
- [x] FilterModalComponent
- [x] DateRangePickerComponent
- [x] EntitySelectorComponent
- [x] DashboardContextBarComponent
- [x] DashboardViewSwitcherComponent
- [x] PaginationControlsComponent

### Issues Found:
(List any issues here before continuing)

### Ready to Continue: [YES/NO]

---

## Notes for Next Prompt
- All shared UI components are complete
- Dashboard header components provide date, entity, and filter controls
- View switcher handles BASE | GRID | COMPARE modes with sub-tabs
- Pagination controls ready for data panels
- Next: Prompt 08A will create the Category Sidebar for BASE view
