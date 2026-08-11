(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AawzCustomerOrderCancel = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const STATUS_TRANSITIONS = Object.freeze({
    pending: Object.freeze(['preparing', 'cancelled']),
    preparing: Object.freeze(['onway']),
    onway: Object.freeze(['delivered']),
    delivered: Object.freeze([]),
    cancelled: Object.freeze([])
  });

  function normalizeOrderId(value) {
    const id = String(value == null ? '' : value).trim();
    return /^AWZ-[A-Za-z0-9-]+$/.test(id) ? id : '';
  }

  async function copyOrderId(orderId, navigatorRef) {
    const id = normalizeOrderId(orderId);
    if (!id) return { ok: false, reason: 'invalid-order-id' };
    const clipboard = navigatorRef && navigatorRef.clipboard;
    if (!clipboard || typeof clipboard.writeText !== 'function') {
      return { ok: false, reason: 'clipboard-unavailable' };
    }
    try {
      await clipboard.writeText(id);
      return { ok: true, orderId: id };
    } catch (error) {
      return { ok: false, reason: 'clipboard-denied' };
    }
  }

  function cancelPendingOrder(orderId, orders, products) {
    const order = orders.find((item) => item.id === orderId);
    if (!order) return { ok: false, reason: 'not-found' };
    if (order.status !== 'pending') return { ok: false, reason: 'not-pending' };
    if (!Array.isArray(order.items) || order.items.some((line) => {
      const qty = Number(line && line.qty);
      return !Number.isFinite(qty) || qty <= 0;
    })) return { ok: false, reason: 'invalid-items' };

    if (!Array.isArray(products) || order.items.some((line) => {
      const product = products.find((item) => item.id === line.id);
      const stock = Number(product && product.stock);
      return !product || !Number.isFinite(stock) || stock < 0;
    })) return { ok: false, reason: 'inventory-mismatch' };

    order.items.forEach((line) => {
      const product = products.find((item) => item.id === line.id);
      product.stock = Number(product.stock) + Number(line.qty);
    });
    order.status = 'cancelled';
    order.cancelledAt = new Date().toISOString();
    return { ok: true, order };
  }

  function canTransitionOrderStatus(currentStatus, nextStatus) {
    if (currentStatus === nextStatus) return true;
    return Array.isArray(STATUS_TRANSITIONS[currentStatus]) && STATUS_TRANSITIONS[currentStatus].includes(nextStatus);
  }

  function transitionOrderStatus(orderId, nextStatus, orders, products, now) {
    const order = Array.isArray(orders) ? orders.find((item) => item && item.id === orderId) : null;
    if (!order) return { ok: false, reason: 'not-found' };
    if (!Object.prototype.hasOwnProperty.call(STATUS_TRANSITIONS, nextStatus)) {
      return { ok: false, reason: 'invalid-status' };
    }
    if (order.status === nextStatus) return { ok: true, unchanged: true, order };
    if (!canTransitionOrderStatus(order.status, nextStatus)) {
      return { ok: false, reason: 'invalid-transition', currentStatus: order.status, nextStatus };
    }

    let result;
    if (nextStatus === 'cancelled') {
      result = cancelPendingOrder(orderId, orders, products);
      if (!result.ok) return result;
    } else {
      order.status = nextStatus;
      result = { ok: true, order };
    }

    order.statusUpdatedAt = typeof now === 'function' ? now() : new Date().toISOString();
    return result;
  }

  function addCancelButtons(container, orders) {
    if (!container) return;
    const cards = container.querySelectorAll('.order-card');
    cards.forEach((card, index) => {
      const order = orders[index];
      if (!order) return;

      const orderId = normalizeOrderId(order.id);
      if (orderId && !card.querySelector('[data-copy-order-id]')) {
        const copyButton = document.createElement('button');
        copyButton.type = 'button';
        copyButton.className = 'ghost';
        copyButton.dataset.copyOrderId = orderId;
        copyButton.textContent = 'نسخ رقم الطلب';
        copyButton.setAttribute('aria-label', `نسخ رقم الطلب ${orderId}`);
        copyButton.addEventListener('click', async () => {
          const result = await copyOrderId(orderId, window.navigator);
          toast(result.ok ? `تم نسخ رقم الطلب ${orderId}` : 'تعذر نسخ رقم الطلب');
        });
        card.appendChild(copyButton);
      }

      if (order.status !== 'pending' || card.querySelector('[data-cancel-order]')) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'danger';
      button.dataset.cancelOrder = order.id;
      button.textContent = 'إلغاء الطلب';
      button.setAttribute('aria-label', `إلغاء الطلب ${order.id}`);
      button.addEventListener('click', () => {
        const confirmed = window.confirm(`متأكد إنك عاوز تلغي الطلب ${order.id}؟`);
        if (!confirmed) return;
        const result = transitionOrderStatus(order.id, 'cancelled', orders, products);
        if (!result.ok) return toast('الطلب لم يعد قابلًا للإلغاء');
        save();
        renderCustomerOrders();
        toast(`تم إلغاء الطلب ${order.id} وإعادة المخزون`);
      });
      card.appendChild(button);
    });
  }

  function install() {
    if (typeof renderCustomerOrders !== 'function' || install.done) return;
    const originalRender = renderCustomerOrders;
    renderCustomerOrders = function () {
      originalRender();
      addCancelButtons(document.getElementById('customerOrders'), orders);
    };

    if (typeof updateOrderStatus === 'function') {
      updateOrderStatus = function guardedUpdateOrderStatus(orderId, nextStatus) {
        const result = transitionOrderStatus(orderId, nextStatus, orders, products);
        if (!result.ok) {
          if (typeof renderMerchantOrders === 'function') renderMerchantOrders();
          toast(result.reason === 'invalid-transition'
            ? 'انتقال حالة الطلب غير مسموح'
            : 'تعذر تحديث حالة الطلب بأمان');
          return result;
        }
        if (result.unchanged) return result;
        save();
        if (typeof renderMerchantOrders === 'function') renderMerchantOrders();
        if (document.getElementById('orders')?.classList.contains('active')) renderCustomerOrders();
        toast('تم تحديث حالة الطلب');
        return result;
      };
    }

    install.done = true;
    if (document.getElementById('orders')?.classList.contains('active')) renderCustomerOrders();
  }

  if (typeof document !== 'undefined') install();
  return {
    STATUS_TRANSITIONS,
    normalizeOrderId,
    copyOrderId,
    cancelPendingOrder,
    canTransitionOrderStatus,
    transitionOrderStatus,
    addCancelButtons,
    install
  };
});
