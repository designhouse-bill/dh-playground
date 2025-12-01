/**
 * Store Configuration - Entity Hierarchy
 * Brand → SubBrand → Store
 *
 * 6 Brands, 12 SubBrands, 27 Stores total
 */

const brands = [
  {
    id: "brand-safeway",
    name: "Safeway",
    subBrands: [
      {
        id: "subbrand-safeway-west",
        name: "Safeway West",
        stores: [
          { id: "store-101", name: "SF Market St", size: "large" },
          { id: "store-102", name: "SF Mission", size: "medium" },
          { id: "store-103", name: "Oakland Downtown", size: "large" }
        ]
      },
      {
        id: "subbrand-safeway-east",
        name: "Safeway East",
        stores: [
          { id: "store-104", name: "Berkeley", size: "medium" },
          { id: "store-105", name: "Walnut Creek", size: "large" },
          { id: "store-106", name: "Concord", size: "medium" }
        ]
      }
    ]
  },
  {
    id: "brand-vons",
    name: "Vons",
    subBrands: [
      {
        id: "subbrand-vons-socal",
        name: "Vons SoCal",
        stores: [
          { id: "store-201", name: "LA Downtown", size: "large" },
          { id: "store-202", name: "Santa Monica", size: "large" },
          { id: "store-203", name: "Pasadena", size: "medium" }
        ]
      },
      {
        id: "subbrand-vons-sd",
        name: "Vons San Diego",
        stores: [
          { id: "store-204", name: "SD Gaslamp", size: "medium" },
          { id: "store-205", name: "La Jolla", size: "large" },
          { id: "store-206", name: "Chula Vista", size: "medium" }
        ]
      }
    ]
  },
  {
    id: "brand-albertsons",
    name: "Albertsons",
    subBrands: [
      {
        id: "subbrand-albertsons-norcal",
        name: "Albertsons NorCal",
        stores: [
          { id: "store-301", name: "Sacramento", size: "large" },
          { id: "store-302", name: "Fresno", size: "medium" },
          { id: "store-303", name: "Stockton", size: "small" }
        ]
      },
      {
        id: "subbrand-albertsons-pnw",
        name: "Albertsons PNW",
        stores: [
          { id: "store-304", name: "Portland", size: "large" },
          { id: "store-305", name: "Seattle", size: "large" },
          { id: "store-306", name: "Tacoma", size: "medium" }
        ]
      }
    ]
  },
  {
    id: "brand-jewelosco",
    name: "Jewel-Osco",
    subBrands: [
      {
        id: "subbrand-jewelosco-chicago",
        name: "Jewel-Osco Chicago",
        stores: [
          { id: "store-401", name: "Chicago Loop", size: "large" },
          { id: "store-402", name: "Evanston", size: "medium" },
          { id: "store-403", name: "Oak Park", size: "medium" }
        ]
      },
      {
        id: "subbrand-jewelosco-suburbs",
        name: "Jewel-Osco Suburbs",
        stores: [
          { id: "store-404", name: "Naperville", size: "large" },
          { id: "store-405", name: "Schaumburg", size: "medium" }
        ]
      }
    ]
  },
  {
    id: "brand-acme",
    name: "Acme Markets",
    subBrands: [
      {
        id: "subbrand-acme-philly",
        name: "Acme Philadelphia",
        stores: [
          { id: "store-501", name: "Center City", size: "medium" },
          { id: "store-502", name: "University City", size: "small" }
        ]
      },
      {
        id: "subbrand-acme-nj",
        name: "Acme New Jersey",
        stores: [
          { id: "store-503", name: "Cherry Hill", size: "large" },
          { id: "store-504", name: "Princeton", size: "medium" }
        ]
      }
    ]
  },
  {
    id: "brand-shaws",
    name: "Shaw's",
    subBrands: [
      {
        id: "subbrand-shaws-boston",
        name: "Shaw's Boston",
        stores: [
          { id: "store-601", name: "Boston Back Bay", size: "medium" },
          { id: "store-602", name: "Cambridge", size: "medium" }
        ]
      },
      {
        id: "subbrand-shaws-ne",
        name: "Shaw's New England",
        stores: [
          { id: "store-603", name: "Providence", size: "medium" },
          { id: "store-604", name: "Hartford", size: "small" }
        ]
      }
    ]
  }
];

// Week configuration: 5 weeks (configurable)
const weeks = [
  { num: 44, label: "Oct 28 - Nov 3", startDate: "2025-10-28" },
  { num: 45, label: "Nov 4 - Nov 10", startDate: "2025-11-04" },
  { num: 46, label: "Nov 11 - Nov 17", startDate: "2025-11-11" },
  { num: 47, label: "Nov 18 - Nov 24", startDate: "2025-11-18" },
  { num: 48, label: "Nov 25 - Dec 1", startDate: "2025-11-25" }
];

// Store size determines promotion count range and base metrics
const sizeConfig = {
  small:  { minPromos: 12, maxPromos: 18, baseCIV: 800,  baseCC: 60,  baseATL: 25 },
  medium: { minPromos: 18, maxPromos: 24, baseCIV: 1200, baseCC: 90,  baseATL: 40 },
  large:  { minPromos: 24, maxPromos: 32, baseCIV: 1800, baseCC: 130, baseATL: 55 }
};

// Flatten stores for easy iteration
const getAllStores = () => {
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
};

// Get config statistics
const getConfigStats = () => {
  const stores = getAllStores();
  return {
    brands: brands.length,
    subBrands: brands.reduce((sum, b) => sum + b.subBrands.length, 0),
    stores: stores.length,
    weeks: weeks.length,
    storesBySize: {
      small: stores.filter(s => s.size === 'small').length,
      medium: stores.filter(s => s.size === 'medium').length,
      large: stores.filter(s => s.size === 'large').length
    }
  };
};

module.exports = { brands, weeks, sizeConfig, getAllStores, getConfigStats };
