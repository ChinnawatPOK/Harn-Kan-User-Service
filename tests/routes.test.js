const test = require('node:test');
const assert = require('node:assert/strict');

test('auth and user route modules load successfully', () => {
  assert.doesNotThrow(() => require('../routes/authRoutes'));
  assert.doesNotThrow(() => require('../routes/userRoutes'));
});
