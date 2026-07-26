(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AawzCustomerOrderCancel = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  function cancelPendingOrder(orderId, orders, products) {
    const order = orders.find((item) => item.id === orderId);
    if (!order) return { ok: false, reason: 'not-found' };
    if (order.status !== 'pending') return { ok: false, reason: 'not-pending' };

    order.items.forEach((line) => {
      const product = products.find((item) => item.id === line.id);
      if (product) product.stock = Number(product.stock || 0) + Number(line.qty || 0);
    });
    order.status = 'cancelled';
    order.cancelledAt = new Date().toISOString();
    return { ok: true, order };
  }

  function addCancelButtons(container, orders) {
    if (!container) return;
    const cards = container.querySelectorAll('.order-card');
    cards.forEach((card, index) => {
      const order = orders[index];
      if (!order || order.status !== 'pending' || card.querySelector('[data-cancel-order]')) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'danger';
      button.dataset.cancelOrder = order.id;
      button.textContent = 'إلغاء الطلب';
      button.setAttribute('aria-label', `إلغاء الطلب ${order.id}`);
      button.addEventListener('click', () => {
        const confirmed = window.confirm(`متأكد إنك عاوز تلغي الطلب ${order.id}؟`);
        if (!confirmed) return;
        const result = cancelPendingOrder(order.id, orders, products);
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
    install.done = true;
    if (document.getElementById('orders')?.classList.contains('active')) renderCustomerOrders();
  }

  if (typeof document !== 'undefined') install();
  return { cancelPendingOrder, addCancelButtons, install };
});
