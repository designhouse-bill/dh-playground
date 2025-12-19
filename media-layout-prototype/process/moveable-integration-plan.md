# Media Layout: Moveable.js Integration Plan

## Overview
Integrate drag/drop/scale/rotate UI from `moveable-poc-v5.html` into `index.html`, adding the 9-config model for per-size layout persistence while preserving the existing 4-column layout and tool tile placement.

---

## Clarified Requirements

| Requirement | Decision |
|-------------|----------|
| Hero images 1-5 | Already supported via slots |
| Image count on size shrink | Prompt user to choose; mark non-used as "inactive" (preserved in state) |
| Template behavior | New promotions = default template; Past promotions = inherit all configs |
| Per-size configs | Yes - 9 independent configs with override support |
| Background | One shared across all 9 sizes |
| Angular wrapper | Use ngx-moveable if Angular 20 compatible; fallback to vanilla wrapper |
| **UI Layout** | **Keep existing 4-column layout from index.html** |
| **Tool Tiles** | **Keep current placement of editor cards** |
| **Hero Image Aspect** | **1:1 aspect ratio (square slots)** |
| **Existing Templates** | **Update with rotation variants, not replace** |

---

## UI Layout Preservation

**Current 4-Column Layout (KEEP)**:
```
Column 1: Background        Column 2: Templates       Column 3: Adjustments    Column 4: Preview
├─ Background Color         ├─ Hero Templates         ├─ Hero Adjustments      ├─ Preview
├─ Background Image         ├─ Hero Image             │   (sliders, controls)  ├─ Card Size
                            │   (count + layers)
```

**DO NOT restructure to 3-column.** The prototype's 3-column layout is for reference only. Integration must maintain the existing tile positions.

---

## Hero Image 1:1 Aspect Ratio

All hero image slots use **square containers** (width = height):
```javascript
// Slot structure - size creates square container
const slot = {
  position: { x: %, y: % },  // Top-left origin
  size: 50,                   // % of container → creates 50% x 50% SQUARE
  scale: 1.0,                 // Transform scale within square
  rotation: 0                 // Degrees
};
```

The `size` property defines BOTH width and height as percentage of the canvas, ensuring 1:1 aspect ratio for all hero image containers.

---

## Angular-Ready JavaScript Patterns

When updating JS files, use patterns that translate cleanly to Angular:

**DO:**
```javascript
// Class-based modules (easy to convert to Angular services)
class MoveableController {
  constructor(options = {}) { }
  init() { }
  destroy() { }
}

// Observer pattern (maps to RxJS BehaviorSubject)
subscribe(callback) { }
_notify(changeType, data) { }

// Pure functions for logic (easy to test, reuse)
function convertPixelsToPercent(pixels, containerSize) { }
```

**AVOID:**
```javascript
// Global mutations (hard to track in Angular)
window.globalState = {};

// Inline event handlers (use Angular event binding instead)
onclick="doThing()"

// jQuery-style DOM manipulation
$('.element').css('left', value);
```

---

## Angular Compatibility Note

**ngx-moveable status**:
- Last publish: ~2 years ago (v0.50.0)
- Peer deps: Originally Angular 8.x
- Risk: May require `--legacy-peer-deps` or custom wrapper

**moveable.js**:
- 10.4k GitHub stars, MIT license
- Last release: v0.53.0 (Dec 2023)
- Issues still active in late 2024

**Recommendation**: Build prototype with vanilla Moveable.js using class-based modules. For Angular 20 production, test ngx-moveable first; if incompatible, convert MoveableController class to Angular service wrapping vanilla library.

---

## Implementation Phases

### Phase 1: AppState Extension (9-Config Model)

**File**: `/media-layout-prototype/js/app.js`

Add to existing AppState object:
```javascript
// Add after existing properties (line ~35)
allConfigs: {
  '1x1': { isCustomized: false, templateId: null, slots: null },
  '2x1': { isCustomized: false, templateId: null, slots: null },
  '3x1': { isCustomized: false, templateId: null, slots: null },
  '1x2': { isCustomized: false, templateId: null, slots: null },
  '2x2': { isCustomized: false, templateId: null, slots: null },
  '3x2': { isCustomized: false, templateId: null, slots: null },
  '1x3': { isCustomized: false, templateId: null, slots: null },
  '2x3': { isCustomized: false, templateId: null, slots: null },
  '3x3': { isCustomized: false, templateId: null, slots: null }
},

previewMaxWidth: 472,

gridSystem: {
  get unitSize() { return AppState.previewMaxWidth / 3; },
  get cols() { return parseInt(AppState.cardSize.split('x')[0]); },
  get rows() { return parseInt(AppState.cardSize.split('x')[1]); },
  get canvasWidth() { return this.cols * this.unitSize; },
  get canvasHeight() { return this.rows * this.unitSize; }
}
```

**New Methods** (Angular-ready pattern):
```javascript
saveConfigForCurrentSize() {
  const sizeKey = this.cardSize;
  this.allConfigs[sizeKey] = {
    isCustomized: true,
    templateId: this.template?.id || null,
    slots: this.slots.map(slot => ({
      ...slot,
      image: { ...slot.image },
      position: { ...slot.position }
    }))
  };
  this._notify('configSaved', { size: sizeKey });
}

loadConfigForSize(sizeKey) {
  const config = this.allConfigs[sizeKey];
  if (config.isCustomized && config.slots) {
    this.slots = config.slots.map(s => ({ ...s }));
    this.template = config.templateId ? getTemplateById(config.templateId) : null;
  }
  // If not customized, keep current slots (derived from template)
}

isConfigCustomized(sizeKey) {
  return this.allConfigs[sizeKey]?.isCustomized || false;
}
```

**Override Save Flow**:
```
User adjusts slot position/scale/rotation
    ↓
AppState.updateSlot() called
    ↓
Change detected → Mark current size as "dirty"
    ↓
User clicks "Save This Size" OR switches card size
    ↓
saveConfigForCurrentSize() stores deep copy to allConfigs[sizeKey]
    ↓
isCustomized = true, purple dot appears on card size button
```

---

### Phase 2: Moveable.js Integration

**Add to `index.html`** (before app.js):
```html
<script src="https://cdn.jsdelivr.net/npm/moveable@0.53.0/dist/moveable.min.js"></script>
```

**New file**: `/media-layout-prototype/js/moveable-controller.js`

```javascript
/**
 * MoveableController - Wraps Moveable.js for AppState integration
 * Designed for easy conversion to Angular service
 */
class MoveableController {
  constructor(options = {}) {
    this.canvasContent = null;
    this.moveable = null;
    this.selectedSlotIndex = -1;
    this.onUpdate = options.onUpdate || (() => {});
  }

  init(canvasContentElement) {
    this.canvasContent = canvasContentElement;
  }

  updateSelection(slotIndex) {
    // Destroy existing instance
    if (this.moveable) {
      this.moveable.destroy();
      this.moveable = null;
    }

    this.selectedSlotIndex = slotIndex;
    if (slotIndex < 0) return;

    const target = this.canvasContent.querySelector(`[data-slot-index="${slotIndex}"]`);
    if (!target) return;

    this.moveable = new Moveable(this.canvasContent, {
      target: target,
      container: this.canvasContent,
      draggable: true,
      scalable: true,
      rotatable: true,
      keepRatio: true,  // Maintain 1:1 aspect for square slots
      renderDirections: ["nw", "ne", "sw", "se"],
      rotationPosition: "top"
    });

    this._attachEventHandlers();
  }

  _attachEventHandlers() {
    const getContainerRect = () => this.canvasContent.getBoundingClientRect();

    this.moveable.on('drag', e => {
      const rect = getContainerRect();
      const xPercent = (e.left / rect.width) * 100;
      const yPercent = (e.top / rect.height) * 100;

      e.target.style.left = `${xPercent}%`;
      e.target.style.top = `${yPercent}%`;

      this.onUpdate(this.selectedSlotIndex, {
        position: { x: xPercent, y: yPercent }
      });
    });

    this.moveable.on('scale', e => {
      const scaleX = e.scale[0];
      this.onUpdate(this.selectedSlotIndex, { scale: scaleX });
    });

    this.moveable.on('rotate', e => {
      this.onUpdate(this.selectedSlotIndex, { rotation: e.rotate });
    });
  }

  updateRect() {
    if (this.moveable) this.moveable.updateRect();
  }

  destroy() {
    if (this.moveable) {
      this.moveable.destroy();
      this.moveable = null;
    }
  }
}

window.MoveableController = MoveableController;
```

---

### Phase 3: Update Existing Templates with Rotation Variants

**File**: `/media-layout-prototype/js/template-strip.js`

**Strategy**: Extend existing TEMPLATES array, don't replace. Add rotation variants to existing templates.

**Add these new templates after existing ones**:
```javascript
// Add to TEMPLATES array (after existing templates)

// Hero Left variants
{
  id: 'hero-left-in',
  name: 'Hero Left',
  variant: 'rotatedIn',
  category: 'horizontal',
  description: 'Hero left, tilted inward',
  slots: [
    { position: { x: 5, y: 10 }, size: 55, scale: 1, rotation: 5, zIndex: 2 },
    { position: { x: 45, y: 25 }, size: 45, scale: 0.9, rotation: -5, zIndex: 1 }
  ],
  supportedSizes: ['21', '22', '23', '31', '32', '33'],
  layoutType: 'horizontal',
  emphasis: 'first',
  imageCount: 2
},
{
  id: 'hero-left-out',
  name: 'Hero Left',
  variant: 'rotatedOut',
  category: 'horizontal',
  description: 'Hero left, tilted outward',
  slots: [
    { position: { x: 5, y: 10 }, size: 55, scale: 1, rotation: -5, zIndex: 2 },
    { position: { x: 45, y: 25 }, size: 45, scale: 0.9, rotation: 5, zIndex: 1 }
  ],
  supportedSizes: ['21', '22', '23', '31', '32', '33'],
  layoutType: 'horizontal',
  emphasis: 'first',
  imageCount: 2
},

// Duo (Side by Side) variants
{
  id: 'hero-duo-in',
  name: 'Side by Side',
  variant: 'rotatedIn',
  category: 'horizontal',
  description: 'Two products tilted toward each other',
  slots: [
    { position: { x: 5, y: 15 }, size: 45, scale: 1, rotation: 5, zIndex: 1 },
    { position: { x: 50, y: 15 }, size: 45, scale: 1, rotation: -5, zIndex: 2 }
  ],
  supportedSizes: ['21', '22', '23', '31', '32', '33'],
  layoutType: 'horizontal',
  emphasis: 'equal',
  imageCount: 2
},
{
  id: 'hero-duo-out',
  name: 'Side by Side',
  variant: 'rotatedOut',
  category: 'horizontal',
  description: 'Two products tilted away from each other',
  slots: [
    { position: { x: 5, y: 15 }, size: 45, scale: 1, rotation: -5, zIndex: 1 },
    { position: { x: 50, y: 15 }, size: 45, scale: 1, rotation: 5, zIndex: 2 }
  ],
  supportedSizes: ['21', '22', '23', '31', '32', '33'],
  layoutType: 'horizontal',
  emphasis: 'equal',
  imageCount: 2
},

// Overlap variants
{
  id: 'hero-overlap-in',
  name: 'Overlap',
  variant: 'rotatedIn',
  category: 'hero',
  description: 'Overlapping, tilted inward',
  slots: [
    { position: { x: 10, y: 5 }, size: 55, scale: 1, rotation: -8, zIndex: 1 },
    { position: { x: 35, y: 30 }, size: 55, scale: 1, rotation: 5, zIndex: 2 }
  ],
  supportedSizes: ['21', '22', '23', '31', '32', '33'],
  layoutType: 'horizontal',
  emphasis: 'equal',
  imageCount: 2
}
```

**Update applyTemplateToState()** to include rotation:
```javascript
// In applyTemplateToState() - update the slot application loop
AppState.slots.forEach((slot, index) => {
  if (template.slots[index]) {
    const templateSlot = template.slots[index];
    AppState.updateSlot(index, {
      position: { ...templateSlot.position },
      size: templateSlot.size,
      scale: templateSlot.scale,
      zIndex: templateSlot.zIndex,
      rotation: templateSlot.rotation || 0  // Apply template rotation
    });
  }
});
```

---

### Phase 4: Preview Width Control

**Location**: Add to Column 4 (Preview column) in Card Size card

**Update in `index.html`** (inside #card-size-selector area):
```html
<!-- Add after card-size-grid -->
<div class="preview-width-section" style="margin-top: var(--spacing-4); padding-top: var(--spacing-4); border-top: 1px solid var(--surface-border);">
  <label class="text-sm font-medium mb-2 block">Preview Width</label>
  <div class="width-control">
    <input type="range" id="width-slider" min="300" max="472" value="472" step="1" class="p-slider-input">
    <span class="width-value" id="width-value">472px</span>
  </div>
  <div class="width-presets" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--spacing-1); margin-top: var(--spacing-2);">
    <button class="width-preset-btn" data-width="300">300</button>
    <button class="width-preset-btn" data-width="360">360</button>
    <button class="width-preset-btn" data-width="414">414</button>
    <button class="width-preset-btn active" data-width="472">472</button>
  </div>
</div>
```

**CSS Transitions** (add to index.html styles):
```css
.preview-card, .preview-slot {
  transition: width 0.3s ease, height 0.3s ease, left 0.3s ease, top 0.3s ease;
}

.preview-slot.dragging {
  transition: box-shadow 0.15s ease;
}
```

---

### Phase 5: Inactive Image State

**New file**: `/media-layout-prototype/js/image-selection-modal.js`

Triggered when: `slots.length > getMaxImages(newSize)`

```javascript
class ImageSelectionModal {
  constructor(options = {}) {
    this.onSelect = options.onSelect || (() => {});
    this.onCancel = options.onCancel || (() => {});
  }

  show(slots, maxAllowed, targetSize) {
    // Create modal, let user check/uncheck images
    // Return array of indices to keep active
  }
}
window.ImageSelectionModal = ImageSelectionModal;
```

Inactive images:
- `slot.active = false` → Hidden in preview
- Preserved in state (not deleted)
- Restored if size increases again

---

### Phase 6: UI Updates (Within Existing Layout)

**Card Size Selector** enhancements (Column 4):
- Purple dot indicator for customized sizes
- Config status badges showing all 9 states

**Add to renderCardSizeSelector()**:
```javascript
// Add customization indicator
const config = AppState.allConfigs[size];
const isCustomized = config?.isCustomized;

return `
  <button class="card-size-btn ${AppState.cardSize === size ? 'card-size-btn--selected' : ''}"
          data-size="${size}">
    ${size}
    ${isCustomized ? '<span class="customized-dot"></span>' : ''}
  </button>
`;
```

**CSS for customized indicator**:
```css
.customized-dot {
  position: absolute;
  top: 3px;
  right: 3px;
  width: 8px;
  height: 8px;
  background: var(--purple, #8b5cf6);
  border-radius: 50%;
}

.card-size-btn {
  position: relative;
}
```

---

## Files to Modify/Create

| File | Action | Changes |
|------|--------|---------|
| `/js/app.js` | Modify | Add allConfigs, gridSystem, save/load methods |
| `/js/moveable-controller.js` | Create | Moveable.js wrapper (Angular-ready class) |
| `/js/image-selection-modal.js` | Create | Image selection prompt for size changes |
| `/js/template-strip.js` | Modify | Add rotation variants to existing templates |
| `/index.html` | Modify | Add Moveable.js CDN, width controls (keep layout) |
| `/css/moveable-overrides.css` | Create | Handle styling, customization indicators |

---

## Data Flow

```
User drags product on canvas
    ↓
Moveable.js emits drag/scale/rotate event (pixels)
    ↓
MoveableController converts to percentages
    ↓
AppState.updateSlot(index, { position, scale, rotation })
    ↓
AppState._notify('slots', data)
    ↓
Subscribers update (sliders, preview, etc.)
```

```
User changes card size (3x2 → 1x1)
    ↓
Auto-save current config: saveConfigForCurrentSize()
    ↓
slots.length > maxImages? → Show ImageSelectionModal
    ↓
User selects which images to keep
    ↓
Mark unselected as active: false
    ↓
Load config for 1x1: loadConfigForSize('1x1')
    ↓
If customized → restore saved slots
If not customized → use template defaults
```

---

## Export Structure (for API)

```json
{
  "promotionId": "promo-2liter-sodas",
  "productType": "bottle-vertical",
  "background": {
    "type": "color",
    "value": "#e8692d"
  },
  "layouts": {
    "1x1": {
      "isCustomized": true,
      "templateId": "single-hero",
      "slots": [
        { "id": "slot-1", "position": { "x": 25, "y": 10 }, "size": 70, "scale": 1, "rotation": 0, "zIndex": 1, "active": true }
      ]
    },
    "2x1": { "isCustomized": false, "templateId": null, "slots": null },
    "3x2": {
      "isCustomized": true,
      "templateId": "hero-left-in",
      "slots": [
        { "id": "slot-1", "position": { "x": 5, "y": 8 }, "size": 55, "scale": 1, "rotation": 5, "zIndex": 2, "active": true },
        { "id": "slot-2", "position": { "x": 50, "y": 12 }, "size": 45, "scale": 1, "rotation": -5, "zIndex": 1, "active": true }
      ]
    }
  },
  "savedAt": "2025-12-18T..."
}
```

---

## Critical Reference Files

| Purpose | Path |
|---------|------|
| Prototype source | `/media-layout-prototype/process/moveable-poc-v5.html` |
| Current app state | `/media-layout-prototype/js/app.js` |
| Templates | `/media-layout-prototype/js/template-strip.js` |
| Constraints | `/media-layout-prototype/process/js/constraints.js` |
| Existing manipulation | `/media-layout-prototype/js/direct-manipulation.js` |
| Current index | `/media-layout-prototype/index.html` |

---

## Grid Math Reference

At `maxWidth = 472px`:
| Card Size | Cols | Rows | Width | Height |
|-----------|------|------|-------|--------|
| 1x1 | 1 | 1 | 157px | 157px |
| 2x1 | 2 | 1 | 314px | 157px |
| 3x1 | 3 | 1 | 472px | 157px |
| 1x2 | 1 | 2 | 157px | 314px |
| 2x2 | 2 | 2 | 314px | 314px |
| 3x2 | 3 | 2 | 472px | 314px |
| 1x3 | 1 | 3 | 157px | 472px |
| 2x3 | 2 | 3 | 314px | 472px |
| 3x3 | 3 | 3 | 472px | 472px |

Formula: `1 unit = maxWidth / 3`

---

## Reference: Current Variables & Editor Cards

### CSS Variables (from tokens.css)
```css
:root {
  /* Colors */
  --primary-color: #3B82F6;
  --surface-card: #ffffff;
  --surface-border: #e5e7eb;
  --surface-ground: #f9fafb;
  --surface-section: #f3f4f6;
  --surface-hover: #f3f4f6;
  --text-color: #1f2937;
  --text-color-secondary: #6b7280;
  --text-color-muted: #9ca3af;

  /* Spacing */
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
  --spacing-6: 1.5rem;

  /* Border Radius */
  --border-radius: 6px;
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 12px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);

  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-base: 0.2s ease;
}
```

### Editor Card Structure (index.html)
```html
<!-- Collapsible Editor Card Pattern -->
<div class="editor-card editor-card--collapsible editor-card--open" id="[card-id]">
  <button class="editor-card__header editor-card__header--toggle"
          aria-expanded="true"
          aria-controls="[content-id]">
    <h3 class="editor-card__title">[Title]</h3>
    <svg class="editor-card__chevron" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M4 6l4 4 4-4H4z"/>
    </svg>
  </button>
  <div class="editor-card__body editor-card__body--collapsible" id="[content-id]">
    <!-- Card content -->
  </div>
</div>
```

### 4-Column Layout Structure
```html
<div class="content-grid content-grid--4col">
  <!-- Column 1: Background -->
  <div class="editor-column editor-column--background">
    <div class="editor-card" id="bg-color-card">...</div>
    <div class="editor-card" id="bg-image-card">...</div>
  </div>

  <!-- Column 2: Templates + Hero Image -->
  <div class="editor-column editor-column--templates">
    <div class="editor-card" id="hero-templates-card">...</div>
    <div class="editor-card" id="hero-image-card">...</div>
  </div>

  <!-- Column 3: Adjustments -->
  <div class="editor-column editor-column--adjustments">
    <div class="editor-card" id="hero-adjustments-card">...</div>
  </div>

  <!-- Column 4: Preview + Card Size -->
  <div class="editor-column editor-column--preview">
    <div class="editor-card">Preview</div>
    <div class="editor-card">Card Size</div>
  </div>
</div>
```

### AppState Core Properties
```javascript
const AppState = {
  cardSize: '2x2',           // Current card size
  layout: 'horizontal',       // Layout type
  emphasis: 'equal',          // Emphasis style
  template: null,             // Selected template object
  imageCount: 2,              // Target image count (1-5)
  background: {               // Shared across all sizes
    type: 'color',
    value: '#ffffff',
    position: 'center center',
    size: 'cover',
    repeat: 'no-repeat'
  },
  slots: [],                  // Array of slot objects
  selectedSlotIndex: -1,      // Currently selected slot
  _subscribers: []            // Observer pattern subscribers
};
```

### Slot Object Structure
```javascript
const slot = {
  id: 'slot-123',
  image: {
    id: 'sample-0',
    name: 'Product Name',
    url: 'path/to/image.png'
  },
  position: { x: 10, y: 10 },  // Percentage from top-left
  size: 50,                     // % of container (SQUARE: width = height)
  scale: 1.0,                   // Transform scale (0.3 - 1.5)
  rotation: 0,                  // Degrees (-45 to 45)
  zIndex: 1,                    // Layer order (1 = back)
  active: true                  // NEW: false = hidden but preserved
};
```
