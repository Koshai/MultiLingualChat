# Text-to-Speech (TTS) Setup Guide

## 🎯 Overview

The TTS feature enables **real-time audio translation** during video calls. When someone speaks in their native language (e.g., Spanish), participants can choose to hear an AI-generated English voice translation instead of the original audio.

## ✨ Features

- **Dual Audio Mode**: Choose between Original Audio or Translated Audio (TTS)
- **Multi-Provider**: Azure TTS (primary) with local fallback support
- **High Quality**: Neural voices for natural-sounding speech
- **Real-time**: ~1-2 second latency from speech to translated audio
- **Volume Control**: Adjustable TTS volume (0-100%)

## 🏗️ Architecture

```
Speaker (Spanish) → Audio Capture → STT Service → Spanish Text
                                        ↓
                              Translation Service → English Text
                                        ↓
                                  TTS Service → English Audio (MP3)
                                        ↓
                              Socket.IO Broadcast → All Participants
                                        ↓
                          Frontend: Play if "Translated" mode enabled
```

## 📋 Prerequisites

### 1. Azure Speech Service Account

You need an Azure account with Speech Services enabled (same key works for both STT and TTS!).

**Free Tier:**
- **TTS**: 0.5 million characters/month FREE
- **Example**: ~20,000 characters per 30-min meeting = **25 meetings/month free**

**Get your Azure Speech key:**
1. Go to [Azure Portal](https://portal.azure.com)
2. Create a "Speech" resource (or use existing one)
3. Get your **Subscription Key** and **Region** from "Keys and Endpoint"

## ⚙️ Installation

### Step 1: Install TTS Service Dependencies

```bash
cd backend/services/tts-service
pip install -r requirements.txt
```

### Step 2: Configure Environment Variables

Create `.env` file in `backend/services/tts-service/`:

```bash
# Copy example file
cp .env.example .env
```

Edit `.env` and add your Azure credentials:

```env
# Azure Text-to-Speech Configuration
AZURE_SPEECH_KEY=your-azure-speech-key-here
AZURE_SPEECH_REGION=eastus

# Service Configuration
TTS_SERVICE_HOST=0.0.0.0
TTS_SERVICE_PORT=3005

# Logging
LOG_LEVEL=INFO
```

**Note:** If you already have Azure Speech configured for STT, use the **same key**!

### Step 3: Update Chat Service Configuration

Add TTS service URL to chat service `.env` (or root `.env`):

```env
# TTS Service URL
TTS_SERVICE_URL=http://localhost:3005
```

### Step 4: Start the TTS Service

#### Windows:
```bash
cd backend\services\tts-service
python main.py
```

#### Linux/Mac:
```bash
cd backend/services/tts-service
python3 main.py
```

You should see:
```
INFO: Azure TTS Service initialized
INFO: TTS service initialized successfully
INFO: Uvicorn running on http://0.0.0.0:3005
```

### Step 5: Start Other Services

Make sure all services are running:

1. **Translation Service** (port 3003)
2. **STT Service** (port 3004)
3. **TTS Service** (port 3005) ← New!
4. **Chat Service** (port 3001)
5. **Frontend** (port 5173)

## 🎮 Usage

### In the Meeting Room

1. **Join a meeting** as usual
2. **Enable transcription** (📝 button)
3. **Click the Audio Settings button** (👂 or 🔊)
4. **Toggle between modes:**
   - **👂 Original**: Hear speakers in their native language
   - **🔊 Translated**: Hear AI-translated English voice
5. **Adjust TTS volume** if needed (only visible in Translated mode)

### Testing

1. Join a meeting with multiple participants
2. Participant A selects "Translated" mode
3. Participant B speaks in Spanish: "Hola, ¿cómo estás?"
4. Participant A hears:
   - Original Spanish audio is muted/lowered
   - TTS English voice: "Hello, how are you?"
   - Transcription panel shows both Spanish and English text

## 🔧 Troubleshooting

### TTS Service Won't Start

**Error: `Azure Speech API key not configured`**
- Check `.env` file has `AZURE_SPEECH_KEY` set
- Verify the key is correct (no extra spaces)
- Restart the service

**Error: `ModuleNotFoundError: No module named 'azure'`**
```bash
pip install -r requirements.txt
```

### No Audio Plays

**Check:**
1. Is TTS service running? (check port 3005)
2. Is "Translated" mode enabled? (🔊 button should be blue)
3. Check browser console for errors
4. Check TTS service logs for synthesis errors

**Common issue:** Azure quota exceeded
- Check Azure Portal → Your Speech Resource → Metrics
- Free tier: 0.5M characters/month
- Solution: Wait for monthly reset or upgrade to paid tier

### Audio is Choppy or Delayed

**Expected latency:** 1-2 seconds (STT + Translation + TTS)

If longer:
- Check network connection
- Verify all services are running locally (not over network)
- Check Azure service region (use closest region)

### Wrong Voice or Language

TTS automatically selects voice based on target language:
- English → "Jenny" (US, female, friendly)
- Spanish → "Elvira" (ES, female, friendly)
- French → "Denise" (FR, female, friendly)
- etc.

To customize voices, edit: `backend/services/tts-service/app/providers/azure_tts.py`

## 📊 Performance

### Latency Breakdown

| Stage | Time | Notes |
|-------|------|-------|
| STT (Speech-to-Text) | 300-500ms | Azure Speech or Whisper |
| Translation | 100-200ms | Azure Translator |
| TTS (Text-to-Speech) | 200-400ms | Azure TTS |
| Network | 50-100ms | Socket.IO broadcast |
| **Total** | **~1-2 seconds** | Acceptable for real-time translation |

### Resource Usage

| Service | CPU | RAM | Network |
|---------|-----|-----|---------|
| TTS Service | ~5-10% | ~200MB | ~50KB/s per user |
| Azure TTS API | N/A | N/A | ~5-10KB per synthesis |

## 💰 Cost Estimation

### Free Tier (Azure Speech)

- **TTS**: 0.5 million characters/month FREE
- **Typical meeting** (30 min, 3 people): ~20,000 characters
- **Monthly capacity**: ~25 meetings

### Paid Tier (if needed)

- **Standard S0**: $16 per 1M characters
- **30-minute meeting**: ~$0.32
- **Monthly (25 meetings)**: ~$8

## 🔐 Security Notes

- TTS audio is **not stored** - generated on-the-fly
- Azure communication is **encrypted** (HTTPS)
- API keys should be kept in `.env` (never commit!)
- For production, consider:
  - Azure Key Vault for secrets
  - Rate limiting on TTS endpoint
  - User quotas to prevent abuse

## 🎯 Advanced Configuration

### Voice Customization

Edit `backend/services/tts-service/app/providers/azure_tts.py`:

```python
self.voice_map = {
    "en": "en-US-JennyNeural",    # Change to "en-US-GuyNeural" for male voice
    "es": "es-ES-ElviraNeural",
    # ... add more languages
}
```

Browse voices: https://speech.microsoft.com/portal/voicegallery

### Speed and Pitch Adjustment

TTS requests support prosody control:

```json
{
  "text": "Hello there",
  "language": "en",
  "speed": 1.2,  // 20% faster
  "pitch": 0.9   // 10% lower pitch
}
```

### Adding Piper TTS Fallback (Local, Offline)

For offline support, uncomment Piper TTS in `requirements.txt` and configure:

```env
ENABLE_PIPER_FALLBACK=true
PIPER_MODEL_PATH=./models/piper
```

Download Piper models from: https://github.com/rhasspy/piper

## 📚 API Reference

### POST /api/v1/synthesis/synthesize

Synthesize speech from text.

**Request:**
```json
{
  "text": "Hello, how are you?",
  "language": "en",
  "speed": 1.0,
  "pitch": 1.0,
  "transcription_id": "uuid",
  "meeting_id": "meeting-123",
  "user_id": "user-456"
}
```

**Response:**
```json
{
  "id": "synthesis-uuid",
  "audio_data": "base64_encoded_mp3_audio",
  "format": "mp3",
  "language": "en",
  "duration_seconds": 1.5,
  "provider": "azure_tts",
  "processing_time_ms": 350
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "service": "tts-service",
  "status": "healthy",
  "providers": [
    {
      "status": "healthy",
      "provider": "azure_tts",
      "region": "eastus",
      "details": "Azure TTS Service ready"
    }
  ],
  "primary_provider": "azure_tts"
}
```

## 🐛 Known Issues

1. **Multiple simultaneous speakers**: TTS audio may overlap
   - Workaround: Audio queue system (already implemented)

2. **Emotion/tone not preserved**: TTS voices are neutral
   - This is a limitation of current TTS technology

3. **Accents**: TTS uses standard accents (US English, etc.)
   - Cannot match speaker's original accent

## 🚀 Future Improvements

- [ ] Voice cloning (match original speaker's voice)
- [ ] Emotion transfer (preserve tone/emotion)
- [ ] Multiple target languages (not just English)
- [ ] Speaker-specific voice preferences
- [ ] Audio mixing (lower original + TTS overlay)
- [ ] Custom pronunciation dictionary
- [ ] SSML support for advanced prosody control

---

**Need help?** Check the logs:
```bash
# TTS Service logs
cd backend/services/tts-service
python main.py  # Watch output

# Chat Service logs
cd backend/services/chat-service
npm run dev  # Watch for TTS-related messages
```

**Documentation:**
- Azure TTS: https://learn.microsoft.com/azure/ai-services/speech-service/text-to-speech
- SSML Reference: https://learn.microsoft.com/azure/ai-services/speech-service/speech-synthesis-markup
