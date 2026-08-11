const assert = require('node:assert/strict');
const {
  ACTIVE_STATUSES,
  STATUS_LABELS,
  summarizeActiveOrders,
  formatCount
} = require('../prototype/merchant-workload-breakdown.js');

assert.deepEqual(ACTIVE_STATUSES, ['pending', 'preparing', 'onway']);
assert.deepEqual(STATUS_LABELS, {
  pending: 'جديد',
  preparing: 'جاري التجهيز',
  onway: 'في الطريق'
});

assert.deepEqual(
  summarizeActiveOrders([
    { status: 'pending' },
    { status: 'pending' },
    { status: 'preparing' },
    { status: 'onway' },
    { status: 'delivered' },
    { status: 'cancelled' },
    { status: 'unknown' },
    null
  ]),
  { pending: 2, preparing: 1, onway: 1, total: 4 }
);

assert.deepEqual(summarizeActiveOrders(null), {
  pending: 0,
  preparing: 0,
  onway: 0,
  total: 0
});

assert.equal(formatCount(0), new Intl.NumberFormat('ar-EG').format(0));
assert.equal(formatCount(12), new Intl.NumberFormat('ar-EG').format(12));
assert.equal(formatCount('bad'), new Intl.NumberFormat('ar-EG').format(0));

console.log('merchant workload breakdown tests passed');
