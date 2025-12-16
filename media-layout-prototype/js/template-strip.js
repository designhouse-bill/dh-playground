/**
 * Template Strip Component
 * One-click template selection for Quick Set view
 */

/**
 * Template definitions with absolute positioning
 * Each slot has:
 *   - position: { x: %, y: % } - top-left origin position as percentage
 *   - size: % of container width (slots are square)
 *   - scale: transform scale (default 1)
 *   - zIndex: layer order
 */
const TEMPLATES = [
  {
    id: 'single-hero',
    name: 'Single Hero',
    category: 'horizontal',
    description: 'Full-bleed single product',
    slots: [
      { position: { x: 10, y: 10 }, size: 80, scale: 1, zIndex: 1 }
    ],
    supportedSizes: ['11', '21', '12', '13', '22', '23', '31', '32', '33'],
    layoutType: 'horizontal',
    emphasis: 'equal',
    imageCount: 1,
    popular: true
  },
  {
    id: 'hero-left',
    name: 'Hero Left',
    category: 'horizontal',
    description: 'Large product on left, smaller on right',
    slots: [
      { position: { x: 5, y: 10 }, size: 55, scale: 1, zIndex: 2 },
      { position: { x: 45, y: 25 }, size: 45, scale: 0.9, zIndex: 1 }
    ],
    supportedSizes: ['21', '22', '23', '31', '32', '33'],
    layoutType: 'horizontal',
    emphasis: 'first',
    imageCount: 2,
    popular: true
  },
  {
    id: 'hero-right',
    name: 'Hero Right',
    category: 'horizontal',
    description: 'Large product on right, smaller on left',
    slots: [
      { position: { x: 5, y: 25 }, size: 45, scale: 0.9, zIndex: 1 },
      { position: { x: 40, y: 10 }, size: 55, scale: 1, zIndex: 2 }
    ],
    supportedSizes: ['21', '22', '23', '31', '32', '33'],
    layoutType: 'horizontal',
    emphasis: 'last',
    imageCount: 2
  },
  {
    id: 'hero-duo',
    name: 'Side by Side',
    category: 'horizontal',
    description: 'Two equal products side by side',
    slots: [
      { position: { x: 5, y: 15 }, size: 45, scale: 1, zIndex: 1 },
      { position: { x: 50, y: 15 }, size: 45, scale: 1, zIndex: 2 }
    ],
    supportedSizes: ['21', '22', '23', '31', '32', '33'],
    layoutType: 'horizontal',
    emphasis: 'equal',
    imageCount: 2,
    popular: true
  },
  {
    id: 'hero-overlap',
    name: 'Overlap',
    category: 'hero',
    description: 'Two overlapping products',
    slots: [
      { position: { x: 10, y: 5 }, size: 55, scale: 1, zIndex: 1 },
      { position: { x: 35, y: 30 }, size: 55, scale: 1, zIndex: 2 }
    ],
    supportedSizes: ['21', '22', '23', '31', '32', '33'],
    layoutType: 'horizontal',
    emphasis: 'equal',
    imageCount: 2,
    popular: true
  },
  {
    id: 'hero-trio',
    name: 'Triple',
    category: 'horizontal',
    description: 'Three products in a row',
    slots: [
      { position: { x: 3, y: 20 }, size: 35, scale: 0.95, zIndex: 1 },
      { position: { x: 33, y: 15 }, size: 35, scale: 1, zIndex: 2 },
      { position: { x: 63, y: 20 }, size: 35, scale: 0.95, zIndex: 1 }
    ],
    supportedSizes: ['31', '32', '33', '22', '23'],
    layoutType: 'horizontal',
    emphasis: 'center',
    imageCount: 3
  },
  {
    id: 'trio-cascade',
    name: 'Cascade',
    category: 'hero',
    description: 'Three products in a cascade',
    slots: [
      { position: { x: 5, y: 5 }, size: 45, scale: 0.9, zIndex: 1 },
      { position: { x: 25, y: 20 }, size: 50, scale: 1, zIndex: 2 },
      { position: { x: 45, y: 35 }, size: 45, scale: 0.9, zIndex: 3 }
    ],
    supportedSizes: ['22', '23', '32', '33'],
    layoutType: 'grid',
    emphasis: 'center',
    imageCount: 3,
    popular: true
  },
  {
    id: 'hero-top',
    name: 'Hero Top',
    category: 'vertical',
    description: 'Large product on top, smaller below',
    slots: [
      { position: { x: 15, y: 5 }, size: 55, scale: 1, zIndex: 2 },
      { position: { x: 25, y: 45 }, size: 45, scale: 0.9, zIndex: 1 }
    ],
    supportedSizes: ['12', '13', '22', '23', '32', '33'],
    layoutType: 'vertical',
    emphasis: 'first',
    imageCount: 2
  },
  {
    id: 'hero-bottom',
    name: 'Hero Bottom',
    category: 'vertical',
    description: 'Large product on bottom, smaller above',
    slots: [
      { position: { x: 25, y: 5 }, size: 45, scale: 0.9, zIndex: 1 },
      { position: { x: 15, y: 40 }, size: 55, scale: 1, zIndex: 2 }
    ],
    supportedSizes: ['12', '13', '22', '23', '32', '33'],
    layoutType: 'vertical',
    emphasis: 'last',
    imageCount: 2
  },
  {
    id: 'grid-2x2',
    name: '2x2 Grid',
    category: 'grid',
    description: 'Four equal products in a grid',
    slots: [
      { position: { x: 5, y: 5 }, size: 45, scale: 0.9, zIndex: 1 },
      { position: { x: 50, y: 5 }, size: 45, scale: 0.9, zIndex: 2 },
      { position: { x: 5, y: 50 }, size: 45, scale: 0.9, zIndex: 3 },
      { position: { x: 50, y: 50 }, size: 45, scale: 0.9, zIndex: 4 }
    ],
    supportedSizes: ['22', '23', '32', '33'],
    layoutType: 'grid',
    emphasis: 'equal',
    imageCount: 4
  },
  {
    id: 'pyramid',
    name: 'Pyramid',
    category: 'grid',
    description: 'One on top, two on bottom',
    slots: [
      { position: { x: 25, y: 5 }, size: 50, scale: 1, zIndex: 2 },
      { position: { x: 5, y: 45 }, size: 45, scale: 0.9, zIndex: 1 },
      { position: { x: 50, y: 45 }, size: 45, scale: 0.9, zIndex: 1 }
    ],
    supportedSizes: ['22', '23', '32', '33'],
    layoutType: 'grid',
    emphasis: 'first',
    imageCount: 3
  },
  {
    id: 'lifestyle-overlay',
    name: 'Lifestyle',
    category: 'hero',
    description: 'Background image with product overlay',
    slots: [
      { position: { x: 25, y: 15 }, size: 55, scale: 1, zIndex: 1 }
    ],
    supportedSizes: ['21', '22', '23', '31', '32', '33'],
    layoutType: 'horizontal',
    emphasis: 'equal',
    imageCount: 1,
    hasBackground: true,
    popular: true
  }
];

// Template categories
const TEMPLATE_CATEGORIES = [
  { id: 'all', name: 'All', icon: 'pi-th-large' },
  { id: 'horizontal', name: 'Horizontal', icon: 'pi-arrows-h' },
  { id: 'vertical', name: 'Vertical', icon: 'pi-arrows-v' },
  { id: 'grid', name: 'Grid', icon: 'pi-table' },
  { id: 'hero', name: 'Hero', icon: 'pi-image' }
];

/**
 * TemplateStrip Class
 */
class TemplateStrip {
  constructor(options = {}) {
    this.container = null;
    this.selectedTemplateId = options.selectedTemplateId || null;
    this.cardSize = options.cardSize || '2x2';
    this.activeCategory = 'all';

    // Callbacks
    this.onSelect = options.onSelect || (() => {});
    this.onPreview = options.onPreview || (() => {});

    // Bind methods
    this.render = this.render.bind(this);
    this.handleKeyboard = this.handleKeyboard.bind(this);
  }

  /**
   * Initialize the component
   */
  init(containerElement) {
    this.container = containerElement;
    this.render();
    this.setupKeyboardNavigation();
  }

  /**
   * Update card size and re-render
   */
  setCardSize(size) {
    this.cardSize = size;
    // Clear selection if template not supported for new size
    if (this.selectedTemplateId) {
      const template = TEMPLATES.find(t => t.id === this.selectedTemplateId);
      const sizeKey = size.replace('x', '');
      if (template && !template.supportedSizes.includes(sizeKey)) {
        this.selectedTemplateId = null;
      }
    }
    this.render();
  }

  /**
   * Get templates filtered by current card size
   */
  getAvailableTemplates() {
    const sizeKey = this.cardSize.replace('x', '');
    return TEMPLATES.filter(template => {
      // Filter by size support
      if (!template.supportedSizes.includes(sizeKey)) {
        return false;
      }
      // Filter by category
      if (this.activeCategory !== 'all' && template.category !== this.activeCategory) {
        return false;
      }
      return true;
    });
  }

  /**
   * Select a template
   */
  selectTemplate(templateId) {
    const template = TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    // Check if supported for current size
    const sizeKey = this.cardSize.replace('x', '');
    if (!template.supportedSizes.includes(sizeKey)) {
      console.warn(`Template "${templateId}" not supported for size ${this.cardSize}`);
      return;
    }

    const previousId = this.selectedTemplateId;
    this.selectedTemplateId = templateId;

    // Add pulse animation
    const card = this.container?.querySelector(`[data-template-id="${templateId}"]`);
    if (card) {
      card.classList.add('template-card--just-selected');
      setTimeout(() => card.classList.remove('template-card--just-selected'), 400);
    }

    this.render();
    this.onSelect(template, previousId);
  }

  /**
   * Set category filter
   */
  setCategory(categoryId) {
    this.activeCategory = categoryId;
    this.render();
  }

  /**
   * Render the component
   */
  render() {
    if (!this.container) return;

    const templates = this.getAvailableTemplates();

    // Check if we're inside an editor card (compact mode)
    const isCompact = this.container.classList.contains('editor-card__body--scroll') ||
                      this.container.closest('.editor-card');

    if (isCompact) {
      // Compact mode - just render the grid of templates
      this.container.innerHTML = `
        <div class="template-strip template-strip--compact">
          <div class="template-strip__info text-muted text-xs mb-2">
            ${templates.length} available for ${this.cardSize}
          </div>
          <div class="template-grid" role="listbox" aria-label="Template selection">
            ${templates.length > 0 ? templates.map((template, index) => this.renderTemplateCard(template, index)).join('') : `
              <div class="template-strip__empty">
                <i class="pi pi-inbox"></i>
                <div class="template-strip__empty-text">No templates available for ${this.cardSize}</div>
              </div>
            `}
          </div>
        </div>
      `;
    } else {
      // Full mode with header
      this.container.innerHTML = `
        <div class="template-strip">
          <div class="template-strip__header">
            <div class="template-strip__title">
              <i class="pi pi-palette"></i>
              Quick Templates
            </div>
            <div class="template-strip__info">
              ${templates.length} available for ${this.cardSize}
            </div>
          </div>

          <div class="template-strip__scroll" role="listbox" aria-label="Template selection">
            ${templates.length > 0 ? templates.map((template, index) => this.renderTemplateCard(template, index)).join('') : `
              <div class="template-strip__empty">
                <i class="pi pi-inbox"></i>
                <div class="template-strip__empty-text">No templates available for ${this.cardSize}</div>
              </div>
            `}
          </div>
        </div>
      `;
    }

    // Add click handlers
    this.container.querySelectorAll('.template-card').forEach(card => {
      card.addEventListener('click', () => {
        this.selectTemplate(card.dataset.templateId);
      });

      // Hover preview
      card.addEventListener('mouseenter', () => {
        const template = TEMPLATES.find(t => t.id === card.dataset.templateId);
        if (template) {
          this.onPreview(template);
        }
      });
    });
  }

  /**
   * Render a single template card
   */
  renderTemplateCard(template, index) {
    const isSelected = this.selectedTemplateId === template.id;
    const keyHint = index < 9 ? index + 1 : null;

    return `
      <div class="template-card ${isSelected ? 'template-card--selected' : ''}"
           data-template-id="${template.id}"
           ${keyHint ? `data-key="${keyHint}"` : ''}
           role="option"
           aria-selected="${isSelected}"
           tabindex="${isSelected ? '0' : '-1'}">
        ${template.popular ? '<span class="template-card__badge">Popular</span>' : ''}
        <div class="template-card__preview" data-template="${template.id}">
          ${this.renderPreviewSlots(template)}
        </div>
        <div class="template-card__label">${template.name}</div>
      </div>
    `;
  }

  /**
   * Render preview slots for a template using absolute positioning
   */
  renderPreviewSlots(template) {
    // Lifestyle template has background hint
    const bgHint = template.hasBackground
      ? `<div class="template-card__bg-hint"></div>`
      : '';

    // Render absolutely positioned slots
    const slots = template.slots.map((slot, i) => {
      const isHero = (template.emphasis === 'first' && i === 0) ||
                     (template.emphasis === 'last' && i === template.slots.length - 1) ||
                     (template.emphasis === 'center' && i === Math.floor(template.slots.length / 2));

      // Scale positions for the small preview (roughly 60x60)
      const left = slot.position.x;
      const top = slot.position.y;
      const size = slot.size;
      const scale = slot.scale;

      return `
        <div class="template-card__slot ${isHero ? 'template-card__slot--hero' : ''}"
             style="
               position: absolute;
               left: ${left}%;
               top: ${top}%;
               width: ${size}%;
               height: ${size}%;
               transform: scale(${scale});
               z-index: ${slot.zIndex};
             "></div>
      `;
    }).join('');

    return bgHint + slots;
  }

  /**
   * Setup keyboard navigation
   */
  setupKeyboardNavigation() {
    document.addEventListener('keydown', this.handleKeyboard);
  }

  /**
   * Handle keyboard events
   */
  handleKeyboard(e) {
    // Number keys 1-9 for quick template selection
    if (e.key >= '1' && e.key <= '9' && !e.metaKey && !e.ctrlKey && !e.altKey) {
      const templates = this.getAvailableTemplates();
      const index = parseInt(e.key) - 1;
      if (index < templates.length) {
        e.preventDefault();
        this.selectTemplate(templates[index].id);
      }
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    document.removeEventListener('keydown', this.handleKeyboard);
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

/**
 * Get template by ID
 */
function getTemplateById(id) {
  return TEMPLATES.find(t => t.id === id) || null;
}

/**
 * Get templates for a card size
 */
function getTemplatesForSize(cardSize) {
  const sizeKey = cardSize.replace('x', '');
  return TEMPLATES.filter(t => t.supportedSizes.includes(sizeKey));
}

/**
 * Apply template to AppState with absolute positioning
 */
function applyTemplateToState(templateId) {
  const template = getTemplateById(templateId);
  if (!template) return false;

  // Update AppState
  if (typeof AppState !== 'undefined') {
    AppState.setLayout(template.layoutType);
    AppState.setEmphasis(template.emphasis);
    AppState.applyTemplate(template);

    // Adjust slots to match template count
    const targetCount = template.imageCount;

    // Add slots if needed
    while (AppState.slots.length < targetCount && AppState.sampleImages.length > AppState.slots.length) {
      const nextImage = AppState.sampleImages[AppState.slots.length];
      AppState.addSlot(nextImage);
    }

    // Remove extra slots if we have too many
    while (AppState.slots.length > targetCount) {
      AppState.slots.pop();
    }

    // Apply template positions to existing slots
    AppState.slots.forEach((slot, index) => {
      if (template.slots[index]) {
        const templateSlot = template.slots[index];
        // Update slot with template positioning
        AppState.updateSlot(index, {
          position: { ...templateSlot.position },
          size: templateSlot.size,
          scale: templateSlot.scale,
          zIndex: templateSlot.zIndex,
          rotation: 0 // Reset rotation when applying template
        });
      }
    });

    // Update image count to match
    AppState.imageCount = targetCount;

    // If lifestyle template, set a colorful background
    if (template.hasBackground && AppState.background.type === 'color' && AppState.background.value === '#ffffff') {
      AppState.setBackground('color', '#4CAF50');
    }

    return true;
  }

  return false;
}

// Make available globally
window.TemplateStrip = TemplateStrip;
window.TEMPLATES = TEMPLATES;
window.TEMPLATE_CATEGORIES = TEMPLATE_CATEGORIES;
window.getTemplateById = getTemplateById;
window.getTemplatesForSize = getTemplatesForSize;
window.applyTemplateToState = applyTemplateToState;
