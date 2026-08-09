(function (root) {
  'use strict';

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
    module.exports = { enhanceSearchLandmark };
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
