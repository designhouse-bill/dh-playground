/* ==========================================================================
   Mock Data — Promotions & Categories
   Exposes window.MOCK_PROMOTIONS and window.MOCK_CATEGORIES
   ========================================================================== */

window.MOCK_CATEGORIES = [
  { hash: 'cat-dairy',   name: 'Dairy',   sortOrder: 1 },
  { hash: 'cat-produce', name: 'Produce', sortOrder: 2 },
  { hash: 'cat-bakery',  name: 'Bakery',  sortOrder: 3 }
];

window.MOCK_PROMOTIONS = [
  // ── Dairy ──────────────────────────────────────────────

  // 1. Fully unlocked
  {
    hash: 'promo-001',
    title: 'Organic Valley Whole Milk',
    description: 'Fresh organic whole milk, 1 gallon',
    categoryHash: 'cat-dairy',
    categoryName: 'Dairy',
    deal: { type: 'fixed', price: 4.99, units: 'ea', couponAmountOff: null },
    loyaltyDeal: { type: null, price: null },
    bogoDeal: { buyQuantity: null, getQuantity: null, getDeal: null, getDealType: null },
    validFrom: '2026-02-10',
    validTo: '2026-02-16',
    dateText: 'Feb 10 – Feb 16',
    promoSize: '300x200',
    height: 200,
    length: 300,
    hidden: false,
    nodeName: 'Midwest Grocery Co.',
    cardStyleHash: 'style-standard',
    upc: '093966001006',
    couponId: '',
    icons: '',
    mediaSize: 'medium',
    headline: '',
    background: { backgroundColor: '#ffffff', backgroundImage: '', position: 'center', size: 'cover', repeat: 'no-repeat' },
    thumbnailPath: null,
    lockConfig: null
  },

  // 2. Fully unlocked
  {
    hash: 'promo-002',
    title: 'Tillamook Cheddar Cheese',
    description: 'Sharp cheddar, 8oz block',
    categoryHash: 'cat-dairy',
    categoryName: 'Dairy',
    deal: { type: 'fixed', price: 3.49, units: 'ea', couponAmountOff: null },
    loyaltyDeal: { type: null, price: null },
    bogoDeal: { buyQuantity: null, getQuantity: null, getDeal: null, getDealType: null },
    validFrom: '2026-02-10',
    validTo: '2026-02-16',
    dateText: 'Feb 10 – Feb 16',
    promoSize: '300x200',
    height: 200,
    length: 300,
    hidden: false,
    nodeName: 'Midwest Grocery Co.',
    cardStyleHash: 'style-standard',
    upc: '072830000116',
    couponId: '',
    icons: '',
    mediaSize: 'medium',
    headline: '',
    background: { backgroundColor: '#ffffff', backgroundImage: '', position: 'center', size: 'cover', repeat: 'no-repeat' },
    thumbnailPath: null,
    lockConfig: null
  },

  // 3. Partially locked (title + description locked, rest open)
  {
    hash: 'promo-003',
    title: 'Chobani Greek Yogurt',
    description: 'Strawberry, 5.3oz cup',
    categoryHash: 'cat-dairy',
    categoryName: 'Dairy',
    deal: { type: 'numfor', price: 5.00, units: '5 for', couponAmountOff: null },
    loyaltyDeal: { type: null, price: null },
    bogoDeal: { buyQuantity: null, getQuantity: null, getDeal: null, getDealType: null },
    validFrom: '2026-02-10',
    validTo: '2026-02-16',
    dateText: 'Feb 10 – Feb 16',
    promoSize: '200x200',
    height: 200,
    length: 200,
    hidden: false,
    nodeName: 'Midwest Grocery Co.',
    cardStyleHash: 'style-standard',
    upc: '818290010001',
    couponId: '',
    icons: '',
    mediaSize: 'small',
    headline: 'Stock Up & Save!',
    background: { backgroundColor: '#fff9c4', backgroundImage: '', position: 'center', size: 'cover', repeat: 'no-repeat' },
    thumbnailPath: null,
    lockConfig: {
      global: 'none',
      attributes: {
        'title': { state: 'locked' },
        'description': { state: 'locked' }
      },
      lockedBy: 'Midwest Grocery Co.',
      lockedAt: '2026-02-08T10:00:00Z'
    }
  },

  // 4. Constrained price
  {
    hash: 'promo-004',
    title: 'Horizon Organic Eggs',
    description: 'Free-range large eggs, dozen',
    categoryHash: 'cat-dairy',
    categoryName: 'Dairy',
    deal: { type: 'fixed', price: 4.49, units: 'ea', couponAmountOff: null },
    loyaltyDeal: { type: null, price: null },
    bogoDeal: { buyQuantity: null, getQuantity: null, getDeal: null, getDealType: null },
    validFrom: '2026-02-10',
    validTo: '2026-02-16',
    dateText: 'Feb 10 – Feb 16',
    promoSize: '300x200',
    height: 200,
    length: 300,
    hidden: false,
    nodeName: 'Midwest Grocery Co.',
    cardStyleHash: 'style-standard',
    upc: '742365000126',
    couponId: '',
    icons: '',
    mediaSize: 'medium',
    headline: '',
    background: { backgroundColor: '#ffffff', backgroundImage: '', position: 'center', size: 'cover', repeat: 'no-repeat' },
    thumbnailPath: null,
    lockConfig: {
      global: 'none',
      attributes: {
        'title': { state: 'locked' },
        'deal.price': { state: 'constrained', min: 2.99, max: 5.99 },
        'deal.type': { state: 'locked' },
        'categoryHash': { state: 'locked' }
      },
      lockedBy: 'Midwest Grocery Co.',
      lockedAt: '2026-02-07T14:30:00Z'
    }
  },

  // ── Produce ────────────────────────────────────────────

  // 5. Fully locked (all fields locked — triggers row treatment)
  {
    hash: 'promo-005',
    title: 'Washington Apples',
    description: 'Gala apples, per lb',
    categoryHash: 'cat-produce',
    categoryName: 'Produce',
    deal: { type: 'fixed', price: 1.29, units: 'lb', couponAmountOff: null },
    loyaltyDeal: { type: null, price: null },
    bogoDeal: { buyQuantity: null, getQuantity: null, getDeal: null, getDealType: null },
    validFrom: '2026-02-10',
    validTo: '2026-02-16',
    dateText: 'Feb 10 – Feb 16',
    promoSize: '200x200',
    height: 200,
    length: 200,
    hidden: false,
    nodeName: 'Midwest Grocery Co.',
    cardStyleHash: 'style-standard',
    upc: '000000004135',
    couponId: '',
    icons: '',
    mediaSize: 'small',
    headline: '',
    background: { backgroundColor: '#ffffff', backgroundImage: '', position: 'center', size: 'cover', repeat: 'no-repeat' },
    thumbnailPath: null,
    lockConfig: {
      global: 'none',
      attributes: {
        'title': { state: 'locked' },
        'description': { state: 'locked' },
        'dateText': { state: 'locked' },
        'categoryHash': { state: 'locked' },
        'promoSize': { state: 'locked' },
        'dateRange': { state: 'locked' },
        'cardStyleHash': { state: 'locked' },
        'deal.type': { state: 'locked' },
        'deal.price': { state: 'locked' },
        'deal.units': { state: 'locked' },
        'deal.couponAmountOff': { state: 'locked' },
        'upc': { state: 'locked' },
        'couponId': { state: 'locked' },
        'loyaltyDeal.type': { state: 'locked' },
        'loyaltyDeal.price': { state: 'locked' },
        'icons': { state: 'locked' },
        'mediaSize': { state: 'locked' },
        'headline': { state: 'locked' },
        'background': { state: 'locked' },
        'bogoDeal': { state: 'locked' }
      },
      lockedBy: 'Midwest Grocery Co.',
      lockedAt: '2026-02-06T09:00:00Z'
    }
  },

  // 6. Partially locked + constrained price
  {
    hash: 'promo-006',
    title: 'Driscoll\'s Strawberries',
    description: 'Fresh strawberries, 1lb clamshell',
    categoryHash: 'cat-produce',
    categoryName: 'Produce',
    deal: { type: 'fixed', price: 3.99, units: 'ea', couponAmountOff: null },
    loyaltyDeal: { type: 'fixed', price: 2.99 },
    bogoDeal: { buyQuantity: null, getQuantity: null, getDeal: null, getDealType: null },
    validFrom: '2026-02-10',
    validTo: '2026-02-16',
    dateText: 'Feb 10 – Feb 16',
    promoSize: '300x200',
    height: 200,
    length: 300,
    hidden: false,
    nodeName: 'Midwest Grocery Co.',
    cardStyleHash: 'style-featured',
    upc: '000000094011',
    couponId: '',
    icons: 'loyalty',
    mediaSize: 'large',
    headline: 'Berry Season!',
    background: { backgroundColor: '#ffebee', backgroundImage: '', position: 'center', size: 'cover', repeat: 'no-repeat' },
    thumbnailPath: null,
    lockConfig: {
      global: 'none',
      attributes: {
        'title': { state: 'locked' },
        'deal.price': { state: 'constrained', min: 2.99, max: 4.99 },
        'loyaltyDeal.price': { state: 'constrained', min: 1.99, max: 3.49 },
        'headline': { state: 'locked' },
        'background': { state: 'locked' }
      },
      lockedBy: 'Midwest Grocery Co.',
      lockedAt: '2026-02-07T11:00:00Z'
    }
  },

  // 7. Unlocked
  {
    hash: 'promo-007',
    title: 'Russet Potatoes',
    description: '5lb bag, Idaho grown',
    categoryHash: 'cat-produce',
    categoryName: 'Produce',
    deal: { type: 'fixed', price: 2.99, units: 'ea', couponAmountOff: null },
    loyaltyDeal: { type: null, price: null },
    bogoDeal: { buyQuantity: null, getQuantity: null, getDeal: null, getDealType: null },
    validFrom: '2026-02-10',
    validTo: '2026-02-16',
    dateText: 'Feb 10 – Feb 16',
    promoSize: '200x200',
    height: 200,
    length: 200,
    hidden: false,
    nodeName: 'Midwest Grocery Co.',
    cardStyleHash: 'style-standard',
    upc: '000000004072',
    couponId: '',
    icons: '',
    mediaSize: 'medium',
    headline: '',
    background: { backgroundColor: '#ffffff', backgroundImage: '', position: 'center', size: 'cover', repeat: 'no-repeat' },
    thumbnailPath: null,
    lockConfig: null
  },

  // 8. BOGO deal with grouped Date Range lock
  {
    hash: 'promo-008',
    title: 'Organic Baby Spinach',
    description: '5oz container, triple washed',
    categoryHash: 'cat-produce',
    categoryName: 'Produce',
    deal: { type: 'bogo', price: 3.49, units: 'ea', couponAmountOff: null },
    loyaltyDeal: { type: null, price: null },
    bogoDeal: { buyQuantity: 1, getQuantity: 1, getDeal: 'free', getDealType: 'bogo' },
    validFrom: '2026-02-10',
    validTo: '2026-02-16',
    dateText: 'Feb 10 – Feb 16',
    promoSize: '300x300',
    height: 300,
    length: 300,
    hidden: false,
    nodeName: 'Midwest Grocery Co.',
    cardStyleHash: 'style-featured',
    upc: '000000094525',
    couponId: '',
    icons: '',
    mediaSize: 'large',
    headline: 'Buy One Get One FREE',
    background: { backgroundColor: '#e8f5e9', backgroundImage: '', position: 'center', size: 'cover', repeat: 'no-repeat' },
    thumbnailPath: null,
    lockConfig: {
      global: 'none',
      attributes: {
        'dateRange': { state: 'locked' },
        'bogoDeal': { state: 'locked' },
        'deal.type': { state: 'locked' }
      },
      lockedBy: 'Midwest Grocery Co.',
      lockedAt: '2026-02-08T08:00:00Z'
    }
  },

  // ── Bakery ─────────────────────────────────────────────

  // 9. Fully locked (triggers row treatment)
  {
    hash: 'promo-009',
    title: 'Artisan Sourdough Bread',
    description: 'Freshly baked sourdough loaf',
    categoryHash: 'cat-bakery',
    categoryName: 'Bakery',
    deal: { type: 'fixed', price: 4.99, units: 'ea', couponAmountOff: null },
    loyaltyDeal: { type: null, price: null },
    bogoDeal: { buyQuantity: null, getQuantity: null, getDeal: null, getDealType: null },
    validFrom: '2026-02-10',
    validTo: '2026-02-16',
    dateText: 'Feb 10 – Feb 16',
    promoSize: '200x200',
    height: 200,
    length: 200,
    hidden: false,
    nodeName: 'Midwest Grocery Co.',
    cardStyleHash: 'style-standard',
    upc: '000000032145',
    couponId: '',
    icons: '',
    mediaSize: 'small',
    headline: '',
    background: { backgroundColor: '#ffffff', backgroundImage: '', position: 'center', size: 'cover', repeat: 'no-repeat' },
    thumbnailPath: null,
    lockConfig: {
      global: 'none',
      attributes: {
        'title': { state: 'locked' },
        'description': { state: 'locked' },
        'dateText': { state: 'locked' },
        'categoryHash': { state: 'locked' },
        'promoSize': { state: 'locked' },
        'dateRange': { state: 'locked' },
        'cardStyleHash': { state: 'locked' },
        'deal.type': { state: 'locked' },
        'deal.price': { state: 'locked' },
        'deal.units': { state: 'locked' },
        'deal.couponAmountOff': { state: 'locked' },
        'upc': { state: 'locked' },
        'couponId': { state: 'locked' },
        'loyaltyDeal.type': { state: 'locked' },
        'loyaltyDeal.price': { state: 'locked' },
        'icons': { state: 'locked' },
        'mediaSize': { state: 'locked' },
        'headline': { state: 'locked' },
        'background': { state: 'locked' },
        'bogoDeal': { state: 'locked' }
      },
      lockedBy: 'Midwest Grocery Co.',
      lockedAt: '2026-02-05T16:00:00Z'
    }
  },

  // 10. Constrained coupon amount off
  {
    hash: 'promo-010',
    title: 'Blueberry Muffins 4-Pack',
    description: 'Freshly baked blueberry muffins',
    categoryHash: 'cat-bakery',
    categoryName: 'Bakery',
    deal: { type: 'fixed', price: 5.99, units: 'ea', couponAmountOff: 1.50 },
    loyaltyDeal: { type: null, price: null },
    bogoDeal: { buyQuantity: null, getQuantity: null, getDeal: null, getDealType: null },
    validFrom: '2026-02-10',
    validTo: '2026-02-16',
    dateText: 'Feb 10 – Feb 16',
    promoSize: '300x200',
    height: 200,
    length: 300,
    hidden: false,
    nodeName: 'Midwest Grocery Co.',
    cardStyleHash: 'style-standard',
    upc: '000000078523',
    couponId: 'CPN-BLU-001',
    icons: 'coupon',
    mediaSize: 'medium',
    headline: '$1.50 Off!',
    background: { backgroundColor: '#e3f2fd', backgroundImage: '', position: 'center', size: 'cover', repeat: 'no-repeat' },
    thumbnailPath: null,
    lockConfig: {
      global: 'none',
      attributes: {
        'title': { state: 'locked' },
        'deal.couponAmountOff': { state: 'constrained', min: 0.50, max: 2.00 },
        'couponId': { state: 'locked' }
      },
      lockedBy: 'Midwest Grocery Co.',
      lockedAt: '2026-02-08T12:00:00Z'
    }
  },

  // 11. Partially locked (recipe deal type)
  {
    hash: 'promo-011',
    title: 'Cinnamon Rolls 6-Pack',
    description: 'Warm frosted cinnamon rolls',
    categoryHash: 'cat-bakery',
    categoryName: 'Bakery',
    deal: { type: 'recipe', price: 6.99, units: 'ea', couponAmountOff: null },
    loyaltyDeal: { type: null, price: null },
    bogoDeal: { buyQuantity: null, getQuantity: null, getDeal: null, getDealType: null },
    validFrom: '2026-02-10',
    validTo: '2026-02-16',
    dateText: 'Feb 10 – Feb 16',
    promoSize: '300x300',
    height: 300,
    length: 300,
    hidden: false,
    nodeName: 'Midwest Grocery Co.',
    cardStyleHash: 'style-featured',
    upc: '000000045678',
    couponId: '',
    icons: '',
    mediaSize: 'large',
    headline: 'Weekend Treat!',
    background: { backgroundColor: '#fce4ec', backgroundImage: '', position: 'center', size: 'cover', repeat: 'no-repeat' },
    thumbnailPath: null,
    lockConfig: {
      global: 'none',
      attributes: {
        'title': { state: 'locked' },
        'deal.type': { state: 'locked' },
        'mediaSize': { state: 'locked' },
        'icons': { state: 'locked' }
      },
      lockedBy: 'Midwest Grocery Co.',
      lockedAt: '2026-02-07T09:00:00Z'
    }
  },

  // 12. Partially locked with loyalty constrained
  {
    hash: 'promo-012',
    title: 'French Baguette',
    description: 'Traditional French baguette, baked fresh daily',
    categoryHash: 'cat-bakery',
    categoryName: 'Bakery',
    deal: { type: 'fixed', price: 2.49, units: 'ea', couponAmountOff: null },
    loyaltyDeal: { type: 'fixed', price: 1.99 },
    bogoDeal: { buyQuantity: null, getQuantity: null, getDeal: null, getDealType: null },
    validFrom: '2026-02-10',
    validTo: '2026-02-16',
    dateText: 'Feb 10 – Feb 16',
    promoSize: '200x200',
    height: 200,
    length: 200,
    hidden: false,
    nodeName: 'Midwest Grocery Co.',
    cardStyleHash: 'style-standard',
    upc: '000000056789',
    couponId: '',
    icons: 'loyalty',
    mediaSize: 'small',
    headline: 'Loyalty Special',
    background: { backgroundColor: '#fff8e1', backgroundImage: '', position: 'center', size: 'cover', repeat: 'no-repeat' },
    thumbnailPath: null,
    lockConfig: {
      global: 'none',
      attributes: {
        'deal.price': { state: 'constrained', min: 1.99, max: 3.49 },
        'loyaltyDeal.price': { state: 'constrained', min: 1.49, max: 2.49 },
        'dateRange': { state: 'locked' }
      },
      lockedBy: 'Midwest Grocery Co.',
      lockedAt: '2026-02-08T15:00:00Z'
    }
  }
];
