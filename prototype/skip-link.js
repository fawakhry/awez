(function (root, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  if (root && root.document) {
    api.installSkipLink(root.document);
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const LINK_ID = "aawz-skip-link";
  const TARGET_ID = "main-content";
  const STYLE_ID = "aawz-skip-link-style";

  function installSkipLink(documentRef) {
    if (!documentRef || !documentRef.body || !documentRef.head) return false;
    if (documentRef.getElementById(LINK_ID)) return false;

    const main = documentRef.querySelector("main");
    if (!main) return false;

    if (!main.id) main.id = TARGET_ID;
    if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");

    if (!documentRef.getElementById(STYLE_ID)) {
      const style = documentRef.createElement("style");
      style.id = STYLE_ID;
      style.textContent = [
        ".aawz-skip-link{position:fixed;top:10px;right:10px;z-index:1000;padding:12px 16px;border-radius:12px;background:#f8a810;color:#101827;font-weight:800;text-decoration:none;transform:translateY(-160%);transition:transform .15s}",
        ".aawz-skip-link:focus{transform:translateY(0);outline:3px solid #fff;outline-offset:3px}"
      ].join("");
      documentRef.head.appendChild(style);
    }

    const link = documentRef.createElement("a");
    link.id = LINK_ID;
    link.className = "aawz-skip-link";
    link.href = `#${main.id}`;
    link.textContent = "تخطَّ إلى المحتوى الرئيسي";
    link.addEventListener("click", function () {
      if (typeof main.focus === "function") {
        setTimeout(function () {
          main.focus({ preventScroll: false });
        }, 0);
      }
    });

    documentRef.body.insertBefore(link, documentRef.body.firstChild);
    return true;
  }

  return {
    installSkipLink,
    LINK_ID,
    TARGET_ID,
    STYLE_ID
  };
});
