const assert = require('node:assert/strict');
const {
  filterOrders,
  normalizeQuery,
  countOrdersByStatus,
  hasActiveFilters,
  summarizeActiveOrders,
  formatCount,
  buildOrderStatusControlLabel,
  labelOrderStatusControls,
  ACTIVE_STATUSES,
  ACTIVE_STATUS_LABELS
} = require('../prototype/merchant-order-filter.js');

const orders = [
  { id: 'A-1', status: 'pending', customer: { name: 'أحمد', phone: '0100', address: 'بنها' }, items: [{ name: 'تيشيرت' }] },
  { id: 'A-2', status: 'preparing', customer: { name: 'محمد', phone: '0111', address: 'القاهرة' }, items: [{ name: 'كوب' }] },
  { id: 'A-3', status: 'pending', customer: { name: 'سارة', phone: '0122', address: 'بنها' }, items: [{ name: 'ميدالية' }] },
  { id: 'A-4', status: 'delivered', customer: { name: 'منى', phone: '0133', address: 'طنطا' }, items: [{ name: 'بوستر' }] },
  { id: 'A-5', status: 'cancelled', customer: { name: 'نور', phone: '0144', address: 'الجيزة' }, items: [{ name: 'كارت' }] },
  { id: 'A-6', status: 'onway', customer: { name: 'عمر', phone: '0155', address: 'بنها' }, items: [{ name: 'هدية' }] }
];

assert.equal(normalizeQuery('أحْمَد'), 'احمد');
assert.deepEqual(filterOrders(orders, 'pending').map((order) => order.id), ['A-1', 'A-3']);
assert.deepEqual(filterOrders(orders, 'all', 'بنها').map((order) => order.id), ['A-1', 'A-3', 'A-6']);
assert.deepEqual(filterOrders(orders, 'all', 'تيشيرت').map((order) => order.id), ['A-1']);

assert.equal(hasActiveFilters(), false);
assert.equal(hasActiveFilters('all', '   '), false);
assert.equal(hasActiveFilters('pending', ''), true);
assert.equal(hasActiveFilters('all', 'أحمد'), true);
assert.equal(hasActiveFilters('not-a-status', ''), false);

assert.deepEqual(countOrdersByStatus(orders), {
  all: 6,
  pending: 2,
  preparing: 1,
  onway: 1,
  delivered: 1,
  cancelled: 1
});

assert.deepEqual(countOrdersByStatus(null), {
  all: 0,
  pending: 0,
  preparing: 0,
  onway: 0,
  delivered: 0,
  cancelled: 0
});

assert.deepEqual(ACTIVE_STATUSES, ['pending', 'preparing', 'onway']);
assert.deepEqual(ACTIVE_STATUS_LABELS, {
  pending: 'جديد',
  preparing: 'جاري التجهيز',
  onway: 'في الطريق'
});
assert.deepEqual(summarizeActiveOrders(orders), {
  pending: 2,
  preparing: 1,
  onway: 1,
  total: 4
});
assert.deepEqual(summarizeActiveOrders(null), {
  pending: 0,
  preparing: 0,
  onway: 0,
  total: 0
});
assert.equal(formatCount(12), new Intl.NumberFormat('ar-EG').format(12));
assert.equal(formatCount('bad'), new Intl.NumberFormat('ar-EG').format(0));

assert.equal(buildOrderStatusControlLabel('AWZ-123'), 'تغيير حالة الطلب AWZ-123');
assert.equal(buildOrderStatusControlLabel('  '), 'تغيير حالة الطلب');

function statusControl() {
  const attrs = new Map();
  return {
    setAttribute(name, value) { attrs.set(name, String(value)); },
    getAttribute(name) { return attrs.get(name) || null; }
  };
}

const firstStatus = statusControl();
const secondStatus = statusControl();
const statusContainer = {
  querySelectorAll(selector) {
    assert.equal(selector, '.order-card select');
    return [firstStatus, secondStatus];
  }
};
assert.equal(
  labelOrderStatusControls(statusContainer, [{ id: 'AWZ-1' }, { id: 'AWZ-2' }]),
  2
);
assert.equal(firstStatus.getAttribute('aria-label'), 'تغيير حالة الطلب AWZ-1');
assert.equal(secondStatus.getAttribute('aria-label'), 'تغيير حالة الطلب AWZ-2');
assert.equal(labelOrderStatusControls(null, orders), 0);

console.log('merchant order filter tests passed');
