(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AawzOrderStatusWorkflow = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const TRANSITIONS = Object.freeze({
    pending: Object.freeze(['preparing', 'cancelled']),
    preparing: Object.freeze(['onway']),
    onway: Object.freeze(['delivered']),
    delivered: Object.freeze([]),
    cancelled: Object.freeze([])
  });

  function canTransitionOrderStatus(currentStatus, nextStatus) {
    if (currentStatus === nextStatus) return true;
    return Array.isArray(TRANSITIONS[currentStatus]) && TRANSITIONS[currentStatus].includes(nextStatus);
  }

  function applyOrderStatusTransition(orderId, nextStatus, orders, products, cancelApi, now) {
    const order = Array.isArray(orders) ? orders.find((item) => item?.id === orderId) : null;
    if (!order) return { ok: false, reason: 'not-found' };
    if (!Object.prototype.hasOwnProperty.call(TRANSITIONS, nextStatus)) {
      return { ok: false, reason: 'invalid-status' };
    }
    if (order.status === nextStatus) return { ok: true, unchanged: true, order };
    if (!canTransitionOrderStatus(order.status, nextStatus)) {
      return { ok: false, reason: 'invalid-transition', currentStatus: order.status, nextStatus };
    }

    if (nextStatus === 'cancelled') {
      if (!cancelApi || typeof cancelApi.cancelPendingOrder !== 'function') {
        return { ok: false, reason: 'cancellation-unavailable' };
      }
      const cancelled = cancelApi.cancelPendingOrder(orderId, orders, products);
      if (!cancelled?.ok) return cancelled || { ok: false, reason: 'cancellation-failed' };
    } else {
      order.status = nextStatus;
    }

    order.statusUpdatedAt = typeof now === 'function' ? now() : new Date().toISOString();
    return { ok: true, order };
  }

  function install() {
    if (typeof updateOrderStatus !== 'function' || install.done) return;
    updateOrderStatus = function guardedUpdateOrderStatus(orderId, nextStatus) {
      const result = applyOrderStatusTransition(
        orderId,
        nextStatus,
        orders,
        products,
        typeof window !== 'undefined' ? window.AawzCustomerOrderCancel : null
      );

      if (!result.ok) {
        if (typeof renderMerchantOrders === 'function') renderMerchantOrders();
        if (typeof toast === 'function') {
          toast(result.reason === 'invalid-transition'
            ? 'انتقال حالة الطلب غير مسموح'
            : 'تعذر تحديث حالة الطلب بأمان');
        }
        return result;
      }

      if (result.unchanged) return result;
      if (typeof save === 'function') save();
      if (typeof renderMerchantOrders === 'function') renderMerchantOrders();
      if (typeof renderCustomerOrders === 'function' && document.getElementById('orders')?.classList.contains('active')) {
        renderCustomerOrders();
      }
      if (typeof toast === 'function') toast('تم تحديث حالة الطلب');
      return result;
    };
    install.done = true;
  }

  if (typeof document !== 'undefined') install();
  return { TRANSITIONS, canTransitionOrderStatus, applyOrderStatusTransition, install };
});
