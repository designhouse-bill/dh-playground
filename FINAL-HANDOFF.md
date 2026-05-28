# UX-846 Unified Data Layer — Final Hand-off

**Branch:** `feature/UX-846-rename-engagement-canonical`
**Run completed:** 2026-05-27 (unattended overnight)
**Final cumulative estimated spend:** ~205K (soft stop 200K tripped at Phase 4 boundary; Phase 5 reduced to hand-off only)

## What shipped

| Phase | Commit | What |
|---|---|---|
| 0 | cb9d420 | Top Stores spike — pattern proof, MockData v1 stub |
| 1 | df78f1f | `entity-hierarchy.js` (48 nodes), `weeks.js` (W36–W48), `build-aggregates.mjs`, `aggregates.json` (637 payloads, 7MB) |
| 2 | a35de1c | `row-generator.js` (FNV-1a + mulberry32, 75 promos / 5 creatives / 8 crossover); `index.js` public API with LRU cap-12 cache + lazy fetch |
| 3a | b4cd004 | 4 row-1 chart-cells data-driven (Perf Score, Total Users, Sessions, Avg Duration) |
| 3b | 2d3acea | 3 Top-5 panels data-driven (Stores, Categories, Promotions) via generic `renderTop5PanelsFromAggregate` |
| 3c | fa3f4f6 | Coupon Clips + Page Navigation panels + hero stat-strip (per-tab KPI swap, cohort sentence on Overview) |
| 4  | a71203d | Perf pass — 40MB engagement-promotions.js removed from Report, `defer` on 6 other HTMLs; key delimiter unified to `\|`; shared `fetchAggregateOnce` memoizes aggregate per dataRefresh tick |

State-record commits (SHA backfill into PHASE-STATE.md): 9dbe8dc, 7278917, c40b94e, fef9362, 57d97a3, 6b66fec.

## What's deferred

1. **Distribution-page widgets** — separate session. The mock-data-v1 layer covers both engagement and distribution per `index.js`, but no distribution HTML has been wired.
2. **Phase 5 "Now showing: {entity} · {week}" pill** — not added; soft stop tripped before pill scope was attempted.
3. **`topCouponClips` / `topPageNavigation` aggregate fields** — currently empty in aggregates.json. Row-generator does not populate them. Static placeholder rows remain on the page until either (a) Phase 1 build script extended or (b) row-generator extended.
4. **echarts setOption audit** — N/A on engagement-report.html (no echarts there). Re-evaluate when distribution widgets land (those likely use echarts).
5. **`_internal.loadAggregates()` fallback in 3b/3c** — retained one release as safety net behind the new unified `|` delimiter. Remove on next pass once confidence is high.
6. **Browser verification** — not performed (preview server stayed stopped per unattended-run rules). Manual smoke test required before demo.

## Demo script (3 bullets for Adam)

1. Open `engagement-report.html` — context bar at top drives the entire page. Pick a different store or week → every row-1 KPI, every Top-5 panel, the hero stat-strip all refresh from one shared aggregate fetch.
2. Switch perf-tabs (Performance Score / Total Users / Sessions / Avg Duration) — hero stat-strip swaps to that KPI's value + delta. Overview tab returns to the "ran at X of Y stores · Week N" cohort sentence.
3. Network tab: `engagement-promotions.js` (40MB) does NOT load on the Report page. It defer-loads only when navigating to an Explore page that needs it.

## Known caveats

- **Aggregates.json is 7MB**, not the original <1MB target. Schema §6.3 mandates all fields present on every payload; pruning would break the contract. Acceptable on local; revisit if shipping over the wire.
- **`dashboard:dataRefresh` is heavy event** — shared-modals.js still re-aggregates engagement-promotions.js on every dispatch. Phase 4's defer means the 40MB file is no longer loaded on Report so this no longer hurts there, but Explore pages will still feel it. Outstanding flag #1 in PHASE-STATE recommends a separate `mockdata:contextChange` event for clean separation.
- **PHASE-N-ASSUMPTION inline markers** in code — search `grep -rn "PHASE-.*ASSUMPTION" analytics-dashboard-combined/` for the full list of best-guess calls made under unattended-run rules.
- **No push to remote** — Bill pushes manually after review.

## Resume points if next session needed

- Phase 5 polish (pill, demo smoke test): main thread, ~10K
- Distribution widgets: subagent, new phase plan needed
- `topCouponClips` + `topPageNavigation` population: extend Phase 1 build script, ~15K
