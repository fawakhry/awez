(function () {
  const VALID_STATUSES = new Set(['all', 'pending', 'preparing', 'onway', 'delivered', 'cancelled']);
  const ARABIC_DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;

  function normalizeQuery(value) {
    return String(value ?? '')
      .normalize('NFKC')
      .toLowerCase()
      .replace(ARABIC_DIACRITICS, '')
      .replace(/ـ/g, '')
      .replace(/[أإآٱ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ؤ/g, 'و')
      .replace(/ئ/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function filterOrders(list, status = 'all', query = '') {
    const safeStatus = VALID_STATUSES.has(status) ? status : 'all';
    const normalizedQuery = normalizeQuery(query);

    return (Array.isArray(list) ? list : []).filter((order) => {
      if (safeStatus !== 'all' && order?.status !== safeStatus) return false;
      if (!normalizedQuery) return true;

      const customer = order?.customer || {};
      const items = Array.isArray(order?.items) ? order.items : [];
      const searchable = normalizeQuery([
        order?.id,
        customer.name,
        customer.phone,
        customer.address,
        items.map((item) => item?.name).join(' ')
      ].join(' '));

      return searchable.includes(normalizedQuery);
    });
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { filterOrders, normalizeQuery };
  }

  if (typeof window === 'undefined' || typeof renderMerchantOrders !== 'function') return;
  if (window.__aawzMerchantOrderFilterInstalled) return;
  window.__aawzMerchantOrderFilterInstalled = true;

  let activeStatus = 'all';
  let activeQuery = '';
  const originalRenderMerchantOrders = renderMerchantOrders;

  function renderFilterControls(total, visible) {
    const root = document.getElementById('tab-merchantOrders');
    if (!root) return;

    const toolbar = document.createElement('div');
    toolbar.className = 'card';
    toolbar.style.marginBottom = '14px';
    toolbar.innerHTML = `
      <div class="form-grid">
        <label>حالة الطلب
          <select id="merchantOrderStatusFilter" aria-label="فلترة الطلبات حسب الحالة">
            <option value="all">كل الحالات</option>
            <option value="pending">جديد</option>
            <option value="preparing">جاري التجهيز</option>
            <option value="onway">في الطريق</option>
            <option value="delivered">تم التسليم</option>
            <option value="cancelled">ملغي</option>
          </select>
        </label>
        <label>بحث في الطلبات
          <input id="merchantOrderSearch" type="search" placeholder="رقم الطلب، العميل، الهاتف أو المنتج" autocomplete="off">
        </label>
      </div>
      <p id="merchantOrderFilterStatus" class="muted" role="status" aria-live="polite" style="margin-bottom:0">
        عرض ${visible} من ${total} طلب
      </p>`;

    root.prepend(toolbar);
    const select = toolbar.querySelector('#merchantOrderStatusFilter');
    const input = toolbar.querySelector('#merchantOrderSearch');
    select.value = activeStatus;
    input.value = activeQuery;

    select.addEventListener('change', function () {
      activeStatus = this.value;
      renderMerchantOrders();
    });
    input.addEventListener('input', function () {
      activeQuery = this.value;
      renderMerchantOrders();
      const nextInput = document.getElementById('merchantOrderSearch');
      if (nextInput) {
        nextInput.focus({ preventScroll: true });
        nextInput.setSelectionRange(activeQuery.length, activeQuery.length);
      }
    });
  }

  renderMerchantOrders = function filteredMerchantOrders() {
    const allOrders = orders;
    const visibleOrders = filterOrders(allOrders, activeStatus, activeQuery);
    orders = visibleOrders;
    try {
      originalRenderMerchantOrders();
    } finally {
      orders = allOrders;
    }
    renderFilterControls(allOrders.length, visibleOrders.length);
  };
})();
