const assert = require("node:assert/strict");
const { updateActiveNavigation, installActiveNavigation } = require("../prototype/active-navigation.js");

function makeButton(text) {
  const attrs = new Map();
  return {
    textContent: text,
    setAttribute(name, value) { attrs.set(name, String(value)); },
    removeAttribute(name) { attrs.delete(name); },
    getAttribute(name) { return attrs.get(name) || null; }
  };
}

function makeDocument(activeId = "home") {
  const buttons = [
    makeButton("طلباتي"),
    makeButton("التاجر"),
    makeButton("السلة 0"),
    makeButton("الرئيسية"),
    makeButton("طلباتي"),
    makeButton("التاجر")
  ];
  return {
    activeId,
    title: "عاوز — هتلاقي",
    buttons,
    documentElement: { dataset: {} },
    querySelector(selector) {
      return selector === ".view.active" ? { id: this.activeId } : null;
    },
    querySelectorAll() { return buttons; }
  };
}

(function run() {
  const documentRef = makeDocument("home");
  const rootRef = {
    go(id) { documentRef.activeId = id; },
    openMerchant() { documentRef.activeId = "merchant"; }
  };

  assert.equal(installActiveNavigation(documentRef, rootRef), true);
  assert.equal(documentRef.buttons[3].getAttribute("aria-current"), "page");
  assert.equal(documentRef.buttons[0].getAttribute("aria-current"), null);
  assert.equal(documentRef.title, "عاوز — هتلاقي");

  rootRef.go("cart");
  assert.equal(documentRef.buttons[2].getAttribute("aria-current"), "page");
  assert.equal(documentRef.buttons[3].getAttribute("aria-current"), null);
  assert.equal(documentRef.title, "سلة المشتريات — عاوز");

  rootRef.go("checkout");
  assert.equal(documentRef.title, "تأكيد الطلب — عاوز");

  rootRef.go("orders");
  assert.equal(documentRef.buttons[0].getAttribute("aria-current"), "page");
  assert.equal(documentRef.buttons[4].getAttribute("aria-current"), "page");
  assert.equal(documentRef.title, "طلباتي — عاوز");

  rootRef.openMerchant();
  assert.equal(documentRef.buttons[1].getAttribute("aria-current"), "page");
  assert.equal(documentRef.buttons[5].getAttribute("aria-current"), "page");
  assert.equal(documentRef.title, "لوحة التاجر — عاوز");

  documentRef.activeId = "unknown";
  assert.equal(updateActiveNavigation(documentRef), "الرئيسية");
  assert.equal(documentRef.title, "عاوز — هتلاقي");
  assert.equal(installActiveNavigation(documentRef, rootRef), false, "installation must be idempotent");

  console.log("active-navigation tests passed");
})();

require("./product-dialog-accessibility.test.cjs");
