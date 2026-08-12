(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AawzOrderReview = api;
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () { api.install(); });
  }
})(typeof window !== 'undefined' ? window : null, function () {
  function clean(value) {
    return String(value == null ? '' : value).trim();
  }

  function escapeHtml(value) {
    return clean(value).replace(/[&<>"']/g, function (char) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char];
    });
  }

  function buildReviewModel(data, lines, total) {
    return {
      customer: {
        name: clean(data.name),
        phone: clean(data.phone),
        address: clean(data.address),
        payment: clean(data.payment),
        notes: clean(data.notes)
      },
      items: (lines || []).map(function (line) {
        var product = line.product || line;
        return {
          name: clean(product.name),
          price: Number(product.price) || 0,
          qty: Number(line.qty) || 0
        };
      }).filter(function (item) { return item.name && item.qty > 0; }),
      total: Number(total) || 0
    };
  }

  function validateModel(model) {
    return Boolean(
      model &&
      model.customer &&
      model.customer.name &&
      model.customer.phone &&
      model.customer.address &&
      model.items &&
      model.items.length
    );
  }

  function paymentLabel(value) {
    return value === 'card' ? 'بطاقة عند الاستلام' : 'كاش عند الاستلام';
  }

  function renderReviewHtml(model, moneyFn) {
    var money = typeof moneyFn === 'function' ? moneyFn : function (value) { return value + ' ج.م'; };
    var items = model.items.map(function (item) {
      return '<div class="review-row"><span>' + escapeHtml(item.name) + ' × ' + item.qty + '</span><strong>' + escapeHtml(money(item.price * item.qty)) + '</strong></div>';
    }).join('');

    return '' +
      '<div class="review-block"><h3>بيانات الاستلام</h3>' +
      '<p><strong>' + escapeHtml(model.customer.name) + '</strong><br>' +
      escapeHtml(model.customer.phone) + '<br>' + escapeHtml(model.customer.address) + '</p>' +
      '<p class="muted">الدفع: ' + escapeHtml(paymentLabel(model.customer.payment)) +
      (model.customer.notes ? '<br>ملاحظات: ' + escapeHtml(model.customer.notes) : '') + '</p></div>' +
      '<div class="review-block"><h3>المنتجات</h3>' + items + '</div>' +
      '<div class="review-row review-total"><span>الإجمالي</span><strong>' + escapeHtml(money(model.total)) + '</strong></div>';
  }

  function handleReviewAction(action, pendingForm, rootRef) {
    if (!pendingForm || !rootRef) return false;

    if (action === 'confirm') {
      if (typeof rootRef.placeOrder !== 'function') return false;
      rootRef.placeOrder(pendingForm);
      return true;
    }

    if (action === 'cart') {
      if (typeof rootRef.go !== 'function') return false;
      rootRef.go('cart');
      return true;
    }

    return false;
  }

  function install() {
    var form = document.getElementById('checkoutForm');
    if (!form || form.dataset.reviewInstalled === '1') return;
    form.dataset.reviewInstalled = '1';

    var style = document.createElement('style');
    style.textContent = '#orderReviewDialog{width:min(560px,calc(100% - 28px));border:1px solid var(--line);border-radius:22px;background:#111a2c;color:var(--text);padding:0;box-shadow:0 24px 80px #000b}#orderReviewDialog::backdrop{background:#000b}.order-review-inner{padding:20px}.review-block{padding:12px 0;border-bottom:1px solid var(--line)}.review-block h3{margin:0 0 8px}.review-row{display:flex;justify-content:space-between;gap:12px;padding:8px 0}.review-total{font-size:20px;border-top:1px solid var(--brand);margin-top:10px}.order-review-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:18px;flex-wrap:wrap}';
    document.head.appendChild(style);

    var dialog = document.createElement('dialog');
    dialog.id = 'orderReviewDialog';
    dialog.setAttribute('aria-labelledby', 'orderReviewTitle');
    dialog.innerHTML = '<form method="dialog" class="order-review-inner"><h2 id="orderReviewTitle">راجع طلبك قبل الإرسال</h2><p class="muted">اتأكد من بيانات الاستلام والمنتجات. تقدر ترجع للتعديل قبل إنشاء الطلب.</p><div id="orderReviewContent"></div><div class="order-review-actions"><button class="ghost" value="cart">تعديل السلة</button><button class="ghost" value="cancel">رجوع للتعديل</button><button class="primary" value="confirm">تأكيد إرسال الطلب</button></div></form>';
    document.body.appendChild(dialog);

    var pendingForm = null;
    dialog.addEventListener('close', function () {
      var target = pendingForm;
      pendingForm = null;
      handleReviewAction(dialog.returnValue, target, window);
    });

    document.addEventListener('submit', function (event) {
      if (event.target !== form) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (!form.reportValidity()) return;

      var data = Object.fromEntries(new FormData(form));
      var lines = typeof window.cartLines === 'function' ? window.cartLines() : [];
      var total = typeof window.cartTotal === 'function' ? window.cartTotal() : 0;
      var model = buildReviewModel(data, lines, total);
      if (!validateModel(model)) return;

      if (typeof dialog.showModal !== 'function') {
        if (window.confirm('راجع بياناتك والطلب قبل الإرسال. هل تريد التأكيد؟') && typeof window.placeOrder === 'function') {
          window.placeOrder(form);
        }
        return;
      }

      document.getElementById('orderReviewContent').innerHTML = renderReviewHtml(model, window.money);
      pendingForm = form;
      dialog.returnValue = '';
      dialog.showModal();
      var confirmButton = dialog.querySelector('button[value="confirm"]');
      if (confirmButton) confirmButton.focus();
    }, true);
  }

  return {
    buildReviewModel: buildReviewModel,
    validateModel: validateModel,
    renderReviewHtml: renderReviewHtml,
    handleReviewAction: handleReviewAction,
    install: install
  };
});
