@echo off
echo ================================================
echo   NGROK CONNECTION DIAGNOSTIC
echo ================================================
echo.

echo [1] Testing DNS Resolution...
echo.
echo Testing if your computer can resolve ngrok domains...
nslookup jellylike-selene-nebuly.ngrok-free.dev
echo.
echo ------------------------------------------------
echo.
echo [2] Testing HTTP Connection to Ngrok...
echo.
echo Attempting to fetch the ngrok URL via command line...
curl -v https://jellylike-selene-nebuly.ngrok-free.dev 2>&1 | findstr /C:"HTTP" /C:"SSL" /C:"Connected" /C:"Server"
echo.
echo ------------------------------------------------
echo.
echo [3] Checking if localhost:5173 is running...
echo.
curl -s http://localhost:5173 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ localhost:5173 is responding
) else (
    echo ❌ localhost:5173 is NOT responding!
    echo    Make sure frontend is running: cd frontend ^&^& npm run dev
)
echo.
echo ------------------------------------------------
echo.
echo [4] Opening ngrok web dashboard...
echo.
start http://127.0.0.1:4040
echo ✅ Ngrok dashboard opened in browser
echo.
echo    Watch the "HTTP Requests" section
echo    When you try to access your ngrok URL in browser,
echo    you should see requests appear here!
echo.
echo ------------------------------------------------
echo.
echo [5] Testing with curl (bypassing browser)...
echo.
echo This will test if ngrok itself is working...
timeout /t 2 >nul
curl -v https://jellylike-selene-nebuly.ngrok-free.dev 2>&1 > ngrok-test.txt
echo.
echo Results saved to: ngrok-test.txt
echo.
echo ------------------------------------------------
echo.
echo NEXT STEPS:
echo.
echo 1. Check ngrok dashboard (http://127.0.0.1:4040)
echo 2. In a browser, visit: https://jellylike-selene-nebuly.ngrok-free.dev
echo 3. Watch if requests appear in the ngrok dashboard
echo.
echo If you see requests in dashboard but browser fails:
echo    - Browser security issue
echo    - Antivirus blocking
echo.
echo If you DON'T see requests in dashboard:
echo    - DNS issue
echo    - Firewall blocking ngrok
echo    - Network routing issue
echo.
pause
