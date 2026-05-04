/**
 * Distribution Entities — Entity Hierarchy
 * Ideal (top) → Brand → Store
 *
 * Top retailer = Ideal Media Lab (umbrella across all advertisers).
 * Brands (children) = 7 advertisers from real Pulse exports:
 *   SEG, UNFI, Houchen's Food Group, Lunds & Byerlys, Gelson's, MDI, Agne.
 * Stores (grandchildren):
 *   - SEG: 35 hand-built FL stores with real addresses + lat/lng
 *   - All others: extracted from PulseReal campaign Name (no geo, name only)
 *
 * Sub-brands kept as a public field but emptied — preserved for any caller
 * still iterating subBrands; does not appear in the new tree.
 */

const DistributionEntities = (function() {
  'use strict';

  // ========================================
  // Retailer Config — Ideal as top container
  // ========================================

  const retailerConfig = {
    id: 'ideal',
    name: 'Ideal Media Lab',
    label: 'Ideal',
    pilotLabel: 'All Programs'
  };

  // ========================================
  // Store Definitions — Real FL locations
  // ========================================

  const allStores = [
    // ── SEG: Winn-Dixie South Florida ──
    { id: 'store-319', storeNumber: 319, name: 'Homestead', city: 'Homestead, FL', address: '30346 Old Dixie Highway, Homestead, FL 33030', subBrandId: 'subbrand-wd-south', brandId: 'brand-seg', lat: 25.462, lng: -80.448 },
    { id: 'store-336', storeNumber: 336, name: 'Hollywood', city: 'Hollywood, FL', address: '3010 Johnson St, Hollywood, FL 33021', subBrandId: 'subbrand-wd-south', lat: 26.020, lng: -80.153 },
    { id: 'store-381', storeNumber: 381, name: 'Belle Glade', city: 'Belle Glade, FL', address: '900 S Main St, Belle Glade, FL 33430', subBrandId: 'subbrand-wd-south', lat: 26.685, lng: -80.670 },
    { id: 'store-508', storeNumber: 508, name: 'Fort Myers', city: 'Fort Myers, FL', address: '4650 S Cleveland Ave, Fort Myers, FL 33907', subBrandId: 'subbrand-wd-south', lat: 26.620, lng: -81.870 },
    { id: 'store-518', storeNumber: 518, name: 'Naples', city: 'Naples, FL', address: '5750 Naples Blvd, Naples, FL 34109', subBrandId: 'subbrand-wd-south', lat: 26.234, lng: -81.781 },
    { id: 'store-726', storeNumber: 726, name: 'St James City', city: 'St James City, FL', address: '9864 Stringfellow Rd, St James City, FL 33956', subBrandId: 'subbrand-wd-south', lat: 26.532, lng: -82.085 },

    // ── Winn-Dixie: Central Florida ──
    { id: 'store-705', storeNumber: 705, name: 'Haines City', city: 'Haines City, FL', address: '36019 US Hwy 27 N, Haines City, FL 33844', subBrandId: 'subbrand-wd-central', lat: 28.117, lng: -81.618 },
    { id: 'store-2288', storeNumber: 2288, name: 'Orlando', city: 'Orlando, FL', address: '7640 W Sand Lake Rd, Orlando, FL 32819', subBrandId: 'subbrand-wd-central', lat: 28.452, lng: -81.470 },
    { id: 'store-2415', storeNumber: 2415, name: 'Tampa', city: 'Tampa, FL', address: '13508 N Florida Ave, Tampa, FL 33612', subBrandId: 'subbrand-wd-central', lat: 28.072, lng: -82.459 },
    { id: 'store-2434', storeNumber: 2434, name: 'Daytona Beach', city: 'Daytona Beach, FL', address: '1570 W Intl Speedway Blvd, Daytona Beach, FL 32114', subBrandId: 'subbrand-wd-central', lat: 29.186, lng: -81.077 },
    { id: 'store-2474', storeNumber: 2474, name: 'Melbourne', city: 'Melbourne, FL', address: '1900 W New Haven Ave, Melbourne, FL 32904', subBrandId: 'subbrand-wd-central', lat: 28.078, lng: -80.624 },
    { id: 'store-2480', storeNumber: 2480, name: 'Lakeland', city: 'Lakeland, FL', address: '3950 US-98 N, Lakeland, FL 33809', subBrandId: 'subbrand-wd-central', lat: 28.079, lng: -81.957 },
    { id: 'store-2487', storeNumber: 2487, name: 'Sarasota', city: 'Sarasota, FL', address: '3870 Bee Ridge Rd, Sarasota, FL 34233', subBrandId: 'subbrand-wd-central', lat: 27.305, lng: -82.477 },
    { id: 'store-2490', storeNumber: 2490, name: 'Port Charlotte', city: 'Port Charlotte, FL', address: '1900 Tamiami Trail, Port Charlotte, FL 33948', subBrandId: 'subbrand-wd-central', lat: 26.976, lng: -82.113 },
    { id: 'store-2501', storeNumber: 2501, name: 'Palm Bay', city: 'Palm Bay, FL', address: '1040 Malabar Rd SE, Palm Bay, FL 32907', subBrandId: 'subbrand-wd-central', lat: 28.003, lng: -80.660 },
    { id: 'store-2509', storeNumber: 2509, name: 'Bradenton', city: 'Bradenton, FL', address: '6255 Cortez Rd W, Bradenton, FL 34210', subBrandId: 'subbrand-wd-central', lat: 27.464, lng: -82.588 },
    { id: 'store-2545', storeNumber: 2545, name: 'The Villages', city: 'The Villages, FL', address: '2500 Burnsed Blvd, The Villages, FL 32163', subBrandId: 'subbrand-wd-central', lat: 28.925, lng: -81.986 },
    { id: 'store-711', storeNumber: 711, name: 'Spring Hill', city: 'Spring Hill, FL', address: '1233 Wendy Ct, Spring Hill, FL 34607', subBrandId: 'subbrand-wd-central', lat: 28.477, lng: -82.538 },

    // ── Winn-Dixie: North Florida ──
    { id: 'store-86', storeNumber: 86, name: 'Tallahassee', city: 'Tallahassee, FL', address: '111 S Magnolia Dr Suite 39, Tallahassee, FL 32301', subBrandId: 'subbrand-wd-north', lat: 30.430, lng: -84.270 },
    { id: 'store-195', storeNumber: 195, name: 'Jacksonville Beach', city: 'Jacksonville, FL', address: '11380 Beach Blvd Suite 6, Jacksonville, FL 32246', subBrandId: 'subbrand-wd-north', lat: 30.289, lng: -81.510 },
    { id: 'store-560', storeNumber: 560, name: 'Destin', city: 'Destin, FL', address: '981 US Hwy 98, Destin, FL 32541', subBrandId: 'subbrand-wd-north', lat: 30.394, lng: -86.497 },
    { id: 'store-2247', storeNumber: 2247, name: 'Palm Coast', city: 'Palm Coast, FL', address: '1260 W Palm Coast Pkwy, Palm Coast, FL 32137', subBrandId: 'subbrand-wd-north', lat: 29.551, lng: -81.245 },
    { id: 'store-2399', storeNumber: 2399, name: 'Jacksonville West', city: 'Jacksonville, FL', address: '4525 San Juan Ave, Jacksonville, FL 32210', subBrandId: 'subbrand-wd-north', lat: 30.287, lng: -81.703 },
    { id: 'store-2437', storeNumber: 2437, name: 'Ocala', city: 'Ocala, FL', address: '7131 N US Hwy 441, Ocala, FL 34475', subBrandId: 'subbrand-wd-north', lat: 29.225, lng: -82.133 },
    { id: 'store-2449', storeNumber: 2449, name: 'Pensacola', city: 'Pensacola, FL', address: '2601 N Davis Hwy, Pensacola, FL 32503', subBrandId: 'subbrand-wd-north', lat: 30.443, lng: -87.220 },
    { id: 'store-2482', storeNumber: 2482, name: 'Gainesville', city: 'Gainesville, FL', address: '3720 NW 13th St, Gainesville, FL 32609', subBrandId: 'subbrand-wd-north', lat: 29.678, lng: -82.356 },
    { id: 'store-2495', storeNumber: 2495, name: 'Tallahassee N', city: 'Tallahassee, FL', address: '1700 N Monroe St, Tallahassee, FL 32303', subBrandId: 'subbrand-wd-north', lat: 30.456, lng: -84.274 },
    { id: 'store-436', storeNumber: 436, name: 'Lynn Haven', city: 'Lynn Haven, FL', address: '2101 S Hwy 77, Lynn Haven, FL 32444', subBrandId: 'subbrand-wd-north', lat: 30.233, lng: -85.655 },

    // ── Harveys: Florida ──
    { id: 'store-1671', storeNumber: 1671, name: 'Lake City', city: 'Lake City, FL', address: '4506 SW Heritage Oaks Cir, Lake City, FL 32055', subBrandId: 'subbrand-harveys', lat: 30.170, lng: -82.660 },
    { id: 'store-1690', storeNumber: 1690, name: 'Jacksonville University', city: 'Jacksonville, FL', address: '5909 University Blvd W, Jacksonville, FL 32216', subBrandId: 'subbrand-harveys', lat: 30.290, lng: -81.590 },
    { id: 'store-1692', storeNumber: 1692, name: 'Jacksonville Moncrief', city: 'Jacksonville, FL', address: '5250 Moncrief Rd W, Jacksonville, FL 32209', subBrandId: 'subbrand-harveys', lat: 30.370, lng: -81.700 },
    { id: 'store-1694', storeNumber: 1694, name: 'Jacksonville 48th', city: 'Jacksonville, FL', address: '201 W 48th St, Jacksonville, FL 32208', subBrandId: 'subbrand-harveys', lat: 30.380, lng: -81.660 },
    { id: 'store-1710', storeNumber: 1710, name: 'Lakeland East', city: 'Lakeland, FL', address: '2630 US Hwy 92, Lakeland, FL 33801', subBrandId: 'subbrand-harveys', lat: 28.046, lng: -81.905 },
    { id: 'store-1712', storeNumber: 1712, name: 'Lakeland Central', city: 'Lakeland, FL', address: '1305 Ariana St W, Lakeland, FL 33803', subBrandId: 'subbrand-harveys', lat: 28.030, lng: -81.970 },
    { id: 'store-1716', storeNumber: 1716, name: 'Jacksonville Arlington', city: 'Jacksonville, FL', address: '49 S Arlington Rd, Jacksonville, FL 32211', subBrandId: 'subbrand-harveys', lat: 30.330, lng: -81.600 }
  ];

  // Stamp every hand-built store with brandId='brand-seg' (all 35 are SEG).
  allStores.forEach(s => { s.brandId = 'brand-seg'; });

  // ========================================
  // Non-SEG Brands — extracted from PulseReal at module init
  // No address / lat / lng available; only campaign Name + trailing store #.
  // ========================================

  const NON_SEG_BRAND_DEFS = [
    { id: 'brand-unfi',     name: 'UNFI',                  advertiser: 'UNFI' },
    { id: 'brand-houchens', name: "Houchen's Food Group",  advertiser: "Houchen's Food Group" },
    { id: 'brand-lunds',    name: 'Lunds & Byerlys',       advertiser: 'Lunds & Byerlys' },
    { id: 'brand-gelsons',  name: "Gelson's",              advertiser: "Gelson's" },
    { id: 'brand-mdi',      name: 'MDI',                   advertiser: 'MDI' },
    { id: 'brand-agne',     name: 'Agne',                  advertiser: 'Agne' }
  ];

  function slugify(s) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50);
  }

  if (typeof PulseReal !== 'undefined') {
    const seenByBrand = {};
    PulseReal.campaigns.forEach(c => {
      const def = NON_SEG_BRAND_DEFS.find(d => d.advertiser === c['Advertiser Name']);
      if (!def) return;
      const name = (c.Name || '').trim();
      if (!name) return;
      seenByBrand[def.id] = seenByBrand[def.id] || new Set();
      if (seenByBrand[def.id].has(name)) return;
      seenByBrand[def.id].add(name);
      const num = c._store_number != null ? c._store_number : null;
      const slug = slugify(name);
      allStores.push({
        id: 'store-' + def.id.replace('brand-', '') + '-' + slug,
        storeNumber: num,
        name: name,
        city: null,
        address: null,
        brandId: def.id,
        subBrandId: null,
        lat: null,
        lng: null,
        pulseCampaign: c   // real campaign — used by distribution-records for budget/KPI/reporting
      });
    });
  }

  // ========================================
  // Brand Definitions — Ideal (top) → Brand (children) → Store (grandchildren)
  // ========================================

  const brands = [
    { id: 'brand-seg', name: 'Southeastern Grocers' },
    ...NON_SEG_BRAND_DEFS.map(d => ({ id: d.id, name: d.name }))
  ];
  brands.forEach(b => {
    b.stores = allStores.filter(s => s.brandId === b.id);
    b.subBrands = []; // emptied — sub-brand level is no longer used in the new tree
  });

  // Sub-brands kept as empty for backward-compat with legacy callers.
  const allSubBrands = [];

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

  function getStoresForEntity(entityId, entityLevel) {
    if (entityLevel === 'all' || entityId === 'all' || entityId === 'ideal') {
      return allStores.map(s => s.id);
    }
    if (entityLevel === 'brand') {
      const brand = getBrandById(entityId);
      return brand ? brand.stores.map(s => s.id) : [];
    }
    if (entityLevel === 'sub-brand') {
      // Legacy level — no sub-brands in new hierarchy.
      return [];
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
