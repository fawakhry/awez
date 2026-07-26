const assert = require("node:assert/strict");
const { installSkipLink, LINK_ID, TARGET_ID, STYLE_ID } = require("../prototype/skip-link.js");

function makeElement(tagName) {
  const attributes = new Map();
  const listeners = new Map();
  return {
    tagName,
    id: "",
    className: "",
    href: "",
    textContent: "",
    focused: false,
    hasAttribute(name) {
      return attributes.has(name);
    },
    setAttribute(name, value) {
      attributes.set(name, String(value));
    },
    getAttribute(name) {
      return attributes.get(name);
    },
    addEventListener(name, handler) {
      listeners.set(name, handler);
    },
    click() {
      const handler = listeners.get("click");
      if (handler) handler();
    },
    focus() {
      this.focused = true;
    }
  };
}

function makeDocument() {
  const main = makeElement("main");
  const nodesById = new Map();
  const body = {
    firstChild: { tagName: "div" },
    inserted: [],
    insertBefore(node) {
      this.inserted.unshift(node);
      if (node.id) nodesById.set(node.id, node);
    }
  };
  const head = {
    appended: [],
    appendChild(node) {
      this.appended.push(node);
      if (node.id) nodesById.set(node.id, node);
    }
  };

  return {
    main,
    body,
    head,
    querySelector(selector) {
      return selector === "main" ? main : null;
    },
    getElementById(id) {
      return nodesById.get(id) || null;
    },
    createElement: makeElement
  };
}

(async function run() {
  const documentRef = makeDocument();

  assert.equal(installSkipLink(documentRef), true);
  assert.equal(documentRef.main.id, TARGET_ID);
  assert.equal(documentRef.main.getAttribute("tabindex"), "-1");

  const link = documentRef.getElementById(LINK_ID);
  assert.ok(link, "skip link should be inserted");
  assert.equal(link.href, `#${TARGET_ID}`);
  assert.match(link.textContent, /المحتوى الرئيسي/);
  assert.ok(documentRef.getElementById(STYLE_ID), "focus styles should be inserted");

  assert.equal(installSkipLink(documentRef), false, "installation must be idempotent");
  assert.equal(documentRef.body.inserted.length, 1);

  link.click();
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(documentRef.main.focused, true, "activation should move focus to main content");

  console.log("skip-link tests passed");
})();
