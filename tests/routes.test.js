import test from "node:test";
import assert from "node:assert/strict";
import authRoutes from "../src/modules/auth/auth.route.js";
import userRoutes from "../src/modules/user/user.route.js";

test("auth and user route modules load successfully", () => {
  assert.equal(typeof authRoutes, "function");
  assert.equal(typeof userRoutes, "function");
});
