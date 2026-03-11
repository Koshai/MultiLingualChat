# Multilingual Meetings Platform

A meetings-first video conferencing app with live speech transcription, translation, and optional translated audio playback.

## Architecture

### Services

- `frontend` (React + Vite): meetings UI, WebRTC controls, live captions, translation display.
- `backend/services/chat-service` (Node + Express + Socket.IO): auth, meeting APIs, realtime signaling, and orchestration for STT/translation/TTS.
- `backend/services/stt-service` (FastAPI): speech-to-text from base64 audio chunks.
- `backend/services/translation-service` (FastAPI): text translation.
- `backend/services/tts-service` (FastAPI): text-to-speech synthesis.
- `backend/shared/contracts`: language-agnostic contract artifacts for active socket payloads.

### Runtime Data Flow

1. Frontend sends `audio_chunk` over Socket.IO.
2. Chat service calls STT service and emits `transcription`.
3. If transcription language is not English, chat service calls translation service and emits `transcription_translation`.
4. Chat service calls TTS service and emits `tts_audio`.
5. Frontend plays TTS when translated-audio mode is enabled.

## Local Development

### Prerequisites

- Node.js 18+
- Python 3.8+
- Git
- Optional: Docker (for Redis), PostgreSQL

### Quick Start (Windows)

1. Install dependencies for all services.
2. Run:
   - `start-all.bat` (starts frontend + all backend services)
3. Verify:
   - `CHECK-SERVICES.bat`
4. Open:
   - `http://localhost:5173`

### Quick Start (Bash)

```bash
chmod +x scripts/local-setup.sh
./scripts/local-setup.sh

source scripts/claude-helpers.sh
cc-start
cc-status
```

### Manual Start Commands

```bash
# Chat service
cd backend/services/chat-service
npm install
npm run dev

# STT service
cd backend/services/stt-service
pip install -r requirements.txt
python main.py

# Translation service
cd backend/services/translation-service
pip install -r requirements.txt
python main.py

# TTS service
cd backend/services/tts-service
pip install -r requirements.txt
python main.py

# Frontend
cd frontend
npm install
npm run dev
```

## Service Ports

- Frontend: `5173`
- Chat/Meeting service: `3001`
- Translation service: `3003`
- STT service: `3004`
- TTS service: `3005`
- Redis (optional): `6379`

## Single Source Of Truth

- Windows full startup: `start-all.bat`
- Windows full stop: `stop-all.bat`
- Windows service check: `CHECK-SERVICES.bat`
- Windows tunnel helper: `START-NETWORK.bat`
- Bash full startup: `source scripts/claude-helpers.sh && cc-start`
- Bash service check: `source scripts/claude-helpers.sh && cc-status`
- Mac host startup: `./scripts/start-mac.sh`
- Mac host health check: `./scripts/health-check.sh`
- Canonical app URL: `http://localhost:5173`
- Demo operator runbook: `OPERATOR-RUNBOOK.md`

## Environment Variables

Use `.env.example` files in each service as the source of truth.

Important values:

- Frontend:
  - `VITE_API_URL`
  - `VITE_WS_URL`
- Chat service:
  - `JWT_SECRET`
  - `STT_SERVICE_URL`
  - `TRANSLATION_SERVICE_URL`
  - `TTS_SERVICE_URL`
- STT/Translation/TTS:
  - provider keys and model settings per service `.env.example`

## Testing

```bash
# Chat service tests
cd backend/services/chat-service && npm test

# Frontend tests (placeholder command currently)
cd frontend && npm test
```

## Notes

- The codebase is simplified to a meetings-only product path.
- Legacy room-chat UI/store routes were removed to reduce maintenance overhead.

## Archived Files Index

The following files were archived under `archive/` to reduce maintenance noise while keeping historical references:

- `archive/docs/`
- `archive/scripts/`
- `archive/deployment/`
