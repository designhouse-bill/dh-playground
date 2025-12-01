# Analytics Dashboard UI Architecture

## Progressive Disclosure Model

### Hierarchy
```
Level 0: All Circulars (default)
    ↓ Click category
Level 1: Category (filtered)
    ↓ Click promotion
Level 2: Promotion Detail (future)
```

### What Changes At Each Level

| Element | Level 0 (All Circulars) | Level 1 (Category) |
|---------|------------------------|-------------------|
| **Breadcrumb** | "All Circulars" | "All Circulars › Category Name" |
| **Page Title** | "All Circulars Performance" | "Category Name Performance" |
| **Main List** | Categories (8 items) | Promotions in category |
| **KPIs** | All promotions metrics | Filtered to category |
| **Filter Chips** | Empty/hidden | Shows "Category: Name" chip |

---

## UI Components

### 1. Breadcrumb Navigation
Shows the current drill path. Always starts with "All Circulars".

```html
<nav class="breadcrumb" id="context-breadcrumb">
  <span class="breadcrumb__item">
    <a href="#" class="breadcrumb__link">All Circulars</a>
  </span>
  <span class="breadcrumb__separator">›</span>
  <span class="breadcrumb__item">
    <span class="breadcrumb__current">Featured Deals</span>
  </span>
</nav>
```

**Behavior:**
- Click any parent level to navigate back
- Current level is not clickable

### 2. Filter Chips
Visual representation of applied filters. Appears in filter row when filters exist.

```html
<div class="filter-chip filter-chip--category">
  <span class="filter-chip__label">Category:</span>
  <span class="filter-chip__value">Featured Deals</span>
  <button class="filter-chip__remove">×</button>
</div>
```

**Chip Types:**
- `filter-chip--category` - Green (category filter)
- `filter-chip--entity` - Purple (entity filter)
- `filter-chip--date` - Gray (date filter)
- Default - Blue (other filters)

**Behavior:**
- Click × to remove individual filter
- Removing filter navigates back one level

### 3. Clear All Button
Resets all filters and returns to Level 0.

```html
<button class="clear-filters" id="clear-all-filters">
  <svg class="clear-filters__icon">...</svg>
  Clear All
</button>
```

**Behavior:**
- Only visible when filters are applied
- Clears all chips and resets view

### 4. Filter Row
Container for filter chips. Hidden when empty.

```html
<div class="filter-row filter-row--empty" id="filter-row">
  <div class="filter-row__chips" id="filter-chips-container">
    <!-- Chips appear here -->
  </div>
  <div class="filter-row__actions">
    <button class="clear-filters">Clear All</button>
  </div>
</div>
```

**Behavior:**
- Has class `filter-row--empty` when no filters
- Becomes visible when filters are added

### 5. Drill Actions
Appear on hover to indicate clickable rows.

```html
<div class="data-list-item__action">
  <button class="drill-action">
    <span>View</span>
    <svg>→</svg>
  </button>
</div>
```

---

## Foundation Context (Always Visible)

These selectors appear in the context bar and persist across all views:

| Selector | Purpose |
|----------|---------|
| **Date Range** | Week selection (e.g., "Week 47, Nov 18-24") |
| **Entity** | Scope selection (e.g., "All Stores (67)") |

---

## Files Structure

```
shared/
├── context-system.css    # Styles for chips, breadcrumbs, clear button
├── context-system.js     # Optional: Reusable state management
├── design-tokens.css     # Color variables for chip styling
└── base.css             # Base component styles

v2-card-modern/
├── index.html           # Complete implementation example
├── styles.css           # Version-specific styles + data list
└── app.js              # Progressive disclosure logic
```

---

## How To Use In Other Versions

### 1. Add CSS imports
```html
<link rel="stylesheet" href="../shared/context-system.css">
```

### 2. Add HTML structure
```html
<!-- In context bar -->
<nav class="breadcrumb" id="context-breadcrumb">...</nav>

<!-- Below context bar -->
<div class="filter-row filter-row--empty" id="filter-row">
  <div class="filter-row__chips" id="filter-chips-container"></div>
  <div class="filter-row__actions">
    <button class="clear-filters" id="clear-all-filters">Clear All</button>
  </div>
</div>
```

### 3. Implement JS logic
```javascript
// Track state
let currentLevel = 0;
let currentCategory = null;

// Drill down
function drillToCategory(id, name) {
  currentLevel = 1;
  currentCategory = { id, name };
  renderBreadcrumb();
  addFilterChip('category', id, name);
  // Update content...
}

// Navigate back
function navigateToAllCirculars() {
  currentLevel = 0;
  currentCategory = null;
  renderBreadcrumb();
  clearAllFilters();
  // Update content...
}
```

---

## Design Decisions Summary

| Decision | Rationale |
|----------|-----------|
| **Breadcrumb in context bar** | Always visible, clear location indicator |
| **Filter chips in separate row** | Collapsible when empty, scannable when present |
| **Chips are removable** | User can back out without using breadcrumb |
| **Clear All separate from chips** | Explicit destructive action, always visible |
| **Drill action on hover** | Clean UI, reveals affordance when needed |
| **KPIs update with filters** | Shows impact of drill-down immediately |
| **Title changes with context** | Reinforces current view level |
