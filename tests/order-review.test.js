const assert = require('node:assert/strict');
const review = require('../prototype/order-review.js');

const model = review.buildReviewModel(
  { name: 'مستخدم تجريبي', phone: 'رقم تجريبي', address: 'عنوان تجريبي', payment: 'cash', notes: '' },
  [{ product: { name: 'منتج <تجريبي>', price: 78 }, qty: 2 }],
  156
);

assert.equal(review.validateModel(model), true);
assert.equal(model.items[0].qty, 2);
assert.equal(model.total, 156);
const html = review.renderReviewHtml(model, value => `${value} ج.م`);
assert.match(html, /156 ج\.م/);
assert.ok(html.includes('منتج &lt;تجريبي&gt;'));
assert.ok(!html.includes('منتج <تجريبي>'));
assert.equal(review.validateModel(review.buildReviewModel({}, [], 0)), false);
console.log('order-review tests passed');
