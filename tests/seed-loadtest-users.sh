set -euo pipefail

COUNT="${1:-200}"
BASE_URL="${BASE_URL:-http://localhost:3000/api/v1}"
PASSWORD="LoadTest1234"

if ! curl -s -o /dev/null -m 5 "${BASE_URL%/api/v1}/health/live"; then
  echo "Cannot reach the API at $BASE_URL. Is it running?" >&2
  exit 1
fi

register() {
  local phone
  phone=$(printf '0890%06d' "$1")
  curl -s -o /dev/null -w '%{http_code}\n' -X POST "$BASE_URL/auth/register" \
    -H 'Content-Type: application/json' \
    -d "{\"name\":\"Load Test $1\",\"phone_number\":\"$phone\",\"password\":\"$PASSWORD\"}"
}
export -f register
export BASE_URL PASSWORD

results=$(seq 0 $((COUNT - 1)) | xargs -P 8 -I{} bash -c 'register {}')

created=$(grep -c '^201$' <<<"$results" || true)
existing=$(grep -c '^409$' <<<"$results" || true)
failed=$((COUNT - created - existing))

echo "Load test accounts: $created created, $existing already existed, $failed failed."
if [ "$failed" -gt 0 ]; then
  exit 1
fi
