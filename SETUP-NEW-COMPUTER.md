# Setup Guide for New Computer (Cloudflare Tunneling)

Follow these steps to set up the MultilingualChat project on a new computer with Cloudflare tunneling support.

## Prerequisites

- **Git** - For cloning the repository
- **Node.js** (v18 or higher) - For running the application
- **npm** - Comes with Node.js

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Koshai/MultiLingualChat.git
cd MultiLingualChat
```

### 2. Install Dependencies

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

# Backend - Chat Service
cd backend/services/chat-service
npm install
cd ../../..
```

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

This will start:
- Frontend (Vite dev server) on port 5173
- Backend (Chat service) on port 3001

Wait until you see:
```
✓ Frontend running on http://localhost:5173
✓ Backend running on http://localhost:3001
```

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

## Important Files to NOT Commit

These files are in `.gitignore` and should NOT be committed:
- `backend/services/chat-service/.env`
- `frontend/.env`
- `node_modules/`
- `.env` (root)

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
    ↓ [Proxy /api requests]
    ↓
Backend Chat Service (localhost:3001)
```

The Vite proxy forwards `/api` requests to `localhost:3001`, avoiding CORS issues!

## Need Help?

- Check `README.md` for general project information
- Look at existing `.env.example` files for configuration templates
- Run `CHECK-SERVICES.bat` to diagnose service issues
