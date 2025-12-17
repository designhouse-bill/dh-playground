# Analytics Dashboard - Current State Summary

**Version:** 002 - December 2025
**Purpose:** Comprehensive documentation for planning discussions, team alignment, and **data team coordination**

---

## Executive Overview

### What It Is
A multi-page analytics dashboard for analyzing **digital circular promotion performance** across retail stores. The dashboard enables merchandising and marketing teams to understand how promotions perform based on shopper engagement metrics.

### Target Users
- **Merchandising Teams:** Optimize promotion placement and deal structures
- **Marketing Teams:** Analyze campaign effectiveness across stores/regions
- **Category Managers:** Track category-level performance trends
- **Executives:** High-level performance visibility and comparison
- **Data Teams:** Understand data requirements for production implementation

### Core Value Proposition
Transform raw engagement data (views, clicks, adds-to-list) into actionable insights through:
- Multi-level aggregation (Store → Category → Promotion)
- Weighted composite scoring for fair comparison
- Progressive disclosure navigation (drill-down from stores to promotions)
- Side-by-side comparison capabilities

### Current Implementation Status
This documentation reflects the **mock data implementation** - a fully functional prototype demonstrating all dashboard features with simulated data. Production implementation will require integration with live BigQuery data sources.

### Interactive Data Architecture Flowchart
For a visual, interactive representation of the data architecture, see:
**[data-architecture-flowchart.html](./data-architecture-flowchart.html)**

This interactive diagram shows:
- Entity hierarchy (ALL STORES → Brand → Sub-Brand → Store)
- Data aggregation flow (atomic records → aggregated views)
- Metrics calculation (CIV, CC, ATL → composite score)
- Dashboard data flow (how data feeds Base, Grid, Compare views)

---

## Architecture Overview

### Technology Stack
| Layer | Technology | Notes |
|-------|------------|-------|
| Frontend | Vanilla JavaScript | Angular-ready architecture |
| Charts | Apache eCharts | Performance visualization |
| Styling | CSS + Design Tokens | Consistent design system |
| Data | Mock data layer | Simulating API responses |
| State | localStorage + URL params | Persistence and deep linking |
| Cache | IndexedDB | Client-side caching with TTL |

### Multi-Page Structure
```
┌─────────────────────────────────────────────────────────────────────┐
│                           HEADER BAR                                │
│   [Date Picker] [Entity Selector] [Filter Chips] [Metrics Key]     │
├─────────────────────────────────────────────────────────────────────┤
│   Navigation: [BASE] [GRID] [COMPARE]                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   BASE MODE (3 sub-pages with progressive disclosure):              │
│   • Circulars (Stores) → Categories → Promotions                   │
│                                                                     │
│   GRID MODE:                                                        │
│   • Full-featured data grid with all promotions                    │
│                                                                     │
│   COMPARE MODE:                                                     │
│   • Side-by-side A vs B comparison                                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Shared Module Architecture
| Module | Purpose |
|--------|---------|
| `shared-core.js` | State management, data loading, utilities |
| `shared-filters.js` | Filter chips, metrics key tooltip |
| `shared-modals.js` | Date picker, entity selector, filter dialogs |
| `shared-perf-charts.js` | eCharts performance bar visualization |
| `state-manager.js` | localStorage persistence, URL handling |
| `data-service.js` | API simulation with caching layer |
| `cache-manager.js` | IndexedDB persistent storage |

---

## Pages & Navigation

### 1. Base Circulars (Stores View)
**File:** `base_circulars.html`
**Purpose:** Top-level view showing all stores with aggregated metrics

**Layout:**
- Left panel: Sortable data grid of stores
- Right panel: Store detail (expands on row selection)

**Grid Columns:**
| Column | Description |
|--------|-------------|
| Store | Store name with brand indicator |
| Views | Circular Item Views (CIV) |
| Clicks | Circular Clicks (CC) |
| Added | Add to List (ATL) |
| Performance | Stacked bar chart (Views/Clicks/Adds) |
| %tile | Percentile ranking (0-100) |

**Actions:** View Categories, View Promotions, Grid Inquiry, Compare

---

### 2. Base Categories
**File:** `base_categories.html`
**Purpose:** Category-level performance within selected context

**Features:**
- Inherits store filter from Circulars page (progressive disclosure)
- Same grid structure as Stores
- Category icons and promotion counts
- Drill-down to promotions

---

### 3. Base Promotions
**File:** `base_promotions.html`
**Purpose:** Individual promotion performance analysis

**Layout:** Three-column
- Left: Category filter sidebar
- Center: Promotion grid (card or table view)
- Right: Promotion detail panel

**Features:**
- Dual view toggle (Card View / Table View)
- More Data toggle (show/hide additional columns)
- Progressive disclosure from Categories or Stores

---

### 4. Grid Inquiry
**File:** `grid-inquiry.html`
**Purpose:** Full-featured data exploration

**Features:**
- All promotions in single sortable/filterable grid
- Column visibility toggle with dropdown menu
- Advanced filtering per column
- Pagination (25, 50, 100 rows per page)
- Export-ready format

---

### 5. Compare Mode
**File:** `compare.html`
**Purpose:** Side-by-side comparison of two contexts

**Comparison Layers:**
- Circulars (Store-level)
- Categories
- Promotions

**Each Side (A and B) Has:**
- Independent date selector
- Independent entity selector
- Synchronized metric display

---

## Data Architecture

> **This section is designed for the Data Team** to understand data requirements for BigQuery production implementation.

### Data Flow Overview
```
┌─────────────────────────────────────────────────────────────────────┐
│                        DATA COLLECTION LAYER                        │
│             (Analytics Events from Digital Circular App)            │
│                                                                     │
│   • Page views → CIV (Circular Item Views)                         │
│   • Click events → CC (Circular Clicks)                            │
│   • Add-to-list actions → ATL (Add To List)                        │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     ATOMIC RECORD (BigQuery)                        │
│            Primary Table: promotion_engagement_facts                │
│                                                                     │
│        Grain: 1 Store × 1 Week × 1 Promotion = 1 Record            │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   PRE-COMPUTED AGGREGATIONS                         │
│                                                                     │
│   • agg_category_weekly (by category per week per entity)          │
│   • agg_store_weekly (by store per week)                           │
│   • agg_brand_weekly (by brand per week)                           │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      DASHBOARD CONSUMPTION                          │
│                                                                     │
│   Views: Circulars → Categories → Promotions (drill-down)          │
│   Filters: Week, Entity, Category, Deal Type, Card Size            │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Entity Hierarchy
```
┌─────────────────────────────────────────────────────────────────────┐
│                          ALL STORES                                 │
│                         (Top Level)                                 │
└─────────────────────────────────────────────────────────────────────┘
                                  │
            ┌─────────────────────┼─────────────────────┐
            ▼                     ▼                     ▼
     ┌──────────┐          ┌──────────┐          ┌──────────┐
     │  BRAND   │          │  BRAND   │          │  BRAND   │
     │ Safeway  │          │   Vons   │          │Albertsons│  ... (6 total)
     └──────────┘          └──────────┘          └──────────┘
            │                     │                     │
      ┌─────┼─────┐         ┌─────┼─────┐         ┌─────┼─────┐
      ▼     ▼     ▼         ▼     ▼     ▼         ▼     ▼     ▼
   ┌─────┐┌─────┐┌─────┐ ┌─────┐┌─────┐┌─────┐ ┌─────┐┌─────┐┌─────┐
   │ Sub ││ Sub ││ Sub │ │ Sub ││ Sub ││ Sub │ │ Sub ││ Sub ││ Sub │
   │Brand││Brand││Brand│ │Brand││Brand││Brand│ │Brand││Brand││Brand│
   └─────┘└─────┘└─────┘ └─────┘└─────┘└─────┘ └─────┘└─────┘└─────┘
      │      │      │       │      │      │       │      │      │
      ▼      ▼      ▼       ▼      ▼      ▼       ▼      ▼      ▼
   Stores Stores Stores  Stores Stores Stores  Stores Stores Stores
   (2-3)  (2-3)  (2-3)   (2-3)  (2-3)  (2-3)   (2-3)  (2-3)  (2-3)
```

**Current Mock Data Scale:**
- 6 Brands
- 36 Sub-Brands
- 95 Stores

---

### BigQuery Schema: Primary Fact Table

**Table: `promotion_engagement_facts`**

This is the atomic record table. Each row represents one promotion's performance at one store for one week.

| Column | Type | Description | Required |
|--------|------|-------------|----------|
| **Identity** |
| `record_id` | STRING | Unique record identifier | PK |
| `store_id` | STRING | Store identifier (e.g., "store-101") | Yes |
| `store_name` | STRING | Store display name | Yes |
| `store_size` | STRING | Store size: "large", "medium", "small" | Yes |
| **Entity Hierarchy** |
| `sub_brand_id` | STRING | Sub-brand identifier | Yes |
| `sub_brand_name` | STRING | Sub-brand display name | Yes |
| `brand_id` | STRING | Brand identifier | Yes |
| `brand_name` | STRING | Brand display name | Yes |
| **Temporal** |
| `week_num` | INT64 | Week number (1-52) | Yes |
| `week_label` | STRING | Human-readable label ("Oct 28 - Nov 3") | Yes |
| `week_start_date` | DATE | Week start date | Yes |
| `publication_id` | STRING | Circular publication identifier | Yes |
| **Promotion Details** |
| `promotion_id` | STRING | Unique promotion identifier | Yes |
| `category` | STRING | Product category | Yes |
| `title` | STRING | Promotion title/name | Yes |
| `unit` | STRING | Price unit ("lb", "each", "oz") | Yes |
| `original_price` | FLOAT64 | Regular retail price | Yes |
| `sale_price` | FLOAT64 | Promotional sale price | Yes |
| `deal_type` | STRING | Deal type (see values below) | Yes |
| **Duration & Placement** |
| `days_run` | INT64 | Promotion duration: 1, 3, or 7 days | Yes |
| `start_date` | DATE | Promotion start date | Yes |
| `end_date` | DATE | Promotion end date | Yes |
| `original_position` | INT64 | Row position in ad layout (1-75) | Yes |
| **Parent-Child (EPC)** |
| `is_parent` | BOOL | True if this is a parent promotion | Yes |
| `parent_promo_id` | STRING | Reference to parent (NULL if standalone) | Conditional |
| `child_count` | INT64 | Number of child variants (0 if not parent) | Yes |
| **Raw Metrics** |
| `civ` | INT64 | Circular Item Views (impressions) | Yes |
| `cc` | INT64 | Circular Clicks | Yes |
| `atl` | INT64 | Add To List actions | Yes |
| **Pre-Computed Scores** |
| `views_score` | INT64 | CIV × 1 | Yes |
| `clicks_score` | INT64 | CC × 5 | Yes |
| `adds_score` | INT64 | ATL × 20 | Yes |
| `composite_score` | INT64 | Sum of weighted scores | Yes |
| **Metadata** |
| `created_at` | TIMESTAMP | Record creation timestamp | Yes |

---

### Deal Type Values
| Value | Description |
|-------|-------------|
| `Fixed Price` | Single price point (e.g., "$0.44/lb") |
| `BOGO` | Buy One Get One Free |
| `BOGO 50%` | Buy One Get One 50% Off |
| `$ Off` | Dollar amount off regular price |
| `# / Price` | Multiple items for price (e.g., "2 for $5") |
| `# for Price` | Quantity pricing (e.g., "3 for $10") |
| `Mix & Match` | Mix and match deal |

---

### Category Values
| Category | Description |
|----------|-------------|
| Produce | Fresh fruits and vegetables |
| Dairy | Milk, cheese, yogurt, eggs |
| Meat & Seafood | Fresh meat and seafood |
| Bakery | Bread, pastries, baked goods |
| Frozen Foods | Frozen meals, ice cream, frozen produce |
| Beverages | Drinks, juices, water, soda |
| Snacks & Candy | Chips, cookies, candy |
| Household | Cleaning supplies, paper products |

---

### Composite Score Calculation

```
┌─────────────────────────────────────────────────────────────────────┐
│                    COMPOSITE SCORE FORMULA                          │
│                                                                     │
│   views_score  = CIV × 1    (baseline engagement - passive view)   │
│   clicks_score = CC  × 5    (active interest - 5× more valuable)   │
│   adds_score   = ATL × 20   (purchase intent - 20× more valuable)  │
│                                                                     │
│   composite_score = views_score + clicks_score + adds_score        │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│   EXAMPLE                                                           │
│                                                                     │
│   Input:  CIV = 381, CC = 36, ATL = 6                              │
│                                                                     │
│   views_score  = 381 × 1  = 381                                    │
│   clicks_score = 36  × 5  = 180                                    │
│   adds_score   = 6   × 20 = 120                                    │
│                                                                     │
│   composite_score = 381 + 180 + 120 = 681                          │
└─────────────────────────────────────────────────────────────────────┘
```

**Why Pre-Compute Scores?**
- Enables fast sorting and ranking at query time
- Avoids repeated calculations in aggregations
- Supports percentile calculations across large datasets

---

### Parent-Child Roll-Up (EPC)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    EPC (PARENT-CHILD) STRUCTURE                     │
│                                                                     │
│   Some promotions have variants (e.g., "Coca-Cola" available in    │
│   12-pack, 6-pack, and 2-liter sizes). These variants share a      │
│   parent promotion for aggregated display.                          │
│                                                                     │
│                  ┌──────────────────┐                               │
│                  │      PARENT      │                               │
│                  │   "Coca-Cola"    │  is_parent = true            │
│                  │                  │  child_count = 3              │
│                  │   Metrics: SUM   │  parent_promo_id = NULL      │
│                  └──────────────────┘                               │
│                           │                                         │
│              ┌────────────┼────────────┐                            │
│              ▼            ▼            ▼                            │
│         ┌────────┐   ┌────────┐   ┌────────┐                        │
│         │ CHILD  │   │ CHILD  │   │ CHILD  │                        │
│         │ 12-pk  │   │ 6-pack │   │ 2-Liter│                        │
│         └────────┘   └────────┘   └────────┘                        │
│         is_parent = false                                           │
│         parent_promo_id = "promo-coca-cola"                         │
│                                                                     │
│   AGGREGATION RULE:                                                 │
│   Dashboard displays PARENT with metrics summed from all children  │
│   Child records are hidden from main views but available for       │
│   drill-down detail                                                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Original Position (Ad Layout)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AD LAYOUT POSITION                               │
│                                                                     │
│   `original_position` indicates the row position (1-75) where      │
│   a promotion appears in the base advertisement layout.            │
│                                                                     │
│   ┌─────────────────────────────────────────┐                       │
│   │  Position 1  │  Top of ad (highest visibility)                 │
│   │  Position 2  │                                                  │
│   │  Position 3  │                                                  │
│   │     ...      │                                                  │
│   │  Position 75 │  Bottom of ad (lowest visibility)               │
│   └─────────────────────────────────────────┘                       │
│                                                                     │
│   USE CASE: Correlate position with performance to understand      │
│   how ad placement affects engagement                               │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Days Run (Promotion Duration)

| Days | Description | Distribution (Mock) |
|------|-------------|---------------------|
| 7 | Full-week promotion | 84.7% |
| 3 | Mid-week or weekend special | 10.3% |
| 1 | One-day flash sale | 5.0% |

**Important:** Metrics are for the entire run period, not daily averages.

---

### BigQuery Partitioning & Clustering

```sql
-- RECOMMENDED: Partition by week for time-series efficiency
-- Cluster by common filter dimensions

CREATE TABLE promotion_engagement_facts (
  -- ... columns as defined above ...
)
PARTITION BY week_start_date
CLUSTER BY brand_id, store_id, category;
```

**Why This Strategy?**
- **Partition by `week_start_date`**: Most queries filter by week; partitioning eliminates scanning irrelevant weeks
- **Cluster by `brand_id, store_id, category`**: These are the most common filter dimensions in dashboard queries

---

### Dimension Tables

**`dim_stores`**
| Column | Type | Description |
|--------|------|-------------|
| store_id | STRING | PK |
| store_name | STRING | Display name |
| store_number | INT64 | Store number |
| address | STRING | Full address |
| size | STRING | large/medium/small |
| sub_brand_id | STRING | FK to dim_sub_brands |
| brand_id | STRING | FK to dim_brands |

**`dim_brands`**
| Column | Type | Description |
|--------|------|-------------|
| brand_id | STRING | PK |
| brand_name | STRING | Display name |

**`dim_sub_brands`**
| Column | Type | Description |
|--------|------|-------------|
| sub_brand_id | STRING | PK |
| sub_brand_name | STRING | Display name |
| brand_id | STRING | FK to dim_brands |

**`dim_categories`**
| Column | Type | Description |
|--------|------|-------------|
| category_id | STRING | PK |
| category_name | STRING | Display name |
| icon_url | STRING | Category icon |

**`dim_weeks`**
| Column | Type | Description |
|--------|------|-------------|
| week_id | STRING | PK (e.g., "week-44") |
| week_num | INT64 | Week number |
| week_label | STRING | "Oct 28 - Nov 3" |
| start_date | DATE | Week start |
| end_date | DATE | Week end |
| year | INT64 | Year |

---

### Pre-Computed Aggregation Tables

**Table: `agg_category_weekly`**

Aggregated metrics by category, per week, at each entity level.

```sql
CREATE TABLE agg_category_weekly AS
SELECT
  week_num,
  week_start_date,
  brand_id,
  sub_brand_id,      -- NULL for brand-level aggregation
  store_id,           -- NULL for brand/sub-brand level
  category,
  COUNT(DISTINCT promotion_id) as promotion_count,
  SUM(civ) as total_civ,
  SUM(cc) as total_cc,
  SUM(atl) as total_atl,
  SUM(views_score) as total_views_score,
  SUM(clicks_score) as total_clicks_score,
  SUM(adds_score) as total_adds_score,
  SUM(composite_score) as total_composite_score
FROM promotion_engagement_facts
GROUP BY 1, 2, 3, 4, 5, 6;
```

**Table: `agg_store_weekly`**

Aggregated metrics by store per week.

```sql
CREATE TABLE agg_store_weekly AS
SELECT
  week_num,
  week_start_date,
  store_id,
  store_name,
  brand_id,
  sub_brand_id,
  COUNT(DISTINCT promotion_id) as promotion_count,
  COUNT(DISTINCT category) as category_count,
  SUM(civ) as total_civ,
  SUM(cc) as total_cc,
  SUM(atl) as total_atl,
  SUM(composite_score) as total_composite_score
FROM promotion_engagement_facts
GROUP BY 1, 2, 3, 4, 5, 6;
```

**Table: `agg_brand_weekly`**

Aggregated metrics by brand per week.

```sql
CREATE TABLE agg_brand_weekly AS
SELECT
  week_num,
  week_start_date,
  brand_id,
  brand_name,
  COUNT(DISTINCT store_id) as store_count,
  COUNT(DISTINCT promotion_id) as promotion_count,
  SUM(civ) as total_civ,
  SUM(cc) as total_cc,
  SUM(atl) as total_atl,
  SUM(composite_score) as total_composite_score
FROM promotion_engagement_facts
GROUP BY 1, 2, 3, 4;
```

---

### Percentile Calculation

Percentiles are calculated by ranking items within a context (week + entity filter) by composite score.

```sql
-- Example: Calculate percentile for promotions in a specific week
SELECT
  promotion_id,
  composite_score,
  PERCENT_RANK() OVER (
    PARTITION BY week_num, store_id
    ORDER BY composite_score ASC
  ) * 100 as percentile
FROM promotion_engagement_facts
WHERE week_num = 47;
```

**Percentile Badges:**
| Range | Badge | Color |
|-------|-------|-------|
| 70-100 | High performer | Green |
| 40-69 | Moderate performer | Yellow |
| 0-39 | Low performer | Red |

---

### Data Scale Summary

**Mock Data (Current Implementation):**
| Dimension | Count |
|-----------|-------|
| Atomic Records | ~44,175 |
| Stores | 95 |
| Brands | 6 |
| Sub-Brands | 36 |
| Categories | 8 |
| Promotions | ~93 unique |
| Weeks | 5 (Oct 28 - Dec 1, 2025) |

**Record Calculation:**
- 95 stores × 5 weeks × ~93 promotions = ~44,175 records

---

## UI Components

### 1. Performance Bar Charts
**Technology:** Apache eCharts
**Type:** Stacked horizontal bar

**Features:**
- Three segments: Views (blue), Clicks (green), Adds (gray)
- Metric selection dropdown (All, Views, Clicks, Adds)
- Tooltip shows hovered metric with value and percentage
- Scales relative to max value in current view

**Colors:**
- Views: `#4272D8` (Blue)
- Clicks: `#B8D64D` (Green)
- Adds: `#4E5370` (Gray)

---

### 2. Filter System

**Filter Types:**
| Type | Description |
|------|-------------|
| Category | Filter by product category |
| Deal Type | BOGO, $ Off, 2-for pricing, etc. |
| Card Size | 1x1, 2x1, 2x2 promotion card sizes |
| Promotion | Text search on promotion name |
| Store | Context filter (from navigation) |

**Behavior:**
- Single filter per type (new replaces old)
- Displayed as removable chips in header
- Column filters sync to header chips

---

### 3. Modal Dialogs

**Date Picker:**
- Week selection with year filter
- Weeks 44-48 (Oct 28 - Dec 1, 2025)
- Custom date range option

**Entity Selector:**
- Tree view: All → Brand → Sub-Brand → Store
- Groups tab for saved selections
- Search functionality

**Add Filter:**
- Three tabs: Category, Deal Type, Card Size
- Single-select per type
- Apply adds to filter chips

---

### 4. Data Grids

**Features:**
- Sortable columns (click header to toggle)
- Pagination (25, 50, 100 rows per page)
- Top N selector (25, 50, 100, 250, All)
- Column filters (text input or dropdown)
- Row selection → detail panel
- Column visibility toggle

---

### 5. Metrics Key Tooltip

**Trigger:** Blue "i" icon button next to Performance header

**Content:**
- Metric definitions with color swatches
- Weight indicators (×1, ×5, ×20)
- Performance formula display
- "Why this matters" explanation

---

## Key Features

### Progressive Disclosure
Navigation preserves context as users drill down:
```
Stores → [Select Store] → Categories (filtered by store)
       → [Select Category] → Promotions (filtered by store + category)
```

URL parameters enable deep linking: `?store=store-101&category=produce`

### State Persistence
- **localStorage:** User preferences, sort states, filter history
- **URL Parameters:** Shareable context (store, category, week)
- **IndexedDB:** Cached data with TTL expiration

### Metric Filtering
The "Show Metrics" dropdown allows users to:
- View composite (All) - default
- View individual metrics (Views, Clicks, or Adds)
- Multi-select individual metrics
- Charts and values update dynamically

### Detail Panel Drill-Down
Selecting any row opens a right-side panel with:
- Full entity details
- Action buttons for navigation
- Related metrics and counts

---

## File Structure

```
analytics-dashboard/
├── index.html                   # Entry point (redirects to base_promotions)
├── base_promotions.html         # Promotions view
├── base_categories.html         # Categories view
├── base_circulars.html          # Stores view
├── grid-inquiry.html            # Full grid view
├── compare.html                 # Comparison view
├── styles.css                   # Main stylesheet
├── app.js                       # Main application logic
├── data-service.js              # API/cache integration
├── cache-manager.js             # IndexedDB caching
│
├── js/
│   ├── state-manager.js         # Persistence layer
│   ├── shared-core.js           # Core utilities & state
│   ├── shared-filters.js        # Filter system + metrics tooltip
│   ├── shared-modals.js         # Modal components
│   ├── shared-perf-charts.js    # eCharts performance bars
│   ├── base-promotions.js       # Promotions page logic
│   ├── base-categories.js       # Categories page logic
│   ├── base-circulars.js        # Circulars page logic
│   ├── grid-inquiry.js          # Grid page logic
│   └── compare.js               # Compare page logic
│
├── shared/
│   ├── mock-data.js             # Core mock data & aggregation
│   ├── mock-entities.js         # Entity hierarchy (brands/stores)
│   ├── mock-weekly-data.js      # Weekly metric generator
│   ├── mock-promotions-expanded.js # Promotion catalog
│   ├── promotion-records-data.js   # Atomic records (44K)
│   ├── design-tokens.css        # Design system tokens
│   └── base.css                 # Base element styles
│
└── documentation/
    ├── current-state-summary.md      # Previous version
    └── current-state-summary-002.md  # This document
```

---

## Technical Notes for Future Development

### Angular Migration Readiness
- Vanilla JS modules follow component-like patterns
- State management centralized (easy to convert to services)
- eCharts integration is framework-agnostic
- CSS uses design tokens (compatible with Angular Material)

### API Integration Points
Current mock data methods map to future API endpoints:
| Mock Method | Future API |
|-------------|------------|
| `MockData.getStoresWithMetrics()` | `GET /api/stores?week={weekId}&entity={entityId}` |
| `MockData.getCategoriesWithMetrics()` | `GET /api/categories?week={weekId}&entity={entityId}` |
| `MockData.getPromotionsForCategory()` | `GET /api/promotions?category={id}&week={weekId}` |
| `DataService.getComparisonData()` | `GET /api/compare?a_week={}&a_entity={}&b_week={}&b_entity={}` |

### Performance Considerations
- Charts use ResizeObserver for responsive behavior
- Data cached with TTL (10-30 minutes) via IndexedDB
- Pagination limits DOM nodes
- State persisted to avoid re-fetching
- Pre-computed scores enable fast sorting

---

## Summary

The Analytics Dashboard provides a comprehensive view of digital circular promotion performance through:

1. **Multi-level analysis:** Store → Category → Promotion drill-down
2. **Weighted scoring:** Fair comparison via composite metrics (×1, ×5, ×20)
3. **Visual clarity:** eCharts bar visualization with metric filtering
4. **Contextual navigation:** Progressive disclosure with state preservation
5. **Comparison capability:** Side-by-side A/B analysis

**For the Data Team:**
- Primary grain: **1 Store × 1 Week × 1 Promotion**
- 3 core metrics: **CIV, CC, ATL** (pre-compute weighted scores)
- Key relationships: **Entity hierarchy**, **Parent-child (EPC) roll-up**
- Critical new fields: **original_position**, **days_run**, **is_parent/parent_promo_id**
- Recommended: **BigQuery partitioning by week_start_date**, **clustering by brand_id, store_id, category**

---

*Document Version: 002*
*Generated: December 2025*
*For questions or updates, reference the codebase at `/analytics-dashboard/`*
