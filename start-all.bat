@echo off
echo ========================================
echo   Multilingual Video Conferencing
echo   Starting All Services...
echo ========================================
echo.

REM First, stop any existing services
echo Checking for existing services...
call stop-all.bat

echo.
echo ========================================
echo   Starting Services
echo ========================================
echo.
echo This will open 5 new windows for each service.
echo Please wait for all services to start...
echo.

REM Start Translation Service
echo [1/5] Starting Translation Service (port 3003)...
start "Translation Service" cmd /k "cd backend\services\translation-service && echo Starting Translation Service... && python main.py"
ping 127.0.0.1 -n 3 > nul

REM Start STT Service
echo [2/5] Starting STT Service (port 3004)...
start "STT Service" cmd /k "cd backend\services\stt-service && echo Starting STT Service... && python main.py"
ping 127.0.0.1 -n 3 > nul

REM Start TTS Service
echo [3/5] Starting TTS Service (port 3005)...
start "TTS Service" cmd /k "cd backend\services\tts-service && echo Starting TTS Service... && python main.py"
ping 127.0.0.1 -n 3 > nul

REM Start Chat Service
echo [4/5] Starting Chat Service (port 3001)...
start "Chat Service" cmd /k "cd backend\services\chat-service && echo Starting Chat Service... && npm run dev"
ping 127.0.0.1 -n 4 > nul

REM Start Frontend
echo [5/5] Starting Frontend (port 5173)...
start "Frontend" cmd /k "cd frontend && echo Starting Frontend... && npm run dev"

echo.
echo ========================================
echo   All Services Starting!
echo ========================================
echo.
echo Please wait 10-15 seconds for all services to fully start.
echo.
echo Services:
echo   - Translation Service: http://localhost:3003
echo   - STT Service:         http://localhost:3004
echo   - TTS Service:         http://localhost:3005
echo   - Chat Service:        http://localhost:3001
echo   - Frontend:            http://localhost:5173
echo.
echo Once all services show "running" or "ready", open your browser:
echo   http://localhost:5173
echo.
echo To stop all services, run: stop-all.bat
echo.
ping 127.0.0.1 -n 4 > nul
