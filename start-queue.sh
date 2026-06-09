#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

cleanup() {
  echo ""
  echo "Stopping..."
  kill "$BUN_PID" 2>/dev/null
  tailscale funnel --bg=false 3000 2>/dev/null || true
  wait "$BUN_PID" 2>/dev/null
  echo "Done."
  exit 0
}

trap cleanup INT TERM

echo "Starting Bun backend..."
bun run "$SCRIPT_DIR/queue-backend/server.ts" &
BUN_PID=$!

sleep 1

if ! kill -0 "$BUN_PID" 2>/dev/null; then
  echo "Backend failed to start. Check queue-backend/.env"
  exit 1
fi

echo "Starting Tailscale Funnel on port 3000..."
tailscale funnel --bg 3000

echo ""
echo "Queue backend is live. Press Ctrl+C to stop."

wait "$BUN_PID"
