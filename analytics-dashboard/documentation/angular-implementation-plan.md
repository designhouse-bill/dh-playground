# Analytics Dashboard - Angular Implementation Plan

## Executive Summary

This document outlines a phased approach to transform the Analytics Dashboard HTML/JavaScript prototype into a production-ready Angular feature within the `ideal-sale-circular` application. The implementation leverages existing architectural patterns, the PrimeNG component library, and introduces `ngx-echarts` for advanced data visualization.

**Key Objectives:**
- Transform 5 prototype views into Angular components (MVP: Base Promotions)
- Build reusable components for analytics presentation across the application
- Integrate seamlessly with existing admin framework and services
- Enable parallel development with API/database team through clear interfaces

**Target Location:** `/src/app/analytic-dashboard/`

**New Dependencies Required:**
- `ngx-echarts` - Angular wrapper for Apache ECharts (no conflicts identified)
- `echarts` - Core charting library

---

## Architectural Overview

### Component Hierarchy

```
analytic-dashboard/
├── components/
│   ├── analytic-dashboard/              # Main container (exists - enhance)
│   ├── dashboard-context-bar/           # Date range + entity selector bar
│   ├── dashboard-view-switcher/         # View mode tabs (BASE|GRID|COMPARE)
│   │
│   ├── base-view/                       # Three-column layout container
│   │   ├── category-sidebar/            # Left panel - category list
│   │   ├── promotions-panel/            # Center - promotions table/grid
│   │   ├── categories-panel/            # Center - categories grid
│   │   ├── circulars-panel/             # Center - circulars list
│   │   └── detail-panel/                # Right panel - item details
│   │
│   ├── grid-inquiry-view/               # Full-width data grid view
│   │
│   ├── compare-view/                    # Side-by-side comparison
│   │   ├── compare-context/             # A|B context selectors
│   │   └── compare-panel/               # Individual comparison column
│   │
│   └── shared/                          # Reusable analytics components
│       ├── performance-chart/           # ECharts stacked bar (REUSABLE)
│       ├── metric-display/              # Views/Clicks/Adds display
│       ├── filter-chips/                # Active filter visualization
│       ├── filter-modal/                # Filter selection dialog
│       ├── date-range-picker/           # Week/custom date selection
│       ├── entity-tree-selector/        # Brand→Store hierarchy picker
│       ├── pagination-controls/         # Row count selector + pagination
│       └── column-visibility-toggle/    # Grid column manager
│   └── index.ts                         # Barrel exports
│
├── services/
│   ├── analytics-data.service.ts        # API integration (interface-ready)
│   ├── analytics-state.service.ts       # View state management
│   ├── analytics-filter.service.ts      # Filter state & logic
│   └── index.ts
│
├── dto/
│   ├── promotion.dto.ts                 # Promotion data model
│   ├── category.dto.ts                  # Category data model
│   ├── circular.dto.ts                  # Circular/store data model
│   ├── analytics-metrics.dto.ts         # CIV, CC, ATL metrics
│   ├── filter-context.dto.ts            # Filter state model
│   └── index.ts
│
├── enums/
│   ├── view-mode.enum.ts                # BASE, GRID, COMPARE
│   ├── metric-type.enum.ts              # VIEWS, CLICKS, ADDS
│   ├── deal-type.enum.ts                # BOGO, $ Off, etc.
│   └── index.ts
│
├── analytic-dashboard.module.ts         # Feature module (exists - enhance)
└── analytic-dashboard-routing.module.ts # Routing (exists - enhance)
```

---

## Phased Implementation Plan

### Phase 1: Foundation & Infrastructure
**Goal:** Establish core architecture, services, and data models

#### 1.1 Install Dependencies
- Add `ngx-echarts` and `echarts` to package.json
- Configure NgxEchartsModule in AnalyticDashboardModule
- Verify build succeeds with no conflicts

#### 1.2 Create Data Models (DTOs & Enums)
- `PromotionDto` - id, name, categoryName, dealType, unit, originalPrice, salePrice, cardSize, metrics
- `CategoryDto` - id, name, metrics, promotionCount
- `CircularDto` - id, storeName, storeNumber, address, size, metrics
- `AnalyticsMetricsDto` - civ (views), cc (clicks), atl (adds), compositeScore, percentile
- `FilterContextDto` - dateRange, entityId, categories, dealTypes, cardSizes
- `ViewModeEnum` - BASE, GRID, COMPARE
- `MetricTypeEnum` - VIEWS, CLICKS, ADDS
- `DealTypeEnum` - BOGO, BOGO_50, DOLLAR_OFF, etc.

#### 1.3 Create Core Services
- **AnalyticsDataService**
  - `getPromotions(filter: FilterContextDto): Observable<PromotionDto[]>`
  - `getCategories(filter: FilterContextDto): Observable<CategoryDto[]>`
  - `getCirculars(filter: FilterContextDto): Observable<CircularDto[]>`
  - `getPromotionDetail(id: string): Observable<PromotionDto>`
  - Clear interface for API team integration
  - Stub implementations returning empty observables

- **AnalyticsStateService**
  - Manages current view mode, selected items, panel states
  - Leverages existing `CurrentNodeService` for entity context
  - Uses BehaviorSubjects for reactive state

- **AnalyticsFilterService**
  - Manages filter state (categories, deal types, card sizes)
  - URL parameter synchronization (follow existing pattern)
  - Filter chip generation

---

### Phase 2: Shared/Reusable Components
**Goal:** Build presentation components that can be reused across views and other features

#### 2.1 Performance Chart Component (HIGH REUSE VALUE)
- ECharts stacked horizontal bar chart
- Inputs: `data`, `metrics` (views/clicks/adds), `maxValue`
- Outputs: `metricSelected`
- Responsive sizing with ResizeObserver
- Color-coded segments per existing design tokens:
  - Views: #4272D8 (Blue)
  - Clicks: #B8D64D (Green)
  - Adds: #937DF8 (Purple)

#### 2.2 Metric Display Component
- Compact metric value display with icons
- Inputs: `metrics: AnalyticsMetricsDto`, `showLabels`, `orientation`
- Reusable in tables, cards, detail panels

#### 2.3 Filter Chips Component
- Displays active filters as removable chips
- Inputs: `filters: FilterContextDto`
- Outputs: `filterRemoved`, `clearAll`
- Uses PrimeNG `p-chip` component

#### 2.4 Filter Modal Component
- Multi-select filter dialog
- Uses PrimeNG `p-dialog`, `p-checkbox`, `p-multiselect`
- Sections: Categories, Deal Types, Card Sizes
- Outputs: `filtersApplied`

#### 2.5 Date Range Picker Component
- Week tabs + custom date range selection
- Integrates with existing `CircularDateService`
- Uses PrimeNG `p-calendar`, `p-tabview`
- Timezone-aware (leverage existing patterns)

#### 2.6 Entity Tree Selector Component
- Hierarchical Brand → Sub-brand → Store picker
- Uses PrimeNG `p-tree` or `p-treeselect`
- Integrates with `CurrentNodeService`
- Shows store count at each level

#### 2.7 Pagination Controls Component
- Row count selector (25/50/100/250/All)
- Current page indicator
- Uses PrimeNG `p-dropdown`, `p-paginator`

---

### Phase 3: MVP - Base Promotions View
**Goal:** Complete the primary analytics view

#### 3.1 Dashboard Context Bar Component
- Horizontal bar below SubheaderComponent
- Contains: Date range card, Entity card, Filter chips
- Responsive layout using PrimeFlex grid

#### 3.2 Dashboard View Switcher Component
- Tab-style navigation: BASE | GRID | COMPARE
- Uses PrimeNG `p-selectbutton` or custom tabs
- Emits view mode changes

#### 3.3 Category Sidebar Component
- Left panel with category list
- Shows category name + count + performance indicator
- Click to filter promotions
- Uses PrimeNG `p-listbox` with custom template

#### 3.4 Promotions Panel Component
- Center content area with two modes:
  - Table view (default): Uses PrimeNG `p-table`
  - Card grid view: CSS grid with promotion cards
- Toggle between views
- Columns: Promotion, Category, Deal Type, Metrics, Performance
- Sorting, row selection
- Click row to open detail panel

#### 3.5 Detail Panel Component (RIGHT SIDEBAR)
- Slide-in panel showing selected item details
- Uses PrimeNG `p-sidebar` or custom implementation
- Contains: Item info, Performance chart, Actions
- Animated open/close

#### 3.6 Analytic Dashboard Container Enhancement
- Update existing `analytic-dashboard.component.ts`
- Orchestrate child components
- Manage layout state (panel widths, collapsed states)
- Three-column responsive layout

---

### Phase 4: Additional Base Views
**Goal:** Extend to Categories and Circulars views

#### 4.1 Categories Panel Component
- Grid of category cards
- Each card shows: Name, promo count, performance chart
- Click for category detail in right panel
- Reuses PerformanceChartComponent

#### 4.2 Circulars Panel Component
- Store/circular listing
- Shows: Store name, address, size badge, metrics
- Grouped by brand/sub-brand if applicable
- Click for circular detail

#### 4.3 Base View Container Component
- Manages which center panel is active (Promotions/Categories/Circulars)
- Tab switching within BASE mode
- Preserves selected category filter across tab switches

---

### Phase 5: Grid Inquiry View
**Goal:** Full-width advanced data grid

#### 5.1 Grid Inquiry Component
- Full-width `p-table` with all columns
- Column configuration:
  - Promotion, Category, Deal Type, Price, Sale Price
  - CIV, CC, ATL, Composite Score, Percentile
  - Store Count, Card Size
- Per-column filtering (PrimeNG table filters)
- Multi-column sorting
- Column visibility toggle

#### 5.2 Column Visibility Toggle Component
- Dropdown/panel to show/hide columns
- Checkbox list of available columns
- Persist preferences (localStorage)

---

### Phase 6: Compare View
**Goal:** Side-by-side A/B comparison

#### 6.1 Compare Context Component
- Dual context selectors (A and B)
- Independent date range and entity selection
- "Copy A to B" functionality
- Days filter (All/7/3/1)

#### 6.2 Compare Panel Component
- Single comparison column
- Renders based on selected layer (Promotions/Categories/Circulars)
- Scrollable content area
- Matched height with sibling panel

#### 6.3 Compare View Container
- Layer selector (Promotions | Categories | Circulars)
- Side-by-side layout
- Synchronized scrolling option

---

### Phase 7: Polish & Integration
**Goal:** Final refinements and production readiness

#### 7.1 Loading States
- Skeleton loaders using PrimeNG `p-skeleton`
- Spinner overlay for heavy operations
- Empty state messaging

#### 7.2 Error Handling
- Error boundaries for chart failures
- Graceful degradation
- Retry mechanisms

#### 7.3 URL State Persistence
- All filter state reflected in URL params
- Deep linking support
- Browser back/forward navigation

#### 7.4 Responsive Design
- Mobile-friendly layouts
- Collapsible panels at breakpoints
- Touch-friendly interactions

#### 7.5 Accessibility
- ARIA labels on interactive elements
- Keyboard navigation
- Screen reader support for charts

---

## Reusable Component Strategy

### Components with High Reuse Potential

| Component | Reuse Contexts |
|-----------|---------------|
| PerformanceChartComponent | Any feature showing Views/Clicks/Adds metrics |
| MetricDisplayComponent | Deal cards, content items, campaign stats |
| FilterChipsComponent | Any filtered list view |
| EntityTreeSelectorComponent | Store selection, campaign targeting |
| PaginationControlsComponent | Any paginated table |
| DateRangePickerComponent | Reports, historical data views |

### Integration with Existing Components

| New Component | Existing Component to Leverage |
|--------------|-------------------------------|
| Date selection | `app-datetime-icon-picker` (already in use) |
| Dialog patterns | PrimeNG `p-dialog`, Material `MatDialog` |
| Table patterns | PrimeNG `p-table` with existing styling |
| Sidebar patterns | PrimeNG `p-sidebar` |
| Loading states | Existing `SpinnerOverlayService` |
| Toast notifications | Existing `ToastService` |

---

## Technical Specifications

### New Dependencies

```json
{
  "dependencies": {
    "echarts": "^5.4.0",
    "ngx-echarts": "^17.1.0"
  }
}
```

### Module Configuration

```typescript
// analytic-dashboard.module.ts
import { NgxEchartsModule } from 'ngx-echarts';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    }),
    AnalyticDashboardRoutingModule
  ],
  declarations: [...fromComponents.components],
  exports: [...fromComponents.components]
})
export class AnalyticDashboardModule {}
```

### Design Token Integration

Use existing CSS variables where available. Add new tokens for analytics-specific colors:

```scss
// Variables (add to component or shared SCSS)
$metric-views-color: #4272D8;
$metric-clicks-color: #B8D64D;
$metric-adds-color: #937DF8;
$metric-total-color: #06989D;
```

---

## Service Interface Contracts

### AnalyticsDataService (for API team reference)

```typescript
// Clear variable names and interfaces for API integration

export interface AnalyticsDataService {
  /**
   * Fetch promotions for the analytics dashboard
   * @param filter - Filter context including date range, entity, categories
   * @returns Observable array of promotions with metrics
   */
  getPromotions(filter: FilterContextDto): Observable<PromotionDto[]>;

  /**
   * Fetch category aggregations
   * @param filter - Filter context
   * @returns Observable array of categories with aggregated metrics
   */
  getCategories(filter: FilterContextDto): Observable<CategoryDto[]>;

  /**
   * Fetch circular/store data
   * @param filter - Filter context
   * @returns Observable array of circulars with metrics
   */
  getCirculars(filter: FilterContextDto): Observable<CircularDto[]>;

  /**
   * Fetch detailed promotion data including trend charts
   * @param promotionId - Unique promotion identifier
   * @param filter - Filter context for time range
   * @returns Observable with full promotion details
   */
  getPromotionDetail(
    promotionId: string,
    filter: FilterContextDto
  ): Observable<PromotionDetailDto>;
}
```

---

## File Modification Summary

### Existing Files to Modify
- `/src/app/analytic-dashboard/analytic-dashboard.module.ts` - Add NgxEchartsModule, new components
- `/src/app/analytic-dashboard/components/analytic-dashboard/analytic-dashboard.component.ts` - Enhance container
- `/src/app/analytic-dashboard/components/analytic-dashboard/analytic-dashboard.component.html` - New layout
- `/src/app/analytic-dashboard/components/analytic-dashboard/analytic-dashboard.component.scss` - Layout styles
- `/src/app/analytic-dashboard/components/index.ts` - Export new components
- `package.json` - Add echarts, ngx-echarts

### New Files to Create
- All components listed in Component Hierarchy
- All services listed in services/
- All DTOs and enums listed in dto/ and enums/

---

## Success Criteria

### Phase 1 Complete When:
- [ ] ngx-echarts installed and configured
- [ ] All DTOs and enums defined
- [ ] Services created with stub implementations
- [ ] Build succeeds with no errors

### Phase 2 Complete When:
- [ ] All shared components created and functional
- [ ] Performance chart renders with test data
- [ ] Components are documented and exportable

### Phase 3 (MVP) Complete When:
- [ ] Base Promotions view fully functional
- [ ] Category filtering works
- [ ] Detail panel displays selected promotion
- [ ] Filters persist in URL

### Full Feature Complete When:
- [ ] All 5 views implemented
- [ ] Compare view with A/B selection works
- [ ] Grid inquiry with column management works
- [ ] All loading/error states handled
- [ ] Responsive on all breakpoints

---

## Prompt Series Outline

This plan is designed to be executed as a series of focused prompts:

1. **Prompt 1:** Phase 1.1-1.2 - Dependencies and Data Models
2. **Prompt 2:** Phase 1.3 - Core Services
3. **Prompt 3:** Phase 2.1-2.2 - Performance Chart and Metric Display
4. **Prompt 4:** Phase 2.3-2.5 - Filter Components
5. **Prompt 5:** Phase 2.6-2.7 - Entity Selector and Pagination
6. **Prompt 6:** Phase 3.1-3.2 - Context Bar and View Switcher
7. **Prompt 7:** Phase 3.3-3.4 - Category Sidebar and Promotions Panel
8. **Prompt 8:** Phase 3.5-3.6 - Detail Panel and Container Integration
9. **Prompt 9:** Phase 4 - Categories and Circulars Panels
10. **Prompt 10:** Phase 5 - Grid Inquiry View
11. **Prompt 11:** Phase 6 - Compare View
12. **Prompt 12:** Phase 7 - Polish and Production Readiness

---

*Document Version: 1.0*
*Created: December 2025*
*Target Repository: ideal-sale-circular*
*Source Prototype: mydarndest-playground/analytics-dashboard*
