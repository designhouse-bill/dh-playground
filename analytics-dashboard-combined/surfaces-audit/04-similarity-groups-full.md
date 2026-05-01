# Cross-Dashboard Similarity Map (Layer 1 synthesis)

**Scope:** Full analytics dashboard — 11 pages — Engagement + Distribution.
**Purpose:** Group every surface by **logical purpose** (not by class name). Show how the same thing is rendered N ways across pages. Identify canonical winner + non-canonical instances that need K/U/T/D.

**Pages covered:**
- Engagement: promotions (Base), promotions-proposed, promotions-proposed-max (canonical), categories, circulars, compare, grid
- Distribution: visitation, media, traffic
- Combined: index

**Total surfaces inventoried:** 90 (30 promotions + 21 engagement-rest + 39 distribution)

**Key reframing (Bill, 2026-04-30):** Proposed-Max is canonical. Audit goal flips from "evaluate alternatives" to "bring everything else to canonical level."

**Baseline lock (Bill, 2026-05-01):** Original + Proposed removed from header UI (markup retained for reference). REPORT button now lands on Proposed-Max across all pages. Audit decisions are made against Proposed-Max only — no version comparison remains in the product surface.

**Preservation rule (Bill, 2026-05-01):** Wherever Engagement or Distribution has an in-development production table (`.ep-data-table`, `.dist-tree-data-grid`, `.category-data-grid`, `.store-data-grid`, `.grid-data-table`, `.promo-data-grid`, `.store-perf-table`, `.leaderboard-table`), preserve the existing UI pattern. Thread it inside the canonical surface (Data sub-pane / Ranked Table mode). Do not rework the table itself.

**Production stack (Bill, 2026-05-01):** Angular / TypeScript. **PrimeNG** = UI component library. **eCharts** (via `ngx-echarts`) = base for ALL charts. Prototype mixed impls (Engagement SVG vs Distribution eCharts) collapse to eCharts in the Angular build — Engagement SVG trend chart is throwaway prototype code, gets rewritten as `<ngx-echarts>` regardless. AI implementer should target eCharts for every trend / bar / stacked-area surface.

---

## How to read this map

Each group has:
- **Purpose** — one-sentence what-this-does
- **Canonical** — the locked-in winner (usually from Proposed-Max, sometimes Distribution-specific)
- **Instances across the dashboard** — every implementation found, classified K/U/T/D
- **Decision points** — what Bill needs to call before AI implementer can build

---

## Group 0 — "Selector strip" (multi-item drill into a single-item view)

**ADDED 2026-04-30 9:00am** (Bill shared screenshot of canonical pattern from `engagement-promotions-proposed.html`).

**Purpose:** Browse N items, drill into one. Top-level navigation surface for "pick which X to look at" — promotions, campaigns, creatives, stores, anything.

**Canonical (locked):** `.ep-chips-row` + `.ep-chip` + `.ep-view-toggle` + filter input + count badge — full surface.

**Visual spec** (see `max-2026-04-30-slack/04-canonical-selector-strip.png`):
- Row 1 (above): perf-tabs (entity-drill IA — Overview / By X / By Y / ...)
- Row 2: left = view-mode toggle `[Chip Drilldown | Ranked Table]`; right = filter input + count badge
- Row 3: horizontal-scroll chip strip — first card = "All [entities]" (apps icon + count summary); subsequent cards = entity (category icon + meta); top performer gets TOP badge

**Instances + verdicts:**

| Page | Surface | Class | Verdict |
|---|---|---|---|
| Promotions Proposed | Selector strip (full) | `.ep-chips-row` + `.ep-view-toggle` | **K** — canonical |
| Promotions Proposed-Max | (chip-strip-only fragments visible) | `.ep-chip` | **U** — adopt full canonical (add view-toggle + filter + count) where multi-item drill exists |
| Promotions Base | None (uses left-panel category list instead) | — | **U** if Categories rebuilt to canonical |
| Visitation creative chips | Chips only, no toggle/filter | `.creative-chips` | **U** — wrap in selector-strip canonical |
| Demographics chip selector | Chips only | `.demo-chips` | **U** — same |
| Media `.creative-list` | Horizontal carousel | `.creative-list` | **D** — replace w/ `.ep-chips-row` selector-strip |
| Media (multi-campaign nav target) | None today | — | **NEW** — add canonical selector-strip above KPI tiles |

**Decision points (now resolved):**
- **DP15.1** ✓ Resolved — `.ep-chips-row` selector-strip is the canonical multi-item nav. `.creative-list` drops.
- **DP-NEW-0.1** Selector-strip's "Ranked Table" mode — what populates it? For Media Buy, recommend: `.dist-tree-data-grid` (preserves the production hierarchical table inside the canonical surface). For Engagement, recommend: `.ep-data-table` Data sub-pane structure threaded into the same view-mode slot.

---

## Group 1 — "Show ranked items"

**Purpose:** Display a ranked list of entities (promotions, stores, categories, competitors) with one or more metrics.

**Canonical (locked from Proposed-Max):** `.ep-stacked-list` — multi-segment bars, metric-colored, 9-row default.
**Plus secondary canonicals (don't conflict):**
- **Tree-data-grid** (`.dist-tree-data-grid`, Distribution-Media) — for hierarchical data (creative → variant → campaign)
- **Leaderboard table** (`.leaderboard-table`, Distribution-Traffic) — for competitor-aware ranking
- **Inline data table** (`.ep-data-table`, Proposed-Max Data sub-pane) — high-density Excel-like view threaded inside perf-tabs

**Instances across dashboard:**

| Page | Surface | Class | Verdict |
|---|---|---|---|
| Promotions Base | Promotions data table | `.promo-data-grid` | **T** → thread into Data sub-pane |
| Promotions Base | Promotion grid (cards) | `.promotion-grid` | **D** — deprecated, card-view toggle goes away |
| Promotions Proposed | Ranked table (by promo) | `.ep-ranked-table` | **U** → upgrade to canonical stacked-list |
| Promotions Proposed | Top promotions stacked bar | `.ep-mini-stacked` | **K** — already aligned (overview-panel use) |
| Promotions Proposed | Top stores mini bar | `.ep-mini-bar` | **U** — single-segment; upgrade to multi-segment stacked-list |
| Proposed-Max | Stacked list (per metric tab) | `.ep-stacked-list` | **K** — canonical |
| Proposed-Max | Inline data table | `.ep-data-table` | **K** — canonical (Data sub-pane) |
| Categories | Category grid | `.category-data-grid` | **U** → upgrade to stacked-list OR thread into Data sub-pane |
| Circulars | Store grid | `.store-data-grid` | **U** → same as Categories |
| Grid | Production data table | `.grid-data-table` | **T** → thread into Data sub-pane (the table to preserve) |
| Visitation | Store-perf bar view | `.store-perf-bar-view` | **U** → upgrade to multi-segment stacked-list |
| Visitation | Store-perf data table | `.store-perf-table` | **T** → thread into Data sub-pane |
| Media | Tree-data-grid | `.dist-tree-data-grid` | **K** — Distribution canonical |
| Traffic | Leaderboard table | `.leaderboard-table` | **K** — Distribution canonical |

**Decision points for Bill:**
- **DP1.1** Categories/Circulars grids — upgrade to `.ep-stacked-list` OR thread into Data sub-pane?
- **DP1.2** Promotion grid card-view — drop entirely or keep as legacy explore mode?

---

## Group 2 — "Section narrative header / hero stat"

**Purpose:** Frame each major section with title + narrative question + hero metric.

**Canonical:** `.section-panel-header` + `.hero-stat` + `.narrative-header` + `.stat-strip` (colored accent + title + question + inline stat)

**Instances:**

| Page | Surface | Has stat-strip? | Verdict |
|---|---|---|---|
| Promotions Base | `.panel-header--promotions` | No | **D** — Base chrome; replace w/ canonical |
| Promotions Proposed | `.ep-section-header` | Partial | **U** — upgrade to canonical |
| Proposed-Max | `.section-panel-header` + `.hero-stat` | Yes | **K** — canonical |
| Categories | `.panel-header--categories` | No | **D** — Base chrome |
| Circulars | `.panel-header--categories` | No | **D** — same |
| Grid | `.grid-controls` | No | **D** — Base chrome |
| Compare | `.compare-layer-tabs` | N/A | **K** — own canonical (compare workflow doesn't use hero-stat) |
| Visitation | `.section-panel-header` | Yes (Store Performance), No (Demographics) | **K**/**U** — Demographics needs stat-strip |
| Media | `.section-panel-header` | Yes (top), No (Media-visits) | **K**/**U** — Media-visits needs stat-strip |
| Traffic | `.section-panel-header` | Yes | **K** — canonical |

**Decision points:**
- **DP2.1** Confirm rule: every section header must have stat-strip (except Compare workflow). Demographics and Media-visits both currently missing; both are **U**.

---

## Group 3 — "KPI tile / overview metric strip"

**Purpose:** Show top-line metrics in a compact strip with optional click-to-jump navigation.

**Canonical:** `.ep-kpi-strip` + `.ep-kpi-tile[data-jump-to]` (Proposed-Max) — clickable tiles that jump to corresponding metric tab

**Instances:**

| Page | Surface | Class | Verdict |
|---|---|---|---|
| Promotions Proposed | Overview strip (5-cell) | `.ep-overview-strip` | **U** — upgrade to canonical KPI strip + add jump |
| Proposed-Max | KPI tile strip | `.ep-kpi-strip` | **K** — canonical |
| Visitation | hero-stat single-metric | `.stat-strip` | **K** — single-metric variant of canonical |
| Media | media-visits-stats | `.media-visits-stats` | **U** — should adopt canonical KPI tile structure |
| Traffic | hero-stat single-metric | `.stat-strip` | **K** — single-metric variant |

**Decision points:**
- **DP3.1** Confirm: KPI strip is the primary multi-metric overview pattern; single-metric strip is the hero variant. Both valid.
- **DP3.2** Media-visits stats — upgrade to KPI tile w/ jump targets, or keep flat (no perf-tabs to jump to currently)?

---

## Group 4 — "Tab navigation (perf-tabs)"

**Purpose:** Switch between primary dimensions/metrics within a section.

**Canonical:** `.perf-tabs` + `.perf-tab` w/ **metric-first IA** (Sessions / Users / Duration / Card Events for Engagement)

**Instances:**

| Page | Surface | Tab IA | Verdict |
|---|---|---|---|
| Promotions Proposed | `.perf-tabs` | Entity-drill (By Promotion / By Store / By Day) | **U** — upgrade to metric-first |
| Proposed-Max | `.perf-tabs` | Metric-first | **K** — canonical |
| Categories/Circulars/Grid | None | N/A | **U** if rebuilt, else acceptable as Base reports |
| Compare | `.compare-layer-tabs` | Entity-drill | **K** — Compare-canonical (different workflow) |
| Visitation | `.perf-tabs` | Mixed (Overview / By Store / By Creative / By Day) | **U** — refactor to metric-first OR keep entity-drill as Distribution canonical |
| Media | None | N/A | **U** — needs perf-tabs (Overview / By Creative / By Campaign / Data) |
| Traffic | None | Sequential chart-cards | **U** — add perf-tabs OR document sequential as Traffic canonical |

**Decision points:**
- **DP4.1** Distribution perf-tabs IA — adopt Engagement metric-first model, or use entity-drill (By Store / By Creative / By Day) as Distribution canonical?
- **DP4.2** Traffic page — add perf-tabs (Overview / Leaderboard / Crossover / Trend / Data) OR keep sequential narrative as intentional Traffic canonical?
- **DP4.3** Media page — definitely add perf-tabs (it's the biggest IA gap).

---

## Group 5 — "Sub-tabs within a metric pane"

**Purpose:** Within a metric tab, switch between cuts of that metric (By Store / By Day / Time Trend / Data).

**Canonical:** `.ep-sub-tabs` + `.ep-sub-tab` (4-button strip per metric)

**Instances:**

| Page | Surface | Verdict |
|---|---|---|
| Proposed-Max | `.ep-sub-tabs` | **K** — canonical |
| Visitation | Current/Trend binary toggle | **T** — formalize as sub-tabs (Composition/Trend/Data) |
| Demographics (Visitation) | Current/Trend binary toggle | **T** — same |
| Media | None | **U** — add sub-tabs once perf-tabs lands |
| Traffic | Our Stores/Competitors view-toggle | **K** — separate IA (binary view, not 4-cut sub-tabs) |

**Decision points:**
- **DP5.1** Sub-tab order — confirm "By Store / By Day / Time Trend / Data" sequence locks across all metric tabs (currently in Proposed-Max).

---

## Group 6 — "Time-trend visualization"

**Purpose:** Show metric trend over time with range toggle.

**Canonical:** SVG path + `.ep-trend-toolbar` + `.ep-trend-ranges` (1W / 4W / 13W / 1Y buttons)

**Instances:**

| Page | Surface | Class | Verdict |
|---|---|---|---|
| Promotions Base | eCharts line chart | (eCharts) | **U** — adopt canonical class names |
| Proposed-Max | SVG trend + ranges | `.ep-trend-toolbar` | **K** — canonical |
| Visitation Trend | eCharts stacked bars | `.chart-card` + `.duration-presets` | **U** — class rename to canonical |
| Traffic Crossover Trend | eCharts line | `.duration-presets` | **U** — same |
| Traffic Share Chart | eCharts (% / volume toggle) | `.duration-presets` | **U** — same |

**Decision points:**
- **DP6.1** SVG vs eCharts — Proposed-Max uses custom SVG (no external dep); Distribution uses eCharts. Migrate Distribution to SVG, OR alias class names + keep eCharts?
- **DP6.2** Confirm: `.duration-presets` → rename to `.ep-trend-ranges` for consistency (mechanical).

---

## Group 7 — "Day-of-week (DoW) breakdown"

**Purpose:** Show metric by day of week (Mon-Sun pattern).

**Canonical:** Inline grid columns within `.ep-sub-pane` (Proposed-Max — per metric tab)

**Instances:**

| Page | Surface | Verdict |
|---|---|---|
| Promotions Base | eCharts in detail panel (on selection) | **U** — move to inline sub-pane |
| Promotions Proposed | SVG `.ep-dow-chart` (always-visible panel) | **K** for overview-panel use; **T** for sub-pane use |
| Proposed-Max | `.ep-sub-pane` inline grid (per metric) | **K** — canonical |
| Visitation | DoW chart in perf-overview-grid | **U** — reuse canonical |
| (Distribution other) | — | — |

**Decision points:**
- **DP7.1** DoW — same impl across all uses (overview-panel + sub-pane), or two variants?

---

## Group 8 — "Detail sidebar"

**Purpose:** Show full detail of selected entity (slide-in panel from right).

**Canonical:** `.ep-detail-sidebar` — fixed-position right edge, transform slide-in, 350px wide

**Instances:**

| Page | Surface | Class | Verdict |
|---|---|---|---|
| Promotions Base | Inline collapse panel | `.panel--right.panel--collapsed` | **U** — upgrade to fixed overlay |
| Promotions Proposed | Fixed overlay | `.ep-detail-sidebar` | **K** — canonical |
| Proposed-Max | Fixed overlay | `.ep-detail-sidebar` | **K** — canonical |
| Categories | Inline collapse | `.panel--right.panel--collapsed` | **U** |
| Circulars | Inline collapse | `.panel--right.panel--collapsed` | **U** |
| Grid | None (table only) | — | **D** — add detail sidebar OR confirm not needed |
| Compare | Different IA (no per-entity sidebar) | — | **K** — N/A for Compare |
| Distribution | Compare-panel modal (Traffic only) | `.compare-panel` | **K** — Distribution canonical (different shape) |

**Decision points:**
- **DP8.1** Allow inline-collapse sidebar coexist (smaller-context pages), or standardize on fixed overlay everywhere?
- **DP8.2** Grid — add detail sidebar or keep as table-only Explore view?

---

## Group 9 — "View All / jump-to-detail link"

**Purpose:** Closes the loop — overview panel → corresponding metric tab/sub-tab.

**Canonical:** `.ep-view-all-btn` (Proposed-Max — overview panels)

**Instances:**

| Page | Surface | Verdict |
|---|---|---|
| Proposed-Max | View All buttons on overview panels | **K** — canonical |
| Promotions Proposed | None on overview-panels | **U** — add jump buttons |
| Visitation perf-overview-grid | None | **U** — add jump buttons |
| Visitation perf-overview-jump-row | Cross-page nav variant | **K** — valid sibling pattern |
| Media media-visits-grid | None | **U** — add jump buttons (or `D` if no perf-tabs to jump to) |

**Decision points:**
- **DP9.1** Always add jump buttons when perf-tabs exist on the page? Yes/no.

---

## Group 10 — "Cohort / context note"

**Purpose:** Inline badge defining the cohort being shown (75 promotions · Brand · Week 47).

**Canonical:** `.ep-cohort-note` (Proposed-Max + Proposed)

**Instances:**

| Page | Verdict |
|---|---|
| Proposed-Max | **K** — canonical |
| Promotions Proposed | **K** |
| Other pages | **U** — add cohort note where applicable |

**Decision points:**
- **DP10.1** Universal? Add cohort note to every section, or just sections where cohort is defined explicitly?

---

## Group 11 — "Run-stats line on date selector"

**Purpose:** Signal data completeness ("ran at 27 stores · 7 days") under date range card.

**Canonical:** `.card-run-stats` (Proposed-Max only currently)

**Instances:**

| Page | Verdict |
|---|---|
| Proposed-Max | **K** — canonical |
| All other pages | **U** — add run-stats line for consistency |

**Decision points:**
- **DP11.1** Universal across all pages? (Recommend yes — it's a small surface w/ high signal value.)

---

## Group 12 — "Compare workflow surfaces" (own canonical group)

Compare page is its own canonical workflow. NOT a Proposed-Max migration target.

**Locked compare-canonical surfaces:**
- `.compare-layer-tabs` — entity-drill (By Circular / Category / Promotion)
- `.compare-context-bar` + `.context-column--a/b` — dual contexts
- `.copy-context-btn` — A↔B copy buttons
- `.compare-prompt` — empty state
- `.compare-results-container` + `.compare-grid` — result scaffold (T threading)

**Decision points:**
- **DP12.1** Mini-card 2×3 grid (per Phase 1.3 plan) lives inside `.compare-grid` — confirm that's the canonical compare-results shape.
- **DP12.2** Compare's percentile sentence template (already locked in `analytics-compare-patterns.md`) — keep there as the canonical.

---

## Group 13 — "Domain-flexible canonical surfaces" (formerly "Distribution-only")

**Reframed (Bill 2026-05-01):** These surfaces currently only render in Distribution, but they are NOT fenced to one domain. They exist in Distribution first because the data shape required them first. If Engagement scales and a use-case calls for them, they travel.

**Locked:**
- **`.dist-tree-data-grid`** (Media) — hierarchical data drill
- **`.traffic-perf-map-wrap` + `.leaflet-map` + `.map-ring-legend`** (Traffic) — geographic store viz
- **`.leaderboard-table`** (Traffic) — competitor-aware ranked list
- **`.compare-panel`** (Traffic) — store-vs-competitor overlay modal
- **Crossover stacked-area chart** (Traffic) — market basket overlap
- **`.demo-chips` + `.demo-charts-grid` + `.demo-single-view`** (Visitation Demographics) — multi-dim demographic drill
- **Media-visits cross-ref section** (Media) — separate-data-source pattern
- **Visitation Composition tabset** (Current/Trend at hero level) — pending future migration to sub-tabs

**Decision points:**
- **DP13.1** Lock the 8 surfaces above as canonical. **Reframed (Bill 2026-05-01):** NOT Distribution-only — they're available to Engagement if a future use-case requires the same shape. Re-classified as "domain-flexible canonical surfaces."
- **DP13.2** Demographics chip selector — keep as Distribution canonical, or fold into sub-tabs (DP5)?

---

## Group 14 — "Modals (date picker / entity selector / add filter)"

**Canonical:** Shared modal infrastructure across all pages.

**Instances:** **K** universally (all pages use same modal templates).

**Decision points:** None — already aligned.

---

## Consolidated decision matrix (post baseline-lock 2026-05-01)

| ID | Decision | Status | Lock |
|---|---|---|---|
| **DP-NEW-0.1** | Selector-strip Ranked-Table mode — what populates? | LOCKED | Engagement = `.ep-data-table`; Media Buy = `.dist-tree-data-grid` |
| **DP1.1** | Categories/Circulars/Grid — stacked-list OR Data sub-pane thread? | LOCKED | Thread. Full canonical rebuild around existing tables. |
| **DP1.2** | Promotion grid card-view — drop or keep? | LOCKED | Drop. (Moot — page is reference-only after baseline-lock.) |
| **DP2.1** | Stat-strip mandatory on every section header? | LOCKED | Yes. |
| **DP3.1** | KPI strip + jump = canonical multi-metric overview? | LOCKED | Yes. Single-metric strip = hero variant. |
| **DP3.2** | Media-visits stats — upgrade or keep flat? | LOCKED | Upgrade (depends on DP4.3 = Yes). |
| **DP4.1** | Distribution perf-tabs IA — metric-first OR entity-drill? | OPEN | Contested — Apr-30 Max signal favors metric-first; Distribution data shape may favor entity-drill. |
| **DP4.2** | Traffic — sequential narrative OR add perf-tabs? | OPEN | Contested — story vs consistency. |
| **DP4.3** | Media perf-tabs — add? | LOCKED | Yes. |
| **DP5.1** | Sub-tab order: By Store / By Day / Time Trend / Data? | LOCKED | Yes. |
| **DP6.1** | SVG vs eCharts — migrate or alias? | LOCKED | Alias class names, keep eCharts. No impl churn. |
| **DP6.2** | Rename `.duration-presets` → `.ep-trend-ranges`? | LOCKED | Yes. |
| **DP7.1** | DoW — one impl or two variants? | LOCKED | One impl, two contexts. |
| **DP8.1** | Detail sidebar — standardize fixed-overlay everywhere? | LOCKED | Yes. (Inline-collapse exception removed under baseline-lock.) |
| **DP8.2** | Grid detail sidebar — add? | LOCKED | Yes. |
| **DP9.1** | Jump buttons on every overview panel where perf-tabs exist? | LOCKED | Yes. |
| **DP10.1** | Cohort note universal? | LOCKED | Yes. |
| **DP11.1** | Run-stats line universal? | LOCKED | Yes. |
| **DP12.1** | Mini-card 2×3 inside `.compare-grid`? | LOCKED | Yes. |
| **DP13.1** | Lock the 8 surfaces (tree-grid, leaflet, leaderboard, compare-panel, crossover area, demo-chips, media-visits, viz-composition) — Distribution-only? | LOCKED | Lock as canonical. **NOT Distribution-only** (Bill 2026-05-01) — they live in Distribution first because the data shape required it first. Available to Engagement if a future use-case calls. Re-classified "domain-flexible canonical surfaces." |
| **DP13.2** | Demographics chip selector — keep or sub-tabs? | LOCKED | Keep as Distribution canonical. |
| **DP15.1** | Selector strip canonical? | LOCKED | `.ep-chips-row`. `.creative-list` drops. |
| **DP15.2** | Stacked-list segment colors — global rule? | LOCKED | `.ep-panel-legend` per-panel (no global rule). |

**Open count: 2 of 23.** DP4.1 + DP4.2 — both Distribution-IA decisions.

---

## Once decisions land

For every U/T/D in the catalogs, generate a per-page diff doc:
- `diff-engagement-promotions-base.md` — what changes on Base
- `diff-engagement-promotions-proposed.md` — what changes on Proposed
- `diff-engagement-categories.md`, `-circulars.md`, `-grid.md`, `-compare.md`
- `diff-distribution-visitation.md`, `-media.md`, `-traffic.md`

Each diff = AI-implementer-readable instruction list:
> "Visitation page: replace `.store-perf-bar-view` w/ `.ep-stacked-list`. Preserve column data. Add visitor-type segments to bar."

That's the AI handoff artifact (Phase 6.2).

Then Layer 3 — `surfaces-audit.html` — visual companion w/ live patterns side-by-side. Built off the same catalogs + decisions.
