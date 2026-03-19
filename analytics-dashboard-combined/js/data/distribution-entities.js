/**
 * Distribution Entities — Entity Hierarchy
 * Brand → Sub-brand → Store (mirrors Engagement's pattern exactly)
 *
 * Entity levels: 'all' | 'brand' | 'sub-brand' | 'store'
 *
 * Sample data: Winn-Dixie 20-store Florida pilot
 * 3 brands (FL regions), 6 sub-brands, 20 stores
 */

const DistributionEntities = (function() {
  'use strict';

  // ========================================
  // Retailer Config (sample data metadata — NOT a hierarchy node)
  // ========================================

  const retailerConfig = {
    id: 'winn-dixie',
    name: 'Winn-Dixie',
    label: 'WD',
    pilotLabel: 'Florida Pilot'
  };

  // ========================================
  // Store Definitions (with lat/lng + google_place_id)
  // ========================================

  const allStores = [
    // South FL Coast
    { id: 'store-726', storeNumber: 726, name: 'St James City', city: 'St James City, FL', address: '1250 Pine Island Rd, St James City, FL 33956', size: 'medium', subBrandId: 'subbrand-south-fl-coast', lat: 26.532, lng: -82.085, google_place_id: 'ChIJ_StJamesCity726' },
    { id: 'store-336', storeNumber: 336, name: 'Hollywood', city: 'Hollywood, FL', address: '3010 Johnson St, Hollywood, FL 33021', size: 'large', subBrandId: 'subbrand-south-fl-coast', lat: 26.020, lng: -80.153, google_place_id: 'ChIJ_Hollywood336' },
    { id: 'store-508', storeNumber: 508, name: 'Fort Myers', city: 'Fort Myers, FL', address: '4650 S Cleveland Ave, Fort Myers, FL 33907', size: 'large', subBrandId: 'subbrand-south-fl-coast', lat: 26.620, lng: -81.870, google_place_id: 'ChIJ_FortMyers508' },
    { id: 'store-518', storeNumber: 518, name: 'Naples', city: 'Naples, FL', address: '5750 Naples Blvd, Naples, FL 34109', size: 'medium', subBrandId: 'subbrand-south-fl-coast', lat: 26.234, lng: -81.781, google_place_id: 'ChIJ_Naples518' },

    // South FL Inland
    { id: 'store-381', storeNumber: 381, name: 'Belle Glade', city: 'Belle Glade, FL', address: '500 S Main St, Belle Glade, FL 33430', size: 'small', subBrandId: 'subbrand-south-fl-inland', lat: 26.685, lng: -80.670, google_place_id: 'ChIJ_BelleGlade381' },
    { id: 'store-2474', storeNumber: 2474, name: 'Melbourne', city: 'Melbourne, FL', address: '1900 W New Haven Ave, Melbourne, FL 32904', size: 'medium', subBrandId: 'subbrand-south-fl-inland', lat: 28.078, lng: -80.624, google_place_id: 'ChIJ_Melbourne2474' },
    { id: 'store-2501', storeNumber: 2501, name: 'Palm Bay', city: 'Palm Bay, FL', address: '1040 Malabar Rd SE, Palm Bay, FL 32907', size: 'small', subBrandId: 'subbrand-south-fl-inland', lat: 28.003, lng: -80.660, google_place_id: 'ChIJ_PalmBay2501' },

    // Central FL Gulf
    { id: 'store-2487', storeNumber: 2487, name: 'Sarasota', city: 'Sarasota, FL', address: '3870 Bee Ridge Rd, Sarasota, FL 34233', size: 'large', subBrandId: 'subbrand-central-fl-gulf', lat: 27.305, lng: -82.477, google_place_id: 'ChIJ_Sarasota2487' },
    { id: 'store-2490', storeNumber: 2490, name: 'Port Charlotte', city: 'Port Charlotte, FL', address: '1900 Tamiami Trail, Port Charlotte, FL 33948', size: 'small', subBrandId: 'subbrand-central-fl-gulf', lat: 26.976, lng: -82.113, google_place_id: 'ChIJ_PortCharlotte2490' },
    { id: 'store-2509', storeNumber: 2509, name: 'Bradenton', city: 'Bradenton, FL', address: '6255 Cortez Rd W, Bradenton, FL 34210', size: 'medium', subBrandId: 'subbrand-central-fl-gulf', lat: 27.464, lng: -82.588, google_place_id: 'ChIJ_Bradenton2509' },
    { id: 'store-711', storeNumber: 711, name: 'Spring Hill', city: 'Spring Hill, FL', address: '1233 Wendy Ct, Spring Hill, FL 34607', size: 'medium', subBrandId: 'subbrand-central-fl-gulf', lat: 28.477, lng: -82.538, google_place_id: 'ChIJ_SpringHill711' },

    // Central FL East
    { id: 'store-2288', storeNumber: 2288, name: 'Orlando', city: 'Orlando, FL', address: '7640 W Sand Lake Rd, Orlando, FL 32819', size: 'large', subBrandId: 'subbrand-central-fl-east', lat: 28.452, lng: -81.470, google_place_id: 'ChIJ_Orlando2288' },
    { id: 'store-2434', storeNumber: 2434, name: 'Daytona Beach', city: 'Daytona Beach, FL', address: '1570 W Intl Speedway Blvd, Daytona Beach, FL 32114', size: 'medium', subBrandId: 'subbrand-central-fl-east', lat: 29.186, lng: -81.077, google_place_id: 'ChIJ_DaytonaBeach2434' },
    { id: 'store-2480', storeNumber: 2480, name: 'Lakeland', city: 'Lakeland, FL', address: '3950 US-98 N, Lakeland, FL 33809', size: 'medium', subBrandId: 'subbrand-central-fl-east', lat: 28.079, lng: -81.957, google_place_id: 'ChIJ_Lakeland2480' },

    // North FL Panhandle
    { id: 'store-2449', storeNumber: 2449, name: 'Pensacola', city: 'Pensacola, FL', address: '2601 N Davis Hwy, Pensacola, FL 32503', size: 'medium', subBrandId: 'subbrand-north-fl-panhandle', lat: 30.443, lng: -87.220, google_place_id: 'ChIJ_Pensacola2449' },
    { id: 'store-436', storeNumber: 436, name: 'Lynn Haven', city: 'Lynn Haven, FL', address: '2101 S Hwy 77, Lynn Haven, FL 32444', size: 'small', subBrandId: 'subbrand-north-fl-panhandle', lat: 30.233, lng: -85.655, google_place_id: 'ChIJ_LynnHaven436' },
    { id: 'store-2495', storeNumber: 2495, name: 'Tallahassee', city: 'Tallahassee, FL', address: '1700 N Monroe St, Tallahassee, FL 32303', size: 'large', subBrandId: 'subbrand-north-fl-panhandle', lat: 30.456, lng: -84.274, google_place_id: 'ChIJ_Tallahassee2495' },

    // North FL Interior
    { id: 'store-2437', storeNumber: 2437, name: 'Ocala', city: 'Ocala, FL', address: '3100 SW College Rd, Ocala, FL 34474', size: 'medium', subBrandId: 'subbrand-north-fl-interior', lat: 29.152, lng: -82.152, google_place_id: 'ChIJ_Ocala2437' },
    { id: 'store-2399', storeNumber: 2399, name: 'Jacksonville', city: 'Jacksonville, FL', address: '4525 San Juan Ave, Jacksonville, FL 32210', size: 'large', subBrandId: 'subbrand-north-fl-interior', lat: 30.287, lng: -81.703, google_place_id: 'ChIJ_Jacksonville2399' },
    { id: 'store-2482', storeNumber: 2482, name: 'Gainesville', city: 'Gainesville, FL', address: '3720 NW 13th St, Gainesville, FL 32609', size: 'medium', subBrandId: 'subbrand-north-fl-interior', lat: 29.678, lng: -82.356, google_place_id: 'ChIJ_Gainesville2482' }
  ];

  // ========================================
  // Sub-brand Definitions
  // ========================================

  const allSubBrands = [
    { id: 'subbrand-south-fl-coast', name: 'South FL Coast', brandId: 'brand-south-fl', stores: allStores.filter(s => s.subBrandId === 'subbrand-south-fl-coast') },
    { id: 'subbrand-south-fl-inland', name: 'South FL Inland', brandId: 'brand-south-fl', stores: allStores.filter(s => s.subBrandId === 'subbrand-south-fl-inland') },
    { id: 'subbrand-central-fl-gulf', name: 'Central FL Gulf', brandId: 'brand-central-fl', stores: allStores.filter(s => s.subBrandId === 'subbrand-central-fl-gulf') },
    { id: 'subbrand-central-fl-east', name: 'Central FL East', brandId: 'brand-central-fl', stores: allStores.filter(s => s.subBrandId === 'subbrand-central-fl-east') },
    { id: 'subbrand-north-fl-panhandle', name: 'North FL Panhandle', brandId: 'brand-north-fl', stores: allStores.filter(s => s.subBrandId === 'subbrand-north-fl-panhandle') },
    { id: 'subbrand-north-fl-interior', name: 'North FL Interior', brandId: 'brand-north-fl', stores: allStores.filter(s => s.subBrandId === 'subbrand-north-fl-interior') }
  ];

  // ========================================
  // Brand Definitions (top-level hierarchy nodes)
  // ========================================

  const brands = [
    {
      id: 'brand-south-fl',
      name: 'South Florida',
      subBrands: allSubBrands.filter(sb => sb.brandId === 'brand-south-fl')
    },
    {
      id: 'brand-central-fl',
      name: 'Central Florida',
      subBrands: allSubBrands.filter(sb => sb.brandId === 'brand-central-fl')
    },
    {
      id: 'brand-north-fl',
      name: 'North Florida',
      subBrands: allSubBrands.filter(sb => sb.brandId === 'brand-north-fl')
    }
  ];

  // ========================================
  // Lookup Helpers
  // ========================================

  function getStoreById(storeId) {
    return allStores.find(s => s.id === storeId) || null;
  }

  function getBrandById(brandId) {
    return brands.find(b => b.id === brandId) || null;
  }

  function getSubBrandById(subBrandId) {
    return allSubBrands.find(sb => sb.id === subBrandId) || null;
  }

  /**
   * Get store IDs for a given entity + level
   * @param {string} entityId - Entity ID or 'all'
   * @param {string} entityLevel - 'all' | 'brand' | 'sub-brand' | 'store'
   * @returns {string[]} Array of store IDs
   */
  function getStoresForEntity(entityId, entityLevel) {
    if (entityLevel === 'all' || entityId === 'all') {
      return allStores.map(s => s.id);
    }

    if (entityLevel === 'brand') {
      const brand = getBrandById(entityId);
      if (!brand) return [];
      const storeIds = [];
      brand.subBrands.forEach(sb => {
        sb.stores.forEach(s => storeIds.push(s.id));
      });
      return storeIds;
    }

    if (entityLevel === 'sub-brand') {
      const subBrand = getSubBrandById(entityId);
      return subBrand ? subBrand.stores.map(s => s.id) : [];
    }

    if (entityLevel === 'store') {
      const store = allStores.find(s => s.id === entityId);
      return store ? [store.id] : [];
    }

    return allStores.map(s => s.id);
  }

  // ========================================
  // Public API
  // ========================================

  return {
    retailerConfig,
    brands,
    subBrands: allSubBrands,
    stores: allStores,
    getStoreById,
    getBrandById,
    getSubBrandById,
    getStoresForEntity
  };
})();
