// Winn Dixie weekly ad — synthetic dataset sized to match 630-store density
// benchmarks from memory/topics/ux864-print-template-dc2-research.md:
// strict col=2:32pg, col=3:18pg, col=4:27pg, col=5:19pg, col=6:17pg.
// Total P across categories ~130-140 promos matches that page-count envelope.

export const winnDixie = {
  brand: 'Winn Dixie',
  week: '2026-04-15 → 2026-04-21',
  categories: [
    { id: 'bogo-feature', name: 'Weekly BOGO', P: 8, emphasis: 2 },
    { id: 'digital-coupons', name: 'Digital Coupons', P: 7, emphasis: 0, isCouponCategory: true },
    { id: 'meat', name: 'Meat', P: 16, emphasis: 0 },
    { id: 'produce', name: 'Produce', P: 13, emphasis: 0 },
    { id: 'seafood', name: 'Seafood', P: 6, emphasis: 0 },
    { id: 'deli', name: 'Deli', P: 7, emphasis: 0 },
    { id: 'bakery', name: 'Bakery', P: 6, emphasis: 0 },
    { id: 'dairy', name: 'Dairy & Eggs', P: 11, emphasis: 0 },
    { id: 'frozen', name: 'Frozen', P: 12, emphasis: 0 },
    { id: 'grocery', name: 'Grocery', P: 18, emphasis: 0 },
    { id: 'beverages', name: 'Beverages', P: 13, emphasis: 0 },
    { id: 'snacks', name: 'Snacks', P: 9, emphasis: 0 },
    { id: 'pet', name: 'Pet', P: 5, emphasis: 0 },
    { id: 'hba', name: 'Health & Beauty', P: 6, emphasis: 0 },
    { id: 'household', name: 'Household Essentials', P: 7, emphasis: 0 },
  ],
};

export function generatePromos(categories) {
  const promos = [];
  for (const cat of categories) {
    for (let i = 1; i <= cat.P; i++) {
      promos.push({
        categoryId: cat.id,
        index: i,
        title: `${cat.name} Item ${i}`,
        price: `$${(1 + Math.random() * 10).toFixed(2)}`,
      });
    }
  }
  return promos;
}
