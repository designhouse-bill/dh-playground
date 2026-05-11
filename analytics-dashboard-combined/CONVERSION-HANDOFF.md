# Analytics Dashboard — Conversion Handoff (UX-846)

**Audience:** Angular team converting this prototype into the production
`ideal-sale-circular` app.

**Prototype branch:** `analytics-dashboard-distribution` in
`mydarndest-playground`.

**Date:** 2026-05-11.

---

## TL;DR

Three engagement pages — Circulars, Categories, Promotions — are
**one component with three grain inputs**, not three pages. Build them
as a single `EngagementPageComponent` driven by an `@Input() grain` and
configured via the grain config pattern established in
`js/engagement/engagement-grain-config.js`.

The prototype gives you:

- The visual model
- The grain-as-input pattern (already wired)
- The grain filter rules (which panes apply at which grain)
- The summary → drill interaction model

The prototype does **not** yet give you:

- A single shared HTML partial for the page chrome (deferred — see
  "Deliberate non-goals" below)
- Real data wiring (synthetic mock data throughout)

---

## Architecture summary

### Grain as input

Each engagement page declares its grain via a body attribute:

```html
<body data-grain="circular">   <!-- engagement-circulars.html  -->
<body data-grain="category">   <!-- engagement-categories.html -->
<body data-grain="promotion">  <!-- engagement-promotions.html -->
```

In Angular this becomes:

```ts
@Component({ ... })
export class EngagementPageComponent {
  @Input({ required: true }) grain!: 'circular' | 'category' | 'promotion';
}
```

Three routes bind grain:

```ts
{ path: 'engagement/circulars',  component: EngagementPageComponent, data: { grain: 'circular' } },
{ path: 'engagement/categories', component: EngagementPageComponent, data: { grain: 'category' } },
{ path: 'engagement/promotions', component: EngagementPageComponent, data: { grain: 'promotion' } },
```

### Grain config

`js/engagement/engagement-grain-config.js` is the single source of
per-grain text + structural rules:

```js
GRAIN_CONFIG = {
  circular:  { title, question, cohortLabel, counts: [...], panes: [...] },
  category:  { title, question, cohortLabel, counts: [...], panes: [...] },
  promotion: { title, question, cohortLabel, counts: [...], panes: [...] },
};
```

In Angular convert to either a static `GRAIN_CONFIG` object on the
component or a `GrainConfigService` if you need DI / overrides.

The `panes` array is the truth about which metric panes apply at each
grain. **Coupon and Deal Type only apply at the promotion grain** —
they're attributes of individual promotions, not aggregations of
higher grains.

### Grain init

`js/engagement/engagement-grain-init.js` is the boot script that:

1. Reads `body[data-grain]`.
2. Removes `.perf-tab[data-ep-tab]` and `.perf-tab-pane[data-ep-pane]`
   whose key is not in the grain's `panes` list.
3. Applies the hero `title`, `question`, `cohortLabel`, and entity
   `counts` from config.
4. Dispatches `engagement-grain:applied` for downstream listeners.

In Angular this becomes template binding + `*ngIf` directives. No
imperative DOM mutation.

---

## Surface model — Summary / Detail

Each metric pane (Sessions, Users, Duration, Card Events, Coupon,
Deal Type) supports two views:

- **`body[data-view="summary"]`** — 3-card layout (by Store + by Day +
  Time Trend), sub-tabs nav visible with Overview as the active anchor.
- **`body[data-view="detail"]`** — single sub-pane active, sub-tabs
  nav switches between cuts.

Entry points to detail:
- Card link in summary view ("View all" on by-Store, "View more" on
  Time Trend) → flips to detail + activates matching sub-pane.
- Sub-tab click on any non-Overview / non-Data tab → flips to detail.

Return to summary:
- Overview sub-tab click.
- Any perf-tab strip click (re-entering a section always lands on
  summary).

Surface state lives in `body[data-view]`, persists via localStorage and
`?view=detail` URL param. API: `window.UX846Surface.{getView,setView}`.
In Angular: a `ViewModeService` (BehaviorSubject of `'summary' | 'detail'`)
or a signal on the page component.

---

## Time Trend chart — special render

The Time Trend sub-pane is **re-rendered at a compact aspect ratio
(500×300 viewBox) for the summary view** so the chart reads legibly
inside the 1/3-width section card. The canonical renderer's natural
880×280 SVG is restored when the user drills into detail view.

This happens in `js/engagement/sub-pane-summaries.js` via
`rerenderTrendCompact(host)` (reads data from existing `.ep-trend-dot`
elements, regenerates SVG at new dimensions, preserves labels and
accent color).

In Angular you can replace this with two chart components or one chart
component with a `compact` input. The pattern is: don't scale-stretch
the chart, render it at the right dimensions for the slot.

---

## Section summary cards

`js/engagement/sub-pane-summaries.js` wraps each `.ep-sub-pane` in a
`.section-card` container with:

- **Header** (top-finding): title + stat + detail line. Hidden in detail.
- **Body**: the existing sub-pane chart (untouched).
- **Footer link** (top-right of header, not footer):
  - `by Store`: "View all →" — drills to detail (suppressed when entity
    has ≤5 stores).
  - `Time Trend`: "View more →" — drills to detail.
  - `by Day`: no link (matches detail rendering as-is).

In Advanced/detail mode the `.section-card` wrapper collapses to
`display: contents` so the underlying `.ep-sub-pane` renders exactly
as before.

In Angular: this is a `SectionCardComponent` that takes the sub-pane
content as `<ng-content>` and renders header / footer conditionally.

---

## Class naming

- `data-tier="detail"` — element hidden when `body[data-view="summary"]`.
- `data-tier="summary"` — element hidden when `body[data-view="detail"]`.
- `surface-toggle`, `section-card`, `section-card__header`, etc. —
  semantic names, no ticket-ID prefixes.

CSS rules live in `css/tiered-surfaces.css` (single source).

---

## Synthetic data

All section card findings (`"Acme #1234 · 28% of sessions · ▲21% wow"`)
are synthetic placeholders defined in `FINDINGS` in
`sub-pane-summaries.js`. Real data wiring is intentionally deferred —
the prototype demonstrates the layout + interaction model, not the
data pipeline.

---

## Deliberate non-goals (Phase 3 — Angular team picks up)

1. **Hero markup extraction.** The narrative-header / hero-stat block
   is identical across all three HTML files except for grain-specific
   text (which is now driven by config). Extracting to a shared partial
   would require async injection + script timing fixes. The Angular
   team will consolidate this naturally during their component
   template extraction.

2. **Metric pane markup deduplication.** The 5–7 metric panes (Sessions,
   Users, …) have nearly identical markup across the three pages. Same
   reasoning — the Angular team's component pass will deduplicate.

3. **Grain switcher UI.** Top-of-page nav between Circulars / Categories
   / Promotions doesn't exist yet. Users navigate between grains by
   URL only. Listed in the workplan as #2 of the post-template-lift
   roadmap.

4. **Cross-grain drilldown.** Clicking a circular row to filter
   Categories to that circular's data — not wired. Listed as #3 of
   the roadmap.

5. **Context propagation across grain pages** (week, store, filters
   travel between pages) — not wired. Roadmap #4.

---

## Demo flow (for leadership)

1. Open **engagement-circulars.html**.
   - Hero shows "Circulars" + 27 circulars cohort.
   - Five perf-tabs: Overview / Sessions / Users / Duration / Card Events.
   - Overview pane shows KPI donut grid.

2. Click **Sessions** perf-tab.
   - Summary view: three section cards (by Store, by Day, Time Trend)
     side-by-side.
   - Sub-tabs nav at top: Overview / Sessions by Store / Sessions by
     Day / Sessions Time Trend / Data Grid.
   - "View all" link on by-Store card.
   - "View more" link on Trend card.

3. Click **"View more →"** on the Time Trend card.
   - Page flips to detail view.
   - Time Trend sub-pane shows full canonical chart with range
     toolbar (1w / 4w / 13w / 1y).
   - Sub-tabs nav with Sessions Time Trend now active.

4. Click **Overview** sub-tab.
   - Returns to summary 3-card view.

5. Navigate to **engagement-categories.html**.
   - Same shell. Hero shows "Categories" + 8 categories cohort.
   - Five perf-tabs (same metrics — no Coupon / Deal Type).
   - Click Sessions: same 3-card summary, sub-tabs, drill behavior.

6. Navigate to **engagement-promotions.html**.
   - Same shell. Hero shows "Promotions" + 75 promotions cohort.
   - **Seven** perf-tabs (adds Coupon + Deal Type because they're
     promotion-level attributes).
   - Click Coupon: 3-card summary applies just the same.

The takeaway for leadership: this is one component, three grain
instances. The user learns the template once and applies it three
times. The Angular conversion preserves this model.

---

## File map for the Angular team

```
analytics-dashboard-combined/
├── engagement-circulars.html          ← thin grain page (data-grain="circular")
├── engagement-categories.html         ← thin grain page (data-grain="category")
├── engagement-promotions.html         ← thin grain page (data-grain="promotion")
├── css/
│   ├── tiered-surfaces.css            ← surface visibility + section-card chrome
│   ├── analytics-architecture.css     ← canonical layout primitives
│   ├── engagement-canonical.css       ← engagement-specific styling
│   └── distribution.css               ← perf-tabs underline style + stat-strip
├── js/
│   ├── shared/
│   │   └── surface-controller.js      ← data-view state + URL/storage sync
│   └── engagement/
│       ├── engagement-grain-config.js ← GRAIN_CONFIG (title, counts, panes)
│       ├── engagement-grain-init.js   ← boot: read grain, filter DOM, apply text
│       ├── sub-pane-summaries.js      ← section-card wrapping + Trend re-render
│       ├── canonical-shell-renderers.js  ← existing chart renderers
│       └── ... (existing engagement scripts)
└── partials/
    └── engagement-tabs-shell.html     ← legacy chrome partial (used by circulars only)
```

---

## Open questions for product / design

- Does Categories' Overview pane need its own KPI composition, or does
  it inherit the same KPI donut grid the prototype currently has?
- Should the grain switcher (Circulars / Categories / Promotions) live
  in the page header or in a global sidebar? Currently no switcher
  exists — navigation is URL-only.
- Cross-grain drilldown URL pattern: `?circular=42&category=produce`
  or hierarchical `?focus=circular:42/category:produce`?

---

## Contact

For questions on prototype intent, surface model, or grain config rules,
see the git log on this branch — each commit documents its decision.
The `UX-846` ticket on Jira is the master tracker.
