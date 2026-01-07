# CLAUDE.md - mydarndest-playground (Prototype & POC Repository)

## Project Overview

This repository is for **prototyping and proof-of-concept development**. Prototypes built here are validated and then migrated to production repositories.

**Related Production Repo:** `/Users/billklingensmith/Code/ideal-sale-circular/`

---

## Design Tokens

**Use the global design-system tokens** defined in `~/.claude/CLAUDE.md`. All tokens use the `--dh-*` prefix from the design-system repository.

For prototypes in this repo, you can also use PrimeNG utility classes from PrimeFlex for layout.

### CDN Links for HTML Prototypes

Include these in the `<head>` of HTML prototypes:

```html
<!-- PrimeIcons -->
<link rel="stylesheet" href="https://unpkg.com/primeicons/primeicons.css">

<!-- PrimeFlex (Utility Classes) -->
<link rel="stylesheet" href="https://unpkg.com/primeflex@3.3.1/primeflex.css">

<!-- Local Design Tokens (include design-system tokens here) -->
<link rel="stylesheet" href="css/tokens.css">
```

### PrimeNG Component Class Patterns

Use these CSS class patterns for PrimeNG-style components:

```html
<!-- Buttons -->
<button class="p-button p-button-primary">Primary</button>
<button class="p-button p-button-secondary">Secondary</button>
<button class="p-button p-button-text">Text</button>
<button class="p-button p-button-outlined">Outlined</button>

<!-- Cards -->
<div class="p-card">
  <div class="p-card-header">Header</div>
  <div class="p-card-body">Content</div>
  <div class="p-card-footer">Footer</div>
</div>

<!-- Form Inputs -->
<input type="text" class="p-inputtext" placeholder="Text input">

<!-- Badges -->
<span class="p-badge">Badge</span>
<span class="p-badge p-badge-success">Success</span>
```

---

## Prototype Folder Structure

```
mydarndest-playground/
├── CLAUDE.md                      # This file
├── media-layout-prototype/        # Example prototype
│   ├── index.html                 # Main prototype
│   ├── css/
│   │   └── tokens.css             # Design-system tokens
│   ├── js/
│   │   └── app.js                 # Application logic
│   └── MIGRATION-SPEC.md          # Angular migration docs
└── [feature-name]-prototype/      # New prototypes
```

---

## Prototyping Workflow

### Creating a New Prototype

1. Create folder: `[feature-name]-prototype/`
2. Create `index.html` with CDN links above
3. Copy design-system tokens to `css/tokens.css`
4. Use `--dh-*` CSS variables for all styling

### When Prototype is Ready for Production

1. Document the solution in `MIGRATION-SPEC.md`
2. Create POC branch in `ideal-sale-circular`: `poc/[feature-name]-v1`
3. Build Angular components using design-system package

---

## Working with Figma Designs

When sharing Figma screenshots:
1. Include the full component/screen
2. Note any interactive states (hover, active, disabled)
3. Claude will use design-system tokens automatically

---

## Key Prototypes

| Prototype | Status | Production Destination |
|-----------|--------|----------------------|
| `media-layout-prototype/` | Active | `ideal-sale-circular/src/app/content/components/media-layout/` |
| `circular-date-banner/` | Active | Design-system component |
