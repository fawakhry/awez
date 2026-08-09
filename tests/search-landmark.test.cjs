const assert = require('node:assert/strict');
const { enhanceSearchLandmark } = require('../prototype/search-landmark.js');

function element() {
  const attributes = new Map();
  const listeners = new Map();
  return {
    setAttribute(name, value) {
      attributes.set(name, String(value));
    },
    getAttribute(name) {
      return attributes.has(name) ? attributes.get(name) : null;
    },
    addEventListener(type, handler) {
      listeners.set(type, handler);
    },
    listener(type) {
      return listeners.get(type);
    },
    listenerCount() {
      return listeners.size;
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
let searches = 0;
const rootStub = { doSearch() { searches += 1; } };

assert.equal(enhanceSearchLandmark(documentStub, rootStub), true);
assert.equal(searchBox.getAttribute('role'), 'search');
assert.equal(searchBox.getAttribute('aria-label'), 'البحث في المحلات والمنتجات');
assert.equal(searchInput.getAttribute('type'), 'search');
assert.equal(searchInput.getAttribute('name'), 'q');
assert.equal(searchInput.getAttribute('aria-label'), 'اكتب اسم منتج أو محل للبحث');
assert.equal(searchInput.getAttribute('autocomplete'), 'off');
assert.equal(searchInput.getAttribute('enterkeyhint'), 'search');
assert.equal(searchInput.getAttribute('data-aawz-enter-search'), '1');

const onKeydown = searchInput.listener('keydown');
assert.equal(typeof onKeydown, 'function');

let prevented = false;
onKeydown({ key: 'a', preventDefault() { prevented = true; } });
assert.equal(searches, 0);
assert.equal(prevented, false);

onKeydown({ key: 'Enter', isComposing: true, preventDefault() { prevented = true; } });
assert.equal(searches, 0, 'IME composition must not submit the search');

prevented = false;
onKeydown({ key: 'Enter', isComposing: false, preventDefault() { prevented = true; } });
assert.equal(searches, 1);
assert.equal(prevented, true);

assert.equal(enhanceSearchLandmark(documentStub, rootStub), true);
assert.equal(searchInput.listenerCount(), 1, 'enhancement must not register duplicate keyboard handlers');

assert.equal(enhanceSearchLandmark({ querySelector: () => null }, rootStub), false);
assert.equal(enhanceSearchLandmark(null, rootStub), false);

console.log('Search landmark enhancement tests passed.');
