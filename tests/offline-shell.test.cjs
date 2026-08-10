const assert = require('node:assert/strict');
const fs = require('node:fs');

const sw = fs.readFileSync('prototype/service-worker.js', 'utf8');
const registration = fs.readFileSync('prototype/register-service-worker.js', 'utf8');
const workflow = fs.readFileSync('.github/workflows/deploy-pages.yml', 'utf8');

assert.match(sw, /const CACHE_NAME = 'aawz-shell-v\d+'/);
assert.match(sw, /cache\.addAll\(APP_SHELL\)/);
assert.match(sw, /event\.request\.mode === 'navigate'/);
assert.match(sw, /self\.registration\.navigationPreload/);
assert.match(sw, /navigationPreload\.enable\(\)/);
assert.match(sw, /event\.preloadResponse/);
assert.match(sw, /preloaded \|\| fetch\(event\.request\)/);
assert.match(sw, /catch\(\(\) => caches\.match\('\.\/index\.html'\)\)/);
assert.match(sw, /keys\.filter\(\(key\) => key\.startsWith\('aawz-shell-'\)/);
assert.match(registration, /serviceWorker\.register\('\.\/service-worker\.js'/);
assert.match(registration, /updateViaCache: 'none'/);

const shellMatch = sw.match(/const APP_SHELL = \[([\s\S]*?)\];/);
assert.ok(shellMatch, 'Expected APP_SHELL asset list in service worker');
const shellAssets = [...shellMatch[1].matchAll(/'([^']+)'/g)].map((match) => match[1]);
assert.ok(shellAssets.length > 0, 'Expected at least one APP_SHELL asset');
assert.equal(new Set(shellAssets).size, shellAssets.length, 'APP_SHELL must not contain duplicate assets');
for (const asset of shellAssets) {
  if (asset === './') continue;
  const localPath = `prototype/${asset.replace(/^\.\//, '')}`;
  assert.ok(fs.existsSync(localPath), `${asset} must exist because cache.addAll fails when an app-shell request fails`);
}

const deployedScripts = [...workflow.matchAll(/<script src="\.\/([^"?]+\.js)"><\/script>/g)]
  .map((match) => `./${match[1]}`);
assert.ok(deployedScripts.length > 0, 'Expected deployed enhancement scripts in Pages workflow');
for (const script of deployedScripts) {
  assert.ok(sw.includes(`'${script}'`), `${script} must be precached for offline use`);
}

console.log('Offline app shell asset integrity and navigation preload tests passed');
