# Entity & Date Selection Architecture
## Analytics Dashboard - Comprehensive System Design

**Document Version:** 1.0
**Last Updated:** 2025-11-29
**Status:** Planning Phase

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current Analytics Dashboard UI Review](#current-analytics-dashboard-ui-review)
3. [Entity Selection Behavior by Type](#entity-selection-behavior-by-type)
4. [Date Selection Behavior](#date-selection-behavior)
5. [Combined Entity + Date Selection](#combined-entity--date-selection)
6. [Data Aggregation Strategy](#data-aggregation-strategy)
7. [Mock Data Structure for Development](#mock-data-structure-for-development)
8. [Performance Considerations](#performance-considerations)
9. [Implementation Recommendations](#implementation-recommendations)

---

## Executive Summary

This document outlines the comprehensive architecture for entity and date selection in the Analytics Dashboard, detailing how data aggregation works across different entity types (Brand, SubBrand, BrandGroup, SubGroup, Store) and time periods.

### Key Principles

1. **Hierarchical Aggregation**: All stores are parts to the whole - metrics roll up through the entity hierarchy
2. **On-the-Fly Processing**: Data aggregation happens dynamically on entity/date selection for real-time performance
3. **Source Data Points**: All metrics are derived from raw promotion-level data points
4. **Performative Design**: System must handle 50+ stores × 5 weeks × 30 products = 7,500+ promotions efficiently

---

## Current Analytics Dashboard UI Review

### Entity Selector Tree Table (v6-production)

The Entity Selector modal uses a tree table pattern for hierarchy navigation:

**Modal Structure:**
- Extra-wide modal (960px) with tabs: Nodes | Groups
- Search input filters across entity names and addresses
- Tree table with accordion expand/collapse

**Tree Table Columns:**
| Column | Width | Content |
|--------|-------|---------|
| Name | 35% | Brand/SubBrand name, or Store address |
| Type | 12% | Badge: BRAND (blue), SUBBRAND (gray), STORE (green) |
| Title | 20% | Store display name (empty for Brand/SubBrand) |
| Subdomain | 18% | Entity subdomain or ID |
| Path | 15% | Store number (empty for Brand/SubBrand) |

**Accordion Behavior:**
- Brand row: expandable, shows all SubBrands when expanded
- SubBrand row: expandable, shows all Stores when expanded
- Store row: leaf node, no expand toggle
- Collapsed children hidden via CSS class `v6-tree-row-hidden`

**Current Mock Data (Grocery Holdings Corp):**
- 1 Brand → 4 SubBrands → 27 Stores total
- SubBrands: Fresh Markets (8), Value Plus (7), Gourmet Select (6), Express Mart (6)

---

### UI Components

Based on analysis of `/analytics-dashboard/v1-base-view/index.html` and related files:

#### 1. **Context Bar** (Header)
- **Date Selector**: Week-based selection (Week 47: Nov 18-24, 2025)
- **Entity Selector**: Shows selected entity name and store count
- **Filter System**: Add additional filters (Category, Deal Type, etc.)
- **View Tabs**: Base View, Data Grid, Compare

#### 2. **KPI Strip** (Summary Metrics)
Displays aggregated metrics for selected entity + date:
- **Card in View** (CIV): Total impressions/views
- **Card Clicked** (CC): Total clicks
- **Added to List** (ATL): Total add-to-list actions
- **Avg Score**: Composite performance score (PRIMARY KPI)

#### 3. **Content List** (Drill-down)
- **Categories View**: Shows performance by marketing category
- **Promotions View**: Shows individual promotion performance
- Expandable/drillable for deeper analysis

#### 4. **Detail Panel** (Right Side)
- Detailed metrics for selected category or promotion
- Performance breakdowns
- Historical comparisons

### Current Data Points Tracked

From `/process/mock-data/007-scaled-data.js` analysis:

```javascript
// Per-Promotion Data Points
{
  // Identity
  card_id: string,
  upc: string,

  // Product Information
  card_name: string,
  card_price: string,
  units: string,
  description: string,

  // Categorization
  marketing_category: string,
  department: string,

  // Placement
  card_size: string,          // "3X2", "2X1", etc.
  width: number,
  height: number,
  position: string,           // "top-center", "mid-left", etc.
  page: number,
  page_position: number,

  // Performance Metrics
  card_in_view: number,       // Views/Impressions
  card_clicked: number,       // Clicks
  added_to_list: number,      // Add-to-list actions
  share_count: number,        // Social shares
  composite_score: number,    // Calculated: views*10 + clicks*15 + atl*25

  // Rankings
  percentile: number,         // 1-100
  quartile: string,           // Q1, Q2, Q3, Q4

  // Deal Information
  deal_type: string,          // "BOGO", "Save X", "Amount", etc.
  quantity: number,
  savings: string,
  reg_price: string,

  // Temporal
  week: number,               // Week number (36-40)
  stage: string,              // "post_publish", "active", "archived"
  media_freshness: string,    // "new", "recent", "archived"

  // Store Association
  store_codes: [string],      // Store IDs
  version: string,

  // Additional Tracking
  print_count: number,
  pdf_downloads: number,
  image_url: string,
  card_style: string,
  media_size: string
}
```

---

## Entity Selection Behavior by Type

### 1. Store Selection

**Scenario**: User selects "Downtown Spruce" (STORE_001)

#### UI Display
```
Context Bar:
  Entity: Downtown Spruce
  Sub-text: 1016 W Spruce St
  Breadcrumb: 1 THEMES - NEW > AFS DANSFOODS
```

#### Data Scope
```javascript
// Filter promotions to single store
const storeData = allPromotions.filter(promo =>
  promo.store_codes.includes('STORE_001')
);
```

#### Aggregated Metrics
- **Total Promotions**: Count of promotions for this store
- **Card in View**: Sum of `card_in_view` for all promotions
- **Card Clicked**: Sum of `card_clicked` for all promotions
- **Added to List**: Sum of `added_to_list` for all promotions
- **Avg Score**: Average of `composite_score` for all promotions (PRIMARY KPI)

#### Category Breakdown
```javascript
// Group by category for this store
const categories = groupByCategory(storeData);
// Each category shows:
// - Category name
// - Number of promotions in category
// - Aggregated CIV, CC, ATL for category
// - Avg score for category (PRIMARY KPI)
```

#### Use Case
- **Store Manager Review**: Individual store performance analysis
- **Location-Specific Optimization**: Understand what works at this specific location
- **Troubleshooting**: Investigate underperforming individual stores

---

### 2. SubBrand Selection ("All Stores")

**Scenario**: User selects "AFS dansfoods" SubBrand

#### UI Display
```
Context Bar:
  Entity: All Stores
  Sub-text: AFS dansfoods (5 stores)
  Breadcrumb: 1 THEMES - NEW > AFS DANSFOODS
```

#### Data Scope
```javascript
// Get all stores under this SubBrand
const subBrandStores = ['STORE_001', 'STORE_002', 'STORE_003', 'STORE_004', 'STORE_005'];

// Filter promotions to these stores
const subBrandData = allPromotions.filter(promo =>
  subBrandStores.some(storeId => promo.store_codes.includes(storeId))
);
```

#### Aggregated Metrics
- **Total Promotions**: Count across all 5 stores
- **Card in View**: Sum across all stores
- **Card Clicked**: Sum across all stores
- **Added to List**: Sum across all stores
- **Avg Score**: Weighted average across all stores (PRIMARY KPI)

#### Category Breakdown
```javascript
// Categories show combined performance
// Example: "Beverages" category
const beveragePromos = subBrandData.filter(p => p.marketing_category === 'beverages_snacks');
// Shows totals from all 5 stores combined
```

#### Comparative Insights
```javascript
// Can show per-store breakdown within SubBrand
const storeComparison = subBrandStores.map(storeId => ({
  storeId,
  metrics: calculateMetrics(subBrandData.filter(p => p.store_codes.includes(storeId)))
}));
```

#### Use Case
- **Regional Manager Review**: SubBrand-wide performance
- **Brand Strategy**: Understand overall SubBrand health
- **Promotional Effectiveness**: See which categories/promotions work across all locations

---

### 3. SubGroup Selection

**Scenario**: User selects "Downtown Cluster" SubGroup

#### UI Display
```
Context Bar:
  Entity: Downtown Cluster
  Sub-text: 2 stores
  Breadcrumb: 1 THEMES - NEW > AFS DANSFOODS
```

#### Data Scope
```javascript
// SubGroup contains specific store references
const subGroupConfig = {
  id: "SUBGROUP_001",
  name: "Downtown Cluster",
  type: "SubGroup",
  storeIds: ["STORE_001", "STORE_002"]  // Only these 2 stores
};

// Filter to only these stores
const subGroupData = allPromotions.filter(promo =>
  subGroupConfig.storeIds.some(storeId => promo.store_codes.includes(storeId))
);
```

#### Aggregated Metrics
- **Total Promotions**: Count across 2 stores in group
- **Card in View**: Sum across 2 stores
- **Card Clicked**: Sum across 2 stores
- **Added to List**: Sum across 2 stores
- **Avg Score**: Weighted average across 2 stores (PRIMARY KPI)

#### Group-Specific Analysis
```javascript
// Compare group performance vs. SubBrand average
const subBrandAvg = calculateMetrics(subBrandData);
const groupPerformance = calculateMetrics(subGroupData);
const variance = calculateVariance(groupPerformance, subBrandAvg);

// Shows:
// - How Downtown Cluster performs vs. all AFS dansfoods stores
// - Identifies if this geographical cluster has unique characteristics
```

#### Use Case
- **Geographical Analysis**: Compare urban vs. suburban performance
- **Test Groups**: Analyze pilot programs in specific store clusters
- **Operational Insights**: Understand regional shopping patterns

---

### 4. BrandGroup Selection

**Scenario**: User selects "Premium Markets" BrandGroup

#### UI Display
```
Context Bar:
  Entity: Premium Markets
  Sub-text: 3 stores
  Breadcrumb: 1 THEMES - NEW > PREMIUM MARKETS
```

#### Data Scope
```javascript
// BrandGroup spans multiple SubBrands
const brandGroupConfig = {
  id: "BRANDGROUP_001",
  name: "Premium Markets",
  type: "BrandGroup",
  storeIds: [
    "STORE_001",  // from AFS dansfoods
    "STORE_006",  // from AFS-freshmarket
    "STORE_010"   // from FreshMart Metro (different Brand!)
  ]
};

// Filter to stores across SubBrands
const brandGroupData = allPromotions.filter(promo =>
  brandGroupConfig.storeIds.some(storeId => promo.store_codes.includes(storeId))
);
```

#### Aggregated Metrics
- **Total Promotions**: Count across 3 stores from different SubBrands
- **Card in View**: Sum across all 3 stores
- **Card Clicked**: Sum across all 3 stores
- **Added to List**: Sum across all 3 stores
- **Avg Score**: Weighted average across 3 stores (PRIMARY KPI)

#### Cross-SubBrand Analysis
```javascript
// Unique capability: Compare performance across different SubBrands
const bySubBrand = {};
brandGroupConfig.storeIds.forEach(storeId => {
  const store = findStore(storeId);
  const subBrand = store.subBrand;

  if (!bySubBrand[subBrand]) {
    bySubBrand[subBrand] = [];
  }

  bySubBrand[subBrand].push(...brandGroupData.filter(p =>
    p.store_codes.includes(storeId)
  ));
});

// Shows which SubBrand's promotions perform better
// Identifies cross-brand promotion opportunities
```

#### Use Case
- **Strategic Analysis**: Compare premium locations across different SubBrands
- **Cross-Brand Insights**: Identify winning strategies that work across brands
- **Portfolio Management**: Understand performance of curated store groups

---

### 5. Brand Selection

**Scenario**: User selects "1 THEMES - New" Brand

#### UI Display
```
Context Bar:
  Entity: All Stores
  Sub-text: 1 THEMES - New (9 stores)
  Breadcrumb: 1 THEMES - NEW
```

#### Data Scope
```javascript
// Brand encompasses ALL SubBrands and their stores
const brandConfig = {
  id: "BRAND_001",
  name: "1 THEMES - New",
  type: "Brand",
  subBrands: [
    "SUBBRAND_001",  // AFS dansfoods (5 stores)
    "SUBBRAND_002",  // AFS dicksmarket (0 stores)
    "SUBBRAND_003",  // AFS linsgrocery (0 stores)
    "SUBBRAND_004",  // AFS maceys (0 stores)
    "SUBBRAND_005"   // AFS-freshmarket (4 stores)
  ]
};

// All stores under all SubBrands
const allStoreIds = [
  'STORE_001', 'STORE_002', 'STORE_003', 'STORE_004', 'STORE_005',  // dansfoods
  'STORE_006', 'STORE_007', 'STORE_008', 'STORE_009'                // freshmarket
];

const brandData = allPromotions.filter(promo =>
  allStoreIds.some(storeId => promo.store_codes.includes(storeId))
);
```

#### Aggregated Metrics
- **Total Promotions**: Count across all 9 stores
- **Card in View**: Sum across entire Brand
- **Card Clicked**: Sum across entire Brand
- **Added to List**: Sum across entire Brand
- **Avg Score**: Weighted average across all stores (PRIMARY KPI)

#### Brand-Level Insights
```javascript
// Hierarchical breakdown
const brandInsights = {
  overall: calculateMetrics(brandData),

  bySubBrand: {
    'AFS dansfoods': calculateMetrics(/* 5 stores */),
    'AFS-freshmarket': calculateMetrics(/* 4 stores */)
  },

  byCategory: groupByCategory(brandData),

  topPerformers: getTopStores(brandData, 5),
  bottomPerformers: getBottomStores(brandData, 5),

  trends: calculateTrends(brandData)
};
```

#### Use Case
- **Executive Overview**: High-level Brand performance
- **Strategic Planning**: Brand-wide promotional strategy
- **Portfolio Performance**: Overall health of Brand
- **Budget Allocation**: Understand ROI across entire Brand

---

## Date Selection Behavior

### Week-Based Selection

The system uses week-based date ranges as the primary temporal dimension.

#### Available Weeks
```javascript
const weeks = [
  { number: 47, label: "Week 47", dates: "Nov 18-24, 2025", status: "current" },
  { number: 46, label: "Week 46", dates: "Nov 11-17, 2025", status: "recent" },
  { number: 45, label: "Week 45", dates: "Nov 4-10, 2025", status: "recent" },
  // ... historical weeks
];
```

#### Week Selection Impact

**Scenario**: User selects "Week 47"

```javascript
// Filter all data to selected week
const weekData = allPromotions.filter(promo => promo.week === 47);

// Then apply entity filter on top
const entityWeekData = weekData.filter(promo =>
  matchesSelectedEntity(promo, selectedEntity)
);
```

#### Week Metadata
Each week has associated metadata:
- **Stage**: `post_publish`, `active`, `archived`
- **Media Freshness**: `new`, `recent`, `archived`
- **Performance Multiplier**: Accounts for temporal degradation

```javascript
const weekVarianceConfig = {
  47: { performance: 1.00, label: 'Current Week (Baseline)' },
  46: { performance: 0.95, label: 'Last Week' },
  45: { performance: 0.92, label: '2 Weeks Ago' },
  44: { performance: 0.97, label: '3 Weeks Ago (Rebound)' },
  43: { performance: 0.90, label: '4 Weeks Ago' }
};
```

---

## Combined Entity + Date Selection

### The Power of Dual Filtering

Entity and Date selection work together to create precise data scopes.

#### Example 1: Single Store, Single Week

**Selection**: STORE_001 + Week 47

```javascript
const data = allPromotions.filter(promo =>
  promo.store_codes.includes('STORE_001') &&
  promo.week === 47
);

// Expected: ~30 promotions (one week of circular for one store)
// Metrics show: This store's performance for current week
```

**Dashboard Shows**:
- Current week performance for Downtown Spruce
- All 30 active promotions
- Categories specific to this store's circular
- Real-time performance metrics

#### Example 2: SubBrand, Multi-Week Comparison

**Selection**: AFS dansfoods + Week 47 (with Week 46 comparison)

```javascript
const currentWeek = allPromotions.filter(promo =>
  subBrandStores.some(id => promo.store_codes.includes(id)) &&
  promo.week === 47
);

const previousWeek = allPromotions.filter(promo =>
  subBrandStores.some(id => promo.store_codes.includes(id)) &&
  promo.week === 46
);

const comparison = {
  current: calculateMetrics(currentWeek),
  previous: calculateMetrics(previousWeek),
  change: calculatePercentChange(currentWeek, previousWeek)
};
```

**Dashboard Shows**:
- SubBrand performance for Week 47
- 5 stores × 30 promotions = 150 active promotions
- Week-over-week changes with arrows (↑↓)
- Trending categories
- Performance variance across stores

#### Example 3: BrandGroup, Historical Analysis

**Selection**: Premium Markets + Week 43-47 (5 weeks)

```javascript
const historicalWeeks = [43, 44, 45, 46, 47];
const brandGroupStores = ['STORE_001', 'STORE_006', 'STORE_010'];

const timeSeriesData = historicalWeeks.map(week => ({
  week,
  data: allPromotions.filter(promo =>
    brandGroupStores.some(id => promo.store_codes.includes(id)) &&
    promo.week === week
  ),
  metrics: null  // Calculated after filter
}));

// Calculate metrics for each week
timeSeriesData.forEach(weekData => {
  weekData.metrics = calculateMetrics(weekData.data);
});
```

**Dashboard Shows**:
- 5-week trend line chart
- Performance patterns over time
- Seasonal effects
- Promotion lifecycle (new → active → archived)
- Cross-SubBrand consistency

#### Example 4: Brand, Current Week

**Selection**: 1 THEMES - New + Week 47

```javascript
const allBrandStores = [
  'STORE_001', 'STORE_002', 'STORE_003', 'STORE_004', 'STORE_005',
  'STORE_006', 'STORE_007', 'STORE_008', 'STORE_009'
];

const brandWeekData = allPromotions.filter(promo =>
  allBrandStores.some(id => promo.store_codes.includes(id)) &&
  promo.week === 47
);

// Expected: 9 stores × 30 promotions = 270 total promotions
```

**Dashboard Shows**:
- Brand-wide current performance
- All active promotions across all stores
- Category performance aggregated across Brand
- SubBrand comparison
- Top/bottom performing stores
- Overall Brand health score

---

## Context Persistence Across Views

### Design Principle

User context must persist when switching between views. The system should never lose the user's current focus when changing view modes.

### State Synchronization

```javascript
// Synchronized state variables
state.activeCategory      // Used in Promotions view (sidebar filter)
state.selectedCategoryId  // Used in Categories view (grid selection)

// On view change: Categories → Promotions
if (state.selectedCategoryId) {
  state.activeCategory = state.selectedCategoryId;
  // Sidebar highlights category, promotions filter applied
}

// On view change: Promotions → Categories
if (state.activeCategory && state.activeCategory !== 'all') {
  state.selectedCategoryId = state.activeCategory;
  // Grid row selected, detail panel opens
}
```

### Context Persistence Matrix

| Context Element | Categories View | Promotions View | Data Grid | Compare |
|-----------------|-----------------|-----------------|-----------|---------|
| Week Selection | ✓ Persists | ✓ Persists | ✓ Persists | ✓ Inherits to Panel A |
| Entity Selection | ✓ Persists | ✓ Persists | ✓ Persists | ✓ Inherits to Panel A |
| Category Selection | Grid selection | Sidebar filter | Column filter | ✓ Inherits |
| Applied Filters | N/A | ✓ Preserved | ✓ Preserved | ✓ Inherits |
| Detail Panel | Category details | Promotion details | N/A | N/A |

### View Transition Flows

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONTEXT PERSISTENCE FLOW                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Categories View]                    [Promotions View]          │
│  ┌─────────────────┐                 ┌─────────────────┐        │
│  │ Category Grid   │ ──── View By ──▶│ Category Sidebar│        │
│  │ + Detail Panel  │      Toggle     │ + Promo Grid    │        │
│  │                 │                 │ + Detail Panel  │        │
│  └─────────────────┘                 └─────────────────┘        │
│         │                                     │                  │
│         │  selectedCategoryId ═══════ activeCategory            │
│         │  (synced on view change)            │                  │
│         │                                     │                  │
│         ▼                                     ▼                  │
│  [Week/Entity Context - ALWAYS PRESERVED]                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Aggregation Strategy

### Performance Requirements

- **Dataset Size**: 50 stores × 5 weeks × 30 products = 7,500 promotions
- **Response Time**: < 200ms for entity/date change
- **Real-time**: On-the-fly aggregation (no pre-computation)

### Aggregation Architecture

#### 1. Core Aggregation Function

```javascript
/**
 * Aggregate promotion data for given filters
 * @param {Array} promotions - Full promotion dataset
 * @param {Object} filters - Entity and date filters
 * @returns {Object} Aggregated metrics
 */
function aggregateData(promotions, filters) {
  // Step 1: Filter to scope
  const scopedData = filterPromotions(promotions, filters);

  // Step 2: Calculate base metrics
  const metrics = calculateMetrics(scopedData);

  // Step 3: Group by dimensions
  const byCategory = groupByDimension(scopedData, 'marketing_category');
  const byDealType = groupByDimension(scopedData, 'deal_type');
  const byStore = groupByDimension(scopedData, 'store_codes');

  // Step 4: Calculate rankings
  const rankings = calculateRankings(scopedData);

  return {
    summary: metrics,
    categories: byCategory,
    dealTypes: byDealType,
    stores: byStore,
    rankings: rankings,
    totalPromotions: scopedData.length
  };
}
```

#### 2. Filtering Logic

```javascript
/**
 * Filter promotions based on entity and date
 */
function filterPromotions(promotions, filters) {
  return promotions.filter(promo => {
    // Date filter
    const dateMatch = filters.week
      ? promo.week === filters.week
      : true;

    // Entity filter
    const entityMatch = matchEntity(promo, filters.entity);

    // Additional filters (category, deal type, etc.)
    const additionalMatch = matchAdditionalFilters(promo, filters.additional);

    return dateMatch && entityMatch && additionalMatch;
  });
}

/**
 * Match promotion to selected entity
 */
function matchEntity(promo, entity) {
  if (!entity) return true;

  switch (entity.type) {
    case 'Store':
      return promo.store_codes.includes(entity.id);

    case 'SubBrand':
      const subBrandStores = getStoresForSubBrand(entity.id);
      return subBrandStores.some(id => promo.store_codes.includes(id));

    case 'SubGroup':
      return entity.storeIds.some(id => promo.store_codes.includes(id));

    case 'BrandGroup':
      return entity.storeIds.some(id => promo.store_codes.includes(id));

    case 'Brand':
      const brandStores = getAllStoresForBrand(entity.id);
      return brandStores.some(id => promo.store_codes.includes(id));

    default:
      return true;
  }
}
```

#### 3. Metric Calculation

```javascript
/**
 * Calculate core metrics from promotion array
 */
function calculateMetrics(promotions) {
  if (!promotions.length) {
    return getZeroMetrics();
  }

  const totalViews = sum(promotions, 'card_in_view');
  const totalClicks = sum(promotions, 'card_clicked');
  const totalATL = sum(promotions, 'added_to_list');
  const totalShares = sum(promotions, 'share_count');

  return {
    cardInView: totalViews,
    cardClicked: totalClicks,
    addedToList: totalATL,
    shareCount: totalShares,

    // Composite score (PRIMARY KPI)
    avgScore: average(promotions, 'composite_score'),
    totalScore: sum(promotions, 'composite_score'),

    // Calculated rates
    conversionRate: totalClicks > 0 ? (totalATL / totalClicks * 100) : 0,
    shareRate: totalViews > 0 ? (totalShares / totalViews * 100) : 0,

    // Rankings
    topQuartile: promotions.filter(p => p.quartile === 'Q1').length,
    bottomQuartile: promotions.filter(p => p.quartile === 'Q4').length,

    // Count
    totalPromotions: promotions.length,
    uniqueProducts: new Set(promotions.map(p => p.card_name)).size,
    uniqueStores: new Set(promotions.flatMap(p => p.store_codes)).size
  };
}
```

#### 4. Dimensional Grouping

```javascript
/**
 * Group promotions by dimension and calculate metrics for each
 */
function groupByDimension(promotions, dimension) {
  const groups = {};

  promotions.forEach(promo => {
    const key = promo[dimension];

    if (!groups[key]) {
      groups[key] = [];
    }

    groups[key].push(promo);
  });

  // Calculate metrics for each group
  return Object.entries(groups).map(([key, promos]) => ({
    name: key,
    count: promos.length,
    metrics: calculateMetrics(promos),
    percentOfTotal: (promos.length / promotions.length * 100)
  })).sort((a, b) => b.metrics.totalScore - a.metrics.totalScore);
}
```

### Optimization Strategies

#### 1. Indexed Access

```javascript
// Pre-build indices for fast lookups
const indices = {
  byStore: buildIndex(promotions, 'store_codes'),
  byWeek: buildIndex(promotions, 'week'),
  byCategory: buildIndex(promotions, 'marketing_category'),
  byDealType: buildIndex(promotions, 'deal_type')
};

// Fast filtered access
function getPromotionsForStore(storeId) {
  return indices.byStore[storeId] || [];
}
```

#### 2. Memoization

```javascript
// Cache aggregation results
const aggregationCache = new Map();

function getCachedAggregation(promotions, filters) {
  const cacheKey = generateCacheKey(filters);

  if (aggregationCache.has(cacheKey)) {
    return aggregationCache.get(cacheKey);
  }

  const result = aggregateData(promotions, filters);
  aggregationCache.set(cacheKey, result);

  return result;
}
```

#### 3. Progressive Loading

```javascript
// Load essential metrics first, details later
async function loadDashboardData(filters) {
  // Phase 1: Summary metrics (fast)
  const summary = await calculateSummaryMetrics(filters);
  updateUI({ summary });

  // Phase 2: Category breakdown (medium)
  const categories = await calculateCategoryMetrics(filters);
  updateUI({ categories });

  // Phase 3: Detailed rankings (slower)
  const details = await calculateDetailedMetrics(filters);
  updateUI({ details });
}
```

---

## Mock Data Structure for Development

### Complete Promotion Record Schema

```typescript
interface Promotion {
  // ============================================
  // IDENTITY & REFERENCES
  // ============================================
  card_id: string;              // Unique: "W47_001_FEAT_001"
  upc: string;                  // Product UPC: "47001001"

  // ============================================
  // PRODUCT INFORMATION
  // ============================================
  card_name: string;            // Product name: "Premium Ribeye Steak"
  card_price: string;           // Display price: "$15.99"
  reg_price: string;            // Regular price: "$19.99"
  savings: string;              // Savings amount: "$4.00"
  units: string;                // Unit type: "Lb.", "Each", "Oz."
  description: string;          // Full description with modifiers

  // ============================================
  // CATEGORIZATION
  // ============================================
  marketing_category: string;   // Category: "featured_deals", "fresh_market", etc.
  department: string;           // Department: "meat", "produce", "dairy", etc.

  // ============================================
  // PLACEMENT & LAYOUT
  // ============================================
  card_size: string;            // Size code: "3X2", "2X1", "1X1"
  width: number;                // Grid width: 1, 2, or 3
  height: number;               // Grid height: 1, 2, or 3
  position: string;             // Position: "top-center", "mid-left", etc.
  page: number;                 // Page number in circular
  page_position: number;        // Position on page: 1-15

  // ============================================
  // VERSIONING & STORE ASSOCIATION
  // ============================================
  version: string;              // Version identifier
  store_codes: string[];        // Array of store IDs: ["STORE_001"]
  type_hint: string;            // Data source: "SCALED", "MANUAL", etc.

  // ============================================
  // PERFORMANCE METRICS (Core)
  // ============================================
  card_in_view: number;         // Total views/impressions
  card_clicked: number;         // Total clicks
  added_to_list: number;        // Add-to-list actions
  share_count: number;          // Social shares
  composite_score: number;      // Calculated: views*10 + clicks*15 + atl*25

  // ============================================
  // RANKINGS & PERCENTILES
  // ============================================
  percentile: number;           // Performance percentile: 1-100
  quartile: string;             // Performance quartile: "Q1", "Q2", "Q3", "Q4"

  // ============================================
  // DEAL INFORMATION
  // ============================================
  deal_type: string;            // Deal type: "BOGO", "Save X", "Amount", "Num For"
  quantity: number;             // Quantity in deal: 1, 2, etc.

  // ============================================
  // TEMPORAL TRACKING
  // ============================================
  week: number;                 // Week number: 36-40, 43-47, etc.
  stage: string;                // Lifecycle: "post_publish", "active", "archived"
  media_freshness: string;      // Freshness: "new", "recent", "archived"

  // ============================================
  // ADDITIONAL METRICS
  // ============================================
  print_count: number;          // Print actions
  pdf_downloads: number;        // PDF downloads

  // ============================================
  // MEDIA & STYLING
  // ============================================
  image_url: string;            // Image path: "assets/images/products/..."
  card_style: string;           // Style: "premium", "standard"
  media_size: string;           // Media size: "full", "standard", "compact"
}
```

### Entity Hierarchy Schema

```typescript
interface Store {
  id: string;                   // "fm-calabasas"
  address: string;              // "23785 Calabasas Rd" (shown in Name column)
  title: string;                // "Calabasas" (shown in Title column)
  storeNumber: number;          // 11 (shown in Path column)
  subBrand: string;             // "fresh-markets" (parent SubBrand ID)
  type: "Store";

  // Optional extended details (for full implementation)
  city?: string;
  state?: string;
  zip?: string;
  location_type?: string;       // "urban", "suburban", "rural"
  performance_index?: number;   // 0.85 - 1.20
}

interface SubGroup {
  id: string;                   // "SUBGROUP_001"
  name: string;                 // "Downtown Cluster"
  type: "SubGroup";
  subdomain: string;
  logo: string;
  title: string;
  path: string;

  // Store references
  storeIds: string[];           // ["STORE_001", "STORE_002"]
  storeCount: number;           // Calculated or set: 2

  children: [];                 // Empty - uses storeIds references
}

interface SubBrand {
  id: string;                   // "SUBBRAND_001"
  name: string;                 // "AFS dansfoods"
  type: "SubBrand";
  subdomain: string;            // "dansfoods"
  logo: string;                 // Logo identifier
  title: string;
  path: string;

  children: (Store | SubGroup)[]; // Stores and SubGroups
}

interface BrandGroup {
  id: string;                   // "BRANDGROUP_001"
  name: string;                 // "Premium Markets"
  type: "BrandGroup";
  subdomain: string;
  logo: string;                 // "multi" for multiple logos
  title: string;
  path: string;

  // Cross-SubBrand store references
  storeIds: string[];           // ["STORE_001", "STORE_006", "STORE_010"]
  storeCount: number;           // 3

  children: [];                 // Empty - uses storeIds references
}

interface Brand {
  id: string;                   // "BRAND_001"
  name: string;                 // "1 THEMES - New"
  type: "Brand";
  subdomain: string;            // "1-new-themes"
  logo: string;                 // Brand logo identifier
  title: string;
  path: string;

  children: (BrandGroup | SubBrand)[]; // Brand-level groups and SubBrands
}
```

### Sample Data Generation

```javascript
// Generate complete dataset for development
function generateMockData() {
  const stores = 50;
  const weeks = [43, 44, 45, 46, 47];
  const productsPerStore = 30;

  const totalPromotions = stores * weeks.length * productsPerStore;
  // = 50 × 5 × 30 = 7,500 promotions

  return {
    promotions: generatePromotions(stores, weeks, productsPerStore),
    entityHierarchy: generateEntityHierarchy(),
    metadata: {
      generatedAt: new Date().toISOString(),
      totalPromotions,
      totalStores: stores,
      totalWeeks: weeks.length,
      productsPerStore
    }
  };
}
```

---

## Performance Considerations

### Bottlenecks & Solutions

#### 1. Large Dataset Filtering

**Problem**: Filtering 7,500+ promotions on every selection change

**Solution**:
```javascript
// Use indices for O(1) lookup instead of O(n) filtering
const storeIndex = buildStoreIndex(promotions);
const weekIndex = buildWeekIndex(promotions);

// Fast lookup
function getPromotions(storeId, week) {
  const storePromos = storeIndex[storeId] || [];
  return storePromos.filter(p => p.week === week);
}
```

#### 2. Re-rendering Dashboard

**Problem**: Full dashboard re-render on selection change

**Solution**:
```javascript
// Virtual scrolling for long lists
// Progressive rendering
// Debounced updates
// Partial updates (only changed sections)
```

#### 3. Complex Aggregations

**Problem**: Nested grouping calculations

**Solution**:
```javascript
// Web Workers for heavy calculations
// Incremental aggregation
// Cached intermediate results
```

### Performance Targets

- **Initial Load**: < 1 second
- **Entity Change**: < 200ms
- **Date Change**: < 200ms
- **Filter Add/Remove**: < 100ms
- **Category Drill-down**: < 150ms

---

## Essential KPIs - Must-Have Metrics

### Overview

This section identifies essential KPIs beyond the **Composite Score (PRIMARY KPI)** that provide critical business value to end-users. Each metric is evaluated on:
- **Business Value**: What insight it provides
- **Target Audience**: Who uses this metric
- **Actionability**: What decisions it enables

---

### Primary KPI

#### **Composite Score** (Views × 10 + Clicks × 15 + Added to List × 25)

**Already Implemented** - This is the primary performance indicator.

**Value**:
- Unified performance metric across all promotions
- Weighted to prioritize high-intent actions (ATL > CC > CIV)
- Enables ranking and percentile calculations

**Audience**: All stakeholders - merchandising, marketing, executives

---

### Must-Have KPIs

#### 1. **Conversion Rate** (ATL / CC × 100)

**Formula**: `(Total Added to List / Total Clicks) × 100`

**Value**:
- Measures quality of engagement beyond initial interest
- Shows which promotions convert browsers into committed shoppers
- Identifies promotions with high "window shopping" vs high purchase intent

**Audience**:
- **Merchandising Teams**: Optimize product selection and pricing
- **Category Managers**: Understand which deals drive action vs browsing

**Actionability**:
- **High CR (>40%)**: Strong purchase intent - consider featuring more prominently
- **Low CR (<15%)**: High click-to-browse ratio - may need price adjustment or clearer value prop
- **Benchmark**: Compare categories to identify high-intent departments

**Example Insight**:
> "Meat category has 45% conversion vs 18% for beverages - shoppers click meats with intent to buy, but browse beverages casually"

**Dashboard Display**: Show in KPI strip or detail panels

---

#### 2. **Top Quartile Performance** (% in Q1)

**Formula**: `(Count of Q1 Promotions / Total Promotions) × 100`

**Value**:
- Portfolio quality indicator - "what percentage of our promotions are winners?"
- Executive-level metric for overall circular effectiveness
- Trend indicator (improving vs declining quality over time)

**Audience**:
- **Executives**: High-level portfolio health
- **Marketing Directors**: Campaign effectiveness measurement
- **Merchandising Leadership**: Product mix optimization

**Actionability**:
- **>30% in Q1**: Strong circular - majority of promotions performing well
- **<15% in Q1**: Portfolio issue - too many underperformers, need category review
- **Week-over-week tracking**: Identify seasonal patterns or creative fatigue

**Example Insight**:
> "This week 38% of promotions are in Q1 vs 22% last week - new fresh produce strategy is working"

**Dashboard Display**: Executive summary, trend charts

---

#### 3. **Engagement Rate** ((CC + ATL) / CIV × 100)

**Formula**: `(Total Clicks + Total Added to List) / Total Views × 100`

**Value**:
- Measures total interaction vs passive scrolling
- Accounts for users who add directly to list without clicking (mobile behavior)
- Better than CTR for circular context where immediate action is possible

**Audience**:
- **Marketing Teams**: Creative effectiveness, placement optimization
- **UX/Product Teams**: Interface design validation
- **Store Operations**: Understand customer engagement patterns

**Actionability**:
- **High ER (>10%)**: Strong engagement - promotion resonates
- **Low ER (<3%)**: Visibility issue or weak offer - review placement/creative
- **Compare entity types**: Urban vs suburban engagement patterns

**Example Insight**:
> "Premium Markets (BrandGroup) shows 12% engagement vs 7% for Rural Value - urban customers engage more with digital circulars"

**Dashboard Display**: KPI strip, category comparisons

---

#### 4. **Action Efficiency** (ATL per 10K Views)

**Formula**: `(Total Added to List / Total Views) × 10,000`

**Value**:
- ROI-focused metric - "how many shopping list adds per 10,000 impressions?"
- Directly correlates to potential basket impact
- Normalizes performance for cross-entity comparison

**Audience**:
- **Finance/Analytics Teams**: ROI calculation and budget allocation
- **Merchandising**: Product selection based on conversion potential
- **Store Managers**: Understand which promotions drive purchasing behavior

**Actionability**:
- **High AE (>300)**: Strong conversion - 3%+ of viewers add to list
- **Moderate AE (100-300)**: Typical performance - monitor trends
- **Low AE (<100)**: Weak conversion - review offer or placement

**Example Insight**:
> "BOGO promotions show 425 ATL per 10K views vs 180 for 'Save $X' - BOGO drives 2.4x more list adds"

**Dashboard Display**: Performance comparison views, deal type analysis

---

#### 5. **Share Velocity** (Shares per Promotion)

**Formula**: `Total Share Count / Total Promotions`

**Value**:
- Viral/social amplification indicator
- Identifies promotions that inspire advocacy
- Early signal for trending or exceptional deals

**Audience**:
- **Social Media Teams**: Content strategy and amplification
- **Brand Marketing**: Word-of-mouth potential
- **Category Managers**: Identify "hero" products that drive brand awareness

**Actionability**:
- **High SV (>0.1)**: Viral potential - 10%+ of promotions being shared
- **Moderate SV (0.01-0.1)**: Normal sharing behavior
- **Exceptional SV (>0.5)**: Breakout promotion - amplify through additional channels

**Example Insight**:
> "Ribeye steak promotion has 0.8 share velocity - 8 shares per 10 promotions viewed. Consider featuring in social media."

**Dashboard Display**: Detail panels, top performers list

---

### Supporting Metrics (Already Captured)

These are components of the composite score and should remain visible:

- **Card in View (CIV)**: Volume indicator - exposure measurement
- **Card Clicked (CC)**: Initial engagement - interest signal
- **Added to List (ATL)**: Purchase intent - action signal
- **Share Count**: Social amplification - advocacy signal

---

### Nice-to-Have (Secondary Analysis)

These provide additional insights but are not "must-haves":

- **Average Percentile**: Competitive standing across portfolio
- **Deal Type Distribution**: BOGO vs Save X vs Num For performance
- **Category Penetration**: Promotions per category balance
- **Store-Level Variance**: Performance consistency across locations
- **Temporal Performance**: Week-over-week trends

---

### KPI Selection Recommendations

**For KPI Strip (Main Dashboard)**:
1. **Card in View** (volume)
2. **Card Clicked** (engagement)
3. **Added to List** (action)
4. **Avg Score** (PRIMARY KPI)
5. **Engagement Rate** (efficiency) - *Replace CTR with this*

**For Detail Panels**:
- Conversion Rate
- Top Quartile %
- Action Efficiency
- Share Velocity

**For Executive Views**:
- Avg Score (PRIMARY)
- Top Quartile %
- Week-over-Week Change
- Store Count

---

## Implementation Recommendations

### Phase 1: Core Data Layer

1. **Index Builder**: Create promotion indices on app initialization
2. **Filter Engine**: Implement efficient filtering logic
3. **Aggregation Engine**: Core metric calculations
4. **Cache Layer**: Memoization for repeated queries

### Phase 2: Entity Integration

1. **Entity Resolver**: Convert entity selection to store IDs
2. **Hierarchy Navigator**: Navigate entity tree efficiently
3. **Count Calculator**: Dynamic store counting
4. **Breadcrumb Builder**: Generate breadcrumb paths

### Phase 3: UI Updates

1. **Context Bar**: Wire entity/date selectors to data layer
2. **KPI Strip**: Real-time metric updates
3. **Content List**: Dynamic category/promotion rendering
4. **Detail Panel**: Drill-down functionality

### Phase 4: Optimization

1. **Performance Profiling**: Identify bottlenecks
2. **Index Optimization**: Refine index structures
3. **Caching Strategy**: Implement smart caching
4. **Progressive Loading**: Load critical data first

### Phase 5: Advanced Features

1. **Multi-Week Comparison**: Trend analysis
2. **Export Functionality**: Data export
3. **Advanced Filters**: Additional filter dimensions
4. **Saved Views**: Save filter combinations

---

## Appendix: Key Formulas

### Metric Calculations

```javascript
// Composite Score (per promotion) - PRIMARY KPI
CompositeScore = (Views × 10) + (Clicks × 15) + (AddedToList × 25)

// Average Score (across promotions)
AvgScore = Sum(CompositeScores) / Count(Promotions)

// Conversion Rate (Clicks to Add-to-List)
ConversionRate = (Total Added to List / Total Clicks) × 100

// Share Rate
ShareRate = (Total Shares / Total Views) × 100

// Percentile Ranking
Percentile = (Rank / TotalPromotions) × 100

// Week-over-Week Change
WoWChange = ((CurrentWeek - PreviousWeek) / PreviousWeek) × 100
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-29 | System Architect | Initial comprehensive documentation |
| 1.1 | 2025-11-30 | System Architect | Added tree table UI section, updated Store schema to match v6 implementation |
| 1.2 | 2025-11-30 | System Architect | Added Context Persistence section with state synchronization and view transition flows |

---

**END OF DOCUMENT**
