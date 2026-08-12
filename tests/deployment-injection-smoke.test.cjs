const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const workflow = fs.readFileSync('.github/workflows/deploy-pages.yml', 'utf8');
const index = fs.readFileSync('prototype/index.html', 'utf8');
const prototypeDir = path.join(__dirname, '..', 'prototype');

assert.match(
  index,
  /<\/head>/,
  'prototype/index.html must keep the exact </head> anchor used by deployment injections'
);
assert.match(
  index,
  /<\/body>/,
  'prototype/index.html must keep the exact </body> anchor used by deployment injections'
);
assert.match(
  workflow,
  /<meta name="referrer" content="no-referrer">/,
  'Pages deployment must apply the no-referrer policy before publishing the app'
);

const injectedAssets = [...workflow.matchAll(/(?:src|href)="\.\/([^"?#]+)"/g)]
  .map((match) => match[1]);

assert.ok(injectedAssets.length > 0, 'Expected local assets injected by the Pages workflow');
assert.ok(
  injectedAssets.includes('product-dialog-accessibility.js'),
  'Pages deployment must include the product dialog accessibility runtime'
);
assert.equal(
  new Set(injectedAssets).size,
  injectedAssets.length,
  'Deployment workflow must not inject the same local asset more than once'
);

for (const asset of injectedAssets) {
  const assetPath = path.join(prototypeDir, asset);
  assert.ok(
    fs.existsSync(assetPath),
    `Deployment workflow injects ./${asset}, but prototype/${asset} does not exist`
  );
}

const headInjections = [...workflow.matchAll(/sed -i 's#<\/head>#.+?<\/head>#' prototype\/index\.html/g)];
const bodyInjections = [...workflow.matchAll(/sed -i 's#<\/body>#.+?<\/body>#' prototype\/index\.html/g)];
assert.ok(headInjections.length > 0, 'Expected at least one deployment injection before </head>');
assert.ok(bodyInjections.length > 0, 'Expected at least one deployment injection before </body>');

console.log(`deployment injection smoke test passed for ${injectedAssets.length} local assets`);
