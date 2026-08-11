(function () {
  const PANNELLUM_CSS = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.7/build/pannellum.css';
  const PANNELLUM_JS = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.7/build/pannellum.js';
  const PANNELLUM_ORIGIN = new URL(PANNELLUM_JS).origin;
  const LEGACY_PANNELLUM_PATTERN = /pannellum@2\.5\.6\/build\/pannellum\.(?:css|js)$/;
  const REFERRER_POLICY = 'no-referrer';
  let libraryPromise = null;

  function needsPanoramaLibrary(scope) {
    return !(scope && scope.pannellum);
  }

  function hasLegacyPanoramaAssets(doc) {
    if (!doc || typeof doc.querySelectorAll !== 'function') return false;
    const assets = doc.querySelectorAll('script[src], link[href]');
    return Array.from(assets).some((asset) => {
      const value = asset.src || asset.href || '';
      return LEGACY_PANNELLUM_PATTERN.test(String(value));
    });
  }

  function needsPanoramaUpgrade(scope, doc) {
    return needsPanoramaLibrary(scope) || hasLegacyPanoramaAssets(doc);
  }

  function isStylesheetReady(link) {
    return Boolean(link && link.sheet);
  }

  function setPanoramaBusy(doc, busy) {
    if (!doc || typeof doc.getElementById !== 'function') return false;
    const panorama = doc.getElementById('panorama');
    if (!panorama || typeof panorama.setAttribute !== 'function') return false;
    panorama.setAttribute('aria-busy', busy ? 'true' : 'false');
    return true;
  }

  function ensurePreconnect(doc, origin) {
    if (!doc || !doc.head || typeof doc.createElement !== 'function') return null;

    const targetOrigin = origin || PANNELLUM_ORIGIN;
    const existing = doc.querySelector(`link[rel="preconnect"][href="${targetOrigin}"]`);
    if (existing) return existing;

    const link = doc.createElement('link');
    link.rel = 'preconnect';
    link.href = targetOrigin;
    link.referrerPolicy = REFERRER_POLICY;
    doc.head.appendChild(link);
    return link;
  }

  function appendStylesheet(doc, href) {
    return new Promise((resolve, reject) => {
      const existing = doc.querySelector(`link[href="${href}"]`);
      if (existing) {
        if (isStylesheetReady(existing)) resolve();
        else {
          existing.addEventListener('load', resolve, { once: true });
          existing.addEventListener('error', reject, { once: true });
        }
        return;
      }

      const link = doc.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.referrerPolicy = REFERRER_POLICY;
      link.onload = resolve;
      link.onerror = reject;
      doc.head.appendChild(link);
    });
  }

  function appendScript(doc, src) {
    return new Promise((resolve, reject) => {
      const existing = doc.querySelector(`script[src="${src}"]`);
      if (existing) {
        if (window.pannellum) resolve();
        else {
          existing.addEventListener('load', resolve, { once: true });
          existing.addEventListener('error', reject, { once: true });
        }
        return;
      }

      const script = doc.createElement('script');
      script.src = src;
      script.async = true;
      script.referrerPolicy = REFERRER_POLICY;
      script.onload = resolve;
      script.onerror = reject;
      doc.head.appendChild(script);
    });
  }

  function loadPanoramaLibrary() {
    if (!needsPanoramaUpgrade(window, document)) return Promise.resolve();
    if (libraryPromise) return libraryPromise;

    libraryPromise = Promise.all([
      appendStylesheet(document, PANNELLUM_CSS),
      appendScript(document, PANNELLUM_JS)
    ]).then(() => undefined).catch((error) => {
      libraryPromise = null;
      throw error;
    });
    return libraryPromise;
  }

  function installPanoramaPreconnect(doc) {
    if (!doc || typeof doc.querySelector !== 'function') return false;

    const trigger = doc.querySelector('[onclick="goTour()"]');
    if (!trigger || typeof trigger.addEventListener !== 'function') return false;

    const warmConnection = () => ensurePreconnect(doc, PANNELLUM_ORIGIN);
    trigger.addEventListener('pointerenter', warmConnection, { once: true });
    trigger.addEventListener('focus', warmConnection, { once: true });
    return true;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      PANNELLUM_CSS,
      PANNELLUM_JS,
      PANNELLUM_ORIGIN,
      LEGACY_PANNELLUM_PATTERN,
      REFERRER_POLICY,
      needsPanoramaLibrary,
      hasLegacyPanoramaAssets,
      needsPanoramaUpgrade,
      isStylesheetReady,
      setPanoramaBusy,
      ensurePreconnect,
      installPanoramaPreconnect
    };
  }

  if (typeof window === 'undefined') return;

  const originalInitTour = window.initTour;
  if (typeof originalInitTour !== 'function') return;

  installPanoramaPreconnect(document);

  window.initTour = async function lazyInitTour() {
    setPanoramaBusy(document, true);
    try {
      if (needsPanoramaUpgrade(window, document)) {
        if (typeof window.toast === 'function') window.toast('جاري تحميل الجولة 360');
        try {
          await loadPanoramaLibrary();
        } catch (error) {
          console.error('Unable to load Pannellum', error);
          if (typeof window.toast === 'function') window.toast('تعذر تحميل الجولة، تحقق من الإنترنت وحاول تاني');
          return;
        }
      }
      return originalInitTour();
    } finally {
      setPanoramaBusy(document, false);
    }
  };
})();
