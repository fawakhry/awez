const assert = require('node:assert/strict');
const { DEFAULT_THRESHOLD, getLowStockProducts, summarizeLowStock, buildLowStockEditLabel } = require('../prototype/low-stock-alert.js');

assert.equal(DEFAULT_THRESHOLD, 5);

const products = [
  { id: 'high', name: 'زيت', stock: 12, active: true },
  { id: 'five', name: 'أرز', stock: 5, active: true },
  { id: 'zero', name: 'لبن', stock: 0, active: true },
  { id: 'inactive', name: 'سكر', stock: 1, active: false },
  { id: 'text', name: 'مكرونة', stock: '3', active: true }
];

const lowStock = getLowStockProducts(products);
assert.deepEqual(
  lowStock.map(({ id, stock }) => ({ id, stock })),
  [
    { id: 'zero', stock: 0 },
    { id: 'text', stock: 3 },
    { id: 'five', stock: 5 }
  ]
);

assert.deepEqual(summarizeLowStock(lowStock), { total: 3, outOfStock: 1, lowOnly: 2 });
assert.deepEqual(summarizeLowStock([]), { total: 0, outOfStock: 0, lowOnly: 0 });
assert.deepEqual(summarizeLowStock(null), { total: 0, outOfStock: 0, lowOnly: 0 });
assert.deepEqual(getLowStockProducts(products, 2).map((product) => product.id), ['zero']);
assert.deepEqual(getLowStockProducts(null), []);
assert.equal(getLowStockProducts([{ id: 'negative', stock: -4, active: true }])[0].stock, 0);
assert.equal(buildLowStockEditLabel({ name: 'لبن' }), 'تعديل مخزون لبن');
assert.equal(buildLowStockEditLabel({ name: '   ' }), 'تعديل مخزون المنتج');
assert.equal(buildLowStockEditLabel(null), 'تعديل مخزون المنتج');

console.log('low stock alert tests passed');
