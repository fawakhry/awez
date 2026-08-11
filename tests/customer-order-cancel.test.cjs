const assert = require('node:assert/strict');
const { normalizeOrderId, copyOrderId, cancelPendingOrder } = require('../prototype/customer-order-cancel.js');

assert.equal(normalizeOrderId(' AWZ-1234567 '), 'AWZ-1234567');
assert.equal(normalizeOrderId('1234567'), '');

const products = [
  { id: 'oil', stock: 7 },
  { id: 'rice', stock: 4 }
];
const orders = [{
  id: 'AWZ-100',
  status: 'pending',
  items: [
    { id: 'oil', qty: 2 },
    { id: 'rice', qty: 3 }
  ]
}];

const result = cancelPendingOrder('AWZ-100', orders, products);
assert.equal(result.ok, true);
assert.equal(orders[0].status, 'cancelled');
assert.match(orders[0].cancelledAt, /^\d{4}-\d{2}-\d{2}T/);
assert.equal(products[0].stock, 9);
assert.equal(products[1].stock, 7);

const repeated = cancelPendingOrder('AWZ-100', orders, products);
assert.deepEqual(repeated, { ok: false, reason: 'not-pending' });
assert.equal(products[0].stock, 9, 'repeated cancellation must not restore stock twice');

const deliveredOrders = [{ id: 'AWZ-200', status: 'delivered', items: [{ id: 'oil', qty: 1 }] }];
assert.deepEqual(cancelPendingOrder('AWZ-200', deliveredOrders, products), { ok: false, reason: 'not-pending' });
assert.deepEqual(cancelPendingOrder('AWZ-404', deliveredOrders, products), { ok: false, reason: 'not-found' });

const stockBeforeInvalidCancel = products.map((product) => product.stock);
const invalidOrders = [{
  id: 'AWZ-300',
  status: 'pending',
  items: [
    { id: 'oil', qty: 2 },
    { id: 'rice', qty: -1 }
  ]
}];
assert.deepEqual(
  cancelPendingOrder('AWZ-300', invalidOrders, products),
  { ok: false, reason: 'invalid-items' }
);
assert.deepEqual(products.map((product) => product.stock), stockBeforeInvalidCancel, 'invalid cancellation must not partially restore stock');
assert.equal(invalidOrders[0].status, 'pending');

const missingItemsOrder = [{ id: 'AWZ-301', status: 'pending' }];
assert.deepEqual(
  cancelPendingOrder('AWZ-301', missingItemsOrder, products),
  { ok: false, reason: 'invalid-items' }
);

const stockBeforeInventoryMismatch = products.map((product) => product.stock);
const missingProductOrder = [{
  id: 'AWZ-302',
  status: 'pending',
  items: [
    { id: 'oil', qty: 1 },
    { id: 'missing', qty: 1 }
  ]
}];
assert.deepEqual(
  cancelPendingOrder('AWZ-302', missingProductOrder, products),
  { ok: false, reason: 'inventory-mismatch' }
);
assert.deepEqual(products.map((product) => product.stock), stockBeforeInventoryMismatch, 'missing product must not cause partial restock');
assert.equal(missingProductOrder[0].status, 'pending');

const invalidStockProducts = [
  { id: 'oil', stock: 5 },
  { id: 'rice', stock: 'unknown' }
];
const invalidStockOrder = [{
  id: 'AWZ-303',
  status: 'pending',
  items: [
    { id: 'oil', qty: 1 },
    { id: 'rice', qty: 1 }
  ]
}];
assert.deepEqual(
  cancelPendingOrder('AWZ-303', invalidStockOrder, invalidStockProducts),
  { ok: false, reason: 'inventory-mismatch' }
);
assert.deepEqual(invalidStockProducts, [
  { id: 'oil', stock: 5 },
  { id: 'rice', stock: 'unknown' }
], 'invalid stock must leave every product untouched');
assert.equal(invalidStockOrder[0].status, 'pending');

(async () => {
  let copied = '';
  assert.deepEqual(
    await copyOrderId('AWZ-200', { clipboard: { async writeText(value) { copied = value; } } }),
    { ok: true, orderId: 'AWZ-200' }
  );
  assert.equal(copied, 'AWZ-200');
  assert.deepEqual(
    await copyOrderId('bad', { clipboard: { writeText() {} } }),
    { ok: false, reason: 'invalid-order-id' }
  );
  assert.deepEqual(
    await copyOrderId('AWZ-200', {}),
    { ok: false, reason: 'clipboard-unavailable' }
  );
  assert.deepEqual(
    await copyOrderId('AWZ-200', { clipboard: { async writeText() { throw new Error('denied'); } } }),
    { ok: false, reason: 'clipboard-denied' }
  );

  console.log('customer order cancellation and copy tests passed');
})();
