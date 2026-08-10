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
    const todayOrders = (Array.isArray(list) ? list : []).filter((order) => isSameLocalDay(order?.createdAt, now));
    const delivered = todayOrders.filter((order) => order?.status === 'delivered');

    return {
      total: todayOrders.length,
      active: todayOrders.filter((order) => ACTIVE_STATUSES.has(order?.status)).length,
      delivered: delivered.length,
      revenue: delivered.reduce((sum, order) => sum + (Number(order?.total) || 0), 0)
    };
  }

  function getLatestActiveOrder(list) {
    return (Array.isArray(list) ? list : [])
      .filter((order) => ACTIVE_STATUSES.has(order?.status))
      .map((order) => ({ order, createdAt: new Date(order?.createdAt) }))
      .filter(({ createdAt }) => !Number.isNaN(createdAt.getTime()))
      .sort((a, b) => b.createdAt - a.createdAt)[0]?.order ?? null;
  }

  function getRelativeTimeValue(value, now = new Date()) {
    const date = value instanceof Date ? value : new Date(value);
    const reference = now instanceof Date ? now : new Date(now);
    if (Number.isNaN(date.getTime()) || Number.isNaN(reference.getTime())) return null;

    const diffMs = date.getTime() - reference.getTime();
    const absMs = Math.abs(diffMs);
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (absMs < hour) return { value: Math.round(diffMs / minute), unit: 'minute' };
    if (absMs < day) return { value: Math.round(diffMs / hour), unit: 'hour' };
    return { value: Math.round(diffMs / day), unit: 'day' };
  }

  function formatRelativeOrderAge(value, now = new Date(), locale = 'ar-EG') {
    const relative = getRelativeTimeValue(value, now);
    if (!relative) return '';
    return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(relative.value, relative.unit);
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      isSameLocalDay,
      getDailyMerchantSummary,
      getLatestActiveOrder,
      getRelativeTimeValue,
      formatRelativeOrderAge
    };
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
    const latestActiveOrder = getLatestActiveOrder(orders);
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
      </div>
      ${latestActiveOrder ? `
        <div class="row wrap" style="margin-top:14px;padding-top:14px;border-top:1px solid var(--line)">
          <div>
            <strong>آخر طلب نشط: ${escapeHtml(latestActiveOrder.id)}</strong>
            <div class="muted" style="margin-top:5px">${escapeHtml(statusLabels[latestActiveOrder.status] || latestActiveOrder.status)} • ${escapeHtml(formatRelativeOrderAge(latestActiveOrder.createdAt))}</div>
          </div>
          <button class="ghost" type="button" id="openLatestActiveOrder">عرض الطلبات</button>
        </div>` : `
        <p class="muted" style="margin:14px 0 0;padding-top:14px;border-top:1px solid var(--line)">لا توجد طلبات نشطة تحتاج متابعة الآن.</p>`}`;

    panel.querySelector('#openLatestActiveOrder')?.addEventListener('click', () => merchantTab('merchantOrders'));
    root.append(panel);
  };
})();