@echo off
title Testing Port 8080 Setup
color 0B
cls

echo.
echo  ================================================
echo      PORT 8080 SETUP - QUICK TEST
echo  ================================================
echo.
echo  This will test the port change from 5173 to 8080
echo.

echo [Step 1] Killing any services on old port 5173...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do taskkill /F /PID %%a >nul 2>&1
echo  ✅ Old port cleared

echo.
echo [Step 2] Killing any services on new port 8080...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080') do taskkill /F /PID %%a >nul 2>&1
echo  ✅ New port cleared

echo.
echo [Step 3] Killing any existing ngrok processes...
taskkill /F /IM ngrok.exe >nul 2>&1
echo  ✅ Ngrok cleared

echo.
echo  ================================================
echo      READY TO START WITH PORT 8080
echo  ================================================
echo.
echo  Now follow these steps:
echo.
echo  1. Start frontend on port 8080:
echo     - Open a new terminal
echo     - Run: cd frontend
echo     - Run: npm run dev
echo     - Wait for: "Local: http://localhost:8080/"
echo.
echo  2. Start ngrok on port 8080:
echo     - Open another new terminal
echo     - Run: ngrok http 8080
echo     - Copy the HTTPS URL
echo.
echo  3. Test in browser:
echo     - Visit the ngrok HTTPS URL
echo     - Should work without SSL errors!
echo.
echo  ================================================
echo.
echo  Press any key to automatically start everything...
pause >nul

echo.
echo  Starting frontend...
start "Frontend (Port 8080)" cmd /k "cd frontend && npm run dev"

echo  Waiting for frontend to start (15 seconds)...
ping 127.0.0.1 -n 16 > nul

echo.
echo  Starting ngrok...
start "Ngrok (Port 8080)" cmd /k "ngrok http 8080"

echo  Waiting for ngrok to start (5 seconds)...
ping 127.0.0.1 -n 6 > nul

echo.
echo  ✅ Both services should be starting!
echo.
echo  Next steps:
echo  1. Check the "Ngrok (Port 8080)" window
echo  2. Copy the HTTPS URL (e.g., https://xxx.ngrok-free.app)
echo  3. Open it in your browser
echo.
echo  Opening ngrok dashboard...
start http://127.0.0.1:4040
echo.
echo  Watch the dashboard for incoming requests!
echo.
pause
