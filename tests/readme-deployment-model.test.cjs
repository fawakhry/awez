const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
const deployWorkflow = fs.readFileSync(path.join(root, '.github/workflows/deploy-pages.yml'), 'utf8');

test('README documents that GitHub Pages is built from the raw prototype', () => {
  assert.match(readme, /prototype\/index\.html[^\n]+المصدر الخام/);
  assert.match(readme, /\.github\/workflows\/deploy-pages\.yml/);
  assert.match(readme, /يُحقن عبر `deploy-pages\.yml`/);
});

test('documented deployment transformations still exist in the workflow', () => {
  assert.match(deployWorkflow, /sed -i[^\n]+<script src=/);
  assert.match(deployWorkflow, /Add web app manifest/);
  assert.match(deployWorkflow, /Add referrer privacy policy/);
  assert.match(deployWorkflow, /Remove blocking Pannellum assets/);
});
