const fs = require('node:fs');
const assert = require('node:assert/strict');

const source = fs.readFileSync('prototype/accessibility.js', 'utf8');

assert.match(source, /var mainContent = document\.querySelector\('main'\)/);
assert.match(source, /skipLink\.id = 'skipToContent'/);
assert.match(source, /skipLink\.href = '#' \+ mainContent\.id/);
assert.match(source, /skipLink\.textContent = 'تخطي إلى المحتوى'/);
assert.match(source, /document\.body\.insertBefore\(skipLink, document\.body\.firstChild\)/);
assert.match(source, /skipLink\.addEventListener\('focus'/);
assert.match(source, /skipLink\.addEventListener\('blur'/);
assert.match(source, /status\.setAttribute\('role', 'status'\)/);
assert.match(source, /status\.setAttribute\('aria-live', 'polite'\)/);
assert.match(source, /var voiceSearchButton = document\.querySelector\('button\[onclick="voiceSearch\(\)"\]'\)/);
assert.match(source, /voiceSearchButton\.setAttribute\('aria-label', 'بدء البحث الصوتي'\)/);
assert.match(source, /voiceSearchButton\.setAttribute\('title', 'بحث صوتي'\)/);
assert.match(source, /var merchantPassword = document\.querySelector\('#loginForm input\[name="password"\]'\)/);
assert.match(source, /passwordToggle\.type = 'button'/);
assert.match(source, /passwordToggle\.setAttribute\('aria-pressed', 'false'\)/);
assert.match(source, /merchantPassword\.type = showing \? 'password' : 'text'/);
assert.match(source, /passwordToggle\.textContent = showing \? 'إظهار كلمة المرور' : 'إخفاء كلمة المرور'/);
assert.match(source, /merchantPassword\.insertAdjacentElement\('afterend', passwordToggle\)/);
assert.match(source, /function enhanceStoreCards\(container\)/);
assert.match(source, /container\.querySelectorAll\('\.store-card'\)/);
assert.match(source, /card\.setAttribute\('role', 'button'\)/);
assert.match(source, /card\.setAttribute\('tabindex', '0'\)/);
assert.match(source, /card\.addEventListener\('keydown'/);
assert.match(source, /event\.key !== 'Enter' && event\.key !== ' '/);
assert.match(source, /event\.preventDefault\(\)/);
assert.match(source, /card\.click\(\)/);
assert.match(source, /enhanceStoreCards\(resultsList\)/);
assert.match(source, /var resultsAnnouncementTimer = null/);
assert.match(source, /clearTimeout\(resultsAnnouncementTimer\)/);
assert.match(source, /resultsAnnouncementTimer = setTimeout\(function \(\) \{/);
assert.match(source, /\}, 120\);/);
assert.match(source, /observe\(resultsList, \{ childList: true, subtree: true \}\)/);

console.log('Accessibility skip link, status messaging, voice search labelling, password visibility, and keyboard-accessible store cards are configured.');
