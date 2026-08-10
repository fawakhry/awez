const assert = require('node:assert/strict');
const { normalizeSpaces, normalizeEgyptianPhone, validateCheckoutData, validateCartAvailability } = require('../prototype/checkout-validation.js');

assert.equal(normalizeSpaces('  شارع   فريد ندا  '), 'شارع فريد ندا');
assert.equal(normalizeEgyptianPhone('+20 (010) 1234-5678'), '2001012345678');
assert.equal(normalizeEgyptianPhone('010 1234 5678'), '01012345678');

const valid = validateCheckoutData({ name: 'أحمد', phone: '010 1234 5678', address: 'شارع فريد ندا بجوار المحطة' });
assert.equal(valid.valid, true);
assert.equal(valid.values.phone, '01012345678');

const invalid = validateCheckoutData({ name: 'ا', phone: '123', address: 'بنها' });
assert.equal(invalid.valid, false);
assert.deepEqual(Object.keys(invalid.errors).sort(), ['address', 'name', 'phone']);

for (const phone of ['01012345678', '01112345678', '01212345678', '01512345678']) {
  assert.equal(validateCheckoutData({ name: 'محمود', phone, address: 'بنها شارع الكورنيش بجوار النادي' }).valid, true, phone);
}

assert.equal(validateCartAvailability([]).valid, false);
assert.equal(validateCartAvailability([{ product: { id: 'p1', name: 'زيت', stock: 3, active: true }, qty: 2 }]).valid, true);

const insufficient = validateCartAvailability([{ product: { id: 'p1', name: 'زيت', stock: 1, active: true }, qty: 2 }]);
assert.equal(insufficient.valid, false);
assert.equal(insufficient.issues[0].reason, 'insufficient-stock');
assert.equal(insufficient.issues[0].stock, 1);

const inactive = validateCartAvailability([{ product: { id: 'p2', name: 'لبن', stock: 5, active: false }, qty: 1 }]);
assert.equal(inactive.valid, false);
assert.equal(inactive.issues[0].reason, 'inactive');

console.log('Checkout validation tests passed');
