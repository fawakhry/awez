(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AawzDuplicateOrderGuard = api;
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () { api.install(); });
  }
})(typeof window !== 'undefined' ? window : null, function () {
  var STORAGE_KEY = 'aawz.lastOrderSubmission.v1';
  var DEFAULT_WINDOW_MS = 15000;
  var SUBMITTING_LABEL = 'جاري إرسال الطلب...';

  function normalize(value) {
    return String(value == null ? '' : value).trim().replace(/\s+/g, ' ');
  }

  function buildFingerprint(data, lines, total) {
    var items = (lines || []).map(function (line) {
      var product = line.product || line;
      return [normalize(product.id || product.name), Number(line.qty) || 0, Number(product.price) || 0].join(':');
    }).sort();

    return JSON.stringify({
      name: normalize(data && data.name),
      phone: normalize(data && data.phone),
      address: normalize(data && data.address),
      items: items,
      total: Number(total) || 0
    });
  }

  function isDuplicate(record, fingerprint, now, windowMs) {
    if (!record || record.fingerprint !== fingerprint) return false;
    var age = Number(now) - Number(record.submittedAt);
    return age >= 0 && age < (Number(windowMs) || DEFAULT_WINDOW_MS);
  }

  function readRecord(storage) {
    try {
      var raw = storage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function writeRecord(storage, fingerprint, now) {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify({ fingerprint: fingerprint, submittedAt: now }));
    } catch (_) {}
  }

  function shouldRecordSubmission(result) {
    return result !== false;
  }

  function setSubmittingState(buttons, submitting) {
    (buttons || []).forEach(function (button) {
      if (!button) return;
      if (submitting) {
        if (button.dataset && !Object.prototype.hasOwnProperty.call(button.dataset, 'aawzSubmitLabel')) {
          button.dataset.aawzSubmitLabel = button.textContent || '';
        }
        button.disabled = true;
        button.setAttribute?.('aria-disabled', 'true');
        button.setAttribute?.('aria-busy', 'true');
        button.textContent = SUBMITTING_LABEL;
        return;
      }

      button.disabled = false;
      button.removeAttribute?.('aria-disabled');
      button.removeAttribute?.('aria-busy');
      if (button.dataset && Object.prototype.hasOwnProperty.call(button.dataset, 'aawzSubmitLabel')) {
        button.textContent = button.dataset.aawzSubmitLabel;
        delete button.dataset.aawzSubmitLabel;
      }
    });
  }

  function install() {
    if (typeof window.placeOrder !== 'function' || window.placeOrder.__duplicateGuardInstalled) return;

    var originalPlaceOrder = window.placeOrder;
    function guardedPlaceOrder(form) {
      var data = Object.fromEntries(new FormData(form));
      var lines = typeof window.cartLines === 'function' ? window.cartLines() : [];
      var total = typeof window.cartTotal === 'function' ? window.cartTotal() : 0;
      var fingerprint = buildFingerprint(data, lines, total);
      var now = Date.now();
      var storage = window.sessionStorage;
      var record = readRecord(storage);

      if (isDuplicate(record, fingerprint, now, DEFAULT_WINDOW_MS)) {
        if (typeof window.toast === 'function') window.toast('الطلب اتبعت بالفعل، استنى لحظات قبل المحاولة تاني');
        return false;
      }

      var buttons = Array.from(document.querySelectorAll('#checkoutForm button[type="submit"], #orderReviewDialog button[value="confirm"]'));
      setSubmittingState(buttons, true);

      try {
        var result = originalPlaceOrder(form);
        if (shouldRecordSubmission(result)) writeRecord(storage, fingerprint, now);
        return result;
      } finally {
        window.setTimeout(function () {
          setSubmittingState(buttons, false);
        }, 1200);
      }
    }

    guardedPlaceOrder.__duplicateGuardInstalled = true;
    window.placeOrder = guardedPlaceOrder;
  }

  return {
    STORAGE_KEY: STORAGE_KEY,
    DEFAULT_WINDOW_MS: DEFAULT_WINDOW_MS,
    SUBMITTING_LABEL: SUBMITTING_LABEL,
    buildFingerprint: buildFingerprint,
    isDuplicate: isDuplicate,
    readRecord: readRecord,
    shouldRecordSubmission: shouldRecordSubmission,
    setSubmittingState: setSubmittingState,
    install: install
  };
});
