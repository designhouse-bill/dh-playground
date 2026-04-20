# Analytics Dashboard — Changes from V1 to V2

**V1 frozen:** April 9, 2026 (state at Adam Zimmerman review)
**V2 current:** April 17, 2026

**Requester legend**
- **[Adam]** — Adam Zimmerman (Phase 2 review, Apr 9)
- **[Max]** — Max Wilberding (regroup session, Apr 10)
- **[Bill]** — Bill Klingensmith (Apr 13 plan refinements + Apr 17 polish)

---

## Site-wide / Structural

- **Distribution tab reorder** — Store Visitation first (default landing), then Media Buy, then Traffic Share. **[Adam]**
- **Version folder structure** — Root landing page lists V1 (frozen Apr 9) and V2 (current) side-by-side for comparison. **[Bill]**
- **Narrative headers on every page** — Each section now has a question header ("Are our media campaigns driving store visits?") and subtitle explaining population scope. **[Max, Bill]**
- **Tabset UI pattern** — Sub-tabs are now visually unified with the panel they control (bordered container, active tab blends with body). Applied to Current/Trend and Performance/Demographics. **[Bill, Apr 17]**

---

## Store Visitation

### Layout overhaul
- **Hero removed entirely** — Replaced with a compact stat strip (Gross Visits, New %, Returning %, Loyal %). **[Bill]**
- **Zero dollar data on this page** — CPV removed from segment cards, store table, and map popups. All financial metrics moved to Media Buy. **[Max, Bill]**
- **Crossover Trend chart moved OUT** — Now lives on Traffic Share where the competitive narrative belongs. **[Bill]**

### Visit Frequency
- **Current / Trend view toggle** — Current shows donut + segment cards; Trend shows stacked bars over time. **[Max]**
- **Duration presets: 1 Week / 1 Month / 1 Quarter / 1 Year** — Adaptive granularity (daily / weekly / monthly). Replaces old 5wk/8wk/13wk presets. **[Bill]**
- **Bug fixed (Apr 17)**: Duration presets now actually re-render the chart with the corresponding time window. **[Bill]**
- **Bug fixed (Apr 17)**: 1-Year monthly labels now include year suffix (`May '25`, `Apr '26`) to disambiguate across year boundary. **[Bill]**

### Store Performance
- **Bar View + Data View toggle** — Bar View shows engagement-style stacked bars per row (New/Returning/Loyal). Data View is the sortable table with conditional formatting. **[Bill]**
- **Health grading removed** — No more Strong/Watch/Critical dots. Adam objected that "New Shoppers" unfairly penalizes stores with different marketing budget allocations. **[Adam]**
- **Algorithm replacement pending** — Adam owes the new criteria. **[Adam, open]**

### Map
- **Brand-color pins** — All store pins use a single brand color, not health-graded. **[Adam]**
- **Donut popup on pin click** — Shows New/Returning/Loyal breakdown for that store, matching the bar chart row. **[Bill]**
- **Bidirectional row ↔ pin selection** — Click a row to zoom the map; click a pin to highlight the row.
- **Bug fixed (Apr 17)**: Re-clicking the same pin now re-opens the popup without resetting the map. Previously it zoomed out. **[Bill]**

### Competitive Crossover
- **Rolled up to 5 competitors + "All Other"** — Totals 100%. Individual dots removed from main view. **[Max]**
- **Comparison period selector** — 1 Week / 4 Weeks / 13 Weeks. **[Max]**

### Demographics (new sub-tab)
- **Performance / Demographics sub-tabs** — Demographics lives inside Store Visitation because this section is about the population of visitors. **[Max, Bill]**
- **8 demographic charts**: Age, Gender, Household Income, Presence of Children, Household Size, Homeowner Status, Net Worth, Marital Status.
- **Enhanced (Apr 17)**: Each bar now shows percentage + raw count (e.g. `22% · 2,380`), with a tooltip showing "X of 10,822 visitors" context. **[Bill]**

---

## Media Buy

### Hero
- **Compact 4-card hero** — Budget, Impressions, CTR, CPV. Removed Clicks, Stores, Variants, Visits/1K (redundant or niche). **[Bill]**
- **CPV stays in Media Buy** — Max reversed Adam's "remove CPV" decision. All dollar amounts stay here, strictly out of Store Visitation. **[Max]**

### Creative performance
- **Media breakout view-change button** — Overview | By Creative | By Day | By Placement. One view at a time. **[Max]**
- **Creative Coverage Key (Apr 17, new)** — Collapsible panel above the carousel lists how many creatives display for each entity (All / Brand / Sub-brand / Store). Helps explain why counts differ across entity selections. **[Bill]**
- **Adaptive creative layout** — 1 creative = full-width, 2 = side-by-side, 3 = static 3-up, 3+ = carousel. **[Bill]**

### Future (not in V2)
- **"Run a Campaign" CTA** — Placeholder in header area. **[Max, deferred to enhancement phase]**
- **Historical analysis** — Sort creatives by CTR across weeks/months, teach design team what works. **[Adam, Phase 2+]**

---

## Traffic Share

### Layout
- **Insight strip replaces hero** — 3 metrics: Share %, Change pp, Outperforming count. Removed HHI, Growth Advantage, separate growth rates. **[Bill]**
- **Crossover Trend chart relocated here** — Subtitle clarifies "Among visitors attributed to paid media" to distinguish population from Traffic Share's broader data. **[Bill]**

### Chart
- **% Share / Total Visits Y-axis toggle** — % mode shows 100% stacked bars (share shifts); Total Visits mode shows raw volume (spikes from external factors). **[Adam]**

### Map
- **Competitor pin restyling** — Dark gray diamond outer shape with colored inner pip matching the competitor's chart segment. Top 5 get distinct pip colors; "All Other" = plain diamond. **[Max, Bill]**
- **Proximity rings** — 1 mi / 3 mi / 5 mi dashed circles around selected store pin. Graduated fill opacity (0.08 → 0.05 → 0.03). Togglable. **[Max, Bill]**
- **1v1 Store vs Competitor comparison panel** — Click our store pin, then a competitor pin, to see crossover %, visit frequency, distance. **[Bill]**

### Future (not in V2)
- **Competitor pin data popups** — Show traffic share + crossover from our stores. **[Adam, blocked on admin portal competitor data]**

---

## Engagement (cross-cutting, not in V2)

These Adam/Max asks are tracked but not yet built in the V2 prototype. Most are label-only or small additions that can land next iteration.

- **Base → Report, Grid → Explore rename** — Rename-only, no structural change. **[Adam, pending]**
- **Weighted / Actual toggle** — Segmented control in Performance column header. Updates bar proportions, score number, and tooltip together. Default = Weighted. **[Adam, pending]**
- **Share button elevated** — Move to page header on every page. **[Adam, pending]**
- **Compare B-seeding** — Column B auto-inherits week/entity/days context, user only picks the item. **[Adam, pending]**
- **Filter UX polish** — Apply `.entity-search` pattern (search icon + clear) to Report and Explore promotion filters. **[Adam, pending]**
- **CSV export from current view** — Dump exactly what's on screen, with header row documenting context. **[Adam, pending]**

---

## Infrastructure dependencies (all blocked on external work)

- All media buying built into admin portal. **[Adam, prerequisite]**
- Competitor stores integrated into admin portal data structure. **[Adam, prerequisite]**
- Data pipeline adjusted for weekly per-store + per-competitor visit data from Elise. **[Adam, Ehren]**
- Vinay team confirms feasibility of sharing Compare URLs (two promotions side-by-side). **[Vinay, Apr 10 deadline]**

---

## Open questions for Max

1. **Traffic Share data availability** — Max's slide asks whether Traffic Share is available for all retailers or only those running paid media. Need decision before production.
2. **Store health grading algorithm** — Adam owes replacement criteria (no deadline).
3. **Crossover vs Traffic Share combined or separate?** — Resolved in V2 (kept separate with population subtitles), but worth reconfirming with Max.

---

## Summary by requester

| Requester | Count of accepted changes landed in V2 |
|---|---|
| Adam Zimmerman (Apr 9) | 6 (tab reorder, CPV rule, health grading removal, Y-axis toggle, brand pins, Engagement asks pending) |
| Max Wilberding (Apr 10) | 9 (narrative headers, Current/Trend split, Crossover rollup, demographics sub-tab, breakout toggle, competitor pins, proximity rings, 1v1 compare, CPV stays) |
| Bill (Apr 13 planning) | 16 (hero removal, stat strip, duration presets, Bar/Data View, map donut, insight strip, tabset pattern, creative coverage key, etc.) |
| Bill (Apr 17 polish) | 5 (pin re-click fix, demographic value labels, duration presets wired, monthly year labels, tabset event-scoping fix) |
