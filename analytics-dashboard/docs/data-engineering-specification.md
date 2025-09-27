# Data Engineering Specification - Prototype_003
## Analytics Dashboard Data Requirements

### Overview
This document specifies the exact data structure and API endpoints that data engineers must implement to support the enhanced analytics dashboard (Prototype_003). The specification is based on realistic grocery retail circular interaction patterns.

---

## 1. Core Data Table: `circular_interactions`

This is the primary data source that corresponds to the **Sedanos Circular Interaction spreadsheet** structure.

### Required Schema

```sql
CREATE TABLE circular_interactions (
    -- Primary Identifiers
    week_id VARCHAR(10) NOT NULL,                -- e.g., 'w36', 'w37'
    card_id VARCHAR(20) NOT NULL,                -- Unique promotion card identifier
    store_id VARCHAR(10) NOT NULL,               -- Store identifier

    -- Store Information
    store_name VARCHAR(100) NOT NULL,            -- Human-readable store name
    store_region VARCHAR(50),                    -- Geographic region
    store_tier VARCHAR(10),                      -- Store performance tier (A+, A, B, C)

    -- Product Information
    category VARCHAR(100) NOT NULL,              -- Product category
    card_name VARCHAR(200) NOT NULL,             -- Promotion title/product name
    card_deal_price DECIMAL(10,2),               -- Promotional price
    card_deal_unit VARCHAR(20),                  -- Unit of measure (lb, each, pack)
    deal_type VARCHAR(50),                       -- Type of deal (BOGO, % Off, etc.)

    -- Layout Information
    card_size_code VARCHAR(10) NOT NULL,         -- Size code (1X1, 2X1, 3X2, etc.)
    card_width INTEGER NOT NULL,                 -- Grid width units
    card_height INTEGER NOT NULL,                -- Grid height units
    card_footprint INTEGER NOT NULL,             -- Total area (width × height)
    position_x INTEGER,                          -- X coordinate in grid
    position_y INTEGER,                          -- Y coordinate in grid
    position_quartile VARCHAR(20),               -- Position quartile (Top, Upper Mid, Lower Mid, Bottom)

    -- Core Engagement Metrics
    impressions INTEGER NOT NULL DEFAULT 0,      -- Total impressions
    views INTEGER NOT NULL DEFAULT 0,            -- Users who viewed the card
    clicks INTEGER NOT NULL DEFAULT 0,           -- Users who clicked the card
    add_to_list INTEGER NOT NULL DEFAULT 0,      -- Users who added to shopping list
    shares INTEGER NOT NULL DEFAULT 0,           -- Users who shared the promotion
    expanded_views INTEGER DEFAULT 0,            -- Users who expanded card details

    -- Calculated Rates (can be computed or stored)
    view_rate DECIMAL(5,4),                      -- views / impressions
    click_rate DECIMAL(5,4),                     -- clicks / views
    atl_rate DECIMAL(5,4),                       -- add_to_list / clicks
    share_rate DECIMAL(5,4),                     -- shares / add_to_list
    engagement_score INTEGER,                    -- Composite engagement score (0-100)

    -- Timestamps
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Constraints
    PRIMARY KEY (card_id, week_id, store_id),
    INDEX idx_week_store (week_id, store_id),
    INDEX idx_category (category),
    INDEX idx_engagement (engagement_score DESC)
);
```

### Sample Data Format

```json
{
    "week_id": "w36",
    "card_id": "CARD_0001",
    "store_id": "ST001",
    "store_name": "Miami Lakes",
    "store_region": "North",
    "store_tier": "A",
    "category": "Featured",
    "card_name": "USDA Choice Beef Chuck Steak",
    "card_deal_price": 4.99,
    "card_deal_unit": "lb",
    "deal_type": "Price Drop",
    "card_size_code": "2X1",
    "card_width": 2,
    "card_height": 1,
    "card_footprint": 2,
    "position_x": 1,
    "position_y": 2,
    "position_quartile": "Top",
    "impressions": 15420,
    "views": 2847,
    "clicks": 892,
    "add_to_list": 234,
    "shares": 12,
    "expanded_views": 1156,
    "view_rate": 0.1845,
    "click_rate": 0.3134,
    "atl_rate": 0.2623,
    "share_rate": 0.0513,
    "engagement_score": 78,
    "created_date": "2024-09-01T00:00:00Z",
    "last_updated": "2024-09-01T23:59:59Z"
}
```

---

## 2. API Endpoints

### 2.1 Core Data Endpoint

**GET** `/api/v1/circular-interactions`

**Query Parameters:**
- `week_id` (string): Filter by week (e.g., "w36")
- `store_id` (string): Filter by store
- `category` (string): Filter by category
- `card_size_code` (string): Filter by card size
- `deal_type` (string): Filter by deal type
- `limit` (integer): Limit results (default: 500)
- `offset` (integer): Pagination offset

**Response Format:**
```json
{
    "data": [
        // Array of circular_interaction records
    ],
    "total_count": 1250,
    "page_info": {
        "limit": 500,
        "offset": 0,
        "has_next": true
    },
    "metadata": {
        "week_id": "w36",
        "generated_at": "2024-09-27T10:30:00Z",
        "data_freshness": "2024-09-27T06:00:00Z"
    }
}
```

### 2.2 Dashboard KPIs Endpoint

**GET** `/api/v1/dashboard/kpis/{week_id}`

**Response Format:**
```json
{
    "week_performance": {
        "current": 92,
        "previous": 87,
        "change": 6,
        "status": "positive"
    },
    "top_categories": [
        {
            "name": "Featured",
            "score": 100,
            "change": 5
        },
        {
            "name": "Farm Fresh",
            "score": 96,
            "change": -2
        }
    ],
    "alerts": {
        "count": 3,
        "items": [
            {
                "name": "Beverages",
                "score": 26,
                "threshold": 40
            }
        ]
    },
    "daily_trend": {
        "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        "values": [15, 28, 42, 65, 78, 88, 92]
    },
    "quick_win": {
        "insight": "2X1 promotions in top position performing 40% better",
        "action": "Apply to underperforming beverages category"
    },
    "share_activity": {
        "current": 145,
        "previous": 129,
        "change": 12
    }
}
```

### 2.3 Year-to-Date Metrics Endpoint

**GET** `/api/v1/dashboard/ytd`

**Response Format:**
```json
{
    "traffic": 3200000,
    "visitors": 580000,
    "marketing_health": 87,
    "shopper_reach": 420000,
    "engagement_volume": 1650000,
    "add_to_list_total": 235000,
    "lift_from_promotions": 22.4,
    "roi_on_promotions": 4.2
}
```

### 2.4 Category Analytics Endpoint

**GET** `/api/v1/analytics/categories/{week_id}`

**Response Format:**
```json
{
    "categories": [
        {
            "name": "Featured",
            "total_impressions": 145000,
            "total_views": 28900,
            "total_clicks": 8670,
            "total_add_to_list": 2340,
            "total_shares": 156,
            "view_rate": 0.1993,
            "click_rate": 0.3001,
            "atl_rate": 0.2700,
            "avg_engagement_score": 85.2,
            "promotion_count": 24
        }
    ],
    "trends": [
        {
            "category": "Featured",
            "four_week_trend": [78.4, 81.2, 83.6, 85.2]
        }
    ],
    "insights": {
        "top_performer": {
            "category": "Featured",
            "score": 85.2,
            "insight": "Featured is your top performing category this week"
        }
    }
}
```

---

## 3. Data Processing Requirements

### 3.1 Real-time vs Batch Processing

**Real-time (within 5 minutes):**
- Core engagement metrics (views, clicks, add_to_list)
- Basic rate calculations
- Alert triggers

**Batch Processing (hourly):**
- Engagement score calculations
- Trend analysis
- Category rankings
- Performance comparisons

**Daily Processing:**
- Week-over-week comparisons
- YTD metric updates
- Insight generation

### 3.2 Data Quality Validations

```sql
-- Data quality checks to implement
-- 1. Engagement funnel validation
CHECK (views <= impressions)
CHECK (clicks <= views)
CHECK (add_to_list <= clicks)
CHECK (shares <= add_to_list)

-- 2. Rate consistency validation
CHECK (view_rate = views / impressions)
CHECK (click_rate = clicks / NULLIF(views, 0))
CHECK (atl_rate = add_to_list / NULLIF(clicks, 0))

-- 3. Engagement score validation
CHECK (engagement_score BETWEEN 0 AND 100)

-- 4. Required field validation
CHECK (card_id IS NOT NULL AND card_id != '')
CHECK (week_id IS NOT NULL AND week_id != '')
CHECK (category IS NOT NULL AND category != '')
```

### 3.3 Performance Optimizations

**Required Indexes:**
```sql
-- Performance indexes for common queries
CREATE INDEX idx_week_category_performance ON circular_interactions (week_id, category, engagement_score DESC);
CREATE INDEX idx_store_week_lookup ON circular_interactions (store_id, week_id);
CREATE INDEX idx_size_performance ON circular_interactions (card_size_code, engagement_score DESC);
CREATE INDEX idx_deal_type_analysis ON circular_interactions (deal_type, week_id);
CREATE INDEX idx_position_analysis ON circular_interactions (position_quartile, engagement_score DESC);
```

**Caching Strategy:**
- Dashboard KPIs: Cache for 15 minutes
- Category analytics: Cache for 30 minutes
- YTD metrics: Cache for 4 hours
- Raw interaction data: No caching (real-time required)

---

## 4. Data Sources Integration

### 4.1 Expected Input Sources

**Primary Source:** Sedanos Circular Interaction spreadsheet
- **Format:** Excel (.xlsx) with multiple tabs
- **Update Frequency:** Daily (morning refresh)
- **Key Tabs Expected:**
  - Main interaction data
  - Store master data
  - Category definitions
  - Size code mappings

**Secondary Sources:**
- Store performance tiers (from operations team)
- Product pricing data (from merchandising)
- Historical baselines (from data warehouse)

### 4.2 Data Transformation Pipeline

```python
# Expected ETL pipeline structure
def process_circular_interactions(source_file):
    """
    Process Sedanos circular interaction data
    """
    # 1. Extract data from Excel tabs
    raw_data = extract_excel_data(source_file)

    # 2. Validate data quality
    validated_data = validate_data_quality(raw_data)

    # 3. Calculate derived metrics
    enriched_data = calculate_engagement_metrics(validated_data)

    # 4. Load to database
    load_to_database(enriched_data)

    # 5. Trigger dashboard cache refresh
    refresh_dashboard_cache()
```

---

## 5. Monitoring and Alerts

### 5.1 Data Quality Monitoring

**Automated Checks:**
- Row count validation (expected range: 400-600 per week)
- Engagement funnel consistency
- Missing required fields
- Outlier detection (engagement scores > 95 or < 5)

**Alert Thresholds:**
- Data freshness > 6 hours
- Error rate > 5%
- Missing stores or categories
- Unexpected engagement patterns

### 5.2 Performance Monitoring

**API Response Times:**
- `/circular-interactions`: < 500ms for 500 records
- `/dashboard/kpis`: < 200ms
- `/analytics/categories`: < 300ms

**Database Performance:**
- Query execution time monitoring
- Index usage analysis
- Connection pool monitoring

---

## 6. Testing Data Sets

### 6.1 Sample Test Data

The mock data generator in `data/enhanced-mock-generator.js` provides realistic test data that matches this specification exactly. Use this for:

- Development environment setup
- API endpoint testing
- Frontend component validation
- Performance testing

### 6.2 Data Validation Scripts

```javascript
// Example validation for incoming data
function validateCircularInteractionRecord(record) {
    const required = ['week_id', 'card_id', 'store_id', 'category', 'card_name'];
    const missing = required.filter(field => !record[field]);

    if (missing.length > 0) {
        throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    // Engagement funnel validation
    if (record.views > record.impressions) {
        throw new Error('Views cannot exceed impressions');
    }

    if (record.clicks > record.views) {
        throw new Error('Clicks cannot exceed views');
    }

    // Engagement score validation
    if (record.engagement_score < 0 || record.engagement_score > 100) {
        throw new Error('Engagement score must be between 0 and 100');
    }

    return true;
}
```

---

## 7. Implementation Priority

### Phase 1: Core Infrastructure (Week 1)
1. Set up `circular_interactions` table
2. Implement basic `/circular-interactions` endpoint
3. Create data validation pipeline
4. Set up basic monitoring

### Phase 2: Dashboard APIs (Week 2)
1. Implement `/dashboard/kpis` endpoint
2. Create aggregation functions
3. Set up caching layer
4. Add error handling

### Phase 3: Advanced Analytics (Week 3)
1. Implement category analytics endpoint
2. Add YTD metrics calculation
3. Create insight generation algorithms
4. Performance optimization

### Phase 4: Production Readiness (Week 4)
1. Load testing and optimization
2. Comprehensive monitoring setup
3. Data quality automation
4. Documentation completion

---

This specification provides data engineers with everything needed to implement the backend services that will power the enhanced analytics dashboard. The structure matches realistic grocery retail data patterns and provides a seamless transition from prototype to production.