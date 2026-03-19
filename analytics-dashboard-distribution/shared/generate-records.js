/**
 * Generator script for promotion-records-data.js
 * Run with: node generate-records.js > promotion-records-data.js
 *
 * Includes daysRun, startDate, endDate fields with distribution:
 * - 85% are 7-day (full week)
 * - 10% are 3-day (weekend or midweek)
 * - 5% are 1-day (Saturday or Wednesday)
 */

// Week definitions (weeks start on Monday for these circulars)
const weeks = [
  { num: 44, label: 'Oct 28 - Nov 3', startDate: '2025-10-28' },
  { num: 45, label: 'Nov 4 - Nov 10', startDate: '2025-11-04' },
  { num: 46, label: 'Nov 11 - Nov 17', startDate: '2025-11-11' },
  { num: 47, label: 'Nov 18 - Nov 24', startDate: '2025-11-18' },
  { num: 48, label: 'Nov 25 - Dec 1', startDate: '2025-11-25' }
];

// Store definitions from mock-data.js
const stores = [
  // Safeway stores
  { id: 'store-101', name: 'SF Market St', size: 'large', subBrandId: 'subbrand-safeway-norcal-north', subBrandName: 'Safeway NorCal North', brandId: 'brand-safeway', brandName: 'Safeway' },
  { id: 'store-102', name: 'SF Mission', size: 'medium', subBrandId: 'subbrand-safeway-norcal-north', subBrandName: 'Safeway NorCal North', brandId: 'brand-safeway', brandName: 'Safeway' },
  { id: 'store-103', name: 'SF Sunset', size: 'medium', subBrandId: 'subbrand-safeway-norcal-north', subBrandName: 'Safeway NorCal North', brandId: 'brand-safeway', brandName: 'Safeway' },
  { id: 'store-104', name: 'Oakland Downtown', size: 'large', subBrandId: 'subbrand-safeway-norcal-east', subBrandName: 'Safeway NorCal East', brandId: 'brand-safeway', brandName: 'Safeway' },
  { id: 'store-105', name: 'Berkeley', size: 'medium', subBrandId: 'subbrand-safeway-norcal-east', subBrandName: 'Safeway NorCal East', brandId: 'brand-safeway', brandName: 'Safeway' },
  { id: 'store-106', name: 'Emeryville', size: 'small', subBrandId: 'subbrand-safeway-norcal-east', subBrandName: 'Safeway NorCal East', brandId: 'brand-safeway', brandName: 'Safeway' },
  { id: 'store-107', name: 'San Jose Downtown', size: 'large', subBrandId: 'subbrand-safeway-norcal-south', subBrandName: 'Safeway NorCal South', brandId: 'brand-safeway', brandName: 'Safeway' },
  { id: 'store-108', name: 'Palo Alto', size: 'medium', subBrandId: 'subbrand-safeway-norcal-south', subBrandName: 'Safeway NorCal South', brandId: 'brand-safeway', brandName: 'Safeway' },
  { id: 'store-109', name: 'Walnut Creek', size: 'large', subBrandId: 'subbrand-safeway-eastbay', subBrandName: 'Safeway East Bay', brandId: 'brand-safeway', brandName: 'Safeway' },
  { id: 'store-110', name: 'Concord', size: 'medium', subBrandId: 'subbrand-safeway-eastbay', subBrandName: 'Safeway East Bay', brandId: 'brand-safeway', brandName: 'Safeway' },
  { id: 'store-111', name: 'Pleasant Hill', size: 'medium', subBrandId: 'subbrand-safeway-eastbay', subBrandName: 'Safeway East Bay', brandId: 'brand-safeway', brandName: 'Safeway' },
  { id: 'store-112', name: 'Daly City', size: 'medium', subBrandId: 'subbrand-safeway-peninsula', subBrandName: 'Safeway Peninsula', brandId: 'brand-safeway', brandName: 'Safeway' },
  { id: 'store-113', name: 'San Mateo', size: 'large', subBrandId: 'subbrand-safeway-peninsula', subBrandName: 'Safeway Peninsula', brandId: 'brand-safeway', brandName: 'Safeway' },
  { id: 'store-114', name: 'Redwood City', size: 'medium', subBrandId: 'subbrand-safeway-peninsula', subBrandName: 'Safeway Peninsula', brandId: 'brand-safeway', brandName: 'Safeway' },
  { id: 'store-115', name: 'San Rafael', size: 'large', subBrandId: 'subbrand-safeway-marin', subBrandName: 'Safeway Marin', brandId: 'brand-safeway', brandName: 'Safeway' },
  { id: 'store-116', name: 'Mill Valley', size: 'small', subBrandId: 'subbrand-safeway-marin', subBrandName: 'Safeway Marin', brandId: 'brand-safeway', brandName: 'Safeway' },

  // Vons stores
  { id: 'store-201', name: 'LA Downtown', size: 'large', subBrandId: 'subbrand-vons-la-central', subBrandName: 'Vons LA Central', brandId: 'brand-vons', brandName: 'Vons' },
  { id: 'store-202', name: 'Hollywood', size: 'medium', subBrandId: 'subbrand-vons-la-central', subBrandName: 'Vons LA Central', brandId: 'brand-vons', brandName: 'Vons' },
  { id: 'store-203', name: 'Koreatown', size: 'medium', subBrandId: 'subbrand-vons-la-central', subBrandName: 'Vons LA Central', brandId: 'brand-vons', brandName: 'Vons' },
  { id: 'store-204', name: 'Santa Monica', size: 'large', subBrandId: 'subbrand-vons-la-west', subBrandName: 'Vons LA West', brandId: 'brand-vons', brandName: 'Vons' },
  { id: 'store-205', name: 'Venice', size: 'medium', subBrandId: 'subbrand-vons-la-west', subBrandName: 'Vons LA West', brandId: 'brand-vons', brandName: 'Vons' },
  { id: 'store-206', name: 'Culver City', size: 'medium', subBrandId: 'subbrand-vons-la-west', subBrandName: 'Vons LA West', brandId: 'brand-vons', brandName: 'Vons' },
  { id: 'store-207', name: 'Pasadena', size: 'large', subBrandId: 'subbrand-vons-la-east', subBrandName: 'Vons LA East', brandId: 'brand-vons', brandName: 'Vons' },
  { id: 'store-208', name: 'Glendale', size: 'medium', subBrandId: 'subbrand-vons-la-east', subBrandName: 'Vons LA East', brandId: 'brand-vons', brandName: 'Vons' },
  { id: 'store-209', name: 'SD Gaslamp', size: 'medium', subBrandId: 'subbrand-vons-sd-north', subBrandName: 'Vons San Diego North', brandId: 'brand-vons', brandName: 'Vons' },
  { id: 'store-210', name: 'La Jolla', size: 'large', subBrandId: 'subbrand-vons-sd-north', subBrandName: 'Vons San Diego North', brandId: 'brand-vons', brandName: 'Vons' },
  { id: 'store-211', name: 'Del Mar', size: 'small', subBrandId: 'subbrand-vons-sd-north', subBrandName: 'Vons San Diego North', brandId: 'brand-vons', brandName: 'Vons' },
  { id: 'store-212', name: 'Chula Vista', size: 'medium', subBrandId: 'subbrand-vons-sd-south', subBrandName: 'Vons San Diego South', brandId: 'brand-vons', brandName: 'Vons' },
  { id: 'store-213', name: 'National City', size: 'medium', subBrandId: 'subbrand-vons-sd-south', subBrandName: 'Vons San Diego South', brandId: 'brand-vons', brandName: 'Vons' },
  { id: 'store-214', name: 'Irvine', size: 'large', subBrandId: 'subbrand-vons-oc', subBrandName: 'Vons Orange County', brandId: 'brand-vons', brandName: 'Vons' },
  { id: 'store-215', name: 'Newport Beach', size: 'medium', subBrandId: 'subbrand-vons-oc', subBrandName: 'Vons Orange County', brandId: 'brand-vons', brandName: 'Vons' },
  { id: 'store-216', name: 'Anaheim', size: 'large', subBrandId: 'subbrand-vons-oc', subBrandName: 'Vons Orange County', brandId: 'brand-vons', brandName: 'Vons' },

  // Albertsons stores
  { id: 'store-301', name: 'Sacramento Downtown', size: 'large', subBrandId: 'subbrand-albertsons-sac', subBrandName: 'Albertsons Sacramento', brandId: 'brand-albertsons', brandName: 'Albertsons' },
  { id: 'store-302', name: 'Elk Grove', size: 'medium', subBrandId: 'subbrand-albertsons-sac', subBrandName: 'Albertsons Sacramento', brandId: 'brand-albertsons', brandName: 'Albertsons' },
  { id: 'store-303', name: 'Roseville', size: 'medium', subBrandId: 'subbrand-albertsons-sac', subBrandName: 'Albertsons Sacramento', brandId: 'brand-albertsons', brandName: 'Albertsons' },
  { id: 'store-304', name: 'Fresno', size: 'large', subBrandId: 'subbrand-albertsons-central', subBrandName: 'Albertsons Central Valley', brandId: 'brand-albertsons', brandName: 'Albertsons' },
  { id: 'store-305', name: 'Stockton', size: 'medium', subBrandId: 'subbrand-albertsons-central', subBrandName: 'Albertsons Central Valley', brandId: 'brand-albertsons', brandName: 'Albertsons' },
  { id: 'store-306', name: 'Portland Downtown', size: 'large', subBrandId: 'subbrand-albertsons-portland', subBrandName: 'Albertsons Portland', brandId: 'brand-albertsons', brandName: 'Albertsons' },
  { id: 'store-307', name: 'Beaverton', size: 'medium', subBrandId: 'subbrand-albertsons-portland', subBrandName: 'Albertsons Portland', brandId: 'brand-albertsons', brandName: 'Albertsons' },
  { id: 'store-308', name: 'Lake Oswego', size: 'small', subBrandId: 'subbrand-albertsons-portland', subBrandName: 'Albertsons Portland', brandId: 'brand-albertsons', brandName: 'Albertsons' },
  { id: 'store-309', name: 'Seattle Ballard', size: 'large', subBrandId: 'subbrand-albertsons-seattle', subBrandName: 'Albertsons Seattle', brandId: 'brand-albertsons', brandName: 'Albertsons' },
  { id: 'store-310', name: 'Bellevue', size: 'large', subBrandId: 'subbrand-albertsons-seattle', subBrandName: 'Albertsons Seattle', brandId: 'brand-albertsons', brandName: 'Albertsons' },
  { id: 'store-311', name: 'Kirkland', size: 'medium', subBrandId: 'subbrand-albertsons-seattle', subBrandName: 'Albertsons Seattle', brandId: 'brand-albertsons', brandName: 'Albertsons' },
  { id: 'store-312', name: 'Tacoma', size: 'medium', subBrandId: 'subbrand-albertsons-tacoma', subBrandName: 'Albertsons Tacoma', brandId: 'brand-albertsons', brandName: 'Albertsons' },
  { id: 'store-313', name: 'Olympia', size: 'medium', subBrandId: 'subbrand-albertsons-tacoma', subBrandName: 'Albertsons Tacoma', brandId: 'brand-albertsons', brandName: 'Albertsons' },
  { id: 'store-314', name: 'Spokane Downtown', size: 'large', subBrandId: 'subbrand-albertsons-spokane', subBrandName: 'Albertsons Spokane', brandId: 'brand-albertsons', brandName: 'Albertsons' },
  { id: 'store-315', name: 'Spokane Valley', size: 'medium', subBrandId: 'subbrand-albertsons-spokane', subBrandName: 'Albertsons Spokane', brandId: 'brand-albertsons', brandName: 'Albertsons' },
  { id: 'store-316', name: "Coeur d'Alene", size: 'medium', subBrandId: 'subbrand-albertsons-spokane', subBrandName: 'Albertsons Spokane', brandId: 'brand-albertsons', brandName: 'Albertsons' },

  // Jewel-Osco stores
  { id: 'store-401', name: 'Chicago Loop', size: 'large', subBrandId: 'subbrand-jewelosco-chicago-north', subBrandName: 'Jewel-Osco Chicago North', brandId: 'brand-jewelosco', brandName: 'Jewel-Osco' },
  { id: 'store-402', name: 'Lincoln Park', size: 'medium', subBrandId: 'subbrand-jewelosco-chicago-north', subBrandName: 'Jewel-Osco Chicago North', brandId: 'brand-jewelosco', brandName: 'Jewel-Osco' },
  { id: 'store-403', name: 'Lakeview', size: 'medium', subBrandId: 'subbrand-jewelosco-chicago-north', subBrandName: 'Jewel-Osco Chicago North', brandId: 'brand-jewelosco', brandName: 'Jewel-Osco' },
  { id: 'store-404', name: 'Hyde Park', size: 'medium', subBrandId: 'subbrand-jewelosco-chicago-south', subBrandName: 'Jewel-Osco Chicago South', brandId: 'brand-jewelosco', brandName: 'Jewel-Osco' },
  { id: 'store-405', name: 'Bronzeville', size: 'small', subBrandId: 'subbrand-jewelosco-chicago-south', subBrandName: 'Jewel-Osco Chicago South', brandId: 'brand-jewelosco', brandName: 'Jewel-Osco' },
  { id: 'store-406', name: 'Evanston', size: 'large', subBrandId: 'subbrand-jewelosco-northshore', subBrandName: 'Jewel-Osco North Shore', brandId: 'brand-jewelosco', brandName: 'Jewel-Osco' },
  { id: 'store-407', name: 'Wilmette', size: 'medium', subBrandId: 'subbrand-jewelosco-northshore', subBrandName: 'Jewel-Osco North Shore', brandId: 'brand-jewelosco', brandName: 'Jewel-Osco' },
  { id: 'store-408', name: 'Highland Park', size: 'medium', subBrandId: 'subbrand-jewelosco-northshore', subBrandName: 'Jewel-Osco North Shore', brandId: 'brand-jewelosco', brandName: 'Jewel-Osco' },
  { id: 'store-409', name: 'Oak Park', size: 'medium', subBrandId: 'subbrand-jewelosco-westburbs', subBrandName: 'Jewel-Osco Western Suburbs', brandId: 'brand-jewelosco', brandName: 'Jewel-Osco' },
  { id: 'store-410', name: 'Naperville', size: 'large', subBrandId: 'subbrand-jewelosco-westburbs', subBrandName: 'Jewel-Osco Western Suburbs', brandId: 'brand-jewelosco', brandName: 'Jewel-Osco' },
  { id: 'store-411', name: 'Aurora', size: 'large', subBrandId: 'subbrand-jewelosco-westburbs', subBrandName: 'Jewel-Osco Western Suburbs', brandId: 'brand-jewelosco', brandName: 'Jewel-Osco' },
  { id: 'store-412', name: 'Schaumburg', size: 'large', subBrandId: 'subbrand-jewelosco-nwburbs', subBrandName: 'Jewel-Osco NW Suburbs', brandId: 'brand-jewelosco', brandName: 'Jewel-Osco' },
  { id: 'store-413', name: 'Arlington Heights', size: 'medium', subBrandId: 'subbrand-jewelosco-nwburbs', subBrandName: 'Jewel-Osco NW Suburbs', brandId: 'brand-jewelosco', brandName: 'Jewel-Osco' },
  { id: 'store-414', name: 'Orland Park', size: 'large', subBrandId: 'subbrand-jewelosco-swburbs', subBrandName: 'Jewel-Osco SW Suburbs', brandId: 'brand-jewelosco', brandName: 'Jewel-Osco' },
  { id: 'store-415', name: 'Tinley Park', size: 'medium', subBrandId: 'subbrand-jewelosco-swburbs', subBrandName: 'Jewel-Osco SW Suburbs', brandId: 'brand-jewelosco', brandName: 'Jewel-Osco' },
  { id: 'store-416', name: 'Joliet', size: 'medium', subBrandId: 'subbrand-jewelosco-swburbs', subBrandName: 'Jewel-Osco SW Suburbs', brandId: 'brand-jewelosco', brandName: 'Jewel-Osco' },

  // Acme Markets stores
  { id: 'store-501', name: 'Center City', size: 'large', subBrandId: 'subbrand-acme-philly-center', subBrandName: 'Acme Philadelphia Center', brandId: 'brand-acme', brandName: 'Acme Markets' },
  { id: 'store-502', name: 'University City', size: 'medium', subBrandId: 'subbrand-acme-philly-center', subBrandName: 'Acme Philadelphia Center', brandId: 'brand-acme', brandName: 'Acme Markets' },
  { id: 'store-503', name: 'Northern Liberties', size: 'medium', subBrandId: 'subbrand-acme-philly-center', subBrandName: 'Acme Philadelphia Center', brandId: 'brand-acme', brandName: 'Acme Markets' },
  { id: 'store-504', name: 'Manayunk', size: 'medium', subBrandId: 'subbrand-acme-philly-northwest', subBrandName: 'Acme Philadelphia NW', brandId: 'brand-acme', brandName: 'Acme Markets' },
  { id: 'store-505', name: 'Chestnut Hill', size: 'small', subBrandId: 'subbrand-acme-philly-northwest', subBrandName: 'Acme Philadelphia NW', brandId: 'brand-acme', brandName: 'Acme Markets' },
  { id: 'store-506', name: 'Cherry Hill', size: 'large', subBrandId: 'subbrand-acme-nj-south', subBrandName: 'Acme NJ South', brandId: 'brand-acme', brandName: 'Acme Markets' },
  { id: 'store-507', name: 'Voorhees', size: 'medium', subBrandId: 'subbrand-acme-nj-south', subBrandName: 'Acme NJ South', brandId: 'brand-acme', brandName: 'Acme Markets' },
  { id: 'store-508', name: 'Marlton', size: 'medium', subBrandId: 'subbrand-acme-nj-south', subBrandName: 'Acme NJ South', brandId: 'brand-acme', brandName: 'Acme Markets' },
  { id: 'store-509', name: 'Princeton', size: 'large', subBrandId: 'subbrand-acme-nj-central', subBrandName: 'Acme NJ Central', brandId: 'brand-acme', brandName: 'Acme Markets' },
  { id: 'store-510', name: 'Lawrenceville', size: 'medium', subBrandId: 'subbrand-acme-nj-central', subBrandName: 'Acme NJ Central', brandId: 'brand-acme', brandName: 'Acme Markets' },
  { id: 'store-511', name: 'Wilmington', size: 'large', subBrandId: 'subbrand-acme-de', subBrandName: 'Acme Delaware', brandId: 'brand-acme', brandName: 'Acme Markets' },
  { id: 'store-512', name: 'Newark DE', size: 'medium', subBrandId: 'subbrand-acme-de', subBrandName: 'Acme Delaware', brandId: 'brand-acme', brandName: 'Acme Markets' },
  { id: 'store-513', name: 'Dover', size: 'medium', subBrandId: 'subbrand-acme-de', subBrandName: 'Acme Delaware', brandId: 'brand-acme', brandName: 'Acme Markets' },
  { id: 'store-514', name: 'Baltimore Inner Harbor', size: 'large', subBrandId: 'subbrand-acme-md', subBrandName: 'Acme Maryland', brandId: 'brand-acme', brandName: 'Acme Markets' },
  { id: 'store-515', name: 'Towson', size: 'medium', subBrandId: 'subbrand-acme-md', subBrandName: 'Acme Maryland', brandId: 'brand-acme', brandName: 'Acme Markets' },

  // Shaw's stores
  { id: 'store-601', name: 'Boston Back Bay', size: 'large', subBrandId: 'subbrand-shaws-boston-city', subBrandName: "Shaw's Boston City", brandId: 'brand-shaws', brandName: "Shaw's" },
  { id: 'store-602', name: 'South End', size: 'medium', subBrandId: 'subbrand-shaws-boston-city', subBrandName: "Shaw's Boston City", brandId: 'brand-shaws', brandName: "Shaw's" },
  { id: 'store-603', name: 'Beacon Hill', size: 'small', subBrandId: 'subbrand-shaws-boston-city', subBrandName: "Shaw's Boston City", brandId: 'brand-shaws', brandName: "Shaw's" },
  { id: 'store-604', name: 'Cambridge Central', size: 'large', subBrandId: 'subbrand-shaws-cambridge', subBrandName: "Shaw's Cambridge", brandId: 'brand-shaws', brandName: "Shaw's" },
  { id: 'store-605', name: 'Porter Square', size: 'medium', subBrandId: 'subbrand-shaws-cambridge', subBrandName: "Shaw's Cambridge", brandId: 'brand-shaws', brandName: "Shaw's" },
  { id: 'store-606', name: 'Salem', size: 'medium', subBrandId: 'subbrand-shaws-northshore', subBrandName: "Shaw's North Shore", brandId: 'brand-shaws', brandName: "Shaw's" },
  { id: 'store-607', name: 'Beverly', size: 'medium', subBrandId: 'subbrand-shaws-northshore', subBrandName: "Shaw's North Shore", brandId: 'brand-shaws', brandName: "Shaw's" },
  { id: 'store-608', name: 'Peabody', size: 'large', subBrandId: 'subbrand-shaws-northshore', subBrandName: "Shaw's North Shore", brandId: 'brand-shaws', brandName: "Shaw's" },
  { id: 'store-609', name: 'Braintree', size: 'large', subBrandId: 'subbrand-shaws-southshore', subBrandName: "Shaw's South Shore", brandId: 'brand-shaws', brandName: "Shaw's" },
  { id: 'store-610', name: 'Quincy', size: 'medium', subBrandId: 'subbrand-shaws-southshore', subBrandName: "Shaw's South Shore", brandId: 'brand-shaws', brandName: "Shaw's" },
  { id: 'store-611', name: 'Providence', size: 'large', subBrandId: 'subbrand-shaws-ri', subBrandName: "Shaw's Rhode Island", brandId: 'brand-shaws', brandName: "Shaw's" },
  { id: 'store-612', name: 'Warwick', size: 'medium', subBrandId: 'subbrand-shaws-ri', subBrandName: "Shaw's Rhode Island", brandId: 'brand-shaws', brandName: "Shaw's" },
  { id: 'store-613', name: 'Cranston', size: 'medium', subBrandId: 'subbrand-shaws-ri', subBrandName: "Shaw's Rhode Island", brandId: 'brand-shaws', brandName: "Shaw's" },
  { id: 'store-614', name: 'Hartford', size: 'medium', subBrandId: 'subbrand-shaws-ct', subBrandName: "Shaw's Connecticut", brandId: 'brand-shaws', brandName: "Shaw's" },
  { id: 'store-615', name: 'New Haven', size: 'large', subBrandId: 'subbrand-shaws-ct', subBrandName: "Shaw's Connecticut", brandId: 'brand-shaws', brandName: "Shaw's" },
  { id: 'store-616', name: 'Stamford', size: 'large', subBrandId: 'subbrand-shaws-ct', subBrandName: "Shaw's Connecticut", brandId: 'brand-shaws', brandName: "Shaw's" }
];

// 75 promotions across 8 categories (~9-10 per category)
// isParent: true for parent promotions that have child variants
// parentId: reference to parent promotion id for child cards (EPC roll-up)
const promotions = [
  // Produce (10) - Strawberries Family is a parent with 3 variants
  { id: 0, category: 'Produce', title: 'Organic Bananas', unit: 'lb', originalPrice: 0.79, dealType: 'Fixed Price' },
  { id: 1, category: 'Produce', title: 'Red Seedless Grapes', unit: 'lb', originalPrice: 3.99, dealType: '# / Price' },
  { id: 2, category: 'Produce', title: 'Hass Avocados', unit: 'each', originalPrice: 1.99, dealType: '# for Price' },
  { id: 3, category: 'Produce', title: 'Roma Tomatoes', unit: 'lb', originalPrice: 2.49, dealType: 'Amount Off' },
  { id: 4, category: 'Produce', title: 'Baby Spinach', unit: '5 oz', originalPrice: 4.99, dealType: 'Fixed Price' },
  { id: 5, category: 'Produce', title: 'Strawberries Family', unit: '16 oz', originalPrice: 4.99, dealType: '# for Price', isParent: true },
  { id: 100, category: 'Produce', title: 'Strawberries 16oz', unit: '16 oz', originalPrice: 4.99, dealType: '# for Price', parentId: 5 },
  { id: 101, category: 'Produce', title: 'Strawberries 32oz', unit: '32 oz', originalPrice: 7.99, dealType: '# for Price', parentId: 5 },
  { id: 102, category: 'Produce', title: 'Organic Strawberries', unit: '16 oz', originalPrice: 6.99, dealType: '# for Price', parentId: 5 },
  { id: 6, category: 'Produce', title: 'Cantaloupe', unit: 'each', originalPrice: 3.49, dealType: 'Amount Off' },
  { id: 7, category: 'Produce', title: 'Mushrooms', unit: '8 oz', originalPrice: 2.49, dealType: '# / Price' },
  { id: 8, category: 'Produce', title: 'Green Bell Peppers', unit: 'each', originalPrice: 1.29, dealType: 'Fixed Price' },
  { id: 9, category: 'Produce', title: 'Russet Potatoes', unit: '5 lb bag', originalPrice: 4.99, dealType: 'Amount Off' },

  // Meat (10) - Ribeye Steak Family is a parent with 4 variants
  { id: 10, category: 'Meat', title: 'Ribeye Steak Family', unit: 'lb', originalPrice: 14.99, dealType: '# / Price', isParent: true },
  { id: 103, category: 'Meat', title: 'Bone-In Ribeye 8oz', unit: '8 oz', originalPrice: 12.99, dealType: '# / Price', parentId: 10 },
  { id: 104, category: 'Meat', title: 'Bone-In Ribeye 12oz', unit: '12 oz', originalPrice: 16.99, dealType: '# / Price', parentId: 10 },
  { id: 105, category: 'Meat', title: 'Boneless Ribeye 10oz', unit: '10 oz', originalPrice: 14.99, dealType: '# / Price', parentId: 10 },
  { id: 106, category: 'Meat', title: 'Prime Ribeye 16oz', unit: '16 oz', originalPrice: 24.99, dealType: '# / Price', parentId: 10 },
  { id: 11, category: 'Meat', title: 'Ground Beef 80/20', unit: 'lb', originalPrice: 5.99, dealType: 'Fixed Price' },
  { id: 12, category: 'Meat', title: 'Chicken Breast Family', unit: 'lb', originalPrice: 4.99, dealType: '# for Price', isParent: true },
  { id: 107, category: 'Meat', title: 'Boneless Chicken Breast', unit: 'lb', originalPrice: 4.99, dealType: '# for Price', parentId: 12 },
  { id: 108, category: 'Meat', title: 'Organic Chicken Breast', unit: 'lb', originalPrice: 7.99, dealType: '# for Price', parentId: 12 },
  { id: 13, category: 'Meat', title: 'Pork Tenderloin', unit: 'lb', originalPrice: 6.99, dealType: 'Amount Off' },
  { id: 14, category: 'Meat', title: 'Italian Sausage Links', unit: '16 oz', originalPrice: 5.49, dealType: 'Fixed Price' },
  { id: 15, category: 'Meat', title: 'Whole Rotisserie Chicken', unit: 'each', originalPrice: 7.99, dealType: '# / Price' },
  { id: 16, category: 'Meat', title: 'Bone-In Pork Chops', unit: 'lb', originalPrice: 3.99, dealType: '# / Price' },
  { id: 17, category: 'Meat', title: 'Bacon', unit: '16 oz', originalPrice: 7.99, dealType: 'Amount Off' },
  { id: 18, category: 'Meat', title: 'Ground Turkey', unit: 'lb', originalPrice: 5.99, dealType: 'Fixed Price' },
  { id: 19, category: 'Meat', title: 'Atlantic Salmon Fillet', unit: 'lb', originalPrice: 12.99, dealType: '# / Price' },

  // Dairy (9) - Greek Yogurt Family is a parent with 3 variants
  { id: 20, category: 'Dairy', title: 'Large Eggs', unit: 'dozen', originalPrice: 3.99, dealType: 'Fixed Price' },
  { id: 21, category: 'Dairy', title: 'Whole Milk', unit: 'gallon', originalPrice: 4.49, dealType: '# for Price' },
  { id: 22, category: 'Dairy', title: 'Greek Yogurt Family', unit: '5.3 oz', originalPrice: 1.49, dealType: '# for Price', isParent: true },
  { id: 109, category: 'Dairy', title: 'Greek Yogurt Vanilla', unit: '5.3 oz', originalPrice: 1.49, dealType: '# for Price', parentId: 22 },
  { id: 110, category: 'Dairy', title: 'Greek Yogurt Strawberry', unit: '5.3 oz', originalPrice: 1.49, dealType: '# for Price', parentId: 22 },
  { id: 111, category: 'Dairy', title: 'Greek Yogurt Plain', unit: '5.3 oz', originalPrice: 1.29, dealType: '# for Price', parentId: 22 },
  { id: 23, category: 'Dairy', title: 'Butter', unit: '16 oz', originalPrice: 5.49, dealType: 'Amount Off' },
  { id: 24, category: 'Dairy', title: 'Shredded Cheddar', unit: '8 oz', originalPrice: 3.99, dealType: 'Fixed Price' },
  { id: 25, category: 'Dairy', title: 'Cream Cheese', unit: '8 oz', originalPrice: 2.99, dealType: '# / Price' },
  { id: 26, category: 'Dairy', title: 'Laughing Cow Cheese Wedges', unit: '6 oz', originalPrice: 4.49, dealType: 'Fixed Price' },
  { id: 27, category: 'Dairy', title: 'Sour Cream', unit: '16 oz', originalPrice: 2.79, dealType: 'Amount Off' },
  { id: 28, category: 'Dairy', title: 'Cottage Cheese', unit: '16 oz', originalPrice: 3.49, dealType: 'Fixed Price' },

  // Bakery (9)
  { id: 29, category: 'Bakery', title: 'Sourdough Bread', unit: 'loaf', originalPrice: 4.49, dealType: 'Fixed Price' },
  { id: 30, category: 'Bakery', title: 'Croissants', unit: '4 ct', originalPrice: 4.99, dealType: '# for Price' },
  { id: 31, category: 'Bakery', title: 'Bagels', unit: '6 ct', originalPrice: 3.99, dealType: 'Amount Off' },
  { id: 32, category: 'Bakery', title: 'Chocolate Chip Cookies', unit: '12 ct', originalPrice: 5.99, dealType: 'Fixed Price' },
  { id: 33, category: 'Bakery', title: 'Dinner Rolls', unit: '12 ct', originalPrice: 3.49, dealType: '# / Price' },
  { id: 34, category: 'Bakery', title: 'Blueberry Muffins', unit: '4 ct', originalPrice: 4.49, dealType: 'Amount Off' },
  { id: 35, category: 'Bakery', title: 'French Baguette', unit: 'each', originalPrice: 2.99, dealType: 'Fixed Price' },
  { id: 36, category: 'Bakery', title: 'Cinnamon Rolls', unit: '6 ct', originalPrice: 5.49, dealType: '# for Price' },
  { id: 37, category: 'Bakery', title: 'Tortillas', unit: '10 ct', originalPrice: 3.29, dealType: 'Amount Off' },

  // Frozen (10)
  { id: 38, category: 'Frozen', title: 'Ice Cream', unit: '48 oz', originalPrice: 5.99, dealType: '# for Price' },
  { id: 39, category: 'Frozen', title: 'Frozen Pizza', unit: 'each', originalPrice: 7.99, dealType: 'Amount Off' },
  { id: 40, category: 'Frozen', title: 'Chicken Nuggets', unit: '32 oz', originalPrice: 9.99, dealType: 'Fixed Price' },
  { id: 41, category: 'Frozen', title: 'Frozen Vegetables', unit: '12 oz', originalPrice: 2.49, dealType: '# for Price' },
  { id: 42, category: 'Frozen', title: 'Waffles', unit: '10 ct', originalPrice: 3.99, dealType: 'Amount Off' },
  { id: 43, category: 'Frozen', title: 'Jimmy Dean Breakfast Sandwiches', unit: '4 ct', originalPrice: 6.49, dealType: 'Amount Off' },
  { id: 44, category: 'Frozen', title: 'Fish Sticks', unit: '24 ct', originalPrice: 8.99, dealType: 'Fixed Price' },
  { id: 45, category: 'Frozen', title: 'Frozen Berries', unit: '12 oz', originalPrice: 4.49, dealType: '# / Price' },
  { id: 46, category: 'Frozen', title: 'Frozen Burritos', unit: '8 ct', originalPrice: 6.99, dealType: 'Amount Off' },
  { id: 47, category: 'Frozen', title: 'Lean Cuisine', unit: 'each', originalPrice: 3.99, dealType: '# for Price' },

  // Beverages (9) - Coca-Cola Family is a parent with 3 variants
  { id: 48, category: 'Beverages', title: 'Coca-Cola Family', unit: '12 oz cans', originalPrice: 7.99, dealType: '# for Price', isParent: true },
  { id: 112, category: 'Beverages', title: 'Coca-Cola Classic 12pk', unit: '12 oz cans', originalPrice: 7.99, dealType: '# for Price', parentId: 48 },
  { id: 113, category: 'Beverages', title: 'Diet Coke 12pk', unit: '12 oz cans', originalPrice: 7.99, dealType: '# for Price', parentId: 48 },
  { id: 114, category: 'Beverages', title: 'Coke Zero 12pk', unit: '12 oz cans', originalPrice: 7.99, dealType: '# for Price', parentId: 48 },
  { id: 49, category: 'Beverages', title: 'Orange Juice', unit: '52 oz', originalPrice: 4.49, dealType: 'Amount Off' },
  { id: 50, category: 'Beverages', title: 'Coffee K-Cups', unit: '12 ct', originalPrice: 9.99, dealType: 'Fixed Price' },
  { id: 51, category: 'Beverages', title: 'Bottled Water', unit: '24 pk', originalPrice: 5.99, dealType: '# / Price' },
  { id: 52, category: 'Beverages', title: 'Gatorade', unit: '8 pk', originalPrice: 7.49, dealType: 'Amount Off' },
  { id: 53, category: 'Beverages', title: 'Apple Juice', unit: '64 oz', originalPrice: 3.99, dealType: 'Fixed Price' },
  { id: 54, category: 'Beverages', title: 'Sparkling Water', unit: '12 pk', originalPrice: 5.49, dealType: '# for Price' },
  { id: 55, category: 'Beverages', title: 'Almond Milk', unit: '64 oz', originalPrice: 4.29, dealType: 'Amount Off' },
  { id: 56, category: 'Beverages', title: 'Energy Drinks', unit: '4 pk', originalPrice: 8.99, dealType: 'Fixed Price' },

  // Snacks (9) - Lay's Potato Chips Family is a parent with 3 variants
  { id: 57, category: 'Snacks', title: "Lay's Chips Family", unit: '10 oz', originalPrice: 4.99, dealType: '# for Price', isParent: true },
  { id: 115, category: 'Snacks', title: "Lay's Classic", unit: '10 oz', originalPrice: 4.99, dealType: '# for Price', parentId: 57 },
  { id: 116, category: 'Snacks', title: "Lay's BBQ", unit: '10 oz', originalPrice: 4.99, dealType: '# for Price', parentId: 57 },
  { id: 117, category: 'Snacks', title: "Lay's Sour Cream & Onion", unit: '10 oz', originalPrice: 4.99, dealType: '# for Price', parentId: 57 },
  { id: 58, category: 'Snacks', title: 'Oreo Cookies', unit: '14 oz', originalPrice: 5.49, dealType: '# for Price' },
  { id: 59, category: 'Snacks', title: 'Chex Mix', unit: '8.75 oz', originalPrice: 3.99, dealType: '# for Price' },
  { id: 60, category: 'Snacks', title: 'Goldfish Crackers', unit: '6.6 oz', originalPrice: 2.99, dealType: 'Amount Off' },
  { id: 61, category: 'Snacks', title: 'Pretzels', unit: '16 oz', originalPrice: 3.49, dealType: 'Fixed Price' },
  { id: 62, category: 'Snacks', title: 'Trail Mix', unit: '10 oz', originalPrice: 5.99, dealType: 'Amount Off' },
  { id: 63, category: 'Snacks', title: 'Cheez-Its', unit: '12.4 oz', originalPrice: 4.49, dealType: '# / Price' },
  { id: 64, category: 'Snacks', title: 'Popcorn', unit: '3 pk', originalPrice: 4.29, dealType: 'Fixed Price' },
  { id: 65, category: 'Snacks', title: 'Granola Bars', unit: '6 ct', originalPrice: 3.99, dealType: 'Amount Off' },

  // Pantry (9)
  { id: 66, category: 'Pantry', title: 'Pasta', unit: '16 oz', originalPrice: 1.99, dealType: 'Fixed Price' },
  { id: 67, category: 'Pantry', title: 'Pasta Sauce', unit: '24 oz', originalPrice: 3.49, dealType: '# for Price' },
  { id: 68, category: 'Pantry', title: 'Canned Tomatoes', unit: '28 oz', originalPrice: 2.49, dealType: '# / Price' },
  { id: 69, category: 'Pantry', title: 'Chicken Broth', unit: '32 oz', originalPrice: 2.99, dealType: 'Amount Off' },
  { id: 70, category: 'Pantry', title: 'Rice', unit: '2 lb', originalPrice: 3.99, dealType: 'Fixed Price' },
  { id: 71, category: 'Pantry', title: 'Olive Oil', unit: '17 oz', originalPrice: 8.99, dealType: 'Amount Off' },
  { id: 72, category: 'Pantry', title: 'Cereal', unit: '12 oz', originalPrice: 4.49, dealType: '# for Price' },
  { id: 73, category: 'Pantry', title: 'Peanut Butter', unit: '16 oz', originalPrice: 3.99, dealType: 'Fixed Price' },
  { id: 74, category: 'Pantry', title: 'Canned Beans', unit: '15 oz', originalPrice: 1.49, dealType: '# / Price' }
];

// Seeded random number generator for reproducibility
function seededRandom(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Generate sale price based on original price
function generateSalePrice(originalPrice, seed) {
  const discountPercent = 0.2 + seededRandom(seed) * 0.35; // 20-55% off
  return Math.round((originalPrice * (1 - discountPercent)) * 100) / 100;
}

// Generate metrics based on store size and random variation
function generateMetrics(storeSize, seed) {
  const sizeMultiplier = { large: 1.3, medium: 1.0, small: 0.7 };
  const mult = sizeMultiplier[storeSize] || 1.0;

  const baseCiv = 50 + Math.floor(seededRandom(seed) * 250);
  const civ = Math.round(baseCiv * mult);
  const cc = Math.round(civ * (0.02 + seededRandom(seed + 1) * 0.10)); // 2-12% of views
  const atl = Math.round(civ * (0.00 + seededRandom(seed + 2) * 0.02)); // 0-2% of views

  // Weighted score fields for composite scoring
  const views = civ;
  const clicks = cc;
  const adds = atl;
  const viewsScore = views * 1;
  const clicksScore = clicks * 5;
  const addsScore = adds * 20;
  const compositeScore = viewsScore + clicksScore + addsScore;

  return { civ, cc, atl, views, clicks, adds, viewsScore, clicksScore, addsScore, compositeScore };
}

// Add days to a date string
function addDays(dateStr, days) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

/**
 * Generate daysRun and date range for a promotion
 * Distribution: 85% 7-day, 10% 3-day, 5% 1-day
 *
 * Week starts on Monday:
 * - 7-day: Mon-Sun (day 0 to day 6)
 * - 3-day weekend: Fri-Sun (day 4 to day 6)
 * - 3-day midweek: Wed-Fri (day 2 to day 4)
 * - 1-day Saturday: day 5
 * - 1-day Wednesday: day 2
 */
function generateDaysRun(weekStartDate, seed) {
  const rand = seededRandom(seed);

  let daysRun, startOffset, endOffset;

  if (rand < 0.85) {
    // 85% - Full week (7 days)
    daysRun = 7;
    startOffset = 0;
    endOffset = 6;
  } else if (rand < 0.95) {
    // 10% - 3-day promotion
    daysRun = 3;
    // Alternate between weekend (Fri-Sun) and midweek (Wed-Fri)
    if (seededRandom(seed + 100) < 0.6) {
      // 60% of 3-day are weekend
      startOffset = 4; // Friday
      endOffset = 6;   // Sunday
    } else {
      // 40% of 3-day are midweek
      startOffset = 2; // Wednesday
      endOffset = 4;   // Friday
    }
  } else {
    // 5% - 1-day promotion
    daysRun = 1;
    // Alternate between Saturday and Wednesday
    if (seededRandom(seed + 200) < 0.7) {
      // 70% of 1-day are Saturday
      startOffset = 5; // Saturday
      endOffset = 5;
    } else {
      // 30% of 1-day are Wednesday
      startOffset = 2; // Wednesday
      endOffset = 2;
    }
  }

  const startDate = addDays(weekStartDate, startOffset);
  const endDate = addDays(weekStartDate, endOffset);

  return { daysRun, startDate, endDate };
}

// Build parent-child relationship maps
function buildParentChildMaps() {
  const parentMap = {};  // parentId -> parent promo
  const childrenMap = {}; // parentId -> [child promos]

  promotions.forEach(promo => {
    if (promo.isParent) {
      parentMap[promo.id] = promo;
      childrenMap[promo.id] = [];
    }
  });

  promotions.forEach(promo => {
    if (promo.parentId !== undefined) {
      if (childrenMap[promo.parentId]) {
        childrenMap[promo.parentId].push(promo);
      }
    }
  });

  return { parentMap, childrenMap };
}

// Generate all records
function generateRecords() {
  const records = [];
  let seedCounter = 0;
  let recordIndex = 0;

  // Build parent-child maps for child count calculation
  const { parentMap, childrenMap } = buildParentChildMaps();

  for (const week of weeks) {
    for (const store of stores) {
      for (const promo of promotions) {
        seedCounter++;
        const seed = seedCounter;
        const metrics = generateMetrics(store.size, seed);
        const salePrice = generateSalePrice(promo.originalPrice, seed);
        const { daysRun, startDate, endDate } = generateDaysRun(week.startDate, seed);

        // Build parent promotion ID if this is a child
        const parentPromoId = promo.parentId !== undefined
          ? `promo-wk${week.num}-${promotions.find(p => p.id === promo.parentId)?.category.toLowerCase() || promo.category.toLowerCase()}-${promo.parentId}`
          : null;

        // Calculate child count for parent promotions
        const childCount = promo.isParent ? (childrenMap[promo.id]?.length || 0) : 0;

        records.push({
          id: `rec-${String(recordIndex++).padStart(5, '0')}`,
          storeId: store.id,
          storeName: store.name,
          storeSize: store.size,
          subBrandId: store.subBrandId,
          subBrandName: store.subBrandName,
          brandId: store.brandId,
          brandName: store.brandName,
          weekNum: week.num,
          weekLabel: week.label,
          weekStartDate: week.startDate,
          publicationId: `pub-${week.num}`,
          promotionId: `promo-wk${week.num}-${promo.category.toLowerCase()}-${promo.id}`,
          category: promo.category,
          title: promo.title,
          unit: promo.unit,
          originalPrice: promo.originalPrice,
          salePrice: salePrice,
          dealType: promo.dealType,
          daysRun: daysRun,
          startDate: startDate,
          endDate: endDate,
          originalPosition: promo.id + 1,  // Row position in base ad layout (1-based)
          // Parent-child relationship fields
          isParent: promo.isParent || false,
          parentPromoId: parentPromoId,
          childCount: childCount,
          civ: metrics.civ,
          cc: metrics.cc,
          atl: metrics.atl,
          views: metrics.views,
          clicks: metrics.clicks,
          adds: metrics.adds,
          viewsScore: metrics.viewsScore,
          clicksScore: metrics.clicksScore,
          addsScore: metrics.addsScore,
          compositeScore: metrics.compositeScore
        });
      }
    }
  }

  return records;
}

// Generate and output
const records = generateRecords();

// Calculate distribution stats
const sevenDay = records.filter(r => r.daysRun === 7).length;
const threeDay = records.filter(r => r.daysRun === 3).length;
const oneDay = records.filter(r => r.daysRun === 1).length;
const total = records.length;

// Parent-child stats
const parentCount = records.filter(r => r.isParent).length;
const childCount = records.filter(r => r.parentPromoId !== null).length;
const uniqueParents = [...new Set(records.filter(r => r.isParent).map(r => r.promotionId))].length;
const uniqueChildren = [...new Set(records.filter(r => r.parentPromoId !== null).map(r => r.promotionId))].length;

console.log(`/**
 * Promotion Records Data for Analytics Dashboard
 * Auto-generated for scaled mock data with days fields and parent-child relationships
 *
 * Generated: ${new Date().toISOString()}
 * Records: ${records.length}
 * Stores: ${stores.length}
 * Weeks: ${weeks.length}
 * Promotions: ${promotions.length}
 *
 * Days Distribution:
 * - 7-day: ${sevenDay} (${(sevenDay/total*100).toFixed(1)}%)
 * - 3-day: ${threeDay} (${(threeDay/total*100).toFixed(1)}%)
 * - 1-day: ${oneDay} (${(oneDay/total*100).toFixed(1)}%)
 *
 * Parent-Child Distribution (EPC Roll-up):
 * - Parent records: ${parentCount} (${uniqueParents} unique parent promotions)
 * - Child records: ${childCount} (${uniqueChildren} unique child promotions)
 *
 * Fields per record:
 * - id, storeId, storeName, storeSize
 * - subBrandId, subBrandName, brandId, brandName
 * - weekNum, weekLabel, weekStartDate, publicationId
 * - promotionId, category, title, unit
 * - originalPrice, salePrice, dealType
 * - daysRun, startDate, endDate
 * - originalPosition (row position in base ad layout, 1-75)
 * - isParent (true for parent promotions with variants)
 * - parentPromoId (reference to parent promotionId for child cards)
 * - childCount (number of child variants for parent promotions)
 * - civ, cc, atl (legacy metric names)
 * - views, clicks, adds (aliased metrics)
 * - viewsScore (views × 1), clicksScore (clicks × 5), addsScore (adds × 20)
 * - compositeScore (sum of weighted scores)
 *
 * This file provides atomic promotion data (store × week × promotion).
 * Include this BEFORE mock-data.js to automatically load the data.
 */

// Global variable for browser use
window.promotionRecordsData = ${JSON.stringify(records, null, 2)};
`);
