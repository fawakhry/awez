const assert = require('node:assert/strict');
const {
  createSession,
  isSessionValid,
  parseSession,
  IDLE_TIMEOUT_MS,
  ABSOLUTE_TIMEOUT_MS
} = require('../prototype/merchant-session.js');

const now = 1_700_000_000_000;
const session = createSession(now);

assert.equal(isSessionValid(session, now + 1_000), true);
assert.equal(isSessionValid({ ...session, lastActivityAt: now - IDLE_TIMEOUT_MS }, now), false);
assert.equal(isSessionValid({ ...session, createdAt: now - ABSOLUTE_TIMEOUT_MS }, now), false);
assert.equal(isSessionValid({ authenticated: false, createdAt: now, lastActivityAt: now }, now), false);
assert.deepEqual(parseSession(JSON.stringify(session)), session);
assert.equal(parseSession('{bad json'), null);

console.log('Merchant session tests passed: 6');
