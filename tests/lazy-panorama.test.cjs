const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  PANNELLUM_CSS,
  PANNELLUM_JS,
  REFERRER_POLICY,
  needsPanoramaLibrary,
  isStylesheetReady
} = require('../prototype/lazy-panorama.js');

assert.equal(needsPanoramaLibrary({}), true);
assert.equal(needsPanoramaLibrary({ pannellum: {} }), false);
assert.equal(isStylesheetReady(null), false);
assert.equal(isStylesheetReady({ sheet: null }), false);
assert.equal(isStylesheetReady({ sheet: {} }), true);
assert.equal(REFERRER_POLICY, 'no-referrer');
assert.match(PANNELLUM_CSS, /^https:\/\//);
assert.match(PANNELLUM_JS, /^https:\/\//);
assert.match(PANNELLUM_CSS, /pannellum@2\.5\.7\/build\/pannellum\.css$/);
assert.match(PANNELLUM_JS, /pannellum@2\.5\.7\/build\/pannellum\.js$/);
assert.doesNotMatch(PANNELLUM_CSS, /pannellum@2\.5\.6/);
assert.doesNotMatch(PANNELLUM_JS, /pannellum@2\.5\.6/);

const lazyPanoramaSource = fs.readFileSync(
  path.join(__dirname, '..', 'prototype', 'lazy-panorama.js'),
  'utf8'
);
assert.match(lazyPanoramaSource, /Promise\.all\(\[/);
assert.match(lazyPanoramaSource, /appendStylesheet\(document, PANNELLUM_CSS\)/);
assert.match(lazyPanoramaSource, /appendScript\(document, PANNELLUM_JS\)/);
assert.match(lazyPanoramaSource, /link\.referrerPolicy = REFERRER_POLICY/);
assert.match(lazyPanoramaSource, /script\.referrerPolicy = REFERRER_POLICY/);
assert.match(lazyPanoramaSource, /link\.onload = resolve/);
assert.match(lazyPanoramaSource, /link\.onerror = reject/);

const workflow = fs.readFileSync(
  path.join(__dirname, '..', '.github', 'workflows', 'deploy-pages.yml'),
  'utf8'
);
assert.match(workflow, /Test lazy panorama loading/);
assert.match(workflow, /Remove blocking Pannellum assets/);
assert.match(workflow, /lazy-panorama\.js/);

console.log('Lazy panorama tests passed');
