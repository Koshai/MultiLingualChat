@echo off
title Testing Dual Scheme Ngrok
color 0A
cls

echo ================================================
echo   TESTING NGROK WITH DUAL SCHEMES
echo   (Both HTTP and HTTPS)
echo ================================================
echo.
echo This addresses the ngrok v3 change where only
echo HTTPS is created by default.
echo.
echo We will now create BOTH HTTP and HTTPS URLs.
echo.
pause

echo.
echo [1] Stopping any existing services...
stop-all.bat >nul 2>&1
taskkill /F /IM ngrok.exe >nul 2>&1
echo    ✅ Stopped

echo.
echo [2] Starting frontend on port 8080...
start "Frontend (8080)" cmd /k "cd frontend && npm run dev"
echo    Started in new window
echo    Waiting 15 seconds for frontend to initialize...
ping 127.0.0.1 -n 16 > nul

echo.
echo [3] Testing if localhost:8080 is responding...
curl -s http://localhost:8080 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    ✅ Frontend is running
) else (
    echo    ❌ Frontend not responding yet, waiting 10 more seconds...
    ping 127.0.0.1 -n 11 > nul
    curl -s http://localhost:8080 >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo    ✅ Frontend is now running
    ) else (
        echo    ❌ Frontend failed to start!
        echo    Check the Frontend window for errors
        pause
        exit /b 1
    )
)

echo.
echo [4] Starting ngrok with DUAL schemes...
echo    Command: ngrok http --scheme http --scheme https 8080
echo.
start "Ngrok Dual Scheme" cmd /k "ngrok http --scheme http --scheme https 8080"
echo    Started in new window
echo    Waiting 5 seconds for ngrok to connect...
ping 127.0.0.1 -n 6 > nul

echo.
echo ================================================
echo   CHECK THE NGROK WINDOW
echo ================================================
echo.
echo You should see TWO forwarding URLs:
echo.
echo   Forwarding  http://xxx.ngrok-free.app -^> http://localhost:8080
echo   Forwarding  https://xxx.ngrok-free.app -^> http://localhost:8080
echo.
echo ================================================
echo   TESTING INSTRUCTIONS
echo ================================================
echo.
echo 1. Copy the HTTP URL (starts with http://)
echo 2. Open it in your browser
echo 3. Click "Visit Site" on ngrok interstitial page
echo 4. App should load WITHOUT SSL errors!
echo.
echo If HTTP works:
echo    ✅ Use HTTP URL for your demo
echo    Problem was ngrok v3 defaulting to HTTPS only
echo.
echo If HTTP also fails:
echo    Different issue - check firewall/antivirus
echo.
echo ================================================
echo.
echo Opening ngrok dashboard...
start http://127.0.0.1:4040
echo.
echo Watch for incoming requests when you access the URL!
echo.
echo ================================================
echo.
pause

echo.
echo Test complete! Keep services running or press Ctrl+C to exit.
