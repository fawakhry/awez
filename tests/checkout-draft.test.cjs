const assert = require('node:assert/strict');
const {
  MAX_AGE_MS,
  normalizeDraft,
  isDraftFresh,
  parseStoredDraft,
  serializeDraft
} = require('../prototype/checkout-draft.js');

const normalized = normalizeDraft({
  name: '  أحمد\nمحمد  ',
  phone: ' 0100-000-0000 ',
  address: ' بنها، شارع فريد ندا ',
  payment: 'card',
  notes: '<script>alert(1)</script>',
  ignored: 'must not persist'
});

assert.deepEqual(normalized, {
  name: 'أحمد محمد',
  phone: '0100-000-0000',
  address: 'بنها، شارع فريد ندا',
  payment: 'card',
  notes: '<script>alert(1)</script>'
});
assert.equal(Object.hasOwn(normalized, 'ignored'), false);
assert.equal(normalizeDraft({ payment: 'crypto' }).payment, 'cash');
assert.equal(normalizeDraft(null), null);

const now = 2_000_000_000_000;
assert.equal(isDraftFresh(now - MAX_AGE_MS, now), true);
assert.equal(isDraftFresh(now - MAX_AGE_MS - 1, now), false);
assert.equal(isDraftFresh(now + 1, now), false);

const raw = serializeDraft(normalized, now - 1000);
assert.deepEqual(parseStoredDraft(raw, now), normalized);
assert.equal(parseStoredDraft('{broken', now), null);
assert.equal(parseStoredDraft(JSON.stringify({ savedAt: now - MAX_AGE_MS - 1, data: normalized }), now), null);

console.log('Checkout draft tests passed');
