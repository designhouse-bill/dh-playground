# Mock Data Generator

Generates realistic grocery promotion data for the Analytics Dashboard with seeded randomness for reproducible results.

## Quick Start

```bash
# Run tests
node index.js --test

# Generate data (default: 3 products per category per week)
node index.js --generate

# Generate with more products
node index.js --generate --products=15
```

## Architecture

```
mock-data-generator/
├── index.js                  # Main entry point
├── seed-random.js            # Seeded PRNG utility
├── product-catalog.js        # 200 realistic grocery products
├── store-config.js           # Entity hierarchy configuration
├── generators/
│   └── promotion-generator.js  # Core generation logic
├── test/
│   └── test-consistency.js   # Consistency verification tests
└── output/
    └── mock-data-generated.js  # Generated output
```

## Key Concepts

### Seeded Randomness

Same inputs always produce same outputs:

```javascript
// Seed = promotionId + storeId + weekNum
// "Heinz Ketchup" at Store 101, Week 47 → always CIV=1680, CC=115, ATL=52
// "Heinz Ketchup" at Store 102, Week 47 → different values (different store)
// "Heinz Ketchup" at Store 101, Week 48 → different values (different week)
```

### Store Size Metrics

Larger stores have higher base metrics:

| Size   | Base CIV | Base CC | Base ATL | Promos/Week |
|--------|----------|---------|----------|-------------|
| Small  | 800      | 60      | 25       | 12-18       |
| Medium | 1,200    | 90      | 40       | 18-24       |
| Large  | 1,800    | 130     | 55       | 24-32       |

Actual values vary ±25% from base.

### Data Structure

Generated records are atomic (store × week × promotion):

```javascript
{
  // Entity hierarchy
  storeId: "store-101",
  storeName: "SF Market St",
  subBrandId: "subbrand-safeway-west",
  subBrandName: "Safeway West",
  brandId: "brand-safeway",
  brandName: "Safeway",

  // Week
  weekNum: 47,
  weekLabel: "Nov 18 - Nov 24",

  // Promotion
  promotionId: "promo-wk47-pantry-0",
  category: "Pantry",
  title: "Heinz Ketchup",
  originalPrice: 4.99,
  salePrice: 2.99,
  dealType: "Sale",

  // Metrics (vary by store)
  civ: 1680,
  cc: 115,
  atl: 52
}
```

## Configuration

### Current Defaults

| Dimension | Value |
|-----------|-------|
| Brands | 6 |
| Sub-Brands | 12 |
| Stores | 31 |
| Weeks | 5 (Oct 28 - Dec 1, 2025) |
| Categories | 8 |
| Products in Catalog | 200 |

### Modifying Configuration

**Add/remove stores:** Edit `store-config.js` → `brands` array

**Add/remove weeks:** Edit `store-config.js` → `weeks` array

**Add/remove products:** Edit `product-catalog.js` → `catalog` object

**Change products per category:** Use `--products=N` flag

## CLI Options

```bash
node index.js --help           # Show help
node index.js --test           # Run consistency tests
node index.js --generate       # Generate with defaults
node index.js --generate --products=5    # 5 products per category per week
node index.js --generate --output=data.js  # Custom output filename
node index.js --generate --format=json     # Output as JSON instead of JS
```

## Output

Generated file exports:

```javascript
// Main data
export const promotionRecords = [...];

// Helper functions
export const getRecordsByStore = (storeId) => ...;
export const getRecordsByWeek = (weekNum) => ...;
export const getRecordsByCategory = (category) => ...;
export const aggregateByCategory = (records) => ...;

// Metadata
export const getUniqueWeeks = () => ...;
export const getUniqueStores = () => ...;
export const getUniqueCategories = () => ...;
```

## Tests

The test suite verifies:

1. **Same promotion, different stores** → Different metrics (within ±25% of size base)
2. **Reproducibility** → Same inputs always produce same outputs
3. **Different weeks** → Same promotion produces different metrics
4. **Weekly circular** → Products are distributed across categories
5. **Full generation** → All stores × weeks × promotions generated correctly

Run tests:

```bash
node index.js --test
```

## Extending

### Adding a New Brand

```javascript
// In store-config.js, add to brands array:
{
  id: "brand-newbrand",
  name: "New Brand",
  subBrands: [
    {
      id: "subbrand-newbrand-region",
      name: "New Brand Region",
      stores: [
        { id: "store-701", name: "Store Name", size: "medium" }
      ]
    }
  ]
}
```

### Adding New Products

```javascript
// In product-catalog.js, add to appropriate category:
Produce: [
  ...existingProducts,
  { name: "Organic Kale", unit: "bunch", basePrice: 2.99 }
]
```

### Adding More Weeks

```javascript
// In store-config.js, add to weeks array:
{ num: 49, label: "Dec 2 - Dec 8", startDate: "2025-12-02" }
```

## Version History

- **v1.0** - Initial implementation with seeded randomness
  - 200 products across 8 categories
  - 31 stores across 6 brands
  - 5 weeks of data
  - ±25% variance for store-level metrics
