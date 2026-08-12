(function () {
  const ACTIVE_STATUSES = new Set(['pending', 'preparing', 'onway']);

  function isSameLocalDay(value, now = new Date()) {
    const date = value instanceof Date ? value : new Date(value);
    const reference = now instanceof Date ? now : new Date(now);
    if (Number.isNaN(date.getTime()) || Number.isNaN(reference.getTime())) return false;

    return date.getFullYear() === reference.getFullYear()
      && date.getMonth() === reference.getMonth()
      && date.getDate() === reference.getDate();
  }

  function getDailyMerchantSummary(list, now = new Date()) {
    const summary = { total: 0, active: 0, delivered: 0, revenue: 0, averageOrderValue: 0 };

    for (const order of Array.isArray(list) ? list : []) {
      if (!isSameLocalDay(order?.createdAt, now)) continue;

      summary.total += 1;
      if (ACTIVE_STATUSES.has(order?.status)) summary.active += 1;
      if (order?.status === 'delivered') {
        summary.delivered += 1;
        summary.revenue += Number(order?.total) || 0;
      }
    }

    if (summary.delivered > 0) {
      summary.averageOrderValue = summary.revenue / summary.delivered;
    }

    return summary;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { isSameLocalDay, getDailyMerchantSummary };
  }

  if (typeof window === 'undefined' || typeof renderDashboard !== 'function') return;
  if (window.__aawzMerchantDailySummaryInstalled) return;
  window.__aawzMerchantDailySummaryInstalled = true;

  const originalRenderDashboard = renderDashboard;

  renderDashboard = function renderDashboardWithDailySummary() {
    originalRenderDashboard();

    const root = document.getElementById('tab-dashboard');
    if (!root || root.querySelector('#merchantDailySummary')) return;

    const summary = getDailyMerchantSummary(orders);
    const panel = document.createElement('section');
    panel.id = 'merchantDailySummary';
    panel.className = 'card';
    panel.style.marginTop = '14px';
    panel.setAttribute('aria-labelledby', 'merchantDailySummaryHeading');
    panel.innerHTML = `
      <div class="section-head">
        <div>
          <h3 id="merchantDailySummaryHeading">ملخص اليوم</h3>
          <p class="muted" style="margin:5px 0 0">أرقام الطلبات المسجلة اليوم على الجهاز.</p>
        </div>
        <strong>${money(summary.revenue)}</strong>
      </div>
      <div class="stat-grid">
        <div class="stat"><span class="muted">طلبات اليوم</span><strong>${summary.total}</strong></div>
        <div class="stat"><span class="muted">نشطة اليوم</span><strong>${summary.active}</strong></div>
        <div class="stat"><span class="muted">تم تسليمها</span><strong>${summary.delivered}</strong></div>
        <div class="stat"><span class="muted">مبيعات اليوم</span><strong>${money(summary.revenue)}</strong></div>
        <div class="stat"><span class="muted">متوسط الطلب المُسلّم</span><strong>${money(summary.averageOrderValue)}</strong></div>
      </div>`;

    root.append(panel);
  };
})();
