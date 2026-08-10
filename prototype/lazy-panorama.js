(function () {
  const PANNELLUM_CSS = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.7/build/pannellum.css';
  const PANNELLUM_JS = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.7/build/pannellum.js';
  const PANNELLUM_ORIGIN = new URL(PANNELLUM_JS).origin;
  const REFERRER_POLICY = 'no-referrer';
  let libraryPromise = null;

  function needsPanoramaLibrary(scope) {
    return !(scope && scope.pannellum);
  }

  function isStylesheetReady(link) {
    return Boolean(link && link.sheet);
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
    if (!needsPanoramaLibrary(window)) return Promise.resolve();
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
      REFERRER_POLICY,
      needsPanoramaLibrary,
      isStylesheetReady,
      ensurePreconnect,
      installPanoramaPreconnect
    };
  }

  if (typeof window === 'undefined') return;

  const originalInitTour = window.initTour;
  if (typeof originalInitTour !== 'function') return;

  installPanoramaPreconnect(document);

  window.initTour = async function lazyInitTour() {
    if (!needsPanoramaLibrary(window)) return originalInitTour();

    if (typeof window.toast === 'function') window.toast('جاري تحميل الجولة 360');
    try {
      await loadPanoramaLibrary();
      return originalInitTour();
    } catch (error) {
      console.error('Unable to load Pannellum', error);
      if (typeof window.toast === 'function') window.toast('تعذر تحميل الجولة، تحقق من الإنترنت وحاول تاني');
    }
  };
})();
