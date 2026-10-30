#!/usr/bin/env bash
# Usage:
#   tests/run-loadtest.sh [journey] [users]   default 200 users
#   tests/run-loadtest.sh login [rate]        default 20 logins per second
set -euo pipefail

SCENARIO="${1:-journey}"
BASE_URL="${BASE_URL:-http://localhost:3000/api/v1}"
PHONE="${LOADTEST_PHONE_NUMBER:-0899999999}"
PASSWORD="${LOADTEST_PASSWORD:-LoadTest1234}"

cd "$(dirname "$0")/.."

case "$SCENARIO" in
  journey) LOAD_ARG="VUS=${2:-200}" ;;
  login) LOAD_ARG="LOGIN_RATE=${2:-20}" ;;
  *) echo "Unknown scenario \"$SCENARIO\". Use \"journey\" or \"login\"." >&2; exit 1 ;;
esac

status=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE_URL/auth/register" \
  -H 'Content-Type: application/json' \
  -d "{\"fullName\":\"Load Test User\",\"phoneNumber\":\"$PHONE\",\"password\":\"$PASSWORD\",\"acceptedTerms\":true}" || true)

case "$status" in
  201 | 409) ;;
  000) echo "Cannot reach the API at $BASE_URL. Is it running?" >&2; exit 1 ;;
  *) echo "Registering the test account failed with HTTP $status." >&2; exit 1 ;;
esac

k6 run \
  -e SCENARIO="$SCENARIO" \
  -e "$LOAD_ARG" \
  -e BASE_URL="$BASE_URL" \
  -e LOADTEST_PHONE_NUMBER="$PHONE" \
  -e LOADTEST_PASSWORD="$PASSWORD" \
  tests/loadtest.js
