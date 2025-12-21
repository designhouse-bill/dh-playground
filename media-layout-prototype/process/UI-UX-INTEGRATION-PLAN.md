# Media Layout Integration: UI/UX Planning Document

**Created**: December 19, 2025
**Status**: Planning/Ideation Phase
**Scope**: User Flow, UI Updates, Navigation Patterns

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Confirmed Decisions](#confirmed-decisions)
4. [User Flow Design](#user-flow-design)
5. [UI Component Changes](#ui-component-changes)
6. [Navigation Architecture](#navigation-architecture)
7. [Preview Panel Standardization](#preview-panel-standardization)
8. [Size Categories (S/M/L)](#size-categories-sml)
9. [Technical Integration Points](#technical-integration-points)
10. [Open Items](#open-items)

---

## Executive Summary

This document outlines the UI/UX strategy for integrating the Media Layout prototype into the existing Ideal Sale Circular admin application. The goal is to provide an intuitive, low-friction experience for administrators managing promotion layouts across 9 card sizes.

### Key Principles
- **Low friction** - Minimize clicks for common tasks
- **Progressive disclosure** - Simple tasks in Editor, advanced in Media Layout
- **Consistent navigation** - Predictable patterns across all panels
- **Auto-save** - Changes persist immediately without explicit save actions
- **Good defaults** - Every promotion starts with sensible layouts

---

## Current State Analysis

### Existing User Flow (From Screenshots)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  DATA GRID                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ TITLE          │ SIZE  │ DEAL TYPE   │ PRICE   │ UTILITIES           │  │
│  │ Long Drink     │ 1×2   │ Fixed Price │ $11.99  │ [history][share][edit]│ │
│  │ Powerade       │ 3×2   │ Fixed Price │ $8.49   │ [history][share][edit]│ │
│  │ Coca-Cola      │ 1×1   │ # for Price │ $9      │ [history][share][edit]│ │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Footer: [Editor ▾] [Media ▾] [Promotions ▾] [Categories ▾]          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Editor Panel (Current)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  EDITOR: Edit Single Promotion                    [< Previous] [Next >]     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐│
│  │   CONTENT   │  │  DEAL/OFFER │  │ DATE RANGE  │  │  PREVIEW PROMOTION  ││
│  │ ─────────── │  │ ─────────── │  │ ─────────── │  │  ─────────────────  ││
│  │ Title       │  │ Card Style  │  │ Starts on   │  │                     ││
│  │ Description │  │ Deal Type   │  │ Expires     │  │   [Card Preview]    ││
│  │ Date Text   │  │ Qty/Price   │  │             │  │                     ││
│  │ Category    │  │ UPC         │  ├─────────────┤  │                     ││
│  │ Width/Hgt/Sz│  │ Loyalty Deal│  │    MEDIA    │  │  ┌───────────────┐  ││
│  └─────────────┘  │             │  │ ─────────── │  │  │  Hero Image   │  ││
│  ┌─────────────┐  ├─────────────┤  │ [thumbnail] │  │  │  [Replace] X  │  ││
│  │   COUPON    │  │  HEADLINE   │  │ Change Media│  │  └───────────────┘  ││
│  │ ─────────── │  │ ─────────── │  │ [trash]     │  │  ┌───────────────┐  ││
│  │ Coupon ID   │  │ Select...   │  ├─────────────┤  │  │ Background Img│  ││
│  │ Required    │  │             │  │ BACKGROUND  │  │  │  [Replace] X  │  ││
│  │ Limit       │  ├─────────────┤  │ ─────────── │  │  └───────────────┘  ││
│  │ Amount Off  │  │ MEDIA/ICONS │  │ Color: Solid│  │                     ││
│  └─────────────┘  │ ─────────── │  │ #FFFFFF     │  └─────────────────────┘│
│                   │             │  │ R G B A     │                         │
│                   └─────────────┘  └─────────────┘                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Media Repository Panel (Current)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  MEDIA: Media Repository                          [< Previous] [Next >]     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐  ┌────────────────────────────────┐  ┌─────────────────┐ │
│  │   FILTERS    │  │        SEARCH RESULTS          │  │PREVIEW PROMOTION│ │
│  │ ──────────── │  │ ──────────────────────────────│  │ ─────────────── │ │
│  │ Animation    │  │ [search box: "coca cola"]      │  │                 │ │
│  │ Status       │  │ [chips: Static, Animation...]  │  │                 │ │
│  │              │  │                                │  │ [Card Preview]  │ │
│  │ Source       │  │ Results: 71                    │  │                 │ │
│  │              │  │                                │  │ ┌─────────────┐ │ │
│  │ Recently     │  │ ┌────┐ ┌────┐ ┌────┐ ┌────┐   │  │ │ Hero Image  │ │ │
│  │ Assigned     │  │ │ACTV│ │    │ │    │ │    │   │  │ │ [Replace] X │ │ │
│  │              │  │ │    │ │    │ │    │ │    │   │  │ └─────────────┘ │ │
│  │ Date Range   │  │ └────┘ └────┘ └────┘ └────┘   │  │ ┌─────────────┐ │ │
│  │ [All Dates]  │  │                                │  │ │ Background  │ │ │
│  │              │  │ ┌────┐ ┌────┐ ┌────┐ ┌────┐   │  │ │ [Replace] X │ │ │
│  └──────────────┘  │ │    │ │    │ │    │ │    │   │  │ └─────────────┘ │ │
│                    │ └────┘ └────┘ └────┘ └────┘   │  │                 │ │
│                    └────────────────────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Media Layout Prototype (New)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  MEDIA LAYOUT                                     [< Previous] [Next >]     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │  BACKGROUND  │  │  TEMPLATES   │  │ ADJUSTMENTS  │  │    PREVIEW      │ │
│  │ ──────────── │  │ ──────────── │  │ ──────────── │  │ ─────────────── │ │
│  │              │  │              │  │              │  │                 │ │
│  │ BG Color     │  │ Hero         │  │ [Selected    │  │ ┌─────────────┐ │ │
│  │ ┌──────────┐ │  │ Templates    │  │  Image]      │  │ │             │ │ │
│  │ │ Color    │ │  │ ┌──┐┌──┐┌──┐│  │              │  │ │  CANVAS     │ │ │
│  │ │ Picker   │ │  │ └──┘└──┘└──┘│  │ Size ──────  │  │ │  (drag/     │ │ │
│  │ └──────────┘ │  │ ┌──┐┌──┐┌──┐│  │ [====●====]  │  │ │   scale/    │ │ │
│  │              │  │ └──┘└──┘└──┘│  │              │  │ │   rotate)   │ │ │
│  │ BG Image     │  │              │  │ Pos X ─────  │  │ │             │ │ │
│  │ ┌──────────┐ │  │ ──────────── │  │ [====●====]  │  │ └─────────────┘ │ │
│  │ │ Image    │ │  │ Hero Image   │  │              │  │                 │ │
│  │ │ Settings │ │  │              │  │ Pos Y ─────  │  │ ┌─────────────┐ │ │
│  │ │ pos/size │ │  │ Count: [1-5] │  │ [====●====]  │  │ │ Card Size   │ │ │
│  │ │ /repeat  │ │  │              │  │              │  │ │ ┌──┬──┬──┐  │ │ │
│  │ └──────────┘ │  │ ┌──┐ img 1   │  │ Rotation ──  │  │ │ │1x│2x│3x│  │ │ │
│  │              │  │ │  │ [Repl]  │  │ [====●====]  │  │ │ ├──┼──┼──┤  │ │ │
│  │              │  │ └──┘ [Remv]  │  │              │  │ │ │1x│2x│3x│  │ │ │
│  │              │  │              │  │ Layer ─────  │  │ │ ├──┼──┼──┤  │ │ │
│  │              │  │ ┌──┐ img 2   │  │ [Top][Mid]   │  │ │ │1x│2x│3x│  │ │ │
│  │              │  │ │  │ [Repl]  │  │ [Bottom]     │  │ │ └──┴──┴──┘  │ │ │
│  │              │  │ └──┘ [Remv]  │  │              │  │ │  ● = custom │ │ │
│  │              │  │              │  │ ──────────── │  │ └─────────────┘ │ │
│  │              │  │ [+ Add Hero] │  │ JSON Export  │  │ Width: [====]  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Confirmed Decisions

### 1. Editor Page Approach: Option B
- **Keep simplified media selector** in Editor (thumbnail + "Change Media" button)
- **Advanced layout work** happens on dedicated Media Layout page
- Allows quick media swap for single-image promotions without leaving Editor

### 2. Navigation Behavior
- **NO auto-navigate** after media selection in Media Repo
- User explicitly chooses: return to Editor OR go to Media Layout
- Media Layout accessible from data grid as a **footer modal tab**

### 3. Default Layouts (Required)
- **Every promotion MUST have a layout** - no "empty" state
- Defaults based on: promotion size + number of images
- "Good enough from the start" philosophy
- **Re-use detection**: Automatic (backend handles this; if product was used in past promotion with overrides, system grabs that layout data)

### 4. Override Notifications
- Show on **Media Layout page only**, NOT on Editor
- Editor stays clean/simple
- Purple dots on size buttons indicate customized sizes

### 5. Footer Tab Name
- **"Media Layout"** - new tab in footer modal

### 6. Media Repo Behavior
- Selecting media **auto-saves** to promotion immediately
- No explicit "Apply" action needed
- User can then navigate to Editor OR Media Layout as they choose

### 7. Background Color
- **Moves to Media Layout panel** (NOT editable in Editor)
- Editor shows **read-only status indicator** for background (color + image)
- Shows "inactive" if not applied
- State is communicated but NOT edited in Editor

### 8. Preview Panel
- **Consistent** across all tabs (Editor, Media, Media Layout)
- Based on **PromotionCardComponent from design-system**

---

## User Flow Design

### Primary User Paths

```
                                    ┌─────────────────┐
                                    │    DATA GRID    │
                                    └────────┬────────┘
                                             │
                              ┌──────────────┼──────────────┐
                              │              │              │
                              ▼              ▼              ▼
                    ┌─────────────┐  ┌─────────────┐  ┌──────────────┐
                    │   EDITOR    │  │    MEDIA    │  │ MEDIA LAYOUT │
                    │    Tab      │  │  REPO Tab   │  │     Tab      │
                    └──────┬──────┘  └──────┬──────┘  └──────────────┘
                           │                │                ▲
                           │                │                │
              ┌────────────┴────────────┐   │                │
              │                         │   │                │
              ▼                         ▼   ▼                │
    ┌──────────────────┐    ┌──────────────────┐            │
    │  Change Media    │    │  Select Image    │            │
    │  (opens Media    │───►│  (auto-saves)    │────────────┘
    │   Repo)          │    │                  │
    └──────────────────┘    └──────────────────┘
              │
              ▼
    ┌──────────────────┐
    │ Update Media     │
    │ Layout           │
    │ (opens Media     │────────────────────────────────────►
    │  Layout tab)     │
    └──────────────────┘
```

### Path A: Quick Media Change (Single Image)
**User Goal**: Just swap the hero image, no layout changes needed

```
1. Data Grid → Select promotion, Click "Edit" on promotion
2. Editor Tab opens
3. Click "Change Media" in Media section
4. Media Repo Tab opens with search populated from current media
5. Click desired image (auto-saves)
5a. Preview updates with new image 
6. close modal to return to data grid
6a. Click "Editor" tab to return or back button
```

### Path B: Full Layout Customization
**User Goal**: Configure multi-image layout with positioning

```
1. Data Grid → Select promotion to update
1a. Click "Edit" on promotion
1b. Click Media Layout Tab to view layout tools.
2. Editor Tab opens
3. Click "Update Media Layout" button
4. Media Layout Tab opens
5. Add images (1-5), apply template, adjust positions
6. Switch sizes, customize each as needed
6a. Preview Updates with updated layout settings
7. Close Media Layout to return to data grid. shows updated state in preview
7a.Click back or "Editor" tab when done
8. Editor shows updated state in preview
```

### Path C: Media Selection → Layout
**User Goal**: Find new media then customize layout

```
1. Data Grid → Select Promotion, Click "Edit" on promotion
2. Editor Tab opens
3. Click "Change Media"
4. Media Repo Tab opens
5. Search/filter, click desired image (auto-saves)
6. Click "Media Layout" tab
7. Customize layout with new image
```

### Path D: Direct Layout Access
**User Goal**: Go straight to layout customization

```
1. Data Grid → Select promotion (checkbox or single click on row)
2. Click "Media Layout" tab in footer
3. Media Layout Tab opens with selected promotion
4. Customize as needed
```

---

## UI Component Changes

### Editor Panel Modifications

#### Current Media Section (KEEP, SIMPLIFIED)
```
┌────────────────────────────────────┐
│ MEDIA                              │
│ ────────────────────────────────── │
│                                    │
│ ┌────────┐  coca cola products.jpg │
│ │        │                         │
│ │ [img]  │  [Change Media]         │
│ │        │                         │
│ └────────┘  [🗑 Remove]            │
│                                    │
│ ──────────────────────────────────│
│ [Update Media Layout →]            │
│                                    │
└────────────────────────────────────┘
```

**Changes**:
- Keep thumbnail + "Change Media" button
- Add "Update Media Layout →" link/button at bottom
- Remove direct image replacement in this view

#### Current Background Section (CONVERT TO READ-ONLY)
```
┌────────────────────────────────────┐
│ BACKGROUND                         │
│ ────────────────────────────────── │
│                                    │
│ Color: ██ #E86930                  │
│                                    │
│ Image: coca-bg.jpg                 │
│   OR                               │
│ Image: (none)                      │
│                                    │
│ ──────────────────────────────────│
│ [Update Media Layout →]            │
│                                    │
└────────────────────────────────────┘
```

**Changes**:
- Remove color picker
- Remove image upload/selection
- Show current values as read-only text
- Show "(none)" or "inactive" if not set
- Add "Update Media Layout →" link

#### Editor Preview Panel (STANDARDIZE)
```
┌─────────────────────────────────────┐
│ PREVIEW PROMOTION                   │
│ ─────────────────────────────────── │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ │      [PromotionCardComponent]   │ │
│ │                                 │ │
│ │      Renders actual promo       │ │
│ │      card at current size       │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Current Size: 2×2                   │
│                                     │
└─────────────────────────────────────┘
```

**Note**: Use design-system PromotionCardComponent for consistency

### Media Repository Panel Modifications

#### Add Navigation to Media Layout
```
┌─────────────────────────────────────┐
│ PREVIEW PROMOTION                   │
│ ─────────────────────────────────── │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │      [PromotionCardComponent]   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ──────────────────────────────────  │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Hero Image                      │ │
│ │ ┌────┐ coca cola products 6pk   │ │
│ │ │    │ [Replace] [X]            │ │
│ │ └────┘                          │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Background Image                │ │
│ │ ┌────┐ -                        │ │
│ │ │    │ [Replace] [X]            │ │
│ │ └────┘                          │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ──────────────────────────────────  │
│ [Customize in Media Layout →]       │
│                                     │
└─────────────────────────────────────┘
```

**Changes**:
- Keep existing Hero/Background media selectors
- Add "Customize in Media Layout →" link at bottom

### Footer Tab Bar Modification

#### Current
```
┌──────────────────────────────────────────────────────────────┐
│  [Editor ▾]    [Media ▾]    [Promotions ▾]    [Categories ▾] │
└──────────────────────────────────────────────────────────────┘
```

#### Proposed
```
┌───────────────────────────────────────────────────────────────────────────┐
│  [Editor ▾]  [Media ▾]  [Media Layout ▾]  [Promotions ▾]  [Categories ▾]  │
└───────────────────────────────────────────────────────────────────────────┘
```

**Implementation Notes**:
- Add new MenuItem in `bottom-menu.component.ts`
- Media Layout opens as fullscreen panel (like Editor and Media)
- Shares the same `[< Previous] [Current Promotion] [Next >]` navigation

---

## Navigation Architecture

### Files to Modify

| File | Location | Changes |
|------|----------|---------|
| `bottom-menu.component.ts` | `/src/app/shared/components/media-content/bottom-menu/` | Add "Media Layout" tab |
| `bottom-menu.component.html` | Same | Add menu item template |
| `bottom-menu.service.ts` | `/src/app/core/services/` | Add media layout panel state |
| `content-editor.component.ts` | `/src/app/shared/components/media-content/content-editor/` | Add navigation link |
| `content-editor.component.html` | Same | Modify Media/Background sections |
| `media-repository-layout.component.html` | `/src/app/shared/components/media-content/media-repository-layout/` | Add navigation link |

### Navigation Service Extension

```typescript
// bottom-menu.service.ts additions

// Add to existing service
selectedPanel: 'editor' | 'media' | 'media-layout' | 'promotions' | 'categories';

// Method to navigate to media layout
openMediaLayout(): void {
  this.selectedPanel = 'media-layout';
  this.isFullScreen = true;
}

// Method to check if promotion has layout customizations
hasLayoutOverrides(promotionId: string): Observable<boolean> {
  // Check allConfigs for any isCustomized === true
}
```

### Menu Item Configuration

```typescript
// bottom-menu.component.ts

menuItems: MenuItem[] = [
  {
    id: 'editor',
    label: 'Editor',
    icon: 'pi pi-pencil',
    fullscreen: true
  },
  {
    id: 'media',
    label: 'Media',
    icon: 'pi pi-image',
    fullscreen: true
  },
  {
    id: 'media-layout',  // NEW
    label: 'Media Layout',
    icon: 'pi pi-th-large',  // grid icon
    fullscreen: true
  },
  {
    id: 'promotions',
    label: 'Promotions',
    icon: 'pi pi-tag',
    fullscreen: false
  },
  {
    id: 'categories',
    label: 'Categories',
    icon: 'pi pi-folder',
    fullscreen: false,
    condition: 'localProgramParticipation'  // existing conditional
  }
];
```

---

## Preview Panel Standardization

### Design System Components Available

From `/src/app/shared/components/`:

| Component | Purpose | Use Case |
|-----------|---------|----------|
| `PromotionCardComponent` | Full promotion card display | Past Promotions panel |
| `CardComponent` | Generic card wrapper | Base container |
| `CircularCardImageComponent` | Image with retry/loading | Media display |
| `CircularCardPricingComponent` | Price badge/deal info | Pricing display |
| `CircularCardDescriptionComponent` | Title/description | Text content |

### Unified Preview Component

Create a shared preview component used across all three panels:

```typescript
// shared/components/promotion-preview/promotion-preview.component.ts

@Component({
  selector: 'app-promotion-preview',
  template: `
    <p-card header="Preview Promotion" styleClass="preview-promotion-card">
      <div class="preview-container" [style.aspect-ratio]="aspectRatio">
        <dh-promotion-card
          [card]="promotion"
          [stackingCounter]="0"
          [selectedPromotion]="null">
        </dh-promotion-card>
      </div>
      <div class="preview-info">
        <span class="size-label">{{ currentSize }}</span>
      </div>
    </p-card>
  `
})
export class PromotionPreviewComponent {
  @Input() promotion: TranslatedDealCardDto;
  @Input() currentSize: string = '2x2';

  get aspectRatio(): string {
    const [w, h] = this.currentSize.split('x');
    return `${w} / ${h}`;
  }
}
```

### Preview Placement by Panel

| Panel | Preview Location | Behavior |
|-------|------------------|----------|
| **Editor** | Right column, top | Shows current promotion at selected size |
| **Media Repo** | Right column, top | Shows promotion with currently selected media |
| **Media Layout** | Column 4, integrated with canvas | Canvas IS the preview; additional card preview below |

---

## Size Categories (S/M/L)

### Proposed Model

| Category | Grid Sizes | Unit Area | Typical Use |
|----------|------------|-----------|-------------|
| **Small** | 1×1, 2×1, 1×2 | 1-2 units² | Compact grids, sidebars, mobile |
| **Medium** | 2×2, 3×1, 1×3 | 3-4 units² | Standard display, feature rows |
| **Large** | 3×2, 2×3, 3×3 | 6-9 units² | Hero display, expanded view |

### Behavior Model

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SIZE CATEGORY WORKFLOW                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. PROMOTION CREATION/EDIT                                                 │
│     ├─ User sets "Preferred Size" = Small | Medium | Large                  │
│     ├─ This is a HINT, not a hard constraint                                │
│     └─ Stored in promotion record                                           │
│                                                                             │
│  2. DEFAULT LAYOUT GENERATION (Backend)                                     │
│     ├─ System generates defaults for ALL 9 sizes                            │
│     ├─ Uses "best" template based on image count                            │
│     └─ S/M/L hint prioritizes which template style                          │
│                                                                             │
│  3. MEDIA LAYOUT UI                                                         │
│     ├─ Shows all 9 sizes in selector grid                                   │
│     ├─ HIGHLIGHTS "primary" sizes for selected category                     │
│     ├─ Purple dots show which sizes have custom overrides                   │
│     └─ User can customize any size regardless of category                   │
│                                                                             │
│  4. FRONT-END RENDERING                                                     │
│     ├─ Requests promotion at specific size (e.g., "3×2")                    │
│     ├─ API returns:                                                         │
│     │   ├─ Custom layout if exists for that size                            │
│     │   ├─ OR closest match from same category                              │
│     │   └─ OR default template                                              │
│     └─ S/M/L hint helps prioritize fallback selection                       │
│                                                                             │
│  5. EXPANDED VIEW HANDLING                                                  │
│     ├─ When card expands, front-end requests larger size                    │
│     ├─ If Large layouts exist → use them                                    │
│     └─ If only Small/Medium customized → scale up intelligently             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### User Type Workflows

| User Type | Typical Workflow |
|-----------|------------------|
| **Retailer** | Sets "Medium", trusts defaults, maybe tweaks 2×2, done |
| **Designer** | Sets "Medium", then clicks through all 9 sizes customizing each |

### Size Selector UI Enhancement

```
┌─────────────────────────────────────────────┐
│ Card Size                                   │
│ ─────────────────────────────────────────── │
│                                             │
│ Preferred: [Small ▾] [Medium ▾] [Large ▾]   │
│             ○          ●           ○        │
│                                             │
│ ┌───────┬───────┬───────┐                   │
│ │  1×1  │  2×1  │  3×1  │  ← Primary for    │
│ │   ●   │       │       │    selected       │
│ ├───────┼───────┼───────┤    category       │
│ │  1×2  │  2×2  │  3×2  │    shown with     │
│ │       │  ●    │       │    highlight      │
│ ├───────┼───────┼───────┤                   │
│ │  1×3  │  2×3  │  3×3  │  ● = customized   │
│ │       │       │       │                   │
│ └───────┴───────┴───────┘                   │
│                                             │
│ Customized: 2 of 9 sizes                    │
│                                             │
└─────────────────────────────────────────────┘
```

### Implementation Notes (TBD)

- Exact algorithm for "closest match" fallback needs definition
- Scale-up behavior for expanded view needs design
- Whether S/M/L affects template suggestions
- Database field: `promo_size` already exists; may need `size_category` enum

---

## Technical Integration Points

### Frontend (ideal-sale-circular)

#### New Component: Media Layout Panel
```
/src/app/shared/components/media-content/media-layout/
├── media-layout.component.ts      # Main container
├── media-layout.component.html    # Template
├── media-layout.component.scss    # Styles
└── media-layout.module.ts         # Module definition
```

#### Integration Strategy
Two options for prototype integration:

**Option A: Embed Vanilla JS**
- Wrap prototype in Angular component
- Use `ngAfterViewInit` to initialize
- Bridge events via `@Output()` decorators
- Pros: Fastest path to production
- Cons: Not "Angular-native"

**Option B: Rewrite in Angular**
- Convert classes to services
- Convert UI to Angular templates
- Use RxJS for state management
- Pros: Proper Angular patterns
- Cons: More effort, potential for bugs

**Recommendation**: Start with Option A, refactor to Option B over time

#### Services to Modify/Create

| Service | Changes |
|---------|---------|
| `ContentEditorService` | Add layout config data |
| `BottomMenuService` | Add media-layout panel state |
| `MediaLayoutService` (NEW) | Manage 9-config state |

### Backend (Ideal-Sale-API-V2)

#### Database Changes

```sql
-- Add hero_layout column to contents2 table
ALTER TABLE contents2
ADD COLUMN hero_layout JSONB DEFAULT NULL;

-- Structure of hero_layout:
{
  "allConfigs": {
    "1x1": { "isCustomized": false, "templateId": null, "slots": null },
    "2x1": { "isCustomized": true, "templateId": "hero-left", "slots": [...] },
    ...
  },
  "preferredCategory": "medium",  // S/M/L hint
  "savedAt": "2025-12-19T..."
}
```

#### API Endpoints

Existing PATCH endpoint can handle layout updates:

```
PATCH /pdBrands/{brandHash}/nodes/{nodeHash}/promotion/{rootContentHash}

Body: {
  "hero_layout": {
    "allConfigs": { ... },
    "preferredCategory": "medium"
  }
}
```

#### Migration

```php
// 2025_XX_XX_add_hero_layout_to_contents2.php

public function up()
{
    Schema::table('contents2', function (Blueprint $table) {
        $table->jsonb('hero_layout')->nullable();
    });

    Schema::table('imported_content', function (Blueprint $table) {
        $table->jsonb('hero_layout')->nullable();
    });
}
```

---

## Open Items

### Requires Further Discussion

1. **S/M/L Algorithm Details**
   - Exact "closest match" fallback logic
   - How scale-up works for expanded view
   - Whether S/M/L affects template suggestions

2. **Re-use Detection Scope**
   - Match by UPC? Media hash? Both?
   - How far back to look for past promotions?
   - Override vs. suggest behavior

3. **Performance Considerations**
   - Lazy load Media Layout panel?
   - Cache layout configs client-side?
   - Debounce auto-save?

### Design System Alignment

4. **Preview Card Variant**
   - Does PromotionCardComponent support all needed states?
   - Need for new "preview mode" prop?
   - Handling of different aspect ratios

### Testing Requirements

5. **User Testing**
   - Validate navigation flow with real users
   - Test with power users (designers) vs casual users (retailers)
   - Measure task completion time

---

## Appendix A: File Reference Map

### Frontend Files

```
ideal-sale-circular/src/app/
├── shared/components/media-content/
│   ├── bottom-menu/
│   │   ├── bottom-menu.component.ts      # Tab navigation
│   │   ├── bottom-menu.component.html
│   │   └── bottom-menu.component.scss
│   ├── content-editor/
│   │   ├── content-editor.component.ts   # Editor panel
│   │   ├── content-editor.component.html
│   │   └── content-editor.component.scss
│   ├── media-repository-layout/
│   │   ├── media-repository-layout.component.ts   # Media repo
│   │   ├── media-repository-layout.component.html
│   │   └── media-repository-layout.component.scss
│   └── media-layout/                     # NEW FOLDER
│       ├── media-layout.component.ts
│       ├── media-layout.component.html
│       └── media-layout.component.scss
├── core/services/
│   ├── bottom-menu.service.ts
│   ├── content-editor.service.ts
│   └── media-layout.service.ts           # NEW
└── shared/components/
    └── promotion-preview/                 # NEW (optional)
        └── promotion-preview.component.ts
```

### Backend Files

```
Ideal-Sale-API-V2/
├── app/Http/Controllers/
│   └── PromotionContentsController.php   # PATCH endpoint
├── app/ViewModels/
│   └── TranslatedContent.php             # Add hero_layout
├── app/Http/Requests/Domain/
│   └── ContentDto.php                    # Add hero_layout field
├── database/migrations/
│   └── 2025_XX_XX_add_hero_layout.php    # NEW migration
```

### Prototype Files

```
media-layout-prototype/
├── index.html                            # Main prototype
├── js/
│   ├── app.js                            # AppState with allConfigs
│   ├── moveable-controller.js            # Drag/scale/rotate
│   ├── template-strip.js                 # Template system
│   ├── constraints.js                    # Size constraints
│   └── image-selection-modal.js          # Size change modal
├── css/
│   └── *.css
└── process/
    ├── moveable-integration-plan.md      # Technical plan
    └── UI-UX-INTEGRATION-PLAN.md         # THIS DOCUMENT
```

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **Card Size** | Grid dimensions (e.g., 2×2) representing column×row units |
| **Slot** | A positioned hero image container with x, y, size, rotation, zIndex |
| **Template** | Pre-defined slot positions for a specific layout style |
| **allConfigs** | Object storing independent layout configurations for all 9 sizes |
| **isCustomized** | Flag indicating user has modified the default layout for a size |
| **S/M/L** | Size category hint (Small, Medium, Large) for prioritizing layouts |
| **Hero Image** | Product image(s) displayed prominently on the promotion card |
| **Background** | Color or image behind the hero images |
| **Re-use Detection** | System feature that inherits layout from past promotions with same product |

---

*Document will be updated as planning progresses.*
