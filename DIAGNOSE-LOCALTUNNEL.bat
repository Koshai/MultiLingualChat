@echo off
title LocalTunnel Diagnostics
color 0E

echo ================================================
echo   LOCALTUNNEL TIMEOUT DIAGNOSTICS
echo ================================================
echo.

echo [Test 1] Is frontend running on localhost:5173?
echo.
curl -s http://localhost:5173 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ YES - Frontend is responding on localhost
) else (
    echo ❌ NO - Frontend is NOT responding!
    echo.
    echo SOLUTION: Start frontend first:
    echo   cd frontend
    echo   npm run dev
    echo.
    pause
    exit /b 1
)

echo.
echo [Test 2] Can we access localhost:5173 in browser?
echo.
echo Opening http://localhost:5173 in browser...
start http://localhost:5173
echo.
echo Did the app load in your browser?
echo.
choice /C YN /M "Did localhost:5173 work in browser?"
if errorlevel 2 (
    echo.
    echo ❌ Frontend has issues even on localhost!
    echo Check the Frontend terminal window for errors.
    pause
    exit /b 1
)

echo.
echo ✅ Localhost works! Issue is with LocalTunnel.
echo.

echo [Test 3] Is LocalTunnel running?
echo.
netstat -ano | findstr :5173 | findstr LISTENING >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Port 5173 is listening
) else (
    echo ⚠️ Port 5173 might not be listening properly
)

echo.
echo [Test 4] Checking LocalTunnel process...
echo.
tasklist | findstr /i "node.exe" | findstr /i "LocalTunnel" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ LocalTunnel process found
) else (
    echo ⚠️ LocalTunnel process not found
    echo.
    echo SOLUTION: Make sure you ran: lt --port 5173
)

echo.
echo ================================================
echo   WHAT TO CHECK
echo ================================================
echo.
echo 1. Look at the LocalTunnel terminal window
echo    - Does it show: "your url is: https://xxx.loca.lt"?
echo    - Or does it show an error?
echo.
echo 2. Copy the EXACT URL from LocalTunnel terminal
echo    - Make sure you copied it correctly
echo    - Include the full https:// part
echo.
echo 3. Check if LocalTunnel is actually connected
echo    - The terminal should NOT show errors
echo    - It should be waiting (not crashed)
echo.
echo ================================================
echo   COMMON ISSUES
echo ================================================
echo.
echo Issue A: "Connection timed out"
echo   Cause: LocalTunnel servers might be down/slow
echo   Fix: Try restarting LocalTunnel (Ctrl+C, then run again)
echo.
echo Issue B: "Invalid Host header"
echo   Cause: Vite rejecting the domain
echo   Fix: I'll add a bypass to vite.config.ts
echo.
echo Issue C: LocalTunnel not connecting
echo   Cause: Network/firewall blocking
echo   Fix: Check firewall, try different network
echo.
echo ================================================
echo.

echo Opening Windows Firewall settings...
echo Check if Node.js has network access allowed.
echo.
choice /C YN /M "Open Windows Firewall settings?"
if errorlevel 1 (
    start control firewall.cpl
)

echo.
echo ================================================
echo   NEXT STEPS
echo ================================================
echo.
echo If localhost:5173 works but LocalTunnel URL times out:
echo.
echo 1. Restart LocalTunnel:
echo    - Press Ctrl+C in the LocalTunnel window
echo    - Run: lt --port 5173
echo    - Try the new URL
echo.
echo 2. Try a different tunnel service:
echo    - Serveo: ssh -R 80:localhost:5173 serveo.net
echo    - Or use Cloudflare Tunnel
echo.
echo 3. Check your network:
echo    - Are you on a corporate network?
echo    - Is a firewall blocking outbound connections?
echo    - Try from a different network (home/mobile hotspot)
echo.
pause
