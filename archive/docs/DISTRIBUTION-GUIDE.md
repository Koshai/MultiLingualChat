# Distribution Guide - Quick Demo Setup

This guide helps you quickly set up the Multilingual Chat application on a new computer for demonstrations.

## Quick Start (For Demos)

### Prerequisites Checklist

Before starting, ensure you have:
- ✅ **Node.js** (v18+) - [Download](https://nodejs.org/)
- ✅ **Python** (3.9+) - [Download](https://www.python.org/downloads/)
- ✅ **Git** - [Download](https://git-scm.com/download/win)

### Option 1: Fresh Install from GitHub (Recommended for New Computers)

```bash
# 1. Clone the repository
git clone https://github.com/Koshai/MultiLingualChat.git
cd MultiLingualChat

# 2. Install Node.js dependencies
npm install
cd frontend && npm install && cd ..
cd backend/services/chat-service && npm install && cd../../..

# 3. Install Python dependencies (this takes 5-10 minutes first time)
cd backend/services/translation-service
pip install -r requirements.txt
cd ../..

cd backend/services/stt-service
pip install -r requirements.txt
cd ../..

cd backend/services/tts-service
pip install -r requirements.txt
cd ../..
```

### Option 2: Package for Distribution (Create a Portable Version)

**On your development computer:**

1. **Create distribution package**:
   ```bash
   # Create a clean copy without node_modules (these are large)
   git archive --format=zip --output=MultilingualChat-Demo.zip HEAD
   ```

2. **Share the ZIP file** via USB, cloud storage, or network drive

**On the demo computer:**

1. Extract the ZIP file
2. Follow "Option 1" steps 2-3 above to install dependencies

## Configuration Files You MUST Create

The following files are not in Git (they contain configuration). You must create them manually:

### 1. Backend Configuration

Create `backend/services/chat-service/.env`:

```env
NODE_ENV=development
PORT=3001

# CRITICAL: Allow all origins for tunneling!
CORS_ORIGIN=*

JWT_SECRET=your-super-secret-jwt-key-change-in-production
TRANSLATION_SERVICE_URL=http://localhost:3003
LOCAL_DEV=true
```

### 2. Frontend Configuration

Create `frontend/.env`:

```env
# CRITICAL: Use relative URLs for Vite proxy!
VITE_API_URL=/api
VITE_WS_URL=
VITE_TRANSLATION_API_URL=/translation-api

VITE_NODE_ENV=development
VITE_DEBUG=true
VITE_APP_NAME=Multilingual Chat
VITE_APP_VERSION=1.0.0
```

### 3. Python Services Configuration (Optional)

**STT Service** - Create `backend/services/stt-service/.env`:

```env
SERVICE_NAME=stt-service
HOST=0.0.0.0
PORT=3004
WHISPER_MODEL=base
DEVICE=cpu
LOG_LEVEL=INFO
```

**TTS Service** - Create `backend/services/tts-service/.env`:

```env
TTS_SERVICE_HOST=0.0.0.0
TTS_SERVICE_PORT=3005
LOG_LEVEL=INFO
```

## Running the Application

### Start All Services

```bash
START-HERE.bat
```

This opens 5 terminal windows:
1. Translation Service (Python) - Port 3003
2. STT Service (Python) - Port 3004
3. TTS Service (Python) - Port 3005
4. Chat Service (Node.js) - Port 3001
5. Frontend (Vite) - Port 5173

**Wait 10-15 seconds** for all services to start completely.

### For Local Testing

Open browser to: `http://localhost:5173`

### For Cross-Network Demo (Using Tunneling)

#### Option A: Cloudflare Tunnel (No Account Needed)

```bash
# In a NEW terminal (keep services running)
TUNNEL-ONLY-CLOUDFLARE.bat
```

Look for output like:
```
Your tunnel is accessible at: https://xxxxx-xxxxxx.trycloudflare.com
```

Share this URL with others!

#### Option B: Pinggy (SSH-based, Always Works)

```bash
# In a NEW terminal
TUNNEL-ONLY-PINGGY.bat
```

Copy the public URL that appears.

## Troubleshooting

### Problem: "Translation service is not running"

**Symptoms**: You see "Translating to English..." that never completes, or error toast notifications.

**Solution**:
1. Check that the Translation Service window shows "Uvicorn running on http://0.0.0.0:3003"
2. Restart all services: `stop-all.bat` then `START-HERE.bat`
3. Verify the `.env` files are created correctly (see above)

### Problem: "Cannot see other person's video"

**Symptoms**: You can see yourself but not the other participant.

**Solution**:
1. Both users must grant camera/microphone permissions
2. Check browser console for WebRTC errors (F12)
3. Ensure both services are running on the host computer
4. Try refreshing the page and rejoining the meeting

### Problem: "Chat window overflows without scrolling"

**Fixed in latest version** - Update to the latest code:
```bash
git pull origin fix/translation-video-chat-issues
```

### Problem: Python services won't start

**Symptoms**: Service windows close immediately or show errors.

**Solution**:
```bash
# Verify Python and pip are installed
python --version
pip --version

# Reinstall dependencies
cd backend/services/stt-service
pip install --upgrade -r requirements.txt
```

### Problem: "Port already in use"

**Symptoms**: Service fails to start with "EADDRINUSE" or "Address already in use".

**Solution**:
```bash
# Find what's using the port (example for port 3001)
netstat -ano | findstr ":3001"

# Kill the process (use PID from above)
taskkill /PID <PID> /F

# Or use stop-all.bat to kill all services
stop-all.bat
```

## Services Health Check

To verify all services are running:

```bash
CHECK-SERVICES.bat
```

Or manually check:
- Translation: http://localhost:3003/health
- STT: http://localhost:3004/health
- TTS: http://localhost:3005/health
- Chat: http://localhost:3001/health
- Frontend: http://localhost:5173

## Demo Best Practices

### Before the Demo

1. ✅ Start all services 5 minutes early
2. ✅ Verify health checks pass
3. ✅ Create a test meeting and verify:
   - Video works
   - Chat works
   - Transcription works
   - Translation works
4. ✅ If using tunneling, verify the public URL is accessible

### During the Demo

1. **Show Translation**:
   - Set transcription language to non-English (e.g., Bengali, Spanish)
   - Speak in that language
   - Show English translation appearing

2. **Show Multi-User**:
   - Have another person join via the tunnel URL
   - Demonstrate video conferencing
   - Show real-time translation between languages

3. **If Issues Occur**:
   - Check service logs in the terminal windows
   - Look for red error messages
   - Common issue: Translation service not responding = restart it

### After the Demo

```bash
stop-all.bat
```

## Architecture for Reference

```
Demo Computer (Running all services)
├── Frontend (Vite)           :5173  → Public via Tunnel
├── Chat Service (Node.js)    :3001  → Internal only
├── Translation (Python)      :3003  → Internal only
├── STT (Python)              :3004  → Internal only
└── TTS (Python)              :3005  → Internal only

External Users → Tunnel URL → Frontend → Vite Proxy → Backend Services
```

**Key Point**: Only the frontend (port 5173) is exposed via tunneling. All backend services communicate via localhost, avoiding CORS issues.

## Common Demo Scenarios

### Scenario 1: Single Computer Demo
- Run all services locally
- Open `http://localhost:5173` in multiple browser tabs
- Demonstrate features

### Scenario 2: Cross-Network Demo (Same Location)
- Run all services on one computer
- Start Cloudflare or Pinggy tunnel
- Others join via the public URL on their devices

### Scenario 3: Remote Demo
- Run all services on your computer
- Share tunnel URL via chat/email
- Remote participants join from anywhere

## Quick Reference Commands

| Command | Purpose |
|---------|---------|
| `START-HERE.bat` | Start all 5 services |
| `stop-all.bat` | Stop all services |
| `CHECK-SERVICES.bat` | Verify services are running |
| `TUNNEL-ONLY-CLOUDFLARE.bat` | Start Cloudflare tunnel |
| `TUNNEL-ONLY-PINGGY.bat` | Start Pinggy tunnel |
| `SETUP-CLOUDFLARE-TUNNEL.bat` | Install Cloudflare (first time) |

## Support

- **Setup Issues**: See `SETUP-NEW-COMPUTER.md`
- **Development**: See `README.md`
- **Bug Reports**: https://github.com/Koshai/MultiLingualChat/issues

## Remember

**The Two Critical .env Files:**
1. `backend/services/chat-service/.env` with `CORS_ORIGIN=*`
2. `frontend/.env` with `VITE_API_URL=/api`

Without these, tunneling will not work!
