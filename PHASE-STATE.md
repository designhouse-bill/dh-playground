# UX-846 Unified Data Layer — Build State

Last updated: 2026-05-27 (Phase 3a complete)
Branch: feature/UX-846-rename-engagement-canonical
Cumulative estimated spend: ~125K (Phase 0 + 1 + 2 + 3a; budget 280K hard cap, 200K soft stop)

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
| 3b | 3 Top-5 panels (Stores/Cats/Promos) | pending | — | — | Subagent. Budget 30K. Phase 0 already converted Top Stores — extend to Cats + Promos. |
| 3c | Coupon/PageNav + hero strip | pending | — | — | Subagent. Budget 30K. |
| 4 | Perf pass | pending | — | — | Subagent. Budget 30K. |
| 5 | Polish + final hand-off | pending | — | — | Main thread. Budget 20K. |

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
