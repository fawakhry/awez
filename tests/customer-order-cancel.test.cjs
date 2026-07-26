const assert = require('node:assert/strict');
const { cancelPendingOrder } = require('../prototype/customer-order-cancel.js');

const products = [
  { id: 'oil', stock: 7 },
  { id: 'rice', stock: 4 }
];
const orders = [{
  id: 'AWZ-100',
  status: 'pending',
  items: [
    { id: 'oil', qty: 2 },
    { id: 'rice', qty: 3 },
    { id: 'missing', qty: 1 }
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

console.log('customer order cancellation tests passed');
