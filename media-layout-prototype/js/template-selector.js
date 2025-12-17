/**
 * Template Selector Component
 *
 * UI component for selecting hero image layout templates.
 * Shows available templates filtered by current image count.
 */

class TemplateSelector {
  constructor(options = {}) {
    this.container = null;
    this.currentTemplateId = options.initialTemplate || 'h-single';
    this.imageCount = options.imageCount || 1;
    this.cardSize = options.cardSize || '2x2';

    // Callbacks
    this.onSelect = options.onSelect || null;

    // State
    this.isOpen = false;
  }

  /**
   * Initialize the component
   * @param {HTMLElement} container - Container element
   */
  init(container) {
    this.container = container;
    this.render();
  }

  /**
   * Render the template selector
   */
  render() {
    if (!this.container) return;

    const templates = this.getFilteredTemplates();

    this.container.innerHTML = `
      <div class="template-selector">
        <div class="template-selector__header">
          <label class="template-selector__label">Layout Template</label>
          <span class="template-selector__count">${templates.length} available</span>
        </div>
        <div class="template-selector__grid">
          ${templates.map(t => this.renderTemplateOption(t)).join('')}
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  /**
   * Render a single template option
   * @param {Object} template - Template object
   * @returns {string} HTML string
   */
  renderTemplateOption(template) {
    const isSelected = template.id === this.currentTemplateId;
    const grid = this.getTemplatePreviewGrid(template);

    return `
      <button
        class="template-option ${isSelected ? 'template-option--selected' : ''}"
        data-template-id="${template.id}"
        title="${template.name}: ${template.description || ''}"
        aria-pressed="${isSelected}"
      >
        <div class="template-option__preview" style="${this.gridToInlineStyle(grid)}">
          ${grid.placements.map((p, i) => `
            <div class="template-option__cell" style="grid-area: ${p.area};">
              <span class="template-option__cell-num">${i + 1}</span>
            </div>
          `).join('')}
        </div>
        <span class="template-option__name">${template.name}</span>
      </button>
    `;
  }

  /**
   * Get filtered templates based on current image count
   * @returns {Object[]} Array of templates
   */
  getFilteredTemplates() {
    if (typeof getTemplatesForImageCount === 'function') {
      return getTemplatesForImageCount(this.imageCount);
    }

    // Fallback: use TEMPLATES_V2 directly
    if (typeof TEMPLATES_V2 !== 'undefined') {
      return Object.values(TEMPLATES_V2).filter(t => t.images === this.imageCount);
    }

    return [];
  }

  /**
   * Get the preview grid for a template (uses square aspect for preview)
   * @param {Object} template - Template object
   * @returns {Object} Grid definition
   */
  getTemplatePreviewGrid(template) {
    // Use square grid for consistent preview
    return template.grids.square || template.grids.landscape || Object.values(template.grids)[0];
  }

  /**
   * Convert grid definition to inline CSS style
   * @param {Object} grid - Grid definition
   * @returns {string} Inline style string
   */
  gridToInlineStyle(grid) {
    return `
      display: grid;
      grid-template-columns: ${grid.columns};
      grid-template-rows: ${grid.rows};
      grid-template-areas: ${grid.areas};
      gap: 2px;
    `.replace(/\n/g, ' ').trim();
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    if (!this.container) return;

    // Template option clicks
    this.container.querySelectorAll('.template-option').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const templateId = btn.dataset.templateId;
        this.selectTemplate(templateId);
      });
    });
  }

  /**
   * Select a template
   * @param {string} templateId - Template ID
   */
  selectTemplate(templateId) {
    const oldTemplate = this.currentTemplateId;
    this.currentTemplateId = templateId;

    // Update UI
    this.container.querySelectorAll('.template-option').forEach(btn => {
      const isSelected = btn.dataset.templateId === templateId;
      btn.classList.toggle('template-option--selected', isSelected);
      btn.setAttribute('aria-pressed', isSelected);
    });

    // Notify callback
    if (this.onSelect && oldTemplate !== templateId) {
      this.onSelect(templateId, oldTemplate);
    }
  }

  /**
   * Update the image count and re-render if needed
   * @param {number} count - New image count
   */
  setImageCount(count) {
    if (this.imageCount !== count) {
      this.imageCount = count;
      this.render();

      // If current template doesn't match new count, select first available
      const templates = this.getFilteredTemplates();
      if (templates.length > 0 && !templates.find(t => t.id === this.currentTemplateId)) {
        this.selectTemplate(templates[0].id);
      }
    }
  }

  /**
   * Update the card size
   * @param {string} cardSize - New card size
   */
  setCardSize(cardSize) {
    this.cardSize = cardSize;
    // Card size affects which grids are shown in preview, re-render
    this.render();
  }

  /**
   * Get the currently selected template ID
   * @returns {string} Template ID
   */
  getSelectedTemplate() {
    return this.currentTemplateId;
  }

  /**
   * Get the currently selected template object
   * @returns {Object|null} Template object
   */
  getSelectedTemplateObject() {
    if (typeof getTemplate === 'function') {
      return getTemplate(this.currentTemplateId);
    }
    if (typeof TEMPLATES_V2 !== 'undefined') {
      return TEMPLATES_V2[this.currentTemplateId] || null;
    }
    return null;
  }

  /**
   * Clean up
   */
  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.container = null;
  }
}

// ─────────────────────────────────────────────────────────────────
// CSS STYLES (inject if not already present)
// ─────────────────────────────────────────────────────────────────

const templateSelectorStyles = `
  .template-selector {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .template-selector__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .template-selector__label {
    font-weight: 500;
    font-size: 0.875rem;
    color: var(--color-gray-700, #374151);
  }

  .template-selector__count {
    font-size: 0.75rem;
    color: var(--color-gray-500, #6b7280);
  }

  .template-selector__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 0.5rem;
  }

  .template-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem;
    border: 2px solid var(--color-gray-200, #e5e7eb);
    border-radius: 0.375rem;
    background: white;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .template-option:hover {
    border-color: var(--color-gray-400, #9ca3af);
    background: var(--color-gray-50, #f9fafb);
  }

  .template-option--selected {
    border-color: var(--color-primary, #3b82f6);
    background: var(--color-primary-50, #eff6ff);
  }

  .template-option--selected:hover {
    border-color: var(--color-primary, #3b82f6);
  }

  .template-option__preview {
    width: 60px;
    height: 60px;
    border-radius: 0.25rem;
    overflow: hidden;
    background: var(--color-gray-100, #f3f4f6);
  }

  .template-option__cell {
    background: var(--color-gray-300, #d1d5db);
    border-radius: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .template-option--selected .template-option__cell {
    background: var(--color-primary-200, #bfdbfe);
  }

  .template-option__cell-num {
    font-size: 10px;
    font-weight: 600;
    color: var(--color-gray-600, #4b5563);
  }

  .template-option--selected .template-option__cell-num {
    color: var(--color-primary-700, #1d4ed8);
  }

  .template-option__name {
    font-size: 0.6875rem;
    color: var(--color-gray-600, #4b5563);
    text-align: center;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .template-option--selected .template-option__name {
    color: var(--color-primary-700, #1d4ed8);
    font-weight: 500;
  }
`;

// Inject styles if not already present
if (typeof document !== 'undefined' && !document.getElementById('template-selector-styles')) {
  const styleEl = document.createElement('style');
  styleEl.id = 'template-selector-styles';
  styleEl.textContent = templateSelectorStyles;
  document.head.appendChild(styleEl);
}

// ─────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────

window.TemplateSelector = TemplateSelector;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TemplateSelector };
}
