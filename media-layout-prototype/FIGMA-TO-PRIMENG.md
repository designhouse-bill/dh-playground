# Figma to PrimeNG Translation Guide

How to share Figma designs and translate them to PrimeNG components.

---

## Sharing Figma Designs with Claude

### What to Include in Screenshots

1. **Full component/screen** - Show the complete context
2. **Multiple states** - Hover, active, disabled, error states
3. **Annotations** - Note interactive elements, data sources
4. **Spacing indicators** - If precise spacing matters
5. **Color values** - Include hex codes if visible

### Example Prompt Template

```
Here's a Figma screenshot of [component name/page].

Please create an HTML prototype using PrimeNG/Aura styling.
- Use design tokens from PRIMENG-TOKENS.md
- Primary color: #2196F3
- Follow patterns from PRIMENG-COMPONENTS.md

Key requirements:
- [List specific functionality]
- [Note interactive elements]
- [Mention responsive behavior]
```

### Good vs Bad Screenshots

**Good:**
- Clear, high resolution
- Shows full component with padding/margins visible
- Multiple states shown (or noted)
- Text is readable

**Bad:**
- Cropped too tight (missing context)
- Low resolution/blurry
- Only shows one state
- Missing labels/annotations

---

## Common Figma Patterns → PrimeNG Components

### Form Elements

| Figma Pattern | PrimeNG Component | Notes |
|---------------|-------------------|-------|
| Text field | `p-inputtext` | Use `.p-fluid` for full-width |
| Text area | `p-inputtextarea` | Set rows attribute |
| Dropdown/Select | `p-select` (v19+) or `p-dropdown` | Has search built-in |
| Checkbox | `p-checkbox` | Wrap in `.p-field-checkbox` |
| Radio buttons | `p-radiobutton` | Group with same `name` |
| Toggle/Switch | `p-inputswitch` | Binary on/off |
| Slider | `p-slider` | Range selection |
| Date picker | `p-calendar` | Multiple modes available |
| Color picker | `p-colorpicker` | Returns hex value |
| File upload | `p-fileupload` | Drag-drop or button |

### Buttons

| Figma Pattern | PrimeNG | HTML Class |
|---------------|---------|------------|
| Primary button | `p-button` | `.p-button-primary` |
| Secondary/Outline | `p-button` | `.p-button-outlined` |
| Ghost/Text button | `p-button` | `.p-button-text` |
| Icon button | `p-button` | `.p-button-icon-only` |
| Danger/Destructive | `p-button` | `.p-button-danger` |
| Button group | `p-buttongroup` | `.p-buttonset` |
| Split button | `p-splitbutton` | Dropdown attached |

### Containers

| Figma Pattern | PrimeNG Component | Notes |
|---------------|-------------------|-------|
| Card | `p-card` | Header, body, footer slots |
| Panel/Section | `p-panel` | Collapsible option |
| Accordion | `p-accordion` | Multiple collapsible sections |
| Tabs | `p-tabview` | Tab navigation |
| Fieldset | `p-fieldset` | Form grouping with legend |

### Data Display

| Figma Pattern | PrimeNG Component | Notes |
|---------------|-------------------|-------|
| Table | `p-table` | Sorting, filtering, pagination |
| List | `p-listbox` or custom | Selection support |
| Tree | `p-tree` | Hierarchical data |
| Tag/Chip | `p-tag` or `p-chip` | Labels, categories |
| Badge | `p-badge` | Notifications, counts |
| Avatar | `p-avatar` | User images/initials |

### Overlays & Dialogs

| Figma Pattern | PrimeNG Component | Notes |
|---------------|-------------------|-------|
| Modal/Dialog | `p-dialog` | Header, content, footer |
| Drawer/Sidebar | `p-drawer` (v19+) or `p-sidebar` | Slide-in panel |
| Popover | `p-popover` (v19+) or `p-overlaypanel` | Contextual content |
| Tooltip | `p-tooltip` | Directive-based |
| Context menu | `p-contextmenu` | Right-click menu |
| Dropdown menu | `p-menu` or `p-tieredmenu` | Nested menus |

### Feedback

| Figma Pattern | PrimeNG Component | Notes |
|---------------|-------------------|-------|
| Toast/Snackbar | `p-toast` | Top-right by default |
| Alert/Banner | `p-message` or `p-messages` | Inline alerts |
| Progress bar | `p-progressbar` | Determinate/indeterminate |
| Spinner | `p-progressspinner` | Loading indicator |
| Skeleton | `p-skeleton` | Loading placeholder |

### Navigation

| Figma Pattern | PrimeNG Component | Notes |
|---------------|-------------------|-------|
| Breadcrumb | `p-breadcrumb` | Path navigation |
| Pagination | `p-paginator` | Page navigation |
| Steps/Stepper | `p-steps` | Multi-step wizard |
| Menu bar | `p-menubar` | Top navigation |
| Sidebar nav | `p-panelmenu` | Vertical nav |

---

## Translation Examples

### Example 1: Form Card

**Figma shows:** A card with form fields for editing an item (name, category dropdown, toggle for active status, save/cancel buttons)

**Prompt:**
```
Create a form card for editing items with:
- Text input for name
- Dropdown for category (Produce, Dairy, Meat, Bakery)
- Toggle switch for active status
- Cancel (text) and Save (primary) buttons in footer

Use PrimeNG/Aura styling with blue primary (#2196F3).
```

**Expected output:**
```html
<div class="p-card" style="max-width: 400px;">
  <div class="p-card-header">
    <h3 class="p-card-title">Edit Item</h3>
  </div>
  <div class="p-card-body">
    <div class="p-fluid">
      <div class="p-field">
        <label for="name">Name</label>
        <input id="name" type="text" class="p-inputtext">
      </div>
      <div class="p-field">
        <label for="category">Category</label>
        <select id="category" class="p-dropdown">
          <option>Produce</option>
          <option>Dairy</option>
          <option>Meat</option>
          <option>Bakery</option>
        </select>
      </div>
      <div class="p-field flex align-items-center gap-2">
        <label for="active" class="mb-0">Active</label>
        <input type="checkbox" id="active" class="p-inputswitch">
      </div>
    </div>
  </div>
  <div class="p-card-footer flex justify-content-end gap-2">
    <button class="p-button p-button-text">Cancel</button>
    <button class="p-button p-button-primary">Save</button>
  </div>
</div>
```

### Example 2: Data Table

**Figma shows:** A table with product data, sortable columns, edit button per row, pagination at bottom

**Prompt:**
```
Create a data table showing products with columns:
- Product name (sortable)
- Category
- Price (right-aligned)
- Actions (edit icon button)

Include pagination below the table.
Use PrimeNG table styling.
```

### Example 3: Dialog/Modal

**Figma shows:** A confirmation dialog with warning icon, message, cancel and confirm buttons

**Prompt:**
```
Create a confirmation dialog that:
- Shows warning icon and "Are you sure?" message
- Has descriptive text explaining the action
- Cancel (secondary) and Confirm (danger) buttons
- Is centered with overlay backdrop

Use PrimeNG dialog styling.
```

---

## Handling Figma Design System Differences

### When Figma Uses Different Colors

If the Figma design uses colors that don't match our tokens:

1. **Primary actions:** Always use `#2196F3` (our standard)
2. **Status colors:** Map to our tokens (`$p-success`, `$p-error`, etc.)
3. **Neutrals:** Use our surface tokens
4. **Brand colors:** Ask for clarification or use closest token

### When Figma Shows Custom Components

If Figma shows a component that doesn't map directly to PrimeNG:

1. **Identify the closest PrimeNG component**
2. **Use Pass Through (PT) for customization** if needed
3. **Combine multiple PrimeNG components** if necessary
4. **Build custom only if PrimeNG can't handle it**

### Spacing & Layout

Figma spacing → PrimeNG tokens:
- 4px → `$p-spacing-1` / `var(--p-spacing-1)`
- 8px → `$p-spacing-2`
- 12px → `$p-spacing-3`
- 16px → `$p-spacing-4`
- 24px → `$p-spacing-6`
- 32px → `$p-spacing-8`

---

## Quick Reference for Common Tasks

### "Make this button primary"
```html
<button class="p-button p-button-primary">Label</button>
```

### "Add icon to button"
```html
<button class="p-button p-button-primary">
  <i class="pi pi-check"></i>
  <span>Save</span>
</button>
```

### "Make form fields full-width"
```html
<div class="p-fluid">
  <!-- Fields will be full width -->
</div>
```

### "Add spacing between elements"
```html
<div class="flex gap-2">
  <!-- Children will have 8px gap -->
</div>
```

### "Center content"
```html
<div class="flex justify-content-center align-items-center">
  <!-- Centered content -->
</div>
```

### "Make card have shadow"
```html
<div class="p-card shadow-2">
  <!-- Card with elevation -->
</div>
```

---

## Related Documents

- `PRIMENG-COMPONENTS.md` - Copy/paste HTML patterns
- `PRIMENG-TOKENS.md` - Design token values
- `CLAUDE.md` - Project-wide defaults
