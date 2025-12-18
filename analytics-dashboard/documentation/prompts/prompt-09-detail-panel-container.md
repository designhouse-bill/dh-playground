# Prompt 09: Detail Panel + Container Integration

## Context
You are implementing the Analytics Dashboard feature in the `ideal-sale-circular` Angular repository. This is prompt 9 of 12. Category sidebar and promotions panel have been set up in prompt 08.

## Working Directory
`/Users/billklingensmith/Code/ideal-sale-circular`

## Objective
Create DetailPanelComponent (right panel) and integrate all components into the main AnalyticDashboardComponent container for the complete BASE view.

---

## Tasks

### 1. Create Detail Panel Component

This is the right panel showing selected item details with charts and actions.

#### 1.1 Create component folder
`/src/app/analytic-dashboard/components/base-view/detail-panel/`

#### 1.2 Create `detail-panel.component.ts`
```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil, switchMap, filter } from 'rxjs';
import { AnalyticsDataService, AnalyticsFilterService, AnalyticsStateService } from '../../../services';
import { PromotionDto, PromotionDetailDto, CategoryDto, CircularDto } from '../../../dto';
import { BaseViewTabEnum } from '../../../enums';

/**
 * Right panel showing details of selected item
 * Content changes based on current base view tab
 */
@Component({
  selector: 'dh-detail-panel',
  templateUrl: './detail-panel.component.html',
  styleUrls: ['./detail-panel.component.scss']
})
export class DetailPanelComponent implements OnInit, OnDestroy {

  isOpen = false;
  loading = false;

  // Current view context
  currentTab: BaseViewTabEnum = BaseViewTabEnum.PROMOTIONS;

  // Selected items
  selectedPromotion: PromotionDto | null = null;
  promotionDetail: PromotionDetailDto | null = null;
  selectedCategory: CategoryDto | null = null;
  selectedCircular: CircularDto | null = null;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private dataService: AnalyticsDataService,
    private filterService: AnalyticsFilterService,
    private stateService: AnalyticsStateService
  ) {}

  ngOnInit(): void {
    // Track panel open state
    this.stateService.detailPanelOpen$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(isOpen => {
        this.isOpen = isOpen;
      });

    // Track current tab
    this.stateService.baseViewTab$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(tab => {
        this.currentTab = tab;
      });

    // Track selected promotion and load details
    this.stateService.selectedPromotion$
      .pipe(
        takeUntil(this.unsubscribe$),
        filter(p => p !== null),
        switchMap(promotion => {
          this.selectedPromotion = promotion;
          this.loading = true;
          const filter = this.filterService.getFilterContext();
          return this.dataService.getPromotionDetail(promotion!.id, filter);
        })
      )
      .subscribe(detail => {
        this.promotionDetail = detail;
        this.loading = false;
      });

    // Track selected category
    this.stateService.selectedCategory$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(category => {
        this.selectedCategory = category;
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

  close(): void {
    this.stateService.closeDetailPanel();
    this.stateService.clearSelection();
  }

  getPercentileClass(percentile: number): string {
    if (percentile >= 80) return 'percentile-high';
    if (percentile >= 50) return 'percentile-medium';
    return 'percentile-low';
  }

  formatPrice(price: number): string {
    return '$' + price.toFixed(2);
  }

  formatNumber(value: number): string {
    return value.toLocaleString();
  }

  get showPromotionDetail(): boolean {
    return this.currentTab === BaseViewTabEnum.PROMOTIONS && this.selectedPromotion !== null;
  }

  get showCategoryDetail(): boolean {
    return this.currentTab === BaseViewTabEnum.CATEGORIES && this.selectedCategory !== null;
  }

  get showCircularDetail(): boolean {
    return this.currentTab === BaseViewTabEnum.CIRCULARS && this.selectedCircular !== null;
  }
}
```

#### 1.3 Create `detail-panel.component.html`
```html
<div class="detail-panel" [class.open]="isOpen">
  <!-- Panel Header -->
  <div class="panel-header">
    <h3 class="panel-title">Details</h3>
    <button
      pButton
      type="button"
      icon="pi pi-times"
      class="p-button-text p-button-rounded close-btn"
      (click)="close()">
    </button>
  </div>

  <!-- Loading State -->
  <div class="loading-state" *ngIf="loading">
    <p-skeleton width="100%" height="120px" styleClass="mb-3"></p-skeleton>
    <p-skeleton width="60%" height="24px" styleClass="mb-2"></p-skeleton>
    <p-skeleton width="80%" height="20px" styleClass="mb-2"></p-skeleton>
    <p-skeleton width="100%" height="200px"></p-skeleton>
  </div>

  <!-- Promotion Detail -->
  <div class="panel-content" *ngIf="showPromotionDetail && !loading">
    <div class="detail-section hero-section">
      <div class="promo-header">
        <span class="card-size-badge">{{ selectedPromotion.cardSize }}</span>
        <span class="percentile-badge" [ngClass]="getPercentileClass(selectedPromotion.percentile)">
          Top {{ 100 - selectedPromotion.percentile }}%
        </span>
      </div>
      <h2 class="promo-name">{{ selectedPromotion.name }}</h2>
      <p class="promo-category">{{ selectedPromotion.categoryName }}</p>
      <div class="promo-pricing">
        <span class="original-price" *ngIf="selectedPromotion.originalPrice !== selectedPromotion.salePrice">
          {{ formatPrice(selectedPromotion.originalPrice) }}
        </span>
        <span class="sale-price">{{ formatPrice(selectedPromotion.salePrice) }}</span>
        <p-tag [value]="selectedPromotion.dealType" styleClass="deal-tag"></p-tag>
      </div>
    </div>

    <div class="detail-section">
      <h4 class="section-title">Performance Metrics</h4>
      <div class="metrics-grid">
        <div class="metric-card views">
          <span class="metric-label">Views (CIV)</span>
          <span class="metric-value">{{ formatNumber(selectedPromotion.civ) }}</span>
          <span class="metric-desc">Card impressions</span>
        </div>
        <div class="metric-card clicks">
          <span class="metric-label">Clicks (CC)</span>
          <span class="metric-value">{{ formatNumber(selectedPromotion.cc) }}</span>
          <span class="metric-desc">Card expansions</span>
        </div>
        <div class="metric-card adds">
          <span class="metric-label">Adds (ATL)</span>
          <span class="metric-value">{{ formatNumber(selectedPromotion.atl) }}</span>
          <span class="metric-desc">List additions</span>
        </div>
        <div class="metric-card score">
          <span class="metric-label">Score</span>
          <span class="metric-value">{{ formatNumber(selectedPromotion.compositeScore) }}</span>
          <span class="metric-desc">Composite score</span>
        </div>
      </div>
    </div>

    <div class="detail-section">
      <h4 class="section-title">Performance Chart</h4>
      <dh-performance-chart
        [civValue]="selectedPromotion.civ"
        [ccValue]="selectedPromotion.cc"
        [atlValue]="selectedPromotion.atl"
        [height]="40"
        [showLegend]="true"
        [showLabels]="true">
      </dh-performance-chart>
    </div>

    <div class="detail-section" *ngIf="promotionDetail?.weeklyTrends?.length > 0">
      <h4 class="section-title">Weekly Trend</h4>
      <dh-trend-chart
        [trendData]="promotionDetail.weeklyTrends"
        [height]="200"
        [showLegend]="true">
      </dh-trend-chart>
    </div>

    <div class="detail-section info-section">
      <h4 class="section-title">Additional Info</h4>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Active Stores</span>
          <span class="info-value">{{ selectedPromotion.storeCount }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Unit</span>
          <span class="info-value">{{ selectedPromotion.unit || 'N/A' }}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Category Detail -->
  <div class="panel-content" *ngIf="showCategoryDetail && !loading">
    <div class="detail-section hero-section">
      <h2 class="promo-name">{{ selectedCategory.name }}</h2>
      <p class="promo-category">{{ selectedCategory.promotionCount }} promotions</p>
    </div>

    <div class="detail-section">
      <h4 class="section-title">Category Metrics</h4>
      <div class="metrics-grid">
        <div class="metric-card views">
          <span class="metric-label">Views (CIV)</span>
          <span class="metric-value">{{ formatNumber(selectedCategory.civ) }}</span>
        </div>
        <div class="metric-card clicks">
          <span class="metric-label">Clicks (CC)</span>
          <span class="metric-value">{{ formatNumber(selectedCategory.cc) }}</span>
        </div>
        <div class="metric-card adds">
          <span class="metric-label">Adds (ATL)</span>
          <span class="metric-value">{{ formatNumber(selectedCategory.atl) }}</span>
        </div>
      </div>
    </div>

    <div class="detail-section">
      <h4 class="section-title">Performance</h4>
      <dh-performance-chart
        [civValue]="selectedCategory.civ"
        [ccValue]="selectedCategory.cc"
        [atlValue]="selectedCategory.atl"
        [height]="40"
        [showLegend]="true">
      </dh-performance-chart>
    </div>
  </div>

  <!-- Circular Detail -->
  <div class="panel-content" *ngIf="showCircularDetail && !loading">
    <div class="detail-section hero-section">
      <h2 class="promo-name">{{ selectedCircular.storeName }}</h2>
      <p class="promo-category">Store #{{ selectedCircular.storeNumber }}</p>
      <p class="store-address">{{ selectedCircular.address }}</p>
    </div>

    <div class="detail-section">
      <h4 class="section-title">Store Metrics</h4>
      <dh-performance-chart
        [civValue]="selectedCircular.civ"
        [ccValue]="selectedCircular.cc"
        [atlValue]="selectedCircular.atl"
        [height]="40"
        [showLegend]="true">
      </dh-performance-chart>
    </div>
  </div>

  <!-- Empty State -->
  <div class="empty-state" *ngIf="!showPromotionDetail && !showCategoryDetail && !showCircularDetail && !loading">
    <span class="material-symbols-outlined">touch_app</span>
    <p>Select an item to view details</p>
  </div>
</div>
```

#### 1.4 Create `detail-panel.component.scss`
```scss
@import '../../../styles/design-tokens';

.detail-panel {
  position: relative;
  width: 0;
  min-width: 0;
  height: 100%;
  background: white;
  border-left: 1px solid $gray-200;
  overflow: hidden;
  transition: width $transition-normal, min-width $transition-normal;

  &.open {
    width: 380px;
    min-width: 380px;
  }
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-md;
  border-bottom: 1px solid $gray-200;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
}

.panel-title {
  margin: 0;
  font-size: $font-size-md;
  font-weight: 600;
  color: $gray-800;
}

.close-btn {
  width: 32px;
  height: 32px;
}

.panel-content {
  padding: $spacing-md;
  overflow-y: auto;
  height: calc(100% - 57px);
}

.detail-section {
  margin-bottom: $spacing-lg;

  &:last-child {
    margin-bottom: 0;
  }

  &.hero-section {
    padding-bottom: $spacing-md;
    border-bottom: 1px solid $gray-200;
  }
}

.section-title {
  margin: 0 0 $spacing-sm 0;
  font-size: $font-size-xs;
  font-weight: 600;
  color: $gray-600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.promo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-sm;
}

.promo-name {
  margin: 0 0 $spacing-xs 0;
  font-size: $font-size-xl;
  font-weight: 600;
  color: $gray-900;
  line-height: 1.3;
}

.promo-category {
  margin: 0 0 $spacing-sm 0;
  font-size: $font-size-sm;
  color: $gray-600;
}

.store-address {
  margin: $spacing-xs 0 0 0;
  font-size: $font-size-sm;
  color: $gray-500;
}

.promo-pricing {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.original-price {
  font-size: $font-size-sm;
  color: $gray-500;
  text-decoration: line-through;
}

.sale-price {
  font-size: $font-size-lg;
  font-weight: 700;
  color: $gray-900;
}

.card-size-badge {
  display: inline-flex;
  padding: 4px 8px;
  background: $gray-200;
  border-radius: $radius-sm;
  font-size: $font-size-xs;
  font-weight: 600;
  color: $gray-700;
}

.percentile-badge {
  display: inline-flex;
  padding: 4px 10px;
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
  font-size: $font-size-xs;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-sm;
}

.metric-card {
  padding: $spacing-md;
  border-radius: $radius-md;
  text-align: center;

  &.views {
    background: rgba($metric-views-color, 0.08);
    .metric-value { color: $metric-views-color; }
  }

  &.clicks {
    background: rgba($metric-clicks-color, 0.08);
    .metric-value { color: darken($metric-clicks-color, 15%); }
  }

  &.adds {
    background: rgba($metric-adds-color, 0.08);
    .metric-value { color: $metric-adds-color; }
  }

  &.score {
    background: rgba($metric-total-color, 0.08);
    .metric-value { color: $metric-total-color; }
  }
}

.metric-label {
  display: block;
  font-size: $font-size-xs;
  font-weight: 600;
  color: $gray-600;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.metric-value {
  display: block;
  font-size: $font-size-xl;
  font-weight: 700;
}

.metric-desc {
  display: block;
  font-size: 10px;
  color: $gray-500;
  margin-top: 2px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-sm;
}

.info-item {
  padding: $spacing-sm;
  background: $gray-50;
  border-radius: $radius-sm;
}

.info-label {
  display: block;
  font-size: $font-size-xs;
  color: $gray-500;
  margin-bottom: 2px;
}

.info-value {
  font-size: $font-size-sm;
  font-weight: 600;
  color: $gray-800;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100% - 57px);
  color: $gray-400;
  text-align: center;
  padding: $spacing-xl;

  .material-symbols-outlined {
    font-size: 48px;
    margin-bottom: $spacing-md;
  }

  p {
    margin: 0;
    font-size: $font-size-sm;
  }
}

.loading-state {
  padding: $spacing-md;
}

// Tablet responsive
@media (max-width: $breakpoint-tablet) {
  .detail-panel.open {
    width: 320px;
    min-width: 320px;
  }
}
```

### 2. Update Main Container Component

Now integrate all components into the main AnalyticDashboardComponent.

#### 2.1 Update `analytic-dashboard.component.ts`
```typescript
import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserDto } from '@app/core/dtos/user.dto';
import { AuthService } from '@app/core/services/auth.service';
import { CircularDateService } from '@app/core/services/circular-date.service';
import { CurrentNodeService } from '@app/core/services/current-node.service';
import { LocalStorageService } from '@app/core/services/local-storage.service';
import { PreviewService } from '@app/core/services/preview.service';
import { NodeDto } from '@app/shared/dto/node.dto';
import { BrandTypeEnum } from '@app/shared/enums/brand-type.enum';
import { filter, Observable, Subject, takeUntil } from 'rxjs';
import { AnalyticsStateService, AnalyticsFilterService } from '../../services';
import { ViewModeEnum, BaseViewTabEnum } from '../../enums';
import * as moment from 'moment';

@Component({
  selector: 'dh-analytic-dashboard',
  templateUrl: './analytic-dashboard.component.html',
  styleUrls: ['./analytic-dashboard.component.scss'],
})
export class AnalyticDashboardComponent implements OnInit, OnDestroy {
  // Existing properties
  startDate: Date;
  dateParameter: Date;
  currentNode: NodeDto;
  unsubscribe$ = new Subject<void>();
  contentDate = new UntypedFormControl();
  filterGroup = new UntypedFormGroup({
    contentDate: this.contentDate,
  });

  // New state properties
  viewMode: ViewModeEnum = ViewModeEnum.BASE;
  baseViewTab: BaseViewTabEnum = BaseViewTabEnum.PROMOTIONS;
  detailPanelOpen = false;

  // Expose enums to template
  ViewModeEnum = ViewModeEnum;
  BaseViewTabEnum = BaseViewTabEnum;

  constructor(
    protected readonly circularDateService: CircularDateService,
    private readonly authService: AuthService,
    private readonly currentNodeService: CurrentNodeService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly previewService: PreviewService,
    private readonly localStorageService: LocalStorageService,
    private readonly stateService: AnalyticsStateService,
    private readonly filterService: AnalyticsFilterService,
  ) {}

  ngOnInit() {
    // Existing initialization
    let useDefaultDate = false;
    this.authService.loggedUser$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((currentUser: UserDto) => {
        if (!currentUser) {
          return;
        }

        const currentBrandType = this.localStorageService.getBrandType();
        let nodeObservable: Observable<NodeDto>;
        switch (currentBrandType) {
          case BrandTypeEnum.Retail:
            nodeObservable = this.currentNodeService.node$;
            break;
          case BrandTypeEnum.Cpg:
            nodeObservable = this.currentNodeService.cpgNode$;
            break;
        }

        nodeObservable
          .pipe(takeUntil(this.unsubscribe$), filter<NodeDto>(Boolean))
          .subscribe((node) => {
            this.currentNode = node;
            this.getNodeData(useDefaultDate);
            setTimeout(() => {
              this.setDateParameter(this.contentDate.value);
            });
            useDefaultDate = true;
          });
      });

    // Subscribe to state changes
    this.stateService.viewMode$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(mode => {
        this.viewMode = mode;
      });

    this.stateService.baseViewTab$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(tab => {
        this.baseViewTab = tab;
      });

    this.stateService.detailPanelOpen$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(open => {
        this.detailPanelOpen = open;
      });

    // Initialize filter service from URL
    this.filterService.initFromUrl();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.stateService.resetState();
  }

  // ... keep existing methods (getNodeData, setCurrentDateToToday, setDateParameter, dateChange)

  getNodeData(useDefaultDate = false) {
    this.setCurrentDateToToday();
    let filterDate = this.circularDateService.nextValidCircularDate(
      this.circularDateService.transformDate(this.contentDate.value),
      this.currentNode.circularStartDayOfWeek,
      this.currentNode.circularStartTimeOfDay,
      this.currentNode?.circularTimezoneOffset,
    );

    const dateURL = this.route.snapshot.queryParamMap.get('date');
    const utcDate = moment(dateURL, 'YYYYMMDDHHmm', true);
    if (utcDate.isValid() && !useDefaultDate) {
      this.dateParameter = this.circularDateService.convertUtcToNodeTimezone(
        utcDate,
        this.currentNode.circularTimezone,
      );
    } else {
      this.dateParameter = null;
      this.setDateParameter(filterDate);
    }

    this.startDate = filterDate;
    this.contentDate.setValue(this.dateParameter ?? filterDate);
  }

  setCurrentDateToToday(): void {
    const today = new Date();
    let newMinutes = today.getMinutes() + 15;
    if (today.getMinutes() % 15) {
      newMinutes -= today.getMinutes() % 15;
    }
    today.setMinutes(newMinutes, 0, 0);
    this.contentDate.setValue(today);
  }

  setDateParameter(date: Date) {
    const queryParams = { ...this.route.snapshot.queryParams };
    date = this.previewService.checkCurrentFilterDateTimeZoneForCampaign(
      date,
      this.currentNode.circularTimezone,
    );
    const utcDate = this.circularDateService.convertToUTC(
      date,
      this.currentNode.circularTimezoneOffset,
    );
    const dateString = this.circularDateService.convertDateToString(utcDate);
    const datePart = dateString.split('T')[0];
    const timePart = dateString.split('T')[1];
    const formattedDate = datePart.split('-').join('') + timePart.split(':').join('').substr(0, 4);

    queryParams['date'] = formattedDate;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge',
    });
  }

  dateChange(customDate: boolean): void {
    this.setDateParameter(this.contentDate.value);
  }

  // Helper getters for template
  get showBaseView(): boolean {
    return this.viewMode === ViewModeEnum.BASE;
  }

  get showGridView(): boolean {
    return this.viewMode === ViewModeEnum.GRID;
  }

  get showCompareView(): boolean {
    return this.viewMode === ViewModeEnum.COMPARE;
  }

  get showPromotionsTab(): boolean {
    return this.baseViewTab === BaseViewTabEnum.PROMOTIONS;
  }

  get showCategoriesTab(): boolean {
    return this.baseViewTab === BaseViewTabEnum.CATEGORIES;
  }

  get showCircularsTab(): boolean {
    return this.baseViewTab === BaseViewTabEnum.CIRCULARS;
  }
}
```

#### 2.2 Update `analytic-dashboard.component.html`
```html
<dh-subheader contentTitle="Analytics Dashboard" entityName="Analytics">
  <ng-template #toolbarLeftPanel>
    <dh-dashboard-view-switcher></dh-dashboard-view-switcher>
  </ng-template>
</dh-subheader>

<!-- Context Bar -->
<dh-dashboard-context-bar></dh-dashboard-context-bar>

<!-- Main Content Area -->
<div class="dashboard-content">
  <!-- BASE View: Three Column Layout -->
  <div class="base-view-layout" *ngIf="showBaseView">
    <!-- Left Panel: Category Sidebar -->
    <aside class="left-panel">
      <dh-category-sidebar></dh-category-sidebar>
    </aside>

    <!-- Center Panel: Content based on tab -->
    <main class="center-panel">
      <dh-promotions-panel *ngIf="showPromotionsTab"></dh-promotions-panel>
      <!-- Categories and Circulars panels will be added in prompt 10 -->
      <div class="placeholder-panel" *ngIf="showCategoriesTab">
        <p>Categories Panel - Coming Soon</p>
      </div>
      <div class="placeholder-panel" *ngIf="showCircularsTab">
        <p>Circulars Panel - Coming Soon</p>
      </div>
    </main>

    <!-- Right Panel: Detail Panel -->
    <dh-detail-panel></dh-detail-panel>
  </div>

  <!-- GRID View: Full Width Data Grid -->
  <div class="grid-view-layout" *ngIf="showGridView">
    <div class="placeholder-panel">
      <p>Grid Inquiry View - Coming in Prompt 11</p>
    </div>
  </div>

  <!-- COMPARE View: Side by Side -->
  <div class="compare-view-layout" *ngIf="showCompareView">
    <div class="placeholder-panel">
      <p>Compare View - Coming in Prompt 12</p>
    </div>
  </div>
</div>
```

#### 2.3 Update `analytic-dashboard.component.scss`
```scss
@import '../../styles/design-tokens';

:host {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.dashboard-content {
  flex: 1;
  overflow: hidden;
  background: $gray-100;
}

// BASE View Layout
.base-view-layout {
  display: flex;
  height: 100%;
  overflow: hidden;
}

.left-panel {
  width: 280px;
  min-width: 280px;
  height: 100%;
  overflow: hidden;
  flex-shrink: 0;
}

.center-panel {
  flex: 1;
  min-width: 0;
  height: 100%;
  overflow: hidden;
}

// GRID View Layout
.grid-view-layout {
  height: 100%;
  padding: $spacing-md;
}

// COMPARE View Layout
.compare-view-layout {
  display: flex;
  height: 100%;
  padding: $spacing-md;
  gap: $spacing-md;
}

// Placeholder for future components
.placeholder-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: white;
  border-radius: $radius-md;
  color: $gray-500;

  p {
    margin: 0;
  }
}

// Tablet Responsive
@media (max-width: $breakpoint-tablet) {
  .base-view-layout {
    flex-direction: column;
  }

  .left-panel {
    width: 100%;
    min-width: 100%;
    height: auto;
    max-height: 200px;
    border-right: none;
    border-bottom: 1px solid $gray-200;
  }
}
```

### 3. Update Components Index

Update `/src/app/analytic-dashboard/components/index.ts`:
```typescript
// ... existing imports
import { DetailPanelComponent } from './base-view/detail-panel/detail-panel.component';

export const components = [
  // ... existing components
  DetailPanelComponent
];

// ... existing exports
export * from './base-view/detail-panel/detail-panel.component';
```

---

## Files to Create
- `/src/app/analytic-dashboard/components/base-view/detail-panel/detail-panel.component.ts`
- `/src/app/analytic-dashboard/components/base-view/detail-panel/detail-panel.component.html`
- `/src/app/analytic-dashboard/components/base-view/detail-panel/detail-panel.component.scss`

## Files to Modify
- `/src/app/analytic-dashboard/components/analytic-dashboard/analytic-dashboard.component.ts`
- `/src/app/analytic-dashboard/components/analytic-dashboard/analytic-dashboard.component.html`
- `/src/app/analytic-dashboard/components/analytic-dashboard/analytic-dashboard.component.scss`
- `/src/app/analytic-dashboard/components/index.ts`

---

## Verification Steps

1. Run `yarn build` - Should compile without errors
2. Navigate to Analytics Dashboard in browser
3. Verify three-column layout displays:
   - Left: Category sidebar with categories
   - Center: Promotions table
   - Right: Detail panel (initially hidden)
4. Click a category - verify promotions filter
5. Click a promotion - verify detail panel opens with data
6. Verify close button on detail panel works
7. Toggle card view - verify grid layout displays
8. Switch view modes (BASE | GRID | COMPARE) - verify layouts change

---

## Notes for Next Prompt
- MVP BASE view with Promotions is complete
- Detail panel shows promotion details with charts
- Categories and Circulars panels are placeholders for prompt 10
- Grid and Compare views are placeholders for prompts 11-12
