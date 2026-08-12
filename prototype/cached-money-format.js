(function (root, factory) {
  'use strict';

  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;

  if (root && typeof root.money === 'function' && root.Intl?.NumberFormat) {
    root.money = api.createMoneyFormatter(root.Intl.NumberFormat);
  }
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const LOCALE = 'ar-EG';
  const OPTIONS = Object.freeze({
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 2
  });

  function createMoneyFormatter(NumberFormat) {
    const formatter = new NumberFormat(LOCALE, OPTIONS);
    return function formatMoney(value) {
      return formatter.format(Number(value) || 0);
    };
  }

  return { LOCALE, OPTIONS, createMoneyFormatter };
});
