const assert = require('node:assert/strict');
const { enhanceSearchLandmark } = require('../prototype/search-landmark.js');

function element() {
  const attributes = new Map();
  return {
    value: '',
    setAttribute(name, value) {
      attributes.set(name, String(value));
    },
    getAttribute(name) {
      return attributes.has(name) ? attributes.get(name) : null;
    },
    addEventListener() {}
  };
}

const searchBox = element();
const searchInput = element();
const resultsHeading = element();
const documentStub = {
  querySelector(selector) {
    if (selector === '.search-box') return searchBox;
    if (selector === '#searchInput') return searchInput;
    if (selector === '#results .section-head h2') return resultsHeading;
    return null;
  }
};
const rootStub = { doSearch() {} };

assert.equal(enhanceSearchLandmark(documentStub, rootStub), true);
assert.equal(resultsHeading.getAttribute('aria-live'), 'polite');
assert.equal(resultsHeading.getAttribute('aria-atomic'), 'true');
assert.equal(resultsHeading.getAttribute('role'), null, 'keep the native h2 heading semantics');

console.log('Search results heading live-region accessibility test passed.');
