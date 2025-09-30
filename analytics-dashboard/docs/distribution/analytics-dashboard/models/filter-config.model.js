/**
 * Filter Configuration Model - Angular-ready data structure
 * @description Data model for filtering and sorting configurations
 */

/**
 * @typedef {Object} IFilterConfig
 * @property {string} category - Filter by category
 * @property {string} sortBy - Sort field
 * @property {string} sortDirection - Sort direction ('asc' | 'desc')
 * @property {number} minScore - Minimum engagement score
 * @property {number} maxScore - Maximum engagement score
 * @property {string} searchTerm - Text search term
 */

const FilterOperator = {
  EQUALS: 'eq',
  CONTAINS: 'contains',
  GREATER_THAN: 'gt',
  LESS_THAN: 'lt',
  BETWEEN: 'between'
};

const SortDirection = {
  ASC: 'asc',
  DESC: 'desc'
};

const FilterConfigModel = {
  /**
   * Create a new filter configuration
   * @param {IFilterConfig} data - Filter configuration data
   * @returns {IFilterConfig} Validated filter config
   */
  create(data = {}) {
    return {
      category: data.category || '',
      sortBy: data.sortBy || 'engagement_score',
      sortDirection: data.sortDirection || SortDirection.DESC,
      minScore: data.minScore || 0,
      maxScore: data.maxScore || 100,
      searchTerm: data.searchTerm || ''
    };
  },

  /**
   * Reset filter to defaults
   * @returns {IFilterConfig} Default filter configuration
   */
  getDefault() {
    return this.create();
  }
};

export { FilterConfigModel, FilterOperator, SortDirection };