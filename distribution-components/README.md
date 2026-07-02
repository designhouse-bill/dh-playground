# distribution-components — UX-928 Analytics Dashboard 2.1

The 2.1 prototype, carved into the Angular component tree (the "synthesis"
surface — see `~/.claude/plans/UX-928/UX-928-STRUCTURE-MAP.md`). One fragment
folder per Angular component under
`ideal-sale-circular/src/app/analytic-dashboard/components/distribution-view/`.
The 2.0 monolith (`../analytics-dashboard-combined/` @ tag `proto-2.0-baseline`)
stays frozen as the carve answer key.

## Fragment convention

```
<area>/<component>/
  <component>.html   fragment markup — carved VERBATIM from the frozen proto
  <component>.css    the component's full resolved cascade, copied verbatim
                     (source file + line provenance in the header comment)
  init.js            the component's render slice of the old God-file +
                     the mock it reads (shared mock lives in data/)
  manifest.json      anchor selector, proto sources, Angular twin, backing
                     (primeng(x) | echarts | leaflet | custom), oracle mode
```

`shell/` assembles fragments per section (maps to `distribution.component`).
Placeholders: `<div data-component="<name>" data-section="<key>">` — the
loader (`shared/component-loader.js`) swaps in the fragment and stamps the
anchor attributes on its root.

## Gate — parity-oracle static (hard, per component)

Every carve must be 0Δ vs `proto-2.0-baseline` before it can take 2.1 changes:

```
cd ~/Code/parity-oracle && node parity.mjs
```

`old` = baseline worktree (`parity-oracle/baselines/proto-2.0-baseline`),
`new` = this folder's shell page. Oracle resolution by backing:
custom → node computed-style + pixel; echarts/leaflet/primeng → wrapper pixel.

## PrimeNG-first (LOCKED 2026-07-01)

Every primitive PrimeNG offers is built with PrimeNG structure (via the
PrimeNG MCP) + real Aura theme CSS (`vendor/` — see vendor/README.md).
Carve-outs: ECharts (charts), Leaflet (maps).

## Cadence

carve → oracle static 0Δ → dial 2.1 (gated, visible diffs) → Max/Adam sign-off
→ snapshot tag → port to Angular twin → oracle live → commit.
