/**
 * Mock Entity Data - Sub-brands and Stores Hierarchy
 * Supports: Brand → Sub-brand → Store drill-down
 */

const MockEntities = {
  // Brand level (top)
  brand: {
    id: 'brand-all',
    name: 'All Stores',
    level: 'brand',
    storeCount: 10,
    subBrandCount: 2
  },

  // Sub-brands
  subBrands: [
    {
      id: 'metro',
      name: 'Metro Region',
      level: 'sub-brand',
      storeCount: 5,
      stores: ['store-101', 'store-102', 'store-103', 'store-104', 'store-105']
    },
    {
      id: 'suburban',
      name: 'Suburban Region',
      level: 'sub-brand',
      storeCount: 5,
      stores: ['store-201', 'store-202', 'store-203', 'store-204', 'store-205']
    }
  ],

  // All stores with full details
  stores: [
    // Metro Region stores
    {
      id: 'store-101',
      name: 'Store #101 - Downtown',
      subBrand: 'metro',
      address: '123 Main St, Downtown',
      size: 'large',
      openDate: '2018-03-15'
    },
    {
      id: 'store-102',
      name: 'Store #102 - Midtown',
      subBrand: 'metro',
      address: '456 Central Ave, Midtown',
      size: 'medium',
      openDate: '2019-06-01'
    },
    {
      id: 'store-103',
      name: 'Store #103 - Uptown',
      subBrand: 'metro',
      address: '789 North Blvd, Uptown',
      size: 'large',
      openDate: '2017-09-20'
    },
    {
      id: 'store-104',
      name: 'Store #104 - Westside',
      subBrand: 'metro',
      address: '321 West End Dr, Westside',
      size: 'medium',
      openDate: '2020-01-10'
    },
    {
      id: 'store-105',
      name: 'Store #105 - Eastside',
      subBrand: 'metro',
      address: '654 East Park Rd, Eastside',
      size: 'small',
      openDate: '2021-04-05'
    },
    // Suburban Region stores
    {
      id: 'store-201',
      name: 'Store #201 - Northgate',
      subBrand: 'suburban',
      address: '100 Northgate Mall, Northgate',
      size: 'large',
      openDate: '2016-11-12'
    },
    {
      id: 'store-202',
      name: 'Store #202 - Southpark',
      subBrand: 'suburban',
      address: '200 Southpark Plaza, Southpark',
      size: 'large',
      openDate: '2018-08-22'
    },
    {
      id: 'store-203',
      name: 'Store #203 - Riverdale',
      subBrand: 'suburban',
      address: '300 River Rd, Riverdale',
      size: 'medium',
      openDate: '2019-02-14'
    },
    {
      id: 'store-204',
      name: 'Store #204 - Lakewood',
      subBrand: 'suburban',
      address: '400 Lake View Dr, Lakewood',
      size: 'medium',
      openDate: '2020-07-30'
    },
    {
      id: 'store-205',
      name: 'Store #205 - Hillcrest',
      subBrand: 'suburban',
      address: '500 Hillcrest Ave, Hillcrest',
      size: 'small',
      openDate: '2021-12-01'
    }
  ],

  // Helper methods
  getSubBrandById(id) {
    return this.subBrands.find(sb => sb.id === id);
  },

  getStoreById(id) {
    return this.stores.find(s => s.id === id);
  },

  getStoresBySubBrand(subBrandId) {
    return this.stores.filter(s => s.subBrand === subBrandId);
  },

  getEntityHierarchy() {
    return {
      brand: this.brand,
      subBrands: this.subBrands.map(sb => ({
        ...sb,
        stores: this.getStoresBySubBrand(sb.id)
      }))
    };
  },

  // Get entity display name for breadcrumb
  getEntityDisplayName(entityId) {
    if (entityId === 'brand-all') return 'All Stores';

    const subBrand = this.getSubBrandById(entityId);
    if (subBrand) return subBrand.name;

    const store = this.getStoreById(entityId);
    if (store) return store.name;

    return 'Unknown';
  },

  // Get entity level
  getEntityLevel(entityId) {
    if (entityId === 'brand-all') return 'brand';
    if (this.subBrands.find(sb => sb.id === entityId)) return 'sub-brand';
    if (this.stores.find(s => s.id === entityId)) return 'store';
    return null;
  }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MockEntities;
}
if (typeof window !== 'undefined') {
  window.MockEntities = MockEntities;
}
