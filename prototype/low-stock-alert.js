(function () {
  const DEFAULT_THRESHOLD = 5;

  function getLowStockProducts(list, threshold = DEFAULT_THRESHOLD) {
    const safeThreshold = Number.isFinite(Number(threshold)) && Number(threshold) >= 0
      ? Number(threshold)
      : DEFAULT_THRESHOLD;

    return (Array.isArray(list) ? list : [])
      .filter((product) => product?.active === true && Number(product?.stock) <= safeThreshold)
      .map((product) => ({ ...product, stock: Math.max(0, Number(product.stock) || 0) }))
      .sort((a, b) => a.stock - b.stock || String(a.name ?? '').localeCompare(String(b.name ?? ''), 'ar'));
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DEFAULT_THRESHOLD, getLowStockProducts };
  }

  if (typeof window === 'undefined' || typeof renderDashboard !== 'function') return;
  if (window.__aawzLowStockAlertInstalled) return;
  window.__aawzLowStockAlertInstalled = true;

  const originalRenderDashboard = renderDashboard;

  renderDashboard = function renderDashboardWithLowStockAlert() {
    originalRenderDashboard();

    const root = document.getElementById('tab-dashboard');
    if (!root) return;

    const lowStock = getLowStockProducts(products);
    const panel = document.createElement('section');
    panel.className = 'card';
    panel.style.marginTop = '14px';
    panel.setAttribute('aria-labelledby', 'lowStockHeading');

    if (!lowStock.length) {
      panel.innerHTML = `
        <div class="row wrap">
          <div>
            <h3 id="lowStockHeading">المخزون مطمئن</h3>
            <p class="muted" style="margin-bottom:0">مفيش منتجات متاحة وصلت إلى ${DEFAULT_THRESHOLD} قطع أو أقل.</p>
          </div>
          <span class="status s-delivered">0 منخفض</span>
        </div>`;
    } else {
      const visible = lowStock.slice(0, 5);
      panel.innerHTML = `
        <div class="section-head">
          <div>
            <h3 id="lowStockHeading">تنبيه مخزون منخفض</h3>
            <p class="muted" style="margin:5px 0 0">${lowStock.length} منتج وصل إلى ${DEFAULT_THRESHOLD} قطع أو أقل.</p>
          </div>
          <button class="ghost" type="button" id="openLowStockProducts">إدارة المنتجات</button>
        </div>
        <div>${visible.map((product) => `
          <div class="row wrap" style="padding:10px 0;border-bottom:1px solid var(--line)">
            <strong>${escapeHtml(product.icon || '🛒')} ${escapeHtml(product.name)}</strong>
            <span class="status ${product.stock === 0 ? 's-cancelled' : 's-pending'}">${product.stock === 0 ? 'نفد' : `${product.stock} متبقي`}</span>
          </div>`).join('')}</div>
        ${lowStock.length > visible.length ? `<p class="muted" style="margin-bottom:0">و${lowStock.length - visible.length} منتجات أخرى.</p>` : ''}`;

      panel.querySelector('#openLowStockProducts')?.addEventListener('click', () => merchantTab('products'));
    }

    root.append(panel);
  };
})();
