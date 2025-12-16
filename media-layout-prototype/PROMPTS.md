# Media Layout Prototype - Phased Implementation Prompts

Use these prompts sequentially to rebuild the media-layout prototype with PrimeNG styling patterns. Each phase builds on the previous one.

---

## Phase 1: Foundation & Design Tokens

**Goal:** Set up the base structure with PrimeNG-aligned design tokens and load existing process files.

### Prompt 1:
```
Create the foundation for a media-layout prototype in /Users/billklingensmith/Code/mydarndest-playground/media-layout-prototype/

Requirements:
1. Create index.html that:
   - Links to PrimeNG CDN (primeng, primeflex, primeicons)
   - Uses the dark sidebar / light content layout from the Overview-full.png design
   - Loads CSS from process/css/tokens.css and process/css/components.css
   - Loads JS from process/js/constraints.js and process/js/templates.js
   - Has a left sidebar (280px, dark #1e1e1e) and main content area (light #f8f9fa)
   - Includes a header bar with "Media Layout" title

2. Create css/primeng-overrides.css with:
   - PrimeNG-style design tokens matching ideal-sale-circular
   - Primary color: #3B82F6 (blue-500)
   - Surface colors: #1e1e1e (dark), #f8f9fa (light)
   - Border radius: 6px default
   - Font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto

3. Create js/app.js that:
   - Initializes the application
   - Loads sample images from process/sample-images/
   - Sets up initial state with cardSize: '2x2', layout: 'horizontal'

The layout should match the 4-column editor style from Overview-full.png:
- Column 1: Dark sidebar with navigation
- Column 2-4: Light content area with cards/forms

Do not use Angular. Use vanilla HTML, CSS, and JavaScript.
```

---

## Phase 2: Template Strip (Quick Set View)

**Goal:** Create the one-click template selection strip for 80% use case.

### Prompt 2:
```
Add a Template Strip component to the media-layout prototype.

Location: /Users/billklingensmith/Code/mydarndest-playground/media-layout-prototype/

Requirements:
1. Create js/template-strip.js with a TemplateStrip class that:
   - Displays 6 horizontal template thumbnails in a scrollable row
   - Templates: single-hero, hero-left, hero-right, hero-duo, hero-trio, lifestyle-overlay
   - Each template shows a mini CSS Grid preview (48x32px)
   - Clicking a template applies it immediately (one-click)
   - Highlights selected template with blue border
   - Adapts available templates based on current cardSize

2. Create css/template-strip.css with:
   - Horizontal scrollable container with gap-2 (8px)
   - Template cards: 72px wide, white background, 6px radius
   - Hover: subtle lift shadow
   - Selected: 2px solid #3B82F6 border
   - PrimeNG-style transitions (150ms ease)

3. Template data structure:
   {
     id: 'hero-left',
     name: 'Hero Left',
     slots: [{position: 'left', width: '60%'}, {position: 'right', width: '40%'}],
     supportedSizes: ['21', '22', '23', '31', '32', '33'],
     thumbnail: 'css-grid-preview'
   }

4. Add the template strip to index.html:
   - Position it in the main content area, above the preview
   - Height: ~80px collapsed
   - Label: "Quick Templates" with info icon

Load sample images from process/sample-images/ for preview.
Use constraints from process/js/constraints.js for size validation.
```

---

## Phase 3: Layout Panel with Quick/Advanced Views

**Goal:** Build the expandable bottom panel with two view modes.

### Prompt 3:
```
Add a Layout Panel component with Quick Set and Advanced views.

Location: /Users/billklingensmith/Code/mydarndest-playground/media-layout-prototype/

Requirements:
1. Create js/layout-panel.js with a LayoutPanel class that:
   - Has 3 states: collapsed (48px), quick (280px), advanced (450px)
   - Toggle between views with tab buttons or keyboard (Cmd+1, Cmd+2)
   - Emits events: onStateChange, onLayoutChange, onTemplateSelect

2. Quick Set View (280px) contains:
   - Template Strip (from Phase 2)
   - Card Size selector (PrimeNG SelectButton style: 1x1, 2x1, 2x2, etc.)
   - Live preview thumbnail (200x150px)
   - Apply/Cancel buttons

3. Advanced View (450px) adds:
   - Full template grid (3 columns)
   - Background section (color picker + image upload placeholder)
   - Image slots list with reorder (drag handles)
   - Per-slot adjustments (position, scale, fit mode)
   - Emphasis selector (equal, first, last)

4. Create css/layout-panel.css with:
   - Slide-up animation from bottom
   - Tab bar with Quick/Advanced toggle
   - PrimeNG card styling for sections
   - Dividers between sections

5. Update index.html:
   - Add panel container at bottom
   - Add "Configure Layout" button that opens panel
   - Panel should overlay content, not push it

Keyboard shortcuts:
- Cmd+M: Toggle panel open/close
- Cmd+1: Quick view
- Cmd+2: Advanced view
- Escape: Close panel
```

---

## Phase 4: Background System

**Goal:** Add background color and image support for card hero areas.

### Prompt 4:
```
Add a Background System to the media-layout prototype.

Location: /Users/billklingensmith/Code/mydarndest-playground/media-layout-prototype/

Requirements:
1. Create js/background-picker.js with a BackgroundPicker class that:
   - Has two modes: Color and Image
   - Color mode: Shows preset swatches + custom color input
   - Image mode: File input + URL input + preview
   - Emits onChange with {type: 'color'|'image', value: string}

2. Category color presets (from our earlier analysis):
   - Produce: #4CAF50, #8BC34A
   - Meat: #D32F2F, #FFCDD2
   - Dairy: #2196F3, #BBDEFB
   - Bakery: #795548, #D7CCC8
   - Beverages: #9C27B0, #E1BEE7
   - Neutral: #F5F5F5, #EEEEEE, #E0E0E0

3. Create css/background-picker.css with:
   - Tab toggle for Color/Image modes
   - Color swatches: 32x32px circles, 8px gap grid
   - Selected swatch: checkmark overlay + ring
   - Custom color input with preview swatch
   - Image preview: 120x80px with remove button

4. Integrate into Advanced View of Layout Panel:
   - Add "Background" section header
   - Position between template grid and slot adjustments
   - Show live preview update when background changes

5. Update the preview renderer to:
   - Apply background color/image to the preview container
   - Layer product images on top of background
   - Support opacity slider for background (50-100%)

The preview should demonstrate:
- Solid color backgrounds (like the green produce cards)
- Lifestyle image backgrounds (like the wood table card)
```

---

## Phase 5: Preview & Slot Editor

**Goal:** Build the live preview and per-image slot adjustments.

### Prompt 5:
```
Add Preview Renderer and Slot Editor to the media-layout prototype.

Location: /Users/billklingensmith/Code/mydarndest-playground/media-layout-prototype/

Requirements:
1. Create js/preview-renderer.js that:
   - Renders CSS Grid layouts based on selected template
   - Displays actual product images from process/sample-images/
   - Shows slot boundaries with subtle dashed borders
   - Highlights selected slot with blue outline
   - Supports all 9 card sizes with correct aspect ratios
   - Applies background from BackgroundPicker

2. Create js/slot-editor.js with SlotEditor class that:
   - Shows controls for selected image slot
   - Position: X/Y offset sliders (-50 to +50 px)
   - Scale: 0.5x to 1.5x slider
   - Object Fit: contain/cover/fill dropdown
   - Renders changes in real-time to preview

3. Aspect-aware fitting logic:
   - Detect tall products (aspect < 0.75) → use object-fit: contain
   - Square/wide products → use object-fit: cover
   - Add visual indicator showing detected fit mode

4. Create css/preview.css and css/slot-editor.css with:
   - Preview container: centered, maintains aspect ratio
   - Card size presets: 1x1=200px, 2x1=400x200, 2x2=400x400, 3x2=600x400
   - Slot hover: subtle highlight
   - Slot selected: 2px solid #3B82F6
   - Editor controls: PrimeNG slider styling

5. Wire together:
   - Clicking slot in preview → selects it → shows SlotEditor
   - SlotEditor changes → update preview in real-time
   - Template change → reset slot positions to defaults

Load images from: process/sample-images/
Use templates from: process/js/templates.js
```

---

## Phase 6: Integration & Polish

**Goal:** Wire everything together with state management and final polish.

### Prompt 6:
```
Integrate all components and add final polish to the media-layout prototype.

Location: /Users/billklingensmith/Code/mydarndest-playground/media-layout-prototype/

Requirements:
1. Update js/app.js with central state management:
   - State: { cardSize, template, background, slots[], selectedSlotIndex }
   - Methods: applyTemplate(), updateSlot(), setBackground(), save(), reset()
   - Event bus for component communication

2. Create the full workflow:
   - User opens panel (Cmd+M or button click)
   - Quick view: Pick template → See preview → Apply
   - Advanced view: Full customization → Apply
   - Changes reflect immediately in main preview area

3. Add save/export functionality:
   - "Apply" button saves configuration
   - Configuration object matches our data model:
     {
       cardSize: '2x2',
       template: 'hero-left',
       background: { type: 'color', value: '#4CAF50' },
       slots: [{ imageUrl, position, scale, fit }]
     }
   - Console.log the config on save (for debugging)

4. Add keyboard shortcuts panel:
   - Small floating help (?) button
   - Shows: Cmd+M, Cmd+1, Cmd+2, 1-6 for templates, Escape

5. Polish:
   - Loading states with skeleton placeholders
   - Smooth transitions (200ms ease-out)
   - Toast notification on save
   - Error states for missing images

6. Update index.html with:
   - Full page layout matching Overview-full.png
   - All components loaded and initialized
   - Sample product images displayed
   - Working end-to-end flow

Test with sample images from process/sample-images/
Ensure all process/js/*.js files are utilized
```

---

## Usage Instructions

Run each prompt sequentially. After each phase:
1. Test the new functionality in browser
2. Verify it integrates with existing components
3. Check console for any errors
4. Proceed to next phase

### File Structure After All Phases:
```
media-layout-prototype/
├── index.html                 # Main entry point
├── css/
│   ├── primeng-overrides.css  # PrimeNG token overrides
│   ├── template-strip.css     # Phase 2
│   ├── layout-panel.css       # Phase 3
│   ├── background-picker.css  # Phase 4
│   ├── preview.css            # Phase 5
│   └── slot-editor.css        # Phase 5
├── js/
│   ├── app.js                 # Main app + state (Phase 1, 6)
│   ├── template-strip.js      # Phase 2
│   ├── layout-panel.js        # Phase 3
│   ├── background-picker.js   # Phase 4
│   ├── preview-renderer.js    # Phase 5
│   └── slot-editor.js         # Phase 5
└── process/                   # Existing (reference)
    ├── css/
    ├── js/
    └── sample-images/
```

### Dependencies (CDN):
- PrimeNG CSS: primeng.min.css
- PrimeFlex: primeflex.min.css
- PrimeIcons: primeicons.css
