const assert = require('node:assert/strict');
const { filterOrdersWithCounts } = require('../prototype/merchant-order-filter.js');

const source = [
  { id: 'A-1', status: 'pending', customer: { name: 'أحمد', address: 'بنها' }, items: [{ name: 'زيت' }] },
  { id: 'A-2', status: 'preparing', customer: { name: 'سارة', address: 'القاهرة' }, items: [{ name: 'رز' }] },
  { id: 'A-3', status: 'delivered', customer: { name: 'منى', address: 'بنها' }, items: [{ name: 'سكر' }] },
  { id: 'A-4', status: 'cancelled', customer: { name: 'عمر', address: 'طنطا' }, items: [{ name: 'شاي' }] }
];

let iteratorReads = 0;
const trackedOrders = new Proxy(source, {
  get(target, property, receiver) {
    if (property === Symbol.iterator) iteratorReads += 1;
    return Reflect.get(target, property, receiver);
  }
});

const result = filterOrdersWithCounts(trackedOrders, 'active', 'بنها');

assert.equal(iteratorReads, 1, 'يجب اجتياز قائمة الطلبات مرة واحدة فقط');
assert.deepEqual(result.visibleOrders.map((order) => order.id), ['A-1']);
assert.deepEqual(result.counts, {
  all: 4,
  pending: 1,
  preparing: 1,
  onway: 0,
  delivered: 1,
  cancelled: 1
});

const empty = filterOrdersWithCounts(null, 'pending', 'test');
assert.deepEqual(empty.visibleOrders, []);
assert.deepEqual(empty.counts, {
  all: 0,
  pending: 0,
  preparing: 0,
  onway: 0,
  delivered: 0,
  cancelled: 0
});

console.log('merchant order single-pass tests passed');
