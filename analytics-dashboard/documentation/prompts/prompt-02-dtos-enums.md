# Prompt 02: DTOs + Enums

## Prerequisites
- **MUST READ FIRST:** [Prompt 00 - Constants & Standards](./prompt-00-constants-standards.md)
- Completed: Prompt 01 (Dependencies + Mock Data)
- Checkpoint A passed

## Context
You are implementing the Analytics Dashboard feature in the `ideal-sale-circular` Angular repository. This is prompt 2 of the 18-part restructured series. Dependencies and mock data have been set up in prompt 01.

## Working Directory
`/Users/billklingensmith/Code/ideal-sale-circular`

## Objective
Create all Data Transfer Objects (DTOs) and Enums for the Analytics Dashboard with clear documentation comments for API team integration.

---

## FILES CHECKLIST

### Files to CREATE:
| # | Path | Purpose | Est. Lines | Complete |
|---|------|---------|------------|----------|
| 1 | `/src/app/analytic-dashboard/enums/view-mode.enum.ts` | View mode types | ~15 | ☐ |
| 2 | `/src/app/analytic-dashboard/enums/base-view-tab.enum.ts` | Base view tabs | ~10 | ☐ |
| 3 | `/src/app/analytic-dashboard/enums/metric-type.enum.ts` | Metric types | ~15 | ☐ |
| 4 | `/src/app/analytic-dashboard/enums/deal-type.enum.ts` | Deal types | ~20 | ☐ |
| 5 | `/src/app/analytic-dashboard/enums/card-size.enum.ts` | Card sizes | ~10 | ☐ |
| 6 | `/src/app/analytic-dashboard/enums/index.ts` | Barrel export | ~10 | ☐ |
| 7 | `/src/app/analytic-dashboard/dto/analytics-metrics.dto.ts` | Core metrics | ~45 | ☐ |
| 8 | `/src/app/analytic-dashboard/dto/promotion.dto.ts` | Promotion DTOs | ~80 | ☐ |
| 9 | `/src/app/analytic-dashboard/dto/category.dto.ts` | Category DTO | ~30 | ☐ |
| 10 | `/src/app/analytic-dashboard/dto/circular.dto.ts` | Circular DTO | ~40 | ☐ |
| 11 | `/src/app/analytic-dashboard/dto/filter-context.dto.ts` | Filter context | ~90 | ☐ |
| 12 | `/src/app/analytic-dashboard/dto/compare-context.dto.ts` | Compare context | ~20 | ☐ |
| 13 | `/src/app/analytic-dashboard/dto/grid-column.dto.ts` | Grid columns | ~50 | ☐ |
| 14 | `/src/app/analytic-dashboard/dto/index.ts` | Barrel export | ~10 | ☐ |

---

## Tasks

### 1. Create Enums Folder and Files

Create folder: `/src/app/analytic-dashboard/enums/`

#### 1.1 Create `view-mode.enum.ts`
```typescript
/**
 * Analytics Dashboard view modes
 */
export enum ViewModeEnum {
  /** Three-column layout with categories, content, and detail panels */
  BASE = 'BASE',
  /** Full-width data grid with all columns */
  GRID = 'GRID',
  /** Side-by-side A/B comparison view */
  COMPARE = 'COMPARE'
}
```

#### 1.2 Create `base-view-tab.enum.ts`
```typescript
/**
 * Tabs within the BASE view mode
 */
export enum BaseViewTabEnum {
  PROMOTIONS = 'PROMOTIONS',
  CATEGORIES = 'CATEGORIES',
  CIRCULARS = 'CIRCULARS'
}
```

#### 1.3 Create `metric-type.enum.ts`
```typescript
/**
 * Analytics metric types for filtering and display
 */
export enum MetricTypeEnum {
  /** CIV = Card Impression Views - card displayed in viewport */
  VIEWS = 'VIEWS',
  /** CC = Card Clicks - shopper expanded the card */
  CLICKS = 'CLICKS',
  /** ATL = Add To List - added to shopping list */
  ADDS = 'ADDS',
  /** All metrics combined */
  ALL = 'ALL'
}
```

#### 1.4 Create `deal-type.enum.ts`
```typescript
/**
 * Promotion deal types
 * Used for filtering promotions by offer type
 */
export enum DealTypeEnum {
  BOGO = 'BOGO',
  BOGO_50 = 'BOGO 50%',
  DOLLAR_OFF_1 = '$1 Off',
  DOLLAR_OFF_2 = '$2 Off',
  DOLLAR_OFF_3 = '$3 Off',
  DOLLAR_OFF = '$ Off',
  TWO_FOR_5 = '2 for $5',
  TWO_FOR_6 = '2 for $6',
  TWO_FOR_7 = '2 for $7',
  TWO_FOR_8 = '2 for $8',
  THREE_FOR_10 = '3 for $10',
  THREE_FOR_12 = '3 for $12',
  FOUR_FOR_5 = '4 for $5',
  FIVE_FOR_5 = '5 for $5',
  MIX_MATCH = 'Mix & Match'
}
```

#### 1.5 Create `card-size.enum.ts`
```typescript
/**
 * Promotion card sizes in the circular
 */
export enum CardSizeEnum {
  SMALL = '1x1',
  MEDIUM = '2x1',
  LARGE = '2x2'
}
```

#### 1.6 Create barrel export `index.ts`
```typescript
export * from './view-mode.enum';
export * from './base-view-tab.enum';
export * from './metric-type.enum';
export * from './deal-type.enum';
export * from './card-size.enum';
```

---

### 2. Create DTOs Folder and Files

Create folder: `/src/app/analytic-dashboard/dto/`

#### 2.1 Create `analytics-metrics.dto.ts`
```typescript
/**
 * Core analytics metrics for promotions, categories, and circulars
 *
 * API Integration Notes:
 * - All numeric values should be non-negative integers
 * - compositeScore formula: (civ * 1) + (cc * 10) + (atl * 50)
 * - percentile is pre-calculated server-side based on context
 */
export interface AnalyticsMetricsDto {
  /**
   * CIV = Card Impression Views
   * Number of times the card was displayed in the user's viewport
   */
  civ: number;

  /**
   * CC = Card Clicks
   * Number of times the shopper expanded/clicked the card
   */
  cc: number;

  /**
   * ATL = Add To List
   * Number of times the item was added to shopping list
   */
  atl: number;

  /**
   * Composite engagement score
   * Formula: (civ * 1) + (cc * 10) + (atl * 50)
   * Higher weight given to higher-intent actions
   */
  compositeScore: number;

  /**
   * Percentile ranking 0-100
   * Relative performance vs all items in the current filter context
   * 100 = top performer, 0 = lowest performer
   */
  percentile: number;
}
```

#### 2.2 Create `promotion.dto.ts`
```typescript
import { AnalyticsMetricsDto } from './analytics-metrics.dto';
import { CardSizeEnum, DealTypeEnum } from '../enums';

/**
 * Promotion data with analytics metrics
 *
 * API Integration Notes:
 * - id should be unique promotion identifier
 * - categoryId links to CategoryDto.id
 * - Prices are in USD (no currency symbol)
 */
export interface PromotionDto extends AnalyticsMetricsDto {
  /** Unique promotion identifier */
  id: string;

  /** Display name of the promotion/product */
  name: string;

  /** Category identifier this promotion belongs to */
  categoryId: string;

  /** Category display name (denormalized for convenience) */
  categoryName: string;

  /** Type of deal/offer */
  dealType: DealTypeEnum | string;

  /** Unit of measure (e.g., 'lb', 'oz', 'each') */
  unit: string;

  /** Original price before discount (USD) */
  originalPrice: number;

  /** Sale/discounted price (USD) */
  salePrice: number;

  /** Card size in the circular layout */
  cardSize: CardSizeEnum | string;

  /** Number of stores where this promotion is active */
  storeCount: number;

  /** Optional: Image URL for the promotion */
  imageUrl?: string;

  /** Optional: Start date of the promotion */
  startDate?: string;

  /** Optional: End date of the promotion */
  endDate?: string;
}

/**
 * Extended promotion details for the detail panel
 * Includes weekly trend data
 */
export interface PromotionDetailDto extends PromotionDto {
  /** Weekly performance trend data */
  weeklyTrends: WeeklyTrendDto[];
}

/**
 * Weekly trend data point for charts
 */
export interface WeeklyTrendDto {
  /** Week identifier (e.g., 'week-47') */
  weekId: string;

  /** Week display label */
  weekLabel: string;

  /** Metrics for this week */
  civ: number;
  cc: number;
  atl: number;
}
```

#### 2.3 Create `category.dto.ts`
```typescript
import { AnalyticsMetricsDto } from './analytics-metrics.dto';

/**
 * Category data with aggregated analytics metrics
 *
 * API Integration Notes:
 * - Metrics are aggregated across all promotions in the category
 * - promotionCount helps indicate category size
 */
export interface CategoryDto extends AnalyticsMetricsDto {
  /** Unique category identifier */
  id: string;

  /** Category display name */
  name: string;

  /** Number of promotions in this category */
  promotionCount: number;

  /** Optional: Category icon or image URL */
  iconUrl?: string;

  /** Optional: Sort order for display */
  sortOrder?: number;
}
```

#### 2.4 Create `circular.dto.ts`
```typescript
import { AnalyticsMetricsDto } from './analytics-metrics.dto';

/**
 * Circular/Store data with analytics metrics
 *
 * API Integration Notes:
 * - Maps to store-level circular performance
 * - entityId links to the node hierarchy (store hash)
 */
export interface CircularDto extends AnalyticsMetricsDto {
  /** Unique circular/store identifier */
  id: string;

  /** Store display name */
  storeName: string;

  /** Store number (for reference) */
  storeNumber: number;

  /** Store address */
  address: string;

  /** Store size classification */
  size: 'large' | 'medium' | 'small';

  /** Link to node hierarchy (store hash) */
  entityId: string;

  /** Brand hash this store belongs to */
  brandHash: string;

  /** Sub-brand hash if applicable */
  subBrandHash?: string;

  /** Number of active promotions in this circular */
  promotionCount: number;
}
```

#### 2.5 Create `filter-context.dto.ts`
```typescript
import { CardSizeEnum, DealTypeEnum, MetricTypeEnum } from '../enums';

/**
 * Filter context for analytics queries
 *
 * API Integration Notes:
 * - All filter arrays use OR logic within the same type
 * - Empty array means "all" (no filter)
 * - dateRange uses ISO 8601 format
 */
export interface FilterContextDto {
  /**
   * Date range for the query
   * Format: { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' }
   */
  dateRange: DateRangeDto;

  /**
   * Entity/Node hash to filter by
   * Can be brand, sub-brand, or store level
   * Empty string means all entities
   */
  entityId: string;

  /**
   * Category IDs to include
   * Empty array = all categories
   */
  categoryIds: string[];

  /**
   * Deal types to include
   * Empty array = all deal types
   */
  dealTypes: (DealTypeEnum | string)[];

  /**
   * Card sizes to include
   * Empty array = all sizes
   */
  cardSizes: (CardSizeEnum | string)[];

  /**
   * Metric type for sorting/display emphasis
   */
  metricType: MetricTypeEnum;

  /**
   * Search text for name filtering
   */
  searchText?: string;

  /**
   * Pagination: items per page
   */
  pageSize?: number;

  /**
   * Pagination: page number (0-indexed)
   */
  pageIndex?: number;

  /**
   * Sort field
   */
  sortField?: string;

  /**
   * Sort direction
   */
  sortDirection?: 'asc' | 'desc';
}

/**
 * Date range for filtering
 */
export interface DateRangeDto {
  /** Start date (inclusive) - ISO 8601 format */
  start: string;

  /** End date (inclusive) - ISO 8601 format */
  end: string;

  /** Optional: Week identifier if selecting by week */
  weekId?: string;
}

/**
 * Week selection option for date picker
 */
export interface WeekOptionDto {
  /** Week identifier (e.g., 'week-47') */
  id: string;

  /** Week number */
  num: number;

  /** Display label (e.g., 'Week 47') */
  label: string;

  /** Date range text (e.g., 'Nov 18-24, 2025') */
  dateRange: string;

  /** Start date ISO format */
  startDate: string;

  /** Number of days in the period */
  daysRun: number;
}
```

#### 2.6 Create `compare-context.dto.ts`
```typescript
import { FilterContextDto } from './filter-context.dto';

/**
 * Context for A/B comparison view
 */
export interface CompareContextDto {
  /** Context A filter settings */
  contextA: FilterContextDto;

  /** Context B filter settings */
  contextB: FilterContextDto;

  /** Days filter for comparison (all, 7, 3, 1) */
  daysFilter: number | 'all';
}
```

#### 2.7 Create `grid-column.dto.ts`
```typescript
/**
 * Column configuration for the grid inquiry view
 */
export interface GridColumnDto {
  /** Unique column key (maps to data field) */
  key: string;

  /** Display label in header */
  label: string;

  /** Column data type for formatting */
  type: 'text' | 'number' | 'currency' | 'percent' | 'performance' | 'promotion' | 'category' | 'deal';

  /** Whether column is sortable */
  sortable: boolean;

  /** Whether column is sticky (frozen) */
  sticky: boolean;

  /** Whether column is visible */
  visible: boolean;

  /** Column width (optional) */
  width?: string;

  /** Filter type for column */
  filterType?: 'text' | 'numeric' | 'dropdown' | 'multiselect';
}

/**
 * Default grid columns configuration
 */
export const DEFAULT_GRID_COLUMNS: GridColumnDto[] = [
  { key: 'name', label: 'Promotion', type: 'promotion', sortable: true, sticky: true, visible: true },
  { key: 'categoryName', label: 'Category', type: 'category', sortable: true, sticky: false, visible: true },
  { key: 'dealType', label: 'Deal Type', type: 'deal', sortable: true, sticky: false, visible: true },
  { key: 'originalPrice', label: 'Orig. Price', type: 'currency', sortable: true, sticky: false, visible: true },
  { key: 'salePrice', label: 'Sale Price', type: 'currency', sortable: true, sticky: false, visible: true },
  { key: 'civ', label: 'CIV', type: 'number', sortable: true, sticky: false, visible: true },
  { key: 'cc', label: 'CC', type: 'number', sortable: true, sticky: false, visible: true },
  { key: 'atl', label: 'ATL', type: 'number', sortable: true, sticky: false, visible: true },
  { key: 'percentile', label: 'Percentile', type: 'percent', sortable: true, sticky: false, visible: true },
  { key: 'compositeScore', label: 'Performance', type: 'performance', sortable: true, sticky: false, visible: true },
  { key: 'cardSize', label: 'Card Size', type: 'text', sortable: true, sticky: false, visible: false },
  { key: 'storeCount', label: 'Stores', type: 'number', sortable: true, sticky: false, visible: false },
];
```

#### 2.8 Create barrel export `index.ts`
```typescript
export * from './analytics-metrics.dto';
export * from './promotion.dto';
export * from './category.dto';
export * from './circular.dto';
export * from './filter-context.dto';
export * from './compare-context.dto';
export * from './grid-column.dto';
```

---

## Files to Create
- `/src/app/analytic-dashboard/enums/view-mode.enum.ts`
- `/src/app/analytic-dashboard/enums/base-view-tab.enum.ts`
- `/src/app/analytic-dashboard/enums/metric-type.enum.ts`
- `/src/app/analytic-dashboard/enums/deal-type.enum.ts`
- `/src/app/analytic-dashboard/enums/card-size.enum.ts`
- `/src/app/analytic-dashboard/enums/index.ts`
- `/src/app/analytic-dashboard/dto/analytics-metrics.dto.ts`
- `/src/app/analytic-dashboard/dto/promotion.dto.ts`
- `/src/app/analytic-dashboard/dto/category.dto.ts`
- `/src/app/analytic-dashboard/dto/circular.dto.ts`
- `/src/app/analytic-dashboard/dto/filter-context.dto.ts`
- `/src/app/analytic-dashboard/dto/compare-context.dto.ts`
- `/src/app/analytic-dashboard/dto/grid-column.dto.ts`
- `/src/app/analytic-dashboard/dto/index.ts`

---

## SMOKE TEST

### Quick Compile Check
```bash
cd /Users/billklingensmith/Code/ideal-sale-circular
yarn build 2>&1 | grep -E "(error|ERROR)" | head -20
```
Expected: No errors related to analytics-dashboard enums or DTOs

### Verification Steps

1. Run `yarn build` - Should compile without type errors
2. Verify imports work:
   ```typescript
   import { ViewModeEnum, MetricTypeEnum } from './enums';
   import { PromotionDto, CategoryDto, FilterContextDto } from './dto';
   ```
3. Verify enum values are accessible:
   ```typescript
   const mode = ViewModeEnum.BASE;
   const metric = MetricTypeEnum.VIEWS;
   ```

---

## SENIOR DEV REVIEW CHECKLIST

Before finalizing, verify:

### Consistency with Prompt 00
- [ ] Variable names: `civ`, `cc`, `atl`, `compositeScore` (never alternatives)
- [ ] Formula documented: `compositeScore = civ + (cc × 10) + (atl × 50)`
- [ ] All DTOs have JSDoc comments with API integration notes
- [ ] Metric labels match: "CIV", "CC", "ATL"

### Code Quality
- [ ] All enums exported via barrel file
- [ ] All DTOs exported via barrel file
- [ ] Extends AnalyticsMetricsDto used consistently
- [ ] Optional properties marked with `?`

### API Team Ready
- [ ] All DTOs have comprehensive JSDoc comments
- [ ] Type definitions clear and self-documenting
- [ ] No Angular-specific types in DTOs (keep them portable)

### Would this compile on first try? [YES/NO]

---

## CHECKPOINT B: Types Complete

Before proceeding to Prompt 03A (Data Services), verify:

```bash
cd /Users/billklingensmith/Code/ideal-sale-circular
yarn build
```
Expected: Build completes with 0 errors

### Checklist:
- [ ] All enums created and exportable
- [ ] All DTOs created and exportable
- [ ] Barrel exports work correctly
- [ ] DEFAULT_GRID_COLUMNS defined

### Ready to Continue to Prompt 03A: [YES/NO]

---

## Notes for Next Prompt
- DTOs are ready for service layer consumption
- All interfaces include JSDoc comments for API team reference
- DEFAULT_GRID_COLUMNS provides initial column configuration
- Enums provide type safety for filter options
- Prompt 03A will create the data services that consume these DTOs
