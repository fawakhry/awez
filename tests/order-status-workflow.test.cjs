const test = require('node:test');
const assert = require('node:assert/strict');
const {
  TRANSITIONS,
  canTransitionOrderStatus,
  applyOrderStatusTransition
} = require('../prototype/order-status-workflow.js');

test('defines a forward-only fulfillment workflow with terminal states', () => {
  assert.deepEqual(TRANSITIONS.pending, ['preparing', 'cancelled']);
  assert.deepEqual(TRANSITIONS.preparing, ['onway']);
  assert.deepEqual(TRANSITIONS.onway, ['delivered']);
  assert.deepEqual(TRANSITIONS.delivered, []);
  assert.deepEqual(TRANSITIONS.cancelled, []);

  assert.equal(canTransitionOrderStatus('pending', 'preparing'), true);
  assert.equal(canTransitionOrderStatus('preparing', 'onway'), true);
  assert.equal(canTransitionOrderStatus('onway', 'delivered'), true);
  assert.equal(canTransitionOrderStatus('delivered', 'pending'), false);
  assert.equal(canTransitionOrderStatus('cancelled', 'onway'), false);
  assert.equal(canTransitionOrderStatus('pending', 'delivered'), false);
});

test('rejects invalid transitions without mutating the order', () => {
  const orders = [{ id: 'AWZ-100', status: 'delivered' }];
  const result = applyOrderStatusTransition('AWZ-100', 'pending', orders, [], null);

  assert.deepEqual(result, {
    ok: false,
    reason: 'invalid-transition',
    currentStatus: 'delivered',
    nextStatus: 'pending'
  });
  assert.equal(orders[0].status, 'delivered');
  assert.equal(orders[0].statusUpdatedAt, undefined);
});

test('applies valid forward transitions and records the update time', () => {
  const orders = [{ id: 'AWZ-101', status: 'preparing' }];
  const result = applyOrderStatusTransition(
    'AWZ-101',
    'onway',
    orders,
    [],
    null,
    () => '2026-08-11T19:45:00.000Z'
  );

  assert.equal(result.ok, true);
  assert.equal(orders[0].status, 'onway');
  assert.equal(orders[0].statusUpdatedAt, '2026-08-11T19:45:00.000Z');
});

test('routes pending cancellation through the inventory-aware cancellation helper', () => {
  const orders = [{ id: 'AWZ-102', status: 'pending', items: [{ id: 'oil', qty: 2 }] }];
  const products = [{ id: 'oil', stock: 5 }];
  let calls = 0;
  const cancelApi = {
    cancelPendingOrder(orderId, receivedOrders, receivedProducts) {
      calls += 1;
      assert.equal(orderId, 'AWZ-102');
      assert.equal(receivedOrders, orders);
      assert.equal(receivedProducts, products);
      orders[0].status = 'cancelled';
      products[0].stock += 2;
      return { ok: true, order: orders[0] };
    }
  };

  const result = applyOrderStatusTransition(
    'AWZ-102',
    'cancelled',
    orders,
    products,
    cancelApi,
    () => '2026-08-11T19:46:00.000Z'
  );

  assert.equal(result.ok, true);
  assert.equal(calls, 1);
  assert.equal(orders[0].status, 'cancelled');
  assert.equal(products[0].stock, 7);
  assert.equal(orders[0].statusUpdatedAt, '2026-08-11T19:46:00.000Z');
});

test('refuses cancellation when the safe cancellation helper is unavailable', () => {
  const orders = [{ id: 'AWZ-103', status: 'pending' }];
  const result = applyOrderStatusTransition('AWZ-103', 'cancelled', orders, [], null);

  assert.deepEqual(result, { ok: false, reason: 'cancellation-unavailable' });
  assert.equal(orders[0].status, 'pending');
});
