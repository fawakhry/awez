(function (root) {
  'use strict';

  const LIVE_SEARCH_DELAY_MS = 300;

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

  function readSearchQueryFromUrl(rootRef) {
    if (!rootRef || !rootRef.location) return '';
    try {
      const params = new URLSearchParams(rootRef.location.search || '');
      return String(params.get('q') || '').trim();
    } catch {
      return '';
    }
  }

  function syncSearchQueryToUrl(rootRef, query) {
    if (!rootRef || !rootRef.location || !rootRef.history || typeof rootRef.history.replaceState !== 'function') return false;
    try {
      const url = new URL(rootRef.location.href);
      const normalizedQuery = String(query || '').trim();
      if (normalizedQuery) url.searchParams.set('q', normalizedQuery);
      else url.searchParams.delete('q');
      rootRef.history.replaceState(rootRef.history.state || null, '', `${url.pathname}${url.search}${url.hash}`);
      return true;
    } catch {
      return false;
    }
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

  function installSearchUrlState(rootRef, searchInput) {
    if (!rootRef || typeof rootRef.doSearch !== 'function' || !searchInput) return false;
    if (rootRef.doSearch.__aawzSearchUrlInstalled) return true;

    const originalDoSearch = rootRef.doSearch;
    function doSearchWithUrlState() {
      const result = originalDoSearch.apply(this, arguments);
      syncSearchQueryToUrl(rootRef, searchInput.value);
      return result;
    }
    doSearchWithUrlState.__aawzSearchUrlInstalled = true;
    rootRef.doSearch = doSearchWithUrlState;
    return true;
  }

  function installDebouncedInputSearch(rootRef, searchInput, delay = LIVE_SEARCH_DELAY_MS) {
    if (!rootRef || typeof rootRef.doSearch !== 'function' || !searchInput || typeof searchInput.addEventListener !== 'function') return false;
    if (searchInput.getAttribute('data-aawz-live-search') === '1') return true;

    const setTimer = typeof rootRef.setTimeout === 'function' ? rootRef.setTimeout.bind(rootRef) : setTimeout;
    const clearTimer = typeof rootRef.clearTimeout === 'function' ? rootRef.clearTimeout.bind(rootRef) : clearTimeout;
    let timerId = null;

    function cancelPendingSearch() {
      if (timerId === null) return false;
      clearTimer(timerId);
      timerId = null;
      return true;
    }

    searchInput.addEventListener('input', function (event) {
      if (event && event.isComposing) return;
      cancelPendingSearch();
      timerId = setTimer(function () {
        timerId = null;
        rootRef.doSearch();
      }, delay);
    });

    searchInput.__aawzCancelPendingSearch = cancelPendingSearch;
    searchInput.setAttribute('data-aawz-live-search', '1');
    return true;
  }

  function installEscapeClearSearch(rootRef, searchInput) {
    if (!rootRef || typeof rootRef.doSearch !== 'function' || !searchInput || typeof searchInput.addEventListener !== 'function') return false;
    if (searchInput.getAttribute('data-aawz-escape-clear') === '1') return true;

    searchInput.addEventListener('keydown', function (event) {
      if (!event || event.key !== 'Escape' || event.isComposing || !searchInput.value) return;
      if (typeof searchInput.__aawzCancelPendingSearch === 'function') searchInput.__aawzCancelPendingSearch();
      if (typeof event.preventDefault === 'function') event.preventDefault();
      searchInput.value = '';
      rootRef.doSearch();
    });
    searchInput.setAttribute('data-aawz-escape-clear', '1');
    return true;
  }

  function restoreSearchFromUrl(rootRef, searchInput) {
    if (!rootRef || typeof rootRef.doSearch !== 'function' || !searchInput) return false;
    if (searchInput.getAttribute('data-aawz-url-search-restored') === '1') return false;

    searchInput.setAttribute('data-aawz-url-search-restored', '1');
    const query = readSearchQueryFromUrl(rootRef);
    if (!query) return false;

    searchInput.value = query;
    rootRef.doSearch();
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

    const resultsHeading = doc.querySelector('#results .section-head h2');
    if (resultsHeading) {
      resultsHeading.setAttribute('aria-live', 'polite');
      resultsHeading.setAttribute('aria-atomic', 'true');
    }

    installResultsHeading(rootRef, doc);
    installSearchUrlState(rootRef, searchInput);
    installDebouncedInputSearch(rootRef, searchInput);
    installEscapeClearSearch(rootRef, searchInput);

    if (
      rootRef &&
      typeof rootRef.doSearch === 'function' &&
      typeof searchInput.addEventListener === 'function' &&
      searchInput.getAttribute('data-aawz-enter-search') !== '1'
    ) {
      searchInput.addEventListener('keydown', function (event) {
        if (!event || event.key !== 'Enter' || event.isComposing) return;
        if (typeof searchInput.__aawzCancelPendingSearch === 'function') searchInput.__aawzCancelPendingSearch();
        if (typeof event.preventDefault === 'function') event.preventDefault();
        rootRef.doSearch();
      });
      searchInput.setAttribute('data-aawz-enter-search', '1');
    }

    restoreSearchFromUrl(rootRef, searchInput);
    return true;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      LIVE_SEARCH_DELAY_MS,
      buildResultsHeading,
      updateSearchResultsHeading,
      readSearchQueryFromUrl,
      syncSearchQueryToUrl,
      installResultsHeading,
      installSearchUrlState,
      installDebouncedInputSearch,
      installEscapeClearSearch,
      restoreSearchFromUrl,
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
