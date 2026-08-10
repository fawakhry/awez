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

  var voiceSearchButton = document.querySelector('button[onclick="voiceSearch()"]');
  if (voiceSearchButton) {
    voiceSearchButton.setAttribute('aria-label', 'بدء البحث الصوتي');
    voiceSearchButton.setAttribute('title', 'بحث صوتي');
  }

  var merchantPassword = document.querySelector('#loginForm input[name="password"]');
  if (merchantPassword && !document.getElementById('merchantPasswordToggle')) {
    var passwordToggle = document.createElement('button');
    passwordToggle.id = 'merchantPasswordToggle';
    passwordToggle.type = 'button';
    passwordToggle.className = 'ghost';
    passwordToggle.textContent = 'إظهار كلمة المرور';
    passwordToggle.setAttribute('aria-pressed', 'false');
    passwordToggle.style.marginTop = '8px';
    passwordToggle.addEventListener('click', function () {
      var showing = merchantPassword.type === 'text';
      merchantPassword.type = showing ? 'password' : 'text';
      passwordToggle.setAttribute('aria-pressed', String(!showing));
      passwordToggle.textContent = showing ? 'إظهار كلمة المرور' : 'إخفاء كلمة المرور';
    });
    merchantPassword.insertAdjacentElement('afterend', passwordToggle);
  }

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
    var resultsAnnouncementTimer = null;
    new MutationObserver(function () {
      clearTimeout(resultsAnnouncementTimer);
      resultsAnnouncementTimer = setTimeout(function () {
        var count = resultsList.querySelectorAll('.store-card').length;
        announce(count ? 'تم العثور على ' + count + ' نتيجة' : 'لم يتم العثور على نتائج');
      }, 120);
    }).observe(resultsList, { childList: true, subtree: true });
  }

  if (!document.getElementById('aawzStoreScopedProductsScript')) {
    var scopedProductsScript = document.createElement('script');
    scopedProductsScript.id = 'aawzStoreScopedProductsScript';
    scopedProductsScript.src = './store-scoped-products.js';
    document.body.appendChild(scopedProductsScript);
  }

  if (!document.getElementById('aawzProductDeleteUndoScript')) {
    var undoScript = document.createElement('script');
    undoScript.id = 'aawzProductDeleteUndoScript';
    undoScript.src = './product-delete-undo.js';
    document.body.appendChild(undoScript);
  }

  if (!document.getElementById('aawzProductDialogAccessibilityScript')) {
    var dialogScript = document.createElement('script');
    dialogScript.id = 'aawzProductDialogAccessibilityScript';
    dialogScript.src = './product-dialog-accessibility.js';
    document.body.appendChild(dialogScript);
  }
});