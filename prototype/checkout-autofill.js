(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.AawzCheckoutAutofill = api;
})(typeof window !== 'undefined' ? window : null, function () {
  const FIELD_CONFIG = Object.freeze({
    name: Object.freeze({ autocomplete: 'shipping name', inputmode: 'text' }),
    phone: Object.freeze({ autocomplete: 'shipping tel', inputmode: 'tel', type: 'tel' }),
    address: Object.freeze({ autocomplete: 'shipping street-address' }),
    notes: Object.freeze({ autocomplete: 'off' })
  });

  function getCheckoutAutofillConfig() {
    return FIELD_CONFIG;
  }

  function applyCheckoutAutofill(form) {
    if (!form || !form.elements) return 0;

    form.setAttribute?.('autocomplete', 'on');
    let updated = 0;

    Object.entries(FIELD_CONFIG).forEach(([name, attributes]) => {
      const field = form.elements[name];
      if (!field || typeof field.setAttribute !== 'function') return;

      Object.entries(attributes).forEach(([attribute, value]) => {
        field.setAttribute(attribute, value);
      });
      updated += 1;
    });

    return updated;
  }

  function initCheckoutAutofill(documentRef) {
    const doc = documentRef || (typeof document !== 'undefined' ? document : null);
    if (!doc) return 0;
    return applyCheckoutAutofill(doc.getElementById('checkoutForm'));
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        initCheckoutAutofill(document);
      }, { once: true });
    } else {
      initCheckoutAutofill(document);
    }
  }

  return { getCheckoutAutofillConfig, applyCheckoutAutofill, initCheckoutAutofill };
});
