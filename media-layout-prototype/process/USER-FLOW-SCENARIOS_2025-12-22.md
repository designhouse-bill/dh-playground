# User Flow Scenarios

**Document Version**: 1.0
**Date**: December 22, 2025
**Status**: Reference Documentation
**Related Files**:
- `wireframes/context-wireframe/prototype.html` (Interactive Prototype)
- `wireframes/context-wireframe/user-flows.html` (Visual Flowcharts)
- `UI-UX-INTEGRATION-PLAN_003.md` (Technical Specification)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Ranking Criteria](#ranking-criteria)
3. [Category A: Change Hero Image](#category-a-change-hero-image)
4. [Category B: Access Layout Panel](#category-b-access-layout-panel)
5. [Category C: Tab Navigation](#category-c-tab-navigation)
6. [Category D: Promotion Navigation](#category-d-promotion-navigation)
7. [Category E: Keyboard Shortcuts](#category-e-keyboard-shortcuts)
8. [Ranking Summary Matrix](#ranking-summary-matrix)
9. [Edge Cases](#edge-cases)
10. [QA Test Checklist](#qa-test-checklist)

---

## Executive Summary

This document defines **17 user flows** across 5 task categories for the Media Layout prototype. Each flow is ranked on a 1-10 numeric scale based on efficiency (click count), intuitiveness, and discoverability.

### Task Categories

| Category | Task | Flow Count |
|----------|------|------------|
| A | Change Hero Image | 5 flows |
| B | Access Layout Panel | 4 flows |
| C | Tab Navigation | 4 flows |
| D | Promotion Navigation | 2 flows |
| E | Keyboard Shortcuts | 2 flows |

### Key Principle: Always Set Context First

> **Rule**: Users must select a promotion in the Data Grid before any promotion-level editing can occur. This "sets context" for all subsequent actions.

---

## Ranking Criteria

### Numeric Scale (1-10)

| Score | Label | Criteria |
|-------|-------|----------|
| **10** | Excellent | 1-2 clicks/keys, highly discoverable, standard UI pattern |
| **8-9** | Very Good | 2-3 clicks, good discovery, intuitive for most users |
| **6-7** | Good | 3-4 clicks, moderate discovery, may require learning |
| **4-5** | Fair | 4-5 clicks, low discovery, power-user feature |
| **1-3** | Poor | 5+ clicks, inefficient, not recommended |

### Evaluation Factors

1. **Efficiency**: Number of clicks/keystrokes required
2. **Intuitiveness**: How obvious is the path to new users?
3. **Discoverability**: Can users find this path without instruction?
4. **Consistency**: Does it follow established UI patterns?

---

## Category A: Change Hero Image

### Overview
Five ways to change the hero image assigned to a promotion, ranging from the standard edit workflow to power-user shortcuts.

---

### Flow A1: Standard Edit Path
**Rating: 8/10** | **Clicks: 6** | **Discovery: High**

The traditional editing workflow that most users will follow.

**Steps:**
1. Select promotion row in Data Grid (sets context)
2. Click "Edit" button in UTILITIES column
3. Modal opens to Editor panel
4. Click "Change Media" button in Media card
5. Modal switches to Media Repository
6. Select new image from grid

**Flow Diagram:**
```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│Data Grid │ ─► │  Select  │ ─► │  Edit    │ ─► │ Editor   │ ─► │ Change   │ ─► │  Media   │
│          │    │   Row    │    │  Button  │    │  Panel   │    │  Media   │    │   Repo   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
```

**Pros:**
- Follows expected editing pattern
- Edit button is prominent in row
- Clear step-by-step progression

**Cons:**
- Most clicks of any path
- Requires scrolling to find Media card in Editor

---

### Flow A2: Footer Tab Path
**Rating: 9/10** | **Clicks: 4** | **Discovery: Medium**

Direct access to Media Repository via footer tabs.

**Steps:**
1. Select promotion row in Data Grid (sets context)
2. Click "Media" tab in footer dock
3. Modal opens directly to Media Repository
4. Select new image from grid

**Flow Diagram:**
```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│Data Grid │ ─► │  Select  │ ─► │  Media   │ ─► │  Media   │
│          │    │   Row    │    │   Tab    │    │   Repo   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
```

**Pros:**
- Fewer clicks than standard path
- Footer tabs always visible
- Skips Editor panel entirely

**Cons:**
- Requires knowing footer tabs exist
- Tabs may be overlooked by new users

---

### Flow A3: Thumbnail Click Shortcut ⭐
**Rating: 7/10** | **Clicks: 3** | **Discovery: Low**

Power-user shortcut: clicking the thumbnail in Data Grid.

**Steps:**
1. Click hero thumbnail in promotion row
2. Row selects AND modal opens to Media Repository
3. Select new image from grid

**Flow Diagram:**
```
┌──────────┐    ┌──────────┐    ┌──────────┐
│Data Grid │ ─► │  Click   │ ─► │  Media   │
│          │    │Thumbnail │    │   Repo   │
└──────────┘    └──────────┘    └──────────┘
```

**Pros:**
- Fastest click path (3 clicks)
- Direct visual connection to task
- Efficient for power users

**Cons:**
- Not immediately discoverable
- Requires learning the shortcut
- Thumbnail may be small on mobile

---

### Flow A4: Ellipse Menu ⭐
**Rating: 8/10** | **Clicks: 4** | **Discovery: Medium**

Context menu option in row actions dropdown.

**Steps:**
1. Select promotion row in Data Grid (sets context)
2. Click ellipse (⋮) menu in UTILITIES column
3. Select "Replace Media" from dropdown
4. Modal opens to Media Repository
5. Select new image from grid

**Flow Diagram:**
```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│Data Grid │ ─► │  Click   │ ─► │ Replace  │ ─► │  Media   │
│          │    │ Ellipse  │    │  Media   │    │   Repo   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
```

**Pros:**
- Discoverable in context menu
- Groups related actions together
- Familiar dropdown pattern

**Cons:**
- Requires extra click for menu
- Menu options may be crowded

---

### Flow A5: Replace Button (From Editor)
**Rating: 9/10** | **Clicks: 3** | **Discovery: Medium**

Direct replace from Hero Image card in Editor sidebar.

**Steps:**
1. (Already in Editor panel with promotion selected)
2. Click "Replace" button in Hero Image card
3. Modal switches to Media Repository
4. Select new image from grid

**Flow Diagram:**
```
┌──────────┐    ┌──────────┐    ┌──────────┐
│  Editor  │ ─► │ Replace  │ ─► │  Media   │
│  Panel   │    │  Button  │    │   Repo   │
└──────────┘    └──────────┘    └──────────┘
```

**Pros:**
- Efficient when already in Editor
- Clear action button
- Preview visible in same view

**Cons:**
- Requires scrolling to Hero Image card
- Only available from Editor panel

---

## Category B: Access Layout Panel

### Overview
Four entry points to the Layout panel for hero image positioning. Layout is accessed via contextual links (not a primary tab) to support progressive disclosure.

---

### Flow B1: Contextual Prompt Card
**Rating: 10/10** | **Clicks: 2** | **Discovery: High**

Recommended primary entry point via prompt card in Editor.

**Steps:**
1. (In Editor panel with promotion selected)
2. Click "Open Layout →" button in prompt card

**Flow Diagram:**
```
┌──────────┐    ┌──────────┐    ┌──────────┐
│  Editor  │ ─► │  Prompt  │ ─► │  Layout  │
│  Panel   │    │   Card   │    │  Panel   │
└──────────┘    └──────────┘    └──────────┘
```

**Pros:**
- Highly visible prompt with explanation
- Educates users about Layout feature
- Appears at relevant moment

**Cons:**
- Can be dismissed (then hidden)
- Takes up space in Editor

---

### Flow B2: Background Section Link
**Rating: 8/10** | **Clicks: 3** | **Discovery: Medium**

Contextual link in Background card.

**Steps:**
1. (In Editor panel with promotion selected)
2. Scroll to Background card
3. Click "Edit in Layout →" link

**Flow Diagram:**
```
┌──────────┐    ┌──────────┐    ┌──────────┐
│  Editor  │ ─► │Background│ ─► │  Layout  │
│  Panel   │    │   Link   │    │  Panel   │
└──────────┘    └──────────┘    └──────────┘
```

**Pros:**
- Contextually relevant (near background controls)
- Available after prompt dismissed
- Clear directional link

**Cons:**
- Requires scrolling
- Less prominent than prompt card

---

### Flow B3: Toast Notification Action
**Rating: 9/10** | **Clicks: 2** | **Discovery: High**

Toast appears after selecting an image in Media Repository.

**Steps:**
1. (In Media Repository, select a new image)
2. Toast appears: "Image assigned to hero"
3. Click "Customize layout →" in toast

**Flow Diagram:**
```
┌──────────┐    ┌──────────┐    ┌──────────┐
│  Media   │ ─► │  Toast   │ ─► │  Layout  │
│   Repo   │    │  Action  │    │  Panel   │
└──────────┘    └──────────┘    └──────────┘
```

**Pros:**
- Timely suggestion at relevant moment
- Non-intrusive (auto-dismisses)
- Connects image selection to positioning

**Cons:**
- Auto-dismisses after 5 seconds
- May be missed if user looks away

---

### Flow B4: Fallback Text Link
**Rating: 6/10** | **Clicks: 2** | **Discovery: Low**

Subtle link that appears after dismissing prompt card.

**Steps:**
1. (In Editor, after dismissing prompt card)
2. Click "Customize layout →" text link

**Flow Diagram:**
```
┌──────────┐    ┌──────────┐    ┌──────────┐
│  Editor  │ ─► │ Fallback │ ─► │  Layout  │
│  Panel   │    │   Link   │    │  Panel   │
└──────────┘    └──────────┘    └──────────┘
```

**Pros:**
- Available after prompt dismissed
- Minimal UI footprint
- Always accessible

**Cons:**
- Easy to miss (small text link)
- Low visual prominence

---

## Category C: Tab Navigation

### Overview
Four ways to navigate between panels within the modal.

---

### Flow C1: Direct Tab Click
**Rating: 10/10** | **Clicks: 1** | **Discovery: High**

Standard tab navigation pattern.

**Steps:**
1. Click target tab in modal header

**Pros:**
- Single click
- Highly discoverable (tabs always visible)
- Standard UI pattern

---

### Flow C2: Breadcrumb Navigation
**Rating: 8/10** | **Clicks: 1** | **Discovery: Medium**

Navigate via breadcrumb trail.

**Steps:**
1. Click target item in breadcrumb (e.g., "Editor")

**Breadcrumb Pattern:**
```
Data Grid › Editor › Media
    ↑          ↑        ↑
 (closes    (returns  (current)
  modal)    to Editor)
```

**Pros:**
- Shows navigation context
- Single click
- Can close modal from breadcrumb

**Cons:**
- Breadcrumbs can be overlooked
- Small click targets

---

### Flow C3: Back to Editor Button
**Rating: 10/10** | **Clicks: 1** | **Discovery: High**

Prominent button on non-Editor panels.

**Steps:**
1. Click "← Editor" button

**Pros:**
- Highly visible
- Clear directional label
- Single click

**Cons:**
- Only goes to Editor (not other tabs)

---

### Flow C4: Close and Reopen
**Rating: 4/10** | **Clicks: 4** | **Discovery: High**

Inefficient path: close modal, return to grid, reselect.

**Steps:**
1. Click "Close" button
2. Return to Data Grid
3. Select same row
4. Open different tab

**Pros:**
- Always available
- User maintains control

**Cons:**
- Very inefficient (4 clicks)
- Loses modal state
- Not recommended

---

## Category D: Promotion Navigation

### Overview
Two ways to navigate between promotions while in the modal.

---

### Flow D1: Previous/Next Buttons
**Rating: 10/10** | **Clicks: 1** | **Discovery: High**

Navigate without returning to grid.

**Steps:**
1. Click "← Previous" or "Next →" button

**Pros:**
- Single click
- Stays in modal
- Updates all content in place

**Cons:**
- Disabled at list boundaries

---

### Flow D2: Return to Grid
**Rating: 5/10** | **Clicks: 4** | **Discovery: High**

Return to grid to select different promotion.

**Steps:**
1. Close modal
2. Select different row in grid
3. Open modal again

**Pros:**
- Full control over selection
- Can multi-select or jump to distant rows

**Cons:**
- Inefficient (4 clicks)
- Modal state may be lost

---

## Category E: Keyboard Shortcuts

### Overview
Proposed keyboard shortcuts for power users.

---

### Flow E1: Quick Access Keys
**Rating: 10/10** | **Keys: 1** | **Discovery: Low (but learnable)**

**Proposed Shortcuts:**

| Key | Action | Context |
|-----|--------|---------|
| `M` | Open Media tab | Row selected in grid |
| `E` or `Enter` | Open Editor | Row selected in grid |
| `L` | Open Layout panel | In Editor with single selection |
| `←` / `→` | Previous / Next promotion | Modal open |
| `Escape` | Close modal | Modal open |

**Pros:**
- Extremely efficient (single keystroke)
- Consistent with common patterns (Escape to close)
- Power users will love it

**Cons:**
- Low initial discoverability
- Requires documentation/learning

---

### Flow E2: Close Modal (Escape)
**Rating: 10/10** | **Keys: 1** | **Discovery: Medium**

Universal close shortcut.

**Steps:**
1. Press `Escape` key

**Pros:**
- Standard pattern (users expect it)
- Works from any panel
- Single keystroke

---

## Ranking Summary Matrix

### All Flows Ranked by Score

| Rank | ID | Flow Name | Clicks | Score | Discovery |
|------|----|-----------|---------:|------:|-----------|
| 1 | B1 | Contextual Prompt | 2 | **10** | High |
| 1 | C1 | Direct Tab Click | 1 | **10** | High |
| 1 | C3 | Back to Editor Button | 1 | **10** | High |
| 1 | D1 | Previous/Next Buttons | 1 | **10** | High |
| 1 | E1 | Keyboard Shortcuts | 1 | **10** | Low |
| 1 | E2 | Close (Escape) | 1 | **10** | Medium |
| 7 | A2 | Footer Tab Path | 4 | **9** | Medium |
| 7 | A5 | Replace Button | 3 | **9** | Medium |
| 7 | B3 | Toast Action | 2 | **9** | High |
| 10 | A1 | Standard Edit Path | 6 | **8** | High |
| 10 | A4 | Ellipse Menu | 4 | **8** | Medium |
| 10 | B2 | Background Link | 3 | **8** | Medium |
| 10 | C2 | Breadcrumb Navigation | 1 | **8** | Medium |
| 14 | A3 | Thumbnail Shortcut | 3 | **7** | Low |
| 15 | B4 | Fallback Link | 2 | **6** | Low |
| 16 | D2 | Return to Grid | 4 | **5** | High |
| 17 | C4 | Close and Reopen | 4 | **4** | High |

### By Category Summary

| Category | Best Flow | Score | Recommended |
|----------|-----------|-------|-------------|
| A: Change Hero | A2/A5 | 9 | Footer Tab or Replace Button |
| B: Access Layout | B1 | 10 | Contextual Prompt |
| C: Tab Navigation | C1/C3 | 10 | Direct Tab Click |
| D: Promo Navigation | D1 | 10 | Previous/Next Buttons |
| E: Keyboard | All | 10 | All shortcuts |

---

## Edge Cases

### Selection Edge Cases

| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| **E1** | No promotion selected | Primary tabs (Editor, Media, Design) disabled with 50% opacity. Tooltip: "Select a promotion to edit" |
| **E2** | Multiple promotions selected (2+) | Layout panel links disabled. All other primary tabs enabled. |
| **E3** | Category row selected | No action available. Category rows are grouping headers only. |
| **E4** | Deselect row while modal open | Modal remains open. Context preserved for current promotion. |

### Media Edge Cases

| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| **E5** | No hero image assigned | Show "No image" placeholder. "Add Image" button available. |
| **E6** | Image fails to load | Error state with retry button. Fallback placeholder shown. |
| **E7** | Search returns no results | Empty state message: "No images found. Try different search terms." |

### Navigation Edge Cases

| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| **E8** | Click "Data Grid" in breadcrumb | Closes modal. Returns to grid view. Selection preserved. |
| **E9** | Previous at first item / Next at last item | Button disabled. Visual indicator (grayed out). |
| **E10** | Tab switch during transition | Queue the switch OR block until transition complete (no double-clicks). |

### Layout Panel Edge Cases

| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| **E11** | Switch card size with unsaved changes | Auto-save current size config. No confirmation needed. |
| **E12** | All 9 sizes have custom configs | Visual indicator (purple dot) on each customized size. |
| **E13** | Reset to default template | Confirmation dialog: "Reset positioning to default?" |

---

## QA Test Checklist

### Category A: Change Hero Image

- [ ] **A1**: Complete Standard Edit Path (6 clicks)
- [ ] **A2**: Complete Footer Tab Path (4 clicks)
- [ ] **A3**: Verify Thumbnail Shortcut selects row AND opens Media
- [ ] **A4**: Verify Ellipse Menu contains "Replace Media" option
- [ ] **A5**: Complete Replace Button path from Editor

### Category B: Access Layout Panel

- [ ] **B1**: Verify Prompt Card appears and "Open Layout" works
- [ ] **B2**: Verify Background section "Edit in Layout" link works
- [ ] **B3**: Verify Toast appears after image selection
- [ ] **B4**: Verify Fallback Link appears after dismissing prompt

### Category C: Tab Navigation

- [ ] **C1**: Verify all tabs switch panels correctly
- [ ] **C2**: Verify breadcrumb navigation works
- [ ] **C3**: Verify "← Editor" button appears on non-Editor panels
- [ ] **C4**: Verify close/reopen preserves selection

### Category D: Promotion Navigation

- [ ] **D1**: Verify Previous/Next buttons cycle through promotions
- [ ] **D1**: Verify buttons disable at boundaries

### Category E: Keyboard Shortcuts

- [ ] **E1**: Verify `M` opens Media tab (when row selected)
- [ ] **E1**: Verify `E` or `Enter` opens Editor
- [ ] **E1**: Verify `L` opens Layout panel
- [ ] **E1**: Verify arrow keys navigate promotions
- [ ] **E2**: Verify `Escape` closes modal

### Edge Cases

- [ ] **E1**: Verify primary tabs disabled with no selection
- [ ] **E2**: Verify Layout disabled with multi-selection
- [ ] **E3**: Verify no action on category row click
- [ ] **E5**: Verify "No image" placeholder displays correctly
- [ ] **E8**: Verify breadcrumb "Data Grid" closes modal
- [ ] **E9**: Verify Prev/Next buttons disable at boundaries
- [ ] **E11**: Verify auto-save on size switch

---

*Document created: December 22, 2025*
*Last updated: December 22, 2025*
