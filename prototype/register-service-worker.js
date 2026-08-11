(function () {
  if (!('serviceWorker' in navigator)) return;

  function registerServiceWorker() {
    navigator.serviceWorker.register('./service-worker.js', { scope: './', updateViaCache: 'none' })
      .catch(function () {
        // التسجيل تحسين تدريجي؛ فشله لا يمنع تشغيل المنصة.
      });
  }

  function scheduleRegistration() {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(registerServiceWorker, { timeout: 2000 });
      return;
    }
    window.setTimeout(registerServiceWorker, 0);
  }

  if (document.readyState === 'complete') {
    scheduleRegistration();
  } else {
    window.addEventListener('load', scheduleRegistration, { once: true });
  }
})();
