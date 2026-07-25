(function () {
  const SESSION_KEY = 'aawz.merchant.session.v1';
  const LEGACY_KEY = 'aawz.merchant.v2';
  const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
  const ABSOLUTE_TIMEOUT_MS = 8 * 60 * 60 * 1000;

  function createSession(now = Date.now()) {
    return { authenticated: true, createdAt: now, lastActivityAt: now };
  }

  function isSessionValid(session, now = Date.now()) {
    if (!session || session.authenticated !== true) return false;
    if (!Number.isFinite(session.createdAt) || !Number.isFinite(session.lastActivityAt)) return false;
    return now - session.lastActivityAt < IDLE_TIMEOUT_MS && now - session.createdAt < ABSOLUTE_TIMEOUT_MS;
  }

  function parseSession(raw) {
    try { return JSON.parse(raw); } catch { return null; }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createSession, isSessionValid, parseSession, IDLE_TIMEOUT_MS, ABSOLUTE_TIMEOUT_MS };
  }

  if (typeof window === 'undefined') return;

  function readSession() {
    return parseSession(sessionStorage.getItem(SESSION_KEY));
  }

  function writeSession(session) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(LEGACY_KEY);
  }

  function hasValidSession() {
    const session = readSession();
    if (!isSessionValid(session)) {
      clearSession();
      return false;
    }
    return true;
  }

  function refreshActivity() {
    const session = readSession();
    if (!isSessionValid(session)) return;
    session.lastActivityAt = Date.now();
    writeSession(session);
  }

  clearSession();

  window.openMerchant = function openMerchantWithSession() {
    hasValidSession() ? go('merchant') : go('merchantLogin');
  };

  window.merchantLogout = function merchantLogoutWithSession() {
    clearSession();
    go('home');
    toast('تم تسجيل الخروج');
  };

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const data = Object.fromEntries(new FormData(loginForm));
      if (data.username === 'merchant' && data.password === '1234') {
        writeSession(createSession());
        loginForm.reset();
        go('merchant');
        toast('أهلًا بيك في لوحة التاجر');
      } else {
        clearSession();
        toast('بيانات الدخول غير صحيحة');
      }
    }, true);
  }

  ['pointerdown', 'keydown', 'touchstart'].forEach(function (eventName) {
    document.addEventListener(eventName, refreshActivity, { passive: true });
  });

  setInterval(function () {
    const merchantView = document.getElementById('merchant');
    if (merchantView && merchantView.classList.contains('active') && !hasValidSession()) {
      go('merchantLogin');
      toast('انتهت جلسة التاجر بسبب عدم النشاط');
    }
  }, 60 * 1000);
})();
