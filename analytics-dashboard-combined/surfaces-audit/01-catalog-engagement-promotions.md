# Surfaces Catalog — Engagement Promotions (Layer 1, partial)

**Scope of this catalog:** `engagement-promotions.html` (Base), `engagement-promotions-proposed.html` (Proposed), `engagement-promotions-proposed-max.html` (Proposed-Max — **the new canonical**).

**Method:** Layer 1 inventory pass (Claude). No verdicts yet — that's Layer 2 (Bill). Use this to react and group.

**Status:** Partial. Broader scan needed across:
- Engagement: categories, circulars, compare, grid
- Distribution: visitation, media, traffic

**Reframing (2026-04-30):** Proposed-Max is canonical. Audit goal flips from "pick winner among 3" to "find everything in Base + other Engagement pages + Distribution that needs to be brought up to Proposed-Max's pattern level."

---

## Section A — Raw catalog (30 surfaces found across the 3 promotions pages)

### 1. Three-column layout (Base only)
- **Page(s):** Base
- **File:** `engagement-promotions.html` lines 170–288
- **Classes:** `.layout--promotions`, `.panel--left`, `.panel--center`, `.panel--right`
- **Purpose:** Three-panel split — left categories, center promotions, right detail
- **Data:** `{ categories: [], promotions: [], selectedPromo?: {} }`

### 2. Category list panel (left sidebar)
- **Page(s):** Base
- **File:** `engagement-promotions.html` lines 173–181
- **Classes:** `.panel--left`, `.category-list`
- **Purpose:** Scrollable list of categories with count badge
- **Data:** `{ categories: [{ id, name, count }] }`

### 3. Promotions data table (center panel — primary)
- **Page(s):** Base
- **File:** `engagement-promotions.html` lines 242–261
- **Classes:** `.promo-data-grid`, `.grid-pagination`
- **Purpose:** Multi-column ranked table w/ V/C/A metrics + pagination
- **Data:** `{ promotions: [{ id, name, category, views, clicks, adds, composite, rank }], page, pageSize }`

### 4. Promotion grid (card layout — Base, toggle-able)
- **Page(s):** Base
- **File:** `engagement-promotions.html` lines 239–244
- **Classes:** `.promotion-grid`
- **Purpose:** Card/grid view alternative to data table (Card View toggle)
- **Data:** `{ promotions: [{ id, name, category, views, clicks, adds, composite, cardSize }] }`

### 5. Right detail panel (Base detail sidebar)
- **Page(s):** Base
- **File:** `engagement-promotions.html` lines 265–286
- **Classes:** `.panel--right`, `.panel--collapsed`, `.detail-content`
- **Purpose:** Promotion details on row select
- **Data:** `{ selectedPromo: { id, name, category, views, clicks, adds, composite, stores: [], days: [] } }`

### 6. Panel header with controls (promotions center)
- **Page(s):** Base
- **File:** `engagement-promotions.html` lines 185–238
- **Classes:** `.panel-header--promotions`, `.panel-header__left/center/right`
- **Purpose:** Layer dropdown, More Data/Card View toggles, Top-N selector, export/print/share, count
- **Data:** `{ layer, topN, moreData, cardView }`

### 7. Date range selector (context card) — shared
- **Page(s):** All three
- **Files:** Base 116–130; Proposed 769–779; Proposed-Max 923–934
- **Classes:** `.context-card--date`, `.card-label`, `.card-value`, `.card-sub`
- **Purpose:** Week selector + range + YoY trend
- **Data:** `{ dateRange: { week, startDate, endDate }, trend }`

### 8. Entity selector (context card) — shared
- **Page(s):** All three
- **Files:** Base 132–147; Proposed 780–791; Proposed-Max 935–946
- **Classes:** `.context-card`, `.card-breadcrumb`, `.card-value`
- **Purpose:** Brand/Store/Group selector + breadcrumb + location count
- **Data:** `{ entity: { breadcrumb, name, locCount } }`

### 9. Filter chips strip — shared
- **Page(s):** All three
- **Files:** Base 149–157; Proposed 792–801; Proposed-Max 947–956
- **Classes:** `.filter-group`, `.filter-chips`, `.add-filter`
- **Purpose:** Applied filter pills + Add Filter button
- **Data:** `{ filters: [{ type, value, label }] }`

### 10. Metric overview strip (4-cell KPI hero+supporting)
- **Page(s):** Proposed, Proposed-Max
- **Files:** Proposed 844–865; Proposed-Max 1038–1059
- **Classes:** `.ep-overview-strip`, `.ep-overview-strip__cell`
- **Purpose:** Hero KPI + 3 supporting metrics
- **Data:** `{ metrics: [{ label, value, sub, isHero }] }`

### 11. Top promotions stacked bar list (overview panel)
- **Page(s):** Proposed, Proposed-Max
- **Files:** Proposed 868–872; Proposed-Max 1063–1070
- **Classes:** `.ep-overview-panel`, `.ep-mini-stacked`
- **Purpose:** Top 3–5 promotions ranked by composite, V/C/A stacked bars
- **Data:** `{ topPromotions: [{ rank, name, views, clicks, adds, composite }] }`

### 12. Top stores mini bar list (overview panel)
- **Page(s):** Proposed, Proposed-Max
- **Files:** Proposed 873–876; Proposed-Max 1071–1077
- **Classes:** `.ep-overview-panel`, `.ep-mini-bar`
- **Purpose:** Top stores ranked by views, single-color bars
- **Data:** `{ topStores: [{ rank, name, views }] }`

### 13. Day-of-week column chart (overview panel)
- **Page(s):** Proposed, Proposed-Max
- **Files:** Proposed 877–881; Proposed-Max 1078–1086
- **Classes:** `.ep-overview-panel`, `.ep-dow-chart`
- **Purpose:** 7-column stacked V/C/A
- **Data:** `{ dayOfWeek: [{ day, views, clicks, adds }] }`

### 14. Perf-tabs primary navigation
- **Page(s):** Proposed (entity-drill tabs); Proposed-Max (metric-first tabs)
- **Files:** Proposed 819–838; Proposed-Max 992–1008
- **Classes:** `.perf-tabs`, `.perf-tab`
- **Purpose:** Switch between dimensions/metrics
- **Data:** `{ activeDrill }`

### 15. KPI tile strip (Proposed-Max overview)
- **Page(s):** Proposed-Max
- **File:** Proposed-Max 1014–1035
- **Classes:** `.ep-kpi-strip`, `.ep-kpi-tile`
- **Purpose:** 4 clickable metric tiles that jump to metric tabs
- **Data:** `{ metrics: [{ label, value, unit, sub, jumpTarget }] }`

### 16. By-promotion chip drilldown (Proposed only)
- **Page(s):** Proposed
- **File:** Proposed 916–953
- **Classes:** `.ep-chips-row`, `.ep-chip`, `.ep-view-toggle`
- **Purpose:** Chip strip of all promotions + view toggle (Chips ↔ Table) + filter input
- **Data:** `{ promotions: [{ icon, name, meta, isActive }], viewMode }`

### 17. Chip detail header + 2-col content (Proposed only)
- **Page(s):** Proposed
- **File:** Proposed 938–952
- **Classes:** `.ep-detail-header`, `.ep-detail-cols`
- **Purpose:** Selected promotion header + 2-col (engagement by store + DoW)
- **Data:** `{ selectedChip: { name, views, clicks, adds, stores, dayOfWeek } }`

### 18. Ranked table (by promotion view — Proposed)
- **Page(s):** Proposed
- **File:** Proposed 955–974
- **Classes:** `.ep-ranked-table-wrap`, `.ep-ranked-table`, `.ep-perf-stacked`
- **Purpose:** Full 75-row table — Rank, Promotion, Category, V/C/A, Performance bar, Rank %
- **Data:** `{ promotions: [{ rank, name, category, views, clicks, adds, composite, percentile }] }`

### 19. Detail sidebar (right edge — Proposed/Proposed-Max)
- **Page(s):** Proposed, Proposed-Max
- **Files:** Proposed 1008–1027; Proposed-Max 1292–1311
- **Classes:** `.ep-detail-sidebar`, `.ep-detail-sidebar__body`
- **Purpose:** Fixed-position overlay w/ full promotion detail
- **Data:** `{ selectedPromo: { name, category, views, clicks, adds, composite, ... } }`

### 20. Stacked list by store (Proposed-Max — repeating across metric tabs)
- **Page(s):** Proposed-Max
- **Files:** Proposed-Max 1136–1137 (Sessions), 1182–1183 (Users), 1224–1225 (Duration), 1266–1267 (Card Events)
- **Classes:** `.ep-stacked-list`, `.ep-stacked-list__row`, `.ep-stacked-list__bar`
- **Purpose:** 9-row store list w/ rank + name + multi-segment bar + total. Colors vary per metric.
- **Data:** `{ stores: [{ rank, name, sub, seg1, seg2, seg3, total }] }`

### 21. Sub-tab strip (Proposed-Max — within each metric pane)
- **Page(s):** Proposed-Max
- **Files:** Proposed-Max 1124–1132 (Sessions, repeats per metric)
- **Classes:** `.ep-sub-tabs`, `.ep-sub-tab`, `.ep-sub-tab--data`
- **Purpose:** 4 sub-tabs per metric: By Store / By Day / Time Trend / Data
- **Data:** `{ activeSubTab }`

### 22. Hero-stat section header (Proposed-Max)
- **Page(s):** Proposed-Max
- **Files:** Proposed-Max 962–977 (Overview), 1114–1123 (Sessions, repeats)
- **Classes:** `.section-panel-header`, `.hero-stat`, `.narrative-header`
- **Purpose:** Colored accent header — title + narrative question + inline stat-strip
- **Data:** `{ section: { title, question, subtitle, statValue, statLabel } }`

### 23. Time trend line chart (Proposed-Max)
- **Page(s):** Proposed-Max
- **Files:** Proposed-Max 1146–1157 (Sessions, repeats per metric)
- **Classes:** `.ep-trend-toolbar`, `.ep-trend-ranges`, `.ep-sub-pane`
- **Purpose:** 13-week SVG line chart + range buttons (1W/4W/13W/1Y) + hover
- **Data:** `{ weeks: [], values: [], yMax, ySteps }`

### 24. Day-of-week column chart (Proposed-Max — within sub-pane)
- **Page(s):** Proposed-Max
- **Files:** Proposed-Max 1141–1142 (Users), 1227–1228 (Duration), 1272–1273 (Card Events)
- **Classes:** `.ep-sub-pane` (inline grid)
- **Purpose:** 7 columns Mon–Sun
- **Data:** `{ days: [{ d, n }] }`

### 25. Inline data table (Proposed-Max — Data sub-pane)
- **Page(s):** Proposed-Max
- **Files:** Proposed-Max 1135–1158 (JS-wired)
- **Classes:** `.ep-data-table thead/tbody`
- **Purpose:** Sortable table — rank/name/segments/total. Click row → sidebar.
- **Data:** `{ rows: [{ rank, name, seg1, seg2, seg3, total }], sortCol, sortDir }`

### 26. Perf-tabs scaffold (coming soon)
- **Page(s):** Proposed (By Circular / By Category / By Store / By Day tabs)
- **Files:** Proposed 899–1003
- **Classes:** `.ep-scaffold`, `.ep-scaffold__title`, `.ep-scaffold__body`
- **Purpose:** Placeholder card for future tabs
- **Data:** `{ status: 'coming-soon', title, description }`

### 27. MVP scope badge strip (Proposed-Max)
- **Page(s):** Proposed-Max
- **File:** Proposed-Max 983–987
- **Classes:** `.ep-mvp-strip`, `.ep-mvp-strip__badge`
- **Purpose:** Flag Phase 1 locked + Phase 2 deferred. Meta-surface, not data-facing.
- **Data:** `{ phase, locked, deferred }`

### 28. Cohort note badge
- **Page(s):** Proposed, Proposed-Max
- **Files:** Proposed 808–812; Proposed-Max 970–974
- **Classes:** `.ep-cohort-note`
- **Purpose:** Cohort definition (75 promotions · Brand · Week 47)
- **Data:** `{ cohort: { count, entity, period } }`

### 29. Panel legend (segment color key — per-panel)
- **Page(s):** Proposed, Proposed-Max
- **Files:** Proposed 166–172; Proposed-Max 308–313
- **Classes:** `.ep-perf-legend`, `.ep-perf-legend__item`, `.ep-perf-legend__dot` → **rename to `.ep-panel-legend*`** (Bill, 2026-04-30)
- **Purpose:** Per-panel color key for multi-segment bars/charts. Each panel declares its OWN segment meanings via this legend strip — there is no global "blue = X" rule. The legend is the source of truth for what the segments represent on that specific panel.
- **Engagement panels:** Views (blue `#4272D8`) / Clicks (yellow-green `#B8D64D`) / Adds (purple `#937DF8`)
- **Media Buy panels:** TBD per data binding (Impressions/Clicks/Conversions, or visitor-type new/returning/loyal)
- **Data:** legend metadata `{ segments: [{ name, color }] }`

### 30. Metric filter input (Proposed-Max — within sub-pane)
- **Page(s):** Proposed-Max
- **Files:** Proposed-Max 1996–2010 (JS-injected)
- **Classes:** `.ep-metric-filter`, `.ep-metric-filter__input`
- **Purpose:** Search/filter store list w/ count badge
- **Data:** `{ filterText, matchCount }`

---

## Section B — Similarity groups (purpose → impls)

### Group 1: Ranked-item lists (promotions/stores)
- **Base:** `.promo-data-grid` (multi-col table, eCharts hover)
- **Proposed:** `.ep-chips-row` → `.ep-ranked-table` (chip drilldown OR tabular)
- **Proposed-Max:** `.ep-stacked-list` (multi-segment bars)
- **Note:** Same logical thing rendered three ways. Base = density-first table. Proposed = explore-via-chips. Proposed-Max = metric-first stacked bars.
- **Threading question (Bill flagged):** Base table is production-grade. Proposed-Max needs it threaded in as "More Data" / Explore mode within the perf-tabs surface.

### Group 2: Metric overview headline
- **Base:** `.panel-header` w/ legend badges (header dense)
- **Proposed:** `.ep-overview-strip` + 3-up `.ep-overview-panel` grid
- **Proposed-Max:** `.hero-stat` + clickable `.ep-kpi-strip`
- **Note:** Headline KPI + supporting context, varying hierarchies. Proposed-Max adds narrative framing + nav.

### Group 3: Day-of-week breakdown
- **Base:** eCharts in detail panel (on selection)
- **Proposed:** SVG `.ep-dow-chart` (always-visible panel)
- **Proposed-Max:** Inline grid in `.ep-sub-pane` (per-metric tab)
- **Note:** Same 7-day stacked V/C/A. Position varies — detail-on-demand vs. panel vs. tab-pane.

### Group 4: Detail sidebar
- **Base:** `.panel--right` (CSS collapse/expand)
- **Proposed/Max:** `.ep-detail-sidebar` (fixed-position overlay w/ transform)
- **Note:** Right-edge panel on selection. Two impls: inline column vs. fixed overlay.

### Group 5: Store-based ranking
- **Proposed:** `.ep-mini-bar` in top-stores overview
- **Proposed-Max:** `.ep-stacked-list` in each metric's "By Store" sub-pane
- **Note:** Single-color (Proposed) vs 3-segment (Proposed-Max) bar impl of "rank stores."

### Group 6: Time trend
- **Base:** eCharts line chart
- **Proposed-Max:** Custom SVG path + gradient (no external dep)
- **Note:** 13/52-week trend w/ range toggle. Two impls.

### Group 7: Tab navigation
- **Proposed:** Entity-drill tabs (By Promotion, By Store, ...)
- **Proposed-Max:** Metric-first tabs (Sessions, Users, Duration, Card Events)
- **Note:** Same `.perf-tabs` chrome, fundamentally different IA. Proposed-Max is the canonical pattern.

---

## Section C — Surprises / outliers (Proposed-Max-only patterns)

### Outlier 1: Run-stats line under date selector
- Proposed-Max only. `.card-run-stats` — "ran at X stores · Y days"
- **Signals data completeness/freshness.** Other pages don't carry this.

### Outlier 2: MVP phase-scope badge strip
- Proposed-Max only. `.ep-mvp-strip` — meta-surface flagging Phase 1 vs Phase 2
- **Project-management surface.** Strip before ship — or keep as in-doc reviewer hint?

### Outlier 3: Narrative hero-stat header pattern
- Proposed-Max only. `.section-panel-header` + `.hero-stat` + `.narrative-header`
- **IA-forward** — answers "what is this section for?" upfront. Should propagate to all sections across all pages.

### Outlier 4: Inline sortable data sub-pane
- Proposed-Max only. `.ep-data-table` + click-to-sidebar
- **Scaffolded for Phase B.** Threading the Base table into this slot is exactly the canonical "More Data" pattern.

### Outlier 5: Traffic source placeholder grid (4-cell)
- Both Proposed + Proposed-Max. (Direct, Email A, QR, Paid–Meta)
- **Slot pending data.** Connects to Phase 4 referral redesign in plan.

### Outlier 6: Perf stacked-bar hover tooltip
- Proposed/Max only. `.ep-perf-tooltip` — dark fixed-position
- **Mirrors eCharts hover.** Needs to travel with the stacked-bar pattern wherever it lands.

### Outlier 7: KPI tile jump buttons
- Proposed-Max only. `.ep-kpi-tile[data-jump-to]`
- **Bi-directional nav** — Overview → metric tab. Closes loop missing in Proposed/Base.

### Outlier 8: View All links on overview panels
- Proposed-Max only. `.ep-view-all-btn`
- **Context-aware drilldown** — overview panel → corresponding metric tab + sub-tab.

---

## Reframing notes (2026-04-30)

**"Proposed-Max is the new Base"** (Bill, 2026-04-30): The audit goal flips. Not "evaluate three alternatives"; instead:

1. **Lock Proposed-Max patterns as canonical** (they are by definition).
2. **For each surface in Base/Proposed**: classify as
   - **K** — Keep, already aligned w/ canonical
   - **U** — Upgrade, has Proposed-Max equivalent that should replace it
   - **T** — Thread, valid pattern that needs to be hosted inside the canonical surface (the data-table → "More Data" / Data sub-pane case)
   - **D** — Drop, no longer needed
3. **Repeat for Engagement-categories, Engagement-circulars, Engagement-grid, Engagement-compare, Distribution-visitation, Distribution-media, Distribution-traffic.**

Canonical surfaces from Proposed-Max (locked):
- Hero-stat narrative section header
- KPI tile strip + jump buttons
- Perf-tabs (metric-first IA)
- Sub-tabs per metric (By Store / By Day / Time Trend / Data)
- Stacked-list as the rank-items shape
- SVG time trend w/ range toggle
- Mini-card 2×3 (compare details — Phase 1.3 pending)
- View All links on overview panels
- Run-stats line on date selector

**Threading the Base table:** lands in the **Data sub-pane** of each metric tab. It already exists as a scaffold (Outlier 4). This is the right home — preserves the table's density, fits inside the canonical perf-tabs surface, no page-level mode toggle needed.

---

## Next steps for the audit

1. **Run the same Layer 1 pass on the rest of the dashboard:**
   - engagement-categories.html
   - engagement-circulars.html
   - engagement-grid.html
   - engagement-compare.html
   - distribution-visitation.html
   - distribution-media.html
   - distribution-traffic.html
2. **Build `02-catalog-engagement-rest.md`** (other engagement pages)
3. **Build `03-catalog-distribution.md`** (all 3 distribution pages)
4. **Build `04-similarity-groups-full.md`** — cross-dashboard groups (e.g., "How does each Distribution page show metric overview? Does it match Proposed-Max canonical or diverge?")
5. **Layer 2 (Bill):** review groupings, classify each impl K/U/T/D, lock decisions
6. **Layer 3:** build `surfaces-audit.html` — visual companion w/ live patterns side-by-side, verdict callouts
7. **Per-page diff doc:** "engagement-categories: keep X, upgrade Y to canonical, thread Z, drop W"
