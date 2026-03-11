@echo off
echo 🚀 Setting up Multilingual Chat Development Environment
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo ✅ Docker is running

REM Navigate to deployment directory
cd /d "%~dp0..\deployment"

echo 📦 Starting infrastructure services...
docker-compose -f docker-compose.simple.yml up -d

echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo 📊 Checking service status...
docker-compose -f docker-compose.simple.yml ps

echo.
echo 🌐 Service URLs:
echo   PostgreSQL: localhost:5432
echo   Redis: localhost:6379
echo   LibreTranslate: http://localhost:5000
echo.
echo 💡 To start the application services:
echo   1. Chat Service: cd backend\services\chat-service && npm install && npm run dev
echo   2. Translation Service: cd backend\services\translation-service && pip install -r requirements.txt && python main.py
echo   3. Frontend: cd frontend && npm install && npm run dev
echo.
echo 🛑 To stop services: docker-compose -f docker-compose.simple.yml down
echo.
pause