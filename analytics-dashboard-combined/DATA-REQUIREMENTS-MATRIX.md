# Analytics Dashboard — Data Requirements Matrix

Source of every datapoint the dashboard renders, grouped by section, with the specific chart/table it feeds. Use this to size warehouse scope, identify pipeline gaps, and confirm source ownership.

**Source legend**
- **Ad Platform** — DV360 / Google Ads / programmatic ad server (NEG-style reports)
- **placer.ai** — Panel data for competitor visits and traffic share
- **Attribution** — Internal chain: ad exposure → device ID → store visit
- **Admin Portal** — Internal PdB / ideal-sale-circular (entity hierarchy, competitor registry, campaign metadata)
- **POS / Loyalty** — Retailer transaction + loyalty systems (for visit attribution tiers)
- **Elise (provider)** — External data provider; weekly per-store + per-competitor commits
- **Demographic Enrichment** — Foot-traffic panel demographics (placer.ai or 3rd-party)

---

## Store Visitation

| Datapoint | Used In | Source | Grain | Cadence | Status / Gap |
|---|---|---|---|---|---|
| Gross visits per store | Stat strip (top), Store Performance table + bar view, Map popup, Visit Frequency donut total | placer.ai / Attribution | Store × Day | Daily | Committed weekly from Elise — need daily |
| New shopper visits (0 previous in 30d) | Donut segment "Zero Previous", Segment Breakdown card, Bar View blue segment, Map donut popup, Visit Frequency Over Time stacked bar (blue) | Attribution + POS/Loyalty | Store × Day × Visitor | Daily | Requires visitor-history lookup |
| Returning visits (1–3 previous in 30d) | Donut segment "1-3 Previous", Segment Breakdown card, Bar View amber segment, Map donut popup, Trend stacked bar (amber) | Attribution + POS/Loyalty | Store × Day × Visitor | Daily | Same as above |
| Loyal visits (4+ previous in 30d) | Donut segment "4+ Previous", Segment Breakdown card, Bar View green segment, Map donut popup, Trend stacked bar (green) | Attribution + POS/Loyalty | Store × Day × Visitor | Daily | Same as above |
| Week-over-week % change per segment | Segment Breakdown cards trend arrow, Stat strip trend indicator | Derived | Segment × Week | Weekly | Derivable |
| Visit frequency trend (weekly bars) | Visit Frequency Over Time chart (Trend view, all duration presets) | Aggregated from visits | Store × Week (or Day for 1-Week preset) | Weekly + Daily | Derivable once daily visits land |
| Visitor demographics — Age (7 buckets) | Demographics sub-tab: Age Distribution chart | Demographic Enrichment | Store × Week × Age Bucket | Weekly | Placer foot-traffic tab exists |
| Visitor demographics — Gender (3) | Demographics sub-tab: Gender chart | Demographic Enrichment | Store × Week × Gender | Weekly | Same |
| Visitor demographics — HH Income (20 buckets) | Demographics sub-tab: Household Income chart | Demographic Enrichment | Store × Week × Income Bucket | Weekly | Same |
| Visitor demographics — Presence of Children (2) | Demographics sub-tab: Presence of Children chart | Demographic Enrichment | Store × Week × Children | Weekly | Same |
| Visitor demographics — HH Size (10) | Demographics sub-tab: Household Size chart | Demographic Enrichment | Store × Week × HH Size | Weekly | Same |
| Visitor demographics — Homeowner Status (3) | Demographics sub-tab: Homeowner Status chart | Demographic Enrichment | Store × Week × Homeowner | Weekly | Same |
| Visitor demographics — Net Worth (10) | Demographics sub-tab: Net Worth chart | Demographic Enrichment | Store × Week × Net Worth Bucket | Weekly | Same |
| Visitor demographics — Marital Status (3) | Demographics sub-tab: Marital Status chart | Demographic Enrichment | Store × Week × Marital | Weekly | Same |
| Total unique visitors (denominator for demographic %) | Demographics subtitle "Demographic profile of N visitors", Bar label "% · count" | Aggregated | Store × Week | Weekly | Derivable |
| Competitive Crossover counts (0 / 1-3 / 4+ visits to each competitor by media-exposed users) | Competitive Crossover bar chart, Crossover detail table | Attribution + placer.ai | Store × Competitor × Week × Bucket | Weekly | Buckets: 0, 1–3, 4+ visits over 30 days |
| Store coordinates (lat/lng) | Visitation map pin placement, Proximity rings | Admin Portal | Store | Static | Already in PdB |
| Store metadata (store #, name, city, sub-brand) | Store Performance table, Map pin popup header, Entity selector | Admin Portal | Store | Static | Already in PdB |

---

## Media Buy

| Datapoint | Used In | Source | Grain | Cadence | Status / Gap |
|---|---|---|---|---|---|
| Impressions | Hero card "Impressions", Tree table "Impressions" column, By Creative / By Day / By Placement breakouts | Ad Platform | Campaign × Creative × Day × Placement | Daily | Live via NEG-style reports |
| Clicks | Tree table "Clicks" (More Data), By Day / By Creative breakouts | Ad Platform | Campaign × Creative × Day × Placement | Daily | Live |
| CTR | Hero card "CTR", Tree table "CTR" column, Creative card summary, All breakouts | Derived (Clicks / Impressions) | Campaign × Creative × Day | Daily | Derivable |
| Spend / Budget | Hero card "Budget", Tree table "Budget" (More Data) | Ad Platform | Campaign × Day | Daily | Live |
| CPM, CPC | Tree table "More Data" columns | Ad Platform | Campaign × Creative | Daily | Derivable |
| Conversions (ad → visit) | Creative card "Visits", Tree table "Visits" column, Visits/1K derivation | Attribution | Campaign × Creative × Day | Daily | Requires attribution pipeline |
| CPV (Cost Per Visit) | Hero card "CPV", Hero trend callout, Tree table "CPV" column | Derived (Spend / Visits) | Campaign × Creative | Weekly | Derivable once Conversions land |
| Visits per 1000 impressions | Tree table "V/1K" (More Data) | Derived | Creative × Week | Weekly | Derivable |
| Creative asset metadata (type [JPEG/GIF/VIDEO], dimensions, target URL) | Creative card header, badge, "See Link", Tree table thumbnail, Creative Coverage key | Admin Portal | Creative | Static per flight | **Must be built into admin portal [Adam prereq]** |
| Creative flight dates (start/end) | Creative card meta line, Tree table child rows | Admin Portal | Creative | Static | Must be built |
| Creative thumbnail image | Creative card thumb, Tree table row thumbnail | Admin Portal | Creative | Static | Must be built |
| Video quartile funnel (25/50/75/100%) | Video funnel chart inside variant panel | Ad Platform | Video Creative × Week | Daily | Live for video-enabled campaigns |
| Placement data (domain, app, env type APP/WEB) | By Placement breakout table | Ad Platform | Placement × Day | Daily | Live (NEG Tab 5) |
| Per-store per-creative delivery | Tree table child rows (store-level), Creative Coverage key counts | Ad Platform + Attribution | Store × Creative × Week | Weekly | Derivable |
| Creative ranking (by visits desc default) | Creative carousel order, Tree table sort | Derived | Campaign × Creative × Week | Weekly | Derivable |
| Historical creative performance (multi-week, multi-campaign) | **Phase 2+ — not in V2** | Warehouse | Creative × Week | Weekly | **[Adam, Phase 2+]** — needs durable creative ID across campaigns |

---

## Traffic Share

| Datapoint | Used In | Source | Grain | Cadence | Status / Gap |
|---|---|---|---|---|---|
| Total visits to our stores (all users, not just media-exposed) | Traffic Share combined chart (Total Visits Y-axis mode), Insight strip "Share %" denominator | placer.ai | Store × Day | Daily | Committed weekly — need daily [Elise, Ehren] |
| Total visits to competitor stores (all users) | Traffic Share combined chart stacked bars, Leaderboard, Competitor bars | placer.ai | Competitor × Day | Daily | Same pipeline need |
| Competitor store registry (IDs, names, locations, brands, parent retailer) | Competitor pins on traffic map, Leaderboard, 1v1 comparison panel, Top 5 + All Other rollup | Admin Portal | Competitor Store | Static | **Must be built [Adam prereq]** |
| Competitor traffic share % | Traffic Share chart (% Share Y-axis mode), Leaderboard, Insight strip | Derived | Market × Competitor × Week | Weekly | Derivable once store + competitor visits land |
| Share change week-over-week (pp) | Insight strip "Change pp", Leaderboard "By Change" sort, Tooltip "Gap" | Derived | Market × Week | Weekly | Derivable |
| Outperforming stores count | Insight strip "Outperforming" metric | Derived | Market × Week | Weekly | Derivable |
| Per-store traffic share vs. top 5 competitors + All Other | Traffic Share 100% stacked bars (per store), Leaderboard | placer.ai + Admin | Store × Competitor × Week | Weekly | Depends on competitor registry |
| Crossover Trend (media-attributed) | Crossover Trend line chart (moved from Visitation), Tooltip data | Attribution + placer.ai | Store × Competitor × Week | Weekly | Derivable |
| Store proximity rings (1/3/5 mi) | Map overlay circles around selected store | Derived (from lat/lng) | Store | Static | Derivable client-side |
| Distance between our store and competitor store | 1v1 comparison panel "Distance" metric | Derived (haversine on lat/lng) | Store × Competitor | Static | Derivable |
| 1v1 crossover detail (% of our visitors also visit this competitor) | 1v1 comparison panel, Map hover pin | Attribution + placer.ai | Store × Competitor × Week | Weekly | Joins crossover + distance + share |

---

## Cross-cutting / Metadata

| Datapoint | Used In | Source | Grain | Cadence | Status / Gap |
|---|---|---|---|---|---|
| Entity hierarchy (Brand → Sub-brand → Store Group → Store) | Entity selector modal (all pages), Context header, Tree table parent rows, All aggregations | Admin Portal | Entity | Static | Live in PdB (6-node system) |
| Flight weeks / date range config | Date selector (all pages), Week labels on charts, Context header | Admin Portal | Campaign | Static per flight | Live |
| Current date / week resolver | Default entity/week on page load, "Current" highlight on bars | System clock + Admin | N/A | Real-time | Live |
| User-defined groups for Compare | Entity selector modal "Groups" view | Admin Portal | Group | User-managed | Group setup in progress [Abdullah] |
| Date range presets (1 Week / 1 Month / 1 Quarter / 1 Year) | Duration presets on Visit Frequency Trend | App config | N/A | Static | Client-side only |
| Shareable URL state (week, entity, filters, date range) | Share button on all pages, Compare URL seeding | URL params | Request | On-demand | Implementation pending [Vinay] |

---

## Engagement (cross-reference — separate section, uses circular/promotion data)

| Datapoint | Used In | Source | Grain | Cadence | Status / Gap |
|---|---|---|---|---|---|
| Session time, sessions, events per session | Engagement landing metrics (stub — not yet built) | Web analytics / DC2 | Circular × Session | Per-session | **[Max, missing]** |
| Weighted engagement score (clicks ×10, add-to-list ×50) | Performance column bars (Weighted mode), Composite number | Derived | Promotion × Week | Weekly | Derivable once raw events land |
| Actual raw counts (views, clicks, add-to-list) | Performance column bars (Actual mode), Tooltips, Explore columns | Web analytics / DC2 | Promotion × Event × Session | Per-event | Live |
| Percentile rank | %TILE column (always visible) | Derived | Promotion × Week | Weekly | Derivable |
| Compare context (shared URL: week, entity, days, item) | Compare page Column A / B | URL params + Admin | Request | On-demand | Implementation pending [Vinay] |

---

## Infrastructure gaps blocking production

| Gap | Blocks (specific charts/tables) | Owner |
|---|---|---|
| Competitor store registry not in admin portal | Traffic Share map pins, Leaderboard, 1v1 comparison panel, Crossover joins | Admin Portal team |
| Media buying not in admin portal | Creative cards, Creative Coverage key, Tree table thumbnails, Target URL links | Admin Portal team |
| Daily traffic share data (currently weekly) | Traffic Share chart granularity, Trend presets below 1 week | Elise + Ehren |
| Attribution pipeline (ad → visit) | CPV metrics, Conversions, Visits column, Competitive Crossover | Data eng |
| Visitor history for new/returning/loyal tiers | Visit Frequency donut, Segment Breakdown cards, Bar View, Map donut popup, Trend chart | POS / Loyalty team |
| Creative ID stability across campaigns | Historical creative performance (Phase 2+) | Ad Platform config |

---

## Warehouse design implications

1. **Daily grain is the target** — aggregate up to weekly/monthly as needed. Don't lock to weekly-only — Max's Traffic Share toggle and duration presets need finer grain.
2. **Visitor-level history lookup** — new/returning/loyal classification requires a 30-day rolling window per visitor per store. Candidate for a pre-computed visitor-visit fact table.
3. **Entity + date range propagate everywhere** — every fact table needs `store_id`, `week_id` (or `date`), plus derivable `sub_brand_id`, `brand_id`.
4. **Competitor dimension is currently missing** — add a `competitor_store` dim aligned to placer.ai's POI IDs before Traffic Share can go live.
5. **Creative dimension needs a durable surrogate key** — so the same creative reused across flights rolls up cleanly for historical analysis.
