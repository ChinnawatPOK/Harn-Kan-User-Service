/* global __ENV */
import http from "k6/http";
import { check, sleep } from "k6";

const SCENARIO = __ENV.SCENARIO || "journey";
const VUS = Number(__ENV.VUS || 200);
const LOGIN_RATE = Number(__ENV.LOGIN_RATE || 20);

const scenarios = {
  journey: {
    executor: "ramping-vus",
    exec: "journey",
    stages: [
      { duration: "30s", target: VUS },
      { duration: "1m", target: VUS },
      { duration: "30s", target: 0 },
    ],
  },
  login: {
    executor: "constant-arrival-rate",
    exec: "loginOnly",
    rate: LOGIN_RATE,
    timeUnit: "1s",
    duration: "1m",
    preAllocatedVUs: LOGIN_RATE * 2,
    maxVUs: LOGIN_RATE * 10,
  },
};

if (!scenarios[SCENARIO]) {
  throw new Error(`Unknown SCENARIO "${SCENARIO}". Use "journey" or "login".`);
}

export const options = {
  scenarios: { [SCENARIO]: scenarios[SCENARIO] },
  thresholds: {
    http_req_duration: ["p(95)<2000"],
    http_req_failed: ["rate<0.01"],
    "http_req_duration{name:login}": ["p(95)<2000"],
    "http_req_failed{name:login}": ["rate<0.01"],
    "http_req_duration{name:get_current_user}": ["p(95)<2000"],
    "http_req_failed{name:get_current_user}": ["rate<0.01"],
  },
};

const BASE_URL = (__ENV.BASE_URL || "http://localhost:3000/api/v1").replace(/\/+$/, "");

const ACCOUNT = {
  phone_number: __ENV.LOADTEST_PHONE_NUMBER || "0899999999",
  password: __ENV.LOADTEST_PASSWORD || "LoadTest1234",
};

function login() {
  const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify(ACCOUNT), {
    headers: { "Content-Type": "application/json" },
    tags: { name: "login" },
  });

  const loginSucceeded = check(loginRes, {
    "login status is 200": (response) => response.status === 200,
    "login returns access token": (response) =>
      response.status === 200 && typeof response.json("data.access_token") === "string",
  });

  return loginSucceeded ? loginRes.json("data.access_token") : null;
}

let accessToken = null;

export function journey() {
  if (!accessToken) {
    accessToken = login();
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

export function loginOnly() {
  login();
}

export function handleSummary(data) {
  const result = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    scenario: SCENARIO,
    scenarios: options.scenarios,
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
