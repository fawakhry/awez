const test = require('node:test');
const assert = require('node:assert/strict');
const { installEscapeClearSearch } = require('../prototype/search-landmark.js');

function makeInput(value = 'زيت') {
  const attrs = new Map();
  const listeners = new Map();
  return {
    value,
    setAttribute(name, val) { attrs.set(name, String(val)); },
    getAttribute(name) { return attrs.get(name) || null; },
    addEventListener(type, handler) { listeners.set(type, handler); },
    listener(type) { return listeners.get(type); }
  };
}

test('Escape clears a non-empty search and runs one refreshed search', () => {
  let searches = 0;
  let cancelled = 0;
  let prevented = 0;
  const input = makeInput('زيت');
  input.__aawzCancelPendingSearch = () => { cancelled += 1; return true; };
  const root = { doSearch() { searches += 1; } };

  assert.equal(installEscapeClearSearch(root, input), true);
  assert.equal(input.getAttribute('data-aawz-escape-clear'), '1');
  input.listener('keydown')({ key: 'Escape', isComposing: false, preventDefault() { prevented += 1; } });

  assert.equal(input.value, '');
  assert.equal(cancelled, 1);
  assert.equal(searches, 1);
  assert.equal(prevented, 1);
});

test('Escape is a no-op for empty search, IME composition, and repeated installation', () => {
  let searches = 0;
  const input = makeInput('');
  const root = { doSearch() { searches += 1; } };

  assert.equal(installEscapeClearSearch(root, input), true);
  assert.equal(installEscapeClearSearch(root, input), true);
  input.listener('keydown')({ key: 'Escape', isComposing: false });
  assert.equal(searches, 0);

  input.value = 'رز';
  input.listener('keydown')({ key: 'Escape', isComposing: true });
  assert.equal(input.value, 'رز');
  assert.equal(searches, 0);
});
