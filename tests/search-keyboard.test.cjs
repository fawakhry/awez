const assert = require('node:assert/strict');
const { shouldSubmitSearch } = require('../prototype/search-keyboard.js');

assert.equal(shouldSubmitSearch({ key: 'Enter', isComposing: false, shiftKey: false, ctrlKey: false, altKey: false, metaKey: false }), true);
assert.equal(shouldSubmitSearch({ key: 'Enter', isComposing: true, shiftKey: false, ctrlKey: false, altKey: false, metaKey: false }), false);
assert.equal(shouldSubmitSearch({ key: 'Enter', isComposing: false, shiftKey: true, ctrlKey: false, altKey: false, metaKey: false }), false);
assert.equal(shouldSubmitSearch({ key: ' ', isComposing: false, shiftKey: false, ctrlKey: false, altKey: false, metaKey: false }), false);

console.log('Keyboard search tests passed: 4');
