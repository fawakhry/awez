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

function fakeButton(label) {
  const attributes = new Map();
  return {
    textContent: label,
    disabled: false,
    dataset: {},
    setAttribute(name, value) { attributes.set(name, value); },
    removeAttribute(name) { attributes.delete(name); },
    getAttribute(name) { return attributes.get(name); }
  };
}

const checkoutButton = fakeButton('تأكيد وإرسال الطلب');
const reviewButton = fakeButton('تأكيد الطلب');
guard.setSubmittingState([checkoutButton, reviewButton], true);
assert.equal(checkoutButton.disabled, true, 'زر الإرسال يجب أن يتعطل أثناء الإرسال');
assert.equal(checkoutButton.textContent, guard.SUBMITTING_LABEL, 'يجب إظهار حالة الإرسال للمستخدم');
assert.equal(checkoutButton.getAttribute('aria-busy'), 'true', 'يجب وصف حالة الانشغال برمجيًا');
assert.equal(reviewButton.textContent, guard.SUBMITTING_LABEL, 'زر المراجعة يجب أن يعرض نفس الحالة');

guard.setSubmittingState([checkoutButton, reviewButton], false);
assert.equal(checkoutButton.disabled, false, 'زر الإرسال يجب أن يعود متاحًا');
assert.equal(checkoutButton.textContent, 'تأكيد وإرسال الطلب', 'يجب استعادة النص الأصلي');
assert.equal(checkoutButton.getAttribute('aria-busy'), undefined, 'يجب إزالة حالة الانشغال بعد الإرسال');
assert.equal(reviewButton.textContent, 'تأكيد الطلب', 'يجب استعادة نص زر المراجعة');
assert.equal('aawzSubmitLabel' in checkoutButton.dataset, false, 'لا يجب ترك بيانات مؤقتة بعد الاستعادة');

console.log('Duplicate order guard tests passed');
