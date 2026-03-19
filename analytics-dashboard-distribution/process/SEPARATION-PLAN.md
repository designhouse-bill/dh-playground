# Analytics Dashboard - Multi-HTML Architecture Plan

## Current State

**Single File Architecture:**
- `index.html` (~520 lines) contains all 3 view modes
- Views toggled via `display: none` in JavaScript
- All JavaScript in single `app.js` (~1700 lines)
- Shared: header, modals, CSS

## Proposed Architecture

```
analytics-dashboard/
├── index.html              → Categories view (default landing)
├── promotions.html         → Promotions view
├── grid.html               → Grid/Deep Inquiry view
├── compare.html            → Compare view (future)
│
├── shared/
│   ├── header.js           → Dynamic header component
│   ├── modals.js           → Modal components
│   ├── state-manager.js    → Cross-page state (sessionStorage)
│   ├── mock-data.js        → (existing)
│   ├── promotion-records-data.js → (existing)
│   ├── design-tokens.css   → (existing)
│   └── base.css            → (existing)
│
├── js/
│   ├── app-core.js         → Shared utilities, formatters, helpers
│   ├── categories.js       → Categories-specific logic
│   ├── promotions.js       → Promotions-specific logic
│   ├── grid.js             → Grid-specific logic
│   └── compare.js          → Compare-specific logic (future)
│
├── styles.css              → Keep unified (or split later)
├── cache-manager.js        → (existing)
└── data-service.js         → (existing)
```

## State Management Strategy

### Cross-Page State (sessionStorage)

```javascript
// shared/state-manager.js
const StateManager = {
  // Persist across page navigation
  get: (key) => JSON.parse(sessionStorage.getItem(`analytics_${key}`)),
  set: (key, value) => sessionStorage.setItem(`analytics_${key}`, JSON.stringify(value)),

  // State keys
  KEYS: {
    DATE_RANGE: 'dateRange',      // { week: 47, startDate, endDate }
    ENTITY: 'entity',             // { type, id, name, count }
    FILTERS: 'filters',           // [{ type, value }]
    SELECTED_CATEGORY: 'selectedCategory',
    SELECTED_PROMOTION: 'selectedPromotion'
  }
};
```

### URL Parameters (Deep Linking)

```
promotions.html?category=bakery&promo=123
grid.html?filters=category:bakery,deal:bogo
```

## Migration Order

### Phase 1: Extract Grid Mode (Safest First)
**Why:** Most isolated, no panel interactions, simplest dependencies

1. Create `grid.html` with:
   - Header (copy)
   - Grid layout section only
   - Required modals (date picker, entity selector, filter)

2. Create `js/grid.js`:
   - Extract grid-specific functions from app.js
   - `initGrid()`, `renderGridTable()`, `gridPagination()`, etc.

3. Update navigation:
   - GRID button → `window.location.href = 'grid.html'`
   - Update grid.html nav to link back

4. Test thoroughly before proceeding

### Phase 2: Extract Promotions View

1. Create `promotions.html` with:
   - Header
   - Three-column layout (left panel hidden via CSS)
   - Center panel (promotions table/cards)
   - Right panel (detail with footer)
   - Required modals

2. Create `js/promotions.js`:
   - `renderPromotionTable()`, `renderPromotionCards()`
   - `renderDetail()`, `renderInteractionRateChart()`, `renderTrendChart()`
   - Detail panel open/close logic

3. State sync:
   - Save selected promotion to sessionStorage
   - Read category filter from URL or sessionStorage

### Phase 3: Refactor Categories (Keep as index.html)

1. Rename current index.html handling to categories-only
2. Remove promotions and grid sections
3. Clean up app.js → rename to categories.js
4. Extract truly shared code to app-core.js

### Phase 4: Add Compare Mode (Future)
- Create `compare.html` with fresh structure
- Implement side-by-side comparison UI

## Shared Header Component

```javascript
// shared/header.js
function loadHeader() {
  const headerHTML = `
    <header class="header">
      <div class="topbar">...</div>
      <div class="context-row">...</div>
    </header>
  `;
  document.getElementById('header-container').innerHTML = headerHTML;
  initHeaderEvents();
}

function initHeaderEvents() {
  // Date selector, entity selector, filters
  // Navigation buttons with page links
}
```

Each page includes:
```html
<div id="header-container"></div>
<script src="./shared/header.js"></script>
<script>loadHeader();</script>
```

## Navigation Updates

### Current (JavaScript toggle):
```javascript
// Shows/hides layouts
state.viewMode = 'promotions';
elements.categoriesLayout.style.display = 'none';
elements.promotionsLayout.style.display = 'flex';
```

### New (Page navigation):
```javascript
// In header.js
document.querySelectorAll('.mode-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const mode = btn.dataset.mode;
    const pages = {
      'base': 'index.html',      // categories default
      'grid': 'grid.html',
      'compare': 'compare.html'
    };

    // Save current state before navigating
    StateManager.set('filters', currentFilters);
    StateManager.set('dateRange', currentDateRange);

    window.location.href = pages[mode];
  });
});

// Subtabs (Categories/Promotions)
document.querySelectorAll('.subtab').forEach(btn => {
  btn.addEventListener('click', () => {
    const view = btn.dataset.view;
    if (view === 'promotions') {
      window.location.href = 'promotions.html';
    } else {
      window.location.href = 'index.html';
    }
  });
});
```

## JavaScript Splitting

### app-core.js (Shared)
```javascript
// Utilities
function formatNumber(num) { ... }
function escapeHtml(str) { ... }
function getPercentileBadgeHTML(percentile) { ... }

// Data service initialization
function initDataService() { ... }

// Common event handlers
function openDatePicker() { ... }
function openEntitySelector() { ... }
function openFilterModal() { ... }
```

### categories.js
```javascript
// Category-specific
function renderCategoryGrid() { ... }
function handleCategorySelection() { ... }
function renderCategoryDetail() { ... }
```

### promotions.js
```javascript
// Promotion-specific
function renderPromotionTable() { ... }
function renderPromotionCards() { ... }
function renderDetail(promo) { ... }
function renderInteractionRateChart() { ... }
function renderTrendChart() { ... }
```

### grid.js
```javascript
// Grid-specific
function initGridMode() { ... }
function renderGridTable() { ... }
function gridPagination() { ... }
function handleColumnVisibility() { ... }
```

## File Size Estimates (Post-Split)

| File | Current | After Split |
|------|---------|-------------|
| index.html | 520 lines | ~200 lines |
| promotions.html | - | ~180 lines |
| grid.html | - | ~120 lines |
| app.js | 1700 lines | - |
| app-core.js | - | ~400 lines |
| categories.js | - | ~500 lines |
| promotions.js | - | ~600 lines |
| grid.js | - | ~400 lines |

## Testing Checklist

### Per Phase
- [ ] Page loads without errors
- [ ] State persists across navigation
- [ ] Date range selector works
- [ ] Entity selector works
- [ ] Filters persist
- [ ] Back/forward browser navigation works
- [ ] Deep links work (URL params)
- [ ] Mobile responsive behavior maintained

### Integration
- [ ] Navigate Categories → Promotions → Grid → back
- [ ] Filters applied in one view carry to others
- [ ] Selected entity persists
- [ ] Charts render correctly in each view

## Rollback Strategy

Keep `index-legacy.html` as backup during migration:
1. Copy current index.html to index-legacy.html
2. If issues arise, revert by renaming files
3. Remove legacy file after full testing

## Timeline Estimate

| Phase | Effort | Risk |
|-------|--------|------|
| Phase 1: Grid | 1-2 hours | Low |
| Phase 2: Promotions | 2-3 hours | Medium |
| Phase 3: Categories cleanup | 1 hour | Low |
| Testing & fixes | 1-2 hours | - |
| **Total** | **5-8 hours** | - |

## Ready to Begin?

Start with **Phase 1: Extract Grid Mode** when ready.
Command: "Begin Phase 1 - Extract Grid"
