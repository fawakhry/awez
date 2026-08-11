const assert = require("node:assert/strict");
const { updateActiveNavigation, focusActiveViewHeading, installActiveNavigation } = require("../prototype/active-navigation.js");

function makeButton(text) {
  const attrs = new Map();
  return {
    textContent: text,
    setAttribute(name, value) { attrs.set(name, String(value)); },
    removeAttribute(name) { attrs.delete(name); },
    getAttribute(name) { return attrs.get(name) || null; }
  };
}

function makeHeading() {
  const attrs = new Map();
  return {
    focusCount: 0,
    setAttribute(name, value) { attrs.set(name, String(value)); },
    getAttribute(name) { return attrs.get(name) || null; },
    focus() { this.focusCount += 1; }
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
  const headings = Object.fromEntries(
    ["home", "results", "store", "cart", "checkout", "orders", "tour", "merchantLogin", "merchant"]
      .map((id) => [id, makeHeading()])
  );
  return {
    activeId,
    title: "عاوز — هتلاقي",
    buttons,
    headings,
    documentElement: { dataset: {} },
    querySelector(selector) {
      if (selector === ".view.active") return { id: this.activeId };
      const match = selector.match(/^#(.+) h2$/);
      return match ? this.headings[match[1]] || null : null;
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
  assert.equal(documentRef.headings.home.focusCount, 0, "installation must not steal initial focus");

  rootRef.go("cart");
  assert.equal(documentRef.buttons[2].getAttribute("aria-current"), "page");
  assert.equal(documentRef.buttons[3].getAttribute("aria-current"), null);
  assert.equal(documentRef.title, "سلة المشتريات — عاوز");
  assert.equal(documentRef.headings.cart.getAttribute("tabindex"), "-1");
  assert.equal(documentRef.headings.cart.focusCount, 1);

  rootRef.go("checkout");
  assert.equal(documentRef.title, "تأكيد الطلب — عاوز");
  assert.equal(documentRef.headings.checkout.focusCount, 1);

  rootRef.go("orders");
  assert.equal(documentRef.buttons[0].getAttribute("aria-current"), "page");
  assert.equal(documentRef.buttons[4].getAttribute("aria-current"), "page");
  assert.equal(documentRef.title, "طلباتي — عاوز");
  assert.equal(documentRef.headings.orders.focusCount, 1);

  rootRef.openMerchant();
  assert.equal(documentRef.buttons[1].getAttribute("aria-current"), "page");
  assert.equal(documentRef.buttons[5].getAttribute("aria-current"), "page");
  assert.equal(documentRef.title, "لوحة التاجر — عاوز");
  assert.equal(documentRef.headings.merchant.focusCount, 1);

  documentRef.activeId = "unknown";
  assert.equal(updateActiveNavigation(documentRef), "الرئيسية");
  assert.equal(documentRef.title, "عاوز — هتلاقي");
  assert.equal(focusActiveViewHeading(documentRef), false, "missing view heading must be a safe no-op");
  assert.equal(installActiveNavigation(documentRef, rootRef), false, "installation must be idempotent");

  console.log("active-navigation tests passed");
})();

require("./product-dialog-accessibility.test.cjs");
