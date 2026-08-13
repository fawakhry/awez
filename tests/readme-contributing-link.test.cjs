const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
const contributingPath = path.join(root, 'CONTRIBUTING.md');

test('README links to the repository contribution guide', () => {
  assert.equal(fs.existsSync(contributingPath), true);
  assert.match(readme, /\[إرشادات المساهمة\]\(CONTRIBUTING\.md\)/);
});

test('README points contributors to CI and focused pull requests', () => {
  assert.match(readme, /GitHub Actions/);
  assert.match(readme, /تحسينًا واحدًا فقط/);
});
