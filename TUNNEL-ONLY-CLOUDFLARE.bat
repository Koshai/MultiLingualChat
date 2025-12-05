@echo off
echo ================================================
echo   Starting Cloudflare Tunnel
echo ================================================
echo.

REM Check if cloudflared is installed
where cloudflared >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Cloudflare Tunnel is not installed!
    echo.
    echo Please run SETUP-CLOUDFLARE-TUNNEL.bat first.
    echo.
    pause
    exit /b 1
)

echo Checking if frontend is running on port 5173...
netstat -ano | findstr ":5173" | findstr "LISTENING" >nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Frontend is not running!
    echo.
    echo Please run START-HERE.bat first to start all services.
    echo.
    pause
    exit /b 1
)

echo ✓ Frontend is running!
echo.
echo Starting Cloudflare Tunnel...
echo.
echo ================================================
echo   Your public URL will appear below:
echo   Look for: "https://xxxxx.trycloudflare.com"
echo ================================================
echo.

REM Start Cloudflare Tunnel (quick tunnel mode - no account needed)
cloudflared tunnel --url http://localhost:5173

pause
