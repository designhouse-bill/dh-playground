# Audit: Existing Chrome Classes (Gate 1)

**Date:** 2026-05-01 | **Purpose:** Catalog every working class before any extraction into `css/distribution-shared.css`. Nothing is extracted until this audit is done.

**Files audited:**
- `css/distribution.css` — 774 top-level selectors, 5,078 lines
- `css/engagement.css` — 969 top-level selectors
- Inline `<style>` blocks: only `engagement-promotions-proposed-max.html` (distribution HTMLs have zero inline styles)

---

## Duplication Alert — Classes Defined in BOTH Files

These exist in `distribution.css` AND `engagement.css` with the same selector name. Prime extraction candidates for `distribution-shared.css`.

| Class | In distribution.css | In engagement.css | Notes |
|-------|--------------------|--------------------|-------|
| `.kpi-label` | line 169 | line 1854 | near-identical rule |
| `.kpi-value` | line 177 | line 1835 | near-identical rule |
| `.view-toggle` | — | line 1359 | NOT in distribution.css yet |
| `.view-toggle__btn` | — | line 1364 | NOT in distribution.css yet |
| `.view-toggle__label` | — | line 1396 | NOT in distribution.css yet |
| `.th-sort-icon` | — | line 1462 | NOT in distribution.css |
| `.th-sortable` | — | line 1430 | NOT in distribution.css |
| `.tree-toggle` | — | line 4298 | NOT in distribution.css |
| `.tree-toggle-placeholder` | — | line 4325 | NOT in distribution.css |
| `.type-badge` | — | line 4337 | NOT in distribution.css |
| `.type-badge--brand/subbrand/store/brand-group/sub-group` | — | lines 4348–4368 | NOT in distribution.css |

**Note:** Agent initially reported all as "in both" — verified: `.view-toggle`, `.th-sort-*`, `.tree-toggle`, `.type-badge` exist only in `engagement.css`. Only `.kpi-label` and `.kpi-value` are true duplicates.

---

## Section 1 — Page Shell / Layout Chrome

### `css/distribution.css`

`.dist-section` (line 85) — Section visibility container; `display:none` by default  
`.dist-section.active` (line 96) — Makes section visible  
`.dist-tab` — Cross-page section nav tab (Visitation / Media / Traffic)  
`.dist-section-tabs` — Container for cross-page tabs  
`.dist-tree-data-grid` (line 690) — Outer grid wrapping toolbar + scroll table  
`.dist-tree-table-wrap` (line 700) — Scrolling ancestor; `max-height:480px; overflow-y:auto`  
`.dist-tree-header` (line 706) — Toolbar header row (toggle + action buttons)  
`.dist-tree-actions` (line 767) — Button group inside toolbar  
`.dist-tree-action-btn` (line 773) — Export / print / share icon buttons  
`.dist-tree-table` (line 799) — The data table itself  

### `css/engagement.css`

`.ep-scaffold` — Engagement page outer shell  
`.ep-metric-filter` — Global metric filter bar  

---

## Section 2 — KPI Strip / Stat Strip

### `css/distribution.css` (authoritative, has most variants)

`.kpi-row` (line 148) — Horizontal flex container  
`.kpi-tile` (line 154) — Individual KPI card  
`.kpi-tile--primary` (line 164) — Primary featured tile  
`.kpi-label` (line 169) — ⚠️ DUPLICATE — also in engagement.css  
`.kpi-value` (line 177) — ⚠️ DUPLICATE — also in engagement.css  
`.kpi-trend` (line 188) — Trend indicator (up/down/flat) with icon  
`.kpi-trend--up` / `.kpi-trend--down` (lines 200–204)  

`.stat-strip` (line 3658) — Horizontal strip of stat items  
`.stat-strip__title` (line 3668)  
`.stat-strip__cards` (line 3672)  
`.stat-strip__item` (line 3680)  
`.stat-strip__label` (line 3694)  
`.stat-strip__value` (line 3724)  
`.stat-strip__value-row` (line 3718)  
`.stat-strip__trend` (line 3731) — Trend icon in stat strip  
`.stat-strip__trend--up/down/flat` (lines 3747–3749)  
`.stat-strip__separator` (line 3751)  
`.stat-strip__proposed-badge` (line 3705)  
`.stat-strip__cards > .stat-strip__item` (first-child / nth-child rules)  

### `css/engagement.css`

`.kpi-value` (line 1835) — ⚠️ DUPLICATE  
`.kpi-weighted` (line 1843) — Engagement-only weighted display  
`.kpi-raw` (line 1849) — Engagement-only raw display  
`.kpi-label` (line 1854) — ⚠️ DUPLICATE  
`.ep-kpi-strip` — Engagement KPI strip (inline in proposed-max)  
`.ep-kpi-tile` — Engagement KPI tile (inline in proposed-max)  

---

## Section 3 — Hero Band / Narrative Header

All in `css/distribution.css`. NOT in engagement.css (engagement uses inline styles in proposed-max).

`.narrative-header` (line 3620) — Page narrative section header  
`.narrative-header__title` (line 3628)  
`.narrative-header__text` (line 3639)  
`.narrative-header__question` (line 3643)  
`.narrative-header__subtitle` (line 3651)  

`.hero-stat` (lines 3453, 3551) — Hero metric container (inside `@media` blocks — responsive)  
`.hero-stat > .narrative-header` (line 3458) — Scoped child rule  
`.hero-stat > .stat-strip` (line 3461) — Scoped child rule  

**Gap:** No `.dist-hero-band` class exists yet. Plan creates it as the shared Distribution hero band component. Distinct from `.hero-stat` (which is Visitation-specific context).

---

## Section 4 — Sub-Tabs / Perf-Tabs

### `css/distribution.css`

`.perf-tab` (line 4135) — Individual perf tab button  
`.perf-tab .material-symbols-outlined` (line 4150)  
`.perf-tab:hover` (line 4154)  
`.perf-tab.active` (line 4158)  
`.perf-tab-pane` (line 4163) — `display:none` default  
`.perf-tab-pane.active` (line 4164) — `display:block`  
`body[data-dist-page] .perf-tab.active` (line 3895) — Section-color underline via CSS var  

### `css/engagement.css` (inline styles in proposed-max)

`.perf-tabs--metric` — 4-column metric tab bar  
`.perf-tab--metric` — Individual metric card tab  
`.ep-sub-tabs` — Dimension subtab strip  
`.ep-sub-tab` — Individual subtab  

---

## Section 5 — Pane Toolbar (Mode/Range Selectors)

### `css/distribution.css`

`.duration-presets` (line 3937) — Range chip row (1W/4W/13W/1Y)  
`.duration-preset` (line 3945) — Individual range chip  
`.duration-preset:last-child` (line 3957)  
`.duration-preset:hover` (line 3959)  
`.duration-preset.active` (line 3964)  
`.duration-preset__sub` (lines 3983, 4386 — two definitions, second overrides)  
`.duration-presets--compact` (line 4978) — Compressed variant  
`.duration-presets--compact .duration-preset` (line 4983)  

`.store-perf-header` (line 2305) — Per-pane header row in Visitation store tab  
`.store-perf-header--left` (line 2316)  
`.store-perf-actions` (line 2322)  

**Gap:** No `.dist-pane-toolbar` class exists yet. Plan creates it as the canonical shared pane toolbar (replaces per-pane bespoke headers). `.duration-presets` becomes a child of `.dist-pane-toolbar`.

### `css/engagement.css`

`.ep-trend-ranges` — Engagement alias for range chips (same pattern as `.duration-presets`)  
`.ep-trend-toolbar` — Engagement pane toolbar  
`.ep-promo-toolbar` — Promotions-specific toolbar  
`.ep-view-toggle` — Engagement view mode toggle  
`.ep-view-toggle__btn`  

`.view-toggle` (line 1359) — Generic view toggle (bar/data/trend)  
`.view-toggle__btn` (line 1364)  
`.view-toggle__btn:hover` (line 1381)  
`.view-toggle__btn.active` (line 1386)  
`.view-toggle__btn .material-symbols-outlined` (line 1392)  
`.view-toggle__label` (line 1396)  

**Note:** `.view-toggle` and `.view-toggle__btn` are engagement-only right now. They're the canonical shared component and should move to `distribution-shared.css`.

---

## Section 6 — Chip Selectors / Creative Chips

### `css/distribution.css`

`.creative-list__toolbar` (line 315)  
`.creative-sort` (line 322)  
`.creative-sort__select` (line 331)  
`.creative-list__total` (line 343)  
`.creative-list--inline` (line 369) + children  
`.creative-card` (line 392) — Full creative card (carousel-era)  
`.creative-card__top` (line 401)  
`.creative-card__top-left` (line 412)  
`.creative-card__rank` (line 418)  
`.creative-card__info` (line 433) + `__info_text`  
`.creative-card__thumb` (line 451) + `--square`  
`.creative-card__name`, `__region`, `__date`, `__dims` (lines 474–506)  
`.creative-card__metrics` (line 506)  
`.creative-metric-tile`, `__label`, `__value` (lines 517–540)  
`.creative-card__actions`, `__link`, `__details-btn` (lines 554–611)  

**Note:** `.creative-card` is the Visitation carousel card pattern. Media's chip pattern is distinct — chips are smaller, inline selector-strip style.

### `css/engagement.css`

`.ep-chips-row` — Horizontal chip strip container  
`.ep-chip` — Individual chip  
`.ep-chip__icon` — Chip icon slot  
`.ep-chip__name` — Chip label  
`.ep-chip__badge` — Chip count badge  

**Gap:** No `.creative-icon` class exists anywhere. Plan creates it as the shared brand-colored 2-letter initials block for chip brand identity.

---

## Section 7 — Overview Panels / 2-Col Layout

### `css/distribution.css`

`.perf-overview-grid` — Grid container for overview panels  
`.perf-overview-panel` — Individual overview panel  
`.chart-card` — Generic chart container card  
`.chart-card__header`  
`.demo-charts-grid` — Demographics chart grid  
`.visitation-composition-row` — Visitation-specific 2-col row  
`.visitation-donut-card` — Visitation donut chart card  
`.compare-panel` — Compare section panel  

**Gap:** No `.dist-2col` class exists yet. Plan creates it as the shared 2-column panel layout (used in both Media and Visitation panes).

### `css/engagement.css`

`.ep-overview-panels` — Overview panel grid  
`.ep-overview-panel` — Individual engagement panel  
`.ep-detail-cols` — 2-col layout in engagement  
`.ep-detail-header`, `.ep-detail-strip`  

---

## Section 8 — Data Tables

### `css/distribution.css`

`.dist-tree-table` and all `.col-*` width rules (lines 807–831)  
`.dist-tree-table thead` (line 836) + `th`, `td` rules  

### `css/engagement.css`

`.th-sortable` (line 1430) — Sortable header cell  
`.th-sort-icon` (line 1462) — Sort indicator icon  
`.th-sort--active` (line 1473) — Active sort state  
`.tree-toggle` (line 4298) — Tree expand/collapse button  
`.tree-toggle:hover` (line 4313)  
`.tree-toggle.collapsed` (line 4317)  
`.tree-toggle-placeholder` (line 4325) — Spacer for non-expandable rows  
`.type-badge` (line 4337) — Content type badge (GIF/JPEG/VIDEO)  
`.type-badge--brand/subbrand/store/brand-group/sub-group` (lines 4348–4368)  

---

## Section 9 — Inline Styles (engagement-promotions-proposed-max.html only)

Distribution HTML files have zero inline `<style>` blocks. All their classes are in `css/distribution.css`.

`engagement-promotions-proposed-max.html` inline `<style>` (approx. 500 lines):

`.view-version-toggle` — Original/Proposed/Max switcher  
`.perf-tabs--metric` — 4-col metric tab bar  
`.perf-tab--metric` — Metric card tab  
`.ep-sub-tabs`, `.ep-sub-tab` — Dimension subtabs  
`.ep-kpi-strip`, `.ep-kpi-tile` — KPI strip  
`.ep-overview-panels`, `.ep-overview-panel` — Overview grid  
`.ep-detail-cols`, `.ep-detail-header`, `.ep-detail-strip`  
`.ep-stacked-list` — V/C/A stacked bar list  
`[data-ep-pane]` attribute selectors — Section color scoping  

---

## Color Tokens — Current State (Hardcoded)

No CSS custom properties exist for funnel or audience colors. All hardcoded in rules:

| Color | Hex | Used for |
|-------|-----|---------|
| Blue | `#4272D8` | Impressions / Views (funnel) |
| Amber | `#f59e0b` | Clicks (funnel) |
| Green | `#22c55e` / `#10B981` | Visits / Loyalty (audience new) |
| Orange | `#f97316` | Returning audience |
| Purple | `#937DF8` | Adds (engagement only) |
| Mint | `#d1f0e0` | Active state background |

**Plan creates:** `--dist-funnel-1/2/3` and `--dist-audience-1/2/3` in `css/distribution-shared.css` `:root` block.

---

## New Classes to be Created (Don't Exist Anywhere Yet)

These are NOT in any current CSS file. Phase R1 creates them in `css/distribution-shared.css`:

| Class | Purpose |
|-------|---------|
| `--dist-funnel-1/2/3` | Funnel color tokens (Impressions/Clicks/Visits) |
| `--dist-audience-1/2/3` | Audience segment color tokens |
| `.dist-hero-band` | Hero band shell (selected item + 3 sub-metrics) |
| `.dist-pane-toolbar` | Mode toggle + range chips row inside each pane |
| `.dist-2col` | Two-column panel grid, mobile collapses to single |
| `.dist-chip-selector` | Chip strip variant with brand-color icon support |
| `.creative-icon` | Brand-colored 2-letter initials block |
| `.creative-icon--{type}` | Per-brand type variants |

---

## Classes to Move INTO distribution-shared.css (Exist, Need Relocation)

These exist in `engagement.css` or `distribution.css` and should move to shared:

| Class | Current location | Action |
|-------|-----------------|--------|
| `.view-toggle` + children | `engagement.css` L1359 | Move → shared |
| `.kpi-label` | both files | Canonical → shared, delete duplicates |
| `.kpi-value` | both files | Canonical → shared, delete duplicates |
| `.duration-presets` + children | `distribution.css` L3937 | Move → shared (both pages use range chips) |
| `.ep-trend-ranges` alias | memory says it exists | Alias → shared pointing at `.duration-presets` rules |
| `.th-sort-icon`, `.th-sortable` | `engagement.css` L1430 | Move → shared |
| `.tree-toggle`, `.tree-toggle-placeholder` | `engagement.css` L4298 | Move → shared |
| `.type-badge` + variants | `engagement.css` L4337 | Move → shared |

---

## Gate 1 Complete

Audit complete. Extraction can proceed to Phase R1:

1. Create `css/distribution-shared.css` with new classes + moved classes listed above
2. Update `css/distribution.css` — delete moved classes, add `@import` or `<link>` reference
3. Update `css/engagement.css` — delete moved classes, add reference
4. Add `<link rel="stylesheet" href="css/distribution-shared.css">` to all 3 distribution HTMLs
