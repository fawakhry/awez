const fs = require('node:fs');
const assert = require('node:assert/strict');

const html = fs.readFileSync('prototype/index.html', 'utf8');
const staticMarkup = html.replace(/<script\b[\s\S]*?<\/script>/gi, '');
const ids = [...staticMarkup.matchAll(/\bid\s*=\s*(["'])(.*?)\1/gi)]
  .map((match) => match[2]);

assert.ok(ids.length > 0, 'prototype/index.html should contain static element ids');

const invalidIds = ids.filter((id) => !id || /\s/.test(id));
assert.deepEqual(
  invalidIds,
  [],
  `HTML id values must be non-empty and contain no whitespace: ${invalidIds.join(', ')}`
);

const seen = new Set();
const duplicates = new Set();

for (const id of ids) {
  if (seen.has(id)) duplicates.add(id);
  seen.add(id);
}

assert.deepEqual(
  [...duplicates],
  [],
  `prototype/index.html contains duplicate static ids: ${[...duplicates].join(', ')}`
);

console.log(`HTML id integrity check passed for ${ids.length} static ids`);
