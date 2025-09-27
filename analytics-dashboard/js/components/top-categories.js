/**
 * Top Categories Component
 * Handles KPI 2: Top Performing Categories display
 */

const TopCategoriesComponent = {

  element: null,
  listElement: null,

  /**
   * Initialize component
   */
  init() {
    this.element = document.getElementById('top-categories-tile');
    this.listElement = document.getElementById('top-categories-list');

    if (!this.element || !this.listElement) {
      console.warn('Top Categories component elements not found');
      return false;
    }

    return true;
  },

  /**
   * Render component with data
   */
  render(data) {
    if (!this.init()) return;

    const formatted = DataFormatter.formatCategoryList(data, 4);

    // Clear existing content
    this.listElement.innerHTML = '';

    // Create category items
    formatted.forEach((category, index) => {
      const item = this.createCategoryItem(category, index + 1);
      this.listElement.appendChild(item);
    });

    // Add click handler for drill-down
    this.element.addEventListener('click', () => {
      this.handleClick();
    });
  },

  /**
   * Create individual category item element
   */
  createCategoryItem(category, rank) {
    const item = document.createElement('div');
    item.className = 'category-item';

    const nameElement = document.createElement('div');
    nameElement.className = 'category-name';
    nameElement.textContent = `${rank}. ${category.name}`;

    const scoreElement = document.createElement('div');
    scoreElement.className = `category-score ${category.formatted.className}`;
    scoreElement.textContent = category.score;

    const changeElement = document.createElement('div');
    changeElement.className = `category-change ${category.changeFormatted.className}`;
    changeElement.textContent = category.changeFormatted.text;
    changeElement.style.fontSize = '12px';
    changeElement.style.marginLeft = '8px';

    const rightSide = document.createElement('div');
    rightSide.style.display = 'flex';
    rightSide.style.alignItems = 'center';
    rightSide.appendChild(scoreElement);
    rightSide.appendChild(changeElement);

    item.appendChild(nameElement);
    item.appendChild(rightSide);

    return item;
  },

  /**
   * Handle tile click for drill-down
   */
  handleClick() {
    // Navigate to inquiry with categories filter
    const url = new URL('inquiry.html', window.location.origin);
    url.searchParams.set('filter', 'categories');
    window.location.href = url.toString();
  },

  /**
   * Update with new data (for week changes)
   */
  update(data) {
    this.render(data);
  }
};

// Export for global access
window.TopCategoriesComponent = TopCategoriesComponent;