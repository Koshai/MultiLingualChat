@echo off
title Multilingual Video Conferencing - LocalTunnel Mode
color 0A
cls

echo.
echo  ================================================
echo      MULTILINGUAL VIDEO CONFERENCING
echo      LOCALTUNNEL MODE - Ngrok Alternative
echo  ================================================
echo.
echo  LocalTunnel is a free ngrok alternative that
echo  creates public URLs without SSL issues!
echo.
echo  What will happen:
echo    1. Stop any running services
echo    2. Check/install localtunnel
echo    3. Start all 5 services locally
echo    4. Create LocalTunnel public URL
echo    5. Show public URL for client
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
echo      Checking LocalTunnel Installation
echo  ================================================
echo.

REM Check if localtunnel is installed
where lt >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo  ⚠️  LocalTunnel not found. Installing...
    echo.
    echo  Running: npm install -g localtunnel
    echo  This may take 30-60 seconds...
    echo.
    npm install -g localtunnel

    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo  ❌ ERROR: Failed to install localtunnel!
        echo.
        echo  Please install manually:
        echo    npm install -g localtunnel
        echo.
        pause
        exit /b 1
    )
    echo.
    echo  ✅ LocalTunnel installed successfully!
) else (
    echo  ✅ LocalTunnel is already installed
)

echo.
echo  ================================================
echo      Starting Services (Local Mode)
echo  ================================================
echo.

REM Start all services using start-all.bat
echo Starting all 5 services...
call start-all.bat

echo.
echo  Waiting for services to initialize (20 seconds)...
ping 127.0.0.1 -n 21 > nul

REM Verify frontend is running
echo.
echo  Checking if frontend is ready...
timeout /t 3 /nobreak >nul

curl -s http://localhost:5173 >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo  ⚠️  Frontend may not be ready yet, waiting longer...
    timeout /t 10 /nobreak >nul
    curl -s http://localhost:5173 >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo  ❌ ERROR: Frontend is not responding!
        echo  Check the Frontend window for errors.
        pause
        exit /b 1
    )
)

echo  ✅ Frontend is running on http://localhost:5173

echo.
echo  ================================================
echo      Starting LocalTunnel
echo  ================================================
echo.
echo  Creating public tunnel to http://localhost:5173
echo.
echo  Starting LocalTunnel...
echo.

REM Start localtunnel in a new window
start "LocalTunnel" cmd /k "lt --port 5173"

echo.
echo  ================================================
echo      IMPORTANT: GET YOUR PUBLIC URL
echo  ================================================
echo.
echo  LocalTunnel is starting in a new window...
echo.
echo  Look for a line like this:
echo    your url is: https://your-subdomain.loca.lt
echo.
echo  Copy that URL and send it to your client!
echo.
echo  ⚠️  IMPORTANT: First-time visitors will see a warning page
echo      They need to click "Click to Continue" to proceed
echo      This is normal for LocalTunnel's free tier
echo.
echo  ================================================
echo      CLIENT CONNECTION INSTRUCTIONS
echo  ================================================
echo.
echo  Send this to your client:
echo.
echo  "Join the demo at: https://YOUR-URL.loca.lt"
echo  "Click 'Click to Continue' on the warning page"
echo  "Then create an account and join the meeting!"
echo.
echo  ================================================
echo      DEMO CHECKLIST
echo  ================================================
echo.
echo  On YOUR computer:
echo    1. Open http://localhost:5173 (or LocalTunnel URL)
echo    2. Login as 'presenter'
echo    3. Create meeting: "Client Demo"
echo    4. Enable transcription (📝 button)
echo.
echo  On CLIENT's computer:
echo    1. Open the LocalTunnel URL you sent them
echo    2. Click "Click to Continue"
echo    3. Create account (different username)
echo    4. Join "Client Demo" meeting
echo    5. Click audio settings (🔊)
echo    6. Select "Translated" mode
echo.
echo  Now speak in your language - client hears translation!
echo.
echo  ================================================
echo.

REM Wait a bit for localtunnel to fully start
timeout /t 5 /nobreak >nul

echo.
echo  ✅ All services running!
echo  ✅ LocalTunnel active!
echo.
echo  To stop everything: run stop-all.bat
echo  (This will also close LocalTunnel)
echo.
pause
