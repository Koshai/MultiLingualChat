# Setup Guide for New Computer (Cloudflare Tunneling)

Follow these steps to set up the MultilingualChat project on a new computer with Cloudflare tunneling support.

## Prerequisites

- **Git** - For cloning the repository
- **Node.js** (v18 or higher) - For running the frontend and chat service
- **npm** - Comes with Node.js
- **Python** (3.9 or higher) - For running backend services (STT, TTS, Translation)
- **pip** - Python package manager (comes with Python)

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Koshai/MultiLingualChat.git
cd MultiLingualChat
```

### 2. Install Dependencies

#### Node.js Dependencies

Run the automated setup script:

```bash
npm install
```

Or manually install for each service:

```bash
# Frontend
cd frontend
npm install
cd ..

# Backend - Chat Service (Node.js)
cd backend/services/chat-service
npm install
cd ../../..
```

#### Python Dependencies

Install Python packages for all Python services:

```bash
# Translation Service
cd backend/services/translation-service
pip install -r requirements.txt
cd ../../..

# Speech-to-Text (STT) Service
cd backend/services/stt-service
pip install -r requirements.txt
cd ../../..

# Text-to-Speech (TTS) Service
cd backend/services/tts-service
pip install -r requirements.txt
cd ../../..
```

**Note:** The first-time Python installation may take 5-10 minutes, especially for the STT service which downloads Whisper models (~150MB-3GB depending on configuration).

### 3. Configure Environment Variables

#### Backend Configuration

Create `backend/services/chat-service/.env`:

```env
# Chat Service Configuration
NODE_ENV=development
PORT=3001

# Security - IMPORTANT: Allow all origins for tunneling!
JWT_SECRET=your-super-secret-jwt-key-change-in-production
CORS_ORIGIN=*

# Other services
TRANSLATION_SERVICE_URL=http://localhost:3003

# Local development mode
LOCAL_DEV=true
```

**Key Point:** `CORS_ORIGIN=*` is critical for Cloudflare/Pinggy/Ngrok tunneling!

#### Frontend Configuration

Create `frontend/.env`:

```env
# Frontend Environment Variables for Tunneling
# This configuration works with Ngrok, Cloudflare, Pinggy, and other tunneling services

# IMPORTANT: Use relative URLs for Vite proxy compatibility
# The Vite dev server will proxy these requests to the backend services
VITE_API_URL=/api
VITE_WS_URL=
VITE_TRANSLATION_API_URL=/translation-api

# Development settings
VITE_NODE_ENV=development
VITE_DEBUG=true

# App configuration
VITE_APP_NAME=Multilingual Chat
VITE_APP_VERSION=1.0.0
```

**Key Point:** `VITE_API_URL=/api` uses the Vite proxy to avoid CORS issues!

#### Python Services Configuration (Optional but Recommended)

The Python services can run with default settings, but you can customize them:

**STT Service** - Create `backend/services/stt-service/.env`:

```env
# STT Service Configuration
SERVICE_NAME=stt-service
HOST=0.0.0.0
PORT=3004

# Whisper Model (tiny/base/small/medium/large)
# base: good balance (~150MB), medium: better accuracy (~1.5GB)
WHISPER_MODEL=base

# Use Azure Speech Services (optional - if you have Azure key)
AZURE_SPEECH_KEY=your_azure_speech_key_here
AZURE_SPEECH_REGION=eastus

# Performance
DEVICE=cpu
LOG_LEVEL=INFO
```

**TTS Service** - Create `backend/services/tts-service/.env`:

```env
# Azure Text-to-Speech Configuration (optional)
AZURE_SPEECH_KEY=your_azure_speech_key_here
AZURE_SPEECH_REGION=eastus

# Service Configuration
TTS_SERVICE_HOST=0.0.0.0
TTS_SERVICE_PORT=3005
LOG_LEVEL=INFO
```

**Translation Service** - Uses root `.env` file (no separate config needed)

**Note:** Python services will work without these .env files using defaults. Azure keys are optional - services have local fallbacks.

### 4. Install Cloudflare Tunnel

Run the setup script:

```bash
SETUP-CLOUDFLARE-TUNNEL.bat
```

This will:
- Download `cloudflared.exe`
- Install it to `C:\Program Files\cloudflared`
- Add it to your system PATH

**Note:** You may need to restart your terminal after installation.

### 5. Start the Application

Start all services:

```bash
START-HERE.bat
```

This will start **5 services** in separate terminal windows:
1. **Translation Service** (Python/FastAPI) on port 3003
2. **STT Service** (Python/FastAPI) on port 3004
3. **TTS Service** (Python/FastAPI) on port 3005
4. **Chat Service** (Node.js/Express) on port 3001
5. **Frontend** (Vite dev server) on port 5173

Wait until you see all services showing "running" or "ready" in their respective windows.

**Note:** First-time startup may be slow as Whisper models download for STT service.

### 6. Start Cloudflare Tunnel

In a **new terminal window**, run:

```bash
TUNNEL-ONLY-CLOUDFLARE.bat
```

You'll see output like:
```
================================================
  Your public URL will appear below:
  Look for: "https://xxxxx.trycloudflare.com"
================================================

Your tunnel is now accessible at: https://isolation-remaining-block-declined.trycloudflare.com
```

### 7. Access Your Application

Open the Cloudflare URL in your browser (or share it with others):
```
https://xxxxx.trycloudflare.com
```

You should be able to:
- ✅ Load the application
- ✅ Login/Register without CORS errors
- ✅ Use all features through the tunnel

## Alternative Tunneling Services

If Cloudflare Tunnel has issues, you can use alternatives:

### Pinggy (SSH-based, no installation needed)
```bash
TUNNEL-ONLY-PINGGY.bat
```

### Ngrok (requires account)
```bash
START-NGROK.bat
```

## Troubleshooting

### CORS Errors

If you see CORS errors like:
```
Access to XMLHttpRequest at 'http://localhost:3001/api/auth/login' from origin 'https://xxxxx.trycloudflare.com' has been blocked by CORS policy
```

**Solution:**
1. Check `backend/services/chat-service/.env` has `CORS_ORIGIN=*`
2. Check `frontend/.env` has `VITE_API_URL=/api` (not `http://localhost:3001/api`)
3. Restart services with `stop-all.bat` then `START-HERE.bat`

### Frontend Not Loading

1. Check if port 5173 is already in use
2. Run `netstat -ano | findstr ":5173"` to see what's using it
3. Kill the process or change the port in `frontend/vite.config.ts`

### Backend Not Connecting

1. Check if port 3001 is already in use
2. Check database connection (SQLite file should be auto-created)
3. Look at backend logs in the terminal

### Cloudflare Tunnel Issues

If you see "Worker threw exception" errors:
- This is a temporary Cloudflare service issue
- Wait a few minutes and try again
- Or use Pinggy/Ngrok as alternatives

### Python Service Issues

**Missing Python Dependencies:**
```bash
# Make sure Python and pip are installed
python --version
pip --version

# If pip is missing, install it:
python -m ensurepip --upgrade
```

**Whisper Model Download Fails:**
- The STT service downloads Whisper models on first run
- Ensure you have internet connection and disk space (150MB-3GB)
- Models are cached after first download

**PyTorch/CUDA Errors:**
- By default, services use CPU (no GPU required)
- If you see CUDA errors, set `DEVICE=cpu` in `.env` files
- GPU acceleration requires NVIDIA GPU and CUDA toolkit

**Port Already in Use:**
- Check which service is using the port: `netstat -ano | findstr ":3003"`
- Kill the process or change port in service `.env` file

## Important Files to NOT Commit

These files are in `.gitignore` and should NOT be committed:
- `backend/services/chat-service/.env` (Node.js service config)
- `backend/services/stt-service/.env` (Python STT config)
- `backend/services/tts-service/.env` (Python TTS config)
- `frontend/.env` (Frontend config)
- `.env` (root config - used by all services)
- `node_modules/` (Node.js dependencies)
- `__pycache__/` (Python bytecode)
- `*.pyc` (Python compiled files)

They contain local configuration and secrets.

## Quick Reference

| Command | Purpose |
|---------|---------|
| `START-HERE.bat` | Start all services (frontend + backend) |
| `stop-all.bat` | Stop all running services |
| `SETUP-CLOUDFLARE-TUNNEL.bat` | Install Cloudflare Tunnel |
| `TUNNEL-ONLY-CLOUDFLARE.bat` | Start Cloudflare Tunnel |
| `TUNNEL-ONLY-PINGGY.bat` | Start Pinggy Tunnel |
| `CHECK-SERVICES.bat` | Check which services are running |

## Architecture Overview

```
Cloudflare Tunnel (HTTPS)
    ↓
https://xxxxx.trycloudflare.com
    ↓
Vite Dev Server (localhost:5173)
    ↓ [Proxy /api → Chat Service]
    ↓ [Proxy /translation-api → Translation Service]
    ↓
┌─────────────────────────────────────────┐
│  Backend Services (All on localhost)   │
├─────────────────────────────────────────┤
│  Chat Service (Node.js)      :3001     │
│  Translation Service (Python):3003     │
│  STT Service (Python)        :3004     │
│  TTS Service (Python)        :3005     │
└─────────────────────────────────────────┘
```

The Vite proxy forwards requests to appropriate backend services, avoiding CORS issues!

## Need Help?

- Check `README.md` for general project information
- Look at existing `.env.example` files for configuration templates
- Run `CHECK-SERVICES.bat` to diagnose service issues
