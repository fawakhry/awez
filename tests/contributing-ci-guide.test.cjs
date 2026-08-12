const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const contributing = fs.readFileSync('CONTRIBUTING.md', 'utf8');
const testWorkflow = fs.readFileSync('.github/workflows/test-suite.yml', 'utf8');
const deployWorkflow = fs.readFileSync('.github/workflows/deploy-pages.yml', 'utf8');
const fullTestCommand = 'node --test --test-concurrency=1';

test('contributing guide documents the same full test command used by CI', () => {
  assert.ok(contributing.includes(fullTestCommand));
  assert.ok(testWorkflow.includes(`run: ${fullTestCommand}`));
});

test('contributing guide points contributors to both CI workflows', () => {
  assert.ok(contributing.includes('.github/workflows/test-suite.yml'));
  assert.ok(contributing.includes('.github/workflows/deploy-pages.yml'));
  assert.match(contributing, /Complete test suite/);
  assert.match(contributing, /Test and deploy Aawz prototype/);
  assert.ok(deployWorkflow.includes('name: Test and deploy Aawz prototype'));
});
