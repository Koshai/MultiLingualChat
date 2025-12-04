@echo off
title Finding the SSL Problem
color 0C
cls

echo ================================================
echo   SSL ERROR DIAGNOSTIC - FINDING THE PROBLEM
echo ================================================
echo.
echo This will identify exactly what's blocking ngrok.
echo.
pause

REM Test 1: Check hosts file
echo.
echo [TEST 1] Checking Windows hosts file...
echo Looking for localhost redirects that might interfere...
findstr /i "ngrok" C:\Windows\System32\drivers\etc\hosts >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ❌ WARNING: Found ngrok entry in hosts file!
    echo This might be redirecting ngrok domains to localhost!
    echo.
    echo Showing the entry:
    findstr /i "ngrok" C:\Windows\System32\drivers\etc\hosts
    echo.
    echo You may need to remove this entry from:
    echo C:\Windows\System32\drivers\etc\hosts
    echo.
) else (
    echo ✅ No ngrok entries in hosts file (good)
)

echo.
pause

REM Test 2: DNS Resolution
echo.
echo [TEST 2] Testing DNS resolution...
echo Checking if ngrok domain resolves to correct IPs...
echo.
nslookup jellylike-selene-nebuly.ngrok-free.dev
echo.
echo Expected: Should show ngrok server IPs (not 127.0.0.1)
echo If you see 127.0.0.1, something is redirecting it!
echo.
pause

REM Test 3: Ping test
echo.
echo [TEST 3] Testing if you can reach ngrok servers...
echo.
ping -n 2 jellylike-selene-nebuly.ngrok-free.dev
echo.
echo Expected: Should get replies from ngrok servers
echo If "Request timed out" - firewall might be blocking
echo.
pause

REM Test 4: Check what's listening on port 8080
echo.
echo [TEST 4] Checking what's on port 8080...
echo.
netstat -ano | findstr :8080
echo.
echo Expected: Should see node.exe or similar
echo If empty: Frontend isn't running!
echo.
pause

REM Test 5: Test localhost directly
echo.
echo [TEST 5] Testing if http://localhost:8080 works...
echo.
curl -s http://localhost:8080 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ localhost:8080 is responding (frontend is running)
) else (
    echo ❌ localhost:8080 is NOT responding!
    echo    Frontend is not running on port 8080!
    echo    Start it with: cd frontend ^&^& npm run dev
)

echo.
pause

REM Test 6: Test with curl through ngrok
echo.
echo [TEST 6] Testing ngrok URL with curl (bypass browser)...
echo This will show if the SSL issue is browser-specific...
echo.
curl -v https://jellylike-selene-nebuly.ngrok-free.dev 2>&1 | findstr /C:"SSL" /C:"Connected" /C:"HTTP"
echo.
echo Expected: Should connect successfully
echo If SSL error here too: Problem is not browser-specific
echo.
pause

REM Test 7: Check for antivirus/firewall
echo.
echo [TEST 7] Common blocking software...
echo.
echo Checking for common security software that might block ngrok:
echo.

tasklist | findstr /i "avast kaspersky norton mcafee avg" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ⚠️  Security software detected:
    tasklist | findstr /i "avast kaspersky norton mcafee avg"
    echo.
    echo This might be blocking ngrok. Try temporarily disabling it.
) else (
    echo ✅ No common AV detected (but Windows Defender might still block)
)

echo.
pause

REM Test 8: Check browser proxy settings
echo.
echo [TEST 8] Checking system proxy settings...
echo.
reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings" /v ProxyEnable
echo.
echo Expected: ProxyEnable = 0x0 (no proxy)
echo If ProxyEnable = 0x1: Proxy might be interfering
echo.
pause

echo.
echo ================================================
echo   DIAGNOSTIC COMPLETE
echo ================================================
echo.
echo Based on the results above, the issue is likely:
echo.
echo 1. If DNS shows 127.0.0.1:
echo    - Hosts file or DNS is redirecting ngrok to localhost
echo    - Fix: Remove ngrok entry from hosts file
echo.
echo 2. If localhost:8080 doesn't respond:
echo    - Frontend isn't running
echo    - Fix: cd frontend ^&^& npm run dev
echo.
echo 3. If ping fails or times out:
echo    - Firewall blocking ngrok
echo    - Fix: Temporarily disable firewall/antivirus
echo.
echo 4. If curl also gets SSL error:
echo    - Not browser-specific, network/system issue
echo    - Fix: Check antivirus, firewall, corporate network
echo.
echo 5. If curl works but browser doesn't:
echo    - Browser-specific issue
echo    - Fix: Try different browser, incognito mode
echo.
echo ================================================
echo.
echo NEXT STEP: Tell me which test failed!
echo.
pause
