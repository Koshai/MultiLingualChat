@echo off
title Simple Ngrok Test
color 0E

echo ================================================
echo   SIMPLE NGROK TEST
echo ================================================
echo.
echo This will test if ngrok works at all, with a simple page.
echo.

REM Create a simple test HTML file
echo ^<!DOCTYPE html^> > test.html
echo ^<html^> >> test.html
echo ^<head^>^<title^>Ngrok Test^</title^>^</head^> >> test.html
echo ^<body^> >> test.html
echo   ^<h1 style="color: green;"^>SUCCESS! Ngrok is working!^</h1^> >> test.html
echo   ^<p^>If you see this, ngrok successfully forwarded your request.^</p^> >> test.html
echo   ^<p^>Time: %date% %time%^</p^> >> test.html
echo ^</body^> >> test.html
echo ^</html^> >> test.html

echo ✅ Created test.html
echo.

REM Start a simple HTTP server
echo Starting simple HTTP server on port 9999...
start "Simple Server" cmd /k "python -m http.server 9999 || python3 -m http.server 9999 || npx http-server -p 9999"

echo Waiting for server to start...
timeout /t 5 >nul

echo.
echo Testing localhost first...
curl -s http://localhost:9999/test.html >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Server is running on localhost:9999
) else (
    echo ❌ Server failed to start!
    echo Install Python or run: npm install -g http-server
    pause
    exit /b 1
)

echo.
echo Now starting ngrok...
start "Ngrok Simple Test" cmd /k "ngrok http 9999"

echo.
echo ================================================
echo   INSTRUCTIONS
echo ================================================
echo.
echo 1. Look at the "Ngrok Simple Test" window
echo 2. Find the URL (https://xxx.ngrok-free.app)
echo 3. Open it in your browser
echo 4. You should see a green "SUCCESS" message
echo.
echo If you see SUCCESS:
echo    - Ngrok works fine!
echo    - The issue is with your Vite app, not ngrok
echo.
echo If you get SSL error:
echo    - Ngrok itself has issues on your network
echo    - Could be firewall, antivirus, or network blocking
echo.
echo ================================================
echo.
pause

echo.
echo Cleaning up...
taskkill /F /IM ngrok.exe >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
del test.html

echo Done!
