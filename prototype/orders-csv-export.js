(function () {
  const DANGEROUS_START = /^[=+\-@\t\r\n＝＋－＠]/;
  const STATUS_LABELS = { pending: 'جديد', preparing: 'جاري التجهيز', onway: 'في الطريق', delivered: 'تم التسليم', cancelled: 'ملغي' };

  function safeText(value) {
    const text = String(value ?? '').replace(/[\r\n]+/g, ' ').trim();
    return DANGEROUS_START.test(text) ? `\t${text}` : text;
  }

  function csvCell(value) { return `"${safeText(value).replace(/"/g, '""')}"`; }
  function orderProducts(order) { return (order.items || []).map((item) => `${item.name || ''} × ${Number(item.qty) || 0}`).join('، '); }

  function buildOrdersCsv(orderList) {
    const headers = ['رقم الطلب','التاريخ','الحالة','اسم العميل','الهاتف','العنوان','طريقة الدفع','المنتجات','الإجمالي','ملاحظات'];
    const rows = (Array.isArray(orderList) ? orderList : []).map((order) => [order.id,order.createdAt ? new Date(order.createdAt).toISOString() : '',STATUS_LABELS[order.status] || order.status || '',order.customer?.name,order.customer?.phone,order.customer?.address,order.customer?.payment === 'card' ? 'بطاقة عند الاستلام' : 'كاش عند الاستلام',orderProducts(order),Number(order.total) || 0,order.customer?.notes]);
    return [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n');
  }

  function buildProductsCsv(productList) {
    const headers = ['معرف المنتج','اسم المنتج','القسم','السعر','المخزون','الحالة','معرف المتجر'];
    const rows = (Array.isArray(productList) ? productList : []).map((product) => [product.id,product.name,product.category,Number(product.price) || 0,Number(product.stock) || 0,product.active === false ? 'موقوف' : 'متاح',product.storeId || '']);
    return [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n');
  }

  function downloadCsv(csv, filename, successMessage) {
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = filename; link.style.display = 'none';
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    if (typeof toast === 'function') toast(successMessage);
  }

  function downloadOrdersCsv(orderList) {
    if (!Array.isArray(orderList) || !orderList.length) { if (typeof toast === 'function') toast('مفيش طلبات للتصدير'); return false; }
    downloadCsv(buildOrdersCsv(orderList), `aawz-orders-${new Date().toISOString().slice(0, 10)}.csv`, `تم تصدير ${orderList.length} طلب`); return true;
  }

  function downloadProductsCsv(productList) {
    if (!Array.isArray(productList) || !productList.length) { if (typeof toast === 'function') toast('مفيش منتجات للتصدير'); return false; }
    downloadCsv(buildProductsCsv(productList), `aawz-products-${new Date().toISOString().slice(0, 10)}.csv`, `تم تصدير ${productList.length} منتج`); return true;
  }

  function addExportButton(rootId, selector, dataAttribute, label, handler) {
    const root = document.getElementById(rootId); const heading = root?.querySelector(selector);
    if (!heading || heading.querySelector(`[${dataAttribute}]`)) return;
    const button = document.createElement('button'); button.type = 'button'; button.className = 'ghost';
    button.setAttribute(dataAttribute, 'true'); button.textContent = label; button.setAttribute('aria-label', label);
    button.addEventListener('click', handler); heading.appendChild(button);
  }

  function addOrdersExportButton() { addExportButton('tab-merchantOrders', '.section-head', 'data-orders-export', 'تصدير الطلبات CSV', () => downloadOrdersCsv(orders)); }
  function addProductsExportButton() { addExportButton('tab-products', '.section-head', 'data-products-export', 'تصدير المخزون CSV', () => downloadProductsCsv(products)); }

  if (typeof module !== 'undefined' && module.exports) module.exports = { safeText, csvCell, buildOrdersCsv, buildProductsCsv, orderProducts };
  if (typeof window === 'undefined') return;
  window.downloadOrdersCsv = downloadOrdersCsv; window.downloadProductsCsv = downloadProductsCsv;
  const originalRenderMerchantOrders = renderMerchantOrders;
  renderMerchantOrders = function () { originalRenderMerchantOrders(); addOrdersExportButton(); };
  const originalRenderMerchantProducts = renderMerchantProducts;
  renderMerchantProducts = function () { originalRenderMerchantProducts(); addProductsExportButton(); };
})();
