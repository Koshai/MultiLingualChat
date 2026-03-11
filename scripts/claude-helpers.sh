#!/bin/bash

# Helper commands for Claude Code integration - Local Development

# Set up local development environment
cc-setup() {
    echo "🚀 Setting up local development environment..."
    echo "=============================================="

    # Install dependencies for all services
    echo "📦 Installing dependencies..."

    # Frontend dependencies
    echo "Installing frontend dependencies..."
    cd frontend && npm install && cd ..

    # Chat service dependencies
    echo "Installing chat service dependencies..."
    cd backend/services/chat-service && npm install && cd ../../..

    # Translation service dependencies
    echo "Installing translation service dependencies..."
    cd backend/services/translation-service && pip install -r requirements.txt && cd ../../..

    # STT service dependencies
    echo "Installing STT service dependencies..."
    cd backend/services/stt-service && pip install -r requirements.txt && cd ../../..

    # TTS service dependencies
    echo "Installing TTS service dependencies..."
    cd backend/services/tts-service && pip install -r requirements.txt && cd ../../..

    echo "✅ Development environment ready!"
    echo "Use 'cc-start' to start all services"
}

# Start all services locally
cc-start() {
    echo "🔄 Starting all services..."
    echo "Please ensure optional dependencies (Redis/PostgreSQL) are available if needed"

    # Start chat service in background
    echo "Starting chat service..."
    cd backend/services/chat-service && npm run dev &
    CHAT_PID=$!
    cd ../../..

    # Start translation service in background
    echo "Starting translation service..."
    cd backend/services/translation-service && python -m uvicorn main:app --reload --port 3003 &
    TRANSLATION_PID=$!
    cd ../../..

    # Start STT service in background
    echo "Starting STT service..."
    cd backend/services/stt-service && python main.py &
    STT_PID=$!
    cd ../../..

    # Start TTS service in background
    echo "Starting TTS service..."
    cd backend/services/tts-service && python main.py &
    TTS_PID=$!
    cd ../../..

    # Start frontend
    echo "Starting frontend..."
    cd frontend && npm run dev &
    FRONTEND_PID=$!
    cd ..

    # Store PIDs for later cleanup
    echo $CHAT_PID > .chat_pid
    echo $TRANSLATION_PID > .translation_pid
    echo $STT_PID > .stt_pid
    echo $TTS_PID > .tts_pid
    echo $FRONTEND_PID > .frontend_pid

    echo "🌐 Service URLs:"
    echo "Frontend: http://localhost:5173 (Vite dev server)"
    echo "Meeting/Chat API: http://localhost:3001"
    echo "Translation API:  http://localhost:3003"
    echo "STT API:          http://localhost:3004"
    echo "TTS API:          http://localhost:3005"
}

# Stop all services
cc-stop() {
    echo "🛑 Stopping all services..."

    if [ -f .chat_pid ]; then
        kill $(cat .chat_pid) 2>/dev/null
        rm .chat_pid
    fi

    if [ -f .translation_pid ]; then
        kill $(cat .translation_pid) 2>/dev/null
        rm .translation_pid
    fi

    if [ -f .stt_pid ]; then
        kill $(cat .stt_pid) 2>/dev/null
        rm .stt_pid
    fi

    if [ -f .tts_pid ]; then
        kill $(cat .tts_pid) 2>/dev/null
        rm .tts_pid
    fi

    if [ -f .frontend_pid ]; then
        kill $(cat .frontend_pid) 2>/dev/null
        rm .frontend_pid
    fi

    echo "✅ All services stopped"
}

# Testing helpers
alias cc-test-chat="cd backend/services/chat-service && npm test"
alias cc-test-frontend="cd frontend && npm test"

# Development status
_cc_check_http() {
    local name="$1"
    local url="$2"
    if curl -fsS "$url" >/dev/null 2>&1; then
        echo "✅ $name is running"
    else
        echo "❌ $name is not running"
    fi
}

cc-status() {
    echo "🔍 Local Development Environment Status"
    echo "======================================="

    _cc_check_http "Frontend" "http://localhost:5173"
    _cc_check_http "Meeting service" "http://localhost:3001/health"
    _cc_check_http "Translation service" "http://localhost:3003/health"
    _cc_check_http "STT service" "http://localhost:3004/health"
    _cc_check_http "TTS service" "http://localhost:3005/health"

    echo ""
    echo "🌐 Service URLs:"
    echo "Frontend: http://localhost:5173"
    echo "Meeting/Chat API: http://localhost:3001"
    echo "Translation API: http://localhost:3003"
    echo "STT API: http://localhost:3004"
    echo "TTS API: http://localhost:3005"
}

# Quick commit with conventional format
cc-commit() {
    if [ -z "$1" ]; then
        echo "Usage: cc-commit <type> <message>"
        echo "Types: feat, fix, docs, style, refactor, test, chore"
        return 1
    fi
    git add .
    git commit -m "$1: $2"
}

echo "Claude Code helper commands loaded!"
echo "Use 'cc-setup' to start development environment"
echo "Use 'cc-status' to check service status"
