const assert = require('node:assert/strict');
const { filterOrders, normalizeQuery } = require('../prototype/merchant-order-filter.js');

const orders = [
  { id: 'AWZ-1001', status: 'pending', customer: { name: 'أحمد علي', phone: '01012345678', address: 'بنها' }, items: [{ name: 'زيت خليط' }] },
  { id: 'AWZ-1002', status: 'delivered', customer: { name: 'سارة محمد', phone: '01111111111', address: 'كفر الجزار' }, items: [{ name: 'أرز مصري' }] },
  { id: 'AWZ-1003', status: 'preparing', customer: { name: 'محمود', phone: '01222222222', address: 'الفلل' }, items: [{ name: 'مسحوق غسيل' }] }
];

assert.equal(normalizeQuery('  AHMED   Ali  '), 'ahmed ali');
assert.equal(filterOrders(orders, 'pending').length, 1);
assert.equal(filterOrders(orders, 'delivered')[0].id, 'AWZ-1002');
assert.equal(filterOrders(orders, 'all', '010123').length, 1);
assert.equal(filterOrders(orders, 'all', 'ارز').length, 1);
assert.equal(filterOrders(orders, 'preparing', 'مسحوق').length, 1);
assert.equal(filterOrders(orders, 'invalid-status').length, 3);
assert.deepEqual(filterOrders(null, 'all'), []);

console.log('Merchant order filter tests passed');
