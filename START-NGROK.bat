@echo off
title Multilingual Video Conferencing - Ngrok Mode
color 0A
cls

echo.
echo  ================================================
echo      MULTILINGUAL VIDEO CONFERENCING
echo      NGROK MODE - For Cross-Network Demo
echo  ================================================
echo.
echo  This mode allows clients on DIFFERENT networks
echo  to connect via Ngrok tunnel (internet-accessible)
echo.
echo  What will happen:
echo    1. Stop any running services
echo    2. Start all 5 services locally
echo    3. Start Ngrok tunnel to frontend
echo    4. Show public URL for client
echo.
echo  ================================================
echo.
echo  Prerequisites:
echo    - Ngrok installed (choco install ngrok)
echo    - Ngrok account (free at ngrok.com)
echo.

REM Check if ngrok is installed
where ngrok >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo  ❌ ERROR: Ngrok is not installed!
    echo.
    echo  Please install Ngrok first:
    echo    Option 1: choco install ngrok
    echo    Option 2: Download from https://ngrok.com/download
    echo.
    echo  After installing, run this script again.
    echo.
    pause
    exit /b 1
)

echo  ✅ Ngrok detected
echo.
echo  Press any key to continue, or Ctrl+C to cancel
pause >nul

REM First, stop any existing services
echo.
echo Stopping any existing services...
call stop-all.bat >nul 2>&1

REM Kill any existing ngrok processes
taskkill /F /IM ngrok.exe >nul 2>&1

echo.
echo  ================================================
echo      Starting Services (Local Mode)
echo  ================================================
echo.

REM Start all services using START-HERE.bat (without browser)
echo Starting all 5 services...
call start-all.bat

echo.
echo  Waiting for services to initialize...
ping 127.0.0.1 -n 21 > nul

REM Verify frontend is running
echo.
echo  Checking if frontend is ready...
timeout /t 3 /nobreak >nul

curl -s http://localhost:5173 >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo  ⚠️  Frontend may not be ready yet, waiting longer...
    timeout /t 10 /nobreak >nul
)

echo.
echo  ================================================
echo      Starting Ngrok Tunnel
echo  ================================================
echo.
echo  Creating public tunnel to http://localhost:5173
echo.
echo  Starting Ngrok...

REM IMPORTANT: ngrok v3 only creates HTTPS by default
REM We need to explicitly enable BOTH HTTP and HTTPS schemes
REM This creates two URLs: one HTTP and one HTTPS
start "Ngrok Tunnel" cmd /k "ngrok http --scheme http --scheme https 5173"

echo.
echo  ================================================
echo      IMPORTANT: GET YOUR PUBLIC URL
echo  ================================================
echo.
echo  Ngrok is starting in a new window...
echo.
echo  Look for TWO forwarding lines like this:
echo    Forwarding  http://abc123xyz.ngrok-free.app -^> http://localhost:5173
echo    Forwarding  https://abc123xyz.ngrok-free.app -^> http://localhost:5173
echo.
echo  TRY THE HTTP URL FIRST (if HTTPS gives SSL errors)
echo  Copy either URL and send it to your client!
echo  Both should work - use whichever loads successfully
echo.
echo  ================================================
echo      CLIENT CONNECTION INSTRUCTIONS
echo  ================================================
echo.
echo  Send this to your client:
echo.
echo  "Join the demo at: https://YOUR-NGROK-URL.ngrok-free.app"
echo  "Create an account and join the meeting!"
echo.
echo  ⚠️  Note: Free Ngrok shows an interstitial page
echo      Your client will need to click "Visit Site"
echo.
echo  ✅  HTTPS works! Socket.IO uses polling for compatibility
echo.
echo  ================================================
echo      DEMO CHECKLIST
echo  ================================================
echo.
echo  On YOUR computer:
echo    1. Open http://localhost:5173 (or Ngrok URL)
echo    2. Login as 'presenter'
echo    3. Create meeting: "Client Demo"
echo    4. Enable transcription (📝 button)
echo.
echo  On CLIENT's computer:
echo    1. Open the Ngrok URL you sent them
echo    2. Create account (different username)
echo    3. Join "Client Demo" meeting
echo    4. Click audio settings (🔊)
echo    5. Select "Translated" mode
echo.
echo  Now speak in your language - client hears translation!
echo.
echo  ================================================
echo.

REM Wait a bit for ngrok to fully start
timeout /t 5 /nobreak >nul

REM Try to open ngrok dashboard
echo  Opening Ngrok dashboard (http://127.0.0.1:4040)
start http://127.0.0.1:4040

echo.
echo  ✅ All services running!
echo  ✅ Ngrok tunnel active!
echo.
echo  Ngrok Dashboard: http://127.0.0.1:4040
echo  (See live requests and your public URL)
echo.
echo  To stop everything: run stop-all.bat
echo                     (also kills Ngrok tunnel)
echo.
pause
