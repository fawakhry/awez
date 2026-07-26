(function (root) {
  'use strict';

  function enhanceSearchLandmark(doc) {
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

    return true;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { enhanceSearchLandmark };
  }

  if (root && root.document) {
    if (root.document.readyState === 'loading') {
      root.document.addEventListener('DOMContentLoaded', function () {
        enhanceSearchLandmark(root.document);
      }, { once: true });
    } else {
      enhanceSearchLandmark(root.document);
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);
