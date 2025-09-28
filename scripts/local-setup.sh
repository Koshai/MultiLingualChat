#!/bin/bash

# Local Development Setup Script
# This script sets up the multilingual chat platform for local development

echo "🚀 Multilingual Chat Platform - Local Setup"
echo "============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created. Please review and update if needed."
else
    echo "✅ .env file already exists"
fi

# Install root dependencies (husky, lint-staged)
echo "📦 Installing root dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
if [ ! -f "package.json" ]; then
    echo "❌ Frontend package.json not found"
    exit 1
fi
npm install
cd ..

# Install chat service dependencies
echo "📦 Installing chat service dependencies..."
cd backend/services/chat-service
if [ ! -f "package.json" ]; then
    echo "❌ Chat service package.json not found"
    exit 1
fi
npm install
cd ../../..

# Install translation service dependencies
echo "📦 Installing translation service dependencies..."
cd backend/services/translation-service
if [ ! -f "requirements.txt" ]; then
    echo "❌ Translation service requirements.txt not found"
    exit 1
fi

# Check if Python is available
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.8+"
    exit 1
fi

# Use python3 if available, otherwise python
PYTHON_CMD="python3"
if ! command -v python3 &> /dev/null; then
    PYTHON_CMD="python"
fi

# Install Python dependencies
pip install -r requirements.txt
cd ../../..

echo ""
echo "✅ Local development setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Review and update .env file if needed"
echo "2. Set up local PostgreSQL (optional - can use SQLite)"
echo "3. Set up local Redis (optional - services work without caching)"
echo "4. Install LibreTranslate (optional - can use mock translation)"
echo ""
echo "🔧 Optional dependencies:"
echo "- PostgreSQL: Create a database named 'multilingual_chat'"
echo "- Redis: Install and run on default port 6379"
echo "- LibreTranslate: pip install libretranslate && libretranslate"
echo ""
echo "🚀 To start development:"
echo "source scripts/claude-helpers.sh"
echo "cc-start"
echo ""
echo "📊 To check status:"
echo "cc-status"