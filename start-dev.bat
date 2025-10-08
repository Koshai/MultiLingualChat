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

echo [1/4] Starting Chat Service (Backend)...
start "Chat Service" cmd /k "cd backend\services\chat-service && npm run dev"
timeout /t 2 /nobreak >nul

echo [2/4] Starting STT Service (Speech-to-Text)...
start "STT Service" cmd /k "cd backend\services\stt-service && python main.py"
timeout /t 2 /nobreak >nul

echo [3/4] Starting Translation Service...
start "Translation Service" cmd /k "cd backend\services\translation-service && python main.py"
timeout /t 2 /nobreak >nul

echo [4/4] Starting Frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 2 /nobreak >nul

echo.
echo ============================================
echo All services started successfully!
echo ============================================
echo.
echo Chat Service:        http://localhost:3001
echo STT Service:         http://localhost:3004
echo Translation Service: http://localhost:3003
echo Frontend:            http://localhost:5173
echo.
echo Press any key to stop all services...
pause >nul

echo Stopping all services...
taskkill /FI "WINDOWTITLE eq Chat Service*" /T /F 2>nul
taskkill /FI "WINDOWTITLE eq STT Service*" /T /F 2>nul
taskkill /FI "WINDOWTITLE eq Translation Service*" /T /F 2>nul
taskkill /FI "WINDOWTITLE eq Frontend*" /T /F 2>nul

echo All services stopped.
