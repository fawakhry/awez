(function (root) {
  "use strict";

  const FOCUSABLE_SELECTOR = [
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "a[href]",
    "[tabindex]:not([tabindex='-1'])"
  ].join(",");

  function installProductDialogAccessibility(documentRef, rootRef) {
    if (!documentRef || !rootRef || documentRef.documentElement.dataset.productDialogA11y === "1") return false;

    const backdrop = documentRef.getElementById("productModal");
    const dialog = backdrop && backdrop.querySelector(".modal");
    const title = documentRef.getElementById("productModalTitle");
    if (!backdrop || !dialog || !title || typeof rootRef.openProductModal !== "function" || typeof rootRef.closeProductModal !== "function") return false;

    documentRef.documentElement.dataset.productDialogA11y = "1";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", title.id);

    let opener = null;
    const originalOpen = rootRef.openProductModal;
    const originalClose = rootRef.closeProductModal;

    function focusableItems() {
      return Array.from(dialog.querySelectorAll(FOCUSABLE_SELECTOR)).filter((element) => !element.hidden);
    }

    function onKeydown(event) {
      if (!backdrop.classList.contains("show")) return;
      if (event.key === "Escape") {
        event.preventDefault();
        rootRef.closeProductModal();
        return;
      }
      if (event.key !== "Tab") return;

      const items = focusableItems();
      if (!items.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && documentRef.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && documentRef.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    rootRef.openProductModal = function (...args) {
      opener = documentRef.activeElement;
      const result = originalOpen.apply(this, args);
      const firstField = dialog.querySelector("input:not([type='hidden']), select, textarea, button");
      (firstField || dialog).focus();
      return result;
    };

    rootRef.closeProductModal = function (...args) {
      const result = originalClose.apply(this, args);
      if (opener && typeof opener.focus === "function" && opener.isConnected !== false) opener.focus();
      opener = null;
      return result;
    };

    documentRef.addEventListener("keydown", onKeydown);
    return true;
  }

  if (typeof module !== "undefined" && module.exports) module.exports = { installProductDialogAccessibility, FOCUSABLE_SELECTOR };
  if (root.document) installProductDialogAccessibility(root.document, root);
})(typeof window !== "undefined" ? window : globalThis);
