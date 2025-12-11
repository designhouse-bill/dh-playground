# Analytics Dashboard - Current State Summary
**Version:** December 2025
**Purpose:** Comprehensive documentation for planning discussions and team alignment

---

## Executive Overview

### What It Is
A multi-page analytics dashboard for analyzing **digital circular promotion performance** across retail stores. The dashboard enables merchandising and marketing teams to understand how promotions perform based on shopper engagement metrics.

### Target Users
- **Merchandising Teams:** Optimize promotion placement and deal structures
- **Marketing Teams:** Analyze campaign effectiveness across stores/regions
- **Category Managers:** Track category-level performance trends
- **Executives:** High-level performance visibility and comparison

### Core Value Proposition
Transform raw engagement data (views, clicks, adds-to-list) into actionable insights through:
- Multi-level aggregation (Store → Category → Promotion)
- Weighted composite scoring for fair comparison
- Progressive disclosure navigation (drill-down from stores to promotions)
- Side-by-side comparison capabilities

---

## Architecture Overview

### Technology Stack
- **Frontend:** Vanilla JavaScript (Angular-ready architecture)
- **Charts:** Apache eCharts for performance visualization
- **Styling:** CSS with design tokens system
- **Data:** Mock data layer simulating API responses
- **State:** localStorage persistence + URL parameters for deep linking

### Multi-Page Structure
```
┌─────────────────────────────────────────────────────┐
│                    HEADER                           │
│  [Date Picker] [Entity Selector] [Filter Chips]     │
├─────────────────────────────────────────────────────┤
│  Navigation: [BASE] [GRID] [COMPARE]                │
├─────────────────────────────────────────────────────┤
│                                                     │
│   BASE MODE (3 sub-pages):                         │
│   • Circulars (Stores) → Categories → Promotions   │
│                                                     │
│   GRID MODE:                                        │
│   • Full-featured data grid with all promotions    │
│                                                     │
│   COMPARE MODE:                                     │
│   • Side-by-side A vs B comparison                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Shared Module Architecture
| Module | Purpose |
|--------|---------|
| `shared-core.js` | State management, data loading, utilities |
| `shared-filters.js` | Filter chips, metrics key tooltip |
| `shared-modals.js` | Date picker, entity selector, filter dialogs |
| `shared-perf-charts.js` | eCharts performance bar visualization |
| `state-manager.js` | localStorage persistence, URL handling |

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
**Purpose:** Individual promotion performance

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
- Column visibility toggle
- Advanced filtering per column
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

## Data Model

### Metrics Definitions

| Metric | Full Name | Description | Typical Range |
|--------|-----------|-------------|---------------|
| **CIV** | Circular Item Views | Times promotion displayed in viewport | 50-300 per item |
| **CC** | Circular Clicks | Times shopper clicked to expand | 2-12% of views |
| **ATL** | Add to List | Times added to shopping list | 0-2% of views |

### Composite Score Formula

```
Performance = Views × 1 + Clicks × 5 + Adds × 20
```

**Weight Rationale:**
- **Views (×1):** Baseline engagement, passive
- **Clicks (×5):** Active interest, 5× more valuable
- **Adds (×20):** Purchase intent, 20× more valuable

### Percentile Calculation
Items ranked by composite score, converted to 0-100 scale where:
- **70-100:** High performer (green badge)
- **40-69:** Moderate performer (yellow badge)
- **0-39:** Low performer (red badge)

### Data Hierarchy

```
Atomic Record (Store × Week × Promotion)
        ↓ aggregate
    Promotion (across stores)
        ↓ aggregate
    Category (across promotions)
        ↓ aggregate
    Store (across categories)
        ↓ aggregate
    Brand / Entity
```

### Entity Structure
```
Brand (6 total)
  └── Sub-Brand (2 per brand = 12 total)
        └── Store (2-3 per sub-brand = 31 total)
```

**Brands:** Safeway, Vons, Albertsons, Jewel-Osco, Acme Markets, Shaw's

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
- Pagination (10, 25, 50 rows per page)
- Top N selector (25, 50, 100, 250, All)
- Column filters (text input or dropdown)
- Row selection → detail panel

**Grid States:**
- Sort column and direction
- Current page and rows per page
- Column visibility
- Active filters

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
- **Session:** Compare mode selections

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

## Data Scale (Current Mock Data)

| Dimension | Count |
|-----------|-------|
| Atomic Records | 3,673 |
| Stores | 31 |
| Brands | 6 |
| Sub-Brands | 12 |
| Categories | 8 |
| Promotions | ~60 unique |
| Weeks | 5 (Oct 28 - Dec 1, 2025) |

**Categories:**
1. Produce
2. Meat & Seafood
3. Dairy
4. Bakery
5. Frozen Foods
6. Beverages
7. Snacks & Candy
8. Household

---

## File Structure

```
analytics-dashboard/
├── base_circulars.html      # Stores view (default landing)
├── base_categories.html     # Categories view
├── base_promotions.html     # Promotions view
├── grid-inquiry.html        # Full grid view
├── compare.html             # Comparison view
├── styles.css               # Main stylesheet
│
├── js/
│   ├── shared-core.js       # Core utilities & state
│   ├── shared-filters.js    # Filter system + metrics tooltip
│   ├── shared-modals.js     # Modal components
│   ├── shared-perf-charts.js # eCharts performance bars
│   ├── state-manager.js     # Persistence layer
│   ├── base-circulars.js    # Stores page logic
│   ├── base-categories.js   # Categories page logic
│   ├── base-promotions.js   # Promotions page logic
│   ├── grid-inquiry.js      # Grid page logic
│   └── compare.js           # Compare page logic
│
├── shared/
│   ├── mock-data.js         # Data aggregation layer
│   ├── promotion-records-data.js  # Atomic records (3,673)
│   └── design-tokens.css    # Design system tokens
│
└── documentation/
    └── current-state-summary.md  # This document
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
- `MockData.getStoresWithMetrics()` → `GET /api/stores`
- `MockData.getCategoriesWithMetrics()` → `GET /api/categories`
- `MockData.getPromotionsForCategory()` → `GET /api/promotions?category=`

### Performance Considerations
- Charts use ResizeObserver for responsive behavior
- Data cached with TTL (10-30 minutes)
- Pagination limits DOM nodes
- State persisted to avoid re-fetching

---

## Summary

The Analytics Dashboard provides a comprehensive view of digital circular promotion performance through:

1. **Multi-level analysis:** Store → Category → Promotion drill-down
2. **Weighted scoring:** Fair comparison via composite metrics
3. **Visual clarity:** eCharts bar visualization with metric filtering
4. **Contextual navigation:** Progressive disclosure with state preservation
5. **Comparison capability:** Side-by-side A/B analysis

The architecture is designed for vanilla JavaScript now with clear migration paths to Angular, maintaining separation of concerns and reusable components throughout.

---

*Document generated: December 2025*
*For questions or updates, reference the codebase at `/analytics-dashboard/`*
