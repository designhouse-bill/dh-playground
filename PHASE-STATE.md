# UX-846 Unified Data Layer — Build State

Last updated: 2026-05-27 (Phase 4 complete)
Branch: feature/UX-846-rename-engagement-canonical
Cumulative estimated spend: ~205K (Phase 0 + 1 + 2 + 3a + 3b + 3c + 4; budget 280K hard cap, 200K soft stop — over soft stop)

> mock-data-v1/index.js is the public API entry point for both engagement and distribution dashboards.

## Reference docs (READ THESE FIRST)
- `~/.claude/plans/UX-846/UX-846-PHASE-PLAN.md` — phase prompts, budgets, decision rules
- `~/.claude/plans/UX-846/UX-846-DATA-LAYER-SCHEMA.md` — API contract (v1.0.0 locked)
- `~/.claude/plans/UX-846/UX-846-ENTITY-HIERARCHY.md` — 4-level Ideal Foods tree (locked)

## Phases

| # | Phase | Status | Commit | Spend (est) | Notes |
|---|---|---|---|---|---|
| 0 | Top Stores spike (pattern proof) | **done** | (pending — to be committed with this state file) | 30K | Pattern works. Repaint 0.1ms. |
| 1 | Build script + aggregates.json | **done** | df78f1f | ~45K | 637 payloads (49 entities × 13 weeks), 7.0MB. Schema-mandated all-fields shape — <1MB target relaxed to "all fields present" per §6.3. |
| 2 | Row-generator + module index | **done** | a35de1c | ~20K | row-generator.js (FNV-1a + mulberry32, 75 promos / 5 creatives / 8 crossover). index.js replaces Phase 0 stub: top-level MockData API + LRU cache (cap 12) + lazy aggregates.json fetch. `.v1` namespace preserved as compat shim for engagement-report.html. PHASE-2-ASSUMPTION markers inline. |
| 3a | 4 row-1 chart-cells | **done** | b4cd004 | ~35K | Perf/Users/Sessions/Duration converted to MockData-driven render; listens dashboard:dataRefresh; echarts setOption pattern. Subagent stopped pre-commit; main thread committed. |
| 3b | 3 Top-5 panels (Stores/Cats/Promos) | **done** | 2d3acea | ~25K | Generic `renderTop5PanelsFromAggregate` replaces Phase 0 `renderTopStoresFromAggregate`. All 3 panels driven by aggregate.engagement.{topStores,topCategories,topPromotions}. DocumentFragment + replaceChildren. Per-row href from `row.href`. Panel-level data-href stays static (schema §6.1 has no panel-href field). Async via Promise.resolve. **Key-delimiter mismatch worked around:** aggregates.json uses `entityId\|weekId` keys but index.js builds `entityId:weekId`; getAggregate() returns null → fallback reads `_internal.loadAggregates()` and looks up with `\|`. Should be fixed in index.js (out of scope for this phase). |
| 3c | Coupon/PageNav + hero strip | **done** | fa3f4f6 | ~25K | Coupon/PageNav extend `renderTop5PanelsFromAggregate` (same fallback `_internal.loadAggregates()` workaround as 3b — `|` vs `:` key delimiter still unfixed). Aggregate `topCouponClips`/`topPageNavigation` ship empty in v1 aggregates.json (schema §6.1 example line 621-622) → static placeholder rows remain until row-generator populates them; wire verified. Hero stat-strip: Overview → cohort sentence from `eng.cohort` + `agg.week`; performance/users/sessions/duration → `heroItemHTML(label, value, deltaPct, deltaDir)`. Active tab read from URL `?tab=` first, falls back to `.perf-tab.active`. No event dispatched by canonical-shell-tabs.js → delegated click listener on `#ep-perf-tabs` calls `renderHeroStatStripFromCache` (setTimeout 0 so canonical-shell-tabs.js toggles class first). `_heroAggCache` avoids re-fetching aggregate per tab click. |
| 4 | Perf pass | **done** | (pending) | ~30K | (A) 40MB engagement-promotions.js removed from engagement-report.html; added `defer` on the other 6 HTMLs (engagement-explore/base/base-categories/base-promotions, engagement-compare, index). (B) engagement-report.html has NO echarts charts (all SVG/HTML) — setOption audit is N/A; flagged. (C) **Key delimiter fix:** index.js now uses `\|` (matches aggregates.json native keys). PHASE-3b/3c fallback paths kept one release as safety net. (D) Memoized aggregate slice via `fetchAggregateOnce(ctx)` + `refreshFromAggregate()`; row-1 and Top-5 now share ONE Promise per dataRefresh (was 2 chains). `renderRow1FromAggregate`/`renderTop5PanelsFromAggregate` become thin shims for backward compat. PHASE-4-ASSUMPTION markers inline. |
| 5 | Polish + final hand-off | pending | — | — | Main thread. Budget 20K. |

## Phase 4 echarts audit note

engagement-report.html contains zero `echarts.init` / `setOption` / `dispose` calls — the row-1 widgets are SVG/HTML and the panels are DOM. Audit item B is therefore a no-op for the Report surface. If echarts charts are introduced later, the `setOption({...})` (NOT dispose+create) pattern is the policy.

## Outstanding flags

1. **`dashboard:dataRefresh` is heavy** — other listeners (shared-modals.js) re-aggregate the 40MB engagement-promotions.js on every dispatch. Phase 0 verified the wire works but used a direct function call to measure render time. Phase 3 subagents should consider:
   - Option A: keep `dashboard:dataRefresh` and accept the heavy chain (Phase 4 perf pass mitigates by deferring the 40MB load)
   - Option B: introduce a NEW event `mockdata:contextChange` that only mock-data-v1 widgets listen to
   - Recommendation: **Option B**. Cleaner separation, lets old widgets keep their old wiring during migration.
2. **Stub aggregate covers only 2 (entity, week) tuples** — `brand-ideal-foods:week-47` and `brand-ideal-foods:week-48`. Phase 1 replaces with full aggregates.json covering all 48 entity nodes × 13 weeks.
3. **Initial render edge case** — if `MockData.v1` isn't loaded by the time DOMContentLoaded fires, render function bails silently. Phase 3 should add an explicit "data not ready" placeholder + retry.

## What got built in Phase 0

```
js/data/mock-data-v1/index.js     (NEW, 70 lines)
  - window.MockData.v1.getAggregate({entityId, weekId})
  - window.MockData.v1.currentContext() — reads ?pub= and ?entity= from URL
  - 2 hardcoded aggregate payloads (brand-ideal-foods × week-47, week-48)

engagement-report.html             (EDITED)
  - Added id="ep-top-stores-panel" + id="ep-top-stores-list" + id="ep-top-stores-metric"
  - Added <script src="js/data/mock-data-v1/index.js?v=1">
  - Added renderTopStoresFromAggregate() function in inline script
  - Wired to dashboard:dataRefresh event
  - Wired to DOMContentLoaded initial render
```

## What to do next session (if cut short OR fresh start)

1. **Read this file first**, then read the 3 reference docs at the top.
2. **Resume at the first non-done phase** (currently Phase 1).
3. **Each phase prompt is in `UX-846-PHASE-PLAN.md`** — copy-paste the subagent prompt verbatim.
4. **Update this file after every phase** — the next phase's subagent reads PHASE-STATE.md first.

## Pre-launch checklist for the unattended run

- [ ] Usage credits OFF at Claude.ai/settings/usage
- [ ] Preview server stopped (`mcp__Claude_Preview__preview_stop`)
- [ ] Branch clean (`git status` empty)
- [ ] On `feature/UX-846-rename-engagement-canonical`
- [ ] This file (PHASE-STATE.md) shows Phase 0 done
- [ ] Trigger prompt ready (see `~/.claude/plans/UX-846/LAUNCH-CHECKLIST.md`)
