// UX-846 Phase 1 — Locked entity tree per UX-846-ENTITY-HIERARCHY.md
// 48 nodes total: 1 brand + 4 sub-brands + 8 groups + 35 stores.
// Every node carries the full parent chain so rollups can happen at any level.
// PHASE-1-ASSUMPTION: latitude/longitude not present in source doc for every store;
//   generated approximate FL coordinates by city. Real geocodes can replace later.
// PHASE-1-ASSUMPTION: addresses for stores not listed in §"Store assignments" use
//   "[City], FL" placeholder — Phase 1 doc only listed full addresses for South Atlantic + South Gulf.

(function (root) {
  'use strict';

  const RETAILER_ID = 'retailer-ideal-media-lab';
  const BRAND_ID = 'brand-ideal-foods';

  // ---- Retailer ----
  const retailer = {
    id: RETAILER_ID,
    name: 'Ideal Media Lab',
    label: 'Ideal Media Lab',
    level: 'retailer'
  };

  // ---- Brand ----
  const brand = {
    id: BRAND_ID,
    name: 'Ideal Foods',
    label: 'Ideal Foods',
    level: 'brand',
    retailerId: RETAILER_ID
  };

  // ---- Sub-brands ----
  const subBrands = [
    { id: 'subbrand-ideal-south',   name: 'Ideal South Coast', label: 'Ideal South Coast', level: 'subBrand', parentBrandId: BRAND_ID, retailerId: RETAILER_ID },
    { id: 'subbrand-ideal-central', name: 'Ideal Central',     label: 'Ideal Central',     level: 'subBrand', parentBrandId: BRAND_ID, retailerId: RETAILER_ID },
    { id: 'subbrand-ideal-gulf',    name: 'Ideal Gulf',        label: 'Ideal Gulf',        level: 'subBrand', parentBrandId: BRAND_ID, retailerId: RETAILER_ID },
    { id: 'subbrand-ideal-markets', name: 'Ideal Markets',     label: 'Ideal Markets',     level: 'subBrand', parentBrandId: BRAND_ID, retailerId: RETAILER_ID }
  ];

  // ---- Groups ----
  const groups = [
    { id: 'group-south-atlantic',     name: 'South Atlantic',     label: 'South Atlantic',     parentSubBrandId: 'subbrand-ideal-south',   parentBrandId: BRAND_ID, retailerId: RETAILER_ID, level: 'group' },
    { id: 'group-south-gulf',         name: 'South Gulf',         label: 'South Gulf',         parentSubBrandId: 'subbrand-ideal-south',   parentBrandId: BRAND_ID, retailerId: RETAILER_ID, level: 'group' },
    { id: 'group-i4-corridor',        name: 'I-4 Corridor',       label: 'I-4 Corridor',       parentSubBrandId: 'subbrand-ideal-central', parentBrandId: BRAND_ID, retailerId: RETAILER_ID, level: 'group' },
    { id: 'group-suncoast',           name: 'Suncoast',           label: 'Suncoast',           parentSubBrandId: 'subbrand-ideal-central', parentBrandId: BRAND_ID, retailerId: RETAILER_ID, level: 'group' },
    { id: 'group-panhandle',          name: 'Panhandle',          label: 'Panhandle',          parentSubBrandId: 'subbrand-ideal-gulf',    parentBrandId: BRAND_ID, retailerId: RETAILER_ID, level: 'group' },
    { id: 'group-northeast',          name: 'Northeast',          label: 'Northeast',          parentSubBrandId: 'subbrand-ideal-gulf',    parentBrandId: BRAND_ID, retailerId: RETAILER_ID, level: 'group' },
    { id: 'group-jacksonville-metro', name: 'Jacksonville Metro', label: 'Jacksonville Metro', parentSubBrandId: 'subbrand-ideal-markets', parentBrandId: BRAND_ID, retailerId: RETAILER_ID, level: 'group' },
    { id: 'group-heartland',          name: 'Heartland',          label: 'Heartland',          parentSubBrandId: 'subbrand-ideal-markets', parentBrandId: BRAND_ID, retailerId: RETAILER_ID, level: 'group' }
  ];

  // ---- Stores ----
  // Helper to build a store row with full ancestry.
  function mkStore(num, name, city, address, lat, lng, groupId, subBrandId) {
    return {
      id: 'store-' + num,
      storeNumber: num,
      name,
      city,
      address,
      lat,
      lng,
      level: 'store',
      parentGroupId: groupId,
      parentSubBrandId: subBrandId,
      parentBrandId: BRAND_ID,
      retailerId: RETAILER_ID
    };
  }

  const stores = [
    // South Atlantic (2)
    mkStore(319, 'Homestead',  'Homestead, FL', '30346 Old Dixie Highway, Homestead, FL 33030', 25.467, -80.477, 'group-south-atlantic', 'subbrand-ideal-south'),
    mkStore(336, 'Hollywood',  'Hollywood, FL', '3010 Johnson St, Hollywood, FL 33021',          26.011, -80.149, 'group-south-atlantic', 'subbrand-ideal-south'),

    // South Gulf (4)
    mkStore(381, 'Belle Glade',    'Belle Glade, FL',    '900 S Main St, Belle Glade, FL 33430',          26.683, -80.668, 'group-south-gulf', 'subbrand-ideal-south'),
    mkStore(508, 'Fort Myers',     'Fort Myers, FL',     '4650 S Cleveland Ave, Fort Myers, FL 33907',    26.581, -81.872, 'group-south-gulf', 'subbrand-ideal-south'),
    mkStore(518, 'Naples',         'Naples, FL',         '5750 Naples Blvd, Naples, FL 34109',            26.215, -81.769, 'group-south-gulf', 'subbrand-ideal-south'),
    mkStore(726, 'St James City',  'St James City, FL',  '9864 Stringfellow Rd, St James City, FL 33956', 26.501, -82.078, 'group-south-gulf', 'subbrand-ideal-south'),

    // I-4 Corridor (8)
    mkStore(705,  'Haines City',    'Haines City, FL',    'Haines City, FL',    28.114, -81.620, 'group-i4-corridor', 'subbrand-ideal-central'),
    mkStore(2288, 'Orlando',        'Orlando, FL',        'Orlando, FL',        28.452, -81.470, 'group-i4-corridor', 'subbrand-ideal-central'),
    mkStore(2415, 'Tampa',          'Tampa, FL',          'Tampa, FL',          27.951, -82.458, 'group-i4-corridor', 'subbrand-ideal-central'),
    mkStore(2434, 'Daytona Beach',  'Daytona Beach, FL',  'Daytona Beach, FL',  29.210, -81.022, 'group-i4-corridor', 'subbrand-ideal-central'),
    mkStore(2474, 'Melbourne',      'Melbourne, FL',      'Melbourne, FL',      28.084, -80.608, 'group-i4-corridor', 'subbrand-ideal-central'),
    mkStore(2480, 'Lakeland',       'Lakeland, FL',       'Lakeland, FL',       28.039, -81.949, 'group-i4-corridor', 'subbrand-ideal-central'),
    mkStore(2501, 'Palm Bay',       'Palm Bay, FL',       'Palm Bay, FL',       28.034, -80.588, 'group-i4-corridor', 'subbrand-ideal-central'),
    mkStore(2545, 'The Villages',   'The Villages, FL',   'The Villages, FL',   28.929, -82.014, 'group-i4-corridor', 'subbrand-ideal-central'),

    // Suncoast (4)
    mkStore(2487, 'Sarasota',       'Sarasota, FL',       'Sarasota, FL',       27.336, -82.531, 'group-suncoast', 'subbrand-ideal-central'),
    mkStore(2490, 'Port Charlotte', 'Port Charlotte, FL', 'Port Charlotte, FL', 26.976, -82.091, 'group-suncoast', 'subbrand-ideal-central'),
    mkStore(2509, 'Bradenton',      'Bradenton, FL',      'Bradenton, FL',      27.498, -82.575, 'group-suncoast', 'subbrand-ideal-central'),
    mkStore(711,  'Spring Hill',    'Spring Hill, FL',    'Spring Hill, FL',    28.479, -82.524, 'group-suncoast', 'subbrand-ideal-central'),

    // Panhandle (5)
    mkStore(86,   'Tallahassee',   'Tallahassee, FL', 'Tallahassee, FL', 30.438, -84.281, 'group-panhandle', 'subbrand-ideal-gulf'),
    mkStore(2495, 'Tallahassee N', 'Tallahassee, FL', 'Tallahassee, FL', 30.504, -84.255, 'group-panhandle', 'subbrand-ideal-gulf'),
    mkStore(2449, 'Pensacola',     'Pensacola, FL',   'Pensacola, FL',   30.421, -87.217, 'group-panhandle', 'subbrand-ideal-gulf'),
    mkStore(560,  'Destin',        'Destin, FL',      'Destin, FL',      30.393, -86.495, 'group-panhandle', 'subbrand-ideal-gulf'),
    mkStore(436,  'Lynn Haven',    'Lynn Haven, FL',  'Lynn Haven, FL',  30.246, -85.647, 'group-panhandle', 'subbrand-ideal-gulf'),

    // Northeast (5)
    mkStore(195,  'Jacksonville Beach', 'Jacksonville, FL', 'Jacksonville, FL', 30.295, -81.394, 'group-northeast', 'subbrand-ideal-gulf'),
    mkStore(2399, 'Jacksonville West',  'Jacksonville, FL', 'Jacksonville, FL', 30.286, -81.728, 'group-northeast', 'subbrand-ideal-gulf'),
    mkStore(2247, 'Palm Coast',         'Palm Coast, FL',   'Palm Coast, FL',   29.585, -81.207, 'group-northeast', 'subbrand-ideal-gulf'),
    mkStore(2437, 'Ocala',              'Ocala, FL',        'Ocala, FL',        29.187, -82.140, 'group-northeast', 'subbrand-ideal-gulf'),
    mkStore(2482, 'Gainesville',        'Gainesville, FL',  'Gainesville, FL',  29.651, -82.325, 'group-northeast', 'subbrand-ideal-gulf'),

    // Jacksonville Metro (4)
    mkStore(1690, 'Jacksonville University', 'Jacksonville, FL', 'Jacksonville, FL', 30.353, -81.604, 'group-jacksonville-metro', 'subbrand-ideal-markets'),
    mkStore(1692, 'Jacksonville Moncrief',   'Jacksonville, FL', 'Jacksonville, FL', 30.367, -81.689, 'group-jacksonville-metro', 'subbrand-ideal-markets'),
    mkStore(1694, 'Jacksonville 48th',       'Jacksonville, FL', 'Jacksonville, FL', 30.376, -81.671, 'group-jacksonville-metro', 'subbrand-ideal-markets'),
    mkStore(1716, 'Jacksonville Arlington',  'Jacksonville, FL', 'Jacksonville, FL', 30.331, -81.580, 'group-jacksonville-metro', 'subbrand-ideal-markets'),

    // Heartland (3)
    mkStore(1671, 'Lake City',        'Lake City, FL', 'Lake City, FL', 30.189, -82.639, 'group-heartland', 'subbrand-ideal-markets'),
    mkStore(1710, 'Lakeland East',    'Lakeland, FL',  'Lakeland, FL',  28.039, -81.910, 'group-heartland', 'subbrand-ideal-markets'),
    mkStore(1712, 'Lakeland Central', 'Lakeland, FL',  'Lakeland, FL',  28.039, -81.949, 'group-heartland', 'subbrand-ideal-markets')
  ];

  const hierarchy = { retailer, brand, subBrands, groups, stores };

  // Browser global
  if (root) {
    root.MockDataHierarchy = hierarchy;
  }
  // Node export (for the build script)
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = hierarchy;
  }
})(typeof window !== 'undefined' ? window : null);
