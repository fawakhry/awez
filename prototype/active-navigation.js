(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root && root.document) api.installActiveNavigation(root.document, root);
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const VIEW_TO_LABEL = {
    home: "الرئيسية",
    results: "الرئيسية",
    store: "الرئيسية",
    cart: "السلة",
    checkout: "السلة",
    orders: "طلباتي",
    tour: "الرئيسية",
    merchantLogin: "التاجر",
    merchant: "التاجر"
  };

  function currentViewId(documentRef) {
    const active = documentRef.querySelector(".view.active");
    return active ? active.id : "home";
  }

  function updateActiveNavigation(documentRef) {
    const currentLabel = VIEW_TO_LABEL[currentViewId(documentRef)] || "الرئيسية";
    const buttons = Array.from(documentRef.querySelectorAll(".topbar .nav-btn, .topbar .primary, .footer-nav .nav-btn"));

    buttons.forEach((button) => {
      const label = (button.textContent || "").trim();
      const isCurrent = label.startsWith(currentLabel);
      if (isCurrent) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });

    return currentLabel;
  }

  function installActiveNavigation(documentRef, rootRef) {
    if (!documentRef || documentRef.documentElement?.dataset?.activeNavigationInstalled === "true") return false;
    if (documentRef.documentElement?.dataset) documentRef.documentElement.dataset.activeNavigationInstalled = "true";

    updateActiveNavigation(documentRef);

    const originalGo = rootRef && rootRef.go;
    if (typeof originalGo === "function") {
      rootRef.go = function (...args) {
        const result = originalGo.apply(this, args);
        updateActiveNavigation(documentRef);
        return result;
      };
    }

    const originalOpenMerchant = rootRef && rootRef.openMerchant;
    if (typeof originalOpenMerchant === "function") {
      rootRef.openMerchant = function (...args) {
        const result = originalOpenMerchant.apply(this, args);
        updateActiveNavigation(documentRef);
        return result;
      };
    }

    return true;
  }

  return { VIEW_TO_LABEL, currentViewId, updateActiveNavigation, installActiveNavigation };
});
