#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PID_DIR="$ROOT_DIR/.pids"
LOG_DIR="$ROOT_DIR/.logs"

mkdir -p "$PID_DIR" "$LOG_DIR"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1"
    exit 1
  fi
}

require_cmd npm

if command -v python3 >/dev/null 2>&1; then
  PYTHON_CMD="python3"
elif command -v python >/dev/null 2>&1; then
  PYTHON_CMD="python"
else
  echo "Missing required command: python3 (or python)"
  exit 1
fi

start_service() {
  local name="$1"
  local workdir="$2"
  local command="$3"
  local pid_file="$PID_DIR/${name}.pid"
  local log_file="$LOG_DIR/${name}.log"

  if [ -f "$pid_file" ]; then
    local existing_pid
    existing_pid="$(cat "$pid_file")"
    if ps -p "$existing_pid" >/dev/null 2>&1; then
      echo "$name already running (pid $existing_pid)"
      return
    fi
    rm -f "$pid_file"
  fi

  echo "Starting $name..."
  (
    cd "$workdir"
    nohup bash -lc "$command" >"$log_file" 2>&1 &
    echo $! >"$pid_file"
  )
}

echo "Starting Multilingual Meetings stack on macOS..."
echo "Root: $ROOT_DIR"
echo ""

if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  echo "Starting Redis (docker compose)..."
  (
    cd "$ROOT_DIR"
    docker compose up -d redis >/dev/null 2>&1 || docker-compose up -d redis >/dev/null 2>&1 || true
  )
else
  echo "Docker not available; continuing without Redis container."
fi

start_service "meeting-service" "$ROOT_DIR/backend/services/chat-service" "npm run dev"
start_service "translation-service" "$ROOT_DIR/backend/services/translation-service" "$PYTHON_CMD main.py"
start_service "stt-service" "$ROOT_DIR/backend/services/stt-service" "$PYTHON_CMD main.py"
start_service "tts-service" "$ROOT_DIR/backend/services/tts-service" "$PYTHON_CMD main.py"
start_service "frontend" "$ROOT_DIR/frontend" "npm run dev"

echo ""
echo "Startup complete."
echo "Run health check: ./scripts/health-check.sh"
echo "Logs: $LOG_DIR"
echo "PIDs: $PID_DIR"
