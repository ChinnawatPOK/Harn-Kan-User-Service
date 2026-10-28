/* global __ENV */
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 200 },
    { duration: "1m", target: 200 },
    { duration: "30s", target: 0 },
  ],
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
const PHONE_NUMBER = __ENV.LOADTEST_PHONE_NUMBER;
const PASSWORD = __ENV.LOADTEST_PASSWORD;

if (!PHONE_NUMBER || !PASSWORD) {
  throw new Error("Set LOADTEST_PHONE_NUMBER and LOADTEST_PASSWORD to an existing test account.");
}

let accessToken = null;

function login() {
  const loginRes = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({
      phone_number: PHONE_NUMBER,
      password: PASSWORD,
    }),
    {
      headers: { "Content-Type": "application/json" },
      tags: { name: "login" },
    }
  );

  const loginSucceeded = check(loginRes, {
    "login status is 200": (response) => response.status === 200,
    "login returns access token": (response) =>
      response.status === 200 && typeof response.json("data.access_token") === "string",
  });

  return loginSucceeded ? loginRes.json("data.access_token") : null;
}

export default function () {
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
