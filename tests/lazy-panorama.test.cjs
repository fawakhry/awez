const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  PANNELLUM_CSS,
  PANNELLUM_JS,
  PANNELLUM_ORIGIN,
  REFERRER_POLICY,
  needsPanoramaLibrary,
  isStylesheetReady,
  setPanoramaBusy,
  ensurePreconnect,
  installPanoramaPreconnect
} = require('../prototype/lazy-panorama.js');

assert.equal(needsPanoramaLibrary({}), true);
assert.equal(needsPanoramaLibrary({ pannellum: {} }), false);
assert.equal(isStylesheetReady(null), false);
assert.equal(isStylesheetReady({ sheet: null }), false);
assert.equal(isStylesheetReady({ sheet: {} }), true);
assert.equal(REFERRER_POLICY, 'no-referrer');
assert.equal(PANNELLUM_ORIGIN, 'https://cdn.jsdelivr.net');
assert.match(PANNELLUM_CSS, /^https:\/\//);
assert.match(PANNELLUM_JS, /^https:\/\//);
assert.match(PANNELLUM_CSS, /pannellum@2\.5\.7\/build\/pannellum\.css$/);
assert.match(PANNELLUM_JS, /pannellum@2\.5\.7\/build\/pannellum\.js$/);
assert.doesNotMatch(PANNELLUM_CSS, /pannellum@2\.5\.6/);
assert.doesNotMatch(PANNELLUM_JS, /pannellum@2\.5\.6/);

const busyState = { value: null };
const busyDocument = {
  getElementById(id) {
    if (id !== 'panorama') return null;
    return {
      setAttribute(name, value) {
        if (name === 'aria-busy') busyState.value = value;
      }
    };
  }
};
assert.equal(setPanoramaBusy(busyDocument, true), true);
assert.equal(busyState.value, 'true');
assert.equal(setPanoramaBusy(busyDocument, false), true);
assert.equal(busyState.value, 'false');
assert.equal(setPanoramaBusy(null, true), false);
assert.equal(setPanoramaBusy({ getElementById() { return null; } }, true), false);

let preconnectLink = null;
const appended = [];
const listeners = {};
const tourButton = {
  addEventListener(type, listener, options) {
    listeners[type] = { listener, options };
  }
};
const fakeDocument = {
  head: {
    appendChild(element) {
      appended.push(element);
      if (element.rel === 'preconnect') preconnectLink = element;
    }
  },
  createElement(tagName) {
    return { tagName };
  },
  querySelector(selector) {
    if (selector === '[onclick="goTour()"]') return tourButton;
    if (selector.startsWith('link[rel="preconnect"]')) return preconnectLink;
    return null;
  }
};

assert.equal(installPanoramaPreconnect(fakeDocument), true);
assert.equal(listeners.pointerenter.options.once, true);
assert.equal(listeners.focus.options.once, true);
listeners.pointerenter.listener();
assert.equal(appended.length, 1);
assert.equal(preconnectLink.rel, 'preconnect');
assert.equal(preconnectLink.href, PANNELLUM_ORIGIN);
assert.equal(preconnectLink.referrerPolicy, REFERRER_POLICY);
assert.equal(ensurePreconnect(fakeDocument), preconnectLink);
listeners.focus.listener();
assert.equal(appended.length, 1);

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
assert.match(lazyPanoramaSource, /trigger\.addEventListener\('pointerenter'/);
assert.match(lazyPanoramaSource, /trigger\.addEventListener\('focus'/);
assert.match(lazyPanoramaSource, /setPanoramaBusy\(document, true\)/);
assert.match(lazyPanoramaSource, /finally\s*\{\s*setPanoramaBusy\(document, false\)/);

const workflow = fs.readFileSync(
  path.join(__dirname, '..', '.github', 'workflows', 'deploy-pages.yml'),
  'utf8'
);
assert.match(workflow, /Test lazy panorama loading/);
assert.match(workflow, /Remove blocking Pannellum assets/);
assert.match(workflow, /lazy-panorama\.js/);

console.log('Lazy panorama tests passed');
