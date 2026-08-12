const assert = require('node:assert/strict');
const {
  filterOrders,
  hasActiveFilters,
  normalizeWorkloadStatus
} = require('../prototype/merchant-order-filter.js');

const orders = [
  { id: 'A-1', status: 'pending', customer: { name: 'أحمد' } },
  { id: 'A-2', status: 'preparing', customer: { name: 'محمد' } },
  { id: 'A-3', status: 'onway', customer: { name: 'سارة' } },
  { id: 'A-4', status: 'delivered', customer: { name: 'منى' } },
  { id: 'A-5', status: 'cancelled', customer: { name: 'نور' } }
];

assert.deepEqual(
  filterOrders(orders, 'active').map((order) => order.id),
  ['A-1', 'A-2', 'A-3']
);
assert.deepEqual(
  filterOrders(orders, 'active', 'محمد').map((order) => order.id),
  ['A-2']
);
assert.equal(hasActiveFilters('active', ''), true);
assert.equal(normalizeWorkloadStatus('active'), 'active');

console.log('active orders filter tests passed');
