# Distribution Analytics Dashboard — Product Overview

## Purpose

The Distribution Analytics Dashboard answers a single question: **"Is our media spend driving the right people to the right stores?"**

It breaks this into three complementary sections, each targeting a different stakeholder need. Together, they tell a complete story from media delivery through store visitation to competitive market position.

---

## Section 1: Media Buy

### Why This Section Exists

Media buyers need to know if their budget is being spent efficiently. Without visibility into cost-per-visit, click-through rates, and creative performance, optimization decisions are made blind. This section closes the loop between **dollars spent** and **people reached**.

### What It Answers

- How efficiently are we spending our media budget?
- Which creative variants are performing best?
- Where is money being wasted, and where should we invest more?

### How It Works

**Hero KPIs** — The top of the page shows the campaign-level story: Cost Per Visit (the primary efficiency metric), Total Budget, and a trend callout showing whether CPV is improving or declining over the campaign. Six supporting cards show Gross Visits, Zero Previous visitors, 1-3 Previous, Visits/1K impressions, 4+ Previous, and New Shopper percentage — each with week-over-week trend arrows.

**Performance Ranking** — A horizontal carousel ranks creative variants by performance. Each card shows a thumbnail, type badge (JPEG/GIF/VIDEO), delivery metrics (Stores, CTR, Visits), and a direct link to the target URL. Users scan this to quickly identify top and bottom performers.

**Detailed Breakdown (Tree Table)** — Expandable rows show every creative variant with per-store child rows underneath. Default columns show Creative, Type, Stores, CTR, Visits, and CPV. A "More Data" toggle reveals Impressions, Clicks, Budget, Visits/1K, and target link. Video creatives include a video funnel detail row (quartile completion rates). The table is sortable by any metric column, and supports Export (CSV), Print, and Share actions.

**Entity Filtering** — All data responds to the entity selector (Brand → Sub-brand → Store Group → Store). At the store level, the tree table flattens to show variant performance at that individual location.

### Value to End User

Media buyers can identify underperforming creatives and reallocate budget in near-real-time. Regional managers can see which creatives work in their geography. The tree table gives both the executive summary (parent rows) and the forensic detail (store-level children) in one view.

---

## Section 2: Store Visitation

### Why This Section Exists

Knowing that media was delivered is not enough. The business needs to know: **did people actually show up?** And critically — were they new customers, or just loyal shoppers who would have come anyway? This section connects media attribution to physical store foot traffic and visitor behavior.

### What It Answers

- How many people did our media drive to stores?
- What kind of shoppers were they — new, returning, or loyal?
- Where else do our media-driven visitors shop?
- Which individual stores are performing best at converting media into visits?

### How It Works

**Hero KPIs** — Cost Per Visit, Total Budget, and six metric cards (Gross Visits, Zero Previous, 1-3 Previous, Visits/1K, 4+ Previous, New Shopper %) with trend arrows comparing to the first week of the campaign.

**Current / Trend Toggle** — A segmented control separates two mental models:

- **Current** (default) — A snapshot of "what happened." Shows visitor composition and competitive behavior for the selected time period.
- **Trend** — Time-series analysis of "how is it changing." Shows weekly frequency shifts and competitive crossover trends.

**Visit Frequency Donut (Current View)** — A donut chart in the left 1/3 of the panel shows the visitor mix: Zero Previous (new shoppers who haven't visited in 30 days), 1-3 Previous (developing loyalty), and 4+ Previous (established loyalists). The center displays total visits. This replaces a stacked bar chart because the story here is composition, not trajectory.

**Competitive Crossover (Current View)** — A horizontal bar chart in the right 2/3 shows where media-driven visitors also shop (Publix, Walmart, ALDI, etc.). Below the charts, a full-width detail table shows per-competitor breakdown with expandable rows.

**Donut-Crossover Interaction** — Clicking a donut segment (e.g., "Zero Previous") filters the crossover chart to show where only new shoppers also shop. This reveals behavioral differences: new shoppers may cross over to different competitors than loyal shoppers. A filter chip appears for easy clearing.

**Visit Frequency Over Time (Trend View)** — The original stacked bar chart lives here, showing week-by-week visitor composition shifts. Useful for campaign managers tracking whether the new-shopper ratio is improving.

**Crossover Trend (Trend View)** — Multi-line chart showing each competitor's crossover percentage over time. Reveals whether competitive overlap is growing or shrinking.

**Store Performance Panel** — A full-width map shows all stores color-coded by new shopper performance (Green = Strong, Amber = Watch, Red = Critical). Below the map, a scrollable sortable table shows per-store metrics: Visits, New Shoppers %, and CPV, with a "More Data" toggle for additional columns.

**Map-Table Interaction** — Clicking a table row zooms the map to that store and opens its popup. Clicking a map pin highlights the corresponding table row and scrolls it into view. A "Reset" button returns to the overview. This bi-directional selection helps users connect geographic patterns to tabular data.

### Value to End User

Campaign managers see immediately whether media is acquiring new customers or just reminding loyalists. The donut-crossover interaction reveals competitive dynamics per visitor segment — critical for targeting strategy. The store performance map identifies geographic hotspots and problem areas, enabling regional resource allocation.

---

## Section 3: Traffic Share

### Why This Section Exists

Visitation data tells you about your own stores. Traffic Share answers the bigger question: **are we winning or losing in the competitive landscape?** This section measures gross foot traffic share relative to nearby competitors, independent of media attribution. It's the market-level scoreboard.

### What It Answers

- Are we gaining or losing traffic share vs. competitors?
- Which stores are outperforming, and which are at risk?
- Where is market concentration highest, and who are the primary threats?
- What does the geographic distribution of performance look like?

### How It Works

**Traffic KPIs** — Four summary tiles: Traffic Share (current %), Share Change (percentage points), Outperforming count (stores gaining share), and Growth Advantage (our growth rate vs. competitor growth rate).

**Store Map** — A full-width map color-codes every store by performance group (Green = strong/gaining share, Amber = watch, Red = critical/losing share). Popups show share %, change, and primary competitor threat.

**Traffic Share Over Time** — A dual-line chart showing our traffic share vs. combined competitor share over the campaign weeks. An annotation shows whether the gap is widening or narrowing.

**Visit Volume by Week** — A grouped bar chart comparing absolute visit counts (our stores vs. competitors) by week. This separates the share story (relative) from the volume story (absolute).

**Store Leaderboard** — A sortable table ranking every store by share change or current share. Each row shows store ID, city, current share, change in percentage points, and alert status (opportunity/critical/warning). Sortable by Change or by Share.

**Market Concentration** — HHI (Herfindahl-Hirschman Index) analysis showing how many stores are in highly concentrated vs. moderately concentrated competitive environments.

**Primary Threats** — Lists competitor brands by how many of our stores they threaten, with a visual bar showing proportion. Subtitle clarifies: "Which competitor locations draw the most traffic near our stores."

### Value to End User

Operations and category managers see the competitive landscape at a glance. The leaderboard identifies stores that need attention (critical) and stores with growth opportunity. The concentration analysis helps prioritize where competitive investment will have the most impact.

---

## How the Three Sections Work Together

| Question | Section | Metric |
|---|---|---|
| Are we spending efficiently? | Media Buy | CPV, CTR, creative ranking |
| Did media drive people to stores? | Store Visitation | Gross visits, new shopper %, visitor composition |
| Are we winning the market? | Traffic Share | Share %, share change, growth advantage |

The flow is intentional: **Media Buy** measures the input (spend efficiency), **Store Visitation** measures the direct output (attributed visits), and **Traffic Share** measures the market outcome (competitive position). A campaign could have great CPV and high visitation but still lose market share if competitors are growing faster. All three views are needed for the complete picture.

---

## Alignment with Adam's Vision

Adam's vision for the Distribution Analytics Dashboard centers on a key principle: **media spend should be measurable through to the store shelf.** The traditional gap in retail media has been between digital delivery metrics (impressions, clicks) and physical-world outcomes (store visits, market share). This dashboard bridges that gap.

### Connecting Digital to Physical

The dashboard creates a direct line from media delivery (Media Buy: impressions, clicks, cost) through store traffic (Store Visitation: visits, visitor type, competitive crossover) to market impact (Traffic Share: share change, competitive position). Each section is a link in the attribution chain.

### Actionable at Every Level

The entity hierarchy (Brand → Sub-brand → Store Group → Store) means every metric can be viewed at the executive level or drilled down to individual store performance. A CMO sees campaign-level CPV trends. A regional manager sees which creatives work in South Florida. A store manager sees their location's new shopper acquisition rate.

### Competitive Intelligence Built In

The competitive crossover (Store Visitation) and primary threats (Traffic Share) give retailers visibility into shopper behavior beyond their own four walls. This isn't just "how are we doing" — it's "how are we doing relative to the competitive set." The donut-crossover interaction specifically reveals where different visitor segments are also shopping, enabling targeted competitive strategies.

### Real-Time Optimization

The weekly granularity (Week 50 through Week 2) and the Current/Trend toggle on Store Visitation enable campaign-in-flight optimization. Media buyers don't have to wait for post-campaign analysis — they can see mid-campaign whether creative swaps or budget reallocation are improving performance.

### Store-Level Accountability

The Store Performance panel (map + table) and the Traffic Share Leaderboard make individual store performance visible and comparable. The color coding (Strong/Watch/Critical) creates an instant visual language that works in meetings and reports without explanation.

---

## Technical Context

This prototype is built as a static HTML/CSS/JavaScript application with mock data simulating 5 weeks of campaign performance across 35 Florida stores for Southeastern Grocers (Winn-Dixie + Harveys). All data is procedurally generated but structurally accurate to the production data model.

**Production implementation** will use Angular with PrimeNG components, Google Maps API (replacing Leaflet), virtual scroll for large store counts, and real-time API data from the Ideal Sale API backend.

---

## Entity Hierarchy

| Level | Example | Stores |
|---|---|---|
| Brand | Southeastern Grocers | 35 |
| Sub-brand | Winn-Dixie | 28 |
| Sub-brand | Harveys | 7 |
| Store Group | South FL (Winn-Dixie) | 6 |
| Store Group | Central FL (Winn-Dixie) | 10 |
| Store Group | North FL (Winn-Dixie) | 12 |
| Store Group | Florida (Harveys) | 7 |
| Store | Store 336, Hollywood FL | 1 |

All three Distribution sections respond to entity selection. Changing the entity filters every metric, chart, table, and map to that scope.

## Date Context

| Week | Dates |
|---|---|
| Week 50 | Dec 10–16, 2025 |
| Week 51 | Dec 17–23, 2025 |
| Week 52 | Dec 24–30, 2025 |
| Week 1 | Dec 31, 2025 – Jan 6, 2026 |
| Week 2 | Jan 7–13, 2026 |

Default view shows all weeks aggregated. Single-week selection is available via the date picker modal.
