(function (root) {
  'use strict';

  function buildResultsHeading(query, count) {
    const normalizedQuery = String(query || '').trim();
    const safeCount = Number.isFinite(Number(count)) ? Number(count) : 0;
    return normalizedQuery
      ? `نتائج "${normalizedQuery}" (${safeCount})`
      : `كل المتاجر (${safeCount})`;
  }

  function updateSearchResultsHeading(doc) {
    if (!doc || typeof doc.querySelector !== 'function') return false;

    const searchInput = doc.querySelector('#searchInput');
    const resultsList = doc.querySelector('#resultsList');
    const heading = doc.querySelector('#results .section-head h2');
    if (!searchInput || !resultsList || !heading || typeof resultsList.querySelectorAll !== 'function') return false;

    const resultCount = resultsList.querySelectorAll('.store-card').length;
    heading.textContent = buildResultsHeading(searchInput.value, resultCount);
    return true;
  }

  function installResultsHeading(rootRef, doc) {
    if (!rootRef || typeof rootRef.doSearch !== 'function') return false;
    if (rootRef.doSearch.__aawzResultsHeadingInstalled) return true;

    const originalDoSearch = rootRef.doSearch;
    function doSearchWithHeading() {
      const result = originalDoSearch.apply(this, arguments);
      updateSearchResultsHeading(doc);
      return result;
    }
    doSearchWithHeading.__aawzResultsHeadingInstalled = true;
    rootRef.doSearch = doSearchWithHeading;
    return true;
  }

  function enhanceSearchLandmark(doc, rootRef) {
    if (!doc || typeof doc.querySelector !== 'function') return false;

    const searchBox = doc.querySelector('.search-box');
    const searchInput = doc.querySelector('#searchInput');
    if (!searchBox || !searchInput) return false;

    searchBox.setAttribute('role', 'search');
    searchBox.setAttribute('aria-label', 'البحث في المحلات والمنتجات');

    searchInput.setAttribute('type', 'search');
    searchInput.setAttribute('name', 'q');
    searchInput.setAttribute('aria-label', 'اكتب اسم منتج أو محل للبحث');
    searchInput.setAttribute('autocomplete', 'off');
    searchInput.setAttribute('enterkeyhint', 'search');

    installResultsHeading(rootRef, doc);

    if (
      rootRef &&
      typeof rootRef.doSearch === 'function' &&
      typeof searchInput.addEventListener === 'function' &&
      searchInput.getAttribute('data-aawz-enter-search') !== '1'
    ) {
      searchInput.addEventListener('keydown', function (event) {
        if (!event || event.key !== 'Enter' || event.isComposing) return;
        if (typeof event.preventDefault === 'function') event.preventDefault();
        rootRef.doSearch();
      });
      searchInput.setAttribute('data-aawz-enter-search', '1');
    }

    return true;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      buildResultsHeading,
      updateSearchResultsHeading,
      installResultsHeading,
      enhanceSearchLandmark
    };
  }

  if (root && root.document) {
    if (root.document.readyState === 'loading') {
      root.document.addEventListener('DOMContentLoaded', function () {
        enhanceSearchLandmark(root.document, root);
      }, { once: true });
    } else {
      enhanceSearchLandmark(root.document, root);
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);
