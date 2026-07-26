const assert = require('node:assert/strict');
const { enhanceSearchLandmark } = require('../prototype/search-landmark.js');

function element() {
  const attributes = new Map();
  return {
    setAttribute(name, value) {
      attributes.set(name, String(value));
    },
    getAttribute(name) {
      return attributes.has(name) ? attributes.get(name) : null;
    }
  };
}

const searchBox = element();
const searchInput = element();
const documentStub = {
  querySelector(selector) {
    if (selector === '.search-box') return searchBox;
    if (selector === '#searchInput') return searchInput;
    return null;
  }
};

assert.equal(enhanceSearchLandmark(documentStub), true);
assert.equal(searchBox.getAttribute('role'), 'search');
assert.equal(searchBox.getAttribute('aria-label'), 'البحث في المحلات والمنتجات');
assert.equal(searchInput.getAttribute('type'), 'search');
assert.equal(searchInput.getAttribute('name'), 'q');
assert.equal(searchInput.getAttribute('aria-label'), 'اكتب اسم منتج أو محل للبحث');
assert.equal(searchInput.getAttribute('autocomplete'), 'off');

assert.equal(enhanceSearchLandmark({ querySelector: () => null }), false);
assert.equal(enhanceSearchLandmark(null), false);

console.log('Search landmark enhancement tests passed.');
