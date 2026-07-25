(function () {
  function shouldSubmitSearch(event) {
    return event.key === 'Enter' && !event.isComposing && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey;
  }

  function installSearchKeyboard(root) {
    const input = root && root.querySelector ? root.querySelector('#searchInput') : null;
    if (!input || input.dataset.keyboardSearchReady === '1') return false;

    input.dataset.keyboardSearchReady = '1';
    input.setAttribute('enterkeyhint', 'search');
    input.addEventListener('keydown', function (event) {
      if (!shouldSubmitSearch(event)) return;
      event.preventDefault();
      if (typeof window.doSearch === 'function') window.doSearch();
    });
    return true;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { shouldSubmitSearch };
  }

  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  document.addEventListener('DOMContentLoaded', function () {
    installSearchKeyboard(document);
  });
})();
