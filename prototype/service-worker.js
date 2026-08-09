const CACHE_NAME = 'aawz-shell-v4';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.svg',
  './icon-512.svg',
  './reduced-motion.css',
  './focus-visible.css',
  './search-normalization.js',
  './search-landmark.js',
  './accessibility.js',
  './order-review.js',
  './duplicate-order-guard.js',
  './merchant-session.js',
  './lazy-panorama.js',
  './checkout-validation.js',
  './orders-csv-export.js',
  './search-keyboard.js',
  './view-focus.js',
  './merchant-order-filter.js',
  './cross-tab-sync.js',
  './network-status.js',
  './checkout-draft.js',
  './checkout-autofill.js',
  './service-worker-update.js',
  './product-delete-undo.js',
  './low-stock-alert.js',
  './skip-link.js',
  './active-navigation.js',
  './customer-order-cancel.js',
  './register-service-worker.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key.startsWith('aawz-shell-') && key !== CACHE_NAME)
        .map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      }
      return response;
    }))
  );
});
