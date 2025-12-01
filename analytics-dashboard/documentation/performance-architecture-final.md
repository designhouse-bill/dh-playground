# Performance Architecture - Analytics Dashboard
## Week-Centric Data Strategy for Maximum Responsiveness

**Document Version:** 1.0
**Last Updated:** 2025-11-29
**Status:** Architecture Design

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Date Range Architecture (Priority-Based)](#date-range-architecture-priority-based)
3. [Database Schema](#database-schema)
4. [Nightly Pre-Computation Jobs](#nightly-pre-computation-jobs)
5. [API Endpoint Design](#api-endpoint-design)
6. [Client-Side Strategy](#client-side-strategy)
7. [Performance Guarantees](#performance-guarantees)
8. [Scalability Projections](#scalability-projections)
9. [Technology Recommendations](#technology-recommendations)
10. [Implementation Roadmap](#implementation-roadmap)

---

## Executive Summary

### Architecture Principles

**Week-Centric Design**: The analytics dashboard is optimized for week-at-a-time analysis, which represents 90%+ of user workflows.

**Pre-Computation Strategy**: Nightly jobs compute weekly aggregates for all entity/category combinations, enabling sub-200ms response times for primary use cases.

**Progressive Enhancement**: Less common queries (quarterly, yearly) use on-demand aggregation with acceptable 1-2s response times.

**Database-First Approach**: PostgreSQL handles all aggregations, with Redis caching for frequently accessed queries.

### Priority-Based Response Times

| Priority | Use Case | Target Response | Strategy |
|----------|----------|----------------|----------|
| **1** | Current week only | < 100ms | Pre-cached JSON from nightly job |
| **2** | Week-over-week comparison | < 200ms | Pre-load current + previous week |
| **3** | Year-over-year same week | < 500ms | Pre-computed YoY summaries |
| **4** | Full year view (52 weeks) | < 1s | Summary-first progressive loading |
| **5** | 4-week rolling window | < 2s | On-demand aggregation |
| **6** | 13-week quarterly view | < 2s | On-demand aggregation |

### Initial Dashboard Load

When a user opens the dashboard:
- **Display**: Current week performance for "All Stores"
- **Response time**: < 100ms
- **Data freshness**: Updated nightly at 2 AM
- **User experience**: Instant, no perceived wait time

---

## Date Range Architecture (Priority-Based)

### Priority 1: Current Week Only

**User Need**: "Show me this week's performance right now"

**Strategy**: Pre-aggregated + cached on server

**Database Approach**:
- `weekly_aggregates` table with overnight computation
- All entity types pre-computed (AllStores, all brands, all subbrands, all groups, all stores)
- All categories pre-computed (totals + individual categories)

**Client Load**:
1. Fetch pre-computed JSON from `/api/promotions/current`
2. Size: ~100KB
3. Cache in IndexedDB for offline access
4. Response time: < 100ms

**User Experience**: **Instant** - Dashboard appears immediately with full data

**Implementation Details**:
```javascript
// API Response Structure
{
  week: 47,
  entity: "AllStores",
  aggregates: {
    total_promotions: 1500,
    total_civ: 12500000,
    total_cc: 850000,
    total_atl: 320000,
    avg_score: 485,
    engagement_rate: 9.36,
    conversion_rate: 37.65,
    top_quartile_pct: 28
  },
  categories: [
    {
      name: "featured_deals",
      count: 180,
      metrics: { civ: 2100000, cc: 145000, atl: 58000, avg_score: 512 }
    },
    // ... other categories
  ],
  topPerformers: [ /* top 10 promotions */ ],
  bottomPerformers: [ /* bottom 10 promotions */ ]
}
```

---

### Priority 2: Week-to-Week Comparison

**User Need**: "How does this week compare to last week?"

**Strategy**: Pre-load current + previous week on dashboard load

**Database Approach**:
- Fetch 2 weeks of data from `weekly_aggregates`
- Calculate percentage changes server-side
- Cache result in Redis

**Client Load**:
1. Fetch from `/api/promotions/wow`
2. Size: ~150KB
3. Display side-by-side comparison cards
4. Response time: < 200ms

**User Experience**: **"Wow, that was fast"** - Comparison appears instantly

**Implementation Details**:
```javascript
// API Response Structure
{
  current: {
    week: 47,
    aggregates: { /* current week metrics */ }
  },
  previous: {
    week: 46,
    aggregates: { /* previous week metrics */ }
  },
  changes: {
    civ_change_pct: 12.5,      // +12.5% increase
    cc_change_pct: -3.2,       // -3.2% decrease
    atl_change_pct: 8.1,       // +8.1% increase
    avg_score_change: 15,      // +15 points
    engagement_rate_change: 0.8 // +0.8 percentage points
  },
  trending: {
    improving_categories: [ /* categories with biggest gains */ ],
    declining_categories: [ /* categories with biggest drops */ ]
  }
}
```

---

### Priority 3: Year-over-Year Same Week Comparison

**User Need**: "How did Week 47 perform this year vs last year?"

**Strategy**: Pre-computed YoY summaries in dedicated table

**Database Approach**:
- `yoy_comparisons` table updated nightly
- Stores metrics for same week across multiple years
- Pre-calculated percentage changes

**Client Load**:
1. Fetch from `/api/summaries/yoy?week=47&years=2023,2024,2025`
2. Size: ~80KB
3. Display trend chart + comparison cards
4. Response time: < 500ms

**User Experience**: **"Very responsive"** - Historical comparison loads quickly

**Implementation Details**:
```javascript
// API Response Structure
{
  week: 47,
  entity: "AllStores",
  years: {
    "2023": {
      total_promotions: 1380,
      total_civ: 11200000,
      total_cc: 780000,
      total_atl: 285000,
      avg_score: 468
    },
    "2024": {
      total_promotions: 1420,
      total_civ: 11850000,
      total_cc: 812000,
      total_atl: 298000,
      avg_score: 477
    },
    "2025": {
      total_promotions: 1500,
      total_civ: 12500000,
      total_cc: 850000,
      total_atl: 320000,
      avg_score: 485
    }
  },
  trends: {
    yoy_growth: {
      "2024_vs_2023": { civ: 5.8, cc: 4.1, atl: 4.6, avg_score: 1.9 },
      "2025_vs_2024": { civ: 5.5, cc: 4.7, atl: 7.4, avg_score: 1.7 }
    },
    three_year_trend: "improving" // or "declining" or "stable"
  }
}
```

---

### Priority 4: Full Year View (52 Weeks)

**User Need**: "Show me the entire year's performance"

**Strategy**: Summary-first, progressive detail loading

**Database Approach**:
- Fetch 52 rows from `weekly_aggregates` (summary metrics only)
- Progressive: Load category details on drill-down
- Lazy-load individual promotions on demand

**Client Load**:
1. Fetch from `/api/summaries/yearly?year=2025&entity=AllStores`
2. Size: ~200KB for summary
3. Display trend chart immediately
4. Load details progressively as user scrolls
5. Response time: < 1s for summary, < 2s for full details

**User Experience**: **"Usable immediately, fills in smoothly"** - Chart appears fast, details load as needed

**Implementation Details**:
```javascript
// API Response Structure
{
  year: 2025,
  entity: "AllStores",
  weeks: [
    { week: 1, total_civ: 1250000, total_cc: 82000, total_atl: 31000, avg_score: 485 },
    { week: 2, total_civ: 1180000, total_cc: 79000, total_atl: 29000, avg_score: 492 },
    // ... weeks 3-51
    { week: 52, total_civ: 1340000, total_cc: 91000, total_atl: 35000, avg_score: 501 }
  ],
  yearlyTotals: {
    total_promotions: 78000,
    total_civ: 649000000,
    total_cc: 44200000,
    total_atl: 16700000,
    avg_score: 488
  },
  seasonality: {
    peak_weeks: [47, 48, 49, 50], // Holiday season
    low_weeks: [2, 3, 4],          // Post-holiday slump
    trend: "seasonal_variation"
  }
}
```

---

### Priority 5-6: Monthly/Quarterly Rolling Windows

**User Need**: "Show me the last 4 weeks" or "Show me the current quarter"

**Strategy**: On-demand aggregation (acceptable to be slower for deep analysis)

**Database Approach**:
- Query 4-13 weeks from `promotions` table
- Aggregate on-the-fly (no pre-computation)
- Cache result for 24 hours

**Client Load**:
1. Fetch from `/api/promotions/range?start_week=44&end_week=47&entity=BRAND_001`
2. Size: ~250KB
3. Show loading indicator
4. Response time: < 2s

**User Experience**: **"Worth the wait for deep analysis"** - User understands this is comprehensive data

**Implementation Details**:
```javascript
// API Response Structure
{
  date_range: { start_week: 44, end_week: 47 },
  entity: "BRAND_001",
  aggregates: {
    total_promotions: 6000,
    total_civ: 50000000,
    total_cc: 3400000,
    total_atl: 1280000,
    avg_score: 487
  },
  weekly_breakdown: [
    { week: 44, metrics: { /* ... */ } },
    { week: 45, metrics: { /* ... */ } },
    { week: 46, metrics: { /* ... */ } },
    { week: 47, metrics: { /* ... */ } }
  ],
  trends: {
    direction: "improving",
    velocity: "moderate",
    notable_changes: [ /* significant week-over-week shifts */ ]
  }
}
```

---

## Database Schema

### Table 1: `promotions` (Raw Data)

**Purpose**: Store all individual promotion records

**Schema**:
```sql
CREATE TABLE promotions (
  -- Identity
  id VARCHAR(255) PRIMARY KEY,
  card_id VARCHAR(255) NOT NULL,
  upc VARCHAR(50),

  -- Temporal
  week INT NOT NULL,
  year INT NOT NULL,
  stage VARCHAR(50), -- 'post_publish', 'active', 'archived'

  -- Store Association
  store_codes VARCHAR[] NOT NULL, -- Array of store IDs

  -- Categorization
  marketing_category VARCHAR(100),
  department VARCHAR(100),
  deal_type VARCHAR(50),

  -- Product Information
  card_name VARCHAR(500),
  card_price DECIMAL(10,2),
  description TEXT,

  -- Placement
  card_size VARCHAR(20),
  width INT,
  height INT,
  position VARCHAR(50),
  page INT,
  page_position INT,

  -- Performance Metrics
  card_in_view BIGINT NOT NULL DEFAULT 0,
  card_clicked BIGINT NOT NULL DEFAULT 0,
  added_to_list BIGINT NOT NULL DEFAULT 0,
  share_count INT NOT NULL DEFAULT 0,
  composite_score INT NOT NULL,

  -- Rankings
  percentile INT,
  quartile VARCHAR(10), -- 'Q1', 'Q2', 'Q3', 'Q4'

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Indexes for fast queries
  INDEX idx_week_year (week, year),
  INDEX idx_store_codes USING GIN (store_codes),
  INDEX idx_week_category (week, marketing_category),
  INDEX idx_week_department (week, department),
  INDEX idx_composite_score (composite_score DESC)
);
```

**Storage Estimate**:
- 15,000-30,000 promotions per week
- 780,000-1,560,000 rows per year
- ~2-5GB per year with indexes

---

### Table 2: `weekly_aggregates` (Pre-Computed Nightly)

**Purpose**: Fast access to aggregated metrics for any entity/category/week combination

**Schema**:
```sql
CREATE TABLE weekly_aggregates (
  id SERIAL PRIMARY KEY,

  -- Dimensions
  week INT NOT NULL,
  year INT NOT NULL,
  entity_id VARCHAR(255) NOT NULL,  -- 'AllStores', 'BRAND_001', 'STORE_042', etc.
  entity_type VARCHAR(50) NOT NULL, -- 'AllStores', 'Brand', 'SubBrand', 'BrandGroup', 'SubGroup', 'Store'
  category VARCHAR(100),             -- NULL = all categories

  -- Aggregated Counts
  total_promotions INT NOT NULL,
  unique_products INT,
  unique_stores INT,

  -- Aggregated Metrics
  total_civ BIGINT NOT NULL,
  total_cc BIGINT NOT NULL,
  total_atl BIGINT NOT NULL,
  total_shares INT NOT NULL,

  -- Composite Score
  avg_score DECIMAL(10,2) NOT NULL,
  total_score BIGINT NOT NULL,

  -- Essential KPIs (Pre-Computed)
  engagement_rate DECIMAL(5,2),     -- (CC + ATL) / CIV × 100
  conversion_rate DECIMAL(5,2),     -- ATL / CC × 100
  share_velocity DECIMAL(8,4),      -- shares / promotions
  action_efficiency INT,             -- (ATL / CIV) × 10000

  -- Rankings
  top_quartile_count INT,            -- Count of Q1 promotions
  top_quartile_pct DECIMAL(5,2),    -- % in Q1
  bottom_quartile_count INT,         -- Count of Q4 promotions

  -- Metadata
  computed_at TIMESTAMP NOT NULL,

  -- Ensure unique combinations
  UNIQUE (week, year, entity_id, entity_type, category),

  -- Indexes for fast queries
  INDEX idx_week_year_entity (week, year, entity_id),
  INDEX idx_entity_type (entity_type),
  INDEX idx_category (category)
);
```

**Storage Estimate**:
- ~1,000 entities × ~20 categories × 52 weeks = ~1M rows per year
- Each row ~200 bytes = ~200MB per year
- Very manageable

---

### Table 3: `yoy_comparisons` (Pre-Computed for Fast YoY)

**Purpose**: Instant year-over-year comparisons for same week across multiple years

**Schema**:
```sql
CREATE TABLE yoy_comparisons (
  id SERIAL PRIMARY KEY,

  -- Dimensions
  week INT NOT NULL,
  years INT[] NOT NULL,              -- [2023, 2024, 2025]
  entity_id VARCHAR(255) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  category VARCHAR(100),

  -- Metrics by Year (JSONB for flexibility)
  metrics_by_year JSONB NOT NULL,
  /*
  Example structure:
  {
    "2023": { "total_civ": 11200000, "total_cc": 780000, ... },
    "2024": { "total_civ": 11850000, "total_cc": 812000, ... },
    "2025": { "total_civ": 12500000, "total_cc": 850000, ... }
  }
  */

  -- Pre-Computed Changes
  yoy_change_pct JSONB,
  /*
  Example:
  {
    "2024_vs_2023": { "civ": 5.8, "cc": 4.1, "atl": 4.6 },
    "2025_vs_2024": { "civ": 5.5, "cc": 4.7, "atl": 7.4 }
  }
  */

  three_year_trend VARCHAR(20),      -- 'improving', 'declining', 'stable'

  -- Metadata
  computed_at TIMESTAMP NOT NULL,

  UNIQUE (week, entity_id, category),

  INDEX idx_week (week),
  INDEX idx_entity (entity_id)
);
```

**Storage Estimate**:
- 52 weeks × ~1,000 entities × ~20 categories = ~1M rows total (cumulative across all years)
- JSONB compression keeps size manageable
- ~300MB total

---

## Nightly Pre-Computation Jobs

All jobs run overnight when user traffic is minimal.

### Job 1: Weekly Aggregates Computation

**Schedule**: Every night at 2:00 AM
**Duration**: 15-30 minutes
**Priority**: High

**Process**:
```sql
-- Pseudo-SQL for weekly aggregates job

-- Step 1: Clear today's aggregates (in case of re-run)
DELETE FROM weekly_aggregates
WHERE computed_at::DATE = CURRENT_DATE;

-- Step 2: Compute aggregates for current week
INSERT INTO weekly_aggregates (
  week, year, entity_id, entity_type, category,
  total_promotions, total_civ, total_cc, total_atl, total_shares,
  avg_score, total_score,
  engagement_rate, conversion_rate, share_velocity, action_efficiency,
  top_quartile_count, top_quartile_pct, bottom_quartile_count,
  computed_at
)
SELECT
  p.week,
  p.year,
  'AllStores' AS entity_id,
  'AllStores' AS entity_type,
  p.marketing_category AS category,

  COUNT(*) AS total_promotions,
  SUM(p.card_in_view) AS total_civ,
  SUM(p.card_clicked) AS total_cc,
  SUM(p.added_to_list) AS total_atl,
  SUM(p.share_count) AS total_shares,

  AVG(p.composite_score) AS avg_score,
  SUM(p.composite_score) AS total_score,

  ((SUM(p.card_clicked) + SUM(p.added_to_list))::DECIMAL / NULLIF(SUM(p.card_in_view), 0) * 100) AS engagement_rate,
  (SUM(p.added_to_list)::DECIMAL / NULLIF(SUM(p.card_clicked), 0) * 100) AS conversion_rate,
  (SUM(p.share_count)::DECIMAL / COUNT(*)) AS share_velocity,
  ((SUM(p.added_to_list)::DECIMAL / NULLIF(SUM(p.card_in_view), 0)) * 10000) AS action_efficiency,

  SUM(CASE WHEN p.quartile = 'Q1' THEN 1 ELSE 0 END) AS top_quartile_count,
  (SUM(CASE WHEN p.quartile = 'Q1' THEN 1 ELSE 0 END)::DECIMAL / COUNT(*) * 100) AS top_quartile_pct,
  SUM(CASE WHEN p.quartile = 'Q4' THEN 1 ELSE 0 END) AS bottom_quartile_count,

  CURRENT_TIMESTAMP AS computed_at
FROM promotions p
WHERE p.week = EXTRACT(WEEK FROM CURRENT_DATE)
  AND p.year = EXTRACT(YEAR FROM CURRENT_DATE)
GROUP BY p.week, p.year, p.marketing_category;

-- Step 3: Repeat for all entity types (brands, subbrands, groups, stores)
-- ... (similar queries with different entity filtering)

-- Step 4: Compute totals (category = NULL)
-- ... (similar query without GROUP BY category)
```

**Entities Computed**:
- AllStores (global)
- Each Brand
- Each SubBrand
- Each BrandGroup
- Each SubGroup
- Each Store

**Categories Computed**:
- Each marketing_category
- NULL (all categories combined)

**Total Combinations**: ~1,000 entities × 20 categories × 2 (with/without category) = ~40,000 rows per week

---

### Job 2: Year-over-Year Comparisons

**Schedule**: Every night at 3:00 AM
**Duration**: 10-15 minutes
**Priority**: Medium

**Process**:
```sql
-- For each week that exists in 2+ years
FOR each_week IN (1..52):
  FOR each_entity IN (entity_list):
    FOR each_category IN (category_list + NULL):

      -- Gather metrics for this week across all available years
      SELECT
        week,
        year,
        entity_id,
        category,
        total_civ,
        total_cc,
        total_atl,
        avg_score
      FROM weekly_aggregates
      WHERE week = each_week
        AND entity_id = each_entity
        AND (category = each_category OR (category IS NULL AND each_category IS NULL))
      ORDER BY year;

      -- Build JSONB structure
      -- Calculate YoY changes
      -- Determine 3-year trend

      -- Upsert into yoy_comparisons
      INSERT INTO yoy_comparisons (...)
      ON CONFLICT (week, entity_id, category) DO UPDATE ...
```

---

### Job 3: Redis Cache Warming

**Schedule**: Every night at 4:00 AM
**Duration**: 5 minutes
**Priority**: Low

**Process**:
```javascript
// Pre-generate JSON responses for most common queries

// Cache current week for AllStores
const currentWeekData = await fetchFromDB('/api/promotions/current');
redis.set('api:promotions:current', JSON.stringify(currentWeekData), 'EX', 86400); // 24-hour TTL

// Cache week-over-week for AllStores
const wowData = await fetchFromDB('/api/promotions/wow');
redis.set('api:promotions:wow', JSON.stringify(wowData), 'EX', 86400);

// Cache top brands current week
for (const brand of topBrands) {
  const brandData = await fetchFromDB(`/api/promotions/current?entity=${brand.id}`);
  redis.set(`api:promotions:current:${brand.id}`, JSON.stringify(brandData), 'EX', 86400);
}
```

---

## API Endpoint Design

All endpoints return JSON. All timestamps in ISO 8601 format.

### Endpoint 1: Current Week

**URL**: `GET /api/promotions/current`

**Query Parameters**:
- `entity` (optional): Entity ID (default: "AllStores")
- `category` (optional): Filter by marketing_category

**Response Time**: < 100ms

**Response**:
```json
{
  "week": 47,
  "year": 2025,
  "entity": {
    "id": "AllStores",
    "type": "AllStores",
    "name": "All Stores"
  },
  "aggregates": {
    "total_promotions": 1500,
    "total_civ": 12500000,
    "total_cc": 850000,
    "total_atl": 320000,
    "total_shares": 15000,
    "avg_score": 485.2,
    "engagement_rate": 9.36,
    "conversion_rate": 37.65,
    "share_velocity": 0.01,
    "action_efficiency": 256,
    "top_quartile_pct": 28.0
  },
  "categories": [
    {
      "name": "featured_deals",
      "count": 180,
      "metrics": {
        "total_civ": 2100000,
        "total_cc": 145000,
        "total_atl": 58000,
        "avg_score": 512
      }
    }
    // ... more categories
  ],
  "topPerformers": [
    {
      "id": "PROMO_12345",
      "name": "Ribeye Steak BOGO",
      "category": "featured_deals",
      "composite_score": 875,
      "percentile": 98
    }
    // ... top 10
  ],
  "bottomPerformers": [
    // ... bottom 10
  ],
  "metadata": {
    "computed_at": "2025-11-29T02:15:30Z",
    "data_freshness": "nightly"
  }
}
```

---

### Endpoint 2: Week-over-Week Comparison

**URL**: `GET /api/promotions/wow`

**Query Parameters**:
- `entity` (optional): Entity ID (default: "AllStores")

**Response Time**: < 200ms

**Response**:
```json
{
  "current": {
    "week": 47,
    "year": 2025,
    "aggregates": { /* ... */ }
  },
  "previous": {
    "week": 46,
    "year": 2025,
    "aggregates": { /* ... */ }
  },
  "changes": {
    "civ_change_pct": 12.5,
    "cc_change_pct": -3.2,
    "atl_change_pct": 8.1,
    "avg_score_change": 15,
    "engagement_rate_change": 0.8
  },
  "trending": {
    "improving_categories": [
      { "name": "fresh_market", "score_increase": 45 }
    ],
    "declining_categories": [
      { "name": "beverages_snacks", "score_decrease": -12 }
    ]
  }
}
```

---

### Endpoint 3: Year-over-Year Comparison

**URL**: `GET /api/summaries/yoy`

**Query Parameters**:
- `week` (required): Week number (1-52)
- `years` (required): Comma-separated years (e.g., "2023,2024,2025")
- `entity` (optional): Entity ID (default: "AllStores")
- `category` (optional): Filter by category

**Response Time**: < 500ms

**Response**:
```json
{
  "week": 47,
  "entity": "AllStores",
  "years": {
    "2023": {
      "total_promotions": 1380,
      "total_civ": 11200000,
      "avg_score": 468
    },
    "2024": {
      "total_promotions": 1420,
      "total_civ": 11850000,
      "avg_score": 477
    },
    "2025": {
      "total_promotions": 1500,
      "total_civ": 12500000,
      "avg_score": 485
    }
  },
  "trends": {
    "yoy_growth": {
      "2024_vs_2023": { "civ": 5.8, "avg_score": 1.9 },
      "2025_vs_2024": { "civ": 5.5, "avg_score": 1.7 }
    },
    "three_year_trend": "improving"
  }
}
```

---

### Endpoint 4: Full Year Summary

**URL**: `GET /api/summaries/yearly`

**Query Parameters**:
- `year` (required): Year (e.g., 2025)
- `entity` (optional): Entity ID (default: "AllStores")

**Response Time**: < 1s

**Response**:
```json
{
  "year": 2025,
  "entity": "AllStores",
  "weeks": [
    { "week": 1, "total_civ": 1250000, "avg_score": 485 },
    // ... 52 weeks
  ],
  "yearlyTotals": {
    "total_promotions": 78000,
    "total_civ": 649000000,
    "avg_score": 488
  },
  "seasonality": {
    "peak_weeks": [47, 48, 49, 50],
    "low_weeks": [2, 3, 4]
  }
}
```

---

### Endpoint 5: Custom Date Range

**URL**: `GET /api/promotions/range`

**Query Parameters**:
- `start_week` (required): Starting week number
- `end_week` (required): Ending week number
- `entity` (optional): Entity ID (default: "AllStores")
- `year` (optional): Year (default: current year)

**Response Time**: < 2s

**Response**:
```json
{
  "date_range": { "start_week": 44, "end_week": 47 },
  "entity": "BRAND_001",
  "aggregates": {
    "total_promotions": 6000,
    "total_civ": 50000000,
    "avg_score": 487
  },
  "weekly_breakdown": [
    { "week": 44, "metrics": { /* ... */ } },
    { "week": 45, "metrics": { /* ... */ } },
    { "week": 46, "metrics": { /* ... */ } },
    { "week": 47, "metrics": { /* ... */ } }
  ]
}
```

---

## Client-Side Strategy

### On Dashboard Load

**Timeline**:
```
0ms     - User navigates to dashboard
50ms    - Show loading indicator
100ms   - Fetch /api/promotions/current completes
150ms   - Display data (KPI strip, category list)
200ms   - Pre-fetch /api/promotions/wow in background
250ms   - Cache both responses in IndexedDB
```

**Code Example**:
```javascript
async function initDashboard() {
  // Show loading state
  showLoadingIndicator();

  // Fetch current week (priority)
  const currentWeek = await fetch('/api/promotions/current').then(r => r.json());

  // Display immediately
  renderDashboard(currentWeek);
  hideLoadingIndicator();

  // Pre-fetch WoW comparison in background
  fetch('/api/promotions/wow')
    .then(r => r.json())
    .then(wow => cacheInIndexedDB('wow', wow));

  // Cache current week
  cacheInIndexedDB('current', currentWeek);
}
```

---

### On Entity Selection

**No network call needed** - filter in memory

**Timeline**:
```
0ms     - User clicks on entity (e.g., a specific store)
5ms     - Filter current week data by entity
25ms    - Recalculate aggregates client-side
50ms    - Update UI
```

**Code Example**:
```javascript
function selectEntity(entityId) {
  // Filter in-memory (no API call)
  const entityData = currentWeekData.filter(promo =>
    matchesEntity(promo, entityId)
  );

  // Aggregate client-side
  const aggregates = calculateAggregates(entityData);

  // Update UI
  updateDashboard(aggregates);

  // Total time: < 50ms
}
```

---

### On Date Selection

**Check cache first, fetch if needed**

**Timeline**:
```
0ms     - User selects different week
10ms    - Check IndexedDB cache
  IF CACHED:
    50ms    - Load from cache, display
  IF NOT CACHED:
    300ms   - Fetch from API
    350ms   - Cache in IndexedDB
    400ms   - Display
```

**Code Example**:
```javascript
async function selectWeek(weekNumber) {
  // Check cache
  const cached = await getFromIndexedDB(`week_${weekNumber}`);

  if (cached) {
    renderDashboard(cached); // < 50ms
  } else {
    showLoadingIndicator();
    const data = await fetch(`/api/promotions/week?week=${weekNumber}`).then(r => r.json());
    await cacheInIndexedDB(`week_${weekNumber}`, data);
    renderDashboard(data);
    hideLoadingIndicator(); // ~300-400ms
  }
}
```

---

### IndexedDB Caching Strategy

**What to Cache**:
- Current week (always)
- Previous 4 weeks (opportunistic)
- Any user-selected weeks (on-demand)

**Cache Duration**:
- Current week: Until next week starts
- Historical weeks: Indefinite (immutable)

**Cache Invalidation**:
```javascript
// Clear current week cache at midnight Sunday
if (isNewWeek()) {
  deleteFromIndexedDB('current');
  deleteFromIndexedDB('wow');
}
```

---

## Performance Guarantees

### Response Time SLAs

| Operation | 90th Percentile | 99th Percentile | Strategy |
|-----------|----------------|----------------|----------|
| Initial page load | < 500ms | < 1s | Pre-cached current week |
| Entity selection | < 50ms | < 100ms | Client-side filter |
| Current week view | < 100ms | < 200ms | Redis cache hit |
| Week-over-week | < 200ms | < 400ms | Pre-computed aggregates |
| Year-over-year | < 500ms | < 1s | Pre-computed YoY table |
| Full year summary | < 1s | < 2s | Aggregates table query |
| Quarterly view | < 2s | < 3s | On-demand aggregation |

### Success Criteria

**Performance**:
- Zero timeout errors (< 0.01% error rate)
- 95% of queries complete in < 500ms
- Database query time < 100ms for pre-computed tables

**User Experience**:
- < 2% bounce rate on dashboard load
- > 80% of sessions include entity changes (indicates engagement)
- Average session duration > 5 minutes (deep analysis)

**System Health**:
- Nightly jobs complete before 5 AM
- Database size < 20GB per year
- API server CPU < 50% during peak hours

---

## Scalability Projections

### Current Scale Estimates

**Promotions**:
- 500-1,000 stores (Note: Exact count changes, using conservative estimates)
- 30 promotions per store per week
- 15,000-30,000 promotions per week
- 780,000-1,560,000 promotions per year

**Entities**:
- ~50 brands
- ~200-500 subbrands
- ~50-100 groups (brand + subbrand level)
- ~500-1,000 stores
- Total: ~1,000 unique entities

**Categories**:
- ~20 marketing categories
- ~15 departments

### Database Growth

**Year 1**:
- `promotions`: 780K-1.56M rows (~3-5GB)
- `weekly_aggregates`: 40K rows per week × 52 weeks = 2.08M rows (~400MB)
- `yoy_comparisons`: Minimal (only one year)
- **Total**: ~5-10GB

**Year 3**:
- `promotions`: 2.34M-4.68M rows (~10-15GB)
- `weekly_aggregates`: 6.24M rows (~1.2GB)
- `yoy_comparisons`: ~1M rows (~300MB)
- **Total**: ~15-20GB

**Totally manageable with PostgreSQL** - no special scaling required for 5+ years

### API Load Projections

**Concurrent Users**: 50-100 during peak hours

**Queries per Second**:
- Peak: ~50 QPS
- Average: ~10 QPS
- Nightly jobs: 0 QPS (no user traffic)

**PostgreSQL can easily handle** this load with proper indexing

---

## Technology Recommendations

### Database: PostgreSQL 15+

**Why PostgreSQL**:
- ✅ Excellent for complex aggregations
- ✅ JSONB support for flexible metrics storage
- ✅ Array column support (for `store_codes`)
- ✅ Proven at this scale (handles millions of rows easily)
- ✅ Strong indexing capabilities (B-tree, GIN for arrays)

**Configuration**:
```
shared_buffers = 4GB
effective_cache_size = 12GB
work_mem = 64MB
maintenance_work_mem = 1GB
```

---

### Caching: Redis 7+

**Why Redis**:
- ✅ Sub-millisecond response times
- ✅ Perfect for JSON caching
- ✅ TTL support for automatic expiration
- ✅ Minimal memory footprint

**What to Cache**:
- Current week JSON (~100KB) - 24-hour TTL
- WoW comparison JSON (~150KB) - 24-hour TTL
- Top brands current week - 24-hour TTL

**Memory Requirement**: < 100MB

---

### API: Node.js + Express OR Python + FastAPI

**Node.js + Express**:
- ✅ Fast JSON serialization
- ✅ Good PostgreSQL drivers (pg, node-postgres)
- ✅ Easy async/await
- ✅ Large ecosystem

**Python + FastAPI**:
- ✅ Excellent for data processing
- ✅ Strong typing with Pydantic
- ✅ Auto-generated API docs
- ✅ Good PostgreSQL support (psycopg3, asyncpg)

**Recommendation**: Either works well - choose based on team expertise

---

### Client: IndexedDB for Offline Caching

**Why IndexedDB**:
- ✅ Large storage capacity (GBs available)
- ✅ Asynchronous API
- ✅ Works offline
- ✅ Structured data storage

**What to Cache Client-Side**:
- Current + previous 4 weeks
- Entity hierarchy (brands, subbrands, stores)
- User preferences

---

## Implementation Roadmap

### Phase 1: MVP - Priority 1 & 2 (Weeks 1-2)

**Goal**: Current week + Week-over-week working perfectly

**Tasks**:
1. Create PostgreSQL database schema
   - `promotions` table
   - `weekly_aggregates` table
   - All indexes
2. Implement nightly aggregation job (Job 1)
   - Compute for current + previous week only
3. Build API endpoints
   - `/api/promotions/current`
   - `/api/promotions/wow`
4. Implement Redis caching
5. Build client-side IndexedDB caching
6. Test performance (<100ms for current week)

**Success Criteria**:
- ✅ Dashboard loads in < 100ms
- ✅ WoW comparison in < 200ms
- ✅ Entity selection in < 50ms

---

### Phase 2: Historical Data - Priority 3 & 4 (Weeks 3-4)

**Goal**: YoY and yearly views working

**Tasks**:
1. Backfill `weekly_aggregates` for last 52 weeks
2. Create `yoy_comparisons` table
3. Implement nightly YoY job (Job 2)
4. Build API endpoints
   - `/api/summaries/yoy`
   - `/api/summaries/yearly`
5. Test performance (< 500ms for YoY)

**Success Criteria**:
- ✅ YoY comparison loads in < 500ms
- ✅ Full year summary in < 1s

---

### Phase 3: Flexible Ranges - Priority 5 & 6 (Week 5)

**Goal**: Custom date ranges working

**Tasks**:
1. Implement on-demand aggregation logic
2. Build API endpoint
   - `/api/promotions/range`
3. Add progressive loading UI
4. Test performance (< 2s acceptable)

**Success Criteria**:
- ✅ Quarterly view loads in < 2s
- ✅ Monthly view loads in < 2s
- ✅ Loading indicators show progress

---

### Phase 4: Optimization (Week 6)

**Goal**: Fine-tune for production

**Tasks**:
1. Performance profiling
2. Query optimization
3. Index tuning
4. Cache hit rate optimization
5. Load testing (100 concurrent users)

**Success Criteria**:
- ✅ 99th percentile < 2s for all queries
- ✅ Database CPU < 50% under load
- ✅ Redis cache hit rate > 90%

---

## Future Considerations

### SQL Migration Scripts

**Note**: SQL migration scripts for PostgreSQL schema creation will be created in a future document when implementation begins.

**Will Include**:
- CREATE TABLE statements
- CREATE INDEX statements
- Sample data inserts for testing
- Migration rollback scripts

---

### Real-Time Updates

**Current Architecture**: Nightly batch updates
**Future Enhancement**: Real-time streaming for current week

**Approach**:
- WebSocket connection for current week updates
- Server pushes updates every 15 minutes
- Client updates dashboard without refresh

---

### Data Export

**Future Feature**: Export capabilities

**Formats**:
- CSV for Excel analysis
- PDF for reporting
- JSON for API integration

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-29 | System Architect | Initial performance architecture |

---

**END OF DOCUMENT**
