const fs = require('node:fs');
const assert = require('node:assert/strict');

const runbook = fs.readFileSync('docs/deployment-runbook.md', 'utf8');

assert.match(runbook, /https:\/\/fawakhry\.github\.io\/awez\//);
assert.match(runbook, /\.github\/workflows\/deploy-pages\.yml/);
assert.match(runbook, /github-pages/);
assert.match(runbook, /بعد الدمج/);
assert.match(runbook, /Deploy/);
assert.match(runbook, /جولة 360/);
assert.match(runbook, /الرجوع عند ظهور مشكلة/);
assert.match(runbook, /لا يتم الدمج التلقائي/);
assert.match(runbook, /docs\.github\.com\/en\/rest\/pages\/pages/);

console.log('Deployment runbook contains verification and rollback guidance.');
