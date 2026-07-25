const assert = require('node:assert/strict');
const fs = require('node:fs');

const sw = fs.readFileSync('prototype/service-worker.js', 'utf8');
const registration = fs.readFileSync('prototype/register-service-worker.js', 'utf8');

assert.match(sw, /const CACHE_NAME = 'aawz-shell-v\d+'/);
assert.match(sw, /cache\.addAll\(APP_SHELL\)/);
assert.match(sw, /event\.request\.mode === 'navigate'/);
assert.match(sw, /catch\(\(\) => caches\.match\('\.\/index\.html'\)\)/);
assert.match(sw, /keys\.filter\(\(key\) => key\.startsWith\('aawz-shell-'\)/);
assert.match(registration, /serviceWorker\.register\('\.\/service-worker\.js'/);
assert.match(registration, /updateViaCache: 'none'/);

console.log('Offline app shell tests passed');
