# Analytics Dashboard v1 — Requirements Document

## Document Purpose

This document establishes the UI/UX requirements for the Ideal Digital Circular Analytics Dashboard. It serves as the source of truth for:
- UX/UI team page architecture and user experience design
- Product team Jira card creation
- Development team implementation guidance
- Claude Code prototype development

---

## 1. Product Overview

### 1.1 Purpose
Transform digital circular engagement data into actionable insights for grocery industry stakeholders. The dashboard measures promotion performance through engagement metrics to demonstrate digital circular ROI.

### 1.2 Target Users
| Role | Primary Need |
|------|--------------|
| Brand/Sub-Brand Administrator | High-level performance insights across locations |
| Store Manager | Store-specific promotion performance |
| Department Manager | Category-level performance within store |
| Marketing Team | Measure marketing decision effectiveness |

### 1.3 Core Metrics
| Metric | Abbreviation | Definition |
|--------|--------------|------------|
| Card in View | CIV | Promotion card visible in browser viewport (scroll depth indicator) |
| Card Clicked | CC | User engaged by clicking promotion |
| Added to List | ATL | User added promotion to shopping list |
| Composite Score | — | Weighted combination of engagement metrics |
| Percentile | — | Relative performance ranking |

---

## 2. Architecture: Mental Model

### 2.1 Separation of Definition and Display

The dashboard architecture separates two independent layers:

**Layer 1: Definition (Context)**
What data are we looking at?
- Date Range (When)
- Entity (Where/Who)
- Applied Filters (What subset)

**Layer 2: Display (Presentation)**
How are we looking at that data?
- Base View (curated, guided exploration)
- Data Grid (full transparency, deep inquiry)
- A/B Comparison (side-by-side analysis)

**Key Principle:** Definition is completely decoupled from Display. Users establish context once, then freely switch between display modes without re-establishing context.

### 2.2 Context Hierarchy

| Layer | Elements | Required | Removable | Display Method |
|-------|----------|----------|-----------|----------------|
| Foundation | Date Range, Entity | Yes | No | Persistent context bar |
| Filters | Category, Promotion, other | No | Yes | Removable chips |

Foundation context answers: "What data universe are we in?"
Filters answer: "What subset are we examining?"

---

## 3. View Specifications

### 3.1 Base View

**Purpose:** Reporting, guided exploration with summaries

**Characteristics:**
- Curated data presentation (KPIs, percentages, light charts)
- Limited rows (Top/Bottom N, default 25)
- Detail panels for deep-dive on selected items
- Drill capability via actions in detail panel
- Entry point to A/B Comparison

**Content Types:**
- Category list (default when no category filter)
- Promotion list (when category filter applied)

**Interaction Pattern:**
- Click row → Opens Detail Panel
- Detail Panel contains actions: [View Promotions], [Compare]
- Chip management for navigation

### 3.2 Data Grid View

**Purpose:** Transparency, deep inquiry, spreadsheet-like experience

**Characteristics:**
- Full dataset visibility (all rows, paginated)
- All columns available
- Advanced filtering (column filters, multi-select)
- Sortable columns
- Row selection with checkboxes
- Export capability (CSV, XLS)
- No detail panel (selection is for export/bulk actions)

**Controls:**
- Filter panel (collapsible)
- Column visibility toggle
- Reset All Filters button

### 3.3 A/B Comparison View

**Purpose:** Side-by-side analysis of two contexts

**Entry Method:** Slide-over panel (slides in from right, covers Base/Data Grid)

**Panel Structure:**
- Panel A: Inherits context from Base/Data Grid
- Panel B: Inherits same context, user modifies to create comparison
- "Inherit from A" button in Panel B for quick reset

**Comparison determined by user action:** User changes one element in Panel B (date, entity, or item) — this defines what's being compared.

**Sub-modes:**
- Summary Comparison: KPIs, heatmaps, trends (entered from Base View)
- Detail Comparison: Side-by-side grids with synced columns (entered from Data Grid)

**Exit Behavior:**
- Panel A context persists back to source view
- Explicit option to adopt Panel B context before exit

### 3.4 Context Persistence

**Principle:** User context persists across all view changes. Switching views should never lose the user's current focus.

**Context Elements:**
| Element | Scope | Persistence |
|---------|-------|-------------|
| Date Range (Week) | Global | Persists across all views and view modes |
| Entity Selection | Global | Persists across all views and view modes |
| Category Selection | Cross-view | Syncs between Categories view and Promotions view |
| Applied Filters | View-specific | Persists within view mode, cleared on mode change |
| Search Query | View-specific | Clears on view change |
| Detail Panel State | View-specific | Closes on view change, re-opens with context |

**View Change Behavior:**

| From → To | Context Behavior |
|-----------|------------------|
| Categories → Promotions | Selected category → pre-filters promotions, highlights sidebar |
| Promotions → Categories | Active category → selects row, opens detail panel |
| Base → Data Grid | All filters preserved, category selection preserved |
| Any → Compare | Current context becomes Panel A starting point |

**Implementation Notes:**
- State variables `activeCategory` and `selectedCategoryId` are synchronized
- Week and Entity selections are global and never reset by view changes
- "View Promotions" from category detail sets both filter state AND switches view

---

## 4. Component Specifications

### 4.1 Context Bar (Global, Persistent)

Always visible across all views. Never hidden or collapsed.

```
┌─────────────────────────────────────────────────────────────────┐
│  FOUNDATION CONTEXT                                             │
│  Date: [Week 47 ▼] Nov 18-24, 2025    Entity: [Store 101 ▼]    │
├─────────────────────────────────────────────────────────────────┤
│  APPLIED FILTERS (only if filters active)                       │
│  [Category: Produce ✕]  [Deal Type: BOGO ✕]  [Clear All]       │
├─────────────────────────────────────────────────────────────────┤
│  VIEW TABS                                                      │
│  [Base View]  [Data Grid]  [⇄ Compare]                         │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Date Range Selector

**Primary Display:** Week number with date range
- Format: "Week 47" with "Nov 18-24, 2025" subtitle

**Selection Method:** Calendar picker (week-based selection)

**Progressive Disclosure:** Expand for additional options
- Quick buttons: 4 Week, Quarter, YTD, Year-over-Year
- Custom range: Start date / End date pickers

**Behavior:** Persists until changed

### 4.3 Entity Selector

**Primary Display:** Current entity name with level indicator

**Selection Method:** Extra-wide modal (960px) using tree table pattern

**Structure (Tabbed):**
| Tab | Purpose |
|-----|---------|
| Nodes | Select from hierarchy using tree table with accordion |
| Groups | Select from saved custom groups or create new |

**Entity Hierarchy:**
```
Brand
├── Sub-Brand Group
├── Sub-brands
│   ├── Store Groups
│   └── Stores
Custom Analytics Group
├── Can contain sub-brands
├── Can contain stores (same or different sub-brands)
```

**Tree Table UI (Nodes Tab):**

| Column | Brand | SubBrand | Store |
|--------|-------|----------|-------|
| Name | Brand name | SubBrand name | Street address |
| Type | Badge: "Brand" (blue) | Badge: "SubBrand" (gray) | Badge: "Store" (green) |
| Title | — | — | Store display name |
| Subdomain | Brand subdomain | SubBrand ID | SubBrand ID |
| Path | — | — | Store number |

**Tree Table Features:**
- Accordion expand/collapse for Brand and SubBrand rows
- Indentation by hierarchy level (0px, 24px, 48px)
- Type badges with color coding (Brand=info blue, SubBrand=gray, Store=success green)
- Search filters across Name, Title fields
- Click row to select entity
- Selected row highlighted with primary color

**Behavior:** Single selection at a time. Selection displays that level and below.

### 4.4 Filter Chips

**Appearance:** Pill-shaped with label and remove (✕) action

**Behavior:**
- Click chip body: Edit filter value
- Click ✕: Remove filter, content updates immediately
- "Clear All" link: Removes all filters

**Chip Row:** Only visible when filters are active. Collapses when empty.

### 4.5 Detail Panel

**Trigger:** Click any row in Base View

**Position:** Right side of content area (content list compresses)

**Close Action:** ✕ button or click outside panel

**Category Detail Panel Contents:**
- Category name
- KPI summary (Percentile, Composite, CIV, CC, ATL)
- Number of promotions
- Donut charts for engagement breakdown
- 7-day performance trend (bar chart)
- Top 5 performing stores (if Sub-brand/Group level)
- Actions: [▶ View Promotions] [⇄ Compare Category]

**Promotion Detail Panel Contents:**
- Promotion card image (3x2)
- Promotion title
- KPI summary (Percentile, Composite, CIV, CC, ATL)
- Donut charts for CIV, CC, ATL breakdown
- 7-day performance trend (bar chart)
- Top 5 performing stores (if Sub-brand/Group level)
- All additional data columns from grid
- Actions: [⇄ Compare Promotion]

### 4.6 A/B Panel Context (Per Panel)

**Display:** Each panel has independent context bar

**Structure:**
```
┌─────────────────────────────────┐
│  Date: [Week 47 ▼]              │
│  Nov 18-24, 2025                │
│  Entity: [Store 101 ▼]          │
│  [Category: Produce ✕]          │
└─────────────────────────────────┘
```

**Panel B Additional Control:** [↓ Inherit from A] button

**Space Management:** Accordion-style collapse available. When collapsed, show summary: `▶ Wk 47 · Store 101 · Produce`

---

## 5. Interaction Patterns

### 5.1 Drill Behavior (Base View)

Context-driven content display:

| Context State | Content Displays |
|---------------|------------------|
| No category filter | Category list |
| Category filter applied | Promotion list (within category) |
| Promotion selected | Promotion list + Detail Panel |

**Drill Flow:**
1. User clicks Category row → Category Detail Panel opens
2. User clicks [View Promotions] → Category chip added, content shows Promotions
3. User clicks Promotion row → Promotion Detail Panel opens
4. User clicks ✕ on Category chip → Returns to Category list

### 5.2 Navigation via Chips

Chips are the primary navigation mechanism for filtering:
- Adding chip = drilling in
- Removing chip = backing out
- No traditional "back button" needed within Base View

### 5.3 View Switching

Tabs switch display mode while preserving context:
- Base View ↔ Data Grid: Instant switch, same data, different presentation
- Compare tab: Slides in A/B panel, inherits context

### 5.4 A/B Comparison Entry/Exit

**Entry:**
- Click [Compare] action in Detail Panel, OR
- Click Compare tab

**During:**
- Panel A locked to inherited context (editable)
- Panel B starts identical, user modifies
- [Swap] exchanges panel positions
- [Print] [Export] [Share] available in toolbar

**Exit:**
- Click "← Back to [Base View / Data Grid]"
- Panel A context returns to source view
- Optional: "Use Panel B context" before exit

---

## 6. URL State Management

Dashboard state encoded in URL for:
- Bookmarking
- Sharing
- Browser back/forward navigation

**URL Structure:**
```
/dashboard?week=47&entity=store-101&view=base&category=produce
```

**Parameters:**
| Parameter | Values | Notes |
|-----------|--------|-------|
| week | Number or range | `47` or `45-47` |
| start / end | ISO dates | For custom date ranges |
| entity | Entity ID | `store-101`, `subbrand-west`, `group-urban` |
| view | `base`, `grid`, `compare` | Current display mode |
| category | Category ID | Filter chip |
| promotion | Promotion ID | Selected item |
| panelB_* | Same params | A/B Panel B overrides |

---

## 7. Print / Export / Share

Available across all views. Toolbar placement: top-right.

| Action | Behavior |
|--------|----------|
| Print | Browser print dialog, formatted for current view |
| Export | CSV or XLS download of current data scope |
| Share | Copy URL with current state to clipboard |

---

## 8. Visual Design Principles

### 8.1 Hierarchy
- Foundation context always visible (top)
- Filter chips secondary (below foundation)
- View tabs tertiary (below filters)
- Content area primary focus (largest area)

### 8.2 Consistency
- Same context bar pattern across Base, Data Grid, A/B panels
- Same chip design throughout
- Same detail panel structure for Category and Promotion

### 8.3 Progressive Disclosure
- Date range: Week primary, expand for duration options
- Entity: Current selection shown, modal for full tree
- Filters: Chips visible, filter panel collapsible in Data Grid

### 8.4 Visual Feedback
- Selected row highlighted
- Active tab distinguished
- Changed values in A/B Panel B subtly highlighted
- Loading states for data fetches

---

## 9. Technical Constraints

### 9.1 Target Stack
- Angular components (production)
- HTML/CSS/JS prototypes (validation)
- eCharts library for visualizations
- Existing Node Mapping UI for entity selection

### 9.2 Responsive Considerations
- Desktop-first (primary use case)
- Tablet: Stacked layout for A/B panels
- Mobile: Deferred (not v1 priority)

---

## 10. Success Criteria

1. User can establish context (date + entity) in under 10 seconds
2. User can drill from Category to Promotion in 2 clicks
3. User can return to previous context via chip removal (1 click)
4. User can initiate comparison without losing current context
5. User can switch between Base and Data Grid without re-filtering
6. URL reflects current state and is shareable

---

## Appendix A: A/B Comparison Matrix

### Circular Performance Comparison
| Variation | Panel A | Panel B | Valid Levels |
|-----------|---------|---------|--------------|
| Date Only | Week 47, Store 101 | Week 46, Store 101 | All |
| Entity Only | Week 47, Store 101 | Week 47, Store 102 | Store, Group |
| Date + Entity | Week 47, Store 101 | Week 46, Store 102 | All |

### Category Performance Comparison
| Variation | Panel A | Panel B | Valid Levels |
|-----------|---------|---------|--------------|
| Date Only | Produce, Wk 47, Store 101 | Produce, Wk 46, Store 101 | All |
| Entity Only | Produce, Wk 47, Store 101 | Produce, Wk 47, Store 102 | Store, Group |
| Item Only | Produce, Wk 47, Store 101 | Meat, Wk 47, Store 101 | All |

### Promotion Performance Comparison
| Variation | Panel A | Panel B | Valid Levels |
|-----------|---------|---------|--------------|
| Entity Only | Promo #123, Store 101 | Promo #123, Store 102 | Store, Group |
| Date Only | Promo #123, Wk 47 | Promo #123, Wk 42 | All |
| Item Only | Promo #123, Store 101 | Promo #456, Store 101 | All |

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| Foundation Context | Required context (Date + Entity) that cannot be removed |
| Applied Filters | Optional context (Category, etc.) shown as removable chips |
| Detail Panel | Right-side panel showing full details of selected item |
| Drill | Navigate deeper into data hierarchy via filter addition |
| Chip | Pill-shaped UI element representing an applied filter |
| Entity | Any level in hierarchy: Brand, Sub-brand, Store, or Custom Group |

---

*Document Version: 1.2*
*Last Updated: 2025-11-30*
*Status: Ready for Prototype Development*

**Change Log:**
- v1.2 (2025-11-30): Added Section 3.4 Context Persistence - view change behavior and state management
- v1.1 (2025-11-30): Updated Section 4.3 Entity Selector with tree table UI specification
