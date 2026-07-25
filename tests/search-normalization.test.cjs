const assert = require('node:assert/strict');
const { normalizeArabic } = require('../prototype/search-normalization.js');

const cases = [
  ['أَرُزّ', 'ارز'],
  ['سوبر ماركـت', 'سوبر ماركت'],
  ['بقالة', 'بقاله'],
  ['إكسسوارات', 'اكسسوارات'],
  ['على', 'علي'],
  ['  زيت   ورز  ', 'زيت ورز']
];

for (const [input, expected] of cases) {
  assert.equal(normalizeArabic(input), expected, `${input} should normalize to ${expected}`);
}

console.log(`Arabic search normalization tests passed: ${cases.length}`);
