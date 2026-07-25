const assert = require('node:assert/strict');
const { normalizeSpaces, normalizeEgyptianPhone, validateCheckoutData } = require('../prototype/checkout-validation.js');

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

console.log('Checkout validation tests passed');
