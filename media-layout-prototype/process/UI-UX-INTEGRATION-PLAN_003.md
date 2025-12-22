# Media Layout Integration: User Flow Implementation Plan v3

**Created**: December 22, 2025
**Status**: Wireframe Complete - Ready for Implementation
**Previous Document**: UI-UX-INTEGRATION-PLAN_002.md
**Prototype Reference**: `/process/wireframes/context-wireframe/prototype.html`

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Tab Architecture](#tab-architecture)
3. [Tab Enable/Disable Rules](#tab-enabledisable-rules)
4. [Pocket Modal Interface](#pocket-modal-interface)
5. [User Flow Diagrams](#user-flow-diagrams)
6. [Navigation Features](#navigation-features)
7. [Progressive Disclosure](#progressive-disclosure)
8. [Panel Layouts](#panel-layouts)
9. [Implementation Phases](#implementation-phases)
10. [File Reference](#file-reference)

---

## Executive Summary

This document provides the definitive specification for the Media Layout feature integration based on the completed interactive wireframe prototype. The key architectural decisions have been finalized and tested in the prototype.

### Core Concepts

| Concept | Description |
|---------|-------------|
| **Pocket Modal** | 95vh modal that slides up from bottom, keeps data grid partially visible |
| **Tab Groups** | Two groups separated by divider: Promotion-level (left) and Circular-level (right) |
| **Progressive Disclosure** | Multiple entry points to Layout feature based on user context |
| **Tab-Based Panels** | All editing happens within the modal via tabbed panels |

### Tab Configuration (Final)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [ Editor ][ Media ][ Design ]  │  [ Promotion (+Add) ][ Categories ][ Recipes ]  │
│  ─────────────────────────────     ──────────────────────────────────────────────  │
│       Promotion Level                          Circular Level                       │
│    (requires selection)                    (always available)                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Tab Architecture

### Two Tab Groups

The footer/dock tabs are organized into two distinct groups, visually separated by a divider:

#### Primary Group (Promotion Level)
- **Editor** - Main editing interface for promotion content, deal/offer, dates
- **Media** - Media repository for selecting hero and background images
- **Design** - Typography, colors, effects, and styling options

These tabs operate on the **selected promotion(s)** and require at least one row to be selected.

#### Secondary Group (Circular Level)
- **Promotion (+Add)** - Add new promotions to the circular
- **Categories** - Manage category hierarchy
- **Recipes** - Manage recipe templates

These tabs operate on the **entire circular** and are always available regardless of selection.

### Media Layout Panel

The **Media Layout** panel is accessed via contextual links (not a primary tab):
- "Open Layout →" prompt card in Editor
- "Edit in Layout →" link in Background section
- "Customize in Layout →" link in Media Repository
- Toast notification action after image selection

---

## Tab Enable/Disable Rules

### UX Rule: Tab States Based on Selection

```javascript
// Pseudocode for tab state management
function updateTabStates(selectedCount) {
  const hasSelection = selectedCount > 0;
  const singleSelection = selectedCount === 1;

  // Primary tabs (Editor, Media, Design)
  primaryTabs.forEach(tab => {
    tab.disabled = !hasSelection;  // Disabled when no selection
  });

  // Media Layout navigation links
  mediaLayoutLinks.forEach(link => {
    link.disabled = !singleSelection;  // Only enabled for single selection
  });

  // Secondary tabs (Promotion, Categories, Recipes)
  secondaryTabs.forEach(tab => {
    tab.disabled = false;  // Always enabled
  });
}
```

### Selection State Matrix

| Selection State | Editor | Media | Design | Media Layout | Promotion | Categories | Recipes |
|-----------------|--------|-------|--------|--------------|-----------|------------|---------|
| **No selection** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Single selection** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Multi-selection (2+)** | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |

### Disabled State Visual Treatment

```css
.dock-tab:disabled,
.modal-tab:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
```

Tooltip on hover (for disabled tabs): "Select a promotion to edit"

---

## Pocket Modal Interface

### Design Specifications

| Property | Value | Notes |
|----------|-------|-------|
| Height | 95vh (full) or 55vh (half) | Configurable via size toggles |
| Position | Bottom-anchored | Slides up from bottom |
| Border radius | 12px 12px 0 0 | Rounded top corners only |
| Animation | 250ms cubic-bezier | slideUpPocket keyframe |
| Overlay | rgba(0,0,0,0.4) | Semi-transparent backdrop |

### Size Toggle Controls

The modal supports three states controlled by toggle buttons:

```
┌─────────────────────────────────────────────────────────────────┐
│  [□] [▄] [█]  Close                                             │
│  ↑    ↑    ↑                                                     │
│ closed half full                                                │
└─────────────────────────────────────────────────────────────────┘
```

- **Closed (□)**: Closes modal, returns to data grid
- **Half (▄)**: 55vh height for compact editing
- **Full (█)**: 95vh height for immersive editing (default)

### Modal Structure

```html
<div class="modal">
  <!-- 1. Tab Bar Header -->
  <div class="modal-header-tabs">
    <div class="modal-tabs-container">
      <div class="modal-tab-group">...</div>        <!-- Primary tabs -->
      <div class="modal-tab-divider"></div>
      <div class="modal-tab-group--secondary">...</div>  <!-- Secondary tabs -->
    </div>
    <div class="modal-header-tabs__actions">
      <div class="modal-size-toggles">...</div>
      <button class="modal-close">Close</button>
    </div>
  </div>

  <!-- 2. Breadcrumb Navigation -->
  <div class="panel-breadcrumb">
    Data Grid › Editor › [Current Tab]
  </div>

  <!-- 3. Panel Header (Promotion Context) -->
  <div class="panel-header">
    <div class="panel-header__left-group">
      <button class="back-to-editor">← Editor</button>
      <div class="panel-header__promo-section">
        <span class="panel-header__promo-name">Coca-Cola Products</span>
        <div class="panel-header__subtitle">Edit Single Promotion</div>
      </div>
    </div>
    <div class="panel-header__right-group">
      <button>← Previous</button>
      <button>Next →</button>
    </div>
  </div>

  <!-- 4. Panel Body (Content Area) -->
  <div class="panel-body">
    <div class="panel-content" id="panelEditor">...</div>
    <div class="panel-content" id="panelMedia">...</div>
    <div class="panel-content" id="panelDesign">...</div>
    <div class="panel-content" id="panelMediaLayout">...</div>
    <!-- Additional panels... -->
  </div>
</div>
```

---

## User Flow Diagrams

### Flow A: Editor → Layout (Recommended)

```
Data Grid → Select Promotion → Click Edit → Editor Tab
                                              ↓
                                        See Prompt Card
                                              ↓
                                     Click "Open Layout →"
                                              ↓
                                         Layout Panel
                                              ↓
                                    Adjust positioning
                                              ↓
                                     Click "← Editor"
                                              ↓
                                       Back to Editor
```

**Entry Point**: Prompt card in Editor → Media section

### Flow B: Direct Tab Access

```
Data Grid → Select Single Promotion → Click any tab in footer
                                              ↓
                                       Modal Opens
                                              ↓
                                    Click tab to switch
                                              ↓
                                  Navigate via breadcrumb
```

**Entry Point**: Footer dock tabs

### Flow C: Media → Layout

```
Data Grid → Editor → Click "Change" on Media
                              ↓
                        Media Repository
                              ↓
                      Select new image
                              ↓
                   Toast: "Customize layout →"
                              ↓
                         Layout Panel
```

**Entry Point**: Toast notification after image selection

### Flow D: Background → Layout

```
Data Grid → Editor → Scroll to Background section
                              ↓
                   Click "Edit in Layout →"
                              ↓
                         Layout Panel
```

**Entry Point**: Link in Background card

---

## Navigation Features

### 1. Breadcrumb Navigation

Three-level breadcrumb showing navigation path:

```
Data Grid › Editor › Layout
    ↑          ↑        ↑
  (closes   (returns  (current
   modal)   to Editor)  panel)
```

**Click behaviors:**
- **Data Grid**: Closes modal, returns to grid
- **Editor**: Switches to Editor tab
- **Current**: Display only (not clickable)

### 2. Back to Editor Button

Prominent button shown on non-Editor tabs:

```css
.back-to-editor {
  background: var(--primary-light);
  border: 1px solid var(--primary);
  color: var(--primary);
  /* ... */
}
```

**Visibility rules:**
- Hidden on Editor tab
- Visible on Media, Design, and Layout tabs

### 3. Previous/Next Promotion Navigation

Navigate between promotions without returning to grid:

```
[ ← Previous ]  [ Next → ]
```

**Behavior:**
- Updates promotion context in place
- Preserves current tab
- Updates all form values

### 4. Tab Bar Switching

Direct click on any tab switches panels with smooth transition:

**Transition Types:**
- **Promotion tabs**: Horizontal slide (forward/backward)
- **Circular tabs**: Vertical slide
- **Cross-group**: Crossfade

```css
.panel-body[data-transition-type="promotion"][data-direction="forward"] .panel-content.active {
  transform: scale(1) translateX(0);
}
```

---

## Progressive Disclosure

### Discovery Points

Six entry points guide users to the Layout feature:

| # | Location | Element | Trigger |
|---|----------|---------|---------|
| 1 | Editor → Media section | Prompt card | Always shown (dismissible) |
| 2 | Footer tab bar | Tab with badge | Hover shows tooltip |
| 3 | Editor → Background | "Edit in Layout →" link | Click |
| 4 | Media Repository | Toast notification | After image selection |
| 5 | Media Repository sidebar | "Customize in Layout →" | Click |
| 6 | Editor → Media section | Fallback link | After prompt dismissed |

### Prompt Card (Primary)

```html
<div class="prompt-card">
  <div class="prompt-card__header">
    <span class="prompt-card__icon">💡</span>
    <span class="prompt-card__title">Customize image positioning</span>
  </div>
  <p class="prompt-card__text">
    Control how this hero image appears across different card sizes (1x1 to 3x3).
    Adjust position, scale, and rotation for each size.
  </p>
  <div class="prompt-card__actions">
    <button class="prompt-card__btn">Open Layout →</button>
    <button class="prompt-card__dismiss">Don't show again</button>
  </div>
</div>
```

### Dismissal Behavior

When user clicks "Don't show again":
1. Prompt card hides permanently (session/local storage)
2. Fallback text link appears: "Customize layout →"
3. Tab tooltip and NEW badge hide

### Toast Notification

Triggered after selecting an image in Media Repository:

```html
<div class="toast">
  <span class="toast__icon">✓</span>
  <span class="toast__message">Image assigned to hero</span>
  <button class="toast__action">Customize layout →</button>
  <button class="toast__close">×</button>
</div>
```

Auto-dismisses after 5 seconds.

---

## Panel Layouts

### Editor Panel (4 columns)

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│   Content    │  Deal/Offer  │    Date +    │   Preview    │
│              │              │   Media +    │      +       │
│   Coupon     │  Headline    │  Background  │  Hero Image  │
│              │              │              │  Background  │
└──────────────┴──────────────┴──────────────┴──────────────┘
  280px          280px          280px          1fr
```

### Media Repository (3 columns)

```
┌──────────────┬─────────────────────────────┬──────────────┐
│   Filters    │        Image Grid           │   Preview    │
│              │     (4 columns)             │   Sidebar    │
│              │                             │              │
└──────────────┴─────────────────────────────┴──────────────┘
  220px              1fr                        280px
```

### Design Panel (3 columns)

```
┌──────────────┬──────────────┬──────────────────────────────┐
│  Typography  │   Colors +   │           Preview            │
│   Spacing    │   Effects    │                              │
└──────────────┴──────────────┴──────────────────────────────┘
```

### Media Layout Panel (4 columns)

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│  Background  │   Hero       │    Hero      │   Preview    │
│    Color     │  Templates   │ Adjustments  │      +       │
│  Background  │    Hero      │              │  Card Size   │
│    Image     │   Image      │              │    Grid      │
└──────────────┴──────────────┴──────────────┴──────────────┘
  240px          240px          240px          1fr
```

### Card Size Grid (3x3)

```
┌─────┬─────┬─────┐
│ 1x1 │ 2x1 │ 3x1 │
├─────┼─────┼─────┤
│ 1x2 │ 2x2 │ 3x2 │
├─────┼─────┼─────┤
│ 1x3 │ 2x3 │ 3x3 │
└─────┴─────┴─────┘
```

Each size stores independent positioning configuration.

---

## Implementation Phases

### Phase 1: Footer Tab Infrastructure ✅ (In Prototype)

- [x] Grouped tab design (dock-tab-group)
- [x] Two groups with divider
- [x] Tab enable/disable state management
- [x] Size toggle controls
- [x] Active state styling

### Phase 2: Modal Shell ✅ (In Prototype)

- [x] Pocket modal (bottom-anchored)
- [x] Modal header with tabs
- [x] Breadcrumb navigation
- [x] Panel header with promotion context
- [x] Previous/Next navigation
- [x] Back to Editor button
- [x] Size toggles (half/full)

### Phase 3: Panel Transitions ✅ (In Prototype)

- [x] CSS-based panel transitions
- [x] Horizontal slide for promotion tabs
- [x] Vertical slide for circular tabs
- [x] Crossfade for cross-group
- [x] Shared element animation (hero image)

### Phase 4: Editor Panel ✅ (In Prototype)

- [x] 4-column layout
- [x] Content, Deal, Date, Preview cards
- [x] Media card with prompt
- [x] Background card with link
- [x] Progressive disclosure elements

### Phase 5: Media Repository ✅ (In Prototype)

- [x] 3-column layout
- [x] Filter sidebar
- [x] Image grid
- [x] Preview sidebar with link
- [x] Toast notification

### Phase 6: Media Layout Panel ✅ (In Prototype)

- [x] 4-column layout
- [x] Background color/image cards
- [x] Hero templates grid
- [x] Hero adjustments (sliders)
- [x] Preview area
- [x] Card size grid (9 sizes)

### Phase 7: Angular Implementation 🔜 (Next)

- [ ] Port tab state management to Angular service
- [ ] Create panel components
- [ ] Implement tab routing
- [ ] Wire up data binding
- [ ] Connect to API

---

## File Reference

### Prototype Files (Reference)

| File | Description |
|------|-------------|
| `prototype.html` | Complete interactive wireframe |
| `index.html` | Documentation page |

### Angular Files to Create

| File | Path | Purpose |
|------|------|---------|
| `bottom-menu.service.ts` | `/services/` | Tab state management |
| `media-layout.component.ts` | `/components/media-layout/` | Layout panel |
| `media-layout.service.ts` | `/services/` | Layout state (9 configs) |
| `moveable.service.ts` | `/services/` | Drag/resize integration |

### Key TypeScript Interfaces

```typescript
// Tab state
interface TabState {
  activeTab: TabId;
  previousTab: TabId | null;
  transitionInProgress: boolean;
}

type TabId = 'editor' | 'media' | 'design' | 'media-layout' |
             'promotion' | 'categories' | 'recipes';

// Layout configuration
interface MediaLayoutConfig {
  allConfigs: Record<CardSize, SizeConfig>;
  preferredCategory: 'small' | 'medium' | 'large';
}

type CardSize = '1x1'|'2x1'|'3x1'|'1x2'|'2x2'|'3x2'|'1x3'|'2x3'|'3x3';

interface SizeConfig {
  isCustomized: boolean;
  templateId: string | null;
  slots: HeroSlot[] | null;
}

interface HeroSlot {
  id: string;
  imageRef: string;
  position: { x: number; y: number };
  scale: number;
  rotation: number;
  zIndex: number;
}
```

---

## Changelog from v2

| Change | v2 | v3 |
|--------|----|----|
| Tab naming | "Media Layout" as tab | "Design" tab + Layout panel via links |
| Tab count | 5 tabs | 6 tabs (added Recipes) |
| Primary tab disable | Only Media Layout | All promotion-level tabs |
| Size controls | Not documented | Full/Half/Closed toggles |
| Transition types | Not documented | Horizontal, Vertical, Crossfade |
| Back button | Mentioned | Fully specified |
| Breadcrumb | Basic | 3-level with click handlers |

---

*Document Version: 3.0*
*Last Updated: December 22, 2025*
*Prototype Status: Wireframe Complete*
