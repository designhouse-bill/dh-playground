# Promotion Attribute Locking — PRD, Use Cases & QA Playbook

## 1. Overview

### Problem Statement

In the Ideal Sale Circular Builder, wholesalers (PCC) create promotions that are distributed to retailers (RCC) for customization. Currently, retailers can modify any field on a promotion, which leads to brand inconsistency, pricing errors, and unapproved deal changes. Wholesalers need the ability to selectively lock individual fields or constrain numeric fields to acceptable ranges, while still allowing retailers to customize unlocked fields.

### Solution

A field-level attribute locking system that gives wholesalers granular control over which promotion fields retailers can edit. The system supports three lock states per field: **Open**, **Locked**, and **Constrained** (for numeric fields only).

### Roles

| Role | Label | Description |
|------|-------|-------------|
| **Wholesaler** | PCC (Primary Circular Creator) | Sets and manages locks on promotion fields. Can edit all fields regardless of lock state. |
| **Retailer** | RCC (Retail Circular Creator) | Views lock status. Cannot edit locked fields. Can edit constrained fields only within the allowed range. |

---

## 2. Lock States

Each lockable field has one of three states:

| State | Icon | Visual | Wholesaler Behavior | Retailer Behavior |
|-------|------|--------|---------------------|-------------------|
| **Open** | `pi-lock-open` (gray) | Gray icon, no background | Fully editable. Click icon to lock. | Fully editable. |
| **Locked** | `pi-lock` (white on charcoal circle) | Dark charcoal (#414042) filled circle with white lock icon | Fully editable. Click icon to cycle state. | **Read-only.** Field is disabled. Cannot be edited. |
| **Constrained** | `pi-lock` (white on charcoal circle + blue pip) | Same as locked + small blue (#2196F3) pip in top-right corner | Fully editable. Click icon to cycle state. Can set min/max range. | **Editable within range.** Value must fall between min and max. Out-of-range values are rejected with shake animation. |

### State Cycle (Wholesaler Click)

- **Fields that support constraints** (`deal.price`, `loyaltyDeal.price`, `deal.couponAmountOff`):
  `Open → Locked → Constrained → Open`

- **All other fields**:
  `Open → Locked → Open`

---

## 3. Lockable Fields

### 3.1 Field Registry (23 Fields)

| Field Key | Display Name | Section | Supports Constrained | Grouped |
|-----------|-------------|---------|---------------------|---------|
| `title` | Title | General | No | — |
| `description` | Description | General | No | — |
| `dateText` | Date Text | General | No | — |
| `categoryHash` | Category | General | No | — |
| `promoSize` | Size | General | No | — |
| `dateRange` | Date Range | Date Range | No | Yes (`validFrom`, `validTo`) |
| `cardStyleHash` | Card Style | Card | No | — |
| `deal.type` | Deal Type | Card | No | — |
| `deal.price` | Price | Card | **Yes** | — |
| `deal.units` | Units | Card | No | — |
| `upc` | UPC | Card | No | — |
| `couponId` | Coupon ID | Card | No | — |
| `loyaltyDeal.type` | Loyalty Deal Type | Card | No | — |
| `loyaltyDeal.price` | Loyalty Price | Card | **Yes** | — |
| `deal.couponAmountOff` | Coupon Amount Off | Coupon | **Yes** | — |
| `icons` | Icons | Media/Icons | No | — |
| `mediaSize` | Media Size | Media/Icons | No | — |
| `headline` | Headline | Headline | No | — |
| `background` | Background | Background | No | Yes (`backgroundColor`, `backgroundImage`, `position`, `size`, `repeat`) |
| `bogoDeal` | BOGO Deal | Card | No | Yes (`buyQuantity`, `getQuantity`, `getDeal`, `getDealType`) |

### 3.2 Sections (7)

| Section | Fields |
|---------|--------|
| General | title, description, dateText, categoryHash, promoSize |
| Date Range | dateRange |
| Card | cardStyleHash, deal.type, deal.price, deal.units, upc, couponId, loyaltyDeal.type, loyaltyDeal.price, bogoDeal |
| Coupon | deal.couponAmountOff |
| Media/Icons | icons, mediaSize |
| Headline | headline |
| Background | background |

### 3.3 Grouped Fields

When a grouped field is locked, **all sub-fields** in the group are locked together as a single unit:

| Group Key | Sub-Fields Locked Together |
|-----------|---------------------------|
| `dateRange` | validFrom, validTo |
| `background` | backgroundColor, backgroundImage, position, size, repeat |
| `bogoDeal` | buyQuantity, getQuantity, getDeal, getDealType |

---

## 4. Data Model

### lockConfig (per Promotion)

```json
{
  "global": "none",
  "attributes": {
    "title": { "state": "locked" },
    "deal.price": { "state": "constrained", "min": 2.99, "max": 5.99 },
    "description": { "state": "locked" }
  },
  "lockedBy": "Midwest Grocery Co.",
  "lockedAt": "2026-02-08T10:00:00Z"
}
```

- `global` — Reserved for future bulk lock behavior.
- `attributes` — Map of field key to lock state object.
- `lockedBy` — Display name of the wholesaler who set the locks.
- `lockedAt` — ISO timestamp of last lock modification.
- A field with no entry in `attributes` is treated as **Open**.
- A promotion with `lockConfig: null` has all fields **Open**.

---

## 5. Use Cases

### UC-1: Wholesaler Locks a Single Field

**Actor:** Wholesaler (PCC)
**Precondition:** Promotion is selected in the editor.
**Steps:**
1. Wholesaler clicks the lock icon next to the "Title" field label.
2. Icon changes from gray open lock to charcoal filled circle with white lock.
3. Lock state for `title` is set to `locked`.
4. `lockedAt` timestamp is updated.
5. Row lock icon in the data grid updates to reflect partial lock status (charcoal circle + blue pip).

**Postcondition:** When a retailer views this promotion, the Title field is disabled and shows a locked indicator.

---

### UC-2: Wholesaler Sets a Constraint on Price

**Actor:** Wholesaler (PCC)
**Precondition:** Promotion is selected. `deal.price` is currently open.
**Steps:**
1. Wholesaler clicks the lock icon next to "Price" → state becomes `locked`.
2. Wholesaler clicks the lock icon again → state becomes `constrained`.
3. Min/Max range inputs appear below the Price field.
4. Wholesaler enters Min: 2.99, Max: 5.99.
5. Constraint range is saved.

**Postcondition:** Retailer can edit the price but only within $2.99–$5.99. Values outside this range are rejected with a shake animation and the edit is reverted.

---

### UC-3: Wholesaler Locks All Fields

**Actor:** Wholesaler (PCC)
**Precondition:** Promotion is selected.
**Steps:**
1. Wholesaler clicks the "Lock All" button in the lock toolbar.
2. All 23 lockable fields are set to `locked`.
3. All field icons in the editor change to locked state.
4. Row lock icon changes to fully locked (solid charcoal circle, no pip).

**Postcondition:** Retailer cannot edit any field on this promotion.

---

### UC-4: Wholesaler Unlocks All Fields

**Actor:** Wholesaler (PCC)
**Precondition:** Promotion has some or all fields locked.
**Steps:**
1. Wholesaler clicks the "Unlock All" button.
2. Confirmation dialog appears: "Unlock all fields? This will remove all locks on this promotion."
3. Wholesaler confirms.
4. All field lock states are cleared (attributes emptied).
5. All icons revert to open (gray).
6. Row lock icon changes to open.

**Postcondition:** Retailer can edit all fields freely.

---

### UC-5: Wholesaler Reviews Lock Summary

**Actor:** Wholesaler (PCC)
**Precondition:** Promotion is selected.
**Steps:**
1. Wholesaler clicks the "Lock Summary" button in the toolbar.
2. Summary panel expands showing:
   - Count of locked fields, constrained fields, open fields, total.
   - List of all 23 fields with their current state and any constraint ranges.
3. Wholesaler clicks a field in the summary list to quick-toggle its lock state.

**Postcondition:** Lock states are updated without needing to scroll through the editor cards.

---

### UC-6: Retailer Encounters Locked Fields

**Actor:** Retailer (RCC)
**Precondition:** Promotion has locks set by wholesaler.
**Steps:**
1. Retailer selects the promotion in the data grid.
2. Editor panel opens showing a blue info banner: "Some fields have been locked by [Wholesaler Name]."
3. Locked fields have disabled inputs (grayed out, cursor: not-allowed).
4. Lock icons appear as read-only indicators (no click interaction).
5. Retailer cannot change locked field values.

**Postcondition:** Locked fields preserve wholesaler's intended values.

---

### UC-7: Retailer Edits a Constrained Field (Valid Value)

**Actor:** Retailer (RCC)
**Precondition:** `deal.price` is constrained with min: 2.99, max: 5.99. Current value: $4.49.
**Steps:**
1. Retailer double-clicks the Price cell in the data grid (or edits in the editor panel).
2. Input appears with constraint hint: "Allowed: $2.99 – $5.99".
3. Retailer enters 3.49.
4. Value is accepted, cell updates to "$3.49".

**Postcondition:** Price is updated within allowed range.

---

### UC-8: Retailer Edits a Constrained Field (Invalid Value)

**Actor:** Retailer (RCC)
**Precondition:** `deal.price` is constrained with min: 2.99, max: 5.99. Current value: $4.49.
**Steps:**
1. Retailer double-clicks the Price cell.
2. Retailer enters 1.99 (below minimum).
3. Cell shakes with animation (0.3s), input border turns red.
4. After animation, value reverts to the original "$4.49".
5. Cell returns to read mode.

**Postcondition:** Out-of-range value is rejected. Original value preserved.

---

### UC-9: Retailer Attempts to Edit a Locked Field via Inline Edit

**Actor:** Retailer (RCC)
**Precondition:** `title` field is locked.
**Steps:**
1. Retailer double-clicks the Title cell in the data grid.
2. Nothing happens — cell has `cursor: not-allowed` and `cell-locked` class.
3. Tooltip shows "Field locked".

**Postcondition:** No edit mode is entered. Field value is unchanged.

---

### UC-10: Wholesaler Edits a Locked Field

**Actor:** Wholesaler (PCC)
**Precondition:** `title` field is locked.
**Steps:**
1. Wholesaler double-clicks the Title cell in the data grid.
2. Edit mode opens normally — locks do not restrict wholesaler editing.
3. Wholesaler changes the value and confirms.

**Postcondition:** Value is updated. Lock state is unchanged.

---

### UC-11: Lock State Persists Across View Switches

**Actor:** Wholesaler (PCC)
**Steps:**
1. Wholesaler locks the "Title" field on a promotion in the Circular Builder view.
2. Wholesaler switches to PD Builder view.
3. Wholesaler switches back to Circular Builder view.
4. Selects the same promotion.

**Postcondition:** "Title" field still shows as locked. Lock state is preserved in the state object, not in the DOM.

---

### UC-12: Lock State Visible in Data Grid Row

**Actor:** Any
**Precondition:** Promotions have varying lock states.
**Steps:**
1. User views the data grid.
2. Each row's LOCK column shows a summary icon:
   - **No locks:** Gray open lock icon.
   - **Some locks (partial):** Charcoal circle + blue pip.
   - **All fields locked:** Solid charcoal circle, no pip.

**Postcondition:** User can quickly scan which promotions have locks without opening the editor.

---

### UC-13: Grouped Field Lock (Background)

**Actor:** Wholesaler (PCC)
**Steps:**
1. Wholesaler clicks the lock icon next to "Background" in the editor.
2. All five background sub-fields (color, image, position, size, repeat) become locked as a unit.

**Postcondition:** Retailer cannot modify any of the five background sub-fields. There is no way to lock individual sub-fields separately.

---

### UC-14: Section Lock Badge Display

**Actor:** Wholesaler (PCC)
**Precondition:** All fields in the "General" section (title, description, dateText, categoryHash, promoSize) are locked.
**Steps:**
1. Wholesaler views the editor.
2. The "Content" card header shows a "Locked" badge.

**Postcondition:** Badge disappears if even one field in the section is unlocked.

---

## 6. UI Playbook — Where Locks Appear

### 6.1 Data Grid (Circular Builder)

| Location | Element | Lock Behavior |
|----------|---------|---------------|
| **LOCK column** (per row) | Summary lock icon | Shows open/partial/fully-locked icon per promotion. Read-only — not clickable. |
| **TITLE cell** | Inline-editable text | Wholesaler: always editable. Retailer: editable if open, read-only if locked, range-validated if constrained. |
| **PRICE cell** | Inline-editable number | Same as TITLE. Constrained fields show hint "Allowed: $X – $Y" during editing. |
| **Category row** | Blue row header | No lock interaction. Category-level locking is not supported (locks are per-promotion, per-field). |

### 6.2 Editor Panel (Bottom Menu — Editor Tab)

#### Editor Header
- **Info Banner** (Retailer only): Blue banner appears when the promotion has any locks. Shows: "Some fields have been locked by [Wholesaler Name]."
- **Lock Toolbar** (Wholesaler only): Three buttons below the editor header:
  - **Lock All** — Locks every field on the promotion.
  - **Unlock All** — Clears all locks (with confirmation dialog).
  - **Lock Summary** — Toggles the summary panel.

#### Lock Summary Panel (Wholesaler only)
- Expandable panel showing all 23 fields with their current lock state.
- Displays counts: X locked, Y constrained, Z open, N total.
- Each field row is clickable to quick-toggle its lock state.
- Constrained fields show their min/max range.

#### Card Layout — Lock Icons per Field
Each form field label includes a lock icon (wholesaler only):

| Card | Fields with Lock Icons |
|------|----------------------|
| **Content** | Title, Description, Date Text, Category, Size |
| **Coupon** | Coupon ID, Coupon Amount Off |
| **Deal/Offer** | Card Style, Deal Type, Price, Units, UPC, BOGO Deal, Loyalty Deal Type, Loyalty Price |
| **Headline** | Headline |
| **Media/Icons** | Icons, Media Size |
| **Date range** | Date Range |
| **Background** | Background |

- Wholesaler sees lock icons next to every field label. Click to cycle state.
- Retailer sees **no lock icons** on field labels. Lock status is communicated via disabled inputs and the info banner.

#### Card Header Badges
- When **all fields in a section** are locked, the card header shows a "Locked" badge (wholesaler) or "Category Locked" badge (retailer).
- Badge disappears if any field in the section is unlocked.

#### Constrained Field Behavior
- **Wholesaler**: When a field is in "constrained" state, min/max input fields appear below the form field. Wholesaler can adjust the range.
- **Retailer**: When a field is constrained, editing shows a read-only hint: "Allowed: $X.XX – $Y.XX". Values outside the range are rejected.

### 6.3 Lock Icon Visual System

| State | Class | Background | Icon | Pip | Tooltip (Wholesaler) | Tooltip (Retailer) |
|-------|-------|-----------|------|-----|---------------------|-------------------|
| Open | `lock-icon--open` | None | Gray `pi-lock-open` | None | "Click to lock" | (none) |
| Locked | `lock-icon--locked` | Charcoal circle (#414042) | White `pi-lock` | None | "Click to change lock state" | "Locked by [name]" |
| Constrained | `lock-icon--constrained` | Charcoal circle (#414042) | White `pi-lock` | Blue (#2196F3) top-right | "Click to change lock state" | "Locked by [name]" |
| Partial (row) | `lock-icon--partial` | Charcoal circle (#414042) | White `pi-lock` | Blue (#2196F3) top-right | "Some fields locked" | "Some fields locked" |

### 6.4 Color Token Rules

| Token / Color | Usage | NOT Used For |
|---------------|-------|-------------|
| `--dh-color-danger` (#D32F2F) / Red | Errors only | Lock states |
| `--dh-color-grid-label-override` (#f57c00) / Orange | Data override/change indicators | Lock states |
| `--dh-color-primary` (#2196F3) / Blue | Constrained pip, constraint inputs/hints, info banner | — |
| `--dh-top-bar-bg` (#414042) / Dark Charcoal | Lock icon circle fill (locked + constrained) | — |

---

## 7. QA Test Cases

### 7.1 Lock State Management — Wholesaler

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| T-01 | Lock a single field | Select promo → Click lock icon on "Title" | Icon changes to locked state. Field state = `locked`. |
| T-02 | Unlock a single field | Click locked "Title" icon | Icon returns to open state. Field state = `open`. |
| T-03 | Cycle through constrained state | Click lock icon on "Price" 3 times | Cycle: open → locked → constrained → open. |
| T-04 | Non-constrainable field skips constrained | Click lock icon on "Description" 2 times | Cycle: open → locked → open. No constrained state. |
| T-05 | Lock All button | Click "Lock All" in toolbar | All 23 fields show locked icon. Row icon = fully locked. |
| T-06 | Unlock All button | Click "Unlock All" → Confirm dialog | All fields show open icon. Row icon = open. Confirm dialog required. |
| T-07 | Unlock All cancel | Click "Unlock All" → Cancel dialog | No change. All locks remain. |
| T-08 | Set constraint range | Lock "Price" to constrained → Set min: 1.00, max: 10.00 | Range inputs appear. Values persist. |
| T-09 | Modify constraint range | Change existing min from 1.00 to 2.00 | New min value saved. `lockedAt` updated. |
| T-10 | Lock Summary panel toggle | Click "Lock Summary" | Panel expands with field list and counts. Click again to collapse. |
| T-11 | Quick-toggle from summary | Open summary → Click a field row | Field cycles to next lock state. Summary updates. |
| T-12 | Wholesaler edits locked field | Lock "Title" → Double-click Title cell in grid | Edit mode opens. Wholesaler can change value despite lock. |
| T-13 | Wholesaler edits constrained field | Set Price constrained 2–5 → Edit Price cell | Edit mode opens. No range validation for wholesaler. Can enter any value. |

### 7.2 Lock Enforcement — Retailer

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| T-20 | Locked field disabled in editor | Switch to Retailer → Open promo with locked Title | Title input is disabled (grayed out, cursor: not-allowed). |
| T-21 | Locked field not inline-editable | Double-click locked Title cell in grid | Nothing happens. Cell shows `cursor: not-allowed`. Tooltip: "Field locked". |
| T-22 | Open field editable | Double-click an open field cell | Edit mode opens normally. |
| T-23 | Constrained field inline edit — valid | Double-click constrained Price (min: 2.99, max: 5.99) → Enter 3.50 | Value accepted. Cell shows "$3.50". |
| T-24 | Constrained field inline edit — below min | Enter 1.00 (min: 2.99) | Cell shakes. Value reverts to original. |
| T-25 | Constrained field inline edit — above max | Enter 9.99 (max: 5.99) | Cell shakes. Value reverts to original. |
| T-26 | Constrained field inline edit — NaN | Enter "abc" | Cell shakes. Value reverts to original. |
| T-27 | Constraint hint displayed | Double-click constrained Price | Hint text below input: "Allowed: $2.99 – $5.99". |
| T-28 | Info banner displayed | Switch to Retailer → Open promo with any locks | Blue banner: "Some fields have been locked by [name]". |
| T-29 | No info banner for unlocked promo | Open promo with no locks | No banner displayed. |
| T-30 | No lock icons visible | Switch to Retailer → Open any promo | Field labels do NOT show lock icons. Lock status conveyed only via disabled state and banner. |
| T-31 | Lock toolbar hidden | Switch to Retailer | "Lock All", "Unlock All", "Lock Summary" buttons not visible. |

### 7.3 Grouped Fields

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| T-40 | Lock dateRange group | Wholesaler locks "Date Range" | Both `validFrom` and `validTo` inputs disabled for retailer. |
| T-41 | Lock background group | Wholesaler locks "Background" | All 5 background sub-fields (color, image, position, size, repeat) disabled for retailer. |
| T-42 | Lock bogoDeal group | Wholesaler locks "BOGO Deal" | buyQuantity, getQuantity, getDeal all disabled for retailer. |
| T-43 | Partial group — not possible | Attempt to lock only backgroundColor independently | Not possible. Background is a single lockable unit. All sub-fields lock/unlock together. |

### 7.4 Visual Indicators

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| T-50 | Row icon — no locks | View promo with no lockConfig | LOCK column: gray `pi-lock-open` icon. Tooltip: "No locks". |
| T-51 | Row icon — partial locks | View promo with some fields locked | LOCK column: charcoal circle + blue pip. Tooltip: "Some fields locked". |
| T-52 | Row icon — fully locked | View promo with all 23 fields locked | LOCK column: solid charcoal circle, no pip. Tooltip: "All fields locked". |
| T-53 | Section badge — all locked | Lock all fields in "General" section | Content card header shows "Locked" badge. |
| T-54 | Section badge — partial | Lock 3 of 5 General fields | No badge on Content card header. |
| T-55 | Section badge — retailer label | Switch to Retailer, view fully locked section | Badge shows "Category Locked" (vs "Locked" for wholesaler). |
| T-56 | Lock icon colors | Inspect lock icons for all 3 states | Open: gray. Locked: charcoal circle + white icon. Constrained: charcoal circle + white icon + blue pip. No red or orange used. |

### 7.5 Cross-View & State Persistence

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| T-60 | Locks persist across view switch | Lock fields → Switch to PD Builder → Switch back → Reselect promo | Lock states preserved exactly. |
| T-61 | Locks persist across profile switch | Lock fields as Wholesaler → Switch to Retailer → Switch back | Lock states preserved. Wholesaler sees same lock configuration. |
| T-62 | Editor syncs with inline edit | Double-click Price in grid → Save → Check editor panel | Editor panel shows updated price. Lock state unchanged. |
| T-63 | Grid syncs with editor lock change | Toggle lock in editor → Check grid row | Grid row lock icon updates immediately. |
| T-64 | Deselect clears editor | Click selected row again (deselect) | Bottom editor panel closes. |
| T-65 | Select different promo | Select promo A → Select promo B | Editor shows promo B's lock state, not promo A's. |

### 7.6 Edge Cases

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| T-70 | Promo with null lockConfig | Select unlocked promo | All fields editable. No banner (retailer). All icons open (wholesaler). |
| T-71 | Lock All then Unlock All | Lock All → Unlock All → Confirm | All 23 fields return to open. No leftover lock state. |
| T-72 | Constrained with min = max | Set deal.price constrained, min: 3.00, max: 3.00 | Retailer can only enter exactly 3.00. Any other value rejected. |
| T-73 | Constrained with min > max | Set min: 5.00, max: 2.00 | All retailer values rejected (no valid range). System does not auto-correct — wholesaler must fix. |
| T-74 | Escape during inline edit | Enter edit mode → Press Escape | Edit canceled. Original value restored. No save occurs. |
| T-75 | Enter during inline edit | Enter edit mode → Type value → Press Enter | Blur triggered → Save logic runs. Value saved if valid. |
| T-76 | Quick successive lock toggles | Rapidly click lock icon 5 times | State cycles correctly. No race conditions. Final state matches expected cycle position. |
| T-77 | Lock Summary counts accuracy | Lock 5 fields, constrain 2, leave 16 open | Summary shows: 5 locked, 2 constrained, 16 open, 23 total. |

---

## 8. Acceptance Criteria

1. Wholesaler can lock/unlock individual fields with single-click cycling.
2. Wholesaler can set min/max constraints on price fields (deal.price, loyaltyDeal.price, deal.couponAmountOff).
3. Wholesaler can Lock All / Unlock All with one click (Unlock All requires confirmation).
4. Wholesaler can view Lock Summary panel with counts and quick-toggle capability.
5. Retailer sees locked fields as disabled (both in editor panel and inline grid editing).
6. Retailer can edit constrained fields only within the specified range.
7. Invalid constrained values trigger visual feedback (shake) and revert.
8. Lock state is indicated in the data grid via the LOCK column icon (open/partial/full).
9. Lock icons use the approved visual system (charcoal + blue, no red/orange).
10. Grouped fields (dateRange, background, bogoDeal) lock/unlock as a unit.
11. Section lock badges appear on card headers when all fields in a section are locked.
12. Lock state persists across view switches and profile switches within a session.
13. Wholesaler editing is never restricted by lock state — locks only affect retailers.

---

## 9. Out of Scope (Future Considerations)

- Global lock (lock entire promotion with one toggle)
- Lock inheritance (category-level locks propagated to all promotions)
- Lock audit trail / history
- Multi-user conflict resolution (two wholesalers editing locks simultaneously)
- API persistence (current prototype uses in-memory state only)
- Permission-based lock management (restricting which wholesaler users can set locks)
- Notification to retailers when locks change
