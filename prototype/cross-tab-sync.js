(function () {
  function classifyStorageKey(key, keys) {
    if (!key || !keys) return null;
    if (key === keys.products) return 'products';
    if (key === keys.cart) return 'cart';
    if (key === keys.orders) return 'orders';
    return null;
  }

  function parseStoredValue(rawValue, fallback, expectedType) {
    if (rawValue === null) return fallback;
    try {
      var parsed = JSON.parse(rawValue);
      if (expectedType === 'array' && !Array.isArray(parsed)) return fallback;
      if (expectedType === 'object' && (!parsed || Array.isArray(parsed) || typeof parsed !== 'object')) return fallback;
      return parsed;
    } catch (_error) {
      return fallback;
    }
  }

  function getFallback(slot) {
    if (slot === 'products') return typeof seedProducts !== 'undefined' ? structuredClone(seedProducts) : [];
    if (slot === 'cart') return {};
    return [];
  }

  function parseSlotValue(slot, rawValue) {
    return parseStoredValue(rawValue, getFallback(slot), slot === 'cart' ? 'object' : 'array');
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { classifyStorageKey: classifyStorageKey, parseStoredValue: parseStoredValue };
  }

  if (typeof window === 'undefined' || typeof KEYS === 'undefined') return;
  if (window.__aawzCrossTabSyncInstalled) return;
  window.__aawzCrossTabSyncInstalled = true;

  var refreshTimer = null;
  var changedSlots = new Set();

  function refreshVisibleView() {
    refreshTimer = null;
    var activeView = document.querySelector('.view.active');
    var activeId = activeView ? activeView.id : '';

    if (typeof updateCartCount === 'function') updateCartCount();
    if (activeId === 'cart' && typeof renderCart === 'function') renderCart();
    if (activeId === 'orders' && typeof renderCustomerOrders === 'function') renderCustomerOrders();
    if (activeId === 'store' && typeof renderStore === 'function') renderStore();

    if (activeId === 'merchant') {
      var visibleTab = Array.from(document.querySelectorAll('.merchant-tab')).find(function (tab) {
        return tab.style.display !== 'none';
      });
      if (visibleTab && visibleTab.id === 'tab-products' && typeof renderMerchantProducts === 'function') renderMerchantProducts();
      else if (visibleTab && visibleTab.id === 'tab-merchantOrders' && typeof renderMerchantOrders === 'function') renderMerchantOrders();
      else if (typeof renderDashboard === 'function') renderDashboard();
    }

    if (changedSlots.size && typeof toast === 'function') {
      toast('تم تحديث البيانات من تبويب آخر');
    }
    changedSlots.clear();
  }

  function scheduleRefresh(slot) {
    changedSlots.add(slot);
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(refreshVisibleView, 80);
  }

  window.addEventListener('storage', function (event) {
    if (event.storageArea && event.storageArea !== localStorage) return;
    var slot = classifyStorageKey(event.key, KEYS);
    if (!slot) return;

    var nextValue = parseSlotValue(slot, event.newValue);
    if (slot === 'products') products = nextValue;
    if (slot === 'cart') cart = nextValue;
    if (slot === 'orders') orders = nextValue;
    scheduleRefresh(slot);
  });
})();
