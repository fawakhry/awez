(function () {
  function getNetworkMessage(isOnline) {
    return isOnline
      ? 'رجع الاتصال بالإنترنت. تقدر تكمّل استخدام المنصة.'
      : 'أنت غير متصل بالإنترنت حاليًا. البيانات المحفوظة على الجهاز ما زالت متاحة، لكن بعض المزايا مثل جولة 360 قد لا تعمل.';
  }

  function getNetworkState(value) {
    return value === false ? 'offline' : 'online';
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getNetworkMessage, getNetworkState };
  }

  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (window.__aawzNetworkStatusInstalled) return;
  window.__aawzNetworkStatusInstalled = true;

  function createBanner() {
    var banner = document.createElement('div');
    banner.id = 'networkStatusBanner';
    banner.setAttribute('role', 'status');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-atomic', 'true');
    banner.hidden = true;
    banner.style.position = 'sticky';
    banner.style.top = '67px';
    banner.style.zIndex = '18';
    banner.style.margin = '0 auto';
    banner.style.maxWidth = '1100px';
    banner.style.padding = '10px 16px';
    banner.style.borderBottom = '1px solid #854d0e';
    banner.style.background = '#422006';
    banner.style.color = '#fef3c7';
    banner.style.fontWeight = '700';
    banner.style.textAlign = 'center';
    document.body.insertBefore(banner, document.body.firstChild);
    return banner;
  }

  var banner;
  var wasOffline = false;
  var onlineTimer;

  function render(isOnline, initial) {
    banner = banner || createBanner();
    clearTimeout(onlineTimer);
    banner.dataset.networkState = getNetworkState(isOnline);

    if (!isOnline) {
      wasOffline = true;
      banner.textContent = getNetworkMessage(false);
      banner.hidden = false;
      return;
    }

    if (initial || !wasOffline) {
      banner.hidden = true;
      banner.textContent = '';
      return;
    }

    wasOffline = false;
    banner.style.background = '#052e16';
    banner.style.borderBottomColor = '#166534';
    banner.style.color = '#bbf7d0';
    banner.textContent = getNetworkMessage(true);
    banner.hidden = false;
    onlineTimer = setTimeout(function () {
      banner.hidden = true;
      banner.textContent = '';
      banner.style.background = '#422006';
      banner.style.borderBottomColor = '#854d0e';
      banner.style.color = '#fef3c7';
    }, 3500);
  }

  window.addEventListener('offline', function () { render(false, false); });
  window.addEventListener('online', function () { render(true, false); });
  document.addEventListener('DOMContentLoaded', function () {
    render(navigator.onLine !== false, true);
  });
})();
