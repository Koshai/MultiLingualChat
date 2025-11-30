@echo off
title Multilingual Video Conferencing - Network Mode
color 0A
cls

echo.
echo  ================================================
echo      MULTILINGUAL VIDEO CONFERENCING
echo      NETWORK MODE - For Multi-Computer Demo
echo  ================================================
echo.

REM Get the local IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP:~1%

echo  Your computer's network IP address: %IP%
echo.
echo  IMPORTANT: This mode allows OTHER computers to connect!
echo.
echo  What will happen:
echo    1. Stop any running services
echo    2. Start 5 services on THIS computer
echo    3. Services will be accessible on network
echo    4. Other computers can connect using: http://%IP%:5173
echo.
echo  ================================================
echo.
echo  Press any key to continue, or Ctrl+C to cancel
pause >nul

REM First, stop any existing services
echo.
echo Stopping any existing services...
call stop-all.bat >nul 2>&1

echo.
echo  ================================================
echo      Starting Services (Network Mode)
echo  ================================================
echo.
echo  Starting all services...
echo.

REM Set environment variable for network mode
set NETWORK_MODE=true
set HOST_IP=%IP%

REM Start Translation Service
echo [1/5] Starting Translation Service...
start "Translation Service" cmd /k "cd backend\services\translation-service && set HOST=0.0.0.0 && python main.py"
ping 127.0.0.1 -n 3 > nul

REM Start STT Service
echo [2/5] Starting STT Service...
start "STT Service" cmd /k "cd backend\services\stt-service && set HOST=0.0.0.0 && python main.py"
ping 127.0.0.1 -n 3 > nul

REM Start TTS Service
echo [3/5] Starting TTS Service...
start "TTS Service" cmd /k "cd backend\services\tts-service && set TTS_SERVICE_HOST=0.0.0.0 && python main.py"
ping 127.0.0.1 -n 3 > nul

REM Start Chat Service (already uses 0.0.0.0 by default)
echo [4/5] Starting Chat Service...
start "Chat Service" cmd /k "cd backend\services\chat-service && npm run dev"
ping 127.0.0.1 -n 4 > nul

REM Start Frontend with network host
echo [5/5] Starting Frontend (Network Mode)...
start "Frontend" cmd /k "cd frontend && set VITE_HOST=0.0.0.0 && npm run dev -- --host"

echo.
echo  ================================================
echo      Services Starting (Network Mode)!
echo  ================================================
echo.
echo  Waiting for services to initialize...
ping 127.0.0.1 -n 21 > nul

echo.
echo  ================================================
echo      NETWORK ACCESS INFORMATION
echo  ================================================
echo.
echo  THIS COMPUTER (Host):
echo    Frontend:    http://%IP%:5173
echo    Chat API:    http://%IP%:3001
echo.
echo  OTHER COMPUTERS (Clients):
echo    Open browser to: http://%IP%:5173
echo    They can join meetings hosted on this server!
echo.
echo  ================================================
echo      FIREWALL NOTICE
echo  ================================================
echo.
echo  If other computers can't connect, check:
echo    1. Windows Firewall allows Node.js and Python
echo    2. Ports 3001, 3003, 3004, 3005, 5173 are open
echo    3. Both computers are on the same network
echo.
echo  ================================================
echo.
echo  Opening browser on this computer...
start http://%IP%:5173

echo.
echo  Press any key to see connection instructions again...
pause >nul

cls
echo.
echo  ================================================
echo      HOW TO CONNECT FROM OTHER COMPUTERS
echo  ================================================
echo.
echo  1. Make sure both computers are on the same Wi-Fi/network
echo.
echo  2. On the OTHER computer, open a web browser
echo.
echo  3. Go to this address:
echo.
echo     http://%IP%:5173
echo.
echo  4. Create an account or login
echo.
echo  5. Join the same meeting!
echo.
echo  ================================================
echo      TROUBLESHOOTING
echo  ================================================
echo.
echo  Can't connect from other computer?
echo.
echo  1. Check firewall settings on THIS computer
echo  2. Make sure both computers are on same network
echo  3. Try ping %IP% from other computer
echo  4. Check Windows Defender Firewall
echo.
echo  To stop all services: run stop-all.bat
echo.
echo  ================================================
echo.
pause
