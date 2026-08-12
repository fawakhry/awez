const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const prototypeDir = path.join(root, 'prototype');
const indexPath = path.join(prototypeDir, 'index.html');

function collectLocalAssets(html) {
  const assets = [];
  const tagPattern = /<(?:script|link)\b[^>]*?\b(?:src|href)=["']([^"']+)["'][^>]*>/gi;

  for (const match of html.matchAll(tagPattern)) {
    const raw = match[1].trim();
    if (!raw || /^(?:https?:)?\/\//i.test(raw) || /^(?:data|mailto|tel|javascript):/i.test(raw) || raw.startsWith('#')) {
      continue;
    }

    const stablePath = raw.split(/[?#]/, 1)[0];
    if (stablePath) assets.push(stablePath);
  }

  return assets;
}

test('index.html local script and link assets exist inside prototype', () => {
  const html = fs.readFileSync(indexPath, 'utf8');
  const assets = collectLocalAssets(html);

  assert.ok(assets.length > 0, 'index.html should reference at least one local script or link asset');

  for (const asset of assets) {
    const relativeAsset = asset.replace(/^\.\//, '').replace(/^\//, '');
    const resolved = path.resolve(prototypeDir, relativeAsset);
    const prototypeRoot = `${path.resolve(prototypeDir)}${path.sep}`;

    assert.ok(
      resolved.startsWith(prototypeRoot),
      `local asset must stay inside prototype/: ${asset}`
    );
    assert.ok(
      fs.existsSync(resolved),
      `index.html references ${asset}, but ${path.relative(root, resolved)} does not exist`
    );
    assert.ok(
      fs.statSync(resolved).isFile(),
      `index.html local asset must resolve to a file: ${asset}`
    );
  }
});
