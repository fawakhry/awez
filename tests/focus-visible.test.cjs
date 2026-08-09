const assert = require('node:assert/strict');
const fs = require('node:fs');

const css = fs.readFileSync('prototype/focus-visible.css', 'utf8');
const workflow = fs.readFileSync('.github/workflows/deploy-pages.yml', 'utf8');
const sw = fs.readFileSync('prototype/service-worker.js', 'utf8');

assert.match(css, /:focus-visible/);
assert.match(css, /outline:\s*3px\s+solid/);
assert.match(css, /outline-offset:\s*3px/);
assert.match(css, /button/);
assert.match(css, /input/);
assert.match(css, /select/);
assert.match(css, /textarea/);
assert.match(workflow, /focus-visible\.css/);
assert.ok(sw.includes("'./focus-visible.css'"), 'focus stylesheet must be precached for offline use');

console.log('Visible keyboard focus tests passed');
