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

const fakeForm = { id: 'checkoutForm' };
let placed = 0;
let openedView = '';
const rootStub = {
  placeOrder(form) {
    assert.equal(form, fakeForm);
    placed += 1;
  },
  go(view) {
    openedView = view;
  }
};

assert.equal(review.handleReviewAction('cart', fakeForm, rootStub), true);
assert.equal(openedView, 'cart');
assert.equal(placed, 0, 'editing the cart must not submit the order');
assert.equal(review.handleReviewAction('confirm', fakeForm, rootStub), true);
assert.equal(placed, 1);
assert.equal(review.handleReviewAction('cancel', fakeForm, rootStub), false);
assert.equal(review.handleReviewAction('cart', null, rootStub), false);
assert.equal(review.handleReviewAction('cart', fakeForm, {}), false);

const source = require('node:fs').readFileSync(require('node:path').join(__dirname, '../prototype/order-review.js'), 'utf8');
assert.match(source, /value="cart">تعديل السلة<\/button>/);

console.log('order-review tests passed');
