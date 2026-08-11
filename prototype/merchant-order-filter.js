(function () {
  const VALID_STATUSES = new Set(['all', 'pending', 'preparing', 'onway', 'delivered', 'cancelled']);
  const ACTIVE_STATUSES = ['pending', 'preparing', 'onway'];
  const ACTIVE_STATUS_LABELS = {
    pending: 'جديد',
    preparing: 'جاري التجهيز',
    onway: 'في الطريق'
  };
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

  function hasActiveFilters(status = 'all', query = '') {
    const safeStatus = VALID_STATUSES.has(status) ? status : 'all';
    return safeStatus !== 'all' || normalizeQuery(query) !== '';
  }

  function countOrdersByStatus(list) {
    const counts = {
      all: 0,
      pending: 0,
      preparing: 0,
      onway: 0,
      delivered: 0,
      cancelled: 0
    };

    for (const order of Array.isArray(list) ? list : []) {
      counts.all += 1;
      if (Object.prototype.hasOwnProperty.call(counts, order?.status)) {
        counts[order.status] += 1;
      }
    }

    return counts;
  }

  function summarizeActiveOrders(list) {
    const byStatus = countOrdersByStatus(list);
    return {
      pending: byStatus.pending,
      preparing: byStatus.preparing,
      onway: byStatus.onway,
      total: byStatus.pending + byStatus.preparing + byStatus.onway
    };
  }

  function formatCount(value) {
    return new Intl.NumberFormat('ar-EG').format(Number(value) || 0);
  }

  function normalizeWorkloadStatus(status) {
    return ACTIVE_STATUSES.includes(status) ? status : 'all';
  }

  function buildOrderStatusControlLabel(orderId) {
    const id = String(orderId ?? '').trim();
    return id ? `تغيير حالة الطلب ${id}` : 'تغيير حالة الطلب';
  }

  function labelOrderStatusControls(container, list) {
    if (!container || typeof container.querySelectorAll !== 'function') return 0;
    const controls = Array.from(container.querySelectorAll('.order-card select'));
    const safeOrders = Array.isArray(list) ? list : [];
    controls.forEach((control, index) => {
      control.setAttribute('aria-label', buildOrderStatusControlLabel(safeOrders[index]?.id));
    });
    return controls.length;
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
    module.exports = {
      filterOrders,
      normalizeQuery,
      countOrdersByStatus,
      hasActiveFilters,
      summarizeActiveOrders,
      formatCount,
      normalizeWorkloadStatus,
      buildOrderStatusControlLabel,
      labelOrderStatusControls,
      ACTIVE_STATUSES,
      ACTIVE_STATUS_LABELS
    };
  }

  if (typeof window === 'undefined' || typeof renderMerchantOrders !== 'function') return;
  if (window.__aawzMerchantOrderFilterInstalled) return;
  window.__aawzMerchantOrderFilterInstalled = true;

  let activeStatus = 'all';
  let activeQuery = '';
  const originalRenderMerchantOrders = renderMerchantOrders;
  const originalRenderDashboard = typeof renderDashboard === 'function' ? renderDashboard : null;

  function renderFilterControls(total, visible, counts) {
    const root = document.getElementById('tab-merchantOrders');
    if (!root) return;

    const toolbar = document.createElement('div');
    const filtersActive = hasActiveFilters(activeStatus, activeQuery);
    toolbar.className = 'card';
    toolbar.style.marginBottom = '14px';
    toolbar.innerHTML = `
      <div class="form-grid">
        <label>حالة الطلب
          <select id="merchantOrderStatusFilter" aria-label="فلترة الطلبات حسب الحالة">
            <option value="all">كل الحالات (${counts.all})</option>
            <option value="pending">جديد (${counts.pending})</option>
            <option value="preparing">جاري التجهيز (${counts.preparing})</option>
            <option value="onway">في الطريق (${counts.onway})</option>
            <option value="delivered">تم التسليم (${counts.delivered})</option>
            <option value="cancelled">ملغي (${counts.cancelled})</option>
          </select>
        </label>
        <label>بحث في الطلبات
          <input id="merchantOrderSearch" type="search" placeholder="رقم الطلب، العميل، الهاتف أو المنتج" autocomplete="off">
        </label>
        <button id="merchantOrderClearFilters" type="button"${filtersActive ? '' : ' disabled'}>مسح الفلاتر</button>
      </div>
      <p id="merchantOrderFilterStatus" class="muted" role="status" aria-live="polite" style="margin-bottom:0">
        عرض ${visible} من ${total} طلب
      </p>`;

    root.prepend(toolbar);
    const select = toolbar.querySelector('#merchantOrderStatusFilter');
    const input = toolbar.querySelector('#merchantOrderSearch');
    const clearButton = toolbar.querySelector('#merchantOrderClearFilters');
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
    clearButton.addEventListener('click', function () {
      if (!hasActiveFilters(activeStatus, activeQuery)) return;
      activeStatus = 'all';
      activeQuery = '';
      renderMerchantOrders();
      const nextSelect = document.getElementById('merchantOrderStatusFilter');
      if (nextSelect) nextSelect.focus({ preventScroll: true });
    });
  }

  function openMerchantOrdersByStatus(status) {
    activeStatus = normalizeWorkloadStatus(status);
    activeQuery = '';
    merchantTab('merchantOrders');
  }

  function appendWorkloadBreakdown() {
    const root = document.getElementById('tab-dashboard');
    if (!root) return;

    const summary = summarizeActiveOrders(orders);
    const panel = document.createElement('section');
    panel.className = 'card';
    panel.style.marginTop = '14px';
    panel.setAttribute('aria-labelledby', 'merchantWorkloadHeading');
    panel.innerHTML = `
      <div class="section-head">
        <div>
          <h3 id="merchantWorkloadHeading">توزيع الطلبات النشطة</h3>
          <p class="muted" style="margin:5px 0 0">${formatCount(summary.total)} طلب محتاج متابعة دلوقتي.</p>
        </div>
        <button class="ghost" type="button" id="openMerchantWorkloadOrders">عرض كل الطلبات</button>
      </div>
      <div class="stat-grid">
        ${ACTIVE_STATUSES.map((status) => `
          <div class="card stat">
            <span class="muted">${ACTIVE_STATUS_LABELS[status]}</span>
            <strong>${formatCount(summary[status])}</strong>
            <button class="ghost merchant-workload-status" type="button" data-status="${status}" aria-label="عرض طلبات ${ACTIVE_STATUS_LABELS[status]}">عرض</button>
          </div>`).join('')}
      </div>`;

    panel.querySelector('#openMerchantWorkloadOrders')?.addEventListener('click', () => openMerchantOrdersByStatus('all'));
    panel.querySelectorAll('.merchant-workload-status').forEach((button) => {
      button.addEventListener('click', () => openMerchantOrdersByStatus(button.dataset.status));
    });
    root.append(panel);
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
    const root = document.getElementById('tab-merchantOrders');
    labelOrderStatusControls(root, visibleOrders);
    renderFilterControls(allOrders.length, visibleOrders.length, countOrdersByStatus(allOrders));
  };

  if (originalRenderDashboard) {
    renderDashboard = function dashboardWithWorkloadBreakdown() {
      originalRenderDashboard();
      appendWorkloadBreakdown();
    };
  }
})();
