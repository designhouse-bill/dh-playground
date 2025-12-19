/**
 * Template Strip Component
 * One-click template selection for Quick Set view
 *
 * REDESIGNED based on analysis of 20+ promotional card designs
 * Templates organized by image count with active/inactive zones
 */

/**
 * Card size → maximum practical images mapping
 * Based on visual analysis of promotional materials
 */
const CARD_SIZE_MAX_IMAGES = {
  '11': 2,   // 1x1 - Square small: 1-2 images
  '21': 3,   // 2x1 - Wide: 2-3 images
  '31': 4,   // 3x1 - Very wide: 3-4 images
  '12': 2,   // 1x2 - Tall: 1-2 images
  '22': 4,   // 2x2 - Square: 2-4 images
  '32': 5,   // 3x2 - Wide large: 3-5 images
  '13': 2,   // 1x3 - Very tall: 1-2 images
  '23': 4,   // 2x3 - Tall large: 2-4 images
  '33': 5    // 3x3 - Large square: 3-5 images
};

/**
 * Template definitions with absolute positioning
 * Each slot has:
 *   - position: { x: %, y: % } - top-left origin position as percentage
 *   - size: % of container width (slots are square)
 *   - scale: transform scale (default 1)
 *   - zIndex: layer order
 *   - rotation: degrees (optional)
 */
const TEMPLATES = [
  // ========================================
  // 1-IMAGE TEMPLATES (Universal)
  // ========================================
  {
    id: 'hero-centered',
    name: 'Centered Hero',
    category: 'hero',
    description: 'Large centered product',
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
    id: 'hero-offset',
    name: 'Hero Offset',
    category: 'hero',
    description: 'Product offset, room for price badge',
    slots: [
      { position: { x: 5, y: 5 }, size: 70, scale: 1, zIndex: 1 }
    ],
    supportedSizes: ['11', '21', '12', '13', '22', '23', '31', '32', '33'],
    layoutType: 'horizontal',
    emphasis: 'equal',
    imageCount: 1,
    popular: true
  },
  {
    id: 'hero-full',
    name: 'Full Bleed',
    category: 'hero',
    description: 'Product fills entire area',
    slots: [
      { position: { x: 0, y: 0 }, size: 100, scale: 1, zIndex: 1 }
    ],
    supportedSizes: ['11', '22', '33'],
    layoutType: 'horizontal',
    emphasis: 'equal',
    imageCount: 1
  },

  // ========================================
  // 2-IMAGE TEMPLATES
  // ========================================
  {
    id: 'duo-side-by-side',
    name: 'Side by Side',
    category: 'horizontal',
    description: 'Two equal products horizontal',
    slots: [
      { position: { x: 3, y: 15 }, size: 45, scale: 1, zIndex: 1 },
      { position: { x: 52, y: 15 }, size: 45, scale: 1, zIndex: 2 }
    ],
    supportedSizes: ['21', '31', '22', '32', '33'],
    layoutType: 'horizontal',
    emphasis: 'equal',
    imageCount: 2,
    popular: true
  },
  {
    id: 'duo-stacked',
    name: 'Stacked',
    category: 'vertical',
    description: 'Two equal products vertical',
    slots: [
      { position: { x: 15, y: 3 }, size: 45, scale: 1, zIndex: 1 },
      { position: { x: 15, y: 52 }, size: 45, scale: 1, zIndex: 2 }
    ],
    supportedSizes: ['12', '13', '22', '23', '33'],
    layoutType: 'vertical',
    emphasis: 'equal',
    imageCount: 2
  },
  {
    id: 'duo-hero-left',
    name: 'Hero Left',
    category: 'horizontal',
    description: 'Large left, small right',
    slots: [
      { position: { x: 3, y: 8 }, size: 60, scale: 1, zIndex: 2 },
      { position: { x: 55, y: 25 }, size: 42, scale: 0.9, zIndex: 1 }
    ],
    supportedSizes: ['21', '31', '22', '32', '33'],
    layoutType: 'horizontal',
    emphasis: 'first',
    imageCount: 2,
    popular: true
  },
  {
    id: 'duo-hero-right',
    name: 'Hero Right',
    category: 'horizontal',
    description: 'Large right, small left',
    slots: [
      { position: { x: 3, y: 25 }, size: 42, scale: 0.9, zIndex: 1 },
      { position: { x: 37, y: 8 }, size: 60, scale: 1, zIndex: 2 }
    ],
    supportedSizes: ['21', '31', '22', '32', '33'],
    layoutType: 'horizontal',
    emphasis: 'last',
    imageCount: 2
  },
  {
    id: 'duo-hero-top',
    name: 'Hero Top',
    category: 'vertical',
    description: 'Large top, small bottom',
    slots: [
      { position: { x: 12, y: 3 }, size: 60, scale: 1, zIndex: 2 },
      { position: { x: 20, y: 55 }, size: 42, scale: 0.9, zIndex: 1 }
    ],
    supportedSizes: ['12', '13', '22', '23', '33'],
    layoutType: 'vertical',
    emphasis: 'first',
    imageCount: 2
  },
  {
    id: 'duo-hero-bottom',
    name: 'Hero Bottom',
    category: 'vertical',
    description: 'Large bottom, small top',
    slots: [
      { position: { x: 20, y: 3 }, size: 42, scale: 0.9, zIndex: 1 },
      { position: { x: 12, y: 42 }, size: 60, scale: 1, zIndex: 2 }
    ],
    supportedSizes: ['12', '13', '22', '23', '33'],
    layoutType: 'vertical',
    emphasis: 'last',
    imageCount: 2
  },
  {
    id: 'duo-overlap',
    name: 'Overlap',
    category: 'hero',
    description: 'Two overlapping products with depth',
    slots: [
      { position: { x: 8, y: 5 }, size: 55, scale: 1, zIndex: 1 },
      { position: { x: 35, y: 30 }, size: 55, scale: 1, zIndex: 2 }
    ],
    supportedSizes: ['11', '22', '33'],
    layoutType: 'horizontal',
    emphasis: 'equal',
    imageCount: 2,
    popular: true
  },
  // 2-image rotation variants
  {
    id: 'duo-side-rotated',
    name: 'Side by Side Rotated',
    variant: 'rotated',
    category: 'horizontal',
    description: 'Two products tilted toward each other',
    slots: [
      { position: { x: 3, y: 15 }, size: 45, scale: 1, rotation: 5, zIndex: 1 },
      { position: { x: 52, y: 15 }, size: 45, scale: 1, rotation: -5, zIndex: 2 }
    ],
    supportedSizes: ['21', '31', '22', '32', '33'],
    layoutType: 'horizontal',
    emphasis: 'equal',
    imageCount: 2
  },
  {
    id: 'duo-overlap-rotated',
    name: 'Overlap Rotated',
    variant: 'rotated',
    category: 'hero',
    description: 'Overlapping products with rotation',
    slots: [
      { position: { x: 8, y: 5 }, size: 55, scale: 1, rotation: -8, zIndex: 1 },
      { position: { x: 35, y: 30 }, size: 55, scale: 1, rotation: 5, zIndex: 2 }
    ],
    supportedSizes: ['11', '22', '33'],
    layoutType: 'horizontal',
    emphasis: 'equal',
    imageCount: 2,
    popular: true
  },

  // ========================================
  // 3-IMAGE TEMPLATES
  // ========================================
  {
    id: 'trio-row',
    name: 'Row of 3',
    category: 'horizontal',
    description: 'Three products in horizontal lineup',
    slots: [
      { position: { x: 2, y: 20 }, size: 32, scale: 0.95, zIndex: 1 },
      { position: { x: 34, y: 15 }, size: 32, scale: 1, zIndex: 2 },
      { position: { x: 66, y: 20 }, size: 32, scale: 0.95, zIndex: 1 }
    ],
    supportedSizes: ['31', '32', '33'],
    layoutType: 'horizontal',
    emphasis: 'center',
    imageCount: 3,
    popular: true
  },
  {
    id: 'trio-column',
    name: 'Column of 3',
    category: 'vertical',
    description: 'Three products in vertical lineup',
    slots: [
      { position: { x: 20, y: 2 }, size: 32, scale: 0.95, zIndex: 1 },
      { position: { x: 15, y: 34 }, size: 32, scale: 1, zIndex: 2 },
      { position: { x: 20, y: 66 }, size: 32, scale: 0.95, zIndex: 1 }
    ],
    supportedSizes: ['13', '23', '33'],
    layoutType: 'vertical',
    emphasis: 'center',
    imageCount: 3
  },
  {
    id: 'trio-pyramid-up',
    name: 'Pyramid Up',
    category: 'grid',
    description: '2 bottom, 1 top (centered)',
    slots: [
      { position: { x: 25, y: 5 }, size: 50, scale: 1, zIndex: 2 },
      { position: { x: 3, y: 48 }, size: 45, scale: 0.9, zIndex: 1 },
      { position: { x: 52, y: 48 }, size: 45, scale: 0.9, zIndex: 1 }
    ],
    supportedSizes: ['22', '23', '32', '33'],
    layoutType: 'grid',
    emphasis: 'first',
    imageCount: 3,
    popular: true
  },
  {
    id: 'trio-pyramid-down',
    name: 'Pyramid Down',
    category: 'grid',
    description: '1 top, 2 bottom',
    slots: [
      { position: { x: 3, y: 5 }, size: 45, scale: 0.9, zIndex: 1 },
      { position: { x: 52, y: 5 }, size: 45, scale: 0.9, zIndex: 1 },
      { position: { x: 25, y: 45 }, size: 50, scale: 1, zIndex: 2 }
    ],
    supportedSizes: ['22', '23', '32', '33'],
    layoutType: 'grid',
    emphasis: 'last',
    imageCount: 3
  },
  {
    id: 'trio-cascade',
    name: 'Cascade',
    category: 'hero',
    description: 'Diagonal staircase arrangement',
    slots: [
      { position: { x: 3, y: 5 }, size: 45, scale: 0.9, zIndex: 1 },
      { position: { x: 25, y: 25 }, size: 50, scale: 1, zIndex: 2 },
      { position: { x: 47, y: 45 }, size: 45, scale: 0.9, zIndex: 3 }
    ],
    supportedSizes: ['22', '32', '23', '33'],
    layoutType: 'grid',
    emphasis: 'center',
    imageCount: 3,
    popular: true
  },
  // 3-image rotation variant
  {
    id: 'trio-cascade-rotated',
    name: 'Cascade Rotated',
    variant: 'rotated',
    category: 'hero',
    description: 'Cascade with rotation',
    slots: [
      { position: { x: 3, y: 5 }, size: 45, scale: 0.9, rotation: -5, zIndex: 1 },
      { position: { x: 25, y: 25 }, size: 50, scale: 1, rotation: 0, zIndex: 2 },
      { position: { x: 47, y: 45 }, size: 45, scale: 0.9, rotation: 5, zIndex: 3 }
    ],
    supportedSizes: ['22', '32', '23', '33'],
    layoutType: 'grid',
    emphasis: 'center',
    imageCount: 3
  },

  // ========================================
  // 4-IMAGE TEMPLATES
  // ========================================
  {
    id: 'quad-grid',
    name: '2x2 Grid',
    category: 'grid',
    description: 'Four equal quadrants',
    slots: [
      { position: { x: 3, y: 3 }, size: 45, scale: 0.95, zIndex: 1 },
      { position: { x: 52, y: 3 }, size: 45, scale: 0.95, zIndex: 2 },
      { position: { x: 3, y: 52 }, size: 45, scale: 0.95, zIndex: 3 },
      { position: { x: 52, y: 52 }, size: 45, scale: 0.95, zIndex: 4 }
    ],
    supportedSizes: ['22', '33'],
    layoutType: 'grid',
    emphasis: 'equal',
    imageCount: 4,
    popular: true
  },
  {
    id: 'quad-hero-row',
    name: 'Hero + Row',
    category: 'horizontal',
    description: 'Large hero + 3 small below',
    slots: [
      { position: { x: 15, y: 3 }, size: 55, scale: 1, zIndex: 2 },
      { position: { x: 3, y: 60 }, size: 30, scale: 0.85, zIndex: 1 },
      { position: { x: 35, y: 60 }, size: 30, scale: 0.85, zIndex: 1 },
      { position: { x: 67, y: 60 }, size: 30, scale: 0.85, zIndex: 1 }
    ],
    supportedSizes: ['32', '33'],
    layoutType: 'grid',
    emphasis: 'first',
    imageCount: 4
  },
  {
    id: 'quad-diamond',
    name: 'Diamond',
    category: 'grid',
    description: '1-2-1 pattern',
    slots: [
      { position: { x: 30, y: 2 }, size: 40, scale: 0.9, zIndex: 1 },
      { position: { x: 5, y: 30 }, size: 42, scale: 1, zIndex: 2 },
      { position: { x: 53, y: 30 }, size: 42, scale: 1, zIndex: 2 },
      { position: { x: 30, y: 58 }, size: 40, scale: 0.9, zIndex: 1 }
    ],
    supportedSizes: ['22', '33'],
    layoutType: 'grid',
    emphasis: 'equal',
    imageCount: 4
  },

  // ========================================
  // 5-IMAGE TEMPLATES
  // ========================================
  {
    id: 'quint-cross',
    name: 'Cross',
    category: 'grid',
    description: '1 center + 4 corners',
    slots: [
      { position: { x: 30, y: 30 }, size: 40, scale: 1, zIndex: 5 },
      { position: { x: 2, y: 2 }, size: 32, scale: 0.85, zIndex: 1 },
      { position: { x: 66, y: 2 }, size: 32, scale: 0.85, zIndex: 2 },
      { position: { x: 2, y: 66 }, size: 32, scale: 0.85, zIndex: 3 },
      { position: { x: 66, y: 66 }, size: 32, scale: 0.85, zIndex: 4 }
    ],
    supportedSizes: ['33'],
    layoutType: 'grid',
    emphasis: 'center',
    imageCount: 5,
    popular: true
  },
  {
    id: 'quint-3-2',
    name: '3 + 2',
    category: 'grid',
    description: '3 top row, 2 bottom',
    slots: [
      { position: { x: 2, y: 5 }, size: 32, scale: 0.9, zIndex: 1 },
      { position: { x: 34, y: 5 }, size: 32, scale: 0.9, zIndex: 2 },
      { position: { x: 66, y: 5 }, size: 32, scale: 0.9, zIndex: 3 },
      { position: { x: 18, y: 55 }, size: 32, scale: 0.9, zIndex: 4 },
      { position: { x: 50, y: 55 }, size: 32, scale: 0.9, zIndex: 5 }
    ],
    supportedSizes: ['32', '33'],
    layoutType: 'grid',
    emphasis: 'equal',
    imageCount: 5
  },
  {
    id: 'quint-2-3',
    name: '2 + 3',
    category: 'grid',
    description: '2 top row, 3 bottom',
    slots: [
      { position: { x: 18, y: 5 }, size: 32, scale: 0.9, zIndex: 1 },
      { position: { x: 50, y: 5 }, size: 32, scale: 0.9, zIndex: 2 },
      { position: { x: 2, y: 55 }, size: 32, scale: 0.9, zIndex: 3 },
      { position: { x: 34, y: 55 }, size: 32, scale: 0.9, zIndex: 4 },
      { position: { x: 66, y: 55 }, size: 32, scale: 0.9, zIndex: 5 }
    ],
    supportedSizes: ['32', '33'],
    layoutType: 'grid',
    emphasis: 'equal',
    imageCount: 5
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
 * Manages template selection with active/inactive zones
 */
class TemplateStrip {
  constructor(options = {}) {
    this.container = null;
    this.selectedTemplateId = options.selectedTemplateId || null;
    this.cardSize = options.cardSize || '2x2';
    this.activeCategory = 'all';
    this.currentImageCount = options.imageCount || 1;

    // Track manually deactivated templates (user dragged to inactive)
    this.manuallyInactive = new Set();

    // Callbacks
    this.onSelect = options.onSelect || (() => {});
    this.onPreview = options.onPreview || (() => {});

    // Bind methods
    this.render = this.render.bind(this);
    this.handleKeyboard = this.handleKeyboard.bind(this);
  }

  /**
   * Update current image count
   */
  setImageCount(count) {
    this.currentImageCount = count;
    this.render();
  }

  /**
   * Check if template is relevant (can be active)
   * A template is relevant when:
   * 1. It supports the current card size
   * 2. Its image count <= current available images
   * 3. User hasn't manually deactivated it
   */
  isTemplateRelevant(template) {
    const sizeKey = this.cardSize.replace('x', '');

    // Must support current card size
    if (!template.supportedSizes.includes(sizeKey)) {
      return false;
    }

    // Must not require more images than available
    if (template.imageCount > this.currentImageCount) {
      return false;
    }

    return true;
  }

  /**
   * Get reason why template is inactive
   */
  getInactiveReason(template) {
    const sizeKey = this.cardSize.replace('x', '');

    if (!template.supportedSizes.includes(sizeKey)) {
      return `Not available for ${this.cardSize}`;
    }

    if (template.imageCount > this.currentImageCount) {
      const needed = template.imageCount - this.currentImageCount;
      return `Needs ${needed} more image${needed > 1 ? 's' : ''}`;
    }

    if (this.manuallyInactive.has(template.id)) {
      return 'Manually deactivated';
    }

    return null;
  }

  /**
   * Get templates split into active/inactive zones
   */
  getZonedTemplates() {
    const sizeKey = this.cardSize.replace('x', '');
    const active = [];
    const inactive = [];

    TEMPLATES.forEach(template => {
      // Filter by category first
      if (this.activeCategory !== 'all' && template.category !== this.activeCategory) {
        return;
      }

      // Check if manually deactivated
      if (this.manuallyInactive.has(template.id)) {
        if (template.supportedSizes.includes(sizeKey)) {
          inactive.push(template);
        }
        return;
      }

      // Check relevance
      if (this.isTemplateRelevant(template)) {
        active.push(template);
      } else if (template.supportedSizes.includes(sizeKey)) {
        // Only show in inactive if it supports this card size
        inactive.push(template);
      }
    });

    return { active, inactive };
  }

  /**
   * Move template to inactive zone
   */
  deactivateTemplate(templateId) {
    this.manuallyInactive.add(templateId);
    this.render();
  }

  /**
   * Move template to active zone
   */
  activateTemplate(templateId) {
    const template = TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    // Can only activate if relevant
    if (!this.isTemplateRelevant(template)) {
      console.warn(`Cannot activate "${templateId}" - needs more images or wrong size`);
      return false;
    }

    this.manuallyInactive.delete(templateId);
    this.render();
    return true;
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
   * Get templates filtered by current card size (legacy - returns active only)
   */
  getAvailableTemplates() {
    const { active } = this.getZonedTemplates();
    return active;
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

    const { active, inactive } = this.getZonedTemplates();
    const maxImages = CARD_SIZE_MAX_IMAGES[this.cardSize.replace('x', '')] || 5;

    // Check if we're inside an editor card (compact mode)
    const isCompact = this.container.classList.contains('editor-card__body--scroll') ||
                      this.container.closest('.editor-card');

    if (isCompact) {
      // Compact mode with two zones
      this.container.innerHTML = `
        <div class="template-strip template-strip--compact template-strip--zoned">
          <div class="template-strip__info text-muted text-xs mb-2">
            ${active.length} active for ${this.cardSize} (${this.currentImageCount} image${this.currentImageCount !== 1 ? 's' : ''})
          </div>

          <!-- Active Zone -->
          <div class="template-zone template-zone--active" data-zone="active">
            <div class="template-zone__label">
              <i class="pi pi-check-circle"></i> Active
            </div>
            <div class="template-grid" role="listbox" aria-label="Active templates">
              ${active.length > 0 ? active.map((template, index) => this.renderTemplateCard(template, index, false)).join('') : `
                <div class="template-strip__empty template-strip__empty--small">
                  <span class="text-muted text-xs">No active templates</span>
                </div>
              `}
            </div>
          </div>

          <!-- Zone Divider -->
          ${inactive.length > 0 ? `
            <div class="template-zone__divider">
              <span class="template-zone__divider-line"></span>
              <span class="template-zone__divider-text">Inactive</span>
              <span class="template-zone__divider-line"></span>
            </div>

            <!-- Inactive Zone -->
            <div class="template-zone template-zone--inactive" data-zone="inactive">
              <div class="template-grid template-grid--inactive" role="listbox" aria-label="Inactive templates">
                ${inactive.map((template, index) => this.renderTemplateCard(template, index, true)).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      `;
    } else {
      // Full mode with header and two zones
      this.container.innerHTML = `
        <div class="template-strip template-strip--zoned">
          <div class="template-strip__header">
            <div class="template-strip__title">
              <i class="pi pi-palette"></i>
              Quick Templates
            </div>
            <div class="template-strip__info">
              ${active.length} active for ${this.cardSize}
            </div>
          </div>

          <!-- Active Zone -->
          <div class="template-zone template-zone--active" data-zone="active">
            <div class="template-zone__label">
              <i class="pi pi-check-circle"></i> Active Templates
            </div>
            <div class="template-strip__scroll" role="listbox" aria-label="Active templates">
              ${active.length > 0 ? active.map((template, index) => this.renderTemplateCard(template, index, false)).join('') : `
                <div class="template-strip__empty">
                  <i class="pi pi-inbox"></i>
                  <div class="template-strip__empty-text">No active templates</div>
                </div>
              `}
            </div>
          </div>

          ${inactive.length > 0 ? `
            <!-- Zone Divider -->
            <div class="template-zone__divider">
              <span class="template-zone__divider-line"></span>
              <span class="template-zone__divider-text">Inactive</span>
              <span class="template-zone__divider-line"></span>
            </div>

            <!-- Inactive Zone -->
            <div class="template-zone template-zone--inactive" data-zone="inactive">
              <div class="template-strip__scroll template-strip__scroll--inactive" role="listbox" aria-label="Inactive templates">
                ${inactive.map((template, index) => this.renderTemplateCard(template, index, true)).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      `;
    }

    // Add click handlers for active templates
    this.container.querySelectorAll('.template-card:not(.template-card--inactive)').forEach(card => {
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

    // Add click handlers for inactive templates (try to activate)
    this.container.querySelectorAll('.template-card--inactive').forEach(card => {
      card.addEventListener('click', () => {
        const templateId = card.dataset.templateId;
        const template = TEMPLATES.find(t => t.id === templateId);
        if (template) {
          const reason = this.getInactiveReason(template);
          if (reason && reason.includes('Needs')) {
            // Show tooltip or feedback that more images needed
            card.classList.add('template-card--shake');
            setTimeout(() => card.classList.remove('template-card--shake'), 400);
          } else if (this.activateTemplate(templateId)) {
            // Successfully activated, now select it
            this.selectTemplate(templateId);
          }
        }
      });
    });
  }

  /**
   * Render a single template card
   */
  renderTemplateCard(template, index, isInactive = false) {
    const isSelected = this.selectedTemplateId === template.id;
    const keyHint = !isInactive && index < 9 ? index + 1 : null;
    const inactiveReason = isInactive ? this.getInactiveReason(template) : null;

    const classes = [
      'template-card',
      isSelected ? 'template-card--selected' : '',
      isInactive ? 'template-card--inactive' : ''
    ].filter(Boolean).join(' ');

    return `
      <div class="${classes}"
           data-template-id="${template.id}"
           ${keyHint ? `data-key="${keyHint}"` : ''}
           role="option"
           aria-selected="${isSelected}"
           aria-disabled="${isInactive}"
           tabindex="${isSelected ? '0' : '-1'}"
           ${inactiveReason ? `title="${inactiveReason}"` : ''}>
        ${template.popular && !isInactive ? '<span class="template-card__badge">Popular</span>' : ''}
        ${isInactive && inactiveReason ? `<span class="template-card__reason">${inactiveReason}</span>` : ''}
        <div class="template-card__preview" data-template="${template.id}">
          ${this.renderPreviewSlots(template)}
        </div>
        <div class="template-card__label">${template.name}</div>
        <div class="template-card__image-count">
          <i class="pi pi-image"></i> ${template.imageCount}
        </div>
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
        // Update slot with template positioning (including rotation if defined)
        AppState.updateSlot(index, {
          position: { ...templateSlot.position },
          size: templateSlot.size,
          scale: templateSlot.scale,
          zIndex: templateSlot.zIndex,
          rotation: templateSlot.rotation || 0 // Apply template rotation or reset to 0
        });
      }
    });

    // Update image count to match
    AppState.imageCount = targetCount;

    // If lifestyle template, set a colorful background
    if (template.hasBackground && AppState.background.type === 'color' && AppState.background.value === '#ffffff') {
      AppState.setBackground('color', '#4CAF50');
    }

    // Mark config as dirty (user applied a template)
    AppState.markCurrentConfigDirty();

    return true;
  }

  return false;
}

// Make available globally
window.TemplateStrip = TemplateStrip;
window.TEMPLATES = TEMPLATES;
window.TEMPLATE_CATEGORIES = TEMPLATE_CATEGORIES;
window.CARD_SIZE_MAX_IMAGES = CARD_SIZE_MAX_IMAGES;
window.getTemplateById = getTemplateById;
window.getTemplatesForSize = getTemplatesForSize;
window.applyTemplateToState = applyTemplateToState;
