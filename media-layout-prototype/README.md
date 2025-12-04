# Media Layout Component Prototype

A comprehensive UI prototype for a flexible media layout system that allows users to arrange multiple product images in promotional cards with various layout options, drag-and-drop reordering, and detailed adjustment controls.

## Overview

This prototype demonstrates a complete media layout configuration workflow including:

- **Constraint System** - Card size limits, allowed layouts, and image count restrictions
- **Template Generator** - CSS Grid template generation for different layouts
- **Preview Renderer** - Real-time visual preview of layout configurations
- **Layout Selector** - UI for choosing layout type, emphasis, and direction
- **Media List** - Draggable list with selection, reordering, and add/remove
- **Adjustment Panel** - Fine-grained controls for position, transform, shadow, and opacity
- **Overlay Modal** - Complete modal combining all components
- **Size Change Handler** - Workflows for card size transitions with image selection
- **Editor Integration** - Mock of how the component integrates into an editor

## Quick Start

1. Clone or download this folder
2. Open `home.html` in a modern browser (Chrome, Firefox, Safari)
3. Navigate to different demos using the links provided

No build step or server required - all files are vanilla HTML, CSS, and JavaScript.

## File Structure

```
media-layout-prototype/
├── home.html              # Landing page with links to all demos
├── index.html             # Component test page with all tabs
├── editor-mock.html       # Editor integration mockup
├── README.md              # This file
│
├── css/
│   ├── tokens.css         # Design tokens (colors, spacing, typography)
│   ├── components.css     # Component styles
│   └── layout.css         # Page layout styles
│
└── js/
    ├── constraints.js     # Card size constraint system
    ├── templates.js       # CSS Grid template generator
    ├── preview.js         # Preview renderer component
    ├── layout-selector.js # Layout selection UI
    ├── media-list.js      # Draggable media list
    ├── adjustment-panel.js# Image adjustment controls
    ├── overlay-modal.js   # Complete overlay modal
    ├── size-change-handler.js # Size transition workflows
    └── app.js             # Application initialization
```

## Card Size Constraints

| Size | Max Images | Allowed Layouts | Default |
|------|------------|-----------------|---------|
| 1×1  | 2          | Grid only       | Grid    |
| 2×1  | 3          | Horizontal only | Horizontal |
| 1×2  | 3          | Vertical only   | Vertical |
| 2×2  | 4          | All             | Grid    |
| 3×1  | 5          | Horizontal only | Horizontal |
| 3×2  | 5          | All             | Grid    |
| 3×3  | 5          | All             | Grid    |

## Key Components

### MediaList

Draggable list component for managing media items.

```javascript
const mediaList = new MediaList({
  maxImages: 4,
  cardSize: '2x2',
  onSelect: (item, index) => console.log('Selected:', item),
  onReorder: (items, from, to) => console.log('Reordered'),
  onRemove: (item) => console.log('Removed:', item),
  onAdd: (item) => console.log('Added:', item)
});
mediaList.init(containerElement, initialItems);
```

### AdjustmentPanel

Controls for adjusting individual image properties.

```javascript
const panel = new AdjustmentPanel({
  onChange: (adjustments) => console.log('Updated:', adjustments),
  onStackingChange: (direction) => console.log('Stack:', direction)
});
panel.init(containerElement);
panel.setSelectedItem(item, index, total, currentAdjustments);
```

### OverlayModal

Complete modal combining all components.

```javascript
const modal = new OverlayModal({
  initialLayout: 'grid',
  initialItems: items,
  onSave: (config) => console.log('Saved:', config),
  onCancel: () => console.log('Cancelled')
});
modal.open({ layout: '2-equal', items: items });
```

### SizeChangeHandler

Handles card size transitions with image selection.

```javascript
const handler = new SizeChangeHandler({
  initialSize: '3x2',
  initialItems: items,
  onSizeChange: (data) => console.log('Size changed:', data),
  onLayoutChange: (data) => console.log('Layout changed:', data),
  onItemsChange: (data) => console.log('Items changed:', data)
});
handler.requestSizeChange('2x2'); // May show selection modal if too many images
```

## Adjustment Properties

Each image can be adjusted with the following properties:

| Property | Range | Default | Description |
|----------|-------|---------|-------------|
| Position X | -100 to 100 px | 0 | Horizontal offset |
| Position Y | -100 to 100 px | 0 | Vertical offset |
| Scale | 0.5 to 1.5 | 1 | Zoom level |
| Rotation | -180 to 180 deg | 0 | Rotation angle |
| Z-Index | 0 to 10 | 0 | Stacking order |
| Shadow Preset | none/subtle/medium/strong/dramatic | none | Pre-defined shadow |
| Shadow Custom | Various | - | Custom shadow properties |
| Opacity | 0 to 100% | 100 | Transparency |

## Layout Types

### Grid
- Equal-sized cells arranged in a grid
- Best for 2+ images with equal importance

### Horizontal
- Side-by-side arrangement
- Can have hero (larger) image on left or right
- Best for wide cards (2×1, 3×1)

### Vertical
- Stacked arrangement
- Can have hero image on top or bottom
- Best for tall cards (1×2)

## Emphasis Options

- **Equal** - All images same size
- **First** - First image is larger (hero)
- **Last** - Last image is larger

## Browser Support

Tested and working in:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Accessibility Features

- Full keyboard navigation
- ARIA labels and roles
- Focus management in modals
- Screen reader announcements
- Reduced motion support
- Focus visible indicators

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Arrow Up/Down | Navigate items |
| Ctrl + Arrow Up/Down | Reorder items |
| Delete/Backspace | Remove selected item |
| Escape | Close modal |
| Tab | Navigate focusable elements |

## Demo Pages

1. **Home** (`home.html`) - Landing page with overview
2. **Component Tests** (`index.html`) - Individual component testing
3. **Editor Mock** (`editor-mock.html`) - Full editor integration demo

## Development Notes

### Adding New Layouts

1. Add layout definition to `CARD_SIZE_CONSTRAINTS` in `constraints.js`
2. Add template generation in `templates.js`
3. Add preview support in `preview.js`
4. Update layout selector options

### Customizing Styles

All styles use CSS custom properties defined in `tokens.css`:

```css
:root {
  --color-primary: #3b82f6;
  --color-gray-100: #f3f4f6;
  --space-4: 1rem;
  --radius-md: 0.375rem;
  /* ... */
}
```

## License

This is a prototype for demonstration purposes.
