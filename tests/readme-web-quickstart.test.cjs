const assert = require('node:assert/strict');
const fs = require('node:fs');

const readme = fs.readFileSync('README.md', 'utf8');
const testWorkflow = fs.readFileSync('.github/workflows/test-suite.yml', 'utf8');
const fullTestCommand = 'node --test --test-concurrency=1';

assert.match(
  readme,
  /python -m http\.server 8000 --bind 127\.0\.0\.1 --directory prototype/,
  'README should document the local web server command'
);
assert.match(
  readme,
  /http:\/\/127\.0\.0\.1:8000\//,
  'README should document the matching local URL'
);
assert.ok(
  fs.existsSync('prototype/index.html'),
  'README quickstart expects prototype/index.html to exist'
);
assert.match(
  readme,
  /للتطوير المحلي فقط/,
  'README should warn that http.server is for local development only'
);
assert.ok(
  readme.includes(fullTestCommand),
  'README should document the full local test command'
);
assert.ok(
  testWorkflow.includes(`run: ${fullTestCommand}`),
  'documented full test command should stay aligned with GitHub Actions'
);
assert.match(
  readme,
  /node --test tests\/search-landmark\.test\.cjs/,
  'README should show how to run one focused test file'
);

console.log('README local development and test instructions passed');
