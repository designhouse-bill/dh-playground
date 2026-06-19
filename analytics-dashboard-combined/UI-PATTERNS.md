# Analytics Dashboard — UI Patterns

**Status:** living doc. Locked patterns vs known drift are flagged separately.
**Read before:** writing any new class, component, filter, chart, or modal.
**On Angular port:** every pattern below maps to a typed component / service. Drift becomes a pre-port cleanup ticket.

---

## How to use this file

1. **Before adding a new pattern:** grep for an existing one. If found → reuse. If not → add a new entry to this doc in the SAME ticket that introduces it.
2. **Before changing a pattern:** check "Where used" — touching the canonical pattern means touching every consumer.
3. **Naming:** if your code says `entityLevel === 'sub-brand'` but this doc says `subBrand`, you're drifting. Pick canonical.
4. **Drift entries are tech debt** — surface them in the next plan cycle, don't propagate them.

---

## Conventions

- **Canonical** = the majority pattern + the one to converge toward.
- **Drift** = the same concept implemented inconsistently; cleanup target.
- **Where used** = grep hint, not exhaustive.
- **When to add a new variant** = guardrail against pattern proliferation.

---

## Lock Legend

Every pattern entry carries one of three states. State is stamped at the top of the entry — `🔒 LOCKED 2026-05-29 (Adam Portal Review)`, `📝 DRAFT`, or `🆕 NEW`.

| State | Meaning | Mutability |
|-------|---------|------------|
| 🔒 **LOCKED `<date> (<meeting-ref>)`** | Stakeholder-accepted at the referenced review. The DOM / class / token shape is a contract with the future Angular port. | Verbatim required. Touch only with an explicit "unlock `<pattern-id>`" instruction from Bill, paired with a same-commit catalog update. |
| 📝 **DRAFT** | Built, awaiting next stakeholder review. The shape is plausible but not contractual yet. | Mutable. Iterate freely; revisit at the next review for promotion to 🔒 or revision. |
| 🆕 **NEW** | Being added in the current ticket. Has not survived any review. | Mutable, but must pass both gates (see Change Protocol) before merge. |

**Infra-LOCKED nuance.** Infra entries (e.g. `PerfCharts.createChart`, `dashboard:dataRefresh` event, storage keys, type contracts) lock the **contract** — signature, event name, payload shape — NOT the implementation. Internals can be refactored without unlocking, as long as the contract holds.

---

## Change Protocol

Two gates run before any pattern edit lands. Skip either → drift.

**Gate A — Lock check (don't break accepted shape):**
1. Grep target file classes / tokens against every 🔒 LOCKED entry.
2. Overlap with a LOCKED entry → reuse it. No "v2" class, no parallel token, no shadow component.
3. If the LOCKED shape genuinely cannot accommodate the new requirement → STOP, surface to Bill, get an explicit "unlock `<pattern-id>`" before continuing.

**Gate B — Pattern reuse (don't fork existing canonical):**
1. Grep for the same job already done — by canonical name, by role, by where-used hint.
2. 80% fit → extend the canonical entry with a variant subsection. Don't fork into a new top-level pattern.
3. < 80% fit and genuinely novel → add a new entry stamped `🆕 NEW` in the same commit that introduces the code.

**Review → lock cycle.** After every stakeholder review that touches patterns in this file:
1. Diff what was shown vs. the prior accepted state.
2. Promote each accepted `🆕 NEW` / `📝 DRAFT` entry → `🔒 LOCKED <date> (<meeting-ref>)` in the SAME session.
3. Commit message: `lock: <pattern-ids> per <stakeholder> YYYY-MM-DD`.
4. Add a row to the Meeting Ledger below.
5. From that point on, edits to the locked entries require an explicit unlock.

---

## Meeting Ledger

Append-only log of stakeholder reviews that locked patterns. Use this to audit which review a contract traces back to.

| Date | Meeting | Patterns locked |
|------|---------|-----------------|
| 2026-05-29 | Adam Portal Review | §1.1–§11.4 — all page-shell, tab-nav, chart-shell, bar/donut, filter-chip, top-5, modal/overlay, state-persistence, event-bus, and naming patterns shipped into the review. Locked retroactively via the A2 stamp pass (2026-06-04). §7.2 held 📝 DRAFT pending the panel-href schema decision. §12–15 are reference indexes, intentionally unstamped. |

---

# 1. Page shell

## 1.1 .context-row (canonical)

> **State:** 🔒 LOCKED 2026-05-29 (Adam Portal Review)

The top entity + date picker row. Same DOM shape across all engagement + distribution pages.

```html
<div class="context-row" data-canon="context-row-v1">
  <button class="context-card context-card--date" id="date-selector">...</button>
  <button class="context-card" id="entity-selector">...</button>
</div>
```

- Marker attribute `data-canon="context-row-v1"` makes grep cheap.
- IDs `#context-date-value`, `#context-entity-value`, etc. are read by per-page JS to update.
- Modal dispatchers emit `compare:dateSelected` / `compare:entitySelected` (compare) or `dashboard:dataRefresh` (engagement/distribution).

**Where used:** all engagement-*.html + distribution-*.html
**Drift:** none currently. Stay 1:1.

## 1.2 .hero-stat + .narrative-header (canonical)

> **State:** 🔒 LOCKED 2026-05-29 (Adam Portal Review) — shape locked; per-page content drift noted below is expected, not an unlock.

Hero region directly under the header. Question prompt + KPI strip pattern.

```html
<div class="hero-stat">
  <div class="narrative-header">
    <h4 class="narrative-header__section">Engagement | Distribution</h4>
    <h1 class="narrative-header__title">Page name</h1>
    <h2 class="narrative-header__question">Question this page answers?</h2>
  </div>
  <div class="stat-strip" id="...-stat-strip">
    <div class="stat-strip__cards">
      <div class="stat-strip__item">cohort sentence or KPI</div>
    </div>
  </div>
</div>
```

**Drift:**
- Engagement Report hero stat-strip swaps content per active perf-tab (cohort vs KPI). Distribution stat-strip stays cohort-only.
- Distribution-media cohort updates per-campaign (Phase 5+ wiring). Other distribution pages do not.

---

# 2. Tab navigation

## 2.1 .perf-tabs (canonical for KPI tabs)

> **State:** 🔒 LOCKED 2026-05-29 (Adam Portal Review)

Used as the primary nav inside `.chart-card__header-left` on engagement-report.

```html
<div class="perf-tabs perf-tabs--filled" id="ep-perf-tabs" role="tablist">
  <button class="perf-tab perf-tab--active" data-perf-tab="overview" role="tab">...</button>
</div>
```

**Where used:** engagement-report (hero KPI tabs), engagement-compare layer-tabs, distribution section tabs.

## 2.2 .ep-sub-tabs (canonical for chart-card sub-views)

> **State:** 🔒 LOCKED 2026-05-29 (Adam Portal Review) — `data-sub` vs `data-dist-sub` drift stays as documented; unify only via the §14 pre-port ticket, not an ad-hoc rename.

Inside `.chart-card__header-left`, sub-views of a single chart-card.

```html
<div class="ep-sub-tabs" id="...-perf-tabs" role="tablist">
  <button class="ep-sub-tab ep-sub-tab--active" data-dist-sub="trend" role="tab">Time Trend</button>
  <button class="ep-sub-tab" data-dist-sub="store">by Store</button>
</div>
```

Sub-panes use `.ep-sub-pane` + `.ep-sub-pane--active`.

**Drift:** engagement uses `data-sub`, distribution uses `data-dist-sub`. Naming inconsistency. Cleanup target.

## 2.3 data-show-on-sub (canonical)

> **State:** 🔒 LOCKED 2026-05-29 (Adam Portal Review)

Controls that should only appear for one sub-tab use:

```html
<div data-show-on-sub="trend">...</div>
```

Tab-activation handler must toggle `display:none/''` on every `[data-show-on-sub]` child.

## 2.4 dashboard-mode-switcher (index.html L0)

> **State:** 🆕 NEW 2026-06-04 (UX-846 L0) — reuses the LOCKED `.perf-tabs`/`.perf-tab` grammar (§2.1), no custom segmented control. Awaiting Adam round-2.

Mode switcher on `index.html`: Engagement / Distribution / Combined. Same `.perf-tabs` shell as Engagement Report KPI tabs; active = `.perf-tab--active` + `aria-selected`.

```html
<div class="perf-tabs perf-tabs--filled" id="dash-mode-tabs" role="tablist">
  <button class="perf-tab" data-dash-mode="engagement" role="tab">…</button>
  <button class="perf-tab perf-tab--active" data-dash-mode="combined" role="tab">…</button>
</div>
```

- Selection persists to `localStorage` key `dashboard-cells-v1` (`{mode, cells}`).
- Mode is a `product` prefix filter against the registry (§3.3) — no separate render paths.

**Where used:** `index.html` (`js/index/dashboard-app.js`).

---

# 3. Chart shells

## 3.1 .chart-card (canonical 3-row contract)

> **State:** 🔒 LOCKED 2026-05-29 (Adam Portal Review) — the 3-row contract is the lock. New chart-cards (e.g. Traffic Share, D2) MUST reuse this shell, not fork it.

Every chart-card has exactly 3 horizontal rows:

```html
<div class="chart-card">
  <div class="chart-card__header">     <!-- sub-tabs LEFT, duration-presets RIGHT -->
    <div class="chart-card__header-left">...</div>
    <div class="chart-card__header-right">...</div>
  </div>
  <div class="chart-card__controls">   <!-- chip-carousel + scoped toggles -->
    <div class="creative-chips-row">...</div>
  </div>
  <div class="chart-card__title-row">  <!-- panel-label LEFT, series-pills RIGHT -->
    <div class="chart-card__title-block">...</div>
    <div class="series-pills">...</div>
  </div>
  <!-- chart body -->
</div>
```

**Anti-pattern:** action buttons (Export / Print / Share) inside `.chart-card__controls`. They have no context. Remove on sight.

**Where used:** engagement-report, engagement-explore-base, distribution-media, distribution-traffic, distribution-visitation.

**Stack rule:** below 640px viewport, header rows stack. Tested CSS.

## 3.2 .ep-kpi-cell (canonical KPI cell shell)

> **State:** 🔒 LOCKED 2026-05-29 (Adam Portal Review) — shown + accepted as the Engagement Overview cell. **Post-L0.5 (2026-06-04) the Engagement Report Overview pane was stripped; `index.html` dashboard is now the sole surface that hosts `.ep-kpi-cell`.** The shell shape is the contract every dashboard cell reuses verbatim.

```html
<a class="ep-kpi-cell ep-kpi-cell--equal" href="…" data-story-id="…" data-jump-to="…">
  <div class="ep-kpi-cell__head">       <!-- story / metric / value / delta -->
  <div class="ep-kpi-cell__chart">      <!-- per-story viz body -->
  <span class="ep-kpi-cell__view">Open … <span class="material-symbols-outlined">chevron_right</span></span>
</a>
```

- Viz bodies reused across cells: V/C/A donut SVG, ranked-bar list, mini-dow, mini-device.
- `data-jump-to` carries the destination tab id. **Open item:** distribution destinations don't yet consume it cross-page (engagement honors `?tab=` via `canonical-shell-tabs.js`). See §14 / D-stream.

**Where used:** `index.html` dashboard cells (`js/index/dashboard-registry.js`). Shape pre-L0.5: `engagement-report.html` Overview pane (now removed).

## 3.3 dashboard-cell-registry (index.html L0)

> **State:** 🆕 NEW 2026-06-04 (UX-846 L0) — prototype is a JS object mirroring the Angular `KpiCellRegistry` Injectable + `ngComponentOutlet` shape so the port is mechanical. Awaiting Adam round-2.

```js
window.CELL_REGISTRY = {
  '<storyId>': { section, product: 'engagement'|'distribution', render, dataSource, defaultEnabled, defaultOrder }
};
window.CELL_LABELS = { '<storyId>': '<display name>' }; // single source for the name
```

- `getDashboardCells(mode, savedOrder)` — **savedOrder is authoritative**: a cell absent from it is disabled (not appended). New registry cells stay hidden until re-customized (matches admin-config / per-tenant model). Only `null` savedOrder = "never customized" → all cells, default order; an **empty array is a real "all disabled" state** and renders zero cells.
- `getAllDashboardCells(mode)` — full mode universe for the Customize modal.
- Render fn emits the LOCKED `.ep-kpi-cell` shell (§3.2); title sourced from `CELL_LABELS`.

**Angular port:** `memory/topics/analytics-kpi-cell-registry-pattern.md`.
**Where used:** `index.html` (`js/index/dashboard-registry.js`, `dashboard-app.js`).

---

# 4. Bar charts (V/C/A stacked horizontal)

## 4.1 PerfCharts.createChart contract

> **State:** 🔒 LOCKED 2026-05-29 (Adam Portal Review) · infra — the call **signature + maxTotal formula** are the contract; internals refactorable without unlock.

```js
PerfCharts.createChart(containerId, {
  views:     <number>,
  clicks:    <number>,
  adds:      <number>,
  composite: <number>,  // engagement score; used only when scoreOnly:true
}, {
  height:     16,
  maxTotal:   <number>,
  entityName: '',
  scoreOnly:  false
});
```

**Critical:** `maxTotal` must use the **same formula** as `buildChartOption`:

```js
weightedTotal = views * 1 + clicks * 5 + adds * 20
```

If you pass `composite` as maxTotal, segments collapse to one color (xAxis overflow). **Bug class:** the tooltip stays correct, masking the visual bug. See `js/engagement/compare.js` PHASE-5-FIX comment.

## 4.2 V/C/A palette tokens (canonical)

> **State:** 🔒 LOCKED 2026-05-29 (Adam Portal Review) — token names + color mapping are contract. Traffic Share cohort series reuse `--series-v/c/a`; no parallel palette.

```
--series-v   = blue   (Views)
--series-c   = amber  (Clicks)
--series-a   = green  (Adds)
```

**Where used:** PerfCharts METRIC_COLORS, .ep-device-strip, all 3-segment bars.

---

# 4b. Line / area charts (canonical: white nodes + fill)

## 4b.1 Node + fill style (canonical)

> **State:** 🔒 LOCKED 2026-06-18 (Adam/Max Jun-16 review, Bill direction). Every line/area chart with markers uses the SAME node — **white fill + colored ring** (size 7) — over a colored line (width 2). Two fill variants by data semantics. No bare lines, no solid-colored nodes.

**Canonical node (all variants):**
```js
symbol: 'circle', symbolSize: 7,
lineStyle: { color: C, width: 2 },
itemStyle: { color: '#fff', borderColor: C, borderWidth: 2 }   // white node, colored ring
```

**Variant A — independent series → gradient fill** (series don't sum to a whole; overlap composites via alpha):
```js
smooth: true,
areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
  { offset: 0, color: echarts.color.modifyAlpha(C, 0.30) },
  { offset: 1, color: echarts.color.modifyAlpha(C, 0) }
]) }
```
Used: Paid Media → Time Trend (`distribution-media.html` buildTrendOptions); Traffic → crossover-**overlap** trend (`distribution.js` updateCrossoverTrendPeriod, share mode).

**Variant B — composition / store-competitor share → solid 0.9 fill + `stack`** (series sum to a whole; bands must read as distinct regions):
```js
smooth: false,           // (composition; or true if the source uses smooth)
stack: '<group>',
areaStyle: { color: C, opacity: 0.9 }   // explicit color — required, else white node bleeds into fill
```
Used: Observed Visits → by Competitor (`distribution-visitation.html` buildCompOptions); Traffic → chart-crossover composition (`distribution.js` updateCrossoverChartPeriod, area mode).

**Gotcha (white itemStyle propagates 3 ways):** with white `itemStyle.color` you MUST re-supply the real color in three places, or each renders white:
1. `areaStyle` / `lineStyle` — set `color` explicitly (default = itemStyle color).
2. **Tooltip markers** — `p.color`/`p.marker` become white. Use a `name→color` map in the formatter and render the ring marker manually (`background:#fff; border:2px solid C`). Shared `darkAxisTooltip(params, valueFmt, colorFn)` takes an optional `colorFn` for this.
3. **Legend dots** — with `icon:'circle'` the legend uses itemStyle color. Pass `legend.data` as objects: `{ name, itemStyle: { color: C } }`.

`echarts.color.modifyAlpha(C, a)` accepts hex/named/rgb. **Sparklines excluded** (too small for visible nodes).

---

# 5. Donut charts

## 5.1 Lazy-init rule (HARD)

> **State:** 🔒 LOCKED 2026-05-29 (Adam Portal Review) · infra — hard engineering rule. Any new hidden-pane chart (incl. D1 map under a perf-tab) must obey lazy-init / resize-on-activate.

Donut charts inside a hidden pane (`display:none`) **must defer init** until the pane becomes visible, OR resize() the chart on tab activation. echarts grabs zero-width on init in a hidden container and the canvas paints invisible.

```js
// Right
function activate(target) {
  if (target === 'current') {
    if (!window._renderedOnce) { renderCurrent(); window._renderedOnce = true; }
    else { donutCharts.forEach(c => c.resize()); }
  }
}
```

**Bug class:** silent layout-time failure where data is correct but render dimensions are wrong. See distribution-demographics commit `8d50093`.

## 5.2 .od-card (observed-demographics donut shell)

> **State:** 🔒 LOCKED 2026-05-29 (Adam Portal Review)

```html
<div class="od-card od-card--donut" data-dim="gender">
  <div class="od-card__head">
    <span class="material-symbols-outlined od-card__icon">wc</span>
    <span class="od-card__title">GENDER</span>
    <span class="od-card__sub">2 buckets</span>
  </div>
  <div class="od-card__body" id="od-card-gender"></div>
</div>
```

---

# 6. Filter chips (campaign / creative / store)

## 6.1 .creative-chip-row + .creative-chip (canonical)

> **State:** 🔒 LOCKED 2026-05-29 (Adam Portal Review)

```html
<div class="creative-chips-row" id="pm-campaign-chips-row">
  <button class="creative-chip creative-chip--all creative-chip--active" data-pm-campaign="All Campaigns">...</button>
  <div class="creative-chips creative-chips--scroll" id="pm-campaign-chips-strip">
    <!-- dynamic chips -->
  </div>
</div>
```

- "All" chip is always first, has `--all` modifier.
- Scrollable strip uses `ChipCarousel.init(strip)` for arrow nav.
- Active state = `creative-chip--active` + `aria-pressed="true"`.

## 6.2 Chip-click contract

> **State:** 🔒 LOCKED 2026-05-29 (Adam Portal Review) · infra — behavioral contract (4 steps). Any new chip-filtered surface must update the hero/cohort sentence too.

Picking a chip MUST:
1. Toggle `--active` + `aria-pressed`
2. Update the underlying data slice
3. Re-render the dependent chart(s)
4. Update hero/cohort sentence reflecting the filter (so user sees the click acknowledged at the page top)

**Anti-pattern:** chip click only updates the chart, leaves the hero stat stale. Looks broken even when filter is correctly applied. See dist-media cohort-by-campaign fix.

---

# 7. Top-5 panels

## 7.1 renderTop5PanelsFromAggregate (canonical, engagement-report)

> **State:** 🔒 LOCKED 2026-05-29 (Adam Portal Review) · infra — `Top5Row` shape + DocumentFragment/dataRefresh render rules are contract.

5 panels (Stores / Categories / Promotions / Coupon Clips / Page Navigation) render from the same aggregate slice:

```js
aggregate.engagement.topStores         // Top5Row[]
aggregate.engagement.topCategories
aggregate.engagement.topPromotions
aggregate.engagement.topCouponClips
aggregate.engagement.topPageNavigation
```

Each `Top5Row` has `{ rank, name, value, metric, href }`. `href` field drives the row's click-through.

**Render rules:**
- Use `DocumentFragment` for row inserts; never `innerHTML` the whole list.
- Listen to `dashboard:dataRefresh`.

## 7.2 Panel-level data-href

> **State:** 📝 DRAFT — the `data-href` mechanism shipped, but the open schema decision (aggregate-level href field vs. static HTML) is unresolved. Held DRAFT until decided; do not fork a parallel href mechanism in the meantime.

Whole-panel click target. Currently static in HTML (`data-href="engagement-explore-base.html"`). **Drift:** no aggregate-level href field in schema §6.1. Decide: add to schema or keep static.

---

# 8. Modals & overlays

## 8.1 Permanent modal (canonical)

> **State:** 🔒 LOCKED 2026-05-29 (Adam Portal Review)

`.modal-overlay` + `.modal` shells with `data-modal-id="..."`. Open / close handled by `DashboardModals`.

## 8.2 Demo-only one-shot overlay (canonical)

> **State:** 🔒 LOCKED 2026-05-29 (Adam Portal Review) · infra — the removability convention (single-grep-prefix, no runtime coupling) is the contract.

For temporary scaffolding (e.g. pilot-data notice). Marked with `⚠ DEMO-ONLY · <prefix> · DO NOT PORT TO ANGULAR` comments on all 3 surfaces (HTML, CSS, JS). Single grep target removes everything.

Canonical example was `js/distribution/dist-pilot-banner.js` (the Q1-pilot notice), removed 2026-06-08 — its single-grep teardown across HTML/CSS/JS validated this convention. Reuse the `⚠ DEMO-ONLY · <prefix>` fencing for the next throwaway overlay.

**Rule:** demo-only scaffolding MUST be removable by `grep -rln "<prefix>" | xargs rm/edit` with no runtime coupling to state, services, or other components.

## 8.3 dashboard-customize-modal (index.html L0)

> **State:** 🆕 NEW 2026-06-04 (UX-846 L0) — reuses the LOCKED `.modal-overlay`/`.modal`/`.modal-*` shell (§8.1), no `DashboardModals` fork, no new global. Drag/drop reorder is the deferred stretch. Awaiting Adam round-2.

Toggle cells on/off + up/down reorder + reset; Save → `localStorage` (`dashboard-cells-v1`) → re-render. Built lazily into `<body>` by `dashboard-app.js`.

- Works on a draft copy of the enabled+ordered storyId list; commit on Save, discard on Cancel/Esc/backdrop.
- Cross-mode safe: saving in one mode preserves the other product's enabled cells.
- **index.html caveat:** the engagement.css `.modal` panel chrome does not take effect on index at runtime (a bare `.modal` computes transparent/uncapped despite the file loading + tokens resolving; cause unconfirmed), so `#dash-customize-modal .modal` gets explicit chrome in `dashboard-grid.css` — the locked class *names* are reused, values are local.

**Where used:** `index.html` (`js/index/dashboard-app.js`, `css/dashboard-grid.css`).

---

# 8b. Methodology tooltip (info-icon popover)

## 8b.1 MethodologyTooltip (canonical for "about this data")

> **State:** 🆕 NEW 2026-06-19 (UX-846 #4, Adam Jun-16) — shared info-icon + popover for section-level methodology. Generalizes the engagement metrics-key tooltip (§8b.2). Copy is 📝 DRAFT (Max authors final, Adam approves); the *mechanism* is the contribution.

One info button per section header, opening a popover that explains how that section's data is measured/sourced. Reuses the `.info-btn` / `.tooltip-overlay` visual contract.

```html
<!-- inside the section title row; button is a SIBLING of the <h3>, never a child -->
<div class="panel-title-row">
  <h3 class="panel-label" id="ov-panel-title">Visit Frequency Over Time</h3>
  <button type="button" class="info-btn methodology-btn"
          data-methodology="observed-visits" aria-expanded="false"
          aria-label="About this data: Observed Visits & Frequency">i</button>
</div>
```

- **Registry-driven.** Copy lives in `METHODOLOGY_COPY` (js/shared/methodology-tooltip.js), keyed by topic id: `pulse-delivery`, `observed-visits`, `traffic-share`, `greenberg-crossover`, `greenberg-demographics`. Each = `{ title, content, why }` (content/why accept inline HTML). Add a key + a `data-methodology="<key>"` button; no per-page JS.
- **Controller** is event-delegated + idempotent (`MethodologyTooltip.init()` auto-runs on load). Click/tap toggles; Esc or outside-click closes; resize/scroll closes; viewport-aware placement (flips above when no room below). Dynamic headers can call `MethodologyTooltip.buttonHTML(id)`.
- **HARD: button must be a sibling of the title, wrapped with it in `.panel-title-row`** — the sub-tab `activate()` rewrites `<h3>.textContent` (e.g. distribution-media:305), so a button placed *inside* the h3 is wiped on every sub-tab switch.
- **Additive:** the existing inline `.panel-subtitle__muted` methodology text stays; the tooltip is supplementary until Max reconciles copy.

**Where used:** distribution-media / -visitation / -traffic / -demographics (section headers). Files: `css/methodology-tooltip.css`, `js/shared/methodology-tooltip.js`.

## 8b.2 engagement metrics-key tooltip (predecessor — do not fork)

> **State:** 📝 DRAFT — bespoke, hardcoded "Performance Metrics Key" popover in `js/engagement/shared-filters.js` (`.metrics-key-btn`). Same `.info-btn`/`.tooltip-overlay` chrome (defined in `css/engagement.css`).

Pre-dates §8b.1. New methodology popovers use §8b.1, not this. Future cleanup: migrate the metrics-key into the §8b.1 registry so one controller owns all info popovers (logged in §14).

---

# 9. State persistence

## 9.1 sessionStorage (canonical for fresh-session resets)

> **State:** 🔒 LOCKED 2026-05-29 (Adam Portal Review) · infra — choose-the-storage convention.

Use when "new tab / new browser session" should reset state, but "same-tab reload" should preserve.

```js
const FLAG = '<feature>:visited';
const isFresh = !sessionStorage.getItem(FLAG);
sessionStorage.setItem(FLAG, '1');
```

**Where used:** engagement-compare A/B context reset.

## 9.2 localStorage (canonical for cross-session persistence)

> **State:** 🔒 LOCKED 2026-05-29 (Adam Portal Review) · infra — distribution-parity drift is a §14 pre-port ticket, not an unlock.

For user preferences and "remember last selection forever." Via `state-manager.js`.

**Drift:** distribution pages do not persist context at all (no `state-manager` wire-up). Engagement does. Cleanup target.

## 9.3 LRU in-memory cache (canonical for derived data)

> **State:** 🔒 LOCKED 2026-05-29 (Adam Portal Review) · infra — cache key + cap are contract; don't add a parallel cache.

mock-data-v1/index.js caps aggregate cache at 12 entries, keyed `${entityId}|${weekId}`. Don't add a parallel cache; use the LRU.

---

# 10. Event bus

## 10.1 dashboard:dataRefresh (canonical context-change event)

> **State:** 🔒 LOCKED 2026-05-29 (Adam Portal Review) · infra — event name + `detail` payload shape are contract. Distribution non-listen drift is the §14 context-bus ticket.

```js
document.dispatchEvent(new CustomEvent('dashboard:dataRefresh', {
  detail: {
    weekNum:     <number>,
    weekId:      'week-48',
    entityId:    'subbrand-...' | 'store-...' | 'all',
    entityLevel: 'all' | 'brand' | 'subBrand' | 'store' | 'group',
    entityName:  <string>
  }
}));
```

Every chart-card / widget that depends on context listens:

```js
document.addEventListener('dashboard:dataRefresh', handleDataRefresh);
```

**Drift:**
- Distribution pages DO NOT listen for this event. Distribution has its own internal `D.context` re-read on init only. Cross-domain context sync is deferred (FINAL-HANDOFF.md Phase 6).
- Some old listeners read `event.detail.weekNum`, others read `weekId`. Schema §payload says both must be present.

## 10.2 compare:dateSelected / compare:entitySelected (canonical for compare)

> **State:** 🔒 LOCKED 2026-05-29 (Adam Portal Review) · infra — event names + `detail` shapes are contract.

```js
new CustomEvent('compare:dateSelected', {
  detail: { target: 'A' | 'B', weekId, weekLabel, weekRange }
});
new CustomEvent('compare:entitySelected', {
  detail: { target: 'A' | 'B', entityId, entityName, entityLevel, entityCount }
});
```

Both events dispatched by `js/engagement/shared-modals.js`. Handled in `js/engagement/compare.js`.

---

# 11. Naming (HARD rules)

> **State (all of §11):** 🔒 LOCKED 2026-05-29 (Adam Portal Review) · infra — these are type/format contracts for the Angular port. Documented drift normalizes at §14 pre-port tickets; no new spelling without an unlock.

## 11.1 EntityLevel — canonical: `'all' | 'brand' | 'subBrand' | 'store' | 'group'`

camelCase. One spelling forever.

**Drift (caused 1 silent bug already):**
- Legacy mock: `'sub-brand'` (kebab)
- Modal DOM: `data-level="subbrand"` (lower)
- Schema doc: `subBrand` (camel)
- Store field: `subBrandId`

Normalize at filter boundary today (`getStoreIdsForEntity` does this). Lock at type-level on Angular port: `type EntityLevel = ...`.

## 11.2 EntityId format

`<level>-<slug>`. Examples: `'brand-ideal-foods'`, `'subbrand-safeway-norcal-north'`, `'store-101'`, `'all'`.

**Drift:** distribution uses different prefixes (`retailer-1`). Cleanup or namespace per-domain.

## 11.3 WeekId format — canonical: `week-<num>` (e.g. `week-48`)

**Drift:** distribution uses `wk2`. Cleanup target.

## 11.4 CSS class naming (BEM-ish)

- Block: `.kebab-case`
- Element: `.kebab-case__element`
- Modifier: `.kebab-case--modifier`
- Page-prefix: `ep-` (engagement page), `pm-` (paid media), `od-` (observed demographics), `ov-` (observed visits).

**No prefix = shared/global.** New shared component → no prefix; new page-scoped → prefix.

---

# 12. Anti-patterns (don't reach for)

> **§12–15 are reference indexes, not patterns** — anti-pattern table, grep hints, the pre-port drift queue, and the changelog. They carry no lock stamp by design; they describe or point at the stamped entries above.


| Anti-pattern | Why | Use instead |
|---|---|---|
| Dead action buttons (`*-export-btn`, `*-print-btn`, `*-share-btn` with no handler) | Confuses users, looks broken | Either wire it or remove it |
| `::ng-deep` (CSS scope-buster) | Bypasses encapsulation | Global SCSS / tokens / styleClass |
| `v1` / `v2` / `v3` in selectors or filenames | Permanent debt | "refactor" suffix or replace in-place |
| Ticket IDs in class names | Couples CSS to ticket lifecycle | Semantic class names |
| Two `*ngIf` copies of same element | Maintenance trap | `[attr.x]="cond ? v : null"` or `[prop]="expr"` |
| New `window.SomeThing` global | Collides with existing globals | Add to existing namespace or use module export |
| `localStorage` for transient UI state | Survives forever, hard to debug | `sessionStorage` |
| Hidden-pane echarts init | 0-width canvas | Lazy init OR resize on activation |
| MaxTotal scaled to composite when series uses weighted points | xAxis overflows, segments collapse | Derive maxTotal from same formula as series builder |
| New EntityLevel spelling | Silent fallback bug | Use one of the 5 canonical values |
| Header text updates but chart data doesn't | Filter silently fell through | Add a `console.warn` on degenerate filter result; smoke-test each filter level |
| Coexisting old + new MockData with same key | Half-migration permanence | Delete one before phase closes |

---

# 13. Where each pattern lives (grep hints)

| Pattern | Source file(s) |
|---|---|
| `.context-row` | All engagement-*.html, all distribution-*.html |
| `.hero-stat` + `.narrative-header` | All pages with a hero |
| `.chart-card` 3-row | engagement-report, engagement-explore-base, distribution-media, distribution-traffic, distribution-visitation |
| `PerfCharts.createChart` | js/engagement/shared-perf-charts.js |
| `renderTop5PanelsFromAggregate` | engagement-report.html inline script |
| `dashboard:dataRefresh` | js/engagement/shared-modals.js (dispatch), js/engagement/base-*-handoff.js (listen) |
| `MockData.getAggregate` (v1) | js/data/mock-data-v1/index.js |
| `MockData.getRecords` (legacy) | js/data/engagement-mock-data.js |
| `D.context` | js/distribution/distribution.js |
| `MethodologyTooltip` / `.methodology-btn` | js/shared/methodology-tooltip.js, css/methodology-tooltip.css |

---

# 14. Drift summary (cleanup queue for the Angular port)

Pre-port tickets to close before code starts:

1. **EntityLevel canonical** — pick 1 spelling, normalize codebase, lock TypeScript union.
2. **EntityId / WeekId format unification** — distribution → same format as engagement.
3. **Distribution context bus** — wire to `dashboard:dataRefresh` OR introduce shared `ContextService`.
4. **Legacy MockData removal** — delete `engagement-mock-data.js` once mock-data-v1 covers all consumers.
5. **Panel-level href in schema** — decide whether aggregate carries panel-href or stays static HTML.
6. **`ep-sub` vs `dist-sub` data attribute** — pick one.
7. **Dead action-button cluster** — sweep `panel-export-btn` / `panel-print-btn` from engagement-explore* (Export wired only on `grid-export-btn`; Share wired everywhere via `core.handleShareClick`).
8. **localStorage parity** — distribution should persist context like engagement does.
9. **Info-popover unification** — migrate the bespoke engagement metrics-key tooltip (§8b.2) into the `MethodologyTooltip` registry (§8b.1) so one controller + one CSS owns all info popovers.

---

# 15. Changelog

```
v0.1.0  2026-05-28  Initial draft. Pulled from session retro (UX-846 unattended-run + post-verification debug),
                    existing memory notes (canonical-vca-series-palette, analytics-chart-card-pattern,
                    feedback_consistent_page_architecture), and bugs caught this session.
v0.1.1  2026-06-04  A2 lock pass. Stamped §1.1–§11.4 🔒 LOCKED 2026-05-29 (Adam Portal Review); §7.2 held
                    📝 DRAFT pending the panel-href schema decision. Added the Meeting Ledger's first row.
                    §12–15 flagged as intentionally-unstamped reference. Gate A now has real LOCKED entries
                    to grep against — required before D2 (Traffic Share) builds on chart-card / dist-section-tabs.
v0.1.2  2026-06-04  L0 catalog (build-step 8 + L0.5). Added §2.4 dashboard-mode-switcher 🆕, §3.2 .ep-kpi-cell
                    🔒 (now dashboard-only — Overview stripped in L0.5), §3.3 dashboard-cell-registry 🆕,
                    §8.3 dashboard-customize-modal 🆕. Closes the Gate-B hole where the shipped L0 registry
                    had no catalog entry.
v0.1.3  2026-06-19  Methodology tooltip (UX-846 #4, Adam Jun-16). Added §8b.1 MethodologyTooltip 🆕 (shared
                    registry-driven info-icon popover on all 4 distribution section headers) + §8b.2 noting
                    the engagement metrics-key tooltip as predecessor. Grep-hint row + drift item #9
                    (info-popover unification). Copy 📝 DRAFT pending Max→Adam.
```
