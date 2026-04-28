/**
 * Mock Data for Analytics Dashboard v7
 * Dynamic data with multi-week, multi-entity support
 *
 * Data flows UP from store-level atomic records:
 * Store × Week × Promotion → aggregated to categories, entities
 *
 * Generated: 2025-12-14
 * Stats: ~34,875 records, 93 stores, 36 sub-brands, 6 brands, 5 weeks, 8 categories, 75 promotions
 */

const MockData = (() => {
  'use strict';

  // ============================================
  // WEEKS CONFIGURATION
  // ============================================
  const weeks = [
    { id: 'week-44', num: 44, label: 'Week 44', dateRange: 'Oct 28 - Nov 3, 2025', startDate: '2025-10-28', daysRun: 7 },
    { id: 'week-45', num: 45, label: 'Week 45', dateRange: 'Nov 4 - Nov 10, 2025', startDate: '2025-11-04', daysRun: 7 },
    { id: 'week-46', num: 46, label: 'Week 46', dateRange: 'Nov 11 - Nov 17, 2025', startDate: '2025-11-11', daysRun: 7 },
    { id: 'week-47', num: 47, label: 'Week 47', dateRange: 'Nov 18 - Nov 24, 2025', startDate: '2025-11-18', daysRun: 7 },
    { id: 'week-48', num: 48, label: 'Week 48', dateRange: 'Nov 25 - Dec 1, 2025', startDate: '2025-11-25', daysRun: 7 }
  ];

  // ============================================
  // ENTITY HIERARCHY
  // Brand → SubBrand → Store
  // 6 Brands × 6 SubBrands × ~2-3 Stores = 93 stores
  // ============================================
  const brands = [
    {
      id: 'brand-safeway',
      name: 'Safeway',
      subBrands: [
        {
          id: 'subbrand-safeway-norcal-north',
          name: 'Safeway NorCal North',
          stores: [
            { id: 'store-101', name: 'SF Market St', title: 'SF Market St', size: 'large', storeNumber: 101, address: '2020 Market St, San Francisco, CA 94114' },
            { id: 'store-102', name: 'SF Mission', title: 'SF Mission', size: 'medium', storeNumber: 102, address: '4950 Mission St, San Francisco, CA 94112' },
            { id: 'store-103', name: 'SF Sunset', title: 'SF Sunset', size: 'medium', storeNumber: 103, address: '730 Taraval St, San Francisco, CA 94116' }
          ]
        },
        {
          id: 'subbrand-safeway-norcal-east',
          name: 'Safeway NorCal East',
          stores: [
            { id: 'store-104', name: 'Oakland Downtown', title: 'Oakland Downtown', size: 'large', storeNumber: 104, address: '1500 Broadway, Oakland, CA 94612' },
            { id: 'store-105', name: 'Berkeley', title: 'Berkeley', size: 'medium', storeNumber: 105, address: '1550 Shattuck Ave, Berkeley, CA 94709' },
            { id: 'store-106', name: 'Emeryville', title: 'Emeryville', size: 'small', storeNumber: 106, address: '3950 Horton St, Emeryville, CA 94608' }
          ]
        },
        {
          id: 'subbrand-safeway-norcal-south',
          name: 'Safeway NorCal South',
          stores: [
            { id: 'store-107', name: 'San Jose Downtown', title: 'San Jose Downtown', size: 'large', storeNumber: 107, address: '298 S 1st St, San Jose, CA 95113' },
            { id: 'store-108', name: 'Palo Alto', title: 'Palo Alto', size: 'medium', storeNumber: 108, address: '4080 El Camino Real, Palo Alto, CA 94306' }
          ]
        },
        {
          id: 'subbrand-safeway-eastbay',
          name: 'Safeway East Bay',
          stores: [
            { id: 'store-109', name: 'Walnut Creek', title: 'Walnut Creek', size: 'large', storeNumber: 109, address: '1350 N California Blvd, Walnut Creek, CA 94596' },
            { id: 'store-110', name: 'Concord', title: 'Concord', size: 'medium', storeNumber: 110, address: '785 Oak Grove Rd, Concord, CA 94518' },
            { id: 'store-111', name: 'Pleasant Hill', title: 'Pleasant Hill', size: 'medium', storeNumber: 111, address: '560 Contra Costa Blvd, Pleasant Hill, CA 94523' }
          ]
        },
        {
          id: 'subbrand-safeway-peninsula',
          name: 'Safeway Peninsula',
          stores: [
            { id: 'store-112', name: 'Daly City', title: 'Daly City', size: 'medium', storeNumber: 112, address: '133 Serramonte Center, Daly City, CA 94015' },
            { id: 'store-113', name: 'San Mateo', title: 'San Mateo', size: 'large', storeNumber: 113, address: '1850 S Norfolk St, San Mateo, CA 94403' },
            { id: 'store-114', name: 'Redwood City', title: 'Redwood City', size: 'medium', storeNumber: 114, address: '1001 El Camino Real, Redwood City, CA 94063' }
          ]
        },
        {
          id: 'subbrand-safeway-marin',
          name: 'Safeway Marin',
          stores: [
            { id: 'store-115', name: 'San Rafael', title: 'San Rafael', size: 'large', storeNumber: 115, address: '800 Northgate Mall, San Rafael, CA 94903' },
            { id: 'store-116', name: 'Mill Valley', title: 'Mill Valley', size: 'small', storeNumber: 116, address: '200 Shoreline Hwy, Mill Valley, CA 94941' }
          ]
        }
      ]
    },
    {
      id: 'brand-vons',
      name: 'Vons',
      subBrands: [
        {
          id: 'subbrand-vons-la-central',
          name: 'Vons LA Central',
          stores: [
            { id: 'store-201', name: 'LA Downtown', title: 'LA Downtown', size: 'large', storeNumber: 201, address: '645 W 9th St, Los Angeles, CA 90015' },
            { id: 'store-202', name: 'Hollywood', title: 'Hollywood', size: 'medium', storeNumber: 202, address: '5510 W Sunset Blvd, Hollywood, CA 90028' },
            { id: 'store-203', name: 'Koreatown', title: 'Koreatown', size: 'medium', storeNumber: 203, address: '2770 W Olympic Blvd, Los Angeles, CA 90006' }
          ]
        },
        {
          id: 'subbrand-vons-la-west',
          name: 'Vons LA West',
          stores: [
            { id: 'store-204', name: 'Santa Monica', title: 'Santa Monica', size: 'large', storeNumber: 204, address: '1311 Wilshire Blvd, Santa Monica, CA 90403' },
            { id: 'store-205', name: 'Venice', title: 'Venice', size: 'medium', storeNumber: 205, address: '730 Rose Ave, Venice, CA 90291' },
            { id: 'store-206', name: 'Culver City', title: 'Culver City', size: 'medium', storeNumber: 206, address: '5500 Sepulveda Blvd, Culver City, CA 90230' }
          ]
        },
        {
          id: 'subbrand-vons-la-east',
          name: 'Vons LA East',
          stores: [
            { id: 'store-207', name: 'Pasadena', title: 'Pasadena', size: 'large', storeNumber: 207, address: '2355 E Colorado Blvd, Pasadena, CA 91107' },
            { id: 'store-208', name: 'Glendale', title: 'Glendale', size: 'medium', storeNumber: 208, address: '220 N Brand Blvd, Glendale, CA 91203' }
          ]
        },
        {
          id: 'subbrand-vons-sd-north',
          name: 'Vons San Diego North',
          stores: [
            { id: 'store-209', name: 'SD Gaslamp', title: 'SD Gaslamp', size: 'medium', storeNumber: 209, address: '643 5th Ave, San Diego, CA 92101' },
            { id: 'store-210', name: 'La Jolla', title: 'La Jolla', size: 'large', storeNumber: 210, address: '7544 Girard Ave, La Jolla, CA 92037' },
            { id: 'store-211', name: 'Del Mar', title: 'Del Mar', size: 'small', storeNumber: 211, address: '2750 Via De La Valle, Del Mar, CA 92014' }
          ]
        },
        {
          id: 'subbrand-vons-sd-south',
          name: 'Vons San Diego South',
          stores: [
            { id: 'store-212', name: 'Chula Vista', title: 'Chula Vista', size: 'medium', storeNumber: 212, address: '1260 3rd Ave, Chula Vista, CA 91911' },
            { id: 'store-213', name: 'National City', title: 'National City', size: 'medium', storeNumber: 213, address: '1201 S Highland Ave, National City, CA 91950' }
          ]
        },
        {
          id: 'subbrand-vons-oc',
          name: 'Vons Orange County',
          stores: [
            { id: 'store-214', name: 'Irvine', title: 'Irvine', size: 'large', storeNumber: 214, address: '4255 Campus Dr, Irvine, CA 92612' },
            { id: 'store-215', name: 'Newport Beach', title: 'Newport Beach', size: 'medium', storeNumber: 215, address: '1600 E Coast Hwy, Newport Beach, CA 92660' },
            { id: 'store-216', name: 'Anaheim', title: 'Anaheim', size: 'large', storeNumber: 216, address: '900 S Harbor Blvd, Anaheim, CA 92805' }
          ]
        }
      ]
    },
    {
      id: 'brand-albertsons',
      name: 'Albertsons',
      subBrands: [
        {
          id: 'subbrand-albertsons-sac',
          name: 'Albertsons Sacramento',
          stores: [
            { id: 'store-301', name: 'Sacramento Downtown', title: 'Sacramento Downtown', size: 'large', storeNumber: 301, address: '1725 Arden Way, Sacramento, CA 95815' },
            { id: 'store-302', name: 'Elk Grove', title: 'Elk Grove', size: 'medium', storeNumber: 302, address: '8901 Elk Grove Blvd, Elk Grove, CA 95624' },
            { id: 'store-303', name: 'Roseville', title: 'Roseville', size: 'medium', storeNumber: 303, address: '10333 Fairway Dr, Roseville, CA 95678' }
          ]
        },
        {
          id: 'subbrand-albertsons-central',
          name: 'Albertsons Central Valley',
          stores: [
            { id: 'store-304', name: 'Fresno', title: 'Fresno', size: 'large', storeNumber: 304, address: '7155 N Cedar Ave, Fresno, CA 93720' },
            { id: 'store-305', name: 'Stockton', title: 'Stockton', size: 'medium', storeNumber: 305, address: '6521 Pacific Ave, Stockton, CA 95207' }
          ]
        },
        {
          id: 'subbrand-albertsons-portland',
          name: 'Albertsons Portland',
          stores: [
            { id: 'store-306', name: 'Portland Downtown', title: 'Portland Downtown', size: 'large', storeNumber: 306, address: '4828 SE Hawthorne Blvd, Portland, OR 97215' },
            { id: 'store-307', name: 'Beaverton', title: 'Beaverton', size: 'medium', storeNumber: 307, address: '3550 SW Cedar Hills Blvd, Beaverton, OR 97005' },
            { id: 'store-308', name: 'Lake Oswego', title: 'Lake Oswego', size: 'small', storeNumber: 308, address: '15391 SW Bangy Rd, Lake Oswego, OR 97035' }
          ]
        },
        {
          id: 'subbrand-albertsons-seattle',
          name: 'Albertsons Seattle',
          stores: [
            { id: 'store-309', name: 'Seattle Ballard', title: 'Seattle Ballard', size: 'large', storeNumber: 309, address: '2550 32nd Ave W, Seattle, WA 98199' },
            { id: 'store-310', name: 'Bellevue', title: 'Bellevue', size: 'large', storeNumber: 310, address: '15100 SE 38th St, Bellevue, WA 98006' },
            { id: 'store-311', name: 'Kirkland', title: 'Kirkland', size: 'medium', storeNumber: 311, address: '10116 NE 8th St, Kirkland, WA 98034' }
          ]
        },
        {
          id: 'subbrand-albertsons-tacoma',
          name: 'Albertsons Tacoma',
          stores: [
            { id: 'store-312', name: 'Tacoma', title: 'Tacoma', size: 'medium', storeNumber: 312, address: '3520 S 23rd St, Tacoma, WA 98405' },
            { id: 'store-313', name: 'Olympia', title: 'Olympia', size: 'medium', storeNumber: 313, address: '625 Black Lake Blvd SW, Olympia, WA 98502' }
          ]
        },
        {
          id: 'subbrand-albertsons-spokane',
          name: 'Albertsons Spokane',
          stores: [
            { id: 'store-314', name: 'Spokane Downtown', title: 'Spokane Downtown', size: 'large', storeNumber: 314, address: '29 E Hawthorne Rd, Spokane, WA 99218' },
            { id: 'store-315', name: 'Spokane Valley', title: 'Spokane Valley', size: 'medium', storeNumber: 315, address: '15609 E Sprague Ave, Spokane Valley, WA 99037' },
            { id: 'store-316', name: 'Coeur d\'Alene', title: 'Coeur d\'Alene', size: 'medium', storeNumber: 316, address: '101 W Kathleen Ave, Coeur d\'Alene, ID 83815' }
          ]
        }
      ]
    },
    {
      id: 'brand-jewelosco',
      name: 'Jewel-Osco',
      subBrands: [
        {
          id: 'subbrand-jewelosco-chicago-north',
          name: 'Jewel-Osco Chicago North',
          stores: [
            { id: 'store-401', name: 'Chicago Loop', title: 'Chicago Loop', size: 'large', storeNumber: 401, address: '225 W Washington St, Chicago, IL 60606' },
            { id: 'store-402', name: 'Lincoln Park', title: 'Lincoln Park', size: 'medium', storeNumber: 402, address: '2550 N Clybourn Ave, Chicago, IL 60614' },
            { id: 'store-403', name: 'Lakeview', title: 'Lakeview', size: 'medium', storeNumber: 403, address: '3531 N Broadway, Chicago, IL 60657' }
          ]
        },
        {
          id: 'subbrand-jewelosco-chicago-south',
          name: 'Jewel-Osco Chicago South',
          stores: [
            { id: 'store-404', name: 'Hyde Park', title: 'Hyde Park', size: 'medium', storeNumber: 404, address: '1504 E 55th St, Chicago, IL 60615' },
            { id: 'store-405', name: 'Bronzeville', title: 'Bronzeville', size: 'small', storeNumber: 405, address: '4355 S King Dr, Chicago, IL 60653' }
          ]
        },
        {
          id: 'subbrand-jewelosco-northshore',
          name: 'Jewel-Osco North Shore',
          stores: [
            { id: 'store-406', name: 'Evanston', title: 'Evanston', size: 'large', storeNumber: 406, address: '1128 Chicago Ave, Evanston, IL 60202' },
            { id: 'store-407', name: 'Wilmette', title: 'Wilmette', size: 'medium', storeNumber: 407, address: '3207 Lake Ave, Wilmette, IL 60091' },
            { id: 'store-408', name: 'Highland Park', title: 'Highland Park', size: 'medium', storeNumber: 408, address: '1776 Skokie Valley Rd, Highland Park, IL 60035' }
          ]
        },
        {
          id: 'subbrand-jewelosco-westburbs',
          name: 'Jewel-Osco Western Suburbs',
          stores: [
            { id: 'store-409', name: 'Oak Park', title: 'Oak Park', size: 'medium', storeNumber: 409, address: '1155 Lake St, Oak Park, IL 60301' },
            { id: 'store-410', name: 'Naperville', title: 'Naperville', size: 'large', storeNumber: 410, address: '2855 95th St, Naperville, IL 60564' },
            { id: 'store-411', name: 'Aurora', title: 'Aurora', size: 'large', storeNumber: 411, address: '1301 N Farnsworth Ave, Aurora, IL 60505' }
          ]
        },
        {
          id: 'subbrand-jewelosco-nwburbs',
          name: 'Jewel-Osco NW Suburbs',
          stores: [
            { id: 'store-412', name: 'Schaumburg', title: 'Schaumburg', size: 'large', storeNumber: 412, address: '1020 E Golf Rd, Schaumburg, IL 60173' },
            { id: 'store-413', name: 'Arlington Heights', title: 'Arlington Heights', size: 'medium', storeNumber: 413, address: '1860 S Arlington Heights Rd, Arlington Heights, IL 60005' }
          ]
        },
        {
          id: 'subbrand-jewelosco-swburbs',
          name: 'Jewel-Osco SW Suburbs',
          stores: [
            { id: 'store-414', name: 'Orland Park', title: 'Orland Park', size: 'large', storeNumber: 414, address: '14150 S LaGrange Rd, Orland Park, IL 60462' },
            { id: 'store-415', name: 'Tinley Park', title: 'Tinley Park', size: 'medium', storeNumber: 415, address: '17020 Harlem Ave, Tinley Park, IL 60477' },
            { id: 'store-416', name: 'Joliet', title: 'Joliet', size: 'medium', storeNumber: 416, address: '2391 Essington Rd, Joliet, IL 60435' }
          ]
        }
      ]
    },
    {
      id: 'brand-acme',
      name: 'Acme Markets',
      subBrands: [
        {
          id: 'subbrand-acme-philly-center',
          name: 'Acme Philadelphia Center',
          stores: [
            { id: 'store-501', name: 'Center City', title: 'Center City', size: 'large', storeNumber: 501, address: '1500 Walnut St, Philadelphia, PA 19102' },
            { id: 'store-502', name: 'University City', title: 'University City', size: 'medium', storeNumber: 502, address: '3401 Walnut St, Philadelphia, PA 19104' },
            { id: 'store-503', name: 'Northern Liberties', title: 'Northern Liberties', size: 'medium', storeNumber: 503, address: '1000 N Delaware Ave, Philadelphia, PA 19123' }
          ]
        },
        {
          id: 'subbrand-acme-philly-northwest',
          name: 'Acme Philadelphia NW',
          stores: [
            { id: 'store-504', name: 'Manayunk', title: 'Manayunk', size: 'medium', storeNumber: 504, address: '4411 Main St, Philadelphia, PA 19127' },
            { id: 'store-505', name: 'Chestnut Hill', title: 'Chestnut Hill', size: 'small', storeNumber: 505, address: '8200 Germantown Ave, Philadelphia, PA 19118' }
          ]
        },
        {
          id: 'subbrand-acme-nj-south',
          name: 'Acme NJ South',
          stores: [
            { id: 'store-506', name: 'Cherry Hill', title: 'Cherry Hill', size: 'large', storeNumber: 506, address: '1900 Marlton Pike E, Cherry Hill, NJ 08003' },
            { id: 'store-507', name: 'Voorhees', title: 'Voorhees', size: 'medium', storeNumber: 507, address: '700 Haddonfield Berlin Rd, Voorhees, NJ 08043' },
            { id: 'store-508', name: 'Marlton', title: 'Marlton', size: 'medium', storeNumber: 508, address: '180 NJ-73, Marlton, NJ 08053' }
          ]
        },
        {
          id: 'subbrand-acme-nj-central',
          name: 'Acme NJ Central',
          stores: [
            { id: 'store-509', name: 'Princeton', title: 'Princeton', size: 'large', storeNumber: 509, address: '301 N Harrison St, Princeton, NJ 08540' },
            { id: 'store-510', name: 'Lawrenceville', title: 'Lawrenceville', size: 'medium', storeNumber: 510, address: '3456 US-1, Lawrenceville, NJ 08648' }
          ]
        },
        {
          id: 'subbrand-acme-de',
          name: 'Acme Delaware',
          stores: [
            { id: 'store-511', name: 'Wilmington', title: 'Wilmington', size: 'large', storeNumber: 511, address: '1600 Pennsylvania Ave, Wilmington, DE 19806' },
            { id: 'store-512', name: 'Newark DE', title: 'Newark DE', size: 'medium', storeNumber: 512, address: '100 Suburban Plaza, Newark, DE 19711' },
            { id: 'store-513', name: 'Dover', title: 'Dover', size: 'medium', storeNumber: 513, address: '850 N DuPont Hwy, Dover, DE 19901' }
          ]
        },
        {
          id: 'subbrand-acme-md',
          name: 'Acme Maryland',
          stores: [
            { id: 'store-514', name: 'Baltimore Inner Harbor', title: 'Baltimore Inner Harbor', size: 'large', storeNumber: 514, address: '200 E Pratt St, Baltimore, MD 21202' },
            { id: 'store-515', name: 'Towson', title: 'Towson', size: 'medium', storeNumber: 515, address: '825 Goucher Blvd, Towson, MD 21286' }
          ]
        }
      ]
    },
    {
      id: 'brand-shaws',
      name: "Shaw's",
      subBrands: [
        {
          id: 'subbrand-shaws-boston-city',
          name: "Shaw's Boston City",
          stores: [
            { id: 'store-601', name: 'Boston Back Bay', title: 'Boston Back Bay', size: 'large', storeNumber: 601, address: '53 Huntington Ave, Boston, MA 02116' },
            { id: 'store-602', name: 'South End', title: 'South End', size: 'medium', storeNumber: 602, address: '1065 Tremont St, Boston, MA 02120' },
            { id: 'store-603', name: 'Beacon Hill', title: 'Beacon Hill', size: 'small', storeNumber: 603, address: '199 Cambridge St, Boston, MA 02114' }
          ]
        },
        {
          id: 'subbrand-shaws-cambridge',
          name: "Shaw's Cambridge",
          stores: [
            { id: 'store-604', name: 'Cambridge Central', title: 'Cambridge Central', size: 'large', storeNumber: 604, address: '20 Sidney St, Cambridge, MA 02139' },
            { id: 'store-605', name: 'Porter Square', title: 'Porter Square', size: 'medium', storeNumber: 605, address: '49 White St, Cambridge, MA 02140' }
          ]
        },
        {
          id: 'subbrand-shaws-northshore',
          name: "Shaw's North Shore",
          stores: [
            { id: 'store-606', name: 'Salem', title: 'Salem', size: 'medium', storeNumber: 606, address: '450 Highland Ave, Salem, MA 01970' },
            { id: 'store-607', name: 'Beverly', title: 'Beverly', size: 'medium', storeNumber: 607, address: '224 Elliott St, Beverly, MA 01915' },
            { id: 'store-608', name: 'Peabody', title: 'Peabody', size: 'large', storeNumber: 608, address: '17 Sylvan St, Peabody, MA 01960' }
          ]
        },
        {
          id: 'subbrand-shaws-southshore',
          name: "Shaw's South Shore",
          stores: [
            { id: 'store-609', name: 'Braintree', title: 'Braintree', size: 'large', storeNumber: 609, address: '200 Grossman Dr, Braintree, MA 02184' },
            { id: 'store-610', name: 'Quincy', title: 'Quincy', size: 'medium', storeNumber: 610, address: '65 Newport Ave, Quincy, MA 02171' }
          ]
        },
        {
          id: 'subbrand-shaws-ri',
          name: "Shaw's Rhode Island",
          stores: [
            { id: 'store-611', name: 'Providence', title: 'Providence', size: 'large', storeNumber: 611, address: '261 Waterman St, Providence, RI 02906' },
            { id: 'store-612', name: 'Warwick', title: 'Warwick', size: 'medium', storeNumber: 612, address: '1245 Bald Hill Rd, Warwick, RI 02886' },
            { id: 'store-613', name: 'Cranston', title: 'Cranston', size: 'medium', storeNumber: 613, address: '1000 Chapel View Blvd, Cranston, RI 02920' }
          ]
        },
        {
          id: 'subbrand-shaws-ct',
          name: "Shaw's Connecticut",
          stores: [
            { id: 'store-614', name: 'Hartford', title: 'Hartford', size: 'medium', storeNumber: 614, address: '1489 New Britain Ave, West Hartford, CT 06110' },
            { id: 'store-615', name: 'New Haven', title: 'New Haven', size: 'large', storeNumber: 615, address: '150 Whalley Ave, New Haven, CT 06511' },
            { id: 'store-616', name: 'Stamford', title: 'Stamford', size: 'large', storeNumber: 616, address: '2100 Bedford St, Stamford, CT 06905' }
          ]
        }
      ]
    }
  ];

  // ============================================
  // CURRENT CONTEXT (mutable)
  // ============================================
  let currentContext = {
    weekNum: 48,
    weekId: 'week-48',
    weekLabel: 'Week 48',
    dateRange: 'Nov 25 - Dec 1, 2025',
    entityId: 'all',
    entityLevel: 'all',
    entityName: 'All Stores'
  };

  // ============================================
  // ATOMIC PROMOTION RECORDS
  // Loaded from promotion-records-data.js
  // ============================================
  let promotionRecords = [];

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  function getAllStores() {
    const stores = [];
    brands.forEach(brand => {
      brand.subBrands.forEach(subBrand => {
        subBrand.stores.forEach(store => {
          stores.push({
            ...store,
            subBrandId: subBrand.id,
            subBrandName: subBrand.name,
            brandId: brand.id,
            brandName: brand.name
          });
        });
      });
    });
    return stores;
  }

  function getStoreIdsForEntity(entityId, entityLevel) {
    if (entityLevel === 'all' || entityId === 'all') {
      return getAllStores().map(s => s.id);
    }

    if (entityLevel === 'brand') {
      const brand = brands.find(b => b.id === entityId);
      if (!brand) return [];
      const storeIds = [];
      brand.subBrands.forEach(sb => {
        sb.stores.forEach(s => storeIds.push(s.id));
      });
      return storeIds;
    }

    if (entityLevel === 'sub-brand') {
      for (const brand of brands) {
        const subBrand = brand.subBrands.find(sb => sb.id === entityId);
        if (subBrand) {
          return subBrand.stores.map(s => s.id);
        }
      }
      return [];
    }

    if (entityLevel === 'store') {
      return [entityId];
    }

    return getAllStores().map(s => s.id);
  }

  function getFilteredRecords(weekNum = null, entityId = null, entityLevel = null) {
    const week = weekNum || currentContext.weekNum;
    const entId = entityId || currentContext.entityId;
    const entLevel = entityLevel || currentContext.entityLevel;

    const storeIds = getStoreIdsForEntity(entId, entLevel);

    return promotionRecords.filter(r =>
      r.weekNum === week && storeIds.includes(r.storeId)
    );
  }

  function aggregateByCategory(records) {
    const byCategory = {};

    records.forEach(record => {
      if (!byCategory[record.category]) {
        byCategory[record.category] = {
          id: record.category.toLowerCase().replace(/\s+/g, '-'),
          name: record.category,
          promotionCount: 0,
          civ: 0,
          cc: 0,
          atl: 0,
          views: 0,
          clicks: 0,
          adds: 0,
          viewsScore: 0,
          clicksScore: 0,
          addsScore: 0,
          compositeScore: 0,
          promotionIds: new Set()
        };
      }

      const cat = byCategory[record.category];
      cat.civ += record.civ;
      cat.cc += record.cc;
      cat.atl += record.atl;
      cat.views += record.views || record.civ;
      cat.clicks += record.clicks || record.cc;
      cat.adds += record.adds || record.atl;
      cat.viewsScore += record.viewsScore || (record.civ * 1);
      cat.clicksScore += record.clicksScore || (record.cc * 5);
      cat.addsScore += record.addsScore || (record.atl * 20);
      cat.compositeScore += record.compositeScore || (record.viewsScore + record.clicksScore + record.addsScore) || 0;
      cat.promotionIds.add(record.promotionId);
    });

    const categories = Object.values(byCategory).map(cat => {
      cat.promotionCount = cat.promotionIds.size;
      delete cat.promotionIds;
      return cat;
    });

    categories.sort((a, b) => b.compositeScore - a.compositeScore);
    categories.forEach((cat, idx) => {
      cat.percentile = Math.round(100 - (idx / categories.length) * 100);
    });

    categories.sort((a, b) => a.name.localeCompare(b.name));
    return categories;
  }

  function getUniquePromotions(records) {
    const promoMap = {};
    const childToParentMap = {}; // Maps child promotionId to parent promotionId

    // First pass: Build the map and identify parent-child relationships
    records.forEach(record => {
      // Track parent-child relationships
      if (record.parentPromoId) {
        childToParentMap[record.promotionId] = record.parentPromoId;
      }

      if (!promoMap[record.promotionId]) {
        promoMap[record.promotionId] = {
          id: record.promotionId,
          name: record.title,
          category: record.category.toLowerCase().replace(/\s+/g, '-'),
          categoryName: record.category,
          dealType: record.dealType,
          cardSize: '1x1',
          heroImage: getPlaceholderImage(record.category),
          thumbImage: getPlaceholderImage(record.category),
          originalPrice: record.originalPrice,
          salePrice: record.salePrice,
          unit: record.unit,
          daysRun: record.daysRun || 7,
          startDate: record.startDate || '',
          endDate: record.endDate || '',
          originalPosition: record.originalPosition || null,
          // Parent-child fields
          isParent: record.isParent || false,
          parentPromoId: record.parentPromoId || null,
          childCount: record.childCount || 0,
          civ: 0,
          cc: 0,
          atl: 0,
          views: 0,
          clicks: 0,
          adds: 0,
          viewsScore: 0,
          clicksScore: 0,
          addsScore: 0,
          compositeScore: 0,
          storeCount: 0
        };
      }

      const promo = promoMap[record.promotionId];
      promo.civ += record.civ;
      promo.cc += record.cc;
      promo.atl += record.atl;
      promo.views += record.views || record.civ;
      promo.clicks += record.clicks || record.cc;
      promo.adds += record.adds || record.atl;
      promo.viewsScore += record.viewsScore || (record.civ * 1);
      promo.clicksScore += record.clicksScore || (record.cc * 5);
      promo.addsScore += record.addsScore || (record.atl * 20);
      promo.compositeScore += record.compositeScore || (record.viewsScore + record.clicksScore + record.addsScore) || 0;
      promo.storeCount++;
    });

    // Second pass: Roll up child metrics to parents
    Object.keys(childToParentMap).forEach(childId => {
      const parentId = childToParentMap[childId];
      const child = promoMap[childId];
      const parent = promoMap[parentId];

      if (child && parent) {
        // Add child metrics to parent
        parent.civ += child.civ;
        parent.cc += child.cc;
        parent.atl += child.atl;
        parent.views += child.views;
        parent.clicks += child.clicks;
        parent.adds += child.adds;
        parent.viewsScore += child.viewsScore;
        parent.clicksScore += child.clicksScore;
        parent.addsScore += child.addsScore;
        parent.compositeScore += child.compositeScore;
      }
    });

    // Filter out child promotions - only show parents and standalone promotions
    const promotions = Object.values(promoMap).filter(p => !p.parentPromoId);

    promotions.sort((a, b) => b.compositeScore - a.compositeScore);
    promotions.forEach((p, idx) => {
      p.percentile = Math.round(100 - (idx / promotions.length) * 100);
    });

    return promotions;
  }

  function getPlaceholderImage(category) {
    const images = {
      'Produce': 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=300&h=200&fit=crop',
      'Meat': 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=300&h=200&fit=crop',
      'Dairy': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&h=200&fit=crop',
      'Bakery': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=200&fit=crop',
      'Frozen': 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=300&h=200&fit=crop',
      'Beverages': 'https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=300&h=200&fit=crop',
      'Snacks': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300&h=200&fit=crop',
      'Pantry': 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=300&h=200&fit=crop'
    };
    return images[category] || images['Produce'];
  }

  function loadPromotionRecords(records) {
    promotionRecords = records;
    console.log(`📊 MockData: Loaded ${records.length} promotion records`);
  }

  function buildEntitiesStructure() {
    const subBrandsList = [];
    const storesList = [];

    brands.forEach(brand => {
      brand.subBrands.forEach(subBrand => {
        subBrandsList.push({
          id: subBrand.id,
          name: subBrand.name,
          level: 'sub-brand',
          brandId: brand.id,
          storeCount: subBrand.stores.length,
          stores: subBrand.stores.map(s => s.id)
        });

        subBrand.stores.forEach(store => {
          storesList.push({
            id: store.id,
            name: store.name,
            title: store.title,
            address: store.address || '',
            storeNumber: store.storeNumber,
            subBrand: subBrand.id,
            brandId: brand.id
          });
        });
      });
    });

    return {
      brand: {
        id: 'all',
        name: 'All Brands',
        level: 'all',
        storeCount: storesList.length
      },
      brands: brands.map(b => ({
        id: b.id,
        name: b.name,
        level: 'brand',
        storeCount: b.subBrands.reduce((sum, sb) => sum + sb.stores.length, 0)
      })),
      subBrands: subBrandsList,
      stores: storesList,
      groups: []
    };
  }

  // ============================================
  // PUBLIC API
  // ============================================
  return {
    weeks,
    brands,

    get context() {
      return {
        week: currentContext.weekNum,
        weekId: currentContext.weekId,
        weekLabel: currentContext.weekLabel,
        dateRange: currentContext.dateRange,
        entity: {
          id: currentContext.entityId,
          name: currentContext.entityName,
          level: currentContext.entityLevel,
          count: getStoreIdsForEntity(currentContext.entityId, currentContext.entityLevel).length
        }
      };
    },

    get entities() {
      return buildEntitiesStructure();
    },

    get categories() {
      const records = getFilteredRecords();
      return aggregateByCategory(records);
    },

    get promotions() {
      const records = getFilteredRecords();
      return getUniquePromotions(records);
    },

    getRecords(weekNum, entityId, entityLevel) {
      return getFilteredRecords(weekNum, entityId, entityLevel);
    },

    setContext(weekNum, entityId, entityLevel, entityName) {
      const week = weeks.find(w => w.num === weekNum);
      if (week) {
        currentContext.weekNum = weekNum;
        currentContext.weekId = week.id;
        currentContext.weekLabel = week.label;
        currentContext.dateRange = week.dateRange;
      }
      if (entityId !== undefined) {
        currentContext.entityId = entityId;
        currentContext.entityLevel = entityLevel || 'all';
        currentContext.entityName = entityName || 'All Stores';
      }
    },

    setWeek(weekNum) {
      const week = weeks.find(w => w.num === weekNum);
      if (week) {
        currentContext.weekNum = weekNum;
        currentContext.weekId = week.id;
        currentContext.weekLabel = week.label;
        currentContext.dateRange = week.dateRange;
      }
    },

    setEntity(entityId, entityLevel, entityName) {
      currentContext.entityId = entityId;
      currentContext.entityLevel = entityLevel || 'all';
      currentContext.entityName = entityName || 'All Stores';
    },

    loadPromotionRecords,
    getAllStores,
    getStoreIdsForEntity,
    aggregateByCategory,
    getUniquePromotions,

    // Backward compatibility helpers
    getCategoryById(id) {
      return this.categories.find(c => c.id === id);
    },

    getPromotionById(id) {
      return this.promotions.find(p => p.id === id);
    },

    getPromotionsByCategory(categoryId) {
      return this.promotions.filter(p => p.category === categoryId);
    },

    getEntityById(id) {
      if (id === 'all') return this.entities.brand;
      const brand = this.entities.brands.find(b => b.id === id);
      if (brand) return brand;
      const subBrand = this.entities.subBrands.find(sb => sb.id === id);
      if (subBrand) return subBrand;
      return this.entities.stores.find(s => s.id === id);
    },

    // Get stores with aggregated metrics for Circulars view
    getStoresWithMetrics() {
      const records = getFilteredRecords();
      const allStores = getAllStores();
      const storeMetrics = {};

      // Get daysRun from current week context
      const currentWeek = weeks.find(w => w.num === currentContext.weekNum);
      const daysRun = currentWeek ? currentWeek.daysRun : 7;

      // Get only the store IDs for the current entity selection
      const entityStoreIds = getStoreIdsForEntity(currentContext.entityId, currentContext.entityLevel);

      // Initialize only stores that belong to the current entity
      allStores.filter(store => entityStoreIds.includes(store.id)).forEach(store => {
        storeMetrics[store.id] = {
          daysRun: daysRun,
          id: store.id,
          name: store.name,
          title: store.title || store.name,
          address: store.address || '',
          storeNumber: store.storeNumber,
          subBrandId: store.subBrandId,
          subBrandName: store.subBrandName,
          brandId: store.brandId,
          brandName: store.brandName,
          size: store.size || 'medium',
          logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(store.name)}&background=4F46E5&color=fff&size=80`,
          civ: 0,
          cc: 0,
          atl: 0,
          views: 0,
          clicks: 0,
          adds: 0,
          viewsScore: 0,
          clicksScore: 0,
          addsScore: 0,
          compositeScore: 0,
          promotionCount: 0,
          categoryCount: 0,
          promotionIds: new Set(),
          categoryIds: new Set()
        };
      });

      // Aggregate metrics from records
      records.forEach(record => {
        if (storeMetrics[record.storeId]) {
          const store = storeMetrics[record.storeId];
          store.civ += record.civ;
          store.cc += record.cc;
          store.atl += record.atl;
          store.views += record.views || record.civ;
          store.clicks += record.clicks || record.cc;
          store.adds += record.adds || record.atl;
          store.viewsScore += record.viewsScore || (record.civ * 1);
          store.clicksScore += record.clicksScore || (record.cc * 5);
          store.addsScore += record.addsScore || (record.atl * 20);
          store.compositeScore += record.compositeScore || (record.viewsScore + record.clicksScore + record.addsScore) || 0;
          store.promotionIds.add(record.promotionId);
          store.categoryIds.add(record.category);
        }
      });

      // Convert to array
      const stores = Object.values(storeMetrics).map(store => {
        store.promotionCount = store.promotionIds.size;
        store.categoryCount = store.categoryIds.size;
        delete store.promotionIds;
        delete store.categoryIds;
        return store;
      });

      // Sort by composite score and calculate percentiles
      stores.sort((a, b) => b.compositeScore - a.compositeScore);
      stores.forEach((store, idx) => {
        store.percentile = Math.round(100 - (idx / stores.length) * 100);
      });

      return stores;
    },

    // Get store by ID with metrics
    getStoreById(id) {
      const stores = this.getStoresWithMetrics();
      return stores.find(s => s.id === id);
    },

    comparisonData: {
      currentWeek: { id: 'week-48', label: 'Week 48', dateRange: 'Nov 25 - Dec 1, 2025' },
      previousWeek: { id: 'week-47', label: 'Week 47', dateRange: 'Nov 18 - Nov 24, 2025' },
      overallMetrics: {
        totalCIV: { current: 0, previous: 0, change: 0, changeType: 'stable' },
        totalCC: { current: 0, previous: 0, change: 0, changeType: 'stable' },
        totalATL: { current: 0, previous: 0, change: 0, changeType: 'stable' }
      },
      categoryMetrics: [],
      trendSummary: { topGainers: [], topDecliners: [], insights: [] }
    },

    topStores: []
  };
})();

// Expose to window for data-service.js access
window.MockData = MockData;

// Load data when promotionRecordsData is available
(function() {
  if (typeof window.promotionRecordsData !== 'undefined') {
    MockData.loadPromotionRecords(window.promotionRecordsData);
  }
})();
