# Distribution Analytics Dashboard — Executive Summary

## What It Is

A working interactive prototype that measures the full impact of retail media spend — from ad delivery through store visitation to competitive market position. Built for Southeastern Grocers (Winn-Dixie + Harveys) across 35 Florida pilot stores over a 5-week campaign (Dec 10, 2025 – Jan 13, 2026).

## The Three Sections

### Media Buy — "Are we spending efficiently?"

Shows cost-per-visit, creative performance rankings, and per-store delivery metrics. A tree table lets users drill from campaign-level summaries down to individual store performance per creative variant. Video creatives include completion funnel data. Users can identify top/bottom performers and reallocate budget mid-campaign.

### Store Visitation — "Did media drive the right people to stores?"

An interactive donut chart shows the visitor composition (new vs. returning vs. loyal shoppers). Clicking a segment filters the Competitive Crossover chart beside it to reveal where that specific visitor type also shops. A Current/Trend toggle separates the snapshot view from time-series analysis. Below, a Store Performance panel combines a color-coded map with a sortable table — clicking a table row zooms the map to that store, and vice versa.

### Traffic Share — "Are we winning the market?"

Measures gross foot traffic share relative to competitors using the same hero KPI layout as the other two sections. A combined dual-axis chart shows visit volume (bars) alongside share percentage (line) in one view. A Store Performance panel pairs a sortable leaderboard with an interactive map — including toggleable competitor store pins color-coded by brand. A Competitive Crossover & Threats tree table combines behavioral crossover data with geographic threat locations in expandable rows.

## How They Connect

Media Buy measures the **input** (spend efficiency). Store Visitation measures the **output** (attributed visits and visitor quality). Traffic Share measures the **outcome** (competitive market position). All three are needed — a campaign could have great CPV but still lose market share if competitors are growing faster.

## Alignment with Adam's Vision

This prototype delivers on the core principle that **media spend should be measurable through to the store shelf**:

- **Digital-to-physical attribution** — Links impressions and clicks directly to store visits, broken down by visitor type (new, returning, loyal)
- **Competitive intelligence** — Shows where media-driven visitors also shop (behavioral crossover) and which competitors threaten each store location (market position)
- **Actionable at every level** — Entity hierarchy (Brand → Sub-brand → Store Group → Store) means executives see campaign trends while regional managers see store-specific performance
- **Mid-campaign optimization** — Weekly granularity and interactive filtering enable decisions while the campaign is still running, not just in post-mortem
- **Store-level accountability** — Color-coded maps and sortable leaderboards make performance visible and comparable across the entire fleet

## What's in the Prototype

| Feature | Status |
|---|---|
| Media Buy: Hero KPIs, creative carousel, tree table with drill-down | Complete |
| Store Visitation: Donut chart, crossover interaction, Current/Trend toggle | Complete |
| Store Visitation: Store Performance map + table with bi-directional selection | Complete |
| Traffic Share: Hero KPIs, combined chart, store performance (table + map), crossover & threats tree table | Complete |
| Entity filtering (Brand → Sub-brand → Store Group → Store) | Complete |
| Date range selection (all weeks or single week) | Complete |
| Engagement Dashboard (Promotions, Categories, Circulars, Grid, Compare) | Complete |

## Next Steps

- Product review and feedback on section structure, metrics, and interaction patterns
- Prioritize features for production Angular implementation
- Define real API data contracts for each section
- Implement with Google Maps, PrimeNG data tables, and virtual scroll for scale (10,000+ stores)
