@echo off
echo ================================================
echo   Starting MultiLingual Chat with LocalTunnel
echo ================================================
echo.

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

echo.
echo Waiting for services to start (15 seconds)...
timeout /t 15 /nobreak >nul

echo.
echo [Step 6/6] Installing and Starting LocalTunnel...
echo.

echo Checking if localtunnel is installed...
call npm list -g localtunnel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo LocalTunnel not found! Installing...
    call npm install -g localtunnel
    echo LocalTunnel installed successfully!
    echo.
)

echo ================================================
echo   IMPORTANT: LocalTunnel Info
echo ================================================
echo.
echo LocalTunnel will create a tunnel to your frontend (port 5173)
echo.
echo You will see output like:
echo   your url is: https://random-name.loca.lt
echo.
echo SHARE THIS URL with your client!
echo.
echo NOTE: First time visitors will see a warning page.
echo Click "Continue" to proceed - this is normal for LocalTunnel.
echo.
echo The tunnel will stay open in this window.
echo Press Ctrl+C here to stop the tunnel.
echo.
echo Starting LocalTunnel now...
echo ================================================
echo.

REM Start LocalTunnel
npx localtunnel --port 5173

pause
