# Configuration Reference

Complete documentation for all Circular Date Banner configuration options.

## Table of Contents

- [Content Options](#content-options)
- [Date Display](#date-display)
- [Typography](#typography)
- [Colors](#colors)
- [Layout](#layout)
- [Border](#border)
- [Background Pattern](#background-pattern)
- [Validity Pill](#validity-pill)
- [Scroll Behavior](#scroll-behavior)
- [Presets](#presets)

---

## Content Options

### `enabled`
- **Type:** `boolean`
- **Default:** `true`
- **Description:** Controls banner visibility. When `false`, the banner is hidden with `display: none`.

### `headerText`
- **Type:** `string`
- **Default:** `"WEEKLY AD"`
- **Description:** The main title text displayed at the top of the banner. Used when `locale` is `"en"`.

### `headerTextTranslated`
- **Type:** `string`
- **Default:** `"OFERTAS SEMANALES"`
- **Description:** Spanish translation of the header. Used when `locale` is `"es"`.

### `locale`
- **Type:** `"en"` | `"es"`
- **Default:** `"en"`
- **Description:** Language setting. Affects:
  - Header text (English vs Spanish)
  - Date formatting (month names)
  - Day names

### `startDayOfWeek`
- **Type:** `"Sunday"` | `"Monday"` | `"Tuesday"` | `"Wednesday"` | `"Thursday"` | `"Friday"` | `"Saturday"`
- **Default:** `"Wednesday"`
- **Description:** The day each weekly circular begins. Used to calculate the current circular's date range based on today's date.

---

## Date Display

### `dateFormat`
- **Type:** `"explicit"` | `"abbreviated"` | `"numeric"`
- **Default:** `"explicit"`
- **Description:** How dates are formatted:
  - `"explicit"`: "January 15 - January 21"
  - `"abbreviated"`: "Jan 15 - Jan 21"
  - `"numeric"`: "1/15 - 1/21"

### `showDayNames`
- **Type:** `boolean`
- **Default:** `true`
- **Description:** Show day-of-week range above the date range. Example: "Wednesday - Tuesday"

### `showYear`
- **Type:** `boolean`
- **Default:** `false`
- **Description:** Include the year in date display. Useful for circulars spanning year boundaries.

---

## Typography

### `fontFamily`
- **Type:** `"primary"` | `"heading"`
- **Default:** `"primary"`
- **Description:** Font family for banner text:
  - `"primary"`: System font stack (body text)
  - `"heading"`: Heading font (typically bolder)

### `fontWeight`
- **Type:** `number` (100-900)
- **Default:** `600`
- **Description:** Font weight for the header text. Common values: 400 (normal), 500, 600 (semi-bold), 700 (bold).

### `textTransform`
- **Type:** `"none"` | `"uppercase"` | `"lowercase"` | `"capitalize"`
- **Default:** `"uppercase"`
- **Description:** Text transformation for the header.

---

## Colors

### `backgroundColor`
- **Type:** `string` (hex color)
- **Default:** `"#1a5f2a"` (forest green)
- **Description:** Banner background color. Recommended contrasting colors:
  - Green: `#1a5f2a` (default)
  - Blue: `#1e40af`
  - Red: `#991b1b`
  - Gray: `#374151`

### `textColor`
- **Type:** `string` (hex color)
- **Default:** `"#ffffff"` (white)
- **Description:** Color for all text elements. Should contrast with `backgroundColor`.

---

## Layout

### `alignment`
- **Type:** `"left"` | `"center"` | `"right"`
- **Default:** `"center"`
- **Description:** Horizontal text alignment within the banner.

### `paddingVertical`
- **Type:** `"sm"` | `"md"` | `"lg"` | `"xl"`
- **Default:** `"md"`
- **Description:** Vertical padding (top and bottom). Maps to CSS spacing tokens:
  - `"sm"`: 0.5rem (8px)
  - `"md"`: 1rem (16px)
  - `"lg"`: 1.5rem (24px)
  - `"xl"`: 2rem (32px)

### `paddingHorizontal`
- **Type:** `"sm"` | `"md"` | `"lg"` | `"xl"`
- **Default:** `"md"`
- **Description:** Horizontal padding (left and right).

---

## Border

### `borderStyle`
- **Type:** `"none"` | `"solid"` | `"bottom-only"`
- **Default:** `"none"`
- **Description:** Border style:
  - `"none"`: No border
  - `"solid"`: Border on all sides
  - `"bottom-only"`: Border only on bottom edge

### `borderColor`
- **Type:** `string` (hex color)
- **Default:** `"#000000"`
- **Description:** Border color when `borderStyle` is not `"none"`.

### `borderWidth`
- **Type:** `number` (1-10)
- **Default:** `2`
- **Description:** Border width in pixels.

---

## Background Pattern

### `backgroundPattern`
- **Type:** `"none"` | `"diagonal-lines"` | `"dots"` | `"crosshatch"` | `"waves"` | `"chevron"` | `"grid"` | `"noise"`
- **Default:** `"none"`
- **Description:** Decorative background pattern overlaid on the banner:

| Pattern | Description |
|---------|-------------|
| `none` | Solid color only |
| `diagonal-lines` | 45-degree stripes |
| `dots` | Polka dot grid |
| `crosshatch` | Crossed diagonal lines |
| `waves` | Wavy horizontal lines |
| `chevron` | V-shaped zigzag |
| `grid` | Square grid |
| `noise` | Subtle texture/noise |

### `patternOpacity`
- **Type:** `number` (0.05 - 0.4)
- **Default:** `0.15`
- **Description:** Pattern visibility. Lower values are more subtle.

---

## Validity Pill

### `showValidityPill`
- **Type:** `boolean`
- **Default:** `true`
- **Description:** Show the floating validity countdown pill.

### `pillPosition`
- **Type:** `"bottom-left"` | `"bottom-right"`
- **Default:** `"bottom-left"`
- **Description:** Position of the validity pill within its container.

**Pill Behavior:**
- Shows countdown to expiration (e.g., "5 days left")
- Yellow/warning state when 2 days or fewer remain
- Red/expired state after circular ends
- Click/tap to expand and see full date range
- Desktop: hover also expands

---

## Scroll Behavior

### `stickyEnabled`
- **Type:** `boolean`
- **Default:** `true`
- **Description:** Enable sticky banner behavior on scroll.

### `stickyThreshold`
- **Type:** `number` (50-500)
- **Default:** `200`
- **Description:** Scroll distance (in pixels) before banner becomes sticky.

**Sticky Behavior:**
1. Initial: Banner in normal document flow
2. Scroll past threshold: Banner sticks to top
3. Continue scrolling down: Banner slides up and hides
4. Scroll up: Banner slides back down and shows
5. Scroll to top: Banner returns to normal flow

---

## Presets

Pre-configured themes available via the config panel or `BannerConfig.applyPreset()`:

### Minimal
Clean, understated design.

```javascript
{
  backgroundColor: '#374151',
  textColor: '#ffffff',
  fontWeight: 500,
  paddingVertical: 'sm',
  paddingHorizontal: 'sm',
  backgroundPattern: 'none',
  showDayNames: false,
  showValidityPill: false,
  stickyEnabled: false
}
```

### Standard (Default)
Balanced, branded look.

```javascript
{
  backgroundColor: '#1a5f2a',
  textColor: '#ffffff',
  fontWeight: 600,
  paddingVertical: 'md',
  paddingHorizontal: 'md',
  backgroundPattern: 'none',
  showDayNames: true,
  showValidityPill: true,
  stickyEnabled: true,
  stickyThreshold: 200
}
```

### Bold
Eye-catching, prominent design.

```javascript
{
  backgroundColor: '#991b1b',
  textColor: '#ffffff',
  fontFamily: 'heading',
  fontWeight: 700,
  paddingVertical: 'lg',
  paddingHorizontal: 'lg',
  borderStyle: 'bottom-only',
  borderColor: '#7f1d1d',
  borderWidth: 3,
  backgroundPattern: 'diagonal-lines',
  patternOpacity: 0.1,
  showDayNames: true,
  showValidityPill: true,
  stickyEnabled: true,
  stickyThreshold: 150
}
```

### Spanish
Blue theme with Spanish language.

```javascript
{
  locale: 'es',
  headerTextTranslated: 'OFERTAS SEMANALES',
  backgroundColor: '#1e40af',
  textColor: '#ffffff',
  fontWeight: 600,
  paddingVertical: 'md',
  paddingHorizontal: 'md',
  backgroundPattern: 'none',
  showDayNames: true,
  showValidityPill: true,
  stickyEnabled: true
}
```

---

## Recommended Configurations

### E-commerce Weekly Circular
Standard with sticky behavior for easy reference while browsing.

```javascript
{
  headerText: 'WEEKLY AD',
  backgroundColor: '#1a5f2a',
  showDayNames: true,
  showValidityPill: true,
  stickyEnabled: true,
  stickyThreshold: 200
}
```

### Mobile-Optimized
Compact for smaller screens.

```javascript
{
  paddingVertical: 'sm',
  paddingHorizontal: 'sm',
  showDayNames: false,
  stickyEnabled: false,
  showValidityPill: true,
  pillPosition: 'bottom-right'
}
```

### Print-Style
Clean, professional appearance.

```javascript
{
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  borderStyle: 'bottom-only',
  borderColor: '#d1d5db',
  borderWidth: 1,
  backgroundPattern: 'none',
  showValidityPill: false
}
```

---

## JavaScript API

### Getting/Setting Config

```javascript
// Get single value
const bgColor = BannerConfig.get('backgroundColor');

// Get all values
const config = BannerConfig.getAll();

// Set single value
BannerConfig.set('backgroundColor', '#1e40af');

// Set multiple values
BannerConfig.setMultiple({
  backgroundColor: '#1e40af',
  textColor: '#ffffff',
  locale: 'es'
});
```

### Presets

```javascript
// Apply a preset
BannerConfig.applyPreset('bold');

// Get available preset names
const presets = BannerConfig.getPresetNames();
// ['minimal', 'standard', 'bold', 'spanish']
```

### Export/Import

```javascript
// Export to JSON
const json = BannerConfig.exportJSON();

// Copy to clipboard
await BannerConfig.copyToClipboard();

// Import from JSON
BannerConfig.importJSON(jsonString);
```

### Reset

```javascript
// Reset to defaults
BannerConfig.reset();
```

### Events

```javascript
// Listen for config changes
BannerConfig.on('change', ({ key, value, oldValue }) => {
  console.log(`${key} changed from ${oldValue} to ${value}`);
});

// Listen for preset application
BannerConfig.on('preset', ({ name, config }) => {
  console.log(`Applied preset: ${name}`);
});

// Listen for reset
BannerConfig.on('reset', (newConfig) => {
  console.log('Config reset to defaults');
});
```
