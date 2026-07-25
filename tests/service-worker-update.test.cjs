const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { shouldNotifyUpdate } = require('../prototype/service-worker-update.js');

assert.equal(shouldNotifyUpdate(true, false), true, 'existing controlled pages should receive an update notice');
assert.equal(shouldNotifyUpdate(false, false), false, 'first service worker activation should not look like an app update');
assert.equal(shouldNotifyUpdate(true, true), false, 'reload already in progress should not show another notice');

const source = fs.readFileSync(path.join(__dirname, '../prototype/service-worker-update.js'), 'utf8');
assert.match(source, /controllerchange/, 'must listen for service worker controller changes');
assert.match(source, /تحديث الآن/, 'must provide an explicit update action');
assert.match(source, /role', 'status'/, 'update notice must be announced accessibly');
assert.match(source, /window\.location\.reload\(\)/, 'update action must reload the current page');

console.log('Service worker update tests passed');
