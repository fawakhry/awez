const assert = require('node:assert/strict');
const { DEFAULT_THRESHOLD, getLowStockProducts, renderLowStockNotice } = require('../prototype/low-stock-dashboard.js');

const products = [
  { id: 'a', name: 'أرز', stock: 2, active: true },
  { id: 'b', name: 'زيت', stock: 8, active: true },
  { id: 'c', name: 'سكر', stock: 0, active: true },
  { id: 'd', name: 'موقوف', stock: 1, active: false }
];

assert.equal(DEFAULT_THRESHOLD, 3);
assert.deepEqual(getLowStockProducts(products).map((product) => product.id), ['c', 'a']);
assert.deepEqual(getLowStockProducts(products, 1).map((product) => product.id), ['c']);
assert.deepEqual(getLowStockProducts(null), []);

function element(tag) {
  return {
    tag,
    children: [],
    dataset: {},
    style: {},
    className: '',
    textContent: '',
    removed: false,
    appendChild(child) { this.children.push(child); return child; },
    addEventListener(type, handler) { if (type === 'click') this.clickHandler = handler; },
    remove() { this.removed = true; }
  };
}

const dashboard = element('div');
dashboard.querySelector = () => null;
const documentRef = {
  getElementById(id) { return id === 'tab-dashboard' ? dashboard : null; },
  createElement: element
};
let openedTab = '';
const rootRef = { merchantTab(name) { openedTab = name; } };

assert.equal(renderLowStockNotice(documentRef, products, rootRef), 2);
const card = dashboard.children[0];
assert.equal(card.dataset.lowStockAlert, 'true');
assert.match(card.children[0].textContent, /2/);
assert.match(card.children[1].textContent, /3/);
assert.equal(card.children[2].children.length, 2);
assert.match(card.children[2].children[0].textContent, /سكر/);
card.children[3].clickHandler();
assert.equal(openedTab, 'products');

console.log('low-stock-dashboard tests passed');
