# Surfaces Catalog — Distribution (Layer 1)

**Scope:** `distribution-visitation.html`, `distribution-media.html`, `distribution-traffic.html`

**Method:** Layer 1 inventory pass (Claude). Classified against Proposed-Max canonical (K/U/T/D).

**Total surfaces found:** 39

---

## Page-by-page summary

| Page | Posture | Headline finding |
|---|---|---|
| **distribution-visitation.html** | Closest-to-canonical Distribution page | Hero-stat + perf-tabs scaffolded; detail panes use Distribution-specific patterns (donut + chips). Sub-tab structure missing. |
| **distribution-media.html** | Furthest from canonical | **No perf-tabs.** Uses level-dividers + flat structure. Tree-data-grid is its own canonical. Media-visits section has simplified header (no stat-strip). |
| **distribution-traffic.html** | Hybrid — sequential chart-cards + map | Hero-stat + duration presets present. **No perf-tabs** — uses sequential narrative. Map+leaderboard+compare-panel = unique compound surface. |

---

## Section A — Raw catalog by page (K/U/T/D classified)

### Shared header surfaces (all 3 pages)

| # | Surface | File:lines | Class |
|---|---|---|---|
| 1 | Hero-stat narrative section header | All 3, lines 141–154 | **K** |
| 2 | Date Range context card | All 3, lines 98–112 | **K** |
| 3 | Entity Selector context card | All 3, lines 114–129 | **K** |
| 4 | Filter chips strip | All 3, embedded in header | **K** |

### Visitation page surfaces

| # | Surface | File:lines | Class | Rationale |
|---|---|---|---|---|
| 5 | Perf-tabs (metric-first IA) | 250–386 | **K** | Canonical. Media + Traffic should adopt. |
| 6 | View toggle (Current/Trend binary) | 161–168 | **U** | Should formalize as sub-tabs (Composition/Trend/Data) |
| 7 | Chart-card container (generic) | Multiple | **U** | Unify with `.ep-sub-pane` |
| 8 | Duration presets (1W/4W/13W/1Y) | 203–208 | **K** | Matches `.ep-trend-ranges`. Rename for consistency. |
| 9 | Donut chart (Visit Frequency) | 175–179 | **U** | Thread into Composition sub-pane |
| 10 | Segment detail cards | 181–189 | **U** | Distribution-specific; consider stacked-list |
| 11 | Stacked bar chart (visit freq over time) | 195–221 | **T** | Threads into Time Trend sub-pane |
| 12 | Section header — Store Performance | 236–243 | **K** | Matches canonical |
| 13 | Overview grid (3-panel) | 281–294 | **U** | Missing `.ep-view-all-btn` jump buttons |
| 14 | Perf overview jump row | 272–279 | **K** | Cross-page nav variant of view-all |
| 15 | Store performance bar view | 326–340 | **U** | Single-segment bars; should be multi-segment stacked-list |
| 16 | Store performance data table | 329–334 | **T** | Threads into Data sub-pane |
| 17 | Creative chips | 346 | **K** | Distribution canonical |
| 18 | Creative detail header | 347–348 | **U** | Should unify w/ Engagement chip-detail naming |
| 19 | Creative detail columns (2-col) | 350–360 | **T** | Threads into drill detail pane |
| 20 | Demographics section header | 391–395 | **K** | Canonical, but missing stat-strip |
| 21 | Demographics tabset (Current/Trend) | 400–416 | **U** | Should be sub-tabs |
| 22 | Demographics chip selector (All/Single) | 421 | **K** | Distribution canonical |
| 23 | Demographics 8-card grid | 433–442 | **U** | Should thread into "All Dimensions" sub-pane |
| 24 | Demographics single-view chart | 424–430 | **K** | Valid focus pattern |

### Media page surfaces

| # | Surface | File:lines | Class | Rationale |
|---|---|---|---|---|
| 25 | Creative list (horizontal carousel) | 163 | **D / K** | **Dual use:** **D** when used as "By Creative" performance ranker (replace w/ stacked-list). **K** when repurposed as top-level multi-campaign nav above KPI tiles — Bill confirmed Max's intent 2026-04-30 (DP15.1 Reading A). |
| 26 | Level divider | 160, 168 | **D** | Meta-surface; replace w/ canonical section-panel-header |
| 27 | **Tree-data-grid (hierarchical table)** | 171–196 | **K** | **Distribution canonical** — production-grade hierarchy table. Lock. |
| 28 | Media-visits section header (simplified) | 208–212 | **U** | Should add stat-strip + canonical hero-stat treatment |
| 29 | Media-visits stats | 214–216 | **K** | Distribution canonical (3 KPIs) |
| 30 | Media-visits grid (2-panel) | 218–227 | **U** | Add view-all jump buttons |
| 31 | Media-visits footnote | 229–232 | **K** | Valid Distribution pattern (data transparency) |

### Traffic page surfaces

| # | Surface | File:lines | Class | Rationale |
|---|---|---|---|---|
| 32 | Crossover chart (stacked area) | 160–177 | **K** | **Distribution canonical** — competitive market basket. No engagement equivalent. |
| 33 | Crossover detail | 176 | **T** | Threads into sub-pane |
| 34 | **Leaderboard table** | 193 | **K** | **Distribution canonical** (competitor-aware ranked list) |
| 35 | **Store map (Leaflet)** | 196–216 | **K** | **Distribution canonical** — geographic viz |
| 36 | Map ring legend (1/3/5 mile) | 197–201 | **K** | Part of map canonical |
| 37 | **Compare panel (overlay)** | 206–216 | **K** | **Distribution canonical** — store-vs-competitor modal |
| 38 | Crossover trend chart | 222–238 | **U** | Adopt canonical `.ep-trend-toolbar` naming |
| 39 | Traffic share chart (% / volume) | 241–255 | **U** | Adopt canonical trend pattern |

---

## Section B — Purpose groups (canonical-vs-Distribution)

### Group 1: Section narrative headers
- **Canonical:** `.section-panel-header` + `.hero-stat` + `.narrative-header` + `.stat-strip`
- **Visitation Store Performance:** Matches canonical → **K**
- **Visitation Demographics:** Header present, **missing stat-strip** → **U**
- **Media-visits:** Header present, **missing stat-strip** → **U**
- **Action:** Audit all Distribution section headers; enforce stat-strip inclusion.

### Group 2: Ranked-item lists
- **Canonical (Engagement):** `.ep-stacked-list` (multi-segment bars)
- **Visitation store-perf-bar-view:** Single-segment bars → **U** (add visitor-type segments if data supports)
- **Traffic leaderboard-table:** Distribution canonical (competitor-aware) → **K**
- **Media tree-data-grid:** Distribution canonical (hierarchical) → **K**
- **Insight:** Distribution has its own ranked-list shapes (leaderboard for competitor compare, tree for hierarchy). Engagement has stacked-list for multi-segment. Three valid canonical shapes; no forced unification needed.

### Group 3: View toggles & sub-tabs
- **Canonical:** `.ep-sub-tabs` (4 buttons: By Store / By Day / Time Trend / Data)
- **Visitation Current/Trend:** Binary toggle → **T** (formalize as sub-tabs Composition/Trend/Data)
- **Demographics Current/Trend:** Binary toggle → **T** (same)
- **Traffic Our Stores/Competitors:** Binary view-toggle → **K** but separate IA
- **Action:** Convert binary toggles to canonical sub-tabs where 3+ views exist.

### Group 4: Time-trend visualization
- **Canonical:** SVG path + `.ep-trend-ranges` button set
- **Visitation/Traffic eCharts variants:** All use `.duration-presets` correctly → **U** (rename class to canonical, optionally migrate to SVG)
- **Action:** Alias `.duration-presets` → `.ep-trend-ranges` for class consistency.

### Group 5: Overview panels (summary cards grid)
- **Canonical:** `.ep-overview-panel` (3-cell grid) + `.ep-view-all-btn` jump buttons
- **Visitation perf-overview-grid (3-cell):** → **U** (missing jump buttons)
- **Media media-visits-grid (2-cell):** → **U** (missing jump buttons)
- **Demographics 8-card grid:** → **U** (consider sub-pane treatment)

### Group 6: Drill-down detail panes
- **Visitation creative-detail-cols:** 2-col store + DoW → **T** (valid sub-pane shape)
- **Visitation demo-single-view:** Single-dimension full-width → **T**
- **Action:** Lock 2-col detail pane shape as reusable Distribution canonical.

### Group 7: Chart container shells
- **Canonical:** `.ep-sub-pane`
- **Distribution:** `.chart-card` (universal across all 3 pages)
- **Action:** Alias `.chart-card` ↔ `.ep-sub-pane` for cross-domain consistency.

---

## Section C — Mismatches & surprises

1. **Media page lacks perf-tabs entirely** — biggest IA gap. Uses level-dividers + flat structure. Tree-grid becomes the focal point but loses tabbed navigation.
2. **Demographics is sibling section, not sub-pane** — by scope choice, not error. Decision: keep as section (current weight) or thread into Store Performance as a sub-pane.
3. **Creative carousel on Media** — `.creative-list` horizontal scroll. Doesn't scale to 50+ creatives, not mobile-friendly. **Recommend D**.
4. **Traffic has no top-level perf-tabs** — sequential chart-cards (narrative arc). Could be intentional. Decision: add tabs or document sequential pattern as Traffic canonical.
5. **Demographics chip selector** — all/single dimension toggle. More flexible than sub-tabs but harder to navigate. Could inform future Engagement design.
6. **Map + leaderboard tightly coupled** — unique compound surface w/ compare-panel modal. Lock as Traffic canonical.

---

## Section D — Distribution-specific canonical proposals

These have NO Engagement equivalent. Lock as Distribution canonical.

### D-1. Tree-data-grid (hierarchical performance table)
- **Loc:** Media 171–196 (`.dist-tree-data-grid`)
- **Use:** Media Buy hierarchy drill (creative/variant/spend/CTR/conversions)
- **Verdict:** Lock as canonical. Production-grade.

### D-2. Map + leaderboard + compare-panel compound
- **Loc:** Traffic 181–219
- **Use:** Geographic store-performance w/ competitive context
- **Verdict:** Lock as Traffic canonical.

### D-3. Crossover stacked-area chart
- **Loc:** Traffic 160–177
- **Use:** Market basket overlap (Top 5 + All Other)
- **Verdict:** Lock as Traffic canonical.

### D-4. Demographics chip selector + 8-card grid
- **Loc:** Visitation 421–442
- **Use:** Multi-dimensional demographic drill (all-at-once + focused)
- **Verdict:** Conditional lock — formalize w/ sub-tabs OR keep all-grid density if that's the user value.

### D-5. Visitation Composition tabset (Current/Trend)
- **Loc:** Visitation 161–225
- **Use:** Snapshot composition (donut) → time-trend
- **Verdict:** Keep for now; migrate to sub-tabs when Media is tabified.

### D-6. Media-visits section (cross-ref pattern)
- **Loc:** Media 207–233
- **Use:** Media-attributed visit analysis (separate data source from Store Visitation)
- **Verdict:** Lock as canonical w/ upgrade — add stat-strip to header.

---

## Quick K/U/T/D summary

- **K (Keep):** 14 surfaces
- **U (Upgrade):** 16 surfaces
- **T (Thread):** 6 surfaces
- **D (Drop):** 3 surfaces (creative carousel, level dividers)

---

## Top action items (Bill's call)

1. **Media page** — add perf-tabs wrapping tree-grid + charts (Overview / By Creative / By Campaign / Data)
2. **Section headers** — enforce stat-strip on all (Demographics, Media-visits currently missing)
3. **Overview grids** — add `.ep-view-all-btn` jump buttons (Visitation, Media)
4. **Demographics** — formalize Current/Trend as sub-tabs; OR keep all-grid density if that's the value
5. **Traffic perf-tabs (optional)** — add for consistency, OR document sequential-chart pattern as Traffic canonical
6. **Creative carousel (Media)** — deprecate `.creative-list`; use chips or perf-tabs
7. **Class naming** — alias `.chart-card` ↔ `.ep-sub-pane`, `.duration-presets` ↔ `.ep-trend-ranges`
