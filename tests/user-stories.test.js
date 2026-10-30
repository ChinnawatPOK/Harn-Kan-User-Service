import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";
import User from "../src/modules/user/user.model.js";

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
    fullName: "Somchai Srisuk",
    phoneNumber: "0812345678",
    password: "P@ssw0rd",
    acceptedTerms: true,
  });

  assert.equal(response.status, 201);
  assert.ok(response.body.token);
  assert.ok(response.body.user.id);
  assert.equal(response.body.user.name, "Somchai S.");
  assert.equal(jwt.decode(response.body.token).name, "Somchai S.");
  userId = response.body.user.id;

  const savedUser = await User.findById(userId);
  assert.equal(savedUser.name, "Somchai Srisuk");
  assert.ok(savedUser.terms_accepted_at instanceof Date);
});

test("US1 - registration requires accepted terms", async () => {
  const response = await request(app).post("/api/v1/auth/register").send({
    fullName: "Another User",
    phoneNumber: "0812345679",
    password: "P@ssw0rd",
    acceptedTerms: false,
  });

  assert.equal(response.status, 400);
  assert.ok(Number.isFinite(Date.parse(response.body.error.timestamp)));
});

test("US1 - registration rejects duplicate phone numbers", async () => {
  const response = await request(app).post("/api/v1/auth/register").send({
    fullName: "Somchai Srisuk",
    phoneNumber: "0812345678",
    password: "P@ssw0rd",
    acceptedTerms: true,
  });

  assert.equal(response.status, 409);
  assert.equal(response.body.error.code, "PHONE_ALREADY_REGISTERED");
  assert.ok(Number.isFinite(Date.parse(response.body.error.timestamp)));
});

test("US2 - login returns JWT for valid credentials", async () => {
  const response = await request(app).post("/api/v1/auth/login").send({
    phoneNumber: "0812345678",
    password: "P@ssw0rd",
  });

  assert.equal(response.status, 200);
  assert.ok(response.body.token);
  assert.equal(response.body.user.name, "Somchai S.");
  assert.equal(jwt.decode(response.body.token).name, "Somchai S.");
  token = response.body.token;
});

test("US2 - login rejects invalid credentials with the same response", async () => {
  const incorrectPasswordResponse = await request(app).post("/api/v1/auth/login").send({
    phoneNumber: "0812345678",
    password: "incorrect-password",
  });

  const unknownPhoneResponse = await request(app).post("/api/v1/auth/login").send({
    phoneNumber: "0899999999",
    password: "incorrect-password",
  });

  assert.equal(incorrectPasswordResponse.status, 401);
  assert.equal(unknownPhoneResponse.status, 401);
  assert.equal(incorrectPasswordResponse.body.error.code, "INVALID_CREDENTIALS");
  assert.equal(
    incorrectPasswordResponse.body.error.message,
    unknownPhoneResponse.body.error.message
  );
  assert.ok(Number.isFinite(Date.parse(incorrectPasswordResponse.body.error.timestamp)));
  assert.ok(Number.isFinite(Date.parse(unknownPhoneResponse.body.error.timestamp)));
});

test("US3 - get current user profile", async () => {
  const response = await request(app)
    .get("/api/v1/users/me")
    .set("Authorization", `Bearer ${token}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.data.id, userId);
  assert.equal(response.body.data.name, "Somchai Srisuk");
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
