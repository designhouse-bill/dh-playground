# Real Pulse Data — Transition Map

**Date:** 2026-04-27 (updated later same day for Ideal hierarchy)
**Source:** `/Users/billklingensmith/Desktop/dh.idealmedialab_scrape/more-data-exported-manually/`
**Origin:** Manual CSV exports from `dh.idealmedialab.com` (Pulse DSP, `api.adinfra.io`)

## Entity hierarchy (Ideal → Brand → Store)

The prototype's top-level retailer is now **Ideal Media Lab** with 7 brand children, each with stores as grandchildren:

| Brand | Stores | Source |
|---|---|---|
| Southeastern Grocers | 35 | hand-built FL stores with addresses + lat/lng |
| UNFI | 60 | extracted from PulseReal campaign Names (no geo) |
| Houchen's Food Group | 51 | extracted from PulseReal (no geo) |
| Lunds & Byerlys | 28 | extracted from PulseReal (no geo) |
| Gelson's | 27 | extracted from PulseReal (no geo) |
| MDI | 18 | extracted from PulseReal (no geo) |
| Agne | 18 | extracted from PulseReal (no geo) |
| **Total** | **237** | |

`DistributionEntities.retailerConfig` = `{ id: 'ideal', name: 'Ideal Media Lab', label: 'Ideal', pilotLabel: 'All Programs' }`. Sub-brands (Winn-Dixie / Harveys split, FL regions) removed from the public tree; `subBrands` array kept empty for backward compat. Modal entity selector displays `Ideal Media Lab → Brand → Store`. Header context-card breadcrumb shows `RETAILER` / `BRAND` / `STORE`.

## What changed

Three Pulse CSV exports ported into the prototype as a single JS module — **direct port, no value modification**.

| CSV export | Rows | Mock module field |
|---|---|---|
| `/dsp/campaign` (SEG only) | 287 | `PulseReal.campaigns` |
| `/dsp/reporting/campaign` (mixed advertisers) | 184 | `PulseReal.reporting` |
| `/dsp/activate_creatives` (SEG only) | 2,750 | `PulseReal.creatives` |

Loaded by all 3 distribution HTML pages via `<script src="js/data/pulse-real.js">`.

## Port discipline

- **No value alteration.** CSV column values flow into JS without transformation.
- **CSV column names preserved exactly** (`"Budget($)"`, `"On/Off"`, `"KPI metric"`, `"Creative ID"`).
- **One added field:** `campaigns[i]._store_number` — int parsed from trailing digits in `Name` (e.g. `"Winn-Dixie 319"` → `319`). Underscore prefix marks derived/non-CSV.
- Reporting "copy" duplicate files excluded.

## Mock store ↔ real campaign mapping

25 of 35 mock SEG/Harveys stores have ≥1 matching real Pulse campaign (matched by trailing store number in `Name`).

**Matched (25):** 86, 195, 319, 336, 381, 436, 560, 705, 711, 726, 1671, 1690, 1692, 1694, 1710, 1712, 1716, 2247, 2288, 2415, 2437, 2487, 2495, 2509, 2545

**Unmatched (10):** 508, 518, 2399, 2434, 2449, 2474, 2480, 2482, 2490, 2501

Unmatched stores keep synthetic `STORE_PARAMS` values; matched stores get real values overlaid (see below).

## Per-store overlay (`STORE_PARAMS`)

For each matched store, `distribution-records.js` reads `PulseReal.primaryCampaignForStoreNumber(n)` (prefers `Status === "Live"`, else first) and overrides:

| `STORE_PARAMS[storeId]` field | Source CSV column |
|---|---|
| `.budget` (replaces synthetic) | `Budget($)` |
| `.real_pulse_campaign_id` | `ID` |
| `.real_pulse_budget_total` | `Budget($)` |
| `.real_pulse_group` | `Group` |
| `.real_pulse_status` | `Status` |
| `.real_pulse_kpi` | `KPI` |
| `.real_pulse_kpi_metric` | `KPI metric` |
| `.real_pulse_name` | `Name` |

## Creative overlay (`creativeRecords`)

Each of 5 mock creatives represents one Pulse `Group`. One representative real campaign per creative drives the overlay:

| Mock creative | Source store # | Real campaign ID | Real Group |
|---|---|---|---|
| `creative-a` Holiday Steak — South FL | 319 | 33437 | SEG 27 |
| `creative-b` Holiday Banner — Central FL | 2288 | 31892 | Winn-Dixie Ongoing 20 |
| `creative-c` BOGO Produce — North FL | 195 | 32857 | SEG Liquors |
| `creative-d` Value Pack — Harveys | 1671 | 31868 | Harveys December Only |
| `creative-e` YouTube Pre-Roll — Holiday | (none) | — | (synthetic; no real video data in export) |

Overlaid creative fields: `group`, `kpi`, `kpi_metric`, `kpi_value`, `status`, `status_on`, `frequency_amount`, `frequency_interval`, `pacing`, `channel`, `date_range_start`, `date_range_end`, `flights[]` (parsed from `Ongoing Flights`), `real_pulse_source`.

## What is **not** ported

- **Per-week impressions / clicks / CTR / CPM / CPC for SEG.** The `/dsp/reporting/campaign` export does **not** contain SEG IDs in this batch. The 184 reporting rows we have are for other advertisers (Lunds & Byerlys, Gelson's, Albrecht's, Nielsen, Sentry, plus 146 unclassified). Synthetic per-week metrics in `mediaRecords` remain unchanged until SEG reporting is provided.
- **Consequence visible in UI:** real big budgets (e.g. Winn-Dixie 2288 ≈ $11K) divided by synthetic small impressions yields inflated CPM/CPC values in creative cards. This is the expected truth of a partial port; do not mask it by scaling synthetic metrics.

## What stays synthetic

- `mediaRecords` impressions / clicks / CTR / CPM / CPC (per-week, per-store) — until SEG reporting is delivered
- `visitationRecords` (entire — VA file is separate Greenberg drop, not in Pulse export)
- `trafficRecords` (entire — visit-share comes from VA panel, not Pulse)
- `crossoverRecords` (entire — same)
- `videoEngagement`, `demographics` — kept from prior session

## Module API

```js
PulseReal.campaigns                     // all 287 SEG campaign rows, original column names
PulseReal.reporting                     // 184 reporting rows, original column names
PulseReal.creatives                     // 2,750 SEG creative rows, original column names
PulseReal.campaignsByStoreNumber        // { [storeNum]: campaign[] }
PulseReal.campaignById                  // { [pulseCampaignId]: campaign }
PulseReal.reportingById                 // { [pulseCampaignId]: reportingRow }
PulseReal.creativesById                 // { [pulseCreativeId]: creativeRow }
PulseReal.campaignsForStoreNumber(n)    // campaign[]
PulseReal.primaryCampaignForStoreNumber(n)  // first Live, else first, else null
PulseReal.reportingForCampaignId(id)
PulseReal.creativeById(id)
```

## Files touched

- **NEW** `js/data/pulse-real.js` — 2.5MB, raw port of three CSVs
- `distribution-{visitation,media,traffic}.html` — added `<script src="js/data/pulse-real.js?v=1">` before `distribution-records.js`; bumped `distribution-records.js` and `distribution-data.js` to `v=14`
- `js/data/distribution-records.js` — added `realCampaignForStore()` helper, `STORE_PARAMS` overlay loop, `creativeRecords` overlay block, header note

## Re-run the extract

If new CSVs land in the same desktop folder, re-run the inline Python in the bash command that produced `pulse-real.js` (see git diff for 2026-04-27). Bump `?v=` and reload. Original CSVs are not committed to the repo.
