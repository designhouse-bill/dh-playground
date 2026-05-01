# Surfaces Catalog — Engagement Rest (Layer 1)

**Scope:** `engagement-categories.html`, `engagement-circulars.html`, `engagement-compare.html`, `engagement-grid.html`

**Method:** Layer 1 inventory pass (Claude). Classified against Proposed-Max canonical (K/U/T/D).

---

## Page-by-page summary

| Page | Posture | Headline finding |
|---|---|---|
| **engagement-categories.html** | Two-column Base layout (left grid + right inline detail) | All Base-era chrome. No hero-stat, no perf-tabs. Two upgrades needed: detail panel + grid impl. |
| **engagement-circulars.html** | Mirror of Categories, store-flavored | Same Base posture. Class names misleadingly reused (`.panel--category-grid` for stores). |
| **engagement-compare.html** | Standalone canonical compare workflow | Own IA (entity-drill tabs + dual A/B contexts). NOT a Proposed-Max migration target. |
| **engagement-grid.html** | Full-width Explore/table page | Production-grade Base table — perfect threading candidate for Data sub-pane. |

---

## Section A — Raw catalog (21 surfaces, K/U/T/D classified)

### Categories page

| # | Surface | File:lines | Classes | Class | Rationale |
|---|---|---|---|---|---|
| 1 | Category list grid panel | 153–201 | `.panel--category-grid`, `.category-data-grid` | **U** | Should upgrade to `.ep-stacked-list` (canonical rank-items) |
| 2 | Category detail panel (inline) | 222–248 | `.panel--right`, `.panel--collapsed` | **U** | Upgrade to `.ep-detail-sidebar` (fixed overlay) |
| 3 | Panel header chrome | 154–200 | `.panel-header--categories` | **D** | Layer dropdown + More Data toggle are Base-era; canonical replaces w/ `.section-panel-header` + perf-tabs |

### Circulars page

| # | Surface | File:lines | Classes | Class | Rationale |
|---|---|---|---|---|---|
| 4 | Store list grid panel | 153–221 | `.panel--category-grid` (misnamed!), `.store-data-grid` | **U** | Same as #1, store-pivoted. Rename class. |
| 5 | Store detail panel (inline) | 224–252 | `.panel--right`, `.panel--collapsed` | **U** | Same as #2 |
| 6 | Panel header chrome | 154–200 | `.panel-header--categories` (reused) | **D** | Same as #3 |

### Compare page (own canonical workflow)

| # | Surface | File:lines | Classes | Class | Rationale |
|---|---|---|---|---|---|
| 7 | Compare layer tabs | 111–123 | `.compare-layer-tabs`, `.compare-layer-header` | **K** | Compare-canonical (entity-drill, valid for compare workflow) |
| 8 | Context columns A/B | 125–199 | `.compare-context-bar`, `.context-column--a/b` | **K** | Compare-canonical dual-context |
| 9 | Compare copy buttons | 155–158, 195–198 | `.copy-context-btn` | **K** | Compare-canonical UX |
| 10 | Compare prompt empty-state | 163–167 | `.compare-prompt`, `.prompt-icon` | **K** | Compare-canonical empty state |
| 11 | Compare results grid scaffold | 202–211 | `.compare-results-container`, `.compare-grid`, `.compare-empty-state` | **T** | Threading surface — host result cards/charts inside |

### Grid page (Explore / full table)

| # | Surface | File:lines | Classes | Class | Rationale |
|---|---|---|---|---|---|
| 12 | Grid controls header | 160–196 | `.grid-controls`, `.grid-controls__left/center/right` | **U** | Simplify; thread into Data sub-pane controls |
| 13 | Column-visibility dropdown | 181–194 | `.grid-columns-toggle`, `.grid-columns-dropdown` | **T** | Threading — valuable inside Data sub-pane |
| 14 | **Data table (the table to preserve)** | 197–202 | `.grid-table`, `.grid-data-table` | **T** | This is THE Base production table. Threads into Proposed-Max Data sub-pane. |
| 15 | Grid footer + pagination | 203–223 | `.grid-footer`, `.grid-pagination`, `.grid-rows-select` | **T** | Threading — host inside Data sub-pane |

### Shared across all 4 pages

| # | Surface | Pages | Class | Rationale |
|---|---|---|---|---|
| 16 | Date range selector | All 4 | **K** | Already canonical |
| 17 | Entity selector | Cat/Circ/Grid | **K** | Already canonical |
| 18 | Filter chips strip | Cat/Circ/Grid | **K** | Already canonical |
| 19 | Date picker modal | All 4 | **K** | Shared canonical modal |
| 20 | Entity selector modal | All 4 | **K** | Shared canonical modal |
| 21 | Add Filter modal | Cat/Circ/Grid | **K** | Shared canonical modal |

---

## Section B — Purpose groups (canonical-vs-this-page)

### Group 1: Data grid / Ranked-items lists
- **Canonical (Proposed-Max):** `.ep-stacked-list` — multi-segment bars, metric-colored, 9 rows per metric tab
- **Categories:** `.category-data-grid` — multi-column table → **U**
- **Circulars:** `.store-data-grid` — multi-column table (misnamed class) → **U**
- **Grid:** `.grid-data-table` — production-grade 75+ row sortable table → **T** (threads into Data sub-pane)
- **Mismatch:** Categories/Circulars at lower density than Grid. Grid is the production-ready impl. The Base table threads into the canonical Data sub-pane; Categories/Circulars need to decide between adopting `.ep-stacked-list` or threading their grids similarly.

### Group 2: Detail sidebar
- **Canonical:** `.ep-detail-sidebar` — fixed-position right edge, transform slide-in, 350px
- **Categories:** `.panel--right.panel--collapsed` (inline collapse) → **U**
- **Circulars:** Same → **U**
- **Mismatch:** Inline collapse is narrower scope (compresses layout grid) vs. fixed overlay (slides in, stays on top). Inline pattern is OK for smaller screens; fixed overlay is better for rich interactions. **Bill decision: standardize on one or allow both?**

### Group 3: Section header / context framing
- **Canonical:** `.section-panel-header` + `.hero-stat` + `.narrative-header` (colored accent + title + question + inline stat)
- **Categories:** `.panel-header--categories` (no narrative, no hero-stat) → **D**
- **Circulars:** Same → **D**
- **Grid:** `.grid-controls` (EXPLORE label, controls only) → **D**
- **Compare:** No header block — uses `.compare-layer-tabs` instead — **K** (compare-canonical)
- **Mismatch:** None of the rest-pages have hero-stat. Decision: do they get full Proposed-Max canonical treatment (metric-first tabs + hero-stat) or remain as simpler Base-era reports?

### Group 4: Tab navigation
- **Canonical:** `.perf-tabs` w/ metric-first tabs (Sessions, Users, Duration, Card Events) + sub-tabs per metric
- **Categories/Circulars/Grid:** No perf-tabs at all
- **Compare:** `.compare-layer-tabs` (entity-drill: By Circular/Category/Promotion) — orthogonal to Proposed-Max — **K**
- **Mismatch:** Compare's tabs are valid (compare-canonical). Categories/Circulars/Grid have no tabs — single-layer reports. **Decision: should Categories/Circulars get their own metric-first Proposed-Max equivalents?**

### Group 5: Modals (shared)
- **All four pages use the canonical modals** — date picker, entity selector, add filter
- **Classification:** **K** across the board. Modal infrastructure is consistent and aligned.

---

## Section C — Mismatches & surprises

1. **Detail panel: inline collapse vs. fixed overlay** — coexist or standardize? (Inline is narrower scope, overlay is richer.)
2. **"More Data" toggle (Categories/Circulars)** — legacy chrome. Proposed-Max removes it; the Base table threads into Data sub-pane instead. Drop or keep?
3. **Layer dropdown (Categories/Circulars)** — page-level Promotions/Categories/Circulars switcher. Proposed-Max doesn't have this. Replace w/ separate canonical pages, or keep as Base convenience?
4. **Compare grid pending** — `.compare-grid` is a scaffold; result cards/charts will thread in. **T**, correctly.
5. **Misleading class names** — Circulars uses `.panel--category-grid` for stores, `.panel-header--categories` for store header. Cleanup task.
6. **Grid lacks detail sidebar** — full-width table only. Possibly JS-wired, but no static HTML. Add detail sidebar, or table-only sufficient?
7. **Compare lacks standard context-row** — uses dual `.context-selectors` inside `.compare-context-bar` instead. Correct for compare workflow; not a mismatch.
8. **Grid sorting UX** — column-clickable presumably. Should Grid's sorting impl become the Data sub-pane canonical?

---

## Bill's pending decisions (from this catalog)

1. **Categories + Circulars rebuilds** — full Proposed-Max canonical (metric-first tabs + hero-stat + ep-stacked-list) OR minimal upgrades only (detail-sidebar + cleanup)?
2. **Grid future** — fold into Proposed-Max as Data sub-pane, OR keep as standalone Explore page?
3. **"More Data" toggle** — drop everywhere, or keep on Base-era pages?
4. **Layer dropdown** — replace w/ separate pages, or keep as Base-era convenience?
5. **Detail panel pattern** — standardize on fixed overlay, or allow inline-collapse on smaller-context pages?
6. **Class name cleanup** (Circulars) — rename `.panel--category-grid` → something accurate.

---

## Threading the Base table — confirmed home

The Grid page's `.grid-data-table` (line 197) is **the Base production table** — sortable, paginated, column-visibility configurable. Per Bill's threading requirement: it lands in **Proposed-Max's Data sub-pane** (`.ep-data-table` scaffold inside each metric tab).

Already done in Proposed-Max: scaffold exists at lines 1885–2044 (JS-wired). Migration: lift the Grid table's column config + sorting + pagination logic into the Proposed-Max Data sub-pane render path. Column-visibility dropdown (#13) and footer pagination (#15) come along for the ride.
