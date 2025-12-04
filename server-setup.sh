#!/bin/bash
# Automated server setup script for Ubuntu VPS
# Run this on your Oracle Cloud VM

set -e  # Exit on error

echo "================================================"
echo "  MultiLingual Chat - Server Setup"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}[Step 1/8] Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

echo -e "${GREEN}✓ System updated${NC}"
echo ""

echo -e "${YELLOW}[Step 2/8] Installing Node.js 20.x...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

echo -e "${GREEN}✓ Node.js installed${NC}"
echo ""

echo -e "${YELLOW}[Step 3/8] Installing Python 3 and pip...${NC}"
sudo apt install -y python3 python3-pip python3-venv
echo "Python version: $(python3 --version)"

echo -e "${GREEN}✓ Python installed${NC}"
echo ""

echo -e "${YELLOW}[Step 4/8] Installing Git...${NC}"
sudo apt install -y git
echo "Git version: $(git --version)"

echo -e "${GREEN}✓ Git installed${NC}"
echo ""

echo -e "${YELLOW}[Step 5/8] Installing PM2 (process manager)...${NC}"
sudo npm install -g pm2
pm2 --version

echo -e "${GREEN}✓ PM2 installed${NC}"
echo ""

echo -e "${YELLOW}[Step 6/8] Cloning repository...${NC}"
cd ~
if [ -d "MultiLingualChat" ]; then
    echo "Repository already exists, pulling latest..."
    cd MultiLingualChat
    git pull
else
    git clone https://github.com/Koshai/MultiLingualChat.git
    cd MultiLingualChat
fi

git checkout feature/tunneling-alternatives
echo -e "${GREEN}✓ Repository cloned${NC}"
echo ""

echo -e "${YELLOW}[Step 7/8] Installing dependencies...${NC}"

# Backend - Chat Service
echo "Installing Chat Service dependencies..."
cd ~/MultiLingualChat/backend/services/chat-service
npm install
echo -e "${GREEN}✓ Chat Service ready${NC}"

# Frontend
echo "Installing Frontend dependencies..."
cd ~/MultiLingualChat/frontend
npm install
echo -e "${GREEN}✓ Frontend ready${NC}"

# Translation Service
echo "Installing Translation Service dependencies..."
cd ~/MultiLingualChat/backend/services/translation-service
pip3 install -r requirements.txt
echo -e "${GREEN}✓ Translation Service ready${NC}"

# STT Service
echo "Installing STT Service dependencies..."
cd ~/MultiLingualChat/backend/services/stt-service
pip3 install -r requirements.txt
echo -e "${GREEN}✓ STT Service ready${NC}"

# TTS Service
echo "Installing TTS Service dependencies..."
cd ~/MultiLingualChat/backend/services/tts-service
pip3 install -r requirements.txt
echo -e "${GREEN}✓ TTS Service ready${NC}"

echo ""
echo -e "${YELLOW}[Step 8/8] Setting up firewall...${NC}"
# Disable Ubuntu firewall (Oracle Cloud firewall handles it)
sudo ufw disable
echo -e "${GREEN}✓ Firewall configured${NC}"

echo ""
echo "================================================"
echo "  Setup Complete!"
echo "================================================"
echo ""
echo -e "${GREEN}All dependencies installed successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Run: ./start-all-services.sh"
echo "2. Check status: pm2 status"
echo "3. Access your app at: http://$(curl -s ifconfig.me):5173"
echo ""
echo "Useful commands:"
echo "  pm2 status       - Check all services"
echo "  pm2 logs         - View all logs"
echo "  pm2 restart all  - Restart all services"
echo "  pm2 stop all     - Stop all services"
echo ""
