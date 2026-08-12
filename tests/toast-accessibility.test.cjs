const assert = require('node:assert/strict');
const { installToastAccessibility } = require('../prototype/toast-accessibility.js');

function fakeToast() {
  const attributes = new Map();
  return {
    attributes,
    setAttribute(name, value) { attributes.set(name, value); },
    getAttribute(name) { return attributes.get(name) ?? null; }
  };
}

{
  const toast = fakeToast();
  const documentRef = { getElementById: (id) => id === 'toast' ? toast : null };
  assert.equal(installToastAccessibility(documentRef), true);
  assert.equal(toast.getAttribute('role'), 'status');
  assert.equal(toast.getAttribute('aria-atomic'), 'true');
}

assert.equal(installToastAccessibility({ getElementById: () => null }), false);
assert.equal(installToastAccessibility(null), false);

console.log('Toast accessibility status-region tests passed');
