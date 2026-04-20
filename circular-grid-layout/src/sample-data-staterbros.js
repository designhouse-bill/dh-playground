// Stater Bros weekly ad — synthetic but realistic. Category sizes calibrated
// from typical SoCal grocery circular structure (meat + produce heavy, long tail).
// P = promo count per category. emphasis: 2 on first category preserves
// featured-3 / hero signature pattern from POC.

export const staterBros = {
  brand: 'Stater Bros',
  week: '2026-04-15 → 2026-04-21',
  categories: [
    { id: 'digital-coupons', name: 'Digital Coupons', P: 6, emphasis: 0, isCouponCategory: true },
    { id: 'meat-hero', name: 'Meat & Seafood', P: 18, emphasis: 2 },
    { id: 'produce', name: 'Fresh Produce', P: 14, emphasis: 0 },
    { id: 'dairy', name: 'Dairy', P: 9, emphasis: 0 },
    { id: 'beverages', name: 'Beverages', P: 11, emphasis: 0 },
    { id: 'snacks', name: 'Snacks & Candy', P: 12, emphasis: 0 },
    { id: 'frozen', name: 'Frozen Foods', P: 10, emphasis: 0 },
    { id: 'deli-bakery', name: 'Deli & Bakery', P: 7, emphasis: 0 },
    { id: 'grocery', name: 'Grocery', P: 15, emphasis: 0 },
    { id: 'pet', name: 'Pet Care', P: 5, emphasis: 0 },
    { id: 'hba', name: 'Health & Beauty', P: 6, emphasis: 0 },
    { id: 'household', name: 'Household', P: 6, emphasis: 0 },
  ],
};

// Flattened promo stream — one placeholder per P slot. Real integration replaces
// with actual promo records (image, title, price, discount).
export function generatePromos(categories) {
  const promos = [];
  for (const cat of categories) {
    for (let i = 1; i <= cat.P; i++) {
      promos.push({
        categoryId: cat.id,
        index: i,
        title: `${cat.name} Item ${i}`,
        price: `$${(2 + Math.random() * 8).toFixed(2)}`,
      });
    }
  }
  return promos;
}
