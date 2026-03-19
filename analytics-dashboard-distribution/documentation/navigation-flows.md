# Analytics Dashboard - Navigation Flows

This document describes all navigation flows within the multi-page Analytics Dashboard application.

## Page Structure

| Page | File | Description |
|------|------|-------------|
| Categories | `base_categories.html` | BASE mode - Category data grid with detail panel |
| Promotions | `base_promotions.html` | BASE mode - Three-column promotion browser |
| Grid Inquiry | `grid-inquiry.html` | GRID mode - Full-width data grid with pagination |
| Compare | `compare.html` | COMPARE mode - Side-by-side comparison view |
| Index | `index.html` | Redirect to base_categories.html |

---

## Main Navigation Flow

```mermaid
flowchart TB
    subgraph Header["Header Navigation"]
        BASE["BASE Button"]
        GRID["GRID Button"]
        COMPARE["COMPARE Button"]
    end

    subgraph BaseSubtabs["BASE Subtabs"]
        CAT["Categories Tab"]
        PROMO["Promotions Tab"]
    end

    subgraph Pages["Pages"]
        CatPage["base_categories.html"]
        PromoPage["base_promotions.html"]
        GridPage["grid-inquiry.html"]
        ComparePage["compare.html"]
    end

    BASE --> CAT
    BASE --> PROMO
    CAT --> CatPage
    PROMO --> PromoPage
    GRID --> GridPage
    COMPARE --> ComparePage

    CatPage <--> PromoPage
    CatPage --> GridPage
    CatPage --> ComparePage
    PromoPage --> GridPage
    PromoPage --> ComparePage
```

---

## Categories Page Flow

```mermaid
flowchart TB
    subgraph CategoriesPage["base_categories.html"]
        CatGrid["Category Data Grid"]
        CatDetail["Category Detail Panel"]
    end

    subgraph Navigation["Navigation Targets"]
        Promos["base_promotions.html"]
        Grid["grid-inquiry.html"]
        Compare["compare.html"]
    end

    CatGrid -->|"Click Row"| CatDetail
    CatDetail -->|"View Promotions"| Promos
    CatDetail -->|"Inquiry Data Grid"| Grid
    CatDetail -->|"Compare"| Compare

    CatGrid -.->|"Passes categoryId param"| Promos
    CatGrid -.->|"Passes categoryId param"| Grid
    CatGrid -.->|"Passes categoryId param"| Compare
```

---

## Promotions Page Flow

```mermaid
flowchart TB
    subgraph PromotionsPage["base_promotions.html"]
        CatList["Category List Panel"]
        PromoTable["Promotions Table/Grid"]
        PromoDetail["Promotion Detail Panel"]
    end

    subgraph Navigation["Navigation Targets"]
        Grid["grid-inquiry.html"]
        Compare["compare.html"]
    end

    CatList -->|"Click Category"| PromoTable
    PromoTable -->|"Click Promotion"| PromoDetail

    PromoDetail -->|"Grid Inquiry"| Grid
    PromoDetail -->|"Compare"| Compare

    PromoDetail -.->|"Passes promotionId param"| Grid
    PromoDetail -.->|"Passes promotionId param"| Compare
```

---

## Grid Inquiry Page Flow

```mermaid
flowchart TB
    subgraph GridPage["grid-inquiry.html"]
        GridTable["Data Grid Table"]
        Pagination["Pagination Controls"]
        Columns["Column Visibility"]
    end

    subgraph IncomingParams["Incoming URL Parameters"]
        CatParam["?categoryId=xxx"]
        PromoParam["?promotionId=xxx"]
    end

    CatParam -->|"Pre-filters by category"| GridTable
    PromoParam -->|"Highlights promotion"| GridTable

    Pagination --> GridTable
    Columns --> GridTable
```

---

## Compare Page Flow

```mermaid
flowchart TB
    subgraph ComparePage["compare.html"]
        Selection["Selection Info"]
        CompareView["Comparison View"]
    end

    subgraph IncomingParams["Incoming URL Parameters"]
        CatParam["?categoryId=xxx"]
        PromoParam["?promotionId=xxx"]
    end

    CatParam -->|"First comparison item"| Selection
    PromoParam -->|"First comparison item"| Selection
    Selection --> CompareView
```

---

## State Persistence Flow

```mermaid
flowchart LR
    subgraph UserAction["User Action"]
        Click["Navigate/Interact"]
    end

    subgraph StateManager["State Manager"]
        Save["StateManager.save()"]
        Load["StateManager.load()"]
        Params["URL Parameters"]
    end

    subgraph Storage["localStorage"]
        State["analytics_dashboard_state"]
    end

    subgraph NewPage["New Page Load"]
        Init["Page init()"]
        Restore["core.restoreState()"]
    end

    Click --> Save
    Save --> State
    Click --> Params

    Init --> Load
    Load --> State
    State --> Restore
    Params --> Restore
```

---

## Modal Flows

```mermaid
flowchart TB
    subgraph Triggers["Modal Triggers"]
        DateCard["Date Range Card"]
        EntityCard["Entity Card"]
        FilterBtn["Add Filter Button"]
    end

    subgraph Modals["Modal Dialogs"]
        DateModal["Date Picker Modal"]
        EntityModal["Entity Selector Modal"]
        FilterModal["Add Filter Modal"]
    end

    subgraph Outcomes["Outcomes"]
        DateUpdate["Update date display"]
        EntityUpdate["Update entity display"]
        FilterChip["Add filter chip"]
        DataRefresh["Refresh data"]
    end

    DateCard --> DateModal
    EntityCard --> EntityModal
    FilterBtn --> FilterModal

    DateModal -->|"Apply"| DateUpdate
    DateModal -->|"Apply"| DataRefresh
    EntityModal -->|"Apply"| EntityUpdate
    EntityModal -->|"Apply"| DataRefresh
    FilterModal -->|"Apply"| FilterChip
    FilterModal -->|"Apply"| DataRefresh
```

---

## Filter Flow

```mermaid
flowchart TB
    subgraph FilterSources["Filter Sources"]
        Chips["Filter Chips"]
        CategoryClick["Category Selection"]
        ColumnHeaders["Column Header Filters"]
    end

    subgraph FilterState["Filter State"]
        ActiveFilters["state.activeFilters[]"]
        ColumnFilters["state.columnFilters{}"]
    end

    subgraph Application["Filter Application"]
        Apply["DashboardFilters.applyFilters()"]
        Render["Re-render views"]
    end

    Chips --> ActiveFilters
    CategoryClick --> ActiveFilters
    ColumnHeaders --> ColumnFilters

    ActiveFilters --> Apply
    ColumnFilters --> Apply
    Apply --> Render
```

---

## Testing Checklist

### Navigation Tests (NAV)

| ID | Test | Expected Result |
|----|------|-----------------|
| NAV-01 | Click BASE button from any page | Navigate to base_categories.html |
| NAV-02 | Click Categories subtab | Navigate to base_categories.html |
| NAV-03 | Click Promotions subtab | Navigate to base_promotions.html |
| NAV-04 | Click GRID button | Navigate to grid-inquiry.html |
| NAV-05 | Click COMPARE button | Navigate to compare.html |
| NAV-06 | Category detail: View Promotions | Navigate to base_promotions.html with categoryId |
| NAV-07 | Category detail: Inquiry Data Grid | Navigate to grid-inquiry.html with categoryId |
| NAV-08 | Category detail: Compare | Navigate to compare.html with categoryId |
| NAV-09 | Promotion detail: Grid Inquiry | Navigate to grid-inquiry.html with promotionId |
| NAV-10 | Promotion detail: Compare | Navigate to compare.html with promotionId |
| NAV-11 | Visit index.html | Redirect to base_categories.html |

### State Persistence Tests (STATE)

| ID | Test | Expected Result |
|----|------|-----------------|
| STATE-01 | Set filters, navigate away, return | Filters preserved |
| STATE-02 | Select category, navigate to promotions | Category pre-selected |
| STATE-03 | Change date range, refresh page | Date range preserved |
| STATE-04 | Change entity, navigate between pages | Entity preserved |
| STATE-05 | Sort columns, refresh page | Sort order preserved |
| STATE-06 | Toggle card view, refresh page | View mode preserved |

### UI State Tests (UI)

| ID | Test | Expected Result |
|----|------|-----------------|
| UI-01 | Active navigation highlighting | Current page nav button highlighted |
| UI-02 | Detail panel state | Panel state preserved on refresh |
| UI-03 | Grid column visibility | Column visibility preserved |
| UI-04 | Pagination position | Page position preserved on refresh |

### Filter Tests (FILTER)

| ID | Test | Expected Result |
|----|------|-----------------|
| FILTER-01 | Add category filter | Only ONE category filter allowed |
| FILTER-02 | Add deal type filter | Only ONE deal filter allowed |
| FILTER-03 | Filter chips persist | Chips visible after page navigation |

---

## File Dependencies

```mermaid
flowchart TB
    subgraph SharedScripts["Shared Scripts (All Pages)"]
        SM["js/state-manager.js"]
        SC["js/shared-core.js"]
        SMod["js/shared-modals.js"]
        SF["js/shared-filters.js"]
    end

    subgraph PageScripts["Page-Specific Scripts"]
        BC["js/base-categories.js"]
        BP["js/base-promotions.js"]
        GI["js/grid-inquiry.js"]
        CO["js/compare.js"]
    end

    subgraph DataScripts["Data Scripts"]
        MockData["shared/mock-data.js"]
        PromoData["shared/promotion-records-data.js"]
        Cache["cache-manager.js"]
        DataSvc["data-service.js"]
    end

    SM --> SC
    SC --> SMod
    SC --> SF

    MockData --> SC
    PromoData --> SC
    Cache --> SC
    DataSvc --> SC

    SC --> BC
    SC --> BP
    SC --> GI
    SC --> CO
```

---

## URL Parameter Reference

| Parameter | Type | Used By | Purpose |
|-----------|------|---------|---------|
| `categoryId` | string | promotions, grid, compare | Pre-select/filter by category |
| `promotionId` | string | grid, compare | Pre-select/highlight promotion |
| `view` | string | base pages | Specify initial view mode |

---

## localStorage Keys

| Key | Content |
|-----|---------|
| `analytics_dashboard_state` | Full application state JSON |

### State Object Structure

```json
{
  "activeFilters": [],
  "columnFilters": {},
  "selectedWeek": {},
  "selectedEntity": {},
  "categorySortColumn": "name",
  "categorySortDirection": "asc",
  "promoSortColumn": "name",
  "promoSortDirection": "asc",
  "cardViewEnabled": false,
  "moreDataEnabled": false,
  "selectedCategoryId": null,
  "selectedPromotionId": null,
  "gridPage": 1,
  "gridRowsPerPage": 25,
  "gridVisibleColumns": []
}
```
