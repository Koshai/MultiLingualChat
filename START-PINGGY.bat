@echo off
echo ================================================
echo   Starting MultiLingual Chat with Pinggy Tunnel
echo ================================================
echo.

REM Check if Pinggy is available via SSH
where ssh >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: SSH not found!
    echo.
    echo Please install OpenSSH:
    echo 1. Go to Settings ^> Apps ^> Optional Features
    echo 2. Click "Add a feature"
    echo 3. Find and install "OpenSSH Client"
    echo.
    echo Or use Git Bash which includes SSH
    pause
    exit /b 1
)

echo [Step 1/6] Starting Translation Service (port 3003)...
start "Translation Service" cmd /k "cd backend\services\translation-service && python main.py"
timeout /t 3 /nobreak >nul

echo [Step 2/6] Starting STT Service (port 3004)...
start "STT Service" cmd /k "cd backend\services\stt-service && python main.py"
timeout /t 3 /nobreak >nul

echo [Step 3/6] Starting TTS Service (port 3005)...
start "TTS Service" cmd /k "cd backend\services\tts-service && python main.py"
timeout /t 3 /nobreak >nul

echo [Step 4/6] Starting Chat Service (port 3001)...
start "Chat Service" cmd /k "cd backend\services\chat-service && npm run dev"
timeout /t 5 /nobreak >nul

echo [Step 5/6] Starting Frontend (port 5173)...
start "Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo [Step 6/6] Starting Pinggy Tunnel...
echo.
echo ================================================
echo   IMPORTANT: Pinggy Setup
echo ================================================
echo.
echo Pinggy will create a tunnel to your frontend (port 5173)
echo.
echo You will see output like:
echo   http://randomname.a.pinggy.online
echo   https://randomname.a.pinggy.online
echo.
echo SHARE THE HTTP URL with your client!
echo Example: http://abc123.a.pinggy.online
echo.
echo The tunnel will stay open in this window.
echo Press Ctrl+C here to stop the tunnel.
echo.
echo Starting Pinggy tunnel now...
echo ================================================
echo.

REM Start Pinggy tunnel for port 5173
REM -p 443: Use port 443 (HTTPS port for SSH)
REM -R0:localhost:5173: Reverse tunnel from random port to localhost:5173
REM a.pinggy.io: Pinggy server
ssh -p 443 -R0:localhost:5173 a.pinggy.io

pause
