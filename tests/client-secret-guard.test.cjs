const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', 'prototype');
const TEXT_EXTENSIONS = new Set(['.html', '.js', '.css', '.json', '.webmanifest', '.svg', '.txt']);

const SECRET_PATTERNS = [
  ['GitHub personal access token', /\bgh[pousr]_[A-Za-z0-9]{20,}\b/g],
  ['GitHub fine-grained token', /\bgithub_pat_[A-Za-z0-9_]{20,}\b/g],
  ['OpenAI API key', /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/g],
  ['AWS access key', /\bAKIA[0-9A-Z]{16}\b/g],
  ['Stripe live secret key', /\bsk_live_[A-Za-z0-9]{16,}\b/g],
  ['Google API key', /\bAIza[0-9A-Za-z_-]{30,}\b/g],
  ['Private key block', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g],
  ['Credential embedded in URL', /https?:\/\/[^\s/:]+:[^\s/@]+@/g]
];

function collectTextFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...collectTextFiles(absolute));
    else if (TEXT_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) files.push(absolute);
  }
  return files;
}

test('deployed prototype does not contain common high-confidence secret formats', () => {
  const findings = [];

  for (const file of collectTextFiles(ROOT)) {
    const source = fs.readFileSync(file, 'utf8');
    for (const [label, pattern] of SECRET_PATTERNS) {
      pattern.lastIndex = 0;
      if (pattern.test(source)) {
        findings.push(`${path.relative(ROOT, file)}: ${label}`);
      }
    }
  }

  assert.deepEqual(
    findings,
    [],
    `Potential client-side secrets found in deployable files:\n${findings.join('\n')}`
  );
});
