const assert = require('node:assert/strict');
const {
  installDebouncedInputSearch
} = require('../prototype/search-landmark.js');

function makeSearchInput() {
  const attributes = new Map();
  const listeners = new Map();
  return {
    value: '',
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
    }
  };
}

const searchInput = makeSearchInput();
let searches = 0;
let nextTimerId = 1;
const pendingTimers = new Map();
const rootStub = {
  doSearch() {
    searches += 1;
  },
  setTimeout(callback) {
    const id = nextTimerId++;
    pendingTimers.set(id, callback);
    return id;
  },
  clearTimeout(id) {
    pendingTimers.delete(id);
  }
};

assert.equal(installDebouncedInputSearch(rootStub, searchInput, 300), true);
const onInput = searchInput.listener('input');
assert.equal(typeof onInput, 'function');

searchInput.value = 'زيت';
onInput({ isComposing: false });
assert.equal(searches, 0, 'non-empty search should stay debounced');
assert.equal(pendingTimers.size, 1);

searchInput.value = '';
onInput({ isComposing: false });
assert.equal(searches, 1, 'clearing the field should refresh results immediately');
assert.equal(pendingTimers.size, 0, 'clearing should cancel the pending non-empty search');

searchInput.value = '   ';
onInput({ isComposing: false });
assert.equal(searches, 2, 'whitespace-only search should also clear immediately');
assert.equal(pendingTimers.size, 0);

searchInput.value = 'رز';
onInput({ isComposing: true });
assert.equal(searches, 2, 'IME composition should not trigger search');
assert.equal(pendingTimers.size, 0);

console.log('Instant search clear tests passed.');
