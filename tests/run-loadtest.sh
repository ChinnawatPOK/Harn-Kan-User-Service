set -euo pipefail

SCENARIO="${1:-journey}"
BASE_URL="${BASE_URL:-http://localhost:3000/api/v1}"
POOL_SIZE=200

cd "$(dirname "$0")/.."

if ! command -v k6 >/dev/null; then
  echo "k6 is not installed. See https://grafana.com/docs/k6/latest/set-up/install-k6/" >&2
  exit 1
fi

case "$SCENARIO" in
  journey)
    VUS="${2:-200}"
    # One account per virtual user.
    if [ "$VUS" -gt "$POOL_SIZE" ]; then
      POOL_SIZE="$VUS"
    fi
    K6_ARGS=(-e VUS="$VUS")
    echo "Scenario: journey, ramping up to $VUS virtual users."
    ;;
  login)
    LOGIN_RATE="${2:-20}"
    K6_ARGS=(-e LOGIN_RATE="$LOGIN_RATE")
    echo "Scenario: login, $LOGIN_RATE logins per second for one minute."
    ;;
  *)
    echo "Unknown scenario \"$SCENARIO\". Use \"journey\" or \"login\"." >&2
    exit 1
    ;;
esac

BASE_URL="$BASE_URL" tests/seed-loadtest-users.sh "$POOL_SIZE"

k6 run \
  -e SCENARIO="$SCENARIO" \
  -e BASE_URL="$BASE_URL" \
  -e LOADTEST_USERS="$POOL_SIZE" \
  "${K6_ARGS[@]}" \
  tests/loadtest.js
