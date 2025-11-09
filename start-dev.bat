@echo off
echo Starting MultilingualChat Development Environment...
echo.

REM Check if required directories exist
if not exist "backend\services\chat-service" (
    echo Error: Chat service directory not found
    exit /b 1
)

if not exist "frontend" (
    echo Error: Frontend directory not found
    exit /b 1
)

if not exist "backend\services\stt-service" (
    echo Error: STT service directory not found
    exit /b 1
)

if not exist "backend\services\translation-service" (
    echo Error: Translation service directory not found
    exit /b 1
)

REM Check if Docker is running
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Warning: Docker is not running. Redis caching will be disabled.
    echo Translation service will still work with fallback.
    echo.
) else (
    echo [0/5] Starting Redis with Docker...
    docker-compose up -d redis
    timeout /t 2 /nobreak >nul
)

echo [1/5] Starting Chat Service (Backend)...
start "Chat Service" cmd /k "cd backend\services\chat-service && npm run dev"
timeout /t 2 /nobreak >nul

echo [2/5] Starting STT Service (Speech-to-Text)...
start "STT Service" cmd /k "cd backend\services\stt-service && python main.py"
timeout /t 2 /nobreak >nul

echo [3/5] Starting Translation Service...
start "Translation Service" cmd /k "cd backend\services\translation-service && python main.py"
timeout /t 2 /nobreak >nul

echo [4/5] Starting Frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 2 /nobreak >nul

echo.
echo ============================================
echo All services started successfully!
echo ============================================
echo.
echo Redis (Docker):      localhost:6379
echo Chat Service:        http://localhost:3001
echo STT Service:         http://localhost:3004
echo Translation Service: http://localhost:3003
echo Frontend:            http://localhost:5174
echo.
echo Press any key to stop all services...
pause >nul

echo Stopping all services...
taskkill /FI "WINDOWTITLE eq Chat Service*" /T /F 2>nul
taskkill /FI "WINDOWTITLE eq STT Service*" /T /F 2>nul
taskkill /FI "WINDOWTITLE eq Translation Service*" /T /F 2>nul
taskkill /FI "WINDOWTITLE eq Frontend*" /T /F 2>nul

echo Stopping Redis...
docker-compose down 2>nul

echo All services stopped.
