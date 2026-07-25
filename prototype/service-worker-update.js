(function () {
  function shouldNotifyUpdate(hadController, isReloading) {
    return Boolean(hadController && !isReloading);
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { shouldNotifyUpdate };
  }

  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  if (window.__aawzServiceWorkerUpdateInstalled) return;
  window.__aawzServiceWorkerUpdateInstalled = true;

  var hadController = Boolean(navigator.serviceWorker.controller);
  var isReloading = false;

  function showUpdateBanner() {
    if (document.getElementById('aawzUpdateBanner')) return;

    var banner = document.createElement('div');
    banner.id = 'aawzUpdateBanner';
    banner.setAttribute('role', 'status');
    banner.setAttribute('aria-live', 'polite');
    banner.style.cssText = [
      'position:fixed',
      'left:50%',
      'bottom:88px',
      'z-index:80',
      'transform:translateX(-50%)',
      'width:min(92vw,620px)',
      'display:flex',
      'align-items:center',
      'justify-content:space-between',
      'gap:12px',
      'padding:13px 15px',
      'border:1px solid #f8a810',
      'border-radius:16px',
      'background:#111a2c',
      'color:#f8fafc',
      'box-shadow:0 14px 45px #0009'
    ].join(';');

    var message = document.createElement('span');
    message.textContent = 'في نسخة أحدث من عاوز جاهزة.';

    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'primary';
    button.textContent = 'تحديث الآن';
    button.addEventListener('click', function () {
      isReloading = true;
      window.location.reload();
    });

    banner.appendChild(message);
    banner.appendChild(button);
    document.body.appendChild(banner);
  }

  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (shouldNotifyUpdate(hadController, isReloading)) showUpdateBanner();
    hadController = true;
  });
})();
