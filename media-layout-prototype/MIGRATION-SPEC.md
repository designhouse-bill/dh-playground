# Media Layout Prototype - Migration Specification

This document provides complete specifications for migrating the media-layout prototype to Angular in the ideal-sale-circular production codebase.

**Prototype Location:** `/Users/billklingensmith/Code/mydarndest-playground/media-layout-prototype/`
**Production Destination:** `/Users/billklingensmith/Code/ideal-sale-circular/src/app/content/components/media-layout/`

---

## Table of Contents

1. [Feature Overview](#feature-overview)
2. [Core Features](#core-features)
3. [State Management](#state-management)
4. [Data Models](#data-models)
5. [Component Architecture](#component-architecture)
6. [User Flows](#user-flows)
7. [Keyboard Shortcuts](#keyboard-shortcuts)
8. [Dependencies](#dependencies)
9. [Migration Checklist](#migration-checklist)

---

## Feature Overview

The Media Layout feature allows users to configure hero image layouts for promotional cards. It supports:

- **9 card sizes** with independent layout configurations
- **1-5 images** per card with drag/scale/rotate manipulation
- **Template presets** for quick layout application
- **Background color/image** with positioning controls
- **Live preview** with responsive width testing

### Key Innovation: 9-Config Model

Each of the 9 card sizes (1x1 through 3x3) stores its own independent layout configuration. Switching between sizes preserves customizations for each size.

---

## Core Features

### 1. Card Size System

**9 Configurations:**
```
1x1 (max 2 images)  |  2x1 (max 3 images)  |  3x1 (max 4 images)
1x2 (max 2 images)  |  2x2 (max 4 images)  |  3x2 (max 5 images)
1x3 (max 2 images)  |  2x3 (max 4 images)  |  3x3 (max 5 images)
```

**Size Constraints (from constraints.js):**
- `getMaxImages(size)` - Returns maximum allowed images
- When switching to a smaller size, excess images become "inactive"
- User can choose which images to keep via modal

### 2. Hero Image Slots

Each slot contains:
```javascript
{
  id: string,           // Unique identifier
  image: {
    url: string,        // Image URL
    name: string        // Display name
  },
  position: {
    x: number,          // Percentage (0-100) from left
    y: number           // Percentage (0-100) from top
  },
  size: number,         // Percentage of container (creates square)
  scale: number,        // Transform scale (0.1 - 2.0)
  rotation: number,     // Degrees (-180 to 180)
  zIndex: number,       // Layer order
  active: boolean       // Whether visible (for constraint handling)
}
```

### 3. Template System

Templates define preset slot arrangements:
```javascript
{
  id: string,
  name: string,
  category: string,     // 'hero', 'grid', 'lifestyle'
  slots: [{
    position: { x, y },
    size: number,
    scale: number,
    zIndex: number
  }],
  supportedSizes: string[],  // ['11', '22', '33', ...]
  layoutType: string,        // 'horizontal', 'vertical', 'grid'
  emphasis: string,          // 'equal', 'left', 'right', 'center'
  imageCount: number,        // 1-5
  popular: boolean
}
```

### 4. Background Manager

```javascript
background: {
  type: 'color' | 'image',
  value: string,              // Color hex or image URL
  position: string,           // CSS background-position
  size: string,               // 'cover', 'contain', 'auto', etc.
  repeat: string,             // 'no-repeat', 'repeat', etc.
  color: string               // Background color (even with image)
}
```

**Category Color Presets:**
- Produce: `#4CAF50`, `#8BC34A`
- Meat: `#D32F2F`, `#FFCDD2`
- Dairy: `#2196F3`, `#BBDEFB`
- Bakery: `#795548`, `#D7CCC8`
- Beverages: `#9C27B0`, `#E1BEE7`
- Neutral: `#F5F5F5`, `#EEEEEE`, `#E0E0E0`

### 5. Drag/Scale/Rotate (Moveable.js)

**Capabilities:**
- Drag: Reposition slots within container
- Scale: 10% - 200% (pinch or handles)
- Rotate: -180° to 180° (rotation handle)
- Constrained to container bounds

---

## State Management

### AppState Object

```javascript
const AppState = {
  // Current Configuration
  cardSize: '2x2',           // Current size
  layout: 'horizontal',       // Layout type
  emphasis: 'equal',          // Emphasis mode
  template: null,             // Current template object
  imageCount: 1,              // Target image count

  // Background
  background: { type, value, position, size, repeat, color },

  // Slots
  slots: [],                  // Array of slot objects
  selectedSlotIndex: -1,      // Currently selected

  // Sample Images
  sampleImages: [],           // Available images

  // UI State
  panelState: 'collapsed',    // 'collapsed', 'quick', 'advanced'
  previewMaxWidth: 472,       // Responsive preview width

  // 9-Config Model
  allConfigs: {
    '1x1': { isCustomized, templateId, slots },
    '2x2': { isCustomized, templateId, slots },
    // ... all 9 sizes
  },
  _dirtyConfigs: new Set(),   // Sizes with user modifications

  // Methods
  subscribe(callback),
  _notify(changeType, data),
  saveConfigForCurrentSize(),
  loadConfigForSize(sizeKey),
  isConfigCustomized(sizeKey),
  markCurrentConfigDirty(),
  clearConfigDirty(sizeKey),
  setPreviewMaxWidth(width),
  setCardSize(size, skipModal),
  setLayout(layout),
  setEmphasis(emphasis),
  setTemplate(template),
  setImageCount(count),
  setBackground(background),
  addSlot(slot),
  removeSlot(index),
  updateSlot(index, updates),
  selectSlot(index),
  clearSelection(),
  reorderSlots(fromIndex, toIndex),
  bringForward(index),
  sendBackward(index),
  bringToFront(index),
  sendToBack(index),
  exportConfig(),
  importConfig(config)
}
```

### Angular Migration: Service Pattern

```typescript
// media-layout.service.ts
@Injectable({ providedIn: 'root' })
export class MediaLayoutService {
  // State as BehaviorSubjects
  private cardSize$ = new BehaviorSubject<string>('2x2');
  private slots$ = new BehaviorSubject<Slot[]>([]);
  private background$ = new BehaviorSubject<Background>(defaultBackground);
  private selectedSlotIndex$ = new BehaviorSubject<number>(-1);
  private allConfigs$ = new BehaviorSubject<Record<string, Config>>({});

  // Public observables
  cardSize = this.cardSize$.asObservable();
  slots = this.slots$.asObservable();
  // ...

  // Methods remain similar but use RxJS
  setCardSize(size: string): void { ... }
  updateSlot(index: number, updates: Partial<Slot>): void { ... }
}
```

---

## Data Models

### TypeScript Interfaces

```typescript
// media-layout.dto.ts

export interface Position {
  x: number;  // Percentage 0-100
  y: number;  // Percentage 0-100
}

export interface ImageRef {
  url: string;
  name: string;
}

export interface Slot {
  id: string;
  image: ImageRef;
  position: Position;
  size: number;       // Percentage of container
  scale: number;      // 0.1 - 2.0
  rotation: number;   // -180 to 180
  zIndex: number;
  active: boolean;
}

export interface Background {
  type: 'color' | 'image';
  value: string;
  position: string;
  size: string;
  repeat: string;
  color: string;
}

export interface LayoutConfig {
  isCustomized: boolean;
  templateId: string | null;
  slots: Slot[] | null;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  slots: Partial<Slot>[];
  supportedSizes: string[];
  layoutType: 'horizontal' | 'vertical' | 'grid';
  emphasis: 'equal' | 'left' | 'right' | 'center';
  imageCount: number;
  popular: boolean;
}

export interface MediaLayoutState {
  cardSize: string;
  layout: string;
  emphasis: string;
  template: Template | null;
  imageCount: number;
  background: Background;
  slots: Slot[];
  selectedSlotIndex: number;
  allConfigs: Record<string, LayoutConfig>;
}

export type CardSize = '1x1' | '2x1' | '3x1' | '1x2' | '2x2' | '3x2' | '1x3' | '2x3' | '3x3';
```

---

## Component Architecture

### Component Tree

```
MediaLayoutComponent (container)
├── HeaderComponent
│   ├── PromoContextDisplay
│   ├── NavigationButtons (prev/next)
│   └── DevToolsDropdown
├── EditorPanelComponent
│   ├── BackgroundChooserComponent
│   │   ├── ColorSwatches
│   │   └── ImageUploader
│   ├── TemplateStripComponent
│   │   └── TemplateThumbnail (x6)
│   ├── AdjustmentsComponent
│   │   ├── CardSizeSelector (3x3 grid)
│   │   ├── SlotControls
│   │   │   ├── PositionSliders (X, Y)
│   │   │   ├── ScaleSlider
│   │   │   └── RotationSlider
│   │   └── ZIndexButtons
│   └── MediaListComponent
│       └── MediaListItem (draggable)
└── PreviewComponent
    ├── PreviewCanvas
    │   └── SlotElement (with Moveable)
    └── WidthSlider
```

### File Mapping

| Prototype File | Angular Component | Purpose |
|----------------|-------------------|---------|
| `app.js` (AppState) | `MediaLayoutService` | State management |
| `template-strip.js` | `TemplateStripComponent` | Template selection UI |
| `layout-panel.js` | `LayoutPanelComponent` | Slide-up panel container |
| `background-chooser.js` | `BackgroundChooserComponent` | Background color/image |
| `moveable-controller.js` | `MoveableDirective` | Drag/scale/rotate |
| `image-selection-modal.js` | `ImageSelectionDialogComponent` | Image picker modal |
| `preview-v2.js` | `PreviewComponent` | Live preview rendering |
| `media-list.js` | `MediaListComponent` | Draggable image list |
| `constraints.js` | `constraints.util.ts` | Size constraint logic |
| `templates.js` | `templates.data.ts` | Template definitions |

---

## User Flows

Reference: `process/USER-FLOW-SCENARIOS_2025-12-22.md`

### Primary Flows (10/10 efficiency rating)

1. **Quick Template Apply** (B1)
   - User opens panel via prompt card
   - Clicks template thumbnail
   - Layout applies immediately
   - Panel auto-closes (optional)

2. **Direct Size Change** (D1)
   - User clicks size in 3x3 grid
   - Config saves automatically
   - New size config loads
   - Preview updates

3. **Keyboard Shortcuts** (E1, E2)
   - `Cmd/Ctrl + M` - Toggle panel
   - `Cmd/Ctrl + 1` - Half view
   - `Cmd/Ctrl + 2` - Full view
   - `Escape` - Close panel

### Key Interactions

1. **Slot Selection**
   - Click slot in preview → highlights with blue border
   - Shows adjustment controls for that slot
   - Click outside → deselects

2. **Drag/Scale/Rotate**
   - Drag: Click and drag slot
   - Scale: Drag corner handles
   - Rotate: Drag rotation handle (top)
   - All changes mark config as "dirty" (purple dot)

3. **Size Change with Constraint**
   - Switching to smaller size with too many images
   - Shows modal: "Select X images to keep"
   - User picks which images stay active

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + M` | Toggle layout panel |
| `Cmd/Ctrl + 1` | Panel half view (55vh) |
| `Cmd/Ctrl + 2` | Panel full view (95vh) |
| `Escape` | Close panel |
| `1-6` | Quick select template 1-6 |
| `Delete/Backspace` | Remove selected slot |
| `Arrow Keys` | Nudge selected slot |

---

## Dependencies

### External Libraries

| Library | Version | Purpose | Angular Alternative |
|---------|---------|---------|---------------------|
| Moveable.js | 0.53.0 | Drag/scale/rotate | `ngx-moveable` or custom directive |
| - | - | - | - |

### PrimeNG Components Used

- `p-card` - Editor sections
- `p-button` - Actions
- `p-slider` - Position/scale/rotation controls
- `p-dropdown` - Size selector
- `p-dialog` - Image selection modal
- `p-colorPicker` - Background color
- `p-fileUpload` - Background image upload

---

## Migration Checklist

### Phase 1: Setup
- [ ] Create feature module: `MediaLayoutModule`
- [ ] Create service: `MediaLayoutService`
- [ ] Define TypeScript interfaces in `media-layout.dto.ts`
- [ ] Port constraints logic to `constraints.util.ts`
- [ ] Port template definitions to `templates.data.ts`

### Phase 2: Core Components
- [ ] `MediaLayoutComponent` (container)
- [ ] `PreviewComponent` with slot rendering
- [ ] `MoveableDirective` for drag/scale/rotate
- [ ] `BackgroundChooserComponent`
- [ ] `TemplateStripComponent`

### Phase 3: Editor Components
- [ ] `LayoutPanelComponent` (slide-up panel)
- [ ] `AdjustmentsComponent` (sliders, controls)
- [ ] `MediaListComponent` (draggable list)
- [ ] `ImageSelectionDialogComponent`

### Phase 4: Integration
- [ ] Wire up state management with RxJS
- [ ] Connect to backend API (if applicable)
- [ ] Add routing and lazy loading
- [ ] Implement keyboard shortcuts

### Phase 5: Polish
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add unit tests
- [ ] Add accessibility (ARIA labels)
- [ ] Performance optimization (OnPush)

---

## API Integration (Future)

The prototype uses local state. Production will need:

```typescript
// Endpoints (proposed)
GET    /api/promotions/:id/media-layout
PUT    /api/promotions/:id/media-layout
POST   /api/media/upload
GET    /api/media/library
```

```typescript
// Service methods
loadLayout(promotionId: string): Observable<MediaLayoutState>
saveLayout(promotionId: string, state: MediaLayoutState): Observable<void>
uploadImage(file: File): Observable<ImageRef>
getMediaLibrary(): Observable<ImageRef[]>
```

---

## Related Documents

- `ANGULAR-MAPPING.md` - Detailed component conversion guide
- `PRIMENG-TOKENS.md` - Design token reference
- `PRIMENG-COMPONENTS.md` - PrimeNG component patterns
- `process/USER-FLOW-SCENARIOS_2025-12-22.md` - Complete user flow documentation
- `process/UI-UX-INTEGRATION-PLAN.md` - UX strategy
