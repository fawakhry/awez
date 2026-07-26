(function () {
  function normalize(value) {
    if (typeof window !== 'undefined' && typeof window.normalizeArabic === 'function') {
      return window.normalizeArabic(value);
    }
    return String(value ?? '').toLowerCase().trim();
  }

  function migrateProducts(items, defaultStoreId) {
    return items.map((item) => item.storeId ? item : { ...item, storeId: defaultStoreId });
  }

  function productsForStore(items, storeId) {
    return items.filter((item) => item.storeId === storeId);
  }

  function filterStoresByQuery(storeList, productList, query) {
    const q = normalize(query);
    if (!q) return storeList.slice();

    return storeList.filter((store) => {
      const storeText = normalize(`${store.name} ${store.category} ${store.address}`);
      const hasMatchingProduct = productList.some((product) =>
        product.storeId === store.id &&
        normalize(`${product.name} ${product.category}`).includes(q)
      );
      return storeText.includes(q) || hasMatchingProduct;
    });
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { migrateProducts, productsForStore, filterStoresByQuery };
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
