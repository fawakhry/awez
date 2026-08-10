const fs = require('node:fs');
const assert = require('node:assert/strict');

const workflow = fs.readFileSync('.github/workflows/deploy-pages.yml', 'utf8');
const actionRefs = [...workflow.matchAll(/^\s*uses:\s*([^\s#]+)(?:\s+#.*)?$/gm)].map((match) => match[1]);

assert.ok(actionRefs.length > 0, 'workflow should use at least one external action');

for (const ref of actionRefs) {
  assert.match(
    ref,
    /^[^/\s]+\/[^@\s]+@[0-9a-f]{40}$/,
    `action must be pinned to a full commit SHA: ${ref}`
  );
}

console.log(`All ${actionRefs.length} GitHub Actions are pinned to full commit SHAs.`);
