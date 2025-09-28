# Multilingual Video Conferencing Platform

A professional video conferencing platform with real-time multilingual translation - an alternative to Teams, Zoom, and WebEx with built-in language barriers elimination.

## 🌟 Features

### **Video Conferencing Core**
- **HD video and audio** calls with WebRTC
- **Screen sharing** and presentation mode
- **Meeting rooms** with participant management
- **Recording and playback** capabilities

### **Real-time Translation Superpowers**
- **Live speech-to-text** with instant translation
- **Translated captions** overlay on video
- **Multi-language audio** (text-to-speech in preferred language)
- **10+ languages** support with intelligent detection

### **Professional Features**
- **Meeting scheduling** and calendar integration
- **User authentication** and organizational profiles
- **Mobile and desktop** responsive design
- **Enterprise-grade security** and compliance

## 🏗️ Architecture

### Services

- **Meeting Service** (TypeScript/Express) - WebRTC signaling server with meeting room management
- **Translation Service** (Python/FastAPI) - Real-time speech-to-text and translation using Whisper/LibreTranslate
- **Media Service** (Future) - Audio/video stream processing and recording
- **Frontend** (React/TypeScript) - Video conferencing interface with translation overlay
- **PostgreSQL** - Primary database for users, meetings, and session data
- **Redis** - Real-time caching and participant session management
- **LibreTranslate** - Open-source translation engine
- **Whisper** - Speech-to-text processing for real-time captions

### Phase 1: Foundation (Current - Weeks 1-4)
- ✅ Local development infrastructure setup
- ✅ Meeting service with WebSocket support (transformed from chat)
- ✅ Translation service with LibreTranslate integration
- ✅ Basic React frontend with authentication
- 🔄 **IN PROGRESS:** Transform chat rooms → meeting rooms
- 🔄 **IN PROGRESS:** Update UI terminology and concepts

### Phase 2: Video Conferencing Core (Weeks 5-8)
- 🎯 WebRTC integration for video/audio streams
- 🎯 Meeting room management with participant controls
- 🎯 Basic video UI grid layout (Teams/Zoom style)
- 🎯 Audio capture pipeline for speech processing

### Phase 3: Real-time Translation (Weeks 9-12)
- 🎯 Speech-to-Text integration using Whisper
- 🎯 Real-time caption overlay with translations
- 🎯 Text-to-Speech for audio translation
- 🎯 Performance optimization (<3 second latency)

### Phase 4: Advanced Features (Weeks 13-16)
- 🎯 Multilingual input methods (10 languages)
- 🎯 Screen sharing and presentation mode
- 🎯 Mobile responsive video conferencing
- 🎯 Production deployment with monitoring

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** - For frontend and chat service
- **Python 3.8+** - For translation service
- **Git** - For version control

### Optional Dependencies
- **PostgreSQL** - For persistent database (SQLite fallback available)
- **Redis** - For caching and sessions (optional)
- **LibreTranslate** - For translations (mock translation available)

### Local Development Setup

1. **Clone and setup environment**
   ```bash
   git checkout feature/phase1-foundation
   cd multilingual-chat
   ```

2. **Run the setup script**
   ```bash
   chmod +x scripts/local-setup.sh
   ./scripts/local-setup.sh
   ```

3. **Start development environment**
   ```bash
   # Load helper commands
   source scripts/claude-helpers.sh

   # Start all services
   cc-start
   ```

4. **Check service status**
   ```bash
   cc-status
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Chat API: http://localhost:3001
   - Translation API: http://localhost:3003

### Demo Credentials

- Username: `demo`
- Password: `password`

## 📁 Project Structure

```
multilingual-chat/
├── backend/
│   ├── services/
│   │   ├── chat-service/          # TypeScript/Express WebSocket server
│   │   └── translation-service/   # Python/FastAPI translation API
│   └── shared/                    # Shared utilities and types
├── frontend/                      # React/TypeScript frontend
├── deployment/                    # Docker configurations
│   ├── docker-compose.dev.yml     # Development environment
│   └── database/                  # Database initialization
├── scripts/                       # Helper scripts
└── docs/                         # Documentation
```

## 🔧 Development Commands

### Using Claude Helper Scripts

```bash
# Load helper commands
source scripts/claude-helpers.sh

# Set up development environment (first time only)
cc-setup

# Start all services
cc-start

# Stop all services
cc-stop

# Check service status
cc-status

# Run tests
cc-test-chat
cc-test-frontend

# Quick commit
cc-commit feat "add new feature"
```

### Manual Commands

```bash
# Chat Service
cd backend/services/chat-service
npm install
npm run dev

# Translation Service
cd backend/services/translation-service
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 3003

# Frontend
cd frontend
npm install
npm run dev
```

### Database Setup (Optional)

```bash
# PostgreSQL setup
createdb multilingual_chat
psql multilingual_chat < deployment/database/init.sql

# Or use SQLite (no setup required)
# Just set DATABASE_URL=sqlite:./dev.db in .env
```

## 🌐 Supported Languages

| Language | Code | Flag |
|----------|------|------|
| English | en | 🇺🇸 |
| Spanish | es | 🇪🇸 |
| French | fr | 🇫🇷 |
| German | de | 🇩🇪 |
| Italian | it | 🇮🇹 |
| Portuguese | pt | 🇵🇹 |
| Russian | ru | 🇷🇺 |
| Chinese | zh | 🇨🇳 |
| Japanese | ja | 🇯🇵 |
| Korean | ko | 🇰🇷 |

## 🧪 Testing

```bash
# Run all tests
npm test

# Chat service tests
cd backend/services/chat-service
npm test

# Frontend tests
cd frontend
npm test
```

## 📊 API Documentation

### Chat Service
- **Base URL**: `http://localhost:3001/api`
- **WebSocket**: `ws://localhost:3001`
- **Health Check**: `GET /health`

### Translation Service
- **Base URL**: `http://localhost:3003/api/v1`
- **Translate**: `POST /translate`
- **Languages**: `GET /languages`
- **Health Check**: `GET /health`

## 🌐 Local Services

| Service | Port | Description |
|---------|------|-------------|
| frontend | 5173 | React application (Vite dev server) |
| chat-service | 3001 | Chat WebSocket server |
| translation-service | 3003 | Translation API |
| postgres | 5432 | PostgreSQL database (optional) |
| redis | 6379 | Redis cache (optional) |
| libretranslate | 5000 | Translation engine (optional) |

## 🔒 Environment Variables

See `.env.example` files in each service directory for complete configuration options.

## 🛠️ Technology Stack

### Backend
- **Node.js** + **Express** + **Socket.IO** (Chat Service)
- **Python** + **FastAPI** (Translation Service)
- **PostgreSQL** (Database)
- **Redis** (Caching)
- **LibreTranslate** (Translation Engine)

### Frontend
- **React 18** + **TypeScript**
- **Vite** (Build tool)
- **Tailwind CSS** (Styling)
- **Zustand** (State management)
- **React Query** (Data fetching)
- **Socket.IO Client** (Real-time)

### DevOps
- **Local Development** setup
- **GitHub Actions** (CI/CD)
- **Husky** (Git hooks)
- **ESLint** + **Prettier** (Code quality)

## 📋 Roadmap

### Phase 2: Audio Integration (Weeks 5-8)
- [ ] Speech-to-Text (STT) service using Whisper
- [ ] Text-to-Speech (TTS) service using Piper
- [ ] WebRTC audio streaming
- [ ] Voice message translation

### Phase 3: Optimization (Weeks 9-12)
- [ ] Message persistence and search
- [ ] Advanced caching strategies
- [ ] Performance monitoring
- [ ] UI/UX enhancements

### Phase 4: Production (Weeks 13-16)
- [ ] Security hardening
- [ ] Kubernetes deployment
- [ ] Monitoring and alerting
- [ ] Load testing and optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [LibreTranslate](https://libretranslate.com/) for open-source translation
- [Socket.IO](https://socket.io/) for real-time communication
- [FastAPI](https://fastapi.tiangolo.com/) for modern Python APIs
- [React](https://reactjs.org/) for the user interface