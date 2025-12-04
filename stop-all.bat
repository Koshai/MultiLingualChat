@echo off
echo ========================================
echo   Stopping All Services
echo ========================================
echo.

REM Kill processes on specific ports
echo [1/5] Stopping Chat Service (port 3001)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    taskkill /F /PID %%a 2>nul
)

echo [2/5] Stopping Translation Service (port 3003)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3003') do (
    taskkill /F /PID %%a 2>nul
)

echo [3/5] Stopping STT Service (port 3004)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3004') do (
    taskkill /F /PID %%a 2>nul
)

echo [4/5] Stopping TTS Service (port 3005)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3005') do (
    taskkill /F /PID %%a 2>nul
)

echo [5/5] Stopping Frontend (port 5173)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
    taskkill /F /PID %%a 2>nul
)

echo [6/8] Stopping Ngrok tunnels...
taskkill /F /IM ngrok.exe 2>nul

echo [7/8] Stopping LocalTunnel...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq LocalTunnel*" 2>nul

echo [8/8] Stopping Cloudflare Tunnel...
taskkill /F /IM cloudflared.exe 2>nul

REM Also kill any node/python processes related to our services
echo.
echo Cleaning up any remaining service processes...
taskkill /F /IM "node.exe" /FI "WINDOWTITLE eq Chat Service*" 2>nul
taskkill /F /IM "python.exe" /FI "WINDOWTITLE eq Translation Service*" 2>nul
taskkill /F /IM "python.exe" /FI "WINDOWTITLE eq STT Service*" 2>nul
taskkill /F /IM "python.exe" /FI "WINDOWTITLE eq TTS Service*" 2>nul
taskkill /F /IM "node.exe" /FI "WINDOWTITLE eq Frontend*" 2>nul

echo.
echo ========================================
echo   All Services Stopped!
echo ========================================
echo.
ping 127.0.0.1 -n 2 > nul
