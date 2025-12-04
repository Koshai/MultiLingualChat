#!/bin/bash
# Start all services using PM2

echo "================================================"
echo "  Starting All Services"
echo "================================================"
echo ""

cd ~/MultiLingualChat

# Stop any existing services
pm2 delete all 2>/dev/null || true

echo "[1/5] Starting Translation Service (port 3003)..."
cd ~/MultiLingualChat/backend/services/translation-service
pm2 start main.py --name "translation" --interpreter python3

echo "[2/5] Starting STT Service (port 3004)..."
cd ~/MultiLingualChat/backend/services/stt-service
pm2 start main.py --name "stt" --interpreter python3

echo "[3/5] Starting TTS Service (port 3005)..."
cd ~/MultiLingualChat/backend/services/tts-service
pm2 start main.py --name "tts" --interpreter python3

echo "[4/5] Starting Chat Service (port 3001)..."
cd ~/MultiLingualChat/backend/services/chat-service
pm2 start npm --name "chat" -- run dev

echo "[5/5] Starting Frontend (port 5173)..."
cd ~/MultiLingualChat/frontend
pm2 start npm --name "frontend" -- run dev

# Save PM2 configuration
pm2 save

echo ""
echo "================================================"
echo "  All Services Started!"
echo "================================================"
echo ""

# Wait a moment for services to initialize
sleep 3

# Show status
pm2 status

echo ""
echo "Your app is running at:"
echo "  http://$(curl -s ifconfig.me):5173"
echo ""
echo "Useful commands:"
echo "  pm2 status       - Check service status"
echo "  pm2 logs         - View all logs"
echo "  pm2 logs frontend - View frontend logs only"
echo "  pm2 restart all  - Restart all services"
echo "  pm2 stop all     - Stop all services"
echo ""
echo "To make services start on reboot:"
echo "  pm2 startup"
echo "  pm2 save"
echo ""
