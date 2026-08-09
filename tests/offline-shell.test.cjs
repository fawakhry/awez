const assert = require('node:assert/strict');
const fs = require('node:fs');

const sw = fs.readFileSync('prototype/service-worker.js', 'utf8');
const registration = fs.readFileSync('prototype/register-service-worker.js', 'utf8');
const workflow = fs.readFileSync('.github/workflows/deploy-pages.yml', 'utf8');

assert.match(sw, /const CACHE_NAME = 'aawz-shell-v\d+'/);
assert.match(sw, /cache\.addAll\(APP_SHELL\)/);
assert.match(sw, /event\.request\.mode === 'navigate'/);
assert.match(sw, /catch\(\(\) => caches\.match\('\.\/index\.html'\)\)/);
assert.match(sw, /keys\.filter\(\(key\) => key\.startsWith\('aawz-shell-'\)/);
assert.match(registration, /serviceWorker\.register\('\.\/service-worker\.js'/);
assert.match(registration, /updateViaCache: 'none'/);

const deployedScripts = [...workflow.matchAll(/<script src="\.\/([^"?]+\.js)"><\/script>/g)]
  .map((match) => `./${match[1]}`);
assert.ok(deployedScripts.length > 0, 'Expected deployed enhancement scripts in Pages workflow');
for (const script of deployedScripts) {
  assert.ok(sw.includes(`'${script}'`), `${script} must be precached for offline use`);
}

console.log('Offline app shell tests passed');
