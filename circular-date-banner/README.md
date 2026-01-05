# Circular Date Banner - Prototype

A configurable date banner component prototype for displaying weekly circular validity dates. Built with vanilla HTML/CSS/JavaScript for rapid prototyping before Angular migration.

## Overview

This component displays:
- A header title (e.g., "WEEKLY AD" / "OFERTAS SEMANALES")
- A date range showing the circular's validity period
- Optional day names (e.g., "Wednesday - Tuesday")
- A validity pill showing countdown/expiration status
- Sticky scroll behavior with hide/show on scroll direction

## Quick Start

1. Open `index.html` in any modern browser
2. Use the configuration panel on the right to customize the banner
3. Settings are automatically saved to localStorage

## File Structure

```
circular-date-banner/
├── index.html              # Main demo page with config panel
├── README.md               # This file
├── CONFIGURATION.md        # Detailed config documentation
├── TESTING.md              # Testing checklist
├── styles/
│   ├── variables.css       # CSS custom properties (design tokens)
│   ├── banner.css          # Banner component styles
│   ├── pill.css            # Validity pill styles
│   ├── patterns.css        # Background pattern definitions
│   └── controls.css        # Config panel UI styles
└── scripts/
    ├── config.js           # Configuration state management
    ├── banner.js           # Banner rendering logic
    ├── pill.js             # Validity pill logic
    ├── dateUtils.js        # Date formatting utilities
    └── controls.js         # Config panel bindings
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | `true` | Show/hide the banner |
| `headerText` | string | `"WEEKLY AD"` | Banner title text |
| `headerTextTranslated` | string | `"OFERTAS SEMANALES"` | Spanish translation |
| `locale` | string | `"en"` | Language (`en` or `es`) |
| `startDayOfWeek` | string | `"Wednesday"` | Circular start day |
| `dateFormat` | string | `"explicit"` | Date display format |
| `showDayNames` | boolean | `true` | Show day range |
| `showYear` | boolean | `false` | Include year in dates |
| `backgroundColor` | string | `"#1a5f2a"` | Banner background color |
| `textColor` | string | `"#ffffff"` | Text color |
| `backgroundPattern` | string | `"none"` | Background pattern type |
| `patternOpacity` | number | `0.15` | Pattern visibility |
| `showValidityPill` | boolean | `true` | Show countdown pill |
| `pillPosition` | string | `"bottom-left"` | Pill placement |
| `stickyEnabled` | boolean | `true` | Enable sticky scroll |
| `stickyThreshold` | number | `200` | Scroll distance before sticky |

See [CONFIGURATION.md](CONFIGURATION.md) for complete documentation.

## Presets

Four pre-configured themes are available:

- **Minimal**: Gray, compact, no extras
- **Standard**: Green (default), balanced
- **Bold**: Red, larger, with pattern
- **Spanish**: Blue, Spanish language

## Testing Locally

No build step required:

```bash
# Option 1: Open directly
open index.html

# Option 2: Use a local server (recommended for module imports)
npx serve .
# or
python -m http.server 8000
```

## Angular Migration Notes

### Component Structure

```
CircularDateBannerComponent
├── circular-date-banner.component.ts    # Main component
├── circular-date-banner.component.html  # Template
├── circular-date-banner.component.scss  # Styles (from banner.css)
└── circular-date-banner.component.spec.ts

ValidityPillComponent
├── validity-pill.component.ts
├── validity-pill.component.html
├── validity-pill.component.scss         # (from pill.css)
└── validity-pill.component.spec.ts
```

### @Input() Properties

Convert these config options to Angular inputs:

```typescript
// circular-date-banner.component.ts
@Input() headerText = 'WEEKLY AD';
@Input() headerTextTranslated = 'OFERTAS SEMANALES';
@Input() locale: 'en' | 'es' = 'en';
@Input() startDayOfWeek: DayOfWeek = 'Wednesday';
@Input() dateFormat: DateFormat = 'explicit';
@Input() showDayNames = true;
@Input() showYear = false;
@Input() backgroundColor = '#1a5f2a';
@Input() textColor = '#ffffff';
@Input() backgroundPattern: PatternType = 'none';
@Input() patternOpacity = 0.15;
@Input() alignment: 'left' | 'center' | 'right' = 'center';
@Input() paddingVertical: SpacingSize = 'md';
@Input() paddingHorizontal: SpacingSize = 'md';
@Input() borderStyle: BorderStyle = 'none';
@Input() borderColor = '#000000';
@Input() borderWidth = 2;
```

### Services

Extract these to Angular services:

```typescript
// date-utils.service.ts
// From: scripts/dateUtils.js
// Methods: calculateCircularDateRange, formatDateRange, formatDayRange, etc.

// banner-config.service.ts (optional)
// From: scripts/config.js
// For app-wide banner configuration with state management
```

### Styles

1. Copy `variables.css` to your global styles or theme
2. Convert `banner.css` to SCSS with PrimeNG token references
3. Convert `pill.css` for the validity pill component
4. Use `patterns.css` as a shared stylesheet or inline

### Recommended PrimeNG Integration

```typescript
// Use PrimeNG design tokens
import { PrimeNGConfig } from 'primeng/api';

// Reference tokens in SCSS
.circular-date-banner {
  background-color: var(--p-primary-color, #1a5f2a);
  color: var(--p-primary-color-text, #ffffff);
  padding: var(--p-spacing-4);
}
```

## Browser Support

Tested in:
- Chrome 120+
- Firefox 120+
- Safari 17+
- Edge 120+

## Related Files

- Production repo: `/Users/billklingensmith/Code/ideal-sale-circular/`
- Design tokens: `PRIMENG-TOKENS.md` (in media-layout-prototype)
