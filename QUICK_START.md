# Quick Start Guide

This guide will help you quickly start the MultilingualChat application.

## One-Click Startup

### Windows
Simply double-click `start-dev.bat` or run in terminal:
```bash
start-dev.bat
```

### Mac/Linux
```bash
./start-dev.sh
```

This will automatically start all three services:
1. **Chat Service** (Backend) - Port 3001
2. **STT Service** (Speech-to-Text) - Port 3004
3. **Frontend** (UI) - Port 5173

## Access the Application

Once all services are running, open your browser and navigate to:
```
http://localhost:5173
```

## Stopping Services

### Windows
Press any key in the terminal window where you ran `start-dev.bat`

### Mac/Linux
Press `Ctrl+C` in the terminal

## Manual Setup (Alternative)

If you prefer to run services individually:

### Terminal 1 - Chat Service
```bash
cd backend/services/chat-service
npm run dev
```

### Terminal 2 - STT Service
```bash
cd backend/services/stt-service
python main.py
```

### Terminal 3 - Frontend
```bash
cd frontend
npm run dev
```

## Prerequisites

Before running the application, make sure you have:

- Node.js (v18 or higher)
- Python 3.10+
- All dependencies installed:
  ```bash
  # Install chat service dependencies
  cd backend/services/chat-service && npm install

  # Install STT service dependencies
  cd backend/services/stt-service && pip install -r requirements.txt

  # Install frontend dependencies
  cd frontend && npm install
  ```

## Features

- **Video Conferencing**: Real-time peer-to-peer video and audio
- **Live Transcription**: Speech-to-text with multilingual support
- **Real-time Chat**: Text messaging during meetings
- **Screen Sharing**: Share your screen with participants

## Troubleshooting

### Port Already in Use
If you get a port conflict error, make sure no other services are running on:
- Port 3001 (Chat Service)
- Port 3004 (STT Service)
- Port 5173 (Frontend)

### Python Dependencies Error
Make sure you have Python 3.10+ and install dependencies:
```bash
cd backend/services/stt-service
pip install -r requirements.txt
```

### FFmpeg Not Found
The STT service requires FFmpeg. Install it:
- **Windows**: Download from https://ffmpeg.org/download.html
- **Mac**: `brew install ffmpeg`
- **Linux**: `sudo apt-get install ffmpeg`

## Support

For issues or questions, please refer to the main README.md or create an issue in the repository.
