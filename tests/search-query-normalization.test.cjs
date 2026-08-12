const assert = require('node:assert/strict');
const {
  normalizeSearchQuery,
  installSearchQueryNormalization
} = require('../prototype/search-landmark.js');

assert.equal(normalizeSearchQuery('  زيت   ورز  '), 'زيت ورز');
assert.equal(normalizeSearchQuery('زيت\u00a0\u00a0ورز'), 'زيت ورز');
assert.equal(normalizeSearchQuery('Cafe\u0301'), 'Café');
assert.equal(normalizeSearchQuery(null), '');

let searches = 0;
let searchedValue = '';
const searchInput = { value: '  زيت   ورز  ' };
const root = {
  doSearch() {
    searches += 1;
    searchedValue = searchInput.value;
    return 'ok';
  }
};

assert.equal(installSearchQueryNormalization(root, searchInput), true);
assert.equal(root.doSearch(), 'ok');
assert.equal(searches, 1);
assert.equal(searchedValue, 'زيت ورز');
assert.equal(searchInput.value, 'زيت ورز');

const installedSearch = root.doSearch;
assert.equal(installSearchQueryNormalization(root, searchInput), true);
assert.equal(root.doSearch, installedSearch, 'normalizer should only be installed once');

assert.equal(installSearchQueryNormalization(null, searchInput), false);
assert.equal(installSearchQueryNormalization({}, searchInput), false);
assert.equal(installSearchQueryNormalization({ doSearch() {} }, null), false);

console.log('Search query normalization tests passed.');
