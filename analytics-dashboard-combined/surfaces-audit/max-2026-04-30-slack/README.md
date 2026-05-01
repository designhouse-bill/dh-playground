# Max — 2026-04-30 ~5:04pm Slack thread + Media Buy design exports

**Significance:** Direct stakeholder confirmation that Proposed-Max canonical pattern = Media Buy template. Validates audit framing.

---

## Thread

> **Max Wilberding (4:50pm):** Can we use the same template (did you call it a screen?) for Media Buy as we did for the Circular Summary page?
> *[shared screenshots: Media Buy Data + Media Buy Data-2]*

> **Bill UX/UI (5:01pm):** Surface.

> **Bill UX/UI:** If you want to gather these in, this would be very helpful. I'm working on the "UI Pattern" audit to see what we have available. I'll flag what is working… but, if you know what is working, Let's jump to that point and work forward.

> **Max Wilberding (5:04pm):** Yeah. I think that pattern works for Media Buy. If there are multiple media buys, I was thinking maybe we use the surface you have for the media carousel?

> **Bill UX/UI:** So each media campaign would have the summary data (or a version of it)

> **Bill UX/UI:** It is something we can pull out from Elise data we have?

---

## Files

| File | Source | Purpose |
|---|---|---|
| `01-slack-thread.png` | Original screenshot of the conversation | Reference for the thread itself |
| `02-media-buy-overview.png` | Max's design export — "Overview" view | 4 KPI tiles + 3-panel grid (CTR–by-Store, –by-Creative, –by-Day) |
| `03-media-buy-stacked-list.png` | Max's design export — sub-tab metric pane | 4 KPI tiles + sub-tabs (X by Store / Day / Creative / Time Trend) + multi-segment stacked-list |

---

## What this confirms

1. **DP4.3 (Media perf-tabs):** Max wants the Proposed-Max template applied — perf-tabs goes from "definitely add" to **stakeholder-validated requirement**.
2. **DP3.1 (KPI strip canonical):** Max's exports show 4 clickable KPI tiles at the top — exact `.ep-kpi-strip` pattern. Confirmed canonical for multi-metric overview.
3. **DP4.1 (Distribution IA):** Max's Media Buy mockup uses Engagement-style metric-first layout (Overview / By Store / By Day / By Creative / Time Trend). **Lifts the question:** does entity-drill stay Distribution canonical (Visitation pattern), or does metric-first win everywhere? Max's preference here suggests metric-first wins.
4. **DP1.1 (Categories/Circulars rebuild):** If Max wants Media Buy on the same template, very likely he'd want Categories + Circulars on it too. Strengthens "rebuild to canonical" choice over "minimal upgrades."

---

## Open questions surfaced

- **DP15.1** — ✓ **RESOLVED (Bill, 2026-04-30, refined w/ screenshot):** Canonical = the `.ep-chips-row` + `.ep-chip` pattern from `engagement-promotions-proposed.html`. Full surface = chip-strip (All-first card + ranked entity cards) + view-mode toggle (`Chip Drilldown` / `Ranked Table`) + filter input + count badge ("93 PROMOTIONS"). Bill shared screenshot of this exact view at 9:00am 2026-04-30.
  - **Visual spec (from screenshot):**
    - Tab strip above (Overview / By Circular / By Category / By Promotion / By Store / By Day) — entity-drill IA
    - Below tabs: left side = view-mode toggle (Chip Drilldown active by default | Ranked Table); right side = filter input + count badge
    - Below: horizontal-scroll chip strip — first card always "All [entities]" w/ apps icon + count meta; subsequent cards = entity (e.g., "Lay's Chips Family") w/ category icon + meta line ("Snacks · 92,852 views"); top performer gets "TOP" badge
  - **Reclassifications:**
    - `.creative-list` (distribution-media) → **D**, full drop. Replaced by `.ep-chips-row` everywhere multi-item selection is needed.
    - `.ep-chips-row` + `.ep-view-toggle` + filter + count = **canonical "selector strip"** surface. Locks. Travels to Media Buy multi-campaign nav.
- **DP15.2** — ✓ **RESOLVED (Bill, 2026-04-30):** `.ep-panel-legend` pattern. Each multi-segment panel carries its own legend; the legend defines what the segments mean for THAT panel. There is no global "the 3 colors mean X" rule — segment meaning is panel-local, declared by the legend strip on the panel itself.
  - **Class rename signal:** Bill referred to it as `.ep-panel-legend` (panel-generic). Current canonical is `.ep-perf-legend` (engagement-specific: Views/Clicks/Adds). Generalize the class to `.ep-panel-legend` so it travels cleanly to Media Buy / Distribution panels w/ different segment definitions.
  - **For the Media Buy stacked-list (image 03):** the panel's legend would declare its own segments (e.g., Impressions/Clicks/Conversions, or visitor-type new/returning/loyal — TBD per data binding). Don't pre-decide; build the legend mechanism, let each panel populate it.
- **Data:** Bill UX/UI flagged — "pull out from Elise data?" — **Max confirmed 5:06pm: "Yeah"** ✓ Elise data has the cuts needed.
- **NEW Gap 1 (from data inventory):** "By Store" cut on Media Buy — Elise data is campaign-level, no store attribution. Needs Greenberg join, OR Max clarification on intent (where-targeted vs where-visited). See `05-data-availability-elise.md`.
- **NEW Gap 2:** "By Day" / "Time Trend" cuts — current Elise scrape is single-snapshot, no daily cadence. Need daily timeseries source.
