const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'prototype', '404.html'), 'utf8');

assert.match(html, /<html\s+lang="ar"\s+dir="rtl">/i, '404 page must declare Arabic RTL');
assert.match(html, /<title>[^<]*عاوز[^<]*<\/title>/i, '404 page must have an Aawz title');
assert.match(html, /<main\b[^>]*aria-labelledby="not-found-title"/i, '404 page must expose a labelled main landmark');
assert.match(html, /<h1\s+id="not-found-title">[^<]+<\/h1>/i, '404 page must have a visible labelled heading');
assert.match(html, /<a\s+href="\.\/">[^<]+<\/a>/i, '404 page must link back to the GitHub Pages project root');
assert.doesNotMatch(html, /<script\b/i, '404 page should remain static and dependency-free');

console.log('custom 404 page tests passed');
