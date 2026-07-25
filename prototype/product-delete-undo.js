(function () {
  function removeProductSnapshot(productList, cartState, id) {
    var index = productList.findIndex(function (product) { return product.id === id; });
    if (index < 0) return null;
    return {
      product: productList[index],
      index: index,
      cartQuantity: Number(cartState[id]) || 0
    };
  }

  function restoreProductSnapshot(productList, cartState, snapshot) {
    if (!snapshot || !snapshot.product) return false;
    if (productList.some(function (product) { return product.id === snapshot.product.id; })) return false;
    var index = Math.max(0, Math.min(snapshot.index, productList.length));
    productList.splice(index, 0, snapshot.product);
    if (snapshot.cartQuantity > 0) cartState[snapshot.product.id] = snapshot.cartQuantity;
    return true;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { removeProductSnapshot, restoreProductSnapshot };
  }

  if (typeof window === 'undefined' || typeof deleteProduct !== 'function') return;
  if (window.__aawzProductDeleteUndoInstalled) return;
  window.__aawzProductDeleteUndoInstalled = true;

  var undoTimer = null;
  var pendingSnapshot = null;

  function dismissUndo() {
    clearTimeout(undoTimer);
    undoTimer = null;
    pendingSnapshot = null;
    var banner = document.getElementById('aawzProductUndo');
    if (banner) banner.remove();
  }

  function showUndo(snapshot) {
    dismissUndo();
    pendingSnapshot = snapshot;

    var banner = document.createElement('div');
    banner.id = 'aawzProductUndo';
    banner.setAttribute('role', 'status');
    banner.setAttribute('aria-live', 'polite');
    banner.style.cssText = 'position:fixed;left:50%;bottom:88px;z-index:90;transform:translateX(-50%);width:min(92vw,520px);display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 15px;border:1px solid #f8a810;border-radius:16px;background:#111a2c;color:#f8fafc;box-shadow:0 14px 45px #0009';

    var message = document.createElement('span');
    message.textContent = 'تم حذف «' + snapshot.product.name + '».';

    var undoButton = document.createElement('button');
    undoButton.type = 'button';
    undoButton.className = 'primary';
    undoButton.textContent = 'تراجع';
    undoButton.addEventListener('click', function () {
      if (!pendingSnapshot || !restoreProductSnapshot(products, cart, pendingSnapshot)) return;
      save();
      renderMerchantProducts();
      toast('تم استرجاع المنتج');
      dismissUndo();
    });

    banner.appendChild(message);
    banner.appendChild(undoButton);
    document.body.appendChild(banner);
    undoTimer = setTimeout(dismissUndo, 8000);
  }

  deleteProduct = function (id) {
    var snapshot = removeProductSnapshot(products, cart, id);
    if (!snapshot || !confirm('متأكد من حذف المنتج؟ يمكنك التراجع خلال 8 ثوانٍ.')) return;
    products = products.filter(function (product) { return product.id !== id; });
    delete cart[id];
    save();
    renderMerchantProducts();
    toast('تم حذف المنتج');
    showUndo(snapshot);
  };
})();
