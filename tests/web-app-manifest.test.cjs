const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const manifestPath = path.join(root, 'prototype', 'manifest.webmanifest');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

assert.equal(manifest.lang, 'ar');
assert.equal(manifest.dir, 'rtl');
assert.equal(manifest.start_url, './');
assert.equal(manifest.scope, './');
assert.equal(manifest.display, 'standalone');
assert.equal(manifest.prefer_related_applications, false);
assert.ok(manifest.name && manifest.short_name);
assert.match(manifest.theme_color, /^#[0-9a-f]{6}$/i);
assert.match(manifest.background_color, /^#[0-9a-f]{6}$/i);

for (const requiredSize of ['192x192', '512x512']) {
  const icon = manifest.icons.find((item) => item.sizes === requiredSize);
  assert.ok(icon, `missing ${requiredSize} icon`);
  const iconPath = path.join(root, 'prototype', icon.src.replace(/^\.\//, ''));
  assert.ok(fs.existsSync(iconPath), `missing icon file ${icon.src}`);
  assert.match(fs.readFileSync(iconPath, 'utf8'), /^<svg[\s>]/);
}

console.log('Web app manifest tests passed');
