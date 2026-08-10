const assert = require('node:assert/strict');
const guard = require('../prototype/duplicate-order-guard.js');

const data = { name: ' فوخا ', phone: '01000000000', address: 'بنها   الجديدة' };
const lines = [
  { product: { id: 'oil', name: 'زيت', price: 78 }, qty: 2 },
  { product: { id: 'rice', name: 'أرز', price: 42 }, qty: 1 }
];

const fingerprint = guard.buildFingerprint(data, lines, 198);
const reordered = guard.buildFingerprint(data, [...lines].reverse(), 198);
assert.equal(fingerprint, reordered, 'ترتيب المنتجات لا يجب أن يغير بصمة الطلب');
assert.equal(guard.isDuplicate({ fingerprint, submittedAt: 1000 }, fingerprint, 5000, 15000), true);
assert.equal(guard.isDuplicate({ fingerprint, submittedAt: 1000 }, fingerprint, 17000, 15000), false);
assert.equal(guard.isDuplicate({ fingerprint: 'different', submittedAt: 1000 }, fingerprint, 5000, 15000), false);

assert.equal(guard.shouldRecordSubmission(undefined), true, 'الإرسال الناجح الحالي لا يرجع قيمة ويجب تسجيله');
assert.equal(guard.shouldRecordSubmission(true), true, 'أي نجاح صريح يجب تسجيله');
assert.equal(guard.shouldRecordSubmission(false), false, 'فشل الإرسال لا يجب أن يمنع إعادة المحاولة');

const brokenStorage = { getItem() { return '{bad json'; } };
assert.equal(guard.readRecord(brokenStorage), null, 'يجب تحمل بيانات جلسة تالفة');

console.log('Duplicate order guard tests passed');
