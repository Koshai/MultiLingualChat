# Operator Runbook (Mac Demo Host)

Use this runbook before every client demo to keep your environment predictable.

## 1) One-Time Host Setup

- Install prerequisites on the Mac:
  - `npm` / Node.js 18+
  - Python 3.8+
  - Docker (optional, for Redis)
  - `curl`
- Clone the project and configure required `.env` files.
- Install dependencies once:
  - `./scripts/local-setup.sh`

## 2) Start Services

From repository root:

```bash
./scripts/start-mac.sh
```

This script starts:
- frontend (`5173`)
- meeting service (`3001`)
- translation service (`3003`)
- stt service (`3004`)
- tts service (`3005`)

Log files are written to `.logs/`, and service PIDs are stored in `.pids/`.

## 3) Run Health Check

```bash
./scripts/health-check.sh
```

Expected: all services show `[OK]`.

## 4) Pre-Demo Smoke Test (2-3 minutes)

1. Open `http://localhost:5173`
2. Login
3. Create and join a meeting from window A
4. Join same meeting from window B (incognito)
5. Start transcription
6. Speak a non-English phrase in window A
7. Confirm in window B:
   - English text appears
   - English translated audio plays when translated mode is enabled

## 5) Remote Demo Access (Optional)

For cross-network demos:

```bash
ngrok http 5173
```

Share the generated HTTPS URL with the client.

## 6) Live Monitoring During Demo

- Keep one terminal open for quick checks:
  - `./scripts/health-check.sh`
- Tail logs if needed:
  - `tail -f .logs/meeting-service.log`
  - `tail -f .logs/translation-service.log`
  - `tail -f .logs/stt-service.log`
  - `tail -f .logs/tts-service.log`

## 7) Recovery Steps (If Something Breaks)

1. Run health check to identify failing service.
2. Inspect corresponding `.logs/*.log`.
3. Restart by running `./scripts/start-mac.sh` again (it avoids duplicate running PIDs).
4. Re-run smoke test from section 4.

## 8) Security Hygiene

- Never expose raw backend ports directly to the internet.
- Use strong secrets for JWT/API keys.
- Rotate leaked keys immediately.
- Prefer HTTPS tunnel/proxy for demos.

## 9) Quick Command Reference

- Start stack: `./scripts/start-mac.sh`
- Health check: `./scripts/health-check.sh`
- App URL: `http://localhost:5173`
- Meeting service health: `http://localhost:3001/health`
