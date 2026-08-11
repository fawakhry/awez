const assert = require('node:assert/strict');
const {
  LIVE_SEARCH_DELAY_MS,
  buildResultsHeading,
  updateSearchResultsHeading,
  readSearchQueryFromUrl,
  syncSearchQueryToUrl,
  enhanceSearchLandmark
} = require('../prototype/search-landmark.js');

function element() {
  const attributes = new Map();
  const listeners = new Map();
  return {
    value: '',
    textContent: '',
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

assert.equal(LIVE_SEARCH_DELAY_MS, 300);
assert.equal(buildResultsHeading(' زيت ', 2), 'نتائج "زيت" (2)');
assert.equal(buildResultsHeading('', 3), 'كل المتاجر (3)');
assert.equal(buildResultsHeading(null, 'bad'), 'كل المتاجر (0)');
assert.equal(readSearchQueryFromUrl({ location: { search: '?q=%D8%A3%D8%B1%D8%B2' } }), 'أرز');
assert.equal(readSearchQueryFromUrl({ location: { search: '?q=%20%20' } }), '');
assert.equal(readSearchQueryFromUrl(null), '');

const historyCalls = [];
const urlRoot = {
  location: { href: 'https://example.com/app/?foo=1#results', search: '?foo=1' },
  history: {
    state: { demo: true },
    replaceState(state, title, url) {
      historyCalls.push({ state, title, url });
    }
  }
};
assert.equal(syncSearchQueryToUrl(urlRoot, ' زيت '), true);
assert.deepEqual(historyCalls.at(-1), {
  state: { demo: true },
  title: '',
  url: '/app/?foo=1&q=%D8%B2%D9%8A%D8%AA#results'
});
urlRoot.location.href = 'https://example.com/app/?foo=1&q=%D8%B2%D9%8A%D8%AA#results';
assert.equal(syncSearchQueryToUrl(urlRoot, ''), true);
assert.equal(historyCalls.at(-1).url, '/app/?foo=1#results');
assert.equal(syncSearchQueryToUrl({}, 'زيت'), false);

const searchBox = element();
const searchInput = element();
const resultsHeading = element();
const resultsList = {
  querySelectorAll(selector) {
    assert.equal(selector, '.store-card');
    return [{}, {}];
  }
};
const documentStub = {
  querySelector(selector) {
    if (selector === '.search-box') return searchBox;
    if (selector === '#searchInput') return searchInput;
    if (selector === '#resultsList') return resultsList;
    if (selector === '#results .section-head h2') return resultsHeading;
    return null;
  }
};
let searches = 0;
let nextTimerId = 1;
const pendingTimers = new Map();
const rootStub = {
  location: { href: 'https://example.com/?q=%D8%A3%D8%B1%D8%B2', search: '?q=%D8%A3%D8%B1%D8%B2' },
  history: {
    state: null,
    replaceState(state, title, url) {
      this.lastUrl = url;
    }
  },
  doSearch() { searches += 1; },
  setTimeout(callback, delay) {
    this.lastDelay = delay;
    const id = nextTimerId++;
    pendingTimers.set(id, callback);
    return id;
  },
  clearTimeout(id) {
    pendingTimers.delete(id);
  },
  runTimers() {
    const callbacks = [...pendingTimers.values()];
    pendingTimers.clear();
    callbacks.forEach((callback) => callback());
  }
};

assert.equal(enhanceSearchLandmark(documentStub, rootStub), true);
assert.equal(searchBox.getAttribute('role'), 'search');
assert.equal(searchBox.getAttribute('aria-label'), 'البحث في المحلات والمنتجات');
assert.equal(searchInput.getAttribute('type'), 'search');
assert.equal(searchInput.getAttribute('name'), 'q');
assert.equal(searchInput.getAttribute('aria-label'), 'اكتب اسم منتج أو محل للبحث');
assert.equal(searchInput.getAttribute('autocomplete'), 'off');
assert.equal(searchInput.getAttribute('enterkeyhint'), 'search');
assert.equal(searchInput.getAttribute('data-aawz-enter-search'), '1');
assert.equal(searchInput.getAttribute('data-aawz-live-search'), '1');
assert.equal(searchInput.getAttribute('data-aawz-url-search-restored'), '1');
assert.equal(searchInput.value, 'أرز', 'query should be restored from the URL');
assert.equal(searches, 1, 'restored query should run the search once');
assert.equal(resultsHeading.textContent, 'نتائج "أرز" (2)');
assert.equal(rootStub.history.lastUrl, '/?q=%D8%A3%D8%B1%D8%B2');

searchInput.value = 'زيت';
rootStub.doSearch();
assert.equal(searches, 2);
assert.equal(resultsHeading.textContent, 'نتائج "زيت" (2)');
assert.equal(rootStub.history.lastUrl, '/?q=%D8%B2%D9%8A%D8%AA');

searchInput.value = '';
rootStub.location.href = 'https://example.com/?q=%D8%B2%D9%8A%D8%AA';
rootStub.doSearch();
assert.equal(searches, 3);
assert.equal(resultsHeading.textContent, 'كل المتاجر (2)');
assert.equal(rootStub.history.lastUrl, '/');

const onInput = searchInput.listener('input');
assert.equal(typeof onInput, 'function');
searchInput.value = 'ر';
onInput({ isComposing: false });
searchInput.value = 'رز';
onInput({ isComposing: false });
assert.equal(searches, 3, 'typing should wait for the debounce window');
assert.equal(rootStub.lastDelay, LIVE_SEARCH_DELAY_MS);
assert.equal(pendingTimers.size, 1, 'new input should replace the previous pending search');
rootStub.runTimers();
assert.equal(searches, 4, 'typing pause should execute one live search');
assert.equal(rootStub.history.lastUrl, '/?q=%D8%B1%D8%B2');

onInput({ isComposing: true });
assert.equal(pendingTimers.size, 0, 'IME composition input should not schedule live search');

const onKeydown = searchInput.listener('keydown');
assert.equal(typeof onKeydown, 'function');

let prevented = false;
onKeydown({ key: 'a', preventDefault() { prevented = true; } });
assert.equal(searches, 4);
assert.equal(prevented, false);

onKeydown({ key: 'Enter', isComposing: true, preventDefault() { prevented = true; } });
assert.equal(searches, 4, 'IME composition must not submit the search');

prevented = false;
searchInput.value = 'ملابس';
onInput({ isComposing: false });
assert.equal(pendingTimers.size, 1);
onKeydown({ key: 'Enter', isComposing: false, preventDefault() { prevented = true; } });
assert.equal(searches, 5);
assert.equal(prevented, true);
assert.equal(pendingTimers.size, 0, 'Enter should cancel the pending live search');
rootStub.runTimers();
assert.equal(searches, 5, 'Enter must not be followed by a duplicate debounced search');
assert.equal(rootStub.history.lastUrl, '/?q=%D9%85%D9%84%D8%A7%D8%A8%D8%B3');

assert.equal(enhanceSearchLandmark(documentStub, rootStub), true);
assert.equal(searchInput.listenerCount(), 2, 'enhancement must not register duplicate keyboard or input handlers');
assert.equal(searches, 5, 'URL restoration must not repeat on re-enhancement');

assert.equal(enhanceSearchLandmark({ querySelector: () => null }, rootStub), false);
assert.equal(enhanceSearchLandmark(null, rootStub), false);
assert.equal(updateSearchResultsHeading(null), false);

console.log('Search landmark, shareable URL, and debounced live-search tests passed.');
