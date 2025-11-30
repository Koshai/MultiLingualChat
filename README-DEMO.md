# 🚀 Multilingual Video Conferencing - Demo Guide

**Real-time speech translation with AI-powered voice synthesis**

---

## ⚡ Quick Start (Choose Your Mode)

### **🖥️ Testing Yourself?**
```bash
START-HERE.bat
```
Open: http://localhost:5173

### **🏢 Client in Same Room/Wi-Fi?**
```bash
START-NETWORK.bat
```
Client opens: http://YOUR_IP:5173 (shown by script)

### **🌐 Client Remote/Different Network?** ⭐ MOST COMMON
```bash
START-NGROK.bat
```
Client opens: https://xxx.ngrok-free.app (shown by script)

**Not sure which?** See: `WHICH-MODE.md`

---

## 🎯 What This Does

### **The Magic:**
1. You speak in **Spanish** (or any language)
2. System transcribes to text
3. Translates to **English**
4. **Speaks English with AI voice** 🎉
5. Other participants hear translated audio in real-time

### **Features:**
- ✅ Real-time speech-to-text (20+ languages)
- ✅ Automatic translation
- ✅ Text-to-speech voice synthesis
- ✅ User choice: Original audio OR Translated audio
- ✅ Video conferencing (WebRTC)
- ✅ Multi-language support

---

## 🎬 Demo in 2 Minutes

### **Step 1: Start Services**

**For remote client (different network):**
```bash
START-NGROK.bat
```

**For same Wi-Fi:**
```bash
START-NETWORK.bat
```

**For testing:**
```bash
START-HERE.bat
```

### **Step 2: You Join**
1. Open the URL (localhost or Ngrok URL)
2. Create account: `presenter`
3. Create meeting: "Demo"
4. Enable transcription (📝 button)

### **Step 3: Client Joins**
1. Open the URL you sent them
2. Create account: `client` (different username)
3. Join "Demo" meeting
4. Click audio settings (🔊)
5. Select **"Translated"** mode

### **Step 4: Show the Magic**
1. **You speak Spanish**: "Hola, ¿cómo estás?"
2. **Client sees**: "Hello, how are you?" (text)
3. **Client hears**: English AI voice speaking 🎉

**WOW Factor Achieved!** ✨

---

## 📋 System Requirements

### **Your Computer (Host):**
- Windows 10/11
- Node.js 18+ (for frontend & chat service)
- Python 3.10+ (for TTS, STT, translation services)
- 4GB RAM minimum
- Internet connection (for Azure services & Ngrok)

### **Client Computer:**
- Any modern web browser (Chrome, Edge, Firefox)
- Internet connection
- Microphone (optional, for speaking)
- Speakers (to hear TTS)

### **Services Used:**
- Azure Speech Services (STT - 5 hours/month free)
- Azure Translator (2M chars/month free)
- OpenAI Whisper (fallback STT, runs locally)
- Ngrok (free tier with limits)

---

## 🛠️ Installation (One-Time Setup)

### **1. Install Dependencies**

**Node.js:**
- Download from: https://nodejs.org
- Install LTS version

**Python:**
- Download from: https://python.org
- Version 3.10 or higher

**Ngrok (for remote demos):**
```bash
choco install ngrok
```

Or download from: https://ngrok.com/download

### **2. Install Project Dependencies**

**Frontend:**
```bash
cd frontend
npm install
```

**Chat Service:**
```bash
cd backend/services/chat-service
npm install
```

**Python Services:**
```bash
# TTS Service
cd backend/services/tts-service
pip install -r requirements.txt

# STT Service
cd backend/services/stt-service
pip install -r requirements.txt

# Translation Service
cd backend/services/translation-service
pip install -r requirements.txt
```

### **3. Configure Environment**

**Copy `.env.example` to `.env`** (if not already done)

**Add Azure credentials** (already in `.env` for demo):
- Azure Speech Key
- Azure Translator Key

### **4. Ngrok Setup (for remote demos)**

**Sign up at https://ngrok.com** (free)

**Get auth token** from dashboard

**Authenticate:**
```bash
ngrok config add-authtoken YOUR_TOKEN_HERE
```

**Done!** You only do this once.

---

## 📁 Project Structure

```
MultilingualChat/
├── frontend/                  # React + Vite frontend
├── backend/
│   └── services/
│       ├── chat-service/      # Node.js chat + WebRTC signaling
│       ├── tts-service/       # Python TTS (Azure + fallbacks)
│       ├── stt-service/       # Python STT (Azure + Whisper)
│       └── translation-service/ # Python translation (Azure)
├── START-HERE.bat             # Localhost demo (testing)
├── START-NETWORK.bat          # Same Wi-Fi demo
├── START-NGROK.bat            # Remote/cross-network demo ⭐
├── start-all.bat              # Start all 5 services
├── stop-all.bat               # Stop everything
└── docs/
    ├── WHICH-MODE.md          # Choose the right demo mode
    ├── NGROK-QUICK-START.md   # Ngrok setup guide
    ├── NETWORK-SETUP.md       # Network mode guide
    └── DEMO-GUIDE.md          # Detailed demo instructions
```

---

## 🎯 Services Architecture

```
┌─────────────────────┐
│   Frontend (5173)   │  React app with WebRTC
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  Chat Service       │  WebSocket + REST API
│  (3001)             │  User auth, meetings, WebRTC signaling
└──────────┬──────────┘
           │
           ├──────────► STT Service (3004) ──► Azure Speech + Whisper
           │
           ├──────────► Translation (3003) ──► Azure Translator
           │
           └──────────► TTS Service (3005) ──► Azure TTS
```

**All services start automatically** with `START-*.bat` scripts!

---

## 🐛 Troubleshooting

### **Issue: "Service not running"**

**Fix:**
```bash
stop-all.bat
START-HERE.bat
```

Check that all 5 windows open:
1. Translation Service
2. STT Service
3. TTS Service
4. Chat Service
5. Frontend

### **Issue: No TTS audio**

**Check:**
1. Audio mode is set to "Translated" (🔊 button)
2. Volume slider is up
3. Transcription is enabled (📝 button)
4. You're speaking in non-English language
5. Check browser console for errors

### **Issue: Ngrok "command not found"**

**Fix:**
```bash
choco install ngrok
# Or download from ngrok.com
```

### **Issue: Client can't connect (Ngrok)**

**Check:**
1. Ngrok tunnel is running
2. You sent the HTTPS URL (not HTTP)
3. Services are running (5 windows open)
4. Client clicked "Visit Site" (Ngrok free tier page)

### **Issue: WebRTC video/audio not working**

**Expected for Ngrok mode!** WebRTC needs STUN/TURN servers.

**Focus on TTS instead** - that's the star feature and works perfectly!

**For full WebRTC:** Use Network Mode (same Wi-Fi)

---

## 📖 Documentation

### **Getting Started:**
- `README-SIMPLE.md` - Basic overview
- `WHICH-MODE.md` - Choose demo mode
- `SETUP-COMPLETE.md` - Installation guide

### **Demo Modes:**
- `NGROK-QUICK-START.md` - Remote demos (5-min setup)
- `NETWORK-SETUP.md` - Same Wi-Fi demos
- `SINGLE-COMPUTER-TEST-GUIDE.md` - Testing yourself
- `CROSS-NETWORK-DEMO.md` - All cross-network options

### **Features:**
- `TTS-SETUP.md` - Text-to-Speech configuration
- `TTS-IMPLEMENTATION-SUMMARY.md` - Technical details
- `DEMO-GUIDE.md` - Detailed demo walkthrough

### **Debugging:**
- `QUICK-DEBUG.md` - Step-by-step debugging
- `FIX-NOW.md` - Common issues

---

## ✅ Pre-Demo Checklist

**15 minutes before:**
- [ ] Choose demo mode (localhost/network/ngrok)
- [ ] Run appropriate `START-*.bat` script
- [ ] Verify all 5 service windows are open
- [ ] Test URL yourself (open in incognito)
- [ ] Create test account and meeting
- [ ] Test TTS works (speak, hear translated voice)

**Share with client:**
- [ ] Send correct URL (localhost/IP/Ngrok)
- [ ] Send meeting name
- [ ] Send simple instructions:
  ```
  1. Open the URL
  2. Create an account
  3. Join "[Meeting Name]"
  4. Click 🔊 and select "Translated"
  ```

**During demo:**
- [ ] Enable transcription (📝)
- [ ] Client selects "Translated" mode
- [ ] Speak in native language
- [ ] Client hears English translation 🎉

---

## 💡 Demo Tips

### **Focus on TTS Feature**
- This is the "wow" moment!
- Real-time voice translation is impressive
- Video is secondary

### **Prepare Client**
- "You'll hear my voice translated to English"
- "Click the speaker icon and select Translated"
- "Turn up your volume!"

### **Test Before Client Joins**
- Run through the whole flow yourself
- Use two browser windows
- Verify TTS plays

### **Have Backup Plan**
- If demo fails, use screen share
- Show recorded video
- Client will still be impressed!

---

## 🚀 Quick Command Reference

| Action | Command |
|--------|---------|
| **Start (Testing)** | `START-HERE.bat` |
| **Start (Same Wi-Fi)** | `START-NETWORK.bat` |
| **Start (Remote)** | `START-NGROK.bat` ⭐ |
| **Stop All** | `stop-all.bat` |
| **Check Status** | Look for 5 open windows |

---

## 🌟 Key Features

### **For You (Presenter):**
- Speak in your native language
- See real-time transcription
- See English translation
- Choose original or translated audio

### **For Client (Attendee):**
- Hear your voice in English (AI)
- See both original and translated text
- Adjust TTS volume
- Choose original or translated audio

### **Technical:**
- Multi-provider STT (Azure + Whisper fallback)
- Azure Translator (2M chars/month free)
- Azure TTS with neural voices (20+ languages)
- WebRTC for video/audio
- Socket.IO for real-time events

---

## 🎯 Your First Demo (Recommended Path)

### **Step 1: Test Yourself (2 minutes)**
```bash
START-HERE.bat
```
- Open http://localhost:5173 in two windows
- Test TTS works
- See: `SINGLE-COMPUTER-TEST-GUIDE.md`

### **Step 2: Setup Ngrok (5 minutes, one-time)**
```bash
choco install ngrok
# Sign up at ngrok.com
ngrok config add-authtoken YOUR_TOKEN
```
- See: `NGROK-QUICK-START.md`

### **Step 3: Demo with Client (2 minutes)**
```bash
START-NGROK.bat
```
- Copy HTTPS URL
- Send to client
- Show TTS magic! 🎉

---

## 🆘 Need Help?

### **Quick Fixes:**
- Services not starting? Run `stop-all.bat` then try again
- No audio? Check audio mode is "Translated"
- Client can't connect? Verify URL is correct
- Ngrok issues? See `NGROK-QUICK-START.md`

### **Detailed Guides:**
- Installation: `SETUP-COMPLETE.md`
- Debugging: `QUICK-DEBUG.md`
- Demo walkthrough: `DEMO-GUIDE.md`
- Mode selection: `WHICH-MODE.md`

### **Common Questions:**
- **Q: Which mode for client demo?**
  - A: If same Wi-Fi → `START-NETWORK.bat`
  - A: If different networks → `START-NGROK.bat` ⭐

- **Q: Does client need to install anything?**
  - A: No! Just a web browser.

- **Q: What if Ngrok URL changes?**
  - A: Free tier changes URL each restart. Send new URL to client, or upgrade to paid ($10/month) for persistent URL.

- **Q: Does video work through Ngrok?**
  - A: Not without STUN/TURN. Focus on TTS - that's the impressive part!

---

## 📊 Development Phases

- ✅ **Phase 1**: Basic chat with text translation
- ✅ **Phase 2**: Video conferencing (WebRTC)
- ✅ **Phase 3**: Text-to-Speech voice translation ⭐ **CURRENT**
- 🔄 **Phase 4**: UI polish and optimization

---

## 🎉 Ready to Demo?

**For client on different network:**
```bash
START-NGROK.bat
```

**See the URL, send to client, and show the magic!** ✨

**Documentation:** `NGROK-QUICK-START.md`

---

**Built with:** React, Node.js, Python, FastAPI, WebRTC, Azure AI Services, Ngrok

**License:** MIT (or your license)

**Questions?** See documentation in `/docs` folder or `WHICH-MODE.md`
