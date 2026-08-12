const assert = require('node:assert/strict');
const {
  filterOrders,
  getOrderNoteText,
  appendOrderNotes
} = require('../prototype/merchant-order-filter.js');

assert.equal(getOrderNoteText({ customer: { notes: '  اتصل قبل الوصول  ' } }), 'اتصل قبل الوصول');
assert.equal(getOrderNoteText({ customer: {} }), '');
assert.equal(getOrderNoteText(null), '');

const created = [];
const fakeDocument = {
  createElement(tag) {
    const node = { tag, className: '', style: {}, textContent: '' };
    created.push(node);
    return node;
  }
};

function card() {
  return {
    ownerDocument: fakeDocument,
    children: [],
    appendChild(node) { this.children.push(node); }
  };
}

const firstCard = card();
const secondCard = card();
const container = {
  querySelectorAll(selector) {
    assert.equal(selector, '.order-card');
    return [firstCard, secondCard];
  }
};

const list = [
  { id: 'AWZ-1', customer: { notes: 'اتصل قبل الوصول' } },
  { id: 'AWZ-2', customer: { notes: '   ' } }
];

assert.equal(appendOrderNotes(container, list), 1);
assert.equal(firstCard.children.length, 1);
assert.equal(firstCard.children[0].className, 'muted merchant-order-note');
assert.equal(firstCard.children[0].textContent, 'ملاحظة العميل: اتصل قبل الوصول');
assert.equal(secondCard.children.length, 0);
assert.equal(appendOrderNotes(null, list), 0);

const searchableOrders = [
  { id: 'AWZ-1', status: 'pending', customer: { name: 'أحمد', notes: 'الدور الثالث' }, items: [] },
  { id: 'AWZ-2', status: 'pending', customer: { name: 'سارة', notes: '' }, items: [] }
];
assert.deepEqual(filterOrders(searchableOrders, 'all', 'الدور الثالث').map((order) => order.id), ['AWZ-1']);

console.log('order notes visibility tests passed');
