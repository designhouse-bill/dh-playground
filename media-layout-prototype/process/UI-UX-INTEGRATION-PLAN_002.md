# Media Layout Integration: User Flow Implementation Plan

**Created**: December 21, 2025
**Status**: Ready for Implementation
**Previous Document**: UI-UX-INTEGRATION-PLAN.md
**Focus**: Data Grid → Media Layout User Flow Navigation

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Key Context: Row Selection](#key-context-row-selection)
3. [User Flow Diagrams](#user-flow-diagrams)
4. [Implementation Phases](#implementation-phases)
5. [Phase 1: Footer Tab Infrastructure](#phase-1-footer-tab-infrastructure)
6. [Phase 2: Editor Panel Navigation Links](#phase-2-editor-panel-navigation-links)
7. [Phase 3: Media Repository Navigation Link](#phase-3-media-repository-navigation-link)
8. [Phase 4: Media Layout Panel Shell](#phase-4-media-layout-panel-shell)
9. [Phase 5: Prototype Integration](#phase-5-prototype-integration)
10. [File Reference](#file-reference)
11. [Mockups](#mockups)

---

## Executive Summary

This document details the implementation plan for creating user flow navigation from the Promotions Data Grid to the Media Layout functionality. The key insight is that **selecting a row (Promotion) in the data grid establishes the context** for all subsequent panel operations.

### Three Primary User Flows

| Flow | Path | User Goal |
|------|------|-----------|
| **A** | Data Grid → Editor → Media Layout | Edit promotion, then customize layout |
| **B** | Data Grid → Media Layout (direct) | Go straight to layout customization |
| **C** | Data Grid → Editor → Media Repo → Media Layout | Change media, then customize layout |

### Critical Constraint

**Media Layout tab is DISABLED when multiple promotions are selected.**
Only a single promotion can be edited in Media Layout at a time.

---

## Key Context: Row Selection

### How Context is Established

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  DATA GRID                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ [☐] │ TITLE              │ SIZE  │ PRICE   │ UTILITIES               │   │
│  │ [☐] │ Long Drink         │ 1×2   │ $11.99  │ [⟳][↗][👁][✏ Edit]     │   │
│  │ [☐] │ Powerade           │ 3×2   │ $8.49   │ [⟳][↗][👁][✏ Edit]     │   │
│  │ [☑] │ Coca-Cola Products │ 1×1   │ $9      │ [⟳][↗][👁][✏ Edit] ◄── │   │
│  │ [☐] │ Pepsi Products     │ 3×2   │ $1.99   │ [⟳][↗][👁][✏ Edit]     │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  (1 Selected) ◄── Selection count shown in header                           │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ [Editor ▾] [Media ▾] [Media Layout ▾] [Promotions ▾] [Categories ▾]  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Selection States

| State | Footer Behavior |
|-------|-----------------|
| **No selection** | All tabs disabled except navigation |
| **Single selection (checkbox or row click)** | All tabs enabled, including Media Layout |
| **Multiple selection (2+ checkboxes)** | Media Layout tab DISABLED with tooltip |
| **Edit button clicked** | Opens footer modal, Editor tab active |

### Context Passing

When a promotion is selected, the following context is passed to all panels:

```typescript
interface PromotionContext {
  contentHash: string;         // Unique promotion ID
  brandHash: string;           // Brand context
  nodeHash: string;            // Node context
  promotionData: ContentData;  // Full promotion record
  mediaHref: string;           // Current hero image
  backgroundColor: string;     // Current background
  cardSize: string;            // Current size (e.g., "1x1")
}
```

---

## User Flow Diagrams

### Flow A: Editor → Media Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     FLOW A: EDITOR → MEDIA LAYOUT                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌───────────┐      ┌───────────┐      ┌───────────┐      ┌───────────┐   │
│   │ DATA GRID │ ──►  │  EDITOR   │ ──►  │  MEDIA    │ ──►  │  EDITOR   │   │
│   │           │      │   Tab     │      │  LAYOUT   │      │   Tab     │   │
│   └───────────┘      └───────────┘      └───────────┘      └───────────┘   │
│        │                  │                  │                  │           │
│   Select promo      Click "Update     Customize layout    Click "Editor"   │
│   + Click Edit      Media Layout →"    (drag/scale/       tab to return    │
│        │                  │             rotate images)          │           │
│        ▼                  ▼                  │                  ▼           │
│   Footer modal      Media Layout       Auto-saves         See updated      │
│   opens             tab activates      changes            preview          │
│                                                                              │
│   ─────────────────────────────────────────────────────────────────────────  │
│   Total: 4 clicks  |  Entry: "Update Media Layout →" link in Editor        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Flow B: Direct Media Layout Access

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FLOW B: DIRECT MEDIA LAYOUT ACCESS                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────┐      ┌─────────────────────┐      ┌───────────┐   │
│   │     DATA GRID       │ ──►  │    MEDIA LAYOUT     │ ──►  │   CLOSE   │   │
│   │                     │      │       Tab           │      │           │   │
│   │ [☑] Select promo    │      │  (fullscreen)       │      │ Back to   │   │
│   └─────────────────────┘      └─────────────────────┘      │ grid      │   │
│           │                            │                    └───────────┘   │
│     1. Select promo             2. Click "Media              3. Click Close │
│        (single only)               Layout" in footer            when done   │
│                                                                              │
│   ─────────────────────────────────────────────────────────────────────────  │
│   CONSTRAINT: Media Layout tab disabled if multiple promotions selected     │
│               Tooltip: "Select a single promotion to edit layout"           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Flow C: Media Repo → Media Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   FLOW C: MEDIA REPO → MEDIA LAYOUT                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐           │
│  │  DATA   │► │ EDITOR  │► │  MEDIA  │► │  MEDIA  │► │ EDITOR  │           │
│  │  GRID   │  │  Tab    │  │  REPO   │  │ LAYOUT  │  │  Tab    │           │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘           │
│       │            │            │            │            │                 │
│  Click Edit   Click "Change  Click image   Click "Media  Click "Editor"   │
│  on promo     Media"         (auto-saves)  Layout" tab   when done        │
│                                  │                                          │
│                             OR click                                        │
│                             "Customize in                                   │
│                              Media Layout →"                                │
│                                                                              │
│   ─────────────────────────────────────────────────────────────────────────  │
│   Combines media selection with layout customization in one flow            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase Overview

```
Phase 1: Footer Tab Infrastructure
    │
    ▼
Phase 2: Editor Panel Navigation Links
    │
    ▼
Phase 3: Media Repository Navigation Link
    │
    ▼
Phase 4: Media Layout Panel Shell (placeholder)
    │
    ▼
Phase 5: Prototype Integration (canvas, templates, etc.)
```

### Dependencies

- Phase 2 depends on Phase 1 (need tab to navigate to)
- Phase 3 depends on Phase 1 (need tab to navigate to)
- Phase 4 depends on Phase 1 (tab must exist)
- Phase 5 depends on Phase 4 (shell must exist)

---

## Phase 1: Footer Tab Infrastructure

**Goal**: Add "Media Layout" tab to footer navigation with enable/disable logic.

### Files to Modify

| File | Path | Changes |
|------|------|---------|
| `bottom-menu.service.ts` | `/src/app/core/services/` | Add `media-layout` to panel types |
| `bottom-menu.component.ts` | `/src/app/shared/components/media-content/bottom-menu/` | Add MenuItem for Media Layout |
| `bottom-menu.component.html` | Same | Add tab button with disabled state |
| `bottom-menu.component.scss` | Same | Add disabled tooltip styles |

### Service Changes

```typescript
// bottom-menu.service.ts

// Extend panel type union
type PanelType = 'editor' | 'media' | 'media-layout' | 'promotions' | 'categories';

// Add property
selectedPanel: PanelType = 'editor';

// Add method
openMediaLayout(): void {
  if (this.canOpenMediaLayout()) {
    this.selectedPanel = 'media-layout';
    this.isFullScreen = true;
  }
}

// Add validation
canOpenMediaLayout(): boolean {
  // Only allow when single promotion selected
  return this.selectedPromotions.length === 1;
}
```

### Component Changes

```typescript
// bottom-menu.component.ts

menuItems: MenuItem[] = [
  { id: 'editor', label: 'Editor', icon: 'pi pi-pencil', fullscreen: true },
  { id: 'media', label: 'Media', icon: 'pi pi-image', fullscreen: true },
  {
    id: 'media-layout',
    label: 'Media Layout',
    icon: 'pi pi-th-large',  // Grid icon
    fullscreen: true,
    disabled: () => this.selectedPromotions.length !== 1,
    tooltip: 'Select a single promotion to edit layout'
  },
  { id: 'promotions', label: 'Promotions', icon: 'pi pi-tag', fullscreen: false },
  { id: 'categories', label: 'Categories', icon: 'pi pi-folder', fullscreen: false }
];
```

### Template Changes

```html
<!-- bottom-menu.component.html -->

<ng-container *ngFor="let item of menuItems">
  <button
    class="footer-tab"
    [class.footer-tab--active]="selectedPanel === item.id"
    [class.footer-tab--disabled]="item.disabled?.()"
    [disabled]="item.disabled?.()"
    [pTooltip]="item.disabled?.() ? item.tooltip : null"
    tooltipPosition="top"
    (click)="selectPanel(item.id)">
    <i [class]="item.icon"></i>
    <span>{{ item.label }}</span>
  </button>
</ng-container>
```

### Acceptance Criteria

- [ ] Media Layout tab visible in footer tab bar
- [ ] Tab is ENABLED when exactly 1 promotion is selected
- [ ] Tab is DISABLED when 0 or 2+ promotions are selected
- [ ] Disabled state shows tooltip on hover
- [ ] Clicking enabled tab opens placeholder panel

---

## Phase 2: Editor Panel Navigation Links

**Goal**: Add navigation links in Editor panel to access Media Layout.

### Files to Modify

| File | Path | Changes |
|------|------|---------|
| `content-editor.component.ts` | `/src/app/shared/components/media-content/content-editor/` | Add navigation method |
| `content-editor.component.html` | Same | Add links to Media/Background sections |
| `content-editor.component.scss` | Same | Style navigation links |

### Media Section Changes

**Current State** (from screenshot 002):
```
┌────────────────────────────────────┐
│ Media                              │
│ ────────────────────────────────── │
│ ┌────────┐  coca cola products.jpg │
│ │  img   │                         │
│ └────────┘  [Change Media] [🗑]    │
└────────────────────────────────────┘
```

**New State**:
```
┌────────────────────────────────────┐
│ Media                              │
│ ────────────────────────────────── │
│ ┌────────┐  coca cola products.jpg │
│ │  img   │                         │
│ └────────┘  [Change Media] [🗑]    │
│                                    │
│ ─────────────────────────────────  │
│ [Update Media Layout →]            │
└────────────────────────────────────┘
```

### Background Section Changes

**Current State** (from screenshot 002):
- Full color picker with RGBA inputs
- Background image selector
- Position/Size/Repeat dropdowns

**New State** (Read-Only):
```
┌────────────────────────────────────┐
│ Background                         │
│ ────────────────────────────────── │
│                                    │
│ Color: ██ #E86930                  │
│                                    │
│ Image: (none)                      │
│                                    │
│ ─────────────────────────────────  │
│ [Edit in Media Layout →]           │
└────────────────────────────────────┘
```

### Component Changes

```typescript
// content-editor.component.ts

navigateToMediaLayout(): void {
  // Emit event to parent (bottom-menu) to switch tabs
  this.bottomMenuService.openMediaLayout();
}
```

### Template Changes

```html
<!-- content-editor.component.html -->

<!-- In Media Section (after existing media picker) -->
<div class="media-section__footer">
  <p-divider></p-divider>
  <button
    pButton
    type="button"
    class="p-button-text p-button-sm"
    (click)="navigateToMediaLayout()"
    [disabled]="!canNavigateToMediaLayout()">
    Update Media Layout
    <i class="pi pi-arrow-right ml-2"></i>
  </button>
</div>

<!-- In Background Section (replace existing controls) -->
<div class="background-section--readonly">
  <div class="background-row">
    <span class="background-label">Color</span>
    <div class="background-value">
      <span class="color-swatch" [style.background-color]="form?.backgroundColor?.value || '#FFFFFF'"></span>
      <span class="color-hex">{{ form?.hexCode?.value || '#FFFFFF' }}</span>
    </div>
  </div>
  <div class="background-row">
    <span class="background-label">Image</span>
    <span class="background-value">{{ form?.backgroundImageName?.value || '(none)' }}</span>
  </div>
  <p-divider></p-divider>
  <button
    pButton
    type="button"
    class="p-button-text p-button-sm"
    (click)="navigateToMediaLayout()">
    Edit in Media Layout
    <i class="pi pi-arrow-right ml-2"></i>
  </button>
</div>
```

### Acceptance Criteria

- [ ] "Update Media Layout →" link appears in Media section
- [ ] "Edit in Media Layout →" link appears in Background section
- [ ] Background section displays read-only values (color swatch + hex, image name)
- [ ] Background editing controls are removed/hidden
- [ ] Clicking either link navigates to Media Layout tab

---

## Phase 3: Media Repository Navigation Link

**Goal**: Add "Customize in Media Layout" link to Media Repository preview panel.

### Files to Modify

| File | Path | Changes |
|------|------|---------|
| `media-repository-layout.component.ts` | `/src/app/shared/components/media-content/media-repository-layout/` | Add navigation method |
| `media-repository-layout.component.html` | Same | Add link in preview panel |

### Preview Panel Changes

**Current State** (from screenshot 003):
```
┌─────────────────────────────────────┐
│ Preview Promotion                   │
│ ─────────────────────────────────── │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │  Hero Image                     │ │
│ │  ┌────┐ coca cola products 6pk  │ │
│ │  │    │ [Replace] [X]           │ │
│ │  └────┘                         │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │  Background Image               │ │
│ │  ┌────┐ -                       │ │
│ │  │    │ [Replace] [X]           │ │
│ │  └────┘                         │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**New State**:
```
┌─────────────────────────────────────┐
│ Preview Promotion                   │
│ ─────────────────────────────────── │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │  Hero Image                     │ │
│ │  ┌────┐ coca cola products 6pk  │ │
│ │  │    │ [Replace] [X]           │ │
│ │  └────┘                         │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │  Background Image               │ │
│ │  ┌────┐ -                       │ │
│ │  │    │ [Replace] [X]           │ │
│ │  └────┘                         │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ─────────────────────────────────── │
│ [Customize in Media Layout →]       │
└─────────────────────────────────────┘
```

### Template Changes

```html
<!-- media-repository-layout.component.html -->

<!-- At bottom of preview panel -->
<p-divider></p-divider>
<button
  pButton
  type="button"
  class="p-button-text p-button-sm w-full"
  (click)="customizeInMediaLayout()">
  Customize in Media Layout
  <i class="pi pi-arrow-right ml-2"></i>
</button>
```

### Component Changes

```typescript
// media-repository-layout.component.ts

customizeInMediaLayout(): void {
  this.bottomMenuService.openMediaLayout();
}
```

### Acceptance Criteria

- [ ] "Customize in Media Layout →" link appears below Background Image row
- [ ] Link spans full width of preview panel
- [ ] Clicking link navigates to Media Layout tab

---

## Phase 4: Media Layout Panel Shell

**Goal**: Create placeholder Media Layout component that receives promotion context.

### Files to Create

| File | Path |
|------|------|
| `media-layout.component.ts` | `/src/app/shared/components/media-content/media-layout/` |
| `media-layout.component.html` | Same |
| `media-layout.component.scss` | Same |
| `media-layout.module.ts` | Same |

### Component Structure

```typescript
// media-layout.component.ts

@Component({
  selector: 'dh-media-layout',
  templateUrl: './media-layout.component.html',
  styleUrls: ['./media-layout.component.scss']
})
export class MediaLayoutComponent implements OnInit, OnDestroy {

  // Inputs from parent
  @Input() record: ContentData[];
  @Input() brandHash: string;
  @Input() nodeHash: string;

  // State
  promotionName: string = '';
  categoryName: string = '';
  currentIndex: number = 0;
  totalCount: number = 0;

  constructor(
    private bottomMenuService: BottomMenuService
  ) {}

  ngOnInit(): void {
    this.loadPromotionContext();
  }

  loadPromotionContext(): void {
    if (this.record?.length === 1) {
      const promo = this.record[0];
      this.promotionName = promo.data?.title || 'Untitled Promotion';
      this.categoryName = promo.data?.category || '';
    }
  }

  navigatePrevious(): void {
    this.bottomMenuService.navigationPromotion.emit('previous');
  }

  navigateNext(): void {
    this.bottomMenuService.navigationPromotion.emit('next');
  }

  close(): void {
    this.bottomMenuService.closePanel();
  }
}
```

### Template Structure

```html
<!-- media-layout.component.html -->

<div class="media-layout">
  <!-- Header -->
  <header class="media-layout__header">
    <div class="header-left">
      <div class="header-brand">
        <i class="pi pi-th-large"></i>
        <h1>Media Layout</h1>
      </div>
      <div class="header-context">
        <h2 class="promo-name">{{ promotionName }}</h2>
        <span class="category-name">{{ categoryName }}</span>
      </div>
    </div>

    <div class="header-nav">
      <button pButton class="p-button-text" (click)="navigatePrevious()">
        <i class="pi pi-chevron-left"></i>
        <span>Previous</span>
      </button>
      <span class="nav-current">{{ currentIndex }} of {{ totalCount }}</span>
      <button pButton class="p-button-text" (click)="navigateNext()">
        <span>Next</span>
        <i class="pi pi-chevron-right"></i>
      </button>
    </div>

    <div class="header-right">
      <button pButton class="p-button-text" (click)="close()">
        <i class="pi pi-times"></i>
      </button>
    </div>
  </header>

  <!-- Content: 4-Column Layout -->
  <div class="media-layout__content">
    <div class="content-grid content-grid--4col">

      <!-- Column 1: Background -->
      <div class="editor-column">
        <p-card header="Background Color">
          <p class="text-muted">Coming in Phase 5...</p>
        </p-card>
        <p-card header="Background Image">
          <p class="text-muted">Coming in Phase 5...</p>
        </p-card>
      </div>

      <!-- Column 2: Templates + Hero Images -->
      <div class="editor-column">
        <p-card header="Hero Templates">
          <p class="text-muted">Coming in Phase 5...</p>
        </p-card>
        <p-card header="Hero Image">
          <p class="text-muted">Coming in Phase 5...</p>
        </p-card>
      </div>

      <!-- Column 3: Adjustments -->
      <div class="editor-column">
        <p-card header="Hero Adjustments">
          <p class="text-muted">Coming in Phase 5...</p>
        </p-card>
      </div>

      <!-- Column 4: Preview + Card Size -->
      <div class="editor-column">
        <p-card header="Preview">
          <div class="preview-placeholder">
            <i class="pi pi-image" style="font-size: 3rem; color: var(--surface-400);"></i>
            <p class="text-muted mt-3">Canvas will render here</p>
          </div>
        </p-card>
        <p-card header="Card Size">
          <div class="card-size-grid">
            <button *ngFor="let size of cardSizes"
                    class="card-size-btn"
                    [class.selected]="selectedSize === size">
              {{ size }}
            </button>
          </div>
        </p-card>
      </div>

    </div>
  </div>
</div>
```

### Styles

```scss
// media-layout.component.scss

.media-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--surface-ground);
}

.media-layout__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: var(--surface-card);
  border-bottom: 1px solid var(--surface-border);
}

.media-layout__content {
  flex: 1;
  padding: 1.5rem;
  overflow: auto;
}

.content-grid--4col {
  display: flex;
  gap: 1.5rem;
}

.editor-column {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card-size-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.card-size-btn {
  padding: 0.5rem;
  border: 1px solid var(--surface-border);
  border-radius: var(--border-radius);
  background: var(--surface-card);
  cursor: pointer;

  &.selected {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
  }
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  background: var(--surface-hover);
  border-radius: var(--border-radius);
}
```

### Acceptance Criteria

- [ ] Media Layout component renders when tab is selected
- [ ] Header shows promotion name and category
- [ ] Previous/Next navigation works
- [ ] Close button returns to data grid
- [ ] 4-column layout displays placeholder cards
- [ ] Card Size grid shows all 9 sizes (1x1 through 3x3)

---

## Phase 5: Prototype Integration

**Goal**: Port Moveable.js canvas and state management from prototype.

### Sub-Phases

| Sub-Phase | Focus | Estimated Effort |
|-----------|-------|------------------|
| 5a | Create MediaLayoutService with 9-Config model | 4-6 hours |
| 5b | Create MoveableService wrapper | 4-6 hours |
| 5c | Port template definitions and TemplateStrip component | 3-4 hours |
| 5d | Integrate canvas rendering | 4-6 hours |
| 5e | Wire up adjustment sliders | 2-3 hours |
| 5f | Add Background Color/Image controls | 3-4 hours |
| 5g | Connect to API (save/load layout) | 4-6 hours |

### Files to Create

| File | Purpose |
|------|---------|
| `services/media-layout.service.ts` | State management with 9-Config model |
| `services/moveable.service.ts` | Moveable.js wrapper |
| `models/media-layout.models.ts` | TypeScript interfaces |
| `models/hero-templates.ts` | Template definitions (port from prototype) |
| `models/card-constraints.ts` | Size constraints (port from prototype) |
| `components/template-strip/*` | Template selection component |
| `components/adjustment-sliders/*` | Position/Scale/Rotation controls |
| `components/layers-list/*` | Image layer management |

### Prototype Files to Port

| Prototype File | Angular Equivalent |
|----------------|-------------------|
| `js/app.js` (AppState) | `media-layout.service.ts` |
| `js/moveable-controller.js` | `moveable.service.ts` |
| `js/template-strip.js` | `template-strip.component.ts` |
| `process/js/constraints.js` | `card-constraints.ts` |
| `process/js/templates.js` | `hero-templates.ts` |

### Key Data Model (from prototype)

```typescript
// media-layout.models.ts

export type CardSize = '1x1'|'2x1'|'3x1'|'1x2'|'2x2'|'3x2'|'1x3'|'2x3'|'3x3';

export interface HeroSlot {
  id: string;
  imageRef: string;
  position: { x: number; y: number };  // Percentages 0-100
  size: number;                         // Percentage of container
  scale: number;                        // Multiplier (1.0 = 100%)
  rotation: number;                     // Degrees
  zIndex: number;                       // Layer order
}

export interface SizeConfig {
  isCustomized: boolean;
  templateId: string | null;
  slots: HeroSlot[] | null;
}

export interface MediaLayoutConfig {
  allConfigs: Record<CardSize, SizeConfig>;
  preferredCategory: 'small' | 'medium' | 'large';
  savedAt: string;
}
```

---

## File Reference

### Files to Modify (Existing)

| File | Phase | Changes |
|------|-------|---------|
| `bottom-menu.service.ts` | 1 | Add media-layout panel state |
| `bottom-menu.component.ts` | 1 | Add Media Layout tab configuration |
| `bottom-menu.component.html` | 1 | Add tab button with disabled state |
| `content-editor.component.ts` | 2 | Add navigation method |
| `content-editor.component.html` | 2 | Add links, convert Background to read-only |
| `media-repository-layout.component.ts` | 3 | Add navigation method |
| `media-repository-layout.component.html` | 3 | Add link in preview panel |

### Files to Create (New)

| File | Phase |
|------|-------|
| `media-layout/media-layout.component.ts` | 4 |
| `media-layout/media-layout.component.html` | 4 |
| `media-layout/media-layout.component.scss` | 4 |
| `media-layout/media-layout.module.ts` | 4 |
| `services/media-layout.service.ts` | 5 |
| `services/moveable.service.ts` | 5 |
| `models/media-layout.models.ts` | 5 |

---

## Mockups

### Footer Tab States

**Normal State (1 promotion selected)**:
```
┌────────────────────────────────────────────────────────────────────────────┐
│ [Editor]  [Media]  [Media Layout]  [Promotions]  [Categories]              │
│    ○         ○          ○              ○              ○                    │
└────────────────────────────────────────────────────────────────────────────┘
```

**Active State (Media Layout selected)**:
```
┌────────────────────────────────────────────────────────────────────────────┐
│ [Editor]  [Media]  [Media Layout]  [Promotions]  [Categories]              │
│    ○         ○         [●]             ○              ○                    │
│                      ───────                                               │
│                    (blue/active)                                           │
└────────────────────────────────────────────────────────────────────────────┘
```

**Disabled State (2+ promotions selected)**:
```
┌────────────────────────────────────────────────────────────────────────────┐
│ [Editor]  [Media]  [Media Layout]  [Promotions]  [Categories]              │
│    ○         ○        (grayed)          ○              ○                   │
│                     ┌─────────────────────────────┐                        │
│                     │ Select a single promotion   │                        │
│                     │ to edit layout              │ ← Tooltip              │
│                     └─────────────────────────────┘                        │
└────────────────────────────────────────────────────────────────────────────┘
```

### Editor Panel - Media Section

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Media                                                                       │
│ ──────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  ┌──────────┐                                                               │
│  │          │   coca cola products 6pk.jpg                                  │
│  │  [img]   │                                                               │
│  │          │   [🔄 Change Media]    [🗑]                                  │
│  └──────────┘                                                               │
│                                                                             │
│ ────────────────────────────────────────────────────────────────────────── │
│                                                                             │
│  [Update Media Layout →]                                                    │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

### Editor Panel - Background Section (Read-Only)

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Background                                           [Read-Only]            │
│ ──────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  Color:   ██████  #E86930                                                   │
│                                                                             │
│  Image:   (none)                                                            │
│                                                                             │
│ ────────────────────────────────────────────────────────────────────────── │
│                                                                             │
│  [Edit in Media Layout →]                                                   │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

### Media Repository - Preview Panel with Link

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Preview Promotion                                                           │
│ ──────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                                                                     │    │
│  │                     [Promotion Card Preview]                        │    │
│  │                                                                     │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │ Hero Image                                                          │    │
│  │ ┌────┐  coca cola products 6pk.jpg        [Replace]  [✕]           │    │
│  │ │img │                                                              │    │
│  │ └────┘                                                              │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │ Background Image                                                    │    │
│  │ ┌────┐  -                                 [Replace]  [✕]           │    │
│  │ │    │                                                              │    │
│  │ └────┘                                                              │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│ ────────────────────────────────────────────────────────────────────────── │
│                                                                             │
│  [Customize in Media Layout →]                                              │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Next Steps

1. **Review this plan** - Confirm scope and phases
2. **Create mockup files** - HTML mockups for each UI change (optional)
3. **Begin Phase 1** - Footer tab infrastructure
4. **Iterate** - Test each phase before moving to next

---

*Document Version: 1.0*
*Last Updated: December 21, 2025*
