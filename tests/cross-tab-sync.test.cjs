const assert = require('node:assert/strict');
const { classifyStorageKey, parseStoredValue } = require('../prototype/cross-tab-sync.js');

const keys = {
  products: 'aawz.products.v2',
  cart: 'aawz.cart.v2',
  orders: 'aawz.orders.v2'
};

assert.equal(classifyStorageKey(keys.products, keys), 'products');
assert.equal(classifyStorageKey(keys.cart, keys), 'cart');
assert.equal(classifyStorageKey(keys.orders, keys), 'orders');
assert.equal(classifyStorageKey('unrelated.key', keys), null);
assert.equal(classifyStorageKey(null, keys), null);

assert.deepEqual(parseStoredValue('[{"id":"oil"}]', [], 'array'), [{ id: 'oil' }]);
assert.deepEqual(parseStoredValue('{"oil":2}', {}, 'object'), { oil: 2 });
assert.deepEqual(parseStoredValue('{"wrong":true}', [], 'array'), []);
assert.deepEqual(parseStoredValue('[1,2]', {}, 'object'), {});
assert.deepEqual(parseStoredValue('not-json', ['fallback'], 'array'), ['fallback']);
assert.deepEqual(parseStoredValue(null, { empty: true }, 'object'), { empty: true });

console.log('Cross-tab synchronization tests passed');
