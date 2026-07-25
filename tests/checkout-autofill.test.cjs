const assert = require('node:assert/strict');
const {
  getCheckoutAutofillConfig,
  applyCheckoutAutofill
} = require('../prototype/checkout-autofill.js');

function field() {
  return {
    attributes: {},
    setAttribute(name, value) { this.attributes[name] = value; }
  };
}

const form = {
  attributes: {},
  setAttribute(name, value) { this.attributes[name] = value; },
  elements: {
    name: field(),
    phone: field(),
    address: field(),
    notes: field()
  }
};

assert.equal(applyCheckoutAutofill(form), 4);
assert.equal(form.attributes.autocomplete, 'on');
assert.equal(form.elements.name.attributes.autocomplete, 'shipping name');
assert.equal(form.elements.phone.attributes.autocomplete, 'shipping tel');
assert.equal(form.elements.phone.attributes.type, 'tel');
assert.equal(form.elements.phone.attributes.inputmode, 'tel');
assert.equal(form.elements.address.attributes.autocomplete, 'shipping street-address');
assert.equal(form.elements.notes.attributes.autocomplete, 'off');

const config = getCheckoutAutofillConfig();
assert.deepEqual(Object.keys(config), ['name', 'phone', 'address', 'notes']);
assert.equal(applyCheckoutAutofill(null), 0);
assert.equal(applyCheckoutAutofill({ elements: {} }), 0);

console.log('Checkout autofill tests passed');
