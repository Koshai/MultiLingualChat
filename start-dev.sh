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

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping all services..."
    kill 0
    exit
}

trap cleanup SIGINT SIGTERM

echo "[1/3] Starting Chat Service (Backend)..."
cd backend/services/chat-service && npm run dev &
CHAT_PID=$!
cd ../../..

sleep 2

echo "[2/3] Starting STT Service (Speech-to-Text)..."
cd backend/services/stt-service && python main.py &
STT_PID=$!
cd ../../..

sleep 2

echo "[3/3] Starting Frontend..."
cd frontend && npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "============================================"
echo "All services started successfully!"
echo "============================================"
echo ""
echo "Chat Service:    http://localhost:3001"
echo "STT Service:     http://localhost:3004"
echo "Frontend:        http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all services..."

# Wait for all background processes
wait
