(function () {
  const ACTIVE_STATUSES = ['pending', 'preparing', 'onway'];
  const STATUS_LABELS = {
    pending: 'جديد',
    preparing: 'جاري التجهيز',
    onway: 'في الطريق'
  };

  function summarizeActiveOrders(list) {
    const counts = { pending: 0, preparing: 0, onway: 0, total: 0 };

    for (const order of Array.isArray(list) ? list : []) {
      const status = order?.status;
      if (!ACTIVE_STATUSES.includes(status)) continue;
      counts[status] += 1;
      counts.total += 1;
    }

    return counts;
  }

  function formatCount(value) {
    return new Intl.NumberFormat('ar-EG').format(Number(value) || 0);
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ACTIVE_STATUSES, STATUS_LABELS, summarizeActiveOrders, formatCount };
  }

  if (typeof window === 'undefined' || typeof renderDashboard !== 'function') return;
  if (window.__aawzMerchantWorkloadBreakdownInstalled) return;
  window.__aawzMerchantWorkloadBreakdownInstalled = true;

  const originalRenderDashboard = renderDashboard;

  renderDashboard = function renderDashboardWithWorkloadBreakdown() {
    originalRenderDashboard();

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
        <button class="ghost" type="button" id="openMerchantWorkloadOrders">عرض الطلبات</button>
      </div>
      <div class="stat-grid">
        ${ACTIVE_STATUSES.map((status) => `
          <div class="card stat">
            <span class="muted">${STATUS_LABELS[status]}</span>
            <strong>${formatCount(summary[status])}</strong>
          </div>`).join('')}
      </div>`;

    panel.querySelector('#openMerchantWorkloadOrders')?.addEventListener('click', () => merchantTab('merchantOrders'));
    root.append(panel);
  };
})();
