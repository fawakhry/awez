const fs = require('node:fs');
const assert = require('node:assert/strict');

const source = fs.readFileSync('prototype/accessibility.js', 'utf8');

assert.match(source, /status\.setAttribute\('role', 'status'\)/);
assert.match(source, /status\.setAttribute\('aria-live', 'polite'\)/);
assert.match(source, /var resultsAnnouncementTimer = null/);
assert.match(source, /clearTimeout\(resultsAnnouncementTimer\)/);
assert.match(source, /resultsAnnouncementTimer = setTimeout\(function \(\) \{/);
assert.match(source, /\}, 120\);/);
assert.match(source, /observe\(resultsList, \{ childList: true, subtree: true \}\)/);

console.log('Search result status announcements are polite and debounced.');
