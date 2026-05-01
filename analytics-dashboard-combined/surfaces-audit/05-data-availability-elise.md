# Data Availability — Elise's Idealmedialab Scrape

**Source:** `/Users/billklingensmith/Desktop/dh.idealmedialab_scrape/`
**Confirmed by Max (5:06pm 2026-04-30):** Yes — this data is available; no blocker on Media Buy buildout.

---

## Files inventory

### Top-level (root of scrape folder)

| File | Rows | What it gives you |
|---|---|---|
| `reporting-campaign-campaign-04-27-2026.csv` | 43 | **THE Media Buy KPI snapshot.** `ID, Campaign Name, Impressions, Clicks, CTR, CPM, CPC, Conversions, CPA, VCR, Spend, Status` |
| `campaign-04-27-2026.csv` | 135 | Campaign metadata. `Agency ID, Advertiser ID, Advertiser Name, ID, Name, Group, Channel, On/Off, Status, Business ID/Page URL, Audience ID, Creative IDs, KPI, KPI metric, KPI value, Is Ongoing, Ongoing Interval, Ongoing Flights, Budget($), Start Date, End Date, Max Bid($), Daily cap($), Frequency amount, Frequency interval, Pacing, Conversion Tracking` |
| `activate_audiences-04-27-2026.csv` | (n) | Audience definitions. `ID, Name, Advertiser ID, Advertiser Name, Created At, Rule Id Name, Rule Type Name, Rule Value Name, Rule Value` |
| `dh.idealmedialab.com.har` | — | Network HAR — captures the live API calls to idealmedialab. Source-of-truth for endpoint shape. |

### Subfolders

| Path | Contents |
|---|---|
| `Analytics Dashboard Data-Lunds/LB Demographic` | Lunds & Byerlys demographic data (Greenberg) |
| `Analytics Dashboard Data-Lunds/LB Visitation Data` | Lunds & Byerlys store visitation data (Greenberg) |
| `more-data-exported-manually/` | More CSVs — `activate_creatives` (396 rows), additional campaign + reporting snapshots |
| `Analytics Dashboard Data-20260428T172003Z-3-001.zip` | Zipped backup of dashboard data |

---

## Data → Media Buy UI mapping

### KPI tile strip (top of Media Buy section)

| KPI tile | Data source | Aggregation |
|---|---|---|
| Overview | (computed / nav target) | — |
| Click Thru Rate | `reporting-campaign.CTR` | Aggregate across campaigns OR per-campaign |
| Clicks | `reporting-campaign.Clicks` | Sum |
| Impressions | `reporting-campaign.Impressions` | Sum |

**Bonus tiles available** (not in Max's mockup but data supports): CPM, CPC, Conversions, CPA, VCR, Spend.

### Perf-tabs / sub-tabs

| Sub-tab | Data source | Notes |
|---|---|---|
| **Overview** | reporting-campaign aggregate + 3-panel grid (Store / Creative / Day) | Per Image 1 of Max's exports |
| **By Creative** | `activate_creatives` joined to `campaign.Creative IDs` joined to `reporting-campaign` per-creative metrics | 396 creatives — needs aggregation per CTR/Clicks/Impressions |
| **By Day** | **NOT in current scrape** — needs daily-cadence reporting | Probably exists in idealmedialab API; capture from HAR or request from Elise |
| **Time Trend** | Same as By Day, time-series | Same gap |
| **By Store** | **NOT in this data** — see gap below | |
| **Data** | Threaded `.ep-data-table` w/ all campaigns + cuts | Easy — `reporting-campaign` is already tabular |

---

## Gap to flag w/ Max

### Gap 1: "By Store" cut for Media Buy

Max's mockup (`02-media-buy-overview.png` and `03-media-buy-stacked-list.png`) shows "By Store" as a sub-tab.

**The Elise files don't have store-level data** — they're campaign-level (43 campaigns, 135 campaign records). Idealmedialab is a **media-buying platform**, so it tracks creative reach, not where the resulting visit landed.

**To populate "By Store":** Join campaign reach data to **Greenberg visitation data** (the `Analytics Dashboard Data-Lunds/LB Visitation Data` files in this same scrape, OR the larger Greenberg pipeline). This is media-attribution work — connecting "this creative drove these visits to that store."

**Question for Max:**
- Is "By Store" on Media Buy intended to show *where the campaign drove visits* (= Greenberg visitation, attributed)? OR
- *Where the campaign was targeted geographically* (= campaign audience targeting metadata)? OR
- Should "By Store" be dropped from Media Buy and only kept on Visitation page?

### Gap 2: Daily cadence

Sub-tabs "By Day" + "Time Trend" need daily numbers. The current scrape is a single-snapshot CSV. Options:
- Pull daily breakdown from idealmedialab API (HAR may show endpoint)
- Pull daily timeseries via Greenberg
- Stub "By Day" with derived/synthesized data for prototype until live wiring

### Gap 3: Joining the tables

Multi-table joins required:
- `campaign.Creative IDs` (comma-separated) → `activate_creatives.Creative ID`
- `campaign.Audience ID` → `activate_audiences.ID`
- `campaign.ID` → `reporting-campaign.ID` (or matched by Campaign Name?)

**For AI implementer:** The HAR file (`dh.idealmedialab.com.har`) is likely the cleanest source of joined data — captures the live API responses where joins are pre-resolved by the platform.

---

## Implications for the plan

1. **Media Buy buildout is data-feasible** for KPI tiles + By Creative + Data table sub-tabs immediately.
2. **By Store cut** needs Max clarification (gap #1).
3. **By Day / Time Trend** need a daily data source (gap #2).
4. **Stacked-list segments (DP15.2)** — most likely candidates given the data:
   - **Channel split** (`campaign.Channel` — likely Facebook / Display / Programmatic / etc.)
   - Creative type split (`activate_creatives.Type` — Image/Video/HTML)
   - Status split (Active/Paused/Ended)
   
   Channel split is most consistent with "where did the media buy run" framing.

5. **Multi-campaign navigation (DP15.1):** 135 campaign records. Chip-strip won't scale at that volume. Recommendation evolves:
   - **Top-level filter:** Advertiser / Brand selector (already in context bar)
   - **Within filtered set:** Chip-strip of active/recent campaigns (5-15 typical) + "More" overflow → modal entity-selector pattern for full list
   - This unifies w/ canonical entity-selector modal pattern.

---

## Action items

- [ ] **Bill** — confirm `reporting-campaign.csv` is the intended KPI source w/ Max
- [ ] **Bill** — ask Max about Gap 1 (By Store source)
- [ ] **Bill** — ask Max about Gap 2 (daily data source)
- [ ] **Claude** — sample-parse HAR file to extract joined API response shape (for AI implementer reference)
- [ ] **Claude** — when Layer 3 visual companion is built, use real-shape mock data derived from these CSVs (not invented data)
