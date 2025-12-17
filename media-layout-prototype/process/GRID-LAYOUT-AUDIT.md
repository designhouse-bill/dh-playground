# Production Grid Layout Audit

This document contains findings from auditing the DigitalCircular2 production grid layout system. These findings inform template design decisions for the media layout prototype.

## Source Files Analyzed

- `src/app/circulars/cards/circular-card-list/circular-card-list.component.scss`
- `src/app/circulars/cards/circular-card-list/circular-card-list.component.html`
- `src/styles/components/_circular-card.scss`
- `node_modules/@thedesignhouse/design-system/tokens/variables.scss`

---

## Grid Structure

### Container Setup

```scss
:host {
  container-name: card-grid;
  container-type: inline-size;
  display: flex;
  flex-direction: column;
  gap: token.$card-grid-gap;  // 8px desktop, 4px mobile
}
```

### Grid Definition

```scss
.circular-card-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);  // ALWAYS 3 columns
  gap: token.$card-grid-gap;

  @include supports.container-query-units {
    grid-auto-rows: minmax(33.33333cqw, auto);  // 1/3 container width
  }
}
```

**Key Insight**: The grid is ALWAYS 3 columns. Cards span 1, 2, or 3 columns but the underlying grid never changes.

---

## Design System Tokens

From `@thedesignhouse/design-system/tokens/variables.scss`:

| Token | Value | Description |
|-------|-------|-------------|
| `$card-grid-gap` | 8px (`$space-xs`) | Desktop gap between cards |
| `$card-grid-gap-mobile` | 4px (`$space-2xs`) | Mobile gap between cards |
| `$space-xs` | 8px | Base XS spacing |
| `$space-2xs` | 4px | Base 2XS spacing |

---

## Card Size Classes

Cards use the `size-XY` naming convention where:
- **X** = number of columns to span (1-3)
- **Y** = number of rows to span (1-15)

### Standard Sizes

| Class | Columns | Rows | Aspect Ratio | Common Use |
|-------|---------|------|--------------|------------|
| `size-11` | 1 | 1 | 1:1 (square) | Standard product card |
| `size-21` | 2 | 1 | 2:1 | Featured product |
| `size-22` | 2 | 2 | 1:1 (square) | Hero card |
| `size-31` | 3 | 1 | 3:1 | Full-width banner |
| `size-32` | 3 | 2 | 3:2 | Large hero |
| `size-33` | 3 | 3 | 1:1 (square) | Full-width feature |

### Extended Row Sizes

For very tall content, sizes extend up to 15 rows:
- `size-34`, `size-35`, ... `size-315`
- `size-14`, `size-15`, ... `size-115`

### CSS Implementation

```scss
.circular-card {
  &.size-11 { grid-column-end: span 1; grid-row-end: span 1; }
  &.size-21 { grid-column-end: span 2; }  // rows default to 1
  &.size-22 { grid-column-end: span 2; grid-row-end: span 2; }
  &.size-31 { grid-column-end: span 3; }
  &.size-32 { grid-column-end: span 3; grid-row-end: span 2; }
  &.size-33 { grid-column-end: span 3; grid-row-end: span 3; }
}
```

---

## Responsive Behavior

### What is STATIC

1. **3-column grid structure** - Never changes
2. **Card span ratios** - A `size-22` always spans 2 cols x 2 rows
3. **Aspect ratio maintenance** - Cards maintain proportions at all sizes
4. **Gap ratio** - Desktop (8px) is always 2x mobile (4px)

### What is RESPONSIVE

1. **Container width** - Fills available space in viewport
2. **Row/cell height** - Calculated as `33.333cqw` (1/3 of container width)
3. **Gap values** - 8px desktop, 4px mobile (breakpoint: 768px)
4. **Cell dimensions** - Scale proportionally with container

### Breakpoints

| Breakpoint | Trigger | Changes |
|------------|---------|---------|
| `md` (768px) | Below this | Gap reduces to 4px |
| `1024px` | Max-width media query | Fallback row height calculation |

### Container Query Fallbacks

For browsers without container query support:

```scss
@include supports.container-query-units($supported: false) {
  grid-auto-rows: minmax(14rem, auto);  // Fixed fallback

  @media screen and (max-width: 1024px) {
    grid-auto-rows: minmax(calc(33.333vw - (#{token.$card-grid-gap-mobile} / 2)), auto);
  }
}
```

---

## Aspect Ratio Calculation

Because row height equals 1/3 of container width (which equals column width in a 3-column grid):

| Card Size | Width | Height | Aspect Ratio |
|-----------|-------|--------|--------------|
| 1x1 | 1 col | 1 row | 1:1 (square) |
| 2x1 | 2 cols | 1 row | 2:1 |
| 2x2 | 2 cols | 2 rows | 1:1 (square) |
| 3x1 | 3 cols | 1 row | 3:1 |
| 3x2 | 3 cols | 2 rows | 3:2 |
| 3x3 | 3 cols | 3 rows | 1:1 (square) |

---

## Template Design Recommendations

### 1. Maintain 3-Column Grid Constraint

Templates must work within a 3-column grid. Hero areas inside cards can use their own internal grid/flexbox, but the card itself will always span 1, 2, or 3 columns.

### 2. Use Grid Spans for Card Sizing

Follow the existing `size-XY` pattern. Template definitions should specify:
- Column span (1-3)
- Row span (1-15)

### 3. Use CSS Grid with `fr` Units Inside Hero Area

For multi-image layouts within a hero card, use CSS Grid:

```css
.hero-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);  /* For 2-column layout */
  grid-template-rows: repeat(2, 1fr);     /* For 2-row layout */
  gap: 4px;  /* Match mobile gap or smaller */
}
```

### 4. Test at Key Widths

| Width | Description |
|-------|-------------|
| 375px | iPhone SE / small mobile |
| 414px | iPhone Plus / medium mobile |
| 768px | Tablet / iPad portrait |
| 1024px | Tablet landscape / small desktop |
| 1440px | Standard desktop |

### 5. Gap Consistency

- Use 4px gaps inside hero cards (matches mobile outer gap)
- Or use no gaps for seamless image layouts
- Avoid gaps larger than 8px

### 6. Image Sizing Strategies

For images inside hero areas:
- **Cover**: Fill entire cell, crop as needed (`object-fit: cover`)
- **Contain**: Show entire image, letterbox if needed (`object-fit: contain`)
- **Custom**: Allow position/scale adjustments

---

## Promotion Card Structure

From the HTML template, promotion cards use:

```html
<app-circular-promotion class="promotion-host">
  <!-- Internal grid with subgrid -->
</app-circular-promotion>
```

```scss
app-circular-promotion.promotion-host {
  display: grid;
  grid-template-rows: subgrid;
  grid-template-columns: 1fr;
  grid-template-areas:
    "header"
    "hero"
    "description";
  grid-row-end: span 3;
  grid-column-end: span 3;
}
```

**Key Insight**: Promotions use CSS Subgrid to align with the parent grid while having their own internal layout areas (header, hero, description).

---

## Summary

| Aspect | Production Behavior |
|--------|---------------------|
| Grid columns | Always 3 |
| Card sizing | `size-XY` classes (X cols, Y rows) |
| Row height | 33.333cqw (container query units) |
| Desktop gap | 8px |
| Mobile gap | 4px |
| Mobile breakpoint | 768px |
| Aspect ratios | Maintained via equal row/column sizing |
| Internal layouts | Subgrid for complex cards |

Templates must respect these constraints to render correctly across all screen sizes.
