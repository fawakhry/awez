const assert = require('node:assert/strict');
const { getFocusTarget, prepareFocusTarget, focusView } = require('../prototype/view-focus.js');

const heading = {
  attributes: {},
  matches: () => false,
  setAttribute(name, value) { this.attributes[name] = value; },
  focus(options) { this.focusOptions = options; }
};
const view = { querySelector: () => heading };

assert.equal(getFocusTarget(view), heading);
assert.equal(prepareFocusTarget(heading), heading);
assert.equal(heading.attributes.tabindex, '-1');
assert.equal(focusView(view), true);
assert.deepEqual(heading.focusOptions, { preventScroll: true });
assert.equal(getFocusTarget(null), null);
assert.equal(focusView({ querySelector: () => null }), false);

console.log('View focus management tests passed');
