(function () {
  const PANNELLUM_CSS = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';
  const PANNELLUM_JS = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';
  let libraryPromise = null;

  function needsPanoramaLibrary(scope) {
    return !(scope && scope.pannellum);
  }

  function appendStylesheet(doc, href) {
    if (doc.querySelector(`link[href="${href}"]`)) return;
    const link = doc.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    doc.head.appendChild(link);
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
      script.onload = resolve;
      script.onerror = reject;
      doc.head.appendChild(script);
    });
  }

  function loadPanoramaLibrary() {
    if (!needsPanoramaLibrary(window)) return Promise.resolve();
    if (libraryPromise) return libraryPromise;

    appendStylesheet(document, PANNELLUM_CSS);
    libraryPromise = appendScript(document, PANNELLUM_JS).catch((error) => {
      libraryPromise = null;
      throw error;
    });
    return libraryPromise;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PANNELLUM_CSS, PANNELLUM_JS, needsPanoramaLibrary };
  }

  if (typeof window === 'undefined') return;

  const originalInitTour = window.initTour;
  if (typeof originalInitTour !== 'function') return;

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
