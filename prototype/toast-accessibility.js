(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root && root.document) api.installToastAccessibility(root.document);
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function installToastAccessibility(documentRef) {
    if (!documentRef || !documentRef.getElementById) return false;
    const toast = documentRef.getElementById('toast');
    if (!toast) return false;

    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-atomic', 'true');
    return true;
  }

  return { installToastAccessibility };
});
