(function () {
  'use strict';

  const STORAGE_KEY = 'aawz.checkoutDraft.v1';
  const MAX_AGE_MS = 24 * 60 * 60 * 1000;
  const FIELDS = ['name', 'phone', 'address', 'payment', 'notes'];
  const LIMITS = { name: 120, phone: 30, address: 500, payment: 30, notes: 500 };

  function cleanValue(value, limit) {
    return String(value ?? '').replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, limit);
  }

  function normalizeDraft(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const data = {};
    for (const field of FIELDS) data[field] = cleanValue(value[field], LIMITS[field]);
    if (!['cash', 'card'].includes(data.payment)) data.payment = 'cash';
    return data;
  }

  function isDraftFresh(savedAt, now = Date.now()) {
    return Number.isFinite(Number(savedAt)) && Number(savedAt) <= now && now - Number(savedAt) <= MAX_AGE_MS;
  }

  function parseStoredDraft(raw, now = Date.now()) {
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || !isDraftFresh(parsed.savedAt, now)) return null;
      return normalizeDraft(parsed.data);
    } catch {
      return null;
    }
  }

  function serializeDraft(data, savedAt = Date.now()) {
    return JSON.stringify({ savedAt, data: normalizeDraft(data) });
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { STORAGE_KEY, MAX_AGE_MS, normalizeDraft, isDraftFresh, parseStoredDraft, serializeDraft };
  }

  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (window.__aawzCheckoutDraftInstalled) return;
  window.__aawzCheckoutDraftInstalled = true;

  document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('checkoutForm');
    if (!form) return;

    let saveTimer = null;
    let restoring = false;

    function readForm() {
      const result = {};
      for (const field of FIELDS) result[field] = form.elements[field]?.value ?? '';
      return normalizeDraft(result);
    }

    function saveDraft() {
      if (restoring) return;
      try {
        sessionStorage.setItem(STORAGE_KEY, serializeDraft(readForm()));
      } catch {
        // Storage can be unavailable in restricted browsing modes; the form remains usable.
      }
    }

    function scheduleSave() {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(saveDraft, 250);
    }

    function clearDraft() {
      clearTimeout(saveTimer);
      try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
    }

    function notifyRestored() {
      const notice = document.createElement('div');
      notice.className = 'notice';
      notice.setAttribute('role', 'status');
      notice.setAttribute('aria-live', 'polite');
      notice.textContent = 'تم استرجاع بيانات الطلب المحفوظة مؤقتًا على هذا التبويب.';
      form.parentElement?.insertBefore(notice, form);
      setTimeout(() => notice.remove(), 5000);
    }

    try {
      const draft = parseStoredDraft(sessionStorage.getItem(STORAGE_KEY));
      if (draft) {
        restoring = true;
        for (const field of FIELDS) {
          const control = form.elements[field];
          if (control) control.value = draft[field];
        }
        restoring = false;
        if (FIELDS.some(field => draft[field] && field !== 'payment')) notifyRestored();
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch {}

    form.addEventListener('input', scheduleSave);
    form.addEventListener('change', scheduleSave);
    form.addEventListener('reset', clearDraft);
    window.addEventListener('pagehide', saveDraft);
  });
})();
