# Prompt 09A: Detail Panel Component

## Prerequisites
- **MUST READ FIRST:** [Prompt 00 - Constants & Standards](./prompt-00-constants-standards.md)
- Completed: Prompts 01-08B (Category Sidebar, Promotions Panel)

## Context
You are implementing the Analytics Dashboard feature in the `ideal-sale-circular` Angular repository. This is prompt 9A of the restructured series. Category sidebar and promotions panel have been set up in prompts 08A-08B.

## Working Directory
`/Users/billklingensmith/Code/ideal-sale-circular`

## Objective
Create the DetailPanelComponent - the right panel showing selected item details with charts and actions.

---

## FILES CHECKLIST

### Files to CREATE:
| # | Path | Purpose | Est. Lines | Complete |
|---|------|---------|------------|----------|
| 1 | `/src/app/analytic-dashboard/components/base-view/detail-panel/detail-panel.component.ts` | Detail panel logic | ~120 | ☐ |
| 2 | `/src/app/analytic-dashboard/components/base-view/detail-panel/detail-panel.component.html` | Detail panel template | ~170 | ☐ |
| 3 | `/src/app/analytic-dashboard/components/base-view/detail-panel/detail-panel.component.scss` | Detail panel styles | ~260 | ☐ |

### Files to MODIFY:
| # | Path | Changes | Complete |
|---|------|---------|----------|
| 1 | `/src/app/analytic-dashboard/components/index.ts` | Add DetailPanelComponent export | ☐ |

### Required Imports for detail-panel.component.ts:
```typescript
// Angular
import { Component, OnInit, OnDestroy } from '@angular/core';

// RxJS
import { Subject, takeUntil, switchMap, filter } from 'rxjs';

// App Services (3 levels deep)
import { AnalyticsDataService, AnalyticsFilterService, AnalyticsStateService } from '../../../services';

// App DTOs (3 levels deep)
import { PromotionDto, PromotionDetailDto, CategoryDto, CircularDto } from '../../../dto';

// App Enums (3 levels deep)
import { BaseViewTabEnum } from '../../../enums';
```

---

## Tasks

### 1. Create Detail Panel Component Folder
```bash
mkdir -p /src/app/analytic-dashboard/components/base-view/detail-panel
```

### 2. Create `detail-panel.component.ts`

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil, switchMap, filter } from 'rxjs';
import { AnalyticsDataService, AnalyticsFilterService, AnalyticsStateService } from '../../../services';
import { PromotionDto, PromotionDetailDto, CategoryDto, CircularDto } from '../../../dto';
import { BaseViewTabEnum } from '../../../enums';

/**
 * Right panel showing details of selected item
 * Content changes based on current base view tab
 *
 * Formula Reference: CIV×1 + CC×10 + ATL×50
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
          const filterContext = this.filterService.getFilterContext();
          return this.dataService.getPromotionDetail(promotion!.id, filterContext);
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

✓ This file is COMPLETE: YES
✓ All imports included: YES
✓ Compiles standalone: YES

---

### 3. Create `detail-panel.component.html`

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

✓ This file is COMPLETE: YES
✓ All imports included: N/A (HTML)
✓ Compiles standalone: YES

---

### 4. Create `detail-panel.component.scss`

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

// Metrics Grid - Uses standard metric colors from Prompt 00
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-sm;
}

.metric-card {
  padding: $spacing-md;
  border-radius: $radius-md;
  text-align: center;

  // Views - Blue (#4272D8)
  &.views {
    background: rgba($metric-views-color, 0.08);
    .metric-value { color: $metric-views-color; }
  }

  // Clicks - Green (#B8D64D)
  &.clicks {
    background: rgba($metric-clicks-color, 0.08);
    .metric-value { color: darken($metric-clicks-color, 15%); }
  }

  // Adds - Purple (#937DF8)
  &.adds {
    background: rgba($metric-adds-color, 0.08);
    .metric-value { color: $metric-adds-color; }
  }

  // Score - Teal (#06989D)
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

✓ This file is COMPLETE: YES
✓ All imports included: YES (design-tokens)
✓ Compiles standalone: YES

---

### 5. Update Components Index

Update `/src/app/analytic-dashboard/components/index.ts` - **ADD** the following:

```typescript
// Add to imports section
import { DetailPanelComponent } from './base-view/detail-panel/detail-panel.component';

// Add to components array
export const components = [
  // ... existing components
  DetailPanelComponent
];

// Add to exports section
export * from './base-view/detail-panel/detail-panel.component';
```

---

## SMOKE TEST

### Quick Compile Check
```bash
cd /Users/billklingensmith/Code/ideal-sale-circular
yarn build 2>&1 | grep -E "(error|ERROR)" | head -20
```

### Visual Verification
Not applicable yet - DetailPanelComponent needs container integration (Prompt 09B) to be visible.

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
- [ ] UI Labels: "Views (CIV)", "Clicks (CC)", "Adds (ATL)", "Score"
- [ ] Colors: $metric-views-color, $metric-clicks-color, $metric-adds-color, $metric-total-color

### Angular Patterns
- [ ] OnDestroy with takeUntil pattern
- [ ] @Input/@Output properly typed (N/A - uses services)
- [ ] Services via constructor injection
- [ ] Animations imported and registered (N/A - no animations)

### Would this compile on first try? [YES]

---

## Notes for Prompt 09B
- DetailPanelComponent is ready but needs container integration
- Container will wire up three-column layout with:
  - Left: CategorySidebar
  - Center: PromotionsPanel (or Categories/Circulars)
  - Right: DetailPanel
- Detail panel slides in when item is selected

---

## Dependencies for This Prompt

**Services Required (from 03A/03B):**
- AnalyticsDataService.getPromotionDetail()
- AnalyticsFilterService.getFilterContext()
- AnalyticsStateService.detailPanelOpen$, selectedPromotion$, etc.

**Components Required (from 04):**
- dh-performance-chart
- dh-trend-chart

**DTOs Required (from 02):**
- PromotionDto, PromotionDetailDto, CategoryDto, CircularDto

**Enums Required (from 02):**
- BaseViewTabEnum
