# Speech-to-Text Service

Real-time speech transcription service using OpenAI Whisper.

## Features

- **Speech-to-Text**: Convert audio to text using Whisper
- **Multiple Models**: Choose from tiny, base, small, medium, or large models
- **Language Detection**: Automatic language detection or specify language
- **Segmented Output**: Get timestamped text segments
- **REST API**: Simple HTTP API for transcription

## Quick Start

### 1. Install Dependencies

```bash
cd backend/services/stt-service
pip install -r requirements.txt
```

**Note**: First run will download the Whisper model (~150MB for base model).

### 2. Start Service

```bash
python main.py
```

Service will run on **http://localhost:3004**

### 3. Test Transcription

```bash
curl -X POST http://localhost:3004/api/v1/transcription/transcribe \
  -H "Content-Type: application/json" \
  -d '{
    "audio_data": "<base64-encoded-audio>",
    "language": "en"
  }'
```

## API Endpoints

### `POST /api/v1/transcription/transcribe`
Transcribe base64-encoded audio data.

**Request:**
```json
{
  "audio_data": "base64-encoded-wav-audio",
  "language": "en",
  "meeting_id": "optional-meeting-id",
  "user_id": "optional-user-id"
}
```

**Response:**
```json
{
  "id": "uuid",
  "text": "Transcribed text here",
  "language": "en",
  "segments": [
    {
      "id": 0,
      "start": 0.0,
      "end": 2.5,
      "text": "Transcribed text here",
      "confidence": 0.95
    }
  ],
  "processing_time_ms": 1200
}
```

### `POST /api/v1/transcription/transcribe/file`
Upload and transcribe an audio file.

### `GET /health`
Health check endpoint.

## Configuration

Edit `.env` file:

```env
# Choose model: tiny, base, small, medium, large
WHISPER_MODEL=base

# Device: cpu or cuda (if GPU available)
DEVICE=cpu

# Port
PORT=3004
```

## Model Options

| Model  | Size  | Speed      | Accuracy | Use Case              |
|--------|-------|------------|----------|-----------------------|
| tiny   | 75MB  | Very Fast  | Basic    | Testing/prototyping   |
| base   | 150MB | Fast       | Good     | **Recommended**       |
| small  | 500MB | Medium     | Better   | Production            |
| medium | 1.5GB | Slow       | High     | High accuracy needed  |
| large  | 3GB   | Very Slow  | Best     | Maximum accuracy      |

## Integration

This service is designed to work with the meeting service via:
1. Frontend captures audio from WebRTC
2. Meeting service forwards to STT service
3. STT service transcribes and returns text
4. Transcription sent back to meeting participants
5. Translation service translates text if needed

## Development

```bash
# Install in development mode
pip install -r requirements.txt

# Run with auto-reload
python main.py
```

## Performance Tips

- Use **base** model for development (good balance)
- Use **cuda** device if you have GPU (10x faster)
- Chunk audio into 10-30 second segments for best results
- Lower sample rate (8000Hz) for faster processing if quality allows
