@echo off
echo ================================================
echo   Starting MultiLingual Chat with Bore Tunnel
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
timeout /t 5 /nobreak >nul

echo.
echo [Step 6/6] Installing and Starting Bore Tunnel...
echo.

REM Check if bore is installed
where bore >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Bore not found! Installing via cargo...
    echo.
    echo Please wait, this will take 2-3 minutes...
    cargo install bore-cli
    echo.
    echo Bore installed successfully!
    echo.
)

echo ================================================
echo   IMPORTANT: Bore Tunnel Info
echo ================================================
echo.
echo Bore will create a tunnel to your frontend (port 5173)
echo.
echo You will see output like:
echo   listening at bore.pub:xxxxx
echo.
echo Your public URL will be: http://bore.pub:xxxxx
echo.
echo SHARE THIS URL with your client!
echo.
echo The tunnel will stay open in this window.
echo Press Ctrl+C here to stop the tunnel.
echo.
echo Starting Bore tunnel now...
echo ================================================
echo.

REM Start Bore tunnel
bore local 5173 --to bore.pub

pause
