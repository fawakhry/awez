const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const prototypeDir = path.join(root, 'prototype');
const serviceWorkerPath = path.join(prototypeDir, 'service-worker.js');
const source = fs.readFileSync(serviceWorkerPath, 'utf8');

const shellMatch = source.match(/const APP_SHELL = \[([\s\S]*?)\];/);
assert.ok(shellMatch, 'service-worker.js must define APP_SHELL as an array');

const assets = [...shellMatch[1].matchAll(/['"]([^'"]+)['"]/g)]
  .map((match) => match[1]);

assert.ok(assets.length > 0, 'APP_SHELL must contain at least one precached resource');
assert.equal(
  new Set(assets).size,
  assets.length,
  'APP_SHELL must not contain duplicate cache entries'
);

for (const asset of assets) {
  assert.match(asset, /^\.\//, `APP_SHELL entry must stay local to the prototype: ${asset}`);
  assert.doesNotMatch(asset, /[?#]/, `APP_SHELL entry should be a stable file path: ${asset}`);

  const relativePath = asset.slice(2);
  const localPath = relativePath ? path.join(prototypeDir, relativePath) : prototypeDir;
  assert.ok(
    fs.existsSync(localPath),
    `APP_SHELL references ${asset}, but ${path.relative(root, localPath)} does not exist`
  );
}

assert.match(
  source,
  /cache\.addAll\(APP_SHELL\)/,
  'service worker install should precache the validated APP_SHELL list'
);

console.log(`service worker app-shell integrity test passed for ${assets.length} resources`);
