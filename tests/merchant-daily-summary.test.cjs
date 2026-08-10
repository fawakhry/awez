const assert = require('node:assert/strict');
const {
  isSameLocalDay,
  getDailyMerchantSummary,
  getLatestActiveOrder,
  getRelativeTimeValue,
  formatRelativeOrderAge
} = require('../prototype/merchant-daily-summary.js');

const now = new Date(2026, 7, 9, 15, 0, 0);

assert.equal(isSameLocalDay(new Date(2026, 7, 9, 0, 1), now), true);
assert.equal(isSameLocalDay(new Date(2026, 7, 8, 23, 59), now), false);
assert.equal(isSameLocalDay('not-a-date', now), false);

const orders = [
  { id: 'today-pending', createdAt: new Date(2026, 7, 9, 9, 0).toISOString(), status: 'pending', total: 100 },
  { id: 'today-preparing', createdAt: new Date(2026, 7, 9, 10, 0).toISOString(), status: 'preparing', total: 120 },
  { id: 'today-delivered', createdAt: new Date(2026, 7, 9, 11, 0).toISOString(), status: 'delivered', total: 150.5 },
  { id: 'today-cancelled', createdAt: new Date(2026, 7, 9, 12, 0).toISOString(), status: 'cancelled', total: 300 },
  { id: 'yesterday-delivered', createdAt: new Date(2026, 7, 8, 12, 0).toISOString(), status: 'delivered', total: 999 }
];

assert.deepEqual(getDailyMerchantSummary(orders, now), {
  total: 4,
  active: 2,
  delivered: 1,
  revenue: 150.5
});

assert.deepEqual(getDailyMerchantSummary(null, now), {
  total: 0,
  active: 0,
  delivered: 0,
  revenue: 0
});

assert.equal(getLatestActiveOrder(orders)?.id, 'today-preparing');
assert.equal(getLatestActiveOrder([
  { id: 'bad-date', createdAt: 'nope', status: 'pending' },
  { id: 'done', createdAt: now.toISOString(), status: 'delivered' }
]), null);
assert.equal(getLatestActiveOrder(null), null);

assert.deepEqual(getRelativeTimeValue(new Date(2026, 7, 9, 14, 30), now), { value: -30, unit: 'minute' });
assert.deepEqual(getRelativeTimeValue(new Date(2026, 7, 9, 12, 0), now), { value: -3, unit: 'hour' });
assert.deepEqual(getRelativeTimeValue(new Date(2026, 7, 7, 15, 0), now), { value: -2, unit: 'day' });
assert.equal(getRelativeTimeValue('bad-date', now), null);
assert.ok(formatRelativeOrderAge(new Date(2026, 7, 9, 14, 30), now).length > 0);

console.log('merchant daily summary tests passed');