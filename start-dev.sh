#!/bin/bash

echo "Starting MultilingualChat Development Environment..."
echo ""

# Check if required directories exist
if [ ! -d "backend/services/chat-service" ]; then
    echo "Error: Chat service directory not found"
    exit 1
fi

if [ ! -d "frontend" ]; then
    echo "Error: Frontend directory not found"
    exit 1
fi

if [ ! -d "backend/services/stt-service" ]; then
    echo "Error: STT service directory not found"
    exit 1
fi

if [ ! -d "backend/services/translation-service" ]; then
    echo "Error: Translation service directory not found"
    exit 1
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping all services..."
    kill 0
    echo "Stopping Redis..."
    docker-compose down 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Check if Docker is running
if docker info >/dev/null 2>&1; then
    echo "[0/5] Starting Redis with Docker..."
    docker-compose up -d redis
    sleep 2
else
    echo "Warning: Docker is not running. Redis caching will be disabled."
    echo "Translation service will still work with fallback."
    echo ""
fi

echo "[1/5] Starting Chat Service (Backend)..."
cd backend/services/chat-service && npm run dev &
CHAT_PID=$!
cd ../../..

sleep 2

echo "[2/5] Starting STT Service (Speech-to-Text)..."
cd backend/services/stt-service && python main.py &
STT_PID=$!
cd ../../..

sleep 2

echo "[3/5] Starting Translation Service..."
cd backend/services/translation-service && python main.py &
TRANSLATION_PID=$!
cd ../../..

sleep 2

echo "[4/5] Starting Frontend..."
cd frontend && npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "============================================"
echo "All services started successfully!"
echo "============================================"
echo ""
echo "Redis (Docker):      localhost:6379"
echo "Chat Service:        http://localhost:3001"
echo "STT Service:         http://localhost:3004"
echo "Translation Service: http://localhost:3003"
echo "Frontend:            http://localhost:5174"
echo ""
echo "Press Ctrl+C to stop all services..."

# Wait for all background processes
wait
