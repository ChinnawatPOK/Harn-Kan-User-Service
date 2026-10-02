import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-for-user-stories-testing";

let app;
let mongoServer;
let token;
let userId;

async function startMemoryMongo() {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGODB_URI = uri;
  await mongoose.connect(uri);
}

async function stopMemoryMongo() {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
}

test.before(async () => {
  await startMemoryMongo();
  ({ default: app } = await import("../src/app.js"));
});

test.after(async () => {
  await stopMemoryMongo();
});

test("US1 - register a new user", async () => {
  const response = await request(app).post("/api/v1/auth/register").send({
    name: "Somchai",
    phone_number: "0812345678",
    password: "P@ssw0rd",
  });

  assert.equal(response.status, 201);
  assert.match(response.body.message, /registered successfully/i);
  assert.ok(response.body.data.user.id);
  userId = response.body.data.user.id;
});

test("US2 - login returns JWT for valid credentials", async () => {
  const response = await request(app).post("/api/v1/auth/login").send({
    phone_number: "0812345678",
    password: "P@ssw0rd",
  });

  assert.equal(response.status, 200);
  assert.ok(response.body.data.access_token);
  token = response.body.data.access_token;
});

test("US3 - get current user profile", async () => {
  const response = await request(app)
    .get("/api/v1/users/me")
    .set("Authorization", `Bearer ${token}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.data.id, userId);
  assert.equal(response.body.data.name, "Somchai");
  assert.equal(response.body.data.password_hash, undefined);
});

test("US4 - update current user profile", async () => {
  const response = await request(app)
    .put("/api/v1/users/me")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Somchai Updated",
      notification_prefs: ["sms", "email"],
      location: {
        type: "Point",
        coordinates: [100.5018, 13.7563],
      },
    });

  assert.equal(response.status, 200);
  assert.equal(response.body.data.name, "Somchai Updated");
  assert.deepEqual(response.body.data.notification_prefs, ["sms", "email"]);
  assert.deepEqual(response.body.data.location.coordinates, [100.5018, 13.7563]);
});

test("US5 - soft delete current user account", async () => {
  const response = await request(app)
    .delete("/api/v1/users/me")
    .set("Authorization", `Bearer ${token}`);

  assert.equal(response.status, 200);
  assert.match(response.body.message, /deactivated successfully/i);

  const profileResponse = await request(app)
    .get("/api/v1/users/me")
    .set("Authorization", `Bearer ${token}`);

  assert.equal(profileResponse.status, 404);
  assert.match(profileResponse.body.error.message, /User not found/i);
});
