# Promotion Attribute Locking — Migration Spec

## Prototype → Production Mapping

| Prototype File | Angular Component / Service |
|---|---|
| `js/lock-state.js` (LOCKABLE_FIELDS) | `src/app/shared/dto/promotion-lock-config.dto.ts` |
| `js/lock-service.js` | `src/app/core/services/promotion-lock.service.ts` |
| `js/lock-icon.js` + `css/lock.css` | `src/app/shared/components/lockable-field/` |
| `js/sidebar-editor.js` | N/A — prototype-only layout; production uses `dh-bottom-menu` editor panel |
| `js/bottom-menu-editor.js` | `src/app/shared/components/media-content/content-form/` (Editor tab in `dh-bottom-menu`) |
| `js/circular-builder.js` | `src/app/shared/components/media-content/content-treetable/` |
| `js/pd-builder.js` | `src/app/pd-builder/components/pd-builder/` |
| `js/app.js` | Existing app shell (no changes needed) |
| `mock-data/promotions.js` | API response from `/api/brands/{brandHash}/nodes/{nodeHash}/content` |
| `css/tokens.css` | `src/styles/_variables.scss` (add lock-specific tokens) |

## API Requirements

### New Fields on Promotion DTO
```typescript
interface PromotionLockConfig {
  global: 'none' | 'locked';
  attributes: Record<string, LockAttributeState>;
  lockedBy: string;
  lockedAt: string;  // ISO 8601
}

interface LockAttributeState {
  state: 'open' | 'locked' | 'constrained';
  min?: number;
  max?: number;
}
```

### Endpoints
- `GET /content` — includes `lockConfig` on each promotion
- `PUT /content/{hash}/lock` — update lock configuration
- Lock config persists as JSONB column on promotion record

## Guiding Principles — Role-Based Experience

### Lock States (per field)

| State | Meaning |
|---|---|
| **Open** | No restrictions — anyone can edit |
| **Locked** | Wholesaler has frozen this field — retailer cannot edit |
| **Constrained** | Wholesaler has set a min/max range — retailer can edit within bounds |

### Wholesaler (Lock Owner)

The wholesaler **sets and manages** all lock state. They are the only role that interacts with the locking system.

**Actions available:**
- Toggle individual field lock states (open → locked → constrained → open)
- Set constraint ranges (min/max) when a field is constrained
- Lock All / Unlock All bulk operations
- View Lock Summary panel (field-by-field state overview, clickable to toggle)

**UI elements shown:**
- Interactive lock icons on every lockable field (clickable)
- Constraint range inputs (`<input>`) when a field is set to constrained
- Lock toolbar in editor panel (Lock All, Unlock All, Lock Summary toggle)
- Lock Summary panel (expandable, shows counts + per-field state)
- Row-level lock column in table (aggregate icon: all / some / none)
- Section lock badges on accordion headers when entire section is locked

### Retailer (Lock Consumer)

The retailer **consumes** lock state set by the wholesaler. They have no ability to lock, unlock, or modify constraints.

**Actions available:**
- Edit **open** fields freely (no restrictions)
- Edit **constrained** fields within the wholesaler-defined min/max range
- View (read-only) which fields are locked and by whom

**UI elements shown:**
- Disabled fields with "Locked by [Wholesaler Name]" tooltip on locked fields
- Constraint hint text ("Allowed: $2.99 – $4.99") on constrained fields (read-only, not editable)
- Row-level lock column in table (informational — shows aggregate lock state)
- Section lock badges on accordion headers ("Category Locked")
- Info banner when viewing a promotion with any locks ("Some fields on this promotion have been locked by [name]")

**UI elements NOT shown:**
- Lock icons on fields (disabled state + hint text communicates everything)
- Lock Summary panel (wholesaler management tool only)
- Lock toolbar (Lock All / Unlock All buttons)
- Constraint range editors (wholesaler sets the range, retailer just sees it)

### Constrained Field Flow

1. **Wholesaler** toggles a field to "constrained" state
2. **Wholesaler** enters min/max range via editable inputs (e.g., $2.99 – $4.99)
3. **Retailer** sees the field as editable with a blue hint: "Allowed: $2.99 – $4.99"
4. **Retailer** can change the value but only within the bounds
5. If retailer enters a value outside the range, validation prevents it

### Visual System Summary

| Element | Wholesaler View | Retailer View |
|---|---|---|
| Open field | Gray `pi-lock-open`, no background | Normal editable field (no lock icon) |
| Locked field | Charcoal circle + white `pi-lock` | Disabled field + "Locked by" tooltip |
| Constrained field | Charcoal circle + white `pi-lock` + blue pip | Editable field + blue hint text |
| Row: all locked | Solid charcoal circle + white icon | Same (informational) |
| Row: some locked | Outline circle + dark icon + orange pip | Same (informational) |
| Row: none locked | Gray `pi-lock-open` | Same (informational) |

### Inline Editing (Table Cells)

Content can be edited inline directly in table rows in addition to the Editor panel. Lock state must affect inline editing without adding lock icons or visual clutter to individual cells. The row-level Lock column already communicates aggregate lock state at a glance.

**Wholesaler:**
- Can always inline-edit any cell — lock state restricts the retailer, not the wholesaler
- No change to inline editing behavior

**Retailer:**

| Field State | Inline Edit Behavior |
|---|---|
| **Open** | Normal click-to-edit |
| **Locked** | Cell is non-editable — `not-allowed` cursor + tooltip "Field locked" on hover |
| **Constrained** | Click-to-edit works — validation enforces min/max on blur |

**Visual treatment:** No lock icons, no overlays, no cell tinting at rest. Locked cells use `cursor: not-allowed` on hover and show a brief tooltip ("Field locked") to explain why the cell doesn't respond. This keeps the table clean while providing clear feedback when the retailer attempts to interact.

### Production Layout — Where Lock Controls Live

The prototype uses a right sidebar for the editor panel. **Production does not have this layout.** Both surfaces use the same UI architecture:

| Surface | User Role | App |
|---|---|---|
| **PD Builder** | Wholesaler (lock owner) | `ideal-sale-circular` PD Builder |
| **Digital Circular** | Retailer (lock consumer) | `digitalCircular2` Circular Builder |

**Production architecture:**
- **TreeTable** — main content area (categories + promotions)
- **`dh-bottom-menu`** — footer tabs: Editor, Media, Promotions, Categories
- **Editor tab** — full-width form panel that opens from bottom menu (where all field editing happens)
- **UTILITIES column** — table column with row-level action icons (eye, edit, remove)
- **No right sidebar** — there is no card utility bar in production

**Lock controls placement:**

| Control | Location | Visibility |
|---|---|---|
| Lock icons (per field) | Inline with field labels in Editor panel | Wholesaler only |
| Constraint range inputs | Below field in Editor panel | Wholesaler only |
| Lock All / Unlock All | Toolbar strip at top of Editor panel | Wholesaler only |
| Lock Summary toggle | Toolbar strip at top of Editor panel | Wholesaler only |
| Lock Summary panel | Collapsible panel within Editor panel | Wholesaler only |
| Row-level lock column | New column in TreeTable (between existing columns) | Both roles |
| Section lock badges | Accordion/category headers in TreeTable | Both roles |
| Info banner | Top of Editor panel | Retailer only (when locks exist) |
| Disabled fields | Form fields in Editor panel | Retailer only (locked fields) |
| Constraint hint text | Below field in Editor panel | Retailer only (constrained fields) |

**Key constraint:** When the user role is retailer, all wholesaler-only controls must be completely absent — no empty toolbars, no placeholder space, no layout shift. The Editor panel should look identical to today's layout except for disabled fields and hint text.

## Phase 2 Implementation Notes

1. **LockableFieldComponent** — standalone Angular component wrapping any form control with lock icon
2. **PromotionLockService** — injectable service matching `js/lock-service.js` API surface
3. **NgRx integration** — lock state managed via store, actions: `toggleLock`, `lockAll`, `unlockAll`, `updateConstraint`
4. **Permission guard** — wholesaler vs retailer determined by `hasPdBrandAccess` / user role
5. **Real-time sync** — lock changes propagate via Firebase to connected retailer sessions
