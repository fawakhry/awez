const assert = require('node:assert/strict');
const { isSameLocalDay, getDailyMerchantSummary } = require('../prototype/merchant-daily-summary.js');

const now = new Date(2026, 7, 9, 15, 0, 0);

assert.equal(isSameLocalDay(new Date(2026, 7, 9, 0, 1), now), true);
assert.equal(isSameLocalDay(new Date(2026, 7, 8, 23, 59), now), false);
assert.equal(isSameLocalDay('not-a-date', now), false);

const orders = [
  { id: 'today-pending', createdAt: new Date(2026, 7, 9, 9, 0).toISOString(), status: 'pending', total: 100 },
  { id: 'today-preparing', createdAt: new Date(2026, 7, 9, 10, 0).toISOString(), status: 'preparing', total: 120 },
  { id: 'today-delivered', createdAt: new Date(2026, 7, 9, 11, 0).toISOString(), status: 'delivered', total: 150.5 },
  { id: 'today-delivered-2', createdAt: new Date(2026, 7, 9, 11, 30).toISOString(), status: 'delivered', total: 49.5 },
  { id: 'today-cancelled', createdAt: new Date(2026, 7, 9, 12, 0).toISOString(), status: 'cancelled', total: 300 },
  { id: 'yesterday-delivered', createdAt: new Date(2026, 7, 8, 12, 0).toISOString(), status: 'delivered', total: 999 }
];

let iterations = 0;
const trackedOrders = new Proxy(orders, {
  get(target, property, receiver) {
    if (property === Symbol.iterator) {
      return function () {
        iterations += 1;
        return target[Symbol.iterator]();
      };
    }
    return Reflect.get(target, property, receiver);
  }
});

assert.deepEqual(getDailyMerchantSummary(trackedOrders, now), {
  total: 5,
  active: 2,
  delivered: 2,
  revenue: 200,
  averageOrderValue: 100
});
assert.equal(iterations, 1, 'daily summary should scan the orders array only once');

assert.deepEqual(getDailyMerchantSummary([
  { id: 'pending-only', createdAt: new Date(2026, 7, 9, 13, 0).toISOString(), status: 'pending', total: 75 }
], now), {
  total: 1,
  active: 1,
  delivered: 0,
  revenue: 0,
  averageOrderValue: 0
});

assert.deepEqual(getDailyMerchantSummary(null, now), {
  total: 0,
  active: 0,
  delivered: 0,
  revenue: 0,
  averageOrderValue: 0
});

console.log('merchant daily summary tests passed');
