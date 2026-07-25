(function () {
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

    if (name.length < 2) errors.name = 'اكتب اسم المستلم من حرفين على الأقل.';
    if (!/^01[0125]\d{8}$/.test(phone)) errors.phone = 'اكتب رقم موبايل مصري صحيح مكوّن من 11 رقمًا ويبدأ بـ 01.';
    if (address.length < 10) errors.address = 'اكتب عنوانًا أوضح من 10 أحرف على الأقل، مع الشارع أو علامة مميزة.';

    return { valid: Object.keys(errors).length === 0, errors: errors, values: { name: name, phone: phone, address: address } };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { normalizeSpaces: normalizeSpaces, normalizeEgyptianPhone: normalizeEgyptianPhone, validateCheckoutData: validateCheckoutData };
  }

  if (typeof document === 'undefined') return;

  function removeErrors(form) {
    var summary = form.querySelector('[data-checkout-errors]');
    if (summary) summary.remove();
    form.querySelectorAll('[data-field-error]').forEach(function (node) { node.remove(); });
    form.querySelectorAll('[aria-invalid="true"]').forEach(function (field) {
      field.removeAttribute('aria-invalid');
      field.removeAttribute('aria-describedby');
    });
  }

  function showErrors(form, result) {
    removeErrors(form);
    var labels = { name: 'الاسم', phone: 'رقم الموبايل', address: 'العنوان' };
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
    if (form.elements.name) form.elements.name.setAttribute('autocomplete', 'name');
    if (form.elements.address) form.elements.address.setAttribute('autocomplete', 'street-address');

    form.addEventListener('submit', function (event) {
      var data = Object.fromEntries(new FormData(form));
      var result = validateCheckoutData(data);
      if (!result.valid) {
        event.preventDefault();
        event.stopImmediatePropagation();
        showErrors(form, result);
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
