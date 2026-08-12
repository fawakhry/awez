const assert = require("node:assert/strict");
const { installProductDialogAccessibility, installToastStatus } = require("../prototype/product-dialog-accessibility.js");

function makeElement() {
  const attrs = new Map();
  return {
    hidden: false,
    isConnected: true,
    focused: false,
    setAttribute(name, value) { attrs.set(name, String(value)); },
    getAttribute(name) { return attrs.get(name) || null; },
    focus() { this.focused = true; documentRef.activeElement = this; }
  };
}

const opener = makeElement();
const first = makeElement();
const last = makeElement();
const toast = makeElement();
const title = { id: "productModalTitle" };
const dialog = makeElement();
dialog.querySelector = () => first;
dialog.querySelectorAll = () => [first, last];
const backdrop = {
  classList: { contains(name) { return name === "show"; } },
  querySelector(selector) { return selector === ".modal" ? dialog : null; }
};
let keydownHandler;
const documentRef = {
  activeElement: opener,
  documentElement: { dataset: {} },
  getElementById(id) {
    if (id === "productModal") return backdrop;
    if (id === "productModalTitle") return title;
    if (id === "toast") return toast;
    return null;
  },
  addEventListener(type, handler) { if (type === "keydown") keydownHandler = handler; }
};
let opened = 0;
let closed = 0;
const rootRef = {
  openProductModal() { opened += 1; },
  closeProductModal() { closed += 1; }
};

assert.equal(installToastStatus(documentRef), true);
assert.equal(toast.getAttribute("role"), "status");
assert.equal(toast.getAttribute("aria-atomic"), "true");
assert.equal(installToastStatus({ getElementById() { return null; } }), false);
assert.equal(installToastStatus(null), false);

assert.equal(installProductDialogAccessibility(documentRef, rootRef), true);
assert.equal(dialog.getAttribute("role"), "dialog");
assert.equal(dialog.getAttribute("aria-modal"), "true");
assert.equal(dialog.getAttribute("aria-labelledby"), "productModalTitle");
assert.equal(installProductDialogAccessibility(documentRef, rootRef), false, "installation must be idempotent");

rootRef.openProductModal();
assert.equal(opened, 1);
assert.equal(first.focused, true, "opening moves focus into the dialog");

documentRef.activeElement = last;
let prevented = false;
keydownHandler({ key: "Tab", shiftKey: false, preventDefault() { prevented = true; } });
assert.equal(prevented, true);
assert.equal(documentRef.activeElement, first, "Tab wraps from last to first control");

documentRef.activeElement = first;
prevented = false;
keydownHandler({ key: "Tab", shiftKey: true, preventDefault() { prevented = true; } });
assert.equal(prevented, true);
assert.equal(documentRef.activeElement, last, "Shift+Tab wraps from first to last control");

prevented = false;
keydownHandler({ key: "Escape", shiftKey: false, preventDefault() { prevented = true; } });
assert.equal(prevented, true);
assert.equal(closed, 1, "Escape closes the dialog");
assert.equal(documentRef.activeElement, opener, "closing restores focus to the opener");

console.log("product-dialog-accessibility and toast status tests passed");
