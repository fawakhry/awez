const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { getNetworkMessage, getNetworkState } = require('../prototype/network-status.js');

assert.equal(getNetworkState(false), 'offline');
assert.equal(getNetworkState(true), 'online');
assert.equal(getNetworkState(undefined), 'online');
assert.match(getNetworkMessage(false), /غير متصل/);
assert.match(getNetworkMessage(false), /البيانات المحفوظة/);
assert.match(getNetworkMessage(true), /رجع الاتصال/);

const source = fs.readFileSync(path.join(__dirname, '../prototype/network-status.js'), 'utf8');
assert.match(source, /addEventListener\('offline'/);
assert.match(source, /addEventListener\('online'/);
assert.match(source, /role', 'status'/);
assert.doesNotMatch(source, /disabled\s*=/, 'Network hints must not disable platform features');

console.log('Network status tests passed');
