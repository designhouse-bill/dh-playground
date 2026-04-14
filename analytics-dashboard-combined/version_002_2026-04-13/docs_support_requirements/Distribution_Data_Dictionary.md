# Distribution Dashboard — Data Dictionary

Reference for every UI element, chart, table, and data point across the three Distribution sections.

---

## 1. Media Buy

> How efficiently are we spending our media budget, and what creative drove it?

### 1.1 Hero KPIs

| Data Point | Type | Definition |
|---|---|---|
| Cost Per Visit | Currency | Total media spend divided by total gross visits for the selected week/entity. The primary efficiency metric for the campaign. |
| Total Budget | Currency | Sum of all media budget allocated to stores in the current context. Should equal the sum of all creative-level budgets. |
| Stores | Count | Number of stores receiving media delivery in the current entity selection. |
| Impressions | Count + Trend | Total ad impressions served across all creatives. Trend compares current week to the first flight week. |
| Clicks | Count + Trend | Total ad clicks across all creatives. Trend compares current week to the first flight week. |
| Variants | Count | Number of distinct creative variants with data in the current context. |
| CTR | Percentage + Trend | Click-through rate (clicks / impressions). Trend shows percentage-point delta vs. first flight week. |
| Visits / 1,000 | Ratio + Trend | Gross store visits per 1,000 impressions served. Measures media-to-foot-traffic conversion efficiency. |

### 1.2 Performance Ranking (Creative Carousel)

| Data Point | Type | Definition |
|---|---|---|
| Rank | Ordinal | Creative ranked by gross visits (descending). Position indicates relative performance. |
| Creative Name | Label | Name and region parsed from the creative label (e.g., "Holiday Banner — Central FL"). |
| Type | Badge | Media format: JPEG, GIF, or VIDEO. |
| Date Range | Date | Flight start and end dates for this creative variant. |
| Stores | Count | Number of stores assigned to this creative's store group. |
| CTR | Percentage | Click-through rate for this creative across its assigned stores and current week. |
| Visits | Count | Gross store visits attributed to this creative. |
| Promotion Link | URL | Target URL the creative drives traffic to. |

### 1.3 Delivery Trends (Sparkline Cards)

| Data Point | Chart Type | Definition |
|---|---|---|
| Impressions | Sparkline | Weekly impression volume across all flight weeks. Shows delivery ramp-up or decay. |
| Clicks | Sparkline | Weekly click volume. Tracks engagement trajectory over the campaign. |
| CTR | Sparkline | Weekly click-through rate. Reveals whether engagement is improving or fatiguing. |
| Cost Per Visit | Sparkline | Weekly CPV. Downward trend signals improving efficiency; upward signals potential fatigue. |

### 1.4 Detailed Breakdown (Tree Table)

**Parent rows** = creative-level aggregates. **Child rows** = per-store breakdowns.

| Column | Type | Definition |
|---|---|---|
| # | Ordinal | Row number based on current sort order. |
| Creative | Label | Creative name and region. Parent rows are expandable to reveal per-store data. |
| Type | Badge | Media format (JPEG, GIF, VIDEO). |
| Stores | Count | Number of stores assigned to this creative. Hidden when viewing a single store. |
| CTR | Percentage | Click-through rate for this creative (or store). |
| Visits | Count | Gross store visits attributed to media exposure. |
| CPV | Currency | Cost per visit — budget divided by visits. Lower is more efficient. |
| Impr | Count | Total impressions served. |
| Clicks | Count | Total clicks on the ad unit. |
| Budget | Currency | Media budget allocated. All creative budgets should sum to the hero Total Budget. |
| V/1K | Ratio | Visits per 1,000 impressions. Measures conversion efficiency independent of budget. |
| Link | URL | Target URL (parent = creative URL; child = geo-targeted store URL). |

### 1.5 Video Funnel (expanded detail for VIDEO creatives)

| Data Point | Type | Definition |
|---|---|---|
| Complete Views | Count | Number of users who watched the video to completion (100% view-through). |
| Completion Rate | Percentage | Ratio of complete views to total video starts. Measures creative engagement quality. |
| Avg Circular Time | Duration | Average time users spent browsing the digital circular after clicking through from the video. |
| Circular Views | Count | Number of digital circular page views driven by this video creative. |

---

## 2. Store Visitation

> How many people did our media drive to our stores, and what kind of shoppers were they?

### 2.1 Hero KPIs

| Data Point | Type | Definition |
|---|---|---|
| Cost Per Visit | Currency | Total budget divided by gross visits. Same formula as Media Buy but scoped to visitation records. |
| Total Budget | Currency | Total media spend for the current week/entity context. |
| Gross Visits | Count + Trend | Total store visits attributed to media exposure. Trend compares to the first flight week. |
| Zero Previous | Count + Trend | Visitors with zero visits in the prior 30-day lookback window. Represents net-new foot traffic. |
| 1-3 Previous | Count + Trend | Visitors with 1-3 prior visits in the lookback window. Returning but not yet habitual. |
| 4+ Previous | Count + Trend | Visitors with 4+ prior visits. Loyal, repeat shoppers reinforced by media. |
| Visits / 1,000 | Ratio + Trend | Gross visits per 1,000 impressions. Identical formula to Media Buy V/1K. |
| New Shoppers | Percentage | Zero-previous visits as a share of gross visits. Measures conquest effectiveness. |

### 2.2 Visit Frequency (Donut Chart) — Current View

| Segment | Color | Definition |
|---|---|---|
| Zero Previous (30d) | Blue #4272D8 | New shoppers — no visits in the 30-day pre-campaign lookback. Largest segment = strong conquest. |
| 1-3 Previous | Amber #F59E0B | Returning shoppers — visited 1-3 times before. Media is reinforcing early loyalty. |
| 4+ Previous | Green #10B981 | Loyal shoppers — visited 4+ times before. Media is retaining high-value customers. |

**Center label:** Total gross visits for the current context.

### 2.3 Segment Breakdown (Detail Cards) — Current View

One card per frequency segment, each showing:

| Data Point | Type | Definition |
|---|---|---|
| Visits | Count | Absolute visit count for this shopper segment in the current week/entity. |
| Avg CPV | Currency | Average cost per visit for this segment. Calculated from budget proportional to segment share. |
| WoW Share | Delta (pp) | Week-over-week change in this segment's share of total visits. Positive = growing segment. |

### 2.4 Visit Frequency Over Time — Trend View

| Chart Element | Type | Definition |
|---|---|---|
| Stacked Bar Chart | Weekly bars | Each bar is split into Zero Previous (blue), 1-3 Previous (amber), and 4+ Previous (green). Height = total visits. |
| X-Axis | Week labels | Flight weeks (Wk 50, Wk 51, ..., Wk 2). |
| Y-Axis | Visit count | Total visits scale. |

Shows how the loyalty mix shifts over the campaign — ideally, the Zero Previous (conquest) segment grows or holds steady.

### 2.5 Crossover Trend — Trend View

| Chart Element | Type | Definition |
|---|---|---|
| Line Chart | Multi-series | One line per competitor brand showing crossover percentage over time. |
| Crossover % | Percentage | Share of our store visitors who also visited a competitor location in the same period. |

Reveals whether competitor overlap is increasing (threat) or decreasing (loyalty consolidation).

### 2.6 Store Performance Table

| Column | Type | Definition |
|---|---|---|
| # | Ordinal | Row rank by current sort (default: visits descending). |
| Status | Badge | Store health classification — Strong (green), Watch (amber), or Critical (red). |
| Store | Label | Store number identifier (e.g., "Store 336"). |
| City | Label | Store city and state. |
| Visits | Count | Gross visits for this store in the current week. Sortable. |
| New Shoppers | Percentage | Zero-previous visits as % of store visits. Green if >= 40%, red if < 30%. |
| CPV | Currency | Cost per visit at this store. Green if <= $1.50, red if > $2.00. |
| 1-3 Prev | Count + % | Returning visitor count and share of store total. |
| 4+ Prev | Count + % | Loyal visitor count and share of store total. |
| Zero Prev | Count | Raw count of new shoppers (zero previous visits). |
| V/1K | Ratio | Visits per 1,000 impressions at this store. |

**"More Data" toggle** reveals columns 7-11 (CPV through V/1K).

### 2.7 Store Performance Map

| Element | Type | Definition |
|---|---|---|
| Green pin | Map marker | Store classified as Strong — outperforming campaign average. |
| Amber pin | Map marker | Store classified as Watch — near average, mixed signals. |
| Red pin | Map marker | Store classified as Critical — underperforming, needs attention. |

Clicking a table row zooms the map to that store. Clicking a pin highlights the table row.

### 2.8 Status Definitions

| Status | Threshold | Definition |
|---|---|---|
| Strong | New Shoppers >= 40% | Outperforming the campaign average on visits and new shopper acquisition. These stores are driving the most efficient media-to-visit conversion. |
| Watch | New Shoppers 30-40% | Performing near the campaign average but showing mixed signals. Visit volume or new shopper rate may be trending flat or slightly below target. |
| Critical | New Shoppers < 30% | Underperforming on key metrics relative to media spend. These stores may need creative rotation, budget reallocation, or competitive analysis. |

---

## 3. Traffic Share

> Are we gaining or losing foot traffic share from competitors over time?

### 3.1 Hero KPIs

| Data Point | Type | Definition |
|---|---|---|
| Traffic Share | Percentage | Retailer visits as a percentage of total visits (retailer + competitors) within each store's competitive trade area. |
| Share Change | Delta (pp) | Percentage-point change in traffic share from the first flight week to the current week. The headline outcome metric. |
| Stores | Count | Total stores in the current entity context. |
| Outperforming | Count + % | Number and percentage of stores where retailer growth exceeds competitor growth. |
| Growth Advantage | Percentage | Average growth rate differential (retailer growth minus competitor growth). Positive = outpacing competitors. |
| Retailer Growth | Percentage | Week-over-week visit growth rate for retailer stores. |
| Competitor Growth | Percentage | Week-over-week visit growth rate for competitor stores in the same trade areas. |
| Concentrated Markets | Count | Number of stores in highly concentrated competitive markets (high HHI). These markets are harder to shift. |

### 3.2 Traffic Share & Volume (Combo Chart)

| Chart Element | Type | Definition |
|---|---|---|
| Retailer Bars | Bar (green) | Weekly retailer visit volume. Height shows absolute foot traffic. |
| Competitor Bars | Bar (gray) | Weekly competitor visit volume in the same trade areas. |
| Share Line | Line (blue) | Weekly traffic share percentage. Overlaid on the bar chart with a secondary Y-axis. |
| Gap | Tooltip | Percentage-point gap between retailer and competitor share, shown on hover. |

Bars show volume context; the line shows whether share is trending up even if volume fluctuates (e.g., holidays).

### 3.3 Store Performance Table (Leaderboard)

| Column | Type | Definition |
|---|---|---|
| Store | Label | Store number identifier. |
| City | Label | Store city and state. |
| Share | Percentage | This store's traffic share within its competitive trade area. |
| Change | Delta (pp) | Week-over-week change in traffic share. Green = gaining, red = losing. |
| Status | Badge | Strong (green), Watch (amber), or Critical (red) based on share trajectory. |

**"Group by Status" toggle** — groups rows by Strong/Watch/Critical instead of rank order.

### 3.4 Store Performance Map

| Element | Type | Definition |
|---|---|---|
| Store pins | Map marker | Colored by status (green/amber/red). Click to highlight in table. |
| Competitor overlay | Toggle | Optional layer showing competitor store locations in the trade area. |
| Reset | Button | Returns map to default bounds showing all stores. |

### 3.5 Competitive Crossover & Threats

#### 3.5a Crossover Bar Chart

| Chart Element | Type | Definition |
|---|---|---|
| Horizontal Bars | Bar chart | One bar per competitor brand, length = crossover percentage. |
| Crossover % | Percentage | Share of our store visitors who also visited this competitor in the same period. Higher = more overlap. |

#### 3.5b Crossover Detail Tree Table

**Parent rows** = competitor brand. **Child rows** = individual competitor store locations.

| Column | Type | Definition |
|---|---|---|
| Competitor | Label | Competitor brand name (parent) or store address (child). Expandable. |
| Crossover % | Percentage | Share of retailer visitors who also visited this competitor. |
| Visits | Count | Total crossover visits (shoppers visiting both retailer and this competitor). |
| Stores Threatened | Count | Number of retailer stores where this competitor has significant overlap. |
| Trend | Delta (pp) | Week-over-week change in crossover percentage. Rising crossover = growing competitive threat. |

**Child rows** show individual competitor store addresses with their local threat percentage — the competitor's share of visits at that specific location.

---

## Shared Context Controls

These controls filter all data across every section on the current page.

| Control | Location | Definition |
|---|---|---|
| Date Selector | Context bar | Selects a single flight week or "All Weeks" (campaign totals). Default: most recent week. Amber "5 WKS" badge appears when All Weeks is active. |
| Entity Selector | Context bar | Filters to a specific level: All Stores, Sub-brand (Winn-Dixie / Harveys), Store Group, or individual Store. |
| Filter | Context bar | Stub — additional filters coming soon. |

---

## Glossary

| Term | Definition |
|---|---|
| CPV | Cost Per Visit — total budget divided by gross visits. |
| CTR | Click-Through Rate — clicks divided by impressions, expressed as a percentage. |
| V/1K | Visits per 1,000 impressions — measures how efficiently impressions convert to foot traffic. |
| Crossover | Percentage of retailer visitors who also visited a competitor location in the same period. |
| HHI | Herfindahl-Hirschman Index — market concentration measure. High HHI = fewer dominant players. |
| Flight Week | A single calendar week within the campaign period. |
| Lookback Window | 30-day period before the campaign used to classify visitor frequency (zero, 1-3, 4+ previous visits). |
| Trade Area | The competitive geography around each store, defined by overlapping shopper patterns. |
| Conquest | New shoppers with zero previous visits — customers acquired through the campaign. |
| pp | Percentage points — the arithmetic difference between two percentages (e.g., 35% → 40% = +5 pp). |
