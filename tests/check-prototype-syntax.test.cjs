const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const assert = require('node:assert/strict');

const prototypeDir = path.join(__dirname, '..', 'prototype');
const javascriptFiles = fs.readdirSync(prototypeDir)
  .filter((name) => name.endsWith('.js'))
  .sort();

assert.ok(javascriptFiles.length > 0, 'prototype should contain JavaScript files');

for (const name of javascriptFiles) {
  const filePath = path.join(prototypeDir, name);
  const result = spawnSync(process.execPath, ['--check', filePath], {
    encoding: 'utf8'
  });

  assert.equal(
    result.status,
    0,
    `${name} must parse successfully\n${result.stderr || result.stdout}`
  );
}

console.log(`syntax check passed for ${javascriptFiles.length} prototype JavaScript files`);
