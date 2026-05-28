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

# 1. Page shell

## 1.1 .context-row (canonical)

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

Used as the primary nav inside `.chart-card__header-left` on engagement-report.

```html
<div class="perf-tabs perf-tabs--filled" id="ep-perf-tabs" role="tablist">
  <button class="perf-tab perf-tab--active" data-perf-tab="overview" role="tab">...</button>
</div>
```

**Where used:** engagement-report (hero KPI tabs), engagement-compare layer-tabs, distribution section tabs.

## 2.2 .ep-sub-tabs (canonical for chart-card sub-views)

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

Controls that should only appear for one sub-tab use:

```html
<div data-show-on-sub="trend">...</div>
```

Tab-activation handler must toggle `display:none/''` on every `[data-show-on-sub]` child.

---

# 3. Chart shells

## 3.1 .chart-card (canonical 3-row contract)

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

---

# 4. Bar charts (V/C/A stacked horizontal)

## 4.1 PerfCharts.createChart contract

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

```
--series-v   = blue   (Views)
--series-c   = amber  (Clicks)
--series-a   = green  (Adds)
```

**Where used:** PerfCharts METRIC_COLORS, .ep-device-strip, all 3-segment bars.

---

# 5. Donut charts

## 5.1 Lazy-init rule (HARD)

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

Picking a chip MUST:
1. Toggle `--active` + `aria-pressed`
2. Update the underlying data slice
3. Re-render the dependent chart(s)
4. Update hero/cohort sentence reflecting the filter (so user sees the click acknowledged at the page top)

**Anti-pattern:** chip click only updates the chart, leaves the hero stat stale. Looks broken even when filter is correctly applied. See dist-media cohort-by-campaign fix.

---

# 7. Top-5 panels

## 7.1 renderTop5PanelsFromAggregate (canonical, engagement-report)

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

Whole-panel click target. Currently static in HTML (`data-href="engagement-explore-base.html"`). **Drift:** no aggregate-level href field in schema §6.1. Decide: add to schema or keep static.

---

# 8. Modals & overlays

## 8.1 Permanent modal (canonical)

`.modal-overlay` + `.modal` shells with `data-modal-id="..."`. Open / close handled by `DashboardModals`.

## 8.2 Demo-only one-shot overlay (canonical)

For temporary scaffolding (e.g. pilot-data notice). Marked with `⚠ DEMO-ONLY · <prefix> · DO NOT PORT TO ANGULAR` comments on all 3 surfaces (HTML, CSS, JS). Single grep target removes everything.

See `js/distribution/dist-pilot-banner.js` for canonical example.

**Rule:** demo-only scaffolding MUST be removable by `grep -rln "<prefix>" | xargs rm/edit` with no runtime coupling to state, services, or other components.

---

# 9. State persistence

## 9.1 sessionStorage (canonical for fresh-session resets)

Use when "new tab / new browser session" should reset state, but "same-tab reload" should preserve.

```js
const FLAG = '<feature>:visited';
const isFresh = !sessionStorage.getItem(FLAG);
sessionStorage.setItem(FLAG, '1');
```

**Where used:** engagement-compare A/B context reset, dist-pilot one-shot overlay.

## 9.2 localStorage (canonical for cross-session persistence)

For user preferences and "remember last selection forever." Via `state-manager.js`.

**Drift:** distribution pages do not persist context at all (no `state-manager` wire-up). Engagement does. Cleanup target.

## 9.3 LRU in-memory cache (canonical for derived data)

mock-data-v1/index.js caps aggregate cache at 12 entries, keyed `${entityId}|${weekId}`. Don't add a parallel cache; use the LRU.

---

# 10. Event bus

## 10.1 dashboard:dataRefresh (canonical context-change event)

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
| `.dist-pilot-banner` (demo-only) | js/distribution/dist-pilot-banner.js |

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

---

# 15. Changelog

```
v0.1.0  2026-05-28  Initial draft. Pulled from session retro (UX-846 unattended-run + post-verification debug),
                    existing memory notes (canonical-vca-series-palette, analytics-chart-card-pattern,
                    feedback_consistent_page_architecture), and bugs caught this session.
```
