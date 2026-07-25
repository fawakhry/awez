(function () {
  const ARABIC_DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;

  function normalizeArabic(value) {
    return String(value ?? '')
      .normalize('NFKC')
      .toLowerCase()
      .replace(ARABIC_DIACRITICS, '')
      .replace(/ـ/g, '')
      .replace(/[أإآٱ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ؤ/g, 'و')
      .replace(/ئ/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/\s+/g, ' ')
      .trim();
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { normalizeArabic };
  }

  if (typeof window === 'undefined') return;

  window.normalizeArabic = normalizeArabic;

  const originalDoSearch = doSearch;
  doSearch = function normalizedSearch() {
    const input = document.getElementById('searchInput');
    const q = normalizeArabic(input?.value);

    if (!q) return originalDoSearch();

    const filtered = stores.filter((store) => {
      const storeText = normalizeArabic(`${store.name} ${store.category} ${store.address}`);
      const hasMatchingProduct = products.some((product) =>
        normalizeArabic(`${product.name} ${product.category}`).includes(q)
      );
      return storeText.includes(q) || hasMatchingProduct;
    });

    document.getElementById('resultsList').innerHTML = filtered.length
      ? filtered.map((store) => `<article class="card store-card" onclick="openStore('${store.id}')"><div class="row"><h3>${escapeHtml(store.name)}</h3><strong>${store.rating} ★</strong></div><p>${escapeHtml(store.category)} • ${escapeHtml(store.address)}</p><p class="muted">${store.distance} كم • ${store.open ? 'مفتوح الآن' : 'مغلق'} • سلة شراء${store.id === 'kheir' ? ' • جولة 360' : ''}</p></article>`).join('')
      : '<div class="card empty"><h3>ملقيناش نتيجة</h3><p class="muted">جرّب اسم منتج أو قسم تاني.</p></div>';

    go('results');
  };
})();
