/**
 * Promotion Model - Angular-ready data structure
 * @description Data model for promotional items and analytics
 */

/**
 * @typedef {Object} IPromotion
 * @property {string} card_id - Unique promotion identifier
 * @property {string} upc - Universal Product Code
 * @property {string} card_name - Product name/title
 * @property {string} card_price - Display price
 * @property {string} units - Unit of measure
 * @property {string} description - Product description
 * @property {string} category - Product category
 * @property {number} engagement_score - Performance score (0-100)
 * @property {number} views - Number of views
 * @property {number} clicks - Number of clicks
 * @property {number} add_to_list - Add to list actions
 * @property {number} shares - Share actions
 */

const PromotionModel = {
  /**
   * Create a new promotion instance
   * @param {IPromotion} data - Promotion data
   * @returns {IPromotion} Validated promotion object
   */
  create(data) {
    return {
      card_id: data.card_id || '',
      upc: data.upc || '',
      card_name: data.card_name || '',
      card_price: data.card_price || '',
      units: data.units || '',
      description: data.description || '',
      category: data.category || '',
      engagement_score: data.engagement_score || 0,
      views: data.views || 0,
      clicks: data.clicks || 0,
      add_to_list: data.add_to_list || 0,
      shares: data.shares || 0
    };
  },

  /**
   * Validate promotion data
   * @param {IPromotion} promotion - Promotion to validate
   * @returns {boolean} Is valid
   */
  isValid(promotion) {
    return !!(promotion.card_id && promotion.card_name);
  }
};

export { PromotionModel };