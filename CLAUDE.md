# CLAUDE.md - mydarndest-playground (Prototype & POC Repository)

## Project Overview

This repository is for **prototyping and proof-of-concept development**. Prototypes built here are validated and then migrated to production repositories.

**Related Production Repo:** `/Users/billklingensmith/Code/ideal-sale-circular/`

---

## Default UI Framework: PrimeNG with Aura Theme

When building HTML/CSS/JS prototypes, **always use PrimeNG patterns and styling** for consistency with production Angular apps.

### Design Tokens (Use These Colors)

```css
/* Primary Color - STANDARDIZED */
--p-primary-color: #2196F3;
--p-primary-color-hover: #1976D2;
--p-primary-color-active: #1565C0;
--p-primary-color-text: #ffffff;

/* Surface Colors */
--p-surface-ground: #f8f9fa;      /* Page background */
--p-surface-card: #ffffff;         /* Card/panel background */
--p-surface-border: #e5e7eb;       /* Borders */
--p-surface-hover: #f3f4f6;        /* Hover states */

/* Text Colors */
--p-text-color: #1f2937;           /* Primary text */
--p-text-color-secondary: #6b7280; /* Secondary text */
--p-text-color-muted: #9ca3af;     /* Muted/disabled */

/* Status Colors */
--p-green-500: #22c55e;            /* Success */
--p-red-500: #ef4444;              /* Error/Danger */
--p-yellow-500: #eab308;           /* Warning */
--p-blue-500: #3B82F6;             /* Info */

/* Spacing (PrimeFlex aligned) */
--p-spacing-1: 0.25rem;
--p-spacing-2: 0.5rem;
--p-spacing-3: 0.75rem;
--p-spacing-4: 1rem;
--p-spacing-5: 1.25rem;
--p-spacing-6: 1.5rem;
--p-spacing-8: 2rem;

/* Border Radius */
--p-border-radius: 6px;
--p-border-radius-sm: 4px;
--p-border-radius-lg: 12px;

/* Shadows */
--p-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--p-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
--p-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
--p-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);

/* Typography */
--p-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

### CDN Links for HTML Prototypes

Include these in the `<head>` of HTML prototypes:

```html
<!-- PrimeNG Theme (Aura) - Use for reference, styles are in primeng-overrides.css -->
<link rel="stylesheet" href="https://unpkg.com/primeicons/primeicons.css">

<!-- PrimeFlex (Utility Classes) -->
<link rel="stylesheet" href="https://unpkg.com/primeflex@3.3.1/primeflex.css">

<!-- Local Design Tokens (always include) -->
<link rel="stylesheet" href="css/primeng-overrides.css">
```

### Component Class Patterns

Use these CSS class patterns for PrimeNG-style components:

```html
<!-- Buttons -->
<button class="p-button p-button-primary">Primary</button>
<button class="p-button p-button-secondary">Secondary</button>
<button class="p-button p-button-text">Text</button>
<button class="p-button p-button-outlined">Outlined</button>
<button class="p-button p-button-sm">Small</button>
<button class="p-button p-button-lg">Large</button>

<!-- Cards -->
<div class="p-card">
  <div class="p-card-header">Header</div>
  <div class="p-card-body">Content</div>
  <div class="p-card-footer">Footer</div>
</div>

<!-- Form Inputs -->
<input type="text" class="p-inputtext" placeholder="Text input">
<select class="p-dropdown">...</select>
<input type="checkbox" class="p-checkbox">

<!-- Badges -->
<span class="p-badge">Badge</span>
<span class="p-badge p-badge-success">Success</span>
<span class="p-badge p-badge-danger">Error</span>
```

---

## Prototype Folder Structure

```
mydarndest-playground/
├── CLAUDE.md                      # This file
├── media-layout-prototype/        # Current active prototype
│   ├── index.html                 # Main prototype
│   ├── css/
│   │   └── primeng-overrides.css  # Design tokens
│   ├── js/
│   │   └── app.js                 # Main application logic
│   ├── MIGRATION-SPEC.md          # Angular migration documentation
│   ├── ANGULAR-MAPPING.md         # Component mapping guide
│   ├── PRIMENG-TOKENS.md          # Design token reference
│   ├── PRIMENG-COMPONENTS.md      # Component quick reference
│   └── FIGMA-TO-PRIMENG.md        # Figma translation guide
└── [future-prototype]/
```

---

## Prototyping Workflow

### Creating a New Prototype

1. Create folder: `[feature-name]-prototype/`
2. Copy starter files or create `index.html` with CDN links
3. Use PrimeNG class patterns from this document
4. Reference design tokens from `PRIMENG-TOKENS.md`

### When Prototype is Ready for Production

1. Document the solution in `MIGRATION-SPEC.md`
2. Map components using `ANGULAR-MAPPING.md` template
3. Create POC branch in `ideal-sale-circular`: `poc/[feature-name]-v1`
4. Build Angular components following production conventions

---

## Working with Figma Designs

When sharing Figma screenshots:
1. Include the full component/screen in the screenshot
2. Note any interactive states (hover, active, disabled)
3. Specify which PrimeNG components should be used
4. Reference `FIGMA-TO-PRIMENG.md` for translation patterns

### Example Prompt for Claude

```
Here's a Figma screenshot of a [component/page].
Please create an HTML prototype using PrimeNG/Aura styling.
Use the design tokens from primeng-overrides.css.
The main actions should use the primary blue (#2196F3).
```

---

## Key Prototypes

| Prototype | Status | Production Destination |
|-----------|--------|----------------------|
| `media-layout-prototype/` | Active | `ideal-sale-circular/src/app/content/components/media-layout/` |

---

## Reference Documents

- `media-layout-prototype/PRIMENG-TOKENS.md` - Design token reference
- `media-layout-prototype/PRIMENG-COMPONENTS.md` - Component patterns
- `media-layout-prototype/FIGMA-TO-PRIMENG.md` - Figma translation guide
- `media-layout-prototype/STYLE-AUDIT-IDEAL-SALE.md` - Production style audit
