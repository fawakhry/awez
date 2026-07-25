document.addEventListener('DOMContentLoaded', function () {
  var status = document.createElement('div');
  status.id = 'a11yStatus';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  status.setAttribute('aria-atomic', 'true');
  status.style.position = 'absolute';
  status.style.width = '1px';
  status.style.height = '1px';
  status.style.overflow = 'hidden';
  status.style.clip = 'rect(0 0 0 0)';
  document.body.appendChild(status);

  function announce(message) {
    status.textContent = '';
    setTimeout(function () { status.textContent = message; }, 30);
  }

  var toast = document.getElementById('toast');
  if (toast) {
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.setAttribute('aria-atomic', 'true');
  }

  var searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.setAttribute('aria-label', 'ابحث عن متجر أو منتج في بنها');

  var cartCount = document.getElementById('cartCount');
  if (cartCount) {
    var previousCount = cartCount.textContent.trim();
    new MutationObserver(function () {
      var currentCount = cartCount.textContent.trim();
      if (currentCount !== previousCount) {
        previousCount = currentCount;
        announce('عدد المنتجات في السلة ' + currentCount);
      }
    }).observe(cartCount, { childList: true, characterData: true, subtree: true });
  }

  var resultsList = document.getElementById('resultsList');
  if (resultsList) {
    new MutationObserver(function () {
      var count = resultsList.querySelectorAll('.store-card').length;
      announce(count ? 'تم العثور على ' + count + ' نتيجة' : 'لم يتم العثور على نتائج');
    }).observe(resultsList, { childList: true });
  }

  if (!document.getElementById('aawzProductDeleteUndoScript')) {
    var undoScript = document.createElement('script');
    undoScript.id = 'aawzProductDeleteUndoScript';
    undoScript.src = './product-delete-undo.js';
    document.body.appendChild(undoScript);
  }
});
