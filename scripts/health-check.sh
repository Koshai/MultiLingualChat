#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

check_http() {
  local name="$1"
  local url="$2"

  if curl -fsS "$url" >/dev/null 2>&1; then
    echo "[OK]   $name ($url)"
    return 0
  fi

  echo "[FAIL] $name ($url)"
  return 1
}

echo "Multilingual Meetings health check"
echo "Root: $ROOT_DIR"
echo ""

FAILED=0

check_http "Frontend" "http://localhost:5173" || FAILED=1
check_http "Meeting service" "http://localhost:3001/health" || FAILED=1
check_http "Translation service" "http://localhost:3003/health" || FAILED=1
check_http "STT service" "http://localhost:3004/health" || FAILED=1
check_http "TTS service" "http://localhost:3005/health" || FAILED=1

echo ""
if [ "$FAILED" -eq 0 ]; then
  echo "All core services are healthy."
  exit 0
fi

echo "One or more services are unhealthy."
echo "Tip: inspect logs in .logs/ after running ./scripts/start-mac.sh"
exit 1
