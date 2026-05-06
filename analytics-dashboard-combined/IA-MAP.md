# Analytics Dashboard — Information Architecture Map

**Source:** `analytics-dashboard-combined/` canonical pages (commit `f17a1b0` baseline).
**Generated:** 2026-05-05
**Purpose:** Single-plane view of every page → sub-section (perf-tab) → content section → chart/table component. Use to evaluate placement, find duplication, plan India-team Angular conversion.

---

## How to read

- **Page** = top-level nav destination (Engagement Promotions, Distribution Visitation, etc.). Color-coded by family.
- **Sub-section** = `.perf-tab` pane (Overview / Sessions / By Store / etc.). Within a page.
- **Content section** = a self-contained block inside a pane (KPI strip, hero band, panel, sub-tab pane).
- **Component** = leaf — a single chart, table, donut, KPI tile, etc.

**Color families:**

| Family | Color | Hex |
|---|---|---|
| Engagement | Blue | `#2196F3` |
| Distribution | Amber | `#F59E0B` |
| Compare | Green | `#10B981` |
| Shared shell (header/nav/cohort/stat-strip) | Gray | `#9CA3AF` |

Engagement sub-pane accent (within blue family):
- Sessions `#2563eb` · Users `#0891b2` · Duration `#D97706` · Cardevents `#7C3AED`

Distribution sub-page accent (within amber family):
- Visitation `#EF4444` (audience colors) · Media `#F59E0B` (funnel colors) · Traffic `#8B5CF6` (crossover)

---

## Global shell (every page)

| Section | Component | Description |
|---|---|---|
| Top bar | `.title` "Analytics Dashboard" | Brand wordmark |
| Top bar | Entity selector button | Opens Select Entity modal (tree-table) |
| Top bar | Date range button | Opens Select Date Range modal (presets + custom) |
| Top bar | Add Filter button | Opens Add Filter modal |
| Top bar | View tabs (Report / Explore / Compare) | Cross-page nav |
| Section header | `.narrative-header__title` | Page H1 (e.g. "Engagement", "Media Buy") |
| Section header | `.narrative-header__question` | Subhead Q (e.g. "How efficient is ad spend?") |
| Section header | `.ep-cohort-note` | "Cohort: N items · Brand · Week 47" |
| Section header | `.stat-strip` | Hero metric + context lines |

---

## Engagement family

Five report pages share an identical shell: 5 perf-tabs (Overview / Sessions / Users / Duration / Cardevents). Non-overview tabs have 4 sub-tabs (by-X / By Day / Time Trend / Data).

### 1. Engagement › Promotions (`engagement-promotions.html`)

H1: **"Engagement"** · Q: *How is the active circular performing across stores, days, and promotions?*
Entity grain: **promotion**. Cohort default: 75 promotions.

| Sub-section (perf-tab) | Content section | Component | Description |
|---|---|---|---|
| **Overview** | KPI grid 2×2 | Donut KPI: Sessions | Big number + donut breakdown (N/R/E) + ▲% delta + jump pill |
| | | Donut KPI: Total Users | Same shape, users grain |
| | | Donut KPI: Avg Session Duration | min+sec spell-out |
| | | Donut KPI: Card Engagement Events | Adds + Clicks + share/save/print |
| | Mini-additivity rows (under each donut) | 3-row N/R/E breakdown | Wires totals = N+R+E inline |
| **Sessions** | Section header | Stat strip: Sessions value + scope context | "78,542 · among Brand · Week 47" |
| | Sub-tabs | Sessions by Promotion (stacked-list bars) | Horiz bars, one row per promo, N/R/E segs |
| | | Sessions by Day (DoW columns) | 7-col bar grid w/ peak highlight |
| | | Sessions Time Trend | Line chart, range chips (1W/4W/13W/1Y) |
| | | Data → opens `engagement-grid.html` | External link to Explore grid |
| **Users** | Section header | Stat strip: Total Users | |
| | Sub-tabs | Users by Promotion · By Day · Time Trend · Data | Same shape as Sessions, users grain |
| **Duration** | Section header | Stat strip: Avg Duration | min+sec |
| | Sub-tabs | Duration by Promotion (stacked bars min/sec) | N/R/E split |
| | | Duration by Day · Time Trend · Data | |
| **Cardevents** | Section header | Stat strip: Card Events | |
| | Sub-tabs | Card Events by Promotion · By Day · Time Trend · Data | Engaged-first seg order |

### 2. Engagement › Categories (`engagement-categories.html`)

H1: **"Categories"** · Q: *How are categories engaging users this week?*
Entity grain: **category**. Cohort default: 8 categories.

Identical structure to Promotions; sub-tab labels swap "Promotion" → "Category" (e.g. "Sessions by Category"). Same 5 perf-tabs, same KPI grid, same Data link to grid.

### 3. Engagement › Circulars (`engagement-circulars.html`)

H1: **"Circulars"** · Q: *How is each store's circular performing this week?*
Entity grain: **circular** (store). Cohort default: 27 circulars.

Same shell as Promotions/Categories with one extension: above the cohort line a **base-layer perf-tab strip** lets the user switch entity grain without re-navigating: `[Circulars (active) | Categories | Promotions]` — links to sibling pages.

**R2 RESOLVED 2026-05-06:** All 5 sub-page files dropped. Tab activation via URL query param: `engagement-circulars.html?tab=sessions|users|duration|cardevents` (parsed by `shell-loader.js`). `data-grid` tab routes out to `engagement-grid.html` (canonical Explore surface — no longer an embedded copy).

### 4. Engagement › Explore Grid (`engagement-grid.html`)

H1: **"Explore"** · Q: *What does the underlying data look like, row by row?*
Entity grain: **promotion** (default). Cohort default: 75 promotions.

**IA decision 2026-05-06 (Bill):** Grid / Inquiry is a **single explore view — no metric perf-tabs AND no KPI surface**. Think spreadsheet/Excel view of the data. Base/Reports owns the "summary with some detail" framing (donut KPI grid + grid). Grid is pure row-level data + preview sidebar. The Sessions / Users / Duration / Card Events sub-pages and the previous `ep-kpi-strip` are out of scope for this section going forward. Prototype shots for those tabs exist in `screenshots/` but are excluded from the canonical IA map.

| Sub-section | Content section | Component | Description |
|---|---|---|---|
| Single view | Grid + preview | Flat data grid + side preview | Data-first single surface; receives "Data" links from other Engagement pages. No KPI tiles. |

### 5. Engagement › Compare (`engagement-compare.html`)

H1: **"Compare"** · Q: select contexts to compare.
Entity grain: variable (compare 2+ contexts).

| Section | Component | Description |
|---|---|---|
| Empty state | `.compare-empty-state` | "Select Contexts to Compare" prompt before any selection |
| Date selector | Modal trigger button | Date range w/ "Week N (X of Y days) · ★ partial" indicator |
| Entity selector | Tree-table modal | Brand/node hierarchy w/ Type/Address/Subdomain/Path cols |
| Category modal | Category picker | Per-context category filter |
| Promotion modal | Promotion picker | Per-context promotion filter |
| Mini-card 2×3 grid (above fold) | 6 mini-cards | Sessions / Users / Duration / Cardevents / +2 — per-context value + percentile + ▲ |
| Percentile sentence | Layer-aware copy | "How to interpret: among the N promotions ... this scored in the X percentile" |
| Top-line summary | Written bullets | "Chicago Loop saw +10% circular traffic vs last week" (stub today) |

---

## Distribution family

Three pages, each its own narrative + IA. Visitation has the most mature pattern; Media + Traffic mirror it.

### 6. Distribution › Observed Store Visits (`distribution-visitation.html`)

H4: "Distribution" · H1: **"Observed Store Visits"** · Q: *Are our media campaigns driving store visits?*
Cohort default: 27 stores · Week 2.

| Section | Content section | Component | Description |
|---|---|---|---|
| Visit Frequency band | Chart card | Donut: Visit Frequency (`#chart-visit-donut`) | 1× / 2-3× / 4+× visit buckets |
| | Chart card | Segment Breakdown panel | Loyal / Returning / New audience composition |
| | Chart card | Visit Frequency Over Time (`#chart-frequency`) | Line trend, multi-segment, range chips, custom legend |
| **Store Performance** section | Section header w/ stat-strip | "Which stores are driving the most visits?" | |
| | Perf-tab: Overview | Jump pill → Media Buy | "Looking for CTR · VCR · Spend? Jump to Media Buy" |
| | | 3-up overview-grid: By Creative bars, By Store donut, DoW pattern | Mini summaries before drill-down |
| | Perf-tab: By Store | View toggle (Bar / Data / Trend) | Bar default. Data shows table. Trend = duration presets + multi-line chart |
| | | `.store-perf-bar-view` | Horiz stacked bars, one per store, sorted by visits desc |
| | | `.store-perf-table` | Tabular data view |
| | | `#store-perf-trend-chart` | Per-store trend lines, range chips |
| | | More Data toggle | Adds extra cols to data view |
| | Perf-tab: By Creative | `.creative-chips` selector | Per-creative chip strip; rank badge per DP16.1 |
| | | Creative detail header | Thumb + meta + mini stat strip for selected creative |
| | | 2-col: Visits by Store + DoW Pattern | `#perf-creative-bars` + `#perf-creative-dow` |
| | Perf-tab: By Day | Day chip selector | One chip per day (or All-Days) |
| | | 2-col: Visits by Store (selected day) + DoW Pattern | Mirrors creative-detail layout |
| **Demographics** section | Section header | "Who are our attributed shoppers?" | |
| | 8-up demo grid | Bar charts: Age, Gender, Income, Children, HH Size, Homeowner, Net Worth, Marital | One ECharts bar per demographic |
| | | Single-store overlay (`#chart-demo-single`) | Drill-down view |

### 7. Distribution › Media Buy (`distribution-media.html`)

H4: "Distribution" · H1: **"Media Buy"** · Q: *How efficiently is our ad spend being delivered?*
Cohort default: 27 stores · Week 2.

| Section | Content section | Component | Description |
|---|---|---|---|
| Hero | Stat strip | Spend / Impressions / Clicks / VCR top-line | |
| **Observed visits attributed to media spend** subsection | Mini perf-tabs | Overview · By Store · Trend Over Time | Joins media-buy delivery to visitation |
| | Trend pane | `Attributed Visits Over Time` line chart | Range chips, daily/weekly toggle |
| **Off-Platform Media Performance Ranking** section | (subtitle: REQUIRES A SUBTITLE — placeholder) | | Page-level ranking of media variants |
| | Perf-tabs: Overview · By Store · By Creative · Trend · Data | | |
| | Overview pane | KPI strip + 3-up overview-panels (Top Stores / Top Creatives / DoW) | Funnel-color KPIs (Impressions / Clicks / Visits) |
| | By Store pane | Stacked-bar list w/ view-toggle (Bar/Data/Trend) | Same as Visitation By-Store pattern |
| | By Creative pane | `.creative-chips` selector + 2-col detail | Per-creative drill |
| | Trend pane | Multi-metric line chart | Range chips |
| | Data pane | `.dist-tree-data-grid` (`#mb-data-grid`) | Full flat data table |
| Variant panels (always-on grid) | `.dist-tree-data-grid` | Variant rows w/ Export · Print · Share actions | Off-platform variants table |

### 8. Distribution › Traffic Share (`distribution-traffic.html`)

H4: "Distribution" · H1: **"Traffic Share"** · Q: *How does our observed visitation compare to competitors?*
Cohort default: 27 stores · Week 2.

| Section | Content section | Component | Description |
|---|---|---|---|
| Hero | Stat strip (`#traffic-insight-strip`) | Crossover insight metric + context | |
| Perf-tabs | Overview · By Competitor (compare) · Trend · Data | | |
| | Overview pane | `Competitive Crossover` (`#chart-crossover`) | Stacked area / share chart of visitation across market |
| | Compare pane | `Store Performance` panel + `.traffic-perf-table-wrap` | Per-store comparison vs competitors; 5+AllOther crossover treatment |
| | Trend pane | `Crossover Trend` (`#chart-crossover-trend`) | Time series of crossover share |
| | Data pane | Flat data table | |
| (Future per Max Apr 17) | Layer legend | Circle/diamond marker legend | Replaces inverse toggle pattern |

---

## Cross-page surfaces (canonical, replicated)

Same component reused across multiple pages. If any one of these drifts, the others must follow.

| Surface | Lives on | Note |
|---|---|---|
| `.ep-kpi-grid` (donut 2×2) | Promotions, Categories, Circulars Overview | Engagement canon |
| `.ep-kpi-strip` (flat tiles) | ~~Grid Overview~~ — REMOVED 2026-05-06 | Pattern retired. Grid carries no KPI surface. |
| `.ep-sub-tabs` (by-X / By Day / Time Trend / Data) | Every Engagement non-overview tab | 4-sub-tab pattern |
| `.creative-chips` selector | Visitation By Creative · Media By Creative · Engagement By Promotion | DP16.1 rank parity required |
| `.stat-strip` | Every section header | Hero metric + context lines |
| `.ep-cohort-note` | Every page | "Cohort: N · scope · period" |
| `.dist-tree-data-grid` | Media Data pane · Media variant panels | |
| Stacked-list bars (N/R/E or funnel) | All by-Store / by-X panes | Color family swaps; structure constant |
| DoW columns | Every By-Day pane + Overview DoW mini | One renderer (`renderDoWColumns`) |
| Time Trend line | Every Trend pane | Range chips: 1W/4W/13W/1Y |

---

## Open IA questions

1. **Demographics placement** — currently inside Visitation only. Should it move up to a Distribution-shared section, or stay nested?
2. **Variant panels on Media** — always-on grid below the perf-tabs feels like a 6th tab. Promote into Data tab or keep as standalone?
3. **Compare empty state vs populated state** — only empty state authored today. Populated layout is implicit in mini-card 2×3 spec.
4. **Engagement Compare ↔ Distribution Compare** — Compare today is engagement-flavored only. No Distribution Compare exists. Gap?
5. ~~**Grid (Explore) vs Promotions**~~ — RESOLVED 2026-05-06: Grid = spreadsheet/Excel view (no KPI), Promotions = "summary with some detail" (donut KPI + grid). Distinct roles, zero metric duplication.
6. **Media subsection "Observed visits attributed to media spend"** — has its OWN mini perf-tabs nested inside Media Buy's perf-tabs. Two levels of perf-tabs on one page. Cognitive load risk.
7. ~~**Sub-page URL variants on Circulars**~~ — RESOLVED 2026-05-06: 5 sub-pages dropped; deep-link via `?tab=X` query param. `data-grid` tab routes to canonical Explore (`engagement-grid.html`).

---

## Visual companion

The hierarchical, navigable view of this matrix lives in `screenshots/sitemap.html` (HTML site map w/ embedded screenshot leaves + lightbox gallery). Two views of the same source-of-truth — edit this matrix, regen the sitemap.

URL params: `?family=eng` or `?family=dist` for split views. `screenshots/index.html` is the flat contact sheet.

---

## Regeneration

This map is hand-curated from HTML grep. To refresh after IA changes:

```bash
cd ~/Code/mydarndest-playground/analytics-dashboard-combined
grep -nE 'data-ep-tab=|data-ts-pane=|data-perf-pane=|data-mv-pane=|data-mb-pane=|panel-label|narrative-header__title|section-panel-header__title' *.html
```

Compare the output to the matrix above. Anything new in code but missing from the matrix = drift; update both before review.
