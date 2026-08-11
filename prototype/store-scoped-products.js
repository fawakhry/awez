(function () {
  const ARABIC_DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;

  function normalize(value) {
    if (typeof window !== 'undefined' && typeof window.normalizeArabic === 'function') {
      return window.normalizeArabic(value);
    }
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

  function migrateProducts(items, defaultStoreId) {
    return items.map((item) => item.storeId ? item : { ...item, storeId: defaultStoreId });
  }

  function productsForStore(items, storeId) {
    return items.filter((item) => item.storeId === storeId);
  }

  function termMatches(text, term) {
    if (text.includes(term)) return true;
    return term.startsWith('و') && term.length > 2 && text.includes(term.slice(1));
  }

  function indexActiveProductTextByStore(productList) {
    const textByStore = new Map();
    productList.forEach((product) => {
      if (!product.active || !product.storeId) return;
      const current = textByStore.get(product.storeId) || [];
      current.push(product.name, product.category);
      textByStore.set(product.storeId, current);
    });
    return textByStore;
  }

  function filterStoresByQuery(storeList, productList, query) {
    const terms = normalize(query).split(' ').filter(Boolean);
    if (!terms.length) return storeList.slice();

    const productTextByStore = indexActiveProductTextByStore(productList);
    return storeList.filter((store) => {
      const searchableText = normalize([
        store.name,
        store.category,
        store.address,
        ...(productTextByStore.get(store.id) || []),
      ].join(' '));

      return terms.every((term) => termMatches(searchableText, term));
    });
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      migrateProducts,
      productsForStore,
      indexActiveProductTextByStore,
      filterStoresByQuery,
    };
  }

  if (typeof window === 'undefined') return;

  products = migrateProducts(products, 'kheir');
  localStorage.setItem(KEYS.products, JSON.stringify(products));

  doSearch = function storeScopedSearch() {
    const input = document.getElementById('searchInput');
    const filtered = filterStoresByQuery(stores, products, input ? input.value : '');

    document.getElementById('resultsList').innerHTML = filtered.length
      ? filtered.map((store) => `<article class="card store-card" onclick="openStore('${store.id}')"><div class="row"><h3>${escapeHtml(store.name)}</h3><strong>${store.rating} ★</strong></div><p>${escapeHtml(store.category)} • ${escapeHtml(store.address)}</p><p class="muted">${store.distance} كم • ${store.open ? 'مفتوح الآن' : 'مغلق'} • سلة شراء${store.id === 'kheir' ? ' • جولة 360' : ''}</p></article>`).join('')
      : '<div class="card empty"><h3>ملقيناش نتيجة</h3><p class="muted">جرّب اسم منتج أو قسم تاني.</p></div>';

    go('results');
  };

  renderStore = function renderScopedStore() {
    document.getElementById('storeName').textContent = selectedStore.name;
    document.getElementById('storeMeta').textContent = `${selectedStore.address} • ${selectedStore.distance} كم • ${selectedStore.rating} ★`;
    const available = productsForStore(products, selectedStore.id).filter((product) => product.active);
    document.getElementById('productsGrid').innerHTML = available.length
      ? available.map((product) => `<article class="card product-card ${product.stock < 1 ? 'out' : ''}"><div class="product-icon">${escapeHtml(product.icon || '🛒')}</div><h3>${escapeHtml(product.name)}</h3><div class="muted">${escapeHtml(product.category)} • المخزون ${product.stock}</div><div class="row" style="margin-top:12px"><div class="price">${money(product.price)}</div><button class="primary" onclick="addToCart('${product.id}')" ${product.stock < 1 ? 'disabled' : ''}>${product.stock < 1 ? 'نفد' : 'ضيف'}</button></div></article>`).join('')
      : '<div class="card empty"><h3>لا توجد منتجات مضافة لهذا المتجر بعد</h3><p class="muted">المنتجات المعروضة مرتبطة الآن بمتجرها الصحيح.</p></div>';
  };

  const originalSaveProduct = saveProduct;
  saveProduct = function saveScopedProduct(form) {
    const existingId = form.elements.id.value;
    originalSaveProduct(form);
    const saved = existingId ? productById(existingId) : products[0];
    if (saved && !saved.storeId) {
      saved.storeId = 'kheir';
      save();
    }
  };

  const originalResetDemo = resetDemo;
  resetDemo = function resetScopedDemo() {
    originalResetDemo();
    products = migrateProducts(products, 'kheir');
    save();
  };
})();