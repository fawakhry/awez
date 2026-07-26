const fs = require('node:fs');
const assert = require('node:assert/strict');

const workflow = fs.readFileSync('.github/workflows/deploy-pages.yml', 'utf8');

assert.match(
  workflow,
  /^permissions:\n  contents: read$/m,
  'workflow-level permissions should only allow repository contents read access'
);

const topLevelPermissions = workflow.match(/^permissions:\n((?:  .+\n)+)/m)?.[1] ?? '';
assert.doesNotMatch(topLevelPermissions, /pages:\s*write/);
assert.doesNotMatch(topLevelPermissions, /id-token:\s*write/);

const deployJob = workflow.match(/^  deploy:\n([\s\S]*?)(?=^  [a-zA-Z0-9_-]+:\n|\z)/m)?.[1] ?? '';
assert.match(deployJob, /^    permissions:\n      contents: read\n      pages: write\n      id-token: write$/m);

console.log('Workflow permissions are scoped to least privilege.');
