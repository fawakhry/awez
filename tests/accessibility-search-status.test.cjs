const fs = require('node:fs');
const assert = require('node:assert/strict');

const source = fs.readFileSync('prototype/accessibility.js', 'utf8');

assert.match(source, /status\.setAttribute\('role', 'status'\)/);
assert.match(source, /status\.setAttribute\('aria-live', 'polite'\)/);
assert.match(source, /var voiceSearchButton = document\.querySelector\('button\[onclick="voiceSearch\(\)"\]'\)/);
assert.match(source, /voiceSearchButton\.setAttribute\('aria-label', 'بدء البحث الصوتي'\)/);
assert.match(source, /voiceSearchButton\.setAttribute\('title', 'بحث صوتي'\)/);
assert.match(source, /var resultsAnnouncementTimer = null/);
assert.match(source, /clearTimeout\(resultsAnnouncementTimer\)/);
assert.match(source, /resultsAnnouncementTimer = setTimeout\(function \(\) \{/);
assert.match(source, /\}, 120\);/);
assert.match(source, /observe\(resultsList, \{ childList: true, subtree: true \}\)/);

console.log('Accessibility status messaging and voice search labelling are configured.');
