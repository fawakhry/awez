const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  PANNELLUM_CSS,
  PANNELLUM_JS,
  needsPanoramaLibrary
} = require('../prototype/lazy-panorama.js');

assert.equal(needsPanoramaLibrary({}), true);
assert.equal(needsPanoramaLibrary({ pannellum: {} }), false);
assert.match(PANNELLUM_CSS, /^https:\/\//);
assert.match(PANNELLUM_JS, /^https:\/\//);

const workflow = fs.readFileSync(
  path.join(__dirname, '..', '.github', 'workflows', 'deploy-pages.yml'),
  'utf8'
);
assert.match(workflow, /Test lazy panorama loading/);
assert.match(workflow, /Remove blocking Pannellum assets/);
assert.match(workflow, /lazy-panorama\.js/);

console.log('Lazy panorama tests passed');
