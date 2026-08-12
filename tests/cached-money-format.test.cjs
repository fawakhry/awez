const assert = require('node:assert/strict');
const { LOCALE, OPTIONS, createMoneyFormatter } = require('../prototype/cached-money-format.js');

let constructions = 0;
let formats = 0;
class FakeNumberFormat {
  constructor(locale, options) {
    constructions += 1;
    assert.equal(locale, LOCALE);
    assert.deepEqual(options, OPTIONS);
  }

  format(value) {
    formats += 1;
    return `EGP:${value}`;
  }
}

const money = createMoneyFormatter(FakeNumberFormat);
assert.equal(constructions, 1, 'formatter should be created once');
assert.equal(money(12.5), 'EGP:12.5');
assert.equal(money('8'), 'EGP:8');
assert.equal(money('bad'), 'EGP:0');
assert.equal(constructions, 1, 'repeated formatting must reuse the same Intl.NumberFormat instance');
assert.equal(formats, 3);

const realMoney = createMoneyFormatter(Intl.NumberFormat);
assert.equal(realMoney(78), new Intl.NumberFormat('ar-EG', OPTIONS).format(78));

console.log('cached money formatter tests passed');
