const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { shouldNotifyUpdate } = require('../prototype/service-worker-update.js');
const { removeProductSnapshot, restoreProductSnapshot } = require('../prototype/product-delete-undo.js');

assert.equal(shouldNotifyUpdate(true, false), true, 'existing controlled pages should receive an update notice');
assert.equal(shouldNotifyUpdate(false, false), false, 'first service worker activation should not look like an app update');
assert.equal(shouldNotifyUpdate(true, true), false, 'reload already in progress should not show another notice');

const source = fs.readFileSync(path.join(__dirname, '../prototype/service-worker-update.js'), 'utf8');
assert.match(source, /controllerchange/, 'must listen for service worker controller changes');
assert.match(source, /تحديث الآن/, 'must provide an explicit update action');
assert.match(source, /role', 'status'/, 'update notice must be announced accessibly');
assert.match(source, /window\.location\.reload\(\)/, 'update action must reload the current page');

const products = [{ id: 'oil', name: 'زيت' }, { id: 'rice', name: 'أرز' }];
const cart = { oil: 2 };
const snapshot = removeProductSnapshot(products, cart, 'oil');
assert.equal(snapshot.index, 0, 'snapshot must preserve the original product position');
assert.equal(snapshot.cartQuantity, 2, 'snapshot must preserve the removed cart quantity');
products.splice(snapshot.index, 1);
delete cart.oil;
assert.equal(restoreProductSnapshot(products, cart, snapshot), true, 'deleted product should be restorable');
assert.deepEqual(products.map((product) => product.id), ['oil', 'rice'], 'restored product should return to its original position');
assert.equal(cart.oil, 2, 'restored product should recover its previous cart quantity');
assert.equal(restoreProductSnapshot(products, cart, snapshot), false, 'restore must not duplicate an existing product');

const undoSource = fs.readFileSync(path.join(__dirname, '../prototype/product-delete-undo.js'), 'utf8');
assert.match(undoSource, /تراجع/, 'the merchant must receive an explicit undo action');
assert.match(undoSource, /aria-live', 'polite'/, 'undo notice must be announced accessibly');
assert.match(undoSource, /8000/, 'undo action must remain available for a limited period');

console.log('Service worker update and product delete undo tests passed');
