# Compare Mode Architecture

> Technical documentation for the A/B Comparison feature in Analytics Dashboard.
> Last updated: December 3, 2025

---

## Overview

Compare Mode enables side-by-side A/B comparison of analytics data across different contexts (weeks, entities, categories, promotions). Users can compare the same layer of data with different parameters to identify performance differences.

---

## Core Concepts

### Layers
Compare Mode operates on three hierarchical layers:

| Layer | Description | Required Context |
|-------|-------------|------------------|
| `circulars` | Entity-level aggregate metrics | Week + Entity |
| `categories` | Category-level metrics | Week + Entity + Category |
| `promotions` | Promotion-level metrics | Week + Entity + Category + Promotion |

### Context Structure
Each context (A and B) contains:

```javascript
{
  weekId: string,       // e.g., "week-48"
  weekLabel: string,    // e.g., "Week 48"
  weekRange: string,    // e.g., "Nov 25 - Dec 1, 2025"
  entityId: string,     // e.g., "all", "brand-safeway", "store-101"
  entityName: string,   // e.g., "All Stores", "Safeway"
  entityLevel: string,  // "all" | "brand" | "sub-brand" | "store"
  entityCount: number,  // Number of stores in selection
  categoryId: string,   // e.g., "bakery" (lowercase-hyphenated)
  categoryName: string, // e.g., "Bakery" (original case)
  promotionId: string,  // e.g., "promo-101-44-1"
  promotionName: string // e.g., "Fresh Baked Bread"
}
```

---

## Data Flow

### MockData API Integration

Compare Mode uses these MockData functions to get context-specific data:

```javascript
// 1. Extract week number from weekId
const weekNum = parseInt(ctx.weekId.replace('week-', ''), 10);

// 2. Get filtered records for the context
const records = MockData.getRecords(weekNum, ctx.entityId, ctx.entityLevel);

// 3. Aggregate as needed
const categories = MockData.aggregateByCategory(records);
const promotions = MockData.getUniquePromotions(records);
```

### Key MockData Functions

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `getRecords` | `weekNum, entityId, entityLevel` | `Array<Record>` | Raw promotion records filtered by week and entity |
| `aggregateByCategory` | `records` | `Array<Category>` | Categories with aggregated CIV/CC/ATL metrics |
| `getUniquePromotions` | `records` | `Array<Promotion>` | Deduplicated promotions with aggregated metrics |

### Data Models

#### Record (Raw)
```javascript
{
  storeId: string,
  weekNum: number,
  promotionId: string,
  category: string,      // Original case, e.g., "Bakery"
  title: string,
  dealType: string,
  originalPrice: number,
  salePrice: number,
  civ: number,           // Views (Card in View)
  cc: number,            // Clicks (Card Clicked)
  atl: number            // Added (Add to List)
}
```

#### Category (Aggregated)
```javascript
{
  id: string,            // Lowercase-hyphenated, e.g., "bakery"
  name: string,          // Original case, e.g., "Bakery"
  promotionCount: number,
  civ: number,           // Views
  cc: number,            // Clicks
  atl: number,           // Added
  compositeScore: number,
  percentile: number
}
```

#### Promotion (Aggregated)
```javascript
{
  id: string,
  name: string,
  category: string,      // Lowercase-hyphenated from getUniquePromotions
  categoryName: string,  // Original case
  dealType: string,
  cardSize: string,
  originalPrice: number,
  salePrice: number,
  civ: number,           // Views
  cc: number,            // Clicks
  atl: number,           // Added
  compositeScore: number,
  percentile: number,
  storeCount: number
}
```

### Metric Labels

| Internal Field | Display Label | Description |
|----------------|---------------|-------------|
| `civ` | Views | Card in View - number of times the item was viewed |
| `cc` | Clicks | Card Clicked - number of times the item was clicked |
| `atl` | Added | Add to List - number of times item was added to list |

---

## Compare Page Functions

### Initialization

| Function | Description |
|----------|-------------|
| `init()` | Initialize page, restore state, bind events |
| `restoreCompareState()` | Restore layer and contexts from saved state |
| `bindEvents()` | Attach event listeners for modals and navigation |

### Layer Management

| Function | Parameters | Description |
|----------|------------|-------------|
| `selectLayer(layer)` | `'circulars' \| 'categories' \| 'promotions'` | Switch comparison layer |
| `updateLayerTabs()` | - | Update tab active states |
| `updateLayerVisibility()` | - | Show/hide category/promotion selectors |

### Context Selection

| Function | Parameters | Description |
|----------|------------|-------------|
| `openDatePicker(target)` | `'A' \| 'B'` | Open week selection modal |
| `openEntityPicker(target)` | `'A' \| 'B'` | Open entity selection modal |
| `openCategoryPicker(target)` | `'A' \| 'B'` | Open category picker modal |
| `openPromotionPicker(target)` | `'A' \| 'B'` | Open promotion picker modal |
| `handleDateSelected(event)` | `CustomEvent` | Process date modal selection |
| `handleEntitySelected(event)` | `CustomEvent` | Process entity modal selection |
| `applyCategorySelection()` | - | Apply selected category to context |
| `applyPromotionSelection()` | - | Apply selected promotion to context |

### Copy Functions

| Function | Description |
|----------|-------------|
| `copyAtoB()` | Copy Context A values to Context B |
| `copyBtoA()` | Copy Context B values to Context A |

### Data Loading

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `loadAndRenderComparison()` | - | `Promise` | Load both contexts and render |
| `loadContextData(target)` | `'A' \| 'B'` | `Object` | Load data for one context |
| `getCircularData(ctx)` | context object | metrics object | Get entity-level aggregates |
| `getCategoryData(ctx)` | context object | metrics object | Get category metrics |
| `getPromotionData(ctx)` | context object | metrics object | Get promotion metrics |

### Rendering

| Function | Description |
|----------|-------------|
| `renderComparison()` | Main render dispatcher |
| `renderCircularComparison()` | Render entity comparison view |
| `renderCategoryComparison()` | Render category comparison view |
| `renderPromotionComparison()` | Render promotion comparison view |
| `renderContextSummary(label, ctx)` | Render context header |
| `renderMetricRow(label, value)` | Render single metric row |
| `renderMetricRowWithVariance(label, value, valueA, valueB)` | Render metric with variance |
| `renderVarianceIndicator(variance)` | Render up/down/equal indicator |

### Variance Calculation

```javascript
function calculateVariance(valueA, valueB) {
  if (valueA === valueB) {
    return { direction: 'equal', percent: 0 };
  }
  if (valueA === 0) {
    return { direction: valueB > 0 ? 'up' : 'down', percent: 100 };
  }
  const percent = ((valueB - valueA) / Math.abs(valueA)) * 100;
  return {
    direction: percent > 0 ? 'up' : 'down',
    percent: Math.abs(percent).toFixed(1)
  };
}
```

---

## State Management

### State Persistence

Compare state is saved to:
1. **localStorage** via `state.compareMode`
2. **URL parameters** for shareable links

### URL Parameters

| Parameter | Example | Description |
|-----------|---------|-------------|
| `layer` | `categories` | Current comparison layer |
| `a_week` | `week-48` | Context A week ID |
| `a_entity` | `brand-safeway` | Context A entity ID |
| `a_category` | `bakery` | Context A category ID |
| `a_promotion` | `promo-101-44-1` | Context A promotion ID |
| `b_week` | `week-47` | Context B week ID |
| `b_entity` | `brand-vons` | Context B entity ID |
| `b_category` | `bakery` | Context B category ID |
| `b_promotion` | `promo-201-47-5` | Context B promotion ID |

### State Shape

```javascript
state.compareMode = {
  layer: 'circulars' | 'categories' | 'promotions',
  contextA: { /* context object */ },
  contextB: { /* context object */ }
}
```

---

## Custom Events

Compare Mode uses custom events to communicate with shared modals:

| Event | Detail Properties | Description |
|-------|-------------------|-------------|
| `compare:dateSelected` | `target, weekId, weekLabel, weekRange` | Week selected in modal |
| `compare:entitySelected` | `target, entityId, entityName, entityLevel, entityCount` | Entity selected in modal |

---

## CSS Classes

### Layout Classes

| Class | Description |
|-------|-------------|
| `.compare-layer-tabs` | Layer selector tab bar |
| `.compare-context-bar` | Dual context selection bar |
| `.context-column` | Individual context column (A or B) |
| `.context-column--a` | Context A styling |
| `.context-column--b` | Context B styling |
| `.context-label` | A/B label badge |
| `.context-selectors` | Button container for context |
| `.context-btn` | Context selection button |
| `.copy-context-btn` | Copy A↔B button |

### Results Classes

| Class | Description |
|-------|-------------|
| `.compare-results-container` | Scrollable results area |
| `.compare-grid` | Results grid container |
| `.compare-row` | Side-by-side row |
| `.compare-cell` | Individual cell (A or B) |
| `.compare-section-header` | Section header with icon |

### Metric Classes

| Class | Description |
|-------|-------------|
| `.metric-rows` | Metric list container |
| `.metric-row` | Single metric row |
| `.metric-row__label` | Metric label |
| `.metric-row__value` | Metric value with variance |
| `.score-display` | Large score display |

### Variance Classes

| Class | Description |
|-------|-------------|
| `.variance` | Base variance indicator |
| `.variance--up` | Positive variance (green) |
| `.variance--down` | Negative variance (red) |
| `.variance--equal` | No change (gray) |
| `.variance--different` | Text difference indicator |

---

## Angular Migration Notes

### Component Structure

```
compare/
├── compare.component.ts          # Main container
├── compare.component.html
├── compare.component.scss
├── components/
│   ├── layer-tabs/              # Layer selector
│   ├── context-bar/             # Dual context bar
│   ├── context-selector/        # Individual context column
│   ├── comparison-grid/         # Results grid
│   ├── metric-row/              # Single metric display
│   └── variance-indicator/      # Up/down/equal badge
├── services/
│   └── compare.service.ts       # Data loading and state
└── models/
    ├── compare-context.model.ts
    ├── compare-layer.type.ts
    └── variance.model.ts
```

### Service Methods

```typescript
interface CompareService {
  // State
  currentLayer$: Observable<CompareLayer>;
  contextA$: Observable<CompareContext>;
  contextB$: Observable<CompareContext>;

  // Actions
  setLayer(layer: CompareLayer): void;
  setContext(target: 'A' | 'B', context: Partial<CompareContext>): void;
  copyContext(from: 'A' | 'B', to: 'A' | 'B'): void;

  // Data
  getCircularData(ctx: CompareContext): Observable<CircularMetrics>;
  getCategoryData(ctx: CompareContext): Observable<CategoryMetrics>;
  getPromotionData(ctx: CompareContext): Observable<PromotionMetrics>;

  // Variance
  calculateVariance(valueA: number, valueB: number): Variance;
}
```

### Type Definitions

```typescript
type CompareLayer = 'circulars' | 'categories' | 'promotions';

interface CompareContext {
  weekId: string | null;
  weekLabel: string;
  weekRange: string;
  entityId: string | null;
  entityName: string;
  entityLevel: 'all' | 'brand' | 'sub-brand' | 'store';
  entityCount: number;
  categoryId: string | null;
  categoryName: string;
  promotionId: string | null;
  promotionName: string;
}

interface Variance {
  direction: 'up' | 'down' | 'equal';
  percent: number;
}
```

---

## File References

| File | Purpose |
|------|---------|
| `compare.html` | Page template with modals |
| `js/compare.js` | Page-specific logic |
| `js/shared-core.js` | Compare state in global state |
| `js/state-manager.js` | State persistence and URL params |
| `js/shared-modals.js` | Date/entity modal A/B support |
| `shared/mock-data.js` | Data API |
| `styles.css` | Compare mode styles (lines 4650-4950) |
