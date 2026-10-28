/* global __ENV, __VU */
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 200 },
    { duration: "1m", target: 200 },
    { duration: "30s", target: 0 },
  ],
  setupTimeout: "2m",
  teardownTimeout: "2m",
  thresholds: {
    "http_req_duration{scenario:default}": ["p(95)<2000"],
    "http_req_failed{scenario:default}": ["rate<0.01"],
    "http_req_duration{name:login}": ["p(95)<2000"],
    "http_req_failed{name:login}": ["rate<0.01"],
    "http_req_duration{name:get_current_user}": ["p(95)<2000"],
    "http_req_failed{name:get_current_user}": ["rate<0.01"],
  },
};

const BASE_URL = (__ENV.BASE_URL || "http://localhost:3000/api/v1").replace(/\/+$/, "");
const USER_COUNT = Number(__ENV.LOADTEST_USERS || 200);
const PASSWORD = "LoadTest1234";
const BATCH_SIZE = 20;
const JSON_HEADERS = { "Content-Type": "application/json" };

function runBatched(requests) {
  const responses = [];
  for (let i = 0; i < requests.length; i += BATCH_SIZE) {
    responses.push(...http.batch(requests.slice(i, i + BATCH_SIZE)));
  }
  return responses;
}

export function setup() {
  const runId = String(Date.now() % 100000).padStart(5, "0");
  const users = Array.from({ length: USER_COUNT }, (_, i) => ({
    phone_number: `08${runId}${String(i).padStart(3, "0")}`,
    password: PASSWORD,
  }));

  const responses = runBatched(
    users.map((user, i) => ({
      method: "POST",
      url: `${BASE_URL}/auth/register`,
      body: JSON.stringify({ name: `Load Test ${i}`, ...user }),
      params: { headers: JSON_HEADERS, tags: { name: "setup_register" } },
    }))
  );

  const registered = responses.filter((response) => response.status === 201).length;
  if (registered < users.length) {
    throw new Error(`Registered only ${registered} of ${users.length} load test accounts.`);
  }

  return { users };
}

let accessToken = null;

function login(user) {
  const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify(user), {
    headers: JSON_HEADERS,
    tags: { name: "login" },
  });

  const loginSucceeded = check(loginRes, {
    "login status is 200": (response) => response.status === 200,
    "login returns access token": (response) =>
      response.status === 200 && typeof response.json("data.access_token") === "string",
  });

  return loginSucceeded ? loginRes.json("data.access_token") : null;
}

export default function ({ users }) {
  if (!accessToken) {
    accessToken = login(users[(__VU - 1) % users.length]);
  }

  if (accessToken) {
    const userRes = http.get(`${BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      tags: { name: "get_current_user" },
    });

    check(userRes, {
      "get current user status is 200": (response) => response.status === 200,
    });

    if (userRes.status === 401) {
      accessToken = null;
    }
  }

  sleep(Math.random() + 1);
}

export function teardown({ users }) {
  const loginResponses = runBatched(
    users.map((user) => ({
      method: "POST",
      url: `${BASE_URL}/auth/login`,
      body: JSON.stringify(user),
      params: { headers: JSON_HEADERS, tags: { name: "teardown_login" } },
    }))
  );

  const deactivateResponses = runBatched(
    loginResponses
      .filter((response) => response.status === 200)
      .map((response) => ({
        method: "DELETE",
        url: `${BASE_URL}/users/me`,
        params: {
          headers: { Authorization: `Bearer ${response.json("data.access_token")}` },
          tags: { name: "teardown_deactivate" },
        },
      }))
  );

  const deactivated = deactivateResponses.filter((response) => response.status < 300).length;
  console.log(`Deactivated ${deactivated} of ${users.length} load test accounts.`);
}

export function handleSummary(data) {
  const result = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    stages: options.stages,
    thresholds: options.thresholds,
    summary: data,
  };

  return {
    "tests/loadtest-results.json": JSON.stringify(result, null, 2),
    stdout: JSON.stringify(
      {
        generatedAt: result.generatedAt,
        metrics: Object.fromEntries(
          Object.entries(data.metrics).map(([name, metric]) => [name, metric.values])
        ),
      },
      null,
      2
    ),
  };
}
