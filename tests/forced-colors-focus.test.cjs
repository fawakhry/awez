const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const css = fs.readFileSync(path.join(__dirname, '..', 'prototype', 'focus-visible.css'), 'utf8');

test('focus indicators remain visible in forced-colors mode', () => {
  assert.match(css, /@media\s*\(forced-colors:\s*active\)/);
  assert.match(css, /:focus-visible\s*\{[^}]*outline-color:\s*Highlight;/s);
  assert.match(css, /\[aria-current="page"\][^{]*\{[^}]*box-shadow:\s*none;[^}]*outline:\s*2px\s+solid\s+Highlight;/s);
});
