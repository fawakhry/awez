const assert = require('node:assert/strict');
const {
  RECENT_SEARCHES_KEY,
  RECENT_SEARCHES_LIMIT,
  RECENT_SEARCHES_LIST_ID,
  normalizeRecentSearches,
  readRecentSearches,
  rememberRecentSearch,
  renderRecentSearchSuggestions
} = require('../prototype/search-landmark.js');

function createStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    },
    setItem(key, value) {
      data.set(key, String(value));
    },
    value(key) {
      return data.get(key);
    }
  };
}

function createNode(tagName) {
  const children = [];
  const attributes = new Map();
  return {
    tagName,
    id: '',
    value: '',
    parentNode: null,
    get firstChild() {
      return children[0] || null;
    },
    setAttribute(name, value) {
      attributes.set(name, String(value));
    },
    getAttribute(name) {
      return attributes.has(name) ? attributes.get(name) : null;
    },
    appendChild(child) {
      child.parentNode = this;
      children.push(child);
      return child;
    },
    removeChild(child) {
      const index = children.indexOf(child);
      if (index >= 0) children.splice(index, 1);
    },
    childValues() {
      return children.map((child) => child.value);
    }
  };
}

assert.equal(RECENT_SEARCHES_LIMIT, 5);
assert.deepEqual(
  normalizeRecentSearches(['  زيت  ', 'أرز', 'زيت', '', 'لبن', 'سكر', 'شاي', 'قهوة']),
  ['زيت', 'أرز', 'لبن', 'سكر', 'شاي']
);
assert.deepEqual(normalizeRecentSearches(null), []);

const storage = createStorage({
  [RECENT_SEARCHES_KEY]: JSON.stringify(['أرز', 'زيت', 'أرز'])
});
const root = { localStorage: storage };
assert.deepEqual(readRecentSearches(root), ['أرز', 'زيت']);
assert.deepEqual(rememberRecentSearch(root, '  لبن كامل  '), ['لبن كامل', 'أرز', 'زيت']);
assert.deepEqual(JSON.parse(storage.value(RECENT_SEARCHES_KEY)), ['لبن كامل', 'أرز', 'زيت']);
assert.deepEqual(rememberRecentSearch(root, 'أرز'), ['أرز', 'لبن كامل', 'زيت']);
assert.deepEqual(rememberRecentSearch(root, '   '), ['أرز', 'لبن كامل', 'زيت']);

const brokenRoot = {
  localStorage: {
    getItem() { throw new Error('blocked'); },
    setItem() { throw new Error('blocked'); }
  }
};
assert.deepEqual(readRecentSearches(brokenRoot), []);
assert.deepEqual(rememberRecentSearch(brokenRoot, 'زيت'), ['زيت']);

const body = createNode('body');
const searchInput = createNode('input');
let datalist = null;
const doc = {
  body,
  createElement(tagName) {
    return createNode(tagName);
  },
  querySelector(selector) {
    if (selector === `#${RECENT_SEARCHES_LIST_ID}`) return datalist;
    return null;
  }
};
const originalAppend = body.appendChild.bind(body);
body.appendChild = function (child) {
  if (child.id === RECENT_SEARCHES_LIST_ID) datalist = child;
  return originalAppend(child);
};

assert.equal(renderRecentSearchSuggestions(doc, searchInput, ['زيت', 'أرز']), true);
assert.equal(searchInput.getAttribute('list'), RECENT_SEARCHES_LIST_ID);
assert.ok(datalist, 'datalist should be created');
assert.deepEqual(datalist.childValues(), ['زيت', 'أرز']);

assert.equal(renderRecentSearchSuggestions(doc, searchInput, ['لبن']), true);
assert.deepEqual(datalist.childValues(), ['لبن'], 'existing datalist should be refreshed');
assert.equal(renderRecentSearchSuggestions(null, searchInput, ['زيت']), false);

console.log('Recent search suggestion tests passed.');
