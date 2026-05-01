# Per-Page Diff — AI Implementer Handoff

**Scope:** What changes on each page to reach canonical. Reads as a punch list.
**Stack:** Angular + TypeScript / PrimeNG (UI) / eCharts via `ngx-echarts` (charts).
**Source of truth:** `04-similarity-groups-full.md` (decision matrix) + `page-updates-log.md` (Bill's per-page asks).
**Locked principles:**
1. Baseline = Proposed-Max only. Original + Proposed hidden in UI; markup retained for reference.
2. Preserve in-dev production tables — thread inside canonical surfaces, no rework.
3. Numbers always render with thousands-separator commas (`Intl.NumberFormat('en-US')`).

---

## engagement-promotions-proposed-max.html → CANONICAL (no rebuild)

This page IS the baseline. Other pages align to it. The only changes here are the cross-cutting polish items below.

### Cross-cutting polish (applies to canonical + all pages built from it)
- **Selector strip** (`.ep-chips-row`):
  - Rename "Chip Drilldown" toggle label (current term ambiguous — picks individual promotions vs. "All" summary). Bill to land on `[Cards | Table]` or similar.
  - Each chip: thumbnail + title + category name (currently icon + title + meta).
  - "All Promotions" card pinned outside scroll; horizontal scroller becomes carousel w/ left/right arrows.
  - `.ep-view-toggle`: increase prominence — 40px segmented control, icon + label, active-state filled w/ `--p-primary-color`, shadow on active.
- **KPI tile strip** (`.ep-kpi-strip`): add small "View →" affordance bottom-right of each tile to signal click-to-jump.
- **Cohort note** (`.ep-cohort-note`): wrap container in `.stat-strip__cards`, right-align in section header row, larger font, inner pieces in semantic spans (`__label` / `__count` / `__scope` / `__period` / `__sep`).
- **Run-stats line** (`.card-run-stats`): wrap text in `<span class="card-run-stats__text">`, bold + italic starting state. Per-piece spans for partial-run star + count.
- **All numeric values:** apply `Intl.NumberFormat('en-US')` formatting globally.

---

## engagement-promotions.html (Original) → REFERENCE-ONLY

Hidden from UI under baseline-lock. Markup retained. **No work here.** REPORT button repointed to Proposed-Max.

---

## engagement-promotions-proposed.html → REFERENCE-ONLY

Same posture as Original. Hidden from UI. No work.

---

## engagement-categories.html → FULL CANONICAL REBUILD

**Current state:** Bare shell — `panel-header--categories` + `.category-data-grid` (empty container) + collapsed inline-right detail panel. Nothing else.

**Target state:** Structural parity with engagement-promotions-proposed-max.html.

| Layer | Action |
|---|---|
| Drop | `.panel-header--categories` (Base chrome) |
| Add | `.section-panel-header` + `.hero-stat` (single-metric per Max Apr-17) + `.narrative-header` + `.stat-strip` (Group 2) |
| Add | `.ep-cohort-note` w/ Bill 2026-05-01 styling (Group 10) |
| Add | `.card-run-stats` line on date selector card (Group 11) |
| Add | `.ep-kpi-strip` w/ `data-jump-to` tiles + View affordance (Group 3) |
| Add | `.perf-tabs` metric-first IA: `[Overview | Sessions | Total Users | Avg Session Duration | Card Engagement Events]` (Group 4 / DP4.1) |
| Add | `.ep-sub-tabs` per metric pane: `[By Store | By Day | Time Trend | Data]` (Group 5 / DP5.1) |
| Add | `.ep-chips-row` selector strip — first card "All Categories", chips per category (Group 0) |
| Thread | Existing `.category-data-grid` lands in Data sub-pane of each metric tab (DP1.1 = B preservation) |
| Drop | Inline right-collapse `.panel--right.panel--collapsed` (DP8.1) |
| Add | `.ep-detail-sidebar` fixed overlay (Group 8) |
| Add | `.ep-view-all-btn` jump buttons on every overview panel (Group 9 / DP9.1) |

**Data dependency:** Cohort + week 48 / All Stores currently renders 0 categories — needs seed data before visual verification.

---

## engagement-circulars.html → FULL CANONICAL REBUILD

Identical scope to Categories, with `.store-data-grid` threaded into the Data sub-pane.

---

## engagement-grid.html → FULL CANONICAL REBUILD

Identical scope to Categories, with `.grid-data-table` threaded into the Data sub-pane.
Plus per DP8.2: add `.ep-detail-sidebar` (currently table-only, no detail view).

---

## engagement-compare.html → POLISH (canonical workflow already in place)

**Current state:** Compare-canonical surfaces in place — `.compare-layer-tabs` (entity-drill: Circular / Category / Promotion), `.compare-context-bar` (A + B columns w/ Copy A↔B buttons), `.compare-prompt` empty state, `.compare-grid` results scaffold. Already has Phase 1 polish (percentile sentence template, 1.3 mini-card 2×3, layer-adaptive sentence per Max Apr-30).

**Live-edited 2026-05-01 (already shipped):**
- `.percentile-value` moved to right end of `.detail-percentile-row`, inline w/ bar + score (no more wrap).
- `.variance` moved out of row into `.percentile-context__variance`, right-side of flex-row context block, sized 1.5rem to match `.percentile-value`.
- `.percentile-context` restructured: flex row, `__body` wrapper (left) holds lead-in + sentence + `__vs` line; `__variance` (right) holds the variance pill.
- `.percentile-score` formatted with `toLocaleString('en-US')` for thousands commas.

**Remaining (from existing plan):**
- Phase 1.1 — Top-line "Week N (X of Y days)" + locations + ★ partial-run star (Max Apr-30).
- Phase 1.2 — Percentile bigger, top-anchored (already in 1.2 CSS).
- Phase 1.3 — Mini-card 2×3 grid above-fold per column inside `.compare-grid`. Drop per-section "Engagement Metrics" / "Details" headers (DP12.1 confirmed).
- Phase 1.5 — Drop-down hierarchy: persist promotion across category↔circular layer toggles.

---

## distribution-visitation.html → ENTITY-DRILL CANONICAL REBUILD

**IA per DP4.1:** Distribution = entity-drill (matches Max Apr-17 + Apr-30 locks). Engagement = metric-first.

| Layer | Action |
|---|---|
| Section header | Already has hero-stat (per Max Apr-17). Demographics subsection currently lacks stat-strip — add (DP2.1). |
| Cohort note | Add per DP10.1 |
| Run-stats | Add per DP11.1 |
| KPI strip | `.stat-strip` (single-metric hero variant) — already canonical |
| Perf-tabs | Already `[Overview / By Store / By Creative / By Day / ...]` entity-drill — already canonical (DP4.1) |
| Sub-tabs | Today: Current/Trend binary toggle. **T** — formalize as `.ep-sub-tabs` `[Composition | Trend | Data]` |
| Selector strip | Wrap `creative-chips` + `demo-chips` in `.ep-chips-row` canonical w/ view-toggle + filter + count (Group 0) |
| Ranked items | Bar view → upgrade to `.ep-stacked-list` multi-segment (visitor-type segments). Existing `.store-perf-table` threads into Data sub-pane (preservation) |
| Trend chart | eCharts stays (DP6.1 alias only). Rename `.duration-presets` → `.ep-trend-ranges` (DP6.2) |
| Detail sidebar | Inline-collapse → `.ep-detail-sidebar` fixed overlay (DP8.1) |
| View All | Add jump buttons on overview-grid panels where perf-tabs target exists (DP9.1) |

**Demographics sub-section:**
- `.demo-chips` selector strip — keep as canonical (DP13.2 — domain-flexible)
- Add stat-strip (DP2.1)

---

## distribution-media.html → ENTITY-DRILL REBUILD + 4 PAGE-LEVEL FIXES

### Page-level fixes (Bill 2026-05-01)
1. **Detailed Breakdown** — cap height + overflow scroll. Currently 601 records render full-bleed; section runs forever.
2. **"Visits attributed to media spend"** — move to top of page (currently at the bottom).
3. **Performance Ranking "Sort By"** — convert dropdown to `.perf-tabs` pattern (folds into DP4.3 perf-tabs build naturally).
4. **`.media-visits-section`** — convert to mini perf-tabs container (DP3.2 = B):
   - Tabs: `[By Store | By Week | Data]`
   - KPI strip above tabs: 3 tiles (Attributed Visits / Spend Joined / Top-Driving Campaign) w/ jump
   - Section header gains hero-stat (DP2.1)

### Canonical surface adds (per audit)

| Layer | Action |
|---|---|
| Section header | Already has hero-stat (CTR). Locked. |
| Cohort note | Add per DP10.1 |
| Run-stats | Add per DP11.1 |
| KPI strip | Add `.ep-kpi-strip` w/ 4 tiles per Max Apr-30 exports: `[Overview | CTR | Clicks | Impressions]` |
| Perf-tabs | Add per DP4.3 — `[Overview | By Store | By Day | By Creative | Time Trend | Data]` (entity-drill IA per DP4.1) |
| Sub-tabs | Add `.ep-sub-tabs` per metric pane (Group 5) |
| Selector strip | Add `.ep-chips-row` selector strip ABOVE KPI tiles for multi-campaign nav (Apr-30 lock — replaces today's `.creative-list` carousel). All-card "All Campaigns · 135 campaigns · N advertisers" pinned outside scroll |
| `.creative-list` | **Drop** as ranker (per DP15.1). Carousel role replaced by `.ep-chips-row` |
| Ranked items | `.dist-tree-data-grid` preserved as Distribution canonical for hierarchical drill (DP1.1 preservation). Lands in Ranked Table view-mode of selector strip (DP-NEW-0.1) |
| Trend chart | eCharts stays. Rename `.duration-presets` → `.ep-trend-ranges` |
| Detail sidebar | `.ep-detail-sidebar` fixed overlay (DP8.1) |
| View All | Jump buttons on overview-panel cells where perf-tabs target exists |

---

## distribution-traffic.html → PERF-TABS REBUILD (Bill 2026-05-01)

**DP4.2 = B locked.** Current sequential narrative (5 stacked sections) → `.perf-tabs` container.

### Tab order: `[Overview | By Competitor | By Store | Crossover Trend | Traffic Volume | Data]`

| Tab pane | Hosts |
|---|---|
| Overview | Hero + Competitive Crossover stacked-area (eCharts) + leaderboard preview |
| By Competitor | Full `.leaderboard-table` + `.compare-panel` modal trigger |
| By Store | Per-store share table + Leaflet map (Max Apr-17 LOCKED keep) + `.map-ring-legend` |
| Crossover Trend | Crossover line chart over time |
| Traffic Volume | Visits + CTR overlay bars (eCharts dual-axis) |
| Data | Dense `.leaderboard-table` view (preservation rule) |

### Other adds

| Layer | Action |
|---|---|
| Section header | Hero-stat already canonical (Share %). Locked. |
| Cohort note | Add per DP10.1 |
| Run-stats | Add per DP11.1 |
| KPI strip | Optional — Traffic uses single-hero stat-strip; KPI strip not strictly needed unless multi-metric makes sense. Defer. |
| Trend chart | eCharts stays. Rename `.duration-presets` → `.ep-trend-ranges` |
| Inverse toggle | Already removed (Max Apr-17). Layer legend (circle/diamond) still pending design |

---

## index.html → REFERENCE / OUT OF SCOPE

Combined dashboard landing. Scope: out-of-scope for this audit pass. AI implementer addresses post-MVP if it lands in product.

---

## Cross-cutting AI implementer notes

1. **eCharts everywhere** for trend / bar / stacked-area / line+bar dual-axis. Use `ngx-echarts` Angular wrapper.
2. **PrimeNG components map:**
   - `.perf-tabs` → `p-tabView` (or chip-style if migration to creative-chips pattern lands per forward-note)
   - `.ep-detail-sidebar` → `p-sidebar` (right, modal: false)
   - `.compare-panel` modal → `p-dialog`
   - Selector strip view-toggle → `p-selectButton` w/ icon+label option
   - KPI tile + jump → custom; PrimeNG `p-card` styled w/ click handler
3. **Number formatting:** wrap raw numbers in `Intl.NumberFormat('en-US').format(n)` at the rendering layer (Angular pipe = `number:'1.0-0':'en-US'`).
4. **Header version-toggle markup retained but hidden** via global CSS (`.view-version-toggle { display: none !important; }`). Don't remove markup.
5. **REPORT button** lands on the canonical Engagement Promotions report (currently `engagement-promotions-proposed-max.html` in prototype; in production = the corresponding Angular route).
6. **Forward-looking:** chip-strip-as-sub-tabs candidate (Bill Group 13) — flag for post-MVP design pass.
