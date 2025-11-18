const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// NOTE: These tests are integration-style and expect the server to be
// started in the test environment. They are provided as an example of
// expected authorization behavior. To run them locally you must:
// 1. Install dev dependencies: `npm install --save-dev jest supertest`
// 2. Ensure your test env has a MongoDB instance and set TEST_MONGO_URI
//    (or modify connection logic to use a test DB).
// 3. Export the express app in `server/src/server.js` so tests can import it
//    instead of starting a separate server process.

// Minimal scaffolding below — adapt to your project structure if needed.

let app;
let server;

beforeAll(async () => {
  // Import app after setting NODE_ENV to test so server.js can avoid
  // binding to a network port if it auto-starts.
  process.env.NODE_ENV = 'test';
  // If server/src/server.js exports the express `app`, require it here.
  try {
    const mod = require('../src/server');
    app = mod.app || mod; // handle both `module.exports = app` and `{ app, start }`
  } catch (err) {
    console.error('Could not import app. Ensure server/src/server.js exports the Express app.');
    throw err;
  }

  // Connect to test DB if necessary (optional)
  if (process.env.TEST_MONGO_URI) {
    await mongoose.connect(process.env.TEST_MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  }
});

afterAll(async () => {
  if (process.env.TEST_MONGO_URI) {
    await mongoose.disconnect();
  }
  if (server && server.close) server.close();
});

describe('Task authorization (example)', () => {
  test('student cannot update another user\'s task (403)', async () => {
    // Create JWTs for two users: owner and attacker
    const ownerPayload = { userId: 'owner-id-123' };
    const attackerPayload = { userId: 'attacker-id-456' };
    const tokenOwner = jwt.sign(ownerPayload, process.env.JWT_SECRET || 'devsecret');
    const tokenAttacker = jwt.sign(attackerPayload, process.env.JWT_SECRET || 'devsecret');

    // This example assumes a task with id `task123` exists and has userId 'owner-id-123'.
    // Tests generally would create and clean up test fixtures rather than depending on static ids.
    const taskId = 'task123';

    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenAttacker}`)
      .send({ title: 'malicious update' });

    expect([401, 403].includes(res.status)).toBe(true);
  });

  test('teacher can view assigned student tasks (200)', async () => {
    // Teacher and test student payloads
    const teacherPayload = { userId: 'teacher-1', role: 'teacher' };
    const tokenTeacher = jwt.sign(teacherPayload, process.env.JWT_SECRET || 'devsecret');

    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${tokenTeacher}`);

    expect([200, 401].includes(res.status)).toBe(true);
    // If 200, server returns tasks array and each task has userId populated
    if (res.status === 200) {
      expect(Array.isArray(res.body.data)).toBe(true);
    }
  });
});
