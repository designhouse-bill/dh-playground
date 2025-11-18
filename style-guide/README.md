# Digital Circular Style Guide

A comprehensive, self-contained style guide for digital circular platforms, featuring real component implementations, industry-specific themes, and an interactive configuration builder.

## 📋 Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [File Structure](#file-structure)
- [Pages](#pages)
- [Configuration Options](#configuration-options)
- [Industry Themes](#industry-themes)
- [Customization](#customization)
- [Deployment](#deployment)
- [Updating From Source Repos](#updating-from-source-repos)
- [Technical Details](#technical-details)

## 🎯 Overview

This style guide documents the design system for a digital circular platform used across **81 retail themes** spanning grocery, hardware, liquor, and general retail industries. It extracts and showcases:

- **885+ design tokens** across 10 categories
- **16 price tag components** with 6 style variants each
- **17 card components** with multiple layouts
- **7 deal types** (Amount, NumFor, BOGO, SaveX, etc.)
- **Real client configurations** from production themes

### Key Features

- ✅ **Fully self-contained** - No build process, works offline
- ✅ **Framework-independent** - Vanilla JavaScript and CSS
- ✅ **Interactive examples** - Live previews with real-time controls
- ✅ **Configuration export** - Generate SCSS/JSON theme configs
- ✅ **Industry-specific** - Tailored examples for different retail verticals
- ✅ **Responsive** - Device preview modes (mobile/tablet/desktop)

## 🚀 Getting Started

### Quick Start

1. Open `index.html` in any modern web browser
2. Navigate using the top navigation menu
3. Explore interactive examples and previews
4. Use the Configuration Export page to create custom themes

### Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- No server required - works as static HTML files
- JavaScript enabled

## 📁 File Structure

```
style-guide/
├── index.html                      # Landing page with overview
├── colors-fonts.html               # Brand identity and typography
├── price-stickers.html             # Static price tag showcase
├── price-stickers-interactive.html # Interactive price builder
├── deal-types.html                 # Deal type examples
├── components.html                 # Card components showcase
├── themes.html                     # Theme presets (8 themes)
├── themes-interactive.html         # Interactive theme switcher
├── extracted-components.html       # Real extracted component HTML
├── config-export.html              # Configuration builder & exporter ⭐
│
├── industries/                     # Industry-specific pages
│   ├── grocery.html               # Grocery themes & deals
│   ├── hardware.html              # Hardware themes & deals
│   └── liquor.html                # Liquor themes & deals
│
├── shared-nav.js                   # Shared navigation component
├── responsive-preview.js           # Device preview component
├── audit-results.json              # Full repository audit data
├── README.md                       # This file
│
└── assets/                         # Static assets
    ├── icons/                     # Icon sets
    └── fonts/                     # Font fallbacks (if needed)
```

## 📄 Pages

### Core Pages

#### `index.html` - Landing Page
Overview of the style guide with quick links to all sections.

#### `colors-fonts.html` - Brand Identity
- Primary, alt, and emphasis color palettes
- Typography samples for all supported fonts
- Color usage guidelines

#### `price-stickers.html` - Price Tags (Static)
Showcases all 6 price sticker variants:
- Default
- Reversed
- Alt
- Alt-Reversed
- Emphasis
- Emphasis-Reversed

#### `price-stickers-interactive.html` - Price Tags (Interactive)
Live price builder with controls for:
- Variant selection
- Dollar/cent amounts
- Unit type (Each, lb, oz, etc.)
- Price type (regular/sale)
- Loyalty overlay toggle

#### `deal-types.html` - Deal Types
Examples of all 7 deal types with realistic data:
- **Amount**: Standard pricing ($9.99)
- **NumFor**: Multi-buy (2 for $5)
- **BOGO**: Buy one get one
- **SaveX**: Save amount ($2.00 off)
- **NumSlash**: Bulk pricing (2/$5)
- **FromNum**: Starting price (From $19.99)
- **None**: No deal, regular price

#### `components.html` - Card Components
17 card layouts including:
- Standard cards (vertical/horizontal)
- Feature cards with headlines
- Coupon cards
- Compact cards
- List-style cards

#### `themes.html` - Theme Presets (Static)
8 pre-configured themes:
- Default, Gelson's, Festival Foods, Albertsons, IGA, Weis Markets, ShopRite, Ace Hardware

#### `themes-interactive.html` - Theme Switcher
Interactive theme builder with:
- Real-time color pickers for primary/alt/emphasis colors
- Live CSS variable updates
- Before/after comparisons

#### `extracted-components.html` - Real Components
Actual HTML/CSS extracted from the design-system repository with:
- Real SCSS converted to inline CSS
- Actual design token values
- Production component structure

#### `config-export.html` - Configuration Builder ⭐
Interactive configuration tool:
- Choose from 5 preset themes or customize
- Live preview of changes
- Export as SCSS or JSON
- Download or copy to clipboard
- Generates theme files matching repository structure

### Industry-Specific Pages

#### `industries/grocery.html`
- 6 featured grocery themes (Gelson's, Festival Foods, Albertsons, IGA, Weis, ShopRite)
- Common grocery deal types (NumFor, BOGO, weight-based, SaveX, loyalty, NumSlash)
- Explanatory text about design choices
- Actual client configurations with code examples

#### `industries/hardware.html`
- 3 hardware themes (Ace, Sutherlands, Waters Hardware)
- Hardware-specific deals (project pricing, bulk discounts, contractor pricing)
- Design philosophy for hardware retail
- Rectangle vs. circular price tags

#### `industries/liquor.html`
- Captain Liquor theme (Coborn's Inc.)
- Premium typography and dark UI elements
- Liquor-specific deals (volume discounts, staff picks, limited releases)
- Regulatory compliance notes

## ⚙️ Configuration Options

### Design Tokens

The style guide documents **885+ design tokens** organized into these categories:

1. **Colors** (113 tokens)
   - Brand colors (primary, alt, emphasis)
   - Text colors (on light, on dark)
   - Background colors
   - Border/line colors

2. **Typography** (89 tokens)
   - Font families (body, display, prices)
   - Font sizes (xs to 4xl)
   - Font weights
   - Line heights

3. **Spacing** (45 tokens)
   - Padding values (3xs to 4xl)
   - Margin values
   - Gap values

4. **Border Radius** (41 tokens)
   - Corner radii (none to full/circle)
   - Individual corner control (tl, tr, br, bl)

5. **Shadows** (18 tokens)
   - Drop shadows (sm to xl)
   - Elevated states

6. **Price Sticker Tokens** (156 tokens)
   - Background colors (default, alt, emphasis)
   - Text colors
   - Border styles
   - Aspect ratios
   - Padding/margins
   - Font customizations

7. **Card Tokens** (94 tokens)
   - Card layouts
   - Button styles
   - Headline styles
   - Description styles

8. **Header Tokens** (47 tokens)
   - App header styles
   - Category header styles
   - Navigation styles

9. **Deal Type Tokens** (31 tokens)
   - Deal-specific styling
   - Badge colors
   - Tag formats

10. **Component Tokens** (251 tokens)
    - Buttons, inputs, menus
    - Modal/dialog styles
    - List styles

### Mapping Configs to Visual Changes

#### Color Changes
```scss
@include token.set(token.$color-brand, #E2141E);
```
**Affects:**
- Primary buttons background
- Header backgrounds
- Price sticker default background
- Link colors
- Active states

#### Typography Changes
```scss
@include token.set(token.$font-prices, 'Oswald', sans-serif);
```
**Affects:**
- All price displays
- Dollar/cent formatting
- Unit text (Each, lb, etc.)

#### Shape Changes
```scss
@include token.set(token.$price-sticker-aspect-ratio, calc(3/2));
@include token.set(token.$price-sticker-radius-tl, 0);
```
**Affects:**
- Price tag shape (circle → rectangle)
- Corner roundness
- Overall tag dimensions

#### Border Changes
```scss
@include token.set(token.$price-sticker-border-width, 0.125em);
@include token.set(token.$price-sticker-border-color, #FFFFFF);
```
**Affects:**
- Price tag outlines
- Emphasis on reversed variants

#### Shadow Changes
```scss
@include token.set(token.$price-sticker-shadow, 0 4px 8px rgba(0,0,0,0.15));
```
**Affects:**
- Depth perception
- Tag elevation
- Visual hierarchy

## 🏭 Industry Themes

### Grocery Retail

**Characteristics:**
- Bright, energetic colors (reds, greens, yellows)
- Circular price tags (impulse appeal)
- NumFor/BOGO deals prominent
- High-volume, fast-paced shopping
- Weight-based pricing ($/lb)

**Example Themes:**
- Gelson's: Copper/orange (#cd612b), Montserrat
- Festival Foods: Green (#3a823d), 3:2 horizontal tags
- Weis Markets: Blue (#1E3A8A), simple pricing

### Hardware Retail

**Characteristics:**
- Trust colors (red, green, blue)
- Rectangular tags (3:2 aspect ratio)
- Bold typography (Roboto Slab, condensed fonts)
- Project-based pricing
- Contractor/Pro member deals

**Example Themes:**
- Ace Hardware: Red (#e63339), skewed accent
- Sutherlands: Green (#148059), 10% radius
- Waters: White reversed, large shadow

### Liquor Retail

**Characteristics:**
- Sophisticated, premium aesthetics
- Decorative fonts (Trade Winds, cursive)
- Dark UI elements (#333 backgrounds)
- Semi-transparent overlays (87.5%)
- Volume discounts (Mix & Match 6)

**Example Theme:**
- Captain Liquor: Blue (#0072bb), champagne accent

## 🎨 Customization

### Using the Configuration Export Tool

1. **Open** `config-export.html`
2. **Choose** a preset theme or start from scratch
3. **Customize** using the form controls:
   - Brand colors (primary, alt, emphasis)
   - Typography (price font, body font)
   - Shape (aspect ratio, border radius)
   - Border width
   - Shadow style
4. **Preview** changes in real-time
5. **Export** as SCSS or JSON:
   - Click "Download Config" to save file
   - Or "Copy Code" to clipboard

### Manual Customization

Create a new `theme.scss` file:

```scss
@use '@thedesignhouse/design-system/tokens' as token;

:root, :host {
  // Your customizations here
  @include token.set(token.$color-brand, #YOUR_COLOR);
  @include token.set(token.$font, 'Your Font', sans-serif);
  // ... more tokens
}
```

### Testing Your Theme

1. Use `themes-interactive.html` to test colors
2. Use `price-stickers-interactive.html` to test price displays
3. Check all deal types in `deal-types.html`
4. Verify responsive behavior using device toggles

## 🚀 Deployment

### As Static Files

The style guide is fully self-contained and can be deployed anywhere:

1. **Copy the entire `style-guide/` folder**
2. **Upload to any web server** (Apache, Nginx, S3, Netlify, etc.)
3. **No build step required** - files work as-is

### Hosting Options

#### GitHub Pages
```bash
# In your repo
git subtree push --prefix style-guide origin gh-pages
```

#### Netlify
- Drag and drop the `style-guide/` folder
- Or connect to GitHub and set publish directory to `style-guide/`

#### AWS S3
```bash
aws s3 sync style-guide/ s3://your-bucket/ --acl public-read
```

#### Local Server
```bash
# Python 3
cd style-guide
python -m http.server 8000

# Node.js
npx serve style-guide
```

### Offline Use

Simply open `index.html` in a browser - no server required.

## 🔄 Updating From Source Repos

When the source repositories change, update the style guide:

### 1. Re-run the Audit

Use the Task agent to audit repositories:

```
Please audit the following repositories and update audit-results.json:
- /path/to/design-system
- /path/to/themes
- /path/to/DigitalCircular2
```

### 2. Update Design Tokens

When tokens change in `design-system/tokens/tokens.ts`:

1. Review changes in the audit results
2. Update `colors-fonts.html` with new token values
3. Update Configuration Export presets in `config-export.html`

### 3. Update Theme Configurations

When new themes are added to `themes/`:

1. Check `audit-results.json` for new theme files
2. Add new presets to relevant industry pages
3. Update `themes-interactive.html` with new options

### 4. Update Components

When components change in `design-system/lib/`:

1. Re-extract component HTML/SCSS
2. Update `extracted-components.html`
3. Update `components.html` if layouts change

### 5. Automated Updates

Consider creating a script:

```bash
#!/bin/bash
# update-style-guide.sh

# Run audit
node scripts/audit-repos.js

# Extract components
node scripts/extract-components.js

# Update pages
node scripts/update-pages.js
```

## 🔧 Technical Details

### Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari, Chrome Android

### Dependencies

**External (loaded from CDN):**
- Google Fonts (Inter, Oswald, Roboto Slab, Montserrat, etc.)

**Internal (no dependencies):**
- `shared-nav.js` - Navigation component
- `responsive-preview.js` - Device preview component

### Technology Stack

- **HTML5** - Semantic markup
- **CSS3** - Custom properties, Grid, Flexbox
- **JavaScript (ES6+)** - Vanilla JS, no frameworks
- **Web Fonts** - Google Fonts API

### Performance

- **No build process** - Instant load
- **Inline CSS** - No external stylesheets to fetch
- **Lazy loading** - Google Fonts loaded asynchronously
- **Small footprint** - ~2MB total for all pages

### Accessibility

- Semantic HTML elements
- ARIA labels where appropriate
- Keyboard navigation support
- Color contrast ratios meet WCAG AA
- Screen reader friendly

### Security

- No external scripts (except Google Fonts)
- No form submissions
- No cookies or tracking
- All code visible and auditable
- CSP compatible

## 📊 Statistics

- **Total Pages:** 14 HTML files
- **Design Tokens:** 885+
- **Themes Documented:** 81
- **Price Components:** 16 (× 6 variants = 96 total)
- **Card Components:** 17
- **Deal Types:** 7
- **Industry Verticals:** 3 (Grocery, Hardware, Liquor)
- **Interactive Tools:** 4 (price builder, theme switcher, responsive preview, config export)

## 🤝 Contributing

To add new themes or update existing ones:

1. Add theme configuration to appropriate industry page
2. Update `config-export.html` presets if it's a major theme
3. Ensure real SCSS code is included in config sections
4. Test in `themes-interactive.html`

## 📝 License

This style guide documents proprietary design systems. Usage is subject to the licenses of the underlying design-system and themes repositories.

## 🆘 Support

For issues or questions:

1. Review this README
2. Check the interactive examples
3. Examine `audit-results.json` for source data
4. Refer to source repositories for authoritative documentation

---

**Last Updated:** 2025-11-17
**Version:** 1.0.0
**Generated From:**
- design-system repository
- themes repository
- DigitalCircular2 repository
