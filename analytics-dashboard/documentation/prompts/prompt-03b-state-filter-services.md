# Prompt 03B: State & Filter Services

> **Reference:** See `prompt-00-constants-standards.md` for all constants and quality requirements.

## Context
You are implementing the Analytics Dashboard feature in the `ideal-sale-circular` Angular repository. This is prompt 03B of 18. Data services have been set up in prompt 03A.

## Working Directory
`/Users/billklingensmith/Code/ideal-sale-circular`

## Objective
Create the state management and filter services for the Analytics Dashboard: UI state service and filter service with URL synchronization.

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
| 1 | `/src/app/analytic-dashboard/services/analytics-state.service.ts` | UI state management | ~160 | ☐ |
| 2 | `/src/app/analytic-dashboard/services/analytics-filter.service.ts` | Filter + URL sync | ~310 | ☐ |
| 3 | `/src/app/analytic-dashboard/services/index.ts` | Barrel export | ~6 | ☐ |

### Files to MODIFY:
| # | Path | Changes | Complete |
|---|------|---------|----------|
| None in this prompt | | |

### Required Imports per File:

**analytics-state.service.ts:**
```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ViewModeEnum, BaseViewTabEnum } from '../enums';
import { PromotionDto, CategoryDto, CircularDto } from '../dto';
```

**analytics-filter.service.ts:**
```typescript
import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { FilterContextDto, DateRangeDto } from '../dto';
import { MetricTypeEnum, DealTypeEnum, CardSizeEnum } from '../enums';
```

---

## Tasks

### 1. Create State Service

#### File: `analytics-state.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ViewModeEnum, BaseViewTabEnum } from '../enums';
import { PromotionDto, CategoryDto, CircularDto } from '../dto';

/**
 * State management service for Analytics Dashboard
 * Manages UI state: view mode, selections, panel states
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsStateService {

  // View Mode State
  private viewModeSubject = new BehaviorSubject<ViewModeEnum>(ViewModeEnum.BASE);
  public viewMode$: Observable<ViewModeEnum> = this.viewModeSubject.asObservable();

  // Base View Tab State
  private baseViewTabSubject = new BehaviorSubject<BaseViewTabEnum>(BaseViewTabEnum.PROMOTIONS);
  public baseViewTab$: Observable<BaseViewTabEnum> = this.baseViewTabSubject.asObservable();

  // Selected Items
  private selectedPromotionSubject = new BehaviorSubject<PromotionDto | null>(null);
  public selectedPromotion$: Observable<PromotionDto | null> = this.selectedPromotionSubject.asObservable();

  private selectedCategorySubject = new BehaviorSubject<CategoryDto | null>(null);
  public selectedCategory$: Observable<CategoryDto | null> = this.selectedCategorySubject.asObservable();

  private selectedCircularSubject = new BehaviorSubject<CircularDto | null>(null);
  public selectedCircular$: Observable<CircularDto | null> = this.selectedCircularSubject.asObservable();

  // Panel States
  private detailPanelOpenSubject = new BehaviorSubject<boolean>(false);
  public detailPanelOpen$: Observable<boolean> = this.detailPanelOpenSubject.asObservable();

  // Loading States
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$: Observable<boolean> = this.loadingSubject.asObservable();

  // Card View Toggle (for promotions panel)
  private cardViewEnabledSubject = new BehaviorSubject<boolean>(false);
  public cardViewEnabled$: Observable<boolean> = this.cardViewEnabledSubject.asObservable();

  constructor() {}

  // View Mode Methods
  setViewMode(mode: ViewModeEnum): void {
    this.viewModeSubject.next(mode);
    // Close detail panel when switching view modes
    if (mode !== ViewModeEnum.BASE) {
      this.closeDetailPanel();
    }
  }

  getViewMode(): ViewModeEnum {
    return this.viewModeSubject.value;
  }

  // Base View Tab Methods
  setBaseViewTab(tab: BaseViewTabEnum): void {
    this.baseViewTabSubject.next(tab);
    // Clear selection when switching tabs
    this.clearSelection();
  }

  getBaseViewTab(): BaseViewTabEnum {
    return this.baseViewTabSubject.value;
  }

  // Selection Methods
  selectPromotion(promotion: PromotionDto | null): void {
    this.selectedPromotionSubject.next(promotion);
    if (promotion) {
      this.openDetailPanel();
    }
  }

  selectCategory(category: CategoryDto | null): void {
    this.selectedCategorySubject.next(category);
    if (category) {
      this.openDetailPanel();
    }
  }

  selectCircular(circular: CircularDto | null): void {
    this.selectedCircularSubject.next(circular);
    if (circular) {
      this.openDetailPanel();
    }
  }

  clearSelection(): void {
    this.selectedPromotionSubject.next(null);
    this.selectedCategorySubject.next(null);
    this.selectedCircularSubject.next(null);
    this.closeDetailPanel();
  }

  getSelectedPromotion(): PromotionDto | null {
    return this.selectedPromotionSubject.value;
  }

  getSelectedCategory(): CategoryDto | null {
    return this.selectedCategorySubject.value;
  }

  getSelectedCircular(): CircularDto | null {
    return this.selectedCircularSubject.value;
  }

  // Panel Methods
  openDetailPanel(): void {
    this.detailPanelOpenSubject.next(true);
  }

  closeDetailPanel(): void {
    this.detailPanelOpenSubject.next(false);
  }

  toggleDetailPanel(): void {
    this.detailPanelOpenSubject.next(!this.detailPanelOpenSubject.value);
  }

  isDetailPanelOpen(): boolean {
    return this.detailPanelOpenSubject.value;
  }

  // Loading Methods
  setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  isLoading(): boolean {
    return this.loadingSubject.value;
  }

  // Card View Methods
  setCardViewEnabled(enabled: boolean): void {
    this.cardViewEnabledSubject.next(enabled);
  }

  toggleCardView(): void {
    this.cardViewEnabledSubject.next(!this.cardViewEnabledSubject.value);
  }

  isCardViewEnabled(): boolean {
    return this.cardViewEnabledSubject.value;
  }

  // Reset all state
  resetState(): void {
    this.viewModeSubject.next(ViewModeEnum.BASE);
    this.baseViewTabSubject.next(BaseViewTabEnum.PROMOTIONS);
    this.clearSelection();
    this.setLoading(false);
    this.setCardViewEnabled(false);
  }
}
```

✓ This file is COMPLETE: YES
✓ All imports included: YES
✓ Compiles standalone: YES

---

### 2. Create Filter Service

#### File: `analytics-filter.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { FilterContextDto, DateRangeDto } from '../dto';
import { MetricTypeEnum, DealTypeEnum, CardSizeEnum } from '../enums';

/**
 * Filter chip for display
 */
export interface FilterChip {
  type: 'category' | 'dealType' | 'cardSize' | 'search';
  value: string;
  label: string;
}

/**
 * Filter management service for Analytics Dashboard
 * Handles filter state and URL parameter synchronization
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsFilterService {

  private filterContextSubject = new BehaviorSubject<FilterContextDto>(this.getDefaultFilter());
  public filterContext$: Observable<FilterContextDto> = this.filterContextSubject.asObservable();

  // Active filter chips for display
  private activeFiltersSubject = new BehaviorSubject<FilterChip[]>([]);
  public activeFilters$: Observable<FilterChip[]> = this.activeFiltersSubject.asObservable();

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  /**
   * Get default filter configuration
   */
  getDefaultFilter(): FilterContextDto {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      dateRange: {
        start: this.formatDate(weekAgo),
        end: this.formatDate(today)
      },
      entityId: '',
      categoryIds: [],
      dealTypes: [],
      cardSizes: [],
      metricType: MetricTypeEnum.ALL,
      searchText: '',
      pageSize: 25,
      pageIndex: 0,
      sortField: 'compositeScore',
      sortDirection: 'desc'
    };
  }

  /**
   * Get current filter context
   */
  getFilterContext(): FilterContextDto {
    return this.filterContextSubject.value;
  }

  /**
   * Update filter context
   */
  setFilterContext(filter: Partial<FilterContextDto>): void {
    const current = this.filterContextSubject.value;
    const updated = { ...current, ...filter };
    this.filterContextSubject.next(updated);
    this.updateActiveFilters(updated);
    this.syncToUrl(updated);
  }

  /**
   * Set date range
   */
  setDateRange(dateRange: DateRangeDto): void {
    this.setFilterContext({ dateRange, pageIndex: 0 });
  }

  /**
   * Set entity filter
   */
  setEntityId(entityId: string): void {
    this.setFilterContext({ entityId, pageIndex: 0 });
  }

  /**
   * Set category filters
   */
  setCategoryIds(categoryIds: string[]): void {
    this.setFilterContext({ categoryIds, pageIndex: 0 });
  }

  /**
   * Toggle a category in the filter
   */
  toggleCategory(categoryId: string): void {
    const current = this.filterContextSubject.value.categoryIds;
    const updated = current.includes(categoryId)
      ? current.filter(id => id !== categoryId)
      : [...current, categoryId];
    this.setCategoryIds(updated);
  }

  /**
   * Set deal type filters
   */
  setDealTypes(dealTypes: (DealTypeEnum | string)[]): void {
    this.setFilterContext({ dealTypes, pageIndex: 0 });
  }

  /**
   * Set card size filters
   */
  setCardSizes(cardSizes: (CardSizeEnum | string)[]): void {
    this.setFilterContext({ cardSizes, pageIndex: 0 });
  }

  /**
   * Set search text
   */
  setSearchText(searchText: string): void {
    this.setFilterContext({ searchText, pageIndex: 0 });
  }

  /**
   * Set metric type for display emphasis
   */
  setMetricType(metricType: MetricTypeEnum): void {
    this.setFilterContext({ metricType });
  }

  /**
   * Set pagination
   */
  setPageSize(pageSize: number): void {
    this.setFilterContext({ pageSize, pageIndex: 0 });
  }

  setPageIndex(pageIndex: number): void {
    this.setFilterContext({ pageIndex });
  }

  /**
   * Set sorting
   */
  setSorting(sortField: string, sortDirection: 'asc' | 'desc'): void {
    this.setFilterContext({ sortField, sortDirection });
  }

  /**
   * Clear all filters (except date range)
   */
  clearFilters(): void {
    this.setFilterContext({
      categoryIds: [],
      dealTypes: [],
      cardSizes: [],
      searchText: '',
      pageIndex: 0
    });
  }

  /**
   * Remove a specific filter chip
   */
  removeFilter(chip: FilterChip): void {
    switch (chip.type) {
      case 'category':
        this.toggleCategory(chip.value);
        break;
      case 'dealType':
        const dealTypes = this.filterContextSubject.value.dealTypes.filter(d => d !== chip.value);
        this.setDealTypes(dealTypes);
        break;
      case 'cardSize':
        const cardSizes = this.filterContextSubject.value.cardSizes.filter(s => s !== chip.value);
        this.setCardSizes(cardSizes);
        break;
      case 'search':
        this.setSearchText('');
        break;
    }
  }

  /**
   * Check if any filters are active
   */
  hasActiveFilters(): boolean {
    const filter = this.filterContextSubject.value;
    return (
      filter.categoryIds.length > 0 ||
      filter.dealTypes.length > 0 ||
      filter.cardSizes.length > 0 ||
      !!filter.searchText
    );
  }

  /**
   * Initialize from URL parameters
   */
  initFromUrl(): void {
    const params = this.route.snapshot.queryParams;
    const filter: Partial<FilterContextDto> = {};

    if (params['startDate'] && params['endDate']) {
      filter.dateRange = {
        start: params['startDate'],
        end: params['endDate']
      };
    }
    if (params['entityId']) {
      filter.entityId = params['entityId'];
    }
    if (params['categories']) {
      filter.categoryIds = params['categories'].split(',');
    }
    if (params['dealTypes']) {
      filter.dealTypes = params['dealTypes'].split(',');
    }
    if (params['cardSizes']) {
      filter.cardSizes = params['cardSizes'].split(',');
    }
    if (params['search']) {
      filter.searchText = params['search'];
    }
    if (params['pageSize']) {
      filter.pageSize = parseInt(params['pageSize'], 10);
    }
    if (params['sortField']) {
      filter.sortField = params['sortField'];
      filter.sortDirection = params['sortDir'] as 'asc' | 'desc' || 'desc';
    }

    if (Object.keys(filter).length > 0) {
      this.setFilterContext(filter);
    }
  }

  // Private helpers

  private updateActiveFilters(filter: FilterContextDto): void {
    const chips: FilterChip[] = [];

    filter.categoryIds.forEach(id => {
      chips.push({ type: 'category', value: id, label: id }); // Label resolved by component
    });

    filter.dealTypes.forEach(type => {
      chips.push({ type: 'dealType', value: type, label: type.toString() });
    });

    filter.cardSizes.forEach(size => {
      chips.push({ type: 'cardSize', value: size, label: size.toString() });
    });

    if (filter.searchText) {
      chips.push({ type: 'search', value: filter.searchText, label: `"${filter.searchText}"` });
    }

    this.activeFiltersSubject.next(chips);
  }

  private syncToUrl(filter: FilterContextDto): void {
    const queryParams: { [key: string]: string } = {};

    if (filter.dateRange) {
      queryParams['startDate'] = filter.dateRange.start;
      queryParams['endDate'] = filter.dateRange.end;
    }
    if (filter.entityId) {
      queryParams['entityId'] = filter.entityId;
    }
    if (filter.categoryIds.length > 0) {
      queryParams['categories'] = filter.categoryIds.join(',');
    }
    if (filter.dealTypes.length > 0) {
      queryParams['dealTypes'] = filter.dealTypes.join(',');
    }
    if (filter.cardSizes.length > 0) {
      queryParams['cardSizes'] = filter.cardSizes.join(',');
    }
    if (filter.searchText) {
      queryParams['search'] = filter.searchText;
    }
    if (filter.pageSize !== 25) {
      queryParams['pageSize'] = filter.pageSize.toString();
    }
    if (filter.sortField && filter.sortField !== 'compositeScore') {
      queryParams['sortField'] = filter.sortField;
      queryParams['sortDir'] = filter.sortDirection;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
```

✓ This file is COMPLETE: YES
✓ All imports included: YES
✓ Compiles standalone: YES

---

### 3. Create Barrel Export

#### File: `services/index.ts`

```typescript
export * from './analytics-data.service';
export * from './analytics-mock-data.service';
export * from './analytics-api.service';
export * from './analytics-state.service';
export * from './analytics-filter.service';
```

✓ This file is COMPLETE: YES
✓ All imports included: YES
✓ Compiles standalone: YES

---

## SMOKE TEST

### Quick Compile Check
```bash
cd /Users/billklingensmith/Code/ideal-sale-circular
yarn build 2>&1 | grep -E "(error|ERROR)" | head -20
```

### Service Import Test
Create temporary test in `src/app/analytic-dashboard/test-imports.ts`:
```typescript
// DELETE THIS FILE AFTER VERIFICATION
import { AnalyticsStateService, AnalyticsFilterService } from './services';

const state = new AnalyticsStateService();
console.log('State service viewMode:', state.getViewMode());

// Filter service needs Router/ActivatedRoute - test via injection only
console.log('Services imported successfully');
```

### Integration Verification
```typescript
// In any component:
constructor(
  private dataService: AnalyticsDataService,
  private stateService: AnalyticsStateService,
  private filterService: AnalyticsFilterService
) {}

ngOnInit() {
  const filter = this.filterService.getFilterContext();
  this.dataService.getPromotions(filter).subscribe(promos => {
    console.log('Loaded promotions:', promos.length);
  });

  this.stateService.viewMode$.subscribe(mode => {
    console.log('View mode:', mode);
  });
}
```

---

## SENIOR DEV REVIEW CHECKLIST

Before finalizing, verify:

### Code Quality
- [x] All code blocks complete (no `// ...`)
- [x] All imports explicitly listed
- [x] No hardcoded values (uses Constants)
- [x] Services use `providedIn: 'root'`

### Consistency
- [x] Default sort field is `compositeScore`
- [x] Variables: `civ`, `cc`, `atl`, `compositeScore`

### Angular Patterns
- [x] BehaviorSubject for state management
- [x] Observable streams exposed as public
- [x] URL synchronization via Router
- [x] Services via constructor injection

### Would this compile on first try? YES

---

## CHECKPOINT B: Verify Services Compile

Before proceeding to prompt 04, verify:

1. **Compile Check:** `yarn build` passes without errors
2. **Import Check:** All 5 services import from barrel export
3. **Injection Check:** Services can be injected into a component
4. **Mock Data Check:** `useMockAnalytics: true` returns mock data

### Test Command:
```bash
cd /Users/billklingensmith/Code/ideal-sale-circular
yarn build && echo "✓ Services compile successfully"
```

### Issues Found:
(List any issues here before continuing)

### Ready to Continue: [YES/NO]

---

## Notes for Next Prompt (04)
- All 5 services are ready for component consumption
- AnalyticsDataService provides facade with environment-based switching
- AnalyticsStateService manages all UI state with BehaviorSubjects
- AnalyticsFilterService handles filters with URL sync
- All services use `providedIn: 'root'` for singleton pattern
- Next: Create animations and chart components
