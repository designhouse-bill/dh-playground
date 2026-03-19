/**
 * Mock Entity Data - Brands, Sub-brands and Stores Hierarchy
 * Supports: Brand → Sub-brand → Store drill-down
 *
 * Stats: 6 brands, 36 sub-brands, 95 stores
 * Generated: 2025-12-14
 */

const MockEntities = {
  // Brand level (top) - All stores aggregate
  brand: {
    id: 'brand-all',
    name: 'All Stores',
    level: 'brand',
    storeCount: 95,
    subBrandCount: 36
  },

  // All brands
  brands: [
    { id: 'brand-safeway', name: 'Safeway', level: 'brand', storeCount: 16, subBrandCount: 6 },
    { id: 'brand-vons', name: 'Vons', level: 'brand', storeCount: 16, subBrandCount: 6 },
    { id: 'brand-albertsons', name: 'Albertsons', level: 'brand', storeCount: 16, subBrandCount: 6 },
    { id: 'brand-jewelosco', name: 'Jewel-Osco', level: 'brand', storeCount: 16, subBrandCount: 6 },
    { id: 'brand-acme', name: 'Acme Markets', level: 'brand', storeCount: 15, subBrandCount: 6 },
    { id: 'brand-shaws', name: "Shaw's", level: 'brand', storeCount: 16, subBrandCount: 6 }
  ],

  // Sub-brands
  subBrands: [
    // Safeway sub-brands
    { id: 'subbrand-safeway-norcal-north', name: 'Safeway NorCal North', level: 'sub-brand', brandId: 'brand-safeway', storeCount: 3, stores: ['store-101', 'store-102', 'store-103'] },
    { id: 'subbrand-safeway-norcal-east', name: 'Safeway NorCal East', level: 'sub-brand', brandId: 'brand-safeway', storeCount: 3, stores: ['store-104', 'store-105', 'store-106'] },
    { id: 'subbrand-safeway-norcal-south', name: 'Safeway NorCal South', level: 'sub-brand', brandId: 'brand-safeway', storeCount: 2, stores: ['store-107', 'store-108'] },
    { id: 'subbrand-safeway-eastbay', name: 'Safeway East Bay', level: 'sub-brand', brandId: 'brand-safeway', storeCount: 3, stores: ['store-109', 'store-110', 'store-111'] },
    { id: 'subbrand-safeway-peninsula', name: 'Safeway Peninsula', level: 'sub-brand', brandId: 'brand-safeway', storeCount: 3, stores: ['store-112', 'store-113', 'store-114'] },
    { id: 'subbrand-safeway-marin', name: 'Safeway Marin', level: 'sub-brand', brandId: 'brand-safeway', storeCount: 2, stores: ['store-115', 'store-116'] },

    // Vons sub-brands
    { id: 'subbrand-vons-la-central', name: 'Vons LA Central', level: 'sub-brand', brandId: 'brand-vons', storeCount: 3, stores: ['store-201', 'store-202', 'store-203'] },
    { id: 'subbrand-vons-la-west', name: 'Vons LA West', level: 'sub-brand', brandId: 'brand-vons', storeCount: 3, stores: ['store-204', 'store-205', 'store-206'] },
    { id: 'subbrand-vons-la-east', name: 'Vons LA East', level: 'sub-brand', brandId: 'brand-vons', storeCount: 2, stores: ['store-207', 'store-208'] },
    { id: 'subbrand-vons-sd-north', name: 'Vons San Diego North', level: 'sub-brand', brandId: 'brand-vons', storeCount: 3, stores: ['store-209', 'store-210', 'store-211'] },
    { id: 'subbrand-vons-sd-south', name: 'Vons San Diego South', level: 'sub-brand', brandId: 'brand-vons', storeCount: 2, stores: ['store-212', 'store-213'] },
    { id: 'subbrand-vons-oc', name: 'Vons Orange County', level: 'sub-brand', brandId: 'brand-vons', storeCount: 3, stores: ['store-214', 'store-215', 'store-216'] },

    // Albertsons sub-brands
    { id: 'subbrand-albertsons-sac', name: 'Albertsons Sacramento', level: 'sub-brand', brandId: 'brand-albertsons', storeCount: 3, stores: ['store-301', 'store-302', 'store-303'] },
    { id: 'subbrand-albertsons-central', name: 'Albertsons Central Valley', level: 'sub-brand', brandId: 'brand-albertsons', storeCount: 2, stores: ['store-304', 'store-305'] },
    { id: 'subbrand-albertsons-portland', name: 'Albertsons Portland', level: 'sub-brand', brandId: 'brand-albertsons', storeCount: 3, stores: ['store-306', 'store-307', 'store-308'] },
    { id: 'subbrand-albertsons-seattle', name: 'Albertsons Seattle', level: 'sub-brand', brandId: 'brand-albertsons', storeCount: 3, stores: ['store-309', 'store-310', 'store-311'] },
    { id: 'subbrand-albertsons-tacoma', name: 'Albertsons Tacoma', level: 'sub-brand', brandId: 'brand-albertsons', storeCount: 2, stores: ['store-312', 'store-313'] },
    { id: 'subbrand-albertsons-spokane', name: 'Albertsons Spokane', level: 'sub-brand', brandId: 'brand-albertsons', storeCount: 3, stores: ['store-314', 'store-315', 'store-316'] },

    // Jewel-Osco sub-brands
    { id: 'subbrand-jewelosco-chicago-north', name: 'Jewel-Osco Chicago North', level: 'sub-brand', brandId: 'brand-jewelosco', storeCount: 3, stores: ['store-401', 'store-402', 'store-403'] },
    { id: 'subbrand-jewelosco-chicago-south', name: 'Jewel-Osco Chicago South', level: 'sub-brand', brandId: 'brand-jewelosco', storeCount: 2, stores: ['store-404', 'store-405'] },
    { id: 'subbrand-jewelosco-northshore', name: 'Jewel-Osco North Shore', level: 'sub-brand', brandId: 'brand-jewelosco', storeCount: 3, stores: ['store-406', 'store-407', 'store-408'] },
    { id: 'subbrand-jewelosco-westburbs', name: 'Jewel-Osco Western Suburbs', level: 'sub-brand', brandId: 'brand-jewelosco', storeCount: 3, stores: ['store-409', 'store-410', 'store-411'] },
    { id: 'subbrand-jewelosco-nwburbs', name: 'Jewel-Osco NW Suburbs', level: 'sub-brand', brandId: 'brand-jewelosco', storeCount: 2, stores: ['store-412', 'store-413'] },
    { id: 'subbrand-jewelosco-swburbs', name: 'Jewel-Osco SW Suburbs', level: 'sub-brand', brandId: 'brand-jewelosco', storeCount: 3, stores: ['store-414', 'store-415', 'store-416'] },

    // Acme Markets sub-brands
    { id: 'subbrand-acme-philly-center', name: 'Acme Philadelphia Center', level: 'sub-brand', brandId: 'brand-acme', storeCount: 3, stores: ['store-501', 'store-502', 'store-503'] },
    { id: 'subbrand-acme-philly-northwest', name: 'Acme Philadelphia NW', level: 'sub-brand', brandId: 'brand-acme', storeCount: 2, stores: ['store-504', 'store-505'] },
    { id: 'subbrand-acme-nj-south', name: 'Acme NJ South', level: 'sub-brand', brandId: 'brand-acme', storeCount: 3, stores: ['store-506', 'store-507', 'store-508'] },
    { id: 'subbrand-acme-nj-central', name: 'Acme NJ Central', level: 'sub-brand', brandId: 'brand-acme', storeCount: 2, stores: ['store-509', 'store-510'] },
    { id: 'subbrand-acme-de', name: 'Acme Delaware', level: 'sub-brand', brandId: 'brand-acme', storeCount: 3, stores: ['store-511', 'store-512', 'store-513'] },
    { id: 'subbrand-acme-md', name: 'Acme Maryland', level: 'sub-brand', brandId: 'brand-acme', storeCount: 2, stores: ['store-514', 'store-515'] },

    // Shaw's sub-brands
    { id: 'subbrand-shaws-boston-city', name: "Shaw's Boston City", level: 'sub-brand', brandId: 'brand-shaws', storeCount: 3, stores: ['store-601', 'store-602', 'store-603'] },
    { id: 'subbrand-shaws-cambridge', name: "Shaw's Cambridge", level: 'sub-brand', brandId: 'brand-shaws', storeCount: 2, stores: ['store-604', 'store-605'] },
    { id: 'subbrand-shaws-northshore', name: "Shaw's North Shore", level: 'sub-brand', brandId: 'brand-shaws', storeCount: 3, stores: ['store-606', 'store-607', 'store-608'] },
    { id: 'subbrand-shaws-southshore', name: "Shaw's South Shore", level: 'sub-brand', brandId: 'brand-shaws', storeCount: 2, stores: ['store-609', 'store-610'] },
    { id: 'subbrand-shaws-ri', name: "Shaw's Rhode Island", level: 'sub-brand', brandId: 'brand-shaws', storeCount: 3, stores: ['store-611', 'store-612', 'store-613'] },
    { id: 'subbrand-shaws-ct', name: "Shaw's Connecticut", level: 'sub-brand', brandId: 'brand-shaws', storeCount: 3, stores: ['store-614', 'store-615', 'store-616'] }
  ],

  // All stores with full details
  stores: [
    // Safeway NorCal North
    { id: 'store-101', name: 'SF Market St', title: 'SF Market St', subBrand: 'subbrand-safeway-norcal-north', brandId: 'brand-safeway', address: '2020 Market St, San Francisco, CA 94114', size: 'large', storeNumber: 101 },
    { id: 'store-102', name: 'SF Mission', title: 'SF Mission', subBrand: 'subbrand-safeway-norcal-north', brandId: 'brand-safeway', address: '4950 Mission St, San Francisco, CA 94112', size: 'medium', storeNumber: 102 },
    { id: 'store-103', name: 'SF Sunset', title: 'SF Sunset', subBrand: 'subbrand-safeway-norcal-north', brandId: 'brand-safeway', address: '730 Taraval St, San Francisco, CA 94116', size: 'medium', storeNumber: 103 },
    // Safeway NorCal East
    { id: 'store-104', name: 'Oakland Downtown', title: 'Oakland Downtown', subBrand: 'subbrand-safeway-norcal-east', brandId: 'brand-safeway', address: '1500 Broadway, Oakland, CA 94612', size: 'large', storeNumber: 104 },
    { id: 'store-105', name: 'Berkeley', title: 'Berkeley', subBrand: 'subbrand-safeway-norcal-east', brandId: 'brand-safeway', address: '1550 Shattuck Ave, Berkeley, CA 94709', size: 'medium', storeNumber: 105 },
    { id: 'store-106', name: 'Emeryville', title: 'Emeryville', subBrand: 'subbrand-safeway-norcal-east', brandId: 'brand-safeway', address: '3950 Horton St, Emeryville, CA 94608', size: 'small', storeNumber: 106 },
    // Safeway NorCal South
    { id: 'store-107', name: 'San Jose Downtown', title: 'San Jose Downtown', subBrand: 'subbrand-safeway-norcal-south', brandId: 'brand-safeway', address: '298 S 1st St, San Jose, CA 95113', size: 'large', storeNumber: 107 },
    { id: 'store-108', name: 'Palo Alto', title: 'Palo Alto', subBrand: 'subbrand-safeway-norcal-south', brandId: 'brand-safeway', address: '4080 El Camino Real, Palo Alto, CA 94306', size: 'medium', storeNumber: 108 },
    // Safeway East Bay
    { id: 'store-109', name: 'Walnut Creek', title: 'Walnut Creek', subBrand: 'subbrand-safeway-eastbay', brandId: 'brand-safeway', address: '1350 N California Blvd, Walnut Creek, CA 94596', size: 'large', storeNumber: 109 },
    { id: 'store-110', name: 'Concord', title: 'Concord', subBrand: 'subbrand-safeway-eastbay', brandId: 'brand-safeway', address: '785 Oak Grove Rd, Concord, CA 94518', size: 'medium', storeNumber: 110 },
    { id: 'store-111', name: 'Pleasant Hill', title: 'Pleasant Hill', subBrand: 'subbrand-safeway-eastbay', brandId: 'brand-safeway', address: '560 Contra Costa Blvd, Pleasant Hill, CA 94523', size: 'medium', storeNumber: 111 },
    // Safeway Peninsula
    { id: 'store-112', name: 'Daly City', title: 'Daly City', subBrand: 'subbrand-safeway-peninsula', brandId: 'brand-safeway', address: '133 Serramonte Center, Daly City, CA 94015', size: 'medium', storeNumber: 112 },
    { id: 'store-113', name: 'San Mateo', title: 'San Mateo', subBrand: 'subbrand-safeway-peninsula', brandId: 'brand-safeway', address: '1850 S Norfolk St, San Mateo, CA 94403', size: 'large', storeNumber: 113 },
    { id: 'store-114', name: 'Redwood City', title: 'Redwood City', subBrand: 'subbrand-safeway-peninsula', brandId: 'brand-safeway', address: '1001 El Camino Real, Redwood City, CA 94063', size: 'medium', storeNumber: 114 },
    // Safeway Marin
    { id: 'store-115', name: 'San Rafael', title: 'San Rafael', subBrand: 'subbrand-safeway-marin', brandId: 'brand-safeway', address: '800 Northgate Mall, San Rafael, CA 94903', size: 'large', storeNumber: 115 },
    { id: 'store-116', name: 'Mill Valley', title: 'Mill Valley', subBrand: 'subbrand-safeway-marin', brandId: 'brand-safeway', address: '200 Shoreline Hwy, Mill Valley, CA 94941', size: 'small', storeNumber: 116 },

    // Vons LA Central
    { id: 'store-201', name: 'LA Downtown', title: 'LA Downtown', subBrand: 'subbrand-vons-la-central', brandId: 'brand-vons', address: '645 W 9th St, Los Angeles, CA 90015', size: 'large', storeNumber: 201 },
    { id: 'store-202', name: 'Hollywood', title: 'Hollywood', subBrand: 'subbrand-vons-la-central', brandId: 'brand-vons', address: '5510 W Sunset Blvd, Hollywood, CA 90028', size: 'medium', storeNumber: 202 },
    { id: 'store-203', name: 'Koreatown', title: 'Koreatown', subBrand: 'subbrand-vons-la-central', brandId: 'brand-vons', address: '2770 W Olympic Blvd, Los Angeles, CA 90006', size: 'medium', storeNumber: 203 },
    // Vons LA West
    { id: 'store-204', name: 'Santa Monica', title: 'Santa Monica', subBrand: 'subbrand-vons-la-west', brandId: 'brand-vons', address: '1311 Wilshire Blvd, Santa Monica, CA 90403', size: 'large', storeNumber: 204 },
    { id: 'store-205', name: 'Venice', title: 'Venice', subBrand: 'subbrand-vons-la-west', brandId: 'brand-vons', address: '730 Rose Ave, Venice, CA 90291', size: 'medium', storeNumber: 205 },
    { id: 'store-206', name: 'Culver City', title: 'Culver City', subBrand: 'subbrand-vons-la-west', brandId: 'brand-vons', address: '5500 Sepulveda Blvd, Culver City, CA 90230', size: 'medium', storeNumber: 206 },
    // Vons LA East
    { id: 'store-207', name: 'Pasadena', title: 'Pasadena', subBrand: 'subbrand-vons-la-east', brandId: 'brand-vons', address: '2355 E Colorado Blvd, Pasadena, CA 91107', size: 'large', storeNumber: 207 },
    { id: 'store-208', name: 'Glendale', title: 'Glendale', subBrand: 'subbrand-vons-la-east', brandId: 'brand-vons', address: '220 N Brand Blvd, Glendale, CA 91203', size: 'medium', storeNumber: 208 },
    // Vons San Diego North
    { id: 'store-209', name: 'SD Gaslamp', title: 'SD Gaslamp', subBrand: 'subbrand-vons-sd-north', brandId: 'brand-vons', address: '643 5th Ave, San Diego, CA 92101', size: 'medium', storeNumber: 209 },
    { id: 'store-210', name: 'La Jolla', title: 'La Jolla', subBrand: 'subbrand-vons-sd-north', brandId: 'brand-vons', address: '7544 Girard Ave, La Jolla, CA 92037', size: 'large', storeNumber: 210 },
    { id: 'store-211', name: 'Del Mar', title: 'Del Mar', subBrand: 'subbrand-vons-sd-north', brandId: 'brand-vons', address: '2750 Via De La Valle, Del Mar, CA 92014', size: 'small', storeNumber: 211 },
    // Vons San Diego South
    { id: 'store-212', name: 'Chula Vista', title: 'Chula Vista', subBrand: 'subbrand-vons-sd-south', brandId: 'brand-vons', address: '1260 3rd Ave, Chula Vista, CA 91911', size: 'medium', storeNumber: 212 },
    { id: 'store-213', name: 'National City', title: 'National City', subBrand: 'subbrand-vons-sd-south', brandId: 'brand-vons', address: '1201 S Highland Ave, National City, CA 91950', size: 'medium', storeNumber: 213 },
    // Vons Orange County
    { id: 'store-214', name: 'Irvine', title: 'Irvine', subBrand: 'subbrand-vons-oc', brandId: 'brand-vons', address: '4255 Campus Dr, Irvine, CA 92612', size: 'large', storeNumber: 214 },
    { id: 'store-215', name: 'Newport Beach', title: 'Newport Beach', subBrand: 'subbrand-vons-oc', brandId: 'brand-vons', address: '1600 E Coast Hwy, Newport Beach, CA 92660', size: 'medium', storeNumber: 215 },
    { id: 'store-216', name: 'Anaheim', title: 'Anaheim', subBrand: 'subbrand-vons-oc', brandId: 'brand-vons', address: '900 S Harbor Blvd, Anaheim, CA 92805', size: 'large', storeNumber: 216 },

    // Albertsons Sacramento
    { id: 'store-301', name: 'Sacramento Downtown', title: 'Sacramento Downtown', subBrand: 'subbrand-albertsons-sac', brandId: 'brand-albertsons', address: '1725 Arden Way, Sacramento, CA 95815', size: 'large', storeNumber: 301 },
    { id: 'store-302', name: 'Elk Grove', title: 'Elk Grove', subBrand: 'subbrand-albertsons-sac', brandId: 'brand-albertsons', address: '8901 Elk Grove Blvd, Elk Grove, CA 95624', size: 'medium', storeNumber: 302 },
    { id: 'store-303', name: 'Roseville', title: 'Roseville', subBrand: 'subbrand-albertsons-sac', brandId: 'brand-albertsons', address: '10333 Fairway Dr, Roseville, CA 95678', size: 'medium', storeNumber: 303 },
    // Albertsons Central Valley
    { id: 'store-304', name: 'Fresno', title: 'Fresno', subBrand: 'subbrand-albertsons-central', brandId: 'brand-albertsons', address: '7155 N Cedar Ave, Fresno, CA 93720', size: 'large', storeNumber: 304 },
    { id: 'store-305', name: 'Stockton', title: 'Stockton', subBrand: 'subbrand-albertsons-central', brandId: 'brand-albertsons', address: '6521 Pacific Ave, Stockton, CA 95207', size: 'medium', storeNumber: 305 },
    // Albertsons Portland
    { id: 'store-306', name: 'Portland Downtown', title: 'Portland Downtown', subBrand: 'subbrand-albertsons-portland', brandId: 'brand-albertsons', address: '4828 SE Hawthorne Blvd, Portland, OR 97215', size: 'large', storeNumber: 306 },
    { id: 'store-307', name: 'Beaverton', title: 'Beaverton', subBrand: 'subbrand-albertsons-portland', brandId: 'brand-albertsons', address: '3550 SW Cedar Hills Blvd, Beaverton, OR 97005', size: 'medium', storeNumber: 307 },
    { id: 'store-308', name: 'Lake Oswego', title: 'Lake Oswego', subBrand: 'subbrand-albertsons-portland', brandId: 'brand-albertsons', address: '15391 SW Bangy Rd, Lake Oswego, OR 97035', size: 'small', storeNumber: 308 },
    // Albertsons Seattle
    { id: 'store-309', name: 'Seattle Ballard', title: 'Seattle Ballard', subBrand: 'subbrand-albertsons-seattle', brandId: 'brand-albertsons', address: '2550 32nd Ave W, Seattle, WA 98199', size: 'large', storeNumber: 309 },
    { id: 'store-310', name: 'Bellevue', title: 'Bellevue', subBrand: 'subbrand-albertsons-seattle', brandId: 'brand-albertsons', address: '15100 SE 38th St, Bellevue, WA 98006', size: 'large', storeNumber: 310 },
    { id: 'store-311', name: 'Kirkland', title: 'Kirkland', subBrand: 'subbrand-albertsons-seattle', brandId: 'brand-albertsons', address: '10116 NE 8th St, Kirkland, WA 98034', size: 'medium', storeNumber: 311 },
    // Albertsons Tacoma
    { id: 'store-312', name: 'Tacoma', title: 'Tacoma', subBrand: 'subbrand-albertsons-tacoma', brandId: 'brand-albertsons', address: '3520 S 23rd St, Tacoma, WA 98405', size: 'medium', storeNumber: 312 },
    { id: 'store-313', name: 'Olympia', title: 'Olympia', subBrand: 'subbrand-albertsons-tacoma', brandId: 'brand-albertsons', address: '625 Black Lake Blvd SW, Olympia, WA 98502', size: 'medium', storeNumber: 313 },
    // Albertsons Spokane
    { id: 'store-314', name: 'Spokane Downtown', title: 'Spokane Downtown', subBrand: 'subbrand-albertsons-spokane', brandId: 'brand-albertsons', address: '29 E Hawthorne Rd, Spokane, WA 99218', size: 'large', storeNumber: 314 },
    { id: 'store-315', name: 'Spokane Valley', title: 'Spokane Valley', subBrand: 'subbrand-albertsons-spokane', brandId: 'brand-albertsons', address: '15609 E Sprague Ave, Spokane Valley, WA 99037', size: 'medium', storeNumber: 315 },
    { id: 'store-316', name: "Coeur d'Alene", title: "Coeur d'Alene", subBrand: 'subbrand-albertsons-spokane', brandId: 'brand-albertsons', address: '101 W Kathleen Ave, Coeur d\'Alene, ID 83815', size: 'medium', storeNumber: 316 },

    // Jewel-Osco Chicago North
    { id: 'store-401', name: 'Chicago Loop', title: 'Chicago Loop', subBrand: 'subbrand-jewelosco-chicago-north', brandId: 'brand-jewelosco', address: '225 W Washington St, Chicago, IL 60606', size: 'large', storeNumber: 401 },
    { id: 'store-402', name: 'Lincoln Park', title: 'Lincoln Park', subBrand: 'subbrand-jewelosco-chicago-north', brandId: 'brand-jewelosco', address: '2550 N Clybourn Ave, Chicago, IL 60614', size: 'medium', storeNumber: 402 },
    { id: 'store-403', name: 'Lakeview', title: 'Lakeview', subBrand: 'subbrand-jewelosco-chicago-north', brandId: 'brand-jewelosco', address: '3531 N Broadway, Chicago, IL 60657', size: 'medium', storeNumber: 403 },
    // Jewel-Osco Chicago South
    { id: 'store-404', name: 'Hyde Park', title: 'Hyde Park', subBrand: 'subbrand-jewelosco-chicago-south', brandId: 'brand-jewelosco', address: '1504 E 55th St, Chicago, IL 60615', size: 'medium', storeNumber: 404 },
    { id: 'store-405', name: 'Bronzeville', title: 'Bronzeville', subBrand: 'subbrand-jewelosco-chicago-south', brandId: 'brand-jewelosco', address: '4355 S King Dr, Chicago, IL 60653', size: 'small', storeNumber: 405 },
    // Jewel-Osco North Shore
    { id: 'store-406', name: 'Evanston', title: 'Evanston', subBrand: 'subbrand-jewelosco-northshore', brandId: 'brand-jewelosco', address: '1128 Chicago Ave, Evanston, IL 60202', size: 'large', storeNumber: 406 },
    { id: 'store-407', name: 'Wilmette', title: 'Wilmette', subBrand: 'subbrand-jewelosco-northshore', brandId: 'brand-jewelosco', address: '3207 Lake Ave, Wilmette, IL 60091', size: 'medium', storeNumber: 407 },
    { id: 'store-408', name: 'Highland Park', title: 'Highland Park', subBrand: 'subbrand-jewelosco-northshore', brandId: 'brand-jewelosco', address: '1776 Skokie Valley Rd, Highland Park, IL 60035', size: 'medium', storeNumber: 408 },
    // Jewel-Osco Western Suburbs
    { id: 'store-409', name: 'Oak Park', title: 'Oak Park', subBrand: 'subbrand-jewelosco-westburbs', brandId: 'brand-jewelosco', address: '1155 Lake St, Oak Park, IL 60301', size: 'medium', storeNumber: 409 },
    { id: 'store-410', name: 'Naperville', title: 'Naperville', subBrand: 'subbrand-jewelosco-westburbs', brandId: 'brand-jewelosco', address: '2855 95th St, Naperville, IL 60564', size: 'large', storeNumber: 410 },
    { id: 'store-411', name: 'Aurora', title: 'Aurora', subBrand: 'subbrand-jewelosco-westburbs', brandId: 'brand-jewelosco', address: '1301 N Farnsworth Ave, Aurora, IL 60505', size: 'large', storeNumber: 411 },
    // Jewel-Osco NW Suburbs
    { id: 'store-412', name: 'Schaumburg', title: 'Schaumburg', subBrand: 'subbrand-jewelosco-nwburbs', brandId: 'brand-jewelosco', address: '1020 E Golf Rd, Schaumburg, IL 60173', size: 'large', storeNumber: 412 },
    { id: 'store-413', name: 'Arlington Heights', title: 'Arlington Heights', subBrand: 'subbrand-jewelosco-nwburbs', brandId: 'brand-jewelosco', address: '1860 S Arlington Heights Rd, Arlington Heights, IL 60005', size: 'medium', storeNumber: 413 },
    // Jewel-Osco SW Suburbs
    { id: 'store-414', name: 'Orland Park', title: 'Orland Park', subBrand: 'subbrand-jewelosco-swburbs', brandId: 'brand-jewelosco', address: '14150 S LaGrange Rd, Orland Park, IL 60462', size: 'large', storeNumber: 414 },
    { id: 'store-415', name: 'Tinley Park', title: 'Tinley Park', subBrand: 'subbrand-jewelosco-swburbs', brandId: 'brand-jewelosco', address: '17020 Harlem Ave, Tinley Park, IL 60477', size: 'medium', storeNumber: 415 },
    { id: 'store-416', name: 'Joliet', title: 'Joliet', subBrand: 'subbrand-jewelosco-swburbs', brandId: 'brand-jewelosco', address: '2391 Essington Rd, Joliet, IL 60435', size: 'medium', storeNumber: 416 },

    // Acme Philadelphia Center
    { id: 'store-501', name: 'Center City', title: 'Center City', subBrand: 'subbrand-acme-philly-center', brandId: 'brand-acme', address: '1500 Walnut St, Philadelphia, PA 19102', size: 'large', storeNumber: 501 },
    { id: 'store-502', name: 'University City', title: 'University City', subBrand: 'subbrand-acme-philly-center', brandId: 'brand-acme', address: '3401 Walnut St, Philadelphia, PA 19104', size: 'medium', storeNumber: 502 },
    { id: 'store-503', name: 'Northern Liberties', title: 'Northern Liberties', subBrand: 'subbrand-acme-philly-center', brandId: 'brand-acme', address: '1000 N Delaware Ave, Philadelphia, PA 19123', size: 'medium', storeNumber: 503 },
    // Acme Philadelphia NW
    { id: 'store-504', name: 'Manayunk', title: 'Manayunk', subBrand: 'subbrand-acme-philly-northwest', brandId: 'brand-acme', address: '4411 Main St, Philadelphia, PA 19127', size: 'medium', storeNumber: 504 },
    { id: 'store-505', name: 'Chestnut Hill', title: 'Chestnut Hill', subBrand: 'subbrand-acme-philly-northwest', brandId: 'brand-acme', address: '8200 Germantown Ave, Philadelphia, PA 19118', size: 'small', storeNumber: 505 },
    // Acme NJ South
    { id: 'store-506', name: 'Cherry Hill', title: 'Cherry Hill', subBrand: 'subbrand-acme-nj-south', brandId: 'brand-acme', address: '1900 Marlton Pike E, Cherry Hill, NJ 08003', size: 'large', storeNumber: 506 },
    { id: 'store-507', name: 'Voorhees', title: 'Voorhees', subBrand: 'subbrand-acme-nj-south', brandId: 'brand-acme', address: '700 Haddonfield Berlin Rd, Voorhees, NJ 08043', size: 'medium', storeNumber: 507 },
    { id: 'store-508', name: 'Marlton', title: 'Marlton', subBrand: 'subbrand-acme-nj-south', brandId: 'brand-acme', address: '180 NJ-73, Marlton, NJ 08053', size: 'medium', storeNumber: 508 },
    // Acme NJ Central
    { id: 'store-509', name: 'Princeton', title: 'Princeton', subBrand: 'subbrand-acme-nj-central', brandId: 'brand-acme', address: '301 N Harrison St, Princeton, NJ 08540', size: 'large', storeNumber: 509 },
    { id: 'store-510', name: 'Lawrenceville', title: 'Lawrenceville', subBrand: 'subbrand-acme-nj-central', brandId: 'brand-acme', address: '3456 US-1, Lawrenceville, NJ 08648', size: 'medium', storeNumber: 510 },
    // Acme Delaware
    { id: 'store-511', name: 'Wilmington', title: 'Wilmington', subBrand: 'subbrand-acme-de', brandId: 'brand-acme', address: '1600 Pennsylvania Ave, Wilmington, DE 19806', size: 'large', storeNumber: 511 },
    { id: 'store-512', name: 'Newark DE', title: 'Newark DE', subBrand: 'subbrand-acme-de', brandId: 'brand-acme', address: '100 Suburban Plaza, Newark, DE 19711', size: 'medium', storeNumber: 512 },
    { id: 'store-513', name: 'Dover', title: 'Dover', subBrand: 'subbrand-acme-de', brandId: 'brand-acme', address: '850 N DuPont Hwy, Dover, DE 19901', size: 'medium', storeNumber: 513 },
    // Acme Maryland
    { id: 'store-514', name: 'Baltimore Inner Harbor', title: 'Baltimore Inner Harbor', subBrand: 'subbrand-acme-md', brandId: 'brand-acme', address: '200 E Pratt St, Baltimore, MD 21202', size: 'large', storeNumber: 514 },
    { id: 'store-515', name: 'Towson', title: 'Towson', subBrand: 'subbrand-acme-md', brandId: 'brand-acme', address: '825 Goucher Blvd, Towson, MD 21286', size: 'medium', storeNumber: 515 },

    // Shaw's Boston City
    { id: 'store-601', name: 'Boston Back Bay', title: 'Boston Back Bay', subBrand: 'subbrand-shaws-boston-city', brandId: 'brand-shaws', address: '53 Huntington Ave, Boston, MA 02116', size: 'large', storeNumber: 601 },
    { id: 'store-602', name: 'South End', title: 'South End', subBrand: 'subbrand-shaws-boston-city', brandId: 'brand-shaws', address: '1065 Tremont St, Boston, MA 02120', size: 'medium', storeNumber: 602 },
    { id: 'store-603', name: 'Beacon Hill', title: 'Beacon Hill', subBrand: 'subbrand-shaws-boston-city', brandId: 'brand-shaws', address: '199 Cambridge St, Boston, MA 02114', size: 'small', storeNumber: 603 },
    // Shaw's Cambridge
    { id: 'store-604', name: 'Cambridge Central', title: 'Cambridge Central', subBrand: 'subbrand-shaws-cambridge', brandId: 'brand-shaws', address: '20 Sidney St, Cambridge, MA 02139', size: 'large', storeNumber: 604 },
    { id: 'store-605', name: 'Porter Square', title: 'Porter Square', subBrand: 'subbrand-shaws-cambridge', brandId: 'brand-shaws', address: '49 White St, Cambridge, MA 02140', size: 'medium', storeNumber: 605 },
    // Shaw's North Shore
    { id: 'store-606', name: 'Salem', title: 'Salem', subBrand: 'subbrand-shaws-northshore', brandId: 'brand-shaws', address: '450 Highland Ave, Salem, MA 01970', size: 'medium', storeNumber: 606 },
    { id: 'store-607', name: 'Beverly', title: 'Beverly', subBrand: 'subbrand-shaws-northshore', brandId: 'brand-shaws', address: '224 Elliott St, Beverly, MA 01915', size: 'medium', storeNumber: 607 },
    { id: 'store-608', name: 'Peabody', title: 'Peabody', subBrand: 'subbrand-shaws-northshore', brandId: 'brand-shaws', address: '17 Sylvan St, Peabody, MA 01960', size: 'large', storeNumber: 608 },
    // Shaw's South Shore
    { id: 'store-609', name: 'Braintree', title: 'Braintree', subBrand: 'subbrand-shaws-southshore', brandId: 'brand-shaws', address: '200 Grossman Dr, Braintree, MA 02184', size: 'large', storeNumber: 609 },
    { id: 'store-610', name: 'Quincy', title: 'Quincy', subBrand: 'subbrand-shaws-southshore', brandId: 'brand-shaws', address: '65 Newport Ave, Quincy, MA 02171', size: 'medium', storeNumber: 610 },
    // Shaw's Rhode Island
    { id: 'store-611', name: 'Providence', title: 'Providence', subBrand: 'subbrand-shaws-ri', brandId: 'brand-shaws', address: '261 Waterman St, Providence, RI 02906', size: 'large', storeNumber: 611 },
    { id: 'store-612', name: 'Warwick', title: 'Warwick', subBrand: 'subbrand-shaws-ri', brandId: 'brand-shaws', address: '1245 Bald Hill Rd, Warwick, RI 02886', size: 'medium', storeNumber: 612 },
    { id: 'store-613', name: 'Cranston', title: 'Cranston', subBrand: 'subbrand-shaws-ri', brandId: 'brand-shaws', address: '1000 Chapel View Blvd, Cranston, RI 02920', size: 'medium', storeNumber: 613 },
    // Shaw's Connecticut
    { id: 'store-614', name: 'Hartford', title: 'Hartford', subBrand: 'subbrand-shaws-ct', brandId: 'brand-shaws', address: '1489 New Britain Ave, West Hartford, CT 06110', size: 'medium', storeNumber: 614 },
    { id: 'store-615', name: 'New Haven', title: 'New Haven', subBrand: 'subbrand-shaws-ct', brandId: 'brand-shaws', address: '150 Whalley Ave, New Haven, CT 06511', size: 'large', storeNumber: 615 },
    { id: 'store-616', name: 'Stamford', title: 'Stamford', subBrand: 'subbrand-shaws-ct', brandId: 'brand-shaws', address: '2100 Bedford St, Stamford, CT 06905', size: 'large', storeNumber: 616 }
  ],

  // Custom groups (empty for now)
  groups: [],

  // Helper methods
  getBrandById(id) {
    if (id === 'brand-all') return this.brand;
    return this.brands.find(b => b.id === id);
  },

  getSubBrandById(id) {
    return this.subBrands.find(sb => sb.id === id);
  },

  getStoreById(id) {
    return this.stores.find(s => s.id === id);
  },

  getSubBrandsByBrand(brandId) {
    return this.subBrands.filter(sb => sb.brandId === brandId);
  },

  getStoresBySubBrand(subBrandId) {
    return this.stores.filter(s => s.subBrand === subBrandId);
  },

  getStoresByBrand(brandId) {
    return this.stores.filter(s => s.brandId === brandId);
  },

  getEntityHierarchy() {
    return {
      brand: this.brand,
      brands: this.brands.map(brand => ({
        ...brand,
        subBrands: this.getSubBrandsByBrand(brand.id).map(sb => ({
          ...sb,
          stores: this.getStoresBySubBrand(sb.id)
        }))
      }))
    };
  },

  // Get entity display name for breadcrumb
  getEntityDisplayName(entityId) {
    if (entityId === 'brand-all' || entityId === 'all') return 'All Stores';

    const brand = this.getBrandById(entityId);
    if (brand) return brand.name;

    const subBrand = this.getSubBrandById(entityId);
    if (subBrand) return subBrand.name;

    const store = this.getStoreById(entityId);
    if (store) return store.name;

    return 'Unknown';
  },

  // Get entity level
  getEntityLevel(entityId) {
    if (entityId === 'brand-all' || entityId === 'all') return 'all';
    if (this.brands.find(b => b.id === entityId)) return 'brand';
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
