# Assets Directory

This directory contains static assets used by the style guide.

## Structure

```
assets/
├── icons/          # Icon sets and SVG graphics
└── README.md       # This file
```

## Icons

Currently the style guide uses emoji icons throughout for maximum compatibility and zero dependencies:

- 🏠 Home
- 🎨 Colors & Fonts
- 🏷️ Price Stickers
- 💰 Deal Types
- 🧩 Components
- 🎭 Themes
- 📦 Extracted Components
- ⚙️ Configuration Export
- 🛒 Grocery
- 🔨 Hardware
- 🍷 Liquor

## Future Assets

If custom icons or graphics are needed:

### Icons
- Add SVG icon files to `icons/` directory
- Use inline SVG for better performance
- Ensure proper ARIA labels for accessibility

### Fonts
- Google Fonts are loaded from CDN by default
- If offline fallbacks needed, add WOFF2 files here
- Update font-face declarations in HTML pages

### Images
- Logo variations
- Screenshots
- Component previews
- Pattern libraries

## Guidelines

1. **Keep it minimal** - Only add assets that are truly necessary
2. **Optimize everything** - Compress images, minify SVGs
3. **Self-contained** - Ensure assets work offline
4. **No dependencies** - Avoid requiring build tools to process assets

## Current Dependencies

**External (CDN):**
- Google Fonts API (fonts.googleapis.com)

**Internal:**
- None - All icons use emoji for zero dependencies
