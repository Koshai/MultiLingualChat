@echo off
title Getting Non-.dev Domain from Ngrok
color 0E

echo ================================================
echo   GETTING A GOOD NGROK DOMAIN
echo   (Avoiding .dev domains that force HTTPS)
echo ================================================
echo.
echo The .dev domain is forcing HTTPS in your browser.
echo We need to get a .app or .io domain instead.
echo.
echo This script will restart ngrok until we get a good domain.
echo.
pause

:retry
echo.
echo Killing existing ngrok...
taskkill /F /IM ngrok.exe >nul 2>&1
timeout /t 2 >nul

echo Starting ngrok...
start "Ngrok Test" cmd /c "ngrok http --scheme http --scheme https 8080 > ngrok-output.txt 2>&1"

echo Waiting for ngrok to connect (7 seconds)...
timeout /t 7 >nul

echo.
echo Checking what domain we got...

REM Try to get the forwarding URL from ngrok API
curl -s http://127.0.0.1:4040/api/tunnels > tunnels.json 2>nul

REM Check if we got a .dev domain
findstr /C:".ngrok-free.dev" tunnels.json >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ❌ Got a .dev domain - this forces HTTPS!
    echo    Trying again...
    goto retry
)

REM Check if we got a .app domain
findstr /C:".ngrok-free.app" tunnels.json >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ SUCCESS! Got a .app domain!
    goto success
)

REM Check if we got a .io domain
findstr /C:".ngrok.io" tunnels.json >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ SUCCESS! Got a .io domain!
    goto success
)

echo ⚠️  Unknown domain type, trying again...
goto retry

:success
echo.
echo ================================================
echo   GOT A GOOD DOMAIN!
echo ================================================
echo.
echo Opening ngrok in a new window...
taskkill /F /IM ngrok.exe >nul 2>&1
timeout /t 2 >nul
start "Ngrok (Good Domain)" cmd /k "ngrok http --scheme http --scheme https 8080"

timeout /t 5 >nul

echo.
echo Opening ngrok dashboard...
start http://127.0.0.1:4040

echo.
echo ================================================
echo   CHECK THE NGROK WINDOW
echo ================================================
echo.
echo Look for the HTTP forwarding URL.
echo It should end in .app or .io (NOT .dev)
echo.
echo Example of GOOD domains:
echo   http://abc123.ngrok-free.app
echo   http://xyz789.ngrok.io
echo.
echo Example of BAD domain:
echo   http://abc123.ngrok-free.dev  ← Forces HTTPS!
echo.
echo ================================================
echo.
echo Copy the HTTP URL and try it in your browser.
echo This time it should NOT redirect to HTTPS!
echo.

REM Cleanup
del tunnels.json 2>nul
del ngrok-output.txt 2>nul

pause
