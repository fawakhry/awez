const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'prototype', 'reduced-motion.css'), 'utf8');
const workflow = fs.readFileSync(path.join(root, '.github', 'workflows', 'deploy-pages.yml'), 'utf8');

assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
assert.match(css, /scroll-behavior:\s*auto\s*!important/);
assert.match(css, /animation-duration:\s*0\.01ms\s*!important/);
assert.match(css, /transition-duration:\s*0\.01ms\s*!important/);
assert.match(css, /\.hero-logo[\s\S]*transform:\s*none\s*!important/);
assert.match(workflow, /Test reduced motion support[\s\S]*node tests\/reduced-motion\.test\.cjs/);
assert.match(workflow, /Add reduced motion stylesheet[\s\S]*reduced-motion\.css/);

console.log('Reduced motion tests passed');
