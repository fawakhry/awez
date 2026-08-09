(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root && root.document) api.installLowStockDashboard(root.document, root);
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const DEFAULT_THRESHOLD = 3;

  function getLowStockProducts(productList, threshold = DEFAULT_THRESHOLD) {
    return (Array.isArray(productList) ? productList : [])
      .filter((product) => product && product.active !== false && Number(product.stock) <= threshold)
      .sort((a, b) => Number(a.stock) - Number(b.stock));
  }

  function renderLowStockNotice(documentRef, productList, rootRef, threshold = DEFAULT_THRESHOLD) {
    const dashboard = documentRef && documentRef.getElementById('tab-dashboard');
    if (!dashboard) return 0;

    const existing = dashboard.querySelector('[data-low-stock-alert]');
    if (existing && typeof existing.remove === 'function') existing.remove();

    const lowStock = getLowStockProducts(productList, threshold);
    if (!lowStock.length) return 0;

    const card = documentRef.createElement('div');
    card.className = 'card';
    card.dataset.lowStockAlert = 'true';
    card.style.marginTop = '14px';

    const title = documentRef.createElement('h3');
    title.textContent = `تنبيه مخزون منخفض (${lowStock.length})`;
    card.appendChild(title);

    const summary = documentRef.createElement('p');
    summary.className = 'muted';
    summary.textContent = `في ${lowStock.length} منتج وصل إلى ${threshold} قطع أو أقل.`;
    card.appendChild(summary);

    const list = documentRef.createElement('ul');
    lowStock.slice(0, 5).forEach((product) => {
      const item = documentRef.createElement('li');
      item.textContent = `${product.name || 'منتج بدون اسم'} — المتبقي ${Number(product.stock) || 0}`;
      list.appendChild(item);
    });
    card.appendChild(list);

    const button = documentRef.createElement('button');
    button.type = 'button';
    button.className = 'ghost';
    button.textContent = 'فتح إدارة المنتجات';
    button.addEventListener('click', () => {
      if (rootRef && typeof rootRef.merchantTab === 'function') rootRef.merchantTab('products');
    });
    card.appendChild(button);

    dashboard.appendChild(card);
    return lowStock.length;
  }

  function installLowStockDashboard(documentRef, rootRef) {
    if (!documentRef || !rootRef || typeof rootRef.renderDashboard !== 'function') return false;
    if (documentRef.documentElement?.dataset?.lowStockDashboard === '1') return false;
    if (documentRef.documentElement?.dataset) documentRef.documentElement.dataset.lowStockDashboard = '1';

    const originalRenderDashboard = rootRef.renderDashboard;
    rootRef.renderDashboard = function (...args) {
      const result = originalRenderDashboard.apply(this, args);
      renderLowStockNotice(documentRef, rootRef.products || [], rootRef);
      return result;
    };

    return true;
  }

  return { DEFAULT_THRESHOLD, getLowStockProducts, renderLowStockNotice, installLowStockDashboard };
});
