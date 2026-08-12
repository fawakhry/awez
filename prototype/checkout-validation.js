(function () {
  var CHECKOUT_LIMITS = Object.freeze({ name: 80, address: 240, notes: 500 });

  function normalizeSpaces(value) {
    return String(value ?? '').replace(/\s+/g, ' ').trim();
  }

  function normalizeEgyptianPhone(value) {
    return String(value ?? '').replace(/[\s()+-]/g, '');
  }

  function validateCheckoutData(data) {
    var errors = {};
    var name = normalizeSpaces(data && data.name);
    var phone = normalizeEgyptianPhone(data && data.phone);
    var address = normalizeSpaces(data && data.address);
    var notes = normalizeSpaces(data && data.notes);

    if (name.length < 2) errors.name = 'اكتب اسم المستلم من حرفين على الأقل.';
    else if (name.length > CHECKOUT_LIMITS.name) errors.name = 'اسم المستلم طويل جدًا. اختصره إلى ' + CHECKOUT_LIMITS.name + ' حرفًا أو أقل.';
    if (!/^01[0125]\d{8}$/.test(phone)) errors.phone = 'اكتب رقم موبايل مصري صحيح مكوّن من 11 رقمًا ويبدأ بـ 01.';
    if (address.length < 10) errors.address = 'اكتب عنوانًا أوضح من 10 أحرف على الأقل، مع الشارع أو علامة مميزة.';
    else if (address.length > CHECKOUT_LIMITS.address) errors.address = 'العنوان طويل جدًا. اختصره إلى ' + CHECKOUT_LIMITS.address + ' حرفًا أو أقل.';
    if (notes.length > CHECKOUT_LIMITS.notes) errors.notes = 'الملاحظات طويلة جدًا. اختصرها إلى ' + CHECKOUT_LIMITS.notes + ' حرفًا أو أقل.';

    return {
      valid: Object.keys(errors).length === 0,
      errors: errors,
      values: { name: name, phone: phone, address: address, notes: notes }
    };
  }

  function validateCartAvailability(lines) {
    if (!Array.isArray(lines) || !lines.length) {
      return { valid: false, issues: [{ reason: 'empty-cart' }] };
    }

    var issues = [];
    lines.forEach(function (line) {
      var product = line && (line.product || line);
      var qty = Number(line && line.qty) || 0;
      var stock = Number(product && product.stock);

      if (!product || qty <= 0) {
        issues.push({ reason: 'invalid-item', product: product, qty: qty });
      } else if (product.active === false) {
        issues.push({ reason: 'inactive', product: product, qty: qty, stock: stock });
      } else if (!Number.isFinite(stock) || stock < qty) {
        issues.push({ reason: 'insufficient-stock', product: product, qty: qty, stock: Number.isFinite(stock) ? stock : 0 });
      }
    });

    return { valid: issues.length === 0, issues: issues };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      CHECKOUT_LIMITS: CHECKOUT_LIMITS,
      normalizeSpaces: normalizeSpaces,
      normalizeEgyptianPhone: normalizeEgyptianPhone,
      validateCheckoutData: validateCheckoutData,
      validateCartAvailability: validateCartAvailability
    };
  }

  if (typeof document === 'undefined') return;

  function removeErrors(form) {
    var summary = form.querySelector('[data-checkout-errors]');
    if (summary) summary.remove();
    var stockError = form.querySelector('[data-checkout-stock-error]');
    if (stockError) stockError.remove();
    form.querySelectorAll('[data-field-error]').forEach(function (node) { node.remove(); });
    form.querySelectorAll('[aria-invalid="true"]').forEach(function (field) {
      field.removeAttribute('aria-invalid');
      field.removeAttribute('aria-describedby');
    });
  }

  function showErrors(form, result) {
    removeErrors(form);
    var labels = { name: 'الاسم', phone: 'رقم الموبايل', address: 'العنوان', notes: 'الملاحظات' };
    var keys = Object.keys(result.errors);
    var summary = document.createElement('div');
    summary.className = 'notice';
    summary.setAttribute('role', 'alert');
    summary.setAttribute('tabindex', '-1');
    summary.setAttribute('data-checkout-errors', '');
    summary.style.marginBottom = '14px';
    summary.innerHTML = '<strong>راجع البيانات التالية:</strong><ul style="margin-bottom:0">' + keys.map(function (key) {
      return '<li><a href="#checkout-' + key + '" style="color:inherit">' + labels[key] + ': ' + result.errors[key] + '</a></li>';
    }).join('') + '</ul>';
    form.prepend(summary);

    keys.forEach(function (key) {
      var field = form.elements[key];
      if (!field) return;
      field.id = field.id || 'checkout-' + key;
      field.setAttribute('aria-invalid', 'true');
      var error = document.createElement('small');
      error.id = field.id + '-error';
      error.setAttribute('data-field-error', '');
      error.style.display = 'block';
      error.style.color = '#fecaca';
      error.style.marginTop = '6px';
      error.textContent = result.errors[key];
      field.setAttribute('aria-describedby', error.id);
      field.insertAdjacentElement('afterend', error);
    });

    summary.focus();
    var first = form.elements[keys[0]];
    if (first) setTimeout(function () { first.focus(); }, 150);
  }

  function showAvailabilityError(form, availability) {
    removeErrors(form);
    var issue = availability.issues[0] || { reason: 'empty-cart' };
    var productName = issue.product && issue.product.name ? issue.product.name : 'المنتج';
    var message = 'السلة فاضية. ارجع للسلة وأضف منتجات قبل إرسال الطلب.';
    if (issue.reason === 'inactive') message = productName + ' لم يعد متاحًا حاليًا. ارجع للسلة واختر بديلًا.';
    if (issue.reason === 'insufficient-stock') message = 'الكمية المتاحة من ' + productName + ' هي ' + issue.stock + ' فقط. ارجع للسلة وعدّل الكمية.';
    if (issue.reason === 'invalid-item') message = 'فيه منتج غير صالح في السلة. ارجع للسلة وراجع الكميات.';

    var notice = document.createElement('div');
    notice.className = 'notice';
    notice.setAttribute('role', 'alert');
    notice.setAttribute('tabindex', '-1');
    notice.setAttribute('data-checkout-stock-error', '');
    notice.style.marginBottom = '14px';
    notice.textContent = message;
    form.prepend(notice);
    notice.focus();
  }

  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('checkoutForm');
    if (!form) return;

    form.setAttribute('novalidate', '');
    var phone = form.elements.phone;
    if (phone) {
      phone.setAttribute('autocomplete', 'tel');
      phone.setAttribute('inputmode', 'tel');
      phone.setAttribute('maxlength', '14');
    }
    if (form.elements.name) {
      form.elements.name.setAttribute('autocomplete', 'name');
      form.elements.name.setAttribute('maxlength', String(CHECKOUT_LIMITS.name));
    }
    if (form.elements.address) {
      form.elements.address.setAttribute('autocomplete', 'street-address');
      form.elements.address.setAttribute('maxlength', String(CHECKOUT_LIMITS.address));
    }
    if (form.elements.notes) form.elements.notes.setAttribute('maxlength', String(CHECKOUT_LIMITS.notes));

    form.addEventListener('submit', function (event) {
      var data = Object.fromEntries(new FormData(form));
      var result = validateCheckoutData(data);
      if (!result.valid) {
        event.preventDefault();
        event.stopImmediatePropagation();
        showErrors(form, result);
        return;
      }

      var lines = typeof window.cartLines === 'function' ? window.cartLines() : [];
      var availability = validateCartAvailability(lines);
      if (!availability.valid) {
        event.preventDefault();
        event.stopImmediatePropagation();
        showAvailabilityError(form, availability);
        return;
      }

      removeErrors(form);
      if (phone) phone.value = result.values.phone;
    }, true);

    form.addEventListener('input', function (event) {
      var field = event.target;
      if (field && field.getAttribute('aria-invalid') === 'true') {
        field.removeAttribute('aria-invalid');
        var error = document.getElementById(field.id + '-error');
        if (error) error.remove();
        field.removeAttribute('aria-describedby');
      }
    });
  });
})();
