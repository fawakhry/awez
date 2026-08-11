const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const source = fs.readFileSync(
  path.join(__dirname, '..', 'prototype', 'register-service-worker.js'),
  'utf8'
);

test('service worker registration is deferred until browser idle time', () => {
  assert.match(source, /requestIdleCallback\(registerServiceWorker, \{ timeout: 2000 \}\)/);
  assert.match(source, /setTimeout\(registerServiceWorker, 0\)/);
  assert.match(source, /addEventListener\('load', scheduleRegistration, \{ once: true \}\)/);
});

test('service worker registration keeps the existing progressive-enhancement options', () => {
  assert.match(source, /register\('\.\/service-worker\.js', \{ scope: '\.\/', updateViaCache: 'none' \}\)/);
  assert.match(source, /\.catch\(function \(\) \{/);
});
