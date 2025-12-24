# PrimeNG Component Quick Reference

HTML patterns for prototyping with PrimeNG styling. Copy/paste these into your prototypes.

**Theme:** Aura | **Primary Color:** `#2196F3`

---

## Table of Contents

1. [Buttons](#buttons)
2. [Cards](#cards)
3. [Form Inputs](#form-inputs)
4. [Dialogs & Overlays](#dialogs--overlays)
5. [Data Display](#data-display)
6. [Navigation](#navigation)
7. [Feedback](#feedback)
8. [Layout Utilities](#layout-utilities)

---

## Buttons

### Primary Button
```html
<button class="p-button p-button-primary">
  <span class="p-button-label">Primary Action</span>
</button>
```

### Secondary Button
```html
<button class="p-button p-button-secondary">
  <span class="p-button-label">Secondary</span>
</button>
```

### Text Button
```html
<button class="p-button p-button-text">
  <span class="p-button-label">Text Button</span>
</button>
```

### Outlined Button
```html
<button class="p-button p-button-outlined">
  <span class="p-button-label">Outlined</span>
</button>
```

### Icon Button
```html
<button class="p-button p-button-icon-only">
  <i class="pi pi-plus"></i>
</button>
```

### Button with Icon
```html
<button class="p-button p-button-primary">
  <i class="pi pi-check p-button-icon p-button-icon-left"></i>
  <span class="p-button-label">Save</span>
</button>
```

### Button Sizes
```html
<button class="p-button p-button-sm">Small</button>
<button class="p-button">Normal</button>
<button class="p-button p-button-lg">Large</button>
```

### Button Severities
```html
<button class="p-button p-button-success">Success</button>
<button class="p-button p-button-warning">Warning</button>
<button class="p-button p-button-danger">Danger</button>
<button class="p-button p-button-info">Info</button>
<button class="p-button p-button-help">Help</button>
```

### Button Group
```html
<div class="p-buttonset">
  <button class="p-button">Left</button>
  <button class="p-button">Center</button>
  <button class="p-button">Right</button>
</div>
```

---

## Cards

### Basic Card
```html
<div class="p-card">
  <div class="p-card-body">
    <p>Card content goes here.</p>
  </div>
</div>
```

### Card with Header
```html
<div class="p-card">
  <div class="p-card-header">
    <h3 class="p-card-title">Card Title</h3>
  </div>
  <div class="p-card-body">
    <p>Card content goes here.</p>
  </div>
</div>
```

### Card with Footer
```html
<div class="p-card">
  <div class="p-card-header">
    <h3 class="p-card-title">Card Title</h3>
  </div>
  <div class="p-card-body">
    <p>Card content goes here.</p>
  </div>
  <div class="p-card-footer">
    <button class="p-button p-button-text">Cancel</button>
    <button class="p-button p-button-primary">Save</button>
  </div>
</div>
```

### Card with Subtitle
```html
<div class="p-card">
  <div class="p-card-header">
    <h3 class="p-card-title">Title</h3>
    <p class="p-card-subtitle">Subtitle text here</p>
  </div>
  <div class="p-card-body">
    <p>Content</p>
  </div>
</div>
```

---

## Form Inputs

### Text Input
```html
<div class="p-field">
  <label for="name">Name</label>
  <input id="name" type="text" class="p-inputtext" placeholder="Enter name">
</div>
```

### Text Input with Icon
```html
<div class="p-input-icon-left">
  <i class="pi pi-search"></i>
  <input type="text" class="p-inputtext" placeholder="Search">
</div>
```

### Textarea
```html
<div class="p-field">
  <label for="description">Description</label>
  <textarea id="description" class="p-inputtextarea" rows="4"></textarea>
</div>
```

### Dropdown/Select
```html
<div class="p-field">
  <label for="size">Card Size</label>
  <select id="size" class="p-dropdown">
    <option value="1x1">1x1</option>
    <option value="2x2">2x2</option>
    <option value="3x3">3x3</option>
  </select>
</div>
```

### Checkbox
```html
<div class="p-field-checkbox">
  <input type="checkbox" id="active" class="p-checkbox">
  <label for="active">Active</label>
</div>
```

### Radio Buttons
```html
<div class="p-field-radiobutton">
  <input type="radio" id="opt1" name="option" class="p-radiobutton">
  <label for="opt1">Option 1</label>
</div>
<div class="p-field-radiobutton">
  <input type="radio" id="opt2" name="option" class="p-radiobutton">
  <label for="opt2">Option 2</label>
</div>
```

### Slider
```html
<div class="p-field">
  <label>Scale: <span id="scale-value">100%</span></label>
  <input type="range" class="p-slider" min="10" max="200" value="100">
</div>
```

### Input Number
```html
<div class="p-field">
  <label for="quantity">Quantity</label>
  <div class="p-inputnumber">
    <button class="p-inputnumber-button p-inputnumber-button-down">
      <i class="pi pi-minus"></i>
    </button>
    <input type="number" id="quantity" class="p-inputnumber-input" value="1">
    <button class="p-inputnumber-button p-inputnumber-button-up">
      <i class="pi pi-plus"></i>
    </button>
  </div>
</div>
```

### Color Picker (Simplified)
```html
<div class="p-field">
  <label>Background Color</label>
  <div class="color-swatches">
    <button class="color-swatch" style="background: #4CAF50"></button>
    <button class="color-swatch" style="background: #2196F3"></button>
    <button class="color-swatch" style="background: #9C27B0"></button>
    <button class="color-swatch selected" style="background: #ffffff"></button>
  </div>
</div>
```

### Form Group
```html
<div class="p-fluid">
  <div class="p-field">
    <label for="name">Name</label>
    <input id="name" type="text" class="p-inputtext">
  </div>
  <div class="p-field">
    <label for="email">Email</label>
    <input id="email" type="email" class="p-inputtext">
  </div>
  <div class="p-field">
    <button class="p-button p-button-primary" style="width: 100%">Submit</button>
  </div>
</div>
```

---

## Dialogs & Overlays

### Dialog/Modal
```html
<div class="p-dialog-mask p-dialog-visible">
  <div class="p-dialog" style="width: 500px;">
    <div class="p-dialog-header">
      <span class="p-dialog-title">Dialog Title</span>
      <button class="p-dialog-header-close">
        <i class="pi pi-times"></i>
      </button>
    </div>
    <div class="p-dialog-content">
      <p>Dialog content goes here.</p>
    </div>
    <div class="p-dialog-footer">
      <button class="p-button p-button-text">Cancel</button>
      <button class="p-button p-button-primary">Confirm</button>
    </div>
  </div>
</div>
```

### Sidebar/Drawer
```html
<div class="p-sidebar p-sidebar-right p-sidebar-active" style="width: 400px;">
  <div class="p-sidebar-header">
    <span class="p-sidebar-title">Settings</span>
    <button class="p-sidebar-close">
      <i class="pi pi-times"></i>
    </button>
  </div>
  <div class="p-sidebar-content">
    <!-- Sidebar content -->
  </div>
</div>
```

### Tooltip
```html
<button class="p-button" data-tooltip="This is a tooltip">
  Hover me
</button>
```

### Popover/OverlayPanel
```html
<div class="p-overlaypanel">
  <div class="p-overlaypanel-content">
    <p>Popover content</p>
  </div>
</div>
```

---

## Data Display

### Basic Table
```html
<div class="p-datatable">
  <table>
    <thead class="p-datatable-thead">
      <tr>
        <th>Name</th>
        <th>Category</th>
        <th>Price</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody class="p-datatable-tbody">
      <tr>
        <td>Product A</td>
        <td>Electronics</td>
        <td>$99.00</td>
        <td>
          <button class="p-button p-button-text p-button-sm">
            <i class="pi pi-pencil"></i>
          </button>
        </td>
      </tr>
      <tr>
        <td>Product B</td>
        <td>Clothing</td>
        <td>$49.00</td>
        <td>
          <button class="p-button p-button-text p-button-sm">
            <i class="pi pi-pencil"></i>
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### Tag/Badge
```html
<span class="p-tag">Default</span>
<span class="p-tag p-tag-success">Success</span>
<span class="p-tag p-tag-warning">Warning</span>
<span class="p-tag p-tag-danger">Danger</span>
<span class="p-tag p-tag-info">Info</span>
```

### Badge on Icon
```html
<button class="p-button p-button-text">
  <i class="pi pi-bell"></i>
  <span class="p-badge p-badge-danger">3</span>
</button>
```

### Chip
```html
<div class="p-chip">
  <span class="p-chip-text">Apple</span>
  <button class="p-chip-remove-icon">
    <i class="pi pi-times-circle"></i>
  </button>
</div>
```

---

## Navigation

### Tabs
```html
<div class="p-tabview">
  <ul class="p-tabview-nav">
    <li class="p-tabview-nav-item p-highlight">
      <a class="p-tabview-nav-link">Tab 1</a>
    </li>
    <li class="p-tabview-nav-item">
      <a class="p-tabview-nav-link">Tab 2</a>
    </li>
    <li class="p-tabview-nav-item">
      <a class="p-tabview-nav-link">Tab 3</a>
    </li>
  </ul>
  <div class="p-tabview-panels">
    <div class="p-tabview-panel">
      Tab 1 content
    </div>
  </div>
</div>
```

### Breadcrumb
```html
<nav class="p-breadcrumb">
  <ul>
    <li class="p-breadcrumb-home">
      <a><i class="pi pi-home"></i></a>
    </li>
    <li class="p-breadcrumb-chevron">
      <i class="pi pi-chevron-right"></i>
    </li>
    <li><a>Category</a></li>
    <li class="p-breadcrumb-chevron">
      <i class="pi pi-chevron-right"></i>
    </li>
    <li><span>Current Page</span></li>
  </ul>
</nav>
```

### Menu
```html
<ul class="p-menu">
  <li class="p-menuitem">
    <a class="p-menuitem-link">
      <i class="pi pi-home p-menuitem-icon"></i>
      <span class="p-menuitem-text">Home</span>
    </a>
  </li>
  <li class="p-menuitem">
    <a class="p-menuitem-link">
      <i class="pi pi-cog p-menuitem-icon"></i>
      <span class="p-menuitem-text">Settings</span>
    </a>
  </li>
</ul>
```

---

## Feedback

### Toast/Message
```html
<div class="p-toast p-toast-top-right">
  <div class="p-toast-message p-toast-message-success">
    <div class="p-toast-message-content">
      <i class="pi pi-check p-toast-message-icon"></i>
      <div class="p-toast-message-text">
        <span class="p-toast-summary">Success</span>
        <span class="p-toast-detail">Changes saved successfully</span>
      </div>
      <button class="p-toast-icon-close">
        <i class="pi pi-times"></i>
      </button>
    </div>
  </div>
</div>
```

### Inline Message
```html
<div class="p-message p-message-info">
  <i class="pi pi-info-circle p-message-icon"></i>
  <span class="p-message-text">This is an informational message.</span>
</div>
```

### Progress Spinner
```html
<div class="p-progress-spinner">
  <svg class="p-progress-spinner-svg" viewBox="0 0 100 100">
    <circle class="p-progress-spinner-circle" cx="50" cy="50" r="40"></circle>
  </svg>
</div>
```

### Skeleton Loader
```html
<div class="p-skeleton" style="width: 100%; height: 20px;"></div>
<div class="p-skeleton" style="width: 75%; height: 20px; margin-top: 8px;"></div>
<div class="p-skeleton p-skeleton-circle" style="width: 50px; height: 50px;"></div>
```

---

## Layout Utilities

### Flex Container
```html
<div class="flex align-items-center justify-content-between gap-2">
  <span>Left</span>
  <span>Right</span>
</div>
```

### Grid
```html
<div class="grid">
  <div class="col-12 md:col-6 lg:col-4">Column 1</div>
  <div class="col-12 md:col-6 lg:col-4">Column 2</div>
  <div class="col-12 md:col-6 lg:col-4">Column 3</div>
</div>
```

### Spacing Utilities
```html
<div class="p-2">Padding 0.5rem</div>
<div class="p-4">Padding 1rem</div>
<div class="m-2">Margin 0.5rem</div>
<div class="mb-4">Margin-bottom 1rem</div>
<div class="gap-2">Gap 0.5rem (in flex)</div>
```

### Text Utilities
```html
<p class="text-sm">Small text</p>
<p class="text-lg">Large text</p>
<p class="font-bold">Bold text</p>
<p class="text-secondary">Secondary color</p>
<p class="text-center">Centered text</p>
```

---

## Icons (PrimeIcons)

Include the PrimeIcons CDN:
```html
<link rel="stylesheet" href="https://unpkg.com/primeicons/primeicons.css">
```

Common icons:
```html
<i class="pi pi-check"></i>      <!-- Checkmark -->
<i class="pi pi-times"></i>      <!-- X/Close -->
<i class="pi pi-plus"></i>       <!-- Plus -->
<i class="pi pi-minus"></i>      <!-- Minus -->
<i class="pi pi-pencil"></i>     <!-- Edit -->
<i class="pi pi-trash"></i>      <!-- Delete -->
<i class="pi pi-search"></i>     <!-- Search -->
<i class="pi pi-cog"></i>        <!-- Settings -->
<i class="pi pi-home"></i>       <!-- Home -->
<i class="pi pi-user"></i>       <!-- User -->
<i class="pi pi-bell"></i>       <!-- Notification -->
<i class="pi pi-chevron-down"></i>   <!-- Dropdown arrow -->
<i class="pi pi-chevron-right"></i>  <!-- Breadcrumb -->
<i class="pi pi-arrow-left"></i>     <!-- Back -->
<i class="pi pi-arrow-right"></i>    <!-- Forward -->
<i class="pi pi-upload"></i>     <!-- Upload -->
<i class="pi pi-download"></i>   <!-- Download -->
<i class="pi pi-image"></i>      <!-- Image -->
<i class="pi pi-palette"></i>    <!-- Color/Theme -->
<i class="pi pi-sliders-h"></i>  <!-- Adjustments -->
```

---

## Complete Example: Card with Form

```html
<div class="p-card" style="max-width: 400px;">
  <div class="p-card-header">
    <h3 class="p-card-title">Edit Item</h3>
  </div>
  <div class="p-card-body">
    <div class="p-fluid">
      <div class="p-field">
        <label for="item-name">Name</label>
        <input id="item-name" type="text" class="p-inputtext" value="Sample Item">
      </div>

      <div class="p-field">
        <label for="item-category">Category</label>
        <select id="item-category" class="p-dropdown">
          <option value="produce">Produce</option>
          <option value="dairy">Dairy</option>
          <option value="meat">Meat</option>
        </select>
      </div>

      <div class="p-field">
        <label>Status</label>
        <div class="flex gap-3">
          <span class="p-tag p-tag-success">Active</span>
          <span class="p-tag p-tag-secondary">Draft</span>
        </div>
      </div>
    </div>
  </div>
  <div class="p-card-footer flex justify-content-end gap-2">
    <button class="p-button p-button-text">Cancel</button>
    <button class="p-button p-button-primary">
      <i class="pi pi-check p-button-icon p-button-icon-left"></i>
      <span class="p-button-label">Save</span>
    </button>
  </div>
</div>
```
