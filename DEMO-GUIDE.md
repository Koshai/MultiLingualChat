# 🎥 Multilingual Video Conferencing - Demo Guide

**Quick Start for Non-Technical Users**

---

## 🚀 How to Start the Application

### Step 1: Start All Services

**Double-click** `start-all.bat`

This will:
- ✅ Stop any existing services
- ✅ Open 5 new windows (one for each service)
- ✅ Start all services automatically

**Wait 15-20 seconds** for all services to start.

### Step 2: Open the Application

Once you see all services running, open your browser and go to:

```
http://localhost:5173
```

---

## 🎯 How to Demo the TTS Feature

### 1. Login / Create Account
- Create a new account or login with existing credentials
- Username: `koshai` (or create your own)

### 2. Create a Meeting
- Click "Create Meeting"
- Give it a name: "TTS Demo Meeting"
- Click "Create"

### 3. Join the Meeting
- Click "Join Meeting"
- Allow camera and microphone access when prompted

### 4. Enable Transcription
- Click the **📝** button (bottom toolbar)
- This starts live speech-to-text

### 5. Enable TTS (Translated Audio)
- Click the **👂** or **🔊** button (bottom toolbar)
- You'll see a panel with two options:
  - **👂 Original**: Hear speakers in their native language
  - **🔊 Translated**: Hear AI-translated English voice
- Select **🔊 Translated**
- Adjust volume if needed (slider appears)

### 6. Test It!

**Speak in Spanish:**
- "Hola, ¿cómo estás?"
- "Me llamo Juan"
- "Estoy muy feliz de estar aquí"

**You will:**
- See Spanish text in the transcription panel
- See English translation below it
- **HEAR English TTS voice** saying: "Hello, how are you?", "My name is Juan", "I am very happy to be here"

**Try other languages:**
- French: "Bonjour, comment allez-vous?"
- German: "Guten Tag, wie geht es Ihnen?"
- Japanese: "こんにちは、お元気ですか？"

---

## 🎨 What to Show the Client

### Feature Highlights

1. **Real-time Transcription**
   - Show that speech is transcribed instantly
   - Supports 20+ languages

2. **Automatic Translation**
   - Show Spanish speech → English text
   - Translation appears automatically

3. **Voice Translation (TTS)**
   - **Key Feature**: Speak Spanish → Hear English voice
   - User can choose Original vs Translated audio
   - Adjustable volume

4. **Multi-participant**
   - Each person can choose their own audio mode
   - Some can hear original, others can hear translated

5. **Professional UI**
   - Teams/Zoom-style interface
   - Clean, modern design
   - Easy to use controls

---

## 🔧 Troubleshooting

### Services Won't Start

**Problem**: Error messages in service windows

**Solution**:
1. Close all service windows
2. Run `stop-all.bat`
3. Wait 5 seconds
4. Run `start-all.bat` again

### No Audio Plays

**Problem**: Can't hear TTS voice

**Check**:
1. Is TTS mode enabled? (🔊 button should be **blue**)
2. Is TTS volume up? (check slider)
3. Check browser console (F12) for errors
4. Verify TTS Service window shows "Azure TTS Service initialized"

### Translation Not Working

**Problem**: Only seeing original text, no translation

**Check**:
1. Translation Service window shows "Azure Translator set as primary"
2. Check internet connection (Azure services need internet)
3. Check Translation Service logs for errors

### Transcription Not Working

**Problem**: No text appears when speaking

**Check**:
1. Microphone permissions granted in browser
2. Click the 📝 button to start transcription
3. Speak clearly (not too fast)
4. Check STT Service window for activity

---

## 🎯 Demo Script (5 Minutes)

### Opening (30 seconds)
> "Welcome! Today I'll show you our multilingual video conferencing platform with **real-time voice translation**."

### Login & Setup (1 minute)
1. Open browser → http://localhost:5173
2. Login / Create account
3. Create meeting → Join

### Basic Features (1 minute)
1. Enable video/audio
2. Show video grid layout
3. Enable transcription
4. Speak in English → Show transcription

### TTS Demo - The WOW Moment (2 minutes)
1. Open audio settings (🔊 button)
2. Toggle to "Translated" mode
3. **Speak in Spanish**: "Hola, mi nombre es Juan. Estoy muy emocionado de mostrarles esta tecnología."
4. **Point out**:
   - Spanish text appears in panel
   - English translation appears
   - **English voice plays automatically**
5. Try another language (French/German)
6. Show volume control

### Multi-user Scenario (1 minute)
1. Open incognito window → Join same meeting
2. User 1: Translated mode (🔊)
3. User 2: Original mode (👂)
4. Show that each user hears different audio

### Closing (30 seconds)
> "This enables truly global meetings - everyone speaks their native language, but everyone can understand each other. Questions?"

---

## 🛑 How to Stop the Application

### Option 1: Quick Stop
**Double-click** `stop-all.bat`

This will close all service windows automatically.

### Option 2: Manual Stop
Close each service window individually (the 5 windows that opened).

---

## 📊 Technical Specs (For Technical Clients)

### Services
- **Frontend**: React + TypeScript + Vite
- **Chat Service**: Node.js + Socket.IO (WebRTC signaling)
- **STT Service**: Python + Azure Speech / OpenAI Whisper
- **Translation Service**: Python + Azure Translator / Argos Translate
- **TTS Service**: Python + Azure Text-to-Speech

### Features
- **Video**: WebRTC peer-to-peer HD video/audio
- **Speech-to-Text**: Azure Speech (primary), Whisper (fallback)
- **Translation**: Azure Translator (primary), Argos (fallback)
- **Text-to-Speech**: Azure TTS with neural voices (20+ languages)
- **Latency**: ~1-2 seconds (speech → translated audio)

### Costs (Azure Free Tier)
- **STT**: 5 hours/month FREE
- **Translation**: 2M characters/month FREE
- **TTS**: 0.5M characters/month FREE
- **Capacity**: ~25 meetings/month (30 min each, 3 participants)

---

## 📝 Demo Checklist

Before the demo:
- [ ] Run `start-all.bat` and wait for services to start
- [ ] Open browser to http://localhost:5173
- [ ] Create test account if needed
- [ ] Test microphone/camera permissions
- [ ] Test Spanish → English TTS once

During the demo:
- [ ] Show login/create meeting
- [ ] Show video conferencing basics
- [ ] Enable transcription
- [ ] **Show TTS with Spanish → English** (the wow moment!)
- [ ] Show audio mode toggle
- [ ] Show volume control
- [ ] Mention multi-language support

After the demo:
- [ ] Run `stop-all.bat` to clean up

---

## 💡 Tips for a Great Demo

1. **Practice first**: Do a dry run before the client call
2. **Use clear Spanish phrases**: Simple sentences work best
3. **Highlight the choice**: "Each user can choose what they hear"
4. **Show the latency**: "Notice how fast it translates - only 1-2 seconds"
5. **Mention scalability**: "Works with 20+ languages, 20+ participants"
6. **Have fallback**: If Azure fails, mention "We have local fallback providers"

---

## 🎉 Key Selling Points

1. ✅ **Real-time voice translation** (not just captions!)
2. ✅ **User choice** (original vs translated audio)
3. ✅ **20+ languages** supported
4. ✅ **Professional quality** (Azure neural voices)
5. ✅ **Reliable** (multi-provider fallback system)
6. ✅ **Cost-effective** (generous free tiers)
7. ✅ **Easy to use** (familiar Zoom/Teams interface)

---

**Questions?** Check the logs in the service windows or contact technical support.
