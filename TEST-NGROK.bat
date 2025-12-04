@echo off
title Ngrok Diagnostic Test
color 0E
cls

echo.
echo  ================================================
echo      NGROK DIAGNOSTIC TEST
echo  ================================================
echo.
echo  This script will help diagnose ngrok SSL issues
echo.

REM Test 1: Check if ngrok is installed
echo [Test 1] Checking if ngrok is installed...
where ngrok >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo  ✅ Ngrok is installed
    ngrok --version
) else (
    echo  ❌ Ngrok is NOT installed!
    echo.
    echo  Please install ngrok:
    echo    choco install ngrok
    echo.
    pause
    exit /b 1
)

echo.
echo [Test 2] Checking ngrok configuration...
REM Check both v2 and v3 config locations
if exist "%USERPROFILE%\AppData\Local\ngrok\ngrok.yml" (
    echo  ✅ Ngrok config file exists (v3)
    echo  Location: %USERPROFILE%\AppData\Local\ngrok\ngrok.yml
) else if exist "%USERPROFILE%\.ngrok2\ngrok.yml" (
    echo  ✅ Ngrok config file exists (v2)
    echo  Location: %USERPROFILE%\.ngrok2\ngrok.yml
) else (
    echo  ⚠️  Ngrok config file not found in standard locations
    echo  Checking with ngrok command...
    ngrok config check >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo  ✅ Ngrok config is valid (checked via command)
    ) else (
        echo  ❌ Ngrok config issue detected!
        echo  You need to configure your authtoken:
        echo    ngrok config add-authtoken YOUR_TOKEN
        echo.
        pause
        exit /b 1
    )
)

echo.
echo [Test 3] Checking if port 5173 is available...
netstat -ano | findstr :5173 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo  ⚠️  Port 5173 is already in use
    echo  This is OK if frontend is already running
) else (
    echo  ✅ Port 5173 is available
)

echo.
echo [Test 4] Checking if ngrok is already running...
tasklist | findstr /i "ngrok.exe" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo  ⚠️  Ngrok is already running!
    echo  Kill it first: taskkill /F /IM ngrok.exe
    echo.
    choice /C YN /M "Do you want to kill existing ngrok processes?"
    if errorlevel 2 goto skip_kill
    taskkill /F /IM ngrok.exe
    echo  ✅ Killed existing ngrok processes
    :skip_kill
) else (
    echo  ✅ No existing ngrok processes
)

echo.
echo  ================================================
echo      DIAGNOSTIC COMPLETE
echo  ================================================
echo.
echo  Next steps:
echo.
echo  1. Make sure frontend is running on port 5173
echo     - Run: cd frontend ^&^& npm run dev
echo.
echo  2. In a separate terminal, start ngrok:
echo     - Run: ngrok http 5173
echo.
echo  3. Copy the HTTPS URL from ngrok output
echo     - Example: https://abc123.ngrok-free.app
echo.
echo  4. Test the URL in your browser
echo     - It should load WITHOUT SSL errors
echo.
echo  5. Check ngrok dashboard for requests:
echo     - Open: http://127.0.0.1:4040
echo.
echo  ================================================
echo      TROUBLESHOOTING TIPS
echo  ================================================
echo.
echo  If you still get SSL errors:
echo.
echo  A. SSL_ERROR_RX_RECORD_TOO_LONG (Firefox)
echo     - This means you're accessing HTTP with HTTPS
echo     - Make sure you're using the ngrok URL, not localhost
echo     - Make sure ngrok is actually running!
echo.
echo  B. ERR_SSL_PROTOCOL_ERROR (Chrome/Edge)
echo     - Same as above
echo     - Or your authtoken is missing
echo     - Or ngrok tunnel failed to start
echo.
echo  C. Connection refused
echo     - Frontend is not running on port 5173
echo     - Run: cd frontend ^&^& npm run dev
echo.
echo  D. 502 Bad Gateway
echo     - Ngrok can reach frontend, but frontend crashed
echo     - Check the frontend console window for errors
echo.
echo  ================================================
echo.

pause
