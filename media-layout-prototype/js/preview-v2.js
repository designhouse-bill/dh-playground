/**
 * Preview Renderer V2 (Passive)
 *
 * A passive preview component that:
 * - Reads from heroState (single source of truth)
 * - Renders CSS Grid based on current template and card size
 * - Applies image adjustments (offset, scale, rotation, opacity)
 * - Supports both cover and contain content modes
 * - Does NOT handle interaction (that's direct-manipulation.js)
 *
 * IMPORTANT: This is a VIEW-ONLY renderer. All state changes come from:
 * - Adjustment sliders calling heroState.updateImageAdjustment()
 * - Direct manipulation module calling heroState.updateImageAdjustment()
 *
 * @module PreviewRenderer
 */

class PreviewRenderer {
  constructor(options = {}) {
    this.container = null;
    this.heroState = options.heroState || (typeof window !== 'undefined' ? window.heroState : null);
    this.showGuides = options.showGuides || false;
    this.aspectRatio = options.aspectRatio || '3 / 2';

    // State listener cleanup
    this._unsubscribe = null;

    // Bound methods
    this._handleStateChange = this._handleStateChange.bind(this);
  }

  /**
   * Initialize the preview renderer
   * @param {HTMLElement|string} container - Container element or ID
   */
  init(container) {
    this.container = typeof container === 'string'
      ? document.getElementById(container)
      : container;

    if (!this.container) {
      console.error('PreviewRenderer: Container not found');
      return;
    }

    // Subscribe to heroState changes
    if (this.heroState && typeof this.heroState.subscribe === 'function') {
      this._unsubscribe = this.heroState.subscribe(this._handleStateChange);
    }

    this.render();
  }

  /**
   * Handle state changes from heroState
   * @private
   */
  _handleStateChange(eventObj) {
    // eventObj is { type, detail, state } from notifyListeners
    const eventType = eventObj.type || eventObj;
    const relevantEvents = ['template', 'cardSize', 'image', 'images', 'reset', 'load', 'selection'];
    if (relevantEvents.includes(eventType)) {
      this.render();
    }
  }

  /**
   * Render the preview
   */
  render() {
    if (!this.container) return;

    // Get current state
    const state = this._getState();
    if (!state) {
      this._renderEmptyState();
      return;
    }

    const { templateId, cardSize, images, selectedIndex } = state;

    // Get template and grid
    const template = this._getTemplate(templateId);
    const grid = this._getGrid(template, cardSize);

    if (!template || !grid || images.length === 0) {
      this._renderEmptyState();
      return;
    }

    // Build preview HTML
    this.container.innerHTML = '';
    this.container.className = 'hero-preview';

    // Create preview wrapper with aspect ratio
    const wrapper = document.createElement('div');
    wrapper.className = 'hero-preview__wrapper';
    wrapper.style.aspectRatio = this._getAspectRatio(cardSize);

    // Create grid container
    const gridEl = document.createElement('div');
    gridEl.className = 'hero-preview__grid';
    gridEl.style.cssText = this._gridToCSS(grid);

    // Render each image in its placement
    grid.placements.forEach((placement, i) => {
      if (i < images.length) {
        const imageData = images[i];
        const cell = this._createImageCell(imageData, i, placement, selectedIndex === i);
        gridEl.appendChild(cell);
      }
    });

    // Optional guides overlay
    if (this.showGuides) {
      const guides = this._createGuides(grid);
      wrapper.appendChild(guides);
    }

    wrapper.appendChild(gridEl);
    this.container.appendChild(wrapper);

    // Add template info
    const info = document.createElement('div');
    info.className = 'hero-preview__info';
    info.innerHTML = `
      <span class="hero-preview__template-name">${template.name}</span>
      <span class="hero-preview__image-count">${images.length} image${images.length !== 1 ? 's' : ''}</span>
    `;
    this.container.appendChild(info);
  }

  /**
   * Get current state from heroState
   * @private
   */
  _getState() {
    if (!this.heroState) return null;

    return {
      templateId: this.heroState.templateId || 'h-single',
      cardSize: this.heroState.cardSize || '2x2',
      images: this.heroState.images || [],
      selectedIndex: this.heroState.selectedIndex
    };
  }

  /**
   * Get template by ID
   * @private
   */
  _getTemplate(templateId) {
    if (typeof getTemplate === 'function') {
      return getTemplate(templateId);
    }
    if (typeof TEMPLATES_V2 !== 'undefined') {
      return TEMPLATES_V2[templateId] || null;
    }
    return null;
  }

  /**
   * Get grid for template and card size
   * @private
   */
  _getGrid(template, cardSize) {
    if (!template) return null;

    if (typeof getTemplateGrid === 'function') {
      return getTemplateGrid(template.id, cardSize);
    }

    // Fallback: get grid based on aspect
    const aspect = this._getCardAspect(cardSize);
    return template.grids ? (template.grids[aspect] || template.grids.square) : null;
  }

  /**
   * Get card aspect from size
   * @private
   */
  _getCardAspect(cardSize) {
    if (typeof getCardAspect === 'function') {
      return getCardAspect(cardSize);
    }

    const [cols, rows] = cardSize.split('x').map(Number);
    if (cols > rows) return 'landscape';
    if (rows > cols) return 'portrait';
    return 'square';
  }

  /**
   * Get CSS aspect ratio for card size
   * @private
   */
  _getAspectRatio(cardSize) {
    if (typeof getAspectRatio === 'function') {
      return getAspectRatio(cardSize);
    }

    const [cols, rows] = cardSize.split('x').map(Number);
    return `${cols} / ${rows}`;
  }

  /**
   * Convert grid definition to CSS
   * @private
   */
  _gridToCSS(grid) {
    return `
      display: grid;
      grid-template-columns: ${grid.columns};
      grid-template-rows: ${grid.rows};
      grid-template-areas: ${grid.areas};
      gap: ${grid.gap || '4px'};
      width: 100%;
      height: 100%;
    `.replace(/\n/g, ' ').trim();
  }

  /**
   * Create an image cell element
   * @private
   */
  _createImageCell(imageData, index, placement, isSelected) {
    const cell = document.createElement('div');
    cell.className = 'hero-preview__cell';
    cell.dataset.index = index;
    cell.style.gridArea = placement.area;

    if (isSelected) {
      cell.classList.add('hero-preview__cell--selected');
    }

    // Create image wrapper (for transform origin)
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'hero-preview__image-wrapper';

    // Apply transforms
    const transform = this._buildTransform(imageData);
    if (transform) {
      imageWrapper.style.transform = transform;
    }

    // Apply opacity
    if (imageData.opacity !== undefined && imageData.opacity !== 100) {
      imageWrapper.style.opacity = imageData.opacity / 100;
    }

    // Apply z-index
    if (imageData.zIndex !== undefined && imageData.zIndex !== 0) {
      cell.style.zIndex = imageData.zIndex;
    }

    // Create image element
    const img = document.createElement('img');
    img.className = 'hero-preview__image';
    img.src = imageData.src;
    img.alt = imageData.name || `Image ${index + 1}`;
    img.loading = 'lazy';

    // Apply content mode
    const contentMode = imageData.contentMode || 'cover';
    img.style.objectFit = contentMode;

    // Apply object position (for cover mode adjustments)
    if (contentMode === 'cover' && (imageData.offsetX || imageData.offsetY)) {
      const posX = 50 + (imageData.offsetX || 0) / 2;
      const posY = 50 + (imageData.offsetY || 0) / 2;
      img.style.objectPosition = `${posX}% ${posY}%`;
    }

    // Position number indicator
    const posNum = document.createElement('span');
    posNum.className = 'hero-preview__position';
    posNum.textContent = index + 1;

    imageWrapper.appendChild(img);
    cell.appendChild(imageWrapper);
    cell.appendChild(posNum);

    return cell;
  }

  /**
   * Build CSS transform string from image adjustments
   * @private
   */
  _buildTransform(imageData) {
    const transforms = [];

    // Scale
    if (imageData.scale !== undefined && imageData.scale !== 1) {
      transforms.push(`scale(${imageData.scale})`);
    }

    // Rotation
    if (imageData.rotation !== undefined && imageData.rotation !== 0) {
      transforms.push(`rotate(${imageData.rotation}deg)`);
    }

    // Translate (offset) - for contain mode or overlay positioning
    const contentMode = imageData.contentMode || 'cover';
    if (contentMode === 'contain' && (imageData.offsetX || imageData.offsetY)) {
      transforms.push(`translate(${imageData.offsetX || 0}px, ${imageData.offsetY || 0}px)`);
    }

    return transforms.length > 0 ? transforms.join(' ') : null;
  }

  /**
   * Create guides overlay
   * @private
   */
  _createGuides(grid) {
    const guides = document.createElement('div');
    guides.className = 'hero-preview__guides';

    // Center lines
    guides.innerHTML = `
      <div class="guide-line guide-line--horizontal"></div>
      <div class="guide-line guide-line--vertical"></div>
    `;

    return guides;
  }

  /**
   * Render empty state
   * @private
   */
  _renderEmptyState() {
    this.container.innerHTML = '';
    this.container.className = 'hero-preview hero-preview--empty';

    const empty = document.createElement('div');
    empty.className = 'hero-preview__empty';
    empty.innerHTML = `
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <path d="M21 15l-5-5L5 21"/>
      </svg>
      <p>Add images to see preview</p>
    `;

    this.container.appendChild(empty);
  }

  /**
   * Toggle guides visibility
   */
  toggleGuides() {
    this.showGuides = !this.showGuides;
    this.render();
  }

  /**
   * Set aspect ratio manually
   */
  setAspectRatio(ratio) {
    this.aspectRatio = ratio;
    this.render();
  }

  /**
   * Force re-render
   */
  refresh() {
    this.render();
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this._unsubscribe) {
      this._unsubscribe();
    }
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

// ─────────────────────────────────────────────────────────────────
// CSS STYLES (inject if not already present)
// ─────────────────────────────────────────────────────────────────

const previewStyles = `
  .hero-preview {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .hero-preview__wrapper {
    position: relative;
    width: 100%;
    background: var(--color-gray-100, #f3f4f6);
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .hero-preview__grid {
    position: absolute;
    inset: 0;
  }

  .hero-preview__cell {
    position: relative;
    overflow: hidden;
    background: var(--color-gray-200, #e5e7eb);
    border-radius: 0.25rem;
  }

  .hero-preview__cell--selected {
    outline: 2px solid var(--color-primary, #3b82f6);
    outline-offset: -2px;
  }

  .hero-preview__image-wrapper {
    width: 100%;
    height: 100%;
    transform-origin: center center;
  }

  .hero-preview__image {
    width: 100%;
    height: 100%;
    display: block;
  }

  .hero-preview__position {
    position: absolute;
    top: 0.25rem;
    left: 0.25rem;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    font-size: 0.625rem;
    font-weight: 600;
    border-radius: 0.25rem;
    pointer-events: none;
  }

  .hero-preview__info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 0.25rem;
  }

  .hero-preview__template-name {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--color-gray-700, #374151);
  }

  .hero-preview__image-count {
    font-size: 0.75rem;
    color: var(--color-gray-500, #6b7280);
  }

  /* Empty State */
  .hero-preview--empty .hero-preview__empty {
    aspect-ratio: 3 / 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--color-gray-100, #f3f4f6);
    border-radius: 0.5rem;
    color: var(--color-gray-400, #9ca3af);
  }

  .hero-preview__empty p {
    margin: 0.5rem 0 0 0;
    font-size: 0.875rem;
  }

  /* Guides */
  .hero-preview__guides {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 100;
  }

  .guide-line {
    position: absolute;
    background: rgba(59, 130, 246, 0.5);
  }

  .guide-line--horizontal {
    left: 0;
    right: 0;
    top: 50%;
    height: 1px;
    transform: translateY(-50%);
  }

  .guide-line--vertical {
    top: 0;
    bottom: 0;
    left: 50%;
    width: 1px;
    transform: translateX(-50%);
  }

  /* Content mode visual differences */
  .hero-preview__cell[data-content-mode="contain"] {
    background: var(--color-gray-900, #111827);
  }

  .hero-preview__cell[data-content-mode="contain"] .hero-preview__image {
    background: transparent;
  }
`;

// Inject styles if not already present
if (typeof document !== 'undefined' && !document.getElementById('preview-v2-styles')) {
  const styleEl = document.createElement('style');
  styleEl.id = 'preview-v2-styles';
  styleEl.textContent = previewStyles;
  document.head.appendChild(styleEl);
}

// ─────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────

window.PreviewRenderer = PreviewRenderer;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PreviewRenderer };
}
