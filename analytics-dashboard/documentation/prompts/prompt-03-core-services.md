# Prompt 03: Core Services

## Context
You are implementing the Analytics Dashboard feature in the `ideal-sale-circular` Angular repository. This is prompt 3 of 12. Dependencies, mock data, DTOs, and enums have been set up in prompts 01-02.

## Working Directory
`/Users/billklingensmith/Code/ideal-sale-circular`

## Objective
Create the core services for the Analytics Dashboard: data service (with mock/API toggle), state service, and filter service.

---

## Tasks

### 1. Create Services Folder

Create folder: `/src/app/analytic-dashboard/services/`

### 2. Create Mock Data Service

#### 2.1 Create `analytics-mock-data.service.ts`
```typescript
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  PromotionDto,
  PromotionDetailDto,
  CategoryDto,
  CircularDto,
  FilterContextDto,
  WeekOptionDto
} from '../dto';
import {
  MOCK_PROMOTIONS,
  MOCK_CATEGORIES,
  MOCK_WEEKS,
  MOCK_ENTITIES,
  MOCK_WEEKLY_TRENDS
} from '../mock-data';

/**
 * Mock data service for Analytics Dashboard
 * Returns instant mock data for UI development
 *
 * This service will be replaced by AnalyticsApiService in production
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsMockDataService {

  /**
   * Get promotions with optional filtering
   * @param filter - Filter context for query
   * @returns Observable of filtered promotions
   */
  getPromotions(filter: FilterContextDto): Observable<PromotionDto[]> {
    let results = [...MOCK_PROMOTIONS];

    // Apply category filter
    if (filter.categoryIds?.length > 0) {
      results = results.filter(p => filter.categoryIds.includes(p.categoryId));
    }

    // Apply deal type filter
    if (filter.dealTypes?.length > 0) {
      results = results.filter(p => filter.dealTypes.includes(p.dealType));
    }

    // Apply card size filter
    if (filter.cardSizes?.length > 0) {
      results = results.filter(p => filter.cardSizes.includes(p.cardSize));
    }

    // Apply search text
    if (filter.searchText) {
      const search = filter.searchText.toLowerCase();
      results = results.filter(p =>
        p.name.toLowerCase().includes(search) ||
        p.categoryName.toLowerCase().includes(search)
      );
    }

    // Apply sorting
    if (filter.sortField) {
      results.sort((a, b) => {
        const aVal = a[filter.sortField];
        const bVal = b[filter.sortField];
        const direction = filter.sortDirection === 'desc' ? -1 : 1;
        return aVal > bVal ? direction : -direction;
      });
    }

    // Apply pagination
    if (filter.pageSize && filter.pageSize > 0) {
      const start = (filter.pageIndex || 0) * filter.pageSize;
      results = results.slice(start, start + filter.pageSize);
    }

    return of(results);
  }

  /**
   * Get promotion detail with weekly trends
   * @param promotionId - Promotion identifier
   * @param filter - Filter context for date range
   * @returns Observable of promotion details
   */
  getPromotionDetail(promotionId: string, filter: FilterContextDto): Observable<PromotionDetailDto> {
    const promotion = MOCK_PROMOTIONS.find(p => p.id === promotionId);
    if (!promotion) {
      return of(null);
    }

    const weeklyTrends = MOCK_WEEKLY_TRENDS
      .filter(t => t.promotionId === promotionId)
      .map(t => {
        const week = MOCK_WEEKS.find(w => w.id === t.weekId);
        return {
          weekId: t.weekId,
          weekLabel: week?.label || t.weekId,
          civ: t.civ,
          cc: t.cc,
          atl: t.atl
        };
      });

    return of({
      ...promotion,
      weeklyTrends
    } as PromotionDetailDto);
  }

  /**
   * Get categories with aggregated metrics
   * @param filter - Filter context for query
   * @returns Observable of categories
   */
  getCategories(filter: FilterContextDto): Observable<CategoryDto[]> {
    let results = [...MOCK_CATEGORIES];

    // Apply search text
    if (filter.searchText) {
      const search = filter.searchText.toLowerCase();
      results = results.filter(c => c.name.toLowerCase().includes(search));
    }

    // Apply sorting
    if (filter.sortField) {
      results.sort((a, b) => {
        const aVal = a[filter.sortField];
        const bVal = b[filter.sortField];
        const direction = filter.sortDirection === 'desc' ? -1 : 1;
        return aVal > bVal ? direction : -direction;
      });
    }

    return of(results);
  }

  /**
   * Get circulars/store data
   * @param filter - Filter context for query
   * @returns Observable of circulars
   */
  getCirculars(filter: FilterContextDto): Observable<CircularDto[]> {
    // Transform mock entities to CircularDto format
    const circulars: CircularDto[] = [];

    const flattenEntities = (entities: any[], brandHash = '', subBrandHash = '') => {
      for (const entity of entities) {
        if (entity.type === 'store') {
          circulars.push({
            id: entity.id,
            storeName: entity.name,
            storeNumber: entity.storeNumber || 0,
            address: entity.address || '',
            size: entity.size || 'medium',
            entityId: entity.id,
            brandHash,
            subBrandHash,
            promotionCount: Math.floor(Math.random() * 50) + 10,
            // Mock metrics
            civ: Math.floor(Math.random() * 10000),
            cc: Math.floor(Math.random() * 2000),
            atl: Math.floor(Math.random() * 500),
            compositeScore: 0,
            percentile: Math.floor(Math.random() * 100)
          });
        }
        if (entity.children) {
          flattenEntities(
            entity.children,
            entity.type === 'brand' ? entity.id : brandHash,
            entity.type === 'subbrand' ? entity.id : subBrandHash
          );
        }
      }
    };

    flattenEntities(MOCK_ENTITIES);

    // Calculate composite scores
    // Formula: CIV×1 + CC×10 + ATL×50
    circulars.forEach(c => {
      c.compositeScore = c.civ + (c.cc * 10) + (c.atl * 50);
    });

    return of(circulars);
  }

  /**
   * Get available weeks for date picker
   * @returns Observable of week options
   */
  getWeeks(): Observable<WeekOptionDto[]> {
    return of(MOCK_WEEKS.map(w => ({
      id: w.id,
      num: w.num,
      label: w.label,
      dateRange: w.dateRange,
      startDate: w.startDate,
      daysRun: w.daysRun
    })));
  }

  /**
   * Get entity hierarchy for entity selector
   * @returns Observable of entity tree
   */
  getEntityHierarchy(): Observable<any[]> {
    return of(MOCK_ENTITIES);
  }
}
```

### 3. Create API Service (Stub)

#### 3.1 Create `analytics-api.service.ts`
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import {
  PromotionDto,
  PromotionDetailDto,
  CategoryDto,
  CircularDto,
  FilterContextDto,
  WeekOptionDto
} from '../dto';

/**
 * API service for Analytics Dashboard
 *
 * API Team Integration Notes:
 * - Base URL should be configured in environment
 * - All endpoints expect FilterContextDto as query params or body
 * - Responses should match the DTO interfaces exactly
 * - Date formats: ISO 8601 (YYYY-MM-DD)
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsApiService {

  // TODO: Configure base URL from environment
  private readonly baseUrl = '/api/analytics';

  constructor(private http: HttpClient) {}

  /**
   * GET /api/analytics/promotions
   * Query params from FilterContextDto
   */
  getPromotions(filter: FilterContextDto): Observable<PromotionDto[]> {
    // TODO: Implement when API is ready
    // return this.http.get<PromotionDto[]>(`${this.baseUrl}/promotions`, { params: this.buildParams(filter) });
    console.warn('AnalyticsApiService.getPromotions - API not implemented');
    return of([]);
  }

  /**
   * GET /api/analytics/promotions/:id
   */
  getPromotionDetail(promotionId: string, filter: FilterContextDto): Observable<PromotionDetailDto> {
    // TODO: Implement when API is ready
    // return this.http.get<PromotionDetailDto>(`${this.baseUrl}/promotions/${promotionId}`, { params: this.buildParams(filter) });
    console.warn('AnalyticsApiService.getPromotionDetail - API not implemented');
    return of(null);
  }

  /**
   * GET /api/analytics/categories
   */
  getCategories(filter: FilterContextDto): Observable<CategoryDto[]> {
    // TODO: Implement when API is ready
    console.warn('AnalyticsApiService.getCategories - API not implemented');
    return of([]);
  }

  /**
   * GET /api/analytics/circulars
   */
  getCirculars(filter: FilterContextDto): Observable<CircularDto[]> {
    // TODO: Implement when API is ready
    console.warn('AnalyticsApiService.getCirculars - API not implemented');
    return of([]);
  }

  /**
   * GET /api/analytics/weeks
   */
  getWeeks(): Observable<WeekOptionDto[]> {
    // TODO: Implement when API is ready
    console.warn('AnalyticsApiService.getWeeks - API not implemented');
    return of([]);
  }

  /**
   * Helper to build query params from filter
   */
  private buildParams(filter: FilterContextDto): { [key: string]: string } {
    const params: { [key: string]: string } = {};

    if (filter.dateRange) {
      params['startDate'] = filter.dateRange.start;
      params['endDate'] = filter.dateRange.end;
    }
    if (filter.entityId) {
      params['entityId'] = filter.entityId;
    }
    if (filter.categoryIds?.length) {
      params['categoryIds'] = filter.categoryIds.join(',');
    }
    if (filter.dealTypes?.length) {
      params['dealTypes'] = filter.dealTypes.join(',');
    }
    if (filter.cardSizes?.length) {
      params['cardSizes'] = filter.cardSizes.join(',');
    }
    if (filter.searchText) {
      params['search'] = filter.searchText;
    }
    if (filter.pageSize) {
      params['pageSize'] = filter.pageSize.toString();
    }
    if (filter.pageIndex !== undefined) {
      params['pageIndex'] = filter.pageIndex.toString();
    }
    if (filter.sortField) {
      params['sortField'] = filter.sortField;
      params['sortDirection'] = filter.sortDirection || 'asc';
    }

    return params;
  }
}
```

### 4. Create Main Data Service (Facade)

#### 4.1 Create `analytics-data.service.ts`
```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import {
  PromotionDto,
  PromotionDetailDto,
  CategoryDto,
  CircularDto,
  FilterContextDto,
  WeekOptionDto
} from '../dto';
import { AnalyticsMockDataService } from './analytics-mock-data.service';
import { AnalyticsApiService } from './analytics-api.service';

/**
 * Facade service for Analytics Dashboard data
 *
 * Automatically switches between mock and real API based on environment.useMockAnalytics
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsDataService {

  constructor(
    private mockService: AnalyticsMockDataService,
    private apiService: AnalyticsApiService
  ) {}

  /**
   * Get promotions list
   */
  getPromotions(filter: FilterContextDto): Observable<PromotionDto[]> {
    return environment.useMockAnalytics
      ? this.mockService.getPromotions(filter)
      : this.apiService.getPromotions(filter);
  }

  /**
   * Get promotion detail with trends
   */
  getPromotionDetail(promotionId: string, filter: FilterContextDto): Observable<PromotionDetailDto> {
    return environment.useMockAnalytics
      ? this.mockService.getPromotionDetail(promotionId, filter)
      : this.apiService.getPromotionDetail(promotionId, filter);
  }

  /**
   * Get categories list
   */
  getCategories(filter: FilterContextDto): Observable<CategoryDto[]> {
    return environment.useMockAnalytics
      ? this.mockService.getCategories(filter)
      : this.apiService.getCategories(filter);
  }

  /**
   * Get circulars/stores list
   */
  getCirculars(filter: FilterContextDto): Observable<CircularDto[]> {
    return environment.useMockAnalytics
      ? this.mockService.getCirculars(filter)
      : this.apiService.getCirculars(filter);
  }

  /**
   * Get available weeks
   */
  getWeeks(): Observable<WeekOptionDto[]> {
    return environment.useMockAnalytics
      ? this.mockService.getWeeks()
      : this.apiService.getWeeks();
  }

  /**
   * Get entity hierarchy (mock only - production uses CurrentNodeService)
   */
  getEntityHierarchy(): Observable<any[]> {
    return this.mockService.getEntityHierarchy();
  }
}
```

### 5. Create State Service

#### 5.1 Create `analytics-state.service.ts`
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

### 6. Create Filter Service

#### 6.1 Create `analytics-filter.service.ts`
```typescript
import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { FilterContextDto, DateRangeDto } from '../dto';
import { MetricTypeEnum, DealTypeEnum, CardSizeEnum } from '../enums';

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
    const current = this.filterContextSubject.value;
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
      chips.push({ type: 'category', value: id, label: id }); // Label will be resolved by component
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

/**
 * Filter chip for display
 */
export interface FilterChip {
  type: 'category' | 'dealType' | 'cardSize' | 'search';
  value: string;
  label: string;
}
```

### 7. Create Barrel Export

#### 7.1 Create `services/index.ts`
```typescript
export * from './analytics-data.service';
export * from './analytics-mock-data.service';
export * from './analytics-api.service';
export * from './analytics-state.service';
export * from './analytics-filter.service';
```

---

## Files to Create
- `/src/app/analytic-dashboard/services/analytics-mock-data.service.ts`
- `/src/app/analytic-dashboard/services/analytics-api.service.ts`
- `/src/app/analytic-dashboard/services/analytics-data.service.ts`
- `/src/app/analytic-dashboard/services/analytics-state.service.ts`
- `/src/app/analytic-dashboard/services/analytics-filter.service.ts`
- `/src/app/analytic-dashboard/services/index.ts`

---

## Verification Steps

1. Run `yarn build` - Should compile without errors
2. Inject services in a component and verify they work:
   ```typescript
   constructor(
     private dataService: AnalyticsDataService,
     private stateService: AnalyticsStateService,
     private filterService: AnalyticsFilterService
   ) {}

   ngOnInit() {
     const filter = this.filterService.getFilterContext();
     this.dataService.getPromotions(filter).subscribe(promos => {
       console.log('Promotions:', promos.length);
     });
   }
   ```
3. Verify environment toggle:
   - With `useMockAnalytics: true` - should return mock data
   - With `useMockAnalytics: false` - should log warning (API not implemented)

---

## Notes for Next Prompt
- Services are ready for component consumption
- AnalyticsDataService provides facade with environment-based switching
- AnalyticsStateService manages all UI state
- AnalyticsFilterService handles filters with URL sync
- All services use `providedIn: 'root'` for singleton pattern
