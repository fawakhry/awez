(function () {
  const DANGEROUS_START = /^[=+\-@\t\r\n＝＋－＠]/;
  const STATUS_LABELS = {
    pending: 'جديد',
    preparing: 'جاري التجهيز',
    onway: 'في الطريق',
    delivered: 'تم التسليم',
    cancelled: 'ملغي'
  };

  function safeText(value) {
    const text = String(value ?? '').replace(/[\r\n]+/g, ' ').trim();
    return DANGEROUS_START.test(text) ? `\t${text}` : text;
  }

  function csvCell(value) {
    return `"${safeText(value).replace(/"/g, '""')}"`;
  }

  function orderProducts(order) {
    return (order.items || [])
      .map((item) => `${item.name || ''} × ${Number(item.qty) || 0}`)
      .join('، ');
  }

  function buildOrdersCsv(orderList) {
    const headers = [
      'رقم الطلب', 'التاريخ', 'الحالة', 'اسم العميل', 'الهاتف',
      'العنوان', 'طريقة الدفع', 'المنتجات', 'الإجمالي', 'ملاحظات'
    ];

    const rows = (Array.isArray(orderList) ? orderList : []).map((order) => [
      order.id,
      order.createdAt ? new Date(order.createdAt).toISOString() : '',
      STATUS_LABELS[order.status] || order.status || '',
      order.customer?.name,
      order.customer?.phone,
      order.customer?.address,
      order.customer?.payment === 'card' ? 'بطاقة عند الاستلام' : 'كاش عند الاستلام',
      orderProducts(order),
      Number(order.total) || 0,
      order.customer?.notes
    ]);

    return [headers, ...rows]
      .map((row) => row.map(csvCell).join(','))
      .join('\r\n');
  }

  function downloadOrdersCsv(orderList) {
    if (!Array.isArray(orderList) || !orderList.length) {
      if (typeof toast === 'function') toast('مفيش طلبات للتصدير');
      return false;
    }

    const csv = `\uFEFF${buildOrdersCsv(orderList)}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `aawz-orders-${date}.csv`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    if (typeof toast === 'function') toast(`تم تصدير ${orderList.length} طلب`);
    return true;
  }

  function addExportButton() {
    const root = document.getElementById('tab-merchantOrders');
    const heading = root?.querySelector('.section-head');
    if (!heading || heading.querySelector('[data-orders-export]')) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ghost';
    button.dataset.ordersExport = 'true';
    button.textContent = 'تصدير CSV';
    button.setAttribute('aria-label', 'تصدير الطلبات كملف CSV');
    button.addEventListener('click', () => downloadOrdersCsv(orders));
    heading.appendChild(button);
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { safeText, csvCell, buildOrdersCsv, orderProducts };
  }

  if (typeof window === 'undefined') return;

  window.downloadOrdersCsv = downloadOrdersCsv;
  const originalRenderMerchantOrders = renderMerchantOrders;
  renderMerchantOrders = function renderMerchantOrdersWithExport() {
    originalRenderMerchantOrders();
    addExportButton();
  };
})();
