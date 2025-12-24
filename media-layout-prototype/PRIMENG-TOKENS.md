# PrimeNG Design Tokens Reference

Standardized design tokens for use in prototypes and production Angular apps.

**Primary Color:** `#2196F3` (blue)
**Theme:** Aura

---

## CSS Custom Properties

Use these in HTML prototypes (include via `primeng-overrides.css`):

```css
:root {
  /* ============================================
     PRIMARY COLORS (STANDARDIZED)
     ============================================ */
  --p-primary-color: #2196F3;
  --p-primary-color-hover: #1976D2;
  --p-primary-color-active: #1565C0;
  --p-primary-color-text: #ffffff;
  --p-primary-50: #E3F2FD;
  --p-primary-100: #BBDEFB;
  --p-primary-200: #90CAF9;
  --p-primary-300: #64B5F6;
  --p-primary-400: #42A5F5;
  --p-primary-500: #2196F3;
  --p-primary-600: #1E88E5;
  --p-primary-700: #1976D2;
  --p-primary-800: #1565C0;
  --p-primary-900: #0D47A1;

  /* ============================================
     SURFACE COLORS
     ============================================ */
  --p-surface-ground: #f8f9fa;       /* Page background */
  --p-surface-section: #ffffff;      /* Section background */
  --p-surface-card: #ffffff;         /* Card background */
  --p-surface-overlay: #ffffff;      /* Modal/overlay background */
  --p-surface-border: #e5e7eb;       /* Borders */
  --p-surface-hover: #f3f4f6;        /* Hover states */

  /* Dark surfaces (for dark sidebars) */
  --p-surface-dark: #1e1e1e;
  --p-surface-dark-hover: #2d2d2d;
  --p-surface-dark-active: #3d3d3d;
  --p-surface-dark-border: #404040;
  --p-surface-dark-text: #e0e0e0;
  --p-surface-dark-text-muted: #9ca3af;

  /* ============================================
     TEXT COLORS
     ============================================ */
  --p-text-color: #1f2937;           /* Primary text */
  --p-text-color-secondary: #6b7280; /* Secondary text */
  --p-text-color-muted: #9ca3af;     /* Muted/disabled */

  /* ============================================
     STATUS COLORS
     ============================================ */
  /* Success */
  --p-green-50: #f0fdf4;
  --p-green-100: #dcfce7;
  --p-green-500: #22c55e;
  --p-green-600: #16a34a;
  --p-green-700: #15803d;

  /* Error / Danger */
  --p-red-50: #fef2f2;
  --p-red-100: #fee2e2;
  --p-red-500: #ef4444;
  --p-red-600: #dc2626;
  --p-red-700: #b91c1c;

  /* Warning */
  --p-yellow-50: #fefce8;
  --p-yellow-100: #fef9c3;
  --p-yellow-500: #eab308;
  --p-yellow-600: #ca8a04;
  --p-yellow-700: #a16207;

  /* Info */
  --p-blue-50: #eff6ff;
  --p-blue-100: #dbeafe;
  --p-blue-500: #3B82F6;
  --p-blue-600: #2563eb;
  --p-blue-700: #1d4ed8;

  /* ============================================
     SPACING (PrimeFlex Aligned)
     ============================================ */
  --p-spacing-0: 0;
  --p-spacing-1: 0.25rem;   /* 4px */
  --p-spacing-2: 0.5rem;    /* 8px */
  --p-spacing-3: 0.75rem;   /* 12px */
  --p-spacing-4: 1rem;      /* 16px */
  --p-spacing-5: 1.25rem;   /* 20px */
  --p-spacing-6: 1.5rem;    /* 24px */
  --p-spacing-7: 1.75rem;   /* 28px */
  --p-spacing-8: 2rem;      /* 32px */

  /* ============================================
     BORDER RADIUS
     ============================================ */
  --p-border-radius-none: 0;
  --p-border-radius-sm: 4px;
  --p-border-radius: 6px;          /* Default */
  --p-border-radius-md: 8px;
  --p-border-radius-lg: 12px;
  --p-border-radius-xl: 16px;
  --p-border-radius-full: 9999px;  /* Pill/circle */

  /* ============================================
     SHADOWS
     ============================================ */
  --p-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --p-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
  --p-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --p-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --p-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);

  /* ============================================
     TRANSITIONS
     ============================================ */
  --p-transition-fast: 150ms ease;
  --p-transition-base: 200ms ease;
  --p-transition-slow: 300ms ease;

  /* ============================================
     TYPOGRAPHY
     ============================================ */
  --p-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --p-font-size-xs: 0.75rem;    /* 12px */
  --p-font-size-sm: 0.875rem;   /* 14px */
  --p-font-size-base: 1rem;     /* 16px */
  --p-font-size-lg: 1.125rem;   /* 18px */
  --p-font-size-xl: 1.25rem;    /* 20px */
  --p-font-size-2xl: 1.5rem;    /* 24px */
  --p-font-size-3xl: 1.875rem;  /* 30px */

  /* ============================================
     LAYOUT
     ============================================ */
  --p-sidebar-width: 280px;
  --p-header-height: 56px;
  --p-panel-collapsed: 48px;
  --p-panel-quick: 280px;
  --p-panel-advanced: 450px;

  /* ============================================
     Z-INDEX SCALE
     ============================================ */
  --p-z-dropdown: 1000;
  --p-z-sticky: 1020;
  --p-z-fixed: 1030;
  --p-z-modal-backdrop: 1040;
  --p-z-modal: 1050;
  --p-z-popover: 1060;
  --p-z-tooltip: 1070;
}
```

---

## SCSS Variables (for Angular)

Use these in Angular component styles:

```scss
// _media-layout-tokens.scss

// Primary Colors
$p-primary-color: #2196F3;
$p-primary-color-hover: #1976D2;
$p-primary-color-active: #1565C0;
$p-primary-color-text: #ffffff;

// Surface Colors
$p-surface-ground: #f8f9fa;
$p-surface-card: #ffffff;
$p-surface-border: #e5e7eb;
$p-surface-hover: #f3f4f6;

// Text Colors
$p-text-color: #1f2937;
$p-text-color-secondary: #6b7280;
$p-text-color-muted: #9ca3af;

// Status Colors
$p-success: #22c55e;
$p-error: #ef4444;
$p-warning: #eab308;
$p-info: #3B82F6;

// Spacing
$p-spacing-1: 0.25rem;
$p-spacing-2: 0.5rem;
$p-spacing-3: 0.75rem;
$p-spacing-4: 1rem;
$p-spacing-5: 1.25rem;
$p-spacing-6: 1.5rem;
$p-spacing-8: 2rem;

// Border Radius
$p-border-radius-sm: 4px;
$p-border-radius: 6px;
$p-border-radius-md: 8px;
$p-border-radius-lg: 12px;

// Shadows
$p-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
$p-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
$p-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
$p-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);

// Transitions
$p-transition-fast: 150ms ease;
$p-transition-base: 200ms ease;
$p-transition-slow: 300ms ease;
```

---

## Category Color Presets

For background color selection in media layouts:

```scss
// Category-specific colors
$category-colors: (
  'produce': (#4CAF50, #8BC34A),
  'meat': (#D32F2F, #FFCDD2),
  'dairy': (#2196F3, #BBDEFB),
  'bakery': (#795548, #D7CCC8),
  'beverages': (#9C27B0, #E1BEE7),
  'neutral': (#F5F5F5, #EEEEEE, #E0E0E0)
);
```

---

## Usage Examples

### In HTML Prototype

```html
<style>
  .my-button {
    background: var(--p-primary-color);
    color: var(--p-primary-color-text);
    padding: var(--p-spacing-2) var(--p-spacing-4);
    border-radius: var(--p-border-radius);
    transition: background var(--p-transition-fast);
  }

  .my-button:hover {
    background: var(--p-primary-color-hover);
  }

  .my-card {
    background: var(--p-surface-card);
    border: 1px solid var(--p-surface-border);
    border-radius: var(--p-border-radius-md);
    box-shadow: var(--p-shadow);
    padding: var(--p-spacing-4);
  }
</style>
```

### In Angular Component

```scss
// my-component.component.scss
@import 'media-layout-tokens';

.my-button {
  background: $p-primary-color;
  color: $p-primary-color-text;
  padding: $p-spacing-2 $p-spacing-4;
  border-radius: $p-border-radius;
  transition: background $p-transition-fast;

  &:hover {
    background: $p-primary-color-hover;
  }
}

.my-card {
  background: $p-surface-card;
  border: 1px solid $p-surface-border;
  border-radius: $p-border-radius-md;
  box-shadow: $p-shadow;
  padding: $p-spacing-4;
}
```

---

## Comparison: Prototype vs Production

| Token | Prototype (CSS var) | Production (SCSS) |
|-------|---------------------|-------------------|
| Primary | `var(--p-primary-color)` | `$p-primary-color` |
| Spacing | `var(--p-spacing-4)` | `$p-spacing-4` |
| Border radius | `var(--p-border-radius)` | `$p-border-radius` |
| Shadow | `var(--p-shadow)` | `$p-shadow` |

Both should resolve to the same values, ensuring visual consistency between prototypes and production.
