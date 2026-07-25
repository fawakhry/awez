(function () {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('./service-worker.js', { scope: './', updateViaCache: 'none' })
      .catch(function () {
        // التسجيل تحسين تدريجي؛ فشله لا يمنع تشغيل المنصة.
      });
  });
})();
