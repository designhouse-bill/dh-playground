# Page Updates Log

Running ledger of page-level changes Bill called out during the surfaces-audit walkthrough (2026-05-01). Folds into per-page diff docs at Layer 4.

---

## Forward-looking pattern notes

### `creative-chips` / `demo-chips` could replace `.ep-sub-tabs` (Bill 2026-05-01)
- Chip-strip pattern from Distribution (Visitation creative-chips, Demographics demo-chips) is a strong pattern.
- Candidate replacement for canonical `.ep-sub-tabs` (By Store / By Day / Time Trend / Data) on Engagement.
- Flagged for evaluation post-MVP. Not blocking current sub-tab decision (DP5.1 stays locked as 4-button strip for now).
- AI implementer: keep `.ep-sub-tabs` for initial Angular build; flag for design review when chip pattern becomes available as a shared component.

---

## Audit principles (locked 2026-05-01)

1. **Baseline = Proposed-Max only.** Original + Proposed hidden from UI; markup retained for reference. REPORT links land on Proposed-Max.
2. **Preserve in-dev tables.** Any production data table (`.ep-data-table`, `.dist-tree-data-grid`, `.category-data-grid`, `.store-data-grid`, `.grid-data-table`, `.promo-data-grid`, `.store-perf-table`, `.leaderboard-table`) keeps its existing UI pattern. Thread it inside the canonical surface (Data sub-pane / Ranked Table mode). No table rework.
3. **Number formatting — always thousands-separator commas.** Every numeric value rendered to the user gets `,` thousands separators (`3541` → `3,541`). Applies globally: KPI tiles, stat-strips, ranked lists, tables, mini-cards, compare cells, percentile scores, run-stats, cohort counts. Production = `Intl.NumberFormat('en-US')` or equivalent locale-aware formatter; prototype JS should use the same.

---

## engagement-promotions-proposed.html

### Selector strip (Group 0 / `.ep-chips-row`)

**1. Rename "Chip Drilldown" — ambiguous label**
- Current: `[Chip Drilldown | Ranked Table]` toggle reads as jargon.
- Issue: term doesn't communicate that chips = individual promotion atoms vs. the "All" summary card.
- Action: rename toggle label. Candidates: `[Cards | Table]`, `[Browse | Table]`, `[Promotions | Table]`. Bill to pick.

**2. Chip card content upgrade**
- Each chip = atom (one promotion / one item).
- Required content per chip: **thumbnail** + **title** + **category name**.
- Current: icon + title + meta line (no thumbnail, category present in meta).
- Action: add thumbnail slot to chip; restructure meta to surface category name explicitly.

**3. "All Promotions" card — anchor outside the scroll**
- Current: All-card scrolls with the rest of the strip.
- Target: All-card stays pinned (left edge, outside carousel viewport). Only the per-promotion chips scroll.
- Carousel pattern: left/right arrow nav (true carousel), not free-scroll only.
- Action: lift `.ep-chip--all` out of `.ep-chips-row` into a sibling pinned slot; wrap remaining chips in carousel container w/ prev/next controls.

**4. `.ep-view-toggle` prominence — needs design pass**
- Current: small inline pill, easy to miss.
- Bill wants prominence increase + ideas.

**Prominence options to consider:**
| Approach | Pro | Con |
|---|---|---|
| A. Larger segmented control (40px+ height, primary-blue active fill, white inactive) | Clear active state, hits PrimeNG segmented pattern | Takes vertical space |
| B. Label prefix ("View:") + larger pills | Semantic anchor, accessible | Still inline w/ filter row |
| C. Move to own row above strip, full-width segmented | Maximum prominence | Adds row; competes w/ perf-tabs visually |
| D. Icon + label segmented (grid-icon = Cards, table-icon = Table) w/ 36px height + shadow on active | Iconography aids scan, compact | Icons add cognitive load |
| E. Right-align as primary CTA-style button group next to filter | Places near user's natural eye-path (filter region) | Crowds count badge |

Recommendation: **A + D combined** — 40px segmented control w/ icon + label, active state filled w/ `--p-primary-color`, shadow for elevation. Keeps inline placement, doubles the visual weight without adding a row.

Bill to confirm direction or nominate alternative.

---

## Canonical KPI strip (`.ep-kpi-strip` / `.ep-kpi-tile`)

### Add "View" affordance to each tile (Group 3 / DP3.1)

- Per Bill 2026-05-01: each KPI tile gets a "View" button in the bottom-right corner.
- Purpose: visual cue that the tile is clickable + advances to the corresponding metric tab.
- Today: tiles are clickable (`data-jump-to`) but offer no affordance — users may not discover the jump.
- Pattern: small text-link or chevron pill (`View →`) bottom-right; primary-blue.
- Applies to all consumers: Engagement (Promotions/Categories/Circulars/Grid post-rebuild), Media Buy multi-tile, anywhere KPI strip lands.

---

## engagement-categories.html

### Full canonical rebuild (Group 1 / DP1.1 thread)

**Current state:** thin shell — `panel-header--categories` + `.category-data-grid` (empty container) + collapsed right detail panel. No overview, no perf-tabs, no stat strip, no run-stats line, no cohort note.

**Target state:** structural parity w/ engagement-promotions-proposed-max.html.

| Layer | Action |
|---|---|
| Header chrome | Replace `.panel-header--categories` w/ `.section-panel-header` + `.hero-stat` + `.narrative-header` + `.stat-strip` (Group 2 canonical) |
| Cohort note | Add `.ep-cohort-note` (Group 10) |
| Run-stats line | Add `.card-run-stats` on date selector (Group 11) |
| KPI strip | Add `.ep-kpi-strip` w/ jump tiles (Group 3) |
| Perf-tabs | Add `.perf-tabs` metric-first IA (Group 4) |
| Sub-tabs | Add `.ep-sub-tabs` per metric pane (Group 5) |
| Selector strip | Add `.ep-chips-row` (Group 0) — first card "All Categories", chips per category |
| Data sub-pane | Thread existing `.category-data-grid` into Data tab (DP1.1 B) |
| Detail sidebar | Upgrade inline collapse → `.ep-detail-sidebar` fixed overlay (Group 8 / DP8.1) |

**Note:** Categories page also needs cohort + data seed for Week 48 / All Stores — currently renders 0 categories, blocking visual verification.

---

## distribution-media.html

### 1. Detailed Breakdown — cap height + overflow scroll
- 601 records render full-bleed today; section runs forever down the page.
- Action: set `max-height` on `.dist-tree-data-grid` w/ vertical overflow-scroll. Sticky column header.
- Pattern: same as production data-grid behavior in Engagement.

### 2. Move "Visits attributed to media spend" to top
- Currently buried at the bottom of the page.
- Move above (or directly under) the main Media Buy perf-tabs.
- Reason: it's a primary metric story, not a footer.

### 3. Performance Ranking "Sort By" → perf-tabs pattern
- Today: `Sort By` dropdown above the creative carousel selects ranking metric (Visits / CTR / CPV / ...).
- Convert to canonical `.perf-tabs` (per DP4.3 — Media gets perf-tabs anyway).
- Tabs become the ranking metric; chip strip / ranked-table below re-ranks per active tab.
- Folds Bill's request into the Media perf-tabs build naturally — no separate sort dropdown needed.

### 4. DP3.2 = B — Mini perf-tabs container for media-visits-stats
- Convert `.media-visits-section` into its own perf-tabs container:
  - Tabs: **By Store / By Week / Data**
  - KPI strip above tabs: 3 tiles (Attributed Visits / Spend Joined / Top-Driving Campaign) w/ jump to corresponding pane
  - Section header gains hero-stat per DP2.1
- Rationale: section earns its own structure now that it's promoted to top-of-page (#2).

---

## Cohort note (`.ep-cohort-note`) — DP10.1 styling

**Bill 2026-05-01:** When the cohort note becomes universal, restyle:
- Container wrapper: re-use `.stat-strip__cards` class (right-block card layout from section-header pattern, Group 2)
- Larger font
- Right-aligned within the section header row
- Inner pieces wrapped in `<span>` with semantic selectors so each typography piece is independently stylable. Bill will iterate CSS visually.

**Suggested span structure** (for `Cohort: 93 promotions · Brand · Week 47`):
```html
<div class="stat-strip__cards ep-cohort-note">
  <span class="ep-cohort-note__label">Cohort:</span>
  <span class="ep-cohort-note__count">93 promotions</span>
  <span class="ep-cohort-note__sep">·</span>
  <span class="ep-cohort-note__scope">Brand</span>
  <span class="ep-cohort-note__sep">·</span>
  <span class="ep-cohort-note__period">Week 47</span>
</div>
```

Per-tab variants follow same pattern (e.g. Sessions tab inserts `__metric` + `__value` spans before the count).

Effectively: cohort note becomes a peer to the hero-stat card on the right side of the section header — same visual weight class, not a small inline pill.

---

## Run-stats line (`.card-run-stats`) — DP11.1 styling

**Bill 2026-05-01:** When run-stats becomes universal, restyle:
- Wrap content in `<span class="card-run-stats__text">` selector for independent typography control
- Starting state: **bold + italic**
- Bill will iterate visually

```html
<div class="card-run-stats">
  <span class="card-run-stats__text">Ran at 27 stores · 7 days</span>
</div>
```

Per Max Apr-30 (Phase 1.1), text content evolves to include "(X of Y days)" + locations + ★ partial-run star — pieces should also be span-wrapped (`__count`, `__label`, `__star`, etc.) so partial-run state can target a specific glyph.

---

## distribution-traffic.html

### DP4.2 = B — Add perf-tabs (entity-drill IA per DP4.1)

**Rationale (Bill 2026-05-01):** Keep the perf-tabs pattern consistent. Tabs surface all options up-front and avoid scrolling — turns the linear narrative into a choose-your-own-adventure.

Current: 5 stacked sections read top-to-bottom as a narrative.
Target: canonical `.perf-tabs` container; sections become tab panes.

**Tab order:** Overview / By Competitor / By Store / Crossover Trend / Traffic Volume / Data

| Tab | Hosts |
|---|---|
| Overview | Hero + Competitive Crossover stacked-area + leaderboard preview |
| By Competitor | Full leaderboard table + Compare-panel modal |
| By Store | Per-store share table + Leaflet map (locked KEEP per Max Apr-17) |
| Crossover Trend | Line chart over time |
| Traffic Volume | Visits + CTR overlay bars |
| Data | Dense `.leaderboard-table` view (preservation rule) |

Plus: cohort note (DP10.1), run-stats (DP11.1), single-hero stat-strip (DP2.1) confirmed already present.

---

## engagement-circulars.html

Same rebuild as Categories — `store-data-grid` threads into Data sub-pane; full canonical shell wraps it.

---

## engagement-grid.html

Same rebuild — `grid-data-table` threads into Data sub-pane. Per DP8.2 (default Yes), add detail sidebar for consistency.

---
